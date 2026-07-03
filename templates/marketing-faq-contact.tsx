// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file marketing-faq-contact.tsx
 * @input Deterministic fixtures only (twelve FAQ entries for "Lumina", a
 *   workflow automation platform, each tagged Billing / Product / Security;
 *   three office locations with schematic map coordinates; four support
 *   channels with fixed response-time copy; five contact topics)
 * @output Marketing showcase of three FAQ section variants and three
 *   contact section variants: a single-column accordion with an
 *   expand-all/collapse-all control, a category-filtered two-column Q&A
 *   grid driven by a SegmentedControl, and an offset layout with a sticky
 *   heading + support CTA beside a single-open accordion; then a split
 *   contact form beside selectable office Cards synced to a schematic CSS
 *   map, a centered simple form with a topic Selector, and a
 *   support-channels Grid (chat, email, docs, status) with response-time
 *   Badge chips. Both forms validate required fields on submit and swap to
 *   inline success panels.
 * @position Page template; emitted by `astryx template marketing-faq-contact`
 *
 * Frame: Layout height="fill". LayoutHeader owns the page Heading, scope
 * line, and a fixture-count Badge; LayoutContent scrolls a single centered
 * max-width column stacking the three FAQ variants, a divider band, and
 * the three contact variants. No LayoutPanel — a marketing showcase is a
 * one-column reading surface, so nothing docks.
 *
 * Interaction contract:
 * - Variant 1 accordion is a controlled Set so several answers stay open
 *   at once; the header Button toggles between "Expand all" and
 *   "Collapse all" based on whether every row is currently open.
 * - Variant 2's SegmentedControl (All / Billing / Product / Security)
 *   live-filters the Q&A Grid and updates a "Showing N of 12" counter.
 * - Variant 3 is an exclusive accordion (string | null state) — opening a
 *   question closes the previous one; its support CTA fires a Toast.
 * - Variant 4's office Cards carry "Show on map" Buttons that highlight
 *   the matching dot on the schematic map (ring + label chip); its form
 *   validates name/email/message on submit, surfaces field errors through
 *   input status, and swaps to an inline success panel with a
 *   "Send another message" reset.
 * - Variant 5's centered form adds a required topic Selector and follows
 *   the same submit-validate-success-reset cycle independently.
 * - Variant 6's channel Buttons all confirm via Toast so nothing is dead.
 *
 * Container policy: FAQ variants are Cards (accordion card, Q&A tile
 * Cards in a Grid, offset card pair); contact variants are Cards for the
 * forms, office entries, and channel tiles. The schematic map is a styled
 * div (pure CSS gradients + positioned dots — no network assets, per the
 * fixture policy). Forms use FormLayout inside their Cards.
 *
 * Responsive contract:
 * - Content column: max-width 1080px, centered; fills the viewport width
 *   below that with LayoutContent's own padding.
 * - Header: heading block and fixture Badge share one wrapping row
 *   (wrap="wrap") so nothing clips at 375px.
 * - Variant 2 Q&A tiles: Grid columns={{minWidth: 300, max: 2}} — 2-up
 *   wide, single column on phones; the filter SegmentedControl sits in a
 *   wrapping header row.
 * - Variants 3 and 4 use useMediaQuery(max-width: 760px) to collapse
 *   their two-column CSS grids (offset 5/7 split; form beside offices)
 *   into single stacked columns.
 * - Variant 6 channels: Grid columns={{minWidth: 220, max: 4}} — 4-up
 *   wide, 2-up mid, 1-up at 375px.
 * - Accordion triggers span the full card width with vertical padding for
 *   ~44px tap targets; all filtering, expansion, selection, and
 *   submission is tap/keyboard driven — nothing on this page is
 *   hover-only. Buttons in card footers stretch via display:grid slots
 *   for generous tap targets. No horizontal overflow anywhere: the map
 *   and grids shrink with their containers.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

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
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {
  ActivityIcon,
  BookOpenIcon,
  CheckIcon,
  CircleHelpIcon,
  ClockIcon,
  LifeBuoyIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  SendIcon,
} from 'lucide-react';

// ============= STYLES =============

const colors = {
  surface: 'var(--color-background, #FFFFFF)',
  surfaceMuted: 'var(--color-background-muted, #F5F5F7)',
  accent: 'var(--color-accent, #0171E3)',
  accentMuted: 'var(--color-accent-muted, #EAF2FF)',
  border: 'var(--color-border, #E2E2E6)',
  success: 'var(--color-data-categorical-green, #0B991F)',
};

const styles: Record<string, CSSProperties> = {
  // Marketing surfaces read best as one centered column, not full-bleed.
  content: {
    width: '100%',
    maxWidth: 1080,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // Accordion trigger rows get vertical padding for ~44px tap targets.
  faqItem: {
    padding: 'var(--spacing-2) 0',
  },
  faqBody: {
    padding: 'var(--spacing-2) 0 var(--spacing-1)',
  },
  // display:grid stretches Buttons to the full slot width, which also
  // guarantees a generous (~40px) tap target on phones.
  fullWidthSlot: {
    display: 'grid',
  },
  // Selected office card: accent ring on top of the Card's own chrome.
  officeSelected: {
    borderColor: colors.accent,
    boxShadow: `0 0 0 1px ${colors.accent}`,
  },
  // Schematic CSS map — gradients and grid lines only, no network tiles.
  map: {
    position: 'relative',
    height: 240,
    borderRadius: 'var(--radius-container)',
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    background:
      'radial-gradient(ellipse 42% 34% at 18% 34%, rgba(1, 113, 227, 0.14) 0%, transparent 70%), ' +
      'radial-gradient(ellipse 36% 30% at 52% 26%, rgba(1, 113, 227, 0.12) 0%, transparent 70%), ' +
      'radial-gradient(ellipse 40% 32% at 80% 60%, rgba(1, 113, 227, 0.12) 0%, transparent 70%), ' +
      'linear-gradient(180deg, #F3F7FD 0%, #EAF1F9 100%)',
  },
  // Faint graticule so the surface reads as a map, not a blank panel.
  mapGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'repeating-linear-gradient(0deg, rgba(15, 23, 42, 0.05) 0, rgba(15, 23, 42, 0.05) 1px, transparent 1px, transparent 40px), ' +
      'repeating-linear-gradient(90deg, rgba(15, 23, 42, 0.05) 0, rgba(15, 23, 42, 0.05) 1px, transparent 1px, transparent 40px)',
  },
  mapDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: colors.accent,
    border: '2px solid #FFFFFF',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.3)',
    transform: 'translate(-50%, -50%)',
  },
  mapDotSelected: {
    width: 16,
    height: 16,
    boxShadow: `0 0 0 4px rgba(1, 113, 227, 0.25), 0 1px 3px rgba(15, 23, 42, 0.3)`,
  },
  // City label chip pinned above the selected dot.
  mapChip: {
    position: 'absolute',
    transform: 'translate(-50%, -100%)',
    marginTop: -14,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.14)',
    whiteSpace: 'nowrap',
  },
  // Gradient glyph tiles stand in for channel art — no network assets.
  glyphTile: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    color: '#FFFFFF',
  },
  glyphChat: {
    background: 'linear-gradient(135deg, #6366F1 0%, #2563EB 100%)',
  },
  glyphEmail: {
    background: 'linear-gradient(135deg, #14B8A6 0%, #0E7490 100%)',
  },
  glyphDocs: {
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  },
  glyphStatus: {
    background: 'linear-gradient(135deg, #475569 0%, #1E293B 100%)',
  },
  // Success panels: tinted tile with a check disc, replacing the form.
  successPanel: {
    borderRadius: 'var(--radius-container)',
    backgroundColor: colors.accentMuted,
    padding: 'var(--spacing-5)',
  },
  successDisc: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: colors.success,
    color: '#FFFFFF',
  },
  // Muted band separating the FAQ half from the contact half.
  halfBand: {
    borderRadius: 'var(--radius-container)',
    backgroundColor: colors.surfaceMuted,
    padding: 'var(--spacing-4) var(--spacing-5)',
  },
};

// ============= DATA =============

type FaqCategory = 'billing' | 'product' | 'security';
type CategoryFilter = 'all' | FaqCategory;

interface FaqEntry {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

const CATEGORY_LABELS: Record<FaqCategory, string> = {
  billing: 'Billing',
  product: 'Product',
  security: 'Security',
};

// Twelve entries, four per category, for "Lumina" — a workflow
// automation platform. All fixture copy is original and fixed.
const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: 'billing-seats',
    category: 'billing',
    question: 'How does per-seat billing work?',
    answer:
      'You pay for members who can build or edit workflows. Viewers are free and unlimited on every plan. Adding a builder mid-cycle bills a prorated amount for the remaining days; removing one credits your next invoice automatically.',
  },
  {
    id: 'billing-invoice',
    category: 'billing',
    question: 'Can we pay by invoice instead of card?',
    answer:
      'Annual plans over $5,000 can switch to invoice billing with net-30 terms. Ask your account manager or write to billing@lumina.dev — purchase orders and vendor onboarding forms are fine, and we support ACH, SEPA, and wire transfers.',
  },
  {
    id: 'billing-downgrade',
    category: 'billing',
    question: 'What happens if we downgrade mid-cycle?',
    answer:
      'The lower rate takes effect at your next renewal, and nothing is deleted in the meantime. Workflows that exceed the new plan limits keep running but move to read-only until you archive enough of them to fit the smaller quota.',
  },
  {
    id: 'billing-nonprofit',
    category: 'billing',
    question: 'Do you offer nonprofit or education discounts?',
    answer:
      'Registered nonprofits and accredited schools get 40% off any plan. Apply from Settings → Billing with your registration document — approvals usually land within two business days and apply retroactively to the current cycle.',
  },
  {
    id: 'product-integrations',
    category: 'product',
    question: 'Does Lumina integrate with Slack and Teams?',
    answer:
      'Yes — both are first-party integrations. Workflows can post rich messages, wait on button replies, and open approval threads. The Slack app also mirrors run failures into a channel you pick, so on-call engineers see breakage without opening Lumina.',
  },
  {
    id: 'product-import',
    category: 'product',
    question: 'Can I import existing runbooks from a spreadsheet?',
    answer:
      'The importer accepts CSV and XLSX files with one step per row. It maps columns to step names, owners, and durations, shows a dry-run preview, and flags rows it could not parse so you can fix them before anything is created.',
  },
  {
    id: 'product-api',
    category: 'product',
    question: 'Is there an API and webhook support?',
    answer:
      'Every plan includes the full REST API and signed webhooks. Trigger runs, read step states, and subscribe to lifecycle events; rate limits scale with your plan tier and every response includes remaining-quota headers.',
  },
  {
    id: 'product-free-limits',
    category: 'product',
    question: 'What are the limits of the free tier?',
    answer:
      'Free workspaces get 3 builders, 5 active workflows, and 500 runs per month. Runs beyond the quota queue until the next month instead of failing, so a busy week never breaks an automation — it just waits.',
  },
  {
    id: 'security-residency',
    category: 'security',
    question: 'Where is my data stored?',
    answer:
      'Your workspace pins to a region at creation time — US (Oregon) or EU (Frankfurt) — and never silently migrates. Backups stay inside the same region, and Enterprise plans can add a second in-region replica for disaster recovery.',
  },
  {
    id: 'security-sso',
    category: 'security',
    question: 'Do you support SSO and two-factor authentication?',
    answer:
      'SAML SSO and SCIM provisioning are included on the Business plan; every plan supports TOTP two-factor authentication and hardware keys. Admins can require 2FA workspace-wide and see who has not enrolled yet.',
  },
  {
    id: 'security-soc2',
    category: 'security',
    question: 'Is Lumina SOC 2 compliant?',
    answer:
      'We hold a SOC 2 Type II report covering security, availability, and confidentiality, renewed annually. The current report and our penetration-test summary are available under NDA from the trust page or your account manager.',
  },
  {
    id: 'security-disclosure',
    category: 'security',
    question: 'How do I report a security vulnerability?',
    answer:
      'Email security@lumina.dev — the inbox pages our security on-call directly. We acknowledge within one business day, and our published disclosure policy includes safe-harbor language plus bounty tiers for qualifying reports.',
  },
];

// The offset variant shows a curated shortlist: the first two questions
// from each category, in category order.
const OFFSET_FAQ_IDS = [
  'billing-seats',
  'billing-invoice',
  'product-integrations',
  'product-api',
  'security-residency',
  'security-sso',
];

const OFFSET_FAQS = OFFSET_FAQ_IDS.map(
  id => FAQ_ENTRIES.find(entry => entry.id === id) as FaqEntry,
);

interface Office {
  id: string;
  city: string;
  country: string;
  address: string;
  hours: string;
  phone: string;
  /** Schematic map position, percent of the map surface. */
  mapX: number;
  mapY: number;
}

const OFFICES: Office[] = [
  {
    id: 'portland',
    city: 'Portland',
    country: 'United States',
    address: '2180 Harrison Street, Suite 400, Portland, OR 97210',
    hours: 'Mon–Fri, 8:00–17:00 PT',
    phone: '+1 (503) 555-0114',
    mapX: 16,
    mapY: 36,
  },
  {
    id: 'amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    address: 'Keizersgracht 221, 1016 DV Amsterdam',
    hours: 'Mon–Fri, 9:00–18:00 CET',
    phone: '+31 20 555 0198',
    mapX: 51,
    mapY: 27,
  },
  {
    id: 'singapore',
    city: 'Singapore',
    country: 'Singapore',
    address: '71 Robinson Road, #14-02, Singapore 068895',
    hours: 'Mon–Fri, 9:00–18:00 SGT',
    phone: '+65 6555 0143',
    mapX: 79,
    mapY: 62,
  },
];

type ChannelGlyph = typeof MessageCircleIcon;

interface SupportChannel {
  id: string;
  name: string;
  description: string;
  responseChip: string;
  cta: string;
  ctaToast: string;
  icon: ChannelGlyph;
  glyphStyle: CSSProperties;
}

const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    id: 'chat',
    name: 'Live chat',
    description:
      'Talk to a product specialist from any page — fastest for how-to questions and plan advice.',
    responseChip: '~2 min response',
    cta: 'Start a chat',
    ctaToast: 'Opening chat — a specialist joins in about 2 minutes',
    icon: MessageCircleIcon,
    glyphStyle: styles.glyphChat,
  },
  {
    id: 'email',
    name: 'Email support',
    description:
      'Best for billing changes and anything with attachments. Every reply comes from an engineer.',
    responseChip: '~4 hr response',
    cta: 'Email support',
    ctaToast: 'Drafting an email to support@lumina.dev',
    icon: MailIcon,
    glyphStyle: styles.glyphEmail,
  },
  {
    id: 'docs',
    name: 'Documentation',
    description:
      'Guides, API reference, and 40+ workflow recipes — searchable and versioned per release.',
    responseChip: 'Self-serve',
    cta: 'Browse the docs',
    ctaToast: 'Opening docs.lumina.dev',
    icon: BookOpenIcon,
    glyphStyle: styles.glyphDocs,
  },
  {
    id: 'status',
    name: 'System status',
    description:
      'Live uptime for the API, runners, and integrations, plus incident history and postmortems.',
    responseChip: 'Live updates',
    cta: 'View status',
    ctaToast: 'Opening status.lumina.dev — all systems operational',
    icon: ActivityIcon,
    glyphStyle: styles.glyphStatus,
  },
];

const TOPIC_OPTIONS = [
  {value: 'billing', label: 'Billing & plans'},
  {value: 'product', label: 'Product question'},
  {value: 'security', label: 'Security & compliance'},
  {value: 'partnerships', label: 'Partnerships'},
  {value: 'other', label: 'Something else'},
];

// ============= VALIDATION =============

// Deliberately simple: enough to catch "no @" and "no domain" on submit.
// Real submission validation belongs server-side.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SplitForm {
  name: string;
  email: string;
  company: string;
  message: string;
}

const EMPTY_SPLIT_FORM: SplitForm = {
  name: '',
  email: '',
  company: '',
  message: '',
};

interface SplitFormErrors {
  name?: string;
  email?: string;
  message?: string;
}

function validateSplitForm(form: SplitForm): SplitFormErrors {
  const errors: SplitFormErrors = {};
  if (form.name.trim() === '') {
    errors.name = 'Your name is required.';
  }
  if (form.email.trim() === '') {
    errors.email = 'A work email is required so we can reply.';
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Enter a valid email address, like name@company.com.';
  }
  if (form.message.trim() === '') {
    errors.message = 'Tell us a little about what you need.';
  }
  return errors;
}

interface CenteredForm {
  name: string;
  email: string;
  topic: string;
  message: string;
}

const EMPTY_CENTERED_FORM: CenteredForm = {
  name: '',
  email: '',
  topic: '',
  message: '',
};

interface CenteredFormErrors {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
}

function validateCenteredForm(form: CenteredForm): CenteredFormErrors {
  const errors: CenteredFormErrors = {};
  if (form.name.trim() === '') {
    errors.name = 'Your name is required.';
  }
  if (form.email.trim() === '') {
    errors.email = 'An email is required so we can reply.';
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Enter a valid email address, like name@company.com.';
  }
  if (form.topic === '') {
    errors.topic = 'Pick a topic so we can route your message.';
  }
  if (form.message.trim() === '') {
    errors.message = 'A message is required.';
  }
  return errors;
}

function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}

function topicLabel(value: string): string {
  return (
    TOPIC_OPTIONS.find(option => option.value === value)?.label ??
    'General'
  );
}

// ============= PIECES =============

/** Numbered variant band: eyebrow + title + explainer above each demo. */
function VariantIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <VStack gap={1}>
      <Text type="supporting" color="secondary">
        {eyebrow}
      </Text>
      <Heading level={3}>{title}</Heading>
      <Text type="supporting" color="secondary">
        {description}
      </Text>
    </VStack>
  );
}

/** Muted band that opens each half of the showcase (FAQ / contact). */
function HalfBand({
  icon,
  title,
  description,
}: {
  icon: ChannelGlyph;
  title: string;
  description: string;
}) {
  return (
    <div style={styles.halfBand}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <Icon icon={icon} size="md" color="secondary" />
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={2}>{title}</Heading>
            <Text type="supporting" color="secondary">
              {description}
            </Text>
          </VStack>
        </StackItem>
      </HStack>
    </div>
  );
}

/** One divider-separated accordion row shared by variants 1 and 3. */
function FaqRow({
  entry,
  isOpen,
  isFirst,
  showCategory,
  onOpenChange,
}: {
  entry: FaqEntry;
  isOpen: boolean;
  isFirst: boolean;
  showCategory: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  return (
    <VStack gap={0}>
      {!isFirst ? <Divider /> : null}
      <div style={styles.faqItem}>
        <Collapsible
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          trigger={entry.question}>
          <div style={styles.faqBody}>
            <VStack gap={2}>
              {showCategory ? (
                <HStack gap={2}>
                  <Badge label={CATEGORY_LABELS[entry.category]} />
                </HStack>
              ) : null}
              <Text type="body" color="secondary">
                {entry.answer}
              </Text>
            </VStack>
          </div>
        </Collapsible>
      </div>
    </VStack>
  );
}

/** Always-expanded Q&A tile for the filterable two-column variant. */
function QaTile({entry}: {entry: FaqEntry}) {
  return (
    <Card padding={5} height="100%">
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text type="label">{entry.question}</Text>
          </StackItem>
          <Badge label={CATEGORY_LABELS[entry.category]} />
        </HStack>
        <Text type="body" color="secondary">
          {entry.answer}
        </Text>
      </VStack>
    </Card>
  );
}

/** Office card; the map highlight follows whichever card is selected. */
function OfficeCard({
  office,
  isSelected,
  onSelect,
}: {
  office: Office;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <Card
      padding={4}
      style={isSelected ? styles.officeSelected : undefined}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={MapPinIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label">
              {office.city}, {office.country}
            </Text>
          </StackItem>
          {isSelected ? <Badge variant="info" label="On map" /> : null}
        </HStack>
        <Text type="supporting" color="secondary">
          {office.address}
        </Text>
        <HStack gap={2} vAlign="center">
          <Icon icon={ClockIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            {office.hours}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <Icon icon={PhoneIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {office.phone}
          </Text>
        </HStack>
        <div style={styles.fullWidthSlot}>
          <Button
            label={isSelected ? 'Shown on map' : 'Show on map'}
            variant="secondary"
            size="sm"
            isDisabled={isSelected}
            onClick={() => onSelect(office.id)}
          />
        </div>
      </VStack>
    </Card>
  );
}

/** Schematic CSS map: gradient landmasses, a graticule, and office dots. */
function SchematicMap({selectedOfficeId}: {selectedOfficeId: string}) {
  const selected = OFFICES.find(office => office.id === selectedOfficeId);
  return (
    <div
      style={styles.map}
      role="img"
      aria-label={`Schematic office map, ${
        selected ? selected.city : 'no office'
      } highlighted`}>
      <div style={styles.mapGrid} aria-hidden="true" />
      {OFFICES.map(office => {
        const isSelected = office.id === selectedOfficeId;
        return (
          <div
            key={office.id}
            aria-hidden="true"
            style={{
              ...styles.mapDot,
              ...(isSelected ? styles.mapDotSelected : undefined),
              left: `${office.mapX}%`,
              top: `${office.mapY}%`,
            }}
          />
        );
      })}
      {selected ? (
        <div
          aria-hidden="true"
          style={{
            ...styles.mapChip,
            left: `${selected.mapX}%`,
            top: `${selected.mapY}%`,
          }}>
          <Text type="supporting">{selected.city}</Text>
        </div>
      ) : null}
    </div>
  );
}

/** Inline confirmation that replaces a submitted contact form. */
function SuccessPanel({
  detail,
  onReset,
}: {
  detail: string;
  onReset: () => void;
}) {
  return (
    <div style={styles.successPanel} role="status">
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <div style={styles.successDisc} aria-hidden="true">
            <Icon icon={CheckIcon} size="md" color="inherit" />
          </div>
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="label">Message sent</Text>
              <Text type="supporting" color="secondary">
                {detail}
              </Text>
            </VStack>
          </StackItem>
        </HStack>
        <HStack gap={2}>
          <Button
            label="Send another message"
            variant="secondary"
            size="sm"
            onClick={onReset}
          />
        </HStack>
      </VStack>
    </div>
  );
}

/** One support-channel tile with a response-time chip and working CTA. */
function ChannelCard({
  channel,
  onCta,
}: {
  channel: SupportChannel;
  onCta: (channel: SupportChannel) => void;
}) {
  return (
    <Card padding={5} height="100%">
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <div
            style={{...styles.glyphTile, ...channel.glyphStyle}}
            aria-hidden="true">
            <Icon icon={channel.icon} size="md" color="inherit" />
          </div>
          <StackItem size="fill">
            <VStack gap={1}>
              <Text type="label">{channel.name}</Text>
              <HStack gap={2}>
                <Badge variant="success" label={channel.responseChip} />
              </HStack>
            </VStack>
          </StackItem>
        </HStack>
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            {channel.description}
          </Text>
        </StackItem>
        <div style={styles.fullWidthSlot}>
          <Button
            label={channel.cta}
            variant="secondary"
            onClick={() => onCta(channel)}
          />
        </div>
      </VStack>
    </Card>
  );
}

/** Two-column region that stacks to one column on narrow viewports. */
function TwoColumn({
  isStacked,
  template,
  gap,
  children,
}: {
  isStacked: boolean;
  /** Wide-viewport grid-template-columns value. */
  template: string;
  gap: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isStacked ? '1fr' : template,
        gap: `var(--spacing-${gap})`,
        alignItems: 'start',
      }}>
      {children}
    </div>
  );
}

// ============= PAGE =============

const ALL_FAQ_IDS = FAQ_ENTRIES.map(entry => entry.id);

export default function MarketingFaqContactTemplate() {
  const toast = useToast();

  // <=760px: the offset FAQ layout and the split contact layout collapse
  // from two CSS-grid columns into a single stacked column.
  const isStacked = useMediaQuery('(max-width: 760px)');

  // ---- Variant 1: multi-open accordion + expand-all control ----
  const [openAccordion, setOpenAccordion] = useState<Set<string>>(
    () => new Set([FAQ_ENTRIES[0].id]),
  );
  const allOpen = openAccordion.size === FAQ_ENTRIES.length;

  const toggleAccordion = (id: string, isOpen: boolean) => {
    setOpenAccordion(prev => {
      const next = new Set(prev);
      if (isOpen) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setOpenAccordion(allOpen ? new Set() : new Set(ALL_FAQ_IDS));
  };

  // ---- Variant 2: category filter over the Q&A grid ----
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>('all');
  const filteredEntries =
    categoryFilter === 'all'
      ? FAQ_ENTRIES
      : FAQ_ENTRIES.filter(entry => entry.category === categoryFilter);

  // ---- Variant 3: exclusive accordion (one open at a time) ----
  const [openOffset, setOpenOffset] = useState<string | null>(
    OFFSET_FAQS[0].id,
  );

  // ---- Variant 4: split form + selectable offices on the map ----
  const [selectedOfficeId, setSelectedOfficeId] = useState(OFFICES[0].id);
  const [splitForm, setSplitForm] = useState<SplitForm>(EMPTY_SPLIT_FORM);
  const [splitSubmitted, setSplitSubmitted] = useState(false);
  const [splitSent, setSplitSent] = useState(false);
  // Errors recompute every render but only surface after a submit
  // attempt, so they live-clear as the visitor fixes each field.
  const splitErrors = validateSplitForm(splitForm);
  const shownSplitErrors: SplitFormErrors = splitSubmitted
    ? splitErrors
    : {};

  const setSplitField =
    <K extends keyof SplitForm>(key: K) =>
    (value: SplitForm[K]) =>
      setSplitForm(prev => ({...prev, [key]: value}));

  const submitSplitForm = () => {
    setSplitSubmitted(true);
    if (!hasErrors(splitErrors)) {
      setSplitSent(true);
    }
  };

  const resetSplitForm = () => {
    setSplitForm(EMPTY_SPLIT_FORM);
    setSplitSubmitted(false);
    setSplitSent(false);
  };

  // ---- Variant 5: centered form with a topic Selector ----
  const [centeredForm, setCenteredForm] =
    useState<CenteredForm>(EMPTY_CENTERED_FORM);
  const [centeredSubmitted, setCenteredSubmitted] = useState(false);
  const [centeredSent, setCenteredSent] = useState(false);
  const centeredErrors = validateCenteredForm(centeredForm);
  const shownCenteredErrors: CenteredFormErrors = centeredSubmitted
    ? centeredErrors
    : {};

  const setCenteredField =
    <K extends keyof CenteredForm>(key: K) =>
    (value: CenteredForm[K]) =>
      setCenteredForm(prev => ({...prev, [key]: value}));

  const submitCenteredForm = () => {
    setCenteredSubmitted(true);
    if (!hasErrors(centeredErrors)) {
      setCenteredSent(true);
    }
  };

  const resetCenteredForm = () => {
    setCenteredForm(EMPTY_CENTERED_FORM);
    setCenteredSubmitted(false);
    setCenteredSent(false);
  };

  // ---- Variant 6 + variant 3 CTA toasts ----
  const handleChannelCta = (channel: SupportChannel) => {
    toast({body: channel.ctaToast, uniqueID: `faq-channel-${channel.id}`});
  };

  const handleSupportCta = () => {
    toast({
      body: 'Opening chat — a specialist joins in about 2 minutes',
      uniqueID: 'faq-offset-support',
    });
  };

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={1}>
                <Heading level={1}>FAQ & contact sections</Heading>
                <Text type="supporting" color="secondary">
                  Six section patterns for Lumina&rsquo;s help surface —
                  three FAQ layouts and three ways to reach support.
                </Text>
              </VStack>
            </StackItem>
            <Badge label="12 questions · 3 offices" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.content}>
            <VStack gap={6}>
              {/* ================= FAQ HALF ================= */}
              <HalfBand
                icon={CircleHelpIcon}
                title="Frequently asked questions"
                description="One question set, three presentations — accordion, filterable grid, and offset list."
              />

              {/* ---- Variant 1: accordion + expand-all ---- */}
              <VStack gap={3}>
                <HStack gap={3} vAlign="end" wrap="wrap">
                  <StackItem size="fill">
                    <VariantIntro
                      eyebrow="FAQ · Variant 1"
                      title="Single-column accordion"
                      description="Controlled rows, so any number can stay open; the header button expands or collapses everything at once."
                    />
                  </StackItem>
                  <Button
                    label={allOpen ? 'Collapse all' : 'Expand all'}
                    variant="secondary"
                    size="sm"
                    onClick={toggleAll}
                  />
                </HStack>
                <Card padding={5}>
                  <VStack gap={0}>
                    {FAQ_ENTRIES.map((entry, index) => (
                      <FaqRow
                        key={entry.id}
                        entry={entry}
                        isOpen={openAccordion.has(entry.id)}
                        isFirst={index === 0}
                        showCategory
                        onOpenChange={isOpen =>
                          toggleAccordion(entry.id, isOpen)
                        }
                      />
                    ))}
                  </VStack>
                </Card>
              </VStack>

              {/* ---- Variant 2: filterable two-column Q&A ---- */}
              <VStack gap={3}>
                <HStack gap={3} vAlign="end" wrap="wrap">
                  <StackItem size="fill">
                    <VariantIntro
                      eyebrow="FAQ · Variant 2"
                      title="Two-column Q&A with category filter"
                      description="Answers stay expanded for scanning; the segmented filter narrows the grid live."
                    />
                  </StackItem>
                  <SegmentedControl
                    label="Filter questions by category"
                    value={categoryFilter}
                    onChange={value =>
                      setCategoryFilter(value as CategoryFilter)
                    }
                    size="sm">
                    <SegmentedControlItem label="All" value="all" />
                    <SegmentedControlItem label="Billing" value="billing" />
                    <SegmentedControlItem label="Product" value="product" />
                    <SegmentedControlItem
                      label="Security"
                      value="security"
                    />
                  </SegmentedControl>
                </HStack>
                <Text type="supporting" color="secondary">
                  Showing {filteredEntries.length} of {FAQ_ENTRIES.length}{' '}
                  questions
                  {categoryFilter === 'all'
                    ? ''
                    : ` in ${CATEGORY_LABELS[categoryFilter]}`}
                  .
                </Text>
                <Grid columns={{minWidth: 300, max: 2}} gap={3}>
                  {filteredEntries.map(entry => (
                    <QaTile key={entry.id} entry={entry} />
                  ))}
                </Grid>
              </VStack>

              {/* ---- Variant 3: offset heading + exclusive accordion ---- */}
              <VStack gap={3}>
                <VariantIntro
                  eyebrow="FAQ · Variant 3"
                  title="Offset layout with support CTA"
                  description="Heading and escalation path on the left; a one-open-at-a-time question list on the right."
                />
                <TwoColumn
                  isStacked={isStacked}
                  template="minmax(0, 5fr) minmax(0, 7fr)"
                  gap={3}>
                  <Card padding={5}>
                    <VStack gap={3}>
                      <Icon
                        icon={LifeBuoyIcon}
                        size="lg"
                        color="secondary"
                      />
                      <Heading level={3}>Still have questions?</Heading>
                      <Text type="body" color="secondary">
                        These six cover most of what new teams ask. If yours
                        is not here, chat is the fastest path — a product
                        specialist answers in about two minutes during
                        business hours.
                      </Text>
                      <HStack gap={2} wrap="wrap">
                        <Button
                          label="Chat with support"
                          variant="primary"
                          onClick={handleSupportCta}
                        />
                        <Button
                          label="Browse all questions"
                          variant="secondary"
                          onClick={() =>
                            toast({
                              body: 'Opening the full help center',
                              uniqueID: 'faq-offset-browse',
                            })
                          }
                        />
                      </HStack>
                    </VStack>
                  </Card>
                  <Card padding={5}>
                    <VStack gap={0}>
                      {OFFSET_FAQS.map((entry, index) => (
                        <FaqRow
                          key={entry.id}
                          entry={entry}
                          isOpen={openOffset === entry.id}
                          isFirst={index === 0}
                          showCategory={false}
                          onOpenChange={isOpen =>
                            setOpenOffset(isOpen ? entry.id : null)
                          }
                        />
                      ))}
                    </VStack>
                  </Card>
                </TwoColumn>
              </VStack>

              <Divider />

              {/* ================= CONTACT HALF ================= */}
              <HalfBand
                icon={MailIcon}
                title="Contact sections"
                description="Three ways to open a conversation — split form with offices, centered simple form, and a channel grid."
              />

              {/* ---- Variant 4: split form + offices + map ---- */}
              <VStack gap={3}>
                <VariantIntro
                  eyebrow="Contact · Variant 4"
                  title="Split form with office locations"
                  description="Message form on the left; office cards and a schematic map on the right. Selecting an office moves the map highlight."
                />
                <TwoColumn
                  isStacked={isStacked}
                  template="minmax(0, 7fr) minmax(0, 5fr)"
                  gap={3}>
                  <Card padding={5}>
                    {splitSent ? (
                      <SuccessPanel
                        detail={`Thanks, ${splitForm.name.trim()} — we'll reply to ${splitForm.email.trim()} within one business day.`}
                        onReset={resetSplitForm}
                      />
                    ) : (
                      <VStack gap={4}>
                        <VStack gap={1}>
                          <Heading level={3}>Send us a message</Heading>
                          <Text type="supporting" color="secondary">
                            Sales and support read the same inbox — expect
                            a reply within one business day.
                          </Text>
                        </VStack>
                        <FormLayout>
                          <FormLayout direction="horizontal">
                            <TextInput
                              label="Name"
                              isRequired
                              value={splitForm.name}
                              onChange={setSplitField('name')}
                              status={
                                shownSplitErrors.name
                                  ? {
                                      type: 'error',
                                      message: shownSplitErrors.name,
                                    }
                                  : undefined
                              }
                            />
                            <TextInput
                              type="email"
                              label="Work email"
                              isRequired
                              value={splitForm.email}
                              onChange={setSplitField('email')}
                              status={
                                shownSplitErrors.email
                                  ? {
                                      type: 'error',
                                      message: shownSplitErrors.email,
                                    }
                                  : undefined
                              }
                            />
                          </FormLayout>
                          <TextInput
                            label="Company"
                            isOptional
                            placeholder="e.g. Meridian Freight"
                            value={splitForm.company}
                            onChange={setSplitField('company')}
                          />
                          <TextArea
                            label="How can we help?"
                            isRequired
                            description="Plans, rollout questions, or anything in between."
                            rows={4}
                            value={splitForm.message}
                            onChange={setSplitField('message')}
                            status={
                              shownSplitErrors.message
                                ? {
                                    type: 'error',
                                    message: shownSplitErrors.message,
                                  }
                                : undefined
                            }
                          />
                        </FormLayout>
                        <HStack gap={3} vAlign="center" wrap="wrap">
                          <Button
                            label="Send message"
                            variant="primary"
                            onClick={submitSplitForm}
                          />
                          {splitSubmitted && hasErrors(splitErrors) ? (
                            <Text type="supporting" color="secondary">
                              Fix the highlighted fields to send.
                            </Text>
                          ) : (
                            <Text type="supporting" color="secondary">
                              We never share your details.
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                    )}
                  </Card>
                  <VStack gap={3}>
                    <SchematicMap selectedOfficeId={selectedOfficeId} />
                    {OFFICES.map(office => (
                      <OfficeCard
                        key={office.id}
                        office={office}
                        isSelected={office.id === selectedOfficeId}
                        onSelect={setSelectedOfficeId}
                      />
                    ))}
                  </VStack>
                </TwoColumn>
              </VStack>

              {/* ---- Variant 5: centered simple form ---- */}
              <VStack gap={3}>
                <VariantIntro
                  eyebrow="Contact · Variant 5"
                  title="Centered simple form"
                  description="A short, single-column form with a required topic Selector for routing."
                />
                <div
                  style={{
                    width: '100%',
                    maxWidth: 560,
                    margin: '0 auto',
                    boxSizing: 'border-box',
                  }}>
                  <Card padding={5}>
                    {centeredSent ? (
                      <SuccessPanel
                        detail={`Routed to the ${topicLabel(
                          centeredForm.topic,
                        )} queue — we'll reply to ${centeredForm.email.trim()} shortly.`}
                        onReset={resetCenteredForm}
                      />
                    ) : (
                      <VStack gap={4}>
                        <VStack gap={1} hAlign="center">
                          <Icon
                            icon={SendIcon}
                            size="lg"
                            color="secondary"
                          />
                          <Heading level={3}>Get in touch</Heading>
                          <Text type="supporting" color="secondary">
                            Pick a topic and we&rsquo;ll route you to the
                            right team.
                          </Text>
                        </VStack>
                        <FormLayout>
                          <TextInput
                            label="Name"
                            isRequired
                            value={centeredForm.name}
                            onChange={setCenteredField('name')}
                            status={
                              shownCenteredErrors.name
                                ? {
                                    type: 'error',
                                    message: shownCenteredErrors.name,
                                  }
                                : undefined
                            }
                          />
                          <TextInput
                            type="email"
                            label="Email"
                            isRequired
                            value={centeredForm.email}
                            onChange={setCenteredField('email')}
                            status={
                              shownCenteredErrors.email
                                ? {
                                    type: 'error',
                                    message: shownCenteredErrors.email,
                                  }
                                : undefined
                            }
                          />
                          <Selector
                            label="Topic"
                            isRequired
                            placeholder="Choose a topic…"
                            options={TOPIC_OPTIONS}
                            value={centeredForm.topic}
                            onChange={setCenteredField('topic')}
                            status={
                              shownCenteredErrors.topic
                                ? {
                                    type: 'error',
                                    message: shownCenteredErrors.topic,
                                  }
                                : undefined
                            }
                          />
                          <TextArea
                            label="Message"
                            isRequired
                            rows={4}
                            value={centeredForm.message}
                            onChange={setCenteredField('message')}
                            status={
                              shownCenteredErrors.message
                                ? {
                                    type: 'error',
                                    message: shownCenteredErrors.message,
                                  }
                                : undefined
                            }
                          />
                        </FormLayout>
                        <div style={styles.fullWidthSlot}>
                          <Button
                            label="Send message"
                            variant="primary"
                            onClick={submitCenteredForm}
                          />
                        </div>
                        {centeredSubmitted && hasErrors(centeredErrors) ? (
                          <VStack hAlign="center">
                            <Text type="supporting" color="secondary">
                              Fix the highlighted fields to send.
                            </Text>
                          </VStack>
                        ) : null}
                      </VStack>
                    )}
                  </Card>
                </div>
              </VStack>

              {/* ---- Variant 6: support-channels grid ---- */}
              <VStack gap={3}>
                <VariantIntro
                  eyebrow="Contact · Variant 6"
                  title="Support-channels grid"
                  description="No form at all — four routes into support, each with an honest response-time chip."
                />
                <Grid columns={{minWidth: 220, max: 4}} gap={3}>
                  {SUPPORT_CHANNELS.map(channel => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      onCta={handleChannelCta}
                    />
                  ))}
                </Grid>
                <Text type="supporting" color="secondary">
                  Response times reflect business hours across the
                  Portland, Amsterdam, and Singapore offices — one of the
                  three is always awake.
                </Text>
              </VStack>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
