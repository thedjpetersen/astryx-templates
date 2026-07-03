import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Story Progress Viewer',
  description:
    "Full-bleed stories surface over deterministic fixtures (four authors, sixteen gradient-composition frames — token-gradient SVG scenes, big-type quote cards, and votable two-option polls): a phone-aspect 9:16 stage where segmented progress bars fill via a CSS keyframe scaled to each frame's fixture duration and animationend chains the next frame (no Date.now); tapping the left/right thirds steps frames, tapping the middle toggles play, press-and-hold pauses by suspending animation-play-state while the chrome fades, and crossing an author boundary runs a measured perspective cube-turn between story groups. An author rail of conic-gradient avatar rings (unseen-segment indicators) sits beside the stage on desktop and beneath it at <=640px, and finishing every story lands on a recap grid with per-frame replay tiles, per-author Replay buttons, and a Watch-again reset. Space / arrow keys mirror every gesture and a Prev · Play/Pause · Next transport drives the identical commit path; reduced motion swaps the cube for a crossfade and steps the progress fill discretely. Choose over live-stream-viewer when the surface is timed, segmented, auto-advancing story groups rather than one continuous stream with chat.",
  category: 'Interaction - Story Progress Viewer',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'Text',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
