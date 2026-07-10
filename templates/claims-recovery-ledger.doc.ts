import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Claims Recovery Ledger',
  description:
    'Recoup payment-integrity ledger: an aging waterfall band of five clickable bucket columns (bar fill opacity encodes stage recovery probability) draining into recovered/written-off pools, over a stat strip and a dense 44px-row recovery ledger with expandable evidence packets. Advancing a case stage re-derives its expected yield, the probability-weighted total, and its bucket bar in one render; posting a recovery moves the dollars from the aging column into the recovered pool. Includes a notice gate that refuses to advance a case with an empty evidence packet; deterministic cents-accurate fixtures.',
  category: 'Finance - Claims Recovery Ledger',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Heading',
    'Text',
    'Badge',
    'Icon',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
