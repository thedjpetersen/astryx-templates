import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Transcript Annotator',
  description:
    'Human-in-the-loop eval labeling surface: left, a scrolling agent-session transcript where each message Card is role-tinted (user blue-tinted, assistant neutral) with meta lines ("assistant · sonnet-4-5 · 3.2s · 1,847 tok") and seven distinct block renderers — text, tool_call (mono header + JSON inputs CodeBlock), tool_result (red-tinted when error), steering (purple-tinted interrupt), compaction (muted "Compacted 34 messages" row), attachment chip, and error block with bold summary + dim details pre — plus a "Load more (27 remaining)" Button; right, a sticky 320px labeling LayoutPanel with three tint-on-select label Buttons (golden amber / failure red / neutral gray), a skill-tag TextInput, a conditional scrollable failure-category CheckboxList (visible because failure is selected), a notes TextArea, Save/Remove actions, and a provenance footnote. Choose over browser-session-replay or sub-agent-monitor when a human is annotating a finished trajectory, and over ai-chat-tool-stream when the transcript is forensic block-by-block replay, not a live chat.',
  category: 'Tools - Eval Labeling',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'CheckboxList',
    'Code',
    'CodeBlock',
    'Collapsible',
    'Divider',
    'Heading',
    'Icon',
    'Layout',
    'Link',
    'List',
    'MetadataList',
    'StatusDot',
    'Text',
    'TextArea',
    'TextInput',
    'Timestamp',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
