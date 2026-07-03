// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one contact — Elena Marsh, VP of
 *   Operations at Northwind Logistics, owned by Marcus Webb — with 10
 *   editable field values across three groups, a 12-entry mixed activity
 *   history of 3 notes, 3 calls, 3 emails, and 3 tasks with fixed ISO
 *   timestamps between 2026-06-05T09:20:00Z and 2026-07-01T15:40:00Z, 2 open
 *   deals worth $86,000 and $24,500, and a 5-fact company profile)
 * @output CRM contact record: a header with back IconButton, Avatar,
 *   name/title/company line, a star ToggleButton, an owner chip, a lifecycle
 *   Badge, and a clickable Lead → MQL → Opportunity → Customer stepper whose
 *   advance/rewind updates the Badge AND auto-logs a stage-change entry into
 *   the timeline; a left 300px panel of inline-editable field groups
 *   (email/phone/title, segment Selector, custom properties) each with
 *   pencil-edit and Save/Cancel affordances; a center column holding a
 *   Note|Call|Email|Task TabList composer — each tab carries type-specific
 *   inputs and submitting prepends a correctly typed and iconed timeline
 *   entry stamped 2026-07-02T16:45:00Z — above a filterable activity
 *   timeline (All/Notes/Calls/Emails/Tasks/Stages ToggleButton chips with
 *   live counts) where task entries carry CheckboxInputs that strike the
 *   title when done; and a right 300px rail with an open-tasks counter that
 *   tracks those checkboxes, two open-deal cards with stage ProgressBars and
 *   a derived pipeline total, and a company MetadataList
 * @position Page template; emitted by `astryx template crm-contact-record`
 *
 * Frame: Layout height="fill". LayoutHeader carries the contact identity row
 * and the lifecycle stepper; LayoutPanel start 300 hosts the editable field
 * groups; LayoutContent scrolls the composer + timeline column (maxWidth
 * 720); LayoutPanel end 300 hosts deals, open-task count, and company info.
 * Choose over issue-detail when the record is a PERSON with lifecycle state
 * and logged touchpoints, not a ticket with sub-tasks and CI; choose over
 * profile-page when fields must edit inline and activity must be authored,
 * not just read.
 *
 * Interaction contract (all useState, no dead buttons):
 * - Stepper clicks advance OR rewind the stage: the header Badge swaps and a
 *   stage-change entry is prepended to the timeline automatically.
 * - The composer's four tabs submit real entries — note body, call outcome +
 *   notes, email subject + body, task title + due — each prepending a typed,
 *   iconed row with the fixed literal timestamp at the top of the feed.
 * - Left-column fields edit inline (pencil → input + Save/Cancel); saved
 *   values persist on the surface, Cancel restores the prior value.
 * - Filter chips genuinely filter the timeline and show live per-type counts.
 * - Checking a task entry strikes its title and updates the right-rail
 *   open-tasks Stat; newly composed tasks join that count immediately.
 * - The header star toggle persists and the owner/lifecycle chips track it.
 *
 * Responsive contract:
 * - >960px: fields panel 300 (fixed, scrolls) | timeline column (fill,
 *   scrolls) | deals rail 300 (fixed, scrolls). Only the three regions
 *   scroll internally.
 * - <=960px: both panels leave the edges and become single-pane Collapsible
 *   Cards inside the column — "Contact details" above the composer and
 *   "Deals & company" below it, both closed by default so the composer and
 *   timeline stay above the fold; the collapsed triggers surface the open
 *   deal count and open-task count so nothing is hidden silently.
 * - <=640px: the header identity row wraps and the stepper swaps from the
 *   four-button rail to a full-width Selector (same options, same
 *   stage-change logging); composer action buttons stretch full width;
 *   filter chips wrap onto multiple rows instead of clipping.
 * - Tap targets stay ~40px at every width: stepper Buttons/Selector, tab
 *   controls, md inputs, Save/Cancel Buttons, task CheckboxInputs, and chip
 *   ToggleButtons are all md/sm-with-padding controls; nothing is
 *   hover-only — every Tooltip annotates a focusable control and every icon
 *   meaning is mirrored in visible text or a Badge.
 * - Wide content is contained: entry titles and field values truncate inside
 *   minWidth:0 cells, entry bodies wrap with overflowWrap:anywhere, and the
 *   deal amount keeps tabular numerals so cards never jitter.
 *
 * Container policy (record-detail archetype): page chrome is frame-first
 * rows; field groups and deals render as Cards because each is a bounded
 * object; timeline entries are plain icon rows inside one column so the feed
 * scans as history, with only the composer carded to read as an input
 * surface. Fixture policy: fixed data only — no clocks, randomness, or
 * network assets; everything appended at runtime uses the fixed literal
 * timestamp 2026-07-02T16:45:00Z.
 */

import {useState, type CSSProperties} from 'react';

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
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon, type IconType} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  Building2Icon,
  CheckIcon,
  ChevronRightIcon,
  CircleDollarSignIcon,
  FlagIcon,
  ListChecksIcon,
  MailIcon,
  PanelRightIcon,
  PencilIcon,
  PhoneIcon,
  SendIcon,
  StarIcon,
  StickyNoteIcon,
  TargetIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';

// Back chevron comes from Icon's built-in semantic registry ('chevronLeft').

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered scrolling timeline column inside LayoutContent.
  column: {
    maxWidth: 720,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-4)',
  },
  // Side panels are fixed at 300px; only their inner stacks scroll.
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  headerWrap: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // <=640px: the stepper Selector takes its own full-width row.
  stepperRow: {width: '100%'},
  chipWrap: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  metaWrap: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  // minWidth 0 lets entry titles and field values truncate, not overflow.
  truncateCell: {minWidth: 0},
  // Timeline entry icon in a muted circle so the feed scans as history.
  entryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  entryBody: {whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'},
  doneTitle: {
    textDecoration: 'line-through',
    opacity: 0.6,
  },
  timestampCell: {whiteSpace: 'nowrap'},
  // Gradient placeholder monogram for the company — no network images.
  companyMark: {
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-container)',
    background:
      'linear-gradient(135deg, var(--color-background-accent, #4f46e5), ' +
      'var(--color-background-muted))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#fff',
    fontWeight: 700,
  },
};

// ============= LIFECYCLE VOCABULARY =============

type StageId = 'lead' | 'mql' | 'opportunity' | 'customer';

interface StageDef {
  id: StageId;
  label: string;
  badge: BadgeVariant;
}

const STAGES: StageDef[] = [
  {id: 'lead', label: 'Lead', badge: 'neutral'},
  {id: 'mql', label: 'MQL', badge: 'blue'},
  {id: 'opportunity', label: 'Opportunity', badge: 'orange'},
  {id: 'customer', label: 'Customer', badge: 'green'},
];

const stageById = (id: StageId): StageDef =>
  STAGES.find(stage => stage.id === id) ?? STAGES[0];

const stageIndex = (id: StageId): number =>
  STAGES.findIndex(stage => stage.id === id);

// ============= CONTACT FIXTURES =============
// Deterministic fixtures: fixed ids, values, and ISO timestamps. No clocks,
// no randomness, no network assets.

const CONTACT_NAME = 'Elena Marsh';
const CONTACT_TITLE = 'VP of Operations';
const COMPANY_NAME = 'Northwind Logistics';
const OWNER_NAME = 'Marcus Webb';
const CURRENT_USER = 'Marcus Webb';
const INITIAL_STAGE: StageId = 'opportunity';
// Fixed literal timestamp for everything appended at runtime.
const NOW_TIMESTAMP = '2026-07-02T16:45:00Z';

// ============= EDITABLE FIELD GROUPS =============

interface FieldDef {
  id: string;
  label: string;
  kind: 'text' | 'segment';
}

interface FieldGroup {
  id: string;
  title: string;
  icon: IconType;
  fields: FieldDef[];
}

const FIELD_GROUPS: FieldGroup[] = [
  {
    id: 'group-contact',
    title: 'Contact details',
    icon: UserIcon,
    fields: [
      {id: 'email', label: 'Email', kind: 'text'},
      {id: 'phone', label: 'Phone', kind: 'text'},
      {id: 'job-title', label: 'Job title', kind: 'text'},
    ],
  },
  {
    id: 'group-segmentation',
    title: 'Segmentation',
    icon: TargetIcon,
    fields: [
      {id: 'segment', label: 'Segment', kind: 'segment'},
      {id: 'region', label: 'Region', kind: 'text'},
      {id: 'lead-source', label: 'Lead source', kind: 'text'},
    ],
  },
  {
    id: 'group-custom',
    title: 'Custom properties',
    icon: FlagIcon,
    fields: [
      {id: 'plan-tier', label: 'Plan tier', kind: 'text'},
      {id: 'renewal-date', label: 'Renewal date', kind: 'text'},
      {id: 'nps-score', label: 'NPS score', kind: 'text'},
      {id: 'fleet-size', label: 'Fleet size', kind: 'text'},
    ],
  },
];

const INITIAL_FIELD_VALUES: Record<string, string> = {
  email: 'elena.marsh@northwind.co',
  phone: '+1 (312) 555-0164',
  'job-title': 'VP of Operations',
  segment: 'Mid-Market',
  region: 'US Central',
  'lead-source': 'Fleet Ops webinar — March 2026',
  'plan-tier': 'Growth (trial of Scale)',
  'renewal-date': 'October 15, 2026',
  'nps-score': '8 — promoter leaning',
  'fleet-size': '140 vehicles across 6 depots',
};

const SEGMENT_OPTIONS = ['Enterprise', 'Mid-Market', 'SMB', 'Startup'];

// ============= ACTIVITY TIMELINE =============

type ActivityType = 'note' | 'call' | 'email' | 'task' | 'stage';

interface ActivityEntry {
  id: string;
  type: ActivityType;
  actor: string;
  title: string;
  body?: string;
  meta?: string;
  ts: string;
  isDone?: boolean;
}

interface ActivityTypeMeta {
  label: string;
  icon: IconType;
  badge: BadgeVariant;
}

const TYPE_META: Record<ActivityType, ActivityTypeMeta> = {
  note: {label: 'Note', icon: StickyNoteIcon, badge: 'neutral'},
  call: {label: 'Call', icon: PhoneIcon, badge: 'blue'},
  email: {label: 'Email', icon: MailIcon, badge: 'purple'},
  task: {label: 'Task', icon: ListChecksIcon, badge: 'orange'},
  stage: {label: 'Stage', icon: FlagIcon, badge: 'green'},
};

// 12 fixture entries, newest first: 3 notes + 3 calls + 3 emails + 3 tasks
// (one task already done). All timestamps fixed ISO literals.
const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: 'act-12',
    type: 'note',
    actor: 'Marcus Webb',
    title: 'logged a note',
    body:
      'Elena confirmed budget owner is the CFO. Proposal needs a 3-year ' +
      'TCO view — she called the current spreadsheet process "our biggest ' +
      'operational embarrassment."',
    ts: '2026-07-01T15:40:00Z',
  },
  {
    id: 'act-11',
    type: 'task',
    actor: 'Marcus Webb',
    title: 'Send fleet-expansion proposal with 3-year TCO breakdown',
    meta: 'Due July 8',
    ts: '2026-07-01T15:35:00Z',
    isDone: false,
  },
  {
    id: 'act-10',
    type: 'call',
    actor: 'Marcus Webb',
    title: 'logged a call',
    meta: 'Outcome: Connected',
    body:
      '32-minute discovery follow-up. Depot managers want per-route ' +
      'exception alerts; Elena will loop in IT security for the SSO review.',
    ts: '2026-06-27T14:05:00Z',
  },
  {
    id: 'act-9',
    type: 'email',
    actor: 'Elena Marsh',
    title: 'replied to an email',
    meta: 'Subject: Re: Pilot results — depot 4',
    body:
      'Pilot numbers look strong. Can you share the analytics add-on ' +
      'pricing before our ops review on the 10th?',
    ts: '2026-06-25T09:12:00Z',
  },
  {
    id: 'act-8',
    type: 'task',
    actor: 'Marcus Webb',
    title: 'Share analytics add-on pricing one-pager',
    meta: 'Due July 3',
    ts: '2026-06-25T09:30:00Z',
    isDone: false,
  },
  {
    id: 'act-7',
    type: 'email',
    actor: 'Marcus Webb',
    title: 'sent an email',
    meta: 'Subject: Pilot results — depot 4',
    body:
      'Recapped the 6-week pilot: 14% fewer missed windows, 9 hours/week ' +
      'saved on manual dispatch. Attached the full readout deck.',
    ts: '2026-06-24T16:20:00Z',
  },
  {
    id: 'act-6',
    type: 'call',
    actor: 'Marcus Webb',
    title: 'logged a call',
    meta: 'Outcome: Left voicemail',
    body: 'Tried Elena ahead of the pilot readout; left a 40-second summary.',
    ts: '2026-06-20T11:02:00Z',
  },
  {
    id: 'act-5',
    type: 'note',
    actor: 'Priya Raman',
    title: 'logged a note',
    body:
      'Solutions engineering note: Northwind runs a custom TMS; the ' +
      'integration will need the webhooks bundle from the Scale tier.',
    ts: '2026-06-17T10:45:00Z',
  },
  {
    id: 'act-4',
    type: 'task',
    actor: 'Marcus Webb',
    title: 'Set up sandbox access for depot 4 pilot team',
    meta: 'Due June 13',
    ts: '2026-06-11T08:50:00Z',
    isDone: true,
  },
  {
    id: 'act-3',
    type: 'email',
    actor: 'Marcus Webb',
    title: 'sent an email',
    meta: 'Subject: Kickoff agenda + sandbox logins',
    body:
      'Sent kickoff agenda, sandbox credentials for five pilot users, and ' +
      'the data-import checklist.',
    ts: '2026-06-10T13:15:00Z',
  },
  {
    id: 'act-2',
    type: 'call',
    actor: 'Marcus Webb',
    title: 'logged a call',
    meta: 'Outcome: Connected',
    body:
      'First discovery call, 45 minutes. Pain: manual dispatch across 6 ' +
      'depots, no exception visibility. Success metric: missed delivery ' +
      'windows under 5%.',
    ts: '2026-06-06T15:30:00Z',
  },
  {
    id: 'act-1',
    type: 'note',
    actor: 'Marcus Webb',
    title: 'logged a note',
    body:
      'Inbound from the Fleet Ops webinar. Elena asked two pricing ' +
      'questions in Q&A — routing straight to discovery, skipping nurture.',
    ts: '2026-06-05T09:20:00Z',
  },
];

type ActivityFilter = 'all' | ActivityType;

const FILTER_CHIPS: {id: ActivityFilter; label: string}[] = [
  {id: 'all', label: 'All'},
  {id: 'note', label: 'Notes'},
  {id: 'call', label: 'Calls'},
  {id: 'email', label: 'Emails'},
  {id: 'task', label: 'Tasks'},
  {id: 'stage', label: 'Stages'},
];

// ============= COMPOSER VOCABULARY =============

type ComposerTab = 'note' | 'call' | 'email' | 'task';

const CALL_OUTCOMES = ['Connected', 'Left voicemail', 'No answer'];
const TASK_DUE_OPTIONS = ['Today', 'Tomorrow', 'Next week'];

// ============= DEALS + COMPANY =============

interface Deal {
  id: string;
  name: string;
  amount: number;
  stage: string;
  stageStep: number;
  stageMax: number;
  closeDate: string;
}

const OPEN_DEALS: Deal[] = [
  {
    id: 'deal-1',
    name: 'Fleet expansion — Q3',
    amount: 86000,
    stage: 'Proposal sent',
    stageStep: 3,
    stageMax: 5,
    closeDate: 'Closes Jul 31, 2026',
  },
  {
    id: 'deal-2',
    name: 'Analytics add-on',
    amount: 24500,
    stage: 'Discovery',
    stageStep: 1,
    stageMax: 5,
    closeDate: 'Closes Aug 14, 2026',
  },
];

const COMPANY_FACTS: {label: string; value: string}[] = [
  {label: 'Domain', value: 'northwind.co'},
  {label: 'Industry', value: 'Freight & logistics'},
  {label: 'Employees', value: '850'},
  {label: 'HQ', value: 'Chicago, IL'},
  {label: 'Account tier', value: 'Mid-Market'},
];

const formatCurrency = (amount: number): string =>
  `$${amount.toLocaleString('en-US')}`;

// ============= LIFECYCLE STEPPER =============

/**
 * Clickable Lead → MQL → Opportunity → Customer rail. Completed stages wear
 * a check, the current stage is primary, future stages are ghost — clicking
 * any stage advances or rewinds. <=640px this swaps to a full-width Selector
 * with identical behavior (same onSelect, same auto-logged stage change).
 */
function LifecycleStepper({
  stage,
  isCompact,
  onSelect,
}: {
  stage: StageId;
  isCompact: boolean;
  onSelect: (next: StageId) => void;
}) {
  const currentIndex = stageIndex(stage);

  if (isCompact) {
    return (
      <div style={styles.stepperRow}>
        <Selector
          label="Lifecycle stage"
          isLabelHidden
          size="md"
          width="100%"
          value={stage}
          onChange={value => onSelect(value as StageId)}
          startIcon={<Icon icon={FlagIcon} size="sm" color="secondary" />}
          options={STAGES.map(stageDef => ({
            value: stageDef.id,
            label: `Stage: ${stageDef.label}`,
          }))}
        />
      </div>
    );
  }

  return (
    <HStack gap={1} vAlign="center">
      {STAGES.map((stageDef, index) => {
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;
        return (
          <HStack key={stageDef.id} gap={1} vAlign="center">
            {index > 0 && (
              <Icon icon={ChevronRightIcon} size="xsm" color="secondary" />
            )}
            <Tooltip
              content={
                isCurrent
                  ? `Current stage: ${stageDef.label}`
                  : index > currentIndex
                    ? `Advance to ${stageDef.label}`
                    : `Move back to ${stageDef.label}`
              }>
              <Button
                label={stageDef.label}
                size="sm"
                variant={
                  isCurrent ? 'primary' : isDone ? 'secondary' : 'ghost'
                }
                icon={
                  isDone ? (
                    <Icon icon={CheckIcon} size="sm" color="inherit" />
                  ) : undefined
                }
                onClick={() => onSelect(stageDef.id)}
              />
            </Tooltip>
          </HStack>
        );
      })}
    </HStack>
  );
}

// ============= INLINE-EDITABLE FIELDS =============

function FieldRow({
  field,
  value,
  isEditing,
  draft,
  onStartEdit,
  onDraftChange,
  onSave,
  onCancel,
}: {
  field: FieldDef;
  value: string;
  isEditing: boolean;
  draft: string;
  onStartEdit: (id: string) => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (!isEditing) {
    return (
      <HStack gap={2} vAlign="center">
        <StackItem size="fill" style={styles.truncateCell}>
          <VStack gap={0}>
            <Text type="supporting" color="secondary">
              {field.label}
            </Text>
            <Tooltip content={value}>
              <Text type="body" maxLines={1}>
                {value}
              </Text>
            </Tooltip>
          </VStack>
        </StackItem>
        <IconButton
          label={`Edit ${field.label}`}
          tooltip={`Edit ${field.label}`}
          icon={<Icon icon={PencilIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          onClick={() => onStartEdit(field.id)}
        />
      </HStack>
    );
  }

  return (
    <VStack gap={2}>
      {field.kind === 'segment' ? (
        <Selector
          label={field.label}
          size="md"
          width="100%"
          value={draft}
          onChange={onDraftChange}
          options={SEGMENT_OPTIONS}
        />
      ) : (
        <TextInput
          label={field.label}
          value={draft}
          onChange={onDraftChange}
          onEnter={onSave}
        />
      )}
      <HStack gap={2} vAlign="center">
        <Button
          label="Save"
          variant="primary"
          size="sm"
          icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
          isDisabled={draft.trim().length === 0}
          onClick={onSave}
        />
        <Button
          label="Cancel"
          variant="ghost"
          size="sm"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          onClick={onCancel}
        />
      </HStack>
    </VStack>
  );
}

function FieldGroups({
  values,
  editingId,
  draft,
  onStartEdit,
  onDraftChange,
  onSave,
  onCancel,
}: {
  values: Record<string, string>;
  editingId: string | null;
  draft: string;
  onStartEdit: (id: string) => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <VStack gap={3}>
      {FIELD_GROUPS.map(group => (
        <Card key={group.id} padding={3}>
          <VStack gap={3}>
            <HStack gap={2} vAlign="center">
              <Icon icon={group.icon} size="sm" color="secondary" />
              <Heading level={3}>{group.title}</Heading>
            </HStack>
            <VStack gap={3}>
              {group.fields.map((field, index) => (
                <VStack key={field.id} gap={3}>
                  {index > 0 && <Divider />}
                  <FieldRow
                    field={field}
                    value={values[field.id] ?? ''}
                    isEditing={editingId === field.id}
                    draft={draft}
                    onStartEdit={onStartEdit}
                    onDraftChange={onDraftChange}
                    onSave={onSave}
                    onCancel={onCancel}
                  />
                </VStack>
              ))}
            </VStack>
          </VStack>
        </Card>
      ))}
    </VStack>
  );
}

// ============= RIGHT RAIL: DEALS + COMPANY =============

function DealCard({deal}: {deal: Deal}) {
  return (
    <Card padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="start">
          <Icon icon={CircleDollarSignIcon} size="sm" color="green" />
          <StackItem size="fill" style={styles.truncateCell}>
            <Text type="label" maxLines={1}>
              {deal.name}
            </Text>
          </StackItem>
          <Badge variant="blue" label={deal.stage} />
        </HStack>
        <Text type="body" weight="bold" hasTabularNumbers>
          {formatCurrency(deal.amount)}
        </Text>
        <ProgressBar
          label={`${deal.name} stage progress`}
          isLabelHidden
          value={deal.stageStep}
          max={deal.stageMax}
          variant="accent"
        />
        <Text type="supporting" color="secondary">
          Stage {deal.stageStep} of {deal.stageMax} · {deal.closeDate}
        </Text>
      </VStack>
    </Card>
  );
}

function RailContent({openTaskCount, openTaskTitles}: {
  openTaskCount: number;
  openTaskTitles: string[];
}) {
  const pipelineTotal = OPEN_DEALS.reduce(
    (sum, deal) => sum + deal.amount,
    0,
  );

  return (
    <VStack gap={4}>
      {/* Open tasks counter — tracks the timeline task checkboxes live. */}
      <Card padding={3}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon={ListChecksIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Heading level={3}>Open tasks</Heading>
            </StackItem>
            <Badge
              variant={openTaskCount > 0 ? 'orange' : 'green'}
              label={String(openTaskCount)}
            />
          </HStack>
          {openTaskCount === 0 ? (
            <Text type="supporting" color="secondary">
              All caught up — no open tasks for this contact.
            </Text>
          ) : (
            <VStack gap={1}>
              {openTaskTitles.slice(0, 3).map(title => (
                <Text
                  key={title}
                  type="supporting"
                  color="secondary"
                  maxLines={1}>
                  · {title}
                </Text>
              ))}
              {openTaskTitles.length > 3 && (
                <Text type="supporting" color="secondary">
                  +{openTaskTitles.length - 3} more in the timeline
                </Text>
              )}
            </VStack>
          )}
        </VStack>
      </Card>

      {/* Associated deals with a derived open-pipeline total. */}
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3}>Open deals</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatCurrency(pipelineTotal)} pipeline
          </Text>
        </HStack>
        {OPEN_DEALS.map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </VStack>

      {/* Company profile — gradient monogram, no network images. */}
      <Card padding={3}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <div style={styles.companyMark} aria-hidden>
              NL
            </div>
            <VStack gap={0}>
              <Heading level={3}>{COMPANY_NAME}</Heading>
              <Text type="supporting" color="secondary">
                Primary contact: {CONTACT_NAME}
              </Text>
            </VStack>
          </HStack>
          <MetadataList label={{position: 'start', width: 96}}>
            {COMPANY_FACTS.map(fact => (
              <MetadataListItem key={fact.label} label={fact.label}>
                <Text type="supporting">{fact.value}</Text>
              </MetadataListItem>
            ))}
          </MetadataList>
        </VStack>
      </Card>
    </VStack>
  );
}

// ============= TIMELINE =============

function TimelineEntryRow({
  entry,
  onToggleTask,
}: {
  entry: ActivityEntry;
  onToggleTask: (id: string, isDone: boolean) => void;
}) {
  const meta = TYPE_META[entry.type];
  const isTask = entry.type === 'task';
  const isDone = entry.isDone === true;

  return (
    <HStack gap={3} vAlign="start">
      <div style={styles.entryIconCircle}>
        <Icon icon={meta.icon} size="sm" color="secondary" />
      </div>
      <StackItem size="fill" style={styles.truncateCell}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" style={styles.metaWrap}>
            <Badge variant={meta.badge} label={meta.label} />
            {isTask ? (
              <HStack gap={2} vAlign="center">
                {/* ~40px checkbox target; label kept for screen readers. */}
                <CheckboxInput
                  label={
                    isDone
                      ? `Reopen task: ${entry.title}`
                      : `Complete task: ${entry.title}`
                  }
                  isLabelHidden
                  size="md"
                  value={isDone}
                  onChange={checked => onToggleTask(entry.id, checked)}
                />
                <Text
                  type="body"
                  weight="bold"
                  style={isDone ? styles.doneTitle : undefined}>
                  {entry.title}
                </Text>
              </HStack>
            ) : (
              <Text type="body">
                <Text type="body" weight="bold">
                  {entry.actor}
                </Text>{' '}
                {entry.title}
              </Text>
            )}
          </HStack>
          {entry.meta !== undefined && (
            <Text type="supporting" color="secondary">
              {entry.meta}
              {isTask && ` · logged by ${entry.actor}`}
              {isTask && isDone && ' · done'}
            </Text>
          )}
          {entry.body !== undefined && (
            <Text type="supporting" color="secondary" style={styles.entryBody}>
              {entry.body}
            </Text>
          )}
        </VStack>
      </StackItem>
      <span style={styles.timestampCell}>
        <Timestamp
          value={entry.ts}
          format="date_time"
          type="supporting"
          color="secondary"
        />
      </span>
    </HStack>
  );
}

// ============= PAGE =============

export default function CrmContactRecordTemplate() {
  const [stage, setStage] = useState<StageId>(INITIAL_STAGE);
  const [isStarred, setIsStarred] = useState(false);
  const [fieldValues, setFieldValues] =
    useState<Record<string, string>>(INITIAL_FIELD_VALUES);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldDraft, setFieldDraft] = useState('');
  const [activity, setActivity] = useState<ActivityEntry[]>(INITIAL_ACTIVITY);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [composerTab, setComposerTab] = useState<string>('note');
  const [noteDraft, setNoteDraft] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState(CALL_OUTCOMES[0]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState(TASK_DUE_OPTIONS[0]);

  // Responsive contract: <=960px both panels stack into Collapsible cards;
  // <=640px the header wraps and the stepper becomes a full-width Selector.
  const isStacked = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  // ---- derived state ----
  const activeStage = stageById(stage);
  const countByType = (type: ActivityType) =>
    activity.filter(entry => entry.type === type).length;
  const visibleActivity = activity.filter(
    entry => filter === 'all' || entry.type === filter,
  );
  const openTasks = activity.filter(
    entry => entry.type === 'task' && entry.isDone !== true,
  );

  // ---- interactions ----
  /**
   * Stage edits are real: swap the header chip AND auto-prepend a
   * stage-change entry — advancing and rewinding both log.
   */
  const changeStage = (nextId: StageId) => {
    if (nextId === stage) {
      return;
    }
    const previous = stageById(stage);
    const next = stageById(nextId);
    const isAdvance = stageIndex(nextId) > stageIndex(stage);
    setStage(nextId);
    setActivity(prev => [
      {
        id: `logged-${prev.length + 1}`,
        type: 'stage',
        actor: CURRENT_USER,
        title: `${isAdvance ? 'advanced' : 'moved'} lifecycle stage from ${
          previous.label
        } to ${next.label}`,
        ts: NOW_TIMESTAMP,
      },
      ...prev,
    ]);
  };

  const startFieldEdit = (id: string) => {
    setEditingFieldId(id);
    setFieldDraft(fieldValues[id] ?? '');
  };

  const saveField = () => {
    if (editingFieldId === null || fieldDraft.trim().length === 0) {
      return;
    }
    setFieldValues(prev => ({...prev, [editingFieldId]: fieldDraft.trim()}));
    setEditingFieldId(null);
    setFieldDraft('');
  };

  const cancelFieldEdit = () => {
    setEditingFieldId(null);
    setFieldDraft('');
  };

  const toggleTask = (id: string, isDone: boolean) => {
    setActivity(prev =>
      prev.map(entry => (entry.id === id ? {...entry, isDone} : entry)),
    );
  };

  /** Composer submissions prepend typed entries with the fixed literal. */
  const appendEntry = (entry: Omit<ActivityEntry, 'id' | 'ts' | 'actor'>) => {
    setActivity(prev => [
      {
        ...entry,
        id: `logged-${prev.length + 1}`,
        actor: CURRENT_USER,
        ts: NOW_TIMESTAMP,
      },
      ...prev,
    ]);
  };

  const submitNote = () => {
    const body = noteDraft.trim();
    if (body.length === 0) {
      return;
    }
    appendEntry({type: 'note', title: 'logged a note', body});
    setNoteDraft('');
  };

  const submitCall = () => {
    const body = callNotes.trim();
    if (body.length === 0) {
      return;
    }
    appendEntry({
      type: 'call',
      title: 'logged a call',
      meta: `Outcome: ${callOutcome}`,
      body,
    });
    setCallNotes('');
    setCallOutcome(CALL_OUTCOMES[0]);
  };

  const submitEmail = () => {
    const subject = emailSubject.trim();
    const body = emailBody.trim();
    if (subject.length === 0 || body.length === 0) {
      return;
    }
    appendEntry({
      type: 'email',
      title: 'sent an email',
      meta: `Subject: ${subject}`,
      body,
    });
    setEmailSubject('');
    setEmailBody('');
  };

  const submitTask = () => {
    const title = taskTitle.trim();
    if (title.length === 0) {
      return;
    }
    appendEntry({type: 'task', title, meta: `Due ${taskDue}`, isDone: false});
    setTaskTitle('');
    setTaskDue(TASK_DUE_OPTIONS[0]);
  };

  // ---- composer ----
  const composerAction = (label: string, onClick: () => void, isDisabled: boolean) => (
    <HStack gap={2} vAlign="center">
      <StackItem size="fill">
        <Text type="supporting" color="secondary">
          Logging as {CURRENT_USER}
        </Text>
      </StackItem>
      <Button
        label={label}
        variant="primary"
        icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
        isDisabled={isDisabled}
        onClick={onClick}
      />
    </HStack>
  );

  const composer = (
    <Card padding={3}>
      <VStack gap={3}>
        <TabList value={composerTab} onChange={setComposerTab} hasDivider>
          <Tab value="note" label="Note" />
          <Tab value="call" label="Call" />
          <Tab value="email" label="Email" />
          <Tab value="task" label="Task" />
        </TabList>

        {composerTab === 'note' && (
          <VStack gap={2}>
            <TextArea
              label="Note"
              isLabelHidden
              placeholder={`Write a note about ${CONTACT_NAME}…`}
              rows={3}
              value={noteDraft}
              onChange={setNoteDraft}
            />
            {composerAction('Log note', submitNote, noteDraft.trim().length === 0)}
          </VStack>
        )}

        {composerTab === 'call' && (
          <VStack gap={2}>
            <Selector
              label="Call outcome"
              size="md"
              width={isCompact ? '100%' : 220}
              value={callOutcome}
              onChange={setCallOutcome}
              options={CALL_OUTCOMES}
            />
            <TextArea
              label="Call notes"
              isLabelHidden
              placeholder="What happened on the call?"
              rows={3}
              value={callNotes}
              onChange={setCallNotes}
            />
            {composerAction('Log call', submitCall, callNotes.trim().length === 0)}
          </VStack>
        )}

        {composerTab === 'email' && (
          <VStack gap={2}>
            <TextInput
              label="Subject"
              placeholder="Email subject"
              value={emailSubject}
              onChange={setEmailSubject}
            />
            <TextArea
              label="Email body"
              isLabelHidden
              placeholder={`Email ${CONTACT_NAME} — logged, not sent`}
              rows={3}
              value={emailBody}
              onChange={setEmailBody}
            />
            {composerAction(
              'Log email',
              submitEmail,
              emailSubject.trim().length === 0 ||
                emailBody.trim().length === 0,
            )}
          </VStack>
        )}

        {composerTab === 'task' && (
          <VStack gap={2}>
            <TextInput
              label="Task"
              isLabelHidden
              placeholder="What needs to get done?"
              value={taskTitle}
              onChange={setTaskTitle}
              onEnter={submitTask}
            />
            <Selector
              label="Due"
              size="md"
              width={isCompact ? '100%' : 220}
              value={taskDue}
              onChange={setTaskDue}
              options={TASK_DUE_OPTIONS}
            />
            {composerAction('Add task', submitTask, taskTitle.trim().length === 0)}
          </VStack>
        )}
      </VStack>
    </Card>
  );

  // ---- timeline ----
  const timeline = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center" style={styles.headerWrap}>
        <StackItem size="fill">
          <Heading level={2}>Activity</Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {visibleActivity.length} of {activity.length} shown
        </Text>
      </HStack>

      {/* Filter chips: aria-pressed ToggleButtons with live counts. */}
      <HStack gap={1} vAlign="center" style={styles.chipWrap}>
        {FILTER_CHIPS.map(chip => (
          <ToggleButton
            key={chip.id}
            label={
              chip.id === 'all'
                ? `All (${activity.length})`
                : `${chip.label} (${countByType(chip.id)})`
            }
            size="sm"
            isPressed={filter === chip.id}
            onPressedChange={() => setFilter(chip.id)}
          />
        ))}
      </HStack>

      <VStack gap={4}>
        {visibleActivity.map(entry => (
          <TimelineEntryRow
            key={entry.id}
            entry={entry}
            onToggleTask={toggleTask}
          />
        ))}
        {visibleActivity.length === 0 && (
          <Text type="supporting" color="secondary">
            No {filter === 'all' ? '' : `${TYPE_META[filter as ActivityType].label.toLowerCase()} `}
            entries yet — log one from the composer above.
          </Text>
        )}
      </VStack>
    </VStack>
  );

  // ---- header ----
  const identityCluster = (
    <HStack gap={3} vAlign="center" style={styles.headerWrap}>
      <IconButton
        label="Back to contacts"
        tooltip="Back to contacts"
        icon={<Icon icon="chevronLeft" size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={() => {}}
      />
      <Avatar name={CONTACT_NAME} size="small" />
      <VStack gap={0}>
        <HStack gap={2} vAlign="center">
          <Heading level={1}>{CONTACT_NAME}</Heading>
          <Badge variant={activeStage.badge} label={activeStage.label} />
          <ToggleButton
            label={
              isStarred
                ? `Unstar ${CONTACT_NAME}`
                : `Star ${CONTACT_NAME}`
            }
            isIconOnly
            size="sm"
            icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
            pressedIcon={
              <Icon
                icon={StarIcon}
                size="sm"
                color="warning"
                fill="currentColor"
              />
            }
            isPressed={isStarred}
            onPressedChange={() => setIsStarred(prev => !prev)}
          />
        </HStack>
        <HStack gap={2} vAlign="center" style={styles.metaWrap}>
          <Icon icon={Building2Icon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary">
            {CONTACT_TITLE} · {COMPANY_NAME}
          </Text>
          <Avatar name={OWNER_NAME} size="tiny" />
          <Text type="supporting" color="secondary">
            Owner: {OWNER_NAME}
          </Text>
        </HStack>
      </VStack>
    </HStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" style={styles.headerWrap}>
            <StackItem size={isCompact ? undefined : 'fill'}>
              {identityCluster}
            </StackItem>
            {/* <=640px the stepper takes its own full-width row as a
                Selector instead of clipping the four-button rail. */}
            <LifecycleStepper
              stage={stage}
              isCompact={isCompact}
              onSelect={changeStage}
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        isStacked ? undefined : (
          <LayoutPanel width={300} padding={0} hasDivider label="Contact fields">
            <div style={styles.panelScroll}>
              <FieldGroups
                values={fieldValues}
                editingId={editingFieldId}
                draft={fieldDraft}
                onStartEdit={startFieldEdit}
                onDraftChange={setFieldDraft}
                onSave={saveField}
                onCancel={cancelFieldEdit}
              />
            </div>
          </LayoutPanel>
        )
      }
      end={
        isStacked ? undefined : (
          <LayoutPanel width={300} padding={0} label="Deals and company">
            <div style={styles.panelScroll}>
              <RailContent
                openTaskCount={openTasks.length}
                openTaskTitles={openTasks.map(task => task.title)}
              />
            </div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={4}>
              {/* <=960px: single-pane fallbacks for both docked panels —
                  Collapsible cards, closed so the composer stays above the
                  fold; triggers surface the counts they hide. */}
              {isStacked && (
                <Card padding={3}>
                  <Collapsible
                    defaultIsOpen={false}
                    trigger={
                      <HStack gap={2} vAlign="center">
                        <Icon
                          icon={PanelRightIcon}
                          size="sm"
                          color="secondary"
                        />
                        <Text type="label">Contact details</Text>
                        <Text type="supporting" color="secondary">
                          email, phone, segment, custom properties
                        </Text>
                      </HStack>
                    }>
                    <FieldGroups
                      values={fieldValues}
                      editingId={editingFieldId}
                      draft={fieldDraft}
                      onStartEdit={startFieldEdit}
                      onDraftChange={setFieldDraft}
                      onSave={saveField}
                      onCancel={cancelFieldEdit}
                    />
                  </Collapsible>
                </Card>
              )}
              {isStacked && (
                <Card padding={3}>
                  <Collapsible
                    defaultIsOpen={false}
                    trigger={
                      <HStack gap={2} vAlign="center">
                        <Icon
                          icon={CircleDollarSignIcon}
                          size="sm"
                          color="secondary"
                        />
                        <Text type="label">Deals & company</Text>
                        <Text type="supporting" color="secondary">
                          {OPEN_DEALS.length} open deals ·{' '}
                          {openTasks.length} open tasks
                        </Text>
                      </HStack>
                    }>
                    <RailContent
                      openTaskCount={openTasks.length}
                      openTaskTitles={openTasks.map(task => task.title)}
                    />
                  </Collapsible>
                </Card>
              )}

              {composer}
              <Divider />
              {timeline}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
