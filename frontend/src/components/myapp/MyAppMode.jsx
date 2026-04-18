import React, { useMemo } from "react";
import CompactUploadBar from "./CompactUploadBar.jsx";
import DailyAlert from "./DailyAlert.jsx";
import DailyMetrics from "./DailyMetrics.jsx";
import TagBarList from "./TagBarList.jsx";
import DailyDigest from "./DailyDigest.jsx";
import ReviewsFeed from "./ReviewsFeed.jsx";
import EmptyState from "../EmptyState.jsx";
import {
  effectiveNow,
  filterWindow,
  mostRecentReviewDate,
  formatAgo,
  groupByTag,
  avgRating,
} from "../../lib/analyze.js";

const REVIEWS_ID = "myapp-reviews";

function pickSuggestion(topNegTag) {
  if (!topNegTag) return "Tiếp tục theo dõi review mới";
  const map = {
    Performance: "Kiểm tra crash logs và tối ưu app khởi động",
    "UI/UX": "Review UI flows bị than nhiều nhất, prioritize fix",
    Features: "Ưu tiên roadmap các feature bị complain",
    Price: "Xem lại pricing / promotion",
    Subscription: "Review subscription flow và billing issues",
    CS: "Kiểm tra response time và quality của CS team",
    Usability: "Simplify onboarding hoặc workflows phức tạp",
    Account: "Fix login/register/recovery issues",
    Content: "Audit content quality hoặc update thêm",
  };
  return map[topNegTag] || `Đào sâu vào các review tag "${topNegTag}"`;
}

export default function MyAppMode({ primary, onCsv, onUrl, onUpdate, onChangeApp, busy }) {
  const data = primary?.data;
  const reviews = data?.reviews || [];

  const anchor = useMemo(() => effectiveNow(reviews), [reviews]);
  const newest = useMemo(() => mostRecentReviewDate(reviews), [reviews]);
  const last24 = useMemo(() => filterWindow(reviews, anchor, 24), [reviews, anchor]);
  const negatives24 = useMemo(() => last24.filter((r) => r.sentiment === "Unhappy"), [last24]);

  const ratingRecent = useMemo(() => avgRating(last24), [last24]);
  const negTags = useMemo(() => groupByTag(reviews, "Unhappy"), [reviews]);
  const posTags = useMemo(() => groupByTag(reviews, "Happy"), [reviews]);

  const topNegTag = negTags[0]?.tag || null;
  const topPosTag = posTags[0]?.tag || null;

  const total = reviews.length || 1;
  const posPct = Math.round(((data?.positive_count || 0) / total) * 100);
  const negPct = Math.round(((data?.negative_count || 0) / total) * 100);

  const lowStarNew = negatives24.filter((r) => (r.rating || 0) <= 2);
  const topTagInNew = lowStarNew.length
    ? Object.entries(
        lowStarNew.reduce((acc, r) => {
          const t = r.tag1 || r.tag2;
          if (t) acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  function scrollToReviews() {
    document.getElementById(REVIEWS_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-5">
      <CompactUploadBar
        primary={primary}
        onCsv={onCsv}
        onUrl={onUrl}
        onUpdate={onUpdate}
        onChangeApp={onChangeApp}
        busy={busy}
      />

      {!data ? (
        <EmptyState
          title="Chưa có dữ liệu cho app của bạn"
          subtext="Upload CSV từ Sensor Tower hoặc dán link app để bắt đầu"
        />
      ) : (
        <>
          <DailyAlert
            newNegatives={lowStarNew.length}
            topTag={topTagInNew}
            onClick={scrollToReviews}
          />

          <DailyMetrics
            ratingRecent={ratingRecent || data.avg_rating}
            newCount24h={last24.length}
            negative24h={negatives24.length}
            posPct={posPct}
            negPct={negPct}
            anchorHint={
              newest
                ? `dữ liệu mới nhất ${formatAgo(newest)}`
                : undefined
            }
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TagBarList
              title="Pain points cần xử lý"
              rows={negTags}
              total={data.negative_count || 0}
              positive={false}
              showNeed
            />
            <TagBarList
              title="Điểm mạnh người dùng khen"
              rows={posTags}
              total={data.positive_count || 0}
              positive
              showNeed={false}
            />
          </div>

          <DailyDigest
            newCount={last24.length}
            topNegative={topNegTag}
            topPositive={topPosTag}
            suggestion={pickSuggestion(topNegTag)}
            aiText={data.ai_insight}
          />

          <ReviewsFeed reviews={reviews} defaultLowStars scrollTargetId={REVIEWS_ID} />
        </>
      )}
    </div>
  );
}
