import { useEffect, useState } from "react";
import { get, post } from "../api/client";
import Modal from "./Modal";

function NewJobModal({ isOpen, onClose, onCreated, jobTypes, employees }) {
  const [license, setLicense] = useState("");
  const [vehicleMatch, setVehicleMatch] = useState(null);
  const [lookupDone, setLookupDone] = useState(false);

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [make, setMake] = useState("");
  const [makeIsNew, setMakeIsNew] = useState(false);
  const [model, setModel] = useState("");
  const [modelIsNew, setModelIsNew] = useState(false);
  const [year, setYear] = useState("");

  const [custQuery, setCustQuery] = useState("");
  const [custResults, setCustResults] = useState([]);
  const [custNo, setCustNo] = useState("");
  const [custIsNew, setCustIsNew] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");

  const [empNo, setEmpNo] = useState("");
  const [jobNo, setJobNo] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      get("/vehicles/makes").then(setMakes).catch(() => setMakes([]));
    }
  }, [isOpen]);

  function reset() {
    setLicense("");
    setVehicleMatch(null);
    setLookupDone(false);
    setModels([]);
    setMake("");
    setMakeIsNew(false);
    setModel("");
    setModelIsNew(false);
    setYear("");
    setCustQuery("");
    setCustResults([]);
    setCustNo("");
    setCustIsNew(false);
    setCustName("");
    setCustPhone("");
    setCustEmail("");
    setEmpNo("");
    setJobNo("");
    setError("");
  }

  async function handleLicenseLookup() {
    if (!license.trim()) return;
    try {
      const vehicle = await get(`/vehicles/lookup?license=${encodeURIComponent(license.trim())}`);
      setVehicleMatch(vehicle);
      setLookupDone(true);
    } catch {
      setVehicleMatch(null);
      setLookupDone(true);
    }
  }

  async function handleMakeChange(value) {
    setMake(value);
    setModel("");
    setModels([]);
    if (value && value !== "__new__") {
      try {
        const data = await get(`/vehicles/models?make=${encodeURIComponent(value)}`);
        setModels(data);
      } catch {
        setModels([]);
      }
    }
  }

  async function handleCustSearch(value) {
    setCustQuery(value);
    setCustNo("");
    if (value.trim().length < 2) {
      setCustResults([]);
      return;
    }
    try {
      const data = await get(`/customers/search?q=${encodeURIComponent(value.trim())}`);
      setCustResults(data);
    } catch {
      setCustResults([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        vehi_license: license.trim(),
        job_no: jobNo,
        emp_no: empNo,
      };

      if (!vehicleMatch) {
        payload.vehi_make = makeIsNew ? make : make;
        payload.vehi_model = modelIsNew ? model : model;
        payload.vehi_year = Number(year);

        if (custIsNew) {
          payload.cust_name = custName;
          payload.cust_phone = custPhone;
          payload.cust_email = custEmail;
        } else if (custNo) {
          payload.cust_no = custNo;
        }
      }

      await post("/jobs", payload);
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title="New Job">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="bg-red-500/10 text-red-400 text-sm p-2 rounded">{error}</p>}

        <div>
          <label className="block text-zinc-300 text-sm mb-1">Vehicle Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={license}
              onChange={(e) => { setLicense(e.target.value); setLookupDone(false); setVehicleMatch(null); }}
              placeholder="CAB-1234"
              className="flex-1 p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <button type="button" onClick={handleLicenseLookup}
              className="bg-zinc-600 hover:bg-zinc-500 text-white text-sm px-3 rounded">
              Lookup
            </button>
          </div>
        </div>

        {lookupDone && vehicleMatch && (
          <div className="bg-zinc-700/50 rounded p-3 text-sm text-zinc-300">
            <p><span className="text-zinc-400">Make:</span> {vehicleMatch.vehi_make}</p>
            <p><span className="text-zinc-400">Model:</span> {vehicleMatch.vehi_model}</p>
            <p><span className="text-zinc-400">Year:</span> {vehicleMatch.vehi_year}</p>
          </div>
        )}

        {lookupDone && !vehicleMatch && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 text-sm mb-1">Make</label>
                <select
                  value={makeIsNew ? "__new__" : make}
                  onChange={(e) => {
                    if (e.target.value === "__new__") { setMakeIsNew(true); setMake(""); setModels([]); }
                    else { setMakeIsNew(false); handleMakeChange(e.target.value); }
                  }}
                  className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="" disabled>Select make</option>
                  {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                  <option value="__new__">+ Add new make</option>
                </select>
                {makeIsNew && (
                  <input type="text" value={make} onChange={(e) => setMake(e.target.value)}
                    placeholder="New make" className="w-full mt-2 p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
                )}
              </div>
              <div>
                <label className="block text-zinc-300 text-sm mb-1">Model</label>
                <select
                  value={modelIsNew ? "__new__" : model}
                  onChange={(e) => {
                    if (e.target.value === "__new__") { setModelIsNew(true); setModel(""); }
                    else { setModelIsNew(false); setModel(e.target.value); }
                  }}
                  className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="" disabled>Select model</option>
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                  <option value="__new__">+ Add new model</option>
                </select>
                {modelIsNew && (
                  <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
                    placeholder="New model" className="w-full mt-2 p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
                )}
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 text-sm mb-1">Year</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
                className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
            </div>

            <div>
              <label className="block text-zinc-300 text-sm mb-1">Customer (optional)</label>
              <input
                type="text"
                value={custIsNew ? "" : custQuery}
                onChange={(e) => { setCustIsNew(false); handleCustSearch(e.target.value); }}
                placeholder="Search by name, phone or email"
                disabled={custIsNew}
                className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              />
              {custResults.length > 0 && !custNo && !custIsNew && (
                <div className="mt-1 bg-zinc-700 rounded max-h-32 overflow-y-auto">
                  {custResults.map((c) => (
                    <button key={c.cust_no} type="button"
                      onClick={() => { setCustNo(c.cust_no); setCustQuery(c.cust_name); setCustResults([]); }}
                      className="block w-full text-left px-2 py-1 text-sm text-zinc-200 hover:bg-zinc-600">
                      {c.cust_name} — {c.cust_phone}
                    </button>
                  ))}
                </div>
              )}
              <button type="button"
                onClick={() => { setCustIsNew(!custIsNew); setCustNo(""); setCustQuery(""); setCustResults([]); }}
                className="text-amber-400 hover:text-amber-300 text-xs mt-1">
                {custIsNew ? "Search existing customer instead" : "+ Add new customer"}
              </button>
              {custIsNew && (
                <div className="flex flex-col gap-2 mt-2">
                  <input type="text" value={custName} onChange={(e) => setCustName(e.target.value)}
                    placeholder="Name" className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" />
                  <input type="text" value={custPhone} onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="Phone" className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" />
                  <input type="email" value={custEmail} onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="Email" className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              )}
            </div>
          </>
        )}

        <div>
          <label className="block text-zinc-300 text-sm mb-1">Assigned Employee</label>
          <select value={empNo} onChange={(e) => setEmpNo(e.target.value)}
            className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required>
            <option value="" disabled>Select an employee</option>
            {employees.map((e) => <option key={e.emp_no} value={e.emp_no}>{e.emp_gname} {e.emp_fname}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-zinc-300 text-sm mb-1">Job Category</label>
          <select value={jobNo} onChange={(e) => setJobNo(e.target.value)}
            className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required>
            <option value="" disabled>Select a job type</option>
            {jobTypes.map((j) => <option key={j.job_no} value={j.job_no}>{j.job_desc}</option>)}
          </select>
        </div>

        <button type="submit" disabled={submitting || !lookupDone}
          className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2 rounded transition">
          {submitting ? "Creating..." : "Create Job"}
        </button>
      </form>
    </Modal>
  );
}

export default NewJobModal;
