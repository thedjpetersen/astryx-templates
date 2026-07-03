import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Invoice Builder',
  description:
    "Billing-tool invoice editor: a split frame with a 400px form panel (client Selector with a mirrored bill-to summary, invoice number TextInput, issue/due DateInputs, a line-item editor with add/remove rows whose qty × rate amounts recompute per keystroke, tax-rate NumberInput, discount type Selector + value NumberInput, notes TextArea) beside a muted canvas holding a 640px paper Card that renders the invoice as a document — issuer header with a gradient logo mark, bill-to block, items table, and a totals stack (subtotal, discount, tax, amount due) computed from the same fixtures. LayoutHeader carries the invoice title, a Draft/Sent status Badge, a live total Badge, and Download / Send buttons; Send flips the status to Sent, stamps the paper, and fires a Toast. At <=900px an Edit/Preview SegmentedControl swaps a single full-width pane. Choose over form-page and form-side-sheet when the right pane is a live WYSIWYG document computed from the form rather than a second form or record detail; choose over newsletter-composer because the artifact is derived from form fields, not assembled from palette blocks; choose over cart-checkout-flow when the operator is authoring an outbound bill with line-item, tax, and discount math rather than paying for a cart.",
  category: 'Finance - Invoice Builder',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'DateInput',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'NumberInput',
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
