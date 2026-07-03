import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Time-Block Day Planner',
  description:
    'Single-day time-blocking surface: a 6 AM – 10 PM vertical timeline of area-colored, movable and resizable blocks (15-minute snapping, done checkboxes that strike blocks and advance a header completion ring, overlap badges with a one-click nudge fix, a fixed now-line), a docked task backlog rail with effort estimates whose tasks schedule onto the timeline by drag or button and un-schedule back with an undo toast, and a daily shutdown panel with live derived stats (planned vs open hours, focus time by life area, conflict list) plus a three-line journal with a saved indicator. Choose over the week agenda when the surface is one editable day of blocks fed by a backlog rather than a read-mostly multi-day calendar.',
  category: 'Lifestyle - Time-Block Day Planner',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CheckboxInput',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'MoreMenu',
    'TextArea',
    'Toast',
    'ToggleButton',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
