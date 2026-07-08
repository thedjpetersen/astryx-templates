import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Specialty Finder",
  description: "Therapy website experience for a therapy specialty finder, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients translating needs into therapist specialty filters.",
  category: "Therapy - Discovery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
