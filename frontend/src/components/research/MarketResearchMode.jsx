import React, { useMemo, useState } from "react";
import UploadSection from "../UploadSection.jsx";
import AppTabs from "../AppTabs.jsx";
import AppBar from "../AppBar.jsx";
import MetricsRow from "../MetricsRow.jsx";
import CategoryBars from "../CategoryBars.jsx";
import AIInsight from "../AIInsight.jsx";
import ReviewsTable from "../ReviewsTable.jsx";
import CompetitorTable from "../CompetitorTable.jsx";
import ExportBar from "../ExportBar.jsx";
import EmptyState from "../EmptyState.jsx";

function filterByDate(reviews, mode) {
  if (!reviews || mode === "all") return reviews || [];
  const now = new Date();
  const cutoff = new Date(now);
  if (mode === "7") cutoff.setDate(now.getDate() - 7);
  else if (mode === "30") cutoff.setDate(now.getDate() - 30);
  else if (mode === "month") cutoff.setDate(1);
  return reviews.filter((r) => {
    if (!r.date) return true;
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) return true;
    return d >= cutoff;
  });
}

function recomputeStats(data, filtered) {
  const pos = filtered.filter((r) => r.sentiment === "Happy").length;
  const neg = filtered.filter((r) => r.sentiment === "Unhappy").length;
  const mix = filtered.filter((r) => r.sentiment === "Mixed").length;
  const ratings = filtered.map((r) => r.rating).filter((x) => x);
  const avg = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100
    : 0;
  const posCat = {};
  const negCat = {};
  const need = { core: 0, differential: 0, addon: 0 };
  for (const r of filtered) {
    const tags = [r.tag1, r.tag2, r.tag3, r.tag4].filter(Boolean);
    for (const t of tags) {
      if (r.sentiment === "Happy") posCat[t] = (posCat[t] || 0) + 1;
      if (r.sentiment === "Unhappy") negCat[t] = (negCat[t] || 0) + 1;
    }
    if (r.need_type === "Core Needs") need.core++;
    else if (r.need_type === "Differential Needs") need.differential++;
    else if (r.need_type === "Add-on Needs") need.addon++;
  }
  return {
    ...data,
    total: filtered.length,
    positive_count: pos,
    negative_count: neg,
    mixed_count: mix,
    avg_rating: avg,
    positive_by_category: posCat,
    negative_by_category: negCat,
    need_type_breakdown: need,
    reviews: filtered,
  };
}

export default function MarketResearchMode({
  tabs,
  activeId,
  setActiveId,
  onCsv,
  onUrl,
  onCloseTab,
  busy,
}) {
  const [dateFilter, setDateFilter] = useState("all");

  const activeTab = tabs.find((t) => t.id === activeId);
  const activeData = activeTab?.data;

  const filteredReviews = useMemo(
    () => filterByDate(activeData?.reviews, dateFilter),
    [activeData, dateFilter]
  );

  const filteredStats = useMemo(() => {
    if (!activeData) return null;
    if (dateFilter === "all") return activeData;
    return recomputeStats(activeData, filteredReviews);
  }, [activeData, filteredReviews, dateFilter]);

  function handleAddTab() {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-5">
      <section id="upload">
        <UploadSection onCsv={onCsv} onUrl={onUrl} busy={busy} />
      </section>

      <section id="analysis" className="space-y-5">
        <AppTabs
          tabs={tabs}
          activeId={activeId}
          onSelect={setActiveId}
          onClose={onCloseTab}
          onAdd={handleAddTab}
        />

        {tabs.length === 0 ? (
          <EmptyState
            title="Chưa có app nào"
            subtext="Thêm app đầu tiên để bắt đầu phân tích"
          />
        ) : !activeData ? (
          <EmptyState
            title="Chưa có dữ liệu cho tab này"
            subtext="Upload CSV hoặc dán link để phân tích"
          />
        ) : (
          <>
            <AppBar
              data={activeData}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
            />
            <MetricsRow stats={filteredStats} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <CategoryBars
                title="Positive — theo category"
                data={filteredStats.positive_by_category}
                total={filteredStats.positive_count}
                positive
                needBreakdown={filteredStats.need_type_breakdown}
              />
              <CategoryBars
                title="Negative — theo category"
                data={filteredStats.negative_by_category}
                total={filteredStats.negative_count}
                positive={false}
                needBreakdown={filteredStats.need_type_breakdown}
              />
            </div>

            <AIInsight text={activeData.ai_insight} />

            <ReviewsTable reviews={filteredStats.reviews} />
          </>
        )}
      </section>

      <section id="compare">
        <CompetitorTable tabs={tabs} activeId={activeId} onAddCompetitor={handleAddTab} />
      </section>

      {activeData && <ExportBar data={activeData} />}
    </div>
  );
}
