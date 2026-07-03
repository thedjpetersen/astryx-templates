var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (the Kestrel Labs 'Atlas Q3 · Launch
 *   Readiness Review' recap for Thu Jul 16 2026 10:30–11:15 AM PT — the same
 *   meeting the pre-call lobby joins: 12 invited / 10 attended, a 44:37
 *   recording with six fixed chapter offsets, a 24-segment speaker-attributed
 *   transcript, an AI summary with key points and three decisions, five
 *   action items, and per-person talk-time totals that sum to 41:50 of
 *   speaking time; playback advances the playhead on a plain 1s setInterval
 *   while "playing" — no clocks, no Math.random, no network media, no
 *   <video>; the recording thumbnail is a CSS-gradient stage)
 * @output Post-meeting recap & transcript surface: a header row with meeting
 *   title, date/duration metadata and a 10/12 attendance chip (absentees on
 *   hover) plus Share/Download actions; a recording player strip with a
 *   scheme-locked dark thumbnail stage (play/pause, chapter title readout),
 *   a scrub Slider flanked by tabular timecodes with categorical chapter
 *   markers registered under the track and a clickable chapter-chip row; a
 *   transcript pane with a search box (highlighted hits + match count),
 *   speaker filter chips with talk-time hints, timecode-seekable segments
 *   and a playhead-synced now-playing outline; and an end panel holding the
 *   AI summary Card (key points, decision badges, copy action), the
 *   action-items Card (checkbox completion, assignee Avatar, due chip,
 *   per-row Add-to-Tasks buttons) and attendance/talk-time analytics
 *   (attendee facepile with overflow, per-person horizontal bars on one
 *   shared scale with right-aligned mm:ss and share-of-speaking labels)
 * @position Page template; emitted by \`astryx template meet-recap\`
 *
 * Frame: root div 100dvh so Layout height="fill" cannot collapse in the
 * demo's auto-height stage. LayoutHeader (wrapping chrome) carries
 * breadcrumb brand, title block, attendance chip, and actions. LayoutContent
 * hosts the recap column: player strip (fixed-height stage + scrub + chapter
 * chips) pinned above a transcript pane that scrolls independently
 * (minHeight: 0 down the flex chain). LayoutPanel end 380 holds summary /
 * action items / analytics and scrolls on its own.
 *
 * Responsive contract:
 * - >1024px: header | player-over-transcript column + 380px end panel.
 * - <=1024px: the end panel drops below the transcript as stacked Cards in
 *   one scrolling column; the transcript pane caps at 480px and keeps its
 *   own scrollbar so the summary stays reachable.
 * - <=640px: header meta wraps and the Share button collapses to icon-only;
 *   chapter chips become a deliberate horizontal scroller; action-item rows
 *   wrap their due chip + add button onto a second line.
 *
 * Container policy (recap archetype): frame-first rows and panels; Cards are
 * reserved for the three genuine summary widgets in the end panel (AI
 * summary, action items, analytics) and their <=1024px stacked variants.
 * Player strip and transcript are rows on the body surface.
 *
 * Color policy: the recording thumbnail stage is deliberately scheme-locked
 * dark (colorScheme: 'dark' + literal hex/rgba paint) because it stands in
 * for recorded footage and must read identically under the Light/Dark
 * toggle. Chapter markers, speaker dots, and talk-time bars use the repo's
 * data-viz categorical tokens with explicit light-dark() fallbacks; search
 * hit highlights use an explicit light-dark() tint pair. Everything else is
 * token-pure and theme-adaptive.
 */

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  ArrowLeftIcon,
  CalendarClockIcon,
  CheckIcon,
  ClipboardListIcon,
  CopyIcon,
  DownloadIcon,
  FileTextIcon,
  ListChecksIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  Share2Icon,
  SparklesIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  UsersIcon,
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
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Slider} from '@astryxdesign/core/Slider';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SHARED SCALES & PALETTE =============

/** Recording length in seconds (44:37); every timecode derives from this. */
const DURATION_SEC = 2677;

/** Reserved gutter so the scrub thumb at position 0 never overlaps the
 * left timecode; chapter markers use the same inset to stay registered. */
const SCRUB_INSET_PX = 10;

// Repo-standard data-viz categorical fallbacks (calendar-month-grid.tsx).
const CAT_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const CAT_PURPLE = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const CAT_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const CAT_ORANGE = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const CAT_TEAL = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
/** Low-emphasis series color for minor speakers (token-pure). */
const CAT_NEUTRAL = 'var(--color-border-emphasized)';

function formatSec(totalSec: number): string {
  const sec = Math.max(0, Math.min(DURATION_SEC, Math.round(totalSec)));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return \`\${m}:\${String(s).padStart(2, '0')}\`;
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Footgun 6: the demo stage is auto-height; pin the frame to 100dvh.
  root: {height: '100dvh', width: '100%'},

  // ----- header -----
  titleBlock: {display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0},
  headerMetaRow: {
    display: 'flex',
    alignItems: 'center',
    columnGap: 'var(--spacing-2)',
    rowGap: 2,
    flexWrap: 'wrap',
  },

  // ----- recap column (player over transcript) -----
  recapColumn: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  // <=1024px: one scrolling column; transcript keeps its own scrollbar.
  recapColumnStacked: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
  },

  // ----- player strip -----
  playerStrip: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  playerRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  // Scheme-locked dark recording stage — stands in for footage; literal
  // paint only so it reads identically under the Light/Dark toggle.
  stage: {
    position: 'relative',
    width: 292,
    minWidth: 292,
    height: 164,
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    colorScheme: 'dark',
    background:
      'linear-gradient(135deg, #1C2440 0%, #16203A 42%, #101A30 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stageCompact: {width: '100%', minWidth: 0, height: 180},
  stageGlare: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(120% 90% at 18% 0%, rgba(120,150,255,0.20) 0%, rgba(120,150,255,0) 55%)',
    pointerEvents: 'none',
  },
  stageTopRow: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
  },
  stageChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: 'rgba(8,12,24,0.72)',
    color: 'rgba(226,232,240,0.9)',
    fontSize: 11,
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stageDurationChip: {
    position: 'absolute',
    right: 10,
    bottom: 8,
    padding: '2px 7px',
    borderRadius: 'var(--radius-control, 6px)',
    backgroundColor: 'rgba(8,12,24,0.78)',
    color: 'rgba(226,232,240,0.92)',
    fontSize: 11,
    lineHeight: '16px',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'var(--font-family-code, monospace)',
  },
  stagePlayButton: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    border: '1px solid rgba(226,232,240,0.35)',
    backgroundColor: 'rgba(8,12,24,0.62)',
    color: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  stageProgressRail: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: 'rgba(226,232,240,0.22)',
  },
  stageProgressFill: {
    height: '100%',
    backgroundColor: '#F87171',
  },

  // ----- scrub + chapters (share SCRUB_INSET_PX so markers stay registered
  // with the Slider track; footgun 8: the inset also keeps the thumb at 0
  // clear of the left timecode) -----
  scrubBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  scrubRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  scrubTrackWrap: {flex: 1, minWidth: 0, paddingInline: SCRUB_INSET_PX},
  chapterMarkerRail: {
    position: 'relative',
    height: 14,
    marginInline: SCRUB_INSET_PX,
  },
  chapterMarker: {
    position: 'absolute',
    top: 2,
    width: 3,
    height: 10,
    borderRadius: 2,
    transform: 'translateX(-1.5px)',
  },
  timecode: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
  },
  chapterChipRow: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    flexWrap: 'wrap',
  },
  // <=640px: deliberate horizontal scroller instead of wrapping.
  chapterChipRowCompact: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    overflowX: 'auto',
    paddingBottom: 2,
  },
  chapterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    fontSize: 12,
    lineHeight: '16px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  chapterChipActive: {
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  chapterDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},

  // ----- transcript pane -----
  transcriptPane: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  transcriptPaneStacked: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 480,
    minHeight: 240,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  transcriptToolbar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    paddingBottom: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  speakerChipRow: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  transcriptScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  segmentRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    alignItems: 'flex-start',
  },
  // Inset outline so the now-playing ring never bleeds onto neighbors.
  segmentRowActive: {
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  segmentBody: {flex: 1, minWidth: 0},
  segmentSpeakerRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-2)',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  segmentTimeButton: {
    border: 'none',
    background: 'none',
    padding: 0,
    cursor: 'pointer',
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    color: 'var(--color-accent)',
    whiteSpace: 'nowrap',
  },
  // Explicit tint pair: search-hit highlight (doc-highlight idiom).
  searchHit: {
    backgroundColor: 'light-dark(#FDE68A, #7A5D0E)',
    borderRadius: 3,
    paddingInline: 1,
  },

  // ----- end panel widgets -----
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  stackedPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
  },
  keyPointList: {
    margin: 0,
    paddingInlineStart: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  decisionRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
  },
  actionItemRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    paddingBlock: 'var(--spacing-2)',
  },
  actionItemMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    marginTop: 4,
    flexWrap: 'wrap',
  },

  // ----- analytics -----
  barRow: {
    display: 'grid',
    gridTemplateColumns: '112px 1fr 76px',
    alignItems: 'center',
    columnGap: 'var(--spacing-2)',
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  barFill: {height: '100%', borderRadius: 999},
  barValue: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  axisRow: {
    display: 'grid',
    gridTemplateColumns: '112px 1fr 76px',
    columnGap: 'var(--spacing-2)',
  },
  axisScale: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};

// ============= DATA =============
// Deterministic fixtures: the same Kestrel Labs / Atlas Q3 meeting the
// pre-call lobby joins (meet-precall-lobby.tsx), one day later as a recap.
// Fixed ISO-derived display strings only; every count that repeats across
// panels agrees (12 invited / 10 attended, 44:37 recorded, 41:50 spoken).

const MEETING = {
  program: 'Atlas Q3',
  title: 'Atlas Q3 · Launch Readiness Review',
  when: 'Thu, Jul 16, 2026 · 10:30 – 11:15 AM PT',
  durationLabel: '45 min scheduled',
  recordedLabel: '44:37 recorded',
  organizer: 'Priya Raman',
  invitedCount: 12,
  attendedCount: 10,
};

const YOU = 'Marcus Webb';

/** Speaker roster with talk time; seconds sum to 2510 (41:50) of the 44:37
 * recording, and \`sharePct\` sums to 100. Colors match transcript dots,
 * filter chips, and analytics bars. */
interface Person {
  name: string;
  role: string;
  talkSec: number;
  sharePct: number;
  color: string;
}

const SPEAKERS: Person[] = [
  {name: 'Priya Raman', role: 'Program lead', talkSec: 672, sharePct: 27, color: CAT_BLUE},
  {name: 'Marcus Webb', role: 'Platform eng', talkSec: 485, sharePct: 19, color: CAT_PURPLE},
  {name: 'Sofia Ortiz', role: 'Product research', talkSec: 424, sharePct: 17, color: CAT_GREEN},
  {name: 'Jonah Fields', role: 'Launch PM', talkSec: 348, sharePct: 14, color: CAT_ORANGE},
  {name: 'Dana Whitfield', role: 'Marketing', talkSec: 271, sharePct: 11, color: CAT_TEAL},
  {name: 'Elena Vasquez', role: 'Design', talkSec: 176, sharePct: 7, color: CAT_NEUTRAL},
  {name: 'Tom Okafor', role: 'Infra', talkSec: 97, sharePct: 4, color: CAT_NEUTRAL},
  {name: 'Grace Lin', role: 'Support', talkSec: 37, sharePct: 1, color: CAT_NEUTRAL},
];

/** Attended but did not speak — still counted in the 10/12 facepile. */
const SILENT_ATTENDEES = ['Ava Castillo', 'Maya Singh'];

const ABSENTEES = ['Noah Bergström', 'Leo Tran'];

const ATTENDEE_NAMES = [...SPEAKERS.map(p => p.name), ...SILENT_ATTENDEES];

const SPEAKER_BY_NAME = new Map(SPEAKERS.map(p => [p.name, p]));

const TOTAL_TALK_LABEL = '41:50 speaking time';

/** Chapter markers on the scrub track; offsets in recording seconds. */
interface Chapter {
  id: string;
  title: string;
  startSec: number;
  color: string;
}

const CHAPTERS: Chapter[] = [
  {id: 'welcome', title: 'Welcome & agenda', startSec: 0, color: CAT_BLUE},
  {id: 'checklist', title: 'Launch checklist status', startSec: 225, color: CAT_ORANGE},
  {id: 'beta', title: 'Beta feedback themes', startSec: 740, color: CAT_GREEN},
  {id: 'infra', title: 'Infra & load-test readiness', startSec: 1265, color: CAT_PURPLE},
  {id: 'comms', title: 'Marketing & comms', startSec: 1840, color: CAT_TEAL},
  {id: 'decisions', title: 'Decisions & next steps', startSec: 2295, color: CAT_BLUE},
];

function chapterAt(sec: number): Chapter {
  let current = CHAPTERS[0];
  for (const ch of CHAPTERS) {
    if (ch.startSec <= sec) current = ch;
  }
  return current;
}

/** Speaker-attributed transcript; startSec strictly increasing. Numbers
 * quoted here (87% checklist, 4 open items, 500 beta seats, 2× peak, Aug 4)
 * are the same ones the AI summary and action items repeat. */
interface Segment {
  id: string;
  startSec: number;
  speaker: string;
  text: string;
}

const TRANSCRIPT: Segment[] = [
  {id: 's01', startSec: 4, speaker: 'Priya Raman', text: "Morning everyone — welcome to the weekly launch readiness review. Agenda is on screen: checklist status, beta feedback themes, infra readiness, then marketing and comms before we lock decisions."},
  {id: 's02', startSec: 58, speaker: 'Priya Raman', text: "Quick reminder that the Atlas Q3 Launch Narrative doc is the source of truth. If a number in your section moved this week, update the doc before Friday."},
  {id: 's03', startSec: 132, speaker: 'Jonah Fields', text: "One logistics note — the recording and recap will go to the whole invite list, so if you missed a section you can catch the chapters afterward."},
  {id: 's04', startSec: 231, speaker: 'Jonah Fields', text: "Checklist status: we are at 87% complete, 4 open items remaining. The two risky ones are the pricing page copy and the billing migration dry run."},
  {id: 's05', startSec: 318, speaker: 'Priya Raman', text: "Jonah, can you own driving the remaining 4 checklist items to closed by Wednesday the 22nd? Anything blocked, escalate in #atlas-q3 same day."},
  {id: 's06', startSec: 384, speaker: 'Jonah Fields', text: "Yes — pricing copy needs Dana's freeze date and the dry run needs a slot from Tom, but both are scheduled. I'll close the other two today."},
  {id: 's07', startSec: 476, speaker: 'Grace Lin', text: "Support macros for the four launch flows are drafted and in review, so nothing on the checklist blocks on support anymore."},
  {id: 's08', startSec: 561, speaker: 'Elena Vasquez', text: "Design side: onboarding polish landed. I still want an accessibility audit on the new onboarding flow before we call it done — it touches every first-run user."},
  {id: 's09', startSec: 640, speaker: 'Priya Raman', text: "Agreed, let's make the accessibility audit an action item with a date rather than a wish. Elena, can you schedule it for the week of the 24th?"},
  {id: 's10', startSec: 748, speaker: 'Sofia Ortiz', text: "Beta feedback themes. We're at 214 responses from the 250-seat cohort. Three themes dominate: import speed, clearer pricing, and workspace templates."},
  {id: 's11', startSec: 842, speaker: 'Sofia Ortiz', text: "Import speed complaints dropped by half after last week's fix, so the top open theme is now pricing clarity — 61 of 214 responses mention it."},
  {id: 's12', startSec: 927, speaker: 'Dana Whitfield', text: "That maps to what we saw in the pricing page tests. The new comparison table cut confusion in moderated sessions, so the copy freeze matters."},
  {id: 's13', startSec: 1003, speaker: 'Sofia Ortiz', text: "Recommendation: expand the beta cohort to 500 seats on July 21 so the pricing changes get a clean read before launch. Waitlist demand covers it twice over."},
  {id: 's14', startSec: 1096, speaker: 'Priya Raman', text: "Any objection to the 500-seat expansion? Hearing none — Sofia, publish the beta feedback themes doc to #atlas-q3 tomorrow so the whole team sees the data."},
  {id: 's15', startSec: 1271, speaker: 'Marcus Webb', text: "Infra readiness. The Monday load test held 1.4× projected peak with p95 latency at 310 milliseconds, but the payment flow degraded above that."},
  {id: 's16', startSec: 1372, speaker: 'Tom Okafor', text: "The bottleneck is the payment webhook consumer — it's single-partition. We're sharding it this week; capacity math says that clears 2× comfortably."},
  {id: 's17', startSec: 1460, speaker: 'Marcus Webb', text: "So the plan: I rerun the payment-flow load test at 2× peak after Tom's sharding change lands, target Monday the 20th. That's the gate for infra sign-off."},
  {id: 's18', startSec: 1587, speaker: 'Priya Raman', text: "Good. To be explicit: infra sign-off requires the 2× rerun green. If it's red on the 20th we meet same day to talk contingency, not on Thursday."},
  {id: 's19', startSec: 1703, speaker: 'Tom Okafor', text: "One more thing — the billing migration dry run is booked for Friday morning, which un-blocks Jonah's checklist item."},
  {id: 's20', startSec: 1846, speaker: 'Dana Whitfield', text: "Marketing and comms. Launch-day plan v1 shipped last week; v2 adds the customer stories and the updated pricing narrative. Draft to Priya by the 21st."},
  {id: 's21', startSec: 1969, speaker: 'Dana Whitfield', text: "Proposal on copy: we freeze pricing page copy on July 28. That gives Sofia's expanded cohort a full week of reads and still clears the launch window."},
  {id: 's22', startSec: 2081, speaker: 'Marcus Webb', text: "Freeze on the 28th works for eng — any later and the localization pass lands inside release week, which we said we'd never do again."},
  {id: 's23', startSec: 2302, speaker: 'Priya Raman', text: "Decisions. One: ship date holds at August 4. Two: beta expands to 500 seats on July 21. Three: pricing page copy freezes July 28. All three go in the narrative doc."},
  {id: 's24', startSec: 2489, speaker: 'Priya Raman', text: "Action items are in the recap — five owners, all dated this month. Thanks everyone; next readiness review is Thursday the 23rd, same room."},
];

/** AI summary — every figure restates a transcript number verbatim. */
const SUMMARY_KEY_POINTS = [
  'Launch checklist is 87% complete with 4 open items; pricing copy and the billing migration dry run are the two risky ones.',
  'Beta feedback (214 of 250 seats responding) now centers on pricing clarity — 61 responses — after the import-speed fix halved that theme.',
  'Monday load test held 1.4× projected peak (p95 310 ms) but the payment flow degraded above it; webhook consumer sharding is the fix.',
  'Launch-day comms plan v2 adds customer stories and the updated pricing narrative; draft goes to Priya by Jul 21.',
];

const SUMMARY_DECISIONS = [
  {id: 'd1', label: 'Ship date holds', detail: 'Atlas Q3 launches Tue, Aug 4 — unchanged.'},
  {id: 'd2', label: 'Beta expands', detail: 'Cohort grows from 250 to 500 seats on Jul 21.'},
  {id: 'd3', label: 'Copy freeze', detail: 'Pricing page copy freezes Jul 28 ahead of localization.'},
];

/** Action items; \`sourceSec\` deep-links into the transcript. */
interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  due: string;
  isDueSoon: boolean;
  sourceSec: number;
}

const ACTION_ITEMS: ActionItem[] = [
  {id: 'a1', text: 'Publish the beta feedback themes doc to #atlas-q3', assignee: 'Sofia Ortiz', due: 'Fri, Jul 17', isDueSoon: true, sourceSec: 1096},
  {id: 'a2', text: 'Rerun the payment-flow load test at 2× peak after sharding lands', assignee: 'Marcus Webb', due: 'Mon, Jul 20', isDueSoon: true, sourceSec: 1460},
  {id: 'a3', text: 'Send launch-day comms plan v2 draft to Priya', assignee: 'Dana Whitfield', due: 'Tue, Jul 21', isDueSoon: false, sourceSec: 1846},
  {id: 'a4', text: 'Drive the remaining 4 launch-checklist items to closed', assignee: 'Jonah Fields', due: 'Wed, Jul 22', isDueSoon: false, sourceSec: 318},
  {id: 'a5', text: 'Schedule the accessibility audit for the new onboarding flow', assignee: 'Elena Vasquez', due: 'Fri, Jul 24', isDueSoon: false, sourceSec: 640},
];

// ============= SMALL HELPERS =============

/** Case-insensitive hit highlighting; returns plain text when no query. */
function renderHighlighted(text: string, query: string): ReactNode {
  const q = query.trim();
  if (q.length < 2) return text;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let hit = lower.indexOf(needle);
  let key = 0;
  while (hit !== -1) {
    if (hit > cursor) parts.push(text.slice(cursor, hit));
    parts.push(
      <span key={key++} style={styles.searchHit}>
        {text.slice(hit, hit + needle.length)}
      </span>,
    );
    cursor = hit + needle.length;
    hit = lower.indexOf(needle, cursor);
  }
  parts.push(text.slice(cursor));
  return parts;
}

function countHits(text: string, query: string): number {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return 0;
  const lower = text.toLowerCase();
  let n = 0;
  let idx = lower.indexOf(q);
  while (idx !== -1) {
    n += 1;
    idx = lower.indexOf(q, idx + q.length);
  }
  return n;
}

// ============= PLAYER STRIP =============

interface PlayerStripProps {
  playheadSec: number;
  isPlaying: boolean;
  isCompact: boolean;
  onTogglePlay: () => void;
  onSeek: (sec: number) => void;
}

function PlayerStrip({
  playheadSec,
  isPlaying,
  isCompact,
  onTogglePlay,
  onSeek,
}: PlayerStripProps) {
  const activeChapter = chapterAt(playheadSec);
  const progressPct = (playheadSec / DURATION_SEC) * 100;

  const stage = (
    <div
      style={
        isCompact ? {...styles.stage, ...styles.stageCompact} : styles.stage
      }>
      <div style={styles.stageGlare} aria-hidden />
      <div style={styles.stageTopRow}>
        <span style={styles.stageChip}>
          <Icon icon={VideoIcon} size="xsm" color="inherit" />
          Recording · {activeChapter.title}
        </span>
      </div>
      <button
        type="button"
        style={styles.stagePlayButton}
        aria-label={isPlaying ? 'Pause recording' : 'Play recording'}
        onClick={onTogglePlay}>
        <Icon icon={isPlaying ? PauseIcon : PlayIcon} size="md" color="inherit" />
      </button>
      <span style={styles.stageDurationChip}>
        {formatSec(playheadSec)} / {formatSec(DURATION_SEC)}
      </span>
      <div style={styles.stageProgressRail} aria-hidden>
        <div style={{...styles.stageProgressFill, width: \`\${progressPct}%\`}} />
      </div>
    </div>
  );

  const scrub = (
    <div style={styles.scrubBlock}>
      <div style={styles.scrubRow}>
        <span style={styles.timecode}>{formatSec(playheadSec)}</span>
        <div style={styles.scrubTrackWrap}>
          <Slider
            label="Recording position"
            isLabelHidden
            value={playheadSec}
            min={0}
            max={DURATION_SEC}
            step={1}
            valueDisplay="none"
            width="100%"
            formatValue={formatSec}
            onChange={onSeek}
          />
        </div>
        <span style={styles.timecode}>{formatSec(DURATION_SEC)}</span>
      </div>
      {/* Chapter markers share the slider's percent scale; the wrapper
          repeats the timecode gutters (left label width + gap) so 0% and
          100% line up with the track ends. */}
      <div style={{display: 'flex', gap: 'var(--spacing-2)'}}>
        <span style={{...styles.timecode, visibility: 'hidden'}} aria-hidden>
          {formatSec(playheadSec)}
        </span>
        <div style={{...styles.chapterMarkerRail, flex: 1, minWidth: 0}}>
          {CHAPTERS.map(ch => (
            <Tooltip
              key={ch.id}
              content={\`\${ch.title} · \${formatSec(ch.startSec)}\`}>
              <button
                type="button"
                aria-label={\`Jump to \${ch.title} at \${formatSec(ch.startSec)}\`}
                style={{
                  ...styles.chapterMarker,
                  left: \`\${(ch.startSec / DURATION_SEC) * 100}%\`,
                  backgroundColor: ch.color,
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
                onClick={() => onSeek(ch.startSec)}
              />
            </Tooltip>
          ))}
        </div>
        <span style={{...styles.timecode, visibility: 'hidden'}} aria-hidden>
          {formatSec(DURATION_SEC)}
        </span>
      </div>
    </div>
  );

  // Full-width sibling of the stage/scrub row (not inside the narrow scrub
  // column) so the six chips wrap into compact lines instead of stacking
  // one per row and leaving dead space under the stage.
  const chips = (
    <div
      style={
        isCompact ? styles.chapterChipRowCompact : styles.chapterChipRow
      }>
      {CHAPTERS.map(ch => {
        const isActive = ch.id === activeChapter.id;
        return (
          <button
            key={ch.id}
            type="button"
            style={{
              ...styles.chapterChip,
              ...(isActive ? styles.chapterChipActive : undefined),
            }}
            aria-pressed={isActive}
            onClick={() => onSeek(ch.startSec)}>
            <span
              style={{...styles.chapterDot, backgroundColor: ch.color}}
              aria-hidden
            />
            {ch.title}
            <span style={styles.timecode}>{formatSec(ch.startSec)}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={styles.playerStrip}>
      {isCompact ? (
        <VStack gap={2}>
          {stage}
          {scrub}
        </VStack>
      ) : (
        <div style={styles.playerRow}>
          {stage}
          {scrub}
        </div>
      )}
      {chips}
    </div>
  );
}

// ============= TRANSCRIPT PANE =============

interface TranscriptPaneProps {
  query: string;
  selectedSpeakers: ReadonlySet<string>;
  activeSegmentId: string | null;
  isStacked: boolean;
  onQueryChange: (q: string) => void;
  onToggleSpeaker: (name: string) => void;
  onClearSpeakers: () => void;
  onSeek: (sec: number) => void;
}

function TranscriptPane({
  query,
  selectedSpeakers,
  activeSegmentId,
  isStacked,
  onQueryChange,
  onToggleSpeaker,
  onClearSpeakers,
  onSeek,
}: TranscriptPaneProps) {
  const hasQuery = query.trim().length >= 2;

  // Derived during render (no effects): speaker filter first, then search.
  const speakerFiltered =
    selectedSpeakers.size === 0
      ? TRANSCRIPT
      : TRANSCRIPT.filter(s => selectedSpeakers.has(s.speaker));
  const visible = hasQuery
    ? speakerFiltered.filter(s => countHits(s.text, query) > 0)
    : speakerFiltered;
  const totalHits = hasQuery
    ? visible.reduce((sum, s) => sum + countHits(s.text, query), 0)
    : 0;

  return (
    <div
      style={isStacked ? styles.transcriptPaneStacked : styles.transcriptPane}>
      <div style={styles.transcriptToolbar}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <TextInput
              label="Search transcript"
              isLabelHidden
              size="sm"
              width="100%"
              placeholder="Search transcript…"
              startIcon={<Icon icon={SearchIcon} size="sm" />}
              value={query}
              onChange={onQueryChange}
              hasClear
            />
          </StackItem>
          {hasQuery && (
            <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
              {totalHits} {totalHits === 1 ? 'match' : 'matches'} in{' '}
              {visible.length} of {TRANSCRIPT.length} segments
            </Text>
          )}
        </HStack>
        <div style={styles.speakerChipRow}>
          <ToggleButton
            label="All speakers"
            size="sm"
            isPressed={selectedSpeakers.size === 0}
            onPressedChange={onClearSpeakers}
          />
          {SPEAKERS.map(p => (
            <ToggleButton
              key={p.name}
              label={p.name.split(' ')[0]}
              size="sm"
              isPressed={selectedSpeakers.has(p.name)}
              onPressedChange={() => onToggleSpeaker(p.name)}
              icon={
                <span
                  style={{...styles.chapterDot, backgroundColor: p.color}}
                  aria-hidden
                />
              }
            />
          ))}
        </div>
      </div>
      <div style={styles.transcriptScroll}>
        {visible.length === 0 ? (
          <EmptyState
            title="No matching segments"
            description="Try a different search term or clear the speaker filter."
            icon={<Icon icon={SearchIcon} size="lg" color="secondary" />}
            isCompact
          />
        ) : (
          visible.map(seg => {
            const person = SPEAKER_BY_NAME.get(seg.speaker);
            const isActive = seg.id === activeSegmentId;
            return (
              <div
                key={seg.id}
                style={{
                  ...styles.segmentRow,
                  ...(isActive ? styles.segmentRowActive : undefined),
                }}>
                <Avatar name={seg.speaker} size="small" />
                <div style={styles.segmentBody}>
                  <div style={styles.segmentSpeakerRow}>
                    <Text type="body" size="sm" weight="bold">
                      {seg.speaker}
                    </Text>
                    {person && (
                      <span
                        style={{...styles.chapterDot, backgroundColor: person.color}}
                        aria-hidden
                      />
                    )}
                    <button
                      type="button"
                      style={styles.segmentTimeButton}
                      aria-label={\`Jump recording to \${formatSec(seg.startSec)}\`}
                      onClick={() => onSeek(seg.startSec)}>
                      {formatSec(seg.startSec)}
                    </button>
                    {isActive && (
                      <Badge label="Now playing" variant="info" />
                    )}
                  </div>
                  <Text type="body" size="sm" color="primary">
                    {renderHighlighted(seg.text, query)}
                  </Text>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============= AI SUMMARY CARD =============

interface SummaryCardProps {
  isCopied: boolean;
  feedback: 'up' | 'down' | null;
  onCopy: () => void;
  onFeedback: (value: 'up' | 'down') => void;
}

function SummaryCard({isCopied, feedback, onCopy, onFeedback}: SummaryCardProps) {
  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={SparklesIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={2}>AI summary</Heading>
          </StackItem>
          <Button
            label={isCopied ? 'Copied' : 'Copy'}
            size="sm"
            variant="ghost"
            icon={
              <Icon
                icon={isCopied ? CheckIcon : CopyIcon}
                size="sm"
                color="inherit"
              />
            }
            onClick={onCopy}
          />
        </HStack>
        <Text type="supporting" size="xsm" color="secondary">
          Generated by Kestrel AI from the recording · review before sharing
        </Text>
        <Text type="body" size="sm" weight="bold">
          Key points
        </Text>
        <ul style={styles.keyPointList}>
          {SUMMARY_KEY_POINTS.map(point => (
            <li key={point}>
              <Text type="body" size="sm">
                {point}
              </Text>
            </li>
          ))}
        </ul>
        <Divider />
        <Text type="body" size="sm" weight="bold">
          Decisions
        </Text>
        <VStack gap={2}>
          {SUMMARY_DECISIONS.map(d => (
            <div key={d.id} style={styles.decisionRow}>
              <Badge label={d.label} variant="success" />
              <Text type="body" size="sm">
                {d.detail}
              </Text>
            </div>
          ))}
        </VStack>
        <Divider />
        <HStack gap={1} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" size="xsm" color="secondary">
              Was this summary useful?
            </Text>
          </StackItem>
          <IconButton
            label="Summary was useful"
            size="sm"
            variant={feedback === 'up' ? 'secondary' : 'ghost'}
            icon={<Icon icon={ThumbsUpIcon} size="sm" color="inherit" />}
            onClick={() => onFeedback('up')}
          />
          <IconButton
            label="Summary was not useful"
            size="sm"
            variant={feedback === 'down' ? 'secondary' : 'ghost'}
            icon={<Icon icon={ThumbsDownIcon} size="sm" color="inherit" />}
            onClick={() => onFeedback('down')}
          />
        </HStack>
      </VStack>
    </Card>
  );
}

// ============= ACTION ITEMS CARD =============

interface ActionItemsCardProps {
  doneIds: ReadonlySet<string>;
  addedIds: ReadonlySet<string>;
  onToggleDone: (id: string, checked: boolean) => void;
  onAdd: (id: string) => void;
  onAddAll: () => void;
  onSeek: (sec: number) => void;
}

function ActionItemsCard({
  doneIds,
  addedIds,
  onToggleDone,
  onAdd,
  onAddAll,
  onSeek,
}: ActionItemsCardProps) {
  const openCount = ACTION_ITEMS.length - doneIds.size;
  const allAdded = addedIds.size === ACTION_ITEMS.length;
  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ListChecksIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={2}>Action items</Heading>
          </StackItem>
          <Badge
            label={\`\${openCount} open\`}
            variant={openCount > 0 ? 'warning' : 'success'}
          />
        </HStack>
        <VStack gap={0}>
          {ACTION_ITEMS.map((item, i) => {
            const isDone = doneIds.has(item.id);
            const isAdded = addedIds.has(item.id);
            return (
              <div key={item.id}>
                {i > 0 && <Divider />}
                <div style={styles.actionItemRow}>
                  <CheckboxInput
                    label={\`Mark "\${item.text}" complete\`}
                    isLabelHidden
                    size="sm"
                    value={isDone}
                    onChange={checked => onToggleDone(item.id, checked)}
                  />
                  <div style={styles.segmentBody}>
                    <Text type="body" size="sm" hasStrikethrough={isDone}>
                      {item.text}
                    </Text>
                    <div style={styles.actionItemMetaRow}>
                      <HStack gap={1} vAlign="center">
                        <Avatar name={item.assignee} size="tiny" />
                        <Text type="supporting" size="xsm" color="secondary">
                          {item.assignee}
                        </Text>
                      </HStack>
                      <Token
                        label={\`Due \${item.due}\`}
                        size="sm"
                        color={item.isDueSoon ? 'orange' : 'default'}
                        icon={
                          <Icon
                            icon={CalendarClockIcon}
                            size="xsm"
                            color="inherit"
                          />
                        }
                      />
                      <button
                        type="button"
                        style={styles.segmentTimeButton}
                        aria-label={\`Play source at \${formatSec(item.sourceSec)}\`}
                        onClick={() => onSeek(item.sourceSec)}>
                        {formatSec(item.sourceSec)}
                      </button>
                      <span style={{flex: 1}} aria-hidden />
                      <Button
                        label={isAdded ? 'Added' : 'Add to Tasks'}
                        size="sm"
                        variant="ghost"
                        isDisabled={isAdded}
                        icon={
                          <Icon
                            icon={isAdded ? CheckIcon : ClipboardListIcon}
                            size="sm"
                            color="inherit"
                          />
                        }
                        onClick={() => onAdd(item.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </VStack>
        <Button
          label={allAdded ? 'All added to Tasks' : 'Add all to Tasks'}
          size="sm"
          variant="secondary"
          isDisabled={allAdded}
          icon={
            <Icon
              icon={allAdded ? CheckIcon : ClipboardListIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={onAddAll}
        />
      </VStack>
    </Card>
  );
}

// ============= ATTENDANCE & TALK-TIME ANALYTICS =============

/** Bars share one scale: 0–30% of speaking time (max share is 27%), with
 * the axis labeled so the chart is never axis-less (footgun 10). */
const BAR_SCALE_MAX_PCT = 30;

function AnalyticsCard() {
  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={UsersIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={2}>Attendance & talk time</Heading>
          </StackItem>
        </HStack>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <AvatarGroup size="small" aria-label="Attendees">
            {ATTENDEE_NAMES.slice(0, 6).map(name => (
              <Avatar key={name} name={name} />
            ))}
            <AvatarGroupOverflow count={ATTENDEE_NAMES.length - 6} />
          </AvatarGroup>
          <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
            {MEETING.attendedCount} of {MEETING.invitedCount} attended ·{' '}
            {MEETING.recordedLabel}
          </Text>
        </HStack>
        <Text type="supporting" size="xsm" color="secondary">
          Absent: {ABSENTEES.join(', ')} · silent: {SILENT_ATTENDEES.join(', ')}
        </Text>
        <Divider />
        <VStack gap={2}>
          {SPEAKERS.map(p => (
            <div key={p.name} style={styles.barRow}>
              <HStack gap={1} vAlign="center">
                <Avatar name={p.name} size="tiny" />
                <Text type="supporting" size="xsm" color="primary" maxLines={1}>
                  {p.name.split(' ')[0]}
                </Text>
              </HStack>
              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: \`\${(p.sharePct / BAR_SCALE_MAX_PCT) * 100}%\`,
                    backgroundColor: p.color,
                  }}
                  role="img"
                  aria-label={\`\${p.name} spoke \${formatSec(p.talkSec)} (\${p.sharePct}% of speaking time)\`}
                />
              </div>
              <span style={styles.barValue}>
                {formatSec(p.talkSec)} · {p.sharePct}%
              </span>
            </div>
          ))}
        </VStack>
        {/* Labeled axis for the shared 0–30% scale. */}
        <div style={styles.axisRow} aria-hidden>
          <span />
          <div style={styles.axisScale}>
            <span style={styles.barValue}>0%</span>
            <span style={styles.barValue}>15%</span>
            <span style={styles.barValue}>30%</span>
          </div>
          <span />
        </div>
        <Text type="supporting" size="xsm" color="secondary">
          Share of {TOTAL_TALK_LABEL}; bars use one 0–30% scale.
        </Text>
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

export default function MeetingRecapTranscriptTemplate() {
  const isStacked = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  // Playback: a plain 1 Hz interval while "playing" — no Date math.
  const [playheadSec, setPlayheadSec] = useState(231);
  const [isPlaying, setIsPlaying] = useState(false);

  // Transcript controls.
  const [query, setQuery] = useState('');
  const [selectedSpeakers, setSelectedSpeakers] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  // Panel widgets.
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [doneIds, setDoneIds] = useState<ReadonlySet<string>>(() => new Set());
  const [addedIds, setAddedIds] = useState<ReadonlySet<string>>(
    () => new Set(['a1']), // Sofia already pushed hers to Tasks.
  );
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const id = setInterval(() => {
      setPlayheadSec(prev => {
        if (prev + 1 >= DURATION_SEC) {
          setIsPlaying(false);
          return DURATION_SEC;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  const seek = (sec: number) => {
    setPlayheadSec(Math.max(0, Math.min(DURATION_SEC, sec)));
  };

  // Derived in render: the last segment at or before the playhead.
  const activeSegmentId = useMemo(() => {
    let current: string | null = null;
    for (const seg of TRANSCRIPT) {
      if (seg.startSec <= playheadSec) current = seg.id;
    }
    return current;
  }, [playheadSec]);

  const toggleSpeaker = (name: string) => {
    setSelectedSpeakers(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const toggleDone = (id: string, checked: boolean) => {
    setDoneIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const panelWidgets = (
    <>
      <SummaryCard
        isCopied={isCopied}
        feedback={feedback}
        onCopy={() => setIsCopied(true)}
        onFeedback={value =>
          setFeedback(prev => (prev === value ? null : value))
        }
      />
      <ActionItemsCard
        doneIds={doneIds}
        addedIds={addedIds}
        onToggleDone={toggleDone}
        onAdd={id => setAddedIds(prev => new Set(prev).add(id))}
        onAddAll={() =>
          setAddedIds(new Set(ACTION_ITEMS.map(item => item.id)))
        }
        onSeek={seek}
      />
      <AnalyticsCard />
    </>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={2} vAlign="center">
              <IconButton
                label="Back to meetings"
                variant="ghost"
                icon={<Icon icon={ArrowLeftIcon} size="sm" color="inherit" />}
              />
              <StackItem size="fill">
                <div style={styles.titleBlock}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Heading level={1}>{MEETING.title}</Heading>
                    <Badge label="Recap" variant="info" />
                  </HStack>
                  <div style={styles.headerMetaRow}>
                    <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
                      {MEETING.when}
                    </Text>
                    {!isCompact && (
                      <>
                        <Text type="supporting" size="sm" color="secondary">
                          · {MEETING.durationLabel} · {MEETING.recordedLabel} ·
                          organized by {MEETING.organizer}
                        </Text>
                      </>
                    )}
                    <Tooltip content={\`Absent: \${ABSENTEES.join(', ')}\`}>
                      <Token
                        label={\`\${MEETING.attendedCount}/\${MEETING.invitedCount} attended\`}
                        size="sm"
                        color="green"
                        icon={<Icon icon={UsersIcon} size="xsm" color="inherit" />}
                      />
                    </Tooltip>
                  </div>
                </div>
              </StackItem>
              <HStack gap={1} vAlign="center">
                {isCompact ? (
                  <IconButton
                    label={isShared ? 'Recap link copied' : 'Share recap'}
                    variant="secondary"
                    icon={
                      <Icon
                        icon={isShared ? CheckIcon : Share2Icon}
                        size="sm"
                        color="inherit"
                      />
                    }
                    onClick={() => setIsShared(true)}
                  />
                ) : (
                  <Button
                    label={isShared ? 'Link copied' : 'Share recap'}
                    variant="secondary"
                    icon={
                      <Icon
                        icon={isShared ? CheckIcon : Share2Icon}
                        size="sm"
                        color="inherit"
                      />
                    }
                    onClick={() => setIsShared(true)}
                  />
                )}
                <Tooltip content="Download transcript (.vtt)">
                  <IconButton
                    label="Download transcript"
                    variant="ghost"
                    icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
                  />
                </Tooltip>
                {!isCompact && (
                  <Tooltip content="Open the Atlas Q3 Launch Narrative doc">
                    <IconButton
                      label="Open linked doc"
                      variant="ghost"
                      icon={<Icon icon={FileTextIcon} size="sm" color="inherit" />}
                    />
                  </Tooltip>
                )}
              </HStack>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div
              style={
                isStacked ? styles.recapColumnStacked : styles.recapColumn
              }>
              <PlayerStrip
                playheadSec={playheadSec}
                isPlaying={isPlaying}
                isCompact={isCompact}
                onTogglePlay={() => setIsPlaying(prev => !prev)}
                onSeek={seek}
              />
              <TranscriptPane
                query={query}
                selectedSpeakers={selectedSpeakers}
                activeSegmentId={activeSegmentId}
                isStacked={isStacked}
                onQueryChange={setQuery}
                onToggleSpeaker={toggleSpeaker}
                onClearSpeakers={() => setSelectedSpeakers(new Set())}
                onSeek={seek}
              />
              {isStacked && (
                <div style={styles.stackedPanel}>{panelWidgets}</div>
              )}
            </div>
          </LayoutContent>
        }
        end={
          !isStacked ? (
            <LayoutPanel width={380} padding={0} label="Recap details">
              <div style={styles.panelScroll}>{panelWidgets}</div>
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
`;export{e as default};