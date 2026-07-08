import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Claims Follow-up",
  description: "Therapy website experience for an insurance claims follow-up workspace, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients and support teams tracking claim status after therapy visits.",
  category: "Therapy - Billing",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
