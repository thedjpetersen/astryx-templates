import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Cold Chain Excursion Console',
  description:
    'Frostline QA disposition desk: a 280px excursion-lot queue with TOR budget bars beside an SVG temperature trace (2–8 °C keep band, hard-ceiling rule, freeze dips, telemetry-gap dashes, keyboard scrubber), a four-gate disposition decision tree that lights its evaluated path, a QA signoff gate that refuses unjustified overrides, and a lane risk table that re-grades as lots close. Deterministic six-lot fixtures cover every tree branch.',
  category: 'Logistics - Cold Chain Excursion Console',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Badge',
    'Button',
    'Icon',
    'Selector',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
