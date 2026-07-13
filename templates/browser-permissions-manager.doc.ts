import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Browser Permissions Manager',
  description:
    'Settings page governing which pages and actions an agent may drive in the browser: an intro Card explains local regex checks, a green-tinted "Suggested from history" panel previews allow/block additions that Apply moves into the rule columns, and three Cards (Allowed pages / Blocked pages / Actions) hold mono pattern rows with count Badges, a required rule, remove buttons, a dashed empty state, and add rows with invalid-regex inline errors. Choose over extension-connection-popup when configuring the browser-control rule set rather than the extension chrome itself.',
  category: 'AI Chat - Browser Permissions',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Grid',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'Text',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
