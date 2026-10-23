import Link from "next/link";
import { Page } from "@/components/layout/Page";

export default function NotFound() {
  return (
    <Page
      corner={
        <Link href="/hearth" className="quiet quiet-on-wall">
          the hearth
        </Link>
      }
    >
      <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-ivory-quiet italic">that note isn&rsquo;t by the fire anymore.</p>
        <Link href="/hearth" className="quiet quiet-on-wall mt-4">
          see what is there
        </Link>
      </section>
    </Page>
  );
}
