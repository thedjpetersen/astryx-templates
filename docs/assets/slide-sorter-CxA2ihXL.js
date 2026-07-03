var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one deck — 'all-hands-june.pptx' with 12
 *   slides across 4 sections: Opening, Product, Financials, Appendix; every
 *   slide is a list of positioned SlideShape records on a 960x720 canvas grid
 *   — titles, bullet lists, stat callouts, image placeholders, and one
 *   deliberately empty appendix slide; 'Glossary' and 'Detailed metrics'
 *   start in the skipped set)
 * @output Slide SORTER / light-table for restructuring a deck: a header bar
 *   (deck Icon + 'all-hands-june.pptx' Heading + live '12 slides · 2 skipped'
 *   counter + S/M/L zoom SegmentedControl + 'Present skipping 2' Button that
 *   fires a rehearsal Toast), above a scrolling LayoutContent of section
 *   groups — each a Collapsible whose trigger row is a Heading + slide-count
 *   Badge + rule-line Divider, containing a responsive Grid of numbered 4:3
 *   mini slide canvases. Every tile carries hover affordances: ChevronUp /
 *   ChevronDown reorder IconButtons (disabled at section ends) and a MoreMenu
 *   (Duplicate, Skip slide, Delete). Skipped tiles dim to 45% opacity under an
 *   EyeOffIcon 'Skipped' Badge with a struck-through number. Clicking a tile
 *   gives it the accent ring and raises a bottom info strip — 'Slide 9 ·
 *   Hiring plan · in Financials' — with Duplicate/Skip/Delete Buttons that
 *   mirror the MoreMenu. Deleting a section's last slide leaves a compact
 *   'No slides in this section' EmptyState
 * @position Page template; emitted by \`astryx template slide-sorter\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the deck chrome (deck
 * icon, filename, live counter, zoom SegmentedControl, Present Button).
 * LayoutContent is the vertical scroll of section Collapsibles; when a tile
 * is selected, a non-scrolling LayoutFooter info strip docks above the fold
 * at the bottom of the frame. Choose over slide-deck-viewer when the WHOLE
 * deck is the surface — a manipulable thumbnail grid with no large stage;
 * choose over deck-review-comments when the actions are structural
 * (reorder / skip / delete), not discussion.
 *
 * Responsive contract:
 * - >640px: header | scrolling sectioned grid | (info strip when selected).
 *   The Grid reflows with columns={{minWidth: zoom}} where zoom is
 *   S=140 / M=180 / L=240 from the SegmentedControl.
 * - <=640px: the zoom control hides and tiles fix at the 140px minimum;
 *   the info strip drops the slide-title text and keeps the action Buttons;
 *   tile controls (reorder chevrons + MoreMenu) grow from sm to lg touch
 *   targets and the MoreMenu gains Move up / Move down rows mirroring the
 *   chevrons.
 * - The header filename Heading and slide counter truncate (maxLines={1})
 *   instead of overflowing under the Present Button at narrow widths.
 * - Slide canvases use container-query (cqw) type sizing, so identical shape
 *   fixtures paint correctly at every tile width the grid produces.
 *
 * Container policy (sectioned card-grid archetype): frame-first chrome; the
 * only Cards are the slide tiles themselves — white paper regardless of theme
 * (colorScheme locked to light). All numbering renumbers live from the flat
 * slide order after any reorder / duplicate / delete.
 */

import {useState, type CSSProperties} from 'react';

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
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {useToast} from '@astryxdesign/core/Toast';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  PlayIcon,
  PresentationIcon,
  Trash2Icon,
} from 'lucide-react';

// ============= SLIDE PAINT CONSTANTS =============
// Slide surfaces are "paper": literal light colors locked with
// colorScheme:'light' so the light-table looks identical in dark mode.

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
 * (inline-size), so 1cqw = 1% of the rendered tile width; the same fixture
 * paints a 140px "S" tile and a 240px "L" tile.
 */
const cqw = (v: number) => \`\${((v / CANVAS_W) * 100).toFixed(3)}cqw\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Trigger rule-line: lets the Collapsible header read as a section divider.
  triggerRule: {flex: 1, minWidth: 24},
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
    borderRadius: 4,
  },
  canvasEmpty: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: SLIDE_FAINT,
    fontSize: 'clamp(4px, 4cqw, 12px)',
  },
  // Skipped overlay chip pinned to the canvas corner (kept at full opacity
  // while the canvas beneath dims to 45%).
  skippedChip: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 1,
  },
  tileCanvasWrap: {position: 'relative'},
  // Selected tile: accent ring drawn as an outline so the Card border and
  // grid gaps stay untouched.
  tileSelected: {
    outline: '2px solid var(--color-accent)',
    outlineOffset: 1,
  },
  tileButton: {
    display: 'block',
    width: '100%',
    padding: 0,
    margin: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'inherit',
    font: 'inherit',
    color: 'inherit',
  },
  // Bottom info strip: LayoutFooter surface, docks above the fold.
  infoStrip: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
  },
  strikethrough: {textDecoration: 'line-through'},
};

// ============= DATA =============
// Deterministic fixtures: fixed shape geometry on a 960x720 grid.
// No clocks, no randomness, no network assets.

const DECK_FILE_NAME = 'all-hands-june.pptx';

// Zoom presets: SegmentedControl S/M/L -> minimum tile width for the Grid.
type ZoomKey = 's' | 'm' | 'l';
const ZOOM_MIN_WIDTH: Record<ZoomKey, number> = {s: 140, m: 180, l: 240};
const COMPACT_TILE_WIDTH = 140; // <=640px: zoom control hides, tiles fix here.

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

type SectionId = 'opening' | 'product' | 'financials' | 'appendix';

interface Section {
  id: SectionId;
  name: string;
}

interface Slide {
  id: string;
  sectionId: SectionId;
  title: string;
  shapes: SlideShape[];
}

const SECTIONS: Section[] = [
  {id: 'opening', name: 'Opening'},
  {id: 'product', name: 'Product'},
  {id: 'financials', name: 'Financials'},
  {id: 'appendix', name: 'Appendix'},
];

/** Standard title-and-rule header shapes shared by content slides. */
const headerShapes = (title: string): SlideShape[] => [
  {kind: 'text', x: 80, y: 70, w: 800, text: title, size: 42, weight: 700},
  {kind: 'bar', x: 80, y: 142, w: 64, h: 8},
];

/** Standard full-width bullet body under a slide header. */
const bulletShapes = (items: string[]): SlideShape => ({
  kind: 'bullets',
  x: 80,
  y: 208,
  w: 760,
  size: 28,
  items,
});

const INITIAL_SLIDES: Slide[] = [
  // ---- Opening ----
  {
    id: 'open-1',
    sectionId: 'opening',
    title: 'June All-Hands',
    shapes: [
      {kind: 'bar', x: 120, y: 252, w: 72, h: 10},
      {
        kind: 'text',
        x: 120,
        y: 288,
        w: 720,
        text: 'June All-Hands',
        size: 58,
        weight: 700,
      },
      {
        kind: 'text',
        x: 120,
        y: 378,
        w: 720,
        text: 'Everyone · June 2026',
        size: 26,
        color: 'muted',
      },
    ],
  },
  {
    id: 'open-2',
    sectionId: 'opening',
    title: 'Agenda',
    shapes: [
      ...headerShapes('Agenda'),
      bulletShapes(['Product update', 'Financials', 'Hiring', 'Q&A']),
    ],
  },
  // ---- Product ----
  {
    id: 'prod-1',
    sectionId: 'product',
    title: 'Roadmap Q3',
    shapes: [
      ...headerShapes('Roadmap Q3'),
      bulletShapes([
        'Workspaces GA in July',
        'Mobile offline mode beta',
        'Realtime co-editing pilot',
      ]),
    ],
  },
  {
    id: 'prod-2',
    sectionId: 'product',
    title: 'Feature velocity',
    shapes: [
      ...headerShapes('Feature velocity'),
      {kind: 'stat', x: 80, y: 220, w: 380, h: 180, value: '38', caption: 'features shipped in H1'},
      {kind: 'stat', x: 500, y: 220, w: 380, h: 180, value: '11 days', caption: 'median idea → production'},
    ],
  },
  {
    id: 'prod-3',
    sectionId: 'product',
    title: 'Demo',
    shapes: [
      ...headerShapes('Demo'),
      {kind: 'image', x: 80, y: 180, w: 800, h: 450, label: 'demo-recording.png'},
    ],
  },
  {
    id: 'prod-4',
    sectionId: 'product',
    title: 'Platform health',
    shapes: [
      ...headerShapes('Platform health'),
      bulletShapes([
        '99.97% uptime in Q2',
        'p95 page load down 22%',
        'Zero sev-1 incidents since April',
      ]),
    ],
  },
  // ---- Financials ----
  {
    id: 'fin-1',
    sectionId: 'financials',
    title: 'Revenue',
    shapes: [
      ...headerShapes('Revenue'),
      {kind: 'stat', x: 200, y: 230, w: 560, h: 220, value: '$7.9M', caption: 'Q2 revenue · +18% QoQ'},
    ],
  },
  {
    id: 'fin-2',
    sectionId: 'financials',
    title: 'Burn & runway',
    shapes: [
      ...headerShapes('Burn & runway'),
      bulletShapes([
        'Net burn $1.1M / month',
        'Runway 26 months at current plan',
        'Infra spend flat despite 2× usage',
      ]),
    ],
  },
  {
    id: 'fin-3',
    sectionId: 'financials',
    title: 'Hiring plan',
    shapes: [
      ...headerShapes('Hiring plan'),
      bulletShapes([
        '6 open roles in H2',
        'Priority: infra + support',
        'Referral bonus doubles in July',
      ]),
    ],
  },
  // ---- Appendix ----
  {
    id: 'app-1',
    sectionId: 'appendix',
    title: 'Glossary',
    shapes: [
      ...headerShapes('Glossary'),
      bulletShapes([
        'ARR — annual recurring revenue',
        'NRR — net revenue retention',
        'p95 — 95th percentile latency',
      ]),
    ],
  },
  {
    id: 'app-2',
    sectionId: 'appendix',
    title: 'Detailed metrics',
    shapes: [
      ...headerShapes('Detailed metrics'),
      {kind: 'image', x: 80, y: 180, w: 800, h: 450, label: 'metrics-export.png'},
    ],
  },
  {
    id: 'app-3',
    sectionId: 'appendix',
    title: '(empty slide)',
    shapes: [],
  },
];

// 'Glossary' and 'Detailed metrics' start skipped → '12 slides · 2 skipped'.
const INITIAL_SKIPPED_IDS = ['app-1', 'app-2'];

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
            paddingInline: cqw(28),
            backgroundColor: SLIDE_ACCENT_SOFT,
            borderRadius: cqw(12),
          }}>
          <span
            style={{
              fontSize: cqw(46),
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
 * The miniature slide surface. Positions are percentages of the canvas and
 * font sizes are cqw, so the identical fixture paints at every zoom level.
 * Empty slides show a centered gray "(empty slide)".
 */
function SlideCanvas({slide}: {slide: Slide}) {
  return (
    <div style={styles.canvas}>
      {slide.shapes.length === 0 ? (
        <div style={styles.canvasEmpty}>(empty slide)</div>
      ) : (
        slide.shapes.map((shape, index) => (
          <ShapeView key={\`\${slide.id}-shape-\${index}\`} shape={shape} />
        ))
      )}
    </div>
  );
}

// ============= SLIDE TILE =============

interface SlideTileProps {
  slide: Slide;
  number: number; // 1-based deck position (renumbers live)
  isSkipped: boolean;
  isSelected: boolean;
  isFirstInSection: boolean;
  isLastInSection: boolean;
  isCompact: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onToggleSkip: (id: string) => void;
  onDelete: (id: string) => void;
}

function SlideTile({
  slide,
  number,
  isSkipped,
  isSelected,
  isFirstInSection,
  isLastInSection,
  isCompact,
  onSelect,
  onMove,
  onDuplicate,
  onToggleSkip,
  onDelete,
}: SlideTileProps) {
  // Hover affordances: reorder + MoreMenu fade in on hover, stay visible
  // while the tile is selected or its menu is open.
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showControls = isHovered || isSelected || isMenuOpen;
  // <=640px: reorder chevrons + MoreMenu grow to lg so fingers can hit them.
  const controlSize = isCompact ? 'lg' : 'sm';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <Card
        padding={0.5}
        style={isSelected ? styles.tileSelected : undefined}>
        <VStack gap={0.5}>
          <button
            type="button"
            style={styles.tileButton}
            aria-label={\`Select slide \${number}: \${slide.title}\`}
            aria-pressed={isSelected}
            onClick={() => onSelect(slide.id)}>
            <div style={styles.tileCanvasWrap}>
              {isSkipped && (
                <div style={styles.skippedChip}>
                  <Tooltip content="Excluded when presenting">
                    <Badge
                      label="Skipped"
                      variant="neutral"
                      icon={<Icon icon={EyeOffIcon} size="xsm" color="inherit" />}
                    />
                  </Tooltip>
                </div>
              )}
              <div style={isSkipped ? {opacity: 0.45} : undefined}>
                <AspectRatio ratio={4 / 3}>
                  <SlideCanvas slide={slide} />
                </AspectRatio>
              </div>
            </div>
          </button>
          <HStack gap={0.5} vAlign="center">
            <Tooltip content={slide.title}>
              <Text
                type="supporting"
                color="secondary"
                hasTabularNumbers
                style={isSkipped ? styles.strikethrough : undefined}>
                {number}
              </Text>
            </Tooltip>
            <StackItem size="fill">
              <span />
            </StackItem>
            <div
              style={{
                opacity: showControls ? 1 : 0,
                visibility: showControls ? 'visible' : 'hidden',
              }}>
              <HStack gap={0.5} vAlign="center">
                <IconButton
                  label={\`Move slide \${number} earlier in its section\`}
                  tooltip="Move up"
                  icon={<Icon icon={ChevronUpIcon} size="sm" color="inherit" />}
                  variant="ghost"
                  size={controlSize}
                  isDisabled={isFirstInSection}
                  onClick={() => onMove(slide.id, -1)}
                />
                <IconButton
                  label={\`Move slide \${number} later in its section\`}
                  tooltip="Move down"
                  icon={
                    <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                  }
                  variant="ghost"
                  size={controlSize}
                  isDisabled={isLastInSection}
                  onClick={() => onMove(slide.id, 1)}
                />
                <MoreMenu
                  label={\`Slide \${number} actions\`}
                  size={controlSize}
                  onOpenChange={setIsMenuOpen}
                  items={[
                    ...(isCompact
                      ? [
                          {
                            label: 'Move up',
                            icon: (
                              <Icon
                                icon={ChevronUpIcon}
                                size="sm"
                                color="inherit"
                              />
                            ),
                            isDisabled: isFirstInSection,
                            onClick: () => onMove(slide.id, -1),
                          },
                          {
                            label: 'Move down',
                            icon: (
                              <Icon
                                icon={ChevronDownIcon}
                                size="sm"
                                color="inherit"
                              />
                            ),
                            isDisabled: isLastInSection,
                            onClick: () => onMove(slide.id, 1),
                          },
                          {type: 'divider'} as const,
                        ]
                      : []),
                    {
                      label: 'Duplicate',
                      icon: <Icon icon={CopyIcon} size="sm" color="inherit" />,
                      onClick: () => onDuplicate(slide.id),
                    },
                    {
                      label: isSkipped ? 'Include slide' : 'Skip slide',
                      icon: (
                        <Icon
                          icon={isSkipped ? EyeIcon : EyeOffIcon}
                          size="sm"
                          color="inherit"
                        />
                      ),
                      onClick: () => onToggleSkip(slide.id),
                    },
                    {type: 'divider'},
                    {
                      label: 'Delete',
                      icon: (
                        <Icon icon={Trash2Icon} size="sm" color="inherit" />
                      ),
                      onClick: () => onDelete(slide.id),
                    },
                  ]}
                />
              </HStack>
            </div>
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}

// ============= PAGE =============

export default function SlideSorterTemplate() {
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
  const [skippedIds, setSkippedIds] = useState<ReadonlySet<string>>(
    new Set(INITIAL_SKIPPED_IDS),
  );
  const [zoom, setZoom] = useState<ZoomKey>('m');
  // Seeded selection so the info strip is visible on first paint.
  const [selectedId, setSelectedId] = useState<string | null>('fin-3');
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    opening: true,
    product: true,
    financials: true,
    appendix: true,
  });
  // Monotonic counter for deterministic duplicate ids.
  const [copySeq, setCopySeq] = useState(1);

  const toast = useToast();

  // Responsive contract: <=640px hides the zoom control, tiles fix at 140px.
  const isCompact = useMediaQuery('(max-width: 640px)');
  const tileMinWidth = isCompact ? COMPACT_TILE_WIDTH : ZOOM_MIN_WIDTH[zoom];

  // ---- derived state (numbering renumbers live from the flat order) ----
  const skippedCount = slides.filter(slide => skippedIds.has(slide.id)).length;
  const numberById = new Map(slides.map((slide, index) => [slide.id, index + 1]));
  const selectedSlide = slides.find(slide => slide.id === selectedId) ?? null;
  const selectedSection =
    selectedSlide != null
      ? SECTIONS.find(section => section.id === selectedSlide.sectionId)
      : null;
  const firstPresentedNumber =
    slides.find(slide => !skippedIds.has(slide.id)) != null
      ? numberById.get(slides.find(slide => !skippedIds.has(slide.id))!.id)!
      : null;

  const counterLabel = \`\${slides.length} \${
    slides.length === 1 ? 'slide' : 'slides'
  }\${skippedCount > 0 ? \` · \${skippedCount} skipped\` : ''}\`;

  // ---- structural actions ----
  const sectionSlides = (sectionId: SectionId) =>
    slides.filter(slide => slide.sectionId === sectionId);

  /** Swap a slide with its neighbor within the same section. */
  const moveSlide = (id: string, direction: -1 | 1) => {
    setSlides(prev => {
      const slide = prev.find(s => s.id === id);
      if (slide == null) {
        return prev;
      }
      const inSection = prev.filter(s => s.sectionId === slide.sectionId);
      const pos = inSection.findIndex(s => s.id === id);
      const neighbor = inSection[pos + direction];
      if (neighbor == null) {
        return prev;
      }
      const a = prev.findIndex(s => s.id === id);
      const b = prev.findIndex(s => s.id === neighbor.id);
      const next = [...prev];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  };

  /** Insert a '(copy)' right after the source slide. */
  const duplicateSlide = (id: string) => {
    const source = slides.find(slide => slide.id === id);
    if (source == null) {
      return;
    }
    const copy: Slide = {
      ...source,
      id: \`\${source.id}-copy-\${copySeq}\`,
      title: \`\${source.title} (copy)\`,
    };
    setCopySeq(prev => prev + 1);
    setSlides(prev => {
      const index = prev.findIndex(slide => slide.id === id);
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
    setSelectedId(copy.id);
  };

  const toggleSkip = (id: string) => {
    setSkippedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const deleteSlide = (id: string) => {
    setSlides(prev => prev.filter(slide => slide.id !== id));
    setSkippedIds(prev => {
      if (!prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSelectedId(prev => (prev === id ? null : prev));
  };

  const handlePresent = () => {
    toast({
      body:
        firstPresentedNumber == null
          ? 'Every slide is skipped — nothing to present.'
          : \`Rehearsal would start at slide \${firstPresentedNumber}, skipping \${skippedCount}.\`,
      isAutoHide: true,
    });
  };

  // ---- header ----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center">
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={PresentationIcon} size="md" color="secondary" />
            <Heading level={1} maxLines={1}>
              {DECK_FILE_NAME}
            </Heading>
            <Text
              type="supporting"
              color="secondary"
              hasTabularNumbers
              maxLines={1}>
              · {counterLabel}
            </Text>
          </HStack>
        </StackItem>
        {!isCompact && (
          <SegmentedControl
            label="Tile zoom"
            value={zoom}
            onChange={value => setZoom(value as ZoomKey)}
            size="sm">
            <SegmentedControlItem value="s" label="S" />
            <SegmentedControlItem value="m" label="M" />
            <SegmentedControlItem value="l" label="L" />
          </SegmentedControl>
        )}
        <Button
          label={
            skippedCount > 0 ? \`Present skipping \${skippedCount}\` : 'Present'
          }
          variant="primary"
          size="sm"
          icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
          tooltip="Rehearse the deck without skipped slides"
          onClick={handlePresent}
        />
      </HStack>
    </LayoutHeader>
  );

  // ---- section groups ----
  const sections = SECTIONS.map(section => {
    const group = sectionSlides(section.id);
    const groupSkipped = group.filter(slide => skippedIds.has(slide.id)).length;
    return (
      <Collapsible
        key={section.id}
        isOpen={openSections[section.id]}
        onOpenChange={isOpen =>
          setOpenSections(prev => ({...prev, [section.id]: isOpen}))
        }
        trigger={
          <HStack gap={2} vAlign="center" width="100%">
            <Heading level={2}>{section.name}</Heading>
            <Badge
              label={\`\${group.length} \${group.length === 1 ? 'slide' : 'slides'}\`}
              variant="neutral"
            />
            {groupSkipped > 0 && (
              <Badge label={\`\${groupSkipped} skipped\`} variant="yellow" />
            )}
            <div style={styles.triggerRule}>
              <Divider />
            </div>
          </HStack>
        }>
        {group.length === 0 ? (
          <EmptyState
            title="No slides in this section"
            description="Duplicate a slide from another section or delete the group."
            isCompact
          />
        ) : (
          <Grid columns={{minWidth: tileMinWidth}} gap={3}>
            {group.map((slide, indexInSection) => (
              <SlideTile
                key={slide.id}
                slide={slide}
                number={numberById.get(slide.id) ?? 0}
                isSkipped={skippedIds.has(slide.id)}
                isSelected={slide.id === selectedId}
                isFirstInSection={indexInSection === 0}
                isLastInSection={indexInSection === group.length - 1}
                isCompact={isCompact}
                onSelect={id =>
                  setSelectedId(prev => (prev === id ? null : id))
                }
                onMove={moveSlide}
                onDuplicate={duplicateSlide}
                onToggleSkip={toggleSkip}
                onDelete={deleteSlide}
              />
            ))}
          </Grid>
        )}
      </Collapsible>
    );
  });

  // ---- bottom info strip (mirrors the tile MoreMenu) ----
  const infoStrip =
    selectedSlide != null && selectedSection != null ? (
      <LayoutFooter hasDivider padding={0} label="Selected slide">
        <div style={styles.infoStrip}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Text type="body" hasTabularNumbers>
                  Slide {numberById.get(selectedSlide.id)}
                </Text>
                {!isCompact && (
                  <>
                    <Text type="supporting" color="secondary">
                      · {selectedSlide.title} · in {selectedSection.name}
                    </Text>
                    {skippedIds.has(selectedSlide.id) && (
                      <Badge
                        label="Skipped"
                        variant="neutral"
                        icon={
                          <Icon icon={EyeOffIcon} size="xsm" color="inherit" />
                        }
                      />
                    )}
                  </>
                )}
              </HStack>
            </StackItem>
            <Button
              label="Duplicate"
              variant="ghost"
              size="sm"
              icon={<Icon icon={CopyIcon} size="sm" color="inherit" />}
              onClick={() => duplicateSlide(selectedSlide.id)}
            />
            <Button
              label={skippedIds.has(selectedSlide.id) ? 'Include' : 'Skip'}
              variant="ghost"
              size="sm"
              icon={
                <Icon
                  icon={
                    skippedIds.has(selectedSlide.id) ? EyeIcon : EyeOffIcon
                  }
                  size="sm"
                  color="inherit"
                />
              }
              onClick={() => toggleSkip(selectedSlide.id)}
            />
            <Button
              label="Delete"
              variant="ghost"
              size="sm"
              icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
              onClick={() => deleteSlide(selectedSlide.id)}
            />
          </HStack>
        </div>
      </LayoutFooter>
    ) : null;

  return (
    <Layout
      height="fill"
      header={header}
      footer={infoStrip}
      content={
        <LayoutContent>
          <VStack gap={4}>{sections}</VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};