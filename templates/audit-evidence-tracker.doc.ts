import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Audit Evidence Tracker',
  description:
    'Attest engagement PBC command surface: a control-area × status evidence matrix with clickable count cells, a late-close burn-down chart whose today point and projected finish derive live from the request set, a control-owner scorecard, and a reviewer queue rail where accepting or returning evidence advances the matrix, re-aims the projection, updates the scorecard, and appends an undoable activity-ledger entry. Deterministic fixtures: 34 requests across 7 control areas over a fixed Mar 2–27 fieldwork calendar.',
  category: 'Finance - Audit Evidence Tracker',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Badge',
    'Button',
    'Heading',
    'Text',
    'Icon',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
