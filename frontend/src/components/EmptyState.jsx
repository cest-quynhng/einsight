import React from "react";

export default function EmptyState({
  title = "Chưa có dữ liệu",
  subtext = "",
  icon,
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg px-6 py-16 text-center"
      style={{ backgroundColor: "var(--surface-muted)", border: "0.5px dashed var(--hair)" }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white"
        style={{ border: "0.5px solid var(--hair)" }}
      >
        {icon || (
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19H9l-4 3v-3H5.5A2.5 2.5 0 013 16.5v-9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 13h5" />
          </svg>
        )}
      </div>
      <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
      {subtext && <p className="mt-1 text-[13px] text-slate-500">{subtext}</p>}
    </div>
  );
}
