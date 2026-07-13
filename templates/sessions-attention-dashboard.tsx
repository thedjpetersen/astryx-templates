// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (12 live agent sessions split across
 *   two attention buckets, workspace registry with Token colors, fixed
 *   waiting durations and activity lines, classification legend copy)
 * @output Two-bucket live sessions dashboard: LayoutHeader with "Sessions"
 *   Heading, derived running-count caption, and a workspace Selector that
 *   filters both buckets; side-by-side bucket sections with cheeky headers —
 *   "Inference Bound" (accent dot, "The agent is working") and "You're in
 *   the Way" (warning dot, "Waiting on your reply or review") — each a
 *   column of session Cards carrying title, workspace Token, mono node
 *   label, a state line (Spinner + running tool on inference-bound cards;
 *   amber waiting age on blocked cards), sub-agent count Badge, and
 *   Nudge / Open / Mark handled actions on waiting cards; a classification
 *   legend Collapsible at the bottom explains the split rules
 * @position Page template; emitted by `astryx template
 *   sessions-attention-dashboard`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (heading,
 * refresh caption, workspace Selector). LayoutContent scrolls the two
 * bucket columns plus the legend. No side panels — unlike
 * mission-control-kanban this surface answers one question only: which
 * sessions are blocked on YOU right now.
 *
 * Responsive contract:
 * - Page measures its own width with a ResizeObserver (useElementWidth) —
 *   the demo stage never fires viewport media queries.
 * - >720px: the two buckets sit side by side in a 2-column grid; the
 *   header shows the refresh caption inline.
 * - <=720px: buckets stack vertically ("You're in the Way" first, since
 *   it is actionable); the header caption drops the refresh suffix; card
 *   action buttons grow to 40px tap targets.
 * - Mark handled moves a waiting card into Inference Bound (state update
 *   with a deterministic resume activity line); Nudge flips to a disabled
 *   "Nudged" confirmation; Open is a no-op (it would leave the page).
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {CircleAlertIcon, HourglassIcon, ListChecksIcon} from 'lucide-react';

// ============= RESPONSIVE =============
// The demo stage renders ~1045-1075px inside a 1440px window, so viewport
// media queries never fire; measure the page's own width instead.

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

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  measureWrap: {height: '100%'},
  // Two bucket columns above 720px; single column stacked below.
  bucketGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  bucketGridCompact: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  nodeLabel: {minWidth: 0},
  cardTitleCell: {minWidth: 0},
  // Amber waiting line — TextColor has no warning tone, so tint inline.
  waitingLine: {color: 'var(--color-warning)'},
  legendCard: {marginTop: 'var(--spacing-4)'},
  legendBody: {paddingTop: 'var(--spacing-2)'},
  buttonTapTarget: {height: 40},
  emptyBucket: {
    border: 'var(--border-width) dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-4)',
    textAlign: 'center',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed durations and activity strings — no
// clocks, no randomness. The product moment is 2026-07-09 ~14:30.

const PRODUCT_NAME = 'Relay Deck';

type WorkspaceId = 'atlas' | 'comet' | 'personal';

const WORKSPACES: Record<
  WorkspaceId,
  {label: string; tokenColor: TokenColor}
> = {
  atlas: {label: 'Atlas', tokenColor: 'blue'},
  comet: {label: 'Comet', tokenColor: 'purple'},
  personal: {label: 'Personal', tokenColor: 'green'},
};

const WORKSPACE_OPTIONS = [
  {value: 'all', label: 'All Workspaces'},
  {value: 'atlas', label: 'Atlas'},
  {value: 'comet', label: 'Comet'},
  {value: 'personal', label: 'Personal'},
];

type Bucket = 'inference' | 'blocked';

interface Session {
  id: string;
  title: string;
  workspace: WorkspaceId;
  /** Mono node label: host + working directory. */
  node: string;
  bucket: Bucket;
  /** Inference-bound activity, e.g. "running bash — 2m". */
  activity?: string;
  /** Blocked state, e.g. waiting age + why the agent stopped. */
  waiting?: {age: string; reason: string};
  /** Activity line adopted when a waiting card is marked handled. */
  resumeActivity?: string;
  subAgents: number;
}

const INITIAL_SESSIONS: Session[] = [
  // --- Inference bound: the agent is working; nothing needed from you.
  {
    id: 's-01',
    title: 'Migrate billing webhooks to v3',
    workspace: 'atlas',
    node: 'devvm1204 ~/repos/atlas',
    bucket: 'inference',
    activity: 'running bash — 2m',
    subAgents: 2,
  },
  {
    id: 's-02',
    title: 'Chase the flaky checkout e2e',
    workspace: 'atlas',
    node: 'ci-runner-12 ~/repos/atlas',
    bucket: 'inference',
    activity: 'running playwright — 8m',
    subAgents: 3,
  },
  {
    id: 's-03',
    title: 'Backfill search embeddings',
    workspace: 'comet',
    node: 'gpu-worker-07 ~/jobs/embed',
    bucket: 'inference',
    activity: 'running ipython — 14m',
    subAgents: 0,
  },
  {
    id: 's-04',
    title: 'Refactor session token refresh',
    workspace: 'atlas',
    node: 'devvm0031 ~/repos/atlas',
    bucket: 'inference',
    activity: 'editing api/auth.ts — 40s',
    subAgents: 1,
  },
  {
    id: 's-05',
    title: 'Weekly dependency bump sweep',
    workspace: 'personal',
    node: 'mac-studio ~/dev/deps',
    bucket: 'inference',
    activity: 'running pnpm audit — 5m',
    subAgents: 0,
  },
  {
    id: 's-06',
    title: 'Draft Q3 infra cost memo',
    workspace: 'personal',
    node: 'mac-studio ~/notes',
    bucket: 'inference',
    activity: 'thinking — 1m',
    subAgents: 0,
  },
  // --- You're in the way: the agent stopped and is waiting on you.
  {
    id: 's-07',
    title: 'Prod deploy sign-off: relay-api',
    workspace: 'atlas',
    node: 'devvm1204 ~/repos/atlas',
    bucket: 'blocked',
    waiting: {age: '42m', reason: 'last message from agent'},
    resumeActivity: 'running deploy checks — just now',
    subAgents: 1,
  },
  {
    id: 's-08',
    title: 'Rename customer_id across schemas',
    workspace: 'atlas',
    node: 'devvm0088 ~/repos/atlas',
    bucket: 'blocked',
    waiting: {age: '12m', reason: 'agent asked a question'},
    resumeActivity: 'running migration dry-run — just now',
    subAgents: 0,
  },
  {
    id: 's-09',
    title: 'Rotate staging credentials',
    workspace: 'comet',
    node: 'ops-bastion ~/secure/rotation',
    bucket: 'blocked',
    waiting: {age: '55m', reason: 'approval required'},
    resumeActivity: 'rotating keys — just now',
    subAgents: 0,
  },
  {
    id: 's-10',
    title: 'Sunset legacy exports API',
    workspace: 'comet',
    node: 'devvm2210 ~/repos/comet',
    bucket: 'blocked',
    waiting: {age: '28m', reason: 'review requested on plan'},
    resumeActivity: 'editing exports/router.ts — just now',
    subAgents: 2,
  },
  {
    id: 's-11',
    title: 'Vendor security questionnaire',
    workspace: 'personal',
    node: 'mac-studio ~/docs/vendor',
    bucket: 'blocked',
    waiting: {age: '2h 5m', reason: 'last message from agent'},
    resumeActivity: 'drafting answers — just now',
    subAgents: 0,
  },
  {
    id: 's-12',
    title: 'Onboarding doc rewrite',
    workspace: 'personal',
    node: 'mac-studio ~/notes/onboarding',
    bucket: 'blocked',
    waiting: {age: '1h 10m', reason: 'draft ready for review'},
    resumeActivity: 'polishing draft — just now',
    subAgents: 0,
  },
];

const LEGEND_RULES: Array<{id: string; icon: typeof HourglassIcon; text: string}> = [
  {
    id: 'rule-1',
    icon: HourglassIcon,
    text:
      'Inference Bound — the model or a tool is actively executing. Your ' +
      'input is not blocking progress; checking in only slows it down.',
  },
  {
    id: 'rule-2',
    icon: CircleAlertIcon,
    text:
      "You're in the Way — the agent asked a question, requested a " +
      'review, or finished and is idle. Nothing happens until you reply.',
  },
  {
    id: 'rule-3',
    icon: ListChecksIcon,
    text:
      'Cards move left automatically when you reply in the session. Mark ' +
      'handled moves a card without replying — use it after you have ' +
      'resolved the ask elsewhere.',
  },
];

// ============= SESSION CARD =============

function SessionCard({
  session,
  isCompact,
  isNudged,
  onNudge,
  onMarkHandled,
}: {
  session: Session;
  isCompact: boolean;
  isNudged: boolean;
  onNudge: (id: string) => void;
  onMarkHandled: (id: string) => void;
}) {
  const workspace = WORKSPACES[session.workspace];
  const isBlocked = session.bucket === 'blocked';
  const tapTargetStyle = isCompact ? styles.buttonTapTarget : undefined;

  return (
    <Card padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={styles.cardTitleCell}>
            <Text type="label" maxLines={1}>
              {session.title}
            </Text>
          </StackItem>
          <Token
            label={workspace.label}
            size="sm"
            color={workspace.tokenColor}
          />
        </HStack>
        <div style={styles.nodeLabel}>
          <Text type="code" size="sm" color="secondary" maxLines={1}>
            {session.node}
          </Text>
        </div>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            {isBlocked && session.waiting != null ? (
              <HStack gap={2} vAlign="center">
                <Icon
                  icon={HourglassIcon}
                  size="sm"
                  style={styles.waitingLine}
                />
                <Text type="supporting" style={styles.waitingLine}>
                  waiting {session.waiting.age} — {session.waiting.reason}
                </Text>
              </HStack>
            ) : (
              <HStack gap={2} vAlign="center">
                <Spinner size="sm" aria-label={`${session.title} is working`} />
                <Text type="supporting" color="secondary">
                  {session.activity}
                </Text>
              </HStack>
            )}
          </StackItem>
          {session.subAgents > 0 && (
            <Badge
              label={`${session.subAgents} sub-agent${
                session.subAgents === 1 ? '' : 's'
              }`}
              variant="neutral"
            />
          )}
        </HStack>
        {isBlocked && (
          <HStack gap={2} vAlign="center">
            <Button
              label={isNudged ? 'Nudged' : 'Nudge'}
              variant="secondary"
              size="sm"
              isDisabled={isNudged}
              style={tapTargetStyle}
              onClick={() => onNudge(session.id)}
            />
            <Button
              label="Open"
              size="sm"
              style={tapTargetStyle}
              onClick={() => {}}
            />
            <StackItem size="fill" />
            <Button
              label="Mark handled"
              variant="ghost"
              size="sm"
              style={tapTargetStyle}
              onClick={() => onMarkHandled(session.id)}
            />
          </HStack>
        )}
      </VStack>
    </Card>
  );
}

// ============= BUCKET SECTION =============

function BucketSection({
  title,
  caption,
  dotVariant,
  dotLabel,
  count,
  emptyText,
  children,
}: {
  title: string;
  caption: string;
  dotVariant: 'accent' | 'warning';
  dotLabel: string;
  count: number;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <VStack gap={3}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StatusDot variant={dotVariant} label={dotLabel} isPulsing />
          <Heading level={2}>{title}</Heading>
          <Badge label={`${count}`} variant="neutral" />
        </HStack>
        <Text type="supporting" color="secondary">
          {caption}
        </Text>
      </VStack>
      {count === 0 ? (
        <div style={styles.emptyBucket}>
          <Text type="supporting" color="secondary">
            {emptyText}
          </Text>
        </div>
      ) : (
        children
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function SessionsAttentionDashboardTemplate() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;

  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [workspaceFilter, setWorkspaceFilter] = useState('all');
  const [nudgedIds, setNudgedIds] = useState<ReadonlyArray<string>>([]);

  const visible = sessions.filter(
    session =>
      workspaceFilter === 'all' || session.workspace === workspaceFilter,
  );
  const inferenceBound = visible.filter(
    session => session.bucket === 'inference',
  );
  const blocked = visible.filter(session => session.bucket === 'blocked');

  const nudge = (id: string) => {
    setNudgedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  // "Mark handled" reclassifies the card: the agent resumes, so the card
  // moves into Inference Bound with its deterministic resume activity.
  const markHandled = (id: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === id
          ? {
              ...session,
              bucket: 'inference' as const,
              activity: session.resumeActivity ?? 'resuming — just now',
              waiting: undefined,
            }
          : session,
      ),
    );
  };

  const inferenceSection = (
    <BucketSection
      title="Inference Bound"
      caption="The agent is working — nothing needed from you"
      dotVariant="accent"
      dotLabel="Agents working"
      count={inferenceBound.length}
      emptyText="No sessions running in this workspace.">
      <VStack gap={2}>
        {inferenceBound.map(session => (
          <SessionCard
            key={session.id}
            session={session}
            isCompact={isCompact}
            isNudged={nudgedIds.includes(session.id)}
            onNudge={nudge}
            onMarkHandled={markHandled}
          />
        ))}
      </VStack>
    </BucketSection>
  );

  const blockedSection = (
    <BucketSection
      title="You're in the Way"
      caption="Waiting on your reply or review"
      dotVariant="warning"
      dotLabel="Sessions waiting on you"
      count={blocked.length}
      emptyText="Nothing is waiting on you. Enjoy it while it lasts.">
      <VStack gap={2}>
        {blocked.map(session => (
          <SessionCard
            key={session.id}
            session={session}
            isCompact={isCompact}
            isNudged={nudgedIds.includes(session.id)}
            onNudge={nudge}
            onMarkHandled={markHandled}
          />
        ))}
      </VStack>
    </BucketSection>
  );

  return (
    <div ref={wrapRef} style={styles.measureWrap}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>Sessions</Heading>
                  <Text
                    type="supporting"
                    color="secondary"
                    hasTabularNumbers>
                    {visible.length} running
                    {isCompact ? '' : ' · refreshed 15s ago'}
                  </Text>
                </HStack>
              </StackItem>
              <Selector
                label="Workspace"
                isLabelHidden
                size="sm"
                options={WORKSPACE_OPTIONS}
                value={workspaceFilter}
                onChange={setWorkspaceFilter}
              />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <div
              style={isCompact ? styles.bucketGridCompact : styles.bucketGrid}>
              {/* Compact: the actionable bucket stacks first. */}
              {isCompact ? (
                <>
                  {blockedSection}
                  {inferenceSection}
                </>
              ) : (
                <>
                  {inferenceSection}
                  {blockedSection}
                </>
              )}
            </div>
            <div style={styles.legendCard}>
              <Card padding={3}>
                <Collapsible
                  defaultIsOpen={false}
                  trigger={
                    <HStack gap={2} vAlign="center">
                      <Icon
                        icon={ListChecksIcon}
                        size="sm"
                        color="secondary"
                      />
                      <Text type="label">How {PRODUCT_NAME} splits these</Text>
                    </HStack>
                  }>
                  <div style={styles.legendBody}>
                    <VStack gap={2}>
                      {LEGEND_RULES.map(rule => (
                        <HStack key={rule.id} gap={2} vAlign="start">
                          <Icon
                            icon={rule.icon}
                            size="sm"
                            color="secondary"
                          />
                          <StackItem size="fill">
                            <Text type="supporting" color="secondary">
                              {rule.text}
                            </Text>
                          </StackItem>
                        </HStack>
                      ))}
                    </VStack>
                  </div>
                </Collapsible>
              </Card>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
