import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Swipe Triage Stack',
  description:
    'Gesture-quality swipe triage stack for cleaning up 24 screenshot candidates: the top card follows the pointer 1:1 (raw pointer events with capture, translate + proportional rotate) while KEEP/DISCARD stamps tint progressively toward the ±110px threshold and two peeked cards scale out beneath; releasing inside the threshold springs back with a cubic-bezier overshoot, releasing beyond it flings the card off-canvas along its exit vector and promotes the stack with a depth-staggered settle — no drag library. Keep/Later/Discard Buttons and the ← ↓ → arrow keys drive the identical commit path (same fling, same pure reducer), every decision lands in an undoable history rail (LayoutPanel 300) with live kept/discarded tallies and a reclaimed-MB counter, undo replays the card back along its exit vector in reverse, and emptying the stack renders a summary Card with a kept/discarded breakdown bar plus re-check-discarded and restart rounds. Verdict tints are light-dark() pairs over --color tokens, reduced motion swaps flings and snap-backs for opacity crossfades, and at 375px the stack owns the viewport with the tally collapsed into the header. Choose over flashcard-review-session when items are dispatched by a spatial keep-or-toss verdict rather than graded and re-queued; choose over gallery grids when the surface is a one-item-at-a-time triage loop with release physics.',
  category: 'Interaction - Swipe Triage Stack',
  componentsUsed: [
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
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'ProgressBar',
    'StackItem',
    'Text',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
