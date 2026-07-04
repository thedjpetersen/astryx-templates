// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Matter Workspace',
  description:
    "Legal matter home for Casewright at Marlow & Voss LLP — matter M-2417 'Kestrel Labs — Series C Financing' as the deal team opens it on Wed Jul 15, 2026: a pinned privilege strip ('Attorney-Client Privileged · Attorney Work Product'), a matter header with mono matter number, client chip, responsible-partner chip (Eleanor Marlow), active StatusDot, and confidentiality-tier Token; a key-dates strip of five countdown chips (board approval Jul 18, disclosure schedules Jul 20 as the one urgent red at-risk chip, SPA signing target Jul 24, Del. SoS charter filing Jul 30, first close Jul 31); a four-item workstream checklist with status Tokens, owner AvatarGroups, and a doc link on the in-progress SPA draft; a six-row documents grid with per-doc status Tokens (Draft / With counterparty / Out for signature / Executed), clickable AI-summary chips that expand a purple-washed Casewright summary with citation chips, verification Token, and the 'AI-generated · verify before relying' disclosure line, plus turn/version counts and a signature-status strip whose chips link OUT to the tracker; a Casewright activity digest whose AI rows carry disclosure, citation chips, honest confidence bands, and verified/unverified/flagged verification states (the retracted Renwick research citation and the Skylark MSA § 9.2 liability-cap flag both appear, plus Ruth Vega's cleared Meridian conflicts search) with a Mark-verified action; and a sticky 320px end panel with the firm + client matter team and a time & billing snapshot (hours-by-person bars totaling 97.6 h, 62% budget meter). Choose over table-index-detail when the surface is ONE matter's hub under privilege — dockets, key-date countdowns, AI provenance, and billing — not generic master-table record browsing; choose over team-hub-home when the hub serves a CLIENT MATTER with privilege banners, signature status, and verification states, not an internal program team's meetings and check-ins; choose over office-universal-search when everything shown belongs to one matter with no query, facets, or cross-app result groups; choose over esignature-envelope-flow when signatures appear only as status chips that link out, never a recipient-routing wizard or field-placement paper.",
  category: 'Legal AI',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'Link',
    'ProgressBar',
    'StackItem',
    'StatusDot',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
