import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Sliding Scale Selector",
  description: "Therapy website experience for a sliding-scale payment selector, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients choosing affordable therapy payment options.",
  category: "Therapy - Billing",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
