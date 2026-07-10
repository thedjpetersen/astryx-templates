import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Prompt Experiment Lab',
  description:
    'LLM prompt A/B bench for one experiment: a cohort-allocation traffic strip over four variant comparison columns with prompt diffs, weighted judge-rubric score bars (champion baseline ticks + signed deltas), failure-cluster chips with per-1k rates, and a three-gate promotion wall; a bottom bench bar pairs a graded-transcript cluster inspector with a promotion log. Promoting a challenger reflows the allocation strip, re-derives every delta, tick, cluster tag, and gate against the new champion, and logs an undoable event.',
  category: 'AI - Prompt Experiment Lab',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Heading',
    'Text',
    'Badge',
    'Button',
    'Icon',
  ],
} satisfies AstryxPageTemplate;

export default template;
