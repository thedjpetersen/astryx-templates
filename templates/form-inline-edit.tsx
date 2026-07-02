// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (saved workspace settings, timezone /
 *   week-start / date-format options, read-only plan and identifier rows)
 * @output Workspace settings page in display mode: three Sections of
 *   label-left / value-right rows, each editable row carrying an Edit
 *   affordance that swaps just that row into a TextInput, TextArea, or
 *   Selector with inline Save / Cancel; plus a read-only plan section
 * @position Page template; emitted by `astryx template form-inline-edit`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the page
 * title and scope line; LayoutContent scrolls a contentWidth={720} column
 * of Sections. Rows are the container here — each setting is one
 * Divider-separated row inside a Section, mirroring the label-left /
 * value-right pattern settings pages use.
 *
 * Interaction contract (per-row inline editing):
 * - A useState map of field id → draft string is the single source of
 *   editing truth: key present = row is editing, value = working copy.
 *   Multiple rows can be open at once; each Save/Cancel touches only its
 *   own key.
 * - Save commits the draft to the values map and drops the draft; Cancel
 *   just drops the draft. Enter saves and Escape cancels in single-line
 *   inputs; freshly opened text inputs and textareas autofocus.
 * - Rows with a validator (name, slug, emails) show an inline error
 *   status and disable Save until the draft passes.
 * - Each save is announced through a visually-hidden aria-live region and
 *   a "Saved" badge on the row's label; the badge stays until another row
 *   saves or the row re-enters editing.
 *
 * Responsive contract:
 * - Column: Layout contentWidth={720} centers a max 720px column on wide
 *   viewports; below that the column keeps full width minus slot padding.
 * - >640px: each row is a two-column grid — 220px label cell (label +
 *   supporting description) on the left, value plus Edit affordance on
 *   the right. The value cell fills; the Edit button never shrinks.
 * - <=640px: the label cell stacks above the value; the Edit affordance
 *   stays pinned to the top-right of the row next to the label.
 * - Header stays pinned; only the settings column scrolls
 *   (height="fill" keeps scrolling inside LayoutContent).
 * - No rows hide at any breakpoint; long values wrap inside their cell.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Code} from '@astryxdesign/core/Code';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Section} from '@astryxdesign/core/Section';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {SquarePenIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Fixed label column so values line up across rows (wide layout only).
  labelColumn: {
    width: 220,
    flexShrink: 0,
  },
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

// ============= DATA =============

type FieldId =
  | 'name'
  | 'slug'
  | 'description'
  | 'billingEmail'
  | 'supportEmail'
  | 'timezone'
  | 'weekStart'
  | 'dateFormat';

interface SettingField {
  id: FieldId;
  label: string;
  /** Supporting copy under the label in display and edit modes. */
  description: string;
  control: 'text' | 'email' | 'textarea' | 'select';
  options?: Array<{value: string; label: string}>;
  /** Render the display value in a Code chip (slugs, identifiers). */
  isCode?: boolean;
  /** Returns an error message for a draft, or null when it is valid. */
  validate?: (draft: string) => string | null;
}

// Saved settings for the Brightlake analytics workspace. Rows seed from
// this snapshot; each row's Save promotes its draft into the map.
const SAVED_SETTINGS: Record<FieldId, string> = {
  name: 'Brightlake Analytics',
  slug: 'brightlake-analytics',
  description:
    'Product analytics workspace for the Brightlake web and mobile apps. Dashboards are owned by the growth team; event schemas live in #analytics-infra.',
  billingEmail: 'finance@brightlake.io',
  supportEmail: 'support@brightlake.io',
  timezone: 'america-los_angeles',
  weekStart: 'monday',
  dateFormat: 'mdy',
};

const TIMEZONE_OPTIONS = [
  {value: 'america-los_angeles', label: 'Pacific Time (US & Canada)'},
  {value: 'america-denver', label: 'Mountain Time (US & Canada)'},
  {value: 'america-chicago', label: 'Central Time (US & Canada)'},
  {value: 'america-new_york', label: 'Eastern Time (US & Canada)'},
  {value: 'europe-london', label: 'London (GMT/BST)'},
  {value: 'europe-berlin', label: 'Berlin (CET)'},
  {value: 'asia-tokyo', label: 'Tokyo (JST)'},
];

const WEEK_START_OPTIONS = [
  {value: 'sunday', label: 'Sunday'},
  {value: 'monday', label: 'Monday'},
];

const DATE_FORMAT_OPTIONS = [
  {value: 'mdy', label: 'MM/DD/YYYY (06/30/2026)'},
  {value: 'dmy', label: 'DD/MM/YYYY (30/06/2026)'},
  {value: 'ymd', label: 'YYYY-MM-DD (2026-06-30)'},
];

// Deliberately simple: enough to catch "no @" and "no domain" while the
// user types. Real submission validation belongs server-side.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function validateRequired(label: string) {
  return (draft: string) =>
    draft.trim() === '' ? `${label} is required.` : null;
}

function validateEmail(draft: string): string | null {
  if (draft.trim() === '') {
    return 'An email address is required.';
  }
  if (!EMAIL_PATTERN.test(draft.trim())) {
    return 'Enter a valid email address, like name@company.com.';
  }
  return null;
}

function validateSlug(draft: string): string | null {
  if (draft.trim() === '') {
    return 'A workspace URL is required.';
  }
  if (!SLUG_PATTERN.test(draft)) {
    return 'Use lowercase letters, numbers, and hyphens only.';
  }
  return null;
}

// Field groups drive the Sections. Each row renders from this config, so
// the row component stays generic across text / textarea / select rows.
const FIELD_GROUPS: ReadonlyArray<{
  title: string;
  description: string;
  fields: SettingField[];
}> = [
  {
    title: 'General',
    description: 'How this workspace appears across Brightlake and shared links.',
    fields: [
      {
        id: 'name',
        label: 'Workspace name',
        description: 'Shown in the sidebar, invites, and email digests.',
        control: 'text',
        validate: validateRequired('Workspace name'),
      },
      {
        id: 'slug',
        label: 'Workspace URL',
        description: 'app.brightlake.io/<slug> — changing it breaks old links.',
        control: 'text',
        isCode: true,
        validate: validateSlug,
      },
      {
        id: 'description',
        label: 'Description',
        description: 'Internal note shown on the workspace switcher.',
        control: 'textarea',
      },
    ],
  },
  {
    title: 'Contacts',
    description: 'Where invoices and customer replies are delivered.',
    fields: [
      {
        id: 'billingEmail',
        label: 'Billing email',
        description: 'Receives invoices, receipts, and payment reminders.',
        control: 'email',
        validate: validateEmail,
      },
      {
        id: 'supportEmail',
        label: 'Support email',
        description: 'Reply-to address on alert and digest emails.',
        control: 'email',
        validate: validateEmail,
      },
    ],
  },
  {
    title: 'Regional preferences',
    description: 'Defaults applied to every dashboard and scheduled report.',
    fields: [
      {
        id: 'timezone',
        label: 'Default timezone',
        description: 'Query windows and report schedules use this zone.',
        control: 'select',
        options: TIMEZONE_OPTIONS,
      },
      {
        id: 'weekStart',
        label: 'Week starts on',
        description: 'Affects weekly rollups and calendar pickers.',
        control: 'select',
        options: WEEK_START_OPTIONS,
      },
      {
        id: 'dateFormat',
        label: 'Date format',
        description: 'Display format for dashboards and exports.',
        control: 'select',
        options: DATE_FORMAT_OPTIONS,
      },
    ],
  },
];

// ============= ROW =============

// The label cell: label, "Saved" badge on the most recently saved row,
// and supporting description.
function RowLabel({
  field,
  isJustSaved,
}: {
  field: SettingField;
  isJustSaved: boolean;
}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <Text type="label">{field.label}</Text>
        {isJustSaved ? <Badge variant="success" label="Saved" /> : null}
      </HStack>
      <Text type="supporting" color="secondary">
        {field.description}
      </Text>
    </VStack>
  );
}

// One settings row. Display mode shows the committed value plus an Edit
// affordance; edit mode swaps the value cell for the matching input with
// inline Save / Cancel. Only this row's draft is touched either way.
function SettingRow({
  field,
  value,
  draft,
  isNarrow,
  isJustSaved,
  onStartEdit,
  onDraftChange,
  onSave,
  onCancel,
}: {
  field: SettingField;
  value: string;
  draft: string | undefined;
  isNarrow: boolean;
  isJustSaved: boolean;
  onStartEdit: (id: FieldId) => void;
  onDraftChange: (id: FieldId, draft: string) => void;
  onSave: (id: FieldId) => void;
  onCancel: (id: FieldId) => void;
}) {
  const isEditing = draft !== undefined;
  const error =
    isEditing && field.validate ? field.validate(draft) : null;

  const displayValue: ReactNode = (() => {
    if (field.control === 'select') {
      const option = field.options?.find(item => item.value === value);
      return <Text type="body">{option?.label ?? value}</Text>;
    }
    if (field.isCode) {
      return <Code>{value}</Code>;
    }
    if (value.trim() === '') {
      return (
        <Text type="body" color="secondary">
          Not set
        </Text>
      );
    }
    return <Text type="body">{value}</Text>;
  })();

  const editor: ReactNode = (() => {
    if (!isEditing) {
      return null;
    }
    if (field.control === 'select') {
      return (
        <Selector
          label={field.label}
          isLabelHidden
          options={field.options ?? []}
          value={draft}
          onChange={next => onDraftChange(field.id, next)}
          width="100%"
        />
      );
    }
    if (field.control === 'textarea') {
      return (
        <TextArea
          label={field.label}
          isLabelHidden
          hasAutoFocus
          rows={3}
          value={draft}
          onChange={next => onDraftChange(field.id, next)}
          width="100%"
        />
      );
    }
    return (
      <TextInput
        type={field.control === 'email' ? 'email' : 'text'}
        label={field.label}
        isLabelHidden
        hasAutoFocus
        value={draft}
        onChange={next => onDraftChange(field.id, next)}
        onEnter={() => {
          if (error === null) {
            onSave(field.id);
          }
        }}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            onCancel(field.id);
          }
        }}
        status={error ? {type: 'error', message: error} : undefined}
        width="100%"
      />
    );
  })();

  const editButton = (
    <Button
      label="Edit"
      variant="ghost"
      size="sm"
      icon={<Icon icon={SquarePenIcon} size="sm" />}
      onClick={() => onStartEdit(field.id)}
    />
  );

  const valueCell = isEditing ? (
    <VStack gap={2}>
      {editor}
      <HStack gap={2}>
        <Button
          label="Save"
          variant="primary"
          size="sm"
          isDisabled={error !== null}
          onClick={() => onSave(field.id)}
        />
        <Button
          label="Cancel"
          variant="secondary"
          size="sm"
          onClick={() => onCancel(field.id)}
        />
      </HStack>
    </VStack>
  ) : (
    displayValue
  );

  if (isNarrow) {
    // Label stacks above the value; Edit stays pinned top-right.
    return (
      <VStack gap={2}>
        <HStack gap={2} vAlign="start">
          <StackItem size="fill">
            <RowLabel field={field} isJustSaved={isJustSaved} />
          </StackItem>
          {isEditing ? null : editButton}
        </HStack>
        {valueCell}
      </VStack>
    );
  }

  return (
    <HStack gap={4} vAlign="start">
      <div style={styles.labelColumn}>
        <RowLabel field={field} isJustSaved={isJustSaved} />
      </div>
      <StackItem size="fill">{valueCell}</StackItem>
      {isEditing ? null : editButton}
    </HStack>
  );
}

// A read-only row (plan, identifiers): same label-left / value-right
// geometry, but the affordance slot holds an action link or nothing.
function ReadOnlyRow({
  label,
  description,
  value,
  action,
  isNarrow,
}: {
  label: string;
  description: string;
  value: ReactNode;
  action?: ReactNode;
  isNarrow: boolean;
}) {
  const labelCell = (
    <VStack gap={1}>
      <Text type="label">{label}</Text>
      <Text type="supporting" color="secondary">
        {description}
      </Text>
    </VStack>
  );
  if (isNarrow) {
    return (
      <VStack gap={2}>
        <HStack gap={2} vAlign="start">
          <StackItem size="fill">{labelCell}</StackItem>
          {action}
        </HStack>
        {value}
      </VStack>
    );
  }
  return (
    <HStack gap={4} vAlign="start">
      <div style={styles.labelColumn}>{labelCell}</div>
      <StackItem size="fill">{value}</StackItem>
      {action}
    </HStack>
  );
}

// One grouped Section: heading + explainer, then Divider-separated rows.
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Section variant="section" padding={5}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>{title}</Heading>
          <Text type="supporting" color="secondary">
            {description}
          </Text>
        </VStack>
        {children}
      </VStack>
    </Section>
  );
}

// ============= PAGE =============

export default function FormInlineEditTemplate() {
  // Committed values, seeded from the saved snapshot.
  const [values, setValues] =
    useState<Record<FieldId, string>>(SAVED_SETTINGS);
  // Per-row editing map: key present = that row is editing, value = the
  // working draft. Independent keys let several rows edit at once.
  const [drafts, setDrafts] = useState<Partial<Record<FieldId, string>>>({});
  // Which row most recently saved (shows the "Saved" badge) plus an
  // aria-live announcement for screen readers.
  const [lastSavedId, setLastSavedId] = useState<FieldId | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const isNarrow = useMediaQuery('(max-width: 640px)');

  const startEdit = (id: FieldId) => {
    setDrafts(prev => ({...prev, [id]: values[id]}));
    setLastSavedId(prev => (prev === id ? null : prev));
  };

  const changeDraft = (id: FieldId, draft: string) => {
    setDrafts(prev => ({...prev, [id]: draft}));
  };

  const cancelEdit = (id: FieldId) => {
    setDrafts(prev => {
      const {[id]: _removed, ...rest} = prev;
      return rest;
    });
  };

  const saveEdit = (id: FieldId) => {
    const draft = drafts[id];
    if (draft === undefined) {
      return;
    }
    setValues(prev => ({...prev, [id]: draft}));
    cancelEdit(id);
    setLastSavedId(id);
    const field = FIELD_GROUPS.flatMap(group => group.fields).find(
      item => item.id === id,
    );
    setAnnouncement(field ? `${field.label} saved.` : 'Setting saved.');
  };

  return (
    <Layout
      height="fill"
      contentWidth={720}
      header={
        <LayoutHeader hasDivider>
          <VStack gap={1}>
            <Heading level={1}>Workspace settings</Heading>
            <Text type="supporting" color="secondary">
              Name, contacts, and regional defaults for the Brightlake
              Analytics workspace. Changes apply to all 34 members.
            </Text>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <VStack gap={4}>
            {FIELD_GROUPS.map(group => (
              <SettingsSection
                key={group.title}
                title={group.title}
                description={group.description}>
                <VStack gap={4}>
                  {group.fields.map((field, index) => (
                    <VStack key={field.id} gap={4}>
                      {index > 0 ? <Divider variant="subtle" /> : null}
                      <SettingRow
                        field={field}
                        value={values[field.id]}
                        draft={drafts[field.id]}
                        isNarrow={isNarrow}
                        isJustSaved={lastSavedId === field.id}
                        onStartEdit={startEdit}
                        onDraftChange={changeDraft}
                        onSave={saveEdit}
                        onCancel={cancelEdit}
                      />
                    </VStack>
                  ))}
                </VStack>
              </SettingsSection>
            ))}

            <SettingsSection
              title="Plan & identifiers"
              description="Managed by Brightlake — contact support to change these.">
              <VStack gap={4}>
                <ReadOnlyRow
                  label="Plan"
                  description="Renews on August 1, 2026."
                  isNarrow={isNarrow}
                  value={
                    <HStack gap={2} vAlign="center">
                      <Badge variant="info" label="Growth" />
                      <Text type="body">$249/month, billed annually</Text>
                    </HStack>
                  }
                  action={
                    <Button
                      label="Manage plan"
                      variant="ghost"
                      size="sm"
                      href="#"
                    />
                  }
                />
                <Divider variant="subtle" />
                <ReadOnlyRow
                  label="Workspace ID"
                  description="Use this ID when calling the Brightlake API."
                  isNarrow={isNarrow}
                  value={<Code>ws_8f4e21ca9b</Code>}
                />
                <Divider variant="subtle" />
                <ReadOnlyRow
                  label="Data region"
                  description="Where event data is stored and processed."
                  isNarrow={isNarrow}
                  value={<Text type="body">US West (Oregon)</Text>}
                />
              </VStack>
            </SettingsSection>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
