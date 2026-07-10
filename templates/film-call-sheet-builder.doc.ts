// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Film Call Sheet Builder',
  description:
    "1st AD's day-strip board for Callslate on the indie feature 'NORTHLIGHT' (Gravel Road Pictures), boarding shoot Days 14–16 (15–17 Jul 2026) from the Mon 13 Jul anchor: three DAY COLUMNS of 56px production strips (real <button>s with a 4px edge in the industry strip-color idiom — EXT·DAY rides the Callslate yellow brand pair, INT·NIGHT blue, EXT·NIGHT green, DAWN violet, INT·DAY neutral — plus scene number, I/E·D/N tag, set, cast numbers, page eighths as dual label+math fields, and est setup minutes) interleaved with DERIVED interstitial rows the AD cannot drag: 45m company-move rows wherever adjacent strips change location and the auto-placed 60m lunch row with its clock (red-flagged past the 6h line). A pure buildDaySchedule derives everything each render — Day 14 ships intentionally broken: Sc 24's midday farmhouse detour drags two company moves, pushes est wrap to 19:45 past the 19:00 hard out, and lands the first lunch turnover at 6h15 → meal-penalty risk. The 376px rail stacks a SCENE DETAIL panel (schedule window, send-to-day buttons that refuse published targets with a reason, up/down reorder), a derived CREW & CAST CALL TABLE (crew call / shooting call / auto lunch / est wrap / hard out, then per-cast pickup → HMU → on-set rows computed from each actor's first scene and personal HMU duration), and a per-day PUBLISH GATE (wrap ≤ hard out · 0 meal penalties · ≥11h turnaround, with an amber 'tight' band at 11–12h — Day 14→15 opens at exactly 11h15). Signature move: sending Sc 24 to Day 15 reflows both columns' moves and lunch rows, re-derives wrap clocks (19:45→15:15 and 15:15→18:15), page totals (5 6/8→4 2/8 and 4 4/8→6 0/8), cast call times, penalty flags, and the gate verdict in one render; publishing Day 14 locks its strips and flips the header chip. Choose over theater-rehearsal-grid when the unit is shoot-day strips with derived call times and union-rule gating, not actor×scene coverage; choose over implementation-cutover-plan when readiness derives from a physical schedule (moves, meals, turnaround) rather than a runbook checklist.",
  category: 'Media - Film Production',
  componentsUsed: [
    'Avatar',
    'Button',
    'Heading',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'Text',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
