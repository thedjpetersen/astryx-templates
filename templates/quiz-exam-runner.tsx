// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a 20-question geography final — 10
 *   multiple choice, 5 multi-select, 5 short answer — each with an answer
 *   key entry and a per-question explanation; a fixed 15-minute time limit
 *   seeded into useState)
 * @output Timed QUIZ runner: a header with globe icon + Heading, a live
 *   mm:ss countdown that turns amber under two minutes and red under one,
 *   an answered-count readout, and a primary Submit Button; the content
 *   column presents ONE question at a time in a Card across three answer
 *   variants (RadioList multiple choice, CheckboxList multi-select,
 *   TextInput short answer) with Previous/Next footer nav and an amber
 *   flag-for-review toggle; a 280px end rail holds the question palette —
 *   20 numbered 40px chips color-coded answered (accent) / flagged (amber)
 *   / seen (outline) / unvisited (muted) with a live legend — and any chip
 *   jumps straight to its question. Submitting with unanswered questions
 *   raises a confirm Dialog listing them as jump chips; confirmed
 *   submission (or the timer reaching 0:00) flips the surface into results
 *   mode: score summary panel with ProgressBar, a missed-only Switch
 *   filter, per-question correct/incorrect review rows with your answer,
 *   the key answer, and the explanation, plus a Retake attempt action that
 *   resets answers, flags, and the clock
 * @position Page template; emitted by `astryx template quiz-exam-runner`
 *
 * Frame: Layout height="fill". LayoutHeader carries the quiz chrome
 * (title, question/limit meta, countdown, answered count, Submit — or
 * score + Retake in results mode). LayoutPanel end 280 hosts the question
 * palette: a pinned legend header with answered/flagged/unvisited counts,
 * then the scrolling 4-up chip grid. LayoutContent scrolls and centers a
 * single max-width column: the question Card while taking, the score
 * summary + review list after submission. An exam is one focused task per
 * screen, so the question lives in one Card — the palette rail is the only
 * side chrome.
 *
 * Responsive contract:
 * - >640px: header | content column (maxWidth 760, centered) | palette
 *   rail 280 (fixed, scrolls). Chips sit 4-up in the rail; nothing needs
 *   horizontal scrolling.
 * - <=640px: the palette rail leaves the end slot; a single-pane fallback
 *   strip above the question Card carries the same 20 chips in one
 *   horizontally scrolling row (the strip is the ONLY overflow-x owner on
 *   the page), so jump-to-question survives without the rail. The header
 *   meta line hides, the answered readout condenses to "N/20", the header
 *   wraps onto a second row, and Submit/Previous/Next/flag controls grow
 *   to >=40px tap targets.
 * - Chips are >=40px buttons at every width; answer inputs stack
 *   vertically at all widths so nothing reflows mid-attempt; the confirm
 *   Dialog's unanswered chips wrap instead of scrolling.
 * - Nothing is hover-only: chip states are painted inline (color + border,
 *   restated in each chip's aria-label), the flag toggle changes its own
 *   label, and the countdown is announced via the aria-live region at the
 *   two-minute and one-minute marks.
 *
 * Container policy (exam archetype): one Card for the live question (a
 * single focused task), bordered divs for the score summary and review
 * rows (dense post-run reading, not widgets), frame-first rail for the
 * palette. All counts (header readout, legend, confirm list, score)
 * recompute live from answer state. Fixture policy: fixed data only — no
 * Date.now, no randomness, no network assets; the countdown decrements a
 * fixed 900-second budget on a 1s interval, so only the tick cadence is
 * runtime (the test-runner-console resolver rule), and expiry submits the
 * same deterministic grading pass as the Submit button.
 */

import {useEffect, useMemo, useState, type CSSProperties} from 'react';

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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon,
  GlobeIcon,
  LightbulbIcon,
  RotateCcwIcon,
  SendIcon,
  TimerIcon,
  TrophyIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

// The countdown and score readouts use the code-font tokens so digits
// stay steady as they tick.
const mono: CSSProperties = {
  fontFamily: 'var(--font-family-code)',
  fontSize: 'var(--text-code-size)',
  lineHeight: 'var(--text-code-leading)',
};

const styles: Record<string, CSSProperties> = {
  headerRow: {
    width: '100%',
  },
  // <=640px: grow the sm header controls to 40px tap targets; type keeps
  // its size, the hit area just grows.
  buttonTapTarget: {height: 40},
  clock: {
    ...mono,
    fontWeight: 'var(--font-weight-semibold)',
    minWidth: 44,
    textAlign: 'right',
  },
  // Content column: one focused task, centered with viewport-side padding.
  column: {
    maxWidth: 760,
    margin: '0 auto',
    padding: 'var(--spacing-5) var(--spacing-4)',
    boxSizing: 'border-box',
  },
  // Palette rail: pinned legend header, scrolling chip grid below.
  railFrame: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  railHeader: {
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  railScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  chipGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'var(--spacing-2)',
  },
  // <=640px fallback: the same chips in one horizontally scrolling strip —
  // the page's single deliberate overflow-x owner.
  chipStrip: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-1)',
  },
  // Palette chips: >=40px numbered buttons; state is painted with color +
  // border and restated in the aria-label, never hover-revealed.
  chip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    height: 40,
    padding: 0,
    boxSizing: 'border-box',
    borderRadius: 'var(--radius-control)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    font: undefined,
    cursor: 'pointer',
    flexShrink: 0,
  },
  chipAnswered: {
    backgroundColor: 'var(--color-accent-muted)',
    borderColor: 'var(--color-accent)',
    color: 'var(--color-accent)',
  },
  chipFlagged: {
    backgroundColor: 'var(--color-warning-muted)',
    borderColor: 'var(--color-warning)',
    color: 'var(--color-warning)',
  },
  chipUnvisited: {
    backgroundColor: 'var(--color-background-muted)',
    borderColor: 'transparent',
  },
  chipCurrent: {
    boxShadow: '0 0 0 2px var(--color-accent)',
  },
  // Legend swatches mirror the chip surfaces at 12px.
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    boxSizing: 'border-box',
    border: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  swatchAnswered: {
    backgroundColor: 'var(--color-accent-muted)',
    borderColor: 'var(--color-accent)',
  },
  swatchFlagged: {
    backgroundColor: 'var(--color-warning-muted)',
    borderColor: 'var(--color-warning)',
  },
  swatchUnvisited: {
    backgroundColor: 'var(--color-background-muted)',
    borderColor: 'transparent',
  },
  // Results: bordered panels, not Cards — dense post-run reading.
  panel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
  },
  reviewRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  reviewRowMissed: {
    borderColor: 'var(--color-error)',
  },
  // Fixed 20px slot so verdict icons align down the review list.
  iconSlot: {
    width: 20,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  explanationBlock: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  answerCorrect: {color: 'var(--color-success)'},
  answerWrong: {color: 'var(--color-error)'},
  scoreReadout: {
    ...mono,
    fontSize: 'var(--font-size-xl, 28px)',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 1.2,
  },
  // Confirm dialog: unanswered chips wrap instead of scrolling.
  dialogChipWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
  srOnly: {
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
// Deterministic fixtures: a fixed 20-question geography final with an
// answer key and per-question explanations. No clocks (the countdown
// decrements a fixed budget), no randomness, no network assets.

const QUIZ_META = {
  title: 'Geography Final',
  course: 'GEO 101 · World Geography',
  limitSeconds: 15 * 60,
};

interface AnswerOption {
  value: string;
  label: string;
}

interface QuestionBase {
  id: string;
  topic: string;
  prompt: string;
  explanation: string;
}

interface ChoiceQuestion extends QuestionBase {
  kind: 'choice';
  options: AnswerOption[];
  correct: string;
}

interface MultiQuestion extends QuestionBase {
  kind: 'multi';
  options: AnswerOption[];
  correct: string[];
}

interface ShortQuestion extends QuestionBase {
  kind: 'short';
  /** Normalized (lowercase, trimmed, leading "the" dropped) accepted keys. */
  accepted: string[];
  /** Display form of the key answer for the results review. */
  correctLabel: string;
}

type QuizQuestion = ChoiceQuestion | MultiQuestion | ShortQuestion;

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q01',
    kind: 'choice',
    topic: 'Capitals',
    prompt: 'What is the capital of Australia?',
    options: [
      {value: 'sydney', label: 'Sydney'},
      {value: 'melbourne', label: 'Melbourne'},
      {value: 'canberra', label: 'Canberra'},
      {value: 'perth', label: 'Perth'},
    ],
    correct: 'canberra',
    explanation:
      'Canberra was purpose-built as a compromise capital in 1913 after ' +
      'Sydney and Melbourne both claimed the title.',
  },
  {
    id: 'q02',
    kind: 'choice',
    topic: 'Rivers',
    prompt: 'Which river is traditionally listed as the longest in the world?',
    options: [
      {value: 'amazon', label: 'Amazon'},
      {value: 'nile', label: 'Nile'},
      {value: 'yangtze', label: 'Yangtze'},
      {value: 'mississippi', label: 'Mississippi'},
    ],
    correct: 'nile',
    explanation:
      'The Nile runs about 6,650 km from the African Great Lakes to the ' +
      'Mediterranean; some Amazon surveys measure longer, but the Nile ' +
      'remains the textbook answer.',
  },
  {
    id: 'q03',
    kind: 'multi',
    topic: 'Borders',
    prompt: 'Which of these countries share a land border with Switzerland?',
    options: [
      {value: 'france', label: 'France'},
      {value: 'spain', label: 'Spain'},
      {value: 'italy', label: 'Italy'},
      {value: 'germany', label: 'Germany'},
      {value: 'austria', label: 'Austria'},
    ],
    correct: ['france', 'italy', 'germany', 'austria'],
    explanation:
      'Switzerland borders France, Italy, Germany, Austria, and tiny ' +
      'Liechtenstein. Spain sits two countries away, across France.',
  },
  {
    id: 'q04',
    kind: 'short',
    topic: 'Deserts',
    prompt: 'Name the largest hot desert on Earth.',
    accepted: ['sahara', 'sahara desert'],
    correctLabel: 'The Sahara',
    explanation:
      'The Sahara covers roughly 9.2 million km² of northern Africa — ' +
      'only the cold deserts of Antarctica and the Arctic are larger.',
  },
  {
    id: 'q05',
    kind: 'choice',
    topic: 'Time zones',
    prompt: 'Which country spans the most time zones, territories included?',
    options: [
      {value: 'russia', label: 'Russia'},
      {value: 'usa', label: 'United States'},
      {value: 'france', label: 'France'},
      {value: 'uk', label: 'United Kingdom'},
    ],
    correct: 'france',
    explanation:
      'Thanks to overseas territories from French Polynesia to Réunion, ' +
      'France touches 12 time zones — one more than Russia or the US.',
  },
  {
    id: 'q06',
    kind: 'choice',
    topic: 'Mountains',
    prompt: 'Mount Kilimanjaro, the highest peak in Africa, rises in which country?',
    options: [
      {value: 'kenya', label: 'Kenya'},
      {value: 'tanzania', label: 'Tanzania'},
      {value: 'ethiopia', label: 'Ethiopia'},
      {value: 'uganda', label: 'Uganda'},
    ],
    correct: 'tanzania',
    explanation:
      'Kilimanjaro (5,895 m) stands in northern Tanzania near the Kenyan ' +
      'border — the classic photos are shot from Amboseli, on the Kenya side.',
  },
  {
    id: 'q07',
    kind: 'multi',
    topic: 'Landlocked states',
    prompt: 'Select every landlocked country in this list.',
    options: [
      {value: 'bolivia', label: 'Bolivia'},
      {value: 'portugal', label: 'Portugal'},
      {value: 'mongolia', label: 'Mongolia'},
      {value: 'austria', label: 'Austria'},
      {value: 'vietnam', label: 'Vietnam'},
    ],
    correct: ['bolivia', 'mongolia', 'austria'],
    explanation:
      'Bolivia lost its coast to Chile in 1884, Mongolia sits between ' +
      'Russia and China, and Austria is Alpine through and through. ' +
      'Portugal and Vietnam both have long coastlines.',
  },
  {
    id: 'q08',
    kind: 'short',
    topic: 'Straits',
    prompt: 'Which strait separates Spain from Morocco?',
    accepted: ['strait of gibraltar', 'gibraltar', 'gibraltar strait'],
    correctLabel: 'The Strait of Gibraltar',
    explanation:
      'At its narrowest the Strait of Gibraltar is only about 13 km wide, ' +
      'joining the Atlantic to the Mediterranean between Europe and Africa.',
  },
  {
    id: 'q09',
    kind: 'choice',
    topic: 'Islands',
    prompt: 'What is the largest island in the world (excluding continents)?',
    options: [
      {value: 'greenland', label: 'Greenland'},
      {value: 'newguinea', label: 'New Guinea'},
      {value: 'borneo', label: 'Borneo'},
      {value: 'madagascar', label: 'Madagascar'},
    ],
    correct: 'greenland',
    explanation:
      'Greenland covers about 2.17 million km². Australia is bigger but ' +
      'is counted as a continental landmass, not an island.',
  },
  {
    id: 'q10',
    kind: 'choice',
    topic: 'Capitals',
    prompt: 'What is the capital of Canada?',
    options: [
      {value: 'toronto', label: 'Toronto'},
      {value: 'vancouver', label: 'Vancouver'},
      {value: 'montreal', label: 'Montreal'},
      {value: 'ottawa', label: 'Ottawa'},
    ],
    correct: 'ottawa',
    explanation:
      'Queen Victoria picked Ottawa in 1857 as a defensible compromise ' +
      'between English Toronto and French Montreal.',
  },
  {
    id: 'q11',
    kind: 'multi',
    topic: 'The equator',
    prompt: 'The equator passes through which of these countries?',
    options: [
      {value: 'ecuador', label: 'Ecuador'},
      {value: 'egypt', label: 'Egypt'},
      {value: 'kenya', label: 'Kenya'},
      {value: 'indonesia', label: 'Indonesia'},
      {value: 'india', label: 'India'},
    ],
    correct: ['ecuador', 'kenya', 'indonesia'],
    explanation:
      'Ecuador is literally named for it, and the line also crosses Kenya ' +
      'and Indonesia. Egypt and India lie well north of the equator.',
  },
  {
    id: 'q12',
    kind: 'short',
    topic: 'Mountains',
    prompt: 'Name the longest above-water mountain range on Earth.',
    accepted: ['andes', 'andes mountains', 'the andes'],
    correctLabel: 'The Andes',
    explanation:
      'The Andes run about 7,000 km down the western edge of South ' +
      'America — the mid-ocean ridges are longer, but they are underwater.',
  },
  {
    id: 'q13',
    kind: 'choice',
    topic: 'Deserts',
    prompt: 'The Atacama, often called the driest place on Earth, lies mostly in which country?',
    options: [
      {value: 'peru', label: 'Peru'},
      {value: 'chile', label: 'Chile'},
      {value: 'argentina', label: 'Argentina'},
      {value: 'mexico', label: 'Mexico'},
    ],
    correct: 'chile',
    explanation:
      'The Atacama stretches along northern Chile; some of its weather ' +
      'stations have never recorded rainfall.',
  },
  {
    id: 'q14',
    kind: 'choice',
    topic: 'Rivers',
    prompt: 'The Danube empties into which body of water?',
    options: [
      {value: 'blacksea', label: 'The Black Sea'},
      {value: 'mediterranean', label: 'The Mediterranean Sea'},
      {value: 'baltic', label: 'The Baltic Sea'},
      {value: 'adriatic', label: 'The Adriatic Sea'},
    ],
    correct: 'blacksea',
    explanation:
      'After crossing ten countries the Danube fans out into a huge delta ' +
      'on the Romanian–Ukrainian coast of the Black Sea.',
  },
  {
    id: 'q15',
    kind: 'multi',
    topic: 'Seas',
    prompt: 'Which of these seas touch the coast of Turkey?',
    options: [
      {value: 'black', label: 'The Black Sea'},
      {value: 'caspian', label: 'The Caspian Sea'},
      {value: 'aegean', label: 'The Aegean Sea'},
      {value: 'mediterranean', label: 'The Mediterranean Sea'},
      {value: 'red', label: 'The Red Sea'},
    ],
    correct: ['black', 'aegean', 'mediterranean'],
    explanation:
      'Turkey fronts the Black Sea to the north, the Aegean to the west, ' +
      'and the Mediterranean to the south. The Caspian and Red Seas never ' +
      'touch it.',
  },
  {
    id: 'q16',
    kind: 'short',
    topic: 'Capitals',
    prompt: 'What is the capital of New Zealand?',
    accepted: ['wellington'],
    correctLabel: 'Wellington',
    explanation:
      'Wellington took over from Auckland in 1865 for its central spot on ' +
      'Cook Strait — Auckland remains the larger city.',
  },
  {
    id: 'q17',
    kind: 'choice',
    topic: 'Lakes',
    prompt: 'Lake Baikal, the deepest lake in the world, is in which country?',
    options: [
      {value: 'kazakhstan', label: 'Kazakhstan'},
      {value: 'mongolia', label: 'Mongolia'},
      {value: 'russia', label: 'Russia'},
      {value: 'china', label: 'China'},
    ],
    correct: 'russia',
    explanation:
      'Baikal, in Siberian Russia, plunges 1,642 m and holds roughly a ' +
      'fifth of the planet’s unfrozen fresh water.',
  },
  {
    id: 'q18',
    kind: 'choice',
    topic: 'Waterfalls',
    prompt: 'Angel Falls, the tallest uninterrupted waterfall, drops in which country?',
    options: [
      {value: 'brazil', label: 'Brazil'},
      {value: 'venezuela', label: 'Venezuela'},
      {value: 'colombia', label: 'Colombia'},
      {value: 'guyana', label: 'Guyana'},
    ],
    correct: 'venezuela',
    explanation:
      'Angel Falls plunges 979 m off Auyán-tepui in Venezuela’s Canaima ' +
      'National Park.',
  },
  {
    id: 'q19',
    kind: 'multi',
    topic: 'Coastlines',
    prompt: 'Which of these cities sit on the Mediterranean coast?',
    options: [
      {value: 'barcelona', label: 'Barcelona'},
      {value: 'lisbon', label: 'Lisbon'},
      {value: 'alexandria', label: 'Alexandria'},
      {value: 'marseille', label: 'Marseille'},
      {value: 'hamburg', label: 'Hamburg'},
    ],
    correct: ['barcelona', 'alexandria', 'marseille'],
    explanation:
      'Barcelona, Alexandria, and Marseille all face the Mediterranean. ' +
      'Lisbon fronts the Atlantic and Hamburg sits on the Elbe, far inland ' +
      'from the North Sea.',
  },
  {
    id: 'q20',
    kind: 'short',
    topic: 'Meridians',
    prompt: 'Which line of 0° longitude passes through Greenwich, London?',
    accepted: ['prime meridian', 'greenwich meridian', 'prime'],
    correctLabel: 'The Prime Meridian',
    explanation:
      'The 1884 International Meridian Conference fixed 0° longitude at ' +
      'the Royal Observatory in Greenwich, splitting the eastern and ' +
      'western hemispheres.',
  },
];

// ============= HELPERS =============

type AnswerValue = string | string[];
type AnswerMap = Record<string, AnswerValue>;

type Phase = 'taking' | 'results';

type ChipState = 'flagged' | 'answered' | 'seen' | 'unvisited';

const CHIP_STATE_WORD: Record<ChipState, string> = {
  flagged: 'flagged for review',
  answered: 'answered',
  seen: 'seen, not answered',
  unvisited: 'not visited',
};

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function stringAnswer(answers: AnswerMap, id: string): string {
  const value = answers[id];
  return typeof value === 'string' ? value : '';
}

function listAnswer(answers: AnswerMap, id: string): string[] {
  const value = answers[id];
  return Array.isArray(value) ? value : [];
}

function isAnswered(question: QuizQuestion, answers: AnswerMap): boolean {
  switch (question.kind) {
    case 'choice':
      return stringAnswer(answers, question.id) !== '';
    case 'multi':
      return listAnswer(answers, question.id).length > 0;
    case 'short':
      return stringAnswer(answers, question.id).trim() !== '';
  }
}

/** Short-answer grading: lowercase, trim, drop a leading "the". */
function normalizeShortAnswer(text: string): string {
  return text.trim().toLowerCase().replace(/^the\s+/, '');
}

function isCorrect(question: QuizQuestion, answers: AnswerMap): boolean {
  switch (question.kind) {
    case 'choice':
      return stringAnswer(answers, question.id) === question.correct;
    case 'multi': {
      const picked = [...listAnswer(answers, question.id)].sort();
      const key = [...question.correct].sort();
      return (
        picked.length === key.length &&
        picked.every((value, index) => value === key[index])
      );
    }
    case 'short':
      return question.accepted
        .map(normalizeShortAnswer)
        .includes(normalizeShortAnswer(stringAnswer(answers, question.id)));
  }
}

function optionLabels(options: AnswerOption[], values: string[]): string {
  return options
    .filter(option => values.includes(option.value))
    .map(option => option.label)
    .join(', ');
}

/** The taker's answer, formatted for the review row ('—' when blank). */
function yourAnswerLabel(question: QuizQuestion, answers: AnswerMap): string {
  switch (question.kind) {
    case 'choice': {
      const value = stringAnswer(answers, question.id);
      return value === '' ? '—' : optionLabels(question.options, [value]);
    }
    case 'multi': {
      const values = listAnswer(answers, question.id);
      return values.length === 0
        ? '—'
        : optionLabels(question.options, values);
    }
    case 'short': {
      const value = stringAnswer(answers, question.id).trim();
      return value === '' ? '—' : `“${value}”`;
    }
  }
}

/** The answer key entry, formatted for the review row. */
function keyAnswerLabel(question: QuizQuestion): string {
  switch (question.kind) {
    case 'choice':
      return optionLabels(question.options, [question.correct]);
    case 'multi':
      return optionLabels(question.options, question.correct);
    case 'short':
      return question.correctLabel;
  }
}

function chipStateFor(
  question: QuizQuestion,
  answers: AnswerMap,
  flaggedIds: string[],
  visitedIds: string[],
): ChipState {
  if (flaggedIds.includes(question.id)) {
    return 'flagged';
  }
  if (isAnswered(question, answers)) {
    return 'answered';
  }
  return visitedIds.includes(question.id) ? 'seen' : 'unvisited';
}

const KIND_WORD: Record<QuizQuestion['kind'], string> = {
  choice: 'Multiple choice',
  multi: 'Multi-select — choose all that apply',
  short: 'Short answer',
};

// ============= PALETTE =============

function PaletteChip({
  number,
  state,
  isCurrent,
  onJump,
}: {
  number: number;
  state: ChipState;
  isCurrent: boolean;
  onJump: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Question ${number}: ${CHIP_STATE_WORD[state]}${
        isCurrent ? ', current' : ''
      }`}
      aria-current={isCurrent ? 'true' : undefined}
      onClick={onJump}
      style={{
        ...styles.chip,
        ...(state === 'answered' ? styles.chipAnswered : undefined),
        ...(state === 'flagged' ? styles.chipFlagged : undefined),
        ...(state === 'unvisited' ? styles.chipUnvisited : undefined),
        ...(isCurrent ? styles.chipCurrent : undefined),
      }}>
      {number}
    </button>
  );
}

function LegendRow({
  swatchStyle,
  label,
  count,
}: {
  swatchStyle?: CSSProperties;
  label: string;
  count: number;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <span style={{...styles.swatch, ...swatchStyle}} aria-hidden="true" />
      <StackItem size="fill">
        <Text type="supporting" color="secondary">
          {label}
        </Text>
      </StackItem>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {count}
      </Text>
    </HStack>
  );
}

function QuestionPalette({
  answers,
  flaggedIds,
  visitedIds,
  currentIndex,
  onJump,
}: {
  answers: AnswerMap;
  flaggedIds: string[];
  visitedIds: string[];
  currentIndex: number;
  onJump: (index: number) => void;
}) {
  const answeredCount = QUESTIONS.filter(question =>
    isAnswered(question, answers),
  ).length;
  const unvisitedCount = QUESTIONS.filter(
    question => !visitedIds.includes(question.id),
  ).length;
  return (
    <div style={styles.railFrame}>
      <div style={styles.railHeader}>
        <VStack gap={2}>
          <Heading level={2}>Questions</Heading>
          <LegendRow
            swatchStyle={styles.swatchAnswered}
            label="Answered"
            count={answeredCount}
          />
          <LegendRow
            swatchStyle={styles.swatchFlagged}
            label="Flagged for review"
            count={flaggedIds.length}
          />
          <LegendRow
            swatchStyle={styles.swatchUnvisited}
            label="Not visited"
            count={unvisitedCount}
          />
        </VStack>
      </div>
      <div style={styles.railScroll}>
        <nav aria-label="Question palette">
          <div style={styles.chipGrid}>
            {QUESTIONS.map((question, index) => (
              <PaletteChip
                key={question.id}
                number={index + 1}
                state={chipStateFor(question, answers, flaggedIds, visitedIds)}
                isCurrent={index === currentIndex}
                onJump={() => onJump(index)}
              />
            ))}
          </div>
        </nav>
        <VStack gap={0} style={{paddingTop: 'var(--spacing-3)'}}>
          <Text type="supporting" color="secondary">
            Tap any number to jump to that question. Flags are reminders
            only — flagged answers still count.
          </Text>
        </VStack>
      </div>
    </div>
  );
}

// ============= ANSWER CONTROL =============

function AnswerControl({
  question,
  answers,
  onChoice,
  onMulti,
  onShort,
}: {
  question: QuizQuestion;
  answers: AnswerMap;
  onChoice: (id: string, value: string) => void;
  onMulti: (id: string, values: string[]) => void;
  onShort: (id: string, value: string) => void;
}) {
  if (question.kind === 'choice') {
    return (
      <RadioList
        label="Pick one answer"
        isLabelHidden
        value={stringAnswer(answers, question.id)}
        onChange={value => onChoice(question.id, value)}>
        {question.options.map(option => (
          <RadioListItem
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </RadioList>
    );
  }
  if (question.kind === 'multi') {
    return (
      <CheckboxList
        label="Choose all that apply"
        isLabelHidden
        value={listAnswer(answers, question.id)}
        onChange={values => onMulti(question.id, values)}>
        {question.options.map(option => (
          <CheckboxListItem
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </CheckboxList>
    );
  }
  return (
    <TextInput
      label="Your answer"
      description="Answers are graded case-insensitively; a leading “The” is fine."
      value={stringAnswer(answers, question.id)}
      onChange={value => onShort(question.id, value)}
      placeholder="Type your answer"
    />
  );
}

// ============= RESULTS =============

function ReviewRow({
  question,
  number,
  answers,
  wasFlagged,
  correct,
}: {
  question: QuizQuestion;
  number: number;
  answers: AnswerMap;
  wasFlagged: boolean;
  correct: boolean;
}) {
  const answered = isAnswered(question, answers);
  return (
    <div
      style={{
        ...styles.reviewRow,
        ...(correct ? undefined : styles.reviewRowMissed),
      }}>
      <HStack gap={2}>
        <span style={styles.iconSlot}>
          {correct ? (
            <Icon icon={CheckIcon} size="sm" color="success" aria-label="Correct" />
          ) : (
            <Icon icon={XIcon} size="sm" color="error" aria-label="Incorrect" />
          )}
        </span>
        <StackItem size="fill">
          <VStack gap={2}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Badge variant="neutral" label={`Q${number}`} />
              <Text type="supporting" color="secondary">
                {question.topic} · {KIND_WORD[question.kind]}
              </Text>
              {wasFlagged && <Badge variant="warning" label="Flagged" />}
              {!answered && <Badge variant="neutral" label="Unanswered" />}
            </HStack>
            <Text type="label">{question.prompt}</Text>
            <VStack gap={1}>
              <HStack gap={2} wrap="wrap">
                <Text type="supporting" color="secondary">
                  Your answer:
                </Text>
                <Text
                  type="supporting"
                  style={correct ? styles.answerCorrect : styles.answerWrong}>
                  {yourAnswerLabel(question, answers)}
                </Text>
              </HStack>
              {!correct && (
                <HStack gap={2} wrap="wrap">
                  <Text type="supporting" color="secondary">
                    Correct answer:
                  </Text>
                  <Text type="supporting" style={styles.answerCorrect}>
                    {keyAnswerLabel(question)}
                  </Text>
                </HStack>
              )}
            </VStack>
            <div style={styles.explanationBlock}>
              <Icon icon={LightbulbIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary">
                {question.explanation}
              </Text>
            </div>
          </VStack>
        </StackItem>
      </HStack>
    </div>
  );
}

// ============= PAGE =============

export default function QuizExamRunnerTemplate() {
  const [phase, setPhase] = useState<Phase>('taking');
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [visitedIds, setVisitedIds] = useState<string[]>([QUESTIONS[0].id]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(
    QUIZ_META.limitSeconds,
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMissedOnly, setIsMissedOnly] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');

  // Responsive contract: <=640px swaps the palette rail for a horizontal
  // chip strip above the question Card and grows controls to >=40px.
  const isCompact = useMediaQuery('(max-width: 640px)');

  // Countdown: decrement a fixed budget once per second while taking.
  // Deterministic start and grading — only the tick cadence is runtime.
  useEffect(() => {
    if (phase !== 'taking') {
      return;
    }
    const timer = window.setInterval(() => {
      setRemainingSeconds(previous => (previous > 0 ? previous - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  // ---- derived state ----
  const currentQuestion = QUESTIONS[currentIndex];
  const answeredCount = QUESTIONS.filter(question =>
    isAnswered(question, answers),
  ).length;
  const unansweredQuestions = useMemo(
    () => QUESTIONS.filter(question => !isAnswered(question, answers)),
    [answers],
  );
  const correctCount = QUESTIONS.filter(question =>
    isCorrect(question, answers),
  ).length;
  const missedQuestions = QUESTIONS.filter(
    question => !isCorrect(question, answers),
  );
  const scorePercent = Math.round((correctCount / QUESTIONS.length) * 100);
  const timeUsedSeconds = QUIZ_META.limitSeconds - remainingSeconds;
  const isLastQuestion = currentIndex === QUESTIONS.length - 1;
  const isCurrentFlagged = flaggedIds.includes(currentQuestion.id);

  const reviewQuestions = isMissedOnly ? missedQuestions : QUESTIONS;

  // ---- interactions ----
  const jumpToQuestion = (index: number) => {
    const target = QUESTIONS[index];
    setCurrentIndex(index);
    setVisitedIds(previous =>
      previous.includes(target.id) ? previous : [...previous, target.id],
    );
  };

  const submitQuiz = (reason: 'button' | 'expired') => {
    setIsConfirmOpen(false);
    setPhase('results');
    setIsMissedOnly(false);
    setLiveMessage(
      reason === 'expired'
        ? `Time expired — quiz submitted automatically. Score ${correctCount} of ${QUESTIONS.length}.`
        : `Quiz submitted. Score ${correctCount} of ${QUESTIONS.length}.`,
    );
  };

  // Timer expiry submits the same deterministic grading pass.
  useEffect(() => {
    if (phase === 'taking' && remainingSeconds === 0) {
      submitQuiz('expired');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, phase]);

  // Announce the two-minute and one-minute marks (color alone is not
  // enough for the countdown's urgency shift).
  useEffect(() => {
    if (phase !== 'taking') {
      return;
    }
    if (remainingSeconds === 120) {
      setLiveMessage('Two minutes remaining.');
    } else if (remainingSeconds === 60) {
      setLiveMessage('One minute remaining.');
    }
  }, [remainingSeconds, phase]);

  const requestSubmit = () => {
    if (unansweredQuestions.length > 0) {
      setIsConfirmOpen(true);
    } else {
      submitQuiz('button');
    }
  };

  const toggleFlag = () => {
    const id = currentQuestion.id;
    const willFlag = !flaggedIds.includes(id);
    setFlaggedIds(previous =>
      willFlag ? [...previous, id] : previous.filter(item => item !== id),
    );
    setLiveMessage(
      willFlag
        ? `Question ${currentIndex + 1} flagged for review.`
        : `Flag removed from question ${currentIndex + 1}.`,
    );
  };

  const setChoiceAnswer = (id: string, value: string) => {
    setAnswers(previous => ({...previous, [id]: value}));
  };
  const setMultiAnswer = (id: string, values: string[]) => {
    setAnswers(previous => ({...previous, [id]: values}));
  };
  const setShortAnswer = (id: string, value: string) => {
    setAnswers(previous => ({...previous, [id]: value}));
  };

  // Retake: fresh attempt — answers, flags, visits, clock, and filters
  // all reset; the fixture questions are reused as-is.
  const retakeQuiz = () => {
    setAnswers({});
    setFlaggedIds([]);
    setVisitedIds([QUESTIONS[0].id]);
    setCurrentIndex(0);
    setRemainingSeconds(QUIZ_META.limitSeconds);
    setIsMissedOnly(false);
    setIsConfirmOpen(false);
    setPhase('taking');
    setLiveMessage('New attempt started. The timer has been reset.');
  };

  // ---- header ----
  const clockColor =
    remainingSeconds <= 60
      ? 'var(--color-error)'
      : remainingSeconds <= 120
        ? 'var(--color-warning)'
        : 'var(--color-text-secondary)';

  const takingHeader = (
    <HStack gap={3} vAlign="center" wrap="wrap" style={styles.headerRow}>
      <StackItem size="fill">
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={GlobeIcon} size="md" color="secondary" />
          <Heading level={1}>{QUIZ_META.title}</Heading>
          {!isCompact && (
            <Text type="supporting" color="secondary">
              {QUIZ_META.course} · {QUESTIONS.length} questions ·{' '}
              {formatClock(QUIZ_META.limitSeconds)} limit
            </Text>
          )}
        </HStack>
      </StackItem>
      <HStack gap={1} vAlign="center">
        <Icon
          icon={TimerIcon}
          size="sm"
          color={
            remainingSeconds <= 60
              ? 'error'
              : remainingSeconds <= 120
                ? 'warning'
                : 'secondary'
          }
        />
        <span
          style={{...styles.clock, color: clockColor}}
          aria-label={`Time remaining ${formatClock(remainingSeconds)}`}>
          {formatClock(remainingSeconds)}
        </span>
      </HStack>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {isCompact
          ? `${answeredCount}/${QUESTIONS.length}`
          : `${answeredCount} of ${QUESTIONS.length} answered`}
      </Text>
      <Button
        label="Submit quiz"
        variant="primary"
        size="sm"
        style={isCompact ? styles.buttonTapTarget : undefined}
        icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
        onClick={requestSubmit}
      />
    </HStack>
  );

  const resultsHeader = (
    <HStack gap={3} vAlign="center" wrap="wrap" style={styles.headerRow}>
      <StackItem size="fill">
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={GlobeIcon} size="md" color="secondary" />
          <Heading level={1}>{QUIZ_META.title}</Heading>
          {!isCompact && (
            <Text type="supporting" color="secondary">
              {QUIZ_META.course} · attempt graded
            </Text>
          )}
        </HStack>
      </StackItem>
      <Badge
        variant={scorePercent >= 70 ? 'success' : 'warning'}
        label={`Score ${correctCount}/${QUESTIONS.length}`}
      />
      <Button
        label="Retake quiz"
        variant="primary"
        size="sm"
        style={isCompact ? styles.buttonTapTarget : undefined}
        icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
        onClick={retakeQuiz}
      />
    </HStack>
  );

  // ---- taking mode: question card ----
  const questionCard = (
    <Card padding={5} width="100%">
      <VStack gap={4}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Badge
            variant="neutral"
            label={`Question ${currentIndex + 1} of ${QUESTIONS.length}`}
          />
          <Text type="supporting" color="secondary">
            {currentQuestion.topic} · {KIND_WORD[currentQuestion.kind]}
          </Text>
          <StackItem size="fill" />
          {isCurrentFlagged && <Badge variant="warning" label="Flagged" />}
        </HStack>
        <Heading level={2}>{currentQuestion.prompt}</Heading>
        <AnswerControl
          question={currentQuestion}
          answers={answers}
          onChoice={setChoiceAnswer}
          onMulti={setMultiAnswer}
          onShort={setShortAnswer}
        />
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button
            label="Previous"
            variant="secondary"
            style={isCompact ? styles.buttonTapTarget : undefined}
            icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
            isDisabled={currentIndex === 0}
            onClick={() => jumpToQuestion(Math.max(0, currentIndex - 1))}
          />
          <Button
            label={isCurrentFlagged ? 'Flagged — tap to clear' : 'Flag for review'}
            variant="secondary"
            style={{
              ...(isCompact ? styles.buttonTapTarget : undefined),
              ...(isCurrentFlagged
                ? {color: 'var(--color-warning)'}
                : undefined),
            }}
            icon={
              <Icon
                icon={FlagIcon}
                size="sm"
                color={isCurrentFlagged ? 'warning' : 'inherit'}
              />
            }
            onClick={toggleFlag}
          />
          <StackItem size="fill">
            {!isCompact && (
              <Text type="supporting" color="secondary">
                Answers save instantly.
              </Text>
            )}
          </StackItem>
          <Button
            label={isLastQuestion ? 'Finish & submit' : 'Next'}
            variant={isLastQuestion ? 'primary' : 'secondary'}
            style={isCompact ? styles.buttonTapTarget : undefined}
            icon={
              <Icon
                icon={isLastQuestion ? SendIcon : ChevronRightIcon}
                size="sm"
                color="inherit"
              />
            }
            onClick={() =>
              isLastQuestion
                ? requestSubmit()
                : jumpToQuestion(
                    Math.min(QUESTIONS.length - 1, currentIndex + 1),
                  )
            }
          />
        </HStack>
      </VStack>
    </Card>
  );

  // <=640px single-pane fallback: same chips, one scrolling strip.
  const chipStrip = (
    <nav aria-label="Question palette">
      <div style={styles.chipStrip}>
        {QUESTIONS.map((question, index) => (
          <PaletteChip
            key={question.id}
            number={index + 1}
            state={chipStateFor(question, answers, flaggedIds, visitedIds)}
            isCurrent={index === currentIndex}
            onJump={() => jumpToQuestion(index)}
          />
        ))}
      </div>
    </nav>
  );

  // ---- results mode ----
  const resultsBody = (
    <VStack gap={4}>
      <div style={styles.panel}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Icon
              icon={TrophyIcon}
              size="md"
              color={scorePercent >= 70 ? 'success' : 'warning'}
            />
            <Heading level={2}>
              {scorePercent >= 90
                ? 'Outstanding attempt'
                : scorePercent >= 70
                  ? 'Solid attempt'
                  : 'Room to improve'}
            </Heading>
          </HStack>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <span style={styles.scoreReadout} aria-hidden="true">
              {correctCount}/{QUESTIONS.length}
            </span>
            <StackItem size="fill">
              <ProgressBar
                value={correctCount}
                max={QUESTIONS.length}
                variant={scorePercent >= 70 ? 'success' : 'warning'}
                label={`Score ${correctCount} of ${QUESTIONS.length}`}
                isLabelHidden
              />
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {scorePercent}%
            </Text>
          </HStack>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <Text type="supporting" style={styles.answerCorrect}>
              {correctCount} correct
            </Text>
            <Text type="supporting" style={styles.answerWrong}>
              {missedQuestions.length} missed
            </Text>
            <Text type="supporting" color="secondary">
              {flaggedIds.length} flagged during the attempt
            </Text>
            <StackItem size="fill" />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Time used {formatClock(timeUsedSeconds)} of{' '}
              {formatClock(QUIZ_META.limitSeconds)}
            </Text>
          </HStack>
        </VStack>
      </div>

      <HStack gap={3} vAlign="center" wrap="wrap">
        <Switch
          label={`Missed only (${missedQuestions.length})`}
          value={isMissedOnly}
          onChange={setIsMissedOnly}
        />
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Showing {reviewQuestions.length} of {QUESTIONS.length} questions
        </Text>
      </HStack>

      {reviewQuestions.length > 0 ? (
        reviewQuestions.map(question => (
          <ReviewRow
            key={question.id}
            question={question}
            number={QUESTIONS.indexOf(question) + 1}
            answers={answers}
            wasFlagged={flaggedIds.includes(question.id)}
            correct={isCorrect(question, answers)}
          />
        ))
      ) : (
        <EmptyState
          icon={<Icon icon={CheckIcon} size="lg" color="success" />}
          title="Nothing missed"
          description="A perfect 20 for 20 — there are no incorrect answers to review."
        />
      )}
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {phase === 'taking' ? takingHeader : resultsHeader}
        </LayoutHeader>
      }
      end={
        phase === 'taking' && !isCompact ? (
          <LayoutPanel
            width={280}
            padding={0}
            hasDivider
            label="Question palette">
            <QuestionPalette
              answers={answers}
              flaggedIds={flaggedIds}
              visitedIds={visitedIds}
              currentIndex={currentIndex}
              onJump={jumpToQuestion}
            />
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent
          padding={0}
          label={phase === 'taking' ? 'Current question' : 'Results'}>
          <div style={styles.column}>
            {phase === 'taking' ? (
              <VStack gap={3}>
                {isCompact && chipStrip}
                {questionCard}
              </VStack>
            ) : (
              resultsBody
            )}
          </div>

          {/* Submit guard: confirm when questions are still unanswered.
              The listed chips jump straight to the question and keep the
              attempt going. */}
          <Dialog
            isOpen={isConfirmOpen}
            onOpenChange={setIsConfirmOpen}
            purpose="form"
            width={440}>
            <Layout
              header={
                <DialogHeader
                  title="Submit with unanswered questions?"
                  subtitle={`${unansweredQuestions.length} of ${QUESTIONS.length} questions have no answer yet`}
                  onOpenChange={setIsConfirmOpen}
                />
              }
              content={
                <LayoutContent>
                  <VStack gap={3}>
                    <Text type="body">
                      Unanswered questions score zero. Tap a number to jump
                      back to it, or submit as-is.
                    </Text>
                    <div style={styles.dialogChipWrap}>
                      {unansweredQuestions.map(question => {
                        const index = QUESTIONS.indexOf(question);
                        return (
                          <PaletteChip
                            key={question.id}
                            number={index + 1}
                            state={chipStateFor(
                              question,
                              answers,
                              flaggedIds,
                              visitedIds,
                            )}
                            isCurrent={false}
                            onJump={() => {
                              jumpToQuestion(index);
                              setIsConfirmOpen(false);
                            }}
                          />
                        );
                      })}
                    </div>
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {formatClock(remainingSeconds)} still on the clock.
                    </Text>
                  </VStack>
                </LayoutContent>
              }
              footer={
                <LayoutFooter hasDivider>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill" />
                    <Button
                      label="Keep working"
                      variant="secondary"
                      onClick={() => setIsConfirmOpen(false)}
                    />
                    <Button
                      label={`Submit ${QUESTIONS.length - unansweredQuestions.length} answers`}
                      variant="primary"
                      onClick={() => submitQuiz('button')}
                    />
                  </HStack>
                </LayoutFooter>
              }
            />
          </Dialog>

          {/* Flags, submission, retake, and countdown milestones are
              announced for screen readers. */}
          <div aria-live="polite" style={styles.srOnly}>
            {liveMessage}
          </div>
        </LayoutContent>
      }
    />
  );
}
