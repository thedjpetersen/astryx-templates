import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Attribution Sankey with What-If',
  description:
    'Marketing-attribution explorable built around a hand-rolled three-column Sankey (traffic sources → funnel stages → outcomes) in one SVG: cubic-bezier ribbons with token-based light-dark() gradient fills whose widths are proportional to fixture volumes, collision-aware SVG text labels (no foreignObject), and delta chips on each outcome node versus baseline. Hovering, focusing, or tapping any bar, ribbon, or 40px chip highlights the full source-to-outcome path and prints the flow in an aria-live status line; clicking pins it. The what-if LayoutPanel has Pause Paid Social and Enable Retargeting Switches plus a budget-shift Slider — each recomputes downstream volumes through deterministic redistribution rules and every node and ribbon animates to its new thickness via CSS `d` transitions on precomputed paths — and a compare footer tallies conversions gained or lost. On <=640px the diagram rotates to vertical (top-to-bottom flow) with the same layout math, axes swapped. Choose over activation-funnel-analytics when the story is proportional flow between channels and outcomes with scenario toggles, not stage-by-stage drop-off bars.',
  category: 'Explorables - Attribution Sankey',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'Heading',
    'Icon',
    'Layout',
    'LayoutPanel',
    'SegmentedControl',
    'Slider',
    'Switch',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
