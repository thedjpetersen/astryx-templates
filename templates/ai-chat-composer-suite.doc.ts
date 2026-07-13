import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Agent Composer',
  description:
    'Chat page whose centerpiece is a maximal composer card: queued follow-up rows (Queued / Sending / Failed with a stale hint), typed attachment chips with an error specimen, an active slash-command chip whose grouped command menu Popover renders open above the field, and a dense control row with attach menu, mic, model selector (models + reasoning-effort SegmentedControl + extended-thinking Switch), a node-lock selector with pricing column and $-scale cost glyphs plus a locked row, context meter with token breakdown, Stop plus a destructive Force-stop AlertDialog, and a round split Send button. Choose over ai-chat-tool-stream when the story is everything you can send and where it runs, not how the agent worked.',
  category: 'AI Chat - Composer',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Button',
    'Chat',
    'Divider',
    'DropdownMenu',
    'Icon',
    'IconButton',
    'Item',
    'Kbd',
    'Layout',
    'Popover',
    'ProgressBar',
    'SegmentedControl',
    'Spinner',
    'StatusDot',
    'Switch',
    'TextArea',
    'Timestamp',
  ],
} satisfies AstryxPageTemplate;

export default template;
