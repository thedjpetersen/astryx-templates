import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Treasury Cash Position',
  description:
    'Ledgerline daily cash-position console for a multinational group: an entity-by-currency cash matrix (sticky entity rail, operating-floor / deficit / restricted-jurisdiction cell states, live per-currency totals) under a derived stat band, with an SVG sweep-arrow overlay drawing every proposed sweep into the in-house bank. Executing a sweep from the queue rail moves balances across the matrix, re-derives concentration and trapped-cash stats, flips the arrow to settled, and appends a fixture-timestamped action-log entry; a settlement-window timeline strip gates the queue (BOJ-NET cutoff refusal, TARGET2 closing-soon countdown, CADOC document gate). Deterministic fixtures throughout.',
  category: 'Finance - Treasury Cash Position',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Text',
    'Button',
    'Icon',
    'Avatar',
    'CheckboxInput',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
