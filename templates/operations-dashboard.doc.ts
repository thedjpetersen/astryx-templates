import type {AstryxIntegrationTemplate} from '../types/astryx-cli.js';

const template = {
  type: 'page',
  name: 'Operations Dashboard',
  description: 'Work-focused dashboard shell with KPI cards, queue status, and review actions.',
  category: 'Operations',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Grid',
    'Heading',
    'Layout',
    'Stack',
    'Stat',
    'Text',
  ],
} satisfies AstryxIntegrationTemplate;

export default template;

