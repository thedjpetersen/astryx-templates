// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Museum Exhibit Condition Log',
  description:
    "Conservator's pre-movement working surface for Vitrine at the Halloran Museum of Decorative Arts (Gallery 4, 'Fire & Sand: Venetian Glass 1500–1700', outgoing loan LN-2026-031 to the Corning Museum of Glass, deinstall 26 Jun 2026; anchored to Fri 12 Jun 2026): a gallery OBJECT WALL of 12 condition-graded tiles (128px real <button>s on a minmax(150px,1fr) grid, grouped by vitrine case C1/C2/C3/W1) carrying custom SVG silhouette glyphs per object form (goblet, tazza, ewer, filigrana flask, lattimo beaker, mirror…), 20px A–D grade letter badges, days-since-check due chips with dashed amber borders past the 30-day policy (ships with three overdue: 39d, 37d, 43d → checks current 9/12), and cyan droplet badges on every tile whose case sits inside an open humidity excursion; an ENVIRONMENT strip chart (inline SVG 672×152, 56 literal 6-hourly RH points over 14 days, 45–55% safe band, excursion windows as real-button overlays — OPEN E-207 renders red 45° hatch, acknowledged E-201 a grey dashed outline + tick) with a detail row exposing peak/duration/cause and an Acknowledge action; a 376px CONSERVATION LEDGER rail (append-only event spine: accession reports, checks with grade + observation tags, treatments, excursion acknowledgements, movement events; auto-scoped to the selected object with an All-gallery toggle) above a LOG CONDITION CHECK composer (44×40 A–D grade radiogroup with per-grade criteria, observation tag chips, note field); and a pinned 56px MOVEMENT GATE bar deriving three requirements live (12/12 checks ≤30d · 0 open excursions · 0 grade-D objects) that unlocks 'Request movement approval'. Signature move: logging a check updates the wall tile's grade badge, last-checked line, and due chip, appends a highlighted ledger row, and re-derives the gate counters; acknowledging E-207 restyles the chart window from hatch to outline+tick, clears the droplet badges on Case C2's tiles, and ticks the second requirement; logging a grade-D check flips a requested gate to 'Approval on hold' — one store, five surfaces, reversible in both directions. Choose over trial-site-monitor when the domain is collections care (object tiles + environmental telemetry + movement gating), not clinical visit windows; choose over audit-evidence-tracker when readiness derives from physical checks and environmental acknowledgements rather than document workflows.",
  category: 'Tools - Museum Collections Care',
  componentsUsed: [
    'Avatar',
    'Button',
    'Heading',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'Text',
    'TextInput',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
