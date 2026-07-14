// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ai-assistant-landing.tsx
 * @input Deterministic fixtures only (the fictional "Murmur" AI work
 *   assistant: hero copy with a validating email capture, a scripted
 *   five-item chat demo transcript with tool-call chips and an artifact
 *   card, six capability cards each with a CSS-drawn schematic, eight
 *   invented integration tiles with gradient monograms, three count-up
 *   stats, four compliance chips plus four security practice rows, eight
 *   example prompts for the scroll-snap carousel, a two-tier CTA band
 *   with independent email captures, and a three-column sitemap footer)
 * @output Complete vertical-specific marketing landing page for an AI
 *   assistant product: sticky navbar (brand mark + four smooth-scrolling
 *   anchor links + CTA; collapses to a menu button with a dropdown at
 *   compact widths), a split hero whose framed chat demo AUTOPLAYS a
 *   scripted conversation (typing dots → user ask → assistant reply with
 *   a tool-call chip → artifact card → follow-up turn), loops with a
 *   replay button and pauses on hover, a capability grid, a full-bleed
 *   "works where you work" integration band with count-up stats, a
 *   security strip ("your data is never trained on"), a prompt-examples
 *   scroll-snap carousel whose chips fill a demo input, a dark two-tier
 *   CTA band (Try free / Book demo, both validating email forms), and a
 *   footer. Scroll-reveals rise+fade once per section.
 * @position Page template; emitted by `astryx template ai-assistant-landing`
 *
 * Frame: Layout height="fill", content-only — the landing page owns its
 * own chrome so there is no LayoutHeader. LayoutContent (padding 0)
 * hosts a single scroll container; the navbar inside it is
 * position:sticky top:0. A centered 1100px column carries the hero,
 * capabilities, and examples sections; the integrations band, security
 * strip, CTA band, and footer paint full-bleed with their own inner
 * columns so tinted bands alternate with plain bands.
 *
 * Interaction contract:
 * - Chat demo: a step timer appends one scripted item at a time with
 *   typing dots before each message (none before the artifact card);
 *   hovering the frame pauses the timer, leaving resumes it; when the
 *   script completes it waits ~4s and loops; the Replay button restarts
 *   it immediately. prefers-reduced-motion renders the completed
 *   transcript statically (no dots, no loop, no replay affordance).
 * - Hero primary CTA reveals a validating email capture inline (empty +
 *   format errors, success flips to a confirmation echoing the address);
 *   the secondary CTA smooth-scrolls to the prompt examples.
 * - Nav anchors and the nav CTA smooth-scroll the container to real
 *   section ids with a sticky-nav allowance; the compact menu closes on
 *   Escape, outside pointerdown, or any selection.
 * - Prompt carousel chips fill the demo input (editable); "Ask Murmur"
 *   validates non-empty and flips an inline confirmation line.
 * - CTA band forms are independent copies of the email contract with
 *   their own success states. Footer anchor links smooth-scroll;
 *   remaining sitemap links are exits and intentionally no-op.
 * - Scroll reveals (IntersectionObserver, fire once, 12px rise+fade) and
 *   the three count-up stats are gated by prefers-reduced-motion:
 *   reveals render visible, counters render final values.
 *
 * Color policy: token-pure with ONE quarantined accent literal (Murmur
 * violet, see ACCENT) plus scheme-locked brand-art gradients: the logo
 * tile, integration monogram tiles, the CTA band, and the footer carry
 * literal fixture gradients locked with colorScheme:'dark' so the art
 * reads identically in both app themes (hue gradients cannot be built
 * from tokens). Text sitting on those locked surfaces (DARK_TEXT*) is
 * literal on purpose so it stays readable there.
 *
 * Responsive contract (useElementWidth on the page wrapper — the demo
 * stage is ~1045px inside a 1440px window, so viewport media queries
 * never fire in the inline stage):
 * - >880px: navbar shows inline anchor links + CTA; hero is split
 *   copy/demo; capability grid sits 3-up; CTA band is 2-up.
 * - <=880px: nav links collapse behind a 40px menu button whose dropdown
 *   lists the anchors and the CTA.
 * - <=780px: hero stacks (demo below copy), capability grid drops to
 *   2-up then 1-up (Grid minWidth), integration tiles rewrap, the CTA
 *   band stacks, and section paddings tighten.
 * - <=540px: headline steps down, email forms stack the button under the
 *   input, stats stack vertically, and the chat frame shortens. All
 *   action rows wrap, so the page holds at 390px with no overflow-x.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
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
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  ArrowRightIcon,
  AudioWaveformIcon,
  CalendarClockIcon,
  CheckIcon,
  CodeXmlIcon,
  FileTextIcon,
  GlobeIcon,
  LockIcon,
  MailCheckIcon,
  MenuIcon,
  PenLineIcon,
  RotateCcwIcon,
  ScrollTextIcon,
  SearchIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TextQuoteIcon,
  WorkflowIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * Quarantined accent literal (Murmur violet — the brand personality).
 * Contrast math: light #6D28D9 on white = 7.1:1; dark #C4B5FD on a
 * ~#111 dark body = 9.5:1 — both clear WCAG AA for text and UI chrome.
 * Every tint below derives from this one literal via color-mix.
 */
const ACCENT = 'light-dark(#6D28D9, #C4B5FD)';
const ACCENT_TINT = `color-mix(in srgb, ${ACCENT} 11%, transparent)`;
const ACCENT_TINT_STRONG = `color-mix(in srgb, ${ACCENT} 20%, transparent)`;
const ACCENT_BORDER = `color-mix(in srgb, ${ACCENT} 34%, transparent)`;

// Scheme-locked dark-surface text (CTA band + footer only; see Color
// policy in the header).
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.82)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.6)';
const DARK_CHIP_BG = 'rgba(255, 255, 255, 0.12)';
const DARK_CHIP_BORDER = 'rgba(255, 255, 255, 0.22)';
const ERROR_ON_DARK = '#FECACA';

/** Sticky-nav height; smooth-scroll allows for it. */
const NAV_ALLOWANCE = 76;

const MONO = 'var(--font-family-mono, ui-monospace, monospace)';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  wrap: {
    height: '100%',
  },
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  column: {
    width: '100%',
    maxWidth: 1100,
    marginInline: 'auto',
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-10, 64px)',
  },
  columnCompact: {
    padding: 'var(--spacing-4)',
    gap: 'var(--spacing-8)',
  },
  // Full-bleed tinted bands alternate with plain bands.
  band: {
    backgroundColor: 'var(--color-background-muted)',
    borderBlock: '1px solid var(--color-border)',
  },
  bandInner: {
    width: '100%',
    maxWidth: 1100,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  bandInnerCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
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
    maxWidth: 1100,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 56,
  },
  // Scheme-locked brand art (see Color policy): violet brand gradient
  // reads identically in both themes.
  logoTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    colorScheme: 'dark',
    background: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
    color: '#FFFFFF',
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
    boxShadow:
      'var(--shadow-high, 0 12px 32px light-dark(rgba(15, 23, 42, 0.18), rgba(0, 0, 0, 0.5)))',
    padding: 'var(--spacing-3)',
    zIndex: 40,
  },
  navMenuLink: {
    display: 'flex',
    alignItems: 'center',
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
  // ---- eyebrow ----
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  // ---- hero ----
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
    paddingBlock: 'var(--spacing-4)',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
    paddingBlock: 0,
  },
  heroText: {
    flex: '6 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroDemo: {
    flex: '5 1 0',
    minWidth: 0,
  },
  heroHeadline: {
    fontSize: 46,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlineCompact: {
    fontSize: 32,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 480,
    margin: 0,
  },
  // ---- shared email capture ----
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    maxWidth: 440,
  },
  emailRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    maxWidth: 'none',
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
  emailErrorOnDark: {
    color: ERROR_ON_DARK,
  },
  successDisc: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
  },
  successDiscDark: {
    backgroundColor: DARK_CHIP_BG,
    border: `1px solid ${DARK_CHIP_BORDER}`,
    color: DARK_TEXT,
  },
  // ---- chat demo frame ----
  chatFrame: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-med)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  chatBody: {
    height: 396,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    boxSizing: 'border-box',
  },
  chatBodyPhone: {
    height: 340,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    padding: '8px 12px',
    borderRadius: '14px 14px 4px 14px',
    backgroundColor: ACCENT_TINT_STRONG,
    border: `1px solid ${ACCENT_BORDER}`,
    fontSize: 13.5,
    lineHeight: 1.45,
  },
  assistantRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    maxWidth: '92%',
  },
  assistantAvatar: {
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    colorScheme: 'dark',
    background: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
    color: '#FFFFFF',
  },
  assistantBubble: {
    padding: '8px 12px',
    borderRadius: '4px 14px 14px 14px',
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    fontSize: 13.5,
    lineHeight: 1.45,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  toolChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    padding: '3px 8px',
    borderRadius: 999,
    border: `1px solid ${ACCENT_BORDER}`,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    fontFamily: MONO,
    fontSize: 11,
    whiteSpace: 'nowrap',
  },
  artifactCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    marginLeft: 32,
    maxWidth: '88%',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-low)',
  },
  artifactGlyph: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
  },
  typingRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  typingBubble: {
    display: 'inline-flex',
    gap: 4,
    padding: '10px 12px',
    borderRadius: 14,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: 'var(--color-text-secondary)',
    animation: 'aal-typing-dot 1s ease-in-out infinite',
  },
  chatComposer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderTop: '1px solid var(--color-border)',
  },
  chatComposerField: {
    flex: 1,
    minWidth: 0,
    height: 34,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  chatComposerSend: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: ACCENT_TINT_STRONG,
    color: ACCENT,
  },
  // ---- capability cards ----
  capabilityCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
    height: '100%',
  },
  capabilityGlyph: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    flexShrink: 0,
  },
  schematic: {
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-2)',
    minHeight: 72,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 6,
    boxSizing: 'border-box',
  },
  schematicBar: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'var(--color-border)',
  },
  schematicAccentBar: {
    height: 7,
    borderRadius: 4,
    backgroundColor: ACCENT_TINT_STRONG,
    border: `1px solid ${ACCENT_BORDER}`,
  },
  schematicChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 18,
    paddingInline: 7,
    borderRadius: 9,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    fontSize: 9.5,
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  schematicNode: {
    width: 22,
    height: 22,
    borderRadius: 7,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
  },
  schematicWire: {
    flex: 1,
    height: 1,
    backgroundColor: 'var(--color-border)',
  },
  schematicMono: {
    fontFamily: MONO,
    fontSize: 10,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  schematicCalendarCell: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: 3,
    backgroundColor: 'var(--color-border)',
  },
  // ---- integrations ----
  integrationCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: 'var(--spacing-3) var(--spacing-2)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  // Scheme-locked brand art (see Color policy): invented partner-app
  // gradients must not reflow with the theme.
  integrationTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.02em',
    colorScheme: 'dark',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  statValue: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  // ---- security strip ----
  complianceChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxSizing: 'border-box',
  },
  securityBulletDisc: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
  },
  // ---- prompt carousel ----
  promptRail: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    paddingBlock: 4,
    paddingInline: 2,
    WebkitOverflowScrolling: 'touch',
  },
  promptChip: {
    scrollSnapAlign: 'start',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    fontSize: 13.5,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  promptChipActive: {
    borderColor: ACCENT_BORDER,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
  },
  promptDemoCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // ---- CTA band (scheme-locked dark surface; see Color policy) ----
  ctaBand: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundImage: [
      'radial-gradient(70% 90% at 50% 0%, rgba(124, 58, 237, 0.4), transparent 60%)',
      'linear-gradient(180deg, #14101F 0%, #1E1B4B 100%)',
    ].join(', '),
  },
  ctaCard: {
    borderRadius: 14,
    border: `1px solid ${DARK_CHIP_BORDER}`,
    backgroundColor: DARK_CHIP_BG,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
    height: '100%',
  },
  ctaHeadline: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    margin: 0,
    textAlign: 'center',
  },
  ctaHeadlineCompact: {
    fontSize: 24,
  },
  // ---- footer (scheme-locked dark surface; see Color policy) ----
  footer: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: '#14101F',
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
};

// ============= DATA =============
// Deterministic fixtures for the fictional Murmur work assistant.
// No Date.now, no randomness, no network assets, no real logos.

const BRAND = {
  name: 'Murmur',
  tagline: 'The AI assistant that does the work, not just the chat',
};

type SectionId =
  | 'capabilities'
  | 'integrations'
  | 'security'
  | 'examples'
  | 'cta';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'capabilities', label: 'Capabilities'},
  {id: 'integrations', label: 'Integrations'},
  {id: 'security', label: 'Security'},
  {id: 'examples', label: 'Examples'},
];

const HERO = {
  eyebrow: 'AI work assistant',
  headline: 'Hand your busywork to Murmur',
  subcopy:
    'Murmur drafts, researches, and automates inside the tools you ' +
    'already use. Ask once — it pulls the data, writes the doc, and ' +
    'schedules the send while you stay in flow.',
  finePrint: 'Free for teams up to 5 · no credit card required',
};

// ---- scripted chat demo ----

type ChatItem =
  | {kind: 'user'; id: string; text: string}
  | {
      kind: 'assistant';
      id: string;
      text: string;
      tool: {name: string; result: string};
    }
  | {kind: 'artifact'; id: string; title: string; meta: string};

/** Each step waits delayMs (with typing dots for messages) then lands. */
const CHAT_SCRIPT: readonly {delayMs: number; item: ChatItem}[] = [
  {
    delayMs: 1100,
    item: {
      kind: 'user',
      id: 'u1',
      text: "Pull last week's support tickets and draft a summary for Monday's standup.",
    },
  },
  {
    delayMs: 1500,
    item: {
      kind: 'assistant',
      id: 'a1',
      text:
        'On it. I searched your Beacon inbox — 214 tickets between Jul 6 ' +
        'and Jul 12. Top themes: billing retries (31%), CSV import errors ' +
        '(22%), and mobile sign-in (11%). Drafting the summary now.',
      tool: {name: 'tickets.search', result: '214 results · 1.8s'},
    },
  },
  {
    delayMs: 900,
    item: {
      kind: 'artifact',
      id: 'f1',
      title: 'Support summary — week of Jul 6',
      meta: 'Slate doc · 412 words · 5 highlights',
    },
  },
  {
    delayMs: 1400,
    item: {
      kind: 'user',
      id: 'u2',
      text: 'Perfect. Send it to #support-standup every Monday at 9:00.',
    },
  },
  {
    delayMs: 1500,
    item: {
      kind: 'assistant',
      id: 'a2',
      text:
        'Done — recurring digest created. First send lands Monday, Jul 20 ' +
        "at 9:00 AM. I'll flag any week where ticket volume jumps more " +
        'than 20%.',
      tool: {name: 'scheduler.create', result: 'weekly · Mon 9:00 AM'},
    },
  },
];

const CHAT_LOOP_PAUSE_MS = 4200;

// ---- capabilities ----

type SchematicVariant =
  | 'draft'
  | 'research'
  | 'automate'
  | 'summarize'
  | 'code'
  | 'schedule';

interface Capability {
  id: SchematicVariant;
  title: string;
  copy: string;
  icon: Glyph;
}

const CAPABILITIES: readonly Capability[] = [
  {
    id: 'draft',
    title: 'Draft',
    copy: 'Docs, briefs, and replies in your voice — Murmur studies 30 of your past docs before writing a word.',
    icon: PenLineIcon,
  },
  {
    id: 'research',
    title: 'Research',
    copy: 'Answers with receipts: every claim links back to the doc, thread, or page it came from.',
    icon: SearchIcon,
  },
  {
    id: 'automate',
    title: 'Automate',
    copy: 'Turn any request into a recurring job — digests, reports, and follow-ups run without you.',
    icon: WorkflowIcon,
  },
  {
    id: 'summarize',
    title: 'Summarize',
    copy: 'A 90-message thread becomes five bullets and one decision. Catch up in 20 seconds, not 20 minutes.',
    icon: TextQuoteIcon,
  },
  {
    id: 'code',
    title: 'Code',
    copy: 'Query your warehouse, wrangle a CSV, or draft a script — Murmur writes and runs it in a sandbox.',
    icon: CodeXmlIcon,
  },
  {
    id: 'schedule',
    title: 'Schedule',
    copy: 'Finds the slot that works for six calendars in three time zones, then books it and drafts the agenda.',
    icon: CalendarClockIcon,
  },
];

// ---- integrations (invented apps; gradient monogram tiles) ----

interface IntegrationTile {
  id: string;
  name: string;
  role: string;
  monogram: string;
  /** Scheme-locked art gradient (see Color policy). */
  gradient: string;
}

const INTEGRATIONS: readonly IntegrationTile[] = [
  {id: 'tandem', name: 'Tandem', role: 'Team chat', monogram: 'Ta', gradient: 'linear-gradient(135deg, #0D9488 0%, #0E7490 100%)'},
  {id: 'slate', name: 'Slate', role: 'Docs', monogram: 'Sl', gradient: 'linear-gradient(135deg, #475569 0%, #1E293B 100%)'},
  {id: 'cadence', name: 'Cadence', role: 'Calendar', monogram: 'Ca', gradient: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)'},
  {id: 'mica', name: 'Mica', role: 'Email', monogram: 'Mi', gradient: 'linear-gradient(135deg, #0284C7 0%, #1D4ED8 100%)'},
  {id: 'quill', name: 'Quill', role: 'Notes', monogram: 'Qu', gradient: 'linear-gradient(135deg, #E11D48 0%, #9F1239 100%)'},
  {id: 'beacon', name: 'Beacon', role: 'Support desk', monogram: 'Be', gradient: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)'},
  {id: 'tally', name: 'Tally', role: 'Spreadsheets', monogram: 'Tl', gradient: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'},
  {id: 'harbor', name: 'Harbor', role: 'File storage', monogram: 'Ha', gradient: 'linear-gradient(135deg, #2563EB 0%, #312E81 100%)'},
];

const STATS: readonly {
  id: string;
  target: number;
  decimals: number;
  suffix: string;
  caption: string;
}[] = [
  {id: 'teams', target: 12400, decimals: 0, suffix: '', caption: 'teams run on Murmur'},
  {id: 'apps', target: 38, decimals: 0, suffix: '', caption: 'integrations, 8 shown here'},
  {id: 'hours', target: 8.5, decimals: 1, suffix: ' hrs', caption: 'saved per teammate, weekly'},
];

// ---- security ----

const COMPLIANCE_CHIPS: readonly {id: string; label: string; note: string}[] = [
  {id: 'soc2', label: 'SOC 2 Type II', note: 'Report available'},
  {id: 'iso', label: 'ISO 27001', note: 'Certified 2026'},
  {id: 'gdpr', label: 'GDPR', note: 'DPA included'},
  {id: 'sso', label: 'SSO + SCIM', note: 'On Business plan'},
];

const SECURITY_POINTS: readonly {id: string; icon: Glyph; text: string}[] = [
  {
    id: 'training',
    icon: ShieldCheckIcon,
    text: 'Your data is never trained on — by Murmur or any model provider. Contractually, not just by default.',
  },
  {
    id: 'encryption',
    icon: LockIcon,
    text: 'AES-256 encryption at rest and TLS 1.3 in transit, with per-workspace keys.',
  },
  {
    id: 'residency',
    icon: GlobeIcon,
    text: 'EU or US data residency — your workspace, memory, and artifacts stay in the region you pick.',
  },
  {
    id: 'audit',
    icon: ScrollTextIcon,
    text: 'Every tool call is logged: admin audit trail with 90-day retention controls and CSV export.',
  },
];

// ---- prompt examples ----

const PROMPTS: readonly {id: string; chip: string; full: string}[] = [
  {
    id: 'digest',
    chip: 'Weekly metrics digest',
    full: 'Every Friday, pull signups and churn from Tally and post a 5-line digest to #growth.',
  },
  {
    id: 'brief',
    chip: 'Meeting brief',
    full: 'Before my 2pm with Northwind, brief me: last 3 email threads, open tickets, and renewal date.',
  },
  {
    id: 'triage',
    chip: 'Inbox triage',
    full: 'Triage my Mica inbox: archive newsletters, flag anything from a customer, draft replies for intros.',
  },
  {
    id: 'onepager',
    chip: 'Draft a one-pager',
    full: 'Draft a one-pager pitching the Q4 pricing experiment, using the notes in Quill from Tuesday.',
  },
  {
    id: 'csv',
    chip: 'Clean up a CSV',
    full: 'Take leads.csv from Harbor, dedupe by email, normalize company names, and save it back.',
  },
  {
    id: 'catchup',
    chip: 'Catch me up',
    full: "Summarize what happened in #launch-week while I was out — decisions first, then who's blocked.",
  },
  {
    id: 'schedule',
    chip: 'Find a meeting slot',
    full: 'Find 45 minutes next week for me, Priya, and Jonas across PST and CET, and book it with an agenda.',
  },
  {
    id: 'competitor',
    chip: 'Competitor teardown',
    full: 'Research Gridware’s new pricing page and summarize what changed versus their March plans.',
  },
];

// ---- CTA band ----

interface CtaTier {
  id: string;
  name: string;
  blurb: string;
  bullets: readonly string[];
  inputLabel: string;
  buttonLabel: string;
  success: (email: string) => string;
}

const CTA_TIERS: readonly CtaTier[] = [
  {
    id: 'free',
    name: 'Try free',
    blurb: 'Free for teams up to 5. Full assistant, no credit card.',
    bullets: [
      'Unlimited drafts and summaries',
      '50 automation runs per month',
      'All 38 integrations included',
    ],
    inputLabel: 'Work email for the free plan',
    buttonLabel: 'Create workspace',
    success: email => `Invite sent to ${email} — check your inbox.`,
  },
  {
    id: 'demo',
    name: 'Book a demo',
    blurb: 'For teams of 20+ with security review and rollout needs.',
    bullets: [
      'Security review and signed DPA',
      'SSO + SCIM provisioning setup',
      'Dedicated onboarding for 4 weeks',
    ],
    inputLabel: 'Work email for a demo',
    buttonLabel: 'Book a 20-min demo',
    success: email =>
      `Booked — we'll email ${email} within one business day.`,
  },
];

const FOOTER_COLUMNS: readonly {
  id: string;
  heading: string;
  links: readonly {label: string; anchor?: SectionId}[];
}[] = [
  {
    id: 'product',
    heading: 'Product',
    links: [
      {label: 'Capabilities', anchor: 'capabilities'},
      {label: 'Integrations', anchor: 'integrations'},
      {label: 'Security', anchor: 'security'},
      {label: 'Changelog'},
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [{label: 'About'}, {label: 'Blog'}, {label: 'Careers'}, {label: 'Press'}],
  },
  {
    id: 'legal',
    heading: 'Legal',
    links: [
      {label: 'Privacy'},
      {label: 'Terms'},
      {label: 'DPA'},
      {label: 'Subprocessors'},
    ],
  },
];

// ============= HELPERS =============

/**
 * Measure the page's own width (the demo stage is ~1045px inside a
 * 1440px window, so viewport media queries never fire inline).
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

/** Reduced-motion gate: reveals render visible, counters render final. */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return prefersReduced;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your work email to get started.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

interface EmailFormState {
  value: string;
  error: string | null;
  confirmedEmail: string | null;
}

const EMPTY_EMAIL_FORM: EmailFormState = {
  value: '',
  error: null,
  confirmedEmail: null,
};

// ============= MOTION PIECES =============

/** Scroll reveal: fires once via IntersectionObserver; 12px rise+fade. */
function Reveal({
  children,
  isReducedMotion,
  delayMs = 0,
  style,
}: {
  children: ReactNode;
  isReducedMotion: boolean;
  delayMs?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isShown, setIsShown] = useState(isReducedMotion);
  useEffect(() => {
    if (isReducedMotion) {
      setIsShown(true);
      return undefined;
    }
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting === true) {
          setIsShown(true);
          observer.disconnect();
        }
      },
      {threshold: 0.12},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isReducedMotion]);
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: isShown ? 1 : 0,
        transform: isShown ? 'none' : 'translateY(12px)',
        transition: isReducedMotion
          ? 'none'
          : `opacity 0.55s ease ${delayMs}ms, transform 0.55s ease ${delayMs}ms`,
      }}>
      {children}
    </div>
  );
}

/** Count-up on first view; deterministic eased steps via setInterval. */
function CountUp({
  target,
  decimals,
  suffix,
  isReducedMotion,
}: {
  target: number;
  decimals: number;
  suffix: string;
  isReducedMotion: boolean;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [value, setValue] = useState(isReducedMotion ? target : 0);
  useEffect(() => {
    if (isReducedMotion) {
      setValue(target);
      return undefined;
    }
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting === true) {
          setIsStarted(true);
          observer.disconnect();
        }
      },
      {threshold: 0.4},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isReducedMotion, target]);
  useEffect(() => {
    if (!isStarted || isReducedMotion) {
      return undefined;
    }
    const totalSteps = 28;
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      const eased = 1 - (1 - step / totalSteps) ** 3;
      setValue(target * eased);
      if (step >= totalSteps) {
        clearInterval(id);
        setValue(target);
      }
    }, 32);
    return () => clearInterval(id);
  }, [isStarted, isReducedMotion, target]);
  return (
    <span ref={ref} style={styles.statValue}>
      {value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

// ============= SMALL PIECES =============

function BrandMark({label}: {label?: string}) {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={AudioWaveformIcon} size="sm" color="inherit" />
      </div>
      <Text type="label">{label ?? BRAND.name}</Text>
    </HStack>
  );
}

function Eyebrow({icon, label}: {icon?: Glyph; label: string}) {
  return (
    <span style={styles.eyebrow}>
      {icon != null && <Icon icon={icon} size="xsm" color="inherit" />}
      {label}
    </span>
  );
}

/** Tiny CSS-drawn schematic for a capability card. */
function CapabilitySchematic({variant}: {variant: SchematicVariant}) {
  if (variant === 'draft') {
    return (
      <div style={styles.schematic} aria-hidden="true">
        <div style={{...styles.schematicBar, width: '88%'}} />
        <div style={{...styles.schematicBar, width: '72%'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
          <div style={{...styles.schematicAccentBar, width: '42%'}} />
          <div
            style={{
              width: 2,
              height: 12,
              backgroundColor: ACCENT,
              borderRadius: 1,
            }}
          />
        </div>
      </div>
    );
  }
  if (variant === 'research') {
    return (
      <div style={styles.schematic} aria-hidden="true">
        <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <div style={{...styles.schematicNode, borderRadius: '50%'}}>
            <Icon icon={SearchIcon} size="xsm" color="inherit" />
          </div>
          <div style={{...styles.schematicBar, flex: 1}} />
        </div>
        <div style={{display: 'flex', gap: 4, flexWrap: 'wrap'}}>
          <span style={styles.schematicChip}>slate · 3</span>
          <span style={styles.schematicChip}>tandem · 5</span>
          <span style={styles.schematicChip}>web · 2</span>
        </div>
      </div>
    );
  }
  if (variant === 'automate') {
    return (
      <div style={styles.schematic} aria-hidden="true">
        <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <div style={styles.schematicNode}>
            <Icon icon={ZapIcon} size="xsm" color="inherit" />
          </div>
          <div style={styles.schematicWire} />
          <div style={styles.schematicNode}>
            <Icon icon={FileTextIcon} size="xsm" color="inherit" />
          </div>
          <div style={styles.schematicWire} />
          <div
            style={{
              ...styles.schematicNode,
              backgroundColor: ACCENT_TINT,
              borderColor: ACCENT_BORDER,
              color: ACCENT,
            }}>
            <Icon icon={CheckIcon} size="xsm" color="inherit" />
          </div>
        </div>
        <span style={{...styles.schematicChip, alignSelf: 'flex-start'}}>
          every Fri · 9:00
        </span>
      </div>
    );
  }
  if (variant === 'summarize') {
    return (
      <div style={styles.schematic} aria-hidden="true">
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <div
            style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 4}}>
            <div style={{...styles.schematicBar, width: '100%'}} />
            <div style={{...styles.schematicBar, width: '92%'}} />
            <div style={{...styles.schematicBar, width: '96%'}} />
            <div style={{...styles.schematicBar, width: '84%'}} />
          </div>
          <Icon icon={ArrowRightIcon} size="xsm" color="secondary" />
          <div
            style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 4}}>
            <div style={{...styles.schematicAccentBar, width: '80%'}} />
            <div style={{...styles.schematicAccentBar, width: '56%'}} />
          </div>
        </div>
      </div>
    );
  }
  if (variant === 'code') {
    return (
      <div style={styles.schematic} aria-hidden="true">
        <div style={styles.schematicMono}>
          <span style={{color: ACCENT}}>SELECT</span> plan, count(*)
        </div>
        <div style={styles.schematicMono}>
          <span style={{color: ACCENT}}>FROM</span> signups
        </div>
        <div style={styles.schematicMono}>
          <span style={{color: ACCENT}}>GROUP BY</span> 1;{' '}
          <span style={{opacity: 0.7}}>→ 3 rows · 0.4s</span>
        </div>
      </div>
    );
  }
  // schedule
  return (
    <div style={styles.schematic} aria-hidden="true">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 3,
        }}>
        {Array.from({length: 14}, (_, index) => (
          <div
            key={index}
            style={{
              ...styles.schematicCalendarCell,
              ...(index === 11
                ? {
                    backgroundColor: ACCENT_TINT_STRONG,
                    outline: `1px solid ${ACCENT_BORDER}`,
                  }
                : null),
            }}
          />
        ))}
      </div>
      <span style={{...styles.schematicChip, alignSelf: 'flex-start'}}>
        Thu 10:30 · works for all 6
      </span>
    </div>
  );
}

// ============= PAGE =============

export default function AiAssistantLandingTemplate() {
  // ---- responsive (element width, not viewport) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNavCompact = wrapWidth > 0 && wrapWidth <= 880;
  const isStacked = wrapWidth > 0 && wrapWidth <= 780;
  const isPhone = wrapWidth > 0 && wrapWidth <= 540;

  const isReducedMotion = usePrefersReducedMotion();

  // ---- nav ----
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>(
    {},
  );

  // ---- chat demo autoplay ----
  const [chatCount, setChatCount] = useState(0);
  const [isChatPaused, setIsChatPaused] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const isChatDone = chatCount >= CHAT_SCRIPT.length;

  // ---- hero capture ----
  const [isHeroCaptureOpen, setIsHeroCaptureOpen] = useState(false);
  const [heroForm, setHeroForm] = useState<EmailFormState>(EMPTY_EMAIL_FORM);

  // ---- prompt carousel ----
  const [activePromptId, setActivePromptId] = useState<string>(PROMPTS[0].id);
  const [promptValue, setPromptValue] = useState<string>(PROMPTS[0].full);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [isPromptSaved, setIsPromptSaved] = useState(false);

  // ---- CTA band forms (independent) ----
  const [ctaForms, setCtaForms] = useState<Record<string, EmailFormState>>({
    free: EMPTY_EMAIL_FORM,
    demo: EMPTY_EMAIL_FORM,
  });

  // Nav dropdown dismisses on Escape (refocusing the trigger) and on any
  // pointerdown outside the sticky navbar.
  useEffect(() => {
    if (!isNavMenuOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNavMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const nav = navRef.current;
      if (
        nav != null &&
        event.target instanceof Node &&
        !nav.contains(event.target)
      ) {
        setIsNavMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isNavMenuOpen]);

  // Chat autoplay engine: one timer per step; hover pauses; the script
  // loops after a beat. Reduced motion renders the completed transcript.
  useEffect(() => {
    if (isReducedMotion) {
      setChatCount(CHAT_SCRIPT.length);
      return undefined;
    }
    if (isChatPaused) {
      return undefined;
    }
    const delay = isChatDone
      ? CHAT_LOOP_PAUSE_MS
      : CHAT_SCRIPT[chatCount].delayMs;
    const id = setTimeout(() => {
      setChatCount(previous =>
        previous >= CHAT_SCRIPT.length ? 0 : previous + 1,
      );
    }, delay);
    return () => clearTimeout(id);
  }, [chatCount, isChatPaused, isChatDone, isReducedMotion]);

  // Keep the latest chat item in view as the script plays.
  useEffect(() => {
    const body = chatBodyRef.current;
    if (body != null) {
      body.scrollTop = body.scrollHeight;
    }
  }, [chatCount]);

  // ---- interactions ----

  const jumpToSection = (id: SectionId) => {
    setIsNavMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container == null || section == null) {
      return;
    }
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: isReducedMotion ? 'auto' : 'smooth',
    });
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const submitHeroForm = () => {
    const error = validateEmail(heroForm.value);
    if (error != null) {
      setHeroForm({...heroForm, error});
      return;
    }
    setHeroForm({
      value: '',
      error: null,
      confirmedEmail: heroForm.value.trim(),
    });
  };

  const submitCtaForm = (tierId: string) => {
    const form = ctaForms[tierId];
    const error = validateEmail(form.value);
    if (error != null) {
      setCtaForms({...ctaForms, [tierId]: {...form, error}});
      return;
    }
    setCtaForms({
      ...ctaForms,
      [tierId]: {value: '', error: null, confirmedEmail: form.value.trim()},
    });
  };

  const pickPrompt = (promptId: string) => {
    const prompt = PROMPTS.find(entry => entry.id === promptId);
    if (prompt == null) {
      return;
    }
    setActivePromptId(promptId);
    setPromptValue(prompt.full);
    setPromptError(null);
    setIsPromptSaved(false);
  };

  const submitPrompt = () => {
    if (promptValue.trim().length === 0) {
      setPromptError('Pick a prompt above or type your own.');
      return;
    }
    setPromptError(null);
    setIsPromptSaved(true);
  };

  // ============= CHROME =============

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Main">
      <div style={styles.navInner}>
        <BrandMark />
        <StackItem size="fill">
          {!isNavCompact && (
            <HStack gap={1} vAlign="center" hAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  style={styles.navLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
            </HStack>
          )}
        </StackItem>
        {!isNavCompact && (
          <Button
            label="Try Murmur free"
            variant="primary"
            size="sm"
            onClick={() => jumpToSection('cta')}
          />
        )}
        {isNavCompact && (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isNavMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isNavMenuOpen}
            style={styles.menuButton}
            onClick={() => setIsNavMenuOpen(previous => !previous)}>
            <Icon
              icon={isNavMenuOpen ? XIcon : MenuIcon}
              size="sm"
              color="inherit"
            />
          </button>
        )}
        {isNavCompact && isNavMenuOpen && (
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
              <Button
                label="Try Murmur free"
                variant="primary"
                onClick={() => jumpToSection('cta')}
              />
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ---- hero email capture ----
  const heroCapture =
    heroForm.confirmedEmail != null ? (
      <HStack gap={3} vAlign="center">
        <div style={styles.successDisc}>
          <Icon icon={MailCheckIcon} size="sm" color="inherit" />
        </div>
        <VStack gap={0}>
          <Text weight="semibold">You're in — check your inbox.</Text>
          <Text type="supporting" color="secondary">
            We sent a workspace invite to {heroForm.confirmedEmail}.
          </Text>
        </VStack>
      </HStack>
    ) : (
      <VStack gap={1}>
        <div
          style={{
            ...styles.emailRow,
            ...(isPhone ? styles.emailRowStacked : null),
          }}>
          <div style={styles.emailInput}>
            <TextInput
              label="Work email"
              isLabelHidden
              placeholder="you@company.com"
              value={heroForm.value}
              onChange={value =>
                setHeroForm({...heroForm, value, error: null})
              }
            />
          </div>
          <Button
            label="Get started"
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={submitHeroForm}
          />
        </div>
        {heroForm.error != null && (
          <p style={styles.emailError} role="alert">
            {heroForm.error}
          </p>
        )}
        <Text type="supporting" color="secondary">
          {HERO.finePrint}
        </Text>
      </VStack>
    );

  // ---- scripted chat demo ----
  const visibleItems = CHAT_SCRIPT.slice(0, chatCount).map(step => step.item);
  const nextStep = isChatDone ? null : CHAT_SCRIPT[chatCount];
  const showTypingDots =
    !isReducedMotion &&
    nextStep != null &&
    nextStep.item.kind !== 'artifact' &&
    chatCount > 0; // first user message lands after a plain beat

  const chatDemo = (
    <div
      style={styles.chatFrame}
      onMouseEnter={() => setIsChatPaused(true)}
      onMouseLeave={() => setIsChatPaused(false)}
      role="figure"
      aria-label="Scripted Murmur conversation demo">
      <div style={styles.chatHeader}>
        <div
          style={{...styles.assistantAvatar, width: 26, height: 26}}
          aria-hidden="true">
          <Icon icon={AudioWaveformIcon} size="xsm" color="inherit" />
        </div>
        <Text size="sm" weight="semibold">
          Murmur · #launch-week
        </Text>
        <StatusDot
          variant="success"
          label="Assistant online"
          isPulsing={!isReducedMotion}
        />
        <StackItem size="fill">
          <span />
        </StackItem>
        {!isReducedMotion && isChatDone && (
          <Button
            label="Replay"
            variant="ghost"
            size="sm"
            icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
            onClick={() => setChatCount(0)}
          />
        )}
      </div>
      <div
        ref={chatBodyRef}
        style={{
          ...styles.chatBody,
          ...(isPhone ? styles.chatBodyPhone : null),
        }}>
        {visibleItems.map(item => {
          if (item.kind === 'user') {
            return (
              <div key={item.id} style={styles.userBubble}>
                {item.text}
              </div>
            );
          }
          if (item.kind === 'assistant') {
            return (
              <div key={item.id} style={styles.assistantRow}>
                <div style={styles.assistantAvatar} aria-hidden="true">
                  <Icon icon={AudioWaveformIcon} size="xsm" color="inherit" />
                </div>
                <div style={styles.assistantBubble}>
                  <span style={styles.toolChip}>
                    <Icon icon={ZapIcon} size="xsm" color="inherit" />
                    {item.tool.name} · {item.tool.result}
                  </span>
                  <span>{item.text}</span>
                </div>
              </div>
            );
          }
          return (
            <div key={item.id} style={styles.artifactCard}>
              <div style={styles.artifactGlyph} aria-hidden="true">
                <Icon icon={FileTextIcon} size="sm" color="inherit" />
              </div>
              <VStack gap={0}>
                <Text size="sm" weight="semibold">
                  {item.title}
                </Text>
                <Text type="supporting" color="secondary">
                  {item.meta}
                </Text>
              </VStack>
            </div>
          );
        })}
        {showTypingDots && nextStep != null && (
          <div
            style={{
              ...styles.typingRow,
              ...(nextStep.item.kind === 'user'
                ? {alignSelf: 'flex-end'}
                : null),
            }}
            aria-label="Typing">
            {nextStep.item.kind === 'assistant' && (
              <div style={styles.assistantAvatar} aria-hidden="true">
                <Icon icon={AudioWaveformIcon} size="xsm" color="inherit" />
              </div>
            )}
            <div style={styles.typingBubble}>
              <span style={{...styles.typingDot, animationDelay: '0s'}} />
              <span style={{...styles.typingDot, animationDelay: '0.15s'}} />
              <span style={{...styles.typingDot, animationDelay: '0.3s'}} />
            </div>
          </div>
        )}
      </div>
      <div style={styles.chatComposer} aria-hidden="true">
        <div style={styles.chatComposerField}>Ask Murmur anything…</div>
        <div style={styles.chatComposerSend}>
          <Icon icon={SendIcon} size="xsm" color="inherit" />
        </div>
      </div>
    </div>
  );

  const chatCaption = isReducedMotion
    ? 'Animation off — the full conversation is shown.'
    : isChatPaused
      ? 'Paused — move the pointer away to resume.'
      : 'Demo autoplays and loops · hover to pause.';

  const hero = (
    <div
      style={{
        ...styles.heroRow,
        ...(isStacked ? styles.heroRowStacked : null),
      }}>
      <div style={styles.heroText}>
        <Eyebrow icon={SparklesIcon} label={HERO.eyebrow} />
        <h1
          style={{
            ...styles.heroHeadline,
            ...(isPhone ? styles.heroHeadlineCompact : null),
          }}>
          {HERO.headline}
        </h1>
        <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
        {!isHeroCaptureOpen && heroForm.confirmedEmail == null ? (
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Button
              label="Try Murmur free"
              variant="primary"
              icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
              onClick={() => setIsHeroCaptureOpen(true)}
            />
            <Button
              label="Browse example prompts"
              variant="secondary"
              onClick={() => jumpToSection('examples')}
            />
          </HStack>
        ) : (
          heroCapture
        )}
      </div>
      <div style={styles.heroDemo}>
        <VStack gap={1}>
          {chatDemo}
          <Text type="supporting" color="secondary">
            {chatCaption}
          </Text>
        </VStack>
      </div>
    </div>
  );

  // ---- capabilities ----
  const capabilities = (
    <section
      ref={registerSection('capabilities')}
      aria-label="Capabilities">
      <VStack gap={5}>
        <Reveal isReducedMotion={isReducedMotion}>
          <VStack gap={2} hAlign="center">
            <Eyebrow label="Capabilities" />
            <Heading level={2}>One assistant, six day-jobs</Heading>
            <Text type="supporting" color="secondary" justify="center">
              Murmur isn't a chat window bolted onto your stack — it works
              inside it, with real access and real output.
            </Text>
          </VStack>
        </Reveal>
        <Grid columns={{minWidth: 280, max: 3}} gap={4}>
          {CAPABILITIES.map((capability, index) => (
            <Reveal
              key={capability.id}
              isReducedMotion={isReducedMotion}
              delayMs={index * 60}>
              <div style={styles.capabilityCard}>
                <HStack gap={2} vAlign="center">
                  <div style={styles.capabilityGlyph} aria-hidden="true">
                    <Icon icon={capability.icon} size="sm" color="inherit" />
                  </div>
                  <Text type="label">{capability.title}</Text>
                </HStack>
                <Text type="supporting" color="secondary">
                  {capability.copy}
                </Text>
                <CapabilitySchematic variant={capability.id} />
              </div>
            </Reveal>
          ))}
        </Grid>
      </VStack>
    </section>
  );

  // ---- integrations band (full-bleed tinted) ----
  const integrations = (
    <section
      ref={registerSection('integrations')}
      aria-label="Integrations"
      style={styles.band}>
      <div
        style={{
          ...styles.bandInner,
          ...(isPhone ? styles.bandInnerCompact : null),
        }}>
        <Reveal isReducedMotion={isReducedMotion}>
          <VStack gap={2} hAlign="center">
            <Eyebrow label="Integrations" />
            <Heading level={2}>Works where you work</Heading>
            <Text type="supporting" color="secondary" justify="center">
              Connect a tool once and Murmur can read, write, and act in it
              — with per-tool permissions your admin controls.
            </Text>
          </VStack>
        </Reveal>
        <Reveal isReducedMotion={isReducedMotion} delayMs={80}>
          <Grid columns={{minWidth: 116, max: 8}} gap={3}>
            {INTEGRATIONS.map(tile => (
              <div key={tile.id} style={styles.integrationCard}>
                <div
                  style={{
                    ...styles.integrationTile,
                    background: tile.gradient,
                  }}
                  aria-hidden="true">
                  {tile.monogram}
                </div>
                <VStack gap={0} hAlign="center">
                  <Text size="sm" weight="semibold">
                    {tile.name}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {tile.role}
                  </Text>
                </VStack>
              </div>
            ))}
          </Grid>
        </Reveal>
        <Reveal isReducedMotion={isReducedMotion} delayMs={140}>
          <div
            style={{
              display: 'flex',
              flexDirection: isPhone ? 'column' : 'row',
              gap: isPhone ? 'var(--spacing-4)' : 'var(--spacing-6)',
              justifyContent: 'center',
              alignItems: isPhone ? 'flex-start' : 'center',
              paddingTop: 'var(--spacing-2)',
            }}>
            {STATS.map(stat => (
              <VStack key={stat.id} gap={0}>
                <CountUp
                  target={stat.target}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                  isReducedMotion={isReducedMotion}
                />
                <Text type="supporting" color="secondary">
                  {stat.caption}
                </Text>
              </VStack>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );

  // ---- security strip ----
  const security = (
    <section ref={registerSection('security')} aria-label="Security">
      <VStack gap={5}>
        <Reveal isReducedMotion={isReducedMotion}>
          <VStack gap={2} hAlign="center">
            <Eyebrow icon={ShieldCheckIcon} label="Security" />
            <Heading level={2}>Private by default</Heading>
            <Text type="supporting" color="secondary" justify="center">
              Murmur sees a lot of your work, so the bar is simple: your
              data is never trained on, never sold, and never leaves the
              region you choose.
            </Text>
          </VStack>
        </Reveal>
        <Reveal isReducedMotion={isReducedMotion} delayMs={60}>
          <Grid columns={{minWidth: 200, max: 4}} gap={3}>
            {COMPLIANCE_CHIPS.map(chip => (
              <div key={chip.id} style={styles.complianceChip}>
                <div style={styles.securityBulletDisc} aria-hidden="true">
                  <Icon icon={ShieldCheckIcon} size="sm" color="inherit" />
                </div>
                <VStack gap={0}>
                  <Text size="sm" weight="semibold">
                    {chip.label}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {chip.note}
                  </Text>
                </VStack>
              </div>
            ))}
          </Grid>
        </Reveal>
        <Reveal isReducedMotion={isReducedMotion} delayMs={120}>
          <Grid columns={{minWidth: 320, max: 2}} gap={3}>
            {SECURITY_POINTS.map(point => (
              <HStack key={point.id} gap={2} vAlign="start">
                <div style={styles.securityBulletDisc} aria-hidden="true">
                  <Icon icon={point.icon} size="sm" color="inherit" />
                </div>
                <StackItem size="fill">
                  <Text type="supporting" color="secondary">
                    {point.text}
                  </Text>
                </StackItem>
              </HStack>
            ))}
          </Grid>
        </Reveal>
      </VStack>
    </section>
  );

  // ---- prompt examples ----
  const examples = (
    <section ref={registerSection('examples')} aria-label="Example prompts">
      <VStack gap={4}>
        <Reveal isReducedMotion={isReducedMotion}>
          <VStack gap={2} hAlign="center">
            <Eyebrow label="Examples" />
            <Heading level={2}>Steal a prompt to start</Heading>
            <Text type="supporting" color="secondary" justify="center">
              Tap a chip to load it into the demo composer — these are the
              eight most-run prompts across Murmur workspaces.
            </Text>
          </VStack>
        </Reveal>
        <Reveal isReducedMotion={isReducedMotion} delayMs={60}>
          <div style={styles.promptRail} aria-label="Prompt examples">
            {PROMPTS.map(prompt => (
              <button
                key={prompt.id}
                type="button"
                aria-pressed={prompt.id === activePromptId}
                style={{
                  ...styles.promptChip,
                  ...(prompt.id === activePromptId
                    ? styles.promptChipActive
                    : null),
                }}
                onClick={() => pickPrompt(prompt.id)}>
                <Icon icon={SparklesIcon} size="xsm" color="inherit" />
                {prompt.chip}
              </button>
            ))}
          </div>
        </Reveal>
        <Reveal isReducedMotion={isReducedMotion} delayMs={100}>
          <div style={styles.promptDemoCard}>
            <div
              style={{
                ...styles.emailRow,
                maxWidth: 'none',
                ...(isPhone ? styles.emailRowStacked : null),
              }}>
              <div style={styles.emailInput}>
                <TextInput
                  label="Demo prompt"
                  isLabelHidden
                  placeholder="Ask Murmur to do something…"
                  value={promptValue}
                  onChange={value => {
                    setPromptValue(value);
                    setPromptError(null);
                    setIsPromptSaved(false);
                  }}
                />
              </div>
              <Button
                label="Ask Murmur"
                variant="primary"
                icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                onClick={submitPrompt}
              />
            </div>
            {promptError != null && (
              <p style={styles.emailError} role="alert">
                {promptError}
              </p>
            )}
            {isPromptSaved && (
              <HStack gap={2} vAlign="center">
                <Badge
                  variant="success"
                  label="Saved"
                  icon={<Icon icon={CheckIcon} size="xsm" color="inherit" />}
                />
                <Text type="supporting" color="secondary">
                  Murmur will run this as your first task after you create a
                  workspace below.
                </Text>
              </HStack>
            )}
          </div>
        </Reveal>
      </VStack>
    </section>
  );

  // ---- tiered CTA band (scheme-locked dark surface) ----
  const ctaBand = (
    <section
      ref={registerSection('cta')}
      aria-label="Get started"
      style={styles.ctaBand}>
      <div
        style={{
          ...styles.bandInner,
          ...(isPhone ? styles.bandInnerCompact : null),
        }}>
        <Reveal isReducedMotion={isReducedMotion}>
          <VStack gap={2} hAlign="center">
            <h2
              style={{
                ...styles.ctaHeadline,
                ...(isPhone ? styles.ctaHeadlineCompact : null),
              }}>
              Put Murmur to work this week
            </h2>
            <Text
              type="supporting"
              color="inherit"
              justify="center"
              style={{color: DARK_TEXT_SOFT}}>
              Most teams connect two tools and ship their first automation
              in under 20 minutes.
            </Text>
          </VStack>
        </Reveal>
        <Reveal isReducedMotion={isReducedMotion} delayMs={80}>
          <Grid columns={{minWidth: isStacked ? 280 : 380, max: 2}} gap={4}>
            {CTA_TIERS.map(tier => {
              const form = ctaForms[tier.id];
              return (
                <div key={tier.id} style={styles.ctaCard}>
                  <VStack gap={1}>
                    <Text type="label" color="inherit">
                      {tier.name}
                    </Text>
                    <Text
                      type="supporting"
                      color="inherit"
                      style={{color: DARK_TEXT_SOFT}}>
                      {tier.blurb}
                    </Text>
                  </VStack>
                  <VStack gap={1}>
                    {tier.bullets.map(bullet => (
                      <HStack key={bullet} gap={2} vAlign="center">
                        <Icon icon={CheckIcon} size="xsm" color="inherit" />
                        <Text
                          size="sm"
                          color="inherit"
                          style={{color: DARK_TEXT_SOFT}}>
                          {bullet}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                  {form.confirmedEmail != null ? (
                    <HStack gap={3} vAlign="center">
                      <div
                        style={{
                          ...styles.successDisc,
                          ...styles.successDiscDark,
                        }}>
                        <Icon icon={MailCheckIcon} size="sm" color="inherit" />
                      </div>
                      <Text size="sm" color="inherit" weight="semibold">
                        {tier.success(form.confirmedEmail)}
                      </Text>
                    </HStack>
                  ) : (
                    <VStack gap={1}>
                      <div
                        style={{
                          ...styles.emailRow,
                          maxWidth: 'none',
                          ...(isPhone ? styles.emailRowStacked : null),
                        }}>
                        <div style={styles.emailInput}>
                          <TextInput
                            label={tier.inputLabel}
                            isLabelHidden
                            placeholder="you@company.com"
                            value={form.value}
                            onChange={value =>
                              setCtaForms({
                                ...ctaForms,
                                [tier.id]: {...form, value, error: null},
                              })
                            }
                          />
                        </div>
                        <Button
                          label={tier.buttonLabel}
                          variant={tier.id === 'free' ? 'primary' : 'secondary'}
                          onClick={() => submitCtaForm(tier.id)}
                        />
                      </div>
                      {form.error != null && (
                        <p
                          style={{
                            ...styles.emailError,
                            ...styles.emailErrorOnDark,
                          }}
                          role="alert">
                          {form.error}
                        </p>
                      )}
                    </VStack>
                  )}
                </div>
              );
            })}
          </Grid>
        </Reveal>
      </div>
    </section>
  );

  // ---- footer ----
  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...styles.bandInner,
          ...(isPhone ? styles.bandInnerCompact : null),
        }}>
        <HStack gap={6} vAlign="start" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={2}>
              <BrandMark />
              <Text
                type="supporting"
                color="inherit"
                style={{color: DARK_TEXT_FAINT, maxWidth: 300}}>
                {BRAND.tagline}. Built by a 40-person team in Amsterdam and
                Toronto.
              </Text>
            </VStack>
          </StackItem>
          <StackItem size="fill">
            <Grid columns={{minWidth: 140, max: 3}} gap={4}>
              {FOOTER_COLUMNS.map(column => (
                <VStack key={column.id} gap={1}>
                  <Text size="sm" weight="semibold" color="inherit">
                    {column.heading}
                  </Text>
                  {column.links.map(link => (
                    <button
                      key={link.label}
                      type="button"
                      style={styles.footerLink}
                      onClick={
                        link.anchor != null
                          ? () => jumpToSection(link.anchor as SectionId)
                          : () => {} // exits the page; intentionally inert
                      }>
                      {link.label}
                    </button>
                  ))}
                </VStack>
              ))}
            </Grid>
          </StackItem>
        </HStack>
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              © 2026 Murmur Labs, Inc. All rights reserved.
            </Text>
          </StackItem>
          <Text
            type="supporting"
            color="inherit"
            style={{color: DARK_TEXT_FAINT}}>
            SOC 2 Type II · Your data is never trained on
          </Text>
        </HStack>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <div ref={wrapRef} style={styles.wrap}>
      {/* Typing-dot keyframes (dots only render when motion is allowed). */}
      <style>{`@keyframes aal-typing-dot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-2px); } }`}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0} role="main" label="Murmur landing page">
            <div ref={pageRef} style={styles.page}>
              {navbar}
              <div
                style={{
                  ...styles.column,
                  ...(isPhone ? styles.columnCompact : null),
                }}>
                {hero}
                {capabilities}
              </div>
              {integrations}
              <div
                style={{
                  ...styles.column,
                  ...(isPhone ? styles.columnCompact : null),
                }}>
                {security}
                {examples}
              </div>
              {ctaBand}
              {footer}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
