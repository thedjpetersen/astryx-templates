import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Assistant Settings Modal',
  description:
    'Workspace settings as a large open Dialog (~896px) over a dimmed chat: a 240px aside with a settings search that filters grouped nav (APP / CONNECTIONS / AUTOMATION / INTERFACE), and a swappable right pane — Notifications in full (push-level SegmentedControl with per-level descriptions, subscription status with Test button, removable device rows, and team-chat acknowledgment with emoji ToggleButton presets over per-condition Selectors) plus Experiments checkbox rows with ALPHA/BETA/STABLE Badges. Compact widths collapse the nav to a horizontal pill strip. Choose over ai-chat-quick-settings when the story is the full settings surface, not a gear-menu popover.',
  category: 'AI Chat - Settings Modal',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Chat',
    'CheckboxInput',
    'Dialog',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'SegmentedControl',
    'Selector',
    'StatusDot',
    'Switch',
    'TextInput',
    'Timestamp',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
