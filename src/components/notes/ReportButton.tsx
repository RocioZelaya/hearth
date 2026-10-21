"use client";

import { useState, useTransition } from "react";
import { reportNote } from "@/app/actions/notes";

type Props = { noteId: string };

type Status = "idle" | "done" | "error";

/** A quiet "report" that, once pressed, just says thanks. */
export function ReportButton({ noteId }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [pending, startTransition] = useTransition();

  if (status === "done") {
    return <span className="text-xs text-ink-quiet italic">reported, thanks</span>;
  }
  if (status === "error") {
    return <span className="text-xs text-ink-quiet italic">couldn&rsquo;t report that</span>;
  }

  return (
    <button
      type="button"
      className="quiet text-xs"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            const result = await reportNote(noteId);
            setStatus(result.ok ? "done" : "error");
          } catch {
            setStatus("error");
          }
        })
      }
    >
      report
    </button>
  );
}
