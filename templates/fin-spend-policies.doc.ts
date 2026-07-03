import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Spend Policy Builder',
  description:
    "Finance-pillar spend-policy administration console for the Kestrel Labs workforce platform: a 280px policy rail (Travel, Meals, Software, Equipment, Team Events) with 30-day violation-count Badges and a pinned org-wide in-policy ProgressBar strip (96.2%, 176 of 183 expenses); the selected Travel policy detail opens with an effectiveness stat strip — 94.0% in-policy rate with a +2.1 pt trend delta and a labeled weekly mini bar chart, violation count, average approval time, and spend under policy — above a per-category limits Table (domestic flights $450 / international $1,400 per flight, hotel $275/night with a city-tier uplift note, travel meals $75/day, right-aligned tabular limits), an approval-chain builder rendered as connected tier rows on a node-and-spine rail (under $500 auto-approve → manager approval → over $5,000 Finance review with named-approver Avatars, SLA Tokens, and working add/remove-tier MoreMenu actions), and a receipt-requirement rule (itemized receipts over $25, working Switch); a 340px end panel carries the 30-day violation feed — each row an employee Avatar, over-limit amount in red tabular numerals, and justification-status Token (pending / justified / escalated) with working approve-and-escalate actions — above a recent-policy-changes audit list, and every count reconciles: rail chips equal feed rows equal each policy's expenses-minus-in-policy delta. Choose over expense-approval-queue when the job is administering the rules themselves — category limits, approval tiers, receipt thresholds — rather than triaging submitted expense reports; choose over automation-rule-builder when the tiers are monetary approval thresholds routed to people, not condition-action automation logic; choose over budget-tracker when the money is corporate policy control, not personal budgeting.",
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
    'List',
    'MoreMenu',
    'ProgressBar',
    'Selector',
    'StackItem',
    'Switch',
    'Table',
    'Text',
    'Timestamp',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
