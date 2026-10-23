import { describe, expect, it } from "vitest";
import { LIMITS, formToNoteInput, noteInputSchema, oneLine, tidyText } from "./validation";

const valid = {
  title: "a second-hand espresso machine",
  body: "the old one gives up by nine every morning.",
  authorName: "lucía",
  paymentUrl: "paypal.me/lucia",
  website: "",
};

describe("noteInputSchema", () => {
  it("accepts a good note and normalises the link", () => {
    const result = noteInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.paymentUrl).toEqual({ ok: true, url: "https://paypal.me/lucia", provider: "paypal" });
    expect(result.data.authorName).toBe("lucía");
  });

  it("turns an empty name into null", () => {
    const result = noteInputSchema.safeParse({ ...valid, authorName: "   " });
    expect(result.success && result.data.authorName).toBeNull();
  });

  it("enforces the character limits", () => {
    const tooLong = noteInputSchema.safeParse({ ...valid, title: "x".repeat(LIMITS.title + 1) });
    expect(tooLong.success).toBe(false);
    const tooShort = noteInputSchema.safeParse({ ...valid, body: "short" });
    expect(tooShort.success).toBe(false);
  });

  it("reports a bad payment link on its own field", () => {
    const result = noteInputSchema.safeParse({ ...valid, paymentUrl: "http://paypal.me/x" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].path).toEqual(["paymentUrl"]);
  });

  it("fails when the honeypot is filled", () => {
    const result = noteInputSchema.safeParse({ ...valid, website: "http://spam" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.some((i) => i.path[0] === "website")).toBe(true);
  });

  it("caps the payment link length before parsing it", () => {
    const result = noteInputSchema.safeParse({
      ...valid,
      paymentUrl: `https://paypal.me/${"a".repeat(LIMITS.paymentUrl)}`,
    });
    expect(result.success).toBe(false);
  });
});

describe("formToNoteInput", () => {
  it("reads strings and ignores files or missing keys", () => {
    const fd = new FormData();
    fd.set("title", "hello");
    fd.set("body", new Blob(["x"]), "x.txt");
    expect(formToNoteInput(fd)).toEqual({ title: "hello", body: "", authorName: "", paymentUrl: "", website: "" });
  });
});

describe("tidyText", () => {
  it("collapses blank lines and trailing spaces", () => {
    expect(tidyText("one  \r\n\r\n\r\n\r\ntwo \n")).toBe("one\n\ntwo");
  });

  it("keeps single blank lines and inner spacing", () => {
    expect(tidyText("a b\n\nc  d")).toBe("a b\n\nc  d");
    expect(tidyText("   ")).toBe("");
  });
});

describe("oneLine", () => {
  it("flattens newlines and runs of spaces", () => {
    expect(oneLine("  a\n\n b\t c  ")).toBe("a b c");
  });

  it("is applied to title and name", () => {
    const result = noteInputSchema.safeParse({ ...valid, title: "two\nlines here", authorName: "ana\nmaria" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.title).toBe("two lines here");
    expect(result.data.authorName).toBe("ana maria");
  });
});
