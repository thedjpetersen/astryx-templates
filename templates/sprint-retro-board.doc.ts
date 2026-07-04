import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Sprint Retrospective Board',
  description:
    "Team retrospective surface for Kestrel Labs' Atlas Q3 'Sprint 24' (retro held Wed Jul 15, 2026): a facilitator bar with the retro title and sprint window, facilitator chip, a brainstorm→vote→discuss phase stepper pinned on Vote, and a fixed 04:32 timer chip; a vote toolbar carrying your dot-budget strip ('3 of 5 votes left' pips), a participation meter ('7 of 9 added cards' with contributor facepile and waiting-on names), and an Added/Top-voted order toggle; three retro columns (Went well / Didn't go well / Ideas) of author-attributed sticky cards — two posted anonymously behind a ghost badge — each with a 0–5 dot-vote chip you toggle against a single stateful budget, plus the 'CI flakiness' dashed bundle outline grouping three cards under one reconciling ×3 tally; and a 320px action-items panel of three owner + due-chip rows, one badged as carried over from Sprint 23, with a note pointing at the Thu Jul 16 Launch Readiness Review. Choose over kanban-board when cards are voted retro reflections in fixed sentiment columns rather than tasks moving through workflow states; choose over sprint-board-backlog when the surface is the ceremony AFTER the sprint — reflections, dot votes, and action items, never story points or committed-vs-capacity; choose over team-brainstorm-board when ideas live in structured sentiment columns with a phase-run facilitator flow rather than a freeform pannable canvas of positioned notes; and choose over meet-recap when the team is IN the working session voting live, not reviewing a finished meeting's recording, transcript, and summary.",
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'MoreMenu',
    'ProgressBar',
    'SegmentedControl',
    'StackItem',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
