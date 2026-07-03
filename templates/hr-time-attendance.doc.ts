import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Time & Attendance Approvals',
  description:
    "Timesheet approval console for Kestrel Labs' hourly Ops staff (8 hourly employees, two fixed pay weeks: Jun 22–28 locked, Jun 29 – Jul 5 in review): a header week selector pages between the locked prior week and the current pay week; a pay-period lock countdown Banner sits above a multi-select timesheet Table (employee, seven daily clock-in/out chips with exception icon badges and tooltips — missed punch, edited entry, geofence miss — an overtime-aware total column that flags >40 h in amber, and a status Token). Checking rows raises a bulk-approve Toolbar that skips sheets with blocking exceptions; clicking a row opens a 340px detail drawer with the day-by-day punch list, the edited-entry audit note, an OT/gross-pay breakdown, and approve/return actions. Hours are always computed from the punch minutes so every total reconciles. Choose over table-bulk-actions when the multi-select table exists for exception-aware timesheet approval with pay math, not generic bulk selection; choose over hr-leave-policies when the job is approving worked hours against a pay-period lock, not administering accrual policy; choose over fin-payroll-run when the surface is upstream timesheet sign-off feeding payroll, not reviewing the monetary pay run itself.",
  category: 'Workforce HR',
  componentsUsed: [
    'Avatar',
    'Banner',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'SegmentedControl',
    'StackItem',
    'Table',
    'Text',
    'TextInput',
    'Timestamp',
    'Token',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
