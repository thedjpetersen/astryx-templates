import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Advanced Mail Search',
  description:
    'Operator-chip mail search surface: a header query bar renders the active query as removable operator Tokens (from:, has:attachment, before:, label:) with a free-text TextInput tail, over a structured filter row (From Typeahead, Date DateRangeInput, Has-attachment Switch, Folder Selector) that stays in two-way sync with the chips. A 260px saved-search rail with result-count Badges and a Save-current-search Popover sits beside grouped results (Best match / newest month / Earlier) with bolded match substrings and paperclip attachment icons; contradictory filters yield an EmptyState with Clear filters. Choose over search-results when the query is a structured, operator-chip mail query with a two-way filter builder and saved searches, not a generic ranked results page; over inbox when the list is a query result set with relevance grouping, not a folder with a reading pane; over messaging-shell when the surface is asynchronous mail search, not a live chat stream; over table-split-pane when rows are grouped search hits, not a table with a detail pane; over command-palette-launcher when search is a full page, not a modal palette.',
  category: 'Mail - Search',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'DateRangeInput',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'Popover',
    'Selector',
    'Switch',
    'Text',
    'TextInput',
    'Timestamp',
    'Token',
    'Tooltip',
    'Typeahead',
  ],
} satisfies AstryxPageTemplate;

export default template;
