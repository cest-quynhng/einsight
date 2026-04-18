import React from "react";

function sortEntries(data) {
  return Object.entries(data || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
}

function Row({ label, value, total, positive }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="grid grid-cols-[9rem_1fr_5.5rem] items-center gap-3 text-xs">
      <span className="truncate font-medium text-slate-700">{label}</span>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div
          className={"h-full rounded-full " + (positive ? "bg-emerald-500" : "bg-red-500")}
          style={{ width: `${Math.max(pct, 3)}%` }}
        />
      </div>
      <span className="text-right tabular-nums text-slate-600">
        <b className="text-slate-900">{value}</b>
        <span className="ml-1 text-slate-400">· {pct}%</span>
      </span>
    </div>
  );
}

export default function CategoryBars({ title, data, total, positive, needBreakdown }) {
  const entries = sortEntries(data);
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400">Chưa có dữ liệu.</p>
      ) : (
        <div className="space-y-2.5">
          {entries.map(([k, v]) => (
            <Row key={k} label={k} value={v} total={total || 0} positive={positive} />
          ))}
        </div>
      )}

      {needBreakdown && (
        <div className="hair-t mt-4 flex flex-wrap gap-1.5 pt-3">
          <span className="chip">
            Core Needs <b className="ml-1 text-slate-900">{needBreakdown.core || 0}</b>
          </span>
          <span className="chip">
            Differential Needs <b className="ml-1 text-slate-900">{needBreakdown.differential || 0}</b>
          </span>
          <span className="chip">
            Add-on Needs <b className="ml-1 text-slate-900">{needBreakdown.addon || 0}</b>
          </span>
        </div>
      )}
    </div>
  );
}
