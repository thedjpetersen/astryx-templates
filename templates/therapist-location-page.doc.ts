import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Therapist Location Page",
  description: "Therapy website experience for a local therapy location page, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients searching for therapy near a city or neighborhood.",
  category: "Therapy - Discovery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
