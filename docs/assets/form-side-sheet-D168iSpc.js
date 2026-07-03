var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file form-side-sheet.tsx
 * @input Deterministic discount-code fixtures (codes, redemption counts,
 *   ISO schedule dates) — no clocks, randomness, or network assets. "Today"
 *   is the fixed constant 2026-07-02 so derived statuses never drift.
 * @output Side Sheet Form — a commerce promotions admin. The page is a
 *   searchable discounts Table; a slide-in sheet docked to the right edge
 *   (LayoutPanel in the Layout \`end\` slot, open by default) creates or edits
 *   a discount without leaving the list. The sheet has its own header with
 *   title + close IconButton, a scrollable FormLayout body (TextInput,
 *   Selector, NumberInput, DateInput, RadioList, Switch, TextArea), and a
 *   pinned footer with Cancel / Save actions.
 * @position Page template; emitted by \`astryx template form-side-sheet\`.
 *
 * Frame: header | table (LayoutContent, fill) | sheet (LayoutPanel end, 400).
 * Editing state lives in useState: the sheet is seeded open on the first
 * row; each row's Edit action reloads the draft, "New discount" opens a
 * blank draft, and Save writes the draft back into the rows fixture (or
 * appends) so the table reflects edits immediately. Every save/close is
 * announced through a visually hidden aria-live region.
 *
 * Responsive contract:
 * - > 960px: the sheet is a docked 400px LayoutPanel; the table takes the
 *   remaining width.
 * - 641–960px: the sheet narrows to 320px and the single-column form keeps
 *   working; the table yields width rather than the form fields.
 * - <= 640px: the docked panel is dropped; while open, the sheet takes over
 *   the content area full-width (the table returns on Cancel/Save/close),
 *   so neither the form nor the table is ever a sliver.
 * - Table: horizontal scroll inside Table's own scroll wrapper on narrow
 *   viewports; proportional columns keep a minimum so the name cell never
 *   collapses, pixel columns (code, value, used, status) keep width.
 *   Whole rows are tappable to edit, so the compact per-row Edit icon is a
 *   shortcut rather than the only (small) touch target.
 * - Sheet: the form body scrolls independently between the pinned sheet
 *   header and the pinned footer actions at every width.
 * - Page header: > 640px the title block keeps width via StackItem fill
 *   with search and the "New discount" button pinned right; <= 640px the
 *   search drops to its own full-width row so nothing clips.
 */

import {useMemo, useState, type CSSProperties} from 'react';

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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {DateInput} from '@astryxdesign/core/DateInput';
import type {ISODateString} from '@astryxdesign/core/Calendar';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  SearchIcon,
  SquarePenIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Sheet skeleton: pinned header, scrollable body, pinned footer.
  sheetFill: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  sheetHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  sheetBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  sheetFooter: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  tableWrap: {
    padding: 'var(--spacing-4)',
  },
  // <=640px the open sheet replaces the table full-width; full height so the
  // pinned sheet header/footer and scrolling body keep working.
  phoneSheet: {
    height: '100%',
    minHeight: 0,
  },
  emptyWrap: {
    padding: 'var(--spacing-8) var(--spacing-4)',
  },
  // Numeric table cells use tabular numerals so digit columns stay aligned.
  numericCell: {fontVariantNumeric: 'tabular-nums'},
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

// Fixed "today" so derived statuses (scheduled/expired) are deterministic.
const TODAY: ISODateString = '2026-07-02';

type DiscountType = 'percentage' | 'fixed' | 'shipping';
type AppliesTo = 'all' | 'collections' | 'first-order';

// The editable subset of a row — what the sheet's form binds to.
interface DiscountDraft {
  name: string;
  code: string;
  type: DiscountType;
  value: number | null;
  usageLimit: number | null;
  startsAt: ISODateString | undefined;
  endsAt: ISODateString | undefined;
  appliesTo: AppliesTo;
  isActive: boolean;
  note: string;
}

interface DiscountRow extends DiscountDraft, Record<string, unknown> {
  id: string;
  redemptions: number;
}

/** Explicit field pick (not a rest spread) so the draft stays fully typed. */
function toDraft(row: DiscountRow): DiscountDraft {
  return {
    name: row.name,
    code: row.code,
    type: row.type,
    value: row.value,
    usageLimit: row.usageLimit,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    appliesTo: row.appliesTo,
    isActive: row.isActive,
    note: row.note,
  };
}

const TYPE_OPTIONS = [
  {value: 'percentage', label: 'Percentage off'},
  {value: 'fixed', label: 'Fixed amount off'},
  {value: 'shipping', label: 'Free shipping'},
];

const TYPE_LABEL: Record<DiscountType, string> = {
  percentage: 'Percentage off',
  fixed: 'Fixed amount off',
  shipping: 'Free shipping',
};

const EMPTY_DRAFT: DiscountDraft = {
  name: '',
  code: '',
  type: 'percentage',
  value: null,
  usageLimit: null,
  startsAt: TODAY,
  endsAt: undefined,
  appliesTo: 'all',
  isActive: true,
  note: '',
};

// Deterministic fixtures: fixed ISO dates, fixed counts, no randomness.
const DISCOUNTS: DiscountRow[] = [
  {
    id: 'DSC-1041',
    name: 'Summer sale storewide',
    code: 'SUMMER20',
    type: 'percentage',
    value: 20,
    usageLimit: 5000,
    redemptions: 3182,
    startsAt: '2026-06-01',
    endsAt: '2026-08-31',
    appliesTo: 'all',
    isActive: true,
    note: 'Approved by merchandising for the June–August push. Do not stack with bundle pricing.',
  },
  {
    id: 'DSC-1038',
    name: 'First order welcome',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    usageLimit: null,
    redemptions: 12457,
    startsAt: '2026-01-15',
    endsAt: undefined,
    appliesTo: 'first-order',
    isActive: true,
    note: 'Evergreen acquisition offer surfaced in the post-signup email.',
  },
  {
    id: 'DSC-1036',
    name: 'Free shipping over holiday weekend',
    code: 'SHIPFREE',
    type: 'shipping',
    value: null,
    usageLimit: 2000,
    redemptions: 1994,
    startsAt: '2026-07-03',
    endsAt: '2026-07-06',
    appliesTo: 'all',
    isActive: true,
    note: 'Starts Friday. Ops confirmed carrier capacity for the weekend.',
  },
  {
    id: 'DSC-1033',
    name: 'Outdoor collection clearance',
    code: 'TRAIL15',
    type: 'fixed',
    value: 15,
    usageLimit: 800,
    redemptions: 412,
    startsAt: '2026-06-20',
    endsAt: '2026-07-20',
    appliesTo: 'collections',
    isActive: true,
    note: 'Applies to Trail & Camp collections only; clearing FW25 stock.',
  },
  {
    id: 'DSC-1029',
    name: 'Newsletter re-engagement',
    code: 'COMEBACK25',
    type: 'percentage',
    value: 25,
    usageLimit: 1500,
    redemptions: 236,
    startsAt: '2026-06-10',
    endsAt: '2026-07-10',
    appliesTo: 'all',
    isActive: false,
    note: 'Paused while lifecycle re-tests the subject line; resume after the July send.',
  },
  {
    id: 'DSC-1024',
    name: 'Spring flash sale',
    code: 'SPRING30',
    type: 'percentage',
    value: 30,
    usageLimit: 3000,
    redemptions: 3000,
    startsAt: '2026-04-18',
    endsAt: '2026-04-21',
    appliesTo: 'all',
    isActive: true,
    note: 'Fully redeemed within 72 hours. Keep for the seasonal report.',
  },
  {
    id: 'DSC-1019',
    name: 'VIP early access',
    code: 'VIPFIRST',
    type: 'fixed',
    value: 40,
    usageLimit: 250,
    redemptions: 187,
    startsAt: '2026-03-02',
    endsAt: '2026-05-31',
    appliesTo: 'collections',
    isActive: true,
    note: 'Loyalty tier 3+ only; codes distributed through the VIP concierge.',
  },
];

// ---------------------------------------------------------------------------
// DERIVED PRESENTATION
// ---------------------------------------------------------------------------

type Status = 'active' | 'scheduled' | 'paused' | 'expired';

const STATUS_BADGE: Record<
  Status,
  {variant: 'success' | 'info' | 'neutral' | 'warning'; label: string}
> = {
  active: {variant: 'success', label: 'Active'},
  scheduled: {variant: 'info', label: 'Scheduled'},
  paused: {variant: 'neutral', label: 'Paused'},
  expired: {variant: 'warning', label: 'Expired'},
};

/** Status derives from the toggle plus the schedule window vs. fixed TODAY. */
function rowStatus(row: DiscountRow): Status {
  if (!row.isActive) {
    return 'paused';
  }
  if (row.endsAt !== undefined && row.endsAt < TODAY) {
    return 'expired';
  }
  if (row.startsAt !== undefined && row.startsAt > TODAY) {
    return 'scheduled';
  }
  return 'active';
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Format '2026-06-01' as 'Jun 1' — string math only, no Date objects. */
function formatDate(iso: ISODateString | undefined): string {
  if (iso === undefined) {
    return 'No end';
  }
  const [, month, day] = iso.split('-');
  return \`\${MONTHS[Number(month) - 1]} \${Number(day)}\`;
}

function formatValue(row: Pick<DiscountDraft, 'type' | 'value'>): string {
  if (row.type === 'shipping') {
    return 'Free shipping';
  }
  if (row.value === null) {
    return '—';
  }
  return row.type === 'percentage' ? \`\${row.value}% off\` : \`$\${row.value} off\`;
}

// ---------------------------------------------------------------------------
// SIDE SHEET (right panel)
// ---------------------------------------------------------------------------

function DiscountSheet({
  draft,
  editingCode,
  onChange,
  onCancel,
  onSave,
}: {
  draft: DiscountDraft;
  editingCode: string | null;
  onChange: (patch: Partial<DiscountDraft>) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const isNew = editingCode === null;
  const canSave =
    draft.name.trim().length > 0 &&
    draft.code.trim().length > 0 &&
    (draft.type === 'shipping' || draft.value !== null);

  return (
    <div style={styles.sheetFill}>
      {/* Sheet header: title, record context, close. */}
      <div style={styles.sheetHeader}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <VStack gap={0.5}>
              <Heading level={2}>
                {isNew ? 'New discount' : 'Edit discount'}
              </Heading>
              <Text type="supporting" color="secondary">
                {isNew
                  ? 'Draft — not saved yet'
                  : \`\${editingCode} · changes apply on save\`}
              </Text>
            </VStack>
          </StackItem>
          <IconButton
            label="Close discount editor"
            icon={<Icon icon={XIcon} size="sm" />}
            variant="ghost"
            onClick={onCancel}
          />
        </HStack>
      </div>

      <Divider />

      {/* Scrollable form body between the pinned header and footer. */}
      <div style={styles.sheetBody}>
        <FormLayout>
          <TextInput
            label="Name"
            description="Internal only — customers see the code."
            placeholder="e.g. Summer sale storewide"
            value={draft.name}
            onChange={name => onChange({name})}
            isRequired
            width="100%"
          />
          <TextInput
            label="Discount code"
            description="Customers enter this at checkout."
            placeholder="e.g. SUMMER20"
            value={draft.code}
            onChange={code => onChange({code: code.toUpperCase()})}
            isRequired
            width="100%"
          />
          <Selector
            label="Type"
            options={TYPE_OPTIONS}
            value={draft.type}
            onChange={value =>
              onChange({
                type: value as DiscountType,
                // Free shipping carries no amount; clear a stale value.
                value: value === 'shipping' ? null : draft.value,
              })
            }
            width="100%"
          />
          {draft.type === 'shipping' ? null : (
            <NumberInput
              label={
                draft.type === 'percentage'
                  ? 'Percentage off'
                  : 'Amount off (USD)'
              }
              value={draft.value}
              onChange={value => onChange({value})}
              min={1}
              max={draft.type === 'percentage' ? 100 : undefined}
              step={1}
              hasClear
              width="100%"
            />
          )}
          <NumberInput
            label="Total usage limit"
            description="Leave empty for unlimited redemptions."
            value={draft.usageLimit}
            onChange={usageLimit => onChange({usageLimit})}
            min={1}
            step={1}
            hasClear
            width="100%"
          />
          <DateInput
            label="Starts"
            value={draft.startsAt}
            onChange={startsAt => onChange({startsAt})}
            width="100%"
          />
          <DateInput
            label="Ends"
            description="Leave empty for no end date."
            value={draft.endsAt}
            onChange={endsAt => onChange({endsAt})}
            min={draft.startsAt}
            width="100%"
          />
          <RadioList
            label="Applies to"
            value={draft.appliesTo}
            onChange={appliesTo =>
              onChange({appliesTo: appliesTo as AppliesTo})
            }>
            <RadioListItem label="Entire catalog" value="all" />
            <RadioListItem
              label="Selected collections"
              value="collections"
              description="Choose collections after saving."
            />
            <RadioListItem
              label="First order only"
              value="first-order"
              description="One redemption per new customer."
            />
          </RadioList>
          <Switch
            label="Active"
            description="Inactive discounts are rejected at checkout."
            value={draft.isActive}
            onChange={isActive => onChange({isActive})}
          />
          <TextArea
            label="Internal note"
            placeholder="Context for teammates, e.g. campaign or approver..."
            value={draft.note}
            onChange={note => onChange({note})}
            rows={3}
            width="100%"
          />
        </FormLayout>
      </div>

      <Divider />

      {/* Pinned footer actions. */}
      <div style={styles.sheetFooter}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              {formatValue(draft)}
            </Text>
          </StackItem>
          <Button label="Cancel" variant="secondary" onClick={onCancel} />
          <Button
            label={isNew ? 'Create discount' : 'Save changes'}
            isDisabled={!canSave}
            onClick={onSave}
          />
        </HStack>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function FormSideSheetTemplate() {
  const [rows, setRows] = useState<DiscountRow[]>(DISCOUNTS);
  const [query, setQuery] = useState('');
  // Sheet state: open by default, editing the first fixture row.
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(DISCOUNTS[0].id);
  const [draft, setDraft] = useState<DiscountDraft>(() =>
    toDraft(DISCOUNTS[0]),
  );
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: below 960px the sheet narrows to 320px so the
  // single-column form keeps working while the table yields width. At phone
  // widths the docked panel is dropped entirely — the open sheet takes over
  // the content area full-width instead of squeezing the table to a sliver.
  const isNarrow = useMediaQuery('(max-width: 960px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  const editingCode =
    editingId === null
      ? null
      : (rows.find(row => row.id === editingId)?.code ?? null);

  const openForEdit = (row: DiscountRow) => {
    setEditingId(row.id);
    setDraft(toDraft(row));
    setIsSheetOpen(true);
  };

  const openForCreate = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setAnnouncement('Discount editor closed');
  };

  const saveDraft = () => {
    if (editingId === null) {
      // Append: next id derives from the current max, so it is deterministic.
      const maxId = rows.reduce(
        (max, row) => Math.max(max, Number(row.id.slice(4))),
        0,
      );
      setRows(prev => [
        {id: \`DSC-\${maxId + 1}\`, redemptions: 0, ...draft},
        ...prev,
      ]);
      setAnnouncement(\`Created discount \${draft.code}\`);
    } else {
      setRows(prev =>
        prev.map(row => (row.id === editingId ? {...row, ...draft} : row)),
      );
      setAnnouncement(\`Saved changes to \${draft.code}\`);
    }
    setIsSheetOpen(false);
  };

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) {
      return rows;
    }
    return rows.filter(row =>
      \`\${row.code} \${row.name}\`.toLowerCase().includes(needle),
    );
  }, [rows, query]);

  const activeCount = rows.filter(row => rowStatus(row) === 'active').length;

  const columns = useMemo<TableColumn<DiscountRow>[]>(
    () => [
      {
        key: 'code',
        header: 'Code',
        width: pixel(130),
        renderCell: (row: DiscountRow) => (
          <Text type="label">{row.code}</Text>
        ),
      },
      {
        key: 'name',
        header: 'Name',
        width: proportional(2),
        renderCell: (row: DiscountRow) => (
          <VStack gap={0.5}>
            <Text type="body" maxLines={1}>
              {row.name}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {TYPE_LABEL[row.type]}
            </Text>
          </VStack>
        ),
      },
      {
        key: 'value',
        header: 'Value',
        width: pixel(120),
        renderCell: (row: DiscountRow) => (
          <span style={styles.numericCell}>
            <Text type="body">{formatValue(row)}</Text>
          </span>
        ),
      },
      {
        key: 'redemptions',
        header: 'Used',
        width: pixel(110),
        renderCell: (row: DiscountRow) => (
          <span style={styles.numericCell}>
            <Text type="body">
              {row.usageLimit === null
                ? \`\${row.redemptions.toLocaleString('en-US')}\`
                : \`\${row.redemptions.toLocaleString('en-US')} / \${row.usageLimit.toLocaleString('en-US')}\`}
            </Text>
          </span>
        ),
      },
      {
        key: 'schedule',
        header: 'Schedule',
        width: pixel(140),
        renderCell: (row: DiscountRow) => (
          <span style={styles.numericCell}>
            <Text type="body" color="secondary">
              {formatDate(row.startsAt)} → {formatDate(row.endsAt)}
            </Text>
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        width: pixel(110),
        renderCell: (row: DiscountRow) => {
          const badge = STATUS_BADGE[rowStatus(row)];
          return <Badge variant={badge.variant} label={badge.label} />;
        },
      },
      {
        key: 'actions',
        header: '',
        width: pixel(56),
        renderCell: (row: DiscountRow) => (
          <IconButton
            label={\`Edit \${row.code}\`}
            icon={<Icon icon={SquarePenIcon} size="sm" />}
            variant="ghost"
            size="sm"
            onClick={() => openForEdit(row)}
          />
        ),
      },
    ],
    // openForEdit is recreated per render but only closes over setters;
    // rows/draft identity is what matters for cell content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Whole-row touch target: the compact per-row Edit icon is well under the
  // ~40px touch guideline, so clicking/tapping anywhere on a row also opens
  // the editor (the hasHover highlight already advertises the affordance).
  const rowOpenPlugin: TablePlugin<DiscountRow> = {
    transformBodyRow: (props, item) => ({
      ...props,
      htmlProps: {
        ...props.htmlProps,
        onClick: () => openForEdit(item),
        style: {...props.htmlProps.style, cursor: 'pointer'},
      },
    }),
  };

  // Rendered either as the docked end panel (> 640px) or as a full-width
  // content takeover on phones.
  const sheet = (
    <DiscountSheet
      draft={draft}
      editingCode={editingCode}
      onChange={patch => setDraft(prev => ({...prev, ...patch}))}
      onCancel={closeSheet}
      onSave={saveDraft}
    />
  );

  const titleBlock = (
    <HStack gap={2} vAlign="center">
      <Heading level={1}>Discounts</Heading>
      <Text type="supporting" color="secondary">
        {activeCount} active
      </Text>
    </HStack>
  );
  const searchField = (
    <TextInput
      label="Search discounts"
      isLabelHidden
      size="sm"
      placeholder="Search code or name..."
      startIcon={<Icon icon={SearchIcon} size="sm" />}
      value={query}
      onChange={setQuery}
      hasClear
      width={isPhone ? '100%' : undefined}
    />
  );
  const newButton = (
    <Button
      label="New discount"
      icon={<Icon icon={PlusIcon} size="sm" />}
      size="sm"
      onClick={openForCreate}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {/* <=640px the single header row would exceed the viewport's
              min-content and clip the title, so the search drops to its
              own full-width row. */}
          {isPhone ? (
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">{titleBlock}</StackItem>
                {newButton}
              </HStack>
              {searchField}
            </VStack>
          ) : (
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">{titleBlock}</StackItem>
              {searchField}
              {newButton}
            </HStack>
          )}
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {/* <=640px there is no room for a docked panel beside the table,
              so the open sheet takes over the content area full-width. */}
          {isPhone && isSheetOpen ? (
            <div style={styles.phoneSheet} role="region" aria-label="Discount editor">
              {sheet}
            </div>
          ) : visibleRows.length === 0 ? (
            <div style={styles.emptyWrap}>
              <EmptyState
                icon={<Icon icon={SearchIcon} size="lg" />}
                title="No matching discounts"
                description="Try a different code or name, or create a new discount."
                actions={
                  <Button
                    label="New discount"
                    icon={<Icon icon={PlusIcon} size="sm" />}
                    onClick={openForCreate}
                  />
                }
              />
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <Table<DiscountRow>
                data={visibleRows}
                columns={columns}
                density="balanced"
                hasHover
                plugins={{rowOpen: rowOpenPlugin}}
              />
            </div>
          )}
        </LayoutContent>
      }
      end={
        isSheetOpen && !isPhone ? (
          <LayoutPanel
            hasDivider
            padding={0}
            width={isNarrow ? 320 : 400}
            label="Discount editor">
            {sheet}
          </LayoutPanel>
        ) : undefined
      }
    />
  );
}
`;export{e as default};