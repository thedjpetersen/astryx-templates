import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'KPI Strip',
  description: 'Compact metric cards for operational dashboards.',
  category: 'Operations',
  componentsUsed: ['Badge', 'Card', 'Grid', 'Heading', 'Stack', 'Text'],
} satisfies AstryxBlockTemplate;

export default template;

