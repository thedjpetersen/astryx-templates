import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Aviation Turnaround Board',
  description:
    'Tarmac ramp-control Gantt for one concourse: a frozen stand column (flight pair, tail, aircraft glyph, pushback-risk chip) beside a 16:00–18:20 minute axis with a fixed now-line, four task lanes per stand (fuel, bags, catering, cabin) as clickable segments, a derived stat strip (OTP, late/tight counts, late minutes), and a detail bar whose Complete-now / Slip actions reflow downstream segments through the dependency graph and re-derive every chip and counter in the same render.',
  category: 'Operations - Aviation Turnaround Board',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Heading',
    'Text',
    'Badge',
    'Button',
    'Icon',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
