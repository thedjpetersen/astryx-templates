var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Read-Later Library — save-for-later reading queue with keyboard
 *   triage and a live-progress reader pane.
 *
 * @input Deterministic fixtures: 20 saved articles with fixed titles,
 *   sources, authors, word counts, ISO saved dates, seeded tags, read
 *   progress, and favorite flags. Article bodies are assembled from a
 *   fixed paragraph pool sized by each article's word count — no
 *   Date.now(), Math.random(), or network assets (the "favicon" is a
 *   styled initial chip, never a real image).
 * @output A three-pane read-later app: a views rail (Unread / Reading /
 *   Archive / Favorites with live Badge counts plus a tag list with
 *   counts), a center article list (favicon chip, reading-time
 *   estimate, saved date, ProgressBar on partially read items, tag
 *   Tokens, bulk-select checkboxes), and a reader pane with adjustable
 *   text size. Keyboard triage on the focused list — A archive,
 *   F favorite, T edit tags, X select, J/K move — really moves items
 *   between views with rail counts recomputing; scrolling the reader
 *   ratchets the open article's progress bar in real time and
 *   auto-moves an Unread item into Reading; tags add/remove inline on
 *   rows and the reader header; sorting by date or length reorders
 *   without losing selection; archives undo from a Toast.
 * @position Emitted by \`astryx template read-later-library\`. Choose
 *   over inbox when items are saved long-form articles with read
 *   progress and tags rather than correspondence; choose over
 *   infinite-scroll-feed when the surface is a triage queue with a
 *   reader pane, not a passive stream of cards.
 *
 * Frame (desktop, left to right):
 *   views rail 224px | article list 360px | reader pane (fill)
 *
 * Container policy (library archetype): dense rows and panels, zero
 * Cards. Views and articles are List/ListItem rows; counts are Badges
 * in the rail; per-row progress is the only ProgressBar in the list;
 * reader actions live in a Toolbar; tags are Tokens on rows and
 * removable chip Buttons in the reader header.
 *
 * Responsive contract:
 * - >1024px  — full three-pane frame (rail | list | reader).
 * - <=1024px — views rail hidden; a Selector of views + tags appears
 *   in the list header so triage never loses the rail's navigation;
 *   the list keeps 360px and the reader absorbs the space. The header
 *   keyboard-shortcut legend is dropped.
 * - <=640px  — single-pane list/detail: the article list becomes the
 *   content fill; tapping a row swaps to the reader, and a back
 *   IconButton in the reader Toolbar returns to the list. Archiving
 *   from the reader on mobile also returns to the list. Row action
 *   icons and checkboxes grow to ~40px tap targets; every action is
 *   click-based (keyboard shortcuts are an accelerator, never the only
 *   path — no hover-only interactions anywhere).
 * - The article list and reader body scroll independently; the list
 *   header (search / sort / bulk bar) and reader Toolbar stay pinned.
 *   Tag rows wrap instead of overflowing; titles clamp to 2 lines.
 */

import {
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type UIEvent,
} from 'react';

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  Stack,
  StackItem,
  HStack,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {List, ListItem} from '@astryxdesign/core/List';
import {Popover} from '@astryxdesign/core/Popover';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  BookmarkIcon,
  InboxIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  TagIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens only.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  railColumn: {
    height: '100%',
    minHeight: 0,
    paddingBlock: 'var(--spacing-3)',
    overflowY: 'auto',
  },
  railSection: {
    paddingInline: 'var(--spacing-2)',
  },
  railGroupLabel: {
    paddingInline: 'var(--spacing-3)',
    paddingTop: 'var(--spacing-3)',
    paddingBottom: 'var(--spacing-1)',
  },
  listColumn: {
    height: '100%',
    minHeight: 0,
  },
  listHeader: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  bulkBar: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    background: 'var(--color-background-muted)',
  },
  listScroll: {
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-3)',
  },
  listEmpty: {
    paddingTop: 'var(--spacing-6)',
  },
  // Small "favicon" stand-in: an initial chip, never a network image.
  faviconChip: {
    width: 20,
    height: 20,
    flexShrink: 0,
    borderRadius: 'var(--radius-element)',
    border: 'var(--border-width) solid var(--color-border)',
    background: 'var(--color-background-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 600,
  },
  rowProgress: {
    maxWidth: 220,
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
  },
  tagEditor: {
    width: 224,
    padding: 'var(--spacing-2)',
  },
  readerColumn: {
    height: '100%',
    minHeight: 0,
  },
  readerScroll: {
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-5)',
    paddingBlock: 'var(--spacing-4)',
  },
  readerBody: {
    maxWidth: 680,
    marginInline: 'auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  // Reader paragraphs are plain <p> so the text-size control owns the
  // font size; color stays on the semantic token.
  paragraph: {
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  readerEmpty: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // <=640px: grow sm icon controls to ~40px thumb targets.
  iconTapTarget: {width: 40, height: 40},
  // Tabular numerals so stacked reading-time estimates digit-align.
  tabularMeta: {fontVariantNumeric: 'tabular-nums'},
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. 20 saved articles across three views,
// with seeded tags, favorites, and read progress. Bodies are assembled
// from a fixed paragraph pool sized by word count.
// ---------------------------------------------------------------------------

type ViewId = 'unread' | 'reading' | 'archive';

interface Article {
  id: string;
  title: string;
  source: string;
  author: string;
  /** ISO date used for sorting; savedLabel is the display string. */
  savedAt: string;
  savedLabel: string;
  wordCount: number;
  lead: string;
  view: ViewId;
  progress: number;
  favorite: boolean;
  tags: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'art-01',
    title: 'The Maintenance Race',
    source: 'Works in Progress',
    author: 'Stewart Brand',
    savedAt: '2026-07-01',
    savedLabel: 'Jul 1',
    wordCount: 4200,
    lead: 'Three sailors set out to circle the world alone in 1968, and the way each of them treated maintenance decided who came home. The race turns out to be a parable about every long-running system we depend on.',
    view: 'unread',
    progress: 0,
    favorite: false,
    tags: ['engineering', 'longform'],
  },
  {
    id: 'art-02',
    title: 'Why Attention Is the Scarcest Resource',
    source: 'The Atlantic',
    author: 'Derek Thompson',
    savedAt: '2026-06-30',
    savedLabel: 'Jun 30',
    wordCount: 2600,
    lead: 'Every productivity system is secretly an attention system. The tools changed, the advice changed, but the bottleneck has been the same for a century: what you notice is what you become.',
    view: 'reading',
    progress: 45,
    favorite: false,
    tags: ['psychology', 'productivity'],
  },
  {
    id: 'art-03',
    title: 'Inside the Grid: How Texas Keeps the Lights On',
    source: 'MIT Tech Review',
    author: 'June Kim',
    savedAt: '2026-06-30',
    savedLabel: 'Jun 30',
    wordCount: 3400,
    lead: 'An islanded power grid is a physics experiment running at state scale. Texas balances supply and demand every four seconds, and the margin for error is thinner than almost anyone realizes.',
    view: 'unread',
    progress: 0,
    favorite: false,
    tags: ['climate', 'engineering'],
  },
  {
    id: 'art-04',
    title: 'Small Models, Big Leverage',
    source: 'Stratechery',
    author: 'Ben Thompson',
    savedAt: '2026-06-29',
    savedLabel: 'Jun 29',
    wordCount: 1900,
    lead: 'The strategic story of the past year is not the largest model; it is the smallest model that clears the quality bar for a task. Leverage accrues to whoever owns the routing decision.',
    view: 'reading',
    progress: 62,
    favorite: true,
    tags: ['ai'],
  },
  {
    id: 'art-05',
    title: 'The Slow Web Manifesto, Revisited',
    source: 'A List Apart',
    author: 'Rachel Andrew',
    savedAt: '2026-06-28',
    savedLabel: 'Jun 28',
    wordCount: 1500,
    lead: 'Ten years after the slow web was proposed as a countermovement, its core claim has aged well: speed of delivery and speed of consumption are different axes, and we optimized the wrong one.',
    view: 'archive',
    progress: 100,
    favorite: false,
    tags: ['design'],
  },
  {
    id: 'art-06',
    title: 'Notes on Deliberate Practice',
    source: 'Farnam Street',
    author: 'Shane Parrish',
    savedAt: '2026-06-27',
    savedLabel: 'Jun 27',
    wordCount: 2200,
    lead: 'Most practice is repetition with the difficulty dial left alone. Deliberate practice is the uncomfortable discipline of keeping the dial exactly one notch beyond competence.',
    view: 'unread',
    progress: 0,
    favorite: true,
    tags: ['productivity', 'psychology'],
  },
  {
    id: 'art-07',
    title: 'What Container Ships Teach Us About Latency',
    source: 'Increment',
    author: 'Glenn Fleishman',
    savedAt: '2026-06-26',
    savedLabel: 'Jun 26',
    wordCount: 2800,
    lead: 'A container ship is a batch system with a nine-week flush interval. Once you see global shipping as a throughput-versus-latency tradeoff, half of distributed systems design looks familiar.',
    view: 'reading',
    progress: 18,
    favorite: false,
    tags: ['engineering'],
  },
  {
    id: 'art-08',
    title: 'Choosing Boring Technology, Ten Years Later',
    source: 'McFunley',
    author: 'Dan McKinley',
    savedAt: '2026-06-25',
    savedLabel: 'Jun 25',
    wordCount: 2000,
    lead: 'The innovation-token essay became folklore, which means it is now mostly quoted by people arguing for whatever they already wanted. Here is what the argument actually was, and what held up.',
    view: 'archive',
    progress: 100,
    favorite: true,
    tags: ['engineering'],
  },
  {
    id: 'art-09',
    title: 'The Case for Walking Meetings',
    source: 'Harvard Business Review',
    author: 'Nilofer Merchant',
    savedAt: '2026-06-24',
    savedLabel: 'Jun 24',
    wordCount: 900,
    lead: 'Sitting across a table is adversarial geometry. Walking side by side changes the physics of a hard conversation more reliably than any facilitation technique.',
    view: 'unread',
    progress: 0,
    favorite: false,
    tags: ['productivity'],
  },
  {
    id: 'art-10',
    title: 'Design Systems Are for People',
    source: 'Figma Blog',
    author: 'Amara Chen',
    savedAt: '2026-06-23',
    savedLabel: 'Jun 23',
    wordCount: 1700,
    lead: 'A design system that ships components but not conviction will be routed around within two quarters. Adoption is a social problem wearing a tooling costume.',
    view: 'reading',
    progress: 80,
    favorite: false,
    tags: ['design'],
  },
  {
    id: 'art-11',
    title: 'Heat Pumps and the Retrofit Decade',
    source: 'Volts',
    author: 'David Roberts',
    savedAt: '2026-06-22',
    savedLabel: 'Jun 22',
    wordCount: 3800,
    lead: 'The hardest climate problem in the built environment is not new construction; it is the hundred million buildings that already exist. The retrofit decade starts in the basement.',
    view: 'unread',
    progress: 0,
    favorite: false,
    tags: ['climate'],
  },
  {
    id: 'art-12',
    title: 'A Field Guide to Prompt Injection',
    source: 'Simon Willison',
    author: 'Simon Willison',
    savedAt: '2026-06-21',
    savedLabel: 'Jun 21',
    wordCount: 2400,
    lead: 'Prompt injection is not a bug you patch; it is a category error in how we compose trusted and untrusted text. The field guide catalogs the attacks so far and why the obvious fixes fail.',
    view: 'archive',
    progress: 100,
    favorite: false,
    tags: ['ai', 'engineering'],
  },
  {
    id: 'art-13',
    title: 'Typography for Long Reads',
    source: 'Practical Typography',
    author: 'Matthew Butterick',
    savedAt: '2026-06-20',
    savedLabel: 'Jun 20',
    wordCount: 3100,
    lead: 'Reading a 5,000-word essay on screen is an endurance event, and typography is the aid station. Measure, leading, and contrast do more for comprehension than any summary feature.',
    view: 'unread',
    progress: 0,
    favorite: false,
    tags: ['design', 'longform'],
  },
  {
    id: 'art-14',
    title: 'The Forgetting Curve in Product Onboarding',
    source: 'Nielsen Norman Group',
    author: 'Kate Moran',
    savedAt: '2026-06-19',
    savedLabel: 'Jun 19',
    wordCount: 1600,
    lead: 'Users forget roughly half of what onboarding teaches within a day, which means the tour you polished is amortized over a memory that is actively decaying while they watch it.',
    view: 'archive',
    progress: 100,
    favorite: false,
    tags: ['psychology', 'design'],
  },
  {
    id: 'art-15',
    title: 'Compounding Knowledge',
    source: 'Commoncog',
    author: 'Cedric Chin',
    savedAt: '2026-06-18',
    savedLabel: 'Jun 18',
    wordCount: 2900,
    lead: 'Expertise compounds only when cases accumulate against a stable frame. Read widely without a frame and you get trivia; build the frame first and every case study pays interest.',
    view: 'reading',
    progress: 35,
    favorite: false,
    tags: ['productivity'],
  },
  {
    id: 'art-16',
    title: "Undersea Cables: The Internet's Backbone",
    source: 'The Verge',
    author: 'Josh Dzieza',
    savedAt: '2026-06-17',
    savedLabel: 'Jun 17',
    wordCount: 6400,
    lead: 'Ninety-nine percent of intercontinental data crosses the ocean floor through cables the width of a garden hose, maintained by a fleet of ships most of the industry has never heard of.',
    view: 'unread',
    progress: 0,
    favorite: false,
    tags: ['engineering', 'longform'],
  },
  {
    id: 'art-17',
    title: 'The Psychology of Streaks',
    source: 'Behavioral Scientist',
    author: 'Katy Milkman',
    savedAt: '2026-06-16',
    savedLabel: 'Jun 16',
    wordCount: 1300,
    lead: 'A streak is a loss-aversion machine you build for yourself. That is why it works, and also why a broken streak can end a habit that survived years of ordinary friction.',
    view: 'archive',
    progress: 100,
    favorite: false,
    tags: ['psychology'],
  },
  {
    id: 'art-18',
    title: 'Carbon Accounting for Software Teams',
    source: 'Green Software Foundation',
    author: 'Sara Bergman',
    savedAt: '2026-06-15',
    savedLabel: 'Jun 15',
    wordCount: 2100,
    lead: 'You cannot reduce what you measure in units nobody owns. Carbon accounting for software starts by attributing compute to teams the same way cloud cost already is.',
    view: 'unread',
    progress: 0,
    favorite: false,
    tags: ['climate', 'engineering'],
  },
  {
    id: 'art-19',
    title: 'Agents Need Guardrails, Not Leashes',
    source: 'Interconnects',
    author: 'Nathan Lambert',
    savedAt: '2026-06-14',
    savedLabel: 'Jun 14',
    wordCount: 2300,
    lead: 'The debate over agent autonomy keeps conflating two different controls: constraints on what an agent may do, and interruptions of everything it tries to do. Only one of them scales.',
    view: 'unread',
    progress: 0,
    favorite: true,
    tags: ['ai'],
  },
  {
    id: 'art-20',
    title: 'How Cities Learned to Count Cyclists',
    source: 'Bloomberg CityLab',
    author: 'Laura Bliss',
    savedAt: '2026-06-13',
    savedLabel: 'Jun 13',
    wordCount: 1800,
    lead: 'For decades, bike infrastructure was argued about with anecdotes because nobody was counting. Induction loops and computer vision quietly ended that argument in a handful of cities.',
    view: 'archive',
    progress: 100,
    favorite: false,
    tags: ['climate', 'design'],
  },
];

/** Letter-chip color per source; unknown sources fall back to accent. */
const SOURCE_COLOR: Record<string, string> = {
  'Works in Progress': 'var(--color-icon-blue)',
  'The Atlantic': 'var(--color-icon-red)',
  'MIT Tech Review': 'var(--color-icon-green)',
  Stratechery: 'var(--color-accent)',
  'A List Apart': 'var(--color-icon-green)',
  'Farnam Street': 'var(--color-icon-blue)',
  Increment: 'var(--color-icon-red)',
  McFunley: 'var(--color-accent)',
  'Harvard Business Review': 'var(--color-icon-red)',
  'Figma Blog': 'var(--color-icon-green)',
  Volts: 'var(--color-icon-blue)',
  'Simon Willison': 'var(--color-accent)',
  'Practical Typography': 'var(--color-icon-blue)',
  'Nielsen Norman Group': 'var(--color-icon-green)',
  Commoncog: 'var(--color-icon-red)',
  'The Verge': 'var(--color-accent)',
  'Behavioral Scientist': 'var(--color-icon-blue)',
  'Green Software Foundation': 'var(--color-icon-green)',
  Interconnects: 'var(--color-icon-red)',
  'Bloomberg CityLab': 'var(--color-icon-blue)',
};

const TOKEN_COLORS: TokenColor[] = [
  'blue',
  'purple',
  'green',
  'orange',
  'teal',
  'pink',
];

/** Deterministic tag color: stable char-code hash into the palette. */
function colorForTag(tag: string): TokenColor {
  let sum = 0;
  for (let i = 0; i < tag.length; i++) {
    sum += tag.charCodeAt(i);
  }
  return TOKEN_COLORS[sum % TOKEN_COLORS.length];
}

/** ~220 words per minute, minimum one minute. */
function readingMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 220));
}

/**
 * Shared paragraph pool for article bodies. Each article renders its
 * fixed lead paragraph followed by pool paragraphs, offset by the
 * article's index and sized by its word count — fully deterministic.
 */
const BODY_POOL: string[] = [
  'The first thing to understand is that nobody planned it this way. The system we have is the residue of a thousand reasonable decisions, each one made by someone solving the problem in front of them with the tools they had, and the sum of those decisions is something no single person would have designed.',
  'Consider the numbers for a moment. When the underlying rate changes by even a few percent, the downstream effects compound in ways that are easy to state and hard to feel. A few percent per year is invisible in any given month and unmistakable over a decade, which is exactly why it gets ignored until it cannot be.',
  'There is a version of this argument that is obviously wrong, and critics have spent years attacking it. But the strong version — the one its serious proponents actually hold — survives the standard objections, because it never claimed the mechanism was the only force at work, only that it was the one we systematically underweight.',
  'The history here is instructive. The last time an industry faced this exact shape of problem, the incumbents responded by optimizing the thing they already measured, and the entrants won by measuring something else entirely. It took less than a decade for the new metric to become the obvious one, at which point everyone claimed to have believed in it all along.',
  'Talk to practitioners and a pattern emerges quickly. The ones who have been at it longest are the least ideological about method and the most insistent about feedback: not whether you follow the process, but how fast you find out you were wrong. Everything else, they will tell you, is commentary.',
  'This is where the incentives get interesting. Everyone in the chain is behaving rationally given what they are rewarded for, and the outcome is still collectively absurd. The fix is not better people; it is a scoreboard that pays for the thing we actually want, and building that scoreboard is harder than it sounds.',
  'The counterargument deserves a fair hearing. Skeptics point out, correctly, that early results in this area have a habit of evaporating under replication, and that enthusiasm has outrun evidence before. The difference this time is not certainty — it is that the cost of checking has fallen far enough that we no longer have to argue in the abstract.',
  'What surprised the researchers was not the effect itself but its stubbornness. Control for the obvious confounders and it persists. Change the population and it persists. The effect is not enormous, but it is durable, and durable small effects are what most of the real world is made of.',
  'It helps to look at a concrete case. One team adopted the approach in the least glamorous corner of their operation, precisely because failure there would be cheap. Eighteen months later, the boring corner was the best-instrumented part of the company, and the practices spread outward not by mandate but by envy.',
  'None of this means the transition will be smooth. The awkward middle period — after the old approach stops being defensible but before the new one is fully trusted — is where most of the damage happens, and it rewards institutions that can hold two operating models at once without tearing themselves apart.',
  'The second-order effects may matter more than the headline. Once the capability exists, adjacent problems that were never worth solving suddenly are, and the people best positioned to solve them are rarely the ones who built the capability in the first place.',
  'So where does that leave us? Probably with less drama and more homework than either the optimists or the pessimists want. The lesson of every previous cycle is that the future arrives unevenly, that the bottleneck moves somewhere unexpected, and that the people who do best are the ones still paying attention after the novelty wears off.',
];

/** Body = lead + pool paragraphs, offset and sized deterministically. */
function bodyParagraphs(article: Article): string[] {
  const index = ARTICLES.findIndex(a => a.id === article.id);
  const count = Math.min(
    BODY_POOL.length,
    Math.max(4, Math.round(article.wordCount / 450)),
  );
  const paragraphs = [article.lead];
  for (let i = 0; i < count; i++) {
    paragraphs.push(BODY_POOL[(index + i) % BODY_POOL.length]);
  }
  return paragraphs;
}

// Rail selection: a built-in view or a tag filter, encoded as a string
// so it can double as the mobile Selector value.
type RailKey = \`view:\${ViewId | 'favorites'}\` | \`tag:\${string}\`;

const VIEW_ROWS: Array<{
  key: RailKey;
  label: string;
  icon: typeof InboxIcon;
}> = [
  {key: 'view:unread', label: 'Unread', icon: InboxIcon},
  {key: 'view:reading', label: 'Reading', icon: BookOpenIcon},
  {key: 'view:archive', label: 'Archive', icon: ArchiveIcon},
  {key: 'view:favorites', label: 'Favorites', icon: StarIcon},
];

type SortKey = 'newest' | 'oldest' | 'shortest' | 'longest';

const SORT_OPTIONS: Array<{value: SortKey; label: string}> = [
  {value: 'newest', label: 'Newest saved'},
  {value: 'oldest', label: 'Oldest saved'},
  {value: 'shortest', label: 'Shortest read'},
  {value: 'longest', label: 'Longest read'},
];

const TEXT_SIZES = [15, 17, 19, 21];

// ---------------------------------------------------------------------------
// SMALL PIECES
// ---------------------------------------------------------------------------

function FaviconChip({source}: {source: string}) {
  return (
    <div
      style={{
        ...styles.faviconChip,
        color: SOURCE_COLOR[source] ?? 'var(--color-accent)',
      }}
      aria-hidden="true">
      {source.charAt(0)}
    </div>
  );
}

/**
 * Tag editor shared by list rows and the reader header: check existing
 * tags on/off, or mint a new tag which immediately joins the rail list.
 */
function TagEditor({
  articleTitle,
  articleTags,
  allTags,
  draft,
  onDraftChange,
  onToggleTag,
  onAddDraft,
}: {
  articleTitle: string;
  articleTags: string[];
  allTags: string[];
  draft: string;
  onDraftChange: (value: string) => void;
  onToggleTag: (tag: string) => void;
  onAddDraft: () => void;
}) {
  return (
    <div style={styles.tagEditor}>
      <VStack gap={2}>
        <Text type="label">Tags — {articleTitle}</Text>
        <VStack gap={1}>
          {allTags.map(tag => (
            <CheckboxInput
              key={tag}
              label={tag}
              size="sm"
              value={articleTags.includes(tag)}
              onChange={() => onToggleTag(tag)}
            />
          ))}
        </VStack>
        <Divider />
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <TextInput
              label="New tag"
              isLabelHidden
              size="sm"
              placeholder="New tag…"
              value={draft}
              onChange={onDraftChange}
            />
          </StackItem>
          <Button
            label="Add"
            size="sm"
            variant="secondary"
            isDisabled={draft.trim() === ''}
            onClick={onAddDraft}
          />
        </HStack>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function ReadLaterLibraryTemplate() {
  const toast = useToast();

  // ---- live library state, seeded from fixtures ----
  const [viewById, setViewById] = useState<Record<string, ViewId>>(() =>
    Object.fromEntries(ARTICLES.map(a => [a.id, a.view] as const)),
  );
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(
    () => new Set(ARTICLES.filter(a => a.favorite).map(a => a.id)),
  );
  const [tagsById, setTagsById] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(ARTICLES.map(a => [a.id, a.tags] as const)),
  );
  const [progressById, setProgressById] = useState<Record<string, number>>(
    () => Object.fromEntries(ARTICLES.map(a => [a.id, a.progress] as const)),
  );

  // ---- surface state ----
  const [railKey, setRailKey] = useState<RailKey>('view:unread');
  const [selectedId, setSelectedId] = useState<string | null>('art-02');
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [textSizeIndex, setTextSizeIndex] = useState(1);
  // One tag-editor Popover open at a time, keyed by article id; 'reader'
  // is the add-tag popover in the reader header.
  const [tagEditorId, setTagEditorId] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');

  // Responsive contract (see file header).
  const isRailHidden = useMediaQuery('(max-width: 1024px)');
  const isListOnly = useMediaQuery('(max-width: 640px)');
  const [isReaderShownOnMobile, setIsReaderShownOnMobile] = useState(false);

  // ---- derived: tag universe, rail counts ----

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const list of Object.values(tagsById)) {
      for (const tag of list) {
        tags.add(tag);
      }
    }
    return [...tags].sort();
  }, [tagsById]);

  const viewCounts = useMemo(() => {
    const counts = {unread: 0, reading: 0, archive: 0, favorites: 0};
    for (const article of ARTICLES) {
      counts[viewById[article.id]] += 1;
      if (favoriteIds.has(article.id)) {
        counts.favorites += 1;
      }
    }
    return counts;
  }, [viewById, favoriteIds]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tag of allTags) {
      counts[tag] = 0;
    }
    for (const list of Object.values(tagsById)) {
      for (const tag of list) {
        counts[tag] += 1;
      }
    }
    return counts;
  }, [allTags, tagsById]);

  // ---- derived: visible list ----

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleArticles = useMemo(() => {
    const filtered = ARTICLES.filter(article => {
      const inRail =
        railKey === 'view:favorites'
          ? favoriteIds.has(article.id)
          : railKey.startsWith('view:')
            ? viewById[article.id] === railKey.slice(5)
            : (tagsById[article.id] ?? []).includes(railKey.slice(4));
      if (!inRail) {
        return false;
      }
      if (normalizedQuery === '') {
        return true;
      }
      return (
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.source.toLowerCase().includes(normalizedQuery) ||
        article.author.toLowerCase().includes(normalizedQuery) ||
        (tagsById[article.id] ?? []).some(tag =>
          tag.includes(normalizedQuery),
        )
      );
    });
    // Sorting reorders in place; selection is id-based, so it survives.
    return filtered.sort((a, b) => {
      switch (sortKey) {
        case 'newest':
          return a.savedAt < b.savedAt ? 1 : -1;
        case 'oldest':
          return a.savedAt > b.savedAt ? 1 : -1;
        case 'shortest':
          return a.wordCount - b.wordCount;
        case 'longest':
          return b.wordCount - a.wordCount;
      }
    });
  }, [railKey, normalizedQuery, sortKey, viewById, favoriteIds, tagsById]);

  const openArticle = ARTICLES.find(a => a.id === selectedId) ?? null;

  const railLabel =
    railKey.startsWith('view:')
      ? VIEW_ROWS.find(row => row.key === railKey)?.label ?? 'Library'
      : \`#\${railKey.slice(4)}\`;

  // ---- actions ----

  const showUndoToast = (body: string, onUndo: () => void) => {
    let dismiss: (() => void) | undefined;
    dismiss = toast({
      body,
      endContent: (
        <Button
          label="Undo"
          size="sm"
          variant="secondary"
          icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
          onClick={() => {
            onUndo();
            dismiss?.();
          }}
        />
      ),
    });
  };

  const selectRail = (key: RailKey) => {
    setRailKey(key);
    setCheckedIds(new Set());
    setSearchQuery('');
    setIsReaderShownOnMobile(false);
  };

  const openArticleRow = (id: string) => {
    setSelectedId(id);
    setIsReaderShownOnMobile(true);
  };

  /** Keep triage moving: select the next visible row, or the previous. */
  const selectNeighborOf = (id: string) => {
    const index = visibleArticles.findIndex(a => a.id === id);
    const next =
      visibleArticles[index + 1] ?? visibleArticles[index - 1] ?? null;
    setSelectedId(next === null ? null : next.id);
  };

  const archiveArticle = (id: string) => {
    const article = ARTICLES.find(a => a.id === id);
    if (article === undefined || viewById[id] === 'archive') {
      return;
    }
    const previousView = viewById[id];
    setViewById(prev => ({...prev, [id]: 'archive'}));
    if (id === selectedId && railKey !== 'view:archive') {
      selectNeighborOf(id);
    }
    if (isListOnly) {
      setIsReaderShownOnMobile(false);
    }
    showUndoToast(\`Archived "\${article.title}"\`, () => {
      setViewById(prev => ({...prev, [id]: previousView}));
    });
  };

  const restoreArticle = (id: string) => {
    const article = ARTICLES.find(a => a.id === id);
    if (article === undefined) {
      return;
    }
    const target: ViewId =
      (progressById[id] ?? 0) > 0 && (progressById[id] ?? 0) < 100
        ? 'reading'
        : 'unread';
    setViewById(prev => ({...prev, [id]: target}));
    toast({
      body: \`Moved "\${article.title}" to \${target === 'reading' ? 'Reading' : 'Unread'}\`,
    });
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleChecked = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const bulkArchive = () => {
    const moved = [...checkedIds]
      .filter(id => viewById[id] !== 'archive')
      .map(id => [id, viewById[id]] as const);
    if (moved.length === 0) {
      setCheckedIds(new Set());
      return;
    }
    setViewById(prev => {
      const next = {...prev};
      for (const [id] of moved) {
        next[id] = 'archive';
      }
      return next;
    });
    setCheckedIds(new Set());
    showUndoToast(
      \`Archived \${moved.length} article\${moved.length === 1 ? '' : 's'}\`,
      () => {
        setViewById(prev => {
          const next = {...prev};
          for (const [id, view] of moved) {
            next[id] = view;
          }
          return next;
        });
      },
    );
  };

  const bulkFavorite = () => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      for (const id of checkedIds) {
        next.add(id);
      }
      return next;
    });
    toast({body: \`Favorited \${checkedIds.size} article\${checkedIds.size === 1 ? '' : 's'}\`});
    setCheckedIds(new Set());
  };

  const toggleTag = (id: string, tag: string) => {
    setTagsById(prev => {
      const current = prev[id] ?? [];
      const next = current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag].sort();
      return {...prev, [id]: next};
    });
  };

  const addDraftTag = (id: string) => {
    const tag = tagDraft.trim().toLowerCase();
    if (tag === '') {
      return;
    }
    setTagsById(prev => {
      const current = prev[id] ?? [];
      return current.includes(tag)
        ? prev
        : {...prev, [id]: [...current, tag].sort()};
    });
    setTagDraft('');
  };

  const openTagEditor = (id: string | null) => {
    setTagEditorId(id);
    setTagDraft('');
  };

  // Keyboard triage on the focused list container. The search input and
  // sort selector live outside this element, so plain letters are safe.
  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    const key = event.key.toLowerCase();
    const index =
      selectedId === null
        ? -1
        : visibleArticles.findIndex(a => a.id === selectedId);
    switch (key) {
      case 'j':
      case 'arrowdown': {
        event.preventDefault();
        const next = visibleArticles[index + 1] ?? visibleArticles[0];
        if (next !== undefined) {
          setSelectedId(next.id);
        }
        break;
      }
      case 'k':
      case 'arrowup': {
        event.preventDefault();
        const prev =
          index <= 0
            ? visibleArticles[visibleArticles.length - 1]
            : visibleArticles[index - 1];
        if (prev !== undefined) {
          setSelectedId(prev.id);
        }
        break;
      }
      case 'a':
        event.preventDefault();
        if (selectedId !== null) {
          if (viewById[selectedId] === 'archive') {
            restoreArticle(selectedId);
          } else {
            archiveArticle(selectedId);
          }
        }
        break;
      case 'f':
        event.preventDefault();
        if (selectedId !== null) {
          toggleFavorite(selectedId);
        }
        break;
      case 't':
        event.preventDefault();
        if (selectedId !== null) {
          openTagEditor(tagEditorId === selectedId ? null : selectedId);
        }
        break;
      case 'x':
        event.preventDefault();
        if (selectedId !== null) {
          toggleChecked(selectedId);
        }
        break;
      default:
        break;
    }
  };

  // Scrolling the reader ratchets progress (never regresses) and
  // auto-moves an Unread article into Reading on first scroll.
  const onReaderScroll = (event: UIEvent<HTMLDivElement>) => {
    if (openArticle === null) {
      return;
    }
    const el = event.currentTarget;
    const denominator = el.scrollHeight - el.clientHeight;
    const pct =
      denominator <= 0
        ? 100
        : Math.min(100, Math.round((el.scrollTop / denominator) * 100));
    const id = openArticle.id;
    setProgressById(prev =>
      pct > (prev[id] ?? 0) ? {...prev, [id]: pct} : prev,
    );
    if (pct > 0 && viewById[id] === 'unread') {
      setViewById(prev => ({...prev, [id]: 'reading'}));
    }
  };

  // ---- rail ----

  const railList = (
    <Stack direction="vertical" style={styles.railColumn}>
      <div style={styles.railSection}>
        <List density="compact" hasDividers={false}>
          {VIEW_ROWS.map(row => {
            const count =
              row.key === 'view:favorites'
                ? viewCounts.favorites
                : viewCounts[row.key.slice(5) as ViewId];
            return (
              <ListItem
                key={row.key}
                label={row.label}
                isSelected={railKey === row.key}
                onClick={() => selectRail(row.key)}
                startContent={
                  <Icon icon={row.icon} size="sm" color="secondary" />
                }
                endContent={
                  count > 0 ? (
                    <Badge label={String(count)} variant="info" />
                  ) : undefined
                }
              />
            );
          })}
        </List>
      </div>
      <div style={styles.railGroupLabel}>
        <Text type="label" color="secondary">
          Tags
        </Text>
      </div>
      <div style={styles.railSection}>
        <List density="compact" hasDividers={false}>
          {allTags.map(tag => (
            <ListItem
              key={tag}
              label={tag}
              isSelected={railKey === \`tag:\${tag}\`}
              onClick={() => selectRail(\`tag:\${tag}\`)}
              startContent={<Icon icon={TagIcon} size="sm" color="secondary" />}
              endContent={
                <Text type="supporting" color="secondary">
                  {tagCounts[tag]}
                </Text>
              }
            />
          ))}
        </List>
      </div>
    </Stack>
  );

  // ---- article rows ----

  const renderArticleRow = (article: Article) => {
    const view = viewById[article.id];
    const progress = progressById[article.id] ?? 0;
    const tags = tagsById[article.id] ?? [];
    const isFavorite = favoriteIds.has(article.id);
    const tapStyle = isListOnly ? styles.iconTapTarget : undefined;
    return (
      <ListItem
        key={article.id}
        isSelected={article.id === selectedId}
        onClick={() => openArticleRow(article.id)}
        startContent={
          <div onClick={event => event.stopPropagation()}>
            <CheckboxInput
              label={\`Select \${article.title}\`}
              isLabelHidden
              size={isListOnly ? 'md' : 'sm'}
              value={checkedIds.has(article.id)}
              onChange={() => toggleChecked(article.id)}
            />
          </div>
        }
        label={
          <HStack gap={2} vAlign="center">
            <FaviconChip source={article.source} />
            <StackItem size="fill">
              <Text
                type="body"
                weight={view === 'unread' ? 'semibold' : 'normal'}
                maxLines={2}>
                {article.title}
              </Text>
            </StackItem>
          </HStack>
        }
        description={
          <VStack gap={1}>
            <div style={styles.tabularMeta}>
              <Text type="supporting" color="secondary" maxLines={1}>
                {article.source} · {readingMinutes(article.wordCount)} min ·
                Saved {article.savedLabel}
                {progress === 100 ? ' · Finished' : ''}
              </Text>
            </div>
            {progress > 0 && progress < 100 && (
              <div style={styles.rowProgress}>
                <ProgressBar
                  value={progress}
                  max={100}
                  label={\`\${article.title} — \${progress}% read\`}
                  isLabelHidden
                />
              </div>
            )}
            {tags.length > 0 && (
              <div style={styles.tagRow}>
                {tags.map(tag => (
                  <Token
                    key={tag}
                    label={tag}
                    color={colorForTag(tag)}
                    size="sm"
                  />
                ))}
              </div>
            )}
          </VStack>
        }
        endContent={
          <div onClick={event => event.stopPropagation()}>
            <HStack gap={1} vAlign="center">
              <Tooltip
                content={isFavorite ? 'Remove favorite' : 'Favorite'}>
                <IconButton
                  label={
                    isFavorite
                      ? \`Remove \${article.title} from favorites\`
                      : \`Favorite \${article.title}\`
                  }
                  size="sm"
                  variant={isFavorite ? 'secondary' : 'ghost'}
                  style={tapStyle}
                  icon={<Icon icon={StarIcon} size="sm" />}
                  onClick={() => toggleFavorite(article.id)}
                />
              </Tooltip>
              <Popover
                label={\`Edit tags for \${article.title}\`}
                placement="below"
                alignment="end"
                isOpen={tagEditorId === article.id}
                onOpenChange={isOpen =>
                  openTagEditor(isOpen ? article.id : null)
                }
                content={
                  <TagEditor
                    articleTitle={article.title}
                    articleTags={tags}
                    allTags={allTags}
                    draft={tagDraft}
                    onDraftChange={setTagDraft}
                    onToggleTag={tag => toggleTag(article.id, tag)}
                    onAddDraft={() => addDraftTag(article.id)}
                  />
                }>
                <IconButton
                  label={\`Edit tags for \${article.title}\`}
                  tooltip="Edit tags"
                  size="sm"
                  variant="ghost"
                  style={tapStyle}
                  icon={<Icon icon={TagIcon} size="sm" />}
                />
              </Popover>
            </HStack>
          </div>
        }
      />
    );
  };

  // ---- article list pane ----

  const articleList = (
    <Stack direction="vertical" style={styles.listColumn}>
      <div style={styles.listHeader}>
        <VStack gap={2}>
          {isRailHidden && (
            <Selector
              label="View"
              isLabelHidden
              size="sm"
              options={[
                ...VIEW_ROWS.map(row => ({
                  value: row.key,
                  label: \`\${row.label} (\${
                    row.key === 'view:favorites'
                      ? viewCounts.favorites
                      : viewCounts[row.key.slice(5) as ViewId]
                  })\`,
                })),
                ...allTags.map(tag => ({
                  value: \`tag:\${tag}\`,
                  label: \`#\${tag} (\${tagCounts[tag]})\`,
                })),
              ]}
              value={railKey}
              onChange={value => selectRail(value as RailKey)}
            />
          )}
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <TextInput
                label={\`Search \${railLabel}\`}
                isLabelHidden
                size="sm"
                placeholder={\`Search \${railLabel.toLowerCase()}…\`}
                startIcon={SearchIcon}
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </StackItem>
            <Selector
              label="Sort articles"
              isLabelHidden
              size="sm"
              options={SORT_OPTIONS}
              value={sortKey}
              onChange={value => setSortKey(value as SortKey)}
            />
          </HStack>
        </VStack>
      </div>
      <Divider />
      {checkedIds.size > 0 && (
        <>
          <div style={styles.bulkBar}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label">{checkedIds.size} selected</Text>
              </StackItem>
              <Button
                label="Archive"
                size="sm"
                variant="secondary"
                icon={<Icon icon={ArchiveIcon} size="sm" />}
                onClick={bulkArchive}
              />
              <Button
                label="Favorite"
                size="sm"
                variant="ghost"
                icon={<Icon icon={StarIcon} size="sm" />}
                onClick={bulkFavorite}
              />
              <IconButton
                label="Clear selection"
                tooltip="Clear selection"
                size="sm"
                variant="ghost"
                icon={<Icon icon={XIcon} size="sm" />}
                onClick={() => setCheckedIds(new Set())}
              />
            </HStack>
          </div>
          <Divider />
        </>
      )}
      <StackItem
        size="fill"
        style={styles.listScroll}
        tabIndex={0}
        aria-label={\`\${railLabel} articles. Press A to archive, F to favorite, T to edit tags, X to select, J and K to move.\`}
        aria-keyshortcuts="a f t x j k"
        onKeyDown={onListKeyDown}>
        {visibleArticles.length === 0 ? (
          <div style={styles.listEmpty}>
            <EmptyState
              isCompact
              icon={<Icon icon={BookmarkIcon} size="lg" />}
              title={normalizedQuery === '' ? 'Nothing here' : 'No matches'}
              description={
                normalizedQuery === ''
                  ? \`Articles you move to \${railLabel} will show up in this list.\`
                  : \`Nothing in \${railLabel} matches "\${searchQuery.trim()}".\`
              }
            />
          </div>
        ) : (
          <List density="compact" hasDividers>
            {visibleArticles.map(renderArticleRow)}
          </List>
        )}
      </StackItem>
    </Stack>
  );

  // ---- reader pane ----

  const openProgress =
    openArticle === null ? 0 : progressById[openArticle.id] ?? 0;
  const openTags = openArticle === null ? [] : tagsById[openArticle.id] ?? [];
  const isOpenArchived =
    openArticle !== null && viewById[openArticle.id] === 'archive';
  const isOpenFavorite =
    openArticle !== null && favoriteIds.has(openArticle.id);
  const textSize = TEXT_SIZES[textSizeIndex];

  const readerPane = (
    <Stack direction="vertical" style={styles.readerColumn}>
      <Toolbar
        label="Reader actions"
        size="sm"
        dividers={['bottom']}
        startContent={
          <>
            {isListOnly && (
              <IconButton
                label="Back to list"
                tooltip="Back to list"
                size="sm"
                variant="ghost"
                style={styles.iconTapTarget}
                icon={<Icon icon={ArrowLeftIcon} size="sm" />}
                onClick={() => setIsReaderShownOnMobile(false)}
              />
            )}
            <Tooltip
              content={isOpenFavorite ? 'Remove favorite' : 'Favorite'}>
              <IconButton
                label={isOpenFavorite ? 'Remove favorite' : 'Favorite'}
                size="sm"
                variant={isOpenFavorite ? 'secondary' : 'ghost'}
                style={isListOnly ? styles.iconTapTarget : undefined}
                icon={<Icon icon={StarIcon} size="sm" />}
                isDisabled={openArticle === null}
                onClick={() =>
                  openArticle !== null && toggleFavorite(openArticle.id)
                }
              />
            </Tooltip>
            <Button
              label={isOpenArchived ? 'Restore' : 'Archive'}
              size="sm"
              variant="ghost"
              icon={
                <Icon
                  icon={isOpenArchived ? ArchiveRestoreIcon : ArchiveIcon}
                  size="sm"
                />
              }
              isDisabled={openArticle === null}
              onClick={() => {
                if (openArticle === null) {
                  return;
                }
                if (isOpenArchived) {
                  restoreArticle(openArticle.id);
                } else {
                  archiveArticle(openArticle.id);
                }
              }}
            />
          </>
        }
        endContent={
          <HStack gap={1} vAlign="center">
            <IconButton
              label="Decrease text size"
              tooltip="Smaller text"
              size="sm"
              variant="ghost"
              style={isListOnly ? styles.iconTapTarget : undefined}
              icon={<Icon icon={MinusIcon} size="sm" />}
              isDisabled={textSizeIndex === 0}
              onClick={() => setTextSizeIndex(index => Math.max(0, index - 1))}
            />
            <div style={styles.tabularMeta}>
              <Text type="supporting" color="secondary">
                Aa {textSize}px
              </Text>
            </div>
            <IconButton
              label="Increase text size"
              tooltip="Larger text"
              size="sm"
              variant="ghost"
              style={isListOnly ? styles.iconTapTarget : undefined}
              icon={<Icon icon={PlusIcon} size="sm" />}
              isDisabled={textSizeIndex === TEXT_SIZES.length - 1}
              onClick={() =>
                setTextSizeIndex(index =>
                  Math.min(TEXT_SIZES.length - 1, index + 1),
                )
              }
            />
          </HStack>
        }
      />
      {openArticle === null ? (
        <StackItem size="fill">
          <div style={styles.readerEmpty}>
            <EmptyState
              icon={<Icon icon={BookOpenIcon} size="lg" />}
              title="Select an article"
              description="Choose a saved article from the list to read it here."
            />
          </div>
        </StackItem>
      ) : (
        // key remounts the scroll container per article so scroll
        // position (and therefore progress tracking) starts at the top.
        <StackItem
          key={openArticle.id}
          size="fill"
          style={styles.readerScroll}
          onScroll={onReaderScroll}>
          <VStack gap={4} style={styles.readerBody}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <FaviconChip source={openArticle.source} />
                <Text type="label">{openArticle.source}</Text>
                <Text type="supporting" color="secondary">
                  {openArticle.author} ·{' '}
                  {readingMinutes(openArticle.wordCount)} min read · Saved{' '}
                  {openArticle.savedLabel}
                </Text>
              </HStack>
              <Heading level={2}>{openArticle.title}</Heading>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <ProgressBar
                    value={openProgress}
                    max={100}
                    label="Read progress"
                    isLabelHidden
                  />
                </StackItem>
                {openProgress === 100 ? (
                  <Badge label="Finished" variant="success" />
                ) : (
                  <div style={styles.tabularMeta}>
                    <Text type="supporting" color="secondary">
                      {openProgress}% read
                    </Text>
                  </div>
                )}
              </HStack>
              <div style={styles.tagRow}>
                {openTags.map(tag => (
                  <Tooltip key={tag} content={\`Remove tag "\${tag}"\`}>
                    <Button
                      label={tag}
                      size="sm"
                      variant="secondary"
                      icon={<Icon icon={XIcon} size="sm" />}
                      onClick={() => toggleTag(openArticle.id, tag)}
                    />
                  </Tooltip>
                ))}
                <Popover
                  label={\`Add tags to \${openArticle.title}\`}
                  placement="below"
                  alignment="start"
                  isOpen={tagEditorId === 'reader'}
                  onOpenChange={isOpen =>
                    openTagEditor(isOpen ? 'reader' : null)
                  }
                  content={
                    <TagEditor
                      articleTitle={openArticle.title}
                      articleTags={openTags}
                      allTags={allTags}
                      draft={tagDraft}
                      onDraftChange={setTagDraft}
                      onToggleTag={tag => toggleTag(openArticle.id, tag)}
                      onAddDraft={() => addDraftTag(openArticle.id)}
                    />
                  }>
                  <Button
                    label="Add tag"
                    size="sm"
                    variant="ghost"
                    icon={<Icon icon={TagIcon} size="sm" />}
                  />
                </Popover>
              </div>
            </VStack>
            <Divider />
            <VStack gap={3}>
              {bodyParagraphs(openArticle).map((paragraph, index) => (
                <p
                  key={index}
                  style={{
                    ...styles.paragraph,
                    fontSize: textSize,
                    lineHeight: 1.65,
                  }}>
                  {paragraph}
                </p>
              ))}
            </VStack>
            <Divider />
            <Text type="supporting" color="secondary" justify="center">
              End of article · {openArticle.source}
            </Text>
          </VStack>
        </StackItem>
      )}
    </Stack>
  );

  // ---- frame ----

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Icon icon={BookmarkIcon} size="md" color="secondary" />
                <Heading level={1}>Read Later</Heading>
                <Text type="supporting" color="secondary">
                  {viewCounts.unread} unread · {viewCounts.reading} in
                  progress
                </Text>
              </HStack>
            </StackItem>
            {!isRailHidden && (
              <HStack gap={1} vAlign="center">
                <Kbd keys="a" />
                <Text type="supporting" color="secondary">
                  archive
                </Text>
                <Kbd keys="f" />
                <Text type="supporting" color="secondary">
                  favorite
                </Text>
                <Kbd keys="t" />
                <Text type="supporting" color="secondary">
                  tag
                </Text>
              </HStack>
            )}
          </HStack>
        </LayoutHeader>
      }
      start={
        isListOnly ? undefined : (
          <>
            {!isRailHidden && (
              <LayoutPanel width={224} padding={0} hasDivider label="Views">
                {railList}
              </LayoutPanel>
            )}
            <LayoutPanel width={360} padding={0} hasDivider label="Articles">
              {articleList}
            </LayoutPanel>
          </>
        )
      }
      content={
        <LayoutContent padding={0}>
          {isListOnly && !isReaderShownOnMobile ? articleList : readerPane}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};