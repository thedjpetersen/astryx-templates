import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Nonprofit Campaign Landing',
  description:
    'Art-directed campaign landing page for a fictional river-restoration nonprofit: a condensing navbar over an aurora-lit hero with 62-78px gradient-ink display type, a floating progress card whose bar fills and totals roll up on reveal, and a staged river SVG that tilts toward the pointer while satellite donor/metric mini-cards bob around it and the stage bleeds into the next band. The centerpiece donation widget pairs a One-time/Monthly SegmentedControl with amount chips and a custom NumberInput that live-update an impact line, then fires an inline thank-you state (copyable share link + validating receipt-email capture) that honestly bumps the hero totals. Rounds out with a scheme-locked dark impact-stories band (glass quote cards, campaign-fact marquee, pointer spotlight), an interactive where-money-goes SVG donut with legend selection, a pinned scroll-story milestones scene with clickable phases, a transparency band with hover-raising report cards and a copyable EIN row, and a corporate-match employer lookup. Choose it over saas-landing-page when the vertical is fundraising rather than product marketing.',
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
  ],
} satisfies AstryxPageTemplate;

export default template;
