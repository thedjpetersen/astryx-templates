import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Hosted Checkout & Payment Element',
  description:
    'Stripe-style hosted payment page for fictional merchant Fern & Flint (forest-green accent), processed by fictional PSP Larchpay: a left order-summary column on a brand-tinted wash — merchant mark with sandbox badge, "Pay Fern & Flint" total headline, gradient-thumb line items, a removable FOREST15 promo token, and subtotal/discount/shipping/tax rows that reconcile to the total — beside a right payment element with an express-pay wallet row, email field, tabbed methods (Card with live-formatted number + fictional brand-glyph detection chip, auto-slashed expiry pre-seeded with one inline expired-card error, CVC tooltip, country + ZIP; Wallet; Bank debit with mandate copy), a save-my-info Switch, a validation Banner on Pay, an accent Pay button showing the live total, an encrypted trust footer, and a static processing-state overlay specimen. Choose over cart-checkout-flow when the surface is the PSP-hosted payment page itself — order summary beside a tabbed payment element with card-brand detection and field-validation states — rather than a merchant-side multi-step cart, shipping, and review flow.',
  category: 'Startup Showcase',
  componentsUsed: [
    'Badge',
    'Banner',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Link',
    'SegmentedControl',
    'Selector',
    'Spinner',
    'StackItem',
    'Switch',
    'Text',
    'TextInput',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
