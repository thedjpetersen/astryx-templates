import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Context Compaction Inspector',
  description:
    'Inspector page for a conversation-compaction event: header with status Badge and headline metrics MetadataList, then three tabs — a resizable Comparison split of collapsed raw messages vs. the compressed Markdown summary with preserved-topic Token chips, a Context tree with per-node token ProgressBar meters and hover Tooltips, and a Stats table with before/after token columns and delta Badges. Metrics + structure, not a line-level code diff.',
  category: 'AI Chat - Context Inspector',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Card',
    'Layout',
    'List',
    'Markdown',
    'MetadataList',
    'ProgressBar',
    'Resizable',
    'TabList',
    'Table',
    'Token',
    'Tooltip',
    'TreeList',
  ],
} satisfies AstryxPageTemplate;

export default template;
