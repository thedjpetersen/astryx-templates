import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Deck Review Comments',
  description:
    'Deck REVIEW surface pairing a slide stage with slide-anchored comment threads: a header (deck Heading "pricing-refresh-proposal.pptx" + "v14 · uploaded Jun 28 by Priya Nair" version note + "In review" Badge + All/Open/Resolved filter SegmentedControl), a slim 112px left thumbnail rail where each tile wears an open-comment-count Badge, a center 4:3 stage whose canvas overlays numbered 24px circular markers at fixed shape-anchor x/y positions (resolved markers flip to accent-muted with a check), and a right 340px thread panel of Cards — Avatar + author + Timestamp, body text with @mentions rendered as accent Tokens, indented replies, a Resolve/Reopen Button per thread, and a reply TextArea + Send on the active thread. Clicking a canvas marker highlights and scrolls to its thread; clicking a thread highlights its marker. Choose over slide-deck-viewer when the surface is COLLABORATIVE REVIEW — markers, threads, resolve state — not plain paging; choose over slide-editor-canvas when slides are immutable and only the discussion mutates; choose over slide-sorter when the work is discussion on a large annotated stage, not structural reorder/skip/delete across a thumbnail grid.',
  category: 'Slides - Deck Review',
  componentsUsed: [
    'AspectRatio',
    'Avatar',
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
    'SegmentedControl',
    'SelectableCard',
    'StackItem',
    'Text',
    'TextArea',
    'Timestamp',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
