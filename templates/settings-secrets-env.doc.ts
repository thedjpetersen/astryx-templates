import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Secrets & Environment Settings',
  description:
    'Narrow-focus settings page for a deployment workspace: a centered ~720px column of Collapsible Sections with count Badges for environment variables, webhooks, and connected repositories. Demonstrates masked-reveal secrets with copy feedback Tooltips, an inline add form with duplicate-key validation, webhook Switches with an autosave Saving…/Saved lifecycle and last-delivery StatusDot + Timestamp, lazy-loaded section Skeletons, and two-step destructive confirms (AlertDialog delete, typed-confirmation Dialog disconnect).',
  category: 'Settings - Secrets & Environment',
  componentsUsed: [
    'AlertDialog',
    'Badge',
    'Button',
    'Code',
    'Collapsible',
    'Dialog',
    'FieldStatus',
    'IconButton',
    'Layout',
    'Section',
    'Skeleton',
    'Spinner',
    'StatusDot',
    'Switch',
    'TextInput',
    'Timestamp',
    'ToggleButton',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
