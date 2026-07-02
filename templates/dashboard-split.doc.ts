import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Split Dashboard',
  description:
    'Revenue analytics surface with a two-pane split: left half is one primary time-series chart Card with a SegmentedControl range switcher that swaps the fixture series, right half stacks supporting Stat cards over a revenue-by-plan breakdown list with ProgressBar share bars; the halves stack on narrow viewports.',
  category: 'Dashboard - Split',
  componentsUsed: [
    'Button',
    'Card',
    'Divider',
    'Grid',
    'IconButton',
    'Layout',
    'ProgressBar',
    'SegmentedControl',
    'Stat',
  ],
} satisfies AstryxPageTemplate;

export default template;
