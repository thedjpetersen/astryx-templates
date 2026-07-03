// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one Kestrel Labs document — 'Atlas Q3
 *   Launch Plan' — with 14 saved versions across 5 day groups between
 *   2026-08-28 and 2026-09-18: 5 named/starred versions and 9 autosaves,
 *   each carrying fixed time labels, 1-2 authors from the Kestrel roster
 *   (Priya Raman, Marcus Webb, Sofia Ortiz, Jonah Fields, Dana Whitfield),
 *   +/- word deltas, and a content snapshot authored as text/added/removed
 *   segment runs; autosaves inside a burst share the burst's landing
 *   snapshot)
 * @output Document VERSION HISTORY surface: a header (doc icon + title
 *   Heading + 'Version history' note + live version-count Badge + Back to
 *   document Button), a right 320px version rail listing versions grouped by
 *   day — named versions starred, surplus autosaves collapsed behind a
 *   per-day 'Show N more autosaves' toggle, every row carrying an author
 *   facepile (AvatarGroup) and a change-size sparkbar on one shared
 *   px-per-word scale — and a main canvas rendering the selected version as
 *   a STATIC light-locked paper preview with added (green wash) and removed
 *   (red strike) highlight spans, framed by a toolbar (version name +
 *   inline-rename pencil -> TextInput, Show-changes Switch, +412/-168 words
 *   diff-stats strip) and a floating sticky 'Restore this version' bar on
 *   any non-current selection. Selecting a rail row swaps the canvas, stats,
 *   and restore bar; toggling Show changes settles the paper to clean prose;
 *   renaming an autosave promotes it to a starred named version; Restore
 *   prepends a new current version ('Restored: ...') at the fixed literal
 *   time Sep 18, 4:12 PM and selects it
 * @position Page template; emitted by `astryx template doc-version-history`
 *
 * Frame: root div 100dvh wrapping Layout height="fill". LayoutHeader carries
 * the doc identity row; LayoutContent (padding 0) is a muted backdrop
 * centering a 760px-max paper column with the sticky restore bar floating at
 * the scroller's bottom edge; LayoutPanel end 320 hosts the scrolling
 * version rail. The paper is a NON-EDITABLE preview by design — the real
 * word-processor canvas lives in astryx-editor; all interactivity here is
 * the surrounding version surface. Choose over doc-suggestion-review when
 * the job is browsing and restoring SAVED SNAPSHOTS of a document, not
 * accepting/rejecting live tracked-change suggestions.
 *
 * Responsive contract:
 * - >960px: header | paper canvas (fill, backdrop scrolls vertically) |
 *   version rail 320 (fixed, scrolls vertically). Only the backdrop and
 *   rail scroll internally.
 * - <=960px: the rail leaves the right edge and stacks below the paper as a
 *   full-width section; the column flows at natural height and LayoutContent
 *   scrolls the page as one surface. The restore bar stays sticky to the
 *   scrollport bottom while the backdrop is in view.
 * - <=640px: the header drops the 'Version history · Kestrel Labs Docs'
 *   note; the canvas toolbar wraps; rail rows keep their facepile but drop
 *   the sparkbar so time + name never truncate; restore Buttons grow to md.
 * - Header and toolbar rows are wrap="wrap"; the paper column is width:100%
 *   with maxWidth 760 over a padded backdrop, so nothing overflows at 375px.
 *
 * Container policy (version-browser archetype): frame-first rows and
 * panels; rail rows are dense list rows (button resets), not Cards. The
 * only Card on the page is the floating restore bar — a genuine floating
 * composer per the mail-compose policy.
 *
 * Color policy: the paper canvas is scheme-locked light
 * (colorScheme:'light') so it reads as printed paper in both schemes;
 * PAPER_* literals and the added/removed span washes/inks stay raw hex on
 * that locked surface — tokens would flip them in dark mode and break the
 * paper metaphor. On app chrome (diff-stats chips, sparkbars, star glyphs)
 * the added/removed/star accents are light-dark() pairs whose dark side
 * shifts to the lighter 400-weight hue. Everything else is token-pure.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

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
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  FileClockIcon,
  PencilIcon,
  RotateCcwIcon,
  StarIcon,
  XIcon,
} from 'lucide-react';

// ============= PAPER PAINT CONSTANTS =============
// Scheme-locked surface (see "Color policy" above): the preview is "paper" —
// literal light colors locked with colorScheme:'light'. Do not tokenize.

const PAPER_BG = '#FFFFFF';
const PAPER_TEXT = '#1F2A37';
const PAPER_MUTED = '#6B7280';
const PAPER_RULE = '#E5E7EB';

// Diff inks. *_PAPER values paint only on the locked paper (literal); the
// *_CHROME values also color app chrome, so they are light-dark() pairs.
const ADD_BG_PAPER = '#DCF3E2';
const ADD_INK_PAPER = '#0A5C28';
const DEL_BG_PAPER = '#FBE7E7';
const DEL_INK_PAPER = '#9B1C1C';
const ADD_CHROME = 'var(--color-data-categorical-green,  light-dark(#0B991F, #34C759))';
const DEL_CHROME = 'light-dark(#C81E1E, #F87171)';
const ADD_WASH_CHROME = 'light-dark(rgba(11,153,31,0.12), rgba(52,199,89,0.18))';
const DEL_WASH_CHROME = 'light-dark(rgba(200,30,30,0.10), rgba(248,113,113,0.16))';
const STAR_CHROME = 'light-dark(#B45309, #E0A64B)';

// Change-size sparkbar: ONE shared px-per-word scale for every row (64px
// track, saturating at 800 words added+removed; nonzero sides paint >=2px).
const SPARK_TRACK_PX = 64;
const SPARK_SATURATE_WORDS = 800;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  fill: {height: '100%', minHeight: 0},
  // Muted backdrop; the paper column centers and the backdrop scrolls.
  backdrop: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
  },
  backdropStacked: {
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
  },
  paperColumn: {
    width: '100%',
    maxWidth: 760,
    marginInline: 'auto',
  },
  // The document surface: white paper, light-locked so diff inks hold.
  paper: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    padding: 'clamp(24px, 6vw, 56px)',
  },
  docTitle: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.015em',
    margin: 0,
  },
  docByline: {
    fontSize: 14,
    color: PAPER_MUTED,
    marginTop: 6,
  },
  docRule: {
    border: 'none',
    borderTop: `1px solid ${PAPER_RULE}`,
    margin: '20px 0 24px',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.4,
    margin: '26px 0 10px',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 1.8,
    margin: '0 0 16px',
    overflowWrap: 'break-word',
  },
  addedSpan: {
    backgroundColor: ADD_BG_PAPER,
    color: ADD_INK_PAPER,
    borderRadius: 3,
    paddingInline: 1,
    textDecoration: 'underline',
    textDecorationThickness: 2,
    textUnderlineOffset: 3,
    textDecorationColor: ADD_INK_PAPER,
    fontStyle: 'normal',
  },
  removedSpan: {
    backgroundColor: DEL_BG_PAPER,
    color: DEL_INK_PAPER,
    borderRadius: 3,
    paddingInline: 1,
    textDecoration: 'line-through',
    textDecorationThickness: 2,
    textDecorationColor: DEL_INK_PAPER,
  },
  // Canvas toolbar row above the paper (version identity + compare + stats).
  toolbar: {
    width: '100%',
    maxWidth: 760,
    marginInline: 'auto',
    marginBottom: 'var(--spacing-4)',
  },
  statChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 'var(--radius-container)',
    padding: '2px 8px',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statAdd: {backgroundColor: ADD_WASH_CHROME, color: ADD_CHROME},
  statDel: {backgroundColor: DEL_WASH_CHROME, color: DEL_CHROME},
  // Floating restore bar: sticky to the backdrop scrollport's bottom edge.
  restoreDock: {
    position: 'sticky',
    insetBlockEnd: 'var(--spacing-4)',
    marginTop: 'var(--spacing-5)',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  restoreCard: {
    pointerEvents: 'auto',
    boxShadow: 'var(--shadow-high)',
    maxWidth: 640,
  },
  // Version rail: fixed 320px, only the group list scrolls.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  railStacked: {
    padding: 'var(--spacing-3)',
  },
  dayHeading: {
    padding: 'var(--spacing-2) var(--spacing-2) 0',
  },
  // Dense list rows (button resets), not Cards — see Container policy.
  versionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    width: '100%',
    padding: 'var(--spacing-2)',
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    borderRadius: 'var(--radius-container)',
  },
  versionRowActive: {
    backgroundColor: 'var(--color-background-muted)',
    // Inset so the selection ring never bleeds onto neighboring rows.
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  rowGlyph: {
    flexShrink: 0,
    display: 'inline-flex',
    width: 20,
    justifyContent: 'center',
    // Rows are two lines tall; keep the glyph on the title line's center.
    paddingTop: 2,
  },
  rowTime: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  sparkTrack: {
    width: SPARK_TRACK_PX,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    display: 'flex',
    flexShrink: 0,
  },
  sparkAdd: {height: '100%', backgroundColor: ADD_CHROME},
  sparkDel: {height: '100%', backgroundColor: DEL_CHROME},
  renameInputWrap: {minWidth: 220, flex: '1 1 220px', maxWidth: 380},
};

// ============= PEOPLE =============
// Kestrel Labs roster — names, roles, and initials are shared across the
// whole Office Suite; never rename or re-role between templates.

type PersonId = 'priya' | 'marcus' | 'sofia' | 'jonah' | 'dana';

interface Person {
  id: PersonId;
  name: string;
  role: string;
}

const PEOPLE: Person[] = [
  {id: 'priya', name: 'Priya Raman', role: 'Program lead'},
  {id: 'marcus', name: 'Marcus Webb', role: 'Engineering lead'},
  {id: 'sofia', name: 'Sofia Ortiz', role: 'Support lead'},
  {id: 'jonah', name: 'Jonah Fields', role: 'Support operations'},
  {id: 'dana', name: 'Dana Whitfield', role: 'Launch producer'},
];

const PERSON_BY_ID = Object.fromEntries(
  PEOPLE.map(person => [person.id, person]),
) as Record<PersonId, Person>;

const CURRENT_USER = PERSON_BY_ID.dana;

const DOC_TITLE = 'Atlas Q3 Launch Plan';
const DOC_BYLINE = 'Kestrel Labs · Atlas Q3 program · Owned by Priya Raman';
// Fixed literal stamp applied when Restore mints a new current version.
const RESTORE_DAY_KEY = '2026-09-18';
const RESTORE_DAY_LABEL = 'Thursday, September 18';
const RESTORE_TIME_LABEL = '4:12 PM';

// ============= DOCUMENT SNAPSHOTS =============
// Each named version (and the autosave burst that led to it) points at one
// content snapshot. A snapshot's added/removed segments describe the edits
// that version introduced relative to the PREVIOUS named version; the
// preview shows the document's opening sections, while the +/- word deltas
// in the fixtures cover the full document (the stats strip says so).

type Seg =
  | {t: 'text'; text: string}
  | {t: 'add'; text: string}
  | {t: 'del'; text: string};

interface Block {
  id: string;
  kind: 'heading' | 'para';
  segments: Seg[];
}

interface Snapshot {
  id: string;
  blocks: Block[];
}

// Compact fixture builders — they keep each snapshot readable as a diff script.
const tx = (text: string): Seg => ({t: 'text', text});
const ad = (text: string): Seg => ({t: 'add', text});
const de = (text: string): Seg => ({t: 'del', text});
const h = (id: string, text: string): Block => ({
  id,
  kind: 'heading',
  segments: [tx(text)],
});
const p = (id: string, ...segments: Seg[]): Block => ({
  id,
  kind: 'para',
  segments,
});

// --- Aug 28 · "Outline + goals" (baseline: nothing earlier to compare) ---
const SNAP_OUTLINE: Snapshot = {
  id: 'snap-outline',
  blocks: [
    h('out-ov-h', 'Overview'),
    p(
      'out-ov',
      tx(
        'Atlas ships to every Kestrel Labs workspace this quarter. This document is the plan of record for the launch: goals, milestones, scope, support readiness, and communications.',
      ),
    ),
    h('out-go-h', 'Goals'),
    p(
      'out-go',
      tx(
        'Adoption, reliability, and a support load we can absorb. Numbers to be agreed with Marcus.',
      ),
    ),
    h('out-mi-h', 'Milestones'),
    p(
      'out-mi',
      tx('Working backwards from a late-September GA. Dates to be confirmed.'),
    ),
    h('out-sc-h', 'Launch scope'),
    p(
      'out-sc',
      tx(
        'Core workspace, the importer, and the templates gallery. Cut list to be confirmed.',
      ),
    ),
    h('out-su-h', 'Support readiness'),
    p(
      'out-su',
      tx('Help center refresh plus launch-week staffing. Sofia to draft.'),
    ),
    h('out-co-h', 'Communications'),
    p('out-co', tx('Announcement post, customer email, in-app tour.')),
  ],
};

// --- Sep 4 · "First full draft" (diff vs the outline) ---
const SNAP_DRAFT: Snapshot = {
  id: 'snap-draft',
  blocks: [
    h('dra-ov-h', 'Overview'),
    p(
      'dra-ov',
      tx(
        'Atlas ships to every Kestrel Labs workspace this quarter. This document is the plan of record for the launch: goals, milestones, scope, support readiness, and communications.',
      ),
      ad(
        ' Owners are named per milestone and the plan is reviewed every Monday in the Atlas standup.',
      ),
    ),
    h('dra-go-h', 'Goals'),
    p(
      'dra-go',
      de(
        'Adoption, reliability, and a support load we can absorb. Numbers to be agreed with Marcus.',
      ),
      tx(' '),
      ad(
        'We are targeting 2,400 active workspaces in the first 30 days, a p95 import under five minutes, and a support contact rate below 4%.',
      ),
    ),
    h('dra-mi-h', 'Milestones'),
    p(
      'dra-mi',
      de(
        'Working backwards from a late-September GA. Dates to be confirmed.',
      ),
      tx(' '),
      ad(
        'Feature freeze lands August 21, the release candidate cuts September 8, and GA opens September 28 behind a staged rollout: 5% of workspaces on day one, 50% within the first week, then full availability. Importer v2 (dry-run mode plus row-level error reports) rides the same train.',
      ),
    ),
    h('dra-sc-h', 'Launch scope'),
    p(
      'dra-sc',
      tx('Core workspace, the importer, and the templates gallery.'),
      de(' Cut list to be confirmed.'),
      ad(
        ' Shared views join the launch build; everything ships behind the atlas-ga flag.',
      ),
    ),
    h('dra-su-h', 'Support readiness'),
    p(
      'dra-su',
      de('Help center refresh plus launch-week staffing. Sofia to draft.'),
      tx(' '),
      ad(
        'The help center refresh covers the launch surfaces and support adds two agents per shift during launch week. Escalation runbook to be rehearsed before GA.',
      ),
    ),
    h('dra-co-h', 'Communications'),
    p(
      'dra-co',
      tx('Announcement post, customer email, in-app tour.'),
      ad(
        ' All three are drafted two weeks ahead; social follows one day after launch to keep first-day channel load on email.',
      ),
    ),
  ],
};

// --- Sep 11 · "Scope cut: importer v2" (diff vs the first full draft) ---
const SNAP_SCOPECUT: Snapshot = {
  id: 'snap-scopecut',
  blocks: [
    h('cut-ov-h', 'Overview'),
    p(
      'cut-ov',
      tx(
        'Atlas ships to every Kestrel Labs workspace this quarter. This document is the plan of record for the launch: goals, milestones, scope, support readiness, and communications. Owners are named per milestone and the plan is reviewed every Monday in the Atlas standup.',
      ),
    ),
    h('cut-go-h', 'Goals'),
    p(
      'cut-go',
      tx(
        'We are targeting 2,400 active workspaces in the first 30 days, a p95 import under five minutes, and a support contact rate below 4%.',
      ),
    ),
    h('cut-mi-h', 'Milestones'),
    p(
      'cut-mi',
      tx(
        'Feature freeze lands August 21, the release candidate cuts September 8, and GA opens September 28 behind a staged rollout: 5% of workspaces on day one, 50% within the first week, then full availability.',
      ),
      de(
        ' Importer v2 (dry-run mode plus row-level error reports) rides the same train.',
      ),
      ad(
        ' Importer v2 moves to an October follow-up with its own flag and milestone review.',
      ),
    ),
    h('cut-sc-h', 'Launch scope'),
    p(
      'cut-sc',
      tx(
        'Core workspace, the importer, and the templates gallery. Shared views join the launch build; everything ships behind the atlas-ga flag.',
      ),
      ad(
        ' Importer v2 dry-run mode is out of the launch build (see Milestones).',
      ),
    ),
    h('cut-su-h', 'Support readiness'),
    p(
      'cut-su',
      tx(
        'The help center refresh covers the launch surfaces and support adds two agents per shift during launch week. Escalation runbook to be rehearsed before GA.',
      ),
    ),
    h('cut-co-h', 'Communications'),
    p(
      'cut-co',
      tx(
        'Announcement post, customer email, in-app tour. All three are drafted two weeks ahead; social follows one day after launch to keep first-day channel load on email.',
      ),
    ),
  ],
};

// --- Sep 16 · "Support plan rewrite" (diff vs the scope cut; the +412/-168
// headline version and the initial selection) ---
const SNAP_SUPPORT: Snapshot = {
  id: 'snap-support',
  blocks: [
    h('sup-ov-h', 'Overview'),
    p(
      'sup-ov',
      tx(
        'Atlas ships to every Kestrel Labs workspace this quarter. This document is the plan of record for the launch: goals, milestones, scope, support readiness, and communications. Owners are named per milestone and the plan is reviewed every Monday in the Atlas standup.',
      ),
    ),
    h('sup-go-h', 'Goals'),
    p(
      'sup-go',
      tx(
        'We are targeting 2,400 active workspaces in the first 30 days, a p95 import under five minutes, and a support contact rate below 4%.',
      ),
    ),
    h('sup-mi-h', 'Milestones'),
    p(
      'sup-mi',
      tx(
        'Feature freeze lands August 21, the release candidate cuts September 8, and GA opens September 28 behind a staged rollout: 5% of workspaces on day one, 50% within the first week, then full availability. Importer v2 moves to an October follow-up with its own flag and milestone review.',
      ),
    ),
    h('sup-sc-h', 'Launch scope'),
    p(
      'sup-sc',
      tx(
        'Core workspace, the importer, and the templates gallery. Shared views join the launch build; everything ships behind the atlas-ga flag. Importer v2 dry-run mode is out of the launch build (see Milestones).',
      ),
    ),
    h('sup-su-h', 'Support readiness'),
    p(
      'sup-su',
      de(
        'The help center refresh covers the launch surfaces and support adds two agents per shift during launch week. Escalation runbook to be rehearsed before GA.',
      ),
      tx(' '),
      ad(
        'Support readiness is now a runbook, not a paragraph. The help center refresh covers all fourteen launch surfaces, the escalation path gets a full rehearsal with the weekend rotation on September 12, and launch-week staffing is confirmed at three additional agents per shift, with Jonah Fields owning the schedule. Contact-rate dashboards page the on-call lead the moment the daily rate crosses 4%.',
      ),
    ),
    h('sup-co-h', 'Communications'),
    p(
      'sup-co',
      tx(
        'Announcement post, customer email, in-app tour. All three are drafted two weeks ahead; social follows one day after launch to keep first-day channel load on email.',
      ),
      ad(
        ' The customer email now links the refreshed help center rather than the legacy FAQ.',
      ),
    ),
  ],
};

// --- Sep 18 · "Launch review edits" (diff vs the support rewrite; current) ---
const SNAP_CURRENT: Snapshot = {
  id: 'snap-current',
  blocks: [
    h('cur-ov-h', 'Overview'),
    p(
      'cur-ov',
      tx(
        'Atlas ships to every Kestrel Labs workspace this quarter. This document is the plan of record for the launch: goals, milestones, scope, support readiness, and communications. Owners are named per milestone and the plan is reviewed every Monday in the Atlas standup.',
      ),
      ad(
        ' The go/no-go review is September 22, chaired by Priya Raman.',
      ),
    ),
    h('cur-go-h', 'Goals'),
    p(
      'cur-go',
      tx('We are targeting '),
      de('2,400 active workspaces'),
      ad('2,600 active workspaces'),
      tx(
        ' in the first 30 days, a p95 import under five minutes, and a support contact rate below 4%.',
      ),
    ),
    h('cur-mi-h', 'Milestones'),
    p(
      'cur-mi',
      tx(
        'Feature freeze lands August 21, the release candidate cuts September 8, and GA opens September 28 behind a staged rollout: 5% of workspaces on day one, 50% within the first week, then full availability. Importer v2 moves to an October follow-up with its own flag and milestone review.',
      ),
      ad(' Dana Whitfield tracks stage exits in the launch channel.'),
    ),
    h('cur-sc-h', 'Launch scope'),
    p(
      'cur-sc',
      tx(
        'Core workspace, the importer, and the templates gallery. Shared views join the launch build; everything ships behind the atlas-ga flag. Importer v2 dry-run mode is out of the launch build (see Milestones).',
      ),
    ),
    h('cur-su-h', 'Support readiness'),
    p(
      'cur-su',
      tx(
        'Support readiness is now a runbook, not a paragraph. The help center refresh covers all fourteen launch surfaces, the escalation path gets a full rehearsal with the weekend rotation on September 12, and launch-week staffing is confirmed at three additional agents per shift, with Jonah Fields owning the schedule. Contact-rate dashboards page the on-call lead the moment the daily rate crosses 4%.',
      ),
    ),
    h('cur-co-h', 'Communications'),
    p(
      'cur-co',
      tx(
        'Announcement post, customer email, in-app tour. All three are drafted two weeks ahead; social follows one day after launch to keep first-day channel load on email. The customer email now links the refreshed help center rather than the legacy FAQ.',
      ),
    ),
  ],
};

const SNAPSHOT_BY_ID = Object.fromEntries(
  [SNAP_OUTLINE, SNAP_DRAFT, SNAP_SCOPECUT, SNAP_SUPPORT, SNAP_CURRENT].map(
    snapshot => [snapshot.id, snapshot],
  ),
) as Record<string, Snapshot>;

// ============= VERSION FIXTURES =============
// 14 versions, newest first. Named versions are starred; autosaves inside a
// burst share the burst's landing snapshot (their +/- deltas are the running
// totals at that save). Word deltas cover the FULL document; the canvas
// previews the opening sections, so the stats strip says so.

interface Version {
  id: string;
  dayKey: string; // groups the rail by day
  dayLabel: string;
  timeLabel: string; // fixed literal, never derived from a clock
  name: string | null; // null = autosave; renaming promotes to named
  authorIds: PersonId[];
  wordsAdded: number | null; // null = restored (no delta to report)
  wordsRemoved: number | null;
  snapshotId: string;
  restoredFromLabel?: string; // set on versions minted by Restore
}

const INITIAL_VERSIONS: Version[] = [
  {
    id: 'v-current',
    dayKey: '2026-09-18',
    dayLabel: 'Thursday, September 18',
    timeLabel: '11:24 AM',
    name: 'Launch review edits',
    authorIds: ['priya', 'marcus'],
    wordsAdded: 64,
    wordsRemoved: 31,
    snapshotId: 'snap-current',
  },
  {
    id: 'a-0918-3',
    dayKey: '2026-09-18',
    dayLabel: 'Thursday, September 18',
    timeLabel: '10:52 AM',
    name: null,
    authorIds: ['priya'],
    wordsAdded: 41,
    wordsRemoved: 18,
    snapshotId: 'snap-current',
  },
  {
    id: 'a-0918-2',
    dayKey: '2026-09-18',
    dayLabel: 'Thursday, September 18',
    timeLabel: '10:31 AM',
    name: null,
    authorIds: ['priya', 'marcus'],
    wordsAdded: 22,
    wordsRemoved: 12,
    snapshotId: 'snap-current',
  },
  {
    id: 'a-0918-1',
    dayKey: '2026-09-18',
    dayLabel: 'Thursday, September 18',
    timeLabel: '10:07 AM',
    name: null,
    authorIds: ['marcus'],
    wordsAdded: 9,
    wordsRemoved: 4,
    snapshotId: 'snap-current',
  },
  {
    id: 'v-support',
    dayKey: '2026-09-16',
    dayLabel: 'Tuesday, September 16',
    timeLabel: '2:42 PM',
    name: 'Support plan rewrite',
    authorIds: ['sofia', 'jonah'],
    wordsAdded: 412,
    wordsRemoved: 168,
    snapshotId: 'snap-support',
  },
  {
    id: 'a-0916-3',
    dayKey: '2026-09-16',
    dayLabel: 'Tuesday, September 16',
    timeLabel: '2:18 PM',
    name: null,
    authorIds: ['sofia'],
    wordsAdded: 148,
    wordsRemoved: 61,
    snapshotId: 'snap-support',
  },
  {
    id: 'a-0916-2',
    dayKey: '2026-09-16',
    dayLabel: 'Tuesday, September 16',
    timeLabel: '1:55 PM',
    name: null,
    authorIds: ['sofia', 'jonah'],
    wordsAdded: 102,
    wordsRemoved: 38,
    snapshotId: 'snap-support',
  },
  {
    id: 'a-0916-1',
    dayKey: '2026-09-16',
    dayLabel: 'Tuesday, September 16',
    timeLabel: '1:40 PM',
    name: null,
    authorIds: ['jonah'],
    wordsAdded: 57,
    wordsRemoved: 24,
    snapshotId: 'snap-support',
  },
  {
    id: 'v-scopecut',
    dayKey: '2026-09-11',
    dayLabel: 'Thursday, September 11',
    timeLabel: '4:15 PM',
    name: 'Scope cut: importer v2',
    authorIds: ['marcus', 'dana'],
    wordsAdded: 96,
    wordsRemoved: 540,
    snapshotId: 'snap-scopecut',
  },
  {
    id: 'a-0911-2',
    dayKey: '2026-09-11',
    dayLabel: 'Thursday, September 11',
    timeLabel: '3:58 PM',
    name: null,
    authorIds: ['marcus'],
    wordsAdded: 31,
    wordsRemoved: 212,
    snapshotId: 'snap-scopecut',
  },
  {
    id: 'a-0911-1',
    dayKey: '2026-09-11',
    dayLabel: 'Thursday, September 11',
    timeLabel: '3:31 PM',
    name: null,
    authorIds: ['dana'],
    wordsAdded: 12,
    wordsRemoved: 87,
    snapshotId: 'snap-scopecut',
  },
  {
    id: 'v-draft',
    dayKey: '2026-09-04',
    dayLabel: 'Friday, September 4',
    timeLabel: '9:20 AM',
    name: 'First full draft',
    authorIds: ['priya', 'sofia'],
    wordsAdded: 1612,
    wordsRemoved: 98,
    snapshotId: 'snap-draft',
  },
  {
    id: 'a-0904-1',
    dayKey: '2026-09-04',
    dayLabel: 'Friday, September 4',
    timeLabel: '8:47 AM',
    name: null,
    authorIds: ['priya'],
    wordsAdded: 410,
    wordsRemoved: 22,
    snapshotId: 'snap-draft',
  },
  {
    id: 'v-outline',
    dayKey: '2026-08-28',
    dayLabel: 'Friday, August 28',
    timeLabel: '3:05 PM',
    name: 'Outline + goals',
    authorIds: ['priya'],
    wordsAdded: 236,
    wordsRemoved: 0,
    snapshotId: 'snap-outline',
  },
];

const INITIAL_SELECTED_ID = 'v-support';

// ============= DERIVATION HELPERS =============
// Small helpers over fixture arrays — no parsers, no geometry.

interface DayGroup {
  dayKey: string;
  dayLabel: string;
  versions: Version[];
}

/** Rail groups in list order (versions are already newest-first). */
function groupByDay(versions: Version[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const version of versions) {
    const last = groups[groups.length - 1];
    if (last !== undefined && last.dayKey === version.dayKey) {
      last.versions.push(version);
    } else {
      groups.push({
        dayKey: version.dayKey,
        dayLabel: version.dayLabel,
        versions: [version],
      });
    }
  }
  return groups;
}

/** Sparkbar side widths from ONE shared px-per-word scale (see constants). */
function sparkWidths(added: number, removed: number): [number, number] {
  const total = added + removed;
  const scale =
    SPARK_TRACK_PX / Math.max(total, SPARK_SATURATE_WORDS);
  const side = (words: number): number =>
    words === 0 ? 0 : Math.max(2, Math.round(words * scale));
  return [side(added), side(removed)];
}

function formatWords(count: number): string {
  return count.toLocaleString('en-US');
}

/** Rail row title: version name, or the autosave label. */
function versionTitle(version: Version): string {
  return version.name ?? 'Autosave';
}

/** Toolbar identity line, also used by the restore bar and restore naming. */
function versionStampLabel(version: Version): string {
  const shortDay = version.dayLabel.split(', ')[1] ?? version.dayLabel;
  return `${shortDay}, ${version.timeLabel}`;
}

// ============= RAIL: SPARKBAR =============

/**
 * Change-size sparkbar: green (added) and red (removed) segments on the
 * shared px-per-word scale. Restored versions carry no delta and no bar.
 */
function Sparkbar({version}: {version: Version}) {
  if (version.wordsAdded === null || version.wordsRemoved === null) {
    return null;
  }
  const [addPx, delPx] = sparkWidths(version.wordsAdded, version.wordsRemoved);
  return (
    <Tooltip
      content={`+${formatWords(version.wordsAdded)} / −${formatWords(
        version.wordsRemoved,
      )} words`}>
      <span
        role="img"
        aria-label={`${formatWords(version.wordsAdded)} words added, ${formatWords(
          version.wordsRemoved,
        )} words removed`}
        style={styles.sparkTrack}>
        <span aria-hidden style={{...styles.sparkAdd, width: addPx}} />
        <span aria-hidden style={{...styles.sparkDel, width: delPx}} />
      </span>
    </Tooltip>
  );
}

// ============= RAIL: VERSION ROW =============

/**
 * One dense rail row: star/clock glyph, name + time, author facepile, and
 * the sparkbar. Named versions read bold with a starred glyph.
 */
function VersionRow({
  version,
  isSelected,
  isCurrent,
  showSparkbar,
  onSelect,
}: {
  version: Version;
  isSelected: boolean;
  isCurrent: boolean;
  showSparkbar: boolean;
  onSelect: (id: string) => void;
}) {
  const isNamed = version.name !== null;
  const glyphIcon = version.restoredFromLabel !== undefined
    ? RotateCcwIcon
    : isNamed
      ? StarIcon
      : ClockIcon;
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`${versionTitle(version)}, ${versionStampLabel(version)}${
        isCurrent ? ', current version' : ''
      }`}
      onClick={() => onSelect(version.id)}
      style={{
        ...styles.versionRow,
        ...(isSelected ? styles.versionRowActive : null),
      }}>
      <span
        aria-hidden
        style={{
          ...styles.rowGlyph,
          color: isNamed ? STAR_CHROME : 'var(--color-text-secondary)',
        }}>
        <Icon icon={glyphIcon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={1}>
          {/* Line 1: title (full row width, so names rarely truncate). */}
          <HStack gap={2} vAlign="center">
            <Text
              type="body"
              weight={isNamed ? 'bold' : 'normal'}
              maxLines={1}>
              {versionTitle(version)}
            </Text>
            {isCurrent ? <Badge label="Current" variant="success" /> : null}
          </HStack>
          {/* Line 2: time + facepile + shared-scale sparkbar. */}
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary" style={styles.rowTime}>
                {version.timeLabel}
              </Text>
            </StackItem>
            <AvatarGroup
              size="xsmall"
              aria-label={`Edited by ${version.authorIds
                .map(id => PERSON_BY_ID[id].name)
                .join(' and ')}`}>
              {version.authorIds.map(id => (
                <Avatar key={id} name={PERSON_BY_ID[id].name} />
              ))}
            </AvatarGroup>
            {showSparkbar ? <Sparkbar version={version} /> : null}
          </HStack>
        </VStack>
      </StackItem>
    </button>
  );
}

// ============= RAIL: DAY GROUP =============

/**
 * One day section: heading, named versions + the newest autosave always
 * visible, surplus autosaves collapsed behind "Show N more autosaves".
 */
function DayGroupSection({
  group,
  selectedId,
  currentId,
  isExpanded,
  showSparkbars,
  onSelect,
  onToggleExpanded,
}: {
  group: DayGroup;
  selectedId: string;
  currentId: string;
  isExpanded: boolean;
  showSparkbars: boolean;
  onSelect: (id: string) => void;
  onToggleExpanded: (dayKey: string) => void;
}) {
  // Named rows always show; autosaves show only the newest unless expanded —
  // except a selected autosave, which never hides under its own selection.
  const autosaveIds = group.versions
    .filter(version => version.name === null)
    .map(version => version.id);
  const firstAutosaveId = autosaveIds[0];
  const hiddenCount = Math.max(0, autosaveIds.length - 1);
  const visibleVersions = group.versions.filter(
    version =>
      version.name !== null ||
      isExpanded ||
      version.id === firstAutosaveId ||
      version.id === selectedId,
  );
  return (
    <VStack gap={1}>
      <div style={styles.dayHeading}>
        <Text type="supporting" color="secondary" weight="bold">
          {group.dayLabel}
        </Text>
      </div>
      {visibleVersions.map(version => (
        <VersionRow
          key={version.id}
          version={version}
          isSelected={version.id === selectedId}
          isCurrent={version.id === currentId}
          showSparkbar={showSparkbars}
          onSelect={onSelect}
        />
      ))}
      {hiddenCount > 0 ? (
        <Button
          label={
            isExpanded
              ? 'Show fewer autosaves'
              : `Show ${hiddenCount} more ${
                  hiddenCount === 1 ? 'autosave' : 'autosaves'
                }`
          }
          variant="ghost"
          size="sm"
          icon={
            <Icon
              icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={() => onToggleExpanded(group.dayKey)}
        />
      ) : null}
    </VStack>
  );
}

// ============= CANVAS: STATIC DOC PREVIEW =============

/**
 * One preview block. With changes shown, added segments wear the green wash
 * and removed segments the red strike; with changes hidden the text settles
 * clean. Intentionally NON-editable (astryx-editor owns editing).
 */
function BlockView({block, showChanges}: {block: Block; showChanges: boolean}) {
  const children: ReactNode[] = [];
  block.segments.forEach((segment, index) => {
    const key = `${block.id}-seg-${index}`;
    if (segment.t === 'text') {
      children.push(<span key={key}>{segment.text}</span>);
    } else if (segment.t === 'add') {
      children.push(
        showChanges ? (
          <ins key={key} style={styles.addedSpan}>
            {segment.text}
          </ins>
        ) : (
          <span key={key}>{segment.text}</span>
        ),
      );
    } else if (showChanges) {
      children.push(
        <del key={key} style={styles.removedSpan}>
          {segment.text}
        </del>,
      );
    }
  });
  return block.kind === 'heading' ? (
    <h3 style={styles.sectionHeading}>{children}</h3>
  ) : (
    <p style={styles.paragraph}>{children}</p>
  );
}

/** True when a snapshot carries any added/removed span to highlight. */
function snapshotHasDiff(snapshot: Snapshot): boolean {
  return snapshot.blocks.some(block =>
    block.segments.some(segment => segment.t !== 'text'),
  );
}

// ============= TOOLBAR: DIFF-STATS STRIP =============

/**
 * The +/- word chips for the selected version; deltas cover the FULL
 * document. Restored versions report their provenance instead of a delta.
 */
function DiffStatsStrip({version}: {version: Version}) {
  if (version.wordsAdded === null || version.wordsRemoved === null) {
    return (
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Icon icon={RotateCcwIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary">
          Restored from {version.restoredFromLabel} — matches it exactly
        </Text>
      </HStack>
    );
  }
  return (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <span style={{...styles.statChip, ...styles.statAdd}}>
        +{formatWords(version.wordsAdded)} words
      </span>
      <span style={{...styles.statChip, ...styles.statDel}}>
        −{formatWords(version.wordsRemoved)} words
      </span>
      <Text type="supporting" color="secondary">
        across the full document
      </Text>
    </HStack>
  );
}

// ============= TOOLBAR: VERSION NAME + INLINE RENAME =============

/**
 * Version identity with the inline-edit affordance: a pencil IconButton
 * swaps the name for a TextInput; naming an autosave stars it.
 */
function VersionNameControl({
  version,
  draft,
  onStartRename,
  onDraftChange,
  onSaveRename,
  onCancelRename,
}: {
  version: Version;
  draft: string | null;
  onStartRename: () => void;
  onDraftChange: (value: string) => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
}) {
  if (draft !== null) {
    return (
      <HStack gap={2} vAlign="center" wrap="wrap">
        <div style={styles.renameInputWrap}>
          <TextInput
            label="Version name"
            isLabelHidden
            size="sm"
            value={draft}
            placeholder="Name this version"
            onChange={onDraftChange}
          />
        </div>
        <IconButton
          label="Save name"
          variant="primary"
          size="sm"
          icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
          isDisabled={draft.trim().length === 0}
          onClick={onSaveRename}
        />
        <IconButton
          label="Cancel rename"
          variant="ghost"
          size="sm"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          onClick={onCancelRename}
        />
      </HStack>
    );
  }
  const isNamed = version.name !== null;
  return (
    <HStack gap={2} vAlign="center" wrap="wrap">
      {isNamed ? (
        <span aria-hidden style={{color: STAR_CHROME, display: 'inline-flex'}}>
          <Icon icon={StarIcon} size="sm" color="inherit" />
        </span>
      ) : null}
      <Heading level={2}>{versionTitle(version)}</Heading>
      <Text type="supporting" color="secondary" style={styles.rowTime}>
        {versionStampLabel(version)} · {version.authorIds
          .map(id => PERSON_BY_ID[id].name)
          .join(', ')}
      </Text>
      <Tooltip
        content={
          isNamed ? 'Rename version' : 'Name this autosave to star it'
        }>
        <IconButton
          label={isNamed ? 'Rename version' : 'Name this autosave'}
          variant="ghost"
          size="sm"
          icon={<Icon icon={PencilIcon} size="sm" color="inherit" />}
          onClick={onStartRename}
        />
      </Tooltip>
    </HStack>
  );
}

// ============= PAGE =============

export default function DocVersionHistoryTemplate() {
  // The newest version (index 0) is always the current one; Restore
  // prepends. Renames rewrite in place.
  const [versions, setVersions] = useState<Version[]>(INITIAL_VERSIONS);
  const [selectedId, setSelectedId] = useState(INITIAL_SELECTED_ID);
  const [showChanges, setShowChanges] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    () => new Set(),
  );
  // null = not renaming; '' is a legal in-progress draft.
  const [renameDraft, setRenameDraft] = useState<string | null>(null);

  // Responsive contract: <=960px the rail stacks below the paper; <=640px
  // chrome condenses and rail rows drop the sparkbar.
  const isRailStacked = useMediaQuery('(max-width: 960px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const restoreButtonSize: 'sm' | 'md' = isPhone ? 'md' : 'sm';

  // ---- derived state ----
  const currentVersion = versions[0];
  const selectedVersion =
    versions.find(version => version.id === selectedId) ?? currentVersion;
  const isViewingCurrent = selectedVersion.id === currentVersion.id;
  const snapshot = SNAPSHOT_BY_ID[selectedVersion.snapshotId];
  const hasDiff = snapshotHasDiff(snapshot);
  const dayGroups = groupByDay(versions);
  const namedCount = versions.filter(version => version.name !== null).length;

  // ---- interactions ----
  const selectVersion = (id: string) => {
    setSelectedId(id);
    setRenameDraft(null); // renaming always targets the selected version
  };

  const toggleExpanded = (dayKey: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayKey)) {
        next.delete(dayKey);
      } else {
        next.add(dayKey);
      }
      return next;
    });
  };

  const startRename = () => {
    setRenameDraft(selectedVersion.name ?? '');
  };

  /** Saving a non-empty name renames — and stars a bare autosave. */
  const saveRename = () => {
    const name = (renameDraft ?? '').trim();
    if (name.length === 0) {
      return;
    }
    setVersions(prev =>
      prev.map(version =>
        version.id === selectedVersion.id ? {...version, name} : version,
      ),
    );
    setRenameDraft(null);
  };

  /**
   * Restore mints a NEW current version at the fixed literal stamp (no
   * clocks) pointing at the restored snapshot, authored by the current
   * user, and selects it — the restore bar disappears because the
   * selection is now current. The old current version stays in history.
   */
  const restoreSelected = () => {
    const restored: Version = {
      id: `v-restored-${versions.length}`,
      dayKey: RESTORE_DAY_KEY,
      dayLabel: RESTORE_DAY_LABEL,
      timeLabel: RESTORE_TIME_LABEL,
      name: `Restored: ${versionTitle(selectedVersion)}`,
      authorIds: [CURRENT_USER.id],
      wordsAdded: null,
      wordsRemoved: null,
      snapshotId: selectedVersion.snapshotId,
      restoredFromLabel: versionStampLabel(selectedVersion),
    };
    setVersions(prev => [restored, ...prev]);
    setSelectedId(restored.id);
    setRenameDraft(null);
  };

  // ---- version rail ----
  const railList = (
    <VStack gap={3}>
      <VStack gap={1} style={styles.dayHeading}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Versions</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {versions.length} total · {namedCount} named
          </Text>
        </HStack>
        <Text type="supporting" color="secondary">
          Named versions are starred; the bar sizes each change.
        </Text>
      </VStack>
      <Divider />
      {dayGroups.map(group => (
        <DayGroupSection
          key={group.dayKey}
          group={group}
          selectedId={selectedVersion.id}
          currentId={currentVersion.id}
          isExpanded={expandedDays.has(group.dayKey)}
          showSparkbars={!isPhone}
          onSelect={selectVersion}
          onToggleExpanded={toggleExpanded}
        />
      ))}
    </VStack>
  );

  // ---- canvas toolbar (version identity + compare toggle + stats) ----
  const toolbar = (
    <div style={styles.toolbar}>
      <VStack gap={2}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <VersionNameControl
              version={selectedVersion}
              draft={renameDraft}
              onStartRename={startRename}
              onDraftChange={setRenameDraft}
              onSaveRename={saveRename}
              onCancelRename={() => setRenameDraft(null)}
            />
          </StackItem>
          <Switch
            label="Show changes"
            value={showChanges}
            onChange={setShowChanges}
          />
        </HStack>
        <DiffStatsStrip version={selectedVersion} />
        {showChanges && !hasDiff && selectedVersion.restoredFromLabel === undefined ? (
          <Text type="supporting" color="secondary">
            Earliest version — there is no earlier version to compare
            against, so nothing is highlighted.
          </Text>
        ) : null}
      </VStack>
    </div>
  );

  // ---- paper canvas + floating restore bar ----
  const paper = (
    <div style={isRailStacked ? styles.backdropStacked : styles.backdrop}>
      {toolbar}
      <div style={styles.paperColumn}>
        <div style={styles.paper}>
          <h2 style={styles.docTitle}>{DOC_TITLE}</h2>
          <div style={styles.docByline}>{DOC_BYLINE}</div>
          <hr style={styles.docRule} />
          {snapshot.blocks.map(block => (
            <BlockView
              key={block.id}
              block={block}
              showChanges={showChanges}
            />
          ))}
        </div>
      </div>
      {!isViewingCurrent ? (
        <div style={styles.restoreDock}>
          <Card padding={3} style={styles.restoreCard}>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="body" weight="bold">
                    Viewing {versionStampLabel(selectedVersion)}
                  </Text>
                  <Text type="supporting" color="secondary">
                    Restoring keeps the current version in history.
                  </Text>
                </VStack>
              </StackItem>
              <HStack gap={2} vAlign="center">
                <Button
                  label="Back to current"
                  variant="ghost"
                  size={restoreButtonSize}
                  onClick={() => selectVersion(currentVersion.id)}
                />
                <Button
                  label="Restore this version"
                  variant="primary"
                  size={restoreButtonSize}
                  icon={
                    <Icon icon={RotateCcwIcon} size="sm" color="inherit" />
                  }
                  onClick={restoreSelected}
                />
              </HStack>
            </HStack>
          </Card>
        </div>
      ) : null}
    </div>
  );

  // ---- header ----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Icon icon={FileClockIcon} size="md" color="secondary" />
            <Heading level={1}>{DOC_TITLE}</Heading>
            {!isPhone ? (
              <Text type="supporting" color="secondary">
                Version history · Kestrel Labs Docs
              </Text>
            ) : null}
            <Badge
              label={`${versions.length} versions`}
              variant="neutral"
            />
          </HStack>
        </StackItem>
        <Button
          label="Back to document"
          variant="secondary"
          size="sm"
          icon={<Icon icon={ArrowLeftIcon} size="sm" color="inherit" />}
          onClick={() => selectVersion(currentVersion.id)}
        />
      </HStack>
    </LayoutHeader>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        end={
          !isRailStacked ? (
            <LayoutPanel width={320} padding={0} label="Version history">
              <div style={styles.railScroll}>{railList}</div>
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent padding={0}>
            {/* When the rail stacks below the paper the column flows at
                natural height and LayoutContent scrolls the whole page. */}
            <VStack gap={0} style={isRailStacked ? undefined : styles.fill}>
              <StackItem
                size="fill"
                style={isRailStacked ? undefined : styles.fill}>
                {paper}
              </StackItem>
              {isRailStacked ? (
                <>
                  <Divider />
                  <div style={styles.railStacked}>{railList}</div>
                </>
              ) : null}
            </VStack>
          </LayoutContent>
        }
      />
    </div>
  );
}
