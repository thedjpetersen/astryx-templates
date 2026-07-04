// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Keyline Contest Logger',
  description:
    "Contest-weekend QSO logging cockpit for Keyline Radio, frozen mid-session at 'CQ WW SSB · Sat 11:00–12:00Z' — fully deterministic, replaying from a 12-spot fixture bandmap (no radios, no clocks, no randomness): a 44px header bar (KeylineMark + wordmark + contest chip left; 160/80/40/20/15/10 band segments, CW/SSB toggle, and a live '2,209 pts' readout right); an 88px entry bar whose 300px CallsignResolverField hosts progressive resolution inside its own chrome — longest-prefix match against a 24-entry DXCC table paints an abstract entity badge ('DL', 'ZL' — text badges, never flag art), CQ-zone badge ('Z14') and continent glyph as you type, tints the WHOLE field red on dupes ('DUPE · 20m 11:31Z') and amber with a 'NEW MULT' starburst when a multiplier is armed; a 14-row log table (32px rows, 13px mono, 56/110/44/44/44/44/40/48/72px columns, sticky 28px header, 'MULT Z14' amber badges only where newMultZone exists, newest row carrying a 3px brand accent, every row a button that re-arms the entry — one click demonstrates the dupe tint); a sticky 28px footer '14 QSOs · 47 mults · 21 pts × 47 = 2,209' that arithmetically equals the header score by construction; and a 380px rail with a 240-cell multiplier bitfield (two banks of 6 bands × 20 zones, 16px cells + 1px gap, 44 prior-contest mults plus the session's zones 1/17/40, cell click jumps and flashes the source log row), a 180px dual-needle beam dial (solid short-path needle, dashed half-length long-path, fixed 48°–132° grayline arc, 220ms sweep) and an '84/hr' RateMeter whose 10 one-minute bars derive from qso.minutesUtc. ONE state owner exposes update(id, patch); an Enter-commit fans out to six surfaces in a single render (log prepend, grid cell flash, score + footer recompute, rate bucket increment, dial advance, entry reset + focus return). Scripted stress fixtures: bandmap spot 3 is a guaranteed dupe (K3LR), spot 6 the guaranteed zone-32 NEW MULT (ZL2AGY), 'VP8/G4XYZ/P' stresses the 110px callsign column, and 'Bosnia-Herzegovina' truncates in the dial center. Below 1120px the entire rail is removed (subtraction, not reflow) and the header gains a 'Mults 47 · 84/hr' chip. Choose over crypto-exchange-trade when the keystroke surface is a typed-entry LOGGER whose input resolves and dedupes against its own history, not an order ticket against a market book; choose over step-sequencer-groovebox when the dense cell grid is a derived read-mostly scoreboard bitfield lit by commits, not a playable pattern editor; choose over table-index-detail when rows are append-only commits feeding live aggregates (score, mults, rate) rather than records browsed into a detail pane; choose over kpi-dashboard when every number must visibly move as a consequence of data entry instead of summarizing a static period.",
  category: 'Hobby - Ham Radio Logging',
  componentsUsed: [
    'Card',
    'Heading',
    'Icon',
    'Layout',
    'LayoutContent',
    'SegmentedControl',
    'Text',
    'TextInput',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
