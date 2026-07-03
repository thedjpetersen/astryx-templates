var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one Lingora learner snapshot pinned to
 *   Friday 2026-07-03: the Spanish course "Section 3 · Unit 12 — Ordering at
 *   a café" with 12 lesson nodes (7 done, 1 active, 4 locked), one opened
 *   treasure-chest node and one locked unit-checkpoint gate laid on a
 *   serpentine trail; a 47-day streak with a Mon Jun 29 – Sun Jul 5 week of
 *   day dots; the Sapphire-league top-10 table (you at #4 with 386 XP, 15 XP
 *   behind the promotion zone); three daily quests whose progress reconciles
 *   with today's single completed lesson (+20 XP); and header counters —
 *   4 of 5 hearts, 1,240 gems, streak 47. No clocks, no randomness, no
 *   network media.)
 * @output Language-learning home for the fictional startup "Lingora": a
 *   64px header (feather-adjacent Languages brand mark + lowercase wordmark,
 *   ES course chip, streak-flame / gem / hearts counter chips, Avatar), a
 *   center learning path — amber unit banner with a Guidebook chip that
 *   expands three key phrases, then an SVG serpentine trail threading 14
 *   extruded circular nodes (done = amber check, active = star with halo and
 *   floating START callout, locked = muted lock, chest = gift tile, gate =
 *   castle checkpoint); selecting any node opens an anchored detail bubble
 *   with Review / Start / locked messaging — and a 340px right rail of three
 *   Cards: streak flame (big 47 + week dots + 2 streak freezes), Sapphire
 *   league top-10 with promotion/demotion zones tinted, and daily quests
 *   with ProgressBars and a claimable finished quest that credits +30 gems
 *   to the header counter.
 * @position Page template; emitted by \`astryx template language-learning-path\`
 *
 * Frame: root 100dvh div > Layout height="fill"; header slot = LayoutHeader
 *   (brand + counter chips); content = LayoutContent padding 0 wrapping one
 *   scroll container (unit banner max-width 640 centered, then the 560px
 *   relative trail canvas whose SVG and absolutely-positioned nodes share
 *   one geometry table); end slot = LayoutPanel width 340 with the three
 *   rail Cards (sticky scroll idiom). Cards appear ONLY in the rail — they
 *   are genuine summary widgets; the path, banner, and bubbles are styled
 *   divs on the page surface.
 * Responsive contract:
 *   - >1120px: header chips show icon + number, rail panel visible, trail
 *     centered in the remaining content width.
 *   - <=1120px: the end LayoutPanel is dropped and the same three rail cards
 *     re-render under the trail in an auto-fit grid (minmax 280px), so no
 *     data is lost; header chips keep icon + number.
 *   - <=720px: the course chip label collapses to its flag square and the
 *     wordmark drops, leaving icon chips; trail geometry is unchanged (the
 *     canvas is 560px and horizontally centered with overflow hidden safe
 *     margins — nodes swing ±150px around center so nothing clips at 375px).
 * Container policy: rail widgets are Cards; everything else (banner,
 *   guidebook sheet, trail nodes, detail bubble, league rows) is frame-first
 *   styled divs — no Cards on the path surface.
 * Color policy: ONE brand accent — Lingora amber, light-dark(#B45309,
 *   #FBBF24) — used for the wordmark, unit banner, done/active nodes, trail
 *   stroke, primary CTA, and quest bars. Icon/text ON amber uses the paired
 *   literal light-dark(#FFFFFF, #451A03) (white on amber-700 4.9:1; near
 *   black on amber-300 9.8:1). Hearts use --color-error, promotion/demotion
 *   tints use success/error rgba pairs; everything else is token-pure and
 *   both schemes pass AA. No scheme-locked surfaces on this page.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpenIcon,
  CastleIcon,
  CheckIcon,
  CrownIcon,
  DumbbellIcon,
  FlameIcon,
  GemIcon,
  GiftIcon,
  HeadphonesIcon,
  HeartIcon,
  LanguagesIcon,
  LockIcon,
  MicIcon,
  SnowflakeIcon,
  SparklesIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
  ZapIcon,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= BRAND CONSTANTS (the ONE Lingora accent) =============

const BRAND_ACCENT = 'light-dark(#B45309, #FBBF24)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(180, 83, 9, 0.12), rgba(251, 191, 36, 0.16))';
/** Text/icon color sitting ON a brand-accent fill (AA in both schemes). */
const ON_ACCENT = 'light-dark(#FFFFFF, #451A03)';
/** Extruded 3D bottom edge for amber nodes / banner / CTA. */
const ACCENT_EDGE = 'light-dark(#92400E, #D97706)';
/** Extruded bottom edge for locked (muted) nodes. */
const MUTED_EDGE = 'light-dark(rgba(15, 23, 42, 0.16), rgba(226, 232, 240, 0.14))';
/** League zone tints. */
const PROMO_TINT = 'light-dark(rgba(11, 153, 31, 0.08), rgba(52, 199, 89, 0.10))';
const DEMOTE_TINT = 'light-dark(rgba(220, 38, 38, 0.07), rgba(248, 113, 113, 0.10))';

const HEART_COLOR = 'var(--color-error, light-dark(#DC2626, #F87171))';
const GEM_COLOR = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const SUCCESS_COLOR = 'var(--color-success, light-dark(#0B991F, #34C759))';
const ERROR_COLOR = 'var(--color-error, light-dark(#DC2626, #F87171))';

// ============= TRAIL GEOMETRY (one shared table) =============

/** Trail canvas width; nodes swing ±SWING around the center line. */
const TRAIL_W = 560;
const SWING = 150;
const NODE_SIZE = 68;
const STEP_Y = 104;
const TRAIL_TOP = 84;

// ============= FIXTURES (pinned to Friday 2026-07-03) =============

type NodeState = 'done' | 'active' | 'locked';
type NodeKind = 'lesson' | 'chest' | 'gate';

interface PathNode {
  id: string;
  kind: NodeKind;
  state: NodeState;
  title: string;
  /** Lesson skill flavor drives the bubble icon. */
  flavor: 'core' | 'listening' | 'speaking' | 'review' | 'legendary';
  /** XP granted on completion (lessons only). */
  xp: number;
  /** Legendary crowns already earned on a done lesson (0-1 here). */
  crowns: number;
}

const COURSE = {
  language: 'Spanish',
  flag: 'ES',
  section: 'Section 3',
  unit: 'Unit 12',
  unitTitle: 'Ordering at a café',
  lessonsDone: 7,
  lessonsTotal: 12,
} as const;

/** 14 nodes along the trail: 12 lessons + 1 chest + 1 checkpoint gate. */
const PATH_NODES: readonly PathNode[] = [
  {id: 'l1', kind: 'lesson', state: 'done', title: 'Café basics', flavor: 'core', xp: 20, crowns: 1},
  {id: 'l2', kind: 'lesson', state: 'done', title: 'Un café, por favor', flavor: 'core', xp: 20, crowns: 1},
  {id: 'l3', kind: 'lesson', state: 'done', title: 'La cuenta', flavor: 'core', xp: 20, crowns: 0},
  {id: 'l4', kind: 'lesson', state: 'done', title: 'Listening: at the counter', flavor: 'listening', xp: 20, crowns: 0},
  {id: 'chest', kind: 'chest', state: 'done', title: 'Treasure chest', flavor: 'core', xp: 0, crowns: 0},
  {id: 'l5', kind: 'lesson', state: 'done', title: 'Tapas y raciones', flavor: 'core', xp: 20, crowns: 0},
  {id: 'l6', kind: 'lesson', state: 'done', title: 'Polite requests', flavor: 'core', xp: 20, crowns: 0},
  {id: 'l7', kind: 'lesson', state: 'done', title: 'Speaking: order out loud', flavor: 'speaking', xp: 20, crowns: 0},
  {id: 'l8', kind: 'lesson', state: 'active', title: 'Numbers & prices', flavor: 'core', xp: 20, crowns: 0},
  {id: 'l9', kind: 'lesson', state: 'locked', title: '¿Algo más?', flavor: 'core', xp: 20, crowns: 0},
  {id: 'l10', kind: 'lesson', state: 'locked', title: 'Listening: the busy café', flavor: 'listening', xp: 20, crowns: 0},
  {id: 'l11', kind: 'lesson', state: 'locked', title: 'Review: the whole order', flavor: 'review', xp: 20, crowns: 0},
  {id: 'l12', kind: 'lesson', state: 'locked', title: 'Legendary: Ordering at a café', flavor: 'legendary', xp: 40, crowns: 0},
  {id: 'gate', kind: 'gate', state: 'locked', title: 'Unit 12 checkpoint', flavor: 'core', xp: 0, crowns: 0},
];

const CHEST_REWARD_GEMS = 40; // already collected (node state: done)

const GUIDEBOOK_PHRASES = [
  {es: 'Un café con leche, por favor.', en: 'A coffee with milk, please.'},
  {es: '¿Cuánto cuesta el bocadillo?', en: 'How much does the sandwich cost?'},
  {es: 'La cuenta, por favor.', en: 'The check, please.'},
] as const;

const NEXT_UNIT = {
  unit: 'Unit 13',
  title: 'Getting around town',
  hint: 'Pass the Unit 12 checkpoint to unlock',
} as const;

// --- Streak: 47 days ending Friday Jul 3, 2026 (started May 18) ---

const STREAK = {
  days: 47,
  longest: 63,
  startedLabel: 'Started May 18',
  freezes: 2,
} as const;

type DayDotState = 'done' | 'today' | 'future';

const STREAK_WEEK: readonly {label: string; date: string; state: DayDotState}[] = [
  {label: 'M', date: 'Jun 29', state: 'done'},
  {label: 'T', date: 'Jun 30', state: 'done'},
  {label: 'W', date: 'Jul 1', state: 'done'},
  {label: 'T', date: 'Jul 2', state: 'done'},
  {label: 'F', date: 'Jul 3', state: 'today'},
  {label: 'S', date: 'Jul 4', state: 'future'},
  {label: 'S', date: 'Jul 5', state: 'future'},
];

// --- Sapphire league: weekly XP, top 3 promote, bottom 3 demote ---

interface LeagueRow {
  rank: number;
  name: string;
  xp: number;
  isYou: boolean;
}

const LEAGUE_ROWS: readonly LeagueRow[] = [
  {rank: 1, name: 'Mateo R.', xp: 512, isYou: false},
  {rank: 2, name: 'Yuki T.', xp: 448, isYou: false},
  {rank: 3, name: 'Priya N.', xp: 401, isYou: false},
  {rank: 4, name: 'Dana W.', xp: 386, isYou: true},
  {rank: 5, name: 'Jonas K.', xp: 350, isYou: false},
  {rank: 6, name: 'Amélie B.', xp: 322, isYou: false},
  {rank: 7, name: 'Ravi S.', xp: 298, isYou: false},
  {rank: 8, name: 'Carmen O.', xp: 260, isYou: false},
  {rank: 9, name: 'Felix M.', xp: 214, isYou: false},
  {rank: 10, name: 'Nadia H.', xp: 180, isYou: false},
];

const LEAGUE = {
  name: 'Sapphire League',
  daysLeft: 4,
  promoteCount: 3,
  demoteFrom: 8, // ranks 8-10 demote
  // #3 has 401, you have 386 — shown as "15 XP to the promotion zone".
  xpToPromotion: 15,
} as const;

// --- Daily quests: today = 1 lesson completed (+20 XP), 5-streak hit ---

interface Quest {
  id: string;
  title: string;
  progress: number;
  target: number;
  rewardGems: number;
  unit: string;
}

const QUESTS: readonly Quest[] = [
  {id: 'q-xp', title: 'Earn 30 XP', progress: 20, target: 30, rewardGems: 10, unit: 'XP'},
  {id: 'q-lessons', title: 'Complete 3 lessons', progress: 1, target: 3, rewardGems: 15, unit: 'lessons'},
  {id: 'q-combo', title: 'Score 5 in a row', progress: 5, target: 5, rewardGems: 30, unit: 'correct'},
];

const QUESTS_RESET_LABEL = 'Resets in 9 h';

const LEARNER = {
  name: 'Dana Whitfield',
  hearts: 4,
  heartsMax: 5,
  gems: 1240,
} as const;

// ============= GEOMETRY (derived once at module scope) =============

/**
 * Serpentine x-offset: an 8-step sine cycle so the trail sweeps left,
 * center, right, center — the classic winding-path silhouette. Every node,
 * the SVG trail, and the anchored bubbles all read from this one table.
 */
function nodeCenter(index: number): {x: number; y: number} {
  const x = TRAIL_W / 2 + Math.round(SWING * Math.sin((index * Math.PI) / 4));
  const y = TRAIL_TOP + index * STEP_Y;
  return {x, y};
}

const NODE_POINTS: readonly {x: number; y: number}[] = PATH_NODES.map(
  (_, i) => nodeCenter(i),
);

const TRAIL_H = TRAIL_TOP + (PATH_NODES.length - 1) * STEP_Y + 120;

/** Smooth cubic segments between consecutive node centers. */
function trailPath(from: number, to: number): string {
  if (to <= from) {
    return '';
  }
  const start = NODE_POINTS[from];
  let d = \`M \${start.x} \${start.y}\`;
  for (let i = from + 1; i <= to; i++) {
    const a = NODE_POINTS[i - 1];
    const b = NODE_POINTS[i];
    const midY = (a.y + b.y) / 2;
    d += \` C \${a.x} \${midY}, \${b.x} \${midY}, \${b.x} \${b.y}\`;
  }
  return d;
}

const ACTIVE_INDEX = PATH_NODES.findIndex(n => n.state === 'active');
const DONE_TRAIL_D = trailPath(0, ACTIVE_INDEX);
const LOCKED_TRAIL_D = trailPath(ACTIVE_INDEX, PATH_NODES.length - 1);

/** Clamp a bubble anchor so a 264px-wide bubble never leaves the canvas. */
function clampBubbleX(x: number): number {
  return Math.min(Math.max(x, 138), TRAIL_W - 138);
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  // --- header ---
  brandMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-control)',
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    boxShadow: \`0 2px 0 \${ACCENT_EDGE}\`,
    flexShrink: 0,
  },
  wordmark: {
    fontSize: 'var(--type-scale-4, 20px)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: BRAND_ACCENT,
    lineHeight: 1,
  },
  counterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-control)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    whiteSpace: 'nowrap',
  },
  chipNumber: {
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--type-scale-2, 14px)',
    color: 'var(--color-text-primary)',
  },
  flagSquare: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 18,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.04em',
    color: '#FFFFFF',
    background: 'linear-gradient(180deg, #C1272D 0%, #C1272D 28%, #F1BF00 28%, #F1BF00 72%, #C1272D 72%)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.45)',
    flexShrink: 0,
  },
  // --- content scroll column ---
  scrollBody: {
    height: '100%',
    overflowY: 'auto',
    minHeight: 0,
    padding: 'var(--spacing-4) var(--spacing-3) var(--spacing-8)',
  },
  centerColumn: {
    maxWidth: 640,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  // --- unit banner ---
  unitBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    boxShadow: \`0 4px 0 \${ACCENT_EDGE}\`,
  },
  unitKicker: {
    fontSize: 'var(--type-scale-1, 12px)',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  unitTitle: {
    fontSize: 'var(--type-scale-5, 24px)',
    fontWeight: 800,
    lineHeight: 1.15,
  },
  unitProgress: {
    fontSize: 'var(--type-scale-2, 14px)',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    opacity: 0.92,
  },
  guidebookChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-control)',
    border: '1px solid light-dark(rgba(255, 255, 255, 0.55), rgba(69, 26, 3, 0.45))',
    backgroundColor: 'light-dark(rgba(255, 255, 255, 0.16), rgba(69, 26, 3, 0.14))',
    color: ON_ACCENT,
    fontWeight: 700,
    fontSize: 'var(--type-scale-2, 14px)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  // --- guidebook sheet ---
  guidebookSheet: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  phraseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-2) 0',
  },
  phraseAudioBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    cursor: 'pointer',
    flexShrink: 0,
  },
  // --- trail canvas ---
  trailWrap: {
    position: 'relative',
    width: TRAIL_W,
    maxWidth: '100%',
    height: TRAIL_H,
    margin: '0 auto',
  },
  trailSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  nodeButton: {
    position: 'absolute',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)',
    padding: 0,
  },
  nodeDone: {
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    boxShadow: \`0 6px 0 \${ACCENT_EDGE}\`,
  },
  nodeActive: {
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    boxShadow: \`0 6px 0 \${ACCENT_EDGE}, 0 0 0 6px var(--color-background-body), 0 0 0 10px \${BRAND_ACCENT_SOFT}\`,
  },
  nodeLocked: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    border: 'var(--border-width) solid var(--color-border)',
    boxShadow: \`0 6px 0 \${MUTED_EDGE}\`,
    cursor: 'pointer',
  },
  nodeSelectedRing: {
    outline: \`3px solid \${BRAND_ACCENT}\`,
    outlineOffset: 3,
  },
  chestShape: {
    borderRadius: 'var(--radius-container)',
    width: 64,
    height: 56,
  },
  gateShape: {
    width: 76,
    height: 76,
  },
  crownPip: {
    position: 'absolute',
    top: -4,
    right: -4,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    padding: '1px 6px',
    borderRadius: 999,
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    color: BRAND_ACCENT,
    fontSize: 11,
    fontWeight: 800,
    fontVariantNumeric: 'tabular-nums',
  },
  startFloat: {
    position: 'absolute',
    transform: 'translate(-50%, -100%)',
    padding: 'var(--spacing-1) var(--spacing-3)',
    borderRadius: 'var(--radius-control)',
    backgroundColor: 'var(--color-background-card)',
    border: \`2px solid \${BRAND_ACCENT}\`,
    color: BRAND_ACCENT,
    fontWeight: 800,
    fontSize: 'var(--type-scale-1, 12px)',
    letterSpacing: '0.1em',
    whiteSpace: 'nowrap',
    boxShadow: 'var(--shadow-low)',
    pointerEvents: 'none',
  },
  // --- anchored node bubble ---
  bubble: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    width: 264,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-high)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    zIndex: 2,
  },
  bubbleCaret: {
    position: 'absolute',
    top: -7,
    width: 12,
    height: 12,
    transform: 'translateX(-50%) rotate(45deg)',
    backgroundColor: 'var(--color-background-card)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    borderLeft: 'var(--border-width) solid var(--color-border)',
  },
  // --- next-unit teaser + rail widgets ---
  nextUnitBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) dashed var(--color-border-emphasized, var(--color-border))',
    backgroundColor: 'var(--color-background-muted)',
  },
  railSticky: {
    position: 'sticky',
    insetBlockStart: 0,
    maxHeight: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
  },
  compactRailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'var(--spacing-3)',
    maxWidth: 960,
    margin: '0 auto',
    width: '100%',
  },
  streakNumber: {
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 1,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
  },
  dayDotBase: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: '50%',
  },
  dayDotDone: {
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
  },
  dayDotToday: {
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    boxShadow: \`0 0 0 2px var(--color-background-card), 0 0 0 4px \${BRAND_ACCENT}\`,
  },
  dayDotFuture: {
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  leagueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-control)',
  },
  leagueRank: {
    width: 20,
    textAlign: 'end',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--type-scale-2, 14px)',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  leagueXp: {
    marginLeft: 'auto',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--type-scale-2, 14px)',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  leagueYouRow: {
    backgroundColor: BRAND_ACCENT_SOFT,
    boxShadow: \`inset 0 0 0 1px \${BRAND_ACCENT}\`,
  },
  zoneDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: '2px var(--spacing-2)',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  questIconTile: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-control)',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  questCount: {
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--type-scale-1, 12px)',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  rewardChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 'var(--type-scale-1, 12px)',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: GEM_COLOR,
    whiteSpace: 'nowrap',
  },
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
};

// ============= HEADER =============

function CounterChip({
  icon,
  iconColor,
  value,
  label,
  tooltip,
}: {
  icon: typeof FlameIcon;
  iconColor: string;
  value: string;
  label: string;
  tooltip: string;
}) {
  return (
    <Tooltip content={tooltip}>
      <span style={styles.counterChip} role="status" aria-label={\`\${label}: \${value}\`}>
        <span style={{color: iconColor, display: 'inline-flex'}}>
          <Icon icon={icon} size="sm" color="inherit" />
        </span>
        <span style={styles.chipNumber}>{value}</span>
      </span>
    </Tooltip>
  );
}

function HeaderBar({gems, isNarrow}: {gems: number; isNarrow: boolean}) {
  return (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" style={{width: '100%'}}>
        <HStack gap={2} vAlign="center">
          <span style={styles.brandMark} aria-hidden>
            <Icon icon={LanguagesIcon} size="sm" color="inherit" />
          </span>
          {isNarrow ? null : <span style={styles.wordmark}>lingora</span>}
        </HStack>
        <Tooltip content={\`\${COURSE.language} course · \${COURSE.section}\`}>
          <span style={styles.counterChip} aria-label={\`Course: \${COURSE.language}\`}>
            <span style={styles.flagSquare} aria-hidden>
              {COURSE.flag}
            </span>
            {isNarrow ? null : <span style={styles.chipNumber}>{COURSE.language}</span>}
          </span>
        </Tooltip>
        <StackItem size="fill">
          <span />
        </StackItem>
        <CounterChip
          icon={FlameIcon}
          iconColor={BRAND_ACCENT}
          value={String(STREAK.days)}
          label="Day streak"
          tooltip={\`\${STREAK.days}-day streak — a lesson today keeps it alive\`}
        />
        <CounterChip
          icon={GemIcon}
          iconColor={GEM_COLOR}
          value={gems.toLocaleString('en-US')}
          label="Gems"
          tooltip="Gems — spend them in the shop on streak freezes and outfits"
        />
        <CounterChip
          icon={HeartIcon}
          iconColor={HEART_COLOR}
          value={\`\${LEARNER.hearts}/\${LEARNER.heartsMax}\`}
          label="Hearts"
          tooltip="Hearts refill one every 4 hours, or practice to earn one back"
        />
        <Avatar name={LEARNER.name} size="small" />
      </HStack>
    </LayoutHeader>
  );
}

// ============= UNIT BANNER + GUIDEBOOK =============

function UnitBanner({
  isGuidebookOpen,
  onToggleGuidebook,
}: {
  isGuidebookOpen: boolean;
  onToggleGuidebook: () => void;
}) {
  return (
    <div style={styles.unitBanner}>
      <VStack gap={0.5}>
        <span style={styles.unitKicker}>
          {COURSE.section} · {COURSE.unit}
        </span>
        <Heading level={1} style={{...styles.unitTitle, color: 'inherit'}}>
          {COURSE.unitTitle}
        </Heading>
        <span style={styles.unitProgress}>
          {COURSE.lessonsDone} / {COURSE.lessonsTotal} lessons complete
        </span>
      </VStack>
      <StackItem size="fill">
        <span />
      </StackItem>
      <button
        type="button"
        style={styles.guidebookChip}
        onClick={onToggleGuidebook}
        aria-expanded={isGuidebookOpen}
        aria-controls="lingora-guidebook"
      >
        <Icon icon={BookOpenIcon} size="sm" color="inherit" />
        Guidebook
      </button>
    </div>
  );
}

function GuidebookSheet() {
  return (
    <div style={styles.guidebookSheet} id="lingora-guidebook">
      <HStack gap={2} vAlign="center">
        <Icon icon={BookOpenIcon} size="sm" color="secondary" />
        <Text size="sm" weight="bold">
          Key phrases · {COURSE.unitTitle}
        </Text>
      </HStack>
      <Divider />
      {GUIDEBOOK_PHRASES.map(phrase => (
        <div key={phrase.es} style={styles.phraseRow}>
          <button
            type="button"
            style={styles.phraseAudioBtn}
            aria-label={\`Play audio: \${phrase.es}\`}
          >
            <Icon icon={HeadphonesIcon} size="sm" color="inherit" />
          </button>
          <VStack gap={0}>
            <Text size="sm" weight="bold">
              {phrase.es}
            </Text>
            <Text size="sm" color="secondary">
              {phrase.en}
            </Text>
          </VStack>
        </div>
      ))}
    </div>
  );
}

// ============= TRAIL =============

/** Glyph shown inside a trail node, by kind/state/flavor. */
function nodeGlyph(node: PathNode): typeof CheckIcon {
  if (node.kind === 'chest') {
    return GiftIcon;
  }
  if (node.kind === 'gate') {
    return CastleIcon;
  }
  if (node.state === 'active') {
    return StarIcon;
  }
  if (node.state === 'locked') {
    return node.flavor === 'legendary' ? CrownIcon : LockIcon;
  }
  // done lesson
  if (node.flavor === 'listening') {
    return HeadphonesIcon;
  }
  if (node.flavor === 'speaking') {
    return MicIcon;
  }
  return CheckIcon;
}

function nodeAriaLabel(node: PathNode): string {
  if (node.kind === 'chest') {
    return \`Treasure chest, opened — \${CHEST_REWARD_GEMS} gems collected\`;
  }
  if (node.kind === 'gate') {
    return 'Unit 12 checkpoint, locked';
  }
  const stateLabel =
    node.state === 'done'
      ? 'completed'
      : node.state === 'active'
        ? 'up next'
        : 'locked';
  return \`Lesson: \${node.title}, \${stateLabel}\`;
}

function TrailNode({
  node,
  index,
  isSelected,
  onSelect,
}: {
  node: PathNode;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const point = NODE_POINTS[index];
  const glyph = nodeGlyph(node);
  const stateStyle =
    node.state === 'active'
      ? styles.nodeActive
      : node.state === 'done'
        ? styles.nodeDone
        : styles.nodeLocked;
  const shapeStyle =
    node.kind === 'chest'
      ? styles.chestShape
      : node.kind === 'gate'
        ? styles.gateShape
        : undefined;
  return (
    <>
      {node.state === 'active' ? (
        <span
          style={{
            ...styles.startFloat,
            left: point.x,
            top: point.y - NODE_SIZE / 2 - 12,
          }}
          aria-hidden
        >
          START
        </span>
      ) : null}
      <button
        type="button"
        style={{
          ...styles.nodeButton,
          ...stateStyle,
          ...shapeStyle,
          ...(isSelected ? styles.nodeSelectedRing : undefined),
          left: point.x,
          top: point.y,
        }}
        aria-label={nodeAriaLabel(node)}
        aria-pressed={isSelected}
        onClick={() => onSelect(node.id)}
      >
        <Icon icon={glyph} size={node.kind === 'gate' ? 'lg' : 'md'} color="inherit" />
        {node.kind === 'lesson' && node.state === 'done' && node.crowns > 0 ? (
          <span style={styles.crownPip} aria-label={\`\${node.crowns} crown\`}>
            <Icon icon={CrownIcon} size="xsm" color="inherit" />
            {node.crowns}
          </span>
        ) : null}
      </button>
    </>
  );
}

/** Anchored detail bubble under the selected node. */
function NodeBubble({node, index}: {node: PathNode; index: number}) {
  const point = NODE_POINTS[index];
  const anchorX = clampBubbleX(point.x);
  const caretX = 132 + (point.x - anchorX); // caret tracks the true node center
  const halfHeight = node.kind === 'gate' ? 38 : NODE_SIZE / 2;

  let body: ReactNode;
  if (node.kind === 'chest') {
    body = (
      <>
        <HStack gap={2} vAlign="center">
          <Icon icon={GiftIcon} size="sm" color="secondary" />
          <Text weight="bold">Treasure chest</Text>
        </HStack>
        <Text size="sm" color="secondary">
          Opened on Jul 1 — you collected {CHEST_REWARD_GEMS} gems.
        </Text>
        <span style={{alignSelf: 'flex-start'}}>
          <Badge variant="success" label="Collected" />
        </span>
      </>
    );
  } else if (node.kind === 'gate') {
    body = (
      <>
        <HStack gap={2} vAlign="center">
          <Icon icon={CastleIcon} size="sm" color="secondary" />
          <Text weight="bold">{node.title}</Text>
        </HStack>
        <Text size="sm" color="secondary">
          Finish the remaining {COURSE.lessonsTotal - COURSE.lessonsDone} lessons —
          or pass the checkpoint quiz to jump ahead to {NEXT_UNIT.unit}.
        </Text>
        <Button label="Locked" variant="secondary" size="sm" isDisabled icon={<Icon icon={LockIcon} size="sm" />} />
      </>
    );
  } else if (node.state === 'locked') {
    body = (
      <>
        <HStack gap={2} vAlign="center">
          <Icon icon={LockIcon} size="sm" color="secondary" />
          <Text weight="bold">{node.title}</Text>
        </HStack>
        <Text size="sm" color="secondary">
          Complete the levels above to unlock this lesson.
        </Text>
      </>
    );
  } else if (node.state === 'active') {
    body = (
      <>
        <Text weight="bold">{node.title}</Text>
        <Text size="sm" color="secondary">
          Lesson 8 of {COURSE.lessonsTotal} · {COURSE.unitTitle}
        </Text>
        <Button
          label={\`Start · +\${node.xp} XP\`}
          size="sm"
          icon={<Icon icon={ZapIcon} size="sm" />}
          style={{
            backgroundColor: BRAND_ACCENT,
            color: ON_ACCENT,
            boxShadow: \`0 3px 0 \${ACCENT_EDGE}\`,
            border: 'none',
            fontWeight: 700,
          }}
        />
      </>
    );
  } else {
    body = (
      <>
        <HStack gap={2} vAlign="center">
          <Text weight="bold">{node.title}</Text>
          {node.crowns > 0 ? (
            <span style={{color: BRAND_ACCENT, display: 'inline-flex'}}>
              <Icon icon={CrownIcon} size="sm" color="inherit" />
            </span>
          ) : null}
        </HStack>
        <Text size="sm" color="secondary">
          Completed · earned {node.xp} XP
          {node.crowns > 0 ? ' · Legendary' : ''}
        </Text>
        <Button
          label="Review · +5 XP"
          variant="secondary"
          size="sm"
          icon={<Icon icon={DumbbellIcon} size="sm" />}
        />
      </>
    );
  }

  return (
    <div
      style={{
        ...styles.bubble,
        left: anchorX,
        top: point.y + halfHeight + 16,
      }}
      role="dialog"
      aria-label={\`Details: \${node.title}\`}
    >
      <span style={{...styles.bubbleCaret, left: caretX}} aria-hidden />
      {body}
    </div>
  );
}

function Trail({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const selectedIndex = PATH_NODES.findIndex(n => n.id === selectedId);
  return (
    <div style={styles.trailWrap}>
      <svg
        style={styles.trailSvg}
        viewBox={\`0 0 \${TRAIL_W} \${TRAIL_H}\`}
        aria-hidden
        focusable="false"
      >
        {/* Completed stretch: solid brand amber. */}
        <path
          d={DONE_TRAIL_D}
          fill="none"
          stroke={BRAND_ACCENT}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.5}
        />
        {/* Upcoming stretch: dotted, muted. */}
        <path
          d={LOCKED_TRAIL_D}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray="0.5 22"
        />
      </svg>
      {PATH_NODES.map((node, index) => (
        <TrailNode
          key={node.id}
          node={node}
          index={index}
          isSelected={node.id === selectedId}
          onSelect={onSelect}
        />
      ))}
      {selectedIndex >= 0 ? (
        <NodeBubble node={PATH_NODES[selectedIndex]} index={selectedIndex} />
      ) : null}
    </div>
  );
}

function NextUnitTeaser() {
  return (
    <div style={styles.nextUnitBanner}>
      <Icon icon={LockIcon} size="md" color="secondary" />
      <VStack gap={0.5}>
        <Text weight="bold" color="secondary">
          {NEXT_UNIT.unit} · {NEXT_UNIT.title}
        </Text>
        <Text size="sm" color="secondary">
          {NEXT_UNIT.hint}
        </Text>
      </VStack>
    </div>
  );
}

// ============= RAIL CARDS =============

function StreakCard() {
  return (
    <Card padding={3}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <span style={{color: BRAND_ACCENT, display: 'inline-flex'}}>
            <Icon icon={FlameIcon} size="lg" color="inherit" />
          </span>
          <VStack gap={0}>
            <span style={styles.streakNumber}>{STREAK.days}</span>
            <Text size="sm" color="secondary" weight="semibold">
              day streak
            </Text>
          </VStack>
          <StackItem size="fill">
            <span />
          </StackItem>
          <VStack gap={0.5} hAlign="end">
            <Text size="xsm" color="secondary" hasTabularNumbers>
              Longest: {STREAK.longest}
            </Text>
            <Text size="xsm" color="secondary">
              {STREAK.startedLabel}
            </Text>
          </VStack>
        </HStack>
        <HStack gap={2} hAlign="center">
          {STREAK_WEEK.map(day => (
            <Tooltip key={day.date} content={\`\${day.date} — \${day.state === 'future' ? 'upcoming' : day.state === 'today' ? 'today, extended' : 'completed'}\`}>
              <VStack gap={1} hAlign="center">
                <Text size="xsm" color="secondary" weight="semibold">
                  {day.label}
                </Text>
                <span
                  style={{
                    ...styles.dayDotBase,
                    ...(day.state === 'done'
                      ? styles.dayDotDone
                      : day.state === 'today'
                        ? styles.dayDotToday
                        : styles.dayDotFuture),
                  }}
                  aria-label={\`\${day.date}: \${day.state}\`}
                >
                  {day.state === 'future' ? null : (
                    <Icon icon={day.state === 'today' ? FlameIcon : CheckIcon} size="xsm" color="inherit" />
                  )}
                </span>
              </VStack>
            </Tooltip>
          ))}
        </HStack>
        <Divider />
        <HStack gap={2} vAlign="center">
          <span style={{color: GEM_COLOR, display: 'inline-flex'}}>
            <Icon icon={SnowflakeIcon} size="sm" color="inherit" />
          </span>
          <Text size="sm" color="secondary">
            {STREAK.freezes} streak freezes equipped
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}

function LeagueZoneDivider({kind}: {kind: 'promotion' | 'demotion'}) {
  const isPromo = kind === 'promotion';
  return (
    <div
      style={{
        ...styles.zoneDivider,
        color: isPromo ? SUCCESS_COLOR : ERROR_COLOR,
      }}
      aria-hidden
    >
      <Icon icon={isPromo ? ArrowUpIcon : ArrowDownIcon} size="xsm" color="inherit" />
      {isPromo ? 'Promotion zone' : 'Demotion zone'}
      <Icon icon={isPromo ? ArrowUpIcon : ArrowDownIcon} size="xsm" color="inherit" />
    </div>
  );
}

function LeagueCard() {
  return (
    <Card padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <span style={{color: GEM_COLOR, display: 'inline-flex'}}>
            <Icon icon={TrophyIcon} size="md" color="inherit" />
          </span>
          <VStack gap={0}>
            <Text weight="bold">{LEAGUE.name}</Text>
            <Text size="xsm" color="secondary" hasTabularNumbers>
              Top {LEAGUE.promoteCount} advance · {LEAGUE.daysLeft} days left
            </Text>
          </VStack>
        </HStack>
        <Divider />
        <VStack gap={0.5}>
          {LEAGUE_ROWS.map(row => {
            const inPromo = row.rank <= LEAGUE.promoteCount;
            const inDemote = row.rank >= LEAGUE.demoteFrom;
            const zoneTint = inPromo ? PROMO_TINT : inDemote ? DEMOTE_TINT : undefined;
            return (
              <div key={row.rank}>
                {row.rank === LEAGUE.demoteFrom ? (
                  <LeagueZoneDivider kind="demotion" />
                ) : null}
                <div
                  style={{
                    ...styles.leagueRow,
                    ...(zoneTint ? {backgroundColor: zoneTint} : undefined),
                    ...(row.isYou ? styles.leagueYouRow : undefined),
                  }}
                >
                  <span style={styles.leagueRank}>{row.rank}</span>
                  <Avatar name={row.name} size="xsmall" />
                  <Text size="sm" weight={row.isYou ? 'bold' : 'normal'} maxLines={1}>
                    {row.isYou ? \`\${row.name} (you)\` : row.name}
                  </Text>
                  <span style={styles.leagueXp}>{row.xp} XP</span>
                </div>
                {row.rank === LEAGUE.promoteCount ? (
                  <LeagueZoneDivider kind="promotion" />
                ) : null}
              </div>
            );
          })}
        </VStack>
        <Divider />
        <HStack gap={2} vAlign="center">
          <span style={{color: SUCCESS_COLOR, display: 'inline-flex'}}>
            <Icon icon={SparklesIcon} size="sm" color="inherit" />
          </span>
          <Text size="sm" color="secondary" hasTabularNumbers>
            {LEAGUE.xpToPromotion} XP to the promotion zone
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}

function questIcon(quest: Quest): typeof ZapIcon {
  if (quest.id === 'q-xp') {
    return ZapIcon;
  }
  if (quest.id === 'q-lessons') {
    return TargetIcon;
  }
  return StarIcon;
}

function QuestsCard({
  claimedIds,
  onClaim,
}: {
  claimedIds: readonly string[];
  onClaim: (quest: Quest) => void;
}) {
  return (
    <Card padding={3}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <span style={{color: BRAND_ACCENT, display: 'inline-flex'}}>
            <Icon icon={TargetIcon} size="md" color="inherit" />
          </span>
          <Text weight="bold">Daily quests</Text>
          <StackItem size="fill">
            <span />
          </StackItem>
          <Text size="xsm" color="secondary">
            {QUESTS_RESET_LABEL}
          </Text>
        </HStack>
        <VStack gap={3}>
          {QUESTS.map(quest => {
            const isComplete = quest.progress >= quest.target;
            const isClaimed = claimedIds.includes(quest.id);
            return (
              <HStack key={quest.id} gap={2} vAlign="center">
                <span style={styles.questIconTile}>
                  <Icon icon={questIcon(quest)} size="sm" color="inherit" />
                </span>
                <StackItem size="fill" style={{minWidth: 0}}>
                  <VStack gap={1}>
                    <HStack gap={2} vAlign="center">
                      <Text size="sm" weight="semibold" maxLines={1}>
                        {quest.title}
                      </Text>
                      <StackItem size="fill">
                        <span />
                      </StackItem>
                      {/* A finished quest's count is redundant with the full
                          bar + Claim button, and crowds the title out. */}
                      {isComplete ? null : (
                        <span style={styles.questCount}>
                          {quest.progress} / {quest.target}
                        </span>
                      )}
                    </HStack>
                    <ProgressBar
                      label={\`\${quest.title}: \${quest.progress} of \${quest.target} \${quest.unit}\`}
                      isLabelHidden
                      value={quest.progress}
                      max={quest.target}
                      variant={isComplete ? 'success' : 'accent'}
                      style={{minWidth: 0}}
                    />
                  </VStack>
                </StackItem>
                {isComplete ? (
                  isClaimed ? (
                    <Badge variant="success" label="Claimed" />
                  ) : (
                    <Button
                      label={\`Claim \${quest.rewardGems}\`}
                      size="sm"
                      icon={<Icon icon={GemIcon} size="sm" />}
                      onClick={() => onClaim(quest)}
                      style={{
                        backgroundColor: BRAND_ACCENT,
                        color: ON_ACCENT,
                        border: 'none',
                        boxShadow: \`0 2px 0 \${ACCENT_EDGE}\`,
                        fontWeight: 700,
                      }}
                    />
                  )
                ) : (
                  <span style={styles.rewardChip} aria-label={\`Reward: \${quest.rewardGems} gems\`}>
                    <Icon icon={GemIcon} size="xsm" color="inherit" />+{quest.rewardGems}
                  </span>
                )}
              </HStack>
            );
          })}
        </VStack>
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

function PageBody() {
  const isCompact = useMediaQuery('(max-width: 1120px)');
  const isNarrow = useMediaQuery('(max-width: 720px)');

  // Selecting a node opens its anchored bubble; the active node starts open
  // so the START affordance is discoverable without a click.
  const [selectedId, setSelectedId] = useState<string | null>(
    PATH_NODES[ACTIVE_INDEX]?.id ?? null,
  );
  const [gems, setGems] = useState<number>(LEARNER.gems);
  const [claimedQuestIds, setClaimedQuestIds] = useState<readonly string[]>([]);
  const [isGuidebookOpen, setIsGuidebookOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');

  const handleSelect = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const handleClaim = (quest: Quest) => {
    setClaimedQuestIds(prev => (prev.includes(quest.id) ? prev : [...prev, quest.id]));
    setGems(prev => prev + quest.rewardGems);
    setLiveMessage(\`Claimed \${quest.rewardGems} gems for "\${quest.title}".\`);
  };

  const railCards = (
    <>
      <StreakCard />
      <LeagueCard />
      <QuestsCard claimedIds={claimedQuestIds} onClaim={handleClaim} />
    </>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={<HeaderBar gems={gems} isNarrow={isNarrow} />}
        content={
          <LayoutContent padding={0}>
            <div style={styles.scrollBody}>
              <div style={styles.centerColumn}>
                <UnitBanner
                  isGuidebookOpen={isGuidebookOpen}
                  onToggleGuidebook={() => setIsGuidebookOpen(prev => !prev)}
                />
                {isGuidebookOpen ? <GuidebookSheet /> : null}
                <Trail selectedId={selectedId} onSelect={handleSelect} />
                <NextUnitTeaser />
                {isCompact ? (
                  <div style={styles.compactRailGrid}>{railCards}</div>
                ) : null}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isCompact ? undefined : (
            <LayoutPanel width={340} padding={0} hasDivider label="Progress rail">
              <div style={styles.railSticky}>{railCards}</div>
            </LayoutPanel>
          )
        }
      />
      <div aria-live="polite" style={styles.visuallyHidden}>
        {liveMessage}
      </div>
    </div>
  );
}

export default function LanguageLearningPathTemplate() {
  return <PageBody />;
}
`;export{e as default};