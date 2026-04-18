import React from "react";

export default function AIInsight({ text }) {
  if (!text) return null;
  return (
    <div
      className="rounded-lg bg-surface-muted p-4"
      style={{ borderLeft: "2px solid var(--brand)" }}
    >
      <p className="text-sm leading-relaxed text-slate-800">
        <span className="mr-1 font-semibold text-brand">AI Insight:</span>
        <span className="whitespace-pre-wrap">{text}</span>
      </p>
    </div>
  );
}
