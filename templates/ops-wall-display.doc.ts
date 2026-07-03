import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'NOC Wall Display',
  description:
    'Kiosk-grade network-operations wall meant to be read from across a room, running on a deterministic 48-tick fixture tape: three oversized metric panels (latency p95, error rate, throughput) whose numerals tween between tick values over hand-rolled EKG heartbeat SVG polylines that advance one sample per tick; a grid of 12 pulsing region status cells (pulse keyframes gated by play state so Pause truly freezes the room) with a tap-to-pin region detail strip; a spotlight panel auto-cycling Open incidents / Slowest regions / Change log every 6 ticks behind a visible progress arc with prev/next and hold Pin controls; a scrolling incident-ticker marquee along the bottom with a Hold ToggleButton; and a full-bleed SEV1 takeover banner that slams the wall red when the fixture stream crosses its threshold tick, collapsing to an acknowledged alarm strip. Transport = restart / step back / Play-Pause / step forward / scrub Slider, and the fixture wall clock is base time + tick × 5s — never Date.now. Container queries reflow 3-across kiosk to a single-column 375px glance view, and the dark-first palette resolves light via light-dark() trace pairs. Choose over operations-dashboard or fleet-node-status when the surface is an ambient large-format display for passive reading — auto-cycling panels, heartbeat motion, and an alarm takeover state — not an interactive console.',
  category: 'Collaboration - NOC Wall Display',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'Slider',
    'StatusDot',
    'Text',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
