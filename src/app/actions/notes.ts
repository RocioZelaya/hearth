"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { HIDE_AFTER_REPORTS } from "@/lib/notes";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getVisitorHash } from "@/lib/request";
import { formToNoteInput, noteInputSchema, type NoteField } from "@/lib/validation";

export type CreateNoteState = {
  error?: string;
  fieldErrors?: Partial<Record<NoteField, string>>;
} | null;

/** Pins a new note to the hearth, then sends the author to see it. */
export async function createNote(_prev: CreateNoteState, formData: FormData): Promise<CreateNoteState> {
  const parsed = noteInputSchema.safeParse(formToNoteInput(formData));

  if (!parsed.success) {
    const fieldErrors: Partial<Record<NoteField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "website") {
        // Honeypot tripped: pretend it worked, store nothing.
        redirect("/hearth");
      }
      if (isNoteField(field) && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { fieldErrors };
  }

  const ipHash = await getVisitorHash();
  if (!(await consumeRateLimit(ipHash, "createNote"))) {
    return { error: "that's a few notes in a row. give the fire ten minutes and try again." };
  }

  const { title, body, authorName, paymentUrl } = parsed.data;
  const note = await db.note.create({
    data: {
      title,
      body,
      authorName,
      paymentUrl: paymentUrl.url,
      provider: paymentUrl.provider,
      ipHash,
    },
    select: { id: true },
  });

  redirect(`/hearth?new=${note.id}`);
}

export type ReportResult = { ok: true } | { ok: false; error: string };

/** One report per visitor per note. Enough reports take the note down. */
export async function reportNote(noteId: string): Promise<ReportResult> {
  if (typeof noteId !== "string" || noteId.length === 0 || noteId.length > 64) {
    return { ok: false, error: "that note doesn't exist." };
  }

  const ipHash = await getVisitorHash();
  if (!(await consumeRateLimit(ipHash, "reportNote"))) {
    return { ok: false, error: "too many reports for now." };
  }

  const existing = await db.report.findUnique({ where: { noteId_ipHash: { noteId, ipHash } } });
  if (existing) return { ok: true };

  const note = await db.note.findUnique({ where: { id: noteId }, select: { id: true } });
  if (!note) return { ok: false, error: "that note doesn't exist." };

  try {
    await db.$transaction(async (tx) => {
      await tx.report.create({ data: { noteId, ipHash } });
      const updated = await tx.note.update({
        where: { id: noteId },
        data: { reports: { increment: 1 } },
        select: { reports: true },
      });
      if (updated.reports >= HIDE_AFTER_REPORTS) {
        await tx.note.update({ where: { id: noteId }, data: { hidden: true } });
      }
    });
  } catch (error) {
    // Two clicks in flight: the unique (noteId, ipHash) already exists. Same outcome.
    if (isUniqueViolation(error)) return { ok: true };
    throw error;
  }

  // Every page reads the database at request time (inside Suspense), so nothing to revalidate.
  return { ok: true };
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function isNoteField(value: unknown): value is NoteField {
  return value === "title" || value === "body" || value === "authorName" || value === "paymentUrl";
}
