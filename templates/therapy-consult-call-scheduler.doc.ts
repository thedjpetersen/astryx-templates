import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Consult Call Scheduler",
  description: "Therapy website experience for a free consultation call scheduler, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients who want a short conversation before choosing a therapist.",
  category: "Therapy - Scheduling",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
