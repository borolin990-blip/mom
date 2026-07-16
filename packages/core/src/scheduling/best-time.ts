/**
 * Best-time-to-post heuristic. In Phase 1 this is a sensible default; once
 * publishing performance data exists (Phase 2) it becomes data-driven. Kept
 * behind a function so callers never hardcode a time.
 */
export interface TimeRecommendation {
  at: Date;
  label: string;
  reason: string;
}

const WEEKDAY = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Recommend the next good posting slot (default: tomorrow, 7:00 PM). */
export function recommendPostTime(from: Date = new Date()): TimeRecommendation {
  const at = new Date(from);
  at.setDate(at.getDate() + 1);
  at.setHours(19, 0, 0, 0);
  return {
    at,
    label: `${WEEKDAY[at.getDay()]} at 7:00 PM`,
    reason: "Weekday evenings tend to get the most engagement.",
  };
}
