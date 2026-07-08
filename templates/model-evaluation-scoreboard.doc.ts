import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Model Evaluation Scoreboard",
  description: "Model evaluation scoreboard for benchmark runs, judge disagreement, regression slices, and release gates. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "AI - Model Evaluation Scoreboard",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
