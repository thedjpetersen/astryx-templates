import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'E-Signature Envelope Builder',
  description:
    'Four-step e-signature envelope wizard over a centered stepper column: (1) Documents — a page-thumbnail rail beside a full 8.5x11 paper preview of a 3-page agreement with placed-field count Badges; (2) Recipients — a signing-order list whose colored sequence circles renumber live on ChevronUp/ChevronDown reorder, with a Signer/Approver/CC role Selector per row (demoting to CC drops the number, hides that person from the field-assignment picker, and strips their placed fields behind an Undo Toast), plus add-from-bench and remove-with-Undo; (3) Fields — a Signature/Date/Initials palette, recipient assignment picker, and per-recipient placed-count sidebar beside a Page 1/2/3 SegmentedControl preview where clicking the paper places a recipient-color-coded chip at the click point (chips select, show an X, and delete with Undo; a "Place at page center" Button covers keyboard use); (4) Review & send — MetadataList summary plus editable subject/message. Send flips the entire surface into a delivery tracker: per-recipient Sent/Viewed/Signed status rows with fixture timestamps, the first signer in progress, a "Simulate next event" Button that walks sequential routing to a Completed Banner with CC copy delivery, and a two-click Void confirm returning to the editor. Choose over form-wizard when the wizard must build a document-routing artifact (recipients, placed page fields, delivery tracking), not collect form answers; choose over slide-sorter when tiles are click-to-place field chips on paper pages, not reorderable slides.',
  category: 'Business - E-Signature Envelope Builder',
  componentsUsed: [
    'AspectRatio',
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'FormLayout',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'SegmentedControl',
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
