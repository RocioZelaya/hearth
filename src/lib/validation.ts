import { z } from "zod";
import { parsePaymentUrl } from "./payment-links";

/** Character limits shared by the form (live counters) and the server. */
export const LIMITS = {
  title: 60,
  body: 280,
  authorName: 30,
  paymentUrl: 500,
} as const;

/** Collapses runs of blank lines and trailing spaces so notes stay tidy. */
export function tidyText(input: string): string {
  return input
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Single-line fields: any whitespace run (including newlines) becomes one space. */
export function oneLine(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export const noteInputSchema = z.object({
  title: z
    .string()
    .transform(oneLine)
    .pipe(
      z
        .string()
        .min(3, { error: "give it a title, at least a few letters." })
        .max(LIMITS.title, { error: `titles stop at ${LIMITS.title} characters.` }),
    ),
  body: z
    .string()
    .transform(tidyText)
    .pipe(
      z
        .string()
        .min(10, { error: "say a little more about what you need." })
        .max(LIMITS.body, { error: `notes stop at ${LIMITS.body} characters.` }),
    ),
  authorName: z
    .string()
    .transform(oneLine)
    .pipe(z.string().max(LIMITS.authorName, { error: `names stop at ${LIMITS.authorName} characters.` }))
    .transform((v) => (v.length ? v : null)),
  paymentUrl: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(LIMITS.paymentUrl, { error: "that link is too long." }))
    .transform((raw, ctx) => {
      const parsed = parsePaymentUrl(raw);
      if (!parsed.ok) {
        ctx.addIssue({ code: "custom", message: parsed.reason });
        return z.NEVER;
      }
      return parsed;
    }),
  /** Honeypot. Real people never see this field, so it must stay empty. */
  website: z.string().max(0),
});

export type NoteInput = z.infer<typeof noteInputSchema>;
export type NoteField = "title" | "body" | "authorName" | "paymentUrl";

/** Reads the fields we care about out of a FormData, as plain strings. */
export function formToNoteInput(formData: FormData): Record<NoteField | "website", string> {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  return {
    title: text("title"),
    body: text("body"),
    authorName: text("authorName"),
    paymentUrl: text("paymentUrl"),
    website: text("website"),
  };
}
