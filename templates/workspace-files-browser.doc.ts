import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Workspace Files Browser',
  description:
    'Dialog-style file browser opened over a dimmed AI chat: a large Dialog with a left rail (Personal / ' +
    'Atlas team scope TabList, file search, TreeList of folders with size and relative-date metadata) and a ' +
    'right viewer pane with path Breadcrumbs, a Rendered/Source SegmentedControl, Markdown or CodeBlock ' +
    'content, a version-history Popover with Restore actions, and a Share button with copied feedback. ' +
    'Choose it over sibling chat templates when the surface is the assistant’s editable workspace files ' +
    'rather than the conversation itself.',
  category: 'AI Chat - Workspace Files',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'BreadcrumbItem',
    'Breadcrumbs',
    'Button',
    'ChatLayout',
    'ChatMessage',
    'ChatMessageBubble',
    'ChatMessageList',
    'ChatSystemMessage',
    'CodeBlock',
    'Dialog',
    'DialogHeader',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'Markdown',
    'Popover',
    'SegmentedControl',
    'SegmentedControlItem',
    'StackItem',
    'StatusDot',
    'Tab',
    'TabList',
    'Text',
    'TextArea',
    'TextInput',
    'TreeList',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
