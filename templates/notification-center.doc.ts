import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Notification Center',
  description:
    "App-chrome notification tray: a TopNav bar whose bell IconButton carries a red '3' unread pill Badge, with the 320px notifications Popover rendered pinned open — header row ('Notifications' + a 'Mark read' ghost Button), then a scrollable list where each row pairs a top-aligned primary unread StatusDot (transparent when read) with a truncated title, two-line clamped body, and a 10px muted timestamp ('2:14 PM', 'Yesterday 4:03 PM', 'Jun 30 11:20 AM') — plus a transient Toast card fixed bottom-right ('Nightly repo scan finished' with body and X dismiss). A secondary strip below shows the loading (Spinner + 'Loading notifications') and empty ('No notifications yet.') popover variants and a '9+' capped-badge bell as side-by-side specimen Cards. Choose over inbox when notifications are a lightweight chrome tray with unread dots and a corner toast, not a full triage mailbox, and over messaging-shell when there is no conversation pane.",
  category: 'Shell - Notifications',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Grid',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'NavIcon',
    'Popover',
    'Skeleton',
    'Spinner',
    'StatusDot',
    'Text',
    'Timestamp',
    'Toast',
    'Tooltip',
    'TopNav',
  ],
} satisfies AstryxPageTemplate;

export default template;
