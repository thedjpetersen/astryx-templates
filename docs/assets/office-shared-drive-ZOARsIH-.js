var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — a fixed Kestrel Labs drive listing
 *   (files, owners, share lists, ISO timestamps in early July 2026, byte
 *   sizes, storage totals). No clocks, no randomness, no network media.
 * @output Shared Drive Manager — a productivity-suite drive surface for the
 *   Kestrel Labs "Atlas Q3" program. A folder-tree rail (My Drive, three
 *   shared drives with membership chips, Starred, Trash) with a pinned
 *   storage-quota strip; a sortable multi-select file table (name + app
 *   icon, owner, shared-with facepile, last modified, size) with a bulk
 *   action bar; a right details panel for the active file with a
 *   Details/Activity toggle (sharing summary, metadata, storage line,
 *   activity feed); and a New split button in the header.
 * @position Page template; emitted by \`astryx template office-shared-drive\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | rail 260 (TreeList scopes + pinned quota strip)
 *   | content (breadcrumb toolbar, bulk bar when rows are checked, file
 *   Table scrolling both axes) | end panel 320 (details, scrolls).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. The details panel is a LayoutPanel, the preview tile and the
 *   membership chips are styled divs.
 * Color policy: token-pure everywhere; the only literals are the
 *   \`light-dark()\` fallback pairs on the data-viz categorical tokens used
 *   for file-kind glyphs and drive dots (the demo does not inject
 *   \`--color-data-categorical-*\`).
 *
 * Responsive contract:
 * - > 1180px: full three-region frame.
 * - <= 1180px: the details panel is dropped (the file table stays the
 *   source of truth); the header details toggle hides with it.
 * - <= 860px: the tree rail is dropped; a scope Selector appears in the
 *   content toolbar, and the table drops the Shared and Size columns so
 *   name/owner/modified never crush. The header row wraps instead of
 *   clipping the search box or the New split button.
 * - The rail tree, the file table, and the details panel each scroll
 *   independently (\`minHeight: 0\` down every flex chain); the quota strip
 *   and toolbars are pinned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  Building2Icon,
  ChevronDownIcon,
  ClockIcon,
  FileArchiveIcon,
  FileIcon,
  FilePlus2Icon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FilmIcon,
  FolderIcon,
  FolderInputIcon,
  FolderPlusIcon,
  FolderUpIcon,
  GlobeIcon,
  HardDriveIcon,
  ImageIcon,
  LinkIcon,
  LockIcon,
  MessageSquareTextIcon,
  PanelRightIcon,
  PencilIcon,
  PlusIcon,
  PresentationIcon,
  RotateCcwIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  UploadIcon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

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
import {
  AvatarGroup,
  AvatarGroupOverflow,
} from '@astryxdesign/core/AvatarGroup';
import {BreadcrumbItem, Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {
  Table,
  pixel,
  proportional,
  useTableSelection,
  useTableSelectionState,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-2)'},
  quotaStrip: {flexShrink: 0, padding: 'var(--spacing-3)'},
  memberChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 7px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  driveDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentToolbar: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-4)'},
  bulkBar: {flexShrink: 0},
  tableScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    // Pixel columns + the proportional name column keep a floor; narrow
    // viewports scroll the table horizontally instead of crushing cells.
    overflowX: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-3)',
  },
  tableEmpty: {padding: 'var(--spacing-6) var(--spacing-4)'},
  kindGlyph: {display: 'inline-flex', flexShrink: 0},
  starGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    color: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  uploadBar: {minWidth: 0, width: 72},
  // Details panel ---------------------------------------------------------
  // spacing-3 inset (matching the rail's quota strip) — with the compact
  // vertical rhythm below it keeps the default details stack (7-person
  // share list + metadata) above the demo card's bottom fold.
  detailScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-3)'},
  previewTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  trashNotice: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  shareRow: {minWidth: 0},
  // Link-audience rows ("Anyone at Kestrel Labs" / "Restricted") keep the
  // access list's leading-avatar pattern: same 36px circle as Avatar small.
  accessGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard \`light-dark()\` fallback pair.
const KIND_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  red: 'light-dark(#DC2626, #F87171)',
  neutral: 'var(--color-text-secondary)',
} as const;

// ---------------------------------------------------------------------------
// DATA — one shared fictional workspace: Kestrel Labs (40-person product
// studio), "Atlas Q3" launch program. Signed-in user: Dana Whitfield.
// Fixed ISO timestamps, 1–3 July 2026. Storage totals reconcile:
// 21.4 + 6.8 + 4.1 (shared drives) + 6.3 (My Drive) = 38.6 of 100 GB.
// ---------------------------------------------------------------------------

const CURRENT_USER = 'Dana Whitfield';

type FileKind =
  | 'folder'
  | 'doc'
  | 'sheet'
  | 'deck'
  | 'pdf'
  | 'image'
  | 'video'
  | 'archive';

interface KindMeta {
  icon: typeof FileTextIcon;
  color: string;
  label: string;
}

const KIND_META: Record<FileKind, KindMeta> = {
  folder: {icon: FolderIcon, color: KIND_COLOR.neutral, label: 'Folder'},
  doc: {icon: FileTextIcon, color: KIND_COLOR.blue, label: 'Doc'},
  sheet: {icon: FileSpreadsheetIcon, color: KIND_COLOR.green, label: 'Sheet'},
  deck: {icon: PresentationIcon, color: KIND_COLOR.orange, label: 'Deck'},
  pdf: {icon: FileIcon, color: KIND_COLOR.red, label: 'PDF'},
  image: {icon: ImageIcon, color: KIND_COLOR.purple, label: 'Image'},
  video: {icon: FilmIcon, color: KIND_COLOR.teal, label: 'Video'},
  archive: {icon: FileArchiveIcon, color: KIND_COLOR.neutral, label: 'Archive'},
};

type DriveId = 'my' | 'atlas' | 'design' | 'allhands';
type Scope = DriveId | 'starred' | 'trash';

interface DriveMeta {
  id: DriveId;
  label: string;
  /** Shared drives only: member count surfaced as the rail chip. */
  members?: number;
  /** Fixed used-storage figure (GB) — repeats in the details panel. */
  usedGb: number;
  dotColor?: string;
}

const DRIVES: Record<DriveId, DriveMeta> = {
  my: {id: 'my', label: 'My Drive', usedGb: 6.3},
  atlas: {
    id: 'atlas',
    label: 'Atlas Q3 Launch',
    members: 8,
    usedGb: 21.4,
    dotColor: KIND_COLOR.blue,
  },
  design: {
    id: 'design',
    label: 'Design Systems',
    members: 12,
    usedGb: 6.8,
    dotColor: KIND_COLOR.purple,
  },
  allhands: {
    id: 'allhands',
    label: 'Kestrel All-Hands',
    members: 40,
    usedGb: 4.1,
    dotColor: KIND_COLOR.teal,
  },
};

const SHARED_DRIVE_IDS: DriveId[] = ['atlas', 'design', 'allhands'];

// Storage quota strip — the shared-drive subtotal (32.3) is the sum of the
// three shared drives above; 32.3 + 6.3 (My Drive) = 38.6 used.
const QUOTA = {usedGb: 38.6, totalGb: 100, sharedGb: 32.3, myGb: 6.3};

/** Kestrel Labs roster — names and roles are stable across the suite. */
const PEOPLE: Record<string, {role: string}> = {
  'Dana Whitfield': {role: 'Operations lead'},
  'Priya Raman': {role: 'Atlas Q3 program lead'},
  'Marcus Webb': {role: 'Finance'},
  'Sofia Ortiz': {role: 'Design lead'},
  'Jonah Fields': {role: 'Brand & motion'},
  'Elena Voss': {role: 'Research'},
  'Tom Okonkwo': {role: 'Engineering'},
};

// The Table generic requires rows assignable to Record<string, unknown>.
interface FileRow extends Record<string, unknown> {
  id: string;
  name: string;
  kind: FileKind;
  drive: DriveId;
  owner: string;
  /** People with direct access (excludes the owner). */
  sharedWith: string[];
  /** True when an org-wide "anyone at Kestrel Labs" link exists. */
  hasOrgLink: boolean;
  createdAt: string;
  modifiedAt: string;
  modifiedBy: string;
  /** null for folders (drives report folder size as em dash). */
  sizeBytes: number | null;
  /** Folders only. */
  itemCount?: number;
  isStarred: boolean;
  isTrashed: boolean;
  trashedAt?: string;
  /** Seeded mid-upload row: fixed fixture percentage, no animation. */
  uploadPct?: number;
}

// Compact fixture rows (tuple pattern, see subtitle-cue-editor.tsx):
// [id, name, kind, drive, owner, sharedWith, hasOrgLink,
//  createdAt, modifiedAt, modifiedBy, sizeBytes, flags?]
// flags: star, trash (trashedAt ISO), items (folder children), uploadPct.
interface FileFlags {
  star?: boolean;
  trash?: string;
  items?: number;
  uploadPct?: number;
}

type FileSpec = [
  string,
  string,
  FileKind,
  DriveId,
  string,
  string[],
  boolean,
  string,
  string,
  string,
  number | null,
  FileFlags?,
];

/** Full Atlas Q3 Launch drive membership minus the owner (Priya). */
const ATLAS_TEAM = ['Marcus Webb', 'Sofia Ortiz', 'Jonah Fields', 'Elena Voss', 'Tom Okonkwo', 'Dana Whitfield'];

const FILE_SPECS: FileSpec[] = [
  // ---- Atlas Q3 Launch (shared drive) ----
  ['f-prereads', 'Launch review pre-reads', 'folder', 'atlas', 'Priya Raman', ATLAS_TEAM, false,
    '2026-07-01T09:00:00Z', '2026-07-02T16:20:00Z', 'Priya Raman', null, {items: 6}],
  ['f-launch-plan', 'Atlas Q3 launch plan', 'doc', 'atlas', 'Priya Raman', ATLAS_TEAM, true,
    '2026-07-01T09:00:00Z', '2026-07-03T08:41:00Z', 'Marcus Webb', 151_552 /* 148 KB */, {star: true}],
  ['f-budget', 'Atlas Q3 budget — working', 'sheet', 'atlas', 'Marcus Webb', ['Priya Raman', 'Dana Whitfield'], false,
    '2026-07-01T10:15:00Z', '2026-07-02T17:45:00Z', 'Marcus Webb', 913_408 /* 892 KB */, {star: true}],
  ['f-kickoff', 'Atlas Q3 kickoff deck', 'deck', 'atlas', 'Sofia Ortiz',
    ['Priya Raman', 'Marcus Webb', 'Jonah Fields', 'Elena Voss', 'Dana Whitfield'], true,
    '2026-07-01T08:20:00Z', '2026-07-01T15:30:00Z', 'Sofia Ortiz', 6_710_886 /* 6.4 MB */],
  ['f-contract', 'Halcyon Print Co — signed contract.pdf', 'pdf', 'atlas', 'Dana Whitfield',
    ['Marcus Webb', 'Priya Raman'], false,
    '2026-07-02T10:58:00Z', '2026-07-02T11:02:00Z', 'Dana Whitfield', 2_516_582 /* 2.4 MB */],
  ['f-hero', 'atlas-hero-render-v3.png', 'image', 'atlas', 'Jonah Fields', ['Sofia Ortiz', 'Priya Raman'], false,
    '2026-07-01T19:40:00Z', '2026-07-01T19:56:00Z', 'Jonah Fields', 15_518_925 /* 14.8 MB */],
  ['f-teaser', 'launch-teaser-cut-b.mp4', 'video', 'atlas', 'Jonah Fields',
    ['Sofia Ortiz', 'Priya Raman', 'Dana Whitfield'], false,
    '2026-07-02T21:00:00Z', '2026-07-02T21:14:00Z', 'Jonah Fields', 432_013_312 /* 412 MB */],
  ['f-okr', 'Q3 OKR tracker', 'sheet', 'atlas', 'Dana Whitfield',
    ['Priya Raman', 'Marcus Webb', 'Sofia Ortiz', 'Jonah Fields', 'Elena Voss', 'Tom Okonkwo'], true,
    '2026-07-01T09:30:00Z', '2026-07-03T07:58:00Z', 'Priya Raman', 349_184 /* 341 KB */],
  // Seeded mid-upload row — fixed fixture percentage, no animation.
  ['f-presskit', 'atlas-press-kit.zip', 'archive', 'atlas', 'Dana Whitfield', [], false,
    '2026-07-03T09:02:00Z', '2026-07-03T09:02:00Z', 'Dana Whitfield', 100_663_296 /* 96 MB */, {uploadPct: 64}],
  // ---- My Drive (Dana Whitfield) ----
  ['f-usability', 'Usability notes — Atlas onboarding', 'doc', 'my', 'Dana Whitfield', ['Elena Voss'], false,
    '2026-07-02T13:30:00Z', '2026-07-02T14:05:00Z', 'Elena Voss', 98_304 /* 96 KB */, {star: true}],
  ['f-receipts', 'Receipts — Q3 travel', 'folder', 'my', 'Dana Whitfield', [], false,
    '2026-07-01T08:30:00Z', '2026-07-01T08:30:00Z', 'Dana Whitfield', null, {items: 9}],
  ['f-policy', 'Kestrel travel policy v4.pdf', 'pdf', 'my', 'Dana Whitfield', [], true,
    '2026-07-01T10:05:00Z', '2026-07-01T10:12:00Z', 'Dana Whitfield', 1_153_434 /* 1.1 MB */],
  ['f-headshot', 'headshot-dana-2026.jpg', 'image', 'my', 'Dana Whitfield', [], false,
    '2026-07-01T12:34:00Z', '2026-07-01T12:40:00Z', 'Dana Whitfield', 3_355_443 /* 3.2 MB */],
  // ---- Design Systems (shared drive) ----
  ['f-audit', 'Component audit — Q3', 'deck', 'design', 'Sofia Ortiz',
    ['Jonah Fields', 'Dana Whitfield', 'Tom Okonkwo'], false,
    '2026-07-01T11:00:00Z', '2026-07-02T10:22:00Z', 'Sofia Ortiz', 10_171_187 /* 9.7 MB */, {star: true}],
  ['f-palette', 'brand-palette-explorations.png', 'image', 'design', 'Jonah Fields', ['Sofia Ortiz'], false,
    '2026-07-01T16:48:00Z', '2026-07-01T17:03:00Z', 'Jonah Fields', 8_493_465 /* 8.1 MB */],
  // ---- Kestrel All-Hands (shared drive) ----
  ['f-allhands', 'Kestrel all-hands — July 2026', 'deck', 'allhands', 'Priya Raman',
    ['Dana Whitfield', 'Marcus Webb', 'Sofia Ortiz', 'Jonah Fields', 'Elena Voss', 'Tom Okonkwo'], true,
    '2026-07-01T14:00:00Z', '2026-07-02T09:00:00Z', 'Priya Raman', 5_452_595 /* 5.2 MB */],
  ['f-orgchart', 'Org chart — 2026-07.pdf', 'pdf', 'allhands', 'Priya Raman',
    ['Dana Whitfield', 'Marcus Webb'], true,
    '2026-07-01T13:10:00Z', '2026-07-01T13:10:00Z', 'Priya Raman', 225_280 /* 220 KB */],
  // ---- Trash (rows retain the originating drive for restore) ----
  ['f-retro', 'Atlas Q2 retro — duplicate', 'doc', 'atlas', 'Marcus Webb', ['Priya Raman'], false,
    '2026-07-01T09:10:00Z', '2026-07-01T09:28:00Z', 'Marcus Webb', 122_880 /* 120 KB */,
    {trash: '2026-07-01T09:31:00Z'}],
  ['f-hero-v1', 'atlas-hero-render-v1.png', 'image', 'atlas', 'Jonah Fields', ['Sofia Ortiz'], false,
    '2026-07-01T18:02:00Z', '2026-07-01T18:02:00Z', 'Jonah Fields', 14_784_921 /* 14.1 MB */,
    {trash: '2026-07-02T08:12:00Z'}],
];

const INITIAL_FILES: FileRow[] = FILE_SPECS.map(
  ([id, name, kind, drive, owner, sharedWith, hasOrgLink, createdAt, modifiedAt, modifiedBy, sizeBytes, flags]) => ({
    id,
    name,
    kind,
    drive,
    owner,
    sharedWith,
    hasOrgLink,
    createdAt,
    modifiedAt,
    modifiedBy,
    sizeBytes,
    itemCount: flags?.items,
    isStarred: flags?.star ?? false,
    isTrashed: flags?.trash !== undefined,
    trashedAt: flags?.trash,
    uploadPct: flags?.uploadPct,
  }),
);

// ---------------------------------------------------------------------------
// ACTIVITY FEED — fixed events per file. Timestamps agree with each row's
// createdAt/modifiedAt; files without an entry fall back to a synthesized
// "created" event so the Activity tab is never empty.
// ---------------------------------------------------------------------------

type ActivityAction =
  | 'edited'
  | 'commented'
  | 'shared'
  | 'uploaded'
  | 'created'
  | 'moved';

interface ActivityEvent {
  id: string;
  actor: string;
  action: ActivityAction;
  at: string;
  detail?: string;
}

const ACTIVITY_ICON: Record<ActivityAction, typeof PencilIcon> = {
  edited: PencilIcon,
  commented: MessageSquareTextIcon,
  shared: UserPlusIcon,
  uploaded: UploadIcon,
  created: FilePlus2Icon,
  moved: FolderInputIcon,
};

const ACTIVITY_VERB: Record<ActivityAction, string> = {
  edited: 'edited',
  commented: 'commented on',
  shared: 'shared',
  uploaded: 'uploaded',
  created: 'created',
  moved: 'moved',
};

const ACTIVITY: Record<string, ActivityEvent[]> = {
  'f-launch-plan': [
    {id: 'a1', actor: 'Marcus Webb', action: 'edited', at: '2026-07-03T08:41:00Z', detail: 'Updated the budget section to match the working sheet'},
    {id: 'a2', actor: 'Elena Voss', action: 'commented', at: '2026-07-02T18:22:00Z', detail: '“Research risks section reads well — one open question on recruiting.”'},
    {id: 'a3', actor: 'Priya Raman', action: 'shared', at: '2026-07-01T09:05:00Z', detail: 'Shared with the Atlas Q3 Launch drive (8 members)'},
    {id: 'a4', actor: 'Priya Raman', action: 'created', at: '2026-07-01T09:00:00Z'},
  ],
  'f-budget': [
    {id: 'a1', actor: 'Marcus Webb', action: 'edited', at: '2026-07-02T17:45:00Z', detail: 'Reconciled the vendor line against the signed Halcyon contract'},
    {id: 'a2', actor: 'Priya Raman', action: 'commented', at: '2026-07-02T12:10:00Z', detail: '“Vendor line matches the signed Halcyon contract — approving.”'},
    {id: 'a3', actor: 'Marcus Webb', action: 'created', at: '2026-07-01T10:15:00Z'},
  ],
  'f-kickoff': [
    {id: 'a1', actor: 'Sofia Ortiz', action: 'edited', at: '2026-07-01T15:30:00Z', detail: 'Final pass before the kickoff meeting'},
    {id: 'a2', actor: 'Sofia Ortiz', action: 'shared', at: '2026-07-01T08:25:00Z', detail: 'Shared ahead of the Atlas Q3 kickoff on the team calendar'},
  ],
  'f-teaser': [
    {id: 'a1', actor: 'Jonah Fields', action: 'uploaded', at: '2026-07-02T21:14:00Z', detail: 'Cut B — 412 MB, replaces cut A'},
    {id: 'a2', actor: 'Sofia Ortiz', action: 'commented', at: '2026-07-02T21:40:00Z', detail: '“Color grade is much closer. Ship this cut to the review.”'},
  ],
  'f-okr': [
    {id: 'a1', actor: 'Priya Raman', action: 'edited', at: '2026-07-03T07:58:00Z', detail: 'Checked in Q3 baseline numbers'},
    {id: 'a2', actor: 'Dana Whitfield', action: 'created', at: '2026-07-01T09:30:00Z'},
  ],
  'f-contract': [
    {id: 'a1', actor: 'Dana Whitfield', action: 'uploaded', at: '2026-07-02T11:02:00Z', detail: 'Countersigned copy from Halcyon Print Co'},
    {id: 'a2', actor: 'Dana Whitfield', action: 'shared', at: '2026-07-02T11:05:00Z', detail: 'Shared with Marcus Webb and Priya Raman'},
  ],
  'f-usability': [
    {id: 'a1', actor: 'Elena Voss', action: 'edited', at: '2026-07-02T14:05:00Z', detail: 'Added findings from the third onboarding session'},
    {id: 'a2', actor: 'Dana Whitfield', action: 'created', at: '2026-07-02T13:30:00Z'},
  ],
  'f-audit': [
    {id: 'a1', actor: 'Sofia Ortiz', action: 'edited', at: '2026-07-02T10:22:00Z', detail: 'Marked 14 of 62 components as needing dark-mode fixes'},
    {id: 'a2', actor: 'Sofia Ortiz', action: 'created', at: '2026-07-01T11:00:00Z'},
  ],
  'f-presskit': [
    {id: 'a1', actor: 'Dana Whitfield', action: 'uploaded', at: '2026-07-03T09:02:00Z', detail: 'Upload in progress — 64% of 96 MB'},
  ],
};

function activityFor(file: FileRow): ActivityEvent[] {
  return (
    ACTIVITY[file.id] ?? [
      {id: 'a0', actor: file.owner, action: 'created', at: file.createdAt},
    ]
  );
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function formatBytes(bytes: number | null): string {
  if (bytes === null) {
    return '—';
  }
  if (bytes >= 1_073_741_824) {
    return \`\${(bytes / 1_073_741_824).toFixed(1)} GB\`;
  }
  if (bytes >= 1_048_576) {
    return \`\${(bytes / 1_048_576).toFixed(1)} MB\`;
  }
  return \`\${Math.round(bytes / 1024)} KB\`;
}

function firstName(person: string): string {
  return person.split(' ')[0];
}

function displayOwner(person: string): string {
  return person === CURRENT_USER ? 'me' : person;
}

/** Deterministic share roles: the first two collaborators can edit. */
function shareRole(index: number): string {
  return index < 2 ? 'Can edit' : 'Can view';
}

function scopeLabel(scope: Scope): string {
  if (scope === 'starred') {
    return 'Starred';
  }
  if (scope === 'trash') {
    return 'Trash';
  }
  return DRIVES[scope].label;
}

// ---------------------------------------------------------------------------
// RAIL — scope tree (My Drive / Shared drives / Starred / Trash) with
// per-drive membership chips, plus the pinned storage quota strip.
// ---------------------------------------------------------------------------

function MemberChip({count}: {count: number}) {
  return (
    <span style={styles.memberChip}>
      <Icon icon={UsersIcon} size="xsm" color="inherit" />
      {count}
    </span>
  );
}

function CountChip({count}: {count: number}) {
  return <span style={styles.memberChip}>{count}</span>;
}

function DriveRail({
  scope,
  onScopeChange,
  starredCount,
  trashCount,
}: {
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  starredCount: number;
  trashCount: number;
}) {
  const items: TreeListItemData[] = [
    {
      id: 'my',
      label: 'My Drive',
      startContent: <Icon icon={HardDriveIcon} size="sm" color="secondary" />,
      isSelected: scope === 'my',
      onClick: () => onScopeChange('my'),
    },
    {
      id: 'shared-drives',
      label: 'Shared drives',
      startContent: <Icon icon={Building2Icon} size="sm" color="secondary" />,
      isExpanded: true,
      children: SHARED_DRIVE_IDS.map(driveId => {
        const drive = DRIVES[driveId];
        return {
          id: driveId,
          label: drive.label,
          startContent: (
            <span
              style={{...styles.driveDot, backgroundColor: drive.dotColor}}
            />
          ),
          endContent: <MemberChip count={drive.members ?? 0} />,
          isSelected: scope === driveId,
          onClick: () => onScopeChange(driveId),
        };
      }),
    },
    {
      id: 'starred',
      label: 'Starred',
      startContent: <Icon icon={StarIcon} size="sm" color="secondary" />,
      endContent: <CountChip count={starredCount} />,
      isSelected: scope === 'starred',
      onClick: () => onScopeChange('starred'),
    },
    {
      id: 'trash',
      label: 'Trash',
      startContent: <Icon icon={Trash2Icon} size="sm" color="secondary" />,
      endContent: <CountChip count={trashCount} />,
      isSelected: scope === 'trash',
      onClick: () => onScopeChange('trash'),
    },
  ];

  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <TreeList
          density="compact"
          items={items}
          header={
            <Text type="label" size="sm" color="secondary">
              Kestrel Labs
            </Text>
          }
        />
      </div>
      <Divider />
      {/* Storage quota strip — pinned below the tree. Subtotals reconcile:
          shared 32.3 + My Drive 6.3 = 38.6 used. */}
      <VStack gap={2} style={styles.quotaStrip}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" size="sm">
              Storage
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {QUOTA.usedGb} of {QUOTA.totalGb} GB
          </Text>
        </HStack>
        {/* Design-system ProgressBar enforces minWidth 48; the strip is
            wide enough, but pin minWidth 0 so the rail can never blow out. */}
        <ProgressBar
          label="Workspace storage used"
          isLabelHidden
          value={QUOTA.usedGb}
          max={QUOTA.totalGb}
          variant="neutral"
          style={{minWidth: 0}}
        />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Shared drives {QUOTA.sharedGb} GB · My Drive {QUOTA.myGb} GB
        </Text>
        <Button label="Manage storage" variant="ghost" size="sm" />
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FILE TABLE — cells and columns. Fixed-width columns use pixel() so the
// header carries both width and minWidth (Table cells have max-width: 0).
// ---------------------------------------------------------------------------

function NameCell({file}: {file: FileRow}) {
  const meta = KIND_META[file.kind];
  return (
    <HStack gap={2} vAlign="center">
      <span style={{...styles.kindGlyph, color: meta.color}}>
        <Icon icon={meta.icon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {file.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {file.kind === 'folder'
              ? \`Folder · \${file.itemCount ?? 0} items\`
              : meta.label}
          </Text>
        </VStack>
      </StackItem>
      {file.isStarred ? (
        <span style={styles.starGlyph} aria-label="Starred">
          <Icon icon={StarIcon} size="sm" color="inherit" />
        </span>
      ) : null}
    </HStack>
  );
}

function SharedCell({file}: {file: FileRow}) {
  if (file.sharedWith.length === 0) {
    return (
      <HStack gap={1} vAlign="center">
        <Icon icon={LockIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary">
          Only you
        </Text>
      </HStack>
    );
  }
  const visible = file.sharedWith.slice(0, 3);
  const overflow = file.sharedWith.length - visible.length;
  return (
    <AvatarGroup size="xsmall" aria-label={\`Shared with \${file.sharedWith.length} people\`}>
      {visible.map(person => (
        <Avatar key={person} name={person} />
      ))}
      {overflow > 0 ? <AvatarGroupOverflow count={overflow} /> : null}
    </AvatarGroup>
  );
}

function SizeCell({file}: {file: FileRow}) {
  if (file.uploadPct !== undefined) {
    return (
      <HStack gap={2} vAlign="center" hAlign="end">
        {/* Footgun: ProgressBar enforces minWidth 48 — override for the
            compact per-row upload meter. */}
        <ProgressBar
          label={\`Uploading \${file.name}\`}
          isLabelHidden
          value={file.uploadPct}
          variant="neutral"
          style={styles.uploadBar}
        />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {file.uploadPct}%
        </Text>
      </HStack>
    );
  }
  return (
    <Text type="body" color="secondary" hasTabularNumbers style={styles.numericCell}>
      {formatBytes(file.sizeBytes)}
    </Text>
  );
}

function buildColumns(isCompact: boolean): TableColumn<FileRow>[] {
  const columns: TableColumn<FileRow>[] = [
    {
      key: 'name',
      header: 'Name',
      // 3:2 with Owner, floors at the exact ratio (240/160): Table scales
      // the proportional pool to max(min/weight), so mismatched floors
      // would inflate Name and push Owner past the demo's visible pane.
      width: proportional(3, {minWidth: 240}),
      sortable: true,
      renderCell: (file: FileRow) => <NameCell file={file} />,
    },
    {
      key: 'owner',
      header: 'Owner',
      // 160px floor: avatar + gap + the longest roster name ("Marcus Webb")
      // render without ellipsis at the demo's content-pane width.
      width: proportional(2, {minWidth: 160}),
      sortable: true,
      renderCell: (file: FileRow) => (
        <HStack gap={2} vAlign="center">
          <Avatar name={file.owner} size="xsmall" />
          <Text type="body" maxLines={1}>
            {displayOwner(file.owner)}
          </Text>
        </HStack>
      ),
    },
  ];
  if (!isCompact) {
    columns.push({
      key: 'shared',
      header: 'Shared with',
      width: pixel(140),
      renderCell: (file: FileRow) => <SharedCell file={file} />,
    });
  }
  columns.push({
    key: 'modified',
    header: 'Last modified',
    width: pixel(160),
    sortable: {sortKey: 'modifiedAt'},
    renderCell: (file: FileRow) =>
      file.uploadPct !== undefined ? (
        <Text type="supporting" color="secondary">
          Uploading…
        </Text>
      ) : (
        <VStack gap={0}>
          <Timestamp value={file.modifiedAt} format="relative" />
          <Text type="supporting" color="secondary" maxLines={1}>
            by {firstName(file.modifiedBy)}
          </Text>
        </VStack>
      ),
  });
  if (!isCompact) {
    columns.push({
      key: 'size',
      header: 'Size',
      align: 'end',
      width: pixel(120),
      sortable: {sortKey: 'sizeBytes'},
      renderCell: (file: FileRow) => <SizeCell file={file} />,
    });
  }
  return columns;
}

// ---------------------------------------------------------------------------
// DETAILS PANEL — active-file inspector with a Details/Activity toggle.
// With 2+ rows checked it swaps to a selection summary.
// ---------------------------------------------------------------------------

function PersonRow({person, access}: {person: string; access: string}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.shareRow}>
      <Avatar name={person} size="small" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="body" maxLines={1}>
            {person}
            {person === CURRENT_USER ? ' (you)' : ''}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {PEOPLE[person]?.role ?? 'Kestrel Labs'}
          </Text>
        </VStack>
      </StackItem>
      <Text type="supporting" color="secondary">
        {access}
      </Text>
    </HStack>
  );
}

function SharingSummary({file}: {file: FileRow}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label">Who has access</Text>
        </StackItem>
        {/* Icon-only copy-link keeps the heading on one line in the
            320px panel; a labelled button forces "Who has access" to wrap. */}
        <IconButton
          label="Copy link"
          tooltip="Copy link"
          variant="ghost"
          size="sm"
          icon={<Icon icon={LinkIcon} size="sm" />}
        />
        <Button label="Share" variant="secondary" size="sm" />
      </HStack>
      <PersonRow person={file.owner} access="Owner" />
      {file.sharedWith.map((person, index) => (
        <PersonRow key={person} person={person} access={shareRole(index)} />
      ))}
      {file.hasOrgLink ? (
        <HStack gap={2} vAlign="center">
          <span style={styles.accessGlyph}>
            <Icon icon={GlobeIcon} size="sm" color="secondary" />
          </span>
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Anyone at Kestrel Labs with the link
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary">
            Can view
          </Text>
        </HStack>
      ) : (
        <HStack gap={2} vAlign="center">
          <span style={styles.accessGlyph}>
            <Icon icon={LockIcon} size="sm" color="secondary" />
          </span>
          <Text type="supporting" color="secondary">
            Restricted — only people with access can open
          </Text>
        </HStack>
      )}
    </VStack>
  );
}

function FileMetadata({file}: {file: FileRow}) {
  const drive = DRIVES[file.drive];
  return (
    <MetadataList columns={1} label={{position: 'start', width: 96}}>
      <MetadataListItem label="Location">
        <HStack gap={1} vAlign="center">
          <Icon
            icon={file.drive === 'my' ? HardDriveIcon : Building2Icon}
            size="xsm"
            color="secondary"
          />
          <Text type="body">{drive.label}</Text>
        </HStack>
      </MetadataListItem>
      <MetadataListItem label="Owner">
        <Text type="body">{displayOwner(file.owner)}</Text>
      </MetadataListItem>
      <MetadataListItem label="Modified">
        <Text type="body">
          <Timestamp value={file.modifiedAt} format="date_time" /> ·{' '}
          {firstName(file.modifiedBy)}
        </Text>
      </MetadataListItem>
      <MetadataListItem label="Created">
        <Timestamp value={file.createdAt} format="date_time" />
      </MetadataListItem>
      <MetadataListItem label="Size">
        <Text type="body" hasTabularNumbers>
          {file.kind === 'folder'
            ? \`\${file.itemCount ?? 0} items\`
            : formatBytes(file.sizeBytes)}
        </Text>
      </MetadataListItem>
      <MetadataListItem label="Storage">
        <Text type="body" hasTabularNumbers>
          Counts toward {drive.label} · {drive.usedGb} GB used
        </Text>
      </MetadataListItem>
    </MetadataList>
  );
}

function ActivityFeed({file}: {file: FileRow}) {
  const events = activityFor(file);
  return (
    <List density="compact">
      {events.map(event => (
        <ListItem
          key={\`\${file.id}-\${event.id}\`}
          label={\`\${event.actor} \${ACTIVITY_VERB[event.action]} \${
            event.action === 'commented' || event.action === 'edited'
              ? 'this file'
              : file.kind === 'folder'
                ? 'this folder'
                : 'this file'
          }\`}
          description={
            <VStack gap={0}>
              {event.detail ? (
                <Text type="supporting" color="secondary">
                  {event.detail}
                </Text>
              ) : null}
              <Timestamp
                value={event.at}
                format="date_time"
                color="secondary"
              />
            </VStack>
          }
          startContent={
            <Icon
              icon={ACTIVITY_ICON[event.action]}
              size="sm"
              color="secondary"
            />
          }
        />
      ))}
    </List>
  );
}

function DetailsPanel({
  file,
  selectedFiles,
  onRestore,
}: {
  file: FileRow | null;
  selectedFiles: FileRow[];
  onRestore: (ids: string[]) => void;
}) {
  const [tab, setTab] = useState('details');

  // 2+ checked rows: the panel becomes a selection summary so bulk totals
  // stay visible while the action bar is in use.
  if (selectedFiles.length > 1) {
    const totalBytes = selectedFiles.reduce(
      (sum, row) => sum + (row.sizeBytes ?? 0),
      0,
    );
    return (
      <div style={styles.detailScroll}>
        <VStack gap={3}>
          <div style={styles.previewTile}>
            <VStack gap={1} hAlign="center">
              <Heading level={3}>{selectedFiles.length} selected</Heading>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {formatBytes(totalBytes)} total
              </Text>
            </VStack>
          </div>
          <List density="compact" hasDividers>
            {selectedFiles.map(row => (
              <ListItem
                key={row.id}
                label={row.name}
                description={formatBytes(row.sizeBytes)}
                startContent={
                  <span
                    style={{
                      ...styles.kindGlyph,
                      color: KIND_META[row.kind].color,
                    }}>
                    <Icon icon={KIND_META[row.kind].icon} size="sm" color="inherit" />
                  </span>
                }
              />
            ))}
          </List>
          <Text type="supporting" color="secondary">
            Use the action bar above the table to star, move, or trash the
            selection.
          </Text>
        </VStack>
      </div>
    );
  }

  if (file === null) {
    return (
      <div style={styles.detailScroll}>
        <EmptyState
          isCompact
          icon={<Icon icon={FileIcon} size="lg" />}
          title="No file selected"
          description="Select a file in the table to see sharing, storage, and activity."
        />
      </div>
    );
  }

  const meta = KIND_META[file.kind];
  return (
    <div style={styles.detailScroll}>
      <VStack gap={3}>
        <div style={styles.previewTile}>
          <span style={{...styles.kindGlyph, color: meta.color}}>
            <Icon icon={meta.icon} size="lg" color="inherit" />
          </span>
        </div>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" style={{minWidth: 0}}>
              <Heading level={3}>{file.name}</Heading>
            </StackItem>
            {file.isStarred ? (
              <span style={styles.starGlyph} aria-label="Starred">
                <Icon icon={StarIcon} size="sm" color="inherit" />
              </span>
            ) : null}
          </HStack>
          <HStack gap={2} vAlign="center">
            <Token size="sm" color="gray" label={meta.label} />
            {file.uploadPct !== undefined ? (
              <Token size="sm" color="blue" label={\`Uploading \${file.uploadPct}%\`} />
            ) : null}
          </HStack>
        </VStack>

        {file.isTrashed ? (
          <div style={styles.trashNotice}>
            <Icon icon={ClockIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <VStack gap={2}>
                <Text type="supporting" color="secondary">
                  In trash since{' '}
                  <Timestamp value={file.trashedAt ?? file.modifiedAt} format="date" />
                  . Items are deleted forever after 30 days.
                </Text>
                <Button
                  label="Restore"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={RotateCcwIcon} size="sm" />}
                  onClick={() => onRestore([file.id])}
                />
              </VStack>
            </StackItem>
          </div>
        ) : null}

        <SegmentedControl
          label="Details panel view"
          value={tab}
          onChange={setTab}
          size="sm">
          <SegmentedControlItem label="Details" value="details" />
          <SegmentedControlItem label="Activity" value="activity" />
        </SegmentedControl>

        {tab === 'details' ? (
          <VStack gap={3}>
            <SharingSummary file={file} />
            <Divider />
            <FileMetadata file={file} />
          </VStack>
        ) : (
          <ActivityFeed file={file} />
        )}
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const NEW_FILE_MENU: [string, typeof FileTextIcon][] = [
  ['New doc', FileTextIcon],
  ['New sheet', FileSpreadsheetIcon],
  ['New deck', PresentationIcon],
];

const UPLOAD_MENU: [string, typeof FileTextIcon][] = [
  ['Upload files', UploadIcon],
  ['Upload folder', FolderUpIcon],
];

const SCOPE_OPTIONS = [
  {value: 'my', label: 'My Drive'},
  {value: 'atlas', label: 'Atlas Q3 Launch'},
  {value: 'design', label: 'Design Systems'},
  {value: 'allhands', label: 'Kestrel All-Hands'},
  {value: 'starred', label: 'Starred'},
  {value: 'trash', label: 'Trash'},
];

export default function OfficeSharedDriveTemplate() {
  const [files, setFiles] = useState<FileRow[]>(INITIAL_FILES);
  const [scope, setScope] = useState<Scope>('atlas');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>('f-launch-plan');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [newFolderCount, setNewFolderCount] = useState(0);

  // Responsive contract: <=1180px drops the details panel; <=860px drops
  // the rail (scope Selector appears) and the Shared/Size columns.
  const isDetailsHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const changeScope = (nextScope: Scope) => {
    setScope(nextScope);
    setSelectedKeys(new Set());
    setActiveId(null);
  };

  // Scope + search filter, derived during render.
  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return files.filter(row => {
      const inScope =
        scope === 'trash'
          ? row.isTrashed
          : scope === 'starred'
            ? row.isStarred && !row.isTrashed
            : row.drive === scope && !row.isTrashed;
      if (!inScope) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return \`\${row.name} \${row.owner}\`.toLowerCase().includes(needle);
    });
  }, [files, scope, query]);

  // Sort plugin — default newest-modified first; size and modified carry
  // typed comparators (folders sort below the smallest file).
  const {sortedData, sortConfig} = useTableSortableState<FileRow>({
    data: visibleRows,
    defaultSort: [{sortKey: 'modifiedAt', direction: 'descending'}],
    comparators: {
      modifiedAt: (a, b) => a.modifiedAt.localeCompare(b.modifiedAt),
      sizeBytes: (a, b) => (a.sizeBytes ?? -1) - (b.sizeBytes ?? -1),
      name: (a, b) => a.name.localeCompare(b.name),
      owner: (a, b) => a.owner.localeCompare(b.owner),
    },
  });
  const sortPlugin = useTableSortable<FileRow>(sortConfig);

  // Selection plugin — operates on the visible (sorted) rows only, so
  // select-all never reaches into other scopes.
  const {selectionConfig} = useTableSelectionState<FileRow>({
    data: sortedData,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useTableSelection(selectionConfig);

  // Row-click plugin: clicking anywhere on a row makes it the details-panel
  // subject (checkbox clicks bubble here too — same behavior as real drives).
  const activePlugin = useMemo<TablePlugin<FileRow>>(
    () => ({
      transformBodyRow: (props, item) => {
        const prevOnClick = props.htmlProps.onClick;
        const isActive = item.id === activeId;
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            onClick: event => {
              prevOnClick?.(event);
              setActiveId(item.id);
            },
            'aria-selected': isActive || undefined,
            style: {
              ...props.htmlProps.style,
              cursor: 'pointer',
              // Inset outline so the active row never bleeds onto neighbors.
              ...(isActive
                ? {boxShadow: 'inset 2px 0 0 var(--color-accent)'}
                : null),
            },
          },
        };
      },
    }),
    [activeId],
  );

  const columns = useMemo(() => buildColumns(isCompact), [isCompact]);

  const selectedFiles = sortedData.filter(row => selectedKeys.has(row.id));
  const selectedCount = selectedFiles.length;
  const itemWord = selectedCount === 1 ? 'item' : 'items';
  const activeFile = files.find(row => row.id === activeId) ?? null;

  const starredCount = files.filter(
    row => row.isStarred && !row.isTrashed,
  ).length;
  const trashCount = files.filter(row => row.isTrashed).length;

  const clearSelection = () => setSelectedKeys(new Set());

  const starSelected = () => {
    setFiles(prev =>
      prev.map(row =>
        selectedKeys.has(row.id) ? {...row, isStarred: true} : row,
      ),
    );
    setAnnouncement(\`Starred \${selectedCount} \${itemWord}\`);
    clearSelection();
  };

  const trashSelected = () => {
    setFiles(prev =>
      prev.map(row =>
        selectedKeys.has(row.id)
          ? {...row, isTrashed: true, trashedAt: '2026-07-03T09:15:00Z'}
          : row,
      ),
    );
    setAnnouncement(\`Moved \${selectedCount} \${itemWord} to trash\`);
    if (activeId !== null && selectedKeys.has(activeId)) {
      setActiveId(null);
    }
    clearSelection();
  };

  const restoreFiles = (ids: string[]) => {
    const idSet = new Set(ids);
    setFiles(prev =>
      prev.map(row =>
        idSet.has(row.id)
          ? {...row, isTrashed: false, trashedAt: undefined}
          : row,
      ),
    );
    setAnnouncement(
      \`Restored \${ids.length} \${ids.length === 1 ? 'item' : 'items'}\`,
    );
    if (activeId !== null && idSet.has(activeId)) {
      setActiveId(null);
    }
    clearSelection();
  };

  const createFolder = () => {
    const targetDrive: DriveId =
      scope === 'starred' || scope === 'trash' ? 'my' : scope;
    const nextCount = newFolderCount + 1;
    const id = \`f-new-folder-\${nextCount}\`;
    setNewFolderCount(nextCount);
    setFiles(prev => [
      ...prev,
      {
        id,
        name: nextCount === 1 ? 'Untitled folder' : \`Untitled folder \${nextCount}\`,
        kind: 'folder',
        drive: targetDrive,
        owner: CURRENT_USER,
        sharedWith: [],
        hasOrgLink: false,
        createdAt: '2026-07-03T09:20:00Z',
        modifiedAt: '2026-07-03T09:20:00Z',
        modifiedBy: CURRENT_USER,
        sizeBytes: null,
        itemCount: 0,
        isStarred: false,
        isTrashed: false,
      },
    ]);
    setAnnouncement(\`Created a folder in \${DRIVES[targetDrive].label}\`);
    setActiveId(id);
  };

  // ----- header: brand, search, New/upload split button -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={HardDriveIcon} size="md" color="secondary" />
          <Heading level={1}>Drive</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs
          </Text>
        </HStack>
        <StackItem size="fill">
          <TextInput
            label="Search in Drive"
            isLabelHidden
            size="sm"
            width="100%"
            style={{maxWidth: 520}}
            placeholder="Search files and owners…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        {/* New/upload split button: the primary half creates a folder in
            the current drive; the menu half covers new-file and upload. */}
        <ButtonGroup label="New item" size="sm">
          <Button
            label="New"
            variant="primary"
            size="sm"
            icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
            tooltip="New folder"
            onClick={createFolder}
          />
          <DropdownMenu
            button={{
              label: 'New item options',
              variant: 'primary',
              size: 'sm',
              isIconOnly: true,
              icon: <Icon icon={ChevronDownIcon} size="sm" color="inherit" />,
            }}
            hasChevron={false}
            menuWidth={240}
            items={[
              {
                label: 'New folder',
                icon: <Icon icon={FolderPlusIcon} size="sm" color="inherit" />,
                onClick: createFolder,
              },
              ...NEW_FILE_MENU.map(([label, icon]) => ({
                label,
                icon: <Icon icon={icon} size="sm" color="inherit" />,
                onClick: () => {},
              })),
              {type: 'divider' as const},
              ...UPLOAD_MENU.map(([label, icon]) => ({
                label,
                icon: <Icon icon={icon} size="sm" color="inherit" />,
                onClick: () => {},
              })),
            ]}
          />
        </ButtonGroup>
        {!isDetailsHidden && (
          <IconButton
            label={isDetailsOpen ? 'Hide details panel' : 'Show details panel'}
            tooltip={isDetailsOpen ? 'Hide details' : 'Show details'}
            size="sm"
            variant={isDetailsOpen ? 'secondary' : 'ghost'}
            icon={<Icon icon={PanelRightIcon} size="sm" />}
            onClick={() => setIsDetailsOpen(open => !open)}
          />
        )}
      </HStack>
    </LayoutHeader>
  );

  // ----- content toolbar: location breadcrumb (or scope Selector) -----
  const scopeDrive = scope in DRIVES ? DRIVES[scope as DriveId] : null;
  const contentToolbar = (
    <HStack gap={3} vAlign="center" style={styles.contentToolbar} wrap="wrap">
      {isCompact ? (
        <Selector
          label="Drive scope"
          isLabelHidden
          options={SCOPE_OPTIONS}
          value={scope}
          onChange={value => changeScope(value as Scope)}
          size="sm"
          width={200}
        />
      ) : (
        <Breadcrumbs variant="supporting" label="Drive location">
          {scope !== 'my' && scope !== 'starred' && scope !== 'trash' ? (
            <BreadcrumbItem onClick={() => {}}>Shared drives</BreadcrumbItem>
          ) : null}
          <BreadcrumbItem isCurrent>{scopeLabel(scope)}</BreadcrumbItem>
        </Breadcrumbs>
      )}
      <StackItem size="fill" />
      {scopeDrive?.members !== undefined && (
        <HStack gap={2} vAlign="center">
          <AvatarGroup
            size="xsmall"
            aria-label={\`\${scopeDrive.label} members\`}>
            <Avatar name="Priya Raman" />
            <Avatar name="Sofia Ortiz" />
            <Avatar name="Marcus Webb" />
            <AvatarGroupOverflow count={scopeDrive.members - 3} />
          </AvatarGroup>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {scopeDrive.members} members
          </Text>
        </HStack>
      )}
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {sortedData.length} {sortedData.length === 1 ? 'item' : 'items'}
      </Text>
    </HStack>
  );

  // ----- bulk action bar: appears while any row is checked -----
  const bulkBar =
    selectedCount === 0 ? null : (
      <div style={styles.bulkBar}>
        <Toolbar
          label="Bulk file actions"
          size="sm"
          gap={2}
          variant="section"
          dividers={['bottom', 'top']}
          startContent={
            <HStack gap={2} vAlign="center">
              <Text type="label">
                {selectedCount} {itemWord} selected
              </Text>
              <Button
                label="Clear"
                variant="ghost"
                size="sm"
                icon={<Icon icon={XIcon} size="sm" />}
                isIconOnly={isCompact}
                tooltip={isCompact ? 'Clear selection' : undefined}
                onClick={clearSelection}
              />
            </HStack>
          }
          endContent={
            <HStack gap={2} vAlign="center">
              {scope === 'trash' ? (
                <Button
                  label="Restore"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={RotateCcwIcon} size="sm" />}
                  onClick={() =>
                    restoreFiles(selectedFiles.map(row => row.id))
                  }
                />
              ) : (
                <>
                  <Button
                    label="Star"
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={StarIcon} size="sm" />}
                    isIconOnly={isCompact}
                    tooltip={isCompact ? 'Star' : undefined}
                    onClick={starSelected}
                  />
                  <DropdownMenu
                    button={{
                      label: 'Move to',
                      variant: 'secondary',
                      size: 'sm',
                      icon: <Icon icon={FolderInputIcon} size="sm" />,
                      isIconOnly: isCompact,
                      tooltip: isCompact ? 'Move to' : undefined,
                    }}
                    hasChevron={!isCompact}
                    menuWidth={220}
                    items={SHARED_DRIVE_IDS.map(driveId => ({
                      label: DRIVES[driveId].label,
                      onClick: () => {},
                    }))}
                  />
                  <Button
                    label="Move to trash"
                    variant="destructive"
                    size="sm"
                    icon={
                      isCompact ? (
                        <Icon icon={Trash2Icon} size="sm" />
                      ) : undefined
                    }
                    isIconOnly={isCompact}
                    tooltip={isCompact ? 'Move to trash' : undefined}
                    onClick={trashSelected}
                  />
                </>
              )}
            </HStack>
          }
        />
      </div>
    );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel width={260} padding={0} hasDivider label="Drive scopes">
              <DriveRail
                scope={scope}
                onScopeChange={changeScope}
                starredCount={starredCount}
                trashCount={trashCount}
              />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              {contentToolbar}
              {bulkBar}
              <div style={styles.tableScroll}>
                <Table<FileRow>
                  data={sortedData}
                  columns={columns}
                  idKey="id"
                  density="balanced"
                  dividers="rows"
                  hasHover
                  plugins={{
                    selection: selectionPlugin,
                    sort: sortPlugin,
                    active: activePlugin,
                  }}
                  emptyState={
                    <div style={styles.tableEmpty}>
                      <EmptyState
                        isCompact
                        icon={
                          <Icon
                            icon={
                              scope === 'trash' ? Trash2Icon : SearchIcon
                            }
                            size="lg"
                          />
                        }
                        title={
                          query.trim().length > 0
                            ? 'No matching files'
                            : scope === 'trash'
                              ? 'Trash is empty'
                              : 'Nothing here yet'
                        }
                        description={
                          query.trim().length > 0
                            ? 'Try a different name or owner.'
                            : scope === 'trash'
                              ? 'Items you trash are kept for 30 days before they are deleted forever.'
                              : 'Use the New button to add folders and files.'
                        }
                      />
                    </div>
                  }
                />
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isDetailsHidden && isDetailsOpen ? (
            <LayoutPanel
              width={320}
              padding={0}
              hasDivider
              label="File details">
              <DetailsPanel
                file={activeFile}
                selectedFiles={selectedFiles}
                onRestore={restoreFiles}
              />
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
`;export{e as default};