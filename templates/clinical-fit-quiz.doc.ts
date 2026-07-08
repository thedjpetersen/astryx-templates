import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Clinical Fit Quiz",
  description: "Therapy website experience for a clinical fit quiz experience, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients describing preferences, goals, and care constraints.",
  category: "Therapy - Discovery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
