import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Care Plan Roadmap",
  description: "Therapy website experience for a therapy care plan roadmap, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients orienting around phases of care and expected checkpoints.",
  category: "Therapy - Care Delivery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
