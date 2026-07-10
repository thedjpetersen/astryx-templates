import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Feature Adoption Cohort',
  description:
    'Cohora growth-PM console for an 18-account feature-adoption cohort: an adoption-stage funnel with tapering cohort-flow ribbons drawn live from the row set, an account drill-down table with weekly-run sparklines and blocker chips, and a lifecycle aside whose stage-gated actions (verify activation, promote to habitual, log expansion order) move accounts between stages — ribbon widths, stage counts, filter tallies, ARR rollups, and the activity log all re-derive from one state owner, with visible refusal reasons for blocked or ineligible accounts.',
  category: 'SaaS - Feature Adoption Cohort',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'HStack',
    'VStack',
    'StackItem',
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
