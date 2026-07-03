import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Sender Profile Rail',
  description:
    "CRM-lite sender context surface: a flexible reading pane showing one open email (subject Heading, sender header with Avatar, mini-profiles on every participant chip (HoverCards on hover-capable pointers, tap-triggered Popovers on touch), an AvatarGroup of the thread, three body paragraphs, an attachment Card whose 'Save to files' Button flips to a checked 'Saved' state, and a Reply / Reply all / Forward action row opening an inline quick-reply composer whose Send collapses into a soft 'sent' confirmation chip) beside a 340px end LayoutPanel profiling the sender — identity block with 'Verified sender' Badge + StatusDot and an external-domain Token, relationship MetadataList (first contacted, total threads, avg response time, usual hours), a rail-scoped TabList (Activity | Files | Threads) where Activity is a dated interaction timeline, Files lists every attachment exchanged with sizes and source-thread Links, and Threads lists recent subjects with Timestamps; pinned at the rail bottom, a notes list plus quick actions (Compose, a Mute sender ToggleButton that stamps a muted Token onto the sender header, and 'Add note' expanding an inline TextArea that appends to the pinned notes). Below 980px the rail collapses behind a 'Sender info' Button that opens it as an overlay sheet. Choose over profile-page when sender context is a RAIL anchored to an open message, not a standalone profile destination; choose over inbox when there is no folder/message-list chrome — the pairing is one message + who-is-this-person intelligence; choose over messaging-shell because this is asynchronous mail with sender research, not a live chat stream (no Chat components); choose over table-split-pane because the panel profiles a person, not a record detail.",
  category: 'Mail - Sender Profile',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'ButtonGroup',
    'Card',
    'Divider',
    'Heading',
    'HoverCard',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Link',
    'List',
    'MetadataList',
    'Popover',
    'Stack',
    'StackItem',
    'StatusDot',
    'TabList',
    'Text',
    'TextArea',
    'Timestamp',
    'ToggleButton',
    'Token',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
