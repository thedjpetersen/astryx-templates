import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Radiology Prior Auth Workbench",
  description: "Pre-certification workbench for imaging orders with payer rules, clinical notes, denial risk, and slot protection. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "Healthcare - Radiology Prior Auth Workbench",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
