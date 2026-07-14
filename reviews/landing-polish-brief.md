# Landing polish pass — awwwards bar

You are ELEVATING one existing landing template in
/Users/thedeej/dj-code/astryx-templates/templates/ to
Dropbox/Stripe/Coinbase-level art direction. The current version is
structurally complete but visually simplistic — that is the complaint
you are fixing.

FIRST read your assigned `templates/<id>.tsx` in full, plus the
conventions in `reviews/navi-brief.md` (pre-spec sections) and the
landing contract in `reviews/navi-brief-4.md` (pre-spec sections).
Then REWRITE `templates/<id>.tsx` in place (update `<id>.doc.ts`'s
description if the surface changed materially). KEEP: the brand, the
content/fixture inventory, every working interaction (forms,
calculators, tabs, toggles, validation), the quarantined-accent color
policy, useElementWidth responsiveness (incl. 390px), and full
prefers-reduced-motion gating. CHANGE: the art direction, layout
rhythm, and motion choreography per the contract below.

Run `pnpm typecheck` when done (zero errors in your files; other
authors run concurrently) and return exactly:
`<id> | ok | <one-line summary of the elevation>`.

## Polish contract

**1. Typographic scale.** Hero display type 64-84px at wide widths
(tier it by measured container width), lineHeight ≤1.05, letterSpacing
-0.02/-0.03em, fontWeight 650-750. One key phrase per hero gets
gradient ink: `backgroundImage` + `WebkitBackgroundClip:'text'` +
transparent color, gradient built from the page accent via color-mix.
Eyebrow labels: 11-12px, uppercase, tracked +0.08em, accent-tinted
chip or plain. Body copy maxWidth ~56ch. Section headings 32-44px.
Kill any hero headline under 56px at full width.

**2. Layered atmosphere.** Every page gets a composed background
system, not flat bands:
- Aurora field: 2-4 absolutely-positioned radial-gradient blobs
  (300-600px, `filter: blur(70-100px)`, opacity 0.35-0.6, colors =
  color-mix of the accent with info/success tokens), drifting on
  30-45s transform keyframes (static under reduced motion). Place
  behind the hero and one other section.
- Texture: a subtle grain overlay (inline SVG feTurbulence data-URI,
  opacity 0.03-0.05, pointer-events none) OR a dot-grid / hairline-grid
  band (repeating radial/linear-gradient) — at least one texture layer.
- One signature scheme-locked dark section with vibrant gradient glows
  and glass cards (color-mix surface + 1px inset stroke via
  box-shadow + outer depth shadow).

**3. Depth system.** Define shadow tiers in the styles map and use
them consistently: raised = `0 1px 2px rgba(0,0,0,.06), 0 8px 24px
-12px rgba(0,0,0,.18)`; floating = add a wider `0 24px 48px -24px`
layer; glass cards add `inset 0 0 0 1px` hairline. Cards on hover
raise a tier and gain an accent border-glow
(`box-shadow: 0 0 0 1px <accent-mix>, ...`).

**4. Product theater hero.** Replace flat hero panes with a staged
composition: a primary product mock (compose it from real layout —
toolbar rows, list rows, chart strokes — not a gray rectangle) inside
a subtle perspective wrapper, with 2-3 floating satellite mini-cards
(metric chip, notification toast, avatar cluster) that bob on
independent 6-9s keyframes (negative delays) and parallax ±6-10px
toward the pointer over the hero (spring transition; off under
reduced motion and at touch widths). Multi-layer shadows under all of
it. If the page already has a signature hero mechanic (terminal,
chat autoplay, tilt card, exploded SVG), KEEP it and stage it —
depth, glow, satellites — rather than replacing it.

**5. One pinned scroll story.** At least one section becomes a
scroll-driven scene: a `position: sticky` stage inside a ~220-280vh
container; scroll progress (computed from the container's
boundingClientRect against the measured viewport) drives 3 discrete
states or a continuous transform — product mock states advancing,
an SVG path drawing (stroke-dashoffset bound to progress), or a
numbered step rail filling. Steps must also be clickable (button
path). Under reduced motion: render as a static stacked sequence.

**6. Micro-interaction pass.** Primary buttons: sheen sweep on hover
(translating linear-gradient overlay), 1px lift, pressed scale .98.
Nav: transparent at top → gains hairline + tinted blur-ish surface
(color-mix) + slight height reduction after 24px scroll. Dark
sections: pointer-tracked radial spotlight (CSS vars --mx/--my set
from onPointerMove, radial-gradient overlay). Logo/testimonial
strips become marquee loops (40-60s, pause on hover, static + wrapped
under reduced motion). Stat numbers roll with eased tickers on first
reveal (already present in most — keep, retime to ~900ms with
decelerate easing).

**7. Layout rhythm.** Vertical section padding 96-128px at wide
(56-72px compact). Vary section anatomy — no two adjacent sections
with the same card-grid shape: use asymmetric 5/7 splits, offset
overlapping cards (negative margins), full-bleed bands between
contained columns, oversized numerals, sticky side rails for long
lists. At least one element deliberately crosses a section boundary
(overlapping card or mock bleeding into the next band).

**8. Reveal choreography.** Group reveals: parents stagger children
60-90ms, translateY 14-18px + scale .985 → identity, 500-650ms
decelerate bezier. Fire once. Everything visible immediately under
reduced motion.

**9. Discipline unchanged.** Transform/opacity-only animation (plus
stroke-dashoffset/background-position), no layout-property animation,
no new color literals beyond the existing quarantined accent (derive
every glow/aurora via color-mix with tokens), no Date.now/random, no
network assets, keyboard paths intact, `pnpm typecheck` clean. Do not
regress any existing functionality or the 390px behavior — verify the
compact tiers still read correctly after restaging.
