import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Group Trip Expense Splitter',
  description:
    'Shared-costs console for a 4-traveler Lisbon trip: a start rail lists 12 fixture expenses (category gradient chips, payer, split summary, FX-conversion note glyphs, delete-with-undo Toast) filterable by payer; the center balance board pairs per-person Cards (paid vs share vs net Badge) with a who-owes-whom SVG arrow diagram — minimal greedy transfers, restated as text rows — and a settle-up checklist whose marked-paid repayments drain the arrows until everyone is square, flagging itself stale with a regenerate action when expenses change; the docked end sheet adds or edits an expense with a payer Selector and an equal/percentage/exact SegmentedControl whose per-person inputs validate live (percents must total 100, exact amounts must total the bill) and recompute every share, net, and arrow on save. All money math is derived integer-cent state. Choose over budget-tracker or transactions-ledger when the narrative is group cost-splitting — who paid, who owes whom, and settling up — not personal envelopes or bank reconciliation.',
  category: 'Lifestyle - Group Trip Expense Splitter',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'CheckboxInput',
    'Divider',
    'EmptyState',
    'Grid',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'NumberInput',
    'ProgressBar',
    'SegmentedControl',
    'Selector',
    'Text',
    'TextInput',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
