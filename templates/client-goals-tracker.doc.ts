import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Client Goals Tracker",
  description: "Therapy website experience for a client progress and goals tracker, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients and therapists checking movement across agreed therapy goals.",
  category: "Therapy - Care Delivery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
