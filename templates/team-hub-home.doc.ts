// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Team Hub Home',
  description:
    "Team hub home for the Kestrel Labs Atlas Q3 program team — the app-shell front door a member opens every morning: a pinned hub header with team identity, a launch-countdown chip fixed at 20 days, a presence facepile (three green-ringed online members, Marcus in-meeting amber, an overflow chip) and a Start-huddle pill; a main column with a quick-actions row (new doc, share update, schedule), a today strip of three meetings with live/upcoming Join chips, a tomorrow's-review note, and a who's-out row citing Dana's PTO and Jonah's coverage; a pinned-docs rail of the four canonical Atlas docs (type glyphs, last-edited metadata, in-doc presence dots); a grouped recent-activity feed (doc edits, merges, decisions with actor Avatars and deep-link language); and an end panel (340px, re-flowed into the column below 1180px) with a three-channel digest (unread Badges reconciling to 20, last-message previews, a mention marker) and a goals snapshot card of two OKR ProgressBars cited from the okr-tree fixtures. Choose over office-home-launcher when the front door is ONE program team's hub of meetings, docs, and activity, not the suite-wide app-tile launcher with global search and storage; choose over messaging-shell when channels appear as a digest of unread counts and previews, not a live message stream with threads; choose over notes-workspace-home when the surface links out to docs rather than rendering an editable block canvas or page tree; choose over timeline when activity is a grouped, artifact-linking digest inside a hub, not a raw chronological service feed; choose over okr-tree when goals are a two-bar snapshot beside team surfaces, not the full objectives/key-results tree with scoring and check-in history.",
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'ProgressBar',
    'StackItem',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
