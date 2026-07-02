import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'KPI Dashboard',
  description:
    'KPI summary dashboard with Stat cards, trend and channel charts, and a compact top endpoints table.',
  category: 'Dashboard - KPI Summary',
  componentsUsed: [
    'Badge',
    'Card',
    'Grid',
    'Layout',
    'SegmentedControl',
    'Stat',
    'Table',
  ],
} satisfies AstryxPageTemplate;

export default template;

