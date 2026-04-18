import React from "react";
import { ALLOWED_TAGS } from "../constants.js";

export default function CompetitorTable({ tabs, activeId, onAddCompetitor }) {
  const withData = (tabs || []).filter((t) => t.data);

  if (withData.length === 0) {
    return (
      <div
        className="rounded-lg p-8 text-center text-[13px] text-slate-500"
        style={{ backgroundColor: "var(--surface-muted)", border: "0.5px dashed var(--hair)" }}
      >
        Chưa có app nào để so sánh.
      </div>
    );
  }

  const rows = ALLOWED_TAGS.map((cat) => {
    const cells = withData.map((t) => {
      const neg = t.data.negative_by_category?.[cat] || 0;
      const total = t.data.total || 1;
      const pct = Math.round((neg / total) * 100);
      return { id: t.id, primary: !!t.primary, pct, count: neg };
    });
    return { cat, cells };
  });

  return (
    <div className="card overflow-hidden">
      <div className="hair-b p-4">
        <h3 className="text-[14px] font-semibold text-slate-900">So sánh đối thủ</h3>
        <p className="mt-0.5 text-[12px] text-slate-500">
          % negative theo category · cột <b>app của bạn</b> được highlight, ô có % cao (&gt;25%) tô đỏ.
        </p>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-[13px]">
          <thead className="section-label" style={{ backgroundColor: "var(--surface-muted)" }}>
            <tr>
              <th className="px-4 py-2.5 text-left">Category</th>
              {withData.map((t) => (
                <th
                  key={t.id}
                  className={
                    "px-4 py-2.5 text-center " +
                    (t.primary ? "bg-brand-50 text-brand-700" : "")
                  }
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="truncate">{t.app_name}</span>
                    {t.primary && <span className="pill bg-brand-100 text-brand-700">app của bạn</span>}
                  </div>
                </th>
              ))}
              <th className="px-4 py-2.5 text-center">
                <button
                  onClick={onAddCompetitor}
                  className="inline-flex flex-col items-center gap-0.5 text-[12px] font-normal text-slate-400 transition hover:text-brand"
                  title="Thêm app đối thủ"
                >
                  <span>+ Thêm app</span>
                  <span className="text-[10px] text-slate-400">đối thủ để so sánh</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.cat} style={{ borderTop: "0.5px solid var(--hair)" }}>
                <td className="px-4 py-2 font-medium text-slate-700">{row.cat}</td>
                {row.cells.map((c) => {
                  const strong = c.pct > 25;
                  const bg = c.primary ? "bg-brand-50 " : "";
                  const pctTxt = c.count === 0 ? "—" : `${c.pct}%`;
                  return (
                    <td
                      key={c.id}
                      className={"px-4 py-2 text-center " + bg + (strong ? "text-red-700" : "text-slate-700")}
                    >
                      <span
                        className={
                          strong
                            ? "inline-flex min-w-[64px] justify-center rounded-md bg-red-100 px-2 py-0.5 font-semibold"
                            : "inline-flex min-w-[64px] justify-center"
                        }
                      >
                        {pctTxt}
                        {c.count > 0 && (
                          <span className="ml-1 text-[10px] text-slate-400">({c.count})</span>
                        )}
                      </span>
                    </td>
                  );
                })}
                <td
                  className="px-4 py-2 text-center text-[11px] text-slate-300"
                  style={{ backgroundColor: "var(--surface-muted)" }}
                >
                  —
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
