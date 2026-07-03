import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Theme Token Studio',
  description:
    "Design-token WORKBENCH: a left 300px token tree (collapsible color / spacing / radius / shadow groups from a fixture manifest; selecting a token opens an inline editor — ramp-chip row + ramp Slider + step-swatch strip for colors, NumberInput steppers for spacing and radius, an elevation Slider for shadows) live-restyling a miniature Lumen CRM preview (mini dashboard card, form row + button set, deals-table snippet) that renders TWICE, side by side in forced-light and forced-dark panes — each pane sets colorScheme + data-astryx-media so one edit resolves its explicit light-dark() pair in both schemes at once. A right changes rail tracks edits as before → after chips with per-token revert, reset-all, and batch undo (edits are a pure fold over an append-only change log); Default / Contrast+ / Warm presets apply as deterministic staggered batches the rail narrates; an export drawer tabs JSON, CSS custom properties, and a copy-ready diff highlighting exactly the session's changed lines. On phones the panes become a scroll-snap carousel with a Light/Dark button path, the token tree becomes a bottom sheet, and the rail collapses to a badge-count pill. Choose over deck-theme-designer when the artifact under design is a TOKEN MANIFEST that must resolve in two color schemes simultaneously, not deck-wide slide styles — the archetype is token-tree-plus-dual-scheme-preview.",
  category: 'Creative - Theme Token Studio',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CodeBlock',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'NumberInput',
    'Slider',
    'StackItem',
    'TabList',
    'Text',
    'Toast',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
