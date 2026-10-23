import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Page } from "@/components/layout/Page";
import { NoteBoard } from "@/components/notes/NoteBoard";
import { listNotes } from "@/lib/notes";
import { countNoun } from "@/lib/time";

export const metadata: Metadata = {
  title: "the hearth",
};

export default function HearthPage({ searchParams }: PageProps<"/hearth">) {
  return (
    <Page
      width="board"
      corner={
        <Link href="/" className="quiet quiet-on-wall">
          leave a note
        </Link>
      }
    >
      <Suspense fallback={<BoardMeta>reading the notes</BoardMeta>}>
        <Board searchParams={searchParams} />
      </Suspense>
    </Page>
  );
}

async function Board({ searchParams }: Pick<PageProps<"/hearth">, "searchParams">) {
  const params = await searchParams;
  const highlightId = first(params.new);
  const { notes, total, pages, page } = await listNotes(parsePage(first(params.page)));

  if (total === 0) {
    return (
      <>
        <BoardMeta>the fire is lit. no notes yet.</BoardMeta>
        <p className="mt-24 text-center text-ivory-quiet italic">
          <Link href="/" className="quiet quiet-on-wall text-base">
            be the first to leave a note
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <BoardMeta>{countNoun(total, "note")} by the fire tonight</BoardMeta>
      <NoteBoard notes={notes} highlightId={highlightId} />
      {pages > 1 ? <Pagination page={page} pages={pages} /> : null}
    </>
  );
}

function BoardMeta({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 mb-10 text-center text-sm text-ivory-quiet italic">{children}</p>;
}

function Pagination({ page, pages }: { page: number; pages: number }) {
  return (
    <nav className="mt-4 flex items-baseline justify-center gap-6 text-sm text-ivory-quiet italic">
      {page > 1 ? (
        <Link href={`/hearth?page=${page - 1}`} className="quiet quiet-on-wall">
          newer notes
        </Link>
      ) : null}
      <span>
        page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={`/hearth?page=${page + 1}`} className="quiet quiet-on-wall">
          older notes
        </Link>
      ) : null}
    </nav>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** A positive, sane page number; anything odd is page 1. */
function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isSafeInteger(n) && n > 0 ? Math.min(n, 10_000) : 1;
}
