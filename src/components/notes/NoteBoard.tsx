import type { PublicNote } from "@/lib/notes";
import { NoteCard } from "./NoteCard";

type Props = {
  notes: PublicNote[];
  /** Id of the note the visitor just pinned, if any. */
  highlightId?: string;
};

/** Notes side by side, flowing down columns, arriving one after another. */
export function NoteBoard({ notes, highlightId }: Props) {
  return (
    <div className="board pt-3">
      {notes.map((note, i) => (
        <div key={note.id} className="animate-arrive" style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}>
          <NoteCard note={note} highlight={note.id === highlightId} />
        </div>
      ))}
    </div>
  );
}
