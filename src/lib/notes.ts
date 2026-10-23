import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { parsePaymentUrl, type Provider } from "./payment-links";

export const NOTES_PER_PAGE = 36;

/** Reports needed before a note is taken away from the fire. */
export const HIDE_AFTER_REPORTS = 5;

/** What the UI is allowed to see of a note. Never the ipHash, reports or hidden. */
const publicSelect = {
  id: true,
  title: true,
  body: true,
  authorName: true,
  paymentUrl: true,
  provider: true,
  createdAt: true,
} satisfies Prisma.NoteSelect;

type PublicRow = Prisma.NoteGetPayload<{ select: typeof publicSelect }>;

export type PublicNote = Omit<PublicRow, "provider"> & { provider: Provider };

export type NotePage = {
  notes: PublicNote[];
  total: number;
  pages: number;
  /** The page actually served (clamped to the last one). */
  page: number;
};

export async function listNotes(requestedPage: number): Promise<NotePage> {
  const total = await db.note.count({ where: { hidden: false } });
  const pages = Math.max(1, Math.ceil(total / NOTES_PER_PAGE));
  const page = Math.min(Math.max(1, Math.floor(requestedPage) || 1), pages);

  const rows = await db.note.findMany({
    where: { hidden: false },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * NOTES_PER_PAGE,
    take: NOTES_PER_PAGE,
    select: publicSelect,
  });

  return { notes: rows.map(toPublic), total, pages, page };
}

/** Memoised per request: metadata and the page both ask for the same note. */
export const getNote = cache(async (id: string): Promise<PublicNote | null> => {
  const row = await db.note.findFirst({ where: { id, hidden: false }, select: publicSelect });
  return row ? toPublic(row) : null;
});

/** Never trust a stored row blindly: re-validate the link and recompute the provider. */
function toPublic(row: PublicRow): PublicNote {
  const parsed = parsePaymentUrl(row.paymentUrl);
  const paymentUrl = parsed.ok ? parsed.url : "https://example.invalid/";
  return { ...row, paymentUrl, provider: parsed.ok ? parsed.provider : "other" };
}
