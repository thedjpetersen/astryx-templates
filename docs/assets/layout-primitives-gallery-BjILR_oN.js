var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (four container width specs at
 *   sm/md/lg/full with padding annotations, five card variants, a
 *   nine-person team roster, a twelve-person grouped directory for the
 *   sticky-header list, a three-level nested comment thread, six activity
 *   rows for the divider action demo, and a repo-meta row for the vertical
 *   divider strip)
 * @output Five-panel gallery of structural building blocks rendered against
 *   a dotted baseline background so spacing stays legible: containers
 *   (constrained-width readouts at sm/md/lg/full with padding annotations
 *   and a live viewport-width Slider that genuinely reflows the demo
 *   frame), cards (basic, header+footer, edge-to-edge mobile toggle,
 *   gray-body, and a well/inset variant, all switchable dense/comfortable),
 *   list containers (simple divided rows, card-per-row, flat rows with
 *   separate gaps, and a grouped directory that scrolls inside a fixed
 *   frame to prove its sticky headers), media objects (basic
 *   avatar-beside-text, top-aligned, right-aligned media, and a nested
 *   reply thread built from recursion with working collapse toggles), and
 *   dividers (plain line, centered label, action-button divider that
 *   reveals older rows, icon divider, and a vertical divider meta strip).
 *   Every variant carries a caption chip naming the pattern with a working
 *   copy button for quick reuse.
 * @position Page template; emitted by \`astryx template layout-primitives-gallery\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title
 * 'Layout primitives — 5 panels', panel-count Badge, supporting note).
 * LayoutContent hosts a single centered scroll column (maxWidth 880) over a
 * dotted baseline background (16px radial-gradient grid) so container
 * padding and list gaps read as measured space, not decoration. Each panel
 * is a labeled Section — mono panel-id Token + one-line note above the
 * variant blocks. This is a structural reference sheet, not a product
 * surface: choose dashboard-widget-grid when the deliverable is a real
 * dashboard, composer-state-gallery when it is component state anatomy.
 *
 * Responsive contract:
 * - Gallery column: maxWidth 880, centered; the page scrolls vertically as
 *   one region — header stays fixed chrome.
 * - Card and media variant grids are 2-up above 720px and collapse to a
 *   single column at <=720px; nothing hides, everything stacks.
 * - The container demo frame clamps to 100% of the column (width:
 *   min(slider px, 100%)), so the slider never forces horizontal overflow;
 *   the printed content-width math notes the clamp.
 * - The sticky grouped list scrolls vertically inside its own 280px frame
 *   at every width; that frame is the only deliberate inner scroll region
 *   besides the page column.
 * - The vertical-divider meta strip wraps at narrow widths instead of
 *   truncating (flexWrap on the row).
 * - <=720px: every tap control (copy IconButtons, density segments, the
 *   edge-to-edge Switch row, thread collapse buttons, Show-older button)
 *   grows to a ~40px hit target via style overrides; glyphs and labels stay
 *   "sm" so desktop renders identically. No hover-only interactions —
 *   copy feedback is inline text, not a tooltip-only state.
 *
 * Container policy (primitives-gallery archetype): the page background is
 * the dotted baseline; each variant demo sits on an opaque surface (Card,
 * bordered frame, or muted well) so its own edges are unambiguous. Panels
 * themselves are transparent Sections — the primitives are the subject, so
 * no extra chrome competes with them. Accent color arrives via tokens and
 * Badges, never raw hex.
 *
 * Fixture policy: fixed strings and numbers only; no clocks, randomness, or
 * network assets. Avatars are initials-only; the one media placeholder is a
 * CSS gradient tile.
 */

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Section} from '@astryxdesign/core/Section';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {Token} from '@astryxdesign/core/Token';
import {
  ArchiveIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  FileTextIcon,
  GitBranchIcon,
  HistoryIcon,
  ScaleIcon,
  SparklesIcon,
  StarIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Dotted baseline background: a 16px radial-gradient grid so padding and
  // gaps read as measured space against the page.
  dottedField: {
    minHeight: '100%',
    backgroundImage:
      'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0',
  },
  // Single centered scroll column; header is fixed chrome above it.
  column: {
    width: '100%',
    maxWidth: 880,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-6)',
    paddingInline: 'var(--spacing-4)',
  },
  // <=720px tap-target overrides: 40px boxes, "sm" glyphs unchanged.
  iconTapTarget: {width: 40, height: 40},
  buttonTapTarget: {minHeight: 40},
  switchRowTapTarget: {minHeight: 40},

  // ---- Panel 1 · containers ----
  // The demo frame *is* the simulated viewport: the slider drives its pixel
  // width, clamped to the column so mobile never overflows horizontally.
  viewportFrame: {
    border: '2px dashed var(--color-border-emphasized, var(--color-border))',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background)',
    paddingBlock: 'var(--spacing-3)',
    marginInline: 'auto',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  // Outer band = the container's padding zone (accent wash); inner band =
  // the content box (opaque surface). The wash makes padding measurable.
  containerBand: {
    marginInline: 'auto',
    width: '100%',
    backgroundColor: 'var(--color-accent-muted)',
    borderRadius: 'var(--radius-container)',
  },
  containerContent: {
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-2)',
    textAlign: 'center',
  },

  // ---- Panel 2 · cards ----
  cardBodyMuted: {backgroundColor: 'var(--color-background-muted)'},
  // Simulated 320px phone frame for the edge-to-edge toggle.
  phoneFrame: {
    width: '100%',
    maxWidth: 320,
    marginInline: 'auto',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  edgeToEdgeCard: {
    borderRadius: 0,
    borderLeft: 'none',
    borderRight: 'none',
  },
  well: {
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.06)',
  },

  // ---- Panel 3 · list containers ----
  flatRow: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
  },
  // Sticky grouped list scrolls inside its own frame to prove the headers.
  stickyFrame: {
    height: 280,
    overflowY: 'auto',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background)',
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
  },
  listRowPad: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  rowText: {minWidth: 0},

  // ---- Panel 4 · media objects ----
  // Gradient placeholder tile — no network images in fixtures.
  mediaTile: {
    width: 56,
    height: 56,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    background:
      'linear-gradient(135deg, var(--color-accent-muted), var(--color-accent))',
  },
  mediaTileTall: {
    width: 56,
    height: 84,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    background:
      'linear-gradient(160deg, var(--color-accent-muted) 20%, var(--color-accent))',
  },
  threadRail: {
    borderLeft: '2px solid var(--color-border)',
    paddingLeft: 'var(--spacing-3)',
    marginTop: 'var(--spacing-2)',
  },

  // ---- Panel 5 · dividers ----
  dividerDemoSurface: {
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
  },
  verticalDividerBox: {height: 16, alignSelf: 'center'},
  metaStrip: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
};

// ============= DATA =============
// Deterministic fixtures: fixed strings and numbers, no clocks, no
// randomness, no network assets.

// Panel 1 — container specs. Padding is annotated and painted as the
// accent wash between the band edge and the content box.
interface ContainerSpec {
  pattern: string;
  maxWidth: number | null; // null = full width
  padding: number; // px per side
  note: string;
}

const CONTAINER_SPECS: ContainerSpec[] = [
  {
    pattern: 'container/sm',
    maxWidth: 384,
    padding: 16,
    note: 'Reading column for settings copy and empty states.',
  },
  {
    pattern: 'container/md',
    maxWidth: 560,
    padding: 24,
    note: 'Forms and detail panes; the workhorse width.',
  },
  {
    pattern: 'container/lg',
    maxWidth: 720,
    padding: 32,
    note: 'Article body and two-column form layouts.',
  },
  {
    pattern: 'container/full',
    maxWidth: null,
    padding: 16,
    note: 'Edge-to-edge tools; padding only, no width clamp.',
  },
];

const VIEWPORT_MIN = 320;
const VIEWPORT_MAX = 840;
const VIEWPORT_DEFAULT = 640;

// Panels 3–4 — people fixtures.
interface Person {
  id: string;
  name: string;
  role: string;
  status?: 'active' | 'away';
}

const TEAM_ROSTER: Person[] = [
  {id: 'p-1', name: 'Amara Osei', role: 'Design engineer', status: 'active'},
  {id: 'p-2', name: 'Felix Grant', role: 'Platform lead', status: 'away'},
  {id: 'p-3', name: 'Ines Duarte', role: 'Product designer', status: 'active'},
  {id: 'p-4', name: 'Marcus Webb', role: 'Frontend engineer', status: 'active'},
  {id: 'p-5', name: 'Sana Iqbal', role: 'Design systems', status: 'away'},
];

// Grouped directory for the sticky-header list; long enough to scroll.
const DIRECTORY_GROUPS: {letter: string; people: Person[]}[] = [
  {
    letter: 'A',
    people: [
      {id: 'd-1', name: 'Ada Lin', role: 'Accessibility'},
      {id: 'd-2', name: 'Amara Osei', role: 'Design engineer'},
      {id: 'd-3', name: 'Andre Silva', role: 'Infra'},
    ],
  },
  {
    letter: 'B',
    people: [
      {id: 'd-4', name: 'Bea Kowalski', role: 'Research'},
      {id: 'd-5', name: 'Bruno Marchetti', role: 'Frontend engineer'},
    ],
  },
  {
    letter: 'F',
    people: [
      {id: 'd-6', name: 'Farah Aziz', role: 'Product'},
      {id: 'd-7', name: 'Felix Grant', role: 'Platform lead'},
      {id: 'd-8', name: 'Freya Holm', role: 'Content design'},
    ],
  },
  {
    letter: 'M',
    people: [
      {id: 'd-9', name: 'Marcus Webb', role: 'Frontend engineer'},
      {id: 'd-10', name: 'Mina Park', role: 'Design systems'},
    ],
  },
  {
    letter: 'S',
    people: [
      {id: 'd-11', name: 'Sana Iqbal', role: 'Design systems'},
      {id: 'd-12', name: 'Sofia Reyes', role: 'Engineering manager'},
    ],
  },
];

// Panel 4 — nested comment thread; the recursion demo.
interface ThreadComment {
  id: string;
  author: string;
  meta: string;
  body: string;
  replies: ThreadComment[];
}

const THREAD: ThreadComment = {
  id: 't-1',
  author: 'Ines Duarte',
  meta: 'Design review · 2d',
  body: 'The media-object gutter should stay 12px at every depth — nesting changes indentation, not the avatar gap.',
  replies: [
    {
      id: 't-2',
      author: 'Marcus Webb',
      meta: '2d',
      body: 'Agreed. The rail carries depth; the object itself never changes shape.',
      replies: [
        {
          id: 't-3',
          author: 'Ines Duarte',
          meta: '1d',
          body: 'Exactly — that is what makes the recursion safe past three levels.',
          replies: [],
        },
      ],
    },
    {
      id: 't-4',
      author: 'Sana Iqbal',
      meta: '1d',
      body: 'Can we cap visual depth at three and flatten beyond it, like the message threads do?',
      replies: [],
    },
  ],
};

// Panel 5 — activity rows split by the action divider: recent rows always
// show; older rows are revealed by the divider's button.
interface ActivityRow {
  id: string;
  actor: string;
  action: string;
  when: string;
}

const RECENT_ACTIVITY: ActivityRow[] = [
  {id: 'act-1', actor: 'Amara Osei', action: 'shipped the token audit', when: 'Mon'},
  {id: 'act-2', actor: 'Felix Grant', action: 'merged the grid refactor', when: 'Mon'},
];

const OLDER_ACTIVITY: ActivityRow[] = [
  {id: 'act-3', actor: 'Mina Park', action: 'archived the legacy well styles', when: 'Last week'},
  {id: 'act-4', actor: 'Sofia Reyes', action: 'approved the divider spec', when: 'Last week'},
];

// Panel 5 — vertical-divider meta strip fixture.
const REPO_META = [
  {id: 'meta-1', icon: FileTextIcon, label: '128 files'},
  {id: 'meta-2', icon: GitBranchIcon, label: '4 branches'},
  {id: 'meta-3', icon: StarIcon, label: '312 stars'},
  {id: 'meta-4', icon: ScaleIcon, label: 'MIT license'},
];

// ============= SHARED GALLERY BITS =============

/**
 * Panel wrapper: mono panel-id Token + one-line note above the variant
 * blocks. Section keeps each panel a distinct labeled region; panels are
 * transparent so the dotted baseline shows through between demos.
 */
function Panel({
  panelId,
  title,
  note,
  children,
}: {
  panelId: string;
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <Section variant="transparent" padding={0}>
      <VStack gap={3}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Token label={panelId} size="sm" color="gray" />
            <Heading level={2}>{title}</Heading>
          </HStack>
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        </VStack>
        {children}
      </VStack>
    </Section>
  );
}

/**
 * Variant caption chip: mono pattern-name Token plus a working copy button.
 * Copy feedback is inline (check icon + "Copied" text), never hover-only,
 * and reverts after a short beat.
 */
function CaptionChip({pattern}: {pattern: string}) {
  const [isCopied, setIsCopied] = useState(false);
  const isCompact = useMediaQuery('(max-width: 720px)');

  useEffect(() => {
    if (!isCopied) {
      return;
    }
    const timer = setTimeout(() => setIsCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [isCopied]);

  const copyPattern = () => {
    try {
      void navigator.clipboard?.writeText(pattern);
    } catch {
      // Clipboard unavailable (permissions/embedding) — feedback still shows.
    }
    setIsCopied(true);
  };

  return (
    <HStack gap={1} vAlign="center">
      <Token label={pattern} size="sm" color="gray" />
      <IconButton
        label={\`Copy pattern name: \${pattern}\`}
        tooltip={isCopied ? 'Copied' : 'Copy pattern name'}
        icon={
          <Icon icon={isCopied ? CheckIcon : CopyIcon} size="sm" color="inherit" />
        }
        variant="ghost"
        size="sm"
        style={isCompact ? styles.iconTapTarget : undefined}
        onClick={copyPattern}
      />
      {isCopied && (
        <Text type="supporting" color="secondary">
          Copied
        </Text>
      )}
    </HStack>
  );
}

/** Caption row (chip + note) above a variant demo. */
function VariantBlock({
  pattern,
  note,
  children,
}: {
  pattern: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
        <CaptionChip pattern={pattern} />
        <Text type="supporting" color="secondary">
          {note}
        </Text>
      </HStack>
      {children}
    </VStack>
  );
}

// ============= PANEL 01 · CONTAINERS =============

/**
 * One constrained-width readout: the accent wash is the padding zone, the
 * opaque inner box is the content area, and the printed math is derived
 * from the live slider value.
 */
function ContainerBand({
  spec,
  viewportWidth,
}: {
  spec: ContainerSpec;
  viewportWidth: number;
}) {
  const outerWidth =
    spec.maxWidth === null
      ? viewportWidth
      : Math.min(viewportWidth, spec.maxWidth);
  const contentWidth = Math.max(outerWidth - spec.padding * 2, 0);
  const clampLabel =
    spec.maxWidth === null ? 'no max' : \`max-w \${spec.maxWidth}\`;

  return (
    <div
      style={{
        ...styles.containerBand,
        maxWidth: spec.maxWidth ?? '100%',
        padding: spec.padding,
      }}>
      <div style={styles.containerContent}>
        <VStack gap={0} hAlign="center">
          <Text type="label" size="sm">
            {spec.pattern}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {clampLabel} · px {spec.padding} · content ≈ {contentWidth}px
          </Text>
        </VStack>
      </div>
    </div>
  );
}

function ContainersPanel() {
  const [viewportWidth, setViewportWidth] = useState(VIEWPORT_DEFAULT);

  return (
    <Panel
      panelId="01 · containers"
      title="Containers"
      note="Constrained-width readouts at sm / md / lg / full. The slider is the simulated viewport: drag it and every band reflows; the accent wash is the padding zone.">
      <VStack gap={3}>
        <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap'}}>
          <StackItem size="fill">
            <Slider
              label="Simulated viewport width"
              min={VIEWPORT_MIN}
              max={VIEWPORT_MAX}
              step={8}
              value={viewportWidth}
              onChange={setViewportWidth}
              formatValue={value => \`\${value}px\`}
              width="100%"
            />
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            frame clamps to the column, so content ≈ min(slider, column) −
            2×padding
          </Text>
        </HStack>
        <div style={{...styles.viewportFrame, width: viewportWidth}}>
          <VStack gap={3}>
            {CONTAINER_SPECS.map(spec => (
              <VStack gap={1} key={spec.pattern}>
                <ContainerBand spec={spec} viewportWidth={viewportWidth} />
              </VStack>
            ))}
          </VStack>
        </div>
        <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
          {CONTAINER_SPECS.map(spec => (
            <HStack gap={1} vAlign="center" key={spec.pattern}>
              <CaptionChip pattern={spec.pattern} />
              <Text type="supporting" color="secondary">
                {spec.note}
              </Text>
            </HStack>
          ))}
        </HStack>
      </VStack>
    </Panel>
  );
}

// ============= PANEL 02 · CARDS =============

type Density = 'comfortable' | 'dense';

function CardsPanel() {
  const [density, setDensity] = useState<Density>('comfortable');
  const [isEdgeToEdge, setIsEdgeToEdge] = useState(true);
  const isNarrow = useMediaQuery('(max-width: 720px)');

  // Density drives Card padding and the header/footer band padding.
  const pad = density === 'dense' ? 3 : 4;
  const bandPad: CSSProperties = {
    paddingInline:
      density === 'dense' ? 'var(--spacing-3)' : 'var(--spacing-4)',
    paddingBlock:
      density === 'dense' ? 'var(--spacing-1)' : 'var(--spacing-2)',
  };

  return (
    <Panel
      panelId="02 · cards"
      title="Cards"
      note="Five card variants sharing one density switch. Dense trims padding everywhere at once; the edge-to-edge toggle previews the mobile treatment inside a 320px frame.">
      <VStack gap={3}>
        <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap'}}>
          <SegmentedControl
            label="Card density"
            value={density}
            onChange={value => setDensity(value as Density)}
            size="sm"
            style={isNarrow ? styles.buttonTapTarget : undefined}>
            <SegmentedControlItem label="Comfortable" value="comfortable" />
            <SegmentedControlItem label="Dense" value="dense" />
          </SegmentedControl>
          <Badge
            label={density === 'dense' ? 'padding 12' : 'padding 16'}
            variant="neutral"
          />
        </HStack>
        <Grid columns={isNarrow ? 1 : 2} gap={4}>
          <VariantBlock
            pattern="card/basic"
            note="Title + body on one surface.">
            <Card padding={pad}>
              <VStack gap={1}>
                <Heading level={3}>Baseline grid</Heading>
                <Text type="body" color="secondary">
                  The simplest container: one border, one radius, one padding
                  token. Everything else in this panel is a variation on it.
                </Text>
              </VStack>
            </Card>
          </VariantBlock>

          <VariantBlock
            pattern="card/header-footer"
            note="Bands divided from the body.">
            <Card padding={0}>
              <VStack gap={0}>
                <HStack gap={2} vAlign="center" style={bandPad}>
                  <Text type="label" size="sm">
                    Weekly digest
                  </Text>
                  <StackItem size="fill" />
                  <Badge label="Draft" variant="neutral" />
                </HStack>
                <Divider />
                <div style={{...bandPad, paddingBlock: 'var(--spacing-3)'}}>
                  <Text type="body" color="secondary">
                    Header and footer are full-bleed bands; only the body
                    carries reading padding.
                  </Text>
                </div>
                <Divider />
                <HStack gap={2} vAlign="center" style={bandPad}>
                  <StackItem size="fill" />
                  <Button
                    label="Discard"
                    variant="ghost"
                    size="sm"
                    style={isNarrow ? styles.buttonTapTarget : undefined}
                    onClick={() => {}}
                  />
                  <Button
                    label="Publish"
                    variant="primary"
                    size="sm"
                    style={isNarrow ? styles.buttonTapTarget : undefined}
                    onClick={() => {}}
                  />
                </HStack>
              </VStack>
            </Card>
          </VariantBlock>

          <VariantBlock
            pattern="card/edge-to-edge"
            note="Loses radius and side borders on mobile.">
            <VStack gap={2}>
              <HStack
                gap={2}
                vAlign="center"
                style={isNarrow ? styles.switchRowTapTarget : undefined}>
                <Switch
                  label="Preview edge-to-edge treatment"
                  value={isEdgeToEdge}
                  onChange={setIsEdgeToEdge}
                />
              </HStack>
              <div style={styles.phoneFrame}>
                <div
                  style={{
                    paddingBlock: 'var(--spacing-3)',
                    paddingInline: isEdgeToEdge ? 0 : 'var(--spacing-3)',
                  }}>
                  <Card
                    padding={pad}
                    style={isEdgeToEdge ? styles.edgeToEdgeCard : undefined}>
                    <VStack gap={1}>
                      <Text type="label" size="sm">
                        Order #4821 shipped
                      </Text>
                      <Text type="supporting" color="secondary">
                        Inside a 320px viewport the card trades its radius and
                        side borders for the full width.
                      </Text>
                    </VStack>
                  </Card>
                </div>
              </div>
            </VStack>
          </VariantBlock>

          <VariantBlock
            pattern="card/gray-body"
            note="White header, muted body wash.">
            <Card padding={0}>
              <VStack gap={0}>
                <HStack gap={2} vAlign="center" style={bandPad}>
                  <Text type="label" size="sm">
                    Environment variables
                  </Text>
                  <StackItem size="fill" />
                  <Badge label="3 keys" variant="info" />
                </HStack>
                <Divider />
                <div
                  style={{
                    ...styles.cardBodyMuted,
                    ...bandPad,
                    paddingBlock: 'var(--spacing-3)',
                  }}>
                  <VStack gap={1}>
                    <Text type="body" hasTabularNumbers>
                      API_BASE_URL · DATABASE_URL · SESSION_SECRET
                    </Text>
                    <Text type="supporting" color="secondary">
                      The gray body signals read-mostly content below an
                      actionable header.
                    </Text>
                  </VStack>
                </div>
              </VStack>
            </Card>
          </VariantBlock>

          <VariantBlock
            pattern="card/well"
            note="Inset well for de-emphasized content.">
            <div
              style={{
                ...styles.well,
                padding:
                  density === 'dense'
                    ? 'var(--spacing-3)'
                    : 'var(--spacing-4)',
              }}>
              <VStack gap={1}>
                <Text type="label" size="sm" color="secondary">
                  Archived note
                </Text>
                <Text type="body" color="secondary">
                  A well recedes instead of floating: muted fill, inset
                  shadow, and secondary text keep it behind the page plane.
                </Text>
              </VStack>
            </div>
          </VariantBlock>
        </Grid>
      </VStack>
    </Panel>
  );
}

// ============= PANEL 03 · LIST CONTAINERS =============

function PersonRow({person}: {person: Person}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.listRowPad}>
      <Avatar name={person.name} size="xsmall" />
      <StackItem size="fill" style={styles.rowText}>
        <VStack gap={0}>
          <Text size="sm" maxLines={1}>
            {person.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {person.role}
          </Text>
        </VStack>
      </StackItem>
      {person.status && (
        <Badge
          label={person.status === 'active' ? 'Active' : 'Away'}
          variant={person.status === 'active' ? 'green' : 'neutral'}
        />
      )}
    </HStack>
  );
}

function ListContainersPanel() {
  const isNarrow = useMediaQuery('(max-width: 720px)');

  return (
    <Panel
      panelId="03 · lists"
      title="List containers"
      note="Four ways to frame the same rows. The grouped directory scrolls inside its own 280px frame — scroll it to watch the letter headers stick.">
      <Grid columns={isNarrow ? 1 : 2} gap={4}>
        <VariantBlock
          pattern="list/divided"
          note="One card, hairline dividers.">
          <Card padding={0}>
            <VStack gap={0}>
              {TEAM_ROSTER.map((person, index) => (
                <VStack gap={0} key={person.id}>
                  <PersonRow person={person} />
                  {index < TEAM_ROSTER.length - 1 && <Divider />}
                </VStack>
              ))}
            </VStack>
          </Card>
        </VariantBlock>

        <VariantBlock
          pattern="list/card-rows"
          note="Every row is its own card.">
          <VStack gap={2}>
            {TEAM_ROSTER.slice(0, 4).map(person => (
              <Card padding={0} key={person.id}>
                <PersonRow person={person} />
              </Card>
            ))}
          </VStack>
        </VariantBlock>

        <VariantBlock
          pattern="list/flat-gaps"
          note="No frame; gaps do the separating.">
          <VStack gap={3}>
            {TEAM_ROSTER.slice(0, 4).map(person => (
              <div style={styles.flatRow} key={person.id}>
                <PersonRow person={person} />
              </div>
            ))}
          </VStack>
        </VariantBlock>

        <VariantBlock
          pattern="list/sticky-groups"
          note="Letter headers pin while the frame scrolls.">
          <div style={styles.stickyFrame}>
            {DIRECTORY_GROUPS.map(group => (
              <div key={group.letter}>
                <div style={styles.stickyHeader}>
                  <Text type="label" size="sm" color="secondary">
                    {group.letter}
                  </Text>
                </div>
                {group.people.map((person, index) => (
                  <VStack gap={0} key={person.id}>
                    <PersonRow person={person} />
                    {index < group.people.length - 1 && <Divider />}
                  </VStack>
                ))}
              </div>
            ))}
          </div>
        </VariantBlock>
      </Grid>
    </Panel>
  );
}

// ============= PANEL 04 · MEDIA OBJECTS =============

function countReplies(comment: ThreadComment): number {
  return comment.replies.reduce(
    (total, reply) => total + 1 + countReplies(reply),
    0,
  );
}

/**
 * Recursive media object: avatar beside text, replies indented behind a
 * rail. Depth changes only indentation — the object itself never reshapes,
 * which is what makes the recursion safe.
 */
function ThreadNode({
  comment,
  collapsed,
  onToggle,
  isCompact,
}: {
  comment: ThreadComment;
  collapsed: Record<string, boolean>;
  onToggle: (id: string) => void;
  isCompact: boolean;
}) {
  const isCollapsed = collapsed[comment.id] === true;
  const replyCount = countReplies(comment);

  return (
    <HStack gap={2} vAlign="start">
      <Avatar name={comment.author} size="xsmall" />
      <StackItem size="fill" style={styles.rowText}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Text type="label" size="sm">
              {comment.author}
            </Text>
            <Text type="supporting" color="secondary">
              {comment.meta}
            </Text>
          </HStack>
          <Text size="sm">{comment.body}</Text>
          {comment.replies.length > 0 && (
            <HStack gap={2}>
              <Button
                label={
                  isCollapsed
                    ? \`Show \${replyCount} \${replyCount === 1 ? 'reply' : 'replies'}\`
                    : 'Hide replies'
                }
                variant="ghost"
                size="sm"
                style={isCompact ? styles.buttonTapTarget : undefined}
                icon={
                  <Icon
                    icon={isCollapsed ? ChevronDownIcon : ChevronUpIcon}
                    size="sm"
                    color="inherit"
                  />
                }
                onClick={() => onToggle(comment.id)}
              />
            </HStack>
          )}
          {!isCollapsed && comment.replies.length > 0 && (
            <div style={styles.threadRail}>
              <VStack gap={3}>
                {comment.replies.map(reply => (
                  <ThreadNode
                    key={reply.id}
                    comment={reply}
                    collapsed={collapsed}
                    onToggle={onToggle}
                    isCompact={isCompact}
                  />
                ))}
              </VStack>
            </div>
          )}
        </VStack>
      </StackItem>
    </HStack>
  );
}

function MediaObjectsPanel() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const isNarrow = useMediaQuery('(max-width: 720px)');

  const toggleReplies = (id: string) => {
    setCollapsed(prev => ({...prev, [id]: prev[id] !== true}));
  };

  return (
    <Panel
      panelId="04 · media"
      title="Media objects"
      note="Media beside text in four alignments; the thread variant is one recursive component, so nesting is free and the collapse toggles actually collapse.">
      <Grid columns={isNarrow ? 1 : 2} gap={4}>
        <VariantBlock
          pattern="media/basic"
          note="Avatar beside text, centered.">
          <Card padding={4}>
            <HStack gap={3} vAlign="center">
              <Avatar name="Amara Osei" size="small" />
              <StackItem size="fill" style={styles.rowText}>
                <VStack gap={0}>
                  <Text type="label" size="sm">
                    Amara Osei
                  </Text>
                  <Text type="supporting" color="secondary">
                    Requested a review on the container spec.
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
          </Card>
        </VariantBlock>

        <VariantBlock
          pattern="media/top-aligned"
          note="Media pins to the first line.">
          <Card padding={4}>
            <HStack gap={3} vAlign="start">
              <div style={styles.mediaTile} aria-hidden="true" />
              <StackItem size="fill" style={styles.rowText}>
                <VStack gap={1}>
                  <Text type="label" size="sm">
                    Spacing tokens, explained
                  </Text>
                  <Text type="supporting" color="secondary">
                    When the text runs several lines, top alignment keeps the
                    media anchored to the headline instead of drifting to the
                    optical middle of the paragraph.
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
          </Card>
        </VariantBlock>

        <VariantBlock
          pattern="media/right"
          note="Media trails the text block.">
          <Card padding={4}>
            <HStack gap={3} vAlign="start">
              <StackItem size="fill" style={styles.rowText}>
                <VStack gap={1}>
                  <Text type="label" size="sm">
                    Q3 layout audit
                  </Text>
                  <Text type="supporting" color="secondary">
                    Right-aligned media reads as an attachment: the text leads
                    and the thumbnail rides along at the end of the row.
                  </Text>
                </VStack>
              </StackItem>
              <div style={styles.mediaTileTall} aria-hidden="true" />
            </HStack>
          </Card>
        </VariantBlock>

        <VariantBlock
          pattern="media/thread"
          note="Nested replies from one recursive node.">
          <Card padding={4}>
            <ThreadNode
              comment={THREAD}
              collapsed={collapsed}
              onToggle={toggleReplies}
              isCompact={isNarrow}
            />
          </Card>
        </VariantBlock>
      </Grid>
    </Panel>
  );
}

// ============= PANEL 05 · DIVIDERS =============

function ActivityLine({row}: {row: ActivityRow}) {
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={row.actor} size="xsmall" />
      <StackItem size="fill" style={styles.rowText}>
        <Text size="sm" maxLines={1}>
          {row.actor} {row.action}
        </Text>
      </StackItem>
      <Text type="supporting" color="secondary">
        {row.when}
      </Text>
    </HStack>
  );
}

function DividersPanel() {
  const [showOlder, setShowOlder] = useState(false);
  const isNarrow = useMediaQuery('(max-width: 720px)');

  return (
    <Panel
      panelId="05 · dividers"
      title="Dividers"
      note="Separation with escalating presence: plain line, centered label, an action button that reveals the older rows it hides, an icon marker, and a vertical strip for inline metadata.">
      <VStack gap={4}>
        <VariantBlock pattern="divider/plain" note="The hairline itself.">
          <div style={styles.dividerDemoSurface}>
            <VStack gap={3}>
              <Text type="supporting" color="secondary">
                Section above the line
              </Text>
              <Divider />
              <Text type="supporting" color="secondary">
                Section below the line
              </Text>
            </VStack>
          </div>
        </VariantBlock>

        <VariantBlock
          pattern="divider/label"
          note="Centered label breaks the line.">
          <div style={styles.dividerDemoSurface}>
            <VStack gap={3}>
              <Text type="supporting" color="secondary">
                Sign in with your workspace account
              </Text>
              <Divider label="or continue with" />
              <Text type="supporting" color="secondary">
                Single-use email link
              </Text>
            </VStack>
          </div>
        </VariantBlock>

        <VariantBlock
          pattern="divider/action"
          note="The line carries a real button — press it.">
          <div style={styles.dividerDemoSurface}>
            <VStack gap={3}>
              {showOlder &&
                OLDER_ACTIVITY.map(row => (
                  <ActivityLine key={row.id} row={row} />
                ))}
              <Divider
                label={
                  <Button
                    label={
                      showOlder
                        ? 'Hide older activity'
                        : \`Show \${OLDER_ACTIVITY.length} older items\`
                    }
                    variant="secondary"
                    size="sm"
                    style={isNarrow ? styles.buttonTapTarget : undefined}
                    icon={
                      <Icon
                        icon={showOlder ? ArchiveIcon : HistoryIcon}
                        size="sm"
                        color="inherit"
                      />
                    }
                    onClick={() => setShowOlder(prev => !prev)}
                  />
                }
              />
              {RECENT_ACTIVITY.map(row => (
                <ActivityLine key={row.id} row={row} />
              ))}
            </VStack>
          </div>
        </VariantBlock>

        <VariantBlock
          pattern="divider/icon"
          note="A glyph as the section marker.">
          <div style={styles.dividerDemoSurface}>
            <VStack gap={3}>
              <Text type="supporting" color="secondary">
                End of pinned items
              </Text>
              <Divider
                label={<Icon icon={SparklesIcon} size="sm" color="secondary" />}
              />
              <Text type="supporting" color="secondary">
                Suggested for you
              </Text>
            </VStack>
          </div>
        </VariantBlock>

        <VariantBlock
          pattern="divider/vertical"
          note="Inline metadata separated by vertical rules; wraps on narrow widths.">
          <div style={styles.dividerDemoSurface}>
            <HStack gap={3} vAlign="center" style={styles.metaStrip}>
              {REPO_META.map((item, index) => (
                <HStack gap={3} vAlign="center" key={item.id}>
                  <HStack gap={1} vAlign="center">
                    <Icon icon={item.icon} size="sm" color="secondary" />
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {item.label}
                    </Text>
                  </HStack>
                  {index < REPO_META.length - 1 && (
                    <div style={styles.verticalDividerBox}>
                      <Divider orientation="vertical" />
                    </div>
                  )}
                </HStack>
              ))}
            </HStack>
          </div>
        </VariantBlock>
      </VStack>
    </Panel>
  );
}

// ============= PAGE =============

export default function LayoutPrimitivesGalleryTemplate() {
  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Layout primitives — 5 panels</Heading>
                <Badge label="reference sheet" variant="neutral" />
              </HStack>
            </StackItem>
            <Text type="supporting" color="secondary">
              containers · cards · lists · media · dividers
            </Text>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.dottedField}>
            <div style={styles.column}>
              <VStack gap={8}>
                <ContainersPanel />
                <CardsPanel />
                <ListContainersPanel />
                <MediaObjectsPanel />
                <DividersPanel />
              </VStack>
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};