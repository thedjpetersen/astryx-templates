import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Email Compose Window',
  description:
    "Gmail-style email compose window: a 560px compose Card docked bottom-right over a dimmed, non-interactive inbox backdrop (muted placeholder rows behind an Overlay scrim). The window has a title bar with minimize/expand/close IconButtons (tri-state: docked, 48px minimized bar, centered 800px expanded), a To field built on Tokenizer with recipient chips — including one invalid-address Token in error state with a FieldStatus message and a group-list chip with a member-count Tooltip — Cc/Bcc reveal Links that add rows, a subject TextInput, a formatting Toolbar of pressed-state ToggleButtons (bold, italic, bulleted list, link), a controlled body TextArea, attachment rows with one mid-upload ProgressBar fixed at 64%, and a footer with a Send + schedule-send split (ButtonGroup + DropdownMenu of preset times whose 'Pick date & time…' item opens a Popover holding a Calendar pinned to July 2026 and a TimeInput), a scheduled Badge that flips the Send label to 'Schedule send', a 'Draft saved 10:42 AM' Timestamp, and a discard action behind an AlertDialog. Choose over inbox/table-split-pane when the surface IS the outgoing-message editor (chips, toolbar, attachments, scheduling) rather than a triage or reading frame; choose over messaging-shell when the draft is a discrete email with recipients, subject, and attachments, not a live chat stream; choose over form-modal when the form is a floating docked mail composer with rich-text affordances, not a generic centered dialog form.",
  category: 'Mail - Compose',
  componentsUsed: [
    'AlertDialog',
    'Badge',
    'Button',
    'ButtonGroup',
    'Calendar',
    'Card',
    'Divider',
    'DropdownMenu',
    'Field',
    'FieldStatus',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Link',
    'Overlay',
    'Popover',
    'ProgressBar',
    'StackItem',
    'Text',
    'TextArea',
    'TextInput',
    'TimeInput',
    'Timestamp',
    'ToggleButton',
    'Token',
    'Tokenizer',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
