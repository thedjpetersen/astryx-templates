import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Cross-Platform Post Composer',
  description:
    "Creator-studio crosspost composer: the left pane is the editor — a crosspost bar of platform ToggleButtons (Pulse short-text 280, Threadline long-form 3,000, Lensa image-first 2,200) that add or remove preview tabs, a body TextArea whose typing drives per-platform countdown Tokens that turn amber inside the last 10% of each budget and red once over, a drag-to-reorder media strip whose gradient tiles carry alt-text Popover editors with ALT completeness badges plus always-present move-left/right IconButtons for touch, a removable link card whose character cost differs per platform (wrapped 23 chars, free card, or plain caption text), and clickable hashtag suggestions that append to the body with every countdown updating — and the right pane is a live preview TabList that re-renders the draft per platform style (short-text card with reply/repost counters, long-form article, image-first hero) truncating the body hard at each platform's post-link budget with a red ellipsis. A header Schedule Popover (post now, fixed slots, or a TimeInput pick) moves the draft into a locked queued Banner showing its scheduled slot with a back-to-draft undo. Choose over newsletter-composer when the artifact is one social post fanned out to several networks rather than a block-built email; choose over mail-compose when there are no recipients or subject — reach is decided by platform toggles; choose over form-page because the right pane is a live per-platform render of the draft, not a summary of fields.",
  category: 'Social - Cross-Platform Post Composer',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Field',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'Popover',
    'SegmentedControl',
    'StackItem',
    'TabList',
    'Text',
    'TextArea',
    'TimeInput',
    'Toast',
    'ToggleButton',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
