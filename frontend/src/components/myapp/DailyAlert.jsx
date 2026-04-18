import React from "react";

export default function DailyAlert({ newNegatives, topTag, onClick }) {
  if (!newNegatives || newNegatives <= 0) return null;
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg bg-amber-50 px-4 py-3 text-left transition hover:bg-amber-100"
      style={{
        border: "0.5px solid #F3D397",
        borderLeftWidth: "2px",
        borderLeftColor: "#D97706",
        borderLeftStyle: "solid",
      }}
    >
      <span className="text-[13px] text-slate-800">
        <span className="mr-1.5 text-amber-700">⚠</span>
        <b>{newNegatives} review 1–2★ mới trong 24h</b>
        {topTag && <> — chủ yếu về <b className="text-slate-900">{topTag}</b></>}
        <span className="ml-2 text-brand">Xem ngay →</span>
      </span>
    </button>
  );
}
