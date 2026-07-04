import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Citation & Authority Checker',
  description:
    "Casewright's cite-check surface for a research memo at Marlow & Voss LLP (M-2417 · Kestrel Labs — Series C Financing): a privilege strip and header with memo-context chips, the 'AI-generated · verify before relying' disclosure line, and a Re-run-check action beside the last-run timestamp; a summary strip whose counts are computed from the fixture (14 citations · 9 good law · 3 caution · 1 negative treatment · 1 unverifiable, plus 10 human-verified · 4 AI only); and a WIDE full-width expandable citations table — legal-format fictional citation, cited-for proposition excerpt, treatment badge with glyph, depth-of-support pips, verified-by column (checker Avatar with provenance date or an amber 'AI only' chip), and a jump-to-usage link into the memo. Every row expands to a treatment detail (serif cited-for quote, provenance, depth label); the negatively-treated authority ships expanded with its negative citing-references list, a memo-characterization vs actual-holding quote comparison carrying a subtle mismatch flag, and a Casewright replace-suggestion Card offering two alternative fictional authorities with relevance notes, a confidence band, and a confirm-gated Replace action that queues the change for human review. Choose over legal-research-memo when the surface is the citations AUDIT TABLE across the whole memo — treatment analysis, depth pips, and replacement workflow — rather than the serif memo canvas itself with margin verification; choose over legal-ai-assistant-workspace when there is no conversation at all, only the finished memo's authorities under systematic check; choose over table-inline-expansion when legal semantics — treatment states, verification provenance, privilege, and confirm-gated draft edits — drive the table rather than generic record expansion; choose over diff-viewer when the comparison is two quoted prose passages (memo characterization vs holding) on serif quote blocks with a mismatch flag, never a code diff with line gutters; choose over workforce-audit-log when rows are the memo's cited authorities and their good-law status, not a compliance trail of admin actions.",
  category: 'Legal AI',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'Link',
    'StackItem',
    'StatusDot',
    'Table',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
