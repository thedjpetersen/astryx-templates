var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Scheduled & Snoozed Mail — time-grouped outbox of future sends
 *   and snooze returns.
 *
 * @input Deterministic fixtures anchored to a fixed "now" of
 *   2026-07-02T13:15:00: six scheduled sends (three today, one tomorrow,
 *   two next week), one just-sent message inside its 30-second undo
 *   window, and four snoozed threads with fixed return datetimes.
 *   Countdown strings ('in 3h 15m') are derived from the fixed anchor —
 *   no Date.now(), Math.random(), or network assets.
 * @output An outbox manager for time-shifted mail: LayoutHeader with a
 *   Scheduled/Snoozed SegmentedControl and a live '6 scheduled ·
 *   4 snoozed' count summary; LayoutContent scrolls a centered ~840px
 *   column of date-group sections ('Today · Wed, Jul 2', 'Tomorrow',
 *   'Next week'), each a group Heading over flat 72px rows (Avatar +
 *   recipient/subject/snippet + right-aligned schedule metadata with a
 *   countdown Badge). Hovering a row swaps the metadata for an action
 *   cluster: 'Send now' (removes the row, 'Sent' Toast), 'Edit
 *   schedule' (Popover with preset list + Calendar + TimeInput that
 *   rewrites the row's schedule text and regroups it), and 'Cancel
 *   send' (removes the row with a 'Moved to drafts — Undo' Toast whose
 *   Undo restores it). The top of Today carries the undo-window Banner
 *   row ('Sending in 30s — Undo'). The Snoozed tab lists threads with
 *   'Returns Mon, Jul 6 · 9:00 AM' metadata plus unsnooze and re-snooze
 *   (DropdownMenu presets) actions. Emptying any group renders an
 *   inline EmptyState.
 * @position Emitted by \`astryx template scheduled-send-outbox\`. Choose
 *   over inbox when the organizing axis is WHEN mail moves (future
 *   sends, snooze returns) rather than triaging received mail; choose
 *   over a timeline/feed when rows are actionable mail items with
 *   reschedule Popovers, not a passive event stream.
 *
 * Frame: Layout height="fill". LayoutHeader carries the title, tab
 * SegmentedControl, and count summary. LayoutContent scrolls one
 * centered column (max 840px) of date-group sections: group Heading +
 * count, then flat List rows (72px, Avatar + two-line text +
 * right-aligned schedule metadata / hover action cluster). The undo
 * Banner row sits at the top of Today.
 *
 * Container policy (outbox archetype): frame-first rows, zero Cards.
 * Date groups are Heading + List sections; the only Banner is the
 * 30-second undo window; Badges carry countdowns only.
 *
 * Responsive contract:
 * - >700px  — rows keep right-aligned schedule metadata that swaps to
 *   the Send now / Edit schedule / Cancel send cluster on hover (and
 *   stays swapped while the Edit Popover is open).
 * - <=700px — the right-aligned metadata stacks under the subject line
 *   and all row actions collapse into a MoreMenu (send now + preset
 *   reschedules + cancel; unsnooze + preset re-snoozes on Snoozed).
 * - The header tab control and counts stay pinned; only LayoutContent
 *   scrolls. Schedule times keep tabular numerals so columns of
 *   datetimes digit-align.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Calendar, type ISODateString} from '@astryxdesign/core/Calendar';
import {Divider} from '@astryxdesign/core/Divider';
import type {DropdownMenuOption} from '@astryxdesign/core/DropdownMenu';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Popover} from '@astryxdesign/core/Popover';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TimeInput, type ISOTimeString} from '@astryxdesign/core/TimeInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {useToast} from '@astryxdesign/core/Toast';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  AlarmClockIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  InboxIcon,
  MailIcon,
  MoonIcon,
  SendIcon,
  SunriseIcon,
  SunsetIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens only.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  column: {
    maxWidth: 840,
    marginInline: 'auto',
  },
  // Rows are flat 72px outbox entries — no cards.
  row: {
    minHeight: 72,
  },
  // Tabular numerals so stacked schedule times digit-align down a group.
  scheduleMeta: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  metaColumn: {
    alignItems: 'flex-end',
  },
  groupEmpty: {
    paddingBlock: 'var(--spacing-3)',
  },
  popoverBody: {
    padding: 'var(--spacing-3)',
    width: 300,
  },
};

// ---------------------------------------------------------------------------
// TIME HELPERS — everything derives from a fixed anchor, never the clock.
// ---------------------------------------------------------------------------

/** The fixed "now" every countdown and group is computed against. */
const NOW_ISO = '2026-07-02T13:15:00';
const NOW = new Date(NOW_ISO);
const MS_PER_DAY = 86_400_000;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** '2026-07-02T16:30:00' → local Date (fixed fixture strings only). */
const parseISO = (iso: string) => new Date(iso);

/** 12-hour clock label: '4:30 PM'. */
function formatTime(iso: string): string {
  const date = parseISO(iso);
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return \`\${hours12}:\${minutes} \${hours24 < 12 ? 'AM' : 'PM'}\`;
}

/** Whole-day offset from the fixed anchor (0 today, 1 tomorrow, …). */
function dayOffset(iso: string): number {
  const date = parseISO(iso);
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOf(date) - startOf(NOW)) / MS_PER_DAY);
}

type GroupId = 'today' | 'tomorrow' | 'next-week';

function groupOf(iso: string): GroupId {
  const offset = dayOffset(iso);
  if (offset <= 0) {
    return 'today';
  }
  return offset === 1 ? 'tomorrow' : 'next-week';
}

/** Schedule text: 'Sends 4:30 PM' / 'Jul 3, 8:00 AM' / 'Mon, Jul 6, 9:00 AM'. */
function scheduleLabel(iso: string): string {
  const offset = dayOffset(iso);
  const date = parseISO(iso);
  const time = formatTime(iso);
  if (offset <= 0) {
    return \`Sends \${time}\`;
  }
  const monthDay = \`\${MONTHS[date.getMonth()]} \${date.getDate()}\`;
  if (offset === 1) {
    return \`\${monthDay}, \${time}\`;
  }
  return \`\${WEEKDAYS[date.getDay()]}, \${monthDay}, \${time}\`;
}

/** Countdown Badge text: 'in 3h 15m' today, 'in 1d' / 'in 4d' beyond. */
function countdownLabel(iso: string): string {
  const offset = dayOffset(iso);
  if (offset >= 1) {
    return \`in \${offset}d\`;
  }
  const totalMinutes = Math.round(
    (parseISO(iso).getTime() - NOW.getTime()) / 60_000,
  );
  // A time earlier today (reachable via TimeInput) means "send immediately".
  if (totalMinutes <= 0) {
    return 'now';
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? \`in \${hours}h \${minutes}m\` : \`in \${minutes}m\`;
}

/** Snooze return text: 'Tomorrow · 8:00 AM' / 'Mon, Jul 6 · 9:00 AM' / 'Jul 15 · 9:00 AM'. */
function returnsLabel(iso: string): string {
  const offset = dayOffset(iso);
  const date = parseISO(iso);
  const time = formatTime(iso);
  if (offset === 1) {
    return \`Tomorrow · \${time}\`;
  }
  const monthDay = \`\${MONTHS[date.getMonth()]} \${date.getDate()}\`;
  if (offset <= 6) {
    return \`\${WEEKDAYS[date.getDay()]}, \${monthDay} · \${time}\`;
  }
  return \`\${monthDay} · \${time}\`;
}

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. The signed-in user is Mara Voss at
// Lumen Labs; all datetimes are fixed ISO strings around 2026-07-02T13:15:00.
// ---------------------------------------------------------------------------

interface ScheduledSend {
  id: string;
  /** Display recipient shown after 'To:' in the row. */
  to: string;
  /** Person/list name the Avatar initials derive from. */
  recipientName: string;
  subject: string;
  snippet: string;
  /** Fixed ISO send datetime; group + labels derive from it. */
  sendAt: string;
}

const SCHEDULED: ScheduledSend[] = [
  {
    id: 'sch-01',
    to: 'board@northwind.example',
    recipientName: 'Northwind Board',
    subject: 'Q2 metrics pre-read',
    snippet:
      'Deck and one-pager attached — NRR held at 116% and the churn spike from May fully reversed.',
    sendAt: '2026-07-02T16:30:00',
  },
  {
    id: 'sch-02',
    to: 'Priya Raman',
    recipientName: 'Priya Raman',
    subject: 'Re: onsite agenda',
    snippet:
      'Swapped the roadmap block to after lunch so the platform team can join — updated invite to follow.',
    sendAt: '2026-07-02T17:00:00',
  },
  {
    id: 'sch-05',
    to: 'press@lumenlabs.io',
    recipientName: 'Lumen Labs Press',
    subject: 'Usage explorer launch note',
    snippet:
      'Embargoed announcement copy for Thursday — quotes from Mara and the Northwind pilot numbers are final.',
    sendAt: '2026-07-02T18:45:00',
  },
  {
    id: 'sch-03',
    to: 'all-hands@lumenlabs.io',
    recipientName: 'Lumen Labs All Hands',
    subject: 'July priorities',
    snippet:
      'Three things this month: ship the usage explorer, close the Northwind renewal, and hire the two platform roles.',
    sendAt: '2026-07-03T08:00:00',
  },
  {
    id: 'sch-04',
    to: 'Dana Whitfield',
    recipientName: 'Dana Whitfield',
    subject: 'Renewal paperwork',
    snippet:
      'Countersigned order form and the updated DPA attached — legal is ready whenever you are.',
    sendAt: '2026-07-06T09:00:00',
  },
  {
    id: 'sch-06',
    to: 'Jonas Feld',
    recipientName: 'Jonas Feld',
    subject: 'Platform hiring loop',
    snippet:
      'Panel assignments for both platform roles — you have the systems deep-dive slot on Wednesday.',
    sendAt: '2026-07-08T10:00:00',
  },
];

/** The just-sent message inside its 30-second undo window. */
const UNDO_SEND = {
  to: 'Sam Okafor',
  subject: 'Standup notes',
  snippet: 'Blockers cleared on the ingest fix; demo moved to Friday.',
};

interface SnoozedThread {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  /** Fixed ISO datetime the thread returns to the inbox. */
  returnsAt: string;
}

const SNOOZED: SnoozedThread[] = [
  {
    id: 'snz-01',
    sender: 'Brightline Accounts',
    subject: 'Invoice #2214 overdue?',
    snippet:
      'Our records show invoice #2214 unpaid since June 18 — can you confirm it is in your payment run?',
    returnsAt: '2026-07-03T08:00:00',
  },
  {
    id: 'snz-02',
    sender: 'AltitudeConf Program',
    subject: 'Conference talk CFP',
    snippet:
      'Reminder: the call for proposals closes July 11. Your draft "Billing at the edge" is still unsubmitted.',
    returnsAt: '2026-07-06T09:00:00',
  },
  {
    id: 'snz-04',
    sender: 'Harbor Travel Desk',
    subject: 'Denver trip itinerary',
    snippet:
      'Your outbound flight and hotel confirmation for the July 9 platform offsite are attached.',
    returnsAt: '2026-07-08T07:30:00',
  },
  {
    id: 'snz-03',
    sender: 'Peak Fitness',
    subject: 'Gym membership renewal',
    snippet:
      'Your annual membership renews on July 20. Lock in the current rate before the price change.',
    returnsAt: '2026-07-15T09:00:00',
  },
];

/** Presets shared by Edit schedule and re-snooze. */
const PRESETS: Array<{
  id: string;
  label: string;
  detail: string;
  date: ISODateString;
  time: string;
  icon: typeof SunsetIcon;
}> = [
  {
    id: 'evening',
    label: 'This evening',
    detail: '6:00 PM',
    date: '2026-07-02',
    time: '18:00',
    icon: SunsetIcon,
  },
  {
    id: 'tomorrow',
    label: 'Tomorrow',
    detail: '8:00 AM',
    date: '2026-07-03',
    time: '08:00',
    icon: SunriseIcon,
  },
  {
    id: 'monday',
    label: 'Monday',
    detail: '9:00 AM',
    date: '2026-07-06',
    time: '09:00',
    icon: CalendarDaysIcon,
  },
];

const GROUPS: Array<{id: GroupId; heading: string; emptyText: string}> = [
  {
    id: 'today',
    heading: 'Today · Wed, Jul 2',
    emptyText: 'Nothing else goes out today.',
  },
  {
    id: 'tomorrow',
    heading: 'Tomorrow',
    emptyText: 'Nothing scheduled for tomorrow.',
  },
  {
    id: 'next-week',
    heading: 'Next week',
    emptyText: 'Nothing scheduled for next week.',
  },
];

const isoFromParts = (date: ISODateString, time: string) =>
  \`\${date}T\${time}:00\`;

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function ScheduledSendOutboxTemplate() {
  const toast = useToast();

  const [tab, setTab] = useState('scheduled');
  const [scheduled, setScheduled] = useState<ScheduledSend[]>(SCHEDULED);
  const [snoozed, setSnoozed] = useState<SnoozedThread[]>(SNOOZED);
  const [isUndoWindowOpen, setIsUndoWindowOpen] = useState(true);
  // Hover swaps a row's schedule metadata for its action cluster.
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  // Edit-schedule Popover open state, one row at a time, plus its draft.
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState<ISODateString>('2026-07-02');
  const [draftTime, setDraftTime] = useState<string | undefined>('16:30');

  // Responsive contract (see file header): metadata stacks under the
  // subject and actions collapse into a MoreMenu below 700px.
  const isNarrow = useMediaQuery('(max-width: 700px)');

  // ---- toast helpers ----

  const showUndoToast = (body: string, onUndo: () => void) => {
    let dismiss: (() => void) | undefined;
    dismiss = toast({
      body,
      endContent: (
        <Button
          label="Undo"
          size="sm"
          variant="secondary"
          icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
          onClick={() => {
            onUndo();
            dismiss?.();
          }}
        />
      ),
    });
  };

  // ---- scheduled actions ----

  const sendNow = (row: ScheduledSend) => {
    setScheduled(prev => prev.filter(item => item.id !== row.id));
    toast({body: \`Sent "\${row.subject}" to \${row.to}\`});
  };

  const cancelSend = (row: ScheduledSend) => {
    const index = scheduled.findIndex(item => item.id === row.id);
    setScheduled(prev => prev.filter(item => item.id !== row.id));
    showUndoToast(\`Moved "\${row.subject}" to drafts\`, () => {
      setScheduled(prev => {
        const next = prev.filter(item => item.id !== row.id);
        next.splice(Math.min(index, next.length), 0, row);
        return next;
      });
    });
  };

  const applySchedule = (rowId: string, date: ISODateString, time: string) => {
    const sendAt = isoFromParts(date, time);
    setScheduled(prev =>
      prev.map(item => (item.id === rowId ? {...item, sendAt} : item)),
    );
    setEditingRowId(null);
    // 'Sends 4:30 PM' → 'sends 4:30 PM'; 'Jul 3, 8:00 AM' → 'sends Jul 3, 8:00 AM'.
    const label = scheduleLabel(sendAt);
    const phrase = label.startsWith('Sends ')
      ? label.replace('Sends ', 'sends ')
      : \`sends \${label}\`;
    toast({body: \`Rescheduled — \${phrase}\`});
  };

  const openEditor = (row: ScheduledSend) => {
    setDraftDate(row.sendAt.slice(0, 10) as ISODateString);
    setDraftTime(row.sendAt.slice(11, 16));
    setEditingRowId(row.id);
  };

  const undoJustSent = () => {
    setIsUndoWindowOpen(false);
    toast({body: \`Send canceled — "\${UNDO_SEND.subject}" moved to drafts\`});
  };

  // ---- snoozed actions ----

  const unsnooze = (thread: SnoozedThread) => {
    setSnoozed(prev => prev.filter(item => item.id !== thread.id));
    toast({body: \`"\${thread.subject}" moved back to the inbox\`});
  };

  const resnooze = (thread: SnoozedThread, date: ISODateString, time: string) => {
    const returnsAt = isoFromParts(date, time);
    setSnoozed(prev =>
      prev.map(item => (item.id === thread.id ? {...item, returnsAt} : item)),
    );
    toast({body: \`Snoozed until \${returnsLabel(returnsAt)}\`});
  };

  // ---- edit-schedule popover ----

  const editContent = (row: ScheduledSend): ReactNode => (
    <div style={styles.popoverBody}>
      <VStack gap={3}>
        <VStack gap={0}>
          <Text type="supporting" color="secondary">
            Currently scheduled
          </Text>
          <Timestamp
            value={row.sendAt}
            format="date_time"
            type="body"
            color="primary"
            hasTooltip={false}
          />
        </VStack>
        <Divider />
        <List density="compact" hasDividers={false}>
          {PRESETS.map(preset => (
            <ListItem
              key={preset.id}
              label={preset.label}
              startContent={
                <Icon icon={preset.icon} size="sm" color="secondary" />
              }
              endContent={
                <Text type="supporting" color="secondary">
                  {preset.detail}
                </Text>
              }
              onClick={() => applySchedule(row.id, preset.date, preset.time)}
            />
          ))}
        </List>
        <Divider />
        <Calendar
          value={draftDate}
          onChange={value => setDraftDate(value)}
          min="2026-07-02"
          focusDate={draftDate}
        />
        <TimeInput
          label="Send time"
          size="sm"
          value={draftTime as ISOTimeString | undefined}
          onChange={value => setDraftTime(value)}
        />
        <Button
          label="Update schedule"
          variant="primary"
          size="sm"
          isDisabled={draftTime === undefined}
          onClick={() => {
            if (draftTime !== undefined) {
              applySchedule(row.id, draftDate, draftTime);
            }
          }}
        />
      </VStack>
    </div>
  );

  // ---- row renderers ----

  const scheduledMoreMenu = (row: ScheduledSend): DropdownMenuOption[] => [
    {label: 'Send now', onClick: () => sendNow(row), icon: SendIcon},
    {
      type: 'section',
      title: 'Reschedule',
      items: PRESETS.map(preset => ({
        label: \`\${preset.label} \${preset.detail}\`,
        icon: preset.icon,
        onClick: () => applySchedule(row.id, preset.date, preset.time),
      })),
    },
    {type: 'divider'},
    {label: 'Cancel send', onClick: () => cancelSend(row), icon: XIcon},
  ];

  const scheduledActions = (row: ScheduledSend) => (
    <HStack gap={1} vAlign="center">
      <Tooltip content="Skip the schedule and send immediately">
        <Button
          label="Send now"
          size="sm"
          variant="secondary"
          icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
          onClick={() => sendNow(row)}
        />
      </Tooltip>
      <Popover
        label={\`Edit schedule for "\${row.subject}"\`}
        placement="below"
        alignment="end"
        isOpen={editingRowId === row.id}
        onOpenChange={isOpen => {
          if (isOpen) {
            openEditor(row);
          } else {
            setEditingRowId(null);
          }
        }}
        content={editContent(row)}>
        <IconButton
          label="Edit schedule"
          tooltip="Edit schedule"
          size="sm"
          variant="ghost"
          icon={<Icon icon={CalendarClockIcon} size="sm" color="inherit" />}
        />
      </Popover>
      <IconButton
        label="Cancel send"
        tooltip="Cancel send — move to drafts"
        size="sm"
        variant="ghost"
        icon={<Icon icon={XIcon} size="sm" color="inherit" />}
        onClick={() => cancelSend(row)}
      />
    </HStack>
  );

  const scheduledMeta = (row: ScheduledSend) => (
    <VStack gap={1} style={styles.metaColumn}>
      <Text type="supporting" color="secondary" style={styles.scheduleMeta}>
        {scheduleLabel(row.sendAt)}
      </Text>
      <Badge
        label={countdownLabel(row.sendAt)}
        variant={groupOf(row.sendAt) === 'today' ? 'blue' : 'neutral'}
      />
    </VStack>
  );

  const renderScheduledRow = (row: ScheduledSend) => {
    const showActions = hoveredRowId === row.id || editingRowId === row.id;
    return (
      <ListItem
        key={row.id}
        style={styles.row}
        onMouseEnter={() => setHoveredRowId(row.id)}
        onMouseLeave={() =>
          setHoveredRowId(prev => (prev === row.id ? null : prev))
        }
        startContent={<Avatar name={row.recipientName} size="small" />}
        label={
          <Text type="body" weight="semibold" maxLines={1}>
            To: {row.to}
          </Text>
        }
        description={
          <VStack gap={0}>
            <Text type="supporting" color="primary" maxLines={1}>
              {row.subject}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {row.snippet}
            </Text>
            {isNarrow && (
              <HStack gap={2} vAlign="center">
                <Text
                  type="supporting"
                  color="secondary"
                  style={styles.scheduleMeta}>
                  {scheduleLabel(row.sendAt)}
                </Text>
                <Badge
                  label={countdownLabel(row.sendAt)}
                  variant={groupOf(row.sendAt) === 'today' ? 'blue' : 'neutral'}
                />
              </HStack>
            )}
          </VStack>
        }
        endContent={
          isNarrow ? (
            <MoreMenu
              label={\`Actions for "\${row.subject}"\`}
              size="sm"
              items={scheduledMoreMenu(row)}
            />
          ) : showActions ? (
            scheduledActions(row)
          ) : (
            scheduledMeta(row)
          )
        }
      />
    );
  };

  const snoozedMoreMenu = (thread: SnoozedThread): DropdownMenuOption[] => [
    {label: 'Unsnooze now', onClick: () => unsnooze(thread), icon: InboxIcon},
    {
      type: 'section',
      title: 'Snooze again until',
      items: PRESETS.map(preset => ({
        label: \`\${preset.label} \${preset.detail}\`,
        icon: preset.icon,
        onClick: () => resnooze(thread, preset.date, preset.time),
      })),
    },
  ];

  const snoozedActions = (thread: SnoozedThread) => (
    <HStack gap={1} vAlign="center">
      <Tooltip content="Return this thread to the inbox now">
        <Button
          label="Unsnooze"
          size="sm"
          variant="secondary"
          icon={<Icon icon={InboxIcon} size="sm" color="inherit" />}
          onClick={() => unsnooze(thread)}
        />
      </Tooltip>
      <DropdownMenu
        button={{
          label: 'Re-snooze',
          size: 'sm',
          variant: 'ghost',
          icon: <Icon icon={MoonIcon} size="sm" color="inherit" />,
        }}
        items={PRESETS.map(preset => ({
          label: \`\${preset.label} \${preset.detail}\`,
          icon: preset.icon,
          onClick: () => resnooze(thread, preset.date, preset.time),
        }))}
      />
    </HStack>
  );

  const snoozedMeta = (thread: SnoozedThread) => (
    <VStack gap={1} style={styles.metaColumn}>
      <HStack gap={1} vAlign="center">
        <Icon icon={AlarmClockIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary" style={styles.scheduleMeta}>
          Returns {returnsLabel(thread.returnsAt)}
        </Text>
      </HStack>
      <Badge label={countdownLabel(thread.returnsAt)} variant="neutral" />
    </VStack>
  );

  const renderSnoozedRow = (thread: SnoozedThread) => {
    const showActions = hoveredRowId === thread.id;
    return (
      <ListItem
        key={thread.id}
        style={styles.row}
        onMouseEnter={() => setHoveredRowId(thread.id)}
        onMouseLeave={() =>
          setHoveredRowId(prev => (prev === thread.id ? null : prev))
        }
        startContent={<Avatar name={thread.sender} size="small" />}
        label={
          <Text type="body" weight="semibold" maxLines={1}>
            {thread.sender}
          </Text>
        }
        description={
          <VStack gap={0}>
            <Text type="supporting" color="primary" maxLines={1}>
              {thread.subject}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {thread.snippet}
            </Text>
            {isNarrow && (
              <HStack gap={1} vAlign="center">
                <Icon icon={AlarmClockIcon} size="sm" color="secondary" />
                <Text
                  type="supporting"
                  color="secondary"
                  style={styles.scheduleMeta}>
                  Returns {returnsLabel(thread.returnsAt)}
                </Text>
              </HStack>
            )}
          </VStack>
        }
        endContent={
          isNarrow ? (
            <MoreMenu
              label={\`Actions for "\${thread.subject}"\`}
              size="sm"
              items={snoozedMoreMenu(thread)}
            />
          ) : showActions ? (
            snoozedActions(thread)
          ) : (
            snoozedMeta(thread)
          )
        }
      />
    );
  };

  // ---- tab bodies ----

  const undoBanner = (
    <Banner
      status="info"
      icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
      title={\`Sending in 30s — "\${UNDO_SEND.subject}" to \${UNDO_SEND.to}\`}
      description={UNDO_SEND.snippet}
      endContent={
        <Button
          label="Undo"
          size="sm"
          variant="secondary"
          icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
          onClick={undoJustSent}
        />
      }
    />
  );

  const scheduledBody = (
    <VStack gap={5}>
      {GROUPS.map(group => {
        const rows = scheduled.filter(row => groupOf(row.sendAt) === group.id);
        const hasUndoRow = group.id === 'today' && isUndoWindowOpen;
        return (
          <VStack key={group.id} gap={2}>
            <HStack gap={2} vAlign="center">
              <Heading level={2}>{group.heading}</Heading>
              <Text type="supporting" color="secondary">
                {rows.length} {rows.length === 1 ? 'send' : 'sends'}
              </Text>
            </HStack>
            {hasUndoRow && undoBanner}
            {rows.length === 0 && !hasUndoRow ? (
              <div style={styles.groupEmpty}>
                <EmptyState
                  isCompact
                  icon={<Icon icon={MailIcon} size="lg" />}
                  title="No scheduled sends"
                  description={group.emptyText}
                />
              </div>
            ) : (
              rows.length > 0 && (
                <List density="compact" hasDividers>
                  {rows.map(renderScheduledRow)}
                </List>
              )
            )}
          </VStack>
        );
      })}
    </VStack>
  );

  const snoozedBody = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Heading level={2}>Snoozed threads</Heading>
        <Text type="supporting" color="secondary">
          {snoozed.length} {snoozed.length === 1 ? 'thread' : 'threads'}
        </Text>
      </HStack>
      {snoozed.length === 0 ? (
        <div style={styles.groupEmpty}>
          <EmptyState
            isCompact
            icon={<Icon icon={MoonIcon} size="lg" />}
            title="Nothing is snoozed"
            description="Threads you snooze will wait here until their return time."
          />
        </div>
      ) : (
        <List density="compact" hasDividers>
          {snoozed.map(renderSnoozedRow)}
        </List>
      )}
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Scheduled & snoozed</Heading>
                {!isNarrow && (
                  <Text type="supporting" color="secondary">
                    {scheduled.length} scheduled · {snoozed.length} snoozed
                  </Text>
                )}
              </HStack>
            </StackItem>
            <SegmentedControl
              label="Outbox view"
              value={tab}
              onChange={setTab}
              size="sm">
              <SegmentedControlItem value="scheduled" label="Scheduled" />
              <SegmentedControlItem value="snoozed" label="Snoozed" />
            </SegmentedControl>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={4} role="main" label="Scheduled and snoozed mail">
          <div style={styles.column}>
            {tab === 'scheduled' ? scheduledBody : snoozedBody}
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};