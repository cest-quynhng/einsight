import React from "react";

const NEED_TYPE_STYLE = {
  "Core Needs": "bg-slate-100 text-slate-700",
  "Differential Needs": "bg-brand-50 text-brand-700",
  "Add-on Needs": "bg-amber-100 text-amber-800",
};

function Row({ row, total, positive, showNeed }) {
  const pct = total ? Math.round((row.count / total) * 100) : 0;
  return (
    <div className="grid grid-cols-[8rem_1fr_auto_auto] items-center gap-3 text-[12px]">
      <span className="truncate font-medium text-slate-700">{row.tag}</span>
      <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--surface-subtle)" }}>
        <div
          className={"h-full rounded-full " + (positive ? "bg-emerald-500" : "bg-red-500")}
          style={{ width: `${Math.max(pct, 3)}%` }}
        />
      </div>
      <span className="min-w-[2.5rem] text-right tabular-nums text-slate-700">
        <b className="text-slate-900">{row.count}</b>
      </span>
      {showNeed ? (
        row.needType ? (
          <span className={"pill " + (NEED_TYPE_STYLE[row.needType] || "chip")}>
            {row.needType.replace(" Needs", "")}
          </span>
        ) : (
          <span className="w-[72px]" />
        )
      ) : (
        <span className="min-w-[3rem] text-right text-[11px] text-slate-400">{pct}%</span>
      )}
    </div>
  );
}

export default function TagBarList({ title, rows, total, positive, showNeed }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-[14px] font-semibold text-slate-900">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[12px] text-slate-400">Chưa có dữ liệu.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <Row key={r.tag} row={r} total={total} positive={positive} showNeed={showNeed} />
          ))}
        </div>
      )}
    </div>
  );
}
