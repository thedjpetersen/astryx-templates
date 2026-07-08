import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Therapist Credentialing",
  description: "Therapy website experience for a therapist onboarding and credentialing tracker, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for practice teams bringing new clinicians online.",
  category: "Therapy - Practice Ops",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
