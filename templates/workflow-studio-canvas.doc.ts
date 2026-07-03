import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Workflow Studio (Automation Canvas)',
  description:
    'Rippling-style workforce-automation studio for a multi-step employee-lifecycle workflow: a left palette rail of trigger/condition/action node types grouped by pillar app (HR, IT, Finance, Comms) with a search filter; a pannable, zoomable canvas (SVG bezier edge layer under absolutely positioned node tiles) rendering a live "Engineering day-one setup" workflow — employee-starts trigger, department condition with labeled Yes/No branches, a fan-out of four action nodes (GitHub account, Slack channels, laptop order, buddy lunch), a dashed parallel badge-provisioning branch, and a join node — with typed connector labels, per-node 30-day run stats, and a red validation badge on the misconfigured laptop node; a right config panel for the selected node (editable Fields with an error FieldStatus, run-as/test-run controls, node MetadataList); zoom controls plus an issues chip in the canvas toolbar; and a pinned run-history strip of the last five runs (success/failed/running/skipped, failed run deep-links to its failing node). Publish stays disabled until the validation error is fixed inline. Choose over automation-rule-builder when the job is orchestrating a multi-step workflow on a node graph with branches, run history, and per-node config — not editing a single rule’s condition list in a form panel.',
  category: 'Workforce Platform',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Divider',
    'Field',
    'FieldStatus',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'Selector',
    'StatusDot',
    'Switch',
    'Text',
    'TextArea',
    'TextInput',
    'Timestamp',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
