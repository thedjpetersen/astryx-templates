// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs corporate card
 *   program (47 issued cards with fixed holders, last-4s, limits, and
 *   month-to-date spend; per-card transaction ledgers with fixed ISO
 *   timestamps in early July 2026; a program-level spend-by-category
 *   split). No clocks, no randomness, no network media.
 * @output Corporate Card Program — the Finance admin surface for the
 *   Kestrel Labs card program. A program rail (KPI blocks: 42 active
 *   cards, $84,210 month-to-date, 7 pending receipts, 3 frozen; a
 *   spend-by-category donut with legend); a sortable card table (holder
 *   avatar + role, last-4 mini-card chip, monthly limit with usage bar,
 *   MTD spend, receipt status, Active/Frozen/Pending token) filtered by a
 *   status SegmentedControl and a physical/virtual split chip row; and an
 *   end panel for the selected card (card art, freeze/unfreeze with
 *   AlertDialog confirm, per-transaction limit Selector, merchant-category
 *   allowed/blocked chips, recent transactions with receipt-attached
 *   checkmarks and missing-receipt amber rows).
 * @position Page template; emitted by `astryx template fin-corporate-cards`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | rail 280 (program KPIs + donut, scrolls) | content (filter
 *   toolbar, card Table scrolling both axes) | end panel 340 (selected
 *   card, scrolls).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. The KPI blocks, the donut, the mini-card chips, and the card
 *   art are styled divs inside LayoutPanels.
 * Color policy: token-pure everywhere except the two scheme-locked card
 *   visuals (the list mini-card chip and the detail-panel card art) —
 *   card plastic stays dark in both schemes, so those two surfaces pin
 *   explicit gradient/rgba literals and never use flipping tokens. The
 *   data-viz categorical tokens carry the repo-standard `light-dark()`
 *   fallback pairs (the demo does not inject `--color-data-categorical-*`).
 *
 * Responsive contract:
 * - > 1180px: full three-region frame.
 * - <= 1180px: the selected-card panel is dropped (the table stays the
 *   source of truth for every card); the header panel toggle hides with it.
 * - <= 900px: the program rail is dropped and a compact KPI chip strip
 *   (same four figures) renders above the filter toolbar; the table drops
 *   the Receipts and MTD spend columns so holder/card/limit/status never
 *   crush. The header row wraps instead of clipping the search box.
 * - The rail, the table, and the selected-card panel each scroll
 *   independently (`minHeight: 0` down every flex chain); toolbars pinned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  BanIcon,
  CheckCircle2Icon,
  CheckIcon,
  CreditCardIcon,
  LockOpenIcon,
  PanelRightIcon,
  PlusIcon,
  ReceiptTextIcon,
  SearchIcon,
  SmartphoneIcon,
  SnowflakeIcon,
  TriangleAlertIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {
  Table,
  pixel,
  proportional,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  kpiBlock: {
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  kpiValue: {fontVariantNumeric: 'tabular-nums'},
  legendDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  legendAmount: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textAlign: 'end'},
  // Donut ring: conic-gradient with a radial-gradient mask cutting the
  // hole. The mask consumes alpha only, so the opaque stop uses the
  // scheme-neutral `black` keyword — identical in light and dark.
  donutWrap: {position: 'relative', width: 168, height: 168, flexShrink: 0, alignSelf: 'center'},
  donutRing: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    WebkitMask:
      'radial-gradient(farthest-side, transparent calc(100% - 26px), black calc(100% - 25px))',
    mask: 'radial-gradient(farthest-side, transparent calc(100% - 26px), black calc(100% - 25px))',
  },
  donutCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  // Content column ---------------------------------------------------------
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentToolbar: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-4)'},
  compactKpis: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-4) 0'},
  compactKpiChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  typeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    font: 'inherit',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  typeChipOn: {
    borderColor: 'var(--color-accent)',
    color: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  tableScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    // Pixel columns + the proportional holder column keep a floor; narrow
    // viewports scroll the table horizontally instead of crushing cells.
    overflowX: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-3)',
  },
  tableEmpty: {padding: 'var(--spacing-6) var(--spacing-4)'},
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Footgun: design-system ProgressBar enforces minWidth 48 — the compact
  // per-row usage meter overrides it.
  usageBar: {minWidth: 0, width: '100%'},
  limitCell: {minWidth: 0, width: '100%'},
  // Mini-card chip (list rows) — scheme-locked dark "card plastic": the
  // gradient and text literals are intentional and never flip.
  miniCard: {
    width: 58,
    height: 36,
    flexShrink: 0,
    borderRadius: 6,
    padding: '4px 6px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    colorScheme: 'dark',
    background: 'linear-gradient(135deg, #334155 0%, #0F172A 100%)',
    boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.35)',
  },
  miniCardVirtual: {
    background: 'linear-gradient(135deg, #6366F1 0%, #312E81 100%)',
    boxShadow: 'inset 0 0 0 1px rgba(165, 180, 252, 0.4)',
  },
  miniCardFrozen: {opacity: 0.55},
  miniCardBrand: {
    fontSize: 6,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(226, 232, 240, 0.65)',
    lineHeight: 1,
  },
  miniCardDigits: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 10,
    color: 'rgba(241, 245, 249, 0.95)',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
  // Selected-card panel ----------------------------------------------------
  detailScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  // Card art — scheme-locked dark card plastic (see Color policy). All
  // literals intentional; nothing inside flips with the theme.
  cardArt: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1.586',
    borderRadius: 12,
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    colorScheme: 'dark',
    background:
      'linear-gradient(135deg, #334155 0%, #1E293B 45%, #0F172A 100%)',
    boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.35)',
    overflow: 'hidden',
  },
  cardArtVirtual: {
    background:
      'linear-gradient(135deg, #6366F1 0%, #4338CA 45%, #312E81 100%)',
    boxShadow: 'inset 0 0 0 1px rgba(165, 180, 252, 0.4)',
  },
  cardArtSheen: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(120% 90% at 85% -10%, rgba(226, 232, 240, 0.14), transparent 60%)',
    pointerEvents: 'none',
  },
  cardArtBrand: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(226, 232, 240, 0.85)',
  },
  cardArtDigits: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 18,
    letterSpacing: '0.06em',
    color: 'rgba(241, 245, 249, 0.96)',
    whiteSpace: 'nowrap',
  },
  cardArtLabel: {
    fontSize: 9,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(148, 163, 184, 0.9)',
    lineHeight: 1.4,
  },
  cardArtValue: {fontSize: 12, color: 'rgba(226, 232, 240, 0.92)'},
  cardArtFrozenScrim: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(1.5px)',
    color: 'rgba(226, 232, 240, 0.95)',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  // Merchant-category chips — allowed/blocked toggles.
  catChipRow: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)'},
  catChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    font: 'inherit',
    fontSize: 12,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  catChipAllowed: {
    border: 'var(--border-width) solid light-dark(#0B991F, #34C759)',
    backgroundColor: 'light-dark(rgba(11, 153, 31, 0.08), rgba(52, 199, 89, 0.14))',
    color: 'light-dark(#0B7A19, #4ADE80)',
  },
  catChipBlocked: {
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  txnAmount: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textAlign: 'end'},
  receiptMissing: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: 'light-dark(#B45309, #FBBF24)',
  },
  freezeNotice: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
};

// ---------------------------------------------------------------------------
// CATEGORY + DEPARTMENT META
// ---------------------------------------------------------------------------

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard `light-dark()` fallback pair.
const CAT_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  slate: 'light-dark(#64748B, #94A3B8)',
  amber: 'light-dark(#B45309, #FBBF24)',
} as const;

type CategoryId =
  | 'saas'
  | 'travel'
  | 'ads'
  | 'meals'
  | 'equip'
  | 'office'
  | 'other';

const CATEGORY_META: Record<CategoryId, {label: string; color: string}> = {
  saas: {label: 'Software & SaaS', color: CAT_COLOR.blue},
  travel: {label: 'Travel & lodging', color: CAT_COLOR.teal},
  ads: {label: 'Advertising', color: CAT_COLOR.purple},
  meals: {label: 'Meals', color: CAT_COLOR.orange},
  equip: {label: 'Equipment', color: CAT_COLOR.green},
  office: {label: 'Office supplies', color: CAT_COLOR.amber},
  other: {label: 'Other', color: CAT_COLOR.slate},
};

const CATEGORY_IDS: CategoryId[] = [
  'saas',
  'travel',
  'ads',
  'meals',
  'equip',
  'office',
  'other',
];

// Program-level July MTD spend split — the seven slices sum to exactly
// $84,210, the same figure the KPI block and the card table total to.
const PROGRAM_SPEND: [CategoryId, number][] = [
  ['saas', 31_480],
  ['travel', 18_940],
  ['ads', 14_120],
  ['meals', 9_635],
  ['equip', 6_210],
  ['office', 2_410],
  ['other', 1_415],
];

const PROGRAM_SPEND_TOTAL = PROGRAM_SPEND.reduce((sum, [, usd]) => sum + usd, 0);

type DeptId = 'eng' | 'design' | 'gtm' | 'ops' | 'fin' | 'people';

const DEPT_META: Record<DeptId, {label: string}> = {
  eng: {label: 'Engineering'},
  design: {label: 'Design'},
  gtm: {label: 'GTM'},
  ops: {label: 'Ops'},
  fin: {label: 'Finance'},
  people: {label: 'People'},
};

// Department card policy: which merchant categories authorize by default.
// The selected-card panel lets the admin flip individual chips per card.
const DEPT_BLOCKED: Record<DeptId, CategoryId[]> = {
  eng: ['travel', 'ads'],
  design: ['travel', 'ads', 'equip'],
  gtm: ['saas', 'equip'],
  ops: ['travel', 'ads'],
  fin: ['ads', 'equip'],
  people: ['ads', 'equip'],
};

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs (140-person platform
// company), July 2026. Program admin: Elena Voss (Finance lead).
// Totals reconcile: 42 active cards (28 physical + 14 virtual), 3 frozen,
// 2 pending activation (the mid-onboarding hires Ava Lindqvist and Ken
// Tanaka); MTD spend across all issued cards sums to exactly $84,210;
// pending receipts across cards sum to exactly 7.
// ---------------------------------------------------------------------------

type CardKind = 'physical' | 'virtual';
type CardStatus = 'active' | 'frozen' | 'pending';

// The Table generic requires rows assignable to Record<string, unknown>.
interface CardRow extends Record<string, unknown> {
  id: string;
  holder: string;
  role: string;
  dept: DeptId;
  office: string;
  kind: CardKind;
  last4: string;
  /** Monthly limit in whole USD. */
  limitUsd: number;
  /** July month-to-date spend in whole USD. */
  spentUsd: number;
  status: CardStatus;
  /** Transactions still missing a receipt (program KPI sums these). */
  pendingReceipts: number;
}

// Compact fixture rows (tuple pattern, see office-shared-drive.tsx):
// [holder, role, dept, office, kind, last4, limitUsd, spentUsd, status,
//  pendingReceipts]
type CardSpec = [
  string,
  string,
  DeptId,
  string,
  CardKind,
  string,
  number,
  number,
  CardStatus,
  number,
];

const CARD_SPECS: CardSpec[] = [
  // ---- Engineering (12 active) ----
  ['Priya Raman', 'VP Engineering', 'eng', 'SF HQ', 'physical', '0417', 12_000, 3_480, 'active', 0],
  ['Marcus Webb', 'Platform lead', 'eng', 'SF HQ', 'physical', '7302', 8_000, 2_960, 'active', 1],
  ['Lena Kovac', 'Backend engineer', 'eng', 'Lisbon', 'physical', '1189', 4_000, 1_240, 'active', 0],
  ['Ravi Menon', 'Infra engineer', 'eng', 'SF HQ', 'physical', '5546', 6_000, 2_180, 'active', 0],
  ['Owen Blake', 'Product engineer', 'eng', 'Remote-US', 'physical', '9034', 4_000, 940, 'active', 0],
  ['Mira Chen', 'Frontend engineer', 'eng', 'SF HQ', 'virtual', '2678', 4_000, 1_620, 'active', 0],
  ['Diego Suarez', 'Mobile engineer', 'eng', 'Lisbon', 'physical', '8153', 4_000, 880, 'active', 0],
  ['Hana Yoshida', 'Data engineer', 'eng', 'Remote-US', 'physical', '3390', 4_000, 1_310, 'active', 0],
  ['Peter Lindgren', 'Site reliability', 'eng', 'Lisbon', 'virtual', '6725', 4_000, 720, 'active', 0],
  ['Tara Iyer', 'Security engineer', 'eng', 'SF HQ', 'physical', '0942', 4_000, 1_450, 'active', 0],
  ['Cole Barrett', 'QA engineer', 'eng', 'Remote-US', 'physical', '4468', 4_000, 640, 'active', 0],
  ['Yusuf Demir', 'ML engineer', 'eng', 'SF HQ', 'virtual', '7791', 4_000, 1_090, 'active', 0],
  // ---- Design (6 active) ----
  ['Sofia Ortiz', 'Design lead', 'design', 'SF HQ', 'physical', '2216', 6_000, 2_140, 'active', 0],
  ['Iris Kim', 'Product designer', 'design', 'SF HQ', 'virtual', '5583', 4_000, 980, 'active', 0],
  ['Malik Jones', 'Brand designer', 'design', 'Remote-US', 'physical', '8830', 4_000, 1_120, 'active', 0],
  ['Freya Holm', 'UX researcher', 'design', 'Lisbon', 'physical', '1057', 2_500, 860, 'active', 0],
  ['Leo Marchetti', 'Motion designer', 'design', 'Lisbon', 'physical', '6349', 4_000, 1_340, 'active', 1],
  ['Nina Petrova', 'Content designer', 'design', 'Remote-US', 'virtual', '9902', 2_500, 740, 'active', 0],
  // ---- GTM (13 active) ----
  ['Jonah Fields', 'Field marketing lead', 'gtm', 'SF HQ', 'physical', '4821', 10_000, 8_740, 'active', 1],
  ['Claire Dubois', 'Demand gen manager', 'gtm', 'Lisbon', 'virtual', '3184', 6_000, 3_420, 'active', 2],
  ['Sam Whitaker', 'Account executive', 'gtm', 'Remote-US', 'physical', '7466', 6_000, 2_980, 'active', 1],
  ['Aisha Bello', 'Account executive', 'gtm', 'SF HQ', 'physical', '0538', 6_000, 2_210, 'active', 0],
  ['Victor Hsu', 'Growth marketer', 'gtm', 'Remote-US', 'virtual', '4715', 6_000, 1_870, 'active', 0],
  ['Paige Connors', 'Events manager', 'gtm', 'SF HQ', 'physical', '8092', 6_000, 2_540, 'active', 0],
  ['Rob Ellison', 'Sales engineer', 'gtm', 'Remote-US', 'physical', '2361', 4_000, 1_980, 'active', 0],
  ['Maya Singh', 'Partnerships lead', 'gtm', 'SF HQ', 'virtual', '5920', 6_000, 3_160, 'active', 0],
  ['Ethan Brooks', 'SDR manager', 'gtm', 'Remote-US', 'physical', '9247', 4_000, 1_420, 'active', 0],
  ['Lucia Ferrer', 'Account executive', 'gtm', 'Lisbon', 'physical', '1673', 6_000, 2_670, 'active', 0],
  ['Grant Osei', 'Solutions consultant', 'gtm', 'SF HQ', 'physical', '6018', 4_000, 1_740, 'active', 0],
  ['Zoe Albright', 'Lifecycle marketer', 'gtm', 'Remote-US', 'virtual', '3845', 4_000, 2_350, 'active', 0],
  ['Felix Navarro', 'Account executive', 'gtm', 'Lisbon', 'physical', '7134', 6_000, 1_910, 'active', 0],
  // ---- Ops (5 active) ----
  ['Tom Okonkwo', 'IT admin', 'ops', 'SF HQ', 'virtual', '0289', 8_000, 6_840, 'active', 1],
  ['Gwen Foster', 'Workplace manager', 'ops', 'SF HQ', 'physical', '4506', 2_500, 1_230, 'active', 0],
  ['Harold Nkemelu', 'Facilities coordinator', 'ops', 'SF HQ', 'physical', '8867', 2_500, 940, 'active', 0],
  ['Sana Qureshi', 'IT support', 'ops', 'Lisbon', 'virtual', '2954', 2_500, 1_180, 'active', 0],
  ['Bram Visser', 'Logistics coordinator', 'ops', 'Lisbon', 'physical', '6631', 2_500, 760, 'active', 0],
  // ---- Finance (3 active) ----
  ['Elena Voss', 'Finance lead', 'fin', 'SF HQ', 'physical', '1408', 6_000, 1_480, 'active', 0],
  ['Miles Grady', 'Accountant', 'fin', 'Remote-US', 'virtual', '5779', 2_500, 620, 'active', 0],
  ['Ingrid Sol', 'AP specialist', 'fin', 'SF HQ', 'physical', '9316', 2_500, 540, 'active', 0],
  // ---- People (3 active) ----
  ['Dana Whitfield', 'People Ops', 'people', 'SF HQ', 'physical', '0163', 4_000, 1_860, 'active', 0],
  ['April Tan', 'Recruiter', 'people', 'Remote-US', 'virtual', '3527', 2_500, 980, 'active', 0],
  ['Noel Baptiste', 'People partner', 'people', 'Lisbon', 'virtual', '7940', 2_500, 720, 'active', 0],
  // ---- Frozen (3) — spend accrued before the freeze stays in MTD ----
  ['Jules Hartman', 'Contract engineer', 'eng', 'Remote-US', 'physical', '2085', 4_000, 1_580, 'frozen', 0],
  ['Wes Calder', 'Contract marketer', 'gtm', 'Remote-US', 'virtual', '6294', 6_000, 2_130, 'frozen', 0],
  ['Rita Alves', 'Office coordinator', 'ops', 'Lisbon', 'physical', '8412', 2_500, 670, 'frozen', 0],
  // ---- Pending activation (2) — the mid-onboarding hires; never active ----
  ['Ava Lindqvist', 'Product engineer', 'eng', 'SF HQ', 'physical', '1750', 4_000, 0, 'pending', 0],
  ['Ken Tanaka', 'Field marketer', 'gtm', 'Remote-US', 'virtual', '5038', 4_000, 0, 'pending', 0],
];

const INITIAL_CARDS: CardRow[] = CARD_SPECS.map(
  ([holder, role, dept, office, kind, last4, limitUsd, spentUsd, status, pendingReceipts]) => ({
    id: `c-${last4}`,
    holder,
    role,
    dept,
    office,
    kind,
    last4,
    limitUsd,
    spentUsd,
    status,
    pendingReceipts,
  }),
);

// ---------------------------------------------------------------------------
// TRANSACTIONS — per-card July ledgers. Handcrafted ledgers for the
// featured cards sum to the exact cent against the card's MTD spend and
// carry exactly `pendingReceipts` missing-receipt rows; every other card
// gets a deterministic 4-way split of its MTD spend across its
// department's standard merchants, so every ledger reconciles.
// ---------------------------------------------------------------------------

interface Txn {
  id: string;
  merchant: string;
  category: CategoryId;
  amountCents: number;
  at: string;
  hasReceipt: boolean;
}

// Newest first. Sums verified: Jonah 874000¢, Tom 684000¢, Marcus
// 296000¢, Claire 342000¢ — each equals the card row's spentUsd × 100.
const LEDGERS: Record<string, Txn[]> = {
  'c-4821': [
    {id: 't1', merchant: 'Uber — airport transfers', category: 'travel', amountCents: 12_480, at: '2026-07-03T09:12:00Z', hasReceipt: true},
    {id: 't2', merchant: 'Osteria Vico — client dinner', category: 'meals', amountCents: 48_620, at: '2026-07-02T20:45:00Z', hasReceipt: false},
    {id: 't3', merchant: 'LinkedIn Ads — July field campaign', category: 'ads', amountCents: 150_000, at: '2026-07-02T16:20:00Z', hasReceipt: true},
    {id: 't4', merchant: 'Hilton Austin — 3 nights', category: 'travel', amountCents: 128_640, at: '2026-07-02T07:35:00Z', hasReceipt: true},
    {id: 't5', merchant: 'United Airlines — SFO → AUS', category: 'travel', amountCents: 184_260, at: '2026-07-01T14:10:00Z', hasReceipt: true},
    {id: 't6', merchant: 'SaaStr Annual — booth sponsorship', category: 'ads', amountCents: 350_000, at: '2026-07-01T08:55:00Z', hasReceipt: true},
  ],
  'c-0289': [
    {id: 't1', merchant: '1Password — business seats', category: 'saas', amountCents: 47_440, at: '2026-07-03T08:40:00Z', hasReceipt: true},
    {id: 't2', merchant: 'Apple Store — USB-C docks', category: 'equip', amountCents: 76_310, at: '2026-07-02T14:30:00Z', hasReceipt: false},
    {id: 't3', merchant: 'Zoom — annual renewal', category: 'saas', amountCents: 87_450, at: '2026-07-02T10:05:00Z', hasReceipt: true},
    {id: 't4', merchant: 'Datadog — July invoice', category: 'saas', amountCents: 174_000, at: '2026-07-01T15:45:00Z', hasReceipt: true},
    {id: 't5', merchant: 'Figma — org annual renewal', category: 'saas', amountCents: 298_800, at: '2026-07-01T09:20:00Z', hasReceipt: true},
  ],
  'c-7302': [
    {id: 't1', merchant: "O'Reilly — team learning", category: 'saas', amountCents: 30_400, at: '2026-07-03T08:05:00Z', hasReceipt: true},
    {id: 't2', merchant: 'Souvla — platform team lunch', category: 'meals', amountCents: 26_360, at: '2026-07-02T13:15:00Z', hasReceipt: false},
    {id: 't3', merchant: 'CircleCI — performance plan', category: 'saas', amountCents: 91_240, at: '2026-07-02T09:30:00Z', hasReceipt: true},
    {id: 't4', merchant: 'GitHub — 52 seats', category: 'saas', amountCents: 148_000, at: '2026-07-01T10:05:00Z', hasReceipt: true},
  ],
  'c-3184': [
    {id: 't1', merchant: 'LinkedIn Ads — retargeting', category: 'ads', amountCents: 31_200, at: '2026-07-03T09:05:00Z', hasReceipt: true},
    {id: 't2', merchant: 'Fábrica Coffee — client meeting', category: 'meals', amountCents: 17_880, at: '2026-07-02T16:35:00Z', hasReceipt: true},
    {id: 't3', merchant: 'Vistaprint — booth kit reprint', category: 'ads', amountCents: 48_690, at: '2026-07-02T11:50:00Z', hasReceipt: false},
    {id: 't4', merchant: 'TAP Air Portugal — LIS → MAD', category: 'travel', amountCents: 84_230, at: '2026-07-01T18:25:00Z', hasReceipt: false},
    {id: 't5', merchant: 'Google Ads — July budget', category: 'ads', amountCents: 160_000, at: '2026-07-01T09:40:00Z', hasReceipt: true},
  ],
};

/** Department-standard merchants used by the deterministic fallback split. */
const DEPT_MERCHANTS: Record<DeptId, {merchant: string; category: CategoryId}[]> = {
  eng: [
    {merchant: 'AWS — dev account', category: 'saas'},
    {merchant: 'GitHub — add-on seats', category: 'saas'},
    {merchant: 'Apple Store — peripherals', category: 'equip'},
    {merchant: 'DoorDash — team lunch', category: 'meals'},
  ],
  design: [
    {merchant: 'Adobe Creative Cloud', category: 'saas'},
    {merchant: 'Framer — team plan', category: 'saas'},
    {merchant: 'Blue Bottle — research coffee', category: 'meals'},
    {merchant: 'Muji — sketch supplies', category: 'office'},
  ],
  gtm: [
    {merchant: 'United Airlines — customer visit', category: 'travel'},
    {merchant: 'Marriott — 2 nights', category: 'travel'},
    {merchant: 'LinkedIn Ads — pipeline campaign', category: 'ads'},
    {merchant: 'Corner Bistro — client dinner', category: 'meals'},
  ],
  ops: [
    {merchant: 'Zoom — webinar add-on', category: 'saas'},
    {merchant: 'Uline — mailers & labels', category: 'office'},
    {merchant: 'Apple Store — spare chargers', category: 'equip'},
    {merchant: 'Staples — office restock', category: 'office'},
  ],
  fin: [
    {merchant: 'Carta — admin seats', category: 'saas'},
    {merchant: 'NetSuite — module add-on', category: 'saas'},
    {merchant: 'FedEx — document courier', category: 'other'},
    {merchant: 'Pret A Manger — audit lunch', category: 'meals'},
  ],
  people: [
    {merchant: 'Greenhouse — sourcing credits', category: 'saas'},
    {merchant: 'Lattice — add-on seats', category: 'saas'},
    {merchant: 'Ezcater — onboarding lunch', category: 'meals'},
    {merchant: 'FedEx — offer packets', category: 'other'},
  ],
};

const FALLBACK_DATES = [
  '2026-07-03T08:50:00Z',
  '2026-07-02T15:35:00Z',
  '2026-07-02T10:15:00Z',
  '2026-07-01T11:25:00Z',
];

/**
 * Deterministic fallback ledger: a fixed 42 / 26 / 19 / 13% split of the
 * card's MTD spend (last row takes the rounding remainder, so the four
 * rows always sum to the exact cent). The newest `pendingReceipts` rows
 * are flagged missing so the table's receipt column always agrees.
 */
function fallbackLedger(card: CardRow): Txn[] {
  const totalCents = card.spentUsd * 100;
  if (totalCents === 0) {
    return [];
  }
  const a = Math.round(totalCents * 0.42);
  const b = Math.round(totalCents * 0.26);
  const c = Math.round(totalCents * 0.19);
  const amounts = [a, b, c, totalCents - a - b - c];
  const merchants = DEPT_MERCHANTS[card.dept];
  return amounts.map((amountCents, index) => ({
    id: `t${index + 1}`,
    merchant: merchants[index].merchant,
    category: merchants[index].category,
    amountCents,
    at: FALLBACK_DATES[index],
    hasReceipt: index >= card.pendingReceipts,
  }));
}

function ledgerFor(card: CardRow): Txn[] {
  return LEDGERS[card.id] ?? fallbackLedger(card);
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function fmtUsd(usd: number): string {
  return `$${usd.toLocaleString('en-US')}`;
}

function fmtCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function firstName(person: string): string {
  return person.split(' ')[0];
}

/** Default per-transaction limit derived from the card's monthly tier. */
function perTxnDefault(limitUsd: number): number {
  if (limitUsd >= 10_000) {
    return 2_500;
  }
  if (limitUsd >= 8_000) {
    return 2_000;
  }
  if (limitUsd >= 6_000) {
    return 1_500;
  }
  if (limitUsd >= 4_000) {
    return 1_000;
  }
  return 500;
}

/** Base allow/block policy for a card (before per-card chip overrides). */
function isCategoryAllowedByPolicy(card: CardRow, category: CategoryId): boolean {
  return !DEPT_BLOCKED[card.dept].includes(category);
}

const STATUS_TOKEN: Record<CardStatus, {label: string; color: 'green' | 'blue' | 'yellow'}> = {
  active: {label: 'Active', color: 'green'},
  frozen: {label: 'Frozen', color: 'blue'},
  pending: {label: 'Pending', color: 'yellow'},
};

// Donut geometry — one shared conic-gradient string derived from the
// program split (slices are % of the $84,210 total, largest first).
const DONUT_GRADIENT = (() => {
  let cursor = 0;
  const stops = PROGRAM_SPEND.map(([categoryId, usd]) => {
    const start = cursor;
    cursor += (usd / PROGRAM_SPEND_TOTAL) * 100;
    return `${CATEGORY_META[categoryId].color} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
})();

// ---------------------------------------------------------------------------
// PROGRAM RAIL — KPI blocks + spend-by-category donut. Every figure is
// derived from the live card rows so freezes re-reconcile instantly.
// ---------------------------------------------------------------------------

function KpiBlock({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: 'warning';
}) {
  return (
    <div style={styles.kpiBlock}>
      <VStack gap={1}>
        {/* No maxLines: the 280 rail halves are narrow — wrap beats an
            ellipsis on program figures. */}
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <HStack gap={1} vAlign="center">
          {tone === 'warning' ? (
            <Icon icon={TriangleAlertIcon} size="sm" color="warning" />
          ) : null}
          <Heading level={3}>
            <span style={styles.kpiValue}>{value}</span>
          </Heading>
        </HStack>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {detail}
        </Text>
      </VStack>
    </div>
  );
}

function SpendDonut() {
  return (
    <VStack gap={3}>
      <div style={styles.donutWrap}>
        <div
          style={{...styles.donutRing, background: DONUT_GRADIENT}}
          role="img"
          aria-label={`Spend by category donut: ${PROGRAM_SPEND.map(
            ([categoryId, usd]) => `${CATEGORY_META[categoryId].label} ${fmtUsd(usd)}`,
          ).join(', ')}`}
        />
        <div style={styles.donutCenter}>
          <Text type="label" size="lg" hasTabularNumbers>
            {fmtUsd(PROGRAM_SPEND_TOTAL)}
          </Text>
          <Text type="supporting" color="secondary">
            July MTD
          </Text>
        </div>
      </div>
      <VStack gap={1}>
        {PROGRAM_SPEND.map(([categoryId, usd]) => {
          const meta = CATEGORY_META[categoryId];
          const pct = ((usd / PROGRAM_SPEND_TOTAL) * 100).toFixed(1);
          return (
            <HStack key={categoryId} gap={2} vAlign="center">
              <span style={{...styles.legendDot, backgroundColor: meta.color}} />
              <StackItem size="fill" style={{minWidth: 0}}>
                <Text type="supporting" maxLines={1}>
                  {meta.label}
                </Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {pct}%
              </Text>
              <span style={{...styles.legendAmount, minWidth: 64}}>
                <Text type="supporting" hasTabularNumbers>
                  {fmtUsd(usd)}
                </Text>
              </span>
            </HStack>
          );
        })}
      </VStack>
    </VStack>
  );
}

interface ProgramStats {
  issuedCount: number;
  activeCount: number;
  frozenCount: number;
  pendingCount: number;
  physicalCount: number;
  virtualCount: number;
  mtdUsd: number;
  receiptsPending: number;
  receiptCardCount: number;
}

function computeStats(cards: CardRow[]): ProgramStats {
  const active = cards.filter(card => card.status === 'active');
  return {
    issuedCount: cards.length,
    activeCount: active.length,
    frozenCount: cards.filter(card => card.status === 'frozen').length,
    pendingCount: cards.filter(card => card.status === 'pending').length,
    physicalCount: active.filter(card => card.kind === 'physical').length,
    virtualCount: active.filter(card => card.kind === 'virtual').length,
    mtdUsd: cards.reduce((sum, card) => sum + card.spentUsd, 0),
    receiptsPending: cards.reduce((sum, card) => sum + card.pendingReceipts, 0),
    receiptCardCount: cards.filter(card => card.pendingReceipts > 0).length,
  };
}

function ProgramRail({stats}: {stats: ProgramStats}) {
  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <VStack gap={4}>
          <VStack gap={0}>
            <Text type="label" size="sm" color="secondary">
              Program overview
            </Text>
            <Text type="supporting" color="secondary">
              July 2026 · limits reset Aug 1
            </Text>
          </VStack>
          <HStack gap={2}>
            <StackItem size="fill">
              {/* Rail halves fit ~14 supporting chars — details stay short;
                  the physical/virtual split lives on the toolbar chips. */}
              <KpiBlock
                label="Active cards"
                value={String(stats.activeCount)}
                detail={`of ${stats.issuedCount} issued`}
              />
            </StackItem>
            <StackItem size="fill">
              <KpiBlock
                label="MTD spend"
                value={fmtUsd(stats.mtdUsd)}
                detail={`all ${stats.issuedCount} cards`}
              />
            </StackItem>
          </HStack>
          <HStack gap={2}>
            <StackItem size="fill">
              <KpiBlock
                label="Receipts due"
                value={String(stats.receiptsPending)}
                detail={`across ${stats.receiptCardCount} cards`}
                tone={stats.receiptsPending > 0 ? 'warning' : undefined}
              />
            </StackItem>
            <StackItem size="fill">
              <KpiBlock
                label="Frozen cards"
                value={String(stats.frozenCount)}
                detail="auths declined"
              />
            </StackItem>
          </HStack>
          <Divider />
          <VStack gap={3}>
            <Text type="label">Spend by category</Text>
            <SpendDonut />
          </VStack>
        </VStack>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CARD TABLE — cells and columns. Fixed-width columns use pixel() so the
// header carries both width and minWidth (Table cells have max-width: 0).
// ---------------------------------------------------------------------------

function MiniCardChip({card}: {card: CardRow}) {
  return (
    <span
      style={{
        ...styles.miniCard,
        ...(card.kind === 'virtual' ? styles.miniCardVirtual : null),
        ...(card.status === 'frozen' ? styles.miniCardFrozen : null),
      }}
      aria-label={`${card.kind} card ending ${card.last4}`}>
      <span style={styles.miniCardBrand}>Kestrel</span>
      <span style={styles.miniCardDigits}>•• {card.last4}</span>
    </span>
  );
}

function HolderCell({card}: {card: CardRow}) {
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={card.holder} size="small" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {card.holder}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {card.role} · {DEPT_META[card.dept].label}
          </Text>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function LimitCell({card}: {card: CardRow}) {
  const ratio = card.limitUsd === 0 ? 0 : card.spentUsd / card.limitUsd;
  return (
    <VStack gap={1} style={styles.limitCell}>
      {/* Footgun: ProgressBar enforces minWidth 48 — the row meter
          overrides it so the column can never blow out. */}
      <ProgressBar
        label={`${card.holder} monthly limit usage`}
        isLabelHidden
        value={card.spentUsd}
        max={card.limitUsd}
        variant={ratio >= 0.85 ? 'error' : 'neutral'}
        style={styles.usageBar}
      />
      <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
        {fmtUsd(card.spentUsd)} of {fmtUsd(card.limitUsd)}
      </Text>
    </VStack>
  );
}

function ReceiptsCell({card}: {card: CardRow}) {
  if (card.status === 'pending') {
    return (
      <Text type="supporting" color="secondary">
        —
      </Text>
    );
  }
  if (card.pendingReceipts > 0) {
    return (
      <span style={styles.receiptMissing}>
        <Icon icon={ReceiptTextIcon} size="xsm" color="inherit" />
        <Text type="supporting" color="inherit" hasTabularNumbers>
          {card.pendingReceipts} missing
        </Text>
      </span>
    );
  }
  return (
    <HStack gap={1} vAlign="center">
      <Icon icon={CheckCircle2Icon} size="xsm" color="success" />
      <Text type="supporting" color="secondary">
        All in
      </Text>
    </HStack>
  );
}

function buildColumns(isCompact: boolean): TableColumn<CardRow>[] {
  const columns: TableColumn<CardRow>[] = [
    {
      key: 'holder',
      header: 'Cardholder',
      width: proportional(2, {minWidth: 190}),
      sortable: true,
      renderCell: (card: CardRow) => <HolderCell card={card} />,
    },
    {
      // Kind is carried by the chip itself (slate plastic = physical,
      // indigo = virtual, plus the aria-label) — no side text, so the
      // column never wraps and the limit column stays in view.
      key: 'card',
      header: 'Card',
      width: pixel(88),
      renderCell: (card: CardRow) => <MiniCardChip card={card} />,
    },
    {
      key: 'limit',
      header: 'Monthly limit',
      width: pixel(168),
      sortable: {sortKey: 'limitUsd'},
      renderCell: (card: CardRow) => <LimitCell card={card} />,
    },
  ];
  if (!isCompact) {
    columns.push({
      key: 'spent',
      header: 'MTD spend',
      align: 'end',
      width: pixel(110),
      sortable: {sortKey: 'spentUsd'},
      renderCell: (card: CardRow) => (
        <Text type="body" hasTabularNumbers style={styles.numericCell}>
          {fmtUsd(card.spentUsd)}
        </Text>
      ),
    });
    columns.push({
      key: 'receipts',
      header: 'Receipts',
      width: pixel(104),
      renderCell: (card: CardRow) => <ReceiptsCell card={card} />,
    });
  }
  columns.push({
    key: 'status',
    header: 'Status',
    width: pixel(92),
    renderCell: (card: CardRow) => {
      const meta = STATUS_TOKEN[card.status];
      return <Token size="sm" color={meta.color} label={meta.label} />;
    },
  });
  return columns;
}

// ---------------------------------------------------------------------------
// SELECTED-CARD PANEL — card art, freeze affordance, per-transaction
// limit, merchant-category controls, and the July transaction ledger.
// ---------------------------------------------------------------------------

const PER_TXN_OPTIONS = [
  {value: '250', label: '$250'},
  {value: '500', label: '$500'},
  {value: '1000', label: '$1,000'},
  {value: '2500', label: '$2,500'},
  {value: '5000', label: '$5,000'},
];

function CardArt({card}: {card: CardRow}) {
  return (
    <div
      style={{
        ...styles.cardArt,
        ...(card.kind === 'virtual' ? styles.cardArtVirtual : null),
      }}>
      <div style={styles.cardArtSheen} />
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <span style={styles.cardArtBrand}>Kestrel Labs</span>
        </StackItem>
        {card.kind === 'virtual' ? (
          <SmartphoneIcon size={14} color="rgba(226, 232, 240, 0.75)" aria-hidden />
        ) : (
          <CreditCardIcon size={14} color="rgba(226, 232, 240, 0.75)" aria-hidden />
        )}
      </HStack>
      <span style={styles.cardArtDigits}>•••• •••• •••• {card.last4}</span>
      <HStack gap={3} vAlign="end">
        <StackItem size="fill">
          <VStack gap={0}>
            <span style={styles.cardArtLabel}>Cardholder</span>
            <span style={styles.cardArtValue}>{card.holder}</span>
          </VStack>
        </StackItem>
        <VStack gap={0}>
          <span style={styles.cardArtLabel}>Type</span>
          <span style={styles.cardArtValue}>
            {card.kind === 'virtual' ? 'Virtual' : 'Physical'}
          </span>
        </VStack>
      </HStack>
      {card.status === 'frozen' ? (
        <div style={styles.cardArtFrozenScrim}>
          <SnowflakeIcon size={16} aria-hidden />
          Frozen
        </div>
      ) : null}
    </div>
  );
}

function CategoryChips({
  card,
  isAllowed,
  onToggle,
}: {
  card: CardRow;
  isAllowed: (category: CategoryId) => boolean;
  onToggle: (category: CategoryId) => void;
}) {
  return (
    <VStack gap={2}>
      <div style={styles.catChipRow}>
        {CATEGORY_IDS.map(categoryId => {
          const allowed = isAllowed(categoryId);
          return (
            <button
              key={categoryId}
              type="button"
              aria-pressed={allowed}
              onClick={() => onToggle(categoryId)}
              style={{
                ...styles.catChip,
                ...(allowed ? styles.catChipAllowed : styles.catChipBlocked),
              }}>
              {allowed ? (
                <CheckIcon size={12} aria-hidden />
              ) : (
                <BanIcon size={12} aria-hidden />
              )}
              {CATEGORY_META[categoryId].label}
            </button>
          );
        })}
      </div>
      <Text type="supporting" color="secondary">
        Blocked categories decline at authorization. Changes apply to{' '}
        {firstName(card.holder)}&rsquo;s card only, starting with the next
        swipe.
      </Text>
    </VStack>
  );
}

function TxnList({card}: {card: CardRow}) {
  const txns = ledgerFor(card);
  if (txns.length === 0) {
    return (
      <EmptyState
        isCompact
        icon={<Icon icon={ReceiptTextIcon} size="lg" />}
        title="No activity yet"
        description="This card has not been activated. Transactions appear here after the first authorization."
      />
    );
  }
  const totalCents = txns.reduce((sum, txn) => sum + txn.amountCents, 0);
  return (
    <VStack gap={2}>
      <List density="compact" hasDividers>
        {txns.map(txn => (
          <ListItem
            key={`${card.id}-${txn.id}`}
            label={txn.merchant}
            description={
              <VStack gap={0}>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {CATEGORY_META[txn.category].label} ·{' '}
                  <Timestamp value={txn.at} format="date_time" />
                </Text>
                {!txn.hasReceipt ? (
                  <span style={styles.receiptMissing}>
                    <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
                    <Text type="supporting" color="inherit">
                      Receipt missing — holder nudged
                    </Text>
                  </span>
                ) : null}
              </VStack>
            }
            startContent={
              <span
                style={{
                  ...styles.legendDot,
                  backgroundColor: CATEGORY_META[txn.category].color,
                }}
              />
            }
            endContent={
              <HStack gap={2} vAlign="center">
                <span style={styles.txnAmount}>
                  <Text type="body" hasTabularNumbers>
                    {fmtCents(txn.amountCents)}
                  </Text>
                </span>
                {txn.hasReceipt ? (
                  <Icon
                    icon={CheckCircle2Icon}
                    size="sm"
                    color="success"
                    aria-label="Receipt attached"
                  />
                ) : (
                  <Icon
                    icon={TriangleAlertIcon}
                    size="sm"
                    color="warning"
                    aria-label="Receipt missing"
                  />
                )}
              </HStack>
            }
          />
        ))}
      </List>
      {/* Ledger total re-states the card's MTD figure to the cent. */}
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            {txns.length} transactions in July
          </Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Total {fmtCents(totalCents)}
        </Text>
      </HStack>
    </VStack>
  );
}

function CardDetailPanel({
  card,
  isCategoryAllowed,
  onToggleCategory,
  perTxnValue,
  onPerTxnChange,
  onRequestFreeze,
  onUnfreeze,
}: {
  card: CardRow | null;
  isCategoryAllowed: (card: CardRow, category: CategoryId) => boolean;
  onToggleCategory: (card: CardRow, category: CategoryId) => void;
  perTxnValue: (card: CardRow) => string;
  onPerTxnChange: (card: CardRow, value: string) => void;
  onRequestFreeze: (card: CardRow) => void;
  onUnfreeze: (card: CardRow) => void;
}) {
  if (card === null) {
    return (
      <div style={styles.detailScroll}>
        <EmptyState
          isCompact
          icon={<Icon icon={CreditCardIcon} size="lg" />}
          title="No card selected"
          description="Select a card in the table to review limits, merchant controls, and July activity."
        />
      </div>
    );
  }

  const statusMeta = STATUS_TOKEN[card.status];
  const availableUsd = Math.max(card.limitUsd - card.spentUsd, 0);

  return (
    <div style={styles.detailScroll}>
      <VStack gap={4}>
        <CardArt card={card} />

        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" style={{minWidth: 0}}>
              <Heading level={3}>{card.holder}</Heading>
            </StackItem>
            <Token size="sm" color={statusMeta.color} label={statusMeta.label} />
          </HStack>
          <Text type="supporting" color="secondary" maxLines={1}>
            {card.role} · {DEPT_META[card.dept].label} · {card.office}
          </Text>
        </VStack>

        {card.status === 'active' ? (
          <Button
            label="Freeze card"
            variant="secondary"
            size="sm"
            icon={<Icon icon={SnowflakeIcon} size="sm" />}
            onClick={() => onRequestFreeze(card)}
          />
        ) : card.status === 'frozen' ? (
          <div style={styles.freezeNotice}>
            <Icon icon={SnowflakeIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <VStack gap={2}>
                <Text type="supporting" color="secondary">
                  Frozen — every new authorization declines, including
                  recurring charges. July spend stays on the books.
                </Text>
                <Button
                  label="Unfreeze card"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={LockOpenIcon} size="sm" />}
                  onClick={() => onUnfreeze(card)}
                />
              </VStack>
            </StackItem>
          </div>
        ) : (
          <div style={styles.freezeNotice}>
            <Icon icon={TriangleAlertIcon} size="sm" color="warning" />
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Mid-onboarding — the card activates on {firstName(card.holder)}
                &rsquo;s start date and spend controls apply from the first
                swipe.
              </Text>
            </StackItem>
          </div>
        )}

        <Divider />

        <VStack gap={2}>
          <Text type="label">Limits</Text>
          <VStack gap={1}>
            <ProgressBar
              label="Monthly limit usage"
              isLabelHidden
              value={card.spentUsd}
              max={card.limitUsd}
              variant={card.spentUsd / card.limitUsd >= 0.85 ? 'error' : 'neutral'}
              style={{minWidth: 0}}
            />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {fmtUsd(card.spentUsd)} spent of {fmtUsd(card.limitUsd)} ·{' '}
              {fmtUsd(availableUsd)} available
            </Text>
          </VStack>
          <MetadataList columns={1} label={{position: 'start', width: 132}}>
            <MetadataListItem label="Monthly limit">
              <Text type="body" hasTabularNumbers>
                {fmtUsd(card.limitUsd)}
              </Text>
            </MetadataListItem>
            <MetadataListItem label="Per-transaction">
              <Selector
                label="Per-transaction limit"
                isLabelHidden
                options={PER_TXN_OPTIONS}
                value={perTxnValue(card)}
                onChange={value => onPerTxnChange(card, value)}
                size="sm"
                width={120}
              />
            </MetadataListItem>
            <MetadataListItem label="Card number">
              <Text type="body" hasTabularNumbers>
                •••• {card.last4}
              </Text>
            </MetadataListItem>
          </MetadataList>
        </VStack>

        <Divider />

        <VStack gap={2}>
          <Text type="label">Merchant categories</Text>
          <CategoryChips
            card={card}
            isAllowed={category => isCategoryAllowed(card, category)}
            onToggle={category => onToggleCategory(card, category)}
          />
        </VStack>

        <Divider />

        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label">Recent transactions</Text>
            </StackItem>
            {card.pendingReceipts > 0 ? (
              <Token
                size="sm"
                color="yellow"
                label={`${card.pendingReceipts} receipt${
                  card.pendingReceipts === 1 ? '' : 's'
                } missing`}
              />
            ) : null}
          </HStack>
          <TxnList card={card} />
        </VStack>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type StatusFilter = 'all' | CardStatus;

export default function FinCorporateCardsTemplate() {
  const [cards, setCards] = useState<CardRow[]>(INITIAL_CARDS);
  const [selectedId, setSelectedId] = useState<string | null>('c-4821');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [kindFilter, setKindFilter] = useState<CardKind | null>(null);
  const [query, setQuery] = useState('');
  const [catOverrides, setCatOverrides] = useState<
    Record<string, Partial<Record<CategoryId, boolean>>>
  >({});
  const [perTxnOverrides, setPerTxnOverrides] = useState<Record<string, string>>({});
  const [freezeTarget, setFreezeTarget] = useState<CardRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px drops the selected-card panel; <=900px
  // drops the rail (compact KPI chips appear) and two table columns.
  const isDetailsHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 900px)');

  const stats = useMemo(() => computeStats(cards), [cards]);

  // Status + type + search filter, derived during render.
  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return cards.filter(card => {
      if (statusFilter !== 'all' && card.status !== statusFilter) {
        return false;
      }
      if (kindFilter !== null && card.kind !== kindFilter) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return `${card.holder} ${card.role} ${card.last4}`
        .toLowerCase()
        .includes(needle);
    });
  }, [cards, statusFilter, kindFilter, query]);

  // Sort plugin — default biggest MTD spend first.
  const {sortedData, sortConfig} = useTableSortableState<CardRow>({
    data: visibleRows,
    defaultSort: [{sortKey: 'spentUsd', direction: 'descending'}],
    comparators: {
      holder: (a, b) => a.holder.localeCompare(b.holder),
      limitUsd: (a, b) => a.limitUsd - b.limitUsd,
      spentUsd: (a, b) => a.spentUsd - b.spentUsd,
    },
  });
  const sortPlugin = useTableSortable<CardRow>(sortConfig);

  // Row-click plugin: clicking a row makes it the selected-card subject.
  const activePlugin = useMemo<TablePlugin<CardRow>>(
    () => ({
      transformBodyRow: (props, item) => {
        const prevOnClick = props.htmlProps.onClick;
        const isActive = item.id === selectedId;
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            onClick: event => {
              prevOnClick?.(event);
              setSelectedId(item.id);
            },
            'aria-selected': isActive || undefined,
            style: {
              ...props.htmlProps.style,
              cursor: 'pointer',
              // Inset outline so the active row never bleeds onto neighbors.
              ...(isActive
                ? {boxShadow: 'inset 2px 0 0 var(--color-accent)'}
                : null),
            },
          },
        };
      },
    }),
    [selectedId],
  );

  const columns = useMemo(() => buildColumns(isCompact), [isCompact]);
  const selectedCard = cards.find(card => card.id === selectedId) ?? null;

  // ----- freeze / unfreeze -----
  const setStatus = (id: string, status: CardStatus) => {
    setCards(prev =>
      prev.map(card => (card.id === id ? {...card, status} : card)),
    );
  };

  const confirmFreeze = () => {
    if (freezeTarget === null) {
      return;
    }
    setStatus(freezeTarget.id, 'frozen');
    setAnnouncement(
      `Froze ${freezeTarget.holder}'s card ending ${freezeTarget.last4}`,
    );
    setFreezeTarget(null);
  };

  const unfreeze = (card: CardRow) => {
    setStatus(card.id, 'active');
    setAnnouncement(
      `Unfroze ${card.holder}'s card ending ${card.last4}`,
    );
  };

  // ----- merchant-category controls -----
  const isCategoryAllowed = (card: CardRow, category: CategoryId) =>
    catOverrides[card.id]?.[category] ??
    isCategoryAllowedByPolicy(card, category);

  const toggleCategory = (card: CardRow, category: CategoryId) => {
    const next = !isCategoryAllowed(card, category);
    setCatOverrides(prev => ({
      ...prev,
      [card.id]: {...prev[card.id], [category]: next},
    }));
    setAnnouncement(
      `${next ? 'Allowed' : 'Blocked'} ${CATEGORY_META[category].label} on ${
        card.holder
      }'s card`,
    );
  };

  // ----- per-transaction limit -----
  const perTxnValue = (card: CardRow) =>
    perTxnOverrides[card.id] ?? String(perTxnDefault(card.limitUsd));

  const changePerTxn = (card: CardRow, value: string) => {
    setPerTxnOverrides(prev => ({...prev, [card.id]: value}));
    setAnnouncement(
      `Per-transaction limit on ${card.holder}'s card set to ${fmtUsd(
        Number(value),
      )}`,
    );
  };

  // ----- header: brand, search, issue-card split action -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={CreditCardIcon} size="md" color="secondary" />
          <Heading level={1}>Corporate cards</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · Finance
          </Text>
        </HStack>
        <StackItem size="fill">
          <TextInput
            label="Search cards"
            isLabelHidden
            size="sm"
            width="100%"
            style={{maxWidth: 480}}
            placeholder="Search holders, roles, last 4…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        <DropdownMenu
          button={{
            label: 'Issue card',
            variant: 'primary',
            size: 'sm',
            icon: <Icon icon={PlusIcon} size="sm" color="inherit" />,
          }}
          hasChevron
          menuWidth={220}
          items={[
            {
              label: 'Physical card',
              icon: <Icon icon={CreditCardIcon} size="sm" color="inherit" />,
              onClick: () => {},
            },
            {
              label: 'Virtual card',
              icon: <Icon icon={SmartphoneIcon} size="sm" color="inherit" />,
              onClick: () => {},
            },
          ]}
        />
        {!isDetailsHidden && (
          <IconButton
            label={isDetailsOpen ? 'Hide card panel' : 'Show card panel'}
            tooltip={isDetailsOpen ? 'Hide card panel' : 'Show card panel'}
            size="sm"
            variant={isDetailsOpen ? 'secondary' : 'ghost'}
            icon={<Icon icon={PanelRightIcon} size="sm" />}
            onClick={() => setIsDetailsOpen(open => !open)}
          />
        )}
      </HStack>
    </LayoutHeader>
  );

  // ----- compact KPI chip strip (<=900px replaces the rail) -----
  const compactKpis = isCompact ? (
    <HStack gap={2} wrap="wrap" style={styles.compactKpis}>
      <span style={styles.compactKpiChip}>
        <Text type="supporting" hasTabularNumbers>
          {stats.activeCount} active
        </Text>
      </span>
      <span style={styles.compactKpiChip}>
        <Text type="supporting" hasTabularNumbers>
          {fmtUsd(stats.mtdUsd)} MTD
        </Text>
      </span>
      <span style={{...styles.compactKpiChip, ...styles.receiptMissing}}>
        <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
        <Text type="supporting" color="inherit" hasTabularNumbers>
          {stats.receiptsPending} receipts missing
        </Text>
      </span>
      <span style={styles.compactKpiChip}>
        <Text type="supporting" hasTabularNumbers>
          {stats.frozenCount} frozen
        </Text>
      </span>
    </HStack>
  ) : null;

  // ----- filter toolbar: status segments + physical/virtual split chips ---
  const typeChip = (kind: CardKind, count: number, label: string) => {
    const isOn = kindFilter === kind;
    return (
      <button
        type="button"
        aria-pressed={isOn}
        style={{...styles.typeChip, ...(isOn ? styles.typeChipOn : null)}}
        onClick={() => setKindFilter(isOn ? null : kind)}>
        {kind === 'virtual' ? (
          <SmartphoneIcon size={12} aria-hidden />
        ) : (
          <CreditCardIcon size={12} aria-hidden />
        )}
        {label} {count}
      </button>
    );
  };

  const contentToolbar = (
    <HStack gap={3} vAlign="center" style={styles.contentToolbar} wrap="wrap">
      <SegmentedControl
        label="Card status filter"
        value={statusFilter}
        onChange={value => setStatusFilter(value as StatusFilter)}
        size="sm">
        <SegmentedControlItem label="All" value="all" />
        <SegmentedControlItem label="Active" value="active" />
        <SegmentedControlItem label="Frozen" value="frozen" />
        <SegmentedControlItem label="Pending" value="pending" />
      </SegmentedControl>
      {/* Physical/virtual split chips double as type filters; the counts
          carry the Active-cards split (28 + 14 = 42). */}
      <HStack gap={2} vAlign="center">
        {typeChip('physical', stats.physicalCount, 'Physical')}
        {typeChip('virtual', stats.virtualCount, 'Virtual')}
      </HStack>
      <StackItem size="fill" />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {sortedData.length} of {cards.length} cards
      </Text>
    </HStack>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel
              width={280}
              padding={0}
              hasDivider
              label="Program overview">
              <ProgramRail stats={stats} />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              {compactKpis}
              {contentToolbar}
              <div style={styles.tableScroll}>
                <Table<CardRow>
                  data={sortedData}
                  columns={columns}
                  idKey="id"
                  density="balanced"
                  dividers="rows"
                  hasHover
                  plugins={{sort: sortPlugin, active: activePlugin}}
                  emptyState={
                    <div style={styles.tableEmpty}>
                      <EmptyState
                        isCompact
                        icon={<Icon icon={SearchIcon} size="lg" />}
                        title="No matching cards"
                        description="Try a different holder, role, or last-4 — or clear the status and type filters."
                      />
                    </div>
                  }
                />
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isDetailsHidden && isDetailsOpen ? (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              label="Selected card">
              <CardDetailPanel
                card={selectedCard}
                isCategoryAllowed={isCategoryAllowed}
                onToggleCategory={toggleCategory}
                perTxnValue={perTxnValue}
                onPerTxnChange={changePerTxn}
                onRequestFreeze={setFreezeTarget}
                onUnfreeze={unfreeze}
              />
            </LayoutPanel>
          ) : undefined
        }
      />

      <AlertDialog
        isOpen={freezeTarget !== null}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setFreezeTarget(null);
          }
        }}
        title={
          freezeTarget !== null
            ? `Freeze ${firstName(freezeTarget.holder)}'s card ••${
                freezeTarget.last4
              }?`
            : 'Freeze card?'
        }
        description="Every new authorization will decline immediately, including recurring SaaS charges on this card. July spend already on the books stays in program totals. You can unfreeze at any time."
        actionLabel="Freeze card"
        cancelLabel="Keep active"
        onAction={confirmFreeze}
      />
    </div>
  );
}
