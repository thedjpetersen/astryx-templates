import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Shared Drive Manager',
  description:
    'Productivity-suite drive surface (Kestrel Labs "Atlas Q3" workspace): a 260px folder-tree rail with My Drive, shared drives carrying per-drive membership chips, Starred and Trash scopes, and a pinned storage-quota strip; a sortable multi-select file table (app-icon name cell, owner avatar, shared-with facepile, last modified, right-aligned size with a seeded mid-upload row) with a bulk star/move/trash action bar; a 320px details panel with a Details/Activity toggle covering sharing summary, metadata, storage attribution, and an activity feed; and a header New/upload split button. Choose over file-browser-preview when the surface is a document drive about ownership, sharing, and storage — not a code/workspace tree with syntax-highlighted previews.',
  category: 'Office - Drive',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Breadcrumbs',
    'Button',
    'ButtonGroup',
    'Divider',
    'DropdownMenu',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'ProgressBar',
    'SegmentedControl',
    'Selector',
    'StackItem',
    'Table',
    'Text',
    'TextInput',
    'Timestamp',
    'Token',
    'Toolbar',
    'TreeList',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
