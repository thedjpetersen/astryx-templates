import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Milestone Burnup',
  description:
    'Delivery burnup analytics surface: a layered static-SVG burnup chart whose total-scope line steps up and down on scope changes over a rising completed area, with a velocity forecast band projected to the GA-target column, tappable scope-change annotation markers that open a change-record card, a 6wk/12wk/All range SegmentedControl, a 4-up KPI Stat row (percent complete, 4-week velocity, forecast date vs. target, scope growth), and a per-milestone table whose rows expand in place into a colSpan drill-down (owner, ProgressBar, work items, scope-change notes). Choose over roadmap-gantt when the question is "will the release land by the date" — cumulative points vs. time — rather than who is doing what on which lane, and over kpi-dashboard when the page centers on one release burnup instead of a widget grid.',
  category: 'Planning - Milestone Burnup',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Grid',
    'IconButton',
    'Layout',
    'ProgressBar',
    'SegmentedControl',
    'Stat',
    'Table',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
