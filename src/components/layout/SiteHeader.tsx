import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  /** Quiet links for the right-hand corner. */
  corner?: ReactNode;
};

/** The masthead: a crooked wordmark tile and a few quiet links. */
export function SiteHeader({ corner }: Props) {
  return (
    <header className="flex items-baseline justify-between gap-4">
      <Link href="/" className="wordmark">
        hearth
      </Link>
      {corner ? <nav className="flex items-baseline gap-4">{corner}</nav> : null}
    </header>
  );
}
