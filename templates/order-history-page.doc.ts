import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Order History Page',
  description:
    "Account-scoped purchase history for one fixture customer with 9 orders across 2025–2026: a header with the page title, signed-in scope line, and a live cart-count Button; lifetime-stats chips (orders, lifetime spend, items, member-since) derived from the same fixture array as the list; a filter bar composing a status Selector, year Selector, and product-search TextInput live (AND semantics) with a Cards/Table SegmentedControl and contextual Clear-filters; two switchable list layouts — detailed order Cards with gradient item thumbnails, per-item Buy-again and Review buttons, a status Badge with delivery-date note, and a Details expansion showing the payment summary plus a mini four-stage progress strip (placed → packed → shipped → delivered; cancelled orders truncate to an error strip), or a compact table whose full-width row buttons expand inline to line items, payment summary, strip, and order actions. View-invoice opens a formatted invoice Dialog (bill-to, line-item rows, totals, payment method, refund line) with a Download-PDF action; Track-package toasts a deep link toward the order-tracking template; Buy-again increments the header cart count with a toast; zero matches render an EmptyState with a clear-filters action; cancelled and returned orders get distinct muted/refund treatments. Layout toggle and per-order expansion persist while filtering. Choose over order-tracking when the surface is the whole purchase history — many orders, filters, two list densities — not one shipment in flight; choose over a generic data table when rows are commerce orders that expand into line items, payment summaries, and fulfillment progress.",
  category: 'Commerce - Order History Page',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Dialog',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'SegmentedControl',
    'Selector',
    'StackItem',
    'Text',
    'TextInput',
    'Timestamp',
    'Toast',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
