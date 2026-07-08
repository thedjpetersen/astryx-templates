import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Crisis Resource Handoff",
  description: "Therapy website experience for a crisis resource handoff page, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients needing urgent guidance outside routine therapy messaging.",
  category: "Therapy - Safety",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
