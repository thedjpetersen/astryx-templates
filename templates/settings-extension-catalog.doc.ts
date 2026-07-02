import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Extension Catalog Settings',
  description:
    'Full-page settings surface for discovering and managing installed extensions/skills with personal-vs-workspace scoping: a badge-counted TabList over a searchable ClickableCard marketplace grid, an installed List with scope Badges, enabled Switches, and a destructive uninstall AlertDialog, plus a published-skills tab with live/draft status filtering.',
  category: 'Settings - Extension Catalog',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'ClickableCard',
    'EmptyState',
    'Grid',
    'Layout',
    'List',
    'MoreMenu',
    'SegmentedControl',
    'Selector',
    'Spinner',
    'Switch',
    'TabList',
    'TextInput',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
