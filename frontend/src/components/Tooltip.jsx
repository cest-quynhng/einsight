import React, { useState } from "react";

export default function Tooltip({ children, content, width = "w-80" }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <div
          className={
            "absolute right-0 top-full z-30 mt-2 " +
            width +
            " rounded-lg bg-slate-900 px-3.5 py-3 text-xs leading-relaxed text-white shadow-xl"
          }
        >
          {content}
        </div>
      )}
    </span>
  );
}

export function InfoIcon({ className = "" }) {
  return (
    <svg
      className={"h-4 w-4 text-slate-400 hover:text-slate-600 " + className}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9 9a1 1 0 000 2h.25v3a1 1 0 001 1H11a1 1 0 100-2h-.25v-3A1 1 0 009.75 9H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function TooltipChecklist({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2">
          <span
            className={
              "mt-[1px] inline-flex h-4 w-4 flex-none items-center justify-center rounded-full text-[10px] font-bold " +
              (it.kind === "good"
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-amber-500/20 text-amber-300")
            }
          >
            {it.kind === "good" ? "✓" : "!"}
          </span>
          <span className="text-slate-100">{it.text}</span>
        </li>
      ))}
    </ul>
  );
}
