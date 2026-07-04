var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Ottavo Issue 214 "The Craft Issue":
 *   96 PageRecords (PG_001..PG_096) keyed by slotIndex, four sections by
 *   folio range with ad/edit covenants, a fixed advertiser roster
 *   (Meridian Watches on p35 with an RHP guarantee, Halcyon Motors on the
 *   pp 24–25 facing spread, Bram & Daughters' 55-char long-name stress,
 *   Arcadia Airlines), and a close-date chip pre-computed as
 *   'Closes Fri Jul 18 · 14d'. No Date.now, no Math.random, no network
 *   assets.
 * @output Magazine Flatplan Board — a print-pagination surface governed by
 *   bookmaking physics: facing-page SpreadPairs (verso | 2px gutter |
 *   recto) grouped under six 16-page signature brackets, dog-ear
 *   ProofCornerGlyphs whose fold depth encodes blank/laidOut/proofed/
 *   shipped, per-section AdEditRatioGauges with covenant notches, and a
 *   PageDetailPane whose numeric "Move to page…" input is the keyboard
 *   path to the same movePage mutation as the pointer drag. Dragging
 *   Meridian's p35 ad onto a verso slot renumbers folios in place, raises
 *   the red RHP chip + detail Callout, rebalances both section gauges
 *   (Features 62% → 59% amber, below its 60% covenant), and pulses both
 *   touched signature brackets 'reflow'.
 * @position Page template; emitted by \`astryx template magazine-flatplan-board\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header 48px (brand mark + issue title | close chip + Export forms)
 *   | content viewRoot (flex, height 100%, minHeight 0, overflow hidden,
 *     container measured by useElementWidth ResizeObserver):
 *     SectionRail 240 (own scroll, 44px totals footer)
 *     | mainCol (filter row 40px > FlatplanCanvas flex:1 scroll)
 *     | PageDetailPane 380 (inline >= 1180, else right slide-over).
 *   The 48px IssueHeader spans the full frame width (not just mainCol) so
 *   the brand mark owns the top-left corner per the corner map.
 * Container policy: app-shell archetype — rails, rows, and a working
 *   detail pane; no Cards. Page tiles, brackets, and gauges are styled
 *   divs/buttons on the content surface.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (#1F4AA8) split fill vs text: BRAND_FILL light-dark(#1F4AA8, #3D6BD1)
 *   backgrounds only (white on #1F4AA8 = 8.0:1; white on #3D6BD1 = 4.9:1);
 *   BRAND_TEXT light-dark(#1B3E8C, #9DB9F2) (#1B3E8C on white = 9.4:1,
 *   #9DB9F2 on #1E1E1E = 8.2:1). Ad tint is a brand-adjacent 12%-alpha
 *   wash; warning/danger and data-viz colors are tokens with the
 *   repo-standard light-dark fallbacks. Transitions animate
 *   transform/opacity/color only and collapse under prefers-reduced-motion.
 *
 * CANONICAL GRID (verbatim from spec): header bar 48px; filter row 40px;
 * rail rows 36px (section rows heavy variant 44px with gauge); left
 * section rail 240px; right page-detail pane 380px; gutter token
 * GUTTER=12px; page tile 72x96px; spread = 72+2+72 = 146px wide (2px
 * gutter stroke); spread gap 12px; signature bracket rail 28px; detail-
 * pane field rows 36px.
 *
 * Responsive contract (bands key off MEASURED CONTAINER width from
 * useElementWidth on viewRoot, never viewport — the demo stage is
 * ~1045–1075px inside a 1440px window; viewport queries serve only the
 * first pre-observer frame):
 * - >= 1180: detail pane inline at 380px.
 * - < 1180 (THE DEFAULT STAGE STATE): detail pane subtracts from flow and
 *   becomes a 380px right slide-over with scrim, opened by page
 *   selection; Esc/scrim closes; focus trapped (DS useFocusTrap) and
 *   returned to the originating page tile. Canvas gets 240-rail + ~800px:
 *   4-spread rows fit (4x146 + 3x12 + 28 bracket + 32 padding = 680).
 * - < 880: section rail collapses 240 -> 56px icon rail (section color
 *   dots + vertical 4px mini-gauge, names in tooltips); rail footer
 *   totals hide.
 * - < 680: page tiles shrink 72x96 -> 56x74, folio text hides
 *   (ProofCornerGlyph and tints remain), spread = 114px so 4-up still
 *   fits. Subtraction, never reflow-squeeze.
 *
 * Corner map: top-left brand mark (facing-page glyph, recto 2px taller,
 * folio dots) + 'Ottavo — Issue 214 · The Craft Issue'; top-right close
 * chip 'Closes Fri Jul 18 · 14d' + primary 'Export forms' (BRAND_FILL,
 * disabled while violations exist, tooltip names the violating
 * advertiser); bottom-left rail footer 44px live totals; bottom-right
 * floating legend chip (12px inset) explaining ad/edit tints and the four
 * dog-ear proof depths.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import {
  BookOpenIcon,
  CalendarClockIcon,
  LockIcon,
  SendIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useFocusTrap, useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark pair (dark side
// shifted to the lighter 300–400-weight hue). ONE quarantined brand literal
// (#1F4AA8), split fill vs text per the a11y plan.
// ---------------------------------------------------------------------------

// Brand FILL — backgrounds only. White on #1F4AA8 = 8.0:1; white on
// #3D6BD1 = 4.9:1 (both pass 4.5:1 for the Export button label).
const BRAND_FILL = 'light-dark(#1F4AA8, #3D6BD1)';
// Brand TEXT — #1B3E8C on white = 9.4:1; #9DB9F2 on #1E1E1E = 8.2:1.
const BRAND_TEXT = 'light-dark(#1B3E8C, #9DB9F2)';
// Ad tint: brand-adjacent 12%-alpha wash — the SpreadPair ad-page fill and
// the rail-gauge ad segment share this hue family so "ad" reads as one
// color across the surface.
const AD_TINT = 'light-dark(rgba(31, 74, 168, 0.12), rgba(125, 162, 232, 0.18))';
const AD_BAR = 'light-dark(rgba(31, 74, 168, 0.55), rgba(125, 162, 232, 0.62))';
const WARN = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
// Warning TEXT darkened for contrast: #96520A on white = 5.6:1;
// #FFB763 on #1E1E1E = 9.1:1.
const WARN_TEXT = 'light-dark(#96520A, #FFB763)';
const WARN_SOFT = 'light-dark(rgba(235, 110, 0, 0.12), rgba(255, 147, 48, 0.16))';
const DANGER = 'light-dark(#DC2626, #F87171)';
// Danger TEXT: #B91C1C on white = 6.3:1; #F87171 on #1E1E1E = 5.9:1.
const DANGER_TEXT = 'light-dark(#B91C1C, #F87171)';
const DANGER_SOFT = 'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))';
const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
// Section dot colors — data-viz categorical tokens with repo fallbacks.
const SEC_TEAL = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
const SEC_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const SEC_GREEN = OK_GREEN;
const SEC_ORANGE = WARN;

const MONO = 'var(--font-family-code, ui-monospace, monospace)';
const HAIRLINE = 'var(--border-width, 1px) solid var(--color-border)';

// Density grid constants — repeated verbatim from the header comment.
const HEADER_H = 48;
const FILTER_H = 40;
const RAIL_W = 240;
const RAIL_ICON_W = 56;
const PANE_W = 380;
const GUTTER = 12;
const BRACKET_W = 28;
const RAIL_ROW_H = 36;
const RAIL_ROW_HEAVY_H = 44;
const FIELD_ROW_H = 36;
const RAIL_FOOTER_H = 44;
// Page-tile geometry per band: full 72x96 (spread 146), tiny 56x74
// (spread 114) below 680px of container.
const TILE = {full: {w: 72, h: 96}, tiny: {w: 56, h: 74}} as const;

// Container-width bands (measured on viewRoot, not the viewport).
const BAND_PANE_INLINE = 1180;
const BAND_RAIL_COLLAPSE = 880;
const BAND_TINY_TILES = 680;

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, the 1.2s reflow pulse, the
// slide-over entrance, and the reduced-motion guard (static warning
// outline replaces the pulse; the pane appears instantly). Animations are
// color/transform/opacity only.
// ---------------------------------------------------------------------------

const FLATPLAN_CSS = \`
.ofp-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.ofp-reflow-bar {
  animation: ofp-reflow-pulse 1.2s ease-in-out;
}
@keyframes ofp-reflow-pulse {
  0%, 100% { background-color: var(--color-border); }
  40%, 70% { background-color: \${WARN}; }
}
.ofp-slideover {
  animation: ofp-slide-in 200ms ease-out;
}
@keyframes ofp-slide-in {
  from { transform: translateX(24px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.ofp-scrim {
  animation: ofp-fade-in 200ms ease-out;
}
@keyframes ofp-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.ofp-anim {
  transition: width 200ms ease, background-color 200ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .ofp-reflow-bar, .ofp-slideover, .ofp-scrim { animation: none; }
  .ofp-reflow-bar { background-color: \${WARN} !important; }
  .ofp-anim { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// TYPES + FIXTURES — Ottavo Issue 214 "The Craft Issue", 96pp perfect
// bound in six 16-page signatures. Suite "now": Fri Jul 4, so the close
// chip reads 'Closes Fri Jul 18 · 14d' as a pre-computed pair of strings.
// ---------------------------------------------------------------------------

type PageKind = 'ad' | 'edit' | 'blank';
type ProofState = 'blank' | 'laidOut' | 'proofed' | 'shipped';
type Parity = 'recto' | 'verso';

interface PageRecord {
  id: string; // PG_001..PG_096
  slotIndex: number; // 0..95; folio = slotIndex + 1 (derived, never stored)
  kind: PageKind;
  slug: string; // tile slug line, e.g. 'MERIDIAN', 'Loom & Ledger'
  ownerName: string; // advertiser or editor; '' for blank pages
  proofState: ProofState;
  rhpGuaranteed?: boolean; // ad covenant: must land on an odd folio (recto)
  notes: string;
}

interface SectionDef {
  id: string;
  name: string;
  startFolio: number;
  endFolio: number;
  covenantEditMinPct?: number; // SEC_BOB leaves this undefined (gauge omits notch + delta)
  color: string;
  editorName: string;
}

const ISSUE = {
  id: 'ISS_214',
  title: 'The Craft Issue',
  number: 'Issue 214',
  pageCount: 96,
  closeDateLabel: 'Fri Jul 18', // dual fields: label + day count
  closeInDays: 14,
} as const;

// STRESS: 'The Long Table: Food, Drink & Gathering' (40 chars) truncates
// the 240px rail row. SEC_BOB has NO covenant — exercises the gauge's
// omitted notch/delta segments.
const SECTIONS: SectionDef[] = [
  {
    id: 'SEC_FOB',
    name: 'Front of Book',
    startFolio: 1,
    endFolio: 24,
    covenantEditMinPct: 55,
    color: SEC_TEAL,
    editorName: 'Tomás Reyes',
  },
  {
    id: 'SEC_FEATURES',
    name: 'Features',
    startFolio: 25,
    endFolio: 56,
    covenantEditMinPct: 60,
    color: SEC_BLUE,
    editorName: 'Priya Nair',
  },
  {
    id: 'SEC_LONGTABLE',
    name: 'The Long Table: Food, Drink & Gathering',
    startFolio: 57,
    endFolio: 72,
    covenantEditMinPct: 50,
    color: SEC_GREEN,
    editorName: 'Sofia Lindqvist',
  },
  {
    id: 'SEC_BOB',
    name: 'Back of Book',
    startFolio: 73,
    endFolio: 96,
    covenantEditMinPct: undefined,
    color: SEC_ORANGE,
    editorName: 'Ade Bankole',
  },
];

interface Advertiser {
  name: string;
  slug: string; // tile slug line (uppercase, truncates in 72px)
  rhpGuaranteed?: boolean;
  note?: string;
}

// The drag star: contract-guaranteed right-hand page, seeded on p35 recto.
const ADV_MERIDIAN: Advertiser = {
  name: 'Meridian Watches',
  slug: 'MERIDIAN',
  rhpGuaranteed: true,
  note: 'Meridian contract 2026-OTT-114 §4.2: right-hand page, forward of fold-out.',
};
// True facing spread pp 24–25 — straddles the FOB/Features boundary, so
// its two halves count in DIFFERENT section gauges.
const ADV_HALCYON: Advertiser = {
  name: 'Halcyon Motors',
  slug: 'HALCYON',
  note: 'Halcyon IO 2026-OTT-098: true facing spread, pp 24–25 across the FOB/Features break.',
};
// STRESS: 55-char advertiser name truncating in the 72px tile slug, the
// detail-pane header, and the move announcement.
const ADV_BRAM: Advertiser = {
  name: 'Bram & Daughters Distilling Company — Reserve Portfolio',
  slug: 'BRAM & DAUGHTERS RESERVE',
  note: 'Bram & Daughters IO 2026-OTT-131: single full page, Reserve Portfolio creative, right-read preferred but not guaranteed.',
};
const ADV_ARCADIA: Advertiser = {name: 'Arcadia Airlines', slug: 'ARCADIA'};
const ADV_SOLSTICE: Advertiser = {name: 'Solstice Eyewear', slug: 'SOLSTICE'};
const ADV_KILN: Advertiser = {name: 'Kiln & Ember Home', slug: 'KILN & EMBER'};
const ADV_FJELD: Advertiser = {name: 'Fjeld Outdoor', slug: 'FJELD'};
const ADV_VANTAGE: Advertiser = {name: 'Vantage Bank Private', slug: 'VANTAGE'};
const ADV_CALDER: Advertiser = {name: 'Calder Point Vineyards', slug: 'CALDER POINT'};
const ADV_OSTRAND: Advertiser = {name: 'Ostrand Audio', slug: 'OSTRAND'};
const ADV_SOLENNE: Advertiser = {name: 'Solenne Parfums', slug: 'SOLENNE'};
const ADV_ASTER: Advertiser = {name: 'Aster & Vane', slug: 'ASTER & VANE'};
const ADV_BRIGHT: Advertiser = {name: 'Bright Harbor Insurance', slug: 'BRIGHT HARBOR'};
const ADV_TESSELLATE: Advertiser = {name: 'Tessellate Studio', slug: 'TESSELLATE'};
const ADV_PILCROW: Advertiser = {name: 'Pilcrow Press', slug: 'PILCROW'};
const ADV_WRENFIELD: Advertiser = {name: 'Wrenfield Hotels', slug: 'WRENFIELD'};

type SeedRow = Omit<PageRecord, 'id' | 'slotIndex'>;

const ad = (adv: Advertiser, proofState: ProofState): SeedRow => ({
  kind: 'ad',
  slug: adv.slug,
  ownerName: adv.name,
  proofState,
  rhpGuaranteed: adv.rhpGuaranteed,
  notes: adv.note ?? '',
});
const ed = (slug: string, editorName: string, proofState: ProofState, notes = ''): SeedRow => ({
  kind: 'edit',
  slug,
  ownerName: editorName,
  proofState,
  notes,
});

// SEED — one row per folio (array index + 1 = seeded folio). Cross-check
// LAW, derived live by the rail footer: 34 ad + 61 edit + 1 blank = 96 =
// ISSUE.pageCount. (The spec's '34 ad / 62 edit' literal did not reconcile
// with PG_002 kind:'blank'; edit corrected 62 -> 61 and the footer derives
// from the rows so the law stays exact.) Per-section seeds: FOB 9 ad /
// 14 edit / 1 blank (edit 60% of placed vs 55 covenant); Features 12 ad /
// 20 edit (62% vs 60 — one edit-for-ad swap drops it to 59% amber);
// Long Table 6 ad / 10 edit (62% vs 50); BOB 7 ad / 17 edit (no covenant).
// Signature 1 (pp 1–16) is fully shipped => drag-locked (lock tooltip).
// STRESS: PG_002 kind:'blank' (dashed, no folio, no glyph).
const SEED_ROWS: SeedRow[] = [
  ed('Contents', 'Tomás Reyes', 'shipped'), // p1 (recto next to IFC)
  {kind: 'blank', slug: '', ownerName: '', proofState: 'blank', notes: 'Held for IFC partner — release to edit Jul 10 if unsold.'}, // p2 STRESS
  ad(ADV_ARCADIA, 'shipped'), // p3
  ed('Masthead', 'Tomás Reyes', 'shipped'), // p4
  ed('Editor’s Letter', 'Tomás Reyes', 'shipped'), // p5
  ad(ADV_SOLSTICE, 'shipped'), // p6
  ed('Contributors', 'Tomás Reyes', 'shipped'), // p7
  ed('Letters', 'Tomás Reyes', 'shipped'), // p8
  ad(ADV_KILN, 'shipped'), // p9
  ed('Dispatch: Oaxaca', 'Tomás Reyes', 'shipped'), // p10
  ad(ADV_FJELD, 'shipped'), // p11
  ed('Field Notes', 'Tomás Reyes', 'shipped'), // p12
  ad(ADV_VANTAGE, 'shipped'), // p13
  ed('The Ledger', 'Tomás Reyes', 'shipped'), // p14
  ed('Object Lesson', 'Tomás Reyes', 'shipped'), // p15
  ed('Undercurrents', 'Tomás Reyes', 'shipped'), // p16 — SIG 1 ends shipped
  ad(ADV_CALDER, 'proofed'), // p17
  ed('Studio Visit', 'Tomás Reyes', 'proofed'), // p18
  ad(ADV_OSTRAND, 'proofed'), // p19
  ed('The Toolkit', 'Tomás Reyes', 'proofed'), // p20
  ad(ADV_SOLENNE, 'proofed'), // p21
  ed('Provenance', 'Tomás Reyes', 'proofed'), // p22
  ed('Ways of Making', 'Tomás Reyes', 'proofed'), // p23
  ad(ADV_HALCYON, 'proofed'), // p24 — facing-spread verso half (FOB gauge)
  ad(ADV_HALCYON, 'proofed'), // p25 — facing-spread recto half (Features gauge)
  ed('The Glassblowers of Vashon', 'Priya Nair', 'proofed'), // p26
  ad(ADV_SOLENNE, 'proofed'), // p27
  ed('The Glassblowers of Vashon', 'Priya Nair', 'proofed'), // p28
  ed('The Glassblowers of Vashon', 'Priya Nair', 'proofed'), // p29
  ed('The Glassblowers of Vashon', 'Priya Nair', 'proofed'), // p30
  ad(ADV_ASTER, 'proofed'), // p31
  ed('The Glassblowers of Vashon', 'Priya Nair', 'proofed'), // p32
  ed('Hands of the Luthier', 'Priya Nair', 'laidOut'), // p33
  ed('Hands of the Luthier', 'Priya Nair', 'laidOut'), // p34
  ad(ADV_MERIDIAN, 'proofed'), // p35 ★ THE DRAG STAR — recto, RHP guaranteed
  ed('Hands of the Luthier', 'Priya Nair', 'laidOut'), // p36
  ad(ADV_SOLSTICE, 'laidOut'), // p37
  ed('Hands of the Luthier', 'Priya Nair', 'laidOut'), // p38
  ed('Paper Trails', 'Priya Nair', 'laidOut'), // p39
  ed('Paper Trails', 'Priya Nair', 'laidOut'), // p40
  ad(ADV_BRIGHT, 'laidOut'), // p41
  ed('Paper Trails', 'Priya Nair', 'laidOut'), // p42
  ad(ADV_OSTRAND, 'laidOut'), // p43
  ed('Paper Trails', 'Priya Nair', 'laidOut', 'Holding for revised court records — fact-check due Jul 9.'), // p44
  ed('The Last Typewriter Repairman', 'Priya Nair', 'laidOut'), // p45
  ed('The Last Typewriter Repairman', 'Priya Nair', 'laidOut'), // p46
  ad(ADV_FJELD, 'laidOut'), // p47
  ed('The Last Typewriter Repairman', 'Priya Nair', 'laidOut'), // p48
  ad(ADV_SOLENNE, 'laidOut'), // p49
  ed('The Last Typewriter Repairman', 'Priya Nair', 'laidOut'), // p50
  ad(ADV_TESSELLATE, 'laidOut'), // p51
  ed('The Indigo Farmers', 'Priya Nair', 'laidOut'), // p52
  ad(ADV_PILCROW, 'laidOut'), // p53
  ed('The Indigo Farmers', 'Priya Nair', 'laidOut'), // p54
  ad(ADV_VANTAGE, 'laidOut'), // p55
  ed('The Indigo Farmers', 'Priya Nair', 'laidOut'), // p56
  ed('A Table in the Orchard', 'Sofia Lindqvist', 'laidOut'), // p57
  ed('A Table in the Orchard', 'Sofia Lindqvist', 'laidOut'), // p58
  ad(ADV_CALDER, 'laidOut'), // p59
  ed('Natural Wine, Naturally', 'Sofia Lindqvist', 'laidOut'), // p60
  ad(ADV_ASTER, 'laidOut'), // p61
  ed('Natural Wine, Naturally', 'Sofia Lindqvist', 'laidOut'), // p62
  ed('The Bread Course', 'Sofia Lindqvist', 'laidOut'), // p63
  ed('The Bread Course', 'Sofia Lindqvist', 'laidOut'), // p64
  ad(ADV_KILN, 'blank'), // p65 — creative not delivered; materials due Jul 11
  ed('Salt & Smoke', 'Sofia Lindqvist', 'blank'), // p66
  ad(ADV_TESSELLATE, 'blank'), // p67
  ed('Salt & Smoke', 'Sofia Lindqvist', 'laidOut'), // p68
  ad(ADV_WRENFIELD, 'blank'), // p69
  ed('Gathering Notes', 'Sofia Lindqvist', 'blank'), // p70
  ad(ADV_CALDER, 'blank'), // p71
  ed('Recipes Index', 'Sofia Lindqvist', 'blank'), // p72
  ad(ADV_BRAM, 'laidOut'), // p73 — STRESS: 55-char advertiser name
  ed('Reviews: Books', 'Ade Bankole', 'laidOut'), // p74
  ad(ADV_ARCADIA, 'laidOut'), // p75
  ed('Reviews: Objects', 'Ade Bankole', 'laidOut'), // p76
  ed('Reviews: Objects', 'Ade Bankole', 'blank'), // p77
  ed('The Craft Directory', 'Ade Bankole', 'blank'), // p78
  ad(ADV_ASTER, 'blank'), // p79
  ed('The Craft Directory', 'Ade Bankole', 'blank'), // p80
  ed('The Craft Directory', 'Ade Bankole', 'blank'), // p81
  ed('Marketplace', 'Ade Bankole', 'blank'), // p82
  ad(ADV_BRIGHT, 'blank'), // p83
  ed('Marketplace', 'Ade Bankole', 'blank'), // p84
  ed('Marketplace', 'Ade Bankole', 'blank'), // p85
  ed('Classifieds', 'Ade Bankole', 'blank'), // p86
  ad(ADV_PILCROW, 'blank'), // p87
  ed('Classifieds', 'Ade Bankole', 'blank'), // p88
  ed('Stockists', 'Ade Bankole', 'blank'), // p89
  ed('Stockists', 'Ade Bankole', 'blank'), // p90
  ad(ADV_ARCADIA, 'laidOut'), // p91
  ed('Puzzle: The Joinery', 'Ade Bankole', 'blank'), // p92
  ed('Next Issue', 'Ade Bankole', 'blank'), // p93
  ed('Colophon', 'Ade Bankole', 'blank'), // p94
  ad(ADV_WRENFIELD, 'laidOut'), // p95
  ed('The Last Word', 'Ade Bankole', 'laidOut'), // p96
];

const SEED_PAGES: PageRecord[] = SEED_ROWS.map((row, i) => ({
  id: \`PG_\${String(i + 1).padStart(3, '0')}\`,
  slotIndex: i,
  ...row,
}));

// ---------------------------------------------------------------------------
// DERIVED-STATE LAW — everything below is a pure function of the pages
// array. Nothing here is stored: folio = slotIndex + 1, parity, section
// membership, gauges, violations, and signature lock state all re-derive
// per render (one drag ripples through all of them).
// ---------------------------------------------------------------------------

interface PageVM extends PageRecord {
  folio: number;
  parity: Parity;
  section: SectionDef;
  isViolation: boolean; // rhpGuaranteed ad sitting on an even folio (verso)
}

interface SectionAgg {
  def: SectionDef;
  pageCount: number;
  adPages: number;
  editPages: number;
  blankPages: number;
  editPct: number; // edit / (ad + edit), blanks excluded from the ratio
  editPctLabel: string; // floor() so Features seeds at exactly '62%'
  isBelowCovenant: boolean;
}

interface Repagination {
  bySlot: PageVM[]; // index = slotIndex
  byId: Map<string, PageVM>;
  sections: SectionAgg[];
  violations: PageVM[];
  shippedSigIds: ReadonlySet<number>; // every non-blank page proofState === 'shipped'
  totals: {ads: number; edits: number; blanks: number};
}

const sectionOfFolio = (folio: number): SectionDef =>
  SECTIONS.find(s => folio >= s.startFolio && folio <= s.endFolio) ?? SECTIONS[0];

// Signatures are 16-page printable forms: sig 1 = pp 1–16 … sig 6 = pp 81–96.
const sigOfFolio = (folio: number): number => Math.ceil(folio / 16);

function repaginate(pages: readonly PageRecord[]): Repagination {
  const bySlot: PageVM[] = new Array(ISSUE.pageCount);
  const byId = new Map<string, PageVM>();
  for (const page of pages) {
    const folio = page.slotIndex + 1;
    const parity: Parity = folio % 2 === 1 ? 'recto' : 'verso';
    const vm: PageVM = {
      ...page,
      folio,
      parity,
      section: sectionOfFolio(folio),
      isViolation: page.kind === 'ad' && page.rhpGuaranteed === true && parity === 'verso',
    };
    bySlot[page.slotIndex] = vm;
    byId.set(page.id, vm);
  }
  const sections: SectionAgg[] = SECTIONS.map(def => {
    const members = bySlot.filter(vm => vm != null && vm.section.id === def.id);
    const adPages = members.filter(vm => vm.kind === 'ad').length;
    const editPages = members.filter(vm => vm.kind === 'edit').length;
    const blankPages = members.filter(vm => vm.kind === 'blank').length;
    const placed = adPages + editPages;
    const editPct = placed === 0 ? 0 : (editPages / placed) * 100;
    return {
      def,
      pageCount: members.length,
      adPages,
      editPages,
      blankPages,
      editPct,
      editPctLabel: \`\${Math.floor(editPct)}%\`,
      isBelowCovenant:
        def.covenantEditMinPct != null && editPct < def.covenantEditMinPct,
    };
  });
  const violations = bySlot.filter(vm => vm.isViolation);
  const shippedSigIds = new Set<number>();
  for (let sig = 1; sig <= 6; sig++) {
    const members = bySlot.filter(vm => sigOfFolio(vm.folio) === sig);
    if (members.every(vm => vm.kind === 'blank' || vm.proofState === 'shipped')) {
      shippedSigIds.add(sig);
    }
  }
  return {
    bySlot,
    byId,
    sections,
    violations,
    shippedSigIds,
    totals: {
      ads: bySlot.filter(vm => vm.kind === 'ad').length,
      edits: bySlot.filter(vm => vm.kind === 'edit').length,
      blanks: bySlot.filter(vm => vm.kind === 'blank').length,
    },
  };
}

// Openings (reader spreads): p1 is a recto facing the IFC, so opening 0 is
// [IFC — | p1], opening k is [p2k | p2k+1], and opening 48 is [p96 | IBC].
// 96pp + the recto offset yields 49 openings; grouping by the RECTO page's
// signature gives six groups of 8 — the IBC opening (verso p96, no recto)
// appends to SIG 6, which therefore shows 9 openings (4+4+1 rows). That is
// the bookmaking arithmetic, kept over the spec's flat 6x8 count.
interface OpeningVM {
  index: number; // 0..48
  versoSlot: number | null; // slotIndex or null (IFC)
  rectoSlot: number | null; // slotIndex or null (IBC)
  sigId: number;
  straddlesSignatures: boolean; // verso and recto printed on different forms
}

const OPENINGS: OpeningVM[] = Array.from({length: 49}, (_, i) => {
  const versoFolio = i === 0 ? null : 2 * i;
  const rectoFolio = i === 48 ? null : 2 * i + 1;
  const sigId =
    rectoFolio != null ? sigOfFolio(rectoFolio) : sigOfFolio(versoFolio ?? 1);
  return {
    index: i,
    versoSlot: versoFolio != null ? versoFolio - 1 : null,
    rectoSlot: rectoFolio != null ? rectoFolio - 1 : null,
    sigId,
    straddlesSignatures:
      versoFolio != null &&
      rectoFolio != null &&
      sigOfFolio(versoFolio) !== sigOfFolio(rectoFolio),
  };
});

interface SignatureVM {
  id: number;
  label: string; // 'SIG 3 · pp 33–48'
  startFolio: number;
  endFolio: number;
  openings: OpeningVM[];
}

const SIGNATURES: SignatureVM[] = Array.from({length: 6}, (_, i) => {
  const id = i + 1;
  return {
    id,
    label: \`SIG \${id} · pp \${i * 16 + 1}–\${(i + 1) * 16}\`,
    startFolio: i * 16 + 1,
    endFolio: (i + 1) * 16,
    openings: OPENINGS.filter(op => op.sigId === id),
  };
});

// ---------------------------------------------------------------------------
// STYLES — plain CSSProperties records; density constants from the
// canonical grid above.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // 48px issue header — top-left brand, top-right close chip + Export.
  topBar: {
    height: HEADER_H,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 12px',
    boxSizing: 'border-box',
  },
  brandMark: {display: 'inline-flex', color: BRAND_TEXT, flexShrink: 0},
  wordmark: {fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap'},
  issueLabel: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  closeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 26,
    padding: '0 10px',
    borderRadius: 999,
    border: HAIRLINE,
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // The ONE brand-filled control on the page. Disabled state swaps to
  // muted chrome (never a low-contrast brand wash).
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 30,
    padding: '0 12px',
    borderRadius: 'var(--radius-container, 8px)',
    border: 'none',
    backgroundColor: BRAND_FILL,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  exportBtnDisabled: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    cursor: 'not-allowed',
  },
  // View root — the measured container; every band keys off its width.
  viewRoot: {
    display: 'flex',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative', // slide-over + scrim anchor
  },
  // Section rail: 240px (56px icon rail < 880) with its own scroll and a
  // pinned 44px totals footer (bottom-left corner owner).
  rail: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderInlineEnd: HAIRLINE,
    boxSizing: 'border-box',
  },
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 0'},
  railRowBase: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    background: 'transparent',
    textAlign: 'start',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    padding: '0 10px',
  },
  railRowLight: {height: RAIL_ROW_H, display: 'flex', alignItems: 'center', gap: 8},
  railRowHeavy: {height: RAIL_ROW_HEAVY_H, paddingTop: 4, paddingBottom: 4},
  railRowActive: {
    backgroundColor: 'var(--color-background-selected, var(--color-background-muted))',
    boxShadow: \`inset 3px 0 0 0 \${BRAND_FILL}\`,
  },
  railName: {
    fontSize: 13,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    flex: 1,
  },
  railCount: {
    fontSize: 11,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  sectionDot: {width: 12, height: 12, borderRadius: 999, flexShrink: 0},
  railFooter: {
    height: RAIL_FOOTER_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    borderTop: HAIRLINE,
    fontSize: 11,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  // Icon-rail (< 880px) variant rows.
  iconRailBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: '100%',
    height: 44,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },
  miniGaugeTrack: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  // Main column ----------------------------------------------------------
  mainCol: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0},
  filterRow: {
    height: FILTER_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 12px',
    borderBottom: HAIRLINE,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  chipBtn: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '0 10px',
    borderRadius: 999,
    border: HAIRLINE,
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  chipBtnActive: {
    backgroundColor: 'var(--color-background-selected, var(--color-background-muted))',
    borderColor: 'var(--color-accent)',
    color: 'var(--color-text)',
    fontWeight: 600,
  },
  canvasWrap: {position: 'relative', flex: 1, minHeight: 0, display: 'flex'},
  canvas: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 16,
    // Bottom padding clears the floating legend chip (corner map:
    // bottom-right, 12px inset).
    paddingBottom: 56,
    boxSizing: 'border-box',
  },
  emptyCanvas: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '64px 24px',
    textAlign: 'center',
  },
  // Signature group: 28px bracket rail + wrapping rows of 146px openings.
  sigGroup: {display: 'flex', gap: 8, marginBottom: GUTTER + 8},
  bracket: {width: BRACKET_W, flexShrink: 0, position: 'relative'},
  bracketBar: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 18,
    width: 2,
    backgroundColor: 'var(--color-border)',
  },
  bracketTick: {
    position: 'absolute',
    left: 18,
    width: 8,
    height: 2,
    backgroundColor: 'var(--color-border)',
  },
  bracketLabel: {
    position: 'absolute',
    top: 26,
    left: 1,
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    fontSize: 10,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  reflowChip: {
    position: 'absolute',
    top: -4,
    left: 0,
    zIndex: 2,
    fontSize: 10,
    lineHeight: '14px',
    padding: '0 5px',
    borderRadius: 4,
    border: \`1px solid \${WARN}\`,
    backgroundColor: WARN_SOFT,
    color: WARN_TEXT,
    whiteSpace: 'nowrap',
  },
  openings: {flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', gap: GUTTER},
  opening: {display: 'flex', position: 'relative', flexShrink: 0},
  // Page cells — outer corners rounded only; inner edges square against
  // the 2px gutter stroke.
  pageBtn: {
    position: 'relative',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: HAIRLINE,
    backgroundColor: 'var(--color-background-card, var(--color-background))',
    padding: 0,
    font: 'inherit',
    color: 'inherit',
    cursor: 'default',
    touchAction: 'none',
  },
  pageVerso: {borderRadius: '6px 0 0 6px'},
  pageRecto: {borderRadius: '0 6px 6px 0'},
  pageAd: {backgroundColor: AD_TINT},
  pageBlankKind: {
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  // Blank SLOT (IFC/IBC) — not a page at all: dashed, non-interactive.
  blankSlot: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 10,
    fontFamily: MONO,
    whiteSpace: 'nowrap',
  },
  pageDim: {opacity: 0.3},
  pageDragSource: {opacity: 0.45},
  // Violation: inset shadow stacks on the 1px border for a 2px danger
  // ring with zero layout shift.
  pageViolation: {
    borderColor: DANGER,
    boxShadow: \`inset 0 0 0 1px \${DANGER}\`,
  },
  pageSelected: {boxShadow: '0 0 0 2px var(--color-accent)', zIndex: 1},
  pageDropTarget: {boxShadow: \`0 0 0 2px \${OK_GREEN}\`, zIndex: 1},
  slugText: {
    fontSize: 11,
    lineHeight: '14px',
    maxWidth: '100%',
    padding: '0 4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  folioNum: {
    position: 'absolute',
    bottom: 4,
    fontSize: 10,
    lineHeight: '10px',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  glyphCorner: {position: 'absolute', top: 0, display: 'inline-flex'},
  rhpChip: {
    position: 'absolute',
    bottom: -7,
    left: '50%',
    transform: 'translateX(-50%)',
    height: 14,
    lineHeight: '14px',
    padding: '0 4px',
    borderRadius: 3,
    backgroundColor: DANGER,
    // White on #DC2626 = 4.5:1; #3A0D0C on #F87171 = 6.6:1.
    color: 'light-dark(#FFFFFF, #3A0D0C)',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.06em',
    zIndex: 2,
    whiteSpace: 'nowrap',
  },
  gutterStroke: {width: 2, backgroundColor: 'var(--color-border)', flexShrink: 0},
  // Signature-straddling opening: the gutter goes dashed — the two halves
  // print on different forms.
  gutterStraddle: {
    width: 0,
    borderInlineStart: '2px dashed var(--color-border)',
    backgroundColor: 'transparent',
  },
  // Gauge -----------------------------------------------------------------
  gaugeTrackOuter: {position: 'relative', height: 8},
  gaugeTrackClip: {
    display: 'flex',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  gaugeNotch: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 12,
    backgroundColor: 'var(--color-text)',
  },
  gaugeDelta: {
    fontSize: 10,
    lineHeight: '12px',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Legend chip — floats bottom-right over the canvas, 12px inset.
  legend: {
    position: 'absolute',
    bottom: GUTTER,
    right: GUTTER,
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    maxWidth: '92%',
    padding: '5px 10px',
    borderRadius: 8,
    border: HAIRLINE,
    backgroundColor: 'var(--color-background)',
    boxShadow: 'var(--shadow-overlay, 0 2px 12px rgba(0, 0, 0, 0.12))',
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    border: HAIRLINE,
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  legendItem: {display: 'inline-flex', alignItems: 'center', gap: 4},
  // Detail pane ------------------------------------------------------------
  pane: {
    width: PANE_W,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderInlineStart: HAIRLINE,
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background)',
  },
  paneSlideOver: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    insetInlineEnd: 0,
    width: PANE_W,
    maxWidth: '92%',
    zIndex: 30,
    boxShadow: 'var(--shadow-overlay, 0 8px 32px rgba(0, 0, 0, 0.24))',
  },
  scrim: {
    position: 'absolute',
    inset: 0,
    zIndex: 25,
    border: 'none',
    padding: 0,
    backgroundColor: 'light-dark(rgba(15, 23, 42, 0.32), rgba(0, 0, 0, 0.52))',
    cursor: 'pointer',
  },
  paneHeader: {
    height: HEADER_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 12px',
    borderBottom: HAIRLINE,
    boxSizing: 'border-box',
    minWidth: 0,
  },
  paneFolio: {
    fontSize: 18,
    fontWeight: 700,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  paneSlug: {
    fontSize: 13,
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    flex: 1,
  },
  paneScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 12px 16px'},
  fieldRow: {
    minHeight: FIELD_ROW_H,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottom: HAIRLINE,
    boxSizing: 'border-box',
  },
  fieldLabel: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: 12,
    textAlign: 'end',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  fieldBlock: {padding: '10px 0', borderBottom: HAIRLINE},
  callout: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 'var(--radius-container, 8px)',
    border: \`1px solid \${DANGER}\`,
    backgroundColor: DANGER_SOFT,
    marginTop: 8,
  },
  calloutOk: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 'var(--radius-container, 8px)',
    border: HAIRLINE,
    backgroundColor: 'var(--color-background-muted)',
    marginTop: 8,
  },
  moveRow: {display: 'flex', alignItems: 'flex-end', gap: 8, paddingTop: 10},
  moveError: {fontSize: 11, color: DANGER_TEXT, paddingTop: 6},
  paneEmpty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ---------------------------------------------------------------------------
// BRAND MARK — inline SVG facing-page glyph: recto leaf 2px taller, folio
// dots at the outer feet (corner map, top-left).
// ---------------------------------------------------------------------------

function BrandMark() {
  return (
    <span style={styles.brandMark} aria-hidden>
      <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
        <rect x="1.5" y="4.5" width="8" height="12" rx="1" stroke="currentColor" />
        <rect x="12" y="2.5" width="8.5" height="14" rx="1" fill="currentColor" />
        <circle cx="4" cy="19" r="1" fill="currentColor" />
        <circle cx="18.5" cy="19" r="1" fill="currentColor" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// ProofCornerGlyph — TIER fully-custom inline SVG. State lives in corner
// GEOMETRY, not a badge: dog-ear fold depth 0 (blank — no path) / 6px
// outline (laid out) / 10px filled (proofed) / 14px filled + 1px
// fold-shadow (shipped). Mirrored horizontally verso vs recto; <title>
// carries the state name.
// ---------------------------------------------------------------------------

const PROOF_DEPTH: Record<ProofState, number> = {blank: 0, laidOut: 6, proofed: 10, shipped: 14};
const PROOF_LABEL: Record<ProofState, string> = {
  blank: 'Not started',
  laidOut: 'Laid out',
  proofed: 'Proofed',
  shipped: 'Shipped',
};

interface ProofCornerGlyphProps {
  state: ProofState;
  side: Parity;
  size?: number; // 16 on tiles, 20 in the detail-pane header, 13 in the legend
}

function ProofCornerGlyph({state, side, size = 16}: ProofCornerGlyphProps) {
  const d = PROOF_DEPTH[state];
  const isFilled = state === 'proofed' || state === 'shipped';
  // Fold triangle hugs the page's OUTER top corner: top-right on recto,
  // top-left (mirrored) on verso.
  const path =
    side === 'recto' ? \`M16 0 L\${16 - d} 0 L16 \${d} Z\` : \`M0 0 L\${d} 0 L0 \${d} Z\`;
  const shadow =
    side === 'recto'
      ? \`M\${16 - d - 1.5} 0 L16 \${d + 1.5}\`
      : \`M\${d + 1.5} 0 L0 \${d + 1.5}\`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      role="img"
      focusable="false"
      style={{color: state === 'shipped' ? 'var(--color-text)' : 'var(--color-text-secondary)', display: 'block'}}>
      <title>{PROOF_LABEL[state]}</title>
      {d > 0 ? (
        <path
          d={path}
          fill={isFilled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={isFilled ? 0 : 1.25}
        />
      ) : null}
      {state === 'shipped' ? (
        <path d={shadow} stroke="currentColor" strokeWidth={1} strokeOpacity={0.45} fill="none" />
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AdEditRatioGauge — TIER fully-custom: a two-part ratio against a
// covenant, not a progress bar. Left segment = ad share (brand-adjacent
// bar), right = edit; covenant notch is a 2x12px tick measured from the
// RIGHT edge; whole gauge turns amber when editPct < covenant. Delta
// readout omitted when the section has no covenant (SEC_BOB).
// ---------------------------------------------------------------------------

interface AdEditRatioGaugeProps {
  adPages: number;
  editPages: number;
  covenantEditMinPct?: number;
}

function AdEditRatioGauge({adPages, editPages, covenantEditMinPct}: AdEditRatioGaugeProps) {
  const placed = adPages + editPages;
  const editPct = placed === 0 ? 0 : (editPages / placed) * 100;
  const adPct = 100 - editPct;
  const editPctFloor = Math.floor(editPct);
  const isBelow = covenantEditMinPct != null && editPct < covenantEditMinPct;
  const delta = covenantEditMinPct != null ? editPctFloor - covenantEditMinPct : 0;
  return (
    <div>
      <div style={styles.gaugeTrackOuter} aria-hidden>
        <div style={styles.gaugeTrackClip}>
          <div
            className="ofp-anim"
            style={{
              width: \`\${adPct}%\`,
              backgroundColor: isBelow ? WARN : AD_BAR,
            }}
          />
          <div style={{flex: 1}} />
        </div>
        {covenantEditMinPct != null ? (
          <span
            style={{
              ...styles.gaugeNotch,
              right: \`\${covenantEditMinPct}%\`,
              transform: 'translateX(50%)',
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          ...styles.gaugeDelta,
          ...(isBelow ? {color: WARN_TEXT, fontWeight: 600} : null),
        }}>
        {covenantEditMinPct == null
          ? \`\${editPctFloor}% edit · no covenant\`
          : \`\${editPctFloor}% edit · \${delta >= 0 ? \`+\${delta} over\` : \`\${delta} under\`} covenant\`}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SpreadPair — TIER fully-custom (the DS has no facing-page vocabulary).
// 146px flex row: verso 72x96 | 2px gutter stroke | recto 72x96. Purely
// presentational; all state lifted. Opening 0 renders its verso slot as
// 'IFC —', opening 48 its recto as 'IBC —'.
// ---------------------------------------------------------------------------

interface TileGeom {
  w: number;
  h: number;
  showFolio: boolean;
}

interface PageCellCallbacks {
  onSelect: (id: string) => void;
  onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>, vm: PageVM) => void;
  registerTileRef: (id: string, el: HTMLButtonElement | null) => void;
}

interface PageCellProps extends PageCellCallbacks {
  vm: PageVM | null; // null = IFC/IBC blank slot
  side: Parity;
  geom: TileGeom;
  isSelected: boolean;
  isDim: boolean; // present but outside the active filters
  isDragSource: boolean;
  isDropTarget: boolean;
  isLocked: boolean; // signature shipped — drag refused
}

function pageAriaLabel(vm: PageVM): string {
  const parts = [\`Page \${vm.folio}\`, vm.parity];
  if (vm.kind === 'blank') {
    parts.push('blank page');
  } else {
    parts.push(vm.ownerName, vm.kind, PROOF_LABEL[vm.proofState].toLowerCase());
  }
  if (vm.isViolation) parts.push('RHP violation');
  if (vm.rhpGuaranteed === true && !vm.isViolation) parts.push('RHP guaranteed');
  return parts.filter(Boolean).join(', ');
}

function PageCell(props: PageCellProps) {
  const {vm, side, geom, isSelected, isDim, isDragSource, isDropTarget, isLocked} = props;
  const sideStyle = side === 'verso' ? styles.pageVerso : styles.pageRecto;
  if (vm == null) {
    return (
      <div
        style={{...styles.blankSlot, ...sideStyle, width: geom.w, height: geom.h}}
        aria-hidden>
        {side === 'verso' ? 'IFC —' : 'IBC —'}
      </div>
    );
  }
  const isDraggable = vm.kind === 'ad' && !isLocked;
  const cellStyle: CSSProperties = {
    ...styles.pageBtn,
    ...sideStyle,
    width: geom.w,
    height: geom.h,
    ...(vm.kind === 'ad' ? styles.pageAd : null),
    ...(vm.kind === 'blank' ? styles.pageBlankKind : null),
    ...(vm.isViolation ? styles.pageViolation : null),
    ...(isDim ? styles.pageDim : null),
    ...(isDragSource ? styles.pageDragSource : null),
    ...(isSelected ? styles.pageSelected : null),
    ...(isDropTarget ? styles.pageDropTarget : null),
    cursor: isDraggable ? 'grab' : 'default',
  };
  const button = (
    <button
      type="button"
      role="gridcell"
      className="ofp-focusable"
      data-slot={vm.slotIndex}
      aria-label={pageAriaLabel(vm)}
      aria-selected={isSelected}
      style={cellStyle}
      ref={el => props.registerTileRef(vm.id, el)}
      onClick={() => props.onSelect(vm.id)}
      onPointerDown={e => props.onPointerDown(e, vm)}>
      {vm.kind !== 'blank' ? (
        <>
          <span style={styles.slugText}>{vm.slug}</span>
          {geom.showFolio ? (
            <span
              style={{
                ...styles.folioNum,
                ...(side === 'verso' ? {left: 4} : {right: 4}),
              }}
              aria-hidden>
              {vm.folio}
            </span>
          ) : null}
          <span
            style={{
              ...styles.glyphCorner,
              ...(side === 'verso' ? {left: 0} : {right: 0}),
            }}
            aria-hidden>
            <ProofCornerGlyph state={vm.proofState} side={side} />
          </span>
          {vm.isViolation ? <span style={styles.rhpChip}>RHP</span> : null}
        </>
      ) : null}
    </button>
  );
  // Lock tooltip only where the lock actually bites: ads inside a shipped
  // signature (SIG 1 in the seed).
  if (vm.kind === 'ad' && isLocked) {
    return (
      <Tooltip content={\`Signature \${sigOfFolio(vm.folio)} shipped — locked\`}>
        {button}
      </Tooltip>
    );
  }
  return button;
}

interface SpreadPairProps extends PageCellCallbacks {
  opening: OpeningVM;
  bySlot: readonly PageVM[];
  geom: TileGeom;
  selectedId: string | null;
  dragPageId: string | null;
  dragOverSlot: number | null;
  matchesFilter: (vm: PageVM) => boolean;
  shippedSigIds: ReadonlySet<number>;
}

function SpreadPair(props: SpreadPairProps) {
  const {opening, bySlot, geom, selectedId, dragPageId, dragOverSlot} = props;
  const verso = opening.versoSlot != null ? bySlot[opening.versoSlot] : null;
  const recto = opening.rectoSlot != null ? bySlot[opening.rectoSlot] : null;
  const cell = (vm: PageVM | null, side: Parity) => (
    <PageCell
      vm={vm}
      side={side}
      geom={geom}
      isSelected={vm != null && vm.id === selectedId}
      isDim={vm != null && !props.matchesFilter(vm)}
      isDragSource={vm != null && vm.id === dragPageId}
      isDropTarget={vm != null && dragPageId != null && vm.slotIndex === dragOverSlot && vm.id !== dragPageId}
      isLocked={vm != null && props.shippedSigIds.has(sigOfFolio(vm.folio))}
      onSelect={props.onSelect}
      onPointerDown={props.onPointerDown}
      registerTileRef={props.registerTileRef}
    />
  );
  return (
    <div style={styles.opening} role="presentation">
      {cell(verso, 'verso')}
      <div
        style={opening.straddlesSignatures ? styles.gutterStraddle : styles.gutterStroke}
        aria-hidden
      />
      {cell(recto, 'recto')}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SignatureGroup — thin wrapper over a custom bracket: 28px rail (2px bar,
// 8px ticks, rotated mono label), wrapping rows of openings. When the sig
// is in reflowSigIds the bar pulses to the warning token for 1.2s and a
// 'reflow' chip appears at the bracket top (static warning bar under
// prefers-reduced-motion — see FLATPLAN_CSS).
// ---------------------------------------------------------------------------

interface SignatureGroupProps {
  sig: SignatureVM;
  isReflow: boolean;
  isShipped: boolean;
  reflowKey: number; // re-keys the bar so the pulse re-triggers per move
  children: ReactNode;
}

function SignatureGroup({sig, isReflow, isShipped, reflowKey, children}: SignatureGroupProps) {
  return (
    <section
      role="row"
      aria-label={\`Signature \${sig.id}, pages \${sig.startFolio} to \${sig.endFolio}\${isShipped ? ', shipped' : ''}\${isReflow ? ', reflowed by last move' : ''}\`}
      style={styles.sigGroup}>
      <div style={styles.bracket} aria-hidden>
        <div
          key={isReflow ? \`pulse-\${reflowKey}\` : 'still'}
          className={isReflow ? 'ofp-reflow-bar' : undefined}
          style={styles.bracketBar}
        />
        <span style={{...styles.bracketTick, top: 2}} />
        <span style={{...styles.bracketTick, bottom: 2}} />
        <span style={styles.bracketLabel}>
          {sig.label}
          {isShipped ? ' · ⬢' : ''}
        </span>
        {isReflow ? <span style={styles.reflowChip}>reflow</span> : null}
      </div>
      <div style={styles.openings} role="presentation">
        {children}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Floating legend (corner map: bottom-right, 12px inset) — ad tint, edit
// tint, and the four dog-ear proof depths. Static, never interactive.
// ---------------------------------------------------------------------------

function CanvasLegend() {
  return (
    <div style={styles.legend} aria-label="Legend">
      <span style={styles.legendItem}>
        <span style={{...styles.legendSwatch, backgroundColor: AD_TINT}} aria-hidden />
        Ad
      </span>
      <span style={styles.legendItem}>
        <span
          style={{...styles.legendSwatch, backgroundColor: 'var(--color-background-card, var(--color-background))'}}
          aria-hidden
        />
        Edit
      </span>
      <span aria-hidden style={{color: 'var(--color-border)'}}>
        |
      </span>
      {(['blank', 'laidOut', 'proofed', 'shipped'] as const).map(state => (
        <span key={state} style={styles.legendItem}>
          <span style={{...styles.legendSwatch, position: 'relative', overflow: 'hidden'}}>
            <span style={{position: 'absolute', top: -1, right: -1}}>
              <ProofCornerGlyph state={state} side="recto" size={13} />
            </span>
          </span>
          {PROOF_LABEL[state]}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionRailRow + rail — 44px heavy section rows (dot, truncating name,
// right-aligned pp count, gauge), 36px light rows for 'All pages' and
// 'Unplaced ads'. Clicking filters the canvas. Below 880px the rail
// collapses to a 56px icon rail (dots + 4px vertical mini-gauge, names in
// tooltips) and the footer totals hide.
// ---------------------------------------------------------------------------

type SectionFilter = 'all' | 'unplaced' | string; // string = section id

interface SectionRailProps {
  sections: SectionAgg[];
  totals: Repagination['totals'];
  sectionFilter: SectionFilter;
  onFilter: (filter: SectionFilter) => void;
  isCollapsed: boolean;
}

function SectionRail({sections, totals, sectionFilter, onFilter, isCollapsed}: SectionRailProps) {
  if (isCollapsed) {
    return (
      <nav style={{...styles.rail, width: RAIL_ICON_W}} aria-label="Sections">
        <div style={styles.railScroll}>
          <Tooltip content="All pages">
            <button
              type="button"
              className="ofp-focusable"
              aria-label="All pages"
              aria-pressed={sectionFilter === 'all'}
              style={{
                ...styles.iconRailBtn,
                ...(sectionFilter === 'all' ? styles.railRowActive : null),
              }}
              onClick={() => onFilter('all')}>
              <Icon icon={BookOpenIcon} size="sm" color="secondary" />
            </button>
          </Tooltip>
          {sections.map(agg => (
            <Tooltip key={agg.def.id} content={\`\${agg.def.name} · \${agg.pageCount} pp · \${agg.editPctLabel} edit\`}>
              <button
                type="button"
                className="ofp-focusable"
                aria-label={\`\${agg.def.name}, \${agg.pageCount} pages, \${agg.editPctLabel} edit\`}
                aria-pressed={sectionFilter === agg.def.id}
                style={{
                  ...styles.iconRailBtn,
                  ...(sectionFilter === agg.def.id ? styles.railRowActive : null),
                }}
                onClick={() => onFilter(agg.def.id)}>
                <span style={{...styles.sectionDot, backgroundColor: agg.def.color}} aria-hidden />
                <span style={styles.miniGaugeTrack} aria-hidden>
                  <span
                    style={{
                      height: \`\${Math.round(agg.editPct)}%\`,
                      backgroundColor: agg.isBelowCovenant ? WARN : agg.def.color,
                    }}
                  />
                </span>
              </button>
            </Tooltip>
          ))}
        </div>
      </nav>
    );
  }
  return (
    <nav style={{...styles.rail, width: RAIL_W}} aria-label="Sections">
      <div style={styles.railScroll}>
        <button
          type="button"
          className="ofp-focusable"
          aria-pressed={sectionFilter === 'all'}
          style={{
            ...styles.railRowBase,
            ...styles.railRowLight,
            ...(sectionFilter === 'all' ? styles.railRowActive : null),
          }}
          onClick={() => onFilter('all')}>
          <Icon icon={BookOpenIcon} size="xsm" color="secondary" />
          <span style={styles.railName}>All pages</span>
          <span style={styles.railCount}>{ISSUE.pageCount} pp</span>
        </button>
        {sections.map(agg => (
          <button
            key={agg.def.id}
            type="button"
            className="ofp-focusable"
            aria-pressed={sectionFilter === agg.def.id}
            aria-label={\`\${agg.def.name}, \${agg.pageCount} pages, \${agg.editPctLabel} edit\${agg.isBelowCovenant ? ', below covenant' : ''}\`}
            style={{
              ...styles.railRowBase,
              ...styles.railRowHeavy,
              ...(sectionFilter === agg.def.id ? styles.railRowActive : null),
            }}
            onClick={() => onFilter(agg.def.id)}>
            <span style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2}}>
              <span style={{...styles.sectionDot, backgroundColor: agg.def.color}} aria-hidden />
              {/* STRESS: 'The Long Table: Food, Drink & Gathering' truncates here. */}
              <span style={styles.railName}>{agg.def.name}</span>
              <span style={styles.railCount}>{agg.pageCount} pp</span>
            </span>
            <AdEditRatioGauge
              adPages={agg.adPages}
              editPages={agg.editPages}
              covenantEditMinPct={agg.def.covenantEditMinPct}
            />
          </button>
        ))}
        <button
          type="button"
          className="ofp-focusable"
          aria-pressed={sectionFilter === 'unplaced'}
          style={{
            ...styles.railRowBase,
            ...styles.railRowLight,
            ...(sectionFilter === 'unplaced' ? styles.railRowActive : null),
          }}
          onClick={() => onFilter('unplaced')}>
          <span style={{...styles.sectionDot, border: '1px dashed var(--color-border)', backgroundColor: 'transparent'}} aria-hidden />
          <span style={styles.railName}>Unplaced ads</span>
          <span style={styles.railCount}>0</span>
        </button>
      </div>
      {/* Corner map, bottom-left: live totals — the cross-check LAW derives
          from the rows every render: 34 ad + 61 edit + 1 blank = 96 pp. */}
      <div style={styles.railFooter}>
        {ISSUE.pageCount} pp · {totals.ads} ad / {totals.edits} edit / {totals.blanks} blank
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Filter row — 40px: section Selector, 'Ads only' ToggleButton, and
// proof-state chips. All three write the same filter state the rail rows
// write; chips can empty the canvas (e.g. Shipped + Back of Book).
// ---------------------------------------------------------------------------

const PROOF_FILTERS: Array<{id: 'all' | ProofState; label: string}> = [
  {id: 'all', label: 'All'},
  {id: 'blank', label: 'Not started'},
  {id: 'laidOut', label: 'Laid out'},
  {id: 'proofed', label: 'Proofed'},
  {id: 'shipped', label: 'Shipped'},
];

const SECTION_SELECT_ALL = 'All sections';
const SECTION_SELECT_UNPLACED = 'Unplaced ads';

interface FilterRowProps {
  sectionFilter: SectionFilter;
  adsOnly: boolean;
  proofFilter: 'all' | ProofState;
  onSectionFilter: (filter: SectionFilter) => void;
  onAdsOnly: (next: boolean) => void;
  onProofFilter: (filter: 'all' | ProofState) => void;
}

function FilterRow(props: FilterRowProps) {
  const selectorValue =
    props.sectionFilter === 'all'
      ? SECTION_SELECT_ALL
      : props.sectionFilter === 'unplaced'
        ? SECTION_SELECT_UNPLACED
        : SECTIONS.find(s => s.id === props.sectionFilter)?.name ?? SECTION_SELECT_ALL;
  return (
    <div style={styles.filterRow}>
      <div style={{width: 190, flexShrink: 0}}>
        <Selector
          label="Section"
          isLabelHidden
          size="sm"
          options={[SECTION_SELECT_ALL, ...SECTIONS.map(s => s.name), SECTION_SELECT_UNPLACED]}
          value={selectorValue}
          onChange={value => {
            if (value === SECTION_SELECT_ALL) props.onSectionFilter('all');
            else if (value === SECTION_SELECT_UNPLACED) props.onSectionFilter('unplaced');
            else props.onSectionFilter(SECTIONS.find(s => s.name === value)?.id ?? 'all');
          }}
        />
      </div>
      <ToggleButton
        label="Ads only"
        size="sm"
        isPressed={props.adsOnly}
        onPressedChange={props.onAdsOnly}
      />
      <span aria-hidden style={{width: 1, alignSelf: 'stretch', marginBlock: 8, backgroundColor: 'var(--color-border)', flexShrink: 0}} />
      {PROOF_FILTERS.map(f => (
        <button
          key={f.id}
          type="button"
          className="ofp-focusable"
          aria-pressed={props.proofFilter === f.id}
          style={{
            ...styles.chipBtn,
            ...(props.proofFilter === f.id ? styles.chipBtnActive : null),
          }}
          onClick={() => props.onProofFilter(f.id)}>
          {f.id !== 'all' && f.id !== 'blank' ? (
            <ProofCornerGlyph state={f.id} side="recto" size={12} />
          ) : null}
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PageDetailPane — thin wrapper composing DS fields: 48px header (folio +
// slug + 20px ProofCornerGlyph), 36px field rows, proof-state
// SegmentedControl writing update(id, {proofState}), the RHP covenant
// block (danger callout when violated), and the 'Move to page…' numeric
// input — the keyboard/no-drag path to the SAME movePage mutation.
// ---------------------------------------------------------------------------

interface PageDetailPaneProps {
  vm: PageVM | null;
  isLockedSig: boolean;
  isSlideOver: boolean;
  onClose: () => void;
  onProofState: (id: string, state: ProofState) => void;
  onSectionJump: (sectionId: string) => void;
  requestMove: (id: string, folio: number) => string | null;
}

function PageDetailPane(props: PageDetailPaneProps) {
  const {vm} = props;
  const [moveTarget, setMoveTarget] = useState('');
  const [moveError, setMoveError] = useState<string | null>(null);
  // Reset the move scratchpad whenever the pane retargets.
  const lastIdRef = useRef<string | null>(null);
  if (vm?.id !== lastIdRef.current) {
    lastIdRef.current = vm?.id ?? null;
    if (moveTarget !== '' || moveError != null) {
      setMoveTarget('');
      setMoveError(null);
    }
  }
  if (vm == null) {
    return (
      <div style={styles.paneEmpty}>
        <Icon icon={BookOpenIcon} size="md" color="secondary" />
        <Text type="supporting" size="sm" color="secondary">
          Select a page to inspect proof state, covenants, and placement.
        </Text>
      </div>
    );
  }
  const canMove = vm.kind === 'ad' && !props.isLockedSig;
  const submitMove = () => {
    const folio = Number(moveTarget);
    const error = props.requestMove(vm.id, folio);
    setMoveError(error);
    if (error == null) setMoveTarget('');
  };
  return (
    <>
      <div style={styles.paneHeader}>
        <span style={styles.paneFolio}>p.{vm.folio}</span>
        {/* STRESS: Bram & Daughters' 55-char name truncates this slug. */}
        <Heading level={2} style={styles.paneSlug}>
          {vm.kind === 'blank' ? 'Blank page' : vm.kind === 'ad' ? vm.ownerName : vm.slug}
        </Heading>
        <ProofCornerGlyph state={vm.proofState} side={vm.parity} size={20} />
        {props.isSlideOver ? (
          <button
            type="button"
            className="ofp-focusable"
            aria-label="Close page detail"
            style={{...styles.chipBtn, width: 24, height: 24, padding: 0, justifyContent: 'center'}}
            onClick={props.onClose}>
            <Icon icon={XIcon} size="xsm" color="secondary" />
          </button>
        ) : null}
      </div>
      <div style={styles.paneScroll}>
        <div style={styles.fieldRow}>
          <span style={styles.fieldLabel}>{vm.kind === 'ad' ? 'Advertiser' : 'Editor'}</span>
          <span style={styles.fieldValue}>{vm.ownerName === '' ? '—' : vm.ownerName}</span>
        </div>
        <div style={styles.fieldRow}>
          <span style={styles.fieldLabel}>Section</span>
          {/* Affordance: the section value filters the canvas. */}
          <button
            type="button"
            className="ofp-focusable"
            style={{...styles.chipBtn, maxWidth: 220, overflow: 'hidden'}}
            onClick={() => props.onSectionJump(vm.section.id)}>
            <span style={{...styles.sectionDot, width: 8, height: 8, backgroundColor: vm.section.color}} aria-hidden />
            <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>{vm.section.name}</span>
          </button>
        </div>
        <div style={styles.fieldRow}>
          <span style={styles.fieldLabel}>Parity</span>
          <span style={styles.fieldValue}>
            {vm.parity === 'recto' ? \`RECTO (odd folio \${vm.folio})\` : \`VERSO (even folio \${vm.folio})\`}
          </span>
        </div>
        <div style={styles.fieldRow}>
          <span style={styles.fieldLabel}>Kind</span>
          <span style={styles.fieldValue}>{vm.kind === 'ad' ? 'Ad' : vm.kind === 'edit' ? 'Edit' : 'Blank'}</span>
        </div>
        <div style={styles.fieldBlock}>
          <div style={{...styles.fieldLabel, marginBottom: 6}}>Proof state</div>
          <SegmentedControl
            value={vm.proofState}
            onChange={value => props.onProofState(vm.id, value as ProofState)}
            label={\`Proof state for page \${vm.folio}\`}
            size="sm"
            layout="fill"
            isDisabled={vm.kind === 'blank'}>
            <SegmentedControlItem value="blank" label="—" />
            <SegmentedControlItem value="laidOut" label="Laid" />
            <SegmentedControlItem value="proofed" label="Proofed" />
            <SegmentedControlItem value="shipped" label="Shipped" />
          </SegmentedControl>
        </div>
        {vm.rhpGuaranteed === true ? (
          vm.isViolation ? (
            <div style={styles.callout} role="alert">
              <Icon icon={TriangleAlertIcon} size="sm" color="inherit" style={{color: DANGER_TEXT, flexShrink: 0}} />
              <div>
                <Text type="label" size="sm" style={{color: DANGER_TEXT}}>
                  RHP guaranteed — currently VERSO: VIOLATION
                </Text>
                <Text type="supporting" size="xsm" color="secondary">
                  {vm.notes}
                </Text>
              </div>
            </div>
          ) : (
            <div style={styles.calloutOk}>
              <span style={{color: OK_GREEN, display: 'inline-flex', flexShrink: 0}} aria-hidden>
                <ProofCornerGlyph state="proofed" side="recto" size={14} />
              </span>
              <Text type="supporting" size="xsm" color="secondary">
                RHP guaranteed — currently RECTO ✓
              </Text>
            </div>
          )
        ) : null}
        {vm.notes !== '' && !(vm.rhpGuaranteed === true && vm.isViolation) ? (
          <div style={styles.fieldBlock}>
            <div style={{...styles.fieldLabel, marginBottom: 4}}>Notes</div>
            <Text type="supporting" size="xsm" color="secondary">
              {vm.notes}
            </Text>
          </div>
        ) : null}
        <div style={styles.moveRow}>
          <div style={{flex: 1, minWidth: 0}}>
            <TextInput
              label="Move to page…"
              size="sm"
              placeholder="1–96"
              value={moveTarget}
              onChange={value => setMoveTarget(value)}
              isDisabled={!canMove}
              onKeyDown={(e: ReactKeyboardEvent) => {
                if (e.key === 'Enter' && canMove && moveTarget !== '') submitMove();
              }}
            />
          </div>
          <Button label="Move" size="sm" isDisabled={!canMove || moveTarget === ''} onClick={submitMove} />
        </div>
        {!canMove ? (
          <div style={{...styles.moveError, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4}}>
            <Icon icon={LockIcon} size="xsm" color="secondary" />
            {vm.kind !== 'ad'
              ? 'Only ad pages move on this board — edit flow follows repagination.'
              : \`Signature \${sigOfFolio(vm.folio)} shipped — placement locked.\`}
          </div>
        ) : null}
        {moveError != null ? <div style={styles.moveError}>{moveError}</div> : null}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// useElementWidth — container-width ResizeObserver (the demo stage is
// ~1045–1075px inside a 1440px window, so viewport queries never fire
// there; they serve only the width-0 first frame).
// ---------------------------------------------------------------------------

function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// ---------------------------------------------------------------------------
// PAGE — ONE state owner: pages + selectedPageId + lastMove. update() is
// the single mutation path; movePage() is two slotIndex patches (a swap,
// preserving the 96-page invariant). Everything else derives per render
// via repaginate().
// ---------------------------------------------------------------------------

interface LastMove {
  pageId: string;
  fromSlot: number;
  toSlot: number;
  seq: number; // re-keys the reflow pulse
}

export default function MagazineFlatplanBoardTemplate() {
  const [pages, setPages] = useState<PageRecord[]>(SEED_PAGES);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [announcement, setAnnouncement] = useState('');
  // Filters (rail rows, Selector, toggle, and chips all write these).
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');
  const [adsOnly, setAdsOnly] = useState(false);
  const [proofFilter, setProofFilter] = useState<'all' | ProofState>('all');
  // Transient drag state: refs for per-move bookkeeping, minimal mirror in
  // state for painting the source/target highlights.
  const dragInfoRef = useRef<{pageId: string; startX: number; startY: number; moved: boolean} | null>(null);
  const dragOverRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const [drag, setDrag] = useState<{pageId: string; overSlot: number | null} | null>(null);
  const tileRefs = useRef(new Map<string, HTMLButtonElement>());

  // Container-width bands (measured, not viewport).
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(viewRootRef);
  const vpPaneInline = useMediaQuery(\`(min-width: \${BAND_PANE_INLINE}px)\`);
  const vpRailCollapsed = useMediaQuery(\`(max-width: \${BAND_RAIL_COLLAPSE - 1}px)\`);
  const vpTiny = useMediaQuery(\`(max-width: \${BAND_TINY_TILES - 1}px)\`);
  const isPaneInline = containerWidth > 0 ? containerWidth >= BAND_PANE_INLINE : vpPaneInline;
  const isRailCollapsed = containerWidth > 0 ? containerWidth < BAND_RAIL_COLLAPSE : vpRailCollapsed;
  const isTiny = containerWidth > 0 ? containerWidth < BAND_TINY_TILES : vpTiny;
  const tile = isTiny ? TILE.tiny : TILE.full;
  const geom: TileGeom = useMemo(
    () => ({w: tile.w, h: tile.h, showFolio: !isTiny}),
    [tile.w, tile.h, isTiny],
  );

  const repag = useMemo(() => repaginate(pages), [pages]);
  const selectedVm = selectedPageId != null ? repag.byId.get(selectedPageId) ?? null : null;
  const isSlideOverOpen = !isPaneInline && selectedVm != null;

  // --- the single mutation path -------------------------------------------
  const update = useCallback((id: string, patch: Partial<PageRecord>) => {
    setPages(prev => prev.map(p => (p.id === id ? {...p, ...patch} : p)));
  }, []);

  const setProofState = useCallback(
    (id: string, proofState: ProofState) => {
      const vm = repag.byId.get(id);
      update(id, {proofState});
      if (vm != null) {
        setAnnouncement(\`Page \${vm.folio} marked \${PROOF_LABEL[proofState].toLowerCase()}.\`);
      }
    },
    [repag, update],
  );

  // movePage = two update patches swapping slotIndex with the occupant —
  // a swap, so the 96-slot invariant holds by construction. Returns an
  // error string for the detail pane's move control (null = moved).
  const movePage = useCallback(
    (pageId: string, toSlot: number): string | null => {
      const vm = repag.byId.get(pageId);
      if (vm == null) return 'Unknown page.';
      if (!Number.isInteger(toSlot) || toSlot < 0 || toSlot >= ISSUE.pageCount) {
        return \`Enter a folio between 1 and \${ISSUE.pageCount}.\`;
      }
      if (toSlot === vm.slotIndex) return 'Already on that page.';
      if (vm.kind !== 'ad') return 'Only ad pages move on this board.';
      if (repag.shippedSigIds.has(sigOfFolio(vm.folio))) {
        return \`Signature \${sigOfFolio(vm.folio)} shipped — placement locked.\`;
      }
      if (repag.shippedSigIds.has(sigOfFolio(toSlot + 1))) {
        return \`Page \${toSlot + 1} is in shipped signature \${sigOfFolio(toSlot + 1)} — locked.\`;
      }
      const occupant = repag.bySlot[toSlot];
      const fromSlot = vm.slotIndex;
      update(pageId, {slotIndex: toSlot});
      update(occupant.id, {slotIndex: fromSlot});
      setLastMove(prev => ({pageId, fromSlot, toSlot, seq: (prev?.seq ?? 0) + 1}));
      // Announce the derived consequences from the NEXT pagination (pure
      // recompute — same law the render uses).
      const nextRepag = repaginate(
        pages.map(p =>
          p.id === pageId ? {...p, slotIndex: toSlot} : p.id === occupant.id ? {...p, slotIndex: fromSlot} : p,
        ),
      );
      const moved = nextRepag.byId.get(pageId);
      if (moved != null) {
        const parts = [\`\${moved.ownerName} moved to page \${moved.folio}.\`];
        if (moved.isViolation) parts.push('RHP violation.');
        const touched = new Set([sectionOfFolio(fromSlot + 1).id, moved.section.id]);
        for (const agg of nextRepag.sections) {
          if (!touched.has(agg.def.id)) continue;
          parts.push(
            \`\${agg.def.name} section \${Math.floor(agg.editPct)} percent edit\${agg.isBelowCovenant ? ', below covenant' : ''}.\`,
          );
        }
        setAnnouncement(parts.join(' '));
      }
      return null;
    },
    [pages, repag, update],
  );

  // --- selection + slide-over ----------------------------------------------
  const registerTileRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el == null) tileRefs.current.delete(id);
    else tileRefs.current.set(id, el);
  }, []);

  const selectPage = useCallback((id: string) => {
    if (suppressClickRef.current) {
      // A drag just ended on this tile — swallow the trailing click.
      suppressClickRef.current = false;
      return;
    }
    setSelectedPageId(id);
  }, []);

  const closePane = useCallback(() => {
    setSelectedPageId(prev => {
      if (prev != null) tileRefs.current.get(prev)?.focus();
      return null;
    });
  }, []);

  const {containerRef: trapRef, focusFirst} = useFocusTrap<HTMLDivElement>({
    isActive: isSlideOverOpen,
    onEscape: closePane,
  });
  useEffect(() => {
    if (isSlideOverOpen) focusFirst();
  }, [isSlideOverOpen, selectedPageId, focusFirst]);

  // Escape closes the slide-over even when focus sits outside the trap.
  // (The only global shortcut — Escape is safe from typing targets.)
  useEffect(() => {
    if (!isSlideOverOpen) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePane();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSlideOverOpen, closePane]);

  // --- pointer drag (slot rects resolved via data-slot on drop) ------------
  const isValidDropSlot = useCallback(
    (slot: number, pageId: string): boolean => {
      const occupant = repag.bySlot[slot];
      return (
        occupant != null &&
        occupant.id !== pageId &&
        !repag.shippedSigIds.has(sigOfFolio(slot + 1))
      );
    },
    [repag],
  );

  const onTilePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>, vm: PageVM) => {
      // Constrained drag: ads only, and never out of/into a shipped form.
      if (e.button !== 0) return;
      if (vm.kind !== 'ad' || repag.shippedSigIds.has(sigOfFolio(vm.folio))) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragInfoRef.current = {pageId: vm.id, startX: e.clientX, startY: e.clientY, moved: false};
      dragOverRef.current = null;
    },
    [repag],
  );

  const onRootPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const info = dragInfoRef.current;
      if (info == null) return;
      if (!info.moved) {
        if (Math.hypot(e.clientX - info.startX, e.clientY - info.startY) < 5) return;
        info.moved = true;
        suppressClickRef.current = true;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el?.closest?.('[data-slot]');
      const slotAttr = slotEl?.getAttribute('data-slot');
      const slot = slotAttr != null ? Number(slotAttr) : null;
      const valid = slot != null && isValidDropSlot(slot, info.pageId);
      dragOverRef.current = valid ? slot : null;
      setDrag({pageId: info.pageId, overSlot: valid ? slot : null});
    },
    [isValidDropSlot],
  );

  const onRootPointerUp = useCallback(() => {
    const info = dragInfoRef.current;
    dragInfoRef.current = null;
    const overSlot = dragOverRef.current;
    dragOverRef.current = null;
    setDrag(null);
    if (info != null && info.moved && overSlot != null) {
      movePage(info.pageId, overSlot);
      setSelectedPageId(info.pageId);
    }
    if (info != null && !info.moved) {
      // Plain press — let the click handler run the selection.
      suppressClickRef.current = false;
    }
  }, [movePage]);

  // --- filters --------------------------------------------------------------
  const matchesFilter = useCallback(
    (vm: PageVM): boolean => {
      if (sectionFilter === 'unplaced') return false; // all 34 ads are placed
      if (sectionFilter !== 'all' && vm.section.id !== sectionFilter) return false;
      if (adsOnly && vm.kind !== 'ad') return false;
      if (proofFilter !== 'all' && vm.proofState !== proofFilter) return false;
      return true;
    },
    [sectionFilter, adsOnly, proofFilter],
  );

  const clearFilters = useCallback(() => {
    setSectionFilter('all');
    setAdsOnly(false);
    setProofFilter('all');
  }, []);

  const visibleSigs = SIGNATURES.map(sig => ({
    sig,
    openings: sig.openings.filter(op => {
      const verso = op.versoSlot != null ? repag.bySlot[op.versoSlot] : null;
      const recto = op.rectoSlot != null ? repag.bySlot[op.rectoSlot] : null;
      return (verso != null && matchesFilter(verso)) || (recto != null && matchesFilter(recto));
    }),
  })).filter(entry => entry.openings.length > 0);

  const reflowSigIds = useMemo(() => {
    if (lastMove == null) return new Set<number>();
    return new Set([sigOfFolio(lastMove.fromSlot + 1), sigOfFolio(lastMove.toSlot + 1)]);
  }, [lastMove]);

  // Export gate: disabled while any RHP covenant is violated; tooltip
  // names the violating advertiser (corner map, top-right).
  const violations = repag.violations;
  const exportBlocked = violations.length > 0;
  const exportButton = (
    <button
      type="button"
      className="ofp-focusable"
      style={{...styles.exportBtn, ...(exportBlocked ? styles.exportBtnDisabled : null)}}
      aria-disabled={exportBlocked}
      onClick={() => {
        if (!exportBlocked) setAnnouncement('Six 16-page forms queued for export.');
      }}>
      <Icon icon={SendIcon} size="xsm" color="inherit" />
      Export forms
    </button>
  );

  const paneContent = (
    <PageDetailPane
      vm={selectedVm}
      isLockedSig={selectedVm != null && repag.shippedSigIds.has(sigOfFolio(selectedVm.folio))}
      isSlideOver={!isPaneInline}
      onClose={closePane}
      onProofState={setProofState}
      onSectionJump={sectionId => setSectionFilter(sectionId)}
      requestMove={movePage}
    />
  );

  return (
    <div style={styles.root}>
      <style>{FLATPLAN_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div style={styles.topBar}>
              <BrandMark />
              <Heading level={1} style={styles.wordmark}>
                Ottavo
              </Heading>
              <span style={styles.issueLabel}>
                {ISSUE.number} · {ISSUE.title}
              </span>
              <span style={{flex: 1}} aria-hidden />
              {/* Dual fields: closeDateLabel + closeInDays. */}
              <span style={styles.closeChip}>
                <Icon icon={CalendarClockIcon} size="xsm" color="inherit" />
                Closes {ISSUE.closeDateLabel} · {ISSUE.closeInDays}d
              </span>
              {exportBlocked ? (
                <Tooltip
                  content={\`Blocked — \${violations.map(v => v.ownerName).join(', ')} on a verso (RHP covenant)\`}>
                  {exportButton}
                </Tooltip>
              ) : (
                exportButton
              )}
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div
              ref={viewRootRef}
              style={styles.viewRoot}
              onPointerMove={onRootPointerMove}
              onPointerUp={onRootPointerUp}
              onPointerCancel={onRootPointerUp}>
              <SectionRail
                sections={repag.sections}
                totals={repag.totals}
                sectionFilter={sectionFilter}
                onFilter={setSectionFilter}
                isCollapsed={isRailCollapsed}
              />
              <div style={styles.mainCol}>
                <FilterRow
                  sectionFilter={sectionFilter}
                  adsOnly={adsOnly}
                  proofFilter={proofFilter}
                  onSectionFilter={setSectionFilter}
                  onAdsOnly={setAdsOnly}
                  onProofFilter={setProofFilter}
                />
                <div style={styles.canvasWrap}>
                  <div
                    style={styles.canvas}
                    role="grid"
                    aria-label={\`Flatplan — \${ISSUE.pageCount} pages in 6 signatures\`}>
                    {sectionFilter === 'unplaced' ? (
                      <div style={styles.emptyCanvas}>
                        <Text type="label" size="sm">
                          No unplaced ads — all {repag.totals.ads} placed
                        </Text>
                        <Text type="supporting" size="xsm" color="secondary">
                          Every insertion order for {ISSUE.number} is on the board.
                        </Text>
                        <Button label="Back to all pages" size="sm" variant="secondary" onClick={clearFilters} />
                      </div>
                    ) : visibleSigs.length === 0 ? (
                      <div style={styles.emptyCanvas}>
                        <Text type="label" size="sm">
                          No pages match · clear filters
                        </Text>
                        <Button label="Clear filters" size="sm" variant="secondary" onClick={clearFilters} />
                      </div>
                    ) : (
                      visibleSigs.map(({sig, openings}) => (
                        <SignatureGroup
                          key={sig.id}
                          sig={sig}
                          isReflow={reflowSigIds.has(sig.id)}
                          isShipped={repag.shippedSigIds.has(sig.id)}
                          reflowKey={lastMove?.seq ?? 0}>
                          {openings.map(opening => (
                            <SpreadPair
                              key={opening.index}
                              opening={opening}
                              bySlot={repag.bySlot}
                              geom={geom}
                              selectedId={selectedPageId}
                              dragPageId={drag?.pageId ?? null}
                              dragOverSlot={drag?.overSlot ?? null}
                              matchesFilter={matchesFilter}
                              shippedSigIds={repag.shippedSigIds}
                              onSelect={selectPage}
                              onPointerDown={onTilePointerDown}
                              registerTileRef={registerTileRef}
                            />
                          ))}
                        </SignatureGroup>
                      ))
                    )}
                  </div>
                  <CanvasLegend />
                </div>
              </div>
              {isPaneInline ? (
                <div style={styles.pane} aria-label="Page detail">
                  {paneContent}
                </div>
              ) : null}
              {isSlideOverOpen ? (
                <>
                  <button
                    type="button"
                    className="ofp-scrim"
                    style={styles.scrim}
                    aria-label="Close page detail"
                    onClick={closePane}
                  />
                  <div
                    ref={trapRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={selectedVm != null ? \`Page \${selectedVm.folio} detail\` : 'Page detail'}
                    className="ofp-slideover"
                    style={{...styles.pane, ...styles.paneSlideOver}}>
                    {paneContent}
                  </div>
                </>
              ) : null}
            </div>
          </LayoutContent>
        }
      />
      {/* One polite live region owned by the page — announces every
          mutation consequence (moves, proof-state writes, export). */}
      <div aria-live="polite" style={styles.visuallyHidden}>
        {announcement}
      </div>
    </div>
  );
}
`;export{e as default};