import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Live Stream Viewer',
  description:
    "Live-stream viewing surface: a flexible left column with a 16:9 AspectRatio stage (dark gradient frame, red 'LIVE' Badge and 12,847-viewer EyeIcon counter pinned top-left, bottom chrome with mute, quality DropdownMenu '1080p60', theater ToggleButton, MaximizeIcon), a streamer row beneath (Avatar with live ring, channel name + BadgeCheckIcon, stream title, 'Sim Racing' category Token, Follow Button + BellIcon toggle + gift-a-sub Button), and a stats strip (uptime 3:42:18, viewers, StatusDot 'Excellent' stream health); the right 340px chat LayoutPanel stacks a pinned-message Banner, a scrolling chat List with role-colored usernames and mod ShieldIcon / sub StarIcon badges plus a gifted-subs system line, a 'Chat paused due to scroll' resume Button state, and a bottom TextInput composer with SmileIcon and SendIcon. Choose over video-watch-page when the rail is real-time chat rather than up-next, and over messaging-shell when chat is an appendage to a live stage.",
  category: 'Media - Live Stream Viewer',
  componentsUsed: [
    'AspectRatio',
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'DropdownMenu',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'StatusDot',
    'Text',
    'TextInput',
    'ToggleButton',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
