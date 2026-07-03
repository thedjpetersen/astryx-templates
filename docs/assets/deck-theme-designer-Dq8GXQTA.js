var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (four preset palettes with literal hex
 *   sets — Horizon, Ember, Meadow, Slate — three font pairings, and five
 *   layout masters, each a list of positioned MasterShape records on a
 *   960x720 canvas grid whose colors are ROLES — ink/accent/wash/paper/muted —
 *   resolved against the active palette at render time; sample deck copy is
 *   'Quarterly Kickoff' / 'Fixture Deck · 2026' plus three talking-point
 *   bullets and a '92%' statement stat)
 * @output Deck THEME DESIGNER: a left 320px controls panel (theme name
 *   TextInput; a 2x2 grid of preset-palette SelectableCards, each showing a
 *   five-swatch hex strip; a font-pairing Selector; a Compact/Default/Display
 *   type-scale SegmentedControl; Switches for slide numbers and footer with a
 *   footer-text TextInput that disables while its Switch is off; and a
 *   layout-masters RadioList) driving a right preview area — the RadioList's
 *   chosen master enlarged at top (maxWidth 620 4:3 Card) above a Grid of the
 *   remaining masters, every canvas re-rendered live through one
 *   theme-parameterized renderer, with an 'Apply theme' Button that raises a
 *   dismissible success Banner ('Horizon applied to 24 slides in
 *   q3-kickoff.pptx') and a Reset button restoring the fixture defaults
 * @position Page template; emitted by \`astryx template deck-theme-designer\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the designer chrome
 * (palette Icon, 'Theme designer' Heading, active theme-name readout, ghost
 * Reset + primary 'Apply theme' Buttons). LayoutPanel start 320 hosts the
 * scrollable controls form; LayoutContent scrolls the preview column
 * (Banner slot, enlarged master, remaining-masters Grid). Choose over
 * slide-editor-canvas when the edits are DECK-WIDE STYLES (palette, type
 * scale, masters) rather than one slide's shapes; choose over
 * slide-deck-viewer because these previews visualize theme variables, not
 * page a document — the archetype is settings-panel-plus-live-preview.
 *
 * Responsive contract:
 * - >900px: header | controls panel 320 (fixed, scrolls) | preview column
 *   (fills, scrolls). The selected master caps at 620px wide; the rest flow
 *   in a minmax(220px) Grid.
 * - <=900px: the controls panel becomes a top section above the previews in
 *   one scroll column, and the enlarged master drops back into the grid so
 *   all five masters render at grid size. The header's theme-name readout is
 *   hidden so the title and Reset/Apply buttons fit narrow widths.
 * - Master canvases use container-query (cqw) type sizing multiplied by the
 *   chosen type scale, so identical shape fixtures paint correctly at 220px
 *   tiles and the 620px hero — and repaint instantly on every control change.
 *
 * Container policy (settings-plus-preview archetype): frame-first rows and
 * panels; the only Cards are the slide surfaces (palette "paper", colorScheme
 * locked to light) and the palette SelectableCards. No clocks, randomness, or
 * network assets — slide artwork is positioned text/shape data.
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
import {Heading, Text} from '@astryxdesign/core/Text';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Field} from '@astryxdesign/core/Field';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {CheckIcon, PaletteIcon, RotateCcwIcon} from 'lucide-react';

// ============= CANVAS GEOMETRY =============
// Classic 4:3 PowerPoint page, 960x720 virtual units. Positions are
// percentages of the canvas; font sizes are cqw so the same fixture paints
// the 620px hero and the 220px grid tiles.

const CANVAS_W = 960;
const CANVAS_H = 720;

/** Horizontal canvas unit -> percentage of slide width. */
const pctX = (v: number) => \`\${((v / CANVAS_W) * 100).toFixed(3)}%\`;
/** Vertical canvas unit -> percentage of slide height. */
const pctY = (v: number) => \`\${((v / CANVAS_H) * 100).toFixed(3)}%\`;
/** Canvas px -> container-query width units (the canvas is inline-size). */
const cqw = (v: number) => \`\${((v / CANVAS_W) * 100).toFixed(3)}cqw\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Controls panel: fixed 320 shell, form scrolls inside.
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // Preview column: muted backdrop, scrolls independently of the panel.
  previewScroll: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6)',
  },
  previewColumn: {
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
  },
  // Hero stage: the enlarged master centers like a slide stage so the
  // preview column reads balanced beside the full-width grid below.
  heroWrap: {
    width: '100%',
    maxWidth: 620,
    marginInline: 'auto',
  },
  heroCard: {
    width: '100%',
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
  },
  tileCard: {overflow: 'hidden'},
  // Palette swatch chips inside the SelectableCards.
  swatchChip: {
    height: 18,
    flex: 1,
    borderRadius: 4,
    border: '1px solid var(--color-border)',
  },
  // <=900px: the controls become a top section above the previews.
  stackedControls: {
    padding: 'var(--spacing-4)',
  },
};

// ============= THEME FIXTURES =============
// Deterministic fixtures: literal hex palettes, fixed font stacks, no
// clocks, randomness, or network assets.

const DECK_FILE_NAME = 'q3-kickoff.pptx';
const DECK_SLIDE_COUNT = 24;

interface Palette {
  id: string;
  name: string;
  ink: string; // primary text
  accent: string; // bars, stats, bullet dots
  wash: string; // tinted fill panels / statement background
  paper: string; // slide surface
  muted: string; // secondary text, footer, numbers
}

const PALETTES: Palette[] = [
  {
    id: 'horizon',
    name: 'Horizon',
    ink: '#0B2545',
    accent: '#1D6FB8',
    wash: '#E8F1FA',
    paper: '#F7FAFD',
    muted: '#6E7D8B',
  },
  {
    id: 'ember',
    name: 'Ember',
    ink: '#2B2118',
    accent: '#D2622A',
    wash: '#FBEDE2',
    paper: '#FFFDFB',
    muted: '#8A7B6E',
  },
  {
    id: 'meadow',
    name: 'Meadow',
    ink: '#1E3325',
    accent: '#2F8F5B',
    wash: '#E6F4EB',
    paper: '#F8FCF9',
    muted: '#6F8276',
  },
  {
    id: 'slate',
    name: 'Slate',
    ink: '#1C2733',
    accent: '#4A5B6C',
    wash: '#EDF1F5',
    paper: '#FFFFFF',
    muted: '#8393A2',
  },
];

const swatches = (p: Palette) => [p.ink, p.accent, p.wash, p.paper, p.muted];

interface FontPairing {
  value: string;
  label: string;
  heading: string;
  body: string;
}

const FONT_PAIRINGS: FontPairing[] = [
  {
    value: 'archer-public-sans',
    label: 'Archer / Public Sans',
    heading: '"Archer", "Rockwell", "Courier New", Georgia, serif',
    body: '"Public Sans", "Helvetica Neue", Arial, sans-serif',
  },
  {
    value: 'inter-inter',
    label: 'Inter / Inter',
    heading: '"Inter", system-ui, "Segoe UI", sans-serif',
    body: '"Inter", system-ui, "Segoe UI", sans-serif',
  },
  {
    value: 'fraunces-source-sans',
    label: 'Fraunces / Source Sans',
    heading: '"Fraunces", "Iowan Old Style", Georgia, serif',
    body: '"Source Sans 3", "Source Sans Pro", Verdana, sans-serif',
  },
];

type TypeScale = 'compact' | 'default' | 'display';

const SCALE_FACTOR: Record<TypeScale, number> = {
  compact: 0.85,
  default: 1,
  display: 1.15,
};

/** Everything a master canvas needs to repaint; every control feeds this. */
interface ThemeState {
  palette: Palette;
  fonts: FontPairing;
  scale: number;
  showNumbers: boolean;
  showFooter: boolean;
  footerText: string;
}

// Initial state per fixture spec: Horizon, first pairing, Default scale,
// numbers on, footer on, Title + Content master selected.
const INITIAL_THEME_NAME = 'Horizon Keynote';
const INITIAL_PALETTE_ID = 'horizon';
const INITIAL_PAIRING = FONT_PAIRINGS[0].value;
const INITIAL_SCALE: TypeScale = 'default';
const INITIAL_FOOTER_TEXT = 'Northwind Confidential';
const INITIAL_MASTER_ID = 'title-content';

// ============= MASTER FIXTURES =============
// Shape colors are ROLES resolved against the active palette, so one shape
// list serves all four palettes. 'default' text flips to paper on ink
// backgrounds (Section Header master).

type ColorRole = 'default' | 'muted' | 'accent';
type MasterBackground = 'paper' | 'wash' | 'ink';

interface ShapeFrame {
  x: number;
  y: number;
  w: number;
  h?: number;
}

type MasterShape =
  | (ShapeFrame & {
      kind: 'text';
      text: string;
      size: number; // canvas px at Default scale
      weight?: 400 | 600 | 700;
      role?: ColorRole;
      align?: 'left' | 'center';
      font?: 'heading' | 'body';
      isTracked?: boolean; // uppercase kicker tracking
    })
  | (ShapeFrame & {kind: 'bullets'; items: string[]; size: number})
  | (ShapeFrame & {kind: 'bar'})
  | (ShapeFrame & {kind: 'panel'});

interface LayoutMaster {
  id: string;
  name: string;
  description: string;
  background: MasterBackground;
  shapes: MasterShape[];
}

const SAMPLE_TITLE = 'Quarterly Kickoff';
const SAMPLE_SUBTITLE = 'Fixture Deck · 2026';
const SAMPLE_BULLETS = [
  'First talking point',
  'Second talking point',
  'Supporting detail',
];

const MASTERS: LayoutMaster[] = [
  {
    id: 'title',
    name: 'Title',
    description: 'Opening slide — big centered-left title block',
    background: 'paper',
    shapes: [
      {kind: 'bar', x: 120, y: 268, w: 72, h: 10},
      {
        kind: 'text',
        x: 120,
        y: 304,
        w: 720,
        text: SAMPLE_TITLE,
        size: 58,
        weight: 700,
        font: 'heading',
      },
      {
        kind: 'text',
        x: 120,
        y: 396,
        w: 720,
        text: SAMPLE_SUBTITLE,
        size: 26,
        role: 'muted',
      },
    ],
  },
  {
    id: 'title-content',
    name: 'Title + Content',
    description: 'Workhorse body slide — heading over bullets',
    background: 'paper',
    shapes: [
      {
        kind: 'text',
        x: 80,
        y: 70,
        w: 800,
        text: SAMPLE_TITLE,
        size: 42,
        weight: 700,
        font: 'heading',
      },
      {kind: 'bar', x: 80, y: 140, w: 64, h: 8},
      {kind: 'bullets', x: 80, y: 208, w: 760, size: 28, items: SAMPLE_BULLETS},
    ],
  },
  {
    id: 'two-column',
    name: 'Two Column',
    description: 'Bullets beside a tinted callout panel',
    background: 'paper',
    shapes: [
      {
        kind: 'text',
        x: 80,
        y: 70,
        w: 800,
        text: SAMPLE_TITLE,
        size: 42,
        weight: 700,
        font: 'heading',
      },
      {kind: 'bar', x: 80, y: 140, w: 64, h: 8},
      {
        kind: 'bullets',
        x: 80,
        y: 212,
        w: 380,
        size: 26,
        items: SAMPLE_BULLETS.slice(0, 2),
      },
      {kind: 'panel', x: 520, y: 196, w: 360, h: 320},
      {kind: 'bar', x: 556, y: 236, w: 48, h: 8},
      {
        kind: 'text',
        x: 556,
        y: 272,
        w: 290,
        text: SAMPLE_BULLETS[2],
        size: 26,
        weight: 600,
      },
      {
        kind: 'text',
        x: 556,
        y: 330,
        w: 290,
        text: SAMPLE_SUBTITLE,
        size: 20,
        role: 'muted',
      },
    ],
  },
  {
    id: 'statement',
    name: 'Statement',
    description: 'One oversized stat on a tinted wash',
    background: 'wash',
    shapes: [
      {
        kind: 'text',
        x: 120,
        y: 226,
        w: 720,
        text: '92%',
        size: 150,
        weight: 700,
        role: 'accent',
        align: 'center',
        font: 'heading',
      },
      {
        kind: 'text',
        x: 120,
        y: 442,
        w: 720,
        text: 'of pilots renewed',
        size: 30,
        role: 'muted',
        align: 'center',
      },
    ],
  },
  {
    id: 'section-header',
    name: 'Section Header',
    description: 'Inverted ink divider slide between sections',
    background: 'ink',
    shapes: [
      {
        kind: 'text',
        x: 120,
        y: 232,
        w: 720,
        text: 'SECTION 02',
        size: 20,
        role: 'muted',
        isTracked: true,
      },
      {kind: 'bar', x: 120, y: 284, w: 72, h: 10},
      {
        kind: 'text',
        x: 120,
        y: 320,
        w: 720,
        text: SAMPLE_TITLE,
        size: 54,
        weight: 700,
        font: 'heading',
      },
    ],
  },
];

// ============= THEME-PARAMETERIZED SLIDE RENDERER =============

function backgroundColor(bg: MasterBackground, palette: Palette): string {
  return bg === 'ink' ? palette.ink : bg === 'wash' ? palette.wash : palette.paper;
}

/** Resolve a color role against the palette AND the master's background. */
function roleColor(
  role: ColorRole,
  bg: MasterBackground,
  palette: Palette,
): string {
  if (bg === 'ink') {
    // On the inverted master, "default" text is paper and "muted" is wash.
    return role === 'accent'
      ? palette.accent
      : role === 'muted'
        ? palette.wash
        : palette.paper;
  }
  return role === 'accent'
    ? palette.accent
    : role === 'muted'
      ? palette.muted
      : palette.ink;
}

function frameStyle(shape: ShapeFrame): CSSProperties {
  return {
    position: 'absolute',
    left: pctX(shape.x),
    top: pctY(shape.y),
    width: pctX(shape.w),
    ...(shape.h != null ? {height: pctY(shape.h)} : null),
  };
}

/** One positioned shape, colored by role and sized by the type scale. */
function MasterShapeView({
  shape,
  bg,
  theme,
}: {
  shape: MasterShape;
  bg: MasterBackground;
  theme: ThemeState;
}) {
  const {palette, fonts, scale} = theme;
  // Type scale multiplies every cqw font size (0.85 / 1 / 1.15).
  const fs = (v: number) => cqw(v * scale);

  switch (shape.kind) {
    case 'text':
      return (
        <div
          style={{
            ...frameStyle(shape),
            fontSize: fs(shape.size),
            fontWeight: shape.weight ?? 400,
            fontFamily: shape.font === 'heading' ? fonts.heading : fonts.body,
            color: roleColor(shape.role ?? 'default', bg, palette),
            lineHeight: 1.15,
            letterSpacing: shape.isTracked
              ? '0.22em'
              : shape.size >= 40
                ? '-0.015em'
                : undefined,
            textAlign: shape.align ?? 'left',
            whiteSpace: 'nowrap',
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
            gap: fs(shape.size * 0.75),
            fontSize: fs(shape.size),
            fontFamily: theme.fonts.body,
            color: roleColor('default', bg, palette),
            lineHeight: 1.3,
          }}>
          {shape.items.map(item => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: fs(shape.size * 0.55),
              }}>
              <span
                aria-hidden
                style={{
                  width: fs(shape.size * 0.34),
                  height: fs(shape.size * 0.34),
                  marginTop: fs(shape.size * 0.42),
                  borderRadius: '50%',
                  backgroundColor: palette.accent,
                  flexShrink: 0,
                }}
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      );
    case 'bar':
      return (
        <div
          aria-hidden
          style={{
            ...frameStyle(shape),
            backgroundColor: palette.accent,
            borderRadius: cqw(4),
          }}
        />
      );
    case 'panel':
      return (
        <div
          aria-hidden
          style={{
            ...frameStyle(shape),
            backgroundColor: palette.wash,
            borderRadius: cqw(12),
          }}
        />
      );
  }
}

/**
 * The slide surface: palette paper locked to light colorScheme, container
 * for cqw sizing. Furniture (footer strip + corner numeral) renders from
 * theme state so the Switches and footer TextInput repaint every canvas.
 */
function MasterCanvas({
  master,
  slideNumber,
  theme,
}: {
  master: LayoutMaster;
  slideNumber: number;
  theme: ThemeState;
}) {
  const {palette, fonts, scale, showNumbers, showFooter, footerText} = theme;
  const furnitureColor = roleColor('muted', master.background, palette);
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: backgroundColor(master.background, palette),
        colorScheme: 'light',
        containerType: 'inline-size',
        overflow: 'hidden',
      }}>
      {master.shapes.map((shape, index) => (
        <MasterShapeView
          key={\`\${master.id}-shape-\${index}\`}
          shape={shape}
          bg={master.background}
          theme={theme}
        />
      ))}
      {showFooter && footerText.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: pctX(40),
            bottom: pctY(28),
            maxWidth: pctX(700),
            fontSize: cqw(16 * scale),
            fontFamily: fonts.body,
            color: furnitureColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
          {footerText}
        </div>
      )}
      {showNumbers && (
        <div
          style={{
            position: 'absolute',
            right: pctX(40),
            bottom: pctY(28),
            fontSize: cqw(16 * scale),
            fontFamily: fonts.body,
            fontVariantNumeric: 'tabular-nums',
            color: furnitureColor,
          }}>
          {slideNumber}
        </div>
      )}
    </div>
  );
}

// ============= PAGE =============

export default function DeckThemeDesignerTemplate() {
  const [themeName, setThemeName] = useState(INITIAL_THEME_NAME);
  const [paletteId, setPaletteId] = useState(INITIAL_PALETTE_ID);
  const [pairing, setPairing] = useState(INITIAL_PAIRING);
  const [typeScale, setTypeScale] = useState<TypeScale>(INITIAL_SCALE);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [footerText, setFooterText] = useState(INITIAL_FOOTER_TEXT);
  const [masterId, setMasterId] = useState(INITIAL_MASTER_ID);
  // Success Banner: message set on Apply, cleared on dismiss/Reset. The key
  // forces a fresh Banner per apply so its internal dismiss state resets.
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);
  const [applyCount, setApplyCount] = useState(0);

  // Responsive contract: <=900px the panel becomes a top section.
  const isStacked = useMediaQuery('(max-width: 900px)');

  const palette = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
  const fonts = FONT_PAIRINGS.find(f => f.value === pairing) ?? FONT_PAIRINGS[0];
  const theme: ThemeState = {
    palette,
    fonts,
    scale: SCALE_FACTOR[typeScale],
    showNumbers,
    showFooter,
    footerText,
  };

  const selectedMasterIndex = Math.max(
    0,
    MASTERS.findIndex(m => m.id === masterId),
  );
  const selectedMaster = MASTERS[selectedMasterIndex];

  const applyTheme = () => {
    setAppliedMessage(
      \`\${palette.name} applied to \${DECK_SLIDE_COUNT} slides in \${DECK_FILE_NAME}\`,
    );
    setApplyCount(prev => prev + 1);
  };

  const resetTheme = () => {
    setThemeName(INITIAL_THEME_NAME);
    setPaletteId(INITIAL_PALETTE_ID);
    setPairing(INITIAL_PAIRING);
    setTypeScale(INITIAL_SCALE);
    setShowNumbers(true);
    setShowFooter(true);
    setFooterText(INITIAL_FOOTER_TEXT);
    setMasterId(INITIAL_MASTER_ID);
    setAppliedMessage(null);
  };

  // ---- controls form (shared by the 320 panel and the stacked section) ----
  const controls = (
    <VStack gap={4}>
      <FormLayout>
        <TextInput
          label="Theme name"
          value={themeName}
          onChange={setThemeName}
          placeholder="Untitled theme"
        />
      </FormLayout>

      <Divider />

      <VStack gap={2}>
        <Heading level={2}>Palette</Heading>
        <Field label="Preset palette" isLabelHidden inputID="palette-cards">
          <div id="palette-cards">
            <Grid columns={2} gap={2}>
              {PALETTES.map(p => (
                <Tooltip key={p.id} content={swatches(p).join(' · ')}>
                  <SelectableCard
                    label={\`Use the \${p.name} palette\`}
                    isSelected={p.id === paletteId}
                    onChange={() => setPaletteId(p.id)}
                    padding={2}>
                    <VStack gap={1.5}>
                      <Text type="supporting">{p.name}</Text>
                      <HStack gap={1}>
                        {swatches(p).map((hex, index) => (
                          <div
                            key={\`\${p.id}-swatch-\${index}\`}
                            aria-hidden
                            style={{
                              ...styles.swatchChip,
                              backgroundColor: hex,
                            }}
                          />
                        ))}
                      </HStack>
                    </VStack>
                  </SelectableCard>
                </Tooltip>
              ))}
            </Grid>
          </div>
        </Field>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Heading level={2}>Typography</Heading>
        <FormLayout>
          <Selector
            label="Font pairing"
            options={FONT_PAIRINGS.map(f => ({value: f.value, label: f.label}))}
            value={pairing}
            onChange={setPairing}
            description="Heading / body families"
          />
          <Field label="Type scale" inputID="type-scale-control">
            <div id="type-scale-control">
              <SegmentedControl
                label="Type scale"
                value={typeScale}
                onChange={value => setTypeScale(value as TypeScale)}
                size="sm">
                <SegmentedControlItem value="compact" label="Compact" />
                <SegmentedControlItem value="default" label="Default" />
                <SegmentedControlItem value="display" label="Display" />
              </SegmentedControl>
            </div>
          </Field>
        </FormLayout>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Heading level={2}>Furniture</Heading>
        <FormLayout>
          <Switch
            label="Slide numbers"
            description="Numeral in the bottom-right corner"
            value={showNumbers}
            onChange={setShowNumbers}
          />
          <Switch
            label="Footer"
            description="Text strip along the bottom edge"
            value={showFooter}
            onChange={setShowFooter}
          />
          <TextInput
            label="Footer text"
            value={footerText}
            onChange={setFooterText}
            isDisabled={!showFooter}
            placeholder="Footer text"
          />
        </FormLayout>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Heading level={2}>Masters</Heading>
        <RadioList
          label="Layout master"
          isLabelHidden
          description="The chosen master previews at full size."
          value={masterId}
          onChange={setMasterId}>
          {MASTERS.map(m => (
            <RadioListItem
              key={m.id}
              label={m.name}
              value={m.id}
              description={m.description}
            />
          ))}
        </RadioList>
      </VStack>
    </VStack>
  );

  // ---- previews ----
  const banner = appliedMessage != null && (
    <Banner
      key={\`applied-\${applyCount}\`}
      status="success"
      title="Theme applied"
      description={appliedMessage}
      isDismissable
      onDismiss={() => setAppliedMessage(null)}
    />
  );

  const masterTile = (master: LayoutMaster, index: number) => (
    <VStack key={master.id} gap={1}>
      <Card padding={0} style={styles.tileCard}>
        <AspectRatio ratio={4 / 3}>
          <MasterCanvas master={master} slideNumber={index + 1} theme={theme} />
        </AspectRatio>
      </Card>
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary">
          {master.name}
        </Text>
        {master.id === masterId && <Badge label="Selected" variant="blue" />}
      </HStack>
    </VStack>
  );

  // <=900px every master renders at grid size; desktop enlarges the
  // RadioList's choice above a grid of the rest.
  const gridMasters = isStacked
    ? MASTERS
    : MASTERS.filter(m => m.id !== masterId);

  const previews = (
    <div style={styles.previewColumn}>
      <VStack gap={4}>
        {banner}
        {!isStacked && (
          <div style={styles.heroWrap}>
            <VStack gap={1}>
              <Card padding={0} style={styles.heroCard}>
                <AspectRatio ratio={4 / 3}>
                  <MasterCanvas
                    master={selectedMaster}
                    slideNumber={selectedMasterIndex + 1}
                    theme={theme}
                  />
                </AspectRatio>
              </Card>
              <HStack gap={2} vAlign="center">
                <Heading level={2}>{selectedMaster.name}</Heading>
                <Badge label="Selected master" variant="blue" />
                <StackItem size="fill">
                  <Text type="supporting" color="secondary" justify="end">
                    {fonts.label} ·{' '}
                    {typeScale === 'compact'
                      ? '0.85×'
                      : typeScale === 'display'
                        ? '1.15×'
                        : '1×'}{' '}
                    scale
                  </Text>
                </StackItem>
              </HStack>
            </VStack>
          </div>
        )}
        <VStack gap={2}>
          {!isStacked && <Heading level={2}>Other masters</Heading>}
          <Grid columns={{minWidth: 220}} gap={4}>
            {gridMasters.map(m =>
              masterTile(m, MASTERS.findIndex(x => x.id === m.id)),
            )}
          </Grid>
        </VStack>
      </VStack>
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
                <Icon icon={PaletteIcon} size="md" color="secondary" />
                <Heading level={1}>Theme designer</Heading>
                {!isStacked && (
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {themeName.length > 0 ? themeName : 'Untitled theme'} ·{' '}
                    {DECK_FILE_NAME}
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Button
              label="Reset"
              variant="ghost"
              size="sm"
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              tooltip="Restore the fixture defaults"
              onClick={resetTheme}
            />
            <Button
              label="Apply theme"
              variant="primary"
              size="sm"
              icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
              tooltip={\`Apply \${palette.name} to every slide in \${DECK_FILE_NAME}\`}
              onClick={applyTheme}
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        isStacked ? undefined : (
          <LayoutPanel width={320} padding={0} label="Theme controls">
            <div style={styles.panelScroll}>{controls}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          {isStacked ? (
            <div style={{...styles.fill, overflowY: 'auto'}}>
              <div style={styles.stackedControls}>{controls}</div>
              <Divider />
              <div style={{padding: 'var(--spacing-4)', backgroundColor: 'var(--color-background-muted)'}}>
                {previews}
              </div>
            </div>
          ) : (
            <div style={styles.previewScroll}>{previews}</div>
          )}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};