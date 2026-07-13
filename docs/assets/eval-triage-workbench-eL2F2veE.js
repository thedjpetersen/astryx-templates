var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (tagged-session totals, a by-skill
 *   failure breakdown, 14 session rows with users/channels/models/labels,
 *   per-session transcript snippets, and a 16-item failure taxonomy)
 * @output Session-labeling eval workbench: a stat-card strip (Total tagged /
 *   Golden / Failure / Neutral with warning- and error-tinted cards), a
 *   "By skill" mini-table with failure-rate bars, a filterable sessions
 *   Table (channel Selector + user-id TextInput, count Pagination), and a
 *   right detail panel for the selected row — transcript snippet Card,
 *   failure-taxonomy chip grid (ToggleButtons), Golden/Failure/Neutral
 *   SegmentedControl, notes TextArea, and Save with FieldStatus feedback
 * @position Page template; emitted by \`astryx template eval-triage-workbench\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the page title, batch
 * badge, and queue caption. LayoutContent scrolls as one column: stats,
 * by-skill table, then the table + detail split. The detail panel is a
 * sibling column (not LayoutPanel) so it can stack under the table when
 * the page is narrow.
 *
 * Responsive contract:
 * - Width is measured with a local ResizeObserver (useElementWidth) —
 *   the demo stage never fires viewport media queries.
 * - >880px: 4-across stat cards; table + fixed 380px detail panel side by
 *   side; all seven table columns visible.
 * - <=880px: stat cards fall to a 2x2 grid; the detail panel stacks below
 *   the table at full width; the Model and Date columns drop from the
 *   table (Session / User / Channel / Msgs / Label remain).
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
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {Pagination} from '@astryxdesign/core/Pagination';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {
  AwardIcon,
  CircleMinusIcon,
  CircleXIcon,
  ListChecksIcon,
  MessageSquareIcon,
  TagIcon,
} from 'lucide-react';

// ============= STYLES =============

const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const styles: Record<string, CSSProperties> = {
  pageWrap: {height: '100%'},
  // Stat strip: 4-across, 2x2 when compact.
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  statGridCompact: {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'},
  statGolden: {
    backgroundColor: 'var(--color-background-yellow)',
    borderColor: 'var(--color-border-yellow)',
  },
  statFailure: {
    backgroundColor: 'var(--color-background-red)',
    borderColor: 'var(--color-border-red)',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  monoCell: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: 'var(--color-text-primary)',
  },
  monoDim: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
  },
  // By-skill failure-rate bar.
  rateTrack: {
    width: 96,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'var(--color-track)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  rateFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: 'var(--color-error)',
  },
  // Main split: table column + fixed detail panel.
  splitRow: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    alignItems: 'flex-start',
  },
  splitRowCompact: {flexDirection: 'column'},
  tableColumn: {flex: 1, minWidth: 0},
  detailColumn: {width: 380, flexShrink: 0},
  detailColumnCompact: {width: '100%'},
  clickableRow: {cursor: 'pointer'},
  selectedRow: {
    cursor: 'pointer',
    backgroundColor:
      'var(--color-background-selected, var(--color-background-muted))',
  },
  chipWrap: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1)'},
  snippetToolLine: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  toolbarWrap: {flexWrap: 'wrap'},
};

// ============= RESPONSIVE =============
// The demo stage is narrower than the window, so viewport media queries
// never fire — measure the page's own width instead.

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

// ============= DATA =============
// Deterministic fixtures: fixed dates around 2026-07, no clocks, no
// randomness. Product-neutral names throughout ("Relay Copilot", quill-*
// models, TeamChat integration).

const PAGE_TITLE = 'Eval triage';
const BATCH_LABEL = 'Batch · Jul 07–13';
const QUEUE_CAPTION = '214 tagged · 36 in review queue';

type Channel = 'web' | 'teamchat' | 'api';
type Verdict = 'golden' | 'failure' | 'neutral';

const CHANNEL_BADGE: Record<Channel, {label: string; variant: 'info' | 'purple' | 'teal'}> = {
  web: {label: 'web', variant: 'info'},
  teamchat: {label: 'teamchat', variant: 'purple'},
  api: {label: 'api', variant: 'teal'},
};

const CHANNEL_OPTIONS = [
  {value: 'all', label: 'All channels'},
  {value: 'web', label: 'Web'},
  {value: 'teamchat', label: 'TeamChat'},
  {value: 'api', label: 'API'},
];

// The 16-item failure taxonomy shown as a chip grid in the detail panel.
const TAXONOMY: ReadonlyArray<{id: string; label: string}> = [
  {id: 'tool-error', label: 'Tool Error (Unrecovered)'},
  {id: 'wrong-tool', label: 'Wrong Tool'},
  {id: 'wrong-params', label: 'Wrong Parameters'},
  {id: 'skill-misroute', label: 'Skill Misroute'},
  {id: 'skill-not-triggered', label: 'Skill Not Triggered'},
  {id: 'false-success', label: 'False Success Claim'},
  {id: 'hallucination', label: 'Hallucination'},
  {id: 'premature-termination', label: 'Premature Termination'},
  {id: 'clarification-stall', label: 'Clarification Stall'},
  {id: 'repeated-action', label: 'Repeated Action'},
  {id: 'context-overflow', label: 'Context Overflow'},
  {id: 'verbose-waste', label: 'Verbose Waste'},
  {id: 'off-topic', label: 'Off Topic'},
  {id: 'no-failure', label: 'No Failure'},
  {id: 'sandbox-crash', label: 'Sandbox Crash'},
  {id: 'user-abandoned', label: 'User Abandoned'},
];

const TAXONOMY_LABEL: Record<string, string> = Object.fromEntries(
  TAXONOMY.map(item => [item.id, item.label]),
);

interface SnippetTurn {
  role: 'user' | 'agent' | 'tool';
  text: string;
}

interface EvalSession {
  id: string;
  title: string;
  user: string;
  channel: Channel;
  model: string;
  msgs: number;
  date: string;
  verdict: Verdict | null; // null = not yet labeled
  taxonomy: string | null;
  notes: string;
  snippet: SnippetTurn[];
}

const SESSIONS: EvalSession[] = [
  {
    id: 's-01',
    title: 'Refund flow double-charges on retry',
    user: 'u-4821',
    channel: 'web',
    model: 'quill-ultra',
    msgs: 34,
    date: 'Jul 12',
    verdict: 'failure',
    taxonomy: 'tool-error',
    notes: 'Charge tool 502ed; the retry loop reran the charge instead of checking idempotency.',
    snippet: [
      {role: 'user', text: 'Customers on the annual plan are getting charged twice when checkout retries.'},
      {role: 'tool', text: '$ payments.charge --order 88213 → 502 Bad Gateway (retried x2)'},
      {role: 'agent', text: 'I retried the charge and both attempts went through — the refund path should reconcile this automatically.'},
    ],
  },
  {
    id: 's-02',
    title: 'Summarize Q2 infra spend',
    user: 'u-1937',
    channel: 'teamchat',
    model: 'quill-core',
    msgs: 12,
    date: 'Jul 12',
    verdict: 'golden',
    taxonomy: 'no-failure',
    notes: 'Clean run — pulled the right dashboards, cited every number.',
    snippet: [
      {role: 'user', text: 'Give me a 5-bullet summary of Q2 infra spend vs budget for the platform review.'},
      {role: 'tool', text: '$ finops.query --period 2026-Q2 --group service → 14 rows'},
      {role: 'agent', text: 'Q2 landed at $412K against a $430K budget (-4.2%). Compute drove the variance: sandbox pool spend fell 11% after the pre-warm change…'},
    ],
  },
  {
    id: 's-03',
    title: 'Migrate cron jobs to scheduler v2',
    user: 'u-8804',
    channel: 'api',
    model: 'quill-ultra',
    msgs: 58,
    date: 'Jul 11',
    verdict: 'failure',
    taxonomy: 'context-overflow',
    notes: 'Compacted twice mid-migration and lost the list of already-moved jobs; re-migrated 9 of them.',
    snippet: [
      {role: 'user', text: 'Move the remaining 23 cron jobs to scheduler v2, one PR per service.'},
      {role: 'agent', text: 'Context compacted — resuming. Starting with billing-nightly, report-rollup, and cache-warm…'},
      {role: 'tool', text: '$ git pr create --title "migrate cache-warm to scheduler v2" → PR #1204 (duplicate of #1191)'},
    ],
  },
  {
    id: 's-04',
    title: 'Draft release notes for v0.9',
    user: 'u-2210',
    channel: 'web',
    model: 'quill-mini',
    msgs: 9,
    date: 'Jul 11',
    verdict: 'neutral',
    taxonomy: 'verbose-waste',
    notes: 'Correct content but 4x longer than asked; user trimmed it themselves.',
    snippet: [
      {role: 'user', text: 'Draft short release notes for v0.9 — 6 bullets max, changelog is in the repo.'},
      {role: 'tool', text: '$ git log v0.8..v0.9 --oneline → 47 commits'},
      {role: 'agent', text: 'Here are the release notes, organized into Highlights, Improvements, Fixes, Breaking Changes, Deprecations, and Acknowledgements…'},
    ],
  },
  {
    id: 's-05',
    title: 'Why is checkout p99 spiking?',
    user: 'u-4821',
    channel: 'web',
    model: 'quill-ultra',
    msgs: 41,
    date: 'Jul 11',
    verdict: 'failure',
    taxonomy: 'false-success',
    notes: 'Claimed the regression was fixed; the trace it cited was from staging, not prod.',
    snippet: [
      {role: 'user', text: 'Checkout p99 jumped from 800ms to 2.1s since Tuesday. Find the cause.'},
      {role: 'tool', text: '$ traces.search --service checkout --env staging --p99 → 12 spans'},
      {role: 'agent', text: 'Found and fixed it — the connection pool was exhausted. p99 is back under 900ms.'},
    ],
  },
  {
    id: 's-06',
    title: 'Rotate staging DB credentials',
    user: 'u-7433',
    channel: 'api',
    model: 'quill-core',
    msgs: 17,
    date: 'Jul 10',
    verdict: 'golden',
    taxonomy: 'no-failure',
    notes: 'Textbook run: dry-run first, verified connections after rotation.',
    snippet: [
      {role: 'user', text: 'Rotate the staging Postgres credentials and update the three services that use them.'},
      {role: 'tool', text: '$ vault rotate staging/pg-main --dry-run → ok (3 consumers found)'},
      {role: 'agent', text: 'Rotated and verified — all three services reconnected with the new credentials. Old secret revoked at 14:32.'},
    ],
  },
  {
    id: 's-07',
    title: 'Weekly oncall handoff summary',
    user: 'u-1937',
    channel: 'teamchat',
    model: 'quill-mini',
    msgs: 8,
    date: 'Jul 10',
    verdict: 'failure',
    taxonomy: 'skill-not-triggered',
    notes: 'The oncall-search skill never fired; it summarized from stale channel history instead.',
    snippet: [
      {role: 'user', text: 'Write the oncall handoff for this week — incidents, follow-ups, open pages.'},
      {role: 'agent', text: 'Based on recent messages, it was a quiet week with no notable incidents.'},
      {role: 'user', text: 'We had a SEV2 on Wednesday… did you check the incident tracker?'},
    ],
  },
  {
    id: 's-08',
    title: 'Backfill orders table timestamps',
    user: 'u-9152',
    channel: 'api',
    model: 'quill-ultra',
    msgs: 63,
    date: 'Jul 10',
    verdict: 'failure',
    taxonomy: 'premature-termination',
    notes: 'Stopped at batch 40/112 and declared done; no completion check.',
    snippet: [
      {role: 'user', text: 'Backfill created_at for the 2024 rows in orders — batches of 10K, throttled.'},
      {role: 'tool', text: '$ db.backfill --table orders --batch 40/112 → 10,000 rows updated'},
      {role: 'agent', text: 'Backfill complete. All 2024 rows now have created_at populated.'},
    ],
  },
  {
    id: 's-09',
    title: 'Fix flaky auth e2e test',
    user: 'u-3390',
    channel: 'web',
    model: 'quill-ultra',
    msgs: 27,
    date: 'Jul 9',
    verdict: 'golden',
    taxonomy: 'no-failure',
    notes: 'Found the race, proved it with 200 consecutive green runs.',
    snippet: [
      {role: 'user', text: 'auth-login.e2e fails ~1 in 20 runs on CI. Make it deterministic.'},
      {role: 'tool', text: '$ pnpm test auth-login.e2e --repeat 200 → 200 passed, 0 failed'},
      {role: 'agent', text: 'The token refresh raced the redirect assertion. I now wait on the session cookie instead of a fixed 500ms sleep — 200/200 green.'},
    ],
  },
  {
    id: 's-10',
    title: 'Translate onboarding emails to DE',
    user: 'u-2210',
    channel: 'web',
    model: 'quill-mini',
    msgs: 11,
    date: 'Jul 9',
    verdict: 'neutral',
    taxonomy: 'user-abandoned',
    notes: 'User left mid-review of the second draft; nothing wrong with the output.',
    snippet: [
      {role: 'user', text: 'Translate the four onboarding emails to German — formal "Sie" throughout.'},
      {role: 'agent', text: 'Here is email 1 of 4 ("Welcome"). Want me to keep product names in English?'},
      {role: 'user', text: 'Yes, keep them. Actually — hold on, meeting.'},
    ],
  },
  {
    id: 's-11',
    title: 'Chart signup conversion by cohort',
    user: 'u-6018',
    channel: 'teamchat',
    model: 'quill-core',
    msgs: 19,
    date: 'Jul 8',
    verdict: 'failure',
    taxonomy: 'wrong-tool',
    notes: 'Scraped the analytics UI with the browser tool instead of using the warehouse query tool.',
    snippet: [
      {role: 'user', text: 'Plot weekly signup→activation conversion by cohort for the last 8 weeks.'},
      {role: 'tool', text: '$ browser.navigate analytics.internal/funnels → screenshot captured'},
      {role: 'agent', text: 'I read the numbers off the funnels dashboard screenshot — cohort W24 converts at roughly 31%…'},
    ],
  },
  {
    id: 's-12',
    title: 'Audit S3 bucket public access',
    user: 'u-9152',
    channel: 'api',
    model: 'quill-core',
    msgs: 22,
    date: 'Jul 8',
    verdict: null,
    taxonomy: null,
    notes: '',
    snippet: [
      {role: 'user', text: 'List every bucket with public read and tell me which ones are intentional.'},
      {role: 'tool', text: '$ cloud.storage audit --public-read → 6 buckets flagged'},
      {role: 'agent', text: 'Six buckets allow public read. Four serve static assets by design; two (backup-2023, tmp-exports) look unintentional.'},
    ],
  },
  {
    id: 's-13',
    title: 'Rename service billing → ledger',
    user: 'u-3390',
    channel: 'web',
    model: 'quill-ultra',
    msgs: 45,
    date: 'Jul 8',
    verdict: 'failure',
    taxonomy: 'hallucination',
    notes: 'Referenced a "ledger-proxy" service that does not exist anywhere in the repo.',
    snippet: [
      {role: 'user', text: 'Rename the billing service to ledger across code, configs, and dashboards.'},
      {role: 'agent', text: 'Done in code and configs. Note that ledger-proxy still points at the old DNS name, so I updated its upstream too.'},
      {role: 'user', text: 'We don’t have a ledger-proxy. What did you change?'},
    ],
  },
  {
    id: 's-14',
    title: 'Set up canary alerts for search',
    user: 'u-7433',
    channel: 'teamchat',
    model: 'quill-ultra',
    msgs: 31,
    date: 'Jul 7',
    verdict: null,
    taxonomy: null,
    notes: '',
    snippet: [
      {role: 'user', text: 'Add canary alerts for the search service — error rate and p95, page after 5 minutes.'},
      {role: 'tool', text: '$ alerts.create search-canary-p95 --threshold 450ms --for 5m → created'},
      {role: 'agent', text: 'Both alerts are live and routed to #search-oncall. I ran a synthetic breach and the test page fired in 5m 04s.'},
    ],
  },
];

// Stat strip. Golden + Failure + Neutral sum to Total.
const STATS = [
  {
    id: 'total',
    label: 'Total tagged',
    value: '214',
    caption: '30 this week',
    icon: ListChecksIcon,
    iconColor: 'accent' as const,
    cardStyle: undefined,
  },
  {
    id: 'golden',
    label: 'Golden',
    value: '58',
    caption: '27% of tagged',
    icon: AwardIcon,
    iconColor: 'warning' as const,
    cardStyle: styles.statGolden,
  },
  {
    id: 'failure',
    label: 'Failure',
    value: '121',
    caption: '57% of tagged',
    icon: CircleXIcon,
    iconColor: 'error' as const,
    cardStyle: styles.statFailure,
  },
  {
    id: 'neutral',
    label: 'Neutral',
    value: '35',
    caption: '16% of tagged',
    icon: CircleMinusIcon,
    iconColor: 'secondary' as const,
    cardStyle: undefined,
  },
];

// "By skill" mini-table: tagged volume and failure share per skill.
const SKILL_ROWS = [
  {skill: 'oncall-search', tagged: 36, failurePct: 61},
  {skill: '(no skill)', tagged: 56, failurePct: 48},
  {skill: 'repo-triage', tagged: 41, failurePct: 34},
  {skill: 'data-viz', tagged: 22, failurePct: 27},
  {skill: 'release-notes', tagged: 28, failurePct: 18},
  {skill: 'doc-drafting', tagged: 31, failurePct: 12},
];

const TOTAL_TAGGED = 214;
const PAGE_SIZE = 30;

// ============= LABEL STATE =============

type SaveState = 'new' | 'dirty' | 'saved';

interface LabelState {
  verdict: Verdict | null;
  taxonomy: string | null;
  notes: string;
  save: SaveState;
}

function buildInitialLabels(): Record<string, LabelState> {
  const map: Record<string, LabelState> = {};
  for (const session of SESSIONS) {
    map[session.id] = {
      verdict: session.verdict,
      taxonomy: session.taxonomy,
      notes: session.notes,
      save: session.verdict == null ? 'new' : 'saved',
    };
  }
  return map;
}

const SAVE_FEEDBACK: Record<SaveState, {type: 'warning' | 'success'; message: string}> = {
  new: {type: 'warning', message: 'Not yet labeled — pick a verdict and a tag'},
  dirty: {type: 'warning', message: 'Unsaved changes — autosave in 30s'},
  saved: {type: 'success', message: 'Saved · synced to eval set'},
};

const SNIPPET_ROLE_LABEL: Record<SnippetTurn['role'], string> = {
  user: 'User',
  agent: 'Relay Copilot',
  tool: 'Tool',
};

// ============= LABEL BADGE =============

function LabelBadge({state}: {state: LabelState}) {
  if (state.verdict == null) {
    return (
      <Text type="supporting" color="secondary">
        —
      </Text>
    );
  }
  if (state.verdict === 'golden') {
    return (
      <Badge
        variant="warning"
        label="Golden"
        icon={<Icon icon={AwardIcon} size="xsm" color="inherit" />}
      />
    );
  }
  if (state.verdict === 'failure') {
    const label =
      state.taxonomy != null ? TAXONOMY_LABEL[state.taxonomy] : 'Failure';
    return <Badge variant="error" label={label} />;
  }
  return <Badge variant="neutral" label="Neutral" />;
}

// ============= PAGE =============

export default function EvalTriageWorkbenchTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 880;

  const [channelFilter, setChannelFilter] = useState('all');
  const [userQuery, setUserQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>('s-01');
  const [labels, setLabels] = useState<Record<string, LabelState>>(
    buildInitialLabels,
  );

  const filteredSessions = SESSIONS.filter(session => {
    if (channelFilter !== 'all' && session.channel !== channelFilter) {
      return false;
    }
    const query = userQuery.trim().toLowerCase();
    if (query.length > 0 && !session.user.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  });

  const selectedSession =
    SESSIONS.find(session => session.id === selectedId) ?? null;
  const selectedLabel = selectedSession != null ? labels[selectedSession.id] : null;

  // Any edit marks the session dirty; Save flips it back to saved.
  const editLabel = (id: string, patch: Partial<LabelState>) => {
    setLabels(prev => ({
      ...prev,
      [id]: {...prev[id], ...patch, save: 'dirty'},
    }));
  };

  const saveLabel = (id: string) => {
    setLabels(prev => ({...prev, [id]: {...prev[id], save: 'saved'}}));
  };

  // ---- Stats strip ----
  const statsStrip = (
    <div
      style={
        isCompact
          ? {...styles.statGrid, ...styles.statGridCompact}
          : styles.statGrid
      }>
      {STATS.map(stat => (
        <Card key={stat.id} padding={3} style={stat.cardStyle}>
          <HStack gap={3} vAlign="center">
            <Icon icon={stat.icon} size="md" color={stat.iconColor} />
            <VStack gap={0}>
              <Text size="2xl" weight="bold" hasTabularNumbers>
                {stat.value}
              </Text>
              <Text type="supporting" color="secondary">
                {stat.label} · {stat.caption}
              </Text>
            </VStack>
          </HStack>
        </Card>
      ))}
    </div>
  );

  // ---- By-skill mini-table ----
  const bySkill = (
    <VStack gap={2}>
      <span style={styles.eyebrow}>By skill</span>
      <Card padding={0}>
        <Table density="compact" dividers="rows" hasHover>
          <TableHeader>
            <TableRow isHeaderRow>
              <TableHeaderCell scope="col">Skill</TableHeaderCell>
              <TableHeaderCell scope="col" style={{width: 96, minWidth: 96}}>
                Tagged
              </TableHeaderCell>
              <TableHeaderCell scope="col" style={{width: 200, minWidth: 160}}>
                Failure rate
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SKILL_ROWS.map(row => (
              <TableRow key={row.skill}>
                <TableCell>
                  <span style={styles.monoCell}>{row.skill}</span>
                </TableCell>
                <TableCell>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {row.tagged}
                  </Text>
                </TableCell>
                <TableCell>
                  <HStack gap={2} vAlign="center">
                    <div style={styles.rateTrack} aria-hidden>
                      <div
                        style={{...styles.rateFill, width: \`\${row.failurePct}%\`}}
                      />
                    </div>
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {row.failurePct}%
                    </Text>
                  </HStack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </VStack>
  );

  // ---- Sessions table ----
  const sessionsTable = (
    <VStack gap={2} style={styles.tableColumn}>
      <HStack gap={2} vAlign="center" style={styles.toolbarWrap}>
        <Selector
          label="Filter by channel"
          isLabelHidden
          size="sm"
          options={CHANNEL_OPTIONS}
          value={channelFilter}
          onChange={value => {
            setChannelFilter(value);
            setPage(1);
          }}
        />
        <TextInput
          label="Filter by user ID"
          isLabelHidden
          size="sm"
          width={200}
          placeholder="Filter by user ID..."
          value={userQuery}
          onChange={value => {
            setUserQuery(value);
            setPage(1);
          }}
          hasClear
        />
        <StackItem size="fill" />
        <Pagination
          label="Tagged sessions pagination"
          variant="count"
          size="sm"
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={TOTAL_TAGGED}
          onChange={setPage}
        />
      </HStack>
      <Card padding={0}>
        {filteredSessions.length === 0 ? (
          <EmptyState
            title="No sessions match your filters"
            description="Clear the channel or user filter to see the batch."
            isCompact
          />
        ) : (
          <Table density="compact" dividers="rows" hasHover>
            <TableHeader>
              <TableRow isHeaderRow>
                <TableHeaderCell scope="col">Session</TableHeaderCell>
                <TableHeaderCell scope="col" style={{width: 88, minWidth: 88}}>
                  User
                </TableHeaderCell>
                <TableHeaderCell scope="col" style={{width: 96, minWidth: 96}}>
                  Channel
                </TableHeaderCell>
                {!isCompact && (
                  <TableHeaderCell
                    scope="col"
                    style={{width: 104, minWidth: 104}}>
                    Model
                  </TableHeaderCell>
                )}
                <TableHeaderCell scope="col" style={{width: 60, minWidth: 60}}>
                  Msgs
                </TableHeaderCell>
                <TableHeaderCell scope="col" style={{width: 168, minWidth: 140}}>
                  Label
                </TableHeaderCell>
                {!isCompact && (
                  <TableHeaderCell scope="col" style={{width: 72, minWidth: 72}}>
                    Date
                  </TableHeaderCell>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map(session => {
                const isSelected = session.id === selectedId;
                return (
                  <TableRow
                    key={session.id}
                    style={isSelected ? styles.selectedRow : styles.clickableRow}
                    aria-selected={isSelected}
                    onClick={() => setSelectedId(session.id)}>
                    <TableCell>
                      <Text size="sm" weight={isSelected ? 'semibold' : 'normal'} maxLines={1}>
                        {session.title}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <span style={styles.monoDim}>{session.user}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        label={CHANNEL_BADGE[session.channel].label}
                        variant={CHANNEL_BADGE[session.channel].variant}
                      />
                    </TableCell>
                    {!isCompact && (
                      <TableCell>
                        <span style={styles.monoDim}>{session.model}</span>
                      </TableCell>
                    )}
                    <TableCell>
                      <Text type="supporting" color="secondary" hasTabularNumbers>
                        {session.msgs}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <LabelBadge state={labels[session.id]} />
                    </TableCell>
                    {!isCompact && (
                      <TableCell>
                        <Text type="supporting" color="secondary" hasTabularNumbers>
                          {session.date}
                        </Text>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        Showing {filteredSessions.length} of {TOTAL_TAGGED} tagged sessions in
        this batch window
      </Text>
    </VStack>
  );

  // ---- Detail panel ----
  const detailPanel = (
    <VStack
      gap={3}
      style={
        isCompact
          ? {...styles.detailColumn, ...styles.detailColumnCompact}
          : styles.detailColumn
      }>
      {selectedSession == null || selectedLabel == null ? (
        <Card padding={4}>
          <EmptyState
            title="Select a session"
            description="Pick a row to review its transcript and apply labels."
            icon={<Icon icon={MessageSquareIcon} size="lg" color="secondary" />}
            isCompact
          />
        </Card>
      ) : (
        <>
          {/* Transcript snippet */}
          <Card padding={3}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text weight="semibold" maxLines={1}>
                    {selectedSession.title}
                  </Text>
                </StackItem>
                <LabelBadge state={selectedLabel} />
              </HStack>
              <Text type="supporting" color="secondary">
                {selectedSession.user} · {CHANNEL_BADGE[selectedSession.channel].label} ·{' '}
                {selectedSession.model} · {selectedSession.msgs} msgs ·{' '}
                {selectedSession.date}
              </Text>
              <Divider />
              {selectedSession.snippet.map((turn, index) =>
                turn.role === 'tool' ? (
                  <div key={index} style={styles.snippetToolLine}>
                    {turn.text}
                  </div>
                ) : (
                  <VStack key={index} gap={0}>
                    <span style={styles.eyebrow}>
                      {SNIPPET_ROLE_LABEL[turn.role]}
                    </span>
                    <Text size="sm">{turn.text}</Text>
                  </VStack>
                ),
              )}
              <Text type="supporting" color="secondary">
                Snippet · {selectedSession.msgs - selectedSession.snippet.length}{' '}
                more messages in the full transcript
              </Text>
            </VStack>
          </Card>

          {/* Label picker */}
          <Card padding={3}>
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <Icon icon={TagIcon} size="sm" color="secondary" />
                <span style={styles.eyebrow}>Failure taxonomy</span>
              </HStack>
              <div style={styles.chipWrap} role="group" aria-label="Failure taxonomy tags">
                {TAXONOMY.map(item => (
                  <ToggleButton
                    key={item.id}
                    label={item.label}
                    size="sm"
                    isPressed={selectedLabel.taxonomy === item.id}
                    onPressedChange={pressed =>
                      editLabel(selectedSession.id, {
                        taxonomy: pressed ? item.id : null,
                      })
                    }
                  />
                ))}
              </div>
              <VStack gap={1}>
                <span style={styles.eyebrow}>Verdict</span>
                <SegmentedControl
                  label="Session verdict"
                  size="sm"
                  layout="fill"
                  value={selectedLabel.verdict ?? ''}
                  onChange={value =>
                    editLabel(selectedSession.id, {verdict: value as Verdict})
                  }>
                  <SegmentedControlItem value="golden" label="Golden" />
                  <SegmentedControlItem value="failure" label="Failure" />
                  <SegmentedControlItem value="neutral" label="Neutral" />
                </SegmentedControl>
              </VStack>
              <TextArea
                label="Reviewer notes"
                rows={3}
                placeholder="Why this label? Cite the turn where it went wrong..."
                value={selectedLabel.notes}
                onChange={value => editLabel(selectedSession.id, {notes: value})}
              />
              <HStack gap={2} vAlign="center">
                <Button
                  label="Save labels"
                  size="sm"
                  onClick={() => saveLabel(selectedSession.id)}
                />
                <StackItem size="fill" />
              </HStack>
              <FieldStatus
                variant="detached"
                type={SAVE_FEEDBACK[selectedLabel.save].type}
                message={SAVE_FEEDBACK[selectedLabel.save].message}
              />
            </VStack>
          </Card>
        </>
      )}
    </VStack>
  );

  return (
    <div ref={wrapRef} style={styles.pageWrap}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>{PAGE_TITLE}</Heading>
                  <Badge variant="neutral" label={BATCH_LABEL} />
                </HStack>
              </StackItem>
              {!isCompact && (
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {QUEUE_CAPTION}
                </Text>
              )}
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <VStack gap={4}>
              {statsStrip}
              {bySkill}
              <div
                style={
                  isCompact
                    ? {...styles.splitRow, ...styles.splitRowCompact}
                    : styles.splitRow
                }>
                {sessionsTable}
                {detailPanel}
              </div>
            </VStack>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};