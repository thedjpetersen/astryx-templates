import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Budget Tracker',
  description:
    'Envelope-budgeting tracker across three fixture months (Apr–Jun 2026) switched by a header SegmentedControl: four summary KPI Cards (income, budgeted, spent, safe-to-spend with ProgressBars and an uncovered-overspend warning), a CSS-only flexible-spend burn-down strip — one bar per day against an even-pace ghost, no chart library — and an envelope ledger Card where each row is a full-width button with a gradient icon chip, a spent/remaining bar that turns red with an "Over $X" alert Badge past 100%, and an inline recent-transactions list revealed on click. A docked month-summary LayoutPanel lists overspent envelopes (each coverable from Safe to spend, which honestly raises Budgeted) and paid/due bills, stacking into the column below 900px. Choose over kpi-dashboard or dashboard-executive-summary when the narrative is personal-finance envelopes — allocation, overspend, and drill-in transactions — not business KPIs.',
  category: 'Finance - Budget Tracker',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Grid',
    'Heading',
    'Icon',
    'Layout',
    'LayoutPanel',
    'ProgressBar',
    'SegmentedControl',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
