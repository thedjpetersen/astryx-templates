import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Implementation Cutover Plan",
  description: "Launch cutover planner joining data migration, DNS, comms, rollback checkpoints, and go-live signoff. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "SaaS - Implementation Cutover Plan",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
