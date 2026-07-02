import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Logs Explorer',
  description:
    'Monitoring log explorer with facet rail, PowerSearch filtering, live-tail controls, and expandable LogStream rows.',
  category: 'Dashboard - Monitoring',
  componentsUsed: [
    'Badge',
    'CheckboxList',
    'Layout',
    'LogStream',
    'PowerSearch',
    'SegmentedControl',
    'StatusDot',
    'Switch',
  ],
} satisfies AstryxPageTemplate;

export default template;

