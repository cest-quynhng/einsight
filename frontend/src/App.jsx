import React, { useState } from "react";
import ModeSwitcher from "./components/ModeSwitcher.jsx";
import MyAppMode from "./components/myapp/MyAppMode.jsx";
import MarketResearchMode from "./components/research/MarketResearchMode.jsx";
import LandingScreen from "./components/LandingScreen.jsx";
import ProgressOverlay from "./components/ProgressOverlay.jsx";
import { analyzeCsvStart, analyzeUrlStart, fetchResult, streamProgress } from "./api.js";

const MODE_KEY = "einsight_mode_chosen";

let TAB_COUNTER = 0;
function makeTab(data, { primary }) {
  TAB_COUNTER += 1;
  return {
    id: `tab_${Date.now()}_${TAB_COUNTER}`,
    app_name: data?.app_name || "App",
    primary,
    data,
  };
}

export default function App() {
  const initialChosen = typeof window !== "undefined" && window.localStorage?.getItem(MODE_KEY);
  const [mode, setMode] = useState(initialChosen || "myapp");
  const [modeChosen, setModeChosen] = useState(!!initialChosen);
  const [tabs, setTabs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ label: "", done: 0, total: 0 });
  const [error, setError] = useState("");

  const primaryTab = tabs.find((t) => t.primary) || null;

  function chooseMode(next) {
    setMode(next);
    setModeChosen(true);
    try {
      window.localStorage?.setItem(MODE_KEY, next);
    } catch {}
  }

  async function runJob(starter, label, { replacePrimary = false } = {}) {
    setError("");
    setBusy(true);
    setProgress({ label, done: 0, total: 0 });
    try {
      const { job_id } = await starter();
      const es = streamProgress(job_id, ({ status, done, total }) => {
        setProgress((p) => ({ ...p, done, total }));
        if (status === "done" || status === "error") {
          es.close();
          if (status === "error") {
            setBusy(false);
            setProgress({ label: "", done: 0, total: 0 });
            setError("Phân tích thất bại.");
            return;
          }
          fetchResult(job_id)
            .then((data) => {
              setTabs((prev) => {
                if (replacePrimary && prev.some((t) => t.primary)) {
                  const updated = prev.map((t) =>
                    t.primary ? { ...t, app_name: data.app_name || t.app_name, data } : t
                  );
                  const p = updated.find((t) => t.primary);
                  if (p) setActiveId(p.id);
                  return updated;
                }
                const primary = !prev.some((t) => t.primary);
                const tab = makeTab(data, { primary });
                setActiveId(tab.id);
                return [...prev, tab];
              });
            })
            .catch((e) => setError(e.message || String(e)))
            .finally(() => {
              setBusy(false);
              setProgress({ label: "", done: 0, total: 0 });
            });
        }
      });
    } catch (e) {
      setBusy(false);
      setProgress({ label: "", done: 0, total: 0 });
      setError(e.message || String(e));
    }
  }

  const handleCsv = (file) => runJob(() => analyzeCsvStart(file), "Đang xử lý CSV...");
  const handleUrl = (url) => runJob(() => analyzeUrlStart(url, 500), "Đang cào reviews...");
  const handleUpdatePrimary = (file) =>
    runJob(() => analyzeCsvStart(file), "Đang cập nhật CSV...", { replacePrimary: true });

  function handleChangeApp() {
    setTabs((prev) => {
      const remaining = prev.filter((t) => !t.primary);
      if (remaining.length > 0 && !remaining.some((t) => t.primary)) {
        remaining[0] = { ...remaining[0], primary: true };
      }
      setActiveId(remaining[0]?.id || null);
      return remaining;
    });
  }

  function handleCloseTab(id) {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length > 0 && !next.some((t) => t.primary)) {
        next[0] = { ...next[0], primary: true };
      }
      if (id === activeId) setActiveId(next[0]?.id || null);
      return next;
    });
  }

  return (
    <div className="min-h-screen">
      <header className="hair-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold text-brand-300"
              style={{ backgroundColor: "#0B1220", border: "0.5px solid var(--hair)" }}
            >
              eI
            </div>
            <div>
              <h1 className="text-[16px] font-semibold leading-tight text-slate-900">
                e<span className="text-brand">Insight</span>
              </h1>
              <p className="text-[12px] text-slate-500">App Review Intelligence · eUp Group</p>
            </div>
          </div>
          <ModeSwitcher mode={mode} onChange={chooseMode} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        {error && (
          <div
            className="rounded-md bg-red-50 px-4 py-3 text-[13px] text-red-700"
            style={{ border: "0.5px solid #fecaca" }}
          >
            {error}
          </div>
        )}

        {!modeChosen && tabs.length === 0 ? (
          <LandingScreen onPick={chooseMode} />
        ) : mode === "myapp" ? (
          <MyAppMode
            primary={primaryTab}
            onCsv={handleCsv}
            onUrl={handleUrl}
            onUpdate={handleUpdatePrimary}
            onChangeApp={handleChangeApp}
            busy={busy}
          />
        ) : (
          <MarketResearchMode
            tabs={tabs}
            activeId={activeId}
            setActiveId={setActiveId}
            onCsv={handleCsv}
            onUrl={handleUrl}
            onCloseTab={handleCloseTab}
            busy={busy}
          />
        )}
      </main>

      <ProgressOverlay label={progress.label} done={progress.done} total={progress.total} />
    </div>
  );
}
