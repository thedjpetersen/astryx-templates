import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Aviation Turnaround Board",
  description: "Ramp operations command board for gating aircraft turns, crew handoffs, fueling, bags, catering, and maintenance blockers. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "Operations - Aviation Turnaround Board",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
