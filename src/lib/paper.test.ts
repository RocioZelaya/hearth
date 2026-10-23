import { describe, expect, it } from "vitest";
import { paperClasses, paperLook } from "./paper";

describe("paperLook", () => {
  it("is deterministic per id", () => {
    expect(paperLook("abc")).toEqual(paperLook("abc"));
  });

  it("never pins or tapes a sticky note", () => {
    for (let i = 0; i < 200; i++) {
      const look = paperLook(`note-${i}`);
      if (look.sheet.startsWith("sticky")) expect(look.holder).toBe("none");
      else expect(look.holder).not.toBe("none");
      expect(Math.abs(look.tilt)).toBeLessThanOrEqual(3);
    }
  });

  it("spreads notes across several looks", () => {
    const sheets = new Set(Array.from({ length: 60 }, (_, i) => paperLook(`n${i}`).sheet));
    expect(sheets.size).toBeGreaterThanOrEqual(5);
  });

  it("builds class names", () => {
    expect(paperClasses({ sheet: "ruled", holder: "tape", tilt: 0 })).toBe("paper sheet-ruled holder-tape");
  });
});
