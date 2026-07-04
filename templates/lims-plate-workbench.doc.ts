// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Aliquot Plate Workbench',
  description:
    "A bench scientist's plate-and-sample console for the Aliquot LIMS — run RUN-2026-0417 (plate barcode PLT-88F3A1, assay '25-OH Vitamin D — LC-MS/MS') opened for review by analyst Dr. Elena Rivera. A 48px app bar (droplet brand mark + wordmark, a RunSelector dropdown, the ReleaseGateButton, and the user avatar) sits over a 40px run-meta filter strip (run-id Token, mono barcode, truncating assay name, three reagent-lot legend chips, and an active column/row filter chip with a clear-X). Below: a 560px FIXED plate panel holding a fully-custom inline-SVG 96-well grid (8 rows A–H × 12 cols, 36px wells on a 4px gap, a 20px column-selector lane and a 28px row-label lane) where every well carries THREE orthogonal encodings — fill intensity = measured value on a 0.12/0.30/0.50/0.70/0.90 brand-opacity ramp, ring style = sample type (patient solid, calibrator dashed, blank dotted, duplicate double, extract inner-ring), corner tick = QC role (blank slate, spike teal, duplicate indigo) — plus a 44px legend footer; a flex manifest panel (native table, 32px sticky header, 34px rows, sticky aggregate footer whose sample-type tally cross-checks to 96 = 80 patient + 7 calibrators + 3 blanks + 3 spikes + 3 duplicates); and a 360px FIXED custody aside with a four-node chain-of-custody rail (collector Thandi Mbeki → courier Wei Chen → accessioner Sam Okafor → analyst Rivera) carrying one PRE-SEVERED connector (temp excursion 9.2 °C, CUST-DEV-021) on load. The signature interaction is consequence traversal: flagging ONE well (D7, sample S-1047) contaminated propagates through a single store to four other surfaces — the 7 reagent-lot siblings sharing EB-2292 (D5–D8, E5–E8) gain amber hold rings, the manifest rows for the derived 1:10 aliquot F7 and extract H7 flip to 'Hold — parent flagged' and their DilutionLineageChips taint the parent edge red, the custody rail appends an amber QC-deviation node ('8 wells on hold'), and the ReleaseGateButton disables with a tooltip listing all 8 blocked wells. Spatial selection drives the table (clicking a column selector or row label filters the manifest; clicking a manifest row selects its well back on the grid). Deterministic fixtures with dual fields (value/valueDisplay ng/mL, volume/volumeDisplay µL, temp/tempDisplay °C), stress specimens baked in (long 'S-1047-D10-EX-RERUN' id, a max-encoding duplicate-spike well at G11, an unmeasured column 12, and a full calibrator ramp C0–C6 in column 1). role='grid' with roving tabindex, arrow-key navigation, Enter-to-select, F-to-flag, an assertive live region announcing the cascade, and a prefers-reduced-motion path. Choose over matter-workspace when the primary object is a 2D PHYSICAL layout with three-encoding cells and a QC-hold cascade, not a document docket under privilege. Choose over a generic table-index-detail browser when spatial selection on a grid must DRIVE and re-status a table, not the other way around. Choose over kanban-board or pipeline-column boards when the domain is a fixed physical grid whose consequences traverse a reagent-lot/lineage graph rather than columns of cards. Choose over any dashboard when the surface is a working bench console — pick, inspect, flag, trace, gate — not aggregate tiles and charts.",
  category: 'Scientific - Lab LIMS',
  componentsUsed: [
    'Avatar',
    'Button',
    'Dialog',
    'DropdownMenu',
    'Heading',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'Popover',
    'StatusDot',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
