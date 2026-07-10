import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Shiftly Shift Swap Console',
  description:
    'Restaurant manager approval surface: a roles × days week schedule grid of shift chips with dashed swap-request overlays and OPEN slots, beside a 316px rail with the request queue (live before/after hours previews and over-40 warnings), per-staff overtime meters on a fixed 48 h scale, and a decision log. Approving a swap re-assigns the grid chip and re-derives both parties’ meters, the over-40 stat, and the open-shift count in one render; deterministic fixtures.',
  category: 'Hospitality - Shift Swap Console',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
