import Link from "next/link";
import { ComposeNote } from "@/components/compose/ComposeNote";
import { Page } from "@/components/layout/Page";

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
        <p className="mb-10 text-center text-ivory-quiet italic">
          write what you need. leave a way to send it. someone by the fire might be reading.
        </p>
        <ComposeNote />
      </section>
    </Page>
  );
}
