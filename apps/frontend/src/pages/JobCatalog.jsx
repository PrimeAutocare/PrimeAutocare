import { useEffect, useState } from "react";
import { get, post, del } from "../api/client";

function JobCatalog() {
  const [jobTypes, setJobTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [jobDesc, setJobDesc] = useState("");

  async function loadJobTypes() {
    setLoading(true);
    setError("");
    try {
      const data = await get("/job-types");
      setJobTypes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await loadJobTypes();
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await post("/job-types", { job_desc: jobDesc });
      setJobDesc("");
      await loadJobTypes();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(jobNo) {
    if (!confirm("Delete this job type? This cannot be undone.")) return;
    setError("");
    try {
      await del(`/job-types/${jobNo}`);
      await loadJobTypes();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="text-zinc-400">Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Job Catalog</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800 p-6 rounded-lg mb-8 flex flex-col gap-4 max-w-lg"
      >
        <h3 className="text-lg font-semibold">Add New Job Type</h3>

        {formError && (
          <p className="bg-red-500/10 text-red-400 text-sm p-2 rounded">
            {formError}
          </p>
        )}

        <div>
          <label className="block text-zinc-300 text-sm mb-1">Description</label>
          <input
            type="text"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="e.g. Tyre Rotation"
            className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2 rounded transition"
        >
          {submitting ? "Adding..." : "Add Job Type"}
        </button>
      </form>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400 text-sm">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Description</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {jobTypes.map((j) => (
              <tr key={j.job_no} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="py-2 pr-4">{j.job_no}</td>
                <td className="py-2 pr-4">{j.job_desc}</td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => handleDelete(j.job_no)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default JobCatalog;
