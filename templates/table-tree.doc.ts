import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Tree / Hierarchical Table',
  description:
    'Team drive file browser with an expandable hierarchical Table: depth-indented Name column with chevron toggles per folder, Type/Owner/Size/Updated columns, tree-aware search that prunes and force-expands matching branches, and expand/collapse-all controls in a frame-first header.',
  category: 'Table - Tree/Hierarchical List',
  componentsUsed: [
    'Avatar',
    'Button',
    'EmptyState',
    'IconButton',
    'Layout',
    'Table',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
