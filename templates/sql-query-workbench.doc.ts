import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'SQL Query Workbench',
  description:
    'Database IDE surface: a sidebar with a connection picker and an expandable schema tree (tables and typed columns) above a saved-queries rail, tabbed SQL editors over a dark textarea, and a result grid with sortable headers, a per-column filter row, and a status bar — Run swaps in the canned fixture result behind an animated elapsed-time readout, saving prompts for a name, saved queries open in new tabs, and schema columns insert at the editor cursor.',
  category: 'Data - SQL Query Workbench',
  componentsUsed: [
    'Badge',
    'Button',
    'Dialog',
    'Divider',
    'EmptyState',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'SegmentedControl',
    'Selector',
    'Table',
    'TextInput',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
