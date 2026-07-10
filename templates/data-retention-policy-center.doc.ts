import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Retention Policy Center',
  description:
    'Records-governance console: a derived stat strip (records governed, past retention, blocked-by-holds, next clear window) over a three-region frame — policy scope tree with retention rules and legal-hold gavel badges above a hold ledger, a July purge-window calendar whose day cells carry hold-overlay badges over a window/scope detail bar, and a purge-exception queue with approve/deny actions and a decision log. Approving an exception lifts the scope’s hold badge, decrements (and clears) the calendar window’s block, re-derives records-at-risk and the next-clear-window stat, and logs an undoable decision.',
  category: 'Security - Retention Policy Center',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Heading',
    'Text',
    'Badge',
    'Button',
    'Icon',
  ],
} satisfies AstryxPageTemplate;

export default template;
