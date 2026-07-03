import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Expense Approvals',
  description:
    "Finance manager's approvals inbox for submitted expense reports: left 360px queue of ListItems each carrying a submitter Avatar, purpose, tabular-numeral total, and policy-flag Badges ('Missing receipt' warning / 'Over limit' error) or a green 'Clean' Token, filtered by Pending/Approved/Rejected header Tabs with count Badges; clean pending rows carry CheckboxInputs (flagged rows keep a disabled checkbox — flags are judged one at a time) plus a 'Select all clean' row, and checking any summons a floating bottom-center bulk Toolbar ('Approve N'); right detail pane with the report header (Avatar, total, status Badge), amber policy-warning Banners quoting the exact rule broken ('Team dinner is $412.80 for 4 attendees — $112.80 over the $75-per-person meal limit'), a line-item breakdown whose right-aligned tabular amounts sum exactly to the total, a horizontally scrolling receipt strip of gradient placeholder tiles (missing receipts render as dashed warning tiles), a MetadataList of report facts, and a pinned Approve / Reject action bar where Reject swaps in an inline composer whose 'Confirm rejection' stays disabled until a comment is entered. Choose over shared-team-inbox when the queue holds structured financial documents awaiting a verdict rather than conversations awaiting replies; choose over spam-quarantine-console when the detail panel explains money — line items, receipts, policy limits — instead of a spam score, and the reject path demands an audit comment; choose over table-index-detail when approve/reject verdicts with policy flags are the point, not generic record browsing.",
  category: 'Finance - Expense Approvals',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'CheckboxInput',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'Stack',
    'StackItem',
    'TabList',
    'Text',
    'TextArea',
    'Timestamp',
    'Token',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
