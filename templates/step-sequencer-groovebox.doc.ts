import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Step Sequencer Groovebox',
  description:
    "Drum-machine surface over deterministic fixtures (eight instruments keyed to categorical color tokens, four seeded 16-step patterns A–D, a fixed A-B-B-C chain): an 8×16 pad grid where tapping a pad cycles off/soft/accent and long-pressing (or Shift+Enter on a focused pad) opens a velocity popover with a 0–127 slider and Soft/Accent/Clear shortcuts. The whole UI is a pure function of one tick counter — play advances it via a rAF accumulator, the Step button advances one column per tap, and the cursor column, per-pad hit flashes (scale/glow keyed off tick % 16 === column), chain position, and bar readout all derive from that single number, no content timers or randomness. The transport carries play/pause, step-forward, return-to-start, a ±4 BPM tempo readout, and a swing slider that warps step durations and visually skews even-numbered columns; per-row mute/solo LEDs ghost and isolate rows via light-dark() token pairs; a pattern-chain lane glows and fills the active slot as the cursor wraps, with arm-then-tap slot swaps settling via FLIP. At 375px instrument labels collapse to an icon rail and the grid scrolls horizontally with scroll-snap per 4-step bar, auto-scrolling to keep the cursor in view during play. Choose over wheel-picker-scheduler when the surface is a rhythmic on/off matrix driven by a transport rather than a value composer.",
  category: 'Creative - Step Sequencer Groovebox',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'Slider',
    'Text',
    'ToggleButton',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
