import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Payments Platform Overview',
  description:
    'Logged-in home of "Ledgerline", a fictional Stripe-style payments platform (indigo accent): a gross-volume SVG area chart with labeled dollar/date axes, a 7d/14d range control, and a dashed previous-period compare overlay whose totals and delta reduce from one 28-day fixture; a balance card whose three scheduled payouts sum exactly to the available balance, with next-payout emphasis and the rolling payout schedule; a fraud-radar strip (7-day blocked-attempts sparkline plus per-rule hit meters that both sum to the same total); a recent-payments table (right-aligned amounts, succeeded/refunded/disputed badges, payment-method icons, risk scores with level dots) behind a status filter whose counts match the rows; a disputes panel with two evidence-due cases that mirror the two disputed table rows; and a test-mode Switch that swaps every region to a simulated dataset under a warning banner. Choose over kpi-dashboard when the surface is payments-domain operations (balances, payouts, disputes, fraud, risk) rather than a generic KPI/chart starter; choose over transactions-ledger when you need the platform operator’s processing overview instead of a personal bank register with reconciliation checkboxes; choose payout-statements instead when the job is a gross-to-net statements archive rather than a live dashboard with an embedded payout schedule.',
  category: 'Startup Showcase',
  componentsUsed: [
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Icon',
    'Layout',
    'SegmentedControl',
    'Stat',
    'StatusDot',
    'Switch',
    'Table',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
