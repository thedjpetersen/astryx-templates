import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Sprint Board',
  description:
    'Sprint execution surface with a docked backlog rail (estimate points and add-to-sprint actions), four fixed-width board columns of story cards carrying points, assignee avatar, priority icon, and blocked badge, a sprint header with a committed-vs-capacity meter and days-remaining badge, assignee filtering, and accessible card movement paths.',
  category: 'Planning - Sprint Board',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'ClickableCard',
    'EmptyState',
    'Layout',
    'LayoutPanel',
    'MoreMenu',
    'ProgressBar',
    'Selector',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
