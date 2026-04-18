import React from "react";

export default function ProgressOverlay({ label, done, total }) {
  if (!label) return null;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div
        className="w-[min(90vw,420px)] rounded-lg bg-white p-6 shadow-card"
        style={{ border: "0.5px solid var(--hair)" }}
      >
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
          <div className="text-sm font-medium text-slate-900">{label}</div>
        </div>
        {total > 0 && (
          <>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Đang phân tích {done}/{total} reviews... ({pct}%)
            </div>
          </>
        )}
      </div>
    </div>
  );
}
