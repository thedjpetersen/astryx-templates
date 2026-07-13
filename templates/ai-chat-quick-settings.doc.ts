import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Sandbox Quick Settings',
  description:
    "The assistant's gear-menu quick settings rendered as a focused surface: a slim top bar whose gear anchors an open ~320px Popover column over a dimmed transcript stub. The panel packs Refresh-sandbox and Re-sync-files action rows with tooltip and result captions, a segmented theme icon row, a playful 3-level team-chat verbosity RadioList, Auto-archive and Auto-dismiss NumberInput+Switch rows, a default-model Selector, and a danger zone whose Reset button opens a 2-step AlertDialog-then-Dialog flow with a destroy manifest and a type-RESET-to-confirm gate. Choose it over ai-workspace-settings-modal when you need the fast-path gear popover rather than a full settings dialog with navigation.",
  category: 'AI Chat - Quick Settings',
  componentsUsed: [
    'AlertDialog',
    'Badge',
    'Button',
    'Dialog',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'List',
    'ListItem',
    'NumberInput',
    'Popover',
    'RadioList',
    'RadioListItem',
    'SegmentedControl',
    'SegmentedControlItem',
    'Selector',
    'StackItem',
    'StatusDot',
    'Switch',
    'Text',
    'TextInput',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
