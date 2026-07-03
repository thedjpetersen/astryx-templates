import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Payout Statements',
  description:
    'Marketplace payouts console: a statements-by-period master Table filtered by a Paid / In transit / Upcoming SegmentedControl, an end-panel statement detail whose gross-to-net fee breakdown renders as a waterfall of styled bars (gross, platform fee, refunds, adjustments, net) above a MetadataList, a payout-destinations List with default Badge and working set-default action, and CSV/PDF export buttons that confirm via Toast.',
  category: 'Finance - Payout Statements',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'Layout',
    'List',
    'MetadataList',
    'SegmentedControl',
    'StatusDot',
    'Table',
    'Timestamp',
    'Toast',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
