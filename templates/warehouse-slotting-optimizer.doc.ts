import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Warehouse Slotting Optimizer',
  description:
    'Slotwise slotting console: an aisle-by-bay velocity heatmap of 60 slot buttons beside a ranked 380px move-plan panel with live savings, cube-fill, and ergonomic strain columns. Accepting a move mutates the slot map — cells swap or clear, the travel-saved counter and KPI band re-derive, dependent moves unblock, and applied rows revert. Deterministic 38-SKU fixtures with a worked travel model.',
  category: 'Logistics - Warehouse Slotting Optimizer',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Badge',
    'Button',
    'EmptyState',
    'Icon',
    'SegmentedControl',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
