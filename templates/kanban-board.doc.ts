import type {AstryxIntegrationTemplate} from '../types/astryx-cli.js';

const template = {
  type: 'page',
  name: 'Kanban Board',
  description:
    'Product delivery board with frame-first chrome, fixed-width scrollable columns, ClickableCard task tiles, filter controls, and accessible card movement paths.',
  category: 'Tools - Kanban Board',
  componentsUsed: [
    'Avatar',
    'Button',
    'ClickableCard',
    'EmptyState',
    'Layout',
    'MoreMenu',
    'SegmentedControl',
    'Selector',
    'StatusDot',
    'Token',
  ],
} satisfies AstryxIntegrationTemplate;

export default template;

