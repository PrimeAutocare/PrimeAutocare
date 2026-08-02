const REPO_API = "https://api.github.com/repos/PrimeAutocare/Generated_Reports/contents";
const REPO_RAW = "https://raw.githubusercontent.com/PrimeAutocare/Generated_Reports/main";

const REPORT_FOLDERS = [
  { key: "payroll", label: "Payroll Report", path: "Payroll Report" },
  { key: "utilization", label: "Utilization Report", path: "Utilization Report" },
  { key: "receivables", label: "Receivables Report", path: "Receivables Report" },
  { key: "revenue", label: "Revenue Report", path: "Revenue Report" },
  { key: "wip", label: "Workshop WIP Report", path: "WIP Report" },
  { key: "attendance", label: "Attendance Report", path: "Attendance Report" },
];

const AI_REVIEW_FOLDER = { key: "ai_review", label: "AI Review", path: "AI Review" };

async function fetchFolderCurrentFile(path) {
  const url = `${REPO_API}/${encodeURIComponent(path)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
  const items = await res.json();
  // The current file sits directly in the folder; archive/ is a subdirectory, so filtering
  // to type "file" naturally excludes it.
  const file = items.find((item) => item.type === "file");
  return file
    ? { name: file.name, downloadUrl: file.download_url }
    : null;
}

export async function fetchAllReports() {
  const results = await Promise.all(
    REPORT_FOLDERS.map(async (folder) => {
      try {
        const file = await fetchFolderCurrentFile(folder.path);
        return { ...folder, file, error: null };
      } catch (err) {
        return { ...folder, file: null, error: err.message };
      }
    })
  );
  return results;
}

export async function fetchAiReview() {
  const file = await fetchFolderCurrentFile(AI_REVIEW_FOLDER.path);
  if (!file) return { file: null, content: null };
  const res = await fetch(`${REPO_RAW}/${encodeURIComponent(AI_REVIEW_FOLDER.path)}/${encodeURIComponent(file.name)}`);
  const content = await res.text();
  return { file, content };
}