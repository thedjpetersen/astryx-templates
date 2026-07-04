// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one live Kestrel Labs brainstorm board —
 *   "Beta Feedback Themes · brainstorm" for the Atlas Q3 program, suite "now"
 *   anchor Wed Jul 15, 2026: three color-coded theme clusters holding 14
 *   sticky notes with owners drawn from the Atlas roster, one cluster-to-
 *   cluster connector arrow, one canvas annotation, one comment thread pinned
 *   to a pricing sticky, and two live collaborator cursors — Sofia Ortiz
 *   mid-edit on a performance sticky, Jonah Fields hovering the pricing
 *   cluster. All positions, texts, and timestamps are fixed strings; no
 *   clocks, randomness, or network assets)
 * @output LIVE infinite-canvas brainstorm whiteboard: a LayoutHeader with the
 *   board title, a Live StatusDot, contributor facepile (AvatarGroup + "+2"
 *   overflow) and a Share button that raises a link-copied Toast; a pannable /
 *   zoomable dotted stage of labeled cluster frames (per-cluster tallies that
 *   reconcile with the stickies inside), tinted sticky notes, an SVG connector
 *   layer with an arrowhead arc between two clusters, name-flagged remote
 *   cursors, a focus-ringed mid-edit sticky with a blinking caret and a
 *   "Sofia is editing" flag, and a comment pin whose open thread popover takes
 *   replies; a floating left toolbar rail (select / sticky / text / connector /
 *   frame tools, V-S-T-C-F keys) where every tool actually edits the canvas —
 *   sticky/text/frame click-to-place in your color, connector links two picked
 *   stickies; floating zoom controls with a % readout and fit-to-board, and a
 *   corner minimap mirroring the camera as a viewport rectangle. First-person
 *   and present-tense throughout: no transport, no scrubber, no tick-derived
 *   state — the opposite end of the wire from multiplayer-whiteboard-replay
 * @position Page template; emitted by `astryx template brainstorm-whiteboard`
 *
 * Frame: root 100dvh div > Layout height="fill". LayoutHeader carries the
 * board identity row (icon + title + Live dot + session caption) and the
 * collaboration cluster (online count, facepile, Share). LayoutContent
 * (padding 0) is the stage: an overflow-hidden viewport holding one
 * transformed 1720x1080 board surface (SVG connector layer under absolutely
 * positioned frames, stickies, annotation labels, comment pin, cursors), plus
 * the floating toolbar rail (left), zoom pill (bottom end) and minimap
 * (bottom start). No side panels, no footer — the canvas owns the page.
 *
 * Container policy (spatial-canvas archetype): page chrome is frame-first;
 * board objects are hand-rolled absolutely positioned divs (stickies are
 * plain <button>s so each is one focusable, draggable tap target) over
 * exactly one SVG layer for connectors. No Cards anywhere.
 *
 * Interaction contract:
 * - Camera: background drag pans with pointer capture; zoom buttons step
 *   0.4-1.6x around the stage center; Fit re-centers the whole board; the
 *   minimap viewport rectangle tracks every camera change.
 * - Tools (V/S/T/C/F or the rail): select clicks/focuses stickies (accent
 *   halo) and arrow-keys nudge the selection; sticky/text/frame place a new
 *   object at the click point in your color; connector links two picked
 *   stickies through a two-step flow with a live hint chip. Escape cancels
 *   the pending connector pick or clears the selection. Every mutation is
 *   announced through a visually hidden aria-live region.
 * - Stickies drag with pointer capture (deltas divided by zoom so grabs stay
 *   1:1 at any scale) only on '(hover: hover) and (pointer: fine)' devices;
 *   the identical commit path is driven by arrow keys when a sticky has
 *   focus, so coarse-pointer and keyboard users get the same move.
 * - The comment pin toggles its thread popover (open on load); replies
 *   append to the thread and bump the visible count.
 * - Cluster tallies are derived from live sticky state, so placing a new
 *   sticky inside a cluster frame updates that frame's count chip.
 *
 * Responsive contract:
 * - >1024px: full header caption, facepile + "+2" overflow, labeled Share
 *   button, toolbar rail, zoom pill with % readout, minimap.
 * - <=1024px: header caption drops; everything else holds.
 * - <=640px: facepile collapses to a "6 people" Token, Share becomes an
 *   icon-only 40px button, the minimap and tool hint chip hide, and rail /
 *   zoom targets stay >=40px. No hover-only affordances at any width.
 * - The stage is the page's one deliberate pan surface: the board moves by
 *   pointer drag with capture, never by page scroll, so 375px keeps the
 *   chrome fixed while the canvas pans beneath it.
 *
 * Color policy: token-pure. One accent (the viewer's own identity). Cluster
 * theme colors ride the data-categorical tokens with repo-standard
 * light-dark() fallbacks; collaborator identity colors and cursor-flag text
 * are explicit light-dark() pairs audited in dark mode. No raw hex outside
 * light-dark().
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
  FrameIcon,
  MaximizeIcon,
  MessageSquareIcon,
  MousePointer2Icon,
  PenLineIcon,
  SendIcon,
  Share2Icon,
  SplineIcon,
  StickyNoteIcon,
  TypeIcon,
  ZoomInIcon,
  ZoomOutIcon,
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
import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= BOARD GEOMETRY =============

/** Virtual board units — every fixture coordinate lives on this plane. */
const BOARD_W = 1720;
const BOARD_H = 1080;
const NOTE_W = 190;
const NOTE_H = 104;

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 0.2;

/** Minimap: 0.09 scale of the board → ~155 x 97. */
const MINI_SCALE = 0.09;
const MINI_W = Math.round(BOARD_W * MINI_SCALE);
const MINI_H = Math.round(BOARD_H * MINI_SCALE);

/** Arrow-key nudge, in board units — same commit path as pointer drag. */
const NUDGE_STEP = 12;

/** New objects placed by the text / frame tools. */
const NEW_FRAME_W = 420;
const NEW_FRAME_H = 300;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  // Stage: overflow-hidden viewport; the board pans under it via transform.
  stage: {position: 'relative', height: '100%', overflow: 'hidden', backgroundColor: 'var(--color-background-muted)', cursor: 'grab', touchAction: 'none'},
  stagePanning: {cursor: 'grabbing', userSelect: 'none'},
  stagePlacing: {cursor: 'crosshair'},
  // Board surface: fixed virtual size, transformed from the top-left corner
  // so pan/zoom math stays plain multiply-and-add. Dotted grid via one
  // radial-gradient over the border token.
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
  connectorLayer: {position: 'absolute', inset: 0, pointerEvents: 'none'},
  // Cluster frames: tinted wash + border from the cluster's theme color.
  cluster: {position: 'absolute', borderRadius: 12},
  clusterLabel: {position: 'absolute', top: -30, left: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '3px 10px', borderRadius: 8, whiteSpace: 'nowrap'},
  clusterCount: {minWidth: 20, padding: '0 6px', borderRadius: 999, textAlign: 'center'},
  // Stickies are plain buttons: one focusable, draggable tap target each.
  // Fill and border tint from the containing cluster's theme color.
  note: {
    position: 'absolute',
    width: NOTE_W,
    minHeight: NOTE_H,
    boxSizing: 'border-box',
    display: 'block',
    padding: '10px 12px 30px',
    borderRadius: 8,
    font: 'inherit',
    textAlign: 'start',
    color: 'var(--color-text-primary)',
    boxShadow:
      '0 2px 6px color-mix(in srgb, var(--color-text-primary) 16%, transparent)',
    cursor: 'grab',
  },
  noteDragging: {cursor: 'grabbing'},
  noteOwnerRow: {position: 'absolute', left: 12, bottom: 8, display: 'flex', alignItems: 'center', gap: 6},
  ownerDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  // Mid-edit dressing: flag above the sticky + a caret bar after the text.
  editFlag: {position: 'absolute', top: -24, left: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap'},
  caret: {display: 'inline-block', width: 2, height: 14, marginLeft: 2, verticalAlign: 'text-bottom'},
  // Canvas annotations placed by the text tool (plus one fixture label).
  annotation: {position: 'absolute', maxWidth: 640, padding: '2px 4px', borderRadius: 4},
  // Live cursors: pointer-transparent sprites gliding over everything.
  cursor: {position: 'absolute', top: 0, left: 0, zIndex: 30, pointerEvents: 'none'},
  cursorFlag: {marginLeft: 12, marginTop: -4, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap', width: 'fit-content'},
  // Connector label chip riding the cluster-to-cluster arc.
  connectorLabel: {position: 'absolute', transform: 'translate(-50%, -50%)', padding: '3px 10px', borderRadius: 999, border: 'var(--border-width) solid var(--color-border)', backgroundColor: 'var(--color-background-surface)', whiteSpace: 'nowrap', zIndex: 4},
  // Comment pin: 28px disc with a 40px transparent hit pad around it.
  commentPin: {position: 'absolute', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', zIndex: 8},
  commentDisc: {width: 28, height: 28, borderRadius: '50% 50% 50% 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px color-mix(in srgb, var(--color-text-primary) 25%, transparent)'},
  commentPopover: {
    position: 'absolute',
    top: 0,
    left: 44,
    width: 288,
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    boxShadow: 'var(--shadow-high)',
    textAlign: 'start',
    zIndex: 20,
    cursor: 'default',
  },
  // Floating chrome over the stage.
  toolRail: {
    position: 'absolute',
    top: '50%',
    left: 'var(--spacing-3)',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 6,
    borderRadius: 12,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'color-mix(in srgb, var(--color-background-surface) 92%, transparent)',
    boxShadow: 'var(--shadow-high)',
    zIndex: 40,
  },
  toolButton: {width: 40, height: 40},
  toolHint: {position: 'absolute', top: 'var(--spacing-3)', left: '50%', transform: 'translateX(-50%)', padding: '5px 12px', borderRadius: 999, border: 'var(--border-width) solid var(--color-border)', backgroundColor: 'color-mix(in srgb, var(--color-background-surface) 94%, transparent)', boxShadow: 'var(--shadow-high)', whiteSpace: 'nowrap', zIndex: 40},
  zoomBar: {position: 'absolute', right: 'var(--spacing-3)', bottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', gap: 2, padding: 4, borderRadius: 10, border: 'var(--border-width) solid var(--color-border)', backgroundColor: 'color-mix(in srgb, var(--color-background-surface) 92%, transparent)', boxShadow: 'var(--shadow-high)', zIndex: 40},
  zoomButton: {width: 40, height: 40},
  zoomReadout: {minWidth: 44, textAlign: 'center'},
  minimap: {
    position: 'absolute',
    left: 'var(--spacing-3)',
    bottom: 'var(--spacing-3)',
    width: MINI_W,
    height: MINI_H,
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'color-mix(in srgb, var(--color-background-surface) 88%, transparent)',
    overflow: 'hidden',
    zIndex: 40,
    pointerEvents: 'none',
  },
  minimapRect: {position: 'absolute', borderRadius: 2},
  minimapViewport: {position: 'absolute', border: '1.5px solid var(--color-accent)', backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', borderRadius: 3},
  headerRow: {flexWrap: 'wrap', rowGap: 8},
  toastWrap: {position: 'fixed', bottom: 'var(--spacing-5)', right: 'var(--spacing-5)', width: 360, maxWidth: 'calc(100vw - 2 * var(--spacing-5))', zIndex: 60},
  srOnly: {position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0},
};

/**
 * Caret blink for the mid-edit sticky and pop-in for freshly placed
 * objects. Both are applied inline ONLY when prefers-reduced-motion is not
 * set (JS-gated via useMediaQuery); reduced-motion gets a steady caret bar
 * and instant placement instead.
 */
const KEYFRAME_CSS = `
@keyframes bww-caret {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes bww-pop {
  from { transform: scale(0.92); opacity: 0.3; }
  to { transform: scale(1); opacity: 1; }
}
`;

// ============= KESTREL LABS FIXTURES =============
// One shared world: the Atlas Q3 program at Kestrel Labs, suite "now"
// anchor Wed Jul 15, 2026. Identity colors are explicit light-dark() pairs —
// saturated for light surfaces, lifted 300–400-weight hues for dark.

type MemberId = 'you' | 'sofia' | 'jonah' | 'marcus' | 'elena' | 'dana';

interface Member {
  id: MemberId;
  name: string;
  short: string;
  color: string;
}

const MEMBERS: Member[] = [
  {id: 'you', name: 'You', short: 'You', color: 'var(--color-accent)'},
  {id: 'sofia', name: 'Sofia Ortiz', short: 'Sofia', color: 'light-dark(#7C3AED, #C4B5FD)'},
  {id: 'jonah', name: 'Jonah Fields', short: 'Jonah', color: 'light-dark(#0F766E, #5EEAD4)'},
  {id: 'marcus', name: 'Marcus Webb', short: 'Marcus', color: 'light-dark(#B45309, #FBBF24)'},
  {id: 'elena', name: 'Elena Voss', short: 'Elena', color: 'light-dark(#BE185D, #F9A8D4)'},
  {id: 'dana', name: 'Dana Whitfield', short: 'Dana', color: 'light-dark(#0E7E8B, #67E8F9)'},
];

const MEMBER: Record<MemberId, Member> = Object.fromEntries(
  MEMBERS.map(member => [member.id, member]),
) as Record<MemberId, Member>;

/** Cursor-flag / pin-glyph text sits on saturated identity colors. */
const FLAG_TEXT = 'light-dark(#FFFFFF, #16181D)';

/** On the board right now: the viewer plus two live remote cursors. */
const ONLINE_IDS: MemberId[] = ['you', 'sofia', 'jonah'];

const BOARD_TITLE = 'Beta Feedback Themes — brainstorm';
const BOARD_CAPTION = 'Atlas Q3 · #atlas-q3 · Wed Jul 15';

// ---- theme clusters (data-categorical tokens with repo-standard fallbacks) ----

type ClusterId = 'onboarding' | 'performance' | 'pricing';

interface Cluster {
  id: ClusterId;
  label: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const CLUSTERS: Cluster[] = [
  {id: 'onboarding', label: 'Onboarding friction', color: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))', x: 90, y: 150, w: 480, h: 660},
  {id: 'performance', label: 'Performance & reliability', color: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))', x: 640, y: 150, w: 480, h: 660},
  {id: 'pricing', label: 'Pricing clarity', color: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))', x: 1190, y: 210, w: 440, h: 560},
];

const CLUSTER: Record<ClusterId, Cluster> = Object.fromEntries(
  CLUSTERS.map(cluster => [cluster.id, cluster]),
) as Record<ClusterId, Cluster>;

// ---- sticky notes (14 across the three clusters; texts run 1–3 lines) ----

interface Sticky {
  id: string;
  cluster: ClusterId | null;
  owner: MemberId;
  x: number;
  y: number;
  /** Gentle deterministic tilt, in degrees, for the hand-placed feel. */
  rotation: number;
  text: string;
}

const INITIAL_NOTES: Sticky[] = [
  // Onboarding friction — 5
  {id: 'n-ob1', cluster: 'onboarding', owner: 'sofia', x: 120, y: 230, rotation: -1.2, text: 'Workspace invite emails land in spam for Google-hosted domains'},
  {id: 'n-ob2', cluster: 'onboarding', owner: 'marcus', x: 344, y: 262, rotation: 0.9, text: 'First-run checklist stalls at the SSO step — 6 of 14 testers bounced there'},
  {id: 'n-ob3', cluster: 'onboarding', owner: 'you', x: 122, y: 392, rotation: 0.6, text: 'Sample project feels empty — seed richer demo data'},
  {id: 'n-ob4', cluster: 'onboarding', owner: 'sofia', x: 346, y: 428, rotation: -0.8, text: 'Testers skip the shortcut tour and never find quick-add'},
  {id: 'n-ob5', cluster: 'onboarding', owner: 'jonah', x: 216, y: 566, rotation: 1.1, text: 'Two testers asked for a sandbox mode before connecting real data'},
  // Performance & reliability — 5
  {id: 'n-pf1', cluster: 'performance', owner: 'marcus', x: 668, y: 236, rotation: 0.8, text: 'Canvas loads take >4s once a board passes 200 objects'},
  {id: 'n-pf2', cluster: 'performance', owner: 'sofia', x: 892, y: 268, rotation: -1, text: 'Search index lags ~10 min behind doc edits'},
  {id: 'n-pf3', cluster: 'performance', owner: 'you', x: 670, y: 398, rotation: -0.6, text: 'Mobile web drops the live socket on every network switch'},
  {id: 'n-pf4', cluster: 'performance', owner: 'jonah', x: 894, y: 432, rotation: 0.7, text: 'PDF export times out past 40 pages'},
  {id: 'n-pf5', cluster: 'performance', owner: 'marcus', x: 762, y: 572, rotation: -0.9, text: 'Presence cursors spike CPU when 5+ people join a board'},
  // Pricing clarity — 4
  {id: 'n-pr1', cluster: 'pricing', owner: 'jonah', x: 1222, y: 292, rotation: 1, text: "'Seats vs viewers' wording confuses trial admins"},
  {id: 'n-pr2', cluster: 'pricing', owner: 'elena', x: 1428, y: 326, rotation: -0.7, text: 'Usage-based tier keeps coming up — decide before the Jul 21 cohort expansion'},
  {id: 'n-pr3', cluster: 'pricing', owner: 'dana', x: 1226, y: 462, rotation: 0.8, text: 'Pricing page needs a beta-discount FAQ before the Jul 22 copy freeze'},
  {id: 'n-pr4', cluster: 'pricing', owner: 'you', x: 1244, y: 614, rotation: -1.1, text: 'Annual-plan calculator rounds oddly at 37 seats'},
];

// ---- live-session dressing: mid-edit sticky, cursors, thread, annotation ----

/** Sofia is mid-edit on this sticky: focus ring, caret, editing flag. */
const EDITING_NOTE_ID = 'n-pf2';
const EDITING_MEMBER_ID: MemberId = 'sofia';

/** The pricing sticky carrying the open comment thread. */
const COMMENT_NOTE_ID = 'n-pr1';

interface ThreadComment {
  id: string;
  author: MemberId;
  time: string;
  text: string;
}

const INITIAL_THREAD: ThreadComment[] = [
  {id: 'tc-1', author: 'jonah', time: '10:42 AM', text: 'Elena flagged the same wording in #atlas-q3 yesterday — third trial admin this week.'},
  {id: 'tc-2', author: 'dana', time: '10:48 AM', text: 'On it — folding a seats-vs-viewers FAQ into Pricing Page Copy before the Jul 22 freeze.'},
];

/** Two live remote cursors, parked where their owners are working. */
interface LiveCursor {
  member: MemberId;
  x: number;
  y: number;
  note: string;
}

const LIVE_CURSORS: LiveCursor[] = [
  {member: 'sofia', x: 986, y: 318, note: 'editing a performance sticky'},
  {member: 'jonah', x: 1268, y: 404, note: 'reading the pricing cluster'},
];

/** Canvas annotations: one fixture label; the text tool appends more. */
interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
}

const INITIAL_ANNOTATIONS: Annotation[] = [
  {id: 't-goal', x: 92, y: 84, text: "Session goal: rank the top themes to bring to Thursday's Launch Readiness Review"},
];

/**
 * The cluster-to-cluster arrow: onboarding drop-off shows up later as
 * pricing confusion, so the arc dips under the performance cluster from the
 * onboarding frame's bottom edge to the pricing frame's.
 */
const CLUSTER_ARROW = {
  from: {x: 330, y: 812},
  c1: {x: 330, y: 972},
  c2: {x: 1410, y: 956},
  to: {x: 1410, y: 774},
  label: {x: 872, y: 942, text: 'drop-off resurfaces as pricing questions'},
};

/** Note-to-note connectors: none at load; the connector tool adds them. */
interface NoteConnector {
  id: string;
  from: string;
  to: string;
}

// ============= SMALL HELPERS =============

interface Size {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

type ToolId = 'select' | 'sticky' | 'text' | 'connector' | 'frame';

/** Frames placed by the frame tool (fixture clusters live in CLUSTERS). */
interface PlacedFrame {
  id: string;
  x: number;
  y: number;
  label: string;
}

/** Observe an element's box so camera math can center on the real stage. */
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

/** Camera that shows the whole board, centered, snapped to 5% steps. */
function fitCamera(stage: Size): {zoom: number; pan: Point} {
  const fitted = Math.min(
    ZOOM_MAX,
    Math.max(
      ZOOM_MIN,
      Math.min((stage.width - 48) / BOARD_W, (stage.height - 48) / BOARD_H),
    ),
  );
  const zoom = Math.max(ZOOM_MIN, Math.round(fitted / 0.05) * 0.05);
  return {
    zoom,
    pan: {
      x: (stage.width - BOARD_W * zoom) / 2,
      y: (stage.height - BOARD_H * zoom) / 2,
    },
  };
}

/** Theme color for a sticky: its cluster's hue, or your accent off-cluster. */
function stickyColor(note: Sticky): string {
  return note.cluster != null ? CLUSTER[note.cluster].color : 'var(--color-accent)';
}

function stickyFill(note: Sticky): string {
  return `color-mix(in srgb, ${stickyColor(note)} 15%, var(--color-background-primary))`;
}

function stickyBorder(note: Sticky): string {
  return `color-mix(in srgb, ${stickyColor(note)} 45%, var(--color-border))`;
}

/** Which fixture cluster contains a board point (new-sticky placement). */
function clusterAt(point: Point): ClusterId | null {
  for (const cluster of CLUSTERS) {
    if (
      point.x >= cluster.x &&
      point.x <= cluster.x + cluster.w &&
      point.y >= cluster.y &&
      point.y <= cluster.y + cluster.h
    ) {
      return cluster.id;
    }
  }
  return null;
}

// ============= TOOLBAR RAIL =============

interface ToolSpec {
  id: ToolId;
  label: string;
  shortcut: string;
  icon: typeof MousePointer2Icon;
}

const TOOLS: ToolSpec[] = [
  {id: 'select', label: 'Select', shortcut: 'V', icon: MousePointer2Icon},
  {id: 'sticky', label: 'Sticky note', shortcut: 'S', icon: StickyNoteIcon},
  {id: 'text', label: 'Text label', shortcut: 'T', icon: TypeIcon},
  {id: 'connector', label: 'Connector', shortcut: 'C', icon: SplineIcon},
  {id: 'frame', label: 'Frame', shortcut: 'F', icon: FrameIcon},
];

function ToolRail({
  activeTool,
  onToolChange,
}: {
  activeTool: ToolId;
  onToolChange: (tool: ToolId) => void;
}) {
  return (
    <div
      style={styles.toolRail}
      role="toolbar"
      aria-label="Board tools"
      aria-orientation="vertical"
      data-stage-chrome>
      {TOOLS.map(tool => (
        <Tooltip key={tool.id} content={`${tool.label} — ${tool.shortcut}`}>
          <ToggleButton
            label={`${tool.label} tool`}
            isIconOnly
            size="sm"
            style={styles.toolButton}
            icon={<Icon icon={tool.icon} size="sm" color="inherit" />}
            isPressed={activeTool === tool.id}
            onPressedChange={pressed => {
              onToolChange(pressed ? tool.id : 'select');
            }}
          />
        </Tooltip>
      ))}
    </div>
  );
}

/** One-line hint riding the top center of the stage while a tool is armed. */
function toolHintText(tool: ToolId, pendingFrom: string | null): string | null {
  switch (tool) {
    case 'sticky':
      return 'Sticky tool — click the canvas to place a note in your color';
    case 'text':
      return 'Text tool — click the canvas to drop a label';
    case 'connector':
      return pendingFrom == null
        ? 'Connector tool — click the first sticky to link'
        : 'Connector tool — now click the second sticky';
    case 'frame':
      return 'Frame tool — click the canvas to place a cluster frame';
    default:
      return null;
  }
}

// ============= LIVE CURSORS =============

function CursorSprite({cursor}: {cursor: LiveCursor}) {
  const member = MEMBER[cursor.member];
  return (
    <div
      style={{
        ...styles.cursor,
        transform: `translate(${cursor.x}px, ${cursor.y}px)`,
      }}
      aria-hidden="true">
      <svg width={20} height={20} viewBox="0 0 20 20">
        <path
          d="M2 1 L18 9 L10.5 11 L7 19 Z"
          fill={member.color}
          stroke="var(--color-background-primary)"
          strokeWidth={1.2}
        />
      </svg>
      <div style={{...styles.cursorFlag, backgroundColor: member.color}}>
        <Text type="supporting" size="sm" weight="semibold" style={{color: FLAG_TEXT}}>
          {member.short}
        </Text>
      </div>
    </div>
  );
}

// ============= CLUSTER FRAMES =============

function ClusterFrame({cluster, count}: {cluster: Cluster; count: number}) {
  return (
    <div
      style={{
        ...styles.cluster,
        left: cluster.x,
        top: cluster.y,
        width: cluster.w,
        height: cluster.h,
        border: `1.5px solid color-mix(in srgb, ${cluster.color} 55%, var(--color-border))`,
        backgroundColor: `color-mix(in srgb, ${cluster.color} 6%, transparent)`,
      }}>
      <div
        style={{
          ...styles.clusterLabel,
          backgroundColor: `color-mix(in srgb, ${cluster.color} 14%, var(--color-background-surface))`,
          border: `var(--border-width) solid color-mix(in srgb, ${cluster.color} 40%, var(--color-border))`,
        }}>
        <Text type="supporting" size="sm" weight="semibold">
          {cluster.label}
        </Text>
        <span
          style={{
            ...styles.clusterCount,
            backgroundColor: `color-mix(in srgb, ${cluster.color} 24%, var(--color-background-surface))`,
          }}>
          <Text type="supporting" size="sm" weight="semibold" hasTabularNumbers>
            {count}
          </Text>
        </span>
      </div>
    </div>
  );
}

/** Neutral frames placed live by the frame tool. */
function PlacedFrameShape({frame}: {frame: PlacedFrame; }) {
  return (
    <div
      style={{
        ...styles.cluster,
        left: frame.x,
        top: frame.y,
        width: NEW_FRAME_W,
        height: NEW_FRAME_H,
        border: '1.5px dashed color-mix(in srgb, var(--color-accent) 55%, var(--color-border))',
        backgroundColor: 'color-mix(in srgb, var(--color-accent) 5%, transparent)',
      }}>
      <div
        style={{
          ...styles.clusterLabel,
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-background-surface))',
          border: 'var(--border-width) solid color-mix(in srgb, var(--color-accent) 35%, var(--color-border))',
        }}>
        <Text type="supporting" size="sm" weight="semibold">
          {frame.label}
        </Text>
      </div>
    </div>
  );
}

// ============= STICKY NOTES =============

function StickyShape({
  note,
  isSelected,
  isConnectorPick,
  isDraggingThis,
  isPopIn,
  isReducedMotion,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
  onClick,
}: {
  note: Sticky;
  isSelected: boolean;
  isConnectorPick: boolean;
  isDraggingThis: boolean;
  isPopIn: boolean;
  isReducedMotion: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onClick: () => void;
}) {
  const isEditing = note.id === EDITING_NOTE_ID;
  const editor = MEMBER[EDITING_MEMBER_ID];

  // Halo priority: remote edit ring > connector pick > local selection.
  const halo = isEditing
    ? `0 0 0 2.5px ${editor.color}, 0 0 0 7px color-mix(in srgb, ${editor.color} 22%, transparent)`
    : isConnectorPick
      ? '0 0 0 2px var(--color-accent), 0 0 0 6px color-mix(in srgb, var(--color-accent) 28%, transparent)'
      : isSelected
        ? '0 0 0 2px var(--color-accent), 0 0 0 6px color-mix(in srgb, var(--color-accent) 18%, transparent)'
        : undefined;

  const style: CSSProperties = {
    ...styles.note,
    ...(isDraggingThis ? styles.noteDragging : undefined),
    left: note.x,
    top: note.y,
    backgroundColor: stickyFill(note),
    border: `1.5px solid ${stickyBorder(note)}`,
    ...(note.rotation !== 0 ? {transform: `rotate(${note.rotation}deg)`} : undefined),
    ...(halo != null
      ? {
          boxShadow: `${halo}, 0 2px 6px color-mix(in srgb, var(--color-text-primary) 16%, transparent)`,
        }
      : undefined),
    ...(isPopIn && !isReducedMotion
      ? {animation: 'bww-pop 200ms ease-out'}
      : undefined),
  };

  const ariaLabel = isEditing
    ? `Sticky note, ${editor.name} is editing: ${note.text}`
    : `Sticky note by ${MEMBER[note.owner].name}: ${note.text}. Arrow keys move it.`;

  return (
    <button
      type="button"
      data-board-object
      style={style}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onClick={onClick}>
      {isEditing && (
        <span
          style={{...styles.editFlag, backgroundColor: editor.color, color: FLAG_TEXT}}
          aria-hidden="true">
          <Icon icon={PenLineIcon} size="xsm" color="inherit" />
          <Text type="supporting" size="sm" weight="semibold" style={{color: FLAG_TEXT}}>
            {editor.short} is editing…
          </Text>
        </span>
      )}
      <Text type="body" size="sm" maxLines={3}>
        {note.text}
        {isEditing && (
          <span
            aria-hidden="true"
            style={{
              ...styles.caret,
              backgroundColor: editor.color,
              // Blink is JS-gated: reduced-motion keeps a steady caret bar.
              animation: isReducedMotion
                ? undefined
                : 'bww-caret 1.1s steps(1) infinite',
            }}
          />
        )}
      </Text>
      <span style={styles.noteOwnerRow}>
        <span
          style={{...styles.ownerDot, backgroundColor: MEMBER[note.owner].color}}
        />
        <Text type="supporting" size="sm" color="secondary">
          {MEMBER[note.owner].short}
        </Text>
      </span>
    </button>
  );
}

// ============= CANVAS ANNOTATIONS =============

function AnnotationLabel({annotation}: {annotation: Annotation}) {
  return (
    <div style={{...styles.annotation, left: annotation.x, top: annotation.y}}>
      <Text type="supporting" weight="semibold" color="secondary">
        {annotation.text}
      </Text>
    </div>
  );
}

// ============= CONNECTOR LAYER =============
// Exactly one SVG layer: the fixture cluster-to-cluster arrow plus any
// note-to-note links drawn live with the connector tool.

const ARROW_STROKE =
  'color-mix(in srgb, var(--color-text-secondary) 80%, var(--color-border))';

function ConnectorLayer({
  connectors,
  noteById,
}: {
  connectors: NoteConnector[];
  noteById: Map<string, Sticky>;
}) {
  return (
    <svg
      width={BOARD_W}
      height={BOARD_H}
      style={styles.connectorLayer}
      aria-hidden="true">
      <defs>
        <marker
          id="bww-arrowhead"
          markerWidth={10}
          markerHeight={8}
          refX={8}
          refY={4}
          orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 Z" fill={ARROW_STROKE} />
        </marker>
      </defs>
      {/* Cluster-to-cluster arc, arrowhead at the pricing end. */}
      <path
        d={`M ${CLUSTER_ARROW.from.x} ${CLUSTER_ARROW.from.y} C ${CLUSTER_ARROW.c1.x} ${CLUSTER_ARROW.c1.y}, ${CLUSTER_ARROW.c2.x} ${CLUSTER_ARROW.c2.y}, ${CLUSTER_ARROW.to.x} ${CLUSTER_ARROW.to.y}`}
        fill="none"
        stroke={ARROW_STROKE}
        strokeWidth={2}
        strokeDasharray="7 5"
        markerEnd="url(#bww-arrowhead)"
      />
      <circle
        cx={CLUSTER_ARROW.from.x}
        cy={CLUSTER_ARROW.from.y}
        r={4}
        fill={ARROW_STROKE}
      />
      {/* Live note-to-note links: gentle curves between sticky centers. */}
      {connectors.map(connector => {
        const from = noteById.get(connector.from);
        const to = noteById.get(connector.to);
        if (from == null || to == null) {
          return null;
        }
        const x1 = from.x + NOTE_W / 2;
        const y1 = from.y + NOTE_H / 2;
        const x2 = to.x + NOTE_W / 2;
        const y2 = to.y + NOTE_H / 2;
        const midX = (x1 + x2) / 2;
        const stroke =
          'color-mix(in srgb, var(--color-accent) 70%, var(--color-border))';
        return (
          <g key={connector.id}>
            <path
              d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
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

// ============= MINIMAP =============

function Minimap({
  notes,
  frames,
  pan,
  zoom,
  stage,
}: {
  notes: Sticky[];
  frames: PlacedFrame[];
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
      {CLUSTERS.map(cluster => (
        <div
          key={cluster.id}
          style={{
            ...styles.minimapRect,
            left: cluster.x * MINI_SCALE,
            top: cluster.y * MINI_SCALE,
            width: cluster.w * MINI_SCALE,
            height: cluster.h * MINI_SCALE,
            border: `1px solid color-mix(in srgb, ${cluster.color} 60%, var(--color-border))`,
          }}
        />
      ))}
      {frames.map(frame => (
        <div
          key={frame.id}
          style={{
            ...styles.minimapRect,
            left: frame.x * MINI_SCALE,
            top: frame.y * MINI_SCALE,
            width: NEW_FRAME_W * MINI_SCALE,
            height: NEW_FRAME_H * MINI_SCALE,
            border: '1px solid color-mix(in srgb, var(--color-accent) 60%, var(--color-border))',
          }}
        />
      ))}
      {notes.map(note => (
        <div
          key={note.id}
          style={{
            ...styles.minimapRect,
            left: note.x * MINI_SCALE,
            top: note.y * MINI_SCALE,
            width: NOTE_W * MINI_SCALE,
            height: NOTE_H * MINI_SCALE,
            backgroundColor: stickyColor(note),
          }}
        />
      ))}
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

// ============= COMMENT THREAD PIN =============

function CommentThreadPin({
  anchor,
  thread,
  isOpen,
  replyDraft,
  onToggle,
  onReplyChange,
  onReplySubmit,
}: {
  anchor: Sticky;
  thread: ThreadComment[];
  isOpen: boolean;
  replyDraft: string;
  onToggle: () => void;
  onReplyChange: (value: string) => void;
  onReplySubmit: () => void;
}) {
  const opener = MEMBER[thread[0]?.author ?? 'jonah'];
  return (
    <div
      style={{
        position: 'absolute',
        left: anchor.x + NOTE_W - 16,
        top: anchor.y - 18,
        zIndex: 8,
      }}>
      <button
        type="button"
        data-board-object
        style={styles.commentPin}
        aria-expanded={isOpen}
        aria-label={`Comment thread on "${anchor.text}", ${thread.length} comments`}
        onClick={onToggle}>
        <span style={{...styles.commentDisc, backgroundColor: opener.color, color: FLAG_TEXT}}>
          <Icon icon={MessageSquareIcon} size="sm" color="inherit" />
        </span>
      </button>
      {isOpen && (
        <div
          data-board-object
          style={styles.commentPopover}
          role="dialog"
          aria-label="Comment thread">
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" size="sm" weight="semibold" color="secondary">
                  Thread · {thread.length}
                </Text>
              </StackItem>
              <Button label="Close" variant="ghost" size="sm" onClick={onToggle} />
            </HStack>
            {thread.map(comment => {
              const author = MEMBER[comment.author];
              return (
                <HStack key={comment.id} gap={2} vAlign="start">
                  <Avatar name={author.name} size="xsmall" />
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <HStack gap={2} vAlign="center">
                        <Text type="supporting" size="sm" weight="semibold">
                          {author.name}
                        </Text>
                        <Text type="supporting" size="sm" color="secondary">
                          {comment.time}
                        </Text>
                      </HStack>
                      <Text type="body" size="sm">
                        {comment.text}
                      </Text>
                    </VStack>
                  </StackItem>
                </HStack>
              );
            })}
            <form
              onSubmit={event => {
                event.preventDefault();
                onReplySubmit();
              }}>
              <HStack gap={1} vAlign="center">
                <StackItem size="fill">
                  <TextInput
                    label="Reply to thread"
                    isLabelHidden
                    placeholder="Reply…"
                    width="100%"
                    value={replyDraft}
                    onChange={onReplyChange}
                  />
                </StackItem>
                <IconButton
                  label="Post reply"
                  variant="primary"
                  size="sm"
                  icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                  isDisabled={replyDraft.trim().length === 0}
                  onClick={onReplySubmit}
                />
              </HStack>
            </form>
          </VStack>
        </div>
      )}
    </div>
  );
}

// ============= ZOOM CONTROLS =============

function ZoomBar({
  zoom,
  onZoomDelta,
  onFit,
}: {
  zoom: number;
  onZoomDelta: (delta: number) => void;
  onFit: () => void;
}) {
  return (
    <div style={styles.zoomBar} data-stage-chrome>
      <IconButton
        label="Zoom out"
        tooltip="Zoom out"
        icon={<Icon icon={ZoomOutIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={styles.zoomButton}
        isDisabled={zoom <= ZOOM_MIN + 0.001}
        onClick={() => onZoomDelta(-ZOOM_STEP)}
      />
      <Text
        type="supporting"
        size="sm"
        color="secondary"
        hasTabularNumbers
        style={styles.zoomReadout}>
        {Math.round(zoom * 100)}%
      </Text>
      <IconButton
        label="Zoom in"
        tooltip="Zoom in"
        icon={<Icon icon={ZoomInIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={styles.zoomButton}
        isDisabled={zoom >= ZOOM_MAX - 0.001}
        onClick={() => onZoomDelta(ZOOM_STEP)}
      />
      <IconButton
        label="Fit board to view"
        tooltip="Fit board"
        icon={<Icon icon={MaximizeIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={styles.zoomButton}
        onClick={onFit}
      />
    </div>
  );
}

// ============= PAGE =============

export default function BrainstormWhiteboardTemplate() {
  // ---- live board state (first-person edits; no transport, no ticks) ----
  const [notes, setNotes] = useState<Sticky[]>(INITIAL_NOTES);
  const [annotations, setAnnotations] = useState<Annotation[]>(INITIAL_ANNOTATIONS);
  const [placedFrames, setPlacedFrames] = useState<PlacedFrame[]>([]);
  const [connectors, setConnectors] = useState<NoteConnector[]>([]);
  const [thread, setThread] = useState<ThreadComment[]>(INITIAL_THREAD);
  const [replyDraft, setReplyDraft] = useState('');
  const [isThreadOpen, setIsThreadOpen] = useState(true);

  // ---- tools / selection ----
  const [activeTool, setActiveTool] = useState<ToolId>('select');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [connectorFromId, setConnectorFromId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [isShareToastOpen, setIsShareToastOpen] = useState(false);

  // ---- camera ----
  const [zoom, setZoom] = useState(0.6);
  const [pan, setPan] = useState<Point>({x: 0, y: 0});
  const [isPanningStage, setIsPanningStage] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const stageSize = useElementSize(stageRef);
  const didFitRef = useRef(false);
  const panDragRef = useRef<{start: Point; base: Point; moved: boolean} | null>(null);
  const noteDragRef = useRef<{noteId: string; start: Point; base: Point} | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const idCounterRef = useRef(0);
  /** Ids born in this session — they get the pop-in animation once. */
  const bornIdsRef = useRef<Set<string>>(new Set());

  const isCompact = useMediaQuery('(max-width: 640px)');
  const isRoomy = useMediaQuery('(min-width: 1025px)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isFinePointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  const noteById = useMemo(
    () => new Map(notes.map(note => [note.id, note])),
    [notes],
  );

  /** Cluster tallies derive from live sticky state (labels reconcile). */
  const clusterCounts = useMemo(() => {
    const counts: Record<ClusterId, number> = {
      onboarding: 0,
      performance: 0,
      pricing: 0,
    };
    for (const note of notes) {
      if (note.cluster != null) {
        counts[note.cluster] += 1;
      }
    }
    return counts;
  }, [notes]);

  const commentAnchor = noteById.get(COMMENT_NOTE_ID) ?? null;

  // ---- first measure: fit the whole board and center it ----
  useEffect(() => {
    if (didFitRef.current || stageSize.width === 0 || stageSize.height === 0) {
      return;
    }
    didFitRef.current = true;
    const fitted = fitCamera(stageSize);
    setZoom(fitted.zoom);
    setPan(fitted.pan);
  }, [stageSize]);

  // ---- camera math ----
  const effectivePan = clampPan(pan, zoom, stageSize);

  const setZoomAroundCenter = useCallback(
    (delta: number) => {
      setZoom(previousZoom => {
        const nextZoom = Math.min(
          ZOOM_MAX,
          Math.max(ZOOM_MIN, Math.round((previousZoom + delta) * 100) / 100),
        );
        if (nextZoom !== previousZoom) {
          const centerX = stageSize.width / 2;
          const centerY = stageSize.height / 2;
          setPan(previousPan => {
            const clamped = clampPan(previousPan, previousZoom, stageSize);
            return clampPan(
              {
                x: centerX - ((centerX - clamped.x) / previousZoom) * nextZoom,
                y: centerY - ((centerY - clamped.y) / previousZoom) * nextZoom,
              },
              nextZoom,
              stageSize,
            );
          });
        }
        return nextZoom;
      });
    },
    [stageSize],
  );

  const fitToBoard = useCallback(() => {
    const fitted = fitCamera(stageSize);
    setZoom(fitted.zoom);
    setPan(fitted.pan);
    setAnnouncement('Board fit to view.');
  }, [stageSize]);

  /** Stage pixels → board units under the current camera. */
  const toBoardPoint = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const stageElement = stageRef.current;
      if (stageElement == null) {
        return null;
      }
      const rect = stageElement.getBoundingClientRect();
      return {
        x: (clientX - rect.left - effectivePan.x) / zoom,
        y: (clientY - rect.top - effectivePan.y) / zoom,
      };
    },
    [effectivePan.x, effectivePan.y, zoom],
  );

  // ---- live placement: the sticky / text / frame tools ----
  const placeObjectAt = useCallback(
    (point: Point) => {
      idCounterRef.current += 1;
      const serial = idCounterRef.current;
      if (activeTool === 'sticky') {
        const id = `n-new-${serial}`;
        const cluster = clusterAt(point);
        bornIdsRef.current.add(id);
        setNotes(previous => [
          ...previous,
          {
            id,
            cluster,
            owner: 'you',
            x: Math.round(point.x - NOTE_W / 2),
            y: Math.round(point.y - NOTE_H / 2),
            rotation: 0,
            text: 'New idea — select and nudge me into a cluster',
          },
        ]);
        setSelectedNoteId(id);
        setActiveTool('select');
        setAnnouncement(
          cluster != null
            ? `Sticky added to ${CLUSTER[cluster].label}.`
            : 'Sticky added to the open canvas.',
        );
      } else if (activeTool === 'text') {
        const id = `t-new-${serial}`;
        bornIdsRef.current.add(id);
        setAnnotations(previous => [
          ...previous,
          {id, x: Math.round(point.x), y: Math.round(point.y), text: 'New label'},
        ]);
        setActiveTool('select');
        setAnnouncement('Text label added.');
      } else if (activeTool === 'frame') {
        const id = `f-new-${serial}`;
        bornIdsRef.current.add(id);
        setPlacedFrames(previous => [
          ...previous,
          {
            id,
            x: Math.round(point.x - NEW_FRAME_W / 2),
            y: Math.round(point.y - NEW_FRAME_H / 2),
            label: `New cluster ${serial}`,
          },
        ]);
        setActiveTool('select');
        setAnnouncement('Cluster frame added.');
      }
    },
    [activeTool],
  );

  // ---- background pan (pointer capture); click-through places objects ----
  const handleStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Board objects handle their own pointers; floating chrome (rail, zoom
    // pill, hint chip) must neither pan the stage nor place objects.
    const target = event.target as HTMLElement;
    if (
      target.closest('[data-board-object], [data-stage-chrome], button, input') != null
    ) {
      return;
    }
    panDragRef.current = {
      start: {x: event.clientX, y: event.clientY},
      base: effectivePan,
      moved: false,
    };
    setPan(effectivePan);
    setIsPanningStage(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleStagePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = panDragRef.current;
    if (drag == null) {
      return;
    }
    const dx = event.clientX - drag.start.x;
    const dy = event.clientY - drag.start.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      drag.moved = true;
    }
    setPan(
      clampPan({x: drag.base.x + dx, y: drag.base.y + dy}, zoom, stageSize),
    );
  };

  const handleStagePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = panDragRef.current;
    panDragRef.current = null;
    setIsPanningStage(false);
    if (drag == null || drag.moved) {
      return;
    }
    // A clean background click: place with an armed tool, or clear state.
    if (activeTool === 'sticky' || activeTool === 'text' || activeTool === 'frame') {
      const point = toBoardPoint(event.clientX, event.clientY);
      if (point != null) {
        placeObjectAt(point);
      }
      return;
    }
    setSelectedNoteId(null);
    setConnectorFromId(null);
  };

  // ---- sticky move: ONE commit path for pointer drag and arrow keys ----
  const moveNoteBy = useCallback((noteId: string, dx: number, dy: number) => {
    setNotes(previous =>
      previous.map(note =>
        note.id === noteId
          ? {
              ...note,
              x: Math.min(BOARD_W - NOTE_W, Math.max(0, note.x + dx)),
              y: Math.min(BOARD_H - NOTE_H, Math.max(0, note.y + dy)),
            }
          : note,
      ),
    );
  }, []);

  const handleNotePointerDown = (
    note: Sticky,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (!isFinePointer || activeTool !== 'select') {
      return;
    }
    noteDragRef.current = {
      noteId: note.id,
      start: {x: event.clientX, y: event.clientY},
      base: {x: note.x, y: note.y},
    };
    setDraggingNoteId(note.id);
    setSelectedNoteId(note.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleNotePointerMove = (
    note: Sticky,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const drag = noteDragRef.current;
    if (drag == null || drag.noteId !== note.id) {
      return;
    }
    // Divide by zoom so the sticky tracks the pointer 1:1 at any scale.
    const nextX = drag.base.x + (event.clientX - drag.start.x) / zoom;
    const nextY = drag.base.y + (event.clientY - drag.start.y) / zoom;
    setNotes(previous =>
      previous.map(candidate =>
        candidate.id === note.id
          ? {
              ...candidate,
              x: Math.min(BOARD_W - NOTE_W, Math.max(0, nextX)),
              y: Math.min(BOARD_H - NOTE_H, Math.max(0, nextY)),
            }
          : candidate,
      ),
    );
  };

  const handleNotePointerUp = () => {
    noteDragRef.current = null;
    setDraggingNoteId(null);
  };

  // ---- note click: select, or run the two-step connector flow ----
  const handleNoteClick = (note: Sticky) => {
    if (activeTool === 'connector') {
      if (connectorFromId == null) {
        setConnectorFromId(note.id);
        setAnnouncement('First sticky picked — click the second sticky to link.');
        return;
      }
      if (connectorFromId === note.id) {
        setConnectorFromId(null);
        setAnnouncement('Connector cancelled.');
        return;
      }
      idCounterRef.current += 1;
      setConnectors(previous => [
        ...previous,
        {id: `c-new-${idCounterRef.current}`, from: connectorFromId, to: note.id},
      ]);
      const fromNote = noteById.get(connectorFromId);
      setConnectorFromId(null);
      setActiveTool('select');
      setAnnouncement(
        `Connector drawn from "${fromNote?.text ?? 'sticky'}" to "${note.text}".`,
      );
      return;
    }
    // Select-only (background click / Escape deselect) so the click that
    // follows a pointer drag never un-selects the sticky just moved.
    setSelectedNoteId(note.id);
  };

  const handleNoteKeyDown = (
    note: Sticky,
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'Escape') {
      setSelectedNoteId(null);
      setConnectorFromId(null);
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
    setSelectedNoteId(note.id);
    // Identical commit path as pointer drag.
    moveNoteBy(note.id, delta.x, delta.y);
  };

  // ---- global tool shortcuts (V S T C F, Escape) ----
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target?.closest('input, textarea, select, [contenteditable="true"]') !=
        null
      ) {
        return;
      }
      const toolForKey: Record<string, ToolId> = {
        v: 'select',
        s: 'sticky',
        t: 'text',
        c: 'connector',
        f: 'frame',
      };
      const tool = toolForKey[event.key.toLowerCase()];
      if (tool != null && !event.repeat) {
        setActiveTool(tool);
        setConnectorFromId(null);
        return;
      }
      if (event.key === 'Escape') {
        setConnectorFromId(null);
        setSelectedNoteId(null);
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ---- thread reply ----
  const handleReplySubmit = () => {
    const text = replyDraft.trim();
    if (text.length === 0) {
      return;
    }
    idCounterRef.current += 1;
    setThread(previous => [
      ...previous,
      {id: `tc-new-${idCounterRef.current}`, author: 'you', time: 'Just now', text},
    ]);
    setReplyDraft('');
    setAnnouncement('Reply posted to the thread.');
  };

  const handleToolChange = (tool: ToolId) => {
    setActiveTool(tool);
    setConnectorFromId(null);
  };

  const hint = toolHintText(activeTool, connectorFromId);
  const isPlacingTool =
    activeTool === 'sticky' || activeTool === 'text' || activeTool === 'frame';

  // ---- stage ----
  const stage = (
    <div
      ref={stageRef}
      style={{
        ...styles.stage,
        ...(isPanningStage ? styles.stagePanning : undefined),
        ...(isPlacingTool && !isPanningStage ? styles.stagePlacing : undefined),
      }}
      onPointerDown={handleStagePointerDown}
      onPointerMove={handleStagePointerMove}
      onPointerUp={handleStagePointerUp}
      onPointerCancel={handleStagePointerUp}>
      <div
        style={{
          ...styles.board,
          transform: `translate(${effectivePan.x}px, ${effectivePan.y}px) scale(${zoom})`,
        }}>
        <ConnectorLayer connectors={connectors} noteById={noteById} />
        {CLUSTERS.map(cluster => (
          <ClusterFrame
            key={cluster.id}
            cluster={cluster}
            count={clusterCounts[cluster.id]}
          />
        ))}
        {placedFrames.map(frame => (
          <PlacedFrameShape key={frame.id} frame={frame} />
        ))}
        <div
          style={{
            ...styles.connectorLabel,
            left: CLUSTER_ARROW.label.x,
            top: CLUSTER_ARROW.label.y,
          }}>
          <Text type="supporting" size="sm" color="secondary">
            {CLUSTER_ARROW.label.text}
          </Text>
        </div>
        {annotations.map(annotation => (
          <AnnotationLabel key={annotation.id} annotation={annotation} />
        ))}
        {notes.map(note => (
          <StickyShape
            key={note.id}
            note={note}
            isSelected={selectedNoteId === note.id}
            isConnectorPick={connectorFromId === note.id}
            isDraggingThis={draggingNoteId === note.id}
            isPopIn={bornIdsRef.current.has(note.id)}
            isReducedMotion={isReducedMotion}
            onPointerDown={event => handleNotePointerDown(note, event)}
            onPointerMove={event => handleNotePointerMove(note, event)}
            onPointerUp={handleNotePointerUp}
            onKeyDown={event => handleNoteKeyDown(note, event)}
            onClick={() => handleNoteClick(note)}
          />
        ))}
        {commentAnchor != null && (
          <CommentThreadPin
            anchor={commentAnchor}
            thread={thread}
            isOpen={isThreadOpen}
            replyDraft={replyDraft}
            onToggle={() => setIsThreadOpen(previous => !previous)}
            onReplyChange={setReplyDraft}
            onReplySubmit={handleReplySubmit}
          />
        )}
        {LIVE_CURSORS.map(cursor => (
          <CursorSprite key={cursor.member} cursor={cursor} />
        ))}
      </div>

      <ToolRail activeTool={activeTool} onToolChange={handleToolChange} />

      {!isCompact && (
        <div style={styles.toolHint} role="status" data-stage-chrome>
          {hint != null ? (
            <Text type="supporting" size="sm" color="secondary">
              {hint}
            </Text>
          ) : (
            <HStack gap={1} vAlign="center">
              <Text type="supporting" size="sm" color="secondary">
                Tools
              </Text>
              <Kbd keys="v" />
              <Kbd keys="s" />
              <Kbd keys="t" />
              <Kbd keys="c" />
              <Kbd keys="f" />
              <Text type="supporting" size="sm" color="secondary">
                · drag the canvas to pan
              </Text>
            </HStack>
          )}
        </div>
      )}

      <ZoomBar zoom={zoom} onZoomDelta={setZoomAroundCenter} onFit={fitToBoard} />

      {!isCompact && (
        <Minimap
          notes={notes}
          frames={placedFrames}
          pan={effectivePan}
          zoom={zoom}
          stage={stageSize}
        />
      )}
    </div>
  );

  // ---- header: identity row + collaboration cluster ----
  const facepile = isCompact ? (
    <Token size="sm" color="gray" label="6 people" />
  ) : (
    <AvatarGroup size="small" aria-label="Board contributors">
      <Avatar name="Sofia Ortiz" size="small" />
      <Avatar name="Jonah Fields" size="small" />
      <Avatar name="Marcus Webb" size="small" />
      <Avatar name="Elena Voss" size="small" />
      <AvatarGroupOverflow count={2} />
    </AvatarGroup>
  );

  const handleShare = () => {
    setIsShareToastOpen(true);
    setAnnouncement('Board link copied.');
  };

  return (
    <div style={styles.root}>
      <style>{KEYFRAME_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" style={styles.headerRow}>
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Icon icon={StickyNoteIcon} size="sm" color="secondary" />
                  <Heading level={1}>{BOARD_TITLE}</Heading>
                  <StatusDot
                    variant="success"
                    label="Live"
                    isPulsing={!isReducedMotion}
                  />
                  {isRoomy && (
                    <Text type="supporting" color="secondary">
                      {BOARD_CAPTION}
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <HStack gap={2} vAlign="center">
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    {ONLINE_IDS.length} online
                  </Text>
                )}
                {facepile}
                {isCompact ? (
                  <IconButton
                    label="Share board"
                    icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}
                    variant="primary"
                    size="sm"
                    style={styles.toolButton}
                    onClick={handleShare}
                  />
                ) : (
                  <Button
                    label="Share"
                    variant="primary"
                    size="sm"
                    icon={<Icon icon={Share2Icon} size="sm" />}
                    onClick={handleShare}
                  />
                )}
              </HStack>
            </HStack>
          </LayoutHeader>
        }
        content={<LayoutContent padding={0}>{stage}</LayoutContent>}
      />

      {/* Live-region for tool and edit announcements (screen readers). */}
      <div role="status" aria-live="polite" style={styles.srOnly}>
        {announcement}
      </div>

      {isShareToastOpen && (
        <div style={styles.toastWrap}>
          <Toast
            type="info"
            isAutoHide
            autoHideDuration={4000}
            onDismiss={() => setIsShareToastOpen(false)}
            body={
              <VStack gap={1}>
                <Text weight="semibold">Board link copied</Text>
                <Text type="supporting" color="secondary">
                  Anyone at Kestrel Labs with the link can edit. Sofia and
                  Jonah are already here.
                </Text>
              </VStack>
            }
          />
        </div>
      )}
    </div>
  );
}

