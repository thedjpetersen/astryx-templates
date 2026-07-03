import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Employee Record',
  description:
    'HR-admin employee profile for a workforce platform (Kestrel Labs, 140 people): a record-detail frame with a breadcrumbed action header, an identity band (large Avatar, active StatusDot, level/type Tokens, department · office · start-date chips, and a manager-chain chip rail employee → VP → CEO), an HR-visibility Banner marking comp data admin-only with a show/hide-amounts toggle that masks every dollar figure, and a sticky section TabList that jump-scrolls four sections rendered expanded: Job & Comp (level-history timeline with promotion Badges, comp split bar base/bonus/equity with legend and a band-position meter with compa-ratio), Documents (signed-docs Table with status Tokens — signature status only, no signing UI), Devices & Apps (assigned-laptop Card with MDM posture chips and asset tags plus a provisioned-app grid with SSO/SCIM badges), and Time off (balance meters whose used/scheduled/remaining figures reconcile with an upcoming and taken ledger); a 300px end rail pins at-a-glance metadata and the direct-report roster. Choose over org-chart-explorer when the job is reading one person’s full record, not visualizing reporting lines; over time-off-planner when time off is an admin-side balance readout on a profile, not a request composer; over crm-contact-record when the person is an internal employee with comp, devices, and PTO rather than an external sales contact; over fleet-node-status when devices are employee endpoints with MDM posture, not datacenter nodes.',
  category: 'Workforce HR',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Breadcrumbs',
    'Button',
    'Card',
    'Divider',
    'DropdownMenu',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'ProgressBar',
    'StatusDot',
    'TabList',
    'Table',
    'Text',
    'Timestamp',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
