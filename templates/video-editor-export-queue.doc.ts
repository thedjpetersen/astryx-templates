import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Video Editor Export Queue',
  description:
    "NLE delivery/export surface for a documentary project ('Harbor Light'): a header with sequence timecode meta, live queue tally StatusDot, and a primary Add to Queue Button; a scrolling settings column with four SelectableCard export presets (YouTube 4K H.264 45 Mbps, ProRes 422 HQ master, H.264 1080p review, podcast WAV) each carrying a mini scheme-locked footage thumbnail plus codec/bitrate/estimated-size Badges, a Custom settings Collapsible accordion (format/codec/resolution/frame-rate Selectors, CBR/VBR-1/VBR-2 bitrate-mode SegmentedControl, target-bitrate Slider with live size re-estimate), and a destination row (volume Selector with free-space captions, filename TextInput, mono output-path readout, Frame.io upload Switch); a 320px sticky Export summary panel recomputing container/codec/size/encode-time rows from the live settings with a disk-space warning; and the defining region — a 320px bottom render-queue dock whose children-mode Table lists per-job ProgressBars, ETA/throughput readouts, rendering/queued/done/failed/paused status Badges, pause/retry/remove IconButtons, a full-width inline disk-full error row under the failed ProRes job, and queue controls (Pause queue ToggleButton, Clear finished, GPU encode Switch). Choose over video-clip-timeline when the user configures and monitors renders rather than arranges clips on lanes.",
  category: 'Media - Export Render Queue',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'ProgressBar',
    'SegmentedControl',
    'SelectableCard',
    'Selector',
    'Slider',
    'StatusDot',
    'Switch',
    'Table',
    'Text',
    'TextInput',
    'ToggleButton',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
