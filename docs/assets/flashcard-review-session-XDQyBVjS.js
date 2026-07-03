var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (3 Spanish-vocab decks — 'Core Verbs A1'
 *   16 cards, 'Travel & Directions' 14, 'Food & Dining' 10 — totaling 40 due
 *   cards, each a Flashcard record with front word, translation, example
 *   sentence pair, and a 'new' | 'lapsed' status with a per-card prior
 *   interval in days; the session opens mid-way by deterministically
 *   replaying 13 seeded grades through the same pure reducer, so the strip
 *   reads '12 of 40' with a live 69% accuracy and an undoable history —
 *   no clocks, no randomness, no network assets)
 * @output Spaced-repetition flashcard review session: a top strip with the
 *   session progress ('12 of 40' + ProgressBar), new/review split Badges, a
 *   live accuracy Badge, and an undo IconButton; a 260px left deck rail with
 *   an 'All decks' tile plus three SelectableCard deck tiles (due count Badge,
 *   new/review split, per-deck completion ProgressBar) that scope the queue,
 *   and an 'Up next' peek list that makes Again-reinsertions visible; a
 *   centered stage with a large flippable card — Spanish front (tap or Space
 *   to reveal), translation + example-sentence back — and four grade Buttons
 *   (Again / Hard / Good / Easy) revealed only after the flip, each labeled
 *   with its per-card next-review interval and bound to keys 1–4. Grading
 *   dequeues the card except Again, which visibly reinserts it 3 positions
 *   back; every grade updates the due counter, the split, and accuracy, and
 *   undo (button or U) reverses the last grade including reinsertions.
 *   Emptying the queue renders a summary Card with a stacked per-grade
 *   breakdown bar and legend, a 'Review lapsed again (n)' action that
 *   requeues only the Again/Hard cards as a badged Round 2, and a full
 *   restart
 * @position Page template; emitted by \`astryx template flashcard-review-session\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the session strip
 * (cap icon + title, progress counter + bar, new/review Badges, accuracy,
 * undo). LayoutPanel start 260 hosts the scrollable deck rail and the
 * up-next peek list. LayoutContent (padding 0) is a muted backdrop that
 * centers the stage column (maxWidth 620) and scrolls when short. Choose
 * over form-wizard when the surface is a one-card-at-a-time grading loop
 * with a live queue, not a multi-step form; choose over kanban-style boards
 * when items leave the surface as they are graded instead of moving between
 * visible columns.
 *
 * Responsive contract:
 * - >640px: header strip | deck rail 260 (fixed, scrolls vertically) |
 *   stage (fill). The grade row is a 4-across grid; Kbd hints (Space /
 *   1–4 / U) render under the stage.
 * - <=640px: the rail collapses into a horizontal deck-tile strip above the
 *   stage (tiles keep intrinsic 200px width, strip scrolls horizontally,
 *   deliberate overflowX), the header drops the ProgressBar, the split
 *   Badges, and the subtitle (the stage meta row still carries the split),
 *   the undo IconButton grows to a 40px touch target, the grade grid wraps
 *   to 2x2 with 48px-tall Buttons, the show-answer Button keeps a full-width
 *   48px hit area, and the up-next peek becomes a one-line text under the
 *   stage. Flip and grading stay click-first — the keyboard shortcuts are
 *   an enhancement, never the only path.
 * - The stage column caps at 620px and centers; vertical centering falls
 *   back to scrolling when the viewport is short.
 *
 * Container policy (study-loop archetype): the page chrome is frame-first
 * rows and panels; Cards are reserved for the flashcard faces and the
 * end-of-session summary, SelectableCards for the deck tiles. The per-grade
 * breakdown bar is plain flex divs over semantic color tokens — no chart
 * engine.
 */

import {useEffect, useState, type CSSProperties} from 'react';

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
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  GraduationCapIcon,
  LayersIcon,
  RepeatIcon,
  RotateCcwIcon,
  SparklesIcon,
  TrophyIcon,
  Undo2Icon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Deck rail: the panel is fixed at 260px, only the contents scroll.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  // <=640px: horizontal deck-tile strip above the stage.
  deckStrip: {
    overflowX: 'auto',
    padding: 'var(--spacing-2)',
  },
  deckStripTile: {width: 200, flexShrink: 0},
  deckDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    flexShrink: 0,
  },
  // Muted backdrop; the stage column centers and scrolls when short.
  stageBackdrop: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
  },
  // <=640px: tighter gutters so the card gets more of the 375px viewport.
  stageBackdropCompact: {padding: 'var(--spacing-3)'},
  stageColumn: {
    width: '100%',
    maxWidth: 620,
    marginInline: 'auto',
    marginBlock: 'auto',
  },
  stageMetaRow: {flexWrap: 'wrap'},
  // Flashcard faces: generous centered surfaces on both sides of the flip.
  cardFace: {
    minHeight: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-6)',
    textAlign: 'center',
  },
  cardFaceCompact: {minHeight: 240, padding: 'var(--spacing-4)'},
  backFace: {
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  frontWord: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  exampleQuote: {
    fontStyle: 'italic',
  },
  // Grade row: 4-across on desktop, 2x2 at <=640px; ~44-48px tap targets.
  gradeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'var(--spacing-2)',
  },
  gradeGridCompact: {gridTemplateColumns: 'repeat(2, 1fr)'},
  gradeButton: {width: '100%', height: 44},
  gradeButtonCompact: {width: '100%', height: 48},
  fullWidthButton: {width: '100%', height: 44},
  fullWidthButtonCompact: {width: '100%', height: 48},
  // <=640px: grow the header undo control to a 40px hit box.
  headerTapTarget: {width: 40, height: 40},
  headerBarBox: {width: 140},
  deckRailBar: {width: '100%'},
  // Summary breakdown: plain flex segments over semantic color tokens.
  breakdownBar: {
    display: 'flex',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    flexShrink: 0,
  },
  legendRow: {flexWrap: 'wrap'},
  summaryActions: {flexWrap: 'wrap'},
};

// ============= DATA =============
// Deterministic fixtures: 3 decks, 40 due cards, fixed per-card intervals.
// No clocks, no randomness, no network assets.

type DeckId = 'core-verbs' | 'travel' | 'food';

interface Deck {
  id: DeckId;
  name: string;
  /** Accent used for the rail dot and up-next markers (semantic tokens). */
  color: string;
}

const DECKS: Deck[] = [
  {id: 'core-verbs', name: 'Core Verbs A1', color: 'var(--color-accent)'},
  {id: 'travel', name: 'Travel & Directions', color: 'var(--color-success)'},
  {id: 'food', name: 'Food & Dining', color: 'var(--color-warning)'},
];

type CardStatus = 'new' | 'lapsed';

interface Flashcard {
  id: string;
  deckId: DeckId;
  /** Spanish prompt shown on the front. */
  front: string;
  /** English translation revealed on the back. */
  back: string;
  /** Example sentence (Spanish) revealed on the back. */
  example: string;
  exampleTranslation: string;
  status: CardStatus;
  /** Prior interval in days; 0 for brand-new cards, >0 for lapsed reviews. */
  intervalDays: number;
}

const CARDS: Flashcard[] = [
  // ----- Core Verbs A1 (16: 10 new, 6 lapsed) -----
  {
    id: 'verb-hablar',
    deckId: 'core-verbs',
    front: 'hablar',
    back: 'to speak',
    example: '¿Puedo hablar contigo un momento?',
    exampleTranslation: 'Can I speak with you for a moment?',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'verb-comer',
    deckId: 'core-verbs',
    front: 'comer',
    back: 'to eat',
    example: 'Vamos a comer a las dos.',
    exampleTranslation: "We're going to eat at two.",
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'verb-vivir',
    deckId: 'core-verbs',
    front: 'vivir',
    back: 'to live',
    example: 'Vivo en Madrid desde 2019.',
    exampleTranslation: "I've lived in Madrid since 2019.",
    status: 'lapsed',
    intervalDays: 4,
  },
  {
    id: 'verb-tener',
    deckId: 'core-verbs',
    front: 'tener',
    back: 'to have',
    example: 'Tengo dos entradas para el concierto.',
    exampleTranslation: 'I have two tickets to the concert.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'verb-hacer',
    deckId: 'core-verbs',
    front: 'hacer',
    back: 'to do / to make',
    example: '¿Qué vas a hacer este fin de semana?',
    exampleTranslation: 'What are you going to do this weekend?',
    status: 'lapsed',
    intervalDays: 2,
  },
  {
    id: 'verb-poder',
    deckId: 'core-verbs',
    front: 'poder',
    back: 'to be able to',
    example: 'No puedo llegar antes de las ocho.',
    exampleTranslation: "I can't arrive before eight.",
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'verb-querer',
    deckId: 'core-verbs',
    front: 'querer',
    back: 'to want',
    example: 'Quiero un café con leche, por favor.',
    exampleTranslation: 'I want a coffee with milk, please.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'verb-saber',
    deckId: 'core-verbs',
    front: 'saber',
    back: 'to know (facts)',
    example: 'No sé la respuesta.',
    exampleTranslation: "I don't know the answer.",
    status: 'lapsed',
    intervalDays: 8,
  },
  {
    id: 'verb-venir',
    deckId: 'core-verbs',
    front: 'venir',
    back: 'to come',
    example: '¿Vienes a la fiesta el sábado?',
    exampleTranslation: 'Are you coming to the party on Saturday?',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'verb-decir',
    deckId: 'core-verbs',
    front: 'decir',
    back: 'to say',
    example: '¿Cómo se dice esto en español?',
    exampleTranslation: 'How do you say this in Spanish?',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'verb-dar',
    deckId: 'core-verbs',
    front: 'dar',
    back: 'to give',
    example: 'Le di las llaves al portero.',
    exampleTranslation: 'I gave the keys to the doorman.',
    status: 'lapsed',
    intervalDays: 12,
  },
  {
    id: 'verb-ver',
    deckId: 'core-verbs',
    front: 'ver',
    back: 'to see / to watch',
    example: 'Anoche vimos una película.',
    exampleTranslation: 'Last night we watched a movie.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'verb-ir',
    deckId: 'core-verbs',
    front: 'ir',
    back: 'to go',
    example: 'Voy al mercado los sábados.',
    exampleTranslation: 'I go to the market on Saturdays.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'verb-poner',
    deckId: 'core-verbs',
    front: 'poner',
    back: 'to put',
    example: 'Pon los platos en la mesa.',
    exampleTranslation: 'Put the plates on the table.',
    status: 'lapsed',
    intervalDays: 3,
  },
  {
    id: 'verb-salir',
    deckId: 'core-verbs',
    front: 'salir',
    back: 'to go out / to leave',
    example: 'Salimos del hotel a las nueve.',
    exampleTranslation: 'We left the hotel at nine.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'verb-llegar',
    deckId: 'core-verbs',
    front: 'llegar',
    back: 'to arrive',
    example: 'El tren llega con retraso.',
    exampleTranslation: 'The train is arriving late.',
    status: 'lapsed',
    intervalDays: 21,
  },
  // ----- Travel & Directions (14: 8 new, 6 lapsed) -----
  {
    id: 'travel-aeropuerto',
    deckId: 'travel',
    front: 'el aeropuerto',
    back: 'the airport',
    example: 'El aeropuerto está a veinte minutos.',
    exampleTranslation: 'The airport is twenty minutes away.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'travel-estacion',
    deckId: 'travel',
    front: 'la estación',
    back: 'the station',
    example: 'La estación de tren está cerrada.',
    exampleTranslation: 'The train station is closed.',
    status: 'lapsed',
    intervalDays: 5,
  },
  {
    id: 'travel-billete',
    deckId: 'travel',
    front: 'el billete',
    back: 'the ticket',
    example: 'Compré un billete de ida y vuelta.',
    exampleTranslation: 'I bought a round-trip ticket.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'travel-maleta',
    deckId: 'travel',
    front: 'la maleta',
    back: 'the suitcase',
    example: 'Mi maleta pesa demasiado.',
    exampleTranslation: 'My suitcase weighs too much.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'travel-derecha',
    deckId: 'travel',
    front: 'a la derecha',
    back: 'to the right',
    example: 'El museo está a la derecha.',
    exampleTranslation: 'The museum is on the right.',
    status: 'lapsed',
    intervalDays: 2,
  },
  {
    id: 'travel-izquierda',
    deckId: 'travel',
    front: 'a la izquierda',
    back: 'to the left',
    example: 'Gira a la izquierda en el semáforo.',
    exampleTranslation: 'Turn left at the traffic light.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'travel-recto',
    deckId: 'travel',
    front: 'todo recto',
    back: 'straight ahead',
    example: 'Sigue todo recto dos calles.',
    exampleTranslation: 'Keep straight for two blocks.',
    status: 'lapsed',
    intervalDays: 6,
  },
  {
    id: 'travel-esquina',
    deckId: 'travel',
    front: 'la esquina',
    back: 'the corner',
    example: 'La farmacia está en la esquina.',
    exampleTranslation: 'The pharmacy is on the corner.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'travel-anden',
    deckId: 'travel',
    front: 'el andén',
    back: 'the platform',
    example: 'El tren sale del andén cuatro.',
    exampleTranslation: 'The train leaves from platform four.',
    status: 'lapsed',
    intervalDays: 10,
  },
  {
    id: 'travel-aduana',
    deckId: 'travel',
    front: 'la aduana',
    back: 'customs',
    example: 'Pasamos la aduana sin problemas.',
    exampleTranslation: 'We went through customs without problems.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'travel-retraso',
    deckId: 'travel',
    front: 'el retraso',
    back: 'the delay',
    example: 'Hay un retraso de una hora.',
    exampleTranslation: 'There is a one-hour delay.',
    status: 'lapsed',
    intervalDays: 14,
  },
  {
    id: 'travel-parada',
    deckId: 'travel',
    front: 'la parada',
    back: 'the stop',
    example: 'Bájate en la próxima parada.',
    exampleTranslation: 'Get off at the next stop.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'travel-mapa',
    deckId: 'travel',
    front: 'el mapa',
    back: 'the map',
    example: '¿Tienes un mapa de la ciudad?',
    exampleTranslation: 'Do you have a map of the city?',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'travel-lejos',
    deckId: 'travel',
    front: 'lejos',
    back: 'far',
    example: '¿Está muy lejos el centro?',
    exampleTranslation: 'Is the center very far?',
    status: 'lapsed',
    intervalDays: 4,
  },
  // ----- Food & Dining (10: 6 new, 4 lapsed) -----
  {
    id: 'food-cuenta',
    deckId: 'food',
    front: 'la cuenta',
    back: 'the bill / the check',
    example: 'La cuenta, por favor.',
    exampleTranslation: 'The check, please.',
    status: 'lapsed',
    intervalDays: 3,
  },
  {
    id: 'food-desayuno',
    deckId: 'food',
    front: 'el desayuno',
    back: 'breakfast',
    example: 'El desayuno se sirve hasta las diez.',
    exampleTranslation: 'Breakfast is served until ten.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'food-cena',
    deckId: 'food',
    front: 'la cena',
    back: 'dinner',
    example: 'La cena está lista.',
    exampleTranslation: 'Dinner is ready.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'food-postre',
    deckId: 'food',
    front: 'el postre',
    back: 'dessert',
    example: '¿Qué hay de postre?',
    exampleTranslation: "What's for dessert?",
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'food-propina',
    deckId: 'food',
    front: 'la propina',
    back: 'the tip',
    example: 'Dejamos una buena propina.',
    exampleTranslation: 'We left a good tip.',
    status: 'lapsed',
    intervalDays: 7,
  },
  {
    id: 'food-vaso',
    deckId: 'food',
    front: 'el vaso',
    back: 'the glass',
    example: '¿Me traes un vaso de agua?',
    exampleTranslation: 'Can you bring me a glass of water?',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'food-cuchillo',
    deckId: 'food',
    front: 'el cuchillo',
    back: 'the knife',
    example: 'Este cuchillo no corta bien.',
    exampleTranslation: 'This knife does not cut well.',
    status: 'lapsed',
    intervalDays: 5,
  },
  {
    id: 'food-servilleta',
    deckId: 'food',
    front: 'la servilleta',
    back: 'the napkin',
    example: '¿Puedo pedir otra servilleta?',
    exampleTranslation: 'May I ask for another napkin?',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'food-horno',
    deckId: 'food',
    front: 'al horno',
    back: 'baked / oven-roasted',
    example: 'Pedimos pescado al horno.',
    exampleTranslation: 'We ordered baked fish.',
    status: 'new',
    intervalDays: 0,
  },
  {
    id: 'food-merienda',
    deckId: 'food',
    front: 'la merienda',
    back: 'the afternoon snack',
    example: 'Los niños toman la merienda a las cinco.',
    exampleTranslation: 'The kids have their snack at five.',
    status: 'lapsed',
    intervalDays: 9,
  },
];

const TOTAL_CARDS = CARDS.length; // 40

const CARD_BY_ID = new Map(CARDS.map(card => [card.id, card]));
const DECK_BY_ID = new Map(DECKS.map(deck => [deck.id, deck]));

function getCard(id: string): Flashcard {
  const card = CARD_BY_ID.get(id);
  if (!card) {
    throw new Error(\`Unknown card id: \${id}\`);
  }
  return card;
}

function getDeck(id: DeckId): Deck {
  const deck = DECK_BY_ID.get(id);
  if (!deck) {
    throw new Error(\`Unknown deck id: \${id}\`);
  }
  return deck;
}

/**
 * The due queue interleaves the three decks round-robin (v1, t1, f1, v2, …)
 * so the session mixes decks the way a real scheduler would, without any
 * randomness.
 */
function buildInitialQueue(): string[] {
  const byDeck = DECKS.map(deck =>
    CARDS.filter(card => card.deckId === deck.id),
  );
  const queue: string[] = [];
  const longest = Math.max(...byDeck.map(list => list.length));
  for (let i = 0; i < longest; i++) {
    for (const list of byDeck) {
      const card = list[i];
      if (card) {
        queue.push(card.id);
      }
    }
  }
  return queue;
}

const INITIAL_QUEUE = buildInitialQueue();

// ============= GRADES =============

type Grade = 'again' | 'hard' | 'good' | 'easy';

const GRADE_ORDER: Grade[] = ['again', 'hard', 'good', 'easy'];

interface GradeMeta {
  label: string;
  shortcut: '1' | '2' | '3' | '4';
  buttonVariant: 'destructive' | 'secondary' | 'primary';
  /** Segment color in the summary breakdown bar (semantic tokens). */
  barColor: string;
  /** Counts toward session accuracy. */
  isCorrect: boolean;
}

const GRADE_META: Record<Grade, GradeMeta> = {
  again: {
    label: 'Again',
    shortcut: '1',
    buttonVariant: 'destructive',
    barColor: 'var(--color-error)',
    isCorrect: false,
  },
  hard: {
    label: 'Hard',
    shortcut: '2',
    buttonVariant: 'secondary',
    barColor: 'var(--color-warning)',
    isCorrect: false,
  },
  good: {
    label: 'Good',
    shortcut: '3',
    buttonVariant: 'primary',
    barColor: 'var(--color-success)',
    isCorrect: true,
  },
  easy: {
    label: 'Easy',
    shortcut: '4',
    buttonVariant: 'secondary',
    barColor: 'var(--color-accent)',
    isCorrect: true,
  },
};

function formatInterval(days: number): string {
  if (days >= 30) {
    const months = Math.round((days / 30) * 10) / 10;
    return \`\${months}mo\`;
  }
  return \`\${days}d\`;
}

/**
 * Next-review interval per grade, derived from the card's prior interval —
 * the same tiny arithmetic an SRS scheduler would run, no clocks involved.
 * New cards (interval 0) use the fixed learning steps 1d / 3d / 7d.
 */
function nextIntervalLabel(card: Flashcard, grade: Grade): string {
  const base = card.intervalDays;
  switch (grade) {
    case 'again':
      return '<10m';
    case 'hard':
      return base === 0
        ? '1d'
        : formatInterval(Math.max(1, Math.round(base * 1.2)));
    case 'good':
      return base === 0
        ? '3d'
        : formatInterval(Math.max(base + 1, Math.round(base * 2)));
    case 'easy':
      return base === 0
        ? '7d'
        : formatInterval(Math.max(base + 2, Math.round(base * 3.5)));
  }
}

// ============= SESSION REDUCER =============

interface GradeEntry {
  cardId: string;
  grade: Grade;
}

interface SessionState {
  /** Remaining due queue (unique card ids, front of array is up next). */
  queue: string[];
  /** Every grade given this round, in order — drives accuracy + summary. */
  log: GradeEntry[];
  /** Pre-grade queue snapshots; popping one reverses any grade exactly. */
  undoStack: string[][];
}

/** Again puts the card back a few positions instead of dequeuing it. */
const REQUEUE_GAP = 3;

/**
 * Pure grade reducer shared by the click/key handlers AND the module-scope
 * seed replay below, so the "12 of 40" opening state is reproducible and
 * every seeded grade is undoable through the same snapshots.
 */
function applyGrade(
  state: SessionState,
  cardId: string,
  grade: Grade,
): SessionState {
  const removeAt = state.queue.indexOf(cardId);
  if (removeAt === -1) {
    return state;
  }
  const queue = state.queue.filter(id => id !== cardId);
  if (grade === 'again') {
    const insertAt = Math.min(removeAt + REQUEUE_GAP, queue.length);
    queue.splice(insertAt, 0, cardId);
  }
  return {
    queue,
    log: [...state.log, {cardId, grade}],
    undoStack: [...state.undoStack, state.queue],
  };
}

/**
 * 13 pre-session answers over the first cards in the queue: one 'again'
 * (la estación resurfaces 3 cards later and is cleared with 'good'), so the
 * strip opens at "12 of 40" with 13 answers, 69% accuracy, and a full undo
 * history.
 */
const SEED_GRADES: Grade[] = [
  'good',
  'good',
  'hard',
  'easy',
  'again',
  'good',
  'hard',
  'good',
  'good',
  'good',
  'easy',
  'good',
  'hard',
];

function buildSeededState(): SessionState {
  let state: SessionState = {queue: INITIAL_QUEUE, log: [], undoStack: []};
  for (const grade of SEED_GRADES) {
    const front = state.queue[0];
    if (front == null) {
      break;
    }
    state = applyGrade(state, front, grade);
  }
  return state;
}

const SEEDED_STATE = buildSeededState();

const INITIAL_ACTION_NOTE =
  'Resuming session — 12 cards were cleared in 13 answers before this sitting.';

// ============= RAIL PIECES =============

function DeckColorDot({color}: {color: string}) {
  return <span aria-hidden style={{...styles.deckDot, backgroundColor: color}} />;
}

function DeckTile({
  deck,
  dueCount,
  newCount,
  reviewCount,
  totalCount,
  isSelected,
  onSelect,
  isStrip,
}: {
  deck: Deck;
  dueCount: number;
  newCount: number;
  reviewCount: number;
  totalCount: number;
  isSelected: boolean;
  onSelect: () => void;
  isStrip: boolean;
}) {
  const doneCount = totalCount - dueCount;
  return (
    <div style={isStrip ? styles.deckStripTile : undefined}>
      <SelectableCard
        label={\`Study \${deck.name} (\${dueCount} due)\`}
        isSelected={isSelected}
        onChange={onSelect}
        padding={2}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <DeckColorDot color={deck.color} />
            <StackItem size="fill">
              <Text type="body">{deck.name}</Text>
            </StackItem>
            <Badge
              label={dueCount === 0 ? 'Done' : \`\${dueCount} due\`}
              variant={dueCount === 0 ? 'success' : 'neutral'}
            />
          </HStack>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {newCount} new · {reviewCount} review
          </Text>
          <ProgressBar
            value={doneCount}
            max={totalCount}
            label={\`\${deck.name} progress\`}
            isLabelHidden
            variant="success"
            style={styles.deckRailBar}
          />
        </VStack>
      </SelectableCard>
    </div>
  );
}

function AllDecksTile({
  dueCount,
  isSelected,
  onSelect,
  isStrip,
}: {
  dueCount: number;
  isSelected: boolean;
  onSelect: () => void;
  isStrip: boolean;
}) {
  return (
    <div style={isStrip ? styles.deckStripTile : undefined}>
      <SelectableCard
        label={\`Study all decks (\${dueCount} due)\`}
        isSelected={isSelected}
        onChange={onSelect}
        padding={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={LayersIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="body">All decks</Text>
          </StackItem>
          <Badge
            label={dueCount === 0 ? 'Done' : \`\${dueCount} due\`}
            variant={dueCount === 0 ? 'success' : 'neutral'}
          />
        </HStack>
      </SelectableCard>
    </div>
  );
}

/**
 * The next few queue entries. This is what makes the Again reinsertion
 * visible: grade a card Again and it reappears here, 3 positions down.
 */
function UpNextList({cards}: {cards: Flashcard[]}) {
  return (
    <VStack gap={2}>
      <div style={styles.eyebrow}>Up next</div>
      {cards.length === 0 ? (
        <Text type="supporting" color="secondary">
          Nothing behind this card.
        </Text>
      ) : (
        cards.map((card, index) => (
          <HStack key={card.id} gap={2} vAlign="center">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {index + 1}
            </Text>
            <DeckColorDot color={getDeck(card.deckId).color} />
            <StackItem size="fill">
              <Text type="body">{card.front}</Text>
            </StackItem>
            <Text type="supporting" color="secondary">
              {card.status === 'new' ? 'new' : 'review'}
            </Text>
          </HStack>
        ))
      )}
    </VStack>
  );
}

// ============= STAGE PIECES =============

function GradeButtonRow({
  card,
  onGrade,
  isCompact,
}: {
  card: Flashcard;
  onGrade: (grade: Grade) => void;
  isCompact: boolean;
}) {
  return (
    <div style={isCompact ? {...styles.gradeGrid, ...styles.gradeGridCompact} : styles.gradeGrid}>
      {GRADE_ORDER.map(grade => {
        const meta = GRADE_META[grade];
        return (
          <VStack key={grade} gap={1}>
            <Button
              label={meta.label}
              variant={meta.buttonVariant}
              size="lg"
              onClick={() => onGrade(grade)}
              style={isCompact ? styles.gradeButtonCompact : styles.gradeButton}
            />
            <HStack gap={1} vAlign="center" hAlign="center">
              {!isCompact && <Kbd keys={meta.shortcut} />}
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {grade === 'again'
                  ? nextIntervalLabel(card, grade)
                  : \`in \${nextIntervalLabel(card, grade)}\`}
              </Text>
            </HStack>
          </VStack>
        );
      })}
    </div>
  );
}

/** Per-grade stacked breakdown bar + legend on the summary screen. */
function GradeBreakdown({log}: {log: GradeEntry[]}) {
  const counts = GRADE_ORDER.map(grade => ({
    grade,
    count: log.filter(entry => entry.grade === grade).length,
  }));
  const total = log.length;
  return (
    <VStack gap={2}>
      <div style={styles.eyebrow}>Grade breakdown · {total} answers</div>
      <div style={styles.breakdownBar} role="img" aria-label="Grade breakdown bar">
        {counts
          .filter(({count}) => count > 0)
          .map(({grade, count}) => (
            <div
              key={grade}
              title={\`\${GRADE_META[grade].label}: \${count}\`}
              style={{
                width: \`\${(count / Math.max(1, total)) * 100}%\`,
                backgroundColor: GRADE_META[grade].barColor,
              }}
            />
          ))}
      </div>
      <HStack gap={3} vAlign="center" style={styles.legendRow}>
        {counts.map(({grade, count}) => (
          <HStack key={grade} gap={1} vAlign="center">
            <span
              aria-hidden
              style={{
                ...styles.legendDot,
                backgroundColor: GRADE_META[grade].barColor,
              }}
            />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {GRADE_META[grade].label} {count}
            </Text>
          </HStack>
        ))}
      </HStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function FlashcardReviewSessionTemplate() {
  const [session, setSession] = useState<SessionState>(SEEDED_STATE);
  const [roundTotal, setRoundTotal] = useState(TOTAL_CARDS);
  const [round, setRound] = useState(1);
  const [activeDeckId, setActiveDeckId] = useState<DeckId | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [actionNote, setActionNote] = useState(INITIAL_ACTION_NOTE);

  // Responsive contract: <=640px the deck rail becomes a horizontal strip
  // and the header sheds its bar + split badges.
  const isCompact = useMediaQuery('(max-width: 640px)');

  // ----- Derived session math (all recomputed live from the queue/log) -----
  const remainingCards = session.queue.map(getCard);
  const completedCount = roundTotal - session.queue.length;
  const newRemaining = remainingCards.filter(
    card => card.status === 'new',
  ).length;
  const reviewRemaining = remainingCards.length - newRemaining;
  const correctCount = session.log.filter(
    entry => GRADE_META[entry.grade].isCorrect,
  ).length;
  const accuracy =
    session.log.length === 0
      ? null
      : Math.round((correctCount / session.log.length) * 100);
  const canUndo = session.undoStack.length > 0;

  const filteredQueue =
    activeDeckId == null
      ? session.queue
      : session.queue.filter(id => getCard(id).deckId === activeDeckId);
  const currentCardId = filteredQueue[0];
  const currentCard = currentCardId == null ? undefined : getCard(currentCardId);
  const upNextCards = filteredQueue.slice(1, 5).map(getCard);

  const isSessionDone = session.queue.length === 0;
  const isDeckCleared = !isSessionDone && currentCard == null;

  // Cards that lapsed this round (graded Again or Hard at least once), in
  // stable queue order — the "review lapsed again" pool on the summary.
  const lapsedAgainIds = INITIAL_QUEUE.filter(id =>
    session.log.some(
      entry =>
        entry.cardId === id &&
        (entry.grade === 'again' || entry.grade === 'hard'),
    ),
  );

  const deckStats = DECKS.map(deck => {
    const deckCards = CARDS.filter(card => card.deckId === deck.id);
    const dueCards = remainingCards.filter(card => card.deckId === deck.id);
    return {
      deck,
      totalCount: deckCards.length,
      dueCount: dueCards.length,
      newCount: dueCards.filter(card => card.status === 'new').length,
      reviewCount: dueCards.filter(card => card.status === 'lapsed').length,
    };
  });

  // ----- Handlers -----
  const gradeCurrent = (grade: Grade) => {
    if (!currentCard || !isFlipped) {
      return;
    }
    setSession(prev => applyGrade(prev, currentCard.id, grade));
    setIsFlipped(false);
    setActionNote(
      grade === 'again'
        ? \`«\${currentCard.front}» goes again — reinserted \${REQUEUE_GAP} cards back in the queue.\`
        : \`Graded «\${currentCard.front}» \${GRADE_META[grade].label} — next review in \${nextIntervalLabel(currentCard, grade)}.\`,
    );
  };

  const undoLast = () => {
    if (!canUndo) {
      return;
    }
    const lastEntry = session.log[session.log.length - 1];
    setSession(prev => {
      const previousQueue = prev.undoStack[prev.undoStack.length - 1];
      if (previousQueue == null) {
        return prev;
      }
      return {
        queue: previousQueue,
        log: prev.log.slice(0, -1),
        undoStack: prev.undoStack.slice(0, -1),
      };
    });
    setIsFlipped(false);
    if (lastEntry) {
      setActionNote(
        \`Undid \${GRADE_META[lastEntry.grade].label} on «\${getCard(lastEntry.cardId).front}» — the card is back where it was.\`,
      );
    }
  };

  const toggleFlip = () => {
    if (currentCard) {
      setIsFlipped(prev => !prev);
    }
  };

  const selectDeck = (deckId: DeckId | null) => {
    setActiveDeckId(deckId);
    setIsFlipped(false);
  };

  const reviewLapsedAgain = () => {
    if (lapsedAgainIds.length === 0) {
      return;
    }
    setSession({queue: lapsedAgainIds, log: [], undoStack: []});
    setRoundTotal(lapsedAgainIds.length);
    setRound(prev => prev + 1);
    setActiveDeckId(null);
    setIsFlipped(false);
    setActionNote(
      \`Requeued \${lapsedAgainIds.length} Again/Hard cards for a focused pass.\`,
    );
  };

  const restartSession = () => {
    setSession({queue: INITIAL_QUEUE, log: [], undoStack: []});
    setRoundTotal(TOTAL_CARDS);
    setRound(1);
    setActiveDeckId(null);
    setIsFlipped(false);
    setActionNote(\`Fresh session — all \${TOTAL_CARDS} due cards requeued.\`);
  };

  // Keyboard: Space flips, 1–4 grade after the flip, U undoes. Re-subscribes
  // every render so the handlers never close over stale queue state; when a
  // real control has focus, Space is left to that control.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const isOnControl =
        target != null &&
        target.closest(
          'button, a, input, textarea, select, [role="button"]',
        ) != null;
      if (event.key === ' ') {
        if (!isOnControl && currentCard) {
          event.preventDefault();
          toggleFlip();
        }
        return;
      }
      if (event.key === 'u' || event.key === 'U') {
        undoLast();
        return;
      }
      const gradeIndex = ['1', '2', '3', '4'].indexOf(event.key);
      if (gradeIndex !== -1 && isFlipped && currentCard) {
        gradeCurrent(GRADE_ORDER[gradeIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // <=640px: 40px hit box for the header undo control.
  const tapTargetStyle = isCompact ? styles.headerTapTarget : undefined;

  const deckTiles = (
    <>
      <AllDecksTile
        dueCount={session.queue.length}
        isSelected={activeDeckId == null}
        onSelect={() => selectDeck(null)}
        isStrip={isCompact}
      />
      {deckStats.map(stat => (
        <DeckTile
          key={stat.deck.id}
          deck={stat.deck}
          dueCount={stat.dueCount}
          newCount={stat.newCount}
          reviewCount={stat.reviewCount}
          totalCount={stat.totalCount}
          isSelected={activeDeckId === stat.deck.id}
          onSelect={() => selectDeck(stat.deck.id)}
          isStrip={isCompact}
        />
      ))}
    </>
  );

  // ----- Stage variants -----

  const cardFaceStyle = isCompact
    ? {...styles.cardFace, ...styles.cardFaceCompact}
    : styles.cardFace;

  const stageMeta = currentCard && (
    <HStack gap={2} vAlign="center" style={styles.stageMetaRow}>
      <Badge label={getDeck(currentCard.deckId).name} variant="neutral" />
      {currentCard.status === 'new' ? (
        <Badge label="New card" variant="info" />
      ) : (
        <Badge
          label={\`Lapsed · was \${formatInterval(currentCard.intervalDays)}\`}
          variant="warning"
        />
      )}
      <StackItem size="fill">
        <span />
      </StackItem>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {filteredQueue.length} left{activeDeckId == null ? '' : ' in deck'}
      </Text>
      {isCompact && (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          · {newRemaining} new / {reviewRemaining} review
        </Text>
      )}
    </HStack>
  );

  const frontFace = currentCard && (
    <ClickableCard
      label={\`Show the answer for \${currentCard.front}\`}
      onClick={() => setIsFlipped(true)}>
      <div style={cardFaceStyle}>
        <div style={styles.eyebrow}>Spanish</div>
        <div style={styles.frontWord}>{currentCard.front}</div>
        <Text type="supporting" color="secondary">
          Tap the card to reveal the answer
        </Text>
      </div>
    </ClickableCard>
  );

  const backFace = currentCard && (
    <Card padding={0}>
      <div style={styles.backFace}>
        <HStack gap={2} vAlign="center">
          <div style={styles.eyebrow}>{currentCard.front}</div>
          <StackItem size="fill">
            <span />
          </StackItem>
          <Button
            label="Hide answer"
            variant="ghost"
            size="sm"
            onClick={() => setIsFlipped(false)}
          />
        </HStack>
        <Text type="display-2">{currentCard.back}</Text>
        <Divider />
        <VStack gap={1}>
          <Text type="body" style={styles.exampleQuote}>
            «{currentCard.example}»
          </Text>
          <Text type="supporting" color="secondary">
            {currentCard.exampleTranslation}
          </Text>
        </VStack>
      </div>
    </Card>
  );

  const cardStage = currentCard && (
    <VStack gap={3}>
      {stageMeta}
      {isFlipped ? backFace : frontFace}
      {isFlipped ? (
        <GradeButtonRow
          card={currentCard}
          onGrade={gradeCurrent}
          isCompact={isCompact}
        />
      ) : (
        <Button
          label="Show answer"
          variant="primary"
          size="lg"
          onClick={() => setIsFlipped(true)}
          style={
            isCompact ? styles.fullWidthButtonCompact : styles.fullWidthButton
          }
        />
      )}
      <HStack hAlign="center">
        <Text type="supporting" color="secondary">
          {actionNote}
        </Text>
      </HStack>
      {isCompact && upNextCards.length > 0 && (
        <HStack hAlign="center">
          <Text type="supporting" color="secondary">
            Up next: {upNextCards.map(card => card.front).join(' · ')}
          </Text>
        </HStack>
      )}
      {!isCompact && (
        <HStack gap={3} vAlign="center" hAlign="center">
          <HStack gap={1} vAlign="center">
            <Kbd keys="space" />
            <Text type="supporting" color="secondary">
              flip
            </Text>
          </HStack>
          <HStack gap={1} vAlign="center">
            <Kbd keys="1" />
            <Text type="supporting" color="secondary">
              –
            </Text>
            <Kbd keys="4" />
            <Text type="supporting" color="secondary">
              grade
            </Text>
          </HStack>
          <HStack gap={1} vAlign="center">
            <Kbd keys="u" />
            <Text type="supporting" color="secondary">
              undo
            </Text>
          </HStack>
        </HStack>
      )}
    </VStack>
  );

  const deckClearedStage = isDeckCleared && activeDeckId != null && (
    <Card padding={4}>
      <EmptyState
        title={\`\${getDeck(activeDeckId).name} is clear\`}
        description="Every due card in this deck has been graded this session."
        icon={<Icon icon={SparklesIcon} size="lg" color="secondary" />}
        actions={
          <Button
            label="Back to all decks"
            variant="primary"
            onClick={() => selectDeck(null)}
          />
        }
      />
    </Card>
  );

  const summaryStage = isSessionDone && (
    <Card padding={4}>
      <VStack gap={4}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Icon icon={TrophyIcon} size="lg" color="secondary" />
            <Heading level={2}>Session complete</Heading>
          </HStack>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {roundTotal} cards cleared in {session.log.length} answers ·{' '}
            {accuracy ?? 0}% accuracy
            {round > 1 ? \` · round \${round}\` : ''}
          </Text>
        </VStack>
        <Divider />
        <GradeBreakdown log={session.log} />
        <Divider />
        <HStack gap={2} vAlign="center" style={styles.summaryActions}>
          {lapsedAgainIds.length > 0 ? (
            <Button
              label={\`Review lapsed again (\${lapsedAgainIds.length})\`}
              variant="primary"
              icon={<Icon icon={RepeatIcon} size="sm" color="inherit" />}
              onClick={reviewLapsedAgain}
            />
          ) : (
            <Text type="supporting" color="secondary">
              Clean run — nothing to relearn.
            </Text>
          )}
          <Button
            label="Restart full session"
            variant="secondary"
            icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
            onClick={restartSession}
          />
        </HStack>
      </VStack>
    </Card>
  );

  const stage = (
    <div
      style={
        isCompact
          ? {...styles.stageBackdrop, ...styles.stageBackdropCompact}
          : styles.stageBackdrop
      }>
      <div style={styles.stageColumn}>
        {isSessionDone ? summaryStage : isDeckCleared ? deckClearedStage : cardStage}
      </div>
    </div>
  );

  const accuracyBadge = (
    <Tooltip content="Good + Easy answers over all grades this round">
      <Badge
        label={accuracy == null ? 'Accuracy —' : \`Accuracy \${accuracy}%\`}
        variant={
          accuracy == null
            ? 'neutral'
            : accuracy >= 80
              ? 'success'
              : accuracy >= 50
                ? 'warning'
                : 'error'
        }
      />
    </Tooltip>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Icon icon={GraduationCapIcon} size="md" color="secondary" />
                <Heading level={1}>Flashcard Review</Heading>
                {round > 1 && (
                  <Badge label={\`Round \${round} · lapsed\`} variant="warning" />
                )}
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    Spanish A1 · spaced repetition
                  </Text>
                )}
              </HStack>
            </StackItem>
            <HStack gap={3} vAlign="center">
              <VStack gap={0.5}>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {completedCount} of {roundTotal}
                </Text>
                {!isCompact && (
                  <div style={styles.headerBarBox}>
                    <ProgressBar
                      value={completedCount}
                      max={roundTotal}
                      label="Session progress"
                      isLabelHidden
                    />
                  </div>
                )}
              </VStack>
              {/* <=640px the stage meta row carries the split instead. */}
              {!isCompact && (
                <>
                  <Badge label={\`\${newRemaining} new\`} variant="info" />
                  <Badge label={\`\${reviewRemaining} review\`} variant="warning" />
                </>
              )}
              {accuracyBadge}
              <IconButton
                label="Undo last grade"
                tooltip="Undo last grade (U)"
                icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                isDisabled={!canUndo}
                onClick={undoLast}
                style={tapTargetStyle}
              />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      start={
        isCompact ? undefined : (
          <LayoutPanel width={260} padding={0} label="Decks">
            <div style={styles.railScroll}>
              <VStack gap={4}>
                <VStack gap={2}>
                  <div style={styles.eyebrow}>Decks</div>
                  {deckTiles}
                </VStack>
                <Divider />
                <UpNextList cards={upNextCards} />
              </VStack>
            </div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          {isCompact ? (
            <VStack gap={0} style={styles.fill}>
              <div style={styles.deckStrip}>
                <HStack gap={2}>{deckTiles}</HStack>
              </div>
              <Divider />
              <StackItem size="fill" style={styles.fill}>
                {stage}
              </StackItem>
            </VStack>
          ) : (
            stage
          )}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};