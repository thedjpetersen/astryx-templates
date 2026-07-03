import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Easing Curve Studio',
  description:
    'Motion-design workbench for authoring easing curves: a large SVG cubic-bezier graph with two draggable control handles (pointer capture with 1:1 tracking, guide lines to their anchors, warning-tinted overshoot bands, arrow-key nudges through the identical commit path) beside a preview stage where a sliding card, scaling dot, progress bar, and opacity chip replay the live curve — every element a pure function of the transport tick fed through the easing, so the play/step/scrub transport (0.25x/1x, loop) is exact and reversible. A preset rail draws ease-out-quint, anticipate, overshoot, and Material standard/emphasized as mini curve thumbnails that glide the handles into place; a Compare toggle ghosts a snapshot curve onto the graph and races a ghost card in the stage; a Spring mode swaps in stiffness/damping sliders whose deterministic sampled response draws as a polyline and exports as a CSS linear() string. The export bar always shows the live cubic-bezier() or linear() CSS with copy and a changed-value highlight. Choose over multiplayer-whiteboard-replay when the exhibit is a parametric curve editor driving synthetic previews rather than recorded collaborator playback.',
  category: 'Creative - Easing Curve Studio',
  componentsUsed: [
    'Badge',
    'Card',
    'CheckboxInput',
    'IconButton',
    'Kbd',
    'Layout',
    'SegmentedControl',
    'Slider',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
