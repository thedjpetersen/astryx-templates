import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Campus Room Scheduler',
  description:
    'Roomloom registrar grid: rooms with capacity, feature badges, and live utilization bars against the nine standard MWF/TTh meeting blocks, with occupied cells shaded by enrollment pressure and a queue rail of unplaced sections. Arming a section classifies every cell live — eligible cells preview projected seat fill, over-capacity and missing-feature cells flag their conflict, and rooms without step-free access refuse accommodation sections with a shake and a reason banner — while placements update seat-fill and block-use KPIs in the same render.',
  category: 'Education - Campus Room Scheduler',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
