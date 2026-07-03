var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (Fernwave, a fictional 14-person
 *   climate-data startup: people with roles, departments, locations, bios,
 *   fun facts, and social handles, plus four invented open roles; avatars
 *   are gradient-initial tiles derived from a fixed palette hash — no
 *   clocks, randomness, network assets, or real images)
 * @output Team-section showcase for a marketing site: a variant switcher
 *   isolating four labeled section designs — a 4-column photo-card Grid
 *   with role captions and a social icon row, a large-image leadership
 *   spotlight row for the 3 co-founders/execs with longer bios, a compact
 *   directory list with initials avatars grouped by collapsible
 *   department, and a dark "we are hiring" band interleaving team cards
 *   with dashed open-role cards that link-toast to invented role pages.
 *   Clicking any member anywhere opens a bio Popover with fun-fact copy
 *   and a Say hi action.
 * @position Page template; emitted by \`astryx template
 *   marketing-team-sections\`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the
 * page title, a headcount caption, and the variant switcher
 * (SegmentedControl on wide viewports, a Selector on phones) and stays
 * pinned; LayoutContent scrolls the stacked showcase sections. Layout
 * contentWidth={1120} caps the marketing column — team sections read as a
 * page, not a dense tool surface.
 *
 * Container policy: each showcase variant is a labeled SectionShell
 * (badge + heading + blurb) holding its own container idiom — the grid
 * and spotlight variants use bordered tile cards (plain buttons styled as
 * cards so each tile is one tap target, with the social icon row outside
 * the button to avoid nested interactive elements), the directory uses a
 * single bordered list surface with row buttons and collapsible group
 * headers, and the hiring variant is one dark band div holding light-on-
 * dark mini cards. No Card-in-Card nesting anywhere.
 *
 * Interaction contract:
 * - The variant switcher is real state: 'All sections' stacks all four
 *   designs with per-section Isolate shortcuts; any other value renders
 *   exactly that section.
 * - Clicking a member tile, spotlight banner, directory row, or hiring
 *   card opens that member's bio Popover (bio, fun-fact line, Say hi
 *   button); popover open state is a single keyed id so only one is open
 *   at a time, and Say hi fires a link-toast.
 * - Social icon buttons and open-role "View role" buttons fire a Toast
 *   naming the invented destination (fernwave.jobs/… or a social handle)
 *   instead of navigating; the toast dismisses explicitly.
 * - Directory department groups collapse/expand per group header, with
 *   Expand all / Collapse all shortcuts and hidden-count badges on
 *   collapsed groups.
 *
 * Responsive contract:
 * - Header: HStack wrap — on phones the switcher drops below the title as
 *   a full-width Selector (a 5-item SegmentedControl would overflow
 *   375px); the headcount caption hides <=640px.
 * - Photo-card grid: Grid columns={{minWidth: 200, max: 4}} — 4-up on
 *   wide viewports reflowing to 2-up at tablet and 1–2-up at 375px.
 * - Leadership spotlight: Grid columns={{minWidth: 260, max: 3}} — the
 *   3-up exec row stacks to a single column on phones; bios never
 *   truncate.
 * - Directory rows and group headers keep >=44px tap heights; the hiring
 *   grid uses columns={{minWidth: 220, max: 3}} and its View role and
 *   social controls stay discrete buttons with ~40px targets.
 * - All member interactions are click/tap (popovers, toasts, collapses) —
 *   no hover-only affordances; the page has no horizontal overflow, only
 *   LayoutContent scrolls vertically (height="fill").
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Popover} from '@astryxdesign/core/Popover';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Toast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowUpRightIcon,
  AtSignIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CodeIcon,
  FocusIcon,
  GlobeIcon,
  HandIcon,
  MapPinIcon,
  SparklesIcon,
  UserPlusIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Grid-variant tile: a plain button styled as a card so the whole tile
  // is one tap target; the social row lives outside it (no nesting).
  memberCard: {
    boxSizing: 'border-box',
    border: '1px solid var(--color-border, #d2d2d7)',
    borderRadius: 14,
    padding: 12,
    background: 'var(--color-background-primary, #ffffff)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  tileButton: {
    display: 'block',
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'none',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    borderRadius: 10,
  },
  // Deterministic gradient-initial "photo" tiles — square in the grid,
  // wide banner in the spotlight, small squares in lists.
  photoTile: {
    aspectRatio: '1 / 1',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 700,
    letterSpacing: '0.02em',
    userSelect: 'none',
  },
  bannerTile: {
    aspectRatio: '16 / 9',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: 56,
    fontWeight: 700,
    letterSpacing: '0.02em',
    userSelect: 'none',
  },
  initialsChip: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 700,
    userSelect: 'none',
  },
  socialRow: {display: 'flex', alignItems: 'center', gap: 2},
  // Spotlight cards share the grid-card surface but breathe more.
  spotlightCard: {
    boxSizing: 'border-box',
    border: '1px solid var(--color-border, #d2d2d7)',
    borderRadius: 16,
    padding: 16,
    background: 'var(--color-background-primary, #ffffff)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  // Directory: one bordered surface; group headers and rows are buttons
  // with >=44px tap heights.
  directorySurface: {
    border: '1px solid var(--color-border, #d2d2d7)',
    borderRadius: 14,
    background: 'var(--color-background-primary, #ffffff)',
    overflow: 'hidden',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    minHeight: 48,
    padding: '8px 14px',
    border: 'none',
    borderTop: '1px solid var(--color-border, #d2d2d7)',
    background: 'var(--color-background-secondary, #f5f5f7)',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
  },
  groupHeaderFirst: {borderTop: 'none'},
  directoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    minHeight: 52,
    padding: '8px 14px',
    border: 'none',
    borderTop: '1px solid var(--color-border, #d2d2d7)',
    background: 'none',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
  },
  directoryRowText: {minWidth: 0, flex: 1},
  // Dark hiring band + light-on-dark mini cards. Colors are explicit so
  // the band stays dark in both themes.
  hiringBand: {
    borderRadius: 16,
    padding: 20,
    background: '#17171c',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  hiringHeading: {
    margin: 0,
    color: '#f5f5f7',
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  hiringBlurb: {margin: 0, color: '#a1a1aa', fontSize: 14, lineHeight: 1.5},
  hiringMemberCard: {
    boxSizing: 'border-box',
    border: '1px solid #34343c',
    borderRadius: 12,
    padding: 12,
    background: '#232329',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    font: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
  },
  hiringRoleCard: {
    boxSizing: 'border-box',
    border: '1px dashed #4b4b56',
    borderRadius: 12,
    padding: 12,
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  hiringName: {color: '#f5f5f7', fontSize: 14, fontWeight: 600},
  hiringMeta: {color: '#a1a1aa', fontSize: 13, lineHeight: 1.4},
  hiringRoleTitle: {color: '#f5f5f7', fontSize: 14, fontWeight: 600},
  hiringPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    padding: '2px 8px',
    background: 'rgba(47, 179, 68, 0.18)',
    color: '#7ee29a',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  hiringSpacer: {flex: 1},
  // Bio popover body width; content wraps inside it.
  bioBody: {width: 288, maxWidth: 'calc(100vw - 48px)'},
  funFact: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    borderRadius: 10,
    padding: 10,
    background: 'var(--color-background-secondary, #f5f5f7)',
  },
  // Link-toast: fixed bottom-right, above everything.
  toastWrap: {
    position: 'fixed',
    bottom: 'var(--spacing-5)',
    right: 'var(--spacing-5)',
    width: 352,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    zIndex: 40,
  },
};

// ============= DATA =============
// Fernwave — a fictional 14-person climate-data startup. Every avatar is
// a gradient-initial tile: the gradient is picked from a fixed palette by
// a character-code hash of the person id, so rendering is deterministic
// and no image assets are needed.

type Department = 'leadership' | 'engineering' | 'design' | 'gtm';

const DEPARTMENT_META: Record<
  Department,
  {label: string; blurb: string}
> = {
  leadership: {
    label: 'Leadership',
    blurb: 'Founders and operators steering the ship.',
  },
  engineering: {
    label: 'Engineering',
    blurb: 'The pipeline, the platform, and the models.',
  },
  design: {
    label: 'Design & Research',
    blurb: 'Making climate data legible to humans.',
  },
  gtm: {
    label: 'Go-to-Market',
    blurb: 'Getting Fernwave into customers’ hands.',
  },
};

const DEPARTMENT_ORDER: Department[] = [
  'leadership',
  'engineering',
  'design',
  'gtm',
];

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface SocialLink {
  platform: string;
  handle: string;
  icon: SocialIcon;
}

interface Person {
  id: string;
  name: string;
  role: string;
  department: Department;
  location: string;
  bio: string;
  funFact: string;
  socials: SocialLink[];
}

const PEOPLE: Person[] = [
  // --- Leadership (3 execs — the spotlight row) ---
  {
    id: 'june-oduya',
    name: 'June Oduya',
    role: 'Co-founder & CEO',
    department: 'leadership',
    location: 'San Francisco, CA',
    bio:
      'June spent six years building flood-risk models for reinsurers ' +
      'before deciding the data deserved a better interface than a ' +
      'quarterly PDF. She started Fernwave in a borrowed conference room ' +
      'with Marco and a whiteboard that still hasn’t been erased. She ' +
      'runs the company on writing, not meetings, and reads every ' +
      'customer support thread on Fridays.',
    funFact:
      'Once presented a board deck entirely in weather-map emoji as a ' +
      'dare — the round closed anyway.',
    socials: [
      {platform: 'LinkedIn', handle: 'in/june-oduya', icon: BriefcaseIcon},
      {platform: 'Website', handle: 'juneoduya.com', icon: GlobeIcon},
      {platform: 'Email', handle: 'june@fernwave.io', icon: AtSignIcon},
    ],
  },
  {
    id: 'marco-riva',
    name: 'Marco Riva',
    role: 'Co-founder & CTO',
    department: 'leadership',
    location: 'Turin, Italy (remote)',
    bio:
      'Marco wrote Fernwave’s first ingestion pipeline in a single ' +
      'caffeinated weekend and has been paying down that weekend ever ' +
      'since. Previously he ran data infrastructure at a satellite ' +
      'imagery startup and taught a university course on distributed ' +
      'systems. He believes every architecture diagram is a promise you ' +
      'make to your future on-call self.',
    funFact:
      'Keeps a shelf of failed hard drives labeled with the lessons each ' +
      'one taught him.',
    socials: [
      {platform: 'GitHub', handle: '@marcoriva', icon: CodeIcon},
      {platform: 'LinkedIn', handle: 'in/marco-riva', icon: BriefcaseIcon},
      {platform: 'Email', handle: 'marco@fernwave.io', icon: AtSignIcon},
    ],
  },
  {
    id: 'priya-shah',
    name: 'Priya Shah',
    role: 'Head of Operations',
    department: 'leadership',
    location: 'New York, NY',
    bio:
      'Priya joined as employee number four and immediately built the ' +
      'systems that let everyone else pretend operations are simple: ' +
      'hiring loops, vendor wrangling, and the beloved onboarding doc ' +
      'titled “Nothing here is on fire.” Before Fernwave she scaled ' +
      'operations at a logistics marketplace from 12 to 300 people and ' +
      'swore she’d never do it again. She is doing it again.',
    funFact:
      'Has a spreadsheet ranking 200+ conference-room snacks; the top ' +
      'entry is redacted to prevent hoarding.',
    socials: [
      {platform: 'LinkedIn', handle: 'in/priya-shah-ops', icon: BriefcaseIcon},
      {platform: 'Email', handle: 'priya@fernwave.io', icon: AtSignIcon},
    ],
  },
  // --- Engineering (5) ---
  {
    id: 'tomas-lind',
    name: 'Tomas Lind',
    role: 'Staff Platform Engineer',
    department: 'engineering',
    location: 'Stockholm, Sweden',
    bio:
      'Tomas owns the ingestion platform that turns messy sensor feeds ' +
      'into the tidy time series customers see. He joined from a ' +
      'national weather service and still talks about barometric ' +
      'pressure at parties.',
    funFact:
      'Commutes by kayak four months a year and logs the paddle times ' +
      'in a personal Grafana dashboard.',
    socials: [
      {platform: 'GitHub', handle: '@tomaslind', icon: CodeIcon},
      {platform: 'Website', handle: 'lind.dev', icon: GlobeIcon},
    ],
  },
  {
    id: 'ada-okafor',
    name: 'Ada Okafor',
    role: 'Senior Frontend Engineer',
    department: 'engineering',
    location: 'London, UK',
    bio:
      'Ada builds the map and charting surfaces and is the reason the ' +
      'product feels fast on a five-year-old laptop. She reviews every ' +
      'pull request with a performance budget open in the next tab.',
    funFact:
      'Speed-runs building mechanical keyboards; personal best is 41 ' +
      'minutes including firmware.',
    socials: [
      {platform: 'GitHub', handle: '@adaokafor', icon: CodeIcon},
      {platform: 'LinkedIn', handle: 'in/ada-okafor', icon: BriefcaseIcon},
    ],
  },
  {
    id: 'sam-torres',
    name: 'Sam Torres',
    role: 'Data Engineer',
    department: 'engineering',
    location: 'Austin, TX',
    bio:
      'Sam wrangles the backfill jobs and keeps the warehouse honest. ' +
      'They came from an energy-trading shop and can estimate a query ' +
      'cost by squinting at it.',
    funFact:
      'Maintains a sourdough starter named Cron Job that has never ' +
      'missed a feeding.',
    socials: [
      {platform: 'GitHub', handle: '@samtorres', icon: CodeIcon},
      {platform: 'Email', handle: 'sam@fernwave.io', icon: AtSignIcon},
    ],
  },
  {
    id: 'mei-nakamura',
    name: 'Mei Nakamura',
    role: 'ML Engineer',
    department: 'engineering',
    location: 'Tokyo, Japan (remote)',
    bio:
      'Mei trains the downscaling models that turn coarse climate grids ' +
      'into street-level risk scores. She publishes the team’s model ' +
      'cards and insists every metric ship with its error bars.',
    funFact:
      'Won a regional cloud-spotting competition as a kid; claims it ' +
      'was “obviously formative.”',
    socials: [
      {platform: 'GitHub', handle: '@meinakamura', icon: CodeIcon},
      {platform: 'Website', handle: 'mei-nakamura.jp', icon: GlobeIcon},
    ],
  },
  {
    id: 'lucas-brandt',
    name: 'Lucas Brandt',
    role: 'Backend Engineer',
    department: 'engineering',
    location: 'Berlin, Germany',
    bio:
      'Lucas looks after the public API and its rate limiter, which he ' +
      'describes as “the bouncer at the world’s politest nightclub.” ' +
      'He joined straight from a fintech and misses nothing about it.',
    funFact:
      'Has bicycled to every Fernwave offsite so far, including one ' +
      'that required a ferry and two borrowed panniers.',
    socials: [
      {platform: 'GitHub', handle: '@lbrandt', icon: CodeIcon},
      {platform: 'LinkedIn', handle: 'in/lucas-brandt', icon: BriefcaseIcon},
    ],
  },
  // --- Design & Research (3) ---
  {
    id: 'ines-farah',
    name: 'Inès Farah',
    role: 'Product Design Lead',
    department: 'design',
    location: 'Paris, France',
    bio:
      'Inès leads design and owns the system that keeps fourteen ' +
      'people shipping one coherent product. Her risk-map color scales ' +
      'have been cited in two accessibility talks she is too modest to ' +
      'mention.',
    funFact:
      'Sketches every new feature on paper first and archives the ' +
      'sketches in labeled shoeboxes — currently box nineteen.',
    socials: [
      {platform: 'Website', handle: 'inesfarah.design', icon: GlobeIcon},
      {platform: 'LinkedIn', handle: 'in/ines-farah', icon: BriefcaseIcon},
    ],
  },
  {
    id: 'theo-marsh',
    name: 'Theo Marsh',
    role: 'Brand Designer',
    department: 'design',
    location: 'Portland, OR',
    bio:
      'Theo gave Fernwave its fern, its wave, and the rule that no ' +
      'gradient may exceed two stops. He runs the merch shop as a ' +
      'benevolent dictatorship.',
    funFact:
      'Letterpresses the company holiday cards by hand on a 1962 ' +
      'Vandercook he restored himself.',
    socials: [
      {platform: 'Website', handle: 'theomarsh.studio', icon: GlobeIcon},
      {platform: 'Email', handle: 'theo@fernwave.io', icon: AtSignIcon},
    ],
  },
  {
    id: 'rosa-delgado',
    name: 'Rosa Delgado',
    role: 'UX Researcher',
    department: 'design',
    location: 'Mexico City, Mexico',
    bio:
      'Rosa interviews the underwriters, planners, and farmers who use ' +
      'Fernwave and turns their words into the roadmap’s spine. Her ' +
      'research repository is the most-linked doc in the company.',
    funFact:
      'Records ambient thunderstorm audio on field visits and DJs it ' +
      'over the office speakers on launch days.',
    socials: [
      {platform: 'LinkedIn', handle: 'in/rosa-delgado', icon: BriefcaseIcon},
      {platform: 'Email', handle: 'rosa@fernwave.io', icon: AtSignIcon},
    ],
  },
  // --- Go-to-Market (3) ---
  {
    id: 'nathan-cole',
    name: 'Nathan Cole',
    role: 'Head of Sales',
    department: 'gtm',
    location: 'Denver, CO',
    bio:
      'Nathan closed Fernwave’s first ten customers with a demo laptop ' +
      'held together by stickers. He keeps a bell in the team channel ' +
      'and rings it for renewals twice as loudly as for new logos.',
    funFact:
      'Former minor-league baseball announcer; will do the voice if ' +
      'the quarter closes above plan.',
    socials: [
      {platform: 'LinkedIn', handle: 'in/nathan-cole', icon: BriefcaseIcon},
      {platform: 'Email', handle: 'nathan@fernwave.io', icon: AtSignIcon},
    ],
  },
  {
    id: 'freja-holm',
    name: 'Freja Holm',
    role: 'Content Marketer',
    department: 'gtm',
    location: 'Copenhagen, Denmark',
    bio:
      'Freja writes the Fernwave field notes newsletter and the ' +
      'explainers that make regulators quote us. She edits everything ' +
      'aloud, which the open office has learned to love.',
    funFact:
      'Once got a climate pun into a national newspaper headline and ' +
      'framed the correction it triggered.',
    socials: [
      {platform: 'Website', handle: 'frejaholm.dk', icon: GlobeIcon},
      {platform: 'LinkedIn', handle: 'in/freja-holm', icon: BriefcaseIcon},
    ],
  },
  {
    id: 'dev-patel',
    name: 'Dev Patel',
    role: 'Customer Success Lead',
    department: 'gtm',
    location: 'Toronto, Canada',
    bio:
      'Dev onboards every customer personally and keeps a “first chart ' +
      'they loved” screenshot for each one. His QBR decks are rumored ' +
      'to have a fan club among customers’ CFOs.',
    funFact:
      'Is on a quest to try the highest-rated samosa in every city ' +
      'with a Fernwave customer — 23 cities in.',
    socials: [
      {platform: 'LinkedIn', handle: 'in/dev-patel-cs', icon: BriefcaseIcon},
      {platform: 'Email', handle: 'dev@fernwave.io', icon: AtSignIcon},
    ],
  },
];

/** Invented open roles for the dark hiring band; slugs feed link-toasts. */
interface OpenRole {
  id: string;
  title: string;
  team: string;
  location: string;
  slug: string;
}

const OPEN_ROLES: OpenRole[] = [
  {
    id: 'role-backend',
    title: 'Senior Backend Engineer',
    team: 'Engineering',
    location: 'Remote (EU or ET)',
    slug: 'senior-backend-engineer',
  },
  {
    id: 'role-pmm',
    title: 'Product Marketing Manager',
    team: 'Go-to-Market',
    location: 'New York or remote',
    slug: 'product-marketing-manager',
  },
  {
    id: 'role-ae',
    title: 'Founding Account Executive',
    team: 'Go-to-Market',
    location: 'Denver, CO',
    slug: 'founding-account-executive',
  },
  {
    id: 'role-designer',
    title: 'Platform Designer',
    team: 'Design & Research',
    location: 'Remote (any timezone)',
    slug: 'platform-designer',
  },
];

const COMPANY = 'Fernwave';

// ============= AVATAR HELPERS =============
// Two-stop gradients (Theo's rule) assigned by a character-code hash of
// the person id — stable across renders, no assets, no randomness.

const GRADIENTS: Array<[string, string]> = [
  ['#0ea5e9', '#6366f1'],
  ['#f97316', '#db2777'],
  ['#10b981', '#0d9488'],
  ['#8b5cf6', '#d946ef'],
  ['#f59e0b', '#dc2626'],
  ['#14b8a6', '#2563eb'],
  ['#ec4899', '#7c3aed'],
  ['#22c55e', '#0ea5e9'],
];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997;
  }
  return hash;
}

function gradientFor(id: string): string {
  const [from, to] = GRADIENTS[hashString(id) % GRADIENTS.length];
  return \`linear-gradient(135deg, \${from}, \${to})\`;
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .map(part => part.replace(/[^A-Za-zÀ-ÿ]/g, ''))
    .filter(part => part.length > 0)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

function firstNameOf(name: string): string {
  return name.split(' ')[0];
}

// ============= VARIANTS =============

type VariantId = 'all' | 'grid' | 'spotlight' | 'directory' | 'hiring';

const VARIANT_OPTIONS: Array<{value: VariantId; label: string}> = [
  {value: 'all', label: 'All sections'},
  {value: 'grid', label: 'Photo grid'},
  {value: 'spotlight', label: 'Leadership'},
  {value: 'directory', label: 'Directory'},
  {value: 'hiring', label: 'Hiring'},
];

/** Labeled wrapper each showcase variant renders inside. */
function SectionShell({
  badge,
  title,
  blurb,
  onIsolate,
  children,
}: {
  badge: string;
  title: string;
  blurb: string;
  onIsolate?: () => void;
  children: ReactNode;
}) {
  return (
    <VStack gap={4}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <Badge label={badge} variant="neutral" />
              <Heading level={2}>{title}</Heading>
            </HStack>
            <Text type="supporting" color="secondary">
              {blurb}
            </Text>
          </VStack>
        </StackItem>
        {onIsolate != null && (
          <Button
            label="Isolate"
            variant="ghost"
            size="sm"
            icon={<Icon icon={FocusIcon} size="sm" />}
            onClick={onIsolate}
          />
        )}
      </HStack>
      {children}
    </VStack>
  );
}

/** Bio popover body — shared by every variant's member trigger. */
function BioBody({
  person,
  onSayHi,
}: {
  person: Person;
  onSayHi: (person: Person) => void;
}) {
  return (
    <div style={styles.bioBody}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <div
            style={{
              ...styles.initialsChip,
              background: gradientFor(person.id),
            }}
            aria-hidden="true">
            {initialsFor(person.name)}
          </div>
          <StackItem size="fill">
            <VStack gap={0.5}>
              <Text type="label">{person.name}</Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {person.role}
              </Text>
            </VStack>
          </StackItem>
        </HStack>
        <HStack gap={1} vAlign="center">
          <Icon icon={MapPinIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            {person.location}
          </Text>
        </HStack>
        <Text type="body" color="secondary">
          {person.bio}
        </Text>
        <div style={styles.funFact}>
          <Icon icon={SparklesIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            Fun fact: {person.funFact}
          </Text>
        </div>
        <Button
          label={\`Say hi to \${firstNameOf(person.name)}\`}
          variant="secondary"
          size="sm"
          icon={<Icon icon={HandIcon} size="sm" />}
          onClick={() => onSayHi(person)}
        />
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function MarketingTeamSectionsTemplate() {
  const [variant, setVariant] = useState<VariantId>('all');
  /** Open bio popover, keyed \`\${sectionId}:\${personId}\` — one at a time. */
  const [openBioKey, setOpenBioKey] = useState<string | null>(null);
  /** Collapsed directory groups. */
  const [collapsedDepts, setCollapsedDepts] = useState<
    ReadonlySet<Department>
  >(() => new Set<Department>(['gtm']));
  /** Deterministic link-toast: message + a counter for keying. */
  const [toast, setToast] = useState<{seq: number; message: string} | null>(
    null,
  );

  const isPhone = useMediaQuery('(max-width: 640px)');

  const byDepartment = useMemo(() => {
    const map = new Map<Department, Person[]>();
    for (const dept of DEPARTMENT_ORDER) {
      map.set(dept, []);
    }
    for (const person of PEOPLE) {
      map.get(person.department)?.push(person);
    }
    return map;
  }, []);

  const execs = byDepartment.get('leadership') ?? [];

  const pushToast = (message: string) => {
    setToast(prev => ({seq: (prev?.seq ?? 0) + 1, message}));
  };

  const sayHi = (person: Person) => {
    setOpenBioKey(null);
    pushToast(
      \`Waved at \${firstNameOf(person.name)} — in the full product this \` +
        'starts an intro thread.',
    );
  };

  const openSocial = (person: Person, social: SocialLink) => {
    pushToast(
      \`Opening \${social.handle} (\${person.name} on \${social.platform}) — \` +
        'demo link, no navigation.',
    );
  };

  const openRolePage = (role: OpenRole) => {
    pushToast(
      \`Opening fernwave.jobs/roles/\${role.slug} — invented role page, \` +
        'demo link only.',
    );
  };

  const toggleDept = (dept: Department) => {
    setCollapsedDepts(prev => {
      const next = new Set(prev);
      if (next.has(dept)) {
        next.delete(dept);
      } else {
        next.add(dept);
      }
      return next;
    });
  };

  /** Popover-wrapped trigger for one person, keyed per section. */
  const bioPopover = (
    sectionId: string,
    person: Person,
    trigger: ReactNode,
  ) => {
    const key = \`\${sectionId}:\${person.id}\`;
    return (
      <Popover
        label={\`Bio for \${person.name}\`}
        placement="below"
        alignment="start"
        isOpen={openBioKey === key}
        onOpenChange={isOpen => setOpenBioKey(isOpen ? key : null)}
        content={<BioBody person={person} onSayHi={sayHi} />}>
        {trigger}
      </Popover>
    );
  };

  // ---- Variant 1: 4-column photo-card grid ----
  const gridSection = (
    <SectionShell
      badge="Variant 01"
      title="Photo-card grid"
      blurb="4-up cards with gradient portrait tiles, role captions, and a social icon row. Tap a card for the bio."
      onIsolate={variant === 'all' ? () => setVariant('grid') : undefined}>
      <Grid columns={{minWidth: 200, max: 4}} gap={4}>
        {PEOPLE.map(person => (
          <div key={person.id} style={styles.memberCard}>
            {bioPopover(
              'grid',
              person,
              <button
                type="button"
                style={styles.tileButton}
                aria-haspopup="dialog"
                aria-expanded={openBioKey === \`grid:\${person.id}\`}
                aria-label={\`\${person.name}, \${person.role} — open bio\`}>
                <VStack gap={2}>
                  <div
                    style={{
                      ...styles.photoTile,
                      background: gradientFor(person.id),
                    }}
                    aria-hidden="true">
                    {initialsFor(person.name)}
                  </div>
                  <VStack gap={0.5}>
                    <Text type="label" maxLines={1}>
                      {person.name}
                    </Text>
                    <Text
                      type="supporting"
                      color="secondary"
                      maxLines={1}>
                      {person.role}
                    </Text>
                  </VStack>
                </VStack>
              </button>,
            )}
            {/* Social row lives beside — not inside — the tile button. */}
            <div style={styles.socialRow}>
              {person.socials.map(social => (
                <IconButton
                  key={social.platform}
                  label={\`\${person.name} on \${social.platform} (\${social.handle})\`}
                  tooltip={social.platform}
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={social.icon} size="sm" />}
                  onClick={() => openSocial(person, social)}
                />
              ))}
            </div>
          </div>
        ))}
      </Grid>
    </SectionShell>
  );

  // ---- Variant 2: leadership spotlight row ----
  const spotlightSection = (
    <SectionShell
      badge="Variant 02"
      title="Leadership spotlight"
      blurb="Large-image row for the three execs with full bios in the flow — no truncation, popover adds the fun fact."
      onIsolate={
        variant === 'all' ? () => setVariant('spotlight') : undefined
      }>
      <Grid columns={{minWidth: 260, max: 3}} gap={4}>
        {execs.map(person => (
          <div key={person.id} style={styles.spotlightCard}>
            {bioPopover(
              'spotlight',
              person,
              <button
                type="button"
                style={styles.tileButton}
                aria-haspopup="dialog"
                aria-expanded={openBioKey === \`spotlight:\${person.id}\`}
                aria-label={\`\${person.name}, \${person.role} — open bio\`}>
                <VStack gap={3}>
                  <div
                    style={{
                      ...styles.bannerTile,
                      background: gradientFor(person.id),
                    }}
                    aria-hidden="true">
                    {initialsFor(person.name)}
                  </div>
                  <VStack gap={0.5}>
                    <Heading level={3}>{person.name}</Heading>
                    <Text type="supporting" color="secondary">
                      {person.role} · {person.location}
                    </Text>
                  </VStack>
                </VStack>
              </button>,
            )}
            <Text type="body" color="secondary">
              {person.bio}
            </Text>
            <div style={styles.socialRow}>
              {person.socials.map(social => (
                <IconButton
                  key={social.platform}
                  label={\`\${person.name} on \${social.platform} (\${social.handle})\`}
                  tooltip={social.platform}
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={social.icon} size="sm" />}
                  onClick={() => openSocial(person, social)}
                />
              ))}
            </div>
          </div>
        ))}
      </Grid>
    </SectionShell>
  );

  // ---- Variant 3: compact directory grouped by department ----
  const allCollapsed = collapsedDepts.size === DEPARTMENT_ORDER.length;
  const directorySection = (
    <SectionShell
      badge="Variant 03"
      title="Compact directory"
      blurb="Initials-avatar list grouped by department; each group header collapses its rows."
      onIsolate={
        variant === 'all' ? () => setVariant('directory') : undefined
      }>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {PEOPLE.length} people · {DEPARTMENT_ORDER.length} departments
            </Text>
          </StackItem>
          <Button
            label="Expand all"
            variant="ghost"
            size="sm"
            isDisabled={collapsedDepts.size === 0}
            onClick={() => setCollapsedDepts(new Set())}
          />
          <Button
            label="Collapse all"
            variant="ghost"
            size="sm"
            isDisabled={allCollapsed}
            onClick={() => setCollapsedDepts(new Set(DEPARTMENT_ORDER))}
          />
        </HStack>
        <div style={styles.directorySurface}>
          {DEPARTMENT_ORDER.map((dept, deptIndex) => {
            const members = byDepartment.get(dept) ?? [];
            const isCollapsed = collapsedDepts.has(dept);
            const meta = DEPARTMENT_META[dept];
            return (
              <div key={dept}>
                <button
                  type="button"
                  style={{
                    ...styles.groupHeader,
                    ...(deptIndex === 0
                      ? styles.groupHeaderFirst
                      : undefined),
                  }}
                  aria-expanded={!isCollapsed}
                  aria-label={\`\${meta.label} — \${
                    isCollapsed ? 'expand' : 'collapse'
                  } \${members.length} people\`}
                  onClick={() => toggleDept(dept)}>
                  <Icon
                    icon={isCollapsed ? ChevronDownIcon : ChevronUpIcon}
                    size="sm"
                    color="secondary"
                  />
                  <StackItem size="fill">
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      <Text type="label">{meta.label}</Text>
                      {!isPhone && (
                        <Text type="supporting" color="secondary">
                          {meta.blurb}
                        </Text>
                      )}
                    </HStack>
                  </StackItem>
                  <Badge
                    label={
                      isCollapsed
                        ? \`\${members.length} hidden\`
                        : String(members.length)
                    }
                    variant="neutral"
                  />
                </button>
                {!isCollapsed &&
                  members.map(person => (
                    <div key={person.id}>
                      {bioPopover(
                        'directory',
                        person,
                        <button
                          type="button"
                          style={styles.directoryRow}
                          aria-haspopup="dialog"
                          aria-expanded={
                            openBioKey === \`directory:\${person.id}\`
                          }
                          aria-label={\`\${person.name}, \${person.role} — open bio\`}>
                          <div
                            style={{
                              ...styles.initialsChip,
                              background: gradientFor(person.id),
                            }}
                            aria-hidden="true">
                            {initialsFor(person.name)}
                          </div>
                          <div style={styles.directoryRowText}>
                            <VStack gap={0.5}>
                              <Text type="label" maxLines={1}>
                                {person.name}
                              </Text>
                              <Text
                                type="supporting"
                                color="secondary"
                                maxLines={1}>
                                {person.role} · {person.location}
                              </Text>
                            </VStack>
                          </div>
                        </button>,
                      )}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </VStack>
    </SectionShell>
  );

  // ---- Variant 4: dark hiring band mixing team + open-role cards ----
  // Deterministic interleave: one open-role card after every two team
  // cards, drawing team cards from GTM + Engineering (the hiring teams).
  const hiringPeople = [
    ...(byDepartment.get('gtm') ?? []),
    ...(byDepartment.get('engineering') ?? []),
  ];
  const hiringCards: Array<
    {kind: 'person'; person: Person} | {kind: 'role'; role: OpenRole}
  > = [];
  {
    let roleIndex = 0;
    hiringPeople.forEach((person, personIndex) => {
      hiringCards.push({kind: 'person', person});
      if (personIndex % 2 === 1 && roleIndex < OPEN_ROLES.length) {
        hiringCards.push({kind: 'role', role: OPEN_ROLES[roleIndex]});
        roleIndex += 1;
      }
    });
  }

  const hiringSection = (
    <SectionShell
      badge="Variant 04"
      title="We are hiring"
      blurb="Dark band that sells the team and the openings together; role cards deep-link to fernwave.jobs."
      onIsolate={variant === 'all' ? () => setVariant('hiring') : undefined}>
      <div style={styles.hiringBand}>
        <VStack gap={1}>
          <h3 style={styles.hiringHeading}>
            14 of us. Room for {OPEN_ROLES.length} more.
          </h3>
          <p style={styles.hiringBlurb}>
            Meet a few of the people you would work with — the dashed
            cards are the desks we are keeping warm.
          </p>
        </VStack>
        <Grid columns={{minWidth: 220, max: 3}} gap={3}>
          {hiringCards.map(card =>
            card.kind === 'person' ? (
              <div key={\`person-\${card.person.id}\`}>
                {bioPopover(
                  'hiring',
                  card.person,
                  <button
                    type="button"
                    style={styles.hiringMemberCard}
                    aria-haspopup="dialog"
                    aria-expanded={
                      openBioKey === \`hiring:\${card.person.id}\`
                    }
                    aria-label={\`\${card.person.name}, \${card.person.role} — open bio\`}>
                    <HStack gap={3} vAlign="center">
                      <div
                        style={{
                          ...styles.initialsChip,
                          background: gradientFor(card.person.id),
                        }}
                        aria-hidden="true">
                        {initialsFor(card.person.name)}
                      </div>
                      <StackItem size="fill">
                        <div style={styles.hiringName}>
                          {card.person.name}
                        </div>
                        <div style={styles.hiringMeta}>
                          {card.person.role}
                        </div>
                      </StackItem>
                    </HStack>
                    <div style={styles.hiringMeta}>
                      “{card.person.funFact}”
                    </div>
                  </button>,
                )}
              </div>
            ) : (
              <div key={card.role.id} style={styles.hiringRoleCard}>
                <span style={styles.hiringPill}>Open role</span>
                <div style={styles.hiringRoleTitle}>{card.role.title}</div>
                <div style={styles.hiringMeta}>
                  {card.role.team} · {card.role.location}
                </div>
                <div style={styles.hiringSpacer} />
                <Button
                  label="View role"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={ArrowUpRightIcon} size="sm" />}
                  onClick={() => openRolePage(card.role)}
                />
              </div>
            ),
          )}
        </Grid>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={UserPlusIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <p style={styles.hiringBlurb}>
              Don’t see your role? We read every open application.
            </p>
          </StackItem>
          <Button
            label="See all openings"
            variant="secondary"
            size="sm"
            onClick={() =>
              pushToast(
                'Opening fernwave.jobs — invented careers page, demo ' +
                  'link only.',
              )
            }
          />
        </HStack>
      </div>
    </SectionShell>
  );

  // ---- assemble ----
  const sections: Array<{id: VariantId; node: ReactNode}> = [
    {id: 'grid', node: gridSection},
    {id: 'spotlight', node: spotlightSection},
    {id: 'directory', node: directorySection},
    {id: 'hiring', node: hiringSection},
  ];
  const visibleSections =
    variant === 'all'
      ? sections
      : sections.filter(section => section.id === variant);

  return (
    <>
      <Layout
        height="fill"
        contentWidth={1120}
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size={isPhone ? 'static' : 'fill'}>
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>Team sections</Heading>
                  {!isPhone && (
                    <Text
                      type="supporting"
                      color="secondary"
                      hasTabularNumbers>
                      {COMPANY} · {PEOPLE.length} people ·{' '}
                      {OPEN_ROLES.length} open roles
                    </Text>
                  )}
                </HStack>
              </StackItem>
              {isPhone ? (
                <StackItem size="fill">
                  <Selector
                    label="Section variant"
                    options={VARIANT_OPTIONS.map(option => ({
                      value: option.value,
                      label: option.label,
                    }))}
                    value={variant}
                    onChange={value => setVariant(value as VariantId)}
                    width="100%"
                  />
                </StackItem>
              ) : (
                <SegmentedControl
                  value={variant}
                  onChange={value => setVariant(value as VariantId)}
                  label="Section variant"
                  size="md">
                  {VARIANT_OPTIONS.map(option => (
                    <SegmentedControlItem
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    />
                  ))}
                </SegmentedControl>
              )}
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={6}>
            <VStack gap={8}>
              {visibleSections.map((section, index) => (
                <VStack key={section.id} gap={8}>
                  {index > 0 && <Divider />}
                  {section.node}
                </VStack>
              ))}
            </VStack>
          </LayoutContent>
        }
      />

      {/* Link-toast for social handles, role pages, and Say hi. */}
      {toast != null && (
        <div style={styles.toastWrap}>
          <Toast
            key={toast.seq}
            type="info"
            isAutoHide={false}
            autoHideDuration={8000}
            onDismiss={() => setToast(null)}
            body={<Text type="body">{toast.message}</Text>}
          />
        </div>
      )}
    </>
  );
}
`;export{e as default};