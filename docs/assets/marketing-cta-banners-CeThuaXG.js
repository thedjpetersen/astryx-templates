var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (three announcement banners — a slim
 *   "Astral 3.0 ships today" top bar, a gradient launch-offer promo whose
 *   countdown starts from a fixed 3d 07:42:18 budget against the literal
 *   deadline line "Ends Wednesday, July 8 at 9:00 AM PT", and a floating
 *   privacy banner with three consent toggles seeded essential/analytics on
 *   and marketing off — plus four CTA section variants with fixture
 *   headlines, four feature bullets, the promo code LAUNCH20, and a
 *   fine-print terms line)
 * @output Two-part marketing showcase: the top region demos the banners —
 *   the slim top bar full-bleed above the page column with a changelog link
 *   and a 40px dismiss, the gradient promo panel with a live d/h/m/s
 *   countdown, claim button, and code Token, and the privacy banner floating
 *   fixed at the bottom with Accept all / Manage buttons where Manage
 *   expands an inline consent panel of Switches with a Save choices action —
 *   and the lower region stacks four CTA sections: a centered dark panel
 *   with dual buttons, a split CTA pairing a bullet list with a CSS-drawn
 *   screenshot mock, a gradient brand panel whose email capture validates
 *   and flips to a confirmed state, and a boxed trial CTA with fine print.
 *   Banner dismissals actually remove the banner; a demo toolbar in the
 *   header shows a dismissed-count Badge and per-banner restore Buttons,
 *   and every CTA button fires a corner Toast naming its variant so the
 *   wiring is provable
 * @position Page template; emitted by \`astryx template marketing-cta-banners\`
 *
 * Frame: Layout height="fill". LayoutHeader is the demo toolbar — showcase
 * title on the left, a dismissed-count Badge plus three restore Buttons
 * (one per banner, disabled while its banner is visible) on the right.
 * LayoutContent (padding 0) scrolls the document: the slim top bar renders
 * full-bleed at the very top, then a centered 960px column carries the
 * banner section (promo panel or its dashed restored-from-toolbar
 * placeholder, plus a note card for the floating privacy banner) and the
 * four stacked CTA sections. The privacy banner floats fixed
 * bottom-center (maxWidth 680) and the Toast sits fixed bottom-right above
 * it.
 *
 * Interaction contract:
 * - Each banner's dismiss control actually removes it from the page; the
 *   header toolbar's matching restore Button re-enables and puts it back.
 *   Dismissed slots in the column render dashed placeholders that point at
 *   the toolbar.
 * - The promo countdown starts from the fixed 3d 07:42:18 fixture budget
 *   and decrements once per second while the banner is visible — the start
 *   is deterministic; only the tick cadence is runtime. At zero the chips
 *   swap for an "Offer ended" state and the claim button disables.
 * - Manage preferences expands an inline consent panel: Essential is
 *   locked on, Analytics/Marketing are working Switches, and Save choices
 *   dismisses the banner with a Toast summarizing what was enabled. Accept
 *   all flips every toggle on and dismisses.
 * - The email-capture CTA validates on submit (empty and format errors
 *   render inline) and success swaps the form for a confirmed state that
 *   echoes the address, with a "Use a different email" reset.
 * - Every CTA and banner button fires the corner Toast naming its variant
 *   ("Centered dark panel — Get started clicked", etc.); no dead buttons.
 *
 * Responsive contract:
 * - >760px: the split CTA sits text-left / screenshot-mock-right, the
 *   boxed trial CTA keeps copy left and buttons right, and countdown chips
 *   sit in one row.
 * - <=760px: the split CTA stacks (mock below the bullets) and the boxed
 *   trial CTA stacks its button row under the copy.
 * - <=640px: the toolbar restore Buttons drop their labels to icons, the
 *   top bar wraps its link under the message, CTA headline sizes step
 *   down, the email form stacks the button under the input, and the
 *   privacy banner's action row wraps. All action rows are wrap="wrap" and
 *   the countdown chips wrap, so the page holds at 375px with no
 *   overflow-x.
 * - Tap targets: banner dismiss controls are explicit 40px buttons,
 *   Switches and Buttons carry visible labels, and nothing is hover-only —
 *   Tooltips only annotate controls that also have aria-labels.
 *
 * Container policy (marketing-showcase archetype): the page chrome is
 * frame-first; each banner and CTA variant is its own painted panel or
 * bordered Card inside the document column, with literal fixture gradients
 * locked via colorScheme so they read identically in light and dark app
 * themes. No clocks beyond the fixed-budget countdown tick, no randomness,
 * no network assets or real screenshots — the product shot is a CSS-drawn
 * browser mock.
 *
 * Color policy: the slim top bar, gradient promo banner, centered dark
 * panel, and gradient email-capture panel are deliberately scheme-locked
 * brand surfaces — literal dark/gradient paint plus literal on-dark text
 * (the PAINT CONSTANTS block), each locked with colorScheme:'dark' so the
 * marketing art renders identically in light and dark app themes. Every
 * other surface (privacy banner, Cards, screenshot mock, placeholders)
 * rides the Astryx tokens or explicit light-dark() pairs.
 */

import {useEffect, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowRightIcon,
  CheckIcon,
  CookieIcon,
  MailCheckIcon,
  MegaphoneIcon,
  PlayIcon,
  RotateCcwIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TimerIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

// ============= PAINT CONSTANTS =============
// Painted marketing surfaces use literal fixture colors locked with
// colorScheme:'dark' so the panels read identically in both app themes.

const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.82)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.64)';
const CHIP_BG = 'rgba(255, 255, 255, 0.14)';
const CHIP_BORDER = 'rgba(255, 255, 255, 0.24)';
const ERROR_ON_DARK = '#FECACA';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Document column: 960px cap, page gutters; the top bar and privacy
  // banner live outside it (full bleed and fixed respectively).
  column: {
    width: '100%',
    maxWidth: 960,
    marginInline: 'auto',
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
    // Keep the last CTA clear of the floating privacy banner.
    paddingBottom: 140,
  },
  columnCompact: {
    padding: 'var(--spacing-4)',
    paddingBottom: 168,
  },
  // ---- slim top announcement bar ----
  topBar: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: '#111827',
    backgroundImage:
      'linear-gradient(90deg, rgba(99, 102, 241, 0.35), rgba(17, 24, 39, 0) 55%)',
    padding: 'var(--spacing-2) var(--spacing-4)',
  },
  // ---- gradient promo banner ----
  promo: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    borderRadius: 16,
    backgroundImage: [
      'radial-gradient(80% 90% at 92% 0%, rgba(253, 186, 116, 0.34), transparent 55%)',
      'radial-gradient(70% 90% at 0% 100%, rgba(45, 212, 191, 0.22), transparent 52%)',
      'linear-gradient(120deg, #4C1D95 0%, #7C3AED 55%, #DB2777 100%)',
    ].join(', '),
    padding: 'var(--spacing-6)',
  },
  promoCompact: {
    padding: 'var(--spacing-4)',
  },
  promoRing: {
    position: 'absolute',
    right: -70,
    bottom: -120,
    width: 260,
    height: 260,
    borderRadius: '50%',
    border: '1.5px solid rgba(255, 255, 255, 0.16)',
    pointerEvents: 'none',
  },
  promoChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 999,
    backgroundColor: CHIP_BG,
    border: \`1px solid \${CHIP_BORDER}\`,
    fontSize: 13,
    fontWeight: 600,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
  },
  countdownRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
  countdownUnit: {
    minWidth: 64,
    padding: '8px 10px',
    borderRadius: 10,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
    border: \`1px solid \${CHIP_BORDER}\`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  countdownLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: DARK_TEXT_FAINT,
  },
  // ---- dismissed-banner placeholder ----
  placeholder: {
    border: '1.5px dashed var(--color-border)',
    borderRadius: 12,
    padding: 'var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    color: 'var(--color-text-secondary)',
  },
  // ---- floating privacy banner ----
  privacyWrap: {
    position: 'fixed',
    left: 'var(--spacing-4)',
    right: 'var(--spacing-4)',
    bottom: 'var(--spacing-4)',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 40,
  },
  privacy: {
    pointerEvents: 'auto',
    width: '100%',
    maxWidth: 680,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: 'var(--shadow-high)',
    padding: 'var(--spacing-4)',
  },
  // ---- 40px dismiss buttons (Button caps at 36px) ----
  dismissButton: {
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
    color: 'inherit',
  },
  dismissButtonDark: {
    color: DARK_TEXT_SOFT,
  },
  dismissButtonLight: {
    color: 'var(--color-text-secondary)',
  },
  // ---- centered dark CTA panel ----
  darkPanel: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    borderRadius: 16,
    backgroundImage: [
      'radial-gradient(70% 80% at 50% 0%, rgba(99, 102, 241, 0.35), transparent 60%)',
      'linear-gradient(180deg, #0B1220 0%, #111827 100%)',
    ].join(', '),
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-4)',
  },
  darkPanelCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  ctaHeadline: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  ctaHeadlineCompact: {
    fontSize: 24,
  },
  ctaSubcopy: {
    fontSize: 16,
    lineHeight: 1.5,
    color: DARK_TEXT_SOFT,
    maxWidth: 560,
    margin: 0,
  },
  // ---- split CTA ----
  splitRow: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'center',
  },
  splitRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-4)',
  },
  splitText: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  splitMock: {
    flex: '1 1 0',
    minWidth: 0,
  },
  bulletDisc: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'color-mix(in oklab, var(--color-success) 14%, transparent)',
    color: 'var(--color-success)',
  },
  // ---- CSS-drawn screenshot mock (no imagery) ----
  mockWindow: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-med)',
    backgroundColor: 'var(--color-background-body)',
  },
  mockChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
  },
  mockDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  mockUrl: {
    flex: 1,
    marginLeft: 8,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'var(--color-background-body)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  mockBody: {
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  mockHero: {
    height: 64,
    borderRadius: 8,
    backgroundImage:
      'linear-gradient(120deg, ' +
      'light-dark(rgba(124, 58, 237, 0.30), rgba(139, 92, 246, 0.38)), ' +
      'light-dark(rgba(219, 39, 119, 0.24), rgba(236, 72, 153, 0.32)))',
    border: '1px solid var(--color-border)',
  },
  mockBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  mockCards: {
    display: 'flex',
    gap: 'var(--spacing-2)',
  },
  mockCard: {
    flex: 1,
    height: 56,
    borderRadius: 8,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  // ---- gradient email-capture panel ----
  gradientPanel: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    borderRadius: 16,
    backgroundImage: [
      'radial-gradient(75% 85% at 100% 0%, rgba(253, 224, 71, 0.20), transparent 55%)',
      'linear-gradient(120deg, #0F766E 0%, #0E7490 48%, #4338CA 100%)',
    ].join(', '),
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  gradientPanelCompact: {
    padding: 'var(--spacing-4)',
  },
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    maxWidth: 480,
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
    color: ERROR_ON_DARK,
    fontSize: 13,
    margin: 0,
  },
  successDisc: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: CHIP_BG,
    border: \`1px solid \${CHIP_BORDER}\`,
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
// Deterministic fixtures: fixed copy, a fixed countdown budget, and seeded
// consent toggles. No Date.now, no randomness, no network assets.

type BannerId = 'topbar' | 'promo' | 'privacy';

interface BannerMeta {
  id: BannerId;
  /** Toolbar restore label. */
  label: string;
  /** Variant name used in toast messages. */
  variant: string;
}

const BANNERS: readonly BannerMeta[] = [
  {id: 'topbar', label: 'Top bar', variant: 'Slim top bar'},
  {id: 'promo', label: 'Promo', variant: 'Gradient promo banner'},
  {id: 'privacy', label: 'Privacy', variant: 'Privacy banner'},
];

const TOP_BAR = {
  message: 'Astral 3.0 ships today — new automations, SSO, and a faster editor.',
  linkLabel: 'Read the changelog',
};

// Fixed countdown budget: 3d 07:42:18 against the literal deadline line.
// Only the once-per-second tick is runtime; the start never varies.
const OFFER = {
  kicker: 'Summer launch offer',
  headline: '20% off Astral Pro annual',
  deadlineLine: 'Ends Wednesday, July 8 at 9:00 AM PT',
  code: 'LAUNCH20',
  remainingSeconds: 3 * 86400 + 7 * 3600 + 42 * 60 + 18,
};

interface ConsentOption {
  id: 'essential' | 'analytics' | 'marketing';
  label: string;
  description: string;
  isLocked: boolean;
}

const CONSENT_OPTIONS: readonly ConsentOption[] = [
  {
    id: 'essential',
    label: 'Essential',
    description: 'Sign-in, security, and preferences. Always on.',
    isLocked: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Anonymous usage metrics that help us fix rough edges.',
    isLocked: false,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Personalized offers and launch announcements.',
    isLocked: false,
  },
];

const SPLIT_BULLETS: readonly string[] = [
  'Launch checklists with owner and due-date tracking',
  'Segmented announcements with per-audience preview',
  'Attribution that survives redirects and dark social',
  'A/B copy tests with automatic significance calls',
];

const FINE_PRINT =
  'No credit card required. Trials convert to the Free plan after 30 days ' +
  'unless upgraded. By starting a trial you agree to the Astral Terms of ' +
  'Service and Data Processing Addendum.';

// ============= HELPERS =============

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

interface CountdownParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

function splitCountdown(totalSeconds: number): CountdownParts {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    days: String(days),
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
  };
}

// ============= SMALL PIECES =============

/** Section header: archetype Token kicker + title + supporting copy. */
function SectionHeader({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Heading level={2}>{title}</Heading>
        <Token label={kicker} size="sm" color="purple" />
      </HStack>
      <Text type="supporting" color="secondary">
        {description}
      </Text>
    </VStack>
  );
}

/** 40px dismiss button; tone picks the glyph color for dark/light panels. */
function DismissButton({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: 'dark' | 'light';
  onClick: () => void;
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        style={{
          ...styles.dismissButton,
          ...(tone === 'dark'
            ? styles.dismissButtonDark
            : styles.dismissButtonLight),
        }}>
        <Icon icon={XIcon} size="sm" color="inherit" />
      </button>
    </Tooltip>
  );
}

/** One countdown chip: big tabular value over an uppercase unit label. */
function CountdownUnit({value, unit}: {value: string; unit: string}) {
  return (
    <div style={styles.countdownUnit}>
      <span style={styles.countdownValue}>{value}</span>
      <span style={styles.countdownLabel}>{unit}</span>
    </div>
  );
}

/** Promo-style chip: icon + label pill painted on a gradient surface. */
function PanelChip({
  icon,
  label,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
}) {
  return (
    <span style={styles.promoChip}>
      <Icon icon={icon} size="xsm" color="inherit" />
      {label}
    </span>
  );
}

/** Dashed slot placeholder shown where a dismissed banner used to sit. */
function DismissedPlaceholder({message}: {message: string}) {
  return (
    <div style={styles.placeholder}>
      <Icon icon={RotateCcwIcon} size="sm" color="secondary" />
      <Text type="supporting" color="secondary">
        {message}
      </Text>
    </div>
  );
}

/** CSS-drawn browser screenshot mock — chrome dots, url pill, skeleton
 * hero and cards. Decorative; the bullets carry the information. */
function ScreenshotMock() {
  return (
    <div
      style={styles.mockWindow}
      role="img"
      aria-label="Stylized screenshot of the Astral launch dashboard">
      <div aria-hidden style={styles.mockChrome}>
        <span
          style={{
            ...styles.mockDot,
            backgroundColor: 'light-dark(#F87171, #E05C5C)',
          }}
        />
        <span
          style={{
            ...styles.mockDot,
            backgroundColor: 'light-dark(#FBBF24, #D9A521)',
          }}
        />
        <span
          style={{
            ...styles.mockDot,
            backgroundColor: 'light-dark(#34D399, #2CB586)',
          }}
        />
        <span style={styles.mockUrl}>astral.app/launches/summer-3-0</span>
      </div>
      <div aria-hidden style={styles.mockBody}>
        <div style={styles.mockHero} />
        <div style={{...styles.mockBar, width: '62%'}} />
        <div style={{...styles.mockBar, width: '84%'}} />
        <div style={styles.mockCards}>
          <div style={styles.mockCard} />
          <div style={styles.mockCard} />
          <div style={styles.mockCard} />
        </div>
        <div style={{...styles.mockBar, width: '48%'}} />
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function MarketingCtaBannersTemplate() {
  // ---- banner visibility ----
  const [visibleBanners, setVisibleBanners] = useState<
    Record<BannerId, boolean>
  >({topbar: true, promo: true, privacy: true});

  // ---- promo countdown: fixed budget, one-second cadence ----
  const [remainingSeconds, setRemainingSeconds] = useState(
    OFFER.remainingSeconds,
  );

  // ---- privacy consent ----
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [consent, setConsent] = useState<Record<string, boolean>>({
    essential: true,
    analytics: true,
    marketing: false,
  });

  // ---- email capture ----
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState('');

  // ---- toast: replaced (keyed) so back-to-back clicks re-announce ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );

  // Responsive contract: <=760px stacks split/boxed rows; <=640px drops
  // toolbar labels, steps headlines down, and stacks the email form.
  const isStacked = useMediaQuery('(max-width: 760px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // Countdown: decrement the fixed budget once per second while the promo
  // banner is visible. Deterministic start — only cadence is runtime.
  useEffect(() => {
    if (!visibleBanners.promo || remainingSeconds === 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setRemainingSeconds(previous => (previous > 0 ? previous - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [visibleBanners.promo, remainingSeconds === 0]);

  // ---- derived ----
  const countdown = splitCountdown(remainingSeconds);
  const isOfferEnded = remainingSeconds === 0;
  const dismissedCount = BANNERS.filter(
    banner => !visibleBanners[banner.id],
  ).length;

  // ---- interactions ----
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  const dismissBanner = (id: BannerId) => {
    const meta = BANNERS.find(banner => banner.id === id);
    setVisibleBanners(previous => ({...previous, [id]: false}));
    if (meta) {
      fireToast(\`\${meta.variant} dismissed — restore it from the toolbar.\`);
    }
  };

  const restoreBanner = (id: BannerId) => {
    const meta = BANNERS.find(banner => banner.id === id);
    setVisibleBanners(previous => ({...previous, [id]: true}));
    if (id === 'privacy') {
      setIsManageOpen(false);
    }
    if (meta) {
      fireToast(\`\${meta.variant} restored.\`);
    }
  };

  const acceptAllConsent = () => {
    setConsent({essential: true, analytics: true, marketing: true});
    setVisibleBanners(previous => ({...previous, privacy: false}));
    setIsManageOpen(false);
    fireToast('Privacy banner — Accept all: every category enabled.');
  };

  const saveConsentChoices = () => {
    const enabled = CONSENT_OPTIONS.filter(
      option => consent[option.id],
    ).map(option => option.label);
    setVisibleBanners(previous => ({...previous, privacy: false}));
    setIsManageOpen(false);
    fireToast(\`Privacy banner — saved choices: \${enabled.join(', ')}.\`);
  };

  const toggleConsent = (id: string, value: boolean) => {
    setConsent(previous => ({...previous, [id]: value}));
  };

  const submitEmail = () => {
    const trimmed = email.trim();
    if (trimmed.length === 0) {
      setEmailError('Enter your email to get launch updates.');
      return;
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
      setEmailError("That doesn't look like an email address.");
      return;
    }
    setEmailError(null);
    setIsSubscribed(true);
    setSubscribedEmail(trimmed);
    fireToast(\`Gradient email capture — subscribed \${trimmed}.\`);
  };

  const resetEmail = () => {
    setIsSubscribed(false);
    setSubscribedEmail('');
    setEmail('');
    setEmailError(null);
  };

  // ============= BANNERS =============

  // ---- slim top bar (full bleed above the column) ----
  const topBarBanner = (
    <div style={styles.topBar} role="region" aria-label="Announcement">
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Icon icon={MegaphoneIcon} size="sm" color="inherit" />
        <StackItem size="fill">
          <Text size="sm" color="inherit">
            {TOP_BAR.message}
          </Text>
        </StackItem>
        <Button
          label={TOP_BAR.linkLabel}
          variant="ghost"
          size="sm"
          icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
          onClick={() =>
            fireToast('Slim top bar — Read the changelog clicked.')
          }
        />
        <DismissButton
          label="Dismiss announcement"
          tone="dark"
          onClick={() => dismissBanner('topbar')}
        />
      </HStack>
    </div>
  );

  // ---- gradient promo banner with live countdown ----
  const promoBanner = (
    <div
      style={{...styles.promo, ...(isPhone ? styles.promoCompact : null)}}
      role="region"
      aria-label="Launch offer">
      <div aria-hidden style={styles.promoRing} />
      <HStack gap={3} vAlign="start">
        <StackItem size="fill">
          <VStack gap={3}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <PanelChip icon={SparklesIcon} label={OFFER.kicker} />
              <PanelChip icon={TimerIcon} label={OFFER.deadlineLine} />
            </HStack>
            <h3
              style={{
                ...styles.ctaHeadline,
                ...(isPhone ? styles.ctaHeadlineCompact : null),
              }}>
              {OFFER.headline}
            </h3>
            {isOfferEnded ? (
              <Text color="inherit">
                This offer has ended — watch the top bar for the next drop.
              </Text>
            ) : (
              <div style={styles.countdownRow} aria-live="off">
                <CountdownUnit value={countdown.days} unit="Days" />
                <CountdownUnit value={countdown.hours} unit="Hours" />
                <CountdownUnit value={countdown.minutes} unit="Min" />
                <CountdownUnit value={countdown.seconds} unit="Sec" />
              </div>
            )}
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Button
                label="Claim offer"
                variant="primary"
                icon={<Icon icon={ZapIcon} size="sm" color="inherit" />}
                isDisabled={isOfferEnded}
                onClick={() =>
                  fireToast(
                    \`Gradient promo banner — Claim offer clicked (code \${OFFER.code}).\`,
                  )
                }
              />
              <Token label={\`Code \${OFFER.code}\`} size="sm" color="orange" />
            </HStack>
          </VStack>
        </StackItem>
        <DismissButton
          label="Dismiss launch offer"
          tone="dark"
          onClick={() => dismissBanner('promo')}
        />
      </HStack>
    </div>
  );

  // ---- floating privacy banner ----
  const privacyBanner = (
    <div style={styles.privacyWrap}>
      <div
        style={styles.privacy}
        role="region"
        aria-label="Privacy preferences">
        <VStack gap={3}>
          <HStack gap={3} vAlign="start">
            <Icon icon={CookieIcon} size="md" color="secondary" />
            <StackItem size="fill">
              <VStack gap={1}>
                <Text weight="semibold">We value your privacy</Text>
                <Text type="supporting" color="secondary">
                  Astral uses cookies for sign-in and, with your OK,
                  analytics and marketing. Choose per category or accept
                  everything.
                </Text>
              </VStack>
            </StackItem>
            <DismissButton
              label="Dismiss privacy banner"
              tone="light"
              onClick={() => dismissBanner('privacy')}
            />
          </HStack>

          {isManageOpen && (
            <VStack gap={2}>
              <Divider />
              {CONSENT_OPTIONS.map(option => (
                <HStack key={option.id} gap={3} vAlign="center">
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <HStack gap={2} vAlign="center">
                        <Text size="sm" weight="semibold">
                          {option.label}
                        </Text>
                        {option.isLocked && (
                          <Token label="Always on" size="sm" color="gray" />
                        )}
                      </HStack>
                      <Text type="supporting" color="secondary">
                        {option.description}
                      </Text>
                    </VStack>
                  </StackItem>
                  <Switch
                    label={\`Allow \${option.label.toLowerCase()} cookies\`}
                    isLabelHidden
                    value={consent[option.id]}
                    isDisabled={option.isLocked}
                    onChange={value => toggleConsent(option.id, value)}
                  />
                </HStack>
              ))}
              <Divider />
            </VStack>
          )}

          <HStack gap={2} vAlign="center" wrap="wrap">
            <Button
              label="Accept all"
              variant="primary"
              icon={<Icon icon={ShieldCheckIcon} size="sm" color="inherit" />}
              onClick={acceptAllConsent}
            />
            {isManageOpen ? (
              <Button
                label="Save choices"
                variant="secondary"
                onClick={saveConsentChoices}
              />
            ) : (
              <Button
                label="Manage preferences"
                variant="secondary"
                onClick={() => setIsManageOpen(true)}
              />
            )}
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                You can change this anytime in Settings.
              </Text>
            </StackItem>
          </HStack>
        </VStack>
      </div>
    </div>
  );

  // ============= CTA SECTIONS =============

  // ---- variant 1: centered dark panel with dual buttons ----
  const centeredDarkCta = (
    <div
      style={{
        ...styles.darkPanel,
        ...(isPhone ? styles.darkPanelCompact : null),
      }}>
      <PanelChip icon={ZapIcon} label="Centered dark panel" />
      <h3
        style={{
          ...styles.ctaHeadline,
          ...(isPhone ? styles.ctaHeadlineCompact : null),
        }}>
        Ship your next launch on Astral
      </h3>
      <p style={styles.ctaSubcopy}>
        One workspace for the checklist, the announcement, and the numbers
        the morning after. Teams at 4,200 companies run launch day here.
      </p>
      <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
        <Button
          label="Get started"
          variant="primary"
          icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
          onClick={() =>
            fireToast('Centered dark panel — Get started clicked.')
          }
        />
        <Button
          label="Talk to sales"
          variant="secondary"
          onClick={() =>
            fireToast('Centered dark panel — Talk to sales clicked.')
          }
        />
      </HStack>
      <Text type="supporting" color="inherit" style={{color: DARK_TEXT_FAINT}}>
        Free for teams up to 5 · no credit card
      </Text>
    </div>
  );

  // ---- variant 2: split CTA with bullets and screenshot mock ----
  const splitCta = (
    <Card padding={isPhone ? 4 : 6}>
      <div
        style={{
          ...styles.splitRow,
          ...(isStacked ? styles.splitRowStacked : null),
        }}>
        <div style={styles.splitText}>
          <Token label="Split with screenshot" size="sm" color="blue" />
          <Heading level={3}>Everything your launch team needs</Heading>
          <VStack gap={2}>
            {SPLIT_BULLETS.map(bullet => (
              <HStack key={bullet} gap={2} vAlign="start">
                <div style={styles.bulletDisc}>
                  <Icon icon={CheckIcon} size="xsm" color="inherit" />
                </div>
                <Text type="body">{bullet}</Text>
              </HStack>
            ))}
          </VStack>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Button
              label="Start free trial"
              variant="primary"
              onClick={() =>
                fireToast('Split CTA — Start free trial clicked.')
              }
            />
            <Button
              label="Watch demo"
              variant="ghost"
              icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
              onClick={() => fireToast('Split CTA — Watch demo clicked.')}
            />
          </HStack>
        </div>
        <div style={styles.splitMock}>
          <ScreenshotMock />
        </div>
      </div>
    </Card>
  );

  // ---- variant 3: gradient brand panel with email capture ----
  const emailCta = (
    <div
      style={{
        ...styles.gradientPanel,
        ...(isPhone ? styles.gradientPanelCompact : null),
      }}>
      <PanelChip icon={MegaphoneIcon} label="Gradient email capture" />
      <h3
        style={{
          ...styles.ctaHeadline,
          ...(isPhone ? styles.ctaHeadlineCompact : null),
        }}>
        Be first in line for Astral 3.1
      </h3>
      <p style={styles.ctaSubcopy}>
        Monthly launch notes, zero fluff. Unsubscribe with one click — we
        read the replies.
      </p>
      {isSubscribed ? (
        <HStack gap={3} vAlign="center" wrap="wrap">
          <div style={styles.successDisc}>
            <Icon icon={MailCheckIcon} size="md" color="inherit" />
          </div>
          <StackItem size="fill">
            <VStack gap={0}>
              <Text weight="semibold" color="inherit">
                You're on the list
              </Text>
              <Text
                type="supporting"
                color="inherit"
                style={{color: DARK_TEXT_SOFT}}>
                Launch notes will land at {subscribedEmail}.
              </Text>
            </VStack>
          </StackItem>
          <Button
            label="Use a different email"
            variant="ghost"
            size="sm"
            onClick={resetEmail}
          />
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
                label="Email address"
                isLabelHidden
                placeholder="you@company.com"
                value={email}
                onChange={value => {
                  setEmail(value);
                  if (emailError !== null) {
                    setEmailError(null);
                  }
                }}
              />
            </div>
            <Button
              label="Notify me"
              variant="primary"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              onClick={submitEmail}
            />
          </div>
          {emailError !== null && (
            <p style={styles.emailError} role="alert">
              {emailError}
            </p>
          )}
        </VStack>
      )}
    </div>
  );

  // ---- variant 4: boxed trial CTA with fine print ----
  const boxedTrialCta = (
    <Card padding={isPhone ? 4 : 6}>
      <VStack gap={4}>
        <div
          style={{
            ...styles.splitRow,
            ...(isStacked ? styles.splitRowStacked : null),
          }}>
          <div style={styles.splitText}>
            <Token label="Boxed trial" size="sm" color="green" />
            <Heading level={3}>Start your 30-day Pro trial</Heading>
            <Text type="supporting" color="secondary">
              Full Pro features for a month — unlimited launches, SSO, and
              priority support. Keep your data either way.
            </Text>
          </div>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Button
              label="Start trial"
              variant="primary"
              onClick={() =>
                fireToast('Boxed trial CTA — Start trial clicked.')
              }
            />
            <Button
              label="View pricing"
              variant="secondary"
              onClick={() =>
                fireToast('Boxed trial CTA — View pricing clicked.')
              }
            />
          </HStack>
        </div>
        <Divider />
        <Text type="supporting" color="secondary" size="xsm">
          {FINE_PRINT}
        </Text>
      </VStack>
    </Card>
  );

  // ============= FRAME =============

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider role="banner">
            <HStack gap={2} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={0}>
                  <Heading level={2}>CTA & Banner Showcase</Heading>
                  <Text type="supporting" color="secondary">
                    Demo toolbar — restore dismissed banners
                  </Text>
                </VStack>
              </StackItem>
              <Badge
                label={\`\${dismissedCount} dismissed\`}
                variant={dismissedCount > 0 ? 'info' : undefined}
              />
              {BANNERS.map(banner => (
                <Button
                  key={banner.id}
                  label={isPhone ? banner.label : \`Restore \${banner.label.toLowerCase()}\`}
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
                  isDisabled={visibleBanners[banner.id]}
                  tooltip={
                    visibleBanners[banner.id]
                      ? \`\${banner.variant} is visible\`
                      : \`Bring back the \${banner.variant.toLowerCase()}\`
                  }
                  onClick={() => restoreBanner(banner.id)}
                />
              ))}
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} role="main" label="CTA and banner showcase">
            <VStack gap={0}>
              {/* Slim top bar renders full-bleed above the column. */}
              {visibleBanners.topbar && topBarBanner}

              <div
                style={{
                  ...styles.column,
                  ...(isPhone ? styles.columnCompact : null),
                }}>
                {/* ---- banners region ---- */}
                <SectionHeader
                  kicker="Marketing / Banners"
                  title="Announcement banners"
                  description="Slim top bar, gradient promo with a live countdown, and the floating privacy banner pinned to the bottom of the viewport. Dismissals are real — bring banners back from the toolbar."
                />

                {!visibleBanners.topbar && (
                  <DismissedPlaceholder message="Slim top bar dismissed — restore it from the demo toolbar." />
                )}

                {visibleBanners.promo ? (
                  promoBanner
                ) : (
                  <DismissedPlaceholder message="Gradient promo banner dismissed — restore it from the demo toolbar." />
                )}

                {!visibleBanners.privacy && (
                  <DismissedPlaceholder message="Privacy banner dismissed — restore it from the demo toolbar." />
                )}

                <Divider />

                {/* ---- CTA sections region ---- */}
                <SectionHeader
                  kicker="Marketing / CTA Sections"
                  title="CTA sections"
                  description="Four section variants stacked in page order: centered dark panel, split with screenshot mock, gradient email capture, and a boxed trial with fine print. Every button fires a toast naming its variant."
                />

                {centeredDarkCta}
                {splitCta}
                {emailCta}
                {boxedTrialCta}
              </div>
            </VStack>
          </LayoutContent>
        }
      />

      {/* Floating privacy banner: fixed bottom-center. */}
      {visibleBanners.privacy && privacyBanner}

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
    </>
  );
}
`;export{e as default};