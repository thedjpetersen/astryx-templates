import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Shell - Left Sidebar',
  description:
    'Application shell for a support workspace: AppShell with a persistent, collapsible SideNav (grouped sections, nested queue items with one group expanded, active state) beside a placeholder page — header, setup-task ClickableCards, and a swap-me EmptyState content slot.',
  category: 'Shell - Left Sidebar',
  componentsUsed: [
    'AppShell',
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'ClickableCard',
    'EmptyState',
    'Grid',
    'IconButton',
    'SideNav',
  ],
} satisfies AstryxPageTemplate;

export default template;
