import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Storefront Promo & Navigation',
  description:
    'Storefront-landing showcase for an outdoor-gear brand stacking four labeled zones: store navigation (rotating promo bar, a Shop mega-menu Popover of category columns with gradient imagery cells, a mobile drawer Dialog, and a live cart-count Badge), category previews (3-up tile buttons, a circle-tile row, and a split seasonal banner), promo sections (a ticking countdown sale hero whose promoted item bumps the cart, offer Cards with copy-to-clipboard code chips and Toast confirmations, and an app panel with a QR reveal ToggleButton), and an incentives band switchable between a 4-up icon row and a bordered inline strip. Choose over storefront-browse for brand landing and merchandising chrome rather than a filterable product grid.',
  category: 'Commerce - Storefront Promo & Navigation',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Dialog',
    'Divider',
    'Grid',
    'IconButton',
    'Layout',
    'Popover',
    'SegmentedControl',
    'Toast',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
