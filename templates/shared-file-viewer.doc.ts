import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Shared File Viewer',
  description:
    'Public shared-file page for an agent workspace file: sticky header with mono filepath, Shared file Badge, a Live pill (pulsing StatusDot with last-checked Tooltip, flippable to an amber refresh-failed state), and a Rendered / Diff / Code SegmentedControl. Rendered shows Markdown with headings, a table, and a code fence; Diff shows two file cards of unified-diff rows with dual line-number gutters and tinted +/− lines; Code shows a line-numbered CodeBlock. Includes a share-provenance footer and a signed-out specimen Card. Choose over file-browser-preview when the story is a single publicly shared file, not workspace browsing.',
  category: 'AI Chat - Sharing',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CodeBlock',
    'Divider',
    'Layout',
    'Markdown',
    'SegmentedControl',
    'StatusDot',
    'Switch',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
