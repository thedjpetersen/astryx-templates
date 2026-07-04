// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Degree Audit Workbench',
  description:
    "Registrar-side degree-audit board for Laurel — advisor view of Priya Raghunathan (L-2024-88117, B.S. Biology, catalog 2023–2024, advisor A. Whitfield) at 78 of 120 credits (65.0% header ProgressRing, 42 remaining): a 64px brand bar (single-path LaurelMark, student identity, 44px/5px-stroke ring, catalog-year Selector across 2022–2023 / 2023–2024 / 2024–2025 whose switch re-evaluates every gate while keeping placements); a 320px unassigned tray (280px in the 1000–1179px demo band) with a segmented All 8 / Done 6 / In prog 1 / Xfer 1 filter, 44px rows, a drag-disabled dashed in-progress CHEM 235 chip, and the pending GEOL 1403 ArticulationSplitRow fanning 4 cr into 2+1+1 fragments; a fluid requirement-satisfaction tree whose nodes carry gate badges (ALL 5, 1 of 2, choose 2 of 3, 12 cr list), 4px CreditMeters with surplus notches, wrapped CourseChip rows (28px chips with term dots, transfer bracket ticks, and a 63-char BIO 415 truncation fixture), an empty-state Global Perspectives bucket, and two DOM-measured dashed ExclusivityArcs (Tracks ↔ List B, Social Science ↔ Global) that highlight both endpoints and shared chips on hover and become per-node lock badges below 820px container width; and a 300px exceptions rail with three ticket cards (EXC-1041 approved substitution, EXC-1057 pending GEOL split whose Approve places all three fragments at once — 78→82 cr, ring 65.0%→68.3% — and EXC-1049 denied waiver) plus the amber/red exclusivity- and double-count-notice card. Every drop is a constraint solve through one auditStore update(id, patch): cross-arc moves auto-vacate the prior bucket with an amber notice, ineligible drops raise 'Double-count blocked', the satisfied Quantitative gate locks STAT 201 out mid-drag, List B overflow renders '12 of 12 · +1 cr surplus → Free Electives', and chips double as buttons whose Enter menu offers the same eligible-bucket placement plus 'Return to tray'. Choose over festival-screening-grid when drops satisfy academic requirement gates (n-of-m, credit pools, exclusivity arcs) rather than scheduling blocks on a venue timeline; choose over matter-workspace when the surface is an interactive placement/constraint board, not a read-mostly single-record hub with documents and activity; choose over pharmacy-verification-queue when the core loop is dragging items into a satisfaction tree rather than approving queue rows against a working aside; choose over ttrpg-encounter-tracker when the one-action fan-out is a registrar approval recomputing credit aggregates, not a turn-order combat engine.",
  category: 'Education / Registrar',
  componentsUsed: [
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'Popover',
    'SegmentedControl',
    'Selector',
    'StackItem',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
