import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Footer Collection',
  description:
    'Five labeled marketing footer variants stacked as a scrolling collection on one shared Relay link taxonomy (Product / Company / Resources / Legal): a 4-column sitemap footer with a validating inline-confirming newsletter mini-form, a slim single-row footer with social IconButtons, a dark mega-footer with mission blurb, language Selector, and status-page chip, a centered minimal landing-page footer, and an app-style legal footer with region + currency Selectors that live-update a price/date preview; a light/dark page-bottom SegmentedControl and show-variant Selector sit in the header, and a demo-state Card mirrors every control.',
  category: 'Marketing - Footer Collection',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Grid',
    'Icon',
    'IconButton',
    'Layout',
    'Link',
    'SegmentedControl',
    'Selector',
    'TextInput',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
