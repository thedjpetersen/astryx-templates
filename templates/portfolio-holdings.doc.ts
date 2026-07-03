import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Portfolio Holdings',
  description:
    'Investment portfolio surface: a summary header with total value, day change, and total gain/loss in signed coloring, a CSS conic-gradient allocation donut with legend and a class/sector grouping switch, a filterable holdings table (ticker, shares, price, value, gain/loss, mini bar sparkline) whose row selection opens a position detail panel with a purchase-lots table, and a watchlist rail with working star toggles.',
  category: 'Finance - Portfolio Holdings',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Grid',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'SegmentedControl',
    'Table',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
