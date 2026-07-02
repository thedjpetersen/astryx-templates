import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Widget Grid Dashboard',
  description:
    'Configurable storefront dashboard: a responsive Grid of mixed Card widgets (Stat metrics with sparklines, line and bar charts, a compact Table, an activity list), each with a configure/resize/remove MoreMenu, plus an Add widget action and an edit-mode ToggleButton that reveals drag-handle affordances.',
  category: 'Dashboard - Widget Grid',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Grid',
    'Layout',
    'MoreMenu',
    'Stat',
    'Table',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
