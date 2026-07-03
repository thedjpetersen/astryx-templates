import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Access Request Approvals',
  description:
    "IT admin's approval queue for app/access requests on a workforce platform: an app-shell page whose sortable multi-select Table lists each request as app glyph + role/scope with request ID, requester Avatar with dept · office, an italic business-justification excerpt, a policy-check Token pill (green Auto-approvable / amber Needs review / red Violates policy), a compact Mgr ✓ → IT chain cell, and a right-aligned age column that turns amber with an 'SLA breach' caption past the 3-day target; only policy-clean rows carry checkboxes, so select-all plus the bulk Toolbar ('Approve N') can never sweep up flagged requests; clicking a row expands it into a 340px end LayoutPanel — the request card — with the approval-chain stepper (Requested → Manager approved with timestamp → IT review pending → Provisioning via identity workflow, plus a Security sign-off step for prod IAM roles), the full justification quote, per-rule policy checks with pass/warn/fail glyphs, a MetadataList of request facts, and pinned Approve/Deny actions; one finance-system request carries a separation-of-duties error Banner (requester already holds AP Invoice Entry, so AP Payment Approver would violate SOD-FIN-02) that disables Approve until resolved or denied; and a decisions-audit LayoutFooter strip of horizontally scrolling verdict chips (who approved/denied/auto-approved what, when) that grows as in-session verdicts land. Choose over expense-approval-queue when the rows are app/role access grants judged against identity policy — group rules, seat pools, SoD conflicts, approval chains — rather than expense reports with line items and receipts; choose over table-bulk-actions when bulk selection must be policy-gated and every verdict feeds an audit trail.",
  category: 'Workforce IT',
  componentsUsed: [
    'Avatar',
    'Banner',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'Selector',
    'StackItem',
    'Table',
    'Text',
    'TextInput',
    'Timestamp',
    'Token',
    'Toolbar',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
