import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Compliance Training Tracker',
  description:
    'Workforce-platform compliance training admin console (Kestrel Labs, 140-person company, Jul 20 2026 snapshot): course cards with SVG completion rings, due dates, and overdue badges for Security Awareness 2026 (115/140), Harassment Prevention CA (55/58 across the 58-person SF HQ cohort), and Data Privacy Essentials (131/140); a department x course completion heat table whose % cells tint amber below 85% and red below 70% with an all-departments totals row; a 340px overdue-employees panel (12 rows with days-overdue, per-employee due dates, last-reminded timestamps, and Remind buttons that stamp a fixed reminder time); auto-assignment rule tiles with enable switches (new hires within 30 days of start, CA employees annually on hire anniversary, annual security cycle, paused contractor rule); and an audit-export header button with a last-export note. Clicking a course card or a department row scopes the heat map and the overdue panel. Choose over automation-rule-builder when the job is training-program oversight where assignment rules are read-only status tiles, not a condition-action rule editor; choose over logs-explorer when audit evidence is an entity-anchored completion/reminder export, not a query-driven log console.',
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
    'StackItem',
    'Switch',
    'Table',
    'Text',
    'Timestamp',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
