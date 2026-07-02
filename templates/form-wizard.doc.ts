import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Form Wizard',
  description:
    'Multi-step workspace-setup wizard: numbered step indicator with done/current/upcoming states, one step visible at a time in a centered Card, Back/Next footer with per-step validation, and a final Review step summarizing answers in a MetadataList.',
  category: 'Form - Wizard',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CheckboxList',
    'Divider',
    'FormLayout',
    'Layout',
    'MetadataList',
    'RadioList',
    'Selector',
    'Switch',
    'TextArea',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
