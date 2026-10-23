const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "just now", "three hours ago", "two days ago", then a lowercase short date. */
export function relativeTime(date: Date, now: Date = new Date()): string {
  const diff = now.getTime() - date.getTime();
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return ago(Math.floor(diff / MINUTE), "minute");
  if (diff < DAY) return ago(Math.floor(diff / HOUR), "hour");
  if (diff < 7 * DAY) return ago(Math.floor(diff / DAY), "day");
  return shortDate(date);
}

/** "oct 20, 2026" */
export function shortDate(date: Date): string {
  return date
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toLowerCase();
}

const SMALL_NUMBERS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

/** Numbers up to twenty are written out, like someone would by hand. */
export function spellNumber(n: number): string {
  return SMALL_NUMBERS[n] ?? String(n);
}

/** "one note" / "seven notes". */
export function countNoun(n: number, noun: string): string {
  return `${spellNumber(n)} ${noun}${n === 1 ? "" : "s"}`;
}

function ago(n: number, unit: string): string {
  if (n === 1) return `${unit === "hour" ? "an" : "a"} ${unit} ago`;
  return `${spellNumber(n)} ${unit}s ago`;
}
