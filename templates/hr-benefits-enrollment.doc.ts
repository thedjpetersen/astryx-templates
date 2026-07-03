import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Benefits Enrollment Admin',
  description:
    'Workforce-platform open-enrollment console (Kestrel Labs, 140-person company, 2026–27 plan year): an enrollment-window banner with a static 12-days-left countdown and a tri-segment completion meter (112 enrolled / 19 started / 9 not started, reconciling to 140); five plan cards (Meridian PPO, Cascade HMO, Brightside Dental, Lumen Vision, Vantage 401k) with carrier monogram tiles, election counts against the 112 completed enrollments, employer/employee monthly cost split bars, and a derived employer monthly spend line; a status-segmented employee table (elections progress dots, deadline tokens, per-row and bulk Nudge reminders); a QLE exceptions row (marriage and birth events with extended windows plus the two new-hire windows for Ava Lindqvist and Ken Tanaka); and a 320px dependent-verification queue panel with 3 pending documents and approve / request-new actions that resolve the linked QLE tiles. Choose over team-scheduler when the calendar element is a benefits election window with a countdown and completion meter, not meeting availability; choose over esignature-envelope-flow when documents are dependent-verification statuses an admin approves, not a signing ceremony; choose over table-bulk-actions when the roster table exists for domain nudge/enrollment actions rather than generic bulk selection.',
  category: 'Workforce HR',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'SegmentedControl',
    'StackItem',
    'Table',
    'Text',
    'Timestamp',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
