import { useEffect, useState } from "react";
import { get } from "../api/client";
import { useAuth } from "../context/useAuth";
import { canManage } from "../context/canManage";

function ClockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3.75 2.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ArrowPathIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-4.99M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
      />
    </svg>
  );
}

function CheckCircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function CurrencyDollarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function ArrowRightOnRectangleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3"
      />
    </svg>
  );
}

const STATUS_LABELS = { P: "Pending", I: "In-progress", C: "Completed", X: "Cancelled" };
const STATUS_STYLES = {
  P: "bg-yellow-500/15 text-yellow-400",
  I: "bg-blue-500/15 text-blue-400",
  C: "bg-green-500/15 text-green-400",
  X: "bg-zinc-500/15 text-zinc-400",
};

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

  if (loading) return <p className="text-zinc-400">Loading...</p>;
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
        { label: "Pending Jobs", value: pendingJobs, icon: ClockIcon, color: "bg-amber-700" },
        { label: "In-Progress Jobs", value: inProgressJobs, icon: ArrowPathIcon, color: "bg-teal-700" },
        { label: "Completed Today", value: completedToday, icon: CheckCircleIcon, color: "bg-green-700" },
        { label: "Outstanding Invoices", value: outstandingInvoices, icon: CurrencyDollarIcon, color: "bg-red-700" },
      ]
    : [
        { label: "My Pending Jobs", value: pendingJobs, icon: ClockIcon, color: "bg-amber-700" },
        { label: "My In-Progress Jobs", value: inProgressJobs, icon: ArrowPathIcon, color: "bg-teal-700" },
        { label: "My Completed Today", value: completedToday, icon: CheckCircleIcon, color: "bg-green-700" },
      ];

  const recentJobs = [...jobs].sort((a, b) => (a.job_id < b.job_id ? 1 : -1)).slice(0, 5);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">
        Welcome, {employee.emp_gname}
      </h2>
      <p className="text-zinc-400 mb-8">Here's what's happening at PrimeAutocare today.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`${card.color} rounded-xl p-5 shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/30 transition`}
            >
              <div className="inline-flex p-2 rounded-lg mb-3 bg-white/15 text-white">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <p className="text-sm text-white/80 mt-1">{card.label}</p>
            </div>
          );
        })}
        {!isAdmin && (
          <div className="bg-cyan-700 rounded-xl p-5 shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/30 transition">
            <div className="inline-flex p-2 rounded-lg mb-3 bg-white/15 text-white">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </div>
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
            <tr className="border-b border-zinc-700 text-zinc-400 text-sm">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Vehicle</th>
              <th className="py-2 pr-4">Job</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentJobs.map((j) => (
              <tr key={j.job_id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="py-2 pr-4">{j.job_id}</td>
                <td className="py-2 pr-4">{j.vehi_id}</td>
                <td className="py-2 pr-4">{j.job_no}</td>
                <td className="py-2 pr-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[j.status] ?? ""}`}>
                    {STATUS_LABELS[j.status] ?? j.status}
                  </span>
                </td>
              </tr>
            ))}
            {recentJobs.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-zinc-500">No jobs yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
