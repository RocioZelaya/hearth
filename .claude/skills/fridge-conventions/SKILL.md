---
name: fridge-conventions
description: How code is organised and written in the fridge repo — where things go, server vs client components, validation and security rules, data access, commands. Load before adding or changing any feature.
---

# fridge conventions

Next.js 16 (App Router, Cache Components on), React 19, TypeScript strict, Tailwind v4, Prisma 6 + SQLite, Zod 4, Vitest.

**Read `node_modules/next/dist/docs/` before using a Next API you haven't used in this repo** — this Next is newer than most training data (`PageProps<"/route">` helpers, `searchParams`/`params` are Promises, dynamic reads must sit inside `<Suspense>`).

## Where things go

```
src/app/              routes only. page.tsx stays thin: layout + Suspense + an async child that reads data
src/app/actions/      "use server" files. One per domain (notes.ts). They validate, rate-limit, write, then redirect/revalidate
src/components/<area> UI. Server components by default; "use client" only where there is state or an event handler
src/lib/              pure helpers and data access. No React here. Everything testable with Vitest
src/generated/prisma  generated client — never edit, never lint, gitignored
prisma/               schema, migrations, seed
.claude/              skills and agents for Claude Code
```

## Rules

1. **Every input crosses `src/lib/validation.ts`.** Server actions call `noteInputSchema.safeParse(formToNoteInput(formData))`; never read `formData.get()` ad hoc. Limits live in `LIMITS` and are shared with the UI counters.
2. **Payment links go through `parsePaymentUrl`** (https only, no credentials, public host). Render them only as `<a href target="_blank" rel="noopener noreferrer nofollow">`. Never `dangerouslySetInnerHTML`.
3. **Never store or log a raw IP.** Use `getVisitorHash()` (`src/lib/request.ts`), which hashes with `IP_HASH_SALT`.
4. **Rate-limit every mutation** with `consumeRateLimit(ipHash, action)`; add the rule to `RATE_LIMITS` in `src/lib/rate-limit.ts`.
5. **The UI sees `PublicNote` only** (`src/lib/notes.ts`). Add fields there deliberately; `ipHash`, `reports`, `hidden` never leave the server.
6. **Data reads happen in server components inside `<Suspense>`** (Cache Components requires it for anything dynamic). Mutations happen in server actions and end with `revalidatePath` and/or `redirect`.
7. **Client components stay small**: the compose form and the report button. Keep derived state out of effects (see `ComposeNote` — adjust state during render, don't `setState` in `useEffect`).
8. **No `any`, no `as unknown as` outside `db.ts`.** Prefer `satisfies` and Prisma's `GetPayload` for row types.
9. **Styling:** Tailwind utilities + the vocabulary classes from `globals.css`. Read the `fridge-design-system` skill. No inline hex colours, no new CSS files.
10. **Copy is lowercase, warm, short.** Error strings live next to the validation that produces them.
11. **Tests:** every file in `src/lib/` that contains logic has a sibling `*.test.ts`. Run `npm test` before finishing.
12. **Honeypot:** the `website` field must stay in the form, visually hidden, and must stay in the schema with `max(0)`. A filled honeypot redirects to `/fridge` without saving.

## Adding a payment provider

Append to `PROVIDERS` in `src/lib/payment-links.ts` (id, label, hosts). Add the id to the `Provider` union. Add a test in `payment-links.test.ts`. Nothing else changes.

## Changing the data model

Edit `prisma/schema.prisma` → `npm run db:migrate -- --name <what-changed>` → update `publicSelect` / `PublicNote` in `src/lib/notes.ts` if the UI needs the field → update `prisma/seed.ts` if seeds need it.

## Commands

| command | does |
|---|---|
| `npm run dev` | dev server on :3000 |
| `npm run build` / `npm start` | production build / serve |
| `npm run lint` | eslint (next core-web-vitals + typescript + react-hooks) |
| `npm run typecheck` | `tsc --noEmit` (run `npx next typegen` first if route types are stale) |
| `npm test` | vitest, `src/**/*.test.ts` |
| `npm run db:migrate` | create/apply a migration (dev) |
| `npm run db:seed` | put 8 sample notes on an empty fridge |
| `npm run db:studio` | browse the SQLite db |

`DATABASE_URL` is a `file:` path relative to `prisma/` — `src/lib/db.ts` resolves it so the app and the CLI open the same file.

## Definition of done

`npm run lint && npm run typecheck && npm test` clean, the flow works in the browser (home → expand → pin → fridge → help link), and the `ui-reviewer` / `code-reviewer` agents have nothing blocking.
