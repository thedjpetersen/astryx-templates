import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Offboarding & Access Revocation',
  description:
    'Workforce-platform offboarding runbook for one departing employee (Kestrel Labs GTM account executive, last day Fri Jul 24): a countdown header with business-days-remaining and runbook-window progress; a 280px phase rail with per-phase done/total counts, key dates, and stakeholders; a main column carrying the 12-item access-revocation checklist grouped by SSO apps / devices / badges with scheduled-vs-completed states, revocation timestamps, and per-row Revoke now; an asset-return section (laptop + monitor tiles with return-label steppers and tracking numbers); knowledge-transfer tasks with owner avatars and working checkboxes; and a 320px end panel with the final-pay summary card (prorated salary, remaining PTO payout, final paycheck date) plus a destructive terminate-access-now strip that confirms via AlertDialog and completes every remaining grant. Choose over time-off-planner when the PTO figure is a one-time payout line inside a departure runbook, not an employee request or balance surface.',
  category: 'Workforce HR',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'CheckboxInput',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'MetadataList',
    'ProgressBar',
    'SegmentedControl',
    'StackItem',
    'Text',
    'Timestamp',
    'Toast',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
