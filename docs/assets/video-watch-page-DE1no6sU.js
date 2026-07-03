var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one on-demand video — 'Building a Home
 *   Studio on a Budget' by Fieldcraft Films, 18:42 long with the playhead at
 *   4:07; six named chapters at fixed second offsets; a 12-item up-next queue
 *   with fixed durations and three partially-watched entries; six comments
 *   with fixed authors, relative-age labels, and like counts)
 * @output Lean-back video watch page: a flexible left column with a 16:9
 *   AspectRatio stage (layered CSS gradients standing in for the frame, a
 *   centered play overlay while paused, a caption strip when CC is on, and a
 *   bottom chrome bar over a scrim — scrub Slider carrying fixed chapter tick
 *   marks, '4:07 / 18:42' timecode plus current chapter, mute, CC toggle,
 *   settings, picture-in-picture, theater ToggleButton, MaximizeIcon), then
 *   the title Heading, channel row (Avatar, subscriber count, Subscribe
 *   Button, like/dislike ButtonGroup, Share), a Collapsible description Card
 *   with view count, upload-date Timestamp, chapter list, and gear Thumbnail
 *   strip, and a comments list with a Top/Newest sort SegmentedControl; the
 *   right rail is 384px of up-next rows with duration chips, red
 *   watched-progress bars on three items, and an Autoplay Switch
 * @position Page template; emitted by \`astryx template video-watch-page\`
 *
 * Frame: Layout height="fill". LayoutContent (padding 0) scrolls the whole
 * page as one column pair inside a centered maxWidth 1720 wrapper: the left
 * column is flexible (min 640) and stacks stage → meta → comments; the right
 * rail targets 384px but flexes down to 280 when the frame is narrow so it
 * never clips at the page edge. Theater mode widens the stage to the full wrapper
 * width and drops the rail beside the meta/comments column instead. This is
 * on-demand playback with comments — choose live-stream-viewer for a live
 * chat rail, and browser-session-replay when the stage shows captured agent
 * frames rather than entertainment chrome.
 *
 * Responsive contract:
 * - >1152px: left column (min 640, fills) | rail 384 (shrinks to 280 min). Theater
 *   mode reflows to stage full-width on top, meta/comments + rail below.
 * - <=1152px: one column — stage, meta, up-next rail, comments; the rail
 *   keeps its 168px thumbs and full-width rows. Theater toggle hides (the
 *   stage is already full width).
 * - The stage chrome keeps size "sm" IconButtons and tabular timecode at
 *   every width; under 1152px the chrome drops the chapter title next to
 *   the timecode so the scrubber never wraps.
 * - <=640px: the "sm" (28px) chrome grows to 40px tap targets (play, mute,
 *   captions, full screen) and the inert settings / picture-in-picture
 *   affordances hide so the row still fits a 375px frame; the comment
 *   like/dislike/Reply controls take the same 40px override.
 *
 * Container policy (media watch archetype): frame-first page chrome; Cards
 * are reserved for the stage surface and the description block. Up-next
 * rows and comments are plain rows — no card-in-card nesting. The stage is
 * locked colorScheme dark so its chrome reads correctly in both themes.
 *
 * Color policy: the video stage (mock-frame gradients, play bubble, caption
 * strip, scrim, timecode, chapter label) and the up-next thumb tiles
 * (duration chip, watched track/fill) are deliberately scheme-locked dark —
 * they are video art and player chrome, which stay dark in both themes like
 * a real player. Both surfaces carry colorScheme: 'dark' in their styles,
 * and everything sitting on them uses raw literals (whites, near-black
 * scrims, the #F03B30 watched red) rather than tokens so it never flips.
 * All other chrome inherits Astryx light-dark() tokens.
 */

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  BellIcon,
  CaptionsIcon,
  HeartIcon,
  ListVideoIcon,
  MaximizeIcon,
  PictureInPicture2Icon,
  PlayIcon,
  PauseIcon,
  RectangleHorizontalIcon,
  SettingsIcon,
  Share2Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered page wrapper; the column pair lives inside it.
  wrapper: {
    width: '100%',
    maxWidth: 1720,
    marginInline: 'auto',
    padding: 'var(--spacing-5)',
  },
  columns: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'flex-start',
  },
  leftColumn: {flex: 1, minWidth: 640},
  // The rail targets 384 but may shrink (never below its 168px thumbs plus
  // a readable text column) so it never overflows narrow desktop frames.
  rail: {flex: '0 1 384px', minWidth: 280},
  stageCard: {overflow: 'hidden', boxShadow: 'var(--shadow-high)'},
  // The mock frame: layered gradients stand in for the video. Locked to
  // colorScheme dark so chrome tokens read correctly on the dark art.
  stage: {
    position: 'relative',
    width: '100%',
    height: '100%',
    colorScheme: 'dark',
    cursor: 'pointer',
    background: [
      'radial-gradient(120% 90% at 28% 18%, rgba(240, 173, 96, 0.38), transparent 62%)',
      'radial-gradient(95% 85% at 80% 70%, rgba(96, 138, 196, 0.30), transparent 58%)',
      'radial-gradient(60% 45% at 52% 88%, rgba(28, 20, 14, 0.85), transparent 70%)',
      'linear-gradient(160deg, #2C221A 0%, #241C14 8%, #120E0A 60%, #0A0806 100%)',
    ].join(', '),
  },
  // Centered paused affordance; decorative — the chrome play button is the
  // accessible control.
  playOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  playBubble: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 12, 0.72)',
    border: '1px solid rgba(255, 255, 255, 0.28)',
    color: '#FFFFFF',
  },
  captionStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 92,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    paddingInline: 'var(--spacing-6)',
  },
  captionText: {
    backgroundColor: 'rgba(8, 8, 10, 0.82)',
    color: '#FFFFFF',
    paddingInline: 10,
    paddingBlock: 4,
    borderRadius: 4,
    fontSize: 15,
    lineHeight: 1.4,
    textAlign: 'center',
  },
  // Bottom chrome bar over a gradient scrim.
  chrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-3)',
    paddingTop: 'var(--spacing-8)',
    background:
      'linear-gradient(to top, rgba(6, 6, 8, 0.88) 0%, rgba(6, 6, 8, 0.45) 55%, transparent 100%)',
    color: '#FFFFFF',
    cursor: 'default',
  },
  timecode: {
    whiteSpace: 'nowrap',
    color: '#FFFFFF',
    marginInlineStart: 'var(--spacing-2)',
  },
  // <=640px: the "sm" (28px) controls grow to 40px tap targets — the chrome
  // bar and comment action rows are thumb surfaces on phones. Icon glyphs
  // stay "sm" so the rows read the same, just roomier; height-only for
  // labeled buttons so their text width is untouched.
  controlTouch: {width: 40, height: 40},
  controlTouchWide: {height: 40},
  chapterLabel: {whiteSpace: 'nowrap', color: 'rgba(255, 255, 255, 0.72)'},
  // Up-next art: 168px 16:9 gradient tiles with overlay chips. Locked to
  // colorScheme dark (scheme-locked art surface — see header Color policy):
  // the hsl art and literal-colored chips stay dark in both themes.
  upNextThumb: {
    position: 'relative',
    width: 168,
    flexShrink: 0,
    borderRadius: 'var(--radius-element)',
    overflow: 'hidden',
    colorScheme: 'dark',
  },
  upNextArt: {width: '100%', height: '100%'},
  durationChip: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: 'rgba(8, 8, 10, 0.85)',
    color: '#FFFFFF',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    paddingInline: 4,
    paddingBlock: 1,
    borderRadius: 4,
    lineHeight: 1.4,
  },
  // Inset pill so the bar never enters the thumb's rounded-corner curve —
  // a full-bleed 4px bar under a 12px radius reads as square bleed.
  watchedTrack: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  watchedFill: {height: '100%', backgroundColor: '#F03B30'},
  // Whole up-next row is a real button; resets keep it looking like a row.
  upNextRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 'var(--radius-element)',
    font: 'inherit',
    color: 'inherit',
  },
  upNextBody: {minWidth: 0, flex: 1},
  // View count and upload date are atomic tokens: never let them wrap or
  // shrink — the collapsed teaser text absorbs the squeeze instead.
  descriptionStat: {whiteSpace: 'nowrap', flexShrink: 0},
  gearStrip: {display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  commentBody: {minWidth: 0},
  // Deepen the sort control's track a step so the unselected segment reads
  // as part of one control against the page background.
  commentSort: {backgroundColor: 'var(--color-background-gray)'},
  // Creator-heart badge: keep the light-mode red, lift the dark-mode rose
  // one step — the Badge default reads dim on its dark maroon pill.
  heartBadge: {color: 'light-dark(#7B0210, #FFC9CE)'},
};

// ============= DATA =============
// Deterministic fixtures: fixed durations, counts, and age labels. No
// clocks, no randomness, no network media — the stage and every thumb are
// CSS gradients.

const VIDEO_TITLE = 'Building a Home Studio on a Budget';
const CHANNEL_NAME = 'Fieldcraft Films';
const CHANNEL_SUBSCRIBERS = '284K subscribers';
const DURATION_SEC = 1122; // 18:42
const INITIAL_POSITION_SEC = 247; // 4:07
const VIEW_COUNT = '41,208 views';
const UPLOADED_AT = '2026-06-12T09:00:00';
const BASE_LIKE_COUNT = 1412; // "1.4K"
const VIDEO_QUALITY = '1080p60';

interface Chapter {
  sec: number;
  title: string;
  /** Fixed CC line shown while the playhead is inside this chapter. */
  caption: string;
}

// Ticks land at 0% / 14% / 31% / 52% / 74% / 90% of 18:42.
const CHAPTERS: Chapter[] = [
  {sec: 0, title: 'Intro', caption: 'Six months, one spare room, and a $1,400 cap — here we go.'},
  {
    sec: 157,
    title: 'Room treatment',
    caption: "First reflections are the enemy — we're treating side walls before anything else.",
  },
  {
    sec: 348,
    title: 'Mics under $200',
    caption: 'Every mic in this shootout was recorded through the same interface.',
  },
  {
    sec: 583,
    title: 'Interface picks',
    caption: 'Two inputs is plenty — spend the difference on the room.',
  },
  {
    sec: 830,
    title: 'Lighting',
    caption: 'One key light, one bounce card. That is the whole lighting budget.',
  },
  {
    sec: 1010,
    title: 'Full setup tour',
    caption: 'Everything you just saw, wired and running in the finished room.',
  },
];

const DESCRIPTION_PARAGRAPHS = [
  'Everything in this video was bought over six months on a $1,400 total budget — no sponsor loaners, no "my old gear from the studio". We cover room treatment first because it is the cheapest upgrade with the biggest audible difference, then mics, interfaces, and a two-light setup.',
  'Room diagrams, the full gear list with prices, and the acoustic panel cut sheet are linked from the channel About tab. Nothing in this video is an affiliate placement.',
];

/** Square attachment previews in the expanded description. */
const GEAR_STILLS = [
  'panel-layout.png',
  'mic-shootout.jpg',
  'interface-picks.jpg',
  'desk-tour.png',
];

interface UpNextItem {
  id: string;
  title: string;
  channel: string;
  duration: string;
  views: string;
  age: string;
  /** 0-100; set on previously-watched items (red progress bar). */
  watchedPct?: number;
  /** Fixed gradient hues for the mock thumb art. */
  hues: [number, number];
}

const UP_NEXT: UpNextItem[] = [
  {id: 'un-01', title: 'Acoustic Panels: DIY vs Bought', channel: 'Fieldcraft Films', duration: '12:04', views: '96K views', age: '3 weeks ago', hues: [24, 38]},
  {id: 'un-02', title: 'The $89 Mic That Sounds Expensive', channel: 'Signal Path', duration: '8:31', views: '214K views', age: '1 month ago', watchedPct: 82, hues: [204, 230]},
  {id: 'un-03', title: 'Room Tone: Why Your Audio Sounds Boxy', channel: 'Signal Path', duration: '15:47', views: '63K views', age: '2 months ago', hues: [188, 210]},
  {id: 'un-04', title: 'Budget Interface Shootout: 6 Under $150', channel: 'Patchbay Lab', duration: '21:09', views: '188K views', age: '5 months ago', hues: [268, 292]},
  {id: 'un-05', title: 'Three-Point Lighting with Two Lights', channel: 'Lumen & Grain', duration: '9:58', views: '44K views', age: '6 days ago', watchedPct: 35, hues: [36, 12]},
  {id: 'un-06', title: 'Desk Setup Tour: Editor Edition', channel: 'Fieldcraft Films', duration: '14:22', views: '121K views', age: '2 months ago', hues: [152, 170]},
  {id: 'un-07', title: 'Stop Buying Foam: Bass Traps First', channel: 'Hertz So Good', duration: '11:36', views: '302K views', age: '1 year ago', hues: [340, 8]},
  {id: 'un-08', title: 'USB vs XLR: The Honest Answer', channel: 'Signal Path', duration: '7:12', views: '540K views', age: '1 year ago', hues: [214, 190]},
  {id: 'un-09', title: 'Color Grading Log Footage for Beginners', channel: 'Lumen & Grain', duration: '18:05', views: '77K views', age: '3 weeks ago', watchedPct: 60, hues: [286, 320]},
  {id: 'un-10', title: 'My Whole Studio Runs on One Power Strip', channel: 'Patchbay Lab', duration: '6:48', views: '29K views', age: '4 days ago', hues: [58, 40]},
  {id: 'un-11', title: 'Treating a Rental Without Drilling', channel: 'Hertz So Good', duration: '13:27', views: '91K views', age: '8 months ago', hues: [122, 96]},
  {id: 'un-12', title: "What I'd Buy Again: 2 Years Later", channel: 'Fieldcraft Films', duration: '16:33', views: '156K views', age: '1 week ago', hues: [16, 350]},
];

interface Comment {
  id: string;
  author: string;
  /** Fixed relative-age label (no clocks). */
  age: string;
  /** Fixed rank for the Newest sort — lower is newer. */
  ageRank: number;
  likes: number;
  text: string;
  /** Creator-heart badge from Fieldcraft Films. */
  isHearted?: boolean;
}

const COMMENTS: Comment[] = [
  {
    id: 'c-1',
    author: 'Maya Okafor',
    age: '2 days ago',
    ageRank: 1,
    likes: 214,
    text: 'The room treatment section saved me from dropping $300 on foam that would have done nothing. Panels on first reflections made a bigger difference than my mic upgrade.',
    isHearted: true,
  },
  {
    id: 'c-2',
    author: 'Derek Lin',
    age: '5 days ago',
    ageRank: 2,
    likes: 96,
    text: 'Timestamped chapter for the interface picks is exactly where I sent three friends this week. 7:43 onward is required viewing.',
  },
  {
    id: 'c-3',
    author: 'Priya Natarajan',
    age: '1 week ago',
    ageRank: 3,
    likes: 61,
    text: 'Would love a follow-up on treating an L-shaped room. The panel cut sheet in the About tab is already printed and taped to my wall.',
  },
  {
    id: 'c-4',
    author: 'Sam Whitfield',
    age: '2 weeks ago',
    ageRank: 4,
    likes: 388,
    text: 'Finally someone says it: two inputs is plenty. Spent years lugging an 8-channel interface for a podcast with one mic.',
  },
  {
    id: 'c-5',
    author: 'Elena Petrova',
    age: '2 weeks ago',
    ageRank: 5,
    likes: 12,
    text: 'The lighting chapter is quietly the best two-light explainer on this platform.',
  },
  {
    id: 'c-6',
    author: 'Jordan Reyes',
    age: '3 weeks ago',
    ageRank: 6,
    likes: 45,
    text: 'Bought the $89 mic from the shootout after this. No regrets — the A/B at 6:10 is honest in a way gear videos never are.',
  },
];

// ============= HELPERS =============

/** 247 -> "4:07". Minutes never pad; seconds always do. */
function formatTime(totalSec: number): string {
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return \`\${min}:\${sec.toString().padStart(2, '0')}\`;
}

/** 1412 -> "1,412" (fixed en-US grouping; deterministic). */
function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

function chapterAt(positionSec: number): Chapter {
  let current = CHAPTERS[0];
  for (const chapter of CHAPTERS) {
    if (chapter.sec <= positionSec) {
      current = chapter;
    }
  }
  return current;
}

// ============= PLAYER STAGE =============

interface PlayerStageProps {
  isPlaying: boolean;
  positionSec: number;
  isMuted: boolean;
  captionsOn: boolean;
  theaterMode: boolean;
  showTheaterToggle: boolean;
  isCompact: boolean;
  isPhone: boolean;
  onPlayToggle: () => void;
  onSeek: (sec: number) => void;
  onMuteToggle: () => void;
  onCaptionsToggle: (isPressed: boolean) => void;
  onTheaterToggle: (isPressed: boolean) => void;
}

/**
 * The mock frame + chrome bar. The art is pure CSS gradients; clicking it
 * toggles play (mouse convenience — the chrome play IconButton is the
 * accessible control). The scrubber carries fixed chapter tick marks.
 */
function PlayerStage({
  isPlaying,
  positionSec,
  isMuted,
  captionsOn,
  theaterMode,
  showTheaterToggle,
  isCompact,
  isPhone,
  onPlayToggle,
  onSeek,
  onMuteToggle,
  onCaptionsToggle,
  onTheaterToggle,
}: PlayerStageProps) {
  const chapter = chapterAt(positionSec);
  const touch = isPhone ? styles.controlTouch : undefined;

  return (
    <Card padding={0} style={styles.stageCard}>
      <AspectRatio ratio={16 / 9}>
        <div style={styles.stage} onClick={onPlayToggle}>
          {!isPlaying && (
            <div style={styles.playOverlay} aria-hidden>
              <div style={styles.playBubble}>
                <Icon icon={PlayIcon} size="lg" color="inherit" />
              </div>
            </div>
          )}

          {captionsOn && (
            <div style={styles.captionStrip}>
              <span style={styles.captionText}>{chapter.caption}</span>
            </div>
          )}

          {/* Chrome bar: clicks here must not toggle playback. */}
          <div style={styles.chrome} onClick={event => event.stopPropagation()}>
            <VStack gap={1}>
              <Slider
                label="Seek"
                isLabelHidden
                min={0}
                max={DURATION_SEC}
                step={1}
                value={positionSec}
                onChange={onSeek}
                valueDisplay="none"
                formatValue={value =>
                  \`\${formatTime(value)} of \${formatTime(DURATION_SEC)}\`
                }
                marks={CHAPTERS.map(mark => ({value: mark.sec}))}
              />
              <HStack gap={1} vAlign="center">
                <IconButton
                  label={isPlaying ? 'Pause' : 'Play'}
                  tooltip={isPlaying ? 'Pause (k)' : 'Play (k)'}
                  icon={
                    <Icon
                      icon={isPlaying ? PauseIcon : PlayIcon}
                      size="sm"
                      color="inherit"
                    />
                  }
                  variant="ghost"
                  size="sm"
                  onClick={onPlayToggle}
                  style={touch}
                />
                <IconButton
                  label={isMuted ? 'Unmute' : 'Mute'}
                  tooltip={isMuted ? 'Unmute (m)' : 'Mute (m)'}
                  icon={
                    <Icon
                      icon={isMuted ? VolumeXIcon : Volume2Icon}
                      size="sm"
                      color="inherit"
                    />
                  }
                  variant="ghost"
                  size="sm"
                  onClick={onMuteToggle}
                  style={touch}
                />
                <Text type="supporting" hasTabularNumbers style={styles.timecode}>
                  {formatTime(positionSec)} / {formatTime(DURATION_SEC)}
                </Text>
                {!isCompact && (
                  <Text type="supporting" style={styles.chapterLabel}>
                    · {chapter.title}
                  </Text>
                )}
                <StackItem size="fill">{null}</StackItem>
                <ToggleButton
                  label="Captions"
                  tooltip={captionsOn ? 'Captions on (c)' : 'Captions off (c)'}
                  icon={<Icon icon={CaptionsIcon} size="sm" color="inherit" />}
                  isIconOnly
                  size="sm"
                  isPressed={captionsOn}
                  onPressedChange={onCaptionsToggle}
                  style={touch}
                />
                {/* Phones hide the inert settings/PiP affordances so the
                    remaining 40px targets still fit a 375px frame. */}
                {!isPhone && (
                  <IconButton
                    label="Settings"
                    tooltip={\`Quality · \${VIDEO_QUALITY}\`}
                    icon={<Icon icon={SettingsIcon} size="sm" color="inherit" />}
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                  />
                )}
                {!isPhone && (
                  <IconButton
                    label="Picture in picture"
                    tooltip="Picture in picture (i)"
                    icon={
                      <Icon
                        icon={PictureInPicture2Icon}
                        size="sm"
                        color="inherit"
                      />
                    }
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                  />
                )}
                {showTheaterToggle && (
                  <ToggleButton
                    label="Theater mode"
                    tooltip={theaterMode ? 'Default view (t)' : 'Theater mode (t)'}
                    icon={
                      <Icon
                        icon={RectangleHorizontalIcon}
                        size="sm"
                        color="inherit"
                      />
                    }
                    isIconOnly
                    size="sm"
                    isPressed={theaterMode}
                    onPressedChange={onTheaterToggle}
                  />
                )}
                <IconButton
                  label="Full screen"
                  tooltip="Full screen (f)"
                  icon={<Icon icon={MaximizeIcon} size="sm" color="inherit" />}
                  variant="ghost"
                  size="sm"
                  onClick={() => {}}
                  style={touch}
                />
              </HStack>
            </VStack>
          </div>
        </div>
      </AspectRatio>
    </Card>
  );
}

// ============= META BLOCK =============

function ChannelRow({
  subscribed,
  onSubscribeToggle,
  liked,
  disliked,
  onLike,
  onDislike,
}: {
  subscribed: boolean;
  onSubscribeToggle: () => void;
  liked: boolean;
  disliked: boolean;
  onLike: () => void;
  onDislike: () => void;
}) {
  const likeCount = BASE_LIKE_COUNT + (liked ? 1 : 0);

  return (
    <HStack gap={3} vAlign="center" wrap="wrap">
      <HStack gap={2} vAlign="center">
        <Avatar name={CHANNEL_NAME} size={40} />
        <VStack gap={0}>
          <Text type="body" weight="semibold">
            {CHANNEL_NAME}
          </Text>
          <Text type="supporting" color="secondary">
            {CHANNEL_SUBSCRIBERS}
          </Text>
        </VStack>
        <Button
          label={subscribed ? 'Subscribed' : 'Subscribe'}
          variant={subscribed ? 'secondary' : 'primary'}
          size="sm"
          icon={
            subscribed ? (
              <Icon icon={BellIcon} size="sm" color="inherit" />
            ) : undefined
          }
          onClick={onSubscribeToggle}
        />
      </HStack>
      <StackItem size="fill">{null}</StackItem>
      <HStack gap={2} vAlign="center">
        <ButtonGroup label="Rate this video" size="sm">
          <Button
            label={formatCount(likeCount)}
            variant={liked ? 'primary' : 'secondary'}
            size="sm"
            icon={<Icon icon={ThumbsUpIcon} size="sm" color="inherit" />}
            onClick={onLike}
          />
          <Button
            label="Dislike"
            variant={disliked ? 'primary' : 'secondary'}
            size="sm"
            icon={<Icon icon={ThumbsDownIcon} size="sm" color="inherit" />}
            isIconOnly
            onClick={onDislike}
          />
        </ButtonGroup>
        <Button
          label="Share"
          variant="secondary"
          size="sm"
          icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
      </HStack>
    </HStack>
  );
}

/**
 * Collapsible description Card: the trigger row carries view count and
 * upload date; expanding reveals the full description, the chapter list
 * (clicking a chapter moves the playhead), and the gear Thumbnail strip.
 */
function DescriptionCard({
  isExpanded,
  onExpandedChange,
  onChapterSeek,
}: {
  isExpanded: boolean;
  onExpandedChange: (isOpen: boolean) => void;
  onChapterSeek: (sec: number) => void;
}) {
  return (
    <Card padding={3}>
      <Collapsible
        isOpen={isExpanded}
        onOpenChange={onExpandedChange}
        trigger={
          <HStack gap={2} vAlign="center">
            <Text
              type="body"
              weight="semibold"
              hasTabularNumbers
              style={styles.descriptionStat}>
              {VIEW_COUNT}
            </Text>
            {/* span wrapper: white-space inherits through, and the span is
                the flex item that takes the no-shrink rule. */}
            <span style={styles.descriptionStat}>
              <Timestamp value={UPLOADED_AT} format="date" type="body" weight="semibold" color="primary" />
            </span>
            {!isExpanded && (
              <Text type="supporting" color="secondary" maxLines={1}>
                Everything in this video was bought over six months on a $1,400
                total budget… more
              </Text>
            )}
          </HStack>
        }>
        <VStack gap={3}>
          {DESCRIPTION_PARAGRAPHS.map(paragraph => (
            <Text key={paragraph.slice(0, 24)} type="body">
              {paragraph}
            </Text>
          ))}
          <Divider />
          <Text type="label" color="secondary">
            Chapters
          </Text>
          <VStack gap={1} hAlign="start">
            {CHAPTERS.map(chapter => (
              <Button
                key={chapter.sec}
                label={\`\${formatTime(chapter.sec)} · \${chapter.title}\`}
                variant="ghost"
                size="sm"
                onClick={() => onChapterSeek(chapter.sec)}
              />
            ))}
          </VStack>
          <Divider />
          <Text type="label" color="secondary">
            Stills from this video
          </Text>
          <div style={styles.gearStrip}>
            {GEAR_STILLS.map(still => (
              <Thumbnail key={still} label={still} />
            ))}
          </div>
        </VStack>
      </Collapsible>
    </Card>
  );
}

// ============= COMMENTS =============

function CommentRow({comment, isPhone}: {comment: Comment; isPhone: boolean}) {
  const touch = isPhone ? styles.controlTouch : undefined;
  return (
    <HStack gap={2} vAlign="start">
      <Avatar name={comment.author} size={32} />
      <StackItem size="fill" style={styles.commentBody}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Text type="body" weight="semibold">
              {comment.author}
            </Text>
            <Text type="supporting" color="secondary">
              {comment.age}
            </Text>
            {comment.isHearted && (
              <Badge
                label={\`by \${CHANNEL_NAME}\`}
                variant="red"
                icon={<Icon icon={HeartIcon} size="xsm" color="inherit" />}
                style={styles.heartBadge}
              />
            )}
          </HStack>
          <Text type="body">{comment.text}</Text>
          <HStack gap={1} vAlign="center">
            <IconButton
              label={\`Like comment by \${comment.author}\`}
              tooltip="Like"
              icon={<Icon icon={ThumbsUpIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => {}}
              style={touch}
            />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {comment.likes}
            </Text>
            <IconButton
              label={\`Dislike comment by \${comment.author}\`}
              tooltip="Dislike"
              icon={<Icon icon={ThumbsDownIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => {}}
              style={touch}
            />
            <Button
              label="Reply"
              variant="ghost"
              size="sm"
              onClick={() => {}}
              style={isPhone ? styles.controlTouchWide : undefined}
            />
          </HStack>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function CommentsSection({
  sort,
  onSortChange,
  isPhone,
}: {
  sort: 'top' | 'newest';
  onSortChange: (sort: 'top' | 'newest') => void;
  isPhone: boolean;
}) {
  const sorted = [...COMMENTS].sort((a, b) =>
    sort === 'top' ? b.likes - a.likes : a.ageRank - b.ageRank,
  );

  return (
    <VStack gap={4}>
      <HStack gap={3} vAlign="center">
        <Heading level={2}>{COMMENTS.length} Comments</Heading>
        <SegmentedControl
          value={sort}
          onChange={value => onSortChange(value as 'top' | 'newest')}
          label="Sort comments"
          size="sm"
          style={styles.commentSort}>
          <SegmentedControlItem value="top" label="Top" />
          <SegmentedControlItem value="newest" label="Newest" />
        </SegmentedControl>
      </HStack>
      <VStack gap={4}>
        {sorted.map(comment => (
          <CommentRow key={comment.id} comment={comment} isPhone={isPhone} />
        ))}
      </VStack>
    </VStack>
  );
}

// ============= UP-NEXT RAIL =============

/** Deterministic mock art: two fixed hues per item, no image assets. */
function upNextArtStyle(item: UpNextItem): CSSProperties {
  const [h1, h2] = item.hues;
  return {
    ...styles.upNextArt,
    background: [
      \`radial-gradient(110% 80% at 30% 25%, hsla(\${h1}, 55%, 62%, 0.55), transparent 60%)\`,
      \`linear-gradient(135deg, hsl(\${h1}, 42%, 32%) 0%, hsl(\${h2}, 48%, 16%) 100%)\`,
    ].join(', '),
  };
}

function UpNextRow({
  item,
  isQueued,
  onQueue,
}: {
  item: UpNextItem;
  isQueued: boolean;
  onQueue: (id: string) => void;
}) {
  return (
    <Tooltip content={isQueued ? 'Queued to play next' : 'Play next'}>
      <button
        type="button"
        style={styles.upNextRow}
        onClick={() => onQueue(item.id)}>
        <div style={styles.upNextThumb}>
          <AspectRatio ratio={16 / 9}>
            <div style={upNextArtStyle(item)} />
          </AspectRatio>
          {item.watchedPct != null && (
            <div style={styles.watchedTrack} aria-hidden>
              <div
                style={{...styles.watchedFill, width: \`\${item.watchedPct}%\`}}
              />
            </div>
          )}
          {/* Chip renders after the track so it stacks above the pill. */}
          <span style={styles.durationChip}>{item.duration}</span>
        </div>
        <div style={styles.upNextBody}>
          <VStack gap={0}>
            <Text type="body" weight="semibold" maxLines={2}>
              {item.title}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {item.channel}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {item.views} · {item.age}
            </Text>
            {isQueued && (
              <HStack>
                <Badge label="Up next" variant="info" />
              </HStack>
            )}
          </VStack>
        </div>
      </button>
    </Tooltip>
  );
}

function UpNextRail({
  autoplay,
  onAutoplayChange,
  queuedId,
  onQueue,
}: {
  autoplay: boolean;
  onAutoplayChange: (checked: boolean) => void;
  queuedId: string;
  onQueue: (id: string) => void;
}) {
  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ListVideoIcon} size="md" color="secondary" />
        <StackItem size="fill">
          <Heading level={2}>Up next</Heading>
        </StackItem>
        <Switch
          label="Autoplay"
          value={autoplay}
          onChange={checked => onAutoplayChange(checked)}
        />
      </HStack>
      <VStack gap={3}>
        {UP_NEXT.map(item => (
          <UpNextRow
            key={item.id}
            item={item}
            isQueued={item.id === queuedId}
            onQueue={onQueue}
          />
        ))}
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function VideoWatchPageTemplate() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(INITIAL_POSITION_SEC);
  const [isMuted, setIsMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [commentSort, setCommentSort] = useState<'top' | 'newest'>('top');
  const [autoplay, setAutoplay] = useState(true);
  const [queuedId, setQueuedId] = useState(UP_NEXT[0].id);

  // Responsive contract: <=1152px the rail stacks below the player;
  // <=640px the chrome and comment controls take the 40px tap-target
  // override and the inert settings/PiP chrome affordances hide.
  const isStacked = useMediaQuery('(max-width: 1152px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // UI animation only: while "playing", advance the playhead one second per
  // second. All fixture data stays fixed; no real media is decoded.
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = setInterval(() => {
      setPositionSec(prev => Math.min(DURATION_SEC, prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (positionSec >= DURATION_SEC) {
      setIsPlaying(false);
    }
  }, [positionSec]);

  const handleLike = () => {
    setLiked(prev => !prev);
    setDisliked(false);
  };
  const handleDislike = () => {
    setDisliked(prev => !prev);
    setLiked(false);
  };
  const handleChapterSeek = (sec: number) => {
    setPositionSec(sec);
    setIsPlaying(true);
  };

  const stage = (
    <PlayerStage
      isPlaying={isPlaying}
      positionSec={positionSec}
      isMuted={isMuted}
      captionsOn={captionsOn}
      theaterMode={theaterMode}
      showTheaterToggle={!isStacked}
      isCompact={isStacked}
      isPhone={isPhone}
      onPlayToggle={() => setIsPlaying(prev => !prev)}
      onSeek={setPositionSec}
      onMuteToggle={() => setIsMuted(prev => !prev)}
      onCaptionsToggle={setCaptionsOn}
      onTheaterToggle={setTheaterMode}
    />
  );

  const meta = (
    <VStack gap={3}>
      <Heading level={1}>{VIDEO_TITLE}</Heading>
      <ChannelRow
        subscribed={subscribed}
        onSubscribeToggle={() => setSubscribed(prev => !prev)}
        liked={liked}
        disliked={disliked}
        onLike={handleLike}
        onDislike={handleDislike}
      />
      <DescriptionCard
        isExpanded={descriptionExpanded}
        onExpandedChange={setDescriptionExpanded}
        onChapterSeek={handleChapterSeek}
      />
    </VStack>
  );

  const comments = (
    <CommentsSection
      sort={commentSort}
      onSortChange={setCommentSort}
      isPhone={isPhone}
    />
  );

  const rail = (
    <UpNextRail
      autoplay={autoplay}
      onAutoplayChange={setAutoplay}
      queuedId={queuedId}
      onQueue={setQueuedId}
    />
  );

  let body: ReactNode;
  if (isStacked) {
    // One column: stage, meta, rail, comments.
    body = (
      <VStack gap={5}>
        {stage}
        {meta}
        <Divider />
        {rail}
        <Divider />
        {comments}
      </VStack>
    );
  } else if (theaterMode) {
    // Theater: full-width stage on top; meta/comments | rail below.
    body = (
      <VStack gap={5}>
        {stage}
        <div style={styles.columns}>
          <div style={styles.leftColumn}>
            <VStack gap={5}>
              {meta}
              <Divider />
              {comments}
            </VStack>
          </div>
          <div style={styles.rail}>{rail}</div>
        </div>
      </VStack>
    );
  } else {
    // Default: (stage + meta + comments) | rail 384.
    body = (
      <div style={styles.columns}>
        <div style={styles.leftColumn}>
          <VStack gap={5}>
            {stage}
            {meta}
            <Divider />
            {comments}
          </VStack>
        </div>
        <div style={styles.rail}>{rail}</div>
      </div>
    );
  }

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={0}>
          <div style={styles.wrapper}>{body}</div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};