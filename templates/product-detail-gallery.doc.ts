import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Product Detail',
  description:
    'E-commerce product detail page with a media gallery (gradient-art stage, prev/next arrows, thumbnail rail), color swatch and size chip selectors that swap fixture stock state, a sticky buy box Card with price, stock Badge, quantity stepper, add-to-cart wired to the header cart count and a notify-me toggle for sold-out sizes, Collapsible spec MetadataList / shipping / care sections, a reviews summary with rating histogram bars and helpful-vote ToggleButtons, and a scroll-snap related-items row.',
  category: 'Commerce - Product Detail',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Breadcrumbs',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'IconButton',
    'Layout',
    'MetadataList',
    'ToggleButton',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
