import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { fetchAllReports, fetchAiReview, fetchArchivedReports } from "../api/reports";
import Modal from "../components/Modal";

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

  const [selected, setSelected] = useState(null);
  const [archived, setArchived] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveError, setArchiveError] = useState("");

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

  useEffect(() => {
  // Standard "fetch on mount" pattern; loadAll manages its own loading/error state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadAll();
  }, []);

  async function openReport(report) {
    setSelected(report);
    setArchived([]);
    setArchiveError("");
    setArchiveLoading(true);
    try {
      const files = await fetchArchivedReports(report.path);
      setArchived(files);
    } catch (err) {
      setArchiveError(err.message);
    } finally {
      setArchiveLoading(false);
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
              <button
                type="button"
                onClick={() => openReport(r)}
                className="text-white font-semibold mb-1 hover:text-amber-400 transition text-left"
              >
                {r.label}
              </button>
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
                className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold text-center py-2 rounded transition"
              >
                Download
              </a>
            ) : null}
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-4 text-white">AI Review</h3>

      {review && review.content ? (
        <div className="bg-zinc-800 rounded-lg p-6 max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">AI Review</h4>
            {extractPeriod(review.content) && (
              <span className="text-zinc-500 text-sm">{extractPeriod(review.content)}</span>
            )}
          </div>
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-strong:text-white prose-a:text-amber-400">
            <ReactMarkdown>{stripReviewHeader(review.content)}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <p className="text-zinc-500">No AI review available yet.</p>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.label ?? ""}>
        {selected && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Current</p>
              {selected.file ? (
                <a
                  href={selected.file.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-zinc-700 hover:bg-zinc-600 rounded px-3 py-2 text-sm text-white transition break-all"
                >
                  {selected.file.name}
                </a>
              ) : (
                <p className="text-zinc-500 text-sm">
                  {selected.error ? "Unavailable" : "No report generated yet"}
                </p>
              )}
            </div>

            <div>
              <p className="text-zinc-400 text-sm mb-1">Archived</p>
              {archiveLoading ? (
                <p className="text-zinc-500 text-sm">Loading...</p>
              ) : archiveError ? (
                <p className="text-red-400 text-sm">{archiveError}</p>
              ) : archived.length === 0 ? (
                <p className="text-zinc-500 text-sm">No archived reports</p>
              ) : (
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                  {archived.map((f) => (
                    <a
                      key={f.name}
                      href={f.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-zinc-700 hover:bg-zinc-600 rounded px-3 py-2 text-sm text-white transition break-all"
                    >
                      {f.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Reports;