import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Week Agenda',
  description:
    'Week-view calendar: an hour-ruled 7-day time grid over fixture weeks with absolutely positioned category-colored event blocks that split into side-by-side columns when they overlap, an all-day chip row, a fixed current-time rule with a today dot, prev/next week paging with a Today jump, a legend of category filter ToggleButtons, and a docked event-detail panel that opens on click (time, duration, location, attendees, notes). On phones the grid swaps for a vertical agenda list grouped by day with inline expanding detail cards. Choose over the month grid when the surface is an hour-by-hour week of positioned time blocks rather than month-at-a-glance day cells.',
  category: 'Calendar - Week Agenda',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'ToggleButton',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
