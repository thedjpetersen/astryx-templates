// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Crane Lift Planner',
  description:
    "Hoistwell crane lift-planning workbench for plan LP-2141 'Meridian Substation — T-2 Set' — a geometry-coupled engineering calculator where plan-view geometry and load math are ONE system: a 46px header (Hoistwell mark, STANDARD/CRITICAL LIFT stamp, live Signoffs 1/4 counter, Export Plan), a 300px left rail of 36px rigging-inventory checkbox rows (SLNG-204/205, SHCK-118 with no inspection tag, the deliberately long SPRD-11 spreader row, BLCK-07 — 2,270 lb total) plus 44px signoff rows, a fluid 800x520 SVG LiftRadiusPlot (10-ft grid, HL-90 crane pad with outrigger ticks, 12–55 ft sweep annulus under a green→amber→brand capacity gradient, two hatched exclusion zones for the 13.8 kV feeder standoff and open trench E-4, fixed T-2 pick ring, and a draggable role='slider' set point at 38 ft @ 214°), a 200px LoadChartMatrix strip (sticky 88px boom column, 10 radius columns, 6 boom rows, EXTERNALLY-DRIVEN crosshair with a 2px brand-outlined aria-current cell — never hover — amber cells at ≥75% of gross, red strikethrough >100%, '—' not-permitted edges), and a 380px calc pane with a 180° CapacityGauge (76.6% needle over green/amber/red bands), itemized net + rigging = 44,070 lb gross rows, a 6-stop boom selector, and a 340x220 RiggingStackDiagram whose 60/45/30° selector recomputes per-leg loads (1.155x · 12,730 lb) and flips SLNG-205's legs red-overloaded at 30°. Dragging the set point re-derives EVERYTHING from one update(id, patch) store: arc readout, matrix crosshair, gauge needle, header stamp — and crossing 75% of chart injects two amber-Required CL signoff rows (S. Anand PE, J. Whitfield Safety) and flips the stamp to CRITICAL LIFT; unchecking the 1,150 lb spreader lands 74.6% and retracts them. Container-width responsive: 1024–1359px keeps all three panes (272/336/56px cells); below 1024 the rail becomes a header-chip Dialog; below 840 the calc pane becomes header chips + Dialog; below 680 the matrix collapses to a 36px summary bar with a Chart overlay. Choose over grid-feeder-console when the surface is a GEOMETRY calculator — a draggable set point driving a load-chart lookup — not a switching-order ops console over a one-line electrical diagram; choose over court-docketing-console when the derivation chain is continuous engineering math (radius → chart cell → utilization) rather than discrete queue-accept/docket-sequence workflow; choose over degree-audit-workbench when the coupled system is one draggable point plus checkbox-selected rigging re-deriving capacity, not drag-and-drop requirement buckets; choose over broadcast-rundown-console when the crosshair-and-gauge answer is 'can this crane make this pick' rather than clockless show-timing arithmetic.",
  category: 'Construction Engineering',
  componentsUsed: [
    'Button',
    'CheckboxInput',
    'Dialog',
    'DialogHeader',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'SegmentedControl',
    'SegmentedControlItem',
    'StackItem',
    'Text',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
