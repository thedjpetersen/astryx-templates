var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (four header-section variants for the
 *   fictional Astral launch platform — a centered header with the
 *   breadcrumb-style eyebrow Resources / Guides / Onboarding, a dark
 *   pattern header with four fixed stat chips (12,400 teams, 99.98%
 *   uptime, 48 integrations, 4.8/5 rating), a split header with
 *   supporting paragraph and dual CTAs, and a category-page header whose
 *   five filter pills carry fixed article counts summing to 70 — plus
 *   three newsletter variants sharing fixture copy: a slim inline bar,
 *   a split benefits panel with three bullets and a privacy note, and a
 *   dark card seeded to the weekly cadence)
 * @output Two-part marketing showcase pairing the top and bottom of a
 *   marketing page. The upper region stacks the four header sections:
 *   simple centered title under a breadcrumb eyebrow, a dark panel with a
 *   CSS grid-pattern background and stat chips, a split header whose Start
 *   free / Book a demo Buttons fire receipt Toasts, and a category header
 *   whose filter pills genuinely toggle active styling and recompute a
 *   "Showing N articles" line from fixed per-topic counts. The lower
 *   region stacks the three newsletter sections — slim inline signup bar,
 *   split panel with benefit bullets and a privacy note, and a dark card
 *   with a weekly/monthly frequency RadioList — all three running the same
 *   validated email flow (empty and format errors inline) but swapping to
 *   distinct success states with their own reset actions. A jump rail in
 *   the header labels every variant and scrolls the document to it, and a
 *   subscribed-count Badge proves the three forms hold independent state
 * @position Page template; emitted by \`astryx template
 *   marketing-header-newsletter\`
 *
 * Frame: Layout height="fill". LayoutHeader is the demo toolbar — showcase
 * title on the left, a subscribed-count Badge, and the jump rail: seven
 * labeled chip Buttons (>640px) or a compact Selector (<=640px), either of
 * which scrolls the matching variant into view. LayoutContent (padding 0)
 * scrolls the document: a centered 960px column stacking the header-section
 * region (four variants) over the newsletter region (three variants), each
 * variant carrying a copy-ready kicker Token that matches its rail label.
 *
 * Interaction contract:
 * - The jump rail is real navigation: every rail chip (or Selector option)
 *   scrolls its variant into view with scrollIntoView on the section ref;
 *   the Selector tracks the last jumped variant as its value.
 * - The category header's filter pills actually toggle: each pill flips
 *   active styling via aria-pressed, "All topics" clears the selection,
 *   picking any topic deselects All, and the results line recomputes
 *   ("Showing all 70 articles" vs the sum of the active topics' counts).
 * - All three newsletter forms share validated email handling (one hook):
 *   submit with an empty field or a non-address renders an inline error
 *   under that form only; typing clears it. Success states are distinct —
 *   the slim bar swaps to a single confirmation row with Undo, the split
 *   panel swaps its form column for a check-your-inbox card with a
 *   different-email reset, and the dark card echoes the chosen cadence.
 * - The dark card's weekly/monthly frequency RadioList is controlled state
 *   and its choice is echoed by both the success copy and the receipt
 *   Toast; resetting keeps the cadence but clears the address.
 * - The split header's Start free and Book a demo Buttons fire the corner
 *   Toast naming the variant, as does every successful subscribe — no dead
 *   buttons anywhere on the page.
 *
 * Responsive contract:
 * - >760px: the split header sits copy-left / CTA-right, the split
 *   newsletter panel is two columns (benefits | form), and dark-header
 *   stat chips share one row.
 * - <=760px: the split header stacks its CTA column under the paragraph
 *   and the split newsletter panel stacks the form under the bullets;
 *   stat chips wrap onto two rows.
 * - <=640px: the jump rail collapses from labeled chips to a Selector so
 *   the toolbar stays two rows max; variant headlines step down
 *   (32 -> 24); column padding tightens; the slim bar stacks its button
 *   under the input at full width.
 * - Tap targets: filter pills are explicit 40px-tall buttons, rail chips
 *   and form Buttons carry visible labels, and nothing is hover-only.
 *   Pill rows, chip rows, stat rows, and CTA rows all wrap, so the page
 *   holds at 375px with no overflow-x.
 *
 * Container policy (marketing-showcase archetype): the page chrome is
 * frame-first; each variant is its own bordered Card or painted panel in
 * the document column. Dark surfaces use literal fixture gradients locked
 * with colorScheme:'dark' so they read identically in light and dark app
 * themes. No clocks, no randomness, no network assets or real imagery —
 * the dark header's texture is a pure CSS grid pattern.
 *
 * Color policy: everything on Card/frame surfaces is token-driven
 * (var(--color-*)) and adapts to the app scheme. The two painted marketing
 * panels — the dark pattern header (variant 2) and the dark newsletter
 * card (variant 7) — are deliberately scheme-locked brand art: their
 * gradients, chip fills/borders, and on-panel text/error literals
 * (DARK_TEXT*, CHIP_*, ERROR_ON_DARK) stay raw hex/rgba with
 * colorScheme:'dark' set on the panel style so they render identically in
 * both app themes and the literal text keeps its contrast on the locked
 * paint.
 */

import {useRef, useState, type CSSProperties} from 'react';

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
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowRightIcon,
  BellRingIcon,
  CalendarDaysIcon,
  CheckIcon,
  GaugeIcon,
  InboxIcon,
  LockIcon,
  MailCheckIcon,
  MailIcon,
  PlugZapIcon,
  RotateCcwIcon,
  SendIcon,
  SparklesIcon,
  StarIcon,
  UsersIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

// ============= PAINT CONSTANTS =============
// Painted marketing surfaces use literal fixture colors locked with
// colorScheme:'dark' so the panels read identically in both app themes.

const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.84)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.62)';
const CHIP_BG = 'rgba(255, 255, 255, 0.10)';
const CHIP_BORDER = 'rgba(255, 255, 255, 0.22)';
const ERROR_ON_DARK = '#FECACA';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Document column: 960px cap, page gutters.
  column: {
    width: '100%',
    maxWidth: 960,
    marginInline: 'auto',
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  columnCompact: {
    padding: 'var(--spacing-4)',
  },
  // Anchored variant wrapper: small scroll margin so a jumped-to section
  // never lands flush against the frame edge.
  sectionAnchor: {
    scrollMarginTop: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  // Shared marketing headline scale (h3 elements — the page's real
  // Headings are the showcase section titles).
  headline: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  headlineCompact: {
    fontSize: 24,
  },
  subcopy: {
    fontSize: 16,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 620,
    margin: 0,
  },
  subcopyOnDark: {
    fontSize: 16,
    lineHeight: 1.55,
    color: DARK_TEXT_SOFT,
    maxWidth: 620,
    margin: 0,
  },
  // ---- variant 1: simple centered header ----
  centeredBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-4)',
  },
  eyebrowWrap: {
    display: 'flex',
    justifyContent: 'center',
  },
  centeredMetaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  // ---- variant 2: dark pattern header ----
  darkHeader: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    borderRadius: 16,
    backgroundImage: [
      // Faint blueprint grid over the dusk base — pure CSS, no imagery.
      'repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 40px)',
      'repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 40px)',
      'radial-gradient(70% 90% at 85% 0%, rgba(99, 102, 241, 0.42), transparent 58%)',
      'radial-gradient(60% 80% at 0% 100%, rgba(45, 212, 191, 0.20), transparent 52%)',
      'linear-gradient(180deg, #0B1220 0%, #131C31 100%)',
    ].join(', '),
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  darkHeaderCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  panelChip: {
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
    alignSelf: 'flex-start',
  },
  statRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
  statChip: {
    minWidth: 128,
    padding: '10px 14px',
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    border: \`1px solid \${CHIP_BORDER}\`,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.15,
    fontVariantNumeric: 'tabular-nums',
  },
  statLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: DARK_TEXT_FAINT,
  },
  // ---- variants 3 & 6: split rows ----
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
  splitSide: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  splitFormCol: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  // ---- variant 4: category header filter pills ----
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
  // Explicit 40px-tall pills so every filter clears the tap-target bar at
  // any viewport width.
  pill: {
    minHeight: 40,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    fontSize: 14,
    fontWeight: 600,
    lineHeight: '20px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  pillActive: {
    backgroundColor: 'var(--color-accent)',
    borderColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  pillCount: {
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    opacity: 0.75,
  },
  // ---- newsletter forms ----
  formRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
  },
  formRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  formInput: {
    flex: '1 1 0',
    minWidth: 0,
  },
  fieldError: {
    color: 'var(--color-error)',
    fontSize: 13,
    margin: 0,
  },
  fieldErrorOnDark: {
    color: ERROR_ON_DARK,
    fontSize: 13,
    margin: 0,
  },
  iconDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'var(--color-accent-muted)',
    color: 'var(--color-accent)',
  },
  successDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'var(--color-success-muted)',
    color: 'var(--color-success)',
  },
  successDiscOnDark: {
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
  benefitDisc: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'var(--color-success-muted)',
    color: 'var(--color-success)',
  },
  privacyNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    color: 'var(--color-text-secondary)',
  },
  // ---- variant 7: dark newsletter card ----
  darkCard: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    borderRadius: 16,
    backgroundImage: [
      'radial-gradient(75% 85% at 100% 0%, rgba(253, 186, 116, 0.22), transparent 55%)',
      'radial-gradient(60% 80% at 0% 100%, rgba(94, 234, 212, 0.16), transparent 52%)',
      'linear-gradient(120deg, #312E81 0%, #4338CA 52%, #6D28D9 100%)',
    ].join(', '),
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  darkCardCompact: {
    padding: 'var(--spacing-4)',
  },
  darkCardRing: {
    position: 'absolute',
    right: -80,
    top: -110,
    width: 260,
    height: 260,
    borderRadius: '50%',
    border: '1.5px solid rgba(255, 255, 255, 0.14)',
    pointerEvents: 'none',
  },
  darkCardInner: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    maxWidth: 560,
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
// Deterministic fixtures: fixed copy, fixed stats, and fixed per-topic
// article counts. No Date.now, no randomness, no network assets.

type VariantId =
  | 'centered'
  | 'dark-stats'
  | 'split-cta'
  | 'category'
  | 'slim-bar'
  | 'split-signup'
  | 'dark-card';

interface VariantMeta {
  id: VariantId;
  /** Short jump-rail label. */
  railLabel: string;
  /** Copy-ready kicker shown on the variant panel itself. */
  kicker: string;
  kickerColor: 'purple' | 'blue' | 'green' | 'orange' | 'teal' | 'gray';
}

const VARIANTS: readonly VariantMeta[] = [
  {
    id: 'centered',
    railLabel: 'Centered',
    kicker: 'Header 01 · Centered + eyebrow',
    kickerColor: 'purple',
  },
  {
    id: 'dark-stats',
    railLabel: 'Dark stats',
    kicker: 'Header 02 · Dark pattern + stats',
    kickerColor: 'purple',
  },
  {
    id: 'split-cta',
    railLabel: 'Split CTA',
    kicker: 'Header 03 · Split + CTA',
    kickerColor: 'purple',
  },
  {
    id: 'category',
    railLabel: 'Category',
    kicker: 'Header 04 · Category + filters',
    kickerColor: 'purple',
  },
  {
    id: 'slim-bar',
    railLabel: 'Slim bar',
    kicker: 'Newsletter 01 · Slim inline bar',
    kickerColor: 'teal',
  },
  {
    id: 'split-signup',
    railLabel: 'Split signup',
    kicker: 'Newsletter 02 · Split benefits panel',
    kickerColor: 'teal',
  },
  {
    id: 'dark-card',
    railLabel: 'Dark card',
    kicker: 'Newsletter 03 · Dark card + cadence',
    kickerColor: 'teal',
  },
];

const JUMP_OPTIONS = VARIANTS.map(variant => ({
  value: variant.id,
  label: variant.railLabel,
}));

// ---- variant 1: centered header ----

const CENTERED_HEADER = {
  crumbs: ['Resources', 'Guides'],
  current: 'Onboarding',
  title: 'Everything you need to onboard your team',
  subcopy:
    'Fourteen field-tested guides covering workspace setup, imports, roles, and the first launch — written by the team that answers the support inbox.',
  metaLine: 'Updated June 2026 · 14 guides · 25 min total read',
};

// ---- variant 2: dark pattern header with stat chips ----

interface StatChipData {
  value: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const DARK_HEADER = {
  chip: 'Platform',
  title: 'The numbers behind launch day',
  subcopy:
    'Astral runs the checklist, the announcement, and the morning-after dashboard for teams of every size — here is what that looks like at scale.',
};

const DARK_STATS: readonly StatChipData[] = [
  {value: '12,400', label: 'Teams', icon: UsersIcon},
  {value: '99.98%', label: 'Uptime', icon: GaugeIcon},
  {value: '48', label: 'Integrations', icon: PlugZapIcon},
  {value: '4.8/5', label: 'G2 rating', icon: StarIcon},
];

// ---- variant 3: split header with supporting paragraph and CTA ----

const SPLIT_HEADER = {
  kicker: 'For launch teams',
  title: 'Run launch day from one workspace',
  paragraph:
    'Stop stitching together spreadsheets, status channels, and a countdown doc. Astral keeps the checklist, the comms calendar, and the rollback plan on one page — so the only surprise on launch day is how quiet it is.',
  finePrint: 'Free for teams up to 5 · no credit card required',
};

// ---- variant 4: category header with filter pills ----

interface CategoryPill {
  id: string;
  label: string;
  count: number;
}

const CATEGORY_HEADER = {
  title: 'The Astral blog',
  subcopy:
    'Ship notes, teardown posts, and the occasional strong opinion about release checklists. Filter by topic — pills combine.',
};

const CATEGORY_PILLS: readonly CategoryPill[] = [
  {id: 'product', label: 'Product', count: 24},
  {id: 'engineering', label: 'Engineering', count: 18},
  {id: 'design', label: 'Design', count: 12},
  {id: 'culture', label: 'Culture', count: 7},
  {id: 'announcements', label: 'Announcements', count: 9},
];

const TOTAL_ARTICLES = CATEGORY_PILLS.reduce(
  (sum, pill) => sum + pill.count,
  0,
);

// ---- newsletter fixtures ----

const SLIM_BAR = {
  title: 'Get the monthly ship notes',
  subcopy: 'One email a month — what shipped, what broke, what we learned.',
};

const SPLIT_SIGNUP = {
  title: 'The launch-day briefing',
  subcopy:
    'Everything worth reading before your next release, curated by the Astral crew.',
  benefits: [
    'A teardown of one real launch every issue — what worked and what got rolled back',
    'Checklist templates you can import straight into your workspace',
    'Early invites to roadmap AMAs before they hit the public calendar',
  ],
  privacyNote:
    'We only use your address for the briefing. No sharing, no selling, one-click unsubscribe — read the privacy policy for the fine print.',
};

const DARK_CARD = {
  chip: 'Astral digest',
  title: 'Pick your cadence, then never miss a drop',
  subcopy:
    'The digest rounds up product updates, platform stats, and the best posts from the community — at whichever pace suits your inbox.',
};

type Frequency = 'weekly' | 'monthly';

const FREQUENCY_OPTIONS: ReadonlyArray<{
  value: Frequency;
  label: string;
  description: string;
}> = [
  {
    value: 'weekly',
    label: 'Weekly',
    description: 'Every Monday morning — short and skimmable.',
  },
  {
    value: 'monthly',
    label: 'Monthly',
    description: 'First Tuesday of the month — the deep-dive edition.',
  },
];

// ============= HELPERS =============

const EMAIL_PATTERN = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

/**
 * Shared validated-email handling for all three newsletter forms. Each
 * form owns an independent instance, so errors and success states never
 * bleed between variants.
 */
function useEmailSignup(onConfirmed: (email: string) => void) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  const change = (value: string) => {
    setEmail(value);
    if (error !== null) {
      setError(null);
    }
  };

  const submit = () => {
    const trimmed = email.trim();
    if (trimmed.length === 0) {
      setError('Enter your email to subscribe.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("That doesn't look like an email address.");
      return;
    }
    setError(null);
    setConfirmedEmail(trimmed);
    onConfirmed(trimmed);
  };

  const reset = () => {
    setEmail('');
    setError(null);
    setConfirmedEmail(null);
  };

  return {email, error, confirmedEmail, change, submit, reset};
}

type EmailSignup = ReturnType<typeof useEmailSignup>;

// ============= SMALL PIECES =============

/** Showcase region header: title + archetype Token + supporting copy. */
function RegionHeader({
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

/** Copy-ready variant kicker matching the jump-rail label. */
function VariantKicker({meta}: {meta: VariantMeta}) {
  return <Token label={meta.kicker} size="sm" color={meta.kickerColor} />;
}

/** Icon + label pill painted on a dark gradient surface. */
function PanelChip({
  icon,
  label,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
}) {
  return (
    <span style={styles.panelChip}>
      <Icon icon={icon} size="xsm" color="inherit" />
      {label}
    </span>
  );
}

/** One dark-header stat chip: tabular value over an uppercase label. */
function StatChip({stat}: {stat: StatChipData}) {
  return (
    <div style={styles.statChip}>
      <span style={styles.statValue}>{stat.value}</span>
      <span style={styles.statLabel}>
        <Icon icon={stat.icon} size="xsm" color="inherit" />
        {stat.label}
      </span>
    </div>
  );
}

/** One 40px filter pill; active styling flips via aria-pressed state. */
function FilterPill({
  label,
  count,
  isActive,
  onToggle,
}: {
  label: string;
  count?: number;
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onToggle}
      style={{...styles.pill, ...(isActive ? styles.pillActive : null)}}>
      {label}
      {count !== undefined && <span style={styles.pillCount}>{count}</span>}
    </button>
  );
}

/** One benefit bullet with a tinted check disc. */
function BenefitRow({text}: {text: string}) {
  return (
    <HStack gap={2} vAlign="start">
      <div style={styles.benefitDisc}>
        <Icon icon={CheckIcon} size="xsm" color="inherit" />
      </div>
      <Text type="body">{text}</Text>
    </HStack>
  );
}

// ============= PAGE =============

export default function MarketingHeaderNewsletterTemplate() {
  // ---- toast: replaced (keyed) so back-to-back clicks re-announce ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );

  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  // ---- jump rail ----
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [jumpValue, setJumpValue] = useState<VariantId>('centered');

  const jumpToVariant = (value: string) => {
    setJumpValue(value as VariantId);
    sectionRefs.current[value]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // ---- category filter pills ----
  const [activeTopics, setActiveTopics] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleTopic = (id: string) => {
    setActiveTopics(previous => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearTopics = () => setActiveTopics(new Set());

  // ---- newsletter forms: three independent validated signups ----
  const [frequency, setFrequency] = useState<Frequency>('weekly');

  const slimSignup = useEmailSignup(email =>
    fireToast(\`Slim inline bar — subscribed \${email}.\`),
  );
  const splitSignup = useEmailSignup(email =>
    fireToast(\`Split benefits panel — confirmation sent to \${email}.\`),
  );
  const darkSignup = useEmailSignup(email =>
    fireToast(\`Dark card — \${frequency} digest heading to \${email}.\`),
  );

  // Responsive contract: <=760px stacks split rows; <=640px collapses the
  // rail to a Selector, steps headlines down, and stacks the slim bar.
  const isStacked = useMediaQuery('(max-width: 760px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // ---- derived ----
  const subscribedCount = [slimSignup, splitSignup, darkSignup].filter(
    signup => signup.confirmedEmail !== null,
  ).length;

  const activeTopicCount = activeTopics.size;
  const visibleArticleCount =
    activeTopicCount === 0
      ? TOTAL_ARTICLES
      : CATEGORY_PILLS.filter(pill => activeTopics.has(pill.id)).reduce(
          (sum, pill) => sum + pill.count,
          0,
        );
  const resultsLine =
    activeTopicCount === 0
      ? \`Showing all \${TOTAL_ARTICLES} articles\`
      : \`Showing \${visibleArticleCount} articles across \${activeTopicCount} \${
          activeTopicCount === 1 ? 'topic' : 'topics'
        }\`;

  const headlineStyle = {
    ...styles.headline,
    ...(isPhone ? styles.headlineCompact : null),
  };

  const chosenFrequency = FREQUENCY_OPTIONS.find(
    option => option.value === frequency,
  );

  // Anchored wrapper shared by every variant section.
  const anchored = (id: VariantId, node: React.ReactNode) => (
    <div
      ref={element => {
        sectionRefs.current[id] = element;
      }}
      style={styles.sectionAnchor}>
      {node}
    </div>
  );

  // ============= HEADER SECTION VARIANTS =============

  // ---- variant 1: simple centered title with breadcrumb eyebrow ----
  const centeredHeader = (
    <Card padding={isPhone ? 4 : 6}>
      <VStack gap={3}>
        <VariantKicker meta={VARIANTS[0]} />
        <div style={styles.centeredBody}>
          <div style={styles.eyebrowWrap}>
            <Breadcrumbs label="Guide location">
              {CENTERED_HEADER.crumbs.map(crumb => (
                <BreadcrumbItem key={crumb} href="#">
                  {crumb}
                </BreadcrumbItem>
              ))}
              <BreadcrumbItem isCurrent>
                {CENTERED_HEADER.current}
              </BreadcrumbItem>
            </Breadcrumbs>
          </div>
          <h3 style={headlineStyle}>{CENTERED_HEADER.title}</h3>
          <p style={{...styles.subcopy, marginInline: 'auto'}}>
            {CENTERED_HEADER.subcopy}
          </p>
          <div style={styles.centeredMetaRow}>
            <Icon icon={CalendarDaysIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">
              {CENTERED_HEADER.metaLine}
            </Text>
          </div>
        </div>
      </VStack>
    </Card>
  );

  // ---- variant 2: dark header with background pattern + stat chips ----
  const darkStatsHeader = (
    <VStack gap={3}>
      <VariantKicker meta={VARIANTS[1]} />
      <div
        style={{
          ...styles.darkHeader,
          ...(isPhone ? styles.darkHeaderCompact : null),
        }}>
        <PanelChip icon={SparklesIcon} label={DARK_HEADER.chip} />
        <h3 style={headlineStyle}>{DARK_HEADER.title}</h3>
        <p style={styles.subcopyOnDark}>{DARK_HEADER.subcopy}</p>
        <div style={styles.statRow}>
          {DARK_STATS.map(stat => (
            <StatChip key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </VStack>
  );

  // ---- variant 3: split header with paragraph and CTA column ----
  const splitCtaHeader = (
    <Card padding={isPhone ? 4 : 6}>
      <VStack gap={3}>
        <VariantKicker meta={VARIANTS[2]} />
        <div
          style={{
            ...styles.splitRow,
            ...(isStacked ? styles.splitRowStacked : null),
          }}>
          <div style={styles.splitText}>
            <Token label={SPLIT_HEADER.kicker} size="sm" color="blue" />
            <h3 style={headlineStyle}>{SPLIT_HEADER.title}</h3>
            <p style={styles.subcopy}>{SPLIT_HEADER.paragraph}</p>
          </div>
          <div style={styles.splitSide}>
            <Button
              label="Start free"
              variant="primary"
              icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
              onClick={() => fireToast('Split header — Start free clicked.')}
            />
            <Button
              label="Book a demo"
              variant="secondary"
              onClick={() => fireToast('Split header — Book a demo clicked.')}
            />
            <Text type="supporting" color="secondary">
              {SPLIT_HEADER.finePrint}
            </Text>
          </div>
        </div>
      </VStack>
    </Card>
  );

  // ---- variant 4: category-page header with working filter pills ----
  const categoryHeader = (
    <Card padding={isPhone ? 4 : 6}>
      <VStack gap={3}>
        <VariantKicker meta={VARIANTS[3]} />
        <h3 style={headlineStyle}>{CATEGORY_HEADER.title}</h3>
        <p style={styles.subcopy}>{CATEGORY_HEADER.subcopy}</p>
        <div style={styles.pillRow} role="group" aria-label="Filter by topic">
          <FilterPill
            label="All topics"
            isActive={activeTopicCount === 0}
            onToggle={clearTopics}
          />
          {CATEGORY_PILLS.map(pill => (
            <FilterPill
              key={pill.id}
              label={pill.label}
              count={pill.count}
              isActive={activeTopics.has(pill.id)}
              onToggle={() => toggleTopic(pill.id)}
            />
          ))}
        </div>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Text type="supporting" color="secondary" aria-live="polite">
            {resultsLine}
          </Text>
          {activeTopicCount > 0 && (
            <Button
              label="Clear filters"
              variant="ghost"
              size="sm"
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              onClick={clearTopics}
            />
          )}
        </HStack>
      </VStack>
    </Card>
  );

  // ============= NEWSLETTER SECTION VARIANTS =============

  // ---- variant 5: slim inline signup bar ----
  const slimForm = (
    <VStack gap={1}>
      <div
        style={{
          ...styles.formRow,
          ...(isPhone ? styles.formRowStacked : null),
          ...(isPhone ? null : {minWidth: 300}),
        }}>
        <div style={styles.formInput}>
          <TextInput
            label="Email for ship notes"
            isLabelHidden
            placeholder="you@company.com"
            value={slimSignup.email}
            onChange={slimSignup.change}
            onEnter={slimSignup.submit}
          />
        </div>
        <Button
          label="Subscribe"
          variant="primary"
          icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
          onClick={slimSignup.submit}
        />
      </div>
      {slimSignup.error !== null && (
        <p style={styles.fieldError} role="alert">
          {slimSignup.error}
        </p>
      )}
    </VStack>
  );

  const slimBar = (
    <Card padding={4}>
      <VStack gap={3}>
        <VariantKicker meta={VARIANTS[4]} />
        {slimSignup.confirmedEmail === null ? (
          <HStack gap={3} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
            <div style={styles.iconDisc}>
              <Icon icon={MailIcon} size="sm" color="inherit" />
            </div>
            <StackItem size="fill">
              <VStack gap={0}>
                <Text weight="semibold">{SLIM_BAR.title}</Text>
                <Text type="supporting" color="secondary">
                  {SLIM_BAR.subcopy}
                </Text>
              </VStack>
            </StackItem>
            <StackItem size={isPhone ? 'fill' : 'static'}>
              {slimForm}
            </StackItem>
          </HStack>
        ) : (
          // Success state A: the whole bar collapses to one confirmation
          // row with an Undo escape hatch.
          <HStack gap={3} vAlign="center" wrap="wrap">
            <div style={styles.successDisc}>
              <Icon icon={CheckIcon} size="sm" color="inherit" />
            </div>
            <StackItem size="fill">
              <VStack gap={0}>
                <Text weight="semibold">You're on the list</Text>
                <Text type="supporting" color="secondary">
                  Ship notes land at {slimSignup.confirmedEmail} once a month.
                </Text>
              </VStack>
            </StackItem>
            <Button
              label="Undo"
              variant="ghost"
              size="sm"
              onClick={slimSignup.reset}
            />
          </HStack>
        )}
      </VStack>
    </Card>
  );

  // ---- variant 6: split panel with benefit bullets + privacy note ----
  const splitPanelForm =
    splitSignup.confirmedEmail === null ? (
      <div style={styles.splitFormCol}>
        <Text weight="semibold">Join 6,200 readers</Text>
        <TextInput
          label="Work email"
          placeholder="you@company.com"
          value={splitSignup.email}
          onChange={splitSignup.change}
          onEnter={splitSignup.submit}
        />
        {splitSignup.error !== null && (
          <p style={styles.fieldError} role="alert">
            {splitSignup.error}
          </p>
        )}
        <Button
          label="Get the briefing"
          variant="primary"
          icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
          onClick={splitSignup.submit}
        />
        <div style={styles.privacyNote}>
          <Icon icon={LockIcon} size="xsm" color="inherit" />
          <Text type="supporting" color="secondary">
            {SPLIT_SIGNUP.privacyNote}
          </Text>
        </div>
      </div>
    ) : (
      // Success state B: a check-your-inbox card — different copy and a
      // different reset affordance from the slim bar's Undo row.
      <div style={styles.splitFormCol}>
        <HStack gap={3} vAlign="start">
          <div style={styles.successDisc}>
            <Icon icon={InboxIcon} size="sm" color="inherit" />
          </div>
          <StackItem size="fill">
            <VStack gap={1}>
              <Text weight="semibold">Check your inbox</Text>
              <Text type="supporting" color="secondary">
                We sent a confirmation link to {splitSignup.confirmedEmail}.
                Click it within 24 hours to start receiving the briefing.
              </Text>
            </VStack>
          </StackItem>
        </HStack>
        <Button
          label="Use a different email"
          variant="secondary"
          size="sm"
          onClick={splitSignup.reset}
        />
      </div>
    );

  const splitSignupPanel = (
    <Card padding={isPhone ? 4 : 6}>
      <VStack gap={3}>
        <VariantKicker meta={VARIANTS[5]} />
        <div
          style={{
            ...styles.splitRow,
            ...(isStacked ? styles.splitRowStacked : null),
            alignItems: isStacked ? 'stretch' : 'flex-start',
          }}>
          <div style={styles.splitText}>
            <Heading level={3}>{SPLIT_SIGNUP.title}</Heading>
            <Text type="supporting" color="secondary">
              {SPLIT_SIGNUP.subcopy}
            </Text>
            <VStack gap={2}>
              {SPLIT_SIGNUP.benefits.map(benefit => (
                <BenefitRow key={benefit} text={benefit} />
              ))}
            </VStack>
          </div>
          {splitPanelForm}
        </div>
      </VStack>
    </Card>
  );

  // ---- variant 7: dark card with weekly/monthly frequency Radio ----
  const darkCardBody =
    darkSignup.confirmedEmail === null ? (
      <>
        {/* colorScheme:'dark' on the panel locks tokens to their dark
            values, so the RadioList reads correctly on the gradient. */}
        <RadioList
          label="Digest frequency"
          value={frequency}
          onChange={value => setFrequency(value as Frequency)}>
          {FREQUENCY_OPTIONS.map(option => (
            <RadioListItem
              key={option.value}
              label={option.label}
              value={option.value}
              description={option.description}
            />
          ))}
        </RadioList>
        <VStack gap={1}>
          <div
            style={{
              ...styles.formRow,
              ...(isPhone ? styles.formRowStacked : null),
            }}>
            <div style={styles.formInput}>
              <TextInput
                label="Email for the digest"
                isLabelHidden
                placeholder="you@company.com"
                value={darkSignup.email}
                onChange={darkSignup.change}
                onEnter={darkSignup.submit}
              />
            </div>
            <Button
              label="Subscribe"
              variant="primary"
              icon={<Icon icon={BellRingIcon} size="sm" color="inherit" />}
              onClick={darkSignup.submit}
            />
          </div>
          {darkSignup.error !== null && (
            <p style={styles.fieldErrorOnDark} role="alert">
              {darkSignup.error}
            </p>
          )}
        </VStack>
      </>
    ) : (
      // Success state C: echoes the chosen cadence; the reset keeps the
      // frequency selection but clears the address.
      <HStack gap={3} vAlign="center" wrap="wrap">
        <div style={styles.successDiscOnDark}>
          <Icon icon={MailCheckIcon} size="md" color="inherit" />
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text weight="semibold" color="inherit">
              {chosenFrequency?.label} digest confirmed
            </Text>
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_SOFT}}>
              First issue heading to {darkSignup.confirmedEmail} —{' '}
              {chosenFrequency?.description.toLowerCase()}
            </Text>
          </VStack>
        </StackItem>
        <Button
          label="Change email or cadence"
          variant="ghost"
          size="sm"
          onClick={darkSignup.reset}
        />
      </HStack>
    );

  const darkNewsletterCard = (
    <VStack gap={3}>
      <VariantKicker meta={VARIANTS[6]} />
      <div
        style={{
          ...styles.darkCard,
          ...(isPhone ? styles.darkCardCompact : null),
        }}>
        <div aria-hidden style={styles.darkCardRing} />
        <div style={styles.darkCardInner}>
          <PanelChip icon={BellRingIcon} label={DARK_CARD.chip} />
          <h3 style={headlineStyle}>{DARK_CARD.title}</h3>
          <p style={styles.subcopyOnDark}>{DARK_CARD.subcopy}</p>
          {darkCardBody}
        </div>
      </div>
    </VStack>
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
                  <Heading level={2}>Headers & Newsletter Showcase</Heading>
                  <Text type="supporting" color="secondary">
                    Jump rail — every variant is labeled for copy-ready
                    reference
                  </Text>
                </VStack>
              </StackItem>
              <Badge
                label={\`\${subscribedCount} of 3 subscribed\`}
                variant={subscribedCount > 0 ? 'green' : undefined}
              />
              {isPhone ? (
                <Selector
                  label="Jump to variant"
                  isLabelHidden
                  size="sm"
                  options={JUMP_OPTIONS}
                  value={jumpValue}
                  onChange={jumpToVariant}
                />
              ) : (
                <HStack gap={1} vAlign="center" wrap="wrap">
                  {VARIANTS.map(variant => (
                    <Button
                      key={variant.id}
                      label={variant.railLabel}
                      size="sm"
                      variant={
                        jumpValue === variant.id ? 'secondary' : 'ghost'
                      }
                      tooltip={variant.kicker}
                      onClick={() => jumpToVariant(variant.id)}
                    />
                  ))}
                </HStack>
              )}
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent
            padding={0}
            role="main"
            label="Header and newsletter showcase">
            <div
              style={{
                ...styles.column,
                ...(isPhone ? styles.columnCompact : null),
              }}>
              {/* ---- header sections region ---- */}
              <RegionHeader
                kicker="Marketing / Header Sections"
                title="Header sections"
                description="Four ways to open a marketing page: centered with a breadcrumb eyebrow, dark pattern with stat chips, split with a supporting paragraph and CTAs, and a category page whose filter pills really toggle."
              />

              {anchored('centered', centeredHeader)}
              {anchored('dark-stats', darkStatsHeader)}
              {anchored('split-cta', splitCtaHeader)}
              {anchored('category', categoryHeader)}

              <Divider />

              {/* ---- newsletter sections region ---- */}
              <RegionHeader
                kicker="Marketing / Newsletter Sections"
                title="Newsletter sections"
                description="Three signup surfaces sharing one validated email flow but landing in distinct success states: a slim inline bar, a split benefits panel with a privacy note, and a dark card with a weekly/monthly cadence choice."
              />

              {anchored('slim-bar', slimBar)}
              {anchored('split-signup', splitSignupPanel)}
              {anchored('dark-card', darkNewsletterCard)}
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
    </>
  );
}
`;export{e as default};