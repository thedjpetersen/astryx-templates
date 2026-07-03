// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Blog & Content Sections',
  description:
    'Marketing section library with five live variants on one page: a 3-up post-card grid whose category chips filter live (plus read times and save toggles), a featured-post split where clicking any of four stacked rows promotes it to the lead card, a minimal chronological list with dates in a left gutter and a newest/oldest switch, a centered prose article with styled headings, pull-quote, figure placeholder, inline code, and a validating newsletter signup, and a two-column article whose in-page table of contents smooth-scrolls and scroll-spies the active heading. Choose over infinite-scroll-feed for a blog landing built from distinct section archetypes rather than a single stream.',
  category: 'Marketing - Blog & Content Sections',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'IconButton',
    'Layout',
    'List',
    'SegmentedControl',
    'Selector',
    'TextInput',
    'Toast',
    'ToggleButton',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
