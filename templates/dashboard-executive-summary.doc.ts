import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Executive Summary Dashboard',
  description:
    'Executive revenue summary with a hero quarterly-revenue Stat card (trailing eight-quarter bar chart and plan-attainment progress), a right-hand rail of compact sparkline trend Stats (ARR, NRR, churn, pipeline), and a full-width regional breakdown Table with proportional and pixel columns; a fiscal-quarter SegmentedControl in the header swaps the whole fixture set.',
  category: 'Dashboard - Executive Summary',
  componentsUsed: [
    'Badge',
    'Card',
    'Grid',
    'IconButton',
    'Layout',
    'ProgressBar',
    'SegmentedControl',
    'Stat',
    'Table',
  ],
} satisfies AstryxPageTemplate;

export default template;
