import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Volunteer Roster',
  description:
    'Handraise day-of staffing board for a community festival: four 248px arrival-wave columns with SVG coverage rings per wave and per role (filled/needed, zero-coverage red through staffed green), required-training chips, and 32px assignee rows beside a 304px volunteer-pool rail of 60px rows carrying training badge chips and W1–W4 availability dots. Arming a pool volunteer and clicking a role slot moves them out of the rail, fills the role and wave rings, and re-derives the header readiness, pool, training-gap, and roles-staffed stats in one render; unavailable waves refuse with a reason and missing certifications warn first, then assign with a GAP override chip. Deterministic fixtures: 30 named volunteers, 13 roles, 35 slots, 21 pre-assigned.',
  category: 'Civic - Volunteer Roster',
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
