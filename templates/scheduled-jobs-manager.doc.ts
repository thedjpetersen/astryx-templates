import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Scheduled Jobs Manager',
  description:
    'Cron/interval/one-time automation manager for assistant jobs in a list + detail frame: header count summary ("4 jobs · 3 active · 1 with errors") with a Personal/Workspace SegmentedControl and workspace Selector; job rows carry a StatusDot enable toggle, inline owner/one-shot/silent/"N skipped" Badges, a schedule line with kind icon and next-run copy, an error Tooltip on the amber warning glyph, and a hover delete guarded by AlertDialog; the detail panel shows a MetadataList grid with a mono cron Code chip, an Execution History block with consecutive error/skip counts in destructive text, and an instructions editor with a live autosave FieldStatus (Saving… → Saved) plus a Collapsible version history with restore links. Choose over form-inline-edit when rows are recurring jobs with health state and schedule semantics, and over settings-secrets-env when the objects run on a clock rather than store values.',
  category: 'Settings - Scheduled Jobs',
  componentsUsed: [
    'AlertDialog',
    'Badge',
    'Button',
    'Code',
    'Collapsible',
    'Divider',
    'EmptyState',
    'FieldStatus',
    'IconButton',
    'Layout',
    'Link',
    'MetadataList',
    'SegmentedControl',
    'Selector',
    'Spinner',
    'StatusDot',
    'TextArea',
    'Timestamp',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
