import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Trip Itinerary Planner',
  description:
    'Three-region trip planner with a day rail, reorderable per-day activity cards (drag plus accessible MoreMenu moves), a docked unscheduled-ideas tray, inline time/cost/booked editing with live day subtotals and trip budget, a stylized SVG map, and remove-with-undo.',
  category: 'Lifestyle - Trip Itinerary Planner',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'EmptyState',
    'Layout',
    'LayoutPanel',
    'MoreMenu',
    'NumberInput',
    'Selector',
    'Switch',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
