// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — a fixed Framehouse workspace
 *   (design files across three projects plus drafts, collaborator roster
 *   with presence assignments, activity events, shared libraries; fixed
 *   "edited ago" strings anchored to a July 2026 session). No clocks, no
 *   randomness (gradient thumbnails key off a charCode-fold name hash),
 *   no network media.
 * @output Design Collaboration Dashboard — the Framehouse workspace home
 *   for the Northbeam Studio team. A project rail with a Projects/Drafts
 *   scope toggle and per-project file counts plus a pinned editor-seats
 *   strip; a content region with a recents thumbnail row and per-project
 *   sections of file cards (deterministic canvas-gradient thumbnail art,
 *   live-collaborator facepiles with colored presence rings, edited-ago
 *   meta, a branching indicator with a review-requested chip on one
 *   file); and a right rail with an activity feed (comments, branch
 *   merges, review requests), a shared-libraries panel with component
 *   counts and an update-available badge.
 * @position Page template; emitted by `astryx template design-collab-dashboard`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (brand mark, global search, online facepile, Share)
 *   | rail 264 (scope SegmentedControl + project TreeList + pinned seats
 *   strip) | content (scope toolbar, recents row, file-card grid sections,
 *   scrolls) | end panel 300 (activity feed + libraries, scrolls).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   design-system Cards. File tiles are custom styled buttons (gradient
 *   thumbnail + meta row) per the streaming-browse-home artwork idiom;
 *   the activity feed and libraries are panel sections, not Cards.
 * Color policy: token-pure everywhere except (a) the ONE Framehouse brand
 *   accent pair `light-dark(#6D28D9, #A78BFA)` — brand mark, selected-card
 *   ring, active-scope emphasis, review/update tints — with text on tints
 *   kept on AA-checked `light-dark()` pairs; (b) the repo-standard
 *   `light-dark()` fallbacks on data-viz categorical tokens used for
 *   presence rings and project dots; (c) thumbnail gradient art, which is
 *   scheme-independent literal paint (labels over it use fixed rgba inks).
 *
 * Responsive contract:
 * - > 1240px: full three-region frame.
 * - <= 1240px: the activity/libraries end panel is dropped (the file grid
 *   stays the source of truth); its header toggle hides with it.
 * - <= 920px: the project rail is dropped; a scope Selector appears in the
 *   content toolbar. The header row wraps instead of clipping search.
 * - The recents row always scrolls horizontally; the card grid reflows
 *   via auto-fill minmax(200px, 1fr); rail, content, and end panel scroll
 *   independently (`minHeight: 0` down every flex chain).
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArrowDownUpIcon,
  BellIcon,
  CheckIcon,
  ClockIcon,
  FrameIcon,
  FolderIcon,
  GitBranchIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  LayersIcon,
  LibraryIcon,
  MessageSquareTextIcon,
  PackageCheckIcon,
  PanelRightIcon,
  PencilLineIcon,
  PlusIcon,
  SearchIcon,
  Share2Icon,
  SparklesIcon,
  UsersIcon,
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
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// BRAND — Framehouse violet. The ONE brand accent pair for this template;
// everything else stays on theme tokens or the categorical fallbacks below.
// ---------------------------------------------------------------------------

const BRAND_ACCENT = 'light-dark(#6D28D9, #A78BFA)';
// Tinted fills only — never text directly on this.
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(109, 40, 217, 0.10), rgba(167, 139, 250, 0.16))';
// AA-checked ink for text sitting on the soft tint / plain surfaces.
const BRAND_INK = 'light-dark(#5B21B6, #C4B5FD)';
// The logo square is pinned paint on both sides; the white glyph clears
// 3:1 (UI) on #6D28D9 and #7C3AED alike.
const BRAND_MARK_BG = 'light-dark(#6D28D9, #7C3AED)';

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard `light-dark()` fallback pair.
const CATEGORICAL = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

// ---------------------------------------------------------------------------
// DATA — Framehouse, a design collaboration platform. Workspace: the
// Northbeam Studio team; signed-in user Maya Lindqvist. Fixed session:
// Friday 3 July 2026, ~09:40 — every "edited ago" string is a fixture.
// Reconciliation: rail file counts match rendered cards per project;
// six people carry presence rings across the grid and the header facepile
// count derives from the same lists (ONLINE_NOW), so "6 online" can never
// drift; the checkout file's 2-branch / review-requested chip matches the
// review-request activity event; the Nova Components update-available
// badge matches Sasha's v4.2 publish event; editor seats 7 of 10 matches
// the 7-person roster.
// ---------------------------------------------------------------------------

const CURRENT_USER = 'Maya Lindqvist';

interface Person {
  role: string;
  /** Presence-ring color when live in a file right now. */
  ringColor: string;
}

const PEOPLE: Record<string, Person> = {
  'Maya Lindqvist': {role: 'Product designer', ringColor: CATEGORICAL.blue},
  'Theo Marchetti': {role: 'Design systems', ringColor: CATEGORICAL.green},
  'Ines Okafor': {role: 'Brand designer', ringColor: CATEGORICAL.orange},
  'Ravi Chandran': {role: 'Product designer', ringColor: CATEGORICAL.teal},
  'Sasha Bergström': {role: 'Design engineer', ringColor: CATEGORICAL.purple},
  'Colin Hale': {role: 'Product manager', ringColor: CATEGORICAL.blue},
  'Yuki Tanabe': {role: 'Illustrator', ringColor: CATEGORICAL.orange},
};

type ProjectId = 'aurora' | 'marketing' | 'nova';
type Scope = 'all' | 'drafts' | ProjectId;

interface Project {
  id: ProjectId;
  name: string;
  dotColor: string;
  description: string;
}

const PROJECTS: Project[] = [
  {
    id: 'aurora',
    name: 'Aurora Mobile App',
    dotColor: CATEGORICAL.blue,
    description: 'iOS + Android product surfaces',
  },
  {
    id: 'marketing',
    name: 'Marketing Site 2026',
    dotColor: CATEGORICAL.orange,
    description: 'northbeam.com refresh',
  },
  {
    id: 'nova',
    name: 'Nova Design System',
    dotColor: CATEGORICAL.purple,
    description: 'Components, tokens, icons',
  },
];

interface BranchInfo {
  count: number;
  reviewRequested: boolean;
  /** The branch awaiting review — referenced by the activity feed. */
  reviewBranch: string;
}

interface DesignFile {
  id: string;
  name: string;
  /** null = personal draft (Drafts scope). */
  project: ProjectId | null;
  editedAgo: string;
  editedBy: string;
  /** People live in the file right now — rendered with presence rings. */
  activeNow: string[];
  pageCount: number;
  branch?: BranchInfo;
}

// Compact fixture rows (tuple pattern, see office-shared-drive.tsx):
// [id, name, project(null = draft), editedAgo, editedBy, activeNow,
//  pageCount, branch?]
type FileSpec = [
  string,
  string,
  ProjectId | null,
  string,
  string,
  string[],
  number,
  BranchInfo?,
];

const FILE_SPECS: FileSpec[] = [
  // ---- Aurora Mobile App ----
  ['file-checkout', 'Checkout flow — v2', 'aurora', 'Edited 4 min ago',
    'Ravi Chandran', ['Ravi Chandran', 'Maya Lindqvist'], 14,
    {count: 2, reviewRequested: true, reviewBranch: 'guest-checkout'}],
  ['file-onboarding', 'Onboarding & sign-up', 'aurora', 'Edited 32 min ago',
    'Maya Lindqvist', ['Colin Hale'], 9],
  ['file-home-feed', 'Home feed explorations', 'aurora', 'Edited 2 hr ago',
    'Maya Lindqvist', [], 21],
  ['file-push', 'Push notification system', 'aurora', 'Edited yesterday',
    'Colin Hale', [], 6],
  // ---- Marketing Site 2026 ----
  ['file-pricing', 'Pricing page', 'marketing', 'Edited 11 min ago',
    'Ines Okafor', ['Ines Okafor'], 5],
  ['file-homepage', 'Homepage hero + narrative', 'marketing',
    'Edited 1 hr ago', 'Ines Okafor', [], 8],
  ['file-brand-illos', 'Launch illustrations', 'marketing', 'Edited Tue',
    'Yuki Tanabe', [], 12],
  // ---- Nova Design System ----
  ['file-nova-components', 'Nova Components', 'nova', 'Edited 18 min ago',
    'Theo Marchetti', ['Theo Marchetti', 'Sasha Bergström'], 42],
  ['file-nova-tokens', 'Tokens & theming', 'nova', 'Edited 3 hr ago',
    'Sasha Bergström', [], 7],
  ['file-nova-patterns', 'Pattern library — forms', 'nova', 'Edited Mon',
    'Theo Marchetti', [], 16],
  // ---- Drafts (Maya's private files) ----
  ['draft-widgets', 'Widget concepts (scratch)', null, 'Edited 55 min ago',
    CURRENT_USER, [], 3],
  ['draft-portfolio', 'Portfolio case study', null, 'Edited Wed',
    CURRENT_USER, [], 5],
  ['draft-moodboard', 'Aurora moodboard', null, 'Edited 28 Jun',
    CURRENT_USER, [], 2],
];

const FILES: DesignFile[] = FILE_SPECS.map(
  ([id, name, project, editedAgo, editedBy, activeNow, pageCount, branch]) =>
    ({id, name, project, editedAgo, editedBy, activeNow, pageCount, branch}),
);

// Recents rail — file ids in most-recently-opened order (Maya's session).
const RECENT_IDS = [
  'file-checkout',
  'file-pricing',
  'file-nova-components',
  'file-onboarding',
  'draft-widgets',
  'file-homepage',
];

// Everyone live in at least one file right now — the single source for the
// header facepile and its "online" count, derived from FILES.activeNow so
// the number can never drift from the presence rings in the grid.
const ONLINE_NOW: string[] = Array.from(
  new Set(FILES.flatMap(file => file.activeNow)),
);

// ---------------------------------------------------------------------------
// ACTIVITY FEED — right rail. Fixed strings; the review-request event
// references file-checkout's `guest-checkout` branch, and the publish
// event matches the Nova Components update-available badge.
// ---------------------------------------------------------------------------

type ActivityKind = 'comment' | 'merge' | 'review' | 'publish' | 'edit';

interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  actor: string;
  when: string;
  title: string;
  detail?: string;
  fileName: string;
}

const ACTIVITY: ActivityEvent[] = [
  {
    id: 'act-review',
    kind: 'review',
    actor: 'Ravi Chandran',
    when: '6 min ago',
    title: 'requested review on branch “guest-checkout”',
    detail: 'Apple Pay sheet + address autofill, 4 changed pages',
    fileName: 'Checkout flow — v2',
  },
  {
    id: 'act-comment-pricing',
    kind: 'comment',
    actor: 'Ines Okafor',
    when: '14 min ago',
    title: 'commented on Pricing page',
    detail: '“Can we try the tighter 4-col grid for the tier cards?”',
    fileName: 'Pricing page',
  },
  {
    id: 'act-publish',
    kind: 'publish',
    actor: 'Sasha Bergström',
    when: '25 min ago',
    title: 'published 12 changes to Nova Components',
    detail: 'v4.2 — Button, Select, and 10 more',
    fileName: 'Nova Components',
  },
  {
    id: 'act-merge',
    kind: 'merge',
    actor: 'Theo Marchetti',
    when: '1 hr ago',
    title: 'merged branch “button-refresh”',
    detail: '2 pages updated, no conflicts',
    fileName: 'Nova Components',
  },
  {
    id: 'act-comment-reply',
    kind: 'comment',
    actor: 'Colin Hale',
    when: '2 hr ago',
    title: 'replied to Maya on Onboarding & sign-up',
    detail: '“Legal signed off on the shorter consent copy.”',
    fileName: 'Onboarding & sign-up',
  },
  {
    id: 'act-edit',
    kind: 'edit',
    actor: 'Yuki Tanabe',
    when: 'Yesterday',
    title: 'added 3 pages to Launch illustrations',
    detail: 'Hero spot, empty states, 404',
    fileName: 'Launch illustrations',
  },
];

const ACTIVITY_ICON: Record<ActivityKind, typeof MessageSquareTextIcon> = {
  comment: MessageSquareTextIcon,
  merge: GitMergeIcon,
  review: GitPullRequestIcon,
  publish: PackageCheckIcon,
  edit: PencilLineIcon,
};

// ---------------------------------------------------------------------------
// SHARED LIBRARIES — right rail panel. The Nova Components update badge
// pairs with Sasha's v4.2 publish event above.
// ---------------------------------------------------------------------------

interface SharedLibrary {
  id: string;
  name: string;
  countLabel: string;
  updatedLabel: string;
  hasUpdate: boolean;
}

const LIBRARIES: SharedLibrary[] = [
  {
    id: 'lib-nova',
    name: 'Nova Components',
    countLabel: '248 components',
    updatedLabel: 'v4.2 · 25 min ago',
    hasUpdate: true,
  },
  {
    id: 'lib-icons',
    name: 'Northbeam Icons',
    countLabel: '512 icons',
    updatedLabel: 'v2.9 · Mon',
    hasUpdate: false,
  },
  {
    id: 'lib-illos',
    name: 'Brand Illustrations',
    countLabel: '64 assets',
    updatedLabel: 'v1.4 · 19 Jun',
    hasUpdate: false,
  },
];

// Sort options for the content toolbar dropdown.
type SortMode = 'recent' | 'alpha';

// ---------------------------------------------------------------------------
// DETERMINISTIC THUMBNAIL ART — a two-color gradient pair picked by a
// charCode-fold hash of the file name (streaming-browse-home idiom), with
// faux canvas frames layered on top. Scheme-independent literal paint; the
// page-count chip over it uses fixed rgba inks, never theme tokens.
// ---------------------------------------------------------------------------

const GRADIENT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['#4C1D95', '#7C3AED'],
  ['#1E3A8A', '#3B82F6'],
  ['#134E4A', '#14B8A6'],
  ['#7C2D12', '#F97316'],
  ['#831843', '#EC4899'],
  ['#14532D', '#22C55E'],
  ['#312E81', '#6366F1'],
  ['#713F12', '#EAB308'],
];

/** Stable name hash (charCode fold) — no Math.random anywhere. */
function gradientFor(name: string): readonly [string, string] {
  let hash = 7;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // Header ----------------------------------------------------------------
  brandMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BRAND_MARK_BG,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  wordmark: {letterSpacing: '-0.02em', whiteSpace: 'nowrap'},
  headerSearch: {flex: '1 1 240px', minWidth: 160, maxWidth: 520},
  onlineDot: {width: 7, height: 7, borderRadius: '50%', backgroundColor: CATEGORICAL.green, flexShrink: 0},
  // Rail --------------------------------------------------------------------
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railScopeToggle: {flexShrink: 0, padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 var(--spacing-2) var(--spacing-2)'},
  railSeats: {flexShrink: 0, padding: 'var(--spacing-3)'},
  projectDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  countChip: {
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    padding: '0 6px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    whiteSpace: 'nowrap',
  },
  // Content -----------------------------------------------------------------
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentToolbar: {flexShrink: 0, padding: 'var(--spacing-3) var(--spacing-5) var(--spacing-2)'},
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-5) var(--spacing-5)',
  },
  recentsRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    overflowX: 'auto',
    paddingBlock: 'var(--spacing-2)',
    // Room so focus rings on the first tile never clip.
    paddingInline: 2,
  },
  recentTile: {
    flexShrink: 0,
    width: 148,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 0,
    border: 'none',
    background: 'transparent',
    textAlign: 'start',
    cursor: 'pointer',
    borderRadius: 'var(--radius-container)',
    font: 'inherit',
    color: 'inherit',
  },
  recentThumb: {
    height: 88,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    position: 'relative',
    overflow: 'hidden',
  },
  sectionHead: {marginTop: 'var(--spacing-5)', marginBottom: 'var(--spacing-3)'},
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 'var(--spacing-4)',
  },
  // File card — a custom styled button, not a design-system Card.
  fileCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    padding: 0,
    textAlign: 'start',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  fileCardSelected: {
    // Inset ring so the selection never bleeds onto grid neighbors.
    boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`,
  },
  thumb: {
    position: 'relative',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  // Faux canvas frames floating over the gradient — fixed rgba paint.
  canvasFrame: {
    position: 'absolute',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    boxShadow: '0 4px 12px rgba(15, 12, 41, 0.28)',
  },
  canvasFrameGhost: {
    position: 'absolute',
    borderRadius: 6,
    border: '1.5px dashed rgba(255, 255, 255, 0.55)',
  },
  pageChip: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    padding: '1px 7px',
    borderRadius: 999,
    backgroundColor: 'rgba(12, 10, 28, 0.62)',
    color: 'rgba(244, 242, 255, 0.95)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  branchChip: {
    position: 'absolute',
    left: 8,
    top: 8,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: 'rgba(12, 10, 28, 0.62)',
    color: 'rgba(244, 242, 255, 0.95)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  cardMeta: {padding: 'var(--spacing-3)', minWidth: 0},
  reviewChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 8px',
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_INK,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  // Presence facepile — colored rings around xsmall avatars.
  presenceRing: {
    display: 'inline-flex',
    borderRadius: '50%',
    padding: 1.5,
    border: '2px solid transparent',
    backgroundColor: 'var(--color-background-card)',
  },
  presenceStack: {display: 'flex', alignItems: 'center'},
  presenceOverlap: {marginInlineStart: -6},
  presenceOverlay: {position: 'absolute', left: 8, bottom: 6},
  // End panel ---------------------------------------------------------------
  endScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  activityRow: {alignItems: 'flex-start'},
  activityGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  activityGlyphBrand: {
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_INK,
    border: 'none',
  },
  libraryTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 10,
    flexShrink: 0,
    color: '#FFFFFF',
  },
  updateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 8px',
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_INK,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  emptyWrap: {padding: 'var(--spacing-6) 0'},
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

// ---------------------------------------------------------------------------
// THUMBNAIL — deterministic gradient art with faux canvas frames. The
// frame geometry is keyed off the same hash so siblings differ but every
// render is identical.
// ---------------------------------------------------------------------------

function CanvasThumb({
  name,
  pageCount,
  branch,
  isCompactTile = false,
}: {
  name: string;
  pageCount: number;
  branch?: BranchInfo;
  isCompactTile?: boolean;
}) {
  const [from, to] = gradientFor(name);
  let hash = 3;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 17 + name.charCodeAt(i)) >>> 0;
  }
  const frameLeft = 10 + (hash % 3) * 4; // 10 | 14 | 18 %
  const frameTop = 16 + (hash % 4) * 5; // 16..31 %
  const ghostLeft = 58 - (hash % 3) * 4;
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: [
          'radial-gradient(90% 70% at 18% 8%, rgba(255, 255, 255, 0.18), transparent 55%)',
          `radial-gradient(120% 90% at 85% 30%, ${to}B8, transparent 62%)`,
          `linear-gradient(150deg, ${from} 0%, ${to} 130%)`,
        ].join(', '),
      }}>
      {/* Two faux canvas frames + one ghost frame stand in for artboards. */}
      <span
        style={{
          ...styles.canvasFrame,
          left: `${frameLeft}%`,
          top: `${frameTop}%`,
          width: '30%',
          height: '46%',
        }}
      />
      <span
        style={{
          ...styles.canvasFrame,
          left: `${frameLeft + 34}%`,
          top: `${frameTop + 12}%`,
          width: '22%',
          height: '34%',
          opacity: 0.85,
        }}
      />
      <span
        style={{
          ...styles.canvasFrameGhost,
          left: `${ghostLeft + 26}%`,
          top: '14%',
          width: '18%',
          height: '28%',
        }}
      />
      {branch ? (
        <span style={styles.branchChip}>
          <Icon icon={GitBranchIcon} size="xsm" color="inherit" />
          {branch.count} branches
        </span>
      ) : null}
      {!isCompactTile && (
        <span style={styles.pageChip}>
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PRESENCE FACEPILE — xsmall avatars wrapped in colored rings; the ring
// color is each person's fixed categorical assignment, matching the
// header facepile and the activity feed.
// ---------------------------------------------------------------------------

function PresenceFacepile({people}: {people: string[]}) {
  if (people.length === 0) {
    return null;
  }
  return (
    <div
      style={styles.presenceStack}
      role="group"
      aria-label={`Live now in this file: ${people.join(', ')}`}>
      {people.map((person, index) => (
        <span
          key={person}
          style={{
            ...styles.presenceRing,
            borderColor: PEOPLE[person].ringColor,
            ...(index > 0 ? styles.presenceOverlap : null),
          }}>
          <Avatar name={person} size="xsmall" />
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FILE CARD — custom styled button tile: gradient thumb, name, edited-ago
// meta, presence facepile, review chip on the branched file, MoreMenu.
// ---------------------------------------------------------------------------

function FileCard({
  file,
  isSelected,
  onSelect,
}: {
  file: DesignFile;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const editorLabel =
    file.project === null
      ? 'Only you'
      : file.editedBy === CURRENT_USER
        ? 'you'
        : file.editedBy.split(' ')[0];
  return (
    <div style={{position: 'relative', minWidth: 0}}>
      <button
        type="button"
        style={{
          ...styles.fileCard,
          width: '100%',
          ...(isSelected ? styles.fileCardSelected : null),
        }}
        aria-pressed={isSelected}
        onClick={() => onSelect(file.id)}>
        <div style={styles.thumb}>
          <CanvasThumb
            name={file.name}
            pageCount={file.pageCount}
            branch={file.branch}
          />
          {/* Presence rings float over the art (bottom-left, opposite the
              page chip) so the meta line never truncates against them. */}
          {file.activeNow.length > 0 && (
            <div style={styles.presenceOverlay}>
              <PresenceFacepile people={file.activeNow} />
            </div>
          )}
        </div>
        <VStack gap={1} style={styles.cardMeta}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text type="label" maxLines={1}>
                {file.name}
              </Text>
            </StackItem>
          </HStack>
          <Text type="supporting" color="secondary" maxLines={1}>
            {file.project === null
              ? `${file.editedAgo} · ${editorLabel}`
              : `${file.editedAgo} by ${editorLabel}`}
          </Text>
          {file.branch?.reviewRequested ? (
            <HStack gap={2} vAlign="center">
              <span style={styles.reviewChip}>
                <Icon icon={GitPullRequestIcon} size="xsm" color="inherit" />
                Review requested
              </span>
            </HStack>
          ) : null}
        </VStack>
      </button>
      {/* The menu sits outside the button so it never nests interactives. */}
      <div style={{position: 'absolute', top: 8, right: 8}}>
        <MoreMenu
          label={`Actions for ${file.name}`}
          size="sm"
          items={[
            {label: 'Open in new tab', onClick: () => {}},
            {label: 'Copy link', onClick: () => {}},
            {label: 'Duplicate', onClick: () => {}},
            ...(file.project !== null
              ? [{label: 'Create branch', onClick: () => {}}]
              : [{label: 'Move to project', onClick: () => {}}]),
          ]}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RECENTS ROW — small horizontal-scrolling tiles; selecting one selects
// the underlying file card too.
// ---------------------------------------------------------------------------

function RecentTile({
  file,
  onSelect,
}: {
  file: DesignFile;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      style={styles.recentTile}
      onClick={() => onSelect(file.id)}>
      <div style={styles.recentThumb}>
        <CanvasThumb
          name={file.name}
          pageCount={file.pageCount}
          branch={file.branch}
          isCompactTile
        />
      </div>
      <Text type="supporting" maxLines={1}>
        {file.name}
      </Text>
    </button>
  );
}

// ---------------------------------------------------------------------------
// END PANEL — activity feed + shared libraries.
// ---------------------------------------------------------------------------

function ActivityRow({event}: {event: ActivityEvent}) {
  const isBrandKind = event.kind === 'review' || event.kind === 'publish';
  return (
    <HStack gap={3} style={styles.activityRow}>
      <span
        style={{
          ...styles.activityGlyph,
          ...(isBrandKind ? styles.activityGlyphBrand : null),
        }}
        aria-hidden>
        <Icon icon={ACTIVITY_ICON[event.kind]} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={1}>
          <Text type="body" size="sm">
            <strong>{event.actor.split(' ')[0]}</strong> {event.title}
          </Text>
          {event.detail !== undefined && (
            <Text type="supporting" color="secondary" maxLines={2}>
              {event.detail}
            </Text>
          )}
          <HStack gap={2} vAlign="center">
            <Avatar name={event.actor} size="xsmall" />
            <Text type="supporting" color="secondary" maxLines={1}>
              {event.fileName} · {event.when}
            </Text>
          </HStack>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function LibraryRow({library}: {library: SharedLibrary}) {
  const [from, to] = gradientFor(library.name);
  return (
    <HStack gap={3} vAlign="center">
      <span
        style={{
          ...styles.libraryTile,
          background: `linear-gradient(140deg, ${from}, ${to})`,
        }}
        aria-hidden>
        <Icon icon={LayersIcon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" size="sm" maxLines={1}>
            {library.name}
          </Text>
          {/* Two short meta lines — one combined line truncates mid-word
              at the 300px panel width. */}
          <Text type="supporting" color="secondary" maxLines={1} hasTabularNumbers>
            {library.countLabel}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1} hasTabularNumbers>
            {library.updatedLabel}
          </Text>
        </VStack>
      </StackItem>
      {library.hasUpdate ? (
        <span style={styles.updateBadge}>
          <Icon icon={SparklesIcon} size="xsm" color="inherit" />
          Update
        </span>
      ) : (
        <Button label="Open" variant="ghost" size="sm" />
      )}
    </HStack>
  );
}

function EndPanel({onlineCount}: {onlineCount: number}) {
  return (
    <div style={styles.endScroll}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3}>
              Activity
            </Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {onlineCount} online
          </Text>
        </HStack>
        <VStack gap={4}>
          {ACTIVITY.map(event => (
            <ActivityRow key={event.id} event={event} />
          ))}
        </VStack>
        <Button label="View all activity" variant="ghost" size="sm" />
        <Divider />
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3}>
              Shared libraries
            </Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {LIBRARIES.length}
          </Text>
        </HStack>
        <VStack gap={3}>
          {LIBRARIES.map(library => (
            <LibraryRow key={library.id} library={library} />
          ))}
        </VStack>
        <Button
          label="Browse library updates"
          variant="secondary"
          size="sm"
          icon={<Icon icon={LibraryIcon} size="sm" color="inherit" />}
        />
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PROJECT RAIL — Projects/Drafts toggle, project tree with counts, pinned
// editor-seats strip. Counts derive from FILES so they can never drift.
// ---------------------------------------------------------------------------

const SEATS = {used: 7, total: 10};

function ProjectRail({
  scope,
  onScopeChange,
  countByProject,
  draftCount,
}: {
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  countByProject: Record<ProjectId, number>;
  draftCount: number;
}) {
  const items: TreeListItemData[] = [
    {
      id: 'all',
      label: 'All projects',
      startContent: <Icon icon={FolderIcon} size="sm" color="secondary" />,
      isSelected: scope === 'all',
      onClick: () => onScopeChange('all'),
      isExpanded: true,
      children: PROJECTS.map(project => ({
        id: project.id,
        label: project.name,
        startContent: (
          <span
            style={{...styles.projectDot, backgroundColor: project.dotColor}}
          />
        ),
        endContent: (
          <span style={styles.countChip}>{countByProject[project.id]}</span>
        ),
        isSelected: scope === project.id,
        onClick: () => onScopeChange(project.id),
      })),
    },
    {
      id: 'drafts',
      label: 'Drafts',
      startContent: <Icon icon={PencilLineIcon} size="sm" color="secondary" />,
      endContent: <span style={styles.countChip}>{draftCount}</span>,
      isSelected: scope === 'drafts',
      onClick: () => onScopeChange('drafts'),
    },
  ];

  return (
    <div style={styles.panelFill}>
      {/* Drafts vs Projects toggle — mirrors the rail tree selection. */}
      <div style={styles.railScopeToggle}>
        <SegmentedControl
          label="Workspace scope"
          value={scope === 'drafts' ? 'drafts' : 'projects'}
          onChange={value =>
            onScopeChange(value === 'drafts' ? 'drafts' : 'all')
          }
          size="sm"
          layout="fill">
          <SegmentedControlItem label="Projects" value="projects" />
          <SegmentedControlItem label="Drafts" value="drafts" />
        </SegmentedControl>
      </div>
      <div style={styles.railScroll}>
        <TreeList
          density="compact"
          items={items}
          header={
            <Text type="label" size="sm" color="secondary">
              Northbeam Studio
            </Text>
          }
        />
      </div>
      <Divider />
      {/* Pinned seats strip — 7 of 10 editor seats in use. */}
      <VStack gap={2} style={styles.railSeats}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" size="sm">
              Editor seats
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {SEATS.used} of {SEATS.total}
          </Text>
        </HStack>
        <ProgressBar
          label="Editor seats in use"
          isLabelHidden
          value={SEATS.used}
          max={SEATS.total}
          variant="neutral"
          style={{minWidth: 0}}
        />
        <Button
          label="Invite teammates"
          variant="ghost"
          size="sm"
          icon={<Icon icon={UsersIcon} size="sm" color="inherit" />}
        />
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN — scope + search + sort state; sections derive during render.
// ---------------------------------------------------------------------------

const SCOPE_OPTIONS = [
  {value: 'all', label: 'All projects'},
  ...PROJECTS.map(project => ({value: project.id, label: project.name})),
  {value: 'drafts', label: 'Drafts'},
];

function scopeTitle(scope: Scope): string {
  if (scope === 'all') {
    return 'All projects';
  }
  if (scope === 'drafts') {
    return 'Drafts';
  }
  return PROJECTS.find(project => project.id === scope)?.name ?? '';
}

interface Section {
  key: string;
  title: string;
  subtitle?: string;
  files: DesignFile[];
}

export default function DesignCollabDashboardTemplate() {
  const [scope, setScope] = useState<Scope>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>('file-checkout');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [isEndOpen, setIsEndOpen] = useState(true);

  // Responsive contract: <=1240px drops the activity/libraries panel;
  // <=920px drops the project rail (a scope Selector appears).
  const isEndHidden = useMediaQuery('(max-width: 1240px)');
  const isCompact = useMediaQuery('(max-width: 920px)');

  const needle = query.trim().toLowerCase();
  const isSearching = needle.length > 0;

  // Rail counts derive from FILES — they can never drift from the grid.
  const countByProject = useMemo(() => {
    const counts: Record<ProjectId, number> = {aurora: 0, marketing: 0, nova: 0};
    for (const file of FILES) {
      if (file.project !== null) {
        counts[file.project] += 1;
      }
    }
    return counts;
  }, []);
  const draftCount = FILES.filter(file => file.project === null).length;

  // Scope + search filter and sort, derived during render. FILES is
  // already in most-recently-edited order within each project, so
  // "recent" keeps fixture order.
  const sections = useMemo<Section[]>(() => {
    const matches = (file: DesignFile) =>
      `${file.name} ${file.editedBy}`.toLowerCase().includes(needle);
    const order = (list: DesignFile[]) =>
      sortMode === 'alpha'
        ? [...list].sort((a, b) => a.name.localeCompare(b.name))
        : list;

    if (isSearching) {
      const scopePool =
        scope === 'drafts'
          ? FILES.filter(file => file.project === null)
          : scope === 'all'
            ? FILES
            : FILES.filter(file => file.project === scope);
      const hits = order(scopePool.filter(matches));
      return [
        {
          key: 'results',
          title: `Results for “${query.trim()}”`,
          subtitle: `${hits.length} ${hits.length === 1 ? 'file' : 'files'} in ${scopeTitle(scope).toLowerCase()}`,
          files: hits,
        },
      ];
    }
    if (scope === 'drafts') {
      return [
        {
          key: 'drafts',
          title: 'Drafts',
          subtitle: 'Only visible to you',
          files: order(FILES.filter(file => file.project === null)),
        },
      ];
    }
    const projectList =
      scope === 'all'
        ? PROJECTS
        : PROJECTS.filter(project => project.id === scope);
    return projectList.map(project => ({
      key: project.id,
      title: project.name,
      subtitle: project.description,
      files: order(FILES.filter(file => file.project === project.id)),
    }));
  }, [isSearching, needle, query, scope, sortMode]);

  const visibleCount = sections.reduce(
    (sum, section) => sum + section.files.length,
    0,
  );
  const recentFiles = RECENT_IDS.map(
    id => FILES.find(file => file.id === id) as DesignFile,
  );
  const showRecents = scope === 'all' && !isSearching;

  const changeScope = (nextScope: Scope) => {
    setScope(nextScope);
    setSelectedId(null);
  };

  // ----- header: brand mark, global search, online facepile, Share -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <span style={styles.brandMark} aria-hidden>
            <Icon icon={FrameIcon} size="sm" color="inherit" />
          </span>
          <Heading level={1} style={styles.wordmark}>
            Framehouse
          </Heading>
          <Text type="supporting" color="secondary">
            Northbeam Studio
          </Text>
        </HStack>
        <StackItem size="fill" style={styles.headerSearch}>
          <TextInput
            label="Search workspace"
            isLabelHidden
            size="sm"
            width="100%"
            placeholder="Search files and people…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        <HStack gap={2} vAlign="center">
          <AvatarGroup
            size="xsmall"
            aria-label={`${ONLINE_NOW.length} teammates online now`}>
            {ONLINE_NOW.slice(0, 4).map(person => (
              <Avatar key={person} name={person} />
            ))}
            {ONLINE_NOW.length > 4 ? (
              <AvatarGroupOverflow count={ONLINE_NOW.length - 4} />
            ) : null}
          </AvatarGroup>
          {/* Dot sits with its label so it never reads as a stray mark. */}
          <HStack gap={1} vAlign="center">
            <span style={styles.onlineDot} aria-hidden />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {ONLINE_NOW.length} online
            </Text>
          </HStack>
        </HStack>
        <IconButton
          label="Notifications"
          tooltip="Notifications"
          size="sm"
          variant="ghost"
          icon={<Icon icon={BellIcon} size="sm" />}
        />
        <Button
          label="Share"
          variant="primary"
          size="sm"
          icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}
        />
        {!isEndHidden && (
          <IconButton
            label={isEndOpen ? 'Hide activity panel' : 'Show activity panel'}
            tooltip={isEndOpen ? 'Hide activity' : 'Show activity'}
            size="sm"
            variant={isEndOpen ? 'secondary' : 'ghost'}
            icon={<Icon icon={PanelRightIcon} size="sm" />}
            onClick={() => setIsEndOpen(open => !open)}
          />
        )}
        <Avatar name={CURRENT_USER} size="small" />
      </HStack>
    </LayoutHeader>
  );

  // ----- content toolbar: scope title (or Selector), count, sort, new -----
  const contentToolbar = (
    <HStack gap={3} vAlign="center" wrap="wrap" style={styles.contentToolbar}>
      {isCompact ? (
        <Selector
          label="Workspace scope"
          isLabelHidden
          options={SCOPE_OPTIONS}
          value={scope}
          onChange={value => changeScope(value as Scope)}
          size="sm"
          width={200}
        />
      ) : (
        <Heading level={2}>{scopeTitle(scope)}</Heading>
      )}
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {visibleCount} {visibleCount === 1 ? 'file' : 'files'}
      </Text>
      <StackItem size="fill" />
      {/* Short trigger labels — the full names live in the menu items;
          longer triggers wrap the toolbar at the 264-rail content width. */}
      <DropdownMenu
        button={{
          label: sortMode === 'recent' ? 'Recent' : 'A–Z',
          variant: 'ghost',
          size: 'sm',
          icon: <Icon icon={ArrowDownUpIcon} size="sm" />,
        }}
        menuWidth={200}
        items={[
          {
            label: 'Last edited',
            icon:
              sortMode === 'recent' ? (
                <Icon icon={CheckIcon} size="sm" color="inherit" />
              ) : undefined,
            onClick: () => setSortMode('recent'),
          },
          {
            label: 'Alphabetical',
            icon:
              sortMode === 'alpha' ? (
                <Icon icon={CheckIcon} size="sm" color="inherit" />
              ) : undefined,
            onClick: () => setSortMode('alpha'),
          },
        ]}
      />
      <Button
        label={scope === 'drafts' ? 'New draft' : 'New file'}
        variant="secondary"
        size="sm"
        icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
      />
    </HStack>
  );

  // ----- content body: recents row + card-grid sections -----
  const body = (
    <div style={styles.contentScroll}>
      {showRecents && (
        <>
          <HStack gap={2} vAlign="center" style={styles.sectionHead}>
            <Icon icon={ClockIcon} size="sm" color="secondary" />
            <Heading level={3}>Recents</Heading>
          </HStack>
          <div
            style={styles.recentsRow}
            role="group"
            aria-label="Recently opened files">
            {recentFiles.map(file => (
              <RecentTile key={file.id} file={file} onSelect={setSelectedId} />
            ))}
          </div>
        </>
      )}
      {sections.map(section => (
        <section key={section.key} aria-label={section.title}>
          <HStack gap={2} vAlign="center" style={styles.sectionHead}>
            <Heading level={3}>{section.title}</Heading>
            {section.subtitle !== undefined && (
              <Text type="supporting" color="secondary">
                {section.subtitle}
              </Text>
            )}
          </HStack>
          {section.files.length === 0 ? (
            <div style={styles.emptyWrap}>
              <EmptyState
                isCompact
                icon={<Icon icon={SearchIcon} size="md" color="secondary" />}
                title="No files match"
                description="Try a different search, or clear it to browse projects."
                actions={
                  <Button
                    label="Clear search"
                    variant="secondary"
                    size="sm"
                    onClick={() => setQuery('')}
                  />
                }
              />
            </div>
          ) : (
            <div style={styles.cardGrid}>
              {section.files.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  isSelected={selectedId === file.id}
                  onSelect={id =>
                    setSelectedId(current => (current === id ? null : id))
                  }
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel
              width={264}
              padding={0}
              hasDivider
              label="Projects and drafts">
              <ProjectRail
                scope={scope}
                onScopeChange={changeScope}
                countByProject={countByProject}
                draftCount={draftCount}
              />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              {contentToolbar}
              <Divider />
              {body}
            </div>
          </LayoutContent>
        }
        end={
          isEndHidden || !isEndOpen ? undefined : (
            <LayoutPanel
              width={300}
              padding={0}
              hasDivider
              label="Activity and libraries">
              <div style={styles.panelFill}>
                <EndPanel onlineCount={ONLINE_NOW.length} />
              </div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
