import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'UI Elements Gallery',
  description:
    'Five-panel interactive gallery of core UI atoms, each variant captioned with a mono copy-ready props strip: avatars (xs-xl size ramp, gradient-initials placeholders, presence status dots, and a stacked overlap group whose +N chip opens a full-roster Popover); badges (semantic status colors, dot-prefixed system badges, dismissible tag Tokens that really remove with an Undo snackbar Toast, and count pills driven by a live stepper that caps at "99+"); buttons (primary/secondary/ghost/destructive across three sizes, icon-leading, a click-to-load button that spins for 1.5s, and the disabled row); button groups (a segmented view switcher wired to a live list/grid/table preview pane, a split Save button with attached DropdownMenu, and an icon formatting toolbar with pressed states); and dropdown menus (simple actions, icons with Kbd shortcuts, grouped-with-danger-zone, and a checkable options menu that updates a visible Token readout). Choose over composer-state-gallery when the deliverable is a component-kit reference of general-purpose atoms — buttons, badges, avatars, menus — rather than one product surface frozen in states.',
  category: 'UI Kit - UI Elements Gallery',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'ButtonGroup',
    'Card',
    'Code',
    'Divider',
    'DropdownMenu',
    'Grid',
    'Heading',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'Popover',
    'Section',
    'SegmentedControl',
    'StatusDot',
    'Text',
    'Toast',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
