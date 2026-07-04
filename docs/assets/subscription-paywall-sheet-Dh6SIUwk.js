var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (two plan cards whose math reconciles —
 *   $12.49/mo x 12 = $149.88/yr vs $89.99/yr = 40% saved, $2.88/wk vs
 *   $1.73/wk; a 4-row benefit list; a 4.8 / 210K-ratings social-proof strip;
 *   a fixed July 2026 trial timeline: today Jul 3 unlock, day 5 Jul 7
 *   reminder, day 7 Jul 9 first charge)
 * @output Bottom-sheet paywall specimen sheet for the fictional meditation
 *   app "Lumo" (lavender accent): two phone-width specimens side by side
 *   under mono caption Tokens. Specimen 01 is the live paywall sheet —
 *   hero glyph + value prop, monthly/annual plan toggle cards with per-week
 *   price math and a SAVE 40% badge on annual, four benefit rows with
 *   icons, a star-rating strip, a vertical free-trial timeline stepper,
 *   a brand-accent CTA with trial fine print, and restore / terms links;
 *   selecting a plan re-derives the fine print and the day-7 charge line.
 *   Specimen 02 is the post-trial-started confirmation state: success
 *   glyph, plan summary rows, the same timeline with today completed, and
 *   session / manage actions.
 * @position Page template; emitted by \`astryx template subscription-paywall-sheet\`
 *
 * Frame: block specimen stage, not an app shell. A muted full-viewport
 * stage (minHeight 100dvh) centers a small caption header and a wrapping
 * specimen row. Each specimen is a 390px phone frame: a scrimmed app-peek
 * band (the home screen behind the modal) with the sheet rising over it —
 * rounded top corners, grab handle, close button.
 *
 * Responsive contract:
 * - Specimens sit side by side and wrap to a single centered column when
 *   the stage is narrower than ~2 x 390px + gap.
 * - Phone frames are width min(390px, 100%); all sheet content is a single
 *   natural-height column, so nothing scrolls internally or clips.
 * - Plan cards stay a 2-up row at phone width by design (each ~167px).
 *
 * Container policy: specimen-gallery archetype. The phone frame and sheet
 * are custom divs (device chrome, not content Cards); inside the sheet,
 * plan cards and the confirmation summary are bordered surface tiles
 * because they are genuine selectable / summary widgets.
 *
 * Color policy: exactly ONE brand accent — Lumo lavender,
 * light-dark(#6D28D9, #A78BFA) — used for the hero glyph, selected plan
 * ring + radio, star strip, timeline nodes, and the primary CTA (text on
 * accent uses light-dark(#FFFFFF, #221744); both pairings clear AA). The
 * app-peek band behind the sheet is fixed-literal lavender gradient
 * artwork under a dark scrim, identical in both schemes (it depicts the
 * dimmed app behind the modal, not themed UI). Everything else is
 * token-pure.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';
import {
  AudioLinesIcon,
  BellIcon,
  CheckIcon,
  CreditCardIcon,
  HeartPulseIcon,
  LockOpenIcon,
  MoonStarIcon,
  SparklesIcon,
  XIcon,
  type LucideIcon,
} from 'lucide-react';

import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Token} from '@astryxdesign/core/Token';

// ============= BRAND =============
// Lumo lavender — the single brand accent (see Color policy above).
const BRAND_ACCENT = 'light-dark(#6D28D9, #A78BFA)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(109,40,217,0.10), rgba(167,139,250,0.16))';
const BRAND_ON_ACCENT = 'light-dark(#FFFFFF, #221744)';

// ============= DATA =============
// Deterministic fixtures. Price math reconciles everywhere it repeats:
//   Monthly $12.49/mo -> $12.49 x 12 = $149.88/yr -> 12.49 x 12 / 52 = $2.88/wk
//   Annual  $89.99/yr -> 89.99 / 149.88 = 60.04% of monthly -> SAVE 40%
//                        89.99 / 52 = $1.73/wk
// Trial dates: starts Jul 3, 2026 (day 1); day 5 = Jul 7; day 7 = Jul 9.

type PlanId = 'monthly' | 'annual';

interface Plan {
  id: PlanId;
  label: string;
  price: string;
  cadence: string;
  perWeek: string;
  savings?: string;
  renewalCopy: string;
}

const PLANS: Plan[] = [
  {
    id: 'annual',
    label: 'Annual',
    price: '$89.99',
    cadence: '/yr',
    perWeek: '$1.73/wk',
    savings: 'SAVE 40%',
    renewalCopy: '$89.99/yr ($1.73/wk)',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$12.49',
    cadence: '/mo',
    perWeek: '$2.88/wk',
    renewalCopy: '$12.49/mo ($2.88/wk)',
  },
];

interface Benefit {
  id: string;
  icon: LucideIcon;
  label: string;
  detail: string;
}

const BENEFITS: Benefit[] = [
  {
    id: 'sleep',
    icon: MoonStarIcon,
    label: 'Sleep stories & wind-downs',
    detail: '400+ sessions, new every week',
  },
  {
    id: 'plan',
    icon: SparklesIcon,
    label: 'Daily Calm Plan',
    detail: 'Tuned to your morning check-in',
  },
  {
    id: 'offline',
    icon: AudioLinesIcon,
    label: 'Offline listening',
    detail: 'Download any session',
  },
  {
    id: 'insights',
    icon: HeartPulseIcon,
    label: 'Mood & breath insights',
    detail: 'Weekly trends and gentle nudges',
  },
];

interface TrialStep {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
}

// Day-7 charge copy is derived per selected plan inside the specimen.
const TRIAL_STEPS: Omit<TrialStep, 'body'>[] = [
  {id: 'today', icon: LockOpenIcon, title: 'Today · Jul 3'},
  {id: 'day5', icon: BellIcon, title: 'Day 5 · Jul 7'},
  {id: 'day7', icon: CreditCardIcon, title: 'Day 7 · Jul 9'},
];

const STEP_BODIES: Record<string, string> = {
  today: 'Everything in Lumo Plus unlocks — you pay nothing today.',
  day5: 'We send a reminder that your trial is about to end.',
};

const RATING_SUMMARY = '4.8 · 210K ratings';

// Hoisted step-completion sets (stable identities across renders).
const NO_STEPS_DONE: ReadonlySet<string> = new Set();
const TODAY_DONE: ReadonlySet<string> = new Set(['today']);

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // --- Stage ---
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-muted)',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-6)',
  },
  stageHeader: {textAlign: 'center', maxWidth: 560},
  captionRow: {paddingInline: 'var(--spacing-1)'},
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-8)',
  },
  specimen: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    width: 'min(390px, 100%)',
  },
  // --- Phone frame + sheet chrome ---
  phone: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
    boxShadow: 'var(--shadow-high)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-background-card)',
  },
  // Fixed-literal lavender artwork: the dimmed app home screen behind the
  // modal sheet. Identical in both schemes; documented in Color policy.
  appPeek: {
    position: 'relative',
    height: 104,
    flexShrink: 0,
    background: 'linear-gradient(160deg, #8B74D8 0%, #5F4BA8 55%, #40307A 100%)',
  },
  peekBar: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  peekScrim: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(16,10,34,0.45)',
  },
  sheet: {
    position: 'relative',
    zIndex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'var(--color-background-card)',
    padding:
      'var(--spacing-2) var(--spacing-4) var(--spacing-4) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  grabHandle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'var(--color-border)',
    marginInline: 'auto',
    flexShrink: 0,
  },
  closeButton: {
    position: 'absolute',
    insetInlineEnd: 'var(--spacing-2)',
    insetBlockStart: 'var(--spacing-2)',
  },
  // --- Hero ---
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-4)',
  },
  heroGlyph: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // --- Plan toggle cards ---
  planGroup: {display: 'flex', gap: 'var(--spacing-2)'},
  planCard: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    boxSizing: 'border-box',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-3)',
    textAlign: 'start',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    fontFamily: 'inherit',
    color: 'inherit',
  },
  planCardSelected: {
    borderColor: BRAND_ACCENT,
    boxShadow: \`inset 0 0 0 1px \${BRAND_ACCENT}\`,
    backgroundColor: BRAND_ACCENT_SOFT,
  },
  saveBadge: {
    position: 'absolute',
    top: -9,
    insetInlineEnd: 'var(--spacing-2)',
    borderRadius: 999,
    paddingBlock: 1,
    paddingInline: 8,
    backgroundColor: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    lineHeight: '16px',
  },
  radioRow: {display: 'flex', alignItems: 'center', gap: 6},
  radioDot: {
    width: 14,
    height: 14,
    boxSizing: 'border-box',
    borderRadius: 999,
    border: '2px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    flexShrink: 0,
  },
  radioDotSelected: {
    border: \`4px solid \${BRAND_ACCENT}\`,
  },
  perWeek: {color: BRAND_ACCENT, fontWeight: 600},
  // --- Benefits ---
  benefitList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  benefitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitText: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  // --- Rating strip ---
  ratingStrip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
  },
  stars: {
    color: BRAND_ACCENT,
    letterSpacing: 2,
    fontSize: 13,
    lineHeight: 1,
  },
  // --- Trial timeline stepper ---
  timeline: {display: 'flex', flexDirection: 'column'},
  stepRow: {display: 'flex', gap: 'var(--spacing-2)'},
  stepGlyphCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 28,
    flexShrink: 0,
  },
  stepNode: {
    width: 28,
    height: 28,
    boxSizing: 'border-box',
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNodeAccent: {
    backgroundColor: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
  },
  stepNodeSoft: {
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 10,
    backgroundColor: 'var(--color-border)',
  },
  stepBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    paddingBottom: 'var(--spacing-3)',
  },
  stepBodyLast: {paddingBottom: 0},
  // --- CTA + links ---
  cta: {
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    borderRadius: 999,
    paddingBlock: 12,
    paddingInline: 'var(--spacing-4)',
    backgroundColor: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  ctaSecondary: {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    paddingBlock: 11,
    paddingInline: 'var(--spacing-4)',
    backgroundColor: 'transparent',
    color: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  finePrint: {textAlign: 'center', paddingInline: 'var(--spacing-2)'},
  linksRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flexWrap: 'wrap',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    padding: 'var(--spacing-1)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    fontFamily: 'inherit',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
    cursor: 'pointer',
  },
  // --- Confirmation specimen ---
  confirmGlyph: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    overflow: 'hidden',
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
  },
};

// ============= SHARED BUILDING BLOCKS =============

/** Specimen wrapper: mono caption Token + one-line note above the phone. */
function Specimen({
  stateId,
  note,
  children,
}: {
  stateId: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div style={styles.specimen}>
      <div style={styles.captionRow}>
        <HStack gap={2} vAlign="center">
          <span style={{flexShrink: 0}}>
            <Token label={stateId} size="sm" color="gray" />
          </span>
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        </HStack>
      </div>
      {children}
    </div>
  );
}

/**
 * Phone frame: scrimmed lavender app-peek band (ghost bars stand in for
 * the home screen behind the modal) with the sheet rising over it.
 */
function PhoneSheet({
  sheetLabel,
  onClose,
  children,
}: {
  sheetLabel: string;
  onClose?: () => void;
  children: ReactNode;
}) {
  return (
    <div style={styles.phone}>
      <div style={styles.appPeek} aria-hidden="true">
        <div style={{...styles.peekBar, top: 18, left: 20, width: 96, height: 10}} />
        <div style={{...styles.peekBar, top: 40, left: 20, width: 148, height: 8}} />
        <div
          style={{
            ...styles.peekBar,
            top: 18,
            right: 20,
            width: 28,
            height: 28,
            borderRadius: 999,
          }}
        />
        <div style={styles.peekScrim} />
      </div>
      <section aria-label={sheetLabel} style={styles.sheet}>
        <div style={styles.grabHandle} aria-hidden="true" />
        {onClose != null ? (
          <div style={styles.closeButton}>
            <IconButton
              label="Dismiss paywall"
              tooltip="Dismiss"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={onClose}
            />
          </div>
        ) : null}
        {children}
      </section>
    </div>
  );
}

/** One row of the vertical trial-timeline stepper. */
function TimelineStep({
  step,
  body,
  isDone,
  isLast,
}: {
  step: Omit<TrialStep, 'body'>;
  body: string;
  isDone: boolean;
  isLast: boolean;
}) {
  const nodeStyle = isDone
    ? {...styles.stepNode, ...styles.stepNodeAccent}
    : {...styles.stepNode, ...styles.stepNodeSoft};
  return (
    <li style={styles.stepRow}>
      <div style={styles.stepGlyphCol}>
        <div style={nodeStyle}>
          <Icon icon={isDone ? CheckIcon : step.icon} size="sm" color="inherit" />
        </div>
        {!isLast && <div style={styles.stepLine} />}
      </div>
      <div style={isLast ? {...styles.stepBody, ...styles.stepBodyLast} : styles.stepBody}>
        <Text type="label" size="sm">
          {step.title}
          {isDone ? ' — done' : ''}
        </Text>
        <Text type="supporting" color="secondary">
          {body}
        </Text>
      </div>
    </li>
  );
}
/** Vertical trial timeline; day-7 body is derived from the chosen plan. */
function TrialTimeline({
  chargeBody,
  doneStepIds,
}: {
  chargeBody: string;
  doneStepIds: ReadonlySet<string>;
}) {
  return (
    <ol style={{...styles.timeline, margin: 0, padding: 0, listStyle: 'none'}}>
      {TRIAL_STEPS.map((step, index) => (
        <TimelineStep
          key={step.id}
          step={step}
          body={step.id === 'day7' ? chargeBody : STEP_BODIES[step.id]}
          isDone={doneStepIds.has(step.id)}
          isLast={index === TRIAL_STEPS.length - 1}
        />
      ))}
    </ol>
  );
}

/** Star-rating social-proof strip: ★★★★★ 4.8 · 210K ratings. */
function RatingStrip() {
  return (
    <div style={styles.ratingStrip}>
      <span style={styles.stars} aria-hidden="true">
        ★★★★★
      </span>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        <span aria-label="Rated 4.8 out of 5, 210,000 ratings">
          {RATING_SUMMARY}
        </span>
      </Text>
    </div>
  );
}

/** Four benefit rows with tinted icon tiles. */
function BenefitList() {
  return (
    <div style={styles.benefitList}>
      {BENEFITS.map(benefit => (
        <div key={benefit.id} style={styles.benefitRow}>
          <div style={styles.benefitIcon}>
            <Icon icon={benefit.icon} size="sm" color="inherit" />
          </div>
          <div style={styles.benefitText}>
            <Text type="label" size="sm">
              {benefit.label}
            </Text>
            <Text type="supporting" color="secondary">
              {benefit.detail}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Terms / restore footer links. */
function FooterLinks() {
  return (
    <div style={styles.linksRow}>
      <button type="button" style={styles.linkButton}>
        Restore purchases
      </button>
      <Text type="supporting" color="secondary">
        ·
      </Text>
      <button type="button" style={styles.linkButton}>
        Terms
      </button>
      <Text type="supporting" color="secondary">
        ·
      </Text>
      <button type="button" style={styles.linkButton}>
        Privacy
      </button>
    </div>
  );
}
// ============= SPECIMEN 01 · PAYWALL =============

/** One selectable plan card (radio semantics inside the radiogroup). */
function PlanCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: (id: PlanId) => void;
}) {
  const cardStyle = isSelected
    ? {...styles.planCard, ...styles.planCardSelected}
    : styles.planCard;
  const dotStyle = isSelected
    ? {...styles.radioDot, ...styles.radioDotSelected}
    : styles.radioDot;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      style={cardStyle}
      onClick={() => onSelect(plan.id)}>
      {plan.savings != null && <span style={styles.saveBadge}>{plan.savings}</span>}
      <div style={styles.radioRow}>
        <span style={dotStyle} aria-hidden="true" />
        <Text type="label" size="sm">
          {plan.label}
        </Text>
      </div>
      <HStack gap={1} vAlign="end">
        <Text type="label" hasTabularNumbers>
          {plan.price}
        </Text>
        <Text type="supporting" color="secondary">
          {plan.cadence}
        </Text>
      </HStack>
      <Text type="supporting" hasTabularNumbers style={styles.perWeek}>
        {plan.perWeek}
      </Text>
    </button>
  );
}

/** The live paywall sheet; plan choice re-derives fine print + charge line. */
function PaywallSpecimen() {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>('annual');
  const selectedPlan =
    PLANS.find(plan => plan.id === selectedPlanId) ?? PLANS[0];
  const chargeBody = \`First charge of \${selectedPlan.renewalCopy} — cancel before Jul 9 to pay nothing.\`;

  return (
    <Specimen
      stateId="01 · paywall"
      note="Plan choice re-derives fine print + day-7 charge.">
      <PhoneSheet sheetLabel="Lumo Plus paywall" onClose={() => {}}>
        <div style={styles.hero}>
          <div style={styles.heroGlyph}>
            <Icon icon={MoonStarIcon} size="lg" color="inherit" />
          </div>
          <Heading level={3} accessibilityLevel={2}>
            Unlock Lumo Plus
          </Heading>
          <Text type="supporting" color="secondary">
            Sleep deeper and stress less with every story, meditation, and
            daily plan — free for 7 days.
          </Text>
        </div>
        <div
          role="radiogroup"
          aria-label="Choose a plan"
          style={styles.planGroup}>
          {PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={plan.id === selectedPlanId}
              onSelect={setSelectedPlanId}
            />
          ))}
        </div>
        <BenefitList />
        <RatingStrip />
        <Divider />
        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary">
            How your free trial works
          </Text>
          <TrialTimeline chargeBody={chargeBody} doneStepIds={NO_STEPS_DONE} />
        </VStack>
        <VStack gap={2}>
          <button type="button" style={styles.cta}>
            Start 7-day free trial
          </button>
          <div style={styles.finePrint}>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              7 days free, then {selectedPlan.renewalCopy}. Cancel anytime in
              Settings.
            </Text>
          </div>
        </VStack>
        <FooterLinks />
      </PhoneSheet>
    </Specimen>
  );
}
// ============= SPECIMEN 02 · TRIAL-STARTED CONFIRMATION =============

const CONFIRMATION_SUMMARY: {id: string; label: string; value: string}[] = [
  {id: 'plan', label: 'Plan', value: 'Lumo Plus · Annual'},
  {id: 'trial', label: 'Free trial ends', value: 'Jul 9, 2026'},
  {id: 'reminder', label: 'Reminder', value: 'Jul 7, 2026'},
  {id: 'then', label: 'Then', value: '$89.99/yr ($1.73/wk)'},
];

/** Static post-purchase state: the annual trial has just started. */
function ConfirmationSpecimen() {
  return (
    <Specimen
      stateId="02 · trial-started"
      note="Confirmation state after the annual trial begins.">
      <PhoneSheet sheetLabel="Free trial started confirmation">
        <div style={styles.hero}>
          <div style={styles.confirmGlyph}>
            <Icon icon={CheckIcon} size="lg" color="inherit" />
          </div>
          <Heading level={3} accessibilityLevel={2}>
            Your free trial is on
          </Heading>
          <Text type="supporting" color="secondary">
            Lumo Plus unlocked · started Jul 3, 2026
          </Text>
        </div>
        <div style={styles.summaryCard}>
          {CONFIRMATION_SUMMARY.map((row, index) => (
            <div key={row.id}>
              {index > 0 && <Divider />}
              <div style={styles.summaryRow}>
                <Text type="supporting" color="secondary">
                  {row.label}
                </Text>
                <Text type="label" size="sm" hasTabularNumbers>
                  {row.value}
                </Text>
              </div>
            </div>
          ))}
        </div>
        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary">
            What happens next
          </Text>
          <TrialTimeline
            chargeBody="First charge of $89.99/yr ($1.73/wk) — cancel before Jul 9 to pay nothing."
            doneStepIds={TODAY_DONE}
          />
        </VStack>
        <VStack gap={2}>
          <button type="button" style={styles.cta}>
            Start your first session
          </button>
          <button type="button" style={styles.ctaSecondary}>
            Manage subscription
          </button>
        </VStack>
        <div style={styles.finePrint}>
          <Text type="supporting" color="secondary">
            We&rsquo;ll remind you on Jul 7 — two days before your first
            charge.
          </Text>
        </div>
      </PhoneSheet>
    </Specimen>
  );
}

// ============= STAGE =============

export default function SubscriptionPaywallSheetTemplate() {
  return (
    <div style={styles.stage}>
      <div style={styles.stageHeader}>
        <VStack gap={1} hAlign="center">
          <Heading level={1}>
            Lumo — subscription paywall sheet
          </Heading>
          <Text type="supporting" color="secondary">
            Bottom-sheet paywall · 2 specimens · deterministic July 2026
            fixtures
          </Text>
        </VStack>
      </div>
      <div style={styles.specimenRow}>
        <PaywallSpecimen />
        <ConfirmationSpecimen />
      </div>
    </div>
  );
}
`;export{e as default};