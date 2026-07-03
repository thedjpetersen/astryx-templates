// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (four assistant automation jobs with
 *   fixed cron/interval/one-shot schedules, run health counters, owner and
 *   delivery flags, and an instructions version history)
 * @output Scheduled Jobs manager in a list + detail frame: header count
 *   summary ("4 jobs · 3 active · 1 with errors") with a Personal/Workspace
 *   SegmentedControl and a workspace Selector; job rows carry a StatusDot
 *   enable toggle (hollow ring when disabled), inline owner/one-shot/
 *   silent/"N skipped" Badges, a schedule line with a kind icon and next-run
 *   copy, an error Tooltip on the amber warning glyph, and a hover delete
 *   guarded by AlertDialog; the detail panel shows a MetadataList grid with
 *   a mono cron Code chip, an Execution History block with consecutive
 *   error/skip counts, and an instructions editor with a live autosave
 *   FieldStatus plus a Collapsible version history with restore links
 * @position Page template; emitted by `astryx template scheduled-jobs-manager`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * colored count summary, scope SegmentedControl, workspace Selector, and a
 * "Dashboard" chip link). LayoutContent scrolls a max-w-2xl (672px) column
 * of job rows sorted enabled-first, disabled rows at 60% opacity. The end
 * LayoutPanel (~440px, scrollable) inspects the selected job — sections:
 * header badges, MetadataList, Execution History, Instructions editor,
 * Version history.
 *
 * Responsive contract:
 * - > 1024px: header | rows (fill) | detail panel 440.
 * - <= 1024px: the detail panel leaves the `end` slot and stacks below the
 *   list inside LayoutContent (divider between), so rows keep full width.
 * - Row second lines (schedule + next run) truncate with maxLines; the
 *   toggle/warning/delete cluster never wraps or shrinks.
 * - <= 640px: the enable toggle's hit box grows from 24px to 40px for
 *   touch; the painted StatusDot/hollow ring inside stays 8px.
 * - AlertDialog appears via interaction: the hover delete button on any row
 *   opens it before the job is removed.
 */

import {useRef, useState, type CSSProperties} from 'react';

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
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Code} from '@astryxdesign/core/Code';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CalendarIcon,
  ClockIcon,
  LayoutDashboardIcon,
  MessagesSquareIcon,
  TimerIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // max-w-2xl job column, centered in the remaining space next to the panel.
  listColumn: {
    width: '100%',
    maxWidth: 672,
    marginInline: 'auto',
  },
  // One job row: rounded hit area; hover state handled via mouse-enter
  // state so the delete affordance can fade in without layout shift.
  row: {
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    cursor: 'pointer',
  },
  rowSelected: {
    backgroundColor: 'var(--color-background-muted)',
  },
  rowDisabled: {
    opacity: 0.6,
  },
  // The enable toggle is a bare button so the StatusDot stays the visual.
  dotButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    flexShrink: 0,
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
  },
  // <=640px: grow the toggle's hit box to 40px for thumbs (the 24px box is
  // fine for pointers); the painted dot/ring inside stays 8px so the row
  // reads the same.
  dotButtonTouch: {
    width: 40,
    height: 40,
  },
  // Hollow ring = disabled job (filled StatusDot = enabled).
  hollowDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    border: '2px solid var(--color-border-emphasized)',
    backgroundColor: 'transparent',
  },
  // Second line + name cell need minWidth 0 so truncation works in flex.
  truncateCell: {minWidth: 0},
  badgeCluster: {flexWrap: 'wrap'},
  deleteHidden: {opacity: 0, pointerEvents: 'none'},
  deleteShown: {opacity: 1},
  warningGlyph: {display: 'inline-flex', cursor: 'default'},
  // Detail panel scrolls independently of the row list.
  detail: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  detailStacked: {
    padding: 'var(--spacing-4)',
    maxWidth: 672,
    marginInline: 'auto',
    width: '100%',
  },
  lastErrorBox: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  countActive: {color: 'var(--color-text-green)'},
  countErrors: {color: 'var(--color-text-yellow)'},
  errorText: {color: 'var(--color-text-red)'},
  skipText: {color: 'var(--color-text-yellow)'},
  headerRow: {flexWrap: 'wrap'},
};

// ============= DATA =============
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.
// "Next: in 2 hours" style strings are fixture copy, not live math.

type ScheduleKind = 'cron' | 'interval' | 'once';

interface JobVersion {
  id: string;
  label: string;
  savedAt: string;
  instructions: string;
}

interface LastRun {
  at: string;
  status: 'success' | 'error';
  error?: string;
}

interface ScheduledJob {
  id: string;
  name: string;
  kind: ScheduleKind;
  scheduleLabel: string;
  cron?: string;
  timezone: string;
  isEnabled: boolean;
  /** 'you' for the viewer's own jobs; otherwise the owner's email. */
  owner: string;
  /** Short owner badge shown on rows for jobs the viewer doesn't own. */
  ownerBadge?: string;
  isOneShot: boolean;
  isSilent: boolean;
  nextRunLabel: string;
  announceMode: string;
  instructions: string;
  createdAt: string;
  lastRun?: LastRun;
  consecutiveErrors: number;
  consecutiveSkips: number;
  versions: JobVersion[];
}

const INITIAL_JOBS: ScheduledJob[] = [
  {
    id: 'job-triage',
    name: 'Morning inbox triage',
    kind: 'cron',
    scheduleLabel: 'Daily at 9:00 AM',
    cron: '0 9 * * *',
    timezone: 'America/New_York',
    isEnabled: true,
    owner: 'you',
    isOneShot: false,
    isSilent: false,
    nextRunLabel: 'Next: in 2 hours',
    announceMode: 'Announce in chat',
    instructions: 'Summarize unread emails and flag anything urgent.',
    createdAt: '2026-05-04T13:00:00Z',
    lastRun: {at: '2026-07-01T13:00:12Z', status: 'success'},
    consecutiveErrors: 0,
    consecutiveSkips: 0,
    versions: [],
  },
  {
    id: 'job-build-watch',
    name: 'Hourly build watch',
    kind: 'interval',
    scheduleLabel: 'Every 60 min',
    timezone: 'UTC',
    isEnabled: false,
    owner: 'you',
    isOneShot: false,
    isSilent: false,
    nextRunLabel: 'No future runs',
    announceMode: 'Announce in chat',
    instructions:
      'Check the release pipeline; ping me only if a build has been red ' +
      'for more than two consecutive runs.',
    createdAt: '2026-05-20T09:30:00Z',
    lastRun: {at: '2026-06-28T16:00:03Z', status: 'success'},
    consecutiveErrors: 0,
    consecutiveSkips: 0,
    versions: [],
  },
  {
    id: 'job-standup',
    name: 'Standup summary',
    kind: 'cron',
    scheduleLabel: 'Weekdays at 9:15 AM',
    cron: '15 9 * * 1-5',
    timezone: 'America/New_York',
    isEnabled: true,
    owner: 'dana@meta.com',
    ownerBadge: 'dana',
    isOneShot: false,
    isSilent: false,
    nextRunLabel: 'Next: tomorrow at 9:15 AM',
    announceMode: 'Announce in chat',
    instructions:
      "Summarize this morning's standup thread, call out blockers, and " +
      'assign follow-ups to owners.',
    createdAt: '2026-06-12T14:05:00Z',
    lastRun: {
      at: '2026-07-01T13:15:41Z',
      status: 'error',
      error: 'Session timed out after 300s',
    },
    consecutiveErrors: 3,
    consecutiveSkips: 2,
    versions: [
      {
        id: 'v3',
        label: 'v3',
        savedAt: '2026-06-25T15:22:00Z',
        instructions: "Summarize yesterday's standup thread",
      },
      {
        id: 'v2',
        label: 'v2',
        savedAt: '2026-06-18T10:41:00Z',
        instructions: 'Summarize the standup thread and list open questions',
      },
      {
        id: 'v1',
        label: 'v1',
        savedAt: '2026-06-12T14:05:00Z',
        instructions: 'Post a recap of standup to the channel',
      },
    ],
  },
  {
    id: 'job-launch-reminder',
    name: 'Send launch reminder',
    kind: 'once',
    scheduleLabel: 'Once on Jul 3, 2026, 2:00 PM UTC',
    timezone: 'UTC',
    isEnabled: true,
    owner: 'sam@meta.com',
    ownerBadge: 'sam',
    isOneShot: true,
    isSilent: true,
    nextRunLabel: 'Next: tomorrow at 2:00 PM',
    announceMode: 'Silent — no announcement',
    instructions:
      'Remind #launch-room that the go/no-go call starts in one hour, ' +
      'with the checklist link.',
    createdAt: '2026-06-29T18:12:00Z',
    consecutiveErrors: 0,
    consecutiveSkips: 0,
    versions: [],
  },
];

const KIND_ICON: Record<ScheduleKind, typeof ClockIcon> = {
  cron: ClockIcon,
  interval: TimerIcon,
  once: CalendarIcon,
};

const WORKSPACE_OPTIONS = [
  {value: 'ops-team', label: 'Ops Team'},
  {value: 'growth', label: 'Growth'},
  {value: 'platform', label: 'Platform'},
];

type SaveState = 'saved' | 'saving';

// ============= JOB ROW =============

function JobRow({
  job,
  isSelected,
  isTouch,
  onSelect,
  onToggle,
  onDeleteRequest,
}: {
  job: ScheduledJob;
  isSelected: boolean;
  /** <=640px: the enable toggle grows to a 40px touch hit box. */
  isTouch: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const hasErrors = job.consecutiveErrors > 0;

  return (
    <div
      style={{
        ...styles.row,
        ...(isSelected ? styles.rowSelected : undefined),
        ...(job.isEnabled ? undefined : styles.rowDisabled),
      }}
      onClick={() => onSelect(job.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <HStack gap={3} vAlign="center">
        {/* Enable toggle: filled StatusDot when enabled, hollow ring when
            disabled. Toggling resorts the list (enabled-first). */}
        <button
          type="button"
          style={{
            ...styles.dotButton,
            ...(isTouch ? styles.dotButtonTouch : undefined),
          }}
          aria-label={
            job.isEnabled ? `Disable ${job.name}` : `Enable ${job.name}`
          }
          aria-pressed={job.isEnabled}
          onClick={event => {
            event.stopPropagation();
            onToggle(job.id);
          }}>
          {job.isEnabled ? (
            <StatusDot
              variant={hasErrors ? 'warning' : 'success'}
              label={hasErrors ? 'Enabled, failing' : 'Enabled'}
            />
          ) : (
            <span style={styles.hollowDot} aria-hidden />
          )}
        </button>

        <StackItem size="fill" style={styles.truncateCell}>
          <VStack gap={1}>
            <HStack gap={2} vAlign="center" style={styles.badgeCluster}>
              <Text type="label" maxLines={1}>
                {job.name}
              </Text>
              {job.ownerBadge != null && (
                <Badge label={job.ownerBadge} variant="blue" />
              )}
              {job.isOneShot && <Badge label="one-shot" variant="neutral" />}
              {job.isSilent && <Badge label="silent" variant="neutral" />}
              {job.consecutiveSkips > 0 && (
                <Badge
                  label={`${job.consecutiveSkips} skipped`}
                  variant="warning"
                />
              )}
            </HStack>
            <HStack gap={2} vAlign="center">
              <Icon icon={KIND_ICON[job.kind]} size="sm" color="secondary" />
              <StackItem size="fill" style={styles.truncateCell}>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {job.scheduleLabel} · {job.nextRunLabel}
                </Text>
              </StackItem>
            </HStack>
          </VStack>
        </StackItem>

        {/* Amber warning glyph with the last error in a Tooltip. */}
        {hasErrors && job.lastRun?.error != null && (
          <Tooltip
            content={`${job.consecutiveErrors} consecutive errors · ${job.lastRun.error}`}>
            <span style={styles.warningGlyph}>
              <Icon icon={TriangleAlertIcon} size="sm" color="warning" />
            </span>
          </Tooltip>
        )}

        {/* Hover delete: fades in without shifting the row; the actual
            removal is guarded by the page-level AlertDialog. */}
        <div
          style={
            isHovered || isSelected ? styles.deleteShown : styles.deleteHidden
          }>
          <IconButton
            label={`Delete ${job.name}`}
            tooltip="Delete job"
            icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={event => {
              event.stopPropagation();
              onDeleteRequest(job.id);
            }}
          />
        </div>
      </HStack>
    </div>
  );
}

// ============= DETAIL PANEL =============

function ExecutionHistory({job}: {job: ScheduledJob}) {
  return (
    <VStack gap={2}>
      <Heading level={3}>Execution history</Heading>
      {job.lastRun == null ? (
        <Text type="supporting" color="secondary">
          No runs yet — first run is scheduled.
        </Text>
      ) : (
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Last run —
            </Text>
            <Badge
              label={job.lastRun.status}
              variant={job.lastRun.status === 'error' ? 'error' : 'success'}
            />
            <Timestamp
              value={job.lastRun.at}
              format="date_time"
              color="secondary"
            />
          </HStack>
          {job.lastRun.error != null && (
            <div style={styles.lastErrorBox}>
              <Text type="supporting" style={styles.errorText}>
                {job.lastRun.error}
              </Text>
            </div>
          )}
          {job.consecutiveErrors > 0 && (
            <Text type="supporting" style={styles.errorText}>
              Errors: {job.consecutiveErrors} consecutive
            </Text>
          )}
          {job.consecutiveSkips > 0 && (
            <Text type="supporting" style={styles.skipText}>
              Skips: {job.consecutiveSkips} consecutive (schedule fired while
              a previous run was still active)
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );
}

function JobDetail({
  job,
  saveState,
  onInstructionsChange,
  onRestore,
}: {
  job: ScheduledJob;
  saveState: SaveState;
  onInstructionsChange: (id: string, value: string) => void;
  onRestore: (id: string, version: JobVersion) => void;
}) {
  return (
    <VStack gap={4}>
      {/* Header: enable state, name, badge cluster. */}
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          {job.isEnabled ? (
            <StatusDot
              variant={job.consecutiveErrors > 0 ? 'warning' : 'success'}
              label={job.consecutiveErrors > 0 ? 'Enabled, failing' : 'Enabled'}
            />
          ) : (
            <span style={styles.hollowDot} aria-hidden />
          )}
          <Heading level={2}>{job.name}</Heading>
        </HStack>
        <HStack gap={2} vAlign="center" style={styles.badgeCluster}>
          {job.consecutiveErrors > 0 && (
            <Badge
              label={`${job.consecutiveErrors} consecutive errors`}
              variant="error"
            />
          )}
          {job.consecutiveSkips > 0 && (
            <Badge
              label={`${job.consecutiveSkips} skipped`}
              variant="warning"
            />
          )}
          {job.isOneShot && <Badge label="one-shot" variant="neutral" />}
          {job.isSilent && <Badge label="silent" variant="neutral" />}
        </HStack>
      </VStack>

      <Divider />

      <MetadataList columns={2} label={{position: 'top'}}>
        <MetadataListItem label="Owner">
          <Text type="body">{job.owner === 'you' ? 'You' : job.owner}</Text>
        </MetadataListItem>
        <MetadataListItem label="Schedule">
          <Text type="body">{job.scheduleLabel}</Text>
        </MetadataListItem>
        <MetadataListItem label="Timezone">
          <Text type="body">{job.timezone}</Text>
        </MetadataListItem>
        {job.cron != null && (
          <MetadataListItem label="Cron expression">
            <Code>{job.cron}</Code>
          </MetadataListItem>
        )}
        <MetadataListItem label="Results">
          <HStack gap={1} vAlign="center">
            <Icon
              icon={MessagesSquareIcon}
              size="sm"
              color="secondary"
            />
            <Text type="body">{job.announceMode}</Text>
          </HStack>
        </MetadataListItem>
        <MetadataListItem label="Created">
          <Timestamp value={job.createdAt} format="date" color="primary" />
        </MetadataListItem>
      </MetadataList>

      <Divider />

      <ExecutionHistory job={job} />

      <Divider />

      {/* Instructions editor with the live autosave lifecycle: edits show
          "Saving…" (Spinner) and settle on the green FieldStatus check. */}
      <VStack gap={2}>
        <Heading level={3}>Instructions</Heading>
        <TextArea
          label={`Instructions for ${job.name}`}
          isLabelHidden
          rows={4}
          value={job.instructions}
          onChange={value => onInstructionsChange(job.id, value)}
        />
        {saveState === 'saving' ? (
          <HStack gap={1} vAlign="center">
            <Spinner size="sm" aria-label="Saving instructions" />
            <Text type="supporting" color="secondary">
              Saving…
            </Text>
          </HStack>
        ) : (
          <FieldStatus type="success" variant="detached" message="Saved" />
        )}
      </VStack>

      {job.versions.length > 0 && (
        <Collapsible
          defaultIsOpen={false}
          trigger={
            <Text type="label" color="secondary">
              {job.versions.length} previous versions
            </Text>
          }>
          <VStack gap={2}>
            {job.versions.map(version => (
              <HStack key={version.id} gap={2} vAlign="center">
                <Text type="supporting" hasTabularNumbers>
                  {version.label}
                </Text>
                <Timestamp
                  value={version.savedAt}
                  format="date"
                  color="secondary"
                />
                <StackItem size="fill" style={styles.truncateCell}>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {version.instructions}
                  </Text>
                </StackItem>
                <Link
                  label={`Restore ${version.label} of ${job.name}`}
                  size="sm"
                  onClick={() => onRestore(job.id, version)}>
                  Restore
                </Link>
              </HStack>
            ))}
          </VStack>
        </Collapsible>
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function ScheduledJobsManagerPage() {
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [scope, setScope] = useState('workspace');
  const [workspace, setWorkspace] = useState('ops-team');
  const [selectedId, setSelectedId] = useState('job-standup');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  // Autosave indicator starts frozen at the green "Saved" check.
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive contract: below 1024px the detail panel stacks under the
  // list instead of occupying the `end` slot.
  const isStacked = useMediaQuery('(max-width: 1024px)');
  // <=640px: the per-row enable toggle grows to a 40px touch hit box.
  const isTouch = useMediaQuery('(max-width: 640px)');

  const scoped =
    scope === 'personal' ? jobs.filter(job => job.owner === 'you') : jobs;
  // Enabled-first, stable within each group (fixture order is creation-ish).
  const visible = [...scoped].sort(
    (a, b) => Number(b.isEnabled) - Number(a.isEnabled),
  );

  const selected = visible.find(job => job.id === selectedId) ?? null;
  const pendingDelete = jobs.find(job => job.id === pendingDeleteId) ?? null;

  const activeCount = scoped.filter(job => job.isEnabled).length;
  const errorCount = scoped.filter(job => job.consecutiveErrors > 0).length;

  const toggleJob = (id: string) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === id ? {...job, isEnabled: !job.isEnabled} : job,
      ),
    );
  };

  const confirmDelete = () => {
    if (pendingDeleteId == null) {
      return;
    }
    setJobs(prev => prev.filter(job => job.id !== pendingDeleteId));
    if (selectedId === pendingDeleteId) {
      const remaining = visible.filter(job => job.id !== pendingDeleteId);
      setSelectedId(remaining[0]?.id ?? '');
    }
    setPendingDeleteId(null);
  };

  // Live autosave: every edit flips to "Saving…" and settles on "Saved".
  const playAutosave = () => {
    setSaveState('saving');
    if (saveTimer.current != null) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => setSaveState('saved'), 900);
  };

  const changeInstructions = (id: string, value: string) => {
    setJobs(prev =>
      prev.map(job => (job.id === id ? {...job, instructions: value} : job)),
    );
    playAutosave();
  };

  const restoreVersion = (id: string, version: JobVersion) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === id ? {...job, instructions: version.instructions} : job,
      ),
    );
    playAutosave();
  };

  const selectJob = (id: string) => {
    if (id !== selectedId) {
      if (saveTimer.current != null) {
        clearTimeout(saveTimer.current);
      }
      setSaveState('saved');
    }
    setSelectedId(id);
  };

  const list = (
    <VStack gap={1} style={styles.listColumn}>
      {visible.length === 0 ? (
        <EmptyState
          title="No scheduled jobs"
          description="Ask Navi to create a scheduled job in chat."
          icon={<Icon icon={ClockIcon} size="lg" />}
        />
      ) : (
        visible.map(job => (
          <JobRow
            key={job.id}
            job={job}
            isSelected={job.id === selectedId}
            isTouch={isTouch}
            onSelect={selectJob}
            onToggle={toggleJob}
            onDeleteRequest={setPendingDeleteId}
          />
        ))
      )}
    </VStack>
  );

  const detail = selected ? (
    <JobDetail
      job={selected}
      saveState={saveState}
      onInstructionsChange={changeInstructions}
      onRestore={restoreVersion}
    />
  ) : (
    <EmptyState
      title="No job selected"
      description="Select a job to inspect its schedule, run history, and instructions."
      icon={<Icon icon={ClockIcon} size="lg" />}
      isCompact
    />
  );

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" style={styles.headerRow}>
              <StackItem size="fill">
                <VStack gap={1}>
                  <Heading level={1}>Scheduled Jobs</Heading>
                  <Text type="supporting" color="secondary">
                    {scoped.length} {scoped.length === 1 ? 'job' : 'jobs'} ·{' '}
                    <span style={styles.countActive}>
                      {activeCount} active
                    </span>
                    {errorCount > 0 && (
                      <>
                        {' '}
                        ·{' '}
                        <span style={styles.countErrors}>
                          {errorCount} with errors
                        </span>
                      </>
                    )}
                  </Text>
                </VStack>
              </StackItem>
              <SegmentedControl
                label="Job scope"
                value={scope}
                onChange={setScope}
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
              <Button
                label="Dashboard"
                variant="secondary"
                size="sm"
                icon={<Icon icon={LayoutDashboardIcon} size="sm" />}
              />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            {isStacked ? (
              <VStack gap={4}>
                {list}
                <Divider />
                <div style={styles.detailStacked}>{detail}</div>
              </VStack>
            ) : (
              list
            )}
          </LayoutContent>
        }
        end={
          isStacked ? undefined : (
            <LayoutPanel width={440} padding={0} label="Job details">
              <div style={styles.detail}>{detail}</div>
            </LayoutPanel>
          )
        }
      />

      {/* Two-step destructive: row delete only lands after this confirm. */}
      <AlertDialog
        isOpen={pendingDelete != null}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setPendingDeleteId(null);
          }
        }}
        title="Delete scheduled job?"
        description={
          pendingDelete != null
            ? `"${pendingDelete.name}" and its run history will be removed. Future runs will not fire. This cannot be undone.`
            : ''
        }
        actionLabel="Delete job"
        onAction={confirmDelete}
      />
    </>
  );
}
