// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Public Records Console',
  description:
    "Daylight — a FOIA officer's working console for the City of Alder Bay records office, anchored to Fri, Jul 4: a 340px request queue of seven tracked requests (DL-2026-0141 … DL-2026-0172) whose 76px DueDateCells encode statutory state (amber 'in 2 bd' at-risk, red '-3 bd' overdue on the Sunlight Collective request, slate 'TOLLED ⏸' on the pre-tolled Meridian & Vance fee-estimate hold) with a due/received sort toggle and a derived ACTIVE/TOLLED/OVERDUE footer; a detail column led by a 96px StatutoryClockRail that renders the 20-business-day clock (§552(a)(6)(A)(i)) as one flex cell per day — solid brand-warm elapsed, outlined remaining, and 45°-hatched tolled spans with a pause glyph that sit inline chronologically but are EXCLUDED from the 20-day sum (asserted invariant: elapsed + remaining = 20); scrubbable ExemptionPageMap strips per document (the 214-pp complaint log carries four runs — b(6) pp 12–40, b(7)(C) 41–58, b(5) 120–131, and the 8-pp b(7)(E) sliver at 190–197 — with a per-page hover readout like 'p. 47 — b(7)(C) · law-enforcement privacy' and tally chips that filter the ledger); a DispositionLedger with 36px rows (Release/Partial/Withhold chips, per-line fees including a 'waived' string row and an em-dash withheld row, plus a zero-document empty state on the Academy request) whose 44px footer is a copy-safe quotable invoice reconciling by construction (Search 3.5 h × $44.00 = $154.00 · Review 2.0 h × $60.00 = $120.00 · Duplication 262 pp × $0.25 = $65.50 → Estimate total $339.50); and a 300px correspondence rail (role=log, 3-line-clamped ticket-shaped letters, outbound brand rule) that collapses to a right-pinned Dialog below 1160px of CONTAINER width. One 'Request clarification' action tolls the Callowhill clock through the single store: the rail sprouts a hatched 10-day span and the due chip flips to 'Due Jul 22 · TOLLED', the queue cell flips to TOLLED ⏸, the derived header counter decrements '2 at risk' → '1 at risk' (aria-live), and the templated clarification letter fades into the log. Choose over matter-workspace when the surface is a DEADLINE-DRIVEN CASEWORK QUEUE whose deadline has legal structure (pause/resume tolling spans with citations), not one matter's privileged hub with key-date countdown chips; choose over court-docketing-console when the clock itself pauses and resumes (tolling excluded from the statutory sum) rather than deadlines chaining forward by offsets from a docketed event; choose over grid-feeder-console when the operational rows are records requests with fee ledgers and correspondence, not electrical devices with interlocked switching steps; choose over table-index-detail when rows carry statutory clocks, exemption page-maps, and a reconciling fee footer instead of generic master-table columns.",
  category: 'Public Sector / Transparency',
  componentsUsed: [
    'Button',
    'Dialog',
    'DialogHeader',
    'Heading',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
