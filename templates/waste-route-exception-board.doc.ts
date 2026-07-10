import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Waste Route Exception Board',
  description:
    'Haulcheck sanitation dispatch board for one service day. Six per-truck route strips render every stop as a tick (served, pending, notice, tappable exception diamonds) beside live addressed-% and projected-finish stats, over a wrap grid of open exception cards with custom bin glyphs (blocked, not-out, contamination, overflow, damaged, missed). The resolution rail gates Return-&-serve and Leave-notice behind a required proof picker; resolving clears the strip tick, re-derives the truck pace against the 16:30 cutoff (+6 min per return), bumps the day addressed counter, appends to the resident-notice queue, and logs the stamped resolution with undo. Deterministic fixtures with hand-checked served/finish arithmetic.',
  category: 'Operations - Waste Route Exception Board',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'HStack',
    'VStack',
    'StackItem',
    'Heading',
    'Text',
    'Button',
    'Icon',
  ],
} satisfies AstryxPageTemplate;

export default template;
