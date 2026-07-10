import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Loan Covenant Monitor',
  description:
    'Covena covenant gauge wall for a syndicated credit agreement: six per-covenant ratio dials (arc gauge with threshold tick, actual needle, and hollow forecast marker) over eight-quarter sparkbars that carry per-quarter step-down limits, a forecast bench whose EBITDA and incremental-debt sliders flip breach projections live across every dial, and a waiver desk drawer that re-ranks covenants by forecast headroom, builds a priced waiver package (12.5 bps per covenant), and gates it behind a send-to-counsel lock. Deterministic fixtures; all dial values derive from eight base financial inputs.',
  category: 'Finance - Loan Covenant Monitor',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Text',
    'Button',
    'Icon',
    'Avatar',
    'Slider',
    'Token',
    'Divider',
  ],
} satisfies AstryxPageTemplate;

export default template;
