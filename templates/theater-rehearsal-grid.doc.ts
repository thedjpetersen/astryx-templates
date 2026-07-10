import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Theater Rehearsal Grid',
  description:
    'Greenroom stage-management scheduler for one rehearsal week: an actor × scene coverage matrix (sticky scene column, cast pips with conflict shading, per-actor coverage footer) beside a room-hold rail whose free slots become live placement targets with conflict previews. Placing or clearing a scene re-derives the coverage ring, conflict chips, per-actor counts, and hold availability from one schedule map, with a selected-scene detail bar and deterministic fixtures.',
  category: 'Media - Theater Rehearsal Grid',
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
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
