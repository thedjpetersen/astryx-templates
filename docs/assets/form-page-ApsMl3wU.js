var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (saved account values, country/state
 *   options, notification preference copy)
 * @output Account settings form page: a centered single-column form grouped
 *   into three Sections (profile, billing address, notifications) built on
 *   FormLayout, with Field descriptions, live email validation surfaced
 *   through FieldStatus, and a sticky footer action bar with Cancel and
 *   Save pinned in the frame
 * @position Page template; emitted by \`astryx template form-page\`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the page
 * title and scope line; LayoutContent scrolls the form column; LayoutFooter
 * is the sticky action bar (dirty/error status on the left, Cancel + Save
 * on the right). contentWidth={640} caps every slot so the footer actions
 * stay aligned with the form column.
 *
 * Responsive contract:
 * - Form column: Layout contentWidth={640} centers a max 640px column on
 *   wide viewports; below that the column keeps full width minus slot
 *   padding. No fields hide at any breakpoint.
 * - Name and State/ZIP rows use FormLayout direction="horizontal" — equal
 *   columns whose inputs shrink with the viewport; every other field is
 *   full-width and stacks vertically.
 * - Header and footer stay pinned; only the form column scrolls
 *   (height="fill" keeps scrolling inside LayoutContent).
 * - Footer: the status message sits in a StackItem fill and yields space
 *   first; the Cancel/Save pair never wraps or shrinks.
 */

import {useState, type ReactNode} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Section} from '@astryxdesign/core/Section';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';

// ============= DATA =============

// Saved account values for the signed-in dispatcher. The form seeds from
// this snapshot; Save promotes the working copy to the new baseline and
// Cancel reverts to it.
interface AccountForm {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  bio: string;
  country: string;
  street: string;
  unit: string;
  city: string;
  state: string;
  postal: string;
  dispatchAlerts: boolean;
  weeklyDigest: boolean;
  billingEmails: boolean;
  productNews: boolean;
}

const SAVED_ACCOUNT: AccountForm = {
  firstName: 'Priya',
  lastName: 'Raman',
  email: 'priya.raman@lumenroute.com',
  jobTitle: 'Dispatch operations lead',
  bio: 'Running dispatch for the Pacific Northwest region. Ask me about route coverage and driver onboarding.',
  country: 'us',
  street: '2180 Harrison Street',
  unit: 'Suite 400',
  city: 'Portland',
  state: 'or',
  postal: '97210',
  dispatchAlerts: true,
  weeklyDigest: true,
  billingEmails: true,
  productNews: false,
};

const COUNTRY_OPTIONS = [
  {value: 'us', label: 'United States'},
  {value: 'ca', label: 'Canada'},
  {value: 'mx', label: 'Mexico'},
  {value: 'gb', label: 'United Kingdom'},
  {value: 'de', label: 'Germany'},
];

const STATE_OPTIONS = [
  {value: 'az', label: 'Arizona'},
  {value: 'ca', label: 'California'},
  {value: 'co', label: 'Colorado'},
  {value: 'id', label: 'Idaho'},
  {value: 'nv', label: 'Nevada'},
  {value: 'or', label: 'Oregon'},
  {value: 'ut', label: 'Utah'},
  {value: 'wa', label: 'Washington'},
];

// Deliberately simple: enough to catch "no @" and "no domain" while the
// user types. Real submission validation belongs server-side.
const EMAIL_PATTERN = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

function validateEmail(email: string): string | null {
  if (email.trim() === '') {
    return 'Work email is required.';
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Enter a valid email address, like name@company.com.';
  }
  return null;
}

// ============= SECTION WRAPPER =============

// One grouped Section of the form: surface background, section heading +
// explainer, then a vertical FormLayout of fields.
function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Section variant="section" padding={5}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>{title}</Heading>
          <Text type="supporting" color="secondary">
            {description}
          </Text>
        </VStack>
        {children}
      </VStack>
    </Section>
  );
}

// ============= PAGE =============

export default function FormPageTemplate() {
  // \`saved\` is the persisted baseline; \`form\` is the working copy. Save
  // promotes form → saved, Cancel reverts form → saved.
  const [saved, setSaved] = useState<AccountForm>(SAVED_ACCOUNT);
  const [form, setForm] = useState<AccountForm>(SAVED_ACCOUNT);

  const setField =
    <K extends keyof AccountForm>(key: K) =>
    (value: AccountForm[K]) =>
      setForm(prev => ({...prev, [key]: value}));

  const emailError = validateEmail(form.email);

  // Cheap enough to derive on every render — 15 primitive comparisons.
  const isDirty = (Object.keys(form) as Array<keyof AccountForm>).some(
    key => form[key] !== saved[key],
  );

  return (
    <Layout
      height="fill"
      contentWidth={640}
      header={
        <LayoutHeader hasDivider>
          <VStack gap={1}>
            <Heading level={1}>Account settings</Heading>
            <Text type="supporting" color="secondary">
              Your profile, billing address, and notification preferences for
              the Lumen Route workspace.
            </Text>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={4}>
            <FormSection
              title="Profile"
              description="How you appear to dispatchers and drivers across the workspace.">
              <FormLayout>
                <FormLayout direction="horizontal">
                  <TextInput
                    label="First name"
                    isRequired
                    value={form.firstName}
                    onChange={setField('firstName')}
                  />
                  <TextInput
                    label="Last name"
                    isRequired
                    value={form.lastName}
                    onChange={setField('lastName')}
                  />
                </FormLayout>
                <TextInput
                  type="email"
                  label="Work email"
                  isRequired
                  description="Used for sign-in, dispatch alerts, and billing receipts."
                  value={form.email}
                  onChange={setField('email')}
                  status={
                    emailError
                      ? {type: 'error', message: emailError}
                      : undefined
                  }
                />
                <TextInput
                  label="Job title"
                  isOptional
                  placeholder="e.g. Dispatch operations lead"
                  value={form.jobTitle}
                  onChange={setField('jobTitle')}
                />
                <TextArea
                  label="Bio"
                  isOptional
                  description="Shown to teammates on your workspace profile. Keep it under a few sentences."
                  rows={3}
                  value={form.bio}
                  onChange={setField('bio')}
                />
              </FormLayout>
            </FormSection>

            <FormSection
              title="Billing address"
              description="Appears on invoices and receipts for the Lumen Route subscription.">
              <FormLayout>
                <Selector
                  label="Country"
                  isRequired
                  options={COUNTRY_OPTIONS}
                  value={form.country}
                  onChange={setField('country')}
                />
                <TextInput
                  label="Street address"
                  isRequired
                  value={form.street}
                  onChange={setField('street')}
                />
                <TextInput
                  label="Apartment, suite, or floor"
                  isOptional
                  value={form.unit}
                  onChange={setField('unit')}
                />
                <TextInput
                  label="City"
                  isRequired
                  value={form.city}
                  onChange={setField('city')}
                />
                <FormLayout direction="horizontal">
                  <Selector
                    label="State"
                    isRequired
                    options={STATE_OPTIONS}
                    value={form.state}
                    onChange={setField('state')}
                  />
                  <TextInput
                    label="ZIP code"
                    isRequired
                    description="5-digit code; extensions are added automatically."
                    value={form.postal}
                    onChange={setField('postal')}
                  />
                </FormLayout>
              </FormLayout>
            </FormSection>

            <FormSection
              title="Notifications"
              description="Email notifications only — in-app alerts are always on for active routes.">
              <FormLayout>
                <Switch
                  label="Dispatch alerts"
                  description="Email when a route fails to assign or a driver misses a check-in."
                  value={form.dispatchAlerts}
                  onChange={setField('dispatchAlerts')}
                />
                <Switch
                  label="Weekly performance digest"
                  description="Delivery success rate and on-time trends, sent Monday mornings."
                  value={form.weeklyDigest}
                  onChange={setField('weeklyDigest')}
                />
                <Switch
                  label="Billing and invoices"
                  description="Receipts, invoices, and payment reminders."
                  value={form.billingEmails}
                  onChange={setField('billingEmails')}
                />
                <Switch
                  label="Product news"
                  description="Occasional feature announcements — never more than twice a month."
                  value={form.productNews}
                  onChange={setField('productNews')}
                />
              </FormLayout>
            </FormSection>
          </VStack>
        </LayoutContent>
      }
      footer={
        // Sticky action bar: pinned by the Layout frame, aligned to the
        // 640px form column via contentWidth.
        <LayoutFooter hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              {emailError ? (
                <FieldStatus
                  type="error"
                  variant="detached"
                  message="Fix the work email before saving."
                />
              ) : (
                <Text type="supporting" color="secondary">
                  {isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
                </Text>
              )}
            </StackItem>
            <Button
              label="Cancel"
              variant="secondary"
              isDisabled={!isDirty}
              onClick={() => setForm(saved)}
            />
            <Button
              label="Save changes"
              variant="primary"
              isDisabled={!isDirty || emailError !== null}
              onClick={() => setSaved(form)}
            />
          </HStack>
        </LayoutFooter>
      }
    />
  );
}
`;export{e as default};