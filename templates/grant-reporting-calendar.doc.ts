import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Grant Reporting Calendar",
  description: "Grant compliance calendar joining deliverables, reimbursements, evidence uploads, and funder review states. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "Civic - Grant Reporting Calendar",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
