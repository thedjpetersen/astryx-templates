import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Live Auction Room',
  description:
    "Live auction lot page on a replayable deterministic bid tape: a LayoutHeader with the 'Kestrel & Gray Evening Sale' crumb, Lot 217 title, LIVE/SOLD Badge, and EyeIcon watcher count; a lot hero with a scheme-locked SVG painting, catalog Tokens, a hero price that tweens on every ratchet, and a countdown chip that flips to urgency red inside the 10-tick anti-snipe window and pulses '+15s anti-snipe' Tokens on extensions (the countdown freezes on pause because the clock IS the tick counter); a personal-state strip flipping between highest-bidder green and an outbid red strip with a one-tap rebid; bid controls with a ZapIcon quick bid at the ask, a +/- jump-bid stepper, and a BotIcon proxy card whose armed max auto-counters incoming bids as visible 'Proxy for you' ladder rows until exhausted; a per-bidder-colored bid-history ladder plus a presence row of paddle avatars and watchers joining on scripted ticks in the 320px LayoutPanel; a going-once / going-twice / hammer three-tick finale ending in a celebratory confetti-free SOLD panel that knows whether you won; and a LayoutFooter transport (restart / step / play / step, scrub Slider, 0.5-2x SegmentedControl) — auction state is a pure fold of the tape plus your recorded bids, so scrubbing backward un-bids cleanly. At <=640px a sticky bid bar with a quick-bid stepper docks above the transport. Choose over live-event-chat when the live surface is a contested price state machine rather than message flow, and over subscription-billing-portal when money moves by competitive bidding, not plan management.",
  category: 'Collaboration - Live Auction Room',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'List',
    'SegmentedControl',
    'Slider',
    'Text',
    'ToggleButton',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
