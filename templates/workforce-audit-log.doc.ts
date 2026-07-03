import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Admin Audit Log',
  description:
    'Compliance-grade admin action trail for a Rippling-style workforce platform (Kestrel Labs, 140 employees): a filter bar (actor, action type, target system, date-range chips, free-text search); an expandable event table with UTC timestamps, actor avatar + role, severity color-coded action verb chips, targets with system icons, source IP + location, and per-row hash-chain integrity marks; an expanded comp-change row rendering a before/after JSON-ish diff whose comp amounts are masked behind a reveal-permission note; a suspicious-activity banner (3 failed admin sign-ins) that pivots the filters; CSV/JSON/SIEM export controls with a live stream status; and a pinned 7-year retention-policy footer. Choose over logs-explorer when the surface is an entity-anchored, tamper-evident record of who changed what across HR/IT/Finance systems — not a query-driven developer log stream console.',
  category: 'Workforce Platform',
  componentsUsed: [
    'Avatar',
    'Banner',
    'Button',
    'ButtonGroup',
    'Divider',
    'DropdownMenu',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'Selector',
    'StackItem',
    'StatusDot',
    'Table',
    'Text',
    'TextInput',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
