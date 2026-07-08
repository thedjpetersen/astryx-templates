import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Housekeeping Turnover Board",
  description: "Hotel turnover board for room readiness, inspection exceptions, VIP holds, and late checkout conflicts. Includes a three-column command frame, live state filters, derived readiness metrics, row selection, and a detail timeline with deterministic fixtures.",
  category: "Hospitality - Housekeeping Turnover Board",
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent'],
} satisfies AstryxPageTemplate;

export default template;
