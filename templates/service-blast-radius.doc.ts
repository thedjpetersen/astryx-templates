import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Service Graph Blast-Radius Sandbox',
  description:
    'Explorable outage sandbox over a 21-service dependency graph at hand-authored SVG coordinates: flipping any node kill switch runs a deterministic BFS over 29 hard/soft edges, shading hard-down services in solid alarm tint and degraded ones with an SVG hatch pattern while the failure ripples outward one wave at a time under Play / Step / Rewind controls, so cause-to-effect order is legible as motion. Mitigation Switches (serve catalog from cache, fail over to the orders replica) reroute named edges along dash-animated accent paths and visibly shrink the recomputed impact; a scenario Selector loads three preset outage stories. Edge direction reads through mid-path chevrons, hover/focus/selection highlights a node’s complete upstream and downstream chains, and the 340px impact panel (bottom sheet below 1024px) tallies affected user-facing surfaces, lost RPS, and the selected node’s full dependency chain; the canvas pans by captured pointer drag or arrow keys. Choose over data-catalog-lineage or dag-run-visualizer when the point is simulating failure propagation and what-if mitigation, not inspecting a static graph or run history.',
  category: 'Explorables - Service Graph Blast-Radius Sandbox',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'Selector',
    'StatusDot',
    'Switch',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
