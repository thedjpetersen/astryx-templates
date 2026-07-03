import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Slide Outline Editor',
  description:
    'Text-first outline editor for drafting a deck ("customer-onboarding-playbook.pptx"): the left fill pane is a hierarchical outline of bold numbered slide-title rows with bullet rows indented one or two levels, each row carrying a grip glyph, inline text that swaps to a TextInput on a second click (or the pencil button) and commits on Enter/blur, and hover-revealed promote/demote (Outdent/Indent), move up/down, and delete IconButtons, each disabled where illegal (collapsed into a single always-visible per-row MoreMenu at phone width); the right 380px panel renders the selected row\'s slide live as a mini 4:3 SlideShape canvas (title + bullets derived from the outline children) above a MetadataList (slide n of 7, bullets, words, characters) and an EmptyState when the slide has no bullets. Demoting a title merges its slide into the previous one; promoting a bullet splits a new slide — both renumber and repaint the preview, and the header counters derive from state. Choose over slide-editor-canvas when authoring happens in a text hierarchy, not on a spatial canvas; over slide-deck-viewer because the preview is a single derived miniature, not a paged stage; and over slide-sorter when restructuring happens row by row in text rather than across a whole-deck thumbnail grid — the archetype is structured-list-plus-detail, closest to table-tree but content-authoring.',
  category: 'Slides - Outline Editor',
  componentsUsed: [
    'AspectRatio',
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
    'MetadataList',
    'MoreMenu',
    'StackItem',
    'Text',
    'TextInput',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
