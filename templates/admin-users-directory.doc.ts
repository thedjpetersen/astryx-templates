import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'User Admin Directory',
  description:
    'Admin users table for an AI agent platform: a full-height Layout page headed by "Users" with a platform stats caption (totals, daily/weekly actives, session count) and a live search TextInput that filters rows by email, userId, or role. The dense Table covers email with a shield icon on admins and a mono userId subline, role, created date, tabular session counts, last-active labels with a dimmed "Never" state, sandbox counts, removable group Tokens with an inline "Add group…" Selector that appears on the clicked row, and a wrapping strip of tiny integration Badges; a row-count footer and an EmptyState for missed searches round out the page. Compact widths (measured via ResizeObserver, not media queries) drop the Created and Sandboxes columns. Choose it over agent-device-registry when the unit of administration is user accounts — roles, groups, and integrations — rather than paired devices or nodes.',
  category: 'AI Chat - Admin',
  componentsUsed: [
    'Badge',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'Selector',
    'StackItem',
    'Table',
    'Text',
    'TextInput',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
