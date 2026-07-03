import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Video Editor Clip Inspector',
  description:
    "NLE clip-inspector surface for the 'Harbor Light' documentary sequence: a 280px left clip-list panel grouped by track (tint chip, mono filename, in/out SMPTE timecodes, modified dot, selection ring), a center inspector bound to the selected clip — title row with enable Switch, then a Video | Speed | Audio TabList whose Video tab carries Transform NumberInput fields with drag-to-scrub dotted labels (Position X/Y, Scale, Rotation, Anchor X/Y), Crop L/R/T/B Sliders, a blend-mode Selector and opacity Slider; the Speed tab pairs reciprocal Speed %/Duration fields with reverse and ramp Switches, a time-interpolation Selector, and an axis-labeled SVG speed-ramp mini graph; the Audio tab holds a gain Slider, per-channel output-route Selectors over static dBFS peak meters, and a mute Switch — plus a 320px right panel with a scheme-locked dark program-monitor thumbnail that live-applies transform/crop/opacity and a source metadata Card (codec, container, color space, resolution, start timecode, camera). Header offers copy/paste-attributes and reset Buttons. Choose over video-clip-timeline when the user tunes one selected clip's transform/speed/audio attributes rather than arranging clips on lanes.",
  category: 'Media - Clip Inspector',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'Layout',
    'NumberInput',
    'Selector',
    'Slider',
    'Switch',
    'TabList',
    'Text',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
