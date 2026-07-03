var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one browse catalog: the 'Station Zero'
 *   hero billboard record, 5 Continue Watching entries with fixed progress
 *   percentages and minutes-left labels, 8 ranked Trending titles, 8 New
 *   Releases with 'New' / 'Recently added' badges, and 6 'Because you
 *   watched' recommendations with fixed match scores; every piece of artwork
 *   is a two-color CSS gradient pair picked by a deterministic title hash,
 *   layered with a radial key light, a faint corner-cropped inline-SVG
 *   initial watermark, and a bottom title scrim — no image assets, no
 *   randomness)
 * @output Streaming-service browse home on a dark full-bleed surface: a
 *   sticky 64px nav row (clapperboard brand mark, Home/Shows/Movies/My List
 *   TabList, SearchIcon + BellIcon IconButtons, Avatar), a 420px hero
 *   billboard drawn with layered CSS gradients and an orbital-gate inline
 *   SVG ('Station Zero' display Heading, '97% match · 2026 · TV-14 ·
 *   2 Seasons' Badge row, genre Tokens, two-line synopsis, PlayIcon 'Play'
 *   Button that flips to a PauseIcon 'Pause' preview state and brightens
 *   the gate art + InfoIcon 'More info' Button + add-to-list ToggleButton
 *   whose PlusIcon flips to CheckIcon, and a mute IconButton + 'TV-14'
 *   Badge in the lower right), then stacked horizontal Carousel rails:
 *   'Continue Watching' 16:9 cards with red ProgressBars, resume labels, and a
 *   MoreMenu whose 'Remove from row' actually filters the fixture array;
 *   'Trending Now' with oversized outlined rank numerals beside 2:3
 *   posters; 'New Releases' with corner Badges; and 'Because you watched
 *   Station Zero' with green match percentages
 * @position Page template; emitted by \`astryx template streaming-browse-home\`
 *
 * Frame: Layout height="fill" with LayoutContent padding 0. The content is
 * one near-black scroll container (colorScheme locked to dark so every
 * light-dark() token inside renders its dark value): nav row 64px sticky
 * with a gradient scrim, hero full-width 420px fading into the row stack,
 * then four Carousel rails of fixed-width cards (Continue Watching 16:9 at
 * 288px; posters 2:3 at 176px). The only Media template that is pure
 * merchandising browse — choose over video-watch-page when nothing is
 * playing yet, and over product-list when the rows are horizontally
 * scrolling poster rails, not a commerce grid.
 *
 * Responsive contract:
 * - >900px: nav shows brand | TabList | search + notifications + Avatar;
 *   hero synopsis caps at 560px; rails show ~5-6 cards and page with the
 *   Carousel's own arrow buttons.
 * - <=900px: the nav TabList collapses away (brand + icons + Avatar stay),
 *   the hero synopsis narrows to the viewport, and the 'More info' Button
 *   drops its label to icon-only width pressure relief; card widths stay
 *   fixed — rails simply show fewer cards and keep scrolling.
 * - Hovering any card elevates it (scale + white ring) at every width;
 *   touch devices simply never enter the hover state. The poster
 *   add-to-list ListToggle is always mounted (so it stays keyboard
 *   reachable) but fades in on hover/focus for pointers with hover; on
 *   "(hover: none)" touch pointers it is simply always visible.
 *
 * Container policy (merchandising-browse archetype): frame-first chrome with
 * custom dark rails — no Cards; the poster surfaces are gradient divs keyed
 * to their titles so the catalog is deterministic and asset-free.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  BellIcon,
  CheckIcon,
  ClapperboardIcon,
  InfoIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ThumbsUpIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Carousel} from '@astryxdesign/core/Carousel';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SURFACE CONSTANTS =============
// The page is a fixed near-black canvas. Custom (non-token) paint uses
// these literals; Astryx components pick up their dark tokens because the
// scroll container locks colorScheme to 'dark'.

const PAGE_BG = '#0A0B0F';
const PAGE_TEXT = '#E7EAF0';
const PAGE_TEXT_DIM = 'rgba(231, 234, 240, 0.66)';
const RANK_STROKE = 'rgba(231, 234, 240, 0.42)';
const CARD_RING = '0 0 0 2px rgba(231, 234, 240, 0.75), 0 18px 40px rgba(0, 0, 0, 0.55)';

const POSTER_W = 176; // 2:3 rail card width
const CONTINUE_W = 288; // 16:9 rail card width

// Deterministic two-color gradient pairs; a title hash picks the pair so
// every poster is stable across renders and sessions.
const GRADIENT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['#7F1D1D', '#F97316'],
  ['#1E3A8A', '#38BDF8'],
  ['#14532D', '#84CC16'],
  ['#4C1D95', '#EC4899'],
  ['#0C4A6E', '#2DD4BF'],
  ['#7C2D12', '#FACC15'],
  ['#312E81', '#818CF8'],
  ['#831843', '#FB7185'],
  ['#064E3B', '#34D399'],
  ['#3F1D38', '#A78BFA'],
];

/** Stable title hash (charCode fold) — no Math.random anywhere. */
function gradientFor(title: string): readonly [string, string] {
  let hash = 7;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  }
  return GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Single vertical scroll surface; colorScheme 'dark' flips every
  // light-dark() token for the Astryx components rendered inside.
  page: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: PAGE_BG,
    color: PAGE_TEXT,
    colorScheme: 'dark',
  },
  // Sticky 64px nav with a gradient scrim so it reads over the hero.
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 'var(--spacing-8)',
    background:
      'linear-gradient(180deg, rgba(10, 11, 15, 0.96) 0%, rgba(10, 11, 15, 0.82) 100%)',
    backdropFilter: 'blur(8px)',
  },
  brandMark: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1-5)',
    color: '#F5394F',
    fontWeight: 800,
    letterSpacing: '0.14em',
    fontSize: 15,
  },
  // Hero: layered gradients stand in for the billboard key art; the
  // bottom fade dissolves into the rail stack.
  hero: {
    position: 'relative',
    height: 420,
    marginTop: -64, // billboard art runs underneath the sticky nav scrim
    background: [
      'radial-gradient(ellipse at 78% 16%, rgba(72, 128, 255, 0.38), transparent 55%)',
      'radial-gradient(ellipse at 12% 88%, rgba(0, 182, 170, 0.30), transparent 60%)',
      'linear-gradient(115deg, #101725 0%, #1B2C4A 48%, #0E3A46 100%)',
    ].join(', '),
    overflow: 'hidden',
  },
  heroFade: {
    position: 'absolute',
    inset: 0,
    background: \`linear-gradient(180deg, transparent 46%, \${PAGE_BG} 100%)\`,
    pointerEvents: 'none',
  },
  heroArt: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    pointerEvents: 'none',
  },
  heroBody: {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 'var(--spacing-8)',
    paddingBottom: 'var(--spacing-6)',
  },
  heroSynopsis: {maxWidth: 560, color: PAGE_TEXT_DIM},
  heroCorner: {
    position: 'absolute',
    right: 'var(--spacing-8)',
    bottom: 'var(--spacing-6)',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  // Rail stack pulls up into the hero fade.
  rails: {
    position: 'relative',
    zIndex: 2,
    marginTop: 'calc(var(--spacing-6) * -1)',
    paddingBottom: 'var(--spacing-10)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  railHeading: {paddingInline: 'var(--spacing-8)'},
  // Shared card chrome: fixed width, hover elevates with scale + ring.
  card: {
    flexShrink: 0,
    borderRadius: 8,
    transition: 'transform 160ms ease, box-shadow 160ms ease',
  },
  cardHovered: {
    transform: 'translateY(-4px) scale(1.03)',
    boxShadow: CARD_RING,
    zIndex: 2,
    position: 'relative',
  },
  art: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  artInitial: {position: 'absolute', inset: 0},
  // Bottom scrim inside every tile: dissolves the art into a dark band so
  // the in-tile caption reads like a real streaming poster title.
  artScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 34,
    paddingInline: 10,
    paddingBottom: 8,
    background:
      'linear-gradient(180deg, transparent 0%, rgba(7, 8, 12, 0.55) 48%, rgba(7, 8, 12, 0.92) 100%)',
    pointerEvents: 'none',
  },
  artCaption: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '0.01em',
    color: PAGE_TEXT,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.65)',
  },
  listToggleOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 3,
    transition: 'opacity 160ms ease',
  },
  // Hover-capable pointers reveal the toggle on hover/focus; it stays
  // mounted (keyboard reachable) but invisible and click-transparent.
  listToggleOverlayHidden: {opacity: 0, pointerEvents: 'none'},
  posterBadgeOverlay: {position: 'absolute', top: 6, left: 6, zIndex: 3},
  caption: {paddingTop: 'var(--spacing-1)', color: PAGE_TEXT_DIM},
  matchCaption: {color: '#4ADE80'},
  // Oversized Top-10-style rank numeral beside each Trending poster.
  rankNumeral: {
    alignSelf: 'flex-end',
    fontSize: 108,
    lineHeight: 0.78,
    fontWeight: 800,
    color: 'transparent',
    WebkitTextStroke: \`2px \${RANK_STROKE}\`,
    letterSpacing: '-0.06em',
    marginRight: -10,
    fontVariantNumeric: 'tabular-nums',
    userSelect: 'none',
  },
  continueFooter: {paddingTop: 'var(--spacing-1-5)'},
};

// ============= DATA =============
// Fixed catalog fixtures: no clocks, no randomness, no network assets.

const HERO = {
  id: 'station-zero',
  title: 'Station Zero',
  match: '97% match',
  year: '2026',
  rating: 'TV-14',
  seasons: '2 Seasons',
  genres: ['Sci-Fi', 'Drama', 'Suspense'],
  synopsis:
    'When a decommissioned orbital gate powers itself back on, the salvage ' +
    'crew hired to strip it for parts discovers the station never stopped ' +
    'listening — and something on the far side has started answering.',
};

interface ContinueEntry {
  id: string;
  title: string;
  label: string; // episode or 'Film'
  progress: number; // 0-100
  remaining: string;
}

const CONTINUE_WATCHING: ContinueEntry[] = [
  {
    id: 'cw-station-zero',
    title: 'Station Zero',
    label: 'S2:E4 · Silent Running',
    progress: 62,
    remaining: '17 min left',
  },
  {
    id: 'cw-pastry-court',
    title: 'The Pastry Court',
    label: 'S1:E8 · The Verdict Is Brioche',
    progress: 15,
    remaining: '39 min left',
  },
  {
    id: 'cw-orbital-kitchens',
    title: 'Orbital Kitchens',
    label: 'Film',
    progress: 44,
    remaining: '58 min left',
  },
  {
    id: 'cw-cold-harbor',
    title: 'Cold Harbor',
    label: 'S3:E1 · Breakwater',
    progress: 88,
    remaining: '6 min left',
  },
  {
    id: 'cw-signal-lost',
    title: 'Signal Lost',
    label: 'S1:E2 · Dead Air',
    progress: 5,
    remaining: '41 min left',
  },
];

interface PosterEntry {
  id: string;
  title: string;
  /** New Releases corner badge. */
  badge?: 'New' | 'Recently added';
  /** Because-you-watched match caption. */
  match?: string;
}

const TRENDING: PosterEntry[] = [
  {id: 'tr-1', title: 'Meridian Heist'},
  {id: 'tr-2', title: 'The Glass Orchard'},
  {id: 'tr-3', title: 'Ashfall Protocol'},
  {id: 'tr-4', title: 'Midnight Cartographers'},
  {id: 'tr-5', title: 'The Silt Verdict'},
  {id: 'tr-6', title: 'Hyperion Falls'},
  {id: 'tr-7', title: 'Paper Lanterns'},
  {id: 'tr-8', title: 'The Long Thaw'},
];

const NEW_RELEASES: PosterEntry[] = [
  {id: 'nr-1', title: 'Driftwood Symphony', badge: 'New'},
  {id: 'nr-2', title: 'Kestrel Down', badge: 'New'},
  {id: 'nr-3', title: 'The Amber Vault', badge: 'Recently added'},
  {id: 'nr-4', title: 'Solstice Runners', badge: 'New'},
  {id: 'nr-5', title: 'Grave Meridian', badge: 'Recently added'},
  {id: 'nr-6', title: 'The Quiet Fleet', badge: 'New'},
  {id: 'nr-7', title: 'Copper Canyon Law', badge: 'Recently added'},
  {id: 'nr-8', title: 'Night Ferry', badge: 'New'},
];

const BECAUSE_YOU_WATCHED: PosterEntry[] = [
  {id: 'byw-1', title: 'Gate Runners', match: '94% match'},
  {id: 'byw-2', title: 'The Void Between', match: '91% match'},
  {id: 'byw-3', title: 'Salvage Class', match: '89% match'},
  {id: 'byw-4', title: 'Deep Relay', match: '87% match'},
  {id: 'byw-5', title: 'Ion Storm Season', match: '84% match'},
  {id: 'byw-6', title: 'The Last Dockmaster', match: '81% match'},
];

const NAV_TABS = [
  {value: 'home', label: 'Home'},
  {value: 'shows', label: 'Shows'},
  {value: 'movies', label: 'Movies'},
  {value: 'mylist', label: 'My List'},
] as const;

// ============= ART PIECES =============

/**
 * Deterministic poster/still art: a two-color gradient keyed to the title,
 * layered with a soft radial key light and a faint initial watermark cropped
 * off the top-right corner, then a bottom scrim that can carry the title in
 * small type like a real streaming tile. Stands in for every piece of
 * artwork — the template ships zero image assets.
 */
function TitleArt({
  title,
  ratio,
  caption,
}: {
  title: string;
  ratio: number;
  caption?: string;
}) {
  const [from, to] = gradientFor(title);
  // viewBox matches the tile's aspect so the watermark crop is stable.
  const viewH = Math.round(1000 / ratio) / 10;
  return (
    <div
      style={{
        ...styles.art,
        width: '100%',
        paddingTop: \`\${(100 / ratio).toFixed(3)}%\`,
        background: [
          'radial-gradient(90% 70% at 18% 10%, rgba(255, 255, 255, 0.16), transparent 58%)',
          \`radial-gradient(120% 85% at 85% 30%, \${to}B8, transparent 62%)\`,
          \`linear-gradient(160deg, \${from} 0%, \${to} 130%)\`,
        ].join(', '),
      }}>
      <svg
        aria-hidden
        viewBox={\`0 0 100 \${viewH}\`}
        preserveAspectRatio="xMidYMid slice"
        style={styles.artInitial}>
        <text
          x="97"
          y="12"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="44"
          fontWeight="800"
          fill="rgba(255, 255, 255, 0.13)"
          fontFamily="inherit">
          {title.charAt(0)}
        </text>
      </svg>
      <div style={styles.artScrim}>
        {caption != null && <span style={styles.artCaption}>{caption}</span>}
      </div>
    </div>
  );
}

/** Faint orbital-gate rings on the hero's right — decorative inline SVG. */
function HeroGateArt({isActive}: {isActive: boolean}) {
  return (
    <svg
      viewBox="0 0 420 420"
      width={420}
      style={{
        ...styles.heroArt,
        opacity: isActive ? 0.85 : 0.5,
        transition: 'opacity 300ms ease',
      }}
      aria-hidden>
      <g fill="none" stroke="rgba(160, 205, 255, 0.55)">
        <circle cx="260" cy="190" r="150" strokeWidth="1.5" />
        <circle cx="260" cy="190" r="118" strokeWidth="1" strokeDasharray="6 10" />
        <circle cx="260" cy="190" r="78" strokeWidth="2.5" />
        <circle cx="260" cy="190" r="8" fill="rgba(160, 205, 255, 0.7)" stroke="none" />
        <line x1="260" y1="40" x2="260" y2="112" strokeWidth="1" />
        <line x1="260" y1="268" x2="260" y2="340" strokeWidth="1" />
      </g>
    </svg>
  );
}

// ============= LIST TOGGLE =============

/** Add-to-list toggle: PlusIcon flips to CheckIcon when in My List. */
function ListToggle({
  isInList,
  onToggle,
  size,
  showLabel = false,
}: {
  isInList: boolean;
  onToggle: (next: boolean) => void;
  size: 'sm' | 'md';
  showLabel?: boolean;
}) {
  return (
    <ToggleButton
      label={isInList ? 'In My List' : 'Add to My List'}
      size={size}
      isIconOnly={!showLabel}
      icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
      pressedIcon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
      isPressed={isInList}
      onPressedChange={onToggle}
      tooltip={isInList ? 'Remove from My List' : 'Add to My List'}
    />
  );
}

// ============= RAIL SECTION =============

/** Section Heading over an arrow-paged Carousel rail of fixed-width cards. */
function Rail({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <VStack gap={2}>
      <div style={styles.railHeading}>
        <HStack gap={2} vAlign="center">
          <Heading level={2} color="inherit">
            {title}
          </Heading>
          {meta != null && (
            <Text type="supporting" color="inherit" style={{color: PAGE_TEXT_DIM}}>
              {meta}
            </Text>
          )}
        </HStack>
      </div>
      <Carousel gap={2} padding={8} hasSnap aria-label={title}>
        {children}
      </Carousel>
    </VStack>
  );
}

// ============= CONTINUE WATCHING CARD =============

function ContinueCard({
  entry,
  isHovered,
  onHover,
  onRemove,
}: {
  entry: ContinueEntry;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      style={{
        ...styles.card,
        width: CONTINUE_W,
        ...(isHovered ? styles.cardHovered : undefined),
      }}
      onMouseEnter={() => onHover(entry.id)}
      onMouseLeave={() => onHover(null)}>
      <TitleArt title={entry.title} ratio={16 / 9} caption={entry.title} />
      <div style={styles.continueFooter}>
        <VStack gap={1}>
          <HStack gap={1} vAlign="center">
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text
                type="supporting"
                color="inherit"
                maxLines={1}
                style={{color: PAGE_TEXT_DIM}}>
                {entry.label}
              </Text>
            </StackItem>
            <MoreMenu
              label={\`Options for \${entry.title}\`}
              size="sm"
              items={[
                {label: 'Play from beginning', icon: RotateCcwIcon},
                {label: 'Rate title', icon: ThumbsUpIcon},
                {type: 'divider'},
                {
                  label: 'Remove from row',
                  icon: XIcon,
                  onClick: () => onRemove(entry.id),
                },
              ]}
            />
          </HStack>
          <ProgressBar
            value={entry.progress}
            label={\`\${entry.title} progress\`}
            isLabelHidden
            variant="error"
          />
          <HStack gap={1} vAlign="center">
            <Icon icon={PlayIcon} size="xsm" color="inherit" />
            <Text
              type="supporting"
              color="inherit"
              hasTabularNumbers
              style={{color: PAGE_TEXT_DIM}}>
              Resume · {entry.remaining}
            </Text>
          </HStack>
        </VStack>
      </div>
    </div>
  );
}

// ============= POSTER CARD =============

function PosterCard({
  entry,
  isHovered,
  onHover,
  isInList,
  onToggleList,
  isTouch,
}: {
  entry: PosterEntry;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  isInList: boolean;
  onToggleList: (id: string, next: boolean) => void;
  /** "(hover: none)" pointers keep the add-to-list toggle always visible. */
  isTouch: boolean;
}) {
  // Keyboard path: the toggle is always mounted, so tabbing to it must
  // reveal it even though the card never enters the hover state.
  const [isToggleFocused, setIsToggleFocused] = useState(false);
  const showListToggle = isTouch || isHovered || isToggleFocused;
  return (
    <div
      style={{
        ...styles.card,
        width: POSTER_W,
        ...(isHovered ? styles.cardHovered : undefined),
      }}
      onMouseEnter={() => onHover(entry.id)}
      onMouseLeave={() => onHover(null)}>
      <div style={{position: 'relative'}}>
        <TitleArt title={entry.title} ratio={2 / 3} caption={entry.title} />
        {entry.badge != null && (
          <div style={styles.posterBadgeOverlay}>
            <Badge
              label={entry.badge}
              variant={entry.badge === 'New' ? 'red' : 'neutral'}
            />
          </div>
        )}
        <div
          style={{
            ...styles.listToggleOverlay,
            ...(showListToggle ? undefined : styles.listToggleOverlayHidden),
          }}
          onFocus={() => setIsToggleFocused(true)}
          onBlur={() => setIsToggleFocused(false)}>
          <ListToggle
            isInList={isInList}
            onToggle={next => onToggleList(entry.id, next)}
            size="sm"
          />
        </div>
      </div>
      {entry.match != null && (
        <div style={styles.caption}>
          <Text
            type="supporting"
            color="inherit"
            hasTabularNumbers
            style={styles.matchCaption}>
            {entry.match}
          </Text>
        </div>
      )}
    </div>
  );
}

// ============= HERO BILLBOARD =============

function HeroBillboard({
  isInList,
  onToggleList,
  isMuted,
  onMuteToggle,
  isPreviewing,
  onPreviewToggle,
  isCompact,
}: {
  isInList: boolean;
  onToggleList: (next: boolean) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  isPreviewing: boolean;
  onPreviewToggle: () => void;
  isCompact: boolean;
}) {
  return (
    <div style={styles.hero}>
      <HeroGateArt isActive={isPreviewing} />
      <div style={styles.heroFade} />
      <div style={styles.heroBody}>
        <VStack gap={3}>
          <Heading level={1} type="display-2" color="inherit">
            {HERO.title}
          </Heading>
          <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
            <Tooltip content="Match score is based on your watch history">
              <Badge label={HERO.match} variant="success" />
            </Tooltip>
            <Badge label={HERO.year} variant="neutral" />
            <Badge label={HERO.rating} variant="neutral" />
            <Badge label={HERO.seasons} variant="neutral" />
            {!isCompact &&
              HERO.genres.map(genre => (
                <Token key={genre} label={genre} size="sm" color="blue" />
              ))}
          </HStack>
          <div style={isCompact ? undefined : styles.heroSynopsis}>
            <Text type="body" color="inherit" maxLines={2} style={{color: PAGE_TEXT_DIM}}>
              {HERO.synopsis}
            </Text>
          </div>
          <HStack gap={2} vAlign="center">
            <Button
              label={
                isPreviewing
                  ? \`Pause \${HERO.title} preview\`
                  : \`Play \${HERO.title} preview\`
              }
              variant="primary"
              icon={
                <Icon
                  icon={isPreviewing ? PauseIcon : PlayIcon}
                  size="sm"
                  color="inherit"
                />
              }
              onClick={onPreviewToggle}>
              {isPreviewing ? 'Pause' : 'Play'}
            </Button>
            <Button
              label={\`More info about \${HERO.title}\`}
              variant="secondary"
              icon={<Icon icon={InfoIcon} size="sm" color="inherit" />}
              isIconOnly={isCompact}>
              More info
            </Button>
            <ListToggle isInList={isInList} onToggle={onToggleList} size="md" />
          </HStack>
        </VStack>
      </div>
      <div style={styles.heroCorner}>
        <IconButton
          label={isMuted ? 'Unmute hero preview' : 'Mute hero preview'}
          tooltip={isMuted ? 'Unmute preview' : 'Mute preview'}
          icon={
            <Icon
              icon={isMuted ? VolumeXIcon : Volume2Icon}
              size="sm"
              color="inherit"
            />
          }
          variant="secondary"
          size="sm"
          onClick={onMuteToggle}
        />
        <Badge label={HERO.rating} variant="neutral" />
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function StreamingBrowseHomeTemplate() {
  // Nav tab selection (browse chrome only — no routing in a template).
  const [activeTab, setActiveTab] = useState<string>('home');
  // My List membership shared by the hero and every poster card.
  const [myList, setMyList] = useState<string[]>(['byw-2']);
  // Hero billboard "preview" play/pause + audio toggles — pure UI state
  // driving icon/label swaps and the gate art glow; no media element.
  const [isHeroPreviewing, setIsHeroPreviewing] = useState(false);
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  // Continue Watching is stateful: 'Remove from row' filters this array.
  const [continueRow, setContinueRow] = useState<ContinueEntry[]>(CONTINUE_WATCHING);
  // Hovered card id elevates that card with a subtle scale + ring.
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isCompact = useMediaQuery('(max-width: 900px)');
  // Touch pointers never hover, so poster add-to-list toggles stay visible.
  const isTouch = useMediaQuery('(hover: none)');

  const setListMembership = (id: string, next: boolean) => {
    setMyList(prev => (next ? [...prev, id] : prev.filter(item => item !== id)));
  };

  const removeFromContinueRow = (id: string) => {
    setContinueRow(prev => prev.filter(entry => entry.id !== id));
    if (hoveredId === id) {
      setHoveredId(null);
    }
  };

  const renderPoster = (entry: PosterEntry) => (
    <PosterCard
      key={entry.id}
      entry={entry}
      isHovered={hoveredId === entry.id}
      onHover={setHoveredId}
      isInList={myList.includes(entry.id)}
      onToggleList={setListMembership}
      isTouch={isTouch}
    />
  );

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={0}>
          <div style={styles.page}>
            {/* Sticky nav row: brand, browse tabs, search, alerts, profile. */}
            <nav style={styles.nav} aria-label="Browse">
              <HStack gap={4} vAlign="center" style={{width: '100%'}}>
                <div style={styles.brandMark}>
                  <Icon icon={ClapperboardIcon} size="md" color="inherit" />
                  <span>ASTRYX+</span>
                </div>
                {!isCompact && (
                  <TabList value={activeTab} onChange={setActiveTab} size="sm">
                    {NAV_TABS.map(tab => (
                      <Tab
                        key={tab.value}
                        value={tab.value}
                        label={tab.label}
                        endContent={
                          tab.value === 'mylist' && myList.length > 0 ? (
                            <Badge label={String(myList.length)} variant="neutral" />
                          ) : undefined
                        }
                      />
                    ))}
                  </TabList>
                )}
                <StackItem size="fill">
                  <span />
                </StackItem>
                <HStack gap={1} vAlign="center">
                  <IconButton
                    label="Search titles"
                    tooltip="Search titles"
                    icon={<Icon icon={SearchIcon} size="sm" color="inherit" />}
                    variant="ghost"
                    size="sm"
                  />
                  <IconButton
                    label="Notifications"
                    tooltip="Notifications"
                    icon={<Icon icon={BellIcon} size="sm" color="inherit" />}
                    variant="ghost"
                    size="sm"
                  />
                  <Avatar name="Dana Whitfield" size="small" />
                </HStack>
              </HStack>
            </nav>

            {/* 420px hero billboard drawn with layered CSS gradients. */}
            <HeroBillboard
              isInList={myList.includes(HERO.id)}
              onToggleList={next => setListMembership(HERO.id, next)}
              isMuted={isHeroMuted}
              onMuteToggle={() => setIsHeroMuted(prev => !prev)}
              isPreviewing={isHeroPreviewing}
              onPreviewToggle={() => setIsHeroPreviewing(prev => !prev)}
              isCompact={isCompact}
            />

            {/* Stacked horizontal poster rails. */}
            <div style={styles.rails}>
              {continueRow.length > 0 && (
                <Rail
                  title="Continue Watching"
                  meta={\`\${continueRow.length} \${
                    continueRow.length === 1 ? 'title' : 'titles'
                  }\`}>
                  {continueRow.map(entry => (
                    <ContinueCard
                      key={entry.id}
                      entry={entry}
                      isHovered={hoveredId === entry.id}
                      onHover={setHoveredId}
                      onRemove={removeFromContinueRow}
                    />
                  ))}
                </Rail>
              )}

              <Rail title="Trending Now" meta="Top 8 today">
                {TRENDING.map((entry, index) => (
                  <HStack key={entry.id} gap={0} vAlign="end">
                    <span style={styles.rankNumeral} aria-hidden>
                      {index + 1}
                    </span>
                    <PosterCard
                      entry={entry}
                      isHovered={hoveredId === entry.id}
                      onHover={setHoveredId}
                      isInList={myList.includes(entry.id)}
                      onToggleList={setListMembership}
                      isTouch={isTouch}
                    />
                  </HStack>
                ))}
              </Rail>

              <Rail title="New Releases" meta="This week">
                {NEW_RELEASES.map(renderPoster)}
              </Rail>

              <Rail title="Because you watched Station Zero">
                {BECAUSE_YOU_WATCHED.map(renderPoster)}
              </Rail>
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};