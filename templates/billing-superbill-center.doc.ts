import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Superbill Center",
  description: "Therapy website experience for a superbill and payment document center, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients downloading therapy billing documents for reimbursement.",
  category: "Therapy - Billing",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
