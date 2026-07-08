import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Lab Sample Chain of Custody",
  description: "Specimen custody console tracking draws, courier handoffs, accessioning, reruns, and exception evidence. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "Healthcare - Lab Sample Chain of Custody",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
