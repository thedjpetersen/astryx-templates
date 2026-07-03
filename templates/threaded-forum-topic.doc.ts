import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Threaded Forum Topic',
  description:
    "Forum topic page reading one Q&A discussion as a nested reply tree: a sticky LayoutHeader with the topic title ('How should we structure optimistic updates with server actions?'), a Solved Badge, tag Tokens, live view/reply/participant counters, Follow and Bookmark toggles, a top/newest/oldest sort SegmentedControl, and a 'Jump to best answer' Button that scrolls to and pulses the accepted reply; below, a centered ~760px column with the OP's topic post and 22 seeded replies nested 4 levels deep behind 2px thread rules, each with author role Badges (OP, Mod), upvote/downvote toggles updating scores live, a collapse control folding any subtree into a descendant-count pill that expands back in place, and an inline reply composer that inserts the new reply into the correct branch with a highlight flash; sorting genuinely reorders every sibling group while collapse state persists. A right 300px LayoutPanel holds a topic-summary MetadataList (followers track the Follow toggle), top participants derived live from the tree, and related threads; at <=960px the rail becomes a collapsible 'About this topic' Card. Choose over issue-detail when the surface is a community discussion ranked by votes with an accepted answer, not a ticket with sub-tasks and CI; choose over mail-thread-reader when replies branch and re-rank rather than reading as one linear correspondence; choose over live-event-chat when posts are threaded and vote-scored, not an append-only stream.",
  category: 'Social - Threaded Forum Topic',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'Link',
    'MetadataList',
    'SegmentedControl',
    'StackItem',
    'StatusDot',
    'Text',
    'TextArea',
    'Timestamp',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
