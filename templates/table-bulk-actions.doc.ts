import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Table with Bulk Actions',
  description:
    'Support inbox with a full-bleed data table, checkbox selection column with header select-all, and a sticky Toolbar action bar that appears on selection with count, Archive, Assign menu, and destructive Delete.',
  category: 'Table - Bulk Actions',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'DropdownMenu',
    'EmptyState',
    'Layout',
    'SegmentedControl',
    'StatusDot',
    'Table',
    'Toolbar',
  ],
} satisfies AstryxPageTemplate;

export default template;
