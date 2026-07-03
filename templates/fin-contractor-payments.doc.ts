import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Global Contractor Payments',
  description:
    'Contractor payout console for a workforce platform (Kestrel Labs, 140 people) reviewing the July 2026 batch CTR-2026-07: a blocked-payout Banner for one missing W-8BEN (₹183,032.00 / $2,192.00 held) with a working send-request CTA, four summary tiles whose figures reconcile (12 contractors with 11 payable / 1 blocked, $48,220.00 batch total, FX-lock countdown across EUR/BRL/INR/CAD, Jul 15 payout date over 4 local rails), a filter + search toolbar, per-country grouping strips (Portugal 4, Brazil 3, India 3, Canada 2 — each with a flag chip, SEPA/PIX/UPI/EFT rail badge, locked FX rate, and local → USD subtotal) over aligned contractor rows (name + country flag chip, fixed/hourly engagement, local rate, this-cycle local + USD in tabular numerics, W-9/W-8BEN status, payment-method icon + mask), a contractor-vs-employee classification callout for one flagged hourly engagement, a 320px inspector panel (engagement, method, tax form, cycle amounts, payout timeline), and a pinned approve bar that confirms the 11 ready payouts through an AlertDialog. Choose over fin-payroll-run when the money is cross-border contractor payouts on local rails with tax-form and FX gating, not an employee gross-to-net pay run; choose over expense-approval-queue when approving one funded payout batch rather than individual expense reports; choose over budget-tracker when the money is a corporate contractor program, not personal budgeting.',
  category: 'Workforce Finance',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'List',
    'MetadataList',
    'SegmentedControl',
    'StackItem',
    'StatusDot',
    'Text',
    'TextInput',
    'Timestamp',
    'Toast',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
