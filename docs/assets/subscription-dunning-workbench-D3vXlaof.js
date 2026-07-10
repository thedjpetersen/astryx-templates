var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Dunwell recovery desk for
 *   Parcelbase (a shipping-API SaaS) with suite "today" anchor Mon 6 Jul
 *   2026. Ten delinquent-or-resolved accounts AC-1011…AC-1052 with fixed
 *   decline dates and integer day offsets from each card decline (day 0),
 *   three retry paths with literal retry-day arrays (P-STD d3/7/14 · 31%,
 *   P-SMART d1/4/9/16 · 42%, P-GRACE d5/12/20 · 26%), and three outreach
 *   templates each with two variants carrying frozen A/B stats. No
 *   Date.now(), no Math.random(), no timers, no network assets.
 *   Funnel cross-check at load (derived live from the account rows, never
 *   typed): failed 3 = AC-1046 $420 + AC-1052 $49 + AC-1029 $2,150 =
 *   $2,619 · retrying 4 = AC-1041 $1,240 + AC-1038 $980 + AC-1033 $360 +
 *   AC-1019 $29 = $2,609 · engaged 1 = AC-1024 $310 · recovered 1 =
 *   AC-1015 $540 · churned 1 = AC-1011 $59.
 *   Forecast cross-check at load: retrying Σ mrr × path% = 1,240×.42
 *   (520.80) + 980×.31 (303.80) + 360×.26 (93.60) + 29×.42 (12.18) =
 *   930.38, engaged Σ mrr × .68 = 310×.68 = 210.80; 930.38 + 210.80 =
 *   1,141.18 → the header chip renders $1,141 (Math.round, derived live).
 * @output Subscription Dunning Workbench — a billing recovery specialist's
 *   surface: a live RecoveryFunnel strip whose five stage segments double
 *   as queue filters; a shared 21-day RetryScheduleBoard where every
 *   account row plots its decline (day 0), past failed attempts (slashed
 *   hollow dots), path-scheduled future retries (hollow accent dots), and
 *   terminal outcomes against ONE day axis with a today marker per row
 *   (each account's own day-since-decline); and a PlaybookPane where the
 *   operator drafts a retry path + outreach template + A/B variant for
 *   the selected account. SIGNATURE: Apply path commits the draft through
 *   the single account store — the row's schedule redraws with the new
 *   retry-day dots, the account advances failed → retrying in the funnel
 *   (segment counts and $ re-derive), and the header recovery-forecast
 *   chip re-derives from Σ mrr × path recovery% in the same render. Mark
 *   recovered / Mark churned cascade through the same store.
 * @position Page template; emitted by \`astryx template
 *   subscription-dunning-workbench\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header bar 52px (Dunwell mark + workspace/billing-cycle line | live
 *   forecast chip + aria-live action ticker + operator avatar)
 *   | funnel strip 96px (five stage segments, each a real button filter)
 *   | view root (flex, height 100%, minHeight 0, overflow hidden)
 *     | main column (day-axis header 32px > account rows 64px in one
 *       vertical scroller > queue footer 32px)
 *     | aside 360px PlaybookPane (identity 64px > path radio rows 56px >
 *       template rows + A/B chips > merge-field preview > attempt log >
 *       footer action bar 52px), own scroll.
 * Container policy: app-shell archetype — frame rows, strips, and panels
 *   only; no Cards. Funnel segments, schedule rows, and path rows are
 *   class-styled divs/buttons on the content surface.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   BRAND = light-dark(#1D39C4, #91A7FF) — ultramarine. Contrast math:
 *   #1D39C4 on #FFFFFF = 8.6:1; #91A7FF on #1E1E1E = 7.3:1 — both clear
 *   4.5:1, so the accent is legal as text AND fill. State colors as
 *   light-dark pairs with math at each declaration; every state color
 *   pairs with a shape channel (slash / hollow vs solid / square pip vs
 *   round dot / hatch), never color alone.
 *
 * Density grid (FIXED, repeated verbatim in the CSS): header bar 52px;
 * funnel strip 96px; day-axis header 32px; account rows 64px; timeline
 * lane 24px inside each row; aside 360px (400px ≥1200, overlay <1000);
 * aside heavy rows 44px; path rows 56px; queue footer 32px; aside footer
 * action bar 52px; single gutter GUTTER = 12 (all padding/margins are
 * GUTTER or GUTTER/2 = 6); mono metadata 12px; body 13px; section labels
 * 11px uppercase tracking 0.06em.
 *
 * Responsive contract — CONTAINER width via useElementWidth(viewRootRef)
 * ResizeObserver (the inline demo stage is ~1045–1075px inside a 1440px
 * window, so viewport media queries would lie there; width 0 = first
 * pre-observer frame, treated as the wide band):
 * - W >= 1200: aside 400px, id column 220px with plan + seats meta, axis
 *   labels every 3 days.
 * - 1000 <= W < 1200 (canonical demo band): aside 360px, id column
 *   176px, seats drop from row meta, axis labels at 0/7/14/21 with minor
 *   ticks every day.
 * - W < 1000: aside leaves the flex flow and becomes a 360px absolute
 *   overlay (right 0, shadow, opens on row selection, X closes and the
 *   selected row regains focus); the decline-code chip collapses to its
 *   colored square pip.
 * - W < 640 (the real 390px embed iframe): funnel strip wraps into a
 *   2-per-row grid of compact segments, the MRR column drops (the value
 *   still lives in the pane), overlay aside goes full-width. Subtraction,
 *   not squeeze.
 * Corner map: top-left Dunwell mark + workspace line; top-right forecast
 * chip + aria-live action ticker + operator avatar; bottom-left queue
 * footer count line pinned under the scroller; bottom-right PlaybookPane
 * footer action bar (empty-state pane cedes the corner to the queue
 * footer).
 */

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';

import {
  BadgeCheckIcon,
  CircleDollarSignIcon,
  CreditCardIcon,
  FlagIcon,
  RotateCcwIcon,
  SendIcon,
  ShieldAlertIcon,
  SplitIcon,
  XIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Token} from '@astryxdesign/core/Token';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark()
// pair with contrast math. Data-viz categorical tokens are not injected by
// the demo, so state colors are self-contained pairs.
// ---------------------------------------------------------------------------

// THE quarantined brand accent (ultramarine). #1D39C4 on #FFFFFF = 8.6:1;
// #91A7FF on #1E1E1E = 7.3:1 — legal as text and as fill on both schemes.
const BRAND = 'light-dark(#1D39C4, #91A7FF)';
const BRAND_SOFT = 'light-dark(rgba(29, 57, 196, 0.08), rgba(145, 167, 255, 0.14))';

// Recovered green: #0B7A2C on white = 5.3:1; #4ADE80 on #1E1E1E = 9.1:1.
const OK_GREEN = 'light-dark(#0B7A2C, #4ADE80)';
const OK_SOFT = 'light-dark(rgba(11, 122, 44, 0.10), rgba(74, 222, 128, 0.14))';
// Engaged amber: #A16207 on white = 5.0:1; #FBBF24 on #1E1E1E = 9.9:1.
const WARN = 'light-dark(#A16207, #FBBF24)';
const WARN_SOFT = 'light-dark(rgba(161, 98, 7, 0.12), rgba(251, 191, 36, 0.16))';
// Failed red: #DC2626 on white = 4.5:1; #F87171 on #1E1E1E = 6.6:1.
const DANGER = 'light-dark(#DC2626, #F87171)';
const DANGER_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
// Churn hatch (grey family) — the 45° stripe geometry, not color, carries
// the "window closed" meaning.
const HATCH_GREY = 'light-dark(rgba(60, 60, 67, 0.18), rgba(235, 235, 245, 0.20))';

const GUTTER = 12;
const MONO = 'var(--font-family-code, ui-monospace, monospace)';
const SCOPE = 'tpl-subscription-dunning-workbench';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all page CSS lives here; every selector is prefixed with
// the scope class. Transitions animate color/opacity only and collapse
// under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.\${SCOPE}.sdw-root { height: 100dvh; width: 100%; }
.\${SCOPE} button { font-family: inherit; }
.\${SCOPE} .sdw-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.\${SCOPE} .sdw-fade { transition: background-color 160ms ease, opacity 160ms ease, border-color 160ms ease; }
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .sdw-fade { transition: none; }
}

/* Header bar 52px ---------------------------------------------------------*/
.\${SCOPE} .sdw-header {
  display: flex;
  align-items: center;
  gap: \${GUTTER}px;
  height: 52px;
  padding: 0 \${GUTTER}px;
}
.\${SCOPE} .sdw-mono {
  font-family: \${MONO};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .sdw-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .sdw-forecast-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: var(--border-width) solid \${BRAND};
  background: \${BRAND_SOFT};
  color: \${BRAND};
  white-space: nowrap;
}
.\${SCOPE} .sdw-ticker {
  font-size: 12px;
  color: var(--color-text-secondary);
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Funnel strip 96px -------------------------------------------------------*/
.\${SCOPE} .sdw-funnel {
  display: flex;
  align-items: stretch;
  gap: \${GUTTER / 2}px;
  height: 96px;
  padding: \${GUTTER / 2}px \${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.\${SCOPE} .sdw-funnel.is-narrow { flex-wrap: wrap; height: auto; }
.\${SCOPE} .sdw-stage {
  appearance: none;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: transparent;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 3px;
  padding: 0 \${GUTTER}px;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
}
.\${SCOPE} .sdw-funnel.is-narrow .sdw-stage { flex: 1 1 40%; min-height: 64px; }
.\${SCOPE} .sdw-stage[aria-pressed='true'] {
  border-color: \${BRAND};
  background: \${BRAND_SOFT};
}
.\${SCOPE} .sdw-stage-bar {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: var(--color-border);
  position: relative;
  overflow: hidden;
}
.\${SCOPE} .sdw-stage-bar > span {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: 999px;
}
.\${SCOPE} .sdw-stage-arrow {
  align-self: center;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  display: inline-flex;
}

/* View root + queue -------------------------------------------------------*/
.\${SCOPE} .sdw-view {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.\${SCOPE} .sdw-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.\${SCOPE} .sdw-axis {
  display: flex;
  align-items: stretch;
  gap: \${GUTTER}px;
  height: 32px;
  padding: 0 \${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.\${SCOPE} .sdw-scroll { flex: 1; min-height: 0; overflow-y: auto; }
.\${SCOPE} .sdw-queue-footer {
  display: flex;
  align-items: center;
  gap: \${GUTTER}px;
  height: 32px;
  padding: 0 \${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}

/* Account rows 64px -------------------------------------------------------*/
.\${SCOPE} .sdw-row {
  appearance: none;
  border: none;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  display: flex;
  align-items: center;
  gap: \${GUTTER}px;
  width: 100%;
  min-height: 64px;
  padding: 0 \${GUTTER}px;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
}
.\${SCOPE} .sdw-row[aria-pressed='true'] { background: var(--color-background-muted); }
.\${SCOPE} .sdw-row-accent {
  width: 3px;
  align-self: stretch;
  flex-shrink: 0;
  margin-left: -\${GUTTER}px;
}
.\${SCOPE} .sdw-id-col {
  width: 176px;
  min-width: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.\${SCOPE} .sdw-id-col.is-wide { width: 220px; }
.\${SCOPE} .sdw-company {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .sdw-row-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}
.\${SCOPE} .sdw-decline-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  font-family: \${MONO};
  font-size: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}
.\${SCOPE} .sdw-decline-pip {
  width: 8px;
  height: 8px;
  border-radius: 2px; /* square pip = decline family, round dot = attempt */
  flex-shrink: 0;
}
.\${SCOPE} .sdw-mrr-col {
  width: 72px;
  flex-shrink: 0;
  text-align: right;
  font-family: \${MONO};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

/* Timeline lane 24px ------------------------------------------------------*/
.\${SCOPE} .sdw-lane-col { flex: 1; min-width: 120px; position: relative; }
/* .sdw-lane is a <span> inside a non-flex parent — inline boxes ignore
   height, so it must be display:block for the 24px lane to exist. */
.\${SCOPE} .sdw-lane { position: relative; height: 24px; display: block; }
.\${SCOPE} .sdw-lane-day-label { display: block; }
.\${SCOPE} .sdw-lane-track {
  position: absolute;
  left: 0;
  right: 0;
  top: 11px;
  height: 2px;
  background: var(--color-border);
}
.\${SCOPE} .sdw-lane-hatch {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(45deg, \${HATCH_GREY} 0px, \${HATCH_GREY} 2px, transparent 2px, transparent 8px);
}
.\${SCOPE} .sdw-dot {
  position: absolute;
  top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  transform: translateX(-50%);
}
.\${SCOPE} .sdw-slash {
  position: absolute;
  top: 11px;
  width: 12px;
  height: 2px;
  transform: translateX(-50%) rotate(-45deg);
}
.\${SCOPE} .sdw-today {
  position: absolute;
  top: 2px;
  bottom: 2px;
  width: 2px;
  transform: translateX(-50%);
  background: var(--color-text-secondary);
}
.\${SCOPE} .sdw-axis-lane { position: relative; flex: 1; min-width: 120px; }
.\${SCOPE} .sdw-axis-tick {
  position: absolute;
  bottom: 0;
  width: 1px;
  height: 6px;
  background: var(--color-border);
  transform: translateX(-50%);
}
.\${SCOPE} .sdw-axis-num {
  position: absolute;
  bottom: 8px;
  transform: translateX(-50%);
  font-family: \${MONO};
  font-size: 10px;
  color: var(--color-text-secondary);
}

/* Aside — PlaybookPane ----------------------------------------------------*/
.\${SCOPE} .sdw-aside {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
.\${SCOPE} .sdw-aside.is-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.\${SCOPE} .sdw-aside-head {
  display: flex;
  align-items: center;
  gap: \${GUTTER}px;
  height: 64px;
  padding: 0 \${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.\${SCOPE} .sdw-aside-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: \${GUTTER}px; }
.\${SCOPE} .sdw-aside-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: \${GUTTER / 2}px;
  height: 52px;
  padding: 0 \${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.\${SCOPE} .sdw-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: \${GUTTER / 2}px;
  padding: \${GUTTER * 2}px;
  text-align: center;
}
.\${SCOPE} .sdw-heavy-row {
  display: flex;
  align-items: center;
  gap: \${GUTTER}px;
  min-height: 44px;
  padding: 0 \${GUTTER / 2}px;
}

/* Path radio rows 56px ----------------------------------------------------*/
.\${SCOPE} .sdw-path-row {
  appearance: none;
  width: 100%;
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: \${GUTTER}px;
  padding: 6px \${GUTTER / 2}px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: transparent;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
}
.\${SCOPE} .sdw-path-row[aria-checked='true'] {
  border-color: \${BRAND};
  background: \${BRAND_SOFT};
}
.\${SCOPE} .sdw-path-days {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}
.\${SCOPE} .sdw-path-pip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 16px;
  padding: 0 3px;
  border-radius: 4px;
  border: var(--border-width) solid var(--color-border);
  font-family: \${MONO};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

/* Template rows + A/B chips -----------------------------------------------*/
.\${SCOPE} .sdw-template-row {
  appearance: none;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  padding: \${GUTTER / 2}px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: transparent;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
}
.\${SCOPE} .sdw-template-row[aria-checked='true'] {
  border-color: \${BRAND};
  background: \${BRAND_SOFT};
}
.\${SCOPE} .sdw-ab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  font-family: \${MONO};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--color-text-secondary);
}
.\${SCOPE} .sdw-ab-chip.is-active {
  border-color: \${BRAND};
  color: \${BRAND};
}
.\${SCOPE} .sdw-ab-toggle {
  display: inline-flex;
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  overflow: hidden;
  flex-shrink: 0;
}
.\${SCOPE} .sdw-ab-btn {
  appearance: none;
  border: none;
  background: transparent;
  height: 26px;
  min-width: 40px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.\${SCOPE} .sdw-ab-btn[aria-checked='true'] {
  background: var(--color-background-muted);
  color: var(--color-text-primary);
  font-weight: 600;
}
.\${SCOPE} .sdw-preview {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-muted);
  padding: \${GUTTER / 2}px \${GUTTER}px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.\${SCOPE} .sdw-attempt-row {
  display: flex;
  align-items: center;
  gap: \${GUTTER / 2}px;
  min-height: 32px;
}
.\${SCOPE} .sdw-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
\`;

// ---------------------------------------------------------------------------
// DATA — one deterministic world: Parcelbase billing recovery inside
// Dunwell. Suite "today" anchor: Mon 6 Jul 2026. Every account carries
// dayIndex = whole days since ITS decline (fixed integers, pre-computed
// against the anchor); the dunning window is 21 days for every path.
// Signed-in operator: Renata Voss ("RV").
// ---------------------------------------------------------------------------

const WINDOW_DAYS = 21;
const TODAY_LABEL = 'Mon 6 Jul 2026';
const ENGAGED_RECOVERY_RATE = 0.68; // fixture: engaged accounts recover at 68%

type Stage = 'failed' | 'retrying' | 'engaged' | 'recovered' | 'churned';

const STAGE_ORDER: Stage[] = ['failed', 'retrying', 'engaged', 'recovered', 'churned'];

const STAGE_META: Record<Stage, {label: string; color: string; soft: string}> = {
  failed: {label: 'Failed', color: DANGER, soft: DANGER_SOFT},
  retrying: {label: 'Retrying', color: BRAND, soft: BRAND_SOFT},
  engaged: {label: 'Engaged', color: WARN, soft: WARN_SOFT},
  recovered: {label: 'Recovered', color: OK_GREEN, soft: OK_SOFT},
  churned: {label: 'Churned', color: 'var(--color-text-secondary)', soft: 'var(--color-background-muted)'},
};

// Identity consts — entities referenced by identity, never retyped.
const P_STD = 'P-STD';
const P_SMART = 'P-SMART';
const P_GRACE = 'P-GRACE';
const T_EXPIRED = 'T-1';
const T_FAILED = 'T-2';
const T_PAUSED = 'T-3';

interface RetryPath {
  id: string;
  name: string;
  blurb: string;
  retryDays: number[]; // days after decline (day 0)
  recoveryRate: number; // 0..1 — frozen benchmark from past cohorts
}

const RETRY_PATHS: RetryPath[] = [
  {
    id: P_STD,
    name: 'Standard 3-touch',
    blurb: 'Fixed retries with an email before each attempt. The safe default.',
    retryDays: [3, 7, 14],
    recoveryRate: 0.31,
  },
  {
    id: P_SMART,
    name: 'Smart retry',
    blurb: 'Retries aligned to issuer approval windows; front-loads attempts.',
    retryDays: [1, 4, 9, 16],
    recoveryRate: 0.42,
  },
  {
    id: P_GRACE,
    name: 'Grace + pause',
    blurb: 'Slower cadence; access pauses at day 10. Lowest support volume.',
    retryDays: [5, 12, 20],
    recoveryRate: 0.26,
  },
];

const PATH_BY_ID = new Map(RETRY_PATHS.map(path => [path.id, path]));

interface CopyVariant {
  id: 'A' | 'B';
  subject: string;
  bodyPreview: string; // {company}/{plan}/{amount}/{last4} merge fields
  openPct: number;
  clickPct: number;
  recoveredPct: number;
  sends: number;
}

interface OutreachTemplate {
  id: string;
  name: string;
  bestFor: string;
  variants: [CopyVariant, CopyVariant];
}

// A/B stats are frozen benchmark fixtures (past-cohort sends), not live math.
const TEMPLATES: OutreachTemplate[] = [
  {
    id: T_EXPIRED,
    name: 'Card expired heads-up',
    bestFor: 'expired_card',
    variants: [
      {
        id: 'A',
        subject: 'Your card on file has expired',
        bodyPreview:
          'Hi {company} team — the card ending {last4} on your {plan} plan expired, so the {amount} renewal did not go through. Update it in one click and nothing is interrupted.',
        openPct: 61,
        clickPct: 24,
        recoveredPct: 19,
        sends: 1842,
      },
      {
        id: 'B',
        subject: 'Action needed: keep {company} shipping',
        bodyPreview:
          '{company}: your {plan} renewal of {amount} was declined (expired card). Labels keep printing for 7 more days while you update payment.',
        openPct: 55,
        clickPct: 29,
        recoveredPct: 23,
        sends: 1798,
      },
    ],
  },
  {
    id: T_FAILED,
    name: 'Payment failed — quick fix',
    bestFor: 'insufficient_funds · do_not_honor',
    variants: [
      {
        id: 'A',
        subject: 'We could not process your payment',
        bodyPreview:
          'Hi {company} — your bank declined the {amount} charge for the {plan} plan. We will retry automatically; you can also pay now or switch cards.',
        openPct: 48,
        clickPct: 17,
        recoveredPct: 14,
        sends: 3210,
      },
      {
        id: 'B',
        subject: '{company}, your invoice needs a nudge',
        bodyPreview:
          'The {amount} charge for {plan} bounced (bank said "try again"). One tap to retry now — most soft declines clear on a same-day manual retry.',
        openPct: 52,
        clickPct: 21,
        recoveredPct: 17,
        sends: 3155,
      },
    ],
  },
  {
    id: T_PAUSED,
    name: 'Workspace paused notice',
    bestFor: 'grace path · day 10+',
    variants: [
      {
        id: 'A',
        subject: 'Your {plan} workspace is paused',
        bodyPreview:
          '{company}: after several attempts we paused label printing. Your data is safe for 90 days — reactivate any time by settling {amount}.',
        openPct: 67,
        clickPct: 31,
        recoveredPct: 26,
        sends: 964,
      },
      {
        id: 'B',
        subject: 'Paused — but 30 seconds fixes it',
        bodyPreview:
          'Printing for {company} is on hold over an unpaid {amount}. Reactivate now and this month is on us if it was our processing error.',
        openPct: 63,
        clickPct: 35,
        recoveredPct: 28,
        sends: 921,
      },
    ],
  },
];

const TEMPLATE_BY_ID = new Map(TEMPLATES.map(template => [template.id, template]));

type DeclineCode =
  | 'insufficient_funds'
  | 'expired_card'
  | 'do_not_honor'
  | 'processor_declined'
  | 'fraud_suspected';

const DECLINE_META: Record<DeclineCode, {hard: boolean}> = {
  insufficient_funds: {hard: false},
  expired_card: {hard: true},
  do_not_honor: {hard: false},
  processor_declined: {hard: false},
  fraud_suspected: {hard: true},
};

interface Attempt {
  day: number; // days after decline
  dateLabel: string;
  outcome: 'failed' | 'recovered';
  code?: DeclineCode;
  note?: string;
}

interface Account {
  id: string;
  company: string;
  plan: 'Solo' | 'Team' | 'Scale';
  seats: number;
  mrr: number; // integer dollars — display always derives via fmtUSD
  declineCode: DeclineCode;
  failedOn: string; // fixed date string (day 0)
  dayIndex: number; // whole days since decline at the suite anchor
  stage: Stage;
  pathId?: string; // undefined = untriaged; no schedule beyond logged attempts
  templateId?: string;
  variantId?: 'A' | 'B';
  attempts: Attempt[];
  cardBrand: string;
  last4: string;
  resolvedDay?: number; // recovered/churned terminal day
  note?: string;
}

// 10 accounts. Funnel + forecast cross-checks live in the @input comment;
// both are DERIVED live from this array at render, never typed.
// AC-1033's 51-char company name is the truncation stress fixture for the
// 176px id column. AC-1046 (untriaged failed) is the signature-interaction
// hero. AC-1019 has exhausted every retry — the near-churn stress row.
// AC-1029 carries a hard fraud flag so "apply a path" shows a guarded hint.
const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'AC-1046',
    company: 'Harborlight Legal',
    plan: 'Team',
    seats: 12,
    mrr: 420,
    declineCode: 'expired_card',
    failedOn: '3 Jul 2026',
    dayIndex: 3,
    stage: 'failed',
    attempts: [
      {day: 0, dateLabel: '3 Jul 2026', outcome: 'failed', code: 'expired_card', note: 'Renewal charge declined at issuer'},
    ],
    cardBrand: 'Visa',
    last4: '4821',
  },
  {
    id: 'AC-1029',
    company: 'Copperline Robotics',
    plan: 'Scale',
    seats: 64,
    mrr: 2150,
    declineCode: 'fraud_suspected',
    failedOn: '4 Jul 2026',
    dayIndex: 2,
    stage: 'failed',
    attempts: [
      {day: 0, dateLabel: '4 Jul 2026', outcome: 'failed', code: 'fraud_suspected', note: 'Issuer flagged the charge — do not blind-retry'},
    ],
    cardBrand: 'Amex',
    last4: '1005',
    note: 'High value — issuer fraud flag. Confirm with the account owner before applying any retry path.',
  },
  {
    id: 'AC-1052',
    company: 'Fernworks Studio',
    plan: 'Solo',
    seats: 1,
    mrr: 49,
    declineCode: 'insufficient_funds',
    failedOn: '5 Jul 2026',
    dayIndex: 1,
    stage: 'failed',
    attempts: [{day: 0, dateLabel: '5 Jul 2026', outcome: 'failed', code: 'insufficient_funds'}],
    cardBrand: 'Visa',
    last4: '7710',
  },
  {
    id: 'AC-1041',
    company: 'Brightloop Analytics',
    plan: 'Scale',
    seats: 40,
    mrr: 1240,
    declineCode: 'insufficient_funds',
    failedOn: '28 Jun 2026',
    dayIndex: 8,
    stage: 'retrying',
    pathId: P_SMART,
    templateId: T_FAILED,
    variantId: 'A',
    attempts: [
      {day: 0, dateLabel: '28 Jun 2026', outcome: 'failed', code: 'insufficient_funds'},
      {day: 1, dateLabel: '29 Jun 2026', outcome: 'failed', code: 'insufficient_funds'},
      {day: 4, dateLabel: '2 Jul 2026', outcome: 'failed', code: 'do_not_honor'},
    ],
    cardBrand: 'Mastercard',
    last4: '3348',
  },
  {
    id: 'AC-1038',
    company: 'Nimbus Freight',
    plan: 'Scale',
    seats: 28,
    mrr: 980,
    declineCode: 'do_not_honor',
    failedOn: '24 Jun 2026',
    dayIndex: 12,
    stage: 'retrying',
    pathId: P_STD,
    templateId: T_FAILED,
    variantId: 'B',
    attempts: [
      {day: 0, dateLabel: '24 Jun 2026', outcome: 'failed', code: 'do_not_honor'},
      {day: 3, dateLabel: '27 Jun 2026', outcome: 'failed', code: 'do_not_honor'},
      {day: 7, dateLabel: '1 Jul 2026', outcome: 'failed', code: 'processor_declined'},
    ],
    cardBrand: 'Visa',
    last4: '9034',
  },
  {
    id: 'AC-1033',
    company: 'Quill & Ledger Bookkeeping Collective of Sacramento',
    plan: 'Team',
    seats: 9,
    mrr: 360,
    declineCode: 'processor_declined',
    failedOn: '1 Jul 2026',
    dayIndex: 5,
    stage: 'retrying',
    pathId: P_GRACE,
    templateId: T_FAILED,
    variantId: 'A',
    attempts: [
      {day: 0, dateLabel: '1 Jul 2026', outcome: 'failed', code: 'processor_declined'},
      {day: 5, dateLabel: '6 Jul 2026', outcome: 'failed', code: 'processor_declined', note: 'Grace retry 1 of 3 ran this morning'},
    ],
    cardBrand: 'Mastercard',
    last4: '5561',
  },
  {
    id: 'AC-1019',
    company: 'Mistral Media',
    plan: 'Solo',
    seats: 2,
    mrr: 29,
    declineCode: 'insufficient_funds',
    failedOn: '17 Jun 2026',
    dayIndex: 19,
    stage: 'retrying',
    pathId: P_SMART,
    templateId: T_FAILED,
    variantId: 'B',
    attempts: [
      {day: 0, dateLabel: '17 Jun 2026', outcome: 'failed', code: 'insufficient_funds'},
      {day: 1, dateLabel: '18 Jun 2026', outcome: 'failed', code: 'insufficient_funds'},
      {day: 4, dateLabel: '21 Jun 2026', outcome: 'failed', code: 'insufficient_funds'},
      {day: 9, dateLabel: '26 Jun 2026', outcome: 'failed', code: 'insufficient_funds'},
      {day: 16, dateLabel: '3 Jul 2026', outcome: 'failed', code: 'insufficient_funds', note: 'Final scheduled retry failed — churns at day 21'},
    ],
    cardBrand: 'Visa',
    last4: '2287',
    note: 'All smart retries exhausted. Churns Wed 8 Jul unless the customer acts.',
  },
  {
    id: 'AC-1024',
    company: 'Atlas Verde',
    plan: 'Team',
    seats: 7,
    mrr: 310,
    declineCode: 'expired_card',
    failedOn: '21 Jun 2026',
    dayIndex: 15,
    stage: 'engaged',
    pathId: P_STD,
    templateId: T_EXPIRED,
    variantId: 'B',
    attempts: [
      {day: 0, dateLabel: '21 Jun 2026', outcome: 'failed', code: 'expired_card'},
      {day: 3, dateLabel: '24 Jun 2026', outcome: 'failed', code: 'expired_card'},
      {day: 7, dateLabel: '28 Jun 2026', outcome: 'failed', code: 'expired_card'},
    ],
    cardBrand: 'Visa',
    last4: '0442',
    note: 'Clicked "update card" from T-1/B on 4 Jul — new card not saved yet.',
  },
  {
    id: 'AC-1015',
    company: 'Beaconworks',
    plan: 'Team',
    seats: 15,
    mrr: 540,
    declineCode: 'do_not_honor',
    failedOn: '12 Jun 2026',
    dayIndex: 21, // clamped display — window closed at recovery
    stage: 'recovered',
    pathId: P_SMART,
    templateId: T_FAILED,
    variantId: 'A',
    resolvedDay: 6,
    attempts: [
      {day: 0, dateLabel: '12 Jun 2026', outcome: 'failed', code: 'do_not_honor'},
      {day: 1, dateLabel: '13 Jun 2026', outcome: 'failed', code: 'do_not_honor'},
      {day: 4, dateLabel: '16 Jun 2026', outcome: 'failed', code: 'do_not_honor'},
      {day: 6, dateLabel: '18 Jun 2026', outcome: 'recovered', note: 'Customer paid from the T-2/A email link'},
    ],
    cardBrand: 'Mastercard',
    last4: '6119',
  },
  {
    id: 'AC-1011',
    company: 'Driftline Surfco',
    plan: 'Solo',
    seats: 1,
    mrr: 59,
    declineCode: 'expired_card',
    failedOn: '8 Jun 2026',
    dayIndex: 21,
    stage: 'churned',
    pathId: P_STD,
    templateId: T_EXPIRED,
    variantId: 'A',
    resolvedDay: 21,
    attempts: [
      {day: 0, dateLabel: '8 Jun 2026', outcome: 'failed', code: 'expired_card'},
      {day: 3, dateLabel: '11 Jun 2026', outcome: 'failed', code: 'expired_card'},
      {day: 7, dateLabel: '15 Jun 2026', outcome: 'failed', code: 'expired_card'},
      {day: 14, dateLabel: '22 Jun 2026', outcome: 'failed', code: 'expired_card'},
    ],
    cardBrand: 'Visa',
    last4: '8873',
    note: 'Window closed 29 Jun with no engagement. Subscription cancelled.',
  },
];

const OPERATOR = {name: 'Renata Voss', initials: 'RV', role: 'Billing recovery'};

// ---------------------------------------------------------------------------
// DERIVATIONS — all aggregates come from the account rows, never typed.
// ---------------------------------------------------------------------------

function fmtUSD(value: number): string {
  const rounded = Math.round(value);
  return \`$\${rounded.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')}\`;
}

interface StageRollup {
  count: number;
  mrr: number;
}

function rollupByStage(accounts: Account[]): Record<Stage, StageRollup> {
  const out: Record<Stage, StageRollup> = {
    failed: {count: 0, mrr: 0},
    retrying: {count: 0, mrr: 0},
    engaged: {count: 0, mrr: 0},
    recovered: {count: 0, mrr: 0},
    churned: {count: 0, mrr: 0},
  };
  for (const account of accounts) {
    out[account.stage].count += 1;
    out[account.stage].mrr += account.mrr;
  }
  return out;
}

// Forecast: Σ mrr × path recovery% over retrying accounts, plus
// Σ mrr × ENGAGED_RECOVERY_RATE over engaged accounts. The seeded-row
// arithmetic is cross-checked by hand in the @input comment ($1,141).
function deriveForecast(accounts: Account[]): number {
  let total = 0;
  for (const account of accounts) {
    if (account.stage === 'retrying') {
      const path = account.pathId != null ? PATH_BY_ID.get(account.pathId) : undefined;
      total += account.mrr * (path?.recoveryRate ?? 0);
    } else if (account.stage === 'engaged') {
      total += account.mrr * ENGAGED_RECOVERY_RATE;
    }
  }
  return total;
}

/** Future retries for a row: path days strictly after the account's today. */
function scheduledRetryDays(account: Account): number[] {
  if (account.stage !== 'retrying' && account.stage !== 'failed') return [];
  const path = account.pathId != null ? PATH_BY_ID.get(account.pathId) : undefined;
  if (path == null) return [];
  return path.retryDays.filter(day => day > account.dayIndex);
}

function fillMergeFields(text: string, account: Account): string {
  return text
    .replace(/\\{company\\}/g, account.company)
    .replace(/\\{plan\\}/g, account.plan)
    .replace(/\\{amount\\}/g, \`\${fmtUSD(account.mrr)}/mo\`)
    .replace(/\\{last4\\}/g, account.last4);
}

// ---------------------------------------------------------------------------
// HOOK — container-width ResizeObserver (house pattern): the inline demo
// stage is ~1045–1075px inside a 1440px window, so viewport media queries
// would lie. Width 0 = first pre-observer frame; callers treat 0 as wide.
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
// DUNWELL MARK — 24px inline SVG: a downward card-retry loop; the arrowhead
// turning back up is the "recovered" gesture. Brand accent as fill/stroke.
// ---------------------------------------------------------------------------

function DunwellMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden style={{flexShrink: 0}}>
      <rect x={3} y={5} width={18} height={5} rx={1.5} fill="none" stroke={BRAND} strokeWidth={2} />
      <path
        d="M6 14c0 3.3 2.7 6 6 6s6-2.7 6-6"
        fill="none"
        stroke={BRAND}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M18 14l-2.4 2.4M18 14l2.4 2.4" fill="none" stroke={BRAND} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RecoveryFunnel — five stage segments, each a real <button> filter with
// aria-pressed. The mini bar under each count shows that stage's share of
// total delinquent MRR (Σ across all five stages) so dollars visibly move
// between segments when a mutation advances an account.
// ---------------------------------------------------------------------------

interface RecoveryFunnelProps {
  rollup: Record<Stage, StageRollup>;
  totalMrr: number;
  activeStage: Stage | null;
  isNarrow: boolean;
  onToggleStage: (stage: Stage) => void;
}

function RecoveryFunnel({rollup, totalMrr, activeStage, isNarrow, onToggleStage}: RecoveryFunnelProps) {
  return (
    <div
      className={\`sdw-funnel\${isNarrow ? ' is-narrow' : ''}\`}
      role="group"
      aria-label="Recovery funnel — stage filters">
      {STAGE_ORDER.map((stage, index) => {
        const meta = STAGE_META[stage];
        const {count, mrr} = rollup[stage];
        const share = totalMrr > 0 ? (mrr / totalMrr) * 100 : 0;
        const isActive = activeStage === stage;
        return (
          <Fragment key={stage}>
            {index > 0 && !isNarrow ? (
              <span className="sdw-stage-arrow" aria-hidden>
                <svg width={10} height={10} viewBox="0 0 10 10">
                  <path d="M2 1l5 4-5 4" fill="none" stroke="currentColor" strokeWidth={1.5} />
                </svg>
              </span>
            ) : null}
            <button
              type="button"
              className="sdw-stage sdw-focusable sdw-fade"
              aria-pressed={isActive}
              onClick={() => onToggleStage(stage)}
              aria-label={\`\${meta.label}: \${count} accounts, \${fmtUSD(mrr)} monthly. \${
                isActive ? 'Filter on — press to clear' : 'Press to filter the queue'
              }\`}>
              <span className="sdw-label" style={{color: meta.color}}>
                {meta.label}
              </span>
              <HStack gap={2} vAlign="end">
                <span className="sdw-mono" style={{fontSize: 18, fontWeight: 700}}>
                  {count}
                </span>
                <span className="sdw-mono" style={{color: 'var(--color-text-secondary)'}}>
                  {fmtUSD(mrr)}/mo
                </span>
              </HStack>
              <span className="sdw-stage-bar" aria-hidden>
                <span className="sdw-fade" style={{width: \`\${share}%\`, background: meta.color}} />
              </span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RetryScheduleBoard — the domain surface the DS has no vocabulary for: a
// shared 0–21 day axis and, per account, a lane plotting decline, past
// attempts, scheduled retries, today, and terminal outcomes. All positions
// are percentages of the lane width so one geometry serves every band.
// Shape channels: solid red dot + slash = failed attempt; hollow accent
// dot = scheduled retry; solid green dot = recovered; grey hatch after the
// terminal day = window closed. Color never stands alone.
// ---------------------------------------------------------------------------

function dayPct(day: number): string {
  return \`\${(day / WINDOW_DAYS) * 100}%\`;
}

function ScheduleLane({account}: {account: Account}) {
  const scheduled = scheduledRetryDays(account);
  const terminalDay = account.resolvedDay;
  const isClosed = account.stage === 'recovered' || account.stage === 'churned';
  return (
    <span className="sdw-lane" aria-hidden>
      <span className="sdw-lane-track" />
      {isClosed && terminalDay != null ? (
        <span
          className="sdw-lane-hatch"
          style={{left: dayPct(terminalDay), right: 0}}
        />
      ) : null}
      {/* Decline marker (day 0): square pip — the decline family shape. */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 7,
          width: 8,
          height: 8,
          borderRadius: 2,
          background: DANGER,
        }}
      />
      {account.attempts.map(attempt =>
        attempt.day === 0 ? null : attempt.outcome === 'recovered' ? (
          <span
            key={\`a-\${attempt.day}\`}
            className="sdw-dot"
            style={{left: dayPct(attempt.day), background: OK_GREEN, width: 10, height: 10, top: 7}}
          />
        ) : (
          <span key={\`a-\${attempt.day}\`}>
            <span className="sdw-dot" style={{left: dayPct(attempt.day), background: DANGER}} />
            <span className="sdw-slash" style={{left: dayPct(attempt.day), background: DANGER}} />
          </span>
        ),
      )}
      {scheduled.map(day => (
        <span
          key={\`s-\${day}\`}
          className="sdw-dot"
          style={{
            left: dayPct(day),
            background: 'transparent',
            border: \`2px solid \${BRAND}\`,
          }}
        />
      ))}
      {account.stage === 'churned' && terminalDay != null ? (
        <span
          style={{
            position: 'absolute',
            left: \`calc(\${dayPct(terminalDay)} - 5px)\`,
            top: 7,
            width: 10,
            height: 10,
            color: 'var(--color-text-secondary)',
          }}>
          <svg width={10} height={10} viewBox="0 0 10 10">
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth={2} />
          </svg>
        </span>
      ) : null}
      {!isClosed ? (
        <span className="sdw-today" style={{left: dayPct(Math.min(account.dayIndex, WINDOW_DAYS))}} />
      ) : null}
    </span>
  );
}

/** One line of screen-reader truth per lane — the visual is aria-hidden. */
function laneSummary(account: Account): string {
  const scheduled = scheduledRetryDays(account);
  const failedDays = account.attempts.filter(a => a.outcome === 'failed').map(a => a.day);
  const parts = [
    \`declined \${account.failedOn}\`,
    \`day \${Math.min(account.dayIndex, WINDOW_DAYS)} of \${WINDOW_DAYS}\`,
    \`\${failedDays.length} failed attempt\${failedDays.length === 1 ? '' : 's'} on days \${failedDays.join(', ')}\`,
  ];
  if (scheduled.length > 0) {
    parts.push(\`retries scheduled days \${scheduled.join(', ')}\`);
  } else if (account.stage === 'retrying') {
    parts.push('no retries remain in the window');
  } else if (account.stage === 'failed') {
    parts.push('no retry path applied');
  }
  if (account.stage === 'recovered' && account.resolvedDay != null) {
    parts.push(\`recovered day \${account.resolvedDay}\`);
  }
  if (account.stage === 'churned') {
    parts.push('churned at window close');
  }
  return parts.join('; ');
}

interface DayAxisProps {
  labelEvery: number; // 3 in the wide band, 7 in the demo band
  idColWide: boolean;
  showMrr: boolean;
}

function DayAxis({labelEvery, idColWide, showMrr}: DayAxisProps) {
  const days: number[] = [];
  for (let day = 0; day <= WINDOW_DAYS; day += 1) days.push(day);
  return (
    <div className="sdw-axis" aria-hidden>
      {/* Ghost of the row's 3px selection accent so the axis lane starts at
          the exact x-offset of every row lane (ticks align with dots). */}
      <span className="sdw-row-accent" style={{background: 'transparent'}} />
      <span className={\`sdw-id-col\${idColWide ? ' is-wide' : ''}\`} style={{justifyContent: 'flex-end'}}>
        <span className="sdw-label" style={{paddingBottom: 6}}>
          Account
        </span>
      </span>
      {showMrr ? (
        <span className="sdw-mrr-col sdw-label" style={{alignSelf: 'flex-end', paddingBottom: 6}}>
          MRR
        </span>
      ) : null}
      <span className="sdw-axis-lane">
        {days.map(day => (
          <span key={day}>
            <span className="sdw-axis-tick" style={{left: dayPct(day), ...(day % labelEvery === 0 ? {height: 10} : null)}} />
            {day % labelEvery === 0 ? (
              <span className="sdw-axis-num" style={{left: dayPct(day)}}>
                {day === 0 ? 'd0' : day}
              </span>
            ) : null}
          </span>
        ))}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AccountRow — 64px queue row: 3px selection accent (brand), id column
// (company + AC id + decline chip), MRR column, schedule lane. Real button;
// omit-when-undefined segments (seats, decline chip text) per band.
// ---------------------------------------------------------------------------

interface AccountRowProps {
  account: Account;
  isSelected: boolean;
  idColWide: boolean;
  showMrr: boolean;
  showDeclineText: boolean;
  onSelect: () => void;
}

function AccountRow({account, isSelected, idColWide, showMrr, showDeclineText, onSelect}: AccountRowProps) {
  const stageMeta = STAGE_META[account.stage];
  const isHard = DECLINE_META[account.declineCode].hard;
  return (
    <button
      type="button"
      className="sdw-row sdw-focusable sdw-fade"
      data-account-row={account.id}
      aria-pressed={isSelected}
      onClick={onSelect}
      aria-label={\`\${account.company}, \${account.id}, \${stageMeta.label}, \${fmtUSD(account.mrr)} monthly, \${
        account.declineCode
      }; \${laneSummary(account)}\`}>
      <span className="sdw-row-accent" style={{background: isSelected ? BRAND : 'transparent'}} aria-hidden />
      <span className={\`sdw-id-col\${idColWide ? ' is-wide' : ''}\`}>
        <span className="sdw-company">{account.company}</span>
        <span className="sdw-row-meta">
          <span className="sdw-mono" style={{color: 'var(--color-text-secondary)'}}>
            {account.id}
          </span>
          <span
            className="sdw-decline-chip"
            style={{
              color: isHard ? DANGER : WARN,
              background: isHard ? DANGER_SOFT : WARN_SOFT,
            }}>
            <span
              className="sdw-decline-pip"
              style={{background: 'currentColor', ...(isHard ? null : {borderRadius: 999})}}
            />
            {showDeclineText ? account.declineCode : null}
          </span>
          {idColWide ? (
            <span className="sdw-mono" style={{color: 'var(--color-text-secondary)', fontSize: 10}}>
              {account.plan} · {account.seats} seat{account.seats === 1 ? '' : 's'}
            </span>
          ) : null}
        </span>
      </span>
      {showMrr ? <span className="sdw-mrr-col">{fmtUSD(account.mrr)}</span> : null}
      <span className="sdw-lane-col">
        <ScheduleLane account={account} />
        <span className="sdw-mono sdw-lane-day-label" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
          {account.stage === 'recovered' && account.resolvedDay != null
            ? \`recovered d\${account.resolvedDay}\`
            : account.stage === 'churned'
              ? 'window closed'
              : \`day \${account.dayIndex} of \${WINDOW_DAYS}\`}
        </span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// PlaybookPane pieces — purely presentational; every mutation is reported
// up to the single account store in the page owner.
// ---------------------------------------------------------------------------

interface PathSelectorProps {
  draftPathId: string | null;
  account: Account;
  onPick: (pathId: string) => void;
}

function PathSelector({draftPathId, account, onPick}: PathSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Retry path">
      <VStack gap={2}>
        {RETRY_PATHS.map(path => {
          const isChecked = draftPathId === path.id;
          // Days already in the past for THIS account are struck — the
          // schedule preview is honest about what a late pick still buys.
          const remaining = path.retryDays.filter(day => day > account.dayIndex).length;
          return (
            <button
              key={path.id}
              type="button"
              role="radio"
              aria-checked={isChecked}
              className="sdw-path-row sdw-focusable sdw-fade"
              onClick={() => onPick(path.id)}>
              <span
                aria-hidden
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  flexShrink: 0,
                  border: \`2px solid \${isChecked ? BRAND : 'var(--color-border)'}\`,
                  background: isChecked ? BRAND : 'transparent',
                  boxShadow: isChecked ? 'inset 0 0 0 3px var(--color-background)' : undefined,
                }}
              />
              <StackItem size="fill">
                <VStack gap={0}>
                  <HStack gap={2} vAlign="center">
                    <Text type="label" size="sm">
                      {path.name}
                    </Text>
                    <span className="sdw-mono" style={{color: OK_GREEN}}>
                      {Math.round(path.recoveryRate * 100)}% rec
                    </span>
                  </HStack>
                  <Text type="supporting" size="xsm" color="secondary" maxLines={2}>
                    {path.blurb}
                  </Text>
                </VStack>
              </StackItem>
              <span className="sdw-path-days" aria-label={\`Retries on days \${path.retryDays.join(', ')}; \${remaining} remain for this account\`}>
                {path.retryDays.map(day => {
                  const isPast = day <= account.dayIndex;
                  return (
                    <span
                      key={day}
                      className="sdw-path-pip"
                      style={
                        isPast
                          ? {textDecoration: 'line-through', opacity: 0.5}
                          : isChecked
                            ? {borderColor: BRAND, color: BRAND}
                            : undefined
                      }>
                      d{day}
                    </span>
                  );
                })}
              </span>
            </button>
          );
        })}
      </VStack>
    </div>
  );
}

interface TemplatePickerProps {
  draftTemplateId: string | null;
  draftVariantId: 'A' | 'B';
  onPickTemplate: (templateId: string) => void;
  onPickVariant: (variantId: 'A' | 'B') => void;
}

function TemplatePicker({draftTemplateId, draftVariantId, onPickTemplate, onPickVariant}: TemplatePickerProps) {
  return (
    <div role="radiogroup" aria-label="Outreach template">
      <VStack gap={2}>
        {TEMPLATES.map(template => {
          const isChecked = draftTemplateId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              role="radio"
              aria-checked={isChecked}
              className="sdw-template-row sdw-focusable sdw-fade"
              onClick={() => onPickTemplate(template.id)}>
              <HStack gap={2} vAlign="center">
                <span className="sdw-mono" style={{color: 'var(--color-text-secondary)'}}>
                  {template.id}
                </span>
                <StackItem size="fill">
                  <Text type="label" size="sm" maxLines={1}>
                    {template.name}
                  </Text>
                </StackItem>
                <span className="sdw-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
                  {template.bestFor}
                </span>
              </HStack>
              <HStack gap={2} vAlign="center" wrap="wrap">
                {template.variants.map(variant => (
                  <span
                    key={variant.id}
                    className={\`sdw-ab-chip\${isChecked && draftVariantId === variant.id ? ' is-active' : ''}\`}
                    aria-label={\`Variant \${variant.id}: \${variant.openPct} percent open, \${variant.clickPct} percent click, \${variant.recoveredPct} percent recovered across \${variant.sends} sends\`}>
                    <strong>{variant.id}</strong>
                    {variant.openPct}% open · {variant.clickPct}% click · {variant.recoveredPct}% rec
                  </span>
                ))}
              </HStack>
            </button>
          );
        })}
        {draftTemplateId != null ? (
          <div className="sdw-ab-toggle" role="radiogroup" aria-label="Copy variant">
            {(['A', 'B'] as const).map(variantId => (
              <button
                key={variantId}
                type="button"
                role="radio"
                aria-checked={draftVariantId === variantId}
                className="sdw-ab-btn sdw-focusable sdw-fade"
                onClick={() => onPickVariant(variantId)}>
                Variant {variantId}
              </button>
            ))}
          </div>
        ) : null}
      </VStack>
    </div>
  );
}

/** Merge-field preview — subject + body with account fields filled live. */
function CopyPreview({account, templateId, variantId}: {account: Account; templateId: string; variantId: 'A' | 'B'}) {
  const template = TEMPLATE_BY_ID.get(templateId);
  const variant = template?.variants.find(v => v.id === variantId);
  if (template == null || variant == null) return null;
  return (
    <div className="sdw-preview">
      <HStack gap={2} vAlign="center">
        <Icon icon={SendIcon} size="xsm" color="secondary" />
        <span className="sdw-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
          {template.id}/{variant.id} → billing@{account.company.split(' ')[0]?.toLowerCase() ?? 'account'}.example
        </span>
      </HStack>
      <Text type="label" size="sm" maxLines={2}>
        {fillMergeFields(variant.subject, account)}
      </Text>
      <Text type="supporting" size="xsm" color="secondary" maxLines={4}>
        {fillMergeFields(variant.bodyPreview, account)}
      </Text>
    </div>
  );
}

/** Attempt log rows — 32px, mono day + date + outcome, oldest first. */
function AttemptLog({account}: {account: Account}) {
  return (
    <VStack gap={0}>
      {account.attempts.map(attempt => (
        <div key={\`\${attempt.day}-\${attempt.outcome}\`} className="sdw-attempt-row">
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              flexShrink: 0,
              borderRadius: attempt.outcome === 'recovered' ? 999 : 2,
              background: attempt.outcome === 'recovered' ? OK_GREEN : DANGER,
            }}
          />
          <span className="sdw-mono" style={{width: 32, flexShrink: 0, color: 'var(--color-text-secondary)'}}>
            d{attempt.day}
          </span>
          <span className="sdw-mono" style={{width: 88, flexShrink: 0}}>
            {attempt.dateLabel}
          </span>
          <StackItem size="fill">
            <Text type="supporting" size="xsm" color={attempt.outcome === 'recovered' ? 'primary' : 'secondary'} maxLines={1}>
              {attempt.outcome === 'recovered'
                ? attempt.note ?? 'Payment recovered'
                : attempt.note ?? attempt.code ?? 'attempt failed'}
            </Text>
          </StackItem>
        </div>
      ))}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PlaybookPane — aside owner: identity 64px > facts > PathSelector >
// TemplatePicker > CopyPreview > AttemptLog > footer action bar 52px.
// Draft state lives in the PAGE (reset on selection change); the pane only
// reports picks and the Apply/Mark actions.
// ---------------------------------------------------------------------------

interface Draft {
  pathId: string | null;
  templateId: string | null;
  variantId: 'A' | 'B';
}

interface PlaybookPaneProps {
  width: number;
  isOverlay: boolean;
  account: Account | null;
  draft: Draft;
  forecastDeltaLabel: string | null;
  onClose: () => void;
  onDraft: (patch: Partial<Draft>) => void;
  onApply: () => void;
  onMarkRecovered: () => void;
  onMarkChurned: () => void;
}

function PlaybookPane({
  width,
  isOverlay,
  account,
  draft,
  forecastDeltaLabel,
  onClose,
  onDraft,
  onApply,
  onMarkRecovered,
  onMarkChurned,
}: PlaybookPaneProps) {
  const isTerminal = account?.stage === 'recovered' || account?.stage === 'churned';
  const canApply =
    account != null &&
    !isTerminal &&
    draft.pathId != null &&
    draft.templateId != null &&
    (account.stage === 'failed' ||
      draft.pathId !== account.pathId ||
      draft.templateId !== account.templateId ||
      draft.variantId !== account.variantId);
  return (
    <aside className={\`sdw-aside\${isOverlay ? ' is-overlay' : ''}\`} style={{width}} aria-label="Recovery playbook">
      {account == null ? (
        <div className="sdw-empty">
          <Icon icon={SplitIcon} size="lg" color="secondary" />
          <Heading level={2}>No account selected</Heading>
          <Text type="supporting" size="sm" color="secondary">
            Pick a row to draft its retry path and outreach copy
          </Text>
        </div>
      ) : (
        <>
          <div className="sdw-aside-head">
            <StackItem size="fill">
              <VStack gap={0}>
                <HStack gap={2} vAlign="center">
                  <span className="sdw-mono" style={{color: 'var(--color-text-secondary)'}}>
                    {account.id}
                  </span>
                  <Token
                    size="sm"
                    color={
                      account.stage === 'recovered'
                        ? 'green'
                        : account.stage === 'churned'
                          ? 'gray'
                          : account.stage === 'engaged'
                            ? 'yellow'
                            : account.stage === 'retrying'
                              ? 'blue'
                              : 'red'
                    }
                    label={STAGE_META[account.stage].label}
                  />
                </HStack>
                <Heading level={2} maxLines={1}>
                  {account.company}
                </Heading>
              </VStack>
            </StackItem>
            {isOverlay ? (
              <Button
                label="Close playbook"
                isIconOnly
                variant="ghost"
                size="sm"
                icon={<Icon icon={XIcon} size="sm" />}
                onClick={onClose}
              />
            ) : null}
          </div>
          <div className="sdw-aside-scroll">
            <VStack gap={3}>
              <div className="sdw-heavy-row">
                <Icon icon={CreditCardIcon} size="sm" color="secondary" />
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text type="body" size="sm" hasTabularNumbers>
                      {account.cardBrand} ···{account.last4} · {fmtUSD(account.mrr)}/mo · {account.plan} · {account.seats}{' '}
                      seat{account.seats === 1 ? '' : 's'}
                    </Text>
                    <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                      Declined {account.failedOn} ({account.declineCode}) · day{' '}
                      {Math.min(account.dayIndex, WINDOW_DAYS)} of {WINDOW_DAYS}
                    </Text>
                  </VStack>
                </StackItem>
              </div>
              {account.note != null ? (
                <HStack gap={2} vAlign="center">
                  <Icon
                    icon={account.declineCode === 'fraud_suspected' ? ShieldAlertIcon : FlagIcon}
                    size="xsm"
                    color="secondary"
                  />
                  <StackItem size="fill">
                    <Text type="supporting" size="xsm" color="secondary">
                      {account.note}
                    </Text>
                  </StackItem>
                </HStack>
              ) : null}
              <Divider />
              {isTerminal ? (
                <VStack gap={1}>
                  <span className="sdw-label">Outcome</span>
                  <Text type="body" size="sm">
                    {account.stage === 'recovered'
                      ? \`Recovered on day \${account.resolvedDay} via \${account.templateId}/\${account.variantId} on the \${
                          PATH_BY_ID.get(account.pathId ?? '')?.name ?? '—'
                        } path.\`
                      : 'Window closed without recovery. Subscription cancelled at day 21.'}
                  </Text>
                </VStack>
              ) : (
                <>
                  <VStack gap={1}>
                    <span className="sdw-label">Retry path</span>
                    <PathSelector
                      draftPathId={draft.pathId}
                      account={account}
                      onPick={pathId => onDraft({pathId})}
                    />
                  </VStack>
                  <VStack gap={1}>
                    <HStack gap={2} vAlign="center">
                      <Icon icon={SplitIcon} size="xsm" color="secondary" />
                      <span className="sdw-label">Outreach copy · A/B benchmarks</span>
                    </HStack>
                    <TemplatePicker
                      draftTemplateId={draft.templateId}
                      draftVariantId={draft.variantId}
                      onPickTemplate={templateId => onDraft({templateId})}
                      onPickVariant={variantId => onDraft({variantId})}
                    />
                  </VStack>
                  {draft.templateId != null ? (
                    <CopyPreview account={account} templateId={draft.templateId} variantId={draft.variantId} />
                  ) : null}
                  {forecastDeltaLabel != null ? (
                    <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                      {forecastDeltaLabel}
                    </Text>
                  ) : null}
                </>
              )}
              <Divider />
              <VStack gap={1}>
                <span className="sdw-label">Attempt log</span>
                <AttemptLog account={account} />
              </VStack>
            </VStack>
          </div>
          {/* Bottom-right corner owner while an account is selected. */}
          <div className="sdw-aside-footer">
            {!isTerminal ? (
              <>
                <Button
                  label="Mark churned"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={FlagIcon} size="sm" />}
                  onClick={onMarkChurned}
                />
                <Button
                  label="Mark recovered"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={BadgeCheckIcon} size="sm" />}
                  onClick={onMarkRecovered}
                />
                <Button
                  label={account.stage === 'failed' ? 'Apply path' : 'Update path'}
                  variant="primary"
                  size="sm"
                  isDisabled={!canApply}
                  icon={<Icon icon={RotateCcwIcon} size="sm" />}
                  onClick={onApply}
                />
              </>
            ) : (
              <Text type="supporting" size="xsm" color="secondary">
                Case closed — no actions remain
              </Text>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------------------
// PAGE OWNER — single source of truth: the accounts array plus one
// updateAccount(id, patch). Funnel rollup, total MRR, and the forecast are
// derived from the rows every render, so Apply path / Mark recovered /
// Mark churned visibly move counts, dollars, bars, and the schedule lanes
// in the same commit. The last mutation is announced via the aria-live
// header ticker.
// ---------------------------------------------------------------------------

export default function SubscriptionDunningWorkbench() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [selectedId, setSelectedId] = useState<string | null>('AC-1046');
  const [stageFilter, setStageFilter] = useState<Stage | null>(null);
  const [draft, setDraft] = useState<Draft>({pathId: null, templateId: T_EXPIRED, variantId: 'A'});
  const [ticker, setTicker] = useState('Queue loaded — 10 accounts in the 21-day window.');

  const rootRef = useRef<HTMLDivElement | null>(null);
  const width = useElementWidth(rootRef);

  // Band flags — width 0 (first pre-observer frame) is treated as wide.
  const isWide = width === 0 || width >= 1200;
  const isOverlayBand = width > 0 && width < 1000;
  const isPhoneBand = width > 0 && width < 640;
  const asideWidth = isPhoneBand ? width : isWide && !isOverlayBand ? 400 : 360;

  const rollup = useMemo(() => rollupByStage(accounts), [accounts]);
  const totalMrr = useMemo(() => accounts.reduce((sum, account) => sum + account.mrr, 0), [accounts]);
  const forecast = useMemo(() => deriveForecast(accounts), [accounts]);

  const selected = selectedId != null ? accounts.find(account => account.id === selectedId) ?? null : null;

  const visibleAccounts = stageFilter == null ? accounts : accounts.filter(account => account.stage === stageFilter);

  const updateAccount = (id: string, patch: Partial<Account>) => {
    setAccounts(previous => previous.map(account => (account.id === id ? {...account, ...patch} : account)));
  };

  const restoreRowFocus = (id: string) => {
    const row = rootRef.current?.querySelector<HTMLButtonElement>(\`[data-account-row="\${id}"]\`);
    row?.focus();
  };

  const handleSelect = (account: Account) => {
    setSelectedId(account.id);
    // Draft re-seeds from the row in the SAME event — no effect needed.
    setDraft({
      pathId: account.pathId ?? null,
      templateId: account.templateId ?? (account.declineCode === 'expired_card' ? T_EXPIRED : T_FAILED),
      variantId: account.variantId ?? 'A',
    });
  };

  const handleToggleStage = (stage: Stage) => {
    setStageFilter(previous => (previous === stage ? null : stage));
  };

  // What the forecast becomes if the current draft is applied — previewed
  // as text under the composer BEFORE the commit, then confirmed by the
  // header chip after it.
  const draftForecastDelta = (() => {
    if (selected == null || draft.pathId == null) return null;
    if (selected.stage !== 'failed' && selected.stage !== 'retrying') return null;
    const nextRate = PATH_BY_ID.get(draft.pathId)?.recoveryRate ?? 0;
    const currentRate =
      selected.stage === 'retrying' && selected.pathId != null
        ? PATH_BY_ID.get(selected.pathId)?.recoveryRate ?? 0
        : 0;
    const delta = selected.mrr * (nextRate - currentRate);
    if (Math.round(delta) === 0) return null;
    return \`Applying moves the recovery forecast \${delta > 0 ? 'up' : 'down'} \${fmtUSD(Math.abs(delta))}/mo (\${
      fmtUSD(forecast)
    } → \${fmtUSD(forecast + delta)}).\`;
  })();

  const handleApply = () => {
    if (selected == null || draft.pathId == null || draft.templateId == null) return;
    const path = PATH_BY_ID.get(draft.pathId);
    if (path == null) return;
    updateAccount(selected.id, {
      pathId: draft.pathId,
      templateId: draft.templateId,
      variantId: draft.variantId,
      stage: selected.stage === 'failed' ? 'retrying' : selected.stage,
    });
    setTicker(
      \`\${path.name} + \${draft.templateId}/\${draft.variantId} applied to \${selected.id} — schedule redrawn, forecast re-derived.\`,
    );
  };

  const handleMarkRecovered = () => {
    if (selected == null) return;
    const day = Math.min(selected.dayIndex, WINDOW_DAYS);
    updateAccount(selected.id, {
      stage: 'recovered',
      resolvedDay: day,
      attempts: [
        ...selected.attempts,
        {day, dateLabel: '6 Jul 2026', outcome: 'recovered', note: \`Marked recovered by \${OPERATOR.name}\`},
      ],
    });
    setTicker(\`\${selected.id} marked recovered — \${fmtUSD(selected.mrr)}/mo moved to Recovered.\`);
  };

  const handleMarkChurned = () => {
    if (selected == null) return;
    updateAccount(selected.id, {stage: 'churned', resolvedDay: Math.min(selected.dayIndex, WINDOW_DAYS)});
    setTicker(\`\${selected.id} marked churned — removed from the recovery forecast.\`);
  };

  const handleCloseOverlay = () => {
    const id = selectedId;
    setSelectedId(null);
    if (id != null) restoreRowFocus(id);
  };

  const showAside = !isOverlayBand || selected != null;

  return (
    <div ref={rootRef} className={\`\${SCOPE} sdw-root\`}>
      <style>{TEMPLATE_CSS}</style>
      <Layout height="fill">
        <LayoutHeader>
          <div className="sdw-header">
            <DunwellMark />
            <VStack gap={0}>
              <Text type="label" size="sm">
                Dunwell
              </Text>
              <span className="sdw-mono" style={{color: 'var(--color-text-secondary)', fontSize: 10}}>
                Parcelbase · Jul 2026 cycle · {TODAY_LABEL}
              </span>
            </VStack>
            <StackItem size="fill">
              <span />
            </StackItem>
            <span className="sdw-ticker" aria-live="polite">
              {ticker}
            </span>
            <span
              className="sdw-forecast-chip"
              aria-label={\`Recovery forecast \${fmtUSD(forecast)} per month, derived from retrying and engaged accounts\`}>
              <Icon icon={CircleDollarSignIcon} size="xsm" color="inherit" />
              <span className="sdw-mono" style={{color: 'inherit', fontWeight: 700}}>
                {fmtUSD(forecast)}/mo
              </span>
              {!isPhoneBand ? (
                <Text type="supporting" size="xsm" color="inherit">
                  forecast
                </Text>
              ) : null}
            </span>
            <Avatar size="small" name={OPERATOR.name} alt={\`\${OPERATOR.name}, \${OPERATOR.role}\`} />
          </div>
        </LayoutHeader>
        <LayoutContent>
          <VStack gap={0} style={{height: '100%', minHeight: 0}}>
            <RecoveryFunnel
              rollup={rollup}
              totalMrr={totalMrr}
              activeStage={stageFilter}
              isNarrow={isPhoneBand}
              onToggleStage={handleToggleStage}
            />
            <div className="sdw-view">
              <div className="sdw-main">
                <DayAxis labelEvery={isWide ? 3 : 7} idColWide={isWide} showMrr={!isPhoneBand} />
                <div className="sdw-scroll">
                  {visibleAccounts.map(account => (
                    <AccountRow
                      key={account.id}
                      account={account}
                      isSelected={selectedId === account.id}
                      idColWide={isWide}
                      showMrr={!isPhoneBand}
                      showDeclineText={!isOverlayBand}
                      onSelect={() => handleSelect(account)}
                    />
                  ))}
                  {visibleAccounts.length === 0 ? (
                    <div className="sdw-empty">
                      <Text type="supporting" size="sm" color="secondary">
                        No accounts in {stageFilter != null ? STAGE_META[stageFilter].label : 'this'} — clear the funnel
                        filter to see the full queue.
                      </Text>
                    </div>
                  ) : null}
                </div>
                {/* Bottom-left corner owner: queue footer + shape legend. */}
                <div className="sdw-queue-footer">
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    {visibleAccounts.length} of {accounts.length} accounts
                    {stageFilter != null ? \` · \${STAGE_META[stageFilter].label} only\` : ''} · {fmtUSD(totalMrr)}/mo at
                    risk this cycle
                  </Text>
                  <StackItem size="fill">
                    <span />
                  </StackItem>
                  {!isOverlayBand ? (
                    <HStack gap={3} vAlign="center">
                      <span className="sdw-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
                        <span aria-hidden style={{display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: DANGER, marginRight: 4}} />
                        failed
                      </span>
                      <span className="sdw-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
                        <span aria-hidden style={{display: 'inline-block', width: 8, height: 8, borderRadius: 999, border: \`2px solid \${BRAND}\`, marginRight: 4}} />
                        scheduled
                      </span>
                      <span className="sdw-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
                        <span aria-hidden style={{display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: OK_GREEN, marginRight: 4}} />
                        recovered
                      </span>
                    </HStack>
                  ) : null}
                </div>
              </div>
              {showAside ? (
                <PlaybookPane
                  width={asideWidth}
                  isOverlay={isOverlayBand}
                  account={selected}
                  draft={draft}
                  forecastDeltaLabel={draftForecastDelta}
                  onClose={handleCloseOverlay}
                  onDraft={patch => setDraft(previous => ({...previous, ...patch}))}
                  onApply={handleApply}
                  onMarkRecovered={handleMarkRecovered}
                  onMarkChurned={handleMarkChurned}
                />
              ) : null}
            </div>
          </VStack>
        </LayoutContent>
      </Layout>
    </div>
  );
}
`;export{e as default};