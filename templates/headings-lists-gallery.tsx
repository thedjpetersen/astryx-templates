// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one project-management domain: the
 *   "Atlas Mobile Relaunch" project — sprints, tasks, members, contacts,
 *   project facts — reused across every demo so the gallery reads as one
 *   product)
 * @output Five-panel gallery of content-structure patterns: page headings
 *   (title+meta+actions, avatar+status, breadcrumb eyebrow+button group,
 *   banner with cover strip), card headings (inline action link,
 *   description+icon menu, attached tab row), section headings (simple
 *   rule, action buttons, inline tabs, filter Selector), description lists
 *   (two-column striped, narrow stacked, dark card, inline-edit rows), and
 *   stacked lists (avatar+chevron rows, status+menu rows, checkbox rows
 *   with a bulk bar, alphabet-grouped contacts) — all indexed by a
 *   scroll-spying rail
 * @position Page template; emitted by `astryx template headings-lists-gallery`
 *
 * Frame: Layout height="auto" owns the page. LayoutHeader carries the
 * gallery title plus, on <=768px viewports, a horizontally scrolling
 * subnav of panel pills; LayoutContent hosts the five panels inside a
 * contentWidth={1040} column and opts out of its own scroll
 * (isScrollable={false}) so the rail's position:sticky tracks the page
 * scroll. On wider viewports the subnav renders as a 200px sticky rail
 * to the left of the panel column instead.
 *
 * Interaction contract (every affordance works — no dead buttons):
 * - Rail/subnav pills scroll their panel into view; an
 *   IntersectionObserver highlights the pill for the panel crossing the
 *   reading band (click-driven highlight is the no-observer fallback).
 * - Page headings: the Watch button toggles Watching and moves the
 *   watcher count; the sprint button group pages Prev/Next through three
 *   sprints and rewrites the breadcrumb + title.
 * - Card headings: the icon MoreMenu pins/unpins the card (Badge appears)
 *   and announces copy/download actions; the attached tab row switches
 *   Overview / Tasks / Files demo content.
 * - Section headings: inline tabs filter the shared sprint-task list by
 *   status; "Add task" appends queued fixture tasks (disables when the
 *   queue empties); the Filter toggle narrows to high-priority tasks; the
 *   role Selector filters the members list.
 * - Description lists: three rows carry inline-edit affordances that flip
 *   the row into a TextInput with Save/Cancel (Enter saves, Escape
 *   cancels); saves land in an aria-live region.
 * - Stacked lists: avatar rows select on tap/Enter and report the opened
 *   contact; each status row's MoreMenu approves, requests changes, or
 *   removes the row (Reset restores); checkbox rows drive a bulk bar with
 *   select-all, Archive (removes), and Clear, plus Restore afterwards.
 *
 * Responsive contract:
 * - >768px: 200px sticky rail on the left; panel column fills the rest
 *   (minWidth 0 so wide rows truncate instead of pushing the rail).
 * - <=768px: the rail moves into LayoutHeader as one horizontally
 *   scrolling pill row (width max-content inside an overflowX scroller);
 *   panels stack full width. The page itself scrolls (height="auto") so
 *   the rail's sticky positioning works against the page scroll.
 * - <=640px: page-heading action clusters and meta rows wrap below the
 *   title instead of squeezing it; description-list grids collapse from
 *   220px-label/value columns to stacked label-over-value; card-heading
 *   rows keep the menu pinned top-right while titles wrap.
 * - Tap targets: subnav pills raise --size-element-sm to 40px; list rows,
 *   checkboxes, and menus are md-sized; nothing is hover-only — MoreMenu
 *   and all toggles open with tap and keyboard alike.
 * - Long titles and descriptions truncate with maxLines inside
 *   minWidth:0 cells; the alphabet list and striped rows wrap values
 *   rather than forcing horizontal scroll.
 *
 * Container policy (pattern-gallery archetype): the page chrome is
 * frame-first; each panel is a titled group of Cards, one Card per
 * pattern variant, with an eyebrow label naming the variant. Demos use
 * rows and Lists inside their Cards — no nested page frames.
 *
 * Fixture policy: fixed data only; no Date.now, no randomness, no network
 * assets. The banner cover strip is a layered CSS gradient.
 *
 * Color policy: everything reads from Astryx tokens except two
 * deliberately scheme-locked surfaces that must render identically in
 * light and dark: (1) the banner cover strip — brand gradient hero art
 * (`bannerCover`) — and (2) the "Dark card" description-list variant
 * (`darkCard`/`darkLabel`/`darkValue`/`darkDivider`), whose entire point
 * is demonstrating a dark panel; its text uses literals (not tokens) so
 * it stays readable on the locked surface. Both styles pin `colorScheme`.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Selector} from '@astryxdesign/core/Selector';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArchiveIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  FileTextIcon,
  ListFilterIcon,
  PlusIcon,
  Share2Icon,
  SquarePenIcon,
  TargetIcon,
  UsersIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Wide layout: sticky rail + fluid panel column.
  bodyRow: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'flex-start',
  },
  rail: {
    position: 'sticky',
    top: 'var(--spacing-2)',
    width: 200,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  // Vertical rail pills fill the rail width with left-aligned labels so
  // the nav reads as a column, not a stack of centered chips.
  railPill: {width: '100%', justifyContent: 'flex-start'},
  panelColumn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-8)',
  },
  // Narrow layout: the rail becomes a horizontal pill scroller in the
  // header; padding keeps the focus ring from clipping.
  subnavScroller: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    padding: '2px 0',
  },
  subnavRow: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    width: 'max-content',
  },
  // Button height derives from --size-element-sm; raising the token gives
  // the pills ~40px tap targets while keeping size="sm" padding.
  subnavTapTarget: {'--size-element-sm': '40px'} as CSSProperties,
  // Variant eyebrow above each demo Card.
  variantEyebrow: {letterSpacing: '0.08em', textTransform: 'uppercase'},
  // Banner page heading — plain bordered shell so the cover strip can run
  // full-bleed above the padded content row.
  bannerShell: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-body)',
  },
  // Scheme-locked: brand gradient hero art — identical in light and dark,
  // so literal colors are intentional (see "Color policy" above).
  bannerCover: {
    height: 88,
    background:
      'linear-gradient(120deg, #1d4ed8 0%, #7c3aed 45%, #db2777 100%)',
    colorScheme: 'dark',
  },
  bannerBody: {
    padding: 'var(--spacing-4)',
    paddingTop: 0,
  },
  bannerAvatarRow: {
    marginTop: -32,
  },
  bannerAvatarRing: {
    display: 'inline-flex',
    borderRadius: '50%',
    padding: 3,
    backgroundColor: 'var(--color-background-body)',
    // Keeps the circle legible where it overlaps the card body (the ring
    // color matches the card surface, so the avatar dissolves without it).
    border: '1px solid var(--color-border)',
  },
  // Description-list grids.
  dlRowWide: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-3)',
    borderRadius: 8,
  },
  dlRowNarrow: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-3) var(--spacing-3)',
    borderRadius: 8,
  },
  dlStripe: {backgroundColor: 'var(--color-background-muted)'},
  // Scheme-locked: the "Dark card" pattern demo stays dark in both color
  // schemes, so the surface and its text keep literal colors — tokens
  // would flip in light mode and break the demo (see "Color policy").
  darkCard: {
    backgroundColor: '#141a24',
    border: '1px solid #2a3342',
    borderRadius: 12,
    padding: 'var(--spacing-5)',
    colorScheme: 'dark',
  },
  darkLabel: {
    color: '#8b95a7',
    fontSize: 12,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  darkValue: {color: '#e6eaf2', fontSize: 14, lineHeight: 1.5},
  darkDivider: {borderTop: '1px solid #2a3342'},
  // Alphabet-group header row.
  alphaHeader: {
    padding: 'var(--spacing-1) var(--spacing-3)',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 6,
  },
  // Bulk bar above the selectable list.
  bulkBar: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 8,
    backgroundColor: 'var(--color-background-muted)',
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
  metaNoWrap: {whiteSpace: 'nowrap'},
};

// ============= DATA =============

// One consistent domain: the Atlas Mobile Relaunch project inside the
// fictional Fieldstone project-management product.
const PROJECT = {
  name: 'Atlas Mobile Relaunch',
  team: 'Mobile Platform',
  due: 'Due Aug 22, 2026',
  members: '8 members',
  milestone: 'Milestone 3 of 5',
  lead: {name: 'Priya Raman', role: 'Project lead · Mobile Platform'},
};

const WATCHER_BASE = 18;

const SPRINTS = ['Sprint 23', 'Sprint 24', 'Sprint 25'] as const;

const PANELS: ReadonlyArray<{id: string; label: string}> = [
  {id: 'page-headings', label: 'Page headings'},
  {id: 'card-headings', label: 'Card headings'},
  {id: 'section-headings', label: 'Section headings'},
  {id: 'description-lists', label: 'Description lists'},
  {id: 'stacked-lists', label: 'Stacked lists'},
];

// Shared sprint-task fixture: section-heading tabs filter by status, the
// Filter toggle narrows by priority, and "Add task" appends from the queue.
interface SprintTask {
  id: string;
  title: string;
  status: 'active' | 'done';
  priority: 'high' | 'normal';
  owner: string;
}

const BASE_TASKS: readonly SprintTask[] = [
  {
    id: 'task-1',
    title: 'Rebuild onboarding carousel with native gestures',
    status: 'active',
    priority: 'high',
    owner: 'Elena Sorokin',
  },
  {
    id: 'task-2',
    title: 'Migrate push-notification opt-in to the new prompt',
    status: 'active',
    priority: 'normal',
    owner: 'Felix Nguyen',
  },
  {
    id: 'task-3',
    title: 'Ship dark-mode audit fixes for settings screens',
    status: 'done',
    priority: 'high',
    owner: 'Amara Diallo',
  },
  {
    id: 'task-4',
    title: 'Instrument cold-start timing on Android',
    status: 'done',
    priority: 'normal',
    owner: 'Carlos Vega',
  },
];

const QUEUED_TASKS: readonly SprintTask[] = [
  {
    id: 'task-5',
    title: 'Draft App Store screenshots for the relaunch listing',
    status: 'active',
    priority: 'normal',
    owner: 'Bianca Reyes',
  },
  {
    id: 'task-6',
    title: 'Cut the beta 4 build and open TestFlight slots',
    status: 'active',
    priority: 'high',
    owner: 'Priya Raman',
  },
  {
    id: 'task-7',
    title: 'Localize the paywall copy for DE and JP',
    status: 'active',
    priority: 'normal',
    owner: 'Tomas Lindqvist',
  },
];

// Members list for the filter-Selector section heading.
const MEMBERS: ReadonlyArray<{
  id: string;
  name: string;
  title: string;
  role: 'design' | 'engineering' | 'qa';
}> = [
  {
    id: 'mem-1',
    name: 'Priya Raman',
    title: 'Project lead',
    role: 'engineering',
  },
  {
    id: 'mem-2',
    name: 'Amara Diallo',
    title: 'Product designer',
    role: 'design',
  },
  {
    id: 'mem-3',
    name: 'Elena Sorokin',
    title: 'iOS engineer',
    role: 'engineering',
  },
  {
    id: 'mem-4',
    name: 'Felix Nguyen',
    title: 'Android engineer',
    role: 'engineering',
  },
  {
    id: 'mem-5',
    name: 'Bianca Reyes',
    title: 'Brand designer',
    role: 'design',
  },
  {id: 'mem-6', name: 'Carlos Vega', title: 'QA engineer', role: 'qa'},
  {
    id: 'mem-7',
    name: 'Dana Whitfield',
    title: 'Accessibility QA',
    role: 'qa',
  },
  {
    id: 'mem-8',
    name: 'Tomas Lindqvist',
    title: 'Design engineer',
    role: 'design',
  },
];

const ROLE_OPTIONS = [
  {value: 'all', label: 'All roles'},
  {value: 'design', label: 'Design'},
  {value: 'engineering', label: 'Engineering'},
  {value: 'qa', label: 'QA'},
];

const ROLE_LABELS: Record<string, string> = {
  design: 'Design',
  engineering: 'Engineering',
  qa: 'QA',
};

// Project facts for the description-list panel.
const PROJECT_FACTS: ReadonlyArray<{label: string; value: string}> = [
  {label: 'Sponsor', value: 'Nadia Osei, VP Product'},
  {label: 'Workstream', value: 'Mobile Platform · Consumer apps'},
  {label: 'Kickoff', value: 'March 3, 2026'},
  {label: 'Target launch', value: 'August 22, 2026'},
  {label: 'Budget', value: '$420,000 approved · $268,300 spent'},
  {label: 'Status cadence', value: 'Weekly digest, Fridays 15:00 PT'},
];

const NARROW_FACTS: ReadonlyArray<{label: string; value: string}> = [
  {label: 'Repository', value: 'fieldstone/atlas-mobile'},
  {label: 'Staging build', value: 'atlas-beta.fieldstone.app'},
  {label: 'Tracking board', value: 'Atlas Relaunch · 5 columns'},
  {label: 'Support channel', value: '#atlas-relaunch'},
];

const DARK_FACTS: ReadonlyArray<{label: string; value: string}> = [
  {label: 'Environment', value: 'Production — locked'},
  {label: 'Release train', value: 'v4.0.0-rc.2 · cut June 27'},
  {label: 'Rollout', value: 'Staged 10% → 50% → 100% over 6 days'},
  {label: 'Kill switch', value: 'atlas_relaunch_enabled (feature flag)'},
];

// Inline-editable description rows (values seed state).
type EditableFactId = 'codename' | 'summary' | 'channel';

const EDITABLE_FACTS: ReadonlyArray<{
  id: EditableFactId;
  label: string;
  description: string;
}> = [
  {
    id: 'codename',
    label: 'Codename',
    description: 'Shown on internal dashboards and build banners.',
  },
  {
    id: 'summary',
    label: 'One-line summary',
    description: 'Appears in the weekly portfolio digest.',
  },
  {
    id: 'channel',
    label: 'Escalation channel',
    description: 'Where launch-week incidents get raised first.',
  },
];

const SAVED_EDITABLE: Record<EditableFactId, string> = {
  codename: 'Atlas',
  summary: 'Rebuild the mobile app shell for speed and retention.',
  channel: '#atlas-launch-room',
};

// Stacked-list fixtures.
const CONTACT_ROWS: ReadonlyArray<{
  id: string;
  name: string;
  title: string;
}> = [
  {id: 'ct-1', name: 'Priya Raman', title: 'Project lead · Mobile Platform'},
  {id: 'ct-2', name: 'Amara Diallo', title: 'Product designer · Core UX'},
  {id: 'ct-3', name: 'Elena Sorokin', title: 'iOS engineer · App shell'},
  {id: 'ct-4', name: 'Carlos Vega', title: 'QA engineer · Release train'},
];

interface ReviewRow {
  id: string;
  title: string;
  owner: string;
  status: 'in-review' | 'approved' | 'changes';
}

const REVIEW_ROWS: readonly ReviewRow[] = [
  {
    id: 'rev-1',
    title: 'Onboarding carousel — final visuals',
    owner: 'Amara Diallo',
    status: 'in-review',
  },
  {
    id: 'rev-2',
    title: 'Paywall copy — pricing experiment B',
    owner: 'Bianca Reyes',
    status: 'in-review',
  },
  {
    id: 'rev-3',
    title: 'Settings dark-mode sweep',
    owner: 'Elena Sorokin',
    status: 'approved',
  },
  {
    id: 'rev-4',
    title: 'Push-permission prompt flow',
    owner: 'Felix Nguyen',
    status: 'in-review',
  },
];

const REVIEW_STATUS_META: Record<
  ReviewRow['status'],
  {label: string; variant: 'info' | 'success' | 'warning'}
> = {
  'in-review': {label: 'In review', variant: 'info'},
  approved: {label: 'Approved', variant: 'success'},
  changes: {label: 'Changes requested', variant: 'warning'},
};

const DELIVERABLES: ReadonlyArray<{
  id: string;
  title: string;
  detail: string;
}> = [
  {
    id: 'del-1',
    title: 'Launch announcement blog post',
    detail: 'Marketing · draft 2 in review',
  },
  {
    id: 'del-2',
    title: 'App Store listing refresh',
    detail: 'Brand · screenshots pending',
  },
  {
    id: 'del-3',
    title: 'Support macros for launch week',
    detail: 'Support · 12 macros drafted',
  },
  {
    id: 'del-4',
    title: 'Press kit and media assets',
    detail: 'Comms · final sign-off Friday',
  },
];

// Alphabet-grouped contact directory (already sorted by name).
const DIRECTORY: ReadonlyArray<{id: string; name: string; title: string}> = [
  {id: 'dir-1', name: 'Amara Diallo', title: 'Product designer'},
  {id: 'dir-2', name: 'Ben Okafor', title: 'Data analyst'},
  {id: 'dir-3', name: 'Bianca Reyes', title: 'Brand designer'},
  {id: 'dir-4', name: 'Carlos Vega', title: 'QA engineer'},
  {id: 'dir-5', name: 'Dana Whitfield', title: 'Accessibility QA'},
  {id: 'dir-6', name: 'Elena Sorokin', title: 'iOS engineer'},
  {id: 'dir-7', name: 'Felix Nguyen', title: 'Android engineer'},
  {id: 'dir-8', name: 'Priya Raman', title: 'Project lead'},
  {id: 'dir-9', name: 'Rosa Jimenez', title: 'Engineering manager'},
  {id: 'dir-10', name: 'Tomas Lindqvist', title: 'Design engineer'},
];

const DIRECTORY_GROUPS: ReadonlyArray<{
  letter: string;
  people: typeof DIRECTORY;
}> = (() => {
  const groups = new Map<string, Array<(typeof DIRECTORY)[number]>>();
  for (const person of DIRECTORY) {
    const letter = person.name.charAt(0).toUpperCase();
    const bucket = groups.get(letter) ?? [];
    bucket.push(person);
    groups.set(letter, bucket);
  }
  return Array.from(groups.entries()).map(([letter, people]) => ({
    letter,
    people,
  }));
})();

// Card-heading tab demo content.
const CARD_TAB_TASKS = [
  {id: 'cardtask-1', label: 'Finalize beta 4 release notes', due: 'Jul 8'},
  {id: 'cardtask-2', label: 'Review crash-free session target', due: 'Jul 10'},
];

const CARD_TAB_FILES = [
  {id: 'file-1', label: 'atlas-relaunch-brief.pdf', meta: '1.2 MB · Jun 12'},
  {id: 'file-2', label: 'sprint-24-demo.mp4', meta: '48 MB · Jun 30'},
  {id: 'file-3', label: 'store-listing-copy.docx', meta: '86 KB · Jul 1'},
];

// ============= HELPERS =============

/** Eyebrow label + demo Card, the repeating unit inside every panel. */
function VariantBlock({
  label,
  children,
  isBare = false,
}: {
  label: string;
  children: ReactNode;
  /** Skip the Card wrapper when the demo brings its own shell. */
  isBare?: boolean;
}) {
  return (
    <VStack gap={2}>
      <span style={styles.variantEyebrow}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
      </span>
      {isBare ? children : <Card>{children}</Card>}
    </VStack>
  );
}

/** Panel shell: anchor target for the rail plus the panel intro. */
function PanelShell({
  id,
  title,
  description,
  registerRef,
  children,
}: {
  id: string;
  title: string;
  description: string;
  registerRef: (id: string) => (node: HTMLElement | null) => void;
  children: ReactNode;
}) {
  return (
    <section data-panel-id={id} ref={registerRef(id)}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>{title}</Heading>
          <Text type="supporting" color="secondary">
            {description}
          </Text>
        </VStack>
        {children}
      </VStack>
    </section>
  );
}

function statusBadge(status: SprintTask['status']) {
  return status === 'done' ? (
    <Badge variant="success" label="Done" />
  ) : (
    // Tinted blue (not solid "info") so Active sits at the same visual
    // weight as the tinted High/Done badges beside it.
    <Badge variant="blue" label="Active" />
  );
}

// ============= PAGE =============

export default function HeadingsListsGalleryTemplate() {
  const isNarrow = useMediaQuery('(max-width: 640px)');
  const isCompactRail = useMediaQuery('(max-width: 768px)');

  // ---- scroll-spy rail ----
  const panelNodes = useRef(new Map<string, HTMLElement>());
  const visiblePanels = useRef(new Set<string>());
  const [activePanel, setActivePanel] = useState<string>('page-headings');

  const registerPanel = (id: string) => (node: HTMLElement | null) => {
    if (node) {
      panelNodes.current.set(id, node);
    } else {
      panelNodes.current.delete(id);
    }
  };

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return; // fall back to click-driven highlighting
    }
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.panelId;
          if (!id) {
            continue;
          }
          if (entry.isIntersecting) {
            visiblePanels.current.add(id);
          } else {
            visiblePanels.current.delete(id);
          }
        }
        // Highest panel (rail order) inside the viewport band wins.
        const next = PANELS.find(panel =>
          visiblePanels.current.has(panel.id),
        );
        if (next) {
          setActivePanel(next.id);
        }
      },
      // Band across the upper-middle of the viewport: a panel becomes
      // "current" as its content crosses reading height.
      {rootMargin: '-15% 0px -60% 0px', threshold: 0},
    );
    for (const node of panelNodes.current.values()) {
      observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  const jumpToPanel = (id: string) => {
    setActivePanel(id);
    panelNodes.current
      .get(id)
      ?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  // ---- aria-live announcements ----
  const [announcement, setAnnouncement] = useState('');

  // ---- panel 1: page headings ----
  const [isWatching, setIsWatching] = useState(false);
  const watcherCount = WATCHER_BASE + (isWatching ? 1 : 0);
  const [sprintIndex, setSprintIndex] = useState(1);
  const sprint = SPRINTS[sprintIndex];

  // ---- panel 2: card headings ----
  const [isVelocityPinned, setIsVelocityPinned] = useState(false);
  const [cardTab, setCardTab] = useState('overview');

  // ---- panel 3: section headings ----
  const [taskTab, setTaskTab] = useState('all');
  const [addedCount, setAddedCount] = useState(0);
  const [isHighPriorityOnly, setIsHighPriorityOnly] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');

  const sprintTasks: SprintTask[] = [
    ...BASE_TASKS,
    ...QUEUED_TASKS.slice(0, addedCount),
  ];
  const backlogTasks = isHighPriorityOnly
    ? sprintTasks.filter(task => task.priority === 'high')
    : sprintTasks;
  const tabbedTasks =
    taskTab === 'all'
      ? sprintTasks
      : sprintTasks.filter(task => task.status === taskTab);
  const filteredMembers =
    roleFilter === 'all'
      ? MEMBERS
      : MEMBERS.filter(member => member.role === roleFilter);

  const addQueuedTask = () => {
    if (addedCount >= QUEUED_TASKS.length) {
      return;
    }
    const nextTask = QUEUED_TASKS[addedCount];
    setAddedCount(prev => prev + 1);
    setAnnouncement(`Added task: ${nextTask.title}`);
  };

  // ---- panel 4: inline-edit description list ----
  const [factValues, setFactValues] =
    useState<Record<EditableFactId, string>>(SAVED_EDITABLE);
  const [factDrafts, setFactDrafts] = useState<
    Partial<Record<EditableFactId, string>>
  >({});

  const startFactEdit = (id: EditableFactId) => {
    setFactDrafts(prev => ({...prev, [id]: factValues[id]}));
  };
  const cancelFactEdit = (id: EditableFactId) => {
    setFactDrafts(prev => {
      const {[id]: _removed, ...rest} = prev;
      return rest;
    });
  };
  const saveFactEdit = (id: EditableFactId) => {
    const draft = factDrafts[id];
    if (draft === undefined || draft.trim() === '') {
      return;
    }
    setFactValues(prev => ({...prev, [id]: draft.trim()}));
    cancelFactEdit(id);
    const fact = EDITABLE_FACTS.find(item => item.id === id);
    setAnnouncement(fact ? `${fact.label} saved.` : 'Field saved.');
  };

  // ---- panel 5: stacked lists ----
  const [openedContactId, setOpenedContactId] = useState<string | null>(
    null,
  );
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>([
    ...REVIEW_ROWS,
  ]);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [archivedIds, setArchivedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const setReviewStatus = (id: string, status: ReviewRow['status']) => {
    setReviewRows(prev =>
      prev.map(row => (row.id === id ? {...row, status} : row)),
    );
    const row = reviewRows.find(item => item.id === id);
    if (row) {
      setAnnouncement(
        `${row.title}: ${REVIEW_STATUS_META[status].label.toLowerCase()}.`,
      );
    }
  };
  const removeReviewRow = (id: string) => {
    const row = reviewRows.find(item => item.id === id);
    setReviewRows(prev => prev.filter(item => item.id !== id));
    if (row) {
      setAnnouncement(`${row.title} removed from the review queue.`);
    }
  };
  const resetReviewQueue = () => {
    setReviewRows([...REVIEW_ROWS]);
    setAnnouncement('Review queue reset.');
  };

  const visibleDeliverables = DELIVERABLES.filter(
    item => !archivedIds.has(item.id),
  );
  const areAllSelected =
    visibleDeliverables.length > 0 &&
    visibleDeliverables.every(item => selectedIds.has(item.id));

  const toggleDeliverable = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };
  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(
      checked ? new Set(visibleDeliverables.map(item => item.id)) : new Set(),
    );
  };
  const archiveSelected = () => {
    const count = selectedIds.size;
    setArchivedIds(prev => new Set([...prev, ...selectedIds]));
    setSelectedIds(new Set());
    setAnnouncement(
      `${count} deliverable${count === 1 ? '' : 's'} archived.`,
    );
  };
  const restoreArchived = () => {
    setArchivedIds(new Set());
    setAnnouncement('Archived deliverables restored.');
  };

  // ---- shared chrome ----
  // Vertical rail pills get full-width, left-aligned labels; the
  // horizontal header subnav keeps content-hugging centered pills.
  const renderRailPills = (isVerticalRail: boolean) =>
    PANELS.map(panel => (
      <Button
        key={panel.id}
        label={panel.label}
        size="sm"
        variant={activePanel === panel.id ? 'secondary' : 'ghost'}
        style={
          isVerticalRail
            ? {...styles.subnavTapTarget, ...styles.railPill}
            : styles.subnavTapTarget
        }
        onClick={() => jumpToPanel(panel.id)}
      />
    ));

  const pageHeadingActions = (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Button
        label="Edit"
        variant="secondary"
        size="sm"
        icon={<Icon icon={SquarePenIcon} size="sm" />}
        onClick={() => setAnnouncement('Edit project opened.')}
      />
      <Button
        label="Share"
        variant="secondary"
        size="sm"
        icon={<Icon icon={Share2Icon} size="sm" />}
        onClick={() => setAnnouncement('Share link copied.')}
      />
      <Button
        label="Publish update"
        variant="primary"
        size="sm"
        onClick={() => setAnnouncement('Status update published.')}
      />
    </HStack>
  );

  const dlRowStyle = (isStriped: boolean): CSSProperties => ({
    ...(isNarrow ? styles.dlRowNarrow : styles.dlRowWide),
    ...(isStriped ? styles.dlStripe : undefined),
  });

  return (
    <Layout
      height="auto"
      contentWidth={1040}
      header={
        <LayoutHeader hasDivider>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <VStack gap={0}>
                  <Heading level={1}>Headings & list patterns</Heading>
                  <Text type="supporting" color="secondary">
                    Page, card, and section headings plus description and
                    stacked lists, staged on one project.
                  </Text>
                </VStack>
              </StackItem>
              {!isNarrow && (
                <Badge variant="neutral" label={`${PANELS.length} panels`} />
              )}
            </HStack>
            {isCompactRail && (
              <nav aria-label="Gallery panels" style={styles.subnavScroller}>
                <div style={styles.subnavRow}>{renderRailPills(false)}</div>
              </nav>
            )}
          </VStack>
        </LayoutHeader>
      }
      content={
        // isScrollable={false}: the page scrolls (height="auto"), so the
        // rail's position:sticky must scope to the page scroller — an
        // overflow:auto LayoutContent would capture it and never scroll.
        <LayoutContent padding={6} isScrollable={false}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div style={styles.bodyRow}>
            {!isCompactRail && (
              <nav aria-label="Gallery panels" style={styles.rail}>
                {renderRailPills(true)}
              </nav>
            )}
            <div style={styles.panelColumn}>
              {/* ================= PANEL 1: PAGE HEADINGS ================= */}
              <PanelShell
                id="page-headings"
                title="Page headings"
                description="Four ways to open a page: plain title with meta and actions, identity-led, breadcrumb-led with a pager group, and a banner with a cover strip."
                registerRef={registerPanel}>
                <VStack gap={5}>
                  <VariantBlock label="Title + meta + action bar">
                    <VStack gap={3}>
                      <HStack gap={3} vAlign="center" wrap="wrap">
                        <StackItem size="fill">
                          <Heading level={3}>{PROJECT.name}</Heading>
                        </StackItem>
                        {pageHeadingActions}
                      </HStack>
                      <HStack gap={4} vAlign="center" wrap="wrap">
                        <span style={styles.metaNoWrap}>
                          <HStack gap={1} vAlign="center">
                            <Icon
                              icon={CalendarIcon}
                              size="sm"
                              color="secondary"
                            />
                            <Text type="supporting" color="secondary">
                              {PROJECT.due}
                            </Text>
                          </HStack>
                        </span>
                        <span style={styles.metaNoWrap}>
                          <HStack gap={1} vAlign="center">
                            <Icon
                              icon={UsersIcon}
                              size="sm"
                              color="secondary"
                            />
                            <Text type="supporting" color="secondary">
                              {PROJECT.members}
                            </Text>
                          </HStack>
                        </span>
                        <span style={styles.metaNoWrap}>
                          <HStack gap={1} vAlign="center">
                            <Icon
                              icon={TargetIcon}
                              size="sm"
                              color="secondary"
                            />
                            <Text type="supporting" color="secondary">
                              {PROJECT.milestone}
                            </Text>
                          </HStack>
                        </span>
                      </HStack>
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="With avatar and status badge">
                    <HStack gap={3} vAlign="center" wrap="wrap">
                      <Avatar name={PROJECT.lead.name} size={48} />
                      <StackItem size="fill">
                        <VStack gap={0}>
                          <HStack gap={2} vAlign="center">
                            <Heading level={3}>{PROJECT.name}</Heading>
                            <Badge variant="green" label="On track" />
                          </HStack>
                          <Text type="supporting" color="secondary">
                            {PROJECT.lead.name} · {PROJECT.lead.role}
                          </Text>
                        </VStack>
                      </StackItem>
                      <HStack gap={2} vAlign="center">
                        <Button
                          label={
                            isWatching
                              ? `Watching · ${watcherCount}`
                              : `Watch · ${watcherCount}`
                          }
                          variant={isWatching ? 'secondary' : 'primary'}
                          size="sm"
                          icon={<Icon icon={EyeIcon} size="sm" />}
                          onClick={() => setIsWatching(prev => !prev)}
                        />
                        <MoreMenu
                          label="Project options"
                          size="sm"
                          items={[
                            {
                              label: 'Copy project link',
                              onClick: () =>
                                setAnnouncement('Project link copied.'),
                            },
                            {
                              label: 'Export summary',
                              onClick: () =>
                                setAnnouncement('Summary export started.'),
                            },
                          ]}
                        />
                      </HStack>
                    </HStack>
                  </VariantBlock>

                  <VariantBlock label="With breadcrumb eyebrow and button group">
                    <VStack gap={2}>
                      <Breadcrumbs label="Project location">
                        <BreadcrumbItem href="#">Projects</BreadcrumbItem>
                        <BreadcrumbItem href="#">
                          {PROJECT.name}
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrent>{sprint}</BreadcrumbItem>
                      </Breadcrumbs>
                      <HStack gap={3} vAlign="center" wrap="wrap">
                        <StackItem size="fill">
                          <Heading level={3}>{sprint} planning</Heading>
                        </StackItem>
                        <HStack gap={1} vAlign="center">
                          <IconButton
                            label="Previous sprint"
                            tooltip="Previous sprint"
                            icon={
                              <Icon
                                icon={ChevronLeftIcon}
                                size="sm"
                                color="inherit"
                              />
                            }
                            variant="secondary"
                            size="sm"
                            isDisabled={sprintIndex === 0}
                            onClick={() =>
                              setSprintIndex(prev => Math.max(0, prev - 1))
                            }
                          />
                          <IconButton
                            label="Next sprint"
                            tooltip="Next sprint"
                            icon={
                              <Icon
                                icon={ChevronRightIcon}
                                size="sm"
                                color="inherit"
                              />
                            }
                            variant="secondary"
                            size="sm"
                            isDisabled={sprintIndex === SPRINTS.length - 1}
                            onClick={() =>
                              setSprintIndex(prev =>
                                Math.min(SPRINTS.length - 1, prev + 1),
                              )
                            }
                          />
                          <Button
                            label="Start sprint"
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              setAnnouncement(`${sprint} started.`)
                            }
                          />
                        </HStack>
                      </HStack>
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="Banner with cover strip" isBare>
                    <div style={styles.bannerShell}>
                      <div style={styles.bannerCover} aria-hidden="true" />
                      <div style={styles.bannerBody}>
                        <VStack gap={2}>
                          <div style={styles.bannerAvatarRow}>
                            <span style={styles.bannerAvatarRing}>
                              <Avatar name={PROJECT.name} size={64} />
                            </span>
                          </div>
                          <HStack gap={3} vAlign="center" wrap="wrap">
                            <StackItem size="fill">
                              <VStack gap={0}>
                                <Heading level={3}>{PROJECT.name}</Heading>
                                <Text type="supporting" color="secondary">
                                  {PROJECT.team} · {PROJECT.due} ·{' '}
                                  {PROJECT.members}
                                </Text>
                              </VStack>
                            </StackItem>
                            {pageHeadingActions}
                          </HStack>
                        </VStack>
                      </div>
                    </div>
                  </VariantBlock>
                </VStack>
              </PanelShell>

              {/* ================= PANEL 2: CARD HEADINGS ================= */}
              <PanelShell
                id="card-headings"
                title="Card headings"
                description="Headers that live inside a Card: an inline action link, a description with an icon menu, and an attached tab row."
                registerRef={registerPanel}>
                <VStack gap={5}>
                  <VariantBlock label="Title with inline action link">
                    <VStack gap={3}>
                      <HStack gap={2} vAlign="center">
                        <StackItem size="fill">
                          <Heading level={3}>Recent activity</Heading>
                        </StackItem>
                        <Button
                          label="View all"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setAnnouncement('Opening the full activity log.')
                          }
                        />
                      </HStack>
                      <List hasDividers density="compact">
                        <ListItem
                          label="Beta 3 build shipped to TestFlight"
                          description="Elena Sorokin · Jun 30"
                        />
                        <ListItem
                          label="Onboarding visuals moved to review"
                          description="Amara Diallo · Jun 29"
                        />
                        <ListItem
                          label="Crash-free sessions hit 99.4%"
                          description="Release health · Jun 28"
                        />
                      </List>
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="With description and icon menu">
                    <VStack gap={3}>
                      <HStack gap={2} vAlign="start">
                        <StackItem size="fill">
                          <VStack gap={1}>
                            <HStack gap={2} vAlign="center">
                              <Heading level={3}>Sprint velocity</Heading>
                              {isVelocityPinned && (
                                <Badge variant="info" label="Pinned" />
                              )}
                            </HStack>
                            <Text type="supporting" color="secondary">
                              Completed points per sprint across the last
                              six sprints, mobile squads only.
                            </Text>
                          </VStack>
                        </StackItem>
                        <MoreMenu
                          label="Velocity card options"
                          size="sm"
                          items={[
                            {
                              label: isVelocityPinned
                                ? 'Unpin from dashboard'
                                : 'Pin to dashboard',
                              onClick: () =>
                                setIsVelocityPinned(prev => !prev),
                            },
                            {
                              label: 'Copy card link',
                              onClick: () =>
                                setAnnouncement('Card link copied.'),
                            },
                            {
                              label: 'Download CSV',
                              onClick: () =>
                                setAnnouncement(
                                  'Velocity CSV download started.',
                                ),
                            },
                          ]}
                        />
                      </HStack>
                      <HStack gap={6} vAlign="center" wrap="wrap">
                        <VStack gap={0}>
                          <Text type="label">42 pts</Text>
                          <Text type="supporting" color="secondary">
                            {sprint} committed
                          </Text>
                        </VStack>
                        <VStack gap={0}>
                          <Text type="label">38 pts</Text>
                          <Text type="supporting" color="secondary">
                            Six-sprint average
                          </Text>
                        </VStack>
                        <Badge variant="success" label="+10% vs average" />
                      </HStack>
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="With attached tab row">
                    <VStack gap={3}>
                      <VStack gap={2}>
                        <Heading level={3}>Milestone 3 — Beta</Heading>
                        <TabList
                          value={cardTab}
                          onChange={setCardTab}
                          hasDivider>
                          <Tab value="overview" label="Overview" />
                          <Tab
                            value="tasks"
                            label="Tasks"
                            endContent={
                              <Badge
                                label={String(CARD_TAB_TASKS.length)}
                              />
                            }
                          />
                          <Tab
                            value="files"
                            label="Files"
                            endContent={
                              <Badge
                                label={String(CARD_TAB_FILES.length)}
                              />
                            }
                          />
                        </TabList>
                      </VStack>
                      {cardTab === 'overview' && (
                        <Text type="body" color="secondary">
                          Beta hardening is the last milestone before the
                          staged rollout: close the remaining launch
                          blockers, hold crash-free sessions above 99.5%,
                          and land store assets by July 15.
                        </Text>
                      )}
                      {cardTab === 'tasks' && (
                        <List hasDividers density="compact">
                          {CARD_TAB_TASKS.map(task => (
                            <ListItem
                              key={task.id}
                              label={task.label}
                              description={`Due ${task.due}`}
                              endContent={
                                <Badge variant="blue" label="Active" />
                              }
                            />
                          ))}
                        </List>
                      )}
                      {cardTab === 'files' && (
                        <List hasDividers density="compact">
                          {CARD_TAB_FILES.map(file => (
                            <ListItem
                              key={file.id}
                              label={file.label}
                              description={file.meta}
                              startContent={
                                <Icon
                                  icon={FileTextIcon}
                                  size="sm"
                                  color="secondary"
                                />
                              }
                            />
                          ))}
                        </List>
                      )}
                    </VStack>
                  </VariantBlock>
                </VStack>
              </PanelShell>

              {/* =============== PANEL 3: SECTION HEADINGS =============== */}
              <PanelShell
                id="section-headings"
                title="Section headings"
                description="In-page dividers between content groups: a plain rule, an action cluster, inline tabs that filter the demo list, and a filter Selector."
                registerRef={registerPanel}>
                <VStack gap={5}>
                  <VariantBlock label="Simple with rule">
                    <VStack gap={3}>
                      <VStack gap={2}>
                        <Heading level={3}>Launch readiness</Heading>
                        <Divider />
                      </VStack>
                      <Text type="body" color="secondary">
                        Every workstream reports green except store assets,
                        which is one review behind. The staged rollout plan
                        was approved at the June 27 go/no-go.
                      </Text>
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="With action buttons">
                    <VStack gap={3}>
                      <HStack gap={2} vAlign="center" wrap="wrap">
                        <StackItem size="fill">
                          <VStack gap={0}>
                            <Heading level={3}>Sprint backlog</Heading>
                            <Text type="supporting" color="secondary">
                              {backlogTasks.length} of {sprintTasks.length}{' '}
                              tasks shown
                            </Text>
                          </VStack>
                        </StackItem>
                        <HStack gap={2} vAlign="center">
                          <Button
                            label={
                              isHighPriorityOnly
                                ? 'High priority only'
                                : 'Filter'
                            }
                            variant={
                              isHighPriorityOnly ? 'primary' : 'secondary'
                            }
                            size="sm"
                            icon={<Icon icon={ListFilterIcon} size="sm" />}
                            onClick={() =>
                              setIsHighPriorityOnly(prev => !prev)
                            }
                          />
                          <Button
                            label="Add task"
                            variant="secondary"
                            size="sm"
                            icon={<Icon icon={PlusIcon} size="sm" />}
                            isDisabled={addedCount >= QUEUED_TASKS.length}
                            onClick={addQueuedTask}
                          />
                        </HStack>
                      </HStack>
                      <List hasDividers density="compact">
                        {backlogTasks.map(task => (
                          <ListItem
                            key={task.id}
                            label={task.title}
                            description={task.owner}
                            endContent={
                              <HStack gap={1} vAlign="center">
                                {task.priority === 'high' && (
                                  <Badge variant="warning" label="High" />
                                )}
                                {statusBadge(task.status)}
                              </HStack>
                            }
                          />
                        ))}
                      </List>
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="With inline tabs">
                    <VStack gap={3}>
                      <HStack gap={3} vAlign="center" wrap="wrap">
                        <StackItem size="fill">
                          <Heading level={3}>Sprint tasks</Heading>
                        </StackItem>
                        <TabList value={taskTab} onChange={setTaskTab}>
                          <Tab value="all" label="All" />
                          <Tab value="active" label="Active" />
                          <Tab value="done" label="Done" />
                        </TabList>
                      </HStack>
                      <List hasDividers density="compact">
                        {tabbedTasks.map(task => (
                          <ListItem
                            key={task.id}
                            label={task.title}
                            description={task.owner}
                            endContent={statusBadge(task.status)}
                          />
                        ))}
                      </List>
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="With filter select">
                    <VStack gap={3}>
                      <HStack gap={3} vAlign="center" wrap="wrap">
                        <StackItem size="fill">
                          <VStack gap={0}>
                            <Heading level={3}>Project members</Heading>
                            <Text type="supporting" color="secondary">
                              {filteredMembers.length} shown
                            </Text>
                          </VStack>
                        </StackItem>
                        <Selector
                          label="Filter members by role"
                          isLabelHidden
                          options={ROLE_OPTIONS}
                          value={roleFilter}
                          onChange={setRoleFilter}
                          width={180}
                        />
                      </HStack>
                      <List hasDividers density="compact">
                        {filteredMembers.map(member => (
                          <ListItem
                            key={member.id}
                            label={member.name}
                            description={member.title}
                            startContent={
                              <Avatar name={member.name} size={32} />
                            }
                            endContent={
                              <Badge
                                variant="neutral"
                                label={ROLE_LABELS[member.role]}
                              />
                            }
                          />
                        ))}
                      </List>
                    </VStack>
                  </VariantBlock>
                </VStack>
              </PanelShell>

              {/* ============== PANEL 4: DESCRIPTION LISTS ============== */}
              <PanelShell
                id="description-lists"
                title="Description lists"
                description="Label/value fact sheets: a striped two-column sheet, a narrow stacked variant, a dark release card, and rows with inline edit affordances."
                registerRef={registerPanel}>
                <VStack gap={5}>
                  <VariantBlock label="Two-column striped">
                    <VStack gap={0}>
                      {PROJECT_FACTS.map((fact, index) => (
                        <div
                          key={fact.label}
                          style={dlRowStyle(index % 2 === 0)}>
                          <Text type="label" color="secondary">
                            {fact.label}
                          </Text>
                          <Text type="body">{fact.value}</Text>
                        </div>
                      ))}
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="Left-aligned narrow">
                    <VStack gap={4}>
                      {NARROW_FACTS.map((fact, index) => (
                        <VStack key={fact.label} gap={4}>
                          {index > 0 && <Divider variant="subtle" />}
                          <VStack gap={0}>
                            <Text type="supporting" color="secondary">
                              {fact.label}
                            </Text>
                            <Text type="body">{fact.value}</Text>
                          </VStack>
                        </VStack>
                      ))}
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="Dark card variant" isBare>
                    <div style={styles.darkCard}>
                      <VStack gap={4}>
                        {DARK_FACTS.map((fact, index) => (
                          <VStack key={fact.label} gap={4}>
                            {index > 0 && (
                              <div
                                style={styles.darkDivider}
                                aria-hidden="true"
                              />
                            )}
                            <VStack gap={1}>
                              <span style={styles.darkLabel}>
                                {fact.label}
                              </span>
                              <span style={styles.darkValue}>
                                {fact.value}
                              </span>
                            </VStack>
                          </VStack>
                        ))}
                      </VStack>
                    </div>
                  </VariantBlock>

                  <VariantBlock label="With inline edit">
                    <VStack gap={4}>
                      {EDITABLE_FACTS.map((fact, index) => {
                        const draft = factDrafts[fact.id];
                        const isEditing = draft !== undefined;
                        const isDraftEmpty =
                          isEditing && draft.trim() === '';
                        return (
                          <VStack key={fact.id} gap={4}>
                            {index > 0 && <Divider variant="subtle" />}
                            <HStack gap={3} vAlign="start" wrap="wrap">
                              <StackItem size="fill">
                                <VStack gap={1}>
                                  <Text type="label">{fact.label}</Text>
                                  <Text type="supporting" color="secondary">
                                    {fact.description}
                                  </Text>
                                  {isEditing ? (
                                    <VStack gap={2}>
                                      <TextInput
                                        label={fact.label}
                                        isLabelHidden
                                        hasAutoFocus
                                        value={draft}
                                        onChange={next =>
                                          setFactDrafts(prev => ({
                                            ...prev,
                                            [fact.id]: next,
                                          }))
                                        }
                                        onEnter={() =>
                                          saveFactEdit(fact.id)
                                        }
                                        onKeyDown={event => {
                                          if (event.key === 'Escape') {
                                            cancelFactEdit(fact.id);
                                          }
                                        }}
                                        status={
                                          isDraftEmpty
                                            ? {
                                                type: 'error',
                                                message: `${fact.label} is required.`,
                                              }
                                            : undefined
                                        }
                                        width="100%"
                                      />
                                      <HStack gap={2}>
                                        <Button
                                          label="Save"
                                          variant="primary"
                                          size="sm"
                                          isDisabled={isDraftEmpty}
                                          onClick={() =>
                                            saveFactEdit(fact.id)
                                          }
                                        />
                                        <Button
                                          label="Cancel"
                                          variant="secondary"
                                          size="sm"
                                          onClick={() =>
                                            cancelFactEdit(fact.id)
                                          }
                                        />
                                      </HStack>
                                    </VStack>
                                  ) : (
                                    <Text type="body">
                                      {factValues[fact.id]}
                                    </Text>
                                  )}
                                </VStack>
                              </StackItem>
                              {!isEditing && (
                                <Button
                                  label="Edit"
                                  variant="ghost"
                                  size="sm"
                                  icon={
                                    <Icon icon={SquarePenIcon} size="sm" />
                                  }
                                  onClick={() => startFactEdit(fact.id)}
                                />
                              )}
                            </HStack>
                          </VStack>
                        );
                      })}
                    </VStack>
                  </VariantBlock>
                </VStack>
              </PanelShell>

              {/* ================ PANEL 5: STACKED LISTS ================ */}
              <PanelShell
                id="stacked-lists"
                title="Stacked lists"
                description="Row patterns for people and work items: avatar rows with chevrons, status rows with action menus, checkbox rows with a bulk bar, and an alphabet-grouped directory."
                registerRef={registerPanel}>
                <VStack gap={5}>
                  <VariantBlock label="Two-line rows with avatars and chevrons">
                    <VStack gap={2}>
                      <List hasDividers density="balanced">
                        {CONTACT_ROWS.map(contact => (
                          <ListItem
                            key={contact.id}
                            label={contact.name}
                            description={contact.title}
                            isSelected={openedContactId === contact.id}
                            onClick={() => setOpenedContactId(contact.id)}
                            startContent={
                              <Avatar name={contact.name} size={40} />
                            }
                            endContent={
                              <Icon
                                icon={ChevronRightIcon}
                                size="sm"
                                color="secondary"
                              />
                            }
                          />
                        ))}
                      </List>
                      <Text type="supporting" color="secondary">
                        {openedContactId
                          ? `Viewing profile: ${
                              CONTACT_ROWS.find(
                                contact => contact.id === openedContactId,
                              )?.name ?? ''
                            }`
                          : 'Tap a row to open a profile.'}
                      </Text>
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="Rows with status badges and action menus">
                    <VStack gap={2}>
                      {reviewRows.length > 0 ? (
                        <List hasDividers density="balanced">
                          {reviewRows.map(row => {
                            const meta = REVIEW_STATUS_META[row.status];
                            return (
                              <ListItem
                                key={row.id}
                                label={row.title}
                                description={`Owner: ${row.owner}`}
                                endContent={
                                  <HStack gap={2} vAlign="center">
                                    <Badge
                                      variant={meta.variant}
                                      label={meta.label}
                                    />
                                    <MoreMenu
                                      label={`Actions for ${row.title}`}
                                      size="sm"
                                      items={[
                                        {
                                          label: 'Approve',
                                          onClick: () =>
                                            setReviewStatus(
                                              row.id,
                                              'approved',
                                            ),
                                        },
                                        {
                                          label: 'Request changes',
                                          onClick: () =>
                                            setReviewStatus(
                                              row.id,
                                              'changes',
                                            ),
                                        },
                                        {
                                          label: 'Remove from queue',
                                          onClick: () =>
                                            removeReviewRow(row.id),
                                        },
                                      ]}
                                    />
                                  </HStack>
                                }
                              />
                            );
                          })}
                        </List>
                      ) : (
                        <Text type="body" color="secondary">
                          The review queue is empty.
                        </Text>
                      )}
                      {reviewRows.length < REVIEW_ROWS.length && (
                        <HStack gap={2}>
                          <Button
                            label="Reset queue"
                            variant="ghost"
                            size="sm"
                            onClick={resetReviewQueue}
                          />
                        </HStack>
                      )}
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="Checkbox-selectable rows with bulk bar">
                    <VStack gap={2}>
                      <div style={styles.bulkBar}>
                        <HStack gap={2} vAlign="center" wrap="wrap">
                          <CheckboxInput
                            label="Select all deliverables"
                            isLabelHidden
                            size="md"
                            value={areAllSelected}
                            onChange={toggleSelectAll}
                          />
                          <StackItem size="fill">
                            <Text type="supporting" color="secondary">
                              {selectedIds.size > 0
                                ? `${selectedIds.size} selected`
                                : `${visibleDeliverables.length} deliverables`}
                            </Text>
                          </StackItem>
                          {selectedIds.size > 0 && (
                            <HStack gap={2} vAlign="center">
                              <Button
                                label="Archive"
                                variant="secondary"
                                size="sm"
                                icon={<Icon icon={ArchiveIcon} size="sm" />}
                                onClick={archiveSelected}
                              />
                              <Button
                                label="Clear"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSelectAll(false)}
                              />
                            </HStack>
                          )}
                        </HStack>
                      </div>
                      {visibleDeliverables.length > 0 ? (
                        <List hasDividers density="balanced">
                          {visibleDeliverables.map(item => (
                            <ListItem
                              key={item.id}
                              label={item.title}
                              description={item.detail}
                              isSelected={selectedIds.has(item.id)}
                              startContent={
                                <CheckboxInput
                                  label={`Select ${item.title}`}
                                  isLabelHidden
                                  size="md"
                                  value={selectedIds.has(item.id)}
                                  onChange={checked =>
                                    toggleDeliverable(item.id, checked)
                                  }
                                />
                              }
                            />
                          ))}
                        </List>
                      ) : (
                        <Text type="body" color="secondary">
                          All deliverables archived.
                        </Text>
                      )}
                      {archivedIds.size > 0 && (
                        <HStack gap={2}>
                          <Button
                            label={`Restore archived (${archivedIds.size})`}
                            variant="ghost"
                            size="sm"
                            onClick={restoreArchived}
                          />
                        </HStack>
                      )}
                    </VStack>
                  </VariantBlock>

                  <VariantBlock label="Alphabet-indexed contact list">
                    <VStack gap={3}>
                      {DIRECTORY_GROUPS.map(group => (
                        <VStack key={group.letter} gap={1}>
                          <div style={styles.alphaHeader}>
                            <Text type="label" color="secondary">
                              {group.letter}
                            </Text>
                          </div>
                          <List hasDividers density="compact">
                            {group.people.map(person => (
                              <ListItem
                                key={person.id}
                                label={person.name}
                                description={person.title}
                                startContent={
                                  <Avatar name={person.name} size={32} />
                                }
                              />
                            ))}
                          </List>
                        </VStack>
                      ))}
                    </VStack>
                  </VariantBlock>
                </VStack>
              </PanelShell>
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
