// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (10 feedback reports with categories,
 *   statuses, reporters, screenshot counts, session ids, and activity logs;
 *   a fixed 14-day daily-count series for the header chart)
 * @output Bug-report/feedback triage board for an AI agent product: header
 *   with report counts and a compact right-aligned 14-day SVG bar chart;
 *   a filter row of category ToggleButton chips (with counts) plus a status
 *   Selector; ten SelectableCard report rows showing category chip, 2-line
 *   description, reporter + relative time, paperclip screenshot count,
 *   status Badge, and a fix-owner Avatar on claimed rows; selecting a row
 *   opens a detail panel with the full text, mono session-id link,
 *   screenshot Thumbnail placeholders, a status Selector + "Assign to me"
 *   Button, and a timestamped activity log
 * @position Page template; emitted by `astryx template agent-feedback-triage`
 *
 * Frame: Layout height="fill". LayoutHeader carries the title, counts, and
 * the 14-day chart. LayoutContent hosts the filter row and the report list;
 * the detail lives in an end LayoutPanel (360px). Category chips and the
 * status Selector really filter the list, and status changes made in the
 * detail panel update the row Badge in place.
 *
 * Responsive contract:
 * - The page measures its own width with a ResizeObserver (the demo stage
 *   is narrower than the viewport, so media queries are unreliable here).
 * - >880px: report list + right 360px detail panel side by side.
 * - <=880px: the end panel is dropped and the detail renders as a Card
 *   directly beneath the report list; the header chart is hidden and the
 *   category chips wrap onto multiple lines.
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
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Selector} from '@astryxdesign/core/Selector';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {PaperclipIcon, UserRoundPlusIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  pageWrap: {height: '100%'},
  headerMeta: {minWidth: 0},
  chipRow: {flexWrap: 'wrap'},
  reportList: {maxWidth: 880},
  rowDescription: {minWidth: 0},
  rowMetaGap: {minWidth: 0},
  emptyCard: {
    border: 'var(--border-width) dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-6)',
    textAlign: 'center',
  },
  detailThumbRow: {flexWrap: 'wrap'},
  activityTime: {width: 92, flexShrink: 0},
  compactDetail: {maxWidth: 880},
};

// ============= RESPONSIVE HELPER =============
// The demo stage renders this page in an inline frame narrower than the
// viewport, so viewport media queries never fire — measure our own width.

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
// Deterministic fixtures: fixed relative-time strings and dates around
// 2026-07. No clocks, no randomness, no network assets.

const CURRENT_USER = 'Jordan Bell';

type Category =
  | 'model-error'
  | 'ui-bug'
  | 'performance'
  | 'sandbox'
  | 'tool-failure'
  | 'feature-request'
  | 'other';

type BadgeVariant =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'blue'
  | 'cyan'
  | 'orange'
  | 'purple'
  | 'red'
  | 'yellow';

const CATEGORY_ORDER: Category[] = [
  'model-error',
  'ui-bug',
  'performance',
  'sandbox',
  'tool-failure',
  'feature-request',
  'other',
];

const CATEGORY_META: Record<Category, {label: string; variant: BadgeVariant}> =
  {
    'model-error': {label: 'Model Error', variant: 'red'},
    'ui-bug': {label: 'UI Bug', variant: 'orange'},
    performance: {label: 'Performance', variant: 'yellow'},
    sandbox: {label: 'Sandbox', variant: 'purple'},
    'tool-failure': {label: 'Tool Failure', variant: 'cyan'},
    'feature-request': {label: 'Feature Request', variant: 'blue'},
    other: {label: 'Other', variant: 'neutral'},
  };

type Status = 'open' | 'investigating' | 'resolved';

const STATUS_META: Record<Status, {label: string; variant: BadgeVariant}> = {
  open: {label: 'Open', variant: 'info'},
  investigating: {label: 'Ongoing investigation', variant: 'warning'},
  resolved: {label: 'Resolved', variant: 'success'},
};

const STATUS_FILTER_OPTIONS = [
  {value: 'all', label: 'All statuses'},
  {value: 'open', label: 'Open'},
  {value: 'investigating', label: 'Ongoing investigation'},
  {value: 'resolved', label: 'Resolved'},
];

const STATUS_EDIT_OPTIONS = [
  {value: 'open', label: 'Open'},
  {value: 'investigating', label: 'Ongoing investigation'},
  {value: 'resolved', label: 'Resolved'},
];

interface ActivityEntry {
  at: string; // fixed display timestamp
  text: string;
}

interface FeedbackReport {
  id: string;
  category: Category;
  summary: string; // 2-line row description
  fullText: string;
  reporter: string;
  reportedAt: string; // fixed relative label
  screenshots: number;
  status: Status;
  owner: string | null; // fix owner on claimed rows
  sessionId: string;
  activity: ActivityEntry[];
}

const REPORTS: FeedbackReport[] = [
  {
    id: 'fr-01',
    category: 'model-error',
    summary:
      'Agent claimed all tests passed, but the run log shows 3 failures in ' +
      'checkout.spec.ts. It then marked the task complete and archived it.',
    fullText:
      'Asked Orbit Agent to fix the flaky checkout suite. It ran the suite ' +
      'twice, the second run log clearly shows 3 failures in ' +
      'checkout.spec.ts, yet the final summary says "all 41 tests passing" ' +
      'and the task was marked complete and archived. Screenshots show the ' +
      'summary next to the raw log. This is the second false success claim ' +
      'this week on nova-swe-2.',
    reporter: 'Maya Chen',
    reportedAt: '12m ago',
    screenshots: 2,
    status: 'open',
    owner: null,
    sessionId: 'ses_9f2ac417',
    activity: [
      {at: 'Jul 13 · 09:02', text: 'Reported via in-app feedback form'},
      {at: 'Jul 13 · 09:02', text: 'Auto-linked to session ses_9f2ac417'},
      {at: 'Jul 13 · 09:05', text: 'Tagged Model Error by triage rules'},
    ],
  },
  {
    id: 'fr-02',
    category: 'ui-bug',
    summary:
      'Kanban drag ghost sticks to the cursor after dropping a card into ' +
      'Review — it stays until the page is refreshed.',
    fullText:
      'On Mission Control, dragging a card from In Progress to Review ' +
      'leaves the translucent drag ghost glued to the cursor after drop. ' +
      'Clicking elsewhere does not clear it; only a full refresh does. ' +
      'Reproduces on Chrome 138 and Edge, not on Firefox. Screenshot shows ' +
      'the orphaned ghost over the board.',
    reporter: 'Priya Nair',
    reportedAt: '48m ago',
    screenshots: 1,
    status: 'investigating',
    owner: 'Sam Iyer',
    sessionId: 'ses_41b8e2d9',
    activity: [
      {at: 'Jul 13 · 08:26', text: 'Reported via in-app feedback form'},
      {at: 'Jul 13 · 08:40', text: 'Sam Iyer claimed the fix'},
      {at: 'Jul 13 · 08:41', text: 'Status set to Ongoing investigation'},
    ],
  },
  {
    id: 'fr-03',
    category: 'performance',
    summary:
      'First token takes 8–10s on every session opened from the mobile ' +
      'app; the same sessions start in under 2s on desktop.',
    fullText:
      'Opening any existing session from the mobile app shows the spinner ' +
      'for 8–10 seconds before the first token renders. The identical ' +
      'session opened on desktop streams within 2 seconds. Timed it on ' +
      'wifi and 5G with the same result, so it does not look like a ' +
      'network issue on my end.',
    reporter: 'Diego Alvarez',
    reportedAt: '2h ago',
    screenshots: 0,
    status: 'open',
    owner: null,
    sessionId: 'ses_c07d55a1',
    activity: [
      {at: 'Jul 13 · 07:11', text: 'Reported via mobile shake-to-report'},
      {at: 'Jul 13 · 07:11', text: 'Auto-linked to session ses_c07d55a1'},
      {at: 'Jul 13 · 07:30', text: 'Grouped with 2 similar reports'},
    ],
  },
  {
    id: 'fr-04',
    category: 'sandbox',
    summary:
      'Sandbox loses apt packages between messages — imagemagick installed ' +
      'in one turn is gone by the next tool call.',
    fullText:
      'The agent installed imagemagick in one turn (install log attached), ' +
      'then the very next bash call failed with "convert: command not ' +
      'found". Happens every time the session idles for more than a few ' +
      'minutes, so I suspect the sandbox is being recycled without ' +
      'replaying setup. Three screenshots: install log, failing call, ' +
      'sandbox info panel.',
    reporter: 'Hana Suzuki',
    reportedAt: '4h ago',
    screenshots: 3,
    status: 'investigating',
    owner: 'Rui Costa',
    sessionId: 'ses_7e93ab02',
    activity: [
      {at: 'Jul 13 · 05:18', text: 'Reported via in-app feedback form'},
      {at: 'Jul 13 · 06:02', text: 'Rui Costa claimed the fix'},
      {at: 'Jul 13 · 06:04', text: 'Linked to sandbox-pool incident INC-2214'},
    ],
  },
  {
    id: 'fr-05',
    category: 'tool-failure',
    summary:
      'edit tool patched the wrong file when two files share a basename — ' +
      'changes meant for api/routes.ts landed in web/routes.ts.',
    fullText:
      'Asked for a change in api/routes.ts. The edit tool reported success ' +
      'but the diff landed in web/routes.ts, which has the same basename. ' +
      'The agent never noticed and moved on to run tests against the ' +
      'unchanged api file. Screenshot shows the mis-targeted diff.',
    reporter: 'Tom Whitfield',
    reportedAt: 'Yesterday',
    screenshots: 1,
    status: 'open',
    owner: null,
    sessionId: 'ses_e12f88c4',
    activity: [
      {at: 'Jul 12 · 16:44', text: 'Reported via in-app feedback form'},
      {at: 'Jul 12 · 16:44', text: 'Auto-linked to session ses_e12f88c4'},
      {at: 'Jul 12 · 17:05', text: 'Tagged Tool Failure by triage rules'},
    ],
  },
  {
    id: 'fr-06',
    category: 'feature-request',
    summary:
      'Let me pin a session to the top of the sidebar — I keep losing my ' +
      'long-running migration session under newer chats.',
    fullText:
      'I have one migration session that has been running for two weeks ' +
      'and I open it every morning. Every new chat pushes it further down ' +
      'the sidebar. A simple pin-to-top (like the kanban pin) would save a ' +
      'search every single day.',
    reporter: 'Priya Nair',
    reportedAt: 'Yesterday',
    screenshots: 0,
    status: 'open',
    owner: null,
    sessionId: 'ses_2ab4d970',
    activity: [
      {at: 'Jul 12 · 11:20', text: 'Reported via in-app feedback form'},
      {at: 'Jul 12 · 11:31', text: 'Tagged Feature Request by triage rules'},
      {at: 'Jul 12 · 14:02', text: 'Added to product review queue'},
    ],
  },
  {
    id: 'fr-07',
    category: 'model-error',
    summary:
      'Assistant re-read the same config file 14 times in a row, burning ' +
      '60K context tokens before answering a one-line question.',
    fullText:
      'Asked what port the staging server uses. nova-swe-2-mini read ' +
      'config/staging.yml fourteen consecutive times (identical tool ' +
      'calls), pushed context usage from 22% to 54%, and then answered ' +
      'correctly. Screenshot shows the repeated tool pile. Resolved by the ' +
      'July 10 model rollback per the team.',
    reporter: 'Maya Chen',
    reportedAt: 'Jul 10',
    screenshots: 1,
    status: 'resolved',
    owner: 'Maya Chen',
    sessionId: 'ses_5d80f313',
    activity: [
      {at: 'Jul 10 · 10:12', text: 'Reported via in-app feedback form'},
      {at: 'Jul 10 · 13:47', text: 'Maya Chen claimed the fix'},
      {at: 'Jul 10 · 18:20', text: 'Resolved — model rollback deployed'},
    ],
  },
  {
    id: 'fr-08',
    category: 'other',
    summary:
      'The "Getting started" link in the onboarding email 404s — it points ' +
      'at /docs/start instead of /docs/getting-started.',
    fullText:
      'New teammate clicked the "Getting started" button in the welcome ' +
      'email and got a 404. The link goes to /docs/start; the live page is ' +
      '/docs/getting-started. Tiny thing but it is the first click every ' +
      'new user makes.',
    reporter: 'Lena Fischer',
    reportedAt: 'Jul 9',
    screenshots: 0,
    status: 'open',
    owner: null,
    sessionId: 'ses_b6417c2e',
    activity: [
      {at: 'Jul 9 · 09:33', text: 'Reported via support inbox forward'},
      {at: 'Jul 9 · 09:40', text: 'Tagged Other by triage rules'},
      {at: 'Jul 9 · 10:15', text: 'Routed to growth-onboarding queue'},
    ],
  },
  {
    id: 'fr-09',
    category: 'ui-bug',
    summary:
      'Dark mode diff view renders added lines green-on-green — the text ' +
      'is nearly invisible until you select it.',
    fullText:
      'In dark mode, the shared-file diff view paints added lines with a ' +
      'green background and green text. Contrast is so low the code is ' +
      'unreadable until highlighted. Two screenshots: dark mode vs the ' +
      'same diff in light mode. Fixed in web release 2026.28.',
    reporter: 'Diego Alvarez',
    reportedAt: 'Jul 6',
    screenshots: 2,
    status: 'resolved',
    owner: 'Sam Iyer',
    sessionId: 'ses_f3c9017b',
    activity: [
      {at: 'Jul 6 · 15:08', text: 'Reported via in-app feedback form'},
      {at: 'Jul 7 · 09:12', text: 'Sam Iyer claimed the fix'},
      {at: 'Jul 8 · 12:30', text: 'Resolved in web release 2026.28'},
    ],
  },
  {
    id: 'fr-10',
    category: 'performance',
    summary:
      'Composer stutters while typing in long sessions — the context meter ' +
      'seems to recompute on every keystroke.',
    fullText:
      'In sessions past roughly 100 messages, typing in the composer drops ' +
      'to a visible stutter. Profiler screenshot from devtools suggests ' +
      'the context meter recomputes its token breakdown on every ' +
      'keystroke. Short sessions feel fine.',
    reporter: 'Hana Suzuki',
    reportedAt: 'Jul 3',
    screenshots: 0,
    status: 'investigating',
    owner: 'Rui Costa',
    sessionId: 'ses_88d10a5f',
    activity: [
      {at: 'Jul 3 · 14:55', text: 'Reported via in-app feedback form'},
      {at: 'Jul 4 · 10:06', text: 'Rui Costa claimed the fix'},
      {at: 'Jul 4 · 10:07', text: 'Status set to Ongoing investigation'},
    ],
  },
];

// Fixed 14-day daily report counts for the header chart (Jun 30 – Jul 13).
const DAILY_COUNTS = [3, 5, 2, 6, 4, 7, 9, 5, 8, 6, 11, 7, 9, 12];

const CATEGORY_COUNTS: Record<Category, number> = REPORTS.reduce(
  (acc, report) => {
    acc[report.category] += 1;
    return acc;
  },
  {
    'model-error': 0,
    'ui-bug': 0,
    performance: 0,
    sandbox: 0,
    'tool-failure': 0,
    'feature-request': 0,
    other: 0,
  } as Record<Category, number>,
);

// ============= HEADER CHART =============

const CHART_BAR_WIDTH = 8;
const CHART_BAR_GAP = 4;
const CHART_HEIGHT = 36;

function DailyCountChart() {
  const max = Math.max(...DAILY_COUNTS);
  const width =
    DAILY_COUNTS.length * (CHART_BAR_WIDTH + CHART_BAR_GAP) - CHART_BAR_GAP;
  return (
    <VStack gap={0.5} hAlign="end">
      <svg
        width={width}
        height={CHART_HEIGHT}
        role="img"
        aria-label={`Reports per day over the last 14 days, ${DAILY_COUNTS[DAILY_COUNTS.length - 1]} today`}>
        {DAILY_COUNTS.map((count, index) => {
          const barHeight = Math.max(2, (count / max) * CHART_HEIGHT);
          const isToday = index === DAILY_COUNTS.length - 1;
          return (
            <rect
              key={index}
              x={index * (CHART_BAR_WIDTH + CHART_BAR_GAP)}
              y={CHART_HEIGHT - barHeight}
              width={CHART_BAR_WIDTH}
              height={barHeight}
              rx={1.5}
              fill="var(--color-accent)"
              opacity={isToday ? 1 : 0.45}
            />
          );
        })}
      </svg>
      <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
        14-day volume · 12 today
      </Text>
    </VStack>
  );
}

// ============= REPORT ROW =============

function ReportRow({
  report,
  status,
  owner,
  isSelected,
  onSelect,
}: {
  report: FeedbackReport;
  status: Status;
  owner: string | null;
  isSelected: boolean;
  onSelect: (id: string, isSelected: boolean) => void;
}) {
  const category = CATEGORY_META[report.category];
  return (
    <SelectableCard
      label={`${category.label}: ${report.summary}`}
      isSelected={isSelected}
      onChange={next => onSelect(report.id, next)}
      padding={3}>
      <HStack gap={3} vAlign="start">
        <Badge label={category.label} variant={category.variant} />
        <StackItem size="fill" style={styles.rowDescription}>
          <VStack gap={1}>
            <Text size="sm" maxLines={2}>
              {report.summary}
            </Text>
            <HStack gap={2} vAlign="center" style={styles.rowMetaGap}>
              <Text type="supporting" color="secondary" maxLines={1}>
                {report.reporter} · {report.reportedAt}
              </Text>
              {report.screenshots > 0 && (
                <HStack gap={0.5} vAlign="center">
                  <Icon icon={PaperclipIcon} size="sm" color="secondary" />
                  <Text
                    type="supporting"
                    color="secondary"
                    hasTabularNumbers>
                    {report.screenshots}
                  </Text>
                </HStack>
              )}
            </HStack>
          </VStack>
        </StackItem>
        <Badge
          label={STATUS_META[status].label}
          variant={STATUS_META[status].variant}
        />
        {owner != null && <Avatar name={owner} size="small" />}
      </HStack>
    </SelectableCard>
  );
}

// ============= DETAIL PANEL =============

function ReportDetail({
  report,
  status,
  owner,
  onStatusChange,
  onAssignToMe,
}: {
  report: FeedbackReport;
  status: Status;
  owner: string | null;
  onStatusChange: (id: string, status: Status) => void;
  onAssignToMe: (id: string) => void;
}) {
  const category = CATEGORY_META[report.category];
  const isMine = owner === CURRENT_USER;
  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Badge label={category.label} variant={category.variant} />
          <Badge
            label={STATUS_META[status].label}
            variant={STATUS_META[status].variant}
          />
        </HStack>
        <Text type="supporting" color="secondary">
          {report.reporter} · {report.reportedAt}
        </Text>
      </VStack>

      <Text size="sm">{report.fullText}</Text>

      <HStack gap={2} vAlign="center">
        <Text type="label" size="sm" color="secondary">
          Session
        </Text>
        <Link as="button" type="code" size="sm" onClick={() => {}}>
          {report.sessionId}
        </Link>
      </HStack>

      {report.screenshots > 0 && (
        <VStack gap={2}>
          <Text type="label" size="sm" color="secondary">
            Screenshots ({report.screenshots})
          </Text>
          <HStack gap={2} style={styles.detailThumbRow}>
            {Array.from({length: report.screenshots}, (_, index) => (
              <Thumbnail
                key={index}
                label={`screenshot-${index + 1}.png`}
                onClick={() => {}}
              />
            ))}
          </HStack>
        </VStack>
      )}

      <Divider />

      <VStack gap={2}>
        <Selector
          label="Status"
          size="sm"
          options={STATUS_EDIT_OPTIONS}
          value={status}
          onChange={next => onStatusChange(report.id, next as Status)}
        />
        <HStack gap={2} vAlign="center">
          <Button
            label={isMine ? 'Assigned to you' : 'Assign to me'}
            variant="secondary"
            size="sm"
            icon={<Icon icon={UserRoundPlusIcon} size="sm" color="inherit" />}
            isDisabled={isMine}
            onClick={() => onAssignToMe(report.id)}
          />
          {owner != null && !isMine && (
            <HStack gap={1} vAlign="center">
              <Avatar name={owner} size="small" />
              <Text type="supporting" color="secondary">
                {owner} is on it
              </Text>
            </HStack>
          )}
        </HStack>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary">
          Activity
        </Text>
        <VStack gap={2}>
          {report.activity.map((entry, index) => (
            <HStack key={index} gap={2} vAlign="start">
              <div style={styles.activityTime}>
                <Text
                  type="supporting"
                  size="sm"
                  color="secondary"
                  hasTabularNumbers>
                  {entry.at}
                </Text>
              </div>
              <StackItem size="fill">
                <Text type="supporting" size="sm">
                  {entry.text}
                </Text>
              </StackItem>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function AgentFeedbackTriageTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 880;

  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>('fr-01');
  // Triage edits layered over the fixtures: status + owner overrides.
  const [statusById, setStatusById] = useState<Record<string, Status>>({});
  const [ownerById, setOwnerById] = useState<Record<string, string | null>>(
    {},
  );

  const statusOf = (report: FeedbackReport): Status =>
    statusById[report.id] ?? report.status;
  const ownerOf = (report: FeedbackReport): string | null =>
    report.id in ownerById ? ownerById[report.id] : report.owner;

  const toggleCategory = (category: Category, isPressed: boolean) => {
    setActiveCategories(prev =>
      isPressed
        ? [...prev, category]
        : prev.filter(item => item !== category),
    );
  };

  const visibleReports = REPORTS.filter(report => {
    if (
      activeCategories.length > 0 &&
      !activeCategories.includes(report.category)
    ) {
      return false;
    }
    if (statusFilter !== 'all' && statusOf(report) !== statusFilter) {
      return false;
    }
    return true;
  });

  const selectedReport =
    visibleReports.find(report => report.id === selectedId) ?? null;

  const openCount = REPORTS.filter(
    report => statusOf(report) === 'open',
  ).length;

  const handleSelect = (id: string, isSelected: boolean) => {
    setSelectedId(isSelected ? id : null);
  };

  const handleStatusChange = (id: string, status: Status) => {
    setStatusById(prev => ({...prev, [id]: status}));
  };

  const handleAssignToMe = (id: string) => {
    setOwnerById(prev => ({...prev, [id]: CURRENT_USER}));
  };

  const filterRow = (
    <VStack gap={2}>
      <HStack gap={1} style={styles.chipRow}>
        {CATEGORY_ORDER.map(category => (
          <ToggleButton
            key={category}
            label={`${CATEGORY_META[category].label} · ${CATEGORY_COUNTS[category]}`}
            size="sm"
            isPressed={activeCategories.includes(category)}
            onPressedChange={isPressed => toggleCategory(category, isPressed)}
          />
        ))}
      </HStack>
      <HStack gap={2} vAlign="center">
        <Selector
          label="Filter by status"
          isLabelHidden
          size="sm"
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {visibleReports.length} of {REPORTS.length} reports
        </Text>
      </HStack>
    </VStack>
  );

  const reportList = (
    <VStack gap={2} style={styles.reportList}>
      {visibleReports.map(report => (
        <ReportRow
          key={report.id}
          report={report}
          status={statusOf(report)}
          owner={ownerOf(report)}
          isSelected={report.id === selectedId}
          onSelect={handleSelect}
        />
      ))}
      {visibleReports.length === 0 && (
        <div style={styles.emptyCard}>
          <Text type="supporting" color="secondary">
            No reports match the current filters.
          </Text>
        </div>
      )}
    </VStack>
  );

  const detail =
    selectedReport != null ? (
      <ReportDetail
        report={selectedReport}
        status={statusOf(selectedReport)}
        owner={ownerOf(selectedReport)}
        onStatusChange={handleStatusChange}
        onAssignToMe={handleAssignToMe}
      />
    ) : (
      <Text type="supporting" color="secondary">
        Select a report to see its details.
      </Text>
    );

  return (
    <div ref={wrapRef} style={styles.pageWrap}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={4} vAlign="center">
              <StackItem size="fill" style={styles.headerMeta}>
                <VStack gap={0.5}>
                  <Heading level={1}>User feedback</Heading>
                  <Text
                    type="supporting"
                    color="secondary"
                    hasTabularNumbers>
                    {REPORTS.length} reports this week · {openCount} open ·
                    updated 2m ago
                  </Text>
                </VStack>
              </StackItem>
              {!isCompact && <DailyCountChart />}
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent role="main">
            <VStack gap={4}>
              {filterRow}
              {reportList}
              {isCompact && selectedReport != null && (
                <div style={styles.compactDetail}>
                  <Card padding={4}>{detail}</Card>
                </div>
              )}
            </VStack>
          </LayoutContent>
        }
        end={
          !isCompact ? (
            <LayoutPanel hasDivider width={360} label="Report details">
              {detail}
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
