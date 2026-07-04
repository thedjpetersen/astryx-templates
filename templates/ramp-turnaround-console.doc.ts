// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Ramp Turnaround Console',
  description:
    "Chockline ramp coordinator's stand board frozen at T0 = 13:40Z (now line at T0+22): six stands as dense 56px turnaround gantt rows — 148px left rail (stand code / flight ident / aircraft type, each line omitted when undefined; empty stand C2 renders 'no aircraft assigned · next inbound T0+120'), a flex timeline where deboard/clean/fuel/catering/board/pushback bars alternate two 14px lanes at y=8 and y=26 with 10×10 dependency-lock glyphs, and a 64px right cap with a 20px EOBT chip ('OT' green / '+6' amber). A pure dependency solver computes each row's binding critical chain (2px brand-mix glow + lane-midpoint connector segments) and EOBT delta; the fuel bar alone carries an 8px drag grip (16px hit area, role='slider' with ArrowLeft/Right ±1 and PageUp/Down ±5, clamped 15–60 min with the clamp announced). The signature interaction: dragging VA 218's fuel +10 min absorbs its 4 minutes of slack, slides board and pushback right (300ms transform, reduced-motion aware), re-routes the critical glow from the clean chain to the fuel chain, flips the row chip AND the top-right header chip 'EOBT ON-TIME' → 'EOBT +6', appends '14:32Z — DELAY ATTR — Fueling +10 min; 4 min slack absorbed; EOBT +6.' to the milestone log, surfaces an amber 'Pushing back +6 vs schedule' caption on the tug clearance step, and increments the footer's critical-watch count from 1 (AT 130 ships pre-delayed +12) to 2 — all through one update(id, patch) state owner. Above the board: a 48px header (Chockline chock-mark SVG, EOBT delta chip, frozen 'T0 13:40Z' clock, coordinator avatar RO), a 40px stand strip whose chips select + scroll rows into view, and a 24px time ruler with 15-minute mono ticks and the frozen brand now-line. The 400px aside holds the selected flight's milestone log (12 ticket-shaped rows for VA 218, 36px each), a wrapping GSE roster of 28px vehicle-glyph chips (belt loader / fuel truck / tug / catering loader / lav cart with operator initials and solid-green occupied / dashed-amber en-route / dotted-gray staged rings; AT 130's 7 chips force the wrap; clicking toggles staged↔occupied and logs it), and a pinned sequential-arming pushback clearance stack (4 × 44px steps + 44px confirm, only the single armed step tabbable). Below 1080px of measured CONTAINER width the aside re-opens as a right-edge overlay with Escape-close and focus restore; 720–899px narrows the rail to 96px and thins ruler labels to 30 min; under 720px the wordmark, bar labels, and strip overflow collapse. Choose over grid-feeder-console when rows are TIME-scaled gantt schedules whose bars drag and re-solve through dependencies, not a spatial one-line diagram with breaker toggles and alarm floods; choose over claims-adjudication-workbench when the what-if lever is a duration drag propagating through a schedule solver, not scrubbing currency values through a rule trace; choose over lims-plate-workbench when the left spatial artifact is horizontal time, not a 96-well plate driving spatial selection; choose over media-asset-pipeline when every row needs in-row overlapping duration bars with critical-path attribution, not a filterable asset table with per-row pipeline progress.",
  category: 'Tools - Aviation Ground Ops',
  componentsUsed: [
    'Avatar',
    'Button',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutContent',
    'StackItem',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
