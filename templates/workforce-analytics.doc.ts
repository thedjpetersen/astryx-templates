import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Workforce Analytics Dashboard',
  description:
    'Workforce-platform cross-pillar analytics dashboard (Kestrel Labs, 140-person company, TTM Aug 2025 – Jul 2026): a 4-up KPI row (headcount 140 with +8 QoQ, TTM attrition 6.2% colored for its good direction, time-to-hire 34d, payroll cost $2.31M/mo), a 2x2 chart-widget grid — headcount growth line with a dashed FY26-plan overlay and labeled axes, attrition-by-department bars split regretted / non-regretted against a dashed company-average marker (clicking a department reveals its named exits), a three-donut diversity snapshot (gender / office / tenure, each summing to 140) with count-and-percent legends, and a payroll-cost stacked area (base / bonus / benefits / employer taxes) with a toggleable series legend — plus a 320px end-edge insights rail of three generated-insight cards that each cite the metric they were derived from. A 12 mo / 6 mo toggle rescopes both time-series charts, and clicking a month in either chart cross-highlights it in both and pins a reconciled readout row; every number reconciles with the suite fixtures (140 = 52+18+34+16+8+12, plan 156, 8 exits, Jul payroll 1,620+200+262+228 $K). Choose over hr-headcount-planning when the job is retrospective, cross-pillar trend analytics — attrition, diversity, and payroll cost read side by side — not forward seat planning and hiring-cost math; choose over kpi-dashboard or dashboard-filterable when the domain is this workforce platform and figures must reconcile with its HR/IT/Finance fixtures; choose over budget-tracker when the money is corporate payroll cost, not personal budgeting.',
  category: 'Workforce Platform',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Grid',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'SegmentedControl',
    'StackItem',
    'StatusDot',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
