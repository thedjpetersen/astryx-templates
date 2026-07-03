// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (the 'Cadence Club' athlete feed for
 *   Dana Whitfield: 7 activity records spanning Mon Jun 29 – Fri Jul 3 2026
 *   with fixed distances/times/paces/elevations, hand-plotted SVG route
 *   polylines over 3 reusable map scenes, fixed kudos counts + facepile
 *   name lists, canned comment threads, a weekly snapshot (32.4 of 40 km
 *   goal, per-day bars that sum exactly to 32.4), and a July climbing
 *   challenge at 3,400 of 5,000 m = 68% whose top-contributor meters match
 *   the elevation figures on the feed cards — no clocks, no randomness,
 *   no network media)
 * @output Strava-style fitness social feed for the fictional 'Cadence Club'
 *   brand (orange accent): a 64px top nav (accent brand mark, Home /
 *   Explore / Challenges / Clubs nav buttons with an accent active
 *   underline, athlete search, accent 'Record' CTA, Avatar), a 300px left
 *   rail (profile snapshot card + weekly
 *   progress card with an SVG distance-vs-goal ring and 7-day mini bars),
 *   a center feed of activity cards — each with athlete header row, route
 *   map rendered as an SVG polyline over a muted map-tile scene,
 *   distance / pace / time / elevation stat row, optional crown
 *   segment-achievement callout or PR badge, and a kudos + comment row
 *   with AvatarGroup facepile, working kudos ToggleButton, and expandable
 *   comment thread with composer — and a 320px right rail (club climbing
 *   challenge card at 68% with contributor leaderboard + suggested
 *   athletes with Follow toggles)
 * @position Page template; emitted by `astryx template fitness-activity-feed`
 *
 * Frame: root 100dvh div > Layout height="fill"; LayoutHeader pins the nav;
 * LayoutContent is the single page scroller. Inside it a 1360px-max centered
 * flex row: left rail 300px (sticky), feed column flexible (max 680px),
 * right rail 320px (sticky).
 *
 * Responsive contract:
 * - >1180px: full three-column layout; rails stick under the nav while the
 *   feed scrolls.
 * - <=1180px: the right rail leaves the frame; the challenge card re-homes
 *   to the bottom of the left rail so the 68% surface never disappears.
 * - <=860px: both rails leave the frame; the weekly-progress and challenge
 *   cards render stacked above the feed, the nav drops the TabList and the
 *   search input (search collapses to an IconButton), and stat rows wrap.
 *
 * Container policy (consumer social-feed archetype): design-system Cards are
 * the genuine content unit here — each feed activity and each rail widget is
 * a Card; the nav chrome is frame-first custom paint. Route maps are inline
 * SVG scenes (muted tile base, water/park shapes, street grid) so the feed
 * is asset-free and deterministic.
 *
 * Color policy: ONE brand accent — Cadence Club orange
 * light-dark(#C2410C, #FB923C) — reserved for the brand mark, the Record
 * CTA, the active nav underline, the route polylines, the goal ring /
 * week bars, and kudos-given emphasis. Text on the accent uses
 * light-dark(#FFFFFF, #431407) (AA in both schemes). Map scenes use fixed
 * light-dark() literal pairs (tile base, water, park, street) because they
 * imitate map tiles, not UI chrome; everything else is token-pure so both
 * schemes pass.
 */

import {useState, type CSSProperties} from 'react';

import {
  ActivityIcon,
  BellIcon,
  BellOffIcon,
  BikeIcon,
  BookmarkIcon,
  CrownIcon,
  FlagIcon,
  FootprintsIcon,
  MedalIcon,
  MessageCircleIcon,
  MountainIcon,
  PlusIcon,
  SearchIcon,
  Share2Icon,
  ThumbsUpIcon,
  TimerIcon,
  UserPlusIcon,
  UsersIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
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
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= BRAND CONSTANTS =============
// Cadence Club orange — the ONE brand accent (light 700-weight / dark
// 400-weight). ON_ACCENT clears AA on the accent in both schemes.

const BRAND_ACCENT = 'light-dark(#C2410C, #FB923C)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(194, 65, 12, 0.10), rgba(251, 146, 60, 0.14))';
const BRAND_ACCENT_BORDER =
  'light-dark(rgba(194, 65, 12, 0.32), rgba(251, 146, 60, 0.38))';
const ON_ACCENT = 'light-dark(#FFFFFF, #431407)';

// Map-tile scene literals (imitating basemap tiles, not UI chrome — see the
// header Color policy block). Streets are near-white on the light tile and
// faint light strokes on the dark tile, exactly like muted map styles.
const MAP_BASE = 'light-dark(#EDEFE9, #21252B)';
const MAP_WATER = 'light-dark(#D3E2EE, #24343F)';
const MAP_PARK = 'light-dark(#DEE9D3, #273428)';
const MAP_STREET = 'light-dark(#FFFFFF, rgba(231, 236, 243, 0.09))';
const ROUTE_HALO = 'light-dark(rgba(255, 255, 255, 0.92), rgba(10, 12, 16, 0.62))';
const ROUTE_START = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const ROUTE_END = 'light-dark(#1F2937, #E7EAF0)';

// ============= FIXTURES =============

const YOU = 'Dana Whitfield';

type Sport = 'run' | 'ride';

interface MapScene {
  /** SVG path for a water body, drawn under the street grid. */
  water?: string;
  /** Park blocks (greenspace) in the 320x180 viewBox. */
  parks: ReadonlyArray<{x: number; y: number; w: number; h: number}>;
  /** Vertical / horizontal street coordinates. */
  streetsX: readonly number[];
  streetsY: readonly number[];
}

interface Achievement {
  kind: 'crown' | 'pr';
  title: string;
  detail: string;
}

interface FeedComment {
  author: string;
  text: string;
  timeLabel: string;
}

interface FeedActivity {
  id: string;
  athlete: string;
  isOwn: boolean;
  sport: Sport;
  title: string;
  /** e.g. 'July 3, 2026 at 6:12 AM' */
  dateLabel: string;
  location: string;
  distance: string; // '10.1 km'
  paceLabel: 'Pace' | 'Speed';
  pace: string; // '4:42 /km' | '26.0 km/h'
  movingTime: string; // '47:32'
  elevation: string; // '86 m'
  /** Meters of climbing as a number, reconciled with the challenge card. */
  elevationM: number;
  sceneIndex: number;
  /** Route polyline in the 320x180 map viewBox. */
  route: string;
  achievement?: Achievement;
  hasPrBadge?: boolean;
  withLabel?: string;
  kudosBase: number;
  kudosFaces: readonly string[];
  comments: readonly FeedComment[];
}

// Three reusable basemap scenes; each activity references one by index so
// every card's map is deterministic and asset-free.
const MAP_SCENES: readonly MapScene[] = [
  {
    // Riverfront: river hugging the right edge, one big park block.
    water:
      'M252 0 C 238 34, 258 74, 244 112 C 234 142, 250 166, 244 180 L 320 180 L 320 0 Z',
    parks: [{x: 34, y: 94, w: 74, h: 54}],
    streetsX: [40, 88, 136, 184, 232],
    streetsY: [36, 76, 116, 156],
  },
  {
    // Gorge / canal: water band along the bottom, two green blocks.
    water:
      'M0 148 C 56 130, 118 158, 198 140 C 258 126, 296 142, 320 132 L 320 180 L 0 180 Z',
    parks: [
      {x: 22, y: 18, w: 66, h: 44},
      {x: 148, y: 24, w: 54, h: 38},
    ],
    streetsX: [56, 112, 168, 224, 280],
    streetsY: [40, 84],
  },
  {
    // Inland grid: no water, two parks (one wraps the track oval).
    parks: [
      {x: 104, y: 62, w: 104, h: 70},
      {x: 250, y: 22, w: 52, h: 40},
    ],
    streetsX: [36, 78, 120, 200, 242, 284],
    streetsY: [30, 70, 110, 150],
  },
];

// Feed reconciliation contract:
// - Dana's four activities (Jun 29, Jul 1, Jul 2, Jul 3) sum to the weekly
//   card: 8.2 + 6.4 + 7.7 + 10.1 = 32.4 km; 40:19 + 38:56 + 42:10 + 47:32 =
//   2h 49m; elevation 0 + 272 + 54 + 86 = 412 m.
// - July-dated elevation (272 + 54 + 86 = 412 m) is Dana's line on the
//   challenge leaderboard; Maya's 618 m and Priya's 402 m match their cards.
// - Facepile faces + AvatarGroupOverflow count always equal the kudos count.
const ACTIVITIES: readonly FeedActivity[] = [
  {
    id: 'a1',
    athlete: YOU,
    isOwn: true,
    sport: 'run',
    sceneIndex: 0,
    title: 'Friday Tempo — Riverfront Loop',
    dateLabel: 'July 3, 2026 at 6:12 AM',
    location: 'Ashford Riverfront',
    distance: '10.1 km',
    paceLabel: 'Pace',
    pace: '4:42 /km',
    movingTime: '47:32',
    elevation: '86 m',
    elevationM: 86,
    route:
      '62,142 60,110 64,84 82,70 110,64 148,60 186,62 214,72 228,96 226,120 210,138 178,146 142,150 106,150 78,148 62,142',
    kudosBase: 12,
    kudosFaces: ['Maya Okafor', 'Jonah Reyes', 'Priya Natarajan'],
    comments: [
      {
        author: 'Maya Okafor',
        text: 'Strong negative split — race pace is coming along.',
        timeLabel: '2h ago',
      },
      {
        author: 'Jonah Reyes',
        text: 'Riverfront at sunrise is unbeatable. Same loop tomorrow?',
        timeLabel: '1h ago',
      },
    ],
  },
  {
    id: 'a2',
    athlete: 'Maya Okafor',
    isOwn: false,
    sport: 'ride',
    title: 'Gorge Road Repeats',
    dateLabel: 'July 2, 2026 at 5:48 PM',
    location: 'Marrow Gorge',
    distance: '42.6 km',
    paceLabel: 'Speed',
    pace: '26.0 km/h',
    movingTime: '1:38:12',
    elevation: '618 m',
    elevationM: 618,
    sceneIndex: 1,
    route:
      '16,44 48,52 84,40 118,56 152,44 188,60 224,48 258,64 292,52 296,60 262,72 228,58 192,70 156,54 122,66 88,50 52,62 18,54',
    achievement: {
      kind: 'crown',
      title: '2nd fastest time on Ridgeline Sprint',
      detail: '1:42 — leaderboard #2 of 1,204 athletes',
    },
    kudosBase: 31,
    kudosFaces: ['Jonah Reyes', 'Priya Natarajan', 'Sam Teller'],
    comments: [
      {
        author: 'Sam Teller',
        text: 'Six repeats in that heat is serious work.',
        timeLabel: '14h ago',
      },
      {
        author: YOU,
        text: 'That Ridgeline Sprint time is getting scary. QOM soon.',
        timeLabel: '13h ago',
      },
    ],
  },
  {
    id: 'a3',
    athlete: 'Jonah Reyes',
    isOwn: false,
    sport: 'run',
    title: 'Track Thursday — 5K Test',
    dateLabel: 'July 2, 2026 at 6:30 AM',
    location: 'Kettleburn Track',
    distance: '5.0 km',
    paceLabel: 'Pace',
    pace: '3:49 /km',
    movingTime: '19:04',
    elevation: '12 m',
    elevationM: 12,
    sceneIndex: 2,
    route:
      '156,152 156,122 136,118 124,106 124,90 136,78 158,74 180,76 194,86 196,102 186,114 168,120 156,122',
    achievement: {
      kind: 'pr',
      title: 'New personal record: fastest 5K',
      detail: '19:04 — 22 seconds faster than March 2026',
    },
    hasPrBadge: true,
    kudosBase: 44,
    kudosFaces: ['Maya Okafor', 'Priya Natarajan', 'Sam Teller'],
    comments: [
      {
        author: 'Priya Natarajan',
        text: 'Called it after your 800s last week. Huge.',
        timeLabel: '22h ago',
      },
      {
        author: YOU,
        text: 'Massive PR. Sub-19 is right there.',
        timeLabel: '20h ago',
      },
      {
        author: 'Jonah Reyes',
        text: 'Thanks all — pacing owed entirely to the Tuesday group.',
        timeLabel: '19h ago',
      },
    ],
  },
  {
    id: 'a4',
    athlete: YOU,
    isOwn: true,
    sport: 'run',
    title: 'Thursday Easy — Canal Path',
    dateLabel: 'July 2, 2026 at 7:05 AM',
    location: 'Ashford Canal District',
    distance: '7.7 km',
    paceLabel: 'Pace',
    pace: '5:29 /km',
    movingTime: '42:10',
    elevation: '54 m',
    elevationM: 54,
    sceneIndex: 1,
    route:
      '24,120 60,112 96,118 132,108 168,114 204,104 240,110 276,100 278,108 242,118 206,112 170,122 134,116 98,126 62,120 26,128',
    kudosBase: 8,
    kudosFaces: ['Maya Okafor'],
    comments: [],
  },
  {
    id: 'a5',
    athlete: 'Priya Natarajan',
    isOwn: false,
    sport: 'ride',
    title: 'Sunrise Century Prep',
    dateLabel: 'July 1, 2026 at 5:55 AM',
    location: 'Weststrand Flats',
    distance: '68.4 km',
    paceLabel: 'Speed',
    pace: '28.4 km/h',
    movingTime: '2:24:40',
    elevation: '402 m',
    elevationM: 402,
    sceneIndex: 0,
    route:
      '40,160 36,120 44,84 64,56 96,40 136,32 180,32 220,42 248,64 262,96 258,128 240,152 208,166 168,170 128,168 88,166 40,160',
    withLabel: 'with Sam Teller and 2 others',
    kudosBase: 27,
    kudosFaces: ['Maya Okafor', 'Sam Teller'],
    comments: [
      {
        author: 'Sam Teller',
        text: 'Rotating pulls made that headwind almost fair.',
        timeLabel: '2d ago',
      },
    ],
  },
  {
    id: 'a6',
    athlete: YOU,
    isOwn: true,
    sport: 'run',
    title: 'Hollow Ridge Trail',
    dateLabel: 'July 1, 2026 at 6:20 AM',
    location: 'Hollow Ridge Preserve',
    distance: '6.4 km',
    paceLabel: 'Pace',
    pace: '6:05 /km',
    movingTime: '38:56',
    elevation: '272 m',
    elevationM: 272,
    sceneIndex: 2,
    route:
      '44,156 60,132 52,108 72,92 66,68 92,56 118,64 142,50 170,58 196,44 224,54 250,40 276,50 292,36',
    kudosBase: 15,
    kudosFaces: ['Jonah Reyes', 'Priya Natarajan'],
    comments: [
      {
        author: 'Priya Natarajan',
        text: '272 m in 6.4 km — that ridge never gives an inch.',
        timeLabel: '2d ago',
      },
    ],
  },
  {
    id: 'a7',
    athlete: YOU,
    isOwn: true,
    sport: 'run',
    title: 'Track Monday — 6 x 800s',
    dateLabel: 'June 29, 2026 at 5:58 AM',
    location: 'Kettleburn Track',
    distance: '8.2 km',
    paceLabel: 'Pace',
    pace: '4:55 /km',
    movingTime: '40:19',
    elevation: '0 m',
    elevationM: 0,
    sceneIndex: 2,
    route:
      '156,148 156,122 136,118 124,106 124,90 136,78 158,74 180,76 194,86 196,102 186,114 168,120 156,122 136,118 124,106 124,90 136,78 158,74',
    kudosBase: 9,
    kudosFaces: ['Jonah Reyes', 'Maya Okafor'],
    comments: [],
  },
];

// Weekly snapshot — Mon Jun 29 through Sun Jul 5, 2026. Bars sum to 32.4.
interface WeekDay {
  label: string;
  day: string;
  km: number;
  isToday?: boolean;
}

const WEEK_GOAL_KM = 40;
const WEEK_DONE_KM = 32.4;
const WEEK_TIME = '2h 49m';
const WEEK_ELEV_M = 412;
const WEEK_DAYS: readonly WeekDay[] = [
  {label: 'M', day: 'Monday Jun 29', km: 8.2},
  {label: 'T', day: 'Tuesday Jun 30', km: 0},
  {label: 'W', day: 'Wednesday Jul 1', km: 6.4},
  {label: 'T', day: 'Thursday Jul 2', km: 7.7},
  {label: 'F', day: 'Friday Jul 3', km: 10.1, isToday: true},
  {label: 'S', day: 'Saturday Jul 4', km: 0},
  {label: 'S', day: 'Sunday Jul 5', km: 0},
];

// July climbing challenge — club-collective goal. Leaderboard meters sum to
// the 3,400 m headline (618 + 412 + 402 + 1,968) = 68% of 5,000 m; Maya's,
// Dana's, and Priya's meters match their July feed cards / weekly totals.
const CHALLENGE = {
  name: 'July Climbing Challenge',
  club: 'Ashford Run Collective',
  goalM: 5000,
  doneM: 3400,
  pct: 68,
  daysLeft: 28,
  athletes: 24,
  leaders: [
    {name: 'Maya Okafor', meters: 618},
    {name: YOU, meters: 412},
    {name: 'Priya Natarajan', meters: 402},
  ],
  restLabel: '21 more athletes',
  restMeters: 1968,
} as const;

const PROFILE_STATS = [
  {label: 'Following', value: '128'},
  {label: 'Followers', value: '212'},
  {label: 'Activities', value: '641'},
] as const;

const SUGGESTED_ATHLETES = [
  {name: 'Robbie Calloway', detail: 'Ashford Run Collective · 12 mutuals'},
  {name: 'Ines Fontaine', detail: 'Rode with Maya Okafor · 8 mutuals'},
  {name: 'Theo Brandt', detail: 'Kettleburn Track regular · 5 mutuals'},
] as const;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    width: '100%',
    paddingBlock: 'var(--spacing-2)',
  },
  brandMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-container)',
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    flexShrink: 0,
  },
  wordmark: {
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap',
  },
  navRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)'},
  navBtn: {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    padding: '8px 10px',
    borderRadius: 'var(--radius-control, 8px)',
  },
  navBtnActive: {
    color: BRAND_ACCENT,
    boxShadow: `inset 0 -2px 0 0 ${BRAND_ACCENT}`,
    borderEndStartRadius: 0,
    borderEndEndRadius: 0,
  },
  recordBtn: {
    appearance: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    font: 'inherit',
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  headerSearch: {width: 240},
  // ---- page columns ----
  pageRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 'var(--spacing-4)',
    width: '100%',
    maxWidth: 1360,
    margin: '0 auto',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  railLeft: {
    width: 300,
    flexShrink: 0,
    position: 'sticky',
    insetBlockStart: 'var(--spacing-4)',
  },
  railRight: {
    width: 320,
    flexShrink: 0,
    position: 'sticky',
    insetBlockStart: 'var(--spacing-4)',
  },
  feedCol: {flex: 1, minWidth: 0, maxWidth: 680},
  // ---- map ----
  mapWrap: {
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
  },
  mapSvg: {display: 'block', width: '100%', height: 'auto'},
  // ---- stat row ----
  statRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-4)',
    flexWrap: 'wrap',
  },
  statBlock: {display: 'flex', flexDirection: 'column', gap: 2},
  statValue: {
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statDivider: {
    width: 'var(--border-width)',
    backgroundColor: 'var(--color-border)',
    alignSelf: 'stretch',
  },
  // ---- achievement + PR ----
  achievement: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: BRAND_ACCENT_SOFT,
    border: `var(--border-width) solid ${BRAND_ACCENT_BORDER}`,
  },
  achievementIcon: {color: BRAND_ACCENT, display: 'inline-flex', marginTop: 2},
  prChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  // ---- kudos / comments ----
  kudosGiven: {color: BRAND_ACCENT},
  commentRow: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start'},
  commentBubble: {
    flex: 1,
    minWidth: 0,
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // ---- weekly progress ring ----
  ringWrap: {position: 'relative', width: 116, height: 116, flexShrink: 0},
  ringCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  ringValue: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  // ---- 7-day mini bars ----
  weekBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 'var(--spacing-2)',
    height: 64,
  },
  weekBarCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    height: '100%',
  },
  weekBar: {
    width: '100%',
    maxWidth: 22,
    borderRadius: 3,
    backgroundColor: BRAND_ACCENT,
  },
  weekBarRest: {
    width: '100%',
    maxWidth: 22,
    height: 3,
    borderRadius: 3,
    backgroundColor: 'var(--color-border)',
  },
  weekBarToday: {
    boxShadow: `0 0 0 2px var(--color-background-card), 0 0 0 4px ${BRAND_ACCENT_BORDER}`,
  },
  // ---- challenge / leaderboard ----
  challengeIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-container)',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  leaderMeters: {
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
    whiteSpace: 'nowrap',
  },
  // ---- misc ----
  caughtUp: {
    textAlign: 'center',
    padding: 'var(--spacing-5) var(--spacing-3)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= ROUTE MAP =============

/**
 * Muted map-tile placeholder (base, water, parks, street grid) with the
 * activity's route drawn as a haloed accent polyline, start dot (green) and
 * finish dot. All geometry lives in one 320x180 viewBox.
 */
function RouteMap({activity}: {activity: FeedActivity}) {
  const scene = MAP_SCENES[activity.sceneIndex];
  const points = activity.route
    .split(' ')
    .map(pair => pair.split(',').map(Number) as [number, number]);
  const [startX, startY] = points[0];
  const [endX, endY] = points[points.length - 1];
  return (
    <div style={styles.mapWrap}>
      <svg
        viewBox="0 0 320 180"
        style={styles.mapSvg}
        role="img"
        aria-label={`Route map: ${activity.title}, ${activity.distance} in ${activity.location}`}>
        <rect x={0} y={0} width={320} height={180} style={{fill: MAP_BASE}} />
        {scene.parks.map(park => (
          <rect
            key={`${park.x}-${park.y}`}
            x={park.x}
            y={park.y}
            width={park.w}
            height={park.h}
            rx={7}
            style={{fill: MAP_PARK}}
          />
        ))}
        {scene.water != null ? (
          <path d={scene.water} style={{fill: MAP_WATER}} />
        ) : null}
        {scene.streetsX.map(x => (
          <line
            key={`x${x}`}
            x1={x}
            y1={0}
            x2={x}
            y2={180}
            strokeWidth={2.5}
            style={{stroke: MAP_STREET}}
          />
        ))}
        {scene.streetsY.map(y => (
          <line
            key={`y${y}`}
            x1={0}
            y1={y}
            x2={320}
            y2={y}
            strokeWidth={2.5}
            style={{stroke: MAP_STREET}}
          />
        ))}
        <polyline
          points={activity.route}
          fill="none"
          strokeWidth={6.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{stroke: ROUTE_HALO}}
        />
        <polyline
          points={activity.route}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{stroke: BRAND_ACCENT}}
        />
        <circle cx={startX} cy={startY} r={4.5} style={{fill: ROUTE_START, stroke: ROUTE_HALO, strokeWidth: 2}} />
        <circle cx={endX} cy={endY} r={4.5} style={{fill: ROUTE_END, stroke: ROUTE_HALO, strokeWidth: 2}} />
      </svg>
    </div>
  );
}

// ============= WEEKLY GOAL RING =============

const RING_R = 48;
const RING_C = 2 * Math.PI * RING_R;

/** SVG distance-vs-goal ring; progress arc in the brand accent. */
function GoalRing({doneKm, goalKm}: {doneKm: number; goalKm: number}) {
  const pct = Math.min(1, doneKm / goalKm);
  return (
    <div style={styles.ringWrap}>
      <svg
        viewBox="0 0 116 116"
        width={116}
        height={116}
        role="img"
        aria-label={`Weekly distance ${doneKm} of ${goalKm} kilometers, ${Math.round(pct * 100)} percent of goal`}>
        <circle
          cx={58}
          cy={58}
          r={RING_R}
          fill="none"
          strokeWidth={9}
          style={{stroke: 'var(--color-background-muted)'}}
        />
        <circle
          cx={58}
          cy={58}
          r={RING_R}
          fill="none"
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={`${RING_C * pct} ${RING_C}`}
          transform="rotate(-90 58 58)"
          style={{stroke: BRAND_ACCENT}}
        />
      </svg>
      <div style={styles.ringCenter} aria-hidden="true">
        <span style={styles.ringValue}>{doneKm}</span>
        <Text type="supporting" color="secondary">
          of {goalKm} km
        </Text>
      </div>
    </div>
  );
}

// ============= 7-DAY MINI BARS =============

const WEEK_BAR_MAX_PX = 52;
const WEEK_MAX_KM = Math.max(...WEEK_DAYS.map(d => d.km));

/** Mon–Sun distance bars; today gets a soft ring. Bars sum to 32.4 km. */
function WeekBars() {
  return (
    <VStack gap={1}>
      <div style={styles.weekBars}>
        {WEEK_DAYS.map(day => (
          <div key={day.day} style={styles.weekBarCol} title={`${day.day}: ${day.km} km`}>
            {day.km > 0 ? (
              <div
                style={{
                  ...styles.weekBar,
                  ...(day.isToday ? styles.weekBarToday : undefined),
                  height: Math.max(
                    8,
                    Math.round((day.km / WEEK_MAX_KM) * WEEK_BAR_MAX_PX),
                  ),
                }}
              />
            ) : (
              <div style={styles.weekBarRest} />
            )}
          </div>
        ))}
      </div>
      <HStack gap={2}>
        {WEEK_DAYS.map(day => (
          <StackItem key={day.day} size="fill">
            <Text
              type="supporting"
              color={day.isToday ? 'primary' : 'secondary'}
              justify="center">
              {day.label}
            </Text>
          </StackItem>
        ))}
      </HStack>
      <span style={styles.visuallyHidden}>
        {WEEK_DAYS.map(day => `${day.day}: ${day.km} kilometers`).join('; ')}
      </span>
    </VStack>
  );
}

// ============= STAT ROW =============

function StatBlock({label, value}: {label: string; value: string}) {
  return (
    <div style={styles.statBlock}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <span style={styles.statValue}>{value}</span>
    </div>
  );
}

/** Distance / pace-or-speed / time / elevation, divided by hairlines. */
function ActivityStatRow({activity}: {activity: FeedActivity}) {
  return (
    <div style={styles.statRow}>
      <StatBlock label="Distance" value={activity.distance} />
      <div style={styles.statDivider} aria-hidden="true" />
      <StatBlock label={activity.paceLabel} value={activity.pace} />
      <div style={styles.statDivider} aria-hidden="true" />
      <StatBlock label="Time" value={activity.movingTime} />
      <div style={styles.statDivider} aria-hidden="true" />
      <StatBlock label="Elev gain" value={activity.elevation} />
    </div>
  );
}

// ============= ACHIEVEMENT CALLOUT =============

/** Crown segment callout / medal PR callout on the brand-soft tint. */
function AchievementCallout({achievement}: {achievement: Achievement}) {
  return (
    <div style={styles.achievement}>
      <span style={styles.achievementIcon}>
        <Icon
          icon={achievement.kind === 'crown' ? CrownIcon : MedalIcon}
          size="sm"
          color="inherit"
        />
      </span>
      <VStack gap={0}>
        <Text type="body" weight="bold">
          {achievement.title}
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {achievement.detail}
        </Text>
      </VStack>
    </div>
  );
}

// ============= KUDOS + COMMENTS =============

interface SocialState {
  gaveKudos: boolean;
  isExpanded: boolean;
  draft: string;
  added: readonly FeedComment[];
}

const EMPTY_SOCIAL: SocialState = {
  gaveKudos: false,
  isExpanded: false,
  draft: '',
  added: [],
};

function KudosSummary({
  activity,
  social,
}: {
  activity: FeedActivity;
  social: SocialState;
}) {
  const kudosCount = activity.kudosBase + (social.gaveKudos ? 1 : 0);
  const commentCount = activity.comments.length + social.added.length;
  const overflow = activity.kudosBase - activity.kudosFaces.length;
  return (
    <HStack gap={2} vAlign="center">
      <AvatarGroup size="xsmall" aria-label={`Athletes who gave kudos`}>
        {(social.gaveKudos
          ? [YOU, ...activity.kudosFaces]
          : [...activity.kudosFaces]
        ).map(name => (
          <Avatar key={name} name={name} />
        ))}
        {overflow > 0 ? <AvatarGroupOverflow count={overflow} /> : null}
      </AvatarGroup>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {kudosCount} kudos
        {commentCount > 0 ? ` · ${commentCount} comments` : ''}
      </Text>
    </HStack>
  );
}

function CommentThread({
  activity,
  social,
  onDraftChange,
  onPost,
}: {
  activity: FeedActivity;
  social: SocialState;
  onDraftChange: (value: string) => void;
  onPost: () => void;
}) {
  const allComments = [...activity.comments, ...social.added];
  return (
    <VStack gap={2}>
      {allComments.map(comment => (
        <div key={`${comment.author}-${comment.text}`} style={styles.commentRow}>
          <Avatar name={comment.author} size="xsmall" />
          <div style={styles.commentBubble}>
            <HStack gap={2} vAlign="center" hAlign="between">
              <Text type="supporting" weight="bold">
                {comment.author}
              </Text>
              <Text type="supporting" color="secondary">
                {comment.timeLabel}
              </Text>
            </HStack>
            <Text type="body">{comment.text}</Text>
          </div>
        </div>
      ))}
      <HStack gap={2} vAlign="center">
        <Avatar name={YOU} size="xsmall" />
        <StackItem size="fill">
          <TextInput
            label={`Add a comment on ${activity.title}`}
            isLabelHidden
            size="sm"
            width="100%"
            placeholder="Add a comment..."
            value={social.draft}
            onChange={onDraftChange}
          />
        </StackItem>
        <Button
          label="Post"
          size="sm"
          variant="secondary"
          isDisabled={social.draft.trim().length === 0}
          onClick={onPost}
        />
      </HStack>
    </VStack>
  );
}

// ============= ACTIVITY CARD =============

function ActivityCard({
  activity,
  social,
  onSocialChange,
}: {
  activity: FeedActivity;
  social: SocialState;
  onSocialChange: (
    id: string,
    update: (prev: SocialState) => SocialState,
  ) => void;
}) {
  const commentCount = activity.comments.length + social.added.length;
  const sportIcon = activity.sport === 'run' ? FootprintsIcon : BikeIcon;
  const sportLabel = activity.sport === 'run' ? 'Run' : 'Ride';
  return (
    <Card padding={3}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Avatar name={activity.athlete} size="small" />
          <StackItem size="fill">
            <VStack gap={0}>
              <HStack gap={2} vAlign="center">
                <Text type="body" weight="bold" maxLines={1}>
                  {activity.isOwn ? `${activity.athlete} (you)` : activity.athlete}
                </Text>
                {activity.hasPrBadge ? (
                  <span style={styles.prChip}>
                    <Icon icon={MedalIcon} size="xsm" color="inherit" />
                    PR
                  </span>
                ) : null}
              </HStack>
              <HStack gap={1} vAlign="center">
                <Icon icon={sportIcon} size="xsm" color="secondary" />
                <Text type="supporting" color="secondary" maxLines={1}>
                  {sportLabel} · {activity.dateLabel} · {activity.location}
                </Text>
              </HStack>
            </VStack>
          </StackItem>
          <MoreMenu
            label={`Options for ${activity.title}`}
            size="sm"
            items={[
              {label: 'Save route', icon: BookmarkIcon},
              {label: 'Share activity', icon: Share2Icon},
              {type: 'divider'},
              ...(activity.isOwn
                ? []
                : [
                    {label: `Mute ${activity.athlete}`, icon: BellOffIcon},
                    {label: 'Report activity', icon: FlagIcon},
                  ]),
            ]}
          />
        </HStack>
        <VStack gap={0}>
          <Heading level={3}>{activity.title}</Heading>
          {activity.withLabel != null ? (
            <HStack gap={1} vAlign="center">
              <Icon icon={UsersIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary">
                {activity.withLabel}
              </Text>
            </HStack>
          ) : null}
        </VStack>
        <ActivityStatRow activity={activity} />
        <RouteMap activity={activity} />
        {activity.achievement != null ? (
          <AchievementCallout achievement={activity.achievement} />
        ) : null}
        <Divider />
        <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
          <KudosSummary activity={activity} social={social} />
          <HStack gap={1} vAlign="center">
            {activity.isOwn ? null : (
              <span style={social.gaveKudos ? styles.kudosGiven : undefined}>
                <ToggleButton
                  label={social.gaveKudos ? 'Kudos given' : 'Give kudos'}
                  size="sm"
                  isIconOnly
                  icon={<Icon icon={ThumbsUpIcon} size="sm" color="inherit" />}
                  isPressed={social.gaveKudos}
                  onPressedChange={next =>
                    onSocialChange(activity.id, prev => ({
                      ...prev,
                      gaveKudos: next,
                    }))
                  }
                  tooltip={social.gaveKudos ? 'Remove kudos' : 'Give kudos'}
                />
              </span>
            )}
            <IconButton
              label={
                social.isExpanded
                  ? `Hide comments on ${activity.title}`
                  : `Show ${commentCount} comments on ${activity.title}`
              }
              icon={<Icon icon={MessageCircleIcon} size="sm" />}
              variant="ghost"
              size="sm"
              onClick={() =>
                onSocialChange(activity.id, prev => ({
                  ...prev,
                  isExpanded: !prev.isExpanded,
                }))
              }
            />
            <IconButton
              label={`Share ${activity.title}`}
              icon={<Icon icon={Share2Icon} size="sm" />}
              variant="ghost"
              size="sm"
            />
          </HStack>
        </HStack>
        {social.isExpanded ? (
          <CommentThread
            activity={activity}
            social={social}
            onDraftChange={value =>
              onSocialChange(activity.id, prev => ({...prev, draft: value}))
            }
            onPost={() =>
              onSocialChange(activity.id, prev => {
                const text = prev.draft.trim();
                if (text.length === 0) {
                  return prev;
                }
                return {
                  ...prev,
                  draft: '',
                  added: [
                    ...prev.added,
                    {author: YOU, text, timeLabel: 'Just now'},
                  ],
                };
              })
            }
          />
        ) : null}
      </VStack>
    </Card>
  );
}

// ============= RAIL CARDS =============

function ProfileCard() {
  return (
    <Card padding={3}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Avatar name={YOU} size="medium" />
          <VStack gap={0}>
            <Text type="body" weight="bold">
              {YOU}
            </Text>
            <Text type="supporting" color="secondary">
              Ashford, cadence.club/dana
            </Text>
          </VStack>
        </HStack>
        <Divider />
        <HStack gap={2}>
          {PROFILE_STATS.map(stat => (
            <StackItem key={stat.label} size="fill">
              <VStack gap={0}>
                <Text type="supporting" color="secondary" justify="center">
                  {stat.label}
                </Text>
                <Text type="body" weight="bold" justify="center" hasTabularNumbers>
                  {stat.value}
                </Text>
              </VStack>
            </StackItem>
          ))}
        </HStack>
      </VStack>
    </Card>
  );
}

/** Distance-vs-goal ring beside this-week readouts, 7-day bars beneath. */
function WeeklyProgressCard() {
  return (
    <Card padding={3}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" hAlign="between">
          <Heading level={4} accessibilityLevel={2}>
            This week
          </Heading>
          <Badge
            label={`${Math.round((WEEK_DONE_KM / WEEK_GOAL_KM) * 100)}% of goal`}
            variant="info"
          />
        </HStack>
        <HStack gap={3} vAlign="center">
          <GoalRing doneKm={WEEK_DONE_KM} goalKm={WEEK_GOAL_KM} />
          <VStack gap={2}>
            <HStack gap={1} vAlign="center">
              <Icon icon={TimerIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {WEEK_TIME} moving
              </Text>
            </HStack>
            <HStack gap={1} vAlign="center">
              <Icon icon={MountainIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {WEEK_ELEV_M} m climbed
              </Text>
            </HStack>
            <HStack gap={1} vAlign="center">
              <Icon icon={ActivityIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                4 activities
              </Text>
            </HStack>
          </VStack>
        </HStack>
        <WeekBars />
      </VStack>
    </Card>
  );
}

/** Club climbing challenge at 68% with a reconciling contributor list. */
function ChallengeCard() {
  return (
    <Card padding={3}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <span style={styles.challengeIcon}>
            <Icon icon={MountainIcon} size="sm" color="inherit" />
          </span>
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="body" weight="bold">
                {CHALLENGE.name}
              </Text>
              <Text type="supporting" color="secondary">
                {CHALLENGE.club} · {CHALLENGE.athletes} athletes
              </Text>
            </VStack>
          </StackItem>
          <Badge label={`${CHALLENGE.daysLeft} days left`} variant="info" />
        </HStack>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" hAlign="between">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {CHALLENGE.doneM.toLocaleString('en-US')} of{' '}
              {CHALLENGE.goalM.toLocaleString('en-US')} m
            </Text>
            <Text type="supporting" weight="bold" hasTabularNumbers>
              {CHALLENGE.pct}%
            </Text>
          </HStack>
          <ProgressBar
            value={CHALLENGE.pct}
            label={`${CHALLENGE.name} progress`}
            isLabelHidden
          />
        </VStack>
        <VStack gap={2}>
          {CHALLENGE.leaders.map((leader, index) => (
            <HStack key={leader.name} gap={2} vAlign="center">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {index + 1}
              </Text>
              <Avatar name={leader.name} size="xsmall" />
              <StackItem size="fill">
                <Text type="supporting" maxLines={1}>
                  {leader.name === YOU ? `${leader.name} (you)` : leader.name}
                </Text>
              </StackItem>
              <Text type="supporting" hasTabularNumbers style={styles.leaderMeters}>
                {leader.meters} m
              </Text>
            </HStack>
          ))}
          <HStack gap={2} vAlign="center" hAlign="between">
            <Text type="supporting" color="secondary">
              {CHALLENGE.restLabel}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {CHALLENGE.restMeters.toLocaleString('en-US')} m
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Card>
  );
}

/** Suggested athletes with working Follow / Following toggles. */
function SuggestedCard({
  following,
  onToggle,
}: {
  following: ReadonlySet<string>;
  onToggle: (name: string) => void;
}) {
  return (
    <Card padding={3}>
      <VStack gap={3}>
        <Heading level={4} accessibilityLevel={2}>
          Athletes to follow
        </Heading>
        <VStack gap={2}>
          {SUGGESTED_ATHLETES.map(athlete => {
            const isFollowing = following.has(athlete.name);
            return (
              <HStack key={athlete.name} gap={2} vAlign="center">
                <Avatar name={athlete.name} size="small" />
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text type="body" maxLines={1}>
                      {athlete.name}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {athlete.detail}
                    </Text>
                  </VStack>
                </StackItem>
                <Button
                  label={isFollowing ? 'Following' : 'Follow'}
                  size="sm"
                  variant={isFollowing ? 'secondary' : 'primary'}
                  icon={
                    isFollowing ? undefined : (
                      <Icon icon={UserPlusIcon} size="sm" color="inherit" />
                    )
                  }
                  onClick={() => onToggle(athlete.name)}
                />
              </HStack>
            );
          })}
        </VStack>
      </VStack>
    </Card>
  );
}

// ============= TOP NAV =============

const NAV_ITEMS = ['Home', 'Explore', 'Challenges', 'Clubs'] as const;

function TopNav({
  activeNav,
  onNavChange,
  isCompact,
}: {
  activeNav: string;
  onNavChange: (item: string) => void;
  isCompact: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div style={styles.headerBar}>
      <HStack gap={2} vAlign="center">
        <span style={styles.brandMark} aria-hidden="true">
          <Icon icon={ActivityIcon} size="sm" color="inherit" />
        </span>
        <span style={styles.wordmark}>Cadence Club</span>
      </HStack>
      {isCompact ? null : (
        <nav aria-label="Primary" style={styles.navRow}>
          {NAV_ITEMS.map(item => (
            <button
              key={item}
              type="button"
              style={{
                ...styles.navBtn,
                ...(item === activeNav ? styles.navBtnActive : undefined),
              }}
              aria-current={item === activeNav ? 'page' : undefined}
              onClick={() => onNavChange(item)}>
              {item}
            </button>
          ))}
        </nav>
      )}
      <div style={{flex: 1}} aria-hidden="true" />
      {isCompact ? (
        <IconButton
          label="Search athletes"
          icon={<Icon icon={SearchIcon} size="sm" />}
          variant="ghost"
          size="sm"
        />
      ) : (
        <div style={styles.headerSearch}>
          <TextInput
            label="Search athletes"
            isLabelHidden
            size="sm"
            width="100%"
            placeholder="Search athletes, segments..."
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      )}
      <button type="button" style={styles.recordBtn}>
        <Icon icon={PlusIcon} size="sm" color="inherit" />
        Record
      </button>
      <IconButton
        label="Notifications"
        icon={<Icon icon={BellIcon} size="sm" />}
        variant="ghost"
        size="sm"
      />
      <Avatar name={YOU} size="small" />
    </div>
  );
}

// ============= PAGE =============

export default function FitnessActivityFeedTemplate() {
  const isMid = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');
  const [activeNav, setActiveNav] = useState<string>('Home');
  const [filter, setFilter] = useState<'all' | Sport>('all');
  const [socials, setSocials] = useState<Record<string, SocialState>>({});
  const [following, setFollowing] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  const handleSocialChange = (
    id: string,
    update: (prev: SocialState) => SocialState,
  ) => {
    setSocials(prev => ({...prev, [id]: update(prev[id] ?? EMPTY_SOCIAL)}));
  };

  const handleFollowToggle = (name: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const visibleActivities =
    filter === 'all'
      ? ACTIVITIES
      : ACTIVITIES.filter(activity => activity.sport === filter);

  const feedColumn = (
    <div style={styles.feedCol}>
      <VStack gap={3}>
        {isCompact ? (
          <>
            <WeeklyProgressCard />
            <ChallengeCard />
          </>
        ) : null}
        <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
          <Heading level={4} accessibilityLevel={1}>
            Your feed
          </Heading>
          <SegmentedControl
            value={filter}
            onChange={value => setFilter(value as 'all' | Sport)}
            label="Filter feed by sport"
            size="sm">
            <SegmentedControlItem value="all" label="All" />
            <SegmentedControlItem value="run" label="Runs" />
            <SegmentedControlItem value="ride" label="Rides" />
          </SegmentedControl>
        </HStack>
        {visibleActivities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            social={socials[activity.id] ?? EMPTY_SOCIAL}
            onSocialChange={handleSocialChange}
          />
        ))}
        <div style={styles.caughtUp}>
          <Text type="supporting" color="secondary">
            You're all caught up — {visibleActivities.length}{' '}
            {filter === 'all'
              ? 'activities'
              : filter === 'run'
                ? 'runs'
                : 'rides'}{' '}
            since Monday.
          </Text>
        </div>
      </VStack>
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader>
            <TopNav
              activeNav={activeNav}
              onNavChange={setActiveNav}
              isCompact={isCompact}
            />
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <div style={styles.pageRow}>
              {isCompact ? null : (
                <div style={styles.railLeft}>
                  <VStack gap={3}>
                    <ProfileCard />
                    <WeeklyProgressCard />
                    {isMid ? <ChallengeCard /> : null}
                  </VStack>
                </div>
              )}
              {feedColumn}
              {isMid ? null : (
                <div style={styles.railRight}>
                  <VStack gap={3}>
                    <ChallengeCard />
                    <SuggestedCard
                      following={following}
                      onToggle={handleFollowToggle}
                    />
                  </VStack>
                </div>
              )}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
