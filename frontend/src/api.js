const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function analyzeCsvStart(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/api/analyze/csv/start`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function analyzeUrlStart(url, maxReviews = 500) {
  const res = await fetch(`${BASE}/api/analyze/url/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, max_reviews: maxReviews }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchResult(jobId) {
  const res = await fetch(`${BASE}/api/analyze/result/${jobId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function streamProgress(jobId, onProgress) {
  const es = new EventSource(`${BASE}/api/analyze/progress/${jobId}`);
  es.onmessage = (ev) => {
    try {
      onProgress(JSON.parse(ev.data));
    } catch {}
  };
  es.onerror = () => es.close();
  return es;
}

export async function exportCsv(analysis) {
  const res = await fetch(`${BASE}/api/export/csv`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(analysis),
  });
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `einsight_${analysis.app_name || "export"}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
