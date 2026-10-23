"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Something threw while rendering. Keep it quiet, keep it by the fire. */
export default function ErrorPage({ reset }: Props) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-ivory-quiet italic">something fell into the fire.</p>
      <div className="mt-4 flex items-baseline gap-5">
        <button type="button" className="quiet quiet-on-wall" onClick={reset}>
          try again
        </button>
        <Link href="/hearth" className="quiet quiet-on-wall">
          back to the hearth →
        </Link>
      </div>
    </main>
  );
}
