import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Leave Policy Administration',
  description:
    'Admin-side leave policy console for a 140-person workforce platform in an app-shell frame: a 300px policy rail with four policy cards (Vacation, Sick, Parental, Sabbatical) carrying accrual-rate / cap / carryover summaries, department + office assignment chips, and covered counts; a policy-detail pane with a warning Banner for the seeded pending change (Vacation carryover cap 10 → 5 days) that names the 2 affected employees and offers Publish/Discard, an accrual-schedule Table by tenure band whose employee counts sum to 140, carryover and negative-balance Switches plus a cap Selector gated behind an explicit edit mode, grant-term MetadataLists for the non-accrual policies, and assignment breakdowns that reconcile to headcount; and a 320px holiday-calendar panel (US / Portugal SegmentedControl, office coverage 107 + 33 = 140, upcoming fixed-2026 holidays with observed-date notes) that moves inline below the detail pane at narrow widths. Choose over time-off-planner when the job is administering accrual rules, assignments, and holiday calendars rather than composing employee PTO requests, and over automation-rule-builder when the rules are policy balance settings with employee-impact previews rather than condition-action automations.',
  category: 'Workforce HR',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Divider',
    'Heading',
    'Icon',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'Selector',
    'Switch',
    'Table',
    'Text',
    'Timestamp',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
