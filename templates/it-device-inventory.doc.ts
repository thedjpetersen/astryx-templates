import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Device Fleet Inventory',
  description:
    'IT/MDM endpoint-posture surface of the Kestrel Labs workforce platform (142 managed laptops and phones across the 140-person company): clickable summary chips (142 devices · 131 encrypted · 6 non-compliant · 5 in transit) scope a sortable multi-select device Table (hostname + model with kind icon and asset tag, assigned-employee avatar with department and office, OS version with outdated/out-of-policy Badges, encryption StatusDot, last check-in relative age with overdue highlighting, compliance Token pill); a non-compliant violation pill row (Encryption off 6 / OS out of policy 3 / Check-in overdue 2) narrows to offending rows; a bulk-action bar queues remote locks and OS-update pushes (rows pick up Lock-pending / Update-queued chips); and a 320px quick panel shows the active device’s serial, warranty with expiry badge, storage ProgressBar, shipment tracking for in-transit rows (including the two new-hire laptops for Ava Lindqvist and Ken Tanaka), per-violation remediation notes, and the assignee card. Choose over fleet-node-status when the fleet is employee endpoints managed by IT — laptops/phones with assignment, encryption, and compliance posture in a roster table — not homogeneous datacenter/server nodes rendered as a density grid.',
  category: 'Workforce IT',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'DropdownMenu',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'ProgressBar',
    'SegmentedControl',
    'StackItem',
    'StatusDot',
    'Table',
    'Text',
    'TextInput',
    'Timestamp',
    'ToggleButton',
    'Token',
    'Toolbar',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
