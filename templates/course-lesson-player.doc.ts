import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Course Lesson Player',
  description:
    "Structured course player for a 5-module, 24-lesson TypeScript curriculum seeded ~40% complete: a 300px curriculum LayoutPanel with collapsible modules (per-module ProgressBars, lesson rows carrying completion checkmarks and duration chips, and a locked fifth module that unlocks live when 16 lessons are complete); a center lesson stage — 16:9 gradient placeholder with a code-slide vignette, play overlay, scrub Slider, and tabular timecode — that swaps to an inline 3-question quiz checkpoint with immediate right/wrong feedback which blocks Next until all are correct; prev/next navigation with an autoplay-next Switch and a Mark complete Button that recomputes module bars and the header's overall percentage; a Transcript / Lesson notes TabList below the stage with seek-on-timestamp transcript lines; and a toggleable 320px personal-notes panel where adding a note stamps the current playback position, timestamp chips seek the player, and notes list per lesson (folding into a third 'My notes' Tab under 1280px, with a single-pane curriculum flip under 880px). Choose over video-watch-page for curriculum-driven learning instead of lean-back entertainment, and over flashcard-review-session when lessons and progress gating matter more than spaced-repetition drills.",
  category: 'Learning - Course Lesson Player',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutHeader',
    'LayoutPanel',
    'ProgressBar',
    'Slider',
    'Switch',
    'TabList',
    'Text',
    'TextArea',
    'ToggleButton',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
