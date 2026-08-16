import type {AstryxIntegrationTemplate} from '../types/astryx-cli.js';

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
} satisfies AstryxIntegrationTemplate;

export default template;
