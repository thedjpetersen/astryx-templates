// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (chat transcript, three saved artifact
 *   versions of a SQL file, fixed ISO timestamps)
 * @output AI assistant workspace: conversation panel on the left (Chat
 *   component family — message bubbles, tool-call rows, composer) and a
 *   large artifact pane on the right showing the generated code file with
 *   a version Selector, Copy, and Open in editor header actions
 * @position Page template; emitted by `astryx template ai-chat-artifact`
 *
 * Frame: Layout height="fill". LayoutHeader carries the session title,
 * model badge, and save state. The conversation is a fixed-width
 * LayoutPanel on the start side; LayoutContent owns the artifact pane
 * (header action row pinned, code scrolls independently).
 *
 * Responsive contract:
 * - >1200px: 400px conversation panel; artifact pane fills the rest.
 * - <=1200px: conversation panel narrows to 340px; artifact keeps fill.
 * - <=768px: single-pane mode — a Chat/Artifact SegmentedControl appears
 *   in the header and swaps the two surfaces; version chips in assistant
 *   messages jump straight to the artifact pane.
 * - The artifact header actions never clip: the filename cell truncates
 *   first (minWidth 0); if space still runs out the action cluster wraps
 *   onto a second row (flexWrap) while keeping intrinsic width.
 * - Transcript and code body scroll independently; page chrome is fixed.
 */

import {useState, type CSSProperties} from 'react';

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  Stack,
  StackItem,
  HStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
  ChatToolCalls,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {RefreshCwIcon, PlusIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  chatColumn: {
    height: '100%',
    minHeight: 0,
  },
  chatFill: {
    flex: 1,
    minHeight: 0,
  },
  artifactColumn: {
    height: '100%',
    minHeight: 0,
  },
  artifactHeader: {
    alignItems: 'center',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
    flexWrap: 'wrap',
  },
  // The filename cell gives way first so the action cluster never clips.
  artifactTitle: {
    minWidth: 0,
  },
  artifactBody: {
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  artifactFooter: {
    alignItems: 'center',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-2)',
  },
  // Version chips sit under the assistant bubble, aligned to its edge.
  versionChipRow: {
    paddingTop: 'var(--spacing-1)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const SESSION_TITLE = 'Churn risk scoring query';
const MODEL_NAME = 'atlas-swe-2';
const ARTIFACT_FILE = 'churn_risk_scores.sql';

const USERS = {
  you: {name: 'Dana Whitfield'},
  assistant: {name: 'Forge Assist'},
} as const;

interface ArtifactVersion {
  id: string;
  label: string;
  savedAt: string; // fixed ISO timestamp
  code: string;
}

const ARTIFACT_VERSIONS: ArtifactVersion[] = [
  {
    id: 'v1',
    label: 'v1 · Baseline 30-day score',
    savedAt: '2026-07-01T14:02:00',
    code: `-- churn_risk_scores.sql
-- v1: baseline churn-risk score from 30-day product activity.
WITH activity AS (
  SELECT
    account_id,
    COUNT(*) AS events_30d,
    COUNT(DISTINCT user_id) AS active_seats
  FROM product_events
  WHERE event_at >= DATE '2026-06-01'
  GROUP BY account_id
)
SELECT
  a.account_id,
  acc.plan_tier,
  a.events_30d,
  a.active_seats,
  ROUND(1.0 - LEAST(a.events_30d / 500.0, 1.0), 3) AS churn_risk
FROM activity a
JOIN accounts acc
  ON acc.id = a.account_id
ORDER BY churn_risk DESC;`,
  },
  {
    id: 'v2',
    label: 'v2 · 90-day window with decay',
    savedAt: '2026-07-01T14:09:00',
    code: `-- churn_risk_scores.sql
-- v2: 90-day trailing window; recent weeks weigh more (0.85 decay).
WITH weekly AS (
  SELECT
    account_id,
    DATE_TRUNC('week', event_at) AS week_start,
    COUNT(*) AS events,
    COUNT(DISTINCT user_id) AS active_seats
  FROM product_events
  WHERE event_at >= DATE '2026-04-02'
  GROUP BY account_id, DATE_TRUNC('week', event_at)
),
decayed AS (
  SELECT
    account_id,
    SUM(events * POWER(0.85,
      DATE_DIFF('week', week_start, DATE '2026-07-01'))) AS weighted_events,
    MAX(active_seats) AS peak_seats
  FROM weekly
  GROUP BY account_id
)
SELECT
  d.account_id,
  acc.plan_tier,
  ROUND(d.weighted_events, 1) AS weighted_events,
  d.peak_seats,
  ROUND(1.0 - LEAST(d.weighted_events / 1200.0, 1.0), 3) AS churn_risk
FROM decayed d
JOIN accounts acc
  ON acc.id = d.account_id
ORDER BY churn_risk DESC;`,
  },
  {
    id: 'v3',
    label: 'v3 · Plan-tier weights + tickets',
    savedAt: '2026-07-01T14:17:00',
    code: `-- churn_risk_scores.sql
-- v3: adds plan-tier weighting and an open-ticket pressure signal.
WITH weekly AS (
  SELECT
    account_id,
    DATE_TRUNC('week', event_at) AS week_start,
    COUNT(*) AS events,
    COUNT(DISTINCT user_id) AS active_seats
  FROM product_events
  WHERE event_at >= DATE '2026-04-02'
  GROUP BY account_id, DATE_TRUNC('week', event_at)
),
decayed AS (
  SELECT
    account_id,
    SUM(events * POWER(0.85,
      DATE_DIFF('week', week_start, DATE '2026-07-01'))) AS weighted_events,
    MAX(active_seats) AS peak_seats
  FROM weekly
  GROUP BY account_id
),
tickets AS (
  SELECT
    account_id,
    COUNT(*) FILTER (WHERE status = 'open') AS open_tickets
  FROM support_tickets
  WHERE opened_at >= DATE '2026-04-02'
  GROUP BY account_id
)
SELECT
  d.account_id,
  acc.plan_tier,
  ROUND(d.weighted_events, 1) AS weighted_events,
  COALESCE(t.open_tickets, 0) AS open_tickets,
  ROUND(
    (1.0 - LEAST(d.weighted_events / 1200.0, 1.0))
      * CASE acc.plan_tier
          WHEN 'enterprise' THEN 1.25
          WHEN 'growth' THEN 1.0
          ELSE 0.8
        END
      + LEAST(COALESCE(t.open_tickets, 0) * 0.03, 0.15),
    3) AS churn_risk
FROM decayed d
JOIN accounts acc
  ON acc.id = d.account_id
LEFT JOIN tickets t
  ON t.account_id = d.account_id
ORDER BY churn_risk DESC;`,
  },
];

const LATEST_VERSION_ID = ARTIFACT_VERSIONS[ARTIFACT_VERSIONS.length - 1].id;

/** One transcript entry. Assistant turns may carry a tool call + version. */
interface TranscriptMessage {
  id: string;
  sender: 'user' | 'assistant';
  time: string; // fixed ISO timestamp
  text: string;
  toolCall?: {
    name: string;
    duration: string;
    additions: number;
    deletions: number;
  };
  versionId?: string;
}

const TRANSCRIPT: TranscriptMessage[] = [
  {
    id: 'm1',
    sender: 'user',
    time: '2026-07-01T14:01:00',
    text: 'Write a SQL query that scores every account for churn risk using product activity. We are on Trino; the events live in product_events.',
  },
  {
    id: 'm2',
    sender: 'assistant',
    time: '2026-07-01T14:02:00',
    text: 'Created churn_risk_scores.sql. v1 scores each account on 30-day event volume normalized against a 500-events/month healthy baseline, joined to accounts for plan tier. Accounts sort riskiest first.',
    toolCall: {
      name: 'create_artifact',
      duration: '1.8s',
      additions: 21,
      deletions: 0,
    },
    versionId: 'v1',
  },
  {
    id: 'm3',
    sender: 'user',
    time: '2026-07-01T14:07:00',
    text: '30 days is too twitchy — accounts look churned after one quiet sprint. Can we look at a 90-day window but still favor recent behavior?',
  },
  {
    id: 'm4',
    sender: 'assistant',
    time: '2026-07-01T14:09:00',
    text: 'Updated to v2: activity is bucketed by week over a 90-day trailing window, then exponentially decayed at 0.85 per week — a quiet fortnight now dents the score instead of zeroing it. The healthy baseline moves to 1,200 weighted events.',
    toolCall: {
      name: 'update_artifact',
      duration: '2.4s',
      additions: 19,
      deletions: 8,
    },
    versionId: 'v2',
  },
  {
    id: 'm5',
    sender: 'user',
    time: '2026-07-01T14:14:00',
    text: 'Nice. Last thing: enterprise accounts deserve extra caution, and open support tickets should push risk up a bit.',
  },
  {
    id: 'm6',
    sender: 'assistant',
    time: '2026-07-01T14:17:00',
    text: 'Done in v3. Enterprise scores are amplified 1.25x (starter dampened to 0.8x), and each open ticket adds 0.03 risk, capped at +0.15 so tickets nudge rather than dominate. Ready to run against the warehouse.',
    toolCall: {
      name: 'update_artifact',
      duration: '2.1s',
      additions: 24,
      deletions: 3,
    },
    versionId: 'v3',
  },
];

// ============= CONVERSATION =============

function TranscriptEntry({
  message,
  onOpenVersion,
}: {
  message: TranscriptMessage;
  onOpenVersion: (versionId: string) => void;
}) {
  const isSelf = message.sender === 'user';
  return (
    <ChatMessage
      sender={message.sender}
      avatar={
        isSelf ? undefined : <Avatar name={USERS.assistant.name} size="small" />
      }>
      <ChatMessageBubble
        name={isSelf ? undefined : USERS.assistant.name}
        metadata={
          <ChatMessageMetadata
            timestamp={<Timestamp value={message.time} format="time" />}
          />
        }>
        {message.text}
      </ChatMessageBubble>
      {message.toolCall != null && (
        <ChatToolCalls
          calls={[
            {
              key: `${message.id}-tool`,
              name: message.toolCall.name,
              target: ARTIFACT_FILE,
              status: 'complete',
              duration: message.toolCall.duration,
              additions: message.toolCall.additions,
              deletions: message.toolCall.deletions,
            },
          ]}
        />
      )}
      {message.versionId != null && (
        <div style={styles.versionChipRow}>
          <Button
            label={`Open ${ARTIFACT_FILE} · ${message.versionId}`}
            variant="secondary"
            size="sm"
            onClick={() => onOpenVersion(message.versionId as string)}
          />
        </div>
      )}
    </ChatMessage>
  );
}

// ============= PAGE =============

export default function AiChatArtifactTemplate() {
  const [versionId, setVersionId] = useState(LATEST_VERSION_ID);
  const [isCopied, setIsCopied] = useState(false);
  const [draft, setDraft] = useState('');
  // Single-pane mode below 768px: one surface at a time.
  const [mobileView, setMobileView] = useState('artifact');

  const isSinglePane = useMediaQuery('(max-width: 768px)');
  const isPanelNarrow = useMediaQuery('(max-width: 1200px)');

  const version =
    ARTIFACT_VERSIONS.find(item => item.id === versionId) ??
    ARTIFACT_VERSIONS[ARTIFACT_VERSIONS.length - 1];
  const lineCount = version.code.split('\n').length;

  const selectVersion = (id: string) => {
    setVersionId(id);
    setIsCopied(false);
  };

  const openVersion = (id: string) => {
    selectVersion(id);
    if (isSinglePane) {
      setMobileView('artifact');
    }
  };

  const copyArtifact = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard != null) {
      void navigator.clipboard.writeText(version.code);
    }
    setIsCopied(true);
  };

  const conversation = (
    <Stack direction="vertical" style={styles.chatColumn}>
      <StackItem size="fill" style={styles.chatFill}>
        <ChatLayout
          composer={
            <ChatComposer
              placeholder="Ask Forge Assist to refine the query..."
              value={draft}
              onChange={setDraft}
              onSubmit={() => setDraft('')}
            />
          }>
          <ChatMessageList density="balanced">
            <ChatSystemMessage variant="divider">
              Wednesday, July 1
            </ChatSystemMessage>
            <ChatSystemMessage>
              Forge Assist can create and edit workspace files.
            </ChatSystemMessage>
            {TRANSCRIPT.map(message => (
              <TranscriptEntry
                key={message.id}
                message={message}
                onOpenVersion={openVersion}
              />
            ))}
          </ChatMessageList>
        </ChatLayout>
      </StackItem>
    </Stack>
  );

  const artifact = (
    <Stack direction="vertical" style={styles.artifactColumn}>
      <HStack gap={2} style={styles.artifactHeader}>
        <StackItem size="fill" style={styles.artifactTitle}>
          <HStack gap={2} vAlign="center">
            <Heading level={3} maxLines={1}>
              {ARTIFACT_FILE}
            </Heading>
            <Badge label="SQL" variant="neutral" />
          </HStack>
        </StackItem>
        <Selector
          label="Version"
          isLabelHidden
          size="sm"
          options={ARTIFACT_VERSIONS.map(item => ({
            value: item.id,
            label: item.label,
          }))}
          value={version.id}
          onChange={selectVersion}
        />
        <Button
          label={isCopied ? 'Copied' : 'Copy'}
          variant="secondary"
          size="sm"
          onClick={copyArtifact}
        />
        <Button label="Open in editor" size="sm" onClick={() => {}} />
      </HStack>
      <Divider />
      <StackItem size="fill" style={styles.artifactBody}>
        <CodeBlock
          code={version.code}
          language="sql"
          width="100%"
          hasLineNumbers
        />
      </StackItem>
      <Divider />
      <HStack gap={2} style={styles.artifactFooter}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary" maxLines={1}>
            {lineCount} lines · generated by {MODEL_NAME}
          </Text>
        </StackItem>
        <Text type="supporting" color="secondary">
          Saved <Timestamp value={version.savedAt} format="time" />
        </Text>
      </HStack>
    </Stack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>{SESSION_TITLE}</Heading>
                <Badge label={MODEL_NAME} variant="neutral" />
                <StatusDot variant="success" label="All changes saved" />
              </HStack>
            </StackItem>
            {isSinglePane && (
              <SegmentedControl
                label="Workspace view"
                value={mobileView}
                onChange={setMobileView}
                size="sm">
                <SegmentedControlItem label="Chat" value="chat" />
                <SegmentedControlItem label="Artifact" value="artifact" />
              </SegmentedControl>
            )}
            <IconButton
              label="Regenerate response"
              tooltip="Regenerate response"
              icon={<Icon icon={RefreshCwIcon} size="sm" color="inherit" />}
              variant="ghost"
              onClick={() => {}}
            />
            <Button
              label="New session"
              variant="secondary"
              icon={<Icon icon={PlusIcon} size="sm" />}
              onClick={() => {}}
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        !isSinglePane ? (
          <LayoutPanel
            hasDivider
            width={isPanelNarrow ? 340 : 400}
            padding={0}
            label="Conversation">
            {conversation}
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={0}>
          {isSinglePane && mobileView === 'chat' ? conversation : artifact}
        </LayoutContent>
      }
    />
  );
}
