// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Read-Later Library',
  description:
    'Save-for-later reading queue with a three-pane frame: views rail (Unread / Reading / Archive / Favorites plus a tag list with live counts), an article list with favicon chips, reading-time estimates, per-row read-progress bars, bulk-select, and A/F/T keyboard triage, and a reader pane whose scroll position ratchets the progress bar and auto-moves Unread items into Reading, with adjustable text size and inline tag editing. Choose over inbox for saved long-form articles with progress and tags, not correspondence.',
  category: 'Learning - Read-Later Library',
  componentsUsed: [
    'Badge',
    'Button',
    'CheckboxInput',
    'Divider',
    'EmptyState',
    'IconButton',
    'Kbd',
    'Layout',
    'List',
    'Popover',
    'ProgressBar',
    'Selector',
    'TextInput',
    'Toast',
    'Token',
    'Toolbar',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
