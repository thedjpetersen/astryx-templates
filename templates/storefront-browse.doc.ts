import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Storefront Browse',
  description:
    'Faceted storefront catalog with a filter rail (department CheckboxList, price range Slider, minimum-rating RadioList, in-stock Switch) that collapses to a filter Dialog on phones, removable applied-filter Tokens, a sort Selector, a responsive Grid of product Cards with sale/new Badges and wishlist ToggleButtons, a quick-view Dialog with finish picker and quantity stepper, and a load-more pagination footer.',
  category: 'Commerce - Storefront Browse',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CheckboxList',
    'Dialog',
    'Divider',
    'EmptyState',
    'Grid',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'RadioList',
    'SegmentedControl',
    'Selector',
    'Slider',
    'Switch',
    'ToggleButton',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
