import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Composer State Gallery',
  description:
    'Component-anatomy gallery that renders one rich agent-chat composer six times, each frozen in a different state under a mono state-id Token caption: idle with three rounded suggestion pills and a context-usage meter (84,211 / 200,000 tokens); an active "/research" slash-command chip pinned inside the field with a primary tint ring and a locked classifying placeholder; an open @mention Popover with initials-Avatar candidate rows and a keyboard highlight; a queued follow-up tray Card showing all four statuses (Queued with Send button, Sending with Spinner, Steered, Failed with destructive error line and retry); a drag-over state with primary ring and drop hint; and a stop-escalation state where the send button has become a destructive Force stop that opens an AlertDialog ("Force stop sandboxes?"). Choose over ai-chat-tool-stream or ai-chat-artifact when the deliverable is the composer component itself in every state — a state-matrix reference sheet, not a conversation.',
  category: 'AI Chat - Composer States',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'Popover',
    'ProgressBar',
    'Section',
    'Spinner',
    'Text',
    'TextArea',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
