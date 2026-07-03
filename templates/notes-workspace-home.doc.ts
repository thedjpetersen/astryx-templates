// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Notes Workspace Home',
  description:
    'Notion-style connected-workspace home for the fictional startup Foldnote (warm umber accent): a left sidebar with workspace switcher, search, and an expandable nested page tree split into Shared and Private sections (page emojis, child-count chips, pinned member strip), and a main canvas rendering the "Studio Home" page — gradient cover strip with an overlapping emoji icon, title and maintained-by property row, a tinted callout block, a toggle-list group with one toggle expanded, a synced-block region outlined in the brand accent with an instance-count chip, an inline "Projects tracker" database rendered as Table and Board view tabs over the same six records (typed columns: status select, owner person, due date, effort number, multi-select tags; board grouped by status with reconciling counts and an effort-sum footer), a backlinks footer, and a floating "+ New page" affordance. Choose over read-later-library when the surface is a workspace of authored, nested pages with inline databases and block editing, not a saved-article reading queue with progress tracking and tag triage; choose over doc-comments-review when the canvas is a block-based workspace home (toggles, callouts, synced blocks, database views, backlinks), not a review pass over a static word-processor document with margin comment threads and tracked-change suggestions.',
  category: 'Startup Showcase',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Breadcrumbs',
    'Button',
    'Collapsible',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MoreMenu',
    'StackItem',
    'Tab',
    'TabList',
    'Table',
    'Text',
    'TextInput',
    'Timestamp',
    'Token',
    'Tooltip',
    'TreeList',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
