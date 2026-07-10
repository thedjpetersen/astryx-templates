import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Air Cargo ULD Builder',
  description:
    'Deckload freighter load-planning cockpit for flight MC 482: a side-elevation aircraft deck map with sixteen arm-true ULD position buttons (main deck PMC + lower-hold AKE), a 320px shipment queue of AWB rows with hazmat diamonds, a five-tile balance strip, and a ZFW weight-&-balance envelope chart. Selecting a queued AWB lights only deck/weight-compatible positions; placing it moves the CG marker inside the envelope, re-derives payload/ZFW/%MAC tiles, flags class 3↔5.1 and lithium 9↔3 adjacency violations on the map and readiness checklist, and gates the finalize-loadsheet action. Deterministic fixtures with hand-checked moment arithmetic.',
  category: 'Logistics - Air Cargo ULD Builder',
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
