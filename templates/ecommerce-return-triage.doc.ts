import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Retriage Returns Triage',
  description:
    'Inbound returns disposition desk: a disposition tally strip (refunded $, exchanges, denials, fraud patterns flagged) over a 2x2 reason-cluster board of dense case cards with banded fraud-score pills, and a 360px inspection panel with an SVG fraud-signal meter, itemized signal weights, and a Refund/Exchange/Deny routing tray. One ordered session log owns all state — routing a case empties it from its lane, moves every tally, flags fraud patterns on high-score denials, refuses cases without an arrival scan, and reverses completely from per-row Undo.',
  category: 'Commerce - Return Triage Workbench',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'LayoutPanel',
    'Icon',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
