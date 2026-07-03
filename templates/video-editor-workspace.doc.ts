import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'NLE Editing Workspace',
  description:
    "Flagship NLE editing workspace for the documentary 'Harbor Light': a project header (title, Documentary + Auto-saved Badges, sequence duration/fps readout, primary Export Button), a slim 56px left tool rail of vertical IconButtons with Tooltip+Kbd shortcuts (select, razor SplitIcon, slip MoveHorizontalIcon, zoom), a center program monitor (16:9 scheme-locked dark gradient stage labeled 'Program: harbor-light_rough-cut_v7' with safe-area frame, active-clip and V2-overlay readout), a transport Toolbar (skip to start/end, frame step, Play/Pause, mono 00:00:21:12 timecode), and a selected-clip mini inspector strip (track Badge, In/Out/Duration timecodes, opacity Slider, speed NumberInput, gain Slider); the defining region is a fixed 320px bottom timeline dock where a tick-labeled ruler with colored sequence markers, a snapping full-height red playhead (pulls to clip boundaries and markers within 0.75s), and four track lanes (V2 overlays, V1 picture, A1 dialog, A2 music) share one px-per-second scale — clip blocks carry ellipsized labels and accent trim handles on selection, audio lanes render deterministic CSS waveform bars, and 148px track headers hold lock plus video-visibility EyeIcon or audio mute/solo HeadphonesIcon ToggleButtons beside a snap MagnetIcon and 50/100/200% zoom SegmentedControl. The full editing cockpit — choose over video-clip-timeline when the brief needs the complete workspace (per-track solo/visibility, trim handles, sequence markers, inline inspector strip) rather than a side properties panel, and over subtitle-cue-editor when media clips live on lanes instead of caption rows.",
  category: 'Media - NLE Editing Workspace',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'NumberInput',
    'SegmentedControl',
    'Slider',
    'Text',
    'ToggleButton',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
