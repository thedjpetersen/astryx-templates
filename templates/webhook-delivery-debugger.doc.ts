import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Webhook Delivery Debugger',
  description:
    'Outbound-webhook inspection console with an endpoint health rail, a status/event-type filterable delivery feed, and a detail pane holding a collapsible JSON payload tree with copy-path, response headers/body, signature details, an attempt timeline with backoff intervals, live replay, and an endpoint settings drawer.',
  category: 'Operations - Webhook Delivery Debugger',
  componentsUsed: [
    'Badge',
    'Button',
    'EmptyState',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'SegmentedControl',
    'Selector',
    'Spinner',
    'StatusDot',
    'Switch',
    'TabList',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
