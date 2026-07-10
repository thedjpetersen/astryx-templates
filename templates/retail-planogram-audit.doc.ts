import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Shelfright Planogram Audit',
  description:
    'Retail shelf-truth console for district planogram audits: a two-bay shelf schematic wall whose position tiles are SVG product silhouettes sized by planogram units, a facing detail workbench, a 336px audit checklist panel with per-row Compliant/Missing/Misplaced verdict buttons, and a district compliance rollup. One verdict map drives every surface — marking a facing restyles the schematic tile, ticks the checklist, re-derives the compliance chips and Store #214 district bar, and mints replenish/reset follow-up tasks.',
  category: 'Commerce - Planogram Audit',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'LayoutPanel',
    'Icon',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
