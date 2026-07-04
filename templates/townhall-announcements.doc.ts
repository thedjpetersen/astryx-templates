import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Townhall & Announcements',
  description:
    "Company-comms surface for Kestrel Labs (140 people) in the Atlas Q3 window, app-shell archetype: a featured announcement hero ('Atlas Q3 ship date confirmed — Tuesday, August 4' by Priya Raman) with a 4-emoji reaction bar with counts and a read-progress meter ('Read by 118 of 140 · 84% of company'); an announcement list of four more posts with All-hands/Policy/Shoutout category chips, read/unread dots, a category filter row, and a derived '2 unread' chip with Mark-all-read; a 380px moderated Q&A end panel for the Fri Jul 17 townhall — six upvotable questions (one answered inline via a tinted answer card, one flagged 'Answering live'), a Top/Newest SegmentedControl sort, and a pinned ask-a-question composer with an anonymous Switch; and a 300px townhalls rail pairing a next-townhall block (hosts, reconciling queue stats) with past-townhall rows whose scheme-locked dark recording thumbnails carry recap-artifact chips (duration recorded, chapters, transcript, views) in the language of meet-recap. Choose over messaging-shell when the surface is one-to-company broadcast posts with reactions and read tracking, not a live channel message stream with threads; choose over timeline when posts are a curated, category-chipped register with a featured hero, not a raw chronological service-event feed under date headers; choose over meet-recap when the page is BEFORE the townhall — queueing and moderating questions and linking out to past recap artifacts — never re-rendering a recording player, transcript, or AI summary.",
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'ProgressBar',
    'SegmentedControl',
    'StackItem',
    'Switch',
    'Text',
    'TextArea',
    'ToggleButton',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
