// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Decision Log & RFC Review',
  description:
    'Decision log & RFC review register for the Kestrel Labs Atlas Q3 program, list+detail per the split-pane archetype: a resizable start rail of 8 decision records (Proposed/Accepted/Superseded status Tokens, domain tags, driver Avatars) under pinned filter chips with reconciling counts and a search box; a content pane rendering the selected RFC ("RFC-014: Single review queue for Atlas launch") as a static styled doc with Context / Options-considered / Decision sections, an amber-anchored comment thread on one context paragraph (3 comments, reply composer), and a reviewer-stances row (2 approved, 1 concern with a note excerpt that matches the thread, 2 pending with a nudge affordance); a 320px end panel with the decision-metadata Card (driver, approver, decide-by date with a fixed "2 days left" countdown chip, source-doc link, outcome-review "Revisit in 90 days" chip) and an activity list; plus a superseded-by warning Banner leading retired records and a supersedes-teaser strip on their replacement, both cross-linking selections. Choose over doc-comments-review when the surface is a register of structured decision records with statuses, stances, and supersede lineage — not a review pass over one document canvas with margin comment threads and tracked changes. Choose over notes-workspace-home when records are structured RFC entries with lifecycle metadata, never authored freeform pages in a block-canvas page tree. Choose over meet-recap when the artifact is the decision REGISTER that links back to the meeting it was decided in, not the post-meeting recording/transcript/summary itself. Choose over timeline when entries are status-driven records filtered by lifecycle, not a raw chronological event feed under sticky date headers.',
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'Resizable',
    'StackItem',
    'Text',
    'TextArea',
    'TextInput',
    'ToggleButton',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
