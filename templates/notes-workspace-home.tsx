// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Foldnote "Bramblehill Studio"
 *   workspace: a nested page tree (Shared + Private sections with page
 *   emojis), one workspace-home page (cover, icon, callout, toggle blocks,
 *   synced block, backlinks), and a six-record "Projects tracker" inline
 *   database rendered in two views. Fixed ISO timestamps in early July 2026;
 *   no clocks, no randomness, no network media.
 * @output Notes Workspace Home — a Notion-style connected-workspace surface
 *   for the fictional startup Foldnote. Left sidebar with workspace switcher,
 *   search, and an expandable nested page tree split into Shared and Private
 *   sections (page emojis, live child counts); main canvas rendering the
 *   "Studio Home" page: gradient cover strip with an overlapping emoji icon,
 *   title row, a tinted callout block, a toggle-list group with one toggle
 *   expanded, a synced-block region with an instance-count chip, an inline
 *   database shown as Table and Board view tabs over the SAME six records
 *   (typed columns: status, owner, due, effort, tags; board grouped by
 *   status with matching counts), and a backlinks footer. A floating
 *   "+ New page" affordance anchors the bottom-right of the canvas.
 * @position Page template; emitted by `astryx template notes-workspace-home`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   start rail 264 (workspace header, search, TreeList page tree, pinned
 *   member strip) | content (pinned breadcrumb topbar + one scrolling canvas
 *   column, page body max-width 860 centered; floating New-page button
 *   anchored inside the canvas wrapper).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. Blocks (callout, toggles, synced region), database board cards,
 *   and backlink rows are styled divs, matching the block-editor idiom.
 * Color policy: token-pure everywhere except the ONE Foldnote brand accent —
 *   warm umber `light-dark(#8B5E34, #D4A97C)` — used for the wordmark fold
 *   glyph, the primary New CTA, the active view tab underline, the synced
 *   block outline/chip, and the Done status dot. The cover strip is a
 *   deterministic warm gradient built from the same accent literals at low
 *   alpha so it reads in both schemes. Everything else (text, borders,
 *   surfaces, status tokens) stays on theme tokens.
 *
 * Responsive contract:
 * - > 980px: full two-region frame, 860px page column centered.
 * - <= 980px: the sidebar rail is dropped; the topbar gains the workspace
 *   name in the breadcrumb trail so context survives. The page column goes
 *   full-bleed with tighter padding.
 * - <= 700px: topbar action cluster collapses to the share button + more
 *   menu; the database table scrolls horizontally (pixel column floors);
 *   board columns keep 240px width in one horizontal scroller.
 * - The sidebar tree and the canvas scroll independently (`minHeight: 0`
 *   down both flex chains); the topbar and the sidebar member strip are
 *   pinned. The floating New-page button stays anchored over the canvas at
 *   every width.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArrowDownUpIcon,
  ArrowUpRightIcon,
  ClockIcon,
  FilterIcon,
  ImageIcon,
  InboxIcon,
  Link2Icon,
  MessageSquareTextIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Settings2Icon,
  SparklesIcon,
  StarIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {
  AvatarGroup,
  AvatarGroupOverflow,
} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {BreadcrumbItem, Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import type {TokenColor} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// BRAND — Foldnote warm umber. The ONE accent; everything else is tokens.
// ---------------------------------------------------------------------------

const BRAND_ACCENT = 'light-dark(#8B5E34, #D4A97C)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(139, 94, 52, 0.12), rgba(212, 169, 124, 0.16))';
const BRAND_ACCENT_BORDER =
  'light-dark(rgba(139, 94, 52, 0.45), rgba(212, 169, 124, 0.5))';
// Scoped re-pin for design-system primary Buttons (the New CTA and the
// floating New-page affordance). One solid: white label text clears AA on
// #8B5E34 (5.4:1) in BOTH schemes; the 300-weight dark accent cannot.
const BRAND_CTA_SCOPE = {'--color-accent': '#8B5E34'} as CSSProperties;
// Cover gradient literals — same hue family, low alpha, scheme-safe.
const COVER_GRADIENT =
  'linear-gradient(105deg, light-dark(rgba(139,94,52,0.28), rgba(212,169,124,0.30)) 0%, light-dark(rgba(190,142,88,0.22), rgba(166,124,82,0.26)) 42%, light-dark(rgba(107,84,60,0.30), rgba(120,96,72,0.34)) 100%)';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},

  // Sidebar rail ----------------------------------------------------------
  railFill: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-background-muted)',
  },
  railHeader: {flexShrink: 0, padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)'},
  brandMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
    // The "fold" — a clipped corner reads as a folded page in both schemes.
    clipPath: 'polygon(0 0, 72% 0, 100% 28%, 100% 100%, 0 100%)',
  },
  railScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-2) var(--spacing-2)',
  },
  railSectionGap: {height: 'var(--spacing-3)', flexShrink: 0},
  pageEmoji: {
    width: 20,
    display: 'inline-flex',
    justifyContent: 'center',
    fontSize: 14,
    lineHeight: '20px',
    flexShrink: 0,
  },
  countChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 6px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  memberStrip: {flexShrink: 0, padding: 'var(--spacing-3)'},

  // Topbar ----------------------------------------------------------------
  contentFill: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  topbar: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  editedNote: {whiteSpace: 'nowrap'},

  // Canvas ----------------------------------------------------------------
  canvasScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  cover: {
    height: 176,
    backgroundImage: COVER_GRADIENT,
    position: 'relative',
  },
  coverActions: {
    position: 'absolute',
    right: 'var(--spacing-4)',
    bottom: 'var(--spacing-3)',
    display: 'flex',
    gap: 'var(--spacing-2)',
  },
  pageColumn: {
    maxWidth: 860,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    paddingBottom: 96,
  },
  pageColumnCompact: {paddingInline: 'var(--spacing-4)'},
  pageIcon: {
    fontSize: 58,
    lineHeight: '72px',
    width: 72,
    height: 72,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    boxShadow: 'var(--shadow-low)',
  },
  titleBlock: {paddingTop: 'var(--spacing-2)'},
  propRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  propLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    minWidth: 120,
  },

  // Blocks ----------------------------------------------------------------
  callout: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  calloutEmoji: {fontSize: 20, lineHeight: '26px', flexShrink: 0},
  toggleBlock: {
    borderRadius: 'var(--radius-container)',
    padding: '2px var(--spacing-2)',
  },
  toggleBody: {
    paddingInlineStart: 'var(--spacing-5)',
    paddingBlock: 'var(--spacing-1)',
  },
  bulletRow: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start'},
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    backgroundColor: 'var(--color-text-secondary)',
    marginTop: 8,
    flexShrink: 0,
  },
  syncedBlock: {
    position: 'relative',
    borderRadius: 'var(--radius-container)',
    border: `var(--border-width) dashed ${BRAND_ACCENT_BORDER}`,
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  syncedChip: {
    position: 'absolute',
    top: -11,
    right: 'var(--spacing-3)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT_SOFT,
    border: `var(--border-width) solid ${BRAND_ACCENT_BORDER}`,
    color: BRAND_ACCENT,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },

  // Inline database ---------------------------------------------------------
  dbHeader: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  dbTitleEmoji: {fontSize: 16, lineHeight: '20px'},
  dbTableWrap: {
    // Pixel column floors: narrow viewports scroll the database
    // horizontally instead of crushing typed cells.
    overflowX: 'auto',
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  dbFooterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) 0',
    borderTop: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
  },

  // Board view --------------------------------------------------------------
  boardScroll: {display: 'flex', gap: 'var(--spacing-3)', overflowX: 'auto', paddingBottom: 'var(--spacing-2)'},
  boardColumn: {width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)'},
  boardColumnHead: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', paddingInline: 2},
  statusDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  boardCard: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-low)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  boardCardMeta: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  tagWrap: {display: 'flex', gap: 4, flexWrap: 'wrap'},

  // Backlinks ---------------------------------------------------------------
  backlinkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    minWidth: 0,
  },

  // Floating affordance -------------------------------------------------------
  floatingNew: {
    position: 'absolute',
    right: 'var(--spacing-5)',
    bottom: 'var(--spacing-5)',
    zIndex: 2,
    display: 'inline-flex',
  },
};

// Status palette rides the data-viz categorical tokens (not injected by the
// demo — every use carries the repo-standard fallback pair). "Done" is the
// one brand-accent status emphasis.
const STATUS_COLOR = {
  gray: 'var(--color-text-secondary)',
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  accent: BRAND_ACCENT,
} as const;

// ---------------------------------------------------------------------------
// DATA — one fictional Foldnote customer workspace: Bramblehill Studio, an
// 11-person brand & product design studio. Signed-in user: Noa Lindqvist.
// Fixed ISO timestamps, 1–3 July 2026. Counts reconcile: the Projects
// tracker holds 6 records; board columns split 1 + 3 + 1 + 1 = 6; the
// backlinks footer lists exactly BACKLINKS.length pages.
// ---------------------------------------------------------------------------

const WORKSPACE_NAME = 'Bramblehill Studio';
const CURRENT_USER = 'Noa Lindqvist';
const MEMBER_COUNT = 11;
const PAGE_TITLE = 'Studio Home';
const PAGE_EDITED_AT = '2026-07-03T08:52:00Z';
const PAGE_EDITED_BY = 'Priya Raghavan';

/** Studio roster — owners for database records and backlink authors. */
const PEOPLE = [
  'Noa Lindqvist',
  'Priya Raghavan',
  'Felix Amoah',
  'June Castellanos',
  'Theo Brandt',
  'Marisol Duarte',
] as const;

// Sidebar page tree ---------------------------------------------------------

interface PageNode {
  id: string;
  emoji: string;
  title: string;
  children?: PageNode[];
  expanded?: boolean;
}

const SHARED_PAGES: PageNode[] = [
  {
    id: 'studio-home',
    emoji: '🏡',
    title: 'Studio Home',
    expanded: true,
    children: [
      {id: 'projects-tracker', emoji: '📋', title: 'Projects tracker'},
      {id: 'operating-rhythm', emoji: '🧭', title: 'Operating rhythm'},
    ],
  },
  {
    id: 'meeting-notes',
    emoji: '🗒️',
    title: 'Meeting notes',
    expanded: true,
    children: [
      {id: 'crit-jul-2', emoji: '🖍️', title: 'Design crit — Jul 2'},
      {id: 'standup-jul-3', emoji: '☕', title: 'Standup — Jul 3'},
    ],
  },
  {
    id: 'design-system',
    emoji: '🎨',
    title: 'Design system',
    children: [
      {id: 'ds-tokens', emoji: '🧩', title: 'Tokens & themes'},
      {id: 'ds-motion', emoji: '🌀', title: 'Motion guidelines'},
    ],
  },
  {id: 'client-portal', emoji: '🤝', title: 'Client portal — Alder & Vine'},
  {id: 'hiring', emoji: '🧵', title: 'Hiring — senior brand designer'},
];

const PRIVATE_PAGES: PageNode[] = [
  {id: 'weekly-notes', emoji: '🗓️', title: 'Weekly notes'},
  {id: 'reading-list', emoji: '📚', title: 'Reading list'},
  {id: 'pricing-memo', emoji: '✏️', title: 'Draft — pricing memo'},
];

// Inline database: Projects tracker ------------------------------------------

type StatusId = 'not-started' | 'in-progress' | 'in-review' | 'done';

interface StatusMeta {
  id: StatusId;
  label: string;
  dot: string;
  token: TokenColor;
}

/** Board column order; per-column record counts reconcile to 6 total. */
const STATUSES: StatusMeta[] = [
  {id: 'not-started', label: 'Not started', dot: STATUS_COLOR.gray, token: 'gray'},
  {id: 'in-progress', label: 'In progress', dot: STATUS_COLOR.blue, token: 'blue'},
  {id: 'in-review', label: 'In review', dot: STATUS_COLOR.orange, token: 'orange'},
  {id: 'done', label: 'Done', dot: STATUS_COLOR.accent, token: 'default'},
];

const STATUS_META: Record<StatusId, StatusMeta> = Object.fromEntries(
  STATUSES.map(status => [status.id, status]),
) as Record<StatusId, StatusMeta>;

type TagId = 'brand' | 'product' | 'web' | 'internal' | 'client';

const TAG_COLOR: Record<TagId, TokenColor> = {
  brand: 'purple',
  product: 'teal',
  web: 'cyan',
  internal: 'gray',
  client: 'yellow',
};

const TAG_LABEL: Record<TagId, string> = {
  brand: 'Brand',
  product: 'Product',
  web: 'Web',
  internal: 'Internal',
  client: 'Client',
};

// The Table generic requires rows assignable to Record<string, unknown>.
interface ProjectRow extends Record<string, unknown> {
  id: string;
  emoji: string;
  name: string;
  status: StatusId;
  owner: string;
  /** Fixed due date, July 2026 — rendered as a literal, no clocks. */
  due: string;
  dueLabel: string;
  /** Effort in studio points; the footer sums to 21. */
  effort: number;
  tags: TagId[];
}

/**
 * Six records; statuses split 1 not-started + 3 in-progress + 1 in-review +
 * 1 done = 6, and effort sums 5+3+2+4+3+4 = 21 (both repeated in the UI).
 */
const PROJECTS: ProjectRow[] = [
  {
    id: 'p-alder',
    emoji: '🌿',
    name: 'Alder & Vine — rebrand sprint',
    status: 'in-progress',
    owner: 'Priya Raghavan',
    due: '2026-07-10',
    dueLabel: 'Jul 10',
    effort: 5,
    tags: ['brand', 'client'],
  },
  {
    id: 'p-website',
    emoji: '🕸️',
    name: 'Studio website v3',
    status: 'in-progress',
    owner: 'Felix Amoah',
    due: '2026-07-17',
    dueLabel: 'Jul 17',
    effort: 3,
    tags: ['web', 'internal'],
  },
  {
    id: 'p-tokens',
    emoji: '🧩',
    name: 'Token bridge for Figma',
    status: 'in-review',
    owner: 'Theo Brandt',
    due: '2026-07-08',
    dueLabel: 'Jul 8',
    effort: 2,
    tags: ['product', 'internal'],
  },
  {
    id: 'p-harbor',
    emoji: '⚓',
    name: 'Harborlight app — onboarding flows',
    status: 'in-progress',
    owner: 'June Castellanos',
    due: '2026-07-24',
    dueLabel: 'Jul 24',
    effort: 4,
    tags: ['product', 'client'],
  },
  {
    id: 'p-deck',
    emoji: '🎪',
    name: 'New-business deck refresh',
    status: 'not-started',
    owner: 'Marisol Duarte',
    due: '2026-07-31',
    dueLabel: 'Jul 31',
    effort: 3,
    tags: ['brand', 'internal'],
  },
  {
    id: 'p-q2-retro',
    emoji: '🪞',
    name: 'Q2 retro synthesis',
    status: 'done',
    owner: 'Noa Lindqvist',
    due: '2026-07-02',
    dueLabel: 'Jul 2',
    effort: 4,
    tags: ['internal'],
  },
];

const TOTAL_EFFORT = 21; // 5 + 3 + 2 + 4 + 3 + 4 — asserted in the footer.

// Toggle-list blocks ---------------------------------------------------------

interface ToggleBlockData {
  id: string;
  title: string;
  bullets: string[];
  defaultOpen: boolean;
}

const TOGGLE_BLOCKS: ToggleBlockData[] = [
  {
    id: 't-rituals',
    title: 'Monday rituals',
    defaultOpen: true,
    bullets: [
      '9:30 standup in the Fern room — 15 minutes, cameras optional.',
      'Project leads update the Projects tracker before standup; the board below is the source of truth.',
      'Pitch anything for Friday crit in #crit-queue by end of day.',
    ],
  },
  {
    id: 't-crits',
    title: 'How we run crits',
    defaultOpen: false,
    bullets: [
      'Work-in-progress only — polish goes to the client portal.',
      'Presenter frames the question in one sentence before feedback starts.',
    ],
  },
  {
    id: 't-access',
    title: 'Studio access & guests',
    defaultOpen: false,
    bullets: [
      'Door code rotates on the first Monday of the month — see the pinned card in #ops.',
      'Guests sign in on the tablet by the kiln; badges live in the drawer beneath it.',
    ],
  },
];

// Backlinks -------------------------------------------------------------------

interface Backlink {
  id: string;
  emoji: string;
  title: string;
  path: string;
}

/** Exactly three — the footer count chip renders BACKLINKS.length. */
const BACKLINKS: Backlink[] = [
  {id: 'b-standup', emoji: '☕', title: 'Standup — Jul 3', path: 'Meeting notes'},
  {id: 'b-crit', emoji: '🖍️', title: 'Design crit — Jul 2', path: 'Meeting notes'},
  {id: 'b-onboard', emoji: '🧵', title: 'Hiring — senior brand designer', path: 'Shared'},
];

// ---------------------------------------------------------------------------
// SIDEBAR — workspace header, search, quick links, Shared/Private page
// trees (TreeList manages expansion internally; seeded via isExpanded),
// pinned member strip.
// ---------------------------------------------------------------------------

function CountChip({count}: {count: number}) {
  return <span style={styles.countChip}>{count}</span>;
}

function toTreeItems(
  nodes: PageNode[],
  activePageId: string,
  onSelect: (id: string) => void,
): TreeListItemData[] {
  return nodes.map(node => ({
    id: node.id,
    label: node.title,
    startContent: (
      <span style={styles.pageEmoji} aria-hidden>
        {node.emoji}
      </span>
    ),
    endContent:
      node.children !== undefined ? (
        <CountChip count={node.children.length} />
      ) : undefined,
    isSelected: node.id === activePageId,
    isExpanded: node.expanded,
    onClick: () => onSelect(node.id),
    children:
      node.children !== undefined
        ? toTreeItems(node.children, activePageId, onSelect)
        : undefined,
  }));
}

function Sidebar({
  activePageId,
  onSelectPage,
}: {
  activePageId: string;
  onSelectPage: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const sharedItems = useMemo(
    () => toTreeItems(SHARED_PAGES, activePageId, onSelectPage),
    [activePageId, onSelectPage],
  );
  const privateItems = useMemo(
    () => toTreeItems(PRIVATE_PAGES, activePageId, onSelectPage),
    [activePageId, onSelectPage],
  );

  return (
    <div style={styles.railFill}>
      <VStack gap={2} style={styles.railHeader}>
        <HStack gap={2} vAlign="center">
          <span style={styles.brandMark} aria-hidden>
            F
          </span>
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <Text type="label" size="sm" maxLines={1}>
                {WORKSPACE_NAME}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                Foldnote · {MEMBER_COUNT} members
              </Text>
            </VStack>
          </StackItem>
          <IconButton
            label="Workspace settings"
            tooltip="Workspace settings"
            variant="ghost"
            size="sm"
            icon={<Icon icon={Settings2Icon} size="sm" />}
          />
        </HStack>
        <TextInput
          label="Search pages"
          isLabelHidden
          placeholder="Search Bramblehill…"
          size="sm"
          startIcon={SearchIcon}
          value={query}
          onChange={setQuery}
        />
      </VStack>
      <div style={styles.railScroll}>
        <TreeList
          density="compact"
          items={[
            {
              id: 'inbox',
              label: 'Updates',
              startContent: <Icon icon={InboxIcon} size="sm" color="secondary" />,
              endContent: <CountChip count={4} />,
            },
            {
              id: 'foldnote-ai',
              label: 'Foldnote Q&A',
              startContent: (
                <Icon icon={SparklesIcon} size="sm" color="secondary" />
              ),
            },
          ]}
        />
        <div style={styles.railSectionGap} />
        <TreeList
          density="compact"
          items={sharedItems}
          header={
            <Text type="label" size="sm" color="secondary">
              Shared
            </Text>
          }
        />
        <div style={styles.railSectionGap} />
        <TreeList
          density="compact"
          items={privateItems}
          header={
            <Text type="label" size="sm" color="secondary">
              Private
            </Text>
          }
        />
        <div style={styles.railSectionGap} />
        <TreeList
          density="compact"
          items={[
            {
              id: 'templates',
              label: 'Templates',
              startContent: <Icon icon={PlusIcon} size="sm" color="secondary" />,
            },
            {
              id: 'trash',
              label: 'Trash',
              startContent: (
                <Icon icon={Trash2Icon} size="sm" color="secondary" />
              ),
            },
          ]}
        />
      </div>
      <Divider />
      <HStack gap={2} vAlign="center" style={styles.memberStrip}>
        <AvatarGroup size="xsmall" aria-label={`${MEMBER_COUNT} workspace members`}>
          <Avatar name={PEOPLE[0]} />
          <Avatar name={PEOPLE[1]} />
          <Avatar name={PEOPLE[2]} />
          <AvatarGroupOverflow count={MEMBER_COUNT - 3} />
        </AvatarGroup>
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            {MEMBER_COUNT} members
          </Text>
        </StackItem>
        <Button
          label="Invite"
          variant="ghost"
          size="sm"
          icon={<Icon icon={UsersIcon} size="sm" color="inherit" />}
        />
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TOPBAR — breadcrumb trail, edited-by note, share/comment/star/more cluster.
// ---------------------------------------------------------------------------

function Topbar({
  showWorkspaceCrumb,
  isNarrow,
  isStarred,
  onToggleStar,
}: {
  showWorkspaceCrumb: boolean;
  isNarrow: boolean;
  isStarred: boolean;
  onToggleStar: () => void;
}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.topbar}>
      <StackItem size="fill" style={{minWidth: 0}}>
        <Breadcrumbs label="Page location">
          {showWorkspaceCrumb ? (
            <BreadcrumbItem onClick={() => {}}>{WORKSPACE_NAME}</BreadcrumbItem>
          ) : null}
          <BreadcrumbItem onClick={() => {}}>Shared</BreadcrumbItem>
          <BreadcrumbItem isCurrent>{`🏡 ${PAGE_TITLE}`}</BreadcrumbItem>
        </Breadcrumbs>
      </StackItem>
      {!isNarrow ? (
        <HStack gap={1} vAlign="center">
          <Icon icon={ClockIcon} size="xsm" color="secondary" />
          <Text
            type="supporting"
            color="secondary"
            style={styles.editedNote}
            maxLines={1}>
            Edited <Timestamp value={PAGE_EDITED_AT} format="relative" /> by{' '}
            {PAGE_EDITED_BY.split(' ')[0]}
          </Text>
        </HStack>
      ) : null}
      <Button label="Share" variant="secondary" size="sm" />
      {!isNarrow ? (
        <IconButton
          label="View comments"
          tooltip="View comments"
          variant="ghost"
          size="sm"
          icon={<Icon icon={MessageSquareTextIcon} size="sm" />}
        />
      ) : null}
      {!isNarrow ? (
        <IconButton
          label={isStarred ? 'Remove from favorites' : 'Add to favorites'}
          tooltip={isStarred ? 'Remove from favorites' : 'Add to favorites'}
          variant="ghost"
          size="sm"
          onClick={onToggleStar}
          icon={
            <span style={isStarred ? {color: BRAND_ACCENT, display: 'inline-flex'} : {display: 'inline-flex'}}>
              <Icon icon={StarIcon} size="sm" color="inherit" />
            </span>
          }
        />
      ) : null}
      <MoreMenu
        label="Page options"
        items={[
          {label: 'Copy link', icon: <Icon icon={Link2Icon} size="sm" color="inherit" />, onClick: () => {}},
          {label: 'Duplicate page', onClick: () => {}},
          {label: 'Lock page', onClick: () => {}},
          {type: 'divider' as const},
          {label: 'Export as Markdown', onClick: () => {}},
          {label: 'Page history', icon: <Icon icon={ClockIcon} size="sm" color="inherit" />, onClick: () => {}},
        ]}
      />
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// BLOCKS — callout, toggle list, synced block. Styled divs per the
// block-editor container policy (no Cards on the canvas).
// ---------------------------------------------------------------------------

function CalloutBlock() {
  return (
    <div style={styles.callout}>
      <span style={styles.calloutEmoji} aria-hidden>
        💡
      </span>
      <VStack gap={1}>
        <Text type="label">Welcome to the studio home</Text>
        <Text type="body" color="secondary">
          Everything the studio runs on lives here: the projects tracker,
          weekly rituals, and links out to client portals. New here? Start
          with “Monday rituals” below, then say hi in #introductions.
        </Text>
      </VStack>
    </div>
  );
}

function ToggleBlock({block}: {block: ToggleBlockData}) {
  return (
    <Collapsible
      defaultIsOpen={block.defaultOpen}
      style={styles.toggleBlock}
      trigger={<Text type="label">{block.title}</Text>}>
      <VStack gap={1} style={styles.toggleBody}>
        {block.bullets.map(bullet => (
          <div key={bullet} style={styles.bulletRow}>
            <span style={styles.bulletDot} aria-hidden />
            <Text type="body" color="secondary">
              {bullet}
            </Text>
          </div>
        ))}
      </VStack>
    </Collapsible>
  );
}

function SyncedBlock() {
  return (
    <div style={styles.syncedBlock}>
      <Tooltip content="Edits here update every copy of this block">
        <span style={styles.syncedChip}>
          <Icon icon={RefreshCwIcon} size="xsm" color="inherit" />
          Synced · 2 pages
        </span>
      </Tooltip>
      <VStack gap={1}>
        <Text type="label">This week at Bramblehill</Text>
        <Text type="body" color="secondary">
          Alder &amp; Vine mid-sprint review moved to Thursday 14:00. The
          Harborlight onboarding flows go to usability testing Friday — June
          is recruiting five participants. Q2 retro synthesis is done; read
          it before Monday’s planning.
        </Text>
        <Text type="supporting" color="secondary">
          Also synced on 🗓️ Weekly notes
        </Text>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// INLINE DATABASE — Projects tracker. One record set, two views: a typed
// table and a status-grouped board. Counts and effort totals reconcile.
// ---------------------------------------------------------------------------

function StatusCell({status}: {status: StatusId}) {
  const meta = STATUS_META[status];
  return (
    <Token
      label={meta.label}
      size="sm"
      color={meta.token}
      icon={
        meta.id === 'done' ? (
          <span style={{...styles.statusDot, backgroundColor: meta.dot}} />
        ) : undefined
      }
    />
  );
}

function NameCell({row}: {row: ProjectRow}) {
  return (
    <HStack gap={2} vAlign="center">
      <span style={styles.pageEmoji} aria-hidden>
        {row.emoji}
      </span>
      <Text type="label" maxLines={1}>
        {row.name}
      </Text>
    </HStack>
  );
}

function OwnerCell({owner}: {owner: string}) {
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={owner} size="xsmall" />
      <Text type="body" maxLines={1}>
        {owner === CURRENT_USER ? `${owner.split(' ')[0]} (you)` : owner}
      </Text>
    </HStack>
  );
}

function TagsCell({tags}: {tags: TagId[]}) {
  return (
    <div style={styles.tagWrap}>
      {tags.map(tag => (
        <Token key={tag} label={TAG_LABEL[tag]} size="sm" color={TAG_COLOR[tag]} />
      ))}
    </div>
  );
}

// Footgun: Table cells carry max-width: 0 — fixed columns need pixel()
// so the header carries both width and minWidth.
const PROJECT_COLUMNS: TableColumn<ProjectRow>[] = [
  {
    key: 'name',
    header: 'Name',
    width: proportional(2, {minWidth: 220}),
    renderCell: (row: ProjectRow) => <NameCell row={row} />,
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(120),
    renderCell: (row: ProjectRow) => <StatusCell status={row.status} />,
  },
  {
    key: 'owner',
    header: 'Owner',
    width: pixel(170),
    renderCell: (row: ProjectRow) => <OwnerCell owner={row.owner} />,
  },
  {
    key: 'due',
    header: 'Due',
    width: pixel(90),
    renderCell: (row: ProjectRow) => (
      <Text type="body" color="secondary" hasTabularNumbers style={styles.numericCell}>
        {row.dueLabel}
      </Text>
    ),
  },
  {
    key: 'effort',
    header: 'Effort',
    align: 'end',
    width: pixel(80),
    renderCell: (row: ProjectRow) => (
      <Text type="body" color="secondary" hasTabularNumbers style={styles.numericCell}>
        {row.effort} pts
      </Text>
    ),
  },
  {
    key: 'tags',
    header: 'Tags',
    width: pixel(160),
    renderCell: (row: ProjectRow) => <TagsCell tags={row.tags} />,
  },
];

function ProjectsTableView() {
  return (
    <VStack gap={0}>
      <div style={styles.dbTableWrap}>
        <Table<ProjectRow>
          data={PROJECTS}
          columns={PROJECT_COLUMNS}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
          aria-label="Projects tracker — table view"
        />
      </div>
      {/* Calc footer — 5 + 3 + 2 + 4 + 3 + 4 = 21 pts across 6 records. */}
      <div style={styles.dbFooterRow}>
        <Icon icon={PlusIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            New record
          </Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Count {PROJECTS.length} · Sum {TOTAL_EFFORT} pts
        </Text>
      </div>
    </VStack>
  );
}

function BoardCard({row}: {row: ProjectRow}) {
  return (
    <div style={styles.boardCard}>
      <HStack gap={2} vAlign="center">
        <span style={styles.pageEmoji} aria-hidden>
          {row.emoji}
        </span>
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="label" size="sm" maxLines={2}>
            {row.name}
          </Text>
        </StackItem>
      </HStack>
      <div style={styles.tagWrap}>
        {row.tags.map(tag => (
          <Token key={tag} label={TAG_LABEL[tag]} size="sm" color={TAG_COLOR[tag]} />
        ))}
      </div>
      <div style={styles.boardCardMeta}>
        <Avatar name={row.owner} size="xsmall" />
        <StackItem size="fill">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {row.dueLabel}
          </Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {row.effort} pts
        </Text>
      </div>
    </div>
  );
}

function ProjectsBoardView() {
  return (
    <div style={styles.boardScroll}>
      {STATUSES.map(status => {
        const cards = PROJECTS.filter(row => row.status === status.id);
        return (
          <div key={status.id} style={styles.boardColumn}>
            <div style={styles.boardColumnHead}>
              <span
                style={{...styles.statusDot, backgroundColor: status.dot}}
                aria-hidden
              />
              <StackItem size="fill">
                <Text type="label" size="sm">
                  {status.label}
                </Text>
              </StackItem>
              <CountChip count={cards.length} />
            </div>
            {cards.map(row => (
              <BoardCard key={row.id} row={row} />
            ))}
            <Button
              label="New"
              variant="ghost"
              size="sm"
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
            />
          </div>
        );
      })}
    </div>
  );
}

type DbView = 'table' | 'board';

function ProjectsDatabase({
  view,
  onViewChange,
}: {
  view: DbView;
  onViewChange: (view: DbView) => void;
}) {
  return (
    <VStack gap={2}>
      <div style={styles.dbHeader}>
        <span style={styles.dbTitleEmoji} aria-hidden>
          📋
        </span>
        <Heading level={3}>Projects tracker</Heading>
        <Badge label={`${PROJECTS.length} records`} />
        <StackItem size="fill" />
        <TabList
          value={view}
          onChange={value => onViewChange(value as DbView)}
          size="sm">
          <Tab value="table" label="Table" />
          <Tab value="board" label="Board" />
        </TabList>
        <IconButton
          label="Filter records"
          tooltip="Filter records"
          variant="ghost"
          size="sm"
          icon={<Icon icon={FilterIcon} size="sm" />}
        />
        <IconButton
          label="Sort records"
          tooltip="Sort records"
          variant="ghost"
          size="sm"
          icon={<Icon icon={ArrowDownUpIcon} size="sm" />}
        />
        <span style={BRAND_CTA_SCOPE}>
          <Button label="New" variant="primary" size="sm" />
        </span>
      </div>
      {view === 'table' ? <ProjectsTableView /> : <ProjectsBoardView />}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// BACKLINKS FOOTER — pages linking to Studio Home; count chip matches rows.
// ---------------------------------------------------------------------------

function BacklinksFooter() {
  return (
    <Collapsible
      defaultIsOpen
      style={styles.toggleBlock}
      trigger={
        <HStack gap={2} vAlign="center">
          <Icon icon={Link2Icon} size="sm" color="secondary" />
          <Text type="label" color="secondary">
            {BACKLINKS.length} backlinks
          </Text>
        </HStack>
      }>
      <VStack gap={0} style={styles.toggleBody}>
        {BACKLINKS.map(link => (
          <div key={link.id} style={styles.backlinkRow}>
            <span style={styles.pageEmoji} aria-hidden>
              {link.emoji}
            </span>
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text type="body" maxLines={1}>
                {link.title}
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" maxLines={1}>
              {link.path}
            </Text>
            <Icon icon={ArrowUpRightIcon} size="xsm" color="secondary" />
          </div>
        ))}
      </VStack>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// PAGE — default export.
// ---------------------------------------------------------------------------

export default function NotesWorkspaceHomeTemplate() {
  // <= 980px: sidebar rail drops; <= 700px: topbar cluster collapses.
  const isRailHidden = useMediaQuery('(max-width: 980px)');
  const isNarrow = useMediaQuery('(max-width: 700px)');

  const [activePageId, setActivePageId] = useState('studio-home');
  const [dbView, setDbView] = useState<DbView>('table');
  const [isStarred, setIsStarred] = useState(true);

  const canvas = (
    <div style={styles.contentFill}>
      <Topbar
        showWorkspaceCrumb={isRailHidden}
        isNarrow={isNarrow}
        isStarred={isStarred}
        onToggleStar={() => setIsStarred(current => !current)}
      />
      <div style={styles.canvasScroll}>
        {/* Cover strip — deterministic warm gradient, no assets. */}
        <div style={styles.cover}>
          <div style={styles.coverActions}>
            <Button
              label="Change cover"
              variant="secondary"
              size="sm"
              icon={<Icon icon={ImageIcon} size="sm" color="inherit" />}
            />
            <Button label="Reposition" variant="secondary" size="sm" />
          </div>
        </div>
        <div
          style={
            isRailHidden
              ? {...styles.pageColumn, ...styles.pageColumnCompact}
              : styles.pageColumn
          }>
          <VStack gap={4}>
            <VStack gap={2} style={styles.titleBlock}>
              <span style={styles.pageIcon} aria-hidden>
                🏡
              </span>
              <Heading level={1}>{PAGE_TITLE}</Heading>
              <div style={styles.propRow}>
                <span style={styles.propLabel}>
                  <Icon icon={UsersIcon} size="xsm" color="inherit" />
                  Maintained by
                </span>
                <HStack gap={1} vAlign="center">
                  <Avatar name={PAGE_EDITED_BY} size="xsmall" />
                  <Text type="supporting" color="secondary">
                    {PAGE_EDITED_BY} · Studio ops
                  </Text>
                </HStack>
              </div>
            </VStack>

            <CalloutBlock />

            <VStack gap={1}>
              {TOGGLE_BLOCKS.map(block => (
                <ToggleBlock key={block.id} block={block} />
              ))}
            </VStack>

            <SyncedBlock />

            <ProjectsDatabase view={dbView} onViewChange={setDbView} />

            <Divider />
            <BacklinksFooter />
          </VStack>
        </div>
      </div>

      {/* Floating New-page affordance — anchored over the canvas. The
          shadow rides the Button so it hugs the control's own radius. */}
      <span style={{...styles.floatingNew, ...BRAND_CTA_SCOPE}}>
        <Button
          label="New page"
          variant="primary"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          style={{boxShadow: 'var(--shadow-high)'}}
        />
      </span>
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        start={
          isRailHidden ? undefined : (
            <LayoutPanel width={264} padding={0} hasDivider label="Workspace pages">
              <Sidebar
                activePageId={activePageId}
                onSelectPage={setActivePageId}
              />
            </LayoutPanel>
          )
        }
        content={<LayoutContent padding={0}>{canvas}</LayoutContent>}
      />
    </div>
  );
}
