import React from "react";

function Card({ label, value, delta, accent }) {
  return (
    <div className="rounded-lg bg-surface-muted p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={"mt-2 text-[20px] font-medium leading-tight " + (accent || "text-slate-900")}>
        {value}
      </div>
      {delta && <div className="mt-1 text-[11px] text-slate-500">{delta}</div>}
    </div>
  );
}

export default function MetricsRow({ stats }) {
  if (!stats) return null;
  const total = stats.total || 0;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card
        label="Total reviews"
        value={total.toLocaleString()}
        delta={stats.platform === "csv" ? "from Sensor Tower" : "from store scrape"}
      />
      <Card
        label="Positive %"
        value={`${pct(stats.positive_count)}%`}
        accent="text-emerald-600"
        delta={`${(stats.positive_count || 0).toLocaleString()} happy reviews`}
      />
      <Card
        label="Negative %"
        value={`${pct(stats.negative_count)}%`}
        accent="text-red-600"
        delta={`${(stats.negative_count || 0).toLocaleString()} unhappy reviews`}
      />
      <Card
        label="Avg rating"
        value={
          <span>
            {stats.avg_rating?.toFixed ? stats.avg_rating.toFixed(2) : stats.avg_rating}
            <span className="ml-1 text-amber-500">★</span>
          </span>
        }
        accent="text-slate-900"
        delta={`${stats.mixed_count || 0} mixed reviews`}
      />
    </div>
  );
}
