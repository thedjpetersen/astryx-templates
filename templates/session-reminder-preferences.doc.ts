import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Reminder Preferences",
  description: "Therapy website experience for a therapy session reminder preferences panel, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients configuring reminders without over-sharing sensitive details.",
  category: "Therapy - Scheduling",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
