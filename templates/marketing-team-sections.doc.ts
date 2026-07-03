import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Team Section Showcase',
  description:
    'Marketing team-section showcase with a variant switcher isolating four labeled designs for a 14-person startup: a 4-up photo-card Grid with gradient-initial tiles and social IconButton rows, a large-image leadership spotlight row with full bios, a compact directory list grouped by collapsible department, and a dark hiring band interleaving team cards with dashed open-role cards; every member opens a fun-fact bio Popover and role/social links fire a Toast.',
  category: 'Marketing - Team Section Showcase',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'Grid',
    'Icon',
    'IconButton',
    'Layout',
    'Popover',
    'SegmentedControl',
    'Selector',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
