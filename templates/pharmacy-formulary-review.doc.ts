import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Pharmacy Formulary Review',
  description:
    'Compendia P&T committee motion board: a therapeutic-class coverage matrix (class rows × tier/PA/NC placement columns) beside a filterable motion docket and a per-member vote recorder. Recording For/Against/Abstain ballots re-derives tally bars, the 6-segment quorum meter, and motion readiness; ratifying a passing motion moves the agent count between matrix cells, appends a session-minute entry, and locks the roster. Tracks abstentions and a recused member; deterministic fixtures throughout.',
  category: 'Healthcare - Pharmacy Formulary Review',
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
