// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (glyph/tone catalogs, emoji presets,
 *   8 named gradient presets, generator templates and a fixed "Generate"
 *   cycle sequence, in-context specimen rows for one workspace)
 * @output Workspace avatar/icon design studio: left column holds a live
 *   preview card rendering the current icon at four sizes (xs/sm/md/lg)
 *   plus in-context specimens (sidebar row, switcher row); right column is
 *   a TabList across four icon types — Icon (5 glyphs x 4 tones swatch
 *   grid), Emoji (preset grid + tone backdrop selector), Gradient (8 named
 *   preset swatches + a generator panel with style SegmentedControl,
 *   Zoom/Angle Sliders, 3 color-stop swatch pickers, a named-template
 *   Selector, and a Generate button cycling a deterministic sequence), and
 *   Upload (dropzone FileInput + crop preview placeholder + downscale
 *   note). Every control updates the preview via inline CSS gradient
 *   strings built from state.
 * @position Page template; emitted by `astryx template workspace-icon-studio`
 *
 * Frame: Layout height="fill". LayoutHeader carries the studio title, the
 * workspace context (name + mono hashtag), and Reset / Save actions.
 * LayoutContent hosts a two-column body: fixed ~300px preview column on
 * the left, the icon-type tabs and editor panels on the right.
 *
 * Responsive contract:
 * - The page measures its own width with a ResizeObserver (useElementWidth)
 *   because the demo stage never fires viewport media queries.
 * - >760px: preview column (300px) beside the editor column; gradient
 *   preset swatches sit 4-up.
 * - <=760px: columns stack — preview card first (tiles stay in one row),
 *   editor below; the header drops the hashtag caption.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {FileInput} from '@astryxdesign/core/FileInput';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {
  CompassIcon,
  FlaskConicalIcon,
  ImageIcon,
  RocketIcon,
  SproutIcon,
  WandSparklesIcon,
  ZapIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  wrap: {height: '100%'},
  body: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    alignItems: 'flex-start',
  },
  bodyCompact: {flexDirection: 'column'},
  previewColumn: {width: 300, flexShrink: 0},
  previewColumnCompact: {width: '100%'},
  editorColumn: {flex: 1, minWidth: 0, width: '100%'},
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  tileRow: {alignItems: 'flex-end'},
  tileLabel: {textAlign: 'center'},
  contextRow: {paddingBlock: 'var(--spacing-1)'},
  // Swatch grids are plain button grids; selection is an accent outline.
  glyphGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 44px)',
    gap: 'var(--spacing-2)',
  },
  emojiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 44px)',
    gap: 'var(--spacing-2)',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
    maxWidth: 480,
  },
  swatchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  },
  swatchSelected: {
    outline: '2px solid var(--color-border-focus, #4f46e5)',
    outlineOffset: 2,
  },
  presetButton: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: 14,
    border: 'var(--border-width) solid var(--color-border)',
    cursor: 'pointer',
    padding: 0,
  },
  backdropSwatch: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: 'var(--border-width) solid var(--color-border)',
    cursor: 'pointer',
    padding: 0,
  },
  stopSwatch: {
    width: 22,
    height: 22,
    borderRadius: 7,
    border: 'var(--border-width) solid var(--color-border)',
    cursor: 'pointer',
    padding: 0,
  },
  tabBody: {paddingTop: 'var(--spacing-4)'},
  cropFrame: {
    position: 'relative',
    width: 180,
    height: 180,
    borderRadius: 'var(--radius-container)',
    border: '1px dashed var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropMark: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: 'var(--color-text-secondary, #6b7280)',
    borderStyle: 'solid',
  },
  emojiChar: {lineHeight: 1, display: 'block'},
  sliderBlock: {maxWidth: 360},
};

const CROP_MARKS: CSSProperties[] = [
  {top: -1, left: -1, borderWidth: '2px 0 0 2px'},
  {top: -1, right: -1, borderWidth: '2px 2px 0 0'},
  {bottom: -1, left: -1, borderWidth: '0 0 2px 2px'},
  {bottom: -1, right: -1, borderWidth: '0 2px 2px 0'},
];

// ============= DATA =============
// Deterministic fixtures: fixed catalogs, no clocks, no randomness.

const WORKSPACE_NAME = 'Meridian Ops';
const WORKSPACE_HASHTAG = '#meridian-ops';

type IconType = 'icon' | 'emoji' | 'gradient' | 'upload';

const PREVIEW_SIZES: ReadonlyArray<{id: string; label: string; px: number}> = [
  {id: 'xs', label: 'xs', px: 24},
  {id: 'sm', label: 'sm', px: 32},
  {id: 'md', label: 'md', px: 48},
  {id: 'lg', label: 'lg', px: 72},
];

type GlyphComponent = typeof RocketIcon;

const GLYPHS: ReadonlyArray<{
  id: string;
  name: string;
  component: GlyphComponent;
}> = [
  {id: 'rocket', name: 'Rocket', component: RocketIcon},
  {id: 'compass', name: 'Compass', component: CompassIcon},
  {id: 'sprout', name: 'Sprout', component: SproutIcon},
  {id: 'bolt', name: 'Bolt', component: ZapIcon},
  {id: 'flask', name: 'Flask', component: FlaskConicalIcon},
];

const TONES: ReadonlyArray<{id: string; name: string; color: string}> = [
  {id: 'slate', name: 'Slate', color: '#475569'},
  {id: 'indigo', name: 'Indigo', color: '#4f46e5'},
  {id: 'emerald', name: 'Emerald', color: '#059669'},
  {id: 'amber', name: 'Amber', color: '#d97706'},
];

const EMOJIS: readonly string[] = [
  '🚀',
  '🧭',
  '🌊',
  '🔥',
  '🌿',
  '⚡',
  '🎯',
  '🛠️',
  '📡',
  '🧪',
  '🪐',
  '🎛️',
  '🗺️',
  '🦉',
  '⛰️',
  '💠',
];

const BACKDROPS: ReadonlyArray<{id: string; name: string; color: string}> = [
  {id: 'mist', name: 'Mist', color: '#e2e8f0'},
  {id: 'sky', name: 'Sky', color: '#dbeafe'},
  {id: 'blush', name: 'Blush', color: '#fce7f3'},
  {id: 'sand', name: 'Sand', color: '#fef3c7'},
  {id: 'fern', name: 'Fern', color: '#dcfce7'},
];

const GRADIENT_PRESETS: ReadonlyArray<{
  id: string;
  name: string;
  css: string;
}> = [
  {
    id: 'aurora',
    name: 'Aurora',
    css: 'linear-gradient(135deg, #22d3ee 0%, #6366f1 55%, #a21caf 100%)',
  },
  {
    id: 'dawn',
    name: 'Dawn',
    css: 'linear-gradient(160deg, #fde68a 0%, #fb923c 55%, #e11d48 100%)',
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    css: 'radial-gradient(120% 120% at 30% 20%, #67e8f9 0%, #0ea5e9 55%, #1e40af 100%)',
  },
  {
    id: 'orchid',
    name: 'Orchid',
    css: 'linear-gradient(120deg, #f0abfc 0%, #a855f7 60%, #6d28d9 100%)',
  },
  {
    id: 'moss',
    name: 'Moss',
    css: 'linear-gradient(150deg, #bef264 0%, #22c55e 60%, #166534 100%)',
  },
  {
    id: 'copper',
    name: 'Copper',
    css: 'linear-gradient(140deg, #fcd34d 0%, #ea580c 55%, #7c2d12 100%)',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    css: 'radial-gradient(140% 140% at 70% 15%, #475569 0%, #1e293b 55%, #020617 100%)',
  },
  {
    id: 'prism',
    name: 'Prism',
    css: 'conic-gradient(from 220deg at 50% 50%, #f43f5e, #f59e0b, #22c55e, #3b82f6, #a855f7, #f43f5e)',
  },
];

type GradientStyle = 'mesh' | 'linear' | 'radial' | 'conic';

const STOP_PALETTE: ReadonlyArray<{id: string; name: string; color: string}> = [
  {id: 'rose', name: 'Rose', color: '#f43f5e'},
  {id: 'ember', name: 'Ember', color: '#fb923c'},
  {id: 'citrine', name: 'Citrine', color: '#facc15'},
  {id: 'jade', name: 'Jade', color: '#22c55e'},
  {id: 'teal', name: 'Teal', color: '#14b8a6'},
  {id: 'azure', name: 'Azure', color: '#3b82f6'},
  {id: 'violet', name: 'Violet', color: '#8b5cf6'},
  {id: 'magenta', name: 'Magenta', color: '#ec4899'},
];

interface GeneratorConfig {
  style: GradientStyle;
  zoom: number; // 50-200 (%)
  angle: number; // 0-360 (deg)
  stops: [string, string, string];
}

const TEMPLATE_OPTIONS: ReadonlyArray<{value: string; label: string}> = [
  {value: 'solstice-drift', label: 'Solstice Drift'},
  {value: 'harbor-glass', label: 'Harbor Glass'},
  {value: 'ember-field', label: 'Ember Field'},
  {value: 'polar-halo', label: 'Polar Halo'},
  {value: 'velvet-dusk', label: 'Velvet Dusk'},
  {value: 'citrus-static', label: 'Citrus Static'},
  {value: 'neon-reef', label: 'Neon Reef'},
];

const TEMPLATE_CONFIGS: Record<string, GeneratorConfig> = {
  'solstice-drift': {
    style: 'mesh',
    zoom: 130,
    angle: 135,
    stops: ['#f43f5e', '#facc15', '#8b5cf6'],
  },
  'harbor-glass': {
    style: 'linear',
    zoom: 110,
    angle: 200,
    stops: ['#14b8a6', '#3b82f6', '#8b5cf6'],
  },
  'ember-field': {
    style: 'radial',
    zoom: 150,
    angle: 45,
    stops: ['#facc15', '#fb923c', '#f43f5e'],
  },
  'polar-halo': {
    style: 'conic',
    zoom: 100,
    angle: 300,
    stops: ['#3b82f6', '#14b8a6', '#8b5cf6'],
  },
  'velvet-dusk': {
    style: 'linear',
    zoom: 90,
    angle: 320,
    stops: ['#8b5cf6', '#ec4899', '#f43f5e'],
  },
  'citrus-static': {
    style: 'conic',
    zoom: 120,
    angle: 80,
    stops: ['#facc15', '#22c55e', '#fb923c'],
  },
  'neon-reef': {
    style: 'mesh',
    zoom: 160,
    angle: 60,
    stops: ['#14b8a6', '#3b82f6', '#ec4899'],
  },
};

// "Generate" cycles this fixed sequence — deterministic, no randomness.
const GENERATE_SEQUENCE: readonly GeneratorConfig[] = [
  {style: 'mesh', zoom: 145, angle: 25, stops: ['#22c55e', '#3b82f6', '#facc15']},
  {style: 'radial', zoom: 170, angle: 210, stops: ['#ec4899', '#8b5cf6', '#3b82f6']},
  {style: 'conic', zoom: 100, angle: 140, stops: ['#fb923c', '#f43f5e', '#8b5cf6']},
  {style: 'linear', zoom: 80, angle: 15, stops: ['#14b8a6', '#facc15', '#fb923c']},
  {style: 'mesh', zoom: 110, angle: 260, stops: ['#f43f5e', '#ec4899', '#3b82f6']},
];

// ============= HELPERS =============

/** Measured page width — the demo stage never fires viewport media queries. */
function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/** Builds the generator's CSS background from state — pure and deterministic. */
function buildGeneratorCss(config: GeneratorConfig): string {
  const {style, zoom, angle, stops} = config;
  const [c0, c1, c2] = stops;
  if (style === 'linear') {
    const mid = Math.min(80, Math.max(20, Math.round(zoom / 2)));
    return `linear-gradient(${angle}deg, ${c0} 0%, ${c1} ${mid}%, ${c2} 100%)`;
  }
  if (style === 'radial') {
    const radians = (angle * Math.PI) / 180;
    const focalX = 50 + Math.round(32 * Math.cos(radians));
    const focalY = 50 + Math.round(32 * Math.sin(radians));
    return `radial-gradient(${zoom}% ${zoom}% at ${focalX}% ${focalY}%, ${c0} 0%, ${c1} 48%, ${c2} 100%)`;
  }
  if (style === 'conic') {
    return `conic-gradient(from ${angle}deg at 50% 50%, ${c0}, ${c1}, ${c2}, ${c0})`;
  }
  // Mesh: three soft radial blobs over a linear base.
  const blob = Math.round(zoom * 0.9);
  return (
    `radial-gradient(${blob}% ${blob}% at 18% 22%, ${c0} 0%, transparent 62%), ` +
    `radial-gradient(${blob}% ${blob}% at 82% 28%, ${c1} 0%, transparent 66%), ` +
    `radial-gradient(${blob}% ${blob}% at 50% 88%, ${c2} 0%, transparent 70%), ` +
    `linear-gradient(${angle}deg, ${c0}, ${c2})`
  );
}

type TileArt =
  | {kind: 'icon'; component: GlyphComponent; color: string}
  | {kind: 'emoji'; emoji: string; backdrop: string}
  | {kind: 'gradient'; css: string}
  | {kind: 'upload'; hasFile: boolean};

/** One preview tile. Renders the current icon at an arbitrary pixel size. */
function PreviewTile({px, art}: {px: number; art: TileArt}) {
  const radius = Math.max(6, Math.round(px * 0.26));
  const glyphSize = Math.round(px * 0.55);
  const base: CSSProperties = {
    width: px,
    height: px,
    borderRadius: radius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  };
  if (art.kind === 'icon') {
    const GlyphComp = art.component;
    return (
      <div
        style={{...base, backgroundColor: art.color, color: '#ffffff'}}
        aria-hidden>
        <GlyphComp width={glyphSize} height={glyphSize} strokeWidth={2} />
      </div>
    );
  }
  if (art.kind === 'emoji') {
    return (
      <div
        style={{
          ...base,
          backgroundColor: art.backdrop,
          border: 'var(--border-width) solid var(--color-border)',
        }}
        aria-hidden>
        <span style={{...styles.emojiChar, fontSize: Math.round(px * 0.52)}}>
          {art.emoji}
        </span>
      </div>
    );
  }
  if (art.kind === 'gradient') {
    return <div style={{...base, background: art.css}} aria-hidden />;
  }
  return (
    <div
      style={{
        ...base,
        backgroundColor: 'var(--color-background-muted)',
        border: '1px dashed var(--color-border)',
      }}
      aria-hidden>
      <Icon
        icon={ImageIcon}
        size={px >= 44 ? 'md' : 'sm'}
        color="secondary"
      />
    </div>
  );
}

// ============= PAGE =============

export default function WorkspaceIconStudioTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 760;

  const [iconType, setIconType] = useState<IconType>('gradient');

  // Icon tab
  const [glyphId, setGlyphId] = useState('rocket');
  const [toneId, setToneId] = useState('indigo');

  // Emoji tab
  const [emoji, setEmoji] = useState('🧭');
  const [backdropId, setBackdropId] = useState('sky');

  // Gradient tab: either a named preset or the generator ("custom").
  const [presetId, setPresetId] = useState<string | null>('aurora');
  const [genStyle, setGenStyle] = useState<GradientStyle>('mesh');
  const [zoom, setZoom] = useState(130);
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<[string, string, string]>([
    '#f43f5e',
    '#facc15',
    '#8b5cf6',
  ]);
  const [templateChoice, setTemplateChoice] = useState('solstice-drift');
  const [generateIndex, setGenerateIndex] = useState(0);

  // Upload tab
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const glyph = GLYPHS.find(item => item.id === glyphId) ?? GLYPHS[0];
  const tone = TONES.find(item => item.id === toneId) ?? TONES[0];
  const backdrop =
    BACKDROPS.find(item => item.id === backdropId) ?? BACKDROPS[0];
  const preset = GRADIENT_PRESETS.find(item => item.id === presetId) ?? null;

  const generatorConfig: GeneratorConfig = {
    style: genStyle,
    zoom,
    angle,
    stops,
  };
  const gradientCss =
    preset != null ? preset.css : buildGeneratorCss(generatorConfig);

  const art: TileArt =
    iconType === 'icon'
      ? {kind: 'icon', component: glyph.component, color: tone.color}
      : iconType === 'emoji'
        ? {kind: 'emoji', emoji, backdrop: backdrop.color}
        : iconType === 'gradient'
          ? {kind: 'gradient', css: gradientCss}
          : {kind: 'upload', hasFile: uploadFile != null};

  const summary =
    iconType === 'icon'
      ? `Icon · ${glyph.name} on ${tone.name}`
      : iconType === 'emoji'
        ? `Emoji · ${emoji} on ${backdrop.name}`
        : iconType === 'gradient'
          ? preset != null
            ? `Gradient · ${preset.name} preset`
            : `Gradient · Custom ${genStyle}`
          : uploadFile != null
            ? `Upload · ${uploadFile.name}`
            : 'Upload · No image yet';

  const applyGeneratorConfig = (config: GeneratorConfig) => {
    setGenStyle(config.style);
    setZoom(config.zoom);
    setAngle(config.angle);
    setStops(config.stops);
    setPresetId(null);
  };

  const setStopColor = (index: number, color: string) => {
    setStops(prev => {
      const next: [string, string, string] = [...prev];
      next[index] = color;
      return next;
    });
    setPresetId(null);
  };

  const handleGenerate = () => {
    applyGeneratorConfig(
      GENERATE_SEQUENCE[generateIndex % GENERATE_SEQUENCE.length],
    );
    setGenerateIndex(prev => prev + 1);
  };

  const handleReset = () => {
    setIconType('gradient');
    setGlyphId('rocket');
    setToneId('indigo');
    setEmoji('🧭');
    setBackdropId('sky');
    setPresetId('aurora');
    setGenStyle('mesh');
    setZoom(130);
    setAngle(135);
    setStops(['#f43f5e', '#facc15', '#8b5cf6']);
    setTemplateChoice('solstice-drift');
    setGenerateIndex(0);
    setUploadFile(null);
  };

  // ---------- Left column: live preview ----------

  const previewColumn = (
    <div
      style={{
        ...styles.previewColumn,
        ...(isCompact ? styles.previewColumnCompact : undefined),
      }}>
      <VStack gap={4}>
        <Card padding={4}>
          <VStack gap={4}>
            <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
              Preview
            </Text>
            <HStack gap={4} style={styles.tileRow}>
              {PREVIEW_SIZES.map(size => (
                <VStack key={size.id} gap={1} hAlign="center">
                  <PreviewTile px={size.px} art={art} />
                  <div style={styles.tileLabel}>
                    <Text type="supporting" size="sm" color="secondary">
                      {size.label}
                    </Text>
                  </div>
                </VStack>
              ))}
            </HStack>
            <VStack gap={0}>
              <Text type="label">{WORKSPACE_NAME}</Text>
              <Text type="code" size="sm" color="secondary">
                {WORKSPACE_HASHTAG}
              </Text>
            </VStack>
            <Divider />
            <Text type="supporting" size="sm" color="secondary">
              {summary}
            </Text>
          </VStack>
        </Card>
        <Card padding={4}>
          <VStack gap={3}>
            <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
              In context
            </Text>
            <HStack gap={2} vAlign="center" style={styles.contextRow}>
              <PreviewTile px={24} art={art} />
              <StackItem size="fill">
                <Text type="supporting" maxLines={1}>
                  {WORKSPACE_NAME}
                </Text>
              </StackItem>
              <Text type="supporting" size="sm" color="secondary">
                Sidebar
              </Text>
            </HStack>
            <HStack gap={2} vAlign="center" style={styles.contextRow}>
              <PreviewTile px={40} art={art} />
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="supporting" maxLines={1}>
                    {WORKSPACE_NAME}
                  </Text>
                  <Text type="supporting" size="sm" color="secondary">
                    12 members
                  </Text>
                </VStack>
              </StackItem>
              <Text type="supporting" size="sm" color="secondary">
                Switcher
              </Text>
            </HStack>
          </VStack>
        </Card>
      </VStack>
    </div>
  );

  // ---------- Icon tab ----------

  const iconPanel = (
    <VStack gap={3}>
      <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
        Glyph × tone
      </Text>
      <Text type="supporting" size="sm" color="secondary">
        Pick a glyph in the tone it should ship with — one tap sets both.
      </Text>
      <VStack gap={2}>
        {GLYPHS.map(glyphOption => {
          const GlyphComp = glyphOption.component;
          return (
            <HStack key={glyphOption.id} gap={3} vAlign="center">
              <div style={styles.glyphGrid}>
                {TONES.map(toneOption => {
                  const isSelected =
                    glyphId === glyphOption.id && toneId === toneOption.id;
                  return (
                    <button
                      key={toneOption.id}
                      type="button"
                      aria-label={`${glyphOption.name} on ${toneOption.name}`}
                      aria-pressed={isSelected}
                      style={{
                        ...styles.swatchButton,
                        backgroundColor: toneOption.color,
                        color: '#ffffff',
                        ...(isSelected ? styles.swatchSelected : undefined),
                      }}
                      onClick={() => {
                        setGlyphId(glyphOption.id);
                        setToneId(toneOption.id);
                      }}>
                      <GlyphComp width={22} height={22} strokeWidth={2} />
                    </button>
                  );
                })}
              </div>
              <Text type="supporting" size="sm" color="secondary">
                {glyphOption.name}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    </VStack>
  );

  // ---------- Emoji tab ----------

  const emojiPanel = (
    <VStack gap={4}>
      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
          Presets
        </Text>
        <div style={styles.emojiGrid}>
          {EMOJIS.map(emojiOption => (
            <button
              key={emojiOption}
              type="button"
              aria-label={`Use ${emojiOption} as the workspace icon`}
              aria-pressed={emoji === emojiOption}
              style={{
                ...styles.swatchButton,
                backgroundColor: backdrop.color,
                ...(emoji === emojiOption ? styles.swatchSelected : undefined),
              }}
              onClick={() => setEmoji(emojiOption)}>
              <span style={{...styles.emojiChar, fontSize: 22}}>
                {emojiOption}
              </span>
            </button>
          ))}
        </div>
      </VStack>
      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
          Backdrop tone
        </Text>
        <HStack gap={2} vAlign="center">
          {BACKDROPS.map(backdropOption => (
            <button
              key={backdropOption.id}
              type="button"
              aria-label={`${backdropOption.name} backdrop`}
              aria-pressed={backdropId === backdropOption.id}
              style={{
                ...styles.backdropSwatch,
                backgroundColor: backdropOption.color,
                ...(backdropId === backdropOption.id
                  ? styles.swatchSelected
                  : undefined),
              }}
              onClick={() => setBackdropId(backdropOption.id)}
            />
          ))}
          <Text type="supporting" size="sm" color="secondary">
            {backdrop.name}
          </Text>
        </HStack>
      </VStack>
    </VStack>
  );

  // ---------- Gradient tab ----------

  const gradientPanel = (
    <VStack gap={4}>
      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
          Named presets
        </Text>
        <div style={styles.presetGrid}>
          {GRADIENT_PRESETS.map(presetOption => (
            <VStack key={presetOption.id} gap={1} hAlign="center">
              <button
                type="button"
                aria-label={`${presetOption.name} gradient preset`}
                aria-pressed={presetId === presetOption.id}
                style={{
                  ...styles.presetButton,
                  background: presetOption.css,
                  ...(presetId === presetOption.id
                    ? styles.swatchSelected
                    : undefined),
                }}
                onClick={() => setPresetId(presetOption.id)}
              />
              <Text type="supporting" size="sm" color="secondary">
                {presetOption.name}
              </Text>
            </VStack>
          ))}
        </div>
      </VStack>
      <Card padding={4}>
        <VStack gap={4}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
                Generator
              </Text>
            </StackItem>
            {preset == null && <Badge label="Custom" variant="info" />}
          </HStack>
          <SegmentedControl
            label="Gradient style"
            size="sm"
            value={genStyle}
            onChange={value => {
              setGenStyle(value as GradientStyle);
              setPresetId(null);
            }}>
            <SegmentedControlItem value="mesh" label="Mesh" />
            <SegmentedControlItem value="linear" label="Linear" />
            <SegmentedControlItem value="radial" label="Radial" />
            <SegmentedControlItem value="conic" label="Conic" />
          </SegmentedControl>
          <div style={styles.sliderBlock}>
            <VStack gap={3}>
              <Slider
                label="Zoom"
                min={50}
                max={200}
                step={5}
                value={zoom}
                onChange={(value: number) => {
                  setZoom(value);
                  setPresetId(null);
                }}
                valueDisplay="text"
                formatValue={value => `${value}%`}
              />
              <Slider
                label="Angle"
                min={0}
                max={360}
                step={5}
                value={angle}
                onChange={(value: number) => {
                  setAngle(value);
                  setPresetId(null);
                }}
                valueDisplay="text"
                formatValue={value => `${value}°`}
              />
            </VStack>
          </div>
          <VStack gap={2}>
            {stops.map((stopColor, index) => (
              <HStack key={`stop-${index}`} gap={2} vAlign="center">
                <Text type="supporting" size="sm" color="secondary">
                  Stop {index + 1}
                </Text>
                <StackItem size="fill" />
                {STOP_PALETTE.map(paletteColor => (
                  <button
                    key={paletteColor.id}
                    type="button"
                    aria-label={`Stop ${index + 1}: ${paletteColor.name}`}
                    aria-pressed={stopColor === paletteColor.color}
                    style={{
                      ...styles.stopSwatch,
                      backgroundColor: paletteColor.color,
                      ...(stopColor === paletteColor.color
                        ? styles.swatchSelected
                        : undefined),
                    }}
                    onClick={() => setStopColor(index, paletteColor.color)}
                  />
                ))}
              </HStack>
            ))}
          </VStack>
          <HStack gap={2} vAlign="end">
            <StackItem size="fill">
              <Selector
                label="Start from a template"
                size="sm"
                options={[...TEMPLATE_OPTIONS]}
                value={templateChoice}
                onChange={value => {
                  setTemplateChoice(value);
                  const config = TEMPLATE_CONFIGS[value];
                  if (config != null) {
                    applyGeneratorConfig(config);
                  }
                }}
              />
            </StackItem>
            <Button
              label="Generate"
              size="sm"
              variant="secondary"
              icon={<Icon icon={WandSparklesIcon} size="sm" color="inherit" />}
              onClick={handleGenerate}
            />
          </HStack>
          <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
            Generate cycles a curated sequence — run{' '}
            {(generateIndex % GENERATE_SEQUENCE.length) + 1} of{' '}
            {GENERATE_SEQUENCE.length} is next.
          </Text>
        </VStack>
      </Card>
    </VStack>
  );

  // ---------- Upload tab ----------

  const uploadPanel = (
    <VStack gap={4}>
      <FileInput
        label="Workspace artwork"
        description="PNG, JPG, or WebP up to 8 MB. Square images work best."
        accept="image/png,image/jpeg,image/webp"
        mode="dropzone"
        value={uploadFile}
        onChange={files =>
          setUploadFile(Array.isArray(files) ? (files[0] ?? null) : files)
        }
      />
      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
          Crop preview
        </Text>
        <div style={styles.cropFrame}>
          {CROP_MARKS.map((mark, index) => (
            <div
              key={`mark-${index}`}
              style={{...styles.cropMark, ...mark}}
              aria-hidden
            />
          ))}
          <VStack gap={2} hAlign="center">
            <Icon icon={ImageIcon} size="lg" color="secondary" />
            <Text type="supporting" size="sm" color="secondary">
              {uploadFile != null ? uploadFile.name : 'Drop artwork to preview'}
            </Text>
          </VStack>
        </div>
        <Text type="supporting" size="sm" color="secondary">
          Downscaled to 256px WebP · square crop applied automatically.
        </Text>
      </VStack>
    </VStack>
  );

  // ---------- Frame ----------

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>Icon studio</Heading>
                  <Text type="supporting" color="secondary">
                    {WORKSPACE_NAME}
                  </Text>
                  {!isCompact && (
                    <Text type="code" size="sm" color="secondary">
                      {WORKSPACE_HASHTAG}
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <Button
                label="Reset"
                variant="ghost"
                size="sm"
                onClick={handleReset}
              />
              <Button label="Save icon" size="sm" onClick={() => {}} />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <div
              style={{
                ...styles.body,
                ...(isCompact ? styles.bodyCompact : undefined),
              }}>
              {previewColumn}
              <div style={styles.editorColumn}>
                <VStack gap={0}>
                  <TabList
                    value={iconType}
                    onChange={value => setIconType(value as IconType)}
                    hasDivider
                    aria-label="Icon type">
                    <Tab value="icon" label="Icon" />
                    <Tab value="emoji" label="Emoji" />
                    <Tab value="gradient" label="Gradient" />
                    <Tab value="upload" label="Upload" />
                  </TabList>
                  <div style={styles.tabBody}>
                    {iconType === 'icon' && iconPanel}
                    {iconType === 'emoji' && emojiPanel}
                    {iconType === 'gradient' && gradientPanel}
                    {iconType === 'upload' && uploadPanel}
                  </div>
                </VStack>
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
