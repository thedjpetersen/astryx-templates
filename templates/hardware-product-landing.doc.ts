import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Hardware Product Landing',
  description:
    'Art-directed marketing landing page for a fictional smart desk sensor ("Perch"): an aurora-and-grain hero with 64-78px gradient-ink display type staging a product theater — the layered schematic SVG render in a glass panel with pointer parallax, bobbing satellite readouts, and a labeled EXPLODED-VIEW toggle — a condensing sticky navbar, an asymmetric dot-grid spec band with an oversized count-up battery numeral, a floating configurator card that crosses into a scheme-locked dark band (swatches retint every render, pack sizes recompute a tabular total with a savings chip, and a validating preorder email capture flips to a reservation summary), a pinned scroll-story shipping timeline with a clickable progress rail and pointer spotlight, a pause-on-hover ecosystem marquee, offset review cards, an honest FAQ accordion, and a footer warranty note. Fully reduced-motion gated. Choose it over saas-landing-page when the product is a physical object that needs a configurator and exploded-view render rather than software screenshots.',
  category: 'Marketing - Hardware Product Landing',
  componentsUsed: [
    'Badge',
    'Button',
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
