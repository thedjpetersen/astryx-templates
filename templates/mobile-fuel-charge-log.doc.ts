import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Voltmile - Fuel & Charge Log',
  description:
    'Mobile hybrid-vehicle fuel and charge ledger with a sticky cost-per-mile band, month-grouped entry rows, station and trends tabs, a tri-linked fill composer, slider-driven provisional markers, and snapshot-exact undo for July partial-fill updates.',
  category: 'Mobile - Fuel & Charge Log',
  componentsUsed: ['Icon', 'useMediaQuery'],
} satisfies AstryxPageTemplate;

export default template;
