import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'SaaS Landing Page Example',
  description:
    'Full landing page for a fictional SaaS product composing the marketing system end-to-end: dismissible announcement banner, sticky navbar with a working Product flyout (Escape/outside-click dismissal) and smooth-scrolling scroll-spy anchor links, split hero with a validating email capture, logo cloud, alternating feature rows with CSS-drawn schematic mocks, a compact 4-cell bento band, a dark spotlight testimonial, a 3-tier pricing teaser whose monthly/annual SegmentedControl recalculates prices, a controlled-Collapsible FAQ accordion, a final CTA panel, and a sitemap footer with a second validating newsletter form.',
  category: 'Marketing - SaaS Landing Page Example',
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
    'Toast',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
