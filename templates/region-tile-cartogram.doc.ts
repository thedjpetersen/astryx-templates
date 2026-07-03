import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Tile Cartogram Metric Atlas',
  description:
    'Schematic tile-grid cartogram of 50 US states (rounded squares at hand-authored grid coordinates — no map projection) shaded as a choropleth for a switchable metric (adoption, revenue per capita, churn) through hand-tuned five-stop light-dark() color ramps. Tapping a tile pins it (up to three, oldest drops first) into comparison chips with five-year bar sparklines and signed deltas; a linked ranking bar chart in the end panel highlights pinned states, scrolls the newest pin into view, and flips sort direction; the quantize legend doubles as a bucket filter that dims tiles and ranking rows outside the clicked range; and a year SegmentedControl with prev/next/play transport steps the whole surface through five fixture years while tiles animate between color stops (disabled under reduced motion). Choose over fleet-node-status when the units have fixed geographic positions and the story is spatial distribution plus a linked ranking, not a positionless density grid; choose over portfolio-holdings when the comparison is regions on a map rather than rows in a table.',
  category: 'Explorables - Tile Cartogram Metric Atlas',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'SegmentedControl',
    'Text',
    'ToggleButton',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
