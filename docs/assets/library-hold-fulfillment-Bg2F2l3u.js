var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — one morning pick run (PR-2607-A,
 *   generated 07:45, Maplewood Public Library · Central) of 14 hold items
 *   across 4 stack ranges walked in shelf order: FIC A–G (4 items), FIC H–P
 *   (4), 641–759 nonfiction (3), J PIC & Media (3); 4+4+3+3 = 14 ✓. Ten
 *   patrons referenced by identity from a PATRONS table (email / SMS /
 *   print-postcard contact methods), three pickup branches (Central,
 *   Eastgate, River North — non-Central pickups generate TRANSIT routing
 *   notices instead of READY notices). Seeded run state, cross-checked by
 *   hand: pulled {i-03, i-07, i-12} = 3, missing {i-05} = 1 open shelf
 *   exception (reported 08:12), pending 10; 3 + 1 + 10 = 14 ✓. Seeded
 *   pending notice queue = 4: 1 READY (i-03 → M. Reyes, Central) + 2
 *   TRANSIT (i-07 → Eastgate, i-12 → River North) + 1 DELAY (i-05's open
 *   exception pauses E. Whitfield's hold) — one notice per non-pending
 *   item ✓. One prior batch (2 notices) already sent at 09:15. Runtime
 *   clocks are frozen sequences, never clock reads: exceptions raised this
 *   session stamp 08:31, 08:35, 08:39… (+4 min per raise); batch sends
 *   stamp 11:00, 11:45, 12:30, 13:15… (+45 min per send). No clock reads,
 *   no randomness, no timers, no network assets.
 * @output Stacks — library hold fulfillment console. Center: the pick-run
 *   sheet, 56px item rows grouped under sticky 40px stack-range headers
 *   (call-number span, floor/aisle, per-range n/m tally, and a 72×12
 *   aisle-locator SVG showing where the range sits on the 24-aisle floor
 *   strip); every row carries a mono call number, a custom format glyph
 *   (book spine / folio / disc / audiobook), patron + pickup-branch chips,
 *   and two 40px actions: Pulled / Not on shelf. Above the sheet, a pinned
 *   68px strip carries the run spine — 14 walk-order cells in 4 gapped
 *   clusters that recolor per item state — beside live pulled / exception
 *   / to-go / handled tallies; the header above it carries the brand mark
 *   and run id.
 *   End panel (336px): the shelf-exception lane (each missing item becomes
 *   a card with search hints and three resolutions — found on sorting
 *   cart, transfer next copy, cancel hold & notify) stacked over the
 *   patron notice queue (pending READY / TRANSIT / DELAY / CANCELLED
 *   notices with contact-method glyphs, a Send-batch action, and a sent-
 *   batch log). Signature interaction: marking a row pulled or missing is
 *   ONE mutation on the run store, and the run spine, range tallies,
 *   exception lane, notice queue, and send-batch count all re-derive from
 *   it in the same render; resolving an exception routes it back through
 *   the same store (found → pulled + READY notice; transfer → reassigned +
 *   TRANSIT notice; cancel → CANCELLED + apology notice), and every
 *   mutation has a one-click Undo that drains those surfaces again.
 * @position Page template; emitted by \`astryx template library-hold-fulfillment\`
 *
 * Frame: a 100dvh root div gives Layout height="fill" a definite height in
 * auto-height hosts. LayoutHeader carries the Stacks mark, run title, and
 * (in single-pane mode) the Run / Exceptions / Notices SegmentedControl.
 * A fixed run-spine strip (68px) sits pinned above the scrolling sheet;
 * the sheet and the end panel scroll independently. The end panel is a
 * fixed-width LayoutPanel whose two lanes (exceptions, notices) share one
 * scroll column with 36px section headers.
 *
 * Responsive contract:
 * - >1100px viewport: sheet fills, end panel 336px. The inline demo stage
 *   is ~1045px wide inside a 1440px window and viewport queries do NOT
 *   fire there, so this default must hold at ~1045px container width: 336
 *   + ~700px sheet, and the 56px row grid (96px call cell · fluid title ·
 *   ~250px meta/actions) fits without a breakpoint. It does.
 * - 761–1100px: end panel narrows to 300px; row pickup chips swap the
 *   branch name for its 3-letter code (Eastgate → EAS) to keep one line.
 * - <=760px: single-pane — the panel unmounts and a Run / Exceptions /
 *   Notices SegmentedControl (with live counts) in the header swaps the
 *   three surfaces. Marking an item missing does NOT yank the view to the
 *   exception lane — the row's inline "exception open" chip keeps context;
 *   nothing is hover-only and every action is a real >=40px button.
 * - Usable at 390px (embed iframe; queries DO fire there): the header
 *   sheds the run subtitle, the run spine keeps all 14 cells (they
 *   compress, cluster gaps survive), rows restack via the <=480px grid
 *   (call number + glyph line 1, title line 2, chips line 3, actions
 *   stacked at the right, 40px tall), and the aisle-locator SVG hides.
 *
 * Container policy (work-sheet archetype): rows, rails, and lanes — no
 * cards in the sheet. The only card-shaped things are exception cards in
 * the lane, because each one is a decision surface with three actions.
 * Sticky range headers are structural chrome, not decoration.
 *
 * Color policy: token-first — all chrome from var(--color-*) tokens. ONE
 * quarantined brand accent, Stacks forest green, as a light-dark() pair
 * with contrast math at the declaration; missing-red and delay-amber state
 * pairs likewise. Text never uses the phantom bare text token (it does not
 * exist and renders black on SVG fill/stroke); everything paints from
 * --color-text-primary / --color-text-secondary or the declared pairs.
 *
 * Density grid (repeated verbatim below): 68px run-spine
 * strip · 40px sticky range headers · 56px item rows · 40×40 (or 40-tall)
 * action buttons · 336px end panel (300px at 761–1100px) · 36px panel
 * section headers · 52px notice rows · 12px gutter via --spacing-3 · 12px
 * mono call numbers · 11px overlines · tabular-nums on every count, clock,
 * and call-number cell.
 *
 * Fixture policy: fixed data only. The run store is the single state
 * owner: Record<itemId, {status, exceptionClock?}> plus a sent-notice key
 * set and two frozen-sequence counters (exceptions raised, batches sent).
 * Everything else — spine cells, range tallies, exception cards, pending
 * notices, batch button count, header stats — derives from it in render.
 */

import {useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CheckIcon,
  MailIcon,
  MessageSquareIcon,
  PrinterIcon,
  SearchXIcon,
  SendIcon,
  TruckIcon,
  Undo2Icon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined brand accent: Stacks forest green.
// #166534 on #FFFFFF ≈ 7.1:1 (passes 4.5:1 with margin, ok down to 11px);
// #66D19E on a ~#1C1C1E dark surface ≈ 9.1:1.
const BRAND_ACCENT = 'light-dark(#166534, #66D19E)';
// Text/glyphs painted OVER a solid BRAND_ACCENT fill:
// #FFFFFF on #166534 ≈ 7.1:1; #08281A on #66D19E ≈ 8.6:1 (white on #66D19E
// would fail at ≈1.9:1, so dark-scheme fills flip their ink).
const BRAND_ON = 'light-dark(#FFFFFF, #08281A)';
// Pulled-row / ready-chip wash. BRAND_ACCENT text on the washed surface:
// #166534 on rgba(22,101,52,.10)-over-white (≈ #E7EFE9) ≈ 6.4:1;
// #66D19E on rgba(102,209,158,.14)-over-#1C1C1E ≈ 7.6:1.
const BRAND_TINT =
  'light-dark(rgba(22, 101, 52, 0.10), rgba(102, 209, 158, 0.14))';
// Missing / exception red. #B42318 on #FFFFFF ≈ 6.6:1;
// #F97066 on ~#1C1C1E ≈ 6.2:1.
const MISS_HUE = 'light-dark(#B42318, #F97066)';
// Missing-row wash; MISS_HUE text on it: #B42318 on rgba(180,35,24,.08)-
// over-white (≈ #F9EBEA) ≈ 6.0:1; #F97066 on the dark wash ≈ 5.4:1.
const MISS_TINT =
  'light-dark(rgba(180, 35, 24, 0.08), rgba(249, 112, 102, 0.14))';
// Delay / transfer amber. #B45309 on #FFFFFF ≈ 4.6:1;
// #F5B458 on ~#1C1C1E ≈ 9.6:1.
const WARN_HUE = 'light-dark(#B45309, #F5B458)';
// Amber wash; WARN_HUE text on it ≈ 4.3:1 light / 8.2:1 dark — used only
// for 11px/600 chips that also carry a glyph or label word, so hue is
// never the sole signal.
const WARN_TINT =
  'light-dark(rgba(180, 83, 9, 0.10), rgba(245, 180, 88, 0.14))';

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors scoped under .tpl-library-hold-fulfillment.
// Density grid (verbatim): 68px run-spine strip · 40px
// sticky range headers · 56px item rows · 40×40 action buttons · 336px end
// panel (300px at 761–1100px) · 36px panel section headers · 52px notice
// rows · 12px gutter via --spacing-3 · 12px mono call numbers · 11px
// overlines · tabular-nums on every numeric cell.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.tpl-library-hold-fulfillment {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
}
.tpl-library-hold-fulfillment .lhf-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-library-hold-fulfillment .lhf-btn:disabled {
  cursor: default;
  opacity: 0.55;
}
.tpl-library-hold-fulfillment .lhf-btn:focus-visible,
.tpl-library-hold-fulfillment .lhf-action:focus-visible,
.tpl-library-hold-fulfillment .lhf-resolve:focus-visible,
.tpl-library-hold-fulfillment .lhf-sendbtn:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.tpl-library-hold-fulfillment .lhf-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.tpl-library-hold-fulfillment .lhf-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.tpl-library-hold-fulfillment .lhf-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* ---- run-spine strip: 68px, pinned above the scrolling sheet ---- */
.tpl-library-hold-fulfillment .lhf-spinestrip {
  height: 68px;
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding-inline: var(--spacing-3);
  border-block-end: var(--border-width) solid var(--color-border);
}
.tpl-library-hold-fulfillment .lhf-spine {
  flex: 1;
  min-width: 120px;
  display: flex;
  gap: 8px;
}
.tpl-library-hold-fulfillment .lhf-spinegroup {
  display: flex;
  gap: 2px;
  flex: 1;
}
.tpl-library-hold-fulfillment .lhf-spinecell {
  height: 12px;
  flex: 1;
  min-width: 6px;
  border-radius: 2px;
  background: var(--color-border);
  transition: background-color 160ms ease;
}
.tpl-library-hold-fulfillment .lhf-spinecell[data-s='pulled'] {
  background: \${BRAND_ACCENT};
}
.tpl-library-hold-fulfillment .lhf-spinecell[data-s='missing'] {
  background: \${MISS_HUE};
}
.tpl-library-hold-fulfillment .lhf-spinecell[data-s='reassigned'],
.tpl-library-hold-fulfillment .lhf-spinecell[data-s='cancelled'] {
  background: \${WARN_HUE};
}
.tpl-library-hold-fulfillment .lhf-spinestats {
  display: flex;
  gap: var(--spacing-3);
  align-items: baseline;
  flex: none;
}
.tpl-library-hold-fulfillment .lhf-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}
.tpl-library-hold-fulfillment .lhf-statnum {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
.tpl-library-hold-fulfillment .lhf-statnum[data-tone='brand'] {
  color: \${BRAND_ACCENT};
}
.tpl-library-hold-fulfillment .lhf-statnum[data-tone='miss'] {
  color: \${MISS_HUE};
}
.tpl-library-hold-fulfillment .lhf-statlabel {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ---- sticky 40px stack-range headers ---- */
.tpl-library-hold-fulfillment .lhf-grouphead {
  position: sticky;
  top: 0;
  z-index: 5;
  height: 40px;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding-inline: var(--spacing-3);
  background: var(--color-background);
  border-block-end: var(--border-width) solid var(--color-border);
}
.tpl-library-hold-fulfillment .lhf-grouprange {
  font-family: \${MONO_FONT};
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.tpl-library-hold-fulfillment .lhf-groupwhere {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.tpl-library-hold-fulfillment .lhf-grouptally {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-library-hold-fulfillment .lhf-grouptally[data-done='true'] {
  color: \${BRAND_ACCENT};
}
.tpl-library-hold-fulfillment .lhf-locator {
  flex: none;
  display: block;
}

/* ---- 56px item rows ---- */
.tpl-library-hold-fulfillment .lhf-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: 6px var(--spacing-3);
  border-block-end: var(--border-width) solid var(--color-border);
  transition: background-color 160ms ease;
}
.tpl-library-hold-fulfillment .lhf-row[data-s='pulled'] {
  background: \${BRAND_TINT};
}
.tpl-library-hold-fulfillment .lhf-row[data-s='missing'] {
  background: \${MISS_TINT};
}
.tpl-library-hold-fulfillment .lhf-row[data-s='reassigned'],
.tpl-library-hold-fulfillment .lhf-row[data-s='cancelled'] {
  background: \${WARN_TINT};
}
.tpl-library-hold-fulfillment .lhf-callcell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-start;
}
.tpl-library-hold-fulfillment .lhf-callno {
  font-family: \${MONO_FONT};
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.tpl-library-hold-fulfillment .lhf-titlecell {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.tpl-library-hold-fulfillment .lhf-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-library-hold-fulfillment .lhf-row[data-s='cancelled'] .lhf-title {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}
.tpl-library-hold-fulfillment .lhf-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-library-hold-fulfillment .lhf-chiprow {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}
.tpl-library-hold-fulfillment .lhf-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding-inline: 7px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-library-hold-fulfillment .lhf-chip[data-tone='brand'] {
  border-color: transparent;
  background: \${BRAND_TINT};
  color: \${BRAND_ACCENT};
  font-weight: 600;
}
.tpl-library-hold-fulfillment .lhf-chip[data-tone='miss'] {
  border-color: transparent;
  background: \${MISS_TINT};
  color: \${MISS_HUE};
  font-weight: 600;
}
.tpl-library-hold-fulfillment .lhf-chip[data-tone='warn'] {
  border-color: transparent;
  background: \${WARN_TINT};
  color: \${WARN_HUE};
  font-weight: 600;
}
.tpl-library-hold-fulfillment .lhf-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex: none;
}
.tpl-library-hold-fulfillment .lhf-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 40px;
  min-width: 40px;
  padding-inline: 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 120ms ease, border-color 120ms ease;
}
.tpl-library-hold-fulfillment .lhf-action[data-kind='pull'] {
  border-color: \${BRAND_ACCENT};
  background: \${BRAND_ACCENT};
  color: \${BRAND_ON};
}
.tpl-library-hold-fulfillment .lhf-action[data-kind='miss'] {
  color: \${MISS_HUE};
}
@media (hover: hover) {
  .tpl-library-hold-fulfillment .lhf-action[data-kind='miss']:hover {
    background: \${MISS_TINT};
  }
  .tpl-library-hold-fulfillment .lhf-action[data-kind='undo']:hover {
    background: \${BRAND_TINT};
  }
}

/* ---- end panel: exception lane + notice queue ---- */
.tpl-library-hold-fulfillment .lhf-sectionhead {
  height: 36px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding-inline: var(--spacing-3);
  position: sticky;
  top: 0;
  z-index: 4;
  background: var(--color-background);
  border-block-end: var(--border-width) solid var(--color-border);
}
.tpl-library-hold-fulfillment .lhf-overline {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-library-hold-fulfillment .lhf-card {
  margin: var(--spacing-3);
  border: var(--border-width) solid \${MISS_HUE};
  border-radius: 10px;
  overflow: hidden;
}
.tpl-library-hold-fulfillment .lhf-cardhead {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: \${MISS_TINT};
}
.tpl-library-hold-fulfillment .lhf-cardbody {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tpl-library-hold-fulfillment .lhf-hint {
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.tpl-library-hold-fulfillment .lhf-resolve {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 6px 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  text-align: start;
  transition: border-color 120ms ease;
}
.tpl-library-hold-fulfillment .lhf-resolve:disabled {
  cursor: default;
  opacity: 0.55;
}
@media (hover: hover) {
  .tpl-library-hold-fulfillment .lhf-resolve:hover:enabled {
    border-color: \${BRAND_ACCENT};
  }
}
.tpl-library-hold-fulfillment .lhf-resolve small {
  display: block;
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-secondary);
}
.tpl-library-hold-fulfillment .lhf-noticerow {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 52px;
  padding: 6px var(--spacing-3);
  border-block-end: var(--border-width) solid var(--color-border);
}
.tpl-library-hold-fulfillment .lhf-noticetext {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tpl-library-hold-fulfillment .lhf-sentrow {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  min-height: 36px;
  padding: 4px var(--spacing-3);
  font-variant-numeric: tabular-nums;
}
.tpl-library-hold-fulfillment .lhf-batchbar {
  padding: var(--spacing-3);
  border-block-end: var(--border-width) solid var(--color-border);
}
.tpl-library-hold-fulfillment .lhf-sendbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: var(--border-width) solid \${BRAND_ACCENT};
  background: \${BRAND_ACCENT};
  color: \${BRAND_ON};
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.tpl-library-hold-fulfillment .lhf-sendbtn:disabled {
  border-color: var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: default;
}

/* ---- responsive subtraction ---- */
@media (max-width: 480px) {
  .tpl-library-hold-fulfillment .lhf-row {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas: 'call actions' 'title actions' 'chips actions';
    row-gap: 4px;
  }
  .tpl-library-hold-fulfillment .lhf-callcell {
    grid-area: call;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  .tpl-library-hold-fulfillment .lhf-titlecell {
    grid-area: title;
    display: contents;
  }
  .tpl-library-hold-fulfillment .lhf-titlestack {
    grid-area: title;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .tpl-library-hold-fulfillment .lhf-chiprow {
    grid-area: chips;
  }
  .tpl-library-hold-fulfillment .lhf-actions {
    grid-area: actions;
    flex-direction: column;
    align-items: stretch;
  }
  .tpl-library-hold-fulfillment .lhf-locator {
    display: none;
  }
  .tpl-library-hold-fulfillment .lhf-stat[data-optional='true'] {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tpl-library-hold-fulfillment .lhf-spinecell,
  .tpl-library-hold-fulfillment .lhf-row,
  .tpl-library-hold-fulfillment .lhf-action,
  .tpl-library-hold-fulfillment .lhf-resolve {
    transition: none;
  }
}
\`;

// ---------------------------------------------------------------------------
// DOMAIN TYPES + FIXTURES
// Run PR-2607-A · Maplewood Public Library · Central · generated 07:45.
// 14 items = 4 (FIC A–G) + 4 (FIC H–P) + 3 (641–759) + 3 (J PIC & Media).
// ---------------------------------------------------------------------------

type BranchId = 'central' | 'eastgate' | 'rivernorth';

interface Branch {
  id: BranchId;
  name: string;
  code: string;
}

const BRANCHES: Record<BranchId, Branch> = {
  central: {id: 'central', name: 'Central', code: 'CEN'},
  eastgate: {id: 'eastgate', name: 'Eastgate', code: 'EAS'},
  rivernorth: {id: 'rivernorth', name: 'River North', code: 'RVN'},
};

type ContactMethod = 'email' | 'sms' | 'print';

interface Patron {
  id: string;
  card: string;
  name: string;
  contact: ContactMethod;
}

// Entities by identity — every item references PATRONS.<key> so
// cross-references (rows, exception cards, notices) can never drift.
const PATRONS = {
  okafor: {id: 'okafor', card: 'P-4471', name: 'M. Okafor', contact: 'email'},
  lindqvist: {
    id: 'lindqvist',
    card: 'P-2093',
    name: 'A. Lindqvist',
    contact: 'sms',
  },
  reyes: {id: 'reyes', card: 'P-8815', name: 'M. Reyes', contact: 'email'},
  chen: {id: 'chen', card: 'P-1207', name: 'L. Chen', contact: 'sms'},
  abara: {id: 'abara', card: 'P-6634', name: 'C. Abara', contact: 'email'},
  whitfield: {
    id: 'whitfield',
    card: 'P-0388',
    name: 'E. Whitfield',
    // Print-postcard patron: the stress fixture for the notice queue's
    // contact-method glyphs — cancellations for her go to the print tray.
    contact: 'print',
  },
  dalal: {id: 'dalal', card: 'P-5520', name: 'R. Dalal', contact: 'email'},
  moreau: {id: 'moreau', card: 'P-3961', name: 'S. Moreau', contact: 'sms'},
  kim: {id: 'kim', card: 'P-7742', name: 'J. Kim', contact: 'email'},
  santos: {id: 'santos', card: 'P-9106', name: 'D. Santos', contact: 'print'},
} satisfies Record<string, Patron>;

type PatronKey = keyof typeof PATRONS;

type ItemFormat = 'book' | 'folio' | 'disc' | 'audio';

const FORMAT_LABEL: Record<ItemFormat, string> = {
  book: 'Book',
  folio: 'Folio / oversize',
  disc: 'DVD',
  audio: 'Audiobook',
};

interface StackRange {
  id: string;
  range: string;
  floor: string;
  aisles: string;
  /** Aisle span on the 24-aisle locator strip (1-based, inclusive). */
  aisleFrom: number;
  aisleTo: number;
}

const RANGES: StackRange[] = [
  {
    id: 'g-fic-ag',
    range: 'FIC A–G',
    floor: 'Floor 1',
    aisles: 'Aisles 12–14',
    aisleFrom: 12,
    aisleTo: 14,
  },
  {
    id: 'g-fic-hp',
    range: 'FIC H–P',
    floor: 'Floor 1',
    aisles: 'Aisles 15–17',
    aisleFrom: 15,
    aisleTo: 17,
  },
  {
    id: 'g-nonfic',
    range: '641–759',
    floor: 'Floor 2',
    aisles: 'Aisles 03–06',
    aisleFrom: 3,
    aisleTo: 6,
  },
  {
    id: 'g-media',
    range: 'J PIC & MEDIA',
    floor: 'Ground',
    aisles: 'Aisles 21–22',
    aisleFrom: 21,
    aisleTo: 22,
  },
];

const LOCATOR_AISLE_COUNT = 24;

interface HoldItem {
  id: string;
  rangeId: string;
  callNo: string;
  title: string;
  author: string;
  format: ItemFormat;
  patron: PatronKey;
  pickup: BranchId;
  /** Fixed date strings — the demo's internal today is Jul 9. */
  placed: string;
  expires: string;
  /** Shelf-side note surfaced under the title (stress: long notes). */
  shelfNote?: string;
  /** Another branch holding a circulating copy — enables Transfer. */
  nextCopy?: {branch: BranchId; callNo: string};
  /** Where to look first when the item is not on the shelf. */
  searchHint: string;
}

// Walk order == array order == run-spine cell order.
const ITEMS: HoldItem[] = [
  {
    id: 'i-01',
    rangeId: 'g-fic-ag',
    callNo: 'FIC ADI',
    title: 'Half of a Yellow Sun',
    author: 'Adichie, Chimamanda Ngozi',
    format: 'book',
    patron: 'okafor',
    pickup: 'central',
    placed: 'Jul 2',
    expires: 'Jul 16',
    searchHint: 'Check the A–C reshelving cart at the Floor 1 desk.',
  },
  {
    id: 'i-02',
    rangeId: 'g-fic-ag',
    callNo: 'FIC ATK',
    title: 'Life After Life',
    author: 'Atkinson, Kate',
    format: 'book',
    patron: 'lindqvist',
    pickup: 'eastgate',
    placed: 'Jul 3',
    expires: 'Jul 17',
    nextCopy: {branch: 'rivernorth', callNo: 'FIC ATK c.2'},
    searchHint: 'Two copies at Central — the second may be on display.',
  },
  {
    id: 'i-03',
    rangeId: 'g-fic-ag',
    callNo: 'FIC BEN',
    title: 'The Vanishing Half',
    author: 'Bennett, Brit',
    format: 'book',
    patron: 'reyes',
    pickup: 'central',
    placed: 'Jun 30',
    expires: 'Jul 14',
    searchHint: 'Recently returned — start with the sorting room bins.',
  },
  {
    id: 'i-04',
    rangeId: 'g-fic-ag',
    callNo: 'FIC CLA',
    title: 'Piranesi',
    author: 'Clarke, Susanna',
    format: 'book',
    patron: 'chen',
    pickup: 'rivernorth',
    placed: 'Jul 5',
    expires: 'Jul 19',
    searchHint: 'Slim spine — often pushed behind FIC CLE.',
  },
  {
    id: 'i-05',
    rangeId: 'g-fic-hp',
    callNo: 'FIC LEB',
    // Stress fixture: 92-char title exercises row + exception-card
    // truncation everywhere the title renders.
    title:
      'The Extraordinary Adventures of Arsène Lupin, Gentleman-Burglar — Annotated Centennial Edition',
    author: 'Leblanc, Maurice',
    format: 'book',
    patron: 'whitfield',
    pickup: 'central',
    placed: 'Jun 27',
    expires: 'Jul 11',
    nextCopy: {branch: 'eastgate', callNo: 'FIC LEB c.2'},
    searchHint:
      'Annotated edition is 6 cm thick — check the oversize overflow at the end of Aisle 17.',
  },
  {
    id: 'i-06',
    rangeId: 'g-fic-hp',
    callNo: 'FIC MOR',
    title: 'Beloved',
    author: 'Morrison, Toni',
    format: 'book',
    patron: 'abara',
    pickup: 'central',
    placed: 'Jul 4',
    expires: 'Jul 18',
    searchHint: 'High-turnover title — check the returns chute cart.',
  },
  {
    id: 'i-07',
    rangeId: 'g-fic-hp',
    callNo: 'FIC NGU',
    title: 'The Sympathizer',
    author: 'Nguyen, Viet Thanh',
    format: 'book',
    patron: 'dalal',
    pickup: 'eastgate',
    placed: 'Jul 1',
    expires: 'Jul 15',
    searchHint: 'Book-club season — a copy may be on the staff-picks table.',
  },
  {
    id: 'i-08',
    rangeId: 'g-fic-hp',
    callNo: 'FIC OZE',
    title: 'A Tale for the Time Being',
    author: 'Ozeki, Ruth',
    format: 'book',
    patron: 'moreau',
    pickup: 'central',
    placed: 'Jul 6',
    expires: 'Jul 20',
    searchHint: 'Check adjacent range FIC P — frequently misfiled.',
  },
  {
    id: 'i-09',
    rangeId: 'g-nonfic',
    callNo: '641.5 OTT',
    title: 'Ottolenghi Simple',
    author: 'Ottolenghi, Yotam',
    format: 'book',
    patron: 'kim',
    pickup: 'central',
    placed: 'Jul 3',
    expires: 'Jul 17',
    searchHint: 'Cookbooks drift — sweep 641.5 both directions.',
  },
  {
    id: 'i-10',
    rangeId: 'g-nonfic',
    callNo: '709 GOM',
    title: 'The Story of Art',
    author: 'Gombrich, E. H.',
    format: 'folio',
    patron: 'santos',
    pickup: 'eastgate',
    placed: 'Jun 29',
    expires: 'Jul 13',
    shelfNote: 'FOLIO — shelved flat on the top shelf; ladder at aisle end.',
    searchHint: 'Folio shelf only — never interfiled with the octavos.',
  },
  {
    id: 'i-11',
    rangeId: 'g-nonfic',
    callNo: '746.43 ZIM',
    title: 'Knitting Without Tears',
    author: 'Zimmermann, Elizabeth',
    format: 'book',
    patron: 'lindqvist',
    pickup: 'central',
    placed: 'Jul 7',
    expires: 'Jul 21',
    searchHint: 'Craft circle meets Wednesdays — check the program room.',
  },
  {
    id: 'i-12',
    rangeId: 'g-media',
    callNo: 'J PIC WIL',
    title: 'Knuffle Bunny: A Cautionary Tale',
    author: 'Willems, Mo',
    format: 'book',
    patron: 'moreau',
    pickup: 'rivernorth',
    placed: 'Jul 2',
    expires: 'Jul 16',
    searchHint: 'Picture books live face-out — scan bins W–Z twice.',
  },
  {
    id: 'i-13',
    rangeId: 'g-media',
    callNo: 'DVD 791.43 EVE',
    title: 'Everything Everywhere All at Once',
    author: 'Kwan & Scheinert, dirs.',
    format: 'disc',
    patron: 'okafor',
    pickup: 'central',
    placed: 'Jul 5',
    expires: 'Jul 19',
    shelfNote: 'Verify the disc is in the case before pulling.',
    searchHint: 'Empty display cases point to the locked media drawer.',
  },
  {
    id: 'i-14',
    rangeId: 'g-media',
    callNo: 'CD AUD FIC WHI',
    title: 'The Underground Railroad (audio, 10 discs)',
    author: 'Whitehead, Colson',
    format: 'audio',
    patron: 'abara',
    pickup: 'eastgate',
    placed: 'Jun 26',
    // Expires Jul 11 with internal today Jul 9 → amber "expires Jul 11"
    // chip (i-05 shares the date and shows it too).
    expires: 'Jul 11',
    shelfNote: 'Count the discs — set circulates incomplete.',
    searchHint: 'Audio sets migrate to the listening-corner rack.',
  },
];

// ---- run store ----

type ItemStatus =
  | 'pending'
  | 'pulled'
  | 'missing'
  | 'reassigned'
  | 'cancelled';

interface ItemRunState {
  status: ItemStatus;
  /** Frozen clock stamped when the exception was raised. */
  exceptionClock?: string;
}

// Seeded state: pulled {i-03, i-07, i-12} = 3, missing {i-05} = 1,
// pending 10 → 3 + 1 + 10 = 14 ✓ (matches the @input cross-check).
const SEEDED_RUN: Record<string, ItemRunState> = {
  'i-03': {status: 'pulled'},
  'i-05': {status: 'missing', exceptionClock: '08:12'},
  'i-07': {status: 'pulled'},
  'i-12': {status: 'pulled'},
};

// Frozen clock sequences — never a clock read. Exceptions raised this
// session stamp EXCEPTION_CLOCKS in order; batch sends stamp BATCH_CLOCKS.
const EXCEPTION_CLOCKS = [
  '08:31',
  '08:35',
  '08:39',
  '08:43',
  '08:47',
  '08:51',
  '08:55',
  '08:59',
  '09:03',
  '09:07',
  '09:11',
  '09:15',
  '09:19',
  '09:23',
];
const BATCH_CLOCKS = ['11:00', '11:45', '12:30', '13:15', '14:00', '14:45'];

// Prior batch already sent before this session (fixture log rows).
interface SentBatch {
  id: string;
  clock: string;
  count: number;
  summary: string;
}

const SEEDED_SENT_BATCHES: SentBatch[] = [
  {
    id: 'b-0915',
    clock: '09:15',
    count: 2,
    summary: '2 notices · 1 ready · 1 transit (run PR-2607-A, first sweep)',
  },
];

// ---- notices (derived, never stored while pending) ----

type NoticeKind = 'ready' | 'transit' | 'delay' | 'cancelled';

const NOTICE_LABEL: Record<NoticeKind, string> = {
  ready: 'READY',
  transit: 'TRANSIT',
  delay: 'DELAY',
  cancelled: 'CANCELLED',
};

const NOTICE_TONE: Record<NoticeKind, 'brand' | 'warn' | 'miss'> = {
  ready: 'brand',
  transit: 'warn',
  delay: 'warn',
  cancelled: 'miss',
};

interface Notice {
  /** Stable key: itemId + kind — the sent-set is keyed on this. */
  key: string;
  kind: NoticeKind;
  item: HoldItem;
  patron: Patron;
  line: string;
}

/**
 * The single derivation from run state to a patron notice (or none).
 * pulled → READY (Central pickup) or TRANSIT (other branch);
 * reassigned → TRANSIT from the next-copy branch;
 * cancelled → CANCELLED apology; missing alone → DELAY (hold paused).
 */
function noticeForItem(item: HoldItem, state: ItemRunState): Notice | null {
  const patron = PATRONS[item.patron];
  const pickup = BRANCHES[item.pickup];
  switch (state.status) {
    case 'pulled':
      return item.pickup === 'central'
        ? {
            key: \`\${item.id}:ready\`,
            kind: 'ready',
            item,
            patron,
            line: \`Ready at Central holds shelf · expires \${item.expires}\`,
          }
        : {
            key: \`\${item.id}:transit\`,
            kind: 'transit',
            item,
            patron,
            line: \`Routing Central → \${pickup.name} · ready notice on arrival\`,
          };
    case 'reassigned': {
      const from = item.nextCopy ? BRANCHES[item.nextCopy.branch] : pickup;
      return {
        key: \`\${item.id}:transit\`,
        kind: 'transit',
        item,
        patron,
        line: \`Next copy routing \${from.name} → \${pickup.name}\`,
      };
    }
    case 'missing':
      return {
        key: \`\${item.id}:delay\`,
        kind: 'delay',
        item,
        patron,
        line: \`Hold paused — shelf search open since \${
          state.exceptionClock ?? '08:31'
        }\`,
      };
    case 'cancelled':
      return {
        key: \`\${item.id}:cancelled\`,
        kind: 'cancelled',
        item,
        patron,
        line: 'Only copy unaccounted for — hold cancelled with apology',
      };
    default:
      return null;
  }
}

function stateOf(
  run: Record<string, ItemRunState>,
  itemId: string,
): ItemRunState {
  return run[itemId] ?? {status: 'pending'};
}

/** Handled = anything that no longer needs a shelf visit or a decision. */
function isHandled(status: ItemStatus): boolean {
  return (
    status === 'pulled' || status === 'reassigned' || status === 'cancelled'
  );
}

const CONTACT_GLYPH: Record<
  ContactMethod,
  {icon: typeof MailIcon; label: string}
> = {
  email: {icon: MailIcon, label: 'email'},
  sms: {icon: MessageSquareIcon, label: 'SMS'},
  print: {icon: PrinterIcon, label: 'print postcard'},
};

// ---------------------------------------------------------------------------
// DOMAIN GLYPHS — tiny inline SVGs. Everything strokes/fills with
// currentColor so the glyphs inherit text color (never a phantom token).
// ---------------------------------------------------------------------------

/** Stacks brand mark: three leaning book spines on a shelf line. */
function StacksMark({size = 22}: {size?: number}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      role="img"
      aria-label="Stacks"
      style={{color: BRAND_ACCENT, flex: 'none'}}>
      <rect x="3" y="4" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="9" y="6" width="4" height="12" rx="1" fill="currentColor" opacity="0.75" />
      <rect
        x="17.2"
        y="4.4"
        width="4"
        height="13"
        rx="1"
        fill="currentColor"
        opacity="0.55"
        transform="rotate(12 17.2 4.4)"
      />
      <rect x="2" y="18.6" width="18" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

/**
 * Format glyph: book spine / folio (flat oversize) / disc / audiobook.
 * 16×16, stroke = currentColor; each carries its own aria-label.
 */
function FormatGlyph({format}: {format: ItemFormat}) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    role: 'img' as const,
    'aria-label': FORMAT_LABEL[format],
    style: {color: 'var(--color-text-secondary)', flex: 'none'} as const,
  };
  switch (format) {
    case 'book':
      return (
        <svg {...common}>
          <rect x="4.5" y="2" width="7" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <line x1="6.8" y1="2.6" x2="6.8" y2="13.4" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case 'folio':
      return (
        <svg {...common}>
          <rect x="1.5" y="5" width="13" height="6.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <line x1="1.5" y1="7.4" x2="14.5" y2="7.4" stroke="currentColor" strokeWidth="1" />
          <path d="M5 2.8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'disc':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="8" cy="8" r="1.6" fill="currentColor" />
        </svg>
      );
    case 'audio':
      return (
        <svg {...common}>
          <path
            d="M3 10v-1.5a5 5 0 0 1 10 0V10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <rect x="2" y="9.4" width="3" height="4.2" rx="1" fill="currentColor" />
          <rect x="11" y="9.4" width="3" height="4.2" rx="1" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Aisle locator: a 72×12 strip of the floor's 24 aisles with the range's
 * span highlighted in the brand accent — where this range sits on the
 * walk. Graphic-only (aria-hidden); the text beside it carries the info.
 */
function AisleLocator({range}: {range: StackRange}) {
  const w = 72;
  const h = 12;
  const cell = w / LOCATOR_AISLE_COUNT;
  const x = (range.aisleFrom - 1) * cell;
  const span = (range.aisleTo - range.aisleFrom + 1) * cell;
  return (
    <svg
      className="lhf-locator"
      width={w}
      height={h}
      viewBox={\`0 0 \${w} \${h}\`}
      aria-hidden="true">
      <rect
        x="0.5"
        y="2.5"
        width={w - 1}
        height={h - 5}
        rx="2"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1"
      />
      <rect
        x={x + 1}
        y="4"
        width={Math.max(span - 2, 2)}
        height={h - 8}
        rx="1.5"
        fill={BRAND_ACCENT}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type PaneId = 'run' | 'exceptions' | 'notices';

export default function LibraryHoldFulfillmentTemplate() {
  const toast = useToast();

  // THE run store — single state owner. Every surface derives from these.
  const [run, setRun] = useState<Record<string, ItemRunState>>(SEEDED_RUN);
  /** Notice keys that have left the pending queue in a sent batch. */
  const [sentKeys, setSentKeys] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [sentBatches, setSentBatches] =
    useState<SentBatch[]>(SEEDED_SENT_BATCHES);
  const [exceptionsRaised, setExceptionsRaised] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  // Single-pane mode below 760px: one surface at a time.
  const [pane, setPane] = useState<PaneId>('run');

  const isSinglePane = useMediaQuery('(max-width: 760px)');
  const isNarrow = useMediaQuery('(max-width: 1100px)');

  // ---- derived state (all from the run store, same render) ----

  const pulledCount = ITEMS.filter(
    item => stateOf(run, item.id).status === 'pulled',
  ).length;
  const handledCount = ITEMS.filter(item =>
    isHandled(stateOf(run, item.id).status),
  ).length;
  const missingItems = ITEMS.filter(
    item => stateOf(run, item.id).status === 'missing',
  );
  const toGoCount = ITEMS.filter(
    item => stateOf(run, item.id).status === 'pending',
  ).length;

  const pendingNotices: Notice[] = ITEMS.flatMap(item => {
    const notice = noticeForItem(item, stateOf(run, item.id));
    return notice !== null && !sentKeys.has(notice.key) ? [notice] : [];
  });

  const rangeTally = (rangeId: string) => {
    const rows = ITEMS.filter(item => item.rangeId === rangeId);
    const handled = rows.filter(item =>
      isHandled(stateOf(run, item.id).status),
    ).length;
    return {handled, total: rows.length};
  };

  // ---- mutations (every one toasts + announces) ----

  const markPulled = (item: HoldItem) => {
    setRun(prev => ({...prev, [item.id]: {status: 'pulled'}}));
    const dest = BRANCHES[item.pickup];
    const noticeCopy =
      item.pickup === 'central'
        ? 'ready notice queued'
        : \`transit slip to \${dest.name} queued\`;
    toast({body: \`\${item.callNo} pulled — \${noticeCopy}\`, isAutoHide: true});
    setAnnouncement(
      \`\${item.title} marked pulled. \${
        handledCount + 1
      } of \${ITEMS.length} handled. Notice queued for \${
        PATRONS[item.patron].name
      }.\`,
    );
  };

  const markMissing = (item: HoldItem) => {
    const clock =
      EXCEPTION_CLOCKS[Math.min(exceptionsRaised, EXCEPTION_CLOCKS.length - 1)];
    setRun(prev => ({
      ...prev,
      [item.id]: {status: 'missing', exceptionClock: clock},
    }));
    setExceptionsRaised(prev => prev + 1);
    toast({
      body: \`\${item.callNo} not on shelf — exception opened at \${clock}\`,
      isAutoHide: true,
    });
    setAnnouncement(
      \`\${item.title} reported not on shelf. Exception opened in the shelf-exception lane; delay notice queued for \${
        PATRONS[item.patron].name
      }.\`,
    );
  };

  const undoItem = (item: HoldItem) => {
    setRun(prev => {
      const next = {...prev};
      delete next[item.id];
      return next;
    });
    toast({body: \`\${item.callNo} back to pending\`, isAutoHide: true});
    setAnnouncement(
      \`\${item.title} reset to pending. Its queued notice was withdrawn.\`,
    );
  };

  const resolveFound = (item: HoldItem) => {
    setRun(prev => ({...prev, [item.id]: {status: 'pulled'}}));
    toast({
      body: \`\${item.callNo} found on the sorting cart — pulled\`,
      isAutoHide: true,
    });
    setAnnouncement(
      \`Exception resolved: \${item.title} found and pulled. Ready notice queued.\`,
    );
  };

  const resolveTransfer = (item: HoldItem) => {
    if (!item.nextCopy) {
      return;
    }
    const from = BRANCHES[item.nextCopy.branch];
    setRun(prev => ({
      ...prev,
      [item.id]: {
        status: 'reassigned',
        exceptionClock: stateOf(prev, item.id).exceptionClock,
      },
    }));
    toast({
      body: \`Hold moved to \${item.nextCopy.callNo} at \${from.name}\`,
      isAutoHide: true,
    });
    setAnnouncement(
      \`Exception resolved: next copy at \${from.name} will fill the hold for \${
        PATRONS[item.patron].name
      }. Transit notice queued.\`,
    );
  };

  const resolveCancel = (item: HoldItem) => {
    setRun(prev => ({
      ...prev,
      [item.id]: {
        status: 'cancelled',
        exceptionClock: stateOf(prev, item.id).exceptionClock,
      },
    }));
    toast({
      body: \`Hold cancelled for \${PATRONS[item.patron].name} — apology queued\`,
      isAutoHide: true,
    });
    setAnnouncement(
      \`Exception resolved: hold on \${item.title} cancelled. Apology notice queued for \${
        PATRONS[item.patron].name
      } via \${CONTACT_GLYPH[PATRONS[item.patron].contact].label}.\`,
    );
  };

  const sendBatch = () => {
    if (pendingNotices.length === 0) {
      return;
    }
    const sessionSends = sentBatches.length - SEEDED_SENT_BATCHES.length;
    const clock =
      BATCH_CLOCKS[Math.min(sessionSends, BATCH_CLOCKS.length - 1)];
    const readyCount = pendingNotices.filter(n => n.kind === 'ready').length;
    const transitCount = pendingNotices.filter(
      n => n.kind === 'transit',
    ).length;
    const otherCount = pendingNotices.length - readyCount - transitCount;
    const parts = [
      \`\${pendingNotices.length} notice\${pendingNotices.length === 1 ? '' : 's'}\`,
      \`\${readyCount} ready\`,
      \`\${transitCount} transit\`,
    ];
    if (otherCount > 0) {
      parts.push(\`\${otherCount} delay/cancel\`);
    }
    setSentKeys(prev => {
      const next = new Set(prev);
      for (const notice of pendingNotices) {
        next.add(notice.key);
      }
      return next;
    });
    setSentBatches(prev => [
      ...prev,
      {
        id: \`b-\${clock.replace(':', '')}-\${prev.length}\`,
        clock,
        count: pendingNotices.length,
        summary: parts.join(' · '),
      },
    ]);
    toast({
      body: \`Batch sent at \${clock} — \${pendingNotices.length} notice\${
        pendingNotices.length === 1 ? '' : 's'
      }\`,
      isAutoHide: true,
    });
    setAnnouncement(
      \`Notice batch sent at \${clock}: \${parts.join(', ')}. Queue is empty.\`,
    );
  };

  // ---- run spine strip (68px): 14 walk-order cells in 4 clusters ----

  const spineStrip = (
    <div className="lhf-spinestrip">
      <div
        className="lhf-spine"
        role="img"
        aria-label={\`Run progress: \${handledCount} of \${ITEMS.length} handled, \${missingItems.length} open exception\${
          missingItems.length === 1 ? '' : 's'
        }\`}>
        {RANGES.map(range => (
          <div key={range.id} className="lhf-spinegroup">
            {ITEMS.filter(item => item.rangeId === range.id).map(item => (
              <div
                key={item.id}
                className="lhf-spinecell"
                data-s={stateOf(run, item.id).status}
                title={\`\${item.callNo} — \${stateOf(run, item.id).status}\`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="lhf-spinestats">
        <div className="lhf-stat">
          <span className="lhf-statnum" data-tone="brand">
            {pulledCount}
          </span>
          <span className="lhf-statlabel">pulled</span>
        </div>
        <div className="lhf-stat">
          <span className="lhf-statnum" data-tone="miss">
            {missingItems.length}
          </span>
          <span className="lhf-statlabel">exceptions</span>
        </div>
        <div className="lhf-stat" data-optional="true">
          <span className="lhf-statnum">{toGoCount}</span>
          <span className="lhf-statlabel">to go</span>
        </div>
        <div className="lhf-stat" data-optional="true">
          <span className="lhf-statnum">
            {handledCount}/{ITEMS.length}
          </span>
          <span className="lhf-statlabel">handled</span>
        </div>
      </div>
    </div>
  );

  // ---- item row ----

  const itemRow = (item: HoldItem) => {
    const state = stateOf(run, item.id);
    const patron = PATRONS[item.patron];
    const pickup = BRANCHES[item.pickup];
    const isPending = state.status === 'pending';
    const expiresSoon = item.expires === 'Jul 11';
    const statusChip = (() => {
      switch (state.status) {
        case 'pulled':
          return (
            <span className="lhf-chip" data-tone="brand">
              pulled
            </span>
          );
        case 'missing':
          return (
            <span className="lhf-chip" data-tone="miss">
              exception open · {state.exceptionClock}
            </span>
          );
        case 'reassigned':
          return (
            <span className="lhf-chip" data-tone="warn">
              next copy{' '}
              {item.nextCopy ? BRANCHES[item.nextCopy.branch].code : ''}
            </span>
          );
        case 'cancelled':
          return (
            <span className="lhf-chip" data-tone="miss">
              hold cancelled
            </span>
          );
        default:
          return null;
      }
    })();

    return (
      <div key={item.id} className="lhf-row" data-s={state.status}>
        <div className="lhf-callcell">
          <span className="lhf-callno">{item.callNo}</span>
          <FormatGlyph format={item.format} />
        </div>
        <div className="lhf-titlecell">
          <div className="lhf-titlestack">
            <span className="lhf-title" title={item.title}>
              {item.title}
            </span>
            <span className="lhf-sub">
              {item.author}
              {item.shelfNote ? \` — \${item.shelfNote}\` : ''}
            </span>
          </div>
          <div className="lhf-chiprow">
            <span className="lhf-chip">
              {patron.name} · {patron.card}
            </span>
            <span className="lhf-chip">
              pickup {isNarrow ? pickup.code : pickup.name}
            </span>
            {expiresSoon && (
              <span className="lhf-chip" data-tone="warn">
                expires {item.expires}
              </span>
            )}
            {statusChip}
          </div>
        </div>
        <div className="lhf-actions">
          {isPending ? (
            <>
              <button
                type="button"
                className="lhf-action"
                data-kind="pull"
                onClick={() => markPulled(item)}>
                <Icon icon={CheckIcon} size="sm" color="inherit" />
                Pulled
              </button>
              <button
                type="button"
                className="lhf-action"
                data-kind="miss"
                onClick={() => markMissing(item)}>
                <Icon icon={SearchXIcon} size="sm" color="inherit" />
                Not on shelf
              </button>
            </>
          ) : (
            <button
              type="button"
              className="lhf-action"
              data-kind="undo"
              aria-label={\`Undo — set \${item.callNo} back to pending\`}
              onClick={() => undoItem(item)}>
              <Icon icon={Undo2Icon} size="sm" color="inherit" />
              Undo
            </button>
          )}
        </div>
      </div>
    );
  };

  // ---- pick-run sheet ----

  const runSheet = (
    <div className="lhf-pane">
      {spineStrip}
      <div className="lhf-scroll">
        {RANGES.map(range => {
          const tally = rangeTally(range.id);
          return (
            <section key={range.id} aria-label={\`Stack range \${range.range}\`}>
              <div className="lhf-grouphead">
                <span className="lhf-grouprange">{range.range}</span>
                <span className="lhf-groupwhere">
                  {range.floor} · {range.aisles}
                </span>
                <AisleLocator range={range} />
                <span
                  className="lhf-grouptally"
                  data-done={tally.handled === tally.total ? 'true' : 'false'}>
                  {tally.handled}/{tally.total}
                </span>
              </div>
              {ITEMS.filter(item => item.rangeId === range.id).map(itemRow)}
            </section>
          );
        })}
      </div>
    </div>
  );

  // ---- shelf-exception lane ----

  const exceptionLane = (
    <section aria-label="Shelf exceptions">
      <div className="lhf-sectionhead">
        <span className="lhf-overline">Shelf exceptions</span>
        <StackItem size="fill">
          <span />
        </StackItem>
        <Badge
          label={String(missingItems.length)}
          variant={missingItems.length > 0 ? 'error' : 'neutral'}
        />
      </div>
      {missingItems.length === 0 ? (
        <EmptyState
          title="No open exceptions"
          description="Items marked “Not on shelf” land here with search hints and next-step resolutions."
        />
      ) : (
        missingItems.map(item => {
          const state = stateOf(run, item.id);
          const patron = PATRONS[item.patron];
          return (
            <div key={item.id} className="lhf-card">
              <div className="lhf-cardhead">
                <Icon icon={SearchXIcon} size="sm" color="inherit" />
                <VStack gap={0}>
                  <Text type="body" maxLines={2}>
                    {item.title}
                  </Text>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    <span style={{fontFamily: MONO_FONT, fontSize: 11.5}}>
                      {item.callNo}
                    </span>{' '}
                    · not on shelf at {state.exceptionClock} · hold for{' '}
                    {patron.name}
                  </Text>
                </VStack>
              </div>
              <div className="lhf-cardbody">
                <p className="lhf-hint">{item.searchHint}</p>
                <button
                  type="button"
                  className="lhf-resolve"
                  onClick={() => resolveFound(item)}>
                  <Icon icon={CheckIcon} size="sm" color="inherit" />
                  <span>
                    Found on sorting cart
                    <small>Marks pulled · queues the patron notice</small>
                  </span>
                </button>
                <button
                  type="button"
                  className="lhf-resolve"
                  disabled={!item.nextCopy}
                  onClick={() => resolveTransfer(item)}>
                  <Icon icon={TruckIcon} size="sm" color="inherit" />
                  <span>
                    {item.nextCopy
                      ? \`Transfer next copy — \${item.nextCopy.callNo} at \${
                          BRANCHES[item.nextCopy.branch].name
                        }\`
                      : 'Transfer next copy'}
                    <small>
                      {item.nextCopy
                        ? 'Reassigns the hold · queues a transit notice'
                        : 'No circulating copy at another branch'}
                    </small>
                  </span>
                </button>
                <button
                  type="button"
                  className="lhf-resolve"
                  onClick={() => resolveCancel(item)}>
                  <Icon icon={SendIcon} size="sm" color="inherit" />
                  <span>
                    Cancel hold &amp; notify
                    <small>
                      Apology via {CONTACT_GLYPH[patron.contact].label}
                    </small>
                  </span>
                </button>
              </div>
            </div>
          );
        })
      )}
    </section>
  );

  // ---- patron notice queue ----

  const noticeQueue = (
    <section aria-label="Patron notice queue">
      <div className="lhf-sectionhead">
        <span className="lhf-overline">Patron notices</span>
        <StackItem size="fill">
          <span />
        </StackItem>
        <Badge
          label={\`\${pendingNotices.length} pending\`}
          variant={pendingNotices.length > 0 ? 'info' : 'neutral'}
        />
      </div>
      <div className="lhf-batchbar">
        <button
          type="button"
          className="lhf-sendbtn"
          disabled={pendingNotices.length === 0}
          onClick={sendBatch}>
          <Icon icon={SendIcon} size="sm" color="inherit" />
          {pendingNotices.length === 0
            ? 'Queue empty — nothing to send'
            : \`Send batch (\${pendingNotices.length})\`}
        </button>
      </div>
      {pendingNotices.length === 0 ? (
        <EmptyState
          title="No pending notices"
          description="Pulling items and resolving exceptions queues READY, TRANSIT, DELAY, and CANCELLED notices here."
        />
      ) : (
        pendingNotices.map(notice => {
          const contact = CONTACT_GLYPH[notice.patron.contact];
          return (
            <div key={notice.key} className="lhf-noticerow">
              <span className="lhf-chip" data-tone={NOTICE_TONE[notice.kind]}>
                {NOTICE_LABEL[notice.kind]}
              </span>
              <div className="lhf-noticetext">
                <span className="lhf-title" title={notice.item.title}>
                  {notice.patron.name} · {notice.item.title}
                </span>
                <span className="lhf-sub">{notice.line}</span>
              </div>
              <span title={\`Delivery: \${contact.label}\`}>
                <Icon icon={contact.icon} size="sm" color="secondary" />
                <span className="lhf-vh">Delivery: {contact.label}</span>
              </span>
            </div>
          );
        })
      )}
      <div className="lhf-sectionhead" style={{position: 'static'}}>
        <span className="lhf-overline">Sent batches</span>
      </div>
      {sentBatches.map(batch => (
        <div key={batch.id} className="lhf-sentrow">
          <span className="lhf-callno">{batch.clock}</span>
          <Text type="supporting" color="secondary" maxLines={1}>
            {batch.summary}
          </Text>
        </div>
      ))}
    </section>
  );

  const endPanel = (
    <div className="lhf-pane">
      <div className="lhf-scroll">
        {exceptionLane}
        <Divider />
        {noticeQueue}
      </div>
    </div>
  );

  // ---- frame ----

  const singlePaneSurface =
    pane === 'exceptions' ? (
      <div className="lhf-pane">
        <div className="lhf-scroll">{exceptionLane}</div>
      </div>
    ) : pane === 'notices' ? (
      <div className="lhf-pane">
        <div className="lhf-scroll">{noticeQueue}</div>
      </div>
    ) : (
      runSheet
    );

  return (
    <div className="tpl-library-hold-fulfillment">
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill" style={{minWidth: 0}}>
                <HStack gap={2} vAlign="center">
                  <StacksMark />
                  <Heading level={1} maxLines={1}>
                    Stacks — Hold pick run
                  </Heading>
                  {!isSinglePane && (
                    <Text type="supporting" color="secondary" maxLines={1}>
                      PR-2607-A · Maplewood Central · generated 07:45
                    </Text>
                  )}
                </HStack>
              </StackItem>
              {isSinglePane && (
                <SegmentedControl
                  label="Console view"
                  value={pane}
                  onChange={value => setPane(value as PaneId)}
                  size="sm"
                  style={{'--size-element-sm': '40px'} as CSSProperties}>
                  <SegmentedControlItem value="run" label="Run" />
                  <SegmentedControlItem
                    value="exceptions"
                    label={\`Exc (\${missingItems.length})\`}
                  />
                  <SegmentedControlItem
                    value="notices"
                    label={\`Notices (\${pendingNotices.length})\`}
                  />
                </SegmentedControl>
              )}
            </HStack>
          </LayoutHeader>
        }
        end={
          !isSinglePane ? (
            <LayoutPanel
              hasDivider
              width={isNarrow ? 300 : 336}
              padding={0}
              label="Exceptions and notices">
              {endPanel}
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent padding={0}>
            <div aria-live="polite" className="lhf-vh">
              {announcement}
            </div>
            {isSinglePane ? singlePaneSurface : runSheet}
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};