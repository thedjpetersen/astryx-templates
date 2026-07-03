import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Headcount Planning',
  description:
    'Workforce-platform headcount plan-vs-actuals console (Kestrel Labs, 140-person company, FY26): a KPI strip (plan 156 / filled 140 / open 12 / offers 4), a per-department table with plan, filled, offers, and open columns plus a stacked utilization bar (filled + offer + open segments against plan) and a totals row, a quarterly hiring-cost impact strip (starts per quarter, cumulative incremental annualized run-rate bars), and a 360px open-requisition pipeline panel (req id, role, level, recruiter, days open with aging flag, four-stage dots, loaded cost, target start) that a Base plan / Stretch plan SegmentedControl re-computes end to end — the stretch scenario surfaces 8 extra draft seats. Clicking a department row scopes the pipeline to that department. Choose over org-chart-explorer when the job is numeric seat planning and hiring-cost math, not visualizing reporting lines on an org tree; choose over okr-tree when planning is plan-vs-actuals financial headcount capacity, not an objective tree; choose over budget-tracker when the money is corporate hiring run-rate, not personal budgeting.',
  category: 'Workforce HR',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'SegmentedControl',
    'StackItem',
    'Table',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
