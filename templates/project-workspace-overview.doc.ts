// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Project Workspace Overview',
  description:
    "Single project home for the Kestrel Labs 'Atlas Launch Readiness' project (the Atlas Q3 launch push, anchored Wed Jul 15, 2026): a project header with breadcrumb, at-risk amber health pill (StatusDot with set-by tooltip), phase chip, 8-member AvatarGroup facepile, Follow toggle, and countdown / next-review meta chips; a description block with three inline goal rows (target icon, due-date Token, owner Avatar); a milestone timeline strip of five milestones on one shared px-per-day scale (Jul 6–Aug 8) with week ticks, a Today marker at Jul 15, two-tier collision-free labels, a status legend, and one slipped milestone showing its struck-through original date (Jul 10 → Jul 17); a linked-resources grid of six doc/board/dashboard tiles with categorical app glyphs and staleness Tokens (fresh / dated / 'Stale · 9 days'); four workstream cards (owner, On track / At risk Token, per-stream ProgressBar with percent readout, weekly update line, next-milestone chips); a risks & blockers list of two risks with severity chips, mitigation prose, raised-by attribution, and mitigation-owner columns; and a 340px recent-decisions rail citing the Atlas Q3 decision-log records (Decided / Proposed Tokens, owner, approvals, source meeting) that reflows into a content section below 1180px. Choose over team-space-home when the surface is one project's execution overview (health, milestones, workstreams, risks) rather than the team's daily front door of pinned docs, meetings, and away-digest; choose over workstream-status-rollup when a single project's page cites decisions and risks inline rather than the weekly all-workstreams program report with narrative updates and trend pips; choose over team-decision-log when decisions are a summary rail linking out, not the filterable register with options-considered and approver detail; choose over okr-tree when status is narrative milestones and progress bars, not an objectives/key-results tree with confidence scoring; choose over sprint-board-backlog when the altitude is program milestones and risks, not story cards, points, and sprint capacity; choose over timeline when content is grouped by durable region (milestones, resources, risks), not a chronological event feed; choose over notes-workspace-home when the page is a structured project record, not an editable block canvas with a nested page tree.",
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Breadcrumbs',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'Link',
    'ProgressBar',
    'StackItem',
    'StatusDot',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
