import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Agent Events Dashboard',
  description:
    'Server-events dashboard for an agent workspace with a glassy centered floating pill navbar (Chat / Events / Status icon buttons, accent ring on the active surface). Four stat blocks with 2xl tabular numbers, left-border dividers, and tone-coded Badges sit above a subscriptions Table (mono event pattern, channel Badge, target session, enabled Switch, last-dispatch time, StatusDot) and a 12-row dispatch history where failed rows expand via Collapsible into an error CodeBlock; a dashed-border empty-state specimen closes the page. Choose over sub-agent-monitor when the story is event routing and delivery health, not agent execution.',
  category: 'AI Chat - Events & Automation',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CodeBlock',
    'Collapsible',
    'Divider',
    'EmptyState',
    'Grid',
    'Icon',
    'IconButton',
    'Layout',
    'StatusDot',
    'Switch',
    'Table',
    'Text',
    'Timestamp',
  ],
} satisfies AstryxPageTemplate;

export default template;
