import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Live Event Chat',
  description:
    "Chat-first live-event surface: a LayoutHeader event banner with back arrow, 'Aurora Launch Week — Live Keynote' title + red 'LIVE' Badge, a ticking TimerIcon elapsed chip from a 1:24:06 base, an EyeIcon viewer count that climbs from 8,412 as scripted lines land, and a TurtleIcon slow-mode ToggleButton; the main column stacks a pinned-message Banner slot, a fast-scrolling stream (60 scripted lines auto-appending on a 1.8s interval, three auto-flagged spam rows) with host CrownIcon / mod ShieldIcon / sub StarIcon badges and role-colored username Popover mini-profiles (mute hides the user, mention prefills the composer), hover-or-tap mod actions per message (pin replaces the Banner, delete collapses to an undoable stub, HourglassIcon timeout greys later lines), an 'N new messages' resume pill while scrolled up, and a composer with an emoji reaction bar that fires rising burst animations plus a slow-mode cooldown countdown; the right 320px LayoutPanel lists the agenda with StatusDots, hosts & mods, live reaction totals, and muted users with unmute Buttons. Choose over live-stream-viewer when chat IS the product with no video stage, and over messaging-shell when the surface is one ephemeral event room rather than a workspace of channels.",
  category: 'Social - Live Event Chat',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'Popover',
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
