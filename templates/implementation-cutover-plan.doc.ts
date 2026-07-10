import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Implementation Cutover Plan',
  description:
    'Cutline go-live command surface: a T-minus runbook (sticky phase headers, 56px toggleable task rows with T-offset and wall-clock columns, a fixed NOW rule) beside a decision aside holding the Go/No-Go gate panel and a rollback checkpoint rail. Checking gate rows re-derives the GO / NO-GO / PENDING verdict (one criterion auto-derives from the runbook itself); tripping a rollback checkpoint restyles all covered tasks as skipped or reverted, forces NO-GO, and stands down cleanly. Deterministic ERP-cutover fixtures on one minute ledger.',
  category: 'SaaS - Implementation Cutover Plan',
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
