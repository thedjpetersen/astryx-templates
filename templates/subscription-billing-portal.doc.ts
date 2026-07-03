import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Billing Portal',
  description:
    'Self-serve subscription billing page: a centered ~840px column of Cards for the current plan, usage, payment methods, and invoices. Demonstrates a change-plan Dialog whose RadioList re-derives ProgressBar usage meters against the new limits (with warning/over-limit escalation), a cancel Dialog that leads with a retention offer before a reason-gated destructive confirm plus a canceling Banner with Resume, a payment-methods list with gradient brand tiles, Default badge moves, remove-behind-AlertDialog, and an add-card Dialog with digit validation and brand detection, and an invoice history Table with status Badges, per-row download feedback Tooltips, and a retry-payment action.',
  category: 'Commerce - Billing Portal',
  componentsUsed: [
    'AlertDialog',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Dialog',
    'EmptyState',
    'IconButton',
    'Layout',
    'ProgressBar',
    'RadioList',
    'Table',
    'TextInput',
    'Timestamp',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
