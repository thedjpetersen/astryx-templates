import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Field Service Dispatch Radar",
  description: "Dispatcher radar for technician routes, skill matches, SLA risk, parts readiness, and reroute actions. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "Operations - Field Service Dispatch Radar",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
