import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Fleet Dispatch Board',
  description:
    'Fleet dispatch board for assigning delivery stops to driver routes: a start-panel queue of unassigned stop cards (priority StatusDot, address, time window, weight) with a priority SegmentedControl filter, a sort Selector, and an always-available "Assign to <driver>" MoreMenu per card; a center board of driver rows as horizontal time lanes over a fixed 08:00–18:00 day — sticky driver cells carry an Avatar, vehicle, shift, and animated load + hours utilization meters while route blocks sit positioned by their time windows over shift shading; drops (HTML5 drag on fine pointers, menu assign everywhere) insert a block and slide the meters, and capacity or shift-window violations raise an inline conflict notice with explicit Override / Cancel Buttons; an end-panel rail lists the selected driver\'s route sequence with per-stop return-to-queue IconButtons, and the header tracks the unassigned count and average fleet load live with an Undo for the last move. Choose over a kanban or table when the decision variable is "which driver and when" — stops carry time windows and weights, so lanes with positioned blocks and capacity meters beat unordered columns.',
  category: 'Business - Fleet Dispatch Board',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'MoreMenu',
    'SegmentedControl',
    'Selector',
    'StatusDot',
    'Text',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
