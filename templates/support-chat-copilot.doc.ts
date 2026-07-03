import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Support Inbox with AI Copilot',
  description:
    "Intercom-style live-support inbox for the fictional startup Clearway (blue accent): left 320px conversation rail with an All/Assigned/Unassigned SegmentedControl, per-row SLA StatusDot with countdown Tooltip, and a CSAT emoji (or 'Awaiting CSAT' Token) on closed rows; center chat thread with customer bubbles left, brand-blue agent bubbles right, amber internal-note blocks, a pulsing customer-typing indicator, a horizontally scrolling macro quick-row, and a Reply/Internal-note composer; right 340px AI-copilot rail of genuine summary Cards — a suggested-reply Card with confidence pill, source basis line, and an Insert-into-composer button, a rendered conversation-summary Card with bullet points and a generated-at line, help-article matches each carrying a confidence Badge, and a customer-context Card (plan Badge, MRR, seats, LTV shown as months-times-MRR math, health StatusDot, recent-events timeline). Selection drives all three regions; Insert and macros fill the composer, sending appends a brand bubble, and Close flips the rail row to awaiting-CSAT. Choose over shared-team-inbox when the surface is a solo agent working live chat with an AI copilot rail — suggested replies, summaries, confidence-scored articles — rather than multi-agent mail collaboration with assignment, presence collision, and SLA-driven triage; choose over messaging-shell when the traffic is customer support conversations with SLAs, CSAT, and copilot assistance, not internal workspace channel chat on the Chat component family; choose over ai-chat-tool-stream when the AI is a sidecar assisting a human conversation instead of the chat participant itself with tool-call transcripts.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'SegmentedControl',
    'Stack',
    'StackItem',
    'StatusDot',
    'TabList',
    'Text',
    'TextArea',
    'TextInput',
    'Timestamp',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
