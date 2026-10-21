import Link from "next/link";
import { Page } from "@/components/layout/Page";

export default function NotFound() {
  return (
    <Page
      corner={
        <Link href="/fridge" className="quiet quiet-on-fridge">
          the fridge
        </Link>
      }
    >
      <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-ivory-quiet italic">that note isn&rsquo;t on the fridge anymore.</p>
        <Link href="/fridge" className="quiet quiet-on-fridge mt-4">
          see what is →
        </Link>
      </section>
    </Page>
  );
}
