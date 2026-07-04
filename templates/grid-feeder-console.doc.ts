// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Grid Feeder Console',
  description:
    "Distribution operator's console for Enodra (grid-orchestration, quarantined #F08C00 mark) at Marlow Substation · 12 kV: a 46px header/alarm bar (hex-bolt Enodra mark + substation identity left; a max-4-chip alarm strip with '+N' overflow and an affected-customers counter sharing one polite live region center-right; operator badge 'R. Okafor · R.O.' far right), a hand-authored 960x620 SCADA one-line diagram (4px main bus at y=88, two-circle transformer T1, five 18x18 breaker squares — filled = closed, hollow = open — dropping to labeled load blocks, recloser REC-9 on F1, normally-open tie TIE-27 between the F3/F4 tails, static-dash de-energized segments, symbology legend pinned bottom-left), a 340px feeder rail of 44px LoadHeadroomRows whose 120x8 bars put the 100%-of-seasonal-rating tick at 78% of track width with a hatched overload zone to 128% (Ridgeline 12F5 pinned at exactly 100% amber; 47-char Eastgate name exercising single-line ellipsis; Millbrook with zero critical loads omitting stripe and glyphs), and a 380px switching aside. The signature interaction is a deterministic model-driven cascade from precomputed SCENARIOS keyed on the breaker-state signature: opening BKR-4 turns Cannery 12F4 gray-dashed, closes TIE-27 amber-backfed, surges Eastgate 64% → 104% into the overload hatch, jumps the counter 0 → 2,140 affected (exactly Cannery's customer count; header total 12,480 = 2,980+2,410+2,650+2,140+2,300), raises the CRIT F4-86 chip (6 alarms → 4 chips + '+2'), and auto-drafts switching order SO-2214 with six strictly-sequenced steps (open, verify, tag DNO-1187, test-dead, ground, log) that unlock one at a time with 'R.O. · 14:32'-style sign-off stamps, downgrading the CRIT to INFO 'F4 tagged & grounded' on completion; closing BKR-4 reverses everything and voids the draft. One state owner exposes update(id, patch); alarms ack by click, every chip and glyph is an affordance, load bars are role=meter with overload aria-valuetext, breakers are keyboard-toggleable role=button glyphs, and responsive is pure subtraction (rail drops < 1360px, aside drops < 1080px with order state persisting). Choose over incident-console when the screen must draw live equipment topology with device-state symbology and an interlocked procedure, not triage a filterable incident list with an inspector; choose over feature-gate-console when the toggle is a physical breaker whose flip re-derives load transfer, customer counts, and an auto-drafted procedure — not boolean flags and rollout percentages; choose over dashboard-widget-grid when load must read against a rated limit with an explicit hatched overload zone on a dense tool surface, not KPI widgets on a dashboard; choose over test-runner-console when sequential gating means operator sign-off on switching steps against live topology, not test suites streaming results.",
  category: 'Tools - Grid Operations',
  componentsUsed: [
    'Avatar',
    'Badge',
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
