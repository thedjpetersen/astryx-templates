import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Session Sidebar Shell',
  description:
    'Full AI-chat app shell where the pinned 288px session sidebar is the star: search plus a filter reveal with segmented pill rows, uppercase eyebrow sections (personal, two workspaces, shared, collapsible archived) with default-workspace star and current-context marks, tag-grouped rows with counts and a "3 more…" expander, status dots with a pulsing processing state, pin/fork glyphs, nested sub-agent children, hover-reveal kebabs, a counts footer, and a collapse-to-icon-rail toggle. The right pane is a modest transcript and composer that follows the selection. Choose over ai-chat-tool-stream when the story is organizing and finding sessions, not how one agent run executed.',
  category: 'AI Chat - Session Sidebar',
  componentsUsed: [
    'Avatar',
    'Button',
    'Chat',
    'Divider',
    'IconButton',
    'Layout',
    'MoreMenu',
    'SegmentedControl',
    'Spinner',
    'StatusDot',
    'TextArea',
    'TextInput',
    'Timestamp',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
