"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Something threw while rendering. Keep it quiet, keep it on the fridge. */
export default function ErrorPage({ reset }: Props) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-ivory-quiet italic">something slipped off the fridge.</p>
      <div className="mt-4 flex items-baseline gap-5">
        <button type="button" className="quiet quiet-on-fridge" onClick={reset}>
          try again
        </button>
        <Link href="/fridge" className="quiet quiet-on-fridge">
          back to the fridge →
        </Link>
      </div>
    </main>
  );
}
