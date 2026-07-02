import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Activation Funnel Analytics',
  description:
    'Product-activation analytics page built around a horizontal funnel: five summary stat Cards (Total Users 312, Any Node 68%, CLI Node 41%, Day 2 Return 54%, Power Users 12%), a "Biggest Drop-offs" Card with severity StatusDots and suggestion lines, the interactive funnel Card — one row per milestone with a clickable stage label (strikethrough = excluded), a proportional colored bar with the user count inside, "of total" and "step CVR" columns, and green/red delta Badges against a comparison segment with ghost bars — plus a cohort-conversion heatmap Table (weekly cohorts × 8 milestones, cells tinted green ≥50% / amber ≥20% / red below, em-dash for zero) and a milestone-velocity bar strip with hover Tooltips. Choose over kpi-dashboard or dashboard-executive-summary when the narrative is sequential conversion and cohort retention, not point-in-time KPIs.',
  category: 'Dashboard - Activation Funnel',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Grid',
    'Heading',
    'Icon',
    'Layout',
    'Link',
    'ProgressBar',
    'Selector',
    'StatusDot',
    'Table',
    'Text',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
