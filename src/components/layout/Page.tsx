import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

type Props = {
  corner?: ReactNode;
  /** Page content width: a single reading column, or the wide fridge board. */
  width?: "column" | "board";
  children: ReactNode;
};

/** Shared page frame: masthead, content, and the small footer line. */
export function Page({ corner, width = "column", children }: Props) {
  const maxWidth = width === "board" ? "max-w-5xl" : "max-w-2xl";
  return (
    <main className={`mx-auto flex w-full ${maxWidth} flex-1 flex-col px-5 pt-7 pb-10 sm:px-6`}>
      <SiteHeader corner={corner} />
      <div className="flex flex-1 flex-col">{children}</div>
      <footer className="mt-16 text-center text-sm text-ivory-quiet italic">
        a note on the fridge. anyone with more than enough can help.
      </footer>
    </main>
  );
}
