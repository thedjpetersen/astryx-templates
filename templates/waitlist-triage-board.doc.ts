import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Waitlist Triage Board",
  description: "Therapy website experience for a therapy waitlist triage board, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for care coordinators prioritizing clients waiting for therapist openings.",
  category: "Therapy - Access",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
