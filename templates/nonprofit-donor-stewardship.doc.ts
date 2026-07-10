import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Donor Stewardship Desk',
  description:
    'Stewardly major-gifts kanban: four moves-management columns (Qualify, Cultivate, Solicit, Steward) of donor cards with pledge-risk arc dials, tier pills, and derived next-best-action chips, under a campaign coverage bar that splits secured vs at-risk dollars against the goal. Logging a touch in the composer drawer eases the risk dial, rewrites the next action, and moves dollars between the coverage bands live.',
  category: 'Civic - Donor Stewardship Desk',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
