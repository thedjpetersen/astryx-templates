var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Cohortiq site-monitoring surface
 *   for oncology trial CTQ-204-ALX ("ALX-204 in Relapsed Follicular
 *   Lymphoma", Phase II) at Site 014, Meridian Clinical Research, Omaha.
 *   Suite "today" anchor: Sun Jun 28, 2026 — every date and countdown is a
 *   pre-computed string (the SAE countdown is the frozen string '18:22';
 *   no Date.now(), no Math.random(), no timers, no network media).
 *   12 participants x 8 protocol visits = 96 matrix cells with dual
 *   scheduled/actual fields, 3 adverse events with CTCAE criteria per
 *   grade, and 3 seeded monitor-coordinator queries.
 * @output Trial Site Monitor — a clinical research associate's working
 *   surface: participants-by-visits VisitWindowMatrix where every cell
 *   encodes the actual visit date relative to its protocol window bracket
 *   (in-window / out-of-window breach / missed / locked hatch / future),
 *   a CTCAE AEGradeSelector whose Grade>=3 + related threshold cascades a
 *   full SAE workflow across the screen (rail flag, safety sort, matrix
 *   safety-hold locks, 24h-report countdown chip, auto-opened query), and
 *   QueryChipThread lifecycle chips (open -> answered -> closed with
 *   source verification) pinned to cells and expanded in the aside.
 * @position Page template; emitted by \`astryx template trial-site-monitor\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header bar 48px (Cohortiq mark + protocol/site switcher | countdown
 *   chip + sync dot + monitor avatar)
 *   | view root (flex, height 100%, minHeight 0, overflow hidden)
 *     | main column (toolbar 40px > matrix scroller > legend strip 32px)
 *     | aside 400px (identity header > AE card > gate row > query thread
 *       > footer action bar 48px), own scroll.
 * Container policy: app-shell archetype — frame rows, rails, and panels
 *   only; no Cards. The matrix, rail rows, and aside rows are styled divs
 *   on the content surface.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (BRAND = light-dark(#BE185D, #F472B6)) used exactly twice: the
 *   Cohortiq logo SVG and the selected rail row's 3px accent bar — both
 *   fills, never text. State colors ride the data-viz categorical vars
 *   with repo-standard light-dark fallbacks; every state color pairs with
 *   a shape channel (bracket position / hollow vs solid / hatch / tick),
 *   never color alone.
 *
 * FIXED DENSITY GRID (verbatim from spec): header bar 48px; toolbar/filter
 * row 40px; rail width 300px; rail rows 40px; matrix visit-header row
 * 56px; matrix cells 64px wide x 40px tall; aside 400px; aside heavy rows
 * 44px; legend strip 32px; single gutter token GUTTER = 12 (all
 * padding/margins are GUTTER or GUTTER/2 = 6); mono metadata 12px; body
 * text 13px; section labels 11px uppercase tracking 0.06em.
 *
 * Responsive contract — CONTAINER width via useElementWidth(viewRootRef)
 * ResizeObserver (the demo stage is ~1045–1075px inside a 1440px window,
 * so viewport media queries would lie; a viewport query covers only the
 * first pre-observer frame):
 * - W >= 1200: rail 300px, aside 400px, cells 64px (track 44px).
 * - 1000 <= W < 1200 (canonical demo band): rail 240px (names truncate
 *   earlier, arm tag drops), aside 360px, cells 56px (track 38px), site
 *   switcher shows the short label, toolbar filter chips drop text labels
 *   for glyphs. Rail 240 + 8x56 = 688px so all 8 visit columns fit the
 *   ~690px scroller at the canonical demo width — no clipped FU-30.
 * - W < 1000: aside leaves the flex flow and becomes a 360px absolute
 *   overlay (right 0, shadow, opens on participant/cell selection, X to
 *   close, Escape closes and restores focus); rail 220px with ID + dots
 *   only. Subtraction, not reflow — nothing squeezes.
 * - The matrix horizontal-scrolls inside its single scroller when the 8
 *   columns exceed the remaining width; the rail is sticky-left INSIDE
 *   that scroller so row alignment survives scroll. Whenever columns
 *   remain off-screen to the right, a gradient fade + chevron affordance
 *   appears on a NON-scrolling wrapper (a fade on the scroll container
 *   itself would scroll away with the content) so clipped never reads as
 *   complete; it hides once scrolled to the end.
 * Corner map: top-left Cohortiq mark + protocol/site switcher; top-right
 * SAE countdown chip (cascade-only) + sync dot + monitor avatar;
 * bottom-left rail footer 'Enrolled 12 / 30 · Screen-fail 1' pinned in
 * the sticky rail block; bottom-right aside footer action bar (or the
 * legend strip when the aside shows its empty state).
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import {
  CheckIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  FlaskConicalIcon,
  LockIcon,
  MessageSquarePlusIcon,
  MicroscopeIcon,
  ShieldAlertIcon,
  StethoscopeIcon,
  XIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback.
// ---------------------------------------------------------------------------

// THE quarantined brand literal. Exactly two usages: the Cohortiq logo SVG
// stroke/dot and the selected rail row's 3px accent bar. Both are FILLS —
// brand-as-text would need a darker pair to clear 4.5:1 and none exists here.
const BRAND = 'light-dark(#BE185D, #F472B6)';

const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
// Out-of-window warning: #B45309 on white = 4.6:1, #FBBF24 on #1E1E1E = 9.9:1.
const WARN = 'var(--color-data-categorical-orange, light-dark(#B45309, #FBBF24))';
const WARN_SOFT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))';
// Danger: #DC2626 on white = 4.5:1, #F87171 on #1E1E1E = 6.6:1.
const DANGER = 'light-dark(#DC2626, #F87171)';
const DANGER_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
const INFO_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
// Safety-hold hatch stripe (danger family) vs withdrawal hatch (grey family) —
// the lock glyph is reason-parameterized; the hatch geometry is identical.
const HATCH_DANGER = 'light-dark(rgba(220, 38, 38, 0.22), rgba(248, 113, 113, 0.26))';
const HATCH_GREY = 'light-dark(rgba(60, 60, 67, 0.18), rgba(235, 235, 245, 0.20))';
// CTCAE grade ramp G1..G5 — success -> warning -> danger, G4/G5 darkest.
const GRADE_RAMP = [
  OK_GREEN,
  'light-dark(#D97706, #FBBF24)',
  'light-dark(#EA580C, #FB923C)',
  'light-dark(#DC2626, #F87171)',
  'light-dark(#991B1B, #EF4444)',
];

// Single gutter token — all padding/margins on this page are GUTTER or
// GUTTER/2 = 6 (density grid law).
const GUTTER = 12;
const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the SAE badge pulse, and the reduced-motion guard.
// Transitions animate color/opacity only; the pulse collapses to a static
// filled badge under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const TSM_CSS = \`
.tsm-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.tsm-cell:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
.tsm-fade {
  transition: opacity 180ms ease, background-color 180ms ease;
}
@keyframes tsm-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.tsm-sae-pulse {
  animation: tsm-pulse 2s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .tsm-sae-pulse { animation: none; }
  .tsm-fade { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // Header bar 48px --------------------------------------------------------
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: 48,
    padding: \`0 \${GUTTER}px\`,
  },
  logoWrap: {display: 'inline-flex', alignItems: 'center', flexShrink: 0},
  mono: {fontFamily: MONO, fontSize: 12, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  countdownChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 24,
    padding: '0 6px 0 6px',
    borderRadius: 999,
    backgroundColor: DANGER_SOFT,
    border: \`1px solid \${DANGER}\`,
    color: DANGER,
    whiteSpace: 'nowrap',
  },
  // View root + main column -------------------------------------------------
  viewRoot: {
    display: 'flex',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  mainCol: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0},
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: 40,
    padding: \`0 \${GUTTER}px\`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  segGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  segBtn: {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    height: 26,
    padding: '0 10px',
    fontSize: 12,
    fontFamily: 'inherit',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  segBtnActive: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text)',
    fontWeight: 600,
  },
  // Non-scrolling wrapper that owns the right-edge overflow affordance —
  // the fade must NOT live on the scroller itself or it scrolls away with
  // the content.
  matrixViewport: {position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'},
  scroller: {flex: 1, minHeight: 0, overflow: 'auto', position: 'relative'},
  scrollHint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 44,
    zIndex: 5,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 3,
    background: 'linear-gradient(to right, transparent, var(--color-background) 72%)',
  },
  legendStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: 32,
    padding: \`0 \${GUTTER}px\`,
    borderTop: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  legendKey: {display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'},
  // Matrix ------------------------------------------------------------------
  matrixRow: {display: 'flex', alignItems: 'stretch'},
  railCell: {
    position: 'sticky',
    left: 0,
    zIndex: 2,
    flexShrink: 0,
    backgroundColor: 'var(--color-background)',
    borderRight: 'var(--border-width) solid var(--color-border)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  railHeadCell: {
    position: 'sticky',
    left: 0,
    zIndex: 4,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-end',
    padding: \`0 \${GUTTER}px 6px\`,
    backgroundColor: 'var(--color-background)',
    borderRight: 'var(--border-width) solid var(--color-border)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  visitHeadRow: {position: 'sticky', top: 0, zIndex: 3, display: 'flex'},
  visitHeadCell: {
    height: 56,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: '0 3px',
    textAlign: 'center',
    backgroundColor: 'var(--color-background)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  railBtn: {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    height: 40,
    padding: 0,
    paddingRight: 6,
    fontFamily: 'inherit',
    fontSize: 13,
    color: 'var(--color-text)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  railAccent: {width: 3, alignSelf: 'stretch', flexShrink: 0},
  railDots: {display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 'auto', flexShrink: 0},
  railFooter: {
    position: 'sticky',
    left: 0,
    bottom: 0,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    height: 32,
    padding: \`0 \${GUTTER}px\`,
    backgroundColor: 'var(--color-background)',
    borderRight: 'var(--border-width) solid var(--color-border)',
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  cell: {
    position: 'relative',
    height: 40,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  track: {position: 'relative', height: 2, backgroundColor: 'var(--color-border)'},
  bracketTick: {position: 'absolute', top: -4, width: 2, height: 10, backgroundColor: 'var(--color-text-secondary)'},
  dot: {position: 'absolute', top: -2, width: 6, height: 6, borderRadius: 999},
  queryBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 999,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    zIndex: 1,
  },
  lockGlyph: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Aside -------------------------------------------------------------------
  aside: {
    flex: 'none',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderLeft: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
  },
  asideOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 360,
    zIndex: 5,
    boxShadow: 'var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18))',
  },
  asideScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: GUTTER},
  identityHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: 64,
    padding: \`0 \${GUTTER}px\`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  heavyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    minHeight: 44,
    padding: \`0 \${GUTTER / 2}px\`,
  },
  gateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 36,
    padding: \`0 \${GUTTER / 2}px\`,
    borderRadius: 'var(--radius-container)',
    backgroundColor: DANGER_SOFT,
    color: DANGER,
    overflow: 'hidden',
  },
  asideFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: GUTTER / 2,
    height: 48,
    padding: \`0 \${GUTTER}px\`,
    borderTop: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GUTTER / 2,
    padding: GUTTER * 2,
    textAlign: 'center',
  },
  // AEGradeSelector ---------------------------------------------------------
  gradeBaseline: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 6,
    height: 36,
  },
  gradeBlock: {
    appearance: 'none',
    width: 52,
    padding: 0,
    border: 'none',
    borderRadius: 3,
    cursor: 'pointer',
  },
  criteriaBox: {
    height: 56,
    padding: GUTTER / 2,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  // QueryChipThread ---------------------------------------------------------
  queryChip: {
    appearance: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    height: 20,
    padding: '0 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'var(--color-background)',
    fontSize: 11,
    fontFamily: MONO,
    color: 'var(--color-text)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  stepper: {display: 'flex', alignItems: 'center', gap: 6, height: 28},
  stepSeg: {flex: 1, height: 3, borderRadius: 999, backgroundColor: 'var(--color-border)'},
  msgRow: {padding: '6px 0', display: 'flex', flexDirection: 'column', gap: 2},
  replyRow: {display: 'flex', alignItems: 'center', gap: GUTTER / 2, height: 36},
  verifyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 32,
    color: OK_GREEN,
    overflow: 'hidden',
  },
  // Utility -----------------------------------------------------------------
  noShrink: {flexShrink: 0, whiteSpace: 'nowrap'},
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ---------------------------------------------------------------------------
// DATA — one deterministic world: Cohortiq monitoring CTQ-204-ALX at Site
// 014. Suite "today" anchor: Sun Jun 28, 2026 (protocol day 45 for P-1042;
// the SAE lock threshold is protocol day 40 — every not-yet-completed visit
// sits above it). All dates are pre-computed strings; the SAE countdown is
// the frozen fixture string '18:22'. Signed-in user: CRA Dana Okafor ("DO"
// in the header). No Date.now(), no new Date(), no Math.random().
// ---------------------------------------------------------------------------

// Identity consts — entities are referenced by identity, never retyped.
const P_1042 = 'P-1042';
const P_1017 = 'P-1017';
const P_1029 = 'P-1029';
const P_1035 = 'P-1035';
const V_SCR = 'SCR';
const V_C1D1 = 'C1D1';
const V_C1D15 = 'C1D15';
const V_C2D1 = 'C2D1';
const V_C3D1 = 'C3D1';
const V_C4D1 = 'C4D1';
const V_EOT = 'EOT';
const V_FU30 = 'FU-30';
const Q_7 = 'Q-7';
const Q_4 = 'Q-4';
const Q_3 = 'Q-3';
const Q_AUTO = 'Q-AUTO';
const AE_31 = 'AE-31';
const AE_18 = 'AE-18';
const AE_24 = 'AE-24';

const PROTOCOL = {
  id: 'CTQ-204-ALX',
  title: 'ALX-204 in Relapsed Follicular Lymphoma',
  phase: 'Phase II',
  arms: ['A', 'B'],
};

// SITE-022 is the long-name stress fixture for the switcher.
const SITES = [
  {
    id: 'SITE-014',
    label: 'CTQ-204-ALX · Site 014 — Meridian Clinical Research, Omaha',
    shortLabel: 'Site 014 — Meridian…',
    pi: 'Dr. Elena Vasquez',
  },
  {
    id: 'SITE-022',
    label:
      'CTQ-204-ALX · Site 022 — University Hospitals of North Staffordshire — Oncology Research Unit',
    shortLabel: 'Site 022 — North Staffs…',
    pi: 'Dr. Hugh Bettany',
  },
];

const PEOPLE = {
  dana: {name: 'Dana Okafor', role: 'CRA' as const, initials: 'DO'},
  priya: {name: 'Priya Ramanathan', role: 'Coordinator' as const},
};

// P-1042 study day at the SAE cascade: locks apply to every cell scheduled
// AFTER protocol day 40 (all of that participant's not-yet-completed visits).
const SAFETY_LOCK_AFTER_DAY = 40;
// Frozen countdown — a fixture string, never a timer (24h clock started at
// the 27 Jun 23:50 onset call; 18:22 remains as of the 28 Jun anchor).
const SAE_COUNTDOWN_DISPLAY = '18:22';

type VisitKind = 'screening' | 'cycle' | 'closeout';

interface Visit {
  id: string;
  code: string;
  label: string;
  kind: VisitKind;
  scheduledDayOffset: number;
  windowMinus: number;
  windowPlus: number;
}

// 'EOT · End of Treatment' is the long-label stress for the 56px header cell.
const VISITS: Visit[] = [
  {id: V_SCR, code: 'SCR', label: 'Screening', kind: 'screening', scheduledDayOffset: -14, windowMinus: 7, windowPlus: 7},
  {id: V_C1D1, code: 'C1D1', label: 'Cycle 1 Day 1', kind: 'cycle', scheduledDayOffset: 1, windowMinus: 0, windowPlus: 2},
  {id: V_C1D15, code: 'C1D15', label: 'Cycle 1 Day 15', kind: 'cycle', scheduledDayOffset: 15, windowMinus: 3, windowPlus: 3},
  {id: V_C2D1, code: 'C2D1', label: 'Cycle 2 Day 1', kind: 'cycle', scheduledDayOffset: 29, windowMinus: 3, windowPlus: 3},
  {id: V_C3D1, code: 'C3D1', label: 'Cycle 3 Day 1', kind: 'cycle', scheduledDayOffset: 57, windowMinus: 3, windowPlus: 3},
  {id: V_C4D1, code: 'C4D1', label: 'Cycle 4 Day 1', kind: 'cycle', scheduledDayOffset: 85, windowMinus: 3, windowPlus: 3},
  {id: V_EOT, code: 'EOT', label: 'End of Treatment', kind: 'closeout', scheduledDayOffset: 113, windowMinus: 7, windowPlus: 7},
  {id: V_FU30, code: 'FU-30', label: 'Safety Follow-up', kind: 'closeout', scheduledDayOffset: 143, windowMinus: 7, windowPlus: 7},
];

const VISIT_BY_ID = new Map(VISITS.map(v => [v.id, v]));

type ParticipantStatus = 'enrolled' | 'screen-fail' | 'discontinued';

interface Participant {
  id: string;
  name: string;
  status: ParticipantStatus;
  arm?: 'A' | 'B'; // omit-when-undefined: P-1029 screen-failed pre-randomization
  discontinuedAtVisitId?: string;
  discontinuedNote?: string;
  saeFlag?: boolean;
  safetySortRank?: number;
}

// P-1017's 37-char name exists to exercise ellipsis at the 260px and 220px
// rail widths without breaking the 40px row.
const PARTICIPANTS: Participant[] = [
  {id: 'P-1001', name: 'Marcus Webb', status: 'enrolled', arm: 'A'},
  {id: 'P-1004', name: 'Lena Okonjo', status: 'enrolled', arm: 'B'},
  {id: 'P-1008', name: 'Sarah Whitfield', status: 'enrolled', arm: 'A'},
  {id: 'P-1011', name: 'Tomás Herrera', status: 'enrolled', arm: 'B'},
  {id: P_1017, name: 'Konstantinos Papadimitriou-Alvarez', status: 'enrolled', arm: 'A'},
  {id: 'P-1023', name: 'Ruth Adeyemi', status: 'enrolled', arm: 'B'},
  {id: 'P-1026', name: 'Janet Kowalski', status: 'enrolled', arm: 'A'},
  // Screen-fail stress: zero completed visits — a full row of dash cells and
  // a rail row with NO dot strip (omit-when-undefined proof).
  {id: P_1029, name: 'Owen Marsh', status: 'screen-fail'},
  {id: 'P-1031', name: 'Dmitri Sokolov', status: 'enrolled', arm: 'A'},
  // Discontinued stress: withdrawal at C2D1 — all later cells locked with the
  // GREY hatch (same geometry as safety-hold; the lock is reason-parameterized).
  {
    id: P_1035,
    name: 'Alice Tran',
    status: 'discontinued',
    arm: 'B',
    discontinuedAtVisitId: V_C2D1,
    discontinuedNote: 'Withdrew consent 26 May 2026',
  },
  {id: 'P-1038', name: 'Noor Haddad', status: 'enrolled', arm: 'A'},
  {id: P_1042, name: 'Evelyn Boateng', status: 'enrolled', arm: 'B'},
];

type CellStatus = 'in-window' | 'out-of-window' | 'missed' | 'future' | 'locked' | 'na';
type LockReason = 'safety-hold' | 'withdrawal';

interface VisitCell {
  id: string; // \`\${participantId}:\${visitId}\`
  participantId: string;
  visitId: string;
  status: CellStatus;
  scheduledDay: number; // protocol day — dual field with scheduledDate
  scheduledDate?: string;
  actualDay?: number; // dual field with actualDate
  actualDate?: string;
  deltaDays?: number;
  lockReason?: LockReason;
  prevStatus?: CellStatus; // restore target when a safety-hold is reversed
}

// Compact seed: [visitId, status, scheduledDate?, actualDate?, deltaDays?].
type CellSeed = [string, CellStatus, string?, string?, number?];

function buildCells(rows: Array<[string, CellSeed[]]>): Record<string, VisitCell> {
  const out: Record<string, VisitCell> = {};
  for (const [pid, seeds] of rows) {
    for (const [vid, status, scheduledDate, actualDate, deltaDays] of seeds) {
      const visit = VISIT_BY_ID.get(vid);
      if (visit == null) continue;
      const id = \`\${pid}:\${vid}\`;
      out[id] = {
        id,
        participantId: pid,
        visitId: vid,
        status,
        scheduledDay: visit.scheduledDayOffset,
        scheduledDate,
        actualDate,
        deltaDays,
        actualDay: deltaDays != null ? visit.scheduledDayOffset + deltaDays : undefined,
        lockReason: status === 'locked' ? 'withdrawal' : undefined,
      };
    }
  }
  return out;
}

// 12 participants x 8 visits = 96 cells. Chosen so completed-in-window /
// completed-total is EXACTLY 45/49 — the header's 91.8% window compliance is
// re-derived from these rows at render, never typed. Pre-seeded breaches:
// P-1023:C1D15 at +5 days against a −3/+3 window (visible before any
// interaction, carries open query Q-7), P-1004:C4D1 +4, P-1008:C2D1 +4
// (closed query Q-3), P-1031:C1D1 +3 against −0/+2 (answered query Q-4).
const INITIAL_CELLS: Record<string, VisitCell> = buildCells([
  ['P-1001', [
    [V_SCR, 'in-window', '2 Mar 2026', '2 Mar 2026', 0],
    [V_C1D1, 'in-window', '16 Mar 2026', '16 Mar 2026', 0],
    [V_C1D15, 'in-window', '30 Mar 2026', '31 Mar 2026', 1],
    [V_C2D1, 'in-window', '13 Apr 2026', '13 Apr 2026', 0],
    [V_C3D1, 'in-window', '11 May 2026', '12 May 2026', 1],
    [V_C4D1, 'in-window', '8 Jun 2026', '6 Jun 2026', -2],
    [V_EOT, 'future', '6 Jul 2026'],
    [V_FU30, 'future', '5 Aug 2026'],
  ]],
  ['P-1004', [
    [V_SCR, 'in-window', '9 Mar 2026', '9 Mar 2026', 0],
    [V_C1D1, 'in-window', '23 Mar 2026', '23 Mar 2026', 0],
    [V_C1D15, 'in-window', '6 Apr 2026', '7 Apr 2026', 1],
    [V_C2D1, 'in-window', '20 Apr 2026', '18 Apr 2026', -2],
    [V_C3D1, 'in-window', '18 May 2026', '19 May 2026', 1],
    [V_C4D1, 'out-of-window', '15 Jun 2026', '19 Jun 2026', 4],
    [V_EOT, 'future', '13 Jul 2026'],
    [V_FU30, 'future', '12 Aug 2026'],
  ]],
  ['P-1008', [
    [V_SCR, 'in-window', '30 Mar 2026', '30 Mar 2026', 0],
    [V_C1D1, 'in-window', '13 Apr 2026', '14 Apr 2026', 1],
    [V_C1D15, 'in-window', '27 Apr 2026', '27 Apr 2026', 0],
    [V_C2D1, 'out-of-window', '11 May 2026', '15 May 2026', 4],
    [V_C3D1, 'in-window', '8 Jun 2026', '8 Jun 2026', 0],
    [V_C4D1, 'future', '6 Jul 2026'],
    [V_EOT, 'future', '3 Aug 2026'],
    [V_FU30, 'future', '2 Sep 2026'],
  ]],
  ['P-1011', [
    [V_SCR, 'in-window', '6 Apr 2026', '6 Apr 2026', 0],
    [V_C1D1, 'in-window', '20 Apr 2026', '20 Apr 2026', 0],
    [V_C1D15, 'in-window', '4 May 2026', '3 May 2026', -1],
    [V_C2D1, 'missed', '18 May 2026'],
    [V_C3D1, 'in-window', '15 Jun 2026', '15 Jun 2026', 0],
    [V_C4D1, 'future', '13 Jul 2026'],
    [V_EOT, 'future', '10 Aug 2026'],
    [V_FU30, 'future', '9 Sep 2026'],
  ]],
  [P_1017, [
    [V_SCR, 'in-window', '20 Apr 2026', '20 Apr 2026', 0],
    [V_C1D1, 'in-window', '4 May 2026', '4 May 2026', 0],
    [V_C1D15, 'in-window', '18 May 2026', '19 May 2026', 1],
    [V_C2D1, 'in-window', '1 Jun 2026', '2 Jun 2026', 1],
    [V_C3D1, 'future', '29 Jun 2026'],
    [V_C4D1, 'future', '27 Jul 2026'],
    [V_EOT, 'future', '24 Aug 2026'],
    [V_FU30, 'future', '23 Sep 2026'],
  ]],
  ['P-1023', [
    [V_SCR, 'in-window', '27 Apr 2026', '27 Apr 2026', 0],
    [V_C1D1, 'in-window', '11 May 2026', '11 May 2026', 0],
    [V_C1D15, 'out-of-window', '25 May 2026', '30 May 2026', 5],
    [V_C2D1, 'in-window', '8 Jun 2026', '8 Jun 2026', 0],
    [V_C3D1, 'future', '6 Jul 2026'],
    [V_C4D1, 'future', '3 Aug 2026'],
    [V_EOT, 'future', '31 Aug 2026'],
    [V_FU30, 'future', '30 Sep 2026'],
  ]],
  ['P-1026', [
    [V_SCR, 'in-window', '23 Mar 2026', '23 Mar 2026', 0],
    [V_C1D1, 'in-window', '6 Apr 2026', '6 Apr 2026', 0],
    [V_C1D15, 'in-window', '20 Apr 2026', '21 Apr 2026', 1],
    [V_C2D1, 'in-window', '4 May 2026', '4 May 2026', 0],
    [V_C3D1, 'in-window', '1 Jun 2026', '31 May 2026', -1],
    [V_C4D1, 'future', '29 Jun 2026'],
    [V_EOT, 'future', '27 Jul 2026'],
    [V_FU30, 'future', '26 Aug 2026'],
  ]],
  [P_1029, [
    [V_SCR, 'na'],
    [V_C1D1, 'na'],
    [V_C1D15, 'na'],
    [V_C2D1, 'na'],
    [V_C3D1, 'na'],
    [V_C4D1, 'na'],
    [V_EOT, 'na'],
    [V_FU30, 'na'],
  ]],
  ['P-1031', [
    [V_SCR, 'in-window', '4 May 2026', '4 May 2026', 0],
    [V_C1D1, 'out-of-window', '18 May 2026', '21 May 2026', 3],
    [V_C1D15, 'in-window', '1 Jun 2026', '1 Jun 2026', 0],
    [V_C2D1, 'in-window', '15 Jun 2026', '16 Jun 2026', 1],
    [V_C3D1, 'future', '13 Jul 2026'],
    [V_C4D1, 'future', '10 Aug 2026'],
    [V_EOT, 'future', '7 Sep 2026'],
    [V_FU30, 'future', '7 Oct 2026'],
  ]],
  [P_1035, [
    [V_SCR, 'in-window', '13 Apr 2026', '13 Apr 2026', 0],
    [V_C1D1, 'in-window', '27 Apr 2026', '27 Apr 2026', 0],
    [V_C1D15, 'in-window', '11 May 2026', '11 May 2026', 0],
    [V_C2D1, 'in-window', '25 May 2026', '25 May 2026', 0],
    [V_C3D1, 'locked', '22 Jun 2026'],
    [V_C4D1, 'locked', '20 Jul 2026'],
    [V_EOT, 'locked', '17 Aug 2026'],
    [V_FU30, 'locked', '16 Sep 2026'],
  ]],
  ['P-1038', [
    [V_SCR, 'in-window', '25 May 2026', '25 May 2026', 0],
    [V_C1D1, 'in-window', '8 Jun 2026', '8 Jun 2026', 0],
    [V_C1D15, 'in-window', '22 Jun 2026', '23 Jun 2026', 1],
    [V_C2D1, 'future', '6 Jul 2026'],
    [V_C3D1, 'future', '3 Aug 2026'],
    [V_C4D1, 'future', '31 Aug 2026'],
    [V_EOT, 'future', '28 Sep 2026'],
    [V_FU30, 'future', '28 Oct 2026'],
  ]],
  [P_1042, [
    [V_SCR, 'in-window', '1 May 2026', '1 May 2026', 0],
    [V_C1D1, 'in-window', '15 May 2026', '15 May 2026', 0],
    [V_C1D15, 'in-window', '29 May 2026', '29 May 2026', 0],
    // The aria-label exemplar cell: scheduled d29 = 12 Jun, completed d30.
    [V_C2D1, 'in-window', '12 Jun 2026', '13 Jun 2026', 1],
    [V_C3D1, 'future', '10 Jul 2026'],
    [V_C4D1, 'future', '7 Aug 2026'],
    [V_EOT, 'future', '4 Sep 2026'],
    [V_FU30, 'future', '4 Oct 2026'],
  ]],
]);

type Causality = 'related' | 'unrelated';

interface AdverseEvent {
  id: string;
  participantId: string;
  term: string;
  grade: number; // 1..5
  causality: Causality;
  onsetDate: string;
  criteriaByGrade: [string, string, string, string, string];
  lastAssessed?: string;
  reportFiled?: string;
}

const INITIAL_AES: Record<string, AdverseEvent> = {
  [AE_31]: {
    id: AE_31,
    participantId: P_1042,
    term: 'Febrile neutropenia',
    grade: 2,
    causality: 'related',
    onsetDate: '27 Jun 2026',
    criteriaByGrade: [
      'Asymptomatic; ANC monitoring only, no intervention indicated',
      'Fever 38.0–38.2°C with ANC 1000–1500/mm3; oral antibiotics initiated',
      'ANC <1000/mm3 with fever ≥38.3°C; IV antibiotics indicated',
      'Life-threatening consequences; urgent intervention indicated',
      'Death related to adverse event',
    ],
  },
  [AE_18]: {
    id: AE_18,
    participantId: 'P-1008',
    term: 'Nausea',
    grade: 1,
    causality: 'unrelated',
    onsetDate: '12 Jun 2026',
    criteriaByGrade: [
      'Loss of appetite without alteration in eating habits',
      'Oral intake decreased without significant weight loss or dehydration',
      'Inadequate oral caloric or fluid intake; tube feeding or TPN indicated',
      'Life-threatening consequences; urgent intervention indicated',
      'Death related to adverse event',
    ],
  },
  [AE_24]: {
    id: AE_24,
    participantId: 'P-1023',
    term: 'ALT increased',
    grade: 2,
    causality: 'related',
    onsetDate: '20 Jun 2026',
    criteriaByGrade: [
      '>ULN – 3.0× ULN if baseline was normal',
      '>3.0 – 5.0× ULN if baseline was normal',
      '>5.0 – 20.0× ULN if baseline was normal',
      '>20.0× ULN if baseline was normal',
      'Death related to adverse event',
    ],
  },
};

type QueryState = 'open' | 'answered' | 'closed';
type QueryRole = 'CRA' | 'Coordinator' | 'System';

interface QueryMessage {
  author: string;
  role: QueryRole;
  timestamp: string; // fixture string, e.g. '28 Jun 2026 · 14:05'
  body: string;
}

interface Query {
  id: string;
  state: QueryState;
  cellId: string;
  messages: QueryMessage[];
  verifiedLine?: string; // present only when closed AND source-verified
}

// Q-3's six messages are the aside-scroll stress fixture.
const INITIAL_QUERIES: Record<string, Query> = {
  [Q_7]: {
    id: Q_7,
    state: 'open',
    cellId: 'P-1023:C1D15',
    messages: [
      {
        author: PEOPLE.dana.name,
        role: 'CRA',
        timestamp: '27 Jun 2026 · 09:41',
        body:
          'Q-7: C1D15 visit completed 30 May 2026, +5 days against the −3/+3 window. The chemistry draw on the requisition is dated 27 May 2026, which precedes the visit date on source. Please confirm the draw date against the lab requisition and log a protocol deviation if confirmed.',
      },
    ],
  },
  [Q_4]: {
    id: Q_4,
    state: 'answered',
    cellId: 'P-1031:C1D1',
    messages: [
      {
        author: PEOPLE.dana.name,
        role: 'CRA',
        timestamp: '24 Jun 2026 · 11:12',
        body:
          'Q-4: C1D1 dosing on 21 May 2026 is +3 days against a −0/+2 window. The source note references an admission — please confirm the reason for the deviation.',
      },
      {
        author: PEOPLE.priya.name,
        role: 'Coordinator',
        timestamp: '25 Jun 2026 · 08:47',
        body:
          'Subject was admitted 18–20 May for port placement; the PI deferred first dose to 21 May. Deviation logged as PD-112 and included in the June IRB packet.',
      },
    ],
  },
  [Q_3]: {
    id: Q_3,
    state: 'closed',
    cellId: 'P-1008:C2D1',
    verifiedLine: 'Source verified by D. Okafor — 28 Jun 2026',
    messages: [
      {
        author: PEOPLE.dana.name,
        role: 'CRA',
        timestamp: '2 Jun 2026 · 10:05',
        body:
          'Q-3: C2D1 visit dated 15 May 2026 is +4 days against the −3/+3 window and EDC has no deviation entry. Please confirm the visit date against the source calendar.',
      },
      {
        author: PEOPLE.priya.name,
        role: 'Coordinator',
        timestamp: '3 Jun 2026 · 09:32',
        body:
          'Visit occurred 15 May — subject travel delay. The deviation was drafted but not pushed; entering PD-108 today.',
      },
      {
        author: PEOPLE.dana.name,
        role: 'CRA',
        timestamp: '3 Jun 2026 · 14:20',
        body:
          'Thanks. Please also confirm the vitals timestamp — EDC shows 08:12, source shows 09:05.',
      },
      {
        author: PEOPLE.priya.name,
        role: 'Coordinator',
        timestamp: '4 Jun 2026 · 10:44',
        body:
          'Vitals were re-taken at 09:05 after a cuff error; the 08:12 entry was the aborted reading. Corrected in EDC with an audit note.',
      },
      {
        author: PEOPLE.dana.name,
        role: 'CRA',
        timestamp: '5 Jun 2026 · 16:03',
        body:
          'PD-108 verified in EDC and the vitals correction is in the audit trail. Closing pending source review at the next monitoring visit.',
      },
      {
        author: PEOPLE.priya.name,
        role: 'Coordinator',
        timestamp: '26 Jun 2026 · 13:15',
        body: 'Source binder is available for review in the coordinator office, shelf B.',
      },
    ],
  },
};

const INITIAL_QUERY_ORDER = [Q_7, Q_4, Q_3];

// ---------------------------------------------------------------------------
// HOOK — container-width ResizeObserver (pattern shared with
// grid-feeder-console / media-asset-pipeline): the demo stage renders this
// page in a ~1045–1075px container inside a 1440px window, so viewport media
// queries would lie. Width 0 = first pre-observer frame; the caller falls
// back to a viewport query for that frame only.
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
// COHORTIQ MARK — 24px inline SVG: two overlapping 16px trial-arm circles
// with a 3px dot in the lens intersection. BRAND usage 1 of 2.
// ---------------------------------------------------------------------------

function CohortiqMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden style={{flexShrink: 0}}>
      <circle cx={9} cy={12} r={8} fill="none" stroke={BRAND} strokeWidth={2} />
      <circle cx={15} cy={12} r={8} fill="none" stroke={BRAND} strokeWidth={2} opacity={0.55} />
      <circle cx={12} cy={12} r={1.5} fill={BRAND} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SHARED STATUS MAPS — every state color pairs with a shape channel (bracket
// position / hollow vs solid / hatch / dash / tick), never color alone.
// ---------------------------------------------------------------------------

const STATUS_LABEL: Record<CellStatus, string> = {
  'in-window': 'completed within window',
  'out-of-window': 'completed out of window',
  missed: 'missed',
  future: 'scheduled',
  locked: 'locked',
  na: 'not applicable',
};

function railDotColor(status: CellStatus): string {
  switch (status) {
    case 'in-window':
      return OK_GREEN;
    case 'out-of-window':
      return WARN;
    case 'missed':
      return DANGER;
    case 'locked':
      return 'var(--color-text-secondary)';
    default:
      return 'var(--color-border)';
  }
}

const QUERY_BADGE_BG: Record<QueryState, string> = {
  open: WARN,
  answered: INFO_BLUE,
  closed: 'light-dark(rgba(60, 60, 67, 0.35), rgba(235, 235, 245, 0.35))',
};

function cellAriaLabel(cell: VisitCell, visit: Visit, participant: Participant, query?: Query): string {
  const parts = [participant.id, visit.code];
  if (cell.status === 'in-window' || cell.status === 'out-of-window') {
    parts.push(
      \`completed day \${cell.actualDay}, \${cell.status === 'in-window' ? 'within' : 'outside'} window minus \${visit.windowMinus} plus \${visit.windowPlus}\`,
    );
  } else if (cell.status === 'locked') {
    parts.push(\`locked, \${cell.lockReason === 'safety-hold' ? 'safety hold' : 'withdrawal'}\`);
  } else if (cell.status === 'future') {
    parts.push(\`scheduled day \${cell.scheduledDay}, \${cell.scheduledDate ?? ''}\`);
  } else {
    parts.push(STATUS_LABEL[cell.status]);
  }
  if (query != null) {
    parts.push(\`query \${query.id} \${query.state}\`);
  }
  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// CountdownChip — thin wrapper, 24px header pill. The value is the frozen
// fixture string; there is no timer behind it.
// ---------------------------------------------------------------------------

function CountdownChip({value}: {value: string}) {
  return (
    <span style={styles.countdownChip}>
      <Icon icon={ShieldAlertIcon} size="xsm" color="inherit" />
      <span style={{...styles.mono, color: 'inherit'}}>{value}</span>
      <Text type="supporting" size="xsm" color="inherit">
        to report
      </Text>
    </span>
  );
}

// ---------------------------------------------------------------------------
// VisitWindowMatrix — fully custom; the DS has no vocabulary for
// date-relative-to-window. One scroller owns BOTH the sticky-left rail and
// the visit columns so rows can never misalign. Purely presentational:
// roving-tabindex focus tracking is its only internal state.
// ---------------------------------------------------------------------------

interface MatrixGeometry {
  railW: number;
  cellW: number;
  trackW: number;
  showNames: boolean;
  showArmTags: boolean;
}

interface VisitWindowMatrixProps {
  participants: Participant[];
  cells: Record<string, VisitCell>;
  queriesByCell: ReadonlyMap<string, Query>;
  selectedCellId: string | null;
  selectedParticipantId: string | null;
  geometry: MatrixGeometry;
  dimmedKinds: ReadonlySet<VisitKind>;
  queryFilterOn: boolean;
  railFooterLine: string;
  onSelectCell: (cellId: string) => void;
  onSelectParticipant: (participantId: string) => void;
  onToggleQuery: (cellId: string) => void;
  cellRefs: RefObject<Map<string, HTMLDivElement>>;
}

/** Window track + bracket + positioned dot for one cell. */
function CellGlyph({cell, visit, trackW}: {cell: VisitCell; visit: Visit; trackW: number}) {
  const half = trackW / 2;
  if (cell.status === 'na') {
    return (
      <Text type="supporting" size="xsm" color="secondary" aria-hidden>
        —
      </Text>
    );
  }
  if (cell.status === 'locked') {
    // Hatch overlay + lock glyph, no dot. The hatch color is
    // reason-parameterized: danger for safety-hold, grey for withdrawal.
    const stripe = cell.lockReason === 'safety-hold' ? HATCH_DANGER : HATCH_GREY;
    return (
      <>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: \`repeating-linear-gradient(45deg, \${stripe} 0px, \${stripe} 2px, transparent 2px, transparent 8px)\`,
          }}
        />
        <span
          style={{
            ...styles.lockGlyph,
            color:
              cell.lockReason === 'safety-hold' ? DANGER : 'var(--color-text-secondary)',
          }}
          aria-hidden>
          <LockIcon size={10} strokeWidth={2.5} />
        </span>
      </>
    );
  }
  const isFuture = cell.status === 'future';
  const isMissed = cell.status === 'missed';
  const delta = cell.deltaDays ?? 0;
  // Spec formula: left = half + (delta / windowPlus) * half, clamped so
  // breaches visibly land OUTSIDE the bracket ticks.
  const raw = half + (delta / Math.max(visit.windowPlus, 1)) * half;
  const dotLeft = Math.min(Math.max(raw, -6), trackW + 6);
  return (
    <span
      aria-hidden
      style={{
        ...styles.track,
        width: trackW,
        ...(isFuture
          ? {backgroundColor: 'transparent', borderTop: '2px dashed var(--color-border)', height: 0}
          : null),
      }}>
      <span style={{...styles.bracketTick, left: 0}} />
      <span style={{...styles.bracketTick, right: 0}} />
      {isMissed ? (
        // Hollow dot + slash centered on it — reads as a crossed-out visit,
        // the shape channel for missed (never color alone).
        <>
          <span
            style={{
              ...styles.dot,
              left: half - 4,
              backgroundColor: 'transparent',
              border: \`2px solid \${DANGER}\`,
              width: 8,
              height: 8,
              top: -3,
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: half - 7,
              top: 0,
              width: 14,
              height: 2,
              backgroundColor: DANGER,
              transform: 'rotate(-45deg)',
            }}
          />
        </>
      ) : isFuture ? (
        <span
          style={{
            ...styles.dot,
            left: half - 3,
            top: -4,
            backgroundColor: 'transparent',
            border: '1.5px solid var(--color-text-secondary)',
          }}
        />
      ) : (
        <span
          style={{
            ...styles.dot,
            left: dotLeft - 3,
            backgroundColor: cell.status === 'in-window' ? OK_GREEN : WARN,
          }}
        />
      )}
    </span>
  );
}

// RailRow — thin wrapper, 40px. Omit-when-undefined segments: arm tag,
// discontinued tag, and SAE badge render only when the field exists
// (P-1029 proves the empty path: no arm, no dot strip).
interface RailRowProps {
  participant: Participant;
  rowCells: VisitCell[];
  isSelected: boolean;
  geometry: MatrixGeometry;
  onSelect: () => void;
}

function RailRow({participant, rowCells, isSelected, geometry, onSelect}: RailRowProps) {
  const statusColor =
    participant.status === 'enrolled'
      ? OK_GREEN
      : participant.status === 'discontinued'
        ? WARN
        : 'var(--color-text-secondary)';
  return (
    <button
      type="button"
      className="tsm-focusable tsm-fade"
      style={{
        ...styles.railBtn,
        backgroundColor: isSelected ? 'var(--color-background-muted)' : 'transparent',
      }}
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={\`Select participant \${participant.id}, \${participant.name}\`}>
      {/* BRAND usage 2 of 2: the selected rail row's 3px accent bar. */}
      <span
        style={{...styles.railAccent, backgroundColor: isSelected ? BRAND : 'transparent'}}
        aria-hidden
      />
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          flexShrink: 0,
          backgroundColor: statusColor,
        }}
      />
      <span style={{...styles.mono, color: 'var(--color-text-secondary)'}}>{participant.id}</span>
      {geometry.showNames ? (
        <span
          style={{
            fontSize: 13,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
          {participant.name}
        </span>
      ) : null}
      {geometry.showArmTags && participant.arm != null ? (
        <span
          style={{
            fontSize: 11,
            color: 'var(--color-text-secondary)',
            border: 'var(--border-width) solid var(--color-border)',
            borderRadius: 999,
            padding: '0 5px',
            flexShrink: 0,
          }}>
          {participant.arm}
        </span>
      ) : null}
      {participant.discontinuedAtVisitId != null && geometry.showNames ? (
        <span style={{fontSize: 11, color: WARN, flexShrink: 0}}>DC</span>
      ) : null}
      {participant.status === 'screen-fail' && geometry.showNames ? (
        <span style={{fontSize: 11, color: 'var(--color-text-secondary)', flexShrink: 0}}>
          Screen-fail
        </span>
      ) : null}
      <span style={styles.railDots}>
        {participant.saeFlag === true ? (
          <span
            className="tsm-sae-pulse"
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: DANGER,
              marginRight: 3,
            }}
          />
        ) : null}
        {participant.status === 'screen-fail'
          ? null
          : rowCells.map(cell => (
              <span
                key={cell.id}
                aria-hidden
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: railDotColor(cell.status),
                  ...(cell.status === 'future' || cell.status === 'missed'
                    ? {
                        backgroundColor: 'transparent',
                        border: \`1px solid \${railDotColor(cell.status)}\`,
                      }
                    : null),
                }}
              />
            ))}
      </span>
    </button>
  );
}

function VisitWindowMatrix({
  participants,
  cells,
  queriesByCell,
  selectedCellId,
  selectedParticipantId,
  geometry,
  dimmedKinds,
  queryFilterOn,
  railFooterLine,
  onSelectCell,
  onSelectParticipant,
  onToggleQuery,
  cellRefs,
}: VisitWindowMatrixProps) {
  const {railW, cellW, trackW} = geometry;
  // Roving tabindex — the only internal state is focus tracking.
  const [focusPos, setFocusPos] = useState<{row: number; col: number}>({row: 0, col: 1});

  const focusCell = useCallback(
    (row: number, col: number) => {
      setFocusPos({row, col});
      const pid = participants[row]?.id;
      if (pid == null) return;
      const key = col === 0 ? \`rail:\${pid}\` : \`\${pid}:\${VISITS[col - 1]?.id}\`;
      const el = cellRefs.current?.get(key);
      el?.focus();
    },
    [participants, cellRefs],
  );

  const handleGridKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const {row, col} = focusPos;
    let next: {row: number; col: number} | null = null;
    if (event.key === 'ArrowRight') next = {row, col: Math.min(col + 1, VISITS.length)};
    else if (event.key === 'ArrowLeft') next = {row, col: Math.max(col - 1, 0)};
    else if (event.key === 'ArrowDown') next = {row: Math.min(row + 1, participants.length - 1), col};
    else if (event.key === 'ArrowUp') next = {row: Math.max(row - 1, 0), col};
    if (next != null) {
      event.preventDefault();
      focusCell(next.row, next.col);
    }
  };

  const registerRef = (key: string) => (el: HTMLDivElement | null) => {
    const map = cellRefs.current;
    if (map == null) return;
    if (el == null) map.delete(key);
    else map.set(key, el);
  };

  return (
    <div
      role="grid"
      aria-label="Participant visit window matrix"
      aria-rowcount={participants.length + 1}
      aria-colcount={VISITS.length + 1}
      style={{width: 'max-content', minWidth: '100%'}}
      onKeyDown={handleGridKeyDown}>
      <div role="row" style={styles.visitHeadRow}>
        <div role="columnheader" style={{...styles.railHeadCell, width: railW, height: 56}}>
          <span style={styles.sectionLabel}>Participants</span>
        </div>
        {VISITS.map(visit => (
          <div
            key={visit.id}
            role="columnheader"
            className="tsm-fade"
            style={{
              ...styles.visitHeadCell,
              width: cellW,
              opacity: dimmedKinds.has(visit.kind) ? 0.35 : 1,
            }}>
            <span style={styles.mono}>{visit.code}</span>
            {/* Two-line clamp — 'End of Treatment' is the stress label. */}
            <span
              style={{
                fontSize: 10,
                lineHeight: '11px',
                color: 'var(--color-text-secondary)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
              {visit.label}
            </span>
            {/* 9px + no inner spaces so 'd-14·−7/+7' fits the 56px column. */}
            <span style={{...styles.mono, fontSize: 9, color: 'var(--color-text-secondary)'}}>
              {\`d\${visit.scheduledDayOffset}·−\${visit.windowMinus}/+\${visit.windowPlus}\`}
            </span>
          </div>
        ))}
      </div>
      {participants.map((participant, rowIndex) => {
        const rowCells = VISITS.map(v => cells[\`\${participant.id}:\${v.id}\`]).filter(
          (c): c is VisitCell => c != null,
        );
        return (
          <div key={participant.id} role="row" style={styles.matrixRow}>
            <div
              role="rowheader"
              ref={registerRef(\`rail:\${participant.id}\`)}
              style={{...styles.railCell, width: railW}}>
              <RailRow
                participant={participant}
                rowCells={rowCells}
                isSelected={selectedParticipantId === participant.id}
                geometry={geometry}
                onSelect={() => onSelectParticipant(participant.id)}
              />
            </div>
            {VISITS.map((visit, colIndex) => {
              const cell = cells[\`\${participant.id}:\${visit.id}\`];
              if (cell == null) return null;
              const query = queriesByCell.get(cell.id);
              const isSelected = selectedCellId === cell.id;
              const isDimmed =
                dimmedKinds.has(visit.kind) || (queryFilterOn && query == null);
              const isFocusTarget =
                focusPos.row === rowIndex && focusPos.col === colIndex + 1;
              return (
                <div
                  key={cell.id}
                  role="gridcell"
                  ref={registerRef(cell.id)}
                  tabIndex={isFocusTarget ? 0 : -1}
                  className="tsm-cell tsm-fade"
                  aria-selected={isSelected}
                  aria-label={cellAriaLabel(cell, visit, participant, query)}
                  style={{
                    ...styles.cell,
                    width: cellW,
                    opacity: isDimmed ? 0.35 : 1,
                    backgroundColor:
                      selectedParticipantId === participant.id
                        ? 'var(--color-background-muted)'
                        : 'transparent',
                    boxShadow: isSelected
                      ? 'inset 0 0 0 2px var(--color-accent)'
                      : cell.status === 'out-of-window'
                        ? \`inset 0 0 0 1px \${WARN}\`
                        : undefined,
                  }}
                  onClick={() => {
                    setFocusPos({row: rowIndex, col: colIndex + 1});
                    onSelectCell(cell.id);
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectCell(cell.id);
                    }
                  }}>
                  <CellGlyph cell={cell} visit={visit} trackW={trackW} />
                  {query != null ? (
                    <button
                      type="button"
                      className="tsm-focusable"
                      style={{...styles.queryBadge, backgroundColor: QUERY_BADGE_BG[query.state]}}
                      aria-label={\`Query \${query.id}, \${query.state} — open thread\`}
                      onClick={event => {
                        event.stopPropagation();
                        onToggleQuery(cell.id);
                      }}>
                      {query.state === 'closed' ? (
                        <CheckIcon size={10} strokeWidth={3} color="var(--color-background)" aria-hidden />
                      ) : null}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      })}
      {/* Bottom-left corner owner: the rail footer, pinned inside the sticky
          rail block. The count derives from the participants array. */}
      <div style={{...styles.railFooter, width: railW}}>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {railFooterLine}
        </Text>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MatrixScrollport — non-scrolling wrapper around the matrix scroller. When
// visit columns remain off-screen to the right (scrollLeft + clientWidth <
// scrollWidth), it overlays a right-edge gradient fade + chevron so a
// hard-clipped column can never read as the last one ('FU-3' vs 'FU-30').
// The affordance lives on THIS wrapper, not the scroller — a fade on the
// scroll container itself would scroll away with the content. At the
// canonical demo band the 8 columns fit (rail 240 + 8x56 = 688px) and the
// hint never renders; it is defense for narrower slices of each band.
// ---------------------------------------------------------------------------

function MatrixScrollport({children}: {children: ReactNode}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateOverflow = useCallback(() => {
    const el = scrollerRef.current;
    if (el == null) return;
    setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el == null) return undefined;
    updateOverflow();
    // Re-check on viewport resize; content-width changes (geometry band
    // flips) only happen alongside container resizes, so this covers both.
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateOverflow]);

  return (
    <div style={styles.matrixViewport}>
      <div ref={scrollerRef} style={styles.scroller} onScroll={updateOverflow}>
        {children}
      </div>
      {canScrollRight ? (
        <div style={styles.scrollHint} aria-hidden>
          <Icon icon={ChevronRightIcon} size="xsm" color="secondary" />
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AEGradeSelector — fully custom; a stock segmented control has no
// regulatory threshold semantics. Presentational: the SAE cascade lives in
// the owner, never here. role=radiogroup, arrow keys move grade.
// ---------------------------------------------------------------------------

const GRADE_HEIGHTS = [12, 18, 24, 30, 36];

interface AeGradePatch {
  grade?: number;
  causality?: Causality;
}

interface AEGradeSelectorProps {
  aeId: string;
  grade: number;
  causality: Causality;
  criteriaByGrade: [string, string, string, string, string];
  onChange: (patch: AeGradePatch) => void;
}

function AEGradeSelector({aeId, grade, causality, criteriaByGrade, onChange}: AEGradeSelectorProps) {
  const [hoveredGrade, setHoveredGrade] = useState<number | null>(null);
  const shownGrade = hoveredGrade ?? grade;
  const meetsSae = grade >= 3 && causality === 'related';

  const handleGradeKeys = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange({grade: Math.min(grade + 1, 5)});
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange({grade: Math.max(grade - 1, 1)});
    }
  };

  return (
    <VStack gap={2}>
      <div
        role="radiogroup"
        aria-label="CTCAE grade"
        style={styles.gradeBaseline}
        onKeyDown={handleGradeKeys}>
        {GRADE_HEIGHTS.map((height, index) => {
          const g = index + 1;
          const isSelected = g === grade;
          return (
            <VStack key={g} gap={1} hAlign="center">
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={\`Grade \${g}\`}
                aria-describedby={\`\${aeId}-crit-\${g}\`}
                tabIndex={isSelected ? 0 : -1}
                className="tsm-focusable tsm-fade"
                style={{
                  ...styles.gradeBlock,
                  height,
                  alignSelf: 'flex-end',
                  backgroundColor: isSelected ? GRADE_RAMP[index] : 'transparent',
                  border: isSelected
                    ? '1px solid transparent'
                    : '1px solid var(--color-border)',
                }}
                onClick={() => onChange({grade: g})}
                onMouseEnter={() => setHoveredGrade(g)}
                onMouseLeave={() => setHoveredGrade(null)}
              />
              <span style={{...styles.mono, color: isSelected ? 'var(--color-text)' : 'var(--color-text-secondary)'}}>
                {g}
              </span>
              <span id={\`\${aeId}-crit-\${g}\`} style={styles.visuallyHidden}>
                {criteriaByGrade[index]}
              </span>
            </VStack>
          );
        })}
      </div>
      <div style={styles.criteriaBox}>
        <Text type="supporting" size="xsm" color="secondary" maxLines={3}>
          {\`G\${shownGrade}: \${criteriaByGrade[shownGrade - 1]}\`}
        </Text>
      </div>
      <div role="radiogroup" aria-label="Causality" style={styles.segGroup}>
        {(['related', 'unrelated'] as const).map(option => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={causality === option}
            className="tsm-focusable tsm-fade"
            style={{
              ...styles.segBtn,
              height: 28,
              ...(causality === option ? styles.segBtnActive : null),
            }}
            onClick={() => onChange({causality: option})}>
            {option === 'related' ? 'Related' : 'Unrelated'}
          </button>
        ))}
      </div>
      {meetsSae ? (
        <div style={styles.gateRow}>
          <Icon icon={ShieldAlertIcon} size="xsm" color="inherit" />
          <Text type="supporting" size="xsm" color="inherit" maxLines={1}>
            Meets SAE threshold — 24-hour report required
          </Text>
        </div>
      ) : null}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// QueryChipThread — custom composite; a comment popover has no verification
// lifecycle. Collapsed chip = 20px pill; expanded panel renders in the
// aside at full inner width, never floating. Messages live in the store.
// ---------------------------------------------------------------------------

const QUERY_STEPS: QueryState[] = ['open', 'answered', 'closed'];

interface QueryChipThreadProps {
  query: Query;
  expanded: boolean;
  onExpand: () => void;
  onReply: (text: string) => void;
  onAdvanceState: () => void;
}

function QueryChip({query, expanded, onExpand}: {query: Query; expanded: boolean; onExpand: () => void}) {
  return (
    <button
      type="button"
      className="tsm-focusable tsm-fade"
      style={{
        ...styles.queryChip,
        ...(expanded ? {borderColor: 'var(--color-accent)'} : null),
      }}
      aria-expanded={expanded}
      onClick={onExpand}>
      {query.id}
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          backgroundColor: QUERY_BADGE_BG[query.state],
          display: 'inline-flex',
        }}
      />
      {query.state === 'closed' ? (
        <CheckIcon size={10} strokeWidth={3} color="var(--color-text-secondary)" aria-hidden />
      ) : null}
    </button>
  );
}

function QueryChipThread({query, expanded, onExpand, onReply, onAdvanceState}: QueryChipThreadProps) {
  const [draft, setDraft] = useState('');
  const stepIndex = QUERY_STEPS.indexOf(query.state);

  const submitReply = () => {
    const text = draft.trim();
    if (text.length === 0) return;
    onReply(text);
    setDraft('');
  };

  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <QueryChip query={query} expanded={expanded} onExpand={onExpand} />
        <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
          {query.cellId}
        </Text>
      </HStack>
      {expanded ? (
        <VStack gap={2}>
          <div style={styles.stepper} aria-label={\`Query state: \${query.state}\`}>
            {QUERY_STEPS.map((step, index) => (
              <VStack key={step} gap={1} style={{flex: 1}}>
                <span
                  style={{
                    ...styles.stepSeg,
                    backgroundColor:
                      index <= stepIndex
                        ? step === 'closed' && index === stepIndex
                          ? OK_GREEN
                          : 'var(--color-accent)'
                        : 'var(--color-border)',
                  }}
                />
                <Text
                  type="supporting"
                  size="xsm"
                  color={index === stepIndex ? 'primary' : 'secondary'}>
                  {step}
                </Text>
              </VStack>
            ))}
          </div>
          <div role="log" aria-label={\`Query \${query.id} messages\`} aria-live="polite">
            {query.messages.map((message, index) => (
              <div key={\`\${message.timestamp}-\${index}\`} style={styles.msgRow}>
                <HStack gap={2} vAlign="center">
                  <Text type="label" size="xsm">
                    {message.author}
                  </Text>
                  <span style={styles.noShrink}>
                    <Token size="sm" color={message.role === 'CRA' ? 'blue' : message.role === 'System' ? 'purple' : 'gray'} label={message.role} />
                  </span>
                  <span style={{...styles.mono, fontSize: 11, color: 'var(--color-text-secondary)'}}>
                    {message.timestamp}
                  </span>
                </HStack>
                <Text type="body" size="sm">
                  {message.body}
                </Text>
              </div>
            ))}
          </div>
          {query.state === 'closed' && query.verifiedLine != null ? (
            <div style={styles.verifyRow}>
              <Icon icon={CheckIcon} size="xsm" color="inherit" />
              <Text type="supporting" size="xsm" color="inherit" maxLines={1}>
                {query.verifiedLine}
              </Text>
            </div>
          ) : null}
          <div style={styles.replyRow}>
            <StackItem size="fill">
              <TextInput
                label={\`Reply to query \${query.id}\`}
                isLabelHidden
                size="sm"
                placeholder="Reply…"
                value={draft}
                onChange={setDraft}
                onEnter={submitReply}
              />
            </StackItem>
            <Button label="Reply" variant="secondary" size="sm" onClick={submitReply} />
            {query.state !== 'closed' ? (
              <Button
                label={query.state === 'open' ? 'Mark answered' : 'Close'}
                variant="ghost"
                size="sm"
                onClick={onAdvanceState}
              />
            ) : null}
          </div>
        </VStack>
      ) : null}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// ASIDE — participant identity header 64px > visit detail (44px heavy rows)
// > AE card with AEGradeSelector > query threads > footer action bar 48px.
// Empty state until first selection (the legend strip then owns the visual
// bottom-right corner).
// ---------------------------------------------------------------------------

function DetailRow({label, value, sub}: {label: string; value: string; sub?: string}) {
  return (
    <div style={styles.heavyRow}>
      <span style={{...styles.sectionLabel, width: 92, flexShrink: 0}}>{label}</span>
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="body" size="sm" hasTabularNumbers>
            {value}
          </Text>
          {sub != null ? (
            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
              {sub}
            </Text>
          ) : null}
        </VStack>
      </StackItem>
    </div>
  );
}

interface AsidePanelProps {
  width: number;
  isOverlay: boolean;
  participant: Participant | null;
  cell: VisitCell | null;
  cellQuery: Query | null;
  ae: AdverseEvent | null;
  participantQueries: Query[];
  expandedQueryId: string | null;
  onClose: () => void;
  onAeChange: (aeId: string, patch: AeGradePatch) => void;
  onAttachQuery: (cellId: string) => void;
  onExpandQuery: (queryId: string) => void;
  onReplyQuery: (queryId: string, text: string) => void;
  onAdvanceQuery: (queryId: string) => void;
  onSaveAssessment: (aeId: string) => void;
  onSubmitSaeReport: (aeId: string) => void;
}

function AsidePanel({
  width,
  isOverlay,
  participant,
  cell,
  cellQuery,
  ae,
  participantQueries,
  expandedQueryId,
  onClose,
  onAeChange,
  onAttachQuery,
  onExpandQuery,
  onReplyQuery,
  onAdvanceQuery,
  onSaveAssessment,
  onSubmitSaeReport,
}: AsidePanelProps) {
  const visit = cell != null ? VISIT_BY_ID.get(cell.visitId) : undefined;
  const gateOpen = ae != null && ae.grade >= 3 && ae.causality === 'related';
  return (
    <aside
      aria-label="Participant and visit detail"
      style={{
        ...styles.aside,
        width,
        ...(isOverlay ? styles.asideOverlay : null),
      }}>
      {participant == null ? (
        <div style={styles.emptyState}>
          <Icon icon={MicroscopeIcon} size="lg" color="secondary" />
          <Heading level={2}>Nothing selected</Heading>
          <Text type="supporting" size="sm" color="secondary">
            Select a participant or visit cell
          </Text>
        </div>
      ) : (
        <>
          <div style={styles.identityHeader}>
            <StackItem size="fill">
              <VStack gap={0}>
                <HStack gap={2} vAlign="center">
                  <span style={styles.mono}>{participant.id}</span>
                  {participant.arm != null ? (
                    <span style={styles.noShrink}>
                      <Token size="sm" color="default" label={\`Arm \${participant.arm}\`} />
                    </span>
                  ) : null}
                  {participant.saeFlag === true ? (
                    <span style={styles.noShrink}>
                      <Token size="sm" color="red" label="SAE" />
                    </span>
                  ) : null}
                </HStack>
                <Heading level={2} maxLines={1}>
                  {participant.name}
                </Heading>
              </VStack>
            </StackItem>
            {isOverlay ? (
              <Button
                label="Close detail panel"
                isIconOnly
                variant="ghost"
                size="sm"
                icon={<Icon icon={XIcon} size="sm" />}
                onClick={onClose}
              />
            ) : null}
          </div>
          <div style={styles.asideScroll}>
            <VStack gap={3}>
              {participant.status === 'screen-fail' ? (
                <Text type="supporting" size="xsm" color="secondary">
                  Screen failure — no visits completed. Not included in dosing cohorts.
                </Text>
              ) : null}
              {participant.discontinuedNote != null ? (
                <Text type="supporting" size="xsm" color="secondary">
                  Discontinued at {participant.discontinuedAtVisitId} — {participant.discontinuedNote}.
                  Later visits are locked (withdrawal).
                </Text>
              ) : null}
              {cell != null && visit != null ? (
                <VStack gap={1}>
                  <span style={styles.sectionLabel}>
                    Visit detail — {visit.code} · {visit.label}
                  </span>
                  <DetailRow
                    label="Scheduled"
                    value={cell.scheduledDate ?? '—'}
                    sub={\`Protocol day \${cell.scheduledDay} · window −\${visit.windowMinus}/+\${visit.windowPlus}\`}
                  />
                  <DetailRow
                    label="Actual"
                    value={cell.actualDate ?? STATUS_LABEL[cell.status]}
                    sub={
                      cell.actualDay != null
                        ? \`Day \${cell.actualDay} · Δ \${cell.deltaDays != null && cell.deltaDays > 0 ? '+' : ''}\${cell.deltaDays} d \${cell.status === 'out-of-window' ? '· OUT OF WINDOW' : '· in window'}\`
                        : cell.status === 'locked'
                          ? cell.lockReason === 'safety-hold'
                            ? 'Locked — safety hold'
                            : 'Locked — withdrawal'
                          : undefined
                    }
                  />
                  <div style={styles.heavyRow}>
                    <Button
                      label={cellQuery != null ? \`Query \${cellQuery.id} attached\` : 'Attach query'}
                      variant="secondary"
                      size="sm"
                      icon={<Icon icon={MessageSquarePlusIcon} size="sm" />}
                      isDisabled={cellQuery != null || cell.status === 'na'}
                      onClick={() => onAttachQuery(cell.id)}
                    />
                  </div>
                  <Divider />
                </VStack>
              ) : null}
              {ae != null ? (
                <VStack gap={2}>
                  <span style={styles.sectionLabel}>Adverse event</span>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <span style={styles.mono}>{ae.id}</span>
                    <Text type="label" size="sm">
                      {ae.term}
                    </Text>
                    <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                      Onset {ae.onsetDate}
                    </Text>
                  </HStack>
                  <AEGradeSelector
                    aeId={ae.id}
                    grade={ae.grade}
                    causality={ae.causality}
                    criteriaByGrade={ae.criteriaByGrade}
                    onChange={patch => onAeChange(ae.id, patch)}
                  />
                  {ae.lastAssessed != null ? (
                    <Text type="supporting" size="xsm" color="secondary">
                      {ae.lastAssessed}
                    </Text>
                  ) : null}
                  {ae.reportFiled != null ? (
                    <span style={styles.noShrink}>
                      <Token size="sm" color="green" label={ae.reportFiled} />
                    </span>
                  ) : null}
                  <Divider />
                </VStack>
              ) : null}
              {participantQueries.length > 0 ? (
                <VStack gap={2}>
                  <span style={styles.sectionLabel}>Queries</span>
                  {participantQueries.map(query => (
                    <QueryChipThread
                      key={query.id}
                      query={query}
                      expanded={expandedQueryId === query.id}
                      onExpand={() => onExpandQuery(query.id)}
                      onReply={text => onReplyQuery(query.id, text)}
                      onAdvanceState={() => onAdvanceQuery(query.id)}
                    />
                  ))}
                </VStack>
              ) : null}
            </VStack>
          </div>
          {/* Bottom-right corner owner while a participant is selected. */}
          <div style={styles.asideFooter}>
            {ae != null && gateOpen && ae.reportFiled == null ? (
              <Button
                label="Submit SAE report"
                variant="destructive"
                size="sm"
                onClick={() => onSubmitSaeReport(ae.id)}
              />
            ) : null}
            {ae != null ? (
              <Button
                label="Save assessment"
                variant="primary"
                size="sm"
                onClick={() => onSaveAssessment(ae.id)}
              />
            ) : (
              <Text type="supporting" size="xsm" color="secondary">
                Monitoring visit · {PEOPLE.dana.name}
              </Text>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------------------
// LEGEND — bracket-encoding key, 32px strip under the scroller.
// ---------------------------------------------------------------------------

function LegendSwatch({kind}: {kind: 'in-window' | 'out-of-window' | 'missed' | 'locked' | 'future'}) {
  if (kind === 'locked') {
    return (
      <span
        aria-hidden
        style={{
          width: 14,
          height: 10,
          backgroundImage: \`repeating-linear-gradient(45deg, \${HATCH_GREY} 0px, \${HATCH_GREY} 2px, transparent 2px, transparent 5px)\`,
          border: 'var(--border-width) solid var(--color-border)',
        }}
      />
    );
  }
  if (kind === 'future') {
    return <span aria-hidden style={{width: 14, borderTop: '2px dashed var(--color-border)'}} />;
  }
  const color = kind === 'in-window' ? OK_GREEN : kind === 'out-of-window' ? WARN : DANGER;
  return (
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        ...(kind === 'missed'
          ? {backgroundColor: 'transparent', border: \`2px solid \${color}\`}
          : {backgroundColor: color}),
      }}
    />
  );
}

const LEGEND_KEYS = [
  {kind: 'in-window' as const, label: 'In window'},
  {kind: 'out-of-window' as const, label: 'Out of window'},
  {kind: 'missed' as const, label: 'Missed'},
  {kind: 'locked' as const, label: 'Locked'},
  {kind: 'future' as const, label: 'Scheduled'},
];

function LegendStrip() {
  return (
    <div style={styles.legendStrip} aria-label="Cell encoding legend">
      {LEGEND_KEYS.map(key => (
        <span key={key.kind} style={styles.legendKey}>
          <LegendSwatch kind={key.kind} />
          <Text type="supporting" size="xsm" color="secondary">
            {key.label}
          </Text>
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — single state owner. Every surface receives data + callbacks only;
// every mutation has an observable consequence elsewhere on screen.
// ---------------------------------------------------------------------------

interface StudyState {
  participants: Record<string, Participant>;
  cells: Record<string, VisitCell>;
  aes: Record<string, AdverseEvent>;
  queries: Record<string, Query>;
  queryOrder: string[];
  saeActive: boolean;
}

const INITIAL_STATE: StudyState = {
  participants: Object.fromEntries(PARTICIPANTS.map(p => [p.id, p])),
  cells: INITIAL_CELLS,
  aes: INITIAL_AES,
  queries: INITIAL_QUERIES,
  queryOrder: INITIAL_QUERY_ORDER,
  saeActive: false,
};

const VISIT_KIND_CHIPS: Array<{kind: VisitKind; label: string; icon: typeof MicroscopeIcon}> = [
  {kind: 'screening', label: 'Screening', icon: MicroscopeIcon},
  {kind: 'cycle', label: 'Cycles', icon: FlaskConicalIcon},
  {kind: 'closeout', label: 'Close-out', icon: StethoscopeIcon},
];

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  );
}

export default function TrialSiteMonitorTemplate() {
  // Responsive bands measured on the VIEW ROOT container, not the viewport
  // (see responsive contract in the header comment). Width 0 = first
  // pre-observer frame; viewport queries cover only that frame.
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const viewWidth = useElementWidth(viewRootRef);
  const isViewportMid = useMediaQuery('(max-width: 1279px)');
  const isViewportNarrow = useMediaQuery('(max-width: 1023px)');
  const isMid = viewWidth > 0 ? viewWidth < 1200 : isViewportMid;
  const isNarrow = viewWidth > 0 ? viewWidth < 1000 : isViewportNarrow;

  const geometry: MatrixGeometry = isNarrow
    ? {railW: 220, cellW: 56, trackW: 38, showNames: false, showArmTags: false}
    : isMid
      ? // Rail 240 (not 260): 240 + 8x56 = 688px fits the ~690px scroller at
        // the canonical demo width, so FU-30 renders whole instead of
        // hard-clipping to a plausible-but-wrong 'FU-3'.
        {railW: 240, cellW: 56, trackW: 38, showNames: true, showArmTags: false}
      : {railW: 300, cellW: 64, trackW: 44, showNames: true, showArmTags: true};

  // ---- THE single state owner ---------------------------------------------
  const [study, setStudy] = useState<StudyState>(INITIAL_STATE);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [expandedQueryId, setExpandedQueryId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'safety' | 'id'>('safety');
  const [hiddenKinds, setHiddenKinds] = useState<ReadonlySet<VisitKind>>(() => new Set());
  const [queryFilterOn, setQueryFilterOn] = useState(false);
  const [siteId, setSiteId] = useState(SITES[0].id);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [nextQueryNum, setNextQueryNum] = useState(8);
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // One generic mutation path for simple patches.
  const update = useCallback(
    <K extends 'participants' | 'cells' | 'aes' | 'queries'>(
      collection: K,
      id: string,
      patch: Partial<StudyState[K][string]>,
    ) => {
      setStudy(prev => {
        const table = prev[collection] as Record<string, StudyState[K][string]>;
        const existing = table[id];
        if (existing == null) return prev;
        return {...prev, [collection]: {...table, [id]: {...existing, ...patch}}};
      });
    },
    [],
  );

  // The signature interaction: grading an AE across the Grade>=3 + related
  // threshold cascades the ENTIRE SAE workflow in ONE state update — rail
  // flag + safety-sort rank, safety-hold locks on every future cell, the
  // countdown chip, and the auto-opened query. Lowering the grade reverses
  // every effect (both directions demoable).
  const handleAeChange = useCallback((aeId: string, patch: AeGradePatch) => {
    setStudy(prev => {
      const ae = prev.aes[aeId];
      if (ae == null) return prev;
      const nextAe = {...ae, ...patch};
      const wasSae = ae.grade >= 3 && ae.causality === 'related';
      const isSae = nextAe.grade >= 3 && nextAe.causality === 'related';
      let next: StudyState = {...prev, aes: {...prev.aes, [aeId]: nextAe}};
      if (isSae === wasSae) return next;
      const pid = ae.participantId;
      if (isSae) {
        const cells = {...next.cells};
        for (const key of Object.keys(cells)) {
          const cell = cells[key];
          if (
            cell.participantId === pid &&
            cell.scheduledDay > SAFETY_LOCK_AFTER_DAY &&
            cell.status !== 'locked' &&
            cell.status !== 'na'
          ) {
            cells[key] = {...cell, prevStatus: cell.status, status: 'locked', lockReason: 'safety-hold'};
          }
        }
        const autoQuery: Query = {
          id: Q_AUTO,
          state: 'open',
          cellId: \`\${pid}:\${V_C2D1}\`,
          messages: [
            {
              author: 'Cohortiq',
              role: 'System',
              timestamp: '28 Jun 2026 · 09:12',
              body: 'Auto-generated: SAE onset visit — verify source documentation within 24h.',
            },
          ],
        };
        next = {
          ...next,
          cells,
          participants: {
            ...next.participants,
            [pid]: {...next.participants[pid], saeFlag: true, safetySortRank: 0},
          },
          queries: {...next.queries, [Q_AUTO]: autoQuery},
          queryOrder: next.queryOrder.includes(Q_AUTO)
            ? next.queryOrder
            : [Q_AUTO, ...next.queryOrder],
          saeActive: true,
        };
      } else {
        const cells = {...next.cells};
        for (const key of Object.keys(cells)) {
          const cell = cells[key];
          if (cell.participantId === pid && cell.lockReason === 'safety-hold') {
            cells[key] = {
              ...cell,
              status: cell.prevStatus ?? 'future',
              lockReason: undefined,
              prevStatus: undefined,
            };
          }
        }
        const queries = {...next.queries};
        delete queries[Q_AUTO];
        const {saeFlag: _saeFlag, safetySortRank: _rank, ...restParticipant} =
          next.participants[pid];
        next = {
          ...next,
          cells,
          participants: {...next.participants, [pid]: restParticipant},
          queries,
          queryOrder: next.queryOrder.filter(id => id !== Q_AUTO),
          saeActive: false,
        };
      }
      return next;
    });
    // Announce the threshold crossing once, assertively (a11y plan). Reads
    // the pre-update value, which is what determines the crossing direction.
    const ae = study.aes[aeId];
    if (ae != null) {
      const nextAe = {...ae, ...patch};
      const wasSae = ae.grade >= 3 && ae.causality === 'related';
      const isSae = nextAe.grade >= 3 && nextAe.causality === 'related';
      if (isSae && !wasSae) {
        setAnnouncement(
          \`Serious adverse event workflow activated for participant \${ae.participantId}. Report due in 18 hours 22 minutes.\`,
        );
      } else if (!isSae && wasSae) {
        setAnnouncement(
          \`Serious adverse event workflow deactivated for participant \${ae.participantId}.\`,
        );
      }
    }
  }, [study.aes]);

  // ---- Selection ------------------------------------------------------------
  const selectParticipant = useCallback((pid: string) => {
    setSelectedParticipantId(pid);
    setSelectedCellId(null);
    setOverlayOpen(true);
  }, []);

  const selectCell = useCallback((cellId: string) => {
    setSelectedCellId(cellId);
    setSelectedParticipantId(cellId.split(':')[0]);
    setOverlayOpen(true);
  }, []);

  const queriesByCell = new Map<string, Query>();
  for (const id of study.queryOrder) {
    const query = study.queries[id];
    if (query != null) queriesByCell.set(query.cellId, query);
  }

  const toggleQuery = useCallback(
    (cellId: string) => {
      const query = Object.values(study.queries).find(q => q.cellId === cellId);
      if (query == null) return;
      setSelectedCellId(cellId);
      setSelectedParticipantId(cellId.split(':')[0]);
      setExpandedQueryId(prev => (prev === query.id ? null : query.id));
      setOverlayOpen(true);
    },
    [study.queries],
  );

  const closeOverlay = useCallback(() => {
    setOverlayOpen(false);
    // Restore focus to the triggering cell (or its rail row) on close.
    const key = selectedCellId ?? (selectedParticipantId != null ? \`rail:\${selectedParticipantId}\` : null);
    if (key != null) cellRefs.current.get(key)?.focus();
  }, [selectedCellId, selectedParticipantId]);

  // Escape layering: overlay aside first, then expanded query, then cell
  // selection. Shortcuts never fire while typing in an input.
  const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || isTypingTarget(event.target)) return;
    if (isNarrow && overlayOpen) {
      closeOverlay();
    } else if (expandedQueryId != null) {
      setExpandedQueryId(null);
    } else if (selectedCellId != null) {
      setSelectedCellId(null);
    }
  };

  // ---- Query lifecycle ------------------------------------------------------
  const replyQuery = useCallback((queryId: string, text: string) => {
    setStudy(prev => {
      const query = prev.queries[queryId];
      if (query == null) return prev;
      const message: QueryMessage = {
        author: PEOPLE.dana.name,
        role: 'CRA',
        timestamp: '28 Jun 2026 · 14:05',
        body: text,
      };
      return {
        ...prev,
        queries: {...prev.queries, [queryId]: {...query, messages: [...query.messages, message]}},
      };
    });
  }, []);

  const advanceQuery = useCallback(
    (queryId: string) => {
      const query = study.queries[queryId];
      if (query == null) return;
      if (query.state === 'open') {
        update('queries', queryId, {state: 'answered'});
      } else if (query.state === 'answered') {
        // Closing renders the re-verification row.
        update('queries', queryId, {
          state: 'closed',
          verifiedLine: 'Source verified by D. Okafor — 28 Jun 2026',
        });
      }
    },
    [study.queries, update],
  );

  const attachQuery = useCallback(
    (cellId: string) => {
      const id = \`Q-\${nextQueryNum}\`;
      setNextQueryNum(n => n + 1);
      setStudy(prev => {
        if (Object.values(prev.queries).some(q => q.cellId === cellId)) return prev;
        const newQuery: Query = {
          id,
          state: 'open',
          cellId,
          messages: [
            {
              author: PEOPLE.dana.name,
              role: 'CRA',
              timestamp: '28 Jun 2026 · 14:05',
              body: \`\${id}: Please verify the source documentation for \${cellId.replace(':', ' ')} against the EDC entry and confirm the visit date.\`,
            },
          ],
        };
        return {
          ...prev,
          queries: {...prev.queries, [id]: newQuery},
          queryOrder: [id, ...prev.queryOrder],
        };
      });
      setExpandedQueryId(id);
    },
    [nextQueryNum],
  );

  const saveAssessment = useCallback(
    (aeId: string) => update('aes', aeId, {lastAssessed: 'Assessment saved 28 Jun 2026 · D. Okafor'}),
    [update],
  );
  const submitSaeReport = useCallback(
    (aeId: string) => update('aes', aeId, {reportFiled: 'SAE report filed 28 Jun 2026 · 09:58'}),
    [update],
  );

  // ---- Derived aggregates (self-cross-checking: computed from the rows) -----
  const cellList = Object.values(study.cells);
  const completedInWindow = cellList.filter(c => c.status === 'in-window').length;
  const completedTotal =
    completedInWindow + cellList.filter(c => c.status === 'out-of-window').length;
  const complianceLine = \`Window compliance \${((completedInWindow / Math.max(completedTotal, 1)) * 100).toFixed(1)}% · \${completedInWindow}/\${completedTotal} in-window\`;
  const openQueryCount = Object.values(study.queries).filter(q => q.state === 'open').length;
  const participantList = PARTICIPANTS.map(p => study.participants[p.id]).filter(
    (p): p is Participant => p != null,
  );
  const screenFailCount = participantList.filter(p => p.status === 'screen-fail').length;
  // Site convention: "enrolled" counts consented participants incl. the
  // screen-fail, against the 30-participant site target.
  const railFooterLine = \`Enrolled \${participantList.length} / 30 · Screen-fail \${screenFailCount}\`;

  const owCountByParticipant = new Map<string, number>();
  for (const cell of cellList) {
    if (cell.status === 'out-of-window') {
      owCountByParticipant.set(
        cell.participantId,
        (owCountByParticipant.get(cell.participantId) ?? 0) + 1,
      );
    }
  }
  const sortedParticipants = [...participantList].sort((a, b) => {
    if (sortMode === 'id') return a.id.localeCompare(b.id);
    const rankA = a.safetySortRank ?? 1;
    const rankB = b.safetySortRank ?? 1;
    if (rankA !== rankB) return rankA - rankB;
    const owA = owCountByParticipant.get(a.id) ?? 0;
    const owB = owCountByParticipant.get(b.id) ?? 0;
    if (owA !== owB) return owB - owA;
    return a.id.localeCompare(b.id);
  });

  const selectedParticipant =
    selectedParticipantId != null ? (study.participants[selectedParticipantId] ?? null) : null;
  const selectedCell = selectedCellId != null ? (study.cells[selectedCellId] ?? null) : null;
  const selectedCellQuery =
    selectedCellId != null ? (queriesByCell.get(selectedCellId) ?? null) : null;
  const selectedAe =
    selectedParticipantId != null
      ? (Object.values(study.aes).find(ae => ae.participantId === selectedParticipantId) ?? null)
      : null;
  const participantQueries =
    selectedParticipantId != null
      ? study.queryOrder
          .map(id => study.queries[id])
          .filter((q): q is Query => q != null && q.cellId.startsWith(\`\${selectedParticipantId}:\`))
      : [];

  const site = SITES.find(s => s.id === siteId) ?? SITES[0];
  const siteOptions = SITES.map(s => ({value: s.id, label: isMid ? s.shortLabel : s.label}));
  const activeAeReport = Object.values(study.aes).find(
    ae => ae.grade >= 3 && ae.causality === 'related',
  );

  const asideVisible = !isNarrow || overlayOpen;
  const asideWidth = isMid || isNarrow ? 360 : 400;

  const toggleKind = (kind: VisitKind) =>
    setHiddenKinds(prev => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });

  return (
    <div style={styles.root} onKeyDown={handleRootKeyDown}>
      <style>{TSM_CSS}</style>
      <span aria-live="assertive" role="status" style={styles.visuallyHidden}>
        {announcement}
      </span>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div style={styles.headerBar}>
              {/* Top-left corner: Cohortiq mark + protocol/site switcher. */}
              <span style={styles.logoWrap}>
                <CohortiqMark />
              </span>
              <Text type="label" size="sm">
                Cohortiq
              </Text>
              <div style={{minWidth: 0, maxWidth: isMid ? 240 : 460}}>
                <Selector
                  label="Protocol and site"
                  isLabelHidden
                  size="sm"
                  options={siteOptions}
                  value={siteId}
                  onChange={setSiteId}
                />
              </div>
              <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                {PROTOCOL.phase} · {PROTOCOL.title} · PI {site.pi}
              </Text>
              <span style={{flex: 1}} aria-hidden />
              {/* Top-right corner: countdown chip (SAE cascade only) + sync
                  dot + monitor avatar. */}
              {study.saeActive ? (
                activeAeReport?.reportFiled != null ? (
                  <span style={styles.noShrink}>
                    <Token size="sm" color="green" label="SAE report filed" />
                  </span>
                ) : (
                  <CountdownChip value={SAE_COUNTDOWN_DISPLAY} />
                )
              ) : null}
              <span style={styles.noShrink}>
                <StatusDot variant="success" label="Sync status" />
              </span>
              <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                Verified 28 Jun
              </Text>
              <Avatar name={PEOPLE.dana.name} size="small" />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} style={styles.viewRoot}>
              <div style={styles.mainCol}>
                <div style={styles.toolbar}>
                  <div style={styles.segGroup} role="group" aria-label="Row sort">
                    {(['safety', 'id'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        className="tsm-focusable tsm-fade"
                        aria-pressed={sortMode === mode}
                        style={{...styles.segBtn, ...(sortMode === mode ? styles.segBtnActive : null)}}
                        onClick={() => setSortMode(mode)}>
                        {mode === 'safety' ? 'Safety' : 'ID'}
                      </button>
                    ))}
                  </div>
                  <HStack gap={1} vAlign="center">
                    {VISIT_KIND_CHIPS.map(chip => {
                      const isOff = hiddenKinds.has(chip.kind);
                      return (
                        <Tooltip key={chip.kind} content={\`\${chip.label} visits\`}>
                          <button
                            type="button"
                            className="tsm-focusable tsm-fade"
                            aria-pressed={!isOff}
                            aria-label={\`\${chip.label} visits \${isOff ? 'dimmed' : 'shown'}\`}
                            style={{
                              ...styles.queryChip,
                              height: 24,
                              fontFamily: 'inherit',
                              opacity: isOff ? 0.5 : 1,
                            }}
                            onClick={() => toggleKind(chip.kind)}>
                            <Icon icon={chip.icon} size="xsm" color="secondary" />
                            {/* Mid band drops chip text for glyphs. */}
                            {isMid ? null : chip.label}
                          </button>
                        </Tooltip>
                      );
                    })}
                  </HStack>
                  <button
                    type="button"
                    className="tsm-focusable tsm-fade"
                    aria-pressed={queryFilterOn}
                    style={{
                      ...styles.queryChip,
                      height: 24,
                      fontFamily: 'inherit',
                      ...(queryFilterOn
                        ? {borderColor: WARN, backgroundColor: WARN_SOFT}
                        : null),
                    }}
                    onClick={() => setQueryFilterOn(prev => !prev)}>
                    <Icon icon={CircleAlertIcon} size="xsm" color="secondary" />
                    {\`Open queries · \${openQueryCount}\`}
                  </button>
                  <span style={{flex: 1}} aria-hidden />
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers maxLines={1}>
                    {complianceLine}
                  </Text>
                </div>
                <MatrixScrollport>
                  <VisitWindowMatrix
                    participants={sortedParticipants}
                    cells={study.cells}
                    queriesByCell={queriesByCell}
                    selectedCellId={selectedCellId}
                    selectedParticipantId={selectedParticipantId}
                    geometry={geometry}
                    dimmedKinds={hiddenKinds}
                    queryFilterOn={queryFilterOn}
                    railFooterLine={railFooterLine}
                    onSelectCell={selectCell}
                    onSelectParticipant={selectParticipant}
                    onToggleQuery={toggleQuery}
                    cellRefs={cellRefs}
                  />
                </MatrixScrollport>
                <LegendStrip />
              </div>
              {asideVisible ? (
                <AsidePanel
                  width={asideWidth}
                  isOverlay={isNarrow}
                  participant={selectedParticipant}
                  cell={selectedCell}
                  cellQuery={selectedCellQuery}
                  ae={selectedAe}
                  participantQueries={participantQueries}
                  expandedQueryId={expandedQueryId}
                  onClose={closeOverlay}
                  onAeChange={handleAeChange}
                  onAttachQuery={attachQuery}
                  onExpandQuery={id => setExpandedQueryId(prev => (prev === id ? null : id))}
                  onReplyQuery={replyQuery}
                  onAdvanceQuery={advanceQuery}
                  onSaveAssessment={saveAssessment}
                  onSubmitSaeReport={submitSaeReport}
                />
              ) : null}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};