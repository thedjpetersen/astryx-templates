// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one editable deck —
 *   'brand-launch-plan.pptx' with 5 slides; every slide is a list of
 *   positioned, individually addressable EditorShape records on a 960x720
 *   canvas grid: title text, accent bars, bullet lists, stat callouts, and an
 *   image placeholder. Initial state opens slide 2 with its title shape
 *   selected — text 'Launch timeline', size 42, weight 700, align left,
 *   x 80 / y 70 / w 800 — so the format panel starts populated)
 * @output PPTX-style slide EDITOR: a header edit bar (deck Icon + filename
 *   Heading + Undo/Redo IconButtons that gray out at the ends of the edit
 *   stack + a vertical Divider + an insert Toolbar with Text/Shape/Image
 *   Buttons + a 'Present' Button that flips a dismissible 'Rehearsal started'
 *   Banner), a fixed 128px left thumbnail rail of numbered SelectableCards
 *   repainted live from the edited shape state, a centered 840px-max 4:3
 *   editing canvas where clicking a shape paints a 2px accent selection ring
 *   with eight square resize handles (plus dashed center alignment guides
 *   whenever the selected frame crosses the canvas midlines), and a right
 *   280px format LayoutPanel whose Fields — content TextInput, font-size
 *   Slider, weight/align SegmentedControls, x/y/w NumberInputs, color-role
 *   Selector, delete IconButton — live-edit the selected shape
 * @position Page template; emitted by `astryx template slide-editor-canvas`
 *
 * Frame: Layout height="fill". LayoutHeader carries the edit chrome (deck
 * icon, filename, Undo/Redo, insert Toolbar, Present). LayoutPanel start 128
 * hosts the scrollable thumbnail rail. LayoutContent (padding 0) is a muted
 * backdrop centering the editing stage; LayoutPanel end 280 is the format
 * panel (EmptyState when nothing is selected). Choose over slide-deck-viewer
 * when the surface is AUTHORING — shapes are selectable and a properties
 * panel mutates them — not read-only paging; over deck-theme-designer when
 * editing one slide's shapes rather than deck-wide styles; over
 * slide-outline-editor when manipulation is spatial/canvas-based, not
 * text-outline-based.
 *
 * Responsive contract:
 * - >1100px: header | rail 128 (fixed, scrolls) | stage (fill) | format 280.
 *   The stage keeps 4:3 via AspectRatio and caps at 840px wide; vertical
 *   centering falls back to scrolling when the viewport is short.
 * - <=1100px: the format panel collapses behind a PanelRight header toggle
 *   (badge-free IconButton flips it in and out).
 * - <=768px: the rail becomes a horizontal thumbnail strip above the canvas
 *   (tiles keep intrinsic 104px width, strip scrolls horizontally) and the
 *   insert Toolbar drops its button labels down to icon Tooltips.
 * - Slide canvases use container-query (cqw) type sizing, so the identical
 *   edited shape state paints correctly at 104px thumbnails and the 840px
 *   stage.
 *
 * Container policy (edit-canvas archetype): the page chrome is frame-first
 * rows and panels; the only Cards are the slide surfaces themselves — white
 * regardless of theme (colorScheme locked to light, like real slide paper).
 * All edits flow through one history stack so Undo/Redo replay property
 * changes deterministically — no clocks, randomness, or network assets.
 */

import {useState, type CSSProperties} from 'react';

import {
  ImageIcon,
  MousePointerClickIcon,
  PanelRightIcon,
  PlayIcon,
  PresentationIcon,
  Redo2Icon,
  SquareIcon,
  Trash2Icon,
  TypeIcon,
  Undo2Icon,
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
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Field} from '@astryxdesign/core/Field';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SLIDE PAINT CONSTANTS =============
// Slide surfaces are "paper": literal light colors locked with
// colorScheme:'light' so the deck looks identical in dark mode. Mirrors
// slide-deck-viewer's palette.

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
 * Canvas px -> container-query width units. The canvas div is a container
 * (inline-size), so 1cqw = 1% of the rendered slide width; the same edited
 * shape state paints the 840px stage and the 104px thumbnails.
 */
const cqw = (v: number) => `${((v / CANVAS_W) * 100).toFixed(3)}cqw`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Root owns the viewport so the muted stage backdrop runs to the fold
  // instead of letting the layout collapse to content height.
  root: {height: '100dvh', width: '100%'},
  fill: {height: '100%', minHeight: 0},
  // Thumbnail rail: the panel is fixed at 128px, only the tiles scroll.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-2)',
  },
  // <=768px: horizontal strip above the stage.
  stripScroll: {
    overflowX: 'auto',
    padding: 'var(--spacing-2)',
    flexShrink: 0,
  },
  stripTile: {width: 104, flexShrink: 0},
  headerDivider: {height: 20, alignSelf: 'center'},
  // Muted backdrop; the stage column centers and scrolls when short.
  stageBackdrop: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
  },
  stageColumn: {
    width: '100%',
    maxWidth: 840,
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
  // Selection chrome: slide-accent ring + eight white handle squares. Uses
  // the slide palette (not var(--color-accent)) so the chrome stays a light
  // editor blue on the paper even under near-black app accent themes.
  selectionRing: {
    position: 'absolute',
    outline: `2px solid ${SLIDE_ACCENT}`,
    outlineOffset: 1,
    pointerEvents: 'none',
  },
  handle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${SLIDE_ACCENT}`,
    transform: 'translate(-50%, -50%)',
    boxSizing: 'border-box',
  },
  // Dashed center alignment guides (painted only while the selected shape's
  // frame crosses the canvas midlines — deterministic from geometry).
  guideVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 0,
    borderLeft: `1px dashed ${SLIDE_ACCENT}`,
    pointerEvents: 'none',
  },
  guideHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 0,
    borderTop: `1px dashed ${SLIDE_ACCENT}`,
    pointerEvents: 'none',
  },
  formatScroll: {
    height: '100%',
    overflowY: 'auto',
  },
  bannerRegion: {flexShrink: 0},
};

// ============= DATA =============
// Deterministic fixtures: fixed shape geometry on a 960x720 grid.
// No parsing, no clocks, no randomness, no network assets.

const DECK_FILE_NAME = 'brand-launch-plan.pptx';
const INITIAL_SLIDE_INDEX = 1; // slide 2, 'Launch timeline'
const INITIAL_SELECTED_SHAPE_ID = 's2-title';

type ShapeKind = 'text' | 'bullets' | 'image' | 'stat' | 'bar';
type ColorRole = 'default' | 'muted' | 'accent';
type ShapeAlign = 'left' | 'center';
type ShapeWeight = 400 | 600 | 700;

interface EditorShape {
  id: string;
  kind: ShapeKind;
  // Frame in canvas units. h is explicit so selection rings and the
  // alignment-guide math stay deterministic.
  x: number;
  y: number;
  w: number;
  h: number;
  /** Text content (text), stat value (stat), or file label (image). */
  text: string;
  /** Stat caption line. */
  caption?: string;
  /** Bullet lines. */
  items?: string[];
  size: number; // canvas px
  weight: ShapeWeight;
  align: ShapeAlign;
  color: ColorRole;
}

interface SlideMeta {
  id: string;
  name: string;
}

const SLIDE_ORDER: SlideMeta[] = [
  {id: 'slide-1', name: 'Brand Launch Plan'},
  {id: 'slide-2', name: 'Launch timeline'},
  {id: 'slide-3', name: 'Channel mix'},
  {id: 'slide-4', name: 'Creative direction'},
  {id: 'slide-5', name: 'Next steps'},
];

type ShapesBySlide = Record<string, EditorShape[]>;

const shapeDefaults = {size: 24, weight: 400, align: 'left', color: 'default'} as const;

const INITIAL_SHAPES: ShapesBySlide = {
  'slide-1': [
    {id: 's1-bar', kind: 'bar', x: 120, y: 252, w: 72, h: 10, text: '', ...shapeDefaults, color: 'accent'},
    {id: 's1-title', kind: 'text', x: 120, y: 288, w: 720, h: 80, text: 'Brand Launch Plan', size: 58, weight: 700, align: 'left', color: 'default'},
    {id: 's1-subtitle', kind: 'text', x: 120, y: 378, w: 720, h: 40, text: 'Marketing Studio · August 2026', size: 26, weight: 400, align: 'left', color: 'muted'},
  ],
  'slide-2': [
    {id: 's2-title', kind: 'text', x: 80, y: 70, w: 800, h: 62, text: 'Launch timeline', size: 42, weight: 700, align: 'left', color: 'default'},
    {id: 's2-bar', kind: 'bar', x: 80, y: 142, w: 64, h: 8, text: '', ...shapeDefaults, color: 'accent'},
    {
      id: 's2-bullets',
      kind: 'bullets',
      x: 80,
      y: 208,
      w: 500,
      h: 250,
      text: '',
      items: ['Creative lock — Jul 10', 'Asset production — Jul 24', 'Channel QA — Aug 4', 'Launch day — Aug 18'],
      size: 26,
      weight: 400,
      align: 'left',
      color: 'default',
    },
    {id: 's2-stat', kind: 'stat', x: 630, y: 224, w: 250, h: 150, text: '6 wks', caption: 'to launch', size: 46, weight: 700, align: 'left', color: 'accent'},
  ],
  'slide-3': [
    {id: 's3-title', kind: 'text', x: 80, y: 70, w: 800, h: 62, text: 'Channel mix', size: 42, weight: 700, align: 'left', color: 'default'},
    {id: 's3-bar', kind: 'bar', x: 80, y: 142, w: 64, h: 8, text: '', ...shapeDefaults, color: 'accent'},
    {id: 's3-stat-1', kind: 'stat', x: 80, y: 200, w: 380, h: 150, text: '38%', caption: 'paid social', size: 46, weight: 700, align: 'left', color: 'accent'},
    {id: 's3-stat-2', kind: 'stat', x: 500, y: 200, w: 380, h: 150, text: '24%', caption: 'lifecycle email', size: 46, weight: 700, align: 'left', color: 'accent'},
    {
      id: 's3-bullets',
      kind: 'bullets',
      x: 80,
      y: 404,
      w: 760,
      h: 200,
      text: '',
      items: ['Search holds 18% with flat CAC', 'Podcast pilot lands in week 2', 'Retail displays confirmed for 40 doors'],
      size: 24,
      weight: 400,
      align: 'left',
      color: 'default',
    },
  ],
  'slide-4': [
    {id: 's4-title', kind: 'text', x: 80, y: 70, w: 800, h: 62, text: 'Creative direction', size: 42, weight: 700, align: 'left', color: 'default'},
    {id: 's4-bar', kind: 'bar', x: 80, y: 142, w: 64, h: 8, text: '', ...shapeDefaults, color: 'accent'},
    {id: 's4-image', kind: 'image', x: 80, y: 190, w: 800, h: 380, text: 'moodboard-v3.png', ...shapeDefaults},
    {id: 's4-caption', kind: 'text', x: 80, y: 596, w: 800, h: 36, text: 'Palette locked · type pairing in review', size: 22, weight: 400, align: 'left', color: 'muted'},
  ],
  'slide-5': [
    {id: 's5-title', kind: 'text', x: 80, y: 70, w: 800, h: 62, text: 'Next steps', size: 42, weight: 700, align: 'left', color: 'default'},
    {id: 's5-bar', kind: 'bar', x: 80, y: 142, w: 64, h: 8, text: '', ...shapeDefaults, color: 'accent'},
    {
      id: 's5-bullets',
      kind: 'bullets',
      x: 80,
      y: 208,
      w: 760,
      h: 280,
      text: '',
      items: ['Confirm budget split by Friday', 'Brief regional teams on the rollout', 'Book the launch-day war room', 'Draft day-one social copy'],
      size: 28,
      weight: 400,
      align: 'left',
      color: 'default',
    },
  ],
};

const ROLE_COLOR: Record<ColorRole, string> = {
  default: SLIDE_TEXT,
  muted: SLIDE_MUTED,
  accent: SLIDE_ACCENT,
};

const KIND_LABEL: Record<ShapeKind, string> = {
  text: 'Text box',
  bullets: 'Bullet list',
  image: 'Image',
  stat: 'Stat callout',
  bar: 'Shape',
};

const COLOR_ROLE_OPTIONS = [
  {value: 'default', label: 'Ink'},
  {value: 'muted', label: 'Muted'},
  {value: 'accent', label: 'Accent'},
];

// Eight resize handles: corners + edge midpoints (never the center).
const HANDLE_POSITIONS: {left: string; top: string}[] = [
  {left: '0%', top: '0%'},
  {left: '50%', top: '0%'},
  {left: '100%', top: '0%'},
  {left: '0%', top: '50%'},
  {left: '100%', top: '50%'},
  {left: '0%', top: '100%'},
  {left: '50%', top: '100%'},
  {left: '100%', top: '100%'},
];

// ============= SLIDE CANVAS =============

function frameStyle(shape: EditorShape): CSSProperties {
  return {
    position: 'absolute',
    left: pctX(shape.x),
    top: pctY(shape.y),
    width: pctX(shape.w),
    height: pctY(shape.h),
  };
}

/** One positioned shape; all type sizes are cqw so miniatures scale. */
function ShapeView({shape}: {shape: EditorShape}) {
  switch (shape.kind) {
    case 'text':
      return (
        <div
          style={{
            fontSize: cqw(shape.size),
            fontWeight: shape.weight,
            color: ROLE_COLOR[shape.color],
            lineHeight: 1.2,
            letterSpacing: shape.size >= 40 ? '-0.015em' : undefined,
            textAlign: shape.align,
          }}>
          {shape.text}
        </div>
      );
    case 'bullets':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: cqw(shape.size * 0.75),
            fontSize: cqw(shape.size),
            fontWeight: shape.weight,
            lineHeight: 1.3,
            color: ROLE_COLOR[shape.color],
          }}>
          {shape.items?.map(item => (
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
            height: '100%',
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
            {shape.text}
          </span>
        </div>
      );
    case 'stat':
      return (
        <div
          style={{
            height: '100%',
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
              fontSize: cqw(shape.size),
              fontWeight: 700,
              color: ROLE_COLOR[shape.color],
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1,
            }}>
            {shape.text}
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
            height: '100%',
            backgroundColor: ROLE_COLOR[shape.color],
            borderRadius: cqw(4),
          }}
        />
      );
  }
}

/**
 * The slide surface. One render path for both the editing stage and the rail:
 * positions are percentages of the canvas and font sizes are cqw, so the
 * identical edited shape state paints at 104px and 840px. Editing mode adds
 * click-to-select hit areas, the accent selection ring with its eight
 * handles, and the dashed center guides.
 */
function SlideCanvas({
  shapes,
  selectedShapeId,
  onSelectShape,
  onDeselect,
}: {
  shapes: EditorShape[];
  selectedShapeId?: string | null;
  onSelectShape?: (id: string) => void;
  onDeselect?: () => void;
}) {
  const isEditing = onSelectShape != null;
  const selected =
    isEditing && selectedShapeId != null
      ? shapes.find(shape => shape.id === selectedShapeId)
      : undefined;
  // Alignment guides: deterministic from fixture geometry — painted only
  // while the selected frame crosses a canvas midline (480 / 360).
  const crossesVerticalCenter =
    selected != null && selected.x <= CANVAS_W / 2 && selected.x + selected.w >= CANVAS_W / 2;
  const crossesHorizontalCenter =
    selected != null && selected.y <= CANVAS_H / 2 && selected.y + selected.h >= CANVAS_H / 2;

  return (
    <div style={styles.canvas} onClick={onDeselect}>
      {shapes.map(shape =>
        isEditing ? (
          <div
            key={shape.id}
            role="button"
            tabIndex={0}
            aria-label={`Select ${KIND_LABEL[shape.kind].toLowerCase()}`}
            style={{...frameStyle(shape), cursor: 'pointer'}}
            onClick={event => {
              event.stopPropagation();
              onSelectShape(shape.id);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectShape(shape.id);
              }
            }}>
            <ShapeView shape={shape} />
          </div>
        ) : (
          <div key={shape.id} style={frameStyle(shape)}>
            <ShapeView shape={shape} />
          </div>
        ),
      )}
      {crossesVerticalCenter && <div style={styles.guideVertical} aria-hidden />}
      {crossesHorizontalCenter && (
        <div style={styles.guideHorizontal} aria-hidden />
      )}
      {selected != null && (
        <div style={{...styles.selectionRing, ...frameStyle(selected)}} aria-hidden>
          {HANDLE_POSITIONS.map(pos => (
            <div
              key={`${pos.left}-${pos.top}`}
              style={{...styles.handle, left: pos.left, top: pos.top}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============= THUMBNAIL TILE =============

function ThumbnailTile({
  name,
  shapes,
  index,
  isActive,
  onSelect,
  isStrip,
}: {
  name: string;
  shapes: EditorShape[];
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
  isStrip: boolean;
}) {
  return (
    <Tooltip content={`Slide ${index + 1} · ${name}`}>
      <VStack gap={1} style={isStrip ? styles.stripTile : undefined}>
        <SelectableCard
          label={`Go to slide ${index + 1}: ${name}`}
          isSelected={isActive}
          onChange={() => onSelect(index)}
          padding={0.5}>
          <AspectRatio ratio={4 / 3}>
            <SlideCanvas shapes={shapes} />
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

export default function SlideEditorCanvasTemplate() {
  const [shapesBySlide, setShapesBySlide] =
    useState<ShapesBySlide>(INITIAL_SHAPES);
  // Undo/Redo: full-snapshot history stack. Every committed edit pushes the
  // previous state onto `past` and clears `future`.
  const [past, setPast] = useState<ShapesBySlide[]>([]);
  const [future, setFuture] = useState<ShapesBySlide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(INITIAL_SLIDE_INDEX);
  // Selection is remembered per slide so switching slides restores it.
  const [selectedBySlide, setSelectedBySlide] = useState<
    Record<string, string | null>
  >({'slide-2': INITIAL_SELECTED_SHAPE_ID});
  const [insertCount, setInsertCount] = useState(0);
  const [isRehearsing, setIsRehearsing] = useState(false);
  // <=1100px: the format panel collapses behind a header PanelRight toggle.
  const [isFormatOpen, setIsFormatOpen] = useState(false);

  const isMid = useMediaQuery('(max-width: 1100px)');
  const isCompact = useMediaQuery('(max-width: 768px)');

  const activeSlide = SLIDE_ORDER[activeSlideIndex];
  const activeShapes = shapesBySlide[activeSlide.id];
  const selectedShapeId = selectedBySlide[activeSlide.id] ?? null;
  const selectedShape =
    selectedShapeId != null
      ? activeShapes.find(shape => shape.id === selectedShapeId)
      : undefined;

  // ---- edit history ----
  const commitEdit = (next: ShapesBySlide) => {
    setPast(prev => [...prev, shapesBySlide]);
    setFuture([]);
    setShapesBySlide(next);
  };

  const undo = () => {
    if (past.length === 0) {
      return;
    }
    const previous = past[past.length - 1];
    setPast(prev => prev.slice(0, -1));
    setFuture(prev => [shapesBySlide, ...prev]);
    setShapesBySlide(previous);
  };

  const redo = () => {
    if (future.length === 0) {
      return;
    }
    const [next, ...rest] = future;
    setFuture(rest);
    setPast(prev => [...prev, shapesBySlide]);
    setShapesBySlide(next);
  };

  // ---- shape edits (all flow through commitEdit so Undo/Redo work) ----
  const updateSelectedShape = (patch: Partial<EditorShape>) => {
    if (selectedShapeId == null) {
      return;
    }
    commitEdit({
      ...shapesBySlide,
      [activeSlide.id]: activeShapes.map(shape =>
        shape.id === selectedShapeId ? {...shape, ...patch} : shape,
      ),
    });
  };

  const selectShape = (id: string | null) => {
    setSelectedBySlide(prev => ({...prev, [activeSlide.id]: id}));
  };

  const insertShape = (kind: 'text' | 'bar' | 'image') => {
    const id = `inserted-${insertCount + 1}`;
    const base = {id, x: 320, y: 320, weight: 400, align: 'left'} as const;
    const shape: EditorShape =
      kind === 'text'
        ? {...base, kind: 'text', w: 320, h: 48, text: 'New text box', size: 28, color: 'default'}
        : kind === 'bar'
          ? {...base, kind: 'bar', w: 200, h: 80, text: '', size: 24, color: 'accent'}
          : {...base, kind: 'image', w: 320, h: 240, text: 'placeholder.png', size: 24, color: 'default'};
    setInsertCount(prev => prev + 1);
    commitEdit({
      ...shapesBySlide,
      [activeSlide.id]: [...activeShapes, shape],
    });
    selectShape(id);
  };

  const deleteSelectedShape = () => {
    if (selectedShapeId == null) {
      return;
    }
    commitEdit({
      ...shapesBySlide,
      [activeSlide.id]: activeShapes.filter(
        shape => shape.id !== selectedShapeId,
      ),
    });
    selectShape(null);
  };

  // ---- format panel ----
  const isTextual =
    selectedShape != null &&
    (selectedShape.kind === 'text' ||
      selectedShape.kind === 'image' ||
      selectedShape.kind === 'stat');
  const hasType =
    selectedShape != null &&
    (selectedShape.kind === 'text' ||
      selectedShape.kind === 'bullets' ||
      selectedShape.kind === 'stat');

  const formatPanelBody =
    selectedShape == null ? (
      <EmptyState
        title="Select a shape to format"
        description="Click any shape on the canvas to edit its content, type, and frame."
        icon={<Icon icon={MousePointerClickIcon} size="lg" color="secondary" />}
        isCompact
      />
    ) : (
      <FormLayout>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <HStack gap={2} vAlign="center">
              <Heading level={2}>Format</Heading>
              <Badge label={KIND_LABEL[selectedShape.kind]} variant="neutral" />
            </HStack>
          </StackItem>
          <IconButton
            label="Delete shape"
            tooltip="Delete shape"
            icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={deleteSelectedShape}
          />
        </HStack>

        <TextInput
          label="Content"
          value={selectedShape.text}
          onChange={value => updateSelectedShape({text: value})}
          isDisabled={!isTextual}
          description={
            selectedShape.kind === 'image'
              ? 'Image placeholder file name.'
              : undefined
          }
        />

        <Slider
          label="Font size"
          min={14}
          max={72}
          step={1}
          value={selectedShape.size}
          onChange={(value: number) => updateSelectedShape({size: value})}
          formatValue={value => `${value} pt`}
          isDisabled={!hasType}
          width="100%"
        />

        <Field label="Weight" inputID="format-weight">
          <div id="format-weight">
            <SegmentedControl
              label="Font weight"
              value={String(selectedShape.weight)}
              onChange={value =>
                updateSelectedShape({weight: Number(value) as ShapeWeight})
              }
              isDisabled={selectedShape.kind !== 'text' && selectedShape.kind !== 'bullets'}
              size="sm">
              <SegmentedControlItem value="400" label="Reg" />
              <SegmentedControlItem value="600" label="Semi" />
              <SegmentedControlItem value="700" label="Bold" />
            </SegmentedControl>
          </div>
        </Field>

        <Field label="Align" inputID="format-align">
          <div id="format-align">
            <SegmentedControl
              label="Text alignment"
              value={selectedShape.align}
              onChange={value =>
                updateSelectedShape({align: value as ShapeAlign})
              }
              isDisabled={selectedShape.kind !== 'text'}
              size="sm">
              <SegmentedControlItem value="left" label="Left" />
              <SegmentedControlItem value="center" label="Center" />
            </SegmentedControl>
          </div>
        </Field>

        <Field label="Frame" inputID="format-frame">
          <div id="format-frame">
            <HStack gap={1}>
              <NumberInput
                label="X"
                value={selectedShape.x}
                onChange={value => updateSelectedShape({x: value})}
                min={0}
                max={CANVAS_W - 40}
                step={10}
                size="sm"
                width={72}
              />
              <NumberInput
                label="Y"
                value={selectedShape.y}
                onChange={value => updateSelectedShape({y: value})}
                min={0}
                max={CANVAS_H - 40}
                step={10}
                size="sm"
                width={72}
              />
              <NumberInput
                label="W"
                value={selectedShape.w}
                onChange={value => updateSelectedShape({w: value})}
                min={40}
                max={CANVAS_W}
                step={10}
                size="sm"
                width={72}
              />
            </HStack>
          </div>
        </Field>

        <Selector
          label="Color role"
          options={COLOR_ROLE_OPTIONS}
          value={selectedShape.color}
          onChange={(value: string) =>
            updateSelectedShape({color: value as ColorRole})
          }
          isDisabled={selectedShape.kind === 'image'}
          size="sm"
          width="100%"
        />

        <Text type="supporting" color="secondary" hasTabularNumbers>
          {selectedShape.w}×{selectedShape.h} at ({selectedShape.x},{' '}
          {selectedShape.y}) · 960×720 grid
        </Text>
      </FormLayout>
    );

  const formatPanel = (
    <LayoutPanel width={280} label="Format panel">
      <div style={styles.formatScroll}>{formatPanelBody}</div>
    </LayoutPanel>
  );

  // ---- rail ----
  const tiles = SLIDE_ORDER.map((slide, index) => (
    <ThumbnailTile
      key={slide.id}
      name={slide.name}
      shapes={shapesBySlide[slide.id]}
      index={index}
      isActive={index === activeSlideIndex}
      onSelect={setActiveSlideIndex}
      isStrip={isCompact}
    />
  ));

  // ---- stage ----
  const stage = (
    <div style={styles.stageBackdrop}>
      <div style={styles.stageColumn}>
        <VStack gap={2}>
          <Card padding={0} style={styles.stageCard}>
            <AspectRatio ratio={4 / 3}>
              <SlideCanvas
                shapes={activeShapes}
                selectedShapeId={selectedShapeId}
                onSelectShape={selectShape}
                onDeselect={() => selectShape(null)}
              />
            </AspectRatio>
          </Card>
          <HStack hAlign="center">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Slide {activeSlideIndex + 1} of {SLIDE_ORDER.length} ·{' '}
              {activeSlide.name} · {activeShapes.length}{' '}
              {activeShapes.length === 1 ? 'shape' : 'shapes'}
            </Text>
          </HStack>
        </VStack>
      </div>
    </div>
  );

  const content = (
    <VStack gap={0} style={styles.fill}>
      {isRehearsing && (
        <div style={styles.bannerRegion}>
          <Banner
            status="info"
            container="section"
            title="Rehearsal started"
            description="Presenting from slide 1 with speaker notes hidden — dismiss this banner or press End rehearsal to stop."
            isDismissable
            onDismiss={() => setIsRehearsing(false)}
          />
        </div>
      )}
      {isCompact && (
        <>
          <div style={styles.stripScroll}>
            <HStack gap={2}>{tiles}</HStack>
          </div>
          <Divider />
        </>
      )}
      {stage}
    </VStack>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Icon icon={PresentationIcon} size="md" color="secondary" />
                  <Heading level={1}>{DECK_FILE_NAME}</Heading>
                  {!isCompact && <Badge label="Editing" variant="blue" />}
                </HStack>
              </StackItem>
              {/* Undo/Redo gray out at the ends of the edit stack. */}
              <HStack gap={1} vAlign="center">
                <IconButton
                  label="Undo"
                  tooltip="Undo last edit"
                  icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
                  variant="ghost"
                  size="sm"
                  isDisabled={past.length === 0}
                  onClick={undo}
                />
                <IconButton
                  label="Redo"
                  tooltip="Redo edit"
                  icon={<Icon icon={Redo2Icon} size="sm" color="inherit" />}
                  variant="ghost"
                  size="sm"
                  isDisabled={future.length === 0}
                  onClick={redo}
                />
              </HStack>
              <Divider orientation="vertical" style={styles.headerDivider} />
              <Toolbar
                label="Insert"
                size="sm"
                gap={1}
                startContent={
                  isCompact ? (
                    <>
                      <IconButton
                        label="Insert text box"
                        tooltip="Insert text box"
                        icon={<Icon icon={TypeIcon} size="sm" color="inherit" />}
                        variant="ghost"
                        size="sm"
                        onClick={() => insertShape('text')}
                      />
                      <IconButton
                        label="Insert shape"
                        tooltip="Insert shape"
                        icon={<Icon icon={SquareIcon} size="sm" color="inherit" />}
                        variant="ghost"
                        size="sm"
                        onClick={() => insertShape('bar')}
                      />
                      <IconButton
                        label="Insert image placeholder"
                        tooltip="Insert image placeholder"
                        icon={<Icon icon={ImageIcon} size="sm" color="inherit" />}
                        variant="ghost"
                        size="sm"
                        onClick={() => insertShape('image')}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        label="Text"
                        variant="ghost"
                        size="sm"
                        icon={<Icon icon={TypeIcon} size="sm" color="inherit" />}
                        tooltip="Insert a text box at (320, 320)"
                        onClick={() => insertShape('text')}
                      />
                      <Button
                        label="Shape"
                        variant="ghost"
                        size="sm"
                        icon={<Icon icon={SquareIcon} size="sm" color="inherit" />}
                        tooltip="Insert a rectangle at (320, 320)"
                        onClick={() => insertShape('bar')}
                      />
                      <Button
                        label="Image"
                        variant="ghost"
                        size="sm"
                        icon={<Icon icon={ImageIcon} size="sm" color="inherit" />}
                        tooltip="Insert an image placeholder at (320, 320)"
                        onClick={() => insertShape('image')}
                      />
                    </>
                  )
                }
              />
              {isMid && (
                <IconButton
                  label={isFormatOpen ? 'Hide format panel' : 'Show format panel'}
                  tooltip={isFormatOpen ? 'Hide format panel' : 'Show format panel'}
                  icon={<Icon icon={PanelRightIcon} size="sm" color="inherit" />}
                  variant={isFormatOpen ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setIsFormatOpen(prev => !prev)}
                />
              )}
              <Button
                label={isRehearsing ? 'End rehearsal' : 'Present'}
                variant={isRehearsing ? 'secondary' : 'primary'}
                size="sm"
                icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
                onClick={() => setIsRehearsing(prev => !prev)}
              />
            </HStack>
          </LayoutHeader>
        }
        start={
          isCompact ? undefined : (
            <LayoutPanel width={128} padding={0} label="Slide thumbnails">
              <div style={styles.railScroll}>
                <VStack gap={3}>{tiles}</VStack>
              </div>
            </LayoutPanel>
          )
        }
        end={isMid ? (isFormatOpen ? formatPanel : undefined) : formatPanel}
        content={<LayoutContent padding={0}>{content}</LayoutContent>}
      />
    </div>
  );
}
