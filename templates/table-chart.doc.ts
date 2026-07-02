import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Table with Linked Chart',
  description:
    'Retail sales analysis surface: a weekly store-total chart stacked above its underlying product table, with a SegmentedControl metric switch (revenue/units) that re-renders the chart series and shifts column emphasis, and row selection that highlights the row and overlays that product on the chart.',
  category: 'Table - Chart',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'IconButton',
    'Layout',
    'SegmentedControl',
    'Table',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
