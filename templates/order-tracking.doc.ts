import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Order Tracking',
  description:
    "Post-purchase order tracking page for one shipment: a header with the order number, an 'Out for delivery' Badge, placed-date note, and copy-tracking / carrier-site Buttons; a centered tracking column stacking a five-stage progress stepper (placed → packed → shipped → out for delivery → delivered, the current stage pulsing with an 'Arriving today by 8:00 PM' ETA line), a schematic route strip drawing origin warehouse, two hubs, and destination home as styled nodes on a progress rail with a truck marker riding the active leg (no real map), a shipment-facts MetadataList (carrier, service, tracking, weight, dates), and a carrier event timeline of rail-marker scans with Timestamps and locations that collapses older entries behind a 'Show 6 earlier events' toggle; a 340px end panel lists line items with gradient placeholder art and order totals, the delivery address with courier instructions, and support actions — 'Report an issue' opens a Dialog with a RadioList reason and details TextArea, 'Return items' switches the item list into CheckboxInput selection with a Start return call-to-action, both confirming with success Banners. Choose over deployment-detail when the thing in flight is a physical parcel (stages, hubs, scans), not a build; choose over timeline when the event feed is subordinate to a status stepper and route schematic rather than the whole page.",
  category: 'Commerce - Order Tracking',
  componentsUsed: [
    'Badge',
    'Banner',
    'Button',
    'Card',
    'CheckboxInput',
    'Dialog',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutPanel',
    'MetadataList',
    'RadioList',
    'StackItem',
    'StatusDot',
    'Text',
    'TextArea',
    'Timestamp',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
