import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Deploy Impact Timeline Scrubber',
  description:
    'Shared-axis deploy forensics explorable: a sticky horizontal event timeline (glyph-coded deploy/config/alert ticks with density-stacked lanes) sits above three linked hand-rolled SVG line charts — latency p95, error rate, traffic RPS — built from one deterministic 97-sample fixture window. A draggable playhead with pointer capture snaps to events and drives the 340px detail panel (diff summary, impact window, exact metric values under the cursor); sweeping a brush window on the track zooms all three charts to that range with animated axis re-ticking, hovering any chart shows a shared crosshair with one synced all-series tooltip, and selecting a deploy shades the region it influenced on every chart. A Play/step transport walks the playhead event-by-event so the cache-rewrite incident story unfolds deterministically, with ToggleButton kind filters and Focus/Reset zoom buttons mirroring every gesture; below 1024px the panel flows under the charts and at 375px the playhead grows a fat touch handle under the sticky timeline. Choose over browser-session-replay when the scrubber drives shared-axis analytic charts, not screenshot frames, and over incident-console when the story is cause-to-effect metric motion, not a triage queue.',
  category: 'Explorables - Deploy Impact Timeline Scrubber',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'List',
    'MetadataList',
    'StatusDot',
    'Text',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
