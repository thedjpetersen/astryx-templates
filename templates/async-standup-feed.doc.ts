import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Async Standup Feed',
  description:
    'WIDE daily async check-in feed for the Kestrel Labs Atlas Q3 Platform & Infra team (Wednesday, July 15, 2026): a date header with a completion meter (6 of 8 posted ProgressBar plus a "2 reminded" Token) and a timezone-aware ordering note ("Lisbon posts first, Pacific last"); a blocker-rollup banner at top (1 active blocker — the 500-seat staging quota — with owner and helper Avatars and a jump-to-check-in action); your own composer card with three prompts (Yesterday pre-filled from Tuesday’s plan, Today and Blockers empty) and a Post button that appends your card and re-derives every reconciling count to 7 of 8; six check-in cards with Yesterday / Today / Blockers sections in local-morning order, one flagging a blocker with a red left rail, a "Needs help" chip, and a linked 2-reply thread; flame streak chips on consistent posters and a still-waiting row; and a 320px week rail with a labeled Mon–Fri participation bar strip, a streak leaderboard, and a roster grouped by timezone with posted/waiting status dots. Choose over shared-team-inbox when teammates report to each other on a daily cadence — no external customers, SLAs, or assignment; over messaging-shell when the surface is asynchronous structured check-ins (Yesterday/Today/Blockers prompts), not a live channel message stream; over sprint-board-backlog when the content is prose status and blockers above task tracking, not story cards with points on workflow columns; over timeline when entries are per-person authored posts with a completion meter and composer, not a chronological system event feed.',
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
    'Text',
    'TextArea',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
