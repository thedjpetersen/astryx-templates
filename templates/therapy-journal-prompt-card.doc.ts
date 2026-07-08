import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Journal Prompt Card",
  description: "Therapy website experience for a guided therapy journal prompt component, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients reflecting after sessions or during skills practice.",
  category: "Therapy - Care Delivery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
