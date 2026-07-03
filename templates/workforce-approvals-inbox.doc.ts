import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Unified Approvals Inbox',
  description:
    "Cross-domain approvals inbox for a workforce-platform manager: a list+detail page whose left queue panel groups nine pending items by type — PTO requests (3), expense reports (2), access requests (2), comp adjustment (1), offer approval (1) — as compact ListItems with tinted type glyphs, requester lines, and SLA-countdown Token chips (gray on-track / amber hours-left / red overdue), pinned above a keyboard-hint strip of Kbd keys (j/k navigate, a approve, r reject — live shortcuts, suppressed while typing); the selected item renders as a rich detail pane whose body is type-specific: PTO shows a calendar-impact strip of day cells with team-coverage meters (8-person Platform team, amber dip days where an already-approved absence overlaps) plus balance math, expenses show a reconciling line-item table with right-aligned tabular totals, a receipt-thumbnail strip (missing receipts as dashed warning tiles), and policy checks, access requests show the approval-chain stepper and policy gates with a justification quote, and comp/offer show a comp-vs-band meter (band-min/max track, midpoint tick, current + proposed markers); Approve is one click or keystroke while Reject swaps in a required-comment composer whose 'Confirm rejection' stays disabled until a reason is typed; an info Banner marks the delegation window ('covering approvals for Priya Raman until Jul 20' — 4 of 9 items arrive via it and carry a 'For Priya' chip), and a decided-today tally LayoutFooter (total / approved / rejected Tokens plus an SLA readout) grows as in-session verdicts land. Choose over expense-approval-queue when the manager needs one mixed queue across PTO, expenses, access, comp, and offers with per-type verdict cards rather than a finance-only deep dive into line-item and receipt auditing; choose over it-access-requests when access grants are just one lane of a manager's cross-domain inbox rather than an IT admin's policy-gated bulk table with provisioning audit chips; choose over time-off-planner when PTO appears verdict-side with team-coverage impact, not as an employee request composer.",
  category: 'Workforce Platform',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'List',
    'MetadataList',
    'SegmentedControl',
    'StackItem',
    'Text',
    'TextArea',
    'Timestamp',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
