import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Outcome Measures Library",
  description: "Therapy website experience for a clinical outcome measures library, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for therapists assigning validated screeners and tracking progress.",
  category: "Therapy - Clinical Tools",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
