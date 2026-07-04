// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Magazine Flatplan Board',
  description:
    "Print-pagination board for Ottavo Issue 214 'The Craft Issue' — 96 pages (34 ad / 61 edit / 1 blank, cross-checked live in the 44px rail footer) laid out as facing-page SpreadPairs (72x96 verso | 2px gutter stroke | 72x96 recto = 146px openings, 12px gaps) under six 16-page signature brackets (28px rail, rotated 'SIG 3 · pp 33–48' labels, dashed gutters on openings that straddle printable forms); a 240px section rail whose 44px rows carry AdEditRatioGauges with covenant notches (Front of Book 55%, Features 60%, The Long Table 50%, Back of Book none — the omitted-notch path), a 40px filter row (section Selector, 'Ads only' ToggleButton, proof-state chips that can empty the canvas to 'No pages match · clear filters'), dog-ear ProofCornerGlyphs whose fold depth encodes not-started/laid-out/proofed/shipped (6/10/14px), and a 380px PageDetailPane (inline >= 1180px of container, else a focus-trapped slide-over) with a proof-state SegmentedControl and a numeric 'Move to page…' input — the keyboard path to the same movePage mutation as the pointer drag. Layout is governed by bookmaking physics, not a free-form kanban: folio = slot + 1 is derived per render, signature 1 (pp 1–16) is shipped and drag-locked with lock tooltips, and dragging Meridian Watches' RHP-guaranteed p35 ad onto any verso slot renumbers folios in place, raises the red RHP chip and detail Callout, drops Features from 62% to 59% edit (amber, below its 60% covenant), pulses both touched signature brackets 'reflow', and disables 'Export forms' with a tooltip naming the violator. Fixtures include Halcyon Motors' true facing spread straddling the FOB/Features boundary (its halves count in different gauges), Bram & Daughters' 55-char advertiser name truncating tile, rail, and pane header, and PG_002 as a dashed blank with no folio or glyph. Choose over degree-audit-workbench when drops must satisfy POSITIONAL print covenants (recto/verso parity, right-hand-page guarantees, form boundaries), not curriculum gates and credit pools; choose over broadcast-rundown-console when the unit is a physical page in a bound sequence rather than a timed row backtimed to a hard out; choose over court-docketing-console when reordering means repagination with ratio covenants, not append-only legal numbering and deadline chains; choose over any card-grid/kanban surface whenever items have facing-page semantics and a single drag must ripple consequences through numbering, ratios, and production status.",
  category: 'Media, publishing & live-events production',
  componentsUsed: [
    'Button',
    'Heading',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'SegmentedControl',
    'SegmentedControlItem',
    'Selector',
    'Text',
    'TextInput',
    'ToggleButton',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
