import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Brainstorm Whiteboard',
  description:
    "LIVE first-person infinite-canvas brainstorm — the Kestrel Labs Atlas Q3 'Beta Feedback Themes' session on a pannable, zoomable dotted board: three color-coded theme clusters with labeled frames whose count chips reconcile with the 14 sticky notes inside, a dashed cluster-to-cluster arrow with a label chip, two name-flagged live cursors (Sofia, Jonah), one focus-ringed sticky mid-edit with a blinking caret and 'Sofia is editing' flag, and a comment pin whose open thread popover accepts replies. A floating toolbar rail arms real select / sticky / text / connector / frame tools (V-S-T-C-F keys) that place objects, link two picked stickies, drag or arrow-key nudge notes, and announce every mutation through an aria-live region; floating zoom controls carry a % readout plus fit-to-board, a corner minimap mirrors the camera as a viewport rectangle, and the header holds a Live StatusDot, contributor facepile with overflow, and a Share button that raises a link-copied Toast. Choose over multiplayer-whiteboard-replay when the surface is the viewer's own present-tense editing session — no transport, scrubber, tick-derived state, or scripted remote edits; over kanban-board when ideas live at freeform spatial positions in theme clusters rather than as cards in workflow-state columns; over review-cycle-calibration when the draggable objects are ideas on an open canvas, not employees placed in a rated 9-box matrix.",
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Button',
    'Heading',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'StatusDot',
    'Text',
    'TextInput',
    'Toast',
    'ToggleButton',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
