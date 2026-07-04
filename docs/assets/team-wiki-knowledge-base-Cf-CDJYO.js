var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the fixed Kestrel Labs wiki tree
 *   (spaces > sections > pages with emojis), one static runbook article
 *   ("Atlas Q3 Launch Runbook") with fixed ISO timestamps in July 2026,
 *   pinned presence (2 viewers, 1 editor), and reconciling backlink /
 *   page-count fixtures. No clocks, no randomness, no network media.
 * @output Team Wiki & Knowledge Base — the Kestrel Labs internal wiki
 *   opened on the Atlas Q3 space. A left page tree (spaces > sections >
 *   emoji pages, current page highlighted, per-space quick-add and a
 *   pinned New-page affordance); a main article column rendering the
 *   "Atlas Q3 Launch Runbook" as static styled wiki content (section
 *   headings, an info callout, a roles-and-escalation table, a rollback
 *   CodeBlock), topped by editing-presence avatars (two viewers plus
 *   Marcus editing with a colored caret note) and a page metadata bar
 *   (owner, last verified, "Verified 12d ago" freshness badge); below the
 *   article, a stale sibling-page teaser carrying a warning Banner and a
 *   "Linked from" backlinks section; and a right "On this page" mini-TOC
 *   whose active entry tracks the article scroll position (scroll-spy).
 * @position Page template; emitted by \`astryx template team-wiki-knowledge-base\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (brand, search, New page) | rail 280 (per-space TreeLists +
 *   pinned New-page footer) | content (article scroller, 820px-max
 *   centered column) | end panel 232 (mini-TOC, sticky against the
 *   article scroll).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. The callout, roles table, stale teaser, and backlink rows are
 *   styled divs inside the article column; the mini-TOC is a LayoutPanel.
 * Color policy: token-pure everywhere; the only literals are the
 *   repo-standard \`light-dark()\` fallback pairs on the data-viz
 *   categorical tokens used for the editing caret / editor ring (orange,
 *   per-member presence color) and the space dots in the rail (the demo
 *   does not inject \`--color-data-categorical-*\`). The single accent is
 *   \`--color-accent\` (active TOC entry, callout rule, backlink hover).
 *
 * Responsive contract:
 * - > 1240px: full three-region frame (rail 280 | article | TOC 232).
 * - <= 1240px: the mini-TOC panel is dropped; the article keeps its
 *   in-body section headings as the only navigation.
 * - <= 900px: the page-tree rail is dropped; the breadcrumb keeps the
 *   space > section > page trail and the header row wraps instead of
 *   clipping the search box or the New page button.
 * - The rail tree, the article, and the TOC each scroll independently
 *   (\`minHeight: 0\` down every flex chain); the metadata bar and
 *   toolbars are pinned by the article column's normal flow.
 */

import {useRef, useState, type CSSProperties, type ReactNode} from 'react';

import {
  ArchiveIcon,
  BookOpenIcon,
  CalendarIcon,
  EyeIcon,
  FileTextIcon,
  FolderInputIcon,
  HashIcon,
  HistoryIcon,
  InfoIcon,
  LinkIcon,
  PencilLineIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  SquareIcon,
  VoteIcon,
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
import {Banner} from '@astryxdesign/core/Banner';
import {BreadcrumbItem, Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard \`light-dark()\` fallback pair. EDITOR_COLOR is
// Marcus Webb's per-member presence color (matches the orange he carries
// on other Team Workspace surfaces).
const EDITOR_COLOR =
  'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const SPACE_DOT_COLOR: Record<string, string> = {
  atlas: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  eng: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  handbook: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
};

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
  // Rail ------------------------------------------------------------------
  railFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-2)'},
  railFooter: {flexShrink: 0, padding: 'var(--spacing-2)'},
  spaceGap: {height: 'var(--spacing-3)'},
  spaceHeader: {paddingInline: 'var(--spacing-1)'},
  spaceDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  pageEmoji: {fontSize: 14, lineHeight: 1, flexShrink: 0},
  countChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 6px',
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  staleDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
    backgroundColor: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },
  // Article scroller --------------------------------------------------------
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  // position:relative makes section offsetTop values relative to this
  // scroller, which is what the scroll-spy math reads.
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    position: 'relative',
    padding: 'var(--spacing-4)',
  },
  articleColumn: {width: '100%', maxWidth: 820, marginInline: 'auto'},
  topbar: {paddingBottom: 'var(--spacing-3)'},
  titleEmoji: {fontSize: 30, lineHeight: 1, flexShrink: 0},
  // Presence ----------------------------------------------------------------
  editorRing: {
    display: 'inline-flex',
    borderRadius: '50%',
    boxShadow: \`0 0 0 2px \${EDITOR_COLOR}\`,
  },
  editingChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  caretGlyph: {color: EDITOR_COLOR, fontWeight: 700, lineHeight: 1},
  // Metadata bar -------------------------------------------------------------
  metaBar: {
    borderBlock: 'var(--border-width) solid var(--color-border)',
    paddingBlock: 'var(--spacing-2)',
    marginBlock: 'var(--spacing-3)',
  },
  metaItem: {display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'},
  // Article body -------------------------------------------------------------
  sectionBlock: {paddingTop: 'var(--spacing-5)'},
  callout: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    borderInlineStart: '3px solid var(--color-accent)',
  },
  tableWrap: {
    overflowX: 'auto',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
  },
  table: {borderCollapse: 'collapse', width: '100%'},
  th: {
    textAlign: 'start',
    padding: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    fontSize: 13,
    verticalAlign: 'middle',
  },
  tdLast: {borderBottom: 'none'},
  timelineRow: {
    display: 'grid',
    gridTemplateColumns: '64px 1fr',
    gap: 'var(--spacing-3)',
    alignItems: 'baseline',
  },
  timeCell: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // CodeBlock isWrapped uses word-break:break-all — soften it (footgun 13).
  codeBlock: {wordBreak: 'normal', overflowWrap: 'anywhere', width: '100%'},
  // Verification checklist — icon checkbox hugs its text (not the 64px
  // timeline time column, which reads as a broken gap under a glyph).
  checklistRow: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start'},
  checkGlyph: {display: 'inline-flex', flexShrink: 0, marginTop: 2},
  // Teaser + backlinks ---------------------------------------------------------
  teaser: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  backlinkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  backlinkGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Mini-TOC ------------------------------------------------------------------
  tocFill: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-3)'},
  tocItem: {
    display: 'block',
    width: '100%',
    textAlign: 'start',
    background: 'none',
    border: 'none',
    borderInlineStart: '2px solid var(--color-border)',
    padding: '4px 0 4px var(--spacing-2)',
    margin: 0,
    font: 'inherit',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  tocItemActive: {
    borderInlineStart: '2px solid var(--color-accent)',
    color: 'var(--color-accent)',
    fontWeight: 600,
  },
};

// ---------------------------------------------------------------------------
// DATA — the shared Kestrel Labs world (140-person platform company), Atlas
// Q3 program. Suite "now" anchor: Wednesday, July 15, 2026 — every relative
// string ("Verified 12d ago", "94 days ago") is a fixed rendering of that
// anchor, never computed from a clock. Signed-in user: Jonah Fields.
// Reconciling counts: 3 people on this page = 2 viewers + 1 editor;
// "Linked from 4 pages" = BACKLINKS.length; each section count chip renders
// its pages array length; the TOC lists exactly the 6 article sections.
// ---------------------------------------------------------------------------

const CURRENT_USER = 'Jonah Fields';

const PAGE = {
  emoji: '📕',
  title: 'Atlas Q3 Launch Runbook',
  space: 'Atlas Q3',
  section: 'Launch',
  owner: 'Marcus Webb',
  ownerRole: 'Platform lead',
  // Jul 3 → Jul 15 anchor = 12 days; inside the 90-day verify window.
  verifiedAt: '2026-07-03T10:00:00Z',
  freshness: 'Verified 12d ago',
  editedAt: '2026-07-15T09:42:00Z',
  editedBy: 'Marcus Webb',
  watchers: 12,
};

/** Presence — pinned fixture: two viewers plus one editor with a caret. */
const VIEWERS = ['Jonah Fields', 'Ava Lindqvist'];
const EDITOR = {name: 'Marcus Webb', sectionLabel: 'Rollback plan'};
const PRESENCE_COUNT = VIEWERS.length + 1; // 3 on this page

/** Stale sibling teaser — Apr 12 → Jul 15 anchor = 94 days (> 90-day window). */
const STALE_SIBLING = {
  emoji: '📣',
  title: 'Status page & incident comms',
  owner: 'Dana Whitfield',
  verifiedAt: '2026-04-12T09:00:00Z',
  staleNote: 'Last verified Apr 12, 2026 — 94 days ago (window is 90 days).',
};

// Page tree ------------------------------------------------------------------

interface WikiPage {
  id: string;
  emoji: string;
  title: string;
  isStale?: boolean;
}

interface WikiSection {
  id: string;
  title: string;
  pages: WikiPage[];
  isExpanded?: boolean;
}

interface WikiSpace {
  id: string;
  emoji: string;
  name: string;
  sections: WikiSection[];
}

const ACTIVE_PAGE_ID = 'p-launch-runbook';

const SPACES: WikiSpace[] = [
  {
    id: 'atlas',
    emoji: '🚀',
    name: 'Atlas Q3',
    sections: [
      {
        id: 's-launch',
        title: 'Launch',
        isExpanded: true,
        pages: [
          {id: ACTIVE_PAGE_ID, emoji: '📕', title: 'Atlas Q3 Launch Runbook'},
          {
            id: 'p-status-comms',
            emoji: '📣',
            title: 'Status page & incident comms',
            isStale: true,
          },
          {id: 'p-checklist', emoji: '✅', title: 'Launch checklist'},
        ],
      },
      {
        id: 's-beta',
        title: 'Beta program',
        isExpanded: true,
        pages: [
          {id: 'p-beta-500', emoji: '🧪', title: 'Beta cohort — 500 seats'},
          {id: 'p-beta-triage', emoji: '💬', title: 'Beta feedback triage'},
        ],
      },
      {
        id: 's-decisions',
        title: 'Decisions & reviews',
        pages: [
          {id: 'p-decision-log', emoji: '🗳️', title: 'Decision log index'},
          {id: 'p-review-notes', emoji: '📝', title: 'Readiness review notes'},
        ],
      },
    ],
  },
  {
    id: 'eng',
    emoji: '🛠️',
    name: 'Engineering',
    sections: [
      {
        id: 's-runbooks',
        title: 'Runbooks',
        pages: [
          {id: 'p-oncall', emoji: '⏰', title: 'On-call rotation'},
          {id: 'p-deploy', emoji: '🚢', title: 'Deploy pipeline'},
        ],
      },
      {
        id: 's-standards',
        title: 'Standards',
        pages: [
          {id: 'p-review-standards', emoji: '📏', title: 'Code review standards'},
        ],
      },
    ],
  },
  {
    id: 'handbook',
    emoji: '🧭',
    name: 'Company handbook',
    sections: [
      {
        id: 's-onboarding',
        title: 'Onboarding',
        pages: [{id: 'p-first-week', emoji: '👋', title: 'First week at Kestrel'}],
      },
      {
        id: 's-policies',
        title: 'Policies',
        pages: [{id: 'p-security', emoji: '🔐', title: 'Security basics'}],
      },
    ],
  },
];

// Article fixtures ------------------------------------------------------------

/** The six sections — the mini-TOC and the scroll-spy both read this list. */
const SECTIONS = [
  {id: 'overview', title: 'Overview'},
  {id: 'roles', title: 'Roles & escalation'},
  {id: 'timeline', title: 'Launch-day timeline'},
  {id: 'rollback', title: 'Rollback plan'},
  {id: 'comms', title: 'Comms & status templates'},
  {id: 'verify', title: 'Post-launch verification'},
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

interface RoleRow {
  role: string;
  primary: string;
  backup: string;
  where: string;
}

// "Where" values stay short ("War room", "#atlas-q3") so the table fits the
// article column without a horizontal scroll; Ken's shadowing note lives in
// the caption under the table, not in the Backup cell.
const ROLE_ROWS: RoleRow[] = [
  {role: 'Launch commander', primary: 'Priya Raman', backup: 'Marcus Webb', where: '#atlas-q3'},
  {role: 'Infra on-call', primary: 'Marcus Webb', backup: 'Ava Lindqvist', where: 'War room'},
  {role: 'Billing cutover', primary: 'Elena Voss', backup: 'Jonah Fields', where: 'War room'},
  {role: 'Comms & status page', primary: 'Dana Whitfield', backup: 'Tom Okonkwo', where: '#atlas-q3'},
  {role: 'Beta cohort monitor', primary: 'Sofia Ortiz', backup: 'Ken Tanaka', where: 'War room'},
];

interface TimelineStep {
  time: string;
  text: string;
  owner: string;
}

/** Launch day — Tue Aug 4, 2026 (canonical launch target). */
const TIMELINE_STEPS: TimelineStep[] = [
  {time: '07:30', text: 'Deploy freeze begins; final launch build pinned.', owner: 'Marcus Webb'},
  {time: '08:00', text: 'War room opens as a thread in #atlas-q3; roll call against the table above.', owner: 'Priya Raman'},
  {time: '09:00', text: 'Feature flag atlas-ga ramps 5% → 25%; watch the error budget between steps.', owner: 'Marcus Webb'},
  {time: '11:30', text: 'Ramp to 100% if the error budget is intact and billing events reconcile.', owner: 'Marcus Webb'},
  {time: '12:00', text: 'Status page update and customer announcement email go out.', owner: 'Dana Whitfield'},
  {time: '16:00', text: 'Go/no-go on the overnight hold; hand off to on-call and close the war room.', owner: 'Priya Raman'},
];

// Every line stays under ~52 characters so the snippet never soft-wraps at
// the article column's narrowest desktop width (mid-token wraps look broken).
const ROLLBACK_SNIPPET = \`# Roll back the Atlas GA ramp — safe at any stage
kestrelctl flags set atlas-ga --ramp 0
kestrelctl deploy pin api-gateway r2026.07.28-atlas
kestrelctl deploy pin billing-svc r2026.06.30-stable

# Stand down once error < 0.1% holds for 10 minutes
kestrelctl slo watch atlas-launch --window 10m\`;

// Backlinks --------------------------------------------------------------------

interface Backlink {
  id: string;
  icon: typeof FileTextIcon;
  title: string;
  source: string;
  at: string;
}

/** Exactly four — the section header chip renders BACKLINKS.length. */
const BACKLINKS: Backlink[] = [
  {
    id: 'b-launch-plan',
    icon: FileTextIcon,
    title: 'Atlas Q3 Launch Plan',
    source: 'Docs · source-of-truth doc',
    at: '2026-07-14T16:10:00Z',
  },
  {
    id: 'b-decision',
    icon: VoteIcon,
    title: 'Decision — Expand beta cohort to 500 seats',
    source: 'Decision log · Decided Jul 9',
    at: '2026-07-09T17:30:00Z',
  },
  {
    id: 'b-review',
    icon: CalendarIcon,
    title: 'Atlas Q3 · Launch Readiness Review — Jul 9',
    source: 'Meeting recap · agenda item 3',
    at: '2026-07-09T18:05:00Z',
  },
  {
    id: 'b-channel',
    icon: HashIcon,
    title: '#atlas-q3 — pinned message',
    source: 'Channel pin by Priya Raman',
    at: '2026-07-10T08:55:00Z',
  },
];

// ---------------------------------------------------------------------------
// RAIL — spaces > sections > pages. One TreeList per space with a
// quick-add "+" in the space header; a pinned New-page affordance sits in
// the rail footer. TreeList manages expansion internally (seeded via
// isExpanded); the current page carries isSelected.
// ---------------------------------------------------------------------------

function CountChip({count}: {count: number}) {
  return <span style={styles.countChip}>{count}</span>;
}

function toTreeItems(
  sections: WikiSection[],
  activePageId: string,
  onSelect: (id: string) => void,
): TreeListItemData[] {
  return sections.map(section => ({
    id: section.id,
    label: section.title,
    isExpanded: section.isExpanded,
    endContent: <CountChip count={section.pages.length} />,
    children: section.pages.map(page => ({
      id: page.id,
      label: page.title,
      startContent: (
        <span style={styles.pageEmoji} aria-hidden>
          {page.emoji}
        </span>
      ),
      endContent: page.isStale ? (
        <Tooltip content="Verification overdue (90-day window)">
          <span style={styles.staleDot} aria-label="Verification overdue" />
        </Tooltip>
      ) : undefined,
      isSelected: page.id === activePageId,
      onClick: () => onSelect(page.id),
    })),
  }));
}

function SpaceHeader({space}: {space: WikiSpace}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.spaceHeader}>
      <span
        style={{...styles.spaceDot, backgroundColor: SPACE_DOT_COLOR[space.id]}}
        aria-hidden
      />
      <span style={styles.pageEmoji} aria-hidden>
        {space.emoji}
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <Text type="label" size="sm" color="secondary" maxLines={1}>
          {space.name}
        </Text>
      </StackItem>
      <IconButton
        label={\`New page in \${space.name}\`}
        tooltip={\`New page in \${space.name}\`}
        variant="ghost"
        size="sm"
        icon={<Icon icon={PlusIcon} size="xsm" />}
      />
    </HStack>
  );
}

function PageTreeRail({
  activePageId,
  onSelectPage,
}: {
  activePageId: string;
  onSelectPage: (id: string) => void;
}) {
  return (
    <div style={styles.railFill}>
      <div style={styles.railScroll}>
        {SPACES.map((space, index) => (
          <div key={space.id}>
            {index > 0 ? <div style={styles.spaceGap} /> : null}
            <TreeList
              density="compact"
              header={<SpaceHeader space={space} />}
              items={toTreeItems(space.sections, activePageId, onSelectPage)}
            />
          </div>
        ))}
      </div>
      <Divider />
      <div style={styles.railFooter}>
        <Button
          label="New page"
          variant="ghost"
          size="sm"
          style={{width: '100%'}}
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ARTICLE HEADER PIECES — presence cluster, metadata bar, info callout.
// ---------------------------------------------------------------------------

/** 2 viewers + 1 editor with a colored caret note — pinned fixture. */
function PresenceCluster() {
  return (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <span style={styles.editingChip}>
        <span style={styles.caretGlyph} aria-hidden>
          ▍
        </span>
        {EDITOR.name.split(' ')[0]} is editing · {EDITOR.sectionLabel}
      </span>
      <HStack gap={1} vAlign="center">
        <Tooltip content={\`\${EDITOR.name} — editing now\`}>
          <span style={styles.editorRing}>
            <Avatar name={EDITOR.name} size="xsmall" />
          </span>
        </Tooltip>
        {VIEWERS.map(name => (
          <Tooltip
            key={name}
            content={name === CURRENT_USER ? \`\${name} (you) — viewing\` : \`\${name} — viewing\`}>
            <span style={{display: 'inline-flex'}}>
              <Avatar name={name} size="xsmall" />
            </span>
          </Tooltip>
        ))}
      </HStack>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {PRESENCE_COUNT} on this page
      </Text>
    </HStack>
  );
}

/** Owner, last-verified date, freshness badge, last edit, watcher count. */
function MetadataBar() {
  return (
    <HStack gap={4} vAlign="center" wrap="wrap" style={styles.metaBar}>
      <span style={styles.metaItem}>
        <Avatar name={PAGE.owner} size="tiny" />
        <Text type="supporting" color="secondary">
          Owned by <strong>{PAGE.owner}</strong> · {PAGE.ownerRole}
        </Text>
      </span>
      <span style={styles.metaItem}>
        <Icon icon={ShieldCheckIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary">
          Last verified <Timestamp value={PAGE.verifiedAt} format="date" />
        </Text>
        <Tooltip content="Owner attests accuracy every 90 days">
          <Token size="sm" color="green" label={PAGE.freshness} />
        </Tooltip>
      </span>
      <span style={styles.metaItem}>
        <Icon icon={HistoryIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary">
          Edited <Timestamp value={PAGE.editedAt} format="date_time" /> by{' '}
          {PAGE.editedBy}
        </Text>
      </span>
      <span style={styles.metaItem}>
        <Icon icon={EyeIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {PAGE.watchers} watchers
        </Text>
      </span>
    </HStack>
  );
}

function InfoCallout() {
  return (
    <div style={styles.callout}>
      <Icon icon={InfoIcon} size="sm" color="secondary" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <Text type="supporting">
          <strong>Source of truth:</strong> dates and scope live in{' '}
          <strong>“Atlas Q3 Launch Plan”</strong> — this runbook covers
          execution mechanics only. If the two disagree, the Launch Plan
          wins; flag the drift in <strong>#atlas-q3</strong>.
        </Text>
      </StackItem>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ARTICLE BODY PIECES — roles table, timeline list.
// ---------------------------------------------------------------------------

function RolesTable() {
  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Primary</th>
            <th style={styles.th}>Backup</th>
            <th style={styles.th}>Where</th>
          </tr>
        </thead>
        <tbody>
          {ROLE_ROWS.map((row, index) => {
            const cell =
              index === ROLE_ROWS.length - 1
                ? {...styles.td, ...styles.tdLast}
                : styles.td;
            return (
              <tr key={row.role}>
                <td style={cell}>
                  <Text type="label" size="sm">
                    {row.role}
                  </Text>
                </td>
                <td style={cell}>
                  <span style={styles.metaItem}>
                    <Avatar name={row.primary} size="tiny" />
                    <Text type="supporting">{row.primary}</Text>
                  </span>
                </td>
                <td style={cell}>
                  <span style={styles.metaItem}>
                    <Avatar name={row.backup} size="tiny" />
                    <Text type="supporting">{row.backup}</Text>
                  </span>
                </td>
                <td style={{...cell, whiteSpace: 'nowrap'}}>
                  <Text type="supporting" color="secondary">
                    {row.where}
                  </Text>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TimelineList() {
  return (
    <VStack gap={2}>
      {TIMELINE_STEPS.map(step => (
        <div key={step.time} style={styles.timelineRow}>
          <span style={styles.timeCell}>{step.time}</span>
          <Text type="supporting">
            {step.text}{' '}
            <Text type="supporting" color="secondary">
              — {step.owner}
            </Text>
          </Text>
        </div>
      ))}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// ARTICLE BODY — six static sections; each <section> registers its element
// so the scroll-spy can compare offsetTop against the scroller position.
// ---------------------------------------------------------------------------

interface ArticleSectionProps {
  id: SectionId;
  title: string;
  registerSection: (id: SectionId) => (el: HTMLElement | null) => void;
  children: ReactNode;
}

function ArticleSection({id, title, registerSection, children}: ArticleSectionProps) {
  return (
    <section ref={registerSection(id)} aria-label={title} style={styles.sectionBlock}>
      <VStack gap={3}>
        <Heading level={2}>{title}</Heading>
        {children}
      </VStack>
    </section>
  );
}

function ArticleBody({
  registerSection,
}: {
  registerSection: (id: SectionId) => (el: HTMLElement | null) => void;
}) {
  return (
    <div>
      <ArticleSection id="overview" title="Overview" registerSection={registerSection}>
        <Text type="body">
          This runbook is the single execution reference for launch day —
          Tuesday, August 4, 2026. The launch checklist closes Wednesday,
          July 22; anything still open after that date is a launch blocker
          and goes straight to the war room, not to a workstream channel.
        </Text>
        <InfoCallout />
        <Text type="body">
          Two upstream gates feed this plan: the beta cohort expands to 500
          seats on July 21 (decided at the July 9 Launch Readiness Review),
          and the accessibility audit lands the week of July 27. If either
          slips, Priya re-baselines the timeline below at the Thursday
          review before anything else moves.
        </Text>
      </ArticleSection>

      <ArticleSection id="roles" title="Roles & escalation" registerSection={registerSection}>
        <Text type="body">
          Every seat has a named primary and backup. Escalation rule: if a
          primary does not acknowledge a page within 10 minutes, the backup
          takes the seat — announce the handoff in the war-room thread.
        </Text>
        <RolesTable />
        <Text type="supporting" color="secondary">
          Ken Tanaka shadows the beta monitor seat this launch (joined
          Jul 6); Sofia remains the deciding voice for beta health.
        </Text>
      </ArticleSection>

      <ArticleSection id="timeline" title="Launch-day timeline" registerSection={registerSection}>
        <Text type="body">
          All times US-Eastern. Each ramp step holds until its owner posts a
          green check in the war-room thread.
        </Text>
        <TimelineList />
      </ArticleSection>

      <ArticleSection id="rollback" title="Rollback plan" registerSection={registerSection}>
        <Text type="body">
          Rolling back is one command plus two release pins — it is safe at
          any ramp stage and takes under four minutes end to end. Elena
          confirms the billing-service pin before anyone stands down; billing
          events written during the ramp replay cleanly against the stable
          release.
        </Text>
        <CodeBlock
          code={ROLLBACK_SNIPPET}
          language="bash"
          title="rollback — run from the deploy bastion"
          hasCopyButton
          isWrapped
          style={styles.codeBlock}
        />
      </ArticleSection>

      <ArticleSection id="comms" title="Comms & status templates" registerSection={registerSection}>
        <Text type="body">
          Dana owns every external word on launch day. The announcement and
          status-page templates live in “Atlas Q3 Launch Narrative”; pricing
          copy is frozen under Dana&apos;s “Pricing Page Copy” freeze — do
          not paraphrase pricing anywhere, link to the frozen page instead.
        </Text>
        <Text type="body">
          Status page cadence: post at war-room open, then hourly until the
          ramp holds at 100%, then at close-out. Internal updates mirror to
          #atlas-q3 within five minutes of each external post.
        </Text>
      </ArticleSection>

      <ArticleSection id="verify" title="Post-launch verification" registerSection={registerSection}>
        <Text type="body">
          The launch is not done when the ramp hits 100% — it is done when
          all four checks below are green:
        </Text>
        <VStack gap={2}>
          {[
            'Golden dashboards green for 24 continuous hours — Marcus Webb.',
            'Billing reconciliation clean by Wednesday, Aug 5, 12:00 PM — Elena Voss.',
            'Beta feedback sweep cross-checked against “Beta Feedback Themes” — Sofia Ortiz.',
            'Launch retro on the agenda for the Thursday, Aug 6 readiness review — Priya Raman.',
          ].map(item => (
            <div key={item} style={styles.checklistRow}>
              <span style={styles.checkGlyph} aria-hidden>
                <Icon icon={SquareIcon} size="xsm" color="secondary" />
              </span>
              <Text type="supporting">{item}</Text>
            </div>
          ))}
        </VStack>
      </ArticleSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BELOW THE ARTICLE — stale sibling teaser + backlinks.
// ---------------------------------------------------------------------------

/** Sibling-page teaser carrying the stale-page banner variant. */
function StaleSiblingTeaser() {
  return (
    <VStack gap={2} style={styles.teaser}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <span style={styles.pageEmoji} aria-hidden>
          {STALE_SIBLING.emoji}
        </span>
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="label" maxLines={1}>
            Next in Launch: {STALE_SIBLING.title}
          </Text>
        </StackItem>
        <span style={styles.metaItem}>
          <Avatar name={STALE_SIBLING.owner} size="tiny" />
          <Text type="supporting" color="secondary">
            {STALE_SIBLING.owner}
          </Text>
        </span>
      </HStack>
      <Banner
        status="warning"
        title="This page may be stale"
        description={STALE_SIBLING.staleNote}
        endContent={<Button label="Request review" variant="secondary" size="sm" />}
      />
    </VStack>
  );
}

function BacklinksSection() {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Icon icon={LinkIcon} size="sm" color="secondary" />
        <Heading level={2}>Linked from</Heading>
        <CountChip count={BACKLINKS.length} />
      </HStack>
      {BACKLINKS.map(link => (
        <div key={link.id} style={styles.backlinkRow}>
          <span style={styles.backlinkGlyph}>
            <Icon icon={link.icon} size="sm" color="secondary" />
          </span>
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <Text type="label" size="sm" maxLines={1}>
                {link.title}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {link.source}
              </Text>
            </VStack>
          </StackItem>
          <Text type="supporting" color="secondary">
            <Timestamp value={link.at} format="date" />
          </Text>
        </div>
      ))}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// MINI-TOC — "On this page" with scroll-spy highlight. The active id is
// owned by the page (derived from the article scroller's scroll position);
// clicking an entry scrolls the article to that section.
// ---------------------------------------------------------------------------

function MiniToc({
  activeSection,
  onJump,
}: {
  activeSection: SectionId;
  onJump: (id: SectionId) => void;
}) {
  return (
    <div style={styles.tocFill}>
      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary">
          On this page
        </Text>
        <nav aria-label="Article sections">
          {SECTIONS.map(section => {
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                type="button"
                style={
                  isActive
                    ? {...styles.tocItem, ...styles.tocItemActive}
                    : styles.tocItem
                }
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onJump(section.id)}>
                {section.title}
              </button>
            );
          })}
        </nav>
        <Divider />
        <Text type="supporting" color="secondary">
          Sections update as you scroll. Verified pages re-attest every 90
          days.
        </Text>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const PAGE_TITLE_BY_ID = new Map(
  SPACES.flatMap(space =>
    space.sections.flatMap(section =>
      section.pages.map(page => [page.id, page.title] as const),
    ),
  ),
);

/** Scroll-spy probe offset — matches the scroller's top padding plus a
 * comfortable reading margin so a section activates as its heading nears
 * the top edge, not only once it touches it. */
const SPY_OFFSET = 96;

export default function TeamWikiKnowledgeBaseTemplate() {
  const [activePageId, setActivePageId] = useState(ACTIVE_PAGE_ID);
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [announcement, setAnnouncement] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});

  // Responsive contract: <=1240px drops the mini-TOC; <=900px drops the
  // page-tree rail (the breadcrumb keeps the trail).
  const isTocHidden = useMediaQuery('(max-width: 1240px)');
  const isCompact = useMediaQuery('(max-width: 900px)');

  const registerSection = (id: SectionId) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  // Scroll-spy: the active entry is the last section whose top has crossed
  // the probe line. Section offsetTop is relative to the scroller (the
  // scroll container is position:relative and the column is static).
  const handleArticleScroll = () => {
    const scroller = scrollRef.current;
    if (scroller === null) {
      return;
    }
    const probe = scroller.scrollTop + SPY_OFFSET;
    let current: SectionId = SECTIONS[0].id;
    for (const section of SECTIONS) {
      const el = sectionRefs.current[section.id];
      if (el != null && el.offsetTop <= probe) {
        current = section.id;
      }
    }
    setActiveSection(prev => (prev === current ? prev : current));
  };

  const jumpToSection = (id: SectionId) => {
    const el = sectionRefs.current[id];
    const scroller = scrollRef.current;
    if (el != null && scroller !== null) {
      scroller.scrollTo({top: Math.max(el.offsetTop - 12, 0), behavior: 'smooth'});
    }
    setActiveSection(id);
  };

  const selectPage = (id: string) => {
    setActivePageId(id);
    const title = PAGE_TITLE_BY_ID.get(id) ?? 'page';
    setAnnouncement(\`Selected “\${title}” in the page tree\`);
  };

  // ----- header: brand, search, New page -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={BookOpenIcon} size="md" color="secondary" />
          {/* Brand is a label, not a heading — the article title below is
              the page's single H1. */}
          <Text type="label">Wiki</Text>
          <Text type="supporting" color="secondary">
            Kestrel Labs
          </Text>
        </HStack>
        <StackItem size="fill">
          <TextInput
            label="Search the wiki"
            isLabelHidden
            size="sm"
            width="100%"
            style={{maxWidth: 520}}
            placeholder="Search pages, spaces, and owners…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        <Button
          label="New page"
          variant="primary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- article column -----
  const article = (
    <div
      ref={scrollRef}
      style={styles.contentScroll}
      onScroll={handleArticleScroll}>
      <div style={styles.articleColumn}>
        <HStack gap={2} vAlign="center" wrap="wrap" style={styles.topbar}>
          <StackItem size="fill" style={{minWidth: 0}}>
            <Breadcrumbs variant="supporting" label="Page location">
              <BreadcrumbItem onClick={() => {}}>{PAGE.space}</BreadcrumbItem>
              <BreadcrumbItem onClick={() => {}}>{PAGE.section}</BreadcrumbItem>
              <BreadcrumbItem isCurrent>{PAGE.title}</BreadcrumbItem>
            </Breadcrumbs>
          </StackItem>
          <PresenceCluster />
          <MoreMenu
            label="Page actions"
            size="sm"
            items={[
              {
                label: 'View history',
                icon: <Icon icon={HistoryIcon} size="sm" color="inherit" />,
                onClick: () => {},
              },
              {
                label: 'Copy link',
                icon: <Icon icon={LinkIcon} size="sm" color="inherit" />,
                onClick: () => {},
              },
              {
                label: 'Move page',
                icon: <Icon icon={FolderInputIcon} size="sm" color="inherit" />,
                onClick: () => {},
              },
              {type: 'divider' as const},
              {
                label: 'Archive page',
                icon: <Icon icon={ArchiveIcon} size="sm" color="inherit" />,
                onClick: () => {},
              },
            ]}
          />
        </HStack>

        <HStack gap={3} vAlign="center">
          <span style={styles.titleEmoji} aria-hidden>
            {PAGE.emoji}
          </span>
          <StackItem size="fill" style={{minWidth: 0}}>
            <Heading level={1}>{PAGE.title}</Heading>
          </StackItem>
          <Button
            label="Edit"
            variant="secondary"
            size="sm"
            icon={<Icon icon={PencilLineIcon} size="sm" color="inherit" />}
          />
        </HStack>

        <MetadataBar />
        <ArticleBody registerSection={registerSection} />

        <VStack gap={4} style={styles.sectionBlock}>
          <Divider />
          <StaleSiblingTeaser />
          <BacklinksSection />
        </VStack>
      </div>
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel width={280} padding={0} hasDivider label="Page tree">
              <PageTreeRail
                activePageId={activePageId}
                onSelectPage={selectPage}
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
              {article}
            </div>
          </LayoutContent>
        }
        end={
          isTocHidden ? undefined : (
            <LayoutPanel width={232} padding={0} hasDivider label="On this page">
              <MiniToc activeSection={activeSection} onJump={jumpToSection} />
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};