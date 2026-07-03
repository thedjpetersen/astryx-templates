var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a 5-module 'TypeScript from Zero to
 *   Production' course: 24 lessons with fixed titles and durations, seeded
 *   ~40% complete (10 of 24 checked), one inline quiz-checkpoint lesson with
 *   3 fixed questions, a locked fifth module gated on 16 unlocked-lesson
 *   completions, per-lesson transcripts and instructor notes derived from
 *   fixed sentence banks, and four seeded personal notes with fixed
 *   timestamps)
 * @output Course lesson player: a collapsible curriculum tree rail (modules
 *   with per-module ProgressBars, lessons with duration chips and completion
 *   checkmarks, a lock row on the gated module), a center lesson stage (16:9
 *   gradient placeholder with play overlay, scrub Slider, timecode, and
 *   mark-complete control — or an inline 3-question quiz checkpoint with
 *   immediate right/wrong feedback that blocks Next until all are correct),
 *   a Transcript / Lesson notes TabList below the stage, prev/next lesson
 *   navigation with an autoplay-next Switch, and a toggleable right notes
 *   panel where adding a note stamps the current playback position and
 *   timestamp chips seek the player
 * @position Page template; emitted by \`astryx template course-lesson-player\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the course title, the
 * overall completion percentage with a ProgressBar, and the notes-panel
 * ToggleButton. The start LayoutPanel (300px) is the curriculum tree; the
 * end LayoutPanel (320px, toggleable) is the personal notes pad;
 * LayoutContent scrolls the lesson stage, navigation row, and tab strip.
 * This is structured course consumption — choose video-watch-page for
 * lean-back entertainment playback with comments, and
 * flashcard-review-session for spaced-repetition drills without a
 * curriculum tree.
 *
 * Interaction contract:
 * - Selecting a lesson in the tree swaps the center stage, transcript, and
 *   notes filter; module chevrons collapse/expand independently of
 *   selection.
 * - Mark complete toggles the lesson's checkmark and live-recomputes the
 *   module ProgressBar, the overall course percentage, and the locked
 *   module's gate (16 completions unlock it; dropping below re-locks).
 * - The checkpoint lesson renders 3 inline questions; each answer gets
 *   immediate right/wrong feedback and Next / Mark complete stay blocked
 *   until all three are correct.
 * - Adding a note stamps the current playback position; notes list per
 *   lesson, their timestamp chips seek the player, and each note deletes.
 * - Prev/next navigate the flat lesson order (locked lessons disable Next);
 *   when the playhead reaches the end the lesson auto-completes and, with
 *   the autoplay Switch on, advances to the next unlocked lesson.
 *
 * Responsive contract:
 * - >1280px: curriculum 300 | stage (min 0, fills) | notes 320 when the
 *   header ToggleButton is pressed.
 * - <=1280px: the docked notes panel drops and "My notes" joins the tab
 *   strip below the stage as a third Tab (same add/seek/delete behaviors).
 * - <=880px: the curriculum rail drops; a header Curriculum button flips
 *   the content between a single-pane curriculum list and the lesson view,
 *   and picking a lesson returns to the lesson pane.
 * - <=640px: player chrome, prev/next, tree rows, and note controls take
 *   ~40px tap targets; the header wraps the progress caption under the
 *   title; no hover-only affordances anywhere (tooltips annotate, never
 *   gate).
 *
 * Container policy (structured learning archetype): frame-first chrome;
 * Cards are reserved for the stage surface and the quiz question blocks.
 * Curriculum rows, transcript lines, and notes are plain rows — no
 * card-in-card nesting. The stage is locked colorScheme dark so its chrome
 * reads correctly in both themes.
 *
 * Color policy: the lesson stage is a deliberately scheme-locked dark
 * surface (mock video art) — \`colorScheme: 'dark'\` is set on styles.stage,
 * and every raw hex/rgba literal in styles.stage, slideCode, playBubble,
 * chrome, and timecode is intentional: the gradient art, code-slide
 * vignette, play bubble, and bottom chrome/timecode must stay dark in both
 * themes like a real video frame, so they (and the text sitting on them)
 * use literals, not tokens, to keep contrast stable. Everything outside
 * the stage uses Astryx tokens and adapts via light-dark().
 */

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  BookOpenIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleIcon,
  ListChecksIcon,
  LockIcon,
  NotebookPenIcon,
  PauseIcon,
  PlayIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';

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
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  stageCard: {overflow: 'hidden', boxShadow: 'var(--shadow-high)'},
  // The mock frame: layered gradients stand in for the lecture video.
  // Locked to colorScheme dark so chrome tokens read on the dark art.
  // Scheme-locked surface (see "Color policy" in the header): all raw
  // hex/rgba literals in the stage subtree are intentional and must not
  // be converted to theme tokens.
  stage: {
    position: 'relative',
    width: '100%',
    height: '100%',
    colorScheme: 'dark',
    cursor: 'pointer',
    background: [
      'radial-gradient(110% 85% at 24% 20%, rgba(64, 132, 214, 0.40), transparent 60%)',
      'radial-gradient(90% 80% at 78% 72%, rgba(112, 88, 202, 0.32), transparent 58%)',
      'radial-gradient(55% 40% at 50% 90%, rgba(10, 14, 24, 0.85), transparent 70%)',
      'linear-gradient(160deg, #16243A 0%, #121D30 10%, #0B1220 60%, #070B14 100%)',
    ].join(', '),
  },
  // Centered code-slide vignette so the stage reads as a lecture frame.
  slideVignette: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    paddingInline: 'var(--spacing-6)',
  },
  slideCode: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 15,
    lineHeight: 1.7,
    color: 'rgba(214, 228, 248, 0.88)',
    backgroundColor: 'rgba(6, 10, 18, 0.55)',
    border: '1px solid rgba(148, 178, 220, 0.22)',
    borderRadius: 8,
    paddingInline: 20,
    paddingBlock: 14,
    whiteSpace: 'pre',
    overflow: 'hidden',
    maxWidth: '100%',
  },
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
    backgroundColor: 'rgba(8, 10, 16, 0.72)',
    border: '1px solid rgba(255, 255, 255, 0.28)',
    color: '#FFFFFF',
  },
  chrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-3)',
    paddingTop: 'var(--spacing-8)',
    background:
      'linear-gradient(to top, rgba(5, 7, 12, 0.88) 0%, rgba(5, 7, 12, 0.45) 55%, transparent 100%)',
    color: '#FFFFFF',
    cursor: 'default',
  },
  timecode: {
    whiteSpace: 'nowrap',
    color: '#FFFFFF',
    marginInlineStart: 'var(--spacing-2)',
  },
  // <=640px: 28px "sm" chrome grows to 40px tap targets.
  controlTouch: {width: 40, height: 40},
  controlTouchWide: {height: 40},
  // Curriculum tree: module header buttons and lesson rows are real
  // buttons with resets so the rail reads as rows, not chrome.
  moduleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    padding: 'var(--spacing-2)',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 'var(--radius-element)',
    font: 'inherit',
    color: 'inherit',
  },
  moduleBody: {minWidth: 0, flex: 1},
  chevron: {
    display: 'inline-flex',
    transition: 'transform 120ms ease',
    transform: 'rotate(0deg)',
    flexShrink: 0,
  },
  chevronOpen: {transform: 'rotate(90deg)'},
  lessonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 32,
    paddingBlock: 'var(--spacing-1)',
    paddingInlineStart: 'var(--spacing-6)',
    paddingInlineEnd: 'var(--spacing-2)',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 'var(--radius-element)',
    font: 'inherit',
    color: 'inherit',
  },
  lessonRowTouch: {minHeight: 44},
  lessonRowActive: {backgroundColor: 'var(--color-background-gray)'},
  lessonRowLocked: {cursor: 'not-allowed', opacity: 0.55},
  lessonTitle: {minWidth: 0, flex: 1},
  lockNotice: {
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-2)',
  },
  // Quiz option rows: real buttons; feedback tints come from state.
  quizOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 40,
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 'var(--radius-element)',
    font: 'inherit',
    color: 'inherit',
  },
  quizOptionCorrect: {
    borderColor: 'var(--color-success)',
    backgroundColor: 'var(--color-success-muted)',
  },
  quizOptionWrong: {
    borderColor: 'var(--color-error)',
    backgroundColor: 'var(--color-error-muted)',
  },
  quizFeedbackCorrect: {color: 'var(--color-success)'},
  quizFeedbackWrong: {color: 'var(--color-error)'},
  headerProgress: {width: 160},
  transcriptRow: {display: 'flex', gap: 'var(--spacing-3)'},
  transcriptTime: {flexShrink: 0, width: 44, textAlign: 'right'},
  noteBody: {minWidth: 0, flex: 1},
  notesScroll: {minHeight: 0},
};

// ============= DATA =============
// Deterministic fixtures: fixed titles, durations, and seed state. No
// clocks, no randomness, no network media — the stage is CSS gradients.

const COURSE_TITLE = 'TypeScript from Zero to Production';
const COURSE_INSTRUCTOR = 'Rosa Delgado';
/** Completions (any module) required before the gated module unlocks. */
const UNLOCK_THRESHOLD = 16;

interface Lesson {
  id: string;
  title: string;
  durationSec: number;
  kind: 'video' | 'quiz';
  /** Fixed code snippet shown on the mock lecture slide. */
  slide: string;
}

interface CourseModule {
  id: string;
  title: string;
  /** Gated modules stay locked until UNLOCK_THRESHOLD completions. */
  isGated?: boolean;
  lessons: Lesson[];
}

const MODULES: CourseModule[] = [
  {
    id: 'm1',
    title: 'TypeScript Fundamentals',
    lessons: [
      {id: 'l01', title: 'Why TypeScript exists', durationSec: 342, kind: 'video', slide: 'const port: number = 3000;'},
      {id: 'l02', title: 'Setting up the compiler', durationSec: 418, kind: 'video', slide: '{\\n  "strict": true,\\n  "target": "ES2022"\\n}'},
      {id: 'l03', title: 'Primitive and literal types', durationSec: 505, kind: 'video', slide: "type Env = 'dev' | 'prod';"},
      {id: 'l04', title: 'Arrays, tuples, and objects', durationSec: 561, kind: 'video', slide: 'const pair: [string, number]\\n  = ["ok", 200];'},
      {id: 'l05', title: 'Functions and return types', durationSec: 476, kind: 'video', slide: 'function add(a: number,\\n  b: number): number'},
    ],
  },
  {
    id: 'm2',
    title: 'The Type System in Depth',
    lessons: [
      {id: 'l06', title: 'Interfaces vs type aliases', durationSec: 524, kind: 'video', slide: 'interface User {\\n  id: string;\\n  name: string;\\n}'},
      {id: 'l07', title: 'Union and intersection types', durationSec: 447, kind: 'video', slide: 'type Result = Ok & Meta\\n  | Err;'},
      {id: 'l08', title: 'Narrowing and type guards', durationSec: 593, kind: 'video', slide: "if (typeof x === 'string')"},
      {id: 'l09', title: 'Enums and const assertions', durationSec: 388, kind: 'video', slide: 'const ROLES = [\\n  "admin", "viewer"\\n] as const;'},
      {id: 'l10', title: 'Structural typing in practice', durationSec: 456, kind: 'video', slide: 'duckTyped(anything: {quack(): void})'},
    ],
  },
  {
    id: 'm3',
    title: 'Generics and Advanced Types',
    lessons: [
      {id: 'l11', title: 'Generic functions and constraints', durationSec: 617, kind: 'video', slide: 'function first<T>(xs: T[]):\\n  T | undefined'},
      {id: 'l12', title: 'Generic components and defaults', durationSec: 534, kind: 'video', slide: 'class Box<T = string> {\\n  value: T;\\n}'},
      {id: 'l13', title: 'Checkpoint: generics quiz', durationSec: 300, kind: 'quiz', slide: '// 3 questions — all must pass'},
      {id: 'l14', title: 'Mapped and conditional types', durationSec: 662, kind: 'video', slide: 'type Partial<T> = {\\n  [K in keyof T]?: T[K];\\n}'},
      {id: 'l15', title: 'Template literal types', durationSec: 489, kind: 'video', slide: 'type Route = \`/api/\${string}\`;'},
    ],
  },
  {
    id: 'm4',
    title: 'TypeScript with React',
    lessons: [
      {id: 'l16', title: 'Typing props and children', durationSec: 511, kind: 'video', slide: 'function Card({title}:\\n  {title: string})'},
      {id: 'l17', title: 'useState and useReducer types', durationSec: 548, kind: 'video', slide: 'useState<User | null>(null)'},
      {id: 'l18', title: 'Event handlers without any', durationSec: 472, kind: 'video', slide: '(e: React.FormEvent<\\n  HTMLFormElement>) => void'},
      {id: 'l19', title: 'Generic hooks and context', durationSec: 603, kind: 'video', slide: 'createContext<Theme |\\n  undefined>(undefined)'},
      {id: 'l20', title: 'Discriminated unions for UI state', durationSec: 557, kind: 'video', slide: "type Ui = {tag: 'loading'}\\n  | {tag: 'ready'; data: Row[]};"},
    ],
  },
  {
    id: 'm5',
    title: 'Production Patterns',
    isGated: true,
    lessons: [
      {id: 'l21', title: 'Strict mode migration strategy', durationSec: 584, kind: 'video', slide: '"noUncheckedIndexedAccess":\\n  true'},
      {id: 'l22', title: 'Typing API boundaries with zod', durationSec: 626, kind: 'video', slide: 'const User = z.object({\\n  id: z.string()\\n});'},
      {id: 'l23', title: 'Build performance and project refs', durationSec: 542, kind: 'video', slide: '"composite": true'},
      {id: 'l24', title: 'Shipping types in a library', durationSec: 498, kind: 'video', slide: '"types": "./dist/index.d.ts"'},
    ],
  },
];

/** Seeded ~40% complete: all of module 1 and module 2 (10 of 24). */
const INITIALLY_COMPLETED = [
  'l01', 'l02', 'l03', 'l04', 'l05',
  'l06', 'l07', 'l08', 'l09', 'l10',
];

const INITIAL_LESSON_ID = 'l11';
const INITIALLY_EXPANDED = ['m2', 'm3'];

interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'What does the constraint <T extends {id: string}> guarantee inside the function body?',
    options: [
      'T is exactly {id: string} and nothing else',
      'Any T passed in has at least a string id property',
      'T is inferred as string everywhere it appears',
    ],
    correctIndex: 1,
    explanation: 'Constraints set a lower bound: callers can pass richer shapes, and the body can rely on .id existing.',
  },
  {
    id: 'q2',
    prompt: 'Given function first<T>(xs: T[]), what is the inferred T for first([1, 2, 3])?',
    options: ['unknown', 'number[]', 'number'],
    correctIndex: 2,
    explanation: 'T is inferred from the element type of the argument array, so T = number and the return is number | undefined.',
  },
  {
    id: 'q3',
    prompt: 'Why prefer a generic <T> over accepting unknown and casting?',
    options: [
      'Generics preserve the relationship between input and output types',
      'unknown is slower at runtime than a generic',
      'Casting is disallowed under strict mode',
    ],
    correctIndex: 0,
    explanation: 'Generics are erased at runtime — the win is that the compiler links argument and return types with no casts.',
  },
];

/**
 * Fixed sentence banks: each lesson's transcript and instructor notes are
 * derived from these by stable index math — deterministic, no randomness.
 */
const TRANSCRIPT_BANK = [
  'Let us start with where the last lesson left off and restate the goal.',
  'Watch what the compiler says the moment we remove this annotation.',
  'This error message looks noisy, but the last line tells the real story.',
  'Pause here and try the same change in your own editor before moving on.',
  'The key idea: let inference do the work and annotate only boundaries.',
  'Notice the hover type — that is the compiler narrowing in real time.',
  'We will reuse this exact pattern again in the production module.',
  'One common mistake here is reaching for any; resist it and keep going.',
];

const INSTRUCTOR_NOTE_BANK = [
  'Exercise repo branch for this lesson is linked from the course home.',
  'The playground link preloads this lesson’s starting snippet.',
  'Skim the handbook section on this topic before the next checkpoint.',
  'Common pitfall: this compiles under loose mode but fails under strict.',
  'The pattern shown here appears in the final project rubric.',
];

interface SeedNote {
  id: string;
  lessonId: string;
  atSec: number;
  text: string;
}

const SEED_NOTES: SeedNote[] = [
  {id: 'n1', lessonId: 'l08', atSec: 214, text: 'typeof guard narrows both branches — remember for the quiz.'},
  {id: 'n2', lessonId: 'l08', atSec: 471, text: 'in operator works as a guard on union members too.'},
  {id: 'n3', lessonId: 'l11', atSec: 96, text: 'Constraint = lower bound, not exact match.'},
  {id: 'n4', lessonId: 'l12', atSec: 305, text: 'Default type param only kicks in when inference has nothing.'},
];

// ============= HELPERS =============

/** 247 -> "4:07". Minutes never pad; seconds always do. */
function formatTime(totalSec: number): string {
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return \`\${min}:\${sec.toString().padStart(2, '0')}\`;
}

/** Flat, ordered lesson list with owning-module metadata for navigation. */
interface FlatLesson {
  lesson: Lesson;
  moduleId: string;
  moduleTitle: string;
  isGated: boolean;
  /** 1-based "Lesson n of 24" ordinal. */
  ordinal: number;
}

const FLAT_LESSONS: FlatLesson[] = MODULES.flatMap(module =>
  module.lessons.map(lesson => ({
    lesson,
    moduleId: module.id,
    moduleTitle: module.title,
    isGated: module.isGated === true,
    ordinal: 0,
  })),
).map((entry, index) => ({...entry, ordinal: index + 1}));

const TOTAL_LESSONS = FLAT_LESSONS.length;

function flatIndexOf(lessonId: string): number {
  return FLAT_LESSONS.findIndex(entry => entry.lesson.id === lessonId);
}

/** Stable per-lesson transcript: 5 lines at fixed fractions of duration. */
function transcriptFor(flat: FlatLesson): {sec: number; line: string}[] {
  const fractions = [0, 0.18, 0.42, 0.63, 0.85];
  return fractions.map((fraction, lineIndex) => ({
    sec: Math.floor(flat.lesson.durationSec * fraction),
    line: TRANSCRIPT_BANK[(flat.ordinal + lineIndex * 3) % TRANSCRIPT_BANK.length],
  }));
}

/** Stable per-lesson instructor notes: 2 bullets from the fixed bank. */
function instructorNotesFor(flat: FlatLesson): string[] {
  return [
    INSTRUCTOR_NOTE_BANK[flat.ordinal % INSTRUCTOR_NOTE_BANK.length],
    INSTRUCTOR_NOTE_BANK[(flat.ordinal + 2) % INSTRUCTOR_NOTE_BANK.length],
  ];
}

interface PersonalNote {
  id: string;
  lessonId: string;
  atSec: number;
  text: string;
}

// ============= CURRICULUM TREE =============

interface CurriculumTreeProps {
  selectedLessonId: string;
  expandedModuleIds: ReadonlySet<string>;
  completedIds: ReadonlySet<string>;
  isLockedModuleOpen: boolean;
  remainingToUnlock: number;
  isPhone: boolean;
  onToggleModule: (moduleId: string) => void;
  onSelectLesson: (lessonId: string) => void;
}

/**
 * The left rail: module headers with chevrons and live ProgressBars over
 * lesson rows carrying completion checkmarks and duration chips. The gated
 * module renders lock rows until the completion threshold is crossed.
 */
function CurriculumTree({
  selectedLessonId,
  expandedModuleIds,
  completedIds,
  isLockedModuleOpen,
  remainingToUnlock,
  isPhone,
  onToggleModule,
  onSelectLesson,
}: CurriculumTreeProps) {
  return (
    <VStack gap={2}>
      {MODULES.map(module => {
        const isLocked = module.isGated === true && !isLockedModuleOpen;
        const isExpanded = expandedModuleIds.has(module.id);
        const doneCount = module.lessons.filter(lesson =>
          completedIds.has(lesson.id),
        ).length;

        return (
          <VStack key={module.id} gap={0}>
            <button
              type="button"
              style={styles.moduleHeader}
              aria-expanded={isExpanded}
              onClick={() => onToggleModule(module.id)}>
              <span
                style={{
                  ...styles.chevron,
                  ...(isExpanded ? styles.chevronOpen : undefined),
                }}>
                <Icon icon={ChevronRightIcon} size="sm" />
              </span>
              <div style={styles.moduleBody}>
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <Text type="body" weight="semibold" maxLines={1}>
                        {module.title}
                      </Text>
                    </StackItem>
                    {isLocked ? (
                      <Icon icon={LockIcon} size="sm" color="secondary" />
                    ) : (
                      <Text
                        type="supporting"
                        color="secondary"
                        hasTabularNumbers>
                        {doneCount}/{module.lessons.length}
                      </Text>
                    )}
                  </HStack>
                  <ProgressBar
                    value={doneCount}
                    max={module.lessons.length}
                    label={\`\${module.title} progress\`}
                    isLabelHidden
                  />
                </VStack>
              </div>
            </button>

            {isExpanded && isLocked && (
              <div style={styles.lockNotice}>
                <HStack gap={2} vAlign="start">
                  <Icon icon={LockIcon} size="sm" color="secondary" />
                  <Text type="supporting" color="secondary">
                    Locked — complete {remainingToUnlock} more{' '}
                    {remainingToUnlock === 1 ? 'lesson' : 'lessons'} to unlock
                    this module.
                  </Text>
                </HStack>
              </div>
            )}

            {isExpanded &&
              module.lessons.map(lesson => {
                const isDone = completedIds.has(lesson.id);
                const isActive = lesson.id === selectedLessonId;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    disabled={isLocked}
                    aria-current={isActive ? 'true' : undefined}
                    style={{
                      ...styles.lessonRow,
                      ...(isPhone ? styles.lessonRowTouch : undefined),
                      ...(isActive ? styles.lessonRowActive : undefined),
                      ...(isLocked ? styles.lessonRowLocked : undefined),
                    }}
                    onClick={() => onSelectLesson(lesson.id)}>
                    <Icon
                      icon={
                        isLocked
                          ? LockIcon
                          : isDone
                            ? CheckCircle2Icon
                            : lesson.kind === 'quiz'
                              ? ListChecksIcon
                              : CircleIcon
                      }
                      size="sm"
                      color={isDone ? 'success' : 'secondary'}
                    />
                    <span style={styles.lessonTitle}>
                      <Text
                        type="body"
                        maxLines={1}
                        weight={isActive ? 'semibold' : undefined}>
                        {lesson.title}
                      </Text>
                    </span>
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {formatTime(lesson.durationSec)}
                    </Text>
                  </button>
                );
              })}
          </VStack>
        );
      })}
    </VStack>
  );
}

// ============= LESSON STAGE =============

interface LessonStageProps {
  flat: FlatLesson;
  isPlaying: boolean;
  positionSec: number;
  isPhone: boolean;
  onPlayToggle: () => void;
  onSeek: (sec: number) => void;
}

/**
 * The mock lecture frame: gradient art with a fixed code-slide vignette,
 * a paused play overlay, and a chrome bar with scrub Slider + timecode.
 * Clicking the art toggles play (mouse convenience — the chrome play
 * IconButton is the accessible control).
 */
function LessonStage({
  flat,
  isPlaying,
  positionSec,
  isPhone,
  onPlayToggle,
  onSeek,
}: LessonStageProps) {
  const touch = isPhone ? styles.controlTouch : undefined;
  const duration = flat.lesson.durationSec;

  return (
    <Card padding={0} style={styles.stageCard}>
      <AspectRatio ratio={16 / 9}>
        <div style={styles.stage} onClick={onPlayToggle}>
          <div style={styles.slideVignette} aria-hidden>
            <span style={styles.slideCode}>{flat.lesson.slide}</span>
          </div>

          {!isPlaying && (
            <div style={styles.playOverlay} aria-hidden>
              <div style={styles.playBubble}>
                <Icon icon={PlayIcon} size="lg" color="inherit" />
              </div>
            </div>
          )}

          {/* Chrome bar: clicks here must not toggle playback. */}
          <div style={styles.chrome} onClick={event => event.stopPropagation()}>
            <VStack gap={1}>
              <Slider
                label="Seek"
                isLabelHidden
                min={0}
                max={duration}
                step={1}
                value={positionSec}
                onChange={onSeek}
                valueDisplay="none"
                formatValue={value =>
                  \`\${formatTime(value)} of \${formatTime(duration)}\`
                }
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
                <Text type="supporting" hasTabularNumbers style={styles.timecode}>
                  {formatTime(positionSec)} / {formatTime(duration)}
                </Text>
                <StackItem size="fill">{null}</StackItem>
                <Badge
                  label={\`Lesson \${flat.ordinal} of \${TOTAL_LESSONS}\`}
                  variant="info"
                />
              </HStack>
            </VStack>
          </div>
        </div>
      </AspectRatio>
    </Card>
  );
}

// ============= QUIZ CHECKPOINT =============

interface QuizCheckpointProps {
  answers: Record<string, number | undefined>;
  onAnswer: (questionId: string, optionIndex: number) => void;
}

/**
 * The inline checkpoint: 3 fixed questions. Picking an option locks in
 * immediate right/wrong feedback (re-picking is allowed until correct);
 * the parent blocks Next / Mark complete until all three are correct.
 */
function QuizCheckpoint({answers, onAnswer}: QuizCheckpointProps) {
  const correctCount = QUIZ_QUESTIONS.filter(
    question => answers[question.id] === question.correctIndex,
  ).length;

  return (
    <VStack gap={4}>
      <Card padding={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ListChecksIcon} size="md" color="secondary" />
          <StackItem size="fill">
            <Text type="body" weight="semibold">
              Checkpoint — answer all 3 correctly to continue
            </Text>
          </StackItem>
          <Badge
            label={\`\${correctCount}/\${QUIZ_QUESTIONS.length} correct\`}
            variant={
              correctCount === QUIZ_QUESTIONS.length ? 'success' : 'neutral'
            }
          />
        </HStack>
      </Card>

      {QUIZ_QUESTIONS.map((question, questionIndex) => {
        const picked = answers[question.id];
        const isCorrect = picked === question.correctIndex;
        const isWrong = picked != null && !isCorrect;

        return (
          <Card key={question.id} padding={4}>
            <VStack gap={3}>
              <Text type="body" weight="semibold">
                {questionIndex + 1}. {question.prompt}
              </Text>
              <VStack gap={2}>
                {question.options.map((option, optionIndex) => {
                  const isPicked = picked === optionIndex;
                  const showCorrect = isPicked && isCorrect;
                  const showWrong = isPicked && !isCorrect;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={isPicked}
                      style={{
                        ...styles.quizOption,
                        ...(showCorrect ? styles.quizOptionCorrect : undefined),
                        ...(showWrong ? styles.quizOptionWrong : undefined),
                      }}
                      onClick={() => onAnswer(question.id, optionIndex)}>
                      <Icon
                        icon={
                          showCorrect
                            ? CheckCircle2Icon
                            : showWrong
                              ? XCircleIcon
                              : CircleIcon
                        }
                        size="sm"
                        color={
                          showCorrect
                            ? 'success'
                            : showWrong
                              ? 'error'
                              : 'secondary'
                        }
                      />
                      <Text type="body">{option}</Text>
                    </button>
                  );
                })}
              </VStack>
              {isCorrect && (
                <Text type="supporting" style={styles.quizFeedbackCorrect}>
                  Correct — {question.explanation}
                </Text>
              )}
              {isWrong && (
                <Text type="supporting" style={styles.quizFeedbackWrong}>
                  Not quite — pick again. Hint: {question.explanation}
                </Text>
              )}
            </VStack>
          </Card>
        );
      })}
    </VStack>
  );
}

// ============= TRANSCRIPT & INSTRUCTOR NOTES =============

function TranscriptPane({
  flat,
  onSeek,
}: {
  flat: FlatLesson;
  onSeek: (sec: number) => void;
}) {
  if (flat.lesson.kind === 'quiz') {
    return (
      <Text type="supporting" color="secondary">
        Checkpoint lessons have no transcript — answer the questions above to
        continue.
      </Text>
    );
  }
  return (
    <VStack gap={2}>
      {transcriptFor(flat).map(entry => (
        <div key={entry.sec} style={styles.transcriptRow}>
          <span style={styles.transcriptTime}>
            <Button
              label={formatTime(entry.sec)}
              variant="ghost"
              size="sm"
              onClick={() => onSeek(entry.sec)}
            />
          </span>
          <Text type="body">{entry.line}</Text>
        </div>
      ))}
    </VStack>
  );
}

function InstructorNotesPane({flat}: {flat: FlatLesson}) {
  return (
    <VStack gap={2}>
      <Text type="supporting" color="secondary">
        From {COURSE_INSTRUCTOR}:
      </Text>
      {instructorNotesFor(flat).map(note => (
        <HStack key={note} gap={2} vAlign="start">
          <Icon icon={BookOpenIcon} size="sm" color="secondary" />
          <Text type="body">{note}</Text>
        </HStack>
      ))}
    </VStack>
  );
}

// ============= PERSONAL NOTES =============

interface NotesPaneProps {
  flat: FlatLesson;
  notes: PersonalNote[];
  draft: string;
  positionSec: number;
  isPhone: boolean;
  onDraftChange: (text: string) => void;
  onAddNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onSeek: (sec: number) => void;
}

/**
 * The personal notes pad: a TextArea whose Add button stamps the current
 * playback position, over the current lesson's notes (timestamp chips seek
 * the player; each note deletes). Rendered docked at >1280px and as a tab
 * below that.
 */
function NotesPane({
  flat,
  notes,
  draft,
  positionSec,
  isPhone,
  onDraftChange,
  onAddNote,
  onDeleteNote,
  onSeek,
}: NotesPaneProps) {
  const lessonNotes = notes.filter(note => note.lessonId === flat.lesson.id);

  return (
    <VStack gap={3}>
      <TextArea
        label={\`Note at \${formatTime(positionSec)}\`}
        rows={3}
        placeholder="Capture a thought — it will be stamped with the playback position."
        value={draft}
        onChange={onDraftChange}
      />
      <HStack gap={2} vAlign="center">
        <Button
          label={\`Add note at \${formatTime(positionSec)}\`}
          variant="primary"
          size="sm"
          icon={<Icon icon={NotebookPenIcon} size="sm" color="inherit" />}
          isDisabled={draft.trim().length === 0}
          onClick={onAddNote}
          style={isPhone ? styles.controlTouchWide : undefined}
        />
      </HStack>
      <Divider />
      {lessonNotes.length === 0 ? (
        <EmptyState
          icon={<Icon icon={NotebookPenIcon} size="lg" />}
          title="No notes yet"
          description="Notes you add are kept per lesson and stamped with where you were."
        />
      ) : (
        <VStack gap={3} style={styles.notesScroll}>
          {lessonNotes.map(note => (
            <HStack key={note.id} gap={2} vAlign="start">
              <Button
                label={formatTime(note.atSec)}
                variant="secondary"
                size="sm"
                onClick={() => onSeek(note.atSec)}
                style={isPhone ? styles.controlTouchWide : undefined}
              />
              <StackItem size="fill" style={styles.noteBody}>
                <Text type="body">{note.text}</Text>
              </StackItem>
              <IconButton
                label={\`Delete note at \${formatTime(note.atSec)}\`}
                tooltip="Delete note"
                icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => onDeleteNote(note.id)}
                style={isPhone ? styles.controlTouch : undefined}
              />
            </HStack>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function CourseLessonPlayerTemplate() {
  const [selectedLessonId, setSelectedLessonId] = useState(INITIAL_LESSON_ID);
  const [expandedModuleIds, setExpandedModuleIds] = useState<
    ReadonlySet<string>
  >(() => new Set(INITIALLY_EXPANDED));
  const [completedIds, setCompletedIds] = useState<ReadonlySet<string>>(
    () => new Set(INITIALLY_COMPLETED),
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(0);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'transcript' | 'instructor' | 'my-notes'
  >('transcript');
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(true);
  const [notes, setNotes] = useState<PersonalNote[]>(SEED_NOTES);
  const [noteDraft, setNoteDraft] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<
    Record<string, number | undefined>
  >({});
  const [mobileView, setMobileView] = useState<'curriculum' | 'lesson'>(
    'lesson',
  );

  // Responsive contract: <=1280px the docked notes panel folds into the
  // tab strip; <=880px the curriculum rail becomes a single-pane flip;
  // <=640px controls take the 40px tap-target override.
  const isNotesFolded = useMediaQuery('(max-width: 1280px)');
  const isSinglePane = useMediaQuery('(max-width: 880px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  const flatIndex = flatIndexOf(selectedLessonId);
  const flat = FLAT_LESSONS[flatIndex];
  const duration = flat.lesson.durationSec;

  const completedCount = completedIds.size;
  const overallPct = Math.round((completedCount / TOTAL_LESSONS) * 100);
  // Gate: only completions outside the gated module count toward unlock.
  const unlockCredit = FLAT_LESSONS.filter(
    entry => !entry.isGated && completedIds.has(entry.lesson.id),
  ).length;
  const isLockedModuleOpen = unlockCredit >= UNLOCK_THRESHOLD;
  const remainingToUnlock = Math.max(0, UNLOCK_THRESHOLD - unlockCredit);

  const isQuiz = flat.lesson.kind === 'quiz';
  const quizAllCorrect = QUIZ_QUESTIONS.every(
    question => quizAnswers[question.id] === question.correctIndex,
  );
  const isCompleted = completedIds.has(selectedLessonId);

  const prevFlat = flatIndex > 0 ? FLAT_LESSONS[flatIndex - 1] : undefined;
  const nextFlat =
    flatIndex < TOTAL_LESSONS - 1 ? FLAT_LESSONS[flatIndex + 1] : undefined;
  const isNextLocked =
    nextFlat != null && nextFlat.isGated && !isLockedModuleOpen;
  const isNextBlockedByQuiz = isQuiz && !quizAllCorrect;
  const canGoNext = nextFlat != null && !isNextLocked && !isNextBlockedByQuiz;

  // UI animation only: while "playing", advance the playhead one second
  // per second. All fixture data stays fixed; no real media is decoded.
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = setInterval(() => {
      setPositionSec(prev => Math.min(duration, prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  const selectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setPositionSec(0);
    setIsPlaying(false);
    setNoteDraft('');
    if (activeTab === 'transcript' || activeTab === 'instructor') {
      setActiveTab('transcript');
    }
    if (isSinglePane) {
      setMobileView('lesson');
    }
  };

  // Finishing a lesson auto-completes it and, with autoplay on, advances
  // to the next unlocked lesson (quiz checkpoints never auto-advance).
  useEffect(() => {
    if (positionSec < duration || duration === 0 || isQuiz) {
      return;
    }
    setIsPlaying(false);
    setCompletedIds(prev => {
      if (prev.has(selectedLessonId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(selectedLessonId);
      return next;
    });
    if (autoplayNext && nextFlat != null && !isNextLocked) {
      selectLesson(nextFlat.lesson.id);
      setIsPlaying(true);
    }
    // selectLesson is stable-enough for this fixture surface; the effect
    // only fires when the playhead hits the end of the current lesson.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionSec, duration]);

  const toggleModule = (moduleId: string) => {
    setExpandedModuleIds(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleComplete = () => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(selectedLessonId)) {
        next.delete(selectedLessonId);
      } else {
        next.add(selectedLessonId);
      }
      return next;
    });
  };

  const addNote = () => {
    const text = noteDraft.trim();
    if (text.length === 0) {
      return;
    }
    setNotes(prev => [
      ...prev,
      {
        id: \`n-\${prev.length + 1}-\${flat.lesson.id}-\${positionSec}\`,
        lessonId: flat.lesson.id,
        atSec: positionSec,
        text,
      },
    ]);
    setNoteDraft('');
  };

  const handleSeek = (sec: number) => {
    setPositionSec(Math.min(duration, Math.max(0, sec)));
  };

  const noteCountForLesson = notes.filter(
    note => note.lessonId === flat.lesson.id,
  ).length;

  // ---- Curriculum rail (docked panel or single-pane flip) ----

  const curriculum = (
    <CurriculumTree
      selectedLessonId={selectedLessonId}
      expandedModuleIds={expandedModuleIds}
      completedIds={completedIds}
      isLockedModuleOpen={isLockedModuleOpen}
      remainingToUnlock={remainingToUnlock}
      isPhone={isPhone}
      onToggleModule={toggleModule}
      onSelectLesson={selectLesson}
    />
  );

  // ---- Lesson stage + navigation + tab strip ----

  const notesPane = (
    <NotesPane
      flat={flat}
      notes={notes}
      draft={noteDraft}
      positionSec={positionSec}
      isPhone={isPhone}
      onDraftChange={setNoteDraft}
      onAddNote={addNote}
      onDeleteNote={noteId =>
        setNotes(prev => prev.filter(note => note.id !== noteId))
      }
      onSeek={handleSeek}
    />
  );

  const nextTooltip = isNextBlockedByQuiz
    ? 'Answer all 3 checkpoint questions correctly to continue'
    : isNextLocked
      ? \`Complete \${remainingToUnlock} more \${
          remainingToUnlock === 1 ? 'lesson' : 'lessons'
        } to unlock the next module\`
      : nextFlat != null
        ? \`Next: \${nextFlat.lesson.title}\`
        : 'This is the last lesson';

  const navigationRow = (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Button
        label="Previous"
        variant="secondary"
        size="sm"
        icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
        isDisabled={prevFlat == null}
        onClick={() => prevFlat != null && selectLesson(prevFlat.lesson.id)}
        style={isPhone ? styles.controlTouchWide : undefined}
      />
      <Tooltip content={nextTooltip}>
        <Button
          label="Next"
          variant="primary"
          size="sm"
          icon={<Icon icon={ChevronRightIcon} size="sm" color="inherit" />}
          isDisabled={!canGoNext}
          onClick={() => nextFlat != null && selectLesson(nextFlat.lesson.id)}
          style={isPhone ? styles.controlTouchWide : undefined}
        />
      </Tooltip>
      <StackItem size="fill">{null}</StackItem>
      <Switch
        label="Autoplay next"
        value={autoplayNext}
        onChange={checked => setAutoplayNext(checked)}
      />
      <Button
        label={isCompleted ? 'Completed' : 'Mark complete'}
        variant={isCompleted ? 'secondary' : 'primary'}
        size="sm"
        icon={
          <Icon
            icon={isCompleted ? CheckCircle2Icon : CheckIcon}
            size="sm"
            color="inherit"
          />
        }
        isDisabled={isQuiz && !quizAllCorrect && !isCompleted}
        onClick={toggleComplete}
        style={isPhone ? styles.controlTouchWide : undefined}
      />
    </HStack>
  );

  const tabStrip = (
    <VStack gap={3}>
      <TabList
        value={activeTab}
        onChange={value =>
          setActiveTab(value as 'transcript' | 'instructor' | 'my-notes')
        }
        size="sm">
        <Tab value="transcript" label="Transcript" />
        <Tab value="instructor" label="Lesson notes" />
        {isNotesFolded ? (
          <Tab
            value="my-notes"
            label="My notes"
            endContent={<Badge label={String(noteCountForLesson)} />}
          />
        ) : null}
      </TabList>
      {activeTab === 'transcript' && (
        <TranscriptPane flat={flat} onSeek={handleSeek} />
      )}
      {activeTab === 'instructor' && <InstructorNotesPane flat={flat} />}
      {activeTab === 'my-notes' && isNotesFolded && notesPane}
    </VStack>
  );

  const lessonPane = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {flat.moduleTitle} · Lesson {flat.ordinal} of {TOTAL_LESSONS}
        </Text>
        <Heading level={1}>{flat.lesson.title}</Heading>
      </VStack>

      {isQuiz ? (
        <QuizCheckpoint
          answers={quizAnswers}
          onAnswer={(questionId, optionIndex) =>
            setQuizAnswers(prev => ({...prev, [questionId]: optionIndex}))
          }
        />
      ) : (
        <LessonStage
          flat={flat}
          isPlaying={isPlaying}
          positionSec={positionSec}
          isPhone={isPhone}
          onPlayToggle={() => setIsPlaying(prev => !prev)}
          onSeek={handleSeek}
        />
      )}

      {navigationRow}
      <Divider />
      {tabStrip}
    </VStack>
  );

  const content =
    isSinglePane && mobileView === 'curriculum' ? (
      <VStack gap={3}>
        <Heading level={2}>Curriculum</Heading>
        {curriculum}
      </VStack>
    ) : (
      lessonPane
    );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap={isPhone ? 'wrap' : undefined}>
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={2} accessibilityLevel={1}>
                  {COURSE_TITLE}
                </Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {completedCount} of {TOTAL_LESSONS} lessons · {overallPct}%
                  complete
                </Text>
              </VStack>
            </StackItem>
            {!isPhone && (
              <StackItem size="static">
                <div style={styles.headerProgress}>
                  <ProgressBar
                    value={completedCount}
                    max={TOTAL_LESSONS}
                    label="Course progress"
                    isLabelHidden
                  />
                </div>
              </StackItem>
            )}
            {isSinglePane && (
              <Button
                label={mobileView === 'curriculum' ? 'Lesson' : 'Curriculum'}
                variant="secondary"
                size="sm"
                icon={<Icon icon={BookOpenIcon} size="sm" color="inherit" />}
                onClick={() =>
                  setMobileView(prev =>
                    prev === 'curriculum' ? 'lesson' : 'curriculum',
                  )
                }
                style={isPhone ? styles.controlTouchWide : undefined}
              />
            )}
            {!isNotesFolded && (
              <ToggleButton
                label="My notes"
                tooltip={isNotesPanelOpen ? 'Hide notes panel' : 'Show notes panel'}
                icon={<Icon icon={NotebookPenIcon} size="sm" color="inherit" />}
                size="sm"
                isPressed={isNotesPanelOpen}
                onPressedChange={setIsNotesPanelOpen}
              />
            )}
          </HStack>
        </LayoutHeader>
      }
      start={
        !isSinglePane ? (
          <LayoutPanel hasDivider width={300} label="Curriculum">
            {curriculum}
          </LayoutPanel>
        ) : undefined
      }
      end={
        !isNotesFolded && isNotesPanelOpen ? (
          <LayoutPanel hasDivider width={320} label="My notes">
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <Icon icon={NotebookPenIcon} size="md" color="secondary" />
                <Heading level={3} accessibilityLevel={2}>
                  My notes
                </Heading>
                <Badge label={String(noteCountForLesson)} />
              </HStack>
              {notesPane}
            </VStack>
          </LayoutPanel>
        ) : undefined
      }
      content={<LayoutContent padding={6}>{content}</LayoutContent>}
    />
  );
}
`;export{e as default};