// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a seeded 5-question community
 *   survey with one branch rule, plus canned response tallies for the
 *   results tab — 48 respondents, per-question bars/distributions/quotes)
 * @output Poll & Survey Builder: a two-pane builder where the left pane
 *   is the question-list editor (numbered question cards with a type
 *   Token, inline question-text input, per-choice add/remove/reorder
 *   rows, and per-type settings — required Switch, rating scale range,
 *   choice limit) and the right pane is a live respondent preview that
 *   re-renders on every edit. Question reordering works through
 *   accessible move-up/move-down controls plus a per-card MoreMenu with
 *   "Move to position N" items, resequencing both panes in sync. A
 *   branch-rule composer builds "If Q1 = No, skip to Q4" from three
 *   dropdowns; Test mode makes the preview clickable one question at a
 *   time and honors the rule (with a "skipped" note) on the way through.
 *   A header TabList flips Build to a Results view rendering fixture
 *   response bars, a rating distribution, ranked-first tallies, and
 *   open-text quotes per question. Deleting a question removes it (and
 *   any rules it anchors) with an undo toast; deleting every question
 *   reveals the build-from-scratch empty state with the add-question
 *   menu and a restore-sample action.
 * @position Page template; emitted by `astryx template poll-survey-builder`
 *
 * Frame: Layout height="fill". LayoutHeader owns the chrome: editable
 * survey-title TextInput, question-count caption, Build/Results TabList,
 * and the Test survey toggle Button. Body on the Build tab: LayoutContent
 * scrolls the editor column (question cards, branch-rule composer,
 * add-question menu row); end LayoutPanel 400 hosts the live preview.
 * The Results tab drops the panel and renders a single centered column
 * of summary tiles and per-question result cards.
 *
 * Container policy: editor questions and result blocks are Cards (each
 * question is a self-contained authoring unit); the preview pane is a
 * plain scroll region so it reads like a respondent page, not chrome.
 *
 * Responsive contract:
 * - > 900px: editor column | preview LayoutPanel 400 side by side.
 * - <= 900px: the preview panel undocks; a two-tab Editor/Preview
 *   switcher appears under the header so both panes stay reachable one
 *   at a time, and entering Test mode auto-switches to the Preview tab.
 * - <= 640px: the header wraps (title row, then tabs + test button);
 *   option move/remove IconButtons, rating pills, and add-question
 *   buttons keep >= 40px tap targets; no interaction is hover-only —
 *   every move/delete affordance is an always-visible button or menu.
 * - Editor column caps at 760 and centers; result bars are fluid CSS
 *   widths so nothing forces horizontal overflow at 375px. The undo
 *   toast is fixed bottom-center and never wider than the viewport
 *   minus gutters.
 * - Fixture policy: fixed data only; no clocks, randomness, or network
 *   assets. All tallies and quotes are canned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardListIcon,
  GitBranchIcon,
  GripVerticalIcon,
  ListChecksIcon,
  ListOrderedIcon,
  PlayIcon,
  PlusIcon,
  SparklesIcon,
  StarIcon,
  TypeIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Editor column: authoring surfaces read best with a max width.
  editorColumn: {
    width: '100%',
    maxWidth: 760,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // Results column is wider — bars want room to read as bars.
  resultsColumn: {
    width: '100%',
    maxWidth: 840,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  headerTitleInput: {maxWidth: 320, width: '100%'},
  // The preview panel scrolls independently of the editor column.
  panelScroll: {height: '100%', overflowY: 'auto'},
  // Selected question cards get an accent ring so the editor/preview
  // pairing is legible at a glance.
  selectedRing: {
    boxShadow: '0 0 0 2px var(--color-accent)',
    borderRadius: 'var(--radius-container)',
  },
  cardWrap: {borderRadius: 'var(--radius-container)'},
  // Decorative drag grip — real reordering runs through the buttons.
  grip: {color: 'var(--color-text-secondary)', display: 'inline-flex'},
  // Preview questions render inside an unstyled button so build mode
  // click-to-select stays keyboardable.
  previewButton: {
    display: 'block',
    width: '100%',
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    font: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
  },
  previewQuestion: {
    borderLeft: '3px solid transparent',
    paddingLeft: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
  },
  previewQuestionSelected: {
    borderLeftColor: 'var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Static respondent glyphs: 16px circle (single choice) / square
  // (multi choice) outlines.
  choiceGlyph: {
    width: 16,
    height: 16,
    boxSizing: 'border-box',
    border: '2px solid var(--color-border)',
    flexShrink: 0,
  },
  glyphRound: {borderRadius: '50%'},
  glyphSquare: {borderRadius: 4},
  // Open-text placeholder box in the static preview.
  openTextGhost: {
    border: 'var(--border-width) dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  // Branch composer + add-question menu share the dashed authoring frame.
  dashedForm: {
    border: 'var(--border-width) dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  chipWrap: {flexWrap: 'wrap'},
  // Results bars: fluid track + per-type fill; widths are percentages so
  // 375px never overflows.
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    width: '100%',
  },
  barFill: {height: '100%', borderRadius: 999},
  barLabelCell: {minWidth: 0},
  barCountCell: {width: 72, flexShrink: 0, textAlign: 'right'},
  // Undo toast: fixed bottom-center, capped to the viewport.
  toast: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 50,
    maxWidth: 'calc(100vw - 32px)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  // Touch targets: interactive pills/buttons grow to ~40px on narrow.
  narrowTap: {minHeight: 40, minWidth: 40},
  ratingPillRow: {flexWrap: 'wrap'},
  testFooterNote: {fontStyle: 'italic'},
};

// ============= DATA =============
// Deterministic fixtures: fixed values, no clocks, no randomness.

type QuestionType = 'multiple_choice' | 'rating' | 'open_text' | 'ranked';

interface ChoiceOption {
  id: string;
  text: string;
}

interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  isRequired: boolean;
  /** multiple_choice + ranked only. */
  options: ChoiceOption[];
  /** rating only: top of the 1..N scale. */
  scaleMax: number;
  /** multiple_choice only: 1 = single answer, 0 = no limit. */
  choiceLimit: number;
}

interface BranchRule {
  id: string;
  /** Single-answer multiple-choice question the rule watches. */
  sourceId: string;
  /** Option on the source that fires the rule. */
  optionId: string;
  /** Question the respondent skips forward to. */
  targetId: string;
}

const TYPE_META: Record<
  QuestionType,
  {
    label: string;
    chip: 'blue' | 'yellow' | 'green' | 'purple';
    bar: string;
    icon: typeof ListChecksIcon;
    hint: string;
  }
> = {
  multiple_choice: {
    label: 'Multiple choice',
    chip: 'blue',
    bar: '#3b82f6',
    icon: ListChecksIcon,
    hint: 'Respondents pick from a fixed set of choices.',
  },
  rating: {
    label: 'Rating scale',
    chip: 'yellow',
    bar: '#f59e0b',
    icon: StarIcon,
    hint: 'A 1-to-N scale; you choose the top of the range.',
  },
  open_text: {
    label: 'Open text',
    chip: 'green',
    bar: '#22c55e',
    icon: TypeIcon,
    hint: 'A free-form written answer.',
  },
  ranked: {
    label: 'Ranked',
    chip: 'purple',
    bar: '#a855f7',
    icon: ListOrderedIcon,
    hint: 'Respondents order the choices from most to least wanted.',
  },
};

const QUESTION_TYPES: QuestionType[] = [
  'multiple_choice',
  'rating',
  'open_text',
  'ranked',
];

const SCALE_OPTIONS = [
  {value: '5', label: '1 to 5'},
  {value: '7', label: '1 to 7'},
  {value: '10', label: '1 to 10'},
];

const LIMIT_OPTIONS = [
  {value: '1', label: 'Single answer'},
  {value: '2', label: 'Up to 2 choices'},
  {value: '3', label: 'Up to 3 choices'},
  {value: '0', label: 'No limit'},
];

const SEED_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q-attend',
    type: 'multiple_choice',
    text: 'Did you attend a neighborhood event in the past year?',
    isRequired: true,
    options: [
      {id: 'opt-yes', text: 'Yes'},
      {id: 'opt-no', text: 'No'},
    ],
    scaleMax: 5,
    choiceLimit: 1,
  },
  {
    id: 'q-which',
    type: 'multiple_choice',
    text: 'Which events did you attend?',
    isRequired: false,
    options: [
      {id: 'opt-block', text: 'Summer block party'},
      {id: 'opt-market', text: 'Farmers market Saturdays'},
      {id: 'opt-cleanup', text: 'Park cleanup day'},
      {id: 'opt-lights', text: 'Holiday lights walk'},
    ],
    scaleMax: 5,
    choiceLimit: 2,
  },
  {
    id: 'q-sat',
    type: 'rating',
    text: 'How satisfied are you with community events overall?',
    isRequired: true,
    options: [],
    scaleMax: 5,
    choiceLimit: 1,
  },
  {
    id: 'q-rank',
    type: 'ranked',
    text: 'Rank what you want more of next season',
    isRequired: false,
    options: [
      {id: 'opt-music', text: 'Live music nights'},
      {id: 'opt-food', text: 'Food truck rallies'},
      {id: 'opt-kids', text: 'Kids activities'},
      {id: 'opt-volunteer', text: 'Volunteer projects'},
    ],
    scaleMax: 5,
    choiceLimit: 1,
  },
  {
    id: 'q-open',
    type: 'open_text',
    text: 'Anything else the events committee should know?',
    isRequired: false,
    options: [],
    scaleMax: 5,
    choiceLimit: 1,
  },
];

// Seeded branch rule: "If Q1 = No, skip to Q4" — non-attendees jump
// straight to the ranking question.
const SEED_RULES: BranchRule[] = [
  {id: 'rule-1', sourceId: 'q-attend', optionId: 'opt-no', targetId: 'q-rank'},
];

interface QuestionResults {
  answered: number;
  skipped: number;
  /** Option tallies (multiple choice) or ranked-first tallies (ranked). */
  bars?: {label: string; count: number}[];
  /** Rating tallies indexed 1..scaleMax. */
  distribution?: number[];
  /** Sample open-text answers. */
  quotes?: string[];
}

const TOTAL_RESPONSES = 48;
const COMPLETION_RATE = '83%';
const MEDIAN_TIME = '2m 40s';

// Canned response data for the seeded questions. Questions added in the
// builder have no fixture rows and render a "no responses yet" note.
const RESULTS: Record<string, QuestionResults> = {
  'q-attend': {
    answered: 48,
    skipped: 0,
    bars: [
      {label: 'Yes', count: 31},
      {label: 'No', count: 17},
    ],
  },
  'q-which': {
    answered: 31,
    skipped: 17,
    bars: [
      {label: 'Summer block party', count: 24},
      {label: 'Farmers market Saturdays', count: 19},
      {label: 'Park cleanup day', count: 11},
      {label: 'Holiday lights walk', count: 9},
    ],
  },
  'q-sat': {
    answered: 44,
    skipped: 4,
    distribution: [2, 4, 9, 17, 12],
  },
  'q-rank': {
    answered: 48,
    skipped: 0,
    bars: [
      {label: 'Live music nights', count: 14},
      {label: 'Volunteer projects', count: 13},
      {label: 'Food truck rallies', count: 12},
      {label: 'Kids activities', count: 9},
    ],
  },
  'q-open': {
    answered: 26,
    skipped: 22,
    quotes: [
      'More weekday evening options for people who work Saturdays.',
      'The cleanup day needs more trash grabbers — we ran out by 9am.',
      'Loved the lights walk; please bring back the cocoa stand.',
    ],
  },
};

/** Move index -> index+delta inside a copied array (no-op off the ends). */
function moveItem<T>(items: T[], index: number, delta: number): T[] {
  const next = index + delta;
  if (index < 0 || next < 0 || next >= items.length) {
    return items;
  }
  const copy = [...items];
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

type TestAnswer = string | string[];

/** Whether a test-mode answer satisfies the question's required flag. */
function isAnswered(
  question: SurveyQuestion,
  answer: TestAnswer | undefined,
): boolean {
  switch (question.type) {
    case 'multiple_choice':
      return question.choiceLimit === 1
        ? typeof answer === 'string' && answer !== ''
        : Array.isArray(answer) && answer.length > 0;
    case 'rating':
      return typeof answer === 'string' && answer !== '';
    case 'open_text':
      return typeof answer === 'string' && answer.trim() !== '';
    case 'ranked':
      // The default order is a legitimate ranking, so ranked questions
      // never block the Next button.
      return true;
  }
}

// ============= EDITOR CARD =============

/**
 * One question card in the editor pane: header row (drag grip, QN badge,
 * type Token, move buttons, MoreMenu), question-text input, per-type
 * option rows and settings. Focusing or clicking anywhere inside selects
 * the question so the preview highlight tracks the card being edited.
 */
function QuestionEditorCard({
  question,
  index,
  total,
  isSelected,
  isCompact,
  onSelect,
  onPatch,
  onMove,
  onMoveTo,
  onDuplicate,
  onDelete,
}: {
  question: SurveyQuestion;
  index: number;
  total: number;
  isSelected: boolean;
  /** <=640px: move/remove controls keep ~40px tap targets. */
  isCompact: boolean;
  onSelect: () => void;
  onPatch: (patch: Partial<SurveyQuestion>) => void;
  onMove: (delta: number) => void;
  onMoveTo: (index: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const meta = TYPE_META[question.type];
  const hasOptions =
    question.type === 'multiple_choice' || question.type === 'ranked';
  const tapStyle = isCompact ? styles.narrowTap : undefined;

  const patchOption = (optionId: string, text: string) => {
    onPatch({
      options: question.options.map(option =>
        option.id === optionId ? {...option, text} : option,
      ),
    });
  };

  const addOption = () => {
    // Deterministic id: derived from the question id + option count.
    const id = `${question.id}-opt-${question.options.length + 1}`;
    onPatch({
      options: [
        ...question.options,
        {id, text: `Option ${question.options.length + 1}`},
      ],
    });
  };

  const removeOption = (optionIndex: number) => {
    onPatch({
      options: question.options.filter((_, i) => i !== optionIndex),
    });
  };

  const moveOption = (optionIndex: number, delta: number) => {
    onPatch({options: moveItem(question.options, optionIndex, delta)});
  };

  const moveTargets = Array.from({length: total}, (_, i) => i).filter(
    i => i !== index,
  );

  return (
    // Selection is a pointer/focus convenience layered over the real
    // controls inside; every action in the card is a labelled button.
    <div
      style={isSelected ? {...styles.cardWrap, ...styles.selectedRing} : styles.cardWrap}
      onClick={onSelect}
      onFocusCapture={onSelect}>
      <Card padding={4} width="100%">
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <span style={styles.grip} aria-hidden>
              <Icon icon={GripVerticalIcon} size="sm" color="inherit" />
            </span>
            <Badge label={`Q${index + 1}`} variant="neutral" />
            <Token label={meta.label} color={meta.chip} size="sm" />
            {question.isRequired && (
              <Badge label="required" variant="warning" />
            )}
            <StackItem size="fill" />
            <IconButton
              label={`Move question ${index + 1} up`}
              tooltip="Move up"
              icon={<Icon icon={ChevronUpIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              isDisabled={index === 0}
              onClick={() => onMove(-1)}
            />
            <IconButton
              label={`Move question ${index + 1} down`}
              tooltip="Move down"
              icon={<Icon icon={ChevronDownIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              isDisabled={index === total - 1}
              onClick={() => onMove(1)}
            />
            <MoreMenu
              label={`Question ${index + 1} actions`}
              size={isCompact ? 'lg' : 'sm'}
              items={[
                {label: 'Duplicate question', onClick: onDuplicate},
                ...moveTargets.map(target => ({
                  label: `Move to position ${target + 1}`,
                  onClick: () => onMoveTo(target),
                })),
                {label: 'Delete question', onClick: onDelete},
              ]}
            />
          </HStack>

          <TextInput
            label={`Question ${index + 1} text`}
            isLabelHidden
            value={question.text}
            onChange={text => onPatch({text})}
            placeholder="Write your question…"
          />

          {hasOptions && (
            <VStack gap={2}>
              <Text type="label" size="sm" color="secondary">
                {question.type === 'ranked' ? 'Items to rank' : 'Choices'}
              </Text>
              {question.options.map((option, optionIndex) => (
                <HStack key={option.id} gap={1} vAlign="center">
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {optionIndex + 1}.
                  </Text>
                  <StackItem size="fill">
                    <TextInput
                      label={`Choice ${optionIndex + 1}`}
                      isLabelHidden
                      size="sm"
                      value={option.text}
                      onChange={text => patchOption(option.id, text)}
                    />
                  </StackItem>
                  <IconButton
                    label={`Move choice ${optionIndex + 1} up`}
                    tooltip="Move up"
                    icon={
                      <Icon icon={ChevronUpIcon} size="sm" color="inherit" />
                    }
                    variant="ghost"
                    size="sm"
                    isDisabled={optionIndex === 0}
                    onClick={() => moveOption(optionIndex, -1)}
                  />
                  <IconButton
                    label={`Move choice ${optionIndex + 1} down`}
                    tooltip="Move down"
                    icon={
                      <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                    }
                    variant="ghost"
                    size="sm"
                    isDisabled={optionIndex === question.options.length - 1}
                    onClick={() => moveOption(optionIndex, 1)}
                  />
                  <IconButton
                    label={`Remove choice ${optionIndex + 1}`}
                    tooltip={
                      question.options.length <= 2
                        ? 'Keep at least two choices'
                        : 'Remove'
                    }
                    icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                    variant="ghost"
                    size="sm"
                    isDisabled={question.options.length <= 2}
                    onClick={() => removeOption(optionIndex)}
                  />
                </HStack>
              ))}
              <HStack>
                <Button
                  label="Add choice"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={PlusIcon} size="sm" />}
                  style={tapStyle}
                  onClick={addOption}
                />
              </HStack>
            </VStack>
          )}

          <Divider />

          {/* ---- Per-type settings row ---- */}
          <HStack gap={4} vAlign="center" wrap="wrap">
            <Switch
              label="Required"
              value={question.isRequired}
              onChange={isRequired => onPatch({isRequired})}
            />
            {question.type === 'rating' && (
              <Selector
                label="Scale range"
                options={SCALE_OPTIONS}
                value={String(question.scaleMax)}
                onChange={value => onPatch({scaleMax: Number(value)})}
              />
            )}
            {question.type === 'multiple_choice' && (
              <Selector
                label="Choice limit"
                options={LIMIT_OPTIONS}
                value={String(question.choiceLimit)}
                onChange={value => onPatch({choiceLimit: Number(value)})}
              />
            )}
            <StackItem size="fill" />
            {question.type === 'multiple_choice' &&
              question.choiceLimit === 1 && (
                <Tooltip content="Single-answer questions can anchor a branch rule below">
                  <HStack gap={1} vAlign="center">
                    <Icon icon={GitBranchIcon} size="sm" />
                    <Text type="supporting" color="secondary">
                      branchable
                    </Text>
                  </HStack>
                </Tooltip>
              )}
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}

// ============= PREVIEW (BUILD MODE) =============

/**
 * Static respondent rendering of one question: choice glyph rows,
 * rating pills, ranked list, or the open-text ghost box. Clicking it
 * selects the matching editor card.
 */
function PreviewStaticQuestion({
  question,
  number,
  isSelected,
  onSelect,
}: {
  question: SurveyQuestion;
  number: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const glyph =
    question.choiceLimit === 1
      ? {...styles.choiceGlyph, ...styles.glyphRound}
      : {...styles.choiceGlyph, ...styles.glyphSquare};

  const limitCaption =
    question.type !== 'multiple_choice' || question.choiceLimit === 1
      ? null
      : question.choiceLimit === 0
        ? 'Choose all that apply'
        : `Choose up to ${question.choiceLimit}`;

  return (
    <button
      type="button"
      style={styles.previewButton}
      onClick={onSelect}
      aria-label={`Edit question ${number}: ${question.text || 'Untitled question'}`}>
      <div
        style={
          isSelected
            ? {...styles.previewQuestion, ...styles.previewQuestionSelected}
            : styles.previewQuestion
        }>
        <VStack gap={2}>
          <Text type="label">
            {number}. {question.text || 'Untitled question'}
            {question.isRequired ? ' *' : ''}
          </Text>
          {limitCaption && (
            <Text type="supporting" color="secondary">
              {limitCaption}
            </Text>
          )}

          {question.type === 'multiple_choice' && (
            <VStack gap={2}>
              {question.options.map(option => (
                <HStack key={option.id} gap={2} vAlign="center">
                  <span style={glyph} aria-hidden />
                  <Text type="body">{option.text}</Text>
                </HStack>
              ))}
            </VStack>
          )}

          {question.type === 'rating' && (
            <VStack gap={1}>
              <HStack gap={1} style={styles.ratingPillRow}>
                {Array.from({length: question.scaleMax}, (_, i) => (
                  <Token key={i} label={String(i + 1)} size="sm" />
                ))}
              </HStack>
              <Text type="supporting" color="secondary">
                1 = not satisfied · {question.scaleMax} = very satisfied
              </Text>
            </VStack>
          )}

          {question.type === 'ranked' && (
            <VStack gap={2}>
              {question.options.map((option, i) => (
                <HStack key={option.id} gap={2} vAlign="center">
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    #{i + 1}
                  </Text>
                  <span style={styles.grip} aria-hidden>
                    <Icon icon={GripVerticalIcon} size="sm" color="inherit" />
                  </span>
                  <Text type="body">{option.text}</Text>
                </HStack>
              ))}
            </VStack>
          )}

          {question.type === 'open_text' && (
            <div style={styles.openTextGhost}>
              <Text type="supporting" color="secondary">
                Respondents type their answer here
              </Text>
            </div>
          )}
        </VStack>
      </div>
    </button>
  );
}

// ============= RESULTS =============

function ResultBarRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <div style={styles.barLabelCell}>
            <Text type="body" maxLines={1}>
              {label}
            </Text>
          </div>
        </StackItem>
        <div style={styles.barCountCell}>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {count} · {percent}%
          </Text>
        </div>
      </HStack>
      <div style={styles.barTrack} role="presentation">
        <div
          style={{
            ...styles.barFill,
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </VStack>
  );
}

/** One per-question results card: bars, distribution, or quotes. */
function ResultsQuestionCard({
  question,
  number,
}: {
  question: SurveyQuestion;
  number: number;
}) {
  const meta = TYPE_META[question.type];
  const results = RESULTS[question.id];

  return (
    <Card padding={4} width="100%">
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Badge label={`Q${number}`} variant="neutral" />
          <Token label={meta.label} color={meta.chip} size="sm" />
          <StackItem size="fill" />
          {results && (
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {results.answered} answered
              {results.skipped > 0 ? ` · ${results.skipped} skipped` : ''}
            </Text>
          )}
        </HStack>
        <Text type="label">{question.text || 'Untitled question'}</Text>

        {!results && (
          <Text type="supporting" color="secondary">
            No responses yet — this question was added after the last
            collection window.
          </Text>
        )}

        {results?.bars && (
          <VStack gap={2}>
            {results.bars.map(bar => (
              <ResultBarRow
                key={bar.label}
                label={
                  question.type === 'ranked'
                    ? `${bar.label} — ranked first`
                    : bar.label
                }
                count={bar.count}
                total={results.answered}
                color={meta.bar}
              />
            ))}
          </VStack>
        )}

        {results?.distribution && (
          <VStack gap={2}>
            {results.distribution.map((count, i) => (
              <ResultBarRow
                key={i}
                label={`${i + 1} ${i === 0 ? '(not satisfied)' : ''}${
                  i === results.distribution!.length - 1
                    ? '(very satisfied)'
                    : ''
                }`.trim()}
                count={count}
                total={results.answered}
                color={meta.bar}
              />
            ))}
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Average{' '}
              {(
                results.distribution.reduce(
                  (sum, count, i) => sum + count * (i + 1),
                  0,
                ) / results.answered
              ).toFixed(2)}{' '}
              of {results.distribution.length}
            </Text>
          </VStack>
        )}

        {results?.quotes && (
          <VStack gap={2}>
            {results.quotes.map(quote => (
              <Text key={quote} type="body" color="secondary">
                “{quote}”
              </Text>
            ))}
            <Text type="supporting" color="secondary">
              Showing 3 of {results.answered} written answers
            </Text>
          </VStack>
        )}
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

interface UndoInfo {
  question: SurveyQuestion;
  index: number;
  /** Branch rules that referenced the question and were removed with it. */
  rules: BranchRule[];
}

export default function PollSurveyBuilderTemplate() {
  const [surveyTitle, setSurveyTitle] = useState(
    'Maplewood community events survey',
  );
  const [questions, setQuestions] = useState<SurveyQuestion[]>(SEED_QUESTIONS);
  const [rules, setRules] = useState<BranchRule[]>(SEED_RULES);
  const [selectedId, setSelectedId] = useState<string | null>('q-attend');
  const [activeTab, setActiveTab] = useState<'build' | 'results'>('build');
  const [idCounter, setIdCounter] = useState(1);
  const [undoInfo, setUndoInfo] = useState<UndoInfo | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Branch composer drafts.
  const [ruleSourceId, setRuleSourceId] = useState('');
  const [ruleOptionId, setRuleOptionId] = useState('');
  const [ruleTargetId, setRuleTargetId] = useState('');

  // Test mode: trail is the visited-question index history (Back pops).
  const [isTestMode, setIsTestMode] = useState(false);
  const [testTrail, setTestTrail] = useState<number[]>([0]);
  const [testAnswers, setTestAnswers] = useState<Record<string, TestAnswer>>(
    {},
  );
  const [isTestDone, setIsTestDone] = useState(false);

  // Responsive contract: <=900px undocks the preview panel behind a
  // two-tab switcher; <=640px grows tap targets and wraps the header.
  const isNarrow = useMediaQuery('(max-width: 900px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const [narrowPane, setNarrowPane] = useState<'editor' | 'preview'>('editor');

  const questionIndexById = useMemo(() => {
    const map = new Map<string, number>();
    questions.forEach((question, index) => map.set(question.id, index));
    return map;
  }, [questions]);

  // A rule is live when its source is still a single-answer multiple
  // choice, the option still exists, and the target still sits after the
  // source. Reordering can silently invalidate a rule — surface that.
  const ruleStatus = useMemo(() => {
    const status = new Map<string, string | null>();
    for (const rule of rules) {
      const sourceIndex = questionIndexById.get(rule.sourceId);
      const targetIndex = questionIndexById.get(rule.targetId);
      const source =
        sourceIndex === undefined ? undefined : questions[sourceIndex];
      if (source === undefined || targetIndex === undefined) {
        status.set(rule.id, 'a question was removed');
      } else if (source.type !== 'multiple_choice' || source.choiceLimit !== 1) {
        status.set(rule.id, 'source is no longer single answer');
      } else if (!source.options.some(option => option.id === rule.optionId)) {
        status.set(rule.id, 'the choice was removed');
      } else if (targetIndex <= (sourceIndex as number)) {
        status.set(rule.id, 'target now sits before the source');
      } else {
        status.set(rule.id, null);
      }
    }
    return status;
  }, [rules, questions, questionIndexById]);

  // ---- Question CRUD ----

  const patchQuestion = (id: string, patch: Partial<SurveyQuestion>) => {
    setQuestions(prev =>
      prev.map(question =>
        question.id === id ? {...question, ...patch} : question,
      ),
    );
  };

  const addQuestion = (type: QuestionType) => {
    const base = idCounter;
    setIdCounter(base + 1);
    const id = `nq-${base}`;
    const needsOptions = type === 'multiple_choice' || type === 'ranked';
    const question: SurveyQuestion = {
      id,
      type,
      text: '',
      isRequired: false,
      options: needsOptions
        ? [
            {id: `${id}-opt-1`, text: 'Option 1'},
            {id: `${id}-opt-2`, text: 'Option 2'},
          ]
        : [],
      scaleMax: 5,
      choiceLimit: 1,
    };
    setQuestions(prev => [...prev, question]);
    setSelectedId(id);
    setAnnouncement(`Added a ${TYPE_META[type].label} question`);
  };

  const duplicateQuestion = (id: string) => {
    const index = questionIndexById.get(id);
    if (index === undefined) {
      return;
    }
    const source = questions[index];
    const base = idCounter;
    setIdCounter(base + 1);
    const copyId = `nq-${base}`;
    const copy: SurveyQuestion = {
      ...source,
      id: copyId,
      text: source.text === '' ? '' : `${source.text} (copy)`,
      options: source.options.map((option, i) => ({
        id: `${copyId}-opt-${i + 1}`,
        text: option.text,
      })),
    };
    setQuestions(prev => {
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
    setSelectedId(copyId);
    setAnnouncement(`Duplicated question ${index + 1}`);
  };

  const deleteQuestion = (id: string) => {
    const index = questionIndexById.get(id);
    if (index === undefined) {
      return;
    }
    const question = questions[index];
    const droppedRules = rules.filter(
      rule => rule.sourceId === id || rule.targetId === id,
    );
    setQuestions(prev => prev.filter(item => item.id !== id));
    setRules(prev =>
      prev.filter(rule => rule.sourceId !== id && rule.targetId !== id),
    );
    if (selectedId === id) {
      setSelectedId(null);
    }
    setUndoInfo({question, index, rules: droppedRules});
    setAnnouncement(`Deleted question ${index + 1}`);
  };

  const undoDelete = () => {
    if (undoInfo === null) {
      return;
    }
    setQuestions(prev => {
      const next = [...prev];
      next.splice(Math.min(undoInfo.index, next.length), 0, undoInfo.question);
      return next;
    });
    setRules(prev => [...prev, ...undoInfo.rules]);
    setSelectedId(undoInfo.question.id);
    setUndoInfo(null);
    setAnnouncement('Restored the deleted question');
  };

  const moveQuestion = (id: string, delta: number) => {
    const index = questionIndexById.get(id);
    if (index === undefined) {
      return;
    }
    setQuestions(prev => moveItem(prev, index, delta));
    setAnnouncement(
      `Moved question ${index + 1} to position ${index + 1 + delta}`,
    );
  };

  const moveQuestionTo = (id: string, target: number) => {
    const index = questionIndexById.get(id);
    if (index === undefined || index === target) {
      return;
    }
    setQuestions(prev => moveItem(prev, index, target - index));
    setAnnouncement(`Moved question ${index + 1} to position ${target + 1}`);
  };

  const restoreSample = () => {
    setQuestions(SEED_QUESTIONS);
    setRules(SEED_RULES);
    setSelectedId('q-attend');
    setUndoInfo(null);
    setAnnouncement('Restored the sample survey');
  };

  // ---- Branch rules ----

  const branchSources = questions.filter(
    question =>
      question.type === 'multiple_choice' && question.choiceLimit === 1,
  );
  const ruleSource = questions.find(question => question.id === ruleSourceId);
  const ruleSourceIndex = ruleSource
    ? (questionIndexById.get(ruleSource.id) ?? -1)
    : -1;
  const ruleTargets =
    ruleSourceIndex >= 0 ? questions.slice(ruleSourceIndex + 1) : [];
  const canAddRule =
    ruleSource !== undefined &&
    ruleSource.options.some(option => option.id === ruleOptionId) &&
    ruleTargets.some(question => question.id === ruleTargetId);

  const addRule = () => {
    if (!canAddRule) {
      return;
    }
    const base = idCounter;
    setIdCounter(base + 1);
    setRules(prev => [
      ...prev,
      {
        id: `nr-${base}`,
        sourceId: ruleSourceId,
        optionId: ruleOptionId,
        targetId: ruleTargetId,
      },
    ]);
    setRuleSourceId('');
    setRuleOptionId('');
    setRuleTargetId('');
    setAnnouncement('Added a branch rule');
  };

  const describeRule = (rule: BranchRule): string => {
    const sourceIndex = questionIndexById.get(rule.sourceId);
    const targetIndex = questionIndexById.get(rule.targetId);
    const source =
      sourceIndex === undefined ? undefined : questions[sourceIndex];
    const option = source?.options.find(item => item.id === rule.optionId);
    const sourceLabel =
      sourceIndex === undefined ? 'a removed question' : `Q${sourceIndex + 1}`;
    const targetLabel =
      targetIndex === undefined ? 'a removed question' : `Q${targetIndex + 1}`;
    return `If ${sourceLabel} = ${option?.text ?? 'a removed choice'}, skip to ${targetLabel}`;
  };

  // ---- Test mode ----

  const testIndex = testTrail[testTrail.length - 1] ?? 0;
  const testQuestion = questions[testIndex];

  const resetTest = () => {
    setTestTrail([0]);
    setTestAnswers({});
    setIsTestDone(false);
  };

  const toggleTestMode = () => {
    const next = !isTestMode;
    setIsTestMode(next);
    resetTest();
    if (next) {
      // Narrow viewports show one pane at a time; the test run lives in
      // the preview pane.
      setNarrowPane('preview');
      setActiveTab('build');
    }
  };

  const advanceTest = () => {
    if (testQuestion === undefined) {
      return;
    }
    const answer = testAnswers[testQuestion.id];
    let nextIndex = testIndex + 1;
    if (
      testQuestion.type === 'multiple_choice' &&
      testQuestion.choiceLimit === 1 &&
      typeof answer === 'string'
    ) {
      const rule = rules.find(
        item =>
          item.sourceId === testQuestion.id &&
          item.optionId === answer &&
          ruleStatus.get(item.id) === null,
      );
      if (rule) {
        const targetIndex = questionIndexById.get(rule.targetId);
        if (targetIndex !== undefined && targetIndex > testIndex) {
          nextIndex = targetIndex;
        }
      }
    }
    if (nextIndex >= questions.length) {
      setIsTestDone(true);
    } else {
      setTestTrail(prev => [...prev, nextIndex]);
    }
  };

  const backTest = () => {
    setTestTrail(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
    setIsTestDone(false);
  };

  const setTestAnswer = (questionId: string, answer: TestAnswer) => {
    setTestAnswers(prev => ({...prev, [questionId]: answer}));
  };

  const testCanAdvance =
    testQuestion !== undefined &&
    (!testQuestion.isRequired ||
      isAnswered(testQuestion, testAnswers[testQuestion.id]));

  // Branch note: when the previous step jumped more than one question,
  // tell the tester which questions the rule skipped.
  const previousTestIndex =
    testTrail.length > 1 ? testTrail[testTrail.length - 2] : null;
  const skippedNote =
    previousTestIndex !== null && testIndex - previousTestIndex > 1
      ? testIndex - previousTestIndex === 2
        ? `Branch rule skipped Q${previousTestIndex + 2}`
        : `Branch rule skipped Q${previousTestIndex + 2}–Q${testIndex}`
      : null;

  // ---- Panes ----

  const addMenu = (
    <div style={styles.dashedForm}>
      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary">
          Add question
        </Text>
        <HStack gap={2} style={styles.chipWrap}>
          {QUESTION_TYPES.map(type => {
            const meta = TYPE_META[type];
            return (
              <Tooltip key={type} content={meta.hint}>
                <Button
                  label={meta.label}
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={meta.icon} size="sm" />}
                  style={isCompact ? styles.narrowTap : undefined}
                  onClick={() => addQuestion(type)}
                />
              </Tooltip>
            );
          })}
        </HStack>
      </VStack>
    </div>
  );

  const branchComposer = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={GitBranchIcon} size="sm" />
        <Heading level={3}>Branch logic</Heading>
        <Text type="supporting" color="secondary">
          {rules.length === 0
            ? 'no rules — every respondent sees every question'
            : `${rules.length} rule${rules.length === 1 ? '' : 's'}`}
        </Text>
      </HStack>
      {rules.map(rule => {
        const problem = ruleStatus.get(rule.id) ?? null;
        return (
          <HStack key={rule.id} gap={2} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Text type="body">{describeRule(rule)}</Text>
                {problem !== null && (
                  <Tooltip content={`Inactive: ${problem}`}>
                    <Badge label="inactive" variant="warning" />
                  </Tooltip>
                )}
              </HStack>
            </StackItem>
            <IconButton
              label={`Remove rule: ${describeRule(rule)}`}
              tooltip="Remove rule"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => {
                setRules(prev => prev.filter(item => item.id !== rule.id));
                setAnnouncement('Removed a branch rule');
              }}
            />
          </HStack>
        );
      })}
      <div style={styles.dashedForm}>
        <VStack gap={3}>
          <Text type="label" size="sm" color="secondary">
            New rule — single-answer questions only
          </Text>
          <HStack gap={3} vAlign="end" wrap="wrap">
            <Selector
              label="If question"
              options={[
                {value: '', label: 'Choose…'},
                ...branchSources.map(question => ({
                  value: question.id,
                  label: `Q${(questionIndexById.get(question.id) ?? 0) + 1}: ${
                    question.text || 'Untitled'
                  }`,
                })),
              ]}
              value={ruleSourceId}
              onChange={value => {
                setRuleSourceId(value);
                setRuleOptionId('');
                setRuleTargetId('');
              }}
            />
            <Selector
              label="equals"
              options={[
                {value: '', label: 'Choose…'},
                ...(ruleSource?.options ?? []).map(option => ({
                  value: option.id,
                  label: option.text,
                })),
              ]}
              value={ruleOptionId}
              onChange={setRuleOptionId}
            />
            <Selector
              label="skip to"
              options={[
                {value: '', label: 'Choose…'},
                ...ruleTargets.map(question => ({
                  value: question.id,
                  label: `Q${(questionIndexById.get(question.id) ?? 0) + 1}: ${
                    question.text || 'Untitled'
                  }`,
                })),
              ]}
              value={ruleTargetId}
              onChange={setRuleTargetId}
            />
            <Button
              label="Add rule"
              size="sm"
              icon={<Icon icon={PlusIcon} size="sm" />}
              isDisabled={!canAddRule}
              onClick={addRule}
            />
          </HStack>
          <Text type="supporting" color="secondary">
            Skip targets must come after the source question; reordering
            that breaks a rule marks it inactive instead of deleting it.
          </Text>
        </VStack>
      </div>
    </VStack>
  );

  const editorPane = (
    <VStack gap={4} style={styles.editorColumn}>
      {questions.length === 0 ? (
        <VStack gap={4}>
          <EmptyState
            icon={<Icon icon={ClipboardListIcon} size="lg" />}
            title="Start your survey"
            description="Add your first question below, or bring back the sample community survey to explore the builder."
          />
          {addMenu}
          <HStack>
            <Button
              label="Restore sample survey"
              variant="secondary"
              size="sm"
              icon={<Icon icon={SparklesIcon} size="sm" />}
              onClick={restoreSample}
            />
          </HStack>
        </VStack>
      ) : (
        <>
          {questions.map((question, index) => (
            <QuestionEditorCard
              key={question.id}
              question={question}
              index={index}
              total={questions.length}
              isSelected={question.id === selectedId}
              isCompact={isCompact}
              onSelect={() => setSelectedId(question.id)}
              onPatch={patch => patchQuestion(question.id, patch)}
              onMove={delta => moveQuestion(question.id, delta)}
              onMoveTo={target => moveQuestionTo(question.id, target)}
              onDuplicate={() => duplicateQuestion(question.id)}
              onDelete={() => deleteQuestion(question.id)}
            />
          ))}
          {addMenu}
          <Divider />
          {branchComposer}
        </>
      )}
    </VStack>
  );

  // ---- Preview pane (static or test run) ----

  const staticPreview = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>{surveyTitle || 'Untitled survey'}</Heading>
        <Text type="supporting" color="secondary">
          {questions.length === 0
            ? 'Questions you add will appear here as respondents see them.'
            : `${questions.length} question${questions.length === 1 ? '' : 's'} · * required`}
        </Text>
      </VStack>
      {questions.map((question, index) => (
        <PreviewStaticQuestion
          key={question.id}
          question={question}
          number={index + 1}
          isSelected={question.id === selectedId}
          onSelect={() => setSelectedId(question.id)}
        />
      ))}
    </VStack>
  );

  const testAnswerControls = (question: SurveyQuestion) => {
    const answer = testAnswers[question.id];
    switch (question.type) {
      case 'multiple_choice': {
        if (question.choiceLimit === 1) {
          return (
            <RadioList
              label={question.text || 'Untitled question'}
              value={typeof answer === 'string' ? answer : ''}
              onChange={value => setTestAnswer(question.id, value)}>
              {question.options.map(option => (
                <RadioListItem
                  key={option.id}
                  label={option.text}
                  value={option.id}
                />
              ))}
            </RadioList>
          );
        }
        const selected = Array.isArray(answer) ? answer : [];
        return (
          <CheckboxList
            label={question.text || 'Untitled question'}
            description={
              question.choiceLimit === 0
                ? 'Choose all that apply'
                : `Choose up to ${question.choiceLimit}`
            }
            value={selected}
            onChange={values => {
              // Enforce the choice limit by refusing extra additions.
              if (
                question.choiceLimit !== 0 &&
                values.length > question.choiceLimit
              ) {
                return;
              }
              setTestAnswer(question.id, values);
            }}>
            {question.options.map(option => (
              <CheckboxListItem
                key={option.id}
                label={option.text}
                value={option.id}
              />
            ))}
          </CheckboxList>
        );
      }
      case 'rating':
        return (
          <VStack gap={1}>
            <HStack gap={1} style={styles.ratingPillRow}>
              {Array.from({length: question.scaleMax}, (_, i) => {
                const value = String(i + 1);
                return (
                  <Token
                    key={value}
                    label={value}
                    size="sm"
                    color={answer === value ? 'yellow' : 'default'}
                    style={isCompact ? styles.narrowTap : undefined}
                    onClick={() => setTestAnswer(question.id, value)}
                  />
                );
              })}
            </HStack>
            <Text type="supporting" color="secondary">
              1 = not satisfied · {question.scaleMax} = very satisfied
            </Text>
          </VStack>
        );
      case 'open_text':
        return (
          <TextArea
            label={question.text || 'Untitled question'}
            isLabelHidden
            rows={4}
            placeholder="Type your answer…"
            value={typeof answer === 'string' ? answer : ''}
            onChange={value => setTestAnswer(question.id, value)}
          />
        );
      case 'ranked': {
        const order =
          Array.isArray(answer) && answer.length === question.options.length
            ? answer
            : question.options.map(option => option.id);
        const byId = new Map(
          question.options.map(option => [option.id, option]),
        );
        return (
          <VStack gap={2}>
            {order.map((optionId, i) => (
              <HStack key={optionId} gap={2} vAlign="center">
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  #{i + 1}
                </Text>
                <StackItem size="fill">
                  <Text type="body">{byId.get(optionId)?.text ?? ''}</Text>
                </StackItem>
                <IconButton
                  label={`Rank ${byId.get(optionId)?.text ?? 'item'} higher`}
                  tooltip="Rank higher"
                  icon={<Icon icon={ChevronUpIcon} size="sm" color="inherit" />}
                  variant="ghost"
                  size={isCompact ? 'lg' : 'sm'}
                  isDisabled={i === 0}
                  onClick={() =>
                    setTestAnswer(question.id, moveItem(order, i, -1))
                  }
                />
                <IconButton
                  label={`Rank ${byId.get(optionId)?.text ?? 'item'} lower`}
                  tooltip="Rank lower"
                  icon={
                    <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                  }
                  variant="ghost"
                  size={isCompact ? 'lg' : 'sm'}
                  isDisabled={i === order.length - 1}
                  onClick={() =>
                    setTestAnswer(question.id, moveItem(order, i, 1))
                  }
                />
              </HStack>
            ))}
          </VStack>
        );
      }
    }
  };

  const testPreview = (
    <VStack gap={4}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <Badge label="Test mode" variant="blue" />
          <Text type="supporting" color="secondary">
            answers are not recorded
          </Text>
        </HStack>
        <Heading level={2}>{surveyTitle || 'Untitled survey'}</Heading>
      </VStack>

      {isTestDone || testQuestion === undefined ? (
        <Card padding={5} width="100%">
          <VStack gap={3}>
            <Heading level={3}>End of survey</Heading>
            <Text type="body" color="secondary">
              You answered {Object.keys(testAnswers).length} of{' '}
              {questions.length} questions
              {rules.some(rule => ruleStatus.get(rule.id) === null)
                ? ' — branch rules may have skipped the rest.'
                : '.'}
            </Text>
            <HStack gap={2}>
              <Button label="Restart test" size="sm" onClick={resetTest} />
              <Button
                label="Exit test mode"
                variant="secondary"
                size="sm"
                onClick={toggleTestMode}
              />
            </HStack>
          </VStack>
        </Card>
      ) : (
        <Card padding={5} width="100%">
          <VStack gap={4}>
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Question {testIndex + 1} of {questions.length}
              </Text>
              {testQuestion.isRequired && (
                <Badge label="required" variant="warning" />
              )}
            </HStack>
            {skippedNote !== null && (
              <HStack gap={1} vAlign="center">
                <Icon icon={GitBranchIcon} size="sm" />
                <Text type="supporting" color="secondary">
                  {skippedNote}
                </Text>
              </HStack>
            )}
            <Text type="label">
              {testIndex + 1}. {testQuestion.text || 'Untitled question'}
            </Text>
            {testAnswerControls(testQuestion)}
            <Divider />
            <HStack gap={2} vAlign="center">
              <Button
                label="Back"
                variant="secondary"
                size="sm"
                isDisabled={testTrail.length <= 1}
                onClick={backTest}
              />
              <StackItem size="fill">
                {!testCanAdvance && (
                  <Text
                    type="supporting"
                    color="secondary"
                    style={styles.testFooterNote}>
                    Answer to continue — this question is required.
                  </Text>
                )}
              </StackItem>
              <Button
                label={
                  testIndex === questions.length - 1 ? 'Finish' : 'Next'
                }
                variant="primary"
                size="sm"
                isDisabled={!testCanAdvance}
                onClick={advanceTest}
              />
            </HStack>
          </VStack>
        </Card>
      )}
    </VStack>
  );

  const previewPane = isTestMode ? testPreview : staticPreview;

  // ---- Results tab ----

  const resultsPane = (
    <VStack gap={4} style={styles.resultsColumn}>
      <HStack gap={3} wrap="wrap">
        <StackItem size="fill">
          <Card padding={4} width="100%">
            <VStack gap={1}>
              <Text type="supporting" color="secondary">
                Responses
              </Text>
              <Heading level={2}>{TOTAL_RESPONSES}</Heading>
            </VStack>
          </Card>
        </StackItem>
        <StackItem size="fill">
          <Card padding={4} width="100%">
            <VStack gap={1}>
              <Text type="supporting" color="secondary">
                Completion rate
              </Text>
              <Heading level={2}>{COMPLETION_RATE}</Heading>
            </VStack>
          </Card>
        </StackItem>
        <StackItem size="fill">
          <Card padding={4} width="100%">
            <VStack gap={1}>
              <Text type="supporting" color="secondary">
                Median time
              </Text>
              <Heading level={2}>{MEDIAN_TIME}</Heading>
            </VStack>
          </Card>
        </StackItem>
      </HStack>
      {questions.length === 0 ? (
        <EmptyState
          icon={<Icon icon={ClipboardListIcon} size="lg" />}
          title="No questions"
          description="Add questions on the Build tab to see their results here."
        />
      ) : (
        questions.map((question, index) => (
          <ResultsQuestionCard
            key={question.id}
            question={question}
            number={index + 1}
          />
        ))
      )}
    </VStack>
  );

  // ---- Build tab body: two panes wide, tab-switched panes narrow ----

  const buildContent = isNarrow ? (
    <VStack gap={4}>
      <TabList
        value={narrowPane}
        onChange={value => setNarrowPane(value as 'editor' | 'preview')}
        size="sm">
        <Tab value="editor" label="Editor" />
        <Tab
          value="preview"
          label={isTestMode ? 'Preview · testing' : 'Preview'}
        />
      </TabList>
      {narrowPane === 'editor' ? editorPane : previewPane}
    </VStack>
  ) : (
    editorPane
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={1}>
                <div style={styles.headerTitleInput}>
                  <TextInput
                    label="Survey title"
                    isLabelHidden
                    size="sm"
                    value={surveyTitle}
                    onChange={setSurveyTitle}
                    placeholder="Untitled survey"
                  />
                </div>
                <Text type="supporting" color="secondary">
                  {questions.length} question
                  {questions.length === 1 ? '' : 's'} · {rules.length} branch
                  rule{rules.length === 1 ? '' : 's'}
                </Text>
              </VStack>
            </StackItem>
            <TabList
              value={activeTab}
              onChange={value => setActiveTab(value as 'build' | 'results')}
              size="sm">
              <Tab value="build" label="Build" />
              <Tab
                value="results"
                label={`Results · ${TOTAL_RESPONSES}`}
              />
            </TabList>
            {activeTab === 'build' && (
              <Button
                label={isTestMode ? 'Exit test' : 'Test survey'}
                variant={isTestMode ? 'secondary' : 'primary'}
                size="sm"
                icon={
                  <Icon icon={isTestMode ? XIcon : PlayIcon} size="sm" />
                }
                isDisabled={!isTestMode && questions.length === 0}
                onClick={toggleTestMode}
              />
            )}
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          {activeTab === 'results' ? resultsPane : buildContent}

          {/* Visually hidden live region: reorder/delete/add feedback for
              screen readers, mirroring the kanban-board idiom. */}
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>

          {/* Undo toast for question deletion. */}
          {undoInfo !== null && (
            <div style={styles.toast} role="status">
              <Card padding={3}>
                <HStack gap={3} vAlign="center">
                  <Text type="body" maxLines={1}>
                    Deleted “
                    {undoInfo.question.text || 'Untitled question'}”
                  </Text>
                  <Button
                    label="Undo"
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={Undo2Icon} size="sm" />}
                    onClick={undoDelete}
                  />
                  <IconButton
                    label="Dismiss"
                    tooltip="Dismiss"
                    icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setUndoInfo(null)}
                  />
                </HStack>
              </Card>
            </div>
          )}
        </LayoutContent>
      }
      end={
        activeTab === 'build' && !isNarrow ? (
          <LayoutPanel
            width={400}
            hasDivider
            label="Respondent preview"
            padding={4}>
            <div style={styles.panelScroll}>{previewPane}</div>
          </LayoutPanel>
        ) : undefined
      }
    />
  );
}
