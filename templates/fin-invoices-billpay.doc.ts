import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Bill Pay & Invoice Inbox',
  description:
    'Accounts-payable console for vendor bill pay: an invoice inbox Table (vendor monogram + memo, invoice #, right-aligned amount, due date with overdue/due-soon aging color, Captured / Needs review / Scheduled / Paid status pills) filtered by a status SegmentedControl and vendor search; a cash-out forecast strip of four labeled week bars whose scheduled-vs-projected totals reconcile with the table; and a 380px review panel for the active invoice with an OCR-extract section (email-attachment thumbnail beside extracted fields, low-confidence fields amber-highlighted with working Confirm actions), a three-way-match indicator (PO + receipt + invoice tiles with a flagged freight variance and approve-variance action), a payment-scheduling section (early-pay-discount optimizer note, ACH/wire/check method control, gated Approve & schedule that advances the invoice), an approval-chain status list, and GL coding metadata. Choose over expense-approval-queue when the money is vendor invoices flowing through AP capture, matching, and payment scheduling — not employee expense reports awaiting approval.',
  category: 'Workforce Finance',
  componentsUsed: [
    'Avatar',
    'Button',
    'Divider',
    'DropdownMenu',
    'EmptyState',
    'Icon',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'Table',
    'TextInput',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
