import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Keyframe Curve Editor',
  description:
    "Property-animation graph editor for one NLE clip ('SC04_drone_harbor_approach.mov' from the Harbor Light documentary fine cut): a header with project title, Saved Badge, timeline zoom, and a primary Apply Button; a transport Toolbar (StepBack/Play/StepForward, mono clip-local timecode, keyframe-snap MagnetIcon, 50/100/200% zoom SegmentedControl); the defining region — a property-lane stack whose fixed 210px headers carry per-property color dots, live evaluated value readouts, animate ToggleButtons, and add-keyframe IconButtons beside a horizontally scrolling canvas where a tick-labeled seconds ruler, scrub Slider, diamond keyframe buttons on collapsed lanes (Position X/Y, Scale, Rotation, Opacity), and a full-height red playhead all share one px-per-second scale; one expanded lane renders an SVG bezier value curve with labeled value gridlines, hold-step and linear segments, draggable out/in handles on the selected segment, plus a sticky-left cluster of Linear/Bezier/Hold interpolation pills and six easing preset chips drawn as mini curve thumbnails; a 300px keyframe inspector (frame/value NumberInputs, handle influence Sliders, delete) and a status footer with keyframe totals. Choose over video-clip-timeline when the user animates properties of a single clip rather than arranging clips on tracks, and over bezier-easing-studio when curves map real property values across clip time instead of a normalized easing square.",
  category: 'Media - Keyframe Curve Editor',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
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
