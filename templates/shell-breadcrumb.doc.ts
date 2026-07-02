import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Shell - Breadcrumb Driven',
  description:
    'Org-directory drill-down shell where a prominent Breadcrumbs trail (four levels deep) above the page header carries all hierarchy and back-navigation: minimal top bar, back Link, current-node header with rollup Badges, and a List of child sub-teams or members to drill into.',
  category: 'Shell - Breadcrumb driven layout',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Breadcrumbs',
    'Button',
    'Divider',
    'IconButton',
    'Layout',
    'Link',
    'List',
  ],
} satisfies AstryxPageTemplate;

export default template;
