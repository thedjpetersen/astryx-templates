import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Issue Detail',
  description:
    'Ticket detail page for one planning issue (PLAT-482): a header row with back arrow, mono issue-key Code, red Bug and orange High priority Badges, an editable status Selector whose options carry StatusDots and whose change appends a system event to the feed, and a Watch/Watching toggle; a centered content column with the issue title, a description block (numbered repro steps, Expected/Actual rows), a sub-task checklist with a live "N of M done" ProgressBar and an add-sub-task TextInput, and a linked-PRs panel whose rows wear merge/open/draft icons, mono branch Codes, and per-check CI StatusDots with "2/3 checks passing" text; a right 300px metadata rail (assignee, reporter, labels as Tokens, sprint, estimate, watcher AvatarGroup) that collapses into a single-pane Details Card on narrow widths; and a threaded activity feed (All|Comments|History SegmentedControl) mixing system-event rows with comment Cards — @mentions as Tokens, indented replies, per-comment reply composers — capped by a new-comment TextArea + Send. Choose over kanban-board when the surface is ONE ticket’s full depth — description, sub-tasks, linked PRs, discussion — not a wall of cards; choose over deployment-detail when the artifact is a planning issue with threaded activity, not a build with logs.',
  category: 'Planning - Issue Detail',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'CheckboxInput',
    'Code',
    'Collapsible',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'ProgressBar',
    'SegmentedControl',
    'Selector',
    'StackItem',
    'StatusDot',
    'Text',
    'TextArea',
    'TextInput',
    'Timestamp',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
