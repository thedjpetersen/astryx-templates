import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Payroll Tax Filings Tracker',
  description:
    'Payroll-tax compliance console for a workforce platform (Kestrel Labs, 140 people; 126 US, 14 Lisbon): a quarter SegmentedControl (Q4 2025 / Q1 2026 / Q2 2026), reconciling summary tiles (quarter liability $1,091,706.00, filings progress, next-deposit countdown, open notices), a filings Table (Form 941, CA DE-9/DE-9C, Portugal DMR, W-2 and 1099-NEC prep) with jurisdiction chips, period, due date, right-aligned amounts, and Filed / Scheduled / Action-needed status pills — the blocked DE-9 renders as a red-tinted action row; an agency-notice inbox (IRS CP 136 informational + a CA EDD discrepancy with $1,842.00 at issue, a respond-by date, and an assigned owner); a deposit schedule with federal semi-weekly EFTPS rows, a next-deposit countdown chip, and a settled row carrying its acknowledgment number; a 340px filing-detail end panel showing the filed 941’s form-line summary (L3 + L5e = L12 = L13, balance due $0.00) and confirmation number; and a penalties-avoided stat chip in the header. Choose over fin-payroll-run when the job is statutory tax compliance — filings, agency notices, and deposit deadlines — rather than reviewing and submitting a pay run; choose over scheduled-jobs-manager when rows are statutory tax deadlines with monetary amounts and confirmation numbers, not cron jobs.',
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
    'Table',
    'Text',
    'Timestamp',
    'Toast',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
