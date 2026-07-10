import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Vendor Risk Renewal',
  description:
    'Vetlane third-party renewal runway: four time-to-renewal lanes of risk heat tiles (grade-colored, with weighted verified/pending/gap heat bars and live gap counters), an escalation queue for gap-carrying vendors inside 45 days, and a 356px attestation checklist pane with per-item Verify/Request actions. Recording an attestation clears the gap from the heat bar, regrades the tile, re-derives the portfolio readiness percentage, and updates the escalation queue in the same render, with undo and deterministic fixtures.',
  category: 'Security - Vendor Risk Renewal',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
