import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Team Scheduler',
  description:
    'Meeting-coordination scheduler for a cross-timezone team: an availability matrix of member rows (initials Avatar, role, timezone with UTC offset) by UTC hour columns of tinted free/busy/tentative cells with an off-hours hatch, a rounded accent slot highlight that slides to whichever column is clicked (and widens for 90-minute meetings via a 30/60/90 duration SegmentedControl), an end panel of top-three suggested slots as SelectableCards ranked by attendance (ProgressBar, conflict Tokens, required-conflict note), and a selected-slot summary with chevron nudge IconButtons, per-member local time ranges with +1d day-shift Tokens, per-member status Tokens, and a Send invite Button that flips to a success Banner. Choose over a week-grid calendar when the decision variable is "which hour works for these people", not "which day" — the unit is an attendee set, so member-by-hour beats day-by-slot.',
  category: 'Calendar - Team Scheduler',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Divider',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'ProgressBar',
    'SegmentedControl',
    'SelectableCard',
    'Switch',
    'Text',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
