import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Boarding Pass Wallet Card',
  description:
    "Wallet-style boarding pass card for the fictional airline 'Skylark Air' (navy accent), centered on a muted stage at phone-card width (400px): a scheme-locked sky-gradient airline header strip (bird wordmark glyph, flight SL 214 chip on a navy plate), a route hero with 40px SFO/LIS airport codes around a rotated plane glyph on a dashed track (Departs 18:05 / Arrives 12:50 +1, Tue Jul 14 2026 · 10h 45m nonstop), a passenger/seat/group/terminal/gate/flight fact grid, a navy 'Boards 17:35' chip beside an amber 'Boarding soon' live status strip with a reduced-motion-gated pulsing dot, a perforation divider with punched side notches, and a deterministic 21×21 QR-pattern SVG (seeded by confirmation SKYQ7F4) with a screen-brightness hint; an 'Add to wallet' brand pill CTA toggles to 'Added' below the card. A second captioned specimen beside it freezes the flight-delay variant: red status strip ('Delayed 45 min'), boarding time 17:35 struck through to 18:20, and old gate B22 struck through to a red-highlighted C4. Choose over wallet-card-fan when the subject is one transit/boarding document with route, gate, and scan anatomy — a static pass card in two states — not an interactive payment-card fan with flips and ledgers; choose over ride-trip-status when the traveler holds a printed-time airline pass rather than a live trip tracker.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Button',
    'Heading',
    'HStack',
    'Icon',
    'StackItem',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
