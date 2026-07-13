import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Eval Triage Workbench',
  description:
    'Session-labeling workbench for building agent eval sets: a stat strip (Total tagged / Golden / Failure / Neutral with tinted cards), a "By skill" mini-table with failure-rate bars, and a filterable sessions Table (channel Selector, user-ID filter, count Pagination) beside a detail panel with a transcript snippet, a 16-tag failure-taxonomy chip grid, a Golden/Failure/Neutral SegmentedControl, notes, and Save with FieldStatus feedback. Choose over error-events-monitor when humans are hand-labeling sessions rather than watching automated error rollups.',
  category: 'AI Chat - Evals',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'FieldStatus',
    'Icon',
    'Layout',
    'Pagination',
    'SegmentedControl',
    'Selector',
    'Table',
    'TextArea',
    'TextInput',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
