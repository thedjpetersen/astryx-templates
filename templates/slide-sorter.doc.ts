import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Slide Sorter',
  description:
    'Slide sorter / light-table for restructuring a deck: a header bar (deck icon + "all-hands-june.pptx" + live "12 slides · 2 skipped" counter + S/M/L zoom SegmentedControl + "Present skipping 2" Button wired to a rehearsal Toast), and a scrolling surface of section groups (Opening, Product, Financials, Appendix) — each a Collapsible header row with a slide-count Badge above a responsive Grid of numbered 4:3 mini slide canvases. Every tile carries hover affordances: ChevronUp/ChevronDown reorder IconButtons and a MoreMenu (Duplicate, Skip slide, Delete); skipped tiles dim to 45% opacity under an EyeOff "Skipped" Badge with a struck-through number, and the selected tile gets the accent ring plus a bottom info strip ("Slide 9 · Hiring plan · in Financials") with mirroring Duplicate/Skip/Delete Buttons. Deleting a section\'s last slide leaves a compact EmptyState. Choose over slide-deck-viewer when the WHOLE deck is the surface — a manipulable thumbnail grid with no large stage; choose over deck-review-comments when the actions are structural (reorder/skip/delete), not discussion; choose over slide-outline-editor when restructuring is visual and thumbnail-driven, not a text hierarchy — the only page-level archetype here is a sectioned card grid, not panes.',
  category: 'Slides - Slide Sorter',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'EmptyState',
    'Grid',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MoreMenu',
    'SegmentedControl',
    'StackItem',
    'Text',
    'Toast',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
