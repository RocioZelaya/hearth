import Link from "next/link";
import type { CSSProperties } from "react";
import type { PublicNote } from "@/lib/notes";
import { paperClasses, paperLook, type Holder as HolderKind } from "@/lib/paper";
import { relativeTime } from "@/lib/time";
import { HelpLink } from "./HelpLink";
import { ReportButton } from "./ReportButton";

type Props = {
  note: PublicNote;
  /** The note the visitor just pinned: lifted a little away from the fire. */
  highlight?: boolean;
  /** On its own page the title is not a link. */
  standalone?: boolean;
};

/** A sheet of paper by the fire: lined, torn or a sticky note, pinned or taped. */
export function NoteCard({ note, highlight = false, standalone = false }: Props) {
  const look = paperLook(note.id);
  const style = { "--rot": `${look.tilt}deg` } as CSSProperties;

  return (
    <article className={`${paperClasses(look)} px-6 pt-7 pb-5 ${highlight ? "shadow-lifted" : ""}`} style={style}>
      <Holder holder={look.holder} />

      <h2 className="text-[1.25rem] leading-snug">
        {standalone ? (
          note.title
        ) : (
          <Link
            href={`/notes/${note.id}`}
            className="decoration-dotted underline-offset-4 hover:underline"
          >
            {note.title}
          </Link>
        )}
      </h2>

      <p className="mt-3 text-[1.02rem] leading-relaxed whitespace-pre-line text-ink-soft">{note.body}</p>

      <p className="mt-4 text-sm text-ink-quiet italic">
        {note.authorName ?? "someone"}, {relativeTime(note.createdAt)}
      </p>

      <div className="mt-5 flex items-baseline justify-between gap-3">
        <HelpLink url={note.paymentUrl} provider={note.provider} />
        <ReportButton noteId={note.id} />
      </div>
    </article>
  );
}

function Holder({ holder }: { holder: HolderKind }) {
  switch (holder) {
    case "pin":
      return <span className="pin" aria-hidden />;
    case "tape":
      return <span className="tape" aria-hidden />;
    case "tape-corners":
      return (
        <>
          <span className="tape tape-left" aria-hidden />
          <span className="tape tape-right" aria-hidden />
        </>
      );
    default:
      return null;
  }
}
