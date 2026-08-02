import { useEffect, useState } from "react";
import { fetchAllReports, fetchAiReview } from "../api/reports";

function Reports() {
  const [reports, setReports] = useState([]);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [reportsData, reviewData] = await Promise.all([
        fetchAllReports(),
        fetchAiReview().catch(() => ({ file: null, content: null })),
      ]);
      setReports(reportsData);
      setReview(reviewData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="text-zinc-400">Loading...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-white">Reports</h2>
      <p className="text-zinc-400 mb-8">
        Generated automatically twice a month from live workshop data.
      </p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {reports.map((r) => (
          <div key={r.key} className="bg-zinc-800 p-5 rounded-lg flex flex-col justify-between">
            <div>
              <p className="text-white font-semibold mb-1">{r.label}</p>
              {r.file ? (
                <p className="text-zinc-400 text-sm mb-4 break-all">{r.file.name}</p>
              ) : (
                <p className="text-zinc-500 text-sm mb-4">
                  {r.error ? "Unavailable" : "No report generated yet"}
                </p>
              )}
            </div>
            {r.file && (
              <a
                href={r.file.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold text-center py-2 rounded transition"
              >
                Download
              </a>
            )}
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-4 text-white">AI Review</h3>

      {review && review.content ? (
        <div className="bg-zinc-800 rounded-lg p-6 max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <p className="text-zinc-400 text-sm">
              {review.file ? review.file.name : ""}
            </p>
            <a
              href={review.file ? review.file.downloadUrl : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 text-sm"
            >
              Open raw file
            </a>
          </div>
          <pre className="whitespace-pre-wrap text-zinc-200 text-sm font-sans leading-relaxed">
            {review.content}
          </pre>
        </div>
      ) : (
        <p className="text-zinc-500">No AI review available yet.</p>
      )}
    </div>
  );
}

export default Reports;