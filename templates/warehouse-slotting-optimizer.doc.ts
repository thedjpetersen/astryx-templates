import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Warehouse Slotting Optimizer",
  description: "Slotting planner that ranks SKUs by velocity, cube, pick path strain, and move-window readiness. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "Logistics - Warehouse Slotting Optimizer",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
