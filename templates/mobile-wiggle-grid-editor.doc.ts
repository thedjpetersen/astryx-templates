// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Wiggle Grid Editor',
  description:
    "MOBILE (390px shell) home-screen grid editor for the Slate launcher: a 52px navBar (grid mark · 'Home' · Edit/Done — the 44px button path into and out of wiggle mode) over a derived '23 apps · 16 unread · 1 dock slot free' caption and a 4×5 icon grid (20 hue-gradient monogram tiles, Postbox 4 + Chirp 12 badges) built as a slot-index model — tiles are absolutely positioned and placed with translate(), so every reorder, reflow, and removal is transform/opacity only. Long-press (450ms) enters WIGGLE MODE: two alternating ±1.6deg rotate keyframes with per-index negative animationDelay desynchronize the phases, 28px '−' remove chips pop in inside 44×44 hits, and pointer-captured drags scale the tile 1.08 with a shadow while every other tile glides around the hovered slot (220ms decelerate) before the drop commits with a 320ms overshoot spring. The floating 4-slot dock (3 seeded apps ⇒ exactly one free slot) accepts grid drops, dock reorders, and dock→grid moves; a full dock bounces the rejected tile back to its origin with a shake + 'Dock is full' toast. Tapping '−' shrinks the tile away and the grid reflows closed with an Undo toast (one-deep orders snapshot); in wiggle mode a plain tap opens a bottom Move sheet (Move left/right/up-a-row/down-a-row · Move to dock/grid · Remove) that commits through the SAME applyMove/remove updaters — the mandatory button path, keyboard-reachable via Enter, and the full reorder fallback under prefers-reduced-motion (wiggle removed entirely, chips just appear, reflows instant). One polite toast dock rides 12px above the dock card; at container widths >560px it renders the standard centered 430px phone column. Choose over drag-rank-list when the reorder surface is a 2-D icon GRID with a capacity-capped dock and remove-chip editing rather than a 1-D ranked list; choose over mobile-overlay-gallery / mobile-chrome-gallery when the centerpiece is live wiggle-mode choreography, not frozen specimen rows; choose over bottom-sheet-snap-explorer when the sheet is only an affordance and the drag physics live in the grid itself.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
