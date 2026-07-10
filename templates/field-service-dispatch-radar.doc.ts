import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Field Service Dispatch Radar',
  description:
    'Fieldbeam dispatcher console pairing a schematic territory SVG (street grid, park, canal, parts depot, tech diamonds, risk-ringed job pins, per-tech route polylines that dogleg through the depot for part pickups) with an SLA posture strip, an incoming lane, and three tech route lanes of derived-ETA stop rows. Rerouting a job re-sorts both routes, redraws both polylines, and re-derives every ETA, slack chip, parts chip, and risk counter; skill-mismatched techs refuse with a certification reason.',
  category: 'Operations - Field Service Dispatch Radar',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'LayoutPanel',
    'Badge',
    'Icon',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
