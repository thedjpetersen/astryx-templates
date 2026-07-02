import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Artifact Pin Dock',
  description:
    'Artifact/pin management dock: a horizontal row of rounded-full pill tabs above a large viewer card, where pills carry file-type icons or CI StatusDots (green success, pulsing amber pending) with matching tinted borders and the active pill an accent border; the viewer card floats a top-right action cluster (open-external, copy, download, share, unpin IconButtons) and a top-left Preview/Code/Markdown SegmentedControl over a GitHub PR status card fixture — Avatar circle, title, repo#number, green Open Badge, label Tokens, author/files/±diff/comments stat row, and a "9/12 checks passed · 3 pending" CI line. Below, an expandable Data sources bar lists read (sky Token) and write (amber Token) sources with mono commands, cadence chips, Run buttons, and result chips ("exit 0 in 412ms" success / destructive error). Choose over ai-chat-artifact when the story is juggling multiple pinned artifacts and external PRs with status chrome, not one generated artifact beside a transcript.',
  category: 'AI Chat - Artifact Dock',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'ButtonGroup',
    'Card',
    'Code',
    'CodeBlock',
    'Collapsible',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'MoreMenu',
    'SegmentedControl',
    'StatusDot',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
