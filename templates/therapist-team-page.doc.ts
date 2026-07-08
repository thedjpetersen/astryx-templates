import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Therapist Team Page",
  description: "Therapy website experience for a therapist team and practice page, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients comparing a practice team and deciding who to contact.",
  category: "Therapy - Discovery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
