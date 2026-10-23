# hearth — notes for Claude Code

a place where someone pins a short note saying what they need plus a payment link, and anyone can help. next.js 16 · prisma 6 + sqlite · tailwind v4 · zod 4 · vitest.

**before any work, load the skill that applies:**

- ui, copy, styling → `hearth-design-system`
- features, data, actions, anything else → `hearth-conventions`

**before finishing:** `npm run lint && npx next typegen && npm run typecheck && npm test`, then run the `code-reviewer` agent (and `ui-reviewer` for ui changes). `qa-browser` walks the real app when a flow changed.

this next.js is newer than your training data: read `node_modules/next/dist/docs/` for any api you haven't already seen used in this repo. `AGENTS.md` is maintained by next itself.

node 20.17 on the dev machine: prisma 7 and better-sqlite3 won't install here — stay on prisma 6 with the built-in engine.
