import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Roadmap Gantt',
  description:
    "Quarter-roadmap Gantt surface: a header with a Planning locked Badge and detail-panel toggle, a controls row pairing a Quarter/Half/Year zoom SegmentedControl (rescales one shared px-per-day axis) with a toggleable status legend (On track / At risk / Blocked / Done chips that dim non-matching bars), and the defining region — a horizontally scrolling canvas under a two-row time axis (Q1–Q4 FY26 quarter cells over twelve month cells) with four collapsible team swimlanes (Platform, Growth, Mobile, Infrastructure) whose initiative bars span fixed fixture date ranges with a darker progress fill inside each bar, diamond milestone markers with focus-friendly Tooltips, an SVG overlay drawing elbow dependency arrows between four bar pairs (accent-highlighted when an endpoint is selected), and a dashed Jun 15 status-date line; clicking a bar opens a 320px initiative detail panel (owner Avatar, date range, duration, ProgressBar, milestone list, Blocked by / Blocks jump buttons) that falls back to a single-pane detail view with a back button below 960px. Choose over timeline when work spans date ranges on team lanes rather than discrete events on a feed, and over calendar-month-grid when the horizon is quarters, not one month.",
  category: 'Planning - Roadmap Gantt',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'ProgressBar',
    'SegmentedControl',
    'Text',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
