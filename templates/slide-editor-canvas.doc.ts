import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Slide Editor Canvas',
  description:
    'PPTX-style slide EDITOR with a header edit bar (deck icon + "brand-launch-plan.pptx" + Undo/Redo IconButtons that gray out when the edit stack is empty + an insert Toolbar with Text/Shape/Image buttons + a Present button that flips a dismissible "Rehearsal started" Banner), a fixed 128px left thumbnail rail of numbered SelectableCards repainted live from edited shape state, a centered 840px-max 4:3 editing canvas where the selected shape gets an accent selection ring with eight square resize handles and dashed center alignment guides, and a right 280px format LayoutPanel whose Fields (content TextInput, font-size Slider, weight/align SegmentedControls, x/y/w NumberInputs, color-role Selector, delete IconButton) live-edit the selected shape through an undo/redo history stack. Choose over slide-deck-viewer when the surface is AUTHORING — shapes are selectable and a properties panel mutates them — not read-only paging; choose over deck-theme-designer when editing one slide\'s shapes rather than deck-wide styles; choose over slide-outline-editor when manipulation is spatial/canvas-based, not text-outline-based.',
  category: 'Slides - Editor Canvas',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Field',
    'FormLayout',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'NumberInput',
    'SegmentedControl',
    'SelectableCard',
    'Selector',
    'Slider',
    'StackItem',
    'Text',
    'TextInput',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
