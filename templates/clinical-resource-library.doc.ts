import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Clinical Resource Library",
  description: "Therapy website experience for a therapy resource library, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients browsing worksheets, articles, and skills between sessions.",
  category: "Therapy - Content",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
