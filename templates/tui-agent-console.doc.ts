import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Terminal Agent Console',
  description:
    'Flagship terminal surface: a full-window dark monospace TUI stage centered on a token backdrop — left Sessions pane (collapsible folders, unread dot, pinned/processing glyphs, compact right-aligned times, white-on-blue cursor row, arrow-key navigation) beside a Chat pane whose border title carries the session name, model, node badge, and a 20-char block context meter that turns yellow past 70%. The transcript mixes bordered user bubbles, markdown-ish assistant text, an expandable tool-call box, a collapsed tool-group header, a compaction divider, a verb-cycling processing row, and a queued steering pill above a bordered input and a key-hint status bar. Choose over ai-chat-tool-stream when the surface should read as a terminal TUI rather than a token-themed product chat.',
  category: 'AI Chat - Terminal TUI',
  componentsUsed: ['Layout', 'Text'],
} satisfies AstryxPageTemplate;

export default template;
