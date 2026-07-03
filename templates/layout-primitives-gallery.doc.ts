import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Layout Primitives Gallery',
  description:
    'Five-panel gallery of structural building blocks rendered against a dotted baseline background so spacing stays legible, each variant captioned with a copyable pattern chip: containers (constrained-width readouts at sm/md/lg/full with painted padding zones and a live viewport-width Slider that genuinely reflows the demo frame), cards (basic, header+footer, edge-to-edge mobile toggle inside a 320px frame, gray-body, and a well/inset variant, all switchable dense/comfortable), list containers (simple divided rows, card-per-row, flat rows with separate gaps, and a grouped directory that scrolls inside a fixed frame to prove its sticky letter headers), media objects (avatar-beside-text, top-aligned, right-aligned media, and a nested reply thread built from one recursive component with working collapse toggles), and dividers (plain line, centered label, action-button divider that reveals older rows, icon divider, and a vertical-divider metadata strip). Choose over dashboard-widget-grid or composer-state-gallery when the deliverable is the structural primitives themselves — a layout reference sheet, not a product surface.',
  category: 'UI Kit - Layout Primitives Gallery',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Grid',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'Section',
    'SegmentedControl',
    'Slider',
    'Switch',
    'Text',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
