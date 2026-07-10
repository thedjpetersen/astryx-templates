// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Handraise day-of operations
 *   roster for the fictional Alder Creek River Festival, Saturday June 20,
 *   2026. Four arrival waves (Setup 6:30 AM, Gates 9:00 AM, Peak 1:00 PM,
 *   Teardown 5:30 PM) carrying 13 role slots that need 35 volunteers in
 *   total: Setup 3+2+2=7, Gates 4+2+3=9, Peak 3+2+4+2=11, Teardown 4+3+1=8;
 *   7+9+11+8 = 35 ✓. Thirty named volunteers: 21 pre-assigned (2+2+1 in
 *   Setup, 4+2+1 in Gates, 0+1+3+1 in Peak, 2+1+1 in Teardown = 21 ✓) and 9
 *   in the unassigned pool (21+9 = 30 ✓), so the initial readiness meter
 *   reads 21/35 = 60%. One pre-seeded training-gap override (Theo Marsh on
 *   the Main stage crowd line without CRWD) backs the "1 training gap"
 *   header stat. Five-badge training vocabulary (LIFT, FA, TIPS, CRWD, YSC)
 *   as a meta table. No clock reads, no randomness, no timers, no network
 *   assets — all times are fixed strings.
 * @output Handraise — Volunteer Roster: a community-event staffing board.
 *   A brand header (raised-hand brand mark, event title + date chip, derived
 *   stat cluster: readiness ring 21/35, pool count, training gaps, fully
 *   staffed roles) over a 44px assignment hint bar (aria-live status +
 *   active-volunteer chip + cancel), then the working frame: a horizontal
 *   board of four 248px arrival-wave columns — each wave header carries a
 *   44px coverage ring, time range, and headcount, and stacks role cards
 *   showing a 40px per-role coverage ring, required-training chip, 32px
 *   assignee chips (with unassign X and GAP flag), and an "Assign here"
 *   drop target — beside a fixed 304px volunteer-pool rail of 60px rows
 *   (name, training badge chips, W1–W4 availability dots) filtered by a
 *   wave chip row. Signature move: arm a pool volunteer, then click a
 *   role's assign target — the pool row leaves the rail, the role ring and
 *   the wave ring fill by one slot, the header readiness ring re-derives,
 *   and every surface that shows the count moves in the same render;
 *   unavailable waves refuse with a reason, a missing required training
 *   warns first ("click again to override") and records a GAP chip that
 *   bumps the header gap stat when overridden.
 * @position Page template; emitted by `astryx template
 *   community-event-volunteer-roster`
 *
 * Frame: root 100dvh div (scope class tpl-community-event-volunteer-roster)
 *   wrapping Layout height="fill". LayoutHeader owns the brand + stat
 *   cluster. LayoutContent padding 0 hosts: the 44px hint bar, then a CSS
 *   grid `minmax(0, 1fr) 304px` — left cell is the wave board (its own
 *   horizontal scroll; columns never squeeze below 248px), right cell is
 *   the pool rail (its own vertical scroll). No page-level scroll; each
 *   region scrolls itself.
 *
 * Responsive contract:
 * - ~1045px (inline demo stage): default layout fits by design — 304px rail
 *   + ~725px board shows 2.8 wave columns with an honest horizontal scroll
 *   (subtraction, not squeeze); nothing depends on a media query firing.
 * - <=760px (full-screen phones / 390px embed): the grid stacks to one
 *   column — the pool rail becomes a full-width section capped at 320px of
 *   its own scroll ABOVE the board, and wave columns snap-scroll at 84vw.
 * - <=460px: header stat chips wrap to a second row; the readiness ring
 *   keeps its size; hint bar text truncates before controls do.
 *
 * Container policy (staffing-board archetype): frame-first — rails, columns
 *   and dense rows. Role cards are working containers (ring + chips +
 *   target), not marketing cards; the pool is rows, not tiles.
 *
 * Color policy: token chrome throughout. ONE quarantined brand accent —
 *   Handraise sunflower. Spec hex #F5B800 is ~1.6:1 on white so it never
 *   renders as text; the text-safe pair is light-dark(#854D0E, #FACC15)
 *   (#854D0E on #FFFFFF ≈ 7.0:1; #FACC15 on ~#1C1C1E ≈ 10.9:1) and the
 *   graphic fill pair is light-dark(#A16207, #FACC15) (#A16207 vs #FFFFFF ≈
 *   4.6:1 — clears the 3:1 graphic floor). State pairs, each with math at
 *   the declaration: staffed green light-dark(#15803D, #4ADE80), gap/refuse
 *   red light-dark(#B91C1C, #F87171). The bare --color-text token does not
 *   exist and is never referenced — text tokens are
 *   --color-text-primary/-secondary.
 *
 * Density grid (repeated verbatim in the CSS): hint bar 44 ·
 *   wave column 248 (gap 12) · wave header 64 with a 44px ring · role ring
 *   40 · assignee chip 32 · assign target 40 · pool rail 304 · pool row 60
 *   · training chip 20 · wave dot 18 · every interactive target ≥40px on
 *   its long axis (unassign X is 24px inside a 32px row with merged-row
 *   spacing) · tabular-nums on every count and time column.
 *
 * Fixture policy: one state owner (the page component) holds
 *   assignments/armed/warning; coverage per role, per wave, the readiness
 *   ring, the pool, and the gap stat are all derived from the same
 *   assignment list in render — nothing is stored twice, so every surface
 *   moves together on assign/unassign/override.
 */

import {useMemo, useState} from 'react';

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  UserCheckIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined brand accent (Handraise sunflower). Spec #F5B800 on white
// is ~1.6:1, never rendered. Text-safe pair: #854D0E on #FFFFFF ≈ 7.0:1;
// #FACC15 on the dark surface (~#1C1C1E) ≈ 10.9:1.
const BRAND_TEXT = 'light-dark(#854D0E, #FACC15)';
// Graphic fill (rings, active outlines, armed row): #A16207 vs #FFFFFF ≈
// 4.6:1; #FACC15 vs ~#1C1C1E ≈ 10.9:1 — both clear the 3:1 graphic floor.
const BRAND_FILL = 'light-dark(#A16207, #FACC15)';
// Text/glyphs over a BRAND_FILL surface: #FFFFFF on #A16207 ≈ 4.6:1;
// #422006 on #FACC15 ≈ 9.5:1 (white on #FACC15 would fail at ~1.2:1).
const BRAND_ON = 'light-dark(#FFFFFF, #422006)';
// Brand wash behind chips/armed rows; overlaid text stays BRAND_TEXT:
// #854D0E on rgba(161,98,7,.12)-over-white (≈ #F1E6D4) ≈ 6.1:1;
// #FACC15 on rgba(250,204,21,.14)-over-#1C1C1E ≈ 9.6:1.
const BRAND_TINT =
  'light-dark(rgba(161, 98, 7, 0.12), rgba(250, 204, 21, 0.14))';
// Staffed/complete green: #15803D on #FFFFFF ≈ 4.7:1; #4ADE80 on ~#1C1C1E
// ≈ 9.0:1.
const OK_HUE = 'light-dark(#15803D, #4ADE80)';
const OK_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// Refusal / zero-coverage red: #B91C1C on #FFFFFF ≈ 5.9:1; #F87171 on
// ~#1C1C1E ≈ 6.6:1.
const GAP_HUE = 'light-dark(#B91C1C, #F87171)';
const GAP_TINT =
  'light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))';

const SCOPE = 'tpl-community-event-volunteer-roster';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — every selector prefixed with the scope class. Density grid
// (verbatim): hint bar 44 · wave column 248 (gap 12) · wave header 64 /
// 44px ring · role ring 40 · assignee chip 32 · assign target 40 · pool
// rail 304 · pool row 60 · training chip 20 · wave dot 18.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.${SCOPE} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
}
.${SCOPE} button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.${SCOPE} button:disabled { cursor: default; }
.${SCOPE} button:focus-visible,
.${SCOPE} a:focus-visible {
  outline: 2px solid ${BRAND_FILL};
  outline-offset: 2px;
  border-radius: 4px;
}
.${SCOPE} .cevr-num { font-variant-numeric: tabular-nums; }

/* ---- Header chrome ---- */
.${SCOPE} .cevr-brandmark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${BRAND_FILL};
  color: ${BRAND_ON};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.${SCOPE} .cevr-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  row-gap: var(--spacing-1);
  justify-content: flex-end;
}
.${SCOPE} .cevr-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding-inline: 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  white-space: nowrap;
}
.${SCOPE} .cevr-stat--gap { border-color: ${GAP_HUE}; background: ${GAP_TINT}; }
.${SCOPE} .cevr-stat--ok { border-color: ${OK_HUE}; background: ${OK_TINT}; }

/* ---- Hint bar (44px, above the working frame) ---- */
.${SCOPE} .cevr-hintbar {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding-inline: var(--spacing-3);
  padding-block: 4px;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
}
.${SCOPE} .cevr-hintbar--armed { background: ${BRAND_TINT}; }
.${SCOPE} .cevr-hintbar--refused { background: ${GAP_TINT}; }
.${SCOPE} .cevr-hint-text {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .cevr-hint-text strong { font-weight: 600; }

/* ---- Working frame: board | 304px pool rail ---- */
.${SCOPE} .cevr-frame {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 304px;
}
.${SCOPE} .cevr-body {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.${SCOPE} .cevr-board {
  min-width: 0;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  gap: 12px;
  padding: var(--spacing-3);
  align-items: stretch;
}

/* ---- Wave columns (248px fixed; own vertical scroll) ---- */
.${SCOPE} .cevr-wave {
  width: 248px;
  flex: 0 0 248px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-body);
}
.${SCOPE} .cevr-wave-head {
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-inline: 12px;
  padding-block: 8px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .cevr-wave-title {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${SCOPE} .cevr-wave-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .cevr-wave-time {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${SCOPE} .cevr-wave-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}

/* ---- Role cards ---- */
.${SCOPE} .cevr-role {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--color-background-muted);
}
.${SCOPE} .cevr-role--eligible { border-color: ${BRAND_FILL}; }
.${SCOPE} .cevr-role--refused {
  border-color: ${GAP_HUE};
  background: ${GAP_TINT};
}
.${SCOPE} .cevr-role-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.${SCOPE} .cevr-role-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.25;
}
.${SCOPE} .cevr-req {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding-inline: 6px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  white-space: nowrap;
  align-self: flex-start;
}
.${SCOPE} .cevr-req--missing {
  border-color: ${GAP_HUE};
  color: ${GAP_HUE};
  background: ${GAP_TINT};
}
.${SCOPE} .cevr-assignees {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.${SCOPE} .cevr-assignee {
  height: 32px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-inline: 8px;
  border-radius: 6px;
  background: var(--color-background-body);
  border: var(--border-width) solid var(--color-border);
}
.${SCOPE} .cevr-assignee-name {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .cevr-gapchip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 18px;
  padding-inline: 5px;
  border-radius: 999px;
  background: ${BRAND_TINT};
  color: ${BRAND_TEXT};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
.${SCOPE} .cevr-unassign {
  width: 24px;
  height: 24px;
  min-width: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--color-text-secondary);
}
@media (hover: hover) {
  .${SCOPE} .cevr-unassign:hover {
    background: ${GAP_TINT};
    color: ${GAP_HUE};
  }
}
.${SCOPE} .cevr-target {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  transition: background-color 140ms ease, border-color 140ms ease;
}
.${SCOPE} .cevr-target--eligible {
  border-color: ${BRAND_FILL};
  border-style: solid;
  color: ${BRAND_TEXT};
  background: ${BRAND_TINT};
}
.${SCOPE} .cevr-target--full {
  border-style: solid;
  border-color: ${OK_HUE};
  color: ${OK_HUE};
  background: ${OK_TINT};
}
@media (hover: hover) {
  .${SCOPE} .cevr-target--eligible:hover {
    background: ${BRAND_FILL};
    color: ${BRAND_ON};
  }
}

/* ---- Pool rail (304px) ---- */
.${SCOPE} .cevr-pool {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-body);
}
.${SCOPE} .cevr-pool-head {
  padding: var(--spacing-3);
  padding-bottom: var(--spacing-2);
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .cevr-pool-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.${SCOPE} .cevr-filter {
  height: 28px;
  padding-inline: 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .cevr-filter[aria-pressed='true'] {
  background: ${BRAND_FILL};
  border-color: ${BRAND_FILL};
  color: ${BRAND_ON};
}
.${SCOPE} .cevr-pool-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.${SCOPE} .cevr-pool-row {
  min-height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-inline: var(--spacing-3);
  padding-block: 8px;
  border-bottom: var(--border-width) solid var(--color-border);
}
@media (hover: hover) {
  .${SCOPE} .cevr-pool-row:hover { background: var(--color-background-muted); }
}
.${SCOPE} .cevr-pool-row[aria-pressed='true'] {
  background: ${BRAND_TINT};
  box-shadow: inset 3px 0 0 ${BRAND_FILL};
}
.${SCOPE} .cevr-pool-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.${SCOPE} .cevr-pool-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .cevr-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.${SCOPE} .cevr-training {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding-inline: 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .cevr-training--none {
  border-style: dashed;
  font-weight: 400;
  letter-spacing: 0;
  font-size: 10px;
}
.${SCOPE} .cevr-dots { display: flex; gap: 3px; flex-shrink: 0; }
.${SCOPE} .cevr-dot {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.${SCOPE} .cevr-dot--on {
  background: ${BRAND_TINT};
  border-color: ${BRAND_FILL};
  color: ${BRAND_TEXT};
}
.${SCOPE} .cevr-refusal {
  font-size: 12px;
  line-height: 1.35;
  color: ${GAP_HUE};
}
.${SCOPE} .cevr-pool-empty {
  padding: var(--spacing-5) var(--spacing-3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

/* ---- Rings share one SVG anatomy; sizes 44 (wave) / 40 (role) ---- */
.${SCOPE} .cevr-ring { flex-shrink: 0; display: inline-flex; }
.${SCOPE} .cevr-ring-label {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

/* ---- Responsive: stack the rail above the board on small screens ---- */
@media (max-width: 760px) {
  .${SCOPE} .cevr-frame {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }
  .${SCOPE} .cevr-pool {
    order: -1;
    border-left: none;
    border-bottom: var(--border-width) solid var(--color-border);
    max-height: 320px;
  }
  .${SCOPE} .cevr-board { scroll-snap-type: x mandatory; }
  .${SCOPE} .cevr-wave {
    width: 84vw;
    flex: 0 0 84vw;
    scroll-snap-align: start;
  }
}
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} .cevr-target { transition: none; }
}
`;

// ---------------------------------------------------------------------------
// DOMAIN VOCABULARY — trainings meta table (badge codes referenced by both
// role requirements and volunteer credentials, so mismatch checks never
// compare loose strings).
// ---------------------------------------------------------------------------

type TrainingId = 'lift' | 'firstaid' | 'alcohol' | 'crowd' | 'youth';

interface TrainingMeta {
  id: TrainingId;
  code: string; // badge chip text
  label: string; // tooltip / aria text
}

const TRAININGS: Record<TrainingId, TrainingMeta> = {
  lift: {id: 'lift', code: 'LIFT', label: 'Lift & rigging certification'},
  firstaid: {id: 'firstaid', code: 'FA', label: 'First aid / CPR'},
  alcohol: {id: 'alcohol', code: 'TIPS', label: 'Alcohol service (TIPS)'},
  crowd: {id: 'crowd', code: 'CRWD', label: 'Crowd management'},
  youth: {id: 'youth', code: 'YSC', label: 'Youth safety clearance'},
};

// ---------------------------------------------------------------------------
// WAVES & ROLES — 4 arrival waves, 13 roles, 35 needed slots total
// (7 + 9 + 11 + 8 = 35; cross-checked in the @input header comment).
// ---------------------------------------------------------------------------

type WaveId = 'w1' | 'w2' | 'w3' | 'w4';

interface RoleDef {
  id: string;
  waveId: WaveId;
  name: string;
  needed: number;
  requires: TrainingId | null;
  note?: string; // one-line ops note shown under the name
}

interface WaveDef {
  id: WaveId;
  short: string; // W1..W4 (availability dots)
  name: string;
  time: string; // fixed display string — the demo has an internal "today"
}

const WAVES: WaveDef[] = [
  {id: 'w1', short: 'W1', name: 'Setup', time: '6:30 – 9:00 AM'},
  {id: 'w2', short: 'W2', name: 'Gates open', time: '9:00 AM – 1:00 PM'},
  {id: 'w3', short: 'W3', name: 'Peak & main stage', time: '1:00 – 5:30 PM'},
  {id: 'w4', short: 'W4', name: 'Teardown', time: '5:30 – 8:00 PM'},
];

const ROLES: RoleDef[] = [
  // ---- W1 Setup: 3 + 2 + 2 = 7 ----
  {
    id: 'r-rig1',
    waveId: 'w1',
    name: 'Stage rigging',
    needed: 3,
    requires: 'lift',
    note: 'Truss & line-array assist, north stage',
  },
  {
    id: 'r-vend',
    waveId: 'w1',
    name: 'Vendor check-in',
    needed: 2,
    requires: null,
    note: 'Load-in gate C, booth map handout',
  },
  {
    id: 'r-sign',
    waveId: 'w1',
    name: 'Signage & wayfinding',
    needed: 2,
    requires: null,
    note: 'A-frames along River Walk loop',
  },
  // ---- W2 Gates open: 4 + 2 + 3 = 9 ----
  {
    id: 'r-gate',
    waveId: 'w2',
    name: 'Gate scanning & wristbands',
    needed: 4,
    requires: null,
    note: 'Main gate, two scanner lanes',
  },
  {
    id: 'r-aid2',
    waveId: 'w2',
    name: 'First-aid tent (AM)',
    needed: 2,
    requires: 'firstaid',
    note: 'Tent 1 beside the boathouse',
  },
  {
    id: 'r-kids',
    waveId: 'w2',
    name: 'Kids zone & craft tables',
    needed: 3,
    requires: 'youth',
    note: 'Two-adult rule at all times',
  },
  // ---- W3 Peak: 3 + 2 + 4 + 2 = 11 ----
  {
    id: 'r-beer',
    waveId: 'w3',
    name: 'Beer garden ID check',
    needed: 3,
    requires: 'alcohol',
    note: 'Wristband + ID at both garden gates',
  },
  {
    id: 'r-aid3',
    waveId: 'w3',
    name: 'First-aid tent (PM)',
    needed: 2,
    requires: 'firstaid',
    note: 'Heat plan in effect after 2 PM',
  },
  {
    id: 'r-crowd',
    waveId: 'w3',
    name: 'Main stage crowd line',
    needed: 4,
    requires: 'crowd',
    note: 'Barricade line for the 4 PM headliner',
  },
  {
    id: 'r-info',
    waveId: 'w3',
    name: 'Info booth & lost kids',
    needed: 2,
    requires: null,
    note: 'Radio channel 3; reunite protocol card',
  },
  // ---- W4 Teardown: 4 + 3 + 1 = 8 ----
  {
    id: 'r-waste',
    waveId: 'w4',
    name: 'Waste sort & recycling',
    needed: 4,
    requires: null,
    note: 'Three-stream sort at both corrals',
  },
  {
    id: 'r-rig4',
    waveId: 'w4',
    name: 'Rigging strike & load-out',
    needed: 3,
    requires: 'lift',
    note: 'Reverse of morning build; truck at 6 PM',
  },
  {
    id: 'r-lost',
    waveId: 'w4',
    name: 'Lost & found sweep',
    needed: 1,
    requires: null,
    note: 'Full grounds walk, log to the binder',
  },
];

// ---------------------------------------------------------------------------
// VOLUNTEERS — 30 people by identity: 21 pre-assigned + 9 in the pool.
// Stress fixtures live here on purpose: the 31-char hyphenated names
// exercise chip/row truncation; Lena has zero trainings; Hank is available
// for exactly one wave; Priya carries the TIPS badge the empty Beer-garden
// role is waiting for.
// ---------------------------------------------------------------------------

interface Volunteer {
  id: string;
  name: string;
  trainings: TrainingId[];
  availability: WaveId[]; // which arrival waves this person signed up for
}

const VOLUNTEERS: Volunteer[] = [
  // -- Pre-assigned (see INITIAL_ASSIGNMENTS below) --
  {id: 'v-owen', name: 'Owen Faulkner', trainings: ['lift'], availability: ['w1', 'w4']},
  {id: 'v-ibrahim', name: 'Ibrahim Diallo', trainings: ['lift', 'crowd'], availability: ['w1', 'w3']},
  {id: 'v-renata', name: 'Renata Cruz', trainings: [], availability: ['w1', 'w2']},
  {id: 'v-sam', name: 'Sam Okafor', trainings: ['alcohol'], availability: ['w1', 'w3']},
  {id: 'v-june', name: 'June Park', trainings: [], availability: ['w1']},
  {id: 'v-malik', name: 'Malik Reyes', trainings: [], availability: ['w2', 'w3']},
  {id: 'v-harper', name: 'Harper Quinn', trainings: ['crowd'], availability: ['w2', 'w3']},
  {id: 'v-sofia', name: 'Sofia Andrade', trainings: [], availability: ['w2']},
  {
    id: 'v-alexandria',
    name: 'Alexandria Whitfield-Baumgartner',
    trainings: ['firstaid'],
    availability: ['w2', 'w3', 'w4'],
  },
  {id: 'v-nia', name: 'Nia Solomon', trainings: ['firstaid'], availability: ['w2']},
  {id: 'v-peter', name: 'Peter Vance', trainings: ['firstaid', 'lift'], availability: ['w2', 'w4']},
  {id: 'v-dana', name: 'Dana Whitcomb', trainings: ['youth'], availability: ['w2']},
  {id: 'v-grace', name: 'Grace Liu', trainings: ['firstaid'], availability: ['w3']},
  {id: 'v-theo', name: 'Theo Marsh', trainings: [], availability: ['w3', 'w4']},
  {id: 'v-rosa', name: 'Rosa Jimenez', trainings: ['crowd'], availability: ['w3']},
  {id: 'v-kofi', name: 'Kofi Mensah', trainings: ['crowd', 'alcohol'], availability: ['w3']},
  {id: 'v-elena', name: 'Elena Petrova', trainings: [], availability: ['w3', 'w4']},
  {id: 'v-miguel', name: 'Miguel Santos', trainings: [], availability: ['w4']},
  {id: 'v-priti', name: 'Priti Shah', trainings: [], availability: ['w4']},
  {id: 'v-jonas', name: 'Jonas Weber', trainings: ['lift'], availability: ['w1', 'w4']},
  {id: 'v-tessa', name: 'Tessa Bright', trainings: [], availability: ['w4']},
  // -- Pool (unassigned at load) --
  {id: 'v-priya', name: 'Priya Raman', trainings: ['alcohol', 'firstaid'], availability: ['w2', 'w3']},
  {id: 'v-caleb', name: 'Caleb Ortiz', trainings: ['lift'], availability: ['w1', 'w4']},
  {id: 'v-moses', name: 'Moses Kariuki', trainings: ['crowd'], availability: ['w3']},
  {id: 'v-lena', name: 'Lena Fischer', trainings: [], availability: ['w2', 'w3', 'w4']},
  {id: 'v-arjun', name: 'Arjun Patel', trainings: ['youth'], availability: ['w2']},
  {id: 'v-yuki', name: 'Yuki Tanaka', trainings: ['firstaid'], availability: ['w3', 'w4']},
  {
    id: 'v-bernadette',
    name: 'Bernadette Oyelaran-Whitfield',
    trainings: ['youth', 'firstaid'],
    availability: ['w2'],
  },
  {id: 'v-hank', name: 'Hank Dooley', trainings: [], availability: ['w4']},
  {id: 'v-zoe', name: 'Zoe Nakamura', trainings: ['alcohol'], availability: ['w3']},
];

const VOLUNTEER_BY_ID = new Map(VOLUNTEERS.map(v => [v.id, v]));
const ROLE_BY_ID = new Map(ROLES.map(r => [r.id, r]));
const WAVE_BY_ID = new Map(WAVES.map(w => [w.id, w]));

// ---------------------------------------------------------------------------
// INITIAL ASSIGNMENTS — the single source the whole surface derives from.
// 21 rows (2+2+1 | 4+2+1 | 0+1+3+1 | 2+1+1 = 21 ✓); Theo Marsh carries the
// one pre-seeded training-gap override on the crowd line.
// ---------------------------------------------------------------------------

interface Assignment {
  volunteerId: string;
  roleId: string;
  /** True when a lead overrode a missing required training at assign time —
   * renders the GAP chip and counts into the header training-gap stat. */
  isOverride: boolean;
}

const INITIAL_ASSIGNMENTS: Assignment[] = [
  // W1 Stage rigging (2/3)
  {volunteerId: 'v-owen', roleId: 'r-rig1', isOverride: false},
  {volunteerId: 'v-ibrahim', roleId: 'r-rig1', isOverride: false},
  // W1 Vendor check-in (2/2 — fully staffed)
  {volunteerId: 'v-renata', roleId: 'r-vend', isOverride: false},
  {volunteerId: 'v-sam', roleId: 'r-vend', isOverride: false},
  // W1 Signage (1/2)
  {volunteerId: 'v-june', roleId: 'r-sign', isOverride: false},
  // W2 Gate scanning (4/4 — fully staffed)
  {volunteerId: 'v-malik', roleId: 'r-gate', isOverride: false},
  {volunteerId: 'v-harper', roleId: 'r-gate', isOverride: false},
  {volunteerId: 'v-sofia', roleId: 'r-gate', isOverride: false},
  {volunteerId: 'v-alexandria', roleId: 'r-gate', isOverride: false},
  // W2 First-aid AM (2/2 — fully staffed)
  {volunteerId: 'v-nia', roleId: 'r-aid2', isOverride: false},
  {volunteerId: 'v-peter', roleId: 'r-aid2', isOverride: false},
  // W2 Kids zone (1/3)
  {volunteerId: 'v-dana', roleId: 'r-kids', isOverride: false},
  // W3 Beer garden (0/3 — the zero-coverage stress state)
  // W3 First-aid PM (1/2)
  {volunteerId: 'v-grace', roleId: 'r-aid3', isOverride: false},
  // W3 Crowd line (3/4; Theo lacks CRWD — pre-seeded override)
  {volunteerId: 'v-theo', roleId: 'r-crowd', isOverride: true},
  {volunteerId: 'v-rosa', roleId: 'r-crowd', isOverride: false},
  {volunteerId: 'v-kofi', roleId: 'r-crowd', isOverride: false},
  // W3 Info booth (1/2)
  {volunteerId: 'v-elena', roleId: 'r-info', isOverride: false},
  // W4 Waste sort (2/4)
  {volunteerId: 'v-miguel', roleId: 'r-waste', isOverride: false},
  {volunteerId: 'v-priti', roleId: 'r-waste', isOverride: false},
  // W4 Rigging strike (1/3)
  {volunteerId: 'v-jonas', roleId: 'r-rig4', isOverride: false},
  // W4 Lost & found (1/1 — fully staffed)
  {volunteerId: 'v-tessa', roleId: 'r-lost', isOverride: false},
];

// ---------------------------------------------------------------------------
// ELIGIBILITY — one function both the visual affordances (eligible outline)
// and the assign handler share, so what looks clickable IS what assigns.
// ---------------------------------------------------------------------------

type Eligibility =
  | {kind: 'ok'}
  | {kind: 'full'}
  | {kind: 'unavailable'; waveName: string}
  | {kind: 'training'; training: TrainingMeta};

function checkEligibility(
  volunteer: Volunteer,
  role: RoleDef,
  filledCount: number,
): Eligibility {
  if (filledCount >= role.needed) {
    return {kind: 'full'};
  }
  if (!volunteer.availability.includes(role.waveId)) {
    const wave = WAVE_BY_ID.get(role.waveId);
    return {kind: 'unavailable', waveName: wave ? wave.name : role.waveId};
  }
  if (role.requires != null && !volunteer.trainings.includes(role.requires)) {
    return {kind: 'training', training: TRAININGS[role.requires]};
  }
  return {kind: 'ok'};
}

// ---------------------------------------------------------------------------
// COVERAGE RING — one SVG anatomy for the header (36), wave heads (44) and
// role cards (40). Purely presentational: value in, arc out. The arc is a
// stroke-dasharray donut; color derives from the fill state (zero → gap red,
// partial → brand sunflower, full → staffed green).
// ---------------------------------------------------------------------------

function ringHue(filled: number, needed: number): string {
  if (needed > 0 && filled >= needed) {
    return OK_HUE;
  }
  if (filled === 0) {
    return GAP_HUE;
  }
  return BRAND_FILL;
}

function CoverageRing({
  filled,
  needed,
  size,
  label,
}: {
  filled: number;
  needed: number;
  size: number;
  label: string;
}) {
  const stroke = size >= 44 ? 5 : 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = needed === 0 ? 0 : Math.min(1, filled / needed);
  const hue = ringHue(filled, needed);
  const fontSize = size >= 44 ? 11 : 10;
  return (
    <span
      className="cevr-ring"
      role="img"
      aria-label={`${label}: ${filled} of ${needed} filled`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={hue}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c * (1 - pct)}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="cevr-ring-label"
          fontSize={fontSize}
          // The bare --color-text token does not exist (it renders black on
          // SVG fill) — the text tokens are --color-text-primary/-secondary.
          fill="var(--color-text-primary)">
          {filled}/{needed}
        </text>
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// BRAND MARK — Handraise: a raised open hand in a sunflower tile (tiny
// inline SVG, not an emoji).
// ---------------------------------------------------------------------------

function BrandMark() {
  return (
    <span className="cevr-brandmark" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        {/* Palm + four fingers, simplified raised-hand silhouette. */}
        <path
          d="M8 12.5V6.8a1.3 1.3 0 0 1 2.6 0V11M10.6 10.8V5.2a1.3 1.3 0 0 1 2.6 0v5.6M13.2 10.8V6.2a1.3 1.3 0 0 1 2.6 0v6.3M15.8 12.5v-1.3l1.6-2.2a1.4 1.4 0 0 1 2.3 1.6l-2.7 4.9a6 6 0 0 1-5.3 3.2h-.6a5.6 5.6 0 0 1-5.6-5.6v-2.3a1.3 1.3 0 0 1 2.6 0"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// TRAINING CHIPS — badge codes with full-name tooltips via title/aria.
// ---------------------------------------------------------------------------

function TrainingChips({ids}: {ids: TrainingId[]}) {
  if (ids.length === 0) {
    return <span className="cevr-training cevr-training--none">no certs</span>;
  }
  return (
    <>
      {ids.map(id => {
        const t = TRAININGS[id];
        return (
          <span
            key={id}
            className="cevr-training"
            title={t.label}
            aria-label={t.label}>
            {t.code}
          </span>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// AVAILABILITY DOTS — W1–W4 mini-squares; lit = signed up for that wave.
// ---------------------------------------------------------------------------

function AvailabilityDots({availability}: {availability: WaveId[]}) {
  return (
    <span className="cevr-dots" aria-hidden>
      {WAVES.map(w => (
        <span
          key={w.id}
          className={
            availability.includes(w.id) ? 'cevr-dot cevr-dot--on' : 'cevr-dot'
          }>
          {w.short.slice(1)}
        </span>
      ))}
    </span>
  );
}

function availabilityText(availability: WaveId[]): string {
  return availability
    .map(id => {
      const w = WAVE_BY_ID.get(id);
      return w ? `${w.name} (${w.time})` : id;
    })
    .join(', ');
}

// ---------------------------------------------------------------------------
// ROLE CARD — coverage ring + requirement chip + assignee chips + the
// assign target. Presentational: all state arrives via props; clicks
// report up to the single state owner.
// ---------------------------------------------------------------------------

interface RoleView {
  role: RoleDef;
  assignees: {assignment: Assignment; volunteer: Volunteer}[];
}

function RoleCard({
  view,
  armed,
  refusalRoleId,
  refusalText,
  onAssign,
  onUnassign,
}: {
  view: RoleView;
  armed: Volunteer | null;
  refusalRoleId: string | null;
  refusalText: string | null;
  onAssign: (roleId: string) => void;
  onUnassign: (volunteerId: string) => void;
}) {
  const {role, assignees} = view;
  const filled = assignees.length;
  const isFull = filled >= role.needed;
  const eligibility =
    armed != null ? checkEligibility(armed, role, filled) : null;
  const isEligible = eligibility != null && eligibility.kind === 'ok';
  const isRefusedHere = refusalRoleId === role.id;
  const req = role.requires != null ? TRAININGS[role.requires] : null;
  const reqMissing =
    req != null && armed != null && !armed.trainings.includes(req.id);

  const cardClass = [
    'cevr-role',
    isEligible ? 'cevr-role--eligible' : '',
    isRefusedHere ? 'cevr-role--refused' : '',
  ]
    .filter(Boolean)
    .join(' ');

  let targetLabel = `${role.needed - filled} open`;
  if (isFull) {
    targetLabel = 'Fully staffed';
  } else if (armed != null) {
    targetLabel = isEligible
      ? `Assign ${armed.name.split(' ')[0]} here`
      : 'Assign here';
  }

  return (
    <div className={cardClass}>
      <div className="cevr-role-head">
        <CoverageRing
          filled={filled}
          needed={role.needed}
          size={40}
          label={role.name}
        />
        <span className="cevr-role-name">
          {role.name}
          {role.note != null && (
            <Text type="supporting" color="secondary" maxLines={1}>
              {role.note}
            </Text>
          )}
        </span>
      </div>
      {req != null && (
        <span
          className={
            reqMissing && armed != null
              ? 'cevr-req cevr-req--missing'
              : 'cevr-req'
          }
          title={req.label}>
          requires {req.code}
        </span>
      )}
      {assignees.length > 0 && (
        <div className="cevr-assignees">
          {assignees.map(({assignment, volunteer}) => (
            <div className="cevr-assignee" key={volunteer.id}>
              <span className="cevr-assignee-name" title={volunteer.name}>
                {volunteer.name}
              </span>
              {assignment.isOverride && (
                <span
                  className="cevr-gapchip"
                  title={
                    req != null
                      ? `Assigned without ${req.label}`
                      : 'Training gap'
                  }>
                  GAP
                </span>
              )}
              <button
                type="button"
                className="cevr-unassign"
                aria-label={`Unassign ${volunteer.name} from ${role.name}`}
                onClick={() => onUnassign(volunteer.id)}>
                <Icon icon={XIcon} size="sm" color="inherit" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className={[
          'cevr-target',
          isEligible ? 'cevr-target--eligible' : '',
          isFull ? 'cevr-target--full' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={isFull && armed == null}
        aria-label={
          armed != null
            ? `Assign ${armed.name} to ${role.name}`
            : `${role.name}: ${filled} of ${role.needed} filled`
        }
        onClick={() => onAssign(role.id)}>
        {isFull ? (
          <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
        ) : (
          <Icon icon={UserCheckIcon} size="sm" color="inherit" />
        )}
        <span className="cevr-num">{targetLabel}</span>
      </button>
      {isRefusedHere && refusalText != null && (
        <span className="cevr-refusal" role="alert">
          {refusalText}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner. Assignments are the one source of truth;
// coverage rings, wave headcounts, the readiness stat, the gap stat, and
// the pool all derive from the same list in the same render.
// ---------------------------------------------------------------------------

export default function CommunityEventVolunteerRosterTemplate() {
  const [assignments, setAssignments] =
    useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [armedId, setArmedId] = useState<string | null>(null);
  /** Two-click override: the first click on a training-mismatched role sets
   * this; the second click on the SAME role assigns with isOverride. */
  const [pendingOverride, setPendingOverride] = useState<{
    volunteerId: string;
    roleId: string;
  } | null>(null);
  const [refusal, setRefusal] = useState<{
    roleId: string;
    text: string;
  } | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>(
    'Select a volunteer from the pool, then click a role slot to place them.',
  );
  const [poolFilter, setPoolFilter] = useState<WaveId | 'all'>('all');

  // ---- Derivations (every surface reads these; nothing is stored twice) --
  const assignedIds = useMemo(
    () => new Set(assignments.map(a => a.volunteerId)),
    [assignments],
  );

  const roleViews = useMemo(() => {
    const map = new Map<string, RoleView>();
    for (const role of ROLES) {
      map.set(role.id, {role, assignees: []});
    }
    for (const assignment of assignments) {
      const view = map.get(assignment.roleId);
      const volunteer = VOLUNTEER_BY_ID.get(assignment.volunteerId);
      if (view != null && volunteer != null) {
        view.assignees.push({assignment, volunteer});
      }
    }
    return map;
  }, [assignments]);

  const waveStats = useMemo(() => {
    const stats = new Map<WaveId, {filled: number; needed: number}>();
    for (const wave of WAVES) {
      stats.set(wave.id, {filled: 0, needed: 0});
    }
    for (const role of ROLES) {
      const s = stats.get(role.waveId);
      const view = roleViews.get(role.id);
      if (s != null && view != null) {
        s.needed += role.needed;
        s.filled += view.assignees.length;
      }
    }
    return stats;
  }, [roleViews]);

  const totalNeeded = ROLES.reduce((sum, r) => sum + r.needed, 0); // 35
  const totalFilled = assignments.length;
  const gapCount = assignments.filter(a => a.isOverride).length;
  const fullyStaffed = ROLES.filter(r => {
    const view = roleViews.get(r.id);
    return view != null && view.assignees.length >= r.needed;
  }).length;

  const pool = useMemo(
    () => VOLUNTEERS.filter(v => !assignedIds.has(v.id)),
    [assignedIds],
  );
  const filteredPool =
    poolFilter === 'all'
      ? pool
      : pool.filter(v => v.availability.includes(poolFilter));
  const poolCountFor = (waveId: WaveId) =>
    pool.filter(v => v.availability.includes(waveId)).length;

  const armed = armedId != null ? (VOLUNTEER_BY_ID.get(armedId) ?? null) : null;

  // ---- Mutations -------------------------------------------------------
  const clearTransients = () => {
    setPendingOverride(null);
    setRefusal(null);
  };

  const armVolunteer = (volunteerId: string) => {
    clearTransients();
    if (armedId === volunteerId) {
      setArmedId(null);
      setStatusMsg('Assignment cancelled.');
      return;
    }
    setArmedId(volunteerId);
    const v = VOLUNTEER_BY_ID.get(volunteerId);
    if (v != null) {
      // The hint bar prefixes "Assigning <name> —", so the message itself
      // stays name-free to avoid reading the name twice.
      setStatusMsg(
        `available ${availabilityText(v.availability)}. Click a role slot.`,
      );
    }
  };

  const disarm = () => {
    setArmedId(null);
    clearTransients();
    setStatusMsg('Assignment cancelled.');
  };

  const commitAssignment = (
    volunteer: Volunteer,
    role: RoleDef,
    isOverride: boolean,
  ) => {
    setAssignments(prev => [
      ...prev,
      {volunteerId: volunteer.id, roleId: role.id, isOverride},
    ]);
    setArmedId(null);
    clearTransients();
    const wave = WAVE_BY_ID.get(role.waveId);
    setStatusMsg(
      `${volunteer.name} assigned to ${role.name} (${wave ? wave.name : role.waveId})${
        isOverride ? ' with a training-gap override' : ''
      }.`,
    );
  };

  const assignTo = (roleId: string) => {
    const role = ROLE_BY_ID.get(roleId);
    const view = roleViews.get(roleId);
    if (role == null || view == null) {
      return;
    }
    if (armed == null) {
      setStatusMsg('Select a volunteer from the pool first.');
      return;
    }
    const eligibility = checkEligibility(armed, role, view.assignees.length);
    switch (eligibility.kind) {
      case 'ok': {
        const isOverridden =
          pendingOverride != null &&
          pendingOverride.roleId === roleId &&
          pendingOverride.volunteerId === armed.id;
        commitAssignment(armed, role, isOverridden);
        break;
      }
      case 'full': {
        setPendingOverride(null);
        setRefusal({
          roleId,
          text: `${role.name} is fully staffed (${role.needed}/${role.needed}). Unassign someone first.`,
        });
        setStatusMsg(`refused — ${role.name} is fully staffed.`);
        break;
      }
      case 'unavailable': {
        setPendingOverride(null);
        setRefusal({
          roleId,
          text: `${armed.name} didn't sign up for the ${eligibility.waveName} wave — availability can't be overridden.`,
        });
        setStatusMsg(
          `refused — not signed up for the ${eligibility.waveName} wave.`,
        );
        break;
      }
      case 'training': {
        const isSecondClick =
          pendingOverride != null &&
          pendingOverride.roleId === roleId &&
          pendingOverride.volunteerId === armed.id;
        if (isSecondClick) {
          commitAssignment(armed, role, true);
        } else {
          setPendingOverride({volunteerId: armed.id, roleId});
          setRefusal({
            roleId,
            text: `Needs ${eligibility.training.code} — ${armed.name} hasn't logged ${eligibility.training.label}. Click again to override and log a training gap.`,
          });
          setStatusMsg(
            `missing ${eligibility.training.label} — click the slot again to override.`,
          );
        }
        break;
      }
    }
  };

  const unassign = (volunteerId: string) => {
    const volunteer = VOLUNTEER_BY_ID.get(volunteerId);
    setAssignments(prev => prev.filter(a => a.volunteerId !== volunteerId));
    clearTransients();
    if (volunteer != null) {
      setStatusMsg(`${volunteer.name} returned to the pool.`);
    }
  };

  // ---- Render ----------------------------------------------------------
  const hintClass = [
    'cevr-hintbar',
    armed != null ? 'cevr-hintbar--armed' : '',
    refusal != null ? 'cevr-hintbar--refused' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center">
        <BrandMark />
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Heading level={1}>Alder Creek River Festival</Heading>
            <Badge label="Sat Jun 20, 2026" variant="neutral" />
          </HStack>
        </StackItem>
        <div className="cevr-stats">
          <span
            className="cevr-stat"
            title="Filled slots across all waves and roles">
            <CoverageRing
              filled={totalFilled}
              needed={totalNeeded}
              size={28}
              label="Overall readiness"
            />
            <Text type="supporting" hasTabularNumbers>
              {Math.round((totalFilled / totalNeeded) * 100)}% ready
            </Text>
          </span>
          <span className="cevr-stat" title="Unassigned volunteers">
            <Icon icon={UsersIcon} size="sm" color="secondary" />
            <Text type="supporting" hasTabularNumbers>
              {pool.length} in pool
            </Text>
          </span>
          <span
            className={
              gapCount > 0 ? 'cevr-stat cevr-stat--gap' : 'cevr-stat'
            }
            title="Assignments made without the required training">
            <Icon icon={AlertTriangleIcon} size="sm" color="inherit" />
            <Text type="supporting" hasTabularNumbers>
              {gapCount} training gap{gapCount === 1 ? '' : 's'}
            </Text>
          </span>
          <span
            className="cevr-stat cevr-stat--ok"
            title="Roles at full headcount">
            <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
            <Text type="supporting" hasTabularNumbers>
              {fullyStaffed}/{ROLES.length} roles staffed
            </Text>
          </span>
        </div>
      </HStack>
    </LayoutHeader>
  );

  return (
    <div className={SCOPE}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className="cevr-body">
              <div className={hintClass}>
                <span className="cevr-hint-text" role="status" aria-live="polite">
                  {armed != null ? (
                    <>
                      Assigning <strong>{armed.name}</strong> — {statusMsg}
                    </>
                  ) : (
                    statusMsg
                  )}
                </span>
                {armed != null && (
                  <Button
                    label="Cancel"
                    variant="ghost"
                    size="sm"
                    onClick={disarm}
                  />
                )}
              </div>
              <div className="cevr-frame">
                <div
                  className="cevr-board"
                  role="list"
                  aria-label="Arrival waves">
                  {WAVES.map(wave => {
                    const stats = waveStats.get(wave.id) ?? {
                      filled: 0,
                      needed: 0,
                    };
                    const waveRoles = ROLES.filter(r => r.waveId === wave.id);
                    return (
                      <section
                        key={wave.id}
                        className="cevr-wave"
                        role="listitem"
                        aria-label={`${wave.name} wave, ${stats.filled} of ${stats.needed} filled`}>
                        <div className="cevr-wave-head">
                          <CoverageRing
                            filled={stats.filled}
                            needed={stats.needed}
                            size={44}
                            label={`${wave.name} coverage`}
                          />
                          <div className="cevr-wave-title">
                            <span className="cevr-wave-name">
                              {wave.short} · {wave.name}
                            </span>
                            <span className="cevr-wave-time">{wave.time}</span>
                          </div>
                        </div>
                        <div className="cevr-wave-body">
                          {waveRoles.map(role => {
                            const view = roleViews.get(role.id);
                            if (view == null) {
                              return null;
                            }
                            return (
                              <RoleCard
                                key={role.id}
                                view={view}
                                armed={armed}
                                refusalRoleId={refusal?.roleId ?? null}
                                refusalText={refusal?.text ?? null}
                                onAssign={assignTo}
                                onUnassign={unassign}
                              />
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
                <aside className="cevr-pool" aria-label="Volunteer pool">
                  <div className="cevr-pool-head">
                    <HStack gap={2} vAlign="center">
                      <StackItem size="fill">
                        <Heading level={2}>Volunteer pool</Heading>
                      </StackItem>
                      <Badge
                        label={`${pool.length} unassigned`}
                        variant={pool.length > 0 ? 'info' : 'success'}
                      />
                    </HStack>
                    <div
                      className="cevr-pool-filters"
                      role="group"
                      aria-label="Filter pool by wave availability">
                      <button
                        type="button"
                        className="cevr-filter"
                        aria-pressed={poolFilter === 'all'}
                        onClick={() => setPoolFilter('all')}>
                        All · {pool.length}
                      </button>
                      {WAVES.map(w => (
                        <button
                          key={w.id}
                          type="button"
                          className="cevr-filter"
                          aria-pressed={poolFilter === w.id}
                          title={`${w.name} · ${w.time}`}
                          onClick={() =>
                            setPoolFilter(prev =>
                              prev === w.id ? 'all' : w.id,
                            )
                          }>
                          {w.short} · {poolCountFor(w.id)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="cevr-pool-list">
                    {filteredPool.map(volunteer => (
                      <button
                        key={volunteer.id}
                        type="button"
                        className="cevr-pool-row"
                        aria-pressed={armedId === volunteer.id}
                        aria-label={`${volunteer.name}; trainings: ${
                          volunteer.trainings.length > 0
                            ? volunteer.trainings
                                .map(t => TRAININGS[t].label)
                                .join(', ')
                            : 'none'
                        }; available: ${availabilityText(volunteer.availability)}`}
                        onClick={() => armVolunteer(volunteer.id)}>
                        <div className="cevr-pool-main">
                          <span
                            className="cevr-pool-name"
                            title={volunteer.name}>
                            {volunteer.name}
                          </span>
                          <span className="cevr-badges">
                            <TrainingChips ids={volunteer.trainings} />
                          </span>
                        </div>
                        <AvailabilityDots
                          availability={volunteer.availability}
                        />
                      </button>
                    ))}
                    {filteredPool.length === 0 && (
                      <div className="cevr-pool-empty">
                        <Icon icon={UsersIcon} size="md" color="secondary" />
                        <Text type="body" weight="semibold">
                          {pool.length === 0
                            ? 'Pool is empty'
                            : 'No one matches this wave'}
                        </Text>
                        <Text type="supporting" color="secondary">
                          {pool.length === 0
                            ? 'Every signup is placed. Unassign a chip on the board to free someone up.'
                            : 'Clear the wave filter to see the rest of the pool.'}
                        </Text>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}



