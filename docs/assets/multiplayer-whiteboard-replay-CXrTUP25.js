var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one recorded whiteboard session — a
 *   sprint-retro board for the Delivery squad, 120 replay ticks long: four
 *   named remote collaborators each with a color and a cursor keyframe path,
 *   plus a 30-entry board event log of frame adds, sticky-note adds / moves /
 *   text edits, connector adds, comment pins, and select / deselect beats.
 *   Two notes belong to the local viewer ("You") so the canvas is touchable,
 *   not just watchable. No clocks, randomness, or network assets)
 * @output Multiplayer whiteboard REPLAY: a LayoutHeader with the board title,
 *   a "Replay" Badge, and a presence avatar stack whose collaborator chips
 *   toggle Follow mode (the canvas pans via CSS transform interpolation to
 *   track the followed collaborator's viewport, mirrored as a moving
 *   rectangle on a corner minimap); a pannable / zoomable stage of
 *   absolutely-positioned frames, sticky notes, and comment pins over one
 *   SVG connector layer, with remote cursors gliding along interpolated
 *   keyframe paths carrying name tags, and colored selection halos on
 *   whatever object each collaborator is manipulating; a bottom-docked
 *   transport (restart / step / play / step, tick counter, scrub Slider,
 *   0.5–2x speed SegmentedControl); and an event-log LayoutPanel whose rows
 *   jump the replay to any recorded beat. Board state is a PURE FUNCTION of
 *   (fixture, tick) — scrubbing backward rewinds cleanly with zero
 *   accumulated state. The viewer can drag (or arrow-key nudge) their own
 *   two notes between ticks through the same transform system; when Mira's
 *   scripted tick-74 edit lands on a note the viewer has moved, the note
 *   flashes a conflict ring and a who-wins Toast explains that the replayed
 *   edit overrode the local move
 * @position Page template; emitted by \`astryx template multiplayer-whiteboard-replay\`
 *
 * Frame: Layout height="fill". LayoutHeader carries title + Badge + presence
 * stack + follow caption. LayoutContent (padding 0) is the stage: an
 * overflow-hidden viewport holding one transformed board surface (1600x1000
 * virtual units) with an SVG connector layer under absolutely positioned
 * object divs, plus floating zoom controls and the minimap overlay.
 * LayoutPanel end 312 is the event log (List rows that scrub the replay).
 * LayoutFooter is the transport. Choose over browser-session-replay when the
 * exhibit is third-party presence on a spatial canvas (cursors, halos,
 * follow mode), not frame-by-frame screenshot playback; over
 * org-chart-explorer when objects arrive over time via a replay transport
 * rather than living in an editable tree.
 *
 * Container policy (canvas archetype): page chrome is frame-first rows and
 * panels; the board's objects are hand-rolled absolutely positioned divs
 * (notes are plain buttons so each sticky is one focusable tap target) plus
 * exactly one SVG layer for connectors. No Cards on the canvas.
 *
 * Interaction contract:
 * - Replay: play/pause (Space), step back/forward (J/K or buttons), restart,
 *   scrub Slider, and 0.5x/1x/2x speed. Only the tick advances on the
 *   playback interval — every object, halo, cursor position, and comment is
 *   re-derived from the fixture at that tick, so stepping backward is exact.
 * - Cursors: remote cursor positions linearly interpolate between fixture
 *   keyframes per tick, and a short CSS transform transition smooths the
 *   inter-tick hop so motion reads as human gliding (reduced-motion drops
 *   the transition and steps discretely).
 * - Follow: pressing a presence chip pans the board (CSS transform
 *   transition) to keep that collaborator's cursor centered; the minimap's
 *   viewport rectangle tracks the pan. Manually panning the background
 *   releases Follow without a jump.
 * - Local touch: the viewer's two notes drag with pointer capture (deltas
 *   divided by zoom so grabs stay 1:1 at any scale); the identical commit
 *   path (commitNoteOffset) is driven by arrow keys when a note has focus,
 *   so the surface is fully operable without a pointer.
 * - Conflict: if the replay crosses a scripted remote move of a note the
 *   viewer has locally moved, the remote edit wins — the local offset is
 *   discarded, the note flashes an error ring (static ring under
 *   reduced-motion), and a Toast names the winner.
 * - Event log rows and comment pins are click targets: rows jump the tick,
 *   pins toggle their comment bubble.
 *
 * Responsive contract:
 * - >1024px: header | stage (fill) + event-log panel 312 | transport footer.
 * - <=1024px: the event-log panel hides (single-pane fallback — the stage
 *   owns the width); the transport keeps the full scrub row.
 * - <=640px: the canvas is the full stage with floating >=40px zoom buttons
 *   and the bottom-docked transport wraps to two rows (buttons + counter,
 *   then the full-width scrub Slider with the speed control); presence
 *   chips stay >=40px; the follow caption and Kbd hints hide. No
 *   hover-only interactions — every affordance is a click/tap or key.
 * - The stage is the page's one deliberate pan surface: the board is
 *   transform-positioned, panned by pointer drag with capture, never by
 *   page scroll, so 375px keeps the chrome fixed while the canvas moves.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token, a
 * color-mix() over tokens, or an explicit light-dark() pair (collaborator
 * identities and cursor-tag text are light-dark() pairs audited in dark
 * mode); no raw hex or rgb() outside light-dark().
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import {
  MessageSquareIcon,
  MousePointer2Icon,
  MoveIcon,
  PauseIcon,
  PenLineIcon,
  PlayIcon,
  RotateCcwIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SplineIcon,
  SquareDashedIcon,
  StickyNoteIcon,
  ZoomInIcon,
  ZoomOutIcon,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Slider} from '@astryxdesign/core/Slider';
import {Toast} from '@astryxdesign/core/Toast';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= BOARD GEOMETRY =============

/** Virtual board units — every fixture coordinate lives on this plane. */
const BOARD_W = 1600;
const BOARD_H = 1000;
const NOTE_W = 200;
const NOTE_H = 110;

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 0.2;

/** Minimap: 0.1 scale of the board → 160 x 100. */
const MINI_SCALE = 0.1;
const MINI_W = BOARD_W * MINI_SCALE;
const MINI_H = BOARD_H * MINI_SCALE;

/** Replay length and 1x cadence (interval only advances the tick). */
const TOTAL_TICKS = 120;
const BASE_TICK_MS = 200;

/** Arrow-key nudge, in board units — same commit path as pointer drag. */
const NUDGE_STEP = 12;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Stage: overflow-hidden viewport; the board pans under it via transform.
  stage: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    cursor: 'grab',
    touchAction: 'none',
  },
  stagePanning: {cursor: 'grabbing', userSelect: 'none'},
  // Board surface: fixed virtual size, transformed from the top-left corner
  // so pan/zoom math stays plain multiply-and-add.
  board: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BOARD_W,
    height: BOARD_H,
    transformOrigin: '0 0',
    borderRadius: 12,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-primary)',
    backgroundImage:
      'radial-gradient(color-mix(in srgb, var(--color-border) 75%, transparent) 1px, transparent 1.5px)',
    backgroundSize: '32px 32px',
  },
  connectorLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  frame: {
    position: 'absolute',
    borderRadius: 10,
    border: '1.5px solid color-mix(in srgb, var(--color-border) 80%, var(--color-text-secondary))',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-secondary) 55%, transparent)',
  },
  frameLabel: {
    position: 'absolute',
    top: -26,
    left: 0,
    padding: '2px 8px',
    borderRadius: 6,
    backgroundColor: 'var(--color-background-secondary)',
    whiteSpace: 'nowrap',
  },
  // Sticky notes are plain buttons: one focusable, draggable tap target
  // each. Fill and border tint from the owner's collaborator color.
  note: {
    position: 'absolute',
    width: NOTE_W,
    height: NOTE_H,
    boxSizing: 'border-box',
    display: 'block',
    padding: '10px 12px',
    borderRadius: 8,
    font: 'inherit',
    textAlign: 'start',
    color: 'var(--color-text-primary)',
    boxShadow:
      '0 2px 6px color-mix(in srgb, var(--color-text-primary) 18%, transparent)',
    cursor: 'default',
  },
  noteOwn: {cursor: 'grab'},
  noteDragging: {cursor: 'grabbing'},
  noteOwnerRow: {
    position: 'absolute',
    left: 12,
    bottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  ownerDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  // Comment pins: 28px disc with a 40px transparent hit pad around it.
  commentPin: {
    position: 'absolute',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  commentDisc: {
    width: 28,
    height: 28,
    borderRadius: '50% 50% 50% 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow:
      '0 2px 5px color-mix(in srgb, var(--color-text-primary) 25%, transparent)',
  },
  commentBubble: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    width: 240,
    padding: '8px 10px',
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-primary)',
    boxShadow:
      '0 4px 14px color-mix(in srgb, var(--color-text-primary) 20%, transparent)',
    textAlign: 'start',
    zIndex: 6,
  },
  // Remote cursors: pointer-transparent sprites gliding over everything.
  cursor: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 30,
    pointerEvents: 'none',
  },
  cursorTag: {
    marginLeft: 12,
    marginTop: -4,
    padding: '2px 8px',
    borderRadius: 999,
    whiteSpace: 'nowrap',
    width: 'fit-content',
  },
  // Floating stage overlays.
  zoomOverlay: {
    position: 'absolute',
    top: 'var(--spacing-3)',
    right: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 4,
    borderRadius: 10,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-primary) 88%, transparent)',
    zIndex: 40,
  },
  zoomButton: {width: 40, height: 40},
  minimap: {
    position: 'absolute',
    left: 'var(--spacing-3)',
    bottom: 'var(--spacing-3)',
    width: MINI_W,
    height: MINI_H,
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-primary) 86%, transparent)',
    overflow: 'hidden',
    zIndex: 40,
    pointerEvents: 'none',
  },
  minimapRect: {position: 'absolute', borderRadius: 2},
  minimapViewport: {
    position: 'absolute',
    border: '1.5px solid var(--color-accent)',
    backgroundColor:
      'color-mix(in srgb, var(--color-accent) 12%, transparent)',
    borderRadius: 3,
  },
  // Presence chips: hand-rolled 40px buttons ringing an Avatar with the
  // collaborator color; aria-pressed carries the Follow state.
  presenceChip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    padding: 0,
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  presenceRing: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: '50%',
  },
  transportRow: {flexWrap: 'wrap', rowGap: 8},
  transportTapTarget: {width: 40, height: 40},
  scrubItem: {minWidth: 200},
  tickCounter: {whiteSpace: 'nowrap'},
  panelScroll: {height: '100%', overflowY: 'auto'},
  eventDot: {width: 10, height: 10, borderRadius: '50%', flexShrink: 0},
  toastWrap: {
    position: 'fixed',
    bottom: 'var(--spacing-5)',
    right: 'var(--spacing-5)',
    width: 360,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    zIndex: 60,
  },
};

/**
 * Pop-in for freshly replayed objects and the conflict flash. Both are
 * applied inline ONLY when prefers-reduced-motion is not set (JS-gated via
 * useMediaQuery), so reduced-motion gets instant placement and a static
 * error ring instead.
 */
const KEYFRAME_CSS = \`
@keyframes mwr-pop {
  from { transform: scale(0.9); opacity: 0.3; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes mwr-conflict {
  0%, 100% { box-shadow: 0 0 0 2px var(--color-error); }
  50% {
    box-shadow: 0 0 0 8px color-mix(in srgb, var(--color-error) 40%, transparent);
  }
}
\`;

// ============= COLLABORATOR FIXTURES =============
// Identity colors are explicit light-dark() pairs: saturated for light
// surfaces, lifted pastels for dark, so presence stays legible both ways.

type ActorId = 'you' | 'ana' | 'luis' | 'mira' | 'tom';

interface Collaborator {
  id: ActorId;
  name: string;
  short: string;
  color: string;
}

const COLLABORATORS: Collaborator[] = [
  {id: 'you', name: 'You', short: 'You', color: 'var(--color-accent)'},
  {
    id: 'ana',
    name: 'Ana Flores',
    short: 'Ana',
    color: 'light-dark(#7C3AED, #C4B5FD)',
  },
  {
    id: 'luis',
    name: 'Luis Ortega',
    short: 'Luis',
    color: 'light-dark(#0F766E, #5EEAD4)',
  },
  {
    id: 'mira',
    name: 'Mira Chen',
    short: 'Mira',
    color: 'light-dark(#B45309, #FBBF24)',
  },
  {
    id: 'tom',
    name: 'Tom Novak',
    short: 'Tom',
    color: 'light-dark(#BE185D, #F9A8D4)',
  },
];

const COLLAB: Record<ActorId, Collaborator> = Object.fromEntries(
  COLLABORATORS.map(collaborator => [collaborator.id, collaborator]),
) as Record<ActorId, Collaborator>;

/** Remote actors — the four cursors that glide over the board. */
const REMOTE_ACTORS: ActorId[] = ['ana', 'luis', 'mira', 'tom'];

/** Cursor-tag text sits on the saturated identity color in both schemes. */
const TAG_TEXT = 'light-dark(#FFFFFF, #16181D)';

/**
 * Cursor keyframes per remote actor: [tick, x, y] in board units, sorted by
 * tick and spanning the whole replay. Positions between keyframes are
 * linearly interpolated per tick, so cursors hover over the objects they
 * create at the moment the event lands.
 */
const CURSOR_PATHS: Record<ActorId, Array<[number, number, number]>> = {
  you: [],
  ana: [
    [0, 120, 170],
    [6, 1150, 170],
    [10, 1130, 220],
    [16, 150, 370],
    [20, 190, 400],
    [32, 300, 300],
    [42, 150, 370],
    [48, 210, 410],
    [58, 260, 520],
    [66, 140, 510],
    [74, 260, 560],
    [88, 165, 830],
    [96, 190, 810],
    [106, 320, 700],
    [120, 360, 640],
  ],
  luis: [
    [0, 700, 300],
    [4, 610, 150],
    [12, 700, 260],
    [22, 650, 360],
    [28, 680, 390],
    [40, 720, 300],
    [50, 660, 370],
    [54, 845, 635],
    [64, 760, 700],
    [84, 630, 645],
    [88, 1175, 375],
    [100, 900, 500],
    [120, 760, 420],
  ],
  mira: [
    [0, 900, 900],
    [16, 760, 560],
    [28, 655, 500],
    [34, 700, 530],
    [48, 800, 760],
    [58, 680, 800],
    [64, 672, 822],
    [68, 660, 240],
    [74, 625, 635],
    [80, 640, 660],
    [96, 1000, 560],
    [102, 1170, 500],
    [106, 1180, 520],
    [112, 1160, 560],
    [120, 1100, 620],
  ],
  tom: [
    [0, 1300, 500],
    [20, 1250, 300],
    [36, 1170, 230],
    [42, 1200, 260],
    [54, 700, 540],
    [58, 1180, 240],
    [70, 1240, 400],
    [78, 1175, 365],
    [84, 1195, 385],
    [100, 1210, 520],
    [108, 1180, 380],
    [112, 1190, 820],
    [120, 1260, 760],
  ],
};

/** Pure per-tick cursor position: lerp between surrounding keyframes. */
function cursorAt(actor: ActorId, tick: number): {x: number; y: number} {
  const path = CURSOR_PATHS[actor];
  if (path.length === 0) {
    return {x: 0, y: 0};
  }
  if (tick <= path[0][0]) {
    return {x: path[0][1], y: path[0][2]};
  }
  for (let i = 1; i < path.length; i++) {
    const [t1, x1, y1] = path[i];
    if (tick <= t1) {
      const [t0, x0, y0] = path[i - 1];
      const f = t1 === t0 ? 1 : (tick - t0) / (t1 - t0);
      return {x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f};
    }
  }
  const last = path[path.length - 1];
  return {x: last[1], y: last[2]};
}

// ============= EVENT LOG FIXTURE =============
// The single source of truth: board state at tick T is the fold of every
// event with event.tick <= T, in order. Nothing else mutates the board.

type BoardEvent =
  | {
      tick: number;
      actor: ActorId;
      kind: 'frame-add';
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
      label: string;
    }
  | {
      tick: number;
      actor: ActorId;
      kind: 'note-add';
      id: string;
      x: number;
      y: number;
      text: string;
    }
  | {tick: number; actor: ActorId; kind: 'note-move'; id: string; x: number; y: number}
  | {tick: number; actor: ActorId; kind: 'note-text'; id: string; text: string}
  | {
      tick: number;
      actor: ActorId;
      kind: 'connector-add';
      id: string;
      from: string;
      to: string;
    }
  | {
      tick: number;
      actor: ActorId;
      kind: 'comment-add';
      id: string;
      x: number;
      y: number;
      text: string;
    }
  | {tick: number; actor: ActorId; kind: 'select'; id: string}
  | {tick: number; actor: ActorId; kind: 'deselect'};

const EVENTS: BoardEvent[] = [
  {tick: 0, actor: 'ana', kind: 'frame-add', id: 'f-well', x: 80, y: 140, w: 440, h: 640, label: 'Went well'},
  {tick: 0, actor: 'you', kind: 'note-add', id: 'n-y1', x: 120, y: 210, text: 'Pairing sessions kept us unblocked'},
  {tick: 2, actor: 'you', kind: 'note-add', id: 'n-y2', x: 640, y: 210, text: 'Runbook docs are stale again'},
  {tick: 4, actor: 'luis', kind: 'frame-add', id: 'f-work', x: 600, y: 140, w: 440, h: 640, label: 'Needs work'},
  {tick: 8, actor: 'ana', kind: 'frame-add', id: 'f-act', x: 1120, y: 140, w: 400, h: 640, label: 'Action items'},
  {tick: 18, actor: 'ana', kind: 'note-add', id: 'n-a1', x: 120, y: 350, text: 'Launch shipped on time'},
  {tick: 24, actor: 'luis', kind: 'note-add', id: 'n-l1', x: 640, y: 350, text: 'Standups ran 25 minutes long'},
  {tick: 30, actor: 'mira', kind: 'note-add', id: 'n-m1', x: 640, y: 490, text: 'Flaky CI on the mobile lane'},
  {tick: 38, actor: 'tom', kind: 'note-add', id: 'n-t1', x: 1160, y: 210, text: 'Adopt a merge queue'},
  {tick: 44, actor: 'ana', kind: 'select', id: 'n-a1'},
  {tick: 46, actor: 'ana', kind: 'note-text', id: 'n-a1', text: 'Launch shipped two days early'},
  {tick: 50, actor: 'ana', kind: 'deselect'},
  {tick: 50, actor: 'luis', kind: 'select', id: 'n-l1'},
  {tick: 52, actor: 'luis', kind: 'note-move', id: 'n-l1', x: 830, y: 620},
  {tick: 56, actor: 'luis', kind: 'deselect'},
  {tick: 56, actor: 'tom', kind: 'select', id: 'n-t1'},
  {tick: 58, actor: 'tom', kind: 'connector-add', id: 'c1', from: 'n-m1', to: 'n-t1'},
  {tick: 60, actor: 'tom', kind: 'deselect'},
  {tick: 62, actor: 'mira', kind: 'comment-add', id: 'cm1', x: 660, y: 815, text: 'Can we get the CI owners into this retro?'},
  {tick: 68, actor: 'ana', kind: 'note-add', id: 'n-a2', x: 120, y: 490, text: 'Design reviews were tight and fast'},
  {tick: 70, actor: 'mira', kind: 'select', id: 'n-y2'},
  {tick: 74, actor: 'mira', kind: 'note-move', id: 'n-y2', x: 610, y: 620},
  {tick: 78, actor: 'mira', kind: 'deselect'},
  {tick: 80, actor: 'tom', kind: 'note-add', id: 'n-t2', x: 1160, y: 350, text: 'Write the retro doc by Friday'},
  {tick: 86, actor: 'luis', kind: 'connector-add', id: 'c2', from: 'n-y2', to: 'n-t2'},
  {tick: 92, actor: 'ana', kind: 'comment-add', id: 'cm2', x: 150, y: 815, text: 'Love this — keep the pairing rotation'},
  {tick: 104, actor: 'mira', kind: 'note-add', id: 'n-m2', x: 1160, y: 490, text: 'Rotate the retro facilitator'},
  {tick: 106, actor: 'mira', kind: 'select', id: 'n-m2'},
  {tick: 108, actor: 'tom', kind: 'connector-add', id: 'c3', from: 'n-m2', to: 'n-t2'},
  {tick: 110, actor: 'mira', kind: 'deselect'},
  {tick: 112, actor: 'tom', kind: 'comment-add', id: 'cm3', x: 1180, y: 815, text: "I'll own the merge-queue rollout"},
];

const BOARD_TITLE = 'Q2 retro — Delivery squad';

/** Owner of every note, straight from its note-add event. */
const NOTE_OWNER: Record<string, ActorId> = Object.fromEntries(
  EVENTS.flatMap(event =>
    event.kind === 'note-add' ? [[event.id, event.actor]] : [],
  ),
);

// ============= PURE BOARD DERIVATION =============

interface NoteState {
  id: string;
  owner: ActorId;
  x: number;
  y: number;
  text: string;
  /** Tick the note appeared — keys the pop-in when the replay crosses it. */
  addedAt: number;
}

interface FrameState {
  id: string;
  owner: ActorId;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

interface ConnectorState {
  id: string;
  owner: ActorId;
  from: string;
  to: string;
}

interface CommentState {
  id: string;
  owner: ActorId;
  x: number;
  y: number;
  text: string;
}

interface BoardState {
  frames: FrameState[];
  notes: NoteState[];
  connectors: ConnectorState[];
  comments: CommentState[];
  /** Remote selection halos: actor -> selected object id. */
  selections: Partial<Record<ActorId, string>>;
  /** Count of events applied so far (event-log highlight). */
  appliedCount: number;
}

/**
 * The whole point: board state is a pure fold of the fixture up to \`tick\`.
 * No mutation survives outside this function, so any scrub — forward or
 * backward — lands on exactly the recorded board.
 */
function buildBoard(tick: number): BoardState {
  const frames: FrameState[] = [];
  const notes = new Map<string, NoteState>();
  const connectors: ConnectorState[] = [];
  const comments: CommentState[] = [];
  const selections: Partial<Record<ActorId, string>> = {};
  let appliedCount = 0;

  for (const event of EVENTS) {
    if (event.tick > tick) {
      break;
    }
    appliedCount += 1;
    switch (event.kind) {
      case 'frame-add':
        frames.push({
          id: event.id,
          owner: event.actor,
          x: event.x,
          y: event.y,
          w: event.w,
          h: event.h,
          label: event.label,
        });
        break;
      case 'note-add':
        notes.set(event.id, {
          id: event.id,
          owner: event.actor,
          x: event.x,
          y: event.y,
          text: event.text,
          addedAt: event.tick,
        });
        break;
      case 'note-move': {
        const note = notes.get(event.id);
        if (note != null) {
          notes.set(event.id, {...note, x: event.x, y: event.y});
        }
        break;
      }
      case 'note-text': {
        const note = notes.get(event.id);
        if (note != null) {
          notes.set(event.id, {...note, text: event.text});
        }
        break;
      }
      case 'connector-add':
        connectors.push({
          id: event.id,
          owner: event.actor,
          from: event.from,
          to: event.to,
        });
        break;
      case 'comment-add':
        comments.push({
          id: event.id,
          owner: event.actor,
          x: event.x,
          y: event.y,
          text: event.text,
        });
        break;
      case 'select':
        selections[event.actor] = event.id;
        break;
      case 'deselect':
        delete selections[event.actor];
        break;
    }
  }

  return {
    frames,
    notes: Array.from(notes.values()),
    connectors,
    comments,
    selections,
    appliedCount,
  };
}

// ============= EVENT-LOG ROWS =============

const EVENT_VERB: Partial<Record<BoardEvent['kind'], string>> = {
  'frame-add': 'added a frame',
  'note-add': 'added a sticky note',
  'note-move': 'moved a note',
  'note-text': 'edited a note',
  'connector-add': 'drew a connector',
  'comment-add': 'left a comment',
};

const EVENT_ICON: Partial<Record<BoardEvent['kind'], typeof StickyNoteIcon>> = {
  'frame-add': SquareDashedIcon,
  'note-add': StickyNoteIcon,
  'note-move': MoveIcon,
  'note-text': PenLineIcon,
  'connector-add': SplineIcon,
  'comment-add': MessageSquareIcon,
};

interface LogRow {
  key: string;
  tick: number;
  actor: ActorId;
  verb: string;
  detail: string;
  icon: typeof StickyNoteIcon;
  /** Index into EVENTS — used to highlight the latest applied row. */
  eventIndex: number;
}

/** Visible log rows: creation/edit beats only (select/deselect are halos). */
const LOG_ROWS: LogRow[] = EVENTS.flatMap((event, eventIndex) => {
  const verb = EVENT_VERB[event.kind];
  const icon = EVENT_ICON[event.kind];
  if (verb == null || icon == null) {
    return [];
  }
  let detail = '';
  if (event.kind === 'frame-add') {
    detail = \`"\${event.label}"\`;
  } else if (event.kind === 'note-add' || event.kind === 'note-text') {
    detail = \`"\${event.text}"\`;
  } else if (event.kind === 'note-move') {
    const owner = NOTE_OWNER[event.id];
    detail =
      owner === 'you' ? 'your note — the conflict beat' : \`\${COLLAB[owner].short}'s note\`;
  } else if (event.kind === 'connector-add') {
    detail = 'between two notes';
  } else if (event.kind === 'comment-add') {
    detail = \`"\${event.text}"\`;
  }
  return [
    {
      key: \`\${event.kind}-\${eventIndex}\`,
      tick: event.tick,
      actor: event.actor,
      verb,
      detail,
      icon,
      eventIndex,
    },
  ];
});

// ============= SMALL HELPERS =============

interface Size {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

/** Observe an element's box so pan math can center on the real stage. */
function useElementSize(ref: RefObject<HTMLDivElement | null>): Size {
  const [size, setSize] = useState<Size>({width: 0, height: 0});
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setSize({width: rect.width, height: rect.height});
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

/** Keep the board from panning fully off-stage (80px of it stays visible). */
function clampPan(pan: Point, zoom: number, stage: Size): Point {
  const margin = 80;
  const clampAxis = (value: number, stageSpan: number, boardSpan: number) => {
    const min = margin - boardSpan;
    const max = stageSpan - margin;
    if (min > max) {
      return (stageSpan - boardSpan) / 2;
    }
    return Math.min(max, Math.max(min, value));
  };
  return {
    x: clampAxis(pan.x, stage.width, BOARD_W * zoom),
    y: clampAxis(pan.y, stage.height, BOARD_H * zoom),
  };
}

/** Pan that centers \`actor\`'s cursor — the Follow-mode camera. */
function followPanFor(
  actor: ActorId,
  tick: number,
  zoom: number,
  stage: Size,
): Point {
  const cursor = cursorAt(actor, tick);
  return clampPan(
    {
      x: stage.width / 2 - cursor.x * zoom,
      y: stage.height / 2 - cursor.y * zoom,
    },
    zoom,
    stage,
  );
}

/** Note fill/border derive from the owner color via color-mix over tokens. */
function noteFill(owner: ActorId): string {
  return \`color-mix(in srgb, \${COLLAB[owner].color} 16%, var(--color-background-primary))\`;
}

function noteBorder(owner: ActorId): string {
  return \`color-mix(in srgb, \${COLLAB[owner].color} 45%, var(--color-border))\`;
}

// ============= BOARD PIECES =============

function CursorSprite({
  actor,
  tick,
  isReducedMotion,
}: {
  actor: ActorId;
  tick: number;
  isReducedMotion: boolean;
}) {
  const {x, y} = cursorAt(actor, tick);
  const collaborator = COLLAB[actor];
  return (
    <div
      style={{
        ...styles.cursor,
        transform: \`translate(\${x}px, \${y}px)\`,
        // Smooths the per-tick hop into a glide; reduced-motion steps.
        transition: isReducedMotion ? undefined : 'transform 180ms linear',
      }}
      aria-hidden="true">
      <svg width={20} height={20} viewBox="0 0 20 20">
        <path
          d="M2 1 L18 9 L10.5 11 L7 19 Z"
          fill={collaborator.color}
          stroke="var(--color-background-primary)"
          strokeWidth={1.2}
        />
      </svg>
      <div style={{...styles.cursorTag, backgroundColor: collaborator.color}}>
        <Text type="supporting" size="sm" weight="semibold" style={{color: TAG_TEXT}}>
          {collaborator.short}
        </Text>
      </div>
    </div>
  );
}

function BoardFrame({frame}: {frame: FrameState}) {
  return (
    <div
      style={{
        ...styles.frame,
        left: frame.x,
        top: frame.y,
        width: frame.w,
        height: frame.h,
      }}>
      <div style={styles.frameLabel}>
        <Text type="supporting" size="sm" weight="semibold" color="secondary">
          {frame.label}
        </Text>
      </div>
    </div>
  );
}

function StickyNote({
  note,
  displayX,
  displayY,
  haloActor,
  isLocallySelected,
  isConflictFlash,
  isDragging,
  isReducedMotion,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
  onClick,
}: {
  note: NoteState;
  displayX: number;
  displayY: number;
  haloActor: ActorId | null;
  isLocallySelected: boolean;
  isConflictFlash: boolean;
  isDragging: boolean;
  isReducedMotion: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onClick: () => void;
}) {
  const isOwn = note.owner === 'you';
  const halo =
    haloActor != null
      ? \`0 0 0 2.5px \${COLLAB[haloActor].color}, 0 0 0 7px color-mix(in srgb, \${COLLAB[haloActor].color} 22%, transparent)\`
      : isLocallySelected
        ? '0 0 0 2px var(--color-accent), 0 0 0 6px color-mix(in srgb, var(--color-accent) 20%, transparent)'
        : undefined;

  const style: CSSProperties = {
    ...styles.note,
    ...(isOwn ? styles.noteOwn : undefined),
    ...(isDragging ? styles.noteDragging : undefined),
    left: displayX,
    top: displayY,
    backgroundColor: noteFill(note.owner),
    border: \`1.5px solid \${noteBorder(note.owner)}\`,
    ...(halo != null ? {boxShadow: halo} : undefined),
    // Pop-in when the replay crosses the add tick (mount = appearance);
    // conflict flash pulses an error ring. Both JS-gated for reduced motion.
    animation: isConflictFlash
      ? isReducedMotion
        ? undefined
        : 'mwr-conflict 800ms ease-in-out 2'
      : isReducedMotion
        ? undefined
        : 'mwr-pop 220ms ease-out',
    ...(isConflictFlash && isReducedMotion
      ? {boxShadow: '0 0 0 3px var(--color-error)'}
      : undefined),
  };

  return (
    <button
      type="button"
      data-board-object
      style={style}
      aria-label={
        isOwn
          ? \`Your note: \${note.text}. Drag or use arrow keys to move.\`
          : \`Note by \${COLLAB[note.owner].name}: \${note.text}\`
      }
      aria-pressed={isLocallySelected}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onClick={onClick}>
      <Text type="body" size="sm" maxLines={3}>
        {note.text}
      </Text>
      <span style={styles.noteOwnerRow}>
        <span
          style={{...styles.ownerDot, backgroundColor: COLLAB[note.owner].color}}
        />
        <Text type="supporting" size="sm" color="secondary">
          {COLLAB[note.owner].short}
        </Text>
      </span>
    </button>
  );
}

function CommentPin({
  comment,
  isOpen,
  onToggle,
}: {
  comment: CommentState;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const collaborator = COLLAB[comment.owner];
  return (
    <div
      style={{position: 'absolute', left: comment.x, top: comment.y, zIndex: 5}}>
      <button
        type="button"
        data-board-object
        style={styles.commentPin}
        aria-expanded={isOpen}
        aria-label={\`Comment by \${collaborator.name}: \${comment.text}\`}
        onClick={onToggle}>
        <span
          style={{...styles.commentDisc, backgroundColor: collaborator.color}}>
          <Text
            type="supporting"
            size="sm"
            weight="semibold"
            style={{color: TAG_TEXT}}>
            {collaborator.short.charAt(0)}
          </Text>
        </span>
      </button>
      {isOpen && (
        <div style={styles.commentBubble}>
          <VStack gap={1}>
            <Text type="supporting" size="sm" weight="semibold">
              {collaborator.name}
            </Text>
            <Text type="body" size="sm">
              {comment.text}
            </Text>
          </VStack>
        </div>
      )}
    </div>
  );
}

/** One SVG layer for connectors: gentle curves between live note centers. */
function ConnectorLayer({
  connectors,
  notePosition,
}: {
  connectors: ConnectorState[];
  notePosition: (id: string) => Point | null;
}) {
  return (
    <svg
      width={BOARD_W}
      height={BOARD_H}
      style={styles.connectorLayer}
      aria-hidden="true">
      {connectors.map(connector => {
        const from = notePosition(connector.from);
        const to = notePosition(connector.to);
        if (from == null || to == null) {
          return null;
        }
        const x1 = from.x + NOTE_W / 2;
        const y1 = from.y + NOTE_H / 2;
        const x2 = to.x + NOTE_W / 2;
        const y2 = to.y + NOTE_H / 2;
        const midX = (x1 + x2) / 2;
        const stroke = \`color-mix(in srgb, \${COLLAB[connector.owner].color} 70%, var(--color-border))\`;
        return (
          <g key={connector.id}>
            <path
              d={\`M \${x1} \${y1} C \${midX} \${y1}, \${midX} \${y2}, \${x2} \${y2}\`}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
            />
            <circle cx={x1} cy={y1} r={4} fill={stroke} />
            <circle cx={x2} cy={y2} r={4} fill={stroke} />
          </g>
        );
      })}
    </svg>
  );
}

/** Corner minimap: object footprints + the moving viewport rectangle. */
function Minimap({
  board,
  notePosition,
  pan,
  zoom,
  stage,
}: {
  board: BoardState;
  notePosition: (id: string) => Point | null;
  pan: Point;
  zoom: number;
  stage: Size;
}) {
  const viewX = Math.max(0, (-pan.x / zoom) * MINI_SCALE);
  const viewY = Math.max(0, (-pan.y / zoom) * MINI_SCALE);
  const viewW = Math.min(MINI_W - viewX, (stage.width / zoom) * MINI_SCALE);
  const viewH = Math.min(MINI_H - viewY, (stage.height / zoom) * MINI_SCALE);

  return (
    <div style={styles.minimap} aria-hidden="true">
      {board.frames.map(frame => (
        <div
          key={frame.id}
          style={{
            ...styles.minimapRect,
            left: frame.x * MINI_SCALE,
            top: frame.y * MINI_SCALE,
            width: frame.w * MINI_SCALE,
            height: frame.h * MINI_SCALE,
            border:
              '1px solid color-mix(in srgb, var(--color-border) 80%, var(--color-text-secondary))',
          }}
        />
      ))}
      {board.notes.map(note => {
        const position = notePosition(note.id);
        if (position == null) {
          return null;
        }
        return (
          <div
            key={note.id}
            style={{
              ...styles.minimapRect,
              left: position.x * MINI_SCALE,
              top: position.y * MINI_SCALE,
              width: NOTE_W * MINI_SCALE,
              height: NOTE_H * MINI_SCALE,
              backgroundColor: COLLAB[note.owner].color,
            }}
          />
        );
      })}
      {viewW > 0 && viewH > 0 && (
        <div
          style={{
            ...styles.minimapViewport,
            left: viewX,
            top: viewY,
            width: viewW,
            height: viewH,
          }}
        />
      )}
    </div>
  );
}

// ============= HEADER PRESENCE STACK =============

function PresenceStack({
  followId,
  onFollowToggle,
}: {
  followId: ActorId | null;
  onFollowToggle: (actor: ActorId) => void;
}) {
  return (
    <HStack gap={1} vAlign="center">
      {COLLABORATORS.map(collaborator => {
        const isYou = collaborator.id === 'you';
        const isFollowing = followId === collaborator.id;
        const chip = (
          <button
            key={collaborator.id}
            type="button"
            style={styles.presenceChip}
            aria-pressed={isYou ? undefined : isFollowing}
            aria-label={
              isYou
                ? 'You (local viewer)'
                : isFollowing
                  ? \`Stop following \${collaborator.name}\`
                  : \`Follow \${collaborator.name}\`
            }
            disabled={isYou}
            onClick={() => {
              if (!isYou) {
                onFollowToggle(collaborator.id);
              }
            }}>
            <span
              style={{
                ...styles.presenceRing,
                border: \`2px solid \${collaborator.color}\`,
                backgroundColor: isFollowing
                  ? \`color-mix(in srgb, \${collaborator.color} 25%, transparent)\`
                  : 'transparent',
              }}>
              <Avatar name={collaborator.name} size="small" />
            </span>
          </button>
        );
        return (
          <Tooltip
            key={collaborator.id}
            content={
              isYou
                ? 'You'
                : isFollowing
                  ? \`Following \${collaborator.short} — click to release\`
                  : \`Follow \${collaborator.short}\`
            }>
            {chip}
          </Tooltip>
        );
      })}
    </HStack>
  );
}

// ============= TRANSPORT =============

function TransportBar({
  tick,
  isPlaying,
  speed,
  isCompact,
  onTickChange,
  onStep,
  onRestart,
  onPlayToggle,
  onSpeedChange,
}: {
  tick: number;
  isPlaying: boolean;
  speed: number;
  isCompact: boolean;
  onTickChange: (tick: number) => void;
  onStep: (delta: number) => void;
  onRestart: () => void;
  onPlayToggle: () => void;
  onSpeedChange: (speed: number) => void;
}) {
  const atStart = tick <= 0;
  const atEnd = tick >= TOTAL_TICKS;
  const tapTarget = isCompact ? styles.transportTapTarget : undefined;

  return (
    <HStack gap={2} vAlign="center" style={styles.transportRow}>
      <IconButton
        label="Restart replay"
        tooltip="Restart"
        icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTarget}
        isDisabled={atStart}
        onClick={onRestart}
      />
      <IconButton
        label="Step back one tick"
        tooltip="Step back (J)"
        icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTarget}
        isDisabled={atStart}
        onClick={() => onStep(-1)}
      />
      <IconButton
        label={isPlaying ? 'Pause replay' : 'Play replay'}
        tooltip={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        icon={
          <Icon
            icon={isPlaying ? PauseIcon : PlayIcon}
            size="sm"
            color="inherit"
          />
        }
        variant="ghost"
        size="sm"
        style={tapTarget}
        isDisabled={atEnd && !isPlaying}
        onClick={onPlayToggle}
      />
      <IconButton
        label="Step forward one tick"
        tooltip="Step forward (K)"
        icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTarget}
        isDisabled={atEnd}
        onClick={() => onStep(1)}
      />
      <Text
        type="supporting"
        color="secondary"
        hasTabularNumbers
        style={styles.tickCounter}>
        t {tick} / {TOTAL_TICKS}
      </Text>
      <StackItem size="fill" style={styles.scrubItem}>
        <Slider
          label="Scrub replay tick"
          isLabelHidden
          min={0}
          max={TOTAL_TICKS}
          step={1}
          value={tick}
          onChange={onTickChange}
          valueDisplay="none"
        />
      </StackItem>
      <SegmentedControl
        label="Playback speed"
        value={String(speed)}
        onChange={value => onSpeedChange(Number(value))}>
        <SegmentedControlItem value="0.5" label="0.5x" />
        <SegmentedControlItem value="1" label="1x" />
        <SegmentedControlItem value="2" label="2x" />
      </SegmentedControl>
      {!isCompact && (
        <HStack gap={1} vAlign="center">
          <Kbd keys="space" />
          <Kbd keys="j" />
          <Kbd keys="k" />
        </HStack>
      )}
    </HStack>
  );
}

// ============= EVENT LOG PANEL =============

function EventLogPanel({
  appliedCount,
  onJump,
}: {
  appliedCount: number;
  onJump: (tick: number) => void;
}) {
  // The latest applied loggable row gets the highlight.
  let currentKey: string | null = null;
  for (const row of LOG_ROWS) {
    if (row.eventIndex < appliedCount) {
      currentKey = row.key;
    }
  }

  return (
    <div style={styles.panelScroll}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Event log</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {LOG_ROWS.length} beats
          </Text>
        </HStack>
        <Text type="supporting" color="secondary">
          Click a beat to jump the replay to that tick.
        </Text>
        <List density="compact" hasDividers>
          {LOG_ROWS.map(row => (
            <ListItem
              key={row.key}
              label={\`\${COLLAB[row.actor].short} \${row.verb}\`}
              description={row.detail}
              startContent={
                <HStack gap={2} vAlign="center">
                  <span
                    style={{
                      ...styles.eventDot,
                      backgroundColor: COLLAB[row.actor].color,
                    }}
                  />
                  <Icon icon={row.icon} size="sm" color="secondary" />
                </HStack>
              }
              endContent={
                <Badge label={\`t \${row.tick}\`} variant="neutral" />
              }
              onClick={() => onJump(row.tick)}
              isSelected={row.key === currentKey}
            />
          ))}
        </List>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function MultiplayerWhiteboardReplayTemplate() {
  // ---- replay transport (the only clock is this tick) ----
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // ---- camera ----
  const [zoom, setZoom] = useState(0.6);
  const [pan, setPan] = useState<Point>({x: 0, y: 0});
  const [followId, setFollowId] = useState<ActorId | null>(null);
  const [isPanningStage, setIsPanningStage] = useState(false);

  // ---- local touch layer (viewer's sandbox offsets on their own notes) ----
  const [noteOffsets, setNoteOffsets] = useState<Record<string, Point>>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{
    noteId: string;
    actor: ActorId;
  } | null>(null);
  const [flashNoteId, setFlashNoteId] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const stageSize = useElementSize(stageRef);
  const didFitRef = useRef(false);
  const panDragRef = useRef<{start: Point; base: Point} | null>(null);
  const noteDragRef = useRef<{
    noteId: string;
    start: Point;
    base: Point;
  } | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const noteOffsetsRef = useRef(noteOffsets);
  noteOffsetsRef.current = noteOffsets;
  const prevTickRef = useRef(tick);

  const isSinglePane = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ---- pure derivation: the board at this tick ----
  const board = useMemo(() => buildBoard(tick), [tick]);
  const notesById = useMemo(
    () => new Map(board.notes.map(note => [note.id, note])),
    [board],
  );

  /** Rendered position = replayed position + the viewer's local offset. */
  const notePosition = useCallback(
    (id: string): Point | null => {
      const note = notesById.get(id);
      if (note == null) {
        return null;
      }
      const offset = noteOffsets[id];
      return offset == null
        ? {x: note.x, y: note.y}
        : {x: note.x + offset.x, y: note.y + offset.y};
    },
    [notesById, noteOffsets],
  );

  /** Remote halo lookup: which collaborator has this object selected? */
  const haloFor = useCallback(
    (objectId: string): ActorId | null => {
      for (const actor of REMOTE_ACTORS) {
        if (board.selections[actor] === objectId) {
          return actor;
        }
      }
      return null;
    },
    [board.selections],
  );

  // ---- playback interval: advances the tick, nothing else ----
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = setInterval(
      () => setTick(prev => Math.min(TOTAL_TICKS, prev + 1)),
      Math.round(BASE_TICK_MS / speed),
    );
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  useEffect(() => {
    if (tick >= TOTAL_TICKS) {
      setIsPlaying(false);
    }
  }, [tick]);

  // ---- conflict: a replayed move lands on a note the viewer has moved ----
  useEffect(() => {
    const prev = prevTickRef.current;
    prevTickRef.current = tick;
    if (tick <= prev) {
      return;
    }
    for (const event of EVENTS) {
      if (
        event.kind === 'note-move' &&
        event.tick > prev &&
        event.tick <= tick &&
        NOTE_OWNER[event.id] === 'you' &&
        noteOffsetsRef.current[event.id] != null
      ) {
        // Remote wins: drop the local offset, cancel any live drag, flash.
        setNoteOffsets(current => {
          const next = {...current};
          delete next[event.id];
          return next;
        });
        if (noteDragRef.current?.noteId === event.id) {
          noteDragRef.current = null;
          setDraggingNoteId(null);
        }
        setConflict({noteId: event.id, actor: event.actor});
        setFlashNoteId(event.id);
      }
    }
  }, [tick]);

  // Flash ring clears itself after the pulse (UI timing, not content).
  useEffect(() => {
    if (flashNoteId == null) {
      return undefined;
    }
    const timer = setTimeout(() => setFlashNoteId(null), 1700);
    return () => clearTimeout(timer);
  }, [flashNoteId]);

  // ---- first measure: fit the board to the stage and center it ----
  useEffect(() => {
    if (didFitRef.current || stageSize.width === 0 || stageSize.height === 0) {
      return;
    }
    didFitRef.current = true;
    const fitted = Math.min(
      ZOOM_MAX,
      Math.max(
        ZOOM_MIN,
        Math.min(
          (stageSize.width - 48) / BOARD_W,
          (stageSize.height - 48) / BOARD_H,
        ),
      ),
    );
    const snapped = Math.max(ZOOM_MIN, Math.round(fitted / 0.05) * 0.05);
    setZoom(snapped);
    setPan({
      x: (stageSize.width - BOARD_W * snapped) / 2,
      y: (stageSize.height - BOARD_H * snapped) / 2,
    });
  }, [stageSize]);

  // ---- global transport keys (Space, J, K) ----
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input, textarea, select, [role="slider"], [contenteditable="true"]',
        ) != null
      ) {
        return;
      }
      if (event.key === ' ') {
        // Buttons already toggle on Space; only claim it on the background.
        if (target?.closest('button') != null) {
          return;
        }
        event.preventDefault();
        setIsPlaying(prev => (tick >= TOTAL_TICKS ? prev : !prev));
      } else if (event.key === 'j' || event.key === 'k') {
        setIsPlaying(false);
        setTick(prev =>
          Math.min(
            TOTAL_TICKS,
            Math.max(0, prev + (event.key === 'j' ? -1 : 1)),
          ),
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tick]);

  // ---- camera math ----
  const effectivePan =
    followId != null && !isPanningStage
      ? followPanFor(followId, tick, zoom, stageSize)
      : clampPan(pan, zoom, stageSize);

  const setZoomAroundCenter = (nextZoomRaw: number) => {
    const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, nextZoomRaw));
    if (nextZoom === zoom) {
      return;
    }
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    setPan(
      clampPan(
        {
          x: centerX - ((centerX - effectivePan.x) / zoom) * nextZoom,
          y: centerY - ((centerY - effectivePan.y) / zoom) * nextZoom,
        },
        nextZoom,
        stageSize,
      ),
    );
    setZoom(nextZoom);
  };

  // ---- background pan (pointer capture); releases Follow with no jump ----
  const handleStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('[data-board-object]') != null) {
      return;
    }
    // Seed manual pan from the current camera so Follow releases smoothly.
    setPan(effectivePan);
    setFollowId(null);
    setOpenCommentId(null);
    panDragRef.current = {
      start: {x: event.clientX, y: event.clientY},
      base: effectivePan,
    };
    setIsPanningStage(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleStagePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = panDragRef.current;
    if (drag == null) {
      return;
    }
    setPan(
      clampPan(
        {
          x: drag.base.x + (event.clientX - drag.start.x),
          y: drag.base.y + (event.clientY - drag.start.y),
        },
        zoom,
        stageSize,
      ),
    );
  };

  const handleStagePointerUp = () => {
    panDragRef.current = null;
    setIsPanningStage(false);
  };

  // ---- local note commits: ONE path for pointer drag and arrow keys ----
  const commitNoteOffset = useCallback((noteId: string, offset: Point) => {
    setNoteOffsets(current => ({...current, [noteId]: offset}));
  }, []);

  const handleNotePointerDown = (
    note: NoteState,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    setSelectedNoteId(note.id);
    if (note.owner !== 'you') {
      return;
    }
    const base = noteOffsets[note.id] ?? {x: 0, y: 0};
    noteDragRef.current = {
      noteId: note.id,
      start: {x: event.clientX, y: event.clientY},
      base,
    };
    setDraggingNoteId(note.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleNotePointerMove = (
    note: NoteState,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const drag = noteDragRef.current;
    if (drag == null || drag.noteId !== note.id) {
      return;
    }
    // Divide by zoom so the note tracks the pointer 1:1 at any scale.
    commitNoteOffset(note.id, {
      x: drag.base.x + (event.clientX - drag.start.x) / zoom,
      y: drag.base.y + (event.clientY - drag.start.y) / zoom,
    });
  };

  const handleNotePointerUp = () => {
    noteDragRef.current = null;
    setDraggingNoteId(null);
  };

  const handleNoteKeyDown = (
    note: NoteState,
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'Escape') {
      setSelectedNoteId(null);
      return;
    }
    if (note.owner !== 'you') {
      return;
    }
    const deltas: Record<string, Point> = {
      ArrowUp: {x: 0, y: -NUDGE_STEP},
      ArrowDown: {x: 0, y: NUDGE_STEP},
      ArrowLeft: {x: -NUDGE_STEP, y: 0},
      ArrowRight: {x: NUDGE_STEP, y: 0},
    };
    const delta = deltas[event.key];
    if (delta == null) {
      return;
    }
    event.preventDefault();
    const base = noteOffsets[note.id] ?? {x: 0, y: 0};
    // Identical commit path as pointer drag.
    commitNoteOffset(note.id, {x: base.x + delta.x, y: base.y + delta.y});
  };

  const handleJumpToTick = (nextTick: number) => {
    setIsPlaying(false);
    setTick(nextTick);
  };

  const followedName = followId != null ? COLLAB[followId].name : null;

  const boardTransition =
    isReducedMotion || isPanningStage
      ? undefined
      : followId != null
        ? 'transform 320ms ease-out'
        : undefined;

  // ---- stage ----
  const stage = (
    <div
      ref={stageRef}
      style={{
        ...styles.stage,
        ...(isPanningStage ? styles.stagePanning : undefined),
      }}
      onPointerDown={handleStagePointerDown}
      onPointerMove={handleStagePointerMove}
      onPointerUp={handleStagePointerUp}
      onPointerCancel={handleStagePointerUp}>
      <div
        style={{
          ...styles.board,
          transform: \`translate(\${effectivePan.x}px, \${effectivePan.y}px) scale(\${zoom})\`,
          transition: boardTransition,
        }}>
        <ConnectorLayer
          connectors={board.connectors}
          notePosition={notePosition}
        />
        {board.frames.map(frame => (
          <BoardFrame key={frame.id} frame={frame} />
        ))}
        {board.notes.map(note => {
          const position = notePosition(note.id);
          if (position == null) {
            return null;
          }
          return (
            <StickyNote
              key={\`\${note.id}-\${note.addedAt}\`}
              note={note}
              displayX={position.x}
              displayY={position.y}
              haloActor={haloFor(note.id)}
              isLocallySelected={selectedNoteId === note.id}
              isConflictFlash={flashNoteId === note.id}
              isDragging={draggingNoteId === note.id}
              isReducedMotion={isReducedMotion}
              onPointerDown={event => handleNotePointerDown(note, event)}
              onPointerMove={event => handleNotePointerMove(note, event)}
              onPointerUp={handleNotePointerUp}
              onKeyDown={event => handleNoteKeyDown(note, event)}
              onClick={() => setSelectedNoteId(note.id)}
            />
          );
        })}
        {board.comments.map(comment => (
          <CommentPin
            key={comment.id}
            comment={comment}
            isOpen={openCommentId === comment.id}
            onToggle={() =>
              setOpenCommentId(prev =>
                prev === comment.id ? null : comment.id,
              )
            }
          />
        ))}
        {REMOTE_ACTORS.map(actor => (
          <CursorSprite
            key={actor}
            actor={actor}
            tick={tick}
            isReducedMotion={isReducedMotion}
          />
        ))}
      </div>

      {/* Floating zoom controls: 40px targets at every width. */}
      <div style={styles.zoomOverlay}>
        <IconButton
          label="Zoom in"
          tooltip="Zoom in"
          icon={<Icon icon={ZoomInIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={styles.zoomButton}
          isDisabled={zoom >= ZOOM_MAX}
          onClick={() => setZoomAroundCenter(zoom + ZOOM_STEP)}
        />
        <IconButton
          label="Zoom out"
          tooltip="Zoom out"
          icon={<Icon icon={ZoomOutIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={styles.zoomButton}
          isDisabled={zoom <= ZOOM_MIN}
          onClick={() => setZoomAroundCenter(zoom - ZOOM_STEP)}
        />
      </div>

      <Minimap
        board={board}
        notePosition={notePosition}
        pan={effectivePan}
        zoom={zoom}
        stage={stageSize}
      />
    </div>
  );

  return (
    <>
      <style>{KEYFRAME_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Icon icon={MousePointer2Icon} size="sm" color="secondary" />
                  <Heading level={1}>{BOARD_TITLE}</Heading>
                  <Badge label="Replay" variant="info" />
                  {!isCompact && (
                    <Text type="supporting" color="secondary">
                      {followedName != null
                        ? \`Following \${followedName}\`
                        : '4 collaborators recorded'}
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <PresenceStack
                followId={followId}
                onFollowToggle={actor =>
                  setFollowId(prev => (prev === actor ? null : actor))
                }
              />
            </HStack>
          </LayoutHeader>
        }
        end={
          isSinglePane ? undefined : (
            <LayoutPanel width={312} label="Board event log">
              <EventLogPanel
                appliedCount={board.appliedCount}
                onJump={handleJumpToTick}
              />
            </LayoutPanel>
          )
        }
        content={<LayoutContent padding={0}>{stage}</LayoutContent>}
        footer={
          <LayoutFooter hasDivider>
            <TransportBar
              tick={tick}
              isPlaying={isPlaying}
              speed={speed}
              isCompact={isCompact}
              onTickChange={handleJumpToTick}
              onStep={delta => {
                setIsPlaying(false);
                setTick(prev =>
                  Math.min(TOTAL_TICKS, Math.max(0, prev + delta)),
                );
              }}
              onRestart={() => handleJumpToTick(0)}
              onPlayToggle={() => setIsPlaying(prev => !prev)}
              onSpeedChange={setSpeed}
            />
          </LayoutFooter>
        }
      />

      {/* Who-wins toast for the tick-74 conflict beat. */}
      {conflict != null && (
        <div style={styles.toastWrap}>
          <Toast
            type="info"
            isAutoHide={false}
            autoHideDuration={8000}
            onDismiss={() => setConflict(null)}
            body={
              <VStack gap={1}>
                <Text weight="semibold">
                  {COLLAB[conflict.actor].name}&apos;s edit won
                </Text>
                <Text type="supporting" color="secondary">
                  The replayed move landed on a note you had moved locally —
                  your offset was discarded so the board matches the
                  recording. You can drag it again from its replayed spot.
                </Text>
              </VStack>
            }
          />
        </div>
      )}
    </>
  );
}
`;export{e as default};