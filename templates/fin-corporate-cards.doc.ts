import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Corporate Card Program',
  description:
    "Finance admin console for a company corporate-card program (Kestrel Labs, 140 people): an app-shell frame with a program rail of KPI blocks (42 active cards, $84,210 month-to-date, 7 pending receipts, 3 frozen) above a spend-by-category conic-gradient donut with an amount+percent legend; a sortable card Table whose rows carry a holder Avatar with role, a scheme-locked dark last-4 mini-card chip (indigo variant for virtual cards), a monthly-limit ProgressBar usage meter with '$spent of $limit' captions, right-aligned MTD spend, an amber missing-receipts count, and Active/Frozen/Pending Tokens, filtered by a status SegmentedControl plus a clickable physical/virtual split chip row (28 + 14 = 42); and an end selected-card panel with card-art (frozen scrim overlay), a freeze affordance confirmed through an AlertDialog (unfreeze is direct), a per-transaction limit Selector, merchant-category allowed/blocked toggle chips, and a July transaction ledger whose rows show receipt-attached green checkmarks or amber missing-receipt rows and whose total restates the card's MTD spend to the cent. Choose over expense-approval-queue when the job is administering the card program itself — limits, merchant controls, freezes, live spend — rather than approving submitted expense reports; choose over budget-tracker when the money is corporate card spend governed by per-card limits, not personal budgeting categories.",
  category: 'Workforce Finance',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Button',
    'Divider',
    'DropdownMenu',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'List',
    'MetadataList',
    'ProgressBar',
    'SegmentedControl',
    'Selector',
    'StackItem',
    'Table',
    'Text',
    'TextInput',
    'Timestamp',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
