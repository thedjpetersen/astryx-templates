import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Sudoku with Pencil Marks',
  description:
    'Playable sudoku explorable with a real logic coach: a 9x9 board with heavy 3x3 box borders where selecting a cell layers token tints over its row, column, and box and highlights same-digit cells board-wide, while a duplicate digit gets a red conflict ring the instant it lands. A thumb-sized bottom number pad (5-column grid at 375px) carries a Notes ToggleButton that switches entry between big digits and 3x3 pencil-mark micro-grids, and every pad key dims with a count-remaining readout as its digit completes. Entering a correct big digit auto-erases the now-invalid pencil marks from all peers with a brief fade, and the undo/redo log folds digits, notes, and those auto-erasures into atomic entries surfaced in a move-log List. Coach mode replays a 13-step authored solve path through a restart/step/play transport: each step names its technique (naked single, hidden single, full house), spotlights the involved cells and pencil marks while dimming the rest, and writes its digit on advance — with a swipeable technique caption card above the pad on narrow screens. Puzzle, solution, and step list are static authored fixtures. Choose over quiz/exam surfaces when the interaction is a spatial constraint-logic game with candidate marks and a replayable solve path, not graded questions; over board/kanban surfaces when cells are digits under sudoku rules, not work items.',
  category: 'Play - Sudoku with Pencil Marks',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'List',
    'ProgressBar',
    'Text',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
