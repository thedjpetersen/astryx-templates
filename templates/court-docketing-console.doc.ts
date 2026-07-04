// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Court Docketing Console',
  description:
    "Clerk-of-court docketing console for Sessions (Dept. Registry) on Monday Jul 6, 2026: a 56px top bar (PorticoMark seal, 20px wordmark, 240px case-number search that live-filters intake, clerk avatar D. Whitcomb); a 280px e-filing intake queue of six pending 64px cards (badge '6 pending', per-case 2+2+1+1) with the pinned Brightline proof-of-service on top and the 100-char Trestle Ridge HOA caption as the truncation stress; an 88px case-header band for CV-2026-01847 'Calloway v. Brightline Freight Co. & Kessler' whose SERVICE/ANSWER flags derive from the chain (amber-pulse 'SERVICE DUE 7/13' pre-acceptance) and scroll the rail to their governing node; a legally-numbered docket entry sequencer ('12 entries · 1 nunc pro tunc · 1 vacated' — 32px immutable number gutter, 88px file-stamp column, italic decimal row 5.1 with a 2px brand rule, entry #7 struck-through PLUS a 'VACATED' badge PLUS reciprocal 'by #11'/'vacates #7' scroll-and-flash pills, two-line declaration row #9 at 56px); a 336px DeadlineChainRail whose 72px nodes SHOW THE ARITHMETIC ('served 6/5 + 21d = 6/26', hatched '+14d stip, entries #6/#8: 6/26 → 7/10' tolling segment, '+120d' connector chips opening derivation popovers, ghosted provisional nodes while Brightline is unserved, and a 'Sat 11/7 → Mon 11/9' weekend-roll caption); and a 200px bottom SessionSlotGrid (28px day tabs Mon 7/6…Fri 7/10 summing to 'Week of Jul 6 — 23 sessions', four judges by four slots, 20px chips with capacity ticks, Whitfield Mon 9:00 at capacity, Askew's Mon row empty, and Amberline Builders LLC conflict-shaded in Whitfield AND Ibarra 10:30). ONE acceptFiling on the pinned proof moves four surfaces: entry #13 mounts with a 300ms stamp-press 'FILED 2026-07-06', computeChain recomputes (Answer — Brightline 6/30 + 21d = 7/21; CMC by Mon 7/20 booked Thu 7/9; +11d delta badges shift Discovery 11/7→11/18, Dispositive 12/7→12/18, Trial-setting 1/21→2/1/2027), CMC and answer-tracking chips drop onto Thu/Fri (header 23→25, Thu tab pulses and auto-activates), and the header flags flip green 'SERVICED 2 of 2 · 7/6' plus amber 'ANSWER DUE 7/21' — with a polite live-region announcement and a toast. Container-width bands (ResizeObserver, not viewport): >=1040px full three-column; 880–1039 the rail folds to a 48px strip opening a Dialog; 720–879 intake becomes a TopBar badge button and the grid shrinks to 168px; <720 single column. Choose over matter-workspace when the operator is the COURT (clerk intake, entry numbering, file stamps, statutory deadline arithmetic), not a law firm's own matter hub with AI provenance and billing; choose over pharmacy-verification-queue when accepting an item must CASCADE across a deadline chain and a session calendar rather than gate a single release decision; choose over calendar-week-agenda when the calendar is a capacity-managed judge-by-slot grid with conflict propagation, not a personal agenda; choose over grid-feeder-console when the dependency chain is date arithmetic under court rules, not electrical switching topology.",
  category: 'Public Sector / Courts',
  componentsUsed: [
    'Avatar',
    'Button',
    'Dialog',
    'DialogHeader',
    'Heading',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'Popover',
    'Text',
    'TextInput',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
