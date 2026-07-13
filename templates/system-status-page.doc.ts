import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'System Status Page',
  description:
    'Public status/observability page for an AI agent platform: a tinted status band (StatusDot + "All systems operational" heading, retinted amber/red by a page-chrome scenario Selector) over a left-border-divided stat strip with big tabular numbers (sessions, users, error sessions, agent runs). A TabList switches Errors (Top Errors Table, By Error Type proportional bars, By Release mono-sha rows), Health (90-day green/amber/red uptime segment bars for four services), Performance (TTFT p50/p90/p99 mini-table with a 1h/24h/7d SegmentedControl), and Usage (four stat cards plus a hoverable 14-day inline SVG bar chart). Choose over error-events-monitor when the story is the public aggregate rollup, not per-issue triage.',
  category: 'AI Chat - Observability',
  componentsUsed: [
    'Button',
    'Card',
    'Divider',
    'Grid',
    'Heading',
    'Icon',
    'Layout',
    'SegmentedControl',
    'Selector',
    'StatusDot',
    'TabList',
    'Table',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
