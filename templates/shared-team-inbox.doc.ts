import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Shared Team Inbox',
  description:
    "Front-style shared team mailbox for a support address (help@): left 300px queue of conversations each carrying an SLA countdown Badge (green/amber/red), assignee Avatar or 'Unassigned' Token, and channel icon, filtered by a Mine/Unassigned/All SegmentedControl; center conversation pane mixing customer emails, agent replies, and amber-tinted internal-note Cards, with a dismissable collision Banner ('Maya Chen is replying…' plus a pulsing StatusDot) above a composer whose TabList toggles 'Reply' (sends to customer) vs 'Internal note' (amber tint, @-mention hint, 'Add note' send label); right 300px collaboration rail with assignee Selector, status SegmentedControl (Open/Pending/Closed), followers AvatarGroup, tag Tokens, a MetadataList of conversation facts, and a compact activity timeline ('Maya assigned to Alex · 9:14 AM'). Choose over table-split-pane when multi-agent collaboration primitives — assignment, presence collision, internal notes, SLA timers — are the point of the surface, not a generic ticket split; choose over inbox when one queue is shared by a team rather than triaged by one person; choose over messaging-shell when the traffic is asynchronous customer mail with SLAs and internal notes, not live channel chat on the Chat component family.",
  category: 'Mail - Shared Team Inbox',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'SegmentedControl',
    'Selector',
    'Stack',
    'StackItem',
    'StatusDot',
    'TabList',
    'Text',
    'TextArea',
    'TextInput',
    'Timestamp',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
