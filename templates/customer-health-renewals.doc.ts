import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Customer Health Renewals',
  description:
    'Evergreen renewal desk: a date-sorted renewal pipeline with sticky month headers, 40px SVG health-score dials, signal chips, and tier chips under a proportional five-bucket forecast strip with a weighted-vs-plan meter; a 340px account panel holds subscore bars, risk signals, a save-play composer, and the account timeline. Applying a save play lifts one subscore and re-derives the dial, tier, bucket dollars, weighted forecast, and timeline from a single applied-plays map — with undo. Deterministic Q3 FY26 fixtures.',
  category: 'SaaS - Customer Health Renewals',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Heading',
    'Text',
    'Button',
    'Icon',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
