---
name: fridge-design-system
description: The fridge's visual language — tokens, typography, the paper/magnet vocabulary, motion and copy voice. Load before touching any .tsx under src/components or src/app, or globals.css, so new UI stays on-brand.
---

# fridge design system

**Reference:** [fridgle.net](https://fridgle.net) and its "world fridge". We borrow its grammar — a speckled fridge surface, crooked paper magnets, system serif, lowercase quiet UI, dotted underlines — and change the material: the fridge is **deep green**, the warmth is **orange**.

**Mood:** a glass of wine by the fireplace with friends. Cozy, elegant, unhurried. Nothing shouts.

## Tokens (`src/app/globals.css`, `@theme`)

| token | value | use |
|---|---|---|
| `fridge` | `#1c3a32` | page background (the green powder coat) |
| `fridge-deep` / `fridge-sheen` | `#142c26` / `#2c5247` | darker corners / lit areas, rarely used directly |
| `paper` | `#fbf7ee` | note sheets, wordmark |
| `paper-dim` | `#ede8da` | plain `.btn` background |
| `paper-edge` | `#cbc6b6` | the 1px border on every paper thing |
| `ink` / `ink-soft` | `#33302a` / `#4a453a` | text on paper: titles / body |
| `ink-quiet` | `#8f8a7d` | metadata, counters, quiet buttons on paper |
| `ink-faint` | `#c9c5b8` | placeholders on paper |
| `line` | `#cfccc0` | the thin divider and writing lines |
| `ivory` / `ivory-quiet` | `#efe9da` / `#a8b5ac` | text on the green: primary / metadata |
| `ember` / `ember-soft` / `ember-deep` | `#e2702f` / `#f0935c` / `#b8561f` | magnets, the "help with this" button, errors |

Use them as Tailwind utilities (`text-ink-quiet`, `bg-paper`, `border-paper-edge`, `text-ember`). **Never hardcode a hex in a component.** If a colour is missing, add a token.

Shadows: `shadow-magnet` (resting paper), `shadow-lifted` (the note just pinned).

## Surface

The body already carries the fridge: green + inline SVG speckle (`feTurbulence`, alpha 0.07) + a warm diagonal sheen. Don't add gradients, blurs, illustrations or images. The only "decoration" allowed is paper and magnets.

## Typography

- One family everywhere: the system serif stack (`Georgia, "Iowan Old Style", "Times New Roman", serif`). **No webfonts, no `next/font`.**
- Sizes: note title `text-[1.25rem] leading-snug` normal weight (never bold); note body `text-[1.02rem] leading-relaxed`; metadata `text-sm italic`; counters/labels `text-xs`.
- **All UI copy is lowercase.** Write it lowercase in the source; never use `text-transform` (user content must keep its case).
- Metadata is italic and quiet: `— mara · 2 hours ago`, `9 notes on the fridge · oct 20, 2026`.

## Vocabulary (component classes in `globals.css`)

| class | what it is |
|---|---|
| `.paper` | a sheet: paper bg, 1px `paper-edge`, `shadow-magnet`, **radius 0**, tilted by `--rot` |
| `.magnet` | the round orange magnet at the top-centre of a `.paper` (`position: absolute`, parent must be `relative` — `.paper` already is) |
| `.wordmark` | the "fridge" logo: a crooked paper tile (`rotate: -1.3deg`) |
| `.quiet` | text button/link: grey, dotted underline, darkens on hover. Add `.quiet-on-fridge` when it sits on the green |
| `.btn` | a real button: flat rectangle, bordered like paper, no radius |
| `.btn.btn-ember` | the warm button. **One per note, one per form.** Nothing else is orange except magnets, error text and a character counter that is near its limit |
| `.writing-line` | a bare input on the green: only a bottom border, italic placeholder |
| `.field` | a bare input/textarea on paper: no chrome at all, `field-sizing: content` |
| `.divider` | the thin grey rule between title and body: 85% wide, centred, never touches the edges |
| `.board` | the fridge grid: CSS columns 1/2/3 with `2.5rem` gaps |

Tilt: every sheet gets `--rot` between about −2° and 2°, **deterministic** from its id (`unitHash` in `src/lib/hash.ts`), so the board doesn't shuffle on re-render. The compose sheet uses a fixed `-0.6deg`.

## Motion (keyframes in `@theme`)

- `animate-arrive` — a note dropping onto the fridge (0.26s, slight overshoot). Stagger with `animationDelay`, cap at ~12 items.
- `animate-wiggle` — the "no" shake on a rejected submit. Remove the class on `animationend` so it can fire again.
- `animate-settle` — a card easing into place (0.35s).
- Everything respects `prefers-reduced-motion` globally. Don't add `transition-all`; transition only `color`/`background-color`.

## Layout

- Reading pages: `max-w-2xl`, centred, lots of air (`py-16` around the main thing).
- The board: `max-w-5xl`. Header is always: wordmark left, one or two quiet links right, one italic metadata line underneath.
- Mobile first: 16–20px side gutters (`px-5`), single column board under 40rem, no horizontal scroll ever.

## Voice

Short, warm, lowercase, no exclamation marks. Errors are kind and specific: "only https links, please." Buttons say what happens: "pin it to the fridge", "help with this →".

## Don't

- No border radius on paper or buttons (the magnet is the only circle).
- No bold titles, no uppercase, no coloured headings.
- No icons/emoji; a `→` or `·` is as far as it goes.
- No second accent colour. If it's not orange and not paper, it's green or ivory.
- No webfonts, images or illustrations.

## Example: a sheet

```tsx
<article className="paper px-6 pt-7 pb-5" style={{ "--rot": "1.2deg" } as CSSProperties}>
  <span className="magnet" aria-hidden />
  <h2 className="text-[1.25rem] leading-snug">a warm coat for the winter</h2>
  <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">…</p>
  <p className="mt-4 text-sm text-ink-quiet italic">— mara · just now</p>
  <a className="btn btn-ember mt-5" href="…" target="_blank" rel="noopener noreferrer nofollow">help with this →</a>
</article>
```
