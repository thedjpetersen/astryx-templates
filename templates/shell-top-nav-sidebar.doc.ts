import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Shell - Top Nav + Left Sidebar',
  description:
    'Cloud console shell with two-level navigation: global TopNav (product switcher heading, section items, search, user menu) over an AppShell whose contextual SideNav swaps groups per active section, plus a breadcrumbed page header and skeleton placeholder body.',
  category: 'Shell - Top Nav + Left Sidebar',
  componentsUsed: [
    'AppShell',
    'Avatar',
    'Badge',
    'Breadcrumbs',
    'Button',
    'Card',
    'DropdownMenu',
    'Grid',
    'IconButton',
    'List',
    'NavIcon',
    'SideNav',
    'Skeleton',
    'TextInput',
    'TopNav',
  ],
} satisfies AstryxPageTemplate;

export default template;
