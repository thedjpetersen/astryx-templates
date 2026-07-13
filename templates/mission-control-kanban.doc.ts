import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Mission Control Board',
  description:
    'Live agent-work kanban: five lanes (Ideas / Inbox / In Progress / Review / Done) where every card is a running agent session — In Progress and Review lanes glow, cards carry priority Badges, workspace Tokens, and pulsing live-activity chips (tool icon, action text, tool-count Badge, one error-tinted specimen), and a kebab MoreMenu moves lanes, sets priority, and archives. Selecting a card opens a 380px chat drawer with the session mini-thread (You/Agent bubbles plus a tool chip with an exit-code footer), Approve/Reject actions when the card is in Review, and a working reply composer. Choose over the generic kanban-board template when the board tracks live agent sessions to supervise (activity chips + chat drawer), not static delivery tasks.',
  category: 'AI Chat - Mission Control',
  componentsUsed: [
    'Badge',
    'Button',
    'ClickableCard',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'MoreMenu',
    'Selector',
    'StatusDot',
    'Text',
    'TextArea',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
