import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Privacy Consent Center",
  description: "Therapy website experience for a privacy and consent center, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients reviewing therapy privacy, data sharing, and communication consent.",
  category: "Therapy - Trust",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
