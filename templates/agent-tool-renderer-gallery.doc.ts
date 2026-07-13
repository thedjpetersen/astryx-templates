import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Tool Renderer Gallery',
  description:
    'Agent chat transcript where each assistant turn introduces a specialized tool-result renderer: a terminal-tinted bash block with a full-output Dialog, an edit card with +12 −3 stats and a unified diff, generating/finished image cards with a CSS shimmer, a browser card with a schematic screenshot and highlighted region, an expandable background-process pill, sub-agent result pills under a group header, and a destructive-tinted error collapsible. Every card shares a shell row (tool icon, node chip, summary, duration, status) and two carry auto-expanding hook pills (block / rewrite). Choose over ai-chat-tool-stream when the story is rich per-tool rendering rather than piles of uniform calls.',
  category: 'AI Chat - Tool Renderers',
  componentsUsed: [
    'Avatar',
    'Button',
    'Card',
    'Chat',
    'Collapsible',
    'Dialog',
    'Icon',
    'IconButton',
    'Layout',
    'Spinner',
    'StatusDot',
    'TextArea',
    'Timestamp',
  ],
} satisfies AstryxPageTemplate;

export default template;
