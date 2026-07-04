import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Due Diligence Data Room Review',
  description:
    'Legal-AI diligence surface (Casewright at Marlow & Voss LLP, matter M-2417 Kestrel Labs Series C): a WIDE app-shell data-room review with a matter header carrying the privilege strip, a 218-of-340-docs review meter, and a 3-reviewer facepile; a 260px folder-tree rail (Corporate, IP, Contracts, Employment, Litigation) with per-folder SVG progress rings and a pinned coverage strip whose counts reconcile to 340; a document Table (type glyph + DR index number, type Token, reviewer Avatar, Reviewed/Flagged/In review/Unopened status Tokens, sparkle AI-summary chip, issue-tag Tokens); and a 380px Casewright findings panel grouping AI issue Cards by severity (2 high — the missing Kraus IP assignment and the Skylark Cloud MSA change-of-control clause, quoted in serif on the expanded card with an add-to-report affordance — plus 3 medium), every finding citing source documents via jump chips, carrying honest confidence bands, explicit human verification states, the shared AI-disclosure line, and a confirm-gated Dismiss, above a diligence-report progress card (4 of 7 sections drafted). Choose over office-shared-drive when the folder tree indexes a legal diligence request list under privilege with review-status semantics, not a document drive about ownership, sharing, and storage; choose over table-index-detail when the end panel holds AI findings with citations and verification rather than a generic record detail pane; choose over contract-ai-review when the unit of work is a 340-document room with per-folder coverage, not one contract on a paper canvas with clause-anchored highlights; choose over legal-matter-workspace when the surface is the diligence review itself — folders, reviewer assignments, findings-to-report flow — not the matter hub of key dates, dockets, and signature status; choose over expense-approval-queue when reviewers triage privileged documents and AI findings rather than issuing finance verdicts on expense reports.',
  category: 'Legal AI',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'AvatarGroup',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'ProgressBar',
    'Selector',
    'StackItem',
    'Table',
    'Text',
    'TextInput',
    'Token',
    'TreeList',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
