// Frontend analytics helpers — no backend changes.

export function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function mostRecentReviewDate(reviews) {
  let max = null;
  for (const r of reviews || []) {
    const d = parseDate(r.date);
    if (d && (!max || d > max)) max = d;
  }
  return max;
}

// Use wall-clock "now" if any review is within 48h, otherwise anchor to newest
// review so historical CSV demos still have something to show.
export function effectiveNow(reviews) {
  const now = new Date();
  const newest = mostRecentReviewDate(reviews);
  if (!newest) return now;
  const ageMs = now.getTime() - newest.getTime();
  if (ageMs < 48 * 3600 * 1000) return now;
  return newest;
}

export function filterWindow(reviews, anchor, hours) {
  if (!reviews || !anchor) return [];
  const cutoff = new Date(anchor.getTime() - hours * 3600 * 1000);
  return reviews.filter((r) => {
    const d = parseDate(r.date);
    return d && d >= cutoff && d <= anchor;
  });
}

export function groupByTag(reviews, sentimentFilter) {
  const buckets = {};
  for (const r of reviews || []) {
    if (sentimentFilter && r.sentiment !== sentimentFilter) continue;
    const tags = [r.tag1, r.tag2, r.tag3, r.tag4].filter(Boolean);
    for (const t of tags) {
      if (!buckets[t]) buckets[t] = { count: 0, needCounts: {} };
      buckets[t].count += 1;
      if (r.need_type) {
        buckets[t].needCounts[r.need_type] =
          (buckets[t].needCounts[r.need_type] || 0) + 1;
      }
    }
  }
  return Object.entries(buckets)
    .map(([tag, { count, needCounts }]) => {
      const needType =
        Object.entries(needCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      return { tag, count, needType };
    })
    .sort((a, b) => b.count - a.count);
}

export function avgRating(reviews) {
  const ratings = (reviews || []).map((r) => Number(r.rating) || 0).filter((x) => x > 0);
  if (ratings.length === 0) return 0;
  return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100;
}

export function formatAgo(date) {
  if (!date) return "—";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "vừa xong";
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  return `${months} tháng trước`;
}

export function formatDateShort(date) {
  if (!date) return "—";
  const d = typeof date === "string" ? parseDate(date) : date;
  if (!d) return "—";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
