import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Wheel Picker Scheduler',
  description:
    'Focus-timer setup surface built around iOS-style wheel pickers: hours, minutes, and session-type columns as vertical scroll-snap wheels whose rows rotate and fade with distance from a center selection lens (per-item custom-property transforms, native flick physics), preset chips (Pomodoro, Deep Work, Break, Admin sweep) that smooth-scroll all three wheels simultaneously and light up when matched, and a live summary card with a conic-gradient duration ring that tweens to every new arc plus a derived would-run time chained after a Today’s queue rail (add with optional auto-break, remove, reorder, focus-vs-break split). Each wheel is a keyboard-operable listbox driving the identical commit path as the gesture. Choose over booking-availability-picker when the surface composes a duration from continuous wheels rather than picking a slot from an availability grid.',
  category: 'Interaction - Wheel Picker Scheduler',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CheckboxInput',
    'Divider',
    'EmptyState',
    'IconButton',
    'Kbd',
    'Layout',
    'LayoutPanel',
    'ToggleButton',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
