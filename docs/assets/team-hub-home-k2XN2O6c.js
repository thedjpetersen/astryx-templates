var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs Atlas Q3 program
 *   roster (9 members), Wed Jul 15 2026 meetings, the four canonical
 *   pinned docs, three channel digests with reconciling unread counts,
 *   two OKR bars lifted from the okr-tree fixtures, and a grouped
 *   activity feed. Fixed strings and ISO-dated labels; no clocks, no
 *   randomness, no network media.
 * @output Team Hub Home — the Atlas Q3 program team's daily front door at
 *   Kestrel Labs: a hub header with team identity, a launch countdown
 *   chip fixed at "20 days", a presence facepile (3 online with green
 *   rings, Marcus in-meeting amber, a Start-huddle pill), a quick-actions
 *   row (new doc, share update, schedule), a today strip (3 meetings with
 *   join chips, tomorrow's Launch Readiness Review, a who's-out row citing
 *   Dana's PTO and Jonah's coverage), a pinned-docs rail (4 tiles with
 *   type glyphs, last-edited metadata, in-doc presence dots), a grouped
 *   recent-activity feed (doc edits, merges, decisions with actor
 *   avatars), and an end column with a channel digest (3 channels,
 *   unread counts, last-message previews) and a goals snapshot card
 *   (2 OKR bars citing the okr-tree fixtures).
 * @position Page template; emitted by \`astryx template team-hub-home\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (identity + facepile + huddle pill)
 *   | content (quick actions, today strip, pinned docs rail, activity
 *   feed — one scroll column, main column max 960 centered)
 *   | end panel 340 (channel digest + goals snapshot, scrolls
 *   independently).
 * Container policy: app-shell archetype — frame rows and panels; the
 *   pinned-doc tiles and the goals snapshot are the only card-like
 *   styled divs (genuine summary widgets); no design-system Cards.
 * Color policy: token-pure; the ONE accent is \`--color-accent\` (live
 *   join chip, huddle pill, mention markers). The only literals are the
 *   \`light-dark()\` fallback pairs on the data-viz categorical tokens
 *   (presence green/amber rings, doc-type glyph tints, activity-kind
 *   glyphs) — the demo does not inject \`--color-data-categorical-*\`.
 *   No scheme-locked surfaces.
 *
 * Responsive contract:
 * - > 1180px: full header | content | end-panel frame.
 * - <= 1180px: the end panel is dropped; the channel digest and goals
 *   snapshot re-render as a two-up section at the bottom of the main
 *   column (single-column <= 860px).
 * - <= 860px: header rows wrap (never clip the facepile or huddle
 *   pill); the pinned-docs grid steps 4 -> 2 columns (-> 1 at 560px,
 *   where meeting rows also drop their attendee facepiles and wrap
 *   their join chips); quick actions wrap.
 * - The content column and the end panel scroll independently
 *   (\`minHeight: 0\` down both flex chains); the hub header is pinned.
 */

import {type CSSProperties, type ReactNode, useState} from 'react';

import {
  ArrowUpRightIcon,
  AtSignIcon,
  BookOpenIcon,
  CalendarPlusIcon,
  CheckIcon,
  ClipboardListIcon,
  CompassIcon,
  FilePlus2Icon,
  FileTextIcon,
  GavelIcon,
  GitMergeIcon,
  HashIcon,
  HeadphonesIcon,
  MegaphoneIcon,
  PencilLineIcon,
  PinIcon,
  PlaneIcon,
  RocketIcon,
  TagIcon,
  TargetIcon,
  VideoIcon,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// PALETTE — data-viz categorical tokens with repo-standard fallbacks
// ---------------------------------------------------------------------------

const CATEGORICAL = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

// ===== STYLES =====

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  // Header ----------------------------------------------------------------
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    minWidth: 0,
  },
  teamMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-accent)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  countdownChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-accent)',
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  facepileRow: {display: 'flex', alignItems: 'center', gap: 12},
  // Ring = 2px surface gap + 2px presence color; the dot repeats the
  // color for color-blind-safe redundancy (position bottom-right).
  presenceWrap: {
    position: 'relative',
    display: 'inline-flex',
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-surface)',
  },
  presenceDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '2px solid var(--color-background-surface)',
  },
  overflowChip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    height: 32,
    marginLeft: 'var(--spacing-2)',
    padding: '0 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // Content column ----------------------------------------------------------
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-5) var(--spacing-5) var(--spacing-6)',
  },
  mainColumn: {maxWidth: 960, marginInline: 'auto'},
  quickBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  sectionGlyph: {display: 'inline-flex', color: 'var(--color-text-secondary)'},
  // Today strip -------------------------------------------------------------
  meetingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  meetingRowLive: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  meetingTime: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    width: 132,
    flexShrink: 0,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    backgroundColor: CATEGORICAL.green,
  },
  tomorrowRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  whosOutRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) dashed var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  // Optically centers a 14px glyph / 16px avatar on the first 16px text
  // line of the multi-line summary rows; keeps them from being stranded
  // on their own wrap line.
  rowLead: {display: 'inline-flex', flexShrink: 0, paddingTop: 1},
  // Pinned docs rail ---------------------------------------------------------
  docsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  docsGridCompact: {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'},
  docsGridNarrow: {gridTemplateColumns: 'minmax(0, 1fr)'},
  docTile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    textAlign: 'start',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    minWidth: 0,
  },
  docGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  docViewersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 16,
    // Pin to the tile bottom so 1-line and 2-line titles still produce
    // level presence rows across the rail.
    marginTop: 'auto',
  },
  // Status tokens sit beside flexible text — never let them shrink into
  // an ellipsis ("At risk" -> "At …").
  noShrink: {display: 'inline-flex', flexShrink: 0},
  docViewerDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
    backgroundColor: CATEGORICAL.green,
  },
  // Activity feed -------------------------------------------------------------
  activityGroupLabel: {marginTop: 'var(--spacing-2)'},
  activityRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-2) var(--spacing-1)',
    minWidth: 0,
  },
  activityGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
  },
  activityTime: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
    paddingTop: 2,
  },
  // End panel ------------------------------------------------------------------
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  panelScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  channelRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    minWidth: 0,
  },
  channelHash: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  mentionMark: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--color-accent)',
  },
  // Goals snapshot ---------------------------------------------------------------
  goalsCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  progressTrack: {flex: 1, minWidth: 0},
  progressPct: {
    width: 40,
    flexShrink: 0,
    textAlign: 'end',
  },
  twoUpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  twoUpGridNarrow: {gridTemplateColumns: 'minmax(0, 1fr)'},
};

// ===== FIXTURES =====
// Kestrel Labs · Atlas Q3 program team. Suite "now" anchor: Wednesday,
// July 15, 2026 — every relative label below is a fixed string derived
// from that anchor, never computed. Launch target Tue Aug 4 = 20 days.

type PresenceTone = 'online' | 'meeting';

interface FacepileMember {
  name: string;
  role: string;
  tone: PresenceTone;
  detail: string;
}

/** 9 members total: 4 ringed below + 5 in the overflow chip (Dana is on
 * PTO — she appears in the who's-out row, not with a presence ring). */
const FACEPILE: FacepileMember[] = [
  {
    name: 'Priya Raman',
    role: 'VP Engineering · program lead',
    tone: 'online',
    detail: 'Online now',
  },
  {
    name: 'Marcus Webb',
    role: 'Platform lead · infra workstream',
    tone: 'meeting',
    detail: 'In Platform & Infra sync · back 9:55 AM',
  },
  {
    name: 'Sofia Ortiz',
    role: 'Design lead · product & beta',
    tone: 'online',
    detail: 'Online now',
  },
  {
    name: 'Ava Lindqvist',
    role: 'Engineering · joined Jul 1',
    tone: 'online',
    detail: 'Online now',
  },
];

const OVERFLOW_MEMBERS = [
  'Jonah Fields',
  'Elena Voss',
  'Tom Okonkwo',
  'Ken Tanaka',
  'Dana Whitfield',
];

const TEAM = {
  name: 'Atlas Q3 · Program Team',
  org: 'Kestrel Labs',
  memberCount: 9,
  workstreams: 5,
  countdown: '20 days to launch',
  launchDate: 'Tue Aug 4',
  onlineSummary: '3 online · Marcus in a meeting',
};

interface Meeting {
  id: string;
  title: string;
  time: string;
  status: 'live' | 'upcoming';
  organizer: string;
  attendees: string[];
  note: string;
}

/** Wed Jul 15 — three meetings; the 9:30 sync is live right now. */
const MEETINGS_TODAY: Meeting[] = [
  {
    id: 'mtg-sync',
    title: 'Platform & Infra sync',
    time: '9:30 – 9:55 AM',
    status: 'live',
    organizer: 'Marcus Webb',
    attendees: ['Marcus Webb', 'Tom Okonkwo'],
    note: 'Read-replica rollout · beta tenant routing',
  },
  {
    id: 'mtg-beta',
    title: 'Beta capacity review',
    time: '11:30 AM – 12:00 PM',
    status: 'upcoming',
    organizer: 'Sofia Ortiz',
    attendees: ['Sofia Ortiz', 'Marcus Webb', 'Elena Voss'],
    note: 'Prep for the 500-seat cohort expansion · Mon Jul 21',
  },
  {
    id: 'mtg-pricing',
    title: 'Pricing freeze walkthrough',
    time: '3:00 – 3:30 PM',
    status: 'upcoming',
    organizer: 'Jonah Fields',
    attendees: ['Jonah Fields', 'Elena Voss'],
    note: 'Pricing Page Copy freeze · Fri Jul 17 (Jonah covering for Dana)',
  },
];

const TOMORROW_MEETING = {
  title: 'Atlas Q3 · Launch Readiness Review',
  time: 'Thu Jul 16 · 10:00 – 10:45 AM',
  organizer: 'Priya Raman',
  prep: 'Agenda lives in Atlas Q3 Launch Plan',
};

const WHOS_OUT = {
  name: 'Dana Whitfield',
  line: 'PTO through Fri Jul 17 · back Mon Jul 20',
  coverage: 'Jonah Fields is covering the Pricing Page Copy freeze',
};

interface QuickAction {
  id: string;
  label: string;
  icon: typeof FilePlus2Icon;
}

const QUICK_ACTIONS: QuickAction[] = [
  {id: 'qa-doc', label: 'New doc', icon: FilePlus2Icon},
  {id: 'qa-update', label: 'Share update', icon: MegaphoneIcon},
  {id: 'qa-schedule', label: 'Schedule', icon: CalendarPlusIcon},
];

interface PinnedDoc {
  id: string;
  title: string;
  icon: typeof FileTextIcon;
  tint: string;
  edited: string;
  editor: string;
  viewers: string[];
}

/** The four canonical Atlas Q3 docs — same titles everywhere in the
 * suite. \`viewers\` drives the in-doc presence dots (3 people in docs
 * right now across the rail). */
const PINNED_DOCS: PinnedDoc[] = [
  {
    id: 'doc-plan',
    title: 'Atlas Q3 Launch Plan',
    icon: FileTextIcon,
    tint: CATEGORICAL.blue,
    edited: 'Edited today · 8:15 AM',
    editor: 'Marcus Webb',
    viewers: ['Priya Raman', 'Jonah Fields'],
  },
  {
    id: 'doc-narrative',
    title: 'Atlas Q3 Launch Narrative',
    icon: BookOpenIcon,
    tint: CATEGORICAL.purple,
    edited: 'Edited Mon Jul 13',
    editor: 'Jonah Fields',
    viewers: [],
  },
  {
    id: 'doc-themes',
    title: 'Beta Feedback Themes',
    icon: ClipboardListIcon,
    tint: CATEGORICAL.teal,
    edited: 'Published Fri Jul 10',
    editor: 'Sofia Ortiz',
    viewers: ['Sofia Ortiz'],
  },
  {
    id: 'doc-pricing',
    title: 'Pricing Page Copy',
    icon: TagIcon,
    tint: CATEGORICAL.orange,
    edited: 'Edited yesterday · 4:40 PM',
    editor: 'Elena Voss',
    viewers: [],
  },
];

interface ChannelDigest {
  id: string;
  name: string;
  unread: number;
  hasMention: boolean;
  author: string;
  time: string;
  preview: string;
}

/** Unread counts sum to 20 — the panel header cites the same total. */
const CHANNELS: ChannelDigest[] = [
  {
    id: 'ch-atlas',
    name: 'atlas-q3',
    unread: 12,
    hasMention: false,
    author: 'Priya Raman',
    time: '9:12 AM',
    preview: 'Reminder: readiness-review agenda locks at noon tomorrow.',
  },
  {
    id: 'ch-infra',
    name: 'platform-infra',
    unread: 5,
    hasMention: false,
    author: 'Marcus Webb',
    time: '8:47 AM',
    preview: 'p95 held at 340ms overnight — replica rollout at 70% of tenants.',
  },
  {
    id: 'ch-beta',
    name: 'atlas-beta',
    unread: 3,
    hasMention: true,
    author: 'Sofia Ortiz',
    time: '8:03 AM',
    preview: 'Top beta themes need triage before Thursday — queue is in the doc.',
  },
];

const CHANNEL_UNREAD_TOTAL = 20; // 12 + 5 + 3

interface GoalBar {
  id: string;
  title: string;
  metric: string;
  owner: string;
  progress: number;
  variant: 'success' | 'warning';
  confidence: 'On track' | 'At risk';
}

/** Cited from the okr-tree fixtures ("Ship a rock-solid platform"):
 * same KR titles, progress values, and metric readouts. */
const GOALS = {
  objective: 'Ship a rock-solid platform',
  updated: 'Updated Mon Jul 13',
  bars: [
    {
      id: 'kr-uptime',
      title: 'Reach 99.95% monthly uptime',
      metric: 'tracking 99.97%',
      owner: 'Marcus Webb',
      progress: 90,
      variant: 'success',
      confidence: 'On track',
    },
    {
      id: 'kr-latency',
      title: 'Cut p95 API latency from 480ms to 250ms',
      metric: 'now 340ms',
      owner: 'Priya Raman',
      progress: 48,
      variant: 'warning',
      confidence: 'At risk',
    },
  ] satisfies GoalBar[],
};

type ActivityKind = 'edit' | 'merge' | 'decision' | 'publish' | 'update';

const ACTIVITY_KIND_META: Record<
  ActivityKind,
  {icon: typeof FileTextIcon; tint: string; label: string}
> = {
  edit: {icon: PencilLineIcon, tint: CATEGORICAL.blue, label: 'Doc edit'},
  merge: {icon: GitMergeIcon, tint: CATEGORICAL.green, label: 'Merge'},
  decision: {icon: GavelIcon, tint: CATEGORICAL.purple, label: 'Decision'},
  publish: {icon: ClipboardListIcon, tint: CATEGORICAL.teal, label: 'Published'},
  update: {icon: MegaphoneIcon, tint: CATEGORICAL.orange, label: 'Update'},
};

interface ActivityItem {
  id: string;
  kind: ActivityKind;
  actor: string;
  time: string;
  headline: string;
  detail: string;
  chip?: string;
  link?: string;
}

interface ActivityGroup {
  id: string;
  label: string;
  items: ActivityItem[];
}

/** Grouped feed — cross-references the rest of the suite: the Jul 9
 * "500 seats" decision, the Beta Feedback Themes publish, and merges
 * that move the p95-latency KR cited in the goals snapshot. */
const ACTIVITY: ActivityGroup[] = [
  {
    id: 'act-today',
    label: 'Today · Wed Jul 15',
    items: [
      {
        id: 'act-1',
        kind: 'merge',
        actor: 'Ava Lindqvist',
        time: '8:52 AM',
        headline: 'merged atlas-gateway #412',
        detail: 'Read-replica routing for beta tenants',
        chip: 'First merge',
      },
      {
        id: 'act-2',
        kind: 'edit',
        actor: 'Marcus Webb',
        time: '8:15 AM',
        headline: 'edited Atlas Q3 Launch Plan',
        detail: 'Updated the rollout gates ahead of Thursday’s review',
        link: 'Open doc',
      },
    ],
  },
  {
    id: 'act-yesterday',
    label: 'Yesterday · Tue Jul 14',
    items: [
      {
        id: 'act-3',
        kind: 'edit',
        actor: 'Elena Voss',
        time: '4:40 PM',
        headline: 'edited Pricing Page Copy',
        detail: 'Tiered-pricing table refresh before Friday’s freeze',
        link: 'Open doc',
      },
      {
        id: 'act-4',
        kind: 'merge',
        actor: 'Marcus Webb',
        time: '11:20 AM',
        headline: 'merged atlas-gateway #408',
        detail: 'Query-cache invalidation fix (p95 latency workstream)',
      },
      {
        id: 'act-5',
        kind: 'update',
        actor: 'Jonah Fields',
        time: '9:05 AM',
        headline: 'shared an update in #atlas-q3',
        detail: 'Launch-checklist owners assigned across all 5 workstreams',
      },
    ],
  },
  {
    id: 'act-week',
    label: 'Earlier · last week',
    items: [
      {
        id: 'act-6',
        kind: 'publish',
        actor: 'Sofia Ortiz',
        time: 'Fri Jul 10',
        headline: 'published Beta Feedback Themes',
        detail: '14 themes from the 250-seat cohort, ranked by frequency',
        link: 'Open doc',
      },
      {
        id: 'act-7',
        kind: 'decision',
        actor: 'Priya Raman',
        time: 'Thu Jul 9',
        headline: 'recorded a decision',
        detail:
          'Expand beta cohort to 500 seats — decided at the Launch Readiness Review · Jul 9',
        link: 'View in decision log',
      },
    ],
  },
];

// ===== SUBCOMPONENTS =====

const PRESENCE_TONE: Record<PresenceTone, {color: string; label: string}> = {
  online: {color: CATEGORICAL.green, label: 'Online'},
  meeting: {color: CATEGORICAL.orange, label: 'In a meeting'},
};

function PresenceAvatar({member}: {member: FacepileMember}) {
  const tone = PRESENCE_TONE[member.tone];
  return (
    <Tooltip content={\`\${member.name} · \${member.detail}\`}>
      <span
        role="img"
        aria-label={\`\${member.name}, \${member.role}. \${member.detail}\`}
        style={{
          ...styles.presenceWrap,
          boxShadow: \`0 0 0 2px var(--color-background-surface), 0 0 0 4px \${tone.color}\`,
        }}>
        <Avatar name={member.name} size="small" />
        <span
          aria-hidden
          style={{...styles.presenceDot, backgroundColor: tone.color}}
        />
      </span>
    </Tooltip>
  );
}

function PresenceFacepile() {
  return (
    <div style={styles.facepileRow} aria-label={\`\${TEAM.memberCount} members\`}>
      {FACEPILE.map(member => (
        <PresenceAvatar key={member.name} member={member} />
      ))}
      <Tooltip content={OVERFLOW_MEMBERS.join(' · ')}>
        <span
          style={styles.overflowChip}
          role="img"
          aria-label={\`\${OVERFLOW_MEMBERS.length} more members: \${OVERFLOW_MEMBERS.join(', ')}\`}>
          +{OVERFLOW_MEMBERS.length}
        </span>
      </Tooltip>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  meta,
  action,
}: {
  icon: typeof PinIcon;
  title: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <span style={styles.sectionGlyph} aria-hidden>
        <Icon icon={icon} size="sm" color="inherit" />
      </span>
      <Heading level={3}>{title}</Heading>
      {meta !== undefined ? (
        <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
          {meta}
        </Text>
      ) : null}
      {action !== undefined ? <StackItem size="fill" /> : null}
      {action}
    </HStack>
  );
}

function HubHeader({
  isHuddleLive,
  onToggleHuddle,
}: {
  isHuddleLive: boolean;
  onToggleHuddle: () => void;
}) {
  return (
    <LayoutHeader hasDivider>
      <div style={styles.headerRow}>
        <span style={styles.teamMark} aria-hidden>
          <Icon icon={CompassIcon} size="md" color="inherit" />
        </span>
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <Heading level={2}>{TEAM.name}</Heading>
            <span
              style={styles.countdownChip}
              title={\`Launch target \${TEAM.launchDate}, 2026\`}>
              <Icon icon={RocketIcon} size="xsm" color="inherit" />
              {TEAM.countdown}
            </span>
          </HStack>
          <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
            {TEAM.org} · {TEAM.memberCount} members · {TEAM.workstreams}{' '}
            workstreams
          </Text>
        </VStack>
        <StackItem size="fill" />
        <HStack gap={3} vAlign="center">
          <VStack gap={0} hAlign="end">
            <PresenceFacepile />
            <Text
              type="supporting"
              size="xsm"
              color="secondary"
              hasTabularNumbers>
              {TEAM.onlineSummary}
            </Text>
          </VStack>
          <Button
            label={isHuddleLive ? 'Leave huddle' : 'Start huddle'}
            size="sm"
            variant={isHuddleLive ? 'secondary' : 'primary'}
            icon={<Icon icon={HeadphonesIcon} size="sm" />}
            onClick={onToggleHuddle}
          />
        </HStack>
      </div>
    </LayoutHeader>
  );
}

function MeetingRow({
  meeting,
  isCompact,
  onJoin,
}: {
  meeting: Meeting;
  isCompact: boolean;
  onJoin: (title: string) => void;
}) {
  const isLive = meeting.status === 'live';
  return (
    <div
      style={{
        ...styles.meetingRow,
        ...(isLive ? styles.meetingRowLive : undefined),
      }}>
      <span style={styles.meetingTime}>{meeting.time}</span>
      <StackItem size="fill">
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            {isLive ? <span style={styles.liveDot} aria-hidden /> : null}
            <Text type="body" size="sm" weight="bold" maxLines={1}>
              {meeting.title}
            </Text>
            {isLive ? <Badge label="Live now" variant="success" /> : null}
          </HStack>
          <Text type="supporting" size="xsm" color="secondary" maxLines={2}>
            {meeting.note}
          </Text>
        </VStack>
      </StackItem>
      {isCompact ? null : (
        <AvatarGroup
          size="xsmall"
          aria-label={\`\${meeting.attendees.length} attending\`}>
          {meeting.attendees.slice(0, 2).map(person => (
            <Avatar key={person} name={person} />
          ))}
          {meeting.attendees.length > 2 ? (
            <AvatarGroupOverflow count={meeting.attendees.length - 2} />
          ) : null}
        </AvatarGroup>
      )}
      <Button
        label={isLive ? 'Join now' : 'Join'}
        size="sm"
        variant={isLive ? 'primary' : 'secondary'}
        icon={<Icon icon={VideoIcon} size="sm" />}
        onClick={() => onJoin(meeting.title)}
      />
    </div>
  );
}

function TodayStrip({
  isCompact,
  onJoin,
}: {
  isCompact: boolean;
  onJoin: (title: string) => void;
}) {
  return (
    <VStack gap={2}>
      <SectionHeader icon={VideoIcon} title="Today" meta="3 meetings" />
      {MEETINGS_TODAY.map(meeting => (
        <MeetingRow
          key={meeting.id}
          meeting={meeting}
          isCompact={isCompact}
          onJoin={onJoin}
        />
      ))}
      <div style={styles.tomorrowRow}>
        <span style={styles.rowLead} aria-hidden>
          <Icon icon={CheckIcon} size="xsm" color="secondary" />
        </span>
        <StackItem size="fill">
          <Text type="supporting" size="xsm" color="secondary">
            Tomorrow · {TOMORROW_MEETING.title} · {TOMORROW_MEETING.time} ·{' '}
            {TOMORROW_MEETING.organizer} — {TOMORROW_MEETING.prep}
          </Text>
        </StackItem>
      </div>
      <div style={styles.whosOutRow}>
        <span style={styles.rowLead} aria-hidden>
          <Icon icon={PlaneIcon} size="xsm" color="inherit" />
        </span>
        <span style={styles.rowLead}>
          <Avatar name={WHOS_OUT.name} size="tiny" />
        </span>
        <StackItem size="fill">
          <Text type="supporting" size="xsm" color="secondary">
            Out today: {WHOS_OUT.name} · {WHOS_OUT.line} · {WHOS_OUT.coverage}
          </Text>
        </StackItem>
      </div>
    </VStack>
  );
}

function DocTile({doc, onOpen}: {doc: PinnedDoc; onOpen: (t: string) => void}) {
  return (
    <button
      type="button"
      style={styles.docTile}
      onClick={() => onOpen(doc.title)}>
      <span style={{...styles.docGlyph, color: doc.tint}} aria-hidden>
        <Icon icon={doc.icon} size="sm" color="inherit" />
      </span>
      <Text type="body" size="sm" weight="bold" maxLines={2}>
        {doc.title}
      </Text>
      <Text type="supporting" size="xsm" color="secondary" maxLines={2}>
        {doc.edited} · {doc.editor}
      </Text>
      <div style={styles.docViewersRow}>
        {doc.viewers.map(viewer => (
          <span
            key={viewer}
            style={styles.docViewerDot}
            role="img"
            aria-label={\`\${viewer} is in this doc now\`}
            title={viewer}
          />
        ))}
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {doc.viewers.length === 0
            ? 'No one in doc'
            : \`\${doc.viewers.length} in doc now\`}
        </Text>
      </div>
    </button>
  );
}

function PinnedDocsRail({
  isCompact,
  isNarrowest,
  onOpen,
}: {
  isCompact: boolean;
  isNarrowest: boolean;
  onOpen: (title: string) => void;
}) {
  return (
    <VStack gap={2}>
      <SectionHeader
        icon={PinIcon}
        title="Pinned docs"
        meta="4 pinned"
        action={
          <Button label="View all docs" size="sm" variant="ghost" />
        }
      />
      <div
        style={{
          ...styles.docsGrid,
          ...(isCompact ? styles.docsGridCompact : undefined),
          ...(isNarrowest ? styles.docsGridNarrow : undefined),
        }}>
        {PINNED_DOCS.map(doc => (
          <DocTile key={doc.id} doc={doc} onOpen={onOpen} />
        ))}
      </div>
    </VStack>
  );
}

function ActivityRow({item}: {item: ActivityItem}) {
  const meta = ACTIVITY_KIND_META[item.kind];
  return (
    <div style={styles.activityRow}>
      <span
        style={{...styles.activityGlyph, color: meta.tint}}
        role="img"
        aria-label={meta.label}
        title={meta.label}>
        <Icon icon={meta.icon} size="xsm" color="inherit" />
      </span>
      <Avatar name={item.actor} size="xsmall" />
      <StackItem size="fill">
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <Text type="body" size="sm" maxLines={1}>
              <strong>{item.actor}</strong> {item.headline}
            </Text>
            {item.chip !== undefined ? (
              <span style={styles.noShrink}>
                <Token label={item.chip} size="sm" color="green" />
              </span>
            ) : null}
          </HStack>
          <Text type="supporting" size="xsm" color="secondary" maxLines={2}>
            {item.detail}
          </Text>
          {item.link !== undefined ? (
            <HStack gap={1} vAlign="center">
              <Text type="supporting" size="xsm" color="accent">
                {item.link}
              </Text>
              <Icon icon={ArrowUpRightIcon} size="xsm" color="accent" />
            </HStack>
          ) : null}
        </VStack>
      </StackItem>
      <span style={styles.activityTime}>{item.time}</span>
    </div>
  );
}

function ActivityFeed() {
  return (
    <VStack gap={1}>
      <SectionHeader
        icon={PencilLineIcon}
        title="Recent activity"
        meta="7 events since Thu Jul 9"
        action={<Button label="View all activity" size="sm" variant="ghost" />}
      />
      {ACTIVITY.map(group => (
        <VStack key={group.id} gap={0}>
          <div style={styles.activityGroupLabel}>
            <Text type="supporting" size="xsm" color="secondary" weight="bold">
              {group.label}
            </Text>
          </div>
          {group.items.map(item => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </VStack>
      ))}
    </VStack>
  );
}

function QuickActionsBar({onAction}: {onAction: (label: string) => void}) {
  return (
    <div style={styles.quickBar}>
      <Text type="supporting" size="sm" color="secondary">
        Wednesday, July 15
      </Text>
      <StackItem size="fill" />
      {QUICK_ACTIONS.map(action => (
        <Button
          key={action.id}
          label={action.label}
          size="sm"
          variant="secondary"
          icon={<Icon icon={action.icon} size="sm" />}
          onClick={() => onAction(action.label)}
        />
      ))}
    </div>
  );
}

function ChannelRow({channel}: {channel: ChannelDigest}) {
  return (
    <div style={styles.channelRow}>
      <span style={styles.channelHash} aria-hidden>
        <Icon icon={HashIcon} size="xsm" color="inherit" />
      </span>
      <StackItem size="fill">
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="body" size="sm" weight="bold" maxLines={1}>
                {channel.name}
              </Text>
            </StackItem>
            {channel.hasMention ? (
              <span
                style={styles.mentionMark}
                role="img"
                aria-label="You were mentioned"
                title="You were mentioned">
                <Icon icon={AtSignIcon} size="xsm" color="inherit" />
              </span>
            ) : null}
            <Badge label={\`\${channel.unread}\`} variant="info" />
          </HStack>
          <Text type="supporting" size="xsm" color="secondary" maxLines={2}>
            <strong>{channel.author}</strong> · {channel.time} —{' '}
            {channel.preview}
          </Text>
        </VStack>
      </StackItem>
    </div>
  );
}

function ChannelDigestSection() {
  return (
    <VStack gap={1}>
      <SectionHeader
        icon={HashIcon}
        title="Channels"
        meta={\`\${CHANNEL_UNREAD_TOTAL} unread\`}
      />
      {CHANNELS.map(channel => (
        <ChannelRow key={channel.id} channel={channel} />
      ))}
      <Button label="Open all channels" size="sm" variant="ghost" />
    </VStack>
  );
}

function GoalBarRow({goal}: {goal: GoalBar}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <Avatar name={goal.owner} size="tiny" />
        <StackItem size="fill">
          <Text type="body" size="sm" maxLines={2}>
            {goal.title}
          </Text>
        </StackItem>
        <span style={styles.noShrink}>
          <Token
            label={goal.confidence}
            size="sm"
            color={goal.variant === 'success' ? 'green' : 'yellow'}
          />
        </span>
      </HStack>
      <HStack gap={2} vAlign="center">
        <div style={styles.progressTrack}>
          <ProgressBar
            value={goal.progress}
            max={100}
            label={\`\${goal.title} — \${goal.progress}%\`}
            isLabelHidden
            variant={goal.variant}
          />
        </div>
        <div style={styles.progressPct}>
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            {goal.progress}%
          </Text>
        </div>
      </HStack>
      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
        {goal.metric}
      </Text>
    </VStack>
  );
}

function GoalsSnapshotSection() {
  return (
    <VStack gap={2}>
      <SectionHeader icon={TargetIcon} title="Goals" meta="Q3 snapshot" />
      <div style={styles.goalsCard}>
        <VStack gap={0}>
          <Text type="body" size="sm" weight="bold">
            {GOALS.objective}
          </Text>
          <Text type="supporting" size="xsm" color="secondary">
            2 of 3 key results shown · {GOALS.updated}
          </Text>
        </VStack>
        {GOALS.bars.map(goal => (
          <GoalBarRow key={goal.id} goal={goal} />
        ))}
        <Divider />
        <Button
          label="Open OKR tree"
          size="sm"
          variant="ghost"
          icon={<Icon icon={ArrowUpRightIcon} size="sm" />}
        />
      </div>
    </VStack>
  );
}

// ===== MAIN =====

export default function TeamHubHomeTemplate() {
  const isPanelDropped = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');
  const isNarrowest = useMediaQuery('(max-width: 560px)');

  const [isHuddleLive, setIsHuddleLive] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const toggleHuddle = () => {
    setIsHuddleLive(prev => {
      setAnnouncement(
        prev
          ? 'You left the huddle.'
          : 'Huddle started in Atlas Q3 — teammates can hop in from the hub header.',
      );
      return !prev;
    });
  };

  const joinMeeting = (title: string) =>
    setAnnouncement(\`Joining \${title}…\`);
  const openDoc = (title: string) => setAnnouncement(\`Opening \${title}…\`);
  const runQuickAction = (label: string) =>
    setAnnouncement(\`\${label} — opening…\`);

  const digestAndGoals = (
    <>
      <ChannelDigestSection />
      <Divider />
      <GoalsSnapshotSection />
    </>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <HubHeader
            isHuddleLive={isHuddleLive}
            onToggleHuddle={toggleHuddle}
          />
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              <div style={styles.contentScroll}>
                <div style={styles.mainColumn}>
                  <VStack gap={5}>
                    <QuickActionsBar onAction={runQuickAction} />
                    <TodayStrip isCompact={isNarrowest} onJoin={joinMeeting} />
                    <PinnedDocsRail
                      isCompact={isCompact}
                      isNarrowest={isNarrowest}
                      onOpen={openDoc}
                    />
                    <ActivityFeed />
                    {isPanelDropped ? (
                      <>
                        <Divider />
                        <div
                          style={{
                            ...styles.twoUpGrid,
                            ...(isCompact
                              ? styles.twoUpGridNarrow
                              : undefined),
                          }}>
                          <ChannelDigestSection />
                          <GoalsSnapshotSection />
                        </div>
                      </>
                    ) : null}
                  </VStack>
                </div>
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isPanelDropped ? undefined : (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              label="Channels and goals">
              <div style={styles.panelFill}>
                <div style={styles.panelScroll}>
                  <VStack gap={4}>{digestAndGoals}</VStack>
                </div>
              </div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};