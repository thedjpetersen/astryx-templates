import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Session Notes Review",
  description: "Therapy website experience for a collaborative session summary review page, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients reviewing takeaways, themes, and follow-up after therapy.",
  category: "Therapy - Care Delivery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
