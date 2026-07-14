// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'FAB Morph Composer',
  description:
    "MOBILE (390px shell) motion-first notes screen for Fernpad whose centerpiece is a 56px brand FAB riding the sticky dock (right:16 bottom:76, above the bottom:16 toast region). TAP morphs the FAB into a bottom-anchored 320px compose card — transform scale 0.15→1 + border-radius 999→16 + opacity with the transform-origin pinned to the FAB's center, over a fading scrim (all absolute inside the shell; fixed is banned) — holding a title TextInput, body TextArea, and Discard/Post; Post reverses the morph back into the FAB, then the new note slides in at the top of the list (-8px translate) under a brand-tint highlight pulse that decays over 1.1s while the polite toast dock announces 'Note posted'. LONG-PRESS (450ms pointerdown timer with a stroke-dashoffset ring filling around the FAB) fans a speed-dial arc of 3 labeled mini-actions (Photo note / Voice note / Checklist) up a 96px radius with staggered overshoot (cubic-bezier(0.34,1.56,0.64,1), 50ms per index); each mini inserts a deterministic seed note with the same pulse; Escape or scrim tap retracts in reverse stagger, and the 44×44 '⋯' beside the FAB is the mandatory button path into the SAME openDial state update. 8 fixture notes (1 pinned, checklists at '5 of 8' and '2 of 6', voice memos 0:42/0:17, one hue-210 gradient photo tile with a 'WB' monogram) expand/collapse in place, and a navBar pin toggle re-sorts pinned-first; the header caption ('8 notes · 1 pinned') derives from the one notes array. Animates transform/opacity only plus the sanctioned border-radius morph and hold-ring dashoffset; prefers-reduced-motion (matchMedia + change listener, with a CSS backstop) swaps the morph and dial for opacity-only crossfades and removes the pulse and slide-in entirely. At container widths >560px (useElementWidth ResizeObserver) it renders the standard centered 430px phone column on a muted backdrop. Choose over bottom-sheet-snap-explorer when the sheet is a FAB-anchored compose morph rather than a draggable multi-detent surface; choose over mobile-p2p-payment-flow when the choreography showcase is FAB morph + speed-dial fan-out, not keypad digits and receipt staggers; choose over the frozen mobile-overlay-gallery when you need one working end-to-end compose flow instead of a specimen board of overlay patterns.",
  category: 'Mobile',
  componentsUsed: ['Icon', 'TextArea', 'TextInput'],
} satisfies AstryxPageTemplate;

export default template;
