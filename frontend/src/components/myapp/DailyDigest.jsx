import React from "react";

export default function DailyDigest({ newCount, topNegative, topPositive, suggestion, aiText }) {
  const body =
    `Hôm nay: ${newCount} review mới. ` +
    `Vấn đề nổi bật: ${topNegative || "—"}. ` +
    `Điểm mạnh: ${topPositive || "—"}. ` +
    `Gợi ý: ${suggestion}.`;
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: "var(--surface-muted)", borderLeft: "2px solid var(--brand)" }}
    >
      <div className="text-[13px] leading-relaxed text-slate-800">
        <span className="mr-1 font-semibold text-brand">AI Daily Digest:</span>
        {body}
      </div>
      {aiText && (
        <div className="hair-t mt-3 pt-3 text-[12px] leading-relaxed text-slate-600 whitespace-pre-wrap">
          {aiText}
        </div>
      )}
    </div>
  );
}
