import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Notebook / Report Page',
  description:
    'Analytics notebook report: pinned header with title, author, Timestamp, and Run all above a centered document column of framed blocks — Markdown prose, a SQL CodeBlock with rendered result output, a ChartV2 trend chart, and a data Table — each with a hover-revealed run/MoreMenu block toolbar.',
  category: 'Tools - Notebook/Report Page',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'CodeBlock',
    'IconButton',
    'Layout',
    'Markdown',
    'MoreMenu',
    'Table',
    'Timestamp',
  ],
} satisfies AstryxPageTemplate;

export default template;
