import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Transactions Ledger',
  description:
    'Bank-account register with Pending and Posted groups in one running-balance table: rows carry date, merchant with a category Token, signed amounts, and reconcile checkboxes that feed a sticky reconciliation summary Toolbar (progress, cleared vs statement balance, difference Badge); search plus category/month Selector filters live in the header, and clicking a row opens a detail panel with merchant info, a category editor, a receipt placeholder, and notes.',
  category: 'Finance - Transactions Ledger',
  componentsUsed: [
    'Badge',
    'Button',
    'CheckboxInput',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'MetadataList',
    'ProgressBar',
    'Selector',
    'Table',
    'TextArea',
    'TextInput',
    'Timestamp',
    'Token',
    'Toolbar',
  ],
} satisfies AstryxPageTemplate;

export default template;
