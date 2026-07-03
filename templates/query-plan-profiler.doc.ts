import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Query Performance Profiler',
  description:
    'Slow-query analysis tool for a Postgres-style database: a query-list rail ranked by total cost with mono cost / p95 / calls columns and a sort Selector; a detail region with the SQL text, a stacked cost-breakdown bar whose segments highlight in sync with node hover/focus/tap, and a collapsible EXPLAIN plan tree where every node carries an operator Badge (Seq Scan / Hash Join / Sort), a row estimate, and a CSS cost bar; an index-suggestion panel whose Apply button swaps in a pre-built optimized plan with a before/after total-cost delta badge (and Revert undo), re-ranking the query list live; and a compare Switch that renders original and optimized trees side by side with removed / added / cost-changed nodes tinted. Choose over table-tree when rows are PLAN OPERATORS with costs and row estimates, not files; over test-runner-console when the subject is query cost, not test verdicts.',
  category: 'Data - Query Performance Profiler',
  componentsUsed: [
    'Badge',
    'Button',
    'Code',
    'Divider',
    'EmptyState',
    'Icon',
    'Layout',
    'Selector',
    'StatusDot',
    'Switch',
    'Text',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
