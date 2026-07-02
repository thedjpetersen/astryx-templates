import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Modal Overlay Form',
  description:
    'Create-project form in a centered Dialog (open by default) over a dimmed agency projects workspace — searchable, filterable project Table behind; TextInput, Selector, Field, and TextArea fields with Cancel/Create footer actions that add a row at the top of the list.',
  category: 'Form - Modal Overlay',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Dialog',
    'EmptyState',
    'Field',
    'Layout',
    'SegmentedControl',
    'Selector',
    'Table',
    'TextArea',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
