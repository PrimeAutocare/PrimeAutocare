import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { fetchAllReports, fetchAiReview } from "../api/reports";

function extractPeriod(raw) {
  if (!raw) return null;
  const match = raw.match(/^-\s+\*\*Period:\*\*\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

function stripReviewHeader(raw) {
  if (!raw) return raw;
  const dividerIndex = raw.indexOf("\n---");
  if (dividerIndex === -1) return raw;
  return raw.slice(dividerIndex + 4).replace(/^\s+/, "");
}

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
            {r.file ? (
              <a
                href={r.file.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold text-center py-2 rounded transition"
              >
                Download
              </a>
            ) : null}
          </div>
        ))}
      </div>

      {review && review.content ? (
        <div className="bg-zinc-800 rounded-lg p-6 max-w-4xl">
            <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">AI Review</h4>
            {extractPeriod(review.content) && (
                <span className="text-zinc-500 text-sm">{extractPeriod(review.content)}</span>
            )}
            </div>
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-strong:text-white prose-a:text-orange-400">
            <ReactMarkdown>{stripReviewHeader(review.content)}</ReactMarkdown>
            </div>
        </div>
        ) : (
        <p className="text-zinc-500">No AI review available yet.</p>
        )}
    </div>
  );
}

export default Reports;