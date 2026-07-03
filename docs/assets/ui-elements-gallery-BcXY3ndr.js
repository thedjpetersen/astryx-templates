var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (eight named people with fixed gradient
 *   pairs for initials avatars, five removable tag chips, a three-row
 *   document set for the segmented preview pane, four dropdown menus'
 *   item copy with shortcuts and a danger zone, and a checkable
 *   view-options set with two defaults enabled)
 * @output Five-panel interactive UI-element gallery — a copy-ready
 *   reference sheet of core atoms. Panel 01 Avatars: the xs–xl size ramp,
 *   gradient-initials placeholders, status-dot avatars, and a stacked
 *   overlap group whose "+3" overflow opens a full-roster Popover. Panel
 *   02 Badges: the status-color row, dot-prefixed badges, dismissible tag
 *   Tokens that actually remove (with an Undo snackbar Toast), and count
 *   pills driven by a live +/- stepper that caps at "99+". Panel 03
 *   Buttons: the 4-variant x 3-size matrix, icon-leading buttons, a
 *   click-to-load button that spins for 1.5s, and the disabled row. Panel
 *   04 Button groups: a segmented view switcher that drives a small
 *   list/grid/table preview pane, a split Save button with an attached
 *   DropdownMenu, and an icon formatting toolbar with real pressed
 *   states. Panel 05 Dropdowns: a simple action menu, a menu with icons
 *   and Kbd shortcuts, a grouped menu with a destructive danger zone, and
 *   a checkable options menu that updates a visible Token readout. Every
 *   variant carries a mono props strip naming it for copy-ready reference.
 * @position Page template; emitted by \`astryx template ui-elements-gallery\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title
 * 'UI elements — 5 panels', a "reference sheet" Badge, and a supporting
 * caption). LayoutContent hosts a single centered scroll column (maxWidth
 * 880); each panel is a labeled Section — a mono panel-id Token beside the
 * panel Heading, a one-line note, then variant blocks. Each variant block
 * is a titled Card specimen with a mono Code props strip underneath. All
 * overlays (avatar roster Popover, the four DropdownMenus) open on click,
 * trap arrow-key focus in the menu, and close on Escape or outside click
 * via the Astryx Popover/DropdownMenu primitives; the Undo snackbar is a
 * fixed bottom-right Toast.
 *
 * Responsive contract:
 * - Specimen column: maxWidth 880, centered; the page scrolls vertically
 *   as one region — header stays fixed chrome.
 * - Every specimen row (size ramps, badge rows, button matrix rows, chip
 *   rows, toolbar clusters) uses wrap="wrap", so at 375px rows fold to
 *   multiple lines instead of clipping; props strips get overflowX auto
 *   with their own scrollbar rather than wrapping mid-token.
 * - <=640px: tap controls grow to 40px hit targets via style overrides
 *   (stepper IconButtons, toolbar IconButtons, chip-adjacent buttons);
 *   glyphs stay "sm" so desktop renders identically. All interactions are
 *   click/tap-driven — nothing is hover-only (tooltips only annotate).
 * - The segmented preview pane's grid uses minWidth 140 tracks so it
 *   collapses to a single column on phones; the roster Popover keeps
 *   width 260 (anchored to the avatar stack). The snackbar Toast keeps
 *   width 352 but clamps to the viewport with maxWidth.
 *
 * Container policy (element-gallery archetype): each variant is a Card
 * (rounded, soft border) so states and rings read against the page
 * background; panels are transparent Sections with Token + Heading
 * captions. Accent, status, and error color arrive via Badge/StatusDot
 * variants, Button variants, and semantic tokens — raw hex appears only
 * inside the deliberately decorative avatar gradient fixtures.
 *
 * Fixture policy: fixed data only; no clocks, no randomness, no network
 * assets or real images — avatars are initials or gradient placeholders.
 * The only timer is the explicit 1.5s loading-button demo.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

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
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Card} from '@astryxdesign/core/Card';
import {Code} from '@astryxdesign/core/Code';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu, DropdownMenuItem} from '@astryxdesign/core/DropdownMenu';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Popover} from '@astryxdesign/core/Popover';
import {Section} from '@astryxdesign/core/Section';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {StatusDot, type StatusDotVariant} from '@astryxdesign/core/StatusDot';
import {Toast} from '@astryxdesign/core/Toast';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {
  ArchiveIcon,
  BoldIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  ItalicIcon,
  LayoutGridIcon,
  Link2Icon,
  ListIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  Share2Icon,
  StarIcon,
  TableIcon,
  Trash2Icon,
  UnderlineIcon,
  UserPlusIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Single centered scroll column; header is fixed chrome above it.
  column: {
    width: '100%',
    maxWidth: 880,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-4)',
  },
  // Props strips scroll sideways on phones instead of wrapping mid-token.
  propsStrip: {
    overflowX: 'auto',
    paddingBlock: 2,
  },
  propsCode: {whiteSpace: 'pre'},
  // <=640px: grow touch controls to 40px hit targets; glyphs stay "sm".
  iconTapTarget: {width: 40, height: 40},
  buttonTapTarget: {height: 40},
  // Gradient-initials avatar placeholders (decorative fixture gradients).
  gradientAvatar: {
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 600,
    flexShrink: 0,
  },
  // Size-ramp caption under each avatar specimen.
  rampCell: {textAlign: 'center'},
  // Roster popover rows.
  rosterBody: {padding: 'var(--spacing-2)'},
  rosterRow: {
    paddingInline: 'var(--spacing-1)',
    paddingBlock: 'var(--spacing-1)',
  },
  // Danger-zone menu item reads destructive without a raw hex.
  dangerItem: {color: 'var(--color-error)'},
  // Checkable menu keeps a fixed end-slot so labels stay aligned.
  checkSlot: {
    width: 20,
    display: 'inline-flex',
    justifyContent: 'flex-end',
  },
  // Segmented preview pane: a small bounded canvas under the switcher.
  previewPane: {
    minHeight: 148,
    borderRadius: 'var(--radius-container)',
    border: '1px solid var(--color-border)',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-muted)',
  },
  previewRow: {
    paddingBlock: 'var(--spacing-1)',
    minWidth: 0,
  },
  previewText: {minWidth: 0},
  // Snackbar: fixed bottom-right, clamped to the viewport on phones.
  snackbarWrap: {
    position: 'fixed',
    bottom: 'var(--spacing-5)',
    right: 'var(--spacing-5)',
    width: 352,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    zIndex: 40,
  },
  // State readouts under interactive specimens.
  readoutRow: {minHeight: 28},
  // Fixed-width row label so the button matrix columns align.
  matrixRowLabel: {width: 88, flexShrink: 0},
};

// ============= DATA =============
// Deterministic fixtures: fixed names, gradients, and menu copy. No
// clocks, no randomness, no network assets.

interface Person {
  id: string;
  name: string;
  role: string;
  gradient: string;
  presence: StatusDotVariant;
  presenceLabel: string;
}

// Fixed, hand-picked gradient pairs (decorative placeholders — the one
// sanctioned use of raw hex on this page).
const PEOPLE: Person[] = [
  {
    id: 'p-1',
    name: 'Amara Diallo',
    role: 'Design lead',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
    presence: 'success',
    presenceLabel: 'Online',
  },
  {
    id: 'p-2',
    name: 'Jonas Weber',
    role: 'Frontend',
    gradient: 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
    presence: 'warning',
    presenceLabel: 'Away',
  },
  {
    id: 'p-3',
    name: 'Priya Natarajan',
    role: 'Platform',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    presence: 'neutral',
    presenceLabel: 'Offline',
  },
  {
    id: 'p-4',
    name: 'Dana Reyes',
    role: 'Product',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    presence: 'error',
    presenceLabel: 'Do not disturb',
  },
  {
    id: 'p-5',
    name: 'Marcus Chen',
    role: 'Infra',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    presence: 'success',
    presenceLabel: 'Online',
  },
  {
    id: 'p-6',
    name: 'Sofia Almeida',
    role: 'Research',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    presence: 'accent',
    presenceLabel: 'In a meeting',
  },
  {
    id: 'p-7',
    name: 'Tomás Herrera',
    role: 'Data',
    gradient: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
    presence: 'success',
    presenceLabel: 'Online',
  },
  {
    id: 'p-8',
    name: 'Lena Fischer',
    role: 'QA',
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    presence: 'neutral',
    presenceLabel: 'Offline',
  },
];

const STACK_VISIBLE_COUNT = 5;

// xs–xl ramp mapped onto the Avatar named sizes.
const AVATAR_RAMP = [
  {label: 'xs', size: 'tiny', px: 16},
  {label: 'sm', size: 'xsmall', px: 24},
  {label: 'md', size: 'small', px: 32},
  {label: 'lg', size: 'medium', px: 40},
  {label: 'xl', size: 'large', px: 64},
] as const;

// Badge status row: one badge per semantic variant.
const STATUS_BADGES: Array<{label: string; variant: BadgeVariant}> = [
  {label: 'Neutral', variant: 'neutral'},
  {label: 'Info', variant: 'info'},
  {label: 'Success', variant: 'success'},
  {label: 'Warning', variant: 'warning'},
  {label: 'Error', variant: 'error'},
  {label: 'Purple', variant: 'purple'},
];

// Dot-prefixed badges pair a StatusDot glyph with environment copy.
const DOT_BADGES: Array<{
  label: string;
  variant: BadgeVariant;
  dot: StatusDotVariant;
}> = [
  {label: 'Operational', variant: 'success', dot: 'success'},
  {label: 'Degraded', variant: 'warning', dot: 'warning'},
  {label: 'Outage', variant: 'error', dot: 'error'},
  {label: 'Maintenance', variant: 'neutral', dot: 'neutral'},
];

interface TagChip {
  id: string;
  label: string;
  color: TokenColor;
}

const INITIAL_CHIPS: TagChip[] = [
  {id: 'tag-1', label: 'Design system', color: 'blue'},
  {id: 'tag-2', label: 'Beta', color: 'purple'},
  {id: 'tag-3', label: 'Docs', color: 'teal'},
  {id: 'tag-4', label: 'Q3 launch', color: 'orange'},
  {id: 'tag-5', label: 'A11y', color: 'green'},
];

// Count pills cap at 99+ (matches the props strip).
function formatCount(count: number): string {
  return count > 99 ? '99+' : String(count);
}

const BUTTON_VARIANTS = [
  'primary',
  'secondary',
  'ghost',
  'destructive',
] as const;
const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;

// Segmented preview pane fixture: three documents, three renderings.
const PREVIEW_DOCS = [
  {id: 'doc-1', name: 'Q3 roadmap', owner: 'Amara Diallo', status: 'Draft'},
  {id: 'doc-2', name: 'Design tokens v4', owner: 'Jonas Weber', status: 'In review'},
  {id: 'doc-3', name: 'A11y audit notes', owner: 'Lena Fischer', status: 'Final'},
] as const;

type PreviewView = 'list' | 'grid' | 'table';

// Checkable options menu: two enabled by default.
const VIEW_OPTIONS = [
  {id: 'opt-comments', label: 'Show comments'},
  {id: 'opt-authors', label: 'Show authors'},
  {id: 'opt-line-numbers', label: 'Line numbers'},
  {id: 'opt-whitespace', label: 'Whitespace changes'},
] as const;

const DEFAULT_ENABLED_OPTIONS = ['opt-comments', 'opt-authors'];

function initials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ============= SHARED GALLERY BITS =============

/**
 * Panel wrapper: mono panel-id Token beside the Heading, one-line note,
 * then the variant blocks.
 */
function Panel({
  panelId,
  title,
  note,
  children,
}: {
  panelId: string;
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <Section variant="transparent" padding={0}>
      <VStack gap={3}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Token label={panelId} size="sm" color="gray" />
            <Heading level={2}>{title}</Heading>
          </HStack>
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        </VStack>
        {children}
      </VStack>
    </Section>
  );
}

/**
 * Variant block: title + optional note, the specimen Card, and the mono
 * props strip underneath for copy-ready reference.
 */
function VariantBlock({
  title,
  note,
  propsStrip,
  children,
}: {
  title: string;
  note?: string;
  propsStrip: string;
  children: ReactNode;
}) {
  return (
    <VStack gap={2}>
      <VStack gap={0.5}>
        <Text type="label" size="sm">
          {title}
        </Text>
        {note != null && (
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        )}
      </VStack>
      <Card padding={4}>{children}</Card>
      <div style={styles.propsStrip}>
        <Code style={styles.propsCode}>{propsStrip}</Code>
      </div>
    </VStack>
  );
}

/** Gradient-initials avatar placeholder (no network images). */
function GradientAvatar({person, px}: {person: Person; px: number}) {
  return (
    <span
      role="img"
      aria-label={person.name}
      style={{
        ...styles.gradientAvatar,
        width: px,
        height: px,
        fontSize: Math.max(10, Math.round(px * 0.34)),
        background: person.gradient,
      }}>
      {initials(person.name)}
    </span>
  );
}

// ============= PANEL 01 · AVATARS =============

function AvatarSizeRamp() {
  return (
    <VariantBlock
      title="Size ramp"
      note="Five steps, xs through xl; initials derive from the name."
      propsStrip={\`<Avatar name="Amara Diallo" size="tiny | xsmall | small | medium | large" />\`}>
      <HStack gap={4} vAlign="end" wrap="wrap">
        {AVATAR_RAMP.map(step => (
          <VStack key={step.label} gap={1} hAlign="center" style={styles.rampCell}>
            <Avatar name={PEOPLE[0].name} size={step.size} />
            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
              {step.label} · {step.px}px
            </Text>
          </VStack>
        ))}
      </HStack>
    </VariantBlock>
  );
}

function GradientAvatarRow() {
  return (
    <VariantBlock
      title="Gradient initials"
      note="Deterministic gradient placeholders for people without photos."
      propsStrip={\`<GradientAvatar name="Jonas Weber" gradient="fixture" size={40} />\`}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        {PEOPLE.slice(0, 6).map(person => (
          <Tooltip key={person.id} content={\`\${person.name} · \${person.role}\`}>
            <GradientAvatar person={person} px={40} />
          </Tooltip>
        ))}
      </HStack>
    </VariantBlock>
  );
}

function StatusAvatarRow() {
  return (
    <VariantBlock
      title="Status dots"
      note="Presence renders in the Avatar status slot; the dot names its state."
      propsStrip={\`<Avatar name="Dana Reyes" size="medium" status={<StatusDot variant="error" label="Do not disturb" />} />\`}>
      <HStack gap={4} vAlign="center" wrap="wrap">
        {PEOPLE.slice(0, 4).map(person => (
          <VStack key={person.id} gap={1} hAlign="center" style={styles.rampCell}>
            <Avatar
              name={person.name}
              size="medium"
              status={
                <StatusDot variant={person.presence} label={person.presenceLabel} />
              }
            />
            <Text type="supporting" size="xsm" color="secondary">
              {person.presenceLabel}
            </Text>
          </VStack>
        ))}
      </HStack>
    </VariantBlock>
  );
}

function StackedAvatarGroup() {
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const visible = PEOPLE.slice(0, STACK_VISIBLE_COUNT);
  const overflowCount = PEOPLE.length - STACK_VISIBLE_COUNT;

  return (
    <VariantBlock
      title="Stacked overlap group"
      note="Tap the stack (or its +N chip) to open the full-roster popover; Escape or outside click closes it."
      propsStrip={\`<AvatarGroup size="small"><Avatar ×\${STACK_VISIBLE_COUNT} /><AvatarGroupOverflow count={\${overflowCount}} /></AvatarGroup>\`}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <Popover
          label="Full reviewer roster"
          placement="below"
          alignment="start"
          width={260}
          isOpen={isRosterOpen}
          onOpenChange={setIsRosterOpen}
          hasAutoFocus={false}
          content={
            <div style={styles.rosterBody}>
              <VStack gap={0}>
                <div style={styles.rosterRow}>
                  <Text type="label" size="sm" color="secondary">
                    Reviewers · {PEOPLE.length}
                  </Text>
                </div>
                {PEOPLE.map(person => (
                  <HStack
                    key={person.id}
                    gap={2}
                    vAlign="center"
                    style={styles.rosterRow}>
                    <GradientAvatar person={person} px={24} />
                    <StackItem size="fill" style={styles.previewText}>
                      <Text size="sm" maxLines={1}>
                        {person.name}
                      </Text>
                    </StackItem>
                    <Text type="supporting" size="xsm" color="secondary">
                      {person.role}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </div>
          }>
          <AvatarGroup size="small" aria-label={\`\${PEOPLE.length} reviewers\`}>
            {visible.map(person => (
              <Avatar key={person.id} name={person.name} />
            ))}
            <AvatarGroupOverflow count={overflowCount} />
          </AvatarGroup>
        </Popover>
        <Text type="supporting" color="secondary">
          {isRosterOpen
            ? 'Roster open — Escape or click away to dismiss.'
            : \`\${STACK_VISIBLE_COUNT} shown, +\${overflowCount} in the overflow popover.\`}
        </Text>
      </HStack>
    </VariantBlock>
  );
}

function AvatarsPanel() {
  return (
    <Panel
      panelId="01 · avatars"
      title="Avatars"
      note="Size ramp, gradient-initials placeholders, presence status dots, and a stacked group with +N overflow.">
      <AvatarSizeRamp />
      <GradientAvatarRow />
      <StatusAvatarRow />
      <StackedAvatarGroup />
    </Panel>
  );
}

// ============= PANEL 02 · BADGES =============

function StatusBadgeRow() {
  return (
    <VariantBlock
      title="Status colors"
      note="One badge per semantic variant."
      propsStrip={\`<Badge variant="neutral | info | success | warning | error | purple" label="…" />\`}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        {STATUS_BADGES.map(badge => (
          <Badge key={badge.variant} variant={badge.variant} label={badge.label} />
        ))}
      </HStack>
    </VariantBlock>
  );
}

function DotBadgeRow() {
  return (
    <VariantBlock
      title="Dot-prefixed"
      note="A StatusDot in the icon slot for system-health copy."
      propsStrip={\`<Badge variant="success" icon={<StatusDot variant="success" label="" aria-hidden />} label="Operational" />\`}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        {DOT_BADGES.map(badge => (
          <Badge
            key={badge.label}
            variant={badge.variant}
            icon={<StatusDot variant={badge.dot} label="" aria-hidden />}
            label={badge.label}
          />
        ))}
      </HStack>
    </VariantBlock>
  );
}

function DismissibleChips({
  chips,
  onRemove,
  onReset,
  isCompact,
}: {
  chips: TagChip[];
  onRemove: (chip: TagChip) => void;
  onReset: () => void;
  isCompact: boolean;
}) {
  return (
    <VariantBlock
      title="Dismissible tag chips"
      note="The X actually removes the chip; an Undo snackbar restores it in place."
      propsStrip={\`<Token label="Design system" color="blue" onRemove={() => removeTag(id)} />\`}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          {chips.map(chip => (
            <Token
              key={chip.id}
              label={chip.label}
              color={chip.color}
              onRemove={() => onRemove(chip)}
            />
          ))}
          {chips.length === 0 && (
            <Text type="supporting" color="secondary">
              All tags removed.
            </Text>
          )}
        </HStack>
        {chips.length < INITIAL_CHIPS.length && (
          <HStack gap={2} vAlign="center">
            <Button
              label="Restore all tags"
              variant="ghost"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              onClick={onReset}
            />
            <Text type="supporting" color="secondary">
              {INITIAL_CHIPS.length - chips.length} removed
            </Text>
          </HStack>
        )}
      </VStack>
    </VariantBlock>
  );
}

function CountPills({isCompact}: {isCompact: boolean}) {
  const [count, setCount] = useState(4);
  const tapTargetStyle = isCompact ? styles.iconTapTarget : undefined;

  return (
    <VariantBlock
      title="Count pills"
      note="Live counter: step it past 99 to see the cap."
      propsStrip={\`<Badge variant="error" label={count > 99 ? '99+' : String(count)} />\`}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <Text size="sm">Inbox</Text>
          <Badge variant="error" label={formatCount(count)} />
        </HStack>
        <HStack gap={2} vAlign="center">
          <Text size="sm">Drafts</Text>
          <Badge variant="neutral" label={formatCount(count + 3)} />
        </HStack>
        <HStack gap={2} vAlign="center">
          <Text size="sm">Mentions</Text>
          <Badge variant="info" label={formatCount(Math.max(0, count - 2))} />
        </HStack>
        <StackItem size="fill" />
        <ButtonGroup label="Adjust unread count" size="sm">
          <IconButton
            label="Decrease count"
            tooltip="-1"
            icon={<Icon icon={MinusIcon} size="sm" color="inherit" />}
            variant="secondary"
            size="sm"
            style={tapTargetStyle}
            isDisabled={count === 0}
            onClick={() => setCount(prev => Math.max(0, prev - 1))}
          />
          <IconButton
            label="Increase count"
            tooltip="+1"
            icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
            variant="secondary"
            size="sm"
            style={tapTargetStyle}
            onClick={() => setCount(prev => prev + 1)}
          />
          <Button
            label="+100"
            variant="secondary"
            size="sm"
            style={isCompact ? styles.buttonTapTarget : undefined}
            onClick={() => setCount(prev => prev + 100)}
          />
        </ButtonGroup>
      </HStack>
    </VariantBlock>
  );
}

function BadgesPanel({isCompact}: {isCompact: boolean}) {
  const [chips, setChips] = useState(INITIAL_CHIPS);
  // Undo snackbar: remembers the removed chip and its original index.
  const [removedChip, setRemovedChip] = useState<{
    chip: TagChip;
    index: number;
  } | null>(null);

  const removeChip = (chip: TagChip) => {
    setChips(prev => {
      const index = prev.findIndex(item => item.id === chip.id);
      setRemovedChip({chip, index});
      return prev.filter(item => item.id !== chip.id);
    });
  };

  const undoRemove = () => {
    if (removedChip == null) {
      return;
    }
    setChips(prev => {
      const next = [...prev];
      next.splice(Math.min(removedChip.index, next.length), 0, removedChip.chip);
      return next;
    });
    setRemovedChip(null);
  };

  return (
    <>
      <Panel
        panelId="02 · badges"
        title="Badges"
        note="Status colors, dot-prefixed system badges, removable tag chips with undo, and capped count pills.">
        <StatusBadgeRow />
        <DotBadgeRow />
        <DismissibleChips
          chips={chips}
          onRemove={removeChip}
          onReset={() => {
            setChips(INITIAL_CHIPS);
            setRemovedChip(null);
          }}
          isCompact={isCompact}
        />
        <CountPills isCompact={isCompact} />
      </Panel>

      {/* Undo snackbar: fixed bottom-right; stays until dismissed or undone. */}
      {removedChip != null && (
        <div style={styles.snackbarWrap}>
          <Toast
            type="info"
            isAutoHide={false}
            autoHideDuration={8000}
            onDismiss={() => setRemovedChip(null)}
            endContent={
              <Button label="Undo" variant="ghost" size="sm" onClick={undoRemove} />
            }
            body={<Text weight="semibold">Removed “{removedChip.chip.label}”</Text>}
          />
        </div>
      )}
    </>
  );
}

// ============= PANEL 03 · BUTTONS =============

function ButtonMatrix() {
  return (
    <VariantBlock
      title="Variant × size matrix"
      note="Four variants across three sizes; rows wrap on narrow screens."
      propsStrip={\`<Button variant="primary | secondary | ghost | destructive" size="sm | md | lg" label="…" />\`}>
      <VStack gap={3}>
        {BUTTON_VARIANTS.map(variant => (
          <HStack key={variant} gap={2} vAlign="center" wrap="wrap">
            <div style={styles.matrixRowLabel}>
              <Text type="supporting" color="secondary">
                {variant}
              </Text>
            </div>
            {BUTTON_SIZES.map(size => (
              <Button
                key={size}
                label={size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                variant={variant}
                size={size}
                onClick={() => {}}
              />
            ))}
          </HStack>
        ))}
      </VStack>
    </VariantBlock>
  );
}

function IconLeadingButtons({isCompact}: {isCompact: boolean}) {
  const tapStyle = isCompact ? styles.buttonTapTarget : undefined;
  return (
    <VariantBlock
      title="Icon-leading"
      note="Glyph in the icon slot; the label still carries the meaning."
      propsStrip={\`<Button icon={<Icon icon={SendIcon} size="sm" color="inherit" />} label="Send" />\`}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Button
          label="Send"
          variant="primary"
          size="sm"
          style={tapStyle}
          icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
        <Button
          label="Duplicate"
          variant="secondary"
          size="sm"
          style={tapStyle}
          icon={<Icon icon={CopyIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
        <Button
          label="Download"
          variant="ghost"
          size="sm"
          style={tapStyle}
          icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
        <Button
          label="Delete"
          variant="destructive"
          size="sm"
          style={tapStyle}
          icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
      </HStack>
    </VariantBlock>
  );
}

/** Click-to-load button: spins for exactly 1.5s, then settles back. */
function LoadingButtons({isCompact}: {isCompact: boolean}) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const startSave = () => {
    setIsSaving(true);
    timerRef.current = setTimeout(() => {
      setIsSaving(false);
      setSaveCount(prev => prev + 1);
      timerRef.current = null;
    }, 1500);
  };

  return (
    <VariantBlock
      title="Loading state"
      note="Click Save — the spinner runs for 1.5s, then the readout increments. The second specimen is frozen in isLoading."
      propsStrip={\`<Button label="Save changes" isLoading={isSaving} onClick={save} />\`}>
      <HStack gap={3} vAlign="center" wrap="wrap" style={styles.readoutRow}>
        <Button
          label="Save changes"
          variant="primary"
          size="md"
          style={isCompact ? styles.buttonTapTarget : undefined}
          isLoading={isSaving}
          onClick={startSave}
        />
        <Button label="Publishing…" variant="secondary" size="md" isLoading />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {isSaving
            ? 'Saving…'
            : saveCount === 0
              ? 'Not saved yet'
              : \`Saved \${saveCount} time\${saveCount === 1 ? '' : 's'}\`}
        </Text>
      </HStack>
    </VariantBlock>
  );
}

function DisabledButtons() {
  return (
    <VariantBlock
      title="Disabled"
      note="Every variant in its disabled state — none respond to clicks."
      propsStrip={\`<Button variant="primary" label="…" isDisabled />\`}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        {BUTTON_VARIANTS.map(variant => (
          <Button
            key={variant}
            label={variant.charAt(0).toUpperCase() + variant.slice(1)}
            variant={variant}
            size="sm"
            isDisabled
          />
        ))}
      </HStack>
    </VariantBlock>
  );
}

function ButtonsPanel({isCompact}: {isCompact: boolean}) {
  return (
    <Panel
      panelId="03 · buttons"
      title="Buttons"
      note="The full variant/size matrix, icon-leading buttons, a real 1.5s loading demo, and the disabled row.">
      <ButtonMatrix />
      <IconLeadingButtons isCompact={isCompact} />
      <LoadingButtons isCompact={isCompact} />
      <DisabledButtons />
    </Panel>
  );
}

// ============= PANEL 04 · BUTTON GROUPS =============

function SegmentedSwitcher({isCompact}: {isCompact: boolean}) {
  const [view, setView] = useState<PreviewView>('list');

  const previewPane =
    view === 'list' ? (
      <VStack gap={0}>
        {PREVIEW_DOCS.map((doc, index) => (
          <VStack gap={0} key={doc.id}>
            <HStack gap={2} vAlign="center" style={styles.previewRow}>
              <Icon icon={ListIcon} size="sm" color="secondary" />
              <StackItem size="fill" style={styles.previewText}>
                <Text size="sm" maxLines={1}>
                  {doc.name}
                </Text>
              </StackItem>
              <Text type="supporting" size="xsm" color="secondary">
                {doc.owner}
              </Text>
            </HStack>
            {index < PREVIEW_DOCS.length - 1 && <Divider />}
          </VStack>
        ))}
      </VStack>
    ) : view === 'grid' ? (
      <Grid columns={{minWidth: 140}} gap={2}>
        {PREVIEW_DOCS.map(doc => (
          <Card key={doc.id} padding={3}>
            <VStack gap={1}>
              <Icon icon={LayoutGridIcon} size="sm" color="secondary" />
              <Text size="sm" weight="semibold" maxLines={1}>
                {doc.name}
              </Text>
              <Text type="supporting" size="xsm" color="secondary">
                {doc.owner}
              </Text>
            </VStack>
          </Card>
        ))}
      </Grid>
    ) : (
      <VStack gap={0}>
        {PREVIEW_DOCS.map((doc, index) => (
          <VStack gap={0} key={doc.id}>
            <HStack gap={2} vAlign="center" style={styles.previewRow}>
              <StackItem size="fill" style={styles.previewText}>
                <Text size="sm" maxLines={1}>
                  {doc.name}
                </Text>
              </StackItem>
              <Badge
                variant={
                  doc.status === 'Final'
                    ? 'success'
                    : doc.status === 'In review'
                      ? 'info'
                      : 'neutral'
                }
                label={doc.status}
              />
            </HStack>
            {index < PREVIEW_DOCS.length - 1 && <Divider />}
          </VStack>
        ))}
      </VStack>
    );

  return (
    <VariantBlock
      title="Segmented view switcher"
      note="The control drives the preview pane below it — List, Grid, and Table are three real renderings of the same fixture."
      propsStrip={\`<SegmentedControl label="Preview view" value={view} onChange={setView}> <SegmentedControlItem value="list | grid | table" … /> </SegmentedControl>\`}>
      <VStack gap={3}>
        <SegmentedControl
          label="Preview view"
          value={view}
          onChange={value => setView(value as PreviewView)}
          size={isCompact ? 'md' : 'sm'}>
          <SegmentedControlItem
            value="list"
            label="List"
            icon={<Icon icon={ListIcon} size="sm" color="inherit" />}
          />
          <SegmentedControlItem
            value="grid"
            label="Grid"
            icon={<Icon icon={LayoutGridIcon} size="sm" color="inherit" />}
          />
          <SegmentedControlItem
            value="table"
            label="Table"
            icon={<Icon icon={TableIcon} size="sm" color="inherit" />}
          />
        </SegmentedControl>
        <div style={styles.previewPane}>{previewPane}</div>
      </VStack>
    </VariantBlock>
  );
}

function SplitButton({isCompact}: {isCompact: boolean}) {
  const [lastAction, setLastAction] = useState('none yet');

  return (
    <VariantBlock
      title="Split button"
      note="Primary action plus an attached chevron DropdownMenu; the readout records what fired."
      propsStrip={\`<ButtonGroup label="Save"><Button label="Save" /><DropdownMenu button={{isIconOnly: true, icon: <ChevronDown/>}} items={…} /></ButtonGroup>\`}>
      <HStack gap={3} vAlign="center" wrap="wrap" style={styles.readoutRow}>
        <ButtonGroup label="Save actions" size={isCompact ? 'md' : 'sm'}>
          <Button
            label="Save"
            variant="primary"
            size={isCompact ? 'md' : 'sm'}
            onClick={() => setLastAction('Save')}
          />
          <DropdownMenu
            button={{
              label: 'More save options',
              variant: 'primary',
              size: isCompact ? 'md' : 'sm',
              isIconOnly: true,
              icon: <Icon icon={ChevronDownIcon} size="sm" color="inherit" />,
            }}
            hasChevron={false}
            menuWidth={240}
            items={[
              {
                label: 'Save and publish',
                icon: <Icon icon={SendIcon} size="sm" color="inherit" />,
                onClick: () => setLastAction('Save and publish'),
              },
              {
                label: 'Save as draft',
                icon: <Icon icon={PencilIcon} size="sm" color="inherit" />,
                onClick: () => setLastAction('Save as draft'),
              },
              {type: 'divider' as const},
              {
                label: 'Save as template…',
                icon: <Icon icon={CopyIcon} size="sm" color="inherit" />,
                onClick: () => setLastAction('Save as template'),
              },
            ]}
          />
        </ButtonGroup>
        <Text type="supporting" color="secondary">
          Last action: {lastAction}
        </Text>
      </HStack>
    </VariantBlock>
  );
}

const TOOLBAR_MARKS = [
  {id: 'bold', label: 'Bold', icon: BoldIcon, kbd: 'mod+b'},
  {id: 'italic', label: 'Italic', icon: ItalicIcon, kbd: 'mod+i'},
  {id: 'underline', label: 'Underline', icon: UnderlineIcon, kbd: 'mod+u'},
  {id: 'link', label: 'Link', icon: Link2Icon, kbd: 'mod+k'},
] as const;

function IconToolbar({isCompact}: {isCompact: boolean}) {
  const [pressed, setPressed] = useState<ReadonlySet<string>>(
    new Set(['bold']),
  );
  const tapTargetStyle = isCompact ? styles.iconTapTarget : undefined;

  const toggleMark = (id: string) => {
    setPressed(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const activeLabels = TOOLBAR_MARKS.filter(mark => pressed.has(mark.id)).map(
    mark => mark.label,
  );

  return (
    <VariantBlock
      title="Icon toolbar group"
      note="Formatting toggles with real pressed states — the filled variant marks the active ones."
      propsStrip={\`<ButtonGroup label="Formatting"><IconButton variant={isPressed ? 'secondary' : 'ghost'} onClick={toggle} /></ButtonGroup>\`}>
      <HStack gap={3} vAlign="center" wrap="wrap" style={styles.readoutRow}>
        <ButtonGroup label="Text formatting" size="sm">
          {TOOLBAR_MARKS.map(mark => {
            const isPressed = pressed.has(mark.id);
            return (
              <IconButton
                key={mark.id}
                label={\`\${mark.label}\${isPressed ? ' (on)' : ''}\`}
                tooltip={mark.label}
                icon={<Icon icon={mark.icon} size="sm" color="inherit" />}
                variant={isPressed ? 'secondary' : 'ghost'}
                size="sm"
                style={tapTargetStyle}
                onClick={() => toggleMark(mark.id)}
              />
            );
          })}
        </ButtonGroup>
        <Text type="supporting" color="secondary">
          {activeLabels.length > 0
            ? \`Active: \${activeLabels.join(', ')}\`
            : 'No marks active'}
        </Text>
      </HStack>
    </VariantBlock>
  );
}

function ButtonGroupsPanel({isCompact}: {isCompact: boolean}) {
  return (
    <Panel
      panelId="04 · button-groups"
      title="Button groups"
      note="A segmented switcher wired to a preview pane, a split button with attached menu, and a pressed-state icon toolbar.">
      <SegmentedSwitcher isCompact={isCompact} />
      <SplitButton isCompact={isCompact} />
      <IconToolbar isCompact={isCompact} />
    </Panel>
  );
}

// ============= PANEL 05 · DROPDOWNS =============

function SimpleActionMenu({
  onAction,
  size,
}: {
  onAction: (label: string) => void;
  size: 'sm' | 'md';
}) {
  return (
    <VariantBlock
      title="Simple action menu"
      note="Data-driven items; arrow keys move focus, Escape and outside click close."
      propsStrip={\`<DropdownMenu button={{label: 'Actions'}} items={[{label, onClick}, …]} />\`}>
      <DropdownMenu
        button={{label: 'Actions', variant: 'secondary', size}}
        menuWidth={200}
        items={[
          {label: 'Open', onClick: () => onAction('Open')},
          {label: 'Rename', onClick: () => onAction('Rename')},
          {label: 'Duplicate', onClick: () => onAction('Duplicate')},
          {label: 'Move to…', onClick: () => onAction('Move to…')},
        ]}
      />
    </VariantBlock>
  );
}

function IconShortcutMenu({
  onAction,
  size,
}: {
  onAction: (label: string) => void;
  size: 'sm' | 'md';
}) {
  return (
    <VariantBlock
      title="Icons + shortcuts"
      note="Compound items pair a leading glyph with a Kbd shortcut in the end slot."
      propsStrip={\`<DropdownMenuItem icon={<Icon icon={CopyIcon}/>} label="Copy" endContent={<Kbd keys="mod+c" />} />\`}>
      <DropdownMenu
        button={{label: 'Edit', variant: 'secondary', size}}
        menuWidth={240}>
        <DropdownMenuItem
          icon={<Icon icon={CopyIcon} size="sm" color="inherit" />}
          label="Copy"
          endContent={<Kbd keys="mod+c" />}
          onClick={() => onAction('Copy')}
        />
        <DropdownMenuItem
          icon={<Icon icon={PencilIcon} size="sm" color="inherit" />}
          label="Rename"
          endContent={<Kbd keys="enter" />}
          onClick={() => onAction('Rename')}
        />
        <DropdownMenuItem
          icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
          label="Add to favorites"
          endContent={<Kbd keys="mod+d" />}
          onClick={() => onAction('Add to favorites')}
        />
        <DropdownMenuItem
          icon={<Icon icon={ExternalLinkIcon} size="sm" color="inherit" />}
          label="Open in new tab"
          endContent={<Kbd keys="mod+enter" />}
          onClick={() => onAction('Open in new tab')}
        />
      </DropdownMenu>
    </VariantBlock>
  );
}

function DangerZoneMenu({
  onAction,
  size,
}: {
  onAction: (label: string) => void;
  size: 'sm' | 'md';
}) {
  return (
    <VariantBlock
      title="Grouped + danger zone"
      note="Sectioned items with a divider before the destructive tail action."
      propsStrip={\`<DropdownMenuItem label="Delete project" style={{color: 'var(--color-error)'}} icon={<Icon icon={Trash2Icon}/>} />\`}>
      <DropdownMenu
        button={{label: 'Project', variant: 'secondary', size}}
        menuWidth={256}>
        <DropdownMenuItem
          icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}
          label="Share"
          description="Anyone with the link can view"
          onClick={() => onAction('Share')}
        />
        <DropdownMenuItem
          icon={<Icon icon={UserPlusIcon} size="sm" color="inherit" />}
          label="Invite members"
          onClick={() => onAction('Invite members')}
        />
        <DropdownMenuItem
          icon={<Icon icon={ArchiveIcon} size="sm" color="inherit" />}
          label="Archive"
          description="Hidden from the sidebar, kept forever"
          onClick={() => onAction('Archive')}
        />
        <Divider />
        <DropdownMenuItem
          icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
          label="Delete project"
          description="Cannot be undone"
          style={styles.dangerItem}
          onClick={() => onAction('Delete project')}
        />
      </DropdownMenu>
    </VariantBlock>
  );
}

function CheckableOptionsMenu({size}: {size: 'sm' | 'md'}) {
  const [enabled, setEnabled] = useState<ReadonlySet<string>>(
    new Set(DEFAULT_ENABLED_OPTIONS),
  );

  const toggleOption = (id: string) => {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const enabledOptions = VIEW_OPTIONS.filter(option => enabled.has(option.id));

  return (
    <VariantBlock
      title="Checkable options"
      note="Each pick toggles a check and updates the readout below — reopen the menu to keep adjusting."
      propsStrip={\`<DropdownMenuItem label="Show comments" endContent={enabled ? <Icon icon={CheckIcon}/> : <span/>} onClick={toggle} />\`}>
      <VStack gap={2}>
        <DropdownMenu
          button={{label: 'View options', variant: 'secondary', size}}
          menuWidth={232}>
          {VIEW_OPTIONS.map(option => {
            const isEnabled = enabled.has(option.id);
            return (
              <DropdownMenuItem
                key={option.id}
                label={\`\${option.label}\${isEnabled ? ' — on' : ''}\`}
                endContent={
                  <span style={styles.checkSlot}>
                    {isEnabled && (
                      <Icon icon={CheckIcon} size="sm" color="inherit" />
                    )}
                  </span>
                }
                onClick={() => toggleOption(option.id)}
              />
            );
          })}
        </DropdownMenu>
        <HStack gap={2} vAlign="center" wrap="wrap" style={styles.readoutRow}>
          <Text type="supporting" color="secondary">
            Enabled:
          </Text>
          {enabledOptions.length > 0 ? (
            enabledOptions.map(option => (
              <Token key={option.id} label={option.label} size="sm" color="blue" />
            ))
          ) : (
            <Text type="supporting" color="secondary">
              nothing — all options off
            </Text>
          )}
        </HStack>
      </VStack>
    </VariantBlock>
  );
}

function DropdownsPanel({isCompact}: {isCompact: boolean}) {
  const [lastAction, setLastAction] = useState('none yet');
  const buttonSize = isCompact ? 'md' : 'sm';

  return (
    <Panel
      panelId="05 · dropdowns"
      title="Dropdown menus"
      note="Simple actions, icons with shortcuts, a grouped danger zone, and a checkable options menu. The shared readout logs the last action.">
      <Grid columns={{minWidth: 320}} gap={4}>
        <SimpleActionMenu onAction={setLastAction} size={buttonSize} />
        <IconShortcutMenu onAction={setLastAction} size={buttonSize} />
        <DangerZoneMenu onAction={setLastAction} size={buttonSize} />
        <CheckableOptionsMenu size={buttonSize} />
      </Grid>
      <Card padding={3}>
        <HStack gap={2} vAlign="center">
          <Text type="label" size="sm">
            Last menu action
          </Text>
          <Badge
            variant={lastAction === 'Delete project' ? 'error' : 'neutral'}
            label={lastAction}
          />
        </HStack>
      </Card>
    </Panel>
  );
}

// ============= PAGE =============

export default function UiElementsGalleryTemplate() {
  const isCompact = useMediaQuery('(max-width: 640px)');

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>UI elements — 5 panels</Heading>
                <Badge label="reference sheet" variant="neutral" />
              </HStack>
            </StackItem>
            <Text type="supporting" color="secondary">
              avatars · badges · buttons · groups · menus
            </Text>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent role="main" label="UI elements gallery">
          <div style={styles.column}>
            <VStack gap={6}>
              <AvatarsPanel />
              <Divider />
              <BadgesPanel isCompact={isCompact} />
              <Divider />
              <ButtonsPanel isCompact={isCompact} />
              <Divider />
              <ButtonGroupsPanel isCompact={isCompact} />
              <Divider />
              <DropdownsPanel isCompact={isCompact} />
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};