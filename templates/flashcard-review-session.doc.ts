import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Flashcard Review Session',
  description:
    'Spaced-repetition flashcard review session: a header strip with live session progress ("12 of 40" + ProgressBar), new/review split Badges, a running accuracy Badge, and an undo IconButton; a 260px left deck rail of SelectableCard deck tiles (due-count Badge, new/review split, per-deck completion bar) that scope the queue plus an "Up next" peek list; and a centered stage with a large flippable card — Spanish front (tap or Space), translation + example-sentence back — and four grade Buttons (Again/Hard/Good/Easy, keys 1–4) revealed only after the flip, each labeled with its per-card next-review interval. Grading dequeues the card except Again, which visibly reinserts it a few positions back; undo reverses any grade including reinsertions, and an end-of-session summary Card shows a stacked per-grade breakdown bar with a "Review lapsed again" requeue of only the Again/Hard cards. Choose over form-wizard when the surface is a one-card-at-a-time grading loop over a live queue, and over quiz/score pages when items carry SRS intervals and re-enter the queue instead of just being marked right or wrong.',
  category: 'Learning - Flashcard Review Session',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'ClickableCard',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'ProgressBar',
    'SelectableCard',
    'Text',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
