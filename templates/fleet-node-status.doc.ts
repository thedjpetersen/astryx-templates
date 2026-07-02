import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Fleet Node Status',
  description:
    'Fleet-availability console for connected agent nodes with a three-view SegmentedControl: a GitHub-style density Grid of small status squares (emerald/amber/red) with a HoverCard tooltip (mono instance id, "jchen · 1.42.3 · 34s ago"), a detail Table (Status dot, User, mono Node id with type Tokens, Version, Last Seen, Uptime, SSE check/cross), and a per-user rollup view with stacked health bars and tinted instance chips; filtering runs through a search TextInput, clickable status count ToggleButtons ("All 48", emerald 38, amber 6, red 4), platform Token chips (DevVM/DevGPU/OD/Mac), and mono version-distribution chips ("1.42.3 — 22 (46%)"). A legend row pins exact status semantics. Choose over dashboard-filterable or operations-dashboard when the unit is a homogeneous fleet best shown as a density grid with drill-down table, not KPI widgets.',
  category: 'Dashboard - Fleet Health',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'HoverCard',
    'Icon',
    'Layout',
    'SegmentedControl',
    'StatusDot',
    'Table',
    'Text',
    'TextInput',
    'Timestamp',
    'ToggleButton',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
