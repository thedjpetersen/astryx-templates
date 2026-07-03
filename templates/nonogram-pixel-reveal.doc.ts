import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Nonogram Picture Logic',
  description:
    'A 10x10 picross puzzle whose row and column clues are derived at module scope from a fixture pixel-art fox, so the board, its clue ledges, the scripted hints, and the share card can never drift apart. Drag painting uses pointer capture with the first cell of each stroke deciding fill-vs-erase (plus tap and full keyboard paths through the identical commit logic), and every completed stroke is one undoable entry in a stroke log. Clue groups live-validate — satisfied runs dim to a muted token, contradictions turn red — while a three-heart mistakes budget (checked against the solution on fill, never on cross) gives stakes; a hint button fills one authored teaching cell with a spotlight explaining which clue forces it. Completion blooms filled cells row-by-row from abstract squares into the fox’s warm light-dark() palette, then shows time, mistakes, and an inline-SVG share-card silhouette. Choose over habit-streak-tracker when the grid encodes a hidden picture solved by run-length deduction rather than a completion calendar; choose over region-tile-cartogram when cells are puzzle state, not geographic data.',
  category: 'Play - Nonogram Picture Logic',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'SegmentedControl',
    'Stat',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
