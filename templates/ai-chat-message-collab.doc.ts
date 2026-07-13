import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Message Collaboration',
  description:
    'Shared AI chat transcript with collaboration affordances: hover action rows on every message (vote ToggleButtons with counts, copy, copy-link, fork), a fork Popover on one message listing existing forks plus "Fork from here", margin comment threads in a right gutter aligned to their anchor messages (one reply carries an open @mention Typeahead with an assistant bot row), and an emoji reactions strip. Compact widths fold the comment gutter inline below each message. Choose over ai-chat-tool-stream when the story is people reviewing a shared transcript, not agent tool execution.',
  category: 'AI Chat - Collaboration',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'Chat',
    'Divider',
    'Icon',
    'IconButton',
    'Layout',
    'Popover',
    'Text',
    'TextArea',
    'TextInput',
    'Timestamp',
    'ToggleButton',
    'Typeahead',
  ],
} satisfies AstryxPageTemplate;

export default template;
