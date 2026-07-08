import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Therapy Availability Booking",
  description: "Therapy website experience for a first-session availability picker, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients who need a calm path from therapist fit to a confirmed appointment.",
  category: "Therapy - Scheduling",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
