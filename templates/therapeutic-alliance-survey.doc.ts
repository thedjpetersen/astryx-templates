import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Alliance Survey",
  description: "Therapy website experience for a therapeutic alliance feedback survey, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients sharing fit and collaboration feedback safely.",
  category: "Therapy - Care Delivery",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
