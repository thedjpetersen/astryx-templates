import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Brushing & Linking Metric Lab',
  description:
    'Brushing-and-linking explorer over 180 deterministic SaaS accounts where direct manipulation is the filter mechanism: a hand-rolled SVG scatter of spend vs engagement (dot size = seats, color = segment) with a draggable rectangle brush — pointer events with capture, drag the body to move, corner handles that grow to ~44px targets on touch, plus a full keyboard path (Enter creates, arrows nudge, Shift+arrows resize, Escape clears) driving the identical reducer commits — linked bidirectionally to a 12-bin spend histogram (drag across bins, or click / Shift+click the bin buttons, to brush a range that filters the scatter back) and a segment bar chart with >=44px toggle rows, all above a compact brushed-accounts Table. Active selections render as removable Token chips with a Clear-all Button, and a lasso-stats Stat strip (count, median spend, total seats) recomputes on every pointer move; preset-brush Buttons dispatch the same actions as the gesture. All scales, ticks, and geometry are hand-rolled and deterministic; every color resolves through --color tokens or color-mix() so translucent brush fills stay legible in dark mode; <=640px the three charts become a scroll-snap carousel and the brush stays fully touch-operable. Choose over dashboard-filterable when filters should be brushed directly on the charts, not picked in a panel.',
  category: 'Explorables - Brushing & Linking Metric Lab',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'EmptyState',
    'Grid',
    'Heading',
    'Icon',
    'Layout',
    'Stat',
    'Table',
    'Text',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
