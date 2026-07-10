import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Permit Inspection Route',
  description:
    'Curbside — a municipal dispatch board for same-day permit inspection routing. An ordered stop list (inspector switch, derived drive/on-site/end-of-day/miss stat tiles, 76px stop rows with permit ids, arrival windows, and state-colored ETA chips) sits beside a schematic street-grid SVG with numbered pin buttons, a yard marker, and Manhattan route polylines for two inspectors. Moving or reassigning a stop redraws the polylines, recomputes every downstream ETA, flips wait/miss chips, renumbers the map pins, and updates the citywide miss and drive rollups in one render.',
  category: 'Civic - Permit Inspection Route',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Badge', 'Button', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
