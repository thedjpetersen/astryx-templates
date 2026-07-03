import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Breakout Rooms Manager',
  description:
    "Host-side breakout rooms manager console for the Kestrel Labs 'Atlas Q3 Sprint Review': a room-cards grid (five topic rooms plus an empty spillover room drawn as a dashed drop target) where each Card carries a categorical-color topic dot, a tabular per-room timer that flips between elapsed and countdown-remaining, draggable participant chips with a Move-to MoreMenu fallback, Join/Leave and per-room Message actions, and a 'Needs help' warning Badge on Room 4; a left 300px controls panel with a rooms-count stepper (2–8, removing a room returns its people to the tray), an Auto/Manual SegmentedControl with a shuffle Assign-all action, a duration stepper that re-derives every countdown plus the ends-at readout, a countdown Switch, and the unassigned-participants tray of drag-grip chips doubling as the unassign drop zone; a broadcast composer strip pinned under the grid (all-rooms default, per-room Token retargeting); and a right 300px status column with the rooms-open elapsed readout, a labeled per-room distribution mini-bar chart on one shared per-person scale, the dismissable Room 4 ask-for-help Banner with a Join action, and the sent-broadcasts log — Close all rooms swaps the grid for a reopenable end-state behind an AlertDialog. Choose over video-call-layout when the surface is the dedicated host console for pre-assigning people, timing, and broadcasting across rooms rather than an in-call tile stage with a breakout rail tab.",
  category: 'Office - Meeting Breakouts',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MoreMenu',
    'SegmentedControl',
    'Switch',
    'Text',
    'TextInput',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
