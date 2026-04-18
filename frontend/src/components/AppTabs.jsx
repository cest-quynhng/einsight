import React from "react";

export default function AppTabs({ tabs, activeId, onSelect, onClose, onAdd }) {
  return (
    <div className="hair-b flex items-center gap-2 pb-3">
      <div className="scrollbar-thin flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-2">
        {tabs.map((t) => {
          const active = t.id === activeId;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={
                "group inline-flex flex-none items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition " +
                (active
                  ? "bg-brand text-white shadow-card"
                  : "bg-white text-slate-700 hover:bg-surface-muted")
              }
              style={!active ? { border: "0.5px solid var(--hair)" } : {}}
            >
              <span className="max-w-[14rem] truncate">{t.app_name}</span>
              {t.primary && (
                <span
                  className={
                    "pill flex-none " +
                    (active
                      ? "bg-white/20 text-white"
                      : "bg-brand-50 text-brand-700")
                  }
                >
                  app của bạn
                </span>
              )}
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(t.id);
                }}
                className={
                  "ml-0.5 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full text-[12px] leading-none " +
                  (active
                    ? "text-white/70 hover:bg-white/15"
                    : "text-slate-400 hover:bg-slate-200")
                }
                aria-label="Close tab"
              >
                ×
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onAdd}
        className="btn-secondary flex-none"
        title="Thêm app để so sánh"
      >
        + Thêm app
      </button>
    </div>
  );
}
