// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Broadcast Rundown Console',
  description:
    "Cuelight producer rundown for the fictional 6PM newscast 'The Six' (FRI JUL 04) — a timing-obsessed live-broadcast table with zero clock: every backtime is cascading arithmetic over fixture durations against AIR 18:00:00 → HARD OUT 18:28:30 (28:30 allotted). On screen: a 56px header strip (TallyMark cue-card logo, static show window, an OverUnderChip reading '+0:42 HEAVY ▲' because the 19-row rundown sums to 29:12, and a '13/16 AIR-READY' chip that jumps to the first unready row); a real-<table> rundown (44px content rows, 36px hard-hit anchor rows with a 3px brand rule) whose 88px BacktimeSpine column derives a mono hit time per row — Break 1 lands 18:09:00 exactly ('0:00 ON' success chip), Break 2 computes 18:18:12 vs its 18:17:30 slot ('+0:42 HEAVY' danger chip), and the synthetic HARD OUT anchor shows off-air 18:29:12; a tri-lamp V/G/S ReadinessTallyCell per row (lamps are buttons cycling ready → pending → missing → n/a, with a 20px rollup ring — D01's pending VT, A03's missing GFX + n/a VT, and B03's unlocked script are the three unready rows); a FloatShelf dock (72px, collapsible to a 28px rail) whose 220x56 cards hold rows present but excluded from every aggregate, each with a struck-through ghost backtime recomputed live (pre-seeded F01 'Raccoon in the newsroom vestibule', 0:40, 'was 18:17:37'); and a 400px script-and-asset aside with ticket-shaped revision notes (B03: 'DO NOT lock until Okafor pretape clears'). The signature interaction: floating B01 (1:00) drops every downstream backtime by exactly 1:00, flips Break 2 and the hard out from +0:42 HEAVY to -0:18 LIGHT, animates the header chip, and moves the air-ready count 13/16 → 12/15; RESTORE reverses it exactly. Duration cells are inline mm:ss editors (clamped 0:05–9:59) with ±5s steppers; page numbers re-derive on ↑/↓ reorders within a block. Container-width bands: ≥1000px full 3-region layout; 760–999px the aside becomes a 56px icon rail opening a 400px overlay and the TYPE column folds into the slug subline; <760px the PAGE column drops, readiness condenses to the rollup ring, and row selection opens the script overlay. Choose over grid-feeder-console when the operator's medium is TIME arithmetic — durations cascading into backtimes against a hard out — not electrical topology with interlocked switching steps; choose over pharmacy-verification-queue when rows are ordered show segments whose edits ripple through downstream aggregates, not independent queue items passing a per-item release gate; choose over festival-screening-grid when the schedule is a single linear timeline with float/restore exclusion semantics, not multi-venue parallel blocks with drag constraints; choose over media-asset-pipeline when readiness lamps and script locks decorate a TIMING table rather than assets moving through processing stages.",
  category: 'Media, publishing & live-events production',
  componentsUsed: [
    'Icon',
    'Layout',
    'LayoutContent',
    'Text',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
