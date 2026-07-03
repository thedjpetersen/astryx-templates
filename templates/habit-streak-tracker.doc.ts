import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Habit Streak Tracker',
  description:
    'Daily habit tracker: a scroll row of habit cards with 40px today check-offs, flame streak counts, and 14-day dot strips; a per-habit heatmap of CSS cell buttons that zooms between a paged month grid and a year density view, where any tracked day retro-fills or clears with full streak recomputation (including a streak-freeze bridge day); accessible move-left/right reordering; an archive section with restore; and a docked stats rail (today progress, current/longest streak, completion rate, best weekday bars). Choose over a calendar or dashboard when the surface is per-habit daily completion and streak math rather than events or metric widgets.',
  category: 'Lifestyle - Habit Streak Tracker',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'SegmentedControl',
    'Stat',
  ],
} satisfies AstryxPageTemplate;

export default template;
