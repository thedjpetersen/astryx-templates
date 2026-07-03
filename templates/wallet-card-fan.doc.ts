import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Wallet Card Fan',
  description:
    'Apple-Wallet-style card fan for five payment/loyalty cards: the cards rest in an overlapping vertical fan showing only their top edges, and tapping one springs it up to the hero slot while the rest compress into a bottom pocket with staggered transition delays that read as one gesture — pure transition-delay math, no animation library. A second tap flips the hero in 3D (rotateY over preserve-3d) to a masked PAN/CVV back with an eye toggle that unmasks fixture numbers, dragging the hero down (pointer events with capture) tucks it back via the same collapse commit as Esc and the Back button, and ↑/↓/F give the whole fan keyboard parity. Beneath the fan a per-card transaction ledger cascades in with per-row entrance offsets and a charges/credits SegmentedControl (merged all-cards feed when nothing is promoted), cards can be frozen and set as default, and a wallet-summary rail (LayoutPanel 320) mirrors balances with per-card jump buttons. Card faces are pure CSS — token gradients, embossed numbers, brand-free SVG network glyphs — with every surface a light-dark() pair, reduced motion swaps slides and flips for fades, and at 375px the fan is the entire above-fold view with the ledger scrolling beneath. Choose over subscription-billing-portal when payment cards are the interactive surface itself rather than static method rows; choose over swipe-triage-stack when cards are promoted and inspected in place, not dispatched off-canvas.',
  category: 'Interaction - Wallet Card Fan',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Kbd',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'SegmentedControl',
    'StackItem',
    'Text',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
