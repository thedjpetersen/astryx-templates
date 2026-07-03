// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one deck — 'series-b-pitch.pptx' with 8
 *   slides as positioned SlideShape records on a 960x720 canvas grid: title
 *   slide, traction bullets, market stats, a product-demo image placeholder,
 *   unit-economics stat callouts, team, the ask, thank-you — plus a 2–4
 *   sentence speakerNotes string per slide; elapsed '12:47' and 'Started
 *   14:05' are literal strings, no ticking clock)
 * @output Presenter/speaker console for a live talk: a header status bar
 *   (pulsing StatusDot + 'Presenting · Room 4A' that flips to 'Paused' via a
 *   pause/resume ToggleButton, deck filename, a fixed elapsed-timer chip
 *   '12:47' in tabular numerals with a 'Started 14:05' Tooltip, and a
 *   'Slide 3 of 8' Badge), a dark console body with the large current slide on
 *   a white 4:3 paper Card (~62%) and a fixed 360px right column stacking a
 *   smaller muted 'NEXT' preview (renders slide n+1, or an 'End of deck'
 *   EmptyState paper on the last slide), a scrollable speaker-notes panel with
 *   A−/A+ font-size steps, and a Kbd shortcut row ('→ Next', '← Prev',
 *   'G Grid'); a footer control strip holds big Previous/Next Buttons that
 *   disable at the deck ends, a centered 'Slide x of 8' counter, and a
 *   LayoutGridIcon IconButton that opens a slide-jump Dialog of 8 numbered
 *   SelectableCard mini thumbnails (the current slide carries a CheckIcon
 *   Badge; choosing a tile jumps and closes)
 * @position Page template; emitted by `astryx template slide-presenter-view`
 *
 * Frame: Layout height="fill". LayoutHeader carries the presenting status
 * chrome (StatusDot + room label, deck name, elapsed chip, pause ToggleButton,
 * counter Badge). LayoutContent (padding 0) is the dark-console main region
 * (stage left ~62% fill + 360px right rack) and scrolls internally;
 * LayoutFooter (hasDivider) is the footer control strip with the big pager
 * Buttons and the jump-grid trigger. Choose over slide-deck-viewer when the
 * surface is the SPEAKER's two-slide + notes cockpit (next preview, timer,
 * jump grid), not an audience-style single document stage; choose over
 * slide-editor-canvas when nothing on the slide is editable.
 *
 * Responsive contract:
 * - >900px: header | dark console (stage fill + right rack 360 fixed) |
 *   footer strip. Only the console region scrolls when the viewport is short.
 * - <=900px: the right rack drops below the stage as a horizontal pair —
 *   next preview and notes side by side, Kbd hints underneath.
 * - <=600px: the pair stacks vertically; the footer Buttons keep their big
 *   36px hit targets at every width and the header slims to fit a 375px
 *   viewport — it drops the deck filename and the counter Badge (the footer
 *   keeps the 'Slide x of 8' counter), the pause ToggleButton goes icon-only,
 *   and the status heading truncates to one line instead of pushing the
 *   timer chip off the edge.
 * - Slide canvases use container-query (cqw) type sizing, so the identical
 *   shape fixtures paint correctly at jump-grid thumbnail size, the 360px
 *   next preview, and the full stage.
 *
 * Container policy (speaker-console archetype): the page chrome is
 * frame-first rows; the console region is "backstage glass" — literal dark
 * colors locked with colorScheme:'dark' so it reads identically in light
 * mode — while the slide surfaces stay white paper (colorScheme:'light')
 * exactly like the audience-facing projector output.
 */

import {useState, type CSSProperties} from 'react';

import {
  AArrowDownIcon,
  AArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutGridIcon,
  PauseIcon,
  PlayIcon,
  PresentationIcon,
  StickyNoteIcon,
  TimerIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= CONSOLE PAINT CONSTANTS =============
// The console chrome is "backstage glass": literal dark colors locked with
// colorScheme:'dark' so the cockpit looks identical in light mode. Slide
// surfaces stay white paper (colorScheme:'light') like projector output.

const CONSOLE_BG = '#0F141D';
const CONSOLE_PANEL = '#161E2B';
const CONSOLE_BORDER = 'rgba(148, 163, 184, 0.22)';
const CONSOLE_TEXT = '#E6EBF2';
const CONSOLE_MUTED = '#94A0B4';
const CONSOLE_FAINT = '#66738A';

// Slide paper palette (mirrors the projector output).
const SLIDE_TEXT = '#1C2733';
const SLIDE_MUTED = '#6E7D8B';
const SLIDE_ACCENT = '#0B5FAE';
const SLIDE_ACCENT_SOFT = '#E8F1FA';
const SLIDE_PLACEHOLDER_BG = '#EEF2F6';
const SLIDE_PLACEHOLDER_BORDER = '#C4CFD9';

// Canvas grid: classic 4:3 PowerPoint page, 960x720 virtual units.
const CANVAS_W = 960;
const CANVAS_H = 720;

/** Horizontal canvas unit -> percentage of slide width. */
const pctX = (v: number) => `${((v / CANVAS_W) * 100).toFixed(3)}%`;
/** Vertical canvas unit -> percentage of slide height. */
const pctY = (v: number) => `${((v / CANVAS_H) * 100).toFixed(3)}%`;
/**
 * Canvas px -> container-query width units. The canvas div is a container
 * (inline-size), so 1cqw = 1% of the rendered slide width; the same fixture
 * paints the full stage, the 360px next preview, and the jump-grid tiles.
 */
const cqw = (v: number) => `${((v / CANVAS_W) * 100).toFixed(3)}cqw`;

// Speaker-notes zoom: three fixed steps driven by the A−/A+ buttons.
const NOTES_FONT_STEPS = [13, 15, 18];
const INITIAL_NOTES_STEP = 1;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Dark console region between header and footer strip. LayoutContent owns
  // the scrolling; minHeight 100% makes the backstage glass own the fold.
  consoleScroll: {
    minHeight: '100%',
    boxSizing: 'border-box',
    backgroundColor: CONSOLE_BG,
    colorScheme: 'dark',
    padding: 'var(--spacing-4)',
  },
  stageColumn: {minWidth: 0},
  rackColumn: {width: 360, flexShrink: 0},
  // The slide papers cast real shadow on the dark console.
  paperCard: {
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
  },
  nextCard: {
    boxShadow: 'var(--shadow-med)',
    overflow: 'hidden',
    // The next slide is backstage-only: dimmed so the eye stays on "now".
    opacity: 0.82,
  },
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
  // "End of deck" paper behind the EmptyState on the last slide.
  endPaper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    colorScheme: 'light',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-3)',
  },
  // Console typography (literal colors — the region is backstage glass).
  consoleLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: CONSOLE_FAINT,
  },
  stageCaption: {
    fontSize: 13,
    color: CONSOLE_TEXT,
    fontVariantNumeric: 'tabular-nums',
  },
  stageCaptionMuted: {
    fontSize: 13,
    color: CONSOLE_MUTED,
    fontVariantNumeric: 'tabular-nums',
  },
  // Elapsed chip in the header: mono, tabular, dark in both themes.
  timerChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 6,
    backgroundColor: '#101724',
    border: `1px solid ${CONSOLE_BORDER}`,
    color: CONSOLE_TEXT,
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    colorScheme: 'dark',
  },
  // Speaker-notes panel: dark card with its own scroll and zoomable body.
  notesPanel: {
    backgroundColor: CONSOLE_PANEL,
    border: `1px solid ${CONSOLE_BORDER}`,
    color: CONSOLE_TEXT,
  },
  notesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: `1px solid ${CONSOLE_BORDER}`,
    color: CONSOLE_TEXT,
  },
  notesBody: {
    padding: 'var(--spacing-3)',
    maxHeight: 236,
    overflowY: 'auto',
    lineHeight: 1.65,
    color: CONSOLE_TEXT,
  },
  kbdHintLabel: {fontSize: 12, color: CONSOLE_MUTED},
  jumpTileTitle: {minWidth: 0},
  // Lets the status heading shrink/truncate so the header's fixed chrome
  // (timer chip, pause toggle) never pushes past a 375px viewport.
  headerTitle: {minWidth: 0},
};

// ============= DATA =============
// Deterministic fixtures: fixed shape geometry on a 960x720 grid, literal
// timestamps ('12:47' elapsed, 'Started 14:05'). No clocks, no randomness,
// no network assets.

const DECK_FILE_NAME = 'series-b-pitch.pptx';
const ROOM_LABEL = 'Room 4A';
const ELAPSED_LABEL = '12:47';
const STARTED_LABEL = 'Started 14:05';
const INITIAL_SLIDE_INDEX = 2; // "Slide 3 of 8"

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
  speakerNotes: string;
  shapes: SlideShape[];
}

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    title: 'Northwind Robotics — Series B',
    speakerNotes:
      'Open with the fleet montage line: eleven robots, one aisle, zero ' +
      'humans in frame. Keep it under thirty seconds — this room has already ' +
      'seen the teaser reel.',
    shapes: [
      {kind: 'bar', x: 120, y: 240, w: 72, h: 10},
      {
        kind: 'text',
        x: 120,
        y: 276,
        w: 720,
        text: 'Northwind Robotics',
        size: 56,
        weight: 700,
      },
      {
        kind: 'text',
        x: 120,
        y: 360,
        w: 720,
        text: 'Series B — warehouse automation that pays for itself',
        size: 26,
        color: 'muted',
      },
      {
        kind: 'text',
        x: 120,
        y: 430,
        w: 720,
        text: 'June 2026 · Confidential',
        size: 18,
        color: 'accent',
      },
    ],
  },
  {
    id: 'slide-2',
    title: 'Traction',
    speakerNotes:
      'Lead with the 3.1× — it is the fastest line in the deck. If Marcus ' +
      'asks about churn, the honest answer is one near-miss in Q4 that ' +
      'renewed at a higher tier. Do not volunteer it otherwise.',
    shapes: [
      {kind: 'text', x: 80, y: 70, w: 800, text: 'Traction', size: 42, weight: 700},
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {
        kind: 'bullets',
        x: 80,
        y: 210,
        w: 460,
        size: 26,
        items: [
          'ARR $6.4M — 3.1× YoY',
          '41 warehouses live, 12 customers',
          'Zero logo churn since Q3 2025',
        ],
      },
      {kind: 'stat', x: 580, y: 210, w: 300, h: 150, value: '3.1×', caption: 'ARR growth, YoY'},
      {
        kind: 'stat',
        x: 580,
        y: 390,
        w: 300,
        h: 150,
        value: '41',
        caption: 'warehouses in production',
      },
    ],
  },
  {
    id: 'slide-3',
    title: 'Market',
    speakerNotes:
      'Do not read the TAM number off the slide. Anchor on the 41 live ' +
      'warehouses instead and let the market math feel conservative. The ' +
      'wedge story is mid-mile, not last-mile.',
    shapes: [
      {kind: 'text', x: 80, y: 70, w: 800, text: 'Market', size: 42, weight: 700},
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {
        kind: 'bullets',
        x: 80,
        y: 210,
        w: 440,
        size: 26,
        items: [
          'Mid-mile automation is the wedge',
          '68,000 candidate facilities in NA + EU',
          'Labor gap widens 6% per year',
        ],
      },
      {kind: 'stat', x: 560, y: 210, w: 320, h: 150, value: '$6.8B', caption: 'serviceable market, 2027'},
      {kind: 'stat', x: 560, y: 390, w: 320, h: 150, value: '11%', caption: 'CAGR, mid-mile automation'},
    ],
  },
  {
    id: 'slide-4',
    title: 'Product demo',
    speakerNotes:
      'This is a placeholder for the live pick-cell demo. If the video ' +
      'stalls, describe the two-minute cycle from memory and move on — never ' +
      'restart the file in front of the room.',
    shapes: [
      {
        kind: 'text',
        x: 80,
        y: 70,
        w: 800,
        text: 'Product demo',
        size: 42,
        weight: 700,
      },
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {kind: 'image', x: 80, y: 180, w: 800, h: 450, label: 'pick-cell-demo.mp4'},
    ],
  },
  {
    id: 'slide-5',
    title: 'Unit economics',
    speakerNotes:
      'Pause here. CAC payback moved from 19 to 11 months — credit the ' +
      'self-serve funnel, then hand off to Dana.',
    shapes: [
      {
        kind: 'text',
        x: 80,
        y: 70,
        w: 800,
        text: 'Unit economics',
        size: 42,
        weight: 700,
      },
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {kind: 'stat', x: 80, y: 220, w: 250, h: 160, value: '11 mo', caption: 'CAC payback (was 19)'},
      {kind: 'stat', x: 355, y: 220, w: 250, h: 160, value: '61%', caption: 'blended gross margin'},
      {kind: 'stat', x: 630, y: 220, w: 250, h: 160, value: '128%', caption: 'net revenue retention'},
      {
        kind: 'bullets',
        x: 80,
        y: 440,
        w: 800,
        size: 24,
        items: [
          'Hardware amortizes in 14 months at current duty cycle',
          'Self-serve funnel now sources 44% of qualified pipeline',
        ],
      },
    ],
  },
  {
    id: 'slide-6',
    title: 'Team',
    speakerNotes:
      'Introduce Dana and Tomás by name; both are in the room. Mention the ' +
      'Kiva exit only if asked about acquisition history.',
    shapes: [
      {kind: 'text', x: 80, y: 70, w: 800, text: 'Team', size: 42, weight: 700},
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {
        kind: 'bullets',
        x: 80,
        y: 210,
        w: 780,
        size: 26,
        items: [
          'Priya Shah — CEO, ex-Kiva Systems',
          'Dana Whitfield — CFO, ex-Flexport',
          'Tomás Rivera — VP Engineering, ex-Zoox',
          '38 FTE · 24 in engineering',
        ],
      },
    ],
  },
  {
    id: 'slide-7',
    title: 'The ask — $18M',
    speakerNotes:
      'State the number plainly and stop talking. The use-of-funds split is ' +
      'deliberately boring — the story is the payback curve two slides back. ' +
      'Let the silence do the work.',
    shapes: [
      {
        kind: 'text',
        x: 80,
        y: 70,
        w: 800,
        text: 'The ask — $18M',
        size: 42,
        weight: 700,
      },
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {
        kind: 'bullets',
        x: 80,
        y: 210,
        w: 440,
        size: 26,
        items: [
          '60% engineering & robotics',
          '25% go-to-market',
          '15% working capital',
        ],
      },
      {kind: 'stat', x: 560, y: 230, w: 320, h: 170, value: '$18M', caption: '24 months of runway'},
    ],
  },
  {
    id: 'slide-8',
    title: 'Thank you',
    speakerNotes:
      'Thank the partners by name, then point to the data-room link in the ' +
      'follow-up email. Questions usually start with the demo — be ready to ' +
      'jump back to slide 4 from the grid.',
    shapes: [
      {
        kind: 'text',
        x: 120,
        y: 292,
        w: 720,
        text: 'Thank you',
        size: 56,
        weight: 700,
        align: 'center',
      },
      {
        kind: 'text',
        x: 120,
        y: 392,
        w: 720,
        text: 'priya@northwindrobotics.example',
        size: 26,
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

/** One positioned shape; all type sizes are cqw so every scale reads. */
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
            border: `${cqw(2)} dashed ${SLIDE_PLACEHOLDER_BORDER}`,
            borderRadius: cqw(10),
          }}>
          <span
            style={{
              fontSize: cqw(14),
              letterSpacing: '0.18em',
              color: SLIDE_MUTED,
            }}>
            VIDEO PLACEHOLDER
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
              fontSize: cqw(44),
              fontWeight: 700,
              color: SLIDE_ACCENT,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1,
            }}>
            {shape.value}
          </span>
          <span style={{fontSize: cqw(17), color: SLIDE_MUTED}}>
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
 * The slide surface. One render path for the stage, the next preview, and
 * the jump-grid tiles: positions are percentages of the canvas and font
 * sizes are cqw, so the identical fixture paints at every width.
 */
function SlideCanvas({slide}: {slide: Slide}) {
  return (
    <div style={styles.canvas}>
      {slide.shapes.map((shape, index) => (
        <ShapeView key={`${slide.id}-shape-${index}`} shape={shape} />
      ))}
    </div>
  );
}

// ============= PAGE =============

export default function SlidePresenterViewTemplate() {
  const [currentIndex, setCurrentIndex] = useState(INITIAL_SLIDE_INDEX);
  const [isPaused, setIsPaused] = useState(false);
  // Speaker-notes zoom: index into NOTES_FONT_STEPS, A−/A+ disable at ends.
  const [notesStep, setNotesStep] = useState(INITIAL_NOTES_STEP);
  const [isJumpGridOpen, setIsJumpGridOpen] = useState(false);

  // Responsive contract: <=900px the rack drops below the stage as a
  // horizontal pair; <=600px the pair stacks.
  const isStacked = useMediaQuery('(max-width: 900px)');
  const isNarrow = useMediaQuery('(max-width: 600px)');

  const currentSlide = SLIDES[currentIndex];
  const nextSlide =
    currentIndex + 1 < SLIDE_COUNT ? SLIDES[currentIndex + 1] : null;
  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex === SLIDE_COUNT - 1;
  const counterLabel = `Slide ${currentIndex + 1} of ${SLIDE_COUNT}`;

  const goPrev = () => setCurrentIndex(prev => Math.max(0, prev - 1));
  const goNext = () =>
    setCurrentIndex(prev => Math.min(SLIDE_COUNT - 1, prev + 1));

  const jumpTo = (index: number) => {
    setCurrentIndex(index);
    setIsJumpGridOpen(false);
  };

  // ---- current-slide stage (left, ~62%) ----
  const stage = (
    <VStack gap={2} style={styles.stageColumn}>
      <Card padding={0} style={styles.paperCard}>
        <AspectRatio ratio={4 / 3}>
          <SlideCanvas slide={currentSlide} />
        </AspectRatio>
      </Card>
      <HStack gap={2} vAlign="center">
        <span style={styles.stageCaption}>
          Slide {currentIndex + 1} · {currentSlide.title}
        </span>
        <StackItem size="fill">
          <span />
        </StackItem>
        <span style={styles.stageCaptionMuted}>{STARTED_LABEL}</span>
      </HStack>
    </VStack>
  );

  // ---- next-slide preview (renders slide n+1, EmptyState at deck end) ----
  const nextPreview = (
    <VStack gap={1}>
      <span style={styles.consoleLabel}>Next</span>
      <Card padding={0} style={nextSlide != null ? styles.nextCard : styles.paperCard}>
        <AspectRatio ratio={4 / 3}>
          {nextSlide != null ? (
            <SlideCanvas slide={nextSlide} />
          ) : (
            <div style={styles.endPaper}>
              <EmptyState
                title="End of deck"
                description="This is the last slide — nothing is queued."
                isCompact
              />
            </div>
          )}
        </AspectRatio>
      </Card>
      <span style={styles.stageCaptionMuted}>
        {nextSlide != null
          ? `Slide ${currentIndex + 2} · ${nextSlide.title}`
          : 'Wrap up and open for questions'}
      </span>
    </VStack>
  );

  // ---- speaker notes (scrollable, A−/A+ zoom) ----
  const notesPanel = (
    <Card padding={0} style={styles.notesPanel}>
      <div style={styles.notesHeader}>
        <Icon icon={StickyNoteIcon} size="sm" color="inherit" />
        <span style={styles.consoleLabel}>Speaker notes</span>
        <StackItem size="fill">
          <span />
        </StackItem>
        <IconButton
          label="Decrease notes text size"
          tooltip="Smaller notes text"
          icon={<Icon icon={AArrowDownIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          isDisabled={notesStep === 0}
          onClick={() => setNotesStep(prev => Math.max(0, prev - 1))}
          style={{color: CONSOLE_TEXT}}
        />
        <IconButton
          label="Increase notes text size"
          tooltip="Larger notes text"
          icon={<Icon icon={AArrowUpIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          isDisabled={notesStep === NOTES_FONT_STEPS.length - 1}
          onClick={() =>
            setNotesStep(prev => Math.min(NOTES_FONT_STEPS.length - 1, prev + 1))
          }
          style={{color: CONSOLE_TEXT}}
        />
      </div>
      <div
        style={{
          ...styles.notesBody,
          fontSize: NOTES_FONT_STEPS[notesStep],
        }}>
        {currentSlide.speakerNotes}
      </div>
    </Card>
  );

  // ---- Kbd shortcut hints (display-only) ----
  const kbdHints = (
    <HStack gap={4} vAlign="center">
      <HStack gap={1} vAlign="center">
        <Kbd keys="right" />
        <span style={styles.kbdHintLabel}>Next</span>
      </HStack>
      <HStack gap={1} vAlign="center">
        <Kbd keys="left" />
        <span style={styles.kbdHintLabel}>Prev</span>
      </HStack>
      <HStack gap={1} vAlign="center">
        <Kbd keys="g" />
        <span style={styles.kbdHintLabel}>Grid</span>
      </HStack>
    </HStack>
  );

  const rack = (
    <VStack gap={4}>
      {nextPreview}
      {notesPanel}
      {kbdHints}
    </VStack>
  );

  // ---- footer control strip ----
  const footerStrip = (
    <HStack gap={3} vAlign="center">
      <Button
        label="Previous"
        variant="secondary"
        size="lg"
        icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
        isDisabled={isAtStart}
        onClick={goPrev}
      />
      <StackItem size="fill">
        <HStack hAlign="center">
          <Text type="body" color="secondary" hasTabularNumbers>
            {counterLabel}
          </Text>
        </HStack>
      </StackItem>
      <Button
        label="Next"
        variant="primary"
        size="lg"
        icon={<Icon icon={ChevronRightIcon} size="sm" color="inherit" />}
        isDisabled={isAtEnd}
        onClick={goNext}
      />
      <IconButton
        label="Open slide grid"
        tooltip="Jump to slide · G"
        icon={<Icon icon={LayoutGridIcon} size="md" color="inherit" />}
        variant="ghost"
        size="lg"
        onClick={() => setIsJumpGridOpen(true)}
      />
    </HStack>
  );

  // ---- slide-jump dialog ----
  const jumpDialog = (
    <Dialog
      isOpen={isJumpGridOpen}
      onOpenChange={setIsJumpGridOpen}
      width={isNarrow ? 340 : 720}
      purpose="info">
      <Layout
        header={
          <DialogHeader
            title="Jump to slide"
            subtitle={`${DECK_FILE_NAME} · ${SLIDE_COUNT} slides`}
            onOpenChange={setIsJumpGridOpen}
            hasDivider
          />
        }
        content={
          <LayoutContent>
            <Grid columns={isNarrow ? 2 : 4} gap={3}>
              {SLIDES.map((slide, index) => (
                <SelectableCard
                  key={slide.id}
                  label={`Go to slide ${index + 1}: ${slide.title}`}
                  isSelected={index === currentIndex}
                  onChange={() => jumpTo(index)}
                  padding={0.5}>
                  <VStack gap={1}>
                    <AspectRatio ratio={4 / 3}>
                      <SlideCanvas slide={slide} />
                    </AspectRatio>
                    <HStack gap={1} vAlign="center">
                      <Text type="supporting" color="secondary" hasTabularNumbers>
                        {index + 1}
                      </Text>
                      <StackItem size="fill" style={styles.jumpTileTitle}>
                        <Text type="supporting" maxLines={1}>
                          {slide.title}
                        </Text>
                      </StackItem>
                      {index === currentIndex && (
                        <Badge
                          label="Now"
                          variant="info"
                          icon={<Icon icon={CheckIcon} size="xsm" color="inherit" />}
                        />
                      )}
                    </HStack>
                  </VStack>
                </SelectableCard>
              ))}
            </Grid>
          </LayoutContent>
        }
      />
    </Dialog>
  );

  // ---- console body: stage + rack, responsive ----
  const consoleBody = (
    <div style={styles.consoleScroll}>
      {isStacked ? (
        <VStack gap={4}>
          {stage}
          {isNarrow ? (
            <VStack gap={4}>
              {nextPreview}
              {notesPanel}
            </VStack>
          ) : (
            <HStack gap={4} vAlign="start">
              <StackItem size="fill">{nextPreview}</StackItem>
              <StackItem size="fill">{notesPanel}</StackItem>
            </HStack>
          )}
          {kbdHints}
        </VStack>
      ) : (
        <HStack gap={4} vAlign="start">
          <StackItem size="fill" style={styles.stageColumn}>
            {stage}
          </StackItem>
          <div style={styles.rackColumn}>{rack}</div>
        </HStack>
      )}
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill" style={styles.headerTitle}>
              <HStack gap={2} vAlign="center">
                <StatusDot
                  variant={isPaused ? 'warning' : 'success'}
                  label={isPaused ? 'Paused' : 'Presenting'}
                  isPulsing={!isPaused}
                  tooltip={isPaused ? 'Timer paused' : 'Live to the room'}
                />
                <Heading level={1} maxLines={isNarrow ? 1 : 0}>
                  {isPaused ? 'Paused' : 'Presenting'} · {ROOM_LABEL}
                </Heading>
                {!isNarrow && (
                  <HStack gap={1} vAlign="center">
                    <Icon icon={PresentationIcon} size="sm" color="secondary" />
                    <Text type="supporting" color="secondary">
                      {DECK_FILE_NAME}
                    </Text>
                  </HStack>
                )}
              </HStack>
            </StackItem>
            <Tooltip content={STARTED_LABEL}>
              <span style={styles.timerChip}>
                <Icon icon={TimerIcon} size="xsm" color="inherit" />
                {ELAPSED_LABEL}
              </span>
            </Tooltip>
            <ToggleButton
              label={isPaused ? 'Resume' : 'Pause'}
              size="sm"
              icon={
                <Icon
                  icon={isPaused ? PlayIcon : PauseIcon}
                  size="sm"
                  color="inherit"
                />
              }
              isPressed={isPaused}
              onPressedChange={setIsPaused}
              isIconOnly={isNarrow}
              tooltip={isPaused ? 'Resume the elapsed timer' : 'Pause the elapsed timer'}
            />
            {/* The counter Badge is duplicated by the footer counter, so the
                header sheds it first on phone widths. */}
            {!isNarrow && <Badge label={counterLabel} variant="neutral" />}
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          {consoleBody}
          {jumpDialog}
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider padding={3}>
          {footerStrip}
        </LayoutFooter>
      }
    />
  );
}
