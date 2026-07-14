import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Comparison Landing',
  description:
    'Full "switch from" comparison landing page pitting the invented challenger Northbeam against the incumbent Gridware. Sticky navbar with scroll-spy anchors that collapse behind a menu button at compact widths, a versus hero with an animated head-to-head scoreboard derived from the data, and a centerpiece sticky-header comparison table (12 dimensions, check/cross/partial verdict chips with footnote jump markers, category filter chips that scroll-jump and highlight row groups, sticky first column when narrow). Rounds out with count-up switch-reason cards, a migration timeline with a copyable CLI command, a dark switcher testimonial with before/after chips, an honest "when the incumbent wins" callout, pricing-at-a-glance cards, a controlled FAQ accordion, a validating checklist email capture, footnotes, and a sitemap footer. Choose it over saas-landing-page when the page argues a head-to-head switch rather than introducing a product.',
  category: 'Marketing - Comparison Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'TextInput',
    'Toast',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
