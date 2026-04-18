export const ALLOWED_TAGS = [
  "Content",
  "Perceived Benefit",
  "Features",
  "UI/UX",
  "Usability",
  "User's feeling",
  "Performance",
  "Price",
  "CS",
  "Account",
  "Subscription",
];

// Tailwind classes for tag pills
export const TAG_STYLES = {
  Content: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  "Perceived Benefit": "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
  Features: "bg-teal-100 text-teal-800 ring-1 ring-teal-200",
  "UI/UX": "bg-purple-100 text-purple-800 ring-1 ring-purple-200",
  Usability: "bg-green-100 text-green-800 ring-1 ring-green-200",
  "User's feeling": "bg-pink-100 text-pink-800 ring-1 ring-pink-200",
  Performance: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  Price: "bg-red-100 text-red-800 ring-1 ring-red-200",
  Subscription: "bg-red-100 text-red-800 ring-1 ring-red-200",
  CS: "bg-gray-100 text-gray-800 ring-1 ring-gray-200",
  Account: "bg-slate-100 text-slate-800 ring-1 ring-slate-200",
};

export const SENTIMENT_STYLES = {
  Happy: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  Mixed: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  Unhappy: "bg-red-100 text-red-800 ring-1 ring-red-200",
};

export const DATE_FILTERS = [
  { value: "7", label: "7 ngày" },
  { value: "30", label: "30 ngày" },
  { value: "month", label: "Tháng này" },
  { value: "all", label: "Tất cả" },
];
