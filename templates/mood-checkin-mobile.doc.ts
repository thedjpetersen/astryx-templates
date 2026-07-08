import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Mood Check-in Mobile",
  description: "Therapy website experience for a mobile mood and symptoms check-in, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients sharing quick context before or between sessions.",
  category: "Therapy - Care Delivery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
