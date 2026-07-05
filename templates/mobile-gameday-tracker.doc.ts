// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Pylon — Gameday Tracker',
  description:
    "MOBILE (390px shell) second-screen basketball tracker for Pylon, frozen LIVE at Q4 6:42, Phoenix Cinder 84-81 Seattle Squall: ONE scripted timeline index (gameClockStore.t over 140 deterministic events) drives every surface — scrub the pinned 56px WinProbabilityRibbon (drag its playhead with a LIVE magnet at the right edge, arrow-key the role=slider, PageUp/Down quarter jumps, 44×44 prev/next steppers, quarter radiogroup, or tap any feed row) and the navBar score strip + LIVE→REWIND pill, 40px scoreboard numerals, QuarterLineScore (future quarters em-dash, in-progress partial sum, T always equals the navBar score), MomentumMeter tug bar (last-12 window, 12-0 clamp at t=58, '9-2 PHX run' chip at live), CourtShotPlotter (114 id-derived dots at t=139, makes filled / misses hollow, 120ms pops on forward scrub), full-bleed 60px play feed with idx>t rows at 40% + 'upcoming' names and brand-inset current row, Plays badge (139−t, '99+' capped), and the two-detent player box-score sheet — all deriving from events with idx <= t through one selector path, no second copy of any number. Settling any scrub announces 'Q3 4:58 · PHX 61-58' via the single sticky toast dock; the sheet freezes t behind its focus trap and stamps 'as of Q4 6:42'; box rows re-derive '9-17 FG · 4 3PT · 4 FT' live and zero-point players keep honest 0 rows with all-dash quarter strips. At desktop container widths (>=720px) it renders as a centered 430px phone column, never a stretched relayout. Choose over mobile-parking-session when the artifact is a rewindable live-event timeline whose one index synchronizes six read surfaces, not a payment session with extension consequences; choose over bottom-sheet-snap-explorer when the sheet is a box-score detail frozen to its moment rather than the mechanic under study; choose over any desktop dashboard when the brief needs a phone-first 390px shell with sticky ribbon scrubber, tab persistence, and 44×44 gesture-with-button-path parity.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
