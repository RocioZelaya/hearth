import { describe, expect, it } from "vitest";
import { relativeTime, shortDate } from "./time";

const now = new Date("2026-10-20T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("relativeTime", () => {
  it("says just now under a minute, including future dates", () => {
    expect(relativeTime(ago(59 * SECOND), now)).toBe("just now");
    expect(relativeTime(ago(-5 * MINUTE), now)).toBe("just now");
  });

  it("switches units at the boundaries and pluralises", () => {
    expect(relativeTime(ago(MINUTE), now)).toBe("1 minute ago");
    expect(relativeTime(ago(59 * MINUTE), now)).toBe("59 minutes ago");
    expect(relativeTime(ago(HOUR), now)).toBe("1 hour ago");
    expect(relativeTime(ago(23 * HOUR), now)).toBe("23 hours ago");
    expect(relativeTime(ago(DAY), now)).toBe("1 day ago");
    expect(relativeTime(ago(6 * DAY), now)).toBe("6 days ago");
  });

  it("falls back to a lowercase short date after a week", () => {
    expect(relativeTime(ago(7 * DAY), now)).toBe(shortDate(ago(7 * DAY)));
    expect(shortDate(now)).toMatch(/^oct \d{1,2}, 2026$/);
  });
});
