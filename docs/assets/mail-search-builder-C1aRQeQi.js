var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Advanced Mail Search — operator-chip query builder over a mailbox.
 *
 * @input Deterministic fixtures only: 12 messages spanning March–July 2026
 *   (senders Dana Whitfield, Marcus Webb, Meridian procurement, Northwind
 *   billing) with fixed ISO timestamps, attachment flags, folders, and
 *   labels; three saved searches with stored chip sets; the initial query
 *   is \`from:dana@meridianhealth.example has:attachment label:renewals\`.
 *   No Date.now(), Math.random(), or network assets.
 * @output A Gmail-advanced-search-style page: a prominent header query bar
 *   rendering the active query as removable operator Tokens plus a
 *   free-text TextInput tail; beneath it a structured filter row (From
 *   Typeahead, Date DateRangeInput, Has-attachment Switch, Folder
 *   Selector) where every control adds/removes its corresponding chip —
 *   chips and controls stay in sync both ways. A 260px saved-search rail
 *   (result-count Badges, Save-current-search Popover) sits left of
 *   grouped results ('Best match', newest month, 'Earlier') rendered as
 *   dense sender/subject/snippet rows with bolded match substrings and
 *   paperclip attachment icons. Contradictory filters produce an
 *   EmptyState with a 'Clear filters' action.
 * @position Emitted by \`astryx template mail-search-builder\`.
 *
 * Frame: Layout height="fill". LayoutHeader holds the query-chip bar
 * (wraps to two lines) and the structured filter row; LayoutPanel 260px
 * start rail lists saved searches with its own scroll; LayoutContent
 * scrolls the grouped results at full remaining width.
 *
 * Container policy: dense rows and panels, zero Cards. Saved searches and
 * results are List/ListItem rows; query operators are Tokens; group and
 * saved-search counts are the only Badge usage.
 *
 * Distinct from inbox: the list here is a query result set with relevance
 * grouping, not a folder. Distinct from command-palette-launcher: search
 * is a full page, not a modal palette.
 *
 * Interaction contract: the chips array in useState is the single source
 * of truth. X on a chip removes it AND resets its builder control; the
 * Switch/Typeahead/DateRangeInput/Selector each add or replace their
 * matching chip; Enter in the free-text input appends a text-term chip;
 * clicking a saved search replaces the whole chip set; the fixture set is
 * re-filtered and re-grouped from the chips on every change.
 *
 * Responsive contract:
 * - >900px  — 260px saved-search rail | grouped results (fill). The rail
 *   and the results scroll independently; the header stays pinned.
 * - <=900px — the rail collapses into a saved-search Selector above the
 *   results; the filter row wraps onto multiple lines.
 * - The query-chip bar wraps to two lines at any width; the free-text
 *   tail (input + clear-filters button, kept as one flex unit) holds a
 *   240px minimum so typing room never collapses.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  Stack,
  StackItem,
  HStack,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {DateRangeInput, type DateRange} from '@astryxdesign/core/DateRangeInput';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {Popover} from '@astryxdesign/core/Popover';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {
  Typeahead,
  TypeaheadItem,
  type SearchableItem,
} from '@astryxdesign/core/Typeahead';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  BookmarkPlusIcon,
  CalendarIcon,
  FilterXIcon,
  FolderIcon,
  MailSearchIcon,
  PaperclipIcon,
  SearchIcon,
  TagIcon,
  UserIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens only.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  headerStack: {
    paddingBlock: 'var(--spacing-1)',
  },
  // The query bar wraps to a second line when chips outgrow the width; the
  // free-text tail keeps a 200px minimum so there is always room to type.
  chipBar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  // Input + clear button travel as one flex unit so the clear icon never
  // wraps onto a line of its own when the bar breaks.
  chipBarTail: {
    flex: '1 1 240px',
    minWidth: 240,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  chipBarTailInput: {
    flex: '1 1 auto',
    minWidth: 0,
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 'var(--spacing-3)',
  },
  railColumn: {
    height: '100%',
    minHeight: 0,
  },
  railScroll: {
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-3)',
  },
  railFooter: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-3)',
  },
  resultsScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
  },
  mobileSavedRow: {
    paddingBottom: 'var(--spacing-3)',
  },
  groupHeader: {
    paddingTop: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-1)',
  },
  // Tabular numerals so stacked dates digit-align down the result list.
  rowDate: {
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  emptyWrap: {
    paddingTop: 'var(--spacing-8)',
  },
  popoverBody: {
    padding: 'var(--spacing-3)',
  },
};

// ---------------------------------------------------------------------------
// QUERY MODEL — the chips array is the single source of truth for the page.
// ---------------------------------------------------------------------------

type ChipKind = 'from' | 'has' | 'label' | 'after' | 'before' | 'in' | 'text';

interface Chip {
  kind: ChipKind;
  value: string;
}

const CHIP_COLOR: Record<ChipKind, TokenColor> = {
  from: 'blue',
  has: 'purple',
  label: 'green',
  after: 'orange',
  before: 'orange',
  in: 'teal',
  text: 'gray',
};

const CHIP_ICON: Record<ChipKind, typeof UserIcon> = {
  from: UserIcon,
  has: PaperclipIcon,
  label: TagIcon,
  after: CalendarIcon,
  before: CalendarIcon,
  in: FolderIcon,
  text: SearchIcon,
};

function chipLabel(chip: Chip): string {
  return chip.kind === 'text' ? \`"\${chip.value}"\` : \`\${chip.kind}:\${chip.value}\`;
}

function chipKey(chip: Chip): string {
  return \`\${chip.kind}:\${chip.value}\`;
}

/** Stable identity for a whole chip set, order-insensitive. */
function chipSetKey(chips: Chip[]): string {
  return chips.map(chipKey).sort().join(' ');
}

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures: fixed ISO timestamps, stable ordering.
// The signed-in user is renewing the Meridian Health contract.
// ---------------------------------------------------------------------------

interface Sender {
  name: string;
  email: string;
}

const SENDERS: Sender[] = [
  {name: 'Dana Whitfield', email: 'dana@meridianhealth.example'},
  {name: 'Marcus Webb', email: 'marcus.webb@northwind.example'},
  {name: 'Meridian Procurement', email: 'procurement@meridianhealth.example'},
  {name: 'Northwind Billing', email: 'billing@northwind.example'},
];

type FolderId = 'inbox' | 'sent' | 'archive';

const FOLDER_OPTIONS = [
  {value: 'any', label: 'Any folder'},
  {value: 'inbox', label: 'Inbox'},
  {value: 'sent', label: 'Sent'},
  {value: 'archive', label: 'Archive'},
];

interface MailResult {
  id: string;
  from: string;
  email: string;
  subject: string;
  snippet: string;
  /** Fixed ISO timestamp — never derived from a clock. */
  date: string;
  hasAttachment: boolean;
  folder: FolderId;
  labels: string[];
}

const MESSAGES: MailResult[] = [
  {
    id: 'msg-01',
    from: 'Dana Whitfield',
    email: 'dana@meridianhealth.example',
    subject: 'Meridian renewal — countersigned MSA',
    snippet:
      'Attaching the countersigned MSA for the renewal file. Legal confirmed every redline from v3 is resolved, so this closes out the paper.',
    date: '2026-07-01T09:24:00',
    hasAttachment: true,
    folder: 'inbox',
    labels: ['renewals'],
  },
  {
    id: 'msg-02',
    from: 'Dana Whitfield',
    email: 'dana@meridianhealth.example',
    subject: 'Renewal pricing exhibit',
    snippet:
      'Updated the renewal pricing exhibit with the 240-seat tier and the multi-year discount schedule finance approved on Tuesday.',
    date: '2026-06-18T14:05:00',
    hasAttachment: true,
    folder: 'inbox',
    labels: ['renewals'],
  },
  {
    id: 'msg-03',
    from: 'Dana Whitfield',
    email: 'dana@meridianhealth.example',
    subject: 'MSA redline v3',
    snippet:
      'Third pass attached — our counsel accepted the liability cap but pushed back on the renewal auto-extension clause in section 11.',
    date: '2026-06-24T11:40:00',
    hasAttachment: true,
    folder: 'inbox',
    labels: ['renewals'],
  },
  {
    id: 'msg-04',
    from: 'Dana Whitfield',
    email: 'dana@meridianhealth.example',
    subject: 'Signed order form — Meridian',
    snippet:
      'Order form for the renewal term is signed and attached. Procurement will issue the PO under the new master number.',
    date: '2026-06-12T16:22:00',
    hasAttachment: true,
    folder: 'inbox',
    labels: ['renewals'],
  },
  {
    id: 'msg-05',
    from: 'Dana Whitfield',
    email: 'dana@meridianhealth.example',
    subject: 'Security addendum for legal review',
    snippet:
      'Our security team finished the questionnaire — addendum attached so it can ride along with the renewal signature packet.',
    date: '2026-06-05T10:02:00',
    hasAttachment: true,
    folder: 'archive',
    labels: ['renewals'],
  },
  {
    id: 'msg-06',
    from: 'Dana Whitfield',
    email: 'dana@meridianhealth.example',
    subject: 'Updated seat forecast for FY27',
    snippet:
      'Forecast spreadsheet attached. Finance wants the renewal sized at 220 seats with a true-up in January rather than 240 up front.',
    date: '2026-06-02T08:47:00',
    hasAttachment: true,
    folder: 'inbox',
    labels: ['renewals'],
  },
  {
    id: 'msg-07',
    from: 'Dana Whitfield',
    email: 'dana@meridianhealth.example',
    subject: 'Draft SOW for implementation phase',
    snippet:
      'First draft of the SOW attached. Scope assumes the renewal closes by July so onboarding can start the same sprint.',
    date: '2026-05-14T13:18:00',
    hasAttachment: true,
    folder: 'inbox',
    labels: ['renewals'],
  },
  {
    id: 'msg-08',
    from: 'Dana Whitfield',
    email: 'dana@meridianhealth.example',
    subject: 'Kickoff notes — Meridian contract workspace',
    snippet:
      'Notes from kickoff attached, plus the shared workspace link. Target is a renewal signature well ahead of the September lapse date.',
    date: '2026-03-20T15:55:00',
    hasAttachment: true,
    folder: 'archive',
    labels: ['renewals'],
  },
  {
    id: 'msg-09',
    from: 'Marcus Webb',
    email: 'marcus.webb@northwind.example',
    subject: 'Renewal call notes — Northwind',
    snippet:
      'Recap from the renewal call attached. Their CFO wants the uplift capped at 6% — flagging before we send the quote.',
    date: '2026-06-10T09:12:00',
    hasAttachment: true,
    folder: 'inbox',
    labels: ['renewals'],
  },
  {
    id: 'msg-10',
    from: 'Marcus Webb',
    email: 'marcus.webb@northwind.example',
    subject: 'Q3 vendor scorecard draft',
    snippet:
      'Draft scorecard for the quarterly review — no attachments yet, numbers land after the close on Friday.',
    date: '2026-07-02T08:30:00',
    hasAttachment: false,
    folder: 'inbox',
    labels: [],
  },
  {
    id: 'msg-11',
    from: 'Meridian Procurement',
    email: 'procurement@meridianhealth.example',
    subject: 'PO 88231 issued — Meridian Health',
    snippet:
      'Purchase order 88231 is attached against the renewal order form. Invoice terms are net-45 from receipt.',
    date: '2026-06-20T12:41:00',
    hasAttachment: true,
    folder: 'inbox',
    labels: ['renewals'],
  },
  {
    id: 'msg-12',
    from: 'Northwind Billing',
    email: 'billing@northwind.example',
    subject: 'Invoice NW-2201 past due',
    snippet:
      'Invoice NW-2201 is 30 days past due. A copy is attached; remit to the account on file to avoid a service hold.',
    date: '2026-04-08T07:59:00',
    hasAttachment: true,
    folder: 'inbox',
    labels: ['invoices'],
  },
];

const INITIAL_CHIPS: Chip[] = [
  {kind: 'from', value: 'dana@meridianhealth.example'},
  {kind: 'has', value: 'attachment'},
  {kind: 'label', value: 'renewals'},
];

interface SavedSearch {
  id: string;
  name: string;
  chips: Chip[];
  /** Result count at last run — stored with the search, shown as a Badge. */
  count: number;
}

const INITIAL_SAVED_SEARCHES: SavedSearch[] = [
  {
    id: 'saved-1',
    name: 'Meridian renewal docs',
    chips: INITIAL_CHIPS,
    count: 8,
  },
  {
    id: 'saved-2',
    name: 'Unpaid invoices',
    chips: [
      {kind: 'label', value: 'invoices'},
      {kind: 'text', value: 'past due'},
    ],
    count: 3,
  },
  {
    id: 'saved-3',
    name: 'From my manager',
    chips: [{kind: 'from', value: 'marcus.webb@northwind.example'}],
    count: 21,
  },
];

// ---------------------------------------------------------------------------
// QUERY EVALUATION — filter, score, and group the fixture set from the chips.
// ---------------------------------------------------------------------------

function matchesChips(message: MailResult, chips: Chip[]): boolean {
  const day = message.date.slice(0, 10);
  return chips.every(chip => {
    switch (chip.kind) {
      case 'from':
        return message.email === chip.value;
      case 'has':
        return message.hasAttachment;
      case 'label':
        return message.labels.includes(chip.value);
      case 'in':
        return message.folder === chip.value;
      case 'after':
        return day >= chip.value;
      case 'before':
        return day <= chip.value;
      case 'text': {
        const haystack =
          \`\${message.from} \${message.email} \${message.subject} \${message.snippet}\`.toLowerCase();
        return haystack.includes(chip.value.toLowerCase());
      }
    }
  });
}

/**
 * Terms whose occurrences get bolded in subject/snippet: free-text chips
 * plus the singular stem of the label chip ('renewals' → 'renewal').
 */
function highlightTermsFor(chips: Chip[]): string[] {
  const terms: string[] = [];
  for (const chip of chips) {
    if (chip.kind === 'text') {
      terms.push(chip.value);
    } else if (chip.kind === 'label') {
      terms.push(chip.value.replace(/s$/, ''));
    }
  }
  return terms;
}

/** Newest first, stable — fixtures are unique by timestamp. */
function byNewest(a: MailResult, b: MailResult): number {
  return a.date < b.date ? 1 : -1;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function monthLabel(isoDate: string): string {
  const year = isoDate.slice(0, 4);
  const monthIndex = Number(isoDate.slice(5, 7)) - 1;
  return \`\${MONTH_NAMES[monthIndex]} \${year}\`;
}

interface ResultGroup {
  id: string;
  title: string;
  messages: MailResult[];
}

/**
 * Grouping rule: subject hits on a highlight term are 'Best match'; the
 * newest calendar month among the remaining results gets its own section;
 * everything older collapses into 'Earlier'.
 */
function groupResults(results: MailResult[], terms: string[]): ResultGroup[] {
  const lowered = terms.map(term => term.toLowerCase());
  const best: MailResult[] = [];
  const rest: MailResult[] = [];
  for (const message of [...results].sort(byNewest)) {
    const subject = message.subject.toLowerCase();
    if (lowered.some(term => subject.includes(term))) {
      best.push(message);
    } else {
      rest.push(message);
    }
  }
  const groups: ResultGroup[] = [];
  if (best.length > 0) {
    groups.push({id: 'best', title: 'Best match', messages: best});
  }
  if (rest.length > 0) {
    const newestMonth = rest[0].date.slice(0, 7);
    const inMonth = rest.filter(m => m.date.slice(0, 7) === newestMonth);
    const earlier = rest.filter(m => m.date.slice(0, 7) !== newestMonth);
    groups.push({
      id: \`month-\${newestMonth}\`,
      title: monthLabel(rest[0].date),
      messages: inMonth,
    });
    if (earlier.length > 0) {
      groups.push({id: 'earlier', title: 'Earlier', messages: earlier});
    }
  }
  return groups;
}

/** Bold every occurrence of a highlight term inside a fixture string. */
function highlight(text: string, terms: string[]): ReactNode {
  if (terms.length === 0) {
    return text;
  }
  const escaped = terms
    .filter(term => term.length > 0)
    .map(term => term.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'));
  if (escaped.length === 0) {
    return text;
  }
  const parts = text.split(new RegExp(\`(\${escaped.join('|')})\`, 'gi'));
  return parts.map((part, index) =>
    index % 2 === 1 ? <strong key={index}>{part}</strong> : part,
  );
}

// ---------------------------------------------------------------------------
// SENDER TYPEAHEAD — synchronous search source over the fixture senders.
// ---------------------------------------------------------------------------

type SenderItem = SearchableItem<Sender>;

// Labels are the short display names so the selected token never truncates
// mid-address inside the 260px field; search still matches the email, and
// the dropdown shows it as the item description.
const SENDER_ITEMS: SenderItem[] = SENDERS.map(sender => ({
  id: sender.email,
  label: sender.name,
  auxiliaryData: sender,
}));

const SENDER_SOURCE = {
  search: (query: string) => {
    const lowered = query.toLowerCase();
    return SENDER_ITEMS.filter(item =>
      \`\${item.label} \${item.id}\`.toLowerCase().includes(lowered),
    );
  },
  bootstrap: () => SENDER_ITEMS,
};

// ---------------------------------------------------------------------------
// RESULT ROW — avatar + sender/date line over subject + snippet with the
// matched substrings bolded and a paperclip on attachment messages.
// ---------------------------------------------------------------------------

function ResultRow({
  message,
  terms,
}: {
  message: MailResult;
  terms: string[];
}) {
  return (
    <ListItem
      startContent={<Avatar name={message.from} size="small" />}
      label={
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="body" weight="semibold" maxLines={1}>
              {message.from}
            </Text>
          </StackItem>
          {message.hasAttachment && (
            <Tooltip content="Has attachment">
              <Icon icon={PaperclipIcon} size="sm" color="secondary" />
            </Tooltip>
          )}
          <div style={styles.rowDate}>
            <Timestamp value={message.date} format="date" hasTooltip={false} />
          </div>
        </HStack>
      }
      description={
        <VStack gap={0}>
          <Text type="supporting" color="primary" maxLines={1}>
            {highlight(message.subject, terms)}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {highlight(message.snippet, terms)}
          </Text>
        </VStack>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MailSearchBuilderTemplate() {
  // Single source of truth: every control below derives from this array.
  const [chips, setChips] = useState<Chip[]>(INITIAL_CHIPS);
  const [freeText, setFreeText] = useState('');
  const [savedSearches, setSavedSearches] =
    useState<SavedSearch[]>(INITIAL_SAVED_SEARCHES);
  const [isSavePopoverOpen, setIsSavePopoverOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Responsive contract (see file header).
  const isRailCollapsed = useMediaQuery('(max-width: 900px)');

  // ---- chip mutations (chips array stays the single source of truth) ----

  const removeChip = (chip: Chip) => {
    setChips(prev =>
      prev.filter(existing => chipKey(existing) !== chipKey(chip)),
    );
  };

  /** Replace the single chip of \`kind\` (or drop it when value is null). */
  const setSingleChip = (kind: ChipKind, value: string | null) => {
    setChips(prev => {
      const others = prev.filter(existing => existing.kind !== kind);
      return value === null ? others : [...others, {kind, value}];
    });
  };

  const addTextChip = () => {
    const value = freeText.trim();
    if (value === '') {
      return;
    }
    setChips(prev =>
      prev.some(chip => chip.kind === 'text' && chip.value === value)
        ? prev
        : [...prev, {kind: 'text', value}],
    );
    setFreeText('');
  };

  const setDateRange = (range: DateRange | null) => {
    setChips(prev => {
      const others = prev.filter(
        chip => chip.kind !== 'after' && chip.kind !== 'before',
      );
      return range === null
        ? others
        : [
            ...others,
            {kind: 'after', value: range.start},
            {kind: 'before', value: range.end},
          ];
    });
  };

  const clearAll = () => {
    setChips([]);
    setFreeText('');
  };

  // ---- builder-control values, derived straight from the chips ----

  const fromChip = chips.find(chip => chip.kind === 'from') ?? null;
  const hasAttachmentChip = chips.some(chip => chip.kind === 'has');
  const labelChip = chips.find(chip => chip.kind === 'label') ?? null;
  const afterChip = chips.find(chip => chip.kind === 'after') ?? null;
  const beforeChip = chips.find(chip => chip.kind === 'before') ?? null;
  const inChip = chips.find(chip => chip.kind === 'in') ?? null;

  const senderValue =
    fromChip === null
      ? null
      : (SENDER_ITEMS.find(item => item.id === fromChip.value) ?? {
          id: fromChip.value,
          label: fromChip.value,
        });

  // The picker needs both bounds; a lone after:/before: chip still filters.
  const dateRangeValue: DateRange | null =
    afterChip !== null && beforeChip !== null
      ? {
          start: afterChip.value as DateRange['start'],
          end: beforeChip.value as DateRange['end'],
        }
      : null;

  // ---- results, re-filtered and re-grouped on every chip change ----

  const highlightTerms = useMemo(() => highlightTermsFor(chips), [chips]);

  const groups = useMemo(() => {
    const results = MESSAGES.filter(message => matchesChips(message, chips));
    return groupResults(results, highlightTerms);
  }, [chips, highlightTerms]);

  const resultCount = groups.reduce(
    (sum, group) => sum + group.messages.length,
    0,
  );

  const activeSavedId =
    savedSearches.find(saved => chipSetKey(saved.chips) === chipSetKey(chips))
      ?.id ?? null;

  // ---- saved searches ----

  const applySavedSearch = (saved: SavedSearch) => {
    setChips(saved.chips.map(chip => ({...chip})));
    setFreeText('');
  };

  const saveCurrentSearch = () => {
    const name = saveName.trim();
    if (name === '' || chips.length === 0) {
      return;
    }
    setSavedSearches(prev => [
      ...prev,
      {
        id: \`saved-\${prev.length + 1}-\${name.toLowerCase().replace(/\\s+/g, '-')}\`,
        name,
        chips: chips.map(chip => ({...chip})),
        count: resultCount,
      },
    ]);
    setSaveName('');
    setIsSavePopoverOpen(false);
  };

  // ---- header: query-chip bar + structured filter row ----

  const savePopover = (
    <Popover
      label="Save current search"
      isOpen={isSavePopoverOpen}
      onOpenChange={open => {
        setIsSavePopoverOpen(open);
        if (!open) {
          setSaveName('');
        }
      }}
      width={280}
      content={
        <div style={styles.popoverBody}>
          <VStack gap={3}>
            <TextInput
              label="Search name"
              size="sm"
              placeholder="e.g. Renewal paperwork"
              value={saveName}
              onChange={setSaveName}
              onEnter={saveCurrentSearch}
            />
            <HStack gap={2} hAlign="end">
              <Button
                label="Cancel"
                size="sm"
                variant="ghost"
                onClick={() => setIsSavePopoverOpen(false)}
              />
              <Button
                label="Save search"
                size="sm"
                variant="primary"
                isDisabled={saveName.trim() === '' || chips.length === 0}
                onClick={saveCurrentSearch}
              />
            </HStack>
          </VStack>
        </div>
      }>
      <Button
        label="Save current search"
        size="sm"
        variant="secondary"
        icon={<Icon icon={BookmarkPlusIcon} size="sm" color="inherit" />}
        isDisabled={chips.length === 0}
      />
    </Popover>
  );

  const queryChipBar = (
    <div style={styles.chipBar}>
      <Icon icon={SearchIcon} size="md" color="secondary" />
      {chips.map(chip => (
        <Token
          key={chipKey(chip)}
          label={chipLabel(chip)}
          color={CHIP_COLOR[chip.kind]}
          size="md"
          icon={<Icon icon={CHIP_ICON[chip.kind]} size="sm" color="inherit" />}
          onRemove={() => removeChip(chip)}
        />
      ))}
      <div style={styles.chipBarTail}>
        <div style={styles.chipBarTailInput}>
          <TextInput
            label="Add search terms"
            isLabelHidden
            size="sm"
            placeholder={
              chips.length === 0
                ? 'Search mail — type a term and press Enter…'
                : 'Add a term and press Enter…'
            }
            value={freeText}
            onChange={setFreeText}
            onEnter={addTextChip}
          />
        </div>
        <Tooltip content="Clear all filters">
          <IconButton
            label="Clear all filters"
            size="sm"
            variant="ghost"
            icon={<Icon icon={FilterXIcon} size="sm" color="inherit" />}
            isDisabled={chips.length === 0}
            onClick={clearAll}
          />
        </Tooltip>
      </div>
    </div>
  );

  const filterRow = (
    <div style={styles.filterRow}>
      <Typeahead<SenderItem>
        label="From"
        size="sm"
        width={260}
        placeholder="Any sender"
        searchSource={SENDER_SOURCE}
        value={senderValue}
        onChange={item => setSingleChip('from', item === null ? null : item.id)}
        renderItem={item => <TypeaheadItem item={item} description={item.id} />}
        hasEntriesOnFocus
        debounceMs={0}
        startIcon={UserIcon}
      />
      <DateRangeInput
        label="Date"
        size="sm"
        width={250}
        placeholder="Any time"
        value={dateRangeValue}
        onChange={setDateRange}
        min="2026-01-01"
        max="2026-12-31"
      />
      <Selector
        label="Folder"
        size="sm"
        width={150}
        options={FOLDER_OPTIONS}
        value={inChip === null ? 'any' : inChip.value}
        onChange={value =>
          setSingleChip('in', value === 'any' ? null : value)
        }
      />
      <Switch
        label="Has attachment"
        value={hasAttachmentChip}
        onChange={checked =>
          setSingleChip('has', checked ? 'attachment' : null)
        }
      />
    </div>
  );

  // ---- saved-search rail (desktop) / Selector row (narrow) ----

  const savedSearchRail = (
    <Stack direction="vertical" style={styles.railColumn}>
      <StackItem size="fill" style={styles.railScroll}>
        <List density="compact" hasDividers={false}>
          {savedSearches.map(saved => (
            <ListItem
              key={saved.id}
              label={saved.name}
              description={saved.chips.map(chipLabel).join(' ')}
              isSelected={saved.id === activeSavedId}
              onClick={() => applySavedSearch(saved)}
              endContent={
                <Badge label={String(saved.count)} variant="neutral" />
              }
            />
          ))}
        </List>
      </StackItem>
      <Divider />
      <div style={styles.railFooter}>{savePopover}</div>
    </Stack>
  );

  const mobileSavedRow = (
    <div style={styles.mobileSavedRow}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Selector
            label="Saved searches"
            isLabelHidden
            size="sm"
            width="100%"
            placeholder="Saved searches…"
            options={savedSearches.map(saved => ({
              value: saved.id,
              label: \`\${saved.name} · \${saved.count}\`,
            }))}
            value={activeSavedId ?? ''}
            onChange={value => {
              const saved = savedSearches.find(s => s.id === value);
              if (saved !== undefined) {
                applySavedSearch(saved);
              }
            }}
          />
        </StackItem>
        {savePopover}
      </HStack>
    </div>
  );

  // ---- grouped results ----

  const results =
    resultCount === 0 ? (
      <div style={styles.emptyWrap}>
        <EmptyState
          icon={<Icon icon={MailSearchIcon} size="lg" />}
          title="No messages match this search"
          description="The active filters contradict each other or nothing in the mailbox fits. Remove a chip above, or start over."
          actions={
            <Button label="Clear filters" variant="primary" onClick={clearAll} />
          }
        />
      </div>
    ) : (
      <VStack gap={0}>
        {groups.map(group => (
          <VStack gap={0} key={group.id}>
            <div style={styles.groupHeader}>
              <HStack gap={2} vAlign="center">
                <Heading level={3} accessibilityLevel={2}>
                  {group.title}
                </Heading>
                <Badge label={String(group.messages.length)} variant="neutral" />
              </HStack>
            </div>
            <List density="compact" hasDividers>
              {group.messages.map(message => (
                <ResultRow
                  key={message.id}
                  message={message}
                  terms={highlightTerms}
                />
              ))}
            </List>
          </VStack>
        ))}
      </VStack>
    );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <VStack gap={3} style={styles.headerStack}>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>Search mail</Heading>
                  <Text type="supporting" color="secondary">
                    {resultCount} {resultCount === 1 ? 'result' : 'results'}
                  </Text>
                </HStack>
              </StackItem>
            </HStack>
            {queryChipBar}
            {filterRow}
          </VStack>
        </LayoutHeader>
      }
      start={
        isRailCollapsed ? undefined : (
          <LayoutPanel width={260} padding={0} hasDivider label="Saved searches">
            {savedSearchRail}
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.resultsScroll}>
            {isRailCollapsed && mobileSavedRow}
            {results}
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};