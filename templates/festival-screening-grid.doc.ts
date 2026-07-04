// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Festival Screening Grid',
  description:
    "Marquee Row film-festival programming board (Edition 14, Jun 11–14) — five venue lanes (The Palace 890 seats down to Rooftop Deck 150) on a 10:00–24:00 timeline at 96px/hour (1.6px/min, 1344px scroll width), where scheduling constraints render as geometry: 104px screening blocks whose width IS runtime, hatched intro/Q&A buffer extensions, premiere-tier corner flags (gold world / teal international / slate regional) that cycle on click, an SVG print-traffic thread layer connecting duplicate 35mm screenings (green feasible / amber tight <30m margin / red dashed infeasible with a 'needs 3h 00m, has 2h 08m' label chip — The Hollow Crown of Prague's Palace→Rooftop hop ships red at load), and 14px per-lane guest-availability ribbons that hatch red where a Q&A overruns the director's on-site window (Saltwind Cathedral's Guild Annex Q&A runs 37m past Ilona Vasquez-Brandt's 9:00 PM departure). Day tabs carry derived conflict-count chips (Fri 3 · Sat 1, omitted on the clean Sunday); the header total reads 4 (2 print + 1 guest + 1 capacity) and gates the Publish button; a 380px aside holds the film detail with a live health checklist (print transit, guest window, premiere sequencing, venue capacity) and a Q&A-buffer toggle; a 56px bottom tray holds 3 unslotted films with a thread legend. Drag (24px→15-min snap, 140px lane retarget, tray drop unslots) and arrow keys run one update(id, patch) path: threads re-route, ribbons gain/lose breaks, every chip re-counts, the checklist rewrites, Publish enables at zero. Stress fixtures baked in: the 72-char Coastlines title on a 261px block (2-line ellipsis), 45-min Ember Notation in glyph-only collapse, an empty Cascade lane with the drag hint, and a 45-char tray title capped at 220px. Choose over ramp-turnaround-console when items are films on a shared clock across PARALLEL RESOURCE LANES with validated dependencies BETWEEN timeline items (print couriers, guest windows) rather than one gantt row per aircraft with intra-turnaround step dependencies; choose over kds-expo-line when position on a time axis is the datum being edited, not a FIFO rail of tickets aging in place; choose over trial-site-monitor when constraints must draw on the schedule's own axis as threads and ribbons, not as window-matrix cells and grade cascades; do not pick it for simple calendars, single-resource timelines, or lists without inter-item dependencies.",
  category: 'Creative - Film Festival Programming',
  componentsUsed: [
    'Button',
    'Dialog',
    'DialogHeader',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'Popover',
    'StackItem',
    'Tab',
    'TabList',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
