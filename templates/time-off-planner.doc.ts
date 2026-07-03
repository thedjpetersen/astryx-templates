import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Time-Off Planner',
  description:
    'PTO surface in a content + docked-form frame: header count summary ("8 requests · 3 pending · 4 approved") with a July 2026 month chip; three balance Cards (vacation/sick/personal) with remaining-day values, used-vs-annual ProgressBars, accrual notes, and live "scheduled" Badges; a new-request form (type Selector with remaining-balance labels, start/end DateInputs, half-day Switch, note TextArea) that computes business days excluding weekends and company holidays and validates against the remaining balance; a horizontally scrollable team absence strip painting who is out on which fixture-month days (approved solid, pending dashed, tap-to-inspect bars with a sticky name rail); and a requests Table with status Badges plus approve/deny for direct reports and cancel for own pending rows, both guarded by AlertDialog — the table swaps to stacked cards on phones. Choose over form-page when the surface tracks balances and a team calendar around the form, and over kanban-board when rows are date-ranged requests with an approval state machine rather than freely movable work items.',
  category: 'Calendar - Time-Off Planner',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'DateInput',
    'Divider',
    'EmptyState',
    'FieldStatus',
    'Grid',
    'Layout',
    'ProgressBar',
    'SegmentedControl',
    'Selector',
    'Switch',
    'Table',
    'TextArea',
    'Timestamp',
  ],
} satisfies AstryxPageTemplate;

export default template;
