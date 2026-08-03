import { useEffect, useState } from "react";
import { get, post, del } from "../api/client";
import { useAuth } from "../context/useAuth";
import { canManage } from "../context/canManage";
import Modal from "../components/Modal";

function Employees() {
  const { employee: currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [gname, setGname] = useState("");
  const [fname, setFname] = useState("");
  const [phone, setPhone] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("T");
  const [hourlyRate, setHourlyRate] = useState("");

  const ROLE_LABELS = { A: "Admin", S: "Supervisor", T: "Technician" };
  const canCreate = canManage(currentUser, ["A"]);
  const canDelete = canManage(currentUser, ["A"]);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    setError("");
    try {
      const data = await get("/employees");
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setGname("");
    setFname("");
    setPhone("");
    setEmailInput("");
    setUsername("");
    setPassword("");
    setRole("T");
    setHourlyRate("");
    setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await post("/employees", {
        emp_gname: gname,
        emp_fname: fname,
        emp_phone: phone,
        emp_email: emailInput,
        emp_username: username,
        emp_passhash: password,
        emp_role: role,
        emp_create_dt: new Date().toISOString().split("T")[0],
        emp_hourly_rate: Number(hourlyRate),
      });
      resetForm();
      setShowModal(false);
      await loadEmployees();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(empNo) {
    if (!confirm("Delete this employee? This cannot be undone.")) return;
    setError("");
    try {
      await del(`/employees/${empNo}`);
      await loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="text-zinc-400">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Employees</h2>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded transition"
          >
            + Add Employee
          </button>
        )}
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400 text-sm">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Username</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Rate</th>
              {canDelete && <th className="py-2 pr-4"></th>}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.emp_no} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="py-2 pr-4 text-white">{emp.emp_no}</td>
                <td className="py-2 pr-4 text-white">{emp.emp_gname} {emp.emp_fname}</td>
                <td className="py-2 pr-4 text-zinc-300">{emp.emp_phone}</td>
                <td className="py-2 pr-4 text-zinc-300">{emp.emp_email}</td>
                <td className="py-2 pr-4 text-zinc-300">{emp.emp_username}</td>
                <td className="py-2 pr-4 text-zinc-300">{ROLE_LABELS[emp.emp_role] ?? emp.emp_role}</td>
                <td className="py-2 pr-4 text-zinc-300">{emp.emp_hourly_rate}</td>
                {canDelete && (
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => handleDelete(emp.emp_no)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="Add New Employee">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <p className="bg-red-500/10 text-red-400 text-sm p-2 rounded">{formError}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 text-sm mb-1">First Name</label>
              <input type="text" value={gname} onChange={(e) => setGname(e.target.value)}
                className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
            </div>
            <div>
              <label className="block text-zinc-300 text-sm mb-1">Last Name</label>
              <input type="text" value={fname} onChange={(e) => setFname(e.target.value)}
                className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
            </div>
          </div>
          <div>
            <label className="block text-zinc-300 text-sm mb-1">Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94771234567"
              className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div>
            <label className="block text-zinc-300 text-sm mb-1">Email</label>
            <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div>
            <label className="block text-zinc-300 text-sm mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div>
            <label className="block text-zinc-300 text-sm mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div>
            <label className="block text-zinc-300 text-sm mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500">
              <option value="T">Technician</option>
              <option value="S">Supervisor</option>
              <option value="A">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-zinc-300 text-sm mb-1">Hourly Rate</label>
            <input type="number" step="0.01" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <button type="submit" disabled={submitting}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2 rounded transition">
            {submitting ? "Adding..." : "Add Employee"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default Employees;