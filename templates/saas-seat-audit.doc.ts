import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'SaaS Seat Audit',
  description:
    'Seatsmith license-optimization console for one vendor contract: an interactive 90-day seat-utilization histogram that filters an entitlement drift table (tier chips, 12-week activity strips, reclaim/downgrade recommendations), beside a reclaim-plan tray whose projected renewal savings counter and Today→After license-tier bars re-derive live as seats are batched; a contract-locked seat refuses batching with its SOW reason.',
  category: 'SaaS - SaaS Seat Audit',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'LayoutPanel',
    'Badge',
    'Button',
    'Divider',
    'Icon',
    'IconButton',
    'TextInput',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
