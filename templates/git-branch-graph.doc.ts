import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Branch Graph',
  description:
    'Commit-history browser with a lane-drawn commit DAG: every row pairs a fixed 72px SVG graph gutter (colored per-branch rails, cubic merge and branch curves, hollow merge dots) with the commit line — message, author Avatar, monospace short sha, relative-time string, and tinted branch/tag/HEAD Badges on refs. A header branch Selector collapses the graph to a single tinted rail for one branch; clicking a commit fills the 380px detail panel (Dialog below 1200px) with parents as jump Buttons, refs, and a changed-file list whose rows carry A/M/D/R status Badges and green/red diffstat bars; a Compare ToggleButton turns clicks into base/target picks, tints every row in the range, and swaps the panel to an aggregated per-path diffstat with a combined total. Choose over diff-viewer when the surface is the history DAG rather than one change, and over table-index-detail when rows need a drawn graph gutter and range selection instead of columns.',
  category: 'Coding - Branch Graph',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Dialog',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'Layout',
    'Selector',
    'Text',
    'ToggleButton',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
