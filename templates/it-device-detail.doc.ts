import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Device Detail & Remote Actions',
  description:
    'IT-admin drill-down for one employee endpoint in a workforce/MDM platform — Marcus Webb’s MacBook Pro 16" (asset KL-MBP-0147): a breadcrumbed record-detail page with an identity band (device glyph, managed/supervised Tokens, posture chips), a warning Banner + in-checklist remediation CTA for the single failing compliance check (EDR agent below minimum, queues in place), a hardware spec MetadataList beside a segmented storage-usage bar with legend, a 4-row FileVault/screen-lock/OS/EDR compliance checklist with pass-fail evidence, a filterable installed-apps Table (search + Managed/Self-installed SegmentedControl, mono version column with update chips, management Badges), a lifecycle timeline from PO receipt to compliance flag, and a sticky end rail with remote actions (Lock/Restart AlertDialog confirms; destructive Wipe Dialog gated on a required-reason field), assignee, peripherals, and an AppleCare warranty card with a coverage-elapsed meter. Choose over fleet-node-status when the unit is a single employee laptop with MDM posture and lifecycle, not a homogeneous server fleet; choose over hr-employee-profile when the job is IT operations on the asset (compliance, remote commands, warranty), not the person’s HR record.',
  category: 'Workforce IT',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Banner',
    'Breadcrumbs',
    'Button',
    'Card',
    'Dialog',
    'Divider',
    'DropdownMenu',
    'EmptyState',
    'Heading',
    'Icon',
    'Layout',
    'Link',
    'MetadataList',
    'ProgressBar',
    'SegmentedControl',
    'StatusDot',
    'Table',
    'Text',
    'TextArea',
    'TextInput',
    'Timestamp',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
