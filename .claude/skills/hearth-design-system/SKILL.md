---
name: hearth-design-system
description: The hearth's visual language — tokens, typography, the paper/pin vocabulary, motion and copy voice. Load before touching any .tsx under src/components or src/app, or globals.css, so new UI stays on-brand.
---

# hearth design system

**Reference:** [fridgle.net](https://fridgle.net) and its "world fridge". We borrow its grammar — a speckled fridge surface, crooked paper tiles, system serif, lowercase quiet UI, dotted underlines — and change the material: the wall behind the fire is **deep green**, the warmth is **terracotta**; the paper is a warm, slightly yellow off-white.

**Mood:** a glass of wine by the fireplace with friends. Cozy, elegant, unhurried. Nothing shouts.

## Tokens (`src/app/globals.css`, `@theme`)

| token | value | use |
|---|---|---|
| `wall` | `#1e3b32` | page background (the green wall) |
| `wall-deep` / `wall-sheen` | `#152d27` / `#2e5347` | darker corners / lit areas, rarely used directly |
| `paper` | `#f4ebd4` | note sheets, wordmark |
| `paper-dim` | `#eadfc3` | plain `.btn` background |
| `paper-edge` | `#d0c3a3` | the 1px border on every paper thing |
| `ink` / `ink-soft` | `#35302a` / `#4d463a` | text on paper: titles / body |
| `ink-quiet` | `#736d5c` | metadata, counters, quiet buttons on paper |
| `ink-faint` | `#c3b89c` | placeholders on paper |
| `line` | `#d7cbad` | the thin divider and writing lines |
| `ivory` / `ivory-quiet` | `#efe5cc` / `#b3bdac` | text on the green: primary / metadata |
| `brass` / `brass-light` / `brass-deep` | `#b48d47` / `#e3c57c` / `#78592a` | the pin only |
| `ember` / `ember-soft` / `ember-deep` | `#c66a3c` / `#d88b5e` / `#9a4e28` | pins, the "help with this" button, errors |

Use them as Tailwind utilities (`text-ink-quiet`, `bg-paper`, `border-paper-edge`, `text-ember`). **Never hardcode a hex in a component.** If a colour is missing, add a token.

Shadows: `shadow-pin` (resting paper), `shadow-lifted` (the note just pinned).

## Surface

The body already carries the wall: green + inline SVG speckle (`feTurbulence`, alpha 0.07) + a warm diagonal sheen. Don't add gradients, blurs, illustrations or images. The only "decoration" allowed is paper and pins.

## Typography

- One family everywhere: the system serif stack (`Georgia, "Iowan Old Style", "Times New Roman", serif`). **No webfonts, no `next/font`.**
- Sizes: note title `text-[1.25rem] leading-snug` normal weight (never bold); note body `text-[1.02rem] leading-relaxed`; metadata `text-sm italic`; counters/labels `text-xs`.
- **All UI copy is lowercase.** Write it lowercase in the source; never use `text-transform` (user content must keep its case).
- Metadata is italic and quiet: `— mara · 2 hours ago`, `9 notes by the fire · oct 20, 2026`.

## Vocabulary (component classes in `globals.css`)

| class | what it is |
|---|---|
| `.paper` | a sheet: paper bg, 1px `paper-edge`, `shadow-pin`, **radius 0**, tilted by `--rot` |
| `.pin` | the round brass-orange pin at the top-centre of a `.paper` (`position: absolute`, parent must be `relative` — `.paper` already is) |
| `.wordmark` | the "hearth" logo: the bare word in ivory, 1.5rem, no box |
| `.quiet` | text button/link: grey, dotted underline, darkens on hover. Add `.quiet-on-wall` when it sits on the green |
| `.btn` | a real button: flat rectangle, bordered like paper, no radius |
| `.btn.btn-ember` | the warm button. **One per note, one per form.** Nothing else is orange except pins, error text and a character counter that is near its limit |
| `.writing-line` | a bare input on the green: only a bottom border, italic placeholder |
| `.field` | a bare input/textarea on paper: no chrome at all, `field-sizing: content` |
| `.divider` | the thin grey rule between title and body: 85% wide, centred, never touches the edges |
| `.board` | the hearth grid: CSS columns 1/2/3 with `2.5rem` gaps |

Tilt: every sheet gets `--rot` between about −2° and 2°, **deterministic** from its id (`unitHash` in `src/lib/hash.ts`), so the board doesn't shuffle on re-render. The compose sheet uses a fixed `-0.6deg`.

## Motion (keyframes in `@theme`)

- `animate-arrive` — a note dropping onto the hearth (0.26s, slight overshoot). Stagger with `animationDelay`, cap at ~12 items.
- `animate-wiggle` — the "no" shake on a rejected submit. Remove the class on `animationend` so it can fire again.
- Everything respects `prefers-reduced-motion` globally. Don't add `transition-all`; transition only `color`/`background-color`.

## Layout

- Reading pages: `max-w-2xl`, centred, lots of air (`py-16` around the main thing).
- The board: `max-w-5xl`. Header is always: wordmark left, one or two quiet links right, one italic metadata line underneath.
- Mobile first: 16–20px side gutters (`px-5`), single column board under 40rem, no horizontal scroll ever.

## Voice

Short, warm, lowercase, no exclamation marks. Errors are kind and specific: "only https links, please." Buttons say what happens: "leave it by the fire", "warm this up on paypal". **No trailing arrows on links or buttons, no middle-dot meta strings**: write meta as prose ("mara, two days ago", "seven notes by the fire tonight") and spell numbers up to twenty.

## Don't

- No border radius on paper or buttons (the pin is the only circle).
- No bold titles, no uppercase, no coloured headings.
- No icons, emoji, arrows or middle dots.
- No second accent colour. If it's not orange and not paper, it's green or ivory.
- No webfonts, images or illustrations.

## Example: a sheet

```tsx
<article className="paper px-6 pt-7 pb-5" style={{ "--rot": "1.2deg" } as CSSProperties}>
  <span className="pin" aria-hidden />
  <h2 className="text-[1.25rem] leading-snug">a warm coat for the winter</h2>
  <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">…</p>
  <p className="mt-4 text-sm text-ink-quiet italic">— mara · just now</p>
  <a className="btn btn-ember mt-5" href="…" target="_blank" rel="noopener noreferrer nofollow">warm this up →</a>
</article>
```
