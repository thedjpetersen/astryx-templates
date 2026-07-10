import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Rail Maintenance Window Planner',
  description:
    'Trackside possession-planning console for a night engineering shift: an SVG corridor schematic with junction ladders and per-section possession paint, a sections-by-minutes possession board with train-pass glyphs and shiftable window blocks, and an aside pairing worksite/isolation detail with a crew staging list. Shifting a window in 15-minute steps re-derives train conflicts, hand-back margins, header risk chips, schematic paint, and staging order from one store.',
  category: 'Logistics - Rail Maintenance Window Planner',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Heading',
    'Text',
    'Avatar',
    'Button',
    'Divider',
    'Icon',
    'StatusDot',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
