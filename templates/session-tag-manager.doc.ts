import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Session Tag Manager',
  description:
    'Two-pane tool for organizing AI assistant sessions with tags: left pane has a scope Selector (Personal / workspaces) over a tag list with color dots, session counts, Wand marks on auto-tagged tags, inline rename, and delete-with-confirm, plus a pinned Uncategorized catch-all; right pane is the selected tag\'s auto-tagging rule editor — AND-matched condition rows (type Selector + value TextInput), a "Matches 7 of last 50 sessions" line, and a preview list of matching sessions. Choose over ai-chat-session-sidebar when the story is managing the tag taxonomy and its routing rules, not navigating sessions.',
  category: 'AI Chat - Session Organization',
  componentsUsed: [
    'AlertDialog',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'Selector',
    'StatusDot',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
