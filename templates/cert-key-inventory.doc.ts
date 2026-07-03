import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Certificate & Key Inventory',
  description:
    'TLS lifecycle console: pressable summary tiles for healthy / expiring-soon / expired counts that double as status filters, a controls row pairing a Table/Timeline view SegmentedControl with toggleable CA, status, and team filter chips (live counts, clear-filters affordance) that apply identically to both views, a sortable certificate table (expiry countdown Badges, issuer, covered domains, key algorithm, deployment counts), and an alternate horizontal expiry timeline — lanes by team, CSS validity bars on a shared px-per-day four-year axis with a dashed Jul 1 status-date line. Selecting a row or bar opens a 340px detail drawer rendering the chain (root > intermediate > leaf), fingerprint copy feedback, SAN list, and deployments, with a single-pane fallback below 960px. A three-step rotate wizard Dialog (choose CA with per-CA validity, key size, before/after confirm) re-issues the cert and updates its expiry, countdown badge, timeline bar, chain, and the summary tiles in one pass, with a one-level undo. Choose over settings-secrets-env when the subject is certificate lifecycle across a fleet, and over roadmap-gantt when bars are validity windows, not planned work.',
  category: 'Operations - Certificate & Key Inventory',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Code',
    'Dialog',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'SegmentedControl',
    'Text',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
