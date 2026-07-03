// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only: a fictional marketing site
 *   ("Northlight", northlight.dev) with a 12-route fixture sitemap used by
 *   the playful variant's live search, six popular-destination links for
 *   the helpful-links variant, per-variant copy tables keyed by the 404/500
 *   code toggle, and a frozen incident record ("Elevated error rates",
 *   last update 14:32 UTC). No clocks, no randomness, no network assets —
 *   the robot mascot is drawn entirely with CSS.
 * @output A variant-switched collection of four error screens rendered one
 *   at a time inside a framed browser viewport (traffic-light dots + mono
 *   address pill): (1) minimal centered 404 with oversized gradient type
 *   and a back-home CTA, (2) a playful screen with a CSS-drawn lost-robot
 *   mascot and a working site-search box that filters the fixture sitemap
 *   as you type and fires a navigation toast on Enter or suggestion click,
 *   (3) a helpful-links screen listing popular destinations with icons,
 *   and (4) a 500/maintenance screen with an incident-status chip, a retry
 *   button that spins briefly then lands on an inline "still down" Banner,
 *   and a validated status-updates email subscribe form.
 * @position Page template; emitted by `astryx template error-404-collection`.
 *
 * Color policy: the only raw color literals are deliberately scheme-locked
 * surfaces that must render identically in light and dark mode — (1) the
 * Northlight brand gradient (header brand mark + gradient-clipped error
 * code), which is brand art; (2) the CSS-drawn lost-robot mascot, a fixed
 * illustration whose slate/amber palette (and the eye/mouth/badge marks
 * sitting on those surfaces) depicts an artifact, not themed UI; and
 * (3) the browser frame's traffic-light dots, which depict window chrome.
 * Each locked style carries colorScheme: 'light'. Every other color is an
 * Astryx var(--color-*) token and adapts via the theme's light-dark() system.
 *
 * Frame: Layout height="fill". LayoutHeader carries the Northlight brand
 * mark, a StatusDot mirroring the active screen's severity, and the two
 * controls — a four-item SegmentedControl variant switcher and a 404/500
 * code SegmentedControl. LayoutContent centers the framed viewport (max
 * 880px) above a caption row describing the active variant. LayoutFooter
 * keeps a fixture-data disclosure line.
 *
 * Responsive contract:
 * - >640px: brand + both SegmentedControls share one header row; the
 *   framed viewport keeps 56px of horizontal breathing room and the error
 *   screens center inside a 460px-tall stage.
 * - <=640px: the header stacks — brand row first, then the variant
 *   switcher and code toggle on their own full-width rows with >=44px tap
 *   targets. The viewport frame goes edge-to-edge, stage padding tightens,
 *   the oversized error code steps down from 96px to 64px, the popular
 *   links list drops its two-column grid for a single column, and the
 *   subscribe form stacks its input above its button. Search suggestions
 *   are full-width rows with >=44px hit areas; nothing is hover-only.
 * - The viewport stage scrolls vertically inside LayoutContent if a
 *   variant outgrows it; overflowX is never introduced.
 *
 * Container policy (error-page-collection archetype): exactly one primary
 * container — the browser-frame Card — so each error screen reads as a
 * real destination page, not a dashboard widget. Inside the frame, only
 * the helpful-links variant uses secondary bordered rows (link tiles);
 * every other variant is open, centered composition. Chrome (switchers,
 * captions, footer) stays outside the frame.
 *
 * Fixture policy: fixed strings only. The retry interaction uses a single
 * bounded setTimeout to reveal a pre-written failure state — no clocks are
 * read, and every attempt deterministically ends in the same inline alert.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ActivityIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CompassIcon,
  CreditCardIcon,
  HistoryIcon,
  LifeBuoyIcon,
  MailIcon,
  MapIcon,
  NewspaperIcon,
  PlugIcon,
  RefreshCwIcon,
  RocketIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserIcon,
  WrenchIcon,
} from 'lucide-react';

// ============= STYLES =============
// Plain inline styles using Astryx design-token CSS variables. The only
// custom palettes are the brand gradient, the browser-frame traffic dots,
// and the robot mascot, which must look the same in both themes (they
// depict fixed artifacts, not themed UI) — each is scheme-locked with
// colorScheme: 'light'. See the "Color policy" note in the header.

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

const styles: Record<string, CSSProperties> = {
  // --- page chrome ---
  // Scheme-locked Northlight brand gradient (see Color policy).
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #d946ef)',
    flexShrink: 0,
    colorScheme: 'light',
  },
  // SegmentedControls get a guaranteed touch height on compact screens.
  segmentedTapTarget: {minHeight: 44},

  // --- browser frame ---
  frameCard: {
    width: '100%',
    maxWidth: 880,
    overflow: 'hidden',
  },
  frameBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
  },
  frameDots: {display: 'flex', gap: 6, flexShrink: 0},
  // Scheme-locked traffic-light dots — fixed window-chrome hexes, same in
  // both themes like real macOS traffic lights (Color policy).
  frameDot: {width: 10, height: 10, borderRadius: '50%', colorScheme: 'light'},
  addressPill: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingBlock: 4,
    paddingInline: 10,
    borderRadius: 999,
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
  },
  addressText: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // The stage each error screen renders on. minHeight keeps the four
  // variants from reflowing the page as you switch between them.
  stage: {
    minHeight: 460,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-6)',
  },
  stageCompact: {
    minHeight: 420,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBlock: 'var(--spacing-6)',
    paddingInline: 'var(--spacing-3)',
  },

  // --- minimal variant ---
  // Scheme-locked brand gradient clipped to the oversized error code; the
  // vivid mid-tone ramp reads on both light and dark stages (Color policy).
  bigCode: {
    fontSize: 96,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: '-0.04em',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #d946ef)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    colorScheme: 'light',
  },
  bigCodeCompact: {
    fontSize: 64,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: '-0.04em',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #d946ef)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    colorScheme: 'light',
  },
  centeredCopy: {maxWidth: 440, textAlign: 'center'},

  // --- robot mascot (pure CSS) ---
  // Scheme-locked illustration: the wrapper pins colorScheme for the whole
  // mascot; every literal below (slate surfaces, amber antenna + glow, and
  // the eye/mouth/badge marks on those surfaces) stays fixed in both themes
  // so the artifact never re-themes (Color policy).
  robotWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transform: 'rotate(-4deg)',
    colorScheme: 'light',
  },
  robotAntennaStem: {
    width: 3,
    height: 16,
    backgroundColor: '#94a3b8',
    borderRadius: 2,
  },
  robotAntennaTip: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#f59e0b',
    boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.25)',
    marginBottom: -2,
  },
  robotHead: {
    width: 92,
    height: 68,
    borderRadius: 18,
    background: 'linear-gradient(160deg, #cbd5e1 0%, #94a3b8 100%)',
    border: '2px solid #64748b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  robotEyes: {display: 'flex', gap: 18},
  robotEye: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: '#0f172a',
  },
  // The 500 state shows one shorted-out "x" eye.
  robotEyeCross: {
    width: 14,
    height: 14,
    color: '#0f172a',
    fontFamily: MONO_FONT,
    fontSize: 14,
    fontWeight: 700,
    lineHeight: '14px',
    textAlign: 'center',
  },
  robotMouth: {
    width: 26,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
  robotBody: {
    width: 64,
    height: 30,
    marginTop: 4,
    borderRadius: '10px 10px 14px 14px',
    background: 'linear-gradient(160deg, #94a3b8 0%, #64748b 100%)',
    border: '2px solid #475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotBadge: {
    fontFamily: MONO_FONT,
    fontSize: 9,
    letterSpacing: '0.08em',
    color: '#e2e8f0',
  },
  robotShadow: {
    width: 72,
    height: 8,
    marginTop: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
  },
  speechBubble: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    border: '1px dashed var(--color-border)',
    borderRadius: 12,
    paddingBlock: 4,
    paddingInline: 10,
  },

  // --- playful search ---
  searchBlock: {width: '100%', maxWidth: 460},
  suggestionList: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  suggestionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    paddingBlock: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-3)',
    border: 'none',
    borderBottom: '1px solid var(--color-border)',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
  },
  suggestionButtonLast: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    paddingBlock: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-3)',
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
  },
  suggestionPath: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },

  // --- helpful links ---
  linkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
    width: '100%',
    maxWidth: 620,
  },
  linkGridCompact: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 'var(--spacing-3)',
    width: '100%',
  },
  linkTile: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    minHeight: 44,
    padding: 'var(--spacing-3)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
  },
  linkTileIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-accent-muted)',
  },

  // --- 500 / maintenance ---
  statusBlock: {width: '100%', maxWidth: 480},
  subscribeRow: {display: 'flex', gap: 'var(--spacing-2)'},
  subscribeRowCompact: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },

  // Visually hidden live region announcing search-result counts.
  visuallyHidden: {
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
// Deterministic fixtures: a fictional marketing site, its sitemap, and one
// frozen incident. No value is ever derived from a clock or RNG.

const SITE = {
  name: 'Northlight',
  host: 'northlight.dev',
} as const;

type ErrorCode = '404' | '500';

type VariantId = 'minimal' | 'playful' | 'links' | 'status';

const VARIANT_ORDER: VariantId[] = ['minimal', 'playful', 'links', 'status'];

interface VariantMeta {
  label: string;
  caption: string;
  /** Requested path shown in the frame's address pill, per code. */
  path: Record<ErrorCode, string>;
  /** Whether the 404/500 code toggle changes this variant's copy. */
  usesCodeToggle: boolean;
}

const VARIANTS: Record<VariantId, VariantMeta> = {
  minimal: {
    label: 'Minimal',
    caption:
      'Centered oversized code with one primary action — the quietest possible dead end.',
    path: {'404': '/launch-blog-psot', '500': '/dashboard'},
    usesCodeToggle: true,
  },
  playful: {
    label: 'Lost robot',
    caption:
      'CSS-drawn mascot plus a live site search — type to filter 12 fixture routes, Enter to navigate.',
    path: {'404': '/docs/quickstartt', '500': '/docs/quickstart'},
    usesCodeToggle: true,
  },
  links: {
    label: 'Helpful links',
    caption:
      'Popular destinations with icons so a dead end becomes a jumping-off point.',
    path: {'404': '/careeers', '500': '/careers'},
    usesCodeToggle: true,
  },
  status: {
    label: 'Incident',
    caption:
      'Maintenance screen with an incident chip, retry-with-spinner, and a status-updates subscribe form.',
    path: {'404': '/account/billing', '500': '/account/billing'},
    usesCodeToggle: false, // always shows the 5xx incident state
  },
};

// Per-code copy for the variants that honor the code toggle.
const MINIMAL_COPY: Record<
  ErrorCode,
  {title: string; body: string}
> = {
  '404': {
    title: 'Page not found',
    body: 'The page you are looking for was moved, renamed, or never existed. Check the address or head back home.',
  },
  '500': {
    title: 'Something went wrong',
    body: 'Our servers hit an unexpected error while rendering this page. It is on us, not you — trying again usually works.',
  },
};

const PLAYFUL_COPY: Record<
  ErrorCode,
  {title: string; speech: string; hint: string}
> = {
  '404': {
    title: 'B-4-0-4 searched everywhere. No page.',
    speech: 'beep… route not found',
    hint: 'Try searching for what you came for instead:',
  },
  '500': {
    title: 'B-4-0-4 tripped over a server error.',
    speech: 'bzzt… internal fault',
    hint: 'While we reboot him, search for another page:',
  },
};

const LINKS_COPY: Record<ErrorCode, {title: string; body: string}> = {
  '404': {
    title: 'That page is off the map',
    body: 'We could not find that address, but these are the places people usually want:',
  },
  '500': {
    title: 'We are having trouble serving that page',
    body: 'The rest of the site is healthy — these destinations are all up:',
  },
};

// Frozen incident record for the 500/maintenance variant.
const INCIDENT = {
  chip: 'Investigating',
  summary: 'Elevated error rates on web rendering',
  detail:
    'Our engineers are rolling back a bad deploy. Most pages are unaffected; this one is temporarily unavailable.',
  lastUpdate: 'Last update 14:32 UTC',
  id: 'INC-2214',
} as const;

// The 12-route fixture sitemap the playful search filters over.
interface SiteRoute {
  path: string;
  title: string;
  icon: typeof BookOpenIcon;
}

const ROUTES: SiteRoute[] = [
  {path: '/docs', title: 'Documentation home', icon: BookOpenIcon},
  {path: '/docs/quickstart', title: 'Quickstart guide', icon: RocketIcon},
  {path: '/docs/api', title: 'API reference', icon: WrenchIcon},
  {path: '/pricing', title: 'Pricing & plans', icon: CreditCardIcon},
  {path: '/blog', title: 'Blog', icon: NewspaperIcon},
  {path: '/changelog', title: 'Changelog', icon: HistoryIcon},
  {path: '/careers', title: 'Careers', icon: BriefcaseIcon},
  {path: '/support', title: 'Support center', icon: LifeBuoyIcon},
  {path: '/status', title: 'System status', icon: ActivityIcon},
  {path: '/integrations', title: 'Integrations directory', icon: PlugIcon},
  {path: '/security', title: 'Security & compliance', icon: ShieldCheckIcon},
  {path: '/account/billing', title: 'Billing settings', icon: UserIcon},
];

const MAX_SUGGESTIONS = 5;

// Six popular destinations for the helpful-links variant, with blurbs.
interface PopularLink {
  path: string;
  title: string;
  blurb: string;
  icon: typeof BookOpenIcon;
}

const POPULAR_LINKS: PopularLink[] = [
  {
    path: '/docs',
    title: 'Documentation',
    blurb: 'Guides, concepts, and the full API reference.',
    icon: BookOpenIcon,
  },
  {
    path: '/pricing',
    title: 'Pricing',
    blurb: 'Plans for solo builders through enterprise.',
    icon: CreditCardIcon,
  },
  {
    path: '/blog',
    title: 'Blog',
    blurb: 'Product announcements and engineering deep dives.',
    icon: NewspaperIcon,
  },
  {
    path: '/changelog',
    title: 'Changelog',
    blurb: 'Everything we shipped, week by week.',
    icon: HistoryIcon,
  },
  {
    path: '/support',
    title: 'Support center',
    blurb: 'Troubleshooting articles and how to reach a human.',
    icon: LifeBuoyIcon,
  },
  {
    path: '/status',
    title: 'System status',
    blurb: 'Live uptime for the API, dashboard, and webhooks.',
    icon: ActivityIcon,
  },
];

// ============= HELPERS =============

/** Case-insensitive substring match over path + title. */
function matchRoutes(query: string): SiteRoute[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [];
  }
  return ROUTES.filter(
    route =>
      route.path.toLowerCase().includes(needle) ||
      route.title.toLowerCase().includes(needle),
  ).slice(0, MAX_SUGGESTIONS);
}

/** Deliberately simple fixture validation — not RFC 5322. */
function isPlausibleEmail(value: string): boolean {
  const trimmed = value.trim();
  const at = trimmed.indexOf('@');
  return at > 0 && trimmed.indexOf('.', at) > at + 1;
}

// ============= BROWSER FRAME =============

/**
 * The framed viewport every variant renders inside: traffic-light dots and
 * a mono address pill showing the (fixture) requested URL. Fixed hex dot
 * colors — this depicts window chrome, not themed UI.
 */
function BrowserFrame({
  path,
  children,
  isCompact,
}: {
  path: string;
  children: ReactNode;
  isCompact: boolean;
}) {
  return (
    <Card padding={0} style={styles.frameCard}>
      <div style={styles.frameBar}>
        <div style={styles.frameDots} aria-hidden>
          <span style={{...styles.frameDot, backgroundColor: '#f87171'}} />
          <span style={{...styles.frameDot, backgroundColor: '#fbbf24'}} />
          <span style={{...styles.frameDot, backgroundColor: '#34d399'}} />
        </div>
        <div style={styles.addressPill}>
          <Icon icon={CompassIcon} size="xsm" color="secondary" />
          <span style={styles.addressText}>
            https://{SITE.host}
            {path}
          </span>
        </div>
      </div>
      <div style={isCompact ? styles.stageCompact : styles.stage}>
        {children}
      </div>
    </Card>
  );
}

// ============= VARIANT: MINIMAL =============

function MinimalScreen({
  code,
  isCompact,
  onNavigate,
}: {
  code: ErrorCode;
  isCompact: boolean;
  onNavigate: (path: string, label: string) => void;
}) {
  const copy = MINIMAL_COPY[code];
  return (
    <VStack gap={4} hAlign="center">
      <span
        style={isCompact ? styles.bigCodeCompact : styles.bigCode}
        aria-hidden>
        {code}
      </span>
      <VStack gap={2} hAlign="center" style={styles.centeredCopy}>
        <Heading level={2}>{copy.title}</Heading>
        <Text type="body" color="secondary">
          {copy.body}
        </Text>
      </VStack>
      <HStack gap={2} vAlign="center">
        <Button
          label="Back to home"
          variant="primary"
          icon={<Icon icon={ArrowLeftIcon} size="sm" color="inherit" />}
          onClick={() => onNavigate('/', 'home')}
        />
        <Button
          label="Contact support"
          variant="secondary"
          onClick={() => onNavigate('/support', 'the support center')}
        />
      </HStack>
      <Text type="supporting" color="secondary">
        Error code: {code === '404' ? 'NOT_FOUND' : 'INTERNAL_ERROR'} · ref
        nl_f8d2c
      </Text>
    </VStack>
  );
}

// ============= VARIANT: LOST ROBOT + SEARCH =============

/** The lost-robot mascot, drawn entirely with CSS. */
function RobotMascot({code}: {code: ErrorCode}) {
  return (
    <div style={styles.robotWrap} aria-hidden>
      <div style={styles.robotAntennaTip} />
      <div style={styles.robotAntennaStem} />
      <div style={styles.robotHead}>
        <div style={styles.robotEyes}>
          <div style={styles.robotEye} />
          {code === '500' ? (
            // One eye shorts out on server errors.
            <div style={styles.robotEyeCross}>x</div>
          ) : (
            <div style={styles.robotEye} />
          )}
        </div>
        <div style={styles.robotMouth} />
      </div>
      <div style={styles.robotBody}>
        <span style={styles.robotBadge}>B-{code.split('').join('-')}</span>
      </div>
      <div style={styles.robotShadow} />
    </div>
  );
}

function PlayfulScreen({
  code,
  query,
  onQueryChange,
  onNavigate,
}: {
  code: ErrorCode;
  query: string;
  onQueryChange: (value: string) => void;
  onNavigate: (path: string, label: string) => void;
}) {
  const copy = PLAYFUL_COPY[code];
  const suggestions = useMemo(() => matchRoutes(query), [query]);
  const hasQuery = query.trim().length > 0;

  const submitSearch = () => {
    if (suggestions.length > 0) {
      onNavigate(suggestions[0].path, suggestions[0].title);
    }
  };

  return (
    <VStack gap={4} hAlign="center">
      <RobotMascot code={code} />
      <span style={styles.speechBubble}>“{copy.speech}”</span>
      <VStack gap={2} hAlign="center" style={styles.centeredCopy}>
        <Heading level={2}>{copy.title}</Heading>
        <Text type="body" color="secondary">
          {copy.hint}
        </Text>
      </VStack>

      <VStack gap={2} style={styles.searchBlock}>
        {/* Wrapping the input in a form makes Enter fire navigation to the
            top suggestion — the standard search-box affordance. */}
        <form
          onSubmit={event => {
            event.preventDefault();
            submitSearch();
          }}>
          <TextInput
            label={`Search ${SITE.host}`}
            isLabelHidden
            value={query}
            onChange={onQueryChange}
            placeholder={`Search ${SITE.host}…`}
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            hasClear
            size="lg"
            width="100%"
          />
        </form>

        {hasQuery && suggestions.length === 0 && (
          <Text type="supporting" color="secondary">
            No pages match “{query.trim()}”. B-4-0-4 double-checked.
          </Text>
        )}

        {suggestions.length > 0 && (
          <div style={styles.suggestionList} role="list">
            {suggestions.map((route, index) => (
              <button
                key={route.path}
                type="button"
                role="listitem"
                style={
                  index === suggestions.length - 1
                    ? styles.suggestionButtonLast
                    : styles.suggestionButton
                }
                onClick={() => onNavigate(route.path, route.title)}>
                <Icon icon={route.icon} size="sm" color="secondary" />
                <StackItem size="fill">
                  <Text type="body" maxLines={1}>
                    {route.title}
                  </Text>
                </StackItem>
                <span style={styles.suggestionPath}>{route.path}</span>
              </button>
            ))}
          </div>
        )}

        {/* Screen-reader announcement of the live result count. */}
        <div style={styles.visuallyHidden} aria-live="polite">
          {hasQuery
            ? `${suggestions.length} page suggestion${
                suggestions.length === 1 ? '' : 's'
              }`
            : ''}
        </div>
      </VStack>

      <Link onClick={() => onNavigate('/', 'home')} type="supporting">
        Or just take me home
      </Link>
    </VStack>
  );
}

// ============= VARIANT: HELPFUL LINKS =============

function HelpfulLinksScreen({
  code,
  isCompact,
  onNavigate,
}: {
  code: ErrorCode;
  isCompact: boolean;
  onNavigate: (path: string, label: string) => void;
}) {
  const copy = LINKS_COPY[code];
  return (
    <VStack gap={5} hAlign="center">
      <VStack gap={2} hAlign="center" style={styles.centeredCopy}>
        <HStack gap={2} vAlign="center">
          <Icon icon={MapIcon} size="lg" color="secondary" />
          <Token label={code} color={code === '404' ? 'blue' : 'red'} />
        </HStack>
        <Heading level={2}>{copy.title}</Heading>
        <Text type="body" color="secondary">
          {copy.body}
        </Text>
      </VStack>

      <div style={isCompact ? styles.linkGridCompact : styles.linkGrid}>
        {POPULAR_LINKS.map(link => (
          <button
            key={link.path}
            type="button"
            style={styles.linkTile}
            onClick={() => onNavigate(link.path, link.title)}>
            <div style={styles.linkTileIcon}>
              <Icon icon={link.icon} size="sm" color="accent" />
            </div>
            <VStack gap={0}>
              <Text weight="medium">{link.title}</Text>
              <Text type="supporting" color="secondary" maxLines={2}>
                {link.blurb}
              </Text>
            </VStack>
          </button>
        ))}
      </div>

      <Link onClick={() => onNavigate('/', 'home')} type="supporting">
        Back to {SITE.host}
      </Link>
    </VStack>
  );
}

// ============= VARIANT: 500 / MAINTENANCE =============

type RetryPhase = 'idle' | 'checking' | 'failed';

function StatusScreen({
  retryPhase,
  retryAttempts,
  onRetry,
  onDismissRetry,
  email,
  onEmailChange,
  emailError,
  isSubscribed,
  onSubscribe,
  isCompact,
}: {
  retryPhase: RetryPhase;
  retryAttempts: number;
  onRetry: () => void;
  onDismissRetry: () => void;
  email: string;
  onEmailChange: (value: string) => void;
  emailError: string | null;
  isSubscribed: boolean;
  onSubscribe: () => void;
  isCompact: boolean;
}) {
  return (
    <VStack gap={5} hAlign="center">
      <VStack gap={3} hAlign="center" style={styles.centeredCopy}>
        {/* Incident-status chip: severity token + frozen summary. */}
        <HStack gap={2} vAlign="center">
          <Token label={INCIDENT.chip} color="orange" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {INCIDENT.id} · {INCIDENT.lastUpdate}
          </Text>
        </HStack>
        <Heading level={2}>We’ll be right back</Heading>
        <Text type="body" color="secondary">
          {INCIDENT.summary}. {INCIDENT.detail}
        </Text>
      </VStack>

      <VStack gap={3} style={styles.statusBlock}>
        {retryPhase === 'checking' ? (
          <HStack gap={2} vAlign="center" hAlign="center">
            <Spinner size="sm" aria-label="Retrying" />
            <Text type="supporting" color="secondary">
              Checking if the page is back…
            </Text>
          </HStack>
        ) : (
          <HStack gap={2} vAlign="center" hAlign="center">
            <Button
              label={retryAttempts > 0 ? 'Retry again' : 'Retry now'}
              variant="primary"
              icon={<Icon icon={RefreshCwIcon} size="sm" color="inherit" />}
              onClick={onRetry}
            />
            <Button
              label="View status page"
              variant="secondary"
              icon={<Icon icon={ActivityIcon} size="sm" color="inherit" />}
              onClick={onDismissRetry}
            />
          </HStack>
        )}

        {retryPhase === 'failed' && (
          <VStack gap={1}>
            {/* Deterministic outcome: every fixture retry lands here. */}
            <Banner
              status="error"
              title="Still down"
              description={`Attempt ${retryAttempts} reached the origin, but the incident is still active. We’ll keep retrying on our side too.`}
            />
            <Link onClick={onDismissRetry} type="supporting">
              Dismiss
            </Link>
          </VStack>
        )}

        <Divider />

        {/* Status-updates subscribe form with fixture validation. */}
        {isSubscribed ? (
          <HStack gap={2} vAlign="center" hAlign="center">
            <Icon icon="success" size="sm" color="success" />
            <Text type="supporting">
              Subscribed — we’ll email you when {INCIDENT.id} resolves.
            </Text>
          </HStack>
        ) : (
          <form
            onSubmit={event => {
              event.preventDefault();
              onSubscribe();
            }}>
            <VStack gap={1}>
              <Text type="label">Get an email when this is fixed</Text>
              <div
                style={
                  isCompact ? styles.subscribeRowCompact : styles.subscribeRow
                }>
                <StackItem size="fill">
                  <TextInput
                    label="Email for status updates"
                    isLabelHidden
                    value={email}
                    onChange={onEmailChange}
                    placeholder="you@example.com"
                    startIcon={<Icon icon={MailIcon} size="sm" />}
                    width="100%"
                  />
                </StackItem>
                <Button label="Notify me" variant="secondary" type="submit" />
              </div>
              {emailError != null && (
                <FieldStatus
                  variant="detached"
                  type="error"
                  message={emailError}
                />
              )}
            </VStack>
          </form>
        )}
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function Error404CollectionTemplate() {
  // Which of the four error screens fills the framed viewport.
  const [variant, setVariant] = useState<VariantId>('minimal');
  // The 404/500 code toggle; the incident variant always shows 5xx copy.
  const [code, setCode] = useState<ErrorCode>('404');

  // Playful variant's live search box.
  const [query, setQuery] = useState('');

  // Incident variant: retry lifecycle + subscribe form.
  const [retryPhase, setRetryPhase] = useState<RetryPhase>('idle');
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (retryTimer.current != null) {
        clearTimeout(retryTimer.current);
      }
    },
    [],
  );

  const toast = useToast();
  const isCompact = useMediaQuery('(max-width: 640px)');

  const meta = VARIANTS[variant];
  // The incident screen is inherently a 5xx state; the toggle applies
  // everywhere else.
  const effectiveCode: ErrorCode = meta.usesCodeToggle ? code : '500';
  const framePath = meta.path[effectiveCode];

  /** Fixture navigation: every link/CTA lands in a toast, never a real URL. */
  const navigate = (path: string, label: string) => {
    toast({
      body: `Navigating to ${label} (${SITE.host}${path}) — demo only, no real navigation.`,
    });
  };

  const startRetry = () => {
    if (retryTimer.current != null) {
      clearTimeout(retryTimer.current);
    }
    setRetryAttempts(previous => previous + 1);
    setRetryPhase('checking');
    // Bounded fixture delay: the spinner always resolves to "still down".
    retryTimer.current = setTimeout(() => {
      setRetryPhase('failed');
      retryTimer.current = null;
    }, 1100);
  };

  const dismissRetry = () => {
    if (retryTimer.current != null) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
    setRetryPhase('idle');
  };

  const subscribe = () => {
    if (!isPlausibleEmail(email)) {
      setEmailError('Enter a valid email address, like you@example.com.');
      return;
    }
    setEmailError(null);
    setIsSubscribed(true);
    toast({
      body: `Subscribed ${email.trim()} to updates for ${INCIDENT.id} (fixture — nothing was sent).`,
    });
  };

  const headerDot =
    variant === 'status' || effectiveCode === '500'
      ? ({variant: 'error', label: 'Serving a 5xx screen'} as const)
      : ({variant: 'warning', label: 'Serving a 404 screen'} as const);

  const variantSwitcher = (
    <SegmentedControl
      label="Error screen variant"
      value={variant}
      onChange={value => setVariant(value as VariantId)}
      size="sm"
      style={isCompact ? styles.segmentedTapTarget : undefined}>
      {VARIANT_ORDER.map(id => (
        <SegmentedControlItem key={id} label={VARIANTS[id].label} value={id} />
      ))}
    </SegmentedControl>
  );

  const codeToggle = (
    <SegmentedControl
      label="Fixture error code"
      value={code}
      onChange={value => setCode(value as ErrorCode)}
      size="sm"
      style={isCompact ? styles.segmentedTapTarget : undefined}>
      <SegmentedControlItem label="404" value="404" />
      <SegmentedControlItem label="500" value="500" />
    </SegmentedControl>
  );

  let screen: ReactNode;
  switch (variant) {
    case 'minimal':
      screen = (
        <MinimalScreen
          code={effectiveCode}
          isCompact={isCompact}
          onNavigate={navigate}
        />
      );
      break;
    case 'playful':
      screen = (
        <PlayfulScreen
          code={effectiveCode}
          query={query}
          onQueryChange={setQuery}
          onNavigate={navigate}
        />
      );
      break;
    case 'links':
      screen = (
        <HelpfulLinksScreen
          code={effectiveCode}
          isCompact={isCompact}
          onNavigate={navigate}
        />
      );
      break;
    case 'status':
      screen = (
        <StatusScreen
          retryPhase={retryPhase}
          retryAttempts={retryAttempts}
          onRetry={startRetry}
          onDismissRetry={dismissRetry}
          email={email}
          onEmailChange={value => {
            setEmail(value);
            if (emailError != null) {
              setEmailError(null);
            }
          }}
          emailError={emailError}
          isSubscribed={isSubscribed}
          onSubscribe={subscribe}
          isCompact={isCompact}
        />
      );
      break;
  }

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {isCompact ? (
            // <=640px: brand row, then each switcher on its own full-width
            // row so every segment keeps a >=44px tap target.
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <div style={styles.brandMark} aria-hidden />
                <StackItem size="fill">
                  <Heading level={1}>404 &amp; error pages</Heading>
                </StackItem>
                <StatusDot variant={headerDot.variant} label={headerDot.label} />
              </HStack>
              {variantSwitcher}
              {codeToggle}
            </VStack>
          ) : (
            <HStack gap={3} vAlign="center">
              <div style={styles.brandMark} aria-hidden />
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>404 &amp; error pages</Heading>
                  <Badge label={`${VARIANT_ORDER.length} variants`} />
                </HStack>
              </StackItem>
              <StatusDot variant={headerDot.variant} label={headerDot.label} />
              {variantSwitcher}
              {codeToggle}
            </HStack>
          )}
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={4} label="Error screen preview">
          <VStack gap={3} hAlign="center">
            {/* Caption row: what this variant demonstrates + how the code
                toggle applies to it. */}
            <HStack gap={2} vAlign="center" style={styles.frameCard}>
              <StackItem size="fill">
                <Text type="supporting" color="secondary" maxLines={2}>
                  {meta.caption}
                </Text>
              </StackItem>
              {meta.usesCodeToggle ? (
                <Token
                  label={`showing ${effectiveCode}`}
                  color={effectiveCode === '404' ? 'blue' : 'red'}
                  size="sm"
                />
              ) : (
                <Token label="always 5xx" color="orange" size="sm" />
              )}
            </HStack>

            <BrowserFrame path={framePath} isCompact={isCompact}>
              {screen}
            </BrowserFrame>
          </VStack>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary" maxLines={1}>
                All copy is fixture data · {ROUTES.length} routes indexed for
                search · navigation lands in a toast
              </Text>
            </StackItem>
            {!isCompact && (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {SITE.host} · {INCIDENT.id}
              </Text>
            )}
          </HStack>
        </LayoutFooter>
      }
    />
  );
}
