import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'AI Chat with Artifact',
  description:
    'AI assistant workspace with a conversation panel on the left (Chat message bubbles, tool-call rows, composer) and a large generated-code artifact pane on the right with a version Selector, Copy, and Open-in-editor header actions over a CodeBlock.',
  category: 'AI Chat - Artifact Page',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Chat',
    'CodeBlock',
    'Divider',
    'IconButton',
    'Layout',
    'SegmentedControl',
    'Selector',
    'StatusDot',
    'Timestamp',
  ],
} satisfies AstryxPageTemplate;

export default template;
