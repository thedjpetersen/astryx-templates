import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Nonprofit Campaign Landing',
  description:
    'Complete campaign landing page for a fictional river-restoration nonprofit: sticky anchor navbar, a tinted hero with a schematic river SVG whose funded saplings pop in to match the campaign percentage, and a progress card whose bar fills and totals count up on reveal. The centerpiece donation widget pairs a One-time/Monthly SegmentedControl with amount chips and a custom NumberInput that live-update an impact line, then fires an inline thank-you state (copyable share link + validating receipt-email capture) that honestly bumps the hero totals. Rounds out with an impact-story Carousel, an interactive where-money-goes SVG donut with legend selection, a milestones timeline, a transparency band with report cards and a copyable EIN row, and a corporate-match employer lookup. Choose it over saas-landing-page when the vertical is fundraising rather than product marketing.',
  category: 'Marketing - Nonprofit Campaign Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Carousel',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'NumberInput',
    'SegmentedControl',
    'TextInput',
    'Toast',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
