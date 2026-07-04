// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Team Wiki & Knowledge Base',
  description:
    'Team wiki & knowledge-base surface for the Kestrel Labs Atlas Q3 program: a 280px page-tree rail (spaces > sections > emoji pages via TreeList, current page highlighted, per-space quick-add "+" and a pinned New-page footer, stale-page dots), a centered 820px article column rendering the "Atlas Q3 Launch Runbook" as static styled wiki content — section headings, an info callout, a roles-and-escalation table, a launch-day timeline, and a bash rollback CodeBlock — topped by editing-presence avatars (two viewers plus one editor ringed in their member color with a colored-caret "is editing" note) and a page metadata bar (owner, last-verified date, green "Verified 12d ago" freshness badge, last edit, watcher count); below the article, a stale sibling-page teaser carrying a warning Banner ("last verified 94 days ago") with a Request-review action, and a "Linked from" backlinks section whose count chip reconciles with its four rows; and a right 232px "On this page" mini-TOC whose active entry scroll-spies the article scroller and scrolls to sections on click. Choose over notes-workspace-home when the surface is a verified team knowledge base — owned pages with freshness attestation, backlinks, and a read-mostly article — not a Notion-style block-editing workspace with inline database views; choose over doc-comments-review when the artifact is a wiki page browsed in place, not a word-processor review pass with margin comment threads and tracked-change suggestions; choose over office-shared-drive when the tree organizes authored knowledge pages with owners and verification state, not files with sharing, storage, and bulk actions; choose over team-space-home when the job is reading and maintaining reference pages, not a program hub of pinned docs, meetings, and activity digests.',
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'Banner',
    'Breadcrumbs',
    'Button',
    'CodeBlock',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MoreMenu',
    'StackItem',
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
