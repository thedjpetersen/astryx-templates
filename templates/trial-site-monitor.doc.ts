// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Trial Site Monitor',
  description:
    "Clinical research associate's site-monitoring surface for Cohortiq on oncology trial CTQ-204-ALX ('ALX-204 in Relapsed Follicular Lymphoma', Phase II) at Site 014 — Meridian Clinical Research, Omaha, anchored to Sun Jun 28, 2026: a participants-by-visits VisitWindowMatrix (12 participants x 8 visits = 96 cells, 64x40px cells, 300px sticky-left rail sharing ONE scroller with the columns so rows never misalign) where every cell encodes the actual visit date relative to its protocol window bracket — a 44px track with 2x10px bracket ticks and a 6px dot positioned by deltaDays/windowPlus, clamped so breaches visibly sit OUTSIDE the bracket (P-1023:C1D15 ships at +5 days against a −3/+3 window), with distinct shape channels for in-window (solid green dot), out-of-window (amber dot beyond bracket + 1px cell outline), missed (hollow red dot + track slash), scheduled-future (outline dot + dashed track), and locked (45° hatch + 10px lock glyph, reason-parameterized: red safety-hold vs grey withdrawal on P-1035's post-C2D1 row); a CTCAE AEGradeSelector (5 stepped blocks 12→36px on a 36px baseline, criteria caption box, Related/Unrelated toggle) whose Grade>=3 + related threshold on AE-31 'Febrile neutropenia' cascades a full SAE workflow in ONE state update — P-1042's rail row gains a pulsing badge and jumps to the top under Safety sort, every future cell flips to safety-hold hatch, an '18:22 to report' countdown chip mounts top-right, and auto-query Q-AUTO opens on the onset visit (open-queries stat increments 1→2); lowering the grade reverses every effect; QueryChipThread lifecycle chips on cells (open amber / answered blue / closed grey+tick) expand in the 400px aside to a status stepper, coworker-voiced message threads (closed Q-3 carries 6 messages and a 'Source verified by D. Okafor — 28 Jun 2026' row), reply input, and advance action; toolbar carries Safety/ID sort, visit-type filter chips, an open-queries filter that dims non-query cells to 35%, and a live 'Window compliance 91.8% · 45/49 in-window' aggregate derived from the cells; rail footer computes 'Enrolled 12 / 30 · Screen-fail 1'. Container-width responsive (ResizeObserver on the view root): >=1200px full geometry; 1000–1200px rail 260/cells 56/aside 360 with glyph-only chips; <1000px the aside becomes a 360px overlay with Escape-close and focus restore. Choose over lims-plate-workbench when the row/column axes are participants x protocol visits with window-relative DATE encodings and monitor-coordinator query threads, not samples on a spatial 96-well plate with QC lineage; choose over claims-adjudication-workbench when a value crossing a regulatory threshold (CTCAE grade) must visibly change workflow class across the whole screen, not line-item financial adjudication with rule traces; choose over grid-feeder-console when the cascade is a safety-reporting workflow (locks, countdown, auto-query) rather than electrical interlocks on a one-line diagram; do not choose it for generic scheduling, kanban, or patient-chart EHR surfaces.",
  category: 'Scientific - Clinical Trials',
  componentsUsed: [
    'Avatar',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'Selector',
    'StackItem',
    'StatusDot',
    'Text',
    'TextInput',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
