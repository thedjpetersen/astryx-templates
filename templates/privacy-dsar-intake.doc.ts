import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Privacy DSAR Intake',
  description:
    'Redactly, a privacy-ops DSAR fulfillment desk: a 300px statutory-clock rail (per-request days-remaining bars with projected-effort diamonds that recolor by risk band) beside a system-search checklist matrix (eight systems by in-scope data categories) and a four-stage fulfillment gate dock (identity proofs, search progress ring, redaction review, compile package). Completing a system search ticks matrix cells to fixture record counts, advances the gate ring, lifts readiness, and re-derives the clock bar color and header risk chips from one progress store. Deterministic fixtures with hand-checked statutory arithmetic.',
  category: 'Security - Privacy DSAR Intake',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Heading', 'Text', 'Badge', 'Button', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
