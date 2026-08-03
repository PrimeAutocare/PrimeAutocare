import { useEffect, useState } from "react";
import { get, post } from "../api/client";
import { useAuth } from "../context/useAuth";
import { canManage } from "../context/canManage";

function Attendance() {
  const { employee } = useAuth();
  const isAdmin = canManage(employee, ["A"]);

  const [myLog, setMyLog] = useState([]);
  const [allLog, setAllLog] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const calls = [get("/attendance/me")];
      if (isAdmin) {
        calls.push(get("/attendance"), get("/employees"));
      }
      const results = await Promise.all(calls);
      setMyLog(results[0]);
      if (isAdmin) {
        setAllLog(results[1]);
        setEmployees(results[2]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const openRecord = myLog.find((r) => !r.clock_out);

  async function handleClockIn() {
    setActionError("");
    setSubmitting(true);
    try {
      await post("/attendance/clock-in", {});
      await loadAll();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClockOut() {
    setActionError("");
    setSubmitting(true);
    try {
      await post("/attendance/clock-out", {});
      await loadAll();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function employeeName(no) {
    const e = employees.find((e) => e.emp_no === no);
    return e ? `${e.emp_gname} ${e.emp_fname}` : no;
  }

  if (loading) return <p className="text-zinc-400">Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Attendance</h2>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="bg-zinc-800 rounded-lg p-6 mb-8 max-w-md">
        {actionError && <p className="bg-red-500/10 text-red-400 text-sm p-2 rounded mb-4">{actionError}</p>}
        <p className="text-zinc-300 mb-4">
          {openRecord
            ? `Clocked in since ${new Date(openRecord.clock_in).toLocaleTimeString()}`
            : "Not clocked in"}
        </p>
        {openRecord ? (
          <button onClick={handleClockOut} disabled={submitting}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded transition">
            {submitting ? "Clocking out..." : "Clock Out"}
          </button>
        ) : (
          <button onClick={handleClockIn} disabled={submitting}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded transition">
            {submitting ? "Clocking in..." : "Clock In"}
          </button>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-4">My Log</h3>
      <div className="overflow-x-auto mb-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400 text-sm">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Clock In</th>
              <th className="py-2 pr-4">Clock Out</th>
              <th className="py-2 pr-4">Hours</th>
            </tr>
          </thead>
          <tbody>
            {myLog.map((r) => (
              <tr key={r.att_id} className="border-b border-zinc-800">
                <td className="py-2 pr-4 text-zinc-300">{r.att_date}</td>
                <td className="py-2 pr-4 text-zinc-300">{new Date(r.clock_in).toLocaleTimeString()}</td>
                <td className="py-2 pr-4 text-zinc-300">{r.clock_out ? new Date(r.clock_out).toLocaleTimeString() : "-"}</td>
                <td className="py-2 pr-4 text-zinc-300">{r.total_hours ?? "-"}</td>
              </tr>
            ))}
            {myLog.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-zinc-500">No attendance records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <>
          <h3 className="text-lg font-semibold mb-4">All Employees</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400 text-sm">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Clock In</th>
                  <th className="py-2 pr-4">Clock Out</th>
                  <th className="py-2 pr-4">Hours</th>
                </tr>
              </thead>
              <tbody>
                {allLog.map((r) => (
                  <tr key={r.att_id} className="border-b border-zinc-800">
                    <td className="py-2 pr-4 text-zinc-300">{employeeName(r.emp_no)}</td>
                    <td className="py-2 pr-4 text-zinc-300">{r.att_date}</td>
                    <td className="py-2 pr-4 text-zinc-300">{new Date(r.clock_in).toLocaleTimeString()}</td>
                    <td className="py-2 pr-4 text-zinc-300">{r.clock_out ? new Date(r.clock_out).toLocaleTimeString() : "-"}</td>
                    <td className="py-2 pr-4 text-zinc-300">{r.total_hours ?? "-"}</td>
                  </tr>
                ))}
                {allLog.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-zinc-500">No attendance records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Attendance;
