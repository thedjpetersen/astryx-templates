import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Inbox',
  description:
    'Email triage surface with a three-column reading frame: folder rail with unread Badge counts, dense sender/subject/snippet message list with unread emphasis and search, and a reading pane with a Toolbar of archive/snooze/reply actions. List/detail mail archetype, not a chat stream.',
  category: 'Tools - Inbox',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'List',
    'StatusDot',
    'TextInput',
    'Timestamp',
    'Toolbar',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
