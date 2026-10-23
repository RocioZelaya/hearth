# hearth

notes left by the fire. someone writes what they need and leaves a link where money can be sent. anyone with more than enough can walk by, read, and help.

- **home** (`/`) — one writing line. touch it and it unfolds into a sheet of paper: a title, a thin grey line, the note. below it, your payment link and (optionally) your name.
- **the hearth** (`/hearth`) — everyone's notes, side by side, each held by a brass-orange pin, newest first. every note has one warm button: *warm this up →*, which opens the author's payment link.
- **a note** (`/notes/<id>`) — a single sheet, shareable.

the look borrows the grammar of [fridgle.net](https://fridgle.net) — speckled fridge surface, crooked paper tiles, system serif, lowercase quiet UI — in deep green with orange warmth. see `.claude/skills/hearth-design-system/SKILL.md`.

## run it

```bash
cp .env.example .env        # set a real IP_HASH_SALT in production
npm install                 # also generates the prisma client
npm run db:migrate          # creates prisma/dev.db
npm run db:seed             # optional: 8 sample notes
npm run dev                 # http://localhost:3000
```

requires node 20.9+.

## how it holds up

- **input**: title ≤ 60, body ≤ 280, name ≤ 30; everything validated with zod on the server (`src/lib/validation.ts`).
- **links**: https only, no credentials, public host; stored normalised and rendered as `target="_blank" rel="noopener noreferrer nofollow"`. the provider (paypal, mercado pago, ko-fi, buy me a coffee, cash app, venmo, patreon) is detected from the host for the small "via …" label.
- **abuse**: 3 notes per 10 minutes per visitor (hashed ip, never stored raw), a honeypot field, and a quiet *report* on every note — 5 reports take it down.
- **privacy**: no accounts, no cookies, no analytics. the only thing stored about a visitor is a salted hash of their ip.

## stack

next.js 16 (app router, cache components) · react 19 · typescript · tailwind v4 · prisma 6 + sqlite · zod 4 · vitest

```
src/app            routes and server actions
src/components     compose form, note card, board, header
src/lib            validation, payment links, rate limit, data access (all unit-tested)
prisma             schema, migrations, seed
.claude            skills (design system, conventions) and agents (ui-reviewer, code-reviewer, qa-browser)
```

## scripts

| | |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm start` | production |
| `npm run lint` · `npm run typecheck` · `npm test` | the three checks |
| `npm run db:migrate` · `npm run db:seed` · `npm run db:studio` | database |
| `npm run db:migrate:turso` | apply migrations to turso (production) |

## working on it with claude code

the repo ships two skills and three agents under `.claude/`:

- `hearth-design-system` — tokens, vocabulary, motion, voice. load before touching ui.
- `hearth-conventions` — where things go, the security rules, commands. load before adding a feature.
- `ui-reviewer` — checks components against the design system.
- `code-reviewer` — runs lint/typecheck/tests and checks validation, links, privacy, next 16 patterns.
- `qa-browser` — drives the real app in the browser, desktop and phone, and reports with screenshots.

## deploy (vercel + turso)

vercel has no durable disk, so production notes live in [turso](https://turso.tech) (hosted sqlite). locally nothing changes.

1. create a turso database and grab its url (`libsql://…`) and an auth token.
2. apply the migrations to it once: `TURSO_DATABASE_URL=… TURSO_AUTH_TOKEN=… npm run db:migrate:turso` (re-run after every new migration).
3. in vercel, set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `IP_HASH_SALT` (any long random string) and `DATABASE_URL=file:./dev.db` (only read by the prisma cli at build time).
4. deploy. `src/lib/db.ts` switches to the libsql adapter whenever `TURSO_DATABASE_URL` is present.

## not yet

email verification, editing or deleting your own note, a moderation view, and a postgres datasource for production are all deliberate omissions for the first version. the schema and `src/lib/notes.ts` are the places to grow from.
