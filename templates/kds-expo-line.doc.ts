// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'KDS Expo Line',
  description:
    "Expeditor's kitchen display for Brigade at Harbor & Vine (dinner service, expo M. Osei): a 48px header bar with the knife-tick brand mark, a derived '6 OPEN' pill, and a four-station role=tablist (GRILL / SAUTÉ / FRY / COLD) with unplated-count badges; a 40px all-day strip of top-6 mover chips (FRIES 9, BURGER 7, RIBEYE 4, GNOCCHI 4, HALIBUT 3, CAESAR 1 on load — every count derived at render from the line array, never stored); and a horizontally scrolling ticket rail of fixed 244px fire-ticket columns, oldest and most urgent leftmost — TKT_0415 (TBL 21, 18m of a 15m target) sits far-left with a fully swept red age arc and a 2px rush border. Each column: a 44px header with a 36px inline-SVG TicketAgeChip (outer age-vs-target arc green/amber/red by numeric threshold, inner course-progress ring, center course glyph, fire-state notch; click toggles rush), 32px CourseFireRows with seat boxes, allergy triangles, ellipsizing item names (the 45-char 'Dry-Aged Ribeye au Poivre, Bone-Marrow Butter'), ×qty, and an inline H/F/P tri-state radiogroup — plating strikes the name, unmounts the modifier microrows, and collapses the row 32→24px — under 16px course dividers, and a 32px footer that flips to a BUMP TICKET bar when every line is plated. A pinned 320px expo aside holds four 36px StationLoadMeter rows (one proportional segment per unplated line; segment click scrolls the rail to the owning ticket; COLD starts one plate from its dashed empty-track state), a scrollable all-day list, an 86'd block (Duck Confit, Oysters — click un-86s), and a recall stack pre-seeded with two bumped tickets (restore re-fires their lines so meters and counts visibly re-inflate). One state owner with one update(id, patch): plating ln-0415-2 ripples across the struck row, the advancing inner ring, the shrinking GRILL meter, the RIBEYE all-day chip (4→3), and a polite live region ('Ribeye plated — ticket 0415, 4 of 5.'). Container-width responsive (ResizeObserver on the view root, strictly subtractive): < 1024px drops the aside for a TR 'Recalls (2)' pill and 86'd strip chips; < 880px collapses tabs to 40px icon-only and trims the strip to top-4 + overflow; < 700px narrows columns to 216px and drops the header microtext. Stress fixtures baked in: TKT_0417's 9 lines force internal column scroll, TKT_0416's course 2 is all-hold, TKT_0412 loads with 2 rows already struck. Choose over claims-adjudication-workbench when the core object is a time-pressured WORK QUEUE consumed left-to-right — tickets that age, get partially completed row-by-row, and must reconcile against pinned aggregate counts — not a single-record adjudication cockpit with a detail pane; choose over lims-plate-workbench when work items are transient tickets to burn down, not samples with lineage and QC gates; choose over grid-feeder-console when urgency is per-ticket age against a target, not system-state telemetry with interlocks; choose over dashboard-executive-summary (and any card grid) when every number must be an affordance on live queue rows, not a calm analytical readout. Do not pick for form-heavy admin or chat.",
  category: 'Tools - Kitchen Display',
  componentsUsed: [
    'Button',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
  ],
} satisfies AstryxPageTemplate;

export default template;
