import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Construction RFI Tracker',
  description:
    'Fieldset jobsite RFI answer desk for a core-&-shell project: a 68px-row RFI ledger led by bespoke drawing-sheet thumbnails with per-RFI brick revision clouds (scalloped-arc SVG), an analytics band pairing an answer-aging histogram, a cost-exposure rollup with proportional trade bars, and a ball-in-court responder scorecard, plus a 372px answer-composer panel. Logging an answer with a no-cost or accept-cost disposition shrinks the aging bucket bar, rolls open exposure down (accepted dollars move to Committed), and updates the responder scorecard in the same render; Reopen reverses every derivation. Deterministic fixtures with hand-checked dollar and bucket arithmetic.',
  category: 'Operations - Construction RFI Tracker',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'HStack',
    'StackItem',
    'Heading',
    'Text',
    'Badge',
    'Button',
    'Icon',
  ],
} satisfies AstryxPageTemplate;

export default template;
