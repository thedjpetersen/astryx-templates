import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Inline Edit Form',
  description:
    'Workspace settings surface with label-left / value-right rows in display mode; each row carries an Edit affordance that swaps just that row into a TextInput, TextArea, or Selector with inline Save/Cancel, driven by a per-row editing map, plus read-only plan and identifier rows.',
  category: 'Form - Inline Edits',
  componentsUsed: [
    'Badge',
    'Button',
    'Code',
    'Divider',
    'Layout',
    'Section',
    'Selector',
    'TextArea',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
