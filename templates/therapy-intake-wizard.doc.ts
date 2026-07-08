import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Therapy Intake Wizard",
  description: "Therapy website experience for a pre-visit intake flow, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for new clients completing clinical, consent, and logistics questions.",
  category: "Therapy - Onboarding",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
