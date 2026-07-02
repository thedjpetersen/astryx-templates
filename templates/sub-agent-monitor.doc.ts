import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Sub-Agent Monitor',
  description:
    'Background-agent status tray with transcript drill-in: a chat page mock whose composer carries a docked monitor panel — summary bar with colored count clusters (pulsing running dot, done/failed counts, faded dismissed counter) expanding into a bulk-action strip (Show dismissed, Restore all, Dismiss completed) and per-agent rows with StatusDot, truncated task title, status word, relative Timestamp, and a bordered View chip, plus a DISMISSED micro-header section; an open Dialog shows one agent\'s session as a right-aligned TASK bubble, tool chips, a CodeBlock result, a destructive-tinted error result, and a compaction divider. Choose over ai-chat-tool-stream when the subject is a fleet of spawned agents and their lifecycle management, not a single conversation\'s tool calls.',
  category: 'AI Chat - Sub-Agent Monitor',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Chat',
    'CodeBlock',
    'Collapsible',
    'Dialog',
    'Divider',
    'Icon',
    'IconButton',
    'Layout',
    'Overlay',
    'StatusDot',
    'Text',
    'TextArea',
    'Timestamp',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
