var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (nav sections, queue counts, page copy,
 *   setup-task cards)
 * @output Application shell with a persistent, collapsible left sidebar:
 *   AppShell frames a SideNav (grouped sections, nested queue items with one
 *   group expanded, live active state) beside a placeholder content page —
 *   page header, a 3-up setup-task card row, and a clearly marked
 *   swap-me EmptyState content slot
 * @position Page template; emitted by \`astryx template shell-left-sidebar\`
 *
 * Frame: AppShell owns the page. Its sideNav slot carries the SideNav
 * (heading, "New conversation" action, three sections, footer icons);
 * its children slot is the single scrollable content region
 * (contentPadding 0 — the page supplies its own centered column). The
 * EmptyState slot is the point of this template: swap it for a
 * conversation list, table, or settings form; the sidebar chrome stays.
 *
 * Responsive contract:
 * - >768px: sidebar is persistent at its default width; the built-in collapse
 *   button (controlled via useState) shrinks it to an icon-only rail and the
 *   content area reclaims the width.
 * - <=768px: AppShell's automatic mobile nav takes over — the sidebar leaves
 *   the flow and reopens as a hamburger-triggered drawer with the same nav.
 * - Page header: wrap="wrap" on the action row — on wide viewports the
 *   Refresh / New conversation buttons sit beside the title; on narrow
 *   viewports they wrap below it instead of squeezing the title column.
 * - Setup-task cards: Grid columns={{minWidth: 260, max: 3}} — 3-up on
 *   wide viewports, reflowing to 2-up and 1-up as the viewport narrows.
 * - Content column: max width 880px, centered; the page scrolls inside the
 *   shell's content region while sidebar chrome stays fixed.
 */

import {useState, type CSSProperties} from 'react';

import {AppShell} from '@astryxdesign/core/AppShell';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {VStack, HStack, StackItem} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon, type IconType} from '@astryxdesign/core/Icon';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {
  BellIcon,
  BookmarkIcon,
  HashIcon,
  HomeIcon,
  InboxIcon,
  MessagesSquareIcon,
  PlusIcon,
  RefreshCwIcon,
  RouteIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered reading column inside the shell's scrollable content region.
  page: {
    maxWidth: 880,
    margin: '0 auto',
    padding: 'var(--spacing-6) var(--spacing-4)',
    boxSizing: 'border-box',
  },
};

// ============= DATA =============

// Sidebar model: flat leaves plus nested queue groups. Exactly one group
// (Channels) starts expanded; Teams starts collapsed.
interface NavLeaf {
  kind: 'leaf';
  id: string;
  label: string;
  icon: IconType;
  count?: number;
}

interface NavGroup {
  kind: 'group';
  label: string;
  icon: IconType;
  startsCollapsed: boolean;
  children: Array<{id: string; label: string; count?: number}>;
}

type NavEntry = NavLeaf | NavGroup;

const NAV_SECTIONS: Array<{title: string; entries: NavEntry[]}> = [
  {
    title: 'Workspace',
    entries: [
      {kind: 'leaf', id: 'home', label: 'Home', icon: HomeIcon},
      {kind: 'leaf', id: 'inbox', label: 'Inbox', icon: InboxIcon, count: 24},
      {
        kind: 'leaf',
        id: 'saved-replies',
        label: 'Saved replies',
        icon: BookmarkIcon,
      },
    ],
  },
  {
    title: 'Queues',
    entries: [
      {
        kind: 'group',
        label: 'Channels',
        icon: HashIcon,
        startsCollapsed: false,
        children: [
          {id: 'queue-email', label: 'Email', count: 16},
          {id: 'queue-live-chat', label: 'Live chat', count: 5},
          {id: 'queue-community', label: 'Community forum', count: 3},
        ],
      },
      {
        kind: 'group',
        label: 'Teams',
        icon: UsersIcon,
        startsCollapsed: true,
        children: [
          {id: 'team-billing', label: 'Billing'},
          {id: 'team-onboarding', label: 'Onboarding'},
          {id: 'team-escalations', label: 'Escalations'},
        ],
      },
    ],
  },
  {
    title: 'Admin',
    entries: [
      {kind: 'leaf', id: 'notifications', label: 'Notifications', icon: BellIcon},
      {kind: 'leaf', id: 'settings', label: 'Settings', icon: SettingsIcon},
    ],
  },
];

// Header copy for every navigable id; the placeholder body stays the same.
const PAGE_COPY: Record<string, {title: string; description: string}> = {
  'home': {
    title: 'Home',
    description: 'Workspace overview and setup progress for Halcyon Support.',
  },
  'inbox': {
    title: 'Inbox',
    description: '24 open conversations across all connected channels.',
  },
  'saved-replies': {
    title: 'Saved replies',
    description: 'Reusable answers your team can insert into any reply.',
  },
  'queue-email': {
    title: 'Email queue',
    description: '16 open conversations forwarded from support@acmecloud.com.',
  },
  'queue-live-chat': {
    title: 'Live chat queue',
    description: '5 active chats from the in-app messenger.',
  },
  'queue-community': {
    title: 'Community forum queue',
    description: '3 unanswered threads escalated from the community forum.',
  },
  'team-billing': {
    title: 'Billing team',
    description: 'Conversations assigned to the Billing specialists.',
  },
  'team-onboarding': {
    title: 'Onboarding team',
    description: 'Conversations from accounts in their first 30 days.',
  },
  'team-escalations': {
    title: 'Escalations team',
    description: 'Priority conversations past their first-response target.',
  },
  'notifications': {
    title: 'Notifications',
    description: 'Choose how Halcyon alerts you about queue activity.',
  },
  'settings': {
    title: 'Settings',
    description: 'Workspace, channel, and automation configuration.',
  },
};

// Setup tasks the workspace hasn't finished yet — deliberately distinct
// from the already-connected channels the queue counts come from.
const STARTER_CARDS = [
  {
    id: 'saved-replies',
    title: 'Create saved replies',
    description:
      'Draft reusable answers for refunds, password resets, and outage updates.',
    icon: BookmarkIcon,
    badge: 'Recommended',
  },
  {
    id: 'invite-team',
    title: 'Invite your team',
    description:
      'Bring agents into shared queues with roles and office hours.',
    icon: UsersIcon,
  },
  {
    id: 'assignment-rules',
    title: 'Set up assignment rules',
    description:
      'Auto-route conversations by channel, language, and agent workload.',
    icon: RouteIcon,
  },
] as const;

// ============= PAGE =============

export default function ShellLeftSidebarTemplate() {
  // Collapse state is lifted so the toggle is an explicit useState round-trip
  // (SideNav's built-in button drives it in controlled mode).
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [activeId, setActiveId] = useState('inbox');
  const page = PAGE_COPY[activeId] ?? PAGE_COPY['inbox'];

  const sideNav = (
    <SideNav
      header={
        <SideNavHeading
          icon={<Icon icon={MessagesSquareIcon} />}
          heading="Halcyon"
          subheading="Acme Cloud Support"
        />
      }
      topContent={
        <Button
          label="New conversation"
          variant="primary"
          icon={<Icon icon={PlusIcon} size="sm" />}
        />
      }
      collapsible={{
        isCollapsed: isNavCollapsed,
        onCollapsedChange: setIsNavCollapsed,
        buttonLabel: 'Toggle navigation sidebar',
      }}
      footerIcons={
        <>
          <IconButton
            label="Notifications"
            icon={<Icon icon={BellIcon} size="sm" />}
            variant="ghost"
          />
          <IconButton
            label="Workspace settings"
            icon={<Icon icon={SettingsIcon} size="sm" />}
            variant="ghost"
          />
          <Avatar name="Dana Whitfield" size="xsmall" />
        </>
      }>
      {NAV_SECTIONS.map(section => (
        <SideNavSection key={section.title} title={section.title}>
          {section.entries.map(entry =>
            entry.kind === 'leaf' ? (
              <SideNavItem
                key={entry.id}
                label={entry.label}
                icon={entry.icon}
                isSelected={activeId === entry.id}
                onClick={() => setActiveId(entry.id)}
                endContent={
                  entry.count !== undefined ? (
                    <Badge variant="info" label={String(entry.count)} />
                  ) : undefined
                }
              />
            ) : (
              <SideNavItem
                key={entry.label}
                label={entry.label}
                icon={entry.icon}
                collapsible={{defaultIsCollapsed: entry.startsCollapsed}}>
                {entry.children.map(child => (
                  <SideNavItem
                    key={child.id}
                    label={child.label}
                    isSelected={activeId === child.id}
                    onClick={() => setActiveId(child.id)}
                    endContent={
                      child.count !== undefined ? (
                        <Badge variant="info" label={String(child.count)} />
                      ) : undefined
                    }
                  />
                ))}
              </SideNavItem>
            ),
          )}
        </SideNavSection>
      ))}
    </SideNav>
  );

  return (
    <AppShell height="fill" contentPadding={0} sideNav={sideNav}>
      <div style={styles.page}>
        <VStack gap={6}>
          {/* Page header — title tracks the active nav item. wrap="wrap"
              lets the action buttons drop below the title on narrow
              viewports instead of squeezing the fill title column. */}
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={1}>
                <Heading level={1}>{page.title}</Heading>
                <Text type="supporting" color="secondary">
                  {page.description}
                </Text>
              </VStack>
            </StackItem>
            <Button
              label="Refresh"
              variant="ghost"
              icon={<Icon icon={RefreshCwIcon} size="sm" />}
            />
            <Button
              label="New conversation"
              variant="primary"
              icon={<Icon icon={PlusIcon} size="sm" />}
            />
          </HStack>

          {/* Setup-task cards — 3-up, reflowing to 1-up when narrow. */}
          <VStack gap={2}>
            <Text type="label">Finish setting up</Text>
            <Grid columns={{minWidth: 260, max: 3}} gap={3}>
              {STARTER_CARDS.map(card => (
                <ClickableCard
                  key={card.id}
                  label={card.title}
                  href="#"
                  padding={4}>
                  <VStack gap={2}>
                    <HStack gap={2} vAlign="center">
                      <Icon icon={card.icon} size="md" />
                      <StackItem size="fill" />
                      {'badge' in card && card.badge !== undefined ? (
                        <Badge variant="success" label={card.badge} />
                      ) : null}
                    </HStack>
                    <Text type="body">{card.title}</Text>
                    <Text type="supporting" color="secondary">
                      {card.description}
                    </Text>
                  </VStack>
                </ClickableCard>
              ))}
            </Grid>
          </VStack>

          {/* Placeholder body — the swap-me slot; the title tracks the
              active nav item so section switching reads end to end. */}
          <Card padding={8}>
            <EmptyState
              icon={<Icon icon={MessagesSquareIcon} size="lg" />}
              title={\`\${page.title} content region\`}
              description="Swap this placeholder for the page's real body — a filterable conversation list for queues, a preferences form for settings — while the sidebar shell stays put."
              actions={<Button label="View setup guide" variant="secondary" />}
            />
          </Card>
        </VStack>
      </div>
    </AppShell>
  );
}
`;export{e as default};