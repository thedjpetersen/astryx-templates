import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Public Comment Moderation',
  description:
    'Podium — a city-clerk console for running the public-comment block of a council hearing. A time-budget strip with an over-budget hatched allocation bar sits over a topic-cluster filter panel (sentiment split bars), a positioned speaker queue with per-speaker time-allocation bars and expandable comment excerpts, and a duplicate form-letter stack. Merging a duplicate group collapses its members into one spokesperson slot: queue positions renumber, cluster counts collapse, the requested-time total and projected end time re-derive, and the budget-gated publish action unlocks.',
  category: 'Civic - Public Comment Moderation',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Badge',
    'Button',
    'Icon',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
