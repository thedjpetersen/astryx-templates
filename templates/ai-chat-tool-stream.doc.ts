import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'AI Chat with Tool Stream',
  description:
    'Full-height agent chat focused on tool execution: assistant turns carry collapsed tool piles (overlapped Card stack with a count Badge) that expand into per-call rows with StatusDot, timing, and CodeBlock output; header has a model Selector and a context-usage meter with a Popover token breakdown; composer has attachment Tokens and a queued follow-up strip. Choose over ai-chat-artifact when the story is how the agent worked, not a generated artifact.',
  category: 'AI Chat - Tool Calls',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Chat',
    'CodeBlock',
    'Collapsible',
    'Divider',
    'IconButton',
    'Layout',
    'Popover',
    'ProgressBar',
    'Selector',
    'Spinner',
    'StatusDot',
    'TextArea',
    'Timestamp',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
