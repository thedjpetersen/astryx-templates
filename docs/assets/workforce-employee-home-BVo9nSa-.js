var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Marcus Webb's (Platform lead,
 *   Engineering, SF HQ) employee record at Kestrel Labs (140-person
 *   platform company), pinned to Wednesday, Jul 8, 2026: the Jun 30
 *   semi-monthly paycheck ($8,750.00 gross, $5,348.40 net after an
 *   itemized $3,401.60 of deductions), YTD figures that are exactly 12
 *   pay periods of those numbers ($105,000.00 gross / $64,180.80 net),
 *   PTO banks whose available/used/scheduled days reconcile with the
 *   one approved Aug 3–7 trip, a benefits enrollment (Kestrel Gold PPO,
 *   Dental + Vision bundle, 6% 401k with 4% match where $525.00 =
 *   6% x $8,750.00), two open tasks + one done, a 6-person org slice
 *   (manager Priya Raman + 5 reports incl. new hire Ava Lindqvist who
 *   starts Jul 20), and two company announcements. No clocks, no
 *   Math.random(), no network media; every repeated figure is derived
 *   from these module-scope tables so the panels reconcile by
 *   construction.
 * @output Employee Self-Service Home — the employee-facing hub of the
 *   Kestrel Labs workforce platform. Greeting header with a
 *   next-payday countdown chip (Jul 15, in 7 days), a quick-actions
 *   row (request time off, view paystub, refer a friend with the
 *   $2,500 bonus note), a my-pay Card (last net pay with an itemized
 *   deduction breakdown toggle, view-statement link, YTD gross/net), a
 *   time-off Card (vacation + sick balances with ProgressBars, request
 *   button, approved Aug 3–7 trip chip), a my-benefits strip (medical
 *   plan, dental+vision, 401k contribution with an inline quick-change
 *   editor that recomputes the per-paycheck deferral), and a company
 *   announcements feed (2 posts with working like toggles). The
 *   320px end rail holds tasks-for-you (sign the handbook, security
 *   training — due chips, one completable in place) and the org strip
 *   (manager + reports avatars, new-hire start chip).
 * @position Page template; emitted by \`astryx template workforce-employee-home\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (greeting, identity line, payday countdown chip, settings)
 *   | content (quick actions, pay / time-off Card Grid, benefits strip,
 *     announcements — one vertical scroller)
 *   | end panel 320 (tasks-for-you + org strip, scrolls independently).
 *
 * Container policy: employee-home hub archetype — the pay, time-off,
 *   and benefits summary widgets are genuine glanceable Cards; the page
 *   chrome, the end rail, quick-action tiles, task rows, org rows, and
 *   announcement posts are frame-first styled bordered divs, not Cards.
 *
 * Color policy: token-pure everywhere; the only literals are
 *   \`light-dark()\` accent-tint pairs (payday chip, approved-trip chip,
 *   benefit icon wells, due chips) following the repo-standard
 *   data-viz fallback pattern — the demo does not inject
 *   \`--color-data-categorical-*\`. No scheme-locked surfaces.
 *
 * Responsive contract:
 * - > 1180px: full frame with the 320px tasks/org rail on the end edge.
 * - <= 1180px: the rail drops; tasks and org render inline below the
 *   announcements feed in the main scroller.
 * - Summary Grid minWidth 340 (align start so the shorter card never
 *   shows a stretched void) — pay + time-off side by side wide, stacked
 *   below ~760px; benefits strip segments wrap at the same point;
 *   quick-action tiles wrap 3 -> 2 -> 1 via Grid minWidth 220 auto-fit.
 * - <= 860px: the greeting header wraps (payday chip + settings drop
 *   below the greeting) instead of clipping.
 * - Main content and the rail scroll independently (\`minHeight: 0\`
 *   down each flex chain).
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  CalendarDaysIcon,
  CalendarPlusIcon,
  CheckCircle2Icon,
  FileSignatureIcon,
  GiftIcon,
  HeartPulseIcon,
  MegaphoneIcon,
  PiggyBankIcon,
  PlaneIcon,
  ReceiptIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SmileIcon,
  ThumbsUpIcon,
  UsersIcon,
  WalletIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Token} from '@astryxdesign/core/Token';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// ACCENT TINTS — categorical tokens are not injected by the demo, so every
// use carries the repo-standard \`light-dark()\` fallback pair (copied from
// calendar-month-grid.tsx).
// ---------------------------------------------------------------------------

const TINT = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

const TINT_WELL = {
  blue: 'light-dark(rgba(1, 113, 227, 0.10), rgba(76, 158, 255, 0.16))',
  green: 'light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))',
  orange: 'light-dark(rgba(235, 110, 0, 0.10), rgba(255, 147, 48, 0.16))',
  purple: 'light-dark(rgba(107, 30, 253, 0.08), rgba(157, 107, 255, 0.16))',
  teal: 'light-dark(rgba(14, 126, 139, 0.10), rgba(51, 184, 199, 0.16))',
} as const;

type TintName = keyof typeof TINT;

// ---------------------------------------------------------------------------
// FIXTURES — Marcus Webb's employee record, pinned to Wed Jul 8, 2026.
// Semi-monthly payroll (15th + last day). Every figure that repeats across
// panels is derived from these tables so the page reconciles by construction.
// ---------------------------------------------------------------------------

const VIEWER = {
  name: 'Marcus Webb',
  role: 'Platform lead',
  department: 'Engineering',
  office: 'SF HQ',
  managerName: 'Priya Raman',
  managerRole: 'VP Engineering',
} as const;

const TODAY_LABEL = 'Wednesday, July 8, 2026';

const PAYDAY = {
  date: 'Jul 15, 2026',
  daysAway: 7,
  schedule: 'Semi-monthly · 15th and last business day',
} as const;

/** Semi-monthly gross: $210,000 / 24 pay periods. */
const PER_PERIOD_GROSS = 8750;

interface PayDeduction {
  id: string;
  label: string;
  amount: number;
  kind: 'pretax' | 'tax' | 'posttax';
}

/** Jun 30 paycheck deductions; sum = 3,401.60 -> net 5,348.40. */
const LAST_PAY_DEDUCTIONS: PayDeduction[] = [
  {id: '401k', label: '401(k) deferral (6%)', amount: 525.0, kind: 'pretax'},
  {id: 'medical', label: 'Medical — Kestrel Gold PPO', amount: 118.5, kind: 'pretax'},
  {id: 'dental', label: 'Dental + Vision bundle', amount: 13.7, kind: 'pretax'},
  {id: 'fed', label: 'Federal income tax', amount: 1486.2, kind: 'tax'},
  {id: 'ca', label: 'CA state income tax', amount: 610.4, kind: 'tax'},
  {id: 'fica', label: 'Social Security + Medicare', amount: 647.8, kind: 'tax'},
];

const LAST_PAY_TOTAL_DEDUCTIONS = LAST_PAY_DEDUCTIONS.reduce(
  (sum, d) => sum + d.amount,
  0,
);

const LAST_PAY = {
  statementId: 'PAY-2026-0630-MW',
  payDate: 'Jun 30, 2026',
  periodLabel: 'Jun 16 – Jun 30, 2026',
  gross: PER_PERIOD_GROSS,
  net: PER_PERIOD_GROSS - LAST_PAY_TOTAL_DEDUCTIONS, // 5,348.40
} as const;

/** 12 pay periods completed Jan 15 – Jun 30. */
const YTD_PERIODS = 12;
const YTD = {
  gross: PER_PERIOD_GROSS * YTD_PERIODS, // 105,000.00
  net: LAST_PAY.net * YTD_PERIODS, // 64,180.80
} as const;

interface TimeOffBank {
  id: 'vacation' | 'sick';
  label: string;
  annual: number;
  used: number;
  scheduled: number;
  accrualNote: string;
  tint: TintName;
}

/** Available = annual − used − scheduled (vacation: 20 − 6 − 5 = 9). */
const TIME_OFF_BANKS: TimeOffBank[] = [
  {
    id: 'vacation',
    label: 'Vacation',
    annual: 20,
    used: 6,
    scheduled: 5,
    accrualNote: 'Accrues 1.67 days/mo',
    tint: 'teal',
  },
  {
    id: 'sick',
    label: 'Sick',
    annual: 8,
    used: 2,
    scheduled: 0,
    accrualNote: 'Granted in full on Jan 1',
    tint: 'green',
  },
];

const APPROVED_TRIP = {
  label: 'Aug 3 – 7, 2026',
  days: 5,
  status: 'Approved',
  approvedBy: 'Priya Raman',
  approvedOn: 'Jun 24, 2026',
} as const;

// --- Benefits ---------------------------------------------------------------

const MEDICAL_PLAN = {
  name: 'Kestrel Gold PPO',
  carrier: 'Aetna',
  coverage: 'Employee only',
  perPeriodCost: 118.5,
} as const;

const DENTAL_VISION = {
  name: 'Dental + Vision bundle',
  carrier: 'Delta Dental / VSP',
  perPeriodCost: 13.7,
} as const;

const K401 = {
  matchPct: 4,
  matchNote: 'Kestrel matches 100% up to 4%',
  effectiveNote: 'Changes apply from the Jul 15 paycheck',
  presets: [4, 6, 8, 10] as const,
  defaultPct: 6,
} as const;

/** Per-paycheck 401(k) deferral for a given contribution percent. */
function deferralFor(pct: number): number {
  return (pct / 100) * PER_PERIOD_GROSS;
}

// --- Tasks, org, announcements, quick actions -------------------------------

interface EmployeeTask {
  id: string;
  title: string;
  detail: string;
  dueLabel: string;
  dueChip: string;
  dueTone: 'warning' | 'neutral';
  actionLabel: string;
  /** 'complete' finishes in place; 'launch' hands off and confirms via Toast. */
  actionKind: 'complete' | 'launch';
  icon: typeof FileSignatureIcon;
  tint: TintName;
}

const OPEN_TASKS: EmployeeTask[] = [
  {
    id: 'handbook',
    title: 'Sign the updated employee handbook',
    detail: 'v4.2 — remote-work and travel policy changes',
    dueLabel: 'Due Jul 17, 2026',
    dueChip: 'Due in 9 days',
    dueTone: 'warning',
    actionLabel: 'Review & sign',
    actionKind: 'complete',
    icon: FileSignatureIcon,
    tint: 'orange',
  },
  {
    id: 'sec-training',
    title: 'Security awareness training 2026',
    detail: '4 modules · about 35 minutes total',
    dueLabel: 'Due Jul 24, 2026',
    dueChip: 'Due in 16 days',
    dueTone: 'neutral',
    actionLabel: 'Start training',
    actionKind: 'launch',
    icon: ShieldCheckIcon,
    tint: 'blue',
  },
];

const DONE_TASK = {
  title: 'Confirm your Q3 desk at SF HQ',
  completedLabel: 'Completed Jul 2, 2026',
} as const;

interface OrgPerson {
  name: string;
  role: string;
  office: string;
  startChip?: string;
}

/** Marcus's direct reports; Ava Lindqvist is the in-flight new hire. */
const DIRECT_REPORTS: OrgPerson[] = [
  {name: 'Nadia Osei', role: 'Senior Platform Engineer', office: 'SF HQ'},
  {name: 'Leo Braun', role: 'Platform Engineer', office: 'SF HQ'},
  {name: 'June Park', role: 'Platform Engineer', office: 'Lisbon'},
  {name: 'Rafael Costa', role: 'Infrastructure Engineer', office: 'Remote-US'},
  {
    name: 'Ava Lindqvist',
    role: 'Platform Engineer',
    office: 'Lisbon',
    startChip: 'Starts Jul 20',
  },
];

interface Announcement {
  id: string;
  author: string;
  authorRole: string;
  postedLabel: string;
  title: string;
  body: string;
  likes: number;
  tint: TintName;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-enrollment',
    author: 'Dana Whitfield',
    authorRole: 'People Ops',
    postedLabel: 'Jul 7, 2026 · 9:15 AM PT',
    title: 'FY27 open enrollment runs Aug 3 – 14',
    body:
      'Benefits elections for FY27 open Monday, Aug 3 and close Friday, ' +
      'Aug 14 at 5 PM PT. Plan lineups and rate sheets land in your ' +
      'benefits tab on Jul 27, and we are hosting two live Q&A sessions ' +
      '(Aug 4 for SF HQ + Remote-US, Aug 6 for Lisbon). No action means ' +
      'your current elections roll over unchanged.',
    likes: 18,
    tint: 'purple',
  },
  {
    id: 'ann-roadmap',
    author: 'Priya Raman',
    authorRole: 'VP Engineering',
    postedLabel: 'Jul 2, 2026 · 4:40 PM PT',
    title: 'H2 platform roadmap + Q2 all-hands recap',
    body:
      'Thanks for a great Q2 all-hands. The recording and the H2 roadmap ' +
      'one-pager are up: we are prioritizing the provisioning rebuild, ' +
      'SOC 2 Type II prep, and the Lisbon on-call rotation going live in ' +
      'September. Team-level OKR drafts are due to your lead by Jul 24.',
    likes: 42,
    tint: 'blue',
  },
];

const REFERRAL = {
  bonus: '$2,500',
  note: '6 referral-eligible open roles',
} as const;

// ---------------------------------------------------------------------------
// FORMATTERS
// ---------------------------------------------------------------------------

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatUsd(value: number): string {
  return USD.format(value);
}

function formatDays(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

// ---------------------------------------------------------------------------
// STYLES — one module-level typed inline record (no StyleX, no CSS files).
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },

  // --- header ---
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    width: '100%',
  },
  paydayChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-3)',
    borderRadius: 'var(--radius-pill, 999px)',
    backgroundColor: TINT_WELL.green,
    border: \`var(--border-width) solid \${TINT.green}\`,
    color: TINT.green,
    whiteSpace: 'nowrap',
  },
  paydayChipDate: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },

  // --- content scroller ---
  contentScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  contentInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    maxWidth: 1040,
    marginInline: 'auto',
  },

  // --- quick actions ---
  quickTile: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    width: '100%',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'pointer',
    textAlign: 'start',
    font: 'inherit',
    color: 'inherit',
  },
  iconWell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
  },

  // --- summary cards ---
  moneyValue: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  cardHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  deductionRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-2)',
    justifyContent: 'space-between',
  },
  deductionAmount: {
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
    whiteSpace: 'nowrap',
  },
  ytdRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
  },
  tripChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: TINT_WELL.teal,
    border: \`var(--border-width) solid \${TINT.teal}\`,
  },

  // --- benefits strip ---
  benefitsStrip: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
  },
  benefitSegment: {
    flex: '1 1 280px',
    minWidth: 260,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  k401EditorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    paddingTop: 'var(--spacing-2)',
    borderTop: 'var(--border-width) solid var(--color-border)',
  },

  // --- announcements ---
  announcementPost: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  postAccent: {
    alignSelf: 'stretch',
    width: 3,
    flexShrink: 0,
    borderRadius: 'var(--radius-pill, 999px)',
  },
  likeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-pill, 999px)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-secondary)',
  },
  likeButtonActive: {
    border: \`var(--border-width) solid \${TINT.blue}\`,
    backgroundColor: TINT_WELL.blue,
    color: TINT.blue,
  },

  // --- end rail (tasks + org) ---
  railScroll: {
    position: 'sticky',
    insetBlockStart: 0,
    maxHeight: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  railSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  taskRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  taskDone: {
    opacity: 0.72,
  },
  orgRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
  },
  managerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },

  // --- inline fallback (rail content when the panel drops <= 1180px) ---
  inlineRailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
};

// ---------------------------------------------------------------------------
// SHARED BITS
// ---------------------------------------------------------------------------

function IconWell({icon, tint}: {icon: typeof WalletIcon; tint: TintName}) {
  return (
    <div
      style={{...styles.iconWell, backgroundColor: TINT_WELL[tint], color: TINT[tint]}}
      aria-hidden>
      <Icon icon={icon} size="sm" color="inherit" />
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  trailing,
}: {
  icon: typeof WalletIcon;
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <Icon icon={icon} size="sm" color="secondary" />
      <StackItem size="fill">
        <Heading level={3}>{title}</Heading>
      </StackItem>
      {trailing}
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// QUICK ACTIONS
// ---------------------------------------------------------------------------

interface QuickAction {
  id: string;
  label: string;
  note: string;
  icon: typeof WalletIcon;
  tint: TintName;
  toastBody: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'pto',
    label: 'Request time off',
    note: \`\${formatDays(
      TIME_OFF_BANKS[0].annual - TIME_OFF_BANKS[0].used - TIME_OFF_BANKS[0].scheduled,
    )} vacation days available\`,
    icon: CalendarPlusIcon,
    tint: 'teal',
    toastBody: 'Time-off request opened — balances prefilled',
  },
  {
    id: 'paystub',
    label: 'View paystub',
    note: \`Latest: \${LAST_PAY.payDate} · \${formatUsd(LAST_PAY.net)} net\`,
    icon: ReceiptIcon,
    tint: 'blue',
    toastBody: \`Statement \${LAST_PAY.statementId} opened\`,
  },
  {
    id: 'refer',
    label: 'Refer a friend',
    note: \`\${REFERRAL.bonus} bonus · \${REFERRAL.note}\`,
    icon: GiftIcon,
    tint: 'purple',
    toastBody: 'Referral form opened — 6 eligible roles listed',
  },
];

function QuickActionsRow({onAction}: {onAction: (action: QuickAction) => void}) {
  return (
    <Grid columns={{minWidth: 220, repeat: 'fit'}} gap={3}>
      {QUICK_ACTIONS.map(action => (
        <button
          key={action.id}
          type="button"
          style={styles.quickTile}
          onClick={() => onAction(action)}>
          <IconWell icon={action.icon} tint={action.tint} />
          <VStack gap={0}>
            <Text type="label">{action.label}</Text>
            <Text type="supporting" size="sm" color="secondary">
              {action.note}
            </Text>
          </VStack>
        </button>
      ))}
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// MY PAY CARD
// ---------------------------------------------------------------------------

function MyPayCard({onViewStatement}: {onViewStatement: () => void}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  return (
    <Card>
      <VStack gap={3}>
        <div style={styles.cardHeaderRow}>
          <IconWell icon={WalletIcon} tint="green" />
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={3}>My pay</Heading>
              <Text type="supporting" size="sm" color="secondary">
                {PAYDAY.schedule}
              </Text>
            </VStack>
          </StackItem>
        </div>

        <VStack gap={1}>
          <span style={styles.moneyValue}>
            <Heading level={2}>{formatUsd(LAST_PAY.net)}</Heading>
          </span>
          <Text type="supporting" color="secondary">
            Net pay on {LAST_PAY.payDate} · period {LAST_PAY.periodLabel}
          </Text>
          <HStack gap={3} vAlign="center">
            <Link onClick={onViewStatement} type="supporting">
              View statement
            </Link>
            <Link
              onClick={() => setShowBreakdown(prev => !prev)}
              type="supporting">
              {showBreakdown ? 'Hide breakdown' : 'Show breakdown'}
            </Link>
          </HStack>
        </VStack>

        {showBreakdown ? (
          <VStack gap={1}>
            <div style={styles.deductionRow}>
              <Text type="supporting" size="sm" color="secondary">
                Gross pay
              </Text>
              <span style={styles.deductionAmount}>
                <Text type="label" size="sm" hasTabularNumbers>
                  {formatUsd(LAST_PAY.gross)}
                </Text>
              </span>
            </div>
            {LAST_PAY_DEDUCTIONS.map(deduction => (
              <div key={deduction.id} style={styles.deductionRow}>
                <Text type="supporting" size="sm" color="secondary">
                  {deduction.label}
                </Text>
                <span style={styles.deductionAmount}>
                  <Text type="supporting" size="sm" hasTabularNumbers>
                    −{formatUsd(deduction.amount)}
                  </Text>
                </span>
              </div>
            ))}
            <Divider />
            <div style={styles.deductionRow}>
              <Text type="label" size="sm">
                Net pay
              </Text>
              <span style={styles.deductionAmount}>
                <Text type="label" size="sm" hasTabularNumbers>
                  {formatUsd(LAST_PAY.net)}
                </Text>
              </span>
            </div>
          </VStack>
        ) : null}

        <Divider />

        <VStack gap={1}>
          <div style={styles.ytdRow}>
            <Text type="supporting" color="secondary">
              YTD gross · {YTD_PERIODS} pay periods
            </Text>
            <span style={styles.deductionAmount}>
              <Text type="label" hasTabularNumbers>
                {formatUsd(YTD.gross)}
              </Text>
            </span>
          </div>
          <div style={styles.ytdRow}>
            <Text type="supporting" color="secondary">
              YTD net
            </Text>
            <span style={styles.deductionAmount}>
              <Text type="label" hasTabularNumbers>
                {formatUsd(YTD.net)}
              </Text>
            </span>
          </div>
        </VStack>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// TIME OFF CARD
// ---------------------------------------------------------------------------

function TimeOffCard({onRequest}: {onRequest: () => void}) {
  return (
    <Card>
      <VStack gap={3}>
        <div style={styles.cardHeaderRow}>
          <IconWell icon={CalendarDaysIcon} tint="teal" />
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={3}>Time off</Heading>
              <Text type="supporting" size="sm" color="secondary">
                Balances as of Jul 8, 2026
              </Text>
            </VStack>
          </StackItem>
          <Button
            label="Request"
            variant="secondary"
            size="sm"
            icon={<Icon icon={CalendarPlusIcon} size="sm" color="inherit" />}
            onClick={onRequest}
          />
        </div>

        {TIME_OFF_BANKS.map(bank => {
          const available = bank.annual - bank.used - bank.scheduled;
          return (
            <VStack key={bank.id} gap={1}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text type="label">{bank.label}</Text>
                </StackItem>
                {bank.scheduled > 0 ? (
                  <Badge
                    variant="neutral"
                    label={\`\${formatDays(bank.scheduled)} scheduled\`}
                  />
                ) : null}
                <Text type="label" hasTabularNumbers>
                  {formatDays(available)} days
                </Text>
              </HStack>
              <ProgressBar
                label={\`\${bank.label} used of annual\`}
                isLabelHidden
                value={bank.used + bank.scheduled}
                max={bank.annual}
              />
              <Text type="supporting" size="sm" color="secondary">
                {formatDays(bank.used)} used · {formatDays(bank.scheduled)}{' '}
                scheduled · {formatDays(bank.annual)} annual · {bank.accrualNote}
              </Text>
            </VStack>
          );
        })}

        <div style={styles.tripChip}>
          <Icon icon={PlaneIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="label" size="sm">
                {APPROVED_TRIP.label} · {APPROVED_TRIP.days} days
              </Text>
              <Text type="supporting" size="sm" color="secondary">
                Approved by {APPROVED_TRIP.approvedBy} on{' '}
                {APPROVED_TRIP.approvedOn}
              </Text>
            </VStack>
          </StackItem>
          <Badge variant="success" label={APPROVED_TRIP.status} />
        </div>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// MY BENEFITS STRIP
// ---------------------------------------------------------------------------

function BenefitsStrip({
  contributionPct,
  onSaveContribution,
}: {
  contributionPct: number;
  onSaveContribution: (pct: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftPct, setDraftPct] = useState(contributionPct);

  const startEditing = () => {
    setDraftPct(contributionPct);
    setIsEditing(true);
  };

  const save = () => {
    onSaveContribution(draftPct);
    setIsEditing(false);
  };

  return (
    <section aria-label="My benefits">
      <VStack gap={2}>
        <SectionHeading
          icon={HeartPulseIcon}
          title="My benefits"
          trailing={
            <Text type="supporting" size="sm" color="secondary">
              FY26 elections · open enrollment Aug 3 – 14
            </Text>
          }
        />
        <div style={styles.benefitsStrip}>
          <div style={styles.benefitSegment}>
            <HStack gap={2} vAlign="center">
              <IconWell icon={HeartPulseIcon} tint="orange" />
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="label">{MEDICAL_PLAN.name}</Text>
                  <Text type="supporting" size="sm" color="secondary">
                    Medical · {MEDICAL_PLAN.carrier} · {MEDICAL_PLAN.coverage}
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
            <Text type="supporting" size="sm" color="secondary">
              You pay{' '}
              <Text type="label" size="sm" hasTabularNumbers>
                {formatUsd(MEDICAL_PLAN.perPeriodCost)}
              </Text>{' '}
              per paycheck, pre-tax
            </Text>
          </div>

          <div style={styles.benefitSegment}>
            <HStack gap={2} vAlign="center">
              <IconWell icon={SmileIcon} tint="blue" />
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="label">{DENTAL_VISION.name}</Text>
                  <Text type="supporting" size="sm" color="secondary">
                    {DENTAL_VISION.carrier}
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
            <Text type="supporting" size="sm" color="secondary">
              You pay{' '}
              <Text type="label" size="sm" hasTabularNumbers>
                {formatUsd(DENTAL_VISION.perPeriodCost)}
              </Text>{' '}
              per paycheck, pre-tax
            </Text>
          </div>

          <div style={styles.benefitSegment}>
            <HStack gap={2} vAlign="center">
              <IconWell icon={PiggyBankIcon} tint="purple" />
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="label">
                    401(k) · {contributionPct}% ·{' '}
                    <Text type="label" hasTabularNumbers>
                      {formatUsd(deferralFor(contributionPct))}
                    </Text>{' '}
                    / paycheck
                  </Text>
                  <Text type="supporting" size="sm" color="secondary">
                    {K401.matchNote}
                  </Text>
                </VStack>
              </StackItem>
              {isEditing ? null : (
                <Link onClick={startEditing} type="supporting">
                  Change
                </Link>
              )}
            </HStack>
            {isEditing ? (
              <div style={styles.k401EditorRow}>
                <SegmentedControl
                  value={String(draftPct)}
                  onChange={value => setDraftPct(Number(value))}
                  label="401(k) contribution percent"
                  size="sm">
                  {K401.presets.map(preset => (
                    <SegmentedControlItem
                      key={preset}
                      value={String(preset)}
                      label={\`\${preset}%\`}
                    />
                  ))}
                </SegmentedControl>
                <StackItem size="fill">
                  <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
                    = {formatUsd(deferralFor(draftPct))} / paycheck
                  </Text>
                </StackItem>
                <Button label="Save" variant="primary" size="sm" onClick={save} />
                <Button
                  label="Cancel"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                />
              </div>
            ) : null}
            <Text type="supporting" size="sm" color="secondary">
              {K401.effectiveNote}
            </Text>
          </div>
        </div>
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ANNOUNCEMENTS FEED
// ---------------------------------------------------------------------------

function AnnouncementsFeed({
  likedIds,
  onToggleLike,
}: {
  likedIds: ReadonlySet<string>;
  onToggleLike: (id: string) => void;
}) {
  return (
    <section aria-label="Company announcements">
      <VStack gap={2}>
        <SectionHeading
          icon={MegaphoneIcon}
          title="Company announcements"
          trailing={
            <Badge variant="neutral" label={\`\${ANNOUNCEMENTS.length} posts\`} />
          }
        />
        <VStack gap={3}>
          {ANNOUNCEMENTS.map(post => {
            const isLiked = likedIds.has(post.id);
            const likeCount = post.likes + (isLiked ? 1 : 0);
            return (
              <article key={post.id} style={styles.announcementPost}>
                <HStack gap={3} vAlign="stretch">
                  <div
                    style={{...styles.postAccent, backgroundColor: TINT[post.tint]}}
                    aria-hidden
                  />
                  <StackItem size="fill">
                    <VStack gap={2}>
                      <HStack gap={2} vAlign="center">
                        <Avatar name={post.author} size="small" />
                        <StackItem size="fill">
                          <VStack gap={0}>
                            <Text type="label" size="sm">
                              {post.author} · {post.authorRole}
                            </Text>
                            <Text type="supporting" size="sm" color="secondary">
                              {post.postedLabel}
                            </Text>
                          </VStack>
                        </StackItem>
                      </HStack>
                      <VStack gap={1}>
                        <Text type="label">{post.title}</Text>
                        <Text type="body" size="sm" color="secondary">
                          {post.body}
                        </Text>
                      </VStack>
                      <HStack gap={2} vAlign="center">
                        <button
                          type="button"
                          style={
                            isLiked
                              ? {...styles.likeButton, ...styles.likeButtonActive}
                              : styles.likeButton
                          }
                          aria-pressed={isLiked}
                          onClick={() => onToggleLike(post.id)}>
                          <Icon icon={ThumbsUpIcon} size="sm" color="inherit" />
                          <Text
                            type="supporting"
                            size="sm"
                            color="inherit"
                            hasTabularNumbers>
                            {likeCount}
                          </Text>
                        </button>
                        <Text type="supporting" size="sm" color="secondary">
                          Visible to all 140 employees
                        </Text>
                      </HStack>
                    </VStack>
                  </StackItem>
                </HStack>
              </article>
            );
          })}
        </VStack>
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// TASKS FOR YOU
// ---------------------------------------------------------------------------

function TasksSection({
  completedIds,
  onTaskAction,
}: {
  completedIds: ReadonlySet<string>;
  onTaskAction: (task: EmployeeTask) => void;
}) {
  const openCount = OPEN_TASKS.filter(t => !completedIds.has(t.id)).length;
  return (
    <section aria-label="Tasks for you" style={styles.railSection}>
      <SectionHeading
        icon={CheckCircle2Icon}
        title="Tasks for you"
        trailing={
          <Badge
            variant={openCount > 0 ? 'warning' : 'success'}
            label={\`\${openCount} open\`}
          />
        }
      />
      {OPEN_TASKS.map(task => {
        const isDone = completedIds.has(task.id);
        return (
          <div
            key={task.id}
            style={isDone ? {...styles.taskRow, ...styles.taskDone} : styles.taskRow}>
            <IconWell icon={task.icon} tint={task.tint} />
            <StackItem size="fill">
              <VStack gap={1}>
                <Text type="label" size="sm">
                  {task.title}
                </Text>
                <Text type="supporting" size="sm" color="secondary">
                  {task.detail}
                </Text>
                <HStack gap={2} vAlign="center">
                  {isDone ? (
                    <Badge variant="success" label="Done today" />
                  ) : (
                    <Badge variant={task.dueTone} label={task.dueChip} />
                  )}
                  <Text type="supporting" size="sm" color="secondary">
                    {task.dueLabel}
                  </Text>
                </HStack>
                {isDone ? null : (
                  <HStack gap={2}>
                    <Button
                      label={task.actionLabel}
                      variant="secondary"
                      size="sm"
                      onClick={() => onTaskAction(task)}
                    />
                  </HStack>
                )}
              </VStack>
            </StackItem>
          </div>
        );
      })}
      <div style={{...styles.taskRow, ...styles.taskDone}}>
        <IconWell icon={CheckCircle2Icon} tint="green" />
        <StackItem size="fill">
          <VStack gap={0}>
            <Text type="label" size="sm">
              {DONE_TASK.title}
            </Text>
            <Text type="supporting" size="sm" color="secondary">
              {DONE_TASK.completedLabel}
            </Text>
          </VStack>
        </StackItem>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// YOUR ORG
// ---------------------------------------------------------------------------

function OrgSection() {
  return (
    <section aria-label="Your org" style={styles.railSection}>
      <SectionHeading
        icon={UsersIcon}
        title="Your org"
        trailing={
          <AvatarGroup
            size="xsmall"
            aria-label={\`Team of \${DIRECT_REPORTS.length + 1}\`}>
            {[VIEWER.name, ...DIRECT_REPORTS.map(p => p.name)].map(name => (
              <Avatar key={name} name={name} size="xsmall" />
            ))}
          </AvatarGroup>
        }
      />
      <div style={styles.managerRow}>
        <Avatar name={VIEWER.managerName} size="small" />
        <StackItem size="fill">
          <VStack gap={0}>
            <Text type="label" size="sm">
              {VIEWER.managerName}
            </Text>
            <Text type="supporting" size="sm" color="secondary">
              {VIEWER.managerRole} · your manager
            </Text>
          </VStack>
        </StackItem>
      </div>
      <Text type="supporting" size="sm" color="secondary">
        Your reports · {DIRECT_REPORTS.length}
      </Text>
      <VStack gap={1}>
        {DIRECT_REPORTS.map(person => (
          <div key={person.name} style={styles.orgRow}>
            <Avatar name={person.name} size="small" />
            <StackItem size="fill">
              <VStack gap={0}>
                <Text type="label" size="sm">
                  {person.name}
                </Text>
                <Text type="supporting" size="sm" color="secondary">
                  {person.role} · {person.office}
                </Text>
              </VStack>
            </StackItem>
            {person.startChip ? (
              <Token label={person.startChip} color="purple" size="sm" />
            ) : null}
          </div>
        ))}
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function WorkforceEmployeeHomeTemplate() {
  const toast = useToast();
  const isRailInline = useMediaQuery('(max-width: 1180px)');

  const [contributionPct, setContributionPct] = useState<number>(
    K401.defaultPct,
  );
  const [completedTaskIds, setCompletedTaskIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [likedPostIds, setLikedPostIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [announcement, setAnnouncement] = useState('');

  // ---- actions (all confirm via Toast or aria-live; nothing leaves the page)

  const handleQuickAction = (action: QuickAction) => {
    toast({body: action.toastBody, uniqueID: 'employee-home-action'});
  };

  const handleViewStatement = () => {
    toast({
      body: \`Statement \${LAST_PAY.statementId} opened\`,
      uniqueID: 'employee-home-action',
    });
  };

  const handleRequestTimeOff = () => {
    toast({
      body: 'Time-off request opened — balances prefilled',
      uniqueID: 'employee-home-action',
    });
  };

  const handleSaveContribution = (pct: number) => {
    setContributionPct(pct);
    setAnnouncement(
      \`401(k) contribution set to \${pct}% — \${formatUsd(deferralFor(pct))} per paycheck from Jul 15\`,
    );
    toast({
      body: \`401(k) set to \${pct}% (\${formatUsd(deferralFor(pct))}/paycheck) from Jul 15\`,
      uniqueID: 'employee-home-action',
    });
  };

  const handleTaskAction = (task: EmployeeTask) => {
    if (task.actionKind === 'complete') {
      setCompletedTaskIds(prev => {
        const next = new Set(prev);
        next.add(task.id);
        return next;
      });
      setAnnouncement(\`\${task.title} — signed and filed\`);
      toast({
        body: 'Handbook v4.2 signed — a copy is in your documents',
        uniqueID: 'employee-home-action',
      });
    } else {
      toast({
        body: 'Security training opened in Kestrel Learn (4 modules)',
        uniqueID: 'employee-home-action',
      });
    }
  };

  const handleToggleLike = (id: string) => {
    setLikedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ---- frame ----

  const header = (
    <LayoutHeader>
      <div style={styles.headerRow}>
        <Avatar name={VIEWER.name} size="medium" />
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={1}>Good morning, Marcus</Heading>
            <Text type="supporting" size="sm" color="secondary">
              {TODAY_LABEL} · {VIEWER.role} · {VIEWER.department} ·{' '}
              {VIEWER.office}
            </Text>
          </VStack>
        </StackItem>
        <div style={styles.paydayChip}>
          <Icon icon={WalletIcon} size="sm" color="inherit" />
          <Text type="label" size="sm" color="inherit">
            Payday in {PAYDAY.daysAway} days
          </Text>
          <span style={styles.paydayChipDate}>
            <Text type="supporting" size="sm" color="inherit" hasTabularNumbers>
              {PAYDAY.date}
            </Text>
          </span>
        </div>
        <Button
          label="Settings"
          variant="ghost"
          size="sm"
          icon={<Icon icon={SettingsIcon} size="sm" color="inherit" />}
        />
      </div>
    </LayoutHeader>
  );

  const railContent = (
    <>
      <TasksSection
        completedIds={completedTaskIds}
        onTaskAction={handleTaskAction}
      />
      <Divider />
      <OrgSection />
    </>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentScroll}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              <div style={styles.contentInner}>
                <QuickActionsRow onAction={handleQuickAction} />
                <Grid columns={{minWidth: 340, max: 2}} gap={3} align="start">
                  <MyPayCard onViewStatement={handleViewStatement} />
                  <TimeOffCard onRequest={handleRequestTimeOff} />
                </Grid>
                <BenefitsStrip
                  contributionPct={contributionPct}
                  onSaveContribution={handleSaveContribution}
                />
                <AnnouncementsFeed
                  likedIds={likedPostIds}
                  onToggleLike={handleToggleLike}
                />
                {isRailInline ? (
                  <div style={styles.inlineRailGrid}>
                    <TasksSection
                      completedIds={completedTaskIds}
                      onTaskAction={handleTaskAction}
                    />
                    <OrgSection />
                  </div>
                ) : null}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isRailInline ? undefined : (
            <LayoutPanel width={320} padding={0} hasDivider label="Tasks and org">
              <div style={styles.railScroll}>{railContent}</div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};