// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Wayline Scout — Radial Quick Menu',
  description:
    "MOBILE (390px shell) map-annotation surface whose centerpiece is a long-press radial menu: a 52px navBar over a 420px schematic SVG map (token-tinted city blocks, a slanted canal, park and plaza in a 358×420 logical grid A–F × 1–7). Holding the canvas 450ms (a filling ring cursor tracks the press; >10px slop cancels) fans 5 action petals (Pin / Note / Photo / Share / Route) along a 96px arc with 40ms-staggered overshoot; the arc auto-flips by quadrant near edges (140° centered spread mid-canvas, 100° quarter fans tilted ±45° within 132px of a side, origin clamped so petals stay inside the shell). Continuing the same press drag-highlights petals by angle+distance hit-testing (hot petal scales 1.15 with a label chip); release commits — the petal flies to the bottom Recent-actions tray, a marker pops on the map, the log row slides in, and an undoable toast announces 'Pin logged at C3 · (162, 240)'. A persistent 44×44 '+' FAB opens the identical menu centered with ArrowKeys+Enter roving-tabindex navigation (the mandatory button path); 5 seeded log entries derive their grid cells from the same cellFor() the commit path uses. Reduced motion (matchMedia + CSS backstop) drops fan/fly/stagger for instant states while drag-highlight keeps working. Choose over mobile-fab-morph-compose when the gesture is a point-anchored radial action picker on a canvas rather than a FAB that morphs into a compose sheet; choose over bottom-sheet-snap-explorer or the frozen overlay galleries when the centerpiece is angle-based drag-to-commit at the touch point, not sheet or list mechanics; choose over any desktop template when the brief calls for a phone-first 390px shell with 44×44 touch targets and a single polite toast dock.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
