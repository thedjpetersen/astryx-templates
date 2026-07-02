import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Messaging Shell',
  description:
    'Slack-style messaging shell with workspace rail, channel sidebar, message stream, and thread panel built on the Chat component family.',
  category: 'Shell - Messaging',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Chat',
    'EmptyState',
    'Layout',
    'List',
    'StatusDot',
    'TextInput',
    'Timestamp',
  ],
} satisfies AstryxPageTemplate;

export default template;

