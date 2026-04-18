import React, { useState } from "react";
import { TAG_STYLES, SENTIMENT_STYLES } from "../constants.js";

function TagPill({ value }) {
  if (!value) return <span className="text-slate-300">—</span>;
  const cls = TAG_STYLES[value] || "bg-surface-muted text-slate-700";
  return <span className={"pill " + cls}>{value}</span>;
}

function SentimentPill({ value }) {
  if (!value) return null;
  const cls = SENTIMENT_STYLES[value] || "bg-surface-muted text-slate-700";
  return <span className={"pill " + cls}>{value}</span>;
}

function Stars({ value }) {
  const n = Math.round(Number(value) || 0);
  return (
    <span className="whitespace-nowrap text-amber-500">
      {"★".repeat(n)}
      <span className="text-slate-300">{"★".repeat(Math.max(0, 5 - n))}</span>
    </span>
  );
}

export default function ReviewsTable({ reviews }) {
  const [q, setQ] = useState("");
  const [sent, setSent] = useState("all");

  const filtered = (reviews || []).filter((r) => {
    if (sent !== "all" && r.sentiment !== sent) return false;
    if (q && !r.content.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="card overflow-hidden">
      <div className="hair-b flex flex-wrap items-center justify-between gap-2 p-4">
        <h3 className="text-[14px] font-semibold text-slate-900">
          Tagged reviews
          <span className="ml-1 text-sm font-normal text-slate-500">({filtered.length})</span>
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm trong review..."
            className="input !py-1.5 text-sm"
            style={{ width: "14rem" }}
          />
          <select
            value={sent}
            onChange={(e) => setSent(e.target.value)}
            className="input !py-1.5 !pl-2.5 !pr-8 text-sm"
            style={{ width: "auto" }}
          >
            <option value="all">Tất cả sentiment</option>
            <option value="Happy">Happy</option>
            <option value="Mixed">Mixed</option>
            <option value="Unhappy">Unhappy</option>
          </select>
        </div>
      </div>

      <div className="max-h-[640px] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-surface-muted text-[11px] font-medium uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2.5 text-left">Review</th>
              <th className="px-3 py-2.5 text-left">Tag 1</th>
              <th className="px-3 py-2.5 text-left">Tag 2</th>
              <th className="px-3 py-2.5 text-left">Tag 3</th>
              <th className="px-3 py-2.5 text-left">Tag 4</th>
              <th className="px-3 py-2.5 text-left">Need type</th>
              <th className="px-3 py-2.5 text-left">Rating</th>
              <th className="px-3 py-2.5 text-left">Sentiment</th>
              <th className="px-3 py-2.5 text-left">Conf.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="align-top hover:bg-surface-muted/60" style={{ borderTop: "0.5px solid var(--hair)" }}>
                <td className="max-w-[420px] px-4 py-3 text-slate-700">
                  <div className="line-clamp-4 whitespace-pre-line">{r.content}</div>
                </td>
                <td className="px-3 py-3"><TagPill value={r.tag1} /></td>
                <td className="px-3 py-3"><TagPill value={r.tag2} /></td>
                <td className="px-3 py-3"><TagPill value={r.tag3} /></td>
                <td className="px-3 py-3"><TagPill value={r.tag4} /></td>
                <td className="px-3 py-3 text-xs text-slate-600">{r.need_type || "—"}</td>
                <td className="px-3 py-3"><Stars value={r.rating} /></td>
                <td className="px-3 py-3"><SentimentPill value={r.sentiment} /></td>
                <td className="px-3 py-3 text-xs tabular-nums text-slate-500">{r.confidence ?? 0}%</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                  Không có review nào khớp bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
