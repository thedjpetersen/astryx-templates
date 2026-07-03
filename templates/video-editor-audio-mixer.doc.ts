import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Audio Mixer Console',
  description:
    "DAW-style audio mixer console for a video editor working the 'Harbor Light — Mix v3' documentary session: a session header (Saved Badge, 48 kHz · 24-bit readout, mono/dim monitor ToggleButtons, primary Bounce Mix Button) above the defining region — a horizontally scrolling console of eight 108px channel strips grouped under Dialogue/Music/Effects/Ambience bus captions plus four bus strips, every strip stacking three plugin insert slots with bypass dots, a drag-to-set rotary pan knob with L/C/R readout, a compact automation-mode Selector (Off/Read/Touch/Latch/Write), and a scheme-locked dark fader well where a 160px vertical Slider fader sits between a dB scale column and a stereo green/amber/red gradient level meter with peak tick and clip LED, finished with mute/solo/arm ToggleButtons and a mono dB readout — plus a fixed 148px master strip pinned right of the scroll with a −1.0 dBFS limiter LED and live gain-reduction readout, a 300px collapsible channel inspector (insert chain bypass Switches, Harbor Verb send Slider, automation Selector), and a footer status bar with transport, SMPTE timecode, a SOLO-active warning Badge, and DSP load. Solo/mute routing, pan law, and the limiter GR all recompute deterministically from fader state. Choose over video-clip-timeline when the user balances channel and bus levels on faders rather than arranging clips on lanes, and over album-tracklist-player when the surface is a mixing console, not media playback.",
  category: 'Media - Audio Mixer Console',
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
    'Selector',
    'Slider',
    'StatusDot',
    'Switch',
    'Text',
    'ToggleButton',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
