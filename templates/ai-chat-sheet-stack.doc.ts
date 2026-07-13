import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Session Sheet Stack',
  description:
    'Full-height agent chat with two stacked right-side sheets over a progressively dimmed main transcript: an outer forked-session sheet (purple Fork Badge, mini transcript, working composer) and an inner aside sheet (uppercase ASIDE eyebrow, single Q&A kept out of the main chat). Sheet headers carry collapse-to-rail and close controls; collapsing yields a 44px vertical rail with a rotated title, Escape closes the top sheet, and closed sheets reopen from the header or the inline fork marker. Choose over ai-chat-tool-stream when the story is layered parallel conversations (forks and asides), not tool execution.',
  category: 'AI Chat - Sheet Stack',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Chat',
    'IconButton',
    'Kbd',
    'Layout',
    'StatusDot',
    'TextArea',
    'Timestamp',
  ],
} satisfies AstryxPageTemplate;

export default template;
