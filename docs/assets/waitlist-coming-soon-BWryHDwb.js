var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file waitlist-coming-soon.tsx
 * @input Deterministic fixtures only (the fictional "Foldline" spatial-notes
 *   pre-launch product: brand copy, a fixed waitlist position of 1,247 with a
 *   FLD-9QK2 referral code and a 50-spots-per-referral boost, three teaser
 *   feature blurbs of which two ship frosted behind "Revealing soon" veils,
 *   three dated launch milestones (Design done / Private beta current /
 *   Public launch upcoming), four social/follow rows, and minimal footer
 *   links). No Date.now, no randomness, no network assets.
 * @output Single-purpose pre-launch waitlist page: a sticky navbar (brand
 *   mark + three smooth-scrolling anchor links + a Join CTA that scrolls to
 *   and focuses the email field; links collapse behind a menu button at
 *   compact widths), a hero with an oversized gradient wordmark that drifts
 *   slowly (static under prefers-reduced-motion) over a one-line teaser and
 *   a validating email capture. Valid submit flips the capture to a position
 *   card — "You're #1,247 in line" counts up — with a personal referral link
 *   + Copy button (copied feedback) and a working "Skip ahead" demo stepper:
 *   each +1 referral animates the position down 50 spots and refills a
 *   progress bar toward the next 100-place bracket, rolling the bracket over
 *   honestly. Below: a tinted teaser band (one revealed card, two frosted),
 *   a launch progress meter with dated milestones, a follow/social row, and
 *   a minimal footer. Deliberately under three viewport-heights — this
 *   archetype is about restraint.
 * @position Page template; emitted by \`astryx template waitlist-coming-soon\`
 *
 * Frame: Layout height="fill", content-only — the page owns its own chrome,
 * so there is no LayoutHeader. LayoutContent (padding 0) hosts one scroll
 * container div; the navbar inside it is position:sticky top:0. A centered
 * 1060px column carries every band's content; the teaser and follow bands
 * paint full-bleed tints behind it. Sections use real ids (join / preview /
 * roadmap / follow) and anchors smooth-scroll the container with a
 * sticky-nav allowance.
 *
 * Interaction contract:
 * - Nav anchors and the footer's Roadmap link smooth-scroll to their
 *   sections; the nav CTA scrolls to the hero and focuses the email input
 *   (or the referral link input once joined). The compact menu closes on
 *   Escape (refocusing its trigger), outside pointerdown, or any selection.
 * - The email form validates on submit (empty + format errors inline) and
 *   success swaps it for the position card; "Use a different email" resets.
 * - The Copy button attempts a guarded clipboard write and always shows a
 *   1.8s "Copied" confirmation; the +1 referral stepper is capped at 20
 *   demo referrals and disables with an honest hint.
 * - Frosted teaser cards are intentionally static (aria-hidden content with
 *   a visible "Revealing soon" chip); social and legal links are no-ops
 *   because they would leave the page.
 *
 * Motion policy: the wordmark's ambient gradient drift is a CSS keyframe
 * animation and the current-milestone dot pulses — both disabled under
 * prefers-reduced-motion. Section reveals are IntersectionObserver-driven
 * (fire once, rise+fade 12px) and render visible under reduced motion or
 * when IntersectionObserver is unavailable. The position number animates
 * with requestAnimationFrame and snaps to its target under reduced motion.
 *
 * Color policy: token-pure except (1) the ONE quarantined brand accent
 * literal (see WCS_ACCENT with its contrast math; tinted washes are
 * color-mix derivations of that single literal) and (2) sanctioned
 * hue-gradient ART on the wordmark and the three teaser art tiles, whose
 * stops are light-dark() pairs so the art keeps contrast in both schemes.
 * NEVER var(--color-text) — it does not exist.
 *
 * Responsive contract (measured with a local ResizeObserver, not viewport
 * media queries — the inline demo stage is ~1045px wide):
 * - >920px: teaser cards 3-up, milestone meter horizontal, nav links inline.
 * - <=920px: teaser cards drop to a single column and the milestone meter
 *   flips to a vertical rail with left-edge connectors.
 * - <=760px: nav links + CTA collapse behind a 40px menu button dropdown.
 * - <=560px: the email/referral rows stack their buttons full-width, the
 *   wordmark type ramp bottoms out, and section paddings tighten. The
 *   wordmark font-size is derived from measured width, so the page holds at
 *   390px in the phone artboard with no overflow-x.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {
  ArrowUpIcon,
  AtSignIcon,
  BoxesIcon,
  CheckIcon,
  CopyIcon,
  GlobeIcon,
  LayersIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  MenuIcon,
  RadioIcon,
  RssIcon,
  SparklesIcon,
  UserPlusIcon,
  WaypointsIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * Quarantined brand accent — the ONE allowed accent literal on this page.
 * Contrast math: #6D28D9 on the light body (near-white) is ~7.1:1 and
 * #C4B5FD on the dark body (near #131316) is ~10.2:1 — both clear WCAG AA
 * for text and UI affordances. Every accent-tinted wash below is a
 * color-mix() derivation of this same pair, never a second literal.
 */
const WCS_ACCENT = 'light-dark(#6D28D9, #C4B5FD)';
const WCS_ACCENT_WASH = \`color-mix(in srgb, \${WCS_ACCENT} 10%, transparent)\`;
const WCS_ACCENT_WASH_SOFT = \`color-mix(in srgb, \${WCS_ACCENT} 5%, transparent)\`;
const WCS_ACCENT_BORDER = \`color-mix(in srgb, \${WCS_ACCENT} 35%, transparent)\`;

/**
 * Sanctioned hue-gradient ART (wordmark + teaser tiles). Each stop is a
 * light-dark() pair: deeper stops on the light scheme, brighter stops on
 * dark, so the clipped wordmark text stays readable in both.
 */
const WORDMARK_GRADIENT =
  'linear-gradient(100deg, ' +
  'light-dark(#6D28D9, #A78BFA) 0%, ' +
  'light-dark(#BE185D, #F472B6) 48%, ' +
  'light-dark(#B45309, #FBBF24) 100%)';

/** Sticky-nav height allowance for smooth-scroll targets. */
const NAV_ALLOWANCE = 68;

// Scoped CSS: wordmark drift, milestone pulse, and scroll reveals — all
// gated by prefers-reduced-motion (reveals render visible, drift static).
const SCOPE = 'wcs-root';
const TEMPLATE_CSS = \`
@keyframes wcs-drift {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
.\${SCOPE} .wcs-wordmark {
  background-size: 220% 220%;
  animation: wcs-drift 16s ease-in-out infinite alternate;
}
@keyframes wcs-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.72); }
}
.\${SCOPE} .wcs-pulse {
  animation: wcs-pulse 1.8s ease-in-out infinite;
}
.\${SCOPE} .wcs-reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}
.\${SCOPE} .wcs-reveal[data-shown='true'] {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .wcs-wordmark { animation: none; }
  .\${SCOPE} .wcs-pulse { animation: none; }
  .\${SCOPE} .wcs-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  column: {
    width: '100%',
    maxWidth: 1060,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  columnCompact: {
    paddingInline: 'var(--spacing-4)',
  },
  // ---- sticky navbar ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'var(--color-background-body)',
    borderBottom: '1px solid var(--color-border)',
  },
  navInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1060,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 56,
  },
  logoTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    // Brand mark rides the sanctioned wordmark art gradient.
    backgroundImage: WORDMARK_GRADIENT,
    color: 'var(--color-background-body)',
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 40,
    paddingInline: 12,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  iconButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    color: 'var(--color-text-primary)',
  },
  mobileMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 'var(--spacing-4)',
    left: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow:
      'var(--shadow-high, 0 12px 32px light-dark(rgba(15, 23, 42, 0.18), rgba(0, 0, 0, 0.5)))',
    padding: 'var(--spacing-3)',
    zIndex: 40,
  },
  mobileMenuLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    paddingInline: 8,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    textAlign: 'left',
  },
  // ---- hero ----
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-9) var(--spacing-8)',
  },
  heroCompact: {
    paddingBlock: 'var(--spacing-6) var(--spacing-6)',
  },
  wordmark: {
    margin: 0,
    fontWeight: 800,
    letterSpacing: '-0.04em',
    lineHeight: 1.02,
    backgroundImage: WORDMARK_GRADIENT,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    maxWidth: '100%',
    overflowWrap: 'anywhere',
  },
  teaserLine: {
    fontSize: 19,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 520,
    margin: 0,
  },
  teaserLineCompact: {
    fontSize: 16,
  },
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 460,
  },
  emailRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  emailInput: {
    flex: '1 1 0',
    minWidth: 0,
  },
  emailError: {
    fontSize: 13,
    margin: 0,
    color: 'var(--color-error, light-dark(#B3261E, #F2B8B5))',
  },
  // ---- position card (post-submit hero state) ----
  positionCard: {
    width: '100%',
    maxWidth: 520,
    boxSizing: 'border-box',
    borderRadius: 16,
    border: \`1px solid \${WCS_ACCENT_BORDER}\`,
    backgroundColor: WCS_ACCENT_WASH_SOFT,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    textAlign: 'left',
  },
  positionNumber: {
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: WCS_ACCENT,
  },
  positionNumberCompact: {
    fontSize: 34,
  },
  referralField: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minWidth: 0,
    flex: '1 1 0',
    height: 40,
    paddingInline: 12,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  skipAheadBox: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  // ---- bands ----
  bandTinted: {
    backgroundColor: 'var(--color-background-muted)',
    borderBlock: '1px solid var(--color-border)',
  },
  bandAccent: {
    backgroundColor: WCS_ACCENT_WASH_SOFT,
    borderBlock: '1px solid var(--color-border)',
  },
  section: {
    paddingBlock: 'var(--spacing-8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  sectionCompact: {
    paddingBlock: 'var(--spacing-6)',
  },
  // ---- teaser cards ----
  teaserGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 'var(--spacing-4)',
  },
  teaserGridStacked: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  teaserCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    minHeight: 180,
    boxSizing: 'border-box',
  },
  teaserArt: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-background-body)',
    flexShrink: 0,
  },
  frostedContent: {
    filter: 'blur(6px)',
    opacity: 0.6,
    pointerEvents: 'none',
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  frostedOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frostedChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 999,
    border: \`1px solid \${WCS_ACCENT_BORDER}\`,
    backgroundColor: 'var(--color-background-body)',
    color: WCS_ACCENT,
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  // ---- launch meter ----
  meterRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
  },
  meterCell: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  meterTrack: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  meterNode: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  meterNodeDone: {
    backgroundColor: WCS_ACCENT,
    color: 'var(--color-background-body)',
  },
  meterNodeCurrent: {
    border: \`2px solid \${WCS_ACCENT}\`,
    backgroundColor: WCS_ACCENT_WASH,
  },
  meterNodeUpcoming: {
    border: '2px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
  },
  meterDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: WCS_ACCENT,
  },
  meterConnector: {
    flex: '1 1 0',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
  },
  meterConnectorFill: {
    height: '100%',
    backgroundColor: WCS_ACCENT,
  },
  meterCellVertical: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  meterRailVertical: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  meterConnectorVertical: {
    width: 3,
    flex: '1 1 12px',
    minHeight: 24,
    borderRadius: 2,
    backgroundColor: 'var(--color-border)',
  },
  // ---- follow / social ----
  socialRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
  },
  socialCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 48,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    textAlign: 'left',
  },
  socialGlyph: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: WCS_ACCENT_WASH,
    color: WCS_ACCENT,
  },
  // ---- footer ----
  footer: {
    borderTop: '1px solid var(--color-border)',
    paddingBlock: 'var(--spacing-5)',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 32,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  monoNote: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Foldline pre-launch page.

const BRAND = {
  name: 'Foldline',
  descriptor: 'Spatial notes',
  teaser:
    'Notes that live in space, not in a list. Lay your thinking out on an ' +
    'infinite canvas that folds back into clean, linear documents.',
  finePrint: '2,318 people in line · two emails total, ever · no spam',
  launchTag: 'Private beta rolling out now',
};

type SectionId = 'join' | 'preview' | 'roadmap' | 'follow';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'preview', label: 'Preview'},
  {id: 'roadmap', label: 'Roadmap'},
  {id: 'follow', label: 'Follow'},
];

const WAITLIST = {
  startPosition: 1247,
  referralBoost: 50,
  referralLink: 'foldline.app/r/FLD-9QK2',
  maxDemoReferrals: 20,
};

interface Teaser {
  id: string;
  title: string;
  blurb: string;
  icon: Glyph;
  /** Sanctioned hue-gradient art tile; light-dark stops for both schemes. */
  gradient: string;
  isRevealed: boolean;
}

const TEASERS: readonly Teaser[] = [
  {
    id: 'canvas',
    title: 'Infinite canvas, real structure',
    blurb:
      'Drop notes anywhere. Foldline tracks the spatial relationships and ' +
      'folds any region back into an ordered outline when you need one.',
    icon: LayersIcon,
    gradient:
      'linear-gradient(135deg, light-dark(#6D28D9, #A78BFA), light-dark(#4338CA, #818CF8))',
    isRevealed: true,
  },
  {
    id: 'threads',
    title: 'Threads between thoughts',
    blurb:
      'Link two notes and Foldline keeps the thread alive across every ' +
      'fold, export, and rearrangement — citations included.',
    icon: WaypointsIcon,
    gradient:
      'linear-gradient(135deg, light-dark(#BE185D, #F472B6), light-dark(#9D174D, #FB7185))',
    isRevealed: false,
  },
  {
    id: 'rooms',
    title: 'Rooms for teams',
    blurb:
      'Share a region of your canvas as a room. Guests see only the fold ' +
      'you opened, never the mess behind it.',
    icon: BoxesIcon,
    gradient:
      'linear-gradient(135deg, light-dark(#B45309, #FBBF24), light-dark(#92400E, #F59E0B))',
    isRevealed: false,
  },
];

interface Milestone {
  id: string;
  label: string;
  date: string;
  note: string;
  state: 'done' | 'current' | 'upcoming';
}

const MILESTONES: readonly Milestone[] = [
  {
    id: 'design',
    label: 'Design',
    date: 'Shipped Feb 2026',
    note: 'Canvas engine, fold model, and the whole visual language.',
    state: 'done',
  },
  {
    id: 'beta',
    label: 'Private beta',
    date: 'Rolling out · Jun 2026',
    note: 'First 400 seats are in. Waitlist invites go out weekly.',
    state: 'current',
  },
  {
    id: 'launch',
    label: 'Public launch',
    date: 'Targeting Oct 9, 2026',
    note: 'Free tier plus paid rooms. Waitlist members get 3 months free.',
    state: 'upcoming',
  },
];

const SOCIALS: readonly {
  id: string;
  label: string;
  handle: string;
  icon: Glyph;
}[] = [
  {id: 'social', label: 'Social', handle: '@foldline', icon: AtSignIcon},
  {id: 'buildlog', label: 'Build log', handle: 'Every Friday', icon: RssIcon},
  {id: 'radio', label: 'Beta radio', handle: 'Monthly demo call', icon: RadioIcon},
  {id: 'site', label: 'Manifesto', handle: 'foldline.app/why', icon: GlobeIcon},
];

const FOOTER_LINKS: readonly string[] = ['Privacy', 'Terms', 'Press'];

// ============= HELPERS =============

const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your email to hold a spot.';
  }
  if (!EMAIL_RE.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

/** Guarded clipboard write: fine to no-op in sandboxed frames. */
function copyToClipboard(text: string): void {
  if (typeof navigator !== 'undefined' && navigator.clipboard != null) {
    void navigator.clipboard.writeText(text).catch(() => undefined);
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Measured page width (ResizeObserver) — see Responsive contract. */
function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/**
 * Fires once when the node scrolls into view; falls back to "visible" when
 * IntersectionObserver is unavailable so nothing stays hidden statically.
 */
function useInView(): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (node == null) {
      return undefined;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      {threshold: 0.25},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * Eases the displayed number from its previous value to \`target\` with
 * requestAnimationFrame while \`isActive\`; the first activation counts up
 * from 0. Reduced motion (and rAF-less environments) snap to the target.
 */
function useAnimatedNumber(
  target: number,
  isActive: boolean,
  durationMs = 900,
): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    if (!isActive) {
      fromRef.current = 0;
      setValue(0);
      return undefined;
    }
    if (prefersReducedMotion() || typeof requestAnimationFrame === 'undefined') {
      fromRef.current = target;
      setValue(target);
      return undefined;
    }
    const from = fromRef.current;
    let frame = 0;
    let startedAt: number | null = null;
    const tick = (now: number) => {
      if (startedAt === null) {
        startedAt = now;
      }
      const progress = Math.min(1, (now - startedAt) / durationMs);
      // ease-out cubic: fast start, gentle landing on the fixture value.
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (target - from) * eased;
      fromRef.current = next;
      setValue(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isActive, durationMs]);
  return Math.round(value);
}

// ============= SMALL PIECES =============

/** Foldline logomark: gradient fold tile + wordmark text. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={LayersIcon} size="sm" color="inherit" />
      </div>
      <Text type="label">{BRAND.name}</Text>
    </HStack>
  );
}

/** 40px icon-only button (Astryx Button caps at 36px). */
function IconButton40({
  label,
  icon,
  onClick,
  ariaExpanded,
  buttonRef,
}: {
  label: string;
  icon: Glyph;
  onClick: () => void;
  ariaExpanded?: boolean;
  buttonRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      style={styles.iconButton}>
      <Icon icon={icon} size="sm" color="inherit" />
    </button>
  );
}

/** Rise+fade scroll reveal; fires once, renders visible on reduced motion. */
function Reveal({
  children,
  delayMs = 0,
}: {
  children: React.ReactNode;
  delayMs?: number;
}) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className="wcs-reveal"
      data-shown={inView}
      style={{transitionDelay: \`\${delayMs}ms\`}}>
      {children}
    </div>
  );
}

/** One teaser card; frosted variant hides its copy behind a veil chip. */
function TeaserCard({teaser}: {teaser: Teaser}) {
  const body = (
    <>
      <div
        style={{...styles.teaserArt, backgroundImage: teaser.gradient}}
        aria-hidden="true">
        <Icon icon={teaser.icon} size="sm" color="inherit" />
      </div>
      <VStack gap={1}>
        <Text type="label">{teaser.title}</Text>
        <Text type="supporting" color="secondary">
          {teaser.blurb}
        </Text>
      </VStack>
    </>
  );
  if (teaser.isRevealed) {
    return <div style={styles.teaserCard}>{body}</div>;
  }
  return (
    <div style={styles.teaserCard} aria-label="Feature revealing soon">
      <div style={styles.frostedContent} aria-hidden="true">
        {body}
      </div>
      <div style={styles.frostedOverlay}>
        <span style={styles.frostedChip}>
          <Icon icon={LockIcon} size="xsm" color="inherit" />
          Revealing soon
        </span>
      </div>
    </div>
  );
}

/** One milestone node glyph: done check / current pulse / upcoming ring. */
function MilestoneNode({state}: {state: Milestone['state']}) {
  if (state === 'done') {
    return (
      <div style={{...styles.meterNode, ...styles.meterNodeDone}}>
        <Icon icon={CheckIcon} size="xsm" color="inherit" />
      </div>
    );
  }
  if (state === 'current') {
    return (
      <div style={{...styles.meterNode, ...styles.meterNodeCurrent}}>
        <span className="wcs-pulse" style={styles.meterDot} />
      </div>
    );
  }
  return <div style={{...styles.meterNode, ...styles.meterNodeUpcoming}} />;
}

function MilestoneCopy({milestone}: {milestone: Milestone}) {
  return (
    <VStack gap={0}>
      <Text type="label">{milestone.label}</Text>
      <Text type="supporting" color="secondary">
        {milestone.date}
      </Text>
      <Text type="supporting" color="secondary">
        {milestone.note}
      </Text>
    </VStack>
  );
}

// ============= PAGE =============

export default function WaitlistComingSoonTemplate() {
  // ---- measured responsive breakpoints (see Responsive contract) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pageWidth = useElementWidth(wrapRef);
  const isMid = pageWidth > 0 && pageWidth <= 920;
  const isNavCompact = pageWidth > 0 && pageWidth <= 760;
  const isPhone = pageWidth > 0 && pageWidth <= 560;

  // Wordmark type ramp derives from measured width so 390px holds.
  const wordmarkSize =
    pageWidth > 0
      ? Math.round(Math.min(118, Math.max(52, pageWidth * 0.105)))
      : 96;

  // ---- nav / smooth scroll ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>(
    {},
  );
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // ---- email capture → position card ----
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [joinedEmail, setJoinedEmail] = useState<string | null>(null);

  // ---- referral demo stepper ----
  const [referrals, setReferrals] = useState(0);
  const position = Math.max(
    1,
    WAITLIST.startPosition - referrals * WAITLIST.referralBoost,
  );
  const displayedPosition = useAnimatedNumber(position, joinedEmail !== null);
  const isDemoCapped = referrals >= WAITLIST.maxDemoReferrals;

  // Bracket math for the "next 100" progress bar: from #1,247 the next
  // 100-place bracket is #1,200 (47 spots away → 53% filled). Crossing a
  // bracket rolls the target over honestly (e.g. #1,197 → chasing #1,100).
  const bracketTarget = Math.max(0, Math.floor((position - 1) / 100) * 100);
  const spotsToBracket = position - bracketTarget;
  const bracketProgress = 100 - spotsToBracket;

  // ---- copy feedback ----
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (!isCopied) {
      return undefined;
    }
    const timer = setTimeout(() => setIsCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [isCopied]);

  // Compact menu dismisses on Escape (refocusing the trigger) and on any
  // pointerdown outside the sticky navbar; listeners only run while open.
  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const nav = navRef.current;
      if (
        nav !== null &&
        event.target instanceof Node &&
        !nav.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isMenuOpen]);

  // ---- interactions ----
  const jumpToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container == null || section == null) {
      return;
    }
    container.scrollTo({
      top: id === 'join' ? 0 : section.offsetTop - NAV_ALLOWANCE,
      behavior: 'smooth',
    });
  };

  const jumpToJoin = () => {
    jumpToSection('join');
    emailInputRef.current?.focus();
  };

  const submitEmail = () => {
    const error = validateEmail(email);
    if (error !== null) {
      setEmailError(error);
      return;
    }
    setJoinedEmail(email.trim());
    setEmail('');
    setEmailError(null);
  };

  const resetJoin = () => {
    setJoinedEmail(null);
    setReferrals(0);
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const columnStyle = {
    ...styles.column,
    ...(isPhone ? styles.columnCompact : null),
  };
  const sectionStyle = {
    ...styles.section,
    ...(isPhone ? styles.sectionCompact : null),
  };

  // ============= NAVBAR =============

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Foldline">
      <div style={styles.navInner}>
        <BrandMark />
        <StackItem size="fill">
          <span />
        </StackItem>
        {!isNavCompact && (
          <HStack gap={1} vAlign="center">
            {NAV_ANCHORS.map(anchor => (
              <button
                key={anchor.id}
                type="button"
                style={styles.navLink}
                onClick={() => jumpToSection(anchor.id)}>
                {anchor.label}
              </button>
            ))}
            <Button
              label="Join the waitlist"
              variant="primary"
              size="md"
              onClick={jumpToJoin}
            />
          </HStack>
        )}
        {isNavCompact && (
          <IconButton40
            label={isMenuOpen ? 'Close menu' : 'Open menu'}
            icon={isMenuOpen ? XIcon : MenuIcon}
            ariaExpanded={isMenuOpen}
            buttonRef={menuTriggerRef}
            onClick={() => setIsMenuOpen(open => !open)}
          />
        )}
        {isNavCompact && isMenuOpen && (
          <div style={styles.mobileMenu} role="menu" aria-label="Site menu">
            <VStack gap={1}>
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  role="menuitem"
                  style={styles.mobileMenuLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
              <Button
                label="Join the waitlist"
                variant="primary"
                size="md"
                onClick={jumpToJoin}
              />
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO =============

  const emailCapture = (
    <VStack gap={2} hAlign="center" style={{width: '100%'}}>
      <div
        style={{
          ...styles.emailRow,
          ...(isPhone ? styles.emailRowStacked : null),
        }}>
        <div style={styles.emailInput}>
          <TextInput
            ref={emailInputRef}
            type="email"
            label="Email address"
            isLabelHidden
            placeholder="you@example.com"
            value={email}
            status={emailError !== null ? {type: 'error'} : undefined}
            onChange={value => {
              setEmail(value);
              setEmailError(null);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                submitEmail();
              }
            }}
          />
        </div>
        <Button
          label="Join the waitlist"
          variant="primary"
          icon={<Icon icon={SparklesIcon} size="sm" color="inherit" />}
          onClick={submitEmail}
        />
      </div>
      {emailError !== null && (
        <p style={styles.emailError} role="alert">
          {emailError}
        </p>
      )}
      <Text type="supporting" color="secondary">
        {BRAND.finePrint}
      </Text>
    </VStack>
  );

  const positionCard = (
    // No aria-live here: the rAF count-up would announce every frame.
    <div style={styles.positionCard}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {\`You're in, \${joinedEmail ?? ''} — current spot\`}
        </Text>
        <span
          style={{
            ...styles.positionNumber,
            ...(isPhone ? styles.positionNumberCompact : null),
          }}>
          #{displayedPosition.toLocaleString('en-US')} in line
        </span>
      </VStack>

      {/* Personal referral link + guarded copy with confirmation. */}
      <div
        style={{
          ...styles.emailRow,
          maxWidth: 'none',
          ...(isPhone ? styles.emailRowStacked : null),
        }}>
        <div style={styles.referralField}>
          <Icon icon={LinkIcon} size="xsm" color="inherit" />
          <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {WAITLIST.referralLink}
          </span>
        </div>
        <Button
          label={isCopied ? 'Copied' : 'Copy link'}
          variant="secondary"
          icon={
            <Icon
              icon={isCopied ? CheckIcon : CopyIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={() => {
            copyToClipboard(\`https://\${WAITLIST.referralLink}\`);
            setIsCopied(true);
          }}
        />
      </div>

      {/* Skip-ahead explainer + interactive demo stepper. */}
      <div style={styles.skipAheadBox}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ArrowUpIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text size="sm" weight="semibold">
              Skip ahead — every referral moves you up{' '}
              {WAITLIST.referralBoost} spots
            </Text>
          </StackItem>
        </HStack>
        <ProgressBar
          value={bracketProgress}
          max={100}
          label={\`Progress toward #\${bracketTarget.toLocaleString('en-US')}\`}
          hasValueLabel
          formatValueLabel={() =>
            \`\${spotsToBracket} spot\${spotsToBracket === 1 ? '' : 's'} to go\`
          }
          variant="accent"
        />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button
            label="+1 referral (demo)"
            variant="secondary"
            size="md"
            isDisabled={isDemoCapped}
            icon={<Icon icon={UserPlusIcon} size="sm" color="inherit" />}
            onClick={() =>
              setReferrals(count =>
                Math.min(WAITLIST.maxDemoReferrals, count + 1),
              )
            }
          />
          <Text type="supporting" color="secondary">
            {isDemoCapped
              ? 'Demo capped — invite real friends to go further.'
              : \`\${referrals} simulated referral\${referrals === 1 ? '' : 's'}\`}
          </Text>
        </HStack>
      </div>

      <button type="button" style={styles.footerLink} onClick={resetJoin}>
        Use a different email
      </button>
    </div>
  );

  const hero = (
    <section
      id="join"
      ref={registerSection('join')}
      aria-label="Join the Foldline waitlist"
      style={{...styles.hero, ...(isPhone ? styles.heroCompact : null)}}>
      <Token label={BRAND.launchTag} size="sm" color="purple" />
      <h1
        className="wcs-wordmark"
        style={{...styles.wordmark, fontSize: wordmarkSize}}>
        {BRAND.name}
      </h1>
      <Text type="label" color="secondary">
        {BRAND.descriptor}
      </Text>
      <p
        style={{
          ...styles.teaserLine,
          ...(isPhone ? styles.teaserLineCompact : null),
        }}>
        {BRAND.teaser}
      </p>
      {joinedEmail === null ? emailCapture : positionCard}
    </section>
  );

  // ============= PREVIEW BAND =============

  const preview = (
    <div style={styles.bandTinted}>
      <div style={columnStyle}>
        <section
          id="preview"
          ref={registerSection('preview')}
          aria-label="What's inside"
          style={sectionStyle}>
          <Reveal>
            <VStack gap={2}>
              <Token label="What's inside" size="sm" color="purple" />
              <Heading level={2}>Three reasons to be early</Heading>
              <Text type="supporting" color="secondary">
                One is public. The other two unlock as invites roll out.
              </Text>
            </VStack>
          </Reveal>
          <Reveal delayMs={80}>
            <div
              style={{
                ...styles.teaserGrid,
                ...(isMid ? styles.teaserGridStacked : null),
              }}>
              {TEASERS.map(teaser => (
                <TeaserCard key={teaser.id} teaser={teaser} />
              ))}
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );

  // ============= ROADMAP =============

  const meterHorizontal = (
    <div style={styles.meterRow}>
      {MILESTONES.map((milestone, index) => (
        <div key={milestone.id} style={styles.meterCell}>
          <div style={styles.meterTrack}>
            <MilestoneNode state={milestone.state} />
            {index < MILESTONES.length - 1 && (
              <div style={styles.meterConnector} aria-hidden="true">
                <div
                  style={{
                    ...styles.meterConnectorFill,
                    // Segment fill mirrors milestone state: done→current is
                    // fully painted, current→upcoming is the beta's ~40%.
                    width: milestone.state === 'done' ? '100%' : '40%',
                  }}
                />
              </div>
            )}
          </div>
          <div style={{paddingRight: 'var(--spacing-3)'}}>
            <MilestoneCopy milestone={milestone} />
          </div>
        </div>
      ))}
    </div>
  );

  const meterVertical = (
    <VStack gap={0}>
      {MILESTONES.map((milestone, index) => (
        <div key={milestone.id} style={styles.meterCellVertical}>
          <div style={styles.meterRailVertical}>
            <MilestoneNode state={milestone.state} />
            {index < MILESTONES.length - 1 && (
              <div
                style={{
                  ...styles.meterConnectorVertical,
                  ...(milestone.state === 'done'
                    ? {backgroundColor: WCS_ACCENT}
                    : null),
                }}
                aria-hidden="true"
              />
            )}
          </div>
          <div style={{paddingBottom: 'var(--spacing-4)', minWidth: 0}}>
            <MilestoneCopy milestone={milestone} />
          </div>
        </div>
      ))}
    </VStack>
  );

  const roadmap = (
    <div style={columnStyle}>
      <section
        id="roadmap"
        ref={registerSection('roadmap')}
        aria-label="Launch roadmap"
        style={sectionStyle}>
        <Reveal>
          <VStack gap={2}>
            <Token label="Roadmap" size="sm" color="purple" />
            <Heading level={2}>Where the build stands</Heading>
          </VStack>
        </Reveal>
        <Reveal delayMs={80}>{isMid ? meterVertical : meterHorizontal}</Reveal>
      </section>
    </div>
  );

  // ============= FOLLOW BAND =============

  const follow = (
    <div style={styles.bandAccent}>
      <div style={columnStyle}>
        <section
          id="follow"
          ref={registerSection('follow')}
          aria-label="Follow the build"
          style={sectionStyle}>
          <Reveal>
            <VStack gap={2}>
              <Token label="Follow along" size="sm" color="purple" />
              <Heading level={2}>Watch it come together</Heading>
              <Text type="supporting" color="secondary">
                A build note every Friday and a live demo call each month.
              </Text>
            </VStack>
          </Reveal>
          <Reveal delayMs={80}>
            <div style={styles.socialRow}>
              {SOCIALS.map(social => (
                // Would leave the page — no-op by convention.
                <button
                  key={social.id}
                  type="button"
                  style={styles.socialCard}
                  onClick={() => {}}>
                  <span style={styles.socialGlyph} aria-hidden="true">
                    <Icon icon={social.icon} size="sm" color="inherit" />
                  </span>
                  <VStack gap={0}>
                    <Text size="sm" weight="semibold">
                      {social.label}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {social.handle}
                    </Text>
                  </VStack>
                </button>
              ))}
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );

  // ============= FOOTER =============

  const footer = (
    <div style={columnStyle}>
      <footer style={styles.footer} aria-label="Footer">
        <HStack gap={3} vAlign="center" wrap="wrap">
          <BrandMark />
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              © 2026 Foldline Systems
            </Text>
          </StackItem>
          <span style={styles.monoNote}>
            <Icon icon={MailIcon} size="xsm" color="inherit" />{' '}
            hello@foldline.app
          </span>
          {FOOTER_LINKS.map(label => (
            // Would leave the page — no-op by convention.
            <button
              key={label}
              type="button"
              style={styles.footerLink}
              onClick={() => {}}>
              {label}
            </button>
          ))}
        </HStack>
      </footer>
    </div>
  );

  // ============= FRAME =============

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={0} role="main" label="Foldline coming soon">
          <div ref={wrapRef} className={SCOPE} style={{height: '100%'}}>
            <style>{TEMPLATE_CSS}</style>
            <div ref={pageRef} style={styles.page}>
              {navbar}
              <div style={columnStyle}>{hero}</div>
              {preview}
              {roadmap}
              {follow}
              {footer}
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};