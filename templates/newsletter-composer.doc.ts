import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Newsletter Block Composer',
  description:
    "Mailchimp-style newsletter builder: a three-pane editor with a 240px block palette (Heading, Paragraph, Article card, Button, Divider, Footer — click appends to the canvas), a centered 600px 'email body' Card rendering the issue as a stack of selectable blocks (selected block gets a ring plus a floating move-up/move-down/delete IconButton cluster), and a 300px settings inspector whose controlled fields depend on the selected block type and write through to the canvas per keystroke (Heading: text + size SegmentedControl; Button: label/URL TextInputs + alignment control; Article card: title/blurb/link fields). LayoutHeader carries the inline-editable issue name, audience Badge ('2,418 subscribers'), a Desktop/Mobile SegmentedControl that narrows the canvas to 360px, a 'Send test' Button firing a Toast, and a Schedule DropdownMenu. Choose over form-page/form-wizard when the center pane is a WYSIWYG artifact being assembled from blocks with a palette and inspector; choose over slide-deck-viewer because the canvas is editable, not presented. This is the only mail surface where the email itself is the editable document: choose over inbox and messaging-shell when the user is authoring one outbound issue rather than reading or triaging inbound mail, and over table-split-pane when the center pane is a composed artifact, not a record list with a detail pane.",
  category: 'Mail - Newsletter Composer',
  componentsUsed: [
    'Badge',
    'Button',
    'ButtonGroup',
    'Card',
    'Divider',
    'DropdownMenu',
    'EmptyState',
    'Field',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'SegmentedControl',
    'SelectableCard',
    'Selector',
    'StackItem',
    'Text',
    'TextArea',
    'TextInput',
    'Toast',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
