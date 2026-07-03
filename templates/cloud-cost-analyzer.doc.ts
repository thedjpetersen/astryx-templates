import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Cloud Cost Analyzer',
  description:
    'Cloud spend-exploration surface over one fixture array (6 services × 4 teams × 6 months with an injected May anomaly): header with the total-spend KPI, MoM delta Badge, and a period Selector (last 3 / 6 months), a group-by SegmentedControl (Service / Team / Region / Tag) that re-stacks a plain SVG-rect stacked-bar trend chart and re-derives the breakdown ledger — full-width button rows with share bars, latest-month spend, and red/green month-over-month delta Badges. Clicking a row drills into that dimension slice with a Breadcrumbs trail for backing out plus a reset; the anomaly marker over the spiked bar opens an explanation Popover with an acknowledge action; and a docked what-if commitment LayoutPanel (coverage Slider + 1-yr/3-yr term SegmentedControl) live-derives projected savings and repaints a dashed overlay line on the chart, stacking into the column below 900px. Choose over kpi-dashboard or dashboard-filterable when the narrative is dimensional spend exploration — regroup, drill, explain anomalies, and model commitments — not point-in-time KPIs.',
  category: 'Operations - Cloud Cost Analyzer',
  componentsUsed: [
    'Badge',
    'Breadcrumbs',
    'Button',
    'Card',
    'Divider',
    'Grid',
    'Heading',
    'Icon',
    'Layout',
    'LayoutPanel',
    'Popover',
    'SegmentedControl',
    'Selector',
    'Slider',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
