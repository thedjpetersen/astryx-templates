import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

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
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;

