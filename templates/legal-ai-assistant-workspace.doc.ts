import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Legal AI Assistant Workspace',
  description:
    "Casewright's ask-anything assistant surface for Marlow & Voss LLP, framed as a wide app shell under a persistent attorney-client-privilege strip: left 280px matter-context rail (Kestrel Labs matter switcher with document counts, the active M-2417 Series C context with key dates, indexing status, and team line, recent assistant threads including the drag-along session with its retracted-citation marker, and a pinned AI-usage-log note); center assistant thread — an associate's diligence query on the Skylark MSA indemnification carve-outs and Casewright's structured answer as numbered points, each carrying clickable citation chips (doc + section), honest confidence bands, and first-class verification chips (2 verified with reviewer + timestamp provenance, 1 amber unverified with an explicit Verify action), plus an inline light-locked serif quoted-passage card with an amber highlight wash, the 'AI-generated · verify before relying' disclosure footer, and follow-up suggestion chips; right 320px sources panel listing the 4 cited documents with section chips, labeled retrieval-relevance bars ('not legal weight'), and open affordances that citation chips point at; docked composer with an Ask/Draft/Summarize mode select, a matter-scope chip, and a verify-before-relying microcopy line. Choose over ai-chat-tool-stream when the story is a cited, verifiable answer over a privileged matter corpus — retrieval traces stay collapsed and subordinate — not the agent's tool execution; choose over ai-chat-artifact when the produced artifact is an in-thread structured answer with citations and verification states, not a generated-code pane with CodeBlock affordances; choose over support-chat-copilot when the AI is the conversation partner for a lawyer under privilege, not a sidecar assisting live customer support; choose over legal-research-copilot when the surface is the matter-scoped Q&A workspace (matter rail, sources panel, mode composer) rather than an authorities-driven research session building a standalone memo artifact; choose over legal-matter-workspace when the hub is the conversation itself, not the matter's docket of documents, key dates, and signature status.",
  category: 'Legal AI',
  componentsUsed: [
    'Avatar',
    'Button',
    'Card',
    'Chat',
    'Collapsible',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'ProgressBar',
    'SegmentedControl',
    'StackItem',
    'StatusDot',
    'Text',
    'TextArea',
    'Timestamp',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
