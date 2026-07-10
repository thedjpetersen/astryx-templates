import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Procurement Bid Evaluator',
  description:
    'Bidframe weighted-scoring war-room for a sealed-bid RFP: a 300px weights rail with preset chips and live 0–40-point criterion sliders, a rank podium, and a vendors × criteria consensus matrix with micro score bars, panel-divergence dots, and a per-cell panelist breakdown strip. Adjusting any weight re-normalizes effective percentages, recomputes all weighted totals, reorders the matrix and podium with movement markers vs the committee baseline, re-derives the leader margin, and flips the award-readiness gates (compliance condition on the leader, decisive-margin BAFO check). Deterministic fixtures: 5 vendors × 6 criteria × 3 authored panelist scores whose means are derived live.',
  category: 'Operations - Procurement Bid Evaluator',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Badge',
    'Button',
    'Heading',
    'Text',
    'Icon',
    'Slider',
  ],
} satisfies AstryxPageTemplate;

export default template;
