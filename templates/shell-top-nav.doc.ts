import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Shell - Top Nav',
  description:
    'App shell with a horizontal TopNav bar — product mark (NavIcon + TopNavHeading), primary TopNavItem links with active state, right-side search input, notifications, and Avatar — over a full-width content area with a per-section page header and a placeholder slot for real page content.',
  category: 'Shell - Top Nav',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'DropdownMenu',
    'EmptyState',
    'IconButton',
    'Layout',
    'NavIcon',
    'TextInput',
    'TopNav',
  ],
} satisfies AstryxPageTemplate;

export default template;
