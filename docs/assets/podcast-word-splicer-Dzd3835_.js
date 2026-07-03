var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one two-speaker interview — 'Ship It
 *   Weekly' episode 42 'The Rewrite That Wasn't', 4:22 long, host Priya
 *   Raman and guest Marcus Webb across 8 authored speaker turns; per-word
 *   start/end times derive at module scope from each turn's fixed time span
 *   weighted by word length, 14 bracket-marked filler groups ('um', 'like',
 *   'you know'), 5 chapter anchors keyed to turn starts, and one authored
 *   24-value waveform peak texture per speaker — no clocks, no randomness,
 *   no network assets)
 * @output Transcript-linked podcast splicer: a Descript-style text-first
 *   audio editor. The transcript pane renders every word as a timed span —
 *   drag-selecting words (pointer capture) highlights the exact matching
 *   span in the two-speaker waveform strip docked in the footer, and Cut
 *   strikes the words through while their waveform bars ripple-close via a
 *   flex-grow collapse, visibly shortening the runtime readout in the
 *   header. Every cut lands in an edit rail with tap-to-restore and a
 *   restore-all sweep; detected fillers carry dashed underlines and a
 *   'Remove all 14 fillers' action cascades the strikes with staggered
 *   transition delays so the batch reads as choreography. A play/step
 *   transport walks the playhead word-by-word with a karaoke highlight
 *   (edited-out spans are skipped seamlessly; step jumps sentence to
 *   sentence; a scrub Slider maps to kept words only), and a chapter rail
 *   re-derives every chapter timestamp live from the edit list — proof
 *   that all times are computed, never stored. Keyboard drives the same
 *   commit logic: arrows move the word cursor, Shift+arrows extend the
 *   selection, X cuts, Enter seeks, Escape clears.
 * @position Page template; emitted by \`astryx template podcast-word-splicer\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the session strip
 * (scissors mark, episode title + show line, live runtime cluster — edited
 * runtime, struck original, −removed Badge, cut count). LayoutContent
 * scrolls a centered 760px transcript column under a sticky selection
 * toolbar (selection summary + Cut / Clear, or the remove-fillers sweep
 * and Kbd hints when nothing is selected) and an aria-live action note.
 * LayoutPanel end 300 hosts the Edits | Chapters TabList (edit rail with
 * per-cut restore, chapter rows with re-derived timestamps). LayoutFooter
 * docks the shared-time-axis waveform strip above the transport (sentence
 * step back / play / sentence step forward, elapsed/total readouts, kept-
 * word scrub Slider). Choose over podcast-episode-player when the
 * transcript is an editing surface (select/cut/restore), not synced
 * listening; choose over transcript-annotator when words carry time and
 * the artifact is a spliced timeline, not labels.
 *
 * Responsive contract:
 * - >1024px: header | toolbar + transcript column (760 cap, centered) +
 *   rail panel 300 | footer (72px waveform strip + transport row).
 * - <=1024px: the end panel drops out and the same Edits | Chapters
 *   content renders below the transcript as a full-width Card in the same
 *   scroll region.
 * - <=640px: the waveform docks as a collapsible strip behind a chevron
 *   toggle (transport row stays), transport and toolbar controls grow to
 *   40px tap targets, Kbd hints hide, and the toolbar gains enlarged
 *   selection-handle buttons (extend start left / extend end right) so
 *   touch users can grow a selection word-by-word without dragging —
 *   nothing is hover-only, and tap-a-word + handles is a full parity path
 *   for the drag gesture. The transcript keeps touch-action pan-y so
 *   vertical scrolling never fights the select gesture.
 * - Runtime, elapsed, and chapter readouts keep tabular numbers so
 *   nothing jitters as cuts re-derive the timeline.
 *
 * Container policy (splice-editor archetype): frame-first chrome; the
 * transcript is hand-rolled timed word spans inside speaker-tinted turn
 * blocks (the surface needs word-level hit testing and per-word transition
 * delays no Card gives), the waveform is a flex row of per-word bars so a
 * cut's ripple-close is literally the layout re-flowing, and Astryx Cards
 * are reserved for the stacked rail on narrow screens. Edit rail and
 * chapter rail are dense List rows.
 *
 * Fixture policy: fixed data only. No <audio>, no network media — playback
 * is a word-index playhead advanced by a fixed-cadence timeout while
 * "playing"; every surface (karaoke highlight, waveform playhead, elapsed
 * readout, chapter states) is a pure function of that index plus the edit
 * list.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token or a
 * color-mix() over tokens — speaker tints ride the categorical data
 * tokens, strike scrims mix --color-icon-red over transparent, filler
 * underlines use --color-icon-orange, and the selection/karaoke washes mix
 * --color-icon-blue — so every pair survives the dark scheme. Motion:
 * strike fades, ripple-closes, and the filler cascade are CSS transitions
 * with per-word delays; prefers-reduced-motion zeroes every duration and
 * delay so edits land instantly.
 */

import {useEffect, useMemo, useRef, useState, type CSSProperties} from 'react';

import {
  AudioLinesIcon,
  BookmarkIcon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronUpIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  ScissorsIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SparklesIcon,
  Undo2Icon,
  XIcon,
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
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {List, ListItem} from '@astryxdesign/core/List';
import {Slider} from '@astryxdesign/core/Slider';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= MOTION CONSTANTS =============
// The craft bar: a strike, its waveform ripple-close, and the runtime
// readout shrinking must read as one edit landing.

/** Fixed playback cadence: the playhead advances one kept word per tick. */
const WORD_TICK_MS = 300;
/** Waveform bar flex-grow collapse when its word is cut. */
const COLLAPSE_MS = 420;
/** Strike fade on the word span itself. */
const STRIKE_MS = 260;
/** Extra delay per filler group in the remove-all cascade. */
const FILLER_STAGGER_MS = 90;
/** Extra delay per word inside one cut, left to right. */
const WORD_STAGGER_MS = 30;
/** Settle ease shared by the collapse and the strike fade. */
const SETTLE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Centered editing column; full-width below the 760px cap.
  column: {
    width: '100%',
    maxWidth: 760,
    marginInline: 'auto',
    minWidth: 0,
  },
  headerTitle: {minWidth: 0},
  strikeOriginal: {textDecoration: 'line-through'},
  // Sticky selection toolbar: pinned over the transcript scroll so Cut is
  // always reachable mid-document.
  toolbar: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    backgroundColor: 'var(--color-background)',
    paddingBlock: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  toolbarSummary: {minWidth: 0},
  // Transcript surface: selection is app-managed, so native text selection
  // is off; pan-y keeps vertical scroll working through the drag gesture.
  transcript: {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'pan-y',
    cursor: 'text',
  },
  // Speaker turn block: tinted left rule carries the speaker identity.
  segment: {
    borderLeft: '3px solid',
    paddingLeft: 'var(--spacing-3)',
  },
  segmentWords: {lineHeight: 1.9, fontSize: 'var(--font-size-body, 15px)'},
  // One timed word. inline-block so the highlight box hugs the word and a
  // word never wraps mid-glyph; transitions carry the strike/selection.
  word: {
    display: 'inline-block',
    marginInlineEnd: '0.3em',
    paddingInline: 2,
    borderRadius: 'var(--radius-element)',
    transitionProperty: 'background-color, color, opacity, text-decoration-color',
    transitionDuration: \`\${STRIKE_MS}ms\`,
    transitionTimingFunction: SETTLE_EASE,
  },
  // Detected filler: dashed underline in the warning family.
  wordFiller: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: 'var(--color-icon-orange)',
    textUnderlineOffset: 3,
  },
  // Drag/keyboard selection wash — mirrored 1:1 on the waveform bars.
  wordSelected: {
    backgroundColor: 'color-mix(in srgb, var(--color-icon-blue) 24%, transparent)',
  },
  // Cut word: struck through over a red scrim, dimmed but still legible so
  // the edit reads as reversible.
  wordCut: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    textDecorationColor: 'var(--color-text-red)',
    backgroundColor: 'color-mix(in srgb, var(--color-icon-red) 14%, transparent)',
    color: 'var(--color-text-secondary)',
    opacity: 0.55,
  },
  // Karaoke highlight on the current playhead word.
  wordCurrent: {
    backgroundColor: 'color-mix(in srgb, var(--color-icon-blue) 34%, transparent)',
    boxShadow: '0 0 0 2px color-mix(in srgb, var(--color-icon-blue) 40%, transparent)',
  },
  // Waveform strip: per-word bars flex by duration, so cutting a word
  // ripple-closes the layout itself. Seek a11y lives on the scrub Slider;
  // the strip is a pointer bonus.
  waveStrip: {
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch',
    height: 72,
    width: '100%',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  waveStripCompact: {height: 56},
  waveCell: {
    position: 'relative',
    flexBasis: 0,
    minWidth: 0,
    transitionProperty: 'flex-grow',
    transitionDuration: \`\${COLLAPSE_MS}ms\`,
    transitionTimingFunction: SETTLE_EASE,
  },
  waveBar: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    borderRadius: 1,
  },
  waveCenterline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'var(--color-border)',
    pointerEvents: 'none',
  },
  wavePlayhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'var(--color-accent)',
    pointerEvents: 'none',
    transitionProperty: 'left',
    transitionDuration: '200ms',
    transitionTimingFunction: 'linear',
  },
  speakerDot: {
    width: 8,
    height: 8,
    borderRadius: 'var(--radius-full)',
    flexShrink: 0,
  },
  timeGutter: {width: 44, textAlign: 'right'},
  // <=640px: transport / toolbar controls grow to 40px tap targets.
  controlTouch: {width: 40, height: 40},
  railScroll: {minHeight: 0},
  noteRow: {minHeight: 20},
};

// ============= DATA =============
// Deterministic fixtures: authored speaker turns with fixed time spans.
// Bracketed runs ([um], [like], [you know]) mark filler groups; brackets
// are stripped for display and parsed into groups at module scope.

type SpeakerId = 'priya' | 'marcus';

const SHOW_NAME = 'Ship It Weekly';
const EPISODE_NUMBER = 42;
const EPISODE_TITLE = "The Rewrite That Wasn't";

const SPEAKER_META: Record<
  SpeakerId,
  {name: string; role: string; textColor: string; barColor: string; dotColor: string}
> = {
  priya: {
    name: 'Priya Raman',
    role: 'Host',
    textColor: 'var(--color-text-blue)',
    barColor: 'var(--color-data-categorical-blue)',
    dotColor: 'var(--color-icon-blue)',
  },
  marcus: {
    name: 'Marcus Webb',
    role: 'Guest',
    textColor: 'var(--color-text-purple)',
    barColor: 'var(--color-data-categorical-purple)',
    dotColor: 'var(--color-icon-purple)',
  },
};

interface SegmentFixture {
  id: string;
  speaker: SpeakerId;
  startSec: number;
  endSec: number;
  text: string;
}

const SEGMENTS: SegmentFixture[] = [
  {
    id: 'seg-1',
    speaker: 'priya',
    startSec: 0,
    endSec: 24,
    text:
      "Welcome back to Ship It Weekly. I'm Priya Raman, and today we are " +
      'talking about the rewrite that never shipped. My guest is Marcus ' +
      'Webb, who spent [um] eleven months leading the migration before ' +
      'pulling the plug on it himself. Marcus, thanks for being here.',
  },
  {
    id: 'seg-2',
    speaker: 'marcus',
    startSec: 24,
    endSec: 58,
    text:
      'Thanks for having me. So [um] the short version is that we set out ' +
      'to replace a ten-year-old billing engine, and [like] fourteen ' +
      'months later the old system was still processing every single ' +
      'invoice. The new one never took a dollar of real traffic. ' +
      '[You know], that still stings to say out loud.',
  },
  {
    id: 'seg-3',
    speaker: 'priya',
    startSec: 58,
    endSec: 86,
    text:
      "Let's rewind to the kickoff. What was the pitch that got eleven " +
      'engineers pulled off roadmap work for over a year? Because somebody ' +
      'signed off on this, and I suspect the deck looked [um] very ' +
      'convincing.',
  },
  {
    id: 'seg-4',
    speaker: 'marcus',
    startSec: 86,
    endSec: 128,
    text:
      'The deck was gorgeous, and that was the problem. We had a slide ' +
      "showing the old engine's defect rate climbing, and a projection " +
      'where the new service flattened it in two quarters. What the slide ' +
      'left out was that [um] nobody had measured how much of that defect ' +
      'rate came from the data, not the code. [Like] sixty percent of our ' +
      'incidents traced back to malformed upstream records, and a rewrite ' +
      'does nothing for those. Absolutely nothing.',
  },
  {
    id: 'seg-5',
    speaker: 'priya',
    startSec: 128,
    endSec: 150,
    text:
      'So the strangler pattern, the incremental route. Did anyone argue ' +
      'for carving the engine apart piece by piece instead of the big ' +
      "bang? That's [you know] the textbook answer.",
  },
  {
    id: 'seg-6',
    speaker: 'marcus',
    startSec: 150,
    endSec: 196,
    text:
      'One engineer did, loudly, and I overruled her. That is the single ' +
      'decision I would take back. She proposed routing just the ' +
      'invoice-preview path through a new service first. Read-only, zero ' +
      'risk to money movement. I said it would slow us down. [Um], it ' +
      'would have shipped something real in six weeks. Instead we spent ' +
      'six months building a parallel universe that had to match the old ' +
      'system bug for bug, because [like] every quirk had a customer ' +
      'depending on it somewhere.',
  },
  {
    id: 'seg-7',
    speaker: 'priya',
    startSec: 196,
    endSec: 224,
    text:
      'Bug-for-bug compatibility is the part that kills these projects, ' +
      'right? You are not rebuilding the spec, you are rebuilding [um] a ' +
      'decade of undocumented behavior that nobody fully remembers, and ' +
      'every gap you find is [like] a meeting.',
  },
  {
    id: 'seg-8',
    speaker: 'marcus',
    startSec: 224,
    endSec: 262,
    text:
      'Every gap was a meeting, and some gaps were [you know] straight-up ' +
      'archaeology. We found rounding behavior that existed to match a ' +
      "spreadsheet from 2014. The spreadsheet's author had left. Finance " +
      'could not tell us whether it was load-bearing, so we replicated ' +
      'it, [um] wrong as it was. That was the week I started drafting the ' +
      'memo to kill the project, honestly.',
  },
];

const TOTAL_SEC = SEGMENTS[SEGMENTS.length - 1].endSec;

// Chapter anchors point at turns, never at stored timestamps — the rail
// re-derives every displayed time from the edit list.
const CHAPTER_FIXTURES: Array<{id: string; title: string; segIndex: number}> = [
  {id: 'ch-1', title: 'Cold open', segIndex: 0},
  {id: 'ch-2', title: 'Fourteen months, zero invoices', segIndex: 1},
  {id: 'ch-3', title: 'The gorgeous deck', segIndex: 3},
  {id: 'ch-4', title: 'The overruled engineer', segIndex: 5},
  {id: 'ch-5', title: 'Bug-for-bug archaeology', segIndex: 7},
];

// Authored per-speaker waveform peak textures (0–1 amplitude). Each word's
// bar samples its speaker's texture by that speaker's word ordinal, so the
// two lanes read as distinct voices without any randomness.
const PEAK_TEXTURE: Record<SpeakerId, number[]> = {
  priya: [
    0.42, 0.68, 0.55, 0.8, 0.36, 0.62, 0.9, 0.5, 0.74, 0.44, 0.66, 0.58,
    0.84, 0.4, 0.7, 0.52, 0.78, 0.34, 0.6, 0.88, 0.48, 0.72, 0.56, 0.64,
  ],
  marcus: [
    0.5, 0.76, 0.4, 0.66, 0.86, 0.46, 0.7, 0.58, 0.34, 0.8, 0.54, 0.72,
    0.44, 0.9, 0.6, 0.38, 0.68, 0.5, 0.82, 0.42, 0.74, 0.62, 0.36, 0.56,
  ],
};

// ============= MODULE-SCOPE DERIVATIONS =============
// Words, filler groups, sentence starts, chapter anchors, and peaks all
// derive from the fixtures above exactly once — nothing is typed twice.

interface Word {
  id: string;
  index: number;
  segIndex: number;
  speaker: SpeakerId;
  text: string;
  startSec: number;
  durationSec: number;
  fillerGroup: number | null;
  isSentenceStart: boolean;
}

const WORDS: Word[] = (() => {
  const words: Word[] = [];
  let fillerCounter = -1;
  let inFiller = false;
  SEGMENTS.forEach((seg, segIndex) => {
    const tokens = seg.text.split(/\\s+/).filter(Boolean);
    const parsed = tokens.map(token => {
      if (token.startsWith('[') && !inFiller) {
        fillerCounter += 1;
        inFiller = true;
      }
      const group = inFiller ? fillerCounter : null;
      if (token.includes(']')) {
        inFiller = false;
      }
      return {text: token.replace(/[[\\]]/g, ''), group};
    });
    // Word duration = the turn's span, split by word length (+2 floor so
    // short words still get a beat). Deterministic, fixture-driven.
    const totalWeight = parsed.reduce((sum, p) => sum + p.text.length + 2, 0);
    const span = seg.endSec - seg.startSec;
    let cursor = seg.startSec;
    let sentenceStart = true;
    parsed.forEach((p, i) => {
      const durationSec = ((p.text.length + 2) / totalWeight) * span;
      words.push({
        id: \`\${seg.id}-w\${i}\`,
        index: words.length,
        segIndex,
        speaker: seg.speaker,
        text: p.text,
        startSec: cursor,
        durationSec,
        fillerGroup: p.group,
        isSentenceStart: sentenceStart,
      });
      cursor += durationSec;
      sentenceStart = /[.?!]["')”]*$/.test(p.text);
    });
  });
  return words;
})();

/** Words grouped by turn, for rendering. */
const SEGMENT_WORDS: Word[][] = SEGMENTS.map((_, segIndex) =>
  WORDS.filter(word => word.segIndex === segIndex),
);

/** Filler groups as word-index runs; the sweep button count derives here. */
const FILLER_GROUPS: number[][] = (() => {
  const byGroup = new Map<number, number[]>();
  for (const word of WORDS) {
    if (word.fillerGroup != null) {
      const run = byGroup.get(word.fillerGroup) ?? [];
      run.push(word.index);
      byGroup.set(word.fillerGroup, run);
    }
  }
  return [...byGroup.values()];
})();
const FILLER_TOTAL = FILLER_GROUPS.length; // 14 in this fixture

/** Word indices that open a sentence — the step transport's grid. */
const SENTENCE_STARTS: number[] = WORDS.filter(
  word => word.isSentenceStart,
).map(word => word.index);

/** Chapter anchor = first word of the anchored turn. */
const CHAPTERS = CHAPTER_FIXTURES.map(chapter => ({
  ...chapter,
  anchorWord: WORDS.findIndex(word => word.segIndex === chapter.segIndex),
}));

/** Per-word bar amplitude sampled from the speaker's authored texture. */
const WORD_PEAKS: number[] = (() => {
  const ordinals: Record<SpeakerId, number> = {priya: 0, marcus: 0};
  return WORDS.map(word => {
    const texture = PEAK_TEXTURE[word.speaker];
    const peak = texture[ordinals[word.speaker] % texture.length];
    ordinals[word.speaker] += 1;
    return peak;
  });
})();

/** Seconds -> zero-padded mm:ss (e.g. 262 -> "04:22"). */
function formatTime(totalSec: number): string {
  const clamped = Math.max(0, Math.round(totalSec));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return \`\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}\`;
}

function clampIndex(value: number): number {
  return Math.max(0, Math.min(WORDS.length - 1, value));
}

/** Short preview of a word run for edit-rail labels. */
function labelForRun(wordIndices: number[]): string {
  const texts = wordIndices.map(i => WORDS[i].text);
  const head = texts.slice(0, 3).join(' ');
  return texts.length > 3 ? \`“\${head} …”\` : \`“\${head}”\`;
}

const INITIAL_NOTE =
  'Drag across words to select them — the waveform mirrors the span. ' +
  \`\${FILLER_TOTAL} fillers detected (dashed underlines).\`;

// ============= EDIT MODEL =============

interface CutEntry {
  id: number;
  wordIndices: number[];
  kind: 'manual' | 'filler';
  label: string;
  durationSec: number;
  /** Cascade order within a batch; drives the stagger choreography. */
  stagger: number;
}

interface CutMeta {
  /** Per word: owning cut + its transition delay, or null if kept. */
  wordCut: Array<{cutId: number; delayMs: number} | null>;
  /** Cut seconds before each word — edited time = original − prefix. */
  cutBefore: number[];
  totalCutSec: number;
  keptWords: number[];
}

function deriveCutMeta(cuts: CutEntry[]): CutMeta {
  const wordCut: CutMeta['wordCut'] = new Array(WORDS.length).fill(null);
  for (const cut of cuts) {
    cut.wordIndices.forEach((wordIndex, order) => {
      wordCut[wordIndex] = {
        cutId: cut.id,
        delayMs: cut.stagger * FILLER_STAGGER_MS + order * WORD_STAGGER_MS,
      };
    });
  }
  const cutBefore: number[] = new Array(WORDS.length + 1).fill(0);
  for (let i = 0; i < WORDS.length; i++) {
    cutBefore[i + 1] =
      cutBefore[i] + (wordCut[i] != null ? WORDS[i].durationSec : 0);
  }
  return {
    wordCut,
    cutBefore,
    totalCutSec: cutBefore[WORDS.length],
    keptWords: WORDS.filter(word => wordCut[word.index] == null).map(
      word => word.index,
    ),
  };
}

// ============= TRANSCRIPT =============

interface SelectionRange {
  anchor: number;
  focus: number;
}

function normalizeSelection(
  selection: SelectionRange | null,
): [number, number] | null {
  if (selection == null) {
    return null;
  }
  return selection.anchor <= selection.focus
    ? [selection.anchor, selection.focus]
    : [selection.focus, selection.anchor];
}

/**
 * One speaker turn: tinted left rule, Avatar + name + re-derived edited
 * timestamp header, then the timed word spans. All interaction handlers
 * live on the parent transcript container (pointer capture + keyboard).
 */
function TranscriptSegment({
  segIndex,
  editedLabel,
  chapterTitle,
  wordCut,
  selRange,
  currentIndex,
  isReducedMotion,
  currentWordRef,
}: {
  segIndex: number;
  editedLabel: string;
  chapterTitle: string | null;
  wordCut: CutMeta['wordCut'];
  selRange: [number, number] | null;
  currentIndex: number | null;
  isReducedMotion: boolean;
  currentWordRef: (node: HTMLSpanElement | null) => void;
}) {
  const segment = SEGMENTS[segIndex];
  const meta = SPEAKER_META[segment.speaker];
  return (
    <div style={{...styles.segment, borderLeftColor: meta.dotColor}}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Avatar name={meta.name} size={24} />
          <Text
            type="label"
            weight="semibold"
            style={{color: meta.textColor}}>
            {meta.name}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {editedLabel}
          </Text>
          {chapterTitle != null && (
            <Badge label={chapterTitle} variant="neutral" />
          )}
        </HStack>
        <div style={styles.segmentWords}>
          {SEGMENT_WORDS[segIndex].map(word => {
            const cutInfo = wordCut[word.index];
            const isCut = cutInfo != null;
            const isSelected =
              selRange != null &&
              word.index >= selRange[0] &&
              word.index <= selRange[1];
            const isCurrent = word.index === currentIndex;
            return (
              <span
                key={word.id}
                data-widx={word.index}
                ref={isCurrent ? currentWordRef : undefined}
                style={{
                  ...styles.word,
                  ...(word.fillerGroup != null && !isCut
                    ? styles.wordFiller
                    : undefined),
                  ...(isSelected ? styles.wordSelected : undefined),
                  ...(isCut ? styles.wordCut : undefined),
                  ...(isCurrent ? styles.wordCurrent : undefined),
                  ...(isReducedMotion
                    ? {transitionDuration: '0ms', transitionDelay: '0ms'}
                    : {transitionDelay: \`\${cutInfo?.delayMs ?? 0}ms\`}),
                }}>
                {word.text}
              </span>
            );
          })}
        </div>
      </VStack>
    </div>
  );
}

// ============= WAVEFORM =============

/**
 * Two-speaker waveform sharing the transcript's time axis: one flex cell
 * per word (flex-grow = duration), host bars rising above the centerline
 * and guest bars hanging below it. Cutting a word transitions its cell's
 * flex-grow to 0, so the ripple-close is the layout itself collapsing —
 * and the selection wash lands on exactly the words' bars. Pointer seeks
 * map the tap fraction back through the edited timeline; the scrub Slider
 * is the accessible equivalent.
 */
function WaveformStrip({
  wordCut,
  selRange,
  currentIndex,
  playheadPct,
  isCompact,
  isReducedMotion,
  onSeekFraction,
}: {
  wordCut: CutMeta['wordCut'];
  selRange: [number, number] | null;
  currentIndex: number | null;
  playheadPct: number;
  isCompact: boolean;
  isReducedMotion: boolean;
  onSeekFraction: (fraction: number) => void;
}) {
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width > 0) {
      onSeekFraction((event.clientX - rect.left) / rect.width);
    }
  };

  return (
    <div
      aria-hidden
      style={{
        ...styles.waveStrip,
        ...(isCompact ? styles.waveStripCompact : undefined),
      }}
      onPointerDown={handlePointerDown}>
      {WORDS.map(word => {
        const cutInfo = wordCut[word.index];
        const isCut = cutInfo != null;
        const isSelected =
          selRange != null &&
          word.index >= selRange[0] &&
          word.index <= selRange[1];
        const isCurrent = word.index === currentIndex;
        const meta = SPEAKER_META[word.speaker];
        const barColor = isCurrent
          ? 'var(--color-accent)'
          : isSelected
            ? 'color-mix(in srgb, var(--color-accent) 75%, var(--color-icon-blue))'
            : isCut
              ? 'color-mix(in srgb, var(--color-icon-red) 55%, transparent)'
              : meta.barColor;
        const height = \`\${Math.round(WORD_PEAKS[word.index] * 46)}%\`;
        return (
          <div
            key={word.id}
            style={{
              ...styles.waveCell,
              flexGrow: isCut ? 0 : word.durationSec,
              ...(isReducedMotion
                ? {transitionDuration: '0ms', transitionDelay: '0ms'}
                : {transitionDelay: \`\${cutInfo?.delayMs ?? 0}ms\`}),
              ...(isSelected
                ? {
                    backgroundColor:
                      'color-mix(in srgb, var(--color-icon-blue) 16%, transparent)',
                  }
                : undefined),
            }}>
            <div
              style={{
                ...styles.waveBar,
                backgroundColor: barColor,
                ...(word.speaker === 'priya'
                  ? {bottom: '50%', height}
                  : {top: '50%', height}),
              }}
            />
          </div>
        );
      })}
      <div style={styles.waveCenterline} />
      <div
        style={{
          ...styles.wavePlayhead,
          left: \`\${playheadPct}%\`,
          ...(isReducedMotion ? {transitionDuration: '0ms'} : undefined),
        }}
      />
    </div>
  );
}

// ============= RAILS (EDITS | CHAPTERS) =============

function EditRail({
  cuts,
  totalCutSec,
  onRestore,
  onRestoreAll,
}: {
  cuts: CutEntry[];
  totalCutSec: number;
  onRestore: (cutId: number) => void;
  onRestoreAll: () => void;
}) {
  if (cuts.length === 0) {
    return (
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          No cuts yet. Select words and hit Cut — every edit lands here
          with one-tap restore, and all timestamps re-derive from this
          list.
        </Text>
      </VStack>
    );
  }
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {cuts.length} {cuts.length === 1 ? 'cut' : 'cuts'} · −
            {formatTime(totalCutSec)} removed
          </Text>
        </StackItem>
        <Button
          label="Restore all"
          variant="ghost"
          size="sm"
          icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
          onClick={onRestoreAll}
        />
      </HStack>
      <List density="compact">
        {[...cuts].reverse().map(cut => (
          <ListItem
            key={cut.id}
            label={cut.label}
            description={\`\${cut.wordIndices.length} \${
              cut.wordIndices.length === 1 ? 'word' : 'words'
            } · −\${cut.durationSec.toFixed(1)}s\`}
            startContent={
              <Badge
                label={cut.kind === 'filler' ? 'filler' : 'cut'}
                variant={cut.kind === 'filler' ? 'warning' : 'info'}
              />
            }
            endContent={
              <IconButton
                label={\`Restore \${cut.label}\`}
                tooltip="Restore"
                icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => onRestore(cut.id)}
              />
            }
          />
        ))}
      </List>
    </VStack>
  );
}

function ChapterRail({
  editedStartOf,
  editedTotal,
  firstKeptAtOrAfter,
  activeChapterIndex,
  onSeek,
}: {
  editedStartOf: (wordIndex: number) => number;
  editedTotal: number;
  firstKeptAtOrAfter: (wordIndex: number) => number | null;
  activeChapterIndex: number;
  onSeek: (wordIndex: number) => void;
}) {
  return (
    <VStack gap={2}>
      <Text type="supporting" color="secondary">
        Chapter times are computed from the edit list on every render —
        cut anything and watch them shrink.
      </Text>
      <List density="compact">
        {CHAPTERS.map((chapter, index) => {
          const keptAnchor = firstKeptAtOrAfter(chapter.anchorWord);
          const editedSec =
            keptAnchor == null ? editedTotal : editedStartOf(keptAnchor);
          const originalSec = WORDS[chapter.anchorWord].startSec;
          const isShifted = Math.abs(editedSec - originalSec) > 0.05;
          return (
            <ListItem
              key={chapter.id}
              label={chapter.title}
              description={
                isShifted ? \`was \${formatTime(originalSec)}\` : 'unchanged'
              }
              startContent={
                <div style={styles.timeGutter}>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {formatTime(editedSec)}
                  </Text>
                </div>
              }
              endContent={
                index === activeChapterIndex ? (
                  <Badge label="Now" variant="blue" />
                ) : undefined
              }
              isSelected={index === activeChapterIndex}
              onClick={() =>
                keptAnchor != null ? onSeek(keptAnchor) : undefined
              }
            />
          );
        })}
      </List>
    </VStack>
  );
}

function RailTabs({
  tab,
  onTabChange,
  cuts,
  totalCutSec,
  onRestore,
  onRestoreAll,
  editedStartOf,
  editedTotal,
  firstKeptAtOrAfter,
  activeChapterIndex,
  onSeek,
}: {
  tab: 'edits' | 'chapters';
  onTabChange: (tab: 'edits' | 'chapters') => void;
  cuts: CutEntry[];
  totalCutSec: number;
  onRestore: (cutId: number) => void;
  onRestoreAll: () => void;
  editedStartOf: (wordIndex: number) => number;
  editedTotal: number;
  firstKeptAtOrAfter: (wordIndex: number) => number | null;
  activeChapterIndex: number;
  onSeek: (wordIndex: number) => void;
}) {
  return (
    <VStack gap={3} style={styles.railScroll}>
      <TabList
        value={tab}
        onChange={value => onTabChange(value as 'edits' | 'chapters')}
        size="sm"
        layout="fill"
        hasDivider>
        <Tab value="edits" label={\`Edits (\${cuts.length})\`} />
        <Tab value="chapters" label="Chapters" />
      </TabList>
      {tab === 'edits' ? (
        <EditRail
          cuts={cuts}
          totalCutSec={totalCutSec}
          onRestore={onRestore}
          onRestoreAll={onRestoreAll}
        />
      ) : (
        <ChapterRail
          editedStartOf={editedStartOf}
          editedTotal={editedTotal}
          firstKeptAtOrAfter={firstKeptAtOrAfter}
          activeChapterIndex={activeChapterIndex}
          onSeek={onSeek}
        />
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function PodcastWordSplicerTemplate() {
  // The whole editor is (cuts, selection, playWord, isPlaying): every
  // timestamp, chapter mark, waveform width, and readout derives from the
  // edit list — nothing temporal is stored.
  const [cuts, setCuts] = useState<CutEntry[]>([]);
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [playWord, setPlayWord] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [railTab, setRailTab] = useState<'edits' | 'chapters'>('edits');
  const [isWaveOpen, setIsWaveOpen] = useState(true);
  const [actionNote, setActionNote] = useState(INITIAL_NOTE);

  const cutSeqRef = useRef(1);
  const dragPointerRef = useRef<number | null>(null);
  const currentWordNodeRef = useRef<HTMLSpanElement | null>(null);

  // Responsive contract: rail panel drops <=1024px (stacks below the
  // transcript); <=640px the waveform collapses behind a toggle and
  // controls grow to 40px tap targets with selection-handle buttons.
  const isStacked = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  // Reduced motion: strikes, ripple-closes, and cascades land instantly.
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ----- Everything temporal derives from the edit list -----
  const cutMeta = useMemo(() => deriveCutMeta(cuts), [cuts]);
  const {wordCut, cutBefore, totalCutSec, keptWords} = cutMeta;

  const editedTotal = TOTAL_SEC - totalCutSec;
  const editedStartOf = (wordIndex: number) =>
    WORDS[wordIndex].startSec - cutBefore[wordIndex];
  const firstKeptAtOrAfter = (wordIndex: number): number | null =>
    keptWords.find(i => i >= wordIndex) ?? null;

  // Effective playhead: the parked word, or the next kept word if an edit
  // just removed it — so cuts are skipped seamlessly, even mid-playback.
  const effectivePlay = useMemo(() => {
    if (keptWords.length === 0) {
      return null;
    }
    return (
      keptWords.find(i => i >= playWord) ?? keptWords[keptWords.length - 1]
    );
  }, [keptWords, playWord]);

  const elapsedSec = effectivePlay == null ? 0 : editedStartOf(effectivePlay);
  const playheadPct =
    effectivePlay == null || editedTotal <= 0
      ? 0
      : Math.min(
          100,
          ((editedStartOf(effectivePlay) +
            WORDS[effectivePlay].durationSec / 2) /
            editedTotal) *
            100,
        );

  const keptOrdinal =
    effectivePlay == null ? 0 : Math.max(0, keptWords.indexOf(effectivePlay));

  const activeChapterIndex = useMemo(() => {
    if (effectivePlay == null) {
      return 0;
    }
    let active = 0;
    CHAPTERS.forEach((chapter, index) => {
      if (chapter.anchorWord <= effectivePlay) {
        active = index;
      }
    });
    return active;
  }, [effectivePlay]);

  const selRange = normalizeSelection(selection);
  const selectedKept = useMemo(() => {
    if (selRange == null) {
      return [];
    }
    const kept: number[] = [];
    for (let i = selRange[0]; i <= selRange[1]; i++) {
      if (wordCut[i] == null) {
        kept.push(i);
      }
    }
    return kept;
  }, [selRange, wordCut]);
  const selectedDurationSec = selectedKept.reduce(
    (sum, i) => sum + WORDS[i].durationSec,
    0,
  );

  const remainingFillerGroups = useMemo(
    () =>
      FILLER_GROUPS.filter(group => group.some(i => wordCut[i] == null))
        .length,
    [wordCut],
  );

  // ----- Playback: fixed cadence, one kept word per tick -----
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    if (effectivePlay == null) {
      setIsPlaying(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      const position = keptWords.indexOf(effectivePlay);
      if (position < 0 || position + 1 >= keptWords.length) {
        setIsPlaying(false);
        return;
      }
      setPlayWord(keptWords[position + 1]);
    }, WORD_TICK_MS);
    return () => clearTimeout(timer);
  }, [isPlaying, effectivePlay, keptWords]);

  // Keep the karaoke word in view while playing.
  useEffect(() => {
    if (isPlaying) {
      currentWordNodeRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: isReducedMotion ? 'auto' : 'smooth',
      });
    }
  }, [isPlaying, effectivePlay, isReducedMotion]);

  // ----- Shared commit path (drag release, toolbar button, X key) -----
  const buildCut = (
    wordIndices: number[],
    kind: CutEntry['kind'],
    stagger: number,
  ): CutEntry => ({
    id: cutSeqRef.current++,
    wordIndices,
    kind,
    label: labelForRun(wordIndices),
    durationSec: wordIndices.reduce(
      (sum, i) => sum + WORDS[i].durationSec,
      0,
    ),
    stagger,
  });

  const cutSelection = () => {
    if (selRange == null || selectedKept.length === 0) {
      setActionNote('Nothing new to cut in that selection.');
      return;
    }
    const entry = buildCut(selectedKept, 'manual', 0);
    setCuts(prev => [...prev, entry]);
    setSelection(null);
    setActionNote(
      \`Cut \${entry.label} — −\${entry.durationSec.toFixed(1)}s, runtime now \${formatTime(
        editedTotal - entry.durationSec,
      )}. Restore it from the edit rail.\`,
    );
  };

  const removeAllFillers = () => {
    const entries: CutEntry[] = [];
    let stagger = 0;
    for (const group of FILLER_GROUPS) {
      const wordIndices = group.filter(i => wordCut[i] == null);
      if (wordIndices.length === 0) {
        continue;
      }
      entries.push(buildCut(wordIndices, 'filler', stagger));
      stagger += 1;
    }
    if (entries.length === 0) {
      return;
    }
    const removedSec = entries.reduce((sum, e) => sum + e.durationSec, 0);
    setCuts(prev => [...prev, ...entries]);
    setSelection(null);
    setActionNote(
      \`Swept \${entries.length} fillers in one cascade — −\${removedSec.toFixed(
        1,
      )}s. Each landed in the edit rail individually.\`,
    );
  };

  const restoreCut = (cutId: number) => {
    const entry = cuts.find(cut => cut.id === cutId);
    setCuts(prev => prev.filter(cut => cut.id !== cutId));
    if (entry) {
      setActionNote(
        \`Restored \${entry.label} — +\${entry.durationSec.toFixed(1)}s back on the clock.\`,
      );
    }
  };

  const restoreAll = () => {
    setCuts([]);
    setActionNote(
      \`Restored everything — runtime back to \${formatTime(TOTAL_SEC)}.\`,
    );
  };

  // ----- Seeking + sentence stepping -----
  const seekToWord = (wordIndex: number) => {
    const kept = firstKeptAtOrAfter(wordIndex);
    if (kept != null) {
      setPlayWord(kept);
    }
  };

  const stepSentence = (direction: 1 | -1) => {
    const current = effectivePlay ?? 0;
    if (direction > 0) {
      for (const start of SENTENCE_STARTS) {
        if (start > current) {
          const kept = firstKeptAtOrAfter(start);
          if (kept != null) {
            setPlayWord(kept);
            return;
          }
        }
      }
      return;
    }
    // Back: the start of the previous sentence (or this one's start).
    const priorStarts = SENTENCE_STARTS.filter(start => start < current);
    const currentStart = priorStarts[priorStarts.length - 1];
    const target = SENTENCE_STARTS.filter(
      start => start < (currentStart ?? 0),
    ).pop();
    const kept = firstKeptAtOrAfter(target ?? 0);
    if (kept != null) {
      setPlayWord(kept);
    }
  };

  const togglePlay = () => {
    if (!isPlaying && effectivePlay != null) {
      // Pressing play at the end restarts from the top of the edit.
      const position = keptWords.indexOf(effectivePlay);
      if (position === keptWords.length - 1 && keptWords.length > 1) {
        setPlayWord(keptWords[0]);
      }
    }
    setIsPlaying(prev => !prev);
  };

  // ----- Pointer drag-select (capture on the transcript container) -----
  const wordIndexFromNode = (node: unknown): number | null => {
    if (!(node instanceof Element)) {
      return null;
    }
    const span = node.closest('[data-widx]');
    if (span == null) {
      return null;
    }
    const parsed = Number(span.getAttribute('data-widx'));
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleTranscriptPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const index = wordIndexFromNode(event.target);
    if (index == null) {
      setSelection(null);
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragPointerRef.current = event.pointerId;
    setSelection({anchor: index, focus: index});
  };

  const handleTranscriptPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (dragPointerRef.current !== event.pointerId) {
      return;
    }
    // Capture routes events to the container, so hit-test under the
    // pointer to find the word being swept across.
    const index = wordIndexFromNode(
      document.elementFromPoint(event.clientX, event.clientY),
    );
    if (index != null) {
      setSelection(prev =>
        prev == null
          ? {anchor: index, focus: index}
          : {anchor: prev.anchor, focus: index},
      );
    }
  };

  const handleTranscriptPointerEnd = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (dragPointerRef.current !== event.pointerId) {
      return;
    }
    dragPointerRef.current = null;
    // A tap (no sweep) also parks the playhead on that word.
    if (selection != null && selection.anchor === selection.focus) {
      seekToWord(selection.anchor);
    }
  };

  // ----- Keyboard path: identical commit logic, no pointer required -----
  const handleTranscriptKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    const key = event.key;
    if (key === 'ArrowRight' || key === 'ArrowLeft') {
      event.preventDefault();
      const delta = key === 'ArrowRight' ? 1 : -1;
      const extend = event.shiftKey;
      setSelection(prev => {
        const base = prev ?? {
          anchor: effectivePlay ?? 0,
          focus: effectivePlay ?? 0,
        };
        const focus = clampIndex(base.focus + delta);
        return extend ? {anchor: base.anchor, focus} : {anchor: focus, focus};
      });
    } else if (
      key === 'x' ||
      key === 'X' ||
      key === 'Delete' ||
      key === 'Backspace'
    ) {
      event.preventDefault();
      cutSelection();
    } else if (key === 'Enter') {
      event.preventDefault();
      if (selRange != null) {
        seekToWord(selRange[0]);
      }
    } else if (key === 'Escape') {
      setSelection(null);
    }
  };

  // Enlarged selection handles (<=640px): grow the range word-by-word on
  // either edge — the touch-parity path for the drag gesture.
  const extendSelection = (edge: 'start' | 'end') => {
    setSelection(prev => {
      const range = normalizeSelection(prev);
      if (range == null) {
        return prev;
      }
      return edge === 'start'
        ? {anchor: clampIndex(range[0] - 1), focus: range[1]}
        : {anchor: range[0], focus: clampIndex(range[1] + 1)};
    });
  };

  const handleWaveSeekFraction = (fraction: number) => {
    const target = Math.max(0, Math.min(1, fraction)) * editedTotal;
    for (const i of keptWords) {
      if (editedStartOf(i) + WORDS[i].durationSec >= target) {
        setPlayWord(i);
        return;
      }
    }
  };

  const touchStyle = isCompact ? styles.controlTouch : undefined;

  // ----- Shared UI fragments -----
  const rail = (
    <RailTabs
      tab={railTab}
      onTabChange={setRailTab}
      cuts={cuts}
      totalCutSec={totalCutSec}
      onRestore={restoreCut}
      onRestoreAll={restoreAll}
      editedStartOf={editedStartOf}
      editedTotal={editedTotal}
      firstKeptAtOrAfter={firstKeptAtOrAfter}
      activeChapterIndex={activeChapterIndex}
      onSeek={seekToWord}
    />
  );

  const selectionToolbar =
    selRange != null ? (
      <HStack gap={2} vAlign="center">
        {isCompact && (
          <IconButton
            label="Extend selection one word left"
            tooltip="Extend start"
            icon={<Icon icon={ChevronsLeftIcon} size="sm" color="inherit" />}
            variant="secondary"
            size="sm"
            style={touchStyle}
            onClick={() => extendSelection('start')}
          />
        )}
        <StackItem size="fill" style={styles.toolbarSummary}>
          <Text type="supporting" color="secondary" maxLines={1} hasTabularNumbers>
            {labelForRun(
              Array.from(
                {length: selRange[1] - selRange[0] + 1},
                (_, k) => selRange[0] + k,
              ),
            )}{' '}
            · {selectedKept.length} words · {selectedDurationSec.toFixed(1)}s
          </Text>
        </StackItem>
        {isCompact && (
          <IconButton
            label="Extend selection one word right"
            tooltip="Extend end"
            icon={<Icon icon={ChevronsRightIcon} size="sm" color="inherit" />}
            variant="secondary"
            size="sm"
            style={touchStyle}
            onClick={() => extendSelection('end')}
          />
        )}
        <Button
          label="Cut"
          variant="primary"
          size="sm"
          icon={<Icon icon={ScissorsIcon} size="sm" color="inherit" />}
          isDisabled={selectedKept.length === 0}
          style={touchStyle ? {height: 40} : undefined}
          onClick={cutSelection}
        />
        <IconButton
          label="Clear selection"
          tooltip="Clear selection"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={touchStyle}
          onClick={() => setSelection(null)}
        />
      </HStack>
    ) : (
      <HStack gap={2} vAlign="center">
        <StackItem size="fill" style={styles.toolbarSummary}>
          <Text type="supporting" color="secondary" maxLines={1}>
            Drag across words to select a span to splice out.
          </Text>
        </StackItem>
        {!isCompact && (
          <HStack gap={1} vAlign="center">
            <Kbd keys="⇧" />
            <Kbd keys="←" />
            <Kbd keys="→" />
            <Text type="supporting" color="secondary">
              select
            </Text>
            <Kbd keys="x" />
            <Text type="supporting" color="secondary">
              cut
            </Text>
          </HStack>
        )}
        <Button
          label={
            isCompact
              ? \`Fillers (\${remainingFillerGroups})\`
              : \`Remove all \${remainingFillerGroups} fillers\`
          }
          variant="secondary"
          size="sm"
          icon={<Icon icon={SparklesIcon} size="sm" color="inherit" />}
          isDisabled={remainingFillerGroups === 0}
          style={touchStyle ? {height: 40} : undefined}
          onClick={removeAllFillers}
        />
      </HStack>
    );

  const transport = (
    <HStack gap={2} vAlign="center">
      <IconButton
        label="Previous sentence"
        tooltip="Previous sentence"
        icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={touchStyle}
        onClick={() => stepSentence(-1)}
      />
      <IconButton
        label={isPlaying ? 'Pause' : 'Play'}
        tooltip={isPlaying ? 'Pause' : 'Play (skips cut spans)'}
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
        onClick={togglePlay}
      />
      <IconButton
        label="Next sentence"
        tooltip="Next sentence"
        icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={touchStyle}
        onClick={() => stepSentence(1)}
      />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {formatTime(elapsedSec)}
      </Text>
      <StackItem size="fill">
        <Slider
          label="Scrub the edited timeline"
          isLabelHidden
          min={0}
          max={Math.max(0, keptWords.length - 1)}
          step={1}
          value={keptOrdinal}
          onChange={(value: number) => {
            const target = keptWords[Math.round(value)];
            if (target != null) {
              setPlayWord(target);
            }
          }}
          formatValue={(value: number) =>
            formatTime(
              keptWords[Math.round(value)] != null
                ? editedStartOf(keptWords[Math.round(value)])
                : 0,
            )
          }
          width="100%"
        />
      </StackItem>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {formatTime(editedTotal)}
      </Text>
      {isCompact && (
        <IconButton
          label={isWaveOpen ? 'Hide waveform' : 'Show waveform'}
          tooltip={isWaveOpen ? 'Hide waveform' : 'Show waveform'}
          icon={
            <Icon
              icon={isWaveOpen ? ChevronDownIcon : ChevronUpIcon}
              size="sm"
              color="inherit"
            />
          }
          variant="ghost"
          size="sm"
          style={touchStyle}
          onClick={() => setIsWaveOpen(prev => !prev)}
        />
      )}
    </HStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <Icon icon={ScissorsIcon} size="md" color="secondary" />
            <StackItem size="fill" style={styles.headerTitle}>
              <VStack gap={0}>
                <Heading level={1}>{EPISODE_TITLE}</Heading>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {SHOW_NAME} · Ep. {EPISODE_NUMBER} · word-splice session
                </Text>
              </VStack>
            </StackItem>
            {!isCompact && (
              <Badge
                label={\`\${cuts.length} \${cuts.length === 1 ? 'cut' : 'cuts'}\`}
                variant={cuts.length > 0 ? 'info' : 'neutral'}
              />
            )}
            <HStack gap={2} vAlign="center">
              <Tooltip content="Edited runtime — recomputed from the edit list">
                <Text type="label" weight="semibold" hasTabularNumbers>
                  {formatTime(editedTotal)}
                </Text>
              </Tooltip>
              {totalCutSec > 0.05 && (
                <>
                  <Text
                    type="supporting"
                    color="secondary"
                    hasTabularNumbers
                    style={styles.strikeOriginal}>
                    {formatTime(TOTAL_SEC)}
                  </Text>
                  <Badge
                    label={\`−\${formatTime(totalCutSec)}\`}
                    variant="red"
                  />
                </>
              )}
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      end={
        isStacked ? undefined : (
          <LayoutPanel width={300} label="Edits and chapters">
            {rail}
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={3}>
              <div style={styles.toolbar}>{selectionToolbar}</div>
              <div style={styles.noteRow} aria-live="polite">
                <Text type="supporting" color="secondary" maxLines={2}>
                  {actionNote}
                </Text>
              </div>
              <div
                role="group"
                aria-label="Transcript editor. Arrow keys move the word cursor, Shift extends the selection, X cuts, Enter seeks, Escape clears."
                tabIndex={0}
                style={styles.transcript}
                onPointerDown={handleTranscriptPointerDown}
                onPointerMove={handleTranscriptPointerMove}
                onPointerUp={handleTranscriptPointerEnd}
                onPointerCancel={handleTranscriptPointerEnd}
                onKeyDown={handleTranscriptKeyDown}>
                <VStack gap={4}>
                  {SEGMENTS.map((segment, segIndex) => {
                    const firstWord = SEGMENT_WORDS[segIndex][0];
                    const keptFirst = firstKeptAtOrAfter(firstWord.index);
                    const editedLabel =
                      keptFirst == null
                        ? '(cut)'
                        : formatTime(editedStartOf(keptFirst));
                    const chapter = CHAPTERS.find(
                      ch => ch.segIndex === segIndex,
                    );
                    return (
                      <TranscriptSegment
                        key={segment.id}
                        segIndex={segIndex}
                        editedLabel={editedLabel}
                        chapterTitle={chapter?.title ?? null}
                        wordCut={wordCut}
                        selRange={selRange}
                        currentIndex={effectivePlay}
                        isReducedMotion={isReducedMotion}
                        currentWordRef={node => {
                          currentWordNodeRef.current = node;
                        }}
                      />
                    );
                  })}
                </VStack>
              </div>
              {isStacked && (
                <>
                  <Divider />
                  <Card padding={4}>{rail}</Card>
                </>
              )}
            </VStack>
          </div>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <VStack gap={2}>
            {(!isCompact || isWaveOpen) && (
              <VStack gap={1}>
                {!isCompact && (
                  <HStack gap={3} vAlign="center">
                    <Icon icon={AudioLinesIcon} size="sm" color="secondary" />
                    {(['priya', 'marcus'] as const).map(speakerId => (
                      <HStack key={speakerId} gap={1} vAlign="center">
                        <div
                          style={{
                            ...styles.speakerDot,
                            backgroundColor: SPEAKER_META[speakerId].dotColor,
                          }}
                        />
                        <Text type="supporting" color="secondary">
                          {SPEAKER_META[speakerId].name}
                        </Text>
                      </HStack>
                    ))}
                    <StackItem size="fill">
                      <Text
                        type="supporting"
                        color="secondary"
                        hasTabularNumbers
                        maxLines={1}>
                        Shared time axis — cut spans collapse out of the lane.
                      </Text>
                    </StackItem>
                    <Icon icon={BookmarkIcon} size="sm" color="secondary" />
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {CHAPTERS.length} chapters
                    </Text>
                  </HStack>
                )}
                <WaveformStrip
                  wordCut={wordCut}
                  selRange={selRange}
                  currentIndex={effectivePlay}
                  playheadPct={playheadPct}
                  isCompact={isCompact}
                  isReducedMotion={isReducedMotion}
                  onSeekFraction={handleWaveSeekFraction}
                />
              </VStack>
            )}
            {transport}
          </VStack>
        </LayoutFooter>
      }
    />
  );
}
`;export{e as default};