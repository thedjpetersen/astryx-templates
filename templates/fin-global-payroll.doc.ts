import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Global Payroll & Entities',
  description:
    'Multi-entity global payroll console for a workforce platform (Kestrel Labs, 140 people): selectable entity cards (Kestrel Labs, Inc. US — 118 employees; Kestrel Portugal, Lda. — 16; EOR remote contractors — 6) with next-payday chips and local-currency payroll totals that reconcile to a $612,480.00 USD-equivalent July cycle, a filing-deadline calendar strip (Form 941 quarterly, W-2/W-3 annual, Portugal Segurança Social monthly) with days-left chips and one urgent red filing carrying a working start-prep action, a per-entity compliance register Table (registrations, tax accounts, insurance — one pending Colorado registration amber with a check-status action) filtered by entity-card selection or a SegmentedControl, a 340px end panel with an FX exposure card (H2 2026 EUR payroll split 60% hedged via two forwards / 40% unhedged at spot) and an Ireland country-expansion request note with a review timeline. Choose over fin-payroll-run when the job is standing multi-entity oversight — filings, registrations, FX, expansion — rather than reviewing and submitting one pay run; choose over scheduled-jobs-manager when the calendar items are statutory filing deadlines with monetary remittances, not cron jobs; choose over budget-tracker when the money is corporate cross-border payroll, not personal budgeting.',
  category: 'Workforce Finance',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'StackItem',
    'StatusDot',
    'Table',
    'Text',
    'Toast',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
