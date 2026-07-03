import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Offline Sync Outbox',
  description:
    'Mobile-first field-notes app framed beside its own sync internals: an airplane-mode toggle queues optimistic edits as cloud-slash outbox chips, play/pause/step drains one scripted mutation per tick (ack, retry, conflict, reject), a conflict resolver Dialog offers keep-mine / take-server / merge-per-field, rejects roll back with a strike-through and an undo Toast, and a two-column client-state/server-state ledger tracks the lag counter.',
  category: 'Tools - Offline Sync Outbox',
  componentsUsed: [
    'Badge',
    'Button',
    'Dialog',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'SegmentedControl',
    'Selector',
    'Switch',
    'TextInput',
    'Toast',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
