import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Comparison Table (Frozen Column)',
  description:
    'Pricing-plan comparison matrix with a frozen attribute-label column: plan columns scroll horizontally under a sticky price/CTA header row, check/dash inclusion cells, a highlighted recommended plan, a billing-period SegmentedControl, and a differences-only Switch.',
  category: 'Table - Frozen Column',
  componentsUsed: [
    'Badge',
    'Button',
    'Layout',
    'SegmentedControl',
    'Switch',
  ],
} satisfies AstryxPageTemplate;

export default template;
