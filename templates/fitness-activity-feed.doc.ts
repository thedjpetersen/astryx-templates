import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Fitness Activity Feed',
  description:
    "Strava-style athlete social feed for the fictional 'Cadence Club' brand (orange accent): a top nav with accent brand mark, Home/Explore/Challenges/Clubs nav, athlete search, and an accent 'Record' CTA over a three-column layout — a 300px left rail with a profile snapshot Card and a weekly-progress Card (SVG distance-vs-goal ring at 32.4 of 40 km plus 7-day mini bars that sum exactly to it), a center feed of activity Cards each carrying an athlete header row, a route map drawn as an SVG polyline over a muted map-tile scene (water, parks, street grid — no image assets), a distance/pace/time/elevation stat row, an optional crown segment-achievement callout or PR badge, and a kudos + comment row with AvatarGroup facepile, working kudos ToggleButton, and an expandable comment thread with composer — and a 320px right rail with a July climbing-challenge Card at 68% (contributor leaderboard meters reconcile with the feed cards' elevation figures) and suggested athletes with Follow toggles; an All/Runs/Rides SegmentedControl filters the feed, and at compact widths the rails re-home above the feed. Choose over workout-session-logger when the surface is a social feed of completed activities with kudos, comments, and route maps rather than one in-progress timed session with per-set logging; choose over habit-streak-tracker when the content is GPS-activity cards, goal rings, and club challenges rather than per-habit daily check-offs and streak math.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'MoreMenu',
    'ProgressBar',
    'SegmentedControl',
    'StackItem',
    'Text',
    'TextInput',
    'ToggleButton',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
