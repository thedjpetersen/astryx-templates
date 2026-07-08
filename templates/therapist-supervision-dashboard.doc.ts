import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Therapist Supervision Dashboard",
  description: "Therapy website experience for a clinical supervision dashboard, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for supervisors reviewing caseload health and therapist support needs.",
  category: "Therapy - Practice Ops",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
