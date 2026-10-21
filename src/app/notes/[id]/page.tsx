import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Page } from "@/components/layout/Page";
import { NoteCard } from "@/components/notes/NoteCard";
import { getNote } from "@/lib/notes";

export async function generateMetadata({ params }: PageProps<"/notes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const note = await getNote(id);
  if (!note) return { title: "not on the fridge" };
  const description = note.body.length > 160 ? `${note.body.slice(0, 157)}…` : note.body;
  return {
    title: note.title,
    description,
    openGraph: { title: note.title, description, type: "article" },
  };
}

export default function NotePage({ params }: PageProps<"/notes/[id]">) {
  return (
    <Page
      corner={
        <>
          <Link href="/fridge" className="quiet quiet-on-fridge">
            the fridge
          </Link>
          <Link href="/" className="quiet quiet-on-fridge">
            write a note
          </Link>
        </>
      }
    >
      <section className="flex flex-1 flex-col justify-center py-16">
        <Suspense fallback={<p className="text-center text-sm text-ivory-quiet italic">finding the note…</p>}>
          <SingleNote params={params} />
        </Suspense>
      </section>
    </Page>
  );
}

async function SingleNote({ params }: Pick<PageProps<"/notes/[id]">, "params">) {
  const { id } = await params;
  const note = await getNote(id);
  if (!note) notFound();

  return (
    <div className="mx-auto w-full max-w-md animate-settle">
      <NoteCard note={note} standalone />
    </div>
  );
}
