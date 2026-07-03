import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Snap-Point Bottom Sheet Explorer',
  description:
    'Mobile-first place explorer: a stylized SVG neighborhood map under a draggable bottom sheet with three snap points — peek (grab handle + live result count), half (result cards), and full (search TextInput + filter chips + scrolling list). The sheet tracks the pointer 1:1 and settles via a velocity-aware rule (a fast downward flick from full skips half to peek), with native drag-versus-scroll handoff at the list’s scrollTop === 0 boundary; the grab handle is a keyboard-operable button (arrow keys cycle snaps, announced via live region). Selecting a card or tapping a marker pins it, promotes the card, drops the sheet to half, and dims the map proportionally to sheet height. Degrades to a fixed left LayoutPanel on desktop.',
  category: 'Interaction - Snap-Point Bottom Sheet Explorer',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
