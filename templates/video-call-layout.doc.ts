import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Video Call Workspace',
  description:
    "Video-call meeting surface: a colorScheme-locked dark stage rendering either a participant tile grid (nine gradient avatar tiles plus a 'Q3 Launch Plan' screen-share tile, a green speaking-glow ring rotating on an interval, mic/camera state chips, and an always-visible per-tile MoreMenu with Pin / Spotlight / host Mute) or a speaker view where the pinned, spotlit, or active tile renders large above a horizontal filmstrip; a bottom control bar with mute + camera ToggleButtons, a hand-raise toggle that appends to a numbered queue, a Grid/Speaker SegmentedControl, and a destructive Leave Button behind an AlertDialog with a Rejoin undo; and a right 340px LayoutPanel with Chat / People / Breakout tabs — a working TextInput composer over seeded messages, a raise-order queue with numbered Badges plus Mute all and per-row host mute that flip the tile icons, and drag-or-menu breakout assignment across three room drop zones with live counts and an unassigned pool. Choose over live-stream-viewer when every tile is a peer rather than one broadcast stage, and over messaging-shell when chat is one tab of a call rail rather than the product itself.",
  category: 'Social - Video Call Workspace',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MoreMenu',
    'SegmentedControl',
    'TabList',
    'Text',
    'TextInput',
    'ToggleButton',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
