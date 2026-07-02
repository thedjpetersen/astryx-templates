import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Diff Compare Viewer',
  description:
    'Code-review diff surface for a single changed file: split/unified SegmentedControl toggle, line-number gutters, token-tinted added/removed lines, file header with change-stat Badges and a Viewed collapse Switch, plus one inline comment thread with a reply composer anchored to a line.',
  category: 'Tools - Diff Compare Viewer',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Code',
    'Icon',
    'Layout',
    'SegmentedControl',
    'Switch',
    'TextArea',
  ],
} satisfies AstryxPageTemplate;

export default template;
