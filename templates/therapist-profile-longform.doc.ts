import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Therapist Profile Longform",
  description: "Therapy website experience for a detailed clinician profile page, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients deciding whether a therapist feels clinically and personally aligned.",
  category: "Therapy - Discovery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
