import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Design Collaboration Dashboard',
  description:
    'Design-tool workspace home (Framehouse, the Northbeam Studio team): a 240px project rail with a Projects/Drafts SegmentedControl, per-project file counts, and a pinned editor-seats strip; a content region with a global search, a horizontally scrolling recents row, and per-project sections of file cards — deterministic canvas-gradient thumbnail art with faux artboard frames, live-collaborator facepiles with colored presence rings, edited-ago meta, and a branching indicator (2 branches + review-requested chip) on one file; and a 300px right rail with an activity feed (comments, branch merges, review requests, library publishes with avatars) plus a shared-libraries panel with component counts and an update-available badge. Choose over file-browser-preview when the surface is a multiplayer design workspace about file cards, presence, and branching — not a code/workspace tree with syntax-highlighted previews. Choose over office-shared-drive when the story is design collaboration (canvas thumbnails, live facepiles, branch review, shared libraries) rather than a document drive about ownership, sharing, and storage quota.',
  category: 'Startup Showcase',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Button',
    'Divider',
    'DropdownMenu',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MoreMenu',
    'ProgressBar',
    'SegmentedControl',
    'Selector',
    'StackItem',
    'Text',
    'TextInput',
    'TreeList',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
