import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Video Clip Timeline Editor',
  description:
    "NLE-style video editor surface: a slim 56px left tool rail of vertical IconButtons with Tooltip+Kbd shortcuts (select, razor SplitIcon, text TypeIcon, zoom), a center program monitor (16:9 gradient stage labeled 'Program: spring-launch-cut_v4', StepBack/Play/StepForward transport with a mono 00:00:12:08 timecode), a 300px collapsible properties panel bound to the selected clip (source in/out, opacity Slider, speed NumberInput, gain Slider, LockIcon toggle); and the defining region — a fixed 280px bottom timeline dock with a tick-labeled ruler, a full-height red playhead, and four track lanes (V2 titles, V1 main video, A1 dialog, A2 music) whose colored clip blocks are width-proportional to fixed durations, audio lanes filled with deterministic CSS waveform bars, lane headers carrying mute/lock ToggleButtons, plus snap MagnetIcon and 50/100/200% zoom SegmentedControl that recomputes every width from one px-per-second scale. The only multi-track editing surface — choose over subtitle-cue-editor when clips live on lanes, and over browser-session-replay when the user arranges media rather than replays captured frames.",
  category: 'Media - Clip Timeline Editor',
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
