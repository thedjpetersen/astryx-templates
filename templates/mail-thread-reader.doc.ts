import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Conversation Thread Reader',
  description:
    "Full-width single-conversation email reader: a sticky LayoutHeader with the subject ('Re: Contract renewal — Meridian Health'), label Tokens (Legal, Renewals), a '5 messages' counter, and an archive/star/reply-all Toolbar; below, a centered ~760px scrolling column of 5 messages where the oldest 3 are collapsed to one-line sender/snippet/date rows that expand on click, and expanded messages show an Avatar header with a 'show details' Popover (full From/To/Cc/Date MetadataList), body text, a '•••' trimmed-quote toggle revealing indented quoted history, inline attachment Cards (file icon + name + size), and toggleable per-message emoji-reaction chips. A collapsed Reply/Reply all/Forward ButtonGroup at the bottom expands into an inline reply composer seeded by tappable quick-reply suggestion chips, with Send disabled while the draft is empty. Choose over inbox when the entire surface is ONE conversation read deeply (no folder rail, no message list); choose over messaging-shell when messages are discrete emails with quoted history and formal headers, not a live chat stream; choose over table-split-pane when there is no queue or list panel to select from — the thread itself is the whole page.",
  category: 'Mail - Thread Reader',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'ButtonGroup',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Link',
    'MetadataList',
    'Popover',
    'StackItem',
    'Text',
    'TextArea',
    'Timestamp',
    'Token',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
