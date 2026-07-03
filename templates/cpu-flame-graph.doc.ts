import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Zoomable CPU Flame Graph',
  description:
    'Icicle-style CPU flame graph over a nested stack-frame fixture: every frame is a proportional-width absolutely positioned button cell, and clicking (or pressing Enter — frames tab in depth-first order) re-roots the graph with one CSS transition carrying every cell to its new left/width so the zoom reads as a continuous spatial stretch; a breadcrumb of ancestor frames plus Up one level / Reset zoom restore outward zoom through the same animation in reverse. A search TextInput highlights matching frames across all depths with a match-count Badge and dims non-matches; a compare-baseline Switch recolors frames on a red/blue slower/faster diverging scale with a signed-delta detail rail; hover/focus raises a self/total/calls tooltip; and frame labels step full name → short name → blank through container queries so narrow cells never overflow. Both the heat ramp and the diff scale are explicit light-dark() token pairs. Choose over query-plan-profiler when the subject is CPU TIME by stack depth, not query plan operators; over test-runner-console when rows are stack frames, not test verdicts.',
  category: 'Explorables - Zoomable CPU Flame Graph',
  componentsUsed: [
    'Badge',
    'Button',
    'Code',
    'Divider',
    'Icon',
    'Layout',
    'Switch',
    'Text',
    'TextInput',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
