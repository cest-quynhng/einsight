import React, { useRef, useState } from "react";
import { formatAgo, mostRecentReviewDate } from "../../lib/analyze.js";

export default function CompactUploadBar({ primary, onCsv, onUrl, onUpdate, onChangeApp, busy }) {
  const fileRef = useRef(null);
  const updateRef = useRef(null);
  const [url, setUrl] = useState("");

  const hasData = !!primary?.data;
  const data = primary?.data;
  const newest = hasData ? mostRecentReviewDate(data.reviews) : null;
  const sourceLabel =
    data?.platform === "csv" ? "CSV" : data?.platform === "appstore" ? "App Store" : data?.platform === "googleplay" ? "Google Play" : data?.platform || "scrape";

  return (
    <div className="card flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="section-label">Nguồn dữ liệu:</span>

      {hasData ? (
        <>
          <span className="text-[13px] font-medium text-slate-900">
            {data.app_name}
          </span>
          <span className="pill chip">{sourceLabel}</span>
          <span className="text-[12px] text-slate-500">
            cập nhật {formatAgo(newest)}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <input
              ref={updateRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpdate(f);
                e.target.value = "";
              }}
            />
            <button
              disabled={busy}
              onClick={() => updateRef.current?.click()}
              className="btn-secondary-sm"
            >
              Cập nhật CSV
            </button>
            <button
              disabled={busy}
              onClick={onChangeApp}
              className="btn-secondary-sm"
            >
              Đổi app
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="text-[13px] text-slate-500">Chưa có app</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
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
              className="btn-secondary-sm"
            >
              Chọn file CSV
            </button>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Dán link App Store / Google Play"
              className="input !py-1 text-[12px]"
              style={{ width: "18rem" }}
            />
            <button
              disabled={busy || !url.trim()}
              onClick={() => onUrl(url.trim())}
              className="btn-primary"
              style={{ padding: "4px 12px", fontSize: "12px" }}
            >
              Phân tích
            </button>
          </div>
        </>
      )}
    </div>
  );
}
