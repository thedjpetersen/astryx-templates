// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (an 8-skill assistant marketplace
 *   catalog, 5 installed rows split across personal/workspace scopes, and
 *   2 published skills with live/draft status)
 * @output Extension catalog settings surface: LayoutHeader with the page
 *   Heading, a Personal/Workspace scope SegmentedControl plus workspace
 *   Selector, and a badge-counted TabList (Discover / Installed /
 *   Published). Discover is a searchable, category-filtered 2-up Grid of
 *   skill ClickableCards with install actions (one card pinned in an
 *   "Installing…" Spinner state); Installed is a List of rows with
 *   version + scope Badges, enabled Switches with "Saved" Toast feedback,
 *   and a MoreMenu whose Uninstall opens a destructive AlertDialog;
 *   Published lists the user's own skills with live/draft Badges, edit
 *   Buttons, and a status filter whose empty slice reveals an EmptyState.
 * @position Page template; emitted by `astryx template settings-extension-catalog`
 *
 * Frame: Layout height="fill". LayoutHeader owns the title row (heading +
 * scope SegmentedControl + workspace Selector) and the TabList; the tab
 * panes render inside LayoutContent in a centered max-width column, the
 * usual shape for a settings surface. Rows (List) are the right container
 * for installed/published entries; catalog tiles use ClickableCards.
 *
 * Interaction contract:
 * - Scope toggle filters the Installed list and flips which Discover
 *   cards read as already installed; the workspace Selector is only
 *   active in workspace scope.
 * - Install adds the skill to the current scope and confirms via Toast;
 *   enable Switches persist optimistically with a "Saved" Toast.
 * - Uninstall is two-step: MoreMenu item first, then a destructive
 *   AlertDialog that must be explicitly confirmed.
 * - A warning Banner atop the Installed tab flags a skill an admin turned
 *   off; its row's Switch is disabled until an admin re-enables it.
 *
 * Responsive contract:
 * - Content column: max-width 960px, centered; fills the viewport width
 *   below that with LayoutContent's own padding.
 * - Header: the heading and scope controls share one wrapping row
 *   (wrap="wrap"), so the SegmentedControl + Selector drop below the
 *   title on narrow viewports; the TabList always sits on its own row.
 * - Discover: the search input flexes while the category Selector keeps
 *   its width (the toolbar wraps when cramped); the card Grid is
 *   columns={{minWidth: 320, max: 2}} — 2-up on wide viewports, 1-up
 *   when narrow.
 * - Installed/Published rows: string descriptions truncate to one line
 *   (ListItem default); Switch + MoreMenu / Edit actions stay pinned to
 *   the row end at every width.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Switch} from '@astryxdesign/core/Switch';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {
  ArrowPathIcon,
  BellAlertIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  HashtagIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const styles: Record<string, CSSProperties> = {
  // Settings surfaces read best as a centered column, not full-bleed.
  content: {
    width: '100%',
    maxWidth: 960,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // Fixed square so skill glyphs align across cards and rows.
  iconTile: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
};

type ScopeId = 'personal' | 'workspace';
type TabId = 'discover' | 'installed' | 'published';
type CategoryId =
  | 'engineering'
  | 'data'
  | 'productivity'
  | 'support'
  | 'operations';
type SkillIcon = typeof InboxIcon;

interface CatalogSkill {
  slug: string;
  name: string;
  description: string;
  author: string;
  category: CategoryId;
  /** Preformatted so fixture rendering stays locale-independent. */
  installsLabel: string;
  version: string;
  icon: SkillIcon;
}

interface InstalledEntry {
  slug: string;
  scope: ScopeId;
  enabled: boolean;
  /** Locked off by a workspace admin; the row's Switch is disabled. */
  isAdminDisabled?: boolean;
}

interface PublishedSkill {
  slug: string;
  name: string;
  description: string;
  status: 'live' | 'draft';
  version: string;
  installsLabel: string;
  updated: string;
  icon: SkillIcon;
}

const WORKSPACE_OPTIONS = [
  {value: 'acme', label: 'Acme Robotics'},
  {value: 'northwind', label: 'Northwind Labs'},
];

const CATEGORY_OPTIONS = [
  {value: 'all', label: 'All categories'},
  {value: 'engineering', label: 'Engineering'},
  {value: 'data', label: 'Data'},
  {value: 'productivity', label: 'Productivity'},
  {value: 'support', label: 'Support'},
  {value: 'operations', label: 'Operations'},
];

const CATEGORY_BADGE: Record<CategoryId, {label: string; variant: BadgeVariant}> = {
  engineering: {label: 'Engineering', variant: 'blue'},
  data: {label: 'Data', variant: 'orange'},
  productivity: {label: 'Productivity', variant: 'green'},
  support: {label: 'Support', variant: 'teal'},
  operations: {label: 'Operations', variant: 'pink'},
};

const PUBLISHED_STATUS_OPTIONS = [
  {value: 'all', label: 'All statuses'},
  {value: 'live', label: 'Live'},
  {value: 'draft', label: 'Draft'},
  // Zero archived skills in the fixture — selecting this reveals the
  // Published tab's EmptyState variant.
  {value: 'archived', label: 'Archived'},
];

// Marketplace catalog, sorted by install count (most popular first).
const CATALOG: CatalogSkill[] = [
  {
    slug: 'code-review-companion',
    name: 'Code Review Companion',
    description:
      'Reviews open pull requests, flags risky diffs, and drafts inline comments for you to approve.',
    author: 'Lena Fischer',
    category: 'engineering',
    installsLabel: '4,812',
    version: '2.4.1',
    icon: PencilSquareIcon,
  },
  {
    slug: 'sql-runner',
    name: 'SQL Runner',
    description:
      'Runs read-only queries against the analytics warehouse and returns result tables inline.',
    author: 'Marcus Osei',
    category: 'data',
    installsLabel: '3,241',
    version: '1.8.0',
    icon: HashtagIcon,
  },
  {
    slug: 'calendar-sync',
    name: 'Calendar Sync',
    description:
      'Mirrors events across personal and workspace calendars and resolves double-bookings.',
    author: 'Ana Duarte',
    category: 'productivity',
    installsLabel: '2,907',
    version: '0.9.3',
    icon: ArrowPathIcon,
  },
  {
    slug: 'standup-summarizer',
    name: 'Standup Summarizer',
    description:
      'Collects yesterday’s updates from linked channels and posts a morning digest.',
    author: 'Tessa Brook',
    category: 'productivity',
    installsLabel: '2,104',
    version: '1.2.0',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    slug: 'release-notes-drafter',
    name: 'Release Notes Drafter',
    description:
      'Turns merged pull requests into a draft changelog grouped by feature area.',
    author: 'Iris Kwon',
    category: 'engineering',
    installsLabel: '1,663',
    version: '1.0.4',
    icon: BookmarkIcon,
  },
  {
    slug: 'ticket-triage',
    name: 'Ticket Triage',
    description:
      'Labels incoming support tickets, sets priority, and routes them to the right queue.',
    author: 'Sam Whitaker',
    category: 'support',
    installsLabel: '1,318',
    version: '3.0.2',
    icon: InboxIcon,
  },
  {
    slug: 'meeting-notetaker',
    name: 'Meeting Notetaker',
    description:
      'Joins scheduled calls, captures decisions and action items, and files notes to the workspace.',
    author: 'Noor Haddad',
    category: 'productivity',
    installsLabel: '987',
    version: '2.1.0',
    icon: UserGroupIcon,
  },
  {
    slug: 'oncall-escalator',
    name: 'On-call Escalator',
    description:
      'Watches alert channels and pages the on-call engineer when incidents go unacknowledged.',
    author: 'Diego Ramos',
    category: 'operations',
    installsLabel: '742',
    version: '1.5.2',
    icon: BellAlertIcon,
  },
];

const CATALOG_BY_SLUG = new Map(CATALOG.map(skill => [skill.slug, skill]));

// Fixed mid-flight install so the Discover grid always demonstrates the
// "Installing…" state without timers or randomness.
const INSTALLING_SLUG = 'release-notes-drafter';

// 5 seeded installs: 3 workspace-scoped, 2 personal. Ticket Triage was
// force-disabled by an admin — it drives the Installed tab's Banner.
const INSTALLED_SEED: InstalledEntry[] = [
  {slug: 'code-review-companion', scope: 'workspace', enabled: true},
  {slug: 'sql-runner', scope: 'workspace', enabled: true},
  {
    slug: 'ticket-triage',
    scope: 'workspace',
    enabled: false,
    isAdminDisabled: true,
  },
  {slug: 'calendar-sync', scope: 'personal', enabled: true},
  {slug: 'standup-summarizer', scope: 'personal', enabled: false},
];

const PUBLISHED: PublishedSkill[] = [
  {
    slug: 'query-cost-guard',
    name: 'Query Cost Guard',
    description:
      'Estimates warehouse cost before a query runs and blocks anything over budget.',
    status: 'live',
    version: '1.1.0',
    installsLabel: '236',
    updated: 'Jun 27',
    icon: HashtagIcon,
  },
  {
    slug: 'sprint-retro-bot',
    name: 'Sprint Retro Bot',
    description:
      'Drafts a retro agenda from sprint stats and collects anonymous feedback ahead of the meeting.',
    status: 'draft',
    version: '0.4.0',
    installsLabel: '0',
    updated: 'Jun 18',
    icon: ChatBubbleLeftRightIcon,
  },
];

function SkillGlyph({icon}: {icon: SkillIcon}) {
  return (
    <div style={styles.iconTile}>
      <Icon icon={icon} size="md" />
    </div>
  );
}

function DiscoverCard({
  skill,
  installState,
  onInstall,
}: {
  skill: CatalogSkill;
  installState: 'available' | 'installing' | 'installed';
  onInstall: (slug: string) => void;
}) {
  const categoryBadge = CATEGORY_BADGE[skill.category];
  return (
    // ClickableCard's accessible trigger is a hidden sibling of the
    // content, so the nested Install Button stays independently clickable.
    <ClickableCard label={skill.name} href="#" width="100%" padding={4}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="start">
          <SkillGlyph icon={skill.icon} />
          <StackItem size="fill">
            <VStack gap={1}>
              <Text type="label">{skill.name}</Text>
              <HStack gap={1} vAlign="center">
                <Avatar name={skill.author} size="xsmall" />
                <Text type="supporting" color="secondary">
                  {skill.author}
                </Text>
              </HStack>
            </VStack>
          </StackItem>
          <Badge label={`${skill.installsLabel} installs`} />
        </HStack>
        <Text type="supporting" color="secondary" maxLines={2}>
          {skill.description}
        </Text>
        <HStack gap={2} vAlign="center">
          <Badge label={categoryBadge.label} variant={categoryBadge.variant} />
          <StackItem size="fill" />
          {installState === 'installing' ? (
            <Button
              label="Installing…"
              size="sm"
              variant="secondary"
              isDisabled
              icon={<Spinner size="sm" shade="inherit" />}
            />
          ) : installState === 'installed' ? (
            <Badge variant="success" label="Installed" />
          ) : (
            <Button
              label="Install"
              size="sm"
              variant="primary"
              onClick={() => onInstall(skill.slug)}
            />
          )}
        </HStack>
      </VStack>
    </ClickableCard>
  );
}

export default function SettingsExtensionCatalogTemplate() {
  const toast = useToast();
  const [tab, setTab] = useState<TabId>('discover');
  const [scope, setScope] = useState<ScopeId>('workspace');
  const [workspace, setWorkspace] = useState('acme');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [installed, setInstalled] = useState<InstalledEntry[]>(INSTALLED_SEED);
  const [uninstallSlug, setUninstallSlug] = useState<string | null>(null);
  const [publishedFilter, setPublishedFilter] = useState('all');
  const [isAdminBannerVisible, setIsAdminBannerVisible] = useState(true);

  const workspaceName =
    WORKSPACE_OPTIONS.find(option => option.value === workspace)?.label ??
    'Workspace';
  const scopeLabel = scope === 'personal' ? 'Personal' : workspaceName;

  // Which catalog skills are installed in the *current* scope — flipping
  // the scope toggle changes which Discover cards read as installed.
  const installedInScope = useMemo(
    () =>
      new Set(
        installed.filter(entry => entry.scope === scope).map(e => e.slug),
      ),
    [installed, scope],
  );

  const discoverResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return CATALOG.filter(skill => {
      if (category !== 'all' && skill.category !== category) {
        return false;
      }
      return (
        needle === '' ||
        skill.name.toLowerCase().includes(needle) ||
        skill.description.toLowerCase().includes(needle)
      );
    });
  }, [query, category]);

  const scopedInstalled = useMemo(
    () => installed.filter(entry => entry.scope === scope),
    [installed, scope],
  );

  const adminDisabledEntry = scopedInstalled.find(
    entry => entry.isAdminDisabled,
  );

  const publishedResults = useMemo(
    () =>
      PUBLISHED.filter(
        item => publishedFilter === 'all' || item.status === publishedFilter,
      ),
    [publishedFilter],
  );

  const pendingUninstall =
    uninstallSlug !== null ? CATALOG_BY_SLUG.get(uninstallSlug) : undefined;

  const handleInstall = (slug: string) => {
    const skill = CATALOG_BY_SLUG.get(slug);
    if (!skill || installedInScope.has(slug)) {
      return;
    }
    setInstalled(prev => [...prev, {slug, scope, enabled: true}]);
    toast({body: `Installed ${skill.name} to ${scopeLabel}`});
  };

  const handleToggle = (slug: string, enabled: boolean) => {
    setInstalled(prev =>
      prev.map(entry =>
        entry.slug === slug && entry.scope === scope
          ? {...entry, enabled}
          : entry,
      ),
    );
    // uniqueID collapses rapid toggles into a single "Saved" toast.
    toast({body: 'Saved', uniqueID: 'extension-settings-saved'});
  };

  const confirmUninstall = () => {
    if (!pendingUninstall) {
      return;
    }
    setInstalled(prev =>
      prev.filter(
        entry => !(entry.slug === pendingUninstall.slug && entry.scope === scope),
      ),
    );
    setUninstallSlug(null);
    toast({body: `Uninstalled ${pendingUninstall.name}`});
  };

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <VStack gap={3}>
              <HStack gap={3} vAlign="center" wrap="wrap">
                <StackItem size="fill">
                  <VStack gap={1}>
                    <Heading level={1}>Extensions</Heading>
                    <Text type="supporting" color="secondary">
                      Install and manage the skills your assistant can use.
                    </Text>
                  </VStack>
                </StackItem>
                <SegmentedControl
                  label="Scope"
                  value={scope}
                  onChange={value => setScope(value as ScopeId)}
                  size="sm">
                  <SegmentedControlItem label="Personal" value="personal" />
                  <SegmentedControlItem label="Workspace" value="workspace" />
                </SegmentedControl>
                <Selector
                  label="Workspace"
                  isLabelHidden
                  size="sm"
                  options={WORKSPACE_OPTIONS}
                  value={workspace}
                  onChange={setWorkspace}
                  isDisabled={scope === 'personal'}
                />
              </HStack>
              <TabList value={tab} onChange={value => setTab(value as TabId)}>
                <Tab value="discover" label="Discover" />
                <Tab
                  value="installed"
                  label="Installed"
                  endContent={<Badge label={String(installed.length)} />}
                />
                <Tab
                  value="published"
                  label="Published"
                  endContent={<Badge label={String(PUBLISHED.length)} />}
                />
              </TabList>
            </VStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <div style={styles.content}>
              {tab === 'discover' && (
                <VStack gap={4}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <StackItem size="fill">
                      <TextInput
                        label="Search skills"
                        isLabelHidden
                        placeholder="Search skills…"
                        startIcon={<Icon icon={MagnifyingGlassIcon} size="sm" />}
                        value={query}
                        onChange={setQuery}
                      />
                    </StackItem>
                    <Selector
                      label="Category"
                      isLabelHidden
                      options={CATEGORY_OPTIONS}
                      value={category}
                      onChange={setCategory}
                    />
                  </HStack>
                  {discoverResults.length === 0 ? (
                    <EmptyState
                      icon={<Icon icon={MagnifyingGlassIcon} size="lg" />}
                      title="No skills found"
                      description="Try a different search term or category."
                      actions={
                        <Button
                          label="Clear filters"
                          variant="secondary"
                          onClick={() => {
                            setQuery('');
                            setCategory('all');
                          }}
                        />
                      }
                    />
                  ) : (
                    <Grid columns={{minWidth: 320, max: 2}} gap={3}>
                      {discoverResults.map(skill => (
                        <DiscoverCard
                          key={skill.slug}
                          skill={skill}
                          installState={
                            skill.slug === INSTALLING_SLUG
                              ? 'installing'
                              : installedInScope.has(skill.slug)
                                ? 'installed'
                                : 'available'
                          }
                          onInstall={handleInstall}
                        />
                      ))}
                    </Grid>
                  )}
                </VStack>
              )}

              {tab === 'installed' && (
                <VStack gap={4}>
                  {adminDisabledEntry && isAdminBannerVisible && (
                    <Banner
                      status="warning"
                      title="A skill was disabled by an admin"
                      description={`${
                        CATALOG_BY_SLUG.get(adminDisabledEntry.slug)?.name ??
                        'A skill'
                      } was turned off for ${workspaceName} by Priya Shah on Jun 24. Ask a workspace admin to re-enable it.`}
                      isDismissable
                      onDismiss={() => setIsAdminBannerVisible(false)}
                    />
                  )}
                  {scopedInstalled.length === 0 ? (
                    <EmptyState
                      icon={<Icon icon={InboxIcon} size="lg" />}
                      title="Nothing installed here"
                      description={`No skills are installed in your ${scopeLabel} scope yet.`}
                      actions={
                        <Button
                          label="Browse the catalog"
                          variant="primary"
                          onClick={() => setTab('discover')}
                        />
                      }
                    />
                  ) : (
                    <List hasDividers>
                      {scopedInstalled.map(entry => {
                        const skill = CATALOG_BY_SLUG.get(entry.slug);
                        if (!skill) {
                          return null;
                        }
                        return (
                          <ListItem
                            key={entry.slug}
                            startContent={<SkillGlyph icon={skill.icon} />}
                            label={
                              <HStack gap={2} vAlign="center">
                                <Text type="label">{skill.name}</Text>
                                <Badge label={`v${skill.version}`} />
                                <Badge
                                  label={
                                    entry.scope === 'personal'
                                      ? 'Personal'
                                      : 'Workspace'
                                  }
                                  variant={
                                    entry.scope === 'personal'
                                      ? 'purple'
                                      : 'blue'
                                  }
                                />
                              </HStack>
                            }
                            description={
                              entry.isAdminDisabled
                                ? 'Disabled by a workspace admin on Jun 24 — contact an admin to re-enable.'
                                : skill.description
                            }
                            endContent={
                              <HStack gap={2} vAlign="center">
                                <Switch
                                  label={`Enable ${skill.name}`}
                                  isLabelHidden
                                  value={entry.enabled}
                                  isDisabled={entry.isAdminDisabled}
                                  onChange={checked =>
                                    handleToggle(entry.slug, checked)
                                  }
                                />
                                <MoreMenu
                                  label={`${skill.name} options`}
                                  size="sm"
                                  items={[
                                    {label: 'Configure', icon: Cog6ToothIcon},
                                    {label: 'View source'},
                                    {type: 'divider'},
                                    {
                                      label: 'Uninstall',
                                      onClick: () =>
                                        setUninstallSlug(entry.slug),
                                    },
                                  ]}
                                />
                              </HStack>
                            }
                          />
                        );
                      })}
                    </List>
                  )}
                </VStack>
              )}

              {tab === 'published' && (
                <VStack gap={4}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <StackItem size="fill">
                      <Text type="supporting" color="secondary">
                        Skills you have published to the {workspaceName}{' '}
                        marketplace.
                      </Text>
                    </StackItem>
                    <Selector
                      label="Status"
                      isLabelHidden
                      size="sm"
                      options={PUBLISHED_STATUS_OPTIONS}
                      value={publishedFilter}
                      onChange={setPublishedFilter}
                    />
                    <Button
                      label="New skill"
                      size="sm"
                      icon={<Icon icon={PlusIcon} size="sm" />}
                    />
                  </HStack>
                  {publishedResults.length === 0 ? (
                    <EmptyState
                      icon={<Icon icon={BookmarkIcon} size="lg" />}
                      title="No archived skills"
                      description="Skills you retire from the marketplace will land here."
                      actions={
                        <Button
                          label="Show all statuses"
                          variant="secondary"
                          onClick={() => setPublishedFilter('all')}
                        />
                      }
                    />
                  ) : (
                    <List hasDividers>
                      {publishedResults.map(item => (
                        <ListItem
                          key={item.slug}
                          startContent={<SkillGlyph icon={item.icon} />}
                          label={
                            <HStack gap={2} vAlign="center">
                              <Text type="label">{item.name}</Text>
                              <Badge
                                label={item.status === 'live' ? 'Live' : 'Draft'}
                                variant={
                                  item.status === 'live'
                                    ? 'success'
                                    : 'neutral'
                                }
                              />
                              <Badge label={`v${item.version}`} />
                            </HStack>
                          }
                          description={item.description}
                          endContent={
                            <HStack gap={3} vAlign="center">
                              <Text
                                type="supporting"
                                color="secondary"
                                hasTabularNumbers>
                                {item.installsLabel} installs
                              </Text>
                              <Text type="supporting" color="secondary">
                                Updated {item.updated}
                              </Text>
                              <Button
                                label="Edit"
                                size="sm"
                                variant="secondary"
                                icon={
                                  <Icon icon={PencilSquareIcon} size="sm" />
                                }
                              />
                            </HStack>
                          }
                        />
                      ))}
                    </List>
                  )}
                </VStack>
              )}
            </div>
          </LayoutContent>
        }
      />
      <AlertDialog
        isOpen={uninstallSlug !== null}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setUninstallSlug(null);
          }
        }}
        title={`Uninstall ${pendingUninstall?.name ?? 'skill'}?`}
        description={`This removes ${
          pendingUninstall?.name ?? 'the skill'
        } and its saved configuration from your ${scopeLabel} scope. Past conversations keep their history.`}
        cancelLabel="Keep skill"
        actionLabel="Uninstall"
        onAction={confirmUninstall}
      />
    </>
  );
}
