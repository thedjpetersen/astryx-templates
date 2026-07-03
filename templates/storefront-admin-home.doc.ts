import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Storefront Admin Home',
  description:
    "Merchant home for Fernway Goods on the fictional Carthill commerce platform (emerald accent): an app-shell frame with a Carthill header bar (brand mark, admin search, store chip), a 244px nav rail whose Orders count tracks the live queue, and a centered home column — a live-view strip (18 visitors now with a pulsing dot, a 30-minute sessions sparkline, active-cart and checkout counts), a today's-stats row of sales / orders / conversion Stat cards with deltas that reconcile (28 orders ÷ 1,142 sessions = 2.45%) plus a next-payout chip, a dismissible 3-of-5 setup-guide checklist with expandable steps, mark-as-done, and undo-toast dismiss, a working fulfillment queue of 5 orders that advance pick → pack → print-label → fulfilled with reconciled fulfilled-today counts, two low-stock inventory alerts with reorder CTAs that place fixture POs, and a top-products mini table whose units × price rows plus an all-other line sum exactly to the day's $3,847.50. Choose over dashboard-tabbed when the surface is a merchant's operational home — live view, fulfillment queue, setup guide, payouts — rather than a generic analytics dashboard switched by header tabs; choose over order-history-page when the user is the merchant working a pick/pack/label queue, not a buyer browsing their own purchase history; choose over it-inventory-orders when stock and orders are storefront merchandise economics (low-stock reorders, top products, payout schedule), not corporate IT procurement and shipment logistics.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Grid',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'ProgressBar',
    'StackItem',
    'Stat',
    'Table',
    'Text',
    'TextInput',
    'Toast',
    'Token',
    'Tooltip',
    'TreeList',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
