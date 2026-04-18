import React from "react";

function Card({ label, value, delta, accent }) {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "var(--surface-muted)" }}>
      <div className="section-label">{label}</div>
      <div className={"mt-2 text-[20px] font-medium leading-tight " + (accent || "text-slate-900")}>
        {value}
      </div>
      {delta && <div className="mt-1 text-[11px] text-slate-500">{delta}</div>}
    </div>
  );
}

export default function DailyMetrics({
  ratingRecent,
  newCount24h,
  negative24h,
  posPct,
  negPct,
  anchorHint,
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card
        label="Rating hôm nay"
        value={
          ratingRecent ? (
            <span>
              {ratingRecent.toFixed(2)}
              <span className="ml-1 text-amber-500">★</span>
            </span>
          ) : (
            "—"
          )
        }
        delta={anchorHint}
      />
      <Card
        label="Review mới 24h"
        value={newCount24h.toLocaleString()}
        delta={anchorHint}
      />
      <Card
        label="Negative mới 24h"
        value={negative24h.toLocaleString()}
        accent={negative24h > 0 ? "text-red-600" : "text-slate-900"}
        delta={negative24h > 0 ? "cần review" : "không có review tiêu cực"}
      />
      <Card
        label="Positive / Negative"
        value={
          <span className="whitespace-nowrap">
            <span className="text-emerald-600">{posPct}%</span>
            <span className="mx-1.5 text-slate-400">·</span>
            <span className="text-red-600">{negPct}%</span>
          </span>
        }
        delta="tổng bộ dữ liệu"
      />
    </div>
  );
}
