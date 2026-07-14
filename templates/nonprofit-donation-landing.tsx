// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file nonprofit-donation-landing.tsx
 * @input Deterministic fixtures only (the fictional "Clearwater Fund —
 *   Restore the Alder" river-restoration campaign: campaign totals
 *   ($68,450 raised of $100,000 · 912 donors · 23 days left), four fixed
 *   donation amounts with curated one-time and monthly impact lines plus
 *   a formula for custom amounts, three impact-story quotes, a five-slice
 *   where-money-goes budget that sums to 100% with an honest overhead
 *   slice, five milestones (3 completed, 2 upcoming), three transparency
 *   document cards, an EIN, and seven employers with gift-match policies)
 * @output Art-directed campaign landing page. A condensing navbar
 *   (transparent over the hero, gaining a hairline + tinted blur surface
 *   after 24px of scroll) sits over an aurora-lit hero: 62-78px display
 *   headline with a gradient-ink phrase, a floating glass progress card
 *   whose bar fills and totals roll up on first reveal, and a staged
 *   "river theater" — the schematic river SVG in a perspective wrapper
 *   that tilts toward the pointer while three satellite mini-cards
 *   (donor toast, sapling metric, corporate-match chip) bob on
 *   independent keyframes; the whole stage bleeds across the band
 *   boundary into the donate section. Centerpiece donation widget:
 *   One-time / Monthly SegmentedControl, amount chips + custom
 *   NumberInput that live-update an impact line, and a sheen-sweep
 *   Donate CTA that fires an inline thank-you state (share-link copy row
 *   + validating receipt-email capture) and honestly bumps the hero
 *   totals. Below: a scheme-locked dark impact-stories band (glass
 *   quote cards in a Carousel, a looping campaign-fact marquee, and a
 *   pointer-tracked spotlight), a dot-grid-textured where-money-goes
 *   band with the interactive SVG donut + legend-row selection, a
 *   pinned scroll-story milestones scene (sticky stage in a 260vh
 *   container; scroll progress fills the phase rail and advances the
 *   detail card with its oversized numeral — phases are also clickable),
 *   an aurora-backed transparency band with hover-raising report cards +
 *   copyable EIN mono row, and the corporate-match employer lookup.
 * @position Page template; emitted by `astryx template nonprofit-donation-landing`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container; the navbar inside it is position:sticky top:0
 * and the hero band tucks under it with a negative margin so the
 * transparent nav floats over the aurora field. Full-bleed bands center a
 * 1080px content column with 112px vertical rhythm (64px compact). The
 * footer is a scheme-locked dark band. The interaction-receipt Toast sits
 * fixed bottom-right.
 *
 * Art direction system:
 * - Atmosphere: aurora blobs (blurred radial gradients, 32-44s alternate
 *   drift keyframes) behind the hero and transparency bands; an inline
 *   feTurbulence grain overlay at 0.04 opacity on the hero and dark
 *   bands; a dot-grid texture behind the budget donut band.
 * - Depth tiers: SHADOW_RAISED for resting cards, SHADOW_FLOATING for
 *   the hero stage/progress card/detail card, SHADOW_GLASS (inset
 *   hairline + deep drop) for cards on the dark band; `.ndl-raise`
 *   cards lift a tier and gain an accent border-glow on hover.
 * - Signature dark section: the impact-stories band is colorScheme:'dark'
 *   with vibrant accent glows, glass cards, a campaign-fact marquee
 *   (52s loop, pauses on hover, static + wrapped under reduced motion),
 *   and a --mx/--my pointer spotlight.
 * - CTAs: custom sheen-sweep primary buttons (translating gradient
 *   overlay, 1px hover lift, 0.98 pressed scale).
 *
 * Interaction contract:
 * - Nav anchors smooth-scroll the container to real section ids with a
 *   sticky-nav allowance; the compact menu closes on Escape (refocusing
 *   the trigger), outside pointerdown, or any selection.
 * - The donation widget's amount chips, custom NumberInput, and cadence
 *   SegmentedControl all recompute the impact line and Donate label in
 *   one pass; Donate validates the custom amount, then swaps the widget
 *   body for a thank-you state and adds the gift to the hero totals (bar
 *   width transitions to the new percentage; funded saplings recompute).
 * - The thank-you share row copies the campaign link with a 2s "Copied"
 *   flip; the receipt-email capture validates (empty/format) with inline
 *   error text and flips to a confirmed row.
 * - Donut legend rows are buttons: selecting one thickens its slice, dims
 *   the rest, and swaps the donut center readout; selecting it again
 *   returns to the 100% summary.
 * - The milestones scroll scene advances with scroll progress AND via
 *   the clickable phase buttons (which scroll the container to the
 *   matching progress point). Reduced motion or stacked widths render
 *   the same content as a static staggered timeline.
 * - The employer match input filters a static suggest list from 2+
 *   characters; picking a suggestion renders the employer's match policy
 *   card with the doubled-gift math spelled out.
 * - Transparency report cards and footer links that would leave the page
 *   fire a corner Toast so the wiring is provable; EIN has a copy flip.
 *
 * Motion policy: transform/opacity only (plus the donut's stroke props
 * and the progress bar width fill retained from the original). Scroll
 * reveals rise 16px + scale 0.985 over 560ms decelerate and fire once
 * via IntersectionObserver; count-ups run ~900ms rAF ease-out cubic;
 * aurora drift, satellite bobbing, the marquee loop, hero parallax, the
 * CTA sheen, and the pinned scene are ALL disabled under
 * prefers-reduced-motion (reveals render visible, counters render final,
 * the bar renders at rest, saplings render planted, the marquee renders
 * as a static wrapped row, and the milestones render stacked).
 *
 * Color policy: token/light-dark hybrid. ONE quarantined campaign accent
 * literal (river teal, see ACCENT) with contrast math; every new glow,
 * aurora blob, gradient ink, and glass surface is derived via color-mix
 * from that accent, the SUCCESS token, or the existing dark-band
 * literals — no new color literals. Donut slice tones and SVG tints are
 * explicit light-dark() pairs; story-card art gradients, the stories
 * band, and the footer are scheme-locked with colorScheme:'dark'. Shadow
 * tiers use neutral black alphas per the design contract.
 *
 * Responsive contract (measured with a local ResizeObserver — the demo's
 * inline stage is ~1045px wide, so viewport media queries only fire in
 * the separate 390px phone iframe):
 * - >1000px: 78px hero display type; >760px: 62px; compact tiers 46/38.
 * - >920px: hero is split copy/progress-card with the parallax stage and
 *   satellites, the donate band sits widget-beside-supporting-copy, the
 *   breakdown is donut-beside-legend, and milestones run as the pinned
 *   scroll scene.
 * - <=920px: hero, donate band, and breakdown stack; satellites and
 *   parallax turn off; milestones render as the static timeline.
 * - <=780px: nav anchor links collapse behind a 40px menu button whose
 *   dropdown lists the anchors and the Donate CTA.
 * - <=640px: band paddings tighten to 64px, amount chips wrap 2-up, the
 *   share/receipt rows stack, and Grid minWidths carry story/report
 *   cards to single column. Holds at 390px with no overflow-x.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Carousel} from '@astryxdesign/core/Carousel';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {
  ArrowRightIcon,
  BirdIcon,
  Building2Icon,
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  FileTextIcon,
  FishIcon,
  HeartHandshakeIcon,
  LinkIcon,
  LockIcon,
  MailCheckIcon,
  MenuIcon,
  SearchIcon,
  SproutIcon,
  UsersIcon,
  WavesIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============
// ONE quarantined campaign accent literal (river teal), used for the
// brand mark, river water, selected chips, CTAs, and — via color-mix —
// every aurora blob, glow, and gradient ink on the page.
// Contrast math: light #0F766E on white = 5.5:1 (AA for text and UI);
// dark #5EEAD4 on the ~#1B1B1F dark app background = 11.6:1 (AAA).
// The rgba() variants below are alpha washes of the SAME two hexes.
const ACCENT = 'light-dark(#0F766E, #5EEAD4)';
const ACCENT_WASH = 'light-dark(rgba(15, 118, 110, 0.10), rgba(94, 234, 212, 0.12))';
const ACCENT_WASH_SOFT =
  'light-dark(rgba(15, 118, 110, 0.05), rgba(94, 234, 212, 0.06))';
const ACCENT_BORDER =
  'light-dark(rgba(15, 118, 110, 0.45), rgba(94, 234, 212, 0.45))';

// Scheme-locked dark-band paint (stories band + footer share the same
// deep river-basin hex; text literals sit on colorScheme:'dark').
const DARK_BAND = '#0B1F1D';
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.82)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.62)';

/** CTA ink: white on the teal in light scheme, basin-dark on mint in dark. */
const CTA_INK = 'light-dark(#FFFFFF, #0B1F1D)';

const SUCCESS = 'var(--color-success, light-dark(#1E8E3E, #6DD58C))';
const ERROR = 'var(--color-error, light-dark(#B3261E, #F2B8B5))';

// ---- depth tiers (contract-specified neutral black alphas) ----
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.28)';
const SHADOW_GLASS =
  `inset 0 0 0 1px color-mix(in srgb, ${DARK_TEXT} 14%, transparent), ` +
  '0 24px 48px -24px rgba(0, 0, 0, 0.5)';
const GLOW_CTA =
  '0 1px 2px rgba(0, 0, 0, 0.06), ' +
  `0 12px 28px -10px color-mix(in srgb, ${ACCENT} 55%, transparent)`;

// ---- aurora field (accent × success mixes only — no new literals) ----
const AURORA_TEAL = `color-mix(in srgb, ${ACCENT} 52%, transparent)`;
const AURORA_GREEN = `color-mix(in srgb, ${SUCCESS} 42%, transparent)`;
const AURORA_BLEND = `color-mix(in srgb, color-mix(in srgb, ${ACCENT} 55%, ${SUCCESS}) 40%, transparent)`;

/** Inline feTurbulence grain tile (data URI — no network assets). */
const GRAIN_URL =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' ' +
  "width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence " +
  "type='fractalNoise' baseFrequency='0.82' numOctaves='2' " +
  "stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' " +
  'filter=\'url(%23g)\' opacity=\'0.55\'/%3E%3C/svg%3E")';

/** Sticky-nav height; smooth-scroll allows for it. */
const NAV_ALLOWANCE = 68;
/** Resting navbar height; the hero band tucks under it by this much. */
const NAV_HEIGHT = 60;

// Scoped stylesheet: aurora drift, satellite bobbing, the marquee loop,
// the CTA sheen, and hover raises need keyframes and pseudo-class
// selectors that inline styles can't express. Everything is neutralized
// in the prefers-reduced-motion block (and the marquee wraps static).
const SCOPE = 'ndl-root';

const TEMPLATE_CSS = `
@keyframes ndl-aurora-a {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(60px, 34px, 0) scale(1.12); }
  100% { transform: translate3d(-44px, -22px, 0) scale(0.96); }
}
@keyframes ndl-aurora-b {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-70px, 26px, 0) scale(1.08); }
  100% { transform: translate3d(32px, -32px, 0) scale(1.02); }
}
@keyframes ndl-aurora-c {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(42px, -30px, 0) scale(1.15); }
  100% { transform: translate3d(-30px, 22px, 0) scale(0.94); }
}
@keyframes ndl-bob {
  0% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
  100% { transform: translateY(0); }
}
@keyframes ndl-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes ndl-swap-in {
  from { opacity: 0; transform: translateY(14px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.${SCOPE} .ndl-aurora-a { animation: ndl-aurora-a 38s ease-in-out infinite alternate; }
.${SCOPE} .ndl-aurora-b { animation: ndl-aurora-b 44s ease-in-out infinite alternate; }
.${SCOPE} .ndl-aurora-c { animation: ndl-aurora-c 32s ease-in-out infinite alternate; }
.${SCOPE} .ndl-bob { animation: ndl-bob 7s ease-in-out infinite; }
.${SCOPE} .ndl-cta { transition: transform 0.18s ease, box-shadow 0.18s ease; }
.${SCOPE} .ndl-cta:hover { transform: translateY(-1px); }
.${SCOPE} .ndl-cta:active { transform: translateY(0) scale(0.98); }
.${SCOPE} .ndl-cta-sheen { transform: translateX(-160%) skewX(-16deg); }
.${SCOPE} .ndl-cta:hover .ndl-cta-sheen {
  transform: translateX(220%) skewX(-16deg);
  transition: transform 0.7s ease;
}
.${SCOPE} .ndl-raise { transition: transform 0.18s ease, box-shadow 0.18s ease; }
.${SCOPE} .ndl-raise:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px ${ACCENT_BORDER}, ${SHADOW_FLOATING};
}
.${SCOPE} .ndl-navlink { transition: color 0.15s ease; }
.${SCOPE} .ndl-navlink:hover { color: var(--color-text-primary); }
.${SCOPE} .ndl-marquee-track {
  display: flex;
  width: max-content;
  align-items: center;
  animation: ndl-marquee 52s linear infinite;
}
.${SCOPE} .ndl-marquee:hover .ndl-marquee-track { animation-play-state: paused; }
.${SCOPE} .ndl-swap { animation: ndl-swap-in 420ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} .ndl-aurora-a, .${SCOPE} .ndl-aurora-b, .${SCOPE} .ndl-aurora-c,
  .${SCOPE} .ndl-bob, .${SCOPE} .ndl-swap { animation: none; }
  .${SCOPE} .ndl-cta, .${SCOPE} .ndl-raise, .${SCOPE} .ndl-navlink { transition: none; }
  .${SCOPE} .ndl-cta:hover, .${SCOPE} .ndl-cta:active,
  .${SCOPE} .ndl-raise:hover { transform: none; box-shadow: none; }
  .${SCOPE} .ndl-cta:hover .ndl-cta-sheen {
    transform: translateX(-160%) skewX(-16deg);
    transition: none;
  }
  .${SCOPE} .ndl-marquee-track { animation: none; flex-wrap: wrap; width: auto; }
  .${SCOPE} .ndl-marquee-dupe { display: none; }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  band: {
    position: 'relative',
    width: '100%',
  },
  bandTinted: {
    backgroundColor: ACCENT_WASH_SOFT,
  },
  // Absolutely-positioned atmosphere layer per band; clips its own blobs
  // so the page never gains horizontal overflow.
  bandFx: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  auroraBlob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN_URL,
    backgroundRepeat: 'repeat',
    opacity: 0.04,
    pointerEvents: 'none',
  },
  dotGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 1.6px)',
    backgroundSize: '26px 26px',
    opacity: 0.45,
    pointerEvents: 'none',
  },
  column: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  // ---- type scale ----
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingInline: 10,
    borderRadius: 999,
    backgroundColor: ACCENT_WASH,
    border: `1px solid ${ACCENT_BORDER}`,
    color: ACCENT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  sectionTitle: {
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  sectionLede: {
    fontSize: 16,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  // ---- sticky navbar (transparent → condensed tinted surface) ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    transition:
      'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
  },
  navBarScrolled: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(14px) saturate(1.5)',
    WebkitBackdropFilter: 'blur(14px) saturate(1.5)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: SHADOW_RAISED,
  },
  navInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  brandTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_WASH,
    border: `1px solid ${ACCENT_BORDER}`,
    color: ACCENT,
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
  menuButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    color: 'var(--color-text-primary)',
  },
  navMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 'var(--spacing-4)',
    left: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-3)',
    zIndex: 40,
  },
  navMenuLink: {
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
  // ---- sheen-sweep CTA ----
  cta: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    paddingInline: 22,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 700,
    backgroundColor: ACCENT,
    color: CTA_INK,
    boxShadow: GLOW_CTA,
    whiteSpace: 'nowrap',
  },
  ctaSm: {
    height: 40,
    paddingInline: 16,
    fontSize: 14,
  },
  ctaSheen: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: `linear-gradient(105deg, transparent 40%, color-mix(in srgb, ${DARK_TEXT} 35%, transparent) 50%, transparent 60%)`,
  },
  // ---- hero ----
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  heroText: {
    flex: '7 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroHeadline: {
    fontWeight: 700,
    lineHeight: 1.02,
    letterSpacing: '-0.03em',
    margin: 0,
  },
  heroInk: {
    backgroundImage: `linear-gradient(94deg, ${ACCENT} 0%, color-mix(in srgb, ${ACCENT} 55%, ${SUCCESS}) 60%, ${SUCCESS} 115%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
  },
  heroSubcopy: {
    fontSize: 18,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  // River theater: perspective wrapper + tilting pane + satellites.
  heroStage: {
    position: 'relative',
    zIndex: 2,
  },
  heroPerspective: {
    perspective: 1400,
  },
  riverPane: {
    borderRadius: 18,
    boxShadow: SHADOW_FLOATING,
  },
  riverFrame: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    lineHeight: 0,
  },
  satellite: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    whiteSpace: 'nowrap',
  },
  satelliteIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
    flexShrink: 0,
  },
  satelliteTitle: {
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  satelliteCaption: {
    fontSize: 11.5,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.25,
  },
  // ---- progress card (floating glass) ----
  progressCard: {
    flex: '5 1 0',
    minWidth: 0,
    boxSizing: 'border-box',
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 88%, transparent)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  raisedStat: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: ACCENT,
  },
  // ---- donation widget ----
  donateRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'flex-start',
  },
  donateRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  donateCard: {
    flex: '6 1 0',
    minWidth: 0,
    boxSizing: 'border-box',
    borderRadius: 20,
    border: `1px solid ${ACCENT_BORDER}`,
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  donateAside: {
    flex: '5 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  amountGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'var(--spacing-2)',
  },
  amountGridCompact: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  amountChip: {
    height: 48,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  amountChipSelected: {
    borderColor: ACCENT,
    boxShadow: `0 0 0 1px ${ACCENT}`,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
  },
  impactLine: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 10,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  fieldError: {
    fontSize: 13,
    margin: 0,
    color: ERROR,
  },
  shareLinkBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 12.5,
    color: 'var(--color-text-secondary)',
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  successDisc: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
  },
  // ---- dark impact-stories band ----
  darkBand: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    backgroundColor: DARK_BAND,
    color: DARK_TEXT,
  },
  darkGlow: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  spotlight: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: `radial-gradient(620px circle at var(--mx, 65%) var(--my, 30%), color-mix(in srgb, ${ACCENT} 13%, transparent), transparent 70%)`,
  },
  marquee: {
    overflow: 'hidden',
    borderBlock: `1px solid color-mix(in srgb, ${DARK_TEXT} 12%, transparent)`,
    paddingBlock: 'var(--spacing-3)',
  },
  marqueeItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 14,
    marginRight: 40,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: DARK_TEXT_FAINT,
    whiteSpace: 'nowrap',
  },
  marqueeDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    backgroundColor: `color-mix(in srgb, ${ACCENT} 70%, transparent)`,
    flexShrink: 0,
  },
  storyCard: {
    width: 320,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    flexShrink: 0,
    boxSizing: 'border-box',
    borderRadius: 16,
    border: 'none',
    backgroundColor: `color-mix(in srgb, ${DARK_TEXT} 6%, transparent)`,
    boxShadow: SHADOW_GLASS,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  // Scheme-locked brand art: story gradients are identical in both themes.
  storyArt: {
    height: 96,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    colorScheme: 'dark',
    color: '#FFFFFF',
  },
  storyBody: {
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    flex: 1,
  },
  storyQuote: {
    fontSize: 15,
    lineHeight: 1.5,
    fontWeight: 500,
    margin: 0,
    color: DARK_TEXT,
  },
  storyName: {
    fontSize: 13.5,
    fontWeight: 600,
    color: DARK_TEXT,
  },
  storyRole: {
    fontSize: 12.5,
    color: DARK_TEXT_FAINT,
  },
  // ---- where money goes ----
  breakdownRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  breakdownRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  donutCard: {
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--spacing-5)',
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
  },
  legendList: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    width: '100%',
    minHeight: 44,
    paddingInline: 'var(--spacing-3)',
    borderRadius: 10,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  legendRowSelected: {
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
    flexShrink: 0,
  },
  legendPct: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 700,
    fontSize: 15,
    flexShrink: 0,
  },
  // ---- milestones: pinned scroll story ----
  pinStage: {
    position: 'sticky',
    top: NAV_ALLOWANCE,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  pinRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'stretch',
  },
  stepRail: {
    flex: '5 1 0',
    minWidth: 0,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  railTrack: {
    position: 'absolute',
    left: 25,
    top: 24,
    bottom: 24,
    width: 2,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
  },
  railFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: ACCENT,
    transformOrigin: 'top',
  },
  stepButton: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: '10px 14px 10px 12px',
    borderRadius: 12,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  stepButtonActive: {
    backgroundColor: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: `0 0 0 1px ${ACCENT_BORDER}, ${SHADOW_RAISED}`,
  },
  detailCard: {
    flex: '7 1 0',
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  detailNumeral: {
    position: 'absolute',
    top: 4,
    right: 20,
    fontSize: 112,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    fontVariantNumeric: 'tabular-nums',
    color: `color-mix(in srgb, ${ACCENT} 15%, transparent)`,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  pinHint: {
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  // ---- milestones: static fallback timeline ----
  milestoneRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
  },
  milestoneRail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'stretch',
    flexShrink: 0,
    width: 28,
  },
  milestoneDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  milestoneDotDone: {
    backgroundColor:
      'light-dark(rgba(52, 168, 83, 0.14), rgba(52, 168, 83, 0.24))',
    color: SUCCESS,
  },
  milestoneDotUpcoming: {
    border: '2px dashed var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
    backgroundColor: 'var(--color-border)',
    marginBlock: 4,
  },
  milestoneBody: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  // ---- transparency ----
  reportCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    width: '100%',
    boxSizing: 'border-box',
    padding: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    cursor: 'pointer',
    textAlign: 'left',
  },
  reportGlyph: {
    width: 38,
    height: 38,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
  },
  einRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  einMono: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  // ---- corporate match ----
  matchCard: {
    boxSizing: 'border-box',
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  suggestList: {
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  suggestRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    paddingInline: 'var(--spacing-3)',
    border: 'none',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 14,
    color: 'var(--color-text-primary)',
  },
  matchResult: {
    borderRadius: 12,
    border: `1px solid ${ACCENT_BORDER}`,
    backgroundColor: ACCENT_WASH,
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // ---- footer (scheme-locked dark band) ----
  footer: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: DARK_BAND,
    borderTop: `1px solid color-mix(in srgb, ${ACCENT} 30%, transparent)`,
  },
  footerInner: {
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 32,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    color: DARK_TEXT_FAINT,
    textAlign: 'left',
  },
  // ---- toast ----
  toastWrap: {
    position: 'fixed',
    bottom: 'var(--spacing-5)',
    right: 'var(--spacing-5)',
    width: 352,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    zIndex: 60,
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Clearwater Fund campaign.
// No Date.now, no randomness, no network assets.

const BRAND = {
  org: 'Clearwater Fund',
  campaign: 'Restore the Alder',
  shareUrl: 'clearwaterfund.org/restore-the-alder',
  ein: '84-2917465',
};

const CAMPAIGN = {
  raised: 68450,
  goal: 100000,
  donors: 912,
  daysLeft: 23,
};

const HERO = {
  kicker: 'Summer 2026 campaign',
  headlineStart: 'Bring the Alder River',
  headlineInk: 'back to life',
  subcopy:
    'Clearwater Fund is restoring 2.4 miles of the Alder — replanting ' +
    'native banks, rebuilding salmon habitat, and reopening cold-water ' +
    'side channels. Every dollar goes to work inside the watershed.',
};

type SectionId = 'donate' | 'impact' | 'breakdown' | 'milestones' | 'transparency';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'impact', label: 'Impact'},
  {id: 'breakdown', label: 'Where it goes'},
  {id: 'milestones', label: 'Milestones'},
  {id: 'transparency', label: 'Transparency'},
];

type Cadence = 'once' | 'monthly';

const FIXED_AMOUNTS = [25, 50, 100, 250] as const;

/** Curated impact lines per fixed amount, by cadence. */
const IMPACT_LINES: Record<Cadence, Record<number, string>> = {
  once: {
    25: '6 native saplings planted along the bank',
    50: '12 native saplings planted along the bank',
    100: '8 feet of eroded bank stabilized and replanted',
    250: 'one log-jam habitat structure anchored midstream',
  },
  monthly: {
    25: 'a nursery bed of alder seedlings tended all year',
    50: 'water-quality sampling at two stations every month',
    100: 'a full restoration crew day every month',
    250: 'a sponsored riverbank section with quarterly reports',
  },
};

/** ~$4.20 puts one nursery sapling in the ground (2025 field costs). */
function customImpactLine(amount: number, cadence: Cadence): string {
  const saplings = Math.max(1, Math.round(amount / 4.2));
  return cadence === 'monthly'
    ? `about ${saplings} native saplings planted every month`
    : `about ${saplings} native saplings planted along the bank`;
}

interface Story {
  id: string;
  quote: string;
  name: string;
  role: string;
  icon: Glyph;
  /** Scheme-locked art gradient (see Color policy). */
  art: string;
}

const STORIES: readonly Story[] = [
  {
    id: 'kingfishers',
    quote:
      'The kingfishers came back within a month of the first planting. I ' +
      'hadn’t seen one from my porch in nine years.',
    name: 'Ruth Calloway',
    role: 'Streamside landowner, mile 1.2',
    icon: BirdIcon,
    art: 'linear-gradient(135deg, #0E7490 0%, #155E75 55%, #1E3A5F 100%)',
  },
  {
    id: 'classroom',
    quote:
      'My class planted 300 alders last spring. The kids check on ' +
      '“their” trees every single week — rain or shine.',
    name: 'Marcus Yee',
    role: '5th-grade teacher, Fern Hollow Elementary',
    icon: UsersIcon,
    art: 'linear-gradient(135deg, #15803D 0%, #166534 55%, #14532D 100%)',
  },
  {
    id: 'coho',
    quote:
      'We’re counting juvenile coho in reaches that were bare gravel ' +
      'two summers ago. The shade is doing exactly what the models said.',
    name: 'Dr. Amara Osei',
    role: 'Fisheries biologist, watershed council',
    icon: FishIcon,
    art: 'linear-gradient(135deg, #0F766E 0%, #115E59 55%, #134E4A 100%)',
  },
];

/** Campaign facts for the dark-band marquee — all drawn from fixtures. */
const MARQUEE_STATS: readonly string[] = [
  '2.4 river miles in restoration',
  '4,200 saplings planted in 2026',
  '912 donors and counting',
  '74% sapling survival at 90 days',
  '240 volunteers on planting days',
  '40,000 nursery starts a year',
  '95% goes to watershed programs',
  '12 log-jam structures this August',
];

/** Hero satellite mini-cards (fixture-derived; decorative, aria-hidden). */
interface Satellite {
  id: string;
  icon: Glyph;
  title: string;
  caption: string;
  position: CSSProperties;
  bobDuration: string;
  bobDelay: string;
  /** Parallax multiplier in px per unit pointer offset (sign = depth). */
  parallax: number;
}

const SATELLITES: readonly Satellite[] = [
  {
    id: 'gift',
    icon: HeartHandshakeIcon,
    title: 'Ruth C. just gave $50',
    caption: 'Streamside neighbor · mile 1.2',
    position: {top: -26, left: -14},
    bobDuration: '7s',
    bobDelay: '-2s',
    parallax: 9,
  },
  {
    id: 'saplings',
    icon: SproutIcon,
    title: '4,200 saplings planted',
    caption: '74% thriving at 90 days',
    position: {top: '30%', right: -18},
    bobDuration: '8.5s',
    bobDelay: '-5s',
    parallax: -7,
  },
  {
    id: 'match',
    icon: Building2Icon,
    title: 'Bluepine matched 2:1',
    caption: 'Corporate gift program',
    position: {bottom: -24, left: '9%'},
    bobDuration: '6.5s',
    bobDelay: '-3.5s',
    parallax: 6,
  },
];

interface Slice {
  id: string;
  label: string;
  pct: number;
  detail: string;
  /** Explicit light-dark pair so slices adapt to the app scheme. */
  tone: string;
}

/** Budget slices sum to exactly 100 — overhead is shown honestly. */
const SLICES: readonly Slice[] = [
  {
    id: 'fieldwork',
    label: 'Restoration fieldwork & planting',
    pct: 62,
    detail: 'Crews, plants in the ground, bank stabilization, log-jam installs.',
    tone: 'light-dark(#0F766E, #5EEAD4)',
  },
  {
    id: 'nursery',
    label: 'Native plant nursery',
    pct: 18,
    detail: 'Growing 40,000 alder, willow, and sedge starts a year on-site.',
    tone: 'light-dark(#15803D, #86EFAC)',
  },
  {
    id: 'science',
    label: 'Monitoring & science',
    pct: 9,
    detail: 'Water-quality stations, fish counts, and third-party review.',
    tone: 'light-dark(#0369A1, #7DD3FC)',
  },
  {
    id: 'community',
    label: 'Community programs',
    pct: 6,
    detail: 'School plantings, volunteer days, and landowner workshops.',
    tone: 'light-dark(#B45309, #FCD34D)',
  },
  {
    id: 'overhead',
    label: 'Operations & fundraising',
    pct: 5,
    detail: 'The honest slice: bookkeeping, insurance, and this campaign.',
    tone: 'light-dark(#6B7280, #9CA3AF)',
  },
];

interface Milestone {
  id: string;
  date: string;
  title: string;
  detail: string;
  isDone: boolean;
}

const MILESTONES: readonly Milestone[] = [
  {
    id: 'survey',
    date: 'Mar 14, 2026',
    title: 'Survey & permits complete',
    detail: '2.4 river miles mapped; county and tribal permits granted.',
    isDone: true,
  },
  {
    id: 'clearing',
    date: 'Apr 22, 2026',
    title: 'Invasive clearing',
    detail: '1,800 ft of bank cleared of blackberry and knotweed.',
    isDone: true,
  },
  {
    id: 'planting',
    date: 'Jun 9, 2026',
    title: 'First planting season',
    detail: '4,200 saplings in the ground with 240 volunteers.',
    isDone: true,
  },
  {
    id: 'logjams',
    date: 'Aug 2026',
    title: 'Log-jam habitat installs',
    detail: '12 engineered structures to slow water and shelter fry.',
    isDone: false,
  },
  {
    id: 'monitoring',
    date: 'Oct 2026',
    title: 'Salmon return monitoring',
    detail: 'Fall counts begin at three stations with the watershed council.',
    isDone: false,
  },
];

const REPORTS: readonly {id: string; title: string; meta: string}[] = [
  {id: 'annual', title: '2025 Annual Report', meta: 'PDF · 28 pages'},
  {id: 'financials', title: 'Audited financials FY25', meta: 'PDF · 14 pages'},
  {id: 'form990', title: 'IRS Form 990', meta: 'PDF · filed Feb 2026'},
];

interface Employer {
  id: string;
  name: string;
  ratio: string;
  /** Multiplier applied to the employee gift for the example math. */
  multiplier: number;
  cap: string;
}

/** Static suggest list for the corporate-match lookup. */
const EMPLOYERS: readonly Employer[] = [
  {id: 'meridian', name: 'Meridian Software', ratio: '1:1', multiplier: 1, cap: '$2,500 / yr'},
  {id: 'bluepine', name: 'Bluepine Insurance', ratio: '2:1', multiplier: 2, cap: '$1,000 / yr'},
  {id: 'cascade', name: 'Cascade Analytics', ratio: '1:1', multiplier: 1, cap: '$5,000 / yr'},
  {id: 'fernfield', name: 'Fern & Field Outfitters', ratio: '1:1', multiplier: 1, cap: '$500 / yr'},
  {id: 'harborlight', name: 'Harborlight Health', ratio: '1:1', multiplier: 1, cap: '$3,000 / yr'},
  {id: 'copperline', name: 'Copperline Manufacturing', ratio: '0.5:1', multiplier: 0.5, cap: '$2,000 / yr'},
  {id: 'talus', name: 'Talus Ridge Coffee', ratio: '1:1', multiplier: 1, cap: '$750 / yr'},
];

/** Sapling x-positions along the near bank of the hero river SVG. */
const SAPLING_XS = [60, 165, 270, 380, 490, 600, 710, 820, 930, 1040] as const;

// ============= HELPERS =============

function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter an email for your receipt.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

/**
 * Local ResizeObserver width hook — the demo's inline stage is ~1045px
 * wide inside a 1440px window, so viewport media queries never fire
 * there; the page measures itself instead.
 */
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

/** Read prefers-reduced-motion once; motion is disabled for the session. */
function usePrefersReducedMotion(): boolean {
  const [prefers] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  return prefers;
}

/** Fire-once viewport reveal; skip renders revealed immediately. */
function useRevealOnce(skip: boolean): {
  ref: RefObject<HTMLDivElement | null>;
  isRevealed: boolean;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(skip);
  useEffect(() => {
    if (isRevealed) {
      return undefined;
    }
    const element = ref.current;
    if (element == null || typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      {threshold: 0.15},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isRevealed]);
  return {ref, isRevealed};
}

/**
 * Count from 0 to target once activated (rAF, ~900ms decelerate cubic).
 * Reduced motion renders the final value immediately.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  isStatic: boolean,
  durationMs = 900,
): number {
  const [value, setValue] = useState(0);
  const hasRunRef = useRef(false);
  useEffect(() => {
    if (isStatic || !isActive || hasRunRef.current) {
      return undefined;
    }
    hasRunRef.current = true;
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) {
        start = now;
      }
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, isStatic, target, durationMs]);
  return isStatic ? target : value;
}

// ============= SMALL PIECES =============

/**
 * Rise-and-fade scroll reveal (16px + 0.985 scale, 560ms decelerate);
 * renders visible under reduced motion. Stagger via delayMs (60-90ms
 * between siblings).
 */
function Reveal({
  children,
  delayMs = 0,
}: {
  children: ReactNode;
  delayMs?: number;
}) {
  const isStatic = usePrefersReducedMotion();
  const {ref, isRevealed} = useRevealOnce(isStatic);
  return (
    <div
      ref={ref}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'none' : 'translateY(16px) scale(0.985)',
        transition: isStatic
          ? 'none'
          : `opacity 560ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 560ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
      }}>
      {children}
    </div>
  );
}

/** Tracked uppercase eyebrow chip (11px, +0.08em). */
function Eyebrow({label, isDark = false}: {label: string; isDark?: boolean}) {
  return (
    <span
      style={{
        ...styles.eyebrow,
        ...(isDark
          ? {
              backgroundColor: `color-mix(in srgb, ${DARK_TEXT} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${DARK_TEXT} 18%, transparent)`,
              color: '#5EEAD4',
            }
          : null),
      }}>
      {label}
    </span>
  );
}

/** Section intro: eyebrow chip + display heading + ~56ch lede. */
function SectionIntro({
  kicker,
  title,
  description,
  isCompact,
  isDark = false,
  titleSize,
}: {
  kicker: string;
  title: string;
  description: string;
  isCompact: boolean;
  isDark?: boolean;
  titleSize?: number;
}) {
  return (
    <VStack gap={3}>
      <div>
        <Eyebrow label={kicker} isDark={isDark} />
      </div>
      <h2
        style={{
          ...styles.sectionTitle,
          fontSize: titleSize ?? (isCompact ? 30 : 38),
          ...(isDark ? {color: DARK_TEXT} : null),
        }}>
        {title}
      </h2>
      <p
        style={{
          ...styles.sectionLede,
          ...(isDark ? {color: DARK_TEXT_SOFT} : null),
        }}>
        {description}
      </p>
    </VStack>
  );
}

/**
 * Primary CTA with sheen sweep, 1px hover lift, and 0.98 pressed scale
 * (all via the scoped stylesheet; reduced motion neutralizes them).
 */
function CtaButton({
  label,
  icon,
  onClick,
  size = 'md',
  isWide = false,
}: {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  size?: 'md' | 'sm';
  isWide?: boolean;
}) {
  return (
    <button
      type="button"
      className="ndl-cta"
      style={{
        ...styles.cta,
        ...(size === 'sm' ? styles.ctaSm : null),
        ...(isWide ? {width: '100%'} : null),
      }}
      onClick={onClick}>
      <span className="ndl-cta-sheen" style={styles.ctaSheen} aria-hidden="true" />
      {icon}
      {label}
    </button>
  );
}

/**
 * Schematic river illustration. Funded saplings (campaign percentage,
 * one per 10%) pop in with a stagger once the hero reveals; the rest
 * render as outlined placeholders. Reduced motion renders the final frame.
 */
function RiverIllustration({
  fundedCount,
  isRevealed,
  isStatic,
}: {
  fundedCount: number;
  isRevealed: boolean;
  isStatic: boolean;
}) {
  return (
    <div
      style={styles.riverFrame}
      role="img"
      aria-label={`Schematic illustration of the Alder River with ${fundedCount} of ${SAPLING_XS.length} riverbank sections replanted`}>
      <svg
        viewBox="0 0 1100 190"
        width="100%"
        height="auto"
        aria-hidden="true">
        {/* far bank */}
        <path
          d="M0 78 C 180 58, 340 96, 550 76 C 760 56, 900 92, 1100 70 L 1100 0 L 0 0 Z"
          fill="light-dark(rgba(21, 128, 61, 0.12), rgba(134, 239, 172, 0.10))"
        />
        {/* mature alders on the far bank */}
        {[130, 330, 560, 790, 990].map(x => (
          <g key={x}>
            <line
              x1={x}
              y1={62}
              x2={x}
              y2={34}
              stroke="light-dark(#57534E, #A8A29E)"
              strokeWidth={3}
            />
            <circle
              cx={x}
              cy={26}
              r={16}
              fill="light-dark(rgba(21, 128, 61, 0.55), rgba(134, 239, 172, 0.45))"
            />
          </g>
        ))}
        {/* river channel */}
        <path
          d="M0 92 C 200 72, 380 112, 550 92 C 720 72, 900 110, 1100 86 L 1100 138 C 900 158, 720 122, 550 142 C 380 162, 200 124, 0 144 Z"
          fill="light-dark(rgba(15, 118, 110, 0.22), rgba(94, 234, 212, 0.16))"
        />
        {/* ripples */}
        {[108, 122].map(y => (
          <path
            key={y}
            d={`M40 ${y} C 240 ${y - 14}, 420 ${y + 12}, 610 ${y - 6} C 800 ${y - 20}, 940 ${y + 10}, 1070 ${y - 4}`}
            fill="none"
            stroke={ACCENT}
            strokeOpacity={0.5}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="14 22"
          />
        ))}
        {/* near bank */}
        <path
          d="M0 144 C 200 124, 380 162, 550 142 C 720 122, 900 158, 1100 138 L 1100 190 L 0 190 Z"
          fill="light-dark(rgba(120, 113, 108, 0.14), rgba(168, 162, 158, 0.12))"
        />
        {/* saplings: funded pop in, unfunded are outlined placeholders */}
        {SAPLING_XS.map((x, index) => {
          const isFunded = index < fundedCount;
          const shown = isStatic || isRevealed;
          const popStyle: CSSProperties = isFunded
            ? {
                opacity: shown ? 1 : 0,
                transform: shown ? 'none' : 'translateY(8px)',
                transition: isStatic
                  ? 'none'
                  : `opacity 400ms ease ${300 + index * 80}ms, transform 400ms ease ${300 + index * 80}ms`,
              }
            : {};
          const y = 164;
          return (
            <g key={x} style={popStyle}>
              <line
                x1={x}
                y1={y}
                x2={x}
                y2={y - 14}
                stroke={
                  isFunded ? SUCCESS : 'light-dark(#A8A29E, #57534E)'
                }
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <path
                d={`M${x} ${y - 12} C ${x - 4} ${y - 16}, ${x - 8} ${y - 16}, ${x - 9} ${y - 20}`}
                fill="none"
                stroke={
                  isFunded ? SUCCESS : 'light-dark(#A8A29E, #57534E)'
                }
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <path
                d={`M${x} ${y - 12} C ${x + 4} ${y - 16}, ${x + 8} ${y - 16}, ${x + 9} ${y - 20}`}
                fill="none"
                stroke={
                  isFunded ? SUCCESS : 'light-dark(#A8A29E, #57534E)'
                }
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Interactive budget donut; selection thickens a slice and dims the rest. */
function BudgetDonut({
  selectedId,
}: {
  selectedId: string | null;
}) {
  const size = 240;
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const selected = SLICES.find(slice => slice.id === selectedId) ?? null;
  let offset = 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Budget donut chart: fieldwork 62%, nursery 18%, science 9%, community 6%, operations 5%">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {SLICES.map(slice => {
          const length = (slice.pct / 100) * circumference;
          const isSelected = slice.id === selectedId;
          const isDimmed = selectedId !== null && !isSelected;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle
              key={slice.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.tone}
              strokeWidth={isSelected ? 30 : 22}
              strokeDasharray={`${Math.max(0, length - 3)} ${circumference - Math.max(0, length - 3)}`}
              strokeDashoffset={dashOffset}
              opacity={isDimmed ? 0.35 : 1}
              style={{transition: 'stroke-width 200ms ease, opacity 200ms ease'}}
            />
          );
        })}
      </g>
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        fontSize={selected === null ? 34 : 30}
        fontWeight={700}
        fill="var(--color-text-primary)"
        style={{fontVariantNumeric: 'tabular-nums'}}>
        {selected === null ? '100%' : `${selected.pct}%`}
      </text>
      <text
        x="50%"
        y="58%"
        textAnchor="middle"
        fontSize={12}
        fill="var(--color-text-secondary)">
        {selected === null ? 'independently audited' : selected.label.slice(0, 28)}
      </text>
    </svg>
  );
}

// ============= PAGE =============

export default function NonprofitDonationLandingTemplate() {
  const isStatic = usePrefersReducedMotion();

  // ---- responsive: measure the page, not the viewport ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isStacked = wrapWidth > 0 && wrapWidth <= 920;
  const isNavCollapsed = wrapWidth > 0 && wrapWidth <= 780;
  const isCompact = wrapWidth > 0 && wrapWidth <= 640;
  /** Display-type tiers per measured width (never <56px at full width). */
  const heroFontSize =
    wrapWidth > 1000 ? 78 : wrapWidth > 760 ? 62 : wrapWidth > 460 ? 46 : 38;

  // ---- nav ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>(
    {},
  );

  // ---- hero reveal + count-ups + pointer parallax ----
  const {ref: heroRevealRef, isRevealed: isHeroRevealed} =
    useRevealOnce(isStatic);
  const [tilt, setTilt] = useState({x: 0, y: 0});
  /** Extra raised/donors from inline donations on this visit. */
  const [extraRaised, setExtraRaised] = useState(0);
  const [extraDonors, setExtraDonors] = useState(0);
  const raisedBase = useCountUp(CAMPAIGN.raised, isHeroRevealed, isStatic);
  const donorsBase = useCountUp(CAMPAIGN.donors, isHeroRevealed, isStatic, 800);
  const raisedShown = raisedBase + extraRaised;
  const donorsShown = donorsBase + extraDonors;
  const raisedActual = CAMPAIGN.raised + extraRaised;
  const percent = Math.min(100, (raisedActual / CAMPAIGN.goal) * 100);
  const fundedSaplings = Math.min(
    SAPLING_XS.length,
    Math.round(percent / 10),
  );

  // ---- pinned milestones scene ----
  const pinRef = useRef<HTMLDivElement | null>(null);
  const [pinProgress, setPinProgress] = useState(0);
  const activeMilestone = Math.min(
    MILESTONES.length - 1,
    Math.floor(pinProgress * MILESTONES.length),
  );
  const activeMilestoneData = MILESTONES[activeMilestone];

  // ---- donation widget ----
  const [cadence, setCadence] = useState<Cadence>('once');
  const [amountId, setAmountId] = useState<string>('50');
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [donation, setDonation] = useState<{
    amount: number;
    cadence: Cadence;
  } | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState('');
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [receiptSentTo, setReceiptSentTo] = useState<string | null>(null);

  const selectedAmount =
    amountId === 'custom' ? customAmount : Number(amountId);
  const impactLine =
    selectedAmount == null || selectedAmount < 1
      ? null
      : amountId === 'custom'
        ? customImpactLine(selectedAmount, cadence)
        : (IMPACT_LINES[cadence][selectedAmount] ??
          customImpactLine(selectedAmount, cadence));

  // ---- donut ----
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);

  // ---- transparency ----
  const [isEinCopied, setIsEinCopied] = useState(false);

  // ---- corporate match ----
  const [employerQuery, setEmployerQuery] = useState('');
  const [pickedEmployer, setPickedEmployer] = useState<Employer | null>(null);
  const employerMatches =
    employerQuery.trim().length >= 2
      ? EMPLOYERS.filter(employer =>
          employer.name
            .toLowerCase()
            .includes(employerQuery.trim().toLowerCase()),
        ).slice(0, 5)
      : [];

  // ---- toast ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  // Copied-state timers revert after 2s; cleaned up on unmount.
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const einTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }
      if (einTimerRef.current != null) {
        clearTimeout(einTimerRef.current);
      }
    },
    [],
  );

  // One rAF-throttled scroll listener drives the nav condensation and
  // the pinned milestones scene's progress (rect math against the
  // measured scroll container — the demo stage is not the viewport).
  useEffect(() => {
    const page = pageRef.current;
    if (page == null) {
      return undefined;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      setIsScrolled(page.scrollTop > 24);
      const pin = pinRef.current;
      if (pin != null && !isStatic && !isStacked) {
        const pageRect = page.getBoundingClientRect();
        const pinRect = pin.getBoundingClientRect();
        const span = pinRect.height - pageRect.height;
        if (span > 0) {
          setPinProgress(
            Math.min(1, Math.max(0, (pageRect.top - pinRect.top) / span)),
          );
        }
      }
    };
    const onScroll = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(update);
      }
    };
    page.addEventListener('scroll', onScroll, {passive: true});
    update();
    return () => {
      page.removeEventListener('scroll', onScroll);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, [isStatic, isStacked]);

  // Compact menu dismisses on Escape (refocusing its trigger) and on any
  // pointerdown outside the sticky navbar.
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
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: isStatic ? 'auto' : 'smooth',
    });
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  /** Button path into the scroll scene: jump to a phase's progress point. */
  const jumpToMilestone = (index: number) => {
    const page = pageRef.current;
    const pin = pinRef.current;
    if (page == null || pin == null) {
      return;
    }
    const pageRect = page.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();
    const span = pinRect.height - pageRect.height;
    if (span <= 0) {
      return;
    }
    const top =
      page.scrollTop +
      (pinRect.top - pageRect.top) +
      span * ((index + 0.5) / MILESTONES.length);
    page.scrollTo({top, behavior: isStatic ? 'auto' : 'smooth'});
  };

  /** Hero parallax: satellites drift ±6-10px toward the pointer. */
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isStatic || isStacked) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    setTilt({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };
  const resetTilt = () => setTilt({x: 0, y: 0});

  // Dark-band spotlight: CSS vars only — no re-render per pointer move.
  const darkRef = useRef<HTMLElement | null>(null);
  const onDarkPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (isStatic) {
      return;
    }
    const band = darkRef.current;
    if (band == null) {
      return;
    }
    const rect = band.getBoundingClientRect();
    band.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    band.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  const submitDonation = () => {
    if (selectedAmount == null || selectedAmount < 1) {
      setAmountError('Enter an amount of $1 or more.');
      return;
    }
    setAmountError(null);
    setDonation({amount: selectedAmount, cadence});
    setExtraRaised(previous => previous + selectedAmount);
    setExtraDonors(previous => previous + 1);
    setIsLinkCopied(false);
    setReceiptEmail('');
    setReceiptError(null);
    setReceiptSentTo(null);
  };

  const resetDonation = () => {
    setDonation(null);
    setAmountError(null);
  };

  const copyShareLink = () => {
    // Copy is best-effort; the confirmation flip is the source of truth.
    void navigator.clipboard
      ?.writeText(`https://${BRAND.shareUrl}`)
      .catch(() => undefined);
    setIsLinkCopied(true);
    if (copyTimerRef.current != null) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => setIsLinkCopied(false), 2000);
  };

  const copyEin = () => {
    void navigator.clipboard
      ?.writeText(BRAND.ein)
      .catch(() => undefined);
    setIsEinCopied(true);
    if (einTimerRef.current != null) {
      clearTimeout(einTimerRef.current);
    }
    einTimerRef.current = setTimeout(() => setIsEinCopied(false), 2000);
  };

  const submitReceiptEmail = () => {
    const error = validateEmail(receiptEmail);
    if (error !== null) {
      setReceiptError(error);
      return;
    }
    setReceiptSentTo(receiptEmail.trim());
    setReceiptError(null);
  };

  // ============= CHROME =============

  const brandMark = (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={WavesIcon} size="sm" color="inherit" />
      </div>
      <VStack gap={0}>
        <Text type="label">{BRAND.org}</Text>
        {!isCompact && (
          <Text type="supporting" color="secondary">
            {BRAND.campaign}
          </Text>
        )}
      </VStack>
    </HStack>
  );

  const navMenu = (
    <div style={styles.navMenu} role="menu" aria-label="Site menu">
      <VStack gap={1}>
        {NAV_ANCHORS.map(anchor => (
          <button
            key={anchor.id}
            type="button"
            role="menuitem"
            style={styles.navMenuLink}
            onClick={() => jumpToSection(anchor.id)}>
            {anchor.label}
          </button>
        ))}
        <Divider />
        <CtaButton
          label="Donate"
          isWide
          icon={<Icon icon={HeartHandshakeIcon} size="sm" color="inherit" />}
          onClick={() => jumpToSection('donate')}
        />
      </VStack>
    </div>
  );

  const navbar = (
    <nav
      ref={navRef}
      style={{
        ...styles.navBar,
        ...(isScrolled ? styles.navBarScrolled : null),
      }}
      aria-label="Primary">
      <div
        style={{
          ...styles.navInner,
          // Slight condensation after 24px scroll (instant, not animated —
          // height is a layout property).
          minHeight: isScrolled ? 50 : NAV_HEIGHT,
        }}>
        {brandMark}
        <StackItem size="fill">
          {!isNavCollapsed && (
            <HStack gap={1} vAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  className="ndl-navlink"
                  style={styles.navLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
            </HStack>
          )}
        </StackItem>
        <CtaButton
          label="Donate"
          size="sm"
          icon={<Icon icon={HeartHandshakeIcon} size="sm" color="inherit" />}
          onClick={() => jumpToSection('donate')}
        />
        {isNavCollapsed && (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            style={styles.menuButton}
            onClick={() => setIsMenuOpen(previous => !previous)}>
            <Icon
              icon={isMenuOpen ? XIcon : MenuIcon}
              size="sm"
              color="inherit"
            />
          </button>
        )}
        {isMenuOpen && isNavCollapsed && navMenu}
      </div>
    </nav>
  );

  // ============= SECTIONS =============

  // ---- hero (aurora band): display copy + floating progress card over
  // the staged river theater ----
  const progressCard = (
    <div style={styles.progressCard}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Eyebrow label="Campaign progress" />
        <Badge variant="info" label={`${CAMPAIGN.daysLeft} days left`} />
      </HStack>
      <div>
        <span style={styles.raisedStat}>{formatUSD(raisedShown)}</span>
        <Text type="supporting" color="secondary">
          raised of {formatUSD(CAMPAIGN.goal)} goal
        </Text>
      </div>
      <div
        style={styles.progressTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={CAMPAIGN.goal}
        aria-valuenow={raisedActual}
        aria-label="Campaign progress toward goal">
        <div
          style={{
            ...styles.progressFill,
            // Fills on first reveal; later donations transition wider.
            width: isHeroRevealed || isStatic ? `${percent}%` : '0%',
            transition: isStatic
              ? 'none'
              : 'width 1000ms cubic-bezier(0.16, 1, 0.3, 1) 200ms',
          }}
        />
      </div>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <HStack gap={1} vAlign="center">
          <Icon icon={UsersIcon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary">
            {donorsShown.toLocaleString('en-US')} donors
          </Text>
        </HStack>
        <Text type="supporting" color="secondary">
          · {fundedSaplings} of {SAPLING_XS.length} bank sections funded
        </Text>
      </HStack>
      <CtaButton
        label="Give now"
        isWide
        icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
        onClick={() => jumpToSection('donate')}
      />
    </div>
  );

  const hero = (
    <div ref={heroRevealRef}>
      <VStack gap={6}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Eyebrow label={HERO.kicker} />
              <Badge variant="success" label="501(c)(3) nonprofit" />
            </HStack>
            <h1 style={{...styles.heroHeadline, fontSize: heroFontSize}}>
              {HERO.headlineStart}{' '}
              <span style={styles.heroInk}>{HERO.headlineInk}</span>
            </h1>
            <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <CtaButton
                label="Donate to the Alder"
                icon={
                  <Icon icon={HeartHandshakeIcon} size="sm" color="inherit" />
                }
                onClick={() => jumpToSection('donate')}
              />
              <Button
                label="See where money goes"
                variant="secondary"
                onClick={() => jumpToSection('breakdown')}
              />
            </HStack>
          </div>
          {progressCard}
        </div>
        {/* River theater: perspective pane + bobbing satellites; the whole
            stage crosses the band boundary into the donate section. */}
        <div
          style={{
            ...styles.heroStage,
            marginBottom: isStacked ? 0 : -76,
          }}
          onPointerMove={onHeroPointerMove}
          onPointerLeave={resetTilt}>
          <div style={styles.heroPerspective}>
            <div
              style={{
                ...styles.riverPane,
                transform:
                  isStatic || isStacked
                    ? 'none'
                    : `rotateX(${4 - tilt.y * 2.5}deg) rotateY(${tilt.x * 3}deg)`,
                transition: isStatic
                  ? 'none'
                  : 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}>
              <RiverIllustration
                fundedCount={fundedSaplings}
                isRevealed={isHeroRevealed}
                isStatic={isStatic}
              />
            </div>
          </div>
          {!isStacked &&
            SATELLITES.map(satellite => (
              <div
                key={satellite.id}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  zIndex: 3,
                  ...satellite.position,
                  transform: `translate(${tilt.x * satellite.parallax}px, ${tilt.y * Math.abs(satellite.parallax) * 0.7}px)`,
                  transition: isStatic
                    ? 'none'
                    : 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}>
                <div
                  className="ndl-bob"
                  style={{
                    ...styles.satellite,
                    animationDuration: satellite.bobDuration,
                    animationDelay: satellite.bobDelay,
                    opacity: isHeroRevealed || isStatic ? 1 : 0,
                  }}>
                  <div style={styles.satelliteIcon}>
                    <Icon icon={satellite.icon} size="sm" color="inherit" />
                  </div>
                  <div>
                    <div style={styles.satelliteTitle}>{satellite.title}</div>
                    <div style={styles.satelliteCaption}>
                      {satellite.caption}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </VStack>
    </div>
  );

  // ---- donation widget (centerpiece) ----
  const donateLabel =
    selectedAmount != null && selectedAmount >= 1
      ? cadence === 'monthly'
        ? `Donate ${formatUSD(selectedAmount)}/month`
        : `Donate ${formatUSD(selectedAmount)}`
      : 'Donate';

  const thankYou = donation !== null && (
    <VStack gap={4}>
      <HStack gap={3} vAlign="center">
        <div style={styles.successDisc} aria-hidden="true">
          <Icon icon={CheckIcon} size="md" color="inherit" />
        </div>
        <VStack gap={0}>
          <Heading level={3}>Thank you!</Heading>
          <Text type="supporting" color="secondary">
            Your{' '}
            {donation.cadence === 'monthly'
              ? `${formatUSD(donation.amount)}/month`
              : formatUSD(donation.amount)}{' '}
            gift is on its way to the Alder — that&rsquo;s{' '}
            {donation.amount === selectedAmount && impactLine != null
              ? impactLine
              : customImpactLine(donation.amount, donation.cadence)}
            .
          </Text>
        </VStack>
      </HStack>
      <Divider />
      <VStack gap={2}>
        <Text type="label">Multiply your gift — share the campaign</Text>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-2)',
            alignItems: 'center',
            flexDirection: isCompact ? 'column' : 'row',
            ...(isCompact ? {alignItems: 'stretch'} : null),
          }}>
          <div style={{...styles.shareLinkBox, flex: '1 1 0'}}>
            <Icon icon={LinkIcon} size="xsm" color="secondary" />
            {BRAND.shareUrl}
          </div>
          <Button
            label={isLinkCopied ? 'Copied' : 'Copy link'}
            variant="secondary"
            icon={
              <Icon
                icon={isLinkCopied ? CheckIcon : CopyIcon}
                size="sm"
                color="inherit"
              />
            }
            onClick={copyShareLink}
          />
        </div>
      </VStack>
      {receiptSentTo === null ? (
        <VStack gap={1}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-2)',
              alignItems: 'flex-start',
              flexDirection: isCompact ? 'column' : 'row',
              ...(isCompact ? {alignItems: 'stretch'} : null),
            }}>
            <div style={{flex: '1 1 0', minWidth: 0}}>
              <TextInput
                label="Email for your tax receipt"
                isLabelHidden
                placeholder="you@example.org"
                value={receiptEmail}
                onChange={value => {
                  setReceiptEmail(value);
                  setReceiptError(null);
                }}
              />
            </div>
            <Button
              label="Email my receipt"
              variant="secondary"
              onClick={submitReceiptEmail}
            />
          </div>
          {receiptError !== null && (
            <p style={styles.fieldError} role="alert">
              {receiptError}
            </p>
          )}
        </VStack>
      ) : (
        <HStack gap={2} vAlign="center">
          <Icon icon={MailCheckIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            Your tax receipt will land at {receiptSentTo}.
          </Text>
        </HStack>
      )}
      <Button
        label="Make another donation"
        variant="ghost"
        size="sm"
        onClick={resetDonation}
      />
    </VStack>
  );

  const donationWidget = (
    <div style={styles.donateCard}>
      {donation !== null ? (
        thankYou
      ) : (
        <>
          <VStack gap={1}>
            <Heading level={3}>Fund the restoration</Heading>
            <Text type="supporting" color="secondary">
              Choose a gift — the impact line updates as you go.
            </Text>
          </VStack>
          <SegmentedControl
            value={cadence}
            onChange={value => setCadence(value as Cadence)}
            label="Donation cadence"
            layout="fill">
            <SegmentedControlItem value="once" label="One-time" />
            <SegmentedControlItem value="monthly" label="Monthly" />
          </SegmentedControl>
          <div
            style={{
              ...styles.amountGrid,
              ...(isCompact ? styles.amountGridCompact : null),
            }}
            role="group"
            aria-label="Donation amount">
            {FIXED_AMOUNTS.map(amount => {
              const id = String(amount);
              const isSelected = amountId === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={isSelected}
                  style={{
                    ...styles.amountChip,
                    ...(isSelected ? styles.amountChipSelected : null),
                  }}
                  onClick={() => {
                    setAmountId(id);
                    setAmountError(null);
                  }}>
                  ${amount}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-pressed={amountId === 'custom'}
            style={{
              ...styles.amountChip,
              width: '100%',
              ...(amountId === 'custom' ? styles.amountChipSelected : null),
            }}
            onClick={() => {
              setAmountId('custom');
              setAmountError(null);
            }}>
            Custom amount
          </button>
          {amountId === 'custom' && (
            <NumberInput
              label="Custom amount (USD)"
              value={customAmount}
              onChange={value => {
                setCustomAmount(value);
                setAmountError(null);
              }}
              min={1}
              max={25000}
              step={5}
              units="USD"
              isIntegerOnly
              placeholder="75"
            />
          )}
          {impactLine !== null &&
            selectedAmount != null && (
              <div style={styles.impactLine}>
                <Icon icon={SproutIcon} size="sm" color="inherit" />
                <span>
                  {formatUSD(selectedAmount)}
                  {cadence === 'monthly' ? '/mo' : ''} = {impactLine}
                </span>
              </div>
            )}
          {amountError !== null && (
            <p style={styles.fieldError} role="alert">
              {amountError}
            </p>
          )}
          <CtaButton
            label={donateLabel}
            isWide
            icon={
              <Icon icon={HeartHandshakeIcon} size="sm" color="inherit" />
            }
            onClick={submitDonation}
          />
          <HStack gap={1} vAlign="center">
            <Icon icon={LockIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">
              Secure · tax-deductible · cancel monthly anytime
            </Text>
          </HStack>
        </>
      )}
    </div>
  );

  const donateSection = (
    <div
      style={{
        ...styles.donateRow,
        ...(isStacked ? styles.donateRowStacked : null),
      }}>
      {donationWidget}
      <div style={styles.donateAside}>
        <SectionIntro
          kicker="Your gift at work"
          title="Small gifts, measured in saplings"
          description="We publish field costs every season, so each amount maps to real work on the bank — not a vague thermometer."
          isCompact={isCompact}
          titleSize={isCompact ? 26 : 30}
        />
        <VStack gap={2}>
          {[
            '4,200 saplings planted so far in 2026 — 74% survival at 90 days',
            'Monthly gifts fund the nursery through the wet season',
            '95% of this campaign goes directly to watershed programs',
          ].map(line => (
            <HStack key={line} gap={2} vAlign="start">
              <div
                style={{
                  ...styles.successDisc,
                  width: 24,
                  height: 24,
                }}
                aria-hidden="true">
                <Icon icon={CheckIcon} size="xsm" color="inherit" />
              </div>
              <StackItem size="fill">
                <Text type="body">{line}</Text>
              </StackItem>
            </HStack>
          ))}
        </VStack>
      </div>
    </div>
  );

  // ---- impact stories (signature scheme-locked dark band) ----
  const storiesSection = (
    <VStack gap={5}>
      <SectionIntro
        kicker="Impact stories"
        title="Voices from the riverbank"
        description="Landowners, classrooms, and biologists on what one season of restoration changed."
        isCompact={isCompact}
        isDark
      />
      {/* Campaign-fact marquee: 52s loop, pauses on hover; reduced motion
          hides the duplicate copy and wraps the strip statically. */}
      <div
        className="ndl-marquee"
        style={styles.marquee}
        aria-label="Campaign facts">
        <div className="ndl-marquee-track">
          {MARQUEE_STATS.map(stat => (
            <span key={stat} style={styles.marqueeItem}>
              <span style={styles.marqueeDot} aria-hidden="true" />
              {stat}
            </span>
          ))}
          {MARQUEE_STATS.map(stat => (
            <span
              key={`dupe-${stat}`}
              className="ndl-marquee-dupe"
              style={styles.marqueeItem}
              aria-hidden="true">
              <span style={styles.marqueeDot} aria-hidden="true" />
              {stat}
            </span>
          ))}
        </div>
      </div>
      <Carousel gap={3} hasSnap aria-label="Impact stories">
        {STORIES.map(story => (
          <div key={story.id} style={styles.storyCard}>
            <div
              style={{...styles.storyArt, background: story.art}}
              aria-hidden="true">
              <Icon icon={story.icon} size="lg" color="inherit" />
            </div>
            <div style={styles.storyBody}>
              <p style={styles.storyQuote}>&ldquo;{story.quote}&rdquo;</p>
              <StackItem size="fill">
                <span />
              </StackItem>
              <VStack gap={0}>
                <span style={styles.storyName}>{story.name}</span>
                <span style={styles.storyRole}>{story.role}</span>
              </VStack>
            </div>
          </div>
        ))}
      </Carousel>
    </VStack>
  );

  // ---- where money goes (dot-grid band, interactive donut) ----
  const breakdownSection = (
    <VStack gap={5}>
      <SectionIntro
        kicker="Where money goes"
        title="Every dollar, accounted for"
        description="FY25 audited allocation. Select a line to inspect its slice — including the honest overhead one."
        isCompact={isCompact}
      />
      <div
        style={{
          ...styles.breakdownRow,
          ...(isStacked ? styles.breakdownRowStacked : null),
        }}>
        <div style={styles.donutCard}>
          <BudgetDonut selectedId={selectedSlice} />
        </div>
        <div style={styles.legendList} role="list" aria-label="Budget lines">
          {SLICES.map(slice => {
            const isSelected = selectedSlice === slice.id;
            return (
              <button
                key={slice.id}
                type="button"
                role="listitem"
                aria-pressed={isSelected}
                style={{
                  ...styles.legendRow,
                  ...(isSelected ? styles.legendRowSelected : null),
                }}
                onClick={() =>
                  setSelectedSlice(previous =>
                    previous === slice.id ? null : slice.id,
                  )
                }>
                <span
                  style={{...styles.legendSwatch, backgroundColor: slice.tone}}
                  aria-hidden="true"
                />
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text size="sm" weight="semibold">
                      {slice.label}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {slice.detail}
                    </Text>
                  </VStack>
                </StackItem>
                <span style={styles.legendPct}>{slice.pct}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </VStack>
  );

  // ---- layout rhythm: 112px band padding at wide, 64px compact ----
  const columnStyle: CSSProperties = {
    ...styles.column,
    padding: isCompact
      ? '64px var(--spacing-4)'
      : isStacked
        ? '80px var(--spacing-5)'
        : '112px var(--spacing-6)',
    gap: isCompact ? 'var(--spacing-5)' : 'var(--spacing-6)',
  };
  // Hero band tucks under the transparent navbar, so its column adds the
  // nav height back on top.
  const heroColumnStyle: CSSProperties = {
    ...columnStyle,
    paddingTop: NAV_HEIGHT + (isCompact ? 36 : 56),
  };
  // Donate band leaves clearance for the river stage bleeding into it.
  const donateColumnStyle: CSSProperties = {
    ...columnStyle,
    ...(isStacked ? null : {paddingTop: 132}),
  };

  // ---- milestones: pinned scroll story + static fallback ----
  const milestonesIntro = (
    <SectionIntro
      kicker="Milestones"
      title="The season so far — and what's next"
      description="Three phases complete, two funded by this campaign. Scroll to walk the timeline, or select a phase."
      isCompact={isCompact}
    />
  );

  const staticMilestones = (
    <div>
      {MILESTONES.map((milestone, index) => (
        <Reveal key={milestone.id} delayMs={index * 80}>
          <div style={styles.milestoneRow}>
            <div style={styles.milestoneRail}>
              <div
                style={{
                  ...styles.milestoneDot,
                  ...(milestone.isDone
                    ? styles.milestoneDotDone
                    : styles.milestoneDotUpcoming),
                }}
                aria-hidden="true">
                <Icon
                  icon={milestone.isDone ? CheckIcon : CalendarIcon}
                  size="xsm"
                  color="inherit"
                />
              </div>
              {index < MILESTONES.length - 1 && (
                <div style={styles.milestoneLine} aria-hidden="true" />
              )}
            </div>
            <div style={styles.milestoneBody}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Text type="label">{milestone.title}</Text>
                <Badge
                  variant={milestone.isDone ? 'success' : 'neutral'}
                  label={
                    milestone.isDone
                      ? milestone.date
                      : `Planned · ${milestone.date}`
                  }
                />
              </HStack>
              <Text type="supporting" color="secondary">
                {milestone.detail}
              </Text>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );

  // The scroll scene: a sticky stage inside a 260vh container. Scroll
  // progress fills the phase rail (transform-only) and advances the
  // detail card; phase buttons scroll to their progress point.
  const pinnedMilestones = (
    <div ref={pinRef} style={{height: '260vh'}}>
      <div
        style={{
          ...columnStyle,
          ...styles.pinStage,
          paddingBlock: 'var(--spacing-8)',
        }}>
        {milestonesIntro}
        <div style={styles.pinRow}>
          <div style={styles.stepRail}>
            <div style={styles.railTrack} aria-hidden="true">
              <div
                style={{
                  ...styles.railFill,
                  transform: `scaleY(${pinProgress})`,
                }}
              />
            </div>
            {MILESTONES.map((milestone, index) => {
              const isActive = index === activeMilestone;
              return (
                <button
                  key={milestone.id}
                  type="button"
                  aria-current={isActive ? 'step' : undefined}
                  style={{
                    ...styles.stepButton,
                    ...(isActive ? styles.stepButtonActive : null),
                  }}
                  onClick={() => jumpToMilestone(index)}>
                  <div
                    style={{
                      ...styles.milestoneDot,
                      ...(milestone.isDone
                        ? styles.milestoneDotDone
                        : styles.milestoneDotUpcoming),
                      ...(isActive
                        ? {boxShadow: `0 0 0 2px ${ACCENT_BORDER}`}
                        : null),
                    }}
                    aria-hidden="true">
                    <Icon
                      icon={milestone.isDone ? CheckIcon : CalendarIcon}
                      size="xsm"
                      color="inherit"
                    />
                  </div>
                  <VStack gap={0}>
                    <Text type="label">{milestone.title}</Text>
                    <Text type="supporting" color="secondary">
                      {milestone.date}
                    </Text>
                  </VStack>
                </button>
              );
            })}
          </div>
          {activeMilestoneData != null && (
            <div
              key={activeMilestone}
              className="ndl-swap"
              style={styles.detailCard}>
              <span style={styles.detailNumeral} aria-hidden="true">
                {String(activeMilestone + 1).padStart(2, '0')}
              </span>
              <Badge
                variant={activeMilestoneData.isDone ? 'success' : 'neutral'}
                label={
                  activeMilestoneData.isDone
                    ? `Complete · ${activeMilestoneData.date}`
                    : `Planned · ${activeMilestoneData.date}`
                }
              />
              <h3 style={{...styles.sectionTitle, fontSize: 32}}>
                {activeMilestoneData.title}
              </h3>
              <p style={styles.sectionLede}>{activeMilestoneData.detail}</p>
              <span style={{...styles.pinHint, marginTop: 'auto'}}>
                Phase {activeMilestone + 1} of {MILESTONES.length} · scroll to
                advance
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ---- transparency + corporate match (aurora band) ----
  const transparencySection = (
    <VStack gap={5}>
      <SectionIntro
        kicker="Transparency"
        title="Read the paperwork"
        description="Reports, audited financials, and our federal filing — all public, all current."
        isCompact={isCompact}
      />
      <Grid columns={{minWidth: 240, max: 3}} gap={3}>
        {REPORTS.map((report, index) => (
          <Reveal key={report.id} delayMs={index * 80}>
            <button
              type="button"
              className="ndl-raise"
              style={styles.reportCard}
              onClick={() => fireToast(`Transparency — ${report.title} opened.`)}>
              <div style={styles.reportGlyph} aria-hidden="true">
                <Icon icon={FileTextIcon} size="sm" color="inherit" />
              </div>
              <VStack gap={0}>
                <Text size="sm" weight="semibold">
                  {report.title}
                </Text>
                <Text type="supporting" color="secondary">
                  {report.meta}
                </Text>
              </VStack>
            </button>
          </Reveal>
        ))}
      </Grid>
      <div style={styles.einRow}>
        <Icon icon={FileTextIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <span style={styles.einMono}>
            EIN {BRAND.ein} · registered 501(c)(3)
          </span>
        </StackItem>
        <Button
          label={isEinCopied ? 'Copied' : 'Copy EIN'}
          variant="ghost"
          size="sm"
          icon={
            <Icon
              icon={isEinCopied ? CheckIcon : CopyIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={copyEin}
        />
      </div>
      <div style={styles.matchCard}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={Building2Icon} size="md" color="secondary" />
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="label">Double it with a corporate match</Text>
              <Text type="supporting" color="secondary">
                1 in 3 of our donors works somewhere with a gift-match
                program. Look up your employer:
              </Text>
            </VStack>
          </StackItem>
        </HStack>
        <TextInput
          label="Your employer"
          isLabelHidden
          placeholder="Start typing — e.g. Bluepine"
          startIcon={<Icon icon={SearchIcon} size="sm" color="secondary" />}
          value={employerQuery}
          onChange={value => {
            setEmployerQuery(value);
            setPickedEmployer(null);
          }}
        />
        {pickedEmployer === null && employerQuery.trim().length >= 2 && (
          employerMatches.length > 0 ? (
            <div style={styles.suggestList} role="list" aria-label="Employer suggestions">
              {employerMatches.map(employer => (
                <button
                  key={employer.id}
                  type="button"
                  role="listitem"
                  style={styles.suggestRow}
                  onClick={() => {
                    setPickedEmployer(employer);
                    setEmployerQuery(employer.name);
                  }}>
                  <Icon icon={Building2Icon} size="sm" color="secondary" />
                  <StackItem size="fill">{employer.name}</StackItem>
                  <Badge variant="info" label={`${employer.ratio} match`} />
                </button>
              ))}
            </div>
          ) : (
            <Text type="supporting" color="secondary">
              No match found — ask HR whether your company runs a gift-match
              program. Most take five minutes to file.
            </Text>
          )
        )}
        {pickedEmployer !== null && (
          <div style={styles.matchResult}>
            <Text type="label">
              {pickedEmployer.name} matches {pickedEmployer.ratio} up to{' '}
              {pickedEmployer.cap}
            </Text>
            <Text type="supporting" color="secondary">
              A $50 gift becomes{' '}
              {formatUSD(Math.round(50 * (1 + pickedEmployer.multiplier)))} for
              the Alder once the match clears.
            </Text>
            <HStack gap={2}>
              <Button
                label="Get the match form"
                variant="secondary"
                size="sm"
                onClick={() =>
                  fireToast(
                    `Corporate match — ${pickedEmployer.name} form requested.`,
                  )
                }
              />
            </HStack>
          </div>
        )}
      </div>
    </VStack>
  );

  // ---- footer (scheme-locked dark band) ----
  const footer = (
    <footer style={styles.footer}>
      <div style={styles.footerInner}>
        <HStack gap={4} vAlign="start" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <div
                  style={{
                    ...styles.brandTile,
                    backgroundColor: 'rgba(94, 234, 212, 0.14)',
                    border: '1px solid rgba(94, 234, 212, 0.35)',
                    color: '#5EEAD4',
                  }}
                  aria-hidden="true">
                  <Icon icon={WavesIcon} size="sm" color="inherit" />
                </div>
                <Text type="label" color="inherit">
                  {BRAND.org}
                </Text>
              </HStack>
              <Text
                type="supporting"
                color="inherit"
                style={{color: DARK_TEXT_SOFT, maxWidth: 380}}>
                Restoring the rivers of the Cedar Coast watershed since 2019.
                Field office: 41 Millrace Rd, Fern Hollow.
              </Text>
            </VStack>
          </StackItem>
          <VStack gap={1}>
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              Campaign
            </Text>
            {NAV_ANCHORS.map(anchor => (
              <button
                key={anchor.id}
                type="button"
                style={styles.footerLink}
                onClick={() => jumpToSection(anchor.id)}>
                {anchor.label}
              </button>
            ))}
          </VStack>
          <VStack gap={1}>
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              Organization
            </Text>
            {['About us', 'Volunteer days', 'Newsletter', 'Contact'].map(
              label => (
                <button
                  key={label}
                  type="button"
                  style={styles.footerLink}
                  onClick={() => fireToast(`Footer — ${label} clicked.`)}>
                  {label}
                </button>
              ),
            )}
          </VStack>
        </HStack>
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              © 2026 Clearwater Fund · EIN {BRAND.ein} · Donations are
              tax-deductible to the extent allowed by law.
            </Text>
          </StackItem>
          <Text
            type="supporting"
            color="inherit"
            style={{color: DARK_TEXT_FAINT}}>
            Charity rating ★★★★ · 95% program spend
          </Text>
        </HStack>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <div ref={wrapRef} className={SCOPE} style={{height: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent
            padding={0}
            role="main"
            label="Clearwater Fund campaign page">
            <div ref={pageRef} style={styles.page}>
              {navbar}
              {/* aurora hero band (tucks under the transparent navbar;
                  its river stage bleeds into the donate band below) */}
              <div
                style={{
                  ...styles.band,
                  ...styles.bandTinted,
                  zIndex: 2,
                  marginTop: -NAV_HEIGHT,
                }}>
                <div style={styles.bandFx} aria-hidden="true">
                  <div
                    className={isStatic ? undefined : 'ndl-aurora-a'}
                    style={{
                      ...styles.auroraBlob,
                      width: 520,
                      height: 520,
                      top: -180,
                      left: -120,
                      backgroundColor: AURORA_TEAL,
                      opacity: 0.5,
                    }}
                  />
                  <div
                    className={isStatic ? undefined : 'ndl-aurora-b'}
                    style={{
                      ...styles.auroraBlob,
                      width: 460,
                      height: 460,
                      top: -60,
                      right: -160,
                      backgroundColor: AURORA_GREEN,
                      opacity: 0.4,
                    }}
                  />
                  <div
                    className={isStatic ? undefined : 'ndl-aurora-c'}
                    style={{
                      ...styles.auroraBlob,
                      width: 420,
                      height: 420,
                      bottom: -200,
                      left: '32%',
                      backgroundColor: AURORA_BLEND,
                      opacity: 0.45,
                    }}
                  />
                  <div style={styles.grain} />
                </div>
                <div style={heroColumnStyle}>{hero}</div>
              </div>
              {/* plain donate band (centerpiece) */}
              <section
                ref={registerSection('donate')}
                aria-label="Donate"
                style={styles.band}>
                <div style={donateColumnStyle}>
                  <Reveal>{donateSection}</Reveal>
                </div>
              </section>
              {/* signature dark stories band with pointer spotlight */}
              <section
                ref={node => {
                  sectionRefs.current.impact = node;
                  darkRef.current = node;
                }}
                aria-label="Impact stories"
                style={{...styles.band, ...styles.darkBand}}
                onPointerMove={onDarkPointerMove}>
                <div style={styles.bandFx} aria-hidden="true">
                  <div
                    className={isStatic ? undefined : 'ndl-aurora-b'}
                    style={{
                      ...styles.darkGlow,
                      width: 560,
                      height: 560,
                      top: -220,
                      left: -140,
                      backgroundColor: AURORA_TEAL,
                      opacity: 0.5,
                    }}
                  />
                  <div
                    className={isStatic ? undefined : 'ndl-aurora-c'}
                    style={{
                      ...styles.darkGlow,
                      width: 480,
                      height: 480,
                      bottom: -220,
                      right: -120,
                      backgroundColor: AURORA_BLEND,
                      opacity: 0.45,
                    }}
                  />
                  <div style={styles.grain} />
                  <div style={styles.spotlight} />
                </div>
                <div style={columnStyle}>
                  <Reveal>{storiesSection}</Reveal>
                </div>
              </section>
              {/* dot-grid breakdown band */}
              <section
                ref={registerSection('breakdown')}
                aria-label="Where money goes"
                style={styles.band}>
                <div style={styles.bandFx} aria-hidden="true">
                  <div style={styles.dotGrid} />
                </div>
                <div style={columnStyle}>
                  <Reveal>{breakdownSection}</Reveal>
                </div>
              </section>
              {/* tinted milestones band: pinned scroll story with a
                  static stacked fallback */}
              <section
                ref={registerSection('milestones')}
                aria-label="Milestones"
                style={{...styles.band, ...styles.bandTinted}}>
                {isStatic || isStacked ? (
                  <div style={columnStyle}>
                    <VStack gap={5}>
                      {milestonesIntro}
                      {staticMilestones}
                    </VStack>
                  </div>
                ) : (
                  pinnedMilestones
                )}
              </section>
              {/* aurora transparency band */}
              <section
                ref={registerSection('transparency')}
                aria-label="Transparency"
                style={styles.band}>
                <div style={styles.bandFx} aria-hidden="true">
                  <div
                    className={isStatic ? undefined : 'ndl-aurora-a'}
                    style={{
                      ...styles.auroraBlob,
                      width: 480,
                      height: 480,
                      top: -160,
                      right: -180,
                      backgroundColor: AURORA_GREEN,
                      opacity: 0.35,
                    }}
                  />
                  <div
                    className={isStatic ? undefined : 'ndl-aurora-c'}
                    style={{
                      ...styles.auroraBlob,
                      width: 440,
                      height: 440,
                      bottom: -200,
                      left: -140,
                      backgroundColor: AURORA_TEAL,
                      opacity: 0.35,
                    }}
                  />
                </div>
                <div style={columnStyle}>
                  <Reveal>{transparencySection}</Reveal>
                </div>
              </section>
              {footer}
            </div>
          </LayoutContent>
        }
      />

      {/* Interaction receipt toast: keyed so repeat clicks re-announce. */}
      {toast !== null && (
        <div style={styles.toastWrap}>
          <Toast
            key={toast.key}
            type="info"
            isAutoHide={false}
            autoHideDuration={6000}
            onDismiss={() => setToast(null)}
            body={<Text weight="semibold">{toast.message}</Text>}
          />
        </div>
      )}
    </div>
  );
}
