import type {AstryxIntegrationTemplate} from '../types/astryx-cli.js';

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
} satisfies AstryxIntegrationTemplate;

export default template;

