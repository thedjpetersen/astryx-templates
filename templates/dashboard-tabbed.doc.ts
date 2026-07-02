import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Tabbed Dashboard',
  description:
    'Storefront analytics dashboard with a header TabList switching Overview / Traffic / Revenue / Quality views in one frame; each tab swaps its own KPI Stat row, chart widget, and compact table.',
  category: 'Dashboard - Tabbed',
  componentsUsed: [
    'Badge',
    'Card',
    'Grid',
    'IconButton',
    'Layout',
    'Selector',
    'Stat',
    'TabList',
    'Table',
  ],
} satisfies AstryxPageTemplate;

export default template;
