import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { detectProvider, type Provider } from "./payment-links";

export const NOTES_PER_PAGE = 36;

/** Reports needed before a note is taken off the fridge. */
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

export async function getNote(id: string): Promise<PublicNote | null> {
  const row = await db.note.findFirst({ where: { id, hidden: false }, select: publicSelect });
  return row ? toPublic(row) : null;
}

/** The stored provider is a plain string; recompute rather than trust it. */
function toPublic(row: PublicRow): PublicNote {
  return { ...row, provider: detectProvider(row.paymentUrl) };
}
