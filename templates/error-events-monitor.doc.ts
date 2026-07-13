import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Error Events Monitor',
  description:
    'Sentry-style error-issue monitor: eight expandable issue rows with a category Badge, mono title, tabular events/users/sessions counts, last-seen label, and a 7-day trend polyline; a period SegmentedControl (24h/7d) reprices every count and a Selector sorts by events or recency. Expanding a row reveals a 24-hour sparkline with a hover crosshair + tooltip, first-seen date, mono issue id, and an Open in tracker Button; one resolved row renders dimmed. Choose over agent-events-dashboard when the surface is a triage list of grouped error issues, not a live event feed.',
  category: 'AI Chat - Error Monitoring',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'Layout',
    'SegmentedControl',
    'Selector',
  ],
} satisfies AstryxPageTemplate;

export default template;
