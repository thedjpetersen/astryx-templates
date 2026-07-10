import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Climate Risk Asset Map',
  description:
    'Groundtruth portfolio-resilience console over a hand-drawn 760×560 schematic SVG of the Carraway Sound region: 12 asset pins grade-lettered A–E by a value-weighted hazard composite, a pin-lens chip row (composite or single-hazard recoloring), and four toggleable overlays (floodplain, heat island, wildland-urban interface, transmission corridor) beside a 340px tracker rail with a capex budget meter, mitigation project cards, and an insurance-evidence ledger. Funding a project applies its score delta in the same render — the linked pin eases, the detail band bar grows a mitigated tail, portfolio risk and eased-pts stats re-derive, the budget drains, and a funding-memo evidence row appends; Undo reverses all of it and over-budget proposals refuse with the exact shortfall. Deterministic fixtures: $375M insured, $2.3M budget, 8 projects P-101–P-108.',
  category: 'Sustainability - Climate Risk Asset Map',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'HStack',
    'StackItem',
    'Heading',
    'Text',
    'Badge',
    'Button',
    'Icon',
  ],
} satisfies AstryxPageTemplate;

export default template;
