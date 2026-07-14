import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Comparison Landing',
  description:
    'Full "switch from" comparison landing page pitting the invented challenger Northbeam against the incumbent Gridware, staged with aurora-and-grain atmosphere. A transparent-to-tinted condensing navbar with scroll-spy anchors rides over a hero theater: a 76px gradient-ink versus headline, a tilting glass head-to-head scoreboard (tally derived from the data) with parallaxing satellite chips, and a switched-teams marquee. The centerpiece sticky-header comparison table (12 dimensions, check/cross/partial verdict chips with footnote jump markers, category filter chips that scroll-jump and highlight row groups, sticky first column when narrow) is followed by count-up switch-reason cards, a pinned scroll-story migration scene with clickable steps, a scripted terminal, and a copyable CLI command, a dark glass testimonial band with a pointer spotlight, an honest "when the incumbent wins" card overlapping the band boundary, offset pricing cards, a controlled FAQ accordion, a validating checklist email capture, footnotes, and a sitemap footer. Choose it over saas-landing-page when the page argues a head-to-head switch rather than introducing a product.',
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
  ],
} satisfies AstryxPageTemplate;

export default template;
