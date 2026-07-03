var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file pricing-plans.tsx
 * @input Deterministic fixtures only (three plans for "Beacon", a product
 *   analytics platform, with fixed monthly/annual per-seat price pairs and
 *   per-plan savings amounts; five grouped comparison sections with string
 *   or boolean values; seven FAQ entries)
 * @output Marketing-grade pricing page: a monthly/annual billing
 *   SegmentedControl in the header that recalculates every price on the
 *   page and swaps a savings Badge, a 3-up Grid of plan Cards (the Growth
 *   plan highlighted as "Most popular" with an accent border) each with a
 *   gradient glyph tile, per-seat price, annual-savings Badge, full-width
 *   CTA Button, and a check-marked feature list; a seat-count NumberInput
 *   estimator that multiplies fixture prices into per-plan totals; a full
 *   feature-comparison table with a frozen label column, check/dash
 *   inclusion cells, and a highlighted popular column; and an FAQ section
 *   of controlled Collapsibles with a closing contact-sales Card.
 * @position Page template; emitted by \`astryx template pricing-plans\`
 *
 * Frame: Layout height="fill". LayoutHeader owns the page Heading and the
 * billing SegmentedControl + savings Badge; LayoutContent scrolls a single
 * centered max-width column stacking plan cards, estimator, comparison
 * table, FAQ, and the contact band. No LayoutPanel — a pricing page is a
 * one-column reading surface, so nothing docks.
 *
 * Interaction contract:
 * - The billing toggle recalculates plan-card prices, estimator totals,
 *   and comparison-header prices in one pass; annual mode adds per-plan
 *   "Save $N/yr" Badges and flips the header Badge to "20% off applied".
 * - The seat NumberInput (stepper, min 1 / max 500) drives the estimator
 *   totals; clearing it falls back to 1 seat rather than NaN.
 * - Every CTA Button confirms via Toast (trial start or sales contact) so
 *   the buttons demonstrably work against fixtures.
 * - FAQ Collapsibles are controlled (a Set of open ids), so multiple can
 *   be open at once and the first ships open as an affordance.
 *
 * Container policy: plan tiles are Cards in a Grid (marketing objects, not
 * rows); the estimator, FAQ stack, and contact band are single Cards; the
 * comparison matrix is a native table inside a bordered scroll container
 * because sticky columns need real table semantics.
 *
 * Responsive contract:
 * - Content column: max-width 1080px, centered; fills the viewport width
 *   below that with LayoutContent's own padding.
 * - Header: heading block and billing controls share one wrapping row
 *   (wrap="wrap"), so the SegmentedControl + savings Badge drop below the
 *   title at narrow widths instead of clipping.
 * - Plan cards: Grid columns={{minWidth: 264, max: 3}} — 3-up wide, 2-up
 *   mid, a single column at 375px; CTA Buttons stretch full card width
 *   (display:grid slot) for ~40px tap targets.
 * - Estimator: the seat input row wraps above the three total tiles; the
 *   totals Grid collapses 3 → 1 the same way the plan cards do.
 * - Comparison table: the scroll container owns overflow-x (tabIndex 0,
 *   role="region" so keyboard users can pan it); the feature-label column
 *   is position:sticky left:0 with an opaque background and only shows an
 *   edge shadow once content has actually slid underneath. <=640px the
 *   label column narrows 220 → 132px and plan columns 176 → 128px so a
 *   full plan stays visible beside the frozen labels on phones.
 * - FAQ: Collapsible triggers span the full card width with vertical
 *   padding for ~44px tap targets; expansion is tap/keyboard driven —
 *   nothing on this page is hover-only.
 */

import {useState, type CSSProperties, type UIEvent} from 'react';

import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {useToast} from '@astryxdesign/core/Toast';
import {
  Building2Icon,
  CheckIcon,
  CircleHelpIcon,
  MessageCircleIcon,
  RocketIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react';

// ============= STYLES =============

const colors = {
  surface: 'var(--color-background, #FFFFFF)',
  surfaceMuted: 'var(--color-background-muted, #F5F5F7)',
  accent: 'var(--color-accent, #0171E3)',
  accentMuted: 'var(--color-accent-muted, #EAF2FF)',
  border: 'var(--color-border, #E2E2E6)',
  success: 'var(--color-data-categorical-green, #0B991F)',
};

// Frozen-column edge shadow — only rendered after horizontal scroll so the
// label column reads as flat until plan columns actually slide under it.
const COLUMN_SHADOW = '8px 0 8px -8px rgba(15, 23, 42, 0.18)';

const styles: Record<string, CSSProperties> = {
  // Marketing surfaces read best as one centered column, not full-bleed.
  content: {
    width: '100%',
    maxWidth: 1080,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // Popular plan card: accent ring on top of the Card's own chrome.
  cardPopular: {
    borderColor: colors.accent,
    boxShadow: \`0 0 0 1px \${colors.accent}\`,
  },
  // Gradient glyph tiles stand in for plan art — no network assets.
  glyphTile: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    color: '#FFFFFF',
  },
  glyphStarter: {
    background: 'linear-gradient(135deg, #14B8A6 0%, #0E7490 100%)',
  },
  glyphGrowth: {
    background: 'linear-gradient(135deg, #6366F1 0%, #2563EB 100%)',
  },
  glyphScale: {
    background: 'linear-gradient(135deg, #475569 0%, #1E293B 100%)',
  },
  // display:grid stretches the CTA Button to the full card width, which
  // also guarantees a generous (~40px) tap target on phones.
  ctaSlot: {
    display: 'grid',
  },
  checkGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    color: colors.success,
  },
  // Estimator total tiles — muted blocks; the popular plan gets the
  // accent-tinted variant so the recommendation carries through.
  totalTile: {
    borderRadius: 'var(--radius-container)',
    backgroundColor: colors.surfaceMuted,
    padding: 'var(--spacing-3)',
  },
  totalTilePopular: {
    backgroundColor: colors.accentMuted,
  },
  // The single horizontal scroll container for the comparison matrix.
  scroller: {
    overflowX: 'auto',
    border: \`1px solid \${colors.border}\`,
    borderRadius: 'var(--radius-container)',
    backgroundColor: colors.surface,
  },
  table: {
    borderCollapse: 'separate',
    borderSpacing: 0,
    width: 'max-content',
    minWidth: '100%',
  },
  cell: {
    borderBottom: \`1px solid \${colors.border}\`,
    padding: 'var(--spacing-3)',
    verticalAlign: 'middle',
  },
  // Frozen feature-label column (doubles as the row headers).
  labelCell: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    backgroundColor: colors.surface,
    textAlign: 'left',
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  headerCell: {
    textAlign: 'center',
    verticalAlign: 'bottom',
    padding: 'var(--spacing-4) var(--spacing-3) var(--spacing-3)',
    borderTop: '3px solid transparent',
  },
  headerPopular: {
    backgroundColor: colors.accentMuted,
    borderTop: \`3px solid \${colors.accent}\`,
  },
  valueCell: {
    textAlign: 'center',
  },
  valuePopular: {
    backgroundColor: colors.accentMuted,
  },
  // Full-width section band; its label half stays frozen with the column.
  groupLabelCell: {
    backgroundColor: colors.surfaceMuted,
    padding: 'var(--spacing-2) var(--spacing-4)',
  },
  groupFillCell: {
    backgroundColor: colors.surfaceMuted,
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  // Collapsible trigger rows get vertical padding for ~44px tap targets.
  faqItem: {
    padding: 'var(--spacing-2) 0',
  },
  faqBody: {
    padding: 'var(--spacing-2) 0 var(--spacing-1)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============

type Billing = 'monthly' | 'annual';
type PlanGlyph = typeof ZapIcon;

interface Plan {
  id: 'starter' | 'growth' | 'scale';
  name: string;
  tagline: string;
  /** USD per seat per month at each billing cadence. */
  monthlyPerSeat: number;
  annualPerSeat: number;
  cta: string;
  ctaVariant: 'primary' | 'secondary';
  /** Toast body shown when the CTA fires. */
  ctaToast: string;
  isPopular?: boolean;
  icon: PlanGlyph;
  glyphStyle: CSSProperties;
  /** Card checklist heading + the bullets underneath it. */
  includedHeading: string;
  included: string[];
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For side projects finding fit',
    monthlyPerSeat: 19,
    annualPerSeat: 15,
    cta: 'Start free trial',
    ctaVariant: 'secondary',
    ctaToast: 'Starting your 14-day Starter trial',
    icon: ZapIcon,
    glyphStyle: styles.glyphStarter,
    includedHeading: 'Includes:',
    included: [
      '50,000 tracked events / month',
      '3 seats included',
      'Funnels and retention charts',
      '5 saved dashboards',
      '90-day data retention',
      'Community support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For teams shipping weekly',
    monthlyPerSeat: 49,
    annualPerSeat: 39,
    cta: 'Start 14-day trial',
    ctaVariant: 'primary',
    ctaToast: 'Starting your 14-day Growth trial',
    isPopular: true,
    icon: RocketIcon,
    glyphStyle: styles.glyphGrowth,
    includedHeading: 'Everything in Starter, plus:',
    included: [
      '500,000 tracked events / month',
      'Unlimited seats',
      'Session replay (5,000 / month)',
      'Unlimited dashboards + SQL explorer',
      'Slack digests and shared reports',
      'Email support in 1 business day',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'For orgs with compliance needs',
    monthlyPerSeat: 99,
    annualPerSeat: 79,
    cta: 'Talk to sales',
    ctaVariant: 'secondary',
    ctaToast: 'Thanks — sales will reach out within 1 business day',
    icon: Building2Icon,
    glyphStyle: styles.glyphScale,
    includedHeading: 'Everything in Growth, plus:',
    included: [
      '5,000,000 tracked events / month',
      'SAML SSO and SCIM provisioning',
      'Audit log and EU / US data residency',
      'Session replay (50,000 / month)',
      'Priority chat with a 4-hour SLA',
      'Dedicated onboarding manager',
    ],
  },
];

/** Yearly savings per seat when switching a plan to annual billing. */
function annualSavingsPerSeat(plan: Plan): number {
  return (plan.monthlyPerSeat - plan.annualPerSeat) * 12;
}

// Feature values are positional — one entry per plan, in PLANS order.
// Booleans render as check/dash cells; strings render as-is.
type FeatureValue = string | boolean;

interface FeatureRow {
  id: string;
  label: string;
  hint?: string;
  values: FeatureValue[];
}

interface FeatureGroup {
  id: string;
  label: string;
  rows: FeatureRow[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: 'usage',
    label: 'Usage',
    rows: [
      {
        id: 'events',
        label: 'Tracked events / month',
        hint: 'Custom and autocaptured events both count',
        values: ['50,000', '500,000', '5,000,000'],
      },
      {
        id: 'seats',
        label: 'Seats',
        values: ['3 included', 'Unlimited', 'Unlimited'],
      },
      {
        id: 'projects',
        label: 'Projects',
        values: ['2', '10', 'Unlimited'],
      },
      {
        id: 'retention',
        label: 'Data retention',
        values: ['90 days', '1 year', '7 years'],
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    rows: [
      {
        id: 'funnels',
        label: 'Funnels & retention charts',
        values: [true, true, true],
      },
      {
        id: 'dashboards',
        label: 'Saved dashboards',
        values: ['5', 'Unlimited', 'Unlimited'],
      },
      {
        id: 'sql',
        label: 'SQL explorer',
        values: [false, true, true],
      },
      {
        id: 'replay',
        label: 'Session replays / month',
        values: [false, '5,000', '50,000'],
      },
      {
        id: 'alerts',
        label: 'Metric alerts',
        hint: 'Notify a channel when a metric moves',
        values: ['2', '25', 'Unlimited'],
      },
    ],
  },
  {
    id: 'collab',
    label: 'Collaboration',
    rows: [
      {
        id: 'shared-reports',
        label: 'Shared report links',
        values: [true, true, true],
      },
      {
        id: 'slack',
        label: 'Slack digests',
        values: [false, true, true],
      },
      {
        id: 'roles',
        label: 'Roles & permissions',
        values: [false, 'Basic', 'Granular'],
      },
      {
        id: 'guests',
        label: 'Guest viewers',
        values: [false, '10', 'Unlimited'],
      },
    ],
  },
  {
    id: 'security',
    label: 'Security & compliance',
    rows: [
      {
        id: 'sso',
        label: 'SAML single sign-on',
        values: [false, false, true],
      },
      {
        id: 'scim',
        label: 'SCIM provisioning',
        values: [false, false, true],
      },
      {
        id: 'audit',
        label: 'Audit log retention',
        values: [false, '30 days', '2 years'],
      },
      {
        id: 'residency',
        label: 'EU / US data residency',
        values: [false, false, true],
      },
      {
        id: 'soc2',
        label: 'SOC 2 Type II report',
        values: [false, true, true],
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    rows: [
      {
        id: 'community',
        label: 'Community forum',
        values: [true, true, true],
      },
      {
        id: 'email',
        label: 'Email support',
        hint: 'First-response time',
        values: [false, '1 business day', '4 hours'],
      },
      {
        id: 'chat',
        label: 'Priority chat',
        values: [false, false, true],
      },
      {
        id: 'onboarding',
        label: 'Dedicated onboarding manager',
        values: [false, false, true],
      },
      {
        id: 'sla',
        label: 'Uptime SLA',
        values: [false, '99.9%', '99.99%'],
      },
    ],
  },
];

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

const FAQ: FaqEntry[] = [
  {
    id: 'trial',
    question: 'How does the 14-day trial work?',
    answer:
      'Every paid plan starts with a full-featured 14-day trial — no credit card required. You get the complete Growth feature set during the trial; when it ends you pick a plan or drop to read-only access until you do. Nothing is deleted.',
  },
  {
    id: 'billing-switch',
    question: 'Can I switch between monthly and annual billing?',
    answer:
      'Yes, any time from Settings → Billing. Moving to annual applies the discounted rate immediately and credits the unused portion of your monthly cycle. Moving back to monthly takes effect at your next renewal date.',
  },
  {
    id: 'events',
    question: 'What counts as a tracked event?',
    answer:
      'Any event your SDKs send us: custom events you instrument, autocaptured clicks and pageviews, and API-imported events. Identify calls, group updates, and feature-flag checks are free and never count against your quota.',
  },
  {
    id: 'overage',
    question: 'What happens if I go over my event quota?',
    answer:
      'We keep ingesting — your dashboards never go dark mid-month. The first overage month is on us with an email heads-up; after that, additional events bill at $10 per 100,000 or you can upgrade to the next tier, whichever is cheaper for you.',
  },
  {
    id: 'seats',
    question: 'How do seats work on the Starter plan?',
    answer:
      'Starter includes 3 seats; extra seats are $9 each per month. Growth and Scale include unlimited seats, so pricing stays per-seat only for the base subscription — invite your whole company without a per-viewer charge.',
  },
  {
    id: 'cancel',
    question: 'Can I cancel at any time?',
    answer:
      'Yes. Cancelling stops the next renewal — monthly plans run out the month, annual plans run out the year. Your data stays exportable for 90 days after the subscription lapses, then it is permanently deleted.',
  },
  {
    id: 'discounts',
    question: 'Do you offer nonprofit or startup discounts?',
    answer:
      'Registered nonprofits and open-source projects get 50% off any plan. Startups under two years old with less than $5M raised get their first year of Growth at half price through our partner program — apply from the billing page.',
  },
];

// ============= HELPERS =============

/** en-US formatting is pinned so fixture rendering stays deterministic. */
function formatUSD(amount: number): string {
  return \`$\${amount.toLocaleString('en-US')}\`;
}

function perSeatPrice(plan: Plan, billing: Billing): number {
  return billing === 'annual' ? plan.annualPerSeat : plan.monthlyPerSeat;
}

function priceCadence(billing: Billing): string {
  return billing === 'annual'
    ? 'per seat / mo, billed yearly'
    : 'per seat / mo';
}

/** String values ("5,000") count as included; only \`false\` is a dash. */
function rowIncludesPlan(value: FeatureValue): boolean {
  return typeof value === 'boolean' ? value : true;
}

// Both derive purely from module constants, so they are computed once at
// module scope instead of per-render (even memoized) work.
const TOTAL_FEATURE_COUNT = FEATURE_GROUPS.reduce(
  (count, group) => count + group.rows.length,
  0,
);

const INCLUDED_COUNTS = PLANS.map((_, planIndex) =>
  FEATURE_GROUPS.reduce(
    (count, group) =>
      count +
      group.rows.filter(row => rowIncludesPlan(row.values[planIndex])).length,
    0,
  ),
);

// ============= PIECES =============

/** Green check for included features; announced as "Included". */
function CheckGlyph() {
  return (
    <span role="img" aria-label="Included" style={styles.checkGlyph}>
      <CheckIcon size={18} strokeWidth={2} aria-hidden="true" />
    </span>
  );
}

/** Muted dash for excluded features; announced as "Not included". */
function DashGlyph() {
  return (
    <span role="img" aria-label="Not included">
      <Text type="body" color="disabled">
        —
      </Text>
    </span>
  );
}

function FeatureValueCell({value}: {value: FeatureValue}) {
  if (typeof value === 'boolean') {
    return value ? <CheckGlyph /> : <DashGlyph />;
  }
  // Tabular numerals keep digit widths equal so comparable values
  // ("50,000" vs "5,000,000") align across plan columns.
  return (
    <Text type="body" hasTabularNumbers>
      {value}
    </Text>
  );
}

function PlanGlyphTile({plan}: {plan: Plan}) {
  return (
    <div style={{...styles.glyphTile, ...plan.glyphStyle}} aria-hidden="true">
      <Icon icon={plan.icon} size="md" color="inherit" />
    </div>
  );
}

function PlanCard({
  plan,
  billing,
  onCta,
}: {
  plan: Plan;
  billing: Billing;
  onCta: (plan: Plan) => void;
}) {
  const price = perSeatPrice(plan, billing);
  const savings = annualSavingsPerSeat(plan);
  return (
    <Card
      padding={5}
      height="100%"
      style={plan.isPopular ? styles.cardPopular : undefined}>
      <VStack gap={4}>
        <HStack gap={3} vAlign="center">
          <PlanGlyphTile plan={plan} />
          <StackItem size="fill">
            <VStack gap={1}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Text type="label">{plan.name}</Text>
                {plan.isPopular ? (
                  <Badge variant="info" label="Most popular" />
                ) : null}
              </HStack>
              <Text type="supporting" color="secondary">
                {plan.tagline}
              </Text>
            </VStack>
          </StackItem>
        </HStack>

        <VStack gap={1}>
          <HStack gap={1} vAlign="end">
            <Heading level={2}>{formatUSD(price)}</Heading>
            <Text type="supporting" color="secondary">
              {priceCadence(billing)}
            </Text>
          </HStack>
          {billing === 'annual' ? (
            <HStack gap={2} vAlign="center">
              <Badge
                variant="success"
                label={\`Save \${formatUSD(savings)} / seat / yr\`}
              />
              <Text type="supporting" color="secondary">
                vs {formatUSD(plan.monthlyPerSeat)} monthly
              </Text>
            </HStack>
          ) : (
            <Text type="supporting" color="secondary">
              or {formatUSD(plan.annualPerSeat)} / seat / mo billed yearly
            </Text>
          )}
        </VStack>

        <div style={styles.ctaSlot}>
          <Button
            label={plan.cta}
            variant={plan.ctaVariant}
            onClick={() => onCta(plan)}
          />
        </div>

        <Divider />

        <VStack gap={2}>
          <Text type="supporting" color="secondary">
            {plan.includedHeading}
          </Text>
          {plan.included.map(feature => (
            <HStack key={feature} gap={2} vAlign="start">
              <CheckGlyph />
              <StackItem size="fill">
                <Text type="body">{feature}</Text>
              </StackItem>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

/** One estimator tile: seats × per-seat price for a single plan. */
function EstimateTile({
  plan,
  billing,
  seats,
}: {
  plan: Plan;
  billing: Billing;
  seats: number;
}) {
  const perSeat = perSeatPrice(plan, billing);
  const total = perSeat * seats;
  return (
    <div
      style={{
        ...styles.totalTile,
        ...(plan.isPopular ? styles.totalTilePopular : undefined),
      }}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Text type="supporting" color="secondary">
            {plan.name}
          </Text>
          {plan.isPopular ? <Badge variant="info" label="Popular" /> : null}
        </HStack>
        <Text type="large" hasTabularNumbers>
          {formatUSD(total)} / mo
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {seats} {seats === 1 ? 'seat' : 'seats'} × {formatUSD(perSeat)}
          {billing === 'annual' ? ', billed yearly' : ''}
        </Text>
      </VStack>
    </div>
  );
}

/** One section band plus its feature rows inside the comparison table. */
function ComparisonGroupRows({
  group,
  labelColumnWidth,
  columnShadow,
}: {
  group: FeatureGroup;
  labelColumnWidth: number;
  columnShadow: string | undefined;
}) {
  return (
    <>
      <tr>
        <th
          scope="colgroup"
          style={{
            ...styles.cell,
            ...styles.labelCell,
            ...styles.groupLabelCell,
            width: labelColumnWidth,
            minWidth: labelColumnWidth,
            boxShadow: columnShadow,
          }}>
          <Text type="label">{group.label}</Text>
        </th>
        <td
          colSpan={PLANS.length}
          aria-hidden="true"
          style={{...styles.cell, ...styles.groupFillCell}}
        />
      </tr>
      {group.rows.map(row => (
        <tr key={row.id}>
          <th
            scope="row"
            style={{
              ...styles.cell,
              ...styles.labelCell,
              width: labelColumnWidth,
              minWidth: labelColumnWidth,
              boxShadow: columnShadow,
            }}>
            <VStack gap={0}>
              <Text type="body">{row.label}</Text>
              {row.hint ? (
                <Text type="supporting" color="secondary">
                  {row.hint}
                </Text>
              ) : null}
            </VStack>
          </th>
          {row.values.map((value, index) => (
            <td
              key={PLANS[index].id}
              style={{
                ...styles.cell,
                ...styles.valueCell,
                ...(PLANS[index].isPopular
                  ? styles.valuePopular
                  : undefined),
              }}>
              <FeatureValueCell value={value} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ============= PAGE =============

export default function PricingPlansTemplate() {
  const toast = useToast();
  const [billing, setBilling] = useState<Billing>('annual');
  const [seatInput, setSeatInput] = useState<number | null>(12);
  // Controlled FAQ set so several answers can be open at once; the first
  // entry ships open as an affordance that the rows expand.
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(
    () => new Set([FAQ[0].id]),
  );
  // Frozen-column shadow appears only once the matrix has scrolled.
  const [scrolledX, setScrolledX] = useState(false);

  // <=640px: the comparison table's frozen label column narrows so a full
  // plan column stays visible beside it on phones.
  const isCompact = useMediaQuery('(max-width: 640px)');
  const labelColumnWidth = isCompact ? 132 : 220;
  const planColumnMinWidth = isCompact ? 128 : 176;

  // Clearing the NumberInput falls back to a single seat, never NaN.
  const seats = Math.max(1, Math.min(500, seatInput ?? 1));

  const handleCta = (plan: Plan) => {
    toast({body: plan.ctaToast, uniqueID: \`pricing-cta-\${plan.id}\`});
  };

  const toggleFaq = (id: string, isOpen: boolean) => {
    setOpenFaqs(prev => {
      const next = new Set(prev);
      if (isOpen) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrolledX(event.currentTarget.scrollLeft > 0);
  };

  const columnShadow = scrolledX ? COLUMN_SHADOW : undefined;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={1}>
                <Heading level={1}>Plans & pricing</Heading>
                <Text type="supporting" color="secondary">
                  Beacon product analytics — start free, upgrade when your
                  traffic does.
                </Text>
              </VStack>
            </StackItem>
            {/* The savings Badge tracks the toggle: an offer while monthly
                is selected, a confirmation once annual is applied. */}
            {billing === 'annual' ? (
              <Badge variant="success" label="20% off applied" />
            ) : (
              <Badge label="Save 20% with annual" />
            )}
            <SegmentedControl
              label="Billing period"
              value={billing}
              onChange={value => setBilling(value as Billing)}
              size="sm">
              <SegmentedControlItem label="Monthly" value="monthly" />
              <SegmentedControlItem label="Annual · save 20%" value="annual" />
            </SegmentedControl>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.content}>
            <VStack gap={6}>
              {/* ---- Plan cards ---- */}
              <Grid columns={{minWidth: 264, max: 3}} gap={3}>
                {PLANS.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    billing={billing}
                    onCta={handleCta}
                  />
                ))}
              </Grid>

              {/* ---- Seat estimator ---- */}
              <Card padding={5}>
                <VStack gap={4}>
                  <HStack gap={3} vAlign="center" wrap="wrap">
                    <StackItem size="fill">
                      <VStack gap={1}>
                        <Heading level={2}>Estimate your bill</Heading>
                        <Text type="supporting" color="secondary">
                          Slide the seat count and every plan total below
                          recalculates with the current billing period.
                        </Text>
                      </VStack>
                    </StackItem>
                    <NumberInput
                      label="Seats"
                      value={seatInput}
                      onChange={setSeatInput}
                      min={1}
                      max={500}
                      step={1}
                      startIcon={<Icon icon={UsersIcon} size="sm" />}
                    />
                  </HStack>
                  <Grid columns={{minWidth: 220, max: 3}} gap={3}>
                    {PLANS.map(plan => (
                      <EstimateTile
                        key={plan.id}
                        plan={plan}
                        billing={billing}
                        seats={seats}
                      />
                    ))}
                  </Grid>
                </VStack>
              </Card>

              {/* ---- Feature comparison ---- */}
              <VStack gap={3}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Heading level={2}>Compare all features</Heading>
                  <Text type="supporting" color="secondary">
                    {TOTAL_FEATURE_COUNT} features · {PLANS.length} plans
                  </Text>
                </HStack>
                <div
                  style={styles.scroller}
                  onScroll={handleScroll}
                  tabIndex={0}
                  role="region"
                  aria-label="Plan feature comparison">
                  <table style={styles.table}>
                    <caption style={styles.visuallyHidden}>
                      Beacon plan comparison: features by plan
                    </caption>
                    <thead>
                      <tr>
                        {/* Corner cell: frozen with the label column. */}
                        <th
                          scope="col"
                          style={{
                            ...styles.cell,
                            ...styles.labelCell,
                            ...styles.headerCell,
                            textAlign: 'left',
                            width: labelColumnWidth,
                            minWidth: labelColumnWidth,
                            boxShadow: columnShadow,
                          }}>
                          <VStack gap={1}>
                            <Text type="label">Beacon</Text>
                            <Text type="supporting" color="secondary">
                              Product analytics
                            </Text>
                          </VStack>
                        </th>
                        {PLANS.map((plan, index) => (
                          <th
                            key={plan.id}
                            scope="col"
                            style={{
                              ...styles.cell,
                              ...styles.headerCell,
                              ...(plan.isPopular
                                ? styles.headerPopular
                                : undefined),
                              minWidth: planColumnMinWidth,
                            }}>
                            <VStack gap={1} hAlign="center">
                              {plan.isPopular ? (
                                <Badge variant="info" label="Most popular" />
                              ) : null}
                              <Text type="label">{plan.name}</Text>
                              <Text type="large" hasTabularNumbers>
                                {formatUSD(perSeatPrice(plan, billing))}
                              </Text>
                              <Text type="supporting" color="secondary">
                                {priceCadence(billing)}
                              </Text>
                              <Text type="supporting" color="secondary">
                                {INCLUDED_COUNTS[index]} of{' '}
                                {TOTAL_FEATURE_COUNT} features
                              </Text>
                              <Button
                                label={plan.cta}
                                variant={plan.ctaVariant}
                                size="sm"
                                onClick={() => handleCta(plan)}
                              />
                            </VStack>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {FEATURE_GROUPS.map(group => (
                        <ComparisonGroupRows
                          key={group.id}
                          group={group}
                          labelColumnWidth={labelColumnWidth}
                          columnShadow={columnShadow}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <Text type="supporting" color="secondary">
                  Prices in USD per seat. Annual billing saves 20% and bills
                  once per year. Event quotas reset on the first of each
                  month.
                </Text>
              </VStack>

              {/* ---- FAQ ---- */}
              <VStack gap={3}>
                <HStack gap={2} vAlign="center">
                  <Icon icon={CircleHelpIcon} size="md" color="secondary" />
                  <Heading level={2}>Frequently asked questions</Heading>
                </HStack>
                <Card padding={5}>
                  <VStack gap={0}>
                    {FAQ.map((entry, index) => (
                      <VStack key={entry.id} gap={0}>
                        {index > 0 ? <Divider /> : null}
                        <div style={styles.faqItem}>
                          <Collapsible
                            isOpen={openFaqs.has(entry.id)}
                            onOpenChange={isOpen =>
                              toggleFaq(entry.id, isOpen)
                            }
                            trigger={entry.question}>
                            <div style={styles.faqBody}>
                              <Text type="body" color="secondary">
                                {entry.answer}
                              </Text>
                            </div>
                          </Collapsible>
                        </div>
                      </VStack>
                    ))}
                  </VStack>
                </Card>
              </VStack>

              {/* ---- Closing contact band ---- */}
              <Card padding={5}>
                <HStack gap={3} vAlign="center" wrap="wrap">
                  <Icon icon={MessageCircleIcon} size="lg" color="secondary" />
                  <StackItem size="fill">
                    <VStack gap={1}>
                      <Text type="label">Still comparing?</Text>
                      <Text type="supporting" color="secondary">
                        Tell us about your stack and traffic — we&rsquo;ll
                        recommend a plan and share a security review packet.
                      </Text>
                    </VStack>
                  </StackItem>
                  <Button
                    label="Talk to sales"
                    variant="primary"
                    onClick={() =>
                      toast({
                        body: 'Thanks — sales will reach out within 1 business day',
                        uniqueID: 'pricing-contact-sales',
                      })
                    }
                  />
                </HStack>
              </Card>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};