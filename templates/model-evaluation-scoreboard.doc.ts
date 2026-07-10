import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Model Evaluation Scoreboard',
  description:
    'Benchline, an ML release-review surface for a candidate model vs its production baseline: a benchmark leaderboard with derived composite bars, a slice regression matrix (nine eval slices by four gated metrics), a judge-disagreement dumbbell plot (LLM judge vs human panel per slice), and a 336px release gate rail with enable toggles, threshold steppers, a promote-on-green button, and a decision log. Stepping any gate threshold re-evaluates every slice in the same render — matrix cells flip pass/fail, gap chips re-flag, and the SHIP/HOLD verdict banner re-derives its reasons from one gate store. Deterministic hand-checked fixtures.',
  category: 'AI - Model Evaluation Scoreboard',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Heading', 'Text', 'Button', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
