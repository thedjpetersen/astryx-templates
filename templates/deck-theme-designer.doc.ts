import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Deck Theme Designer',
  description:
    "Deck THEME DESIGNER with a left 320px controls panel (theme name TextInput, four preset palette SelectableCards each showing a five-swatch hex strip — Horizon/Ember/Meadow/Slate, a font-pairing Selector, a Compact/Default/Display type-scale SegmentedControl, Switches for slide numbers and footer plus a footer-text TextInput that disables while its Switch is off, and a layout-masters RadioList) driving a right preview area: a Grid of five 4:3 layout-master canvases (Title, Title + Content, Two Column, Statement, Section Header) all re-rendered live through one theme-parameterized slide renderer, with the RadioList's chosen master enlarged at top (maxWidth 620) and an 'Apply theme' Button that raises a dismissible success Banner. Choose over slide-editor-canvas when edits are DECK-WIDE STYLES (palette, type scale, masters) rather than one slide's shapes; choose over slide-deck-viewer because the previews exist to visualize theme variables, not to page a document — the archetype is settings-panel-plus-live-preview.",
  category: 'Slides - Theme Designer',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'Field',
    'FormLayout',
    'Grid',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'RadioList',
    'SegmentedControl',
    'SelectableCard',
    'Selector',
    'StackItem',
    'Switch',
    'Text',
    'TextInput',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
