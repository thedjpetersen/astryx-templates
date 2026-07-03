import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Poll & Survey Builder',
  description:
    'Two-pane survey authoring surface: the left pane is a question-list editor (numbered question Cards with type Tokens, inline question-text and choice inputs, add/remove/reorder choice rows, and per-type settings — required Switch, rating scale range Selector, choice-limit Selector) and the right LayoutPanel is a live respondent preview that re-renders on every edit and highlights the selected question. Questions reorder via move buttons and a MoreMenu with move-to-position items, resequencing both panes in sync; a branch-rule composer builds "If Q1 = No, skip to Q4" from three dropdowns and flags rules broken by reordering. Test mode turns the preview into a clickable one-question-at-a-time run (RadioList, CheckboxList with choice limit, rating pills, rank up/down) that honors branch rules with a skipped-questions note, and a header TabList flips to a Results view with fixture response bars, a rating distribution, ranked-first tallies, and open-text quotes. Deleting a question shows an undo toast; deleting them all reveals the build-from-scratch empty state. The only survey/form-authoring archetype in the catalog — choose it for poll builders, quiz editors, or any editor-plus-live-preview surface over the fill-in form templates.',
  category: 'Social - Poll & Survey Builder',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CheckboxList',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'MoreMenu',
    'RadioList',
    'Selector',
    'Switch',
    'TabList',
    'TextArea',
    'TextInput',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
