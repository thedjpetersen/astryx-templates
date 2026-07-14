// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Poll Reveal Motion',
  description:
    "MOBILE (390px shell) group-chat poll experience for Relay Rooms' Team Lunch room (34 members): a 52px navBar (back to Rooms, two-line title, 44×44 counts ⇄ percentages toggle) over a chat thread mixing monogram-avatar message bubbles, day dividers, and three poll cards. The centerpiece is the reveal choreography on the open 'Where for team lunch?' poll (9+6+5+3 = 23 base votes, voter chips 4/3/3/3 with +5/+3/+2 overflow): tapping an option pops its selection ring, then every bar springs scaleX 0→pct with the shared decelerate bezier and a 70ms per-row stagger while value labels count up in sync from one 40ms interval clock (tabular-nums), the leading option's crown drops in with an overshoot bounce, and fixed voter chips slide into each row; changing your vote re-targets both affected bars, live-updates counts, and posts a 'Vote moved' toast with a real Undo in the single polite dock at bottom:76. A second open poll (11 votes) demonstrates the pre-vote state with a transform-only shimmer sweep on its 'Tap to vote' pill; a third CLOSED poll shows the settled state — winner banded in brand tint with a static crown and 'Poll ended · 41 votes'. The navBar toggle flips every revealed label between counts and % with a per-label rotateX flip (30ms stagger), and the composer genuinely sends (draft appends as an outgoing bubble with a pop-in). Reduced motion (matchMedia with change listener + CSS guard) sets bars instantly, renders counts final, and removes shimmer/staggers entirely. At container widths >560px it renders the standard centered 430px phone column on a muted backdrop. Choose over mobile-event-rsvp-chat when the chat's decision object is a multi-option tallied poll with animated result reveals rather than yes/no RSVPs; choose over mobile-trivia-host-console when participants vote inside a thread instead of a host scoring rounds; choose over mobile-party-headcount-grid when opinions need per-option bars, percentages, and revote motion rather than a headcount grid; choose over any desktop template when the brief calls for a phone-first 390px shell with 44×44 touch targets and a sticky composer dock.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
