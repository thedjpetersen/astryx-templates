import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Product Quickview Showcase',
  description:
    'Compact 8-product lookbook Grid where every Card opens a quickview, demonstrated in three switchable Dialog variants pinned by a SegmentedControl: a standard modal with gradient art pane, color swatches, size chips, and quantity stepper; a wide modal adding a Collapsible fabric/fit/shipping accordion and per-size stock hints; and a right-edge slide-over drawer for narrow viewports. Selecting a color swaps the weave art, sold-out sizes stay selectable to reveal a notify-me toggle, and Add to bag validates the size choice, pops the header bag count Badge, and confirms with a Toast.',
  category: 'Commerce - Product Quickview Showcase',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Dialog',
    'Divider',
    'Grid',
    'IconButton',
    'Layout',
    'SegmentedControl',
    'Toast',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
