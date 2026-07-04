import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Ride Trip Status Card',
  description:
    "Phone-width live-trip status card for the fictional ride-hailing startup Swiftly (charcoal + lime accent), rendered as two captioned specimens on a centered stage. Specimen 01 (en-route): a scheme-locked charcoal night-map strip with a lime route polyline, pulsing car dot, pickup pin, and '3 min away' ETA chip; a 'Marco is 3 min away' header with the silver Honda Civic and a charcoal mono plate chip (7XKD 249); a driver row (Avatar, 4.92 star, 2,340 trips, message); a four-step trip stepper (requested → en route → pickup → destination) whose active leg pulses; pickup/destination address rows on a dot-to-pin rail with an inline pickup-note edit affordance; a safety toolkit of icon pills (share trip toggles 'Sharing live', call, and an Emergency pill guarded by a destructive AlertDialog); and a $18.40 estimated-fare + 'Visa ··4821' payment-chip footer. Specimen 02 (arrived): the same card at the curb with a license-plate verification hero — an oversized charcoal plate block, 'match the plate' coaching copy, and a full-width lime confirm button that flips to a 'Verified — trip started' Badge. Choose over order-tracking when the thing in motion is a rider's own vehicle trip — driver identity, plate verification, and safety actions on a small card — not a parcel's multi-hub shipment page; choose over fleet-dispatch-board when the viewpoint is one rider watching one live trip, not an operator assigning stops to driver lanes; choose over bottom-sheet-snap-explorer when the map is a passive status strip inside a card, not a draggable map-exploration surface.",
  category: 'Startup Showcase',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'StackItem',
    'Text',
    'TextInput',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
