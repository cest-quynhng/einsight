import React, { useRef, useState } from "react";
import Tooltip, { InfoIcon, TooltipChecklist } from "./Tooltip.jsx";

const CSV_TOOLTIP = [
  { kind: "good", text: "Full review history, no date limit" },
  { kind: "good", text: "Filter by version / date / country" },
  { kind: "good", text: "Unlimited review volume" },
  { kind: "warn", text: "Requires a Sensor Tower account" },
];

const URL_TOOLTIP = [
  { kind: "good", text: "No account needed" },
  { kind: "good", text: "Good for quick competitor check" },
  { kind: "warn", text: "Only ~200–500 most-recent reviews" },
  { kind: "warn", text: "No date / version filter" },
];

export default function UploadSection({ onCsv, onUrl, busy }) {
  const fileRef = useRef(null);
  const [url, setUrl] = useState("");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* CSV */}
      <div className="card relative p-6">
        <div className="absolute right-4 top-4">
          <Tooltip content={<TooltipChecklist items={CSV_TOOLTIP} />}>
            <button type="button" className="p-1" aria-label="CSV info">
              <InfoIcon />
            </button>
          </Tooltip>
        </div>

        <h3 className="pr-8 text-[15px] font-semibold text-slate-900">
          Upload CSV từ Sensor Tower
        </h3>
        <div className="mt-2">
          <span className="pill bg-emerald-100 text-emerald-800">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Full history · không giới hạn
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Export từ Sensor Tower theo app. Hỗ trợ lọc phiên bản, quốc gia, ngày.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onCsv(f);
              e.target.value = "";
            }}
          />
          <button
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="btn-primary"
          >
            Chọn file CSV
          </button>
          <a
            href="https://sensortower.com"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost-brand"
          >
            ↗ Mở Sensor Tower
          </a>
        </div>
      </div>

      {/* URL */}
      <div className="card relative p-6">
        <div className="absolute right-4 top-4">
          <Tooltip content={<TooltipChecklist items={URL_TOOLTIP} />}>
            <button type="button" className="p-1" aria-label="URL info">
              <InfoIcon />
            </button>
          </Tooltip>
        </div>

        <h3 className="pr-8 text-[15px] font-semibold text-slate-900">
          Dán link App Store / Google Play
        </h3>
        <div className="mt-2">
          <span className="pill bg-amber-100 text-amber-800">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            Giới hạn ~200–500 review
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Cào review gần nhất để check nhanh đối thủ, không cần tài khoản.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://apps.apple.com/..."
            className="input min-w-[18rem] flex-1"
          />
          <button
            disabled={busy || !url.trim()}
            onClick={() => onUrl(url.trim())}
            className="btn-primary"
          >
            Phân tích
          </button>
        </div>
      </div>
    </div>
  );
}
