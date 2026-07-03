var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only: the Kestrel Labs workspace pinned to
 *   Tue 2026-07-14 ~9:41 AM with one executed suite-wide query — "atlas
 *   launch" — resolved against 26 fixed results (8 Docs, 4 Sheets, 3 Slides,
 *   5 Meetings, 6 Mail) that all orbit the Atlas Q3 launch program. Every
 *   facet count (content type, owner, date bucket) is DERIVED from the same
 *   results array at render time, so the numbers can never disagree with the
 *   rows or with each other. Fixed ISO-derived labels only — no Date.now(),
 *   Math.random(), or network assets.
 * @output Suite universal search results page: a 64px top nav (brand mark,
 *   the executed query in a centered search TextInput, Priya Raman Avatar),
 *   a 280px filter rail (content-type CheckboxInputs with live counts, owner
 *   facet checkboxes, cumulative date-bucket RadioList, reset button), and a
 *   scrolling results column: results summary line, a "Best match" hero Card
 *   for the Atlas Q3 Launch Brief with typographic doc-preview lines and
 *   hit-highlighted excerpt, per-app result groups (Docs / Sheets / Slides /
 *   Meetings / Mail) of rich rows — app glyph chip, hit-highlighted title,
 *   highlighted snippet, owner + modified metadata, shared facepile — with
 *   per-group "Show N more" expanders, meeting rows carrying Join / View
 *   recap actions (the live standup's Join flips to "In call"), a related-
 *   people rail of avatar cards with roles and matching-result counts, and a
 *   search-tips footer with operator hints and a Kbd shortcut.
 * @position Page template; emitted by \`astryx template office-universal-search\`
 *
 * Frame: root 100dvh div (demo stage auto-height guard) around Layout
 * height="fill". LayoutHeader is the 64px nav (brand 200px zone, search
 * flexes to 640px max, avatar right). LayoutPanel \`start\` (280px, padding 0)
 * holds the filter rail behind its own scroll; LayoutContent scrolls one
 * centered 880px results column; LayoutFooter carries the search-tips row.
 * The query input is editable, but the results surface is pinned to the
 * EXECUTED query ("atlas launch") exactly like a real search page — results
 * only change via the facet filters, never per keystroke.
 *
 * Responsive contract:
 * - >900px: filter rail visible in the start slot; hero preview art shown;
 *   related-people rail is a 6-up horizontal scroll.
 * - <=900px: the rail hides and the content-type facet re-renders as a wrap
 *   row of toggle chips (counts preserved) above the summary line; owner and
 *   date facets are desktop-rail-only (documented tradeoff). Hero drops its
 *   preview art column. Footer tips wrap.
 * - Facepiles hide below 640px so metadata rows never clip.
 *
 * Container policy (search-results archetype): frame-first — result rows are
 * bordered list rows on the page body, groups are plain sections. Card is
 * reserved for the single "Best match" hero (genuine summary widget);
 * ClickableCard for the related-people rail tiles.
 *
 * Color policy: no scheme-locked surfaces — the page is token-pure. Per-app
 * brand tints (glyph chips, hero preview art) are intentional light-dark()
 * literal pairs reusing the repo-standard categorical fallbacks where the
 * hue matches (Docs blue, Sheets green, Slides orange, Meet teal; Mail red
 * is a plain literal — no categorical red token exists). Hit-highlight marks
 * are an intentional amber light-dark() pair kept AA in both schemes.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  FileTextIcon,
  FilterIcon,
  LayoutGridIcon,
  LightbulbIcon,
  MailIcon,
  PlayIcon,
  PresentationIcon,
  RotateCcwIcon,
  SearchIcon,
  Share2Icon,
  Table2Icon,
  UsersIcon,
  VideoIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {Kbd} from '@astryxdesign/core/Kbd';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// FIXTURES — one executed query against the Kestrel Labs workspace.
// "Now" is pinned at Tue 2026-07-14, 9:41 AM (same anchor as the suite
// home launcher); every whenLabel below is derived from its fixed ISO stamp.
// ---------------------------------------------------------------------------

/** The query the results surface was executed for. */
const EXECUTED_QUERY = 'atlas launch';

type ResultApp = 'docs' | 'sheets' | 'slides' | 'meet' | 'mail';

const APP_ORDER: readonly ResultApp[] = [
  'docs',
  'sheets',
  'slides',
  'meet',
  'mail',
];

const APP_NAME: Record<ResultApp, string> = {
  docs: 'Docs',
  sheets: 'Sheets',
  slides: 'Slides',
  meet: 'Meetings',
  mail: 'Mail',
};

const APP_ICON: Record<ResultApp, typeof FileTextIcon> = {
  docs: FileTextIcon,
  sheets: Table2Icon,
  slides: PresentationIcon,
  meet: VideoIcon,
  mail: MailIcon,
};

/**
 * Brand tints per app — same values as the suite home launcher. Foreground
 * pairs reuse the repo-standard categorical fallbacks where the hue matches;
 * Mail red is a plain literal pair (no categorical red token exists).
 */
const APP_TINT: Record<ResultApp, {fg: string; wash: string}> = {
  docs: {
    fg: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
    wash: 'light-dark(#E5F0FD, #142A44)',
  },
  sheets: {
    fg: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
    wash: 'light-dark(#E4F6E7, #10301A)',
  },
  slides: {
    fg: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
    wash: 'light-dark(#FDEEDE, #38220D)',
  },
  meet: {
    fg: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
    wash: 'light-dark(#E0F3F5, #0D2B2F)',
  },
  mail: {
    fg: 'light-dark(#D92D20, #F87171)',
    wash: 'light-dark(#FDE9E6, #391716)',
  },
};

/** Signed-in user (matches the suite home launcher). */
const CURRENT_USER = 'Priya Raman';

/** Kestrel Labs roster — names and roles are stable across the suite. */
const PEOPLE_ROLES: Record<string, string> = {
  'Priya Raman': 'Program lead, Atlas Q3',
  'Marcus Webb': 'Engineering lead',
  'Sofia Ortiz': 'Design lead',
  'Jonah Fields': 'Data & research',
  'Dana Whitfield': 'Launch marketing lead',
  'Leo Tanaka': 'Legal counsel',
};

/** Rail order for the related-people row (owner-facet order matches). */
const PEOPLE_ORDER: readonly string[] = [
  'Priya Raman',
  'Marcus Webb',
  'Sofia Ortiz',
  'Jonah Fields',
  'Dana Whitfield',
  'Leo Tanaka',
];

type MeetingState = 'live' | 'upcoming' | 'past';

interface MeetingInfo {
  /** e.g. "9:30 – 9:45 AM" (today) or "Fri, Jul 10 · 2:00 PM". */
  timeLabel: string;
  state: MeetingState;
  attendees: readonly string[];
  /** "+N" facepile overflow. */
  overflowCount: number;
  /** Past meetings only: recording length shown next to "View recap". */
  recordingLabel?: string;
}

interface SearchResult {
  id: string;
  app: ResultApp;
  /** Hit-highlighted via HIGHLIGHT_RE. */
  title: string;
  /** Hit-highlighted via HIGHLIGHT_RE. */
  snippet: string;
  /** Owner (files), organizer (meetings), or sender (mail). */
  owner: string;
  /** Fixed display label derived from modifiedIso. */
  whenLabel: string;
  modifiedIso: string;
  /** Whole days before the pinned "now" (Tue 2026-07-14); drives the date facet. */
  daysAgo: number;
  /** Extra metadata slot: last editor, mailing list, location, etc. */
  detail?: string;
  /** Facepile names (files: shared with; meetings: attendees render instead). */
  sharedWith?: readonly string[];
  meeting?: MeetingInfo;
}

/**
 * All 26 hits for "atlas launch", newest-first within each app group.
 * Cross-suite continuity: the Launch Brief / Budget & Burn / Kickoff deck /
 * OKR tracker rows reuse the exact titles, owners, and timestamps from the
 * suite home launcher's recent-files rail; the three today-meetings mirror
 * its meetings strip. The 42-of-57 task figure repeats in two rows on
 * purpose (checklist doc and its mirror sheet) and must stay in sync.
 */
const ALL_RESULTS: readonly SearchResult[] = [
  // --- Docs (8) ------------------------------------------------------------
  {
    id: 'doc-launch-brief',
    app: 'docs',
    title: 'Atlas Q3 Launch Brief',
    snippet:
      'The Atlas launch window is confirmed for Tuesday, September 8. Every workstream owner signs off on the launch checklist by August 21, and go/no-go is decided at the September 1 exec review.',
    owner: 'Priya Raman',
    whenLabel: 'Today, 9:17 AM',
    modifiedIso: '2026-07-14T09:17:00-07:00',
    daysAgo: 0,
    detail: 'Marcus Webb edited 24 min ago',
    sharedWith: ['Marcus Webb', 'Sofia Ortiz', 'Jonah Fields', 'Dana Whitfield'],
  },
  {
    id: 'doc-launch-checklist',
    app: 'docs',
    title: 'Atlas launch checklist',
    snippet:
      '42 of 57 launch tasks complete. Remaining items are owned by platform (billing migration) and marketing (press kit); both roll up to the launch review at 2:00 PM today.',
    owner: 'Marcus Webb',
    whenLabel: 'Today, 8:52 AM',
    modifiedIso: '2026-07-14T08:52:00-07:00',
    daysAgo: 0,
    detail: 'Checked off 3 tasks this morning',
    sharedWith: ['Priya Raman', 'Jonah Fields'],
  },
  {
    id: 'doc-onboarding-notes',
    app: 'docs',
    title: 'Onboarding flow — design review notes',
    snippet:
      'Blocked states must be resolved before the Atlas launch cut. Sofia flagged the importer empty state; fix lands behind the launch flag this sprint.',
    owner: 'Sofia Ortiz',
    whenLabel: 'Yesterday, 11:38 AM',
    modifiedIso: '2026-07-13T11:38:00-07:00',
    daysAgo: 1,
    detail: 'Sofia Ortiz commented',
    sharedWith: ['Priya Raman', 'Marcus Webb'],
  },
  {
    id: 'doc-postlaunch-retro',
    app: 'docs',
    title: 'Atlas post-launch retro (draft)',
    snippet:
      'Template for the retro scheduled two weeks after launch: what shipped, what slipped, and the on-call log from launch week.',
    owner: 'Priya Raman',
    whenLabel: 'Sun, Jul 12',
    modifiedIso: '2026-07-12T15:24:00-07:00',
    daysAgo: 2,
    sharedWith: ['Marcus Webb'],
  },
  {
    id: 'doc-risk-register',
    app: 'docs',
    title: 'Atlas Q3 risk register',
    snippet:
      'Top launch risk remains the billing migration (likelihood: medium, impact: high). Mitigation owner Marcus Webb; fallback is a staged launch for existing workspaces.',
    owner: 'Jonah Fields',
    whenLabel: 'Fri, Jul 10',
    modifiedIso: '2026-07-10T13:05:00-07:00',
    daysAgo: 4,
    sharedWith: ['Priya Raman', 'Marcus Webb', 'Dana Whitfield'],
  },
  {
    id: 'doc-pricing-onepager',
    app: 'docs',
    title: 'Atlas pricing one-pager',
    snippet:
      'Atlas Pro lands at $24/seat at launch with a 20% annual discount; the free tier keeps three projects. Pricing page copy is due to legal by July 24.',
    owner: 'Dana Whitfield',
    whenLabel: 'Thu, Jul 9',
    modifiedIso: '2026-07-09T10:02:00-07:00',
    daysAgo: 5,
    detail: 'Shared with you by Dana Whitfield',
    sharedWith: ['Priya Raman', 'Jonah Fields', 'Leo Tanaka'],
  },
  {
    id: 'doc-comms-plan',
    app: 'docs',
    title: 'Launch-week comms plan',
    snippet:
      'Press embargo lifts at 6:00 AM PT on launch day. Atlas social copy variants A–C are staged; the customer email goes out in three waves.',
    owner: 'Dana Whitfield',
    whenLabel: 'Tue, Jul 7',
    modifiedIso: '2026-07-07T16:10:00-07:00',
    daysAgo: 7,
    sharedWith: ['Priya Raman', 'Sofia Ortiz'],
  },
  {
    id: 'doc-support-macros',
    app: 'docs',
    title: 'Support macros — Atlas launch week',
    snippet:
      'Canned responses for launch-day tickets covering the Atlas importer, workspace migration, and the new billing screen. Review with support on July 20.',
    owner: 'Jonah Fields',
    whenLabel: 'Fri, Jul 3',
    modifiedIso: '2026-07-03T11:47:00-07:00',
    daysAgo: 11,
    sharedWith: ['Dana Whitfield'],
  },
  // --- Sheets (4) ----------------------------------------------------------
  {
    id: 'sheet-task-tracker',
    app: 'sheets',
    title: 'Atlas launch task tracker',
    snippet:
      '57 tasks, 42 done — mirrors the Atlas launch checklist doc. Burndown tab projects all P0s closed by August 28, one week ahead of the launch window.',
    owner: 'Marcus Webb',
    whenLabel: 'Today, 9:12 AM',
    modifiedIso: '2026-07-14T09:12:00-07:00',
    daysAgo: 0,
    sharedWith: ['Priya Raman', 'Jonah Fields'],
  },
  {
    id: 'sheet-budget-burn',
    app: 'sheets',
    title: 'Atlas Q3 Budget & Burn',
    snippet:
      'Launch marketing line item revised to $48,000; overall burn tracks 4% under plan. The launch-week contingency column holds $6,500 unallocated.',
    owner: 'Priya Raman',
    whenLabel: 'Yesterday, 4:42 PM',
    modifiedIso: '2026-07-13T16:42:00-07:00',
    daysAgo: 1,
    detail: 'You edited',
    sharedWith: ['Dana Whitfield', 'Jonah Fields'],
  },
  {
    id: 'sheet-okr-tracker',
    app: 'sheets',
    title: 'Q3 OKR tracker',
    snippet:
      'KR2: ship the Atlas launch with ≥ 99.9% uptime in week one. KR3: 2,000 workspaces activated within 30 days of launch — currently pacing green.',
    owner: 'Jonah Fields',
    whenLabel: 'Fri, Jul 10',
    modifiedIso: '2026-07-10T17:21:00-07:00',
    daysAgo: 4,
    sharedWith: ['Priya Raman', 'Marcus Webb', 'Sofia Ortiz'],
  },
  {
    id: 'sheet-beta-signups',
    app: 'sheets',
    title: 'Atlas beta signups',
    snippet:
      '8,214 waitlist signups tagged "launch announcement" — up 22% week over week since the teaser mail. Conversion cohort tabs feed the launch review deck.',
    owner: 'Dana Whitfield',
    whenLabel: 'Sun, Jul 5',
    modifiedIso: '2026-07-05T09:58:00-07:00',
    daysAgo: 9,
    sharedWith: ['Jonah Fields'],
  },
  // --- Slides (3) ----------------------------------------------------------
  {
    id: 'deck-exec-readout',
    app: 'slides',
    title: 'Atlas launch review — exec readout',
    snippet:
      'Go/no-go criteria, launch-week staffing plan, and the rollback decision tree. Pre-read for today’s 2:00 PM Atlas Q3 launch review.',
    owner: 'Priya Raman',
    whenLabel: 'Today, 7:58 AM',
    modifiedIso: '2026-07-14T07:58:00-07:00',
    daysAgo: 0,
    detail: '18 slides',
    sharedWith: ['Dana Whitfield', 'Marcus Webb', 'Jonah Fields'],
  },
  {
    id: 'deck-kickoff-allhands',
    app: 'slides',
    title: 'Atlas Kickoff — All-hands deck',
    snippet:
      'Slide 12: the road to launch — milestones from private beta through GA, with the September 8 launch date called out on the timeline.',
    owner: 'Sofia Ortiz',
    whenLabel: 'Yesterday, 3:05 PM',
    modifiedIso: '2026-07-13T15:05:00-07:00',
    daysAgo: 1,
    detail: 'Sofia Ortiz added 4 slides',
    sharedWith: ['Priya Raman', 'Marcus Webb', 'Dana Whitfield'],
  },
  {
    id: 'deck-pricing-review',
    app: 'slides',
    title: 'Pricing review deck',
    snippet:
      'Launch pricing scenarios A/B with Atlas Pro margin curves; scenario B holds the $24/seat point from the pricing one-pager.',
    owner: 'Dana Whitfield',
    whenLabel: 'Wed, Jul 8',
    modifiedIso: '2026-07-08T14:47:00-07:00',
    daysAgo: 6,
    sharedWith: ['Priya Raman', 'Leo Tanaka'],
  },
  // --- Meetings (5) — owner is the organizer -------------------------------
  {
    id: 'meet-standup',
    app: 'meet',
    title: 'Atlas Q3 standup',
    snippet:
      'Daily launch-program standup. Today: billing-migration status, checklist burndown, and blockers ahead of the 2:00 PM launch review.',
    owner: 'Marcus Webb',
    whenLabel: 'Today',
    modifiedIso: '2026-07-14T09:30:00-07:00',
    daysAgo: 0,
    meeting: {
      timeLabel: '9:30 – 9:45 AM',
      state: 'live',
      attendees: ['Priya Raman', 'Marcus Webb', 'Jonah Fields', 'Sofia Ortiz'],
      overflowCount: 0,
    },
  },
  {
    id: 'meet-design-review',
    app: 'meet',
    title: 'Design review — Atlas onboarding',
    snippet:
      'Walkthrough of the reworked onboarding flow against the launch cut list; importer empty states and blocked states on the agenda.',
    owner: 'Sofia Ortiz',
    whenLabel: 'Today',
    modifiedIso: '2026-07-14T11:00:00-07:00',
    daysAgo: 0,
    meeting: {
      timeLabel: '11:00 AM – 12:00 PM',
      state: 'upcoming',
      attendees: ['Sofia Ortiz', 'Priya Raman', 'Marcus Webb'],
      overflowCount: 0,
    },
  },
  {
    id: 'meet-launch-review',
    app: 'meet',
    title: 'Atlas Q3 launch review',
    snippet:
      'Weekly launch review: exec readout pre-read, checklist status (42/57), budget check-in, and the go/no-go criteria walkthrough.',
    owner: 'Dana Whitfield',
    whenLabel: 'Today',
    modifiedIso: '2026-07-14T14:00:00-07:00',
    daysAgo: 0,
    meeting: {
      timeLabel: '2:00 – 3:00 PM',
      state: 'upcoming',
      attendees: ['Dana Whitfield', 'Priya Raman', 'Marcus Webb', 'Jonah Fields'],
      overflowCount: 4,
    },
  },
  {
    id: 'meet-dry-run',
    app: 'meet',
    title: 'Atlas launch dry run #1',
    snippet:
      'First end-to-end launch rehearsal: staged rollout playbook, rollback drill, and the on-call handoff checklist.',
    owner: 'Marcus Webb',
    whenLabel: 'Fri, Jul 10',
    modifiedIso: '2026-07-10T14:00:00-07:00',
    daysAgo: 4,
    meeting: {
      timeLabel: 'Fri, Jul 10 · 2:00 PM',
      state: 'past',
      attendees: ['Marcus Webb', 'Priya Raman', 'Jonah Fields'],
      overflowCount: 2,
      recordingLabel: 'Recording · 48 min',
    },
  },
  {
    id: 'meet-comms-sync',
    app: 'meet',
    title: 'Atlas launch comms sync',
    snippet:
      'Embargo timing, press-kit owners, and the three-wave customer email plan — decisions captured in the launch-week comms plan doc.',
    owner: 'Dana Whitfield',
    whenLabel: 'Mon, Jul 6',
    modifiedIso: '2026-07-06T10:00:00-07:00',
    daysAgo: 8,
    meeting: {
      timeLabel: 'Mon, Jul 6 · 10:00 AM',
      state: 'past',
      attendees: ['Dana Whitfield', 'Priya Raman', 'Sofia Ortiz'],
      overflowCount: 0,
      recordingLabel: 'Recording · 32 min',
    },
  },
  // --- Mail (6) — owner is the sender --------------------------------------
  {
    id: 'mail-preread-attached',
    app: 'mail',
    title: 'Atlas launch review — pre-read attached',
    snippet:
      'Attached the exec readout deck ahead of today’s 2:00 PM launch review. Please skim the go/no-go criteria before we meet.',
    owner: 'Dana Whitfield',
    whenLabel: 'Today, 7:41 AM',
    modifiedIso: '2026-07-14T07:41:00-07:00',
    daysAgo: 0,
    detail: 'to atlas-core · 1 attachment',
  },
  {
    id: 'mail-billing-migration',
    app: 'mail',
    title: 'Re: Atlas launch checklist — billing migration',
    snippet:
      'Migration dry run finished clean on staging. I’ll flip the two remaining checklist items after tomorrow’s soak test.',
    owner: 'Marcus Webb',
    whenLabel: 'Yesterday, 6:03 PM',
    modifiedIso: '2026-07-13T18:03:00-07:00',
    daysAgo: 1,
    detail: 'to you, Priya + 3',
  },
  {
    id: 'mail-beta-digest',
    app: 'mail',
    title: 'Atlas beta feedback digest — week 2',
    snippet:
      'Top ask before launch is still the CSV importer (31 mentions). Full tally lives in the Atlas beta signups sheet, cohort tab.',
    owner: 'Jonah Fields',
    whenLabel: 'Sun, Jul 12',
    modifiedIso: '2026-07-12T08:30:00-07:00',
    daysAgo: 2,
    detail: 'to atlas-core',
  },
  {
    id: 'mail-embargo-timing',
    app: 'mail',
    title: 'Press embargo timing for Atlas launch',
    snippet:
      'Locking embargo lift at 6:00 AM PT on launch day per the comms plan — flag conflicts by Friday, otherwise briefings start July 27.',
    owner: 'Dana Whitfield',
    whenLabel: 'Thu, Jul 9',
    modifiedIso: '2026-07-09T15:12:00-07:00',
    daysAgo: 5,
    detail: 'to atlas-core, press-team',
  },
  {
    id: 'mail-legal-signoff',
    app: 'mail',
    title: 'Legal signoff: Atlas launch terms',
    snippet:
      'Reviewed the updated terms of service for the Atlas launch — two comments on the data-retention clause, otherwise ready to sign.',
    owner: 'Leo Tanaka',
    whenLabel: 'Mon, Jul 6',
    modifiedIso: '2026-07-06T16:45:00-07:00',
    daysAgo: 8,
    detail: 'to you, Dana',
  },
  {
    id: 'mail-launch-swag',
    app: 'mail',
    title: 'Atlas launch t-shirts — sizes by Friday',
    snippet:
      'Ordering swag for launch week! Reply with sizes by Friday — the kestrel-over-mountains print won the design poll.',
    owner: 'Sofia Ortiz',
    whenLabel: 'Thu, Jul 2',
    modifiedIso: '2026-07-02T12:20:00-07:00',
    daysAgo: 12,
    detail: 'to everyone@kestrel.dev',
  },
];

/** The hero "best match" — pulled to the top, excluded from its group rows. */
const BEST_MATCH_ID = 'doc-launch-brief';

/**
 * Typographic preview lines for the hero card's faux doc page — real brief
 * text so the hit-highlighter has something honest to mark.
 */
const HERO_PREVIEW_LINES: readonly string[] = [
  'Atlas Q3 Launch Brief',
  'Launch window: Tuesday, September 8 (GA)',
  'Workstream signoff on the launch checklist due August 21.',
  'Go/no-go decided at the September 1 exec review; rollback playbook linked below.',
];

// ---------------------------------------------------------------------------
// DATE FACET — cumulative buckets derived from daysAgo (pinned "now").
// ---------------------------------------------------------------------------

type DateBucket = 'any' | 'today' | 'week' | 'month';

const DATE_BUCKETS: readonly {value: DateBucket; label: string; maxDaysAgo: number}[] = [
  {value: 'any', label: 'Any time', maxDaysAgo: Number.POSITIVE_INFINITY},
  {value: 'today', label: 'Today', maxDaysAgo: 0},
  {value: 'week', label: 'Past 7 days', maxDaysAgo: 7},
  {value: 'month', label: 'Past 30 days', maxDaysAgo: 30},
];

/** Search tips rendered in the footer; query chips use the code face. */
const SEARCH_TIPS: readonly {operator: string; hint: string}[] = [
  {operator: 'owner:dana', hint: 'files owned by a teammate'},
  {operator: 'type:deck', hint: 'only slide decks'},
  {operator: 'before:2026-08-21', hint: 'modified before a date'},
  {operator: '"launch checklist"', hint: 'exact phrase'},
];

// ---------------------------------------------------------------------------
// STYLES — one typed inline record; tokens only, plus the intentional
// light-dark() literals declared in APP_TINT and the highlight mark pair.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Demo stage renders templates in an auto-height container; the root div
  // gives Layout height="fill" a real box (footgun #6).
  root: {
    height: '100dvh',
    width: '100%',
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-4)',
    minHeight: 40,
    width: '100%',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexShrink: 0,
  },
  brandGlyph: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-text-on-accent, #FFFFFF)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  searchWrap: {
    flex: 1,
    maxWidth: 640,
    marginInline: 'auto',
    minWidth: 0,
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexShrink: 0,
  },
  // Filter rail (start panel): its own scroll behind the panel edge.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  facetRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
  },
  facetCount: {
    marginInlineStart: 'auto',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
    flexShrink: 0,
  },
  // Results column: centered, capped for measure.
  main: {
    maxWidth: 880,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  summaryLine: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  // Compact-mode content-type chips (rail is hidden <=900px).
  chipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    paddingBlock: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-3)',
    borderRadius: 'var(--radius-full)',
    border: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    font: 'inherit',
    fontSize: 'var(--font-size-sm, 0.875rem)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  chipOn: {
    borderColor: 'var(--color-accent)',
    color: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    backgroundColor: 'light-dark(#EFF6FF, #16283E)',
  },
  // Hit-highlight mark — intentional amber pair, AA on both schemes.
  mark: {
    backgroundColor: 'light-dark(#FBE9A9, #4A3A12)',
    color: 'inherit',
    borderRadius: 3,
    paddingInline: 1,
  },
  // Best-match hero card internals.
  heroBody: {
    display: 'flex',
    gap: 'var(--spacing-5)',
    alignItems: 'stretch',
  },
  heroPreview: {
    width: 200,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'light-dark(#FFFFFF, #1C1E24)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    overflow: 'hidden',
  },
  heroPreviewTitle: {
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.35,
    color: 'var(--color-text-primary, inherit)',
  },
  heroPreviewLine: {
    fontSize: 10,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
  },
  heroPreviewRule: {
    height: 1,
    backgroundColor: 'var(--color-border)',
    marginBlock: 2,
  },
  heroMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  // Result groups: plain sections; rows are bordered list rows, not Cards.
  groupHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  groupList: {
    display: 'flex',
    flexDirection: 'column',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    overflow: 'hidden',
  },
  resultRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-4)',
    borderBlockStart: 'var(--border-width) solid var(--color-border)',
  },
  resultRowFirst: {
    borderBlockStart: 'none',
  },
  appChip: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-control, 6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBlockStart: 2,
  },
  resultTitleLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  titleButton: {
    border: 'none',
    background: 'transparent',
    padding: 0,
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    fontWeight: 600,
  },
  snippetClamp: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    minWidth: 0,
  },
  // Right-hand slot: facepile (files) or meeting actions.
  rowEnd: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexShrink: 0,
    marginInlineStart: 'auto',
    paddingInlineStart: 'var(--spacing-3)',
  },
  showMoreRow: {
    borderBlockStart: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-2) var(--spacing-4)',
  },
  // Related-people rail: fixed-width tiles, deliberate overflow-x scroll
  // (no mask fades — footgun #11).
  peopleRail: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    overflowX: 'auto',
    paddingBlockEnd: 'var(--spacing-2)',
  },
  personCard: {
    width: 172,
    flexShrink: 0,
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-4)',
    flexWrap: 'wrap',
    width: '100%',
  },
  tipItem: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-1)',
    whiteSpace: 'nowrap',
  },
  tipOperator: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 'var(--font-size-xs, 0.75rem)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-control, 6px)',
    paddingInline: 'var(--spacing-1)',
    paddingBlock: 1,
    whiteSpace: 'nowrap',
  },
  tabularNums: {
    fontVariantNumeric: 'tabular-nums',
  },
  emptyWrap: {
    paddingBlock: 'var(--spacing-8)',
  },
};

// ---------------------------------------------------------------------------
// HIT HIGHLIGHTING — the executed query's terms, marked wherever they land.
// Regex hoisted to module level; split with a capture group keeps matches at
// odd indices, so no per-part re-testing is needed.
// ---------------------------------------------------------------------------

const HIGHLIGHT_RE = /(atlas|launch(?:es|ed|ing)?)/gi;

function Highlighted({text}: {text: string}): ReactNode {
  const parts = text.split(HIGHLIGHT_RE);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          // eslint-disable-next-line react/no-array-index-key
          <mark key={index} style={styles.mark}>
            {part}
          </mark>
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// FACET DERIVATION — every count on the page comes out of these helpers, so
// type counts, owner counts, date buckets, group headers, and the summary
// total can never drift apart. Each facet's counts are computed against the
// OTHER two facets' selections (standard faceted-search semantics), which
// keeps each facet column summing to the total it filters.
// ---------------------------------------------------------------------------

interface FacetState {
  /** Checked content types; all checked = no type filter. */
  types: ReadonlySet<ResultApp>;
  /** Checked owners; empty = no owner filter. */
  owners: ReadonlySet<string>;
  dateBucket: DateBucket;
}

function matchesDate(result: SearchResult, bucket: DateBucket): boolean {
  const spec = DATE_BUCKETS.find(entry => entry.value === bucket);
  return spec === undefined ? true : result.daysAgo <= spec.maxDaysAgo;
}

function matchesOwners(
  result: SearchResult,
  owners: ReadonlySet<string>,
): boolean {
  return owners.size === 0 || owners.has(result.owner);
}

function matchesTypes(
  result: SearchResult,
  types: ReadonlySet<ResultApp>,
): boolean {
  return types.has(result.app);
}

/** Type-facet counts: owner + date filters applied, type ignored. */
function countByType(facets: FacetState): Map<ResultApp, number> {
  const counts = new Map<ResultApp, number>();
  for (const result of ALL_RESULTS) {
    if (
      matchesOwners(result, facets.owners) &&
      matchesDate(result, facets.dateBucket)
    ) {
      counts.set(result.app, (counts.get(result.app) ?? 0) + 1);
    }
  }
  return counts;
}

/** Owner-facet counts: type + date filters applied, owner ignored. */
function countByOwner(facets: FacetState): Map<string, number> {
  const counts = new Map<string, number>();
  for (const result of ALL_RESULTS) {
    if (
      matchesTypes(result, facets.types) &&
      matchesDate(result, facets.dateBucket)
    ) {
      counts.set(result.owner, (counts.get(result.owner) ?? 0) + 1);
    }
  }
  return counts;
}

/** Date-facet counts: type + owner filters applied, cumulative buckets. */
function countByDate(facets: FacetState): Map<DateBucket, number> {
  const counts = new Map<DateBucket, number>();
  for (const bucket of DATE_BUCKETS) {
    let total = 0;
    for (const result of ALL_RESULTS) {
      if (
        matchesTypes(result, facets.types) &&
        matchesOwners(result, facets.owners) &&
        result.daysAgo <= bucket.maxDaysAgo
      ) {
        total += 1;
      }
    }
    counts.set(bucket.value, total);
  }
  return counts;
}

/** All three facets applied — the rows actually shown. */
function filterResults(facets: FacetState): SearchResult[] {
  return ALL_RESULTS.filter(
    result =>
      matchesTypes(result, facets.types) &&
      matchesOwners(result, facets.owners) &&
      matchesDate(result, facets.dateBucket),
  );
}

// ---------------------------------------------------------------------------
// RESULT ROW — app glyph chip, hit-highlighted title + snippet, owner +
// modified metadata, and either a shared facepile (files / mail) or the
// meeting action cluster (Join / In call / View recap).
// ---------------------------------------------------------------------------

function MeetingActions({
  result,
  isJoined,
  onJoin,
}: {
  result: SearchResult;
  isJoined: boolean;
  onJoin: (id: string) => void;
}): ReactNode {
  const meeting = result.meeting;
  if (meeting === undefined) {
    return null;
  }
  if (meeting.state === 'past') {
    return (
      <VStack gap={1} hAlign="end">
        <Button label="View recap" size="sm" variant="secondary" />
        {meeting.recordingLabel !== undefined ? (
          <Text type="supporting" color="secondary">
            <span style={styles.tabularNums}>{meeting.recordingLabel}</span>
          </Text>
        ) : null}
      </VStack>
    );
  }
  if (meeting.state === 'live') {
    return (
      <HStack gap={2} vAlign="center">
        <Badge label="Live" variant="success" />
        <Button
          label={isJoined ? 'In call' : 'Join'}
          size="sm"
          variant={isJoined ? 'secondary' : 'primary'}
          icon={<Icon icon={PlayIcon} size="sm" />}
          onClick={() => onJoin(result.id)}
        />
      </HStack>
    );
  }
  return <Button label="Join" size="sm" variant="secondary" />;
}

function ResultRow({
  result,
  isFirst,
  showFacepile,
  isJoined,
  onJoin,
}: {
  result: SearchResult;
  isFirst: boolean;
  /** Facepiles hide below 640px so metadata never clips. */
  showFacepile: boolean;
  isJoined: boolean;
  onJoin: (id: string) => void;
}): ReactNode {
  const tint = APP_TINT[result.app];
  const meeting = result.meeting;
  const facepileNames =
    meeting !== undefined ? meeting.attendees : result.sharedWith ?? [];
  return (
    <div
      style={
        isFirst ? {...styles.resultRow, ...styles.resultRowFirst} : styles.resultRow
      }>
      <span style={{...styles.appChip, backgroundColor: tint.wash}}>
        <span style={{color: tint.fg, display: 'flex'}}>
          <Icon icon={APP_ICON[result.app]} size="sm" color="inherit" />
        </span>
      </span>
      <StackItem size="fill">
        <VStack gap={1}>
          <div style={styles.resultTitleLine}>
            <button
              type="button"
              style={styles.titleButton}
              aria-label={\`Open \${result.title}\`}>
              <Text as="span">
                <span style={{fontWeight: 600}}>
                  <Highlighted text={result.title} />
                </span>
              </Text>
            </button>
            {meeting !== undefined ? (
              <Text type="supporting" color="secondary">
                <span style={styles.tabularNums}>{meeting.timeLabel}</span>
              </Text>
            ) : null}
          </div>
          <Text type="supporting" color="secondary">
            <span style={styles.snippetClamp}>
              <Highlighted text={result.snippet} />
            </span>
          </Text>
          <div style={styles.metaRow}>
            <Avatar name={result.owner} size="xsmall" />
            <Text type="supporting" color="secondary">
              {result.owner === CURRENT_USER ? 'You' : result.owner}
              {' · '}
              <span style={styles.tabularNums}>{result.whenLabel}</span>
              {result.detail !== undefined ? \` · \${result.detail}\` : ''}
            </Text>
          </div>
        </VStack>
      </StackItem>
      <div style={styles.rowEnd}>
        {meeting !== undefined ? (
          <>
            {showFacepile ? (
              <Tooltip content={facepileNames.join(', ')}>
                <AvatarGroup
                  size="xsmall"
                  aria-label={\`\${result.title} attendees\`}>
                  {facepileNames.map(name => (
                    <Avatar key={name} name={name} size="xsmall" />
                  ))}
                </AvatarGroup>
              </Tooltip>
            ) : null}
            {showFacepile && meeting.overflowCount > 0 ? (
              <Text type="supporting" color="secondary">
                +{meeting.overflowCount}
              </Text>
            ) : null}
            <MeetingActions result={result} isJoined={isJoined} onJoin={onJoin} />
          </>
        ) : showFacepile && facepileNames.length > 0 ? (
          <Tooltip content={\`Shared with \${facepileNames.join(', ')}\`}>
            <AvatarGroup
              size="xsmall"
              aria-label={\`\${result.title} shared with \${facepileNames.length} people\`}>
              {facepileNames.map(name => (
                <Avatar key={name} name={name} size="xsmall" />
              ))}
            </AvatarGroup>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BEST MATCH HERO — the one Card on the page: faux doc-page preview lines
// (typographic, non-editable) beside the hit-highlighted excerpt + actions.
// ---------------------------------------------------------------------------

function BestMatchHero({
  result,
  showPreview,
}: {
  result: SearchResult;
  showPreview: boolean;
}): ReactNode {
  const tint = APP_TINT[result.app];
  return (
    <Card padding={5}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center">
          <Badge label="Best match" variant="info" />
          <Text type="supporting" color="secondary">
            Top result in {APP_NAME[result.app]}
          </Text>
        </HStack>
        <div style={styles.heroBody}>
          {showPreview ? (
            <div style={styles.heroPreview} aria-hidden>
              {HERO_PREVIEW_LINES.map((line, index) => (
                <div key={line}>
                  <div
                    style={
                      index === 0 ? styles.heroPreviewTitle : styles.heroPreviewLine
                    }>
                    <Highlighted text={line} />
                  </div>
                  {index === 0 ? <div style={styles.heroPreviewRule} /> : null}
                </div>
              ))}
            </div>
          ) : null}
          <StackItem size="fill">
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <span style={{...styles.appChip, backgroundColor: tint.wash}}>
                  <span style={{color: tint.fg, display: 'flex'}}>
                    <Icon icon={APP_ICON[result.app]} size="sm" color="inherit" />
                  </span>
                </span>
                <Heading level={2}>
                  <Highlighted text={result.title} />
                </Heading>
              </HStack>
              <Text color="secondary">
                <Highlighted text={result.snippet} />
              </Text>
              <div style={styles.heroMetaRow}>
                <Avatar name={result.owner} size="xsmall" />
                <Text type="supporting" color="secondary">
                  {result.owner}
                  {' · '}
                  <span style={styles.tabularNums}>{result.whenLabel}</span>
                  {result.detail !== undefined ? \` · \${result.detail}\` : ''}
                </Text>
                {result.sharedWith !== undefined ? (
                  <AvatarGroup
                    size="xsmall"
                    aria-label={\`\${result.title} shared with \${result.sharedWith.length} people\`}>
                    {result.sharedWith.map(name => (
                      <Avatar key={name} name={name} size="xsmall" />
                    ))}
                  </AvatarGroup>
                ) : null}
              </div>
              <HStack gap={2} vAlign="center">
                <Button label="Open" size="sm" variant="primary" />
                <Button
                  label="Share"
                  size="sm"
                  variant="secondary"
                  icon={<Icon icon={Share2Icon} size="sm" />}
                />
              </HStack>
            </VStack>
          </StackItem>
        </div>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// RESULT GROUP — per-app section: heading with the facet count, up to three
// collapsed rows, and a "Show N more" expander that keeps the header count
// equal to the type-facet number at all times.
// ---------------------------------------------------------------------------

const GROUP_COLLAPSED_ROWS = 3;

function ResultGroup({
  app,
  rows,
  facetCount,
  heroExcluded,
  isExpanded,
  onToggleExpand,
  showFacepile,
  joinedMeetingId,
  onJoin,
}: {
  app: ResultApp;
  /** Rows to render (hero already excluded for Docs). */
  rows: readonly SearchResult[];
  /** The type-facet count for this app under the current owner/date filters. */
  facetCount: number;
  /** True when the best-match hero (a Docs row) sits above this group. */
  heroExcluded: boolean;
  isExpanded: boolean;
  onToggleExpand: (app: ResultApp) => void;
  showFacepile: boolean;
  joinedMeetingId: string | null;
  onJoin: (id: string) => void;
}): ReactNode {
  if (facetCount === 0) {
    return null;
  }
  const visibleRows = isExpanded ? rows : rows.slice(0, GROUP_COLLAPSED_ROWS);
  const hiddenCount = rows.length - visibleRows.length;
  const tint = APP_TINT[app];
  return (
    <section aria-label={\`\${APP_NAME[app]} results\`}>
      <VStack gap={3}>
        <div style={styles.groupHead}>
          <span style={{color: tint.fg, display: 'flex'}}>
            <Icon icon={APP_ICON[app]} size="sm" color="inherit" />
          </span>
          <Heading level={3} accessibilityLevel={2}>
            {APP_NAME[app]}
          </Heading>
          <Badge label={\`\${facetCount}\`} variant="neutral" />
          {heroExcluded ? (
            <Text type="supporting" color="secondary">
              best match shown above
            </Text>
          ) : null}
        </div>
        {rows.length > 0 ? (
          <div style={styles.groupList}>
            {visibleRows.map((result, index) => (
              <ResultRow
                key={result.id}
                result={result}
                isFirst={index === 0}
                showFacepile={showFacepile}
                isJoined={joinedMeetingId === result.id}
                onJoin={onJoin}
              />
            ))}
            {hiddenCount > 0 || isExpanded ? (
              <div style={styles.showMoreRow}>
                <Button
                  label={
                    isExpanded
                      ? 'Show fewer'
                      : \`Show \${hiddenCount} more in \${APP_NAME[app]}\`
                  }
                  size="sm"
                  variant="ghost"
                  icon={
                    <Icon
                      icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                      size="sm"
                    />
                  }
                  onClick={() => onToggleExpand(app)}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// RELATED PEOPLE — avatar tiles with role + matching-result count; counts
// are the unfiltered owner tallies, so they always sum to 26.
// ---------------------------------------------------------------------------

function PersonCard({
  name,
  role,
  resultCount,
}: {
  name: string;
  role: string;
  resultCount: number;
}): ReactNode {
  return (
    <div style={styles.personCard}>
      <ClickableCard
        label={\`See \${name}'s \${resultCount} results for \${EXECUTED_QUERY}\`}
        onClick={() => {}}
        padding={4}>
        <VStack gap={2} hAlign="center">
          <Avatar name={name} size={64} />
          <VStack gap={0} hAlign="center">
            <Text weight="bold">{name === CURRENT_USER ? 'You' : name}</Text>
            <Text type="supporting" color="secondary" justify="center">
              {role}
            </Text>
          </VStack>
          <Badge label={\`\${resultCount} results\`} variant="neutral" />
        </VStack>
      </ClickableCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FILTER RAIL — content-type checkboxes, owner facet, date facet. Counts are
// passed in pre-derived so the rail is a pure view of the facet math.
// ---------------------------------------------------------------------------

function FilterRail({
  facets,
  typeCounts,
  ownerCounts,
  dateCounts,
  hasActiveFilters,
  onToggleType,
  onToggleOwner,
  onDateChange,
  onReset,
}: {
  facets: FacetState;
  typeCounts: ReadonlyMap<ResultApp, number>;
  ownerCounts: ReadonlyMap<string, number>;
  dateCounts: ReadonlyMap<DateBucket, number>;
  hasActiveFilters: boolean;
  onToggleType: (app: ResultApp) => void;
  onToggleOwner: (owner: string) => void;
  onDateChange: (bucket: DateBucket) => void;
  onReset: () => void;
}): ReactNode {
  return (
    <div style={styles.railScroll}>
      <HStack gap={2} vAlign="center">
        <Icon icon={FilterIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Heading level={2}>Filters</Heading>
        </StackItem>
        {hasActiveFilters ? (
          <Button
            label="Reset"
            size="sm"
            variant="ghost"
            icon={<Icon icon={RotateCcwIcon} size="sm" />}
            onClick={onReset}
          />
        ) : null}
      </HStack>

      <VStack gap={2}>
        <Text type="supporting" color="secondary" weight="semibold">
          Content type
        </Text>
        {APP_ORDER.map(app => (
          <div key={app} style={styles.facetRow}>
            <StackItem size="fill">
              <CheckboxInput
                label={APP_NAME[app]}
                size="sm"
                value={facets.types.has(app)}
                onChange={() => onToggleType(app)}
              />
            </StackItem>
            <span style={styles.facetCount}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {typeCounts.get(app) ?? 0}
              </Text>
            </span>
          </div>
        ))}
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Text type="supporting" color="secondary" weight="semibold">
          Owner
        </Text>
        {PEOPLE_ORDER.map(owner => (
          <div key={owner} style={styles.facetRow}>
            <StackItem size="fill">
              <CheckboxInput
                label={owner === CURRENT_USER ? \`\${owner} (you)\` : owner}
                size="sm"
                value={facets.owners.has(owner)}
                onChange={() => onToggleOwner(owner)}
              />
            </StackItem>
            <span style={styles.facetCount}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {ownerCounts.get(owner) ?? 0}
              </Text>
            </span>
          </div>
        ))}
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Text type="supporting" color="secondary" weight="semibold">
          Last modified
        </Text>
        <RadioList
          label="Last modified"
          isLabelHidden
          value={facets.dateBucket}
          onChange={value => onDateChange(value as DateBucket)}>
          {DATE_BUCKETS.map(bucket => (
            <RadioListItem
              key={bucket.value}
              label={\`\${bucket.label} (\${dateCounts.get(bucket.value) ?? 0})\`}
              value={bucket.value}
            />
          ))}
        </RadioList>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const ALL_TYPES: ReadonlySet<ResultApp> = new Set(APP_ORDER);

/** Unfiltered per-owner tallies for the related-people rail (sum = 26). */
const OWNER_TOTALS: ReadonlyMap<string, number> = ALL_RESULTS.reduce(
  (map, result) => map.set(result.owner, (map.get(result.owner) ?? 0) + 1),
  new Map<string, number>(),
);

export default function OfficeUniversalSearchTemplate() {
  // The editable draft in the search box; results stay pinned to the
  // EXECUTED query (real search pages update on submit, not keystroke).
  const [queryDraft, setQueryDraft] = useState(EXECUTED_QUERY);

  const [checkedTypes, setCheckedTypes] = useState<ReadonlySet<ResultApp>>(ALL_TYPES);
  const [checkedOwners, setCheckedOwners] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [dateBucket, setDateBucket] = useState<DateBucket>('any');
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<ResultApp>>(
    new Set(),
  );
  const [joinedMeetingId, setJoinedMeetingId] = useState<string | null>(null);

  // Responsive contract: <=900px hides the filter rail (type facet becomes
  // a chip row above the results); <=640px hides facepiles and hero art.
  const isNarrow = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  const facets: FacetState = useMemo(
    () => ({types: checkedTypes, owners: checkedOwners, dateBucket}),
    [checkedTypes, checkedOwners, dateBucket],
  );

  const typeCounts = useMemo(() => countByType(facets), [facets]);
  const ownerCounts = useMemo(() => countByOwner(facets), [facets]);
  const dateCounts = useMemo(() => countByDate(facets), [facets]);
  const filtered = useMemo(() => filterResults(facets), [facets]);

  const hasActiveFilters =
    checkedTypes.size !== APP_ORDER.length ||
    checkedOwners.size > 0 ||
    dateBucket !== 'any';

  const heroResult =
    filtered.find(result => result.id === BEST_MATCH_ID) ?? null;

  const toggleType = (app: ResultApp) => {
    setCheckedTypes(previous => {
      const next = new Set(previous);
      if (next.has(app)) {
        next.delete(app);
      } else {
        next.add(app);
      }
      return next;
    });
  };

  const toggleOwner = (owner: string) => {
    setCheckedOwners(previous => {
      const next = new Set(previous);
      if (next.has(owner)) {
        next.delete(owner);
      } else {
        next.add(owner);
      }
      return next;
    });
  };

  const toggleGroup = (app: ResultApp) => {
    setExpandedGroups(previous => {
      const next = new Set(previous);
      if (next.has(app)) {
        next.delete(app);
      } else {
        next.add(app);
      }
      return next;
    });
  };

  const resetFilters = () => {
    setCheckedTypes(ALL_TYPES);
    setCheckedOwners(new Set());
    setDateBucket('any');
  };

  const filterRail = (
    <FilterRail
      facets={facets}
      typeCounts={typeCounts}
      ownerCounts={ownerCounts}
      dateCounts={dateCounts}
      hasActiveFilters={hasActiveFilters}
      onToggleType={toggleType}
      onToggleOwner={toggleOwner}
      onDateChange={setDateBucket}
      onReset={resetFilters}
    />
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div style={styles.navRow}>
              <div style={styles.brand}>
                <span style={styles.brandGlyph}>
                  <Icon icon={LayoutGridIcon} size="sm" color="inherit" />
                </span>
                {!isNarrow ? <Text weight="bold">Kestrel Office</Text> : null}
              </div>
              <div style={styles.searchWrap}>
                <TextInput
                  label="Search Kestrel Office"
                  isLabelHidden
                  width="100%"
                  placeholder="Search Docs, Sheets, Slides, Meet, Mail, and people"
                  startIcon={<Icon icon={SearchIcon} size="sm" />}
                  value={queryDraft}
                  onChange={setQueryDraft}
                  hasClear
                />
              </div>
              <div style={styles.navActions}>
                {!isNarrow ? (
                  <HStack gap={1} vAlign="center">
                    <Kbd keys="mod+k" />
                  </HStack>
                ) : null}
                <Tooltip content={\`Signed in as \${CURRENT_USER}\`}>
                  <Avatar name={CURRENT_USER} size="small" />
                </Tooltip>
              </div>
            </div>
          </LayoutHeader>
        }
        start={
          isNarrow ? undefined : (
            <LayoutPanel width={280} padding={0} hasDivider label="Search filters">
              {filterRail}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent>
            <div style={styles.main}>
              {isNarrow ? (
                <div style={styles.chipRow} role="group" aria-label="Content type">
                  {APP_ORDER.map(app => {
                    const isOn = checkedTypes.has(app);
                    return (
                      <button
                        key={app}
                        type="button"
                        aria-pressed={isOn}
                        style={isOn ? {...styles.chip, ...styles.chipOn} : styles.chip}
                        onClick={() => toggleType(app)}>
                        <Icon icon={APP_ICON[app]} size="sm" color="inherit" />
                        {APP_NAME[app]}
                        <span style={styles.tabularNums}>
                          {typeCounts.get(app) ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div style={styles.summaryLine}>
                <Heading level={1}>
                  <span style={styles.tabularNums}>{filtered.length}</span>
                  {' results for '}
                  <span style={{fontStyle: 'italic'}}>
                    &ldquo;{EXECUTED_QUERY}&rdquo;
                  </span>
                </Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  0.32 s · Kestrel Labs workspace
                </Text>
              </div>

              {filtered.length === 0 ? (
                <div style={styles.emptyWrap}>
                  <EmptyState
                    title="No results match your filters"
                    description={\`All 26 hits for "\${EXECUTED_QUERY}" are hidden by the current content-type, owner, or date filters.\`}
                    icon={<Icon icon={SearchIcon} size="lg" />}
                    actions={
                      <Button
                        label="Reset filters"
                        variant="secondary"
                        icon={<Icon icon={RotateCcwIcon} size="sm" />}
                        onClick={resetFilters}
                      />
                    }
                  />
                </div>
              ) : (
                <>
                  {heroResult !== null ? (
                    <BestMatchHero result={heroResult} showPreview={!isPhone} />
                  ) : null}

                  {APP_ORDER.map(app => {
                    const facetCount = checkedTypes.has(app)
                      ? typeCounts.get(app) ?? 0
                      : 0;
                    const heroExcluded =
                      app === 'docs' && heroResult !== null;
                    const rows = filtered.filter(
                      result =>
                        result.app === app &&
                        (!heroExcluded || result.id !== BEST_MATCH_ID),
                    );
                    return (
                      <ResultGroup
                        key={app}
                        app={app}
                        rows={rows}
                        facetCount={facetCount}
                        heroExcluded={heroExcluded}
                        isExpanded={expandedGroups.has(app)}
                        onToggleExpand={toggleGroup}
                        showFacepile={!isPhone}
                        joinedMeetingId={joinedMeetingId}
                        onJoin={setJoinedMeetingId}
                      />
                    );
                  })}

                  <section aria-label="Related people">
                    <VStack gap={3}>
                      <div style={styles.groupHead}>
                        <Icon icon={UsersIcon} size="sm" color="secondary" />
                        <Heading level={3} accessibilityLevel={2}>
                          People related to &ldquo;{EXECUTED_QUERY}&rdquo;
                        </Heading>
                      </div>
                      <div style={styles.peopleRail}>
                        {PEOPLE_ORDER.map(name => (
                          <PersonCard
                            key={name}
                            name={name}
                            role={PEOPLE_ROLES[name]}
                            resultCount={OWNER_TOTALS.get(name) ?? 0}
                          />
                        ))}
                      </div>
                    </VStack>
                  </section>
                </>
              )}
            </div>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <div style={styles.footerRow}>
              <HStack gap={1} vAlign="center">
                <Icon icon={LightbulbIcon} size="sm" color="secondary" />
                <Text type="supporting" color="secondary" weight="semibold">
                  Search tips
                </Text>
              </HStack>
              {SEARCH_TIPS.map(tip => (
                <span key={tip.operator} style={styles.tipItem}>
                  <span style={styles.tipOperator}>{tip.operator}</span>
                  <Text type="supporting" color="secondary">
                    {tip.hint}
                  </Text>
                </span>
              ))}
              {!isNarrow ? (
                <StackItem size="fill">
                  <HStack gap={1} vAlign="center" hAlign="end">
                    <Kbd keys="/" />
                    <Text type="supporting" color="secondary">
                      focuses search
                    </Text>
                  </HStack>
                </StackItem>
              ) : null}
            </div>
          </LayoutFooter>
        }
      />
    </div>
  );
}
`;export{e as default};