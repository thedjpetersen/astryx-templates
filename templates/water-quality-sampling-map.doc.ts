import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Water Quality Sampling Map',
  description:
    'Tributary field chain-of-custody console for one watershed sampling run. A schematic watershed SVG (river branches, run-order polyline, state-coded site pins) sits above a 29-row bottle manifest with live hold-time chips, beside a custody rail carrying a five-step chain-of-custody spine and a tightest-holds board scored against the lab-receipt deadline. Logging a collection stamps the crew cadence and re-derives the pin, polyline leg, custody spine, hold chips, deadline board, and every header stat in one render — with snapshot-exact undo. Deterministic fixtures with hand-checked hold arithmetic.',
  category: 'Sustainability - Water Quality Sampling Map',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'HStack',
    'VStack',
    'StackItem',
    'Heading',
    'Text',
    'Button',
    'Icon',
  ],
} satisfies AstryxPageTemplate;

export default template;
