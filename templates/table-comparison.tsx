// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file table-comparison.tsx
 * @input Deterministic fixtures only (five pricing plans for "Relay", a
 *   workflow-automation platform, plus grouped feature rows with string or
 *   boolean values; fixed monthly/annual price pairs)
 * @output Comparison table with a frozen first column: attribute labels stay
 *   pinned via position:sticky while plan columns scroll horizontally in the
 *   scroll container; sticky plan-header row with price + CTA per plan,
 *   check/dash inclusion cells, highlighted recommended column, a billing
 *   toggle, and a differences-only filter
 * @position Page template; emitted by `astryx template table-comparison`
 *
 * Frame: header | scroll region (fill) | footnote row. The scroll container
 * owns both axes; the frozen column and sticky header live inside it, so the
 * page chrome never needs to scroll.
 *
 * Sticky contract: the attribute-label column is position:sticky left:0
 * (z-index 1), the plan-header row is sticky top:0 (z-index 2), and the
 * top-left corner cell is sticky on both axes (z-index 3). All sticky cells
 * carry opaque backgrounds; scroll offsets toggle edge shadows so depth only
 * appears once content actually slides underneath.
 *
 * Responsive contract:
 * - All widths: plan columns never shrink below their minimum — the region
 *   scrolls horizontally instead; the label column keeps its width and stays
 *   frozen at the left edge. The scroller is focusable (tabIndex 0) so
 *   keyboard users can pan it.
 * - > 768px: 240px label column, 200px-minimum plan columns; header keeps
 *   title, billing toggle, and differences switch on one row.
 * - <= 768px: label column narrows to 156px and plan columns to 168px so a
 *   full plan is visible beside the frozen labels; header controls wrap
 *   under the title (HStack wrap).
 * - Vertical: the same container scrolls vertically; the sticky plan header
 *   keeps prices and CTAs visible while long feature groups scroll.
 */

import {useMemo, useState, type CSSProperties, type UIEvent} from 'react';

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
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Switch} from '@astryxdesign/core/Switch';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {CheckIcon} from 'lucide-react';

// ============= STYLES =============

const colors = {
  surface: 'var(--color-background, #FFFFFF)',
  surfaceMuted: 'var(--color-background-muted, #F5F5F7)',
  accent: 'var(--color-accent, #0171E3)',
  accentMuted: 'var(--color-accent-muted, #EAF2FF)',
  border: 'var(--color-border, #E2E2E6)',
  success: 'var(--color-data-categorical-green, #0B991F)',
};

// Edge shadows only render after the matching axis has actually scrolled.
const COLUMN_SHADOW = '8px 0 8px -8px rgba(15, 23, 42, 0.18)';
const HEADER_SHADOW = '0 8px 8px -8px rgba(15, 23, 42, 0.18)';

const styles: Record<string, CSSProperties> = {
  // Layout content is padding 0; this wrapper owns the page padding and
  // hands remaining height to the scroller.
  contentFill: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
    gap: 'var(--spacing-3)',
  },
  // The single scroll container: both axes. Every sticky cell positions
  // itself against this box.
  scroller: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    border: `1px solid ${colors.border}`,
    borderRadius: 'var(--radius-container)',
    backgroundColor: colors.surface,
  },
  table: {
    borderCollapse: 'separate',
    borderSpacing: 0,
    width: 'max-content',
    minWidth: '100%',
  },
  // Base cell chrome shared by every cell.
  cell: {
    borderBottom: `1px solid ${colors.border}`,
    padding: 'var(--spacing-3)',
    verticalAlign: 'middle',
  },
  // Frozen attribute-label column (also the row headers).
  labelCell: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    backgroundColor: colors.surface,
    textAlign: 'left',
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  // Sticky plan-header row.
  headerCell: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    backgroundColor: colors.surface,
    textAlign: 'center',
    verticalAlign: 'bottom',
    padding: 'var(--spacing-4) var(--spacing-3) var(--spacing-3)',
    borderTop: '3px solid transparent',
  },
  // Top-left corner: frozen on both axes, above everything else.
  cornerCell: {
    left: 0,
    zIndex: 3,
    textAlign: 'left',
    verticalAlign: 'bottom',
    padding: 'var(--spacing-4)',
  },
  headerRecommended: {
    backgroundColor: colors.accentMuted,
    borderTop: `3px solid ${colors.accent}`,
  },
  valueCell: {
    textAlign: 'center',
  },
  valueRecommended: {
    backgroundColor: colors.accentMuted,
  },
  // Full-width section band; the label part stays frozen with the column.
  groupLabelCell: {
    backgroundColor: colors.surfaceMuted,
    padding: 'var(--spacing-2) var(--spacing-4)',
  },
  groupFillCell: {
    backgroundColor: colors.surfaceMuted,
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  checkGlyph: {
    display: 'inline-flex',
    color: colors.success,
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

interface Plan {
  id: string;
  name: string;
  tagline: string;
  /** null = custom pricing (Enterprise). */
  monthly: number | null;
  annual: number | null;
  cta: string;
  ctaVariant: 'primary' | 'secondary';
  isRecommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Kick the tires',
    monthly: 0,
    annual: 0,
    cta: 'Get started',
    ctaVariant: 'secondary',
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For solo builders',
    monthly: 12,
    annual: 10,
    cta: 'Start trial',
    ctaVariant: 'secondary',
  },
  {
    id: 'team',
    name: 'Team',
    tagline: 'For product teams',
    monthly: 29,
    annual: 24,
    cta: 'Start 14-day trial',
    ctaVariant: 'primary',
    isRecommended: true,
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For scaling orgs',
    monthly: 59,
    annual: 49,
    cta: 'Start trial',
    ctaVariant: 'secondary',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Security and scale',
    monthly: null,
    annual: null,
    cta: 'Contact sales',
    ctaVariant: 'secondary',
  },
];

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
        id: 'runs',
        label: 'Workflow runs / month',
        hint: 'Successful and failed runs both count',
        values: ['1,000', '10,000', '50,000', '250,000', 'Custom'],
      },
      {
        id: 'workflows',
        label: 'Active workflows',
        values: ['5', '25', 'Unlimited', 'Unlimited', 'Unlimited'],
      },
      {
        id: 'members',
        label: 'Team members',
        values: ['1', '3', '25', '100', 'Unlimited'],
      },
      {
        id: 'history',
        label: 'Run history retention',
        values: ['7 days', '30 days', '90 days', '1 year', 'Custom'],
      },
    ],
  },
  {
    id: 'build',
    label: 'Build & automate',
    rows: [
      {
        id: 'builder',
        label: 'Visual workflow builder',
        // Equal across plans on purpose — hidden by "Differences only".
        values: [true, true, true, true, true],
      },
      {
        id: 'connectors',
        label: 'Connector library',
        values: ['40+', '120+', '300+', '300+', '300+ & custom'],
      },
      {
        id: 'code-steps',
        label: 'Code steps (JS / Python)',
        values: [false, true, true, true, true],
      },
      {
        id: 'schedules',
        label: 'Scheduled triggers',
        hint: 'Minimum interval between runs',
        values: ['1 hour', '15 min', '1 min', '1 min', '30 sec'],
      },
      {
        id: 'retries',
        label: 'Automatic error retries',
        values: [false, false, true, true, true],
      },
    ],
  },
  {
    id: 'collab',
    label: 'Collaboration',
    rows: [
      {
        id: 'workspaces',
        label: 'Shared workspaces',
        values: [false, true, true, true, true],
      },
      {
        id: 'review',
        label: 'Draft & review mode',
        hint: 'Changes require approval before deploy',
        values: [false, false, true, true, true],
      },
      {
        id: 'environments',
        label: 'Staging environments',
        values: [false, false, '1', '3', 'Unlimited'],
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
        values: [false, false, false, true, true],
      },
      {
        id: 'scim',
        label: 'SCIM provisioning',
        values: [false, false, false, false, true],
      },
      {
        id: 'audit',
        label: 'Audit log retention',
        values: [false, false, '30 days', '1 year', 'Custom'],
      },
      {
        id: 'residency',
        label: 'EU / US data residency',
        values: [false, false, false, true, true],
      },
      {
        id: 'soc2',
        label: 'SOC 2 Type II report',
        values: [false, false, true, true, true],
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
        // Equal across plans on purpose — hidden by "Differences only".
        values: [true, true, true, true, true],
      },
      {
        id: 'email',
        label: 'Email support',
        values: [false, true, true, true, true],
      },
      {
        id: 'sla',
        label: 'Uptime SLA',
        values: [false, false, false, '99.9%', '99.99%'],
      },
      {
        id: 'csm',
        label: 'Dedicated success manager',
        values: [false, false, false, false, true],
      },
    ],
  },
];

/** A row is a "difference" when any plan's value departs from the first. */
function rowDiffers(row: FeatureRow): boolean {
  return row.values.some(value => String(value) !== String(row.values[0]));
}

function priceParts(plan: Plan, billing: Billing): {
  amount: string;
  cadence: string;
} {
  const price = billing === 'annual' ? plan.annual : plan.monthly;
  if (price === null) {
    return {amount: 'Custom', cadence: 'annual contract'};
  }
  if (price === 0) {
    return {amount: '$0', cadence: 'free forever'};
  }
  return {
    amount: `$${price}`,
    cadence:
      billing === 'annual' ? 'per user / mo, billed yearly' : 'per user / mo',
  };
}

// ============= CELL PIECES =============

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
  // ("1,000" vs "250,000") align across plan columns.
  return (
    <Text type="body" hasTabularNumbers>
      {value}
    </Text>
  );
}

// ============= PAGE =============

export default function TableComparisonTemplate() {
  const [billing, setBilling] = useState<string>('annual');
  const [diffOnly, setDiffOnly] = useState(false);
  // Edge shadows appear only once the matching axis has scrolled, so the
  // frozen column and header read as flat until content slides under them.
  const [scrolledX, setScrolledX] = useState(false);
  const [scrolledY, setScrolledY] = useState(false);
  const isNarrow = useMediaQuery('(max-width: 768px)');

  const labelColumnWidth = isNarrow ? 156 : 240;
  const planColumnMinWidth = isNarrow ? 168 : 200;

  const visibleGroups = useMemo(() => {
    if (!diffOnly) {
      return FEATURE_GROUPS;
    }
    return FEATURE_GROUPS.map(group => ({
      ...group,
      rows: group.rows.filter(rowDiffers),
    })).filter(group => group.rows.length > 0);
  }, [diffOnly]);

  const visibleRowCount = useMemo(
    () => visibleGroups.reduce((count, group) => count + group.rows.length, 0),
    [visibleGroups],
  );

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const {scrollLeft, scrollTop} = event.currentTarget;
    setScrolledX(scrollLeft > 0);
    setScrolledY(scrollTop > 0);
  };

  const columnShadow = scrolledX ? COLUMN_SHADOW : undefined;
  const headerShadow = scrolledY ? HEADER_SHADOW : undefined;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Compare plans</Heading>
                <Text type="supporting" color="secondary">
                  {visibleRowCount} features · {PLANS.length} plans
                </Text>
              </HStack>
            </StackItem>
            <Switch
              label="Differences only"
              labelPosition="start"
              value={diffOnly}
              onChange={setDiffOnly}
            />
            <SegmentedControl
              label="Billing period"
              value={billing}
              onChange={setBilling}
              size="sm">
              <SegmentedControlItem label="Monthly" value="monthly" />
              <SegmentedControlItem label="Annual · save 20%" value="annual" />
            </SegmentedControl>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.contentFill}>
            <div
              style={styles.scroller}
              onScroll={handleScroll}
              tabIndex={0}
              role="region"
              aria-label="Plan comparison">
              <table style={styles.table}>
                <caption style={styles.visuallyHidden}>
                  Relay plan comparison: features by plan
                </caption>
                <thead>
                  <tr>
                    {/* Corner cell: frozen on both axes. */}
                    <th
                      scope="col"
                      style={{
                        ...styles.cell,
                        ...styles.labelCell,
                        ...styles.headerCell,
                        ...styles.cornerCell,
                        width: labelColumnWidth,
                        minWidth: labelColumnWidth,
                        boxShadow:
                          [columnShadow, headerShadow]
                            .filter(Boolean)
                            .join(', ') || undefined,
                      }}>
                      <VStack gap={1}>
                        <Text type="label">Relay</Text>
                        <Text type="supporting" color="secondary">
                          Workflow automation
                        </Text>
                      </VStack>
                    </th>
                    {PLANS.map(plan => {
                      const {amount, cadence} = priceParts(plan, billing as Billing);
                      return (
                        <th
                          key={plan.id}
                          scope="col"
                          style={{
                            ...styles.cell,
                            ...styles.headerCell,
                            ...(plan.isRecommended
                              ? styles.headerRecommended
                              : undefined),
                            minWidth: planColumnMinWidth,
                            boxShadow: headerShadow,
                          }}>
                          <VStack gap={1} hAlign="center">
                            {plan.isRecommended ? (
                              <Badge variant="info" label="Recommended" />
                            ) : null}
                            <Text type="label">{plan.name}</Text>
                            <Text type="large" hasTabularNumbers>
                              {amount}
                            </Text>
                            <Text type="supporting" color="secondary">
                              {cadence}
                            </Text>
                            <Text type="supporting" color="secondary">
                              {plan.tagline}
                            </Text>
                            <Button
                              label={plan.cta}
                              variant={plan.ctaVariant}
                              size="sm"
                            />
                          </VStack>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {visibleGroups.map(group => (
                    <FragmentRows
                      key={group.id}
                      group={group}
                      labelColumnWidth={labelColumnWidth}
                      columnShadow={columnShadow}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="secondary">
                Prices in USD. Annual billing saves about 20%. Usage limits
                reset on the first of each month.
              </Text>
            </HStack>
          </div>
        </LayoutContent>
      }
    />
  );
}

/** One section band plus its feature rows. */
function FragmentRows({
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
                ...(PLANS[index].isRecommended
                  ? styles.valueRecommended
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
