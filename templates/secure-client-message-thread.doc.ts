import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Secure Client Message Thread",
  description: "Therapy website experience for a private client-therapist message thread, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients sending care-related updates between sessions.",
  category: "Therapy - Care Delivery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
