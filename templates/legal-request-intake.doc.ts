// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Legal Request Intake & Triage',
  description:
    "Casewright Legal Ops intake queue for Kestrel Labs' in-house legal team on Wed Jul 15, 2026 — a list+detail app shell under a persistent attorney-client-privilege strip: a self-serve-deflection stat strip on top (38% deflected QTD with labeled month mini-bars and +5-pt trend, 1.6d median cycle time, 8 open requests with '1 breached · 2 at risk', 92% SLA on-target), a 360px request list of eight business-team requests (NDA reviews, vendor contracts, marketing claim reviews, an employment question) as dense List rows with requester Avatars, type + urgency Tokens, and tabular SLA countdowns — one breached red (Fernbrook order form, 16h over) and two at-risk amber; and the selected request's Casewright triage panel — an AI-purple-washed section with the 'AI-generated · verify before relying' disclosure line, a classification chip ('NDA · Low complexity · 0.94', the raw number explicitly captioned as a classifier score, never legal confidence) beside a first-class verification chip with a Mark-verified action, two route tiles (recommended self-serve template vs assign-to-counsel, each with plain-language rationale, honest confidence band, playbook citation chips, and one-click actions — self-serve send and outside-counsel routing to the M-2431 Skylark matter at Marlow & Voss are AlertDialog confirm-gated, stating the consequence), auto-extracted key terms from the uploaded doc (party, term, governing law with confidence StatusDots, amber off-playbook deviations, and per-term source-citation chips), and three similar past requests with outcome Tokens and cycle times — over a pinned assignment footer (assignee, priority, due-date Selectors plus Assign, prefilled by the route tiles). Choose over expense-approval-queue when the queue judges legal work requests against playbooks and SLAs — deflect, assign, or escalate — not expense reports with line items, receipts, and money math; choose over it-access-requests when triage verdicts are AI-suggested legal routing with human verification states, not identity-policy access grants with SoD checks and approval-chain steppers; choose over table-split-pane when the detail pane is an AI triage panel with trust chrome (disclosure, citations, confidence bands) and an assignment footer, not a conversation thread with a reply composer; choose over table-index-detail when legal semantics — privilege, SLA breaches, deflection, verification — are the point, not generic record browsing; choose over matter-workspace when the surface is the pre-matter intake funnel for many small requests, not one engaged matter's hub of dockets, key dates, and signature status.",
  category: 'Legal AI',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Button',
    'Divider',
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
    'SegmentedControl',
    'Selector',
    'StatusDot',
    'Text',
    'TextInput',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
