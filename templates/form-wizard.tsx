// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (step definitions, region/role/plan
 *   options, prefilled workspace values seeded into useState)
 * @output Form Wizard: workspace-setup flow with a numbered step indicator
 *   across the top (done / current / upcoming states), exactly one step
 *   visible at a time inside a centered Card, Back/Next footer actions with
 *   per-step validation, and a final Review step summarizing every answer
 *   in a MetadataList
 * @position Page template; emitted by `astryx template form-wizard`
 *
 * Frame: Layout height="fill". LayoutHeader carries the wizard title, a
 * "Step N of 4" position readout, and a ghost Cancel action. LayoutContent
 * scrolls and centers a single max-width column: stepper, step Card, footer
 * actions. A wizard is one focused task, so the form lives in one Card —
 * no panels, no side rails.
 *
 * Responsive contract:
 * - Content column: maxWidth 720, centered with viewport-side padding at
 *   every width; the step Card always fills the column.
 * - Stepper: >640px shows numbered circles with step titles beneath;
 *   <=640px hides the titles (circles + connectors only) — the current
 *   step's title stays visible in the header readout and the Card heading.
 * - Form fields: FormLayout vertical at all widths; inputs stretch to the
 *   column, never sit side by side, so nothing reflows mid-flow.
 * - Footer: Back stays left, Next/Create stays right via StackItem fill;
 *   the row never wraps because both buttons keep intrinsic width.
 * - Review MetadataList: columns="multi" auto-fills 2-up on wide viewports
 *   and collapses to a single column as the card narrows.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Selector} from '@astryxdesign/core/Selector';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Switch} from '@astryxdesign/core/Switch';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered single-task column; side padding keeps the card off the
  // viewport edges at every width.
  column: {
    maxWidth: 720,
    margin: '0 auto',
    padding: 'var(--spacing-6) var(--spacing-4)',
    boxSizing: 'border-box',
  },
  // Stepper: an <ol> of steps joined by connector bars.
  stepper: {
    display: 'flex',
    alignItems: 'flex-start',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    width: '100%',
  },
  // Reset button chrome so done steps stay visually identical to the
  // rest of the stepper while remaining real, focusable buttons.
  stepButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    width: '100%',
    background: 'none',
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
  },
  circle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    boxSizing: 'border-box',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    flexShrink: 0,
  },
  circleDone: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-text-inverse, #fff)',
  },
  circleCurrent: {
    border: '2px solid var(--color-accent)',
    color: 'var(--color-accent)',
    backgroundColor: 'transparent',
  },
  circleUpcoming: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // Connectors sit on the circle's vertical center (28px circle → 13px
  // top offset for a 2px bar) and flex to fill the space between steps.
  connector: {
    flex: 1,
    height: 2,
    marginTop: 13,
    backgroundColor: 'var(--color-border, var(--color-background-muted))',
  },
  connectorDone: {
    backgroundColor: 'var(--color-accent)',
  },
};

// ============= DATA =============

const STEPS = [
  {id: 'workspace', title: 'Workspace'},
  {id: 'team', title: 'Team'},
  {id: 'plan', title: 'Plan'},
  {id: 'review', title: 'Review'},
];

const REGION_OPTIONS = [
  {value: 'us-east', label: 'US East (N. Virginia)'},
  {value: 'us-west', label: 'US West (Oregon)'},
  {value: 'eu-central', label: 'EU Central (Frankfurt)'},
  {value: 'ap-southeast', label: 'Asia Pacific (Singapore)'},
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  member: 'Member',
  guest: 'Guest',
};

const PLANS = [
  {
    id: 'starter',
    label: 'Starter',
    pricePerSeat: 0,
    description: 'Up to 5 members, 3 projects, community support.',
  },
  {
    id: 'growth',
    label: 'Growth',
    pricePerSeat: 24,
    description: 'Unlimited projects, integrations, and standard support.',
  },
  {
    id: 'scale',
    label: 'Scale',
    pricePerSeat: 48,
    description: 'Advanced controls, 99.9% SLA, and dedicated support.',
  },
];

const ADDONS = [
  {
    id: 'sso',
    label: 'SSO / SAML',
    description: 'Single sign-on through Okta, Entra ID, or Google.',
  },
  {
    id: 'audit',
    label: 'Audit log export',
    description: 'Stream workspace audit events to your SIEM.',
  },
  {
    id: 'support',
    label: 'Priority support',
    description: '4-hour response target from the support team.',
  },
];

// ============= COMPONENTS =============

function Stepper({
  currentStep,
  onStepSelect,
  isCompact,
}: {
  currentStep: number;
  onStepSelect: (index: number) => void;
  isCompact: boolean;
}) {
  return (
    <nav aria-label="Setup progress">
      <ol style={styles.stepper}>
        {STEPS.map((step, index) => {
          const state =
            index < currentStep
              ? 'done'
              : index === currentStep
                ? 'current'
                : 'upcoming';
          const circleStyle = {
            ...styles.circle,
            ...(state === 'done'
              ? styles.circleDone
              : state === 'current'
                ? styles.circleCurrent
                : styles.circleUpcoming),
          };
          const content = (
            <>
              <div style={circleStyle} aria-hidden="true">
                {state === 'done' ? '✓' : index + 1}
              </div>
              {!isCompact && (
                <Text
                  type="supporting"
                  color={state === 'upcoming' ? 'secondary' : 'primary'}>
                  {step.title}
                </Text>
              )}
            </>
          );
          return (
            <StepFrame
              key={step.id}
              hasConnector={index > 0}
              // A connector is "done" when the step it leads from is done,
              // so the bar into the current step renders filled.
              done={index <= currentStep}
              // Fixed slot width keeps circles evenly spaced whether the
              // step renders as a button (done) or a div; compact mode
              // shrinks slots to the circle so 4 steps fit a 375px viewport.
              width={isCompact ? 28 : 96}>
              {state === 'done' ? (
                // Completed steps are real buttons: revisit without losing
                // any entered values (state lives at the wizard root).
                <button
                  type="button"
                  style={styles.stepButton}
                  onClick={() => onStepSelect(index)}
                  aria-label={`Go back to step ${index + 1}: ${step.title}`}>
                  {content}
                </button>
              ) : (
                <div
                  style={styles.step}
                  aria-current={state === 'current' ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${step.title}${
                    state === 'current' ? ' (current)' : ''
                  }`}>
                  {content}
                </div>
              )}
            </StepFrame>
          );
        })}
      </ol>
    </nav>
  );
}

/** One <li> per step; steps after the first carry a leading connector. */
function StepFrame({
  hasConnector,
  done,
  width,
  children,
}: {
  hasConnector: boolean;
  done: boolean;
  width: number;
  children: React.ReactNode;
}) {
  return (
    <>
      {hasConnector && (
        <li
          role="presentation"
          aria-hidden="true"
          style={{
            ...styles.connector,
            ...(done ? styles.connectorDone : undefined),
          }}
        />
      )}
      <li
        style={{
          display: 'flex',
          justifyContent: 'center',
          width,
          flexShrink: 0,
        }}>
        {children}
      </li>
    </>
  );
}

export default function FormWizardTemplate() {
  const [step, setStep] = useState(0);

  // ---- Field values (one useState per field keeps handlers trivial) ----
  // Step 1 — Workspace
  const [workspaceName, setWorkspaceName] = useState('Northwind Robotics');
  const [slug, setSlug] = useState('northwind');
  const [region, setRegion] = useState('us-east');
  // Step 2 — Team
  const [invites, setInvites] = useState(
    'amara.diallo@northwind.dev\nfelix.tran@northwind.dev\nrosa.marchetti@northwind.dev',
  );
  const [defaultRole, setDefaultRole] = useState('member');
  // Step 3 — Plan
  const [plan, setPlan] = useState('growth');
  const [addons, setAddons] = useState<string[]>(['audit']);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const isCompact = useMediaQuery('(max-width: 640px)');

  // ---- Derived, deterministic review values ----
  const inviteList = useMemo(
    () =>
      invites
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean),
    [invites],
  );
  const selectedPlan = PLANS.find(item => item.id === plan) ?? PLANS[0];
  const seatCount = inviteList.length + 1; // invited members + the owner
  const monthlyEstimate = selectedPlan.pricePerSeat * seatCount;
  const regionLabel =
    REGION_OPTIONS.find(option => option.value === region)?.label ?? region;
  const addonLabels = ADDONS.filter(addon => addons.includes(addon.id)).map(
    addon => addon.label,
  );

  // Per-step gate for the Next button. Steps 2–4 have no required fields.
  const canAdvance =
    step !== 0 || (workspaceName.trim().length > 0 && slug.trim().length > 0);

  const isReview = step === STEPS.length - 1;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Create workspace</Heading>
                <Text type="supporting" color="secondary">
                  Step {step + 1} of {STEPS.length}: {STEPS[step].title}
                </Text>
              </HStack>
            </StackItem>
            <Button label="Cancel" variant="ghost" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.column}>
            <VStack gap={5}>
              <Stepper
                currentStep={step}
                onStepSelect={setStep}
                isCompact={isCompact}
              />

              <Card padding={5} width="100%">
                {step === 0 && (
                  <VStack gap={4}>
                    <VStack gap={1}>
                      <Heading level={2}>Workspace details</Heading>
                      <Text type="supporting" color="secondary">
                        Name your workspace and pick where its data lives.
                        The region cannot be changed later.
                      </Text>
                    </VStack>
                    <FormLayout>
                      <TextInput
                        label="Workspace name"
                        isRequired
                        value={workspaceName}
                        onChange={setWorkspaceName}
                        placeholder="Acme Inc."
                      />
                      <TextInput
                        label="Workspace URL"
                        isRequired
                        description={`terrace.app/${slug.trim() || 'your-workspace'}`}
                        value={slug}
                        onChange={setSlug}
                        placeholder="acme"
                      />
                      <Selector
                        label="Data region"
                        options={REGION_OPTIONS}
                        value={region}
                        onChange={setRegion}
                      />
                    </FormLayout>
                  </VStack>
                )}

                {step === 1 && (
                  <VStack gap={4}>
                    <VStack gap={1}>
                      <Heading level={2}>Invite your team</Heading>
                      <Text type="supporting" color="secondary">
                        Teammates get an email invite when the workspace is
                        created. You can always invite more people later.
                      </Text>
                    </VStack>
                    <FormLayout>
                      <TextArea
                        label="Email addresses"
                        description="One address per line."
                        isOptional
                        rows={4}
                        value={invites}
                        onChange={setInvites}
                        placeholder={'jordan@acme.com\npriya@acme.com'}
                      />
                      <RadioList
                        label="Default role for invitees"
                        value={defaultRole}
                        onChange={setDefaultRole}>
                        <RadioListItem
                          label="Admin"
                          value="admin"
                          description="Manage billing, members, and workspace settings."
                        />
                        <RadioListItem
                          label="Member"
                          value="member"
                          description="Create and edit projects; no admin settings."
                        />
                        <RadioListItem
                          label="Guest"
                          value="guest"
                          description="View and comment on shared projects only."
                        />
                      </RadioList>
                    </FormLayout>
                  </VStack>
                )}

                {step === 2 && (
                  <VStack gap={4}>
                    <VStack gap={1}>
                      <Heading level={2}>Choose a plan</Heading>
                      <Text type="supporting" color="secondary">
                        Billed monthly per seat. Switch plans or add
                        capabilities at any time from workspace settings.
                      </Text>
                    </VStack>
                    <FormLayout>
                      <RadioList label="Plan" value={plan} onChange={setPlan}>
                        {PLANS.map(item => (
                          <RadioListItem
                            key={item.id}
                            label={
                              item.pricePerSeat === 0
                                ? `${item.label} — Free`
                                : `${item.label} — $${item.pricePerSeat}/seat/mo`
                            }
                            value={item.id}
                            description={item.description}
                            endContent={
                              item.id === 'growth' ? (
                                <Badge variant="success" label="Recommended" />
                              ) : undefined
                            }
                          />
                        ))}
                      </RadioList>
                      <CheckboxList
                        label="Add-ons"
                        description="Optional capabilities billed alongside the plan."
                        value={addons}
                        onChange={setAddons}>
                        {ADDONS.map(addon => (
                          <CheckboxListItem
                            key={addon.id}
                            label={addon.label}
                            value={addon.id}
                            description={addon.description}
                          />
                        ))}
                      </CheckboxList>
                      <Switch
                        label="Weekly usage digest"
                        description="Email admins a summary of seats and activity every Monday."
                        value={weeklyDigest}
                        onChange={setWeeklyDigest}
                      />
                    </FormLayout>
                  </VStack>
                )}

                {isReview && (
                  <VStack gap={4}>
                    <VStack gap={1}>
                      <Heading level={2}>Review and create</Heading>
                      <Text type="supporting" color="secondary">
                        Everything look right? Use the steps above to go back
                        and edit — nothing is saved until you create the
                        workspace.
                      </Text>
                    </VStack>
                    <MetadataList columns="multi">
                      <MetadataListItem label="Workspace name">
                        {workspaceName.trim() || '—'}
                      </MetadataListItem>
                      <MetadataListItem label="Workspace URL">
                        terrace.app/{slug.trim() || '—'}
                      </MetadataListItem>
                      <MetadataListItem label="Data region">
                        {regionLabel}
                      </MetadataListItem>
                      <MetadataListItem label="Invitations">
                        {inviteList.length === 0
                          ? 'None yet'
                          : `${inviteList.length} teammate${
                              inviteList.length === 1 ? '' : 's'
                            } as ${ROLE_LABELS[defaultRole] ?? defaultRole}`}
                      </MetadataListItem>
                      <MetadataListItem label="Plan">
                        {selectedPlan.pricePerSeat === 0
                          ? `${selectedPlan.label} (Free)`
                          : `${selectedPlan.label} ($${selectedPlan.pricePerSeat}/seat/mo)`}
                      </MetadataListItem>
                      <MetadataListItem label="Add-ons">
                        {addonLabels.length === 0
                          ? 'None'
                          : addonLabels.join(', ')}
                      </MetadataListItem>
                      <MetadataListItem label="Weekly digest">
                        {weeklyDigest ? 'On' : 'Off'}
                      </MetadataListItem>
                      <MetadataListItem label="Estimated monthly cost">
                        {monthlyEstimate === 0
                          ? '$0'
                          : `$${monthlyEstimate} (${seatCount} seats)`}
                      </MetadataListItem>
                    </MetadataList>
                    <Divider />
                    <Text type="supporting" color="secondary">
                      By creating this workspace you agree to the Terrace
                      Terms of Service and Data Processing Addendum.
                    </Text>
                  </VStack>
                )}
              </Card>

              <HStack gap={2} vAlign="center">
                <Button
                  label="Back"
                  variant="secondary"
                  isDisabled={step === 0}
                  onClick={() => setStep(current => Math.max(0, current - 1))}
                />
                <StackItem size="fill">
                  {step === 0 && !canAdvance && (
                    <Text type="supporting" color="secondary">
                      Enter a workspace name and URL to continue.
                    </Text>
                  )}
                </StackItem>
                <Button
                  label={isReview ? 'Create workspace' : 'Next'}
                  variant="primary"
                  isDisabled={!canAdvance}
                  onClick={() =>
                    !isReview &&
                    setStep(current =>
                      Math.min(STEPS.length - 1, current + 1),
                    )
                  }
                />
              </HStack>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
