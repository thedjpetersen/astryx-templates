// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one parsed deck — 'q2-business-review.pptx'
 *   with 6 slides; every slide is a list of positioned SlideShape records on a
 *   960x720 canvas grid: title text, bullet lists, an image placeholder, stat
 *   callouts, and one deliberately empty slide)
 * @output PPTX-style presentation viewer: a header pager bar (deck Icon +
 *   filename Heading + '· Slide 4 of 6' muted counter, ChevronLeft/ChevronRight
 *   IconButtons that disable at the deck ends), a fixed 112px left thumbnail
 *   rail of numbered 4:3 miniature SelectableCards (the active tile gets the
 *   primary selection ring), and a centered main stage that renders the active
 *   slide as a large white 4:3 AspectRatio Card with shadow — shapes drawn at
 *   fixed x/y positions with container-relative (cqw) font sizes so the same
 *   canvas renders both the stage and the micro thumbnails. Slide 5 renders an
 *   '(empty slide)' EmptyState; a demo re-parse toggle swaps the whole surface
 *   into the 'Parsing presentation…' Skeleton variant with its caption
 * @position Page template; emitted by `astryx template slide-deck-viewer`
 *
 * Frame: Layout height="fill". LayoutHeader carries the pager chrome (deck
 * icon, filename, slide counter, prev/next). LayoutPanel start 112 hosts the
 * scrollable thumbnail rail. LayoutContent (padding 0) is a muted backdrop
 * that centers the stage column (maxWidth 880) and scrolls when short. This
 * pages through ONE document's slides — unlike file-browser-preview there is
 * no tree of files, and unlike ai-chat-artifact there is no chat pane.
 *
 * Responsive contract:
 * - >768px: header | rail 112 (fixed, scrolls vertically) | stage (fill).
 *   The stage column keeps 4:3 via AspectRatio and caps at 880px wide;
 *   vertical centering falls back to scrolling when the viewport is short.
 * - <=768px: the rail collapses into a horizontal thumbnail strip above the
 *   stage (tiles keep intrinsic 96px width, strip scrolls horizontally), the
 *   header drops the Read-only Badge and the slide counter (the stage
 *   caption still carries "Slide N of M"), the header IconButtons grow to
 *   40px touch targets, and the backdrop padding tightens so the stage gets
 *   more width.
 * - Slide canvases use container-query (cqw) type sizing, so the identical
 *   shape fixtures paint correctly at 96px thumbnails and the 880px stage.
 *   On the <=768px stage, type additionally floors at 11px via max() so
 *   slide body copy stays readable on phones; thumbnails keep pure cqw.
 *
 * Container policy (document-stage archetype): the page chrome is frame-first
 * rows and panels; the only Cards are the slide surfaces themselves — white
 * regardless of theme (colorScheme locked to light, like real slide paper).
 *
 * Color policy: the slide canvas is a deliberately scheme-locked light
 * surface — real presentation paper stays white in dark mode, exactly like
 * PowerPoint/Keynote render their decks. Every SLIDE_* hex literal (text,
 * bullets, accent bar, stat fill, image placeholder) paints ONLY inside the
 * canvas div, which locks colorScheme:'light' over its #FFFFFF background;
 * literals (not tokens) keep that ink readable on the locked paper. All
 * chrome outside the canvas (backdrop, rail, header) is token-pure and
 * follows light-dark() automatically.
 */

import {useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {PresentationIcon, RefreshCwIcon} from 'lucide-react';

// Pager chevrons come from Icon's built-in semantic registry
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
const pctX = (v: number) => `${((v / CANVAS_W) * 100).toFixed(3)}%`;
/** Vertical canvas unit -> percentage of slide height. */
const pctY = (v: number) => `${((v / CANVAS_H) * 100).toFixed(3)}%`;
/**
 * Canvas px -> container-query width units. The canvas div is a
 * container (inline-size), so 1cqw = 1% of the rendered slide width;
 * the same fixture paints the 880px stage and the 96px thumbnails.
 */
const cqw = (v: number) => `${((v / CANVAS_W) * 100).toFixed(3)}cqw`;

/**
 * <=768px the stage canvas is only ~330px wide, so raw cqw sizes drop
 * below legibility (cqw(26) computes to ~9px). The compact stage floors
 * type at 11px via max(); thumbnails keep pure cqw so miniatures paint
 * true, and at the 880px desktop stage every cqw size clears the floor
 * so nothing changes there.
 */
const STAGE_TYPE_FLOOR_PX = 11;
const cqwFloored = (v: number) => `max(${STAGE_TYPE_FLOOR_PX}px, ${cqw(v)})`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Thumbnail rail: the panel is fixed at 112px, only the tiles scroll.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-2)',
  },
  // <=768px: horizontal strip above the stage.
  stripScroll: {
    overflowX: 'auto',
    padding: 'var(--spacing-2)',
  },
  stripTile: {width: 96, flexShrink: 0},
  // Muted backdrop; the stage column centers and scrolls when short.
  stageBackdrop: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
  },
  // <=768px: tighter gutters so the slide gets more of the viewport.
  stageBackdropCompact: {padding: 'var(--spacing-3)'},
  // <=768px: grow the header controls to 40px touch targets (the "sm"
  // 28px box is fine for pointers but too small for thumbs); icon glyphs
  // stay "sm" so the row reads the same, just with more padding.
  headerTapTarget: {width: 40, height: 40},
  stageColumn: {
    width: '100%',
    maxWidth: 880,
    marginInline: 'auto',
    marginBlock: 'auto',
  },
  stageCard: {
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
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
  canvasEmptyThumb: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: SLIDE_FAINT,
    fontSize: 4,
  },
  // Parsing variant: skeleton title/body blocks on the paper.
  stageSkeletonBody: {
    position: 'absolute',
    inset: 0,
    padding: '9%',
    display: 'flex',
    flexDirection: 'column',
    gap: '5%',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed shape geometry on a 960x720 grid.
// No parsing, no clocks, no randomness, no network assets.

const DECK_FILE_NAME = 'q2-business-review.pptx';
const INITIAL_SLIDE_INDEX = 3; // "Slide 4 of 6"

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
    title: 'Q2 Business Review',
    shapes: [
      {kind: 'bar', x: 120, y: 252, w: 72, h: 10},
      {
        kind: 'text',
        x: 120,
        y: 288,
        w: 720,
        text: 'Q2 Business Review',
        size: 58,
        weight: 700,
      },
      {
        kind: 'text',
        x: 120,
        y: 378,
        w: 720,
        text: 'Growth Pod · July 2026',
        size: 26,
        color: 'muted',
      },
    ],
  },
  {
    id: 'slide-2',
    title: 'Agenda',
    shapes: [
      {kind: 'text', x: 80, y: 70, w: 800, text: 'Agenda', size: 42, weight: 700},
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {
        kind: 'bullets',
        x: 80,
        y: 208,
        w: 760,
        size: 28,
        items: [
          'Revenue vs. plan',
          'Funnel experiments',
          'Infra costs',
          'H2 asks',
        ],
      },
    ],
  },
  {
    id: 'slide-3',
    title: 'Conversion funnel',
    shapes: [
      {
        kind: 'text',
        x: 80,
        y: 70,
        w: 800,
        text: 'Conversion funnel',
        size: 42,
        weight: 700,
      },
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {kind: 'image', x: 80, y: 180, w: 800, h: 450, label: 'conversion-funnel.png'},
    ],
  },
  {
    id: 'slide-4',
    title: 'Checkout funnel wins',
    shapes: [
      {
        kind: 'text',
        x: 80,
        y: 70,
        w: 800,
        text: 'Checkout funnel wins',
        size: 42,
        weight: 700,
      },
      {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
      {
        kind: 'bullets',
        x: 80,
        y: 210,
        w: 400,
        size: 26,
        items: [
          '+18% checkout completion',
          '−2.1s p95 checkout latency',
          '3 experiments shipped',
        ],
      },
      {kind: 'stat', x: 540, y: 196, w: 340, h: 140, value: '$4.2M', caption: 'Q2 revenue'},
      {
        kind: 'stat',
        x: 540,
        y: 364,
        w: 340,
        h: 140,
        value: '12,847',
        caption: 'checkout sessions / day',
      },
    ],
  },
  {
    id: 'slide-5',
    title: '(empty slide)',
    shapes: [],
  },
  {
    id: 'slide-6',
    title: 'Questions?',
    shapes: [
      {
        kind: 'text',
        x: 120,
        y: 292,
        w: 720,
        text: 'Questions?',
        size: 56,
        weight: 700,
        align: 'center',
      },
      {
        kind: 'text',
        x: 120,
        y: 388,
        w: 720,
        text: '#growth-pod',
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

/**
 * One positioned shape; all type sizes are cqw so miniatures scale.
 * `hasTypeFloor` (the compact stage) clamps type to a readable minimum;
 * bullet glyph metrics are em-based so they track whichever size wins.
 */
function ShapeView({
  shape,
  hasTypeFloor,
}: {
  shape: SlideShape;
  hasTypeFloor: boolean;
}) {
  const typeSize = hasTypeFloor ? cqwFloored : cqw;
  switch (shape.kind) {
    case 'text':
      return (
        <div
          style={{
            ...frameStyle(shape),
            fontSize: typeSize(shape.size),
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
            gap: '0.75em',
            fontSize: typeSize(shape.size),
            lineHeight: 1.3,
          }}>
          {shape.items.map(item => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.55em',
              }}>
              <span
                aria-hidden
                style={{
                  width: '0.34em',
                  height: '0.34em',
                  marginTop: '0.42em',
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
              fontSize: typeSize(14),
              letterSpacing: '0.18em',
              color: SLIDE_FAINT,
            }}>
            IMAGE PLACEHOLDER
          </span>
          <span
            style={{
              fontSize: typeSize(20),
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
            paddingInline: cqw(28),
            backgroundColor: SLIDE_ACCENT_SOFT,
            borderRadius: cqw(12),
          }}>
          <span
            style={{
              fontSize: typeSize(46),
              fontWeight: 700,
              color: SLIDE_ACCENT,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1,
            }}>
            {shape.value}
          </span>
          <span style={{fontSize: typeSize(17), color: SLIDE_MUTED}}>
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
 * identical fixture paints at 96px and 880px. Empty slides show a
 * centered gray "(empty slide)" — an EmptyState on the stage, micro text
 * on thumbnails.
 */
function SlideCanvas({
  slide,
  isThumb = false,
  hasTypeFloor = false,
}: {
  slide: Slide;
  isThumb?: boolean;
  hasTypeFloor?: boolean;
}) {
  if (slide.shapes.length === 0) {
    return (
      <div style={styles.canvas}>
        {isThumb ? (
          <div style={styles.canvasEmptyThumb}>(empty slide)</div>
        ) : (
          <Center height="100%">
            <EmptyState
              title="(empty slide)"
              description="This slide has no shapes to render."
              isCompact
            />
          </Center>
        )}
      </div>
    );
  }
  return (
    <div style={styles.canvas}>
      {slide.shapes.map((shape, index) => (
        <ShapeView
          key={`${slide.id}-shape-${index}`}
          shape={shape}
          hasTypeFloor={hasTypeFloor}
        />
      ))}
    </div>
  );
}

/** Skeleton paper shown while the deck is "parsing". */
function StageSkeleton() {
  return (
    <div style={styles.canvas}>
      <div style={styles.stageSkeletonBody}>
        <Skeleton width="56%" height="11%" radius={2} index={0} />
        <Skeleton width="18%" height="3%" radius={1} index={1} />
        <Skeleton width="82%" height="7%" radius={1} index={2} />
        <Skeleton width="74%" height="7%" radius={1} index={3} />
        <Skeleton width="66%" height="7%" radius={1} index={4} />
        <Skeleton width="40%" height="7%" radius={1} index={5} />
      </div>
    </div>
  );
}

// ============= THUMBNAIL TILE =============

function ThumbnailTile({
  slide,
  index,
  isActive,
  isParsing,
  onSelect,
  isStrip,
}: {
  slide: Slide;
  index: number;
  isActive: boolean;
  isParsing: boolean;
  onSelect: (index: number) => void;
  isStrip: boolean;
}) {
  return (
    <Tooltip content={`Slide ${index + 1} · ${slide.title}`}>
      <VStack gap={1} style={isStrip ? styles.stripTile : undefined}>
        <SelectableCard
          label={`Go to slide ${index + 1}: ${slide.title}`}
          isSelected={isActive}
          onChange={() => onSelect(index)}
          isDisabled={isParsing}
          padding={0.5}>
          <AspectRatio ratio={4 / 3}>
            {isParsing ? (
              <Skeleton radius={1} index={index} />
            ) : (
              <SlideCanvas slide={slide} isThumb />
            )}
          </AspectRatio>
        </SelectableCard>
        <HStack hAlign="center">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {index + 1}
          </Text>
        </HStack>
      </VStack>
    </Tooltip>
  );
}

// ============= PAGE =============

export default function SlideDeckViewerTemplate() {
  const [activeIndex, setActiveIndex] = useState(INITIAL_SLIDE_INDEX);
  // Demo toggle for the loading variant: skeleton rail + skeleton stage
  // with the "Parsing presentation…" caption.
  const [isParsing, setIsParsing] = useState(false);

  // Responsive contract: <=768px the rail becomes a horizontal strip.
  const isCompact = useMediaQuery('(max-width: 768px)');

  const activeSlide = SLIDES[activeIndex];
  const isAtStart = activeIndex === 0;
  const isAtEnd = activeIndex === SLIDE_COUNT - 1;

  const goPrev = () => setActiveIndex(prev => Math.max(0, prev - 1));
  const goNext = () =>
    setActiveIndex(prev => Math.min(SLIDE_COUNT - 1, prev + 1));

  const caption = isParsing
    ? 'Parsing presentation…'
    : `Slide ${activeIndex + 1} of ${SLIDE_COUNT} · ${activeSlide.title} · ${
        activeSlide.shapes.length
      } ${activeSlide.shapes.length === 1 ? 'shape' : 'shapes'}`;

  const tiles = SLIDES.map((slide, index) => (
    <ThumbnailTile
      key={slide.id}
      slide={slide}
      index={index}
      isActive={index === activeIndex && !isParsing}
      isParsing={isParsing}
      onSelect={setActiveIndex}
      isStrip={isCompact}
    />
  ));

  // <=768px: 40px hit boxes for the header IconButtons.
  const tapTargetStyle = isCompact ? styles.headerTapTarget : undefined;

  const stage = (
    <div
      style={
        isCompact
          ? {...styles.stageBackdrop, ...styles.stageBackdropCompact}
          : styles.stageBackdrop
      }>
      <div style={styles.stageColumn}>
        <VStack gap={2}>
          <Card padding={0} style={styles.stageCard}>
            <AspectRatio ratio={4 / 3}>
              {isParsing ? (
                <StageSkeleton />
              ) : (
                <SlideCanvas slide={activeSlide} hasTypeFloor={isCompact} />
              )}
            </AspectRatio>
          </Card>
          <HStack hAlign="center">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {caption}
            </Text>
          </HStack>
        </VStack>
      </div>
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Icon icon={PresentationIcon} size="md" color="secondary" />
                <Heading level={1}>{DECK_FILE_NAME}</Heading>
                {/* <=768px the stage caption carries the counter instead,
                    freeing header width for the 40px touch targets. */}
                {!isCompact && (
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    · Slide {activeIndex + 1} of {SLIDE_COUNT}
                  </Text>
                )}
                {!isCompact && <Badge label="Read-only" variant="neutral" />}
              </HStack>
            </StackItem>
            <IconButton
              label={isParsing ? 'Finish parsing' : 'Re-parse presentation'}
              tooltip={isParsing ? 'Finish parsing' : 'Re-parse presentation'}
              icon={<Icon icon={RefreshCwIcon} size="sm" color="inherit" />}
              variant={isParsing ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setIsParsing(prev => !prev)}
              style={tapTargetStyle}
            />
            {/* Pager: chevrons disable at the deck ends (and while parsing). */}
            <HStack gap={1} vAlign="center">
              <IconButton
                label="Previous slide"
                tooltip="Previous slide"
                icon={<Icon icon="chevronLeft" size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                isDisabled={isAtStart || isParsing}
                onClick={goPrev}
                style={tapTargetStyle}
              />
              <IconButton
                label="Next slide"
                tooltip="Next slide"
                icon={<Icon icon="chevronRight" size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                isDisabled={isAtEnd || isParsing}
                onClick={goNext}
                style={tapTargetStyle}
              />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      start={
        isCompact ? undefined : (
          <LayoutPanel width={112} padding={0} label="Slide thumbnails">
            <div style={styles.railScroll}>
              <VStack gap={3}>{tiles}</VStack>
            </div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          {isCompact ? (
            <VStack gap={0} style={styles.fill}>
              <div style={styles.stripScroll}>
                <HStack gap={2}>{tiles}</HStack>
              </div>
              <Divider />
              <StackItem size="fill" style={styles.fill}>
                {stage}
              </StackItem>
            </VStack>
          ) : (
            stage
          )}
        </LayoutContent>
      }
    />
  );
}
