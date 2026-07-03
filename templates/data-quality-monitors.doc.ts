import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Data Quality Monitor Console',
  description:
    'Warehouse data-quality console: a header whose pass/warn/fail summary chips are live filter Buttons over 10 freshness/volume/schema-drift/null-rate monitors, an active-incident Banner that drills into a breach timeline with an Acknowledge action that downgrades the fail chip to warn, a search TextInput plus warehouse-table SegmentedControl over a monitor Table with check-type Tokens, inline SVG trend sparklines (30-point polyline with dashed threshold), and last-run status dots, a docked detail drawer (end LayoutPanel, Dialog fallback below 1080px) pairing a run-history SVG chart — threshold line, shaded violation band, breach-point dots — with a threshold Slider that live-recomputes breach counts and projected status before Save updates the row and chips, Snooze and confirm-Mute actions that move monitors into a collapsible Muted & snoozed section with Resume as the undo, and per-monitor MetadataLists. Choose over logs-explorer or feature-gate-console when the surface is threshold-tuned check monitoring over warehouse tables, not log search or flag toggling.',
  category: 'Data - Data Quality Monitor Console',
  componentsUsed: [
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Code',
    'Dialog',
    'Divider',
    'EmptyState',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'Slider',
    'StatusDot',
    'Table',
    'TextInput',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
