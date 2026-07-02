import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Filterable Dashboard',
  description:
    'Revenue dashboard with a collapsible left filter panel (region CheckboxList, product Selector, DateRangeInput) that live-filters the KPI Stat row, monthly revenue chart, and top-accounts table.',
  category: 'Dashboard - Filterable',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CheckboxList',
    'DateRangeInput',
    'Divider',
    'EmptyState',
    'Grid',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'Selector',
    'Stat',
    'Table',
  ],
} satisfies AstryxPageTemplate;

export default template;
