// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (eight control-family panel specs, a
 *   30-person user directory backing the comboboxes, plan/region/assignee
 *   option lists, four sync-surface checkbox rows, three pricing radio
 *   tiers, and the "Delete workspace" AlertDialog copy)
 * @output Form-controls gallery: a section rail plus eight labeled panels,
 *   each showing 3-5 live variants of one control family — input groups
 *   (leading icon, https://-prefix/.astryx.app-suffix add-on, inline
 *   validation that clears on fix, pill search with clear), select menus
 *   (native-styled Selector, custom Popover listbox with descriptions,
 *   avatar option rows), textareas (basic, autogrow with a 280-char
 *   counter, toolbar-attached with Bold/Italic/List toggles), radio groups
 *   (stacked with descriptions, card selector, pricing-table radios),
 *   checkboxes (indeterminate parent derived from four children, card
 *   checkboxes), toggles (simple, Monthly/Annual flanked labels, per-row
 *   settings list), comboboxes (Typeahead over 30 users with keyboard
 *   navigation and an empty-result message, multi-select Tokenizer chips),
 *   and action panels (enable/disable, destructive with confirm dialog and
 *   undo Banner, input-embedded invite). A mono state readout strip at the
 *   bottom of each panel prints the panel's current values as JSON, and a
 *   header Reset-all control returns every panel to its fixture state.
 * @position Page template; emitted by `astryx template form-controls-gallery`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title
 * 'Form controls — 8 panels', panel-count Badge, Reset all Button).
 * LayoutContent hosts an HStack: a 200px sticky section rail (Buttons that
 * scrollIntoView the matching panel) beside a single scroll column of
 * eight Section panels (maxWidth 760). Every panel is a Card with a
 * numbered mono Token caption, a variant grid, and the state readout
 * strip. This is a control-anatomy reference sheet, not a submit flow:
 * choose form-page when the deliverable is one real form with a footer.
 *
 * Responsive contract:
 * - Panel column: maxWidth 760; the rail (200px, sticky inside the
 *   LayoutContent scroll region) sits to its left on wide viewports.
 * - <=900px: the rail hides entirely and a "Jump to section" Selector
 *   takes its place above the column — no hover-only navigation.
 * - Variant rows (tier cards, card checkboxes) are flexWrap grids that
 *   fall from three-up to one-per-row; nothing truncates or hides.
 * - <=640px: sm Buttons/IconButtons grow to 40px tap targets via a style
 *   override; Switch rows keep their full-width hit area; the readout
 *   strip scrolls horizontally (deliberate overflowX) instead of wrapping
 *   JSON mid-token.
 * - All interactions are click/tap + keyboard (Typeahead arrows/Enter);
 *   nothing requires hover.
 *
 * Container policy (control-gallery archetype): each family is one Card
 * panel so focus rings and add-on borders read against the page
 * background; variants inside a panel are separated by labeled sub-blocks
 * and Dividers, never nested cards. Accent and error color arrive via
 * component status props, Badges, and the destructive Button — no raw hex.
 *
 * Fixture policy: fixed strings and lists only; no clocks, randomness, or
 * network assets. Avatars are initials-only.
 */

import {useRef, useState, type CSSProperties, type ReactNode} from 'react';

import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Code} from '@astryxdesign/core/Code';
import {Divider} from '@astryxdesign/core/Divider';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {Popover} from '@astryxdesign/core/Popover';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Section} from '@astryxdesign/core/Section';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tokenizer} from '@astryxdesign/core/Tokenizer';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {
  Typeahead,
  TypeaheadItem,
  type SearchableItem,
  type SearchSource,
} from '@astryxdesign/core/Typeahead';
import {
  BoldIcon,
  BuildingIcon,
  ChevronDownIcon,
  DownloadIcon,
  HistoryIcon,
  ItalicIcon,
  ListIcon,
  MailIcon,
  RocketIcon,
  RotateCcwIcon,
  SearchIcon,
  SendIcon,
  ShieldCheckIcon,
  Trash2Icon,
  ZapIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Rail + column share the LayoutContent scroll region; the rail is
  // sticky so it stays visible while the panels scroll past.
  contentRow: {alignItems: 'flex-start'},
  rail: {
    position: 'sticky',
    top: 'var(--spacing-4)',
    width: 200,
    flexShrink: 0,
  },
  railButton: {width: '100%', justifyContent: 'flex-start'},
  column: {
    width: '100%',
    maxWidth: 760,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-4)',
    minWidth: 0,
  },
  // Variant sub-blocks inside a panel; the label row sits above each.
  variantBlock: {minWidth: 0},
  // Add-on input group: flat boxes fused to the input's start and end.
  addonBox: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  addonInput: {minWidth: 0},
  // Pill search: rounded input; style lands on the input element.
  pillInput: {borderRadius: 999},
  // Card grids (tier radios, card checkboxes) wrap instead of squeezing.
  cardGrid: {flexWrap: 'wrap'},
  cardGridItem: {flexGrow: 1, flexBasis: 200, minWidth: 0},
  // Toolbar-attached textarea: toolbar and field fused in one Card.
  toolbarField: {
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-2)',
  },
  toolbarRow: {
    paddingInline: 'var(--spacing-1)',
    paddingBlock: 'var(--spacing-1)',
  },
  // Custom listbox rows live inside a Popover body.
  listboxBody: {padding: 'var(--spacing-1)'},
  // Settings-list toggle rows.
  settingsRow: {paddingBlock: 'var(--spacing-2)'},
  // State readout strip: mono JSON, scrolls sideways on narrow screens
  // (deliberate overflowX; JSON should never wrap mid-token).
  readout: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
  },
  // <=640px: grow sm tap controls to ~40px targets; glyphs stay sm.
  buttonTapTarget: {height: 40},
  chipWrap: {flexWrap: 'wrap'},
  priceText: {flexShrink: 0},
};

// ============= SECTION SPECS =============

interface PanelSpec {
  id: string;
  index: string;
  title: string;
  blurb: string;
}

const PANELS: PanelSpec[] = [
  {
    id: 'input-groups',
    index: '01',
    title: 'Input groups',
    blurb:
      'Leading icon, add-on prefix/suffix, inline validation that clears on fix, and a pill search.',
  },
  {
    id: 'select-menus',
    index: '02',
    title: 'Select menus',
    blurb:
      'Native-styled Selector, a custom listbox with descriptions, and avatar option rows.',
  },
  {
    id: 'textareas',
    index: '03',
    title: 'Textareas',
    blurb:
      'Basic field, autogrow with a 280-character counter, and a toolbar-attached editor.',
  },
  {
    id: 'radio-groups',
    index: '04',
    title: 'Radio groups',
    blurb:
      'Stacked with descriptions, card selector, and small-table pricing radios.',
  },
  {
    id: 'checkboxes',
    index: '05',
    title: 'Checkboxes',
    blurb:
      'A list under an indeterminate parent derived from its children, plus card checkboxes.',
  },
  {
    id: 'toggles',
    index: '06',
    title: 'Toggles',
    blurb:
      'Simple switch, Monthly/Annual flanked labels, and a per-row settings list.',
  },
  {
    id: 'comboboxes',
    index: '07',
    title: 'Comboboxes',
    blurb:
      'Typeahead over 30 users with keyboard navigation and an empty-result state; multi-select chips.',
  },
  {
    id: 'action-panels',
    index: '08',
    title: 'Action panels',
    blurb:
      'Title + description + button, destructive with confirm, and an input-embedded panel.',
  },
];

// ============= FIXTURES =============
// Deterministic fixtures: fixed strings and lists, no clocks or randomness.

// Deliberately simple: catches "no @" and "no domain" while typing. Real
// submission validation belongs server-side.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBDOMAIN_PATTERN = /^[a-z0-9-]+$/;

const REGION_OPTIONS = [
  {value: 'us-east-1', label: 'US East (N. Virginia)'},
  {value: 'us-west-2', label: 'US West (Oregon)'},
  {value: 'eu-central-1', label: 'EU Central (Frankfurt)'},
  {value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)'},
];

const ENVIRONMENT_OPTIONS = [
  {
    id: 'production',
    label: 'Production',
    description: 'Live traffic. Deploys require an approval.',
  },
  {
    id: 'staging',
    label: 'Staging',
    description: 'Mirrors production data nightly.',
  },
  {
    id: 'preview',
    label: 'Preview',
    description: 'One environment per open pull request.',
  },
  {
    id: 'local',
    label: 'Local',
    description: 'Runs against seeded fixture data only.',
  },
];

const ASSIGNEE_OPTIONS = [
  {id: 'priya', name: 'Priya Raman', role: 'Dispatch operations lead'},
  {id: 'sam', name: 'Sam Okafor', role: 'Infrastructure engineer'},
  {id: 'noor', name: 'Noor Haddad', role: 'Product designer'},
  {id: 'felix', name: 'Felix Grant', role: 'Support engineer'},
];

const NOTIFY_OPTIONS = [
  {
    value: 'all',
    label: 'All activity',
    description: 'Every comment, mention, and status change.',
  },
  {
    value: 'mentions',
    label: 'Mentions only',
    description: 'Only when someone @mentions you directly.',
  },
  {
    value: 'none',
    label: 'Nothing',
    description: 'Mute this project — the digest still arrives weekly.',
  },
];

const TIER_CARDS = [
  {
    id: 'starter',
    label: 'Starter',
    description: 'For side projects. 1 environment, community support.',
    icon: ZapIcon,
  },
  {
    id: 'growth',
    label: 'Growth',
    description: 'For small teams. 3 environments, email support.',
    icon: RocketIcon,
  },
  {
    id: 'scale',
    label: 'Scale',
    description: 'For orgs. Unlimited environments, SSO, 99.9% SLA.',
    icon: BuildingIcon,
  },
];

const PRICING_RADIOS = [
  {value: 'hobby', label: 'Hobby', seats: '1 seat', price: '$0/mo'},
  {value: 'pro', label: 'Pro', seats: 'Up to 5 seats', price: '$20/mo'},
  {value: 'team', label: 'Team', seats: 'Up to 25 seats', price: '$45/mo'},
];

const SYNC_SURFACES = [
  {id: 'issues', label: 'Issues', description: 'Two-way sync with the tracker.'},
  {id: 'docs', label: 'Docs', description: 'Published pages only.'},
  {id: 'deploys', label: 'Deploys', description: 'Status events and rollbacks.'},
  {id: 'alerts', label: 'Alerts', description: 'Paging and incident timelines.'},
];

// Initial fixture: a mixed state so the parent renders indeterminate.
const INITIAL_SURFACES: Record<string, boolean> = {
  issues: true,
  docs: true,
  deploys: false,
  alerts: false,
};

const ADDON_CARDS = [
  {
    id: 'audit-log',
    label: 'Audit log',
    description: '90-day trail of every admin action.',
    icon: HistoryIcon,
  },
  {
    id: 'sso',
    label: 'SSO enforcement',
    description: 'Require SAML sign-in for all members.',
    icon: ShieldCheckIcon,
  },
  {
    id: 'data-export',
    label: 'Data export',
    description: 'Nightly snapshots to your own bucket.',
    icon: DownloadIcon,
  },
];

const SETTINGS_TOGGLES = [
  {
    id: 'autosave',
    label: 'Autosave drafts',
    description: 'Persist edits every few seconds while you type.',
    initial: true,
  },
  {
    id: 'compact',
    label: 'Compact density',
    description: 'Tighter rows in tables and lists.',
    initial: false,
  },
  {
    id: 'previews',
    label: 'Link previews',
    description: 'Unfurl pasted links into rich cards.',
    initial: true,
  },
];

// 30-person directory backing both comboboxes. Built from two fixed name
// pools so the list is deterministic and reads naturally.
interface UserMeta {
  email: string;
  team: string;
}
type UserItem = SearchableItem<UserMeta>;

const USER_FIRST = [
  'Priya', 'Sam', 'Noor', 'Felix', 'Maya', 'Dana', 'Joey', 'Amara', 'Lucas',
  'Ines', 'Theo', 'Zoe', 'Ravi', 'Elif', 'Marcus', 'Hana', 'Diego', 'Wren',
  'Kofi', 'Lena', 'Omar', 'Sana', 'Nils', 'Ada', 'Bram', 'Chloe', 'Yuki',
  'Ezra', 'Tessa', 'Iker',
] as const;
const USER_LAST = [
  'Raman', 'Okafor', 'Haddad', 'Grant', 'Lindqvist', 'Reyes', 'Yu', 'Diallo',
  'Moreau', 'Costa', 'Novak', 'Marsh', 'Iyer', 'Demir', 'Bell', 'Sato',
  'Alvarez', 'Holloway', 'Mensah', 'Fischer', 'Nasser', 'Qureshi', 'Berg',
  'Osei', 'Visser', 'Dubois', 'Tanaka', 'Klein', 'Vance', 'Etxeberria',
] as const;
const USER_TEAMS = ['Platform', 'Design', 'Support', 'Growth', 'Infra'] as const;

const USERS: UserItem[] = USER_FIRST.map((first, index) => {
  const last = USER_LAST[index];
  return {
    id: `user-${index + 1}`,
    label: `${first} ${last}`,
    auxiliaryData: {
      email: `${first.toLowerCase()}.${last.toLowerCase()}@lumenlabs.io`,
      team: USER_TEAMS[index % USER_TEAMS.length],
    },
  };
});

const USER_SOURCE: SearchSource<UserItem> = {
  search: (query: string) => {
    const lowered = query.toLowerCase();
    return USERS.filter(user =>
      `${user.label} ${user.auxiliaryData?.email ?? ''}`
        .toLowerCase()
        .includes(lowered),
    );
  },
  bootstrap: () => USERS,
};

// Reviewers seeded into the multi-select chip combobox.
const INITIAL_REVIEWERS: UserItem[] = [USERS[0], USERS[4]];

// ============= SHARED PANEL BITS =============

/**
 * One control-family panel: numbered mono Token + title + blurb caption
 * over a Card of variant blocks, closed by the state readout strip.
 */
function GalleryPanel({
  spec,
  readout,
  registerRef,
  children,
}: {
  spec: PanelSpec;
  readout: Record<string, unknown>;
  registerRef: (id: string, node: HTMLDivElement | null) => void;
  children: ReactNode;
}) {
  return (
    <div ref={node => registerRef(spec.id, node)}>
      <Section variant="transparent" padding={0}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Token label={spec.index} size="sm" color="gray" />
            <Heading level={2}>{spec.title}</Heading>
          </HStack>
          <Text type="supporting" color="secondary">
            {spec.blurb}
          </Text>
          <Card padding={4}>
            <VStack gap={4}>
              {children}
              <Divider />
              <HStack gap={2} vAlign="center">
                <Token label="state" size="sm" color="gray" />
                <StackItem size="fill" style={styles.variantBlock}>
                  <div style={styles.readout}>
                    <Code>{JSON.stringify(readout)}</Code>
                  </div>
                </StackItem>
              </HStack>
            </VStack>
          </Card>
        </VStack>
      </Section>
    </div>
  );
}

/** Labeled variant sub-block inside a panel. */
function VariantBlock({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <VStack gap={2} style={styles.variantBlock}>
      <HStack gap={2} vAlign="center">
        <Text type="label" size="sm">
          {label}
        </Text>
        {note != null && (
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        )}
      </HStack>
      {children}
    </VStack>
  );
}

// ============= PANEL 01 · INPUT GROUPS =============

function InputGroupsPanel({
  registerRef,
}: {
  registerRef: (id: string, node: HTMLDivElement | null) => void;
}) {
  const [email, setEmail] = useState('priya.raman@lumenlabs.io');
  const [subdomain, setSubdomain] = useState('lumen-labs');
  const [billingEmail, setBillingEmail] = useState('billing@lumenlabs');
  const [search, setSearch] = useState('');

  // Inline validation: the error clears the moment the value is fixed.
  const billingError =
    billingEmail.trim() === ''
      ? 'Billing email is required.'
      : EMAIL_PATTERN.test(billingEmail.trim())
        ? null
        : 'Enter a valid email address, like ap@company.com.';
  const subdomainError =
    subdomain === ''
      ? 'Workspace URL is required.'
      : SUBDOMAIN_PATTERN.test(subdomain)
        ? null
        : 'Lowercase letters, numbers, and hyphens only.';

  return (
    <GalleryPanel
      spec={PANELS[0]}
      registerRef={registerRef}
      readout={{
        email,
        workspace: `${subdomain}.astryx.app`,
        billingEmail,
        billingValid: billingError === null,
        search,
      }}>
      <VariantBlock label="Leading icon">
        <TextInput
          type="email"
          label="Work email"
          startIcon={<Icon icon={MailIcon} size="sm" color="secondary" />}
          value={email}
          onChange={setEmail}
        />
      </VariantBlock>

      <VariantBlock label="Add-on prefix and suffix" note="fixed scheme and domain">
        <VStack gap={1}>
          <Text type="label" size="sm">
            Workspace URL
          </Text>
          <HStack gap={1} vAlign="center">
            <div style={styles.addonBox}>
              <Text type="supporting" color="secondary">
                https://
              </Text>
            </div>
            <StackItem size="fill" style={styles.addonInput}>
              <TextInput
                label="Workspace subdomain"
                isLabelHidden
                width="100%"
                value={subdomain}
                onChange={setSubdomain}
                status={
                  subdomainError != null
                    ? {type: 'error', message: subdomainError}
                    : undefined
                }
              />
            </StackItem>
            <div style={styles.addonBox}>
              <Text type="supporting" color="secondary">
                .astryx.app
              </Text>
            </div>
          </HStack>
        </VStack>
      </VariantBlock>

      <VariantBlock label="Inline validation" note="error clears on fix">
        <TextInput
          type="email"
          label="Billing email"
          isRequired
          description="Invoices and payment reminders go here."
          value={billingEmail}
          onChange={setBillingEmail}
          status={
            billingError != null
              ? {type: 'error', message: billingError}
              : {type: 'success', message: 'Looks good.'}
          }
        />
      </VariantBlock>

      <VariantBlock label="Pill search" note="clear button included">
        <TextInput
          label="Search components"
          isLabelHidden
          placeholder="Search components…"
          startIcon={<Icon icon={SearchIcon} size="sm" color="secondary" />}
          hasClear
          value={search}
          onChange={setSearch}
          style={styles.pillInput}
        />
      </VariantBlock>
    </GalleryPanel>
  );
}

// ============= PANEL 02 · SELECT MENUS =============

/**
 * Custom listbox trigger + Popover. Rows are SelectableCards so selection
 * is a real click/tap affordance with a visible selected state.
 */
function ListboxSelect({
  label,
  triggerLabel,
  isOpen,
  onOpenChange,
  children,
}: {
  label: string;
  triggerLabel: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Popover
      label={label}
      placement="below"
      alignment="start"
      width={320}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      content={
        <div style={styles.listboxBody}>
          <VStack gap={1}>{children}</VStack>
        </div>
      }>
      <Button
        label={triggerLabel}
        variant="secondary"
        icon={<Icon icon={ChevronDownIcon} size="sm" color="inherit" />}
        onClick={() => onOpenChange(!isOpen)}
      />
    </Popover>
  );
}

function SelectMenusPanel({
  registerRef,
}: {
  registerRef: (id: string, node: HTMLDivElement | null) => void;
}) {
  const [region, setRegion] = useState('us-west-2');
  const [environment, setEnvironment] = useState('staging');
  const [assignee, setAssignee] = useState('priya');
  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);

  const envLabel =
    ENVIRONMENT_OPTIONS.find(option => option.id === environment)?.label ??
    'Choose environment';
  const assigneeName =
    ASSIGNEE_OPTIONS.find(option => option.id === assignee)?.name ??
    'Choose assignee';

  return (
    <GalleryPanel
      spec={PANELS[1]}
      registerRef={registerRef}
      readout={{region, environment, assignee}}>
      <VariantBlock label="Native-styled select">
        <Selector
          label="Deploy region"
          description="Latency is lowest in the region closest to your users."
          options={REGION_OPTIONS}
          value={region}
          onChange={setRegion}
        />
      </VariantBlock>

      <VariantBlock label="Custom listbox" note="options carry descriptions">
        <ListboxSelect
          label="Environment"
          triggerLabel={envLabel}
          isOpen={isEnvOpen}
          onOpenChange={setIsEnvOpen}>
          {ENVIRONMENT_OPTIONS.map(option => (
            <SelectableCard
              key={option.id}
              label={option.label}
              isSelected={environment === option.id}
              onChange={() => {
                setEnvironment(option.id);
                setIsEnvOpen(false);
              }}
              padding={2}
              width="100%">
              <VStack gap={0.5}>
                <Text type="body" weight="semibold">
                  {option.label}
                </Text>
                <Text type="supporting" color="secondary">
                  {option.description}
                </Text>
              </VStack>
            </SelectableCard>
          ))}
        </ListboxSelect>
      </VariantBlock>

      <VariantBlock label="Avatar option rows" note="initials only, no images">
        <ListboxSelect
          label="Assignee"
          triggerLabel={assigneeName}
          isOpen={isAssigneeOpen}
          onOpenChange={setIsAssigneeOpen}>
          {ASSIGNEE_OPTIONS.map(option => (
            <SelectableCard
              key={option.id}
              label={option.name}
              isSelected={assignee === option.id}
              onChange={() => {
                setAssignee(option.id);
                setIsAssigneeOpen(false);
              }}
              padding={2}
              width="100%">
              <HStack gap={2} vAlign="center">
                <Avatar name={option.name} size="xsmall" />
                <VStack gap={0}>
                  <Text type="body" weight="semibold">
                    {option.name}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {option.role}
                  </Text>
                </VStack>
              </HStack>
            </SelectableCard>
          ))}
        </ListboxSelect>
      </VariantBlock>
    </GalleryPanel>
  );
}

// ============= PANEL 03 · TEXTAREAS =============

const UPDATE_MAX = 280;

function TextareasPanel({
  registerRef,
}: {
  registerRef: (id: string, node: HTMLDivElement | null) => void;
}) {
  const [notes, setNotes] = useState('');
  const [update, setUpdate] = useState(
    'Shipped the new dispatch board to staging. Rollout to production is planned for Thursday.',
  );
  const [reply, setReply] = useState('');
  const [formats, setFormats] = useState<string[]>(['bold']);

  // Autogrow: 2 rows minimum, one extra row per line break or ~60 chars,
  // capped at 8 so the panel never runs away.
  const newlineCount = update.split('\n').length - 1;
  const updateRows = Math.min(
    8,
    Math.max(2, 1 + newlineCount + Math.ceil(update.length / 60)),
  );
  const overBy = update.length - UPDATE_MAX;

  const toggleFormat = (format: string) => (pressed: boolean) =>
    setFormats(prev =>
      pressed ? [...prev, format] : prev.filter(item => item !== format),
    );

  return (
    <GalleryPanel
      spec={PANELS[2]}
      registerRef={registerRef}
      readout={{
        notesChars: notes.length,
        updateChars: update.length,
        updateRows,
        replyChars: reply.length,
        formats,
      }}>
      <VariantBlock label="Basic">
        <TextArea
          label="Internal notes"
          isOptional
          rows={3}
          placeholder="Visible to your team only."
          value={notes}
          onChange={setNotes}
        />
      </VariantBlock>

      <VariantBlock label="Autogrow with counter" note={`${UPDATE_MAX} characters max`}>
        <VStack gap={1}>
          <TextArea
            label="Status update"
            rows={updateRows}
            value={update}
            onChange={setUpdate}
          />
          {overBy > 0 ? (
            <FieldStatus
              type="error"
              variant="detached"
              message={`${overBy} characters over the ${UPDATE_MAX} limit.`}
            />
          ) : (
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {update.length} / {UPDATE_MAX}
            </Text>
          )}
        </VStack>
      </VariantBlock>

      <VariantBlock label="Toolbar-attached" note="formatting toggles hold state">
        <Card padding={0}>
          <VStack gap={0}>
            <div style={styles.toolbarRow}>
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
                      isPressed={formats.includes('bold')}
                      onPressedChange={toggleFormat('bold')}
                    />
                    <ToggleButton
                      label="Italic"
                      isIconOnly
                      size="sm"
                      icon={<Icon icon={ItalicIcon} size="sm" color="inherit" />}
                      isPressed={formats.includes('italic')}
                      onPressedChange={toggleFormat('italic')}
                    />
                    <ToggleButton
                      label="Bulleted list"
                      isIconOnly
                      size="sm"
                      icon={<Icon icon={ListIcon} size="sm" color="inherit" />}
                      isPressed={formats.includes('list')}
                      onPressedChange={toggleFormat('list')}
                    />
                  </>
                }
              />
            </div>
            <Divider />
            <div style={styles.toolbarField}>
              <TextArea
                label="Reply"
                isLabelHidden
                rows={3}
                placeholder="Write a reply…"
                value={reply}
                onChange={setReply}
              />
            </div>
          </VStack>
        </Card>
      </VariantBlock>
    </GalleryPanel>
  );
}

// ============= PANEL 04 · RADIO GROUPS =============

function RadioGroupsPanel({
  registerRef,
}: {
  registerRef: (id: string, node: HTMLDivElement | null) => void;
}) {
  const [notify, setNotify] = useState('mentions');
  const [tier, setTier] = useState('growth');
  const [pricing, setPricing] = useState('pro');

  return (
    <GalleryPanel
      spec={PANELS[3]}
      registerRef={registerRef}
      readout={{notify, tier, pricing}}>
      <VariantBlock label="Stacked with descriptions">
        <RadioList label="Notify me about" value={notify} onChange={setNotify}>
          {NOTIFY_OPTIONS.map(option => (
            <RadioListItem
              key={option.value}
              label={option.label}
              value={option.value}
              description={option.description}
            />
          ))}
        </RadioList>
      </VariantBlock>

      <VariantBlock label="Card selector" note="one tier at a time">
        <HStack gap={2} style={styles.cardGrid}>
          {TIER_CARDS.map(card => (
            <div key={card.id} style={styles.cardGridItem}>
              <SelectableCard
                label={`Choose the ${card.label} tier`}
                isSelected={tier === card.id}
                onChange={() => setTier(card.id)}
                padding={3}
                width="100%">
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center">
                    <Icon icon={card.icon} size="sm" color="secondary" />
                    <Text type="body" weight="semibold">
                      {card.label}
                    </Text>
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {card.description}
                  </Text>
                </VStack>
              </SelectableCard>
            </div>
          ))}
        </HStack>
      </VariantBlock>

      <VariantBlock label="Pricing table radios" note="price pinned to the row end">
        <RadioList
          label="Plan"
          isLabelHidden
          value={pricing}
          onChange={setPricing}>
          {PRICING_RADIOS.map(row => (
            <RadioListItem
              key={row.value}
              label={row.label}
              value={row.value}
              description={row.seats}
              endContent={
                <Text
                  type="body"
                  weight="semibold"
                  hasTabularNumbers
                  style={styles.priceText}>
                  {row.price}
                </Text>
              }
            />
          ))}
        </RadioList>
      </VariantBlock>
    </GalleryPanel>
  );
}

// ============= PANEL 05 · CHECKBOXES =============

function CheckboxesPanel({
  registerRef,
}: {
  registerRef: (id: string, node: HTMLDivElement | null) => void;
}) {
  const [surfaces, setSurfaces] =
    useState<Record<string, boolean>>(INITIAL_SURFACES);
  const [addons, setAddons] = useState<string[]>(['audit-log']);

  // The parent derives from its children: all → checked, none → unchecked,
  // otherwise indeterminate. Clicking it settles the whole group.
  const checkedCount = SYNC_SURFACES.filter(
    surface => surfaces[surface.id],
  ).length;
  const parentValue: boolean | 'indeterminate' =
    checkedCount === SYNC_SURFACES.length
      ? true
      : checkedCount === 0
        ? false
        : 'indeterminate';

  const setAll = (checked: boolean) =>
    setSurfaces(
      Object.fromEntries(SYNC_SURFACES.map(surface => [surface.id, checked])),
    );

  const toggleAddon = (id: string) => () =>
    setAddons(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );

  return (
    <GalleryPanel
      spec={PANELS[4]}
      registerRef={registerRef}
      readout={{
        parent: parentValue,
        surfaces: SYNC_SURFACES.filter(s => surfaces[s.id]).map(s => s.id),
        addons,
      }}>
      <VariantBlock
        label="List with indeterminate parent"
        note="parent state derives from the children">
        <VStack gap={2}>
          <CheckboxInput
            label="Sync all surfaces"
            description={`${checkedCount} of ${SYNC_SURFACES.length} selected`}
            size="md"
            value={parentValue}
            onChange={setAll}
          />
          <Divider />
          {SYNC_SURFACES.map(surface => (
            <CheckboxInput
              key={surface.id}
              label={surface.label}
              description={surface.description}
              size="md"
              value={surfaces[surface.id]}
              onChange={checked =>
                setSurfaces(prev => ({...prev, [surface.id]: checked}))
              }
            />
          ))}
        </VStack>
      </VariantBlock>

      <VariantBlock label="Card checkboxes" note="independent multi-select">
        <HStack gap={2} style={styles.cardGrid}>
          {ADDON_CARDS.map(card => (
            <div key={card.id} style={styles.cardGridItem}>
              <SelectableCard
                label={
                  addons.includes(card.id)
                    ? `Remove ${card.label}`
                    : `Add ${card.label}`
                }
                isSelected={addons.includes(card.id)}
                onChange={toggleAddon(card.id)}
                padding={3}
                width="100%">
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center">
                    <Icon icon={card.icon} size="sm" color="secondary" />
                    <Text type="body" weight="semibold">
                      {card.label}
                    </Text>
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {card.description}
                  </Text>
                </VStack>
              </SelectableCard>
            </div>
          ))}
        </HStack>
      </VariantBlock>
    </GalleryPanel>
  );
}

// ============= PANEL 06 · TOGGLES =============

function TogglesPanel({
  registerRef,
}: {
  registerRef: (id: string, node: HTMLDivElement | null) => void;
}) {
  const [maintenance, setMaintenance] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(SETTINGS_TOGGLES.map(row => [row.id, row.initial])),
  );

  return (
    <GalleryPanel
      spec={PANELS[5]}
      registerRef={registerRef}
      readout={{
        maintenance,
        billing: isAnnual ? 'annual' : 'monthly',
        settings,
      }}>
      <VariantBlock label="Simple">
        <Switch
          label="Maintenance mode"
          description="Serve the holding page to all visitors."
          value={maintenance}
          onChange={setMaintenance}
        />
      </VariantBlock>

      <VariantBlock label="Left/right labels" note="either side names a state">
        <HStack gap={2} vAlign="center">
          <Text
            type="body"
            weight={isAnnual ? 'normal' : 'semibold'}
            color={isAnnual ? 'secondary' : undefined}>
            Monthly
          </Text>
          <Switch
            label="Bill annually"
            isLabelHidden
            value={isAnnual}
            onChange={setIsAnnual}
          />
          <Text
            type="body"
            weight={isAnnual ? 'semibold' : 'normal'}
            color={isAnnual ? undefined : 'secondary'}>
            Annual
          </Text>
          {isAnnual && <Badge label="2 months free" variant="success" />}
        </HStack>
      </VariantBlock>

      <VariantBlock label="Settings list" note="one toggle per row">
        <VStack gap={0}>
          {SETTINGS_TOGGLES.map((row, index) => (
            <VStack gap={0} key={row.id}>
              <div style={styles.settingsRow}>
                <Switch
                  label={row.label}
                  description={row.description}
                  value={settings[row.id]}
                  onChange={checked =>
                    setSettings(prev => ({...prev, [row.id]: checked}))
                  }
                />
              </div>
              {index < SETTINGS_TOGGLES.length - 1 && <Divider />}
            </VStack>
          ))}
        </VStack>
      </VariantBlock>
    </GalleryPanel>
  );
}

// ============= PANEL 07 · COMBOBOXES =============

function ComboboxesPanel({
  registerRef,
}: {
  registerRef: (id: string, node: HTMLDivElement | null) => void;
}) {
  const [owner, setOwner] = useState<UserItem | null>(USERS[2]);
  const [reviewers, setReviewers] = useState<UserItem[]>(INITIAL_REVIEWERS);

  return (
    <GalleryPanel
      spec={PANELS[6]}
      registerRef={registerRef}
      readout={{
        owner: owner === null ? null : (owner.auxiliaryData?.email ?? owner.label),
        reviewers: reviewers.map(item => item.auxiliaryData?.email ?? item.label),
      }}>
      <VariantBlock
        label="Typeahead"
        note="30 users · arrows/Enter to pick · try a name that does not exist">
        <Typeahead<UserItem>
          label="Project owner"
          placeholder="Search 30 people…"
          searchSource={USER_SOURCE}
          value={owner}
          onChange={setOwner}
          renderItem={item => (
            <TypeaheadItem item={item} description={item.auxiliaryData?.email} />
          )}
          emptySearchResultsText="No people match — try a different name."
          hasEntriesOnFocus
          hasClear
          maxMenuItems={8}
          debounceMs={0}
          startIcon={SearchIcon}
        />
      </VariantBlock>

      <VariantBlock label="Multi-select chips" note="each pick becomes a removable chip">
        <Tokenizer<UserItem>
          label="Reviewers"
          placeholder="Add reviewers…"
          searchSource={USER_SOURCE}
          value={reviewers}
          onChange={items => setReviewers(items)}
          renderItem={item => (
            <TypeaheadItem item={item} description={item.auxiliaryData?.team} />
          )}
          hasEntriesOnFocus
          debounceMs={0}
        />
      </VariantBlock>
    </GalleryPanel>
  );
}

// ============= PANEL 08 · ACTION PANELS =============

function ActionPanelsPanel({
  registerRef,
}: {
  registerRef: (id: string, node: HTMLDivElement | null) => void;
}) {
  const [reportsEnabled, setReportsEnabled] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteScheduled, setIsDeleteScheduled] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invited, setInvited] = useState<string[]>([]);
  const isCompact = useMediaQuery('(max-width: 640px)');
  const tapTargetStyle = isCompact ? styles.buttonTapTarget : undefined;

  const sendInvite = () => {
    const trimmed = inviteEmail.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setInviteError('Enter a valid email address to send an invite.');
      return;
    }
    if (invited.includes(trimmed)) {
      setInviteError('That address has already been invited.');
      return;
    }
    setInvited(prev => [...prev, trimmed]);
    setInviteEmail('');
    setInviteError(null);
  };

  return (
    <GalleryPanel
      spec={PANELS[7]}
      registerRef={registerRef}
      readout={{
        weeklyReports: reportsEnabled,
        deleteScheduled: isDeleteScheduled,
        invited,
      }}>
      <VariantBlock label="Title + description + button">
        <Card padding={3}>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill" style={styles.variantBlock}>
              <VStack gap={0.5}>
                <HStack gap={2} vAlign="center">
                  <Text type="body" weight="semibold">
                    Weekly usage reports
                  </Text>
                  {reportsEnabled && <Badge label="On" variant="success" />}
                </HStack>
                <Text type="supporting" color="secondary">
                  A summary of seats, deploys, and API usage every Monday.
                </Text>
              </VStack>
            </StackItem>
            <Button
              label={reportsEnabled ? 'Disable' : 'Enable'}
              variant="secondary"
              size="sm"
              style={tapTargetStyle}
              onClick={() => setReportsEnabled(prev => !prev)}
            />
          </HStack>
        </Card>
      </VariantBlock>

      <VariantBlock label="Destructive with confirm" note="AlertDialog gates the action">
        <VStack gap={2}>
          {isDeleteScheduled && (
            <Banner
              status="warning"
              title="Deletion scheduled"
              description="lumen-labs.astryx.app will be deleted in 7 days. You can still undo."
            />
          )}
          <Card padding={3}>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill" style={styles.variantBlock}>
                <VStack gap={0.5}>
                  <Text type="body" weight="semibold">
                    Delete workspace
                  </Text>
                  <Text type="supporting" color="secondary">
                    Removes all environments, deploys, and member access.
                  </Text>
                </VStack>
              </StackItem>
              {isDeleteScheduled ? (
                <Button
                  label="Undo"
                  variant="secondary"
                  size="sm"
                  style={tapTargetStyle}
                  icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
                  onClick={() => setIsDeleteScheduled(false)}
                />
              ) : (
                <Button
                  label="Delete…"
                  variant="destructive"
                  size="sm"
                  style={tapTargetStyle}
                  icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
                  onClick={() => setIsDeleteOpen(true)}
                />
              )}
            </HStack>
          </Card>
          <AlertDialog
            isInline
            isOpen={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            title="Delete this workspace?"
            description="All environments and deploy history are removed after a 7-day grace period. Members lose access immediately."
            cancelLabel="Keep workspace"
            actionLabel="Schedule deletion"
            actionVariant="destructive"
            onAction={() => {
              setIsDeleteScheduled(true);
              setIsDeleteOpen(false);
            }}
          />
        </VStack>
      </VariantBlock>

      <VariantBlock label="Input-embedded" note="validates before sending">
        <Card padding={3}>
          <VStack gap={2}>
            <VStack gap={0.5}>
              <Text type="body" weight="semibold">
                Invite a teammate
              </Text>
              <Text type="supporting" color="secondary">
                They join with member access; you can promote them later.
              </Text>
            </VStack>
            <HStack gap={2} vAlign="start">
              <StackItem size="fill" style={styles.variantBlock}>
                <TextInput
                  type="email"
                  label="Invite email"
                  isLabelHidden
                  width="100%"
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={value => {
                    setInviteEmail(value);
                    setInviteError(null);
                  }}
                  onEnter={sendInvite}
                  status={
                    inviteError != null
                      ? {type: 'error', message: inviteError}
                      : undefined
                  }
                />
              </StackItem>
              <Button
                label="Send invite"
                size="sm"
                style={tapTargetStyle}
                icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                onClick={sendInvite}
              />
            </HStack>
            {invited.length > 0 && (
              <HStack gap={1} style={styles.chipWrap}>
                {invited.map(address => (
                  <Token
                    key={address}
                    label={address}
                    size="sm"
                    onRemove={() =>
                      setInvited(prev => prev.filter(item => item !== address))
                    }
                  />
                ))}
              </HStack>
            )}
          </VStack>
        </Card>
      </VariantBlock>
    </GalleryPanel>
  );
}

// ============= SECTION RAIL =============

function SectionRail({
  activeId,
  onJump,
}: {
  activeId: string;
  onJump: (id: string) => void;
}) {
  return (
    <nav aria-label="Control families" style={styles.rail}>
      <VStack gap={1}>
        <Text type="label" size="sm" color="secondary">
          Control families
        </Text>
        {PANELS.map(panel => (
          <Button
            key={panel.id}
            label={`${panel.index} · ${panel.title}`}
            variant={activeId === panel.id ? 'secondary' : 'ghost'}
            size="sm"
            style={styles.railButton}
            onClick={() => onJump(panel.id)}
          />
        ))}
      </VStack>
    </nav>
  );
}

// ============= PAGE =============

export default function FormControlsGalleryTemplate() {
  // Remounting the panel column via key returns every control to its
  // initial fixture state — the whole gallery's Reset all.
  const [resetKey, setResetKey] = useState(0);
  const [activeId, setActiveId] = useState(PANELS[0].id);
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hasRail = useMediaQuery('(min-width: 901px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  const registerRef = (id: string, node: HTMLDivElement | null) => {
    panelRefs.current[id] = node;
  };

  const jumpTo = (id: string) => {
    setActiveId(id);
    panelRefs.current[id]?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const panelColumn = (
    <VStack gap={6} key={resetKey}>
      <InputGroupsPanel registerRef={registerRef} />
      <SelectMenusPanel registerRef={registerRef} />
      <TextareasPanel registerRef={registerRef} />
      <RadioGroupsPanel registerRef={registerRef} />
      <CheckboxesPanel registerRef={registerRef} />
      <TogglesPanel registerRef={registerRef} />
      <ComboboxesPanel registerRef={registerRef} />
      <ActionPanelsPanel registerRef={registerRef} />
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
                <Heading level={1}>Form controls — 8 panels</Heading>
                <Badge label="reference sheet" variant="neutral" />
              </HStack>
            </StackItem>
            <Button
              label="Reset all"
              variant="secondary"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              onClick={() => setResetKey(prev => prev + 1)}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <HStack gap={5} style={styles.contentRow}>
            {hasRail && <SectionRail activeId={activeId} onJump={jumpTo} />}
            <StackItem size="fill" style={styles.variantBlock}>
              <div style={styles.column}>
                <VStack gap={4}>
                  {!hasRail && (
                    <Selector
                      label="Jump to section"
                      isLabelHidden
                      options={PANELS.map(panel => ({
                        value: panel.id,
                        label: `${panel.index} · ${panel.title}`,
                      }))}
                      value={activeId}
                      onChange={jumpTo}
                    />
                  )}
                  {panelColumn}
                </VStack>
              </div>
            </StackItem>
          </HStack>
        </LayoutContent>
      }
    />
  );
}
