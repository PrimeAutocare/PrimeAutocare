import { useEffect, useState } from "react";
import { get } from "../api/client";
import { useAuth } from "../context/useAuth";
import { canManage } from "../context/canManage";

function Dashboard() {
  const { employee } = useAuth();
  const isAdmin = canManage(employee, ["A"]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const jobsEndpoint = isAdmin ? "/jobs" : "/jobs/assigned-to-me";
      const calls = [get(jobsEndpoint), get("/attendance/me")];
      if (isAdmin) calls.push(get("/invoices"));
      const results = await Promise.all(calls);
      setJobs(results[0]);
      setMyAttendance(results[1]);
      if (isAdmin) setInvoices(results[2]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  if (loading) return <p className="text-slate-400">Loading...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  const today = new Date().toISOString().split("T")[0];
  const pendingJobs = jobs.filter((j) => j.status === "P").length;
  const inProgressJobs = jobs.filter((j) => j.status === "I").length;
  const completedToday = jobs.filter(
    (j) => j.status === "C" && j.updated_at?.split("T")[0] === today
  ).length;
  const outstandingInvoices = invoices.filter((i) => i.inv_status === "U" || i.inv_status === "P").length;

  const openAttendance = myAttendance.find((r) => !r.clock_out);

  const cards = isAdmin
    ? [
        { label: "Pending Jobs", value: pendingJobs, color: "bg-yellow-600" },
        { label: "In-Progress Jobs", value: inProgressJobs, color: "bg-amber-600" },
        { label: "Completed Today", value: completedToday, color: "bg-green-600" },
        { label: "Outstanding Invoices", value: outstandingInvoices, color: "bg-red-600" },
      ]
    : [
        { label: "My Pending Jobs", value: pendingJobs, color: "bg-yellow-600" },
        { label: "My In-Progress Jobs", value: inProgressJobs, color: "bg-amber-600" },
        { label: "My Completed Today", value: completedToday, color: "bg-green-600" },
      ];

  const recentJobs = [...jobs].sort((a, b) => (a.job_id < b.job_id ? 1 : -1)).slice(0, 5);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">
        Welcome, {employee.emp_gname}
      </h2>
      <p className="text-slate-400 mb-8">Here's what's happening at PrimeAutocare today.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => (
          <div key={card.label} className={`${card.color} rounded-lg p-5`}>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-white/80 mt-1">{card.label}</p>
          </div>
        ))}
        {!isAdmin && (
          <div className="bg-blue-600 rounded-lg p-5">
            <p className="text-xl font-bold text-white">
              {openAttendance
                ? `Since ${new Date(openAttendance.clock_in).toLocaleTimeString()}`
                : "Clocked out"}
            </p>
            <p className="text-sm text-white/80 mt-1">Clock-in Status</p>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-4">Recent Jobs</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-sm">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Vehicle</th>
              <th className="py-2 pr-4">Job</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentJobs.map((j) => (
              <tr key={j.job_id} className="border-b border-slate-800">
                <td className="py-2 pr-4">{j.job_id}</td>
                <td className="py-2 pr-4">{j.vehi_id}</td>
                <td className="py-2 pr-4">{j.job_no}</td>
                <td className="py-2 pr-4">{j.status}</td>
              </tr>
            ))}
            {recentJobs.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-slate-500">No jobs yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
