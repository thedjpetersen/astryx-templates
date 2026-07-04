// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Election Returns Desk',
  description:
    "Rotunda election-night canvass desk for Ridgeline State General — Tue 2026-06-02, District 4 Regional Canvass (operator Desk 2 — R. Calloway): a 48px ticker header with three race-select chips (Governor, U.S. Senate, Measure 12) carrying leader swatch, 20px leader-signed margin, and CALLABLE/CALLED pills; a 300px race rail of 84px rows with tally pairs, opposing teal/amber margin bars over a fixed 50% center tick, and status pills; a county-by-batch PrecinctReportingMatrix (6 counties x 13 batches B-01..B-13, 20x24px vertical-fill cells at the county's historical-lean hue — solid when verified, outline-only when pending — each a real button opening a provenance popover with scanner id, checksum, memo, and stamp; county headers toggle a ledger county filter); a 132px CallConfidenceGauge (SVG net-margin axis frozen at ±60k/±80k/±60k whose 12px outstanding-vote envelope [M−O, M+O] narrows on every verify and tints green the instant the floor M−O crosses zero, with M/O/floor readouts and band/marker tooltips); the selected race's tally table; a 340px append-only BatchLedgerTape (96px entries with seq badge, mono checksum, single-line-ellipsis memo, per-race delta arrows and running cumulative margin) where exactly ONE entry — the pending head — carries the enabled Verify batch button (later entries disabled with 'Verify in ledger order'); and a 64px call-desk bar with M, O, floor M−O, and a brand-violet Call race button that enables only when margin exceeds the reachable swing (disabled state explains itself via aria-describedby). Fixtures reconcile by law: 6 county expected-ballot totals sum to 90,000, 13 batch ballot counts reconcile to every county total, and every per-race vote triple sums to its batch; B-01..B-05 verified at load (34,100 = 37.9% reported). Scripted drama: Senate goes CALLABLE by exactly 80 votes at B-09, Measure 12 collapses to a +30 margin at the same batch, Governor clears at B-12 with a +690 floor, and Dunmore sits at 0/6,800 until its single drop-box batch verifies. Choose over grid-feeder-console when the operator commits an append-only queue of evidence batches that monotonically narrow an uncertainty envelope, not switching states on a live one-line topology; choose over pharmacy-verification-queue when each verify re-tallies shared aggregates across three parallel contests rather than gating one item through a personal release check; choose over cloud-cost-analyzer when the surface is a keyboard-paced commit desk with a mathematical call invariant, not exploratory what-if analysis over charts; choose over ev-site-power-console when the scarce quantity is outstanding ballots burning down to zero, not a continuously re-allocated power budget.",
  category: 'Public Sector / Elections',
  componentsUsed: [
    'Button',
    'Dialog',
    'Icon',
    'Popover',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
