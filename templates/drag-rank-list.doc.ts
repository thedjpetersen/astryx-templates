import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Drag-to-Rank Board',
  description:
    'Drag-to-rank board for sequencing a 10-card launch backlog — the catalog\'s canonical sortable, built from raw pointer events with zero drag library: a header bar ("Launch priority" + live "top-3 load 16/24 pts" counter + Sort by ROI / Reset / Undo Buttons), a vertical rank list where every hand-rolled row shows its live rank number, owner Avatar, and impact/effort mini meters, and a 320px end analysis LayoutPanel (sprint-capacity Selector, top-3 effort-vs-capacity meter, top-3 impact-captured meter, owner load bars, undoable move-history chips) that re-derives from the order after every drop. The lifted card scales up under an elevated light-dark() shadow and follows the pointer 1:1 while siblings FLIP-slide in real time to preview the drop slot; release settles with a soft cubic-bezier overshoot, long-press lifts on touch, and a grab-mode keyboard flow (Space lifts, arrows move, Space drops, Escape cancels) drives the identical FLIP commit path with aria-live spoken-order announcements. A dashed "Top 3 · ships next sprint" cut line splits rank 3 from 4, every committed move lands as an undoable history chip whose reverse move animates through the same FLIP pass, and reduced-motion swaps slides for instant reflow with a token-tinted flash. Choose over kanban-board when the surface is ONE ordered list whose sequence is the decision, not tasks flowing between status columns; choose over slide-sorter when cards carry scores feeding a live analysis rail rather than thumbnails in sections.',
  category: 'Interaction - Drag-to-Rank Board',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutPanel',
    'Selector',
    'StackItem',
    'Text',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
