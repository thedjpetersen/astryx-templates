import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Doc Sharing & Publish Panel',
  description:
    "Google-Docs-style sharing surface: a 560px share dialog Card centered over a dimmed, aria-hidden document preview (static styled 'Atlas Q3 Launch Plan' paper sheet behind an Overlay scrim, re-anchored to the page scheme via MediaTheme). The dialog carries a two-state TabList — 'Share': an invite composer (email TextInput + role Selector, invalid-address FieldStatus, notify-people CheckboxInput revealing a message TextArea with Send/Cancel), a 'People with access' list of Avatar rows with per-row viewer/commenter/editor Selectors that include a Remove-access item, an Owner row and a your-own-row lock, a Pending-invite Badge chip with an external-share warning Banner, a 'Groups with access' section with member counts, a general-access Selector with icon states (Restricted / Kestrel Labs / Anyone with the link) plus a link-role Selector, and a monospace copy-link row with a Copied state; 'Publish': a published-to-web Switch whose off-flip confirms through an AlertDialog, published URL row, an embed-snippet CodeBlock (isWrapped with a word-break override), an auto-republish Switch, and an access-requests queue with approve/deny Buttons that feed approvals straight into the Share tab's people list (the Publish tab badge and footer counts stay in sync). Dismissing the dialog drops the scrim and the doc chrome's Share button reopens it; at <=720px the dialog becomes a full-bleed sheet. Choose over doc-suggestion-review when the surface is the sharing/permissions/publish dialog over a static doc preview, not tracked-changes triage; choose over mail-compose when the overlay manages access roles and public links rather than composing an outgoing message; choose over form-modal when the dialog is a tabbed access-control panel with live people lists, not a generic form.",
  category: 'Office - Doc Sharing',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'CheckboxInput',
    'CodeBlock',
    'Divider',
    'FieldStatus',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Overlay',
    'Selector',
    'StackItem',
    'Switch',
    'Tab',
    'TabList',
    'Text',
    'TextArea',
    'TextInput',
    'Timestamp',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
