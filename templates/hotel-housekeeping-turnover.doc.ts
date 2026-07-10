import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Turndown Housekeeping Turnover',
  description:
    'Hotel exec-housekeeper surface for the 3 PM check-in push: a floor-by-floor board of state-coded room tiles driving the full housekeeping state machine (dirty → cleaning → inspect → ready, with fail-and-redo bounces), beside a 328px rail with the inspector queue (Pass / Fail with an inline reason picker), a live arrivals list whose room chips track the tiles, and a housekeeping log. Passing a room re-derives arrivals readiness %, left-to-turn, and floor readouts in one render; deterministic fixtures.',
  category: 'Hospitality - Housekeeping Turnover Board',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
