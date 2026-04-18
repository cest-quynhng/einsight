import React from "react";

const MODES = [
  { id: "myapp", label: "My App" },
  { id: "research", label: "Market Research" },
];

export default function ModeSwitcher({ mode, onChange }) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-md p-0.5"
      style={{ backgroundColor: "var(--surface-muted)", border: "0.5px solid var(--hair)" }}
    >
      {MODES.map((m) => {
        const active = m.id === mode;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={
              "rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition " +
              (active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800")
            }
            style={active ? { border: "0.5px solid var(--hair)" } : {}}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
