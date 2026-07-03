var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Email Compose Window — docked Gmail-style composer over an inert
 *   inbox backdrop.
 * @input Deterministic fixtures only: a lumenlabs.io people/group directory
 *   for the recipient typeahead, one seeded draft ('Q3 launch review —
 *   agenda + pre-reads' with three body paragraphs about the Thursday
 *   launch review), two attachments (one done, one pinned mid-upload at
 *   64%), and schedule presets anchored to fixed July 2026 dates. All
 *   timestamps are fixed ISO strings — no Date.now(), Math.random(), or
 *   network assets.
 * @output Gmail-style email compose window: a 560px compose Card docked
 *   bottom-right over a dimmed, non-interactive inbox backdrop (muted
 *   placeholder rows under an Overlay scrim). The window carries a title
 *   bar (draft subject + minimize/expand/close IconButtons), a To field
 *   built on Tokenizer with recipient chips — one invalid-address Token in
 *   error state with a FieldStatus message, and a group-list chip with a
 *   member-count Tooltip — Cc/Bcc reveal Links that add rows, a subject
 *   TextInput, a formatting Toolbar of pressed-state ToggleButtons (bold,
 *   italic, bulleted list, link), a controlled body TextArea, attachment
 *   rows with one mid-upload ProgressBar, and a footer with a Send +
 *   schedule-send split (ButtonGroup + DropdownMenu whose 'Pick date &
 *   time…' item opens a Popover holding a Calendar + TimeInput), a
 *   'Draft saved 10:42 AM' Timestamp, and a discard action behind an
 *   AlertDialog.
 * @position Page template; emitted by \`astryx template mail-compose\`.
 *
 * Frame: full-viewport inbox backdrop (Layout height="fill" with fifteen
 * muted placeholder rows, aria-hidden and pointer-events none) beneath an
 * Overlay scrim; the compose Card floats bottom-right inside the scrim
 * layer. Title bar and footer send-row are pinned inside the card; only
 * the recipient/subject/body region scrolls (max-height ~72vh docked).
 *
 * Choose over inbox / table-split-pane when the surface IS the
 * outgoing-message editor (chips, formatting toolbar, attachments,
 * scheduling) rather than a triage or reading frame; choose over
 * messaging-shell when the draft is a discrete email with recipients,
 * subject, and attachments, not a live chat stream; choose over
 * form-modal when the form is a floating docked mail composer with
 * rich-text affordances, not a generic centered dialog form.
 *
 * Responsive contract:
 * - >720px docked  — 560px card pinned bottom-right, max-height 72vh; the
 *   body region scrolls internally, title bar + footer stay pinned.
 * - >720px expanded — the card grows to a centered 800px window (84vh).
 * - minimized      — at every width the card collapses to a 320px × 48px
 *   title bar in the bottom-right corner and the backdrop scrim drops
 *   away.
 * - <=720px        — full-width / full-height mobile compose sheet while
 *   composing; minimize and expand controls are hidden, close remains.
 *   Closing an empty draft still minimizes, and the minimized bar keeps
 *   its Restore control so the composer is always recoverable. The
 *   footer send-row wraps so the schedule label never clips trailing
 *   actions.
 *
 * Container policy (floating-composer archetype): the compose Card is the
 * only Card on the page. Recipient/subject rows are fixed-height rows with
 * hairline Dividers; the body TextArea flexes with the window size. All
 * interactions (chips, toggles, attachments, scheduling, discard) are
 * wired to useState — the backdrop is intentionally inert.
 */

import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  BoldIcon,
  CalendarClockIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EraserIcon,
  FileTextIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  Maximize2Icon,
  Minimize2Icon,
  MinusIcon,
  PaperclipIcon,
  Trash2Icon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Calendar, type ISODateString} from '@astryxdesign/core/Calendar';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {Field} from '@astryxdesign/core/Field';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {Overlay} from '@astryxdesign/core/Overlay';
import {Popover} from '@astryxdesign/core/Popover';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TimeInput, type ISOTimeString} from '@astryxdesign/core/TimeInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tokenizer} from '@astryxdesign/core/Tokenizer';
import type {SearchableItem, SearchSource} from '@astryxdesign/core/Typeahead';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {MediaTheme} from '@astryxdesign/core/theme';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens only.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  root: {
    height: '100dvh',
    width: '100%',
  },
  overlay: {
    display: 'block',
    height: '100%',
    width: '100%',
  },
  // Inert inbox backdrop: decorative placeholder rows only, never focusable.
  backdrop: {
    height: '100%',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  placeholderBar: {
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    height: 10,
  },
  placeholderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  placeholderRow: {
    paddingBlock: 'var(--spacing-3)',
  },
  // The compose layer fills the scrim; the card is positioned by flex.
  composeLayerDocked: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    height: '100%',
    width: '100%',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  composeLayerExpanded: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  composeLayerMobile: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    height: '100%',
    width: '100%',
  },
  composeCard: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-high)',
  },
  titleBar: {
    height: 48,
    flexShrink: 0,
    paddingInline: 'var(--spacing-3)',
    display: 'flex',
    alignItems: 'center',
  },
  // Only this region scrolls; title bar and footer stay pinned.
  bodyScroll: {
    minHeight: 0,
    flex: 1,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-2)',
  },
  recipientRow: {
    paddingBlock: 'var(--spacing-1)',
  },
  rowLabel: {
    width: 44,
    flexShrink: 0,
  },
  attachmentRow: {
    paddingBlock: 'var(--spacing-2)',
  },
  footer: {
    flexShrink: 0,
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  schedulePopover: {
    padding: 'var(--spacing-3)',
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. The signed-in user is Dana Whitfield at
// Lumen Labs; today is fixed at 2026-07-02 (Thursday).
// ---------------------------------------------------------------------------

const DRAFT_SAVED_AT = '2026-07-02T10:42:00';

type RecipientKind = 'person' | 'group' | 'invalid';

interface RecipientMeta {
  email: string;
  kind: RecipientKind;
  /** Group lists only: member count surfaced in the chip Tooltip. */
  members?: number;
}

type RecipientItem = SearchableItem<RecipientMeta>;

/** Company directory backing the recipient typeahead. */
const DIRECTORY: RecipientItem[] = [
  {
    id: 'person-priya',
    label: 'Priya Raman',
    auxiliaryData: {email: 'priya.raman@lumenlabs.io', kind: 'person'},
  },
  {
    id: 'person-sam',
    label: 'Sam Okafor',
    auxiliaryData: {email: 'sam.okafor@lumenlabs.io', kind: 'person'},
  },
  {
    id: 'person-noor',
    label: 'Noor Haddad',
    auxiliaryData: {email: 'noor.haddad@lumenlabs.io', kind: 'person'},
  },
  {
    id: 'person-felix',
    label: 'Felix Grant',
    auxiliaryData: {email: 'felix.grant@lumenlabs.io', kind: 'person'},
  },
  {
    id: 'person-maya',
    label: 'Maya Lindqvist',
    auxiliaryData: {email: 'maya.lindqvist@lumenlabs.io', kind: 'person'},
  },
  {
    id: 'group-design-crit',
    label: 'design-crit@lumenlabs.io',
    auxiliaryData: {
      email: 'design-crit@lumenlabs.io',
      kind: 'group',
      members: 12,
    },
  },
  {
    id: 'group-launch-core',
    label: 'launch-core@lumenlabs.io',
    auxiliaryData: {
      email: 'launch-core@lumenlabs.io',
      kind: 'group',
      members: 8,
    },
  },
];

/** Seeded To chips: valid person, group list, and one invalid address. */
const INITIAL_TO: RecipientItem[] = [
  DIRECTORY[0], // Priya Raman <priya.raman@lumenlabs.io>
  DIRECTORY[5], // design-crit@lumenlabs.io (12 members)
  {
    id: 'invalid-jordan',
    label: 'jordan.h@lumen',
    auxiliaryData: {email: 'jordan.h@lumen', kind: 'invalid'},
  },
];

/** Revealing Cc seeds it with Sam per the draft's routing note. */
const CC_SEED: RecipientItem[] = [DIRECTORY[1]];

const INITIAL_SUBJECT = 'Q3 launch review — agenda + pre-reads';

const INITIAL_BODY = [
  'Hi all,',
  'Agenda for Thursday’s launch review is attached — we open with the activation numbers, then 20 minutes on the rollout gates, and close with open risks. Please skim the metrics snapshot before the meeting so we can go straight to decisions.',
  'If you own a gate, come with a one-line status: green, at-risk, or blocked. Anything blocked needs an owner and a date before we leave the room.',
].join('\\n\\n');

interface Attachment {
  id: string;
  name: string;
  size: string;
  icon: typeof FileTextIcon;
  status: 'done' | 'uploading';
  /** Fixed fixture percentage — the mid-upload row is pinned at 64%. */
  progress: number;
}

const INITIAL_ATTACHMENTS: Attachment[] = [
  {
    id: 'att-agenda',
    name: 'launch-agenda.pdf',
    size: '248 KB',
    icon: FileTextIcon,
    status: 'done',
    progress: 100,
  },
  {
    id: 'att-metrics',
    name: 'metrics-snapshot.png',
    size: '1.1 MB',
    icon: ImageIcon,
    status: 'uploading',
    progress: 64,
  },
];

/** The paperclip button drains this queue one file per click. */
const EXTRA_ATTACHMENTS: Attachment[] = [
  {
    id: 'att-preread',
    name: 'pre-read-metrics.xlsx',
    size: '890 KB',
    icon: FileTextIcon,
    status: 'done',
    progress: 100,
  },
  {
    id: 'att-retro',
    name: 'q2-retro-notes.pdf',
    size: '412 KB',
    icon: FileTextIcon,
    status: 'done',
    progress: 100,
  },
];

interface SchedulePreset {
  id: string;
  menuLabel: string;
  /** Short form shown in the footer Badge ('Scheduled: …'). */
  badgeLabel: string;
}

const SCHEDULE_PRESETS: SchedulePreset[] = [
  {
    id: 'tomorrow',
    menuLabel: 'Tomorrow morning · Jul 3, 8:00 AM',
    badgeLabel: 'Jul 3, 8:00 AM',
  },
  {
    id: 'monday',
    menuLabel: 'Monday morning · Jul 6, 9:00 AM',
    badgeLabel: 'Mon 9:00 AM',
  },
];

// ---------------------------------------------------------------------------
// HELPERS — pure and deterministic (fixed inputs only).
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

/** ISOTimeString is a branded string — brand the fixed picker default. */
const DEFAULT_PICK_TIME = '09:00' as ISOTimeString;

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** '2026-07-06' → 'Jul 6' (string math only — no locale, no clock). */
function formatDateShort(iso: ISODateString): string {
  const [, month, day] = iso.split('-');
  return \`\${MONTHS_SHORT[Number(month) - 1]} \${Number(day)}\`;
}

/** '09:00' → '9:00 AM'. */
function formatTime12h(iso: ISOTimeString): string {
  const [hourRaw, minute] = iso.split(':');
  const hour = Number(hourRaw);
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return \`\${hour12}:\${minute} \${meridiem}\`;
}

/**
 * Free-typed text becomes a chip: a well-formed address is a person chip,
 * anything else (no '@', bare domain, …) becomes an error Token.
 */
function classifyCreated(item: RecipientItem): RecipientItem {
  const label = item.label.trim();
  return {
    id: \`typed-\${label}\`,
    label,
    auxiliaryData: {
      email: label,
      kind: EMAIL_RE.test(label) ? 'person' : 'invalid',
    },
  };
}

const TOKEN_COLOR: Record<RecipientKind, 'default' | 'blue' | 'red'> = {
  person: 'default',
  group: 'blue',
  invalid: 'red',
};

// ---------------------------------------------------------------------------
// RECIPIENT ROW — 'To' / 'Cc' / 'Bcc' label + Tokenizer with custom chips.
// ---------------------------------------------------------------------------

function RecipientRow({
  rowLabel,
  value,
  onChange,
  placeholder,
  endContent,
}: {
  rowLabel: string;
  value: RecipientItem[];
  onChange: (items: RecipientItem[]) => void;
  placeholder?: string;
  endContent?: ReactNode;
}) {
  // Directory search scoped to this row: matches name or address and
  // hides chips that are already selected here.
  const searchSource = useMemo<SearchSource<RecipientItem>>(() => {
    const selectedIds = new Set(value.map(item => item.id));
    const available = DIRECTORY.filter(item => !selectedIds.has(item.id));
    return {
      search: query => {
        const q = query.trim().toLowerCase();
        return available.filter(
          item =>
            item.label.toLowerCase().includes(q) ||
            (item.auxiliaryData?.email ?? '').toLowerCase().includes(q),
        );
      },
      bootstrap: () => available.slice(0, 5),
    };
  }, [value]);

  return (
    <div style={styles.recipientRow}>
      <HStack gap={2} vAlign="center">
        <div style={styles.rowLabel}>
          <Text type="supporting" color="secondary">
            {rowLabel}
          </Text>
        </div>
        <StackItem size="fill">
          <Tokenizer<RecipientItem>
            label={\`\${rowLabel} recipients\`}
            isLabelHidden
            size="sm"
            width="100%"
            placeholder={placeholder}
            searchSource={searchSource}
            debounceMs={0}
            hasCreate
            hasEntriesOnFocus
            value={value}
            onChange={(items, change) => {
              const classified = items.map(item =>
                change.type === 'create' && item.id === change.item.id
                  ? classifyCreated(item)
                  : item,
              );
              // Free-typing the same text twice collapses to one chip —
              // ids double as React keys, so they must stay unique.
              const seen = new Set<string>();
              onChange(
                classified.filter(item => {
                  if (seen.has(item.id)) {
                    return false;
                  }
                  seen.add(item.id);
                  return true;
                }),
              );
            }}
            renderToken={(item, onRemove) => {
              const meta = item.auxiliaryData;
              if (meta?.kind === 'group') {
                return (
                  <Tooltip
                    content={\`\${meta.members} members · expands at send time\`}>
                    <Token
                      label={item.label}
                      size="sm"
                      color={TOKEN_COLOR.group}
                      icon={
                        <Icon icon={UsersIcon} size="xsm" color="inherit" />
                      }
                      onRemove={onRemove}
                    />
                  </Tooltip>
                );
              }
              if (meta?.kind === 'invalid') {
                return (
                  <Token
                    label={item.label}
                    size="sm"
                    color={TOKEN_COLOR.invalid}
                    description="Not a valid address"
                    onRemove={onRemove}
                  />
                );
              }
              return (
                <Tooltip content={meta?.email ?? item.label}>
                  <Token label={item.label} size="sm" onRemove={onRemove} />
                </Tooltip>
              );
            }}
          />
        </StackItem>
        {endContent}
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// INBOX BACKDROP — decorative, aria-hidden, pointer-events none.
// ---------------------------------------------------------------------------

/** Fixed widths so the muted rows read as varied mail, render-stable. */
const BACKDROP_ROWS: Array<{sender: number; subject: number}> = [
  {sender: 128, subject: 62},
  {sender: 96, subject: 78},
  {sender: 144, subject: 54},
  {sender: 112, subject: 70},
  {sender: 88, subject: 66},
  {sender: 136, subject: 48},
  {sender: 104, subject: 74},
  {sender: 120, subject: 58},
  {sender: 92, subject: 72},
  {sender: 140, subject: 50},
  {sender: 108, subject: 64},
  {sender: 124, subject: 56},
  {sender: 100, subject: 68},
  {sender: 132, subject: 60},
  {sender: 116, subject: 52},
];

function InboxBackdrop() {
  return (
    <div style={styles.backdrop} aria-hidden>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <Heading level={1}>Mail</Heading>
              </StackItem>
              <div style={{...styles.placeholderBar, width: 220, height: 28}} />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <VStack gap={0}>
              {BACKDROP_ROWS.map((row, index) => (
                <div key={index} style={styles.placeholderRow}>
                  <HStack gap={3} vAlign="center">
                    <div style={styles.placeholderAvatar} />
                    <VStack gap={2} style={{flex: 1, minWidth: 0}}>
                      <div
                        style={{...styles.placeholderBar, width: row.sender}}
                      />
                      <div
                        style={{
                          ...styles.placeholderBar,
                          width: \`\${row.subject}%\`,
                        }}
                      />
                    </VStack>
                    <div style={{...styles.placeholderBar, width: 48}} />
                  </HStack>
                  {index < BACKDROP_ROWS.length - 1 && <Divider />}
                </div>
              ))}
            </VStack>
          </LayoutContent>
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type WindowMode = 'docked' | 'minimized' | 'expanded';

export default function MailComposeTemplate() {
  // --- window chrome ---
  const [windowMode, setWindowMode] = useState<WindowMode>('docked');
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  // --- recipients ---
  const [toRecipients, setToRecipients] = useState<RecipientItem[]>(INITIAL_TO);
  const [showCc, setShowCc] = useState(false);
  const [ccRecipients, setCcRecipients] = useState<RecipientItem[]>([]);
  const [showBcc, setShowBcc] = useState(false);
  const [bccRecipients, setBccRecipients] = useState<RecipientItem[]>([]);

  // --- message ---
  const [subject, setSubject] = useState(INITIAL_SUBJECT);
  const [body, setBody] = useState(INITIAL_BODY);
  const [attachments, setAttachments] = useState<Attachment[]>(
    INITIAL_ATTACHMENTS,
  );

  // --- formatting toolbar (each button owns its pressed boolean) ---
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isBulleted, setIsBulleted] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  // --- schedule send ---
  const [scheduleBadge, setScheduleBadge] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickDate, setPickDate] = useState<ISODateString>('2026-07-06');
  // Calendar pinned to July 2026 on open; navigation stays controlled.
  const [calendarFocus, setCalendarFocus] =
    useState<ISODateString>('2026-07-01');
  const [pickTime, setPickTime] = useState<ISOTimeString>(DEFAULT_PICK_TIME);

  const isMobile = useMediaQuery('(max-width: 720px)');

  // --- derived state ---
  const allRecipients = [...toRecipients, ...ccRecipients, ...bccRecipients];
  const invalidRecipient = allRecipients.find(
    item => item.auxiliaryData?.kind === 'invalid',
  );
  const isDraftEmpty =
    allRecipients.length === 0 &&
    subject.trim() === '' &&
    body.trim() === '' &&
    attachments.length === 0;
  const canSend = toRecipients.length > 0 && invalidRecipient == null;
  const isMinimized = windowMode === 'minimized';
  const isExpanded = windowMode === 'expanded';
  const titleText = subject.trim() === '' ? 'New message' : subject;

  const pendingExtras = EXTRA_ATTACHMENTS.filter(
    extra => !attachments.some(att => att.id === extra.id),
  );

  const clearDraft = () => {
    setToRecipients([]);
    setCcRecipients([]);
    setBccRecipients([]);
    setShowCc(false);
    setShowBcc(false);
    setSubject('');
    setBody('');
    setAttachments([]);
    setIsBold(false);
    setIsItalic(false);
    setIsBulleted(false);
    setIsLinked(false);
    setScheduleBadge(null);
    setIsPickerOpen(false);
  };

  // Sending (or schedule-sending) hands the draft off: the composer
  // resets to the empty-draft state, ready for the next message.
  const handleSend = () => {
    clearDraft();
  };

  // Close = discard: confirm when the draft has content, otherwise just
  // drop to the minimized bar (the composer is this page's surface).
  const handleClose = () => {
    if (isDraftEmpty) {
      setWindowMode('minimized');
    } else {
      setIsDiscardOpen(true);
    }
  };

  const revealCc = () => {
    setShowCc(true);
    setCcRecipients(CC_SEED);
  };

  const scheduleFromPreset = (preset: SchedulePreset) => {
    setScheduleBadge(preset.badgeLabel);
    setIsPickerOpen(false);
  };

  const scheduleFromPicker = () => {
    setScheduleBadge(\`\${formatDateShort(pickDate)}, \${formatTime12h(pickTime)}\`);
    setIsPickerOpen(false);
  };

  // ----- title bar (pinned; the whole card when minimized) -----

  const titleBar = (
    <div style={styles.titleBar}>
      <HStack gap={1} vAlign="center" style={{width: '100%'}}>
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="body" weight="semibold" maxLines={1}>
            {titleText}
          </Text>
        </StackItem>
        {/* Mobile hides Minimize while composing, but the minimized bar
            (reached by closing an empty draft) must keep Restore — Close
            is a no-op there, so this is the only way back. */}
        {(!isMobile || isMinimized) && (
          <IconButton
            label={isMinimized ? 'Restore' : 'Minimize'}
            tooltip={isMinimized ? 'Restore' : 'Minimize'}
            size="sm"
            variant="ghost"
            icon={
              <Icon
                icon={isMinimized ? ChevronUpIcon : MinusIcon}
                size="sm"
                color="inherit"
              />
            }
            onClick={() =>
              setWindowMode(isMinimized ? 'docked' : 'minimized')
            }
          />
        )}
        {!isMobile && (
          <IconButton
            label={isExpanded ? 'Exit full screen' : 'Full screen'}
            tooltip={isExpanded ? 'Exit full screen' : 'Full screen'}
            size="sm"
            variant="ghost"
            icon={
              <Icon
                icon={isExpanded ? Minimize2Icon : Maximize2Icon}
                size="sm"
                color="inherit"
              />
            }
            onClick={() => setWindowMode(isExpanded ? 'docked' : 'expanded')}
          />
        )}
        <IconButton
          label="Close draft"
          tooltip="Close"
          size="sm"
          variant="ghost"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          onClick={handleClose}
        />
      </HStack>
    </div>
  );

  // ----- schedule-send: DropdownMenu (presets) → Popover (date & time) -----

  const schedulePicker = (
    <div style={styles.schedulePopover}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
          <Text type="body" weight="semibold">
            Pick date &amp; time
          </Text>
        </HStack>
        <Calendar
          value={pickDate}
          onChange={value => setPickDate(value)}
          min="2026-07-02"
          focusDate={calendarFocus}
          onFocusDateChange={setCalendarFocus}
        />
        <TimeInput
          label="Send time"
          size="sm"
          value={pickTime}
          onChange={value => setPickTime(value ?? DEFAULT_PICK_TIME)}
          increment={15}
        />
        <HStack gap={2}>
          <StackItem size="fill">
            <span />
          </StackItem>
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            onClick={() => setIsPickerOpen(false)}
          />
          <Button
            label={\`Schedule \${formatDateShort(pickDate)}, \${formatTime12h(pickTime)}\`}
            variant="primary"
            size="sm"
            onClick={scheduleFromPicker}
          />
        </HStack>
      </VStack>
    </div>
  );

  const sendSplit = (
    // The Popover anchors to the send split via the render-prop ref; the
    // DropdownMenu's 'Pick date & time…' item flips isPickerOpen.
    <Popover
      isOpen={isPickerOpen}
      onOpenChange={setIsPickerOpen}
      placement="above"
      alignment="start"
      width={300}
      label="Schedule send"
      content={schedulePicker}>
      {triggerProps => (
        <span ref={triggerProps.ref}>
          <ButtonGroup label="Send options" size="sm">
            <Button
              label={scheduleBadge == null ? 'Send' : 'Schedule send'}
              variant="primary"
              size="sm"
              isDisabled={!canSend}
              tooltip={
                canSend
                  ? undefined
                  : invalidRecipient != null
                    ? 'Fix or remove the invalid address first'
                    : 'Add at least one recipient'
              }
              onClick={handleSend}
            />
            <DropdownMenu
              button={{
                label: 'Schedule send options',
                variant: 'primary',
                size: 'sm',
                isIconOnly: true,
                icon: <Icon icon={ChevronDownIcon} size="sm" color="inherit" />,
              }}
              hasChevron={false}
              menuWidth={280}
              placement="above"
              items={[
                ...SCHEDULE_PRESETS.map(preset => ({
                  label: preset.menuLabel,
                  onClick: () => scheduleFromPreset(preset),
                })),
                {type: 'divider' as const},
                {
                  label: 'Pick date & time…',
                  icon: (
                    <Icon icon={CalendarClockIcon} size="sm" color="inherit" />
                  ),
                  onClick: () => setIsPickerOpen(true),
                },
              ]}
            />
          </ButtonGroup>
        </span>
      )}
    </Popover>
  );

  // ----- scrolling body region -----

  const bodyRegion = (
    <div style={styles.bodyScroll}>
      <VStack gap={0}>
        <RecipientRow
          rowLabel="To"
          value={toRecipients}
          onChange={setToRecipients}
          placeholder={toRecipients.length === 0 ? 'Recipients' : undefined}
          endContent={
            <HStack gap={2} vAlign="center">
              {!showCc && (
                <Link type="supporting" onClick={revealCc}>
                  Cc
                </Link>
              )}
              {!showBcc && (
                <Link type="supporting" onClick={() => setShowBcc(true)}>
                  Bcc
                </Link>
              )}
            </HStack>
          }
        />
        {invalidRecipient != null && (
          <FieldStatus
            variant="detached"
            type="error"
            message={\`'\${invalidRecipient.label}' is not a valid address — fix or remove it before sending.\`}
          />
        )}
        <Divider />
        {showCc && (
          <>
            <RecipientRow
              rowLabel="Cc"
              value={ccRecipients}
              onChange={setCcRecipients}
            />
            <Divider />
          </>
        )}
        {showBcc && (
          <>
            <RecipientRow
              rowLabel="Bcc"
              value={bccRecipients}
              onChange={setBccRecipients}
            />
            <Divider />
          </>
        )}
        <div style={styles.recipientRow}>
          <TextInput
            label="Subject"
            isLabelHidden
            placeholder="Subject"
            width="100%"
            value={subject}
            onChange={setSubject}
          />
        </div>
        <Divider />

        <Toolbar
          label="Formatting"
          size="sm"
          gap={1}
          startContent={
            <>
              <ToggleButton
                label="Bold"
                isIconOnly
                size="sm"
                icon={<Icon icon={BoldIcon} size="sm" color="inherit" />}
                isPressed={isBold}
                onPressedChange={setIsBold}
              />
              <ToggleButton
                label="Italic"
                isIconOnly
                size="sm"
                icon={<Icon icon={ItalicIcon} size="sm" color="inherit" />}
                isPressed={isItalic}
                onPressedChange={setIsItalic}
              />
              <ToggleButton
                label="Bulleted list"
                isIconOnly
                size="sm"
                icon={<Icon icon={ListIcon} size="sm" color="inherit" />}
                isPressed={isBulleted}
                onPressedChange={setIsBulleted}
              />
              <ToggleButton
                label="Insert link"
                isIconOnly
                size="sm"
                icon={<Icon icon={Link2Icon} size="sm" color="inherit" />}
                isPressed={isLinked}
                onPressedChange={setIsLinked}
              />
            </>
          }
          endContent={
            <IconButton
              label="Clear formatting"
              tooltip="Clear formatting"
              size="sm"
              variant="ghost"
              icon={<Icon icon={EraserIcon} size="sm" color="inherit" />}
              onClick={() => {
                setIsBold(false);
                setIsItalic(false);
                setIsBulleted(false);
                setIsLinked(false);
              }}
            />
          }
        />

        <TextArea
          label="Message body"
          isLabelHidden
          placeholder="Write your message…"
          rows={isExpanded ? 14 : isMobile ? 10 : 8}
          width="100%"
          value={body}
          onChange={setBody}
        />

        {attachments.length > 0 && (
          <Field
            label={\`Attachments (\${attachments.length})\`}
            inputID="compose-attachments">
            <div id="compose-attachments">
              <VStack gap={0}>
                {attachments.map(attachment => (
                  <div key={attachment.id} style={styles.attachmentRow}>
                    <HStack gap={2} vAlign="center">
                      <Icon
                        icon={attachment.icon}
                        size="sm"
                        color="secondary"
                      />
                      <StackItem size="fill" style={{minWidth: 0}}>
                        <VStack gap={1}>
                          <Text type="supporting" maxLines={1}>
                            {attachment.name} · {attachment.size}
                          </Text>
                          {attachment.status === 'uploading' && (
                            <ProgressBar
                              label={\`Uploading \${attachment.name}\`}
                              isLabelHidden
                              value={attachment.progress}
                            />
                          )}
                        </VStack>
                      </StackItem>
                      {attachment.status === 'uploading' ? (
                        <Text
                          type="supporting"
                          color="secondary"
                          hasTabularNumbers>
                          {attachment.progress}%
                        </Text>
                      ) : (
                        <HStack gap={1} vAlign="center">
                          <Icon icon={CheckIcon} size="xsm" color="success" />
                          <Text type="supporting" color="secondary">
                            Uploaded
                          </Text>
                        </HStack>
                      )}
                      <IconButton
                        label={\`Remove \${attachment.name}\`}
                        tooltip="Remove attachment"
                        size="sm"
                        variant="ghost"
                        icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                        onClick={() =>
                          setAttachments(prev =>
                            prev.filter(item => item.id !== attachment.id),
                          )
                        }
                      />
                    </HStack>
                  </div>
                ))}
              </VStack>
            </div>
          </Field>
        )}
      </VStack>
    </div>
  );

  // ----- pinned footer: send split, schedule badge, utilities -----

  const footer = (
    <div style={styles.footer}>
      <VStack gap={1}>
        {scheduleBadge != null && (
          <HStack gap={1} vAlign="center">
            <Badge label={\`Scheduled: \${scheduleBadge}\`} variant="blue" />
            <IconButton
              label="Cancel scheduled send"
              tooltip="Cancel schedule"
              size="sm"
              variant="ghost"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              onClick={() => setScheduleBadge(null)}
            />
          </HStack>
        )}
        {/* wrap="wrap" lets the draft-saved text + discard drop to a second
            line on narrow phones once the Send label widens to
            'Schedule send' — the Card clips overflow, so a nowrap row
            would cut off the trailing controls. */}
        <HStack gap={2} vAlign="center" wrap="wrap">
          {sendSplit}
          <IconButton
            label="Attach files"
            tooltip={
              pendingExtras.length > 0
                ? 'Attach a file'
                : 'All fixture files attached'
            }
            size="sm"
            variant="ghost"
            isDisabled={pendingExtras.length === 0}
            icon={<Icon icon={PaperclipIcon} size="sm" color="inherit" />}
            onClick={() =>
              // Pick the next queued file inside the updater so rapid
              // clicks can never append the same fixture twice.
              setAttachments(prev => {
                const next = EXTRA_ATTACHMENTS.find(
                  extra => !prev.some(att => att.id === extra.id),
                );
                return next == null ? prev : [...prev, next];
              })
            }
          />
          <StackItem size="fill">
            <span />
          </StackItem>
          <HStack gap={1} vAlign="center">
            <Text type="supporting" color="secondary">
              Draft saved
            </Text>
            <Text type="supporting" color="secondary">
              <Timestamp
                value={DRAFT_SAVED_AT}
                format="time"
                hasTooltip={false}
              />
            </Text>
          </HStack>
          <IconButton
            label="Discard draft"
            tooltip="Discard draft"
            size="sm"
            variant="ghost"
            isDisabled={isDraftEmpty}
            icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
            onClick={() => setIsDiscardOpen(true)}
          />
        </HStack>
      </VStack>
    </div>
  );

  // ----- compose card across the three window states -----

  const composeCard = (
    <Card
      padding={0}
      width={
        isMinimized ? 320 : isMobile ? '100%' : isExpanded ? 800 : 560
      }
      maxWidth="100%"
      style={{
        ...styles.composeCard,
        // Minimized always collapses to the 48px title bar — including on
        // mobile, where a full-height blank card would be a dead end.
        height: isMinimized ? 48 : isMobile ? '100%' : undefined,
        maxHeight: isMobile ? '100%' : isExpanded ? '84vh' : '72vh',
        borderRadius: isMobile && !isMinimized ? 0 : undefined,
      }}
      role="dialog"
      aria-label={\`Compose: \${titleText}\`}>
      {titleBar}
      {!isMinimized && (
        <>
          <Divider />
          {bodyRegion}
          <Divider />
          {footer}
        </>
      )}
    </Card>
  );

  const composeLayer = (
    <div
      style={
        // Minimized docks bottom-right at every width; the full-bleed
        // mobile layer only applies while the composer is open.
        isMobile && !isMinimized
          ? styles.composeLayerMobile
          : isExpanded
            ? styles.composeLayerExpanded
            : styles.composeLayerDocked
      }>
      {/* The dark scrim flips the overlay layer into media-dark theming;
          the composer is a light surface, so re-anchor it to light. */}
      <MediaTheme mode="light">{composeCard}</MediaTheme>
    </div>
  );

  return (
    <div style={styles.root}>
      <Overlay
        isOpen
        // Minimized drops the dim so the backdrop reads as the page again.
        scrim={isMinimized ? false : 'dark'}
        position="fill"
        align="start"
        style={styles.overlay}
        content={composeLayer}>
        <InboxBackdrop />
      </Overlay>

      <AlertDialog
        isOpen={isDiscardOpen}
        onOpenChange={setIsDiscardOpen}
        title="Discard draft?"
        description="The message, its recipients, and any attachments will be deleted. This can't be undone."
        actionLabel="Discard"
        cancelLabel="Keep editing"
        onAction={() => {
          clearDraft();
          setIsDiscardOpen(false);
          setWindowMode('docked');
        }}
      />
    </div>
  );
}
`;export{e as default};