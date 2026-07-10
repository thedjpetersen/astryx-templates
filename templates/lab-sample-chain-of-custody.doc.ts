import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Lab Sample Chain of Custody',
  description:
    'Chainpoint specimen custody ledger: 64px rows with cap-colored tube glyphs, barcodes, and a four-node custody spine (draw, courier pickup, lab receipt, accession) plus hold-time chips counted against per-test stability windows, beside a 340px custody rail with the full event ledger and the one next action. Recording a handoff appends the event and advances the action-driven lab clock, re-deriving every other specimen hold chip in the same render; recording past a deadline attaches a stability exception, drops the clean-rate stat, and unlocks a recollect escalation. Status filter chips, derived census stats, and deterministic minute-based fixtures throughout.',
  category: 'Healthcare - Lab Sample Chain of Custody',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
