import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Side Sheet Form',
  description:
    'Commerce discounts admin: a searchable data Table with a slide-in editor sheet docked to the right edge (LayoutPanel in the Layout end slot, open by default) for creating or editing a record without leaving the list — sheet header with close IconButton, scrollable FormLayout body (TextInput, Selector, NumberInput, DateInput, RadioList, Switch, TextArea), and pinned Cancel/Save footer actions.',
  category: 'Form - Side Sheet',
  componentsUsed: [
    'Badge',
    'Button',
    'DateInput',
    'Divider',
    'EmptyState',
    'FormLayout',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'NumberInput',
    'RadioList',
    'Selector',
    'Switch',
    'Table',
    'TextArea',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
