import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ComposeNote } from "@/components/compose/ComposeNote";
import { Page } from "@/components/layout/Page";
import { countVisibleNotes } from "@/lib/notes";
import { countNoun } from "@/lib/time";

export default function HomePage() {
  return (
    <Page
      corner={
        <Link href="/hearth" className="quiet quiet-on-wall">
          the hearth
        </Link>
      }
    >
      <section className="flex flex-1 flex-col justify-center py-16">
        <Suspense fallback={<Tonight>the fire is lit.</Tonight>}>
          <TonightCount />
        </Suspense>
        <p className="mx-auto mb-10 max-w-sm text-center text-ivory-quiet italic">
          write what you need and leave a way to send it. someone by the fire might be reading.
        </p>
        <ComposeNote />
      </section>
    </Page>
  );
}

/** One live line so the room feels inhabited before you write. */
async function TonightCount() {
  await connection();
  const total = await countVisibleNotes();
  return (
    <Tonight>{total === 0 ? "the fire is lit. no notes yet." : `${countNoun(total, "note")} by the fire tonight.`}</Tonight>
  );
}

function Tonight({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-center text-sm text-ivory-quiet italic">{children}</p>;
}
