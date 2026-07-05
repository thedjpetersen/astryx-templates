var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Vettra pet-health store frozen
 *   at TODAY = Sat, Jul 4 2026: two pets. Biscuit (Corgi, 4 yrs) carries a
 *   14-entry reverse-chron medical timeline (2026×5 + 2025×6 + 2024×3 =
 *   14 ✓), seven weigh-ins 24.1 → 30.2 lb crossing the 30.0 vet flag, two
 *   meds (Apoquel: 12 given + 1 missed + 1 open = 14 pips ✓, 6 days of
 *   supply; Glucosamine: 14/14 given), four due-rail chips, and 6 records.
 *   Mochi (cat, 9 yrs) carries 9 entries (2026×4 + 2025×5 = 9 ✓), a
 *   declining weight series 9.8 → 9.1 lb with the vet flag BELOW the
 *   series (9.0 < min 9.1 — the clamp branch), Methimazole 13+0+1 = 14 ✓,
 *   and 4 records. Vaccine day-counts all derive from Jul 4 2026: Rabies
 *   booster Jul 25 → 21 d ✓; DHPP Jan 10 2027 → 27+31+30+31+30+31+10 =
 *   190 d ✓; Bordetella due Mar 18 2026 → 13+30+31+30+4 = 108 d OVERDUE ✓;
 *   FVRCP Sep 6 → 27+31+6 = 64 d ✓; Mochi rabies Mar 27 2027 → 266 d ✓.
 *   No Date.now(), no Math.random(), no network media.
 * @output Vettra — Pet Vet Timeline: a 390px MOBILE pet-health surface.
 *   NavBar (paw-with-ECG mark · petSwitcher with id-derived gradient
 *   avatar · RefreshCw) over a sticky 64px due-soon rail of scroll-snap
 *   chips, a full-bleed reverse-chron timeline (year h2 dividers, 72px
 *   media rows with 40px type nodes wearing VaccineHalo urgency rings,
 *   WeightSpark stitch cards), Meds / Records / Profile tabs, a two-detent
 *   record-detail sheet, and a sticky-in-flow undo toast dock. Signature
 *   move: logging Biscuit's Apoquel dose is ONE meds-store patch with FOUR
 *   visible consequences — pip 14 flips open→given (180 ms settle), supply
 *   drains 6→5 days (7px→6px fill) so the rail chip rewrites to
 *   'Refill · 5 days', 5 ≤ threshold 5 fires a derived refill node atop
 *   2026 ('Apoquel refill due Thu, Jul 9' — Jul 4 + 5 = Jul 9 ✓) bumping
 *   the caption to 'All 15 entries', and the Meds tab badge unmounts 1→0.
 *   Undo restores the prior meds object and all four revert.
 * @position Page template; emitted by \`astryx template mobile-pet-vet-timeline\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, menus) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'} and
 *   restores on close. The stage clips to --radius-container; shell paints
 *   full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows) on Meds /
 *   Records / Profile; the Timeline is full-bleed feed language (full-
 *   width dividers, no card). No desktop frames, asides, or tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Vettra amber); sanctioned non-brand literals are the
 *   error pair, the missed-pip wash, the mid-tier halo pair, the control
 *   boundary pair, and the two id-derived avatar gradients — each with
 *   contrast math at the declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen inset · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', blur surface, hairline ALWAYS
 *   ON — scroll-under not wired, noted per contract); dueRail 64px sticky
 *   top:52 z19 (40px chips inside 44px hit buttons, ≥24px next-chip
 *   peek); rows 44px utility / 60px two-line / 72px media (40px node,
 *   48px avatar); DoseTracklet ~76px (name line + 14-pip strip + caption;
 *   spec's nominal 60px cannot hold three stacked lines — deviation
 *   noted); tabBar 64px sticky bottom z20 (24px icon over 11px/500
 *   label); sectionHeader 13px/600 uppercase 0.06em (16px gutter on the
 *   feed, 32px on inset lists), 20px top / 8px bottom; sheet detents 55%
 *   medium / calc(100% − 56px) large, 24px grabber zone with 36×5 pill,
 *   52px sheet header; toastDock sticky bottom:76 z30 in flow (shell-
 *   absolute ONLY while the sheet scroll-locks the shell). TYPE (Figtree
 *   via --font-family-body): 28/700 · 22/700 · 17/600 nav+sheet titles ·
 *   16/400–500 body floor · 13/400 meta · 11/500 min; tabular-nums on
 *   every count/date/weight. Buttons: 48px primary, 36px secondary,
 *   44×44 icon. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   into a full-row target (pips are NOT individually interactive — the
 *   row is the target, so 12–18px pip visuals are legal).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width:390 literals. Pip strip is the pinch
 *   point: inner card width at 320 = 320 − 32 gutter − 2 border − 32
 *   padding = 254px; 14 pips at minWidth 12 + 13×3px gaps = 168 + 39 =
 *   207 ≤ 254 ✓; at 430 pips cap at maxWidth 18 (14×18 + 39 = 291 ≤ 364
 *   ✓) — flex does the work, no wrap ever. dueRail chips cap at maxWidth
 *   200 so ≥24px of the next chip always peeks. WeightSpark SVG: width
 *   100% + preserveAspectRatio 'none' on a fixed 56px-tall box. Refill
 *   cluster fixed 84px; med names ellipsize. Sheet detents are %-based.
 * - Desktop stage (~1045px container): measured via useElementWidth on
 *   the wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered 430px phone column with hairline borderInline. No
 *   adaptive relayout; the anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  ActivityIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  ListIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PawPrintIcon,
  PillIcon,
  RefreshCwIcon,
  StethoscopeIcon,
  SyringeIcon,
  TriangleAlertIcon,
  WeightIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Vettra amber). Light: #B45309 on #FFFFFF =
// 5.0:1 (relative luminance 0.159 vs 1.0 — passes 4.5:1 for 13px/600 chip
// text and the 16px dashed open-pip boundary alike). Dark: #FBBF24 on the
// near-black card (~#1C1C1E, L≈0.013) ≈ 10.1:1.
const BRAND_ACCENT = 'light-dark(#B45309, #FBBF24)';
// Text over a BRAND_ACCENT fill (badge, given-pip glyphless fill needs no
// text; badge does). Light: #FFFFFF on #B45309 = 5.0:1. Dark: white on
// #FBBF24 fails (~1.8:1), so the dark side flips to a near-black amber —
// #451A03 on #FBBF24 ≈ 9.5:1. (Spec said 'white on brand'; deviation for
// dark-scheme contrast, math above.)
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #451A03)';
// Brand-tinted washes: 12% node/avatar tint, 16% flash wash.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
const BRAND_TINT_16 = \`color-mix(in srgb, \${BRAND_ACCENT} 16%, transparent)\`;
// Error pair for overdue text/halos/missed-pip borders. #B91C1C on the
// white card = 6.5:1 (L 0.111); #F87171 on the dark card ≈ 6.1:1 (L
// 0.331) — both clear 4.5:1 for 13px text and 3:1 for the 1.5px pip
// border and 3px overdue halo ring against their ACTUAL card surface.
const ERROR_STRONG = 'light-dark(#B91C1C, #F87171)';
// Missed-pip rest fill — the wash alone is NOT the signal; the 1.5px
// ERROR_STRONG boundary carries it at 6.5:1 / 6.1:1 vs the card (per the
// ≥3:1 interactive/rest-boundary amendment).
const MISSED_FILL = 'light-dark(#FDE8E8, #3A1D1D)';
// VaccineHalo mid tier (31–180 days). Spec suggested #D9A05B (only ~2.3:1
// on white — fails the ≥3:1 meaningful-rest amendment), corrected to
// #B07A28 on the white body = 3.7:1 (L 0.236); #C89B45 on the near-black
// body ≈ 7.0:1 (L 0.368). Deviation noted.
const HALO_MID = 'light-dark(#B07A28, #C89B45)';
// Interactive control boundaries (due-rail chips, secondary buttons,
// drain-track extent ring) — hairline tokens are for passive separators
// only. #857664 on the white body/card = 4.3:1 (L 0.192); #A79B88 on the
// dark body ≈ 6.3:1 (L 0.342). Both clear the ≥3:1 boundary law against
// their actual surfaces (body, card, AND the blur rail surface, which is
// 86% body).
const CONTROL_BORDER = 'light-dark(#857664, #A79B88)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Id-derived avatar gradients — formula: hue pair picked from the petId
// charcode sum (sum % 360 → amber for 'pet-biscuit', violet for
// 'pet-mochi'), hardcoded for determinism per spec. Initial text is #FFF:
// 'B' vs the #B45309 end-stop = 5.0:1; 'M' vs #4C1D95 = 8.9:1.
const AVATAR_GRADIENTS: Record<string, string> = {
  'pet-biscuit': 'linear-gradient(135deg, #F59E0B, #B45309)',
  'pet-mochi': 'linear-gradient(135deg, #8B5CF6, #4C1D95)',
};

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, visually-hidden text, keyframes,
// and the reduced-motion guard. Animations are transform/opacity only and
// collapse to instant under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const VETTRA_CSS = \`
.vtr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.vtr-btn:disabled { cursor: default; }
.vtr-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.vtr-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Pip log settle — transform-only, 180ms, once per remount. */
@keyframes vtr-settle {
  from { transform: scale(1.15); }
  to { transform: scale(1); }
}
.vtr-settle { animation: vtr-settle 180ms ease; }
/* Chip-jump flash — an opacity-only overlay wash, removed on animationend. */
@keyframes vtr-flash {
  from { opacity: 1; }
  to { opacity: 0; }
}
.vtr-flash { animation: vtr-flash 700ms ease forwards; }
/* Sheet + menu entrances. */
@keyframes vtr-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.vtr-sheet-in { animation: vtr-sheet-in 240ms ease; }
@keyframes vtr-menu-in {
  from { transform: translateY(-4px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.vtr-menu-in { animation: vtr-menu-in 160ms ease; }
/* Skeleton shimmer — one shared 1.6s sweep, REMOVED under reduced motion
   (static muted blocks alone encode loading). */
@keyframes vtr-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.vtr-shimmer { animation: vtr-shimmer 1.6s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .vtr-settle, .vtr-sheet-in, .vtr-menu-in { animation: none; }
  .vtr-flash { animation: none; opacity: 0; }
  .vtr-shimmer { animation: none; display: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries
  // cannot tell the stages apart).
  wrap: {width: '100%'},
  // THE SHELL CONTRACT (mobile foundations, verbatim).
  shell: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100dvh',
    background: 'var(--color-background-body)',
    overflowX: 'clip',
    fontFamily: 'var(--font-family-body)',
    color: 'var(--color-text-primary)',
  },
  // Scroll lock while the sheet is open — overlays anchor to the visible
  // screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px slots optically
  // align content to the 16px gutter. Hairline + blur ALWAYS ON (scroll-
  // under not wired; noted per contract).
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background:
      'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  // 44×44 non-button brand slot holding the 24px Vettra mark.
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // petSwitcher — ONE 44px-tall center button: 28px gradient avatar + name
  // 17/600 (ellipsis at 140) + 16px chevron.
  petSwitcher: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 8,
    borderRadius: 12,
    maxWidth: 200,
  },
  petAvatar28: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 700,
  },
  petAvatar48: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 700,
  },
  petName: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 140,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chevron: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  // Anchored pet menu — absolute top 56, centered, z45 (above tab chrome,
  // below nothing else while open; its backdrop sits at z44).
  petMenu: {
    position: 'absolute',
    top: 56,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 45,
    minWidth: 232,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'hidden',
  },
  menuBackdrop: {position: 'absolute', inset: 0, zIndex: 44},
  medMenuBackdrop: {position: 'absolute', inset: 0, zIndex: 29},
  menuRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 12,
    fontSize: 16,
  },
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  menuCheck: {
    width: 20,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_ACCENT,
  },
  // Anchored med ellipsis menu — z30, right-aligned to its tracklet.
  medMenu: {
    position: 'absolute',
    right: 12,
    top: 48,
    zIndex: 30,
    minWidth: 208,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'hidden',
  },
  // DUE-SOON RAIL — 64px sticky top:52 z19, same blur surface, horizontal
  // scroll-snap, 8px chip gap, scrollPaddingInline 16.
  dueRail: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    background:
      'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  // Chip = 44px-tall hit button wrapping a 40px visual pill (the 2px
  // vertical breathing keeps the 44 hit inside the 64px rail).
  chipHit: {
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    scrollSnapAlign: 'start',
    borderRadius: 999,
    maxWidth: 200,
  },
  chipBody: {
    height: 40,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 14,
    borderRadius: 999,
    border: \`1px solid \${CONTROL_BORDER}\`,
    background: 'var(--color-background-card)',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  chipIcon: {display: 'inline-flex', flexShrink: 0, color: BRAND_ACCENT},
  chipLabel: {fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis'},
  chipCount: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // SECTION HEADERS — 13/600 uppercase 0.06em; 16px gutter on the full-
  // bleed feed (year dividers), 32px (16 gutter + 16 card pad) on inset
  // lists; 20px top / 8px bottom.
  sectionHeaderFeed: {
    margin: '20px 0 8px',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  sectionHeaderInset: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TIMELINE — full-bleed feed rows: 72px media buttons, full-width
  // dividers, 40px leading node circles.
  entryRow: {
    position: 'relative',
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  flashWash: {
    position: 'absolute',
    inset: 0,
    background: BRAND_TINT_16,
    pointerEvents: 'none',
  },
  nodeWrap: {position: 'relative', width: 40, height: 40, flexShrink: 0},
  node: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  nodeBrand: {background: BRAND_TINT_12, color: BRAND_ACCENT},
  entryText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  entryMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  entryTrailing: {
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  entryTrailingError: {color: ERROR_STRONG, fontWeight: 500},
  rowDividerFull: {height: 1, background: 'var(--color-border)'},
  rowDividerInset: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  terminalCaption: {
    margin: '16px 0 24px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // WEIGHTSPARK stitch card — 12px padding, 12px block margins.
  sparkCard: {
    marginInline: 16,
    marginBlock: 12,
    padding: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
  },
  sparkHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  sparkTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sparkValue: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  sparkSvg: {width: '100%', height: 56, display: 'block'},
  sparkFlagLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: 500,
    color: ERROR_STRONG,
    fontVariantNumeric: 'tabular-nums',
  },
  // DOSE TRACKLET — ~76px stack: 20px name/refill line + 16px pip strip +
  // 13px caption inside 10px block padding.
  trackletOuter: {position: 'relative', display: 'flex', alignItems: 'stretch'},
  trackletBtn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '10px 0 10px 16px',
  },
  trackletLine1: {display: 'flex', alignItems: 'center', gap: 8, minHeight: 20},
  medName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  medDose: {fontSize: 13, fontWeight: 400, color: 'var(--color-text-secondary)'},
  // Refill cluster — fixed 84px (36px track + 6 gap + '6 days' text).
  refillCluster: {
    width: 84,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  drainTrack: {
    position: 'relative',
    width: 36,
    height: 6,
    flexShrink: 0,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  drainFill: {
    position: 'absolute',
    insetBlock: 0,
    left: 0,
    borderRadius: 999,
    background: BRAND_ACCENT,
  },
  // Extent ring — the ≥3:1 CONTROL_BORDER boundary makes the track's full
  // 36px extent legible at rest (muted-on-card alone fails the amendment);
  // the adjacent tabular text states the exact value.
  drainRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    border: \`1px solid \${CONTROL_BORDER}\`,
    pointerEvents: 'none',
  },
  drainDays: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Pip strip — 14 pips, flex '1 1 0' clamped 12–18px (see responsive
  // contract math in the header).
  pipStrip: {display: 'flex', gap: 3, paddingRight: 4},
  pip: {
    flex: '1 1 0',
    maxWidth: 18,
    minWidth: 12,
    height: 16,
    borderRadius: 4,
  },
  pipGiven: {background: BRAND_ACCENT},
  pipMissed: {
    background: MISSED_FILL,
    border: \`1.5px solid \${ERROR_STRONG}\`,
  },
  pipOpen: {background: 'transparent', border: \`2px dashed \${BRAND_ACCENT}\`},
  medCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  ellipsisCol: {
    display: 'flex',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingInlineEnd: 4,
  },
  // RECORDS — 60px two-line rows with trailing chevron.
  recordRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  recordText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  recordName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  recordMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Skeleton rows — EXACT 60px record-row geometry, deterministic width
  // cycle 60/45/70% (primary) + 40/55/30% (secondary).
  skeletonRow: {
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 16,
  },
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  shimmerWrap: {position: 'relative', overflow: 'hidden'},
  shimmerSweep: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-background-card) 55%, transparent), transparent)',
    pointerEvents: 'none',
  },
  statusCaptionRow: {
    margin: '16px 0 24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  doneBtn: {
    height: 44,
    paddingInline: 12,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
  },
  // PROFILE.
  profileRow: {
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  profileName: {fontSize: 17, fontWeight: 600},
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
  },
  utilityLabel: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  utilityValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // TAB BAR — 64px sticky bottom z20, 4 flex-1 tabItems.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    background:
      'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  tabItem: {
    flex: 1,
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontSize: 11, fontWeight: 600},
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  // Meds badge — 16px min-width brand pill; 10px/600 BRAND_FILL_TEXT
  // (5.0:1 light / 9.5:1 dark, math at the literal).
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom even on tall scrolling views; shell-absolute variant
  // ONLY while the sheet scroll-locks the shell (house rule). Always
  // mounted for aria-live.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: '100%',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell; detents 55% /
  // calc(100% − 56px).
  sheetScrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
  sheet: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-card)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 32px var(--color-shadow)',
  },
  grabberZone: {
    width: '100%',
    height: 24,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  grabberPill: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // The ONE legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 24px'},
  summaryRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 16,
  },
  summaryLabel: {width: 96, flexShrink: 0, color: 'var(--color-text-secondary)', fontSize: 13},
  summaryValue: {
    flex: 1,
    minWidth: 0,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  noteP: {margin: '8px 0 0', fontSize: 16, lineHeight: 1.5},
  attachRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  attachThumb: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  sheetActions: {display: 'flex', gap: 12, marginTop: 16},
  secondaryBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: \`1px solid \${CONTROL_BORDER}\`,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
  },
  requestedText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  historyRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — frozen clock + identity consts. TODAY = Sat, Jul 4 2026; every
// day-count in the file derives from it (arithmetic ledger in @input).
// ---------------------------------------------------------------------------

// The suite's frozen "today" — Saturday, July 4 2026.
const TODAY_ISO = '2026-07-04';
const TODAY_LABEL = 'Sat, Jul 4';
// Weekday wheel anchored on TODAY being a Saturday: (TODAY + n) % 7.
const WEEKDAYS_FROM_SAT = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

interface Pet {
  id: string;
  name: string;
  species: string;
  age: string;
  sexLine: string;
  clinic: string;
  microchip: string;
}

const PETS: Pet[] = [
  {
    id: 'pet-biscuit',
    name: 'Biscuit',
    species: 'Corgi',
    age: '4 yrs',
    sexLine: 'Corgi · 4 yrs · Male, neutered',
    clinic: 'Larkspur Animal Hospital',
    microchip: '985 112 004 733 190',
  },
  {
    id: 'pet-mochi',
    name: 'Mochi',
    species: 'Domestic shorthair',
    age: '9 yrs',
    sexLine: 'Domestic shorthair · 9 yrs · Female, spayed',
    clinic: 'Larkspur Animal Hospital',
    microchip: '985 112 009 214 557',
  },
];

type EntryKind = 'vaccine' | 'weight' | 'visit' | 'procedure';
type HaloTier = 'loose' | 'mid' | 'tight' | 'overdue';

interface TimelineEntry {
  id: string;
  petId: string;
  year: string;
  iso: string; // sortable const (dual-field rule)
  dateLabel: string; // display string
  kind: EntryKind;
  title: string;
  vet: string;
  detail: string;
  trailing: string;
  trailingError?: boolean;
  halo?: HaloTier;
  note: string;
  attachments: string[];
}

// BISCUIT — 14 entries: 2026×5 + 2025×6 + 2024×3 = 14 ✓ ('All 14 entries').
// Vaccine day-counts from Jul 4 2026: Rabies Jul 25 → 21 ✓ (tight halo);
// DHPP Jan 10 2027 → 190 ✓ (loose); Bordetella Mar 18 2026 → 108 overdue ✓.
const BISCUIT_TIMELINE: TimelineEntry[] = [
  {
    id: 'tl-b-260701',
    petId: 'pet-biscuit',
    year: '2026',
    iso: '2026-07-01',
    dateLabel: 'Jul 1, 2026',
    kind: 'weight',
    title: 'Weight check',
    vet: 'Larkspur front desk',
    detail: 'Routine weigh-in',
    trailing: '30.2 lb',
    note: 'Walk-in weigh-in at the lobby scale. 30.2 lb crosses the 30.0 lb flag Dr. Patel set at the January visit — bring up portion size at the July 25 rabies booster.',
    attachments: [],
  },
  {
    id: 'tl-b-260612',
    petId: 'pet-biscuit',
    year: '2026',
    iso: '2026-06-12',
    dateLabel: 'Jun 12, 2026',
    kind: 'vaccine',
    title: 'Rabies vaccine',
    vet: 'Dr. Patel',
    detail: '3-year booster series',
    trailing: 'Booster in 21 days',
    halo: 'tight',
    note: 'Rabies booster administered left rear. No reaction after 20-minute observation. Next booster due Jul 25, 2026 to complete the series.',
    attachments: ['Rabies certificate.pdf'],
  },
  {
    id: 'tl-b-260508',
    petId: 'pet-biscuit',
    year: '2026',
    iso: '2026-05-08',
    dateLabel: 'May 8, 2026',
    kind: 'visit',
    title: 'Dermatology visit',
    vet: 'Dr. Ostrowski',
    detail: 'Seasonal allergy — Apoquel started',
    trailing: 'Rx',
    // 90-word vet note — stress fixture 4: at the MEDIUM detent this
    // paragraph forces the sheet's inner scroller; LARGE reveals the two
    // attachment rows and action buttons without scrolling.
    note: 'Presented with three weeks of paw chewing and ventral erythema, worse after park visits. Cytology from both front interdigital spaces shows moderate Malassezia with no bacterial component. Skin scrape negative for mites. Started Apoquel 16 mg once daily with food for pruritus control and chlorhexidine wipes after grass exposure. Owner declined intradermal allergy testing for now; reasonable given seasonal pattern. Recheck in four weeks — if pruritus score stays under three of ten, taper wipes and hold Apoquel at current dose through September, then reassess for winter.',
    attachments: ['Allergy panel results.pdf', 'Cytology report.pdf'],
  },
  {
    id: 'tl-b-260314',
    petId: 'pet-biscuit',
    year: '2026',
    iso: '2026-03-14',
    dateLabel: 'Mar 14, 2026',
    kind: 'procedure',
    title: 'Dental cleaning',
    vet: 'Dr. Patel',
    detail: 'Grade 1 tartar removed',
    trailing: 'Report',
    note: 'Anesthetic dental prophylaxis. Grade 1 tartar removed, no extractions. Full-mouth radiographs unremarkable. Recovery smooth; discharged same afternoon.',
    attachments: ['Dental radiographs.dcm'],
  },
  {
    id: 'tl-b-260120',
    petId: 'pet-biscuit',
    year: '2026',
    iso: '2026-01-20',
    dateLabel: 'Jan 20, 2026',
    kind: 'weight',
    title: 'Weight check',
    vet: 'Larkspur front desk',
    detail: 'Routine weigh-in',
    trailing: '29.9 lb',
    note: 'Lobby-scale weigh-in, 29.9 lb. Dr. Patel flagged 30.0 lb as the ceiling before a diet change.',
    attachments: [],
  },
  {
    id: 'tl-b-251102',
    petId: 'pet-biscuit',
    year: '2025',
    iso: '2025-11-02',
    dateLabel: 'Nov 2, 2025',
    kind: 'weight',
    title: 'Weight check',
    vet: 'Larkspur front desk',
    detail: 'Routine weigh-in',
    trailing: '29.6 lb',
    note: 'Lobby-scale weigh-in, 29.6 lb.',
    attachments: [],
  },
  {
    id: 'tl-b-250915',
    petId: 'pet-biscuit',
    year: '2025',
    iso: '2025-09-15',
    dateLabel: 'Sep 15, 2025',
    kind: 'vaccine',
    title: 'DHPP booster',
    vet: 'Dr. Patel',
    detail: 'Annual combination booster',
    trailing: 'Booster in 190 days',
    halo: 'loose',
    note: 'DHPP booster administered right rear. Next due Jan 10, 2027.',
    attachments: ['DHPP certificate.pdf'],
  },
  {
    id: 'tl-b-250722',
    petId: 'pet-biscuit',
    year: '2025',
    iso: '2025-07-22',
    dateLabel: 'Jul 22, 2025',
    kind: 'visit',
    title: 'Ear infection',
    vet: 'Dr. Patel',
    detail: 'Otitis externa — drops 10 days',
    trailing: 'Resolved',
    note: 'Left ear otitis externa after lake weekend. Prescribed a 10-day course of Amoxicillin-Clavulanate 62.5 mg with topical drops; recheck confirmed resolution.',
    attachments: [],
  },
  {
    id: 'tl-b-250530',
    petId: 'pet-biscuit',
    year: '2025',
    iso: '2025-05-30',
    dateLabel: 'May 30, 2025',
    kind: 'weight',
    title: 'Weight check',
    vet: 'Larkspur front desk',
    detail: 'Routine weigh-in',
    trailing: '28.9 lb',
    note: 'Lobby-scale weigh-in, 28.9 lb.',
    attachments: [],
  },
  {
    id: 'tl-b-250318',
    petId: 'pet-biscuit',
    year: '2025',
    iso: '2025-03-18',
    dateLabel: 'Mar 18, 2025',
    kind: 'vaccine',
    title: 'Bordetella vaccine',
    vet: 'Dr. Reyes',
    detail: 'Kennel-cough intranasal',
    trailing: '108 days overdue',
    trailingError: true,
    halo: 'overdue',
    note: 'Intranasal Bordetella ahead of spring boarding. Annual renewal was due Mar 18, 2026 — now 108 days overdue; required before the August boarding stay.',
    attachments: [],
  },
  {
    id: 'tl-b-250109',
    petId: 'pet-biscuit',
    year: '2025',
    iso: '2025-01-09',
    dateLabel: 'Jan 9, 2025',
    kind: 'visit',
    title: 'Annual exam',
    vet: 'Dr. Patel',
    detail: 'Healthy · bloodwork normal',
    trailing: '28.4 lb',
    note: 'Annual wellness exam. Body condition 6/9, weight 28.4 lb. CBC and chemistry within reference ranges. Discussed weight trend; set a 30.0 lb flag.',
    attachments: [],
  },
  {
    id: 'tl-b-241004',
    petId: 'pet-biscuit',
    year: '2024',
    iso: '2024-10-04',
    dateLabel: 'Oct 4, 2024',
    kind: 'weight',
    title: 'Weight check',
    vet: 'Larkspur front desk',
    detail: 'Routine weigh-in',
    trailing: '27.5 lb',
    note: 'Lobby-scale weigh-in, 27.5 lb.',
    attachments: [],
  },
  {
    id: 'tl-b-240621',
    petId: 'pet-biscuit',
    year: '2024',
    iso: '2024-06-21',
    dateLabel: 'Jun 21, 2024',
    kind: 'procedure',
    title: 'Neuter surgery',
    vet: 'Dr. Reyes',
    detail: 'Routine · recovery normal',
    trailing: 'Report',
    note: 'Routine neuter under general anesthesia. Uneventful recovery; sutures out at day 12.',
    attachments: ['Neuter surgery report.pdf'],
  },
  {
    id: 'tl-b-240202',
    petId: 'pet-biscuit',
    year: '2024',
    iso: '2024-02-02',
    dateLabel: 'Feb 2, 2024',
    kind: 'visit',
    title: 'First puppy visit',
    vet: 'Dr. Patel',
    detail: 'Healthy pup · plan started',
    trailing: '24.1 lb',
    note: 'First visit at ten months, 24.1 lb. Started the puppy wellness plan and core vaccine schedule.',
    attachments: ['Puppy wellness plan.pdf'],
  },
];

// MOCHI — 9 entries: 2026×4 + 2025×5 = 9 ✓ ('All 9 entries'). FVRCP Sep 6
// 2026 → 64 d ✓ (mid halo); rabies Mar 27 2027 → 266 d ✓ (loose).
const MOCHI_TIMELINE: TimelineEntry[] = [
  {
    id: 'tl-m-260620',
    petId: 'pet-mochi',
    year: '2026',
    iso: '2026-06-20',
    dateLabel: 'Jun 20, 2026',
    kind: 'weight',
    title: 'Weight check',
    vet: 'Larkspur front desk',
    detail: 'Routine weigh-in',
    trailing: '9.1 lb',
    note: 'Carrier-scale weigh-in, 9.1 lb. Continues the slow decline — below the 9.0 lb flag triggers a T4 recheck.',
    attachments: [],
  },
  {
    id: 'tl-m-260411',
    petId: 'pet-mochi',
    year: '2026',
    iso: '2026-04-11',
    dateLabel: 'Apr 11, 2026',
    kind: 'vaccine',
    title: 'FVRCP booster',
    vet: 'Dr. Ostrowski',
    detail: 'Core feline booster',
    trailing: 'Booster in 64 days',
    halo: 'mid',
    note: 'FVRCP booster administered. Next due Sep 6, 2026.',
    attachments: ['FVRCP certificate.pdf'],
  },
  {
    id: 'tl-m-260303',
    petId: 'pet-mochi',
    year: '2026',
    iso: '2026-03-03',
    dateLabel: 'Mar 3, 2026',
    kind: 'visit',
    title: 'Thyroid panel',
    vet: 'Dr. Ostrowski',
    detail: 'T4 normalized on Methimazole',
    trailing: 'Normal',
    note: 'Recheck T4 2.4 µg/dL — normalized on Methimazole 2.5 mg. Continue current dose; recheck in six months with renal values.',
    attachments: ['Thyroid panel results.pdf'],
  },
  {
    id: 'tl-m-260115',
    petId: 'pet-mochi',
    year: '2026',
    iso: '2026-01-15',
    dateLabel: 'Jan 15, 2026',
    kind: 'procedure',
    title: 'Dental cleaning',
    vet: 'Dr. Reyes',
    detail: 'One extraction · 307',
    trailing: 'Report',
    note: 'Dental prophylaxis with extraction of resorptive 307. Soft food for five days; healed well.',
    attachments: ['Dental cleaning report.pdf'],
  },
  {
    id: 'tl-m-251108',
    petId: 'pet-mochi',
    year: '2025',
    iso: '2025-11-08',
    dateLabel: 'Nov 8, 2025',
    kind: 'weight',
    title: 'Weight check',
    vet: 'Larkspur front desk',
    detail: 'Routine weigh-in',
    trailing: '9.2 lb',
    note: 'Carrier-scale weigh-in, 9.2 lb.',
    attachments: [],
  },
  {
    id: 'tl-m-250819',
    petId: 'pet-mochi',
    year: '2025',
    iso: '2025-08-19',
    dateLabel: 'Aug 19, 2025',
    kind: 'visit',
    title: 'Hyperthyroid diagnosis',
    vet: 'Dr. Ostrowski',
    detail: 'Methimazole started',
    trailing: 'Rx',
    note: 'T4 6.8 µg/dL with weight loss and polyphagia. Diagnosed hyperthyroidism; started Methimazole 2.5 mg once daily. Discussed radioiodine referral as the definitive option.',
    attachments: [],
  },
  {
    id: 'tl-m-250602',
    petId: 'pet-mochi',
    year: '2025',
    iso: '2025-06-02',
    dateLabel: 'Jun 2, 2025',
    kind: 'weight',
    title: 'Weight check',
    vet: 'Larkspur front desk',
    detail: 'Routine weigh-in',
    trailing: '9.4 lb',
    note: 'Carrier-scale weigh-in, 9.4 lb.',
    attachments: [],
  },
  {
    id: 'tl-m-250327',
    petId: 'pet-mochi',
    year: '2025',
    iso: '2025-03-27',
    dateLabel: 'Mar 27, 2025',
    kind: 'vaccine',
    title: 'Rabies vaccine',
    vet: 'Dr. Reyes',
    detail: 'PureVax annual',
    trailing: 'Booster in 266 days',
    halo: 'loose',
    note: 'PureVax rabies administered right rear. Next due Mar 27, 2027.',
    attachments: ['Rabies certificate.pdf'],
  },
  {
    id: 'tl-m-250105',
    petId: 'pet-mochi',
    year: '2025',
    iso: '2025-01-05',
    dateLabel: 'Jan 5, 2025',
    kind: 'visit',
    title: 'Annual exam',
    vet: 'Dr. Ostrowski',
    detail: 'Senior panel drawn',
    trailing: '9.6 lb',
    note: 'Senior wellness exam, 9.6 lb. Mild weight loss from 9.8 lb baseline noted; senior panel drawn.',
    attachments: [],
  },
];

const TIMELINES: Record<string, TimelineEntry[]> = {
  'pet-biscuit': BISCUIT_TIMELINE,
  'pet-mochi': MOCHI_TIMELINE,
};

// WEIGHT SERIES — dual fields: numeric points + display labels.
// Biscuit (7 weigh-ins, oldest→newest; spec listed 6 but the timeline
// carries 7 — Jan 20 2026's 29.9 lb included so the spark reconciles with
// the feed; deviation noted): min 24.1, max 30.2, threshold 30.0.
// y = 48 − (w − 24.1)/6.1 × 40 → 24.1→48.0 · 27.5→25.7 · 28.4→19.8 ·
// 28.9→16.5 · 29.6→11.9 · 29.9→10.0 · 30.2→8.0; flag 30.0 → y 9.3.
// Mochi (5 points; 9.8 is the 2024 baseline const, pre-window): min 9.1,
// max 9.8, threshold 9.0 BELOW the series — y = 48 − (w − 9.1)/0.7 × 40 →
// 9.8→8.0 · 9.6→19.4 · 9.4→30.9 · 9.2→42.3 · 9.1→48.0; flag 9.0 → y 53.7,
// which sits BELOW the series baseline (48) but inside the 56-tall
// viewBox — rendered clamped against the bottom edge with the label above
// the rule (the clamp branch, stress fixture 5).
interface WeightSeries {
  petId: string;
  unit: string;
  points: number[];
  min: number;
  max: number;
  threshold: number;
  thresholdLabel: string;
  lastLabel: string;
  checksLabel: string;
  trendText: string;
}

const WEIGHT_SERIES: Record<string, WeightSeries> = {
  'pet-biscuit': {
    petId: 'pet-biscuit',
    unit: 'lb',
    points: [24.1, 27.5, 28.4, 28.9, 29.6, 29.9, 30.2],
    min: 24.1,
    max: 30.2,
    threshold: 30.0,
    thresholdLabel: 'Vet flag 30.0 lb',
    lastLabel: '30.2 lb',
    checksLabel: 'Weight · 7 checks',
    trendText: 'Weight trend 24.1 to 30.2 pounds, vet flag 30.0 crossed by the last point',
  },
  'pet-mochi': {
    petId: 'pet-mochi',
    unit: 'lb',
    points: [9.8, 9.6, 9.4, 9.2, 9.1],
    min: 9.1,
    max: 9.8,
    threshold: 9.0,
    thresholdLabel: 'Vet flag 9.0 lb',
    lastLabel: '9.1 lb',
    checksLabel: 'Weight · 5 checks',
    trendText: 'Weight trend declining 9.8 to 9.1 pounds, vet flag 9.0 below the series',
  },
};

// MEDS — pips Jun 21 → Jul 4 = 14 days. Biscuit Apoquel: 12 given + 1
// missed (Jun 27, index 6) + 1 open (today) = 14 ✓; caption '12 of 13
// given · 1 missed' (12 + 1 = 13 past doses ✓). Glucosamine: 14 given ✓.
// Mochi Methimazole: 13 given + 1 open = 14 ✓. Drain fill width =
// round(supplyDays/30 × 36): 6 d → 7px, 5 d → 6px (visibly drains on
// log), 23 d → 28px, 11 d → 13px.
type PipState = 'given' | 'missed' | 'open';

interface Med {
  id: string;
  petId: string;
  name: string;
  doseLabel: string;
  pips: PipState[];
  supplyDays: number;
  refillThreshold: number;
  refillRequested: boolean;
}

function pipRun(given: number, missedIndices: number[], open: boolean): PipState[] {
  const total = 14;
  const pips: PipState[] = [];
  for (let i = 0; i < total; i++) {
    if (open && i === total - 1) {
      pips.push('open');
    } else if (missedIndices.includes(i)) {
      pips.push('missed');
    } else {
      pips.push('given');
    }
  }
  // Cross-check: given + missed + open must equal 14.
  const g = pips.filter(p => p === 'given').length;
  if (g !== given) {
    // Deterministic fixtures are hand-verified; this branch is unreachable
    // and exists only to make the cross-check law explicit in code.
    throw new Error(\`pip cross-check failed: \${g} !== \${given}\`);
  }
  return pips;
}

const INITIAL_MEDS: Record<string, Med[]> = {
  'pet-biscuit': [
    {
      id: 'med-apoquel',
      petId: 'pet-biscuit',
      name: 'Apoquel',
      doseLabel: '16 mg · 1x daily',
      pips: pipRun(12, [6], true),
      supplyDays: 6,
      refillThreshold: 5,
      refillRequested: false,
    },
    {
      id: 'med-glucosamine',
      petId: 'pet-biscuit',
      name: 'Glucosamine chew',
      doseLabel: '1 chew · 1x daily',
      pips: pipRun(14, [], false),
      supplyDays: 23,
      refillThreshold: 5,
      refillRequested: false,
    },
  ],
  'pet-mochi': [
    {
      id: 'med-methimazole',
      petId: 'pet-mochi',
      name: 'Methimazole',
      doseLabel: '2.5 mg · 1x daily',
      pips: pipRun(13, [], true),
      supplyDays: 11,
      refillThreshold: 5,
      refillRequested: false,
    },
  ],
};

// Past-med history (View history sheet). The 37-char Amoxicillin row is
// the long-name truncation stress (fixture 1) — it must ellipsize against
// the fixed trailing status.
interface MedHistoryRow {
  id: string;
  name: string;
  meta: string;
  status: string;
}

const MED_HISTORY: Record<string, MedHistoryRow[]> = {
  'med-apoquel': [
    {id: 'hist-apoquel', name: 'Apoquel 16 mg', meta: 'Started May 8, 2026 · 1x daily', status: 'Active'},
    {
      id: 'hist-amoxclav',
      name: 'Amoxicillin-Clavulanate 62.5 mg',
      meta: 'Jul 2025 · 10-day course · ear infection',
      status: 'Completed',
    },
  ],
  'med-glucosamine': [
    {id: 'hist-gluco', name: 'Glucosamine chew', meta: 'Started Jan 9, 2025 · 1x daily', status: 'Active'},
  ],
  'med-methimazole': [
    {id: 'hist-methi', name: 'Methimazole 2.5 mg', meta: 'Started Aug 19, 2025 · 1x daily', status: 'Active'},
  ],
};

// RECORDS — Biscuit 6 ✓ ('All 6 records'), Mochi 4 ✓ ('All 4 records').
// Mochi's radioiodine consult row doubles as a records-length stress.
interface RecordDoc {
  id: string;
  petId: string;
  name: string;
  meta: string;
  note: string;
}

const RECORDS: Record<string, RecordDoc[]> = {
  'pet-biscuit': [
    {id: 'rec-b-1', petId: 'pet-biscuit', name: 'Rabies certificate', meta: '0.4 MB · PDF · Jun 12 2026', note: 'State rabies vaccination certificate, tag #7741, valid through the 3-year series.'},
    {id: 'rec-b-2', petId: 'pet-biscuit', name: 'Allergy panel', meta: '2.1 MB · PDF · May 8 2026', note: 'Dermatology cytology and panel summary from the May 8 visit with Dr. Ostrowski.'},
    {id: 'rec-b-3', petId: 'pet-biscuit', name: 'Dental radiographs', meta: '8.6 MB · DICOM · Mar 14 2026', note: 'Full-mouth radiographs from the March prophylaxis. No pathology noted.'},
    {id: 'rec-b-4', petId: 'pet-biscuit', name: 'DHPP certificate', meta: '0.3 MB · PDF · Sep 15 2025', note: 'Combination booster certificate; next due Jan 10, 2027.'},
    {id: 'rec-b-5', petId: 'pet-biscuit', name: 'Neuter surgery report', meta: '1.2 MB · PDF · Jun 21 2024', note: 'Surgical and anesthesia report with discharge instructions.'},
    {id: 'rec-b-6', petId: 'pet-biscuit', name: 'Puppy wellness plan', meta: '0.8 MB · PDF · Feb 2 2024', note: 'Enrollment paperwork and first-year vaccine schedule.'},
  ],
  'pet-mochi': [
    {id: 'rec-m-1', petId: 'pet-mochi', name: 'FVRCP certificate', meta: '0.3 MB · PDF · Apr 11 2026', note: 'Core feline booster certificate; next due Sep 6, 2026.'},
    {id: 'rec-m-2', petId: 'pet-mochi', name: 'Thyroid panel results', meta: '1.6 MB · PDF · Mar 3 2026', note: 'Recheck T4 2.4 µg/dL — normalized on current Methimazole dose.'},
    {id: 'rec-m-3', petId: 'pet-mochi', name: 'Hyperthyroidism treatment plan — radioiodine consult', meta: '0.9 MB · PDF · Aug 19 2025', note: 'Referral packet and cost comparison for definitive radioiodine therapy.'},
    {id: 'rec-m-4', petId: 'pet-mochi', name: 'Rabies certificate', meta: '0.4 MB · PDF · Mar 27 2025', note: 'PureVax rabies certificate; next due Mar 27, 2027.'},
  ],
};

// PROFILE vaccine card rows — derived from the timeline's vaccine entries
// (same halo tiers; the words restate what the ring encodes so color
// never carries alone).
interface VaccineRow {
  id: string;
  entryId: string;
  name: string;
  dueText: string;
  halo: HaloTier;
  error?: boolean;
}

const VACCINES: Record<string, VaccineRow[]> = {
  'pet-biscuit': [
    {id: 'vx-b-rabies', entryId: 'tl-b-260612', name: 'Rabies', dueText: 'Booster in 21 days · Jul 25, 2026', halo: 'tight'},
    {id: 'vx-b-bord', entryId: 'tl-b-250318', name: 'Bordetella', dueText: '108 days overdue · was due Mar 18, 2026', halo: 'overdue', error: true},
    {id: 'vx-b-dhpp', entryId: 'tl-b-250915', name: 'DHPP', dueText: 'Booster in 190 days · Jan 10, 2027', halo: 'loose'},
  ],
  'pet-mochi': [
    {id: 'vx-m-fvrcp', entryId: 'tl-m-260411', name: 'FVRCP', dueText: 'Booster in 64 days · Sep 6, 2026', halo: 'mid'},
    {id: 'vx-m-rabies', entryId: 'tl-m-250327', name: 'Rabies', dueText: 'Booster in 266 days · Mar 27, 2027', halo: 'loose'},
  ],
};

// Skeleton width cycle — deterministic 60/45/70 primary + 40/55/30
// secondary (fixture law: never Math.random()).
const SKELETON_WIDTHS: Array<[string, string]> = [
  ['60%', '40%'],
  ['45%', '55%'],
  ['70%', '30%'],
  ['60%', '40%'],
];

// ---------------------------------------------------------------------------
// FORMATTERS + DERIVATIONS — pure, deterministic.
// ---------------------------------------------------------------------------

/** 'Jul N' date label for TODAY + n days (valid through Jul 31; all refill
 * horizons in the fixtures are ≤ 28 days). Jul 4 + 5 = Thu, Jul 9 ✓. */
function refillDueLabel(daysFromToday: number): string {
  const day = 4 + daysFromToday;
  const weekday = WEEKDAYS_FROM_SAT[daysFromToday % 7];
  return \`\${weekday}, Jul \${day}\`;
}

function medGivenCount(med: Med): number {
  return med.pips.filter(pip => pip === 'given').length;
}

function medMissedCount(med: Med): number {
  return med.pips.filter(pip => pip === 'missed').length;
}

function medOpen(med: Med): boolean {
  return med.pips[med.pips.length - 1] === 'open';
}

/** Caption law: denominator = completed-status doses (given + missed);
 * the open pip joins it only once resolved. Pre-log '12 of 13 given · 1
 * missed'; post-log '13 of 14 given · 1 missed' ✓. */
function medCaption(med: Med): string {
  const given = medGivenCount(med);
  const missed = medMissedCount(med);
  const denom = given + missed;
  return missed > 0 ? \`\${given} of \${denom} given · \${missed} missed\` : \`\${given} of \${denom} given\`;
}

/** Drain fill width = round(supplyDays / 30 × 36) px. */
function drainWidth(supplyDays: number): number {
  return Math.round((supplyDays / 30) * 36);
}

/** Meds badge = count of meds with an open (unlogged) dose today. */
function openDoseCount(meds: Med[]): number {
  return meds.filter(medOpen).length;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useState<AppState> at the root + one update(id, value);
// every mutation helper is a thin functional-setState wrapper so one
// dispatch can carry all of its consequences atomically.
// ---------------------------------------------------------------------------

type TabId = 'timeline' | 'meds' | 'records' | 'profile';

type SheetKind = 'entry' | 'record' | 'history';

interface SheetState {
  kind: SheetKind;
  refId: string;
  detent: 'medium' | 'large';
}

interface ToastState {
  seq: number;
  text: string;
  // visible=false → screen-reader-only announcement through the SAME
  // polite region (chip jumps, refresh status) — one region, one voice.
  visible: boolean;
  undoable: boolean;
}

interface UndoSnapshot {
  petId: string;
  meds: Med[];
  revertText: string;
}

type RefreshPhase = 'idle' | 'loading' | 'done';

interface AppState {
  activePetId: string;
  activeTab: TabId;
  medsByPet: Record<string, Med[]>;
  sheet: SheetState | null;
  petMenuOpen: boolean;
  medMenuId: string | null;
  refreshByPet: Record<string, RefreshPhase>;
  toast: ToastState | null;
  undoSnapshot: UndoSnapshot | null;
  flashId: string | null;
  lastLoggedPip: {medId: string; index: number; seq: number} | null;
}

const INITIAL_STATE: AppState = {
  activePetId: 'pet-biscuit',
  activeTab: 'timeline',
  medsByPet: INITIAL_MEDS,
  sheet: null,
  petMenuOpen: false,
  medMenuId: null,
  refreshByPet: {'pet-biscuit': 'idle', 'pet-mochi': 'idle'},
  toast: null,
  undoSnapshot: null,
  flashId: null,
  lastLoggedPip: null,
};

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver on the wrapper
 * can tell the 390px mobile stage from the desktop stage.
 */
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

/** Sheet/menu focus trap — Tab cycles within the container's buttons. */
function trapTabKey(
  event: ReactKeyboardEvent<HTMLDivElement>,
  container: HTMLElement | null,
): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled])');
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * The shell does not own scroll — the demo's outer scroller does. Walk up
 * to the nearest scrollable ancestor for per-tab scrollTop persistence
 * and the active-tab re-tap scroll-to-top.
 */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node != null) {
    const style = getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// VETTRA MARK — 24px paw whose top pad carries an ECG blip; inline SVG,
// stroke var(--color-text-primary), in a 44×44 non-button nav slot.
// ---------------------------------------------------------------------------

function VettraMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-text-primary)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden>
        {/* Main pad */}
        <path d="M12 11.6c-3.1 0-5.4 2.2-5.4 4.6 0 1.9 1.4 3.2 3 3.2 1 0 1.7-.4 2.4-.4s1.4.4 2.4.4c1.6 0 3-1.3 3-3.2 0-2.4-2.3-4.6-5.4-4.6Z" />
        {/* Side toes */}
        <circle cx={5.6} cy={9.6} r={1.7} />
        <circle cx={18.4} cy={9.6} r={1.7} />
        {/* Top pad as an ECG blip */}
        <path d="M8.6 5.6h1.5l.9-2 1.6 4 1-2h1.8" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PET AVATAR — id-derived gradient circle (formula + contrast math at the
// AVATAR_GRADIENTS literal).
// ---------------------------------------------------------------------------

function PetAvatar({pet, sizeStyle}: {pet: Pet; sizeStyle: CSSProperties}) {
  return (
    <span style={{...sizeStyle, background: AVATAR_GRADIENTS[pet.id]}} aria-hidden>
      {pet.name.charAt(0)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// VACCINE HALO — absolute ring centered on the 40px node, encoding 'how
// due' via diameter + color, static by design (no pulse). The trailing row
// text ALWAYS states the same fact in words — color never carries alone.
//   loose  (>180 d): 52px, 2px var(--color-border) — the one sanctioned
//     hairline ring; its meaning is fully restated by the adjacent text.
//   mid  (31–180 d): 48px, 2px HALO_MID (≥3:1 vs body, math at literal).
//   tight   (≤30 d): 44px, 3px BRAND_ACCENT (5.0:1 / ~10:1 vs body).
//   overdue        : 42px flush, 3px ERROR_STRONG (6.5:1 / 6.1:1).
// ---------------------------------------------------------------------------

const HALO_STYLE: Record<HaloTier, CSSProperties> = {
  loose: {width: 52, height: 52, border: '2px solid var(--color-border)'},
  mid: {width: 48, height: 48, border: \`2px solid \${HALO_MID}\`},
  tight: {width: 44, height: 44, border: \`3px solid \${BRAND_ACCENT}\`},
  overdue: {width: 42, height: 42, border: \`3px solid \${ERROR_STRONG}\`},
};

function VaccineHalo({tier}: {tier: HaloTier}) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        ...HALO_STYLE[tier],
      }}
    />
  );
}

const ENTRY_KIND_ICON: Record<EntryKind, typeof SyringeIcon> = {
  vaccine: SyringeIcon,
  weight: WeightIcon,
  visit: StethoscopeIcon,
  procedure: ActivityIcon,
};

// ---------------------------------------------------------------------------
// WEIGHT SPARK — inline SVG polyline, viewBox '0 0 320 56',
// preserveAspectRatio 'none' (x-coords in viewBox units so it stretches
// without recompute; vector-effect keeps strokes 2px). Computed y ledger
// lives at the WEIGHT_SERIES fixture. Decorative SVG is aria-hidden with
// adjacent visually-hidden trend text.
// ---------------------------------------------------------------------------

function WeightSpark({series}: {series: WeightSeries}) {
  const n = series.points.length;
  const range = series.max - series.min;
  const coords = series.points.map((w, i) => {
    const x = 8 + (i * 304) / (n - 1);
    const y = 48 - ((w - series.min) / range) * 40;
    return {x, y};
  });
  const last = coords[coords.length - 1];
  // Threshold rule. Mochi's flag (9.0) sits BELOW the series min → raw y
  // 53.7 is under the 48 baseline; clamp display to 54 so the dashed rule
  // hugs the bottom edge of the 56-tall viewBox (the clamp branch —
  // labeled below the chart either way, so meaning never depends on the
  // rule's exact y).
  const rawFlagY = 48 - ((series.threshold - series.min) / range) * 40;
  const flagY = Math.min(rawFlagY, 54);
  const points = coords.map(c => \`\${c.x.toFixed(1)},\${c.y.toFixed(1)}\`).join(' ');
  return (
    <>
      <svg
        style={styles.sparkSvg}
        viewBox="0 0 320 56"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden>
        <line
          x1={8}
          y1={flagY.toFixed(1)}
          x2={312}
          y2={flagY.toFixed(1)}
          stroke={ERROR_STRONG}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={points}
          stroke={BRAND_ACCENT}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Terminal 4px-radius dot on the last point. */}
        <circle cx={last.x.toFixed(1)} cy={last.y.toFixed(1)} r={4} fill={BRAND_ACCENT} />
      </svg>
      <span className="vtr-vh">{series.trendText}</span>
      <div style={styles.sparkFlagLabel}>{series.thresholdLabel}</div>
    </>
  );
}

function WeightSparkCard({series}: {series: WeightSeries}) {
  return (
    <div style={styles.sparkCard}>
      <div style={styles.sparkHeader}>
        <span style={styles.sparkTitle}>{series.checksLabel}</span>
        <span style={styles.sparkValue}>{series.lastLabel}</span>
      </div>
      <WeightSpark series={series} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SKELETON ROWS — 4 rows at EXACT 60px record-row geometry, deterministic
// 60/45/70 + 40/55/30 width cycle, one shared shimmer sweep (removed
// entirely under reduced motion). aria-busy on the card, blocks hidden.
// ---------------------------------------------------------------------------

function RecordSkeleton() {
  return (
    <div style={{...styles.listCard, ...styles.shimmerWrap}} aria-busy>
      {SKELETON_WIDTHS.map(([primary, secondary], index) => (
        <div key={\`skel-\${index}\`}>
          {index > 0 ? <div style={styles.rowDividerInset} /> : null}
          <div style={styles.skeletonRow} aria-hidden>
            <div style={{...styles.skelBar, width: primary}} />
            <div style={{...styles.skelBar, width: secondary}} />
          </div>
        </div>
      ))}
      <div className="vtr-shimmer" style={styles.shimmerSweep} aria-hidden />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DOSE TRACKLET — ~76px med stack: whole row is ONE button named as a verb
// phrase ("Log today's Apoquel dose" / "Apoquel, all doses logged"); the
// 44×44 ellipsis is a separate sibling button (never nested) opening the
// anchored menu (Log / Skip / Request refill / View history). 450ms
// long-press on the row is garnish for the same menu — the ellipsis is
// the contract path. Pip strip + drain track are aria-hidden; the row
// carries the text equivalent ('12 of 13 given, 1 missed, 6 days of
// supply'). Pips are NOT individually interactive (merged-target clause).
// ---------------------------------------------------------------------------

type MedMenuAction = 'log' | 'skip' | 'refill' | 'history';

interface DoseTrackletProps {
  instanceId: string;
  med: Med;
  menuOpen: boolean;
  lastLoggedPip: AppState['lastLoggedPip'];
  flash: boolean;
  onPrimary: () => void;
  onMenu: (opener: HTMLElement) => void;
  onMenuAction: (action: MedMenuAction, menuEl: HTMLElement | null) => void;
  registerRef: (el: HTMLDivElement | null) => void;
  onFlashEnd: () => void;
}

function DoseTracklet({
  instanceId,
  med,
  menuOpen,
  lastLoggedPip,
  flash,
  onPrimary,
  onMenu,
  onMenuAction,
  registerRef,
  onFlashEnd,
}: DoseTrackletProps) {
  const open = medOpen(med);
  const rowRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  // 450ms long-press garnish (gesture recognizer, not a demo timer).
  const pressTimer = useRef<number | null>(null);
  const pressStart = useRef<{x: number; y: number} | null>(null);
  const clearPress = useCallback(() => {
    if (pressTimer.current != null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    pressStart.current = null;
  }, []);
  useEffect(() => clearPress, [clearPress]);
  useEffect(() => {
    if (menuOpen) {
      menuRef.current
        ?.querySelector<HTMLElement>('button')
        ?.focus({preventScroll: true});
    }
  }, [menuOpen]);
  const given = medGivenCount(med);
  const missed = medMissedCount(med);
  const fillPx = drainWidth(med.supplyDays);
  const rowName = open
    ? \`Log today's \${med.name} dose\`
    : \`\${med.name}, all doses logged\`;
  return (
    <div style={styles.trackletOuter} ref={registerRef}>
      {flash ? <span className="vtr-flash" style={styles.flashWash} onAnimationEnd={onFlashEnd} aria-hidden /> : null}
      <button
        type="button"
        ref={rowRef}
        className="vtr-btn vtr-focusable"
        style={styles.trackletBtn}
        aria-label={rowName}
        onClick={onPrimary}
        onPointerDown={event => {
          pressStart.current = {x: event.clientX, y: event.clientY};
          pressTimer.current = window.setTimeout(() => {
            pressTimer.current = null;
            if (rowRef.current != null) onMenu(rowRef.current);
          }, 450);
        }}
        onPointerMove={event => {
          const start = pressStart.current;
          if (start != null && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) {
            clearPress();
          }
        }}
        onPointerUp={clearPress}
        onPointerLeave={clearPress}
        onPointerCancel={clearPress}>
        <span style={styles.trackletLine1}>
          <span style={styles.medName}>
            {med.name} <span style={styles.medDose}>{med.doseLabel}</span>
          </span>
          <span style={styles.refillCluster} aria-hidden>
            <span style={styles.drainTrack}>
              <span style={{...styles.drainFill, width: fillPx}} />
              <span style={styles.drainRing} />
            </span>
            <span style={styles.drainDays}>
              {med.refillRequested ? 'req.' : \`\${med.supplyDays} days\`}
            </span>
          </span>
        </span>
        <span style={styles.pipStrip} aria-hidden>
          {med.pips.map((pip, index) => {
            const settled =
              lastLoggedPip != null &&
              lastLoggedPip.medId === med.id &&
              lastLoggedPip.index === index;
            const pipStyle =
              pip === 'given'
                ? {...styles.pip, ...styles.pipGiven}
                : pip === 'missed'
                  ? {...styles.pip, ...styles.pipMissed}
                  : {...styles.pip, ...styles.pipOpen};
            return (
              <span
                key={settled ? \`pip-\${index}-\${lastLoggedPip.seq}\` : \`pip-\${index}\`}
                className={settled ? 'vtr-settle' : undefined}
                style={pipStyle}
              />
            );
          })}
        </span>
        <span style={styles.medCaption} aria-hidden>
          {medCaption(med)}
        </span>
        <span className="vtr-vh">
          {\`\${given} of \${given + missed} given, \${missed} missed, \${med.supplyDays} days of supply\${med.refillRequested ? ', refill requested' : ''}\`}
        </span>
      </button>
      <span style={styles.ellipsisCol}>
        <button
          type="button"
          className="vtr-btn vtr-focusable"
          style={styles.iconBtn}
          aria-label={\`\${med.name} options\`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={event => onMenu(event.currentTarget)}>
          <Icon icon={MoreHorizontalIcon} size="sm" />
        </button>
      </span>
      {menuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`\${med.name} options\`}
          className="vtr-menu-in"
          style={styles.medMenu}
          onKeyDown={event => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              const items = Array.from(
                menuRef.current?.querySelectorAll<HTMLElement>('button') ?? [],
              );
              const current = items.indexOf(document.activeElement as HTMLElement);
              const next =
                (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
              items[next]?.focus();
            }
          }}>
          {(
            [
              ['log', 'Log dose'],
              ['skip', 'Skip dose'],
              ['refill', 'Request refill'],
              ['history', 'View history'],
            ] as Array<[MedMenuAction, string]>
          ).map(([action, label], index) => (
            <div key={\`\${instanceId}-\${action}\`}>
              {index > 0 ? <div style={styles.rowDividerInset} /> : null}
              <button
                type="button"
                role="menuitem"
                className="vtr-btn vtr-focusable"
                style={styles.menuRow}
                onClick={() => onMenuAction(action, menuRef.current)}>
                <span style={styles.menuRowText}>{label}</span>
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TIMELINE ENTRY ROW — 72px media button: 40px node circle (kind icon,
// optional VaccineHalo) + title/meta stack + trailing value.
// ---------------------------------------------------------------------------

interface EntryRowProps {
  entry: TimelineEntry;
  flash: boolean;
  onOpen: (opener: HTMLElement) => void;
  registerRef: (el: HTMLDivElement | null) => void;
  onFlashEnd: () => void;
}

function TimelineEntryRow({entry, flash, onOpen, registerRef, onFlashEnd}: EntryRowProps) {
  const KindIcon = ENTRY_KIND_ICON[entry.kind];
  return (
    <div ref={registerRef} style={{position: 'relative'}}>
      {flash ? <span className="vtr-flash" style={styles.flashWash} onAnimationEnd={onFlashEnd} aria-hidden /> : null}
      <button
        type="button"
        className="vtr-btn vtr-focusable"
        style={styles.entryRow}
        aria-label={\`\${entry.title} — \${entry.dateLabel}\`}
        onClick={event => onOpen(event.currentTarget)}>
        <span style={styles.nodeWrap}>
          <span
            style={
              entry.kind === 'vaccine' ? {...styles.node, ...styles.nodeBrand} : styles.node
            }
            aria-hidden>
            <Icon icon={KindIcon} size="sm" />
          </span>
          {entry.halo != null ? <VaccineHalo tier={entry.halo} /> : null}
        </span>
        <span style={styles.entryText}>
          <span style={styles.entryTitle}>{entry.title}</span>
          <span style={styles.entryMeta}>
            {entry.dateLabel} · {entry.vet} · {entry.detail}
          </span>
        </span>
        <span
          style={
            entry.trailingError
              ? {...styles.entryTrailing, ...styles.entryTrailingError}
              : styles.entryTrailing
          }>
          {entry.trailing}
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET — two detents (55% / calc(100% − 56px)), clickable 36×5 grabber
// button, 52px header with 44×44 X, one legal inner scroller. role=dialog,
// focus trapped; the opener gets focus back on every close path.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onToggleDetent: () => void;
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onToggleDetent, onClose, panelRef, children}: SheetProps) {
  return (
    <>
      <div style={styles.sheetScrim} onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        tabIndex={-1}
        className="vtr-sheet-in"
        style={{
          ...styles.sheet,
          height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        }}
        onKeyDown={event => trapTabKey(event, panelRef.current)}>
        <div style={styles.grabberZone}>
          <button
            type="button"
            className="vtr-btn vtr-focusable"
            aria-label="Resize sheet"
            onClick={onToggleDetent}
            style={{width: 44, height: 24, display: 'grid', placeItems: 'center', borderRadius: 12}}>
            <span style={styles.grabberPill} />
          </button>
        </div>
        <div style={styles.sheetHeader}>
          <span />
          <h2 id={titleId} style={styles.sheetTitle}>
            {title}
          </h2>
          <button
            type="button"
            className="vtr-btn vtr-focusable"
            style={styles.iconBtn}
            aria-label="Close"
            onClick={onClose}>
            <Icon icon={XIcon} size="sm" />
          </button>
        </div>
        <div style={styles.sheetBody}>{children}</div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// DUE-SOON CHIPS — derived from the meds store + vaccine fixtures so the
// rail rewires itself after every mutation.
// ---------------------------------------------------------------------------

interface DueChip {
  id: string;
  icon: typeof PillIcon;
  label: string;
  count: string;
  error?: boolean;
  targetTab: TabId;
  targetId: string;
  announceText: string;
}

function deriveChips(petId: string, meds: Med[]): DueChip[] {
  if (petId === 'pet-biscuit') {
    const apoquel = meds.find(med => med.id === 'med-apoquel');
    if (apoquel == null) return [];
    const refillNodeLive = apoquel.supplyDays <= apoquel.refillThreshold;
    return [
      {
        id: 'chip-apoquel',
        icon: PillIcon,
        label: 'Apoquel',
        count: medOpen(apoquel) ? 'today' : 'logged',
        targetTab: 'meds',
        targetId: 'row-med-apoquel',
        announceText: "today's Apoquel dose",
      },
      {
        id: 'chip-refill',
        icon: PackageIcon,
        label: 'Refill',
        count: apoquel.refillRequested ? 'requested' : \`\${apoquel.supplyDays} days\`,
        targetTab: refillNodeLive ? 'timeline' : 'meds',
        targetId: refillNodeLive ? 'tl-refill-apoquel' : 'row-med-apoquel',
        announceText: 'Apoquel refill',
      },
      {
        id: 'chip-rabies',
        icon: SyringeIcon,
        label: 'Rabies',
        count: '21d',
        targetTab: 'timeline',
        targetId: 'tl-b-260612',
        announceText: 'Rabies vaccine',
      },
      {
        id: 'chip-bordetella',
        icon: TriangleAlertIcon,
        label: 'Bordetella',
        count: '108d overdue',
        error: true,
        targetTab: 'timeline',
        targetId: 'tl-b-250318',
        announceText: 'Bordetella vaccine',
      },
    ];
  }
  const methimazole = meds.find(med => med.id === 'med-methimazole');
  if (methimazole == null) return [];
  return [
    {
      id: 'chip-methimazole',
      icon: PillIcon,
      label: 'Methimazole',
      count: medOpen(methimazole) ? 'today' : 'logged',
      targetTab: 'meds',
      targetId: 'row-med-methimazole',
      announceText: "today's Methimazole dose",
    },
    {
      id: 'chip-fvrcp',
      icon: SyringeIcon,
      label: 'FVRCP',
      count: '64d',
      targetTab: 'timeline',
      targetId: 'tl-m-260411',
      announceText: 'FVRCP vaccine',
    },
  ];
}

interface RefillNode {
  id: string;
  medId: string;
  title: string;
  meta: string;
  requested: boolean;
}

/** Derived selector — a med at or under its refill threshold projects a
 * timeline node atop the newest year. ≤ (not <) is load-bearing: the
 * post-log supply of 5 against threshold 5 is exactly what fires it
 * (stress fixture 3). */
function deriveRefillNodes(meds: Med[]): RefillNode[] {
  return meds
    .filter(med => med.supplyDays <= med.refillThreshold)
    .map(med => ({
      id: \`tl-refill-\${med.name.split(' ')[0].toLowerCase()}\`,
      medId: med.id,
      // Jul 4 + 5 days = Thu, Jul 9 ✓ (arithmetic wins over the idea's
      // 'Fri'; weekday wheel anchored on TODAY = Saturday).
      title: \`\${med.name} refill due \${refillDueLabel(med.supplyDays)}\`,
      meta: \`\${TODAY_LABEL} · Larkspur pharmacy · \${med.supplyDays} days of supply left\`,
      requested: med.refillRequested,
    }));
}

const TAB_DEFS: Array<{id: TabId; label: string; icon: typeof ListIcon}> = [
  {id: 'timeline', label: 'Timeline', icon: ListIcon},
  {id: 'meds', label: 'Meds', icon: PillIcon},
  {id: 'records', label: 'Records', icon: FolderIcon},
  {id: 'profile', label: 'Profile', icon: PawPrintIcon},
];

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobilePetVetTimelineTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(wrapRef);
  // Viewport query is only the first-frame fallback; container width wins.
  const viewportWide = useMediaQuery('(min-width: 900px)');
  const isDesktop = containerWidth > 0 ? containerWidth >= 720 : viewportWide;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // THE single state owner + one update(id, value).
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const update = useCallback(
    <K extends keyof AppState>(id: K, value: AppState[K]) => {
      setState(prev => ({...prev, [id]: value}));
    },
    [],
  );

  const toastSeqRef = useRef(0);
  const scrollPosRef = useRef<Record<TabId, number>>({
    timeline: 0,
    meds: 0,
    records: 0,
    profile: 0,
  });
  const targetRefs = useRef(new Map<string, HTMLDivElement>());
  const pendingJumpRef = useRef<string | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const sheetPanelRef = useRef<HTMLDivElement | null>(null);
  const petMenuRef = useRef<HTMLDivElement | null>(null);
  const petSwitcherRef = useRef<HTMLButtonElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeTabRef = useRef<TabId>(state.activeTab);
  activeTabRef.current = state.activeTab;

  const activePet = PETS.find(pet => pet.id === state.activePetId) ?? PETS[0];
  const meds = state.medsByPet[activePet.id] ?? [];
  const timeline = TIMELINES[activePet.id] ?? [];
  const records = RECORDS[activePet.id] ?? [];
  const vaccines = VACCINES[activePet.id] ?? [];
  const weightSeries = WEIGHT_SERIES[activePet.id];
  const chips = deriveChips(activePet.id, meds);
  const refillNodes = deriveRefillNodes(meds);
  const badgeCount = openDoseCount(meds);
  const refreshPhase = state.refreshByPet[activePet.id] ?? 'idle';
  const dueMeds = meds.filter(medOpen);
  const sheetOpen = state.sheet != null;

  const registerTarget = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el == null) {
      targetRefs.current.delete(id);
    } else {
      targetRefs.current.set(id, el);
    }
  }, []);

  // Per-tab scroll persistence — restore the saved outer-scroller position
  // on tab entry (skipped when a chip jump is about to scroll instead).
  useEffect(() => {
    if (pendingJumpRef.current != null) return;
    const scroller = getScrollParent(shellRef.current);
    if (scroller == null) return;
    const top = scrollPosRef.current[state.activeTab] ?? 0;
    requestAnimationFrame(() => {
      scroller.scrollTop = top;
    });
  }, [state.activeTab]);

  // Chip / vaccine-row jumps — scroll the freshly rendered target into
  // view after commit.
  useEffect(() => {
    if (pendingJumpRef.current == null) return;
    const el = targetRefs.current.get(pendingJumpRef.current);
    pendingJumpRef.current = null;
    el?.scrollIntoView({behavior: 'auto', block: 'center'});
  });

  // Sheet focus contract — focus({preventScroll: true}) INTO the opening
  // sheet (plain .focus() would scroll-reveal the animating sheet inside
  // the locked column and beach it mid-screen); restore to the opener on
  // every close path, then restore the outer scroll position lost to the
  // 100dvh scroll lock.
  useEffect(() => {
    if (sheetOpen) {
      sheetPanelRef.current?.focus({preventScroll: true});
      return;
    }
    if (sheetOpenerRef.current != null) {
      sheetOpenerRef.current.focus({preventScroll: true});
      sheetOpenerRef.current = null;
      const scroller = getScrollParent(shellRef.current);
      const top = scrollPosRef.current[activeTabRef.current] ?? 0;
      if (scroller != null) {
        requestAnimationFrame(() => {
          scroller.scrollTop = top;
        });
      }
    }
  }, [sheetOpen]);

  useEffect(() => {
    if (state.petMenuOpen) {
      petMenuRef.current
        ?.querySelector<HTMLElement>('button')
        ?.focus({preventScroll: true});
    }
  }, [state.petMenuOpen]);

  // -------------------------------------------------------------------
  // Mutations — every consequence of a dispatch lives in ONE functional
  // setState so log/undo are single assignments.
  // -------------------------------------------------------------------

  function nextSeq(): number {
    toastSeqRef.current += 1;
    return toastSeqRef.current;
  }

  function announce(text: string, visible: boolean) {
    const seq = nextSeq();
    setState(prev => ({
      ...prev,
      toast: {seq, text, visible, undoable: false},
      undoSnapshot: null,
    }));
  }

  /** SIGNATURE FLOW — one meds-store patch, four consequences: pip flips
   * open→given (settle), supply 6→5 drains the track and rewrites the
   * rail chip, 5 ≤ threshold 5 births the derived refill node ('All 15
   * entries'), and the Meds badge unmounts 1→0. */
  function logDose(medId: string) {
    const seq = nextSeq();
    setState(prev => {
      const petId = prev.activePetId;
      const petMeds = prev.medsByPet[petId] ?? [];
      const med = petMeds.find(m => m.id === medId);
      if (med == null) return prev;
      if (!medOpen(med)) {
        return {
          ...prev,
          medMenuId: null,
          toast: {seq, text: 'Already logged today', visible: true, undoable: false},
          undoSnapshot: null,
        };
      }
      const openIndex = med.pips.length - 1;
      const nextMed: Med = {
        ...med,
        pips: med.pips.map((pip, index) => (index === openIndex ? 'given' : pip)),
        supplyDays: med.supplyDays - 1,
      };
      return {
        ...prev,
        medMenuId: null,
        medsByPet: {
          ...prev.medsByPet,
          [petId]: petMeds.map(m => (m.id === medId ? nextMed : m)),
        },
        lastLoggedPip: {medId, index: openIndex, seq},
        toast: {seq, text: 'Dose logged', visible: true, undoable: true},
        undoSnapshot: {petId, meds: petMeds, revertText: 'Dose unlogged'},
      };
    });
  }

  function skipDose(medId: string) {
    const seq = nextSeq();
    setState(prev => {
      const petId = prev.activePetId;
      const petMeds = prev.medsByPet[petId] ?? [];
      const med = petMeds.find(m => m.id === medId);
      if (med == null) return prev;
      if (!medOpen(med)) {
        return {
          ...prev,
          medMenuId: null,
          toast: {seq, text: 'Already logged today', visible: true, undoable: false},
          undoSnapshot: null,
        };
      }
      const openIndex = med.pips.length - 1;
      const nextMed: Med = {
        ...med,
        // Skipping resolves the open pip as missed; supply is untouched
        // (no pill left the bottle).
        pips: med.pips.map((pip, index) => (index === openIndex ? 'missed' : pip)),
      };
      return {
        ...prev,
        medMenuId: null,
        medsByPet: {
          ...prev.medsByPet,
          [petId]: petMeds.map(m => (m.id === medId ? nextMed : m)),
        },
        toast: {seq, text: 'Dose skipped', visible: true, undoable: true},
        undoSnapshot: {petId, meds: petMeds, revertText: 'Dose restored'},
      };
    });
  }

  function requestRefill(medId: string) {
    const seq = nextSeq();
    setState(prev => {
      const petId = prev.activePetId;
      const petMeds = prev.medsByPet[petId] ?? [];
      const med = petMeds.find(m => m.id === medId);
      if (med == null) return prev;
      if (med.refillRequested) {
        return {
          ...prev,
          medMenuId: null,
          toast: {seq, text: 'Refill already requested', visible: true, undoable: false},
          undoSnapshot: null,
        };
      }
      return {
        ...prev,
        medMenuId: null,
        medsByPet: {
          ...prev.medsByPet,
          [petId]: petMeds.map(m => (m.id === medId ? {...m, refillRequested: true} : m)),
        },
        toast: {seq, text: 'Refill requested', visible: true, undoable: true},
        undoSnapshot: {petId, meds: petMeds, revertText: 'Refill request removed'},
      };
    });
  }

  /** UNDO — one assignment restores the exact prior meds object; the
   * derived refill node, badge, chip text, and caption all revert. */
  function undo() {
    const seq = nextSeq();
    setState(prev => {
      const snapshot = prev.undoSnapshot;
      if (snapshot == null) return prev;
      return {
        ...prev,
        medsByPet: {...prev.medsByPet, [snapshot.petId]: snapshot.meds},
        lastLoggedPip: null,
        toast: {seq, text: snapshot.revertText, visible: true, undoable: false},
        undoSnapshot: null,
      };
    });
  }

  function handleMedMenuAction(medId: string, action: MedMenuAction) {
    if (action === 'log') {
      logDose(medId);
      menuOpenerRef.current?.focus({preventScroll: true});
    } else if (action === 'skip') {
      skipDose(medId);
      menuOpenerRef.current?.focus({preventScroll: true});
    } else if (action === 'refill') {
      requestRefill(medId);
      menuOpenerRef.current?.focus({preventScroll: true});
    } else {
      openSheet('history', medId, menuOpenerRef.current);
    }
    menuOpenerRef.current = action === 'history' ? menuOpenerRef.current : null;
  }

  function closeMedMenu() {
    update('medMenuId', null);
    menuOpenerRef.current?.focus({preventScroll: true});
    menuOpenerRef.current = null;
  }

  // -------------------------------------------------------------------
  // Navigation.
  // -------------------------------------------------------------------

  function pressTab(tab: TabId) {
    const scroller = getScrollParent(shellRef.current);
    if (tab === state.activeTab) {
      // The one legal reset: re-tapping the active tab scrolls to top.
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    if (scroller != null) {
      scrollPosRef.current[state.activeTab] = scroller.scrollTop;
    }
    // Overlays close on tab switch; the toast dock persists (per-tab
    // state law).
    setState(prev => ({
      ...prev,
      activeTab: tab,
      petMenuOpen: false,
      medMenuId: null,
      sheet: null,
    }));
  }

  function onTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const dir = event.key === 'ArrowRight' ? 1 : -1;
    const next = (index + dir + TAB_DEFS.length) % TAB_DEFS.length;
    tabRefs.current[next]?.focus();
    pressTab(TAB_DEFS[next].id);
  }

  function jumpTo(targetTab: TabId, targetId: string, announceText: string) {
    const seq = nextSeq();
    if (targetTab !== state.activeTab) {
      const scroller = getScrollParent(shellRef.current);
      if (scroller != null) {
        scrollPosRef.current[state.activeTab] = scroller.scrollTop;
      }
    }
    pendingJumpRef.current = targetId;
    setState(prev => ({
      ...prev,
      activeTab: targetTab,
      petMenuOpen: false,
      medMenuId: null,
      sheet: null,
      // Flash is motion garnish — skipped entirely under reduced motion.
      flashId: reducedMotion ? null : targetId,
      toast: {seq, text: \`Jumped to \${announceText}\`, visible: false, undoable: false},
    }));
  }

  function switchPet(petId: string) {
    // Overlays belong to their moment; per-pet state (meds, refresh,
    // derived nodes) is keyed by petId in the one owner, so Biscuit's
    // logged state survives a round trip through Mochi untouched.
    setState(prev => ({
      ...prev,
      activePetId: petId,
      petMenuOpen: false,
      medMenuId: null,
      sheet: null,
    }));
    petSwitcherRef.current?.focus({preventScroll: true});
  }

  function openSheet(kind: SheetKind, refId: string, opener: HTMLElement | null) {
    sheetOpenerRef.current = opener;
    const scroller = getScrollParent(shellRef.current);
    if (scroller != null) {
      scrollPosRef.current[state.activeTab] = scroller.scrollTop;
    }
    setState(prev => ({
      ...prev,
      sheet: {kind, refId, detent: 'medium'},
      petMenuOpen: false,
      medMenuId: null,
    }));
  }

  function closeSheet() {
    setState(prev => ({...prev, sheet: null}));
  }

  function toggleDetent() {
    setState(prev =>
      prev.sheet == null
        ? prev
        : {
            ...prev,
            sheet: {...prev.sheet, detent: prev.sheet.detent === 'medium' ? 'large' : 'medium'},
          },
    );
  }

  function pressRefresh() {
    if (state.activeTab !== 'records') {
      announce('Records up to date', false);
      return;
    }
    const seq = nextSeq();
    setState(prev => ({
      ...prev,
      refreshByPet: {...prev.refreshByPet, [prev.activePetId]: 'loading'},
      toast: {seq, text: 'Loading 4 records', visible: false, undoable: false},
      undoSnapshot: prev.undoSnapshot,
    }));
  }

  function resolveRefresh() {
    const seq = nextSeq();
    setState(prev => ({
      ...prev,
      refreshByPet: {...prev.refreshByPet, [prev.activePetId]: 'done'},
      toast: {seq, text: 'Updated just now', visible: false, undoable: false},
    }));
  }

  // Escape closes the topmost overlay ONLY: menu > sheet.
  function onShellKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape') return;
    if (state.petMenuOpen) {
      update('petMenuOpen', false);
      petSwitcherRef.current?.focus({preventScroll: true});
      return;
    }
    if (state.medMenuId != null) {
      closeMedMenu();
      return;
    }
    if (state.sheet != null) {
      closeSheet();
    }
  }

  // -------------------------------------------------------------------
  // Shared tracklet wiring.
  // -------------------------------------------------------------------

  function trackletFor(med: Med, instanceId: string) {
    return (
      <DoseTracklet
        instanceId={instanceId}
        med={med}
        menuOpen={state.medMenuId === instanceId}
        lastLoggedPip={state.lastLoggedPip}
        flash={state.flashId === \`row-\${med.id}\`}
        onPrimary={() => logDose(med.id)}
        onMenu={opener => {
          menuOpenerRef.current = opener;
          update('medMenuId', state.medMenuId === instanceId ? null : instanceId);
        }}
        onMenuAction={action => handleMedMenuAction(med.id, action)}
        registerRef={el => registerTarget(\`row-\${med.id}\`, el)}
        onFlashEnd={() => update('flashId', null)}
      />
    );
  }

  // -------------------------------------------------------------------
  // Sheet content resolution.
  // -------------------------------------------------------------------

  let sheetNode: ReactNode = null;
  if (state.sheet != null) {
    const {kind, refId, detent} = state.sheet;
    const primaryMed = meds[0];
    if (kind === 'entry') {
      const entry = timeline.find(e => e.id === refId);
      if (entry != null) {
        sheetNode = (
          <Sheet
            titleId="vtr-sheet-title"
            title={entry.title}
            detent={detent}
            onToggleDetent={toggleDetent}
            onClose={closeSheet}
            panelRef={sheetPanelRef}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Date</span>
              <span style={styles.summaryValue}>{entry.dateLabel}</span>
            </div>
            <div style={styles.rowDividerFull} />
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Vet</span>
              <span style={styles.summaryValue}>{entry.vet}</span>
            </div>
            <div style={styles.rowDividerFull} />
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Summary</span>
              <span style={styles.summaryValue}>{entry.detail}</span>
            </div>
            <div style={styles.rowDividerFull} />
            <p style={styles.noteP}>{entry.note}</p>
            {entry.attachments.map(name => (
              <div key={name} style={styles.attachRow}>
                <span style={styles.attachThumb} aria-hidden>
                  <Icon icon={FileTextIcon} size="sm" />
                </span>
                <span style={styles.recordText}>
                  <span style={styles.recordName}>{name}</span>
                  <span style={styles.recordMeta}>Attachment</span>
                </span>
              </div>
            ))}
            <div style={styles.sheetActions}>
              {primaryMed != null ? (
                primaryMed.refillRequested ? (
                  <span style={styles.requestedText}>Refill requested</span>
                ) : (
                  <button
                    type="button"
                    className="vtr-btn vtr-focusable"
                    style={styles.secondaryBtn}
                    onClick={() => requestRefill(primaryMed.id)}>
                    Request refill
                  </button>
                )
              ) : null}
              <button
                type="button"
                className="vtr-btn vtr-focusable"
                style={styles.secondaryBtn}
                onClick={() => announce('Follow-up request sent', true)}>
                Book follow-up
              </button>
            </div>
          </Sheet>
        );
      }
    } else if (kind === 'record') {
      const record = records.find(r => r.id === refId);
      if (record != null) {
        sheetNode = (
          <Sheet
            titleId="vtr-sheet-title"
            title={record.name}
            detent={detent}
            onToggleDetent={toggleDetent}
            onClose={closeSheet}
            panelRef={sheetPanelRef}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>File</span>
              <span style={styles.summaryValue}>{record.meta}</span>
            </div>
            <div style={styles.rowDividerFull} />
            <p style={styles.noteP}>{record.note}</p>
          </Sheet>
        );
      }
    } else {
      const med = meds.find(m => m.id === refId);
      const rows = MED_HISTORY[refId] ?? [];
      sheetNode = (
        <Sheet
          titleId="vtr-sheet-title"
          title={\`\${med?.name ?? 'Medication'} history\`}
          detent={detent}
          onToggleDetent={toggleDetent}
          onClose={closeSheet}
          panelRef={sheetPanelRef}>
          {rows.map((row, index) => (
            <div key={row.id}>
              {index > 0 ? <div style={styles.rowDividerFull} /> : null}
              <div style={styles.historyRow}>
                <span style={styles.recordText}>
                  {/* 'Amoxicillin-Clavulanate 62.5 mg' — the long-name
                      truncation stress ellipsizes against the fixed
                      trailing status (stress fixture 1). */}
                  <span style={styles.recordName}>{row.name}</span>
                  <span style={styles.recordMeta}>{row.meta}</span>
                </span>
                <span style={styles.requestedText}>{row.status}</span>
              </div>
            </div>
          ))}
        </Sheet>
      );
    }
  }

  // -------------------------------------------------------------------
  // Tab bodies.
  // -------------------------------------------------------------------

  const years: string[] = [];
  for (const entryItem of timeline) {
    if (!years.includes(entryItem.year)) years.push(entryItem.year);
  }

  const timelineBody = (
    <div>
      {years.map((year, yearIndex) => {
        const entries = timeline.filter(e => e.year === year);
        const nodes = yearIndex === 0 ? refillNodes : [];
        return (
          <section key={year}>
            <h2 style={styles.sectionHeaderFeed}>{year}</h2>
            <div style={styles.rowDividerFull} />
            {nodes.map(node => (
              <div key={node.id}>
                <div ref={el => registerTarget(node.id, el)} style={{position: 'relative'}}>
                  {state.flashId === node.id ? (
                    <span
                      className="vtr-flash"
                      style={styles.flashWash}
                      onAnimationEnd={() => update('flashId', null)}
                      aria-hidden
                    />
                  ) : null}
                  <div style={styles.entryRow}>
                    <span style={styles.nodeWrap}>
                      <span style={{...styles.node, ...styles.nodeBrand}} aria-hidden>
                        <Icon icon={PillIcon} size="sm" />
                      </span>
                    </span>
                    <span style={styles.entryText}>
                      <span style={styles.entryTitle}>{node.title}</span>
                      <span style={styles.entryMeta}>{node.meta}</span>
                    </span>
                    {node.requested ? (
                      <span style={styles.requestedText}>Requested</span>
                    ) : (
                      <button
                        type="button"
                        className="vtr-btn vtr-focusable"
                        style={styles.secondaryBtn}
                        onClick={() => requestRefill(node.medId)}>
                        Request refill
                      </button>
                    )}
                  </div>
                </div>
                <div style={styles.rowDividerFull} />
              </div>
            ))}
            {entries.map(entry => (
              <div key={entry.id}>
                <TimelineEntryRow
                  entry={entry}
                  flash={state.flashId === entry.id}
                  onOpen={opener => openSheet('entry', entry.id, opener)}
                  registerRef={el => registerTarget(entry.id, el)}
                  onFlashEnd={() => update('flashId', null)}
                />
                <div style={styles.rowDividerFull} />
              </div>
            ))}
            {yearIndex === 0 ? <WeightSparkCard series={weightSeries} /> : null}
          </section>
        );
      })}
      <p style={styles.terminalCaption}>
        All {timeline.length + refillNodes.length} entries
      </p>
    </div>
  );

  const medsBody = (
    <div>
      <h2 style={styles.sectionHeaderInset}>Due today</h2>
      <div style={styles.listCard}>
        {dueMeds.length === 0 ? (
          <div style={styles.utilityRow}>
            <span style={{...styles.utilityLabel, color: 'var(--color-text-secondary)'}}>
              All caught up for today
            </span>
          </div>
        ) : (
          dueMeds.map((med, index) => (
            <div key={\`due-\${med.id}\`}>
              {index > 0 ? <div style={styles.rowDividerInset} /> : null}
              {trackletFor(med, \`due-\${med.id}\`)}
            </div>
          ))
        )}
      </div>
      <h2 style={styles.sectionHeaderInset}>All medications</h2>
      <div style={styles.listCard}>
        {meds.map((med, index) => (
          <div key={\`all-\${med.id}\`}>
            {index > 0 ? <div style={styles.rowDividerInset} /> : null}
            {trackletFor(med, \`all-\${med.id}\`)}
          </div>
        ))}
      </div>
      <div style={{height: 24}} />
    </div>
  );

  const recordsBody = (
    <div>
      <h2 style={styles.sectionHeaderInset}>Documents</h2>
      {refreshPhase === 'loading' ? (
        <RecordSkeleton />
      ) : (
        <div style={styles.listCard}>
          {records.map((record, index) => (
            <div key={record.id}>
              {index > 0 ? <div style={styles.rowDividerInset} /> : null}
              <button
                type="button"
                className="vtr-btn vtr-focusable"
                style={styles.recordRow}
                onClick={event => openSheet('record', record.id, event.currentTarget)}>
                <span style={styles.recordText}>
                  <span style={styles.recordName}>{record.name}</span>
                  <span style={styles.recordMeta}>{record.meta}</span>
                </span>
                <span style={styles.chevron} aria-hidden>
                  <Icon icon={ChevronRightIcon} size="sm" />
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
      {refreshPhase === 'loading' ? (
        <div style={styles.statusCaptionRow}>
          <span>Refreshing records…</span>
          <button
            type="button"
            className="vtr-btn vtr-focusable"
            style={styles.doneBtn}
            onClick={resolveRefresh}>
            Done
          </button>
        </div>
      ) : refreshPhase === 'done' ? (
        <div style={styles.statusCaptionRow}>
          <span>Updated just now</span>
        </div>
      ) : (
        <p style={styles.terminalCaption}>All {records.length} records</p>
      )}
    </div>
  );

  const profileBody = (
    <div>
      <div style={{...styles.listCard, marginTop: 16}}>
        <div style={styles.profileRow}>
          <PetAvatar pet={activePet} sizeStyle={styles.petAvatar48} />
          <span style={styles.entryText}>
            <span style={styles.profileName}>{activePet.name}</span>
            <span style={styles.entryMeta}>{activePet.sexLine}</span>
          </span>
        </div>
      </div>
      <h2 style={styles.sectionHeaderInset}>Vaccines</h2>
      <div style={styles.listCard}>
        {vaccines.map((vaccine, index) => (
          <div key={vaccine.id}>
            {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
            <button
              type="button"
              className="vtr-btn vtr-focusable"
              style={styles.profileRow}
              aria-label={\`\${vaccine.name} — \${vaccine.dueText}. Show in timeline\`}
              onClick={() => jumpTo('timeline', vaccine.entryId, \`\${vaccine.name} vaccine\`)}>
              <span style={styles.nodeWrap}>
                <span style={{...styles.node, ...styles.nodeBrand}} aria-hidden>
                  <Icon icon={SyringeIcon} size="sm" />
                </span>
                <VaccineHalo tier={vaccine.halo} />
              </span>
              <span style={styles.entryText}>
                <span style={styles.entryTitle}>{vaccine.name}</span>
                <span
                  style={
                    vaccine.error
                      ? {...styles.entryMeta, color: ERROR_STRONG, fontWeight: 500}
                      : styles.entryMeta
                  }>
                  {vaccine.dueText}
                </span>
              </span>
              <span style={styles.chevron} aria-hidden>
                <Icon icon={ChevronRightIcon} size="sm" />
              </span>
            </button>
          </div>
        ))}
      </div>
      <h2 style={styles.sectionHeaderInset}>Weight</h2>
      <div style={{...styles.sparkCard, marginBlock: 0}}>
        <div style={styles.sparkHeader}>
          <span style={styles.sparkTitle}>{weightSeries.checksLabel}</span>
          <span style={styles.sparkValue}>{weightSeries.lastLabel}</span>
        </div>
        <WeightSpark series={weightSeries} />
      </div>
      <h2 style={styles.sectionHeaderInset}>Details</h2>
      <div style={styles.listCard}>
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Vet clinic</span>
          <span style={styles.utilityValue}>{activePet.clinic}</span>
        </div>
        <div style={styles.rowDividerInset} />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Microchip</span>
          <span style={styles.utilityValue}>{activePet.microchip}</span>
        </div>
      </div>
      <div style={{height: 24}} />
    </div>
  );

  const activeBody =
    state.activeTab === 'timeline'
      ? timelineBody
      : state.activeTab === 'meds'
        ? medsBody
        : state.activeTab === 'records'
          ? recordsBody
          : profileBody;

  const activeTabDef = TAB_DEFS.find(tab => tab.id === state.activeTab) ?? TAB_DEFS[0];

  // -------------------------------------------------------------------
  // Shell.
  // -------------------------------------------------------------------

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{VETTRA_CSS}</style>
      <div
        ref={shellRef}
        style={{
          ...styles.shell,
          ...(isDesktop ? styles.shellDesktop : null),
          ...(sheetOpen ? styles.shellLocked : null),
        }}
        onKeyDown={onShellKeyDown}>
        <h1 className="vtr-vh">
          Vettra — {activePet.name} · {activeTabDef.label}
        </h1>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <VettraMark />
          </div>
          <div style={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
            <button
              type="button"
              ref={petSwitcherRef}
              className="vtr-btn vtr-focusable"
              style={styles.petSwitcher}
              aria-haspopup="menu"
              aria-expanded={state.petMenuOpen}
              aria-label={\`Switch pet — viewing \${activePet.name}\`}
              onClick={() => update('petMenuOpen', !state.petMenuOpen)}>
              <PetAvatar pet={activePet} sizeStyle={styles.petAvatar28} />
              <span style={styles.petName}>{activePet.name}</span>
              <span style={styles.chevron} aria-hidden>
                <Icon icon={ChevronDownIcon} size="sm" />
              </span>
            </button>
            {state.petMenuOpen ? (
              <div
                ref={petMenuRef}
                role="menu"
                aria-label="Switch pet"
                className="vtr-menu-in"
                style={{...styles.petMenu, top: 52}}
                onKeyDown={event => {
                  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    const items = Array.from(
                      petMenuRef.current?.querySelectorAll<HTMLElement>('button') ?? [],
                    );
                    const current = items.indexOf(document.activeElement as HTMLElement);
                    const next =
                      (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) %
                      items.length;
                    items[next]?.focus();
                  }
                }}>
                {PETS.map((pet, index) => (
                  <div key={pet.id}>
                    {index > 0 ? <div style={styles.rowDividerInset} /> : null}
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={pet.id === state.activePetId}
                      className="vtr-btn vtr-focusable"
                      style={styles.menuRow}
                      onClick={() => switchPet(pet.id)}>
                      <PetAvatar pet={pet} sizeStyle={styles.petAvatar28} />
                      <span style={styles.menuRowText}>
                        {pet.name}
                        <span style={styles.medDose}> · {pet.species}</span>
                      </span>
                      <span style={styles.menuCheck} aria-hidden>
                        {pet.id === state.activePetId ? <Icon icon={CheckIcon} size="sm" /> : null}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="vtr-btn vtr-focusable"
              style={styles.iconBtn}
              aria-label="Refresh records"
              onClick={pressRefresh}>
              <Icon icon={RefreshCwIcon} size="md" />
            </button>
          </div>
        </header>
        {state.petMenuOpen ? (
          <button
            type="button"
            className="vtr-btn"
            style={styles.menuBackdrop}
            aria-label="Close pet menu"
            onClick={() => {
              update('petMenuOpen', false);
              petSwitcherRef.current?.focus({preventScroll: true});
            }}
          />
        ) : null}
        {state.medMenuId != null ? (
          <button
            type="button"
            className="vtr-btn"
            style={styles.medMenuBackdrop}
            aria-label="Close menu"
            onClick={closeMedMenu}
          />
        ) : null}
        <div style={styles.dueRail} role="group" aria-label="Due soon">
          {chips.map(chip => (
            <button
              key={chip.id}
              type="button"
              className="vtr-btn vtr-focusable"
              style={styles.chipHit}
              onClick={() => jumpTo(chip.targetTab, chip.targetId, chip.announceText)}>
              <span
                style={
                  chip.error
                    ? {...styles.chipBody, border: \`1px solid \${ERROR_STRONG}\`}
                    : styles.chipBody
                }>
                <span
                  style={chip.error ? {...styles.chipIcon, color: ERROR_STRONG} : styles.chipIcon}
                  aria-hidden>
                  <Icon icon={chip.icon} size="sm" />
                </span>
                <span
                  style={
                    chip.error ? {...styles.chipLabel, color: ERROR_STRONG} : styles.chipLabel
                  }>
                  {chip.label}
                </span>
                <span
                  style={
                    chip.error ? {...styles.chipCount, color: ERROR_STRONG} : styles.chipCount
                  }>
                  · {chip.count}
                </span>
              </span>
            </button>
          ))}
        </div>
        <main style={styles.main}>{activeBody}</main>
        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow above
            the tabBar, shell-absolute only while the sheet locks scroll. */}
        <div
          style={sheetOpen ? styles.toastAnchorLocked : styles.toastAnchor}
          aria-live="polite">
          {state.toast != null && state.toast.visible ? (
            <div style={styles.toast}>
              <span style={styles.toastMsg}>{state.toast.text}</span>
              {state.toast.undoable ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    className="vtr-btn vtr-focusable"
                    style={styles.undoBtn}
                    onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : state.toast != null ? (
            <span className="vtr-vh">{state.toast.text}</span>
          ) : null}
        </div>
        <nav style={styles.tabBar} role="tablist" aria-label="Vettra sections">
          {TAB_DEFS.map((tab, index) => {
            const active = state.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                ref={el => {
                  tabRefs.current[index] = el;
                }}
                className="vtr-btn vtr-focusable"
                style={active ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                onClick={() => pressTab(tab.id)}
                onKeyDown={event => onTabKeyDown(event, index)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" />
                  {tab.id === 'meds' && badgeCount > 0 ? (
                    <span style={styles.badge}>{badgeCount}</span>
                  ) : null}
                </span>
                <span style={active ? styles.tabLabelActive : styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        {sheetNode}
      </div>
    </div>
  );
}
`;export{e as default};