import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Practice Analytics",
  description: "Therapy website experience for a therapy practice analytics dashboard, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for practice leaders monitoring access, retention, and clinical operations.",
  category: "Therapy - Practice Ops",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
