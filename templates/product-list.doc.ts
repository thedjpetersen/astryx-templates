import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Product List',
  description:
    'E-commerce catalog browse page with a collapsible faceted filter rail (category CheckboxList, price range Slider, in-stock Switch) and a results toolbar (live count, sort Selector, grid/list SegmentedControl) over a responsive Grid of product Cards with Thumbnail placeholders, rating Badges, and sale pricing.',
  category: 'Content - Product List',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CheckboxList',
    'Divider',
    'EmptyState',
    'Grid',
    'Layout',
    'LayoutPanel',
    'SegmentedControl',
    'Selector',
    'Slider',
    'Switch',
    'Thumbnail',
  ],
} satisfies AstryxPageTemplate;

export default template;
