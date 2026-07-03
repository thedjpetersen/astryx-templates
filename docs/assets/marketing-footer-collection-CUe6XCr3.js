var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file marketing-footer-collection.tsx
 * @input Deterministic fixtures only (the "Relay" brand link taxonomy —
 *   Product, Company, Resources, Legal — shared across every variant so
 *   the five footers stay comparable; five language entries with fixed
 *   translated taglines; five currency entries with fixed per-currency
 *   Relay Pro prices; five region entries with fixed date-format samples;
 *   social handles and variant metadata)
 * @output Marketing footer showcase: five labeled footer variants stacked
 *   as a scrolling collection — a 4-column sitemap footer with a
 *   validating newsletter mini-form, a slim single-row footer with social
 *   icons, a dark mega-footer with a mission blurb, language Selector and
 *   status-page link chip, a centered minimal footer for landing pages,
 *   and an app-style footer with legal links plus a locale/currency
 *   picker row. A page-bottom SegmentedControl previews every variant
 *   against light and dark page ends, a variant Selector filters the
 *   collection, and a live demo-state Card mirrors every control.
 * @position Page template; emitted by \`astryx template
 *   marketing-footer-collection\`
 *
 * Frame: Layout height="fill". LayoutHeader owns the page Heading, the
 * light/dark page-bottom SegmentedControl, and the show-variant Selector;
 * LayoutContent scrolls a single centered max-width column stacking the
 * demo-state Card and the five variant sections. No LayoutPanel — a
 * gallery of footers is a one-column reading surface, so nothing docks.
 *
 * Interaction contract:
 * - The page-bottom SegmentedControl swaps the faux end-of-page backdrop
 *   (skeleton copy bars over a light or dark surface) above every footer
 *   in one pass, so each variant is previewed against both page ends.
 * - The show-variant Selector filters the collection to one footer or
 *   restores all five; the demo-state Card reports the current filter.
 * - The sitemap footer's newsletter mini-form validates on submit (empty
 *   and malformed emails get inline error statuses), confirms inline
 *   with a success row on valid input, and offers an Undo link that
 *   resets the form; the demo-state Card mirrors subscription state.
 * - The mega-footer's language Selector swaps the translated tagline
 *   inside the footer and updates the demo readout; its status chip and
 *   every social icon confirm via Toast so no control is dead.
 * - The app footer's region and currency Selectors update the footer's
 *   own price/date preview line and the demo readout together.
 * - Every sitemap/legal link is a real anchor that records itself as
 *   "last link" in the demo readout instead of navigating, proving the
 *   taxonomy is wired without spamming Toasts.
 *
 * Container policy: the demo readout is a Card of muted tiles (Grid);
 * each footer variant renders inside a bordered "stage" div (backdrop +
 * footer surface) because footers own their own chrome — Cards inside
 * Cards would misrepresent the archetype. Link columns are Grids; rows
 * of links/socials are wrapping HStacks.
 *
 * Responsive contract:
 * - Content column: max-width 1120px, centered; fills the viewport below
 *   that with LayoutContent's own padding.
 * - Header: heading block and controls share one wrapping row
 *   (wrap="wrap"), so the SegmentedControl + Selector drop below the
 *   title at narrow widths instead of clipping.
 * - Sitemap/mega link columns: Grid columns={{minWidth: 150, max: 4}} —
 *   4-up wide, 2-up mid, single column at 375px; the newsletter block
 *   spans full width below the columns when compact.
 * - Slim/app footers: single rows wrap (wrap="wrap") into stacked
 *   clusters <=640px; the locale/currency picker row wraps above the
 *   price preview line.
 * - Tap targets: footer links render at >=36px line boxes, social
 *   IconButtons and form controls at ~40px; nothing is hover-only —
 *   every interaction is click/keyboard driven.
 * - Demo readout tiles: Grid columns={{minWidth: 200, max: 3}} collapses
 *   3 → 2 → 1 without horizontal overflow at 375px.
 */

import {useState, type CSSProperties, type FormEvent} from 'react';

import {useMediaQuery} from '@astryxdesign/core/hooks';
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
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {
  ActivityIcon,
  ArrowUpRightIcon,
  AtSignIcon,
  CheckIcon,
  GitBranchIcon,
  GlobeIcon,
  MailIcon,
  PlayIcon,
  RssIcon,
  SendIcon,
} from 'lucide-react';

// ============= STYLES =============

const colors = {
  surface: 'var(--color-background, #FFFFFF)',
  surfaceMuted: 'var(--color-background-muted, #F5F5F7)',
  border: 'var(--color-border, #E2E2E6)',
  accent: 'var(--color-accent, #0171E3)',
  // Dark mega-footer palette — intentionally hardcoded so the variant
  // stays dark regardless of app theme; it previews a dark brand surface.
  darkSurface: '#0B1220',
  darkSurfaceRaised: '#131C2E',
  darkBorder: '#26324A',
  darkText: '#E6EBF2',
  darkTextMuted: '#93A0B4',
  statusGreen: '#22C55E',
};

const styles: Record<string, CSSProperties> = {
  // Marketing galleries read best as one centered column, not full-bleed.
  content: {
    width: '100%',
    maxWidth: 1120,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // Muted readout tiles inside the demo-state Card.
  readoutTile: {
    borderRadius: 'var(--radius-container)',
    backgroundColor: colors.surfaceMuted,
    padding: 'var(--spacing-3)',
    minWidth: 0,
  },
  // Each variant renders inside a bordered stage: faux page bottom on
  // top, the footer surface below. overflow hidden keeps radii clean.
  stage: {
    border: \`1px solid \${colors.border}\`,
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  // Faux end-of-page content: skeleton copy bars fading toward the
  // footer so each variant reads in situ, not floating in a void.
  pageBottomLight: {
    backgroundColor: '#FBFBFD',
    padding:
      'var(--spacing-6) var(--spacing-6) var(--spacing-5)',
  },
  pageBottomDark: {
    backgroundColor: '#0F172A',
    padding:
      'var(--spacing-6) var(--spacing-6) var(--spacing-5)',
  },
  skeletonBarLight: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
  },
  skeletonBarDark: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1F2A44',
  },
  // Light footer surfaces sit on the app surface color with a top rule.
  footerLight: {
    backgroundColor: colors.surface,
    borderTop: \`1px solid \${colors.border}\`,
    padding: 'var(--spacing-6)',
  },
  footerLightMuted: {
    backgroundColor: colors.surfaceMuted,
    borderTop: \`1px solid \${colors.border}\`,
    padding: 'var(--spacing-5) var(--spacing-6)',
  },
  // Dark mega-footer surface. color cascades to \`inherit\` Text/Link.
  footerDark: {
    backgroundColor: colors.darkSurface,
    borderTop: \`1px solid \${colors.darkBorder}\`,
    padding: 'var(--spacing-6)',
    color: colors.darkText,
  },
  darkMutedText: {
    color: colors.darkTextMuted,
  },
  // Gradient brand tile — styled placeholder, never a network asset.
  brandTile: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
    color: '#FFFFFF',
  },
  brandTileSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  // Footer links keep a >=36px line box for phone tap targets.
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 36,
  },
  // Status-page chip: pill button with a live dot; native button so the
  // whole pill (not just the label) is the ~40px hit area.
  statusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: '0 14px',
    borderRadius: 999,
    border: \`1px solid \${colors.darkBorder}\`,
    backgroundColor: colors.darkSurfaceRaised,
    color: colors.darkText,
    cursor: 'pointer',
    font: 'inherit',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.statusGreen,
    flexShrink: 0,
  },
  // Inline confirmation row for the newsletter mini-form.
  subscribeConfirm: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: '0 var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: '#EBF9EE',
    border: '1px solid #BEE8C8',
  },
  confirmGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    color: '#0B991F',
  },
  // Centered minimal footer content column.
  centeredStack: {
    maxWidth: 560,
    margin: '0 auto',
    textAlign: 'center',
  },
};

// ============= DATA =============

type Backdrop = 'light' | 'dark';
type Tone = 'light' | 'dark';
type VariantId = 'sitemap' | 'slim' | 'mega' | 'minimal' | 'app';

const COPYRIGHT = '© 2026 Relay Technologies, Inc.';

interface LinkGroup {
  id: string;
  label: string;
  links: string[];
}

// The Relay link taxonomy — shared by every variant so the five footers
// stay directly comparable (same links, different chrome).
const LINK_GROUPS: LinkGroup[] = [
  {
    id: 'product',
    label: 'Product',
    links: ['Features', 'Integrations', 'Pricing', 'Changelog', 'Roadmap'],
  },
  {
    id: 'company',
    label: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press kit', 'Contact'],
  },
  {
    id: 'resources',
    label: 'Resources',
    links: ['Docs', 'API reference', 'Community', 'Guides', 'Status'],
  },
  {
    id: 'legal',
    label: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'Cookie settings', 'Licenses'],
  },
];

// Slim/minimal/app variants reuse subsets of the same taxonomy.
const SLIM_LINKS = ['Pricing', 'Docs', 'Privacy', 'Terms'];
const MINIMAL_LINKS = [
  'Features',
  'Pricing',
  'Blog',
  'Docs',
  'Privacy',
  'Contact',
];
const APP_LEGAL_LINKS = [
  'Privacy',
  'Terms',
  'Security',
  'Cookie settings',
  'Licenses',
  'Sitemap',
];

type SocialGlyph = typeof AtSignIcon;

interface SocialEntry {
  id: string;
  label: string;
  icon: SocialGlyph;
}

// Generic channel glyphs (this lucide release ships no brand icons).
const SOCIALS: SocialEntry[] = [
  {id: 'social', label: 'Relay on social', icon: AtSignIcon},
  {id: 'source', label: 'Relay open source', icon: GitBranchIcon},
  {id: 'videos', label: 'Relay video channel', icon: PlayIcon},
  {id: 'blog-feed', label: 'Relay blog RSS feed', icon: RssIcon},
];

interface LanguageEntry {
  value: string;
  label: string;
  /** Fixed translation of the Relay tagline shown in the mega-footer. */
  tagline: string;
}

const LANGUAGES: LanguageEntry[] = [
  {value: 'en', label: 'English', tagline: 'Move work forward — together.'},
  {value: 'de', label: 'Deutsch', tagline: 'Bringt Arbeit voran — gemeinsam.'},
  {value: 'fr', label: 'Français', tagline: 'Faites avancer le travail — ensemble.'},
  {value: 'es', label: 'Español', tagline: 'Impulsa el trabajo — en equipo.'},
  {value: 'ja', label: '日本語', tagline: '仕事を前へ — チームとともに。'},
];

interface CurrencyEntry {
  value: string;
  label: string;
  /** Fixed Relay Pro price string — no conversion math, no drift. */
  proPrice: string;
}

const CURRENCIES: CurrencyEntry[] = [
  {value: 'usd', label: 'USD — US Dollar', proPrice: '$12'},
  {value: 'eur', label: 'EUR — Euro', proPrice: '€11'},
  {value: 'gbp', label: 'GBP — British Pound', proPrice: '£10'},
  {value: 'jpy', label: 'JPY — Japanese Yen', proPrice: '¥1,800'},
  {value: 'inr', label: 'INR — Indian Rupee', proPrice: '₹990'},
];

interface RegionEntry {
  value: string;
  label: string;
  /** Fixed date-format sample so the picker visibly changes something. */
  dateSample: string;
}

const REGIONS: RegionEntry[] = [
  {value: 'us', label: 'United States', dateSample: '06/15/2026'},
  {value: 'uk', label: 'United Kingdom', dateSample: '15/06/2026'},
  {value: 'de', label: 'Germany', dateSample: '15.06.2026'},
  {value: 'jp', label: 'Japan', dateSample: '2026/06/15'},
  {value: 'in', label: 'India', dateSample: '15-06-2026'},
];

interface VariantMeta {
  id: VariantId;
  name: string;
  description: string;
  tags: string[];
}

const VARIANTS: VariantMeta[] = [
  {
    id: 'sitemap',
    name: '4-column sitemap footer',
    description:
      'The workhorse: full Product / Company / Resources / Legal taxonomy ' +
      'with a validating newsletter mini-form and a social baseline row.',
    tags: ['Newsletter form', '4 link columns', 'Social row'],
  },
  {
    id: 'slim',
    name: 'Slim single-row footer',
    description:
      'One quiet row for apps and docs sites: brand + copyright left, ' +
      'four key links center, social icons right. Wraps into stacked ' +
      'clusters on phones.',
    tags: ['Single row', 'Social icons', 'Wraps on mobile'],
  },
  {
    id: 'mega',
    name: 'Dark mega-footer',
    description:
      'Brand-forward dark surface: mission blurb, the full link taxonomy, ' +
      'a language Selector that swaps the translated tagline, and a live ' +
      'status-page chip.',
    tags: ['Dark surface', 'Language Selector', 'Status chip'],
  },
  {
    id: 'minimal',
    name: 'Centered minimal footer',
    description:
      'Landing-page closer: centered brand glyph, one wrapped link row, ' +
      'social icons, and the copyright line. Nothing competes with the ' +
      'page CTA above it.',
    tags: ['Centered', 'Landing pages', 'Six links'],
  },
  {
    id: 'app',
    name: 'App-style legal footer',
    description:
      'Product-app bottom bar: legal links up top, then a region + ' +
      'currency picker row that live-updates the localized price and ' +
      'date preview beside it.',
    tags: ['Legal links', 'Region picker', 'Currency picker'],
  },
];

const SHOW_OPTIONS = [
  {value: 'all', label: 'All five variants'},
  ...VARIANTS.map(variant => ({value: variant.id, label: variant.name})),
];

// Faux end-of-page skeleton bar widths (percent) — fixed, not random.
const SKELETON_WIDTHS = ['78%', '92%', '61%', '38%'];

// ============= HELPERS =============

/**
 * Deliberately simple deterministic email check: needs one "@" with text
 * on both sides and a dot in the domain. Returns an error string or null.
 */
function validateEmail(raw: string): string | null {
  const email = raw.trim();
  if (email === '') {
    return 'Enter your work email to subscribe.';
  }
  const at = email.indexOf('@');
  if (at <= 0 || at !== email.lastIndexOf('@')) {
    return 'That doesn’t look like an email — check the "@".';
  }
  const domain = email.slice(at + 1);
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return 'The domain looks incomplete — e.g. name@company.com.';
  }
  return null;
}

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function languageFor(value: string): LanguageEntry {
  return LANGUAGES.find(entry => entry.value === value) ?? LANGUAGES[0];
}

function currencyFor(value: string): CurrencyEntry {
  return CURRENCIES.find(entry => entry.value === value) ?? CURRENCIES[0];
}

function regionFor(value: string): RegionEntry {
  return REGIONS.find(entry => entry.value === value) ?? REGIONS[0];
}

// ============= PIECES =============

/** Gradient Relay brand tile + wordmark; tone flips the text color. */
function BrandMark({
  tone,
  isSmall,
  showWordmark = true,
}: {
  tone: Tone;
  isSmall?: boolean;
  showWordmark?: boolean;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <div
        style={{
          ...styles.brandTile,
          ...(isSmall ? styles.brandTileSmall : undefined),
        }}
        aria-hidden="true">
        <Icon icon={SendIcon} size={isSmall ? 'sm' : 'md'} color="inherit" />
      </div>
      {showWordmark ? (
        tone === 'dark' ? (
          <Text type="label" color="inherit">
            Relay
          </Text>
        ) : (
          <Text type="label">Relay</Text>
        )
      ) : null}
    </HStack>
  );
}

/**
 * A footer navigation link. Real anchor semantics; clicking records the
 * link in the demo readout instead of navigating.
 */
function FooterLink({
  label,
  tone,
  onNavigate,
}: {
  label: string;
  tone: Tone;
  onNavigate: (label: string) => void;
}) {
  return (
    <Link
      href={\`#\${slugify(label)}\`}
      color={tone === 'dark' ? 'inherit' : 'secondary'}
      style={styles.footerLink}
      onClick={event => {
        event.preventDefault();
        onNavigate(label);
      }}>
      {label}
    </Link>
  );
}

/** One labeled column of taxonomy links (sitemap + mega variants). */
function LinkColumn({
  group,
  tone,
  onNavigate,
}: {
  group: LinkGroup;
  tone: Tone;
  onNavigate: (group: LinkGroup, label: string) => void;
}) {
  const heading =
    tone === 'dark' ? (
      <Text type="label" color="inherit">
        {group.label}
      </Text>
    ) : (
      <Text type="label">{group.label}</Text>
    );
  return (
    <VStack gap={1}>
      {heading}
      {group.links.map(label => (
        <FooterLink
          key={label}
          label={label}
          tone={tone}
          onNavigate={linkLabel => onNavigate(group, linkLabel)}
        />
      ))}
    </VStack>
  );
}

/** Row of social IconButtons; every icon confirms via Toast. */
function SocialRow({onSocial}: {onSocial: (entry: SocialEntry) => void}) {
  return (
    <HStack gap={1} vAlign="center">
      {SOCIALS.map(entry => (
        <IconButton
          key={entry.id}
          label={entry.label}
          icon={<Icon icon={entry.icon} size="sm" />}
          variant="ghost"
          onClick={() => onSocial(entry)}
        />
      ))}
    </HStack>
  );
}

/**
 * Newsletter mini-form. State lives in the page so the demo readout can
 * mirror it; this piece owns only layout and submit wiring.
 */
function NewsletterForm({
  email,
  error,
  subscribedEmail,
  onEmailChange,
  onSubmit,
  onReset,
}: {
  email: string;
  error: string | null;
  subscribedEmail: string | null;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  if (subscribedEmail !== null) {
    return (
      <VStack gap={2}>
        <div style={styles.subscribeConfirm} role="status">
          <span style={styles.confirmGlyph} aria-hidden="true">
            <CheckIcon size={18} strokeWidth={2} />
          </span>
          <Text type="supporting">
            You&rsquo;re on the list — we sent a confirmation to{' '}
            {subscribedEmail}.
          </Text>
        </div>
        <Link onClick={onReset}>Not you? Undo and use another email</Link>
      </VStack>
    );
  }
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };
  return (
    <form onSubmit={handleSubmit} noValidate>
      <VStack gap={2}>
        <HStack gap={2} vAlign="start" wrap="wrap">
          <StackItem size="fill">
            <TextInput
              label="Work email"
              isLabelHidden
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={onEmailChange}
              onEnter={onSubmit}
              startIcon={<Icon icon={MailIcon} size="sm" />}
              status={
                error !== null ? {type: 'error', message: error} : undefined
              }
              width="100%"
            />
          </StackItem>
          <Button label="Subscribe" onClick={onSubmit} />
        </HStack>
        <Text type="supporting" color="secondary">
          One product email a month. Unsubscribe any time.
        </Text>
      </VStack>
    </form>
  );
}

/** Green-dot status-page chip used by the dark mega-footer. */
function StatusChip({onOpen}: {onOpen: () => void}) {
  return (
    <button type="button" style={styles.statusChip} onClick={onOpen}>
      <span style={styles.statusDot} aria-hidden="true" />
      <Text type="supporting" color="inherit">
        All systems operational
      </Text>
      <Icon icon={ArrowUpRightIcon} size="sm" color="inherit" />
    </button>
  );
}

// ============= FOOTER VARIANTS =============

interface NavHandler {
  onNavigate: (variant: VariantMeta, group: string, label: string) => void;
}

/** Variant 1 — 4-column sitemap footer with the newsletter mini-form. */
function SitemapFooter({
  variant,
  onNavigate,
  onSocial,
  newsletter,
}: NavHandler & {
  variant: VariantMeta;
  onSocial: (entry: SocialEntry) => void;
  newsletter: {
    email: string;
    error: string | null;
    subscribedEmail: string | null;
    onEmailChange: (value: string) => void;
    onSubmit: () => void;
    onReset: () => void;
  };
}) {
  return (
    <div style={styles.footerLight}>
      <VStack gap={5}>
        <Grid columns={{minWidth: 150, max: 4}} gap={4}>
          {LINK_GROUPS.map(group => (
            <LinkColumn
              key={group.id}
              group={group}
              tone="light"
              onNavigate={(linkGroup, label) =>
                onNavigate(variant, linkGroup.label, label)
              }
            />
          ))}
        </Grid>
        <Divider />
        <HStack gap={4} vAlign="start" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={2}>
              <BrandMark tone="light" />
              <Text type="supporting" color="secondary">
                Product updates, no noise — join 12,400 subscribers.
              </Text>
            </VStack>
          </StackItem>
          <StackItem size="fill">
            <NewsletterForm {...newsletter} />
          </StackItem>
        </HStack>
        <Divider />
        <HStack gap={3} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              {COPYRIGHT} All rights reserved.
            </Text>
          </StackItem>
          <SocialRow onSocial={onSocial} />
        </HStack>
      </VStack>
    </div>
  );
}

/** Variant 2 — slim single-row footer with social icons. */
function SlimFooter({
  variant,
  onNavigate,
  onSocial,
}: NavHandler & {
  variant: VariantMeta;
  onSocial: (entry: SocialEntry) => void;
}) {
  return (
    <div style={styles.footerLightMuted}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <BrandMark tone="light" isSmall showWordmark={false} />
          <Text type="supporting" color="secondary">
            {COPYRIGHT}
          </Text>
        </HStack>
        <StackItem size="fill">
          <HStack gap={4} vAlign="center" wrap="wrap" hAlign="center">
            {SLIM_LINKS.map(label => (
              <FooterLink
                key={label}
                label={label}
                tone="light"
                onNavigate={linkLabel =>
                  onNavigate(variant, 'Quick links', linkLabel)
                }
              />
            ))}
          </HStack>
        </StackItem>
        <SocialRow onSocial={onSocial} />
      </HStack>
    </div>
  );
}

/** Variant 3 — dark mega-footer: mission, taxonomy, language, status. */
function MegaFooter({
  variant,
  onNavigate,
  onSocial,
  language,
  onLanguageChange,
  onStatusOpen,
}: NavHandler & {
  variant: VariantMeta;
  onSocial: (entry: SocialEntry) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  onStatusOpen: () => void;
}) {
  const activeLanguage = languageFor(language);
  return (
    <div style={styles.footerDark}>
      <VStack gap={5}>
        <HStack gap={5} vAlign="start" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={3}>
              <BrandMark tone="dark" />
              {/* Mission blurb + the tagline the language Selector swaps. */}
              <div style={styles.darkMutedText}>
                <Text type="body" color="inherit">
                  Relay is the coordination layer for distributed teams —
                  plans, updates, and decisions in one shared thread, so
                  work moves without meetings.
                </Text>
              </div>
              <Text type="label" color="inherit">
                {activeLanguage.tagline}
              </Text>
              <StatusChip onOpen={onStatusOpen} />
            </VStack>
          </StackItem>
          <StackItem size="fill">
            <Grid columns={{minWidth: 150, max: 4}} gap={4}>
              {LINK_GROUPS.map(group => (
                <LinkColumn
                  key={group.id}
                  group={group}
                  tone="dark"
                  onNavigate={(linkGroup, label) =>
                    onNavigate(variant, linkGroup.label, label)
                  }
                />
              ))}
            </Grid>
          </StackItem>
        </HStack>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Selector
            label="Language"
            size="sm"
            options={LANGUAGES.map(entry => ({
              value: entry.value,
              label: entry.label,
            }))}
            value={language}
            onChange={onLanguageChange}
          />
          <StackItem size="fill">
            <div style={styles.darkMutedText}>
              <Text type="supporting" color="inherit">
                {COPYRIGHT} · Relay and the paper-plane mark are trademarks
                of Relay Technologies.
              </Text>
            </div>
          </StackItem>
          <SocialRow onSocial={onSocial} />
        </HStack>
      </VStack>
    </div>
  );
}

/** Variant 4 — centered minimal footer for landing pages. */
function MinimalFooter({
  variant,
  onNavigate,
  onSocial,
}: NavHandler & {
  variant: VariantMeta;
  onSocial: (entry: SocialEntry) => void;
}) {
  return (
    <div style={styles.footerLight}>
      <div style={styles.centeredStack}>
        <VStack gap={3} hAlign="center">
          <BrandMark tone="light" showWordmark={false} />
          <HStack gap={4} vAlign="center" wrap="wrap" hAlign="center">
            {MINIMAL_LINKS.map(label => (
              <FooterLink
                key={label}
                label={label}
                tone="light"
                onNavigate={linkLabel =>
                  onNavigate(variant, 'Landing links', linkLabel)
                }
              />
            ))}
          </HStack>
          <SocialRow onSocial={onSocial} />
          <Text type="supporting" color="secondary">
            {COPYRIGHT}
          </Text>
        </VStack>
      </div>
    </div>
  );
}

/** Variant 5 — app-style legal footer with the locale/currency row. */
function AppFooter({
  variant,
  onNavigate,
  region,
  currency,
  onRegionChange,
  onCurrencyChange,
}: NavHandler & {
  variant: VariantMeta;
  region: string;
  currency: string;
  onRegionChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
}) {
  const activeRegion = regionFor(region);
  const activeCurrency = currencyFor(currency);
  return (
    <div style={styles.footerLight}>
      <VStack gap={4}>
        <HStack gap={4} vAlign="center" wrap="wrap">
          {APP_LEGAL_LINKS.map(label => (
            <FooterLink
              key={label}
              label={label}
              tone="light"
              onNavigate={linkLabel =>
                onNavigate(variant, 'Legal', linkLabel)
              }
            />
          ))}
        </HStack>
        <Divider />
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Icon icon={GlobeIcon} size="sm" color="secondary" />
          <Selector
            label="Region"
            isLabelHidden
            size="sm"
            options={REGIONS.map(entry => ({
              value: entry.value,
              label: entry.label,
            }))}
            value={region}
            onChange={onRegionChange}
          />
          <Selector
            label="Currency"
            isLabelHidden
            size="sm"
            options={CURRENCIES.map(entry => ({
              value: entry.value,
              label: entry.label,
            }))}
            value={currency}
            onChange={onCurrencyChange}
          />
          <StackItem size="fill">
            {/* Live preview line — proves the pickers change real output. */}
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Relay Pro from {activeCurrency.proPrice} per member / month ·
              dates shown as {activeRegion.dateSample}
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary">
            {COPYRIGHT}
          </Text>
        </HStack>
      </VStack>
    </div>
  );
}

// ============= SECTION SHELL =============

/**
 * Wraps one footer variant: numbered header (name, description, tag
 * Badges) plus the stage — faux page bottom above the footer surface.
 */
function VariantSection({
  index,
  variant,
  backdrop,
  children,
}: {
  index: number;
  variant: VariantMeta;
  backdrop: Backdrop;
  children: React.ReactNode;
}) {
  const backdropStyle =
    backdrop === 'dark' ? styles.pageBottomDark : styles.pageBottomLight;
  const barStyle =
    backdrop === 'dark' ? styles.skeletonBarDark : styles.skeletonBarLight;
  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Badge label={\`\${index + 1} of \${VARIANTS.length}\`} />
        <Heading level={2}>{variant.name}</Heading>
        {variant.tags.map(tag => (
          <Badge key={tag} variant="info" label={tag} />
        ))}
      </HStack>
      <Text type="supporting" color="secondary">
        {variant.description}
      </Text>
      <div style={styles.stage}>
        {/* Faux end-of-page copy so the footer previews in context. */}
        <div style={backdropStyle} aria-hidden="true">
          <VStack gap={2}>
            {SKELETON_WIDTHS.map(width => (
              <div key={width} style={{...barStyle, width}} />
            ))}
          </VStack>
        </div>
        {children}
      </div>
    </VStack>
  );
}

/** One muted key/value tile inside the demo-state Card. */
function ReadoutTile({label, value}: {label: string; value: string}) {
  return (
    <div style={styles.readoutTile}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <Text type="body" maxLines={2}>
          {value}
        </Text>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function MarketingFooterCollectionTemplate() {
  const toast = useToast();

  // Page-bottom preview + collection filter (header controls).
  const [backdrop, setBackdrop] = useState<Backdrop>('light');
  const [shown, setShown] = useState<string>('all');

  // Newsletter mini-form (sitemap variant) — state lives here so the
  // demo readout can mirror it.
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);

  // Mega-footer language + app-footer locale/currency pickers.
  const [language, setLanguage] = useState('en');
  const [region, setRegion] = useState('us');
  const [currency, setCurrency] = useState('usd');

  // Last taxonomy link clicked anywhere in the collection.
  const [lastNav, setLastNav] = useState<string | null>(null);

  const isCompact = useMediaQuery('(max-width: 640px)');

  const activeLanguage = languageFor(language);
  const activeRegion = regionFor(region);
  const activeCurrency = currencyFor(currency);

  const visibleVariants = VARIANTS.filter(
    variant => shown === 'all' || variant.id === shown,
  );

  const handleNavigate = (
    variant: VariantMeta,
    group: string,
    label: string,
  ) => {
    setLastNav(\`\${group} → \${label} (\${variant.name})\`);
  };

  const handleSocial = (entry: SocialEntry) => {
    toast({
      body: \`Opening \${entry.label} in a new tab\`,
      uniqueID: \`footer-social-\${entry.id}\`,
    });
  };

  const handleStatusOpen = () => {
    toast({
      body: 'Opening status.relay.app — all systems operational',
      uniqueID: 'footer-status-page',
    });
  };

  const handleSubscribe = () => {
    const error = validateEmail(email);
    setEmailError(error);
    if (error === null) {
      setSubscribedEmail(email.trim());
    }
  };

  const handleSubscribeReset = () => {
    setSubscribedEmail(null);
    setEmail('');
    setEmailError(null);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Clear the inline error as soon as the user starts fixing it.
    if (emailError !== null) {
      setEmailError(null);
    }
  };

  const newsletter = {
    email,
    error: emailError,
    subscribedEmail,
    onEmailChange: handleEmailChange,
    onSubmit: handleSubscribe,
    onReset: handleSubscribeReset,
  };

  const newsletterReadout =
    subscribedEmail !== null
      ? \`Subscribed as \${subscribedEmail}\`
      : emailError !== null
        ? 'Validation error shown inline'
        : 'Not subscribed yet';

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={1}>
                <Heading level={1}>Footer collection</Heading>
                <Text type="supporting" color="secondary">
                  Five Relay footer variants on one shared link taxonomy —
                  preview each against a light or dark page bottom.
                </Text>
              </VStack>
            </StackItem>
            <SegmentedControl
              label="Page bottom"
              value={backdrop}
              onChange={value => setBackdrop(value as Backdrop)}
              size="sm">
              <SegmentedControlItem label="Light page" value="light" />
              <SegmentedControlItem label="Dark page" value="dark" />
            </SegmentedControl>
            <Selector
              label="Show variant"
              isLabelHidden
              size="sm"
              options={SHOW_OPTIONS}
              value={shown}
              onChange={setShown}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.content}>
            <VStack gap={6}>
              {/* ---- Demo-state readout ---- */}
              <Card padding={4}>
                <VStack gap={3}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Icon icon={ActivityIcon} size="sm" color="secondary" />
                    <Text type="label">Demo state</Text>
                    <Text type="supporting" color="secondary">
                      Every footer control below writes into this readout.
                    </Text>
                  </HStack>
                  <Grid
                    columns={{minWidth: isCompact ? 150 : 200, max: 3}}
                    gap={2}>
                    <ReadoutTile
                      label="Page bottom"
                      value={
                        backdrop === 'dark' ? 'Dark preview' : 'Light preview'
                      }
                    />
                    <ReadoutTile
                      label="Language (mega-footer)"
                      value={\`\${activeLanguage.label} — “\${activeLanguage.tagline}”\`}
                    />
                    <ReadoutTile
                      label="Region (app footer)"
                      value={\`\${activeRegion.label} · \${activeRegion.dateSample}\`}
                    />
                    <ReadoutTile
                      label="Currency (app footer)"
                      value={\`\${activeCurrency.label.slice(0, 3).toUpperCase()} · Pro at \${activeCurrency.proPrice}/mo\`}
                    />
                    <ReadoutTile
                      label="Newsletter (sitemap footer)"
                      value={newsletterReadout}
                    />
                    <ReadoutTile
                      label="Last link clicked"
                      value={lastNav ?? 'None yet — try any footer link'}
                    />
                  </Grid>
                </VStack>
              </Card>

              {/* ---- The five footer variants ---- */}
              {visibleVariants.map(variant => {
                const index = VARIANTS.findIndex(
                  entry => entry.id === variant.id,
                );
                return (
                  <VariantSection
                    key={variant.id}
                    index={index}
                    variant={variant}
                    backdrop={backdrop}>
                    {variant.id === 'sitemap' ? (
                      <SitemapFooter
                        variant={variant}
                        onNavigate={handleNavigate}
                        onSocial={handleSocial}
                        newsletter={newsletter}
                      />
                    ) : variant.id === 'slim' ? (
                      <SlimFooter
                        variant={variant}
                        onNavigate={handleNavigate}
                        onSocial={handleSocial}
                      />
                    ) : variant.id === 'mega' ? (
                      <MegaFooter
                        variant={variant}
                        onNavigate={handleNavigate}
                        onSocial={handleSocial}
                        language={language}
                        onLanguageChange={setLanguage}
                        onStatusOpen={handleStatusOpen}
                      />
                    ) : variant.id === 'minimal' ? (
                      <MinimalFooter
                        variant={variant}
                        onNavigate={handleNavigate}
                        onSocial={handleSocial}
                      />
                    ) : (
                      <AppFooter
                        variant={variant}
                        onNavigate={handleNavigate}
                        region={region}
                        currency={currency}
                        onRegionChange={setRegion}
                        onCurrencyChange={setCurrency}
                      />
                    )}
                  </VariantSection>
                );
              })}

              {/* ---- Usage note ---- */}
              <Card padding={4}>
                <HStack gap={3} vAlign="center" wrap="wrap">
                  <Icon icon={GlobeIcon} size="md" color="secondary" />
                  <StackItem size="fill">
                    <VStack gap={1}>
                      <Text type="label">Picking a variant</Text>
                      <Text type="supporting" color="secondary">
                        Sitemap for marketing sites with deep IA, slim for
                        docs and apps, mega for brand-heavy dark pages,
                        minimal for landing pages with one CTA, app-style
                        when locale and billing context matter. All five
                        share the same Product / Company / Resources /
                        Legal taxonomy, so swapping later is a re-skin,
                        not a re-architecture.
                      </Text>
                    </VStack>
                  </StackItem>
                </HStack>
              </Card>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};