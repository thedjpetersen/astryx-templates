var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one podcast episode — 'Signal Path'
 *   episode 87 'Designing for Latency', 52:14 long, published Jun 24 2026,
 *   playhead parked at 17:26; 8 fixed chapters, 16 transcript cues
 *   alternating host Maya Chen and guest Andre Okafor, show-notes Markdown
 *   with five bullet links and a sponsor line)
 * @output Podcast episode listening page: a centered 720px column with an
 *   episode hero (square gradient cover with an inline-SVG soundwave mark,
 *   'Signal Path' eyebrow Link, episode title, 'Episode 87 · 52:14 ·
 *   Jun 24, 2026' meta row, host/guest Avatars) above a playback-synced
 *   transcript — each cue is a ClickableCard with speaker Avatar initial,
 *   name, mm:ss cue time, and paragraph text; the cue containing the
 *   playhead gets the primary-tinted 'blue' Card variant and a Playing
 *   Badge. A right 320px LayoutPanel holds a Chapters | Show notes TabList
 *   (chapter rows with start times and slim per-chapter progress meters,
 *   Markdown notes), and a persistent bottom player bar carries cover thumb, title,
 *   SkipBack/Play/SkipForward transport, a scrub Slider with elapsed/total,
 *   a 1x/1.25x/1.5x/2x speed SegmentedControl, and a Volume2/VolumeX mute
 *   toggle
 * @position Page template; emitted by \`astryx template podcast-episode-player\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the show breadcrumb
 * (Podcasts / Signal Path / Episode 87) and the Follow → Following Button.
 * LayoutContent scrolls a centered 720px column (hero band, then the
 * transcript list). LayoutPanel end 320 hosts the Chapters | Show notes
 * TabList. LayoutFooter is the docked 80px player bar outside the scroll
 * region. Choose this over transcript-annotator when the transcript is
 * playback-synced listening, not labeling, and over album-tracklist-player
 * when the surface is one long episode with chapters, not a tracklist.
 *
 * Responsive contract:
 * - >1024px: header | content (720 col centered) + panel 320 | footer 80.
 * - <=1024px: the chapters/notes panel hides; the transcript column keeps
 *   its 720px cap and stays centered.
 * - <=768px: the player bar stacks — transport row centered on top, the
 *   scrub Slider full-width beneath (footer height goes auto), and the
 *   speed SegmentedControl drops; the skip/play/mute controls grow to
 *   40px tap targets; the hero stacks cover above the titles.
 * - Elapsed/total readouts and cue times keep tabular numbers so the bar
 *   never jitters while the playhead ticks.
 *
 * Container policy (listening-surface archetype): frame-first chrome; the
 * only cards are the transcript cues themselves (ClickableCards so a tap
 * seeks), chapters are dense List rows, and the player bar is a footer row.
 *
 * Fixture policy: fixed data only. No <audio>/<video>, no network media —
 * playback is useState UI state (a 1s interval ticks positionSec while
 * "playing"); the cover is a fixed two-stop CSS gradient with a
 * deterministic inline-SVG soundwave.
 *
 * Color policy: the episode cover art (COVER_GRADIENT plus the white
 * soundwave mark) is deliberately scheme-locked — cover art is "ink" and
 * must render the same pixels in both themes, so it keeps raw literals and
 * pins colorScheme: 'dark' on its surface (styles.cover); the #FFFFFF wave
 * bars sit on that locked surface and stay literal so they remain readable.
 * Everything else in the template is token-pure (var(--color-*) only).
 */

import {useEffect, useRef, useState, type CSSProperties} from 'react';

import {
  CheckIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  PodcastIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {BreadcrumbItem, Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= COVER ART CONSTANTS =============
// Fixed two-stop gradient + deterministic soundwave bars (no image assets,
// no randomness). The same mark paints the 120px hero cover and the 44px
// player-bar thumb. Scheme-locked brand art (see header "Color policy"):
// the literal hex stops are intentional and styles.cover pins colorScheme
// so the art renders identically in light and dark mode.

const COVER_GRADIENT = 'linear-gradient(135deg, #4C1D95 0%, #0E7490 100%)';
const WAVE_BARS = [8, 14, 22, 12, 26, 18, 30, 16, 24, 10, 19, 13];

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Centered listening column; full-width below the 720px cap.
  column: {
    width: '100%',
    maxWidth: 720,
    marginInline: 'auto',
  },
  // Scheme-locked cover art: same pixels in both themes (see header
  // "Color policy"); literals only inside this surface.
  cover: {
    colorScheme: 'dark',
    background: COVER_GRADIENT,
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  cueBody: {minWidth: 0},
  // Fixed-width mm:ss gutter so chapter rows align.
  chapterTime: {width: 44, textAlign: 'right'},
  // Slim per-chapter listening meter: muted track, tinted fill (blue for
  // the current chapter, soft neutral for played ones).
  chapterTrack: {
    height: 4,
    marginTop: 4,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  chapterFill: {
    height: '100%',
    borderRadius: 'var(--radius-full)',
  },
  // Current chapter row: same blue tint family as the active transcript cue.
  chapterRowActive: {
    backgroundColor: 'var(--color-background-blue)',
  },
  // Player bar: title cluster keeps a stable width on wide screens so the
  // scrub Slider doesn't jump as titles change.
  barTitle: {width: 224, minWidth: 0},
  barTitleNarrow: {minWidth: 0},
  barSlider: {minWidth: 0},
  // <=768px: skip/play/mute grow from their 28px \`sm\` / 32px \`md\` chrome to
  // 40px tap targets — the player bar is the primary touch surface on
  // phones. Icon glyphs stay "sm" so the bar reads the same, just roomier.
  barControlTouch: {width: 40, height: 40},
};

// ============= DATA =============
// Deterministic fixtures: fixed durations, cue times, and chapter starts.
// No clocks, no randomness, no network assets.

const SHOW_NAME = 'Signal Path';
const EPISODE_NUMBER = 87;
const EPISODE_TITLE = 'Designing for Latency';
const PUBLISHED_AT = '2026-06-24T06:00:00';
const DURATION_SEC = 52 * 60 + 14; // 52:14
const INITIAL_POSITION_SEC = 17 * 60 + 26; // 17:26

/** Seconds -> zero-padded mm:ss (e.g. 1046 -> "17:26"). */
function formatTime(totalSec: number): string {
  const clamped = Math.max(0, Math.min(DURATION_SEC, Math.round(totalSec)));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return \`\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}\`;
}

type SpeakerId = 'maya' | 'andre';

const SPEAKERS: Record<SpeakerId, {name: string; role: string}> = {
  maya: {name: 'Maya Chen', role: 'Host'},
  andre: {name: 'Andre Okafor', role: 'Guest'},
};

interface Chapter {
  id: string;
  title: string;
  startSec: number;
}

const CHAPTERS: Chapter[] = [
  {id: 'ch-1', title: 'Cold open', startSec: 0},
  {id: 'ch-2', title: 'Guest intro', startSec: 168},
  {id: 'ch-3', title: 'What latency budgets buy you', startSec: 435},
  {id: 'ch-4', title: 'The 100ms myth', startSec: 842},
  {id: 'ch-5', title: 'Perceived vs measured', startSec: 1300},
  {id: 'ch-6', title: 'Case study: checkout flow', startSec: 1865},
  {id: 'ch-7', title: 'Tooling picks', startSec: 2538},
  {id: 'ch-8', title: 'Outro', startSec: 2970},
];

interface TranscriptCue {
  id: string;
  speaker: SpeakerId;
  startSec: number;
  text: string;
}

// 16 cues alternating Maya/Andre, fixed starts every ~60–90s. The window
// covers 14:02–33:15 — the stretch around the parked 17:26 playhead.
const CUES: TranscriptCue[] = [
  {
    id: 'cue-01',
    speaker: 'maya',
    startSec: 842,
    text: "Okay, the 100ms myth. Every performance deck I've ever seen quotes it like scripture — respond in 100 milliseconds or the user notices. Where did that number actually come from?",
  },
  {
    id: 'cue-02',
    speaker: 'andre',
    startSec: 917,
    text: "It's a 1968 paper, and it was about keystroke echo, not page loads. The finding was that direct manipulation feels broken past roughly a tenth of a second. Somewhere along the way we promoted it to a universal SLA.",
  },
  {
    id: 'cue-03',
    speaker: 'maya',
    startSec: 995,
    text: "So when a team says 'our budget is 100ms end to end' for a checkout submit, they're holding a network round trip to a standard written for local keypresses. That seems... ambitious.",
  },
  {
    id: 'cue-04',
    speaker: 'andre',
    startSec: 1072,
    text: "It's worse than ambitious — it's misdirected effort. Users don't experience the median, they experience the tail. I'd rather ship a steady 250ms than a p50 of 80ms with a p99 of two seconds. Consistency reads as speed.",
  },
  {
    id: 'cue-05',
    speaker: 'maya',
    startSec: 1151,
    text: "Say more about that, because I think it's the most counterintuitive thing you've told me. A flat 250 beats an occasionally-instant 80?",
  },
  {
    id: 'cue-06',
    speaker: 'andre',
    startSec: 1224,
    text: "Every time. Variance is what people describe as 'janky'. If the interface answers in the same beat every time, users build a rhythm with it. Break the rhythm once and they distrust every interaction after.",
  },
  {
    id: 'cue-07',
    speaker: 'maya',
    startSec: 1300,
    text: "That's a good bridge into perceived versus measured. Your team famously deleted a spinner and got a 'the app got faster' shout-out in reviews — with zero backend changes.",
  },
  {
    id: 'cue-08',
    speaker: 'andre',
    startSec: 1378,
    text: "Guilty. The spinner appeared at 300ms and made a 600ms operation feel like a coffee break. We swapped it for an optimistic row that filled in details as they arrived. Measured latency: identical. Perceived latency: cut in half.",
  },
  {
    id: 'cue-09',
    speaker: 'maya',
    startSec: 1452,
    text: "Is there a rule of thumb for when to show progress at all? I've heard 'never before one second' and also 'always within 100ms', which can't both be right.",
  },
  {
    id: 'cue-10',
    speaker: 'andre',
    startSec: 1530,
    text: "Mine is: acknowledge instantly, report progress reluctantly. The tap should do something visible in a frame or two — depress, highlight, move. But a progress indicator is a confession that you're slow, so hold it until about a second.",
  },
  {
    id: 'cue-11',
    speaker: 'maya',
    startSec: 1607,
    text: "Acknowledge instantly, report reluctantly. I'm putting that on a sticker. Okay — you promised me a war story about a checkout flow.",
  },
  {
    id: 'cue-12',
    speaker: 'andre',
    startSec: 1684,
    text: "So we inherited a checkout that took 3.4 seconds from 'place order' to confirmation. The instinct was to attack the payment call. But the trace showed 1.8 of those seconds were us — serial address validation, then tax, then inventory.",
  },
  {
    id: 'cue-13',
    speaker: 'maya',
    startSec: 1762,
    text: "Three sequential calls that could have been concurrent the whole time. How long had that been sitting there?",
  },
  {
    id: 'cue-14',
    speaker: 'andre',
    startSec: 1840,
    text: "Four years. Nobody looked because the dashboard only charted the payment provider's latency. The budget exercise forced us to charge every millisecond to an owner, and suddenly the 1.8 seconds had a name on it.",
  },
  {
    id: 'cue-15',
    speaker: 'maya',
    startSec: 1918,
    text: "And once it had a name, it got fixed in — what did you say — a week? After four years of nobody owning it.",
  },
  {
    id: 'cue-16',
    speaker: 'andre',
    startSec: 1995,
    text: "Nine days, including the argument about whether tax could really run before address validation finished. Parallelizing took an afternoon. Deciding it was safe took eight and a half days. That ratio is the whole discipline, honestly.",
  },
];

const TRANSCRIPT_WINDOW = \`\${formatTime(CUES[0].startSec)} – \${formatTime(
  CUES[CUES.length - 1].startSec,
)}\`;

const SHOW_NOTES = \`Everything Maya and Andre reference this episode, in order:

- [Latency budgets worksheet (Andre's template)](https://example.com/latency-budgets-worksheet)
- [The 100ms rule, revisited — where the number came from](https://example.com/100ms-rule-revisited)
- [Field guide to perceived performance](https://example.com/perceived-performance-guide)
- [Checkout flow case study slides](https://example.com/checkout-case-study)
- [Andre's tracing toolkit picks](https://example.com/tracing-toolkit-picks)

---

*Sponsored by Fastmetric — real-user monitoring that writes the latency budget for you. Signal Path listeners get 3 months free with code SIGNALPATH.*\`;

const SPEED_OPTIONS = [
  {value: '1', label: '1x'},
  {value: '1.25', label: '1.25x'},
  {value: '1.5', label: '1.5x'},
  {value: '2', label: '2x'},
] as const;

// ============= DERIVATIONS =============

/** Index of the last entry whose start is at or before the playhead. */
function lastIndexAtOrBefore(starts: number[], positionSec: number): number {
  let index = -1;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] <= positionSec) {
      index = i;
    } else {
      break;
    }
  }
  return index;
}

const CHAPTER_STARTS = CHAPTERS.map(chapter => chapter.startSec);
const CUE_STARTS = CUES.map(cue => cue.startSec);

/** End of a chapter = next chapter's start (last runs to episode end). */
function chapterEndSec(index: number): number {
  return index + 1 < CHAPTERS.length
    ? CHAPTERS[index + 1].startSec
    : DURATION_SEC;
}

/** Per-chapter listening progress, 0–100. */
function chapterProgress(index: number, positionSec: number): number {
  const start = CHAPTERS[index].startSec;
  const end = chapterEndSec(index);
  if (positionSec <= start) {
    return 0;
  }
  if (positionSec >= end) {
    return 100;
  }
  return Math.round(((positionSec - start) / (end - start)) * 100);
}

// ============= COVER ART =============

/**
 * The episode cover: fixed two-stop gradient square with a deterministic
 * inline-SVG soundwave mark. Rendered at 120px in the hero and 44px in
 * the player bar — no image assets.
 */
function CoverArt({size}: {size: number}) {
  return (
    <div aria-hidden style={{...styles.cover, width: size, height: size}}>
      <svg
        width="70%"
        height="70%"
        viewBox="0 0 48 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        {WAVE_BARS.map((bar, index) => (
          <rect
            key={index}
            x={index * 4 + 0.75}
            y={17 - bar / 2}
            width={2.5}
            height={bar}
            rx={1.25}
            // Literal white on the scheme-locked cover gradient (see header
            // "Color policy") so the mark stays readable in both themes.
            fill="#FFFFFF"
            opacity={index % 3 === 0 ? 0.95 : 0.7}
          />
        ))}
      </svg>
    </div>
  );
}

// ============= HERO =============

function EpisodeHero({isNarrow}: {isNarrow: boolean}) {
  const titles = (
    <VStack gap={2}>
      <HStack gap={1.5} vAlign="center">
        <Icon icon={PodcastIcon} size="sm" color="secondary" />
        <Link href="#signal-path" type="label" color="secondary">
          {SHOW_NAME}
        </Link>
      </HStack>
      <Heading level={1}>{EPISODE_TITLE}</Heading>
      <HStack gap={1} vAlign="center">
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Episode {EPISODE_NUMBER} · {formatTime(DURATION_SEC)} ·
        </Text>
        <Timestamp value={PUBLISHED_AT} format="date" type="supporting" />
      </HStack>
      <HStack gap={3} vAlign="center">
        <HStack gap={1.5} vAlign="center">
          <Avatar name={SPEAKERS.maya.name} size={24} />
          <Text type="supporting" color="secondary">
            {SPEAKERS.maya.name} · {SPEAKERS.maya.role}
          </Text>
        </HStack>
        <HStack gap={1.5} vAlign="center">
          <Avatar name={SPEAKERS.andre.name} size={24} />
          <Text type="supporting" color="secondary">
            {SPEAKERS.andre.name} · {SPEAKERS.andre.role}
          </Text>
        </HStack>
      </HStack>
    </VStack>
  );

  if (isNarrow) {
    return (
      <VStack gap={3}>
        <CoverArt size={96} />
        {titles}
      </VStack>
    );
  }
  return (
    <HStack gap={4} vAlign="center">
      <CoverArt size={120} />
      <StackItem size="fill">{titles}</StackItem>
    </HStack>
  );
}

// ============= TRANSCRIPT =============

/**
 * One synced transcript cue: speaker Avatar initial, name, mm:ss cue time,
 * paragraph text. The cue containing the playhead gets the primary-tinted
 * 'blue' variant plus a Playing badge; clicking any cue seeks to its start.
 */
function TranscriptCueCard({
  cue,
  isActive,
  onSeek,
}: {
  cue: TranscriptCue;
  isActive: boolean;
  onSeek: (sec: number) => void;
}) {
  const speaker = SPEAKERS[cue.speaker];
  return (
    <ClickableCard
      label={\`Jump to \${formatTime(cue.startSec)} — \${speaker.name}\`}
      onClick={() => onSeek(cue.startSec)}
      padding={3}
      variant={isActive ? 'blue' : 'default'}>
      <HStack gap={3} vAlign="start">
        <Avatar name={speaker.name} size={32} />
        <StackItem size="fill" style={styles.cueBody}>
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <Text type="label" weight="semibold">
                {speaker.name}
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {formatTime(cue.startSec)}
              </Text>
              {isActive && <Badge label="Playing" variant="blue" />}
            </HStack>
            <Text type="body">{cue.text}</Text>
          </VStack>
        </StackItem>
      </HStack>
    </ClickableCard>
  );
}

// ============= CHAPTERS / NOTES PANEL =============

function ChapterList({
  positionSec,
  activeChapterIndex,
  onSeek,
}: {
  positionSec: number;
  activeChapterIndex: number;
  onSeek: (sec: number) => void;
}) {
  return (
    <List density="compact">
      {CHAPTERS.map((chapter, index) => {
        const progress = chapterProgress(index, positionSec);
        const isActive = index === activeChapterIndex;
        return (
          <ListItem
            key={chapter.id}
            label={chapter.title}
            description={
              <div
                role="progressbar"
                aria-label={\`\${chapter.title} progress\`}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                style={styles.chapterTrack}>
                <div
                  style={{
                    ...styles.chapterFill,
                    width: \`\${progress}%\`,
                    backgroundColor: isActive
                      ? 'var(--color-icon-blue)'
                      : 'var(--color-track)',
                  }}
                />
              </div>
            }
            startContent={
              <div style={styles.chapterTime}>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {formatTime(chapter.startSec)}
                </Text>
              </div>
            }
            endContent={
              isActive ? (
                <Badge label="Now" variant="blue" />
              ) : progress === 100 ? (
                <Icon
                  icon={CheckIcon}
                  size="sm"
                  color="success"
                  aria-label="Played"
                />
              ) : undefined
            }
            onClick={() => onSeek(chapter.startSec)}
            isSelected={isActive}
            style={isActive ? styles.chapterRowActive : undefined}
          />
        );
      })}
    </List>
  );
}

function EpisodePanel({
  positionSec,
  activeChapterIndex,
  onSeek,
}: {
  positionSec: number;
  activeChapterIndex: number;
  onSeek: (sec: number) => void;
}) {
  const [tab, setTab] = useState<'chapters' | 'notes'>('chapters');
  return (
    <VStack gap={3}>
      <TabList
        value={tab}
        onChange={value => setTab(value as 'chapters' | 'notes')}
        size="sm"
        layout="fill"
        hasDivider>
        <Tab value="chapters" label="Chapters" />
        <Tab value="notes" label="Show notes" />
      </TabList>
      {tab === 'chapters' ? (
        <VStack gap={2}>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {CHAPTERS.length} chapters · {formatTime(DURATION_SEC)} total
          </Text>
          <ChapterList
            positionSec={positionSec}
            activeChapterIndex={activeChapterIndex}
            onSeek={onSeek}
          />
        </VStack>
      ) : (
        <Markdown density="compact" headingLevelStart={3}>
          {SHOW_NOTES}
        </Markdown>
      )}
    </VStack>
  );
}

// ============= PLAYER BAR =============

function TransportControls({
  isPlaying,
  atEnd,
  isNarrow,
  onSkip,
  onPlayToggle,
}: {
  isPlaying: boolean;
  atEnd: boolean;
  isNarrow: boolean;
  onSkip: (deltaSec: number) => void;
  onPlayToggle: () => void;
}) {
  // <=768px the three controls take the 40px tap-target override so the
  // whole transport clears the touch guideline (sm=28px, md=32px chrome).
  const touchStyle = isNarrow ? styles.barControlTouch : undefined;
  return (
    <HStack gap={1} vAlign="center">
      <IconButton
        label="Back 15 seconds"
        tooltip="Back 15 seconds"
        icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={touchStyle}
        onClick={() => onSkip(-15)}
      />
      <IconButton
        label={isPlaying ? 'Pause' : atEnd ? 'Play from start' : 'Play'}
        tooltip={isPlaying ? 'Pause' : atEnd ? 'Play from start' : 'Play'}
        icon={
          <Icon
            icon={isPlaying ? PauseIcon : PlayIcon}
            size="sm"
            color="inherit"
          />
        }
        variant="primary"
        size="md"
        style={touchStyle}
        onClick={onPlayToggle}
      />
      <IconButton
        label="Forward 30 seconds"
        tooltip="Forward 30 seconds"
        icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={touchStyle}
        onClick={() => onSkip(30)}
      />
    </HStack>
  );
}

function ScrubRow({
  positionSec,
  onScrub,
}: {
  positionSec: number;
  onScrub: (sec: number) => void;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {formatTime(positionSec)}
      </Text>
      <StackItem size="fill" style={styles.barSlider}>
        <Slider
          label="Seek"
          isLabelHidden
          min={0}
          max={DURATION_SEC}
          step={1}
          value={positionSec}
          onChange={onScrub}
          formatValue={formatTime}
          width="100%"
        />
      </StackItem>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {formatTime(DURATION_SEC)}
      </Text>
    </HStack>
  );
}

// ============= PAGE =============

export default function PodcastEpisodePlayerTemplate() {
  // Playback is UI state only: the playhead ticks 1s/second while
  // "playing" and every synced surface (cue highlight, chapter rows,
  // scrub Slider, elapsed readout) derives from positionSec.
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(INITIAL_POSITION_SEC);
  const [speed, setSpeed] = useState('1.25');
  const [isMuted, setIsMuted] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Responsive contract: panel hides at <=1024px; player bar stacks at
  // <=768px with the scrub Slider full-width beneath the transport.
  const isPanelHidden = useMediaQuery('(max-width: 1024px)');
  const isNarrow = useMediaQuery('(max-width: 768px)');

  const activeCueIndex = lastIndexAtOrBefore(CUE_STARTS, positionSec);
  const activeChapterIndex = Math.max(
    0,
    lastIndexAtOrBefore(CHAPTER_STARTS, positionSec),
  );
  const activeChapter = CHAPTERS[activeChapterIndex];
  const atEnd = positionSec >= DURATION_SEC;

  const cueRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Tick the playhead while playing; pause automatically at the end.
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
    if (atEnd) {
      setIsPlaying(false);
    }
  }, [atEnd]);

  // Auto-scroll keeps the highlighted cue in view as the playhead moves.
  // Skip the initial mount run: scrollIntoView also scrolls the document,
  // which would yank a freshly-loaded page away from the top. Tracking the
  // previous deps key (rather than a "mounted" flag) keeps this idempotent
  // under StrictMode's double effect invocation.
  const prevAutoScrollKey = useRef<string | null>(null);
  useEffect(() => {
    const key = \`\${autoScroll}:\${activeCueIndex}\`;
    if (prevAutoScrollKey.current === null || prevAutoScrollKey.current === key) {
      prevAutoScrollKey.current = key;
      return;
    }
    prevAutoScrollKey.current = key;
    if (!autoScroll || activeCueIndex < 0) {
      return;
    }
    const node = cueRefs.current[CUES[activeCueIndex].id];
    node?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }, [autoScroll, activeCueIndex]);

  const seekTo = (sec: number) => {
    setPositionSec(Math.max(0, Math.min(DURATION_SEC, sec)));
  };
  const skipBy = (deltaSec: number) => seekTo(positionSec + deltaSec);
  // Play/Pause flip; pressing Play at the episode end restarts from 00:00.
  const togglePlay = () => {
    if (!isPlaying && atEnd) {
      setPositionSec(0);
    }
    setIsPlaying(prev => !prev);
  };

  const barTitleCluster = (
    <Tooltip content={\`\${EPISODE_TITLE} — \${SHOW_NAME}\`}>
      <HStack
        gap={2}
        vAlign="center"
        style={isNarrow ? styles.barTitleNarrow : styles.barTitle}>
        <CoverArt size={44} />
        <VStack gap={0} style={styles.cueBody}>
          <Text type="label" weight="semibold" maxLines={1}>
            {EPISODE_TITLE}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {SHOW_NAME} · Ep. {EPISODE_NUMBER}
          </Text>
        </VStack>
      </HStack>
    </Tooltip>
  );

  const muteButton = (
    <IconButton
      label={isMuted ? 'Unmute' : 'Mute'}
      tooltip={isMuted ? 'Unmute' : 'Mute'}
      icon={
        <Icon
          icon={isMuted ? VolumeXIcon : Volume2Icon}
          size="sm"
          color="inherit"
        />
      }
      variant="ghost"
      size="sm"
      style={isNarrow ? styles.barControlTouch : undefined}
      onClick={() => setIsMuted(prev => !prev)}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <Breadcrumbs>
                <BreadcrumbItem href="#podcasts">Podcasts</BreadcrumbItem>
                <BreadcrumbItem href="#signal-path">{SHOW_NAME}</BreadcrumbItem>
                <BreadcrumbItem isCurrent>
                  Episode {EPISODE_NUMBER}
                </BreadcrumbItem>
              </Breadcrumbs>
            </StackItem>
            {!isNarrow && (
              <Badge
                label={isPlaying ? \`Playing · \${speed}x\` : 'Paused'}
                variant={isPlaying ? 'blue' : 'neutral'}
              />
            )}
            <Button
              label={isFollowing ? 'Following' : 'Follow'}
              variant={isFollowing ? 'secondary' : 'primary'}
              size="sm"
              icon={
                <Icon
                  icon={isFollowing ? CheckIcon : PlusIcon}
                  size="sm"
                  color="inherit"
                />
              }
              onClick={() => setIsFollowing(prev => !prev)}
            />
          </HStack>
        </LayoutHeader>
      }
      end={
        isPanelHidden ? undefined : (
          <LayoutPanel width={320} label="Chapters and show notes">
            <EpisodePanel
              positionSec={positionSec}
              activeChapterIndex={activeChapterIndex}
              onSeek={seekTo}
            />
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={5}>
              <EpisodeHero isNarrow={isNarrow} />
              <Divider />
              <VStack gap={3}>
                <HStack gap={3} vAlign="center">
                  <StackItem size="fill">
                    <HStack gap={2} vAlign="center">
                      <Heading level={2}>Transcript</Heading>
                      <Text
                        type="supporting"
                        color="secondary"
                        hasTabularNumbers>
                        Excerpt · {TRANSCRIPT_WINDOW}
                      </Text>
                    </HStack>
                  </StackItem>
                  <Switch
                    label="Auto-scroll"
                    value={autoScroll}
                    onChange={setAutoScroll}
                    labelPosition="start"
                  />
                </HStack>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  Now in “{activeChapter.title}” · playhead{' '}
                  {formatTime(positionSec)} — click any cue to jump the
                  player there.
                </Text>
                <VStack gap={2}>
                  {CUES.map((cue, index) => (
                    <div
                      key={cue.id}
                      ref={node => {
                        cueRefs.current[cue.id] = node;
                      }}>
                      <TranscriptCueCard
                        cue={cue}
                        isActive={index === activeCueIndex}
                        onSeek={seekTo}
                      />
                    </div>
                  ))}
                </VStack>
              </VStack>
            </VStack>
          </div>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider height={isNarrow ? undefined : 80}>
          {isNarrow ? (
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill" style={styles.cueBody}>
                  {barTitleCluster}
                </StackItem>
                <TransportControls
                  isPlaying={isPlaying}
                  atEnd={atEnd}
                  isNarrow
                  onSkip={skipBy}
                  onPlayToggle={togglePlay}
                />
                {muteButton}
              </HStack>
              <ScrubRow positionSec={positionSec} onScrub={seekTo} />
            </VStack>
          ) : (
            <HStack gap={3} vAlign="center">
              {barTitleCluster}
              <TransportControls
                isPlaying={isPlaying}
                atEnd={atEnd}
                isNarrow={false}
                onSkip={skipBy}
                onPlayToggle={togglePlay}
              />
              <StackItem size="fill" style={styles.barSlider}>
                <ScrubRow positionSec={positionSec} onScrub={seekTo} />
              </StackItem>
              <SegmentedControl
                value={speed}
                onChange={setSpeed}
                label="Playback speed"
                size="sm">
                {SPEED_OPTIONS.map(option => (
                  <SegmentedControlItem
                    key={option.value}
                    value={option.value}
                    label={option.label}
                  />
                ))}
              </SegmentedControl>
              {muteButton}
            </HStack>
          )}
        </LayoutFooter>
      }
    />
  );
}
`;export{e as default};