// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (four story authors — Ari Okafor,
 *   Mina Park, Theo Reyes, Zoe Adeyemi — with 4/5/3/4 gradient-composition
 *   frames each: token-gradient scenes with inline-SVG vignettes, big-type
 *   quote cards, and two-option polls with fixed vote counts; every frame
 *   carries a fixed duration, caption, and posted-ago label — no clocks,
 *   no randomness, no network assets)
 * @output Story progress viewer: a full-bleed 9:16 stories stage where
 *   segmented progress bars fill via a CSS keyframe scaled to each frame's
 *   fixture duration and the animationend event chains to the next frame —
 *   playback is fully deterministic with no Date.now. Tapping the left /
 *   right thirds of the stage steps frames, tapping the middle toggles
 *   play, and press-and-hold pauses by suspending animation-play-state
 *   while the chrome fades out. Crossing an author boundary (auto-advance,
 *   stepping past an edge, ↑/↓, or a rail avatar) runs a measured
 *   perspective cube-turn between story groups. Poll frames take a real
 *   vote and reveal percentage bars. An author rail of avatar rings
 *   (conic-gradient unseen indicators) sits beside the stage on desktop
 *   and beneath it on phones, and finishing every story lands on a recap
 *   grid with per-frame replay tiles, per-author Replay buttons, and a
 *   full "Watch again" reset. Space / ← → / ↑ ↓ mirror every gesture, and
 *   a Prev · Play/Pause · Next transport drives the identical commit path
 * @position Page template; emitted by `astryx template story-progress-viewer`
 *
 * Frame: Layout height="fill", no page scroll (the muted backdrop scrolls
 * only when the viewport is short). LayoutHeader (56px) carries the
 * Stories title, a Playing/Paused/Recap Badge, the viewed-count Tooltip
 * Badge, and a restart IconButton. LayoutContent (padding 0) centers the
 * phone-aspect stage: vertical author rail beside it on desktop, then the
 * stage frame, transport row, status line, and Kbd hint row. The recap
 * grid replaces the stage column in the same content area. Choose over
 * live-stream-viewer when the surface is segmented auto-advancing story
 * groups rather than one continuous stream with chat; choose over
 * photo-gallery templates when frames are timed and chained, not browsed.
 *
 * Responsive contract:
 * - >640px: header | centered stage at phone aspect (width is derived from
 *   min(78vh, 620px) height so the 9:16 frame never overflows) with the
 *   vertical author rail beside it; transport, status line, and Kbd hints
 *   render under the stage; the recap grid is two Card columns.
 * - <=640px: full-bleed native pattern — the stage fills the 375px width,
 *   the author rail collapses to a horizontal avatar strip beneath it, the
 *   Kbd hint row hides, transport buttons grow to 44px tap targets (the
 *   header restart button to 40px), and the recap grid is one column.
 *   Tap zones are whole thirds of the stage — nothing is hover-only.
 * - The content backdrop keeps overflowX hidden so mid-turn cube faces
 *   never spawn a horizontal scrollbar; vertical scroll appears only when
 *   the viewport is shorter than the stage column.
 *
 * Container policy (story-stage archetype): frame-first chrome; the stage,
 * its faces, the poll pills, the rail rings, and the recap tiles are
 * hand-rolled shells (radius/shadow tokens, CSS transforms, conic
 * gradients, one keyframe) because they need full transform and
 * animation-play-state ownership. Astryx Cards appear only in the recap
 * grid. No chart engine, no gesture library, no <video>.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token, a
 * color-mix() over tokens, or an explicit light-dark() pair. The stage
 * overlay ink is light-dark(var(--color-background-body),
 * var(--color-text-primary)) — always-light ink that reads on the vivid
 * token gradients in both schemes — and the scrims invert the same pair
 * for an always-dark shade. Motion: the progress fill is a single
 * transform keyframe chained by animationend; the cube turn and chrome
 * fades are CSS transitions. prefers-reduced-motion swaps the cube for an
 * opacity crossfade and steps the progress fill discretely (steps(6)
 * timing over the same keyframe, so chaining still fires).
 */

import {useEffect, useRef, useState, type CSSProperties} from 'react';

import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SparklesIcon,
  XIcon,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= TIMING CONSTANTS =============
// The craft bar: hold, segment fill, and the cube turn must read as one
// interlocked system. All timers here are gesture/animation bookkeeping —
// frame content and order are pure fixture data.

/** Press longer than this and the pointer-down is a hold, not a tap. */
const HOLD_MS = 220;
/** Cube-turn duration between author groups. */
const CUBE_MS = 560;
/** Reduced-motion crossfade + chrome fade duration. */
const FADE_MS = 220;
/** Turn ease: quick launch, settled landing on the incoming face. */
const CUBE_EASE = 'cubic-bezier(0.45, 0, 0.2, 1)';

// ============= STAGE INK (token-pure) =============
// The stage paints vivid token gradients, so its overlay chrome needs
// always-light ink and always-dark scrims regardless of scheme. Both are
// light-dark() pairs over tokens: in light scheme --color-background is
// near-white and --color-text-primary near-black; in dark scheme they
// swap — so each pair below picks the light (or dark) member every time.

/** Always-light overlay ink (progress fills, names, captions). */
const STORY_INK = 'light-dark(var(--color-background-body), var(--color-text-primary))';
/** Softer ink for secondary overlay text. */
const STORY_INK_SOFT = `color-mix(in srgb, ${STORY_INK} 78%, transparent)`;
/** Translucent ink for progress tracks and glass pills. */
const STORY_INK_FAINT = `color-mix(in srgb, ${STORY_INK} 32%, transparent)`;
/** Always-dark shade for the top/bottom legibility scrims. */
const STORY_SHADE =
  'light-dark(color-mix(in srgb, var(--color-text-primary) 55%, transparent), color-mix(in srgb, var(--color-background-body) 55%, transparent))';

/** Rail ring segments: unseen = accent, seen = muted border token. */
const RING_UNSEEN = 'var(--color-accent)';
const RING_SEEN = 'var(--color-border)';

// ============= KEYFRAMES =============
// One keyframe: the active segment's fill scales 0 -> 1 over the frame's
// fixture duration; animationend chains the next frame. Reduced motion
// keeps the SAME keyframe (so chaining still fires deterministically) but
// swaps the timing function to steps(6, end) — the bar jumps in discrete
// increments instead of sliding. play-state is suspended for hold/pause.

const KEYFRAME_CSS = `
@keyframes spv-fill {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Muted backdrop; centers the stage column, clips cube overflow.
  backdrop: {
    height: '100%', overflowY: 'auto', overflowX: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-5)', display: 'flex', flexDirection: 'column',
  },
  backdropCompact: {padding: 'var(--spacing-2)'},
  centerWrap: {
    marginBlock: 'auto', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 'var(--spacing-5)', width: '100%',
  },
  stageColumn: {
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)',
    alignItems: 'center', width: '100%', maxWidth: 400,
  },
  // Phone-aspect stage: width derives from the height cap so the 9:16
  // frame fits; at <=640px min(100%, …) lets it own the 375px viewport.
  stageFrame: {
    position: 'relative', width: 'min(100%, calc(min(78vh, 620px) * 9 / 16))',
    aspectRatio: '9 / 16', marginInline: 'auto',
    borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-high)',
    userSelect: 'none', WebkitUserSelect: 'none',
  },
  // One story face: gradient canvas + vignette + chrome. Faces carry the
  // radius/clip themselves so the frame can leave overflow visible while
  // a cube face swings past its edge.
  face: {
    position: 'absolute', inset: 0, borderRadius: 'var(--radius-container)',
    overflow: 'hidden', color: STORY_INK, display: 'flex', flexDirection: 'column',
  },
  faceArt: {position: 'absolute', inset: 0, width: '100%', height: '100%'},
  scrimTop: {
    position: 'absolute', insetInline: 0, top: 0, height: '22%',
    background: `linear-gradient(180deg, ${STORY_SHADE}, transparent)`,
    pointerEvents: 'none',
  },
  scrimBottom: {
    position: 'absolute', insetInline: 0, bottom: 0, height: '26%',
    background: `linear-gradient(0deg, ${STORY_SHADE}, transparent)`,
    pointerEvents: 'none',
  },
  // Top chrome: segmented progress row + author row. Fades away while the
  // press-and-hold is armed so the frame reads unobstructed.
  chromeTop: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    gap: 'var(--spacing-2)', padding: 'var(--spacing-3)',
    transition: `opacity ${FADE_MS}ms ease`,
  },
  chromeHidden: {opacity: 0},
  segmentsRow: {display: 'flex', gap: 4},
  segmentTrack: {
    flex: 1, height: 3, borderRadius: 'var(--radius-full)',
    backgroundColor: STORY_INK_FAINT, overflow: 'hidden',
  },
  segmentFull: {
    height: '100%', width: '100%', borderRadius: 'var(--radius-full)',
    backgroundColor: STORY_INK,
  },
  // The active segment's fill: scaleX keyframe over the frame duration;
  // animation-play-state is the hold-to-pause suspension point.
  segmentFill: {
    height: '100%', width: '100%', borderRadius: 'var(--radius-full)',
    backgroundColor: STORY_INK, transformOrigin: 'left center',
    transform: 'scaleX(0)',
  },
  authorRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'},
  // The on-stage avatar sits on the always-dark story gradient, but its
  // initials fall back to the theme foreground token (dark in light
  // scheme). Re-point that token at the always-light stage ink so the
  // initials read in both schemes.
  authorAvatar: {'--color-text-secondary': STORY_INK} as CSSProperties,
  authorName: {fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap'},
  postedAgo: {fontSize: 12, color: STORY_INK_SOFT},
  rowSpacer: {flex: 1},
  pausedChip: {
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
    borderRadius: 'var(--radius-full)', backgroundColor: STORY_INK_FAINT,
    fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  // On-stage close button: 40px glass hit box, ends the run at the recap.
  closeButton: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 40, height: 40, marginBlock: -6, border: 'none',
    borderRadius: 'var(--radius-full)', backgroundColor: 'transparent',
    color: STORY_INK, cursor: 'pointer',
  },
  faceCenter: {
    position: 'relative', flex: 1, minHeight: 0, display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 'var(--spacing-4)', gap: 'var(--spacing-3)',
  },
  quoteMark: {fontSize: 56, lineHeight: 0.6, opacity: 0.65, fontWeight: 700},
  quoteText: {
    margin: 0, fontSize: 'clamp(18px, 6.4cqw, 24px)', lineHeight: 1.45,
    fontWeight: 600, textAlign: 'center', textWrap: 'balance',
  },
  // Poll block: glass pills over the gradient; stopPropagation on
  // pointerdown keeps votes from starting the stage gesture.
  pollBox: {
    position: 'relative', width: '100%', maxWidth: 260, display: 'flex',
    flexDirection: 'column', gap: 'var(--spacing-2)',
  },
  pollQuestion: {
    fontSize: 18, fontWeight: 700, textAlign: 'center', lineHeight: 1.35,
    marginBottom: 4, textWrap: 'balance',
  },
  pollOption: {
    width: '100%', minHeight: 44, border: `1.5px solid ${STORY_INK_SOFT}`,
    borderRadius: 'var(--radius-full)', backgroundColor: STORY_INK_FAINT,
    color: STORY_INK, fontSize: 14, fontWeight: 600, cursor: 'pointer',
    padding: 'var(--spacing-1) var(--spacing-3)',
  },
  pollResult: {
    position: 'relative', width: '100%', minHeight: 44,
    borderRadius: 'var(--radius-full)', backgroundColor: STORY_INK_FAINT,
    overflow: 'hidden', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 'var(--spacing-2)',
    padding: '0 var(--spacing-3)',
  },
  pollResultFill: {
    position: 'absolute', insetBlock: 0, left: 0,
    backgroundColor: `color-mix(in srgb, ${STORY_INK} 42%, transparent)`,
    transition: `width ${FADE_MS}ms ease`,
  },
  pollResultLabel: {
    position: 'relative', display: 'inline-flex', alignItems: 'center',
    gap: 6, fontSize: 14, fontWeight: 600,
  },
  pollResultPct: {
    position: 'relative', fontSize: 13, fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  pollMeta: {
    fontSize: 12, color: STORY_INK_SOFT, textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  captionBox: {
    position: 'relative', textAlign: 'center',
    padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-4)',
    transition: `opacity ${FADE_MS}ms ease`,
  },
  caption: {fontSize: 13, fontWeight: 500, color: STORY_INK_SOFT},
  // Gesture layer: owns pointer capture for tap-thirds + hold-to-pause.
  gestureLayer: {
    position: 'absolute', inset: 0, touchAction: 'none', cursor: 'pointer',
    borderRadius: 'var(--radius-container)',
  },
  // Cube apparatus: viewport supplies perspective; the rotator carries
  // both faces on a preserve-3d turntable pushed back by half the
  // measured stage width so the seam lands exactly on the frame edges.
  cubeViewport: {position: 'absolute', inset: 0, perspective: 900},
  cubeRotator: {position: 'absolute', inset: 0, transformStyle: 'preserve-3d'},
  cubeFace: {position: 'absolute', inset: 0, backfaceVisibility: 'hidden'},
  fadeFace: {position: 'absolute', inset: 0},
  // Transport row under the stage; 44px targets at <=640px.
  transportButton: {width: 40, height: 40},
  transportButtonCompact: {width: 44, height: 44},
  headerTapTarget: {width: 40, height: 40},
  hintRow: {flexWrap: 'wrap'},
  statusLine: {textAlign: 'center'},
  // Author rail: vertical beside the stage on desktop, horizontal strip
  // beneath it on phones. Rings are conic-gradient unseen indicators.
  railVertical: {
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)',
    flexShrink: 0,
  },
  railHorizontal: {
    display: 'flex', flexDirection: 'row', gap: 'var(--spacing-2)',
    justifyContent: 'center', flexWrap: 'wrap',
  },
  railButton: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    minWidth: 64, padding: 'var(--spacing-1)', border: 'none',
    borderRadius: 'var(--radius-element)', backgroundColor: 'transparent',
    cursor: 'pointer', color: 'var(--color-text-primary)',
  },
  railRing: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 52, height: 52, borderRadius: '50%',
    transition: `transform ${FADE_MS}ms ease`,
  },
  railRingActive: {transform: 'scale(1.12)'},
  // Opaque inner disc: masks the conic pie down to a true outer ring
  // (background-muted is translucent, so the wedges would bleed through
  // the avatar).
  railRingInner: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 46, height: 46, borderRadius: '50%',
    backgroundColor: 'var(--color-background-body)',
  },
  railName: {fontSize: 12, fontWeight: 600, lineHeight: 1.2},
  railStatus: {fontSize: 11, color: 'var(--color-text-secondary)'},
  // Recap grid: Cards with per-frame replay tiles.
  recapColumn: {width: '100%', maxWidth: 720, marginInline: 'auto'},
  recapGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  recapGridCompact: {gridTemplateColumns: 'minmax(0, 1fr)'},
  recapTileRow: {display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  recapTile: {
    position: 'relative', width: 44, height: 78, border: 'none',
    borderRadius: 'var(--radius-element)', cursor: 'pointer',
    overflow: 'hidden', color: STORY_INK, flexShrink: 0,
  },
  recapTileIndex: {
    position: 'absolute', bottom: 4, left: 0, right: 0, fontSize: 11,
    fontWeight: 700, fontVariantNumeric: 'tabular-nums',
  },
  recapSeenMark: {
    position: 'absolute', top: 4, right: 4, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', width: 16, height: 16,
    borderRadius: '50%', backgroundColor: STORY_SHADE,
  },
  recapActions: {flexWrap: 'wrap'},
};

// ============= DATA =============
// Deterministic fixtures: four authors, sixteen frames, fixed durations
// and vote counts. Gradients are color-mix() pairs over semantic tokens
// so every frame tracks the active scheme.

const mix = (token: string, pct: number, base = 'var(--color-background-body)') =>
  `color-mix(in srgb, var(--color-${token}) ${pct}%, ${base})`;

const GRADIENTS: Array<{from: string; to: string}> = [
  {from: mix('accent', 88), to: mix('accent', 34)},
  {from: mix('warning', 82), to: mix('error', 48)},
  {from: mix('success', 74), to: mix('accent', 48)},
  {from: mix('error', 62), to: mix('accent', 60)},
  {from: mix('accent', 58, 'var(--color-success)'), to: mix('background', 62, 'var(--color-accent)')},
  {from: mix('warning', 66), to: mix('success', 52)},
];

type ArtKind = 'peaks' | 'city' | 'orbit' | 'coast' | 'trail';

interface PollOption {
  label: string;
  votes: number;
}

interface StoryFrame {
  id: string;
  kind: 'scene' | 'quote' | 'poll';
  /** Index into GRADIENTS for the frame backdrop. */
  gradient: number;
  /** Frame length; the fill keyframe runs exactly this long. */
  durationMs: number;
  /** Pre-formatted recency label — deterministic fixture, no clocks. */
  postedAgo: string;
  caption: string;
  art?: ArtKind;
  quote?: string;
  poll?: {question: string; options: [PollOption, PollOption]};
}

interface StoryAuthor {
  id: string;
  name: string;
  handle: string;
  frames: StoryFrame[];
}

const AUTHORS: StoryAuthor[] = [
  {
    id: 'ari',
    name: 'Ari Okafor',
    handle: '@ari.builds',
    frames: [
      {id: 'ari-1', kind: 'scene', art: 'peaks', gradient: 0, durationMs: 5000, postedAgo: '2h', caption: 'Sunrise ride above the fog line'},
      {id: 'ari-2', kind: 'quote', gradient: 3, durationMs: 6000, postedAgo: '2h', caption: 'Note to self', quote: 'Ship the walkthrough before the spec — people argue with documents and nod at demos.'},
      {id: 'ari-3', kind: 'scene', art: 'city', gradient: 1, durationMs: 5000, postedAgo: '1h', caption: 'Studio view, late crit night'},
      {id: 'ari-4', kind: 'poll', gradient: 4, durationMs: 6000, postedAgo: '45m', caption: 'Help me pick before Friday', poll: {question: 'Which prototype goes to user testing?', options: [{label: 'Card stack', votes: 96}, {label: 'Timeline', votes: 132}]}},
    ],
  },
  {
    id: 'mina',
    name: 'Mina Park',
    handle: '@mina.codes',
    frames: [
      {id: 'mina-1', kind: 'scene', art: 'orbit', gradient: 3, durationMs: 4000, postedAgo: '5h', caption: 'Overnight sim render — 40k particles'},
      {id: 'mina-2', kind: 'scene', art: 'trail', gradient: 2, durationMs: 5000, postedAgo: '4h', caption: 'Morning 10k on the river loop'},
      {id: 'mina-3', kind: 'quote', gradient: 0, durationMs: 5000, postedAgo: '3h', caption: 'Deploy-day mantra', quote: 'Delete the feature flag. If it still scares you, it never shipped.'},
      {id: 'mina-4', kind: 'poll', gradient: 5, durationMs: 6000, postedAgo: '2h', caption: 'Planning next week’s stream', poll: {question: 'Next deep-dive stream topic?', options: [{label: 'Shader tricks', votes: 84}, {label: 'Live debugging', votes: 141}]}},
      {id: 'mina-5', kind: 'scene', art: 'coast', gradient: 4, durationMs: 4000, postedAgo: '1h', caption: 'Cooldown at the pier'},
    ],
  },
  {
    id: 'theo',
    name: 'Theo Reyes',
    handle: '@theo.frames',
    frames: [
      {id: 'theo-1', kind: 'scene', art: 'coast', gradient: 1, durationMs: 5000, postedAgo: '8h', caption: 'Golden hour test roll, frame 12'},
      {id: 'theo-2', kind: 'scene', art: 'city', gradient: 3, durationMs: 5000, postedAgo: '7h', caption: 'Neon alley series continues'},
      {id: 'theo-3', kind: 'quote', gradient: 5, durationMs: 6000, postedAgo: '6h', caption: 'From tonight’s contact sheet', quote: 'The best camera is the one still in your hand at 2am.'},
    ],
  },
  {
    id: 'zoe',
    name: 'Zoe Adeyemi',
    handle: '@zoe.moves',
    frames: [
      {id: 'zoe-1', kind: 'scene', art: 'trail', gradient: 2, durationMs: 4000, postedAgo: '3h', caption: 'Rehearsal 14 of 30'},
      {id: 'zoe-2', kind: 'quote', gradient: 1, durationMs: 6000, postedAgo: '3h', caption: 'What the room taught me', quote: 'Count the silence — the beat lands where the room holds its breath.'},
      {id: 'zoe-3', kind: 'scene', art: 'peaks', gradient: 5, durationMs: 5000, postedAgo: '2h', caption: 'Company retreat, top of the ridge'},
      {id: 'zoe-4', kind: 'poll', gradient: 0, durationMs: 6000, postedAgo: '1h', caption: 'Closing night is Saturday', poll: {question: 'Closing-night encore?', options: [{label: 'Full-cast finale', votes: 118}, {label: 'Solo reprise', votes: 77}]}},
    ],
  },
];

const TOTAL_FRAMES = AUTHORS.reduce(
  (sum, author) => sum + author.frames.length,
  0,
); // 16

function frameKeyOf(authorIndex: number, frameIndex: number): string {
  return `${authorIndex}-${frameIndex}`;
}

function gradientCss(frame: StoryFrame): string {
  const pair = GRADIENTS[frame.gradient % GRADIENTS.length];
  return `linear-gradient(160deg, ${pair.from}, ${pair.to})`;
}

// ============= VIGNETTE ART =============
// Token-driven SVG compositions over the gradient — no image assets. Glass
// and ink derive from the same always-light STORY_INK pair so shapes read
// on every gradient in both schemes.

const ART_GLASS = `color-mix(in srgb, ${STORY_INK} 82%, transparent)`;
const ART_GLASS_SOFT = `color-mix(in srgb, ${STORY_INK} 42%, transparent)`;
const ART_SHADOW = STORY_SHADE;

// var()/color-mix() values are NOT substituted inside SVG presentation
// attributes (fill would silently fall back to black), so every token
// paint goes through the CSS `style` prop instead.
const FILL_GLASS: CSSProperties = {fill: ART_GLASS};
const FILL_GLASS_SOFT: CSSProperties = {fill: ART_GLASS_SOFT};
const FILL_SHADOW: CSSProperties = {fill: ART_SHADOW};
const STROKE_GLASS: CSSProperties = {stroke: ART_GLASS};
const STROKE_GLASS_SOFT: CSSProperties = {stroke: ART_GLASS_SOFT};

function ArtShapes({art}: {art: ArtKind}) {
  switch (art) {
    case 'peaks':
      return (
        <g>
          <circle cx={196} cy={120} r={34} style={FILL_GLASS} />
          <polygon points="0,360 96,208 190,360" style={FILL_SHADOW} />
          <polygon points="110,360 208,176 300,360" style={FILL_GLASS_SOFT} />
          <polygon points="188,232 208,176 230,232" style={FILL_GLASS} />
          <path d="M46 120 q10 -12 20 0 M86 96 q10 -12 20 0" style={STROKE_GLASS_SOFT} strokeWidth={3} strokeLinecap="round" fill="none" />
        </g>
      );
    case 'city':
      return (
        <g>
          <circle cx={70} cy={104} r={22} style={FILL_GLASS} />
          <rect x={24} y={228} width={44} height={152} rx={4} style={FILL_SHADOW} />
          <rect x={80} y={186} width={52} height={194} rx={4} style={FILL_GLASS_SOFT} />
          <rect x={144} y={248} width={40} height={132} rx={4} style={FILL_SHADOW} />
          <rect x={196} y={162} width={54} height={218} rx={4} style={FILL_GLASS_SOFT} />
          <rect x={92} y={202} width={10} height={10} style={FILL_GLASS} />
          <rect x={112} y={202} width={10} height={10} style={FILL_GLASS} />
          <rect x={92} y={224} width={10} height={10} style={FILL_GLASS} />
          <rect x={208} y={182} width={10} height={10} style={FILL_GLASS} />
          <rect x={228} y={204} width={10} height={10} style={FILL_GLASS} />
        </g>
      );
    case 'orbit':
      return (
        <g>
          <circle cx={135} cy={220} r={62} style={FILL_GLASS_SOFT} />
          <ellipse cx={135} cy={220} rx={104} ry={30} fill="none" style={STROKE_GLASS} strokeWidth={4} transform="rotate(-18 135 220)" />
          <circle cx={224} cy={186} r={10} style={FILL_GLASS} />
          <circle cx={56} cy={258} r={6} style={FILL_GLASS} />
          <circle cx={68} cy={110} r={3} style={FILL_GLASS} />
          <circle cx={216} cy={92} r={3} style={FILL_GLASS} />
          <circle cx={186} cy={340} r={3} style={FILL_GLASS} />
        </g>
      );
    case 'coast':
      return (
        <g>
          <circle cx={135} cy={168} r={40} style={FILL_GLASS} />
          <path d="M0 300 q34 -18 68 0 t68 0 t68 0 t68 0 V480 H0 Z" style={FILL_GLASS_SOFT} />
          <path d="M0 340 q34 -16 68 0 t68 0 t68 0 t68 0 V480 H0 Z" style={FILL_SHADOW} />
          <rect x={119} y={216} width={32} height={6} rx={3} style={FILL_GLASS_SOFT} />
          <rect x={111} y={230} width={48} height={6} rx={3} style={FILL_GLASS_SOFT} />
        </g>
      );
    case 'trail':
      return (
        <g>
          <path d="M52 396 C 130 340, 60 268, 140 226 S 226 130, 208 84" fill="none" style={STROKE_GLASS} strokeWidth={5} strokeLinecap="round" strokeDasharray="2 14" />
          <circle cx={52} cy={396} r={11} style={FILL_GLASS} />
          <circle cx={208} cy={84} r={11} style={FILL_GLASS_SOFT} />
          <rect x={172} y={44} width={72} height={24} rx={12} style={FILL_SHADOW} />
          <rect x={184} y={54} width={48} height={5} rx={2.5} style={FILL_GLASS} />
        </g>
      );
  }
}

function FrameArt({art}: {art: ArtKind}) {
  return (
    <svg
      viewBox="0 0 270 480"
      preserveAspectRatio="xMidYMid slice"
      style={styles.faceArt}
      aria-hidden>
      <ArtShapes art={art} />
    </svg>
  );
}

// ============= RAIL RING =============

/**
 * Conic-gradient unseen indicator: one arc per frame, accent while unseen,
 * muted border token once viewed, with small transparent gaps so segments
 * read individually — the story-rail idiom, hand-rolled from one gradient.
 */
function ringGradient(seenFlags: boolean[]): string {
  const count = seenFlags.length;
  const segment = 360 / count;
  const gap = count > 1 ? 10 : 0;
  const stops: string[] = [];
  seenFlags.forEach((isSeen, index) => {
    const start = index * segment;
    const end = start + segment;
    const color = isSeen ? RING_SEEN : RING_UNSEEN;
    stops.push(`transparent ${start}deg ${start + gap / 2}deg`);
    stops.push(`${color} ${start + gap / 2}deg ${end - gap / 2}deg`);
    stops.push(`transparent ${end - gap / 2}deg ${end}deg`);
  });
  return `conic-gradient(from 0deg, ${stops.join(', ')})`;
}

function AuthorRail({
  vertical,
  activeIndex,
  isRecap,
  seen,
  onSelect,
}: {
  vertical: boolean;
  activeIndex: number;
  isRecap: boolean;
  seen: ReadonlySet<string>;
  onSelect: (authorIndex: number) => void;
}) {
  return (
    <div
      style={vertical ? styles.railVertical : styles.railHorizontal}
      role="group"
      aria-label="Story authors">
      {AUTHORS.map((author, authorIndex) => {
        const seenFlags = author.frames.map((_, frameIndex) =>
          seen.has(frameKeyOf(authorIndex, frameIndex)),
        );
        const unseenCount = seenFlags.filter(flag => !flag).length;
        const isActive = !isRecap && authorIndex === activeIndex;
        return (
          <button
            key={author.id}
            type="button"
            style={styles.railButton}
            aria-label={`${author.name} — ${
              unseenCount > 0 ? `${unseenCount} unseen` : 'all seen'
            }${isActive ? ', currently viewing' : ''}`}
            aria-current={isActive || undefined}
            onClick={() => onSelect(authorIndex)}>
            <span
              aria-hidden
              style={{
                ...styles.railRing,
                ...(isActive ? styles.railRingActive : undefined),
                backgroundImage: ringGradient(seenFlags),
              }}>
              <span style={styles.railRingInner}>
                <Avatar name={author.name} size={40} />
              </span>
            </span>
            <span style={styles.railName}>{author.name.split(' ')[0]}</span>
            {vertical && (
              <span style={styles.railStatus}>
                {unseenCount > 0 ? `${unseenCount} new` : 'caught up'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============= POLL BLOCK =============

function PollBlock({
  frame,
  frameKey,
  choice,
  isLive,
  onVote,
}: {
  frame: StoryFrame;
  frameKey: string;
  choice: number | undefined;
  isLive: boolean;
  onVote: (frameKey: string, optionIndex: number) => void;
}) {
  const poll = frame.poll;
  if (poll == null) {
    return null;
  }
  const hasVoted = choice != null;
  const totals = poll.options.map(
    (option, index) => option.votes + (choice === index ? 1 : 0),
  );
  const total = totals[0] + totals[1];
  return (
    // stopPropagation on pointerdown keeps a vote from also starting the
    // stage's tap/hold gesture — the poll owns its own hit area.
    <div style={styles.pollBox} onPointerDown={event => event.stopPropagation()}>
      <span style={styles.pollQuestion}>{poll.question}</span>
      {poll.options.map((option, index) => {
        const pct = Math.round((totals[index] / total) * 100);
        if (!hasVoted) {
          return (
            <button
              key={option.label}
              type="button"
              style={styles.pollOption}
              disabled={!isLive}
              onClick={() => onVote(frameKey, index)}>
              {option.label}
            </button>
          );
        }
        return (
          <div
            key={option.label}
            style={styles.pollResult}
            role="img"
            aria-label={`${option.label}: ${pct} percent`}>
            <div aria-hidden style={{...styles.pollResultFill, width: `${pct}%`}} />
            <span style={styles.pollResultLabel}>
              {option.label}
              {choice === index && <Icon icon={CheckIcon} size="xsm" color="inherit" />}
            </span>
            <span style={styles.pollResultPct}>{pct}%</span>
          </div>
        );
      })}
      <span style={styles.pollMeta}>
        {hasVoted ? `${total} votes · thanks for voting` : `${total} votes so far`}
      </span>
    </div>
  );
}

// ============= STORY FACE =============

/**
 * One story surface: gradient canvas, vignette/quote/poll composition,
 * top chrome (segmented progress + author row + close), bottom caption.
 * Rendered live (animated fill, working poll, close button) on the active
 * stage and static (past segments filled, current empty) on cube faces.
 */
function StoryFace({
  authorIndex,
  frameIndex,
  isLive,
  fillKey,
  fillRunning,
  isStepped,
  onFillEnd,
  chromeHidden,
  showPausedChip,
  votes,
  onVote,
  onClose,
}: {
  authorIndex: number;
  frameIndex: number;
  isLive: boolean;
  fillKey?: string;
  fillRunning?: boolean;
  /** Reduced motion: discrete steps(6) fill instead of a linear slide. */
  isStepped?: boolean;
  onFillEnd?: () => void;
  chromeHidden?: boolean;
  showPausedChip?: boolean;
  votes: Record<string, number>;
  onVote: (frameKey: string, optionIndex: number) => void;
  onClose?: () => void;
}) {
  const author = AUTHORS[authorIndex];
  const frame = author.frames[frameIndex];
  const frameKey = frameKeyOf(authorIndex, frameIndex);
  return (
    <div style={{...styles.face, background: gradientCss(frame)}}>
      {frame.kind === 'scene' && frame.art != null && <FrameArt art={frame.art} />}
      <div aria-hidden style={styles.scrimTop} />
      <div aria-hidden style={styles.scrimBottom} />

      <div
        style={{
          ...styles.chromeTop,
          ...(chromeHidden ? styles.chromeHidden : undefined),
        }}>
        <div
          style={styles.segmentsRow}
          role="progressbar"
          aria-label={`${author.name} — frame ${frameIndex + 1} of ${author.frames.length}`}
          aria-valuenow={frameIndex + 1}
          aria-valuemin={1}
          aria-valuemax={author.frames.length}>
          {author.frames.map((segmentFrame, segmentIndex) => (
            <div key={segmentFrame.id} style={styles.segmentTrack}>
              {segmentIndex < frameIndex ? (
                <div style={styles.segmentFull} />
              ) : segmentIndex === frameIndex && isLive ? (
                // Keyed so every navigation restarts the keyframe from 0;
                // animationend here is the deterministic frame chainer.
                <div
                  key={fillKey}
                  style={{
                    ...styles.segmentFill,
                    animationName: 'spv-fill',
                    animationDuration: `${segmentFrame.durationMs}ms`,
                    animationTimingFunction: isStepped ? 'steps(6, end)' : 'linear',
                    animationFillMode: 'forwards',
                    animationPlayState: fillRunning ? 'running' : 'paused',
                  }}
                  onAnimationEnd={onFillEnd}
                />
              ) : null}
            </div>
          ))}
        </div>
        <div style={styles.authorRow}>
          <Avatar name={author.name} size={24} style={styles.authorAvatar} />
          <span style={styles.authorName}>{author.name}</span>
          <span style={styles.postedAgo}>
            {author.handle} · {frame.postedAgo}
          </span>
          <span style={styles.rowSpacer} />
          {showPausedChip && (
            <span style={styles.pausedChip}>
              <Icon icon={PauseIcon} size="xsm" color="inherit" />
              Paused
            </span>
          )}
          {isLive && onClose != null && (
            <button
              type="button"
              style={styles.closeButton}
              aria-label="End stories and open the recap"
              onPointerDown={event => event.stopPropagation()}
              onClick={onClose}>
              <Icon icon={XIcon} size="sm" color="inherit" />
            </button>
          )}
        </div>
      </div>

      <div style={styles.faceCenter}>
        {frame.kind === 'quote' && (
          <>
            <span aria-hidden style={styles.quoteMark}>
              &ldquo;
            </span>
            <p style={styles.quoteText}>{frame.quote}</p>
          </>
        )}
        {frame.kind === 'poll' && (
          <PollBlock
            frame={frame}
            frameKey={frameKey}
            choice={votes[frameKey]}
            isLive={isLive}
            onVote={onVote}
          />
        )}
      </div>

      <div
        style={{
          ...styles.captionBox,
          ...(chromeHidden ? styles.chromeHidden : undefined),
        }}>
        <span style={styles.caption}>{frame.caption}</span>
      </div>
    </div>
  );
}

// ============= PAGE =============

interface StoryPosition {
  a: number;
  f: number;
}

type MotionPhase = 'start' | 'run';

interface CubeState {
  fromA: number;
  fromF: number;
  dir: 1 | -1;
  /** Half the measured stage width — the cube's translateZ depth. */
  halfW: number;
  phase: MotionPhase;
}

type HoldPhase = 'none' | 'pending' | 'held';

export default function StoryProgressViewerTemplate() {
  const [pos, setPos] = useState<StoryPosition>({a: 0, f: 0});
  const [isPlaying, setIsPlaying] = useState(true);
  const [hold, setHold] = useState<HoldPhase>('none');
  const [cube, setCube] = useState<CubeState | null>(null);
  const [isRecap, setIsRecap] = useState(false);
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());
  const [votes, setVotes] = useState<Record<string, number>>({});
  // Bumped on every navigation so re-entering a frame re-keys (and
  // restarts) the fill keyframe even when the position repeats.
  const [cycle, setCycle] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<number | null>(null);
  const holdPointerRef = useRef<number | null>(null);

  // Responsive contract: <=640px is the full-bleed native pattern.
  const isCompact = useMediaQuery('(max-width: 640px)');
  // Reduced motion: cube -> crossfade, fill slides -> discrete steps.
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const author = AUTHORS[pos.a];
  const frame = author.frames[pos.f];
  const isHeld = hold === 'held';
  // The suspension interlock: transport pause, an active hold, or a
  // mid-flight cube turn all park animation-play-state.
  const fillRunning = isPlaying && hold === 'none' && cube == null && !isRecap;
  const viewedCount = seen.size;

  // Every displayed frame marks itself seen — this drives the conic rings.
  useEffect(() => {
    const key = frameKeyOf(pos.a, pos.f);
    setSeen(prev => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, [pos]);

  // Hold-timer hygiene on unmount.
  useEffect(() => {
    return () => {
      if (holdTimerRef.current != null) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  // ----- Shared commit path (taps, transport, keys, animationend) -----

  const startCube = (toAuthor: number, toFrame: number, dir: 1 | -1) => {
    const width = stageRef.current?.clientWidth ?? 320;
    setCube({fromA: pos.a, fromF: pos.f, dir, halfW: width / 2, phase: 'start'});
    setPos({a: toAuthor, f: toFrame});
    setCycle(prev => prev + 1);
  };

  const goTo = (a: number, f: number) => {
    setPos({a, f});
    setCycle(prev => prev + 1);
  };

  /** Next frame; past the last frame of the last author -> recap grid. */
  const stepNext = () => {
    if (isRecap || cube != null) {
      return;
    }
    if (pos.f < author.frames.length - 1) {
      goTo(pos.a, pos.f + 1);
    } else if (pos.a < AUTHORS.length - 1) {
      startCube(pos.a + 1, 0, 1);
    } else {
      setIsRecap(true);
      setIsPlaying(false);
    }
  };

  /** Previous frame; before the first frame, cube back one author. */
  const stepBack = () => {
    if (isRecap || cube != null) {
      return;
    }
    if (pos.f > 0) {
      goTo(pos.a, pos.f - 1);
    } else if (pos.a > 0) {
      startCube(pos.a - 1, 0, -1);
    } else {
      // Already at the very first frame: restart its fill from zero.
      goTo(0, 0);
    }
  };

  const switchAuthor = (target: number) => {
    if (isRecap) {
      // From the recap, a rail tap re-enters stories at that author.
      setIsRecap(false);
      setIsPlaying(true);
      goTo(target, 0);
      return;
    }
    if (cube != null) {
      return;
    }
    if (target === pos.a) {
      goTo(target, 0);
      return;
    }
    startCube(target, 0, target > pos.a ? 1 : -1);
  };

  const togglePlay = () => {
    if (isRecap) {
      return;
    }
    setIsPlaying(prev => !prev);
  };

  const openRecap = () => {
    setIsRecap(true);
    setIsPlaying(false);
    setHold('none');
  };

  const watchAgain = () => {
    setSeen(new Set());
    setVotes({});
    setIsRecap(false);
    setIsPlaying(true);
    setCube(null);
    goTo(0, 0);
  };

  const replayFrom = (a: number, f: number) => {
    setIsRecap(false);
    setIsPlaying(true);
    goTo(a, f);
  };

  const handleVote = (frameKey: string, optionIndex: number) => {
    setVotes(prev => (frameKey in prev ? prev : {...prev, [frameKey]: optionIndex}));
  };

  // ----- Pointer gesture: tap thirds + press-and-hold (with capture) -----

  const clearHoldTimer = () => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleStagePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isRecap || cube != null) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    holdPointerRef.current = event.pointerId;
    // Pressing pauses immediately ('pending' already suspends play-state);
    // the timer only decides whether release is a tap or a hold ending.
    setHold('pending');
    clearHoldTimer();
    holdTimerRef.current = window.setTimeout(() => {
      setHold(prev => (prev === 'pending' ? 'held' : prev));
    }, HOLD_MS);
  };

  const handleStagePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (holdPointerRef.current !== event.pointerId) {
      return;
    }
    clearHoldTimer();
    holdPointerRef.current = null;
    const wasHeld = hold === 'held';
    setHold('none');
    if (wasHeld) {
      return; // Releasing a hold just resumes — never also steps.
    }
    // Short press = tap. Left third back, right third forward, middle
    // toggles play — the same commit functions the keys/buttons call.
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / Math.max(1, rect.width);
    if (ratio < 1 / 3) {
      stepBack();
    } else if (ratio > 2 / 3) {
      stepNext();
    } else {
      togglePlay();
    }
  };

  const handleStagePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (holdPointerRef.current !== event.pointerId) {
      return;
    }
    clearHoldTimer();
    holdPointerRef.current = null;
    setHold('none');
  };

  // ----- Cube two-phase kickoff + safety net -----

  useEffect(() => {
    if (cube == null || cube.phase !== 'start') {
      return;
    }
    let rafB = 0;
    const rafA = requestAnimationFrame(() => {
      rafB = requestAnimationFrame(() => {
        setCube(prev =>
          prev != null && prev.phase === 'start' ? {...prev, phase: 'run'} : prev,
        );
      });
    });
    return () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
    };
  }, [cube]);

  // If a transitionend is swallowed (tab hidden mid-turn), clear the cube
  // on a timer so playback never wedges. Bookkeeping only — content and
  // ordering stay fixture-driven.
  useEffect(() => {
    if (cube == null || cube.phase !== 'run') {
      return;
    }
    const timer = window.setTimeout(
      () => setCube(null),
      (isReducedMotion ? FADE_MS : CUBE_MS) + 160,
    );
    return () => window.clearTimeout(timer);
  }, [cube, isReducedMotion]);

  const handleCubeTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.propertyName === (isReducedMotion ? 'opacity' : 'transform')) {
      setCube(null);
    }
  };

  // ----- Keyboard: mirrors every gesture (same commit path) -----
  // Space pause/resume, ←/→ step frames, ↑/↓ switch author. Re-subscribed
  // each render so handlers never close over stale position state; form
  // fields and focused buttons keep their native keys.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target != null &&
        target.closest('input, textarea, select, button') != null
      ) {
        return;
      }
      if (event.key === ' ') {
        event.preventDefault();
        togglePlay();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepBack();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!isRecap && pos.a < AUTHORS.length - 1) {
          switchAuthor(pos.a + 1);
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!isRecap && pos.a > 0) {
          switchAuthor(pos.a - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // ----- Stage (live face, or the cube/crossfade apparatus) -----

  const fillKey = `${pos.a}-${pos.f}-${cycle}`;

  const liveFace = (
    <div
      style={styles.gestureLayer}
      role="group"
      aria-label={`Story stage — ${author.name}, frame ${pos.f + 1} of ${author.frames.length}. Tap sides to step, press and hold to pause.`}
      onPointerDown={handleStagePointerDown}
      onPointerUp={handleStagePointerUp}
      onPointerCancel={handleStagePointerCancel}>
      <StoryFace
        authorIndex={pos.a}
        frameIndex={pos.f}
        isLive
        fillKey={fillKey}
        fillRunning={fillRunning}
        isStepped={isReducedMotion}
        onFillEnd={stepNext}
        chromeHidden={isHeld}
        showPausedChip={!isPlaying && hold === 'none'}
        votes={votes}
        onVote={handleVote}
        onClose={openRecap}
      />
    </div>
  );

  const cubeApparatus =
    cube == null ? null : isReducedMotion ? (
      // Reduced motion: the group transition is an opacity crossfade.
      <>
        <div style={styles.fadeFace} aria-hidden>
          <StoryFace
            authorIndex={cube.fromA}
            frameIndex={cube.fromF}
            isLive={false}
            votes={votes}
            onVote={handleVote}
          />
        </div>
        <div
          style={{
            ...styles.fadeFace,
            opacity: cube.phase === 'run' ? 1 : 0,
            transition:
              cube.phase === 'run' ? `opacity ${FADE_MS}ms ease` : 'none',
          }}
          onTransitionEnd={handleCubeTransitionEnd}>
          <StoryFace
            authorIndex={pos.a}
            frameIndex={pos.f}
            isLive={false}
            votes={votes}
            onVote={handleVote}
          />
        </div>
      </>
    ) : (
      // The perspective cube turn: both faces ride a preserve-3d rotator
      // pushed back by half the measured stage width, so the shared edge
      // stays glued to the frame while the group rotates ±90°.
      <div style={styles.cubeViewport}>
        <div
          style={{
            ...styles.cubeRotator,
            transform: `translateZ(${-cube.halfW}px) rotateY(${
              cube.phase === 'run' ? -cube.dir * 90 : 0
            }deg)`,
            transition:
              cube.phase === 'run'
                ? `transform ${CUBE_MS}ms ${CUBE_EASE}`
                : 'none',
          }}
          onTransitionEnd={handleCubeTransitionEnd}>
          <div
            style={{
              ...styles.cubeFace,
              transform: `rotateY(0deg) translateZ(${cube.halfW}px)`,
            }}
            aria-hidden>
            <StoryFace
              authorIndex={cube.fromA}
              frameIndex={cube.fromF}
              isLive={false}
              votes={votes}
              onVote={handleVote}
            />
          </div>
          <div
            style={{
              ...styles.cubeFace,
              transform: `rotateY(${cube.dir * 90}deg) translateZ(${cube.halfW}px)`,
            }}>
            <StoryFace
              authorIndex={pos.a}
              frameIndex={pos.f}
              isLive={false}
              votes={votes}
              onVote={handleVote}
            />
          </div>
        </div>
      </div>
    );

  const transportStyle = isCompact
    ? styles.transportButtonCompact
    : styles.transportButton;

  const storiesColumn = (
    <div style={styles.stageColumn}>
      <div ref={stageRef} style={styles.stageFrame}>
        {cube == null ? liveFace : cubeApparatus}
      </div>

      {/* Transport: the button path for every gesture — same commit
          functions as taps and keys. */}
      <HStack gap={2} vAlign="center" hAlign="center">
        <IconButton
          label="Previous frame"
          tooltip="Previous frame (←)"
          icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
          variant="secondary"
          size="md"
          onClick={stepBack}
          style={transportStyle}
        />
        <IconButton
          label={isPlaying ? 'Pause' : 'Play'}
          tooltip={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          icon={
            <Icon
              icon={isPlaying ? PauseIcon : PlayIcon}
              size="sm"
              color="inherit"
            />
          }
          variant="primary"
          size="md"
          onClick={togglePlay}
          style={transportStyle}
        />
        <IconButton
          label="Next frame"
          tooltip="Next frame (→)"
          icon={<Icon icon={ChevronRightIcon} size="sm" color="inherit" />}
          variant="secondary"
          size="md"
          onClick={stepNext}
          style={transportStyle}
        />
      </HStack>

      <div style={styles.statusLine}>
        <Text type="supporting" color="secondary" hasTabularNumbers role="status">
          {author.name} · frame {pos.f + 1} of {author.frames.length}
        </Text>
      </div>

      {!isCompact && (
        <HStack gap={3} vAlign="center" hAlign="center" style={styles.hintRow}>
          <HStack gap={1} vAlign="center">
            <Kbd keys="Space" />
            <Text type="supporting" color="secondary">
              pause
            </Text>
          </HStack>
          <HStack gap={1} vAlign="center">
            <Kbd keys="←" />
            <Kbd keys="→" />
            <Text type="supporting" color="secondary">
              frames
            </Text>
          </HStack>
          <HStack gap={1} vAlign="center">
            <Kbd keys="↑" />
            <Kbd keys="↓" />
            <Text type="supporting" color="secondary">
              authors
            </Text>
          </HStack>
          <Text type="supporting" color="secondary">
            Hold the stage to pause
          </Text>
        </HStack>
      )}
    </div>
  );

  // ----- Recap grid -----

  const recapColumn = (
    <div style={styles.recapColumn}>
      <VStack gap={4}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Icon icon={SparklesIcon} size="lg" color="secondary" />
            <Heading level={2}>All caught up</Heading>
          </HStack>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {TOTAL_FRAMES} frames from {AUTHORS.length} authors · {viewedCount}{' '}
            viewed — tap any tile to replay from there.
          </Text>
        </VStack>
        <Divider />
        <div
          style={
            isCompact
              ? {...styles.recapGrid, ...styles.recapGridCompact}
              : styles.recapGrid
          }>
          {AUTHORS.map((recapAuthor, a) => {
            const seenFlags = recapAuthor.frames.map((_, f) =>
              seen.has(frameKeyOf(a, f)),
            );
            return (
              <Card key={recapAuthor.id} padding={3}>
                <VStack gap={3}>
                  <HStack gap={2} vAlign="center">
                    <span
                      aria-hidden
                      style={{
                        ...styles.railRing,
                        width: 44,
                        height: 44,
                        backgroundImage: ringGradient(seenFlags),
                      }}>
                      <span
                        style={{...styles.railRingInner, width: 38, height: 38}}>
                        <Avatar name={recapAuthor.name} size={32} />
                      </span>
                    </span>
                    <StackItem size="fill">
                      <VStack gap={0}>
                        <Text type="label" weight="semibold">
                          {recapAuthor.name}
                        </Text>
                        <Text type="supporting" color="secondary" hasTabularNumbers>
                          {recapAuthor.handle} · {recapAuthor.frames.length} frames
                        </Text>
                      </VStack>
                    </StackItem>
                    <Button
                      label="Replay"
                      variant="secondary"
                      size="sm"
                      icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
                      onClick={() => replayFrom(a, 0)}
                    />
                  </HStack>
                  <div style={styles.recapTileRow}>
                    {recapAuthor.frames.map((tileFrame, f) => (
                      <button
                        key={tileFrame.id}
                        type="button"
                        style={{
                          ...styles.recapTile,
                          background: gradientCss(tileFrame),
                        }}
                        aria-label={`Replay ${recapAuthor.name} frame ${f + 1}: ${tileFrame.caption}`}
                        onClick={() => replayFrom(a, f)}>
                        {seen.has(frameKeyOf(a, f)) && (
                          <span style={styles.recapSeenMark} aria-hidden>
                            <Icon icon={CheckIcon} size="xsm" color="inherit" />
                          </span>
                        )}
                        <span style={styles.recapTileIndex}>{f + 1}</span>
                      </button>
                    ))}
                  </div>
                </VStack>
              </Card>
            );
          })}
        </div>
        <HStack gap={2} vAlign="center" style={styles.recapActions}>
          <Button
            label="Watch again from the start"
            variant="primary"
            icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
            onClick={watchAgain}
          />
          <Text type="supporting" color="secondary">
            Resets the rings and poll votes for a fresh pass.
          </Text>
        </HStack>
      </VStack>
    </div>
  );

  // ----- Frame -----

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Stories</Heading>
                <Badge
                  label={isRecap ? 'Recap' : isPlaying ? 'Playing' : 'Paused'}
                  variant={isRecap ? 'neutral' : isPlaying ? 'blue' : 'warning'}
                />
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    Tap the sides · hold to pause
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Tooltip content={`${viewedCount} of ${TOTAL_FRAMES} frames viewed`}>
              <Badge
                label={`${viewedCount} / ${TOTAL_FRAMES}`}
                variant={viewedCount === TOTAL_FRAMES ? 'success' : 'neutral'}
              />
            </Tooltip>
            <IconButton
              label="Restart all stories"
              tooltip="Restart all stories"
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={watchAgain}
              style={isCompact ? styles.headerTapTarget : undefined}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div
            style={
              isCompact
                ? {...styles.backdrop, ...styles.backdropCompact}
                : styles.backdrop
            }>
            <style>{KEYFRAME_CSS}</style>
            {isRecap ? (
              <div style={styles.centerWrap}>{recapColumn}</div>
            ) : isCompact ? (
              <VStack gap={3} style={{marginBlock: 'auto'}}>
                {storiesColumn}
                <AuthorRail
                  vertical={false}
                  activeIndex={pos.a}
                  isRecap={isRecap}
                  seen={seen}
                  onSelect={switchAuthor}
                />
              </VStack>
            ) : (
              <div style={styles.centerWrap}>
                <AuthorRail
                  vertical
                  activeIndex={pos.a}
                  isRecap={isRecap}
                  seen={seen}
                  onSelect={switchAuthor}
                />
                {storiesColumn}
              </div>
            )}
          </div>
        </LayoutContent>
      }
    />
  );
}
