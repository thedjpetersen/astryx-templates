import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Video Editor Titles Designer',
  description:
    "Titles & Graphics designer surface for an NLE (the Video Studio suite's typography station): a 248px left text-layers panel (per-layer kind glyph, live text preview, EyeIcon visibility and LockIcon ToggleButtons), a center 16:9 scheme-locked dark canvas frozen on program frame 00:04:12:10 with dashed title/action safe-area guide rectangles, click-to-select text layers plotted into a 3x3 anchor grid with container-query font scaling, and a guides/backdrop Toolbar (Frame/Checker/Black SegmentedControl); a 320px right inspector carrying the full type stack — layer text TextInput, font family Selector, size/tracking/leading Sliders, weight SegmentedControl, fill/stroke/shadow sections with literal color swatch grids plus Switch enables and NumberInput steppers, a 3x3 alignment anchor grid, and animation preset chips (None/Fade/Slide/Typewriter) with In/Out duration NumberInputs feeding a labeled In-Hold-Out timing bar; and the defining region — a fixed 216px bottom lower-thirds gallery dock of six CSS-mocked template cards (Interview Classic, Line Accent, Boxed Caption, …) with an Applied badge. Choose over video-clip-timeline when the user designs on-screen text and graphics rather than arranges clips on lanes, and over subtitle-cue-editor when styling display titles instead of timed dialogue cues.",
  category: 'Media - Titles & Graphics Designer',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'NumberInput',
    'SegmentedControl',
    'Selector',
    'Slider',
    'Switch',
    'Text',
    'TextInput',
    'ToggleButton',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
