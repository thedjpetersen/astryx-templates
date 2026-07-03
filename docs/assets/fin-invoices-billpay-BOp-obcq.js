var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs (140-person) AP
 *   inbox frozen at Fri Jul 3, 2026: 12 vendor invoices in integer cents
 *   whose subtotals reconcile across every panel (inbox 4 / $26,520.00,
 *   scheduled 5 / $95,400.00, paid 3 / $29,290.00; the 4-week cash-out
 *   strip sums the same unpaid rows to $121,920.00), fixed ISO dates,
 *   per-invoice OCR extracts with fixed confidence scores, and a styled-div
 *   attachment facsimile (no network media). No clocks, no randomness, no
 *   locale money APIs — aging labels derive from the frozen Jul 3 instant.
 * @output Bill Pay & Invoice Inbox — the Finance-pillar accounts-payable
 *   console. An invoice inbox Table (vendor monogram + memo, invoice #,
 *   right-aligned amount, due date with aging color, status pill:
 *   Captured / Needs review / Scheduled / Paid) filtered by a segmented
 *   status control and vendor search; a cash-out forecast strip of four
 *   labeled week bars (scheduled vs projected outflow, totals reconcile
 *   with the table); and a 380px review panel for the active invoice: an
 *   OCR-extract section (email-attachment thumbnail beside extracted
 *   fields, low-confidence fields amber-highlighted with working Confirm
 *   actions), a three-way-match indicator (PO + receipt + invoice tiles
 *   with a flagged freight variance and a working approve-variance
 *   action), a payment-scheduling section (early-pay-discount optimizer
 *   note, ACH/wire/check method control with fee captions, gated
 *   Approve & schedule that advances the invoice to Scheduled), an
 *   approval-chain status list, and coding metadata.
 * @position Page template; emitted by \`astryx template fin-invoices-billpay\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | content (filter toolbar, cash-out forecast strip, invoice
 *   Table — one vertical scroller) | end panel 380 (invoice review,
 *   scrolls independently).
 * Container policy: app-shell finance-console archetype — frame rows and
 *   panels only; no Cards. The forecast strip, extract thumbnail, match
 *   tiles, scheduling section, and approval steps are styled divs inside
 *   frame regions.
 * Color policy: token-pure everywhere; the only literals are (a) the
 *   repo-standard \`light-dark()\` fallback pairs on the data-viz
 *   categorical tokens (the demo does not inject
 *   \`--color-data-categorical-*\`) used for vendor monograms and forecast
 *   bars, (b) \`light-dark()\` aging pairs (overdue red, due-soon amber)
 *   and the amber low-confidence tint, and (c) the attachment-facsimile
 *   page surface — each pair keeps AA contrast in both schemes.
 *
 * Responsive contract:
 * - > 1180px: content + 380px review end panel.
 * - <= 1180px: the end panel is dropped; the same review sections render
 *   inline below the table so the active invoice stays actionable.
 * - <= 860px: the table drops the Invoice # column (the number stays in
 *   the review panel) and the forecast strip + header rows wrap instead
 *   of clipping; the table scrolls horizontally below its column floor
 *   rather than crushing numeric cells.
 * - Content and end panel scroll independently (\`minHeight: 0\` down every
 *   flex chain); the header and filter toolbar are pinned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  AlertTriangleIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CheckIcon,
  CircleIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  InboxIcon,
  LandmarkIcon,
  MailIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PaperclipIcon,
  ReceiptTextIcon,
  ScanTextIcon,
  SearchIcon,
  SparklesIcon,
  UploadIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {
  Table,
  pixel,
  proportional,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const FORECAST_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const FORECAST_BLUE_TINT = 'light-dark(rgba(1, 113, 227, 0.22), rgba(76, 158, 255, 0.26))';

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentToolbar: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-4)'},
  contentScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 var(--spacing-4) var(--spacing-4)'},
  // Pixel columns keep a floor; narrow viewports scroll the table
  // horizontally instead of crushing numeric cells.
  tableWrap: {overflowX: 'auto'},
  // Forecast strip ---------------------------------------------------------
  forecastStrip: {
    display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap', alignItems: 'stretch',
    padding: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)', backgroundColor: 'var(--color-background-surface)',
  },
  // Flex sizing only — VStack owns direction/gap. (An \`alignItems: flex-end\`
  // here once right-aligned and hug-width'ed the whole bars block.)
  forecastBars: {flex: '1 1 360px', minWidth: 300},
  forecastWeek: {flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0},
  forecastBarTrack: {display: 'flex', flexDirection: 'column-reverse', height: 64, justifyContent: 'flex-start'},
  forecastBarScheduled: {borderRadius: '2px 2px 0 0', backgroundColor: FORECAST_BLUE},
  forecastBarProjected: {
    borderRadius: '2px 2px 0 0', backgroundColor: FORECAST_BLUE_TINT,
    border: \`1px dashed \${FORECAST_BLUE}\`, borderBottom: 'none',
  },
  // Bounded basis (not content width) so the totals column shares the row
  // with the bars instead of wrapping below them; captions wrap inside.
  forecastTotals: {
    flex: '0 1 220px', minWidth: 200, paddingInlineStart: 'var(--spacing-4)',
    borderInlineStart: 'var(--border-width) solid var(--color-border)',
  },
  legendSwatchScheduled: {width: 10, height: 10, borderRadius: 2, flexShrink: 0, backgroundColor: FORECAST_BLUE},
  legendSwatchProjected: {
    width: 10, height: 10, borderRadius: 2, flexShrink: 0,
    backgroundColor: FORECAST_BLUE_TINT, border: \`1px dashed \${FORECAST_BLUE}\`,
  },
  // Table cells --------------------------------------------------------------
  monogram: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
    fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
  },
  monogramLg: {width: 40, height: 40, fontSize: 14, borderRadius: 10},
  invoiceNumber: {
    fontFamily: 'var(--font-family-code, monospace)', fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap', fontSize: 12,
  },
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  agingText: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Review panel ---------------------------------------------------------------
  detailScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  detailInline: {
    marginTop: 'var(--spacing-4)', border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)', padding: 'var(--spacing-4)',
  },
  sectionBox: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)', padding: 'var(--spacing-3)',
  },
  // Attachment facsimile — an email-attachment PDF page rendered as styled
  // divs (no network media). Page surface is an intentional literal pair.
  thumb: {
    width: 96, height: 122, flexShrink: 0, borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'light-dark(#FFFFFF, #1E2530)', boxShadow: 'var(--shadow-low)',
    padding: 8, display: 'flex', flexDirection: 'column', gap: 5,
  },
  thumbBrand: {height: 12, width: '55%', borderRadius: 2},
  thumbLine: {height: 4, borderRadius: 2, backgroundColor: 'light-dark(#E2E8F0, #3A4552)'},
  thumbRule: {height: 1, backgroundColor: 'light-dark(#E2E8F0, #3A4552)', marginTop: 2},
  thumbTotal: {
    height: 5, width: '38%', borderRadius: 2, alignSelf: 'flex-end',
    backgroundColor: 'light-dark(#64748B, #94A3B8)',
  },
  // OCR extract fields — amber low-confidence tint (AA in both schemes).
  fieldRow: {padding: '4px 6px', borderRadius: 6, minWidth: 0},
  fieldRowFlagged: {
    padding: '4px 6px', borderRadius: 6, minWidth: 0,
    backgroundColor: 'light-dark(rgba(180, 83, 9, 0.08), rgba(251, 191, 36, 0.10))',
    boxShadow: 'inset 0 0 0 1px light-dark(rgba(180, 83, 9, 0.45), rgba(251, 191, 36, 0.40))',
  },
  confidenceChip: {
    fontSize: 11, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
    color: 'light-dark(#B45309, #FBBF24)',
  },
  // Three-way match -----------------------------------------------------------
  matchGrid: {display: 'flex', gap: 'var(--spacing-2)'},
  matchTile: {
    flex: 1, minWidth: 0, padding: 'var(--spacing-2)', borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  matchTileVariance: {
    flex: 1, minWidth: 0, padding: 'var(--spacing-2)', borderRadius: 6,
    border: '1px solid light-dark(rgba(180, 83, 9, 0.45), rgba(251, 191, 36, 0.40))',
    backgroundColor: 'light-dark(rgba(180, 83, 9, 0.08), rgba(251, 191, 36, 0.10))',
  },
  varianceBanner: {
    display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)', borderRadius: 6,
    backgroundColor: 'light-dark(rgba(180, 83, 9, 0.08), rgba(251, 191, 36, 0.10))',
  },
  // Payment scheduling ----------------------------------------------------------
  optimizerNote: {
    display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)', borderRadius: 6,
    backgroundColor: 'var(--color-background-muted)',
  },
  // Approval chain -------------------------------------------------------------
  stepRail: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    alignSelf: 'stretch', width: 20, flexShrink: 0,
  },
  stepConnector: {width: 2, flex: 1, backgroundColor: 'var(--color-border)'},
  visuallyHidden: {
    position: 'absolute', width: 1, height: 1, margin: -1,
    overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
  },
};

// ---------------------------------------------------------------------------
// COLOR CONSTANTS — data-viz categorical tokens are not injected by the
// demo; every use carries the repo-standard \`light-dark()\` fallback pair.
// Aging colors are intentional literals (AA in both schemes).
// ---------------------------------------------------------------------------

const CATEGORICAL = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  slate: 'light-dark(#475569, #94A3B8)',
} as const;

const AGING_OVERDUE = 'light-dark(#DC2626, #F87171)';
const AGING_DUE_SOON = 'light-dark(#B45309, #FBBF24)';
const MATCH_OK = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';

type VendorPalette = keyof typeof CATEGORICAL;

/** Monogram tint backgrounds keyed to the categorical palette. */
const MONOGRAM_BG: Record<VendorPalette, string> = {
  blue: 'light-dark(rgba(1, 113, 227, 0.12), rgba(76, 158, 255, 0.16))',
  purple: 'light-dark(rgba(107, 30, 253, 0.10), rgba(157, 107, 255, 0.16))',
  green: 'light-dark(rgba(11, 153, 31, 0.12), rgba(52, 199, 89, 0.16))',
  orange: 'light-dark(rgba(235, 110, 0, 0.12), rgba(255, 147, 48, 0.16))',
  teal: 'light-dark(rgba(14, 126, 139, 0.12), rgba(51, 184, 199, 0.16))',
  slate: 'light-dark(rgba(71, 85, 105, 0.12), rgba(148, 163, 184, 0.16))',
};

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs (140-person platform
// company). Signed-in user: Ruth Nakamura, AP specialist (Finance, 8-person
// department). Frozen "today": Fri Jul 3, 2026. All money in integer cents.
//
// Reconciliation (every figure repeats somewhere and must agree):
//   Inbox (captured + needs review)  4 invoices  $26,520.00
//   Scheduled                        5 invoices  $95,400.00
//   Paid (June–July)                 3 invoices  $29,290.00
//   Cash-out strip (next 4 weeks) = inbox + scheduled = $121,920.00
//     W1 Jul 6–12  $73,580.00 (sched 58,720 + projected 14,860 incl. the
//                   overdue Brightline invoice clamped into week 1)
//     W2 Jul 13–19 $11,660.00 (all projected)
//     W3 Jul 20–26 $12,500.00   W4 Jul 27–Aug 2 $24,180.00
// The strip is DERIVED from the invoice rows below, so it reconciles by
// construction.
// ---------------------------------------------------------------------------

const CURRENT_USER = 'Ruth Nakamura';
const TODAY = '2026-07-03';

type VendorId =
  | 'halcyon'
  | 'brightline'
  | 'orbit'
  | 'packetworks'
  | 'tagus'
  | 'meridian'
  | 'kite'
  | 'sentinel'
  | 'cirrus'
  | 'freshfork'
  | 'northgate';

interface VendorMeta {
  name: string;
  initials: string;
  palette: VendorPalette;
  category: string;
}

const VENDORS: Record<VendorId, VendorMeta> = {
  halcyon: {name: 'Halcyon Print Co', initials: 'HP', palette: 'orange', category: 'Print & production'},
  brightline: {name: 'Brightline Legal LLP', initials: 'BL', palette: 'slate', category: 'Legal services'},
  orbit: {name: 'Orbit Staffing', initials: 'OS', palette: 'green', category: 'Contract staffing'},
  packetworks: {name: 'PacketWorks Fiber', initials: 'PW', palette: 'teal', category: 'Connectivity'},
  tagus: {name: 'Tagus Workspaces', initials: 'TW', palette: 'teal', category: 'Office lease — Lisbon'},
  meridian: {name: 'Meridian Benefits Group', initials: 'MB', palette: 'purple', category: 'Benefits carrier'},
  kite: {name: 'Kite Hardware Co', initials: 'KH', palette: 'blue', category: 'IT hardware'},
  sentinel: {name: 'Sentinel Compliance', initials: 'SC', palette: 'orange', category: 'Audit & compliance'},
  cirrus: {name: 'Cirrus Compute', initials: 'CC', palette: 'blue', category: 'Cloud infrastructure'},
  freshfork: {name: 'Fresh Fork Catering', initials: 'FF', palette: 'green', category: 'Catering'},
  northgate: {name: 'Northgate Facilities', initials: 'NF', palette: 'slate', category: 'Facilities'},
};

type InvoiceStatus = 'captured' | 'needs-review' | 'scheduled' | 'paid';
type PayMethod = 'ach' | 'wire' | 'check';
type MatchState = 'matched' | 'variance' | 'waived';

interface ExtractField {
  key: string;
  label: string;
  value: string;
  /** OCR confidence, percent. Below CONFIDENCE_FLOOR requires confirmation. */
  confidence: number;
}

interface MatchDoc {
  ref: string;
  detail: string;
  state: MatchState;
}

interface ApprovalStep {
  name: string;
  role: string;
  state: 'done' | 'current' | 'pending';
  at?: string;
  note?: string;
}

// The Table generic requires rows assignable to Record<string, unknown>.
interface Invoice extends Record<string, unknown> {
  id: string;
  vendorId: VendorId;
  number: string;
  amountCents: number;
  issueDate: string;
  dueDate: string;
  terms: string;
  status: InvoiceStatus;
  /** Scheduled/paid rows only. */
  payDate?: string;
  paidDate?: string;
  method: PayMethod;
  memo: string;
  department: string;
  glAccount: string;
  /** Source line, e.g. "Forwarded to ap@kestrellabs.com · Jul 1, 09:14". */
  receivedVia: string;
  attachmentName: string;
  extract: ExtractField[];
  /** Field keys the AP reviewer has confirmed (state). */
  confirmedKeys: string[];
  match: {po: MatchDoc; receipt: MatchDoc; invoice: MatchDoc; overall: MatchState};
  varianceNote?: string;
  varianceApproved: boolean;
  discount?: {byDate: string; saveCents: number; note: string};
  recommendedPayDate: string;
  approvals: ApprovalStep[];
}

const CONFIDENCE_FLOOR = 85;

const INITIAL_INVOICES: Invoice[] = [
  // ---- Inbox: needs review ------------------------------------------------
  {
    id: 'inv-halcyon', vendorId: 'halcyon', number: 'INV-2041', amountCents: 861_000,
    issueDate: '2026-06-28', dueDate: '2026-07-28', terms: '2/10 net 30',
    status: 'needs-review', method: 'ach', memo: 'Atlas Q3 launch print collateral',
    department: 'GTM', glAccount: '6420 · Marketing production',
    receivedVia: 'Forwarded to ap@kestrellabs.com · Jul 1, 09:14',
    attachmentName: 'invoice_2041.pdf',
    // OCR math reconciles: 7,980.00 + 210.00 freight + 420.00 tax = 8,610.00.
    // PO-4312 covers subtotal + tax (8,400.00) — freight is the variance.
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'Halcyon Print Co', confidence: 99},
      {key: 'number', label: 'Invoice #', value: 'INV-2041', confidence: 98},
      {key: 'issued', label: 'Invoice date', value: 'Jun 28, 2026', confidence: 97},
      {key: 'due', label: 'Due date', value: 'Jul 28, 2026', confidence: 74},
      {key: 'po', label: 'PO reference', value: 'PO-4312', confidence: 96},
      {key: 'subtotal', label: 'Subtotal', value: '$7,980.00', confidence: 95},
      {key: 'tax', label: 'Sales tax', value: '$420.00', confidence: 68},
      {key: 'total', label: 'Total', value: '$8,610.00', confidence: 99},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: 'PO-4312', detail: '$8,400.00 · launch collateral', state: 'matched'},
      receipt: {ref: 'GR-1187', detail: 'Received Jun 30 · Jonah Fields', state: 'matched'},
      invoice: {ref: 'INV-2041', detail: '$8,610.00 · +$210.00 over PO', state: 'variance'},
      overall: 'variance',
    },
    varianceNote: '+$210.00 over PO-4312 — freight line not on the PO.',
    discount: {byDate: '2026-07-08', saveCents: 17_220, note: 'Pay by Jul 8 to capture the 2/10 early-pay discount'},
    recommendedPayDate: '2026-07-08',
    approvals: [
      {name: 'System', role: 'Captured from email', state: 'done', at: 'Jul 1, 09:14'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'current'},
      {name: 'Jonah Fields', role: 'GTM budget owner', state: 'pending'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'pending'},
    ],
  },
  {
    id: 'inv-brightline', vendorId: 'brightline', number: '10467', amountCents: 625_000,
    issueDate: '2026-06-12', dueDate: '2026-06-27', terms: 'Net 15',
    status: 'needs-review', method: 'ach', memo: 'June counsel retainer — commercial contracts',
    department: 'Finance', glAccount: '6710 · Legal & professional',
    receivedVia: 'Forwarded to ap@kestrellabs.com · Jun 30, 16:41',
    attachmentName: 'brightline_10467.pdf',
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'Brightline Legal LLP', confidence: 99},
      {key: 'number', label: 'Invoice #', value: '10467', confidence: 97},
      {key: 'issued', label: 'Invoice date', value: 'Jun 12, 2026', confidence: 96},
      {key: 'due', label: 'Due date', value: 'Jun 27, 2026', confidence: 94},
      {key: 'po', label: 'PO reference', value: 'PO-4290', confidence: 71},
      {key: 'total', label: 'Total', value: '$6,250.00', confidence: 98},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: 'PO-4290', detail: '$6,250.00 · monthly retainer', state: 'matched'},
      receipt: {ref: '—', detail: 'Services — goods receipt waived', state: 'waived'},
      invoice: {ref: '10467', detail: '$6,250.00 · matches PO', state: 'matched'},
      overall: 'matched',
    },
    recommendedPayDate: '2026-07-06',
    approvals: [
      {name: 'System', role: 'Captured from email', state: 'done', at: 'Jun 30, 16:41'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'current'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'pending'},
    ],
  },
  // ---- Inbox: captured ------------------------------------------------------
  {
    id: 'inv-orbit', vendorId: 'orbit', number: 'OS-3312', amountCents: 972_000,
    issueDate: '2026-06-30', dueDate: '2026-07-16', terms: 'Net 15',
    status: 'captured', method: 'ach', memo: 'June contractor hours — 2 QA contractors, 144 hrs',
    department: 'Engineering', glAccount: '6130 · Contract labor',
    receivedVia: 'Vendor portal sync · Jul 1, 08:02',
    attachmentName: 'orbit_OS-3312.pdf',
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'Orbit Staffing', confidence: 99},
      {key: 'number', label: 'Invoice #', value: 'OS-3312', confidence: 99},
      {key: 'due', label: 'Due date', value: 'Jul 16, 2026', confidence: 97},
      {key: 'po', label: 'PO reference', value: 'PO-4307', confidence: 95},
      {key: 'total', label: 'Total', value: '$9,720.00', confidence: 99},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: 'PO-4307', detail: 'Blanket PO · QA staffing H2', state: 'matched'},
      receipt: {ref: 'TS-0629', detail: 'Timesheets approved Jun 29', state: 'matched'},
      invoice: {ref: 'OS-3312', detail: '144 hrs × $67.50 = $9,720.00', state: 'matched'},
      overall: 'matched',
    },
    recommendedPayDate: '2026-07-14',
    approvals: [
      {name: 'System', role: 'Captured from portal', state: 'done', at: 'Jul 1, 08:02'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'current'},
      {name: 'Marcus Webb', role: 'Platform lead', state: 'pending'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'pending'},
    ],
  },
  {
    id: 'inv-packetworks', vendorId: 'packetworks', number: 'PW-660412', amountCents: 194_000,
    issueDate: '2026-07-01', dueDate: '2026-07-18', terms: 'Net 17',
    status: 'captured', method: 'ach', memo: 'SF HQ fiber — July service',
    department: 'Ops', glAccount: '6810 · Utilities & connectivity',
    receivedVia: 'Forwarded to ap@kestrellabs.com · Jul 3, 07:55',
    attachmentName: 'packetworks_jul.pdf',
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'PacketWorks Fiber', confidence: 99},
      {key: 'number', label: 'Invoice #', value: 'PW-660412', confidence: 98},
      {key: 'due', label: 'Due date', value: 'Jul 18, 2026', confidence: 96},
      {key: 'total', label: 'Total', value: '$1,940.00', confidence: 99},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: '—', detail: 'Recurring utility — no PO', state: 'waived'},
      receipt: {ref: '—', detail: 'Service — receipt waived', state: 'waived'},
      invoice: {ref: 'PW-660412', detail: 'Matches June baseline', state: 'matched'},
      overall: 'waived',
    },
    recommendedPayDate: '2026-07-16',
    approvals: [
      {name: 'System', role: 'Captured from email', state: 'done', at: 'Jul 3, 07:55'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'current'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'pending', note: 'Auto-approves under the $2,500 policy'},
    ],
  },
  // ---- Scheduled ------------------------------------------------------------
  {
    id: 'inv-tagus', vendorId: 'tagus', number: 'TW-2026-07', amountCents: 1_180_000,
    issueDate: '2026-06-25', dueDate: '2026-07-08', terms: 'Net 13',
    status: 'scheduled', payDate: '2026-07-06', method: 'wire',
    memo: 'Lisbon office — July lease',
    department: 'Ops', glAccount: '6820 · Rent & occupancy',
    receivedVia: 'Forwarded to ap@kestrellabs.com · Jun 25, 10:20',
    attachmentName: 'tagus_jul_lease.pdf',
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'Tagus Workspaces', confidence: 99},
      {key: 'number', label: 'Invoice #', value: 'TW-2026-07', confidence: 98},
      {key: 'due', label: 'Due date', value: 'Jul 8, 2026', confidence: 97},
      {key: 'total', label: 'Total', value: '$11,800.00', confidence: 99},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: '—', detail: 'Lease contract — no PO', state: 'waived'},
      receipt: {ref: '—', detail: 'Occupancy — receipt waived', state: 'waived'},
      invoice: {ref: 'TW-2026-07', detail: 'Matches lease schedule', state: 'matched'},
      overall: 'waived',
    },
    recommendedPayDate: '2026-07-06',
    approvals: [
      {name: 'System', role: 'Captured from email', state: 'done', at: 'Jun 25, 10:20'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'done', at: 'Jun 26, 09:05'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'done', at: 'Jun 27, 11:12'},
    ],
  },
  {
    id: 'inv-meridian', vendorId: 'meridian', number: 'MBG-2026-071', amountCents: 3_894_000,
    issueDate: '2026-06-26', dueDate: '2026-07-10', terms: 'Net 14',
    status: 'scheduled', payDate: '2026-07-08', method: 'ach',
    memo: 'July medical + dental premiums — 140 enrolled',
    department: 'People', glAccount: '5220 · Benefits premiums',
    receivedVia: 'Carrier portal sync · Jun 26, 06:00',
    attachmentName: 'meridian_july_premiums.pdf',
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'Meridian Benefits Group', confidence: 99},
      {key: 'number', label: 'Invoice #', value: 'MBG-2026-071', confidence: 99},
      {key: 'due', label: 'Due date', value: 'Jul 10, 2026', confidence: 98},
      {key: 'total', label: 'Total', value: '$38,940.00', confidence: 99},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: '—', detail: 'Carrier contract — no PO', state: 'waived'},
      receipt: {ref: 'ENR-140', detail: '140 enrollments · July census', state: 'matched'},
      invoice: {ref: 'MBG-2026-071', detail: 'Matches July census', state: 'matched'},
      overall: 'matched',
    },
    recommendedPayDate: '2026-07-08',
    approvals: [
      {name: 'System', role: 'Captured from portal', state: 'done', at: 'Jun 26, 06:00'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'done', at: 'Jun 29, 10:31'},
      {name: 'Dana Whitfield', role: 'People Ops owner', state: 'done', at: 'Jul 1, 14:08'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'done', at: 'Jul 2, 09:47'},
    ],
  },
  {
    id: 'inv-kite', vendorId: 'kite', number: 'KH-11842', amountCents: 798_000,
    issueDate: '2026-06-29', dueDate: '2026-07-14', terms: 'Net 15',
    status: 'scheduled', payDate: '2026-07-06', method: 'ach',
    // Cross-pillar join: the two July new hires mid-onboarding.
    memo: '2× MacBook Pro 16 — July new hires (A. Lindqvist, K. Tanaka)',
    department: 'Engineering', glAccount: '1510 · Computer equipment',
    receivedVia: 'Forwarded to ap@kestrellabs.com · Jun 29, 15:12',
    attachmentName: 'kite_KH-11842.pdf',
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'Kite Hardware Co', confidence: 99},
      {key: 'number', label: 'Invoice #', value: 'KH-11842', confidence: 98},
      {key: 'due', label: 'Due date', value: 'Jul 14, 2026', confidence: 97},
      {key: 'po', label: 'PO reference', value: 'PO-4351', confidence: 98},
      {key: 'total', label: 'Total', value: '$7,980.00', confidence: 99},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: 'PO-4351', detail: '$7,980.00 · 2 laptops', state: 'matched'},
      receipt: {ref: 'GR-1203', detail: 'Received Jul 1 · Tom Okonkwo', state: 'matched'},
      invoice: {ref: 'KH-11842', detail: '$7,980.00 · matches PO', state: 'matched'},
      overall: 'matched',
    },
    recommendedPayDate: '2026-07-06',
    approvals: [
      {name: 'System', role: 'Captured from email', state: 'done', at: 'Jun 29, 15:12'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'done', at: 'Jul 1, 09:44'},
      {name: 'Tom Okonkwo', role: 'IT admin', state: 'done', at: 'Jul 1, 16:20'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'done', at: 'Jul 2, 08:15'},
    ],
  },
  {
    id: 'inv-sentinel', vendorId: 'sentinel', number: 'SC-2026-388', amountCents: 1_250_000,
    issueDate: '2026-06-24', dueDate: '2026-07-24', terms: 'Net 30',
    status: 'scheduled', payDate: '2026-07-22', method: 'ach',
    memo: 'SOC 2 Type II audit — milestone 2 of 3',
    department: 'Ops', glAccount: '6720 · Audit & compliance',
    receivedVia: 'Forwarded to ap@kestrellabs.com · Jun 24, 13:37',
    attachmentName: 'sentinel_m2.pdf',
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'Sentinel Compliance', confidence: 99},
      {key: 'number', label: 'Invoice #', value: 'SC-2026-388', confidence: 98},
      {key: 'due', label: 'Due date', value: 'Jul 24, 2026', confidence: 97},
      {key: 'po', label: 'PO reference', value: 'PO-4322', confidence: 96},
      {key: 'total', label: 'Total', value: '$12,500.00', confidence: 99},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: 'PO-4322', detail: '$37,500.00 · 3 milestones', state: 'matched'},
      receipt: {ref: 'MS-2', detail: 'Milestone 2 accepted Jun 23', state: 'matched'},
      invoice: {ref: 'SC-2026-388', detail: '$12,500.00 · 1/3 of PO', state: 'matched'},
      overall: 'matched',
    },
    recommendedPayDate: '2026-07-22',
    approvals: [
      {name: 'System', role: 'Captured from email', state: 'done', at: 'Jun 24, 13:37'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'done', at: 'Jun 25, 10:02'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'done', at: 'Jun 26, 15:40'},
    ],
  },
  {
    id: 'inv-cirrus', vendorId: 'cirrus', number: 'INV-88213', amountCents: 2_418_000,
    issueDate: '2026-07-01', dueDate: '2026-07-31', terms: 'Net 30',
    status: 'scheduled', payDate: '2026-07-29', method: 'ach',
    memo: 'July cloud infrastructure — prod + staging',
    department: 'Engineering', glAccount: '6110 · Cloud hosting',
    receivedVia: 'Vendor portal sync · Jul 1, 06:00',
    attachmentName: 'cirrus_INV-88213.pdf',
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'Cirrus Compute', confidence: 99},
      {key: 'number', label: 'Invoice #', value: 'INV-88213', confidence: 99},
      {key: 'due', label: 'Due date', value: 'Jul 31, 2026', confidence: 98},
      {key: 'po', label: 'PO reference', value: 'PO-4188', confidence: 97},
      {key: 'total', label: 'Total', value: '$24,180.00', confidence: 99},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: 'PO-4188', detail: 'Blanket PO · FY26 cloud', state: 'matched'},
      receipt: {ref: 'UTIL-07', detail: 'Usage report · July', state: 'matched'},
      invoice: {ref: 'INV-88213', detail: 'Within blanket PO cap', state: 'matched'},
      overall: 'matched',
    },
    recommendedPayDate: '2026-07-29',
    approvals: [
      {name: 'System', role: 'Captured from portal', state: 'done', at: 'Jul 1, 06:00'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'done', at: 'Jul 1, 11:26'},
      {name: 'Marcus Webb', role: 'Platform lead', state: 'done', at: 'Jul 2, 10:03'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'done', at: 'Jul 2, 16:55'},
    ],
  },
  // ---- Paid -------------------------------------------------------------
  {
    id: 'inv-freshfork', vendorId: 'freshfork', number: 'FF-2288', amountCents: 348_000,
    issueDate: '2026-06-24', dueDate: '2026-07-01', terms: 'Net 7',
    status: 'paid', payDate: '2026-06-30', paidDate: '2026-06-30', method: 'ach',
    memo: 'June all-hands lunch — SF HQ',
    department: 'People', glAccount: '6910 · Employee events',
    receivedVia: 'Forwarded to ap@kestrellabs.com · Jun 24, 14:30',
    attachmentName: 'freshfork_FF-2288.pdf',
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'Fresh Fork Catering', confidence: 99},
      {key: 'number', label: 'Invoice #', value: 'FF-2288', confidence: 98},
      {key: 'total', label: 'Total', value: '$3,480.00', confidence: 99},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: '—', detail: 'Event order — no PO', state: 'waived'},
      receipt: {ref: '—', detail: 'Catering — receipt waived', state: 'waived'},
      invoice: {ref: 'FF-2288', detail: 'Matches event quote', state: 'matched'},
      overall: 'waived',
    },
    recommendedPayDate: '2026-06-30',
    approvals: [
      {name: 'System', role: 'Captured from email', state: 'done', at: 'Jun 24, 14:30'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'done', at: 'Jun 25, 09:12'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'done', at: 'Jun 26, 10:44'},
    ],
  },
  {
    id: 'inv-northgate', vendorId: 'northgate', number: 'NG-5521', amountCents: 215_000,
    issueDate: '2026-06-18', dueDate: '2026-06-30', terms: 'Net 12',
    status: 'paid', payDate: '2026-06-26', paidDate: '2026-06-26', method: 'check',
    memo: 'June janitorial — SF HQ',
    department: 'Ops', glAccount: '6830 · Facilities services',
    receivedVia: 'Postal scan · Jun 18, 12:00',
    attachmentName: 'northgate_NG-5521.pdf',
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'Northgate Facilities', confidence: 98},
      {key: 'number', label: 'Invoice #', value: 'NG-5521', confidence: 97},
      {key: 'total', label: 'Total', value: '$2,150.00', confidence: 99},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: '—', detail: 'Service contract — no PO', state: 'waived'},
      receipt: {ref: '—', detail: 'Services — receipt waived', state: 'waived'},
      invoice: {ref: 'NG-5521', detail: 'Matches contract rate', state: 'matched'},
      overall: 'waived',
    },
    recommendedPayDate: '2026-06-26',
    approvals: [
      {name: 'System', role: 'Captured from scan', state: 'done', at: 'Jun 18, 12:00'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'done', at: 'Jun 19, 08:50'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'done', at: 'Jun 22, 09:31'},
    ],
  },
  {
    id: 'inv-cirrus-jun', vendorId: 'cirrus', number: 'INV-84550', amountCents: 2_366_000,
    issueDate: '2026-06-01', dueDate: '2026-06-30', terms: 'Net 30',
    status: 'paid', payDate: '2026-06-27', paidDate: '2026-06-27', method: 'ach',
    memo: 'June cloud infrastructure — prod + staging',
    department: 'Engineering', glAccount: '6110 · Cloud hosting',
    receivedVia: 'Vendor portal sync · Jun 1, 06:00',
    attachmentName: 'cirrus_INV-84550.pdf',
    extract: [
      {key: 'vendor', label: 'Vendor', value: 'Cirrus Compute', confidence: 99},
      {key: 'number', label: 'Invoice #', value: 'INV-84550', confidence: 99},
      {key: 'total', label: 'Total', value: '$23,660.00', confidence: 99},
    ],
    confirmedKeys: [], varianceApproved: false,
    match: {
      po: {ref: 'PO-4188', detail: 'Blanket PO · FY26 cloud', state: 'matched'},
      receipt: {ref: 'UTIL-06', detail: 'Usage report · June', state: 'matched'},
      invoice: {ref: 'INV-84550', detail: 'Within blanket PO cap', state: 'matched'},
      overall: 'matched',
    },
    recommendedPayDate: '2026-06-27',
    approvals: [
      {name: 'System', role: 'Captured from portal', state: 'done', at: 'Jun 1, 06:00'},
      {name: CURRENT_USER, role: 'AP review (you)', state: 'done', at: 'Jun 2, 10:14'},
      {name: 'Marcus Webb', role: 'Platform lead', state: 'done', at: 'Jun 3, 09:28'},
      {name: 'Elena Voss', role: 'Finance lead', state: 'done', at: 'Jun 24, 11:02'},
    ],
  },
];

// ---------------------------------------------------------------------------
// HELPERS — deterministic date/money math on fixed fixture strings. No
// clocks (TODAY is frozen) and no locale money APIs.
// ---------------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY-MM-DD' → whole days since the UTC epoch (fixed strings only). */
function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

const TODAY_DAY = dayNumber(TODAY);

/** 'YYYY-MM-DD' → 'Jul 8' (year omitted; every fixture is mid-2026). */
function formatDate(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return \`\${MONTHS[m - 1]} \${d}\`;
}

/** Integer cents → '$8,610.00'. */
function formatUsd(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rem = \`\${cents % 100}\`.padStart(2, '0');
  const grouped = \`\${dollars}\`.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  return \`$\${grouped}.\${rem}\`;
}

/** Integer cents → compact '$73.6k' for the forecast bar readouts. */
function formatUsdCompact(cents: number): string {
  return \`$\${(cents / 100_000).toFixed(1)}k\`;
}

interface Aging {
  label: string;
  color?: string;
}

/** Due-date aging vs the frozen Jul 3 instant (overdue red, ≤7d amber). */
function agingFor(invoice: Invoice): Aging {
  if (invoice.status === 'paid') {
    return {label: \`Paid \${formatDate(invoice.paidDate ?? invoice.dueDate)}\`};
  }
  const days = dayNumber(invoice.dueDate) - TODAY_DAY;
  if (days < 0) {
    return {label: \`Overdue \${-days}d\`, color: AGING_OVERDUE};
  }
  if (days <= 7) {
    return {label: \`Due in \${days}d\`, color: AGING_DUE_SOON};
  }
  return {label: \`Due \${formatDate(invoice.dueDate)}\`};
}

const STATUS_META: Record<InvoiceStatus, {label: string; color: 'gray' | 'orange' | 'blue' | 'green'}> = {
  captured: {label: 'Captured', color: 'gray'},
  'needs-review': {label: 'Needs review', color: 'orange'},
  scheduled: {label: 'Scheduled', color: 'blue'},
  paid: {label: 'Paid', color: 'green'},
};

const METHOD_META: Record<PayMethod, {label: string; caption: string}> = {
  ach: {label: 'ACH', caption: 'No fee · settles in 2 business days'},
  wire: {label: 'Wire', caption: '$18.00 fee · same-day settlement'},
  check: {label: 'Check', caption: '$1.50 print & mail · 5–7 days'},
};

function isInbox(invoice: Invoice): boolean {
  return invoice.status === 'captured' || invoice.status === 'needs-review';
}

/** Flagged (low-confidence) extract fields still awaiting confirmation. */
function unconfirmedFlagged(invoice: Invoice): ExtractField[] {
  return invoice.extract.filter(
    field =>
      field.confidence < CONFIDENCE_FLOOR &&
      !invoice.confirmedKeys.includes(field.key),
  );
}

// ---------------------------------------------------------------------------
// CASH-OUT FORECAST — four Mon–Sun weeks starting Jul 6. Derived from the
// invoice rows (scheduled by pay date; inbox projected by recommended pay
// date, overdue items clamped into week 1) so the strip reconciles with
// the table by construction.
// ---------------------------------------------------------------------------

const WEEK_STARTS = ['2026-07-06', '2026-07-13', '2026-07-20', '2026-07-27'];

const WEEK_LABELS = ['Jul 6–12', 'Jul 13–19', 'Jul 20–26', 'Jul 27–Aug 2'];

interface ForecastWeek {
  label: string;
  scheduledCents: number;
  projectedCents: number;
}

function buildForecast(invoices: Invoice[]): ForecastWeek[] {
  const weeks: ForecastWeek[] = WEEK_LABELS.map(label => ({
    label,
    scheduledCents: 0,
    projectedCents: 0,
  }));
  const firstDay = dayNumber(WEEK_STARTS[0]);
  for (const invoice of invoices) {
    if (invoice.status === 'paid') {
      continue;
    }
    const effective =
      invoice.status === 'scheduled'
        ? invoice.payDate ?? invoice.dueDate
        : invoice.recommendedPayDate;
    // Overdue / imminent items land in week 1; beyond week 4 is out of range.
    const index = Math.max(0, Math.floor((dayNumber(effective) - firstDay) / 7));
    if (index > 3) {
      continue;
    }
    if (invoice.status === 'scheduled') {
      weeks[index].scheduledCents += invoice.amountCents;
    } else {
      weeks[index].projectedCents += invoice.amountCents;
    }
  }
  return weeks;
}

// ---------------------------------------------------------------------------
// SMALL PIECES — vendor monogram, status pill, forecast strip, columns.
// ---------------------------------------------------------------------------

function Monogram({vendorId, size = 'sm'}: {vendorId: VendorId; size?: 'sm' | 'lg'}) {
  const vendor = VENDORS[vendorId];
  return (
    <span
      aria-hidden
      style={{
        ...styles.monogram,
        ...(size === 'lg' ? styles.monogramLg : null),
        color: CATEGORICAL[vendor.palette],
        backgroundColor: MONOGRAM_BG[vendor.palette],
      }}>
      {vendor.initials}
    </span>
  );
}

function StatusPill({status}: {status: InvoiceStatus}) {
  const meta = STATUS_META[status];
  return <Token size="sm" color={meta.color} label={meta.label} />;
}

const BAR_MAX_PX = 64;

function ForecastStrip({invoices, isCompact}: {invoices: Invoice[]; isCompact: boolean}) {
  const weeks = buildForecast(invoices);
  const totals = weeks.map(week => week.scheduledCents + week.projectedCents);
  const grandTotal = totals.reduce((sum, cents) => sum + cents, 0);
  const scheduledTotal = weeks.reduce((sum, week) => sum + week.scheduledCents, 0);
  const projectedTotal = grandTotal - scheduledTotal;
  const max = Math.max(...totals, 1);
  return (
    <section aria-label="Cash out forecast, next 4 weeks" style={styles.forecastStrip}>
      <VStack gap={2} style={styles.forecastBars}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text type="label" size="sm">Cash out — next 4 weeks</Text>
          </StackItem>
          <HStack gap={1} vAlign="center">
            <span style={styles.legendSwatchScheduled} aria-hidden />
            <Text type="supporting" color="secondary">Scheduled</Text>
          </HStack>
          <HStack gap={1} vAlign="center">
            <span style={styles.legendSwatchProjected} aria-hidden />
            <Text type="supporting" color="secondary">Projected (inbox)</Text>
          </HStack>
        </HStack>
        <HStack gap={3} vAlign="end">
          {weeks.map(week => {
            const total = week.scheduledCents + week.projectedCents;
            return (
              <div key={week.label} style={styles.forecastWeek}>
                <Text type="supporting" color="secondary" hasTabularNumbers justify="center">
                  {formatUsdCompact(total)}
                </Text>
                <div
                  style={styles.forecastBarTrack}
                  role="img"
                  aria-label={\`\${week.label}: \${formatUsd(total)} — \${formatUsd(
                    week.scheduledCents,
                  )} scheduled, \${formatUsd(week.projectedCents)} projected\`}>
                  <div
                    style={{
                      ...styles.forecastBarScheduled,
                      height: Math.round((week.scheduledCents / max) * BAR_MAX_PX),
                    }}
                  />
                  {week.projectedCents > 0 ? (
                    <div
                      style={{
                        ...styles.forecastBarProjected,
                        height: Math.round((week.projectedCents / max) * BAR_MAX_PX),
                      }}
                    />
                  ) : null}
                </div>
                <Text type="supporting" color="secondary" justify="center" hasTabularNumbers maxLines={1}>
                  {isCompact ? week.label.split('–')[0] : week.label}
                </Text>
              </div>
            );
          })}
        </HStack>
      </VStack>
      <VStack gap={1} style={styles.forecastTotals}>
        <Text type="supporting" color="secondary">Total outflow</Text>
        <Text type="label" size="lg" hasTabularNumbers>{formatUsd(grandTotal)}</Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {formatUsd(scheduledTotal)} scheduled · {formatUsd(projectedTotal)} projected
        </Text>
        <Text type="supporting" color="secondary">
          Projected rows use recommended pay dates; overdue items land in week 1.
        </Text>
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// INVOICE TABLE — columns. Fixed-width columns use pixel() so the header
// carries both width and minWidth (Table cells have max-width: 0).
// ---------------------------------------------------------------------------

function VendorCell({invoice}: {invoice: Invoice}) {
  const vendor = VENDORS[invoice.vendorId];
  return (
    <HStack gap={2} vAlign="center">
      <Monogram vendorId={invoice.vendorId} />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>{vendor.name}</Text>
          <Text type="supporting" color="secondary" maxLines={1}>{invoice.memo}</Text>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function DueCell({invoice}: {invoice: Invoice}) {
  const aging = agingFor(invoice);
  return (
    <VStack gap={0}>
      <Text
        type="label"
        style={
          aging.color !== undefined
            ? {...styles.agingText, color: aging.color}
            : styles.agingText
        }>
        {aging.label}
      </Text>
      <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
        {invoice.status === 'paid'
          ? \`was due \${formatDate(invoice.dueDate)}\`
          : invoice.status === 'scheduled'
            ? \`pays \${formatDate(invoice.payDate ?? invoice.recommendedPayDate)}\`
            : invoice.terms}
      </Text>
    </VStack>
  );
}

function buildColumns(isCompact: boolean): TableColumn<Invoice>[] {
  const columns: TableColumn<Invoice>[] = [
    {
      key: 'vendor',
      header: 'Vendor',
      width: proportional(2, {minWidth: 184}),
      sortable: {sortKey: 'vendorId'},
      renderCell: (invoice: Invoice) => <VendorCell invoice={invoice} />,
    },
  ];
  if (!isCompact) {
    columns.push({
      key: 'number',
      header: 'Invoice #',
      width: pixel(108),
      renderCell: (invoice: Invoice) => (
        <span style={styles.invoiceNumber}>{invoice.number}</span>
      ),
    });
  }
  columns.push(
    {
      key: 'amount',
      header: 'Amount',
      align: 'end',
      width: pixel(98),
      sortable: {sortKey: 'amountCents'},
      renderCell: (invoice: Invoice) => (
        <Text type="label" hasTabularNumbers style={styles.numericCell}>
          {formatUsd(invoice.amountCents)}
        </Text>
      ),
    },
    {
      key: 'due',
      header: 'Due',
      width: pixel(132),
      sortable: {sortKey: 'dueDate'},
      renderCell: (invoice: Invoice) => <DueCell invoice={invoice} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(112),
      sortable: {sortKey: 'status'},
      renderCell: (invoice: Invoice) => <StatusPill status={invoice.status} />,
    },
  );
  return columns;
}

// ---------------------------------------------------------------------------
// REVIEW PANEL — OCR extract, three-way match, payment scheduling,
// approval chain, coding metadata.
// ---------------------------------------------------------------------------

/** Email-attachment PDF facsimile — styled divs only, no network media. */
function AttachmentThumb({invoice}: {invoice: Invoice}) {
  const vendor = VENDORS[invoice.vendorId];
  return (
    <VStack gap={1} hAlign="center">
      <div style={styles.thumb} aria-label={\`Attachment preview: \${invoice.attachmentName}\`} role="img">
        <div
          style={{
            ...styles.thumbBrand,
            backgroundColor: MONOGRAM_BG[vendor.palette],
          }}
        />
        <div style={{...styles.thumbLine, width: '80%'}} />
        <div style={{...styles.thumbLine, width: '64%'}} />
        <div style={styles.thumbRule} />
        <div style={{...styles.thumbLine, width: '90%'}} />
        <div style={{...styles.thumbLine, width: '86%'}} />
        <div style={{...styles.thumbLine, width: '72%'}} />
        <div style={styles.thumbRule} />
        <div style={styles.thumbTotal} />
      </div>
      <HStack gap={1} vAlign="center">
        <Icon icon={PaperclipIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary" maxLines={1}>p. 1</Text>
      </HStack>
    </VStack>
  );
}

function ExtractFieldRow({
  invoice,
  field,
  onConfirm,
}: {
  invoice: Invoice;
  field: ExtractField;
  onConfirm: (invoiceId: string, key: string) => void;
}) {
  const isLow = field.confidence < CONFIDENCE_FLOOR;
  const isConfirmed = invoice.confirmedKeys.includes(field.key);
  const needsConfirm = isLow && !isConfirmed && isInbox(invoice);
  return (
    <div style={needsConfirm ? styles.fieldRowFlagged : styles.fieldRow}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="supporting" color="secondary" maxLines={1}>{field.label}</Text>
            <Text type="label" hasTabularNumbers maxLines={1}>{field.value}</Text>
          </VStack>
        </StackItem>
        {needsConfirm ? (
          <VStack gap={1} hAlign="end">
            <span style={styles.confidenceChip}>{field.confidence}% OCR</span>
            <Button
              label="Confirm"
              variant="secondary"
              size="sm"
              onClick={() => onConfirm(invoice.id, field.key)}
            />
          </VStack>
        ) : isLow && isConfirmed ? (
          <HStack gap={1} vAlign="center">
            <Icon icon={CheckIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">Confirmed</Text>
          </HStack>
        ) : (
          <Text type="supporting" color="secondary" hasTabularNumbers>{field.confidence}%</Text>
        )}
      </HStack>
    </div>
  );
}

function ExtractSection({
  invoice,
  onConfirm,
}: {
  invoice: Invoice;
  onConfirm: (invoiceId: string, key: string) => void;
}) {
  const flagged = invoice.extract.filter(field => field.confidence < CONFIDENCE_FLOOR);
  const open = unconfirmedFlagged(invoice);
  return (
    <VStack gap={2} style={styles.sectionBox}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ScanTextIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="label">Extracted from attachment</Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {invoice.extract.length - flagged.length}/{invoice.extract.length} ≥ {CONFIDENCE_FLOOR}%
        </Text>
      </HStack>
      <Text type="supporting" color="secondary" maxLines={1}>
        {invoice.attachmentName} · {invoice.receivedVia}
      </Text>
      <HStack gap={3} vAlign="start">
        <AttachmentThumb invoice={invoice} />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={1}>
            {invoice.extract.map(field => (
              <ExtractFieldRow
                key={field.key}
                invoice={invoice}
                field={field}
                onConfirm={onConfirm}
              />
            ))}
          </VStack>
        </StackItem>
      </HStack>
      {open.length > 0 && isInbox(invoice) ? (
        <Text type="supporting" style={{color: AGING_DUE_SOON}}>
          {open.length} low-confidence {open.length === 1 ? 'field needs' : 'fields need'}{' '}
          confirmation before scheduling.
        </Text>
      ) : null}
    </VStack>
  );
}

// 'PO' (standard AP shorthand) — 'Purchase order' truncates to 'Purchas…'
// inside the ~96px match tiles of the 380px review panel.
const MATCH_DOC_LABEL: Record<'po' | 'receipt' | 'invoice', string> = {
  po: 'PO',
  receipt: 'Receipt',
  invoice: 'Invoice',
};

const MATCH_DOC_ICON = {
  po: FileTextIcon,
  receipt: PackageCheckIcon,
  invoice: ReceiptTextIcon,
} as const;

function MatchTile({kind, doc}: {kind: 'po' | 'receipt' | 'invoice'; doc: MatchDoc}) {
  const isVariance = doc.state === 'variance';
  return (
    <div style={isVariance ? styles.matchTileVariance : styles.matchTile}>
      <VStack gap={1}>
        <HStack gap={1} vAlign="center">
          <Icon icon={MATCH_DOC_ICON[kind]} size="xsm" color="secondary" />
          <StackItem size="fill" style={{minWidth: 0}}>
            <Text type="supporting" color="secondary" maxLines={1}>{MATCH_DOC_LABEL[kind]}</Text>
          </StackItem>
          {isVariance ? (
            <span style={{color: AGING_DUE_SOON, display: 'inline-flex'}}>
              <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
            </span>
          ) : doc.state === 'matched' ? (
            <span style={{color: MATCH_OK, display: 'inline-flex'}}>
              <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
            </span>
          ) : (
            <Icon icon={CircleIcon} size="xsm" color="secondary" />
          )}
        </HStack>
        <span style={styles.invoiceNumber}>{doc.ref}</span>
        <Text type="supporting" color="secondary" maxLines={2}>{doc.detail}</Text>
      </VStack>
    </div>
  );
}

function MatchSection({
  invoice,
  onApproveVariance,
}: {
  invoice: Invoice;
  onApproveVariance: (invoiceId: string) => void;
}) {
  const {match} = invoice;
  const summary =
    match.overall === 'variance'
      ? invoice.varianceApproved
        ? 'Variance approved'
        : 'Variance flagged'
      : match.overall === 'matched'
        ? 'Three-way match passed'
        : 'Match waived (no PO / receipt)';
  return (
    <VStack gap={2} style={styles.sectionBox}>
      <HStack gap={2} vAlign="center">
        <Icon icon={CheckCircle2Icon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="label">Three-way match</Text>
        </StackItem>
        <Text
          type="supporting"
          color={match.overall === 'variance' && !invoice.varianceApproved ? undefined : 'secondary'}
          style={
            match.overall === 'variance' && !invoice.varianceApproved
              ? {color: AGING_DUE_SOON}
              : undefined
          }>
          {summary}
        </Text>
      </HStack>
      <div style={styles.matchGrid}>
        <MatchTile kind="po" doc={match.po} />
        <MatchTile kind="receipt" doc={match.receipt} />
        <MatchTile kind="invoice" doc={match.invoice} />
      </div>
      {match.overall === 'variance' && invoice.varianceNote !== undefined ? (
        invoice.varianceApproved ? (
          <HStack gap={2} vAlign="center">
            <span style={{color: MATCH_OK, display: 'inline-flex'}}>
              <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
            </span>
            <Text type="supporting" color="secondary">
              Variance approved by you ({CURRENT_USER}) · noted on the audit trail.
            </Text>
          </HStack>
        ) : (
          <div style={styles.varianceBanner}>
            <span style={{color: AGING_DUE_SOON, display: 'inline-flex', marginTop: 2}}>
              <Icon icon={AlertTriangleIcon} size="sm" color="inherit" />
            </span>
            <StackItem size="fill">
              <VStack gap={2}>
                <Text type="supporting">{invoice.varianceNote}</Text>
                {/* Wrap: the pair is wider than the 380px panel's banner. */}
                <HStack gap={2} wrap="wrap">
                  <Button
                    label="Approve variance"
                    variant="secondary"
                    size="sm"
                    onClick={() => onApproveVariance(invoice.id)}
                  />
                  <Button label="Dispute with vendor" variant="ghost" size="sm" />
                </HStack>
              </VStack>
            </StackItem>
          </div>
        )
      ) : null}
    </VStack>
  );
}

function PaymentSection({
  invoice,
  onMethodChange,
  onSchedule,
}: {
  invoice: Invoice;
  onMethodChange: (invoiceId: string, method: PayMethod) => void;
  onSchedule: (invoiceId: string) => void;
}) {
  const inbox = isInbox(invoice);
  const blockers: string[] = [];
  const open = unconfirmedFlagged(invoice);
  if (open.length > 0) {
    blockers.push(\`confirm \${open.length} \${open.length === 1 ? 'field' : 'fields'}\`);
  }
  if (invoice.match.overall === 'variance' && !invoice.varianceApproved) {
    blockers.push('resolve the match variance');
  }
  const canSchedule = inbox && blockers.length === 0;
  return (
    <VStack gap={2} style={styles.sectionBox}>
      <HStack gap={2} vAlign="center">
        <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="label">Payment</Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>{invoice.terms}</Text>
      </HStack>
      <HStack gap={3} vAlign="center">
        <StackItem size="fill">
          <VStack gap={0}>
            <Text type="supporting" color="secondary">
              {invoice.status === 'paid'
                ? 'Paid on'
                : invoice.status === 'scheduled'
                  ? 'Scheduled pay date'
                  : 'Recommended pay date'}
            </Text>
            <Text type="label" hasTabularNumbers>
              {invoice.status === 'paid'
                ? formatDate(invoice.paidDate ?? invoice.dueDate)
                : formatDate(invoice.payDate ?? invoice.recommendedPayDate)}
              , 2026
            </Text>
          </VStack>
        </StackItem>
        <VStack gap={0} hAlign="end">
          <Text type="supporting" color="secondary">Due</Text>
          <Text type="label" hasTabularNumbers>{formatDate(invoice.dueDate)}, 2026</Text>
        </VStack>
      </HStack>
      {invoice.discount !== undefined && invoice.status !== 'paid' ? (
        <div style={styles.optimizerNote}>
          <span style={{color: MATCH_OK, display: 'inline-flex', marginTop: 2}}>
            <Icon icon={SparklesIcon} size="sm" color="inherit" />
          </span>
          <Text type="supporting">
            {invoice.discount.note} — saves{' '}
            <strong>{formatUsd(invoice.discount.saveCents)}</strong>. Optimizer set the
            pay date to {formatDate(invoice.discount.byDate)}.
          </Text>
        </div>
      ) : null}
      <VStack gap={1}>
        <SegmentedControl
          label="Payment method"
          value={invoice.method}
          onChange={value => onMethodChange(invoice.id, value as PayMethod)}
          size="sm"
          isDisabled={invoice.status === 'paid'}>
          <SegmentedControlItem label="ACH" value="ach" />
          <SegmentedControlItem label="Wire" value="wire" />
          <SegmentedControlItem label="Check" value="check" />
        </SegmentedControl>
        <Text type="supporting" color="secondary">{METHOD_META[invoice.method].caption}</Text>
      </VStack>
      {inbox ? (
        <VStack gap={1}>
          <Button
            label="Approve & schedule payment"
            variant="primary"
            size="sm"
            isDisabled={!canSchedule}
            icon={<Icon icon={CalendarClockIcon} size="sm" color="inherit" />}
            onClick={() => onSchedule(invoice.id)}
          />
          <Text type="supporting" color="secondary">
            {canSchedule
              ? \`Schedules \${formatUsd(invoice.amountCents)} via \${
                  METHOD_META[invoice.method].label
                } for \${formatDate(invoice.recommendedPayDate)}; releases after remaining approvals.\`
              : \`To schedule: \${blockers.join(' · ')}.\`}
          </Text>
        </VStack>
      ) : invoice.status === 'scheduled' ? (
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              {formatUsd(invoice.amountCents)} via {METHOD_META[invoice.method].label} on{' '}
              {formatDate(invoice.payDate ?? invoice.recommendedPayDate)}.
            </Text>
          </StackItem>
          <Button label="Edit schedule" variant="ghost" size="sm" />
        </HStack>
      ) : (
        <Text type="supporting" color="secondary">
          {formatUsd(invoice.amountCents)} sent via {METHOD_META[invoice.method].label} on{' '}
          {formatDate(invoice.paidDate ?? invoice.dueDate)} · confirmation{' '}
          {invoice.number}-RCT.
        </Text>
      )}
    </VStack>
  );
}

function ApprovalStepRow({step, isLast}: {step: ApprovalStep; isLast: boolean}) {
  return (
    <HStack gap={2} vAlign="stretch">
      <div style={styles.stepRail}>
        {step.state === 'done' ? (
          <span style={{color: MATCH_OK, display: 'inline-flex'}}>
            <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
          </span>
        ) : step.state === 'current' ? (
          <span style={{color: 'var(--color-accent)', display: 'inline-flex'}}>
            <Icon icon={ClockIcon} size="sm" color="inherit" />
          </span>
        ) : (
          <Icon icon={CircleIcon} size="sm" color="secondary" />
        )}
        {isLast ? null : <div style={styles.stepConnector} />}
      </div>
      <StackItem size="fill" style={{minWidth: 0, paddingBottom: isLast ? 0 : 12}}>
        <HStack gap={2} vAlign="center">
          {step.name === 'System' ? null : (
            <Avatar name={step.name} size="xsmall" />
          )}
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <Text type="label" maxLines={1}>{step.name}</Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {step.role}
                {step.note !== undefined ? \` · \${step.note}\` : ''}
              </Text>
            </VStack>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {step.state === 'done' ? step.at : step.state === 'current' ? 'In review' : 'Waiting'}
          </Text>
        </HStack>
      </StackItem>
    </HStack>
  );
}

function ApprovalSection({invoice}: {invoice: Invoice}) {
  const doneCount = invoice.approvals.filter(step => step.state === 'done').length;
  return (
    <VStack gap={2} style={styles.sectionBox}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ClockIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="label">Approval chain</Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {doneCount} of {invoice.approvals.length} complete
        </Text>
      </HStack>
      <VStack gap={0}>
        {invoice.approvals.map((step, index) => (
          <ApprovalStepRow
            key={\`\${step.name}-\${step.role}\`}
            step={step}
            isLast={index === invoice.approvals.length - 1}
          />
        ))}
      </VStack>
    </VStack>
  );
}

function CodingSection({invoice}: {invoice: Invoice}) {
  return (
    <MetadataList columns={1} label={{position: 'start', width: 104}}>
      <MetadataListItem label="Department">
        <Text type="body">{invoice.department}</Text>
      </MetadataListItem>
      <MetadataListItem label="GL account">
        <Text type="body" hasTabularNumbers>{invoice.glAccount}</Text>
      </MetadataListItem>
      <MetadataListItem label="Vendor type">
        <Text type="body">{VENDORS[invoice.vendorId].category}</Text>
      </MetadataListItem>
      <MetadataListItem label="Issued">
        <Text type="body" hasTabularNumbers>{formatDate(invoice.issueDate)}, 2026</Text>
      </MetadataListItem>
      <MetadataListItem label="Source">
        <Text type="body" maxLines={1}>{invoice.receivedVia}</Text>
      </MetadataListItem>
    </MetadataList>
  );
}

interface ReviewActions {
  onConfirm: (invoiceId: string, key: string) => void;
  onApproveVariance: (invoiceId: string) => void;
  onMethodChange: (invoiceId: string, method: PayMethod) => void;
  onSchedule: (invoiceId: string) => void;
}

function ReviewPanelBody({invoice, actions}: {invoice: Invoice; actions: ReviewActions}) {
  const vendor = VENDORS[invoice.vendorId];
  const aging = agingFor(invoice);
  return (
    <VStack gap={3}>
      <HStack gap={3} vAlign="center">
        <Monogram vendorId={invoice.vendorId} size="lg" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Heading level={2}>{vendor.name}</Heading>
            <HStack gap={2} vAlign="center">
              <span style={styles.invoiceNumber}>{invoice.number}</span>
              <Text type="supporting" color="secondary" maxLines={1}>{vendor.category}</Text>
            </HStack>
          </VStack>
        </StackItem>
        <DropdownMenu
          button={{
            label: 'Invoice actions',
            variant: 'ghost',
            size: 'sm',
            isIconOnly: true,
            icon: <Icon icon={MoreHorizontalIcon} size="sm" />,
          }}
          hasChevron={false}
          menuWidth={220}
          items={[
            {
              label: 'View source email',
              icon: <Icon icon={MailIcon} size="sm" color="inherit" />,
              onClick: () => {},
            },
            {
              label: 'Download attachment',
              icon: <Icon icon={DownloadIcon} size="sm" color="inherit" />,
              onClick: () => {},
            },
            {
              label: 'Put on hold',
              icon: <Icon icon={ClockIcon} size="sm" color="inherit" />,
              onClick: () => {},
            },
          ]}
        />
      </HStack>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Heading level={3}>{formatUsd(invoice.amountCents)}</Heading>
        <StatusPill status={invoice.status} />
        <Text
          type="supporting"
          hasTabularNumbers
          style={aging.color !== undefined ? {color: aging.color} : undefined}
          color={aging.color !== undefined ? undefined : 'secondary'}>
          {aging.label}
        </Text>
      </HStack>
      <Text type="supporting" color="secondary">{invoice.memo}</Text>
      <ExtractSection invoice={invoice} onConfirm={actions.onConfirm} />
      <MatchSection invoice={invoice} onApproveVariance={actions.onApproveVariance} />
      <PaymentSection
        invoice={invoice}
        onMethodChange={actions.onMethodChange}
        onSchedule={actions.onSchedule}
      />
      <ApprovalSection invoice={invoice} />
      <Divider />
      <CodingSection invoice={invoice} />
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type FilterValue = 'all' | 'inbox' | 'scheduled' | 'paid';

function matchesFilter(invoice: Invoice, filter: FilterValue): boolean {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'inbox') {
    return isInbox(invoice);
  }
  return invoice.status === filter;
}

export default function FinInvoicesBillpayTemplate() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>('inv-halcyon');
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px folds the review panel inline below the
  // table; <=860px drops the Invoice # column and wraps toolbars.
  const isPanelInline = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return invoices.filter(invoice => {
      if (!matchesFilter(invoice, filter)) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      const vendor = VENDORS[invoice.vendorId];
      return \`\${vendor.name} \${invoice.number} \${invoice.memo}\`
        .toLowerCase()
        .includes(needle);
    });
  }, [invoices, filter, query]);

  // Sort plugin — default soonest-due first among unpaid; ISO date strings
  // compare lexicographically.
  const {sortedData, sortConfig} = useTableSortableState<Invoice>({
    data: visibleRows,
    defaultSort: [{sortKey: 'dueDate', direction: 'ascending'}],
    comparators: {
      dueDate: (a, b) => a.dueDate.localeCompare(b.dueDate),
      amountCents: (a, b) => a.amountCents - b.amountCents,
      vendorId: (a, b) => VENDORS[a.vendorId].name.localeCompare(VENDORS[b.vendorId].name),
      status: (a, b) => a.status.localeCompare(b.status),
    },
  });
  const sortPlugin = useTableSortable<Invoice>(sortConfig);

  // Row-click plugin: any row becomes the review-panel subject.
  const activePlugin = useMemo<TablePlugin<Invoice>>(
    () => ({
      transformBodyRow: (props, item) => {
        const prevOnClick = props.htmlProps.onClick;
        const isActive = item.id === activeId;
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            onClick: event => {
              prevOnClick?.(event);
              setActiveId(item.id);
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
    [activeId],
  );

  const columns = useMemo(() => buildColumns(isCompact), [isCompact]);
  const activeInvoice = invoices.find(invoice => invoice.id === activeId) ?? null;

  // Toolbar subtotals — derived from the same rows the table renders, so
  // every repeated figure agrees (inbox 4/$26,520.00, scheduled 5/$95,400.00,
  // paid 3/$29,290.00 with the untouched fixtures).
  const inboxRows = invoices.filter(isInbox);
  const scheduledRows = invoices.filter(invoice => invoice.status === 'scheduled');
  const paidRows = invoices.filter(invoice => invoice.status === 'paid');
  const inboxCents = inboxRows.reduce((sum, invoice) => sum + invoice.amountCents, 0);
  const scheduledCents = scheduledRows.reduce((sum, invoice) => sum + invoice.amountCents, 0);

  const confirmField = (invoiceId: string, key: string) => {
    setInvoices(prev =>
      prev.map(invoice =>
        invoice.id === invoiceId && !invoice.confirmedKeys.includes(key)
          ? {...invoice, confirmedKeys: [...invoice.confirmedKeys, key]}
          : invoice,
      ),
    );
    setAnnouncement('Field confirmed');
  };

  const approveVariance = (invoiceId: string) => {
    setInvoices(prev =>
      prev.map(invoice =>
        invoice.id === invoiceId ? {...invoice, varianceApproved: true} : invoice,
      ),
    );
    setAnnouncement('Match variance approved');
  };

  const changeMethod = (invoiceId: string, method: PayMethod) => {
    setInvoices(prev =>
      prev.map(invoice => (invoice.id === invoiceId ? {...invoice, method} : invoice)),
    );
  };

  const scheduleInvoice = (invoiceId: string) => {
    setInvoices(prev =>
      prev.map(invoice =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              status: 'scheduled' as InvoiceStatus,
              payDate: invoice.recommendedPayDate,
              approvals: invoice.approvals.map(step =>
                step.state === 'current'
                  ? {...step, state: 'done' as const, at: 'Jul 3, 09:30'}
                  : step,
              ),
            }
          : invoice,
      ),
    );
    const invoice = invoices.find(row => row.id === invoiceId);
    if (invoice !== undefined) {
      setAnnouncement(
        \`Scheduled \${formatUsd(invoice.amountCents)} to \${
          VENDORS[invoice.vendorId].name
        } for \${formatDate(invoice.recommendedPayDate)}\`,
      );
    }
  };

  const reviewActions: ReviewActions = {
    onConfirm: confirmField,
    onApproveVariance: approveVariance,
    onMethodChange: changeMethod,
    onSchedule: scheduleInvoice,
  };

  // ----- header: brand, search, add-invoice actions -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={LandmarkIcon} size="md" color="secondary" />
          <Heading level={1}>Bill Pay</Heading>
          <Text type="supporting" color="secondary">Kestrel Labs · Accounts payable</Text>
        </HStack>
        <StackItem size="fill">
          <TextInput
            label="Search invoices"
            isLabelHidden
            size="sm"
            width="100%"
            style={{maxWidth: 480}}
            placeholder="Search vendors, invoice #, memo…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        <Text type="supporting" color="secondary" maxLines={1}>Inbox syncs from ap@kestrellabs.com</Text>
        <Button
          label="Add invoice"
          variant="primary"
          size="sm"
          icon={<Icon icon={UploadIcon} size="sm" color="inherit" />}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- filter toolbar: status segments + reconciling subtotals -----
  const toolbar = (
    <HStack gap={3} vAlign="center" style={styles.contentToolbar} wrap="wrap">
      <SegmentedControl
        label="Invoice status filter"
        value={filter}
        onChange={value => setFilter(value as FilterValue)}
        size="sm">
        <SegmentedControlItem label={\`All \${invoices.length}\`} value="all" />
        <SegmentedControlItem label={\`Inbox \${inboxRows.length}\`} value="inbox" />
        <SegmentedControlItem label={\`Scheduled \${scheduledRows.length}\`} value="scheduled" />
        <SegmentedControlItem label={\`Paid \${paidRows.length}\`} value="paid" />
      </SegmentedControl>
      <StackItem size="fill" />
      <HStack gap={1} vAlign="center">
        <Icon icon={InboxIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {formatUsd(inboxCents)} awaiting review
        </Text>
      </HStack>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {formatUsd(scheduledCents)} scheduled
      </Text>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {sortedData.length} {sortedData.length === 1 ? 'invoice' : 'invoices'}
      </Text>
    </HStack>
  );

  const reviewPanel =
    activeInvoice === null ? (
      <EmptyState
        isCompact
        icon={<Icon icon={ReceiptTextIcon} size="lg" />}
        title="No invoice selected"
        description="Select an invoice in the table to review its OCR extract, match, and payment schedule."
      />
    ) : (
      <ReviewPanelBody invoice={activeInvoice} actions={reviewActions} />
    );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              {toolbar}
              <div style={styles.contentScroll}>
                <ForecastStrip invoices={invoices} isCompact={isCompact} />
                <div style={styles.tableWrap}>
                  <Table<Invoice>
                    data={sortedData}
                    columns={columns}
                    idKey="id"
                    density="balanced"
                    dividers="rows"
                    hasHover
                    plugins={{sort: sortPlugin, active: activePlugin}}
                    emptyState={
                      <EmptyState
                        isCompact
                        icon={<Icon icon={SearchIcon} size="lg" />}
                        title={
                          query.trim().length > 0
                            ? 'No matching invoices'
                            : 'Nothing here yet'
                        }
                        description={
                          query.trim().length > 0
                            ? 'Try a different vendor, invoice number, or memo.'
                            : 'Invoices captured from ap@kestrellabs.com will appear here.'
                        }
                      />
                    }
                  />
                </div>
                {isPanelInline ? (
                  <div style={styles.detailInline}>{reviewPanel}</div>
                ) : null}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isPanelInline ? undefined : (
            <LayoutPanel width={380} padding={0} hasDivider label="Invoice review">
              <div style={styles.detailScroll}>{reviewPanel}</div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}

`;export{e as default};