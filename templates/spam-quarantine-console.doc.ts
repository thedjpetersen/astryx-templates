import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Spam Quarantine Console',
  description:
    "Mail-admin quarantine review console: a LayoutHeader stat strip of compact inline chips ('47 quarantined today', '312 auto-blocked', 'false-positive rate 0.4%' — not dashboard Cards) over a filter row (severity SegmentedControl, sender-domain TextInput), then a checkbox-selectable Table of quarantined messages — sender + domain, subject, severity-colored spam-score Badge (9.1 red / 6.4 amber), detection-reason Tokens ('SPF fail', 'Link mismatch', 'Lookalike domain'), received Timestamp. Checking rows summons a floating bottom-center bulk Toolbar ('Release N', 'Block senders', 'Delete' behind an AlertDialog); clicking a row opens a 380px end LayoutPanel with the per-rule score breakdown (rule → points with mini ProgressBars summing to the total), a sender-reputation MetadataList (first seen, messages received, prior releases, Blocked StatusDot state), a bordered plain-text body preview, and Release / Block-domain verdict buttons. Choose over table-bulk-actions when the table is a security review queue whose detail panel explains a SCORE (rule-by-rule breakdown, reputation) and whose actions are release/block verdicts; choose over table-split-pane when the panel opens on demand to justify a verdict rather than living as a permanent record-detail pane; choose over inbox or messaging-shell because the operator is an admin judging other people's mail, not reading or chatting in their own.",
  category: 'Mail - Quarantine Review',
  componentsUsed: [
    'AlertDialog',
    'Badge',
    'Banner',
    'Button',
    'ButtonGroup',
    'CheckboxInput',
    'Divider',
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
    'Token',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
