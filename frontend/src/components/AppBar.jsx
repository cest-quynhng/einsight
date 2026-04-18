import React from "react";
import { DATE_FILTERS } from "../constants.js";
import { exportCsv } from "../api.js";

function StoreBadge({ platform }) {
  const map = {
    appstore: { label: "App Store", cls: "bg-slate-900 text-white" },
    googleplay: { label: "Google Play", cls: "bg-emerald-600 text-white" },
    csv: { label: "CSV", cls: "bg-brand-50 text-brand-700" },
  };
  const m = map[platform] || { label: platform || "—", cls: "bg-surface-muted text-slate-700" };
  return <span className={"pill " + m.cls}>{m.label}</span>;
}

export default function AppBar({ data, dateFilter, onDateFilterChange }) {
  const total = data?.total || 0;
  const source = data?.platform === "csv" ? "Sensor Tower CSV" : "Store scrape";

  async function onExport() {
    if (!data) return;
    try {
      await exportCsv(data);
    } catch (e) {
      alert("Lỗi xuất CSV: " + e.message);
    }
  }

  return (
    <div className="card flex flex-wrap items-center gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[15px] font-semibold text-slate-900">
              {data?.app_name || "—"}
            </h2>
            <StoreBadge platform={data?.platform} />
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {total.toLocaleString()} reviews · {source}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">Khoảng thời gian</label>
        <select
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className="input !py-1.5 !pl-2.5 !pr-8 text-sm"
          style={{ width: "auto" }}
        >
          {DATE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button onClick={onExport} className="btn-secondary" disabled={!data}>
          Xuất CSV
        </button>
      </div>
    </div>
  );
}
