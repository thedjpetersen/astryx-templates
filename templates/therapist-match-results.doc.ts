import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Therapist Match Results",
  description: "Therapy website experience for a personalized therapist match results page, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients reviewing recommended therapists after a guided quiz.",
  category: "Therapy - Discovery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
