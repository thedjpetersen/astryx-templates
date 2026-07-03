// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Blog & Content Sections — a marketing section library showing
 *   three blog-listing variants and two long-form content variants on
 *   one scrolling page, every variant live and interactive.
 *
 * @input Deterministic fixtures only: 9 invented engineering-blog posts
 *   (fixed titles, authors, categories, ISO dates, read times, gradient
 *   cover accents) and one full article body assembled from a fixed
 *   block list (headings, paragraphs with inline code segments, a
 *   pull-quote, a figure placeholder). No Date.now(), Math.random(),
 *   network assets, or real images — covers and figures are styled
 *   gradient placeholders.
 * @output A section-library page under a sticky LayoutHeader with a
 *   variant jump Selector. Upper region, three blog-section variants:
 *   (1) a 3-up post-card grid with live category-chip filtering,
 *   read-time metadata, and save toggles; (2) a featured-post split —
 *   large lead card beside a stacked list of four where clicking any
 *   list row promotes it to the lead; (3) a minimal chronological list
 *   with dates in a left gutter and a newest/oldest order switch.
 *   Lower region, two content-section variants: (4) a centered prose
 *   article with styled headings, a pull-quote, a figure placeholder,
 *   inline code, a copy-link action, and a validating newsletter
 *   signup; (5) a two-column article with an in-page table of contents
 *   beside its own scroll region — TOC links smooth-scroll and the
 *   active heading is scroll-spied as the article moves.
 * @position Page template; emitted by
 *   `astryx template marketing-blog-content-sections`. Choose over
 *   infinite-scroll-feed when the surface is a marketing/blog landing
 *   built from distinct section archetypes rather than a single stream;
 *   choose over read-later-library when posts are published content to
 *   browse, not a personal triage queue.
 *
 * Frame: Layout height="fill"; LayoutHeader pinned (title + variant
 *   jump Selector + subscribe shortcut); LayoutContent owns the page
 *   scroll. Inside, one centered 1120px column stacks the five variant
 *   demos, each introduced by a numbered section heading. The TOC
 *   variant embeds its own bounded 520px scroll region so scroll-spy
 *   and smooth-scroll are self-contained — the page itself never needs
 *   position:sticky.
 *
 * Responsive contract:
 * - Page column: max-width 1120px, centered; the prose article narrows
 *   further to a 680px measure.
 * - >880px  — card grid auto-fills 250px-min columns (3-up at full
 *   width); featured split is lead (1.4fr) beside the stacked list;
 *   TOC variant is a 220px rail beside the article scroll region.
 * - <=880px — featured split stacks lead above the list; the TOC rail
 *   is replaced by a horizontally scrollable chip row above the
 *   article region (deliberate overflowX; same smooth-scroll + spy);
 *   the header drops the variant count caption.
 * - <=640px — the grid collapses to one column via auto-fill; the
 *   chrono date gutter narrows from 96px to 72px; header controls wrap
 *   under the title; the subscribe shortcut collapses to icon-only;
 *   save toggles, chips, and TOC chips grow to ~40px tap targets.
 * - No hover-only interactions anywhere: chips, rows, TOC links, and
 *   toggles are all click/tap; titles clamp (2 lines) and chip rows
 *   wrap instead of overflowing.
 *
 * Container policy (marketing/blog archetype): Cards for post tiles
 * and the newsletter panel, List/ListItem rows for the featured stack
 * and TOC rail, plain measured columns for prose. Category chips are
 * ToggleButtons; metadata uses Text + Token; the only Badges are
 * category and "New" markers.
 *
 * Color policy: the category cover gradients (CATEGORY_GRADIENT) and the
 * figure placeholder are deliberately scheme-locked — they stand in for
 * cover images, and art must render the same pixels in both themes, so
 * they keep raw literal gradient stops and pin colorScheme on their
 * surfaces. The white cover glyph and the figure icon ink sit on those
 * locked surfaces and stay literal so they remain readable. Everything
 * else is token-pure (var(--color-*)).
 */

import {useMemo, useRef, useState, type CSSProperties, type UIEvent} from 'react';

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  HStack,
  VStack,
  StackItem,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  BookmarkIcon,
  ChartNoAxesCombinedIcon,
  ClockIcon,
  ImageIcon,
  LinkIcon,
  MailIcon,
  NewspaperIcon,
  QuoteIcon,
  RssIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties on semantic tokens; literal hex only in
// the deterministic gradient placeholders.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // One centered column owns page width; sections stack inside it.
  pageColumn: {
    width: '100%',
    maxWidth: 1120,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // 3-up card grid: auto-fill collapses to 1 column near 375px wide.
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 'var(--spacing-3)',
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
  },
  // Gradient cover placeholder — never a network image. Scheme-locked
  // stand-in for cover art: same pixels in both themes (see header
  // "Color policy"), hence the pinned colorScheme.
  cover: {
    height: 120,
    borderRadius: 'var(--radius-inner)',
    colorScheme: 'dark',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadCover: {
    height: 220,
    borderRadius: 'var(--radius-inner)',
    colorScheme: 'dark',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverGlyph: {
    fontFamily: 'var(--font-family-heading)',
    fontWeight: 700,
    // Literal white on the scheme-locked gradient (see "Color policy").
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
  // Featured split: lead card 1.4fr beside the stacked list.
  featuredSplit: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: 'var(--spacing-3)',
    alignItems: 'start',
  },
  featuredSplitStacked: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 'var(--spacing-3)',
  },
  // Chronological list: fixed date gutter left of each row.
  chronoRow: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
  },
  chronoGutter: {
    width: 96,
    flexShrink: 0,
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
  chronoGutterNarrow: {
    width: 72,
    flexShrink: 0,
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
  // Long-form prose: a 680px reading measure inside the page column.
  proseColumn: {
    width: '100%',
    maxWidth: 680,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  paragraph: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.7,
    color: 'var(--color-text-primary)',
  },
  inlineCode: {
    fontFamily: 'var(--font-family-code)',
    fontSize: '0.875em',
    background: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-element)',
    padding: '1px 5px',
    whiteSpace: 'nowrap',
  },
  pullQuote: {
    borderLeft: '3px solid var(--color-accent)',
    paddingLeft: 'var(--spacing-4)',
    marginBlock: 'var(--spacing-2)',
  },
  pullQuoteText: {
    margin: 0,
    fontFamily: 'var(--font-family-heading)',
    fontStyle: 'italic',
    fontSize: 21,
    lineHeight: 1.5,
    color: 'var(--color-text-primary)',
  },
  // Scheme-locked like the covers (see "Color policy"): the gradient and
  // its icon ink render the same pixels in both themes, so the ink is a
  // literal pinned to the light-theme text value rather than a token.
  figureBox: {
    height: 220,
    borderRadius: 'var(--radius-container)',
    colorScheme: 'light',
    color: '#15110C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // TOC variant: rail beside a bounded scroll region. The rail does not
  // scroll, so it reads as sticky while only the article moves.
  tocLayout: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  tocRail: {
    paddingTop: 'var(--spacing-1)',
  },
  // position:relative makes the scroll region the offsetParent so
  // heading offsetTop values are container-relative for the spy math.
  articleScroll: {
    position: 'relative',
    height: 520,
    overflowY: 'auto',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-5)',
    boxSizing: 'border-box',
    background: 'var(--color-background-card)',
  },
  // <=880px TOC fallback: horizontal chip row, deliberate overflowX.
  tocChipRow: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-1)',
  },
  errorText: {
    margin: 0,
    fontSize: 13,
    color: 'var(--color-text-red)',
  },
  // <=640px: grow sm controls to ~40px thumb targets.
  tapTarget: {minHeight: 40},
  iconTapTarget: {width: 40, height: 40},
  tabularMeta: {fontVariantNumeric: 'tabular-nums'},
};

// ---------------------------------------------------------------------------
// DATA — 9 invented engineering-blog posts + one full article body.
// ---------------------------------------------------------------------------

type Category =
  | 'Infrastructure'
  | 'Frontend'
  | 'Reliability'
  | 'Data'
  | 'Security';

const CATEGORIES: Category[] = [
  'Infrastructure',
  'Frontend',
  'Reliability',
  'Data',
  'Security',
];

const CATEGORY_TOKEN: Record<Category, TokenColor> = {
  Infrastructure: 'purple',
  Frontend: 'pink',
  Reliability: 'green',
  Data: 'orange',
  Security: 'blue',
};

/**
 * Deterministic gradient per category; covers are never real images.
 * Scheme-locked brand art (see header "Color policy"): literal hex stops
 * on purpose — the surfaces that paint these pin colorScheme.
 */
const CATEGORY_GRADIENT: Record<Category, string> = {
  Infrastructure: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  Frontend: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
  Reliability: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
  Data: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  Security: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  category: Category;
  /** ISO date for sorting; dateLabel is the display string. */
  publishedAt: string;
  dateLabel: string;
  readMinutes: number;
  isNew?: boolean;
}

const POSTS: BlogPost[] = [
  {
    id: 'post-01',
    title: 'Zero-downtime schema migrations at 40k writes per second',
    excerpt:
      'Our orders table takes 40,000 writes a second and used to take ' +
      'the site down every time we touched it. Here is the ' +
      'expand–contract pipeline that ended migration maintenance ' +
      'windows for good.',
    author: 'Priya Raman',
    role: 'Staff Engineer',
    category: 'Infrastructure',
    publishedAt: '2026-06-30',
    dateLabel: 'Jun 30, 2026',
    readMinutes: 11,
    isNew: true,
  },
  {
    id: 'post-02',
    title: 'The case for boring CSS: how we deleted 60% of our styles',
    excerpt:
      'Every clever selector is a future incident. We replaced three ' +
      'competing styling systems with one set of dull, predictable ' +
      'utilities — and shipped faster the very next sprint.',
    author: 'Marco Silva',
    role: 'Frontend Engineer',
    category: 'Frontend',
    publishedAt: '2026-06-27',
    dateLabel: 'Jun 27, 2026',
    readMinutes: 7,
    isNew: true,
  },
  {
    id: 'post-03',
    title: 'Load shedding that customers never notice',
    excerpt:
      'Dropping traffic is easy; dropping the right traffic is the ' +
      'whole game. How we rank requests by revenue impact and shed ' +
      'the bottom tier before the queues ever feel it.',
    author: 'Amara Diallo',
    role: 'Site Reliability Engineer',
    category: 'Reliability',
    publishedAt: '2026-06-24',
    dateLabel: 'Jun 24, 2026',
    readMinutes: 9,
  },
  {
    id: 'post-04',
    title: 'One trillion events later: lessons from our streaming rewrite',
    excerpt:
      'We rewrote the event pipeline while it was serving a trillion ' +
      'events a month. The migration plan fit on one page; the lessons ' +
      'did not.',
    author: 'Wei Zhang',
    role: 'Data Platform Lead',
    category: 'Data',
    publishedAt: '2026-06-20',
    dateLabel: 'Jun 20, 2026',
    readMinutes: 12,
  },
  {
    id: 'post-05',
    title: 'Rotating every credential in production over one weekend',
    excerpt:
      'A leaked laptop forced our hand: 4,100 secrets across 300 ' +
      'services, rotated in 52 hours. The tooling we built in a panic ' +
      'is now the calm, quarterly routine.',
    author: 'Lena Fischer',
    role: 'Security Engineer',
    category: 'Security',
    publishedAt: '2026-06-17',
    dateLabel: 'Jun 17, 2026',
    readMinutes: 8,
  },
  {
    id: 'post-06',
    title: 'Design tokens as a compile target',
    excerpt:
      'Stop hand-syncing colors between Figma, iOS, Android, and the ' +
      'web. We treat tokens as source code with a compiler — and every ' +
      'platform is just another build artifact.',
    author: 'Noor Haddad',
    role: 'Design Systems Engineer',
    category: 'Frontend',
    publishedAt: '2026-06-12',
    dateLabel: 'Jun 12, 2026',
    readMinutes: 6,
  },
  {
    id: 'post-07',
    title: 'Our bare-metal Kubernetes bill, itemized',
    excerpt:
      'Everyone asks whether leaving the cloud saved us money. Here is ' +
      'the actual ledger: hardware, colo, people, and the surprises ' +
      'nobody blogs about.',
    author: 'Tom Okonkwo',
    role: 'Platform Engineer',
    category: 'Infrastructure',
    publishedAt: '2026-06-08',
    dateLabel: 'Jun 8, 2026',
    readMinutes: 10,
  },
  {
    id: 'post-08',
    title: 'Postmortem culture without the blame theater',
    excerpt:
      'A postmortem that names a person has already failed. The five ' +
      'questions we ask instead, and the incident metrics that moved ' +
      'once people stopped flinching.',
    author: 'Sofia Marchetti',
    role: 'Engineering Manager',
    category: 'Reliability',
    publishedAt: '2026-06-03',
    dateLabel: 'Jun 3, 2026',
    readMinutes: 5,
  },
  {
    id: 'post-09',
    title: 'Query planner archaeology: a 40x speedup from one hint',
    excerpt:
      'The dashboard query was slow for three years and everyone had a ' +
      'theory. The real culprit was a statistics target set in 2019 — ' +
      'a dig through the planner that ends with one line of SQL.',
    author: 'Priya Raman',
    role: 'Staff Engineer',
    category: 'Data',
    publishedAt: '2026-05-29',
    dateLabel: 'May 29, 2026',
    readMinutes: 8,
  },
];

/** Featured-split fixture: the lead swaps with any clicked list row. */
const FEATURED_IDS = ['post-01', 'post-03', 'post-04', 'post-05', 'post-06'];

// ---------------------------------------------------------------------------
// ARTICLE BODY — one full long-form article (post-01), block-structured
// so both content-section variants render the same fixture.
// ---------------------------------------------------------------------------

interface TextSegment {
  text: string;
  isCode?: boolean;
}

type ArticleBlock =
  | {kind: 'heading'; id: string; text: string}
  | {kind: 'paragraph'; segments: TextSegment[]}
  | {kind: 'quote'; text: string; attribution: string}
  | {kind: 'figure'; caption: string};

const ARTICLE_BLOCKS: ArticleBlock[] = [
  {
    kind: 'paragraph',
    segments: [
      {
        text:
          'Every engineer on the orders team knew the ritual: schedule a ' +
          'maintenance window, warm up the read replicas, hold your ' +
          'breath, and run the migration at 3 a.m. hoping the ',
      },
      {text: 'ALTER TABLE', isCode: true},
      {
        text:
          ' finished before the morning traffic ramp. Twice last year it ' +
          'did not, and both times the site paid for it. This post is the ' +
          'story of the pipeline that replaced that ritual — and the ' +
          'numbers from six months of running it in production.',
      },
    ],
  },
  {kind: 'heading', id: 'why-migrations-paged-us', text: 'Why migrations kept paging us'},
  {
    kind: 'paragraph',
    segments: [
      {
        text:
          'The orders table absorbs about 40,000 writes per second at ' +
          'peak. At that rate, any operation that takes a table-level ' +
          'lock — even briefly — turns into a queue of stalled ' +
          'transactions that backs up through the connection pool and ' +
          'into the checkout path. Our worst incident began with a ' +
          'nine-second lock and ended with eleven minutes of degraded ' +
          'checkouts.',
      },
    ],
  },
  {
    kind: 'paragraph',
    segments: [
      {
        text:
          'The uncomfortable part was that none of the individual ' +
          'migrations were reckless. Each one had been reviewed, tested ' +
          'against a staging snapshot, and sized as "safe." The failure ' +
          'mode was systemic: staging never reproduced production write ' +
          'pressure, so lock contention simply did not exist until the ' +
          'one moment it mattered.',
      },
    ],
  },
  {
    kind: 'quote',
    text:
      'A migration plan that depends on low traffic is not a plan; it ' +
      'is a bet that your busiest customers will sleep in.',
    attribution: 'Internal migration review, January 2026',
  },
  {kind: 'heading', id: 'expand-contract-loop', text: 'Designing the expand–contract loop'},
  {
    kind: 'paragraph',
    segments: [
      {
        text:
          'We rebuilt the process around a strict expand–contract loop. ' +
          'Every schema change is decomposed into additive steps that ' +
          'old and new code can both live with: add the new column ' +
          'nullable, deploy code that writes both shapes behind a ',
      },
      {text: 'dual_write', isCode: true},
      {
        text:
          ' flag, backfill in throttled batches, verify, then contract ' +
          'by dropping the old shape weeks later. No single step is ' +
          'allowed to require a lock the planner cannot satisfy ' +
          'instantly.',
      },
    ],
  },
  {
    kind: 'paragraph',
    segments: [
      {
        text:
          'The discipline lives in tooling, not memory. A linter rejects ' +
          'any migration file containing a blocking operation — ',
      },
      {text: 'ADD COLUMN ... DEFAULT', isCode: true},
      {
        text: ' on our Postgres version, ',
      },
      {text: 'CREATE INDEX', isCode: true},
      {
        text:
          ' without ',
      },
      {text: 'CONCURRENTLY', isCode: true},
      {
        text:
          ', type narrowing, and eleven other patterns. Engineers can ' +
          'override the linter, but the override pings the whole team in ' +
          'review, which turns out to be all the friction anyone needs.',
      },
    ],
  },
  {kind: 'heading', id: 'ghost-tables-dual-writes', text: 'Ghost tables and dual writes'},
  {
    kind: 'paragraph',
    segments: [
      {
        text:
          'For changes that cannot be expressed additively — splitting a ' +
          'column, changing a primary key — we build a ghost table: a ' +
          'full copy with the target schema, kept in sync by triggers ' +
          'while a backfill walks the keyspace in 5,000-row chunks. The ' +
          'chunk size is adaptive; if replica lag crosses 500 ms, the ' +
          'backfill halves its batch and waits.',
      },
    ],
  },
  {kind: 'figure', caption: 'Figure 1 — Write flow during a ghost-table migration: application writes fan out to the primary table and the ghost via trigger, while the backfill walks older rows in throttled chunks.'},
  {
    kind: 'paragraph',
    segments: [
      {
        text:
          'Dual writes are verified continuously, not sampled. A ' +
          'comparator process streams both tables and reconciles rows ' +
          'behind the write frontier; any divergence increments ',
      },
      {text: 'migration_drift_total', isCode: true},
      {
        text:
          ' and pages the owning team at ten rows. In six months the ' +
          'alert has fired twice — both times catching an application ' +
          'code path that skipped the write flag, before cutover instead ' +
          'of after.',
      },
    ],
  },
  {kind: 'heading', id: 'measuring-the-cutover', text: 'Measuring the cutover'},
  {
    kind: 'paragraph',
    segments: [
      {
        text:
          'Cutover is the only step with real risk left, so it is the ' +
          'only step with ceremony. We rename tables inside a single ' +
          'transaction that first takes a lock with a 250 ms timeout; if ' +
          'the lock is not granted, the transaction aborts and retries ' +
          'with jitter. Across 41 production cutovers, the p99 stall ' +
          'observed by application queries was 180 ms — below our ' +
          'alerting floor, and invisible in checkout latency.',
      },
    ],
  },
  {
    kind: 'paragraph',
    segments: [
      {
        text:
          'Since the pipeline shipped we have run 217 schema changes on ' +
          'hot tables with zero maintenance windows and zero ' +
          'migration-caused incidents. Median end-to-end time for a ' +
          'simple additive change dropped from nine days (waiting for a ' +
          'window) to four hours.',
      },
    ],
  },
  {kind: 'heading', id: 'what-wed-do-differently', text: 'What we would do differently'},
  {
    kind: 'paragraph',
    segments: [
      {
        text:
          'Two regrets. First, we should have built the drift comparator ' +
          'before the first ghost-table migration, not after the second ' +
          'near miss. Second, throttling by replica lag alone was too ' +
          'coarse — backfills now also respect a token bucket fed by ' +
          'live p95 write latency, which is the signal that actually ' +
          'tracks customer pain. The linter, the loop, and the boring ' +
          'ceremony, though, we would keep exactly as they are.',
      },
    ],
  },
];

const ARTICLE_POST = POSTS[0];

/** TOC entries derive from the heading blocks — single source of truth. */
const TOC_ENTRIES = ARTICLE_BLOCKS.filter(
  (block): block is Extract<ArticleBlock, {kind: 'heading'}> =>
    block.kind === 'heading',
);

// ---------------------------------------------------------------------------
// SMALL PIECES
// ---------------------------------------------------------------------------

/** Gradient cover placeholder with the category initial as its glyph. */
function CoverArt({
  category,
  isLead,
}: {
  category: Category;
  isLead?: boolean;
}) {
  return (
    <div
      style={{
        ...(isLead ? styles.leadCover : styles.cover),
        background: CATEGORY_GRADIENT[category],
      }}
      aria-hidden="true">
      <span style={{...styles.coverGlyph, fontSize: isLead ? 56 : 36}}>
        {category.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

function PostMetaLine({post}: {post: BlogPost}) {
  return (
    <div style={styles.tabularMeta}>
      <HStack gap={1} vAlign="center">
        <Icon icon={ClockIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary" maxLines={1}>
          {post.readMinutes} min read · {post.dateLabel}
        </Text>
      </HStack>
    </div>
  );
}

/** Grid tile: cover, category token, clamped copy, byline, save toggle. */
function PostGridCard({
  post,
  isSaved,
  isPhone,
  onToggleSaved,
}: {
  post: BlogPost;
  isSaved: boolean;
  isPhone: boolean;
  onToggleSaved: (postId: string, isPressed: boolean) => void;
}) {
  return (
    <Card padding={3}>
      <VStack gap={2}>
        <CoverArt category={post.category} />
        <HStack gap={2} vAlign="center">
          <Token
            label={post.category}
            color={CATEGORY_TOKEN[post.category]}
            size="sm"
          />
          {post.isNew ? <Badge label="New" variant="info" /> : null}
          <StackItem size="fill" />
          <ToggleButton
            label={isSaved ? `Remove ${post.title} from saved` : `Save ${post.title}`}
            size="sm"
            isIconOnly
            style={isPhone ? styles.iconTapTarget : undefined}
            icon={<Icon icon={BookmarkIcon} size="sm" />}
            isPressed={isSaved}
            onPressedChange={pressed => onToggleSaved(post.id, pressed)}
          />
        </HStack>
        <Text type="body" weight="semibold" maxLines={2}>
          {post.title}
        </Text>
        <Text type="supporting" color="secondary" maxLines={3}>
          {post.excerpt}
        </Text>
        <HStack gap={2} vAlign="center">
          <Avatar name={post.author} size="small" />
          <StackItem size="fill">
            <Text type="supporting" color="secondary" maxLines={1}>
              {post.author}
            </Text>
          </StackItem>
          <PostMetaLine post={post} />
        </HStack>
      </VStack>
    </Card>
  );
}

/** Numbered section intro shared by all five variant demos. */
function SectionIntro({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <Badge label={`Variant ${index}`} />
        <Heading level={2}>{title}</Heading>
      </HStack>
      <Text type="supporting" color="secondary">
        {description}
      </Text>
    </VStack>
  );
}

/**
 * Shared long-form renderer for both content-section variants. When
 * registerHeading is provided (the TOC variant), heading wrappers are
 * registered so scroll-spy and smooth-scroll can find them.
 */
function ArticleBody({
  registerHeading,
}: {
  registerHeading?: (id: string, element: HTMLDivElement | null) => void;
}) {
  return (
    <VStack gap={4}>
      {ARTICLE_BLOCKS.map((block, index) => {
        switch (block.kind) {
          case 'heading':
            return (
              <div
                key={block.id}
                ref={
                  registerHeading === undefined
                    ? undefined
                    : element => registerHeading(block.id, element)
                }>
                <Heading level={3}>{block.text}</Heading>
              </div>
            );
          case 'paragraph':
            return (
              <p key={index} style={styles.paragraph}>
                {block.segments.map((segment, segmentIndex) =>
                  segment.isCode ? (
                    <code key={segmentIndex} style={styles.inlineCode}>
                      {segment.text}
                    </code>
                  ) : (
                    <span key={segmentIndex}>{segment.text}</span>
                  ),
                )}
              </p>
            );
          case 'quote':
            return (
              <figure key={index} style={{...styles.pullQuote, marginInline: 0}}>
                <HStack gap={2} vAlign="start">
                  <Icon icon={QuoteIcon} size="md" color="secondary" />
                  <VStack gap={1}>
                    <blockquote style={{...styles.pullQuoteText, marginInline: 0}}>
                      {block.text}
                    </blockquote>
                    <figcaption>
                      <Text type="supporting" color="secondary">
                        — {block.attribution}
                      </Text>
                    </figcaption>
                  </VStack>
                </HStack>
              </figure>
            );
          case 'figure':
            return (
              <VStack key={index} gap={1}>
                <div
                  style={{
                    ...styles.figureBox,
                    background: CATEGORY_GRADIENT[ARTICLE_POST.category],
                  }}
                  aria-hidden="true">
                  <Icon icon={ChartNoAxesCombinedIcon} size="lg" color="inherit" />
                </div>
                <Text type="supporting" color="secondary">
                  {block.caption}
                </Text>
              </VStack>
            );
        }
      })}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const JUMP_OPTIONS = [
  {value: 'grid', label: '1 · Post-card grid'},
  {value: 'featured', label: '2 · Featured split'},
  {value: 'chrono', label: '3 · Chronological list'},
  {value: 'prose', label: '4 · Centered article'},
  {value: 'toc', label: '5 · Article with TOC'},
];

export default function MarketingBlogContentSectionsTemplate() {
  const toast = useToast();

  // ---- variant 1: category-chip filter + save toggles ----
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(
    () => new Set(['post-04']),
  );

  // ---- variant 2: which featured post leads the split ----
  const [leadId, setLeadId] = useState(FEATURED_IDS[0]);

  // ---- variant 3: chronological order ----
  const [chronoOrder, setChronoOrder] = useState('newest');

  // ---- variant 4: newsletter form ----
  const [emailDraft, setEmailDraft] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // ---- variant 5: scroll-spied TOC ----
  const [activeHeadingId, setActiveHeadingId] = useState(TOC_ENTRIES[0].id);
  const articleScrollRef = useRef<HTMLDivElement | null>(null);
  const headingRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ---- header jump nav ----
  const [jumpValue, setJumpValue] = useState('grid');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const newsletterRef = useRef<HTMLDivElement | null>(null);

  // Responsive contract (see file header).
  const isNarrow = useMediaQuery('(max-width: 880px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // ---- derived ----

  const gridPosts = useMemo(
    () =>
      activeCategory === 'All'
        ? POSTS
        : POSTS.filter(post => post.category === activeCategory),
    [activeCategory],
  );

  const leadPost = POSTS.find(post => post.id === leadId) ?? POSTS[0];
  const featuredListPosts = FEATURED_IDS.filter(id => id !== leadId).map(
    id => POSTS.find(post => post.id === id) ?? POSTS[0],
  );

  const chronoPosts = useMemo(() => {
    const sorted = [...POSTS].sort((a, b) =>
      a.publishedAt < b.publishedAt ? 1 : -1,
    );
    return chronoOrder === 'newest' ? sorted : sorted.reverse();
  }, [chronoOrder]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const post of POSTS) {
      counts[post.category] = (counts[post.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  // ---- actions ----

  const toggleSaved = (postId: string, isPressed: boolean) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (isPressed) {
        next.add(postId);
      } else {
        next.delete(postId);
      }
      return next;
    });
  };

  const jumpToSection = (value: string) => {
    setJumpValue(value);
    sectionRefs.current[value]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const copyArticleLink = () => {
    toast({body: 'Article link copied to clipboard'});
  };

  const copyFeedLink = () => {
    toast({body: 'RSS feed URL copied to clipboard'});
  };

  const submitNewsletter = () => {
    const email = emailDraft.trim();
    if (email === '') {
      setEmailError('Enter your email address to subscribe.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(`"${email}" doesn't look like an email address.`);
      return;
    }
    setEmailError(null);
    setIsSubscribed(true);
    toast({body: `Subscribed ${email} to the engineering digest`});
  };

  /** Smooth-scroll the bounded article region to a heading. */
  const scrollToHeading = (headingId: string) => {
    const container = articleScrollRef.current;
    const heading = headingRefs.current[headingId];
    if (container === null || heading === null || heading === undefined) {
      return;
    }
    setActiveHeadingId(headingId);
    container.scrollTo({top: heading.offsetTop - 12, behavior: 'smooth'});
  };

  /** Scroll-spy: last heading above the fold line wins; bottom pins last. */
  const onArticleScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const atBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 4;
    if (atBottom) {
      setActiveHeadingId(TOC_ENTRIES[TOC_ENTRIES.length - 1].id);
      return;
    }
    let active = TOC_ENTRIES[0].id;
    for (const entry of TOC_ENTRIES) {
      const heading = headingRefs.current[entry.id];
      if (heading != null && heading.offsetTop <= container.scrollTop + 96) {
        active = entry.id;
      }
    }
    setActiveHeadingId(active);
  };

  // ---- variant 1: post-card grid ----

  const chipStyle = isPhone ? styles.tapTarget : undefined;
  const cardGridSection = (
    <VStack gap={3}>
      <SectionIntro
        index={1}
        title="Post-card grid"
        description="Three-up cards with category chips, read time, and save toggles — the chips filter the grid live."
      />
      <div style={styles.chipRow} role="group" aria-label="Filter posts by category">
        <ToggleButton
          label={`All (${POSTS.length})`}
          size="sm"
          style={chipStyle}
          isPressed={activeCategory === 'All'}
          onPressedChange={() => setActiveCategory('All')}
        />
        {CATEGORIES.map(category => (
          <ToggleButton
            key={category}
            label={`${category} (${categoryCounts[category] ?? 0})`}
            size="sm"
            style={chipStyle}
            isPressed={activeCategory === category}
            onPressedChange={pressed =>
              setActiveCategory(pressed ? category : 'All')
            }
          />
        ))}
      </div>
      <div style={styles.cardGrid}>
        {gridPosts.map(post => (
          <PostGridCard
            key={post.id}
            post={post}
            isSaved={savedIds.has(post.id)}
            isPhone={isPhone}
            onToggleSaved={toggleSaved}
          />
        ))}
      </div>
      <Text type="supporting" color="secondary">
        Showing {gridPosts.length} of {POSTS.length} posts
        {activeCategory === 'All' ? '' : ` in ${activeCategory}`}
      </Text>
    </VStack>
  );

  // ---- variant 2: featured split ----

  const featuredSection = (
    <VStack gap={3}>
      <SectionIntro
        index={2}
        title="Featured-post split"
        description="A large lead card beside a stacked list of four — click any list row to promote it to the lead."
      />
      <div style={isNarrow ? styles.featuredSplitStacked : styles.featuredSplit}>
        <Card padding={4}>
          <VStack gap={3}>
            <CoverArt category={leadPost.category} isLead />
            <HStack gap={2} vAlign="center">
              <Token
                label={leadPost.category}
                color={CATEGORY_TOKEN[leadPost.category]}
                size="sm"
              />
              <Badge label="Featured" variant="info" />
            </HStack>
            <Heading level={3}>{leadPost.title}</Heading>
            <Text type="body" color="secondary" maxLines={4}>
              {leadPost.excerpt}
            </Text>
            <HStack gap={2} vAlign="center">
              <Avatar name={leadPost.author} size="small" />
              <StackItem size="fill">
                <VStack gap={0.5}>
                  <Text type="label">{leadPost.author}</Text>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {leadPost.role}
                  </Text>
                </VStack>
              </StackItem>
              <PostMetaLine post={leadPost} />
            </HStack>
          </VStack>
        </Card>
        <Card padding={2}>
          <List density="compact" hasDividers>
            {featuredListPosts.map(post => (
              <ListItem
                key={post.id}
                onClick={() => setLeadId(post.id)}
                label={
                  <Text type="body" weight="semibold" maxLines={2}>
                    {post.title}
                  </Text>
                }
                description={
                  <VStack gap={1}>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {post.author} · {post.readMinutes} min read
                    </Text>
                    <div style={styles.chipRow}>
                      <Token
                        label={post.category}
                        color={CATEGORY_TOKEN[post.category]}
                        size="sm"
                      />
                    </div>
                  </VStack>
                }
              />
            ))}
          </List>
        </Card>
      </div>
    </VStack>
  );

  // ---- variant 3: chronological list ----

  const gutterStyle = isPhone ? styles.chronoGutterNarrow : styles.chronoGutter;
  const chronoSection = (
    <VStack gap={3}>
      <SectionIntro
        index={3}
        title="Minimal chronological list"
        description="A quiet archive view: dates sit in a left gutter beside undecorated titles, in either direction."
      />
      <HStack gap={3} vAlign="center">
        <StackItem size="fill">
          <Text type="label" color="secondary">
            {POSTS.length} posts · May – June 2026
          </Text>
        </StackItem>
        <SegmentedControl
          label="Order posts"
          value={chronoOrder}
          onChange={setChronoOrder}
          size="sm">
          <SegmentedControlItem label="Newest first" value="newest" />
          <SegmentedControlItem label="Oldest first" value="oldest" />
        </SegmentedControl>
      </HStack>
      <div>
        <Divider />
        {chronoPosts.map(post => (
          <div key={post.id}>
            <div style={styles.chronoRow}>
              <div style={gutterStyle}>
                <Text type="supporting" color="secondary">
                  {post.dateLabel}
                </Text>
              </div>
              <StackItem size="fill">
                <VStack gap={1}>
                  <Text type="body" weight="semibold" maxLines={2}>
                    {post.title}
                  </Text>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {post.author} · {post.category} · {post.readMinutes} min
                    read
                  </Text>
                </VStack>
              </StackItem>
            </div>
            <Divider />
          </div>
        ))}
      </div>
    </VStack>
  );

  // ---- variant 4: centered prose article + newsletter ----

  const proseSection = (
    <VStack gap={3}>
      <SectionIntro
        index={4}
        title="Centered prose article"
        description="A single 680px reading measure with styled headings, a pull-quote, a figure placeholder, and inline code."
      />
      <Card padding={isPhone ? 3 : 5}>
        <div style={styles.proseColumn}>
          <VStack gap={4}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Token
                  label={ARTICLE_POST.category}
                  color={CATEGORY_TOKEN[ARTICLE_POST.category]}
                  size="sm"
                />
                <StackItem size="fill" />
                <IconButton
                  label="Copy article link"
                  tooltip="Copy link"
                  size="sm"
                  variant="ghost"
                  style={isPhone ? styles.iconTapTarget : undefined}
                  icon={<Icon icon={LinkIcon} size="sm" />}
                  onClick={copyArticleLink}
                />
              </HStack>
              <Heading level={2}>{ARTICLE_POST.title}</Heading>
              <HStack gap={2} vAlign="center">
                <Avatar name={ARTICLE_POST.author} size="small" />
                <Text type="supporting" color="secondary" maxLines={1}>
                  {ARTICLE_POST.author}, {ARTICLE_POST.role} ·{' '}
                  {ARTICLE_POST.dateLabel} · {ARTICLE_POST.readMinutes} min
                  read
                </Text>
              </HStack>
            </VStack>
            <Divider />
            <ArticleBody />
            <Divider />
            <div ref={newsletterRef}>
              <Card padding={4}>
                {isSubscribed ? (
                  <VStack gap={2}>
                    <HStack gap={2} vAlign="center">
                      <Icon icon={MailIcon} size="md" color="secondary" />
                      <Heading level={3}>You're on the list</Heading>
                      <Badge label="Subscribed" variant="success" />
                    </HStack>
                    <Text type="supporting" color="secondary">
                      The next engineering digest lands on the first Tuesday
                      of the month. Unsubscribe with one click, any time.
                    </Text>
                  </VStack>
                ) : (
                  <VStack gap={2}>
                    <HStack gap={2} vAlign="center">
                      <Icon icon={MailIcon} size="md" color="secondary" />
                      <Heading level={3}>Get the monthly digest</Heading>
                    </HStack>
                    <Text type="supporting" color="secondary">
                      One email a month with our best engineering writing.
                      No product pitches, no tracking pixels.
                    </Text>
                    <HStack gap={2} vAlign="center" wrap={isPhone ? 'wrap' : undefined}>
                      <StackItem size="fill">
                        <TextInput
                          label="Email address"
                          isLabelHidden
                          size="sm"
                          placeholder="you@example.com"
                          startIcon={MailIcon}
                          value={emailDraft}
                          onChange={value => {
                            setEmailDraft(value);
                            setEmailError(null);
                          }}
                        />
                      </StackItem>
                      <Button
                        label="Subscribe"
                        size="sm"
                        style={isPhone ? styles.tapTarget : undefined}
                        onClick={submitNewsletter}
                      />
                    </HStack>
                    {emailError !== null && (
                      <p style={styles.errorText} role="alert">
                        {emailError}
                      </p>
                    )}
                  </VStack>
                )}
              </Card>
            </div>
          </VStack>
        </div>
      </Card>
    </VStack>
  );

  // ---- variant 5: two-column article with scroll-spied TOC ----

  const tocRail = (
    <div style={styles.tocRail}>
      <VStack gap={2}>
        <Text type="label" color="secondary">
          On this page
        </Text>
        <List density="compact" hasDividers={false}>
          {TOC_ENTRIES.map(entry => (
            <ListItem
              key={entry.id}
              label={entry.text}
              isSelected={activeHeadingId === entry.id}
              onClick={() => scrollToHeading(entry.id)}
            />
          ))}
        </List>
      </VStack>
    </div>
  );

  const tocChips = (
    <div style={styles.tocChipRow} role="group" aria-label="On this page">
      {TOC_ENTRIES.map(entry => (
        <Button
          key={entry.id}
          label={entry.text}
          size="sm"
          style={styles.tapTarget}
          variant={activeHeadingId === entry.id ? 'secondary' : 'ghost'}
          onClick={() => scrollToHeading(entry.id)}
        />
      ))}
    </div>
  );

  const tocSection = (
    <VStack gap={3}>
      <SectionIntro
        index={5}
        title="Article with table of contents"
        description="The same article beside an in-page TOC: links smooth-scroll the reading pane, and the active heading follows your scroll."
      />
      <div style={isNarrow ? undefined : styles.tocLayout}>
        {isNarrow ? tocChips : tocRail}
        <div
          ref={articleScrollRef}
          style={styles.articleScroll}
          onScroll={onArticleScroll}
          tabIndex={0}
          aria-label={`${ARTICLE_POST.title} — scrollable article`}>
          <VStack gap={4}>
            <VStack gap={1}>
              <Heading level={3}>{ARTICLE_POST.title}</Heading>
              <Text type="supporting" color="secondary" maxLines={1}>
                {ARTICLE_POST.author} · {ARTICLE_POST.dateLabel} ·{' '}
                {ARTICLE_POST.readMinutes} min read
              </Text>
            </VStack>
            <Divider />
            <ArticleBody
              registerHeading={(id, element) => {
                headingRefs.current[id] = element;
              }}
            />
            <Divider />
            <Text type="supporting" color="secondary" justify="center">
              End of article · Engineering at Fieldstone
            </Text>
          </VStack>
        </div>
      </div>
    </VStack>
  );

  // ---- frame ----

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Icon icon={NewspaperIcon} size="md" color="secondary" />
                <Heading level={1}>Blog &amp; content sections</Heading>
                {isNarrow ? null : (
                  <Text type="supporting" color="secondary">
                    5 live variants
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Selector
              label="Jump to variant"
              isLabelHidden
              size="sm"
              options={JUMP_OPTIONS}
              value={jumpValue}
              onChange={jumpToSection}
            />
            <IconButton
              label="Copy RSS feed URL"
              tooltip="Copy RSS feed"
              size="sm"
              variant="ghost"
              style={isPhone ? styles.iconTapTarget : undefined}
              icon={<Icon icon={RssIcon} size="sm" />}
              onClick={copyFeedLink}
            />
            <Button
              label="Subscribe"
              size="sm"
              icon={<Icon icon={MailIcon} size="sm" />}
              isIconOnly={isPhone}
              onClick={() => {
                setJumpValue('prose');
                newsletterRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
              }}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.pageColumn}>
            <VStack gap={8}>
              <div ref={element => {
                sectionRefs.current.grid = element;
              }}>
                {cardGridSection}
              </div>
              <div ref={element => {
                sectionRefs.current.featured = element;
              }}>
                {featuredSection}
              </div>
              <div ref={element => {
                sectionRefs.current.chrono = element;
              }}>
                {chronoSection}
              </div>
              <div ref={element => {
                sectionRefs.current.prose = element;
              }}>
                {proseSection}
              </div>
              <div ref={element => {
                sectionRefs.current.toc = element;
              }}>
                {tocSection}
              </div>
              <Text type="supporting" color="secondary" justify="center">
                Engineering at Fieldstone · 9 posts · Updated Jun 30, 2026
              </Text>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
