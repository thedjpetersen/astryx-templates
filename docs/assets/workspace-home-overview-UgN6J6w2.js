var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (workspace identity + members, a dated
 *   morning briefing with bullet highlights, 8 newsfeed activity rows, 5
 *   pinned resources, 4 widget stats with a fixed-point token sparkline,
 *   and 6 recent-session rows covering every status)
 * @output Workspace home surface behind the assistant landing: header with
 *   workspace icon tile, name + mono hashtag, member AvatarGroup, and a
 *   layout-preference SegmentedControl (Overview / Recent sessions).
 *   Overview mode renders a 4-up WIDGETS stat grid (open sessions,
 *   scheduled-job next run, nodes online, weekly-token sparkline drawn as
 *   an inline SVG polyline), then a two-column body: BRIEFING card (dated
 *   digest paragraph + 3 bullet highlights + "Generated 7:00 AM" caption)
 *   above a NEWSFEED activity column with a "Show 3 more" expander, and a
 *   RESOURCES rail of pinned-link ClickableCards. Recent-sessions mode
 *   swaps in a clean launchpad list of 6 session rows (status dot, title,
 *   participant avatars, relative time).
 * @position Page template; emitted by \`astryx template workspace-home-overview\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the workspace identity
 * and the mode SegmentedControl; LayoutContent hosts a centered column
 * (maxWidth 1080). No chat surface here — this is the "what happened while
 * you were away" hub you land on before opening a session; pick
 * ai-chat-workspace-landing when the composer should be the centerpiece.
 *
 * Responsive contract:
 * - The demo stage never fires viewport media queries, so the page
 *   measures its own width with a ResizeObserver (useElementWidth);
 *   isCompact = width <= 880.
 * - >880px: widgets grid sits above a two-column body — briefing +
 *   newsfeed fill left, a 300px resources rail on the right; the header
 *   shows the mono hashtag and member count.
 * - <=880px: the body folds to a single column (briefing, newsfeed,
 *   resources); the header drops the hashtag + member-count caption and
 *   keeps the AvatarGroup. The widgets Grid reflows on its own via
 *   columns minWidth.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {
  AvatarGroup,
  AvatarGroupOverflow,
} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  ActivityIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  ChartColumnIcon,
  FileTextIcon,
  LayersIcon,
  LifeBuoyIcon,
  MessageSquareIcon,
  PlusIcon,
  ServerIcon,
  SparklesIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {height: '100%'},
  column: {
    maxWidth: 1080,
    marginInline: 'auto',
  },
  // Header workspace icon tile: accent-tinted rounded square.
  workspaceTile: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-accent-muted)',
    color: 'var(--color-accent)',
  },
  // 11px uppercase tracking-wide section eyebrow.
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // Two-column body (>880px); folds to a single column when compact.
  bodyColumns: {
    display: 'flex',
    gap: 'var(--spacing-5)',
    alignItems: 'flex-start',
  },
  bodyColumnsCompact: {flexDirection: 'column'},
  mainColumn: {flex: 1, minWidth: 0},
  resourcesRail: {width: 300, flexShrink: 0},
  resourcesRailCompact: {width: '100%'},
  // Widget stat cards.
  statNumber: {
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  sparklineWrap: {width: '100%'},
  sparklineSvg: {display: 'block', width: '100%', height: 36},
  // Briefing bullets: fixed marker + text on one baseline.
  bulletRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'baseline',
  },
  bulletMark: {color: 'var(--color-accent)', flexShrink: 0},
  // Newsfeed prose line: mixed-weight spans on one wrapping line.
  feedLine: {
    fontSize: 13,
    lineHeight: 1.45,
    minWidth: 0,
    color: 'var(--color-text-secondary)',
  },
  feedActor: {fontWeight: 600, color: 'var(--color-text-primary)'},
  feedObject: {fontWeight: 500, color: 'var(--color-text-primary)'},
  feedRow: {paddingBlock: 'var(--spacing-2)'},
  // Resource rows: muted icon tile shaped like a favicon.
  resourceTile: {
    width: 28,
    height: 28,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-control)',
    backgroundColor: 'var(--color-background-muted)',
  },
  resourceBody: {minWidth: 0},
  sessionTitleCell: {minWidth: 0},
};

// ============= DATA =============
// Deterministic fixtures: fixed strings, no clocks, no randomness.
// "Now" for this surface is Mon 2026-07-13, 9:40 AM.

const WORKSPACE_NAME = 'Meridian Platform';
const WORKSPACE_HASHTAG = '#meridian-platform';
const ASSISTANT_NAME = 'Relay Copilot';

const MEMBERS = [
  'Priya Natarajan',
  'Jonas Weiss',
  'Amara Diallo',
  'Felix Okafor',
  'Ines Castellanos',
  'Theo Lindqvist',
  'Mei-Ling Zhou',
];

const BRIEFING = {
  dateline: 'Monday, July 13, 2026',
  digest:
    'Quiet weekend for Meridian Platform: the nightly digest ran clean both ' +
    'nights and the payments-retry audit wrapped without follow-ups. One ' +
    'thing needs eyes this morning — the staging-secrets rotation session ' +
    'failed on Sunday and has been waiting 14 hours for a rerun.',
  highlights: [
    'staging-secrets rotation failed Sunday 7:32 PM — rerun before the Tuesday deploy window',
    'payments-retry backoff audit completed; summary posted to TeamChat #meridian-eng',
    'Token spend is pacing 18% above last week, driven by the gateway-log triage session',
  ],
  caption: 'Generated 7:00 AM · refreshes daily',
};

interface FeedItem {
  id: string;
  actor: string;
  action: string;
  object: string;
  time: string;
}

// 5 rows visible, 3 more behind the expander.
const FEED_ITEMS: FeedItem[] = [
  {
    id: 'fd-1',
    actor: 'Priya Natarajan',
    action: 'completed session',
    object: 'payments-retry backoff audit',
    time: '25 min ago',
  },
  {
    id: 'fd-2',
    actor: ASSISTANT_NAME,
    action: 'flagged a failed run of',
    object: 'staging-secrets rotation',
    time: '1 hour ago',
  },
  {
    id: 'fd-3',
    actor: 'Jonas Weiss',
    action: 'forked',
    object: 'gateway-log triage → error-budget deep dive',
    time: '3 hours ago',
  },
  {
    id: 'fd-4',
    actor: 'Amara Diallo',
    action: 'pinned resource',
    object: 'Release runbook',
    time: '7 hours ago',
  },
  {
    id: 'fd-5',
    actor: 'scheduler',
    action: 'ran',
    object: 'nightly-digest · delivered to 7 members',
    time: '9 hours ago',
  },
  {
    id: 'fd-6',
    actor: 'Felix Okafor',
    action: 'connected node',
    object: 'cli:devbox-04',
    time: 'Yesterday',
  },
  {
    id: 'fd-7',
    actor: 'Ines Castellanos',
    action: 'archived session',
    object: 'Q2 latency retro prep',
    time: 'Yesterday',
  },
  {
    id: 'fd-8',
    actor: 'Theo Lindqvist',
    action: 'joined workspace via invite from',
    object: 'Priya Natarajan',
    time: '2 days ago',
  },
];

const FEED_VISIBLE_COUNT = 5;

interface Resource {
  id: string;
  icon: typeof BookOpenIcon;
  name: string;
  description: string;
  domain: string;
}

const RESOURCES: Resource[] = [
  {
    id: 'rs-1',
    icon: BookOpenIcon,
    name: 'Release runbook',
    description: 'Cut, verify, and roll back a platform release',
    domain: 'runbooks.meridian.dev',
  },
  {
    id: 'rs-2',
    icon: ChartColumnIcon,
    name: 'Service health dashboard',
    description: 'Golden signals for gateway, payments, and auth',
    domain: 'grafviews.meridian.dev',
  },
  {
    id: 'rs-3',
    icon: CalendarDaysIcon,
    name: 'On-call rota',
    description: 'Primary + shadow rotation, swaps, escalation order',
    domain: 'rota.meridian.dev',
  },
  {
    id: 'rs-4',
    icon: FileTextIcon,
    name: 'API style guide',
    description: 'Naming, pagination, and error-shape conventions',
    domain: 'docs.meridian.dev',
  },
  {
    id: 'rs-5',
    icon: LifeBuoyIcon,
    name: 'Incident postmortems',
    description: 'Blameless writeups, indexed by service and quarter',
    domain: 'postmortems.meridian.dev',
  },
];

// Weekly token sparkline: 7 fixed points (Mon..Sun), viewBox 0 0 120 36.
const SPARKLINE_POINTS = '0,22 20,27 40,17 60,11 80,15 100,5 120,12';

type SessionStatus = 'running' | 'review' | 'complete' | 'failed' | 'archived';

const SESSION_STATUS: Record<
  SessionStatus,
  {variant: 'accent' | 'warning' | 'success' | 'error' | 'neutral'; label: string}
> = {
  running: {variant: 'accent', label: 'Running'},
  review: {variant: 'warning', label: 'Needs review'},
  complete: {variant: 'success', label: 'Complete'},
  failed: {variant: 'error', label: 'Failed'},
  archived: {variant: 'neutral', label: 'Archived'},
};

interface SessionRow {
  id: string;
  title: string;
  status: SessionStatus;
  participants: string[];
  time: string;
  isViewOnly?: boolean;
}

const RECENT_SESSIONS: SessionRow[] = [
  {
    id: 'ss-1',
    title: 'gateway-log triage — 5xx spike after edge rollout',
    status: 'running',
    participants: ['Jonas Weiss', 'Relay Copilot'],
    time: '12 min ago',
  },
  {
    id: 'ss-2',
    title: 'staging-secrets rotation',
    status: 'failed',
    participants: ['Amara Diallo'],
    time: '14 hours ago',
  },
  {
    id: 'ss-3',
    title: 'payments-retry backoff audit',
    status: 'complete',
    participants: ['Priya Natarajan', 'Felix Okafor'],
    time: '25 min ago',
  },
  {
    id: 'ss-4',
    title: 'error-budget deep dive (fork)',
    status: 'review',
    participants: ['Jonas Weiss', 'Ines Castellanos', 'Theo Lindqvist'],
    time: '3 hours ago',
  },
  {
    id: 'ss-5',
    title: 'onboarding checklist refresh for July hires',
    status: 'complete',
    participants: ['Mei-Ling Zhou'],
    time: 'Yesterday',
    isViewOnly: true,
  },
  {
    id: 'ss-6',
    title: 'Q2 latency retro prep',
    status: 'archived',
    participants: ['Ines Castellanos'],
    time: '2 days ago',
  },
];

// ============= RESPONSIVE HELPER =============
// The demo stage is ~1045-1075px inside a 1440px window, so viewport
// media queries never fire — measure the page's own width instead.

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

// ============= WIDGETS =============

function StatCard({
  icon,
  eyebrow,
  value,
  caption,
  dot,
}: {
  icon: typeof ActivityIcon;
  eyebrow: string;
  value: string;
  caption: string;
  dot?: {variant: 'accent' | 'success' | 'warning'; label: string};
}) {
  return (
    <Card padding={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={icon} size="sm" color="secondary" />
          <span style={styles.eyebrow}>{eyebrow}</span>
        </HStack>
        <HStack gap={2} vAlign="center">
          <span style={styles.statNumber}>{value}</span>
          {dot != null && <StatusDot variant={dot.variant} label={dot.label} />}
        </HStack>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {caption}
        </Text>
      </VStack>
    </Card>
  );
}

function TokenSparklineCard() {
  return (
    <Card padding={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ActivityIcon} size="sm" color="secondary" />
          <span style={styles.eyebrow}>Weekly tokens</span>
        </HStack>
        <HStack gap={3} vAlign="center">
          <span style={styles.statNumber}>4.2M</span>
          <StackItem size="fill" style={styles.sparklineWrap}>
            <svg
              viewBox="0 0 120 36"
              preserveAspectRatio="none"
              style={styles.sparklineSvg}
              role="img"
              aria-label="Token usage over the last 7 days, trending up">
              <polyline
                points={SPARKLINE_POINTS}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx={120} cy={12} r={2.5} fill="var(--color-accent)" />
            </svg>
          </StackItem>
        </HStack>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          +18% vs last week · compaction saved 610K
        </Text>
      </VStack>
    </Card>
  );
}

// ============= OVERVIEW SECTIONS =============

function BriefingCard() {
  return (
    <Card padding={5}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={SparklesIcon} size="sm" color="secondary" />
          <span style={styles.eyebrow}>Briefing</span>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary">
            {BRIEFING.dateline}
          </Text>
        </HStack>
        <Text>{BRIEFING.digest}</Text>
        <VStack gap={2}>
          {BRIEFING.highlights.map(highlight => (
            <div key={highlight} style={styles.bulletRow}>
              <span style={styles.bulletMark} aria-hidden>
                •
              </span>
              <Text type="supporting">{highlight}</Text>
            </div>
          ))}
        </VStack>
        <Text type="supporting" color="secondary">
          {BRIEFING.caption}
        </Text>
      </VStack>
    </Card>
  );
}

function FeedRow({item}: {item: FeedItem}) {
  return (
    <HStack gap={3} vAlign="center" style={styles.feedRow}>
      <Avatar name={item.actor} size="xsmall" />
      <StackItem size="fill" style={styles.resourceBody}>
        <div style={styles.feedLine}>
          <span style={styles.feedActor}>{item.actor}</span>{' '}
          <span>{item.action}</span>{' '}
          <span style={styles.feedObject}>{item.object}</span>
        </div>
      </StackItem>
      <Text type="supporting" color="secondary">
        {item.time}
      </Text>
    </HStack>
  );
}

function NewsfeedCard() {
  const [isShowingAll, setIsShowingAll] = useState(false);
  const visible = isShowingAll
    ? FEED_ITEMS
    : FEED_ITEMS.slice(0, FEED_VISIBLE_COUNT);
  const hiddenCount = FEED_ITEMS.length - FEED_VISIBLE_COUNT;
  const lastIndex = visible.length - 1;

  return (
    <Card padding={5}>
      <VStack gap={2}>
        <span style={styles.eyebrow}>Newsfeed</span>
        <VStack gap={0}>
          {visible.map((item, index) => (
            <VStack key={item.id} gap={0}>
              <FeedRow item={item} />
              {index < lastIndex && <Divider />}
            </VStack>
          ))}
        </VStack>
        <HStack gap={2}>
          <Button
            label={
              isShowingAll ? 'Show fewer' : \`Show \${hiddenCount} more\`
            }
            variant="ghost"
            size="sm"
            onClick={() => setIsShowingAll(prev => !prev)}
          />
        </HStack>
      </VStack>
    </Card>
  );
}

function ResourceCard({resource}: {resource: Resource}) {
  return (
    <ClickableCard
      label={\`Open \${resource.name}\`}
      padding={3}
      onClick={() => {}}>
      <HStack gap={3} vAlign="center">
        <div style={styles.resourceTile}>
          <Icon icon={resource.icon} size="sm" color="secondary" />
        </div>
        <StackItem size="fill" style={styles.resourceBody}>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {resource.name}
            </Text>
            <Text type="supporting" color="secondary" maxLines={2}>
              {resource.description}
            </Text>
            <Text type="code" size="sm" color="secondary" maxLines={1}>
              {resource.domain}
            </Text>
          </VStack>
        </StackItem>
        <Icon icon={ArrowUpRightIcon} size="sm" color="secondary" />
      </HStack>
    </ClickableCard>
  );
}

// ============= RECENT SESSIONS MODE =============

function SessionRowCard({session}: {session: SessionRow}) {
  const status = SESSION_STATUS[session.status];
  return (
    <ClickableCard
      label={\`Open session: \${session.title}\`}
      padding={3}
      onClick={() => {}}>
      <HStack gap={3} vAlign="center">
        <StatusDot variant={status.variant} label={status.label} />
        <StackItem size="fill" style={styles.sessionTitleCell}>
          <Text type="label" maxLines={1}>
            {session.title}
          </Text>
        </StackItem>
        {session.isViewOnly === true && (
          <Badge label="View only" variant="neutral" />
        )}
        {session.status === 'failed' && (
          <Badge label="Rerun needed" variant="error" />
        )}
        <AvatarGroup
          size="xsmall"
          aria-label={\`\${session.participants.length} participants\`}>
          {session.participants.slice(0, 3).map(name => (
            <Avatar key={name} name={name} />
          ))}
          {session.participants.length > 3 ? (
            <AvatarGroupOverflow count={session.participants.length - 3} />
          ) : null}
        </AvatarGroup>
        <Text type="supporting" color="secondary">
          {session.time}
        </Text>
      </HStack>
    </ClickableCard>
  );
}

// ============= PAGE =============

type HomeMode = 'overview' | 'sessions';

export default function WorkspaceHomeOverviewTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 880;

  const [mode, setMode] = useState<HomeMode>('overview');

  const overviewBody = (
    <VStack gap={5}>
      {/* WIDGETS: the Grid reflows on its own via columns minWidth. */}
      <Grid columns={{minWidth: 210, max: 4}} gap={4}>
        <StatCard
          icon={MessageSquareIcon}
          eyebrow="Open sessions"
          value="6"
          caption="2 running · 1 needs review"
          dot={{variant: 'accent', label: '2 sessions running'}}
        />
        <StatCard
          icon={CalendarClockIcon}
          eyebrow="Scheduled jobs"
          value="in 42 min"
          caption="nightly-digest · 4 jobs enabled"
        />
        <StatCard
          icon={ServerIcon}
          eyebrow="Nodes online"
          value="3 / 4"
          caption="cli:mac-studio locked by perf-triage"
          dot={{variant: 'success', label: '3 nodes online'}}
        />
        <TokenSparklineCard />
      </Grid>

      <div
        style={{
          ...styles.bodyColumns,
          ...(isCompact ? styles.bodyColumnsCompact : undefined),
        }}>
        <div style={styles.mainColumn}>
          <VStack gap={5}>
            <BriefingCard />
            <NewsfeedCard />
          </VStack>
        </div>
        <div
          style={{
            ...styles.resourcesRail,
            ...(isCompact ? styles.resourcesRailCompact : undefined),
          }}>
          <VStack gap={2}>
            <span style={styles.eyebrow}>Resources</span>
            {RESOURCES.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </VStack>
        </div>
      </div>
    </VStack>
  );

  const sessionsBody = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <span style={styles.eyebrow}>Recent sessions</span>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          6 sessions · 2 running
        </Text>
      </HStack>
      {RECENT_SESSIONS.map(session => (
        <SessionRowCard key={session.id} session={session} />
      ))}
    </VStack>
  );

  return (
    <div ref={wrapRef} style={styles.page}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <div style={styles.workspaceTile}>
                <Icon icon={LayersIcon} size="sm" color="inherit" />
              </div>
              <StackItem size="fill">
                <VStack gap={0}>
                  <Heading level={1}>{WORKSPACE_NAME}</Heading>
                  {!isCompact && (
                    <HStack gap={2} vAlign="center">
                      <Text type="code" size="sm" color="secondary">
                        {WORKSPACE_HASHTAG}
                      </Text>
                      <Text type="supporting" color="secondary">
                        · 7 members · {ASSISTANT_NAME} attached
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </StackItem>
              <AvatarGroup
                size="small"
                aria-label={\`\${MEMBERS.length} workspace members\`}>
                {MEMBERS.slice(0, 4).map(name => (
                  <Avatar key={name} name={name} />
                ))}
                <AvatarGroupOverflow count={MEMBERS.length - 4} />
              </AvatarGroup>
              <SegmentedControl
                label="Workspace home layout"
                size="sm"
                value={mode}
                onChange={value => setMode(value as HomeMode)}>
                <SegmentedControlItem value="overview" label="Overview" />
                <SegmentedControlItem value="sessions" label="Recent sessions" />
              </SegmentedControl>
              <Button
                label="New session"
                size="sm"
                icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
                onClick={() => {}}
              />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <div style={styles.column}>
              {mode === 'overview' ? overviewBody : sessionsBody}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};