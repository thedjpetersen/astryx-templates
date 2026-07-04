import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Comment Thread Popover',
  description:
    'Specimen gallery of the anchored comment-thread popover used across Team Workspace doc surfaces, shown as three frozen states side by side on a muted stage, each anchored via a bordered caret beneath a dimmed scheme-locked excerpt of the canonical Kestrel Labs "Atlas Q3 Launch Plan" with one vivid highlighted sentence, and a mono state-id caption per specimen: specimen 01 is the open thread — 3 comments (Marcus Webb, Priya Raman, Sofia Ortiz) with Avatars, fixed Timestamps, an inline @mention Token, toggleable emoji-reaction chips, and a reply composer whose @mention autocomplete flyout is pinned open above it with three roster candidates and a keyboard-highlighted row; specimen 02 is the resolved state — the thread collapsed to a rounded checkmark pill ("Resolved by Sofia Ortiz · Jul 15 · 3 comments hidden") with a Reopen button; specimen 03 is the new-comment state — a fresh blue selection highlight with an empty composer (placeholder, Bold/Italic/link/list/@/emoji formatting mini-toolbar, Cancel plus a Comment button that arms as you type). Choose over doc-comments-review when the deliverable is the comment POPOVER COMPONENT itself — its open/resolved/new anatomy frozen as reference specimens — not the full word-processor review pass with a paper canvas, margin comment rail, filter pills, and accept/reject suggestion workflow; choose over messaging-shell when threads anchor to a highlighted document sentence rather than living in a channel message stream with a thread panel; choose over composer-state-gallery when the states catalogued belong to an anchored doc-comment thread (comments, resolution, reply) rather than an agent-chat input (slash commands, queued follow-ups, force-stop).',
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Kbd',
    'StackItem',
    'Text',
    'TextArea',
    'Timestamp',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
