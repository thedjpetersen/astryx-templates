import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Editor Shell',
  description:
    'IDE editor frame: a 260px explorer rail (folder TreeList with git-status dots), an editor tab strip with dirty-dot indicators and close buttons, a token-tinted code viewport with line numbers and a decorative minimap strip, a collapsible problems panel whose error/warning rows jump selection, and a status bar with branch, lint counts, cursor position, and language. Editor chrome surface, distinct from diff viewers and file browsers.',
  category: 'Coding - Editor Shell',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'List',
    'SegmentedControl',
    'TreeList',
  ],
} satisfies AstryxPageTemplate;

export default template;
