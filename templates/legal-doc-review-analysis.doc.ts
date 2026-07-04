import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Contract Review & Risk Analysis',
  description:
    'Single-contract review & risk analysis surface for Casewright at Marlow & Voss LLP — the Larchpay Payment Processing Agreement (counterparty draft v3, matter M-2431 for Kestrel Labs): a summary header (contract Heading + "Counterparty draft v3" Badge + matter note + an "Overall risk: Elevated" band chip beside a "12 clauses analyzed · 3 need attention" meter + the deal-team AvatarGroup), a persistent "Attorney-Client Privileged · Attorney Work Product" banner strip, a centered light-locked serif paper canvas rendering the STATIC contract preview whose operative clause sentences carry risk-tinted clause-anchored highlights (2 red, 3 amber, 7 green), a right 400px analysis rail of extracted clauses grouped by type (indemnification & risk allocation, liability cap, term & termination, data protection, commercial terms) — flagged clauses as Cards with a risk pill, AI rationale excerpt with honest confidence band, market-standard comparison chip ("Below market — cap at 1x fees vs typical 2x"), clause pin + playbook Tokens, verification provenance, per-card AI-disclosure line, and a suggested-redline affordance whose expanded body shows tracked-change serif text (strike + insert; the § 8.4 indemnity redline starts expanded), while standard clauses settle to compact rows — and an AI-disclosure LayoutFooter citing the run and its sources; clicking a paper highlight selects and scrolls its rail entry and vice versa, and every count reconciles across header, rail, and paper. Choose over doc-comments-review when the rail holds AI risk analysis — risk pills, market benchmarks, playbook redlines, verification provenance — rather than threaded human margin comments with reactions and a reply composer; choose over doc-version-history when the surface analyzes ONE contract turn for risk rather than browsing and restoring saved snapshots; choose over diff-viewer when the artifact is serif contract prose with clause-level materiality, not a monospace code diff with line gutters; choose over expense-approval-queue when the verdicts are clause-risk judgments against market and playbook positions, not finance approvals of receipts and totals.',
  category: 'Legal AI',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'StackItem',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
