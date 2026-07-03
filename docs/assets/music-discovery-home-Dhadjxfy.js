var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one Wavelength listening profile: a
 *   fixed 'Good evening' greeting with 6 time-aware mix tiles, 6 'Made for
 *   you' daily-mix cards each carrying an artist list and a representative
 *   track, 7 new releases with Album/Single/EP kind captions, 8
 *   recently-played entries, 7 friend-activity rows with fixed '18 min ago'
 *   style labels — 3 flagged live, matching the rail badge — and one
 *   now-playing track seeded at 1:23 of 3:47; every cover is a deterministic
 *   two-color CSS gradient picked by a charCode-fold title hash, layered with
 *   a key light and an inline-SVG initial watermark — no assets, no clocks,
 *   no randomness)
 * @output Music-streaming discovery home for the fictional service
 *   'Wavelength' on a scheme-locked near-black stage: a sticky 64px nav
 *   (AudioWaveformIcon brand mark, All/Music/Podcasts filter chips, search +
 *   notifications IconButtons, Avatar), a 'Good evening' greeting header over
 *   a 3x2 grid of mix tiles (64px gradient cover, title, hover-revealed green
 *   play button that loads the mix into the transport), a 'Made for you'
 *   Carousel shelf of daily-mix cards (gradient collage art with a numbered
 *   corner plate, two-line artist lists), a 'New releases' shelf with
 *   kind + artist captions, a 'Jump back in' compact grid of 48px-art rows,
 *   a 280px friend-activity rail (live listeners get a green halo dot and a
 *   'now' label; the rail badge count equals the live rows), and a pinned
 *   88px now-playing bar: track identity + HeartIcon like toggle, shuffle /
 *   back / play-pause / forward / repeat transport, a scrub Slider between
 *   1:23 / 3:47 timecodes with reserved thumb padding, a green 'Loft
 *   speaker' device chip, and a volume Slider with mute toggle
 * @position Page template; emitted by \`astryx template music-discovery-home\`
 *
 * Frame: root 100dvh div > Layout height="fill". content = the one dark
 * scroll surface (sticky nav 64px, greeting grid, three shelves); end =
 * LayoutPanel 280px friend-activity rail with its own scroll; footer =
 * LayoutFooter 88px now-playing bar. The root div pins \`colorScheme: 'dark'\`
 * so every light-dark() token in the Layout chrome, rail, and footer renders
 * its dark value.
 *
 * Responsive contract:
 * - >1100px: full frame — content + friends rail + footer; mix grid is 3x2;
 *   shelves show ~5 cards and page with Carousel arrows.
 * - <=1100px: the friend-activity rail unmounts (its live count stays
 *   reachable via the nav bell tooltip); content keeps the same shelves.
 * - <=900px: nav filter chips collapse away (brand + icons + Avatar stay);
 *   mix grid drops to 2 columns; 'Jump back in' drops from 4 to 2 columns;
 *   the dock's volume cluster + device chip hide and its identity flexes.
 * - <=640px: the now-playing bar stacks identity / transport / scrub rows
 *   and the footer height goes auto.
 * - Hover elevates tiles and reveals play buttons only on hover-capable
 *   pointers; on "(hover: none)" touch pointers every play button is simply
 *   always visible, so no action is stranded.
 *
 * Container policy (brand-forward consumer browse, per
 * streaming-browse-home): frame-first custom chrome — no Cards; mix tiles,
 * shelf cards, and friend rows are styled divs on the locked stage.
 *
 * Color policy: the ENTIRE page is a scheme-locked dark stage (footgun 9) —
 * the root div pins colorScheme: 'dark' and all custom paint uses the
 * SURFACE CONSTANTS literals below, never tokens that flip. The one brand
 * accent is Wavelength green (#2FD473 as an explicit literal, per the
 * locked-stage rule): brand mark, play buttons, active filter chip, scrub +
 * volume fill emphasis, live-listener dots, and the device chip. Text on
 * green uses near-black #08130C (≥8:1); green text on the stage clears
 * ≥7:1. Everything else uses the shared PAGE_TEXT / dim literals.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  AudioLinesIcon,
  AudioWaveformIcon,
  BellIcon,
  HeartIcon,
  MonitorSpeakerIcon,
  PauseIcon,
  PlayIcon,
  Repeat2Icon,
  SearchIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SparklesIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Carousel} from '@astryxdesign/core/Carousel';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Slider} from '@astryxdesign/core/Slider';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SURFACE CONSTANTS =============
// The whole page is a fixed near-black canvas (scheme-locked dark, footgun
// 9). Custom (non-token) paint uses these literals; Astryx components pick
// up their dark tokens because the root div locks colorScheme to 'dark'.

const PAGE_BG = '#0D0F12';
const RAIL_BG = '#101318';
const PAGE_TEXT = '#E9ECF2';
const PAGE_TEXT_DIM = 'rgba(233, 236, 242, 0.64)';
const TILE_BG = 'rgba(255, 255, 255, 0.06)';
const TILE_BG_HOVER = 'rgba(255, 255, 255, 0.12)';
const CARD_BG = 'rgba(255, 255, 255, 0.045)';
const CARD_BG_HOVER = 'rgba(255, 255, 255, 0.09)';
const HAIRLINE = 'rgba(233, 236, 242, 0.12)';

// Wavelength green — the ONE brand accent (explicit literals on the locked
// stage, per §5.1). ON_BRAND is the near-black used for text/glyphs on green.
const BRAND_GREEN = '#2FD473';
const BRAND_GREEN_DIM = 'rgba(47, 212, 115, 0.16)';
const ON_BRAND = '#08130C';

const SHELF_CARD_W = 176;

// Deterministic two-color gradient pairs; a title hash picks the pair so
// every cover is stable across renders and sessions.
const GRADIENT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['#134E4A', '#2DD4BF'],
  ['#4C1D95', '#F472B6'],
  ['#7C2D12', '#FBBF24'],
  ['#1E3A8A', '#60A5FA'],
  ['#701A3C', '#FB7185'],
  ['#14532D', '#A3E635'],
  ['#312E81', '#A78BFA'],
  ['#0C4A6E', '#38BDF8'],
  ['#3F2D12', '#FB923C'],
  ['#3B0764', '#22D3EE'],
];

/** Stable title hash (charCode fold) — no Math.random anywhere. */
function gradientFor(title: string): readonly [string, string] {
  let hash = 11;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  }
  return GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
}

/** m:ss for scrub timecodes. */
function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return \`\${m}:\${String(s).padStart(2, '0')}\`;
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Root wrapper: gives Layout height="fill" a real height in the demo's
  // auto-height stage (footgun 6) and pins the dark scheme for EVERYTHING
  // inside — content, friends rail, and footer chrome alike.
  root: {
    height: '100dvh',
    width: '100%',
    colorScheme: 'dark',
    backgroundColor: PAGE_BG,
    color: PAGE_TEXT,
  },
  // The one vertical scroll surface for the browse content.
  page: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: PAGE_BG,
    color: PAGE_TEXT,
  },
  // Sticky 64px nav with a translucent scrim so it reads over the shelves.
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 'var(--spacing-8)',
    background:
      'linear-gradient(180deg, rgba(13, 15, 18, 0.97) 0%, rgba(13, 15, 18, 0.86) 100%)',
    backdropFilter: 'blur(8px)',
    borderBottom: \`1px solid \${HAIRLINE}\`,
  },
  brandMark: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1-5)',
    color: BRAND_GREEN,
    fontWeight: 800,
    letterSpacing: '0.12em',
    fontSize: 15,
  },
  // All / Music / Podcasts filter chips (custom pills, not tabs — Wavelength
  // filters the whole home surface, it does not navigate).
  filterChip: {
    appearance: 'none',
    border: \`1px solid \${HAIRLINE}\`,
    borderRadius: 999,
    paddingInline: 14,
    height: 30,
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: TILE_BG,
    color: PAGE_TEXT,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 120ms ease, color 120ms ease',
  },
  filterChipActive: {
    backgroundColor: BRAND_GREEN,
    borderColor: BRAND_GREEN,
    color: ON_BRAND,
  },
  // Greeting header + 3x2 time-aware mix grid.
  section: {paddingInline: 'var(--spacing-8)'},
  greetingBand: {
    paddingTop: 'var(--spacing-6)',
    background: [
      'radial-gradient(120% 130% at 8% -20%, rgba(47, 212, 115, 0.16), transparent 55%)',
      \`linear-gradient(180deg, rgba(24, 46, 34, 0.55) 0%, \${PAGE_BG} 88%)\`,
    ].join(', '),
  },
  mixGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 'var(--spacing-2)',
    paddingTop: 'var(--spacing-3)',
  },
  mixGridCompact: {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'},
  mixTile: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    height: 64,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: TILE_BG,
    transition: 'background-color 140ms ease',
    textAlign: 'start',
  },
  mixTileHovered: {backgroundColor: TILE_BG_HOVER},
  mixCover: {width: 64, height: 64, flexShrink: 0, position: 'relative'},
  mixTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: PAGE_TEXT,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
    lineHeight: 1.25,
  },
  // Green circular play affordance shared by tiles and shelf cards.
  playFab: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_GREEN,
    color: ON_BRAND,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.5)',
    transition: 'opacity 140ms ease, transform 140ms ease',
  },
  playFabHidden: {opacity: 0, pointerEvents: 'none', transform: 'translateY(4px)'},

  mixPlaySlot: {marginInlineStart: 'auto', paddingInlineEnd: 'var(--spacing-2)'},
  // Shelf rails (Carousel of fixed-width cards).
  railHeading: {paddingInline: 'var(--spacing-8)'},
  shelfCard: {
    flexShrink: 0,
    width: SHELF_CARD_W,
    padding: 'var(--spacing-3)',
    borderRadius: 8,
    backgroundColor: CARD_BG,
    transition: 'background-color 140ms ease',
    position: 'relative',
  },
  shelfCardHovered: {backgroundColor: CARD_BG_HOVER},
  shelfArt: {position: 'relative', borderRadius: 6, overflow: 'hidden'},
  shelfPlayOverlay: {position: 'absolute', right: 8, bottom: 8, zIndex: 2},
  shelfTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: PAGE_TEXT,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  shelfSub: {
    fontSize: 12,
    lineHeight: 1.35,
    color: PAGE_TEXT_DIM,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },
  // Numbered plate in the corner of daily-mix collage art.
  mixPlate: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    paddingInline: 10,
    paddingBlock: 4,
    backgroundColor: 'rgba(8, 10, 13, 0.82)',
    borderTopRightRadius: 6,
    color: PAGE_TEXT,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  // 'Jump back in' compact grid: 48px-art rows, 4-up.
  recentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--spacing-2)',
    paddingTop: 'var(--spacing-3)',
  },
  recentGridCompact: {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'},
  recentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1-5)',
    borderRadius: 6,
    backgroundColor: CARD_BG,
    transition: 'background-color 140ms ease',
    textAlign: 'start',
    minWidth: 0,
    position: 'relative',
  },
  // The play fab floats over the row's right edge instead of reserving 40px
  // of flow width — at 4-up these rows are ~176px wide and an in-flow fab
  // truncated every title to ~7 characters ('Roadtri…'). On hover-capable
  // pointers the fab only appears over the (hover-lightened) row; on touch,
  // where it is always visible, the text column reserves padding instead.
  recentFabSlot: {
    position: 'absolute',
    insetInlineEnd: 6,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  recentFabPad: {paddingInlineEnd: 46},
  recentArt: {width: 48, height: 48, flexShrink: 0, borderRadius: 4, overflow: 'hidden'},
  recentTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: PAGE_TEXT,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  recentKind: {fontSize: 11, color: PAGE_TEXT_DIM},
  // Friend-activity rail (LayoutPanel end).
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: RAIL_BG,
    padding: 'var(--spacing-4)',
  },
  friendRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    paddingBlock: 'var(--spacing-2)',
  },
  friendTrack: {
    fontSize: 13,
    fontWeight: 600,
    color: PAGE_TEXT,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  friendMeta: {
    fontSize: 12,
    color: PAGE_TEXT_DIM,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: BRAND_GREEN,
    flexShrink: 0,
    boxShadow: \`0 0 0 3px \${BRAND_GREEN_DIM}\`,
  },
  liveLabel: {fontSize: 11, fontWeight: 700, color: BRAND_GREEN},
  // Now-playing bar (LayoutFooter).
  dock: {
    height: 88,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-4)',
    paddingInline: 'var(--spacing-4)',
    backgroundColor: RAIL_BG,
  },
  dockCompact: {padding: 'var(--spacing-3)', backgroundColor: RAIL_BG},
  dockIdentity: {width: 280, minWidth: 0, flexShrink: 0},
  dockIdentityNarrow: {flex: '1 1 0', minWidth: 0},
  dockCenter: {flex: '1 1 0', minWidth: 0, maxWidth: 640, marginInline: 'auto'},
  dockRight: {width: 300, flexShrink: 0, display: 'flex', justifyContent: 'flex-end'},
  dockThumb: {width: 52, height: 52, flexShrink: 0, borderRadius: 4, overflow: 'hidden'},
  // Scrub row: paddingInline reserves room so the Slider thumb at 0 never
  // overlaps the elapsed timecode (footgun 8).
  scrubSliderPad: {paddingInline: 6, width: '100%'},
  timecode: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    color: PAGE_TEXT_DIM,
    whiteSpace: 'nowrap',
  },
  deviceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 26,
    paddingInline: 10,
    borderRadius: 999,
    border: \`1px solid \${BRAND_GREEN}\`,
    backgroundColor: BRAND_GREEN_DIM,
    color: BRAND_GREEN,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  dockTrackTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: PAGE_TEXT,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dockTrackArtist: {
    fontSize: 12,
    color: PAGE_TEXT_DIM,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  playGlyphNudge: {display: 'inline-flex', transform: 'translateX(1px)'},
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ============= DATA =============
// Fixed listening-profile fixtures: no clocks, no randomness, no assets.
// The greeting is a fixed fixture string (a real client would derive it
// from local time; templates stay deterministic).

/** Everything playable resolves to one representative track. */
interface TrackRef {
  title: string;
  artist: string;
  durationSec: number;
  /** Which cover gradient the dock thumb should reuse. */
  coverKey: string;
}

interface MixTileEntry {
  id: string;
  title: string;
  track: TrackRef;
}

const GREETING = 'Good evening';
const LISTENER_NAME = 'Maya Okafor';

// 6 time-aware mix tiles (3x2 grid under the greeting).
const MIX_TILES: MixTileEntry[] = [
  {
    id: 'mt-evening-chill',
    title: 'Evening Chill',
    track: {title: 'Porch Light', artist: 'Junes', durationSec: 214, coverKey: 'Evening Chill'},
  },
  {
    id: 'mt-daily-mix-1',
    title: 'Daily Mix 1',
    track: {title: 'Undertow', artist: 'Cassette Harbor', durationSec: 227, coverKey: 'Daily Mix 1'},
  },
  {
    id: 'mt-liked-songs',
    title: 'Liked Songs',
    track: {title: 'Golden Hour Glass', artist: 'The Glass Petals', durationSec: 251, coverKey: 'Liked Songs'},
  },
  {
    id: 'mt-deep-focus',
    title: 'Deep Focus',
    track: {title: 'Still Water Study', artist: 'Low Meridian', durationSec: 302, coverKey: 'Deep Focus'},
  },
  {
    id: 'mt-late-night-drive',
    title: 'Late Night Drive',
    track: {title: 'Sodium Lights', artist: 'Neon Pastoral', durationSec: 238, coverKey: 'Late Night Drive'},
  },
  {
    id: 'mt-fresh-finds',
    title: 'Fresh Finds: Indie',
    track: {title: 'Paper Kites at Noon', artist: 'Halfmoon Atlas', durationSec: 199, coverKey: 'Fresh Finds: Indie'},
  },
];

interface MadeForYouEntry {
  id: string;
  title: string;
  plate?: string; // corner plate label, e.g. '01'
  artists: string; // two-line clamped artist list
  track: TrackRef;
}

const MADE_FOR_YOU: MadeForYouEntry[] = [
  {
    id: 'mfy-daily-1',
    title: 'Daily Mix 1',
    plate: '01',
    artists: 'Cassette Harbor, The Glass Petals, Junes and more',
    track: {title: 'Undertow', artist: 'Cassette Harbor', durationSec: 227, coverKey: 'Daily Mix 1'},
  },
  {
    id: 'mfy-daily-2',
    title: 'Daily Mix 2',
    plate: '02',
    artists: 'Marrow & Vine, Copper Sparrow, Field Notes and more',
    track: {title: 'Hollow Crown', artist: 'Marrow & Vine', durationSec: 243, coverKey: 'Daily Mix 2'},
  },
  {
    id: 'mfy-daily-3',
    title: 'Daily Mix 3',
    plate: '03',
    artists: 'Low Meridian, Aster Tapes, Night Bus Choir and more',
    track: {title: 'Slow Signal', artist: 'Aster Tapes', durationSec: 276, coverKey: 'Daily Mix 3'},
  },
  {
    id: 'mfy-discover',
    title: 'Discover Weekly',
    artists: 'Your weekly mixtape of fresh finds. Updates every Monday.',
    track: {title: 'Bloom Static', artist: 'Verdant Coast', durationSec: 221, coverKey: 'Discover Weekly'},
  },
  {
    id: 'mfy-release-radar',
    title: 'Release Radar',
    artists: 'New drops from artists you follow. Updates every Friday.',
    track: {title: 'Second Summer', artist: 'Neon Pastoral', durationSec: 208, coverKey: 'Release Radar'},
  },
  {
    id: 'mfy-time-capsule',
    title: 'Time Capsule',
    artists: 'Songs from your 2019 on repeat: Junes, Halfmoon Atlas and more',
    track: {title: 'Attic Light', artist: 'Junes', durationSec: 233, coverKey: 'Time Capsule'},
  },
];

interface NewReleaseEntry {
  id: string;
  title: string;
  artist: string;
  kind: 'Album' | 'Single' | 'EP';
  track: TrackRef;
}

/** Builder: most releases' representative track shares the release title. */
function release(
  id: string,
  title: string,
  artist: string,
  kind: NewReleaseEntry['kind'],
  durationSec: number,
  trackTitle: string = title,
): NewReleaseEntry {
  return {id, title, artist, kind, track: {title: trackTitle, artist, durationSec, coverKey: title}};
}

const NEW_RELEASES: NewReleaseEntry[] = [
  release('nr-saltworks', 'Saltworks', 'Cassette Harbor', 'Album', 212),
  release('nr-meadow-static', 'Meadow Static', 'Verdant Coast', 'EP', 197),
  release('nr-arclight', 'Arclight', 'Neon Pastoral', 'Single', 189),
  release('nr-field-notes-iv', 'Field Notes IV', 'Field Notes', 'Album', 264, 'North Meadow'),
  release('nr-copper-hymns', 'Copper Hymns', 'Copper Sparrow', 'Album', 249),
  release('nr-glass-half', 'Glass Half', 'The Glass Petals', 'Single', 203),
  release('nr-night-bus-live', 'Night Bus (Live)', 'Night Bus Choir', 'EP', 286),
];

interface RecentEntry {
  id: string;
  title: string;
  kind: 'Playlist' | 'Album' | 'Artist' | 'Podcast';
  track: TrackRef;
}

function recent(
  id: string,
  title: string,
  kind: RecentEntry['kind'],
  trackTitle: string,
  artist: string,
  durationSec: number,
): RecentEntry {
  return {id, title, kind, track: {title: trackTitle, artist, durationSec, coverKey: title}};
}

const RECENTLY_PLAYED: RecentEntry[] = [
  recent('rp-roadtrip', 'Roadtrip 2026', 'Playlist', 'Mile Marker 9', 'Halfmoon Atlas', 218),
  recent('rp-harbor-lights', 'Harbor Lights', 'Album', 'Ferry Song', 'Cassette Harbor', 231),
  recent('rp-junes', 'Junes', 'Artist', 'Porch Light', 'Junes', 214),
  recent('rp-morning-brew', 'Morning Brew', 'Podcast', 'Ep. 142 · Slow Mornings', 'Morning Brew', 1841),
  recent('rp-low-meridian', 'Low Meridian', 'Artist', 'Still Water Study', 'Low Meridian', 302),
  recent('rp-kitchen-disco', 'Kitchen Disco', 'Playlist', 'Countertop', 'Copper Sparrow', 205),
  recent('rp-orchard', 'Orchard', 'Album', 'Windfall', 'Marrow & Vine', 226),
  recent('rp-rainy-day-jazz', 'Rainy Day Jazz', 'Playlist', 'Umbrella Stand', 'Aster Tapes', 312),
];

interface FriendEntry {
  id: string;
  name: string;
  track: string;
  artist: string;
  context: string; // playlist / album the friend is listening from
  when: string; // fixed label; 'now' rows are live
  isLive: boolean;
}

// 3 live rows — the rail badge and the bell tooltip both read this count.
function friend(
  id: string,
  name: string,
  track: string,
  artist: string,
  context: string,
  when: string,
): FriendEntry {
  return {id, name, track, artist, context, when, isLive: when === 'now'};
}

const FRIENDS: FriendEntry[] = [
  friend('fr-theo', 'Theo Lindqvist', 'Sodium Lights', 'Neon Pastoral', 'Late Night Drive', 'now'),
  friend('fr-priya', 'Priya Raman', 'Windfall', 'Marrow & Vine', 'Orchard', 'now'),
  friend('fr-sam', 'Sam Whitaker', 'Ep. 142 · Slow Mornings', 'Morning Brew', 'Podcast', 'now'),
  friend('fr-ines', 'Inés Aguilar', 'Glass Half', 'The Glass Petals', 'New Releases', '18 min ago'),
  friend('fr-marcus', 'Marcus Bell', 'Ferry Song', 'Cassette Harbor', 'Harbor Lights', '1 hr ago'),
  friend('fr-lena', 'Lena Vogel', 'Still Water Study', 'Low Meridian', 'Deep Focus', '3 hr ago'),
  friend('fr-owen', 'Owen Park', 'Attic Light', 'Junes', 'Time Capsule', 'yesterday'),
];

const LIVE_FRIEND_COUNT = FRIENDS.filter(f => f.isLive).length;

// Seeded now-playing state: 1:23 into Daily Mix 1's representative track.
const INITIAL_TRACK: TrackRef = MIX_TILES[1].track;
const INITIAL_ELAPSED_SEC = 83;

const FILTERS = ['All', 'Music', 'Podcasts'] as const;
type Filter = (typeof FILTERS)[number];

// ============= COVER ART =============

/**
 * Deterministic cover art: a two-color gradient keyed to the title, layered
 * with a soft key light and a faint inline-SVG initial watermark. Stands in
 * for every cover — the template ships zero image assets.
 */
function CoverArt({
  coverKey,
  isRound = false,
  ratio = 1,
}: {
  coverKey: string;
  isRound?: boolean;
  ratio?: number;
}) {
  const [from, to] = gradientFor(coverKey);
  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        width: '100%',
        paddingTop: \`\${(100 / ratio).toFixed(3)}%\`,
        borderRadius: isRound ? '50%' : undefined,
        overflow: 'hidden',
        background: [
          'radial-gradient(85% 65% at 20% 12%, rgba(255, 255, 255, 0.18), transparent 58%)',
          \`radial-gradient(115% 85% at 82% 34%, \${to}B0, transparent 62%)\`,
          \`linear-gradient(155deg, \${from} 0%, \${to} 135%)\`,
        ].join(', '),
      }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{position: 'absolute', inset: 0}}>
        <text
          x="72"
          y="82"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="58"
          fontWeight="800"
          fill="rgba(255, 255, 255, 0.14)"
          fontFamily="inherit">
          {coverKey.charAt(0)}
        </text>
      </svg>
    </div>
  );
}

// ============= PLAY AFFORDANCE =============

/**
 * Green circular play button. When its item is the one loaded in the
 * transport, it mirrors the dock's play/pause state instead of restarting.
 */
function PlayFab({
  label,
  isCurrent,
  isPlaying,
  isVisible,
  onPress,
}: {
  label: string;
  isCurrent: boolean;
  isPlaying: boolean;
  isVisible: boolean;
  onPress: () => void;
}) {
  const showPause = isCurrent && isPlaying;
  return (
    <button
      type="button"
      aria-label={showPause ? \`Pause \${label}\` : \`Play \${label}\`}
      style={{
        ...styles.playFab,
        ...(isVisible ? undefined : styles.playFabHidden),
      }}
      onClick={event => {
        event.stopPropagation();
        onPress();
      }}>
      {showPause ? (
        <Icon icon={PauseIcon} size="sm" color="inherit" />
      ) : (
        <span style={styles.playGlyphNudge}>
          <Icon icon={PlayIcon} size="sm" color="inherit" />
        </span>
      )}
    </button>
  );
}

// ============= MIX TILE =============

function MixTile({
  entry,
  isHovered,
  onHover,
  isCurrent,
  isPlaying,
  isTouch,
  onPlay,
}: {
  entry: MixTileEntry;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  isCurrent: boolean;
  isPlaying: boolean;
  isTouch: boolean;
  onPlay: () => void;
}) {
  // Keyboard path: the fab is always mounted; focusing it reveals it even
  // though the tile never enters the hover state.
  const [isFabFocused, setIsFabFocused] = useState(false);
  const showFab = isTouch || isHovered || isFabFocused || (isCurrent && isPlaying);
  return (
    <div
      style={{
        ...styles.mixTile,
        ...(isHovered ? styles.mixTileHovered : undefined),
      }}
      onMouseEnter={() => onHover(entry.id)}
      onMouseLeave={() => onHover(null)}>
      <div style={styles.mixCover}>
        <div style={{position: 'absolute', inset: 0}}>
          <CoverArt coverKey={entry.title} />
        </div>
      </div>
      <span style={styles.mixTitle}>{entry.title}</span>
      <div
        style={styles.mixPlaySlot}
        onFocus={() => setIsFabFocused(true)}
        onBlur={() => setIsFabFocused(false)}>
        <PlayFab
          label={entry.title}
          isCurrent={isCurrent}
          isPlaying={isPlaying}
          isVisible={showFab}
          onPress={onPlay}
        />
      </div>
    </div>
  );
}

// ============= SHELF CARD =============

/** Shared card for 'Made for you' and 'New releases' shelves. */
function ShelfCard({
  id,
  title,
  subtitle,
  plate,
  coverKey,
  isHovered,
  onHover,
  isCurrent,
  isPlaying,
  isTouch,
  onPlay,
}: {
  id: string;
  title: string;
  subtitle: string;
  plate?: string;
  coverKey: string;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  isCurrent: boolean;
  isPlaying: boolean;
  isTouch: boolean;
  onPlay: () => void;
}) {
  const [isFabFocused, setIsFabFocused] = useState(false);
  const showFab = isTouch || isHovered || isFabFocused || (isCurrent && isPlaying);
  return (
    <div
      style={{
        ...styles.shelfCard,
        ...(isHovered ? styles.shelfCardHovered : undefined),
      }}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}>
      <VStack gap={2}>
        <div style={styles.shelfArt}>
          <CoverArt coverKey={coverKey} />
          {plate != null && <span style={styles.mixPlate}>Mix {plate}</span>}
          <div
            style={styles.shelfPlayOverlay}
            onFocus={() => setIsFabFocused(true)}
            onBlur={() => setIsFabFocused(false)}>
            <PlayFab
              label={title}
              isCurrent={isCurrent}
              isPlaying={isPlaying}
              isVisible={showFab}
              onPress={onPlay}
            />
          </div>
        </div>
        <div>
          <div style={styles.shelfTitle}>{title}</div>
          <div style={styles.shelfSub}>{subtitle}</div>
        </div>
      </VStack>
    </div>
  );
}

// ============= RECENT ROW =============

function RecentRow({
  entry,
  isHovered,
  onHover,
  isCurrent,
  isPlaying,
  isTouch,
  onPlay,
}: {
  entry: RecentEntry;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  isCurrent: boolean;
  isPlaying: boolean;
  isTouch: boolean;
  onPlay: () => void;
}) {
  // Keyboard path: focusing the always-mounted fab reveals it (same contract
  // as MixTile / ShelfCard).
  const [isFabFocused, setIsFabFocused] = useState(false);
  return (
    <div
      style={{
        ...styles.recentRow,
        ...(isHovered ? {backgroundColor: CARD_BG_HOVER} : undefined),
      }}
      onMouseEnter={() => onHover(entry.id)}
      onMouseLeave={() => onHover(null)}>
      <div style={styles.recentArt}>
        <CoverArt coverKey={entry.title} isRound={entry.kind === 'Artist'} />
      </div>
      <div
        style={{
          minWidth: 0,
          flex: '1 1 0',
          // Touch pointers keep the fab always visible, so reserve room;
          // hover pointers let titles run the full row width instead.
          ...(isTouch || (isCurrent && isPlaying) ? styles.recentFabPad : undefined),
        }}>
        <div style={styles.recentTitle}>
          {isCurrent && isPlaying ? (
            <HStack gap={1} vAlign="center">
              <Icon icon={AudioLinesIcon} size="xsm" color="inherit" />
              <span style={{...styles.recentTitle, color: BRAND_GREEN}}>{entry.title}</span>
            </HStack>
          ) : (
            entry.title
          )}
        </div>
        <div style={styles.recentKind}>{entry.kind}</div>
      </div>
      <div
        style={styles.recentFabSlot}
        onFocus={() => setIsFabFocused(true)}
        onBlur={() => setIsFabFocused(false)}>
        <PlayFab
          label={entry.title}
          isCurrent={isCurrent}
          isPlaying={isPlaying}
          isVisible={isTouch || isHovered || isFabFocused || (isCurrent && isPlaying)}
          onPress={onPlay}
        />
      </div>
    </div>
  );
}

// ============= SHELF RAIL =============

/** Section Heading over an arrow-paged Carousel rail of fixed-width cards. */
function Shelf({
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
      {/* The Carousel sits inside the section gutter (not full-bleed): its
          prev/next buttons overhang each edge by half their width, and on a
          full-bleed rail the next button would straddle the friend-rail
          divider. The 32px gutter keeps the overhang inside the content
          column while cards still align with the section headings. */}
      <div style={styles.section}>
        <Carousel gap={2} hasSnap aria-label={title}>
          {children}
        </Carousel>
      </div>
    </VStack>
  );
}

// ============= FRIEND ACTIVITY RAIL =============

function FriendActivityRail() {
  return (
    <div style={styles.railScroll}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2} color="inherit">
              Friend activity
            </Heading>
          </StackItem>
          <Tooltip content={\`\${LIVE_FRIEND_COUNT} friends listening now\`}>
            <Badge label={\`\${LIVE_FRIEND_COUNT} live\`} variant="success" />
          </Tooltip>
        </HStack>
        <VStack gap={1}>
          {FRIENDS.map(friend => (
            <div key={friend.id} style={styles.friendRow}>
              <Avatar
                name={friend.name}
                size="small"
                // Re-pin initials contrast on the locked dark rail (footgun 14).
                style={{'--color-text-secondary': PAGE_TEXT_DIM} as CSSProperties}
              />
              {/* The when/live chip shares the NAME line — a trailing
                  full-height column reserved its width on every line and
                  truncated the artist · context meta ~80px early. */}
              <div style={{minWidth: 0, flex: '1 1 0'}}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill" style={{minWidth: 0}}>
                    <div style={styles.friendMeta}>{friend.name}</div>
                  </StackItem>
                  {friend.isLive ? (
                    <HStack gap={1} vAlign="center">
                      <span style={styles.liveDot} aria-hidden />
                      <span style={styles.liveLabel}>now</span>
                    </HStack>
                  ) : (
                    <span style={styles.friendMeta}>{friend.when}</span>
                  )}
                </HStack>
                <div style={styles.friendTrack}>{friend.track}</div>
                <div style={styles.friendMeta}>
                  {friend.artist} · {friend.context}
                </div>
              </div>
            </div>
          ))}
        </VStack>
      </VStack>
    </div>
  );
}

// ============= NOW-PLAYING BAR =============

interface DockProps {
  track: TrackRef;
  isPlaying: boolean;
  onPlayPause: () => void;
  elapsedSec: number;
  onScrub: (next: number) => void;
  isLiked: boolean;
  onLikeChange: (next: boolean) => void;
  hasShuffle: boolean;
  onShuffleChange: (next: boolean) => void;
  hasRepeat: boolean;
  onRepeatChange: (next: boolean) => void;
  volume: number;
  onVolumeChange: (next: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  isPhone: boolean;
  isNarrow: boolean;
}

function NowPlayingBar(props: DockProps) {
  const {track, isPlaying, elapsedSec} = props;
  const scrubValue = Math.min(elapsedSec, track.durationSec);

  const identity = (
    <HStack gap={2} vAlign="center">
      <div style={styles.dockThumb}>
        <CoverArt coverKey={track.coverKey} />
      </div>
      <StackItem size="fill" style={{minWidth: 0}}>
        <div style={styles.dockTrackTitle}>{track.title}</div>
        <div style={styles.dockTrackArtist}>{track.artist}</div>
      </StackItem>
      <ToggleButton
        label={props.isLiked ? \`Remove \${track.title} from Liked Songs\` : \`Save \${track.title} to Liked Songs\`}
        isIconOnly
        size="sm"
        icon={<Icon icon={HeartIcon} size="sm" color="inherit" />}
        isPressed={props.isLiked}
        onPressedChange={props.onLikeChange}
        tooltip={props.isLiked ? 'Saved to Liked Songs' : 'Save to Liked Songs'}
      />
    </HStack>
  );

  const transport = (
    <HStack gap={1} vAlign="center" hAlign="center">
      <ToggleButton
        label="Shuffle"
        isIconOnly
        size="sm"
        icon={<Icon icon={ShuffleIcon} size="sm" color="inherit" />}
        isPressed={props.hasShuffle}
        onPressedChange={props.onShuffleChange}
        tooltip={props.hasShuffle ? 'Shuffle on' : 'Shuffle off'}
      />
      <IconButton
        label="Previous track"
        tooltip="Previous"
        icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={() => props.onScrub(0)}
      />
      <button
        type="button"
        aria-label={isPlaying ? \`Pause \${track.title}\` : \`Play \${track.title}\`}
        style={styles.playFab}
        onClick={props.onPlayPause}>
        {isPlaying ? (
          <Icon icon={PauseIcon} size="sm" color="inherit" />
        ) : (
          <span style={styles.playGlyphNudge}>
            <Icon icon={PlayIcon} size="sm" color="inherit" />
          </span>
        )}
      </button>
      <IconButton
        label="Next track"
        tooltip="Next"
        icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={() => props.onScrub(track.durationSec)}
      />
      <ToggleButton
        label="Repeat"
        isIconOnly
        size="sm"
        icon={<Icon icon={Repeat2Icon} size="sm" color="inherit" />}
        isPressed={props.hasRepeat}
        onPressedChange={props.onRepeatChange}
        tooltip={props.hasRepeat ? 'Repeat on' : 'Repeat off'}
      />
    </HStack>
  );

  const scrub = (
    <HStack gap={1} vAlign="center">
      <span style={styles.timecode}>{formatTime(scrubValue)}</span>
      <StackItem size="fill" style={{minWidth: 0}}>
        {/* Padding reserves room so the thumb at 0 never overlaps the
            elapsed timecode (footgun 8). */}
        <div style={styles.scrubSliderPad}>
          <Slider
            label={\`Seek within \${track.title}\`}
            isLabelHidden
            min={0}
            max={track.durationSec}
            step={1}
            value={scrubValue}
            onChange={props.onScrub}
            formatValue={formatTime}
            width="100%"
          />
        </div>
      </StackItem>
      <span style={styles.timecode}>{formatTime(track.durationSec)}</span>
    </HStack>
  );

  const deviceChip = (
    <Tooltip content="Playing on Loft speaker">
      <span style={styles.deviceChip}>
        <Icon icon={MonitorSpeakerIcon} size="xsm" color="inherit" />
        Loft speaker
      </span>
    </Tooltip>
  );

  const volumeCluster = (
    <HStack gap={1} vAlign="center">
      {deviceChip}
      <IconButton
        label={props.isMuted ? 'Unmute' : 'Mute'}
        tooltip={props.isMuted ? 'Unmute' : 'Mute'}
        icon={
          <Icon
            icon={props.isMuted || props.volume === 0 ? VolumeXIcon : Volume2Icon}
            size="sm"
            color="inherit"
          />
        }
        variant="ghost"
        size="sm"
        onClick={props.onMuteToggle}
      />
      <div style={{width: 110}}>
        <Slider
          label="Volume"
          isLabelHidden
          min={0}
          max={100}
          step={1}
          value={props.isMuted ? 0 : props.volume}
          onChange={props.onVolumeChange}
          formatValue={value => \`\${value}%\`}
          width="100%"
        />
      </div>
    </HStack>
  );

  if (props.isPhone) {
    // <=640px: one row can't hold identity plus five transport controls,
    // so the dock stacks and the footer height goes auto.
    return (
      <div style={styles.dockCompact}>
        <VStack gap={2}>
          {identity}
          {transport}
          {scrub}
        </VStack>
      </div>
    );
  }

  return (
    <div style={styles.dock}>
      <div style={props.isNarrow ? styles.dockIdentityNarrow : styles.dockIdentity}>
        {identity}
      </div>
      <div style={styles.dockCenter}>
        <VStack gap={1}>
          {transport}
          {scrub}
        </VStack>
      </div>
      {!props.isNarrow && <div style={styles.dockRight}>{volumeCluster}</div>}
    </div>
  );
}

// ============= PAGE =============

export default function MusicDiscoveryHomeTemplate() {
  // Home-feed filter chips (All / Music / Podcasts) — they filter the feed
  // in place, no routing in a template.
  const [filter, setFilter] = useState<Filter>('All');
  // The one transport: whichever tile/card/row was played last owns it.
  const [currentId, setCurrentId] = useState<string>(MIX_TILES[1].id);
  const [nowPlaying, setNowPlaying] = useState<TrackRef>(INITIAL_TRACK);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedSec, setElapsedSec] = useState(INITIAL_ELAPSED_SEC);
  // Liked Songs membership keyed by track title.
  const [likedTracks, setLikedTracks] = useState<string[]>(['Golden Hour Glass']);
  const [hasShuffle, setHasShuffle] = useState(false);
  const [hasRepeat, setHasRepeat] = useState(false);
  const [volume, setVolume] = useState(64);
  const [isMuted, setIsMuted] = useState(false);
  // Hovered id lightens that tile/card and reveals its play fab.
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Responsive gates (see the responsive contract in the header block).
  const hidesFriendRail = useMediaQuery('(max-width: 1100px)');
  const isCompact = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  // Touch pointers never hover, so play fabs stay always visible.
  const isTouch = useMediaQuery('(hover: none)');

  /** Play an item; replaying the current item just toggles pause. */
  const playItem = (id: string, track: TrackRef) => {
    if (currentId === id) {
      setIsPlaying(prev => !prev);
      return;
    }
    setCurrentId(id);
    setNowPlaying(track);
    setElapsedSec(0);
    setIsPlaying(true);
  };

  const isLiked = likedTracks.includes(nowPlaying.title);
  const setLiked = (next: boolean) => {
    setLikedTracks(prev =>
      next ? [...prev, nowPlaying.title] : prev.filter(t => t !== nowPlaying.title),
    );
  };

  const showMusicShelves = filter !== 'Podcasts';
  const recentVisible = RECENTLY_PLAYED.filter(entry => {
    if (filter === 'All') return true;
    if (filter === 'Music') return entry.kind !== 'Podcast';
    return entry.kind === 'Podcast';
  });

  const announcement = \`\${isPlaying ? 'Now playing' : 'Paused'}: \${nowPlaying.title} by \${nowPlaying.artist}\`;

  const nav = (
    <nav style={styles.nav} aria-label="Wavelength home">
      <HStack gap={4} vAlign="center" style={{width: '100%'}}>
        <div style={styles.brandMark}>
          <Icon icon={AudioWaveformIcon} size="md" color="inherit" />
          <span>WAVELENGTH</span>
        </div>
        {!isCompact && (
          <HStack gap={1} vAlign="center">
            {FILTERS.map(f => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                style={{
                  ...styles.filterChip,
                  ...(filter === f ? styles.filterChipActive : undefined),
                }}
                onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </HStack>
        )}
        <StackItem size="fill">
          <span />
        </StackItem>
        <HStack gap={1} vAlign="center">
          <IconButton
            label="Search songs, artists, podcasts"
            tooltip="Search"
            icon={<Icon icon={SearchIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
          />
          <IconButton
            label={\`Notifications · \${LIVE_FRIEND_COUNT} friends listening now\`}
            tooltip={\`\${LIVE_FRIEND_COUNT} friends listening now\`}
            icon={<Icon icon={BellIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
          />
          <Avatar
            name={LISTENER_NAME}
            size="small"
            style={{'--color-text-secondary': PAGE_TEXT_DIM} as CSSProperties}
          />
        </HStack>
      </HStack>
    </nav>
  );

  const greeting = (
    <div style={styles.greetingBand}>
      <div style={styles.section}>
        <VStack gap={1}>
          <Heading level={1} type="display-2" color="inherit">
            {GREETING}
          </Heading>
          <HStack gap={1} vAlign="center" style={{color: PAGE_TEXT_DIM}}>
            <Icon icon={SparklesIcon} size="xsm" color="inherit" />
            <Text type="supporting" color="inherit" style={{color: PAGE_TEXT_DIM}}>
              Mixes tuned for {LISTENER_NAME} · refreshed 6:00 PM
            </Text>
          </HStack>
        </VStack>
        {showMusicShelves && (
          <div
            style={{
              ...styles.mixGrid,
              ...(isCompact ? styles.mixGridCompact : undefined),
            }}>
            {MIX_TILES.map(entry => (
              <MixTile
                key={entry.id}
                entry={entry}
                isHovered={hoveredId === entry.id}
                onHover={setHoveredId}
                isCurrent={currentId === entry.id}
                isPlaying={isPlaying}
                isTouch={isTouch}
                onPlay={() => playItem(entry.id, entry.track)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.root}>
      <div aria-live="polite" style={styles.visuallyHidden}>
        {announcement}
      </div>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0}>
            <div style={styles.page}>
              {nav}
              {greeting}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-6)',
                  paddingBlock: 'var(--spacing-6)',
                  paddingBottom: 'var(--spacing-10)',
                }}>
                {showMusicShelves && (
                  <Shelf
                    title="Made for you"
                    meta={\`\${MADE_FOR_YOU.length} mixes · update daily\`}>
                    {MADE_FOR_YOU.map(entry => (
                      <ShelfCard
                        key={entry.id}
                        id={entry.id}
                        title={entry.title}
                        subtitle={entry.artists}
                        plate={entry.plate}
                        coverKey={entry.track.coverKey}
                        isHovered={hoveredId === entry.id}
                        onHover={setHoveredId}
                        isCurrent={currentId === entry.id}
                        isPlaying={isPlaying}
                        isTouch={isTouch}
                        onPlay={() => playItem(entry.id, entry.track)}
                      />
                    ))}
                  </Shelf>
                )}

                {showMusicShelves && (
                  <Shelf
                    title="New releases"
                    meta={\`\${NEW_RELEASES.length} drops · Friday, Jul 3\`}>
                    {NEW_RELEASES.map(entry => (
                      <ShelfCard
                        key={entry.id}
                        id={entry.id}
                        title={entry.title}
                        subtitle={\`\${entry.kind} · \${entry.artist}\`}
                        coverKey={entry.track.coverKey}
                        isHovered={hoveredId === entry.id}
                        onHover={setHoveredId}
                        isCurrent={currentId === entry.id}
                        isPlaying={isPlaying}
                        isTouch={isTouch}
                        onPlay={() => playItem(entry.id, entry.track)}
                      />
                    ))}
                  </Shelf>
                )}

                <div style={styles.section}>
                  <HStack gap={2} vAlign="center">
                    <Heading level={2} color="inherit">
                      Jump back in
                    </Heading>
                    <Text type="supporting" color="inherit" style={{color: PAGE_TEXT_DIM}}>
                      {recentVisible.length} of {RECENTLY_PLAYED.length} recent
                    </Text>
                  </HStack>
                  <div
                    style={{
                      ...styles.recentGrid,
                      ...(isCompact ? styles.recentGridCompact : undefined),
                    }}>
                    {recentVisible.map(entry => (
                      <RecentRow
                        key={entry.id}
                        entry={entry}
                        isHovered={hoveredId === entry.id}
                        onHover={setHoveredId}
                        isCurrent={currentId === entry.id}
                        isPlaying={isPlaying}
                        isTouch={isTouch}
                        onPlay={() => playItem(entry.id, entry.track)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </LayoutContent>
        }
        end={
          hidesFriendRail ? undefined : (
            <LayoutPanel width={280} padding={0} hasDivider label="Friend activity">
              <FriendActivityRail />
            </LayoutPanel>
          )
        }
        footer={
          <LayoutFooter
            hasDivider
            padding={0}
            height={isPhone ? undefined : 88}
            label="Now playing">
            <NowPlayingBar
              track={nowPlaying}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(prev => !prev)}
              elapsedSec={elapsedSec}
              onScrub={setElapsedSec}
              isLiked={isLiked}
              onLikeChange={setLiked}
              hasShuffle={hasShuffle}
              onShuffleChange={setHasShuffle}
              hasRepeat={hasRepeat}
              onRepeatChange={setHasRepeat}
              volume={volume}
              onVolumeChange={(next: number) => {
                setVolume(next);
                setIsMuted(next === 0);
              }}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted(prev => !prev)}
              isPhone={isPhone}
              isNarrow={isCompact}
            />
          </LayoutFooter>
        }
      />
    </div>
  );
}
`;export{e as default};