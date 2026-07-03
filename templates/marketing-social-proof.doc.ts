import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Social Proof Sections',
  description:
    'Marketing showcase stacking three switchable social-proof families: testimonials (3-up quote-card Grid, a spotlight carousel with prev/next IconButtons, dot indicators, and arrow-key support, and a CSS-columns masonry wall), logo clouds (grayscale row, two-row grid, and inline "Trusted by" strip of CSS-drawn wordmarks that light brand color on hover/focus/tap plus a full-color mode toggle), and stats bands (4-up count-up band triggered on scroll-into-view with a Replay Button, a dark split band with a Toast-confirmed CTA, and an annual-report stack) — a header SegmentedControl filters which families render.',
  category: 'Marketing - Social Proof Sections',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Grid',
    'Icon',
    'IconButton',
    'Layout',
    'SegmentedControl',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
