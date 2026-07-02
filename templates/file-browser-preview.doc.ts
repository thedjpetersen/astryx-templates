import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'File Browser with Preview',
  description:
    'Two-pane workspace file browser: scope tabs, a 300px TreeList navigation panel with search and fuzzy-match highlighting, a rich file preview with Breadcrumbs, Code/Rendered/History view modes, a syntax-highlighted CodeBlock, and a version-history drawer with restore actions. Tree+viewer surface, distinct from table-based split panes.',
  category: 'Tools - File Browser',
  componentsUsed: [
    'Badge',
    'Breadcrumbs',
    'Button',
    'CodeBlock',
    'EmptyState',
    'IconButton',
    'Layout',
    'List',
    'Markdown',
    'SegmentedControl',
    'Skeleton',
    'TabList',
    'TextInput',
    'Timestamp',
    'TreeList',
  ],
} satisfies AstryxPageTemplate;

export default template;
