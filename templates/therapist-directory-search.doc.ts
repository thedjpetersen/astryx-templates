import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Therapist Directory Search",
  description: "Therapy website experience for a searchable therapist marketplace directory, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients filtering by specialty, identity, budget, and schedule.",
  category: "Therapy - Discovery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
