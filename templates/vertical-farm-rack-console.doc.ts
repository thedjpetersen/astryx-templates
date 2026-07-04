// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Vertical Farm Rack Console',
  description:
    "Stackleaf grow-room operator console for Grow Room A (day-anchor Sat Jul 4, 2026) — an elevation view of four instrumented racks where every 44px tier row packs crop identity (Genovese Basil 'Sprint', Butterhead 'Rex', Arugula 'Astro', Red Oak Leaf, Micro Radish 'Rambo', plus the 37-char 'Salanova Red Butter Incised Multi-Leaf' ellipsis fixture at rack-a3-t05), a 64px day-in-cycle notch bar ('21/28d' with a transplant-day notch), three calibrated 56×6px MicroGauges (PPFD/EC/pH with signed target deltas that flip to warning past tolerance — rack-a2-t07 runs pH +0.42 past its ±0.25 band), a 24h spectral LightRecipeBar (photoperiod block subdivided into deep-red/blue/far-red bands with 30-min dimming-ramp wedges; the Finisher Far-Red recipe proves a second 22:00–23:00 far-red-only segment), and a 28px HarvestReadinessGlyph phase dial (rack-a2-t03 sits past-window at day 34 of 28). Light recipes are first-class objects in a 360px aside: shift-click selects contiguous tier ranges, Apply stages 'Basil Sprint v3' onto them (bars restructure 16h→18h and 55/35/10→65/25/10 with dashed staged outlines, PPFD ticks jump 380→450 and deltas re-sign +32→−38), the header KwhForecastChip grows an exact '+4.2' pill (7 Leafy→Basil tiers × 0.6 kWh/tier·day), the tree flips to '2 racks unsynced · staged 14:32', and 'Push to controllers' clears it all with a 'Pushed 2 racks · 7 tiers' toast. Aggregates cross-check by construction: rack subtotals 104.2 + 98.6 + 112.4 + 97.4 = 412.6 kWh/day = the header chip, each the exact sum of its tiers' recipes. Rack A4's controller is offline (every row wears a STALE badge; applying there is allowed but cautions), rack-a1 t11/t12 render dashed 'Empty — sanitizing since Jun 28' placeholders, and Grow Room B sits in the 260px room/rack tree (collapsing to a 56px icon rail below 1200px of measured container width) with zero staged dots, proving the room selector. Choose over grid-feeder-console when the domain is dense PER-SLOT instrumentation on physical shelving (grow racks, battery strings, server sleds, bioreactor trays) with a recipe/profile-applied-to-N-slots stage-diff-push cycle, not a topological one-line diagram with interlocked switching steps; choose over lims-plate-workbench when rows are permanently-installed instrumented positions carrying live setpoint deltas, not sample wells flowing through accession-QC-release states; choose over claims-adjudication-workbench when the mutation is a broadcast profile push to hardware controllers rather than per-record adjudication of a work queue; do not pick it for schedule-first or map-first farming views.",
  category: 'Tools - Vertical Farming',
  componentsUsed: [
    'Avatar',
    'Button',
    'CheckboxInput',
    'Dialog',
    'DialogHeader',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'Selector',
    'Text',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
