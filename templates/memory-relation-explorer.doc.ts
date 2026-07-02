import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Memory Relation Explorer',
  description:
    'Three-pane knowledge-memory browser for an AI assistant: a docked 340px left rail with a Filters/Entities TabList (color-coded memory-type and edge-type toggle pills, searchable entity checklist with mention counts, min-weight Slider with 2-decimal readout, conditional Reset Filters button), a center column with a node search bar, an "8 nodes · 4 edges" status caption, a memory list with fact-type StatusDots, and a relations Table whose Type cells are tinted Badges (entity/temporal/semantic/caused by) and whose Weight cells pair a mini ProgressBar with the value, plus a persistent right detail panel rendering the selected memory: Markdown body, tinted fact-type Badge, date and proof-count Badges, clickable entity Token chips, and a per-edge-type connection-count footer. Choose over table-index-detail when the domain is typed graph facts with a faceted filter vocabulary, and over search-results when selection drives a rich detail panel rather than a results list.',
  category: 'Tools - Memory Explorer',
  componentsUsed: [
    'Badge',
    'Button',
    'CheckboxList',
    'Dialog',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'Markdown',
    'ProgressBar',
    'Slider',
    'StatusDot',
    'TabList',
    'Table',
    'Text',
    'TextInput',
    'ToggleButton',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
