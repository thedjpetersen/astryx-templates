import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Sponsorship Calendar',
  description:
    'Creator sponsorship desk on a July month grid: accepted campaigns render as lane-packed span bars with deliverable diamonds and continuation arrows, category-exclusivity conflicts hatch the exact overlap days, and a rail pairs the offer inbox with a 30/50/20 payout checkpoint ledger. Accepting an offer lands its bar, re-runs the conflict engine, appends its checkpoints, and re-derives booked revenue live.',
  category: 'Creator - Sponsorship Calendar',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Heading',
    'Text',
    'Avatar',
    'Button',
    'Divider',
    'Icon',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
