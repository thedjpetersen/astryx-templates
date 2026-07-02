// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (nav sections with per-section page
 *   header copy and actions, current user, workspace stats)
 * @output App shell with a horizontal TopNav — product mark (NavIcon +
 *   TopNavHeading), five primary TopNavItem links with useState-driven
 *   active state, right-side search input and notifications + Avatar —
 *   over a full-width content area with a per-section page header and a
 *   clearly marked placeholder content region
 * @position Page template; emitted by `astryx template shell-top-nav`
 *
 * Frame: Layout height="fill" owns the page. The TopNav sits in a
 * LayoutHeader (padding 0 — TopNav manages its own padding) with a
 * divider. LayoutContent is the single full-width region below: a page
 * header row (section title + description, actions pinned right) and a
 * placeholder slot that stretches to the remaining height. The slot is
 * the point of this template — swap it for a dashboard, table, or
 * detail view; the chrome stays.
 *
 * Responsive contract:
 * - >768px: TopNav shows the product mark, five text links, a 260px
 *   search input, the notifications button, and the avatar. The page
 *   header keeps title left / actions right on one row.
 * - <=768px: the search input collapses to an icon-only search button
 *   so the five nav links keep their labels; the page header stacks
 *   vertically (title block above the action row).
 * - LayoutContent scrolls internally; the nav bar never scrolls away.
 * - The placeholder region keeps a 320px floor so the slot reads as a
 *   content area even before real content lands.
 */

import {useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {
  TopNav,
  TopNavHeading,
  TopNavItem,
} from '@astryxdesign/core/TopNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {TextInput} from '@astryxdesign/core/TextInput';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  BellIcon,
  ChartColumnIcon,
  HashIcon,
  LayoutDashboardIcon,
  PlusIcon,
  ReceiptIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Fill the scroll container so the placeholder slot can flex to the
  // remaining height below the page header.
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    minHeight: '100%',
    boxSizing: 'border-box',
  },
  // Dashed slot boundary: this region is where real page content goes.
  slot: {
    flex: 1,
    minHeight: 320,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 'var(--radius-container)',
    border: '1.5px dashed var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6)',
  },
};

// ============= DATA =============

const CURRENT_USER = 'Dana Whitfield';

type SectionIcon = typeof LayoutDashboardIcon;

interface ShellSection {
  id: string;
  navLabel: string;
  title: string;
  description: string;
  primaryAction: string;
  slotIcon: SectionIcon;
  slotTitle: string;
  slotDescription: string;
}

// One entry per primary nav link. Each section swaps the page header
// copy, the primary action, and the placeholder-slot messaging so the
// shell demonstrates real section switching, not just a highlighted link.
const SECTIONS: ShellSection[] = [
  {
    id: 'overview',
    navLabel: 'Overview',
    title: 'Overview',
    description:
      'Billing health across 3 workspaces · June 2026 close in 4 days',
    primaryAction: 'New invoice',
    slotIcon: LayoutDashboardIcon,
    slotTitle: 'Overview content region',
    slotDescription:
      'Swap this slot for the revenue dashboard: MRR stat row, aging chart, and the collections queue.',
  },
  {
    id: 'customers',
    navLabel: 'Customers',
    title: 'Customers',
    description: '1,284 active accounts · 37 past due · 12 added this week',
    primaryAction: 'Add customer',
    slotIcon: UsersIcon,
    slotTitle: 'Customers content region',
    slotDescription:
      'Swap this slot for the account directory: filterable table with plan, balance, and owner columns.',
  },
  {
    id: 'invoices',
    navLabel: 'Invoices',
    title: 'Invoices',
    description: '342 issued this cycle · $1.2M outstanding · 9 disputed',
    primaryAction: 'New invoice',
    slotIcon: ReceiptIcon,
    slotTitle: 'Invoices content region',
    slotDescription:
      'Swap this slot for the invoice ledger: status-grouped rows with bulk send and reminder actions.',
  },
  {
    id: 'reports',
    navLabel: 'Reports',
    title: 'Reports',
    description: 'Recognized revenue, churn, and collections — May 2026 final',
    primaryAction: 'New report',
    slotIcon: ChartColumnIcon,
    slotTitle: 'Reports content region',
    slotDescription:
      'Swap this slot for saved report cards and the scheduled-export list.',
  },
  {
    id: 'settings',
    navLabel: 'Settings',
    title: 'Workspace settings',
    description: 'Acme Corp workspace · Growth plan · 14 members',
    primaryAction: 'Invite member',
    slotIcon: SettingsIcon,
    slotTitle: 'Settings content region',
    slotDescription:
      'Swap this slot for the settings form: billing profile, tax IDs, dunning schedule, and member roles.',
  },
];

// ============= COMPONENT =============

export default function ShellTopNavTemplate() {
  const [activeId, setActiveId] = useState('overview');
  const [query, setQuery] = useState('');
  const isNarrow = useMediaQuery('(max-width: 768px)');

  const section =
    SECTIONS.find(item => item.id === activeId) ?? SECTIONS[0];

  // Page-header actions; shared between the wide (inline) and narrow
  // (stacked) arrangements.
  const headerActions = (
    <HStack gap={2}>
      <Button label="Export" variant="secondary" />
      <Button
        label={section.primaryAction}
        icon={<Icon icon={PlusIcon} size="sm" />}
      />
    </HStack>
  );

  return (
    <Layout
      height="fill"
      header={
        // padding 0: TopNav manages its own internal padding.
        <LayoutHeader hasDivider padding={0} role="banner">
          <TopNav
            label="Primary"
            heading={
              <TopNavHeading
                logo={
                  <NavIcon
                    icon={<HashIcon style={{width: 16, height: 16}} />}
                  />
                }
                heading="Ledgerline"
                subheading="Acme Corp"
              />
            }
            startContent={
              <>
                {SECTIONS.map(item => (
                  <TopNavItem
                    key={item.id}
                    label={item.navLabel}
                    href={`#${item.id}`}
                    isSelected={item.id === activeId}
                    onClick={event => {
                      event.preventDefault();
                      setActiveId(item.id);
                    }}
                  />
                ))}
              </>
            }
            endContent={
              <HStack gap={2} vAlign="center">
                {isNarrow ? (
                  <IconButton
                    label="Search"
                    icon={<Icon icon={SearchIcon} size="sm" />}
                    variant="ghost"
                  />
                ) : (
                  <TextInput
                    label="Search"
                    isLabelHidden
                    size="sm"
                    width={260}
                    placeholder="Search customers, invoices…"
                    startIcon={<Icon icon={SearchIcon} size="sm" />}
                    value={query}
                    onChange={setQuery}
                  />
                )}
                <IconButton
                  label="Notifications (3 unread)"
                  icon={<Icon icon={BellIcon} size="sm" />}
                  variant="ghost"
                />
                <Avatar name={CURRENT_USER} size="xsmall" />
              </HStack>
            }
          />
        </LayoutHeader>
      }
      content={
        <LayoutContent role="main" label={section.title}>
          <div style={styles.page}>
            {/* Page header: title block left, actions right; stacks on
                narrow viewports. */}
            {isNarrow ? (
              <VStack gap={3}>
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center">
                    <Heading level={1}>{section.title}</Heading>
                    <Badge label="Live" variant="success" />
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {section.description}
                  </Text>
                </VStack>
                {headerActions}
              </VStack>
            ) : (
              <HStack gap={3} vAlign="center">
                <StackItem size="fill">
                  <VStack gap={1}>
                    <HStack gap={2} vAlign="center">
                      <Heading level={1}>{section.title}</Heading>
                      <Badge label="Live" variant="success" />
                    </HStack>
                    <Text type="supporting" color="secondary">
                      {section.description}
                    </Text>
                  </VStack>
                </StackItem>
                {headerActions}
              </HStack>
            )}

            {/* Placeholder content region — the slot real pages fill. */}
            <div style={styles.slot}>
              <EmptyState
                icon={<Icon icon={section.slotIcon} size="lg" />}
                headingLevel={2}
                title={section.slotTitle}
                description={section.slotDescription}
                actions={
                  <Button
                    label={section.primaryAction}
                    variant="secondary"
                    icon={<Icon icon={PlusIcon} size="sm" />}
                  />
                }
              />
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
