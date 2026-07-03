var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one deck under review —
 *   'pricing-refresh-proposal.pptx' with 6 positioned-SlideShape slides on a
 *   960x720 canvas grid, plus 7 comment threads with fixed ISO timestamps
 *   between 2026-06-28T15:12:00Z and 2026-06-30T09:41:00Z, slide-anchored at
 *   shape positions; threads 2 and 6 start resolved, two threads carry one
 *   reply each)
 * @output Deck REVIEW surface: a header (deck Heading + 'v14 · uploaded
 *   Jun 28 by Priya Nair' version note + 'In review' Badge + All/Open/Resolved
 *   filter SegmentedControl), a slim 112px left thumbnail rail whose tiles
 *   wear an open-comment-count Badge (hidden at zero), a centered 4:3 stage
 *   whose canvas overlays numbered 24px circular markers at fixed shape-anchor
 *   x/y positions (accent circles with white numerals; resolved markers flip
 *   to accent-muted with a CheckIcon), and a right 340px thread panel of
 *   Cards — Avatar + author + Timestamp, body text with @mentions rendered as
 *   Tokens, indented replies, a Resolve/Reopen Button per thread, and a reply
 *   TextArea + Send on the active thread. Clicking a canvas marker highlights
 *   and scrolls to its thread; clicking a thread highlights its marker
 * @position Page template; emitted by \`astryx template deck-review-comments\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the review chrome (deck
 * icon + filename + version note + 'In review' Badge, filter
 * SegmentedControl). LayoutPanel start 112 hosts the thumbnail rail;
 * LayoutContent (padding 0) is a muted backdrop centering an 800px-max 4:3
 * stage Card with the marker overlay; LayoutPanel end 340 hosts the scrolling
 * thread list. Choose over slide-deck-viewer when the surface is
 * COLLABORATIVE REVIEW — markers, threads, resolve state — not plain paging;
 * choose over slide-editor-canvas when slides are immutable and only the
 * discussion mutates.
 *
 * Responsive contract:
 * - >1024px: header | rail 112 (fixed, scrolls vertically) | stage (fill) |
 *   thread panel 340 (fixed, scrolls vertically). Only the rail, stage
 *   backdrop, and panel scroll internally.
 * - <=1024px: the rail collapses into a horizontal thumbnail strip above the
 *   stage (tiles keep intrinsic 96px width, strip scrolls horizontally).
 * - <=768px: the thread panel leaves the right edge and stacks below the
 *   stage as a full-width section; the column flows at natural height and
 *   LayoutContent scrolls it as one page; the header drops the version note
 *   and canvas markers grow invisible 40px touch hit boxes (the painted
 *   circle stays 24px).
 * - Header rows are wrap="wrap", so on narrow widths the filter
 *   SegmentedControl drops below the filename instead of clipping.
 * - Slide canvases use container-query (cqw) type sizing so the identical
 *   shape fixtures paint at 96px thumbnails and the 800px stage; markers
 *   paint as fixed 24px circles at every stage width.
 *
 * Container policy (review-workbench archetype): the page chrome is
 * frame-first rows and panels; Cards are reserved for the slide paper and the
 * comment threads. All counts (rail Badges, header totals) recompute live
 * from resolve state — no clocks, randomness, or network assets. Reply
 * submissions append with the fixed literal timestamp 2026-07-02T16:00:00Z.
 */

import {useRef, useState, type CSSProperties, type ReactNode} from 'react';

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
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CheckIcon,
  MessageSquareTextIcon,
  PresentationIcon,
  RotateCcwIcon,
  SendIcon,
} from 'lucide-react';

// Stage pager chevrons come from Icon's built-in semantic registry
// ('chevronLeft' / 'chevronRight').

// ============= SLIDE PAINT CONSTANTS =============
// Slide surfaces are "paper": literal light colors locked with
// colorScheme:'light' so the deck looks identical in dark mode.

const SLIDE_TEXT = '#1C2733';
const SLIDE_MUTED = '#6E7D8B';
const SLIDE_FAINT = '#9AA7B3';
const SLIDE_ACCENT = '#0B5FAE';
const SLIDE_ACCENT_SOFT = '#E8F1FA';
const SLIDE_PLACEHOLDER_BG = '#EEF2F6';
const SLIDE_PLACEHOLDER_BORDER = '#C4CFD9';

// Canvas grid: classic 4:3 PowerPoint page, 960x720 virtual units.
const CANVAS_W = 960;
const CANVAS_H = 720;

/** Horizontal canvas unit -> percentage of slide width. */
const pctX = (v: number) => \`\${((v / CANVAS_W) * 100).toFixed(3)}%\`;
/** Vertical canvas unit -> percentage of slide height. */
const pctY = (v: number) => \`\${((v / CANVAS_H) * 100).toFixed(3)}%\`;
/**
 * Canvas px -> container-query width units. The canvas div is a container
 * (inline-size), so 1cqw = 1% of the rendered slide width; the same fixture
 * paints the 800px stage and the 96px thumbnails.
 */
const cqw = (v: number) => \`\${((v / CANVAS_W) * 100).toFixed(3)}cqw\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Thumbnail rail: the panel is fixed at 112px, only the tiles scroll.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-2)',
  },
  // <=1024px: horizontal strip above the stage.
  stripScroll: {
    overflowX: 'auto',
    padding: 'var(--spacing-2)',
    flexShrink: 0,
  },
  stripTile: {width: 96, flexShrink: 0},
  tileAnchor: {position: 'relative'},
  tileBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 1,
    pointerEvents: 'none',
  },
  // Muted backdrop; the stage column centers and scrolls when short.
  stageBackdrop: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
  },
  stageColumn: {
    width: '100%',
    maxWidth: 800,
    marginInline: 'auto',
    marginBlock: 'auto',
  },
  stageCard: {
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
  },
  // Marker host wraps the slide canvas so markers share its coordinate space.
  markerHost: {position: 'relative', width: '100%', height: '100%'},
  // The slide surface: white paper, container for cqw type sizing.
  canvas: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    color: SLIDE_TEXT,
    colorScheme: 'light',
    containerType: 'inline-size',
    overflow: 'hidden',
  },
  // Anchored comment marker: an unstyled button centered on its shape
  // anchor. Desktop keeps the visible 24px circle as the hit box; <=768px
  // the invisible hit box grows to 40px for touch (markerTouch) while the
  // painted circle stays 24px.
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    border: 'none',
    background: 'transparent',
  },
  markerTouch: {
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
  },
  // The visible 24px circle inside the marker button.
  markerDot: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '2px solid #FFFFFF',
    boxShadow: 'var(--shadow-med)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  // Thread panel: fixed 340px, only the thread list scrolls.
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  panelStacked: {
    padding: 'var(--spacing-3)',
  },
  replyIndent: {
    paddingLeft: 'var(--spacing-4)',
    borderLeft: '2px solid var(--color-border)',
  },
  threadBody: {whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'},
};

// ============= SLIDE DATA =============
// Deterministic fixtures: fixed shape geometry on a 960x720 grid.
// No parsing, no clocks, no randomness, no network assets.

const DECK_FILE_NAME = 'pricing-refresh-proposal.pptx';
const VERSION_NOTE = 'v14 · uploaded Jun 28 by Priya Nair';
const REPLY_TIMESTAMP = '2026-07-02T16:00:00Z'; // fixed literal for new replies
const CURRENT_REVIEWER = 'Maya Chen';

interface ShapeFrame {
  x: number;
  y: number;
  w: number;
  h?: number;
}

type SlideShape =
  | (ShapeFrame & {
      kind: 'text';
      text: string;
      size: number; // canvas px
      weight?: 400 | 600 | 700;
      color?: 'default' | 'muted' | 'accent';
      align?: 'left' | 'center';
    })
  | (ShapeFrame & {kind: 'bullets'; items: string[]; size: number})
  | (ShapeFrame & {kind: 'image'; label: string})
  | (ShapeFrame & {kind: 'stat'; value: string; caption: string})
  | (ShapeFrame & {kind: 'bar'});

interface Slide {
  id: string;
  title: string;
  shapes: SlideShape[];
}

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    title: 'Pricing Refresh Proposal',
    shapes: [
      {kind: 'bar', x: 120, y: 252, w: 72, h: 10},
      {
        kind: 'text',
        x: 120,
        y: 288,
        w: 720,
        text: 'Pricing Refresh Proposal',
        size: 54,
        weight: 700,
      },
      {
        kind: 'text',
        x: 120,
        y: 372,
        w: 720,
        text: 'Growth & Monetization · June 2026',
        size: 26,
        color: 'muted',
      },
    ],
  },
  {
    id: 'slide-2',
    title: 'Current pricing',
    shapes: [
      {kind: 'text', x: 80, y: 70, w: 800, text: 'Current pricing', size: 42, weight: 700},
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {
        kind: 'bullets',
        x: 80,
        y: 208,
        w: 780,
        size: 27,
        items: [
          'Starter — $15/mo · 3 seats · community support',
          'Pro — $39/mo · 10 seats · priority support',
          'Scale — $99/mo · 25 seats · SSO + audit log',
          'Annual discount — 10%, grandfathered accounts only',
        ],
      },
    ],
  },
  {
    id: 'slide-3',
    title: 'Proposed tiers',
    shapes: [
      {kind: 'text', x: 80, y: 70, w: 800, text: 'Proposed tiers', size: 42, weight: 700},
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {kind: 'stat', x: 80, y: 200, w: 240, h: 180, value: 'Starter $19', caption: 'entry · 3 seats'},
      {kind: 'stat', x: 360, y: 200, w: 240, h: 180, value: 'Pro $49', caption: 'teams · 12 seats'},
      {kind: 'stat', x: 640, y: 200, w: 240, h: 180, value: 'Scale $129', caption: 'per workspace · SSO'},
      {
        kind: 'bullets',
        x: 80,
        y: 440,
        w: 780,
        size: 24,
        items: [
          'Existing customers keep legacy pricing for 12 months',
          'Annual plans move from 10% to 15% discount',
        ],
      },
    ],
  },
  {
    id: 'slide-4',
    title: 'Migration plan',
    shapes: [
      {kind: 'text', x: 80, y: 70, w: 800, text: 'Migration plan', size: 42, weight: 700},
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {
        kind: 'bullets',
        x: 80,
        y: 208,
        w: 780,
        size: 27,
        items: [
          'Jul 15 — new tiers live for new signups',
          'Aug 1 — in-app migration banner for legacy accounts',
          'Sep 1 — email sequence to annual-plan admins',
          'Jul 2027 — legacy pricing sunset completes',
        ],
      },
    ],
  },
  {
    id: 'slide-5',
    title: 'Revenue impact',
    shapes: [
      {kind: 'text', x: 80, y: 70, w: 800, text: 'Revenue impact', size: 42, weight: 700},
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {kind: 'image', x: 80, y: 180, w: 800, h: 450, label: 'impact-model.png'},
    ],
  },
  {
    id: 'slide-6',
    title: 'Decision needed',
    shapes: [
      {
        kind: 'text',
        x: 120,
        y: 260,
        w: 720,
        text: 'Decision needed',
        size: 52,
        weight: 700,
        align: 'center',
      },
      {
        kind: 'text',
        x: 120,
        y: 352,
        w: 720,
        text: 'Approve new tiers by July 10',
        size: 28,
        color: 'accent',
        align: 'center',
      },
    ],
  },
];

const SLIDE_COUNT = SLIDES.length;

const TEXT_COLOR: Record<'default' | 'muted' | 'accent', string> = {
  default: SLIDE_TEXT,
  muted: SLIDE_MUTED,
  accent: SLIDE_ACCENT,
};

// ============= THREAD DATA =============
// 7 threads, fixed ISO timestamps between 2026-06-28T15:12:00Z and
// 2026-06-30T09:41:00Z; anchors reference shape positions on the 960x720
// grid (e.g. thread-3 sits at x 540 y 210 on the 'Pro $49' stat).

interface Comment {
  id: string;
  author: string;
  ts: string; // fixed ISO timestamp
  body: string;
}

interface Thread {
  id: string;
  slideIndex: number; // 0-based
  x: number; // canvas units — shape anchor
  y: number;
  root: Comment;
  replies: Comment[];
}

const THREADS: Thread[] = [
  {
    id: 'thread-1',
    slideIndex: 1, // 'Current pricing' — the annual-discount bullet
    x: 690,
    y: 400,
    root: {
      id: 'thread-1-root',
      author: 'Maya Chen',
      ts: '2026-06-28T15:12:00Z',
      body: '@Priya can we footnote the annual discount here? "Grandfathered accounts only" reads ambiguous without the cutoff date.',
    },
    replies: [
      {
        id: 'thread-1-reply-1',
        author: 'Priya Nair',
        ts: '2026-06-29T08:05:00Z',
        body: 'Good catch — adding a footnote with the Jan 2025 cutoff in v15. @Maya will tag you on the revision.',
      },
    ],
  },
  {
    id: 'thread-2',
    slideIndex: 1, // 'Current pricing' — the Pro bullet (starts resolved)
    x: 96,
    y: 268,
    root: {
      id: 'thread-2-root',
      author: 'Jordan Ellis',
      ts: '2026-06-28T16:40:00Z',
      body: 'Seat count is stale — Pro moved from 10 to 12 seats in May. Fix before this goes to the pricing council.',
    },
    replies: [],
  },
  {
    id: 'thread-3',
    slideIndex: 2, // 'Proposed tiers' — the 'Pro $49' stat
    x: 540,
    y: 210,
    root: {
      id: 'thread-3-root',
      author: 'Sam Okafor',
      ts: '2026-06-29T10:22:00Z',
      body: 'Pro at $49 is a 26% jump. @Jordan do we have churn modeling for existing Pro seats, or is this the flat-elasticity assumption?',
    },
    replies: [
      {
        id: 'thread-3-reply-1',
        author: 'Jordan Ellis',
        ts: '2026-06-29T14:48:00Z',
        body: 'Cohort model says under 2% incremental churn at $49. Linking the workbook in the appendix slide.',
      },
    ],
  },
  {
    id: 'thread-4',
    slideIndex: 2, // 'Proposed tiers' — the 'Scale $129' stat
    x: 760,
    y: 250,
    root: {
      id: 'thread-4-root',
      author: 'Priya Nair',
      ts: '2026-06-29T11:03:00Z',
      body: 'Scale caption must read "per workspace", never "per seat" — legal flagged the ambiguity in the last refresh.',
    },
    replies: [],
  },
  {
    id: 'thread-5',
    slideIndex: 3, // 'Migration plan' — the banner milestone bullet
    x: 110,
    y: 300,
    root: {
      id: 'thread-5-root',
      author: 'Maya Chen',
      ts: '2026-06-29T17:30:00Z',
      body: 'The Aug 1 banner milestone feels tight. @Sam can support absorb the ticket volume in a single quarter?',
    },
    replies: [],
  },
  {
    id: 'thread-6',
    slideIndex: 4, // 'Revenue impact' — the image placeholder (starts resolved)
    x: 480,
    y: 400,
    root: {
      id: 'thread-6-root',
      author: 'Jordan Ellis',
      ts: '2026-06-30T08:15:00Z',
      body: 'Swap impact-model.png for the v3 export — this one still shows the Q1 baseline, not the refreshed cohort.',
    },
    replies: [],
  },
  {
    id: 'thread-7',
    slideIndex: 5, // 'Decision needed' — the headline
    x: 480,
    y: 268,
    root: {
      id: 'thread-7-root',
      author: 'Sam Okafor',
      ts: '2026-06-30T09:41:00Z',
      body: '@Priya do we need a fallback date here if the pricing council pushes past July 10?',
    },
    replies: [],
  },
];

const INITIALLY_RESOLVED = ['thread-2', 'thread-6'];
const INITIAL_SLIDE_INDEX = 2; // 'Proposed tiers'
const INITIAL_THREAD_ID = 'thread-3';

type CommentFilter = 'all' | 'open' | 'resolved';

// ============= @MENTION RENDERING =============

/**
 * Splits a comment body on @mentions and renders each mention as an accent
 * Token so names read as entities, not prose.
 */
function renderBody(body: string): ReactNode[] {
  return body.split(/(@[A-Za-z]+)/g).map((part, index) =>
    part.startsWith('@') ? (
      <Token
        key={\`mention-\${index}\`}
        label={part}
        size="sm"
        color="blue"
        description={\`Mention of \${part.slice(1)}\`}
      />
    ) : (
      <span key={\`text-\${index}\`}>{part}</span>
    ),
  );
}

// ============= SLIDE CANVAS =============

function frameStyle(shape: ShapeFrame): CSSProperties {
  return {
    position: 'absolute',
    left: pctX(shape.x),
    top: pctY(shape.y),
    width: pctX(shape.w),
    ...(shape.h != null ? {height: pctY(shape.h)} : null),
  };
}

/** One positioned shape; all type sizes are cqw so miniatures scale. */
function ShapeView({shape}: {shape: SlideShape}) {
  switch (shape.kind) {
    case 'text':
      return (
        <div
          style={{
            ...frameStyle(shape),
            fontSize: cqw(shape.size),
            fontWeight: shape.weight ?? 400,
            color: TEXT_COLOR[shape.color ?? 'default'],
            lineHeight: 1.2,
            letterSpacing: shape.size >= 40 ? '-0.015em' : undefined,
            textAlign: shape.align ?? 'left',
          }}>
          {shape.text}
        </div>
      );
    case 'bullets':
      return (
        <div
          style={{
            ...frameStyle(shape),
            display: 'flex',
            flexDirection: 'column',
            gap: cqw(shape.size * 0.75),
            fontSize: cqw(shape.size),
            lineHeight: 1.3,
          }}>
          {shape.items.map(item => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: cqw(shape.size * 0.55),
              }}>
              <span
                aria-hidden
                style={{
                  width: cqw(shape.size * 0.34),
                  height: cqw(shape.size * 0.34),
                  marginTop: cqw(shape.size * 0.42),
                  borderRadius: '50%',
                  backgroundColor: SLIDE_ACCENT,
                  flexShrink: 0,
                }}
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      );
    case 'image':
      return (
        <div
          style={{
            ...frameStyle(shape),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: cqw(10),
            backgroundColor: SLIDE_PLACEHOLDER_BG,
            border: \`\${cqw(2)} dashed \${SLIDE_PLACEHOLDER_BORDER}\`,
            borderRadius: cqw(10),
          }}>
          <span
            style={{
              fontSize: cqw(14),
              letterSpacing: '0.18em',
              color: SLIDE_FAINT,
            }}>
            IMAGE PLACEHOLDER
          </span>
          <span
            style={{
              fontSize: cqw(20),
              fontFamily: 'var(--font-family-code, monospace)',
              color: SLIDE_MUTED,
            }}>
            {shape.label}
          </span>
        </div>
      );
    case 'stat':
      return (
        <div
          style={{
            ...frameStyle(shape),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: cqw(6),
            paddingInline: cqw(24),
            backgroundColor: SLIDE_ACCENT_SOFT,
            borderRadius: cqw(12),
          }}>
          <span
            style={{
              fontSize: cqw(36),
              fontWeight: 700,
              color: SLIDE_ACCENT,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1,
            }}>
            {shape.value}
          </span>
          <span style={{fontSize: cqw(16), color: SLIDE_MUTED}}>
            {shape.caption}
          </span>
        </div>
      );
    case 'bar':
      return (
        <div
          aria-hidden
          style={{
            ...frameStyle(shape),
            backgroundColor: SLIDE_ACCENT,
            borderRadius: cqw(4),
          }}
        />
      );
  }
}

/**
 * The slide surface. One render path for both the stage and the rail:
 * positions are percentages of the canvas and font sizes are cqw, so the
 * identical fixture paints at 96px and 800px.
 */
function SlideCanvas({slide}: {slide: Slide}) {
  return (
    <div style={styles.canvas}>
      {slide.shapes.map((shape, index) => (
        <ShapeView key={\`\${slide.id}-shape-\${index}\`} shape={shape} />
      ))}
    </div>
  );
}

// ============= COMMENT MARKER =============

function CommentMarker({
  thread,
  number,
  isResolved,
  isActive,
  hasTouchTarget,
  onSelect,
}: {
  thread: Thread;
  number: number;
  isResolved: boolean;
  isActive: boolean;
  hasTouchTarget: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <Tooltip
      content={\`\${thread.root.author}\${isResolved ? ' · resolved' : ''} — \${
        thread.root.body.length > 48
          ? \`\${thread.root.body.slice(0, 48)}…\`
          : thread.root.body
      }\`}>
      <button
        type="button"
        aria-label={\`Comment \${number} by \${thread.root.author}\${
          isResolved ? ' (resolved)' : ''
        }\`}
        onClick={() => onSelect(thread.id)}
        style={{
          ...styles.marker,
          ...(hasTouchTarget ? styles.markerTouch : null),
          left: pctX(thread.x),
          top: pctY(thread.y),
        }}>
        <span
          style={{
            ...styles.markerDot,
            backgroundColor: isResolved
              ? 'var(--color-accent-muted)'
              : 'var(--color-accent)',
            color: isResolved
              ? 'var(--color-accent)'
              : 'var(--color-on-accent)',
            outline: isActive ? '2px solid var(--color-accent)' : 'none',
            outlineOffset: 2,
          }}>
          {isResolved ? (
            <Icon icon={CheckIcon} size="xsm" color="inherit" />
          ) : (
            number
          )}
        </span>
      </button>
    </Tooltip>
  );
}

// ============= THUMBNAIL TILE =============

function ThumbnailTile({
  slide,
  index,
  openCount,
  isActive,
  onSelect,
  isStrip,
}: {
  slide: Slide;
  index: number;
  openCount: number;
  isActive: boolean;
  onSelect: (index: number) => void;
  isStrip: boolean;
}) {
  return (
    <Tooltip
      content={\`Slide \${index + 1} · \${slide.title}\${
        openCount > 0
          ? \` · \${openCount} open \${openCount === 1 ? 'comment' : 'comments'}\`
          : ''
      }\`}>
      <VStack gap={1} style={isStrip ? styles.stripTile : undefined}>
        <div style={styles.tileAnchor}>
          <SelectableCard
            label={\`Go to slide \${index + 1}: \${slide.title}\`}
            isSelected={isActive}
            onChange={() => onSelect(index)}
            padding={0.5}>
            <AspectRatio ratio={4 / 3}>
              <SlideCanvas slide={slide} />
            </AspectRatio>
          </SelectableCard>
          {/* Open-comment count pinned top-right; hidden at zero. */}
          {openCount > 0 && (
            <span style={styles.tileBadge}>
              <Badge label={String(openCount)} variant="info" />
            </span>
          )}
        </div>
        <HStack hAlign="center">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {index + 1}
          </Text>
        </HStack>
      </VStack>
    </Tooltip>
  );
}

// ============= THREAD CARD =============

function ThreadCard({
  thread,
  number,
  replies,
  isResolved,
  isActive,
  draft,
  onActivate,
  onToggleResolved,
  onDraftChange,
  onSend,
  cardRef,
}: {
  thread: Thread;
  number: number;
  replies: Comment[];
  isResolved: boolean;
  isActive: boolean;
  draft: string;
  onActivate: (id: string) => void;
  onToggleResolved: (id: string) => void;
  onDraftChange: (id: string, value: string) => void;
  onSend: (id: string) => void;
  cardRef: (node: HTMLDivElement | null) => void;
}) {
  // Resolved threads collapse to one summary line with a Reopen Button.
  if (isResolved) {
    return (
      <div ref={cardRef}>
        <Card
          padding={3}
          style={{
            cursor: 'pointer',
            boxShadow: isActive
              ? '0 0 0 2px var(--color-accent)'
              : undefined,
          }}
          onClick={() => onActivate(thread.id)}>
          <HStack gap={2} vAlign="center">
            <Icon icon={CheckIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text type="supporting" color="secondary" maxLines={1}>
                #{number} · {thread.root.author} — {thread.root.body}
              </Text>
            </StackItem>
            <Button
              label="Reopen"
              variant="ghost"
              size="sm"
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              onClick={() => onToggleResolved(thread.id)}
            />
          </HStack>
        </Card>
      </div>
    );
  }

  const canSend = draft.trim().length > 0;

  return (
    <div ref={cardRef}>
      <Card
        padding={3}
        style={{
          cursor: 'pointer',
          boxShadow: isActive ? '0 0 0 2px var(--color-accent)' : undefined,
        }}
        onClick={() => onActivate(thread.id)}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Avatar name={thread.root.author} size="xsmall" />
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Text type="body" weight="bold">
                  {thread.root.author}
                </Text>
                <Timestamp value={thread.root.ts} format="date_time" />
              </HStack>
            </StackItem>
            <Badge label={\`#\${number}\`} variant="info" />
          </HStack>

          <Text type="body" style={styles.threadBody}>
            {renderBody(thread.root.body)}
          </Text>

          {replies.length > 0 && (
            <VStack gap={2} style={styles.replyIndent}>
              {replies.map(reply => (
                <VStack key={reply.id} gap={1}>
                  <HStack gap={2} vAlign="center">
                    <Avatar name={reply.author} size="xsmall" />
                    <Text type="supporting" weight="bold">
                      {reply.author}
                    </Text>
                    <Timestamp value={reply.ts} format="date_time" />
                  </HStack>
                  <Text type="supporting" style={styles.threadBody}>
                    {renderBody(reply.body)}
                  </Text>
                </VStack>
              ))}
            </VStack>
          )}

          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {replies.length}{' '}
                {replies.length === 1 ? 'reply' : 'replies'}
              </Text>
            </StackItem>
            <Button
              label="Resolve"
              variant="ghost"
              size="sm"
              icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
              onClick={() => onToggleResolved(thread.id)}
            />
          </HStack>

          {/* Reply composer only on the active thread. */}
          {isActive && (
            <>
              <Divider />
              <VStack gap={2}>
                <TextArea
                  label={\`Reply to \${thread.root.author}\`}
                  isLabelHidden
                  placeholder="Reply — use @ to mention"
                  rows={2}
                  value={draft}
                  onChange={value => onDraftChange(thread.id, value)}
                />
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <Text type="supporting" color="secondary">
                      Replying as {CURRENT_REVIEWER}
                    </Text>
                  </StackItem>
                  <Button
                    label="Send"
                    variant="primary"
                    size="sm"
                    icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                    isDisabled={!canSend}
                    onClick={() => onSend(thread.id)}
                  />
                </HStack>
              </VStack>
            </>
          )}
        </VStack>
      </Card>
    </div>
  );
}

// ============= PAGE =============

export default function DeckReviewCommentsTemplate() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(INITIAL_SLIDE_INDEX);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    INITIAL_THREAD_ID,
  );
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(
    () => new Set(INITIALLY_RESOLVED),
  );
  const [filter, setFilter] = useState<CommentFilter>('all');
  // Per-thread reply drafts and appended replies, keyed by thread id.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [repliesById, setRepliesById] = useState<Record<string, Comment[]>>(
    () => Object.fromEntries(THREADS.map(t => [t.id, t.replies])),
  );

  const threadRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Responsive contract: <=1024px the rail becomes a strip; <=768px the
  // thread panel stacks below the stage.
  const isRailStrip = useMediaQuery('(max-width: 1024px)');
  const isPanelStacked = useMediaQuery('(max-width: 768px)');

  // ---- derived state ----
  const activeSlide = SLIDES[activeSlideIndex];
  // Threads for the active slide, numbered in fixture order per slide.
  const slideThreads = THREADS.filter(t => t.slideIndex === activeSlideIndex);
  const visibleThreads = slideThreads.filter(t =>
    filter === 'all'
      ? true
      : filter === 'open'
        ? !resolvedIds.has(t.id)
        : resolvedIds.has(t.id),
  );

  const openCountForSlide = (index: number) =>
    THREADS.filter(t => t.slideIndex === index && !resolvedIds.has(t.id))
      .length;

  const totalOpen = THREADS.filter(t => !resolvedIds.has(t.id)).length;
  const totalResolved = THREADS.length - totalOpen;

  // ---- interactions ----
  /** Marker click: highlight the thread and scroll its card into view. */
  const selectFromMarker = (id: string) => {
    setActiveThreadId(id);
    threadRefs.current[id]?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  };

  const toggleResolved = (id: string) => {
    setResolvedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setActiveThreadId(id);
  };

  const setDraft = (id: string, value: string) => {
    setDrafts(prev => ({...prev, [id]: value}));
  };

  /** Send appends a reply with the fixed literal timestamp, clears the draft. */
  const sendReply = (id: string) => {
    const body = (drafts[id] ?? '').trim();
    if (body.length === 0) {
      return;
    }
    setRepliesById(prev => ({
      ...prev,
      [id]: [
        ...prev[id],
        {
          id: \`\${id}-reply-\${prev[id].length + 1}\`,
          author: CURRENT_REVIEWER,
          ts: REPLY_TIMESTAMP,
          body,
        },
      ],
    }));
    setDrafts(prev => ({...prev, [id]: ''}));
  };

  const goToSlide = (index: number) => {
    setActiveSlideIndex(index);
    // Land on the first thread of the new slide so the panel and markers
    // stay in sync with the stage.
    const first = THREADS.find(t => t.slideIndex === index);
    setActiveThreadId(first?.id ?? null);
  };

  // ---- rail ----
  const tiles = SLIDES.map((slide, index) => (
    <ThumbnailTile
      key={slide.id}
      slide={slide}
      index={index}
      openCount={openCountForSlide(index)}
      isActive={index === activeSlideIndex}
      onSelect={goToSlide}
      isStrip={isRailStrip}
    />
  ));

  // ---- stage ----
  const stage = (
    <div style={styles.stageBackdrop}>
      <div style={styles.stageColumn}>
        <VStack gap={2}>
          <Card padding={0} style={styles.stageCard}>
            <AspectRatio ratio={4 / 3}>
              <div style={styles.markerHost}>
                <SlideCanvas slide={activeSlide} />
                {slideThreads.map((thread, index) => (
                  <CommentMarker
                    key={thread.id}
                    thread={thread}
                    number={index + 1}
                    isResolved={resolvedIds.has(thread.id)}
                    isActive={thread.id === activeThreadId}
                    hasTouchTarget={isPanelStacked}
                    onSelect={selectFromMarker}
                  />
                ))}
              </div>
            </AspectRatio>
          </Card>
          <HStack gap={1} vAlign="center" hAlign="center">
            <IconButton
              label="Previous slide"
              tooltip="Previous slide"
              icon={<Icon icon="chevronLeft" size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              isDisabled={activeSlideIndex === 0}
              onClick={() => goToSlide(activeSlideIndex - 1)}
            />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Slide {activeSlideIndex + 1} of {SLIDE_COUNT} ·{' '}
              {activeSlide.title} · {slideThreads.length}{' '}
              {slideThreads.length === 1 ? 'thread' : 'threads'} (
              {openCountForSlide(activeSlideIndex)} open)
            </Text>
            <IconButton
              label="Next slide"
              tooltip="Next slide"
              icon={<Icon icon="chevronRight" size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              isDisabled={activeSlideIndex === SLIDE_COUNT - 1}
              onClick={() => goToSlide(activeSlideIndex + 1)}
            />
          </HStack>
        </VStack>
      </div>
    </div>
  );

  // ---- thread panel ----
  const emptyMessage =
    filter === 'resolved'
      ? 'No resolved comments on this slide'
      : filter === 'open'
        ? 'No open comments on this slide'
        : 'No comments on this slide';

  const threadList = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={2}>Comments</Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {totalOpen} open · {totalResolved} resolved
        </Text>
      </HStack>
      {visibleThreads.length === 0 ? (
        <EmptyState
          icon={<Icon icon={MessageSquareTextIcon} size="lg" />}
          title={emptyMessage}
          description="Switch the filter or pick another slide to keep reviewing."
          isCompact
        />
      ) : (
        visibleThreads.map(thread => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            number={slideThreads.indexOf(thread) + 1}
            replies={repliesById[thread.id]}
            isResolved={resolvedIds.has(thread.id)}
            isActive={thread.id === activeThreadId}
            draft={drafts[thread.id] ?? ''}
            onActivate={setActiveThreadId}
            onToggleResolved={toggleResolved}
            onDraftChange={setDraft}
            onSend={sendReply}
            cardRef={node => {
              threadRefs.current[thread.id] = node;
            }}
          />
        ))
      )}
    </VStack>
  );

  // ---- header ----
  const filterControl = (
    <SegmentedControl
      label="Filter comments"
      value={filter}
      onChange={value => setFilter(value as CommentFilter)}
      size="sm">
      <SegmentedControlItem value="all" label="All" />
      <SegmentedControlItem value="open" label="Open" />
      <SegmentedControlItem value="resolved" label="Resolved" />
    </SegmentedControl>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Icon icon={PresentationIcon} size="md" color="secondary" />
                <Heading level={1}>{DECK_FILE_NAME}</Heading>
                {!isPanelStacked && (
                  <Text type="supporting" color="secondary">
                    {VERSION_NOTE}
                  </Text>
                )}
                <Badge label="In review" variant="info" />
              </HStack>
            </StackItem>
            {filterControl}
          </HStack>
        </LayoutHeader>
      }
      start={
        isRailStrip ? undefined : (
          <LayoutPanel width={112} padding={0} label="Slide thumbnails">
            <div style={styles.railScroll}>
              <VStack gap={3}>{tiles}</VStack>
            </div>
          </LayoutPanel>
        )
      }
      end={
        isPanelStacked ? undefined : (
          <LayoutPanel width={340} padding={0} label="Comment threads">
            <div style={styles.panelScroll}>{threadList}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          {/* When the thread panel stacks below the stage the column flows at
              natural height and LayoutContent scrolls the whole page; the
              height-locked fill frame would otherwise crush the stage to make
              room for the thread list. */}
          <VStack gap={0} style={isPanelStacked ? undefined : styles.fill}>
            {isRailStrip && (
              <>
                <div style={styles.stripScroll}>
                  <HStack gap={2}>{tiles}</HStack>
                </div>
                <Divider />
              </>
            )}
            <StackItem
              size="fill"
              style={isPanelStacked ? undefined : styles.fill}>
              {stage}
            </StackItem>
            {isPanelStacked && (
              <>
                <Divider />
                <div style={styles.panelStacked}>{threadList}</div>
              </>
            )}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};