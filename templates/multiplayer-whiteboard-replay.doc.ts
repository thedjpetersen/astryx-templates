import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Multiplayer Whiteboard Replay',
  description:
    "Figma-style whiteboard replay where four named collaborators' cursors glide along interpolated keyframe paths while frames, sticky notes, connectors, and comment pins appear under their hands — board state is a pure function of (fixture, tick), so the bottom-docked transport (restart / step / play, scrub Slider, 0.5-2x speed SegmentedControl, Space/J/K keys) rewinds cleanly with zero accumulated state. Header presence chips toggle a Follow mode that pans the transformed canvas to track the chosen collaborator, mirrored as a moving viewport rectangle on a corner minimap; colored selection halos mark whatever each collaborator is manipulating, and an event-log LayoutPanel jumps the replay to any recorded beat. The viewer can drag (or arrow-key nudge) their own two notes between ticks, and a scripted remote edit landing on a locally-moved note triggers a conflict flash plus a who-wins Toast. The only template that renders third-party presence on a touchable canvas — choose over browser-session-replay when the story is collaborators working on a spatial board, not screenshot frames; over org-chart-explorer when objects arrive over time via a replay transport rather than living in an editable tree.",
  category: 'Collaboration - Multiplayer Whiteboard Replay',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'LayoutFooter',
    'LayoutPanel',
    'List',
    'SegmentedControl',
    'Slider',
    'Text',
    'Toast',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
