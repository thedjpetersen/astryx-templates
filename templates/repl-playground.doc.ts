import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'REPL Playground',
  description:
    'Interactive code playground: a dark editor pane with line numbers and syntax-toned spans from fixture token data beside a docked console panel — an examples Selector swaps three snippets, Run reveals the matching captured output (logs, a console.table grid, or an error with a collapsible stack) behind All/Logs/Errors filter tabs with count badges, plus Copy/Share actions and execution-time and exit-status badges.',
  category: 'Coding - REPL Playground',
  componentsUsed: [
    'Badge',
    'Button',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'SegmentedControl',
    'Selector',
    'TabList',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
