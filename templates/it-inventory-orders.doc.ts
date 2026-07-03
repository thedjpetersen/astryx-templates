import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Hardware Orders & Logistics',
  description:
    'IT-procurement logistics console for a workforce platform (Kestrel Labs, 140 people; signed-in admin Tom Okonkwo): a stock-on-hand card grid (MacBook Pro 14″/16″, Dell XPS 15, iPhone 16, 27″ monitors, TS4 docks) where low-stock tiles carry an amber tint plus a "+N on order" chip pointing at the replenishing PO; a filterable, sortable purchase-order Table (PO number, items with requester, vendor monogram chip, cost, ETA, ordered/shipped/received status pill) whose working Receive action moves cost from committed to spent, bumps stock on hand, and flips the matching tracker row to Delivered; an inbound-shipment tracker with carrier + tracking chips, last-scan lines, route-progress meters, and Return-flagged offboarding devices; and a 360px logistics panel stacking the Q3 procurement-budget meter (spent/committed/remaining derived live from the PO rows), the new-hire allocation queue (Ava Lindqvist’s kit in transit, Ken Tanaka’s remainder reserved behind an amber ship-by chip with a print-label action), and the returns & refurb queue (three offboarding devices with A/B/C condition grades and dispositions). Choose over it-device-inventory when the job is the procurement pipeline — stock counts, purchase orders, vendor shipments, and budget — rather than the posture of already-deployed endpoints; choose over order-tracking when many corporate shipments live in one admin tracker instead of a single consumer parcel page; choose over budget-tracker because the money here is a corporate quarterly procurement meter reconciled against POs, not personal budgeting.',
  category: 'Workforce IT',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'MoreMenu',
    'ProgressBar',
    'SegmentedControl',
    'StackItem',
    'Table',
    'Text',
    'TextInput',
    'Timestamp',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
