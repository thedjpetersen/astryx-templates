var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (company narrative, mission prose, four
 *   stat targets, eight 2019–2026 milestones, six values, six leaders with
 *   gradient-initial avatars, investor/press wordmarks, three open roles)
 * @output Company about page for Straylight, a webhook-delivery
 *   infrastructure company: narrative header, mission prose block, a
 *   count-up stats band, an alternating company-history timeline with a
 *   condensed/expanded toggle, a 3x2 values icon grid, a leadership grid
 *   with keyboard-accessible bio Popovers, an investors/press wordmark row,
 *   and a careers CTA panel with three open-role cards that fire
 *   application toasts — all reachable from a slim scroll-spying subnav
 * @position Page template; emitted by \`astryx template company-about-page\`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader is pinned and
 * carries the brand row plus the slim in-page subnav (anchor buttons that
 * scroll their section into view and highlight via scroll-spy);
 * LayoutContent scrolls every section. Layout contentWidth={980} — about
 * pages read as a marketing document, so the column is capped and centered
 * while the header chrome spans the frame.
 *
 * Container policy: marketing sections, so Cards carry the discrete
 * artifacts (milestone cards, value tiles, leader cards, role cards, the
 * careers panel) while the narrative header and mission prose stay bare
 * text on the page background. The stats band is a single muted Card so the
 * four figures read as one instrument.
 *
 * Interaction contract:
 * - Subnav buttons scroll their section into view; an IntersectionObserver
 *   scroll-spy moves the highlighted pill as sections cross the viewport
 *   band (falls back to click-driven highlighting when unavailable).
 * - The stats band counts each figure up from zero the first time it
 *   scrolls into view (30% visible); a Replay button re-runs the animation.
 *   prefers-reduced-motion snaps straight to the targets.
 * - The history timeline has a working Expanded/Condensed SegmentedControl:
 *   expanded shows alternating milestone cards on a center rail, condensed
 *   collapses to a compact year-per-row digest.
 * - Each leader card's "Read bio" Button opens a Popover (Escape closes,
 *   focus returns to the trigger — keyboard support comes from Popover);
 *   only one bio is open at a time.
 * - Every role card's Apply Button and the "View all openings" Button fire
 *   application toasts; Contact and press-kit Buttons toast too. No dead
 *   buttons anywhere on the page.
 *
 * Responsive contract:
 * - Subnav: single row of size="sm" pill Buttons with --size-element-sm
 *   raised to 40px for tap targets; the row scrolls horizontally
 *   (deliberate overflowX) below 640px instead of wrapping under the brand.
 * - Header brand row: company mark + name stay together; the Contact
 *   button keeps its slot at every width (icon-only never needed at 375px).
 * - Stats band: Grid columns={{minWidth: 150, max: 4}} — 4-up wide, 2-up on
 *   phones; figures use tabular numerals so the band never jitters while
 *   counting.
 * - Timeline: >768px alternates cards across a 48px center rail
 *   (1fr/48px/1fr grid per row); <=768px collapses to a single left-rail
 *   column like a feed. Condensed mode is one column at every width.
 * - Values / leadership / roles: Grid minWidth 220–240 → 3-up, 2-up, 1-up.
 * - Bio Popovers cap content width at 300px so they fit a 375px viewport.
 * - Only LayoutContent scrolls (height="fill"); the header + subnav stay
 *   pinned so the scroll-spy is always visible.
 *
 * Color policy: the brand mark tile and the six gradient-initial leader
 * avatars are scheme-locked brand art (colorScheme: 'light' on their
 * styles) — like a logo asset or a photo, the saturated brand gradients
 * and their white initials render identically in light and dark mode, so
 * their gradient stops and the white text stay raw literals on purpose.
 * Every other surface uses Astryx tokens or light-dark() pairs (the
 * careers panel wash flips to a subtler indigo/violet tint in dark mode).
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
  type RefObject,
  type SVGProps,
} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {Popover} from '@astryxdesign/core/Popover';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {useToast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import type {TokenColor} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowRightIcon,
  BanknoteIcon,
  BlocksIcon,
  BriefcaseIcon,
  EyeIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  NewspaperIcon,
  PenLineIcon,
  RocketIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SproutIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Brand mark: small gradient tile standing in for a real logo asset.
  // Scheme-locked brand art (see "Color policy" above): the gradient and
  // white glyph are literals, with colorScheme pinned so the tile renders
  // identically in dark mode.
  brandMark: {
    colorScheme: 'light',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 700,
  },
  // Subnav row scrolls horizontally on phones instead of wrapping; the
  // negative-space padding keeps the focus ring from clipping.
  subnavScroller: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    padding: '2px 0',
  },
  subnavRow: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    width: 'max-content',
  },
  // Button height derives from --size-element-sm; raising the token gives
  // the subnav pills ~40px tap targets while keeping size="sm" padding.
  subnavTapTarget: {'--size-element-sm': '40px'} as CSSProperties,
  // Narrative header — hero prose is bare text, not a Card.
  heroEyebrow: {letterSpacing: '0.08em', textTransform: 'uppercase'},
  heroTitle: {maxWidth: 720},
  heroLede: {maxWidth: 640},
  // Mission pull-quote rail.
  missionRule: {
    borderLeft: '3px solid var(--color-border)',
    paddingLeft: 'var(--spacing-4)',
  },
  // Count-up figures: tabular numerals so the band doesn't jitter mid-count.
  statFigure: {
    fontSize: 32,
    lineHeight: 1.2,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  // Expanded timeline, wide: card / 48px rail / card per milestone row.
  timelineRowWide: {
    display: 'grid',
    gridTemplateColumns: '1fr 48px 1fr',
    alignItems: 'stretch',
  },
  // Expanded timeline, narrow: fixed left gutter like an activity feed.
  timelineRowNarrow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
  },
  railColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
  },
  railGutterNarrow: {width: 36},
  railMarker: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  railConnector: {
    width: 2,
    flex: 1,
    backgroundColor: 'var(--color-border)',
    borderRadius: 1,
  },
  railConnectorHidden: {
    width: 2,
    flex: 1,
    backgroundColor: 'transparent',
  },
  timelineCardCell: {
    minWidth: 0,
    paddingBottom: 'var(--spacing-4)',
  },
  timelineBodyNarrow: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 'var(--spacing-4)',
  },
  // Condensed digest rows keep a 40px minimum for touch.
  condensedRow: {minHeight: 40, display: 'flex', alignItems: 'center'},
  condensedYear: {
    width: 48,
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  // Value tiles: icon disc above the copy.
  valueIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  // Gradient-initial avatars — no network images anywhere on the page.
  // Scheme-locked brand art (see "Color policy" above): like photos, the
  // avatar gradients and their white initials do not flip with the theme,
  // so colorScheme is pinned and the literals are deliberate.
  leaderAvatar: {
    colorScheme: 'light',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    flexShrink: 0,
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  leaderAvatarSmall: {
    width: 40,
    height: 40,
    fontSize: 14,
  },
  // Bio popover body caps its width so it fits a 375px viewport.
  bioPanel: {maxWidth: 300},
  // Investor/press wordmarks: styled text chips standing in for logo SVGs.
  logoChip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    padding: '0 var(--spacing-4)',
    borderRadius: 10,
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // Careers CTA panel gradient wash behind the role cards. light-dark()
  // pairs keep the light tint exactly and swap to lighter-hued, slightly
  // stronger stops over the dark body so the wash stays visible.
  careersPanel: {
    background:
      'linear-gradient(135deg, ' +
      'light-dark(rgba(99, 102, 241, 0.08), rgba(129, 140, 248, 0.14)), ' +
      'light-dark(rgba(168, 85, 247, 0.08), rgba(192, 132, 252, 0.14)))',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    padding: 'var(--spacing-6)',
  },
  // Anchor sections get scroll-margin so the pinned header never covers
  // the section heading after a subnav jump.
  section: {scrollMarginTop: 16},
};

// ============= DATA =============

const COMPANY = {
  name: 'Straylight',
  tagline: 'Webhook delivery your customers never think about',
  founded: 2019,
  headquarters: 'Toronto, Canada',
};

const HERO = {
  eyebrow: 'About Straylight',
  title: 'We deliver the events the internet runs on.',
  lede:
    'Straylight started in 2019 with a stubborn idea: webhook delivery is ' +
    'infrastructure, not an afterthought. Seven years later, Relay moves ' +
    'billions of events a month for payment platforms, logistics networks, ' +
    'and developer tools on every continent — and the median customer ' +
    'never files a delivery ticket.',
};

const MISSION = {
  heading: 'Our mission',
  statement:
    'Make event delivery so dependable that teams stop building retry ' +
    'queues, dead-letter dashboards, and 2 a.m. replay scripts — and spend ' +
    'that time on their own product instead.',
  body:
    'Every company that exposes an API eventually rebuilds the same ' +
    'plumbing: signing, retries, ordering, replay, observability. We think ' +
    'that plumbing should be a utility. Relay is our answer — a delivery ' +
    'network that treats a missed webhook the way a bank treats a missed ' +
    'ledger entry. We publish our uptime, our post-mortems, and our ' +
    'pricing, because infrastructure you cannot audit is infrastructure ' +
    'you cannot trust.',
};

interface StatFixture {
  id: string;
  label: string;
  target: number;
  format: (value: number) => string;
  caption: string;
}

const STATS: ReadonlyArray<StatFixture> = [
  {
    id: 'customers',
    label: 'Customers',
    target: 4200,
    format: value => \`\${Math.round(value).toLocaleString('en-US')}+\`,
    caption: 'from seed-stage to Fortune 500',
  },
  {
    id: 'uptime',
    label: 'Delivery uptime',
    target: 99.98,
    format: value => \`\${value.toFixed(2)}%\`,
    caption: 'trailing 12 months, all regions',
  },
  {
    id: 'countries',
    label: 'Countries',
    target: 38,
    format: value => String(Math.round(value)),
    caption: 'with active production traffic',
  },
  {
    id: 'team',
    label: 'Team members',
    target: 214,
    format: value => String(Math.round(value)),
    caption: 'across 11 time zones',
  },
];

type MilestoneKind = 'product' | 'funding' | 'scale' | 'trust';

const MILESTONE_KIND_META: Record<
  MilestoneKind,
  {label: string; color: TokenColor}
> = {
  product: {label: 'Product', color: 'blue'},
  funding: {label: 'Funding', color: 'green'},
  scale: {label: 'Scale', color: 'purple'},
  trust: {label: 'Trust', color: 'teal'},
};

interface Milestone {
  id: string;
  year: string;
  kind: MilestoneKind;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
}

// Eight milestones, 2019–2026, oldest first — the page tells the story
// forward even though the activity-feed idiom elsewhere runs newest-first.
const MILESTONES: ReadonlyArray<Milestone> = [
  {
    id: 'ms-2019',
    year: '2019',
    kind: 'product',
    icon: RocketIcon,
    title: 'Founded in a Toronto co-working loft',
    body:
      'Amara, Felix, and June leave a payments company after rebuilding ' +
      'webhook retries for the third time. The first Relay prototype ' +
      'delivers its first event on a folding table above a bakery.',
  },
  {
    id: 'ms-2020',
    year: '2020',
    kind: 'funding',
    icon: BanknoteIcon,
    title: 'Seed round and the first 100 customers',
    body:
      'Foreline Ventures leads a $4.5M seed. The waitlist crosses 1,000 ' +
      'teams and the 100th customer — a bicycle-courier API — goes live.',
  },
  {
    id: 'ms-2021',
    year: '2021',
    kind: 'trust',
    icon: ShieldCheckIcon,
    title: 'Relay 1.0 goes GA with SOC 2 Type II',
    body:
      'Guaranteed ordering, signed payloads, and one-click replay ship in ' +
      'the same quarter as the SOC 2 Type II report. The team reaches 30.',
  },
  {
    id: 'ms-2022',
    year: '2022',
    kind: 'funding',
    icon: GlobeIcon,
    title: 'Series A and the Dublin region',
    body:
      'Bridgepoint Capital leads a $22M Series A. The EU region opens in ' +
      'Dublin with in-region storage, unlocking the first banking customers.',
  },
  {
    id: 'ms-2023',
    year: '2023',
    kind: 'scale',
    icon: ZapIcon,
    title: 'One billion events in a single month',
    body:
      'Relay crosses a billion deliveries in March without an incident. ' +
      'The self-serve tier launches; signups triple in six weeks.',
  },
  {
    id: 'ms-2024',
    year: '2024',
    kind: 'funding',
    icon: UsersIcon,
    title: 'Series B, Sydney region, 150 people',
    body:
      'A $60M Series B funds the APAC build-out. Sydney comes online and ' +
      'the team passes 150 across engineering, support, and field roles.',
  },
  {
    id: 'ms-2025',
    year: '2025',
    kind: 'product',
    icon: BlocksIcon,
    title: 'Quillcast joins Straylight',
    body:
      'We acquire Quillcast, the payload-transformation startup, and ship ' +
      'its filter language as Relay Transforms. Customer 4,000 signs.',
  },
  {
    id: 'ms-2026',
    year: '2026',
    kind: 'trust',
    icon: SparklesIcon,
    title: '99.98% uptime and Relay Edge announced',
    body:
      'Trailing-12-month delivery uptime lands at 99.98% across 38 ' +
      'countries. Relay Edge — delivery from 60 metro points of presence — ' +
      'enters early access.',
  },
];

interface CompanyValue {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
}

const VALUES: ReadonlyArray<CompanyValue> = [
  {
    id: 'val-reliability',
    icon: ShieldCheckIcon,
    title: 'Reliability is the product',
    body:
      'Features are negotiable; delivery is not. We ship the boring fix ' +
      'before the flashy launch, every time.',
  },
  {
    id: 'val-writing',
    icon: PenLineIcon,
    title: 'Write it down',
    body:
      'Decisions live in documents, not hallways. If it is not written, ' +
      'it did not happen — and it cannot be improved.',
  },
  {
    id: 'val-ownership',
    icon: UsersIcon,
    title: 'Small teams, whole problems',
    body:
      'Squads of five own a problem end to end: pager, roadmap, and the ' +
      'customer call when something breaks.',
  },
  {
    id: 'val-transparency',
    icon: EyeIcon,
    title: 'Default to transparency',
    body:
      'Public uptime, public post-mortems, public pricing. Customers ' +
      'audit us before they trust us, and that is the point.',
  },
  {
    id: 'val-momentum',
    icon: ZapIcon,
    title: 'Fast follow-through',
    body:
      'Speed is saying "done" and meaning it. We finish the last 10% — ' +
      'docs, alerts, migration paths — before calling anything shipped.',
  },
  {
    id: 'val-stewardship',
    icon: SproutIcon,
    title: 'Leave the campsite cleaner',
    body:
      'Every touched system gets a little better: one deleted flag, one ' +
      'clearer error message, one test that was missing.',
  },
];

interface Leader {
  id: string;
  name: string;
  role: string;
  joined: string;
  /**
   * Scheme-locked brand-art gradient stops (raw literals on purpose);
   * rendered inside the colorScheme-pinned avatar disc — see Color policy.
   */
  gradient: [string, string];
  bio: string;
  focus: ReadonlyArray<{label: string; color: TokenColor}>;
}

const LEADERS: ReadonlyArray<Leader> = [
  {
    id: 'lead-amara',
    name: 'Amara Osei',
    role: 'Co-founder & CEO',
    joined: 'Founded 2019',
    gradient: ['#6366f1', '#a855f7'],
    bio:
      'Amara ran platform engineering at a payments unicorn before ' +
      'starting Straylight, where she rebuilt webhook retries three times ' +
      'and decided the fourth rebuild should be a company. She still ' +
      'reviews every post-mortem before it goes public.',
    focus: [
      {label: 'Strategy', color: 'purple'},
      {label: 'Reliability culture', color: 'blue'},
    ],
  },
  {
    id: 'lead-felix',
    name: 'Felix Marchetti',
    role: 'Co-founder & CTO',
    joined: 'Founded 2019',
    gradient: ['#0ea5e9', '#6366f1'],
    bio:
      'Felix designed the Relay delivery engine and its exactly-once ' +
      'ordering model. Previously distributed-systems lead at a CDN, he ' +
      'holds two patents on consistent-hashing failover and answers ' +
      'architecture questions in the public forum most Fridays.',
    focus: [
      {label: 'Distributed systems', color: 'blue'},
      {label: 'Relay Edge', color: 'teal'},
    ],
  },
  {
    id: 'lead-june',
    name: 'June Nakamura',
    role: 'Co-founder & COO',
    joined: 'Founded 2019',
    gradient: ['#f59e0b', '#ef4444'],
    bio:
      'June turned three founders and a folding table into a 214-person ' +
      'company without losing the write-it-down culture. She owns ' +
      'operations, people, and the annual transparency report, and ran ' +
      'developer relations solo for the first two years.',
    focus: [
      {label: 'Operations', color: 'orange'},
      {label: 'People', color: 'pink'},
    ],
  },
  {
    id: 'lead-priya',
    name: 'Priya Raghunathan',
    role: 'VP Engineering',
    joined: 'Joined 2021',
    gradient: ['#10b981', '#0ea5e9'],
    bio:
      'Priya joined from a database company to scale engineering past its ' +
      'first thirty people. She introduced the squad model — five people, ' +
      'one pager, one whole problem — and led the Dublin and Sydney ' +
      'region launches a year apart.',
    focus: [
      {label: 'Org design', color: 'green'},
      {label: 'Multi-region', color: 'blue'},
    ],
  },
  {
    id: 'lead-marcus',
    name: 'Marcus Ellery',
    role: 'CFO',
    joined: 'Joined 2022',
    gradient: ['#8b5cf6', '#ec4899'],
    bio:
      'Marcus came aboard with the Series A to build a finance function ' +
      'as auditable as the product. He published Straylight’s pricing ' +
      'model in full — margins included — and closed the Series B in ' +
      'nineteen days.',
    focus: [
      {label: 'Finance', color: 'purple'},
      {label: 'Pricing', color: 'green'},
    ],
  },
  {
    id: 'lead-sofia',
    name: 'Sofia Lindgren',
    role: 'VP Design',
    joined: 'Joined 2023',
    gradient: ['#ec4899', '#f59e0b'],
    bio:
      'Sofia leads product design and the Relay console. A former air ' +
      'traffic control interface designer, she brings the same rule to ' +
      'webhooks: an operator should understand system state in one ' +
      'glance, even at 2 a.m.',
    focus: [
      {label: 'Console design', color: 'pink'},
      {label: 'Design systems', color: 'blue'},
    ],
  },
];

// Investor and press wordmarks — styled text chips, not fetched logos.
const BACKERS: ReadonlyArray<{
  id: string;
  label: string;
  style: CSSProperties;
}> = [
  {
    id: 'backer-foreline',
    label: 'FORELINE',
    style: {fontWeight: 800, letterSpacing: '0.18em', fontSize: 14},
  },
  {
    id: 'backer-bridgepoint',
    label: 'Bridgepoint',
    style: {fontWeight: 600, fontStyle: 'italic', fontSize: 16},
  },
  {
    id: 'backer-harborgray',
    label: 'Harbor & Gray',
    style: {fontWeight: 500, fontFamily: 'Georgia, serif', fontSize: 16},
  },
  {
    id: 'backer-alpine',
    label: 'ALPINE FIELD',
    style: {fontWeight: 700, letterSpacing: '0.12em', fontSize: 13},
  },
];

const PRESS: ReadonlyArray<{
  id: string;
  label: string;
  style: CSSProperties;
}> = [
  {
    id: 'press-signal',
    label: 'The Signal',
    style: {fontWeight: 700, fontFamily: 'Georgia, serif', fontSize: 16},
  },
  {
    id: 'press-stackwire',
    label: 'stackwire',
    style: {fontWeight: 600, letterSpacing: '0.06em', fontSize: 15},
  },
];

interface OpenRole {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  teamColor: TokenColor;
}

const OPEN_ROLES: ReadonlyArray<OpenRole> = [
  {
    id: 'role-dse',
    title: 'Senior Distributed Systems Engineer',
    team: 'Delivery Engine',
    location: 'Remote — Americas',
    type: 'Full-time',
    teamColor: 'blue',
  },
  {
    id: 'role-designer',
    title: 'Product Designer, Console',
    team: 'Design',
    location: 'Toronto (hybrid)',
    type: 'Full-time',
    teamColor: 'pink',
  },
  {
    id: 'role-devrel',
    title: 'Developer Advocate',
    team: 'Developer Relations',
    location: 'Remote — EU',
    type: 'Full-time',
    teamColor: 'green',
  },
];

// Subnav order doubles as the scroll-spy priority order.
const SECTIONS: ReadonlyArray<{id: string; label: string}> = [
  {id: 'mission', label: 'Mission'},
  {id: 'numbers', label: 'By the numbers'},
  {id: 'story', label: 'Our story'},
  {id: 'values', label: 'Values'},
  {id: 'team', label: 'Leadership'},
  {id: 'careers', label: 'Careers'},
];

// ============= HOOKS =============

/**
 * True once the node has intersected the viewport (30% visible). Falls
 * back to "visible" when IntersectionObserver is unavailable so the stats
 * never render as a wall of zeros in static environments.
 */
function useInView(): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      {threshold: 0.3},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

/**
 * Eases 0 → target over \`durationMs\` with requestAnimationFrame once
 * \`isActive\` flips true; bumping \`runToken\` replays the animation.
 * prefers-reduced-motion (and rAF-less environments) snap to the target.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  runToken: number,
  durationMs = 1400,
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setValue(0);
      return;
    }
    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof requestAnimationFrame === 'undefined') {
      setValue(target);
      return;
    }
    let frame = 0;
    let startedAt: number | null = null;
    const tick = (now: number) => {
      if (startedAt === null) {
        startedAt = now;
      }
      const progress = Math.min(1, (now - startedAt) / durationMs);
      // ease-out cubic: fast start, gentle landing on the final figure.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isActive, runToken, durationMs]);

  // Land exactly on the fixture value — never a float artifact.
  return isActive && value > target ? target : value;
}

// ============= PIECES =============

function initialsOf(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

/** Gradient-initial avatar disc; the name is announced by adjacent text. */
function GradientAvatar({
  leader,
  small,
}: {
  leader: Leader;
  small?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        ...styles.leaderAvatar,
        ...(small ? styles.leaderAvatarSmall : undefined),
        background: \`linear-gradient(135deg, \${leader.gradient[0]}, \${leader.gradient[1]})\`,
      }}>
      {initialsOf(leader.name)}
    </div>
  );
}

/** One count-up figure inside the stats band. */
function CountUpStat({
  stat,
  isActive,
  runToken,
}: {
  stat: StatFixture;
  isActive: boolean;
  runToken: number;
}) {
  const value = useCountUp(stat.target, isActive, runToken);
  return (
    <VStack gap={1}>
      <div style={styles.statFigure}>{stat.format(value)}</div>
      <Text type="label">{stat.label}</Text>
      <Text type="supporting" color="secondary">
        {stat.caption}
      </Text>
    </VStack>
  );
}

/** Expanded milestone card, shared by the wide and narrow timelines. */
function MilestoneCard({milestone}: {milestone: Milestone}) {
  const kind = MILESTONE_KIND_META[milestone.kind];
  return (
    <Card padding={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" color="secondary">
              {milestone.year}
            </Text>
          </StackItem>
          <Token label={kind.label} color={kind.color} size="sm" />
        </HStack>
        <Heading level={3}>{milestone.title}</Heading>
        <Text type="body" color="secondary">
          {milestone.body}
        </Text>
      </VStack>
    </Card>
  );
}

/** Center-rail marker column shared by both expanded layouts. */
function RailColumn({
  milestone,
  isFirst,
  isLast,
  narrow,
}: {
  milestone: Milestone;
  isFirst: boolean;
  isLast: boolean;
  narrow?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.railColumn,
        ...(narrow ? styles.railGutterNarrow : undefined),
      }}>
      <div
        style={isFirst ? styles.railConnectorHidden : styles.railConnector}
      />
      <div style={styles.railMarker}>
        <Icon icon={milestone.icon} size="sm" color="secondary" />
      </div>
      <div
        style={isLast ? styles.railConnectorHidden : styles.railConnector}
      />
    </div>
  );
}

/** Bio popover body: identity echo, prose bio, focus tokens. */
function LeaderBio({leader}: {leader: Leader}) {
  return (
    <div style={styles.bioPanel}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <GradientAvatar leader={leader} small />
          <VStack gap={0}>
            <Text type="body" weight="semibold">
              {leader.name}
            </Text>
            <Text type="supporting" color="secondary">
              {leader.role} · {leader.joined}
            </Text>
          </VStack>
        </HStack>
        <Text type="body" color="secondary">
          {leader.bio}
        </Text>
        <HStack gap={1} wrap="wrap">
          {leader.focus.map(token => (
            <Token
              key={token.label}
              label={token.label}
              color={token.color}
              size="sm"
            />
          ))}
        </HStack>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function CompanyAboutPageTemplate() {
  const toast = useToast();
  const isNarrow = useMediaQuery('(max-width: 640px)');
  const isSingleRail = useMediaQuery('(max-width: 768px)');

  // ---- scroll-spy subnav ----
  const sectionNodes = useRef(new Map<string, HTMLElement>());
  const visibleSections = useRef(new Set<string>());
  const [activeSection, setActiveSection] = useState<string>('mission');

  const registerSection = (id: string) => (node: HTMLElement | null) => {
    if (node) {
      sectionNodes.current.set(id, node);
    } else {
      sectionNodes.current.delete(id);
    }
  };

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return; // fall back to click-driven highlighting
    }
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.sectionId;
          if (!id) {
            continue;
          }
          if (entry.isIntersecting) {
            visibleSections.current.add(id);
          } else {
            visibleSections.current.delete(id);
          }
        }
        // Highest section (subnav order) inside the viewport band wins.
        const next = SECTIONS.find(section =>
          visibleSections.current.has(section.id),
        );
        if (next) {
          setActiveSection(next.id);
        }
      },
      // Band across the upper-middle of the viewport: a section becomes
      // "current" as its content crosses reading height.
      {rootMargin: '-20% 0px -55% 0px', threshold: 0},
    );
    for (const node of sectionNodes.current.values()) {
      observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  const jumpToSection = (id: string) => {
    setActiveSection(id);
    const node = sectionNodes.current.get(id);
    node?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  // ---- stats band ----
  const [statsRef, statsInView] = useInView();
  const [statsRunToken, setStatsRunToken] = useState(0);

  // ---- timeline density ----
  const [timelineMode, setTimelineMode] = useState('expanded');

  // ---- leader bios (one open at a time) ----
  const [openBioId, setOpenBioId] = useState<string | null>(null);

  // ---- toasts ----
  const applyToRole = (role: OpenRole) => {
    toast({
      body: \`Application started for \${role.title} — we emailed you a link to finish in the careers portal.\`,
      uniqueID: \`about-apply-\${role.id}\`,
    });
  };

  const timelineControl = (
    <SegmentedControl
      label="Timeline density"
      value={timelineMode}
      onChange={setTimelineMode}
      size="sm"
      style={isNarrow ? styles.subnavTapTarget : undefined}>
      <SegmentedControlItem label="Expanded" value="expanded" />
      <SegmentedControlItem label="Condensed" value="condensed" />
    </SegmentedControl>
  );

  const kindCounts = useMemo(() => {
    const counts = new Map<MilestoneKind, number>();
    for (const milestone of MILESTONES) {
      counts.set(milestone.kind, (counts.get(milestone.kind) ?? 0) + 1);
    }
    return counts;
  }, []);

  return (
    <Layout
      height="fill"
      contentWidth={980}
      header={
        <LayoutHeader hasDivider>
          <VStack gap={2}>
            {/* Brand row */}
            <HStack gap={2} vAlign="center">
              <div style={styles.brandMark} aria-hidden="true">
                S
              </div>
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>{COMPANY.name}</Heading>
                  <Badge label="About" />
                </HStack>
              </StackItem>
              <Button
                label="Contact"
                variant="secondary"
                size="sm"
                icon={<Icon icon={MailIcon} size="sm" />}
                style={styles.subnavTapTarget}
                onClick={() =>
                  toast({
                    body: 'Opening a conversation with hello@straylight.dev — expect a human within one business day.',
                    uniqueID: 'about-contact',
                  })
                }
              />
            </HStack>
            {/* Slim in-page subnav — scrolls horizontally on phones */}
            <nav aria-label="Page sections" style={styles.subnavScroller}>
              <div style={styles.subnavRow}>
                {SECTIONS.map(section => (
                  <Button
                    key={section.id}
                    label={section.label}
                    size="sm"
                    variant={
                      activeSection === section.id ? 'secondary' : 'ghost'
                    }
                    style={styles.subnavTapTarget}
                    onClick={() => jumpToSection(section.id)}
                  />
                ))}
              </div>
            </nav>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <VStack gap={8}>
            {/* ---- Narrative header ---- */}
            <VStack gap={3}>
              <span style={styles.heroEyebrow}>
                <Text type="label" color="secondary">
                  {HERO.eyebrow}
                </Text>
              </span>
              <div style={styles.heroTitle}>
                <Heading level={1}>{HERO.title}</Heading>
              </div>
              <div style={styles.heroLede}>
                <Text type="body" color="secondary">
                  {HERO.lede}
                </Text>
              </div>
              <HStack gap={1} wrap="wrap">
                <Token label={\`Founded \${COMPANY.founded}\`} size="sm" />
                <Token label={COMPANY.headquarters} size="sm" />
                <Token label="Remote-friendly" size="sm" />
              </HStack>
            </VStack>

            {/* ---- Mission ---- */}
            <section
              id="mission"
              data-section-id="mission"
              ref={registerSection('mission')}
              style={styles.section}>
              <VStack gap={3}>
                <Heading level={2}>{MISSION.heading}</Heading>
                <div style={styles.missionRule}>
                  <Heading level={3}>{MISSION.statement}</Heading>
                </div>
                <div style={styles.heroLede}>
                  <Text type="body" color="secondary">
                    {MISSION.body}
                  </Text>
                </div>
              </VStack>
            </section>

            {/* ---- Stats band (counts up on scroll into view) ---- */}
            <section
              id="numbers"
              data-section-id="numbers"
              ref={registerSection('numbers')}
              style={styles.section}>
              <div ref={statsRef}>
                <Card variant="muted" padding={5}>
                  <VStack gap={4}>
                    <HStack gap={2} vAlign="center">
                      <StackItem size="fill">
                        <Heading level={2}>By the numbers</Heading>
                      </StackItem>
                      <Button
                        label="Replay"
                        variant="ghost"
                        size="sm"
                        icon={<Icon icon={RotateCcwIcon} size="sm" />}
                        style={styles.subnavTapTarget}
                        onClick={() => setStatsRunToken(token => token + 1)}
                      />
                    </HStack>
                    <Grid columns={{minWidth: 150, max: 4}} gap={4}>
                      {STATS.map(stat => (
                        <CountUpStat
                          key={stat.id}
                          stat={stat}
                          isActive={statsInView}
                          runToken={statsRunToken}
                        />
                      ))}
                    </Grid>
                  </VStack>
                </Card>
              </div>
            </section>

            {/* ---- Company history timeline ---- */}
            <section
              id="story"
              data-section-id="story"
              ref={registerSection('story')}
              style={styles.section}>
              <VStack gap={4}>
                {isNarrow ? (
                  <VStack gap={2}>
                    <Heading level={2}>Our story, 2019–2026</Heading>
                    {timelineControl}
                  </VStack>
                ) : (
                  <HStack gap={3} vAlign="center">
                    <StackItem size="fill">
                      <Heading level={2}>Our story, 2019–2026</Heading>
                    </StackItem>
                    {timelineControl}
                  </HStack>
                )}

                {timelineMode === 'condensed' ? (
                  /* Condensed digest: one compact row per year. */
                  <Card padding={4}>
                    <VStack gap={0}>
                      {MILESTONES.map((milestone, index) => {
                        const kind = MILESTONE_KIND_META[milestone.kind];
                        return (
                          <VStack key={milestone.id} gap={0}>
                            {index > 0 && <Divider />}
                            <div style={styles.condensedRow}>
                              <HStack gap={2} vAlign="center">
                                <span style={styles.condensedYear}>
                                  <Text type="label" color="secondary">
                                    {milestone.year}
                                  </Text>
                                </span>
                                <StackItem size="fill">
                                  <Text type="body" maxLines={1}>
                                    {milestone.title}
                                  </Text>
                                </StackItem>
                                {!isNarrow && (
                                  <Token
                                    label={kind.label}
                                    color={kind.color}
                                    size="sm"
                                  />
                                )}
                              </HStack>
                            </div>
                          </VStack>
                        );
                      })}
                    </VStack>
                  </Card>
                ) : isSingleRail ? (
                  /* Expanded, narrow: single left-rail column. */
                  <div>
                    {MILESTONES.map((milestone, index) => (
                      <div key={milestone.id} style={styles.timelineRowNarrow}>
                        <RailColumn
                          milestone={milestone}
                          isFirst={index === 0}
                          isLast={index === MILESTONES.length - 1}
                          narrow
                        />
                        <div style={styles.timelineBodyNarrow}>
                          <MilestoneCard milestone={milestone} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Expanded, wide: alternating cards on a center rail. */
                  <div>
                    {MILESTONES.map((milestone, index) => {
                      const onLeft = index % 2 === 0;
                      const card = (
                        <div style={styles.timelineCardCell}>
                          <MilestoneCard milestone={milestone} />
                        </div>
                      );
                      return (
                        <div key={milestone.id} style={styles.timelineRowWide}>
                          {onLeft ? card : <div />}
                          <RailColumn
                            milestone={milestone}
                            isFirst={index === 0}
                            isLast={index === MILESTONES.length - 1}
                          />
                          {onLeft ? <div /> : card}
                        </div>
                      );
                    })}
                  </div>
                )}

                <HStack gap={1} wrap="wrap">
                  {(
                    Object.keys(MILESTONE_KIND_META) as MilestoneKind[]
                  ).map(kind => (
                    <Token
                      key={kind}
                      label={\`\${MILESTONE_KIND_META[kind].label} · \${
                        kindCounts.get(kind) ?? 0
                      }\`}
                      color={MILESTONE_KIND_META[kind].color}
                      size="sm"
                    />
                  ))}
                </HStack>
              </VStack>
            </section>

            {/* ---- Values 3x2 icon grid ---- */}
            <section
              id="values"
              data-section-id="values"
              ref={registerSection('values')}
              style={styles.section}>
              <VStack gap={4}>
                <VStack gap={1}>
                  <Heading level={2}>What we optimize for</Heading>
                  <Text type="body" color="secondary">
                    Six habits we hire for, promote for, and write down.
                  </Text>
                </VStack>
                <Grid columns={{minWidth: 220, max: 3}} gap={4}>
                  {VALUES.map(value => (
                    <Card key={value.id} padding={4}>
                      <VStack gap={2}>
                        <div style={styles.valueIcon}>
                          <Icon icon={value.icon} size="sm" />
                        </div>
                        <Heading level={3}>{value.title}</Heading>
                        <Text type="body" color="secondary">
                          {value.body}
                        </Text>
                      </VStack>
                    </Card>
                  ))}
                </Grid>
              </VStack>
            </section>

            {/* ---- Leadership grid with bio popovers ---- */}
            <section
              id="team"
              data-section-id="team"
              ref={registerSection('team')}
              style={styles.section}>
              <VStack gap={4}>
                <VStack gap={1}>
                  <Heading level={2}>Leadership</Heading>
                  <Text type="body" color="secondary">
                    Three founders, three operators — every one of them
                    still takes a support rotation.
                  </Text>
                </VStack>
                <Grid columns={{minWidth: 240, max: 3}} gap={4}>
                  {LEADERS.map(leader => (
                    <Card key={leader.id} padding={4}>
                      <VStack gap={3}>
                        <HStack gap={3} vAlign="center">
                          <GradientAvatar leader={leader} />
                          <StackItem size="fill">
                            <VStack gap={0}>
                              <Text type="body" weight="semibold">
                                {leader.name}
                              </Text>
                              <Text type="supporting" color="secondary">
                                {leader.role}
                              </Text>
                              <Text type="supporting" color="secondary">
                                {leader.joined}
                              </Text>
                            </VStack>
                          </StackItem>
                        </HStack>
                        <Popover
                          label={\`Biography of \${leader.name}\`}
                          placement="below"
                          alignment="start"
                          isOpen={openBioId === leader.id}
                          onOpenChange={isOpen =>
                            setOpenBioId(isOpen ? leader.id : null)
                          }
                          content={<LeaderBio leader={leader} />}>
                          <Button
                            label={
                              openBioId === leader.id
                                ? 'Hide bio'
                                : 'Read bio'
                            }
                            variant="secondary"
                            size="sm"
                            style={styles.subnavTapTarget}
                          />
                        </Popover>
                      </VStack>
                    </Card>
                  ))}
                </Grid>
              </VStack>
            </section>

            {/* ---- Investors & press wordmark row ---- */}
            <VStack gap={4}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <VStack gap={1}>
                    <Heading level={2}>
                      Backed by patient capital, covered honestly
                    </Heading>
                    <Text type="supporting" color="secondary">
                      $86.5M raised across seed, Series A, and Series B.
                    </Text>
                  </VStack>
                </StackItem>
                <Button
                  label="Press kit"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={NewspaperIcon} size="sm" />}
                  style={styles.subnavTapTarget}
                  onClick={() =>
                    toast({
                      body: 'Press kit link copied — logos, founder photos, and the fact sheet, updated June 2026.',
                      uniqueID: 'about-press-kit',
                    })
                  }
                />
              </HStack>
              <HStack gap={2} wrap="wrap">
                {BACKERS.map(backer => (
                  <div key={backer.id} style={styles.logoChip}>
                    <span style={backer.style}>{backer.label}</span>
                  </div>
                ))}
                {PRESS.map(outlet => (
                  <div key={outlet.id} style={styles.logoChip}>
                    <span style={outlet.style}>{outlet.label}</span>
                  </div>
                ))}
              </HStack>
            </VStack>

            {/* ---- Careers CTA panel ---- */}
            <section
              id="careers"
              data-section-id="careers"
              ref={registerSection('careers')}
              style={styles.section}>
              <div style={styles.careersPanel}>
                <VStack gap={4}>
                  <HStack gap={3} vAlign="center" wrap="wrap">
                    <StackItem size="fill">
                      <VStack gap={1}>
                        <Heading level={2}>Build the boring layer</Heading>
                        <Text type="body" color="secondary">
                          12 open roles across engineering, design, and the
                          field. Small teams, whole problems, public
                          post-mortems.
                        </Text>
                      </VStack>
                    </StackItem>
                    <Button
                      label="View all openings"
                      variant="secondary"
                      icon={<Icon icon={ArrowRightIcon} size="sm" />}
                      onClick={() =>
                        toast({
                          body: 'Opening the careers portal — 12 roles, filters for team and location included.',
                          uniqueID: 'about-all-roles',
                        })
                      }
                    />
                  </HStack>
                  <Grid columns={{minWidth: 240, max: 3}} gap={4}>
                    {OPEN_ROLES.map(role => (
                      <Card key={role.id} padding={4}>
                        <VStack gap={3}>
                          <VStack gap={1}>
                            <Token
                              label={role.team}
                              color={role.teamColor}
                              size="sm"
                            />
                            <Heading level={3}>{role.title}</Heading>
                          </VStack>
                          <VStack gap={1}>
                            <HStack gap={1} vAlign="center">
                              <Icon
                                icon={MapPinIcon}
                                size="sm"
                                color="secondary"
                              />
                              <Text type="supporting" color="secondary">
                                {role.location}
                              </Text>
                            </HStack>
                            <HStack gap={1} vAlign="center">
                              <Icon
                                icon={BriefcaseIcon}
                                size="sm"
                                color="secondary"
                              />
                              <Text type="supporting" color="secondary">
                                {role.type}
                              </Text>
                            </HStack>
                          </VStack>
                          <Button
                            label="Apply"
                            variant="primary"
                            size="sm"
                            style={styles.subnavTapTarget}
                            onClick={() => applyToRole(role)}
                          />
                        </VStack>
                      </Card>
                    ))}
                  </Grid>
                </VStack>
              </div>
            </section>

            {/* ---- Footer line ---- */}
            <VStack gap={1}>
              <Divider />
              <Text type="supporting" color="secondary">
                Straylight Systems Inc. · Founded {COMPANY.founded} ·{' '}
                {COMPANY.headquarters} · Uptime, post-mortems, and pricing
                published at straylight.dev/trust
              </Text>
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};