import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Devices & Nodes',
  description:
    'Personal device-management settings page in a single centered column: a PAIRED CLIENTS section with CLI / Glasses / Voice rows, TTL captions (one expiring in warning tone), and Revoke buttons gated by a confirm AlertDialog; an ACTIVE NODES section with mono node names, online/provisioned StatusDots, an amber session-lock glyph with Tooltip, and a warning lock Banner with a Clear action; and a CONNECT section with a copyable install-command CodeBlock, a waiting Spinner row, and a green just-connected specimen. Choose over agent-events-dashboard when the story is pairing and node fleet management, not event traffic.',
  category: 'AI Chat - Devices',
  componentsUsed: [
    'AlertDialog',
    'Banner',
    'Button',
    'Card',
    'CodeBlock',
    'Divider',
    'Layout',
    'Spinner',
    'StatusDot',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
