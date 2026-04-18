import React, { useMemo, useState } from "react";
import { TAG_STYLES, SENTIMENT_STYLES } from "../../constants.js";
import { formatDateShort, parseDate } from "../../lib/analyze.js";

function TagPill({ value }) {
  if (!value) return null;
  const cls = TAG_STYLES[value] || "chip";
  return <span className={"pill " + cls}>{value}</span>;
}
function SentPill({ value }) {
  if (!value) return null;
  const cls = SENTIMENT_STYLES[value] || "chip";
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

const RATING_FILTERS = ["all", "5", "4", "3", "2", "1"];
const SENT_FILTERS = ["all", "Unhappy", "Mixed", "Happy"];

export default function ReviewsFeed({ reviews, defaultLowStars = true, scrollTargetId }) {
  const [rating, setRating] = useState(defaultLowStars ? "low" : "all");
  const [sent, setSent] = useState("all");
  const [expanded, setExpanded] = useState(() => new Set());

  function toggle(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const list = useMemo(() => {
    const r = (reviews || []).slice();
    r.sort((a, b) => {
      const ad = parseDate(a.date)?.getTime() || 0;
      const bd = parseDate(b.date)?.getTime() || 0;
      return bd - ad;
    });
    return r;
  }, [reviews]);

  const filtered = list.filter((r) => {
    const rt = Math.round(Number(r.rating) || 0);
    if (rating === "low" && !(rt === 1 || rt === 2)) return false;
    if (rating !== "all" && rating !== "low" && String(rt) !== rating) return false;
    if (sent !== "all" && r.sentiment !== sent) return false;
    return true;
  });

  return (
    <div className="card overflow-hidden" id={scrollTargetId}>
      <div className="hair-b flex flex-wrap items-center justify-between gap-2 p-4">
        <h3 className="text-[14px] font-semibold text-slate-900">
          Reviews feed <span className="ml-1 text-[12px] font-normal text-slate-500">({filtered.length})</span>
        </h3>
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-md p-0.5" style={{ backgroundColor: "var(--surface-muted)", border: "0.5px solid var(--hair)" }}>
            {[{ v: "low", t: "1–2★" }, ...RATING_FILTERS.map((v) => ({ v, t: v === "all" ? "All" : `${v}★` }))].map((opt) => (
              <button
                key={opt.v}
                onClick={() => setRating(opt.v)}
                className={
                  "rounded-[6px] px-2 py-0.5 text-[11px] font-medium transition " +
                  (rating === opt.v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")
                }
                style={rating === opt.v ? { border: "0.5px solid var(--hair)" } : {}}
              >
                {opt.t}
              </button>
            ))}
          </div>
          <select
            value={sent}
            onChange={(e) => setSent(e.target.value)}
            className="input !py-1 !pl-2.5 !pr-7 text-[12px]"
            style={{ width: "auto" }}
          >
            {SENT_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "Tất cả sentiment" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-h-[640px] overflow-auto">
        <table className="min-w-full text-[13px]">
          <thead className="sticky top-0 z-10 section-label" style={{ backgroundColor: "var(--surface-muted)" }}>
            <tr>
              <th className="px-4 py-2.5 text-left">Date</th>
              <th className="px-3 py-2.5 text-left">Review</th>
              <th className="px-3 py-2.5 text-left">Tags</th>
              <th className="px-3 py-2.5 text-left">Rating</th>
              <th className="px-3 py-2.5 text-left">Sentiment</th>
              <th className="px-3 py-2.5 text-left">Conf.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const isOpen = expanded.has(r.id);
              const tags = [r.tag1, r.tag2, r.tag3, r.tag4].filter(Boolean);
              return (
                <tr
                  key={r.id}
                  className="align-top cursor-pointer hover:bg-[color:var(--surface-muted)]"
                  onClick={() => toggle(r.id)}
                  style={{ borderTop: "0.5px solid var(--hair)" }}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-[12px] text-slate-600">
                    {formatDateShort(r.date)}
                  </td>
                  <td className="max-w-[480px] px-3 py-3 text-slate-700">
                    <div className={isOpen ? "whitespace-pre-line" : "line-clamp-3 whitespace-pre-line"}>
                      {r.content}
                    </div>
                    {r.content && r.content.length > 180 && (
                      <div className="mt-1 text-[11px] text-brand">
                        {isOpen ? "Thu gọn ▲" : "Xem đầy đủ ▼"}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {tags.length === 0 ? <span className="text-slate-300">—</span> : tags.map((t, i) => <TagPill key={i} value={t} />)}
                    </div>
                  </td>
                  <td className="px-3 py-3"><Stars value={r.rating} /></td>
                  <td className="px-3 py-3"><SentPill value={r.sentiment} /></td>
                  <td className="px-3 py-3 text-[12px] tabular-nums text-slate-500">{r.confidence ?? 0}%</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-slate-500">
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
