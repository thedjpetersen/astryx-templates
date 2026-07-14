import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Open Source Project Page',
  description:
    'Complete project landing page for a fictional open-source state library ("tessera"): sticky navbar with smooth-scrolling scroll-spy anchors (collapsing to a menu button at compact widths) and a working star toggle, a hero with npm/pnpm/yarn/bun install tabs swapping a copyable CodeBlock plus count-up star/fork stat chips, a before/after 30-second example, a semver release timeline, a 24-tile contributor monogram wall, a three-tier sponsors band, a draw-on star-history SVG sparkline, a used-by wordmark strip, Docs/Discord/GitHub link cards, and an MIT-note footer. Choose it over saas-landing-page when the product is a library or CLI marketed to developers rather than a hosted SaaS.',
  category: 'Marketing - Open Source Project Page',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'ClickableCard',
    'CodeBlock',
    'Grid',
    'Heading',
    'Icon',
    'Layout',
    'TabList',
    'Text',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
