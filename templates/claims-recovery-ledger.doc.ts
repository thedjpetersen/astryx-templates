import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Claims Recovery Ledger",
  description: "Subrogation and overpayment recovery ledger with case aging, expected yield, evidence packets, and payer touchpoints. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "Finance - Claims Recovery Ledger",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
