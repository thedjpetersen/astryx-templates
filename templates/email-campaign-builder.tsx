// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — a fixed Petrel Mail campaign draft
 *   (segment condition options with fixed match counts against a 12,400
 *   contact list, an hourly engagement histogram, subject variants, a
 *   pre-send checklist, ISO-adjacent July 2026 timestamps). No clocks, no
 *   randomness, no network media — the email mock is styled divs with CSS
 *   gradient artwork.
 * @output Email Campaign Builder — the campaign-orchestration surface for
 *   Petrel Mail, a fictional email-marketing platform. A 288px step rail
 *   (Setup done, Audience active, Content, Schedule — each with a live
 *   summary line); a scrolling canvas with the audience segment builder
 *   (three condition rows with AND/OR connectors and a live
 *   "4,218 of 12,400 contacts match" chip), the content step (subject +
 *   preheader fields above a styled newsletter mock), and the schedule step
 *   (send-time optimizer card with an hourly engagement histogram
 *   recommending Tue 10:14 AM, and an A/B subject test card with a 20/80
 *   split slider whose recipient counts reconcile with the segment); plus a
 *   pinned pre-send checklist strip (2 pass, 1 warning: missing alt text).
 * @position Page template; emitted by `astryx template email-campaign-builder`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | start rail 288 (step list + campaign meta strip pinned below)
 *   | content (scrolling canvas: audience section, then a wrap-capable
 *   two-column band — content/email preview beside the schedule cards, in
 *   step order) | footer checklist strip.
 * Container policy: app-shell archetype — frame rows and panels for the
 *   chrome; Cards only for the two genuine summary widgets (send-time
 *   optimizer, A/B subject test). The segment builder is styled rows, the
 *   email mock is a styled artifact div, the step rail is buttons.
 * Color policy: token-pure chrome. ONE brand accent (Petrel goldenrod)
 *   as light-dark(#A16207, #FACC15): wordmark, active step, CTA scope
 *   (re-pins --color-accent to solid #A16207 — white text 4.9:1 in both
 *   schemes), matching-count chip, recommended histogram bar. Exception:
 *   the email preview canvas is scheme-locked LIGHT (colorScheme: 'light',
 *   explicit literals) because the mock renders the actual email artifact,
 *   which ships on a white body regardless of app theme.
 *
 * Responsive contract:
 * - The content/schedule band wraps on its OWN width (flex-basis 460/400),
 *   not a viewport query, so it degrades correctly inside narrow embeds:
 *   wide canvas = content (step 3) left, schedule (step 4) right; narrow
 *   canvas = single column in step order — audience, content (fields above
 *   the mock), schedule; canvas remains one scroll context.
 * - <= 900px: the step rail is dropped; a horizontal step-chip strip
 *   renders at the top of the canvas instead. Header and footer rows wrap
 *   (flexWrap) rather than clip; checklist chips wrap to a second line.
 * - Canvas is the single scroll body (`minHeight: 0` down the flex chain);
 *   header, rail, and checklist footer are pinned.
 */

import {
  useMemo,
  useState,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  CalendarClockIcon,
  CheckCircle2Icon,
  CheckIcon,
  FeatherIcon,
  FlaskConicalIcon,
  ImageOffIcon,
  PlusIcon,
  SendIcon,
  SparklesIcon,
  TriangleAlertIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// BRAND — Petrel Mail goldenrod. Light side yellow-700, dark side yellow-400.
// ---------------------------------------------------------------------------

/** Accent for text/icons/strokes: 4.9:1 on white, 11:1 on the dark body. */
const BRAND_ACCENT = 'light-dark(#A16207, #FACC15)';
/** Tinted fills only — never text. */
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(161, 98, 7, 0.11), rgba(250, 204, 21, 0.15))';
/**
 * Solid CTA surface. #A16207 keeps white on-accent text at 4.93:1 in BOTH
 * schemes, so brand-primary Buttons simply re-pin `--color-accent` here.
 */
const BRAND_SOLID = '#A16207';
/** Scoped re-pin wrapper style for design-system primary Buttons. */
const brandCtaScope = {'--color-accent': BRAND_SOLID} as CSSProperties;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},

  // Header ------------------------------------------------------------------
  brandMark: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
    backgroundColor: BRAND_ACCENT_SOFT, color: BRAND_ACCENT,
  },
  wordmark: {fontWeight: 700, whiteSpace: 'nowrap'},
  headerDivider: {alignSelf: 'stretch'},

  // Step rail ---------------------------------------------------------------
  railRoot: {
    display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
  },
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-3)'},
  railMeta: {
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-3)', flexShrink: 0,
  },
  stepButton: {
    display: 'flex', gap: 'var(--spacing-3)', width: '100%', textAlign: 'start',
    background: 'none', border: 'none', font: 'inherit', color: 'inherit',
    cursor: 'pointer', padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)', boxSizing: 'border-box',
  },
  stepButtonActive: {
    backgroundColor: BRAND_ACCENT_SOFT,
    boxShadow: `inset 0 0 0 1px ${BRAND_ACCENT}`,
  },
  stepGlyphCol: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 4, flexShrink: 0,
  },
  stepCircle: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 24, height: 24, borderRadius: '50%', boxSizing: 'border-box',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)', flexShrink: 0,
  },
  stepCircleDone: {backgroundColor: BRAND_ACCENT, color: 'light-dark(#FFFFFF, #422006)'},
  stepCircleActive: {
    border: `2px solid ${BRAND_ACCENT}`, color: BRAND_ACCENT,
  },
  stepCircleUpcoming: {
    border: '2px solid var(--color-border-strong, var(--color-border))',
    color: 'var(--color-text-secondary)',
  },
  stepConnector: {
    width: 2, flex: 1, minHeight: 12, borderRadius: 1,
    backgroundColor: 'var(--color-border)',
  },
  stepBody: {minWidth: 0, paddingBottom: 'var(--spacing-1)'},

  // Compact step-chip strip ---------------------------------------------------
  stepChip: {
    display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-1)',
    padding: '4px 10px', borderRadius: 999, cursor: 'pointer', font: 'inherit',
    fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)', color: 'inherit',
  },
  stepChipActive: {
    backgroundColor: BRAND_ACCENT_SOFT, borderColor: BRAND_ACCENT,
    color: BRAND_ACCENT, fontWeight: 'var(--font-weight-semibold)',
  },

  // Canvas ------------------------------------------------------------------
  canvasScroll: {height: '100%', minHeight: 0, overflowY: 'auto'},
  canvasColumn: {
    maxWidth: 1220, margin: '0 auto', boxSizing: 'border-box',
    padding: 'var(--spacing-4) var(--spacing-5) var(--spacing-8)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)',
  },
  section: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-4)',
  },
  sectionActive: {boxShadow: `inset 0 0 0 1px ${BRAND_ACCENT}`, borderColor: BRAND_ACCENT},
  sectionKicker: {
    color: BRAND_ACCENT, fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-semibold)', letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },

  // Audience builder ----------------------------------------------------------
  condRow: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  condLead: {width: 104, flexShrink: 0},
  matchChip: {
    display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)',
    padding: '6px 12px', borderRadius: 999,
    backgroundColor: BRAND_ACCENT_SOFT, color: BRAND_ACCENT,
    fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)',
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  },

  // Two-column band (wraps on its own width — no viewport query) --------------
  band: {
    display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)',
    alignItems: 'flex-start',
  },
  contentCol: {flex: '1 1 460px', minWidth: 0},
  scheduleCol: {
    flex: '1 1 400px', minWidth: 0, display: 'flex', flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },

  // Histogram -----------------------------------------------------------------
  histWrap: {marginTop: 'var(--spacing-2)'},
  histBars: {
    display: 'flex', alignItems: 'flex-end', gap: 3, height: 96,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    paddingInline: 2,
  },
  histBar: {
    flex: 1, borderRadius: '3px 3px 0 0', minWidth: 0,
    backgroundColor: 'light-dark(rgba(71, 85, 105, 0.28), rgba(148, 163, 184, 0.32))',
  },
  histBarPeak: {backgroundColor: BRAND_ACCENT},
  histXLabels: {
    display: 'flex', paddingInline: 2, marginTop: 4,
  },
  histXLabel: {
    flex: 1, textAlign: 'center', fontSize: 11,
    color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums',
  },

  // A/B test --------------------------------------------------------------
  variantChip: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
    fontSize: 12, fontWeight: 700,
    backgroundColor: BRAND_ACCENT_SOFT, color: BRAND_ACCENT,
  },
  splitRow: {paddingInline: 4},

  // Checklist footer ------------------------------------------------------
  checkChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap',
    fontSize: 'var(--font-size-sm)', fontVariantNumeric: 'tabular-nums',
    border: 'var(--border-width) solid var(--color-border)',
  },
  checkChipPass: {
    color: 'light-dark(#15803D, #4ADE80)',
    backgroundColor: 'light-dark(rgba(21, 128, 61, 0.08), rgba(74, 222, 128, 0.10))',
  },
  checkChipWarn: {
    color: 'light-dark(#92400E, #FCD34D)',
    backgroundColor: 'light-dark(rgba(217, 119, 6, 0.10), rgba(252, 211, 77, 0.12))',
    borderColor: 'light-dark(rgba(146, 64, 14, 0.35), rgba(252, 211, 77, 0.35))',
  },
  // Email preview (scheme-locked LIGHT artifact — explicit literals only;
  // the mock is the email as subscribers see it, always a white body) -------
  previewHead: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    flexWrap: 'wrap', marginBottom: 'var(--spacing-3)',
  },
  inboxLine: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    marginBottom: 'var(--spacing-3)', minWidth: 0,
  },
  emailCanvas: {
    colorScheme: 'light',
    backgroundColor: '#FFFFFF', color: '#374151',
    border: '1px solid light-dark(#E2E8F0, #52525B)',
    borderRadius: 'var(--radius-container)',
    width: '100%', maxWidth: 620, marginInline: 'auto',
    padding: '24px 28px', boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column', gap: 16,
    fontSize: 14, lineHeight: '22px',
  },
  emailHeaderRow: {
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    gap: 12, flexWrap: 'wrap',
  },
  emailWordmark: {
    color: '#A16207', fontWeight: 800, fontSize: 18, letterSpacing: '0.01em',
  },
  emailIssueTag: {color: '#6B7280', fontSize: 12},
  emailHero: {
    height: 168, borderRadius: 8, position: 'relative', overflow: 'hidden',
    background:
      'linear-gradient(135deg, #FDE68A 0%, #D97706 55%, #92400E 100%)',
  },
  altWarnChip: {
    position: 'absolute', insetBlockStart: 8, insetInlineStart: 8,
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 999,
    backgroundColor: '#FEF3C7', color: '#92400E',
    fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    border: '1px solid rgba(146, 64, 14, 0.35)',
  },
  emailH1: {
    margin: 0, fontSize: 22, lineHeight: '28px', fontWeight: 700,
    color: '#111827',
  },
  emailP: {margin: 0},
  emailCta: {
    alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center',
    backgroundColor: '#A16207', color: '#FFFFFF', fontWeight: 600,
    fontSize: 14, lineHeight: '20px', padding: '10px 18px', borderRadius: 6,
  },
  emailRule: {border: 'none', borderTop: '1px solid #E5E7EB', margin: 0},
  emailSectionLabel: {
    margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#6B7280',
  },
  emailArticleRow: {display: 'flex', gap: 12, alignItems: 'flex-start'},
  emailThumb: {
    width: 64, height: 64, borderRadius: 8, flexShrink: 0,
    position: 'relative', overflow: 'hidden',
  },
  thumbWarnDot: {
    position: 'absolute', insetBlockEnd: 4, insetInlineStart: 4,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 18, height: 18, borderRadius: '50%',
    backgroundColor: '#FEF3C7', color: '#92400E',
    border: '1px solid rgba(146, 64, 14, 0.35)',
  },
  emailArticleTitle: {
    margin: 0, fontSize: 14, fontWeight: 600, color: '#111827',
    lineHeight: '20px',
  },
  emailArticleBlurb: {margin: 0, fontSize: 13, lineHeight: '19px', color: '#6B7280'},
  emailFooterBlock: {textAlign: 'center', fontSize: 12, lineHeight: '18px', color: '#6B7280'},
  emailFooterLink: {color: '#6B7280', textDecoration: 'underline'},
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic; every count reconciles (see computeMatchCount)
// ---------------------------------------------------------------------------

const TOTAL_CONTACTS = 12400;

type StepId = 'setup' | 'audience' | 'content' | 'schedule';

const STEP_ORDER: {id: StepId; title: string}[] = [
  {id: 'setup', title: 'Setup'},
  {id: 'audience', title: 'Audience'},
  {id: 'content', title: 'Content'},
  {id: 'schedule', title: 'Schedule'},
];

type FieldKey = 'activity' | 'tags' | 'location';
type OperatorKey = 'is' | 'isnot';
type ConnectorKey = 'and' | 'or';

interface Condition {
  id: string;
  connector: ConnectorKey; // ignored on the first row
  field: FieldKey;
  operator: OperatorKey;
  value: string;
}

const FIELD_OPTIONS = [
  {value: 'activity', label: 'Campaign activity'},
  {value: 'tags', label: 'Tag'},
  {value: 'location', label: 'Location'},
];

const OPERATOR_OPTIONS = [
  {value: 'is', label: 'is'},
  {value: 'isnot', label: 'is not'},
];

/**
 * Fixed match counts per value against the 12,400-contact list. Combined
 * counts assume independence: AND multiplies by the ratio, OR adds the
 * non-overlapping remainder. The default three rows (opened last 5 AND tag
 * Product updates AND location United States) round to exactly 4,218.
 */
const VALUE_OPTIONS: Record<FieldKey, {value: string; label: string; matches: number}[]> = {
  activity: [
    {value: 'opened-5', label: 'Opened any of the last 5 campaigns', matches: 7750},
    {value: 'clicked-5', label: 'Clicked any of the last 5 campaigns', matches: 3995},
    {value: 'opened-last', label: 'Opened the last campaign', matches: 5166},
  ],
  tags: [
    {value: 'product-updates', label: 'Product updates', matches: 8472},
    {value: 'beta-testers', label: 'Beta testers', matches: 1940},
    {value: 'vip', label: 'VIP customers', matches: 620},
  ],
  location: [
    {value: 'us', label: 'United States', matches: 9878},
    {value: 'ca', label: 'Canada', matches: 1320},
    {value: 'uk', label: 'United Kingdom', matches: 984},
  ],
};

const INITIAL_CONDITIONS: Condition[] = [
  {id: 'c1', connector: 'and', field: 'activity', operator: 'is', value: 'opened-5'},
  {id: 'c2', connector: 'and', field: 'tags', operator: 'is', value: 'product-updates'},
  {id: 'c3', connector: 'and', field: 'location', operator: 'is', value: 'us'},
];

function conditionMatches(c: Condition): number {
  const opt = VALUE_OPTIONS[c.field].find(v => v.value === c.value);
  const matches = opt ? opt.matches : 0;
  return c.operator === 'isnot' ? TOTAL_CONTACTS - matches : matches;
}

function computeMatchCount(conditions: Condition[]): number {
  const combined = conditions.reduce((acc, c, i) => {
    const m = conditionMatches(c);
    const ratio = m / TOTAL_CONTACTS;
    if (i === 0) return m;
    return c.connector === 'and' ? acc * ratio : acc + m - acc * ratio;
  }, 0);
  return Math.round(combined);
}

const numberFmt = new Intl.NumberFormat('en-US');
const fmt = (n: number) => numberFmt.format(n);

/** Avg open rate (%) by send hour, last 90 days of Petrel sends. */
const HOURLY_ENGAGEMENT: {hour: number; label: string; rate: number}[] = [
  {hour: 6, label: '6a', rate: 9},
  {hour: 7, label: '7a', rate: 13},
  {hour: 8, label: '8a', rate: 18},
  {hour: 9, label: '9a', rate: 26},
  {hour: 10, label: '10a', rate: 38},
  {hour: 11, label: '11a', rate: 33},
  {hour: 12, label: '12p', rate: 29},
  {hour: 13, label: '1p', rate: 24},
  {hour: 14, label: '2p', rate: 21},
  {hour: 15, label: '3p', rate: 17},
  {hour: 16, label: '4p', rate: 14},
  {hour: 17, label: '5p', rate: 12},
  {hour: 18, label: '6p', rate: 15},
  {hour: 19, label: '7p', rate: 11},
  {hour: 20, label: '8p', rate: 8},
];
const PEAK_HOUR = 10; // Tue, Jul 7, 10:14 AM EDT — max of HOURLY_ENGAGEMENT
const HIST_MAX_RATE = 40; // y-axis ceiling; peak bar is 38%

const CHECKLIST: {id: string; status: 'pass' | 'warning'; label: string}[] = [
  {id: 'links', status: 'pass', label: 'All 12 links verified'},
  {id: 'unsub', status: 'pass', label: 'Unsubscribe footer present'},
  {id: 'alt', status: 'warning', label: '2 images missing alt text'},
];

/** Gradient stand-ins for article thumbnails (locked-light email canvas). */
const EMAIL_ARTICLES = [
  {
    id: 'a1',
    title: 'Segment builder leaves beta',
    blurb: 'Three-condition logic with AND/OR connectors is now on every plan.',
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #134E4A 100%)',
    missingAlt: true,
  },
  {
    id: 'a2',
    title: 'Deliverability report: June',
    blurb: 'Inbox placement held at 98.2% across the Petrel network last month.',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #312E81 100%)',
    missingAlt: false,
  },
];

// ---------------------------------------------------------------------------
// STEP RAIL
// ---------------------------------------------------------------------------

interface StepNavProps {
  activeStep: StepId;
  onSelect: (id: StepId) => void;
  summaries: Record<StepId, string>;
}

function stepStatus(id: StepId, activeStep: StepId): 'done' | 'active' | 'upcoming' {
  if (id === 'setup') return 'done';
  return id === activeStep ? 'active' : 'upcoming';
}

function StepRail({activeStep, onSelect, summaries}: StepNavProps) {
  return (
    <nav style={styles.railRoot} aria-label="Campaign steps">
      <div style={styles.railScroll}>
        <VStack gap={1}>
          {STEP_ORDER.map((step, i) => {
            const status = stepStatus(step.id, activeStep);
            const isActive = step.id === activeStep;
            const circleStyle =
              status === 'done'
                ? styles.stepCircleDone
                : status === 'active'
                  ? styles.stepCircleActive
                  : styles.stepCircleUpcoming;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onSelect(step.id)}
                aria-current={isActive ? 'step' : undefined}
                style={{
                  ...styles.stepButton,
                  ...(isActive ? styles.stepButtonActive : null),
                }}>
                <span style={styles.stepGlyphCol} aria-hidden>
                  <span style={{...styles.stepCircle, ...circleStyle}}>
                    {status === 'done' ? (
                      <Icon icon={CheckIcon} size="xsm" color="inherit" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  {i < STEP_ORDER.length - 1 ? (
                    <span style={styles.stepConnector} />
                  ) : null}
                </span>
                <span style={styles.stepBody}>
                  <VStack gap={0.5}>
                    <HStack gap={2} vAlign="center">
                      <Text type="label" size="sm">
                        {step.title}
                      </Text>
                      {status === 'done' ? (
                        <Badge label="Done" variant="success" />
                      ) : null}
                      {status === 'active' ? (
                        <Badge label="Editing" variant="yellow" />
                      ) : null}
                    </HStack>
                    <Text type="supporting" color="secondary" maxLines={2}>
                      {summaries[step.id]}
                    </Text>
                  </VStack>
                </span>
              </button>
            );
          })}
        </VStack>
      </div>
      <div style={styles.railMeta}>
        <VStack gap={1}>
          <Text type="supporting" color="secondary">
            Created Jul 1, 2026 · by Dana Okafor
          </Text>
          <Text type="supporting" color="secondary">
            Draft autosaved today, 9:42 AM
          </Text>
        </VStack>
      </div>
    </nav>
  );
}

function StepChips({activeStep, onSelect, summaries}: StepNavProps) {
  return (
    <nav aria-label="Campaign steps">
      <HStack gap={2} wrap="wrap" vAlign="center">
        {STEP_ORDER.map((step, i) => {
          const status = stepStatus(step.id, activeStep);
          const isActive = step.id === activeStep;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelect(step.id)}
              aria-current={isActive ? 'step' : undefined}
              title={summaries[step.id]}
              style={{
                ...styles.stepChip,
                ...(isActive ? styles.stepChipActive : null),
              }}>
              {status === 'done' ? (
                <Icon icon={CheckIcon} size="xsm" color="inherit" />
              ) : (
                <span aria-hidden>{i + 1}.</span>
              )}
              {step.title}
            </button>
          );
        })}
      </HStack>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// AUDIENCE SEGMENT BUILDER
// ---------------------------------------------------------------------------

interface AudienceSectionProps {
  conditions: Condition[];
  onConditionsChange: Dispatch<SetStateAction<Condition[]>>;
  matchCount: number;
  isActive: boolean;
}

function nextConditionId(conditions: Condition[]): string {
  let n = 1;
  while (conditions.some(c => c.id === `c${n}`)) n += 1;
  return `c${n}`;
}

function AudienceSection({
  conditions,
  onConditionsChange,
  matchCount,
  isActive,
}: AudienceSectionProps) {
  const patch = (id: string, changes: Partial<Condition>) => {
    onConditionsChange(prev =>
      prev.map(c => (c.id === id ? {...c, ...changes} : c)),
    );
  };
  const changeField = (id: string, field: FieldKey) => {
    patch(id, {field, operator: 'is', value: VALUE_OPTIONS[field][0].value});
  };
  const removeRow = (id: string) => {
    onConditionsChange(prev =>
      prev.length > 1 ? prev.filter(c => c.id !== id) : prev,
    );
  };
  const addRow = () => {
    onConditionsChange(prev =>
      prev.length >= 5
        ? prev
        : [
            ...prev,
            {
              id: nextConditionId(prev),
              connector: 'and',
              field: 'tags',
              operator: 'is',
              value: VALUE_OPTIONS.tags[0].value,
            },
          ],
    );
  };
  const matchPct = Math.round((matchCount / TOTAL_CONTACTS) * 100);

  return (
    <section
      aria-label="Audience segment builder"
      style={{...styles.section, ...(isActive ? styles.sectionActive : null)}}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={0.5}>
              <span style={styles.sectionKicker}>Step 2 · Audience</span>
              <Heading level={4} accessibilityLevel={2}>
                Who gets this campaign
              </Heading>
            </VStack>
          </StackItem>
          <span style={styles.matchChip}>
            <Icon icon={UsersIcon} size="sm" color="inherit" />
            {fmt(matchCount)} of {fmt(TOTAL_CONTACTS)} contacts match
          </span>
        </HStack>
        <Text type="supporting" color="secondary">
          Segment of the Petrel Digest list · {matchPct}% of your audience.
          Counts update as you edit conditions.
        </Text>
        <Divider />
        <VStack gap={2}>
          {conditions.map((cond, i) => (
            <div key={cond.id} style={styles.condRow}>
              <span style={styles.condLead}>
                {i === 0 ? (
                  <Text type="label" size="sm" color="secondary">
                    Contacts who
                  </Text>
                ) : (
                  <SegmentedControl
                    label={`Connector for condition ${i + 1}`}
                    value={cond.connector}
                    onChange={value =>
                      patch(cond.id, {connector: value as ConnectorKey})
                    }
                    size="sm">
                    <SegmentedControlItem label="AND" value="and" />
                    <SegmentedControlItem label="OR" value="or" />
                  </SegmentedControl>
                )}
              </span>
              <Selector
                label={`Condition ${i + 1} field`}
                isLabelHidden
                options={FIELD_OPTIONS}
                value={cond.field}
                onChange={value => changeField(cond.id, value as FieldKey)}
                size="sm"
                width={180}
              />
              <Selector
                label={`Condition ${i + 1} operator`}
                isLabelHidden
                options={OPERATOR_OPTIONS}
                value={cond.operator}
                onChange={value =>
                  patch(cond.id, {operator: value as OperatorKey})
                }
                size="sm"
                width={104}
              />
              <div style={{flex: 1, minWidth: 240}}>
                <Selector
                  label={`Condition ${i + 1} value`}
                  isLabelHidden
                  options={VALUE_OPTIONS[cond.field].map(v => ({
                    value: v.value,
                    label: v.label,
                  }))}
                  value={cond.value}
                  onChange={value => patch(cond.id, {value: value as string})}
                  size="sm"
                  width="100%"
                />
              </div>
              <IconButton
                icon={<Icon icon={XIcon} size="sm" />}
                label={`Remove condition ${i + 1}`}
                variant="ghost"
                size="sm"
                isDisabled={conditions.length === 1}
                onClick={() => removeRow(cond.id)}
              />
            </div>
          ))}
        </VStack>
        <HStack gap={2}>
          <Button
            label="Add condition"
            variant="ghost"
            size="sm"
            icon={<Icon icon={PlusIcon} size="sm" />}
            isDisabled={conditions.length >= 5}
            onClick={addRow}
          />
        </HStack>
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CONTENT STEP — subject/preheader fields above the newsletter mock
// ---------------------------------------------------------------------------

function EmailPreviewMock() {
  return (
    <div style={styles.emailCanvas} aria-label="Email body preview">
      <div style={styles.emailHeaderRow}>
        <span style={styles.emailWordmark}>Petrel</span>
        <span style={styles.emailIssueTag}>July Product Digest · No. 31</span>
      </div>
      <div style={styles.emailHero} role="img" aria-label="Hero image placeholder (missing alt text)">
        <span style={styles.altWarnChip}>
          <Icon icon={ImageOffIcon} size="xsm" color="inherit" />
          Missing alt text
        </span>
      </div>
      <h1 style={styles.emailH1}>Meet Send-time Autopilot</h1>
      <p style={styles.emailP}>
        Petrel now watches when each subscriber actually opens and reads, then
        delivers your campaign in that window — no more guessing between the
        Tuesday-morning myth and your gut. Autopilot is rolling out to every
        Flightpath plan this week.
      </p>
      <span style={styles.emailCta}>Read the full digest</span>
      <hr style={styles.emailRule} />
      <p style={styles.emailSectionLabel}>Also this month</p>
      {EMAIL_ARTICLES.map(article => (
        <div key={article.id} style={styles.emailArticleRow}>
          <div
            style={{...styles.emailThumb, background: article.gradient}}
            role="img"
            aria-label={
              article.missingAlt
                ? 'Article thumbnail (missing alt text)'
                : `${article.title} thumbnail`
            }>
            {article.missingAlt ? (
              <span style={styles.thumbWarnDot} title="Missing alt text">
                <Icon icon={ImageOffIcon} size="xsm" color="inherit" />
              </span>
            ) : null}
          </div>
          <div>
            <p style={styles.emailArticleTitle}>{article.title}</p>
            <p style={styles.emailArticleBlurb}>{article.blurb}</p>
          </div>
        </div>
      ))}
      <hr style={styles.emailRule} />
      <div style={styles.emailFooterBlock}>
        © 2026 Petrel Mail · 410 Harbor Light Ave, Portland, ME 04101
        <br />
        <span style={styles.emailFooterLink}>Unsubscribe</span>
        {' · '}
        <span style={styles.emailFooterLink}>Email preferences</span>
      </div>
    </div>
  );
}

interface ContentSectionProps {
  subjectA: string;
  onSubjectAChange: (value: string) => void;
  preheader: string;
  onPreheaderChange: (value: string) => void;
  isActive: boolean;
}

function ContentSection({
  subjectA,
  onSubjectAChange,
  preheader,
  onPreheaderChange,
  isActive,
}: ContentSectionProps) {
  return (
    <section
      aria-label="Content and email preview"
      style={{...styles.section, ...(isActive ? styles.sectionActive : null)}}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={0.5}>
              <span style={styles.sectionKicker}>Step 3 · Content</span>
              <Heading level={4} accessibilityLevel={2}>
                Subject &amp; email body
              </Heading>
            </VStack>
          </StackItem>
          <Badge label="Draft saved 9:42 AM" variant="neutral" />
        </HStack>
        <TextInput
          label="Subject line (Variant A)"
          value={subjectA}
          onChange={onSubjectAChange}
          size="sm"
        />
        <TextInput
          label="Preheader"
          value={preheader}
          onChange={onPreheaderChange}
          description="Preview text shown after the subject in most inboxes."
          size="sm"
        />
        <div style={styles.inboxLine}>
          <Text type="label" size="sm" maxLines={1}>
            Petrel Crew — {subjectA}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {preheader}
          </Text>
        </div>
        <EmailPreviewMock />
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// SCHEDULE STEP — send-time optimizer + A/B subject test cards
// ---------------------------------------------------------------------------

interface SendTimeCardProps {
  matchCount: number;
  sendMode: string;
  onSendModeChange: (value: string) => void;
}

function SendTimeCard({matchCount, sendMode, onSendModeChange}: SendTimeCardProps) {
  return (
    <Card>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={SparklesIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={5} accessibilityLevel={3}>
              Send-time optimizer
            </Heading>
          </StackItem>
          <Badge label="Recommended" variant="yellow" />
        </HStack>
        <HStack gap={2} vAlign="center">
          <Icon icon={CalendarClockIcon} size="md" color="secondary" />
          <VStack gap={0.5}>
            <Text type="label" hasTabularNumbers>
              Tue, Jul 7 · 10:14 AM EDT
            </Text>
            <Text type="supporting" color="secondary">
              Best predicted engagement for {fmt(matchCount)} recipients
            </Text>
          </VStack>
        </HStack>
        <div style={styles.histWrap}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Avg open rate by send hour · last 90 days
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              peak 38% at 10a
            </Text>
          </HStack>
          <div
            style={styles.histBars}
            role="img"
            aria-label="Histogram of average open rate by send hour; peak 38 percent at 10 AM, lowest 8 percent at 8 PM">
            {HOURLY_ENGAGEMENT.map(bucket => (
              <div
                key={bucket.hour}
                title={`${bucket.label}: ${bucket.rate}%`}
                style={{
                  ...styles.histBar,
                  ...(bucket.hour === PEAK_HOUR ? styles.histBarPeak : null),
                  height: `${(bucket.rate / HIST_MAX_RATE) * 100}%`,
                }}
              />
            ))}
          </div>
          <div style={styles.histXLabels} aria-hidden>
            {HOURLY_ENGAGEMENT.map(bucket => (
              <span key={bucket.hour} style={styles.histXLabel}>
                {bucket.hour % 2 === 0 ? bucket.label : ''}
              </span>
            ))}
          </div>
        </div>
        <RadioList
          label="Delivery strategy"
          value={sendMode}
          onChange={onSendModeChange}>
          <RadioListItem
            label="Optimize per contact (recommended)"
            description="Each contact gets the send inside their own peak window."
            value="optimized"
          />
          <RadioListItem
            label="Send to everyone at 10:14 AM"
            description="One blast at the network-wide peak hour."
            value="fixed"
          />
          <RadioListItem
            label="Pick a custom time"
            description="Choose your own date and hour on the next step."
            value="custom"
          />
        </RadioList>
      </VStack>
    </Card>
  );
}

interface AbTestCardProps {
  subjectA: string;
  subjectB: string;
  onSubjectBChange: (value: string) => void;
  split: number;
  onSplitChange: (value: number) => void;
  isEnabled: boolean;
  onEnabledChange: (value: boolean) => void;
  matchCount: number;
}

function AbTestCard({
  subjectA,
  subjectB,
  onSubjectBChange,
  split,
  onSplitChange,
  isEnabled,
  onEnabledChange,
  matchCount,
}: AbTestCardProps) {
  const variantACount = Math.round((matchCount * split) / 100);
  const variantBCount = matchCount - variantACount;
  return (
    <Card>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={FlaskConicalIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={5} accessibilityLevel={3}>
              A/B subject test
            </Heading>
          </StackItem>
          <Switch
            label="Enable A/B subject test"
            isLabelHidden
            value={isEnabled}
            onChange={onEnabledChange}
          />
        </HStack>
        <HStack gap={2} vAlign="center">
          <span style={styles.variantChip} aria-hidden>
            A
          </span>
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="label" size="sm" maxLines={1}>
                {subjectA}
              </Text>
              <Text type="supporting" color="secondary">
                Uses the Content step subject line
              </Text>
            </VStack>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {split}% · {fmt(variantACount)}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <span style={styles.variantChip} aria-hidden>
            B
          </span>
          <StackItem size="fill">
            <TextInput
              label="Variant B subject line"
              isLabelHidden
              value={subjectB}
              onChange={onSubjectBChange}
              isDisabled={!isEnabled}
              size="sm"
            />
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {100 - split}% · {fmt(variantBCount)}
          </Text>
        </HStack>
        <div style={styles.splitRow}>
          <Slider
            label="Split between variants"
            value={split}
            onChange={onSplitChange}
            min={10}
            max={90}
            step={5}
            isDisabled={!isEnabled}
            formatValue={value => `A ${value}% / B ${100 - value}%`}
            valueDisplay="text"
            marks={[
              {value: 20, label: '20/80'},
              {value: 50, label: '50/50'},
              {value: 80, label: '80/20'},
            ]}
          />
        </div>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {fmt(variantACount)} + {fmt(variantBCount)} = {fmt(matchCount)}{' '}
          recipients · opens tracked per variant for 4 hours.
        </Text>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

export default function EmailCampaignBuilderTemplate() {
  const toast = useToast();
  const isCompact = useMediaQuery('(max-width: 900px)');

  const [activeStep, setActiveStep] = useState<StepId>('audience');
  const [conditions, setConditions] = useState<Condition[]>(INITIAL_CONDITIONS);
  const [subjectA, setSubjectA] = useState('Send-time Autopilot is here');
  const [subjectB, setSubjectB] = useState('Stop guessing when to hit send');
  const [preheader, setPreheader] = useState(
    'Plus: the segment builder leaves beta, and July product notes.',
  );
  const [split, setSplit] = useState(20);
  const [sendMode, setSendMode] = useState('optimized');
  const [isAbEnabled, setIsAbEnabled] = useState(true);

  const matchCount = useMemo(() => computeMatchCount(conditions), [conditions]);

  const summaries: Record<StepId, string> = {
    setup: 'Petrel Crew · hello@petrel.email',
    audience: `Engaged product readers · ${fmt(matchCount)} recipients`,
    content: isAbEnabled
      ? '2 subject variants · July digest body'
      : '1 subject line · July digest body',
    schedule:
      sendMode === 'custom'
        ? 'Custom time · not set'
        : 'Suggested Tue, Jul 7 · 10:14 AM EDT',
  };

  const warningCount = CHECKLIST.filter(c => c.status === 'warning').length;
  const passCount = CHECKLIST.length - warningCount;

  const contentSection = (
    <ContentSection
      subjectA={subjectA}
      onSubjectAChange={setSubjectA}
      preheader={preheader}
      onPreheaderChange={setPreheader}
      isActive={activeStep === 'content'}
    />
  );

  const scheduleSection = (
    <section
      aria-label="Schedule"
      style={{
        ...styles.section,
        ...(activeStep === 'schedule' ? styles.sectionActive : null),
      }}>
      <VStack gap={3}>
        <VStack gap={0.5}>
          <span style={styles.sectionKicker}>Step 4 · Schedule</span>
          <Heading level={4} accessibilityLevel={2}>
            When it goes out
          </Heading>
        </VStack>
        <SendTimeCard
          matchCount={matchCount}
          sendMode={sendMode}
          onSendModeChange={setSendMode}
        />
        <AbTestCard
          subjectA={subjectA}
          subjectB={subjectB}
          onSubjectBChange={setSubjectB}
          split={split}
          onSplitChange={setSplit}
          isEnabled={isAbEnabled}
          onEnabledChange={setIsAbEnabled}
          matchCount={matchCount}
        />
      </VStack>
    </section>
  );

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <span style={styles.brandMark}>
            <Icon icon={FeatherIcon} size="sm" color="inherit" />
          </span>
          <Text type="label" style={styles.wordmark}>
            Petrel Mail
          </Text>
        </HStack>
        <Divider orientation="vertical" style={styles.headerDivider} />
        <StackItem size="fill">
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Heading level={1} maxLines={1}>
              July Product Digest — Wave 2
            </Heading>
            <Badge label="Draft" variant="neutral" />
            {!isCompact ? (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                To: Engaged product readers · {fmt(matchCount)} of{' '}
                {fmt(TOTAL_CONTACTS)}
              </Text>
            ) : null}
          </HStack>
        </StackItem>
        <HStack gap={2} vAlign="center">
          <Button
            label="Send test"
            variant="ghost"
            size="sm"
            icon={<Icon icon={SendIcon} size="sm" />}
            onClick={() =>
              toast({body: 'Test email sent to dana@petrel.email'})
            }
          />
          <Button label="Save & exit" variant="secondary" size="sm" />
          <span style={brandCtaScope}>
            <Button
              label="Review & schedule"
              variant="primary"
              size="sm"
              onClick={() => setActiveStep('schedule')}
            />
          </span>
        </HStack>
      </HStack>
    </LayoutHeader>
  );

  const footer = (
    <LayoutFooter hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <Text type="label" size="sm">
          Pre-send checklist
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {passCount} passed · {warningCount} warning
        </Text>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center" wrap="wrap">
            {CHECKLIST.map(item => (
              <span
                key={item.id}
                style={{
                  ...styles.checkChip,
                  ...(item.status === 'pass'
                    ? styles.checkChipPass
                    : styles.checkChipWarn),
                }}>
                <Icon
                  icon={
                    item.status === 'pass' ? CheckCircle2Icon : TriangleAlertIcon
                  }
                  size="sm"
                  color="inherit"
                />
                {item.label}
              </span>
            ))}
            <Button
              label="Review alt text"
              variant="ghost"
              size="sm"
              onClick={() => setActiveStep('content')}
            />
          </HStack>
        </StackItem>
        <Text type="supporting" color="secondary">
          Resolve the warning before scheduling.
        </Text>
      </HStack>
    </LayoutFooter>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        footer={footer}
        start={
          !isCompact ? (
            <LayoutPanel width={288} padding={0} hasDivider label="Campaign steps">
              <StepRail
                activeStep={activeStep}
                onSelect={setActiveStep}
                summaries={summaries}
              />
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.canvasScroll}>
              <div style={styles.canvasColumn}>
                {isCompact ? (
                  <StepChips
                    activeStep={activeStep}
                    onSelect={setActiveStep}
                    summaries={summaries}
                  />
                ) : null}
                <AudienceSection
                  conditions={conditions}
                  onConditionsChange={setConditions}
                  matchCount={matchCount}
                  isActive={activeStep === 'audience'}
                />
                <div style={styles.band}>
                  <div style={styles.contentCol}>{contentSection}</div>
                  <div style={styles.scheduleCol}>{scheduleSection}</div>
                </div>
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
