import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Timed Quiz Runner',
  description:
    'Timed exam surface for a 20-question quiz: a header with a live mm:ss countdown that turns amber under two minutes and red under one, an answered-count readout, and a Submit Button; one question at a time in a Card across three variants (RadioList multiple choice, CheckboxList multi-select, TextInput short answer) with Previous/Next nav and an amber flag-for-review toggle; and a question-palette rail of 20 numbered chips color-coded answered/flagged/unvisited (a horizontal chip strip on narrow screens) where any chip jumps to its question. Submitting with unanswered questions raises a confirm Dialog listing them as jump chips; confirmed submission or timer expiry flips to results mode with a score ProgressBar, a missed-only Switch filter, per-question correct/incorrect review rows with explanations, and a Retake action that resets answers, flags, and the clock. Choose over form-wizard when the flow is a GRADED, TIMED attempt with an answer key and jump-anywhere navigation, not a linear setup flow; over kanban/task surfaces when items are questions with correctness, not work states.',
  category: 'Learning - Timed Quiz Runner',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CheckboxList',
    'Dialog',
    'Divider',
    'EmptyState',
    'Icon',
    'Layout',
    'ProgressBar',
    'RadioList',
    'Switch',
    'Text',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
