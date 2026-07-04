import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Inline Risk Flag Annotations',
  description:
    "Clause-annotation specimens of the Casewright risk flag (Marlow & Voss LLP, matter M-2431), shown as three frozen lifecycle states of ONE flag on the same static serif contract paragraph — Skylark Cloud MSA § 9.2, Limitation of Liability, counterparty draft v4 — each specimen a light-locked paper snippet (privilege microstrip, document/matter stamp lines, justified clause text) beside its margin annotation, under a mono caption row: specimen 01 is the high-risk state — the v4 'Customer Configuration Event' carve-out red-washed on the paper next to the full margin flag card ('High risk' severity pill, 'Uncapped liability' title, two-line AI rationale, § 9.2 clause pin + 'Skylark Cloud MSA v4 · p. 18' citation chips, 'Playbook LL-4 · R. Vega' reference chip, 'High confidence' band, amber not-yet-verified provenance, the 'AI-generated · verify before relying' disclosure line, and Acknowledge / Escalate-to-J.-Voss actions that resolve to an attributed status row); specimen 02 is the resolved state — the accepted v5 equal-cap redline green-washed in the same clause with a collapsed flag chip ('Resolved · Redline accepted in v5 · Jul 13') that expands to the retired summary and 'Verified · R. Vega' provenance; specimen 03 is the suppressed state — the clause back to neutral with a dotted anchor underline and a dismissal audit chip ('Flag dismissed by Julian Voss · reason: client-approved exception', actor Avatar, timestamp) whose Reopen affordance flips to an amber pending-re-review row while the audit trail stays visible. Choose over legal-doc-review-analysis when the deliverable is the annotation UNIT's anatomy and lifecycle states (the flag card, resolution chip, and dismissal audit chip in isolation), not the full single-contract review page with its clause rail, meters, and cross-linked paper canvas; choose over contract-diff-negotiation when one clause's flag lifecycle is the subject, not turn-over-turn diff navigation with version selectors and a changed-clause rail; choose over doc-comments-review when the margin objects are AI risk flags with severity, playbook positions, and dismissal audit trails, not threaded human comments with reactions and replies; choose over meeting-notes-ai-card when the specimen is the clause-anchored legal risk annotation on contract paper, not the post-meeting recap card and its generation states.",
  category: 'Legal AI',
  componentsUsed: [
    'Avatar',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'Icon',
    'StackItem',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
