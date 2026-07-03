import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Live Workout Session Logger',
  description:
    "Mid-session lifting tracker: a 260px routine rail listing five push-day exercises with completion states and jump-to selection, a center column of exercise blocks — each an editable set table (weight / reps / RPE NumberInputs, done CheckboxInput, remove IconButton) with tappable ghost previous-session cells that backfill last week's numbers, plus add-set and Swap controls — and a 300px stats rail deriving total completed volume, sets-completed ProgressBar, and per-lift projected 1RM via the Epley formula, each with a delta Badge against last session. LayoutHeader pins the session title, a ticking elapsed-time chip, a rest-countdown chip with +30s / Skip that appears whenever a set is checked off, and a Finish button; Swap opens a Dialog of substitute movements and preserves every logged set; Finish swaps the center for a summary Card diffing volume and per-lift bests against last session, with Resume as the undo. At <=900px both rails leave the frame behind a Workout/Stats SegmentedControl and the routine becomes a chip strip. Choose over form-inline-edit when every row is an always-editable logging grid rather than display rows that swap into editors; choose over invoice-builder when the derived pane is a live stats rail, not a WYSIWYG paper document; choose over habit/streak dashboards when the surface is one in-progress timed session with per-set state.",
  category: 'Lifestyle - Live Workout Session Logger',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CheckboxInput',
    'Dialog',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'NumberInput',
    'ProgressBar',
    'SegmentedControl',
    'StackItem',
    'Text',
    'Toast',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
