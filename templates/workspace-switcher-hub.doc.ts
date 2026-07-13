import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Workspace Switcher',
  description:
    'Workspace management hub for an AI assistant: a left switcher rail with Personal on top, four icon-tiled ' +
    'workspaces with mono hashtags, member counts, an amber default-star toggle, reorder/archive kebabs, and an ' +
    'Archived section with restore buttons. The right panel swaps between a create-workspace form with live ' +
    '"/ws #hashtag" preview and collision warning, a routing-mode RadioList guarded by a confirm AlertDialog, and a ' +
    '"Move session to…" menu whose Suggested slot resolves from a spinner to the classifier pick. Choose it over ' +
    'ai-chat-workspace-landing when the surface is about administering the workspace roster rather than starting a chat.',
  category: 'AI Chat - Workspace Switcher',
  componentsUsed: [
    'AlertDialog',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'Item',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'MoreMenu',
    'RadioList',
    'SegmentedControl',
    'Spinner',
    'StackItem',
    'Text',
    'TextArea',
    'TextInput',
    'ToggleButton',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
