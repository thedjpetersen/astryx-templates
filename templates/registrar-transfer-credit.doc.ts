import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Transfer Credit Articulation',
  description:
    'Registrar transfer-credit workbench (Articula): a side-by-side equivalency mapper joins incoming quarter-unit courses to catalog semester courses with a decision-encoding seam arrow, beside a syllabus evidence pane (credit-conversion math, contact-hours comparison, topic-coverage checklist with match meter, precedent decisions, evidence gates). Approving or denying a mapping re-derives the degree-audit progress ring, the remaining-credits bucket table, the credit ledger, and the post-to-transcript gate in one pass, with a deterministic case-activity log.',
  category: 'Education - Transfer Credit Articulation',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Icon', 'Toast'],
} satisfies AstryxPageTemplate;

export default template;
