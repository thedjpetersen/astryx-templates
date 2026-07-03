import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Month Calendar',
  description:
    'Month-view calendar: a 7-column day grid over fixture months with category-colored event chips and "+N more" overflow, weekend and out-of-month shading, a today ring, prev/next month paging with a Today jump, a legend of category filter ToggleButtons, and a docked selected-day event panel. Choose over a dashboard or table when the surface is a month-at-a-glance schedule of day cells and events rather than widgets or rows.',
  category: 'Calendar - Month Calendar',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'ToggleButton',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
