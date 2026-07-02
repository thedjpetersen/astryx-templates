import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Scheduled & Snoozed Mail',
  description:
    'Time-grouped outbox of scheduled sends and snoozed threads: LayoutHeader with a Scheduled/Snoozed SegmentedControl and count summary over a centered column of date-group sections (Today/Tomorrow/Next week) of flat Avatar rows with countdown Badges, hover-revealed Send now / Edit schedule (Popover with presets + Calendar + TimeInput) / Cancel send actions with undo Toasts, a "Sending in 30s — Undo" Banner row, and unsnooze/re-snooze actions with inline EmptyStates. Choose over inbox when the axis is WHEN mail moves (future sends, snooze returns), not triaging received mail; over messaging-shell when items are asynchronous scheduled mail, not a live chat stream; over table-split-pane when rows are self-contained actionable items with inline reschedule Popovers rather than a list/detail selection surface.',
  category: 'Mail - Scheduled Send',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Calendar',
    'Divider',
    'DropdownMenu',
    'EmptyState',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MoreMenu',
    'Popover',
    'SegmentedControl',
    'Text',
    'TimeInput',
    'Timestamp',
    'Toast',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
