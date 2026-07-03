// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one ramen recipe — 'Weeknight Shoyu
 *   Ramen', 14 ingredients in three sections with base quantities stored
 *   as 24ths at 4 servings, 9 cook steps whose text is built from
 *   text/ingredient/timer segments, three embedded timer chips — Simmer
 *   20 min, Boil eggs 7 min, Cook noodles 3 min — and one pre-seeded
 *   paused timer parked at 12:44; no clocks, no randomness, no images)
 * @output Recipe cook-mode surface: a left 300px ingredients rail with a
 *   2/4/6/8 servings SegmentedControl that live-rescales every quantity
 *   with fraction-aware formatting ('1 1/2 cups', never 1.5), grouped
 *   section rows with prep-note CheckboxInputs that check off as prepped
 *   under a running 'N/14 prepped' Badge; a large center step card showing
 *   one active step — 'Step N of 9' eyebrow, clickable progress dots with
 *   completed dots dimmed, the step sentence with ingredient amounts
 *   inlined as tinted highlights that rescale with the rail, and inline
 *   timer chips that read live countdowns once tapped — advanced/rewound
 *   by Back/Next buttons or the dots, with an 'All 9 steps' Collapsible
 *   where completed rows dim; and a right 300px timer rail stacking live
 *   countdown Cards (mm:ss readout, elapsed ProgressBar, pause/resume,
 *   +1:00, dismiss) where finished timers flash green until dismissed. A
 *   Present toggle hides both rails and enlarges the step text
 * @position Page template; emitted by `astryx template recipe-cook-mode`
 *
 * Frame: Layout height="fill". LayoutHeader carries the recipe chrome
 * (brand tile, title, serves/time meta, prepped Badge, Present toggle).
 * LayoutPanel start 300 is the ingredients rail; LayoutPanel end 300 is
 * the timer stack; LayoutContent scrolls a centered 760px step column.
 * Choose this over form-wizard when the steps are a linear *performance*
 * (cooking along, spawning timers) rather than data entry, and over
 * onboarding-guided-install when quantities must rescale live instead of
 * commands being copied.
 *
 * Responsive contract:
 * - >1024px: ingredients rail 300 | step column (760 cap) | timer rail 300.
 * - <=1024px: the timer rail folds beneath the step card as the same
 *   TimerCard stack, so pause/+1:00/dismiss stay reachable; the
 *   ingredients rail narrows to 280.
 * - <=640px: single-pane fallback — both rails drop and a full-width
 *   Ingredients | Cook | Timers SegmentedControl swaps panes (the Timers
 *   segment carries a live count); checkboxes grow to md, step nav
 *   buttons and progress dots grow to 40px-tall tap targets, and the
 *   header meta wraps. Nothing is hover-only; every Tooltip annotates a
 *   focusable control.
 * - Presenting (any width): both rails and the pane switcher hide, the
 *   column widens to 880, step text jumps 18px → 30px (24px on phones),
 *   and running timers surface as compact flashing pills inside the step
 *   card so countdowns stay visible without the rail.
 * - All countdown readouts and rail amounts keep tabular numbers so
 *   nothing jitters while timers tick.
 *
 * Container policy (cook-along archetype): frame-first chrome; the only
 * cards are the active step card and the timer stack entries — the
 * ingredient rail is dense checkbox rows, never 14 tiny cards.
 *
 * Fixture policy: fixed data only. Timers are useState UI state (one 1s
 * interval ticks every running timer and drives the done-state flash);
 * ids come from a counter, never Date.now or Math.random.
 */

import {useEffect, useState, type CSSProperties} from 'react';

import {
  BellRingIcon,
  CheckIcon,
  ChefHatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Maximize2Icon,
  Minimize2Icon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
  TimerIcon,
  XIcon,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered step column; widens in presentation mode.
  column: {
    width: '100%',
    maxWidth: 760,
    marginInline: 'auto',
  },
  columnPresenting: {
    maxWidth: 880,
  },
  // Recipe wordmark tile in the page header.
  brandTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  // The step sentence: plain flow so ingredient highlights and timer
  // chips sit inline; font size is set at render time (18 / 24 / 30px).
  stepText: {
    lineHeight: 1.6,
    color: 'var(--color-text)',
  },
  // Inline ingredient amount: soft blue highlight so rescaled quantities
  // pop out of the sentence without breaking the reading flow.
  inlineAmount: {
    backgroundColor: 'var(--color-background-blue)',
    borderRadius: 4,
    paddingInline: 4,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  // Inline timer chip wrapper keeps the Button in the text flow.
  inlineChip: {
    display: 'inline-flex',
    verticalAlign: 'middle',
    marginInline: 2,
  },
  // Progress dots: 28px hit areas on pointers, 40px tall on phones.
  dotButton: {
    width: 28,
    height: 28,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
    borderRadius: 'var(--radius-full)',
  },
  dotButtonNarrow: {
    width: 32,
    height: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 'var(--radius-full)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Completed dots dim toward green; the active dot stretches to a pill.
  dotDone: {
    border: 'var(--border-width) solid var(--color-success)',
    backgroundColor: 'var(--color-success)',
    opacity: 0.45,
  },
  dotActive: {
    width: 22,
    border: 'var(--border-width) solid var(--color-accent)',
    backgroundColor: 'var(--color-accent)',
  },
  // Big tabular countdown readout on timer cards.
  timerReadout: {
    fontSize: 30,
    fontWeight: 600,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text)',
  },
  // Done timers flash: solid green frame, background alternates each tick.
  timerCardDone: {
    border: 'var(--border-width) solid var(--color-border-green)',
    borderRadius: 'var(--radius-container)',
  },
  timerCardFlashOn: {
    backgroundColor: 'var(--color-background-green)',
  },
  // Compact presenting-mode timer pill (label + live mm:ss).
  timerPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    paddingInline: 12,
    minHeight: 40,
    background: 'transparent',
    cursor: 'pointer',
    fontVariantNumeric: 'tabular-nums',
  },
  timerPillDone: {
    border: 'var(--border-width) solid var(--color-border-green)',
  },
  // Dimmed completed rows in the All-steps list.
  stepRowDone: {
    opacity: 0.55,
  },
  // <=640px: grow sm controls to 40px hit targets; glyphs stay sm.
  buttonTapTarget: {height: 40},
  iconTapTarget: {width: 40, height: 40},
};

// ============= QUANTITY MATH =============
// Quantities are stored as 24ths at the 4-serving base. 24 is divisible
// by 2, 3, 4, 6, 8 and every base amount uses an even count of 24ths, so
// scaling by 2/4, 6/4, or 8/4 servings always lands on a whole number of
// 24ths — fractions render exactly ('1 1/2 cups'), never as 1.5.

const Q = 24;
const BASE_SERVINGS = 4;
const SERVING_OPTIONS = [2, 4, 6, 8];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** 24ths -> fraction string: 36 -> "1 1/2", 9 -> "3/8", 48 -> "2". */
function formatQty24(n24: number): string {
  const whole = Math.floor(n24 / Q);
  const rem = n24 % Q;
  if (rem === 0) {
    return String(whole);
  }
  const g = gcd(rem, Q);
  const fraction = `${rem / g}/${Q / g}`;
  return whole > 0 ? `${whole} ${fraction}` : fraction;
}

/** m:ss for timer readouts (764 -> "12:44"). */
function formatSeconds(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ============= DATA =============
// Deterministic fixtures: one ramen recipe, 14 ingredients, 9 steps.

const RECIPE_TITLE = 'Weeknight Shoyu Ramen';
const RECIPE_TIME = '45 min';

type SectionId = 'broth' | 'tare' | 'toppings';

const SECTIONS: {id: SectionId; label: string}[] = [
  {id: 'broth', label: 'Broth'},
  {id: 'tare', label: 'Tare & noodles'},
  {id: 'toppings', label: 'Toppings'},
];

interface Ingredient {
  id: string;
  section: SectionId;
  /** Rail name ("low-sodium chicken stock"). */
  name: string;
  /** Shorter name for inline step text ("chicken stock"). */
  shortName: string;
  /** Base quantity at 4 servings, in 24ths. Always even. */
  qty24: number;
  /** Unit when the scaled amount is <= 1 ('' for countable items). */
  unitOne: string;
  /** Unit when the scaled amount is > 1. */
  unitMany: string;
  prepNote?: string;
}

const INGREDIENTS: Ingredient[] = [
  // --- Broth ---
  {
    id: 'stock',
    section: 'broth',
    name: 'low-sodium chicken stock',
    shortName: 'chicken stock',
    qty24: 6 * Q,
    unitOne: 'cup',
    unitMany: 'cups',
  },
  {
    id: 'shiitake',
    section: 'broth',
    name: 'dried shiitake mushrooms',
    shortName: 'dried shiitakes',
    qty24: 6 * Q,
    unitOne: '',
    unitMany: '',
    prepNote: 'wiped clean',
  },
  {
    id: 'kombu',
    section: 'broth',
    name: 'kombu',
    shortName: 'kombu',
    qty24: 1 * Q,
    unitOne: 'sheet',
    unitMany: 'sheets',
  },
  {
    id: 'garlic',
    section: 'broth',
    name: 'garlic',
    shortName: 'garlic',
    qty24: 4 * Q,
    unitOne: 'clove',
    unitMany: 'cloves',
    prepNote: 'smashed',
  },
  {
    id: 'ginger',
    section: 'broth',
    name: 'fresh ginger',
    shortName: 'ginger',
    qty24: 2 * Q,
    unitOne: 'tbsp',
    unitMany: 'tbsp',
    prepNote: 'sliced into coins',
  },
  // --- Tare & noodles ---
  {
    id: 'miso',
    section: 'tare',
    name: 'white miso paste',
    shortName: 'white miso',
    qty24: 3 * Q,
    unitOne: 'tbsp',
    unitMany: 'tbsp',
  },
  {
    id: 'soy',
    section: 'tare',
    name: 'soy sauce',
    shortName: 'soy sauce',
    qty24: Q / 4, // 1/4 cup at 4 servings
    unitOne: 'cup',
    unitMany: 'cups',
  },
  {
    id: 'mirin',
    section: 'tare',
    name: 'mirin',
    shortName: 'mirin',
    qty24: 2 * Q,
    unitOne: 'tbsp',
    unitMany: 'tbsp',
  },
  {
    id: 'noodles',
    section: 'tare',
    name: 'fresh ramen noodles',
    shortName: 'ramen noodles',
    qty24: 4 * Q,
    unitOne: 'bundle',
    unitMany: 'bundles',
  },
  {
    id: 'sesame-oil',
    section: 'tare',
    name: 'toasted sesame oil',
    shortName: 'sesame oil',
    qty24: 1 * Q,
    unitOne: 'tbsp',
    unitMany: 'tbsp',
  },
  // --- Toppings ---
  {
    id: 'eggs',
    section: 'toppings',
    name: 'large eggs',
    shortName: 'eggs',
    qty24: 4 * Q,
    unitOne: '',
    unitMany: '',
  },
  {
    id: 'scallions',
    section: 'toppings',
    name: 'scallions',
    shortName: 'scallions',
    qty24: 4 * Q,
    unitOne: '',
    unitMany: '',
    prepNote: 'thinly sliced',
  },
  {
    id: 'nori',
    section: 'toppings',
    name: 'nori',
    shortName: 'nori',
    qty24: 2 * Q,
    unitOne: 'sheet',
    unitMany: 'sheets',
  },
  {
    id: 'corn',
    section: 'toppings',
    name: 'corn kernels',
    shortName: 'corn',
    qty24: 1 * Q,
    unitOne: 'cup',
    unitMany: 'cups',
    prepNote: 'drained',
  },
];

const INGREDIENT_BY_ID = new Map(INGREDIENTS.map(item => [item.id, item]));

/** Scale a base quantity to the chosen servings (always exact 24ths). */
function scaledQty24(ingredient: Ingredient, servings: number): number {
  return (ingredient.qty24 * servings) / BASE_SERVINGS;
}

/** "1 1/2 cups" — fraction-aware amount plus the right unit form. */
function formatAmount(ingredient: Ingredient, servings: number): string {
  const n24 = scaledQty24(ingredient, servings);
  const qty = formatQty24(n24);
  const unit = n24 > Q ? ingredient.unitMany : ingredient.unitOne;
  return unit ? `${qty} ${unit}` : qty;
}

// ============= STEPS =============
// Each step's sentence is a segment list so ingredient amounts and timer
// chips render inline and rescale/tick live with the rest of the page.

type StepSegment =
  | {kind: 'text'; text: string}
  | {kind: 'ingredient'; ingredientId: string}
  | {
      kind: 'timer';
      /** Stable key linking this chip to spawned timers. */
      key: string;
      /** Chip text ('Simmer 20 min'). */
      chipLabel: string;
      /** Timer-rail label ('Simmer broth'). */
      railLabel: string;
      minutes: number;
    };

interface Step {
  id: string;
  title: string;
  segments: StepSegment[];
}

const STEPS: Step[] = [
  {
    id: 'step-1',
    title: 'Steep the aromatics',
    segments: [
      {kind: 'text', text: 'Add '},
      {kind: 'ingredient', ingredientId: 'stock'},
      {kind: 'text', text: ', '},
      {kind: 'ingredient', ingredientId: 'shiitake'},
      {kind: 'text', text: ', and '},
      {kind: 'ingredient', ingredientId: 'kombu'},
      {
        kind: 'text',
        text: " to a large pot and bring just to a bare simmer over medium heat — don't let it boil, or the kombu turns bitter.",
      },
    ],
  },
  {
    id: 'step-2',
    title: 'Build the broth',
    segments: [
      {kind: 'text', text: 'Fish out the kombu, then add '},
      {kind: 'ingredient', ingredientId: 'garlic'},
      {kind: 'text', text: ' and '},
      {kind: 'ingredient', ingredientId: 'ginger'},
      {kind: 'text', text: '. '},
      {
        kind: 'timer',
        key: 'simmer-broth',
        chipLabel: 'Simmer 20 min',
        railLabel: 'Simmer broth',
        minutes: 20,
      },
      {
        kind: 'text',
        text: ' uncovered, skimming any foam off the surface as it collects.',
      },
    ],
  },
  {
    id: 'step-3',
    title: 'Mix the tare',
    segments: [
      {kind: 'text', text: 'While the broth simmers, whisk '},
      {kind: 'ingredient', ingredientId: 'miso'},
      {kind: 'text', text: ', '},
      {kind: 'ingredient', ingredientId: 'soy'},
      {kind: 'text', text: ', and '},
      {kind: 'ingredient', ingredientId: 'mirin'},
      {kind: 'text', text: ' in a small bowl until completely smooth.'},
    ],
  },
  {
    id: 'step-4',
    title: 'Soft-boil the eggs',
    segments: [
      {kind: 'text', text: 'Lower '},
      {kind: 'ingredient', ingredientId: 'eggs'},
      {kind: 'text', text: ' into a pot of boiling water. '},
      {
        kind: 'timer',
        key: 'boil-eggs',
        chipLabel: 'Boil 7 min',
        railLabel: 'Boil eggs',
        minutes: 7,
      },
      {
        kind: 'text',
        text: ', then shock in ice water and peel once cool enough to handle.',
      },
    ],
  },
  {
    id: 'step-5',
    title: 'Strain and season',
    segments: [
      {
        kind: 'text',
        text: 'Strain the broth, discard the solids, and whisk the tare back into the pot along with ',
      },
      {kind: 'ingredient', ingredientId: 'sesame-oil'},
      {kind: 'text', text: '. Keep everything at the lowest possible simmer.'},
    ],
  },
  {
    id: 'step-6',
    title: 'Prep the toppings',
    segments: [
      {kind: 'text', text: 'Slice '},
      {kind: 'ingredient', ingredientId: 'scallions'},
      {kind: 'text', text: ', cut '},
      {kind: 'ingredient', ingredientId: 'nori'},
      {kind: 'text', text: ' into quarters, and warm '},
      {kind: 'ingredient', ingredientId: 'corn'},
      {kind: 'text', text: ' in a dry skillet until lightly charred.'},
    ],
  },
  {
    id: 'step-7',
    title: 'Cook the noodles',
    segments: [
      {kind: 'text', text: 'Drop '},
      {kind: 'ingredient', ingredientId: 'noodles'},
      {
        kind: 'text',
        text: ' into rapidly boiling water, stirring to separate. ',
      },
      {
        kind: 'timer',
        key: 'cook-noodles',
        chipLabel: 'Cook 3 min',
        railLabel: 'Cook noodles',
        minutes: 3,
      },
      {
        kind: 'text',
        text: ' — pull them the moment they turn springy, then drain well.',
      },
    ],
  },
  {
    id: 'step-8',
    title: 'Warm the bowls',
    segments: [
      {
        kind: 'text',
        text: 'Ladle a splash of hot broth into each serving bowl, swirl it around, and pour it back into the pot. Warm bowls keep the noodles hot to the last bite.',
      },
    ],
  },
  {
    id: 'step-9',
    title: 'Assemble and serve',
    segments: [
      {
        kind: 'text',
        text: 'Divide the noodles between bowls, ladle the broth over the top, and finish with the halved eggs, scallions, nori, and corn. Slurp immediately.',
      },
    ],
  },
];

// Fixture starting state: broth ingredients already prepped, the cook
// parked on step 2 with its simmer timer paused at 12:44 remaining.
const INITIAL_PREPPED = ['stock', 'shiitake', 'kombu', 'garlic', 'ginger'];
const INITIAL_STEP_INDEX = 1;

interface RunningTimer {
  id: string;
  /** Which timer chip spawned it (a chip runs at most one at a time). */
  sourceKey: string;
  stepNumber: number;
  label: string;
  totalSec: number;
  remainingSec: number;
  isRunning: boolean;
}

const INITIAL_TIMERS: RunningTimer[] = [
  {
    id: 'timer-seed',
    sourceKey: 'simmer-broth',
    stepNumber: 2,
    label: 'Simmer broth',
    totalSec: 20 * 60,
    remainingSec: 764, // 12:44 — paused, so the fixture stays deterministic
    isRunning: false,
  },
];

// ============= INGREDIENTS RAIL =============

/**
 * One rail row: prep CheckboxInput (name + prep note) with the scaled,
 * fraction-formatted amount right-aligned in the blue inline-highlight
 * tint. Prepped rows strike through and dim their amount.
 */
function IngredientRow({
  ingredient,
  servings,
  isPrepped,
  isNarrow,
  onToggle,
}: {
  ingredient: Ingredient;
  servings: number;
  isPrepped: boolean;
  isNarrow: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <HStack gap={2} vAlign="start">
      <StackItem size="fill">
        <CheckboxInput
          label={ingredient.name}
          description={ingredient.prepNote}
          value={isPrepped}
          size={isNarrow ? 'md' : 'sm'}
          onChange={onToggle}
        />
      </StackItem>
      <Text
        type="body"
        size="sm"
        color={isPrepped ? 'secondary' : 'primary'}
        hasTabularNumbers
        style={
          isPrepped
            ? {textDecoration: 'line-through'}
            : styles.inlineAmount
        }>
        {formatAmount(ingredient, servings)}
      </Text>
    </HStack>
  );
}

/**
 * The full ingredients pane: servings stepper (2/4/6/8) that rescales
 * every row live, grouped section lists with per-section prepped Tokens,
 * and a Reset-prepped action.
 */
function IngredientsPane({
  servings,
  prepped,
  isNarrow,
  onServingsChange,
  onToggle,
  onResetPrepped,
}: {
  servings: number;
  prepped: ReadonlySet<string>;
  isNarrow: boolean;
  onServingsChange: (servings: number) => void;
  onToggle: (id: string, checked: boolean) => void;
  onResetPrepped: () => void;
}) {
  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary">
          Servings
        </Text>
        <SegmentedControl
          value={String(servings)}
          onChange={value => onServingsChange(Number(value))}
          label="Servings"
          size="sm">
          {SERVING_OPTIONS.map(option => (
            <SegmentedControlItem
              key={option}
              value={String(option)}
              label={String(option)}
            />
          ))}
        </SegmentedControl>
        <Text type="supporting" color="secondary">
          Amounts below and inside every step rescale together.
        </Text>
      </VStack>

      <Divider />

      {SECTIONS.map(section => {
        const rows = INGREDIENTS.filter(item => item.section === section.id);
        const preppedInSection = rows.filter(item =>
          prepped.has(item.id),
        ).length;
        return (
          <VStack gap={2} key={section.id}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label" size="sm" color="secondary">
                  {section.label}
                </Text>
              </StackItem>
              <Token
                label={`${preppedInSection}/${rows.length}`}
                size="sm"
                color={preppedInSection === rows.length ? 'green' : 'gray'}
              />
            </HStack>
            <VStack gap={isNarrow ? 2 : 1}>
              {rows.map(ingredient => (
                <IngredientRow
                  key={ingredient.id}
                  ingredient={ingredient}
                  servings={servings}
                  isPrepped={prepped.has(ingredient.id)}
                  isNarrow={isNarrow}
                  onToggle={checked => onToggle(ingredient.id, checked)}
                />
              ))}
            </VStack>
          </VStack>
        );
      })}

      <Divider />

      <Button
        label="Reset prepped"
        variant="ghost"
        size="sm"
        icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
        isDisabled={prepped.size === 0}
        style={isNarrow ? styles.buttonTapTarget : undefined}
        onClick={onResetPrepped}
      />
    </VStack>
  );
}

// ============= STEP DOTS =============

/**
 * Nine clickable progress dots. Completed dots dim toward green, the
 * active dot stretches into an accent pill, and every dot is a real
 * button with a named tooltip — tapping one jumps the cook view there.
 */
function StepDots({
  activeIndex,
  isNarrow,
  onSelect,
}: {
  activeIndex: number;
  isNarrow: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <HStack gap={0} vAlign="center" wrap="wrap">
      {STEPS.map((step, index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;
        const dotStyle = isActive
          ? {...styles.dot, ...styles.dotActive}
          : isDone
            ? {...styles.dot, ...styles.dotDone}
            : styles.dot;
        return (
          <Tooltip key={step.id} content={`Step ${index + 1}: ${step.title}`}>
            <button
              type="button"
              aria-label={`Go to step ${index + 1}: ${step.title}`}
              aria-current={isActive ? 'step' : undefined}
              style={
                isNarrow
                  ? {...styles.dotButton, ...styles.dotButtonNarrow}
                  : styles.dotButton
              }
              onClick={() => onSelect(index)}>
              <span style={dotStyle} aria-hidden />
            </button>
          </Tooltip>
        );
      })}
    </HStack>
  );
}

// ============= TIMER CHIP =============

/**
 * An inline timer chip embedded in step text. Idle it reads 'Simmer
 * 20 min' and spawns a countdown into the timer stack; while that timer
 * lives, the chip mirrors it — tap to pause/resume, and once done, tap
 * to dismiss.
 */
function InlineTimerChip({
  segment,
  timer,
  isNarrow,
  onStart,
  onToggle,
  onDismiss,
}: {
  segment: Extract<StepSegment, {kind: 'timer'}>;
  timer: RunningTimer | undefined;
  isNarrow: boolean;
  onStart: () => void;
  onToggle: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const tapStyle = isNarrow ? styles.buttonTapTarget : undefined;
  if (timer == null) {
    return (
      <span style={styles.inlineChip}>
        <Button
          label={segment.chipLabel}
          variant="secondary"
          size="sm"
          icon={<Icon icon={TimerIcon} size="sm" color="inherit" />}
          tooltip="Start a timer in the timer stack"
          style={tapStyle}
          onClick={onStart}
        />
      </span>
    );
  }
  if (timer.remainingSec === 0) {
    return (
      <span style={styles.inlineChip}>
        <Button
          label={`${segment.railLabel} — done`}
          variant="secondary"
          size="sm"
          icon={<Icon icon={BellRingIcon} size="sm" color="success" />}
          tooltip="Timer finished — tap to dismiss"
          style={tapStyle}
          onClick={() => onDismiss(timer.id)}
        />
      </span>
    );
  }
  return (
    <span style={styles.inlineChip}>
      <Button
        label={`${formatSeconds(timer.remainingSec)}${
          timer.isRunning ? '' : ' · paused'
        }`}
        variant="secondary"
        size="sm"
        icon={
          <Icon
            icon={timer.isRunning ? PauseIcon : PlayIcon}
            size="sm"
            color="inherit"
          />
        }
        tooltip={timer.isRunning ? 'Pause timer' : 'Resume timer'}
        style={tapStyle}
        onClick={() => onToggle(timer.id)}
      />
    </span>
  );
}

// ============= TIMER STACK =============

/**
 * One stacked timer: label + step Token, big m:ss readout, elapsed
 * ProgressBar, and pause/+1:00 controls. At zero the card flips into a
 * flashing green done state (background alternates each tick) with a
 * primary Dismiss.
 */
function TimerCard({
  timer,
  flashOn,
  isNarrow,
  onToggle,
  onAddMinute,
  onDismiss,
}: {
  timer: RunningTimer;
  flashOn: boolean;
  isNarrow: boolean;
  onToggle: (id: string) => void;
  onAddMinute: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const isDone = timer.remainingSec === 0;
  const cardStyle = isDone
    ? flashOn
      ? {...styles.timerCardDone, ...styles.timerCardFlashOn}
      : styles.timerCardDone
    : undefined;
  const tapStyle = isNarrow ? styles.buttonTapTarget : undefined;
  return (
    <Card padding={3} style={cardStyle}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" size="sm" weight="semibold">
              {timer.label}
            </Text>
          </StackItem>
          <Token label={`Step ${timer.stepNumber}`} size="sm" color="gray" />
          <IconButton
            label={`Dismiss ${timer.label} timer`}
            tooltip="Dismiss"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            style={isNarrow ? styles.iconTapTarget : undefined}
            onClick={() => onDismiss(timer.id)}
          />
        </HStack>
        <HStack gap={2} vAlign="center">
          {isDone && <Icon icon={BellRingIcon} size="sm" color="success" />}
          <div style={styles.timerReadout} aria-live="off">
            {isDone ? 'Done!' : formatSeconds(timer.remainingSec)}
          </div>
        </HStack>
        <ProgressBar
          value={timer.totalSec - timer.remainingSec}
          max={timer.totalSec}
          label={`${timer.label} elapsed`}
          isLabelHidden
          variant={isDone ? 'success' : 'accent'}
        />
        {isDone ? (
          <Button
            label="Dismiss"
            variant="primary"
            size="sm"
            style={tapStyle}
            onClick={() => onDismiss(timer.id)}
          />
        ) : (
          <HStack gap={2} vAlign="center">
            <Button
              label={timer.isRunning ? 'Pause' : 'Resume'}
              variant="secondary"
              size="sm"
              icon={
                <Icon
                  icon={timer.isRunning ? PauseIcon : PlayIcon}
                  size="sm"
                  color="inherit"
                />
              }
              style={tapStyle}
              onClick={() => onToggle(timer.id)}
            />
            <Button
              label="+1:00"
              variant="ghost"
              size="sm"
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
              tooltip="Add a minute"
              style={tapStyle}
              onClick={() => onAddMinute(timer.id)}
            />
          </HStack>
        )}
      </VStack>
    </Card>
  );
}

function TimerStack({
  timers,
  flashOn,
  isNarrow,
  onToggle,
  onAddMinute,
  onDismiss,
}: {
  timers: RunningTimer[];
  flashOn: boolean;
  isNarrow: boolean;
  onToggle: (id: string) => void;
  onAddMinute: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  if (timers.length === 0) {
    return (
      <EmptyState
        isCompact
        icon={<Icon icon={TimerIcon} size="lg" />}
        title="No timers running"
        description="Tap a timer chip inside a step — like 'Simmer 20 min' — to push a countdown here. Several can run at once."
      />
    );
  }
  return (
    <VStack gap={3}>
      {timers.map(timer => (
        <TimerCard
          key={timer.id}
          timer={timer}
          flashOn={flashOn}
          isNarrow={isNarrow}
          onToggle={onToggle}
          onAddMinute={onAddMinute}
          onDismiss={onDismiss}
        />
      ))}
    </VStack>
  );
}

/**
 * Presenting-mode countdown pills: with both rails hidden, running
 * timers stay visible as compact flashing pills inside the step card.
 * Tap toggles pause/resume; once done, tap dismisses.
 */
function TimerPill({
  timer,
  flashOn,
  onToggle,
  onDismiss,
}: {
  timer: RunningTimer;
  flashOn: boolean;
  onToggle: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const isDone = timer.remainingSec === 0;
  const pillStyle = isDone
    ? {
        ...styles.timerPill,
        ...styles.timerPillDone,
        ...(flashOn ? styles.timerCardFlashOn : undefined),
      }
    : styles.timerPill;
  return (
    <button
      type="button"
      style={pillStyle}
      aria-label={
        isDone
          ? `${timer.label} finished — dismiss`
          : `${timer.label}, ${formatSeconds(timer.remainingSec)} left — ${
              timer.isRunning ? 'pause' : 'resume'
            }`
      }
      onClick={() => (isDone ? onDismiss(timer.id) : onToggle(timer.id))}>
      <Icon
        icon={isDone ? BellRingIcon : timer.isRunning ? PauseIcon : PlayIcon}
        size="sm"
        color={isDone ? 'success' : 'secondary'}
      />
      <Text type="body" size="sm" weight="medium" hasTabularNumbers>
        {timer.label} · {isDone ? 'Done!' : formatSeconds(timer.remainingSec)}
      </Text>
    </button>
  );
}

// ============= PAGE =============

export default function RecipeCookModeTemplate() {
  const [servings, setServings] = useState(BASE_SERVINGS);
  const [prepped, setPrepped] = useState<ReadonlySet<string>>(
    () => new Set(INITIAL_PREPPED),
  );
  const [stepIndex, setStepIndex] = useState(INITIAL_STEP_INDEX);
  const [timers, setTimers] = useState<RunningTimer[]>(INITIAL_TIMERS);
  const [timerCounter, setTimerCounter] = useState(1);
  const [isPresenting, setIsPresenting] = useState(false);
  const [pane, setPane] = useState<'ingredients' | 'cook' | 'timers'>('cook');
  // Ticks once per second while anything runs or flashes; parity drives
  // the done-state flash.
  const [flashTick, setFlashTick] = useState(0);

  // Responsive contract: timers fold under the step card at <=1024px;
  // <=640px is the single-pane phone fallback with the pane switcher.
  const isMid = useMediaQuery('(max-width: 1024px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  const hasRunning = timers.some(
    timer => timer.isRunning && timer.remainingSec > 0,
  );
  const hasDone = timers.some(timer => timer.remainingSec === 0);

  // One shared 1s interval: tick every running timer down (they park at
  // 0) and advance the flash parity for finished, undismissed timers.
  useEffect(() => {
    if (!hasRunning && !hasDone) {
      return undefined;
    }
    const interval = setInterval(() => {
      setFlashTick(prev => prev + 1);
      setTimers(prev =>
        prev.map(timer =>
          timer.isRunning && timer.remainingSec > 0
            ? {...timer, remainingSec: timer.remainingSec - 1}
            : timer,
        ),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [hasRunning, hasDone]);

  const flashOn = flashTick % 2 === 0;

  const step = STEPS[stepIndex];
  const preppedCount = prepped.size;
  const timerBySource = new Map(timers.map(timer => [timer.sourceKey, timer]));

  const togglePrepped = (id: string, checked: boolean) => {
    setPrepped(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const spawnTimer = (
    segment: Extract<StepSegment, {kind: 'timer'}>,
    stepNumber: number,
  ) => {
    setTimers(prev => [
      ...prev,
      {
        id: `timer-${timerCounter}`,
        sourceKey: segment.key,
        stepNumber,
        label: segment.railLabel,
        totalSec: segment.minutes * 60,
        remainingSec: segment.minutes * 60,
        isRunning: true,
      },
    ]);
    setTimerCounter(prev => prev + 1);
  };

  const toggleTimer = (id: string) => {
    setTimers(prev =>
      prev.map(timer =>
        timer.id === id ? {...timer, isRunning: !timer.isRunning} : timer,
      ),
    );
  };

  // +1:00 also revives a just-finished timer back into a running one.
  const addMinute = (id: string) => {
    setTimers(prev =>
      prev.map(timer =>
        timer.id === id
          ? {
              ...timer,
              remainingSec: timer.remainingSec + 60,
              isRunning: timer.remainingSec === 0 ? true : timer.isRunning,
            }
          : timer,
      ),
    );
  };

  const dismissTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
  };

  const goToStep = (index: number) => {
    setStepIndex(Math.max(0, Math.min(STEPS.length - 1, index)));
  };

  const isLastStep = stepIndex === STEPS.length - 1;
  const stepFontSize = isPresenting ? (isPhone ? 24 : 30) : 18;

  // ---- Step sentence: text, rescaling amounts, live timer chips ----
  const stepSentence = (
    <div style={{...styles.stepText, fontSize: stepFontSize}}>
      {step.segments.map((segment, index) => {
        if (segment.kind === 'text') {
          return <span key={index}>{segment.text}</span>;
        }
        if (segment.kind === 'ingredient') {
          const ingredient = INGREDIENT_BY_ID.get(segment.ingredientId);
          if (ingredient == null) {
            return null;
          }
          return (
            <span key={index} style={styles.inlineAmount}>
              {formatAmount(ingredient, servings)} {ingredient.shortName}
            </span>
          );
        }
        return (
          <InlineTimerChip
            key={index}
            segment={segment}
            timer={timerBySource.get(segment.key)}
            isNarrow={isPhone}
            onStart={() => spawnTimer(segment, stepIndex + 1)}
            onToggle={toggleTimer}
            onDismiss={dismissTimer}
          />
        );
      })}
    </div>
  );

  // ---- The step card (shared by every breakpoint and mode) ----
  const stepCard = (
    <Card padding={isPresenting ? 6 : 5}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text type="label" size="sm" color="secondary" hasTabularNumbers>
              Step {stepIndex + 1} of {STEPS.length}
            </Text>
          </StackItem>
          <StepDots
            activeIndex={stepIndex}
            isNarrow={isPhone}
            onSelect={goToStep}
          />
        </HStack>

        <Heading level={2}>{step.title}</Heading>
        {stepSentence}

        {/* Presenting hides both rails, so running countdowns surface as
            compact flashing pills right inside the card. */}
        {isPresenting && timers.length > 0 && (
          <HStack gap={2} vAlign="center" wrap="wrap">
            {timers.map(timer => (
              <TimerPill
                key={timer.id}
                timer={timer}
                flashOn={flashOn}
                onToggle={toggleTimer}
                onDismiss={dismissTimer}
              />
            ))}
          </HStack>
        )}

        <Divider />

        <HStack gap={2} vAlign="center">
          <Button
            label="Back"
            variant="ghost"
            size={isPresenting ? 'md' : 'sm'}
            icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
            isDisabled={stepIndex === 0}
            style={isPhone ? styles.buttonTapTarget : undefined}
            onClick={() => goToStep(stepIndex - 1)}
          />
          <StackItem size="fill">
            {!isPhone && (
              <Text
                type="supporting"
                color="secondary"
                style={{textAlign: 'center'}}>
                {isLastStep
                  ? 'Last step — itadakimasu.'
                  : `Up next: ${STEPS[stepIndex + 1].title}`}
              </Text>
            )}
          </StackItem>
          {isLastStep ? (
            <Button
              label="Start over"
              variant="secondary"
              size={isPresenting ? 'md' : 'sm'}
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              style={isPhone ? styles.buttonTapTarget : undefined}
              onClick={() => goToStep(0)}
            />
          ) : (
            <Button
              label="Next step"
              variant="primary"
              size={isPresenting ? 'md' : 'sm'}
              endContent={
                <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
              }
              style={isPhone ? styles.buttonTapTarget : undefined}
              onClick={() => goToStep(stepIndex + 1)}
            />
          )}
        </HStack>
      </VStack>
    </Card>
  );

  // ---- All-steps overview: completed rows dim, any row jumps ----
  const allStepsList = (
    <Collapsible
      trigger={
        <Text type="supporting" color="secondary">
          All {STEPS.length} steps
        </Text>
      }>
      <List density="compact">
        {STEPS.map((entry, index) => {
          const isDone = index < stepIndex;
          const isActive = index === stepIndex;
          return (
            <ListItem
              key={entry.id}
              label={`${index + 1}. ${entry.title}`}
              onClick={() => goToStep(index)}
              isSelected={isActive}
              style={isDone ? styles.stepRowDone : undefined}
              endContent={
                isDone ? (
                  <Icon
                    icon={CheckIcon}
                    size="sm"
                    color="success"
                    aria-label="Completed"
                  />
                ) : isActive ? (
                  <Badge label="Now" variant="blue" />
                ) : undefined
              }
            />
          );
        })}
      </List>
    </Collapsible>
  );

  // ---- Cook column (center pane) ----
  const cookView = (
    <VStack gap={4}>
      {stepCard}
      {/* <=1024px (and not presenting): the timer rail folds down here so
          pause/+1:00/dismiss stay reachable without a third pane. */}
      {!isPresenting && isMid && !isPhone && (
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon={TimerIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text type="label" size="sm" color="secondary">
                Timers
              </Text>
            </StackItem>
            <Badge
              label={String(timers.length)}
              variant={hasDone ? 'success' : 'neutral'}
            />
          </HStack>
          <TimerStack
            timers={timers}
            flashOn={flashOn}
            isNarrow={false}
            onToggle={toggleTimer}
            onAddMinute={addMinute}
            onDismiss={dismissTimer}
          />
        </VStack>
      )}
      {!isPresenting && allStepsList}
    </VStack>
  );

  const showIngredientsRail = !isPresenting && !isPhone;
  const showTimersRail = !isPresenting && !isMid;

  const presentToggle = (
    <Button
      label={isPresenting ? 'Exit' : 'Present'}
      variant={isPresenting ? 'secondary' : 'ghost'}
      size="sm"
      icon={
        <Icon
          icon={isPresenting ? Minimize2Icon : Maximize2Icon}
          size="sm"
          color="inherit"
        />
      }
      tooltip={
        isPresenting
          ? 'Back to the full cook layout'
          : 'Enlarge the step and hide the rails'
      }
      style={isPhone ? styles.buttonTapTarget : undefined}
      onClick={() => setIsPresenting(prev => !prev)}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <div style={styles.brandTile}>
              <Icon icon={ChefHatIcon} size="sm" color="inherit" />
            </div>
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>{RECIPE_TITLE}</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {RECIPE_TIME} · serves {servings} · {INGREDIENTS.length}{' '}
                  ingredients
                </Text>
              </VStack>
            </StackItem>
            {isPresenting ? (
              <Badge
                label={`Step ${stepIndex + 1} of ${STEPS.length}`}
                variant="blue"
              />
            ) : (
              <Badge
                label={`${preppedCount}/${INGREDIENTS.length} prepped`}
                variant={
                  preppedCount === INGREDIENTS.length ? 'success' : 'neutral'
                }
              />
            )}
            {presentToggle}
          </HStack>
        </LayoutHeader>
      }
      start={
        showIngredientsRail ? (
          <LayoutPanel
            hasDivider
            width={isMid ? 280 : 300}
            label="Ingredients and servings">
            <IngredientsPane
              servings={servings}
              prepped={prepped}
              isNarrow={false}
              onServingsChange={setServings}
              onToggle={togglePrepped}
              onResetPrepped={() => setPrepped(new Set())}
            />
          </LayoutPanel>
        ) : undefined
      }
      end={
        showTimersRail ? (
          <LayoutPanel hasDivider width={300} label="Running timers">
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <Icon icon={TimerIcon} size="sm" color="secondary" />
                <StackItem size="fill">
                  <Text type="label" size="sm" color="secondary">
                    Timers
                  </Text>
                </StackItem>
                <Badge
                  label={String(timers.length)}
                  variant={hasDone ? 'success' : 'neutral'}
                />
              </HStack>
              <TimerStack
                timers={timers}
                flashOn={flashOn}
                isNarrow={false}
                onToggle={toggleTimer}
                onAddMinute={addMinute}
                onDismiss={dismissTimer}
              />
            </VStack>
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent role="main" label="Cook mode">
          <div
            style={
              isPresenting
                ? {...styles.column, ...styles.columnPresenting}
                : styles.column
            }>
            <VStack gap={4}>
              {/* <=640px single-pane fallback: a full-width segmented pane
                  switcher replaces both rails (hidden while presenting —
                  the pills inside the card carry the countdowns). */}
              {isPhone && !isPresenting && (
                <SegmentedControl
                  value={pane}
                  onChange={value =>
                    setPane(value as 'ingredients' | 'cook' | 'timers')
                  }
                  label="Cook mode pane"
                  size="sm">
                  <SegmentedControlItem
                    value="ingredients"
                    label={`Prep (${preppedCount}/${INGREDIENTS.length})`}
                  />
                  <SegmentedControlItem value="cook" label="Cook" />
                  <SegmentedControlItem
                    value="timers"
                    label={`Timers (${timers.length})`}
                  />
                </SegmentedControl>
              )}

              {isPhone && !isPresenting ? (
                pane === 'ingredients' ? (
                  <IngredientsPane
                    servings={servings}
                    prepped={prepped}
                    isNarrow
                    onServingsChange={setServings}
                    onToggle={togglePrepped}
                    onResetPrepped={() => setPrepped(new Set())}
                  />
                ) : pane === 'timers' ? (
                  <TimerStack
                    timers={timers}
                    flashOn={flashOn}
                    isNarrow
                    onToggle={toggleTimer}
                    onAddMinute={addMinute}
                    onDismiss={dismissTimer}
                  />
                ) : (
                  cookView
                )
              ) : (
                cookView
              )}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
