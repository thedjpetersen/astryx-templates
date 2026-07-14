// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Search Morph & Filter',
  description:
    "MOBILE (390px shell) motion-first places list for Fernway whose centerpiece is the navBar search MORPH plus ANIMATED LIST RE-FLOW: tapping the 44px search icon expands it into a full-width field (width transition on the overshoot bezier — the single sanctioned exception, noted in the header) while the brand title fades/slides out, a Cancel button slides in, a recent-chips row ('ramen' → 1, 'rooftop' → 3, 'espresso' → 1, 'wine bar' → 1 — every chip maps to real fixture matches) staggers up, and the list dims behind a token veil to suggest the keyboard. Typing live-filters 14 venue rows through ONE matchesVenue predicate with a real FLIP pass — leaving rows re-render as absolute ghosts collapsing via scaleY+opacity while survivors glide to their new slots (getBoundingClientRect before, inverse translateY after, transition to identity on the decelerate bezier) — and the match substring draws a tinted underline (scaleX 0→1, keyed per keystroke). Filter chips (Open now → 10 of 14 / ≤ $$ → 11 / Rooftop → 3) toggle with a fill transition, re-run the same FLIP re-flow, and pop a count badge on the navBar filter glyph; the '9 of 14 places' caption is the aria-live announcement. Cancel reverses the morph and restores the full list with a 36ms-per-row stagger; a zero-match query fades in the shrug empty state ('No places for “xq”'). Per-row 44×44 bookmark buttons post the single polite toast on a sticky bottom:16 dock. prefers-reduced-motion (matchMedia + change listener) removes ghosts, glides, staggers, and the underline draw — rows swap instantly and the morph becomes a crossfade. At desktop container widths (>560px via useElementWidth) it renders the standard centered 430px phone column on a muted backdrop. Choose over ai-chat-session-search or other desktop search templates when the brief wants a phone-first 390px search takeover with choreographed list re-flow rather than a results workbench; choose over drag-rank-list when rows re-order because a FILTER changed, not because the user dragged them; choose over mobile-list-input-gallery when the surface is one live filtering experience, not a frozen specimen catalog.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
