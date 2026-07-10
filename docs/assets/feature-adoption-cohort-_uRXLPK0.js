var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Cohora adoption surface for the
 *   "Automation Studio · Q3 enterprise cohort" of Lumen Suite: 18 accounts
 *   across four adoption stages, seeded 5 Invited + 6 Activated + 4 Habitual
 *   + 3 Expanded = 18. Cross-checks verified by hand: cohort ARR sums to
 *   $2,400K — Invited 96+132+84+210+58 = 580, Activated 176+64+88+142+120+
 *   154 = 744, Habitual 98+112+76+187 = 473, Expanded 205+240+158 = 603;
 *   580+744+473+603 = 2,400 ✓. Activation rate 13/18 past Invited = 72.2%
 *   (the header stat derives live from the row set, never typed). Suite
 *   "today" anchor: Thu 9 Jul 2026 — every timestamp is a fixed string and
 *   appended log entries reuse the frozen NOW_STAMP. Weekly-run sparklines
 *   are 8-point literal arrays on a fixed 0–10 domain. No clock reads, no
 *   randomness, no timers, no network assets.
 * @output Feature Adoption Cohort — Cohora, a growth PM's working surface:
 *   an adoption-stage funnel whose cohort-flow ribbons taper between
 *   stage-cumulative counts (18 → 13 → 7 → 3, drawn live from the account
 *   rows), an account drill-down table with per-account weekly-run
 *   sparklines and blocker chips, and a lifecycle aside where the signature
 *   interaction lives: triggering a stage-gated lifecycle action (verify
 *   activation / promote to habitual / log expansion order) moves the
 *   account between stages in ONE state update — funnel ribbon widths,
 *   stage counts, drop-off annotations, filter-chip tallies, the header
 *   activation stat, the expanded-ARR footer line, the table row's stage
 *   cell, and the account's activity log all re-derive together. Blocked
 *   or ineligible accounts REFUSE with a visible reason (open blocker /
 *   no automation published / habit weeks below threshold / seat
 *   utilization under the 80% expansion signal), and a correction path
 *   ("Regress one stage") makes every move reversible.
 * @position Page template; emitted by \`astryx template feature-adoption-cohort\`
 *
 * Frame: root 100dvh div (scope class tpl-feature-adoption-cohort) >
 *   Layout height="fill".
 *   header bar 48px (Cohora mark + cohort title + live token | derived
 *   activation stat + PM avatar)
 *   | view root (flex, height 100%, minHeight 0, overflow hidden)
 *     | main column (funnel band 184px: 44px stage-header buttons over a
 *       128px ribbon SVG > toolbar 40px filter chips > table: 32px sticky
 *       head + 44px account rows in one scroller > footer strip 32px
 *       legend + ARR line)
 *     | aside 360px (identity 64px > stage path 36px > metric rows 44px >
 *       blockers > lifecycle action panel > activity log, own scroll >
 *       footer 48px).
 * Container policy: app-shell archetype — frame rows, a funnel band, and
 *   panels only; no Cards. Table rows and aside rows are styled elements
 *   on the content surface.
 * Color policy: token-pure chrome. ONE quarantined coral brand accent as
 *   two declared faces of the same hue: BRAND (fills only —
 *   light-dark(#E4573D, #FF8C73); #E4573D on white = 3.7:1 and #FF8C73 on
 *   #1E1E1E = 7.3:1, both ≥3:1 for non-text graphics) drives the Cohora
 *   mark, funnel bars + ribbons, sparkline strokes, and the selected
 *   row's 3px accent bar; BRAND_TEXT (light-dark(#B93A24, #FF9B85);
 *   #B93A24 on white = 5.8:1, #FF9B85 on #1E1E1E = 8.2:1) is the only
 *   brand-tinted text. State colors ride the data-viz categorical vars
 *   with repo-standard light-dark fallbacks; every stage is encoded by a
 *   distinct GLYPH SHAPE (hollow / half-filled / ringed / rayed disc),
 *   never color alone.
 * Density grid (verbatim, repeated everywhere): header bar 48px; funnel
 *   band 184px (44px stage headers + 128px SVG + 12px pad); toolbar 40px;
 *   table head 32px; table rows 44px; footer strip 32px; aside 360px
 *   (mid band 320px, overlay 340px); aside identity 64px; aside metric
 *   rows 44px; aside footer 48px; single gutter GUTTER = 12 (all padding
 *   and margins are 12 or 6); mono metadata 12px; body 13px; section
 *   labels 11px uppercase tracking 0.06em.
 * Responsive contract — CONTAINER width via useElementWidth(viewRootRef)
 *   ResizeObserver (the demo stage is ~1045–1075px inside a 1440px
 *   window, so viewport media queries would lie there; a viewport query
 *   covers only the first pre-observer frame):
 *   - W >= 1200: aside 360px; table shows all seven columns (account,
 *     ARR, seats, usage sparkline 72px, stage, blockers, last activity).
 *   - 1000 <= W < 1200 (canonical demo band): aside 320px; the seats
 *     column drops, sparklines narrow to 56px, blocker chips drop their
 *     text for a count pip. Subtraction, not squeeze.
 *   - W < 1000: aside leaves the flex flow and becomes a 340px absolute
 *     overlay (right 0, shadow, opens on row selection, X closes, Escape
 *     closes and restores focus to the triggering row); the sparkline and
 *     last-activity columns drop.
 *   - <= 720px CSS media query (the 390px embed iframe, where viewport
 *     queries DO fire): the ARR column, funnel share-% lines, and the
 *     header stat also drop; funnel stage labels shrink to 10px; the
 *     overlay aside clamps to min(340px, 100vw).
 * Fixture policy: all mutations flow through ONE owner on the accounts
 *   record. Lifecycle actions append activity entries with the frozen
 *   NOW_STAMP; expansion orders take sequential ids EXP-3041+. Refusals
 *   never mutate — they only set the visible refusal note and the polite
 *   live-region text.
 * Corner map: top-left Cohora mark + cohort title; top-right activation
 *   stat + PM avatar; bottom-left footer legend strip; bottom-right aside
 *   footer (or the footer strip's ARR line when nothing is selected).
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CircleAlertIcon,
  RocketIcon,
  ShieldAlertIcon,
  UserRoundXIcon,
  WrenchIcon,
  XIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark()
// pair. Data-viz categorical tokens are NOT injected by the demo, so each
// carries the repo-standard fallback.
// ---------------------------------------------------------------------------

// THE quarantined coral brand accent, two declared faces of one hue.
// BRAND is FILLS ONLY: #E4573D on white = 3.7:1, #FF8C73 on #1E1E1E = 7.3:1
// (both clear the 3:1 non-text graphics bar). Used by the Cohora mark, the
// funnel bars + ribbons, sparkline strokes, and the selected row accent bar.
const BRAND = 'light-dark(#E4573D, #FF8C73)';
// BRAND_TEXT is the only brand-tinted text: #B93A24 on white = 5.8:1,
// #FF9B85 on #1E1E1E = 8.2:1 (both clear 4.5:1).
const BRAND_TEXT = 'light-dark(#B93A24, #FF9B85)';
// Soft brand wash for ribbon fills, pressed chips, and the action panel.
const BRAND_SOFT = 'light-dark(rgba(228, 87, 61, 0.16), rgba(255, 140, 115, 0.20))';

const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
// Warning: #B45309 on white = 4.6:1, #FBBF24 on #1E1E1E = 9.9:1.
const WARN = 'var(--color-data-categorical-orange, light-dark(#B45309, #FBBF24))';
const WARN_SOFT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))';
// Danger: #DC2626 on white = 4.5:1, #F87171 on #1E1E1E = 6.6:1.
const DANGER = 'light-dark(#DC2626, #F87171)';
const DANGER_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
// Seat-utilization meter track / sparkline threshold line.
const TRACK_GREY = 'light-dark(rgba(60, 60, 67, 0.14), rgba(235, 235, 245, 0.16))';

// Density grid law: ALL padding/margins on this page are GUTTER or GUTTER/2.
const GUTTER = 12;
const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// Scope class — every selector in TEMPLATE_CSS is prefixed with this.
const SCOPE = 'tpl-feature-adoption-cohort';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — the entire stylesheet, injected once via <style>. Every
// selector is scoped under .tpl-feature-adoption-cohort. Transitions animate
// color/opacity only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.\${SCOPE} button {
  font-family: inherit;
}
.\${SCOPE} .fac-fade {
  transition: background-color 160ms ease, opacity 160ms ease, border-color 160ms ease, color 160ms ease;
}
.\${SCOPE} .fac-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.\${SCOPE} .fac-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .fac-fade { transition: none; }
}

/* ---- header bar 48px ---------------------------------------------------- */
.\${SCOPE} .fac-header-bar {
  display: flex;
  align-items: center;
  gap: \${GUTTER}px;
  height: 48px;
  padding: 0 \${GUTTER}px;
}
.\${SCOPE} .fac-mono {
  font-family: \${MONO};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .fac-section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .fac-header-stat {
  font-family: \${MONO};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ---- view root + main column -------------------------------------------- */
.\${SCOPE} .fac-view-root {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.\${SCOPE} .fac-main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ---- funnel band 184px = 44 headers + 128 svg + 12 pad ------------------- */
.\${SCOPE} .fac-funnel-band {
  /* Content-sized to exactly 44 + 128 + 12 = 184px; the hairline border
     sits outside the sum so the SVG never loses its last row of pixels. */
  flex-shrink: 0;
  padding: 0 \${GUTTER}px \${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
}
.\${SCOPE} .fac-funnel-headers {
  display: flex;
  height: 44px;
  flex-shrink: 0;
}
.\${SCOPE} .fac-stage-head {
  appearance: none;
  border: none;
  background: transparent;
  flex: 1;
  min-width: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  color: var(--color-text-primary);
  border-radius: var(--radius-container, 8px);
}
.\${SCOPE} .fac-stage-head[aria-pressed='true'] {
  background-color: var(--color-background-muted);
}
.\${SCOPE} .fac-stage-count {
  font-family: \${MONO};
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.\${SCOPE} .fac-stage-share {
  font-family: \${MONO};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .fac-stage-label {
  font-size: 12px;
  white-space: nowrap;
}
.\${SCOPE} .fac-funnel-svg-wrap {
  height: 128px;
  flex-shrink: 0;
}

/* ---- toolbar 40px --------------------------------------------------------- */
.\${SCOPE} .fac-toolbar {
  display: flex;
  align-items: center;
  gap: \${GUTTER / 2}px;
  height: 40px;
  padding: 0 \${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}
.\${SCOPE} .fac-chip {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  font-size: 11px;
  font-family: \${MONO};
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.\${SCOPE} .fac-chip[aria-pressed='true'] {
  border-color: \${BRAND_TEXT};
  background-color: \${BRAND_SOFT};
}
.\${SCOPE} .fac-chip-blocked[aria-pressed='true'] {
  border-color: \${WARN};
  background-color: \${WARN_SOFT};
}

/* ---- account table -------------------------------------------------------- */
.\${SCOPE} .fac-table-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.\${SCOPE} .fac-thead {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 \${GUTTER}px;
  background-color: var(--color-background);
  border-bottom: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
}
.\${SCOPE} .fac-row {
  appearance: none;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 0 \${GUTTER}px 0 0;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
  border-bottom: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
}
.\${SCOPE} .fac-row[aria-pressed='true'] {
  background-color: var(--color-background-muted);
}
.\${SCOPE} .fac-row-accent {
  width: 3px;
  align-self: stretch;
  flex-shrink: 0;
  margin-right: \${GUTTER - 3}px;
}
.\${SCOPE} .fac-cell-account {
  display: flex;
  align-items: center;
  gap: \${GUTTER / 2}px;
  flex: 1;
  min-width: 140px;
}
.\${SCOPE} .fac-account-name {
  font-size: 13px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .fac-cell {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}
.\${SCOPE} .fac-cell-num {
  justify-content: flex-end;
  font-family: \${MONO};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .fac-blocker-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  border: var(--border-width) solid \${WARN};
  background-color: \${WARN_SOFT};
  color: \${WARN};
  font-size: 11px;
  white-space: nowrap;
  max-width: 148px;
  overflow: hidden;
}
.\${SCOPE} .fac-blocker-chip > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .fac-blocker-pip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: var(--border-width) solid \${WARN};
  background-color: \${WARN_SOFT};
  color: \${WARN};
  font-family: \${MONO};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

/* ---- footer strip 32px ----------------------------------------------------- */
.\${SCOPE} .fac-footer-strip {
  display: flex;
  align-items: center;
  gap: \${GUTTER}px;
  height: 32px;
  padding: 0 \${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}
.\${SCOPE} .fac-legend-key {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  color: var(--color-text-secondary);
  font-size: 11px;
}

/* ---- aside ------------------------------------------------------------------ */
.\${SCOPE} .fac-aside {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background-color: var(--color-background);
  box-sizing: border-box;
}
.\${SCOPE} .fac-aside-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  z-index: 5;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.\${SCOPE} .fac-aside-identity {
  display: flex;
  align-items: center;
  gap: \${GUTTER}px;
  height: 64px;
  padding: 0 \${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  box-sizing: border-box;
}
.\${SCOPE} .fac-aside-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: \${GUTTER}px;
}
.\${SCOPE} .fac-aside-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: \${GUTTER / 2}px;
  height: 48px;
  padding: 0 \${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  box-sizing: border-box;
}
.\${SCOPE} .fac-metric-row {
  display: flex;
  align-items: center;
  gap: \${GUTTER}px;
  min-height: 44px;
  padding: 0 \${GUTTER / 2}px;
  box-sizing: border-box;
}
.\${SCOPE} .fac-metric-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  width: 96px;
  flex-shrink: 0;
}
.\${SCOPE} .fac-stage-path {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 \${GUTTER / 2}px;
}
.\${SCOPE} .fac-stage-path-seg {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background-color: var(--color-border);
}
.\${SCOPE} .fac-util-track {
  position: relative;
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background-color: \${TRACK_GREY};
  overflow: hidden;
}
.\${SCOPE} .fac-util-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  border-radius: 999px;
}
.\${SCOPE} .fac-action-panel {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  padding: \${GUTTER}px;
  display: flex;
  flex-direction: column;
  gap: \${GUTTER / 2}px;
}
.\${SCOPE} .fac-refusal {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: \${GUTTER / 2}px;
  border-radius: var(--radius-container, 8px);
  background-color: \${DANGER_SOFT};
  color: \${DANGER};
  font-size: 12px;
}
.\${SCOPE} .fac-blocker-row {
  display: flex;
  align-items: center;
  gap: \${GUTTER / 2}px;
  min-height: 40px;
  padding: 0 \${GUTTER / 2}px;
}
.\${SCOPE} .fac-log-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0;
}
.\${SCOPE} .fac-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: \${GUTTER / 2}px;
  padding: \${GUTTER * 2}px;
  text-align: center;
}
.\${SCOPE} .fac-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* ---- 390px embed iframe (viewport queries DO fire there) ------------------- */
@media (max-width: 720px) {
  .\${SCOPE} .fac-cell-arr { display: none; }
  .\${SCOPE} .fac-stage-share { display: none; }
  .\${SCOPE} .fac-stage-label { font-size: 10px; }
  .\${SCOPE} .fac-aside-overlay { width: min(340px, 100vw); }
  .\${SCOPE} .fac-header-stat { display: none; }
}
\`;

// ---------------------------------------------------------------------------
// DOMAIN TYPES + META TABLES — vocabulary before components.
// ---------------------------------------------------------------------------

type StageId = 'invited' | 'activated' | 'habitual' | 'expanded';

interface StageMeta {
  id: StageId;
  label: string;
  short: string;
  definition: string;
}

// Ordered adoption ladder for Automation Studio. Index = stage rank.
const STAGES: StageMeta[] = [
  {id: 'invited', label: 'Invited', short: 'INV', definition: 'Beta access granted, nothing published yet'},
  {id: 'activated', label: 'Activated', short: 'ACT', definition: 'First automation published and run'},
  {id: 'habitual', label: 'Habitual', short: 'HAB', definition: '4+ runs per week for 4 consecutive weeks'},
  {id: 'expanded', label: 'Expanded', short: 'EXP', definition: 'Add-on seats purchased on an expansion order'},
];

const STAGE_INDEX: Record<StageId, number> = {invited: 0, activated: 1, habitual: 2, expanded: 3};

// Habit threshold: each of the LAST 4 sparkline weeks must be >= 4 runs.
const HABIT_RUNS_PER_WEEK = 4;
const HABIT_WINDOW_WEEKS = 4;
// Expansion signal: seat utilization must be >= 80%.
const EXPANSION_UTIL_THRESHOLD = 0.8;

type BlockerKind = 'technical' | 'security' | 'champion';

interface Blocker {
  id: string;
  kind: BlockerKind;
  label: string; // short chip label
  detail: string; // aside sentence
}

interface ActivityEntry {
  stamp: string; // fixed fixture string, e.g. '2 Jul 2026 · 09:41'
  actor: string;
  text: string;
}

interface Account {
  id: string;
  name: string;
  tier: 'Enterprise' | 'Growth';
  stage: StageId;
  arrDisplay: string; // dual field with arrK
  arrK: number; // ARR in $K — the math field
  seatsUsed: number;
  seatsLicensed: number;
  automationsPublished: number;
  weeklyRuns: number[]; // 8 literal points, fixed 0–10 domain
  lastActivity: string;
  csm: string;
  champion?: string; // omit-when-undefined: Trellis HR's champion departed
  blockers: Blocker[];
  expansionOrderId?: string; // present only after 'Log expansion order'
  activity: ActivityEntry[];
}

// ---------------------------------------------------------------------------
// FIXTURES — one deterministic world: Lumen Suite's growth team tracking
// Automation Studio adoption. Suite "today" anchor: Thu 9 Jul 2026. The
// signed-in user is growth PM Mara Ellison. Stage seed 5/6/4/3 = 18 rows;
// ARR sums per stage are cross-checked in the @input comment.
// ---------------------------------------------------------------------------

const PEOPLE = {
  mara: {name: 'Mara Ellison', role: 'Growth PM', initials: 'ME'},
  jonah: {name: 'Jonah Reyes', role: 'CSM'},
  priya: {name: 'Priya Natarajan', role: 'CSM'},
  sam: {name: 'Sam Whitcomb', role: 'CSM'},
};

// Frozen "now" — appended activity entries reuse this string, never a clock.
const NOW_STAMP = '9 Jul 2026 · 15:04';

// Blocker entities by identity — referenced from accounts, never retyped.
const BLOCKERS: Record<string, Blocker> = {
  'BLK-11': {
    id: 'BLK-11',
    kind: 'technical',
    label: 'SSO SAML misconfig',
    detail:
      'SAML assertion rejects the Automation Studio audience URI; their IdP admin has the corrected metadata but has not redeployed.',
  },
  'BLK-14': {
    id: 'BLK-14',
    kind: 'security',
    label: 'Security review pending',
    detail:
      'Legal ops will not enable outbound webhooks until the vendor security questionnaire clears their review board (meets Tuesdays).',
  },
  'BLK-17': {
    id: 'BLK-17',
    kind: 'champion',
    label: 'Champion departed',
    detail:
      'Admin owner left the company 26 Jun; no replacement admin has accepted the workspace-owner invite yet.',
  },
};

// 18 accounts. Weekly runs are 8 literal points (weeks of 18 May – 6 Jul
// 2026) on a fixed 0–10 domain. Bluepeak's all-zero array is the sparkline
// zero-state stress; its 52-char name is the truncation stress at every
// rail width. Habit eligibility (last 4 weeks >= 4) is engineered per row:
// Helix/Copperline/Atlas/Fernbrook pass, Cinder (5,2,4,3) and Marlowe
// (4,3,5,4) fail on purpose so the refusal path has real fixtures.
const INITIAL_ACCOUNTS: Account[] = [
  // ---- Invited (5) — ARR 96+132+84+210+58 = 580 ---------------------------
  {
    id: 'ACC-1401',
    name: 'Northwind Logistics',
    tier: 'Growth',
    stage: 'invited',
    arrDisplay: '$96K',
    arrK: 96,
    seatsUsed: 18,
    seatsLicensed: 40,
    automationsPublished: 1,
    weeklyRuns: [0, 0, 0, 1, 0, 2, 1, 0],
    lastActivity: '6 Jul 2026',
    csm: PEOPLE.jonah.name,
    champion: 'Dee Halvorsen',
    blockers: [BLOCKERS['BLK-11']],
    activity: [
      {stamp: '22 Jun 2026 · 10:12', actor: PEOPLE.jonah.name, text: 'Beta access granted; kickoff call booked.'},
      {stamp: '30 Jun 2026 · 16:40', actor: PEOPLE.jonah.name, text: 'First automation published, but SSO blocks the run scheduler for non-admin users. Raised BLK-11.'},
      {stamp: '6 Jul 2026 · 09:05', actor: 'Cohora', text: 'Usage ping: 1 manual run this week, scheduler still gated.'},
    ],
  },
  {
    id: 'ACC-1379',
    name: 'Halcyon Credit Union',
    tier: 'Enterprise',
    stage: 'invited',
    arrDisplay: '$132K',
    arrK: 132,
    seatsUsed: 44,
    seatsLicensed: 120,
    automationsPublished: 0,
    weeklyRuns: [0, 0, 1, 0, 0, 0, 1, 1],
    lastActivity: '3 Jul 2026',
    csm: PEOPLE.priya.name,
    champion: 'Marcus Oyelaran',
    blockers: [],
    activity: [
      {stamp: '15 Jun 2026 · 11:00', actor: PEOPLE.priya.name, text: 'Invited to the Q3 cohort; champion wants a sandbox walkthrough before publishing anything.'},
      {stamp: '3 Jul 2026 · 14:22', actor: PEOPLE.priya.name, text: 'Walkthrough done. Drafting a loan-doc routing automation, not yet published.'},
    ],
  },
  {
    // 52-char long-name stress fixture — exercises ellipsis at every width.
    id: 'ACC-1412',
    name: 'Bluepeak Manufacturing Cooperative of Saskatchewan',
    tier: 'Growth',
    stage: 'invited',
    arrDisplay: '$84K',
    arrK: 84,
    seatsUsed: 9,
    seatsLicensed: 35,
    automationsPublished: 0,
    weeklyRuns: [0, 0, 0, 0, 0, 0, 0, 0],
    lastActivity: '18 Jun 2026',
    csm: PEOPLE.sam.name,
    champion: 'Renate Kowalczyk',
    blockers: [],
    activity: [
      {stamp: '18 Jun 2026 · 13:30', actor: PEOPLE.sam.name, text: 'Access granted at renewal. No logins since the kickoff email; flagged for a re-engagement sequence.'},
    ],
  },
  {
    id: 'ACC-1355',
    name: 'Veritable Insurance Group',
    tier: 'Enterprise',
    stage: 'invited',
    arrDisplay: '$210K',
    arrK: 210,
    seatsUsed: 82,
    seatsLicensed: 150,
    automationsPublished: 1,
    weeklyRuns: [0, 0, 0, 0, 1, 2, 2, 3],
    lastActivity: '8 Jul 2026',
    csm: PEOPLE.priya.name,
    champion: 'Ines Fabbri',
    blockers: [],
    activity: [
      {stamp: '11 Jun 2026 · 09:15', actor: PEOPLE.priya.name, text: 'Invited; claims-intake team is the target squad.'},
      {stamp: '2 Jul 2026 · 15:48', actor: 'Cohora', text: 'First automation published: "FNOL intake triage". 3 runs last week.'},
      {stamp: '8 Jul 2026 · 10:02', actor: PEOPLE.priya.name, text: 'Champion confirms the triage flow is in daily use — ready for activation verification.'},
    ],
  },
  {
    id: 'ACC-1420',
    name: 'Orbital Freight',
    tier: 'Growth',
    stage: 'invited',
    arrDisplay: '$58K',
    arrK: 58,
    seatsUsed: 12,
    seatsLicensed: 20,
    automationsPublished: 0,
    weeklyRuns: [0, 1, 0, 0, 1, 0, 0, 1],
    lastActivity: '30 Jun 2026',
    csm: PEOPLE.jonah.name,
    champion: 'Theo Brandt',
    blockers: [],
    activity: [
      {stamp: '30 Jun 2026 · 11:55', actor: PEOPLE.jonah.name, text: 'Champion exploring templates; wants the carrier-update recipe we shipped in June.'},
    ],
  },
  // ---- Activated (6) — ARR 176+64+88+142+120+154 = 744 --------------------
  {
    id: 'ACC-1288',
    name: 'Helix Biosystems',
    tier: 'Enterprise',
    stage: 'activated',
    arrDisplay: '$176K',
    arrK: 176,
    seatsUsed: 61,
    seatsLicensed: 80,
    automationsPublished: 4,
    weeklyRuns: [0, 2, 4, 5, 6, 5, 7, 6],
    lastActivity: '8 Jul 2026',
    csm: PEOPLE.priya.name,
    champion: 'Dr. Lena Okafor',
    blockers: [],
    activity: [
      {stamp: '26 May 2026 · 10:30', actor: 'Cohora', text: 'Activation: "Sample-batch QC alerts" published and run.'},
      {stamp: '23 Jun 2026 · 09:12', actor: PEOPLE.priya.name, text: 'Lab ops added three more automations; runs holding above threshold four weeks straight.'},
      {stamp: '8 Jul 2026 · 08:44', actor: 'Cohora', text: 'Habit signal: 6 runs last week, 4-week streak intact.'},
    ],
  },
  {
    id: 'ACC-1307',
    name: 'Cinder Analytics',
    tier: 'Growth',
    stage: 'activated',
    arrDisplay: '$64K',
    arrK: 64,
    seatsUsed: 14,
    seatsLicensed: 25,
    automationsPublished: 2,
    weeklyRuns: [0, 1, 2, 3, 5, 2, 4, 3],
    lastActivity: '7 Jul 2026',
    csm: PEOPLE.sam.name,
    champion: 'Beatriz Lunde',
    blockers: [],
    activity: [
      {stamp: '9 Jun 2026 · 14:20', actor: 'Cohora', text: 'Activation: "Weekly churn digest" published.'},
      {stamp: '7 Jul 2026 · 17:01', actor: PEOPLE.sam.name, text: 'Usage is spiky — runs dip whenever their data-refresh job slips. Not habit-eligible yet.'},
    ],
  },
  {
    id: 'ACC-1264',
    name: 'Marlowe & Voss LLP',
    tier: 'Growth',
    stage: 'activated',
    arrDisplay: '$88K',
    arrK: 88,
    seatsUsed: 22,
    seatsLicensed: 30,
    automationsPublished: 3,
    weeklyRuns: [1, 2, 3, 4, 4, 3, 5, 4],
    lastActivity: '6 Jul 2026',
    csm: PEOPLE.jonah.name,
    champion: 'Gideon Marlowe',
    blockers: [BLOCKERS['BLK-14']],
    activity: [
      {stamp: '2 Jun 2026 · 09:40', actor: 'Cohora', text: 'Activation: "Matter-intake conflict check" published.'},
      {stamp: '24 Jun 2026 · 12:15', actor: PEOPLE.jonah.name, text: 'Webhook automations blocked pending the security review board — raised BLK-14.'},
    ],
  },
  {
    id: 'ACC-1332',
    name: 'Copperline Energy',
    tier: 'Enterprise',
    stage: 'activated',
    arrDisplay: '$142K',
    arrK: 142,
    seatsUsed: 47,
    seatsLicensed: 90,
    automationsPublished: 5,
    weeklyRuns: [1, 3, 4, 4, 5, 6, 4, 5],
    lastActivity: '9 Jul 2026',
    csm: PEOPLE.priya.name,
    champion: 'Anya Petrenko',
    blockers: [],
    activity: [
      {stamp: '19 May 2026 · 15:00', actor: 'Cohora', text: 'Activation: "Outage-ticket escalation" published.'},
      {stamp: '9 Jul 2026 · 07:58', actor: 'Cohora', text: 'Habit signal: 4-week streak at or above 4 runs/week.'},
    ],
  },
  {
    id: 'ACC-1298',
    name: 'Atlas Parcel',
    tier: 'Growth',
    stage: 'activated',
    arrDisplay: '$120K',
    arrK: 120,
    seatsUsed: 33,
    seatsLicensed: 50,
    automationsPublished: 3,
    weeklyRuns: [0, 1, 3, 4, 4, 5, 5, 4],
    lastActivity: '8 Jul 2026',
    csm: PEOPLE.sam.name,
    champion: 'Kofi Mensah',
    blockers: [],
    activity: [
      {stamp: '3 Jun 2026 · 10:05', actor: 'Cohora', text: 'Activation: "Failed-delivery rebook" published.'},
      {stamp: '8 Jul 2026 · 16:30', actor: PEOPLE.sam.name, text: 'Depot leads asking for run quotas — good habit signal, watch seat counts.'},
    ],
  },
  {
    id: 'ACC-1341',
    name: 'Fernbrook Health',
    tier: 'Enterprise',
    stage: 'activated',
    arrDisplay: '$154K',
    arrK: 154,
    seatsUsed: 58,
    seatsLicensed: 110,
    automationsPublished: 2,
    weeklyRuns: [0, 2, 3, 3, 4, 5, 6, 5],
    lastActivity: '7 Jul 2026',
    csm: PEOPLE.jonah.name,
    champion: 'Sana Qureshi',
    blockers: [],
    activity: [
      {stamp: '10 Jun 2026 · 13:45', actor: 'Cohora', text: 'Activation: "Referral fax-to-task" published.'},
      {stamp: '7 Jul 2026 · 11:20', actor: PEOPLE.jonah.name, text: 'Clinic ops runs it every intake shift now; four straight weeks above threshold.'},
    ],
  },
  // ---- Habitual (4) — ARR 98+112+76+187 = 473 -----------------------------
  {
    id: 'ACC-1150',
    name: 'Quill Commerce',
    tier: 'Growth',
    stage: 'habitual',
    arrDisplay: '$98K',
    arrK: 98,
    seatsUsed: 31,
    seatsLicensed: 60,
    automationsPublished: 7,
    weeklyRuns: [4, 5, 5, 6, 5, 7, 6, 6],
    lastActivity: '9 Jul 2026',
    csm: PEOPLE.sam.name,
    champion: 'Yuki Tanaka',
    blockers: [],
    activity: [
      {stamp: '28 Apr 2026 · 09:00', actor: 'Cohora', text: 'Promoted to Habitual — 4-week streak confirmed.'},
      {stamp: '9 Jul 2026 · 08:15', actor: PEOPLE.sam.name, text: 'Utilization at 52% — not enough seat pressure to log expansion yet.'},
    ],
  },
  {
    id: 'ACC-1177',
    name: 'Trellis HR',
    tier: 'Growth',
    stage: 'habitual',
    arrDisplay: '$112K',
    arrK: 112,
    seatsUsed: 39,
    seatsLicensed: 45,
    automationsPublished: 6,
    weeklyRuns: [5, 6, 4, 5, 6, 5, 4, 4],
    lastActivity: '2 Jul 2026',
    csm: PEOPLE.jonah.name,
    blockers: [BLOCKERS['BLK-17']],
    activity: [
      {stamp: '12 May 2026 · 10:10', actor: 'Cohora', text: 'Promoted to Habitual — onboarding-packet automations run daily.'},
      {stamp: '26 Jun 2026 · 17:55', actor: PEOPLE.jonah.name, text: 'Champion resigned. Workspace-owner invite pending with the HRIS lead — raised BLK-17.'},
    ],
  },
  {
    id: 'ACC-1189',
    name: 'Saltbox Media',
    tier: 'Growth',
    stage: 'habitual',
    arrDisplay: '$76K',
    arrK: 76,
    seatsUsed: 24,
    seatsLicensed: 25,
    automationsPublished: 9,
    weeklyRuns: [4, 4, 6, 7, 8, 7, 9, 8],
    lastActivity: '9 Jul 2026',
    csm: PEOPLE.priya.name,
    champion: 'Callum Reid',
    blockers: [],
    activity: [
      {stamp: '5 May 2026 · 12:00', actor: 'Cohora', text: 'Promoted to Habitual — ad-trafficking flows run before every campaign.'},
      {stamp: '9 Jul 2026 · 09:40', actor: PEOPLE.priya.name, text: '24 of 25 seats in use; champion asked for add-on pricing. Expansion-ready.'},
    ],
  },
  {
    id: 'ACC-1203',
    name: 'Ironvale Robotics',
    tier: 'Enterprise',
    stage: 'habitual',
    arrDisplay: '$187K',
    arrK: 187,
    seatsUsed: 46,
    seatsLicensed: 48,
    automationsPublished: 11,
    weeklyRuns: [5, 5, 6, 6, 7, 8, 7, 9],
    lastActivity: '8 Jul 2026',
    csm: PEOPLE.priya.name,
    champion: 'Hannele Virtanen',
    blockers: [],
    activity: [
      {stamp: '21 Apr 2026 · 14:30', actor: 'Cohora', text: 'Promoted to Habitual — factory-floor exception routing.'},
      {stamp: '8 Jul 2026 · 13:05', actor: PEOPLE.priya.name, text: 'Procurement pre-approved a 24-seat add-on; waiting on our order log.'},
    ],
  },
  // ---- Expanded (3) — ARR 205+240+158 = 603 -------------------------------
  {
    id: 'ACC-1042',
    name: 'Summit Ledger',
    tier: 'Enterprise',
    stage: 'expanded',
    arrDisplay: '$205K',
    arrK: 205,
    seatsUsed: 128,
    seatsLicensed: 140,
    automationsPublished: 14,
    weeklyRuns: [6, 7, 7, 8, 8, 9, 8, 9],
    lastActivity: '9 Jul 2026',
    csm: PEOPLE.jonah.name,
    champion: 'Rosa Delgado',
    blockers: [],
    expansionOrderId: 'EXP-3012',
    activity: [
      {stamp: '17 Mar 2026 · 09:30', actor: 'Cohora', text: 'Expansion order EXP-3012 logged: +40 seats at renewal.'},
      {stamp: '9 Jul 2026 · 07:12', actor: 'Cohora', text: 'Close-books automations ran 9 times last week — cohort high.'},
    ],
  },
  {
    id: 'ACC-1018',
    name: 'Pacifica Rail',
    tier: 'Enterprise',
    stage: 'expanded',
    arrDisplay: '$240K',
    arrK: 240,
    seatsUsed: 190,
    seatsLicensed: 220,
    automationsPublished: 17,
    weeklyRuns: [7, 7, 8, 7, 9, 8, 9, 8],
    lastActivity: '8 Jul 2026',
    csm: PEOPLE.priya.name,
    champion: 'Owen Nakagawa',
    blockers: [],
    expansionOrderId: 'EXP-3027',
    activity: [
      {stamp: '2 Apr 2026 · 11:45', actor: 'Cohora', text: 'Expansion order EXP-3027 logged: +80 seats for the dispatch division.'},
      {stamp: '8 Jul 2026 · 15:20', actor: PEOPLE.priya.name, text: 'Reference call recorded for the Q3 cohort webinar.'},
    ],
  },
  {
    id: 'ACC-1096',
    name: 'Davenport Retail Group',
    tier: 'Growth',
    stage: 'expanded',
    arrDisplay: '$158K',
    arrK: 158,
    seatsUsed: 71,
    seatsLicensed: 85,
    automationsPublished: 12,
    weeklyRuns: [5, 6, 6, 7, 7, 8, 7, 8],
    lastActivity: '7 Jul 2026',
    csm: PEOPLE.sam.name,
    champion: 'Imani Walker',
    blockers: [],
    expansionOrderId: 'EXP-3033',
    activity: [
      {stamp: '19 May 2026 · 16:10', actor: 'Cohora', text: 'Expansion order EXP-3033 logged: +25 seats across store ops.'},
      {stamp: '7 Jul 2026 · 10:38', actor: PEOPLE.sam.name, text: 'Planogram-reset automation now templated for all regions.'},
    ],
  },
];

// Next sequential expansion order id (EXP-3012/3027/3033 already used above).
const FIRST_NEW_EXPANSION_ORDER = 3041;

// ---------------------------------------------------------------------------
// LIFECYCLE RULES — pure functions over an account. The aside's action
// panel and the refusal notes both read from THESE, so the button label,
// the disabled reason, and the live-region text can never disagree.
// ---------------------------------------------------------------------------

interface LifecycleAction {
  label: string;
  toStage: StageId;
}

const NEXT_ACTION: Record<StageId, LifecycleAction | null> = {
  invited: {label: 'Verify activation', toStage: 'activated'},
  activated: {label: 'Promote to Habitual', toStage: 'habitual'},
  habitual: {label: 'Log expansion order', toStage: 'expanded'},
  expanded: null,
};

function habitWeeksBelowThreshold(account: Account): number {
  const lastWindow = account.weeklyRuns.slice(-HABIT_WINDOW_WEEKS);
  return lastWindow.filter(runs => runs < HABIT_RUNS_PER_WEEK).length;
}

function seatUtilization(account: Account): number {
  return account.seatsLicensed === 0 ? 0 : account.seatsUsed / account.seatsLicensed;
}

/** Null = eligible; string = the visible refusal reason. Blockers win. */
function advanceRefusalReason(account: Account): string | null {
  if (account.blockers.length > 0) {
    const blocker = account.blockers[0];
    return \`Open blocker \${blocker.id} — \${blocker.label}. Resolve it before advancing.\`;
  }
  switch (account.stage) {
    case 'invited':
      return account.automationsPublished >= 1
        ? null
        : 'No automation published yet — activation requires at least one published automation.';
    case 'activated': {
      const below = habitWeeksBelowThreshold(account);
      return below === 0
        ? null
        : \`\${below} of the last \${HABIT_WINDOW_WEEKS} weeks fell below the \${HABIT_RUNS_PER_WEEK}-run habit threshold.\`;
    }
    case 'habitual': {
      const util = seatUtilization(account);
      return util >= EXPANSION_UTIL_THRESHOLD
        ? null
        : \`Seat utilization \${Math.round(util * 100)}% is under the \${Math.round(EXPANSION_UTIL_THRESHOLD * 100)}% expansion signal.\`;
    }
    case 'expanded':
      return 'Already at the final stage.';
  }
}

// ---------------------------------------------------------------------------
// HOOK — container-width ResizeObserver (repo pattern; see responsive
// contract in the header comment). Width 0 = first pre-observer frame; the
// caller falls back to a viewport query for that frame only.
// ---------------------------------------------------------------------------

function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// ---------------------------------------------------------------------------
// COHORA MARK — 24px inline SVG: three nested funnel chevrons narrowing to
// a dot, drawn in the quarantined BRAND fill.
// ---------------------------------------------------------------------------

function CohoraMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden style={{flexShrink: 0}}>
      <path d="M3 5h18l-4 5H7L3 5z" fill={BRAND} opacity={0.45} />
      <path d="M7 11h10l-3 4h-4l-3-4z" fill={BRAND} opacity={0.75} />
      <circle cx={12} cy={19} r={2.2} fill={BRAND} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// StageGlyph — 14px domain glyph; the SHAPE carries the stage, never color:
// invited = hollow circle, activated = half-filled disc, habitual = filled
// disc with an outer ring, expanded = filled disc with four rays.
// ---------------------------------------------------------------------------

function StageGlyph({stage, size = 14}: {stage: StageId; size?: number}) {
  const stroke = 'currentColor';
  const half = size / 2;
  const r = size * 0.28;
  return (
    <svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`} aria-hidden style={{flexShrink: 0}}>
      {stage === 'invited' ? (
        <circle cx={half} cy={half} r={r} fill="none" stroke={stroke} strokeWidth={1.5} />
      ) : null}
      {stage === 'activated' ? (
        <>
          <circle cx={half} cy={half} r={r} fill="none" stroke={stroke} strokeWidth={1.5} />
          <path
            d={\`M \${half} \${half - r} A \${r} \${r} 0 0 1 \${half} \${half + r} Z\`}
            fill={stroke}
          />
        </>
      ) : null}
      {stage === 'habitual' ? (
        <>
          <circle cx={half} cy={half} r={r} fill={stroke} />
          <circle cx={half} cy={half} r={r + 2.5} fill="none" stroke={stroke} strokeWidth={1} />
        </>
      ) : null}
      {stage === 'expanded' ? (
        <>
          <circle cx={half} cy={half} r={r} fill={stroke} />
          {[0, 90, 180, 270].map(angle => (
            <line
              key={angle}
              x1={half}
              y1={half - r - 1.5}
              x2={half}
              y2={half - r - 3.5}
              stroke={stroke}
              strokeWidth={1.5}
              transform={\`rotate(\${angle} \${half} \${half})\`}
            />
          ))}
        </>
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RunSparkline — 8-point weekly-run polyline on a FIXED 0–10 domain with a
// dashed habit-threshold hairline at 4 runs. Purely presentational; width
// varies by responsive band (72 / 56px), height is always 20px.
// ---------------------------------------------------------------------------

const SPARK_DOMAIN_MAX = 10;

function RunSparkline({runs, width, ariaLabel}: {runs: number[]; width: number; ariaLabel: string}) {
  const height = 20;
  const stepX = width / (runs.length - 1);
  const y = (v: number) => height - 2 - (v / SPARK_DOMAIN_MAX) * (height - 4);
  const points = runs.map((v, i) => \`\${(i * stepX).toFixed(1)},\${y(v).toFixed(1)}\`).join(' ');
  const allZero = runs.every(v => v === 0);
  const thresholdY = y(HABIT_RUNS_PER_WEEK);
  return (
    <svg width={width} height={height} viewBox={\`0 0 \${width} \${height}\`} role="img" aria-label={ariaLabel}>
      <line
        x1={0}
        y1={thresholdY}
        x2={width}
        y2={thresholdY}
        stroke={TRACK_GREY}
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      {allZero ? (
        // Zero-state: a flat baseline tick instead of a misleading line at 0.
        <line x1={0} y1={height - 2} x2={width} y2={height - 2} stroke="var(--color-border)" strokeWidth={1.5} />
      ) : (
        <polyline points={points} fill="none" stroke={BRAND} strokeWidth={1.5} strokeLinejoin="round" />
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AdoptionFunnel — fully custom; the DS has no vocabulary for tapering
// cohort-flow ribbons. Bars sit at each stage boundary with height =
// stage-CUMULATIVE count x UNIT; the ribbon between bar i and bar i+1
// tapers from cum(i) to cum(i+1), so a stage move visibly rewrites the
// geometry. Stage header buttons double as table filters (every displayed
// property is an affordance). Drop-off counts annotate each ribbon.
// ---------------------------------------------------------------------------

const FUNNEL_H = 128;
const FUNNEL_UNIT = 6; // px of ribbon thickness per account
const FUNNEL_BAR_W = 6;

interface AdoptionFunnelProps {
  counts: Record<StageId, number>; // accounts currently AT each stage
  total: number;
  width: number; // measured px width of the SVG area
  activeStages: ReadonlySet<StageId>;
  onToggleStage: (stage: StageId) => void;
}

function AdoptionFunnel({counts, total, width, activeStages, onToggleStage}: AdoptionFunnelProps) {
  // cum[i] = accounts at or beyond stage i (the classic funnel measure).
  const cum = STAGES.map((_, i) =>
    STAGES.slice(i).reduce((sum, stage) => sum + counts[stage.id], 0),
  );
  const colW = width / STAGES.length;
  const centerY = FUNNEL_H / 2;
  const hasFilter = activeStages.size > 0;

  return (
    <div className="fac-funnel-band">
      <div className="fac-funnel-headers" role="group" aria-label="Adoption stages — click to filter the table">
        {STAGES.map(stage => {
          const isActive = activeStages.has(stage.id);
          const share = total === 0 ? 0 : Math.round((counts[stage.id] / total) * 100);
          return (
            <button
              key={stage.id}
              type="button"
              className="fac-stage-head fac-focusable fac-fade"
              aria-pressed={isActive}
              aria-label={\`\${stage.label}: \${counts[stage.id]} accounts, \${share}% of cohort. \${isActive ? 'Filtering table — press to clear.' : 'Press to filter the table to this stage.'}\`}
              onClick={() => onToggleStage(stage.id)}>
              <span style={{color: BRAND_TEXT, display: 'inline-flex'}}>
                <StageGlyph stage={stage.id} />
              </span>
              <span className="fac-stage-label">{stage.label}</span>
              <span className="fac-stage-count">{counts[stage.id]}</span>
              <span className="fac-stage-share">{share}%</span>
            </button>
          );
        })}
      </div>
      <div className="fac-funnel-svg-wrap">
        {width > 0 ? (
          <svg width={width} height={FUNNEL_H} viewBox={\`0 0 \${width} \${FUNNEL_H}\`} aria-hidden>
            {/* Ribbons first (under the bars). Ribbon i spans column i,
                tapering cum[i] -> cum[i+1]; the taper IS the drop-off. */}
            {STAGES.slice(0, -1).map((stage, i) => {
              const x1 = colW * i + colW / 2 + FUNNEL_BAR_W / 2;
              const x2 = colW * (i + 1) + colW / 2 - FUNNEL_BAR_W / 2;
              const hLeft = cum[i] * FUNNEL_UNIT;
              const hRight = cum[i + 1] * FUNNEL_UNIT;
              const midX = (x1 + x2) / 2;
              const topPath = \`M \${x1} \${centerY - hLeft / 2} C \${midX} \${centerY - hLeft / 2}, \${midX} \${centerY - hRight / 2}, \${x2} \${centerY - hRight / 2}\`;
              const bottomPath = \`L \${x2} \${centerY + hRight / 2} C \${midX} \${centerY + hRight / 2}, \${midX} \${centerY + hLeft / 2}, \${x1} \${centerY + hLeft / 2} Z\`;
              const dropped = cum[i] - cum[i + 1];
              const dimmed =
                hasFilter && !activeStages.has(stage.id) && !activeStages.has(STAGES[i + 1].id);
              return (
                <g key={stage.id} className="fac-fade" opacity={dimmed ? 0.3 : 1}>
                  <path d={\`\${topPath} \${bottomPath}\`} fill={BRAND_SOFT} />
                  {dropped > 0 ? (
                    <text
                      x={midX}
                      y={centerY + hLeft / 2 + 14}
                      textAnchor="middle"
                      fontSize={10}
                      fontFamily="var(--font-family-code, ui-monospace, monospace)"
                      fill="var(--color-text-secondary)">
                      {\`−\${dropped} held at \${stage.label.toLowerCase()}\`}
                    </text>
                  ) : null}
                </g>
              );
            })}
            {/* Stage boundary bars: height = cumulative count. */}
            {STAGES.map((stage, i) => {
              const x = colW * i + colW / 2 - FUNNEL_BAR_W / 2;
              const h = Math.max(cum[i] * FUNNEL_UNIT, 4);
              const dimmed = hasFilter && !activeStages.has(stage.id);
              return (
                <g key={stage.id} className="fac-fade" opacity={dimmed ? 0.3 : 1}>
                  <rect
                    x={x}
                    y={centerY - h / 2}
                    width={FUNNEL_BAR_W}
                    height={h}
                    rx={2}
                    fill={BRAND}
                  />
                  <text
                    x={x + FUNNEL_BAR_W / 2}
                    y={centerY - h / 2 - 5}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="var(--font-family-code, ui-monospace, monospace)"
                    fill="var(--color-text-secondary)">
                    {\`≥\${stage.short} \${cum[i]}\`}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACCOUNT TABLE — 32px sticky head + 44px rows. Each row is a real <button>
// (aria-pressed = selected). Column set subtracts by band: xl shows all
// seven; the demo band drops seats and narrows sparklines; narrow drops
// sparkline + last activity; the 390px embed also drops ARR via CSS.
// ---------------------------------------------------------------------------

const BLOCKER_KIND_ICON: Record<BlockerKind, typeof WrenchIcon> = {
  technical: WrenchIcon,
  security: ShieldAlertIcon,
  champion: UserRoundXIcon,
};

interface TableGeometry {
  showSeats: boolean;
  showSpark: boolean;
  showLastActivity: boolean;
  sparkW: number;
  compactBlockers: boolean;
}

interface AccountRowProps {
  account: Account;
  isSelected: boolean;
  geometry: TableGeometry;
  onSelect: () => void;
  rowRef: (el: HTMLButtonElement | null) => void;
}

function AccountRow({account, isSelected, geometry, onSelect, rowRef}: AccountRowProps) {
  const stage = STAGES[STAGE_INDEX[account.stage]];
  const util = seatUtilization(account);
  return (
    <button
      type="button"
      ref={rowRef}
      className="fac-row fac-fade"
      aria-pressed={isSelected}
      aria-label={\`\${account.name}, \${stage.label}, \${account.arrDisplay} ARR\${account.blockers.length > 0 ? \`, \${account.blockers.length} open blocker\${account.blockers.length > 1 ? 's' : ''}\` : ''}\`}
      onClick={onSelect}>
      {/* BRAND fill: selected row's 3px accent bar. */}
      <span
        className="fac-row-accent"
        style={{backgroundColor: isSelected ? BRAND : 'transparent'}}
        aria-hidden
      />
      <span className="fac-cell-account">
        <span className="fac-mono" style={{color: 'var(--color-text-secondary)'}}>
          {account.id}
        </span>
        <span className="fac-account-name">{account.name}</span>
        <span style={{flexShrink: 0}}>
          <Token size="sm" color="default" label={account.tier} />
        </span>
      </span>
      <span className="fac-cell fac-cell-num fac-cell-arr" style={{width: 64}}>
        {account.arrDisplay}
      </span>
      {geometry.showSeats ? (
        <span
          className="fac-cell fac-cell-num"
          style={{width: 84, color: util >= EXPANSION_UTIL_THRESHOLD ? undefined : 'var(--color-text-secondary)'}}>
          {account.seatsUsed}/{account.seatsLicensed}
        </span>
      ) : null}
      {geometry.showSpark ? (
        <span className="fac-cell" style={{width: geometry.sparkW + GUTTER}}>
          <RunSparkline
            runs={account.weeklyRuns}
            width={geometry.sparkW}
            ariaLabel={\`Weekly runs, last 8 weeks: \${account.weeklyRuns.join(', ')}\`}
          />
        </span>
      ) : null}
      <span className="fac-cell" style={{width: 104, color: BRAND_TEXT}}>
        <StageGlyph stage={account.stage} />
        <span style={{fontSize: 12, color: 'var(--color-text-primary)'}}>{stage.label}</span>
      </span>
      <span className="fac-cell" style={{width: geometry.compactBlockers ? 28 : 160}}>
        {account.blockers.length === 0 ? (
          <span style={{fontSize: 11, color: 'var(--color-text-secondary)'}} aria-hidden>
            —
          </span>
        ) : geometry.compactBlockers ? (
          <span className="fac-blocker-pip" aria-label={\`\${account.blockers.length} open blockers\`}>
            {account.blockers.length}
          </span>
        ) : (
          <span className="fac-blocker-chip">
            <Icon icon={BLOCKER_KIND_ICON[account.blockers[0].kind]} size="xsm" color="inherit" />
            <span>{account.blockers[0].label}</span>
          </span>
        )}
      </span>
      {geometry.showLastActivity ? (
        <span className="fac-cell fac-cell-num" style={{width: 82, color: 'var(--color-text-secondary)'}}>
          {account.lastActivity}
        </span>
      ) : null}
    </button>
  );
}

interface AccountTableProps {
  accounts: Account[];
  selectedId: string | null;
  geometry: TableGeometry;
  onSelect: (id: string) => void;
  rowRefs: RefObject<Map<string, HTMLButtonElement>>;
  emptyReason: string | null;
}

function AccountTable({accounts, selectedId, geometry, onSelect, rowRefs, emptyReason}: AccountTableProps) {
  const registerRef = (id: string) => (el: HTMLButtonElement | null) => {
    const map = rowRefs.current;
    if (map == null) return;
    if (el == null) map.delete(id);
    else map.set(id, el);
  };
  return (
    <div className="fac-table-scroll">
      <div className="fac-thead" aria-hidden>
        <span className="fac-section-label" style={{flex: 1, paddingLeft: GUTTER}}>
          Account
        </span>
        <span className="fac-section-label fac-cell-arr" style={{width: 64, textAlign: 'right'}}>
          ARR
        </span>
        {geometry.showSeats ? (
          <span className="fac-section-label" style={{width: 84, textAlign: 'right'}}>
            Seats
          </span>
        ) : null}
        {geometry.showSpark ? (
          <span className="fac-section-label" style={{width: geometry.sparkW + GUTTER}}>
            Runs · 8w
          </span>
        ) : null}
        <span className="fac-section-label" style={{width: 104}}>
          Stage
        </span>
        <span className="fac-section-label" style={{width: geometry.compactBlockers ? 28 : 160}}>
          {geometry.compactBlockers ? 'Blk' : 'Blockers'}
        </span>
        {geometry.showLastActivity ? (
          <span className="fac-section-label" style={{width: 82}}>
            Last seen
          </span>
        ) : null}
      </div>
      {accounts.length === 0 && emptyReason != null ? (
        <div className="fac-empty">
          <Icon icon={CircleAlertIcon} size="lg" color="secondary" />
          <Heading level={2}>No accounts match</Heading>
          <Text type="supporting" size="sm" color="secondary">
            {emptyReason}
          </Text>
        </div>
      ) : (
        accounts.map(account => (
          <AccountRow
            key={account.id}
            account={account}
            isSelected={selectedId === account.id}
            geometry={geometry}
            onSelect={() => onSelect(account.id)}
            rowRef={registerRef(account.id)}
          />
        ))
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FOOTER STRIP — bottom-left corner owner: stage-glyph legend + the derived
// ARR line (cohort total and expanded slice re-derive from the row set).
// ---------------------------------------------------------------------------

function FooterStrip({accounts}: {accounts: Account[]}) {
  const totalArr = accounts.reduce((sum, a) => sum + a.arrK, 0);
  const expandedArr = accounts
    .filter(a => a.stage === 'expanded')
    .reduce((sum, a) => sum + a.arrK, 0);
  return (
    <div className="fac-footer-strip">
      {STAGES.map(stage => (
        <span key={stage.id} className="fac-legend-key">
          <span style={{color: BRAND_TEXT, display: 'inline-flex'}}>
            <StageGlyph stage={stage.id} size={12} />
          </span>
          {stage.label}
        </span>
      ))}
      <span style={{flex: 1}} aria-hidden />
      <span className="fac-mono" style={{color: 'var(--color-text-secondary)'}}>
        {\`Cohort ARR $\${(totalArr / 1000).toFixed(2)}M · Expanded $\${expandedArr}K\`}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LIFECYCLE ASIDE — identity 64px > stage path 36px > 44px metric rows >
// blockers > the action panel (signature interaction) > activity log.
// Purely presentational: every mutation is a callback into the page owner.
// ---------------------------------------------------------------------------

function MetricRow({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className="fac-metric-row">
      <span className="fac-metric-label">{label}</span>
      <StackItem size="fill">{children}</StackItem>
    </div>
  );
}

interface LifecycleAsideProps {
  account: Account | null;
  isOverlay: boolean;
  refusalNote: string | null; // set by the owner when an advance is refused
  sparkW: number;
  onClose: () => void;
  onAdvance: (id: string) => void;
  onRegress: (id: string) => void;
  onResolveBlocker: (accountId: string, blockerId: string) => void;
}

function LifecycleAside({
  account,
  isOverlay,
  refusalNote,
  sparkW,
  onClose,
  onAdvance,
  onRegress,
  onResolveBlocker,
}: LifecycleAsideProps) {
  if (account == null) {
    return (
      <div className="fac-empty">
        <Icon icon={RocketIcon} size="lg" color="secondary" />
        <Heading level={2}>No account selected</Heading>
        <Text type="supporting" size="sm" color="secondary">
          Select a table row to review its lifecycle
        </Text>
      </div>
    );
  }

  const stageIdx = STAGE_INDEX[account.stage];
  const action = NEXT_ACTION[account.stage];
  const refusal = advanceRefusalReason(account);
  const util = seatUtilization(account);
  const utilPct = Math.round(util * 100);
  const belowWeeks = habitWeeksBelowThreshold(account);

  return (
    <>
      <div className="fac-aside-identity">
        <StackItem size="fill">
          <VStack gap={0}>
            <HStack gap={2} vAlign="center">
              <span className="fac-mono" style={{color: 'var(--color-text-secondary)'}}>
                {account.id}
              </span>
              <span style={{flexShrink: 0}}>
                <Token size="sm" color="default" label={account.tier} />
              </span>
              {account.expansionOrderId != null ? (
                <span style={{flexShrink: 0}}>
                  <Token size="sm" color="green" label={account.expansionOrderId} />
                </span>
              ) : null}
            </HStack>
            <Heading level={2} maxLines={1}>
              {account.name}
            </Heading>
          </VStack>
        </StackItem>
        {isOverlay ? (
          <Button
            label="Close account panel"
            isIconOnly
            variant="ghost"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClose}
          />
        ) : null}
      </div>
      <div className="fac-aside-scroll">
        <VStack gap={3}>
          {/* Stage path — one segment per ladder rung; filled through the
              current stage, labeled beneath. */}
          <VStack gap={1}>
            <span className="fac-section-label">Adoption stage</span>
            <div className="fac-stage-path" aria-label={\`Stage \${stageIdx + 1} of \${STAGES.length}: \${STAGES[stageIdx].label}\`}>
              {STAGES.map((stage, i) => (
                <VStack key={stage.id} gap={1} style={{flex: 1}}>
                  <span
                    className="fac-stage-path-seg fac-fade"
                    style={i <= stageIdx ? {backgroundColor: BRAND} : undefined}
                  />
                  <Text type="supporting" size="xsm" color={i === stageIdx ? 'primary' : 'secondary'}>
                    {stage.short}
                  </Text>
                </VStack>
              ))}
            </div>
            <Text type="supporting" size="xsm" color="secondary">
              {STAGES[stageIdx].definition}
            </Text>
          </VStack>
          <Divider />
          <VStack gap={0}>
            <MetricRow label="ARR">
              <Text type="body" size="sm" hasTabularNumbers>
                {account.arrDisplay} · CSM {account.csm}
              </Text>
            </MetricRow>
            <MetricRow label="Seats">
              <HStack gap={2} vAlign="center">
                <span className="fac-mono">{\`\${account.seatsUsed}/\${account.seatsLicensed}\`}</span>
                <span className="fac-util-track" aria-label={\`Seat utilization \${utilPct}%\`}>
                  <span
                    className="fac-util-fill fac-fade"
                    style={{
                      width: \`\${Math.min(utilPct, 100)}%\`,
                      backgroundColor: util >= EXPANSION_UTIL_THRESHOLD ? OK_GREEN : BRAND,
                    }}
                  />
                </span>
                <span className="fac-mono" style={{color: 'var(--color-text-secondary)'}}>
                  {utilPct}%
                </span>
              </HStack>
            </MetricRow>
            <MetricRow label="Automations">
              <Text type="body" size="sm" hasTabularNumbers>
                {account.automationsPublished} published
              </Text>
            </MetricRow>
            <MetricRow label="Runs · 8w">
              <HStack gap={2} vAlign="center">
                <RunSparkline
                  runs={account.weeklyRuns}
                  width={sparkW}
                  ariaLabel={\`Weekly runs, last 8 weeks: \${account.weeklyRuns.join(', ')}\`}
                />
                <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                  {belowWeeks === 0
                    ? \`habit streak \${HABIT_WINDOW_WEEKS}w\`
                    : \`\${belowWeeks}/\${HABIT_WINDOW_WEEKS}w below \${HABIT_RUNS_PER_WEEK}\`}
                </Text>
              </HStack>
            </MetricRow>
            <MetricRow label="Champion">
              {account.champion != null ? (
                <Text type="body" size="sm">
                  {account.champion}
                </Text>
              ) : (
                <Text type="supporting" size="sm" color="secondary">
                  None — workspace-owner invite pending
                </Text>
              )}
            </MetricRow>
          </VStack>
          <Divider />
          {/* Blockers — each resolve is a real mutation with downstream
              consequences (chip clears in the table, refusal reason lifts). */}
          {account.blockers.length > 0 ? (
            <VStack gap={1}>
              <span className="fac-section-label">Open blockers</span>
              {account.blockers.map(blocker => (
                <div key={blocker.id} className="fac-blocker-row">
                  <span style={{color: WARN, display: 'inline-flex', flexShrink: 0}}>
                    <Icon icon={BLOCKER_KIND_ICON[blocker.kind]} size="sm" color="inherit" />
                  </span>
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <HStack gap={2} vAlign="center">
                        <span className="fac-mono">{blocker.id}</span>
                        <Text type="label" size="xsm">
                          {blocker.label}
                        </Text>
                      </HStack>
                      <Text type="supporting" size="xsm" color="secondary">
                        {blocker.detail}
                      </Text>
                    </VStack>
                  </StackItem>
                  <Button
                    label="Resolve"
                    variant="secondary"
                    size="sm"
                    onClick={() => onResolveBlocker(account.id, blocker.id)}
                  />
                </div>
              ))}
              <Divider />
            </VStack>
          ) : null}
          {/* THE signature interaction: the stage-gated lifecycle action. */}
          <div className="fac-action-panel" style={refusal == null && action != null ? {borderColor: BRAND_TEXT, backgroundColor: BRAND_SOFT} : undefined}>
            <span className="fac-section-label">Lifecycle action</span>
            {action != null ? (
              <>
                <HStack gap={2} vAlign="center">
                  <Button
                    label={action.label}
                    variant="primary"
                    size="sm"
                    icon={<Icon icon={ArrowRightIcon} size="sm" />}
                    isDisabled={refusal != null}
                    onClick={() => onAdvance(account.id)}
                  />
                  <Text type="supporting" size="xsm" color="secondary">
                    → {STAGES[STAGE_INDEX[action.toStage]].label}
                  </Text>
                </HStack>
                {refusal != null ? (
                  <div className="fac-refusal" role="note">
                    <Icon icon={CircleAlertIcon} size="xsm" color="inherit" />
                    <span>{refusal}</span>
                  </div>
                ) : (
                  <Text type="supporting" size="xsm" color="secondary">
                    Eligible — all gates for {STAGES[STAGE_INDEX[action.toStage]].label.toLowerCase()} pass.
                  </Text>
                )}
              </>
            ) : (
              <HStack gap={2} vAlign="center">
                <Icon icon={CheckIcon} size="sm" color="secondary" />
                <Text type="supporting" size="sm" color="secondary">
                  Final stage — expansion order {account.expansionOrderId ?? '—'} on file.
                </Text>
              </HStack>
            )}
            {refusalNote != null ? (
              <div className="fac-refusal" role="alert">
                <Icon icon={CircleAlertIcon} size="xsm" color="inherit" />
                <span>{refusalNote}</span>
              </div>
            ) : null}
            {stageIdx > 0 ? (
              <HStack gap={2} vAlign="center">
                <Button
                  label="Regress one stage"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={ArrowLeftIcon} size="sm" />}
                  onClick={() => onRegress(account.id)}
                />
                <Text type="supporting" size="xsm" color="secondary">
                  Correction — logs to the account.
                </Text>
              </HStack>
            ) : null}
          </div>
          {/* Activity log — newest first; mutations append with NOW_STAMP. */}
          <VStack gap={1}>
            <span className="fac-section-label">Activity</span>
            <div role="log" aria-label={\`\${account.name} activity\`}>
              {[...account.activity].reverse().map((entry, index) => (
                <div key={\`\${entry.stamp}-\${index}\`} className="fac-log-row">
                  <HStack gap={2} vAlign="center">
                    <Text type="label" size="xsm">
                      {entry.actor}
                    </Text>
                    <span className="fac-mono" style={{fontSize: 11, color: 'var(--color-text-secondary)'}}>
                      {entry.stamp}
                    </span>
                  </HStack>
                  <Text type="body" size="sm">
                    {entry.text}
                  </Text>
                </div>
              ))}
            </div>
          </VStack>
        </VStack>
      </div>
      {/* Bottom-right corner owner while an account is selected. */}
      <div className="fac-aside-footer">
        <Text type="supporting" size="xsm" color="secondary">
          Q3 cohort · {PEOPLE.mara.name}
        </Text>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// PAGE — THE single state owner. Every surface receives data + callbacks;
// a stage move is ONE setState whose consequences are visible in the
// funnel, the table, the chips, the header stat, the footer ARR line, and
// the account log simultaneously.
// ---------------------------------------------------------------------------

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  );
}

function stageCounts(accounts: Account[]): Record<StageId, number> {
  const counts: Record<StageId, number> = {invited: 0, activated: 0, habitual: 0, expanded: 0};
  for (const account of accounts) {
    counts[account.stage] += 1;
  }
  return counts;
}

export default function FeatureAdoptionCohortTemplate() {
  // Responsive bands measured on the VIEW ROOT container, not the viewport
  // (see responsive contract). Width 0 = first pre-observer frame; viewport
  // queries cover only that frame.
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const viewWidth = useElementWidth(viewRootRef);
  const isViewportMid = useMediaQuery('(max-width: 1279px)');
  const isViewportNarrow = useMediaQuery('(max-width: 1023px)');
  const isMid = viewWidth > 0 ? viewWidth < 1200 : isViewportMid;
  const isNarrow = viewWidth > 0 ? viewWidth < 1000 : isViewportNarrow;

  const asideW = isNarrow ? 340 : isMid ? 320 : 360;
  const tableGeometry: TableGeometry = isNarrow
    ? {showSeats: false, showSpark: false, showLastActivity: false, sparkW: 56, compactBlockers: true}
    : isMid
      ? {showSeats: false, showSpark: true, showLastActivity: true, sparkW: 56, compactBlockers: true}
      : {showSeats: true, showSpark: true, showLastActivity: true, sparkW: 72, compactBlockers: false};
  // Funnel SVG width = main-column inner width (band padding subtracted).
  const funnelW = Math.max(
    0,
    (isNarrow ? viewWidth : viewWidth - asideW) - GUTTER * 2 - 1,
  );

  // ---- THE single state owner ---------------------------------------------
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeStages, setActiveStages] = useState<ReadonlySet<StageId>>(() => new Set());
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [refusalNote, setRefusalNote] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [nextOrderNum, setNextOrderNum] = useState(FIRST_NEW_EXPANSION_ORDER);
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const selectAccount = useCallback((id: string) => {
    setSelectedId(id);
    setRefusalNote(null);
    setOverlayOpen(true);
  }, []);

  const closeOverlay = useCallback(() => {
    setOverlayOpen(false);
    if (selectedId != null) rowRefs.current.get(selectedId)?.focus();
  }, [selectedId]);

  // Escape layering: overlay aside first, then selection. Never while typing.
  const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || isTypingTarget(event.target)) return;
    if (isNarrow && overlayOpen) {
      closeOverlay();
    } else if (selectedId != null) {
      setSelectedId(null);
    }
  };

  // ---- Signature interaction: stage-gated lifecycle advance ---------------
  const advance = useCallback(
    (id: string) => {
      const account = accounts.find(a => a.id === id);
      if (account == null) return;
      const action = NEXT_ACTION[account.stage];
      if (action == null) return;
      const refusal = advanceRefusalReason(account);
      if (refusal != null) {
        // Refusals never mutate — visible note + polite announcement only.
        setRefusalNote(refusal);
        setAnnouncement(\`\${account.name} not moved: \${refusal}\`);
        return;
      }
      const orderId = account.stage === 'habitual' ? \`EXP-\${nextOrderNum}\` : undefined;
      if (orderId != null) setNextOrderNum(n => n + 1);
      setAccounts(prev =>
        prev.map(a => {
          if (a.id !== id) return a;
          const entryText =
            a.stage === 'invited'
              ? 'Activation verified — moved to Activated.'
              : a.stage === 'activated'
                ? \`Habit threshold confirmed (\${HABIT_WINDOW_WEEKS}w at ≥\${HABIT_RUNS_PER_WEEK} runs) — moved to Habitual.\`
                : \`Expansion order \${orderId} logged — moved to Expanded.\`;
          return {
            ...a,
            stage: action.toStage,
            expansionOrderId: orderId ?? a.expansionOrderId,
            lastActivity: '9 Jul 2026',
            activity: [...a.activity, {stamp: NOW_STAMP, actor: PEOPLE.mara.name, text: entryText}],
          };
        }),
      );
      setRefusalNote(null);
      // Announce with the post-move counts (derived, not typed).
      const nextCounts = stageCounts(
        accounts.map(a => (a.id === id ? {...a, stage: action.toStage} : a)),
      );
      setAnnouncement(
        \`\${account.name} moved to \${STAGES[STAGE_INDEX[action.toStage]].label}. \` +
          STAGES.map(s => \`\${s.label} \${nextCounts[s.id]}\`).join(', ') +
          '.',
      );
    },
    [accounts, nextOrderNum],
  );

  const regress = useCallback(
    (id: string) => {
      const account = accounts.find(a => a.id === id);
      if (account == null) return;
      const idx = STAGE_INDEX[account.stage];
      if (idx === 0) return;
      const toStage = STAGES[idx - 1].id;
      const voidedOrder = account.stage === 'expanded' ? account.expansionOrderId : undefined;
      setAccounts(prev =>
        prev.map(a => {
          if (a.id !== id) return a;
          return {
            ...a,
            stage: toStage,
            expansionOrderId: voidedOrder != null ? undefined : a.expansionOrderId,
            activity: [
              ...a.activity,
              {
                stamp: NOW_STAMP,
                actor: PEOPLE.mara.name,
                text:
                  voidedOrder != null
                    ? \`Correction: regressed to \${STAGES[idx - 1].label}; expansion order \${voidedOrder} voided.\`
                    : \`Correction: regressed to \${STAGES[idx - 1].label}.\`,
              },
            ],
          };
        }),
      );
      setRefusalNote(null);
      const nextCounts = stageCounts(
        accounts.map(a => (a.id === id ? {...a, stage: toStage} : a)),
      );
      setAnnouncement(
        \`\${account.name} regressed to \${STAGES[idx - 1].label}. \` +
          STAGES.map(s => \`\${s.label} \${nextCounts[s.id]}\`).join(', ') +
          '.',
      );
    },
    [accounts],
  );

  const resolveBlocker = useCallback((accountId: string, blockerId: string) => {
    setAccounts(prev =>
      prev.map(a => {
        if (a.id !== accountId) return a;
        const blocker = a.blockers.find(b => b.id === blockerId);
        if (blocker == null) return a;
        return {
          ...a,
          blockers: a.blockers.filter(b => b.id !== blockerId),
          lastActivity: '9 Jul 2026',
          activity: [
            ...a.activity,
            {stamp: NOW_STAMP, actor: PEOPLE.mara.name, text: \`Blocker \${blocker.id} (\${blocker.label}) resolved.\`},
          ],
        };
      }),
    );
    setRefusalNote(null);
    setAnnouncement(\`Blocker \${blockerId} resolved.\`);
  }, []);

  // ---- Derived (self-cross-checking: computed from the rows) --------------
  const counts = stageCounts(accounts);
  const total = accounts.length;
  const pastInvited = total - counts.invited;
  const activationLine = \`Activation \${((pastInvited / Math.max(total, 1)) * 100).toFixed(1)}% · \${pastInvited}/\${total} past Invited\`;
  const blockedCount = accounts.filter(a => a.blockers.length > 0).length;

  const toggleStage = useCallback((stage: StageId) => {
    setActiveStages(prev => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  }, []);

  const visibleAccounts = [...accounts]
    .filter(a => (activeStages.size === 0 || activeStages.has(a.stage)) && (!blockedOnly || a.blockers.length > 0))
    .sort((a, b) => {
      const stageDelta = STAGE_INDEX[a.stage] - STAGE_INDEX[b.stage];
      if (stageDelta !== 0) return stageDelta;
      return b.arrK - a.arrK;
    });

  const emptyReason =
    visibleAccounts.length === 0
      ? blockedOnly
        ? 'No blocked accounts in the selected stages — clear a filter to see rows.'
        : 'No accounts in the selected stages.'
      : null;

  const selectedAccount = selectedId != null ? (accounts.find(a => a.id === selectedId) ?? null) : null;
  const asideVisible = !isNarrow || overlayOpen;

  return (
    <div className={SCOPE} onKeyDown={handleRootKeyDown}>
      <style>{TEMPLATE_CSS}</style>
      <span aria-live="polite" role="status" className="fac-visually-hidden">
        {announcement}
      </span>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div className="fac-header-bar">
              {/* Top-left corner: Cohora mark + cohort title. */}
              <CohoraMark />
              <Text type="label" size="sm">
                Cohora
              </Text>
              <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                Automation Studio · Q3 enterprise cohort · Lumen Suite
              </Text>
              <span style={{flexShrink: 0}}>
                <Token size="sm" color="green" label="Live" />
              </span>
              <span style={{flex: 1}} aria-hidden />
              {/* Top-right corner: derived activation stat + PM avatar. */}
              <span className="fac-header-stat">{activationLine}</span>
              <Avatar name={PEOPLE.mara.name} size="small" />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} className="fac-view-root">
              <div className="fac-main-col">
                <AdoptionFunnel
                  counts={counts}
                  total={total}
                  width={funnelW}
                  activeStages={activeStages}
                  onToggleStage={toggleStage}
                />
                <div className="fac-toolbar">
                  <span className="fac-section-label">Accounts</span>
                  <button
                    type="button"
                    className="fac-chip fac-chip-blocked fac-focusable fac-fade"
                    aria-pressed={blockedOnly}
                    onClick={() => setBlockedOnly(prev => !prev)}>
                    <Icon icon={CircleAlertIcon} size="xsm" color="inherit" />
                    {\`Blocked · \${blockedCount}\`}
                  </button>
                  {activeStages.size > 0 || blockedOnly ? (
                    <button
                      type="button"
                      className="fac-chip fac-focusable fac-fade"
                      onClick={() => {
                        setActiveStages(new Set());
                        setBlockedOnly(false);
                      }}>
                      <Icon icon={XIcon} size="xsm" color="inherit" />
                      Clear filters
                    </button>
                  ) : null}
                  <span style={{flex: 1}} aria-hidden />
                  <span className="fac-mono" style={{color: 'var(--color-text-secondary)'}}>
                    {\`\${visibleAccounts.length} of \${total} accounts\`}
                  </span>
                </div>
                <AccountTable
                  accounts={visibleAccounts}
                  selectedId={selectedId}
                  geometry={tableGeometry}
                  onSelect={selectAccount}
                  rowRefs={rowRefs}
                  emptyReason={emptyReason}
                />
                <FooterStrip accounts={accounts} />
              </div>
              {asideVisible ? (
                <aside
                  aria-label="Account lifecycle detail"
                  className={\`fac-aside\${isNarrow ? ' fac-aside-overlay' : ''}\`}
                  style={isNarrow ? undefined : {width: asideW}}>
                  <LifecycleAside
                    account={selectedAccount}
                    isOverlay={isNarrow}
                    refusalNote={refusalNote}
                    sparkW={120}
                    onClose={closeOverlay}
                    onAdvance={advance}
                    onRegress={regress}
                    onResolveBlocker={resolveBlocker}
                  />
                </aside>
              ) : null}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};