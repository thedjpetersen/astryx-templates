import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Note Template Library",
  description: "Therapy website experience for a therapist documentation template library, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clinicians choosing structured notes for common therapy workflows.",
  category: "Therapy - Clinical Tools",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
