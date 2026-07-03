import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Live Meeting Stage — Captions & Participation',
  description:
    "In-meeting captions-and-participation surface for a live call (Kestrel Labs' 'Atlas Q3 · Launch Readiness Review'): a colorScheme-locked dark stage where a large active-speaker tile follows the current caption line above a small-tile filmstrip (or a vertical sidebar rail / uniform grid via an Auto/Grid/Spotlight/Sidebar SegmentedControl inside a popover card with a hide-non-video Switch), a fixed live-captions band showing two speaker-attributed lines — timecoded, with the current line highlighted by an accent bar — a floating emoji reactions column fed by a strip of reaction buttons plus a raise-hand toggle and CC toggle with language chip, a host controls cluster in the header (Mute all behind an AlertDialog, meeting Lock ToggleButton, REC Badge with fixed elapsed chip), a dismissible token-pure breakout banner ('Rooms open in 0:42 — Join Room 3'), and a 320px raised-hands LayoutPanel with an up-next invite-to-speak card that takes over the stage, numbered queue rows with per-row lower buttons, a Lower all control, and a recently-lowered trail. Choose over video-call-layout when the surface is the captions/participation view of a call — live caption lines, reactions, hand-queue hosting, and layout switching — rather than the tile-grid workspace with its chat/participants/breakout rail, per-tile menus, and mic/camera/leave controls.",
  category: 'Office - Meeting Captions',
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
    'Popover',
    'SegmentedControl',
    'StackItem',
    'Switch',
    'Text',
    'ToggleButton',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
