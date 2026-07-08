import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Loan Covenant Monitor",
  description: "Commercial loan covenant monitor with breach forecasts, waiver packages, ratio evidence, and borrower follow-ups. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "Finance - Loan Covenant Monitor",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
