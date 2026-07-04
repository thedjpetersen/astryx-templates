import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'AI Drafting Sidebar',
  description:
    "Casewright drafting-assistant panel specimens for Marlow & Voss LLP, shown as three frozen states on a soft AI-purple-tinted stage, each under a mono caption row and each pairing the 340px sidebar Card with a dimmed light-locked serif excerpt of the Skylark Cloud MSA's § 9 Limitation of Liability (matter M-2431 for Kestrel Labs): specimen 01 (suggestion) is the 'Tighten the indemnification carve-out' card — proposed language rendered as tracked-change serif text (red strike of the v4 clause (c), green insert of the playbook fallback with its 2× super-cap), a rationale note citing Ruth Vega's Limitation of Liability playbook Fallback 1 and its 34-of-50 deviation record, clause / source-page / playbook citation chips, an honest 'High confidence' band, Insert / Edit / Dismiss actions, and the 'AI-generated · verify before relying' disclosure footer; specimen 02 (inserted) shows the success chip 'Inserted at § 9.2' with an Undo affordance, the clause now clean on the paper with an insert receipt (D. Chen · Jul 15, 2026 · 2:42 PM PT), and a first-class amber 'Unverified · pending attorney review' row with a request-verification action; specimen 03 (redline-conflict) shows the amber warning 'Conflicts with a pending counterparty change in this section' — Skylark's Jul 11 v4 carve-out rendered as an amber pending span on the paper — with a view-conflict button, a hold-suggestion note, and the card held with Insert disabled. Choose over meeting-notes-ai-card when the specimen is the in-document clause-drafting unit under legal trust patterns (tracked changes, playbook citations, verification states), not a post-meeting recap card; choose over legal-ai-assistant-workspace when the deliverable is the embeddable sidebar panel's state anatomy beside a document excerpt, not the full matter-scoped Q&A app shell with rails and composer; choose over contract-diff-negotiation when a counterparty redline appears only as the conflict that HOLDS a suggestion, not the clause-aligned turn-comparison surface itself; choose over clause-library-playbook when the playbook tier is a citation chip on one live suggestion rather than the firm-wide standards knowledge base; choose over doc-comments-review when the margin unit is an AI drafting suggestion with insert/undo lifecycle and verification provenance, not threaded human comments with reactions and a suggestion triage queue.",
  category: 'Legal AI',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'StackItem',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
