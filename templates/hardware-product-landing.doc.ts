import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Hardware Product Landing',
  description:
    'Full marketing landing page for a fictional smart desk sensor ("Perch"): sticky anchor navbar that collapses behind a menu button at compact widths, a split hero whose layered schematic SVG product render springs apart into a labeled EXPLODED VIEW, spec tiles with count-up values, an in-the-box row, a working configurator (color swatches retint every render, pack sizes recompute a tabular total with a savings chip, and a validating preorder email capture flips to a reservation summary), a dated shipping timeline, an ecosystem compatibility strip, starred review quotes, an honest FAQ accordion, and a footer warranty note. Choose it over saas-landing-page when the product is a physical object that needs a configurator and exploded-view render rather than software screenshots.',
  category: 'Marketing - Hardware Product Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'SegmentedControl',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
