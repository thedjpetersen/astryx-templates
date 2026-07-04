// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'EV Site Power Console',
  description:
    "Ampara depot operator console for Alvarado Depot TX-04 — one 750 kVA transformer shared by three feeders (FDR-A 'West Canopy' 250 kW, FDR-B 'East Canopy (breaker QB-2, 400 A)' 250 kW, FDR-C 'Overflow Pad' 180 kW) and 16 stalls A1–A6/B1–B6/C1–C4 whose charging demand sums to exactly 512 kW at 14:32 site time: a 280px feeder rail with the teal Ampara plug mark, 36px feeder rows, a 248x300 PowerBudgetLadder (0–750 kW plot, solid XFMR 750 line, dashed danger site-cap line that moves with the slider, feeder blocks stacked bottom-up, 6px-hatch reserve band whose tooltip re-prices when the tariff cycles, amber curtailment band when demand exceeds the cap) and a transformer cross-check footer ('512 kW allocated · 600 kW cap · 750 kVA xfmr'); a main column with a 52px header (detented PowerCapSlider 200–750 kW with 10 kW snap and a 600 kW contract tick, TariffChip cycling off-peak $0.07 / shoulder $0.14 / peak $0.31, operator avatar), a 40px filter row (All/Charging/Curtailed/Faulted with live counts + search), and a stall canvas of 72px StallTiles in feeder groups — each led by a 44px StallStateGlyph packing a SOC arc, CCS/NACS/CHAdeMO connector silhouette, 24° fault notch, and 45° amber curtailment hatch into one mark; and a 360px detail aside with an annotated SessionCurveStrip (thermal/load-share cause flags that two-way highlight the attribution rows), a power-attribution table, ticket-prose fault notes (F-312 isolation-monitor lockout, WO-8841), and Pause/Clear-fault actions. The signature move: drag the cap 600→400 and the largest-remainder allocator recomputes every share at once — A3 drops to 62 of 80 kW with a 'Site cap curtailment −18 kW' row, glyphs gain hatching, the ladder grows an amber band, the footer flips to '112 kW curtailed', and a polite live region announces it. Choose over grid-feeder-console when the surface is a CONSUMER-side depot dividing one power budget among chargers — cap slider, per-stall shares, session curves — not a utility SCADA one-line with breaker switching orders; choose over vertical-farm-rack-console when tiles are demand consumers under a shared hard cap, not grow-tier environmental gauges staging a recipe push; choose over ramp-turnaround-console when the resource is continuous kilowatts reallocated live, not scheduled turnaround time on a gantt; choose over kds-expo-line when rows meter power draw rather than fire tickets through hold/fire/plate states.",
  category: 'Tools - EV Charging Network',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Dialog',
    'DialogHeader',
    'Heading',
    'Icon',
    'Layout',
    'LayoutContent',
    'SegmentedControl',
    'SegmentedControlItem',
    'Text',
    'TextInput',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
