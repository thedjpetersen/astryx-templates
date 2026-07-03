import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Employee Self-Service Home',
  description:
    'Workforce-platform employee home hub — the employee-facing counterpart to the admin surfaces (Kestrel Labs, 140-person company, viewer Marcus Webb, pinned to Jul 8, 2026): a greeting header with a next-payday countdown chip (Jul 15, in 7 days), a quick-actions row (request time off, view paystub, refer a friend with the $2,500 bonus note), a my-pay Card showing the Jun 30 net ($5,348.40 of $8,750.00 gross) with a toggleable itemized deduction breakdown, view-statement link, and YTD gross/net that are exactly 12 pay periods of those figures, a time-off Card (vacation 9.0 and sick 6.0 days available with used-vs-annual ProgressBars, request button, approved Aug 3–7 trip chip), a my-benefits strip (Kestrel Gold PPO, Dental + Vision, and a 401k segment whose inline quick-change editor recomputes the $525.00 = 6% x $8,750.00 per-paycheck deferral via SegmentedControl presets), a two-post company announcements feed with working like toggles, and a 320px end rail holding tasks-for-you (sign handbook v4.2 / security training with due chips — the handbook signs to done in place) plus the org strip (manager Priya Raman and 5 report avatars incl. new hire Ava Lindqvist with a Starts Jul 20 chip). Choose over time-off-planner when the job is the whole employee hub — the time-off card here shows balances and links out rather than embedding a request composer and team calendar; choose over payout-statements when pay is a one-paycheck glance with YTD context, not a statements console; choose over org-chart-explorer when the org view is a personal manager-and-reports strip, not a reporting-lines canvas.',
  category: 'Workforce Platform',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Grid',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'Link',
    'ProgressBar',
    'SegmentedControl',
    'StackItem',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
