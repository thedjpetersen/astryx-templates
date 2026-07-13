import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Compaction Inspector',
  description:
    'Long-running agent chat whose transcript carries inline compaction marker chips between messages: a "Memory compacted" pill with mono removal stats and Inspect, plus a failed variant whose Retry flips it to an in-progress state. Inspect opens a large Compaction Details Dialog (open by default) with a TabList of Diff (two-column before/after context manifest as diff CodeBlocks), Tree (TreeList of model-context paths with kept/dropped Badges), and Stats (four before-to-after stat Cards). Choose over ai-chat-context-manager when the story is what one compaction pass did to the context, not steady-state budget tuning.',
  category: 'AI Chat - Compaction',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Chat',
    'CodeBlock',
    'Dialog',
    'IconButton',
    'Layout',
    'ProgressBar',
    'Spinner',
    'StatusDot',
    'TabList',
    'TextArea',
    'Timestamp',
    'TreeList',
  ],
} satisfies AstryxPageTemplate;

export default template;
