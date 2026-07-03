import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Endpoint Security Policies',
  description:
    'IT-admin endpoint-policy center of the Kestrel Labs workforce platform (142 managed devices, 137 in policy scope): five clickable policy cards (Disk Encryption, Screen Lock, OS Updates, EDR Required, USB Storage) each with an enforcement pill (Enforce / Warn / Report), a coverage ProgressBar (e.g. 131 of 137 compliant), and affected-platform icons; a department × policy compliance matrix (six canonical departments summing to 140 people / 137 devices) whose percent cells drill into a 340px policy inspector with an enforcement SegmentedControl, rule parameters, and the department-scoped flagged-device list; an exceptions Table (device, policy, reason, expiry with approver) with one expired grant rendered red and revoke actions; a draft-change Banner (Screen Lock max idle 10 min → 5 min, 34 devices affected) with schedule-rollout and discard actions; and an axis-labelled 8-week checks-passing bar chart with enforcement-change event markers. Choose over it-device-inventory when the job is defining and enforcing fleet-wide policy rules — enforcement levels, coverage rollups, exceptions, and rollout scheduling — not browsing or remediating individual device rows; choose over automation-rule-builder when rules are a policy catalog with compliance telemetry, not a condition-action editor.',
  category: 'Workforce IT',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'MetadataList',
    'ProgressBar',
    'SegmentedControl',
    'StackItem',
    'StatusDot',
    'Table',
    'Text',
    'Timestamp',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
