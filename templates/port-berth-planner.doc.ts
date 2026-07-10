import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Port Berth Planner',
  description:
    'Quayside berth-planning console for a container terminal: a berths-by-hours Gantt of shiftable vessel blocks with quay-crane chips, drawn over a tide-curve underlay whose sailing-draft threshold re-anchors to the selected vessel, an anchorage strip for waiting arrivals, and an aside with particulars, window nudges, crane gang toggles, and berth reassignment with fit notes. Shifting, reassigning, or re-ganging a vessel re-derives grounding and sailing-tide violations, crane double-bookings, berth overlaps, and the pro-forma delay stat from one store.',
  category: 'Logistics - Port Berth Planner',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Heading',
    'Text',
    'Avatar',
    'Button',
    'Divider',
    'Icon',
    'StatusDot',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
