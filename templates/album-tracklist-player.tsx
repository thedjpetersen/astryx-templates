// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one album — 'Glass Harbor' by Novelle
 *   Arc, 2025: 11 tracks with fixed durations, fixed comma-formatted play
 *   counts, tracks 2 and 9 pre-liked, the artist blurb with a fixed
 *   2,318,004 monthly-listener stat; playback pinned to track 4 'Meridian
 *   Lights' at 1:47 of 4:23)
 * @output Music album page with a persistent now-playing dock: the scroll
 *   region opens with a gradient hero band (176px square cover-art
 *   placeholder with an inline-SVG monogram, 'Album' eyebrow, large title,
 *   artist Link, '2025 · 11 songs · 42 min' meta), an action row (large
 *   circular play/pause Button, ShuffleIcon + HeartIcon ToggleButtons, a
 *   MoreMenu), a track Table (# / title+artist / plays / heart / duration)
 *   where the playing row swaps its number for an AudioLinesIcon and gets a
 *   primary background tint, and an 'About the artist' Card. A fixed 80px
 *   bottom dock shows the current track's thumb + title, a
 *   shuffle/skip/play-pause/skip/repeat transport, a scrub Slider between
 *   1:47 / 4:23 timecodes, and a mute-toggle volume Slider
 * @position Page template; emitted by `astryx template album-tracklist-player`
 *
 * Frame: Layout height="fill". No LayoutHeader — content scrolls under a
 * gradient hero band that carries a subtle back IconButton. The main column
 * caps at 960px and centers. LayoutFooter (80px, padding 0) is the
 * now-playing dock, outside the scroll region: left identity cluster 280px,
 * center transport + scrub flexible (max 640), right volume cluster 200px.
 * The unit here is a tracklist you click through — choose
 * podcast-episode-player when one long recording with chapters is the
 * subject, and a playlist/queue surface when the queue, not the catalog
 * page, is the hero.
 *
 * Responsive contract:
 * - >900px: dock shows all three clusters; the track table keeps all five
 *   columns; the hero lays cover art and titles side by side.
 * - <=900px: the dock's volume cluster hides; the left identity cluster
 *   relaxes from fixed 280px to a flexible min-width-0 column so titles
 *   truncate instead of clipping the transport.
 * - <=640px: the Plays column leaves the table (# / title / heart /
 *   duration remain) and the hero wraps the title block under the cover.
 * - Timecodes and play counts keep tabular numbers so scrubbing and the
 *   playing-row swap never jitter column widths.
 *
 * Container policy (media-catalog archetype): the page chrome is
 * frame-first — hero band, action row, and Table sit directly on the page;
 * the only Card is 'About the artist'. Cover art is a literal gradient with
 * an inline-SVG monogram (album art reads identically in both themes); no
 * <audio>, no network assets, no real playback — transport state is
 * useState-driven UI only.
 */

import {useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Slider} from '@astryxdesign/core/Slider';
import {
  Table,
  pixel,
  proportional,
  type TableColumn,
  type TablePlugin,
} from '@astryxdesign/core/Table';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowLeftIcon,
  AudioLinesIcon,
  BadgeCheckIcon,
  ClockIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  Repeat2Icon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';

// ============= COVER ART PAINT =============
// The album cover is a literal gradient (album art is "ink", like slide
// paper — identical in both themes) with an inline-SVG monogram. No image
// assets, no randomness.

const COVER_GRADIENT =
  'linear-gradient(140deg, #10344F 0%, #1F5D7A 52%, #7FB6C9 100%)';
const COVER_LINE = 'rgba(242, 247, 250, 0.4)';
const COVER_TEXT = '#F2F7FA';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Main column: max 960, centered; shared by the hero and the body.
  column: {
    width: '100%',
    maxWidth: 960,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
  },
  // Gradient hero band the content scrolls under; fades into the page
  // background so both themes read correctly.
  heroBand: {
    background:
      'linear-gradient(180deg, var(--color-accent-muted) 0%, transparent 100%)',
    paddingTop: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-6)',
  },
  heroRow: {flexWrap: 'wrap'},
  // <=640px: force the title block onto its own flex line under the cover
  // (a fill item with minWidth 0 would shrink forever and never wrap).
  heroTitleCompact: {minWidth: 0, flexBasis: '100%'},
  heroTitle: {
    fontSize: 44,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
  bodyColumn: {
    paddingTop: 'var(--spacing-5)',
    paddingBottom: 'var(--spacing-8)',
  },
  // Large circular play/pause in the action row.
  heroPlayButton: {
    width: 56,
    height: 56,
    borderRadius: '50%',
  },
  // ============= DOCK =============
  dock: {
    height: 80,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-4)',
    paddingInline: 'var(--spacing-4)',
  },
  dockIdentityWide: {width: 280, flexShrink: 0, minWidth: 0},
  dockIdentityNarrow: {flex: '1 1 160px', minWidth: 0},
  dockCenter: {
    flex: '1 1 auto',
    minWidth: 0,
    maxWidth: 640,
    marginInline: 'auto',
  },
  dockVolume: {width: 200, flexShrink: 0},
  dockPlayButton: {
    width: 40,
    height: 40,
    borderRadius: '50%',
  },
  truncate: {minWidth: 0},
};

// ============= DATA =============
// Deterministic fixtures: fixed durations, fixed play counts, fixed
// listener stat. No clocks, no randomness, no network assets.

const ALBUM_TITLE = 'Glass Harbor';
const ARTIST_NAME = 'Novelle Arc';
const ALBUM_META = '2025 · 11 songs · 42 min';
const MONTHLY_LISTENERS = '2,318,004';
const ARTIST_BLURB =
  'Novelle Arc are a coastal ambient-pop duo from Kirkenes who record in a ' +
  'converted ferry terminal at the edge of the harbor. Glass Harbor, their ' +
  'third record, was tracked across a winter of night ferries and slack tides — ' +
  'tape loops of hull resonance under close-mic vocals and glass percussion.';

type TrackRow = {
  id: string;
  n: number;
  title: string;
  durationSec: number;
  plays: string;
};

const TRACKS: TrackRow[] = [
  {id: 'gh-01', n: 1, title: 'First Light', durationSec: 192, plays: '1,204,332'},
  {id: 'gh-02', n: 2, title: 'Undertow', durationSec: 245, plays: '987,410'},
  {id: 'gh-03', n: 3, title: 'Paper Compass', durationSec: 228, plays: '1,102,558'},
  {id: 'gh-04', n: 4, title: 'Meridian Lights', durationSec: 263, plays: '1,318,927'},
  {id: 'gh-05', n: 5, title: 'Salt & Static', durationSec: 211, plays: '864,201'},
  {id: 'gh-06', n: 6, title: 'Harbor Glass', durationSec: 302, plays: '915,472'},
  {id: 'gh-07', n: 7, title: 'Night Ferry', durationSec: 237, plays: '792,644'},
  {id: 'gh-08', n: 8, title: 'Low Tide Letters', durationSec: 199, plays: '688,310'},
  {id: 'gh-09', n: 9, title: 'Cassiopeia', durationSec: 281, plays: '1,046,205'},
  {id: 'gh-10', n: 10, title: 'Driftworks', durationSec: 206, plays: '621,447'},
  {id: 'gh-11', n: 11, title: 'The Long Calm', durationSec: 408, plays: '573,988'},
];

const TRACK_COUNT = TRACKS.length;

// Fixture pins playback to track 4 "Meridian Lights" at 1:47 of 4:23.
const INITIAL_TRACK_INDEX = 3;
const INITIAL_ELAPSED_SEC = 107;
// Tracks 2 and 9 arrive pre-liked.
const INITIAL_LIKED_IDS = ['gh-02', 'gh-09'];

/** 107 -> "1:47". Fixed fixture seconds only — never a clock. */
function formatTime(totalSec: number): string {
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

// ============= COVER ART =============

/**
 * Square cover-art placeholder: literal gradient with an inline-SVG "GH"
 * monogram over harbor-swell arcs. Renders at 176px in the hero and 48px
 * in the dock from the same deterministic paint.
 */
function CoverArt({size}: {size: number}) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 'var(--radius-container)',
        background: COVER_GRADIENT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: size >= 96 ? 'var(--shadow-high)' : undefined,
      }}>
      <svg
        viewBox="0 0 96 96"
        width={size * 0.62}
        height={size * 0.62}
        role="presentation">
        <circle
          cx="48"
          cy="48"
          r="36"
          fill="none"
          stroke={COVER_LINE}
          strokeWidth="1.5"
        />
        <path
          d="M18 62 Q30 56 42 62 T66 62 T90 62"
          fill="none"
          stroke={COVER_LINE}
          strokeWidth="1.5"
        />
        <path
          d="M12 70 Q24 64 36 70 T60 70 T84 70"
          fill="none"
          stroke={COVER_LINE}
          strokeWidth="1.5"
        />
        <text
          x="48"
          y="52"
          textAnchor="middle"
          fontSize="26"
          fontWeight="600"
          letterSpacing="2"
          fill={COVER_TEXT}>
          GH
        </text>
      </svg>
    </div>
  );
}

// ============= PAGE =============

export default function AlbumTracklistPlayerTemplate() {
  // Which track owns the dock; clicking any table row moves it and
  // resets the scrub position.
  const [currentTrackIndex, setCurrentTrackIndex] =
    useState(INITIAL_TRACK_INDEX);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedSec, setElapsedSec] = useState(INITIAL_ELAPSED_SEC);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hasRepeat, setHasRepeat] = useState(false);
  const [isAlbumLiked, setIsAlbumLiked] = useState(false);
  const [likedIds, setLikedIds] = useState<ReadonlySet<string>>(
    () => new Set(INITIAL_LIKED_IDS),
  );
  const [volume, setVolume] = useState(72);
  const [isMuted, setIsMuted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Responsive contract: <=900px the dock drops its volume cluster and the
  // identity cluster relaxes; <=640px the Plays column leaves the table.
  const isNarrow = useMediaQuery('(max-width: 900px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  const currentTrack = TRACKS[currentTrackIndex];
  const scrubValue = Math.min(elapsedSec, currentTrack.durationSec);
  const isAtStart = currentTrackIndex === 0;
  const isAtEnd = currentTrackIndex === TRACK_COUNT - 1;
  const effectiveVolume = isMuted ? 0 : volume;

  const jumpToTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setElapsedSec(0);
    setIsPlaying(true);
  };

  /** Row click: replay the current track from 0, or start the clicked one. */
  const handleRowClick = (track: TrackRow) => {
    const index = TRACKS.findIndex(t => t.id === track.id);
    if (index === currentTrackIndex) {
      setElapsedSec(0);
      setIsPlaying(true);
      return;
    }
    jumpToTrack(index);
  };

  // Prev/next step through the tracklist; with repeat on they wrap,
  // with repeat off they disable at the album ends.
  const goPrev = () => {
    if (isAtStart) {
      if (hasRepeat) {
        jumpToTrack(TRACK_COUNT - 1);
      }
      return;
    }
    jumpToTrack(currentTrackIndex - 1);
  };
  const goNext = () => {
    if (isAtEnd) {
      if (hasRepeat) {
        jumpToTrack(0);
      }
      return;
    }
    jumpToTrack(currentTrackIndex + 1);
  };

  const toggleLiked = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const heartFor = (track: TrackRow) => (
    <ToggleButton
      label={
        likedIds.has(track.id)
          ? `Remove ${track.title} from liked songs`
          : `Add ${track.title} to liked songs`
      }
      isIconOnly
      size="sm"
      icon={<Icon icon={HeartIcon} size="sm" color="inherit" />}
      pressedIcon={
        <Icon icon={HeartIcon} size="sm" color="error" fill="currentColor" />
      }
      isPressed={likedIds.has(track.id)}
      onPressedChange={(_pressed, event) => {
        // Keep the heart independent of the row's play-on-click.
        event.stopPropagation();
        toggleLiked(track.id);
      }}
    />
  );

  // ============= TRACK TABLE =============

  const numberCell = (track: TrackRow) => {
    if (track.id === currentTrack.id) {
      return (
        <Tooltip content={isPlaying ? 'Now playing' : 'Paused'}>
          <Icon
            icon={AudioLinesIcon}
            size="sm"
            color="accent"
            aria-label={isPlaying ? 'Now playing' : 'Paused'}
          />
        </Tooltip>
      );
    }
    return (
      <Text type="body" color="secondary" hasTabularNumbers>
        {track.n}
      </Text>
    );
  };

  const columns: TableColumn<TrackRow>[] = [
    {
      key: 'n',
      header: '#',
      width: pixel(48),
      align: 'center',
      renderCell: numberCell,
    },
    {
      key: 'title',
      header: 'Title',
      width: proportional(2),
      renderCell: track => (
        <VStack gap={0} style={styles.truncate}>
          <Text
            type="body"
            weight="semibold"
            color={track.id === currentTrack.id ? 'accent' : 'primary'}
            maxLines={1}>
            {track.title}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {ARTIST_NAME}
          </Text>
        </VStack>
      ),
    },
    ...(isCompact
      ? []
      : [
          {
            key: 'plays',
            header: 'Plays',
            width: pixel(120),
            align: 'end',
            renderCell: (track: TrackRow) => (
              <Text type="body" color="secondary" hasTabularNumbers>
                {track.plays}
              </Text>
            ),
          } satisfies TableColumn<TrackRow>,
        ]),
    {
      key: 'liked',
      header: '',
      width: pixel(56),
      align: 'center',
      renderCell: track => heartFor(track),
    },
    {
      key: 'durationSec',
      header: (
        <Icon icon={ClockIcon} size="sm" color="secondary" aria-label="Duration" />
      ),
      width: pixel(72),
      align: 'end',
      renderCell: track => (
        <Text type="body" color="secondary" hasTabularNumbers>
          {formatTime(track.durationSec)}
        </Text>
      ),
    },
  ];

  // Row plugin: every row plays on click; the playing row gets the primary
  // background tint to pair with its AudioLines number swap.
  const nowPlayingPlugin: TablePlugin<TrackRow> = {
    transformBodyRow: (props, item) => ({
      ...props,
      htmlProps: {
        ...props.htmlProps,
        onClick: () => handleRowClick(item),
        style: {
          ...props.htmlProps.style,
          cursor: 'pointer',
          ...(item.id === currentTrack.id
            ? {backgroundColor: 'var(--color-accent-muted)'}
            : null),
        },
      },
    }),
  };

  // ============= HERO + BODY =============

  const hero = (
    <div style={styles.heroBand}>
      <div style={styles.column}>
        <VStack gap={5}>
          <HStack>
            <IconButton
              label="Back to library"
              tooltip="Back to library"
              icon={<Icon icon={ArrowLeftIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => {}}
            />
          </HStack>
          <HStack gap={6} vAlign="end" style={styles.heroRow}>
            <CoverArt size={176} />
            <StackItem
              size="fill"
              style={isCompact ? styles.heroTitleCompact : styles.truncate}>
              <VStack gap={2}>
                <Text
                  type="label"
                  color="secondary"
                  weight="semibold"
                  style={styles.eyebrow}>
                  Album
                </Text>
                <Heading level={1} style={styles.heroTitle}>
                  {ALBUM_TITLE}
                </Heading>
                <HStack gap={2} vAlign="center">
                  <Avatar name={ARTIST_NAME} size={24} />
                  <Link onClick={() => {}}>{ARTIST_NAME}</Link>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    · {ALBUM_META}
                  </Text>
                </HStack>
              </VStack>
            </StackItem>
          </HStack>
        </VStack>
      </div>
    </div>
  );

  const actionRow = (
    <HStack gap={3} vAlign="center">
      <Button
        label={isPlaying ? `Pause ${ALBUM_TITLE}` : `Play ${ALBUM_TITLE}`}
        variant="primary"
        size="lg"
        isIconOnly
        icon={
          <Icon icon={isPlaying ? PauseIcon : PlayIcon} size="md" color="inherit" />
        }
        style={styles.heroPlayButton}
        onClick={() => setIsPlaying(prev => !prev)}
      />
      <ToggleButton
        label="Shuffle"
        isIconOnly
        icon={<Icon icon={ShuffleIcon} size="sm" color="inherit" />}
        isPressed={isShuffling}
        onPressedChange={setIsShuffling}
        tooltip={isShuffling ? 'Shuffle on' : 'Shuffle off'}
      />
      <ToggleButton
        label={isAlbumLiked ? 'Remove album from library' : 'Save album to library'}
        isIconOnly
        icon={<Icon icon={HeartIcon} size="sm" color="inherit" />}
        pressedIcon={
          <Icon icon={HeartIcon} size="sm" color="error" fill="currentColor" />
        }
        isPressed={isAlbumLiked}
        onPressedChange={setIsAlbumLiked}
        tooltip={isAlbumLiked ? 'Saved to library' : 'Save to library'}
      />
      <MoreMenu
        label="More album actions"
        items={[
          {label: 'Add to queue', onClick: () => {}},
          {label: 'Add to playlist', onClick: () => {}},
          {label: 'Go to artist', onClick: () => {}},
          {label: 'View credits', onClick: () => {}},
          {label: 'Share album', onClick: () => {}},
        ]}
      />
      <StackItem size="fill">
        <HStack hAlign="end">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {likedIds.size} of {TRACK_COUNT} songs liked
          </Text>
        </HStack>
      </StackItem>
    </HStack>
  );

  const aboutCard = (
    <Card padding={5}>
      <HStack gap={4} vAlign="start">
        {!isCompact && <Avatar name={ARTIST_NAME} size={64} />}
        <StackItem size="fill" style={styles.truncate}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Heading level={2}>About the artist</Heading>
              </StackItem>
              <Badge
                variant="info"
                icon={<Icon icon={BadgeCheckIcon} size="sm" color="inherit" />}
                label="Verified artist"
              />
            </HStack>
            <Text type="body" weight="semibold" hasTabularNumbers>
              {ARTIST_NAME} · {MONTHLY_LISTENERS} monthly listeners
            </Text>
            <Text type="body" color="secondary">
              {ARTIST_BLURB}
            </Text>
            <HStack>
              <Button
                label={isFollowing ? 'Following' : 'Follow'}
                variant="secondary"
                size="sm"
                onClick={() => setIsFollowing(prev => !prev)}
              />
            </HStack>
          </VStack>
        </StackItem>
      </HStack>
    </Card>
  );

  // ============= NOW-PLAYING DOCK =============

  const volumeIcon = isMuted || volume === 0
    ? VolumeXIcon
    : volume < 50
      ? Volume1Icon
      : Volume2Icon;

  const dock = (
    <div style={styles.dock}>
      {/* Left cluster: current track identity (280px, relaxes <=900px). */}
      <div style={isNarrow ? styles.dockIdentityNarrow : styles.dockIdentityWide}>
        <HStack gap={3} vAlign="center">
          <CoverArt size={48} />
          <StackItem size="fill" style={styles.truncate}>
            <VStack gap={0}>
              <Text type="body" weight="semibold" maxLines={1}>
                {currentTrack.title}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {ARTIST_NAME}
              </Text>
            </VStack>
          </StackItem>
          {heartFor(currentTrack)}
        </HStack>
      </div>

      {/* Center cluster: transport + scrub. */}
      <div style={styles.dockCenter}>
        <VStack gap={1}>
          <HStack gap={1} hAlign="center" vAlign="center">
            <ToggleButton
              label="Shuffle"
              isIconOnly
              size="sm"
              icon={<Icon icon={ShuffleIcon} size="sm" color="inherit" />}
              isPressed={isShuffling}
              onPressedChange={setIsShuffling}
              tooltip={isShuffling ? 'Shuffle on' : 'Shuffle off'}
            />
            <IconButton
              label="Previous track"
              tooltip="Previous track"
              icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              isDisabled={isAtStart && !hasRepeat}
              onClick={goPrev}
            />
            <IconButton
              label={isPlaying ? 'Pause' : 'Play'}
              tooltip={
                isPlaying
                  ? `Pause · ${currentTrack.title}`
                  : `Play · ${currentTrack.title}`
              }
              icon={
                <Icon
                  icon={isPlaying ? PauseIcon : PlayIcon}
                  size="sm"
                  color="inherit"
                />
              }
              variant="primary"
              style={styles.dockPlayButton}
              onClick={() => setIsPlaying(prev => !prev)}
            />
            <IconButton
              label="Next track"
              tooltip="Next track"
              icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              isDisabled={isAtEnd && !hasRepeat}
              onClick={goNext}
            />
            <ToggleButton
              label="Repeat album"
              isIconOnly
              size="sm"
              icon={<Icon icon={Repeat2Icon} size="sm" color="inherit" />}
              isPressed={hasRepeat}
              onPressedChange={setHasRepeat}
              tooltip={hasRepeat ? 'Repeat on' : 'Repeat off'}
            />
          </HStack>
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {formatTime(scrubValue)}
            </Text>
            <StackItem size="fill">
              <Slider
                label={`Seek within ${currentTrack.title}`}
                isLabelHidden
                min={0}
                max={currentTrack.durationSec}
                step={1}
                value={scrubValue}
                onChange={setElapsedSec}
                formatValue={formatTime}
                width="100%"
              />
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {formatTime(currentTrack.durationSec)}
            </Text>
          </HStack>
        </VStack>
      </div>

      {/* Right cluster: volume (hides <=900px). */}
      {!isNarrow && (
        <div style={styles.dockVolume}>
          <HStack gap={1} vAlign="center">
            <IconButton
              label={isMuted ? 'Unmute' : 'Mute'}
              tooltip={isMuted ? 'Unmute' : 'Mute'}
              icon={<Icon icon={volumeIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(prev => !prev)}
            />
            <StackItem size="fill">
              <Slider
                label="Volume"
                isLabelHidden
                min={0}
                max={100}
                step={1}
                value={effectiveVolume}
                onChange={(next: number) => {
                  setVolume(next);
                  setIsMuted(next === 0);
                }}
                formatValue={value => `${value}%`}
                width="100%"
              />
            </StackItem>
          </HStack>
        </div>
      )}
    </div>
  );

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={0}>
          {hero}
          <div style={{...styles.column, ...styles.bodyColumn}}>
            <VStack gap={5}>
              {actionRow}
              <Divider />
              <Table
                data={TRACKS}
                idKey="id"
                columns={columns}
                density="balanced"
                hasHover
                textOverflow="truncate"
                plugins={{nowPlaying: nowPlayingPlugin}}
              />
              {aboutCard}
            </VStack>
          </div>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider padding={0} height={80} label="Now playing">
          {dock}
        </LayoutFooter>
      }
    />
  );
}
