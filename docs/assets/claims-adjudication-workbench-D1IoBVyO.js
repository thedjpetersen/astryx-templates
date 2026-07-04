var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Veristra pended queue as examiner
 *   Dana Whitfield opens it: seven claims keyed by identity consts
 *   (CLAIMS.knee = 'CLM-2481-0093' is the focus claim — Rosalind Okafor at
 *   Lakeview Orthopedic Group, DOS '2026-06-11' as a literal string), every
 *   CPT line carrying dual money fields (billedCents: 31000 + billed:
 *   '$310.00', allowed under both fee schedules), CARC reason codes, ICD-10
 *   diagnosis pointers, and a per-claim deductible pool. No Date.now, no
 *   Math.random, no network assets — every amount on screen is either a
 *   fixture literal or the output of the pure \`adjudicateClaim\` pipeline.
 * @output Claims Adjudication Workbench — a payer-side health-plan claims
 *   examiner cockpit: a pended-claims inbox rail (7 claims · $9,384.50
 *   pended, the aggregate derives from the rows), a central CPT claim-lines
 *   table where every line carries a signed billed-to-paid EOB money
 *   waterfall (contractual CO-45 → deductible PR-1 → coinsurance PR-2 →
 *   copay PR-3 → plan paid), and a 400px adjudication aside with the
 *   member-responsibility card and a five-rule trace ladder
 *   (ELIG-001 → PA-014 → FEE-208 → COB-031 → SHARE-050) that shows each
 *   rule mutating the running allowed amount. The signature what-if:
 *   dragging a line's waterfall handle (a real role="slider") re-runs the
 *   pipeline — segments re-proportion, the deductible pool cascades into
 *   sibling rows, the sticky footer re-sums, the member card moves, exactly
 *   the re-fired ladder rungs pulse, and causality reaches the far-left
 *   rail row total and the bottom-left rail aggregate.
 * @position Page template; emitted by \`astryx template
 *   claims-adjudication-workbench\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header bar 46px (brand + breadcrumb | fee-schedule select, Pend,
 *   Approve, examiner avatar)
 *   | view root (flex row, height 100%, minHeight 0, overflow hidden)
 *     = 280px claim-inbox rail (own overflowY, 36px rows, 32px footer)
 *     + main column (40px filter row → scrollable claim-lines region:
 *       32px diagnosis strip, 28px column-header row, CPTLineRow stack →
 *       52px sticky claim-total footer)
 *     + 400px aside (own overflowY: MemberResponsibilityCard,
 *       RuleTraceLadder, 32px footer).
 * Container policy: dense tool surface — frame rows, rails, and panels
 *   only; no Cards. Line rows, ladder rungs, and rail rows are styled divs
 *   on the content surface; DS handles buttons, select, segmented control,
 *   tooltip, avatar, and focus plumbing.
 * Color policy: token-pure chrome. ONE quarantined brand literal (Veristra
 *   indigo #5850EC as a light-dark pair, runtime value only) — brand FILL
 *   (mark, plan-paid segment, handle, pulse wash) and brand TEXT (DX
 *   superscripts) are different values; BRAND_TEXT #4F48D6 on white ≈ 6.0:1
 *   and #A9A4F8 on #1E1E1E ≈ 7.3:1, both past 4.5:1. Data-viz segments use
 *   \`var(--color-data-categorical-X, light-dark(...))\` with repo-standard
 *   fallbacks. Transitions animate background-color/outline only and
 *   collapse under prefers-reduced-motion (pulse and DX flash fall back to
 *   a static 1px brand outline).
 *
 * Density grid (FIXED, verbatim): header bar 46px; claim-inbox rail 280px
 * wide, rail rows 36px; claim-line rows 44px collapsed / 108px expanded
 * (selected line reveals full labeled waterfall); filter row 40px;
 * claim-total footer 52px sticky; adjudication aside 400px; rule-ladder
 * rungs 56px; member-responsibility card rows 28px; one gutter token
 * GUTTER = 12px used for all horizontal padding; mini waterfall bar 12px
 * tall, full waterfall bar 20px tall; chips 18px tall; brand mark 20px.
 *
 * Corner map: top-left ShieldLedgerMark + Veristra wordmark + claim-ID
 * breadcrumb; top-right fee-schedule select + Pend + Approve + examiner
 * avatar 'DW'; bottom-left 32px rail footer '7 claims · $9,384.50 pended'
 * (cross-checks the rail rows); bottom-right 32px aside footer
 * 'Adjudicated deterministically · engine v3.2' + trace rule count.
 * Corners keep their owners at every breakpoint until their region is
 * subtracted.
 *
 * Responsive contract — subtraction only, no reflow:
 * - >= 1440px: full layout (280 rail + fluid main + 400 aside).
 * - < 1360px: inbox rail collapses to a 56px icon rail (status dot +
 *   last-4 of claim ID; a tooltip carries the rest). Nothing moves.
 * - < 1200px: CPTLineRow drops the description column and the trailing
 *   compact-waterfall column (the expanded row still shows the full
 *   waterfall); the footer is unchanged.
 * - < 1080px: the aside is removed entirely — rule trace and member card
 *   are simply gone; the main column keeps identical geometry.
 *
 * Keyboard/a11y: the waterfall handle is role="slider" (aria-valuemin 0,
 * aria-valuemax billedCents, aria-valuetext '$412.00 allowed'; ArrowLeft/
 * Right ±100 cents, Shift ±1000, Home/End to $0/billed). The rail is a
 * listbox with aria-activedescendant; the claim-lines region is
 * role="table" with real column headers; the ladder is an <ol>. Escape in
 * an expanded row collapses it and restores focus to the row's CPT
 * button. One polite live region announces the post-scrub summary. All
 * shortcuts are element-scoped (no document listeners), so typing targets
 * are never shadowed.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import {
  ChevronRightIcon,
  CircleCheckIcon,
  DiamondIcon,
  OctagonXIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings and the reduced-motion guards for the ladder pulse
// and the DX cross-flash.
// ---------------------------------------------------------------------------

const WORKBENCH_CSS = \`
.caw-focus:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}
.caw-rung, .caw-dxchip {
  transition: background-color 300ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .caw-rung, .caw-dxchip {
    transition: none;
  }
}
\`;

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark
// pair (dark side shifted to the lighter 300–400-weight hue).
// ---------------------------------------------------------------------------

// The ONE quarantined Veristra brand literal (#5850EC), runtime value only:
// mark fill, plan-paid segment, drag handle, pulse wash.
const BRAND = 'light-dark(#5850EC, #8B85F4)';
// Brand TEXT is a separate, darker value: #4F48D6 on white ≈ 6.0:1;
// #A9A4F8 on #1E1E1E ≈ 7.3:1 — both clear 4.5:1 at 10px/600.
const BRAND_TEXT = 'light-dark(#4F48D6, #A9A4F8)';
const BRAND_WASH = 'light-dark(rgba(88, 80, 236, 0.12), rgba(139, 133, 244, 0.2))';
// Waterfall member-share segments — data-viz categorical tokens with the
// repo-standard fallback pairs.
const SEG_DEDUCTIBLE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const SEG_COINSURANCE = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
const SEG_COPAY = 'var(--color-data-categorical-orange, light-dark(#D96C0B, #F5A353))';
const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const AMBER = 'var(--color-data-categorical-orange, light-dark(#D96C0B, #F5A353))';
const RED = 'light-dark(#DC2626, #F87171)';
const RED_SOFT = 'light-dark(rgba(220, 38, 38, 0.1), rgba(248, 113, 113, 0.16))';
// Contractual-adjustment hatch (CO-45): neutral 45° stripes, both grays.
const HATCH_A = 'light-dark(#C9CDD4, #4A4F58)';
const HATCH_B = 'light-dark(#E6E8EC, #33373E)';
const INFO_SOFT = 'light-dark(rgba(1, 113, 227, 0.1), rgba(76, 158, 255, 0.16))';
// Info-chip text: #075CB4 on white ≈ 6.9:1; #7DB8FF on #1E1E1E ≈ 8.6:1.
const INFO_TEXT = 'light-dark(#075CB4, #7DB8FF)';
// Danger-chip text: #B91C1C on white ≈ 6.3:1; #FCA5A5 on #1E1E1E ≈ 9.0:1.
const RED_TEXT = 'light-dark(#B91C1C, #FCA5A5)';

const MONO = 'var(--font-family-code, monospace)';

// ONE gutter token — all horizontal padding on this page is GUTTER px.
const GUTTER = 12;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // 46px header bar.
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: 46,
    paddingInline: GUTTER,
  },
  wordmark: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap'},
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    whiteSpace: 'nowrap',
  },
  mono12: {fontFamily: MONO, fontSize: 12, fontVariantNumeric: 'tabular-nums'},
  mono13: {fontFamily: MONO, fontSize: 13, fontVariantNumeric: 'tabular-nums'},
  // View root: rail + main + aside, each with its own scroll.
  viewRoot: {
    display: 'flex',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  // 280px claim-inbox rail (56px icon rail < 1360px).
  rail: {
    display: 'flex',
    flexDirection: 'column',
    width: 280,
    flexShrink: 0,
    minHeight: 0,
    borderInlineEnd: 'var(--border-width) solid var(--color-border)',
  },
  railIcon: {width: 56},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  railRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingInline: GUTTER,
    cursor: 'pointer',
    border: 0,
    width: '100%',
    textAlign: 'start',
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
  },
  railRowSelected: {backgroundColor: 'var(--color-background-muted)'},
  // Stress fixture (1): the 62-char Consolidated Multispecialty LLP name
  // exists to exercise this single-line 12px ellipsis.
  railMiddle: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 12,
  },
  railTotal: {
    fontFamily: MONO,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Bottom-left corner owner: 32px rail footer aggregate.
  railFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 32,
    flexShrink: 0,
    paddingInline: GUTTER,
    borderBlockStart: 'var(--border-width) solid var(--color-border)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  railEmpty: {padding: GUTTER},
  // Main column.
  main: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  // 40px filter row.
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: 40,
    flexShrink: 0,
    paddingInline: GUTTER,
    borderBlockEnd: 'var(--border-width) solid var(--color-border)',
  },
  // Filter-row meta segment ("N lines · DOS · provider") — a shrinking flex
  // child. A tight main column drops whole trailing SEGMENTS (see metaTier,
  // measured on the row via ResizeObserver) rather than mid-string
  // ellipsizing; the nowrap + ellipsis here is only a last-resort guard so
  // the meta never wraps over the SegmentedControl and the DX strip below.
  filterMeta: {
    minWidth: 0,
    flexShrink: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  linesScroll: {flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative'},
  // 32px diagnosis strip.
  dxStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 32,
    paddingInline: GUTTER,
    borderBlockEnd: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  dxChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 18,
    paddingInline: 6,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 11,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  dxChipFlash: {backgroundColor: BRAND_WASH, boxShadow: \`inset 0 0 0 1px \${BRAND}\`},
  dxLetter: {fontWeight: 700, color: BRAND_TEXT},
  // Claim-lines "table": 28px header row + 44px rows on one shared grid.
  lineGrid: {
    display: 'grid',
    // Description is minmax(120px, 1fr): the low minimum keeps the cell's
    // own right edge (and therefore its ellipsis) inside the container even
    // when the fixed tracks overflow a tight main column.
    gridTemplateColumns:
      '12px 64px 96px minmax(120px, 1fr) 48px 40px 88px 88px 88px 140px',
    columnGap: GUTTER,
    alignItems: 'center',
    paddingInline: GUTTER,
  },
  // < 1200px: the description and compact-waterfall columns are subtracted.
  lineGridNarrow: {
    gridTemplateColumns: '12px 64px 96px 48px 40px 88px 88px 88px',
  },
  colHeaderRow: {
    height: 28,
    position: 'sticky',
    insetBlockStart: 0,
    zIndex: 2,
    backgroundColor: 'var(--color-background-body)',
    borderBlockEnd: 'var(--border-width) solid var(--color-border)',
  },
  colHeaderCell: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  lineRow: {
    minHeight: 44,
    borderBlockEnd: 'var(--border-width) solid var(--color-border)',
    cursor: 'pointer',
  },
  lineRowSelected: {backgroundColor: 'var(--color-background-muted)'},
  numCell: {textAlign: 'end', whiteSpace: 'nowrap'},
  statusDotButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 12,
    height: 28, // >= 28px hit box despite the 12px glyph
    padding: 0,
    border: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  lineDot: {width: 8, height: 8, borderRadius: 999, display: 'inline-block'},
  cptButton: {
    fontFamily: MONO,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    padding: 0,
    minHeight: 28,
    border: 0,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    cursor: 'pointer',
    textAlign: 'start',
  },
  modCell: {display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden'},
  // 18px-tall, 2px-radius modifier chip. Stress fixture (4): line 97140 on
  // CLM-2481-0112 carries -25, -59, -XS to force the '+1' overflow chip.
  modChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 18,
    paddingInline: 5,
    borderRadius: 2,
    backgroundColor: 'var(--color-background-muted)',
    fontFamily: MONO,
    fontSize: 10,
    whiteSpace: 'nowrap',
  },
  descCell: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 13,
  },
  dxPointerCell: {display: 'flex', alignItems: 'center', gap: 2},
  dxPointerButton: {
    fontSize: 10,
    fontWeight: 600,
    color: BRAND_TEXT,
    padding: '0 2px',
    minHeight: 28, // padded hit box
    border: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    verticalAlign: 'super',
  },
  // Expanded row body — hosts the full labeled waterfall; 44 + 64 = 108px.
  expandedBody: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minHeight: 64,
    paddingBlock: 8,
    paddingInlineStart: 64 + GUTTER + 12,
    paddingInlineEnd: GUTTER,
  },
  // Waterfall geometry: 20px full bar / 12px compact bar, 1px gaps.
  waterfall: {
    position: 'relative',
    display: 'flex',
    gap: 1,
    height: 20,
    width: '100%',
    minWidth: 480,
    borderRadius: 4,
  },
  waterfallCompact: {height: 12, minWidth: 0, width: 140},
  segment: {height: '100%', minWidth: 3, borderRadius: 2},
  segLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: 16,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  segLabel: {display: 'inline-flex', alignItems: 'center', gap: 4},
  segAmount: {
    fontFamily: MONO,
    fontSize: 10,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  // 8px × 28px drag grip straddling the contractual/allowed boundary.
  handle: {
    position: 'absolute',
    insetBlockStart: -4,
    width: 8,
    height: 28,
    transform: 'translateX(-50%)',
    borderRadius: 3,
    backgroundColor: BRAND,
    cursor: 'ew-resize',
    touchAction: 'none',
    zIndex: 1,
  },
  reasonChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 18,
    paddingInline: 6,
    borderRadius: 4,
    fontFamily: MONO,
    fontSize: 10,
    whiteSpace: 'nowrap',
  },
  pendNote: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: \`4px \${GUTTER}px\`,
    borderRadius: 'var(--radius-container)',
    backgroundColor: RED_SOFT,
    alignSelf: 'flex-start',
  },
  // 52px sticky claim-total footer.
  totalsFooter: {
    position: 'sticky',
    insetBlockEnd: 0,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER * 2,
    height: 52,
    paddingInline: GUTTER,
    backgroundColor: 'var(--color-background-body)',
    borderBlockStart: 'var(--border-width) solid var(--color-border)',
  },
  totalCell: {display: 'flex', flexDirection: 'column', gap: 0},
  totalLabel: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // 400px adjudication aside.
  aside: {
    display: 'flex',
    flexDirection: 'column',
    width: 400,
    flexShrink: 0,
    minHeight: 0,
    borderInlineStart: 'var(--border-width) solid var(--color-border)',
  },
  asideScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: GUTTER,
    display: 'flex',
    flexDirection: 'column',
    gap: GUTTER,
  },
  // Bottom-right corner owner: 32px aside footer.
  asideFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 32,
    flexShrink: 0,
    paddingInline: GUTTER,
    borderBlockStart: 'var(--border-width) solid var(--color-border)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  // Member-responsibility card: 28px rows, 34px total row.
  memberCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: GUTTER,
  },
  memberHeader: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
  },
  memberRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
  },
  memberTotalRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 34,
  },
  memberTotalValue: {
    fontFamily: MONO,
    fontSize: 15,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  // Rule-trace ladder: <ol>, 56px rungs, 2px left rail, 10px outcome nodes.
  ladder: {listStyle: 'none', margin: 0, padding: 0, position: 'relative'},
  // Inset by half a rung height (28px) at both ends so the spine starts at
  // the FIRST rung icon's center and ends at the LAST rung icon's center —
  // no overshoot into the "Rule trace" heading above or past the last node.
  ladderRail: {
    position: 'absolute',
    insetBlockStart: 28,
    insetBlockEnd: 28,
    insetInlineStart: 4,
    width: 2,
    backgroundColor: 'var(--color-border)',
  },
  rung: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: 56,
    paddingInlineStart: 20,
    borderRadius: 'var(--radius-container)',
  },
  rungNode: {
    position: 'absolute',
    insetInlineStart: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 10,
    height: 10,
  },
  rungBody: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  rungTitleRow: {display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0},
  rungName: {fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap'},
  rungCode: {
    fontFamily: MONO,
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  rungAmounts: {
    display: 'flex',
    alignItems: 'baseline',
    gap: GUTTER,
    fontFamily: MONO,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  rungDelta: {marginInlineStart: 'auto', color: 'var(--color-text-secondary)'},
  rungMuted: {opacity: 0.55},
  strike: {textDecoration: 'line-through'},
  // 20px ShieldLedgerMark.
  mark: {display: 'inline-flex', flexShrink: 0},
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
// DOMAIN META TABLES — app-wide vocabularies for CARC codes, line status,
// claim status, and rule outcomes.
// ---------------------------------------------------------------------------

type CarcCode = 'CO-45' | 'PR-1' | 'PR-2' | 'PR-3' | 'CO-197' | 'OA-23';
type CarcTone = 'neutral' | 'info' | 'danger';

const CARC_META: Record<CarcCode, {label: string; sentence: string; tone: CarcTone}> = {
  'CO-45': {
    label: 'Exceeds fee schedule',
    sentence:
      'CO-45 — Charge exceeds fee schedule/maximum allowable; contractual obligation, provider may not bill the member.',
    tone: 'neutral',
  },
  'PR-1': {
    label: 'Deductible',
    sentence: 'PR-1 — Amount applied to the member deductible; patient responsibility.',
    tone: 'info',
  },
  'PR-2': {
    label: 'Coinsurance',
    sentence: 'PR-2 — Coinsurance amount; patient responsibility.',
    tone: 'info',
  },
  'PR-3': {
    label: 'Copay',
    sentence: 'PR-3 — Copayment amount; patient responsibility.',
    tone: 'info',
  },
  'CO-197': {
    label: 'Prior auth absent',
    sentence:
      'CO-197 — Precertification/authorization absent; service denied, provider liability.',
    tone: 'danger',
  },
  'OA-23': {
    label: 'Prior payer adjudicated',
    sentence:
      'OA-23 — Impact of prior payer adjudication, including payments and/or adjustments.',
    tone: 'neutral',
  },
};

type LineStatus = 'paid' | 'modified' | 'denied';

const LINE_STATUS_META: Record<LineStatus, {label: string; color: string}> = {
  paid: {label: 'Priced from fee schedule', color: OK_GREEN},
  modified: {label: 'Examiner override applied', color: AMBER},
  denied: {label: 'Denied', color: RED},
};

type ClaimStatus = 'pended' | 'denied' | 'approved';

const CLAIM_STATUS_META: Record<
  ClaimStatus,
  {label: string; dot: 'warning' | 'error' | 'success'; token: 'orange' | 'red' | 'green'}
> = {
  pended: {label: 'Pended', dot: 'warning', token: 'orange'},
  denied: {label: 'Denied', dot: 'error', token: 'red'},
  approved: {label: 'Approved', dot: 'success', token: 'green'},
};

type RuleOutcome = 'pass' | 'modify' | 'deny';

const RULE_OUTCOME_META: Record<
  RuleOutcome,
  {icon: typeof CircleCheckIcon; color: string; label: string}
> = {
  pass: {icon: CircleCheckIcon, color: OK_GREEN, label: 'Passed'},
  modify: {icon: DiamondIcon, color: AMBER, label: 'Modified amount'},
  deny: {icon: OctagonXIcon, color: RED, label: 'Denied'},
};

type FeeSchedule = 'standard' | 'medicare110';

const FEE_SCHEDULE_OPTIONS = [
  {value: 'standard', label: 'Standard PPO'},
  {value: 'medicare110', label: '2026 Medicare 110%'},
];

// ---------------------------------------------------------------------------
// FIXTURES — deterministic BY LAW. Identity consts; dual fields everywhere
// (billedCents + billed display); DOS is a literal string. Cross-checks:
// sum(line segments) === line billedCents (by construction in the engine);
// footer sums === sum of lines (derived); rail claim total === footer
// allowed total (same pipeline); rail footer aggregate === sum of pended
// claims' allowed totals: 107040 + 23350 + 110200 + 65600 + 632260
// = 938450 cents = $9,384.50.
// ---------------------------------------------------------------------------

interface Member {
  id: string;
  name: string;
  surname: string;
  plan: string;
}

const MEMBERS = {
  rosalind: {id: 'M-58821', name: 'Rosalind Okafor', surname: 'Okafor', plan: 'PPO Silver 2500'},
  tanaka: {id: 'M-61247', name: 'Yuki Tanaka', surname: 'Tanaka', plan: 'PPO Gold 1000'},
  mercer: {id: 'M-60912', name: 'Alden Mercer', surname: 'Mercer', plan: 'PPO Silver 2500'},
  delgado: {id: 'M-59480', name: 'Ines Delgado', surname: 'Delgado', plan: 'PPO Bronze 6000'},
  whitcomb: {id: 'M-57733', name: 'Harold Whitcomb', surname: 'Whitcomb', plan: 'PPO Silver 2500'},
  osei: {id: 'M-62018', name: 'Abena Osei', surname: 'Osei', plan: 'PPO Gold 1000'},
  navarro: {id: 'M-63155', name: 'Luz Navarro', surname: 'Navarro', plan: 'PPO Silver 2500'},
} satisfies Record<string, Member>;

interface Provider {
  id: string;
  name: string;
}

const PROVIDERS = {
  lakeview: {id: 'P-1104', name: 'Lakeview Orthopedic Group'},
  // Stress fixture (1): 62+ chars — proves the 12px rail ellipsis.
  consolidated: {
    id: 'P-2290',
    name: 'Consolidated Multispecialty Physicians of Greater Cincinnati, LLP',
  },
} satisfies Record<string, Provider>;

const EXAMINER = {name: 'Dana Whitfield', initials: 'DW'};

interface DxEntry {
  letter: string;
  code: string;
  label: string;
}

interface LineFixture {
  id: string;
  cpt: string;
  modifiers: string[];
  description: string;
  dx: string[]; // diagnosis-pointer letters into the claim's DX strip
  units: number;
  perUnit?: string; // display-only per-unit price (units > 1)
  billedCents: number;
  billed: string;
  allowedStdCents: number;
  allowedStd: string;
  allowedMedCents: number;
  allowedMed: string;
  isPreventive?: boolean; // plan pays 100% of allowed
  hasCopay?: boolean; // flat copay instead of deductible/coinsurance
  isDenied?: boolean; // PA-014 denies with CO-197
  pendNote?: string;
}

interface ClaimFixture {
  id: string;
  member: Member;
  provider: Provider;
  dos: string; // literal string, never clock math
  initialStatus: ClaimStatus;
  deductibleRemainingCents: number;
  copayCents: number;
  coinsuranceRate: number;
  dx: DxEntry[];
  lines: LineFixture[];
}

// Seven claims keyed by identity consts. Focus claim: CLAIMS.knee.
const CLAIMS = {
  knee: 'CLM-2481-0093',
  preventive: 'CLM-2481-0107',
  lumbar: 'CLM-2481-0112',
  slap: 'CLM-2481-0121',
  epidural: 'CLM-2481-0128',
  therapy: 'CLM-2481-0134',
  cuff: 'CLM-2481-0141',
} as const;

const CLAIM_LIST: ClaimFixture[] = [
  {
    // Focus claim — billed total 518600 = $5,186.00; allowed (std) 107040.
    id: CLAIMS.knee,
    member: MEMBERS.rosalind,
    provider: PROVIDERS.lakeview,
    dos: '2026-06-11',
    initialStatus: 'pended',
    deductibleRemainingCents: 65000, // $650.00 left of the $2,500 deductible
    copayCents: 3000,
    coinsuranceRate: 0.2,
    dx: [
      {letter: 'A', code: 'M17.11', label: 'Unilateral primary osteoarthritis, right knee'},
      {letter: 'B', code: 'M25.561', label: 'Pain in right knee'},
      {letter: 'C', code: 'Z79.899', label: 'Long-term drug therapy'},
    ],
    lines: [
      {
        id: 'ln-0093-99214',
        cpt: '99214',
        modifiers: ['-25'],
        description: 'Office visit, established patient, level 4 — significant separate E/M',
        dx: ['A', 'B'],
        units: 1,
        billedCents: 31000,
        billed: '$310.00',
        allowedStdCents: 18240,
        allowedStd: '$182.40',
        allowedMedCents: 16280,
        allowedMed: '$162.80',
        hasCopay: true,
      },
      {
        id: 'ln-0093-20610',
        cpt: '20610',
        modifiers: [],
        description: 'Arthrocentesis, major joint, without ultrasound guidance',
        dx: ['A'],
        units: 1,
        billedCents: 41200,
        billed: '$412.00',
        allowedStdCents: 29800,
        allowedStd: '$298.00',
        allowedMedCents: 26400,
        allowedMed: '$264.00',
      },
      {
        // Stress fixture (5): units 4 — per-unit math shown in the expanded
        // row proves units multiply into billedCents (4 × $310.00).
        id: 'ln-0093-j7325',
        cpt: 'J7325',
        modifiers: [],
        description: 'Hyaluronan (Synvisc-One), intra-articular injection, 1 mg',
        dx: ['A', 'C'],
        units: 4,
        perUnit: '$310.00',
        billedCents: 124000,
        billed: '$1,240.00',
        allowedStdCents: 41200,
        allowedStd: '$412.00',
        allowedMedCents: 38900,
        allowedMed: '$389.00',
      },
      {
        id: 'ln-0093-73562',
        cpt: '73562',
        modifiers: [],
        description: 'X-ray, knee, 3 views',
        dx: ['A', 'B'],
        units: 1,
        billedCents: 18600,
        billed: '$186.00',
        allowedStdCents: 9200,
        allowedStd: '$92.00',
        allowedMedCents: 7810,
        allowedMed: '$78.10',
      },
      {
        id: 'ln-0093-97110',
        cpt: '97110',
        modifiers: [],
        description: 'Therapeutic exercise, 15 minutes',
        dx: ['B'],
        units: 2,
        perUnit: '$74.00',
        billedCents: 14800,
        billed: '$148.00',
        allowedStdCents: 8600,
        allowedStd: '$86.00',
        allowedMedCents: 7040,
        allowedMed: '$70.40',
      },
      {
        // Stress fixture (2): denied line — full-width CO-197 denial
        // segment, disabled handle, deny node at rung 2 with later rungs
        // strike-muted at $0.
        id: 'ln-0093-29881',
        cpt: '29881',
        modifiers: [],
        description: 'Knee arthroscopy with meniscectomy, medial OR lateral',
        dx: ['A'],
        units: 1,
        billedCents: 289000,
        billed: '$2,890.00',
        allowedStdCents: 0,
        allowedStd: '$0.00',
        allowedMedCents: 0,
        allowedMed: '$0.00',
        isDenied: true,
        pendNote:
          'PA on file for 29880 only; confirm laterality before release. — D. Whitfield',
      },
    ],
  },
  {
    // Stress fixture (3): preventive claim — 99396 plan pays 100%; PR
    // segments correctly omitted, member-owes renders '$0.00'.
    // Allowed (std) total 21100 + 800 + 1450 = 23350.
    id: CLAIMS.preventive,
    member: MEMBERS.tanaka,
    provider: PROVIDERS.lakeview,
    dos: '2026-06-18',
    initialStatus: 'pended',
    deductibleRemainingCents: 0,
    copayCents: 3000,
    coinsuranceRate: 0.2,
    dx: [
      {letter: 'A', code: 'Z00.00', label: 'General adult medical examination'},
      {letter: 'B', code: 'Z13.220', label: 'Screening for lipoid disorders'},
    ],
    lines: [
      {
        id: 'ln-0107-99396',
        cpt: '99396',
        modifiers: [],
        description: 'Preventive visit, established patient, 40–64 years',
        dx: ['A'],
        units: 1,
        billedCents: 26400,
        billed: '$264.00',
        allowedStdCents: 21100,
        allowedStd: '$211.00',
        allowedMedCents: 19200,
        allowedMed: '$192.00',
        isPreventive: true,
      },
      {
        id: 'ln-0107-36415',
        cpt: '36415',
        modifiers: [],
        description: 'Collection of venous blood by venipuncture',
        dx: ['B'],
        units: 1,
        billedCents: 1800,
        billed: '$18.00',
        allowedStdCents: 800,
        allowedStd: '$8.00',
        allowedMedCents: 660,
        allowedMed: '$6.60',
        isPreventive: true,
      },
      {
        id: 'ln-0107-85025',
        cpt: '85025',
        modifiers: [],
        description: 'Complete blood count, automated, with differential',
        dx: ['B'],
        units: 1,
        billedCents: 3200,
        billed: '$32.00',
        allowedStdCents: 1450,
        allowedStd: '$14.50',
        allowedMedCents: 1300,
        allowedMed: '$13.00',
        isPreventive: true,
      },
    ],
  },
  {
    // The Consolidated LLP rail-ellipsis claim; carries the modifier
    // overflow line. Allowed (std) total 30200 + 5400 + 74600 = 110200.
    id: CLAIMS.lumbar,
    member: MEMBERS.mercer,
    provider: PROVIDERS.consolidated,
    dos: '2026-06-15',
    initialStatus: 'pended',
    deductibleRemainingCents: 40000,
    copayCents: 3000,
    coinsuranceRate: 0.2,
    dx: [
      {letter: 'A', code: 'M54.50', label: 'Low back pain, unspecified'},
      {letter: 'B', code: 'M51.26', label: 'Intervertebral disc displacement, lumbar'},
    ],
    lines: [
      {
        id: 'ln-0112-99204',
        cpt: '99204',
        modifiers: [],
        description: 'Office visit, new patient, level 4',
        dx: ['A'],
        units: 1,
        billedCents: 45000,
        billed: '$450.00',
        allowedStdCents: 30200,
        allowedStd: '$302.00',
        allowedMedCents: 27400,
        allowedMed: '$274.00',
        hasCopay: true,
      },
      {
        // Stress fixture (4): three modifiers → two chips + '+1' overflow.
        id: 'ln-0112-97140',
        cpt: '97140',
        modifiers: ['-25', '-59', '-XS'],
        description: 'Manual therapy techniques, 15 minutes',
        dx: ['A', 'B'],
        units: 1,
        billedCents: 9800,
        billed: '$98.00',
        allowedStdCents: 5400,
        allowedStd: '$54.00',
        allowedMedCents: 4620,
        allowedMed: '$46.20',
      },
      {
        id: 'ln-0112-72148',
        cpt: '72148',
        modifiers: [],
        description: 'MRI, lumbar spine, without contrast',
        dx: ['B'],
        units: 1,
        billedCents: 128000,
        billed: '$1,280.00',
        allowedStdCents: 74600,
        allowedStd: '$746.00',
        allowedMedCents: 68300,
        allowedMed: '$683.00',
      },
    ],
  },
  {
    id: CLAIMS.slap,
    member: MEMBERS.delgado,
    provider: PROVIDERS.lakeview,
    dos: '2026-06-09',
    initialStatus: 'denied',
    deductibleRemainingCents: 220000,
    copayCents: 3000,
    coinsuranceRate: 0.3,
    dx: [{letter: 'A', code: 'S43.431A', label: 'Superior glenoid labrum lesion, right'}],
    lines: [
      {
        id: 'ln-0121-29807',
        cpt: '29807',
        modifiers: [],
        description: 'Shoulder arthroscopy, repair of SLAP lesion',
        dx: ['A'],
        units: 1,
        billedCents: 176000,
        billed: '$1,760.00',
        allowedStdCents: 0,
        allowedStd: '$0.00',
        allowedMedCents: 0,
        allowedMed: '$0.00',
        isDenied: true,
      },
    ],
  },
  {
    // Deductible met — coinsurance-only claim.
    // Allowed (std) total 51200 + 11800 + 2600 = 65600.
    id: CLAIMS.epidural,
    member: MEMBERS.whitcomb,
    provider: PROVIDERS.consolidated,
    dos: '2026-06-20',
    initialStatus: 'pended',
    deductibleRemainingCents: 0,
    copayCents: 3000,
    coinsuranceRate: 0.2,
    dx: [{letter: 'A', code: 'M54.16', label: 'Radiculopathy, lumbar region'}],
    lines: [
      {
        id: 'ln-0128-64483',
        cpt: '64483',
        modifiers: [],
        description: 'Transforaminal epidural injection, lumbar, single level',
        dx: ['A'],
        units: 1,
        billedCents: 92000,
        billed: '$920.00',
        allowedStdCents: 51200,
        allowedStd: '$512.00',
        allowedMedCents: 44700,
        allowedMed: '$447.00',
      },
      {
        id: 'ln-0128-77003',
        cpt: '77003',
        modifiers: [],
        description: 'Fluoroscopic guidance for spinal injection',
        dx: ['A'],
        units: 1,
        billedCents: 21000,
        billed: '$210.00',
        allowedStdCents: 11800,
        allowedStd: '$118.00',
        allowedMedCents: 10400,
        allowedMed: '$104.00',
      },
      {
        id: 'ln-0128-j1030',
        cpt: 'J1030',
        modifiers: [],
        description: 'Methylprednisolone acetate, 40 mg',
        dx: ['A'],
        units: 1,
        billedCents: 4400,
        billed: '$44.00',
        allowedStdCents: 2600,
        allowedStd: '$26.00',
        allowedMedCents: 2200,
        allowedMed: '$22.00',
      },
    ],
  },
  {
    id: CLAIMS.therapy,
    member: MEMBERS.osei,
    provider: PROVIDERS.lakeview,
    dos: '2026-06-04',
    initialStatus: 'denied',
    deductibleRemainingCents: 0,
    copayCents: 3000,
    coinsuranceRate: 0.2,
    dx: [{letter: 'A', code: 'M62.81', label: 'Muscle weakness, generalized'}],
    lines: [
      {
        id: 'ln-0134-97110',
        cpt: '97110',
        modifiers: [],
        description: 'Therapeutic exercise — visits beyond authorized limit',
        dx: ['A'],
        units: 6,
        perUnit: '$74.00',
        billedCents: 44400,
        billed: '$444.00',
        allowedStdCents: 0,
        allowedStd: '$0.00',
        allowedMedCents: 0,
        allowedMed: '$0.00',
        isDenied: true,
      },
    ],
  },
  {
    // The big surgical claim keeps the pended aggregate honest.
    // Allowed (std) total 512260 + 96000 + 24000 = 632260.
    id: CLAIMS.cuff,
    member: MEMBERS.navarro,
    provider: PROVIDERS.consolidated,
    dos: '2026-06-23',
    initialStatus: 'pended',
    deductibleRemainingCents: 120000,
    copayCents: 3000,
    coinsuranceRate: 0.2,
    dx: [
      {letter: 'A', code: 'M75.121', label: 'Complete rotator cuff tear, right, traumatic'},
      {letter: 'B', code: 'M75.51', label: 'Bursitis of right shoulder'},
    ],
    lines: [
      {
        id: 'ln-0141-29827',
        cpt: '29827',
        modifiers: [],
        description: 'Shoulder arthroscopy with rotator cuff repair',
        dx: ['A'],
        units: 1,
        billedCents: 980000,
        billed: '$9,800.00',
        allowedStdCents: 512260,
        allowedStd: '$5,122.60',
        allowedMedCents: 448800,
        allowedMed: '$4,488.00',
      },
      {
        id: 'ln-0141-29826',
        cpt: '29826',
        modifiers: ['-51'],
        description: 'Shoulder arthroscopy, subacromial decompression',
        dx: ['A', 'B'],
        units: 1,
        billedCents: 210000,
        billed: '$2,100.00',
        allowedStdCents: 96000,
        allowedStd: '$960.00',
        allowedMedCents: 84200,
        allowedMed: '$842.00',
      },
      {
        id: 'ln-0141-73030',
        cpt: '73030',
        modifiers: ['-26'],
        description: 'X-ray, shoulder, 2+ views — professional component',
        dx: ['A'],
        units: 1,
        billedCents: 52000,
        billed: '$520.00',
        allowedStdCents: 24000,
        allowedStd: '$240.00',
        allowedMedCents: 21000,
        allowedMed: '$210.00',
      },
    ],
  },
];

const CLAIM_BY_ID = new Map(CLAIM_LIST.map(claim => [claim.id, claim]));
// lineId → owning claimId, so update(lineId, patch) can address lines.
const LINE_OWNER = new Map<string, string>(
  CLAIM_LIST.flatMap(claim => claim.lines.map(line => [line.id, claim.id] as const)),
);
const FIRST_LINE = new Map(CLAIM_LIST.map(claim => [claim.id, claim.lines[0]?.id ?? null]));

// ---------------------------------------------------------------------------
// PURE ADJUDICATION ENGINE — data plus pure function. \`adjudicateClaim\` is
// referentially transparent: fixtures + overrides + fee schedule in,
// segments/traces/totals out. Every surface reads these outputs, so every
// mutation has an observable consequence everywhere.
// ---------------------------------------------------------------------------

function formatCents(cents: number): string {
  const abs = Math.abs(cents);
  const dollars = String(Math.floor(abs / 100)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  const rem = String(abs % 100).padStart(2, '0');
  return \`\${cents < 0 ? '-' : ''}$\${dollars}.\${rem}\`;
}

/** Signed delta for ladder rungs, typographic minus included. */
function formatSignedCents(cents: number): string {
  if (cents === 0) {
    return 'no change';
  }
  return \`\${cents < 0 ? '−' : '+'}\${formatCents(Math.abs(cents))}\`;
}

function clampCents(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type SegmentKey = 'contractual' | 'deductible' | 'coinsurance' | 'copay' | 'plan' | 'denied';

interface WaterfallSegment {
  key: SegmentKey;
  label: string;
  cents: number;
  carcCode?: CarcCode;
}

interface TraceRung {
  ruleId: string;
  name: string;
  code: string;
  outcome: RuleOutcome;
  beforeCents: number;
  afterCents: number;
  carcCode?: CarcCode;
  isMuted: boolean; // rungs after a deny render strike-muted at $0
}

interface AdjudicatedLine {
  fx: LineFixture;
  status: LineStatus;
  allowedCents: number;
  contractualCents: number;
  deductibleCents: number;
  coinsuranceCents: number;
  copayCents: number;
  planPaidCents: number;
  memberCents: number;
  segments: WaterfallSegment[];
  trace: TraceRung[];
}

interface AdjudicatedClaim {
  fx: ClaimFixture;
  status: ClaimStatus;
  lines: AdjudicatedLine[];
  billedCents: number;
  allowedCents: number;
  planPaidCents: number;
  memberCents: number;
  deductibleCents: number;
  coinsuranceCents: number;
  copayCents: number;
}

interface ClaimStateSlice {
  status: ClaimStatus;
  lines: Record<string, {allowedOverrideCents?: number}>;
}

const RULES: Array<{ruleId: string; name: string}> = [
  {ruleId: 'ELIG-001', name: 'Eligibility & coverage'},
  {ruleId: 'PA-014', name: 'Prior authorization'},
  {ruleId: 'FEE-208', name: 'Fee schedule pricing'},
  {ruleId: 'COB-031', name: 'Coordination of benefits'},
  {ruleId: 'SHARE-050', name: 'Member cost share'},
];

function adjudicateClaim(
  fx: ClaimFixture,
  slice: ClaimStateSlice,
  feeSchedule: FeeSchedule,
): AdjudicatedClaim {
  // The deductible pool cascades across lines in display order — this is
  // why scrubbing ONE line re-proportions the compact waterfalls of every
  // downstream row, not just its own.
  let pool = fx.deductibleRemainingCents;
  const lines: AdjudicatedLine[] = fx.lines.map(line => {
    const billed = line.billedCents;
    const override = slice.lines[line.id]?.allowedOverrideCents;

    if (line.isDenied) {
      const trace: TraceRung[] = [
        {...RULES[0], code: RULES[0].ruleId, outcome: 'pass', beforeCents: billed, afterCents: billed, isMuted: false},
        {...RULES[1], code: RULES[1].ruleId, outcome: 'deny', beforeCents: billed, afterCents: 0, carcCode: 'CO-197', isMuted: false},
        {...RULES[2], code: RULES[2].ruleId, outcome: 'pass', beforeCents: 0, afterCents: 0, isMuted: true},
        {...RULES[3], code: RULES[3].ruleId, outcome: 'pass', beforeCents: 0, afterCents: 0, isMuted: true},
        {...RULES[4], code: RULES[4].ruleId, outcome: 'pass', beforeCents: 0, afterCents: 0, isMuted: true},
      ];
      return {
        fx: line,
        status: 'denied',
        allowedCents: 0,
        contractualCents: 0,
        deductibleCents: 0,
        coinsuranceCents: 0,
        copayCents: 0,
        planPaidCents: 0,
        memberCents: 0,
        segments: [
          {key: 'denied', label: 'Denied', cents: billed, carcCode: 'CO-197'},
        ],
        trace,
      };
    }

    const scheduled = feeSchedule === 'standard' ? line.allowedStdCents : line.allowedMedCents;
    const allowed = clampCents(override ?? scheduled, 0, billed);

    let deductible = 0;
    let coinsurance = 0;
    let copay = 0;
    if (line.isPreventive) {
      // ACA preventive — plan pays 100% of allowed; PR segments omitted.
    } else if (line.hasCopay) {
      copay = Math.min(fx.copayCents, allowed);
    } else {
      deductible = Math.min(allowed, pool);
      pool -= deductible;
      coinsurance = Math.round(fx.coinsuranceRate * (allowed - deductible));
    }
    const planPaid = allowed - deductible - coinsurance - copay;
    const contractual = billed - allowed;
    const member = deductible + coinsurance + copay;

    // Omit-when-undefined: a $0 segment renders nothing, not an empty slot.
    const segments: WaterfallSegment[] = [
      {key: 'contractual' as const, label: 'Contractual', cents: contractual, carcCode: 'CO-45' as const},
      {key: 'deductible' as const, label: 'Deductible', cents: deductible, carcCode: 'PR-1' as const},
      {key: 'coinsurance' as const, label: 'Coinsurance', cents: coinsurance, carcCode: 'PR-2' as const},
      {key: 'copay' as const, label: 'Copay', cents: copay, carcCode: 'PR-3' as const},
      {key: 'plan' as const, label: 'Plan paid', cents: planPaid},
    ].filter(segment => segment.cents > 0);
    // Cross-check: contractual + deductible + coinsurance + copay + plan
    // === billed, so sum(segments) === billedCents by construction.

    const trace: TraceRung[] = [
      {...RULES[0], code: RULES[0].ruleId, outcome: 'pass', beforeCents: billed, afterCents: billed, isMuted: false},
      {...RULES[1], code: RULES[1].ruleId, outcome: 'pass', beforeCents: billed, afterCents: billed, isMuted: false},
      {
        ...RULES[2],
        code: RULES[2].ruleId,
        outcome: contractual > 0 ? 'modify' : 'pass',
        beforeCents: billed,
        afterCents: allowed,
        carcCode: contractual > 0 ? 'CO-45' : undefined,
        isMuted: false,
      },
      {...RULES[3], code: RULES[3].ruleId, outcome: 'pass', beforeCents: allowed, afterCents: allowed, isMuted: false},
      {
        ...RULES[4],
        code: RULES[4].ruleId,
        outcome: member > 0 ? 'modify' : 'pass',
        beforeCents: allowed,
        afterCents: planPaid,
        carcCode: deductible > 0 ? 'PR-1' : coinsurance > 0 ? 'PR-2' : copay > 0 ? 'PR-3' : undefined,
        isMuted: false,
      },
    ];

    return {
      fx: line,
      status: override != null ? ('modified' as const) : ('paid' as const),
      allowedCents: allowed,
      contractualCents: contractual,
      deductibleCents: deductible,
      coinsuranceCents: coinsurance,
      copayCents: copay,
      planPaidCents: planPaid,
      memberCents: member,
      segments,
      trace,
    };
  });

  const sum = (pick: (line: AdjudicatedLine) => number) =>
    lines.reduce((acc, line) => acc + pick(line), 0);

  return {
    fx,
    status: slice.status,
    lines,
    billedCents: sum(line => line.fx.billedCents),
    allowedCents: sum(line => line.allowedCents),
    planPaidCents: sum(line => line.planPaidCents),
    memberCents: sum(line => line.memberCents),
    deductibleCents: sum(line => line.deductibleCents),
    coinsuranceCents: sum(line => line.coinsuranceCents),
    copayCents: sum(line => line.copayCents),
  };
}

// ---------------------------------------------------------------------------
// ShieldLedgerMark — 20px custom inline SVG: shield outline split by a
// horizontal ledger line at 55% height; the right half of the lower
// chamber fills with BRAND (the single quarantined hex, runtime value
// only) to suggest allowed-vs-denied.
// ---------------------------------------------------------------------------

function ShieldLedgerMark() {
  return (
    <span style={styles.mark} aria-hidden>
      <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <path
          d="M10 1.5 L17 4 V10 C17 14.5 14 17.5 10 18.7 C6 17.5 3 14.5 3 10 V4 Z"
          stroke="var(--color-text-secondary)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <line x1={3} y1={11} x2={17} y2={11} stroke="var(--color-text-secondary)" strokeWidth={1.5} />
        <path d="M10 11 H16.7 C16.2 14.8 13.5 17.4 10 18.6 Z" fill={BRAND} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// ReasonCodeChip — thin wrapper over the chip idiom with the CARC_META
// domain table: 18px tall, 10px mono code, tooltip carries the full CARC
// sentence (available on focus, not just hover, via the tabbable span).
// ---------------------------------------------------------------------------

const CARC_TONE_STYLE: Record<CarcTone, CSSProperties> = {
  neutral: {backgroundColor: 'var(--color-background-muted)', color: 'var(--color-text-secondary)'},
  info: {backgroundColor: INFO_SOFT, color: INFO_TEXT},
  danger: {backgroundColor: RED_SOFT, color: RED_TEXT},
};

function ReasonCodeChip({code}: {code: CarcCode}) {
  const meta = CARC_META[code];
  return (
    <Tooltip content={meta.sentence}>
      <span
        className="caw-focus"
        tabIndex={0}
        style={{...styles.reasonChip, ...CARC_TONE_STYLE[meta.tone]}}
        aria-label={meta.sentence}>
        {code}
      </span>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// EOBWaterfallBar — fully custom, presentational (all state lifted). 20px
// full bar / 12px compact bar; segments proportional to billedCents with
// 1px gaps and a 3px min-width; sub-threshold segments overflow-collapse
// into a '+n' stub. The drag handle is a real role="slider".
// ---------------------------------------------------------------------------

const SEGMENT_FILL: Record<SegmentKey, CSSProperties> = {
  contractual: {
    backgroundImage: \`repeating-linear-gradient(135deg, \${HATCH_A} 0 3px, \${HATCH_B} 3px 6px)\`,
  },
  deductible: {backgroundColor: SEG_DEDUCTIBLE},
  coinsurance: {backgroundColor: SEG_COINSURANCE},
  copay: {backgroundColor: SEG_COPAY},
  plan: {backgroundColor: BRAND},
  denied: {backgroundColor: RED_SOFT, boxShadow: \`inset 0 0 0 1px \${RED}\`},
};

// Below this share of billedCents a segment would render under ~3px at the
// bar's 480px minimum width, so it collapses into the '+n' stub.
const MIN_SEGMENT_FRACTION = 3 / 480;

interface EOBWaterfallBarProps {
  billedCents: number;
  segments: WaterfallSegment[];
  allowedCents: number;
  onScrub?: (allowedCents: number) => void;
  isDisabled?: boolean; // denied lines: one full-width denial segment
  isCompact?: boolean; // 12px mini variant — no labels, no handle
  cpt: string;
}

function EOBWaterfallBar({
  billedCents,
  segments,
  allowedCents,
  onScrub,
  isDisabled = false,
  isCompact = false,
  cpt,
}: EOBWaterfallBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  const visible = segments.filter(s => s.cents / billedCents >= MIN_SEGMENT_FRACTION);
  const collapsed = segments.filter(s => s.cents / billedCents < MIN_SEGMENT_FRACTION);

  const scrubFromClientX = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0 || onScrub == null) {
      return;
    }
    const fraction = clampCents((clientX - rect.left) / rect.width, 0, 1);
    // Pointer scrubs land on dimes so the labels stay legible mid-drag.
    const next = Math.round((billedCents * (1 - fraction)) / 10) * 10;
    onScrub(clampCents(next, 0, billedCents));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isDisabled) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    isDraggingRef.current = true;
    scrubFromClientX(event.clientX);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      scrubFromClientX(event.clientX);
    }
  };

  const handlePointerEnd = () => {
    isDraggingRef.current = false;
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isDisabled || onScrub == null) {
      return;
    }
    const step = event.shiftKey ? 1000 : 100;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      next = allowedCents + step;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      next = allowedCents - step;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = billedCents;
    }
    if (next != null) {
      event.preventDefault();
      event.stopPropagation();
      onScrub(clampCents(next, 0, billedCents));
    }
  };

  const handleLeft = \`\${((billedCents - allowedCents) / billedCents) * 100}%\`;

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0}}>
      <div
        ref={barRef}
        style={
          isCompact ? {...styles.waterfall, ...styles.waterfallCompact} : styles.waterfall
        }
        aria-hidden={isCompact}>
        {visible.map(segment => (
          <Tooltip
            key={segment.key}
            content={\`\${segment.label}\${segment.carcCode != null ? \` \${segment.carcCode}\` : ''} · \${formatCents(segment.cents)}\`}>
            <div
              style={{
                ...styles.segment,
                ...SEGMENT_FILL[segment.key],
                flexGrow: segment.cents,
                flexBasis: 0,
              }}
            />
          </Tooltip>
        ))}
        {collapsed.length > 0 ? (
          <Tooltip
            content={collapsed
              .map(segment => \`\${segment.label} · \${formatCents(segment.cents)}\`)
              .join(' · ')}>
            <div
              style={{
                ...styles.segment,
                backgroundColor: 'var(--color-background-muted)',
                flexGrow: 0,
                flexBasis: 3,
              }}
            />
          </Tooltip>
        ) : null}
        {!isCompact && !isDisabled ? (
          <div
            className="caw-focus"
            role="slider"
            tabIndex={0}
            aria-label={\`Allowed amount for CPT \${cpt}\`}
            aria-valuemin={0}
            aria-valuemax={billedCents}
            aria-valuenow={allowedCents}
            aria-valuetext={\`\${formatCents(allowedCents)} allowed\`}
            style={{...styles.handle, insetInlineStart: handleLeft}}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onKeyDown={handleKeyDown}
          />
        ) : null}
      </div>
      {!isCompact ? (
        <div style={styles.segLabelRow}>
          {visible.map(segment => (
            <span key={segment.key} style={styles.segLabel}>
              <span style={styles.segAmount}>{formatCents(segment.cents)}</span>
              {segment.carcCode != null ? (
                <ReasonCodeChip code={segment.carcCode} />
              ) : (
                <Text type="supporting" size="xsm" color="secondary">
                  {segment.label}
                </Text>
              )}
            </span>
          ))}
          {collapsed.length > 0 ? (
            <span style={styles.segAmount}>+{collapsed.length}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CPTLineRow — fully custom dense composite row, 44px collapsed / 108px
// expanded. Escape in an expanded row collapses it and restores focus to
// the row's CPT button.
// ---------------------------------------------------------------------------

interface CPTLineRowProps {
  line: AdjudicatedLine;
  isSelected: boolean;
  isNarrow: boolean;
  onSelect: (lineId: string | null) => void;
  onScrub: (lineId: string, allowedCents: number) => void;
  onPointerFlash: (letter: string) => void;
}

function CPTLineRow({
  line,
  isSelected,
  isNarrow,
  onSelect,
  onScrub,
  onPointerFlash,
}: CPTLineRowProps) {
  const cptButtonRef = useRef<HTMLButtonElement | null>(null);
  const {fx} = line;
  const statusMeta = LINE_STATUS_META[line.status];
  // Stress fixture (4) renders here: max 2 modifier chips, then '+n'.
  const shownModifiers = fx.modifiers.slice(0, 2);
  const extraModifiers = fx.modifiers.slice(2);

  const handleRowKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && isSelected) {
      event.stopPropagation();
      onSelect(null);
      cptButtonRef.current?.focus();
    }
  };

  const gridStyle = isNarrow
    ? {...styles.lineGrid, ...styles.lineGridNarrow, ...styles.lineRow}
    : {...styles.lineGrid, ...styles.lineRow};

  return (
    <div
      role="row"
      aria-selected={isSelected}
      style={isSelected ? {...gridStyle, ...styles.lineRowSelected} : gridStyle}
      onClick={() => onSelect(isSelected ? null : fx.id)}
      onKeyDown={handleRowKeyDown}>
      <span role="cell">
        <Tooltip content={statusMeta.label}>
          <button
            type="button"
            className="caw-focus"
            style={styles.statusDotButton}
            aria-label={\`\${fx.cpt}: \${statusMeta.label}\`}
            onClick={event => {
              event.stopPropagation();
              onSelect(fx.id);
            }}>
            <span style={{...styles.lineDot, backgroundColor: statusMeta.color}} />
          </button>
        </Tooltip>
      </span>
      <span role="cell">
        <button
          ref={cptButtonRef}
          type="button"
          className="caw-focus"
          style={styles.cptButton}
          aria-expanded={isSelected}
          onClick={event => {
            event.stopPropagation();
            onSelect(isSelected ? null : fx.id);
          }}>
          {fx.cpt}
        </button>
      </span>
      <span role="cell" style={styles.modCell}>
        {shownModifiers.map(modifier => (
          <span key={modifier} style={styles.modChip}>
            {modifier}
          </span>
        ))}
        {extraModifiers.length > 0 ? (
          <Tooltip content={fx.modifiers.join(' ')}>
            <span style={styles.modChip} tabIndex={0} className="caw-focus">
              +{extraModifiers.length}
            </span>
          </Tooltip>
        ) : null}
      </span>
      {!isNarrow ? (
        <span role="cell" style={styles.descCell}>
          {fx.description}
        </span>
      ) : null}
      <span role="cell" style={styles.dxPointerCell}>
        {fx.dx.map(letter => (
          <button
            key={letter}
            type="button"
            className="caw-focus"
            style={styles.dxPointerButton}
            aria-label={\`Flash diagnosis pointer \${letter}\`}
            onClick={event => {
              event.stopPropagation();
              onPointerFlash(letter);
            }}>
            {letter}
          </button>
        ))}
      </span>
      <span role="cell" style={{...styles.mono13, ...styles.numCell}}>
        {fx.units > 1 ? \`×\${fx.units}\` : '1'}
      </span>
      <span role="cell" style={{...styles.mono13, ...styles.numCell}}>
        {fx.billed}
      </span>
      <span role="cell" style={{...styles.mono13, ...styles.numCell}}>
        {formatCents(line.allowedCents)}
      </span>
      <span role="cell" style={{...styles.mono13, ...styles.numCell}}>
        {formatCents(line.memberCents)}
      </span>
      {!isNarrow ? (
        <span role="cell">
          <EOBWaterfallBar
            billedCents={fx.billedCents}
            segments={line.segments}
            allowedCents={line.allowedCents}
            isCompact
            isDisabled={line.status === 'denied'}
            cpt={fx.cpt}
          />
        </span>
      ) : null}
      {isSelected ? (
        <div role="cell" style={styles.expandedBody}>
          <EOBWaterfallBar
            billedCents={fx.billedCents}
            segments={line.segments}
            allowedCents={line.allowedCents}
            onScrub={cents => onScrub(fx.id, cents)}
            isDisabled={line.status === 'denied'}
            cpt={fx.cpt}
          />
          {fx.perUnit != null ? (
            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
              {fx.units} units × {fx.perUnit} = {fx.billed} billed
            </Text>
          ) : null}
          {fx.pendNote != null ? (
            <span style={styles.pendNote}>
              <Text type="supporting" size="xsm">
                {fx.pendNote}
              </Text>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RuleTraceLadder — <ol> of 56px rungs; rungs whose delta changed on the
// last scrub pulse to a brand wash for 300ms (prefers-reduced-motion:
// static 1px brand outline, no timers, no motion).
// ---------------------------------------------------------------------------

interface RuleTraceLadderProps {
  trace: TraceRung[];
  reFiredRuleIds: readonly string[];
  isReducedMotion: boolean;
}

function RuleTraceLadder({trace, reFiredRuleIds, isReducedMotion}: RuleTraceLadderProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const signature = trace.map(rung => \`\${rung.beforeCents}>\${rung.afterCents}\`).join('|');
  const hasReFired = reFiredRuleIds.length > 0;

  useEffect(() => {
    if (!hasReFired || isReducedMotion) {
      return undefined;
    }
    setIsPulsing(true);
    const timer = setTimeout(() => setIsPulsing(false), 300);
    return () => clearTimeout(timer);
    // Re-pulse whenever the running amounts actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return (
    <div>
      <Text type="supporting" size="xsm" color="secondary">
        Rule trace
      </Text>
      <div style={{position: 'relative'}}>
        <span style={styles.ladderRail} aria-hidden />
        <ol style={styles.ladder} aria-label={\`Adjudication trace, \${trace.length} rules\`}>
          {trace.map(rung => {
            const outcomeMeta = RULE_OUTCOME_META[rung.outcome];
            const isReFired = reFiredRuleIds.includes(rung.ruleId);
            const delta = rung.afterCents - rung.beforeCents;
            const rungStyle: CSSProperties = {
              ...styles.rung,
              ...(rung.isMuted ? styles.rungMuted : null),
              backgroundColor: isReFired && isPulsing ? BRAND_WASH : 'transparent',
              ...(isReducedMotion && isReFired
                ? {boxShadow: \`inset 0 0 0 1px \${BRAND}\`}
                : null),
            };
            return (
              <li key={rung.ruleId} className="caw-rung" style={rungStyle}>
                <span
                  style={{...styles.rungNode, color: outcomeMeta.color}}
                  role="img"
                  aria-label={outcomeMeta.label}>
                  <Icon icon={outcomeMeta.icon} size="xsm" color="inherit" />
                </span>
                <span style={styles.rungBody}>
                  <span style={styles.rungTitleRow}>
                    <span style={styles.rungName}>{rung.name}</span>
                    <span style={styles.rungCode}>{rung.code}</span>
                  </span>
                  <span style={styles.rungAmounts}>
                    <span style={rung.isMuted ? styles.strike : undefined}>
                      {formatCents(rung.beforeCents)} → {formatCents(rung.afterCents)}
                    </span>
                    <span style={styles.rungDelta}>
                      {formatSignedCents(delta)}
                      {rung.carcCode != null ? \` \${rung.carcCode}\` : ''}
                    </span>
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MemberResponsibilityCard — thin wrapper; reads only computed sums from
// the owner, so every scrub visibly moves it.
// ---------------------------------------------------------------------------

function MemberResponsibilityCard({claim}: {claim: AdjudicatedClaim}) {
  const firstName = claim.fx.member.name.split(' ')[0];
  return (
    <div style={styles.memberCard}>
      <span style={styles.memberHeader}>Member responsibility</span>
      <div style={styles.memberRow}>
        <Text type="supporting" size="sm" color="secondary">
          Deductible applied
        </Text>
        <span style={styles.mono13}>{formatCents(claim.deductibleCents)}</span>
      </div>
      <div style={styles.memberRow}>
        <Text type="supporting" size="sm" color="secondary">
          Coinsurance
        </Text>
        <span style={styles.mono13}>{formatCents(claim.coinsuranceCents)}</span>
      </div>
      <div style={styles.memberRow}>
        <Text type="supporting" size="sm" color="secondary">
          Copay
        </Text>
        <span style={styles.mono13}>{formatCents(claim.copayCents)}</span>
      </div>
      <div
        style={{
          borderBlockStart: 'var(--border-width) solid var(--color-border)',
          marginBlockStart: 4,
        }}>
        <div style={styles.memberTotalRow}>
          <Text type="label" size="sm">
            {firstName} owes
          </Text>
          <span style={styles.memberTotalValue}>{formatCents(claim.memberCents)}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Claim-inbox rail — listbox with aria-activedescendant; 36px rows; the
// 32px footer aggregate derives from the same adjudicated rows, so scrubs
// and approvals reach the bottom-left corner.
// ---------------------------------------------------------------------------

type StatusFilter = 'all' | ClaimStatus;

interface ClaimRailProps {
  claims: AdjudicatedClaim[];
  allClaims: AdjudicatedClaim[];
  selectedClaimId: string;
  statusFilter: StatusFilter;
  isIconRail: boolean;
  onSelect: (claimId: string) => void;
}

function ClaimRail({
  claims,
  allClaims,
  selectedClaimId,
  statusFilter,
  isIconRail,
  onSelect,
}: ClaimRailProps) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (claims.length === 0) {
      return;
    }
    const index = claims.findIndex(claim => claim.fx.id === selectedClaimId);
    let next: number | null = null;
    if (event.key === 'ArrowDown') {
      next = Math.min(claims.length - 1, index + 1);
    } else if (event.key === 'ArrowUp') {
      next = Math.max(0, index < 0 ? 0 : index - 1);
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = claims.length - 1;
    }
    if (next != null) {
      event.preventDefault();
      onSelect(claims[next].fx.id);
    }
  };

  // Bottom-left corner aggregate: derives live from the pended rows —
  // baseline 938450 cents = '$9,384.50 pended' (cross-checks the fixtures).
  const pendedClaims = allClaims.filter(claim => claim.status === 'pended');
  const pendedCents = pendedClaims.reduce((acc, claim) => acc + claim.allowedCents, 0);

  return (
    <div style={isIconRail ? {...styles.rail, ...styles.railIcon} : styles.rail}>
      <div
        className="caw-focus"
        role="listbox"
        aria-label="Pended claims inbox"
        aria-activedescendant={\`rail-\${selectedClaimId}\`}
        tabIndex={0}
        style={styles.railScroll}
        onKeyDown={handleKeyDown}>
        {claims.length === 0 ? (
          <div style={styles.railEmpty}>
            <Text type="supporting" size="xsm" color="secondary">
              {statusFilter === 'approved'
                ? 'No approved claims this session'
                : 'No claims match this filter'}
            </Text>
          </div>
        ) : (
          claims.map(claim => {
            const statusMeta = CLAIM_STATUS_META[claim.status];
            const isSelected = claim.fx.id === selectedClaimId;
            const rowStyle = isSelected
              ? {...styles.railRow, ...styles.railRowSelected}
              : styles.railRow;
            const tooltip = \`\${claim.fx.id} · \${claim.fx.member.name} · \${claim.fx.provider.name} · \${formatCents(claim.allowedCents)} allowed\`;
            return (
              <Tooltip key={claim.fx.id} content={tooltip}>
                <div
                  id={\`rail-\${claim.fx.id}\`}
                  role="option"
                  aria-selected={isSelected}
                  aria-current={isSelected ? 'true' : undefined}
                  style={rowStyle}
                  onClick={() => onSelect(claim.fx.id)}>
                  <StatusDot variant={statusMeta.dot} label={statusMeta.label} />
                  {isIconRail ? (
                    <span style={styles.mono12}>{claim.fx.id.slice(-4)}</span>
                  ) : (
                    <>
                      <span style={styles.mono12}>{claim.fx.id.slice(-9)}</span>
                      <span style={styles.railMiddle}>
                        {claim.fx.member.surname} · {claim.fx.provider.name}
                      </span>
                      <span style={styles.railTotal}>{formatCents(claim.allowedCents)}</span>
                    </>
                  )}
                </div>
              </Tooltip>
            );
          })
        )}
      </div>
      <div style={styles.railFooter}>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers maxLines={1}>
          {isIconRail
            ? \`\${allClaims.length}\`
            : \`\${allClaims.length} claims · \${formatCents(pendedCents)} pended\`}
        </Text>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner. One \`update(id, patch)\`; every surface
// calls it, and every mutation re-runs the pure pipeline so consequences
// land on every surface: waterfalls, footer sums, member card, ladder
// pulses, rail totals, and the rail aggregate.
// ---------------------------------------------------------------------------

interface WorkbenchState {
  claims: Record<string, ClaimStateSlice>;
  selectedClaimId: string;
  selectedLineId: string | null;
  feeSchedule: FeeSchedule;
}

type WorkbenchPatch = Partial<{
  status: ClaimStatus;
  feeSchedule: FeeSchedule;
  allowedOverrideCents: number;
}>;

const INITIAL_STATE: WorkbenchState = {
  claims: Object.fromEntries(
    CLAIM_LIST.map(claim => [claim.id, {status: claim.initialStatus, lines: {}}]),
  ),
  selectedClaimId: CLAIMS.knee,
  // The J7325 line starts expanded — its $1,240.00 → $412.00 waterfall is
  // the page's demo centerpiece.
  selectedLineId: 'ln-0093-j7325',
  feeSchedule: 'standard',
};

interface PrevTraceSnapshot {
  lineId: string;
  feeSchedule: FeeSchedule;
  deltas: number[];
}

/**
 * Observe the filter row's real width. Host chrome around the template (the
 * demo's sidebar, preview padding) starves the main column independently of
 * the viewport, so viewport media queries alone cannot tell when the meta
 * segment has run out of room next to the SegmentedControl.
 */
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

export default function ClaimsAdjudicationWorkbenchTemplate() {
  // Responsive subtraction thresholds — see the header contract.
  const isIconRail = useMediaQuery('(max-width: 1359px)');
  const isNarrow = useMediaQuery('(max-width: 1199px)');
  const isAsideHidden = useMediaQuery('(max-width: 1079px)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Filter-row meta subtraction: measured on the row ITSELF, not the
  // viewport — the demo stage is narrower than the window, so viewport
  // queries never fire there. Instead of a mid-string ellipsis ("6 lines ·
  // …" reads ragged after a separator), drop whole trailing segments:
  // full "N lines · DOS · provider" → "N lines · DOS …" → "N lines".
  // Width 0 = first pre-observer render; render the full meta for that
  // frame so wide hosts don't flash the short form.
  const filterRowRef = useRef<HTMLDivElement | null>(null);
  const filterRowWidth = useElementWidth(filterRowRef);
  const metaTier: 'full' | 'dos' | 'lines' | 'none' =
    filterRowWidth === 0 || filterRowWidth >= 700
      ? 'full'
      : filterRowWidth >= 500
        ? 'dos'
        : filterRowWidth >= 320
          ? 'lines'
          : 'none';

  const [state, setState] = useState<WorkbenchState>(INITIAL_STATE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [flashLetter, setFlashLetter] = useState<string | null>(null);
  const [announceText, setAnnounceText] = useState('');

  // THE one write path. Claim ids patch status / fee schedule; line ids
  // patch allowedOverrideCents (addressed through LINE_OWNER).
  const update = useCallback((id: string, patch: WorkbenchPatch) => {
    setState(prev => {
      let next = prev;
      if (patch.feeSchedule != null) {
        next = {...next, feeSchedule: patch.feeSchedule};
      }
      if (patch.status != null && next.claims[id] != null) {
        next = {
          ...next,
          claims: {
            ...next.claims,
            [id]: {...next.claims[id], status: patch.status},
          },
        };
      }
      if (patch.allowedOverrideCents != null) {
        const claimId = LINE_OWNER.get(id);
        if (claimId != null) {
          const slice = next.claims[claimId];
          next = {
            ...next,
            claims: {
              ...next.claims,
              [claimId]: {
                ...slice,
                lines: {
                  ...slice.lines,
                  [id]: {allowedOverrideCents: patch.allowedOverrideCents},
                },
              },
            },
          };
        }
      }
      return next;
    });
  }, []);

  const selectClaim = useCallback((claimId: string) => {
    setState(prev =>
      prev.selectedClaimId === claimId
        ? prev
        : {
            ...prev,
            selectedClaimId: claimId,
            selectedLineId: FIRST_LINE.get(claimId) ?? null,
          },
    );
  }, []);

  const selectLine = useCallback((lineId: string | null) => {
    setState(prev => ({...prev, selectedLineId: lineId}));
  }, []);

  // Pure pipeline over all seven claims — rail totals, footer sums, the
  // member card, and the ladder all read from this one result.
  const adjudicated = useMemo(
    () =>
      CLAIM_LIST.map(claim =>
        adjudicateClaim(claim, state.claims[claim.id], state.feeSchedule),
      ),
    [state.claims, state.feeSchedule],
  );
  const adjudicatedById = useMemo(
    () => new Map(adjudicated.map(claim => [claim.fx.id, claim])),
    [adjudicated],
  );

  const selectedClaim =
    adjudicatedById.get(state.selectedClaimId) ?? adjudicated[0];
  const selectedLine =
    selectedClaim.lines.find(line => line.fx.id === state.selectedLineId) ?? null;

  const filteredClaims =
    statusFilter === 'all'
      ? adjudicated
      : adjudicated.filter(claim => claim.status === statusFilter);
  const statusCounts = useMemo(() => {
    const counts = {pended: 0, denied: 0, approved: 0};
    for (const claim of adjudicated) {
      counts[claim.status] += 1;
    }
    return counts;
  }, [adjudicated]);

  // reFired = rules whose delta changed against the previous committed run
  // (kept in a ref); a fee-schedule switch re-fires all five.
  const prevTraceRef = useRef<PrevTraceSnapshot | null>(null);
  const reFiredRuleIds = useMemo(() => {
    const prev = prevTraceRef.current;
    if (selectedLine == null || prev == null || prev.lineId !== selectedLine.fx.id) {
      return [];
    }
    if (prev.feeSchedule !== state.feeSchedule) {
      return selectedLine.trace.map(rung => rung.ruleId);
    }
    return selectedLine.trace
      .filter((rung, index) => rung.afterCents - rung.beforeCents !== prev.deltas[index])
      .map(rung => rung.ruleId);
  }, [selectedLine, state.feeSchedule]);

  useEffect(() => {
    prevTraceRef.current =
      selectedLine == null
        ? null
        : {
            lineId: selectedLine.fx.id,
            feeSchedule: state.feeSchedule,
            deltas: selectedLine.trace.map(rung => rung.afterCents - rung.beforeCents),
          };
  });

  // One polite live region owned by the root: post-scrub summary.
  const announceKey =
    selectedLine == null
      ? ''
      : \`\${selectedLine.fx.id}:\${selectedLine.allowedCents}:\${reFiredRuleIds.length}\`;
  useEffect(() => {
    if (selectedLine != null && reFiredRuleIds.length > 0) {
      setAnnounceText(
        \`Allowed \${formatCents(selectedLine.allowedCents)} — member owes \${formatCents(selectedClaim.memberCents)} — \${reFiredRuleIds.length} rules re-fired\`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announceKey]);

  // Transient DX cross-flash; with reduced motion the chip shows a static
  // outline for the same window instead of animating.
  useEffect(() => {
    if (flashLetter == null) {
      return undefined;
    }
    const timer = setTimeout(() => setFlashLetter(null), 900);
    return () => clearTimeout(timer);
  }, [flashLetter]);

  const statusMeta = CLAIM_STATUS_META[selectedClaim.status];
  const gridStyle = isNarrow
    ? {...styles.lineGrid, ...styles.lineGridNarrow}
    : styles.lineGrid;

  return (
    <div style={styles.root}>
      <style>{WORKBENCH_CSS}</style>
      <div aria-live="polite" style={styles.visuallyHidden}>
        {announceText}
      </div>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div style={styles.headerBar}>
              {/* Top-left corner: mark + wordmark + claim breadcrumb. */}
              <ShieldLedgerMark />
              <span style={styles.wordmark}>Veristra</span>
              <span style={styles.breadcrumb}>
                <Text type="supporting" size="xsm" color="secondary">
                  Pended Queue
                </Text>
                <Icon icon={ChevronRightIcon} size="xsm" color="secondary" />
                <span style={styles.mono12}>{selectedClaim.fx.id}</span>
                {/* Every displayed property is an affordance: the status
                    chip filters the rail on click. */}
                <Token
                  size="sm"
                  color={statusMeta.token}
                  label={statusMeta.label}
                  onClick={() => setStatusFilter(selectedClaim.status)}
                />
              </span>
              <StackItem size="fill">
                <span />
              </StackItem>
              {/* Top-right corner: fee-schedule override, Pend, Approve,
                  examiner avatar. */}
              <Selector
                label="Fee schedule override"
                isLabelHidden
                size="sm"
                width={190}
                options={FEE_SCHEDULE_OPTIONS}
                value={state.feeSchedule}
                onChange={value =>
                  update(selectedClaim.fx.id, {feeSchedule: value as FeeSchedule})
                }
              />
              <Button
                label="Pend"
                variant="ghost"
                size="sm"
                onClick={() => update(selectedClaim.fx.id, {status: 'pended'})}
              />
              <Button
                label="Approve"
                variant="primary"
                size="sm"
                isDisabled={selectedClaim.status === 'approved'}
                onClick={() => update(selectedClaim.fx.id, {status: 'approved'})}
              />
              <Tooltip content={\`\${EXAMINER.name} · Examiner\`}>
                <span style={{flexShrink: 0}}>
                  <Avatar name={EXAMINER.name} size="xsmall" />
                </span>
              </Tooltip>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.viewRoot}>
              <ClaimRail
                claims={filteredClaims}
                allClaims={adjudicated}
                selectedClaimId={selectedClaim.fx.id}
                statusFilter={statusFilter}
                isIconRail={isIconRail}
                onSelect={selectClaim}
              />
              <div style={styles.main}>
                <div ref={filterRowRef} style={styles.filterRow}>
                  <SegmentedControl
                    label="Filter claims by status"
                    value={statusFilter}
                    onChange={value => setStatusFilter(value as StatusFilter)}
                    size="sm">
                    <SegmentedControlItem label={\`All \${adjudicated.length}\`} value="all" />
                    <SegmentedControlItem
                      label={\`Pended \${statusCounts.pended}\`}
                      value="pended"
                    />
                    <SegmentedControlItem
                      label={\`Denied \${statusCounts.denied}\`}
                      value="denied"
                    />
                    <SegmentedControlItem
                      label={\`Approved \${statusCounts.approved}\`}
                      value="approved"
                    />
                  </SegmentedControl>
                  <StackItem size="fill">
                    <span />
                  </StackItem>
                  {metaTier !== 'none' && (
                    <span
                      style={
                        // At the shortest tier the meta is a fixed ~42px —
                        // pin it (flexShrink 0) so the SegmentedControl,
                        // not the meta, absorbs the last few deficit px;
                        // otherwise "6 lines" ellipsizes to "6 lin…".
                        metaTier === 'lines'
                          ? {...styles.filterMeta, flexShrink: 0}
                          : styles.filterMeta
                      }>
                      <Text
                        type="supporting"
                        size="xsm"
                        color="secondary"
                        hasTabularNumbers
                        maxLines={1}>
                        {selectedClaim.lines.length} lines
                        {(metaTier === 'dos' || metaTier === 'full') &&
                          \` · DOS \${selectedClaim.fx.dos}\`}
                        {metaTier === 'full' &&
                          \` · \${
                            selectedClaim.fx.provider.name.length > 30
                              ? 'Consolidated Multispecialty'
                              : selectedClaim.fx.provider.name
                          }\`}
                      </Text>
                    </span>
                  )}
                </div>
                <div style={styles.linesScroll}>
                  {/* 32px diagnosis strip — DX pointer clicks in rows flash
                      the matching letter chip here. */}
                  <div style={styles.dxStrip} aria-label="Claim diagnoses">
                    <Text type="supporting" size="xsm" color="secondary">
                      DX
                    </Text>
                    {selectedClaim.fx.dx.map(dx => {
                      const isFlashing = flashLetter === dx.letter;
                      return (
                        <span
                          key={dx.letter}
                          className="caw-dxchip"
                          style={
                            isFlashing
                              ? {...styles.dxChip, ...styles.dxChipFlash}
                              : styles.dxChip
                          }>
                          <span style={styles.dxLetter}>{dx.letter}</span>
                          <span style={styles.mono12}>{dx.code}</span>
                          <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                            {dx.label}
                          </Text>
                        </span>
                      );
                    })}
                  </div>
                  <div role="table" aria-label={\`Claim lines for \${selectedClaim.fx.id}\`}>
                    <div
                      role="row"
                      style={{...gridStyle, ...styles.colHeaderRow}}>
                      <span role="columnheader" style={styles.colHeaderCell} aria-label="Status" />
                      <span role="columnheader" style={styles.colHeaderCell}>
                        CPT
                      </span>
                      <span role="columnheader" style={styles.colHeaderCell}>
                        Mod
                      </span>
                      {!isNarrow ? (
                        <span role="columnheader" style={styles.colHeaderCell}>
                          Description
                        </span>
                      ) : null}
                      <span role="columnheader" style={styles.colHeaderCell}>
                        DX
                      </span>
                      <span
                        role="columnheader"
                        style={{...styles.colHeaderCell, textAlign: 'end'}}>
                        Units
                      </span>
                      <span
                        role="columnheader"
                        style={{...styles.colHeaderCell, textAlign: 'end'}}>
                        Billed
                      </span>
                      <span
                        role="columnheader"
                        style={{...styles.colHeaderCell, textAlign: 'end'}}>
                        Allowed
                      </span>
                      <span
                        role="columnheader"
                        style={{...styles.colHeaderCell, textAlign: 'end'}}>
                        Member
                      </span>
                      {!isNarrow ? (
                        <span role="columnheader" style={styles.colHeaderCell}>
                          EOB
                        </span>
                      ) : null}
                    </div>
                    {selectedClaim.lines.map(line => (
                      <CPTLineRow
                        key={line.fx.id}
                        line={line}
                        isSelected={state.selectedLineId === line.fx.id}
                        isNarrow={isNarrow}
                        onSelect={selectLine}
                        onScrub={(lineId, cents) =>
                          update(lineId, {allowedOverrideCents: cents})
                        }
                        onPointerFlash={setFlashLetter}
                      />
                    ))}
                  </div>
                  {/* 52px sticky footer — sums derive from the same lines
                      the table renders, so they can never disagree. */}
                  <div style={styles.totalsFooter}>
                    {(
                      [
                        ['Billed', selectedClaim.billedCents],
                        ['Allowed', selectedClaim.allowedCents],
                        ['Plan paid', selectedClaim.planPaidCents],
                        ['Member owes', selectedClaim.memberCents],
                      ] as const
                    ).map(([label, cents]) => (
                      <span key={label} style={styles.totalCell}>
                        <span style={styles.totalLabel}>{label}</span>
                        <span style={styles.mono13}>{formatCents(cents)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {!isAsideHidden ? (
                <div style={styles.aside}>
                  <div style={styles.asideScroll}>
                    <MemberResponsibilityCard claim={selectedClaim} />
                    {selectedLine != null ? (
                      <RuleTraceLadder
                        trace={selectedLine.trace}
                        reFiredRuleIds={reFiredRuleIds}
                        isReducedMotion={isReducedMotion}
                      />
                    ) : (
                      <Text type="supporting" size="xsm" color="secondary">
                        Select a claim line to inspect its rule trace.
                      </Text>
                    )}
                  </div>
                  {/* Bottom-right corner owner. */}
                  <div style={styles.asideFooter}>
                    <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                      Adjudicated deterministically · engine v3.2 ·{' '}
                      {selectedLine != null ? selectedLine.trace.length : 0} rules traced
                    </Text>
                  </div>
                </div>
              ) : null}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};