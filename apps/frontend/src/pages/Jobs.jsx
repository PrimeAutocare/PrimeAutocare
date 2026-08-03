import { useEffect, useState } from "react";
import { get, patch } from "../api/client";
import { useAuth } from "../context/useAuth";
import { canManage } from "../context/canManage";
import Modal from "../components/Modal";
import NewJobModal from "../components/NewJobModal";

const STATUS_OPTIONS = [
  { value: "P", label: "Pending" },
  { value: "I", label: "In-progress" },
  { value: "C", label: "Completed" },
  { value: "X", label: "Cancelled" },
];

function Jobs() {
  const { employee } = useAuth();
  const isAdmin = canManage(employee, ["A"]);

  const [jobs, setJobs] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewJob, setShowNewJob] = useState(false);

  const [statusModal, setStatusModal] = useState(null); // { id, newStatus } or null
  const [performedBy, setPerformedBy] = useState("");
  const [hours, setHours] = useState("");
  const [cost, setCost] = useState("");
  const [statusError, setStatusError] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const jobsEndpoint = isAdmin ? "/jobs" : "/jobs/assigned-to-me";
      const [jobsData, jobTypesData, vehiclesData, employeesData] = await Promise.all([
        get(jobsEndpoint),
        get("/job-types"),
        get("/vehicles"),
        get("/employees"),
      ]);
      setJobs(jobsData);
      setJobTypes(jobTypesData);
      setVehicles(vehiclesData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function onStatusSelect(id, newStatus) {
    if (newStatus === "I" || newStatus === "C") {
      setStatusModal({ id, newStatus });
      setPerformedBy("");
      setHours("");
      setCost("");
      setStatusError("");
    } else {
      applyStatusChange(id, { status: newStatus });
    }
  }

  async function applyStatusChange(id, payload) {
    setError("");
    try {
      await patch(`/jobs/${id}`, payload);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusModalSubmit(e) {
    e.preventDefault();
    setStatusError("");
    setStatusSubmitting(true);
    const payload = {
      status: statusModal.newStatus,
      performed_by: performedBy,
    };
    if (statusModal.newStatus === "C") {
      payload.hours = Number(hours);
      if (cost) payload.cost = Number(cost);
    }
    try {
      await patch(`/jobs/${statusModal.id}`, payload);
      setStatusModal(null);
      await loadAll();
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusSubmitting(false);
    }
  }

  function employeeName(no) {
    const e = employees.find((e) => e.emp_no === no);
    return e ? `${e.emp_gname} ${e.emp_fname}` : no;
  }

  function vehicleLabel(id) {
    const v = vehicles.find((v) => v.vehi_id === id);
    return v ? `${v.vehi_license} (${v.vehi_make} ${v.vehi_model})` : id;
  }

  function jobTypeLabel(no) {
    const j = jobTypes.find((j) => j.job_no === no);
    return j ? j.job_desc : no;
  }

  if (loading) return <p className="text-zinc-400">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{isAdmin ? "Jobs" : "My Jobs"}</h2>
        <button onClick={() => setShowNewJob(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded transition">
          + New Job
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400 text-sm">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Vehicle</th>
              <th className="py-2 pr-4">Job</th>
              <th className="py-2 pr-4">Assigned To</th>
              <th className="py-2 pr-4">Performed By</th>
              <th className="py-2 pr-4">Hours</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Cost</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.job_id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="py-2 pr-4 text-white">{j.job_id}</td>
                <td className="py-2 pr-4 text-zinc-300">{vehicleLabel(j.vehi_id)}</td>
                <td className="py-2 pr-4 text-zinc-300">{jobTypeLabel(j.job_no)}</td>
                <td className="py-2 pr-4 text-zinc-300">{employeeName(j.emp_no)}</td>
                <td className="py-2 pr-4 text-zinc-300">{j.performed_by ? employeeName(j.performed_by) : "-"}</td>
                <td className="py-2 pr-4 text-zinc-300">{j.hours ?? "-"}</td>
                <td className="py-2 pr-4">
                  <select value={j.status}
                    onChange={(e) => onStatusSelect(j.job_id, e.target.value)}
                    className="bg-zinc-700 text-white text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500">
                    {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </td>
                <td className="py-2 pr-4 text-zinc-300">{j.cost ?? "-"}</td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-zinc-500">No jobs yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <NewJobModal
        isOpen={showNewJob}
        onClose={() => setShowNewJob(false)}
        onCreated={loadAll}
        jobTypes={jobTypes}
        employees={employees}
      />

      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)}
        title={statusModal?.newStatus === "C" ? "Complete Job" : "Start Job"}>
        {statusModal && (
          <form onSubmit={handleStatusModalSubmit} className="flex flex-col gap-4">
            {statusError && <p className="bg-red-500/10 text-red-400 text-sm p-2 rounded">{statusError}</p>}
            <div>
              <label className="block text-zinc-300 text-sm mb-1">Performed By</label>
              <select value={performedBy} onChange={(e) => setPerformedBy(e.target.value)}
                className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required>
                <option value="" disabled>Select a technician</option>
                {employees.map((e) => <option key={e.emp_no} value={e.emp_no}>{e.emp_gname} {e.emp_fname}</option>)}
              </select>
            </div>
            {statusModal.newStatus === "C" && (
              <>
                <div>
                  <label className="block text-zinc-300 text-sm mb-1">Hours Worked</label>
                  <input type="number" step="0.01" value={hours} onChange={(e) => setHours(e.target.value)}
                    className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm mb-1">Cost (optional)</label>
                  <input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)}
                    className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </>
            )}
            <button type="submit" disabled={statusSubmitting}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2 rounded transition">
              {statusSubmitting ? "Saving..." : "Confirm"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Jobs;
