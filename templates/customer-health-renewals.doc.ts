import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Customer Health Renewals",
  description: "CS renewal desk for health signals, product gaps, champions, mutual action plans, and risk save motions. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "SaaS - Customer Health Renewals",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
