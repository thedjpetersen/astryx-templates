import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Grant Reporting Calendar',
  description:
    'Grantline compliance workspace: a July month calendar whose day cells carry deliverable chips (grant dot, kind glyph, derived overdue/due/filed/review/accepted/paid status) beside a 340px rail with a deliverable detail pane (requirements checklist, reasoned File action, undo), a four-stage funder-review lane, and a per-grant reimbursement ledger with stacked paid/with-funder/remaining bars. Filing a deliverable flips its chip, drops it into the review lane, and moves its exact dollars from the ready-to-file KPI into the grant with-funder balance in the same render, with deterministic cross-checked fixtures.',
  category: 'Civic - Grant Reporting Calendar',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
