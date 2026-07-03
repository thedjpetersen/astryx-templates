import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Cart & Checkout',
  description:
    'Four-step commerce checkout: cart review with qty steppers, remove, and a working promo-code field; shipping address with saved SelectableCards, a new-address form, and a shipping-method RadioList; payment method with saved cards and a billing toggle; order review with Edit links and a Place order confirmation state. Numbered stepper header and a persistent order-summary rail with live subtotal/promo/shipping/tax totals.',
  category: 'Commerce - Cart & Checkout',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'FieldStatus',
    'FormLayout',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'Link',
    'MetadataList',
    'RadioList',
    'SelectableCard',
    'Selector',
    'Switch',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
