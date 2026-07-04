import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Clause Library & Playbook',
  description:
    'Firm clause-standards knowledge surface (Casewright at Marlow & Voss LLP): a 272px clause-type rail with trailing-12-month deviation-count chips and pending-proposal dots plus a pinned coverage strip; the selected Limitation of Liability playbook detail with a standard-position section (light-locked serif preferred-language paper block, rationale note, fictional-authority line, approval provenance), a three-tier fallback ladder with acceptance conditions and approval-required chips (tier 3 demands partner sign-off), a labeled market-data strip showing where firm deviations landed (68%/24%/8% bars reconciling to 34+12+4 of 50 moved matters), and a recent-deviations table covering both live Kestrel M-2431 agreements; a 360px end panel carrying the Casewright deviation-analysis Card that reads the live Larchpay v3 draft against the playbook ("between Fallback 1 and 2") with a diff-style serif excerpt, citation chips, an honest confidence band, disclosure line, and a human Verify action; and a propose-update affordance with a pending-review chip that routes to the approving partner. Choose over doc-comments-review when the surface is the firm-wide clause knowledge base rather than one document’s review pass; choose over diff-viewer when comparing prose positions on serif paper with materiality and approval gates rather than code with line gutters; choose over table-index-detail when playbook semantics — fallback ladders, approval gates, deviation market data, AI verification states — drive the page rather than generic record browsing; choose over contract-ai-review when the anchor is the reusable firm standard and its negotiation history, not a single contract’s issue-by-issue AI review.',
  category: 'Legal AI',
  componentsUsed: [
    'Avatar',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'List',
    'Selector',
    'StackItem',
    'Table',
    'Text',
    'TextArea',
    'TextInput',
    'Token',
    'TreeList',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
