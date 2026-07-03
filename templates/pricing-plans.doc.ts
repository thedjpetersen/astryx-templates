import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Pricing Plans',
  description:
    'Full pricing page with a monthly/annual SegmentedControl that recalculates every price and swaps a savings Badge: a 3-up Grid of plan Cards (one highlighted "Most popular") with check-marked feature lists and Toast-confirmed CTA Buttons, a seat-count NumberInput bill estimator, a frozen-label-column feature-comparison table with check/dash cells, and a controlled-Collapsible FAQ section.',
  category: 'Commerce - Pricing Plans',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'NumberInput',
    'SegmentedControl',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
