import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Form Page',
  description:
    'Account settings page with a centered single-column FormLayout grouped into profile, billing address, and notification Sections, Field descriptions, live email validation via FieldStatus, and a sticky LayoutFooter action bar with Cancel and Save.',
  category: 'Form - Page',
  componentsUsed: [
    'Button',
    'FieldStatus',
    'FormLayout',
    'Layout',
    'Section',
    'Selector',
    'Switch',
    'TextArea',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
