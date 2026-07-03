import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Employee Pay Statement',
  description:
    'Employee pay-statement detail for one payroll check: a net-pay hero figure with a gross-to-net equation strip and a two-account direct-deposit split (checking 80% / savings 20%), four sectioned statement Tables with Current and YTD columns — earnings (base, spot bonus, RSU vest with share count and FMV), pre-tax deductions (401(k) with an informational employer-match row, medical/dental/vision, HSA), taxes (federal, CA state, Social Security with a YTD wage-base cap progress meter, Medicare, CA SDI) and post-tax ESPP — a USD / % of gross SegmentedControl view toggle, and a 360px employer-cost sidebar (employer taxes + benefits contributions) capped by a total-compensation callout and statement-facts MetadataList; PDF download and copy actions confirm via Toast. Choose over payout-statements when the money is an employee’s gross-to-net paycheck with deductions, taxes and employer costs, not a marketplace seller’s payout settlements; choose over budget-tracker for any corporate payroll surface — this is employer-issued compensation, not personal budgeting.',
  category: 'Workforce Finance',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'Icon',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'Table',
    'Text',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
