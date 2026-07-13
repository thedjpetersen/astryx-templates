import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Chat History Search',
  description:
    'Search overlay for chat history: a dimmed agent chat sits behind a dark scrim while a centered 640px panel renders open with a typed query, a remote-merge Spinner, status/role filter pill rows with live counts, and an include-sub-agent-threads checkbox. Results carry role chips, accent-highlighted snippet matches, archive glyphs, and relative times, with a keyboard-active focus ring, arrow/Enter/Escape navigation, a Kbd hint footer, and an empty-state specimen card below. Choose over command-palette-launcher when the surface is dedicated message/session search with facet filters rather than a general command runner.',
  category: 'AI Chat - Session Search',
  componentsUsed: [
    'Avatar',
    'Button',
    'Card',
    'Chat',
    'CheckboxInput',
    'CommandPalette',
    'Divider',
    'EmptyState',
    'IconButton',
    'Kbd',
    'Layout',
    'Overlay',
    'Spinner',
    'StatusDot',
    'TextArea',
    'Timestamp',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
