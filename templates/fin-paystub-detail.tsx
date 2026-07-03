// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one Kestrel Labs employee pay
 *   statement for Marcus Webb, pay date 2026-07-15, period Jul 1 – Jul 15,
 *   check #13 of 24: fixed integer-cent earnings, deduction, tax and
 *   employer-cost rows whose totals reconcile by construction — subtotals,
 *   net pay, the direct-deposit split, and the total-compensation note are
 *   all derived from the same row constants, never restated). No
 *   Date.now(), Math.random(), or network assets — currency strings come
 *   from a local pure cents formatter, never locale APIs.
 * @output Employee pay-statement detail: a net-pay hero figure with a
 *   gross-to-net equation strip and a two-account direct-deposit split
 *   (checking 80% / savings 20%), above four sectioned statement tables —
 *   Earnings (base, spot bonus, RSU vest with share count and FMV),
 *   Pre-tax deductions (401(k) 6% with an informational employer-match
 *   row, medical/dental/vision premiums, HSA), Taxes (federal, CA state,
 *   Social Security with a YTD wage-base cap progress bar, Medicare, CA
 *   SDI) and Post-tax (ESPP) — every row carrying Current and YTD columns,
 *   with a USD / % of gross view toggle; the end panel is an
 *   employer-cost sidebar (employer taxes + benefits contributions, both
 *   Current/YTD) capped by a total-compensation callout and statement
 *   facts. Download PDF and copy-advice-number actions confirm via Toast.
 * @position Page template; emitted by `astryx template fin-paystub-detail`
 *
 * Frame: header (identity + statement meta + view toggle + download) |
 * statement scroll region (fill) | employer-cost panel 360 (end).
 *
 * Container policy (finance-console archetype): statement sections are
 * flat children-mode Tables under plain section headings and the employer
 * sidebar is flat labeled rows — no Cards — so the page reads as one dense
 * payroll document. The only "chrome" objects are the 36px gradient bank
 * tiles in the deposit split (styled placeholders standing in for bank
 * marks) and the muted total-compensation callout, which is a plain
 * tinted div, not a Card.
 *
 * Responsive contract:
 * - > 1024px: statement sections keep the remaining width; employer costs
 *   are a fixed 360px LayoutPanel on the end edge using the sticky idiom
 *   (position: sticky, maxHeight: 100%, own scroll).
 * - <= 1024px: the end panel is dropped; employer costs + statement facts
 *   stack after the post-tax section inside the single scroller, so
 *   nothing becomes unreachable.
 * - <= 768px: the Details column (qty/rate) is hidden — share counts,
 *   FMV, deferral rates move into each row's supporting line; the hero
 *   equation strip wraps.
 * - <= 640px: the header wraps the toggle + download under the identity
 *   row; the deposit split stacks vertically; sm buttons grow to ~40px
 *   tap targets. No hover-only affordances anywhere.
 *
 * Color policy: token-pure everywhere except (a) the 36px deposit bank
 * tiles — scheme-locked brand art with literal gradient stops, a literal
 * white glyph, and colorScheme pinned to 'light' so the placeholders
 * render identically in both schemes (real bank marks would not recolor
 * either) — and (b) the section accent swatches, which use the
 * repo-standard data-viz categorical tokens WITH their light-dark()
 * fallback pairs because the demo does not inject those tokens.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {Heading, Text} from '@astryxdesign/core/Text';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CopyIcon,
  DownloadIcon,
  LandmarkIcon,
  PiggyBankIcon,
} from 'lucide-react';

// ============= STYLES =============
// Plain inline styles using Astryx design-token CSS variables (declared at
// :root by `@astryxdesign/core/astryx.css`). No StyleX compiler required.

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — anchor the fill chain to the viewport.
  root: {
    height: '100dvh',
    width: '100%',
  },
  headerRow: {
    width: '100%',
  },
  contentFill: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  scrollRegion: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  // Docked employer-cost pane: stick to the top of whichever ancestor
  // scrolls (payout-statements sticky idiom).
  detailSticky: {
    position: 'sticky',
    insetBlockStart: 0,
    maxHeight: '100%',
    overflowY: 'auto',
  },
  sectionPad: {
    padding: 'var(--spacing-4)',
  },

  // ---- net-pay hero ----
  hero: {
    padding: 'var(--spacing-5) var(--spacing-4) var(--spacing-4)',
  },
  heroFigure: {
    fontSize: 44,
    lineHeight: 1.1,
    fontWeight: 650,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text)',
  },
  // Gross − pre-tax − taxes − post-tax = net, rendered as labeled chips
  // joined by operator glyphs; wraps instead of clipping below 768px.
  equationChip: {
    padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-control, 6px)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  equationOperator: {
    color: 'var(--color-text-secondary)',
    fontWeight: 600,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
    flexShrink: 0,
  },
  // Deposit rows: 36px gradient tiles are scheme-locked brand art (see the
  // Color policy in the header comment) — literal stops + white glyph.
  bankTile: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-control, 6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    colorScheme: 'light',
    flexShrink: 0,
  },
  depositRow: {
    flex: 1,
    minWidth: 0,
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container, 10px)',
    border: 'var(--border-width) solid var(--color-border)',
  },

  // ---- statement tables ----
  // Children-mode Table defaults to table-layout auto, where the cells'
  // truncation styles (max-width: 0) collapse fixed-width columns; fixed
  // layout sizes columns from the header row (footgun 4 — every fixed
  // column sets BOTH width and minWidth on its header cell).
  table: {
    tableLayout: 'fixed',
  },
  numericHeader: {
    textAlign: 'end',
  },
  numericCell: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
  },
  numeric: {
    fontVariantNumeric: 'tabular-nums',
  },
  // Subtotal rows read as document math: top rule + emphasis.
  subtotalRow: {
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Social Security cap meter, embedded under the SS tax row. The track is
  // a muted rail; the fill is a plain accent div so no ProgressBar
  // min-width constraint applies inside the table cell.
  capTrack: {
    position: 'relative',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 1px var(--color-border)',
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
  },
  capFill: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    borderRadius: 4,
    backgroundColor: 'var(--color-accent)',
  },

  // ---- employer-cost sidebar ----
  costRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 84px 92px',
    gap: 'var(--spacing-2)',
    alignItems: 'baseline',
  },
  costFigure: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
  },
  totalCompCallout: {
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container, 10px)',
    backgroundColor: 'var(--color-accent-muted)',
  },

  // ~40px touch targets on phones (size="sm" renders 28px).
  buttonTapTarget: {height: 40},
};

// Section accent swatches — data-viz categorical tokens are NOT injected
// by the demo, so the repo-standard light-dark() fallbacks are mandatory
// (values copied from templates/calendar-month-grid.tsx).
const SECTION_COLOR = {
  earnings: 'var(--color-data-categorical-green,  light-dark(#0B991F, #34C759))',
  preTax: 'var(--color-data-categorical-blue,   light-dark(#0171E3, #4C9EFF))',
  taxes: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  postTax: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
} as const;

// ============= DATA =============
// One pay statement for Marcus Webb (Platform lead, Engineering, SF HQ —
// Kestrel Labs canonical roster). Semi-monthly payroll: pay date Jul 15,
// 2026 is check 13 of 24 (Jan 15 → Jul 15 inclusive), so YTD figures are
// 13 periods of every recurring line. All money is integer cents; every
// subtotal, the net figure, the deposit split, and the employer totals
// are DERIVED from these row constants — nothing is restated by hand.

interface StatementRow {
  id: string;
  label: string;
  /** Supporting line under the label (rates, plan names, share math). */
  detail: string;
  /** Details column, e.g. "120 sh × $46.25" or "6.0% deferral". */
  qty?: string;
  currentCents: number;
  ytdCents: number;
  /**
   * Informational rows (the 401(k) employer match) render muted with a
   * Badge and are EXCLUDED from the section subtotal — the money never
   * touches the employee's pay.
   */
  isInformational?: boolean;
}

const STATEMENT = {
  employee: 'Marcus Webb',
  role: 'Platform lead',
  department: 'Engineering',
  office: 'SF HQ',
  employeeId: 'EMP-0042',
  payDate: 'Jul 15, 2026',
  periodLabel: 'Jul 1 – Jul 15, 2026',
  checkNumber: 13,
  checksPerYear: 24,
  adviceNumber: 'ADV-2026-0713-042',
  payGroup: 'US Salaried · semi-monthly',
  annualSalaryCents: 22_800_000, // $228,000.00 / 24 = $9,500.00 per check
} as const;

// ---- Earnings ----
// RSU vests quarterly on Jan/Apr/Jul/Oct 15 (120 sh per vest). YTD RSU
// income is the three 2026 vests at their vest-date FMVs:
//   Jan 15  120 sh × $41.00 = $4,920.00
//   Apr 15  120 sh × $44.50 = $5,340.00
//   Jul 15  120 sh × $46.25 = $5,550.00  (this statement)
// YTD bonus = $4,000.00 annual bonus (Mar 15) + this $2,500.00 spot bonus.
const RSU_SHARES = 120;
const RSU_FMV_CENTS = 4_625; // $46.25 409A FMV at the Jul 15 vest

const EARNINGS: StatementRow[] = [
  {
    id: 'base',
    label: 'Base salary',
    detail: 'Salaried · $228,000.00 / yr ÷ 24',
    qty: 'Semi-monthly',
    currentCents: 950_000,
    ytdCents: 12_350_000, // 13 checks × $9,500.00
  },
  {
    id: 'bonus',
    label: 'Spot bonus',
    detail: 'Q2 platform launch award · supplemental',
    qty: 'One-time',
    currentCents: 250_000,
    ytdCents: 650_000, // $4,000.00 (Mar 15) + $2,500.00 (Jul 15)
  },
  {
    id: 'rsu',
    label: 'RSU vest',
    detail: 'KSTL 2024 grant · quarterly vest, 3rd of 16 tranches',
    qty: `${RSU_SHARES} sh × $46.25`,
    currentCents: RSU_SHARES * RSU_FMV_CENTS, // $5,550.00
    ytdCents: 1_581_000, // $4,920.00 + $5,340.00 + $5,550.00
  },
];

// ---- Pre-tax deductions ----
// 401(k) defers 6.0% of 401(k)-eligible pay (base + bonus, not RSUs):
// 6% × $12,000.00 = $720.00 this check; 6% × $130,000.00 YTD = $7,800.00.
// The employer match (50% of deferrals up to 6% → 3% of eligible pay) is
// informational — shown here because employees look for it on the stub.
const PRE_TAX: StatementRow[] = [
  {
    id: '401k',
    label: '401(k) — traditional',
    detail: '6.0% of eligible pay (base + bonus; RSUs excluded)',
    qty: '6.0% deferral',
    currentCents: 72_000,
    ytdCents: 780_000,
  },
  {
    id: '401k-match',
    label: '401(k) employer match',
    detail: '50% of deferrals up to 6% — paid by Kestrel, not deducted',
    qty: '3.0% of eligible',
    currentCents: 36_000,
    ytdCents: 390_000,
    isInformational: true,
  },
  {
    id: 'medical',
    label: 'Medical — HDHP',
    detail: 'Sequoia Health HDHP · employee share (§125)',
    qty: 'Employee + 1',
    currentCents: 16_400,
    ytdCents: 213_200,
  },
  {
    id: 'dental',
    label: 'Dental',
    detail: 'Delta PPO · employee share (§125)',
    qty: 'Employee + 1',
    currentCents: 1_850,
    ytdCents: 24_050,
  },
  {
    id: 'vision',
    label: 'Vision',
    detail: 'VSP Choice · employee share (§125)',
    qty: 'Employee + 1',
    currentCents: 620,
    ytdCents: 8_060,
  },
  {
    id: 'hsa',
    label: 'HSA contribution',
    detail: 'Employee election · family-limit pacing with the employer seed',
    qty: '$175.00 / check',
    currentCents: 17_500,
    ytdCents: 227_500,
  },
];

// ---- Taxes ----
// FICA wages exclude §125 premiums and HSA but NOT the 401(k) deferral:
//   current  $17,550.00 − $363.70  = $17,186.30
//   YTD     $145,810.00 − $4,728.10 = $141,081.90
// SS / Medicare / CA SDI rows are computed from these bases at their
// statutory rates so the arithmetic on the stub is honest.
const FICA_WAGES_CURRENT = 1_718_630;
const FICA_WAGES_YTD = 14_108_190;
const SS_WAGE_BASE = 18_450_000; // 2026 Social Security wage base $184,500

const SS_CURRENT = Math.round(FICA_WAGES_CURRENT * 0.062); // $1,065.55
const SS_YTD = Math.round(FICA_WAGES_YTD * 0.062); // $8,747.08
const MEDICARE_CURRENT = Math.round(FICA_WAGES_CURRENT * 0.0145); // $249.20
const MEDICARE_YTD = Math.round(FICA_WAGES_YTD * 0.0145); // $2,045.69

const TAXES: StatementRow[] = [
  {
    id: 'fed',
    label: 'Federal income tax',
    detail: 'W-4 (2026) Single · supplemental flat 22% on bonus + RSU',
    qty: 'Per W-4',
    currentCents: 346_100,
    ytdCents: 2_721_450,
  },
  {
    id: 'ca',
    label: 'CA state income tax',
    detail: 'DE 4 Single, 0 allowances · supplemental 10.23%',
    qty: 'Per DE 4',
    currentCents: 136_200,
    ytdCents: 1_068_940,
  },
  {
    id: 'ss',
    label: 'Social Security (OASDI)',
    detail: '6.2% of $17,186.30 FICA wages this check',
    qty: '6.2%',
    currentCents: SS_CURRENT,
    ytdCents: SS_YTD,
  },
  {
    id: 'medicare',
    label: 'Medicare',
    detail: '1.45% · Additional 0.9% starts at $200,000.00 Medicare wages',
    qty: '1.45%',
    currentCents: MEDICARE_CURRENT,
    ytdCents: MEDICARE_YTD,
  },
  {
    id: 'casdi',
    label: 'CA SDI',
    detail: 'State disability insurance · no wage cap since 2024',
    qty: '1.2%',
    currentCents: Math.round(FICA_WAGES_CURRENT * 0.012), // $206.24
    ytdCents: Math.round(FICA_WAGES_YTD * 0.012), // $1,692.98
  },
];

// ---- Post-tax ----
const POST_TAX: StatementRow[] = [
  {
    id: 'espp',
    label: 'ESPP contribution',
    detail: '10% of base salary · 15% discount at the Aug 31 purchase',
    qty: '10.0% of base',
    currentCents: 95_000,
    ytdCents: 1_235_000,
  },
];

// ---- Derived totals (single source of truth for every repeated figure) ----
function sumCurrent(rows: StatementRow[]): number {
  return rows.reduce(
    (total, row) => (row.isInformational ? total : total + row.currentCents),
    0,
  );
}
function sumYtd(rows: StatementRow[]): number {
  return rows.reduce(
    (total, row) => (row.isInformational ? total : total + row.ytdCents),
    0,
  );
}

const GROSS_CURRENT = sumCurrent(EARNINGS); // $17,550.00
const GROSS_YTD = sumYtd(EARNINGS); // $145,810.00
const PRE_TAX_CURRENT = sumCurrent(PRE_TAX); // $1,083.70
const PRE_TAX_YTD = sumYtd(PRE_TAX); // $12,528.10
const TAXES_CURRENT = sumCurrent(TAXES); // $6,343.99
const TAXES_YTD = sumYtd(TAXES); // $50,389.65
const POST_TAX_CURRENT = sumCurrent(POST_TAX); // $950.00
const POST_TAX_YTD = sumYtd(POST_TAX); // $12,350.00

const NET_CURRENT =
  GROSS_CURRENT - PRE_TAX_CURRENT - TAXES_CURRENT - POST_TAX_CURRENT; // $9,172.31
const NET_YTD = GROSS_YTD - PRE_TAX_YTD - TAXES_YTD - POST_TAX_YTD; // $70,542.25

// Direct-deposit split: savings takes 20% (rounded to the cent); checking
// receives the remainder so the two deposits always sum to net exactly.
const SAVINGS_DEPOSIT = Math.round(NET_CURRENT * 0.2); // $1,834.46
const CHECKING_DEPOSIT = NET_CURRENT - SAVINGS_DEPOSIT; // $7,337.85

interface DepositAccount {
  id: string;
  label: string;
  detail: string;
  splitLabel: string;
  amountCents: number;
  icon: typeof LandmarkIcon;
  /**
   * Gradient placeholder standing in for a bank mark. Intentional literal
   * hex stops — scheme-locked brand art rendered on styles.bankTile, which
   * pins colorScheme (see the Color policy in the header comment).
   */
  tint: string;
}

// Labels lead with the account type + mask — the part an employee actually
// verifies — so the maxLines={1} title never truncates the account number;
// the bank name lives on the supporting line with the split percentage.
const DEPOSITS: DepositAccount[] = [
  {
    id: 'checking',
    label: 'Checking ••7314',
    detail: 'Golden Gate CU · remainder of net',
    splitLabel: '80%',
    amountCents: CHECKING_DEPOSIT,
    icon: LandmarkIcon,
    tint: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  },
  {
    id: 'savings',
    label: 'Savings ••9051',
    detail: 'Golden Gate CU · rounded to the cent',
    splitLabel: '20%',
    amountCents: SAVINGS_DEPOSIT,
    icon: PiggyBankIcon,
    tint: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
  },
];

// ---- Employer costs (sidebar) ----
// Employer FICA mirrors the employee rows by statute, so those figures
// reference the SAME computed constants — the sidebar cannot drift from
// the tax table. CA SUI (3.4% × $7,000 base) and FUTA (0.6% × $7,000)
// both capped out in Q1, hence $0.00 current with a fixed YTD.
interface CostRow {
  id: string;
  label: string;
  currentCents: number;
  ytdCents: number;
  note?: string;
}

const EMPLOYER_TAXES: CostRow[] = [
  {id: 'er-ss', label: 'Social Security', currentCents: SS_CURRENT, ytdCents: SS_YTD},
  {
    id: 'er-medicare',
    label: 'Medicare',
    currentCents: MEDICARE_CURRENT,
    ytdCents: MEDICARE_YTD,
  },
  {
    id: 'er-sui',
    label: 'CA SUI',
    currentCents: 0,
    ytdCents: 23_800,
    note: 'Capped Q1 ($7,000.00 base)',
  },
  {
    id: 'er-futa',
    label: 'FUTA',
    currentCents: 0,
    ytdCents: 4_200,
    note: 'Capped Q1 ($7,000.00 base)',
  },
];

const EMPLOYER_BENEFITS: CostRow[] = [
  {id: 'er-match', label: '401(k) match', currentCents: 36_000, ytdCents: 390_000},
  {id: 'er-medical', label: 'Medical — HDHP', currentCents: 49_200, ytdCents: 639_600},
  {id: 'er-dental', label: 'Dental', currentCents: 3_700, ytdCents: 48_100},
  {id: 'er-vision', label: 'Vision', currentCents: 930, ytdCents: 12_090},
  {
    id: 'er-hsa',
    label: 'HSA employer seed',
    currentCents: 2_500,
    ytdCents: 32_500,
    note: '$600.00 / yr, paid per check',
  },
];

function sumCostCurrent(rows: CostRow[]): number {
  return rows.reduce((total, row) => total + row.currentCents, 0);
}
function sumCostYtd(rows: CostRow[]): number {
  return rows.reduce((total, row) => total + row.ytdCents, 0);
}

const EMPLOYER_CURRENT =
  sumCostCurrent(EMPLOYER_TAXES) + sumCostCurrent(EMPLOYER_BENEFITS); // $2,238.05
const EMPLOYER_YTD = sumCostYtd(EMPLOYER_TAXES) + sumCostYtd(EMPLOYER_BENEFITS); // $22,295.67
const TOTAL_COMP_CURRENT = GROSS_CURRENT + EMPLOYER_CURRENT; // $19,788.05
const TOTAL_COMP_YTD = GROSS_YTD + EMPLOYER_YTD; // $168,105.67

// ============= HELPERS =============
// Pure local money helpers — no Intl/locale APIs, so output is identical
// in every environment.

/** 917_231 -> "$9,172.31"; -21_500 -> "-$215.00". */
function formatUSD(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = String(Math.floor(abs / 100)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ',',
  );
  const fraction = String(abs % 100).padStart(2, '0');
  return `${sign}$${dollars}.${fraction}`;
}

/** Share of this check's gross, one decimal: 634_399 -> "36.1%". */
function formatPctOfGross(cents: number): string {
  return `${((cents / GROSS_CURRENT) * 100).toFixed(1)}%`;
}

type AmountView = 'usd' | 'pct';

/** Current-column display honoring the USD / % of gross toggle. */
function formatCurrent(cents: number, view: AmountView): string {
  return view === 'usd' ? formatUSD(cents) : formatPctOfGross(cents);
}

// ============= SS WAGE-BASE CAP METER =============
// Embedded under the Social Security row: YTD OASDI-taxable wages against
// the $184,500.00 2026 wage base, with the remaining employee tax spelled
// out so the bar is a readout, not decoration.

const SS_CAP_PCT = (FICA_WAGES_YTD / SS_WAGE_BASE) * 100; // 76.5%
const SS_REMAINING_TAX = Math.round((SS_WAGE_BASE - FICA_WAGES_YTD) * 0.062); // $2,691.92

function SocialSecurityCapMeter() {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(SS_CAP_PCT)}
          aria-label="Social Security taxable wages toward the 2026 wage base"
          style={styles.capTrack}>
          <div style={{...styles.capFill, width: `${SS_CAP_PCT}%`}} />
        </div>
        <Text type="supporting" color="secondary" style={styles.numeric}>
          {SS_CAP_PCT.toFixed(1)}% of cap
        </Text>
      </HStack>
      <Text type="supporting" color="secondary">
        {formatUSD(FICA_WAGES_YTD)} of {formatUSD(SS_WAGE_BASE)} 2026 wage
        base · {formatUSD(SS_REMAINING_TAX)} OASDI remains before withholding
        stops (~Sep 30 check)
      </Text>
    </VStack>
  );
}

// ============= SECTION TABLE =============
// One shared children-mode Table shape for all four statement sections so
// the Current / YTD columns land on the same gridlines down the page.

interface SectionTableProps {
  title: string;
  caption: string;
  accent: string;
  rows: StatementRow[];
  subtotalLabel: string;
  view: AmountView;
  /** <=768px: Details column hidden; qty folds into the supporting line. */
  isCompact: boolean;
  /** Rendered inside the named row's description cell (SS cap meter). */
  extraForRowId?: string;
  extraContent?: ReactNode;
}

function SectionTable({
  title,
  caption,
  accent,
  rows,
  subtotalLabel,
  view,
  isCompact,
  extraForRowId,
  extraContent,
}: SectionTableProps) {
  const subtotalCurrent = sumCurrent(rows);
  const subtotalYtd = sumYtd(rows);

  return (
    <VStack gap={2} style={styles.sectionPad}>
      <HStack gap={2} vAlign="center">
        <div aria-hidden style={{...styles.swatch, backgroundColor: accent}} />
        <StackItem size="fill">
          <Heading level={3}>{title}</Heading>
        </StackItem>
        <Text type="supporting" color="secondary">
          {caption}
        </Text>
      </HStack>
      <Table density="compact" dividers="rows" tableProps={{style: styles.table}}>
        <TableHeader>
          <TableRow isHeaderRow>
            {/* Fixed columns set width AND minWidth (footgun 4) so the
                cells' truncation max-width cannot collapse them. */}
            <TableHeaderCell scope="col">Description</TableHeaderCell>
            {!isCompact && (
              <TableHeaderCell scope="col" style={{width: 150, minWidth: 150}}>
                Details
              </TableHeaderCell>
            )}
            <TableHeaderCell
              scope="col"
              style={{...styles.numericHeader, width: 110, minWidth: 110}}>
              {view === 'usd' ? 'Current' : '% of gross'}
            </TableHeaderCell>
            <TableHeaderCell
              scope="col"
              style={{...styles.numericHeader, width: 120, minWidth: 120}}>
              YTD
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.id}>
              <TableCell scope="row">
                <VStack gap={0.5}>
                  <HStack gap={2} vAlign="center">
                    <Text type="body" maxLines={1}>
                      {row.label}
                    </Text>
                    {/* neutral, not info: the info variant is a solid
                        accent pill (black/white) that overpowers the
                        statement rows. */}
                    {row.isInformational && (
                      <Badge variant="neutral" label="Employer-paid" />
                    )}
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {isCompact && row.qty != null
                      ? `${row.qty} · ${row.detail}`
                      : row.detail}
                  </Text>
                  {row.id === extraForRowId ? extraContent : null}
                </VStack>
              </TableCell>
              {!isCompact && (
                <TableCell>
                  <Text type="body" color="secondary" maxLines={1}>
                    {row.qty ?? '—'}
                  </Text>
                </TableCell>
              )}
              <TableCell style={styles.numericCell}>
                <Text
                  type="body"
                  color={row.isInformational ? 'secondary' : undefined}>
                  {formatCurrent(row.currentCents, view)}
                </Text>
              </TableCell>
              <TableCell style={styles.numericCell}>
                <Text
                  type="body"
                  color={row.isInformational ? 'secondary' : undefined}>
                  {formatUSD(row.ytdCents)}
                </Text>
              </TableCell>
            </TableRow>
          ))}
          <TableRow style={styles.subtotalRow}>
            <TableCell scope="row">
              <Text type="label">{subtotalLabel}</Text>
            </TableCell>
            {!isCompact && <TableCell />}
            <TableCell style={styles.numericCell}>
              <Text type="label">{formatCurrent(subtotalCurrent, view)}</Text>
            </TableCell>
            <TableCell style={styles.numericCell}>
              <Text type="label">{formatUSD(subtotalYtd)}</Text>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </VStack>
  );
}

// ============= NET-PAY HERO =============

const EQUATION_TERMS = [
  {id: 'gross', label: 'Gross pay', cents: GROSS_CURRENT, accent: SECTION_COLOR.earnings, op: null},
  {id: 'pretax', label: 'Pre-tax', cents: PRE_TAX_CURRENT, accent: SECTION_COLOR.preTax, op: '−'},
  {id: 'taxes', label: 'Taxes', cents: TAXES_CURRENT, accent: SECTION_COLOR.taxes, op: '−'},
  {id: 'posttax', label: 'Post-tax', cents: POST_TAX_CURRENT, accent: SECTION_COLOR.postTax, op: '−'},
] as const;

function EquationChip({
  label,
  cents,
  accent,
}: {
  label: string;
  cents: number;
  accent: string;
}) {
  return (
    <div style={styles.equationChip}>
      <HStack gap={2} vAlign="center">
        <div aria-hidden style={{...styles.swatch, backgroundColor: accent}} />
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <Text type="label" style={styles.numeric}>
          {formatUSD(cents)}
        </Text>
      </HStack>
    </div>
  );
}

function NetPayHero({isPhone}: {isPhone: boolean}) {
  return (
    <VStack gap={4} style={styles.hero}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          Net pay · deposited {STATEMENT.payDate}
        </Text>
        <div style={styles.heroFigure}>{formatUSD(NET_CURRENT)}</div>
        <Text type="supporting" color="secondary">
          {formatUSD(NET_YTD)} net YTD across {STATEMENT.checkNumber} checks
        </Text>
      </VStack>

      {/* Gross-to-net equation: same categorical accents as the section
          swatches below, so the strip doubles as a legend. */}
      <HStack gap={2} vAlign="center" wrap="wrap">
        {EQUATION_TERMS.map(term => (
          <HStack key={term.id} gap={2} vAlign="center">
            {term.op != null && (
              <Text type="label" style={styles.equationOperator} aria-label="minus">
                {term.op}
              </Text>
            )}
            <EquationChip label={term.label} cents={term.cents} accent={term.accent} />
          </HStack>
        ))}
        <Text type="label" style={styles.equationOperator} aria-label="equals">
          =
        </Text>
        <div style={styles.equationChip}>
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Net
            </Text>
            <Text type="label" style={styles.numeric}>
              {formatUSD(NET_CURRENT)}
            </Text>
          </HStack>
        </div>
      </HStack>

      {/* Direct-deposit split: two accounts, amounts sum to net exactly
          (savings is the rounded 20%; checking takes the remainder). */}
      <VStack gap={2}>
        <Text type="label">Direct deposit — 2 accounts</Text>
        <HStack gap={3} wrap={isPhone ? 'wrap' : undefined}>
          {DEPOSITS.map(account => (
            <div key={account.id} style={styles.depositRow}>
              <HStack gap={3} vAlign="center">
                <div aria-hidden style={{...styles.bankTile, background: account.tint}}>
                  <Icon icon={account.icon} size="sm" color="inherit" />
                </div>
                <StackItem size="fill">
                  <VStack gap={0.5}>
                    <Text type="body" maxLines={1}>
                      {account.label}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {account.splitLabel} · {account.detail}
                    </Text>
                  </VStack>
                </StackItem>
                <Text type="label" style={styles.numeric}>
                  {formatUSD(account.amountCents)}
                </Text>
              </HStack>
            </div>
          ))}
        </HStack>
      </VStack>
    </VStack>
  );
}

// ============= EMPLOYER-COST SIDEBAR =============
// What Kestrel Labs pays ON TOP of gross for this employee. Employer FICA
// rows reuse the exact constants behind the tax table, so the two panels
// can never disagree.

function CostRows({title, rows}: {title: string; rows: CostRow[]}) {
  return (
    <VStack gap={2}>
      <Text type="label">{title}</Text>
      <VStack gap={1.5}>
        {rows.map(row => (
          <VStack key={row.id} gap={0}>
            <div style={styles.costRow}>
              <Text type="body" color="secondary" maxLines={1}>
                {row.label}
              </Text>
              <Text type="body" style={styles.costFigure}>
                {formatUSD(row.currentCents)}
              </Text>
              <Text type="body" color="secondary" style={styles.costFigure}>
                {formatUSD(row.ytdCents)}
              </Text>
            </div>
            {row.note != null && (
              <Text type="supporting" color="secondary">
                {row.note}
              </Text>
            )}
          </VStack>
        ))}
        <Divider />
        <div style={styles.costRow}>
          <Text type="label">Subtotal</Text>
          <Text type="label" style={styles.costFigure}>
            {formatUSD(sumCostCurrent(rows))}
          </Text>
          <Text type="label" style={styles.costFigure}>
            {formatUSD(sumCostYtd(rows))}
          </Text>
        </div>
      </VStack>
    </VStack>
  );
}

function EmployerCostsPanel() {
  return (
    <VStack gap={4} style={styles.sectionPad}>
      <VStack gap={0.5}>
        <Heading level={3}>Employer costs</Heading>
        <Text type="supporting" color="secondary">
          Paid by Kestrel Labs in addition to gross — never deducted from
          this statement.
        </Text>
      </VStack>

      {/* Column key for the two-figure rows below. */}
      <div style={styles.costRow}>
        <span />
        <Text type="supporting" color="secondary" style={styles.costFigure}>
          Current
        </Text>
        <Text type="supporting" color="secondary" style={styles.costFigure}>
          YTD
        </Text>
      </div>

      <CostRows title="Employer taxes" rows={EMPLOYER_TAXES} />
      <CostRows title="Benefits contributions" rows={EMPLOYER_BENEFITS} />

      <Divider />
      <div style={styles.costRow}>
        <Text type="label">Total employer cost</Text>
        <Text type="label" style={styles.costFigure}>
          {formatUSD(EMPLOYER_CURRENT)}
        </Text>
        <Text type="label" style={styles.costFigure}>
          {formatUSD(EMPLOYER_YTD)}
        </Text>
      </div>

      <div style={styles.totalCompCallout}>
        <VStack gap={1}>
          <Text type="label">Total cost of employment</Text>
          <Text type="body" style={styles.numeric}>
            {formatUSD(GROSS_CURRENT)} gross + {formatUSD(EMPLOYER_CURRENT)}{' '}
            employer = {formatUSD(TOTAL_COMP_CURRENT)} this period
          </Text>
          <Text type="supporting" color="secondary">
            {formatUSD(TOTAL_COMP_YTD)} YTD. Shown for cost transparency —
            employer taxes and contributions are not part of take-home pay.
          </Text>
        </VStack>
      </div>
    </VStack>
  );
}

// ============= STATEMENT FACTS =============

function StatementFacts({onCopyAdvice}: {onCopyAdvice: () => void}) {
  return (
    <VStack gap={2} style={styles.sectionPad}>
      <Heading level={3}>Statement facts</Heading>
      <MetadataList columns="single" label={{position: 'start', width: 128}}>
        <MetadataListItem label="Advice number">
          <HStack gap={2} vAlign="center">
            <Text type="body" style={styles.numeric}>
              {STATEMENT.adviceNumber}
            </Text>
            {/* Icon-only: a text label pushes the row past the panel's
                value column and wraps the advice number mid-string. */}
            <Button
              label="Copy advice number"
              variant="ghost"
              size="sm"
              isIconOnly
              icon={<Icon icon={CopyIcon} size="sm" />}
              onClick={onCopyAdvice}
            />
          </HStack>
        </MetadataListItem>
        <MetadataListItem label="Pay period">
          <Text type="body">{STATEMENT.periodLabel}</Text>
        </MetadataListItem>
        <MetadataListItem label="Check">
          <Text type="body">
            #{STATEMENT.checkNumber} of {STATEMENT.checksPerYear}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Pay group">
          <Text type="body">{STATEMENT.payGroup}</Text>
        </MetadataListItem>
        <MetadataListItem label="Federal filing">
          <Text type="body">Single · no extra withholding</Text>
        </MetadataListItem>
        <MetadataListItem label="CA filing">
          <Text type="body">DE 4 · Single, 0 allowances</Text>
        </MetadataListItem>
        <MetadataListItem label="Tax residence">
          <Text type="body">California ({STATEMENT.office})</Text>
        </MetadataListItem>
        <MetadataListItem label="SSN">
          <Text type="body">•••-••-6120</Text>
        </MetadataListItem>
      </MetadataList>
    </VStack>
  );
}

// ============= PAGE =============

export default function FinPaystubDetailTemplate() {
  const toast = useToast();
  const [view, setView] = useState<AmountView>('usd');

  // Responsive contract: <=1024px drops the end panel and stacks employer
  // costs after post-tax; <=768px hides the Details column; <=640px grows
  // sm buttons to ~40px tap targets and stacks the deposit split.
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 768px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const tapTargetStyle = isPhone ? styles.buttonTapTarget : undefined;

  const downloadPdf = () => {
    toast({
      body: 'PayStatement-2026-07-15-MWebb.pdf saved to Downloads',
      uniqueID: 'paystub-download',
    });
  };

  const copyAdviceNumber = () => {
    toast({
      body: `${STATEMENT.adviceNumber} copied to clipboard`,
      uniqueID: 'paystub-copy-advice',
    });
  };

  const sidebar = (
    <>
      <EmployerCostsPanel />
      <Divider />
      <StatementFacts onCopyAdvice={copyAdviceNumber} />
    </>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap="wrap" style={styles.headerRow}>
              <StackItem size="fill">
                <HStack gap={3} vAlign="center">
                  <Avatar name={STATEMENT.employee} size="small" />
                  <VStack gap={0.5}>
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      <Heading level={1}>Pay statement</Heading>
                      <Badge variant="neutral" label={STATEMENT.employeeId} />
                    </HStack>
                    <Text type="supporting" color="secondary">
                      {STATEMENT.employee} · {STATEMENT.role} ·{' '}
                      {STATEMENT.department} · {STATEMENT.office} · pay date{' '}
                      {STATEMENT.payDate}
                    </Text>
                  </VStack>
                </HStack>
              </StackItem>
              {/* <=640px this pair wraps to its own row under the title. */}
              <HStack gap={2} vAlign="center" wrap="wrap">
                <SegmentedControl
                  value={view}
                  onChange={value => setView(value as AmountView)}
                  label="Current-column amount display"
                  size="sm">
                  <SegmentedControlItem value="usd" label="USD" />
                  <SegmentedControlItem value="pct" label="% of gross" />
                </SegmentedControl>
                <Button
                  label="Download PDF"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={DownloadIcon} size="sm" />}
                  style={tapTargetStyle}
                  onClick={downloadPdf}
                />
              </HStack>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div style={styles.scrollRegion}>
                <NetPayHero isPhone={isPhone} />
                <Divider />
                <SectionTable
                  title="Earnings"
                  caption={`Gross ${formatUSD(GROSS_CURRENT)} this check`}
                  accent={SECTION_COLOR.earnings}
                  rows={EARNINGS}
                  subtotalLabel="Total gross pay"
                  view={view}
                  isCompact={isCompact}
                />
                <Divider />
                <SectionTable
                  title="Pre-tax deductions"
                  caption="Reduce federal, state and FICA-eligible wages"
                  accent={SECTION_COLOR.preTax}
                  rows={PRE_TAX}
                  subtotalLabel="Total pre-tax deductions"
                  view={view}
                  isCompact={isCompact}
                />
                <Divider />
                <SectionTable
                  title="Taxes withheld"
                  caption={`On ${formatUSD(FICA_WAGES_CURRENT)} FICA wages`}
                  accent={SECTION_COLOR.taxes}
                  rows={TAXES}
                  subtotalLabel="Total taxes"
                  view={view}
                  isCompact={isCompact}
                  extraForRowId="ss"
                  extraContent={<SocialSecurityCapMeter />}
                />
                <Divider />
                <SectionTable
                  title="Post-tax deductions"
                  caption="Withheld after taxes"
                  accent={SECTION_COLOR.postTax}
                  rows={POST_TAX}
                  subtotalLabel="Total post-tax deductions"
                  view={view}
                  isCompact={isCompact}
                />
                {isNarrow && (
                  <>
                    <Divider />
                    {sidebar}
                  </>
                )}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isNarrow ? undefined : (
            <LayoutPanel
              width={360}
              padding={0}
              hasDivider
              isScrollable={false}
              label="Employer costs and statement facts">
              <div style={styles.detailSticky}>{sidebar}</div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
