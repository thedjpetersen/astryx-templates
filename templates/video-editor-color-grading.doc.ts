import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Video Editor Color Grading Suite',
  description:
    "DaVinci-style color grading suite for a documentary reel ('Harbor Light'): a 248px left shot bin of gradient still thumbnails with status Badges plus a reference-still gallery and Shot Match button, a center viewer (16:9 scheme-locked stage with LUT tint overlay, reference wipe split + wipe Slider, grade-version chip row with a clone-to-new-version '+', and a LUT browser strip of preview swatches); and the defining regions — a 336px right scopes panel (SVG luma waveform with IRE graticule, SVG vectorscope with R/Mg/B/Cy/G/Yl 75% targets and skin-tone I-line, trace-intensity Slider, YRGB/Hue-Sat curves thumbnail Card) and a 296px bottom wheels dock with three trackball wheels (lift/gamma/gain) — conic hue rings, clickable trackball faces with crosshair and offset dot, master value Sliders, live signed RGB offset readouts, per-wheel reset — beside temp/tint/contrast/saturation trim sliders, all deriving from one Grade object so scopes, curves, readouts, and the viewer tint move together. The only trackball-and-scopes surface — choose over video-clip-timeline when the user grades shots on a color page rather than arranges clips on lanes, and over video-watch-page when the surface is a finishing tool, not playback.",
  category: 'Media - Color Grading Suite',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
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
