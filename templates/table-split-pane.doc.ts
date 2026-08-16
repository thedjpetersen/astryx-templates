import type {AstryxIntegrationTemplate} from '../types/astryx-cli.js';

const template = {
  type: 'page',
  name: 'Split Pane List/Detail',
  description:
    'Support ticket queue with an email-client-style split: a resizable start panel holds a dense searchable List of selectable tickets, and the content pane shows the selected ticket with header actions, MetadataList, conversation thread, and a pinned reply composer.',
  category: 'Table - Split Pane',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'MoreMenu',
    'Resizable',
    'SegmentedControl',
    'StatusDot',
    'TextArea',
    'TextInput',
    'Timestamp',
    'Token',
  ],
} satisfies AstryxIntegrationTemplate;

export default template;
