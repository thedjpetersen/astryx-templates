import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Team Directory & Working Hours',
  description:
    'People directory for a distributed program group (Kestrel Labs · Atlas, 12 people across San Francisco, Lisbon, and US-remote): a timezone-overlap strip stacking SF / Lisbon / Remote working-hour bands on one shared 24-hour PT axis with a highlighted 3-hour golden-overlap window and a frozen now line; an out-today strip citing the time-off ledger (PTO chip, approval citation, coverage delegate); a filter bar with a team Selector, office chips, skill chips, and search whose counts reconcile with the grid; a person-card grid (Avatar, role, local time with day/night glyph, per-person working-hours bar on the same 24h axis, status emoji, skill Tokens, joined-date chips for new hires, compare pin); and a pinned compare tray for two selected people showing shared hours and the next mutual 30-minute free slot computed from fixed busy blocks. Choose over org-chart-explorer when the job is finding WHO is working WHEN across timezones — availability, overlap, and skills — not visualizing reporting lines on a pannable tree; choose over hr-employee-profile when you need the whole roster’s collaboration-facing surface (local clocks, hour bands, status) rather than one employee’s full HR record of comp, documents, devices, and balances.',
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Selector',
    'StackItem',
    'Text',
    'TextInput',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
