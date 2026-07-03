import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Payroll Run Review',
  description:
    'Pay-run console for a workforce platform (Kestrel Labs, 140 people) reviewing the Jul 15 semi-monthly run: a run-status stepper (Drafted → In review → Approvals → Submitted, currently in review with a submit-by countdown Token), four summary cards whose figures reconcile (gross $612,480.00, net, employer taxes, 140 employees with payable/blocked split), a sortable pay-register Table (employee, gross, pre-tax, taxes, net in right-aligned tabular numerics) with filter SegmentedControl, search, and a run-totals strip, an off-cycle payments section, a 340px review-queue panel with three anomalies (expected 62% promo increase, negative-PTO deduction, blocking missing timesheet — each with working resolve actions), pre-flight checks, dual-approver status (Elena Voss approved, Dana Whitfield pending), and a pinned approve-and-submit bar gated on the blocking anomaly that confirms via AlertDialog. Choose over scheduled-jobs-manager when the surface is a business-calendar pay event with monetary pre-flight and approvals, not cron scheduling; choose over expense-approval-queue when approving one run of payroll money rather than individual expense reports; choose over budget-tracker when the money is a corporate pay run, not personal budgeting.',
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
    'SegmentedControl',
    'StackItem',
    'StatusDot',
    'Table',
    'Text',
    'TextInput',
    'Timestamp',
    'Toast',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
