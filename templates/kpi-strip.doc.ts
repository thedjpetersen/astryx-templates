import type {AstryxIntegrationTemplate} from '../types/astryx-cli.js';

const template = {
  type: 'block',
  name: 'KPI Strip',
  description: 'Compact metric cards for operational dashboards.',
  category: 'Operations',
  componentsUsed: ['Badge', 'Card', 'Grid', 'Stack', 'Text'],
} satisfies AstryxIntegrationTemplate;

export default template;

