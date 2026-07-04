// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the mobile kit's overlay/feedback
 *   contracts as data: SHEET_FIXTURE (two-line context header + Reply /
 *   Forward / Move to Saved Recordings / Remove from Inbox), MENU_ITEMS
 *   (Copy Link to Highlight · Pin · Share · Delete Highlight), three
 *   archive-demo threads (Margarethe Vandenbroucke-Ashworth is the toast
 *   truncation stress), TOAST_STRINGS, BANNER_COPY keyed by severity,
 *   BADGE_FIXTURE [3, 12, 127 → '99+'], the ten-rung LAYERS z-ladder, the
 *   RESTORE_MATRIX, PCT_START 40 / PCT_STEP 20. No Date.now(), no
 *   Math.random(), no auto-dismiss timers (the one sanctioned timer is the
 *   450 ms long-press garnish, cancelled on 8px movement).
 * @output Astryx — Overlay & Feedback Gallery: a 390px MOBILE specimen
 *   sheet in the composer-state-gallery tradition. Nine sections under
 *   sticky blur GallerySectionHeaders: S1 frozen action sheet (open, with
 *   the decision table + 6-verbs RejectTag), S2 LIVE anchored long-press
 *   menu with the mandatory 44×44 ellipsis fallback and focus-restore
 *   readout, S3 LIVE archive→undo round-trip posting to the gallery's ONE
 *   real toastDock + frozen toast-anatomy trio + stacking-rule reject, S4
 *   frozen centered alert, S5 live severity-switched banner, S6 badge
 *   cluster, S7 live progress ring/bar sharing one pct + CSS-only
 *   indeterminate, S8 the z-index scrim ladder, S9 the focus-restore
 *   matrix with a live 'Copy link' proof that toasts never steal focus.
 *   Frozen specimens are pictures (aria-hidden, pointerEvents none, no
 *   dialog roles); live specimens hold their state in the single owner.
 * @position Page template; emitted by `astryx template mobile-overlay-gallery`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the 52px navBar
 *   at y=0 is the first pixel). No tabBar (a gallery has no destinations).
 *   All overlays are absolute INSIDE shell or INSIDE their SpecimenStage;
 *   position:fixed is banned. No sheet ever actually opens, so the shell
 *   never scroll-locks; per the batch-1 amendment the REAL toastDock is
 *   sticky-in-flow (bottom 16) rather than shell-absolute, because
 *   shell-absolute bottom pins to the document bottom of a tall scrolling
 *   view — the frozen specimens document the absolute contract verbatim
 *   and the dock's annotation cites both numbers.
 * Container policy: inset-grouped mobile cards; each specimen sits in a
 *   1px dashed SpecimenFrame (radius 12, padding 16); frozen overlay
 *   compositions render inside clipped SpecimenStages; no desktop Layout
 *   frames, no asides, no tables.
 * Color policy: token-pure chrome. THE quarantined brand literal is
 *   BRAND (Astryx indigo #4759E4), referenced ONLY where the shell mints
 *   --color-brand in TEMPLATE_TOKENS; two template-local severity tokens
 *   (--color-success, --color-warning) are minted beside it because the
 *   DS pairs fail 4.5:1 as text; --color-error comes from the DS. Badge
 *   text over error/brand fills flips dark-side to ink pairs with the
 *   contrast math at each declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px annotation rhythm · 44×44 minimum
 *   touch targets; navBar 52px sticky top z20 (blur, hairline always-on);
 *   NO tabBar, so the toast dock sits at bottom 16 (76 above a 64px
 *   tabBar + 12 when one exists); content padding '16px 16px 96px' (96
 *   clears dock + one toast + 24 air); GallerySectionHeaders sticky at
 *   top 52, z15 (above content, below chrome z20). Specimen anatomy
 *   quoted in annotations: 56px actionSheetRows · 44px menu rows · 60px
 *   thread rows · 48px min-height toasts · 32px segmented track · 4px
 *   progress tracks. TYPE (Figtree via --font-family-body): 17/600 nav +
 *   sheet titles · 16/400 row primaries · 13/400–500 secondary + toast
 *   text · 11/500–700 annotations, badges, frame labels; nothing under
 *   11px; tabular-nums on every updating numeral.
 *
 * Responsive contract:
 * - Fluid 320–430px: SpecimenStages are width:100% of the frame interior
 *   (390 − 2×16 gutter − 2×16 frame pad − 2px border = 324 at 390; the
 *   stage-relative px in every annotation — insetInline 16, bottom 16,
 *   width 236, min(280px, calc(100% − 64px)) — stay exactly true because
 *   frozen compositions use those same declarations). No width literals;
 *   overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as a
 *   centered 390px column (maxWidth 390, marginInline auto, 1px hairline)
 *   on a --color-background-muted canvas with 48px paddingBlock. Nothing
 *   reflows internally; hover is garnish only.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  ArchiveIcon,
  BellIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  LinkIcon,
  MailIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  PinIcon,
  ShareIcon,
  SunMoonIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Astryx indigo). Referenced only in
// TEMPLATE_TOKENS below, where the shell mints --color-brand.
const BRAND = {name: 'Astryx', color: '#4759E4'} as const;

// Template-local token block, set as custom properties on `shell` so every
// var(--color-brand|success|warning) below resolves to these pairs.
// Contrast math:
//   --color-brand   #4759E4 on #FFFFFF ≈ 5.5:1 ✓ · #A3AFFA on #1F1F22 ≈ 8.1:1 ✓
//   --color-success #1F7A43 on #FFFFFF ≈ 5.4:1 ✓ · #4CC38A on #1F1F22 ≈ 8.3:1 ✓
//   --color-warning #9A6700 on #FFFFFF ≈ 4.9:1 ✓ · #E2B93B on #1F1F22 ≈ 9.0:1 ✓
// (--color-error stays the DS token; the DS --color-success/--color-warning
// pairs fail 4.5:1 as text, hence the local mints — per spec.)
const TEMPLATE_TOKENS = {
  '--color-brand': `light-dark(${BRAND.color}, #A3AFFA)`,
  '--color-success': 'light-dark(#1F7A43, #4CC38A)',
  '--color-warning': 'light-dark(#9A6700, #E2B93B)',
} as CSSProperties;

// Text over a --color-error fill (countBadge). Light: #FFFFFF on #E3193B ≈
// 4.7:1 ✓. Dark: white on #F5394F ≈ 3.8:1 ✗, so the dark side flips to ink —
// #2A0A10 on #F5394F ≈ 4.9:1 ✓. (Spec said '#FFFFFF'; flipped per house
// contrast rule, math above.)
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #2A0A10)';
// Text over a --color-brand fill (brand count badge). Light: #FFFFFF on
// #4759E4 ≈ 5.5:1 ✓. Dark: white on #A3AFFA fails (~1.9:1), so ink —
// #14194B on #A3AFFA ≈ 7.4:1 ✓.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #14194B)';
// Scrim per the mobile foundations (sheetScrim AND alertScrim colors).
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the visually-hidden
// heading class, the indeterminate sweep, and the reduced-motion guard
// (transitions animate transform/opacity/color only; the sweep is REMOVED
// entirely under reduced motion — the static 40% segment still encodes
// 'loading').
// ---------------------------------------------------------------------------

const OVG_CSS = `
.ovg-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.ovg-btn:disabled { cursor: default; }
.ovg-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.ovg-anim { transition: transform 200ms ease, opacity 200ms ease; }
.ovg-fade { transition: opacity 200ms ease; }
.ovg-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@keyframes ovg-sweep {
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
}
.ovg-sweep { animation: ovg-sweep 1.4s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .ovg-anim, .ovg-fade { transition: none; }
  /* Sweep removed entirely; the segment freezes centered via the inline
     reduced-motion left offset. Static color still encodes the state. */
  .ovg-sweep { animation: none; transform: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries
  // cannot tell the stages apart).
  wrap: {width: '100%'},
  // Desktop ≥720px container: muted canvas, centered 390px phone column.
  wrapDesktop: {
    background: 'var(--color-background-muted)',
    paddingBlock: 48,
  },
  // THE SHELL CONTRACT (mobile foundations, verbatim) + the template-local
  // token mints. style.colorScheme is driven by state (theme toggle).
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
    ...TEMPLATE_TOKENS,
  },
  shellDesktop: {
    maxWidth: 390,
    marginInline: 'auto',
    border: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, three-zone grid, paddingInline 8 so the
  // 44px toggle optically aligns to the 16px gutter. Hairline + blur
  // ALWAYS ON (no scroll-under wiring; noted per contract).
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
    color: 'var(--color-brand)',
    fontSize: 14,
    fontWeight: 800,
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // CONTENT — the page scrolls (no inner scroller); 96px bottom padding
  // clears the sticky dock + one toast + 24px air.
  content: {flex: 1, padding: '16px 16px 96px'},
  // GallerySectionHeader — sticky top 52 (below the navBar), z15, same
  // blur surface; full-bleed via negative gutter margins.
  sectionHeader: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    marginInline: -16,
    marginBottom: 12,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  section: {marginBottom: 24},
  // SpecimenFrame — 1px dashed, radius 12, padding 16; frames stack 12px
  // apart within a section.
  frame: {
    border: '1px dashed var(--color-border)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  frameLabel: {
    margin: '0 0 12px',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: 'var(--color-text-secondary)',
  },
  // SpecimenStage — clipped relative mini stage that frozen absolute
  // overlays anchor to; bleeds to the dashed border so the stage is as
  // wide as the frame allows (324px at a 390 shell).
  stage: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-body)',
    marginBottom: 12,
  },
  frozen: {pointerEvents: 'none'},
  // AnnotationList — 11px/500 secondary bullet rows, 8px rhythm. Real
  // text, never aria-hidden.
  annotationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  annotationRow: {
    display: 'flex',
    gap: 6,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  annotationBullet: {flexShrink: 0, color: 'var(--color-brand)'},
  rejectTag: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: 'var(--color-error)',
    border: '1px solid color-mix(in srgb, var(--color-error) 40%, transparent)',
    borderRadius: 6,
    padding: '2px 6px',
    whiteSpace: 'nowrap',
  },
  // ------------------------------- S1 · ACTION SHEET (frozen) -----------
  sheetScrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
  actionSheet: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  actionSheetCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  actionSheetHeader: {
    padding: '14px 16px',
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.45,
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
    borderBottom: '1px solid var(--color-border)',
  },
  actionSheetRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingInline: 16,
  },
  actionSheetRowDestructive: {color: 'var(--color-error)'},
  actionSheetCancelRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  fullDivider: {height: 1, background: 'var(--color-border)'},
  // Decision-table rows — stacked (when above, verdict below) so long
  // verdicts wrap instead of colliding with the condition.
  decisionRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    fontSize: 13,
    lineHeight: 1.5,
    paddingBlock: 8,
  },
  decisionWhen: {color: 'var(--color-text-secondary)'},
  decisionThen: {fontWeight: 600, color: 'var(--color-text-primary)'},
  rejectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    flexWrap: 'wrap',
  },
  rejectNote: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
  },
  // ------------------------------- S2 · ANCHORED MENU (live) ------------
  triggerRow: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    borderBottom: '1px solid var(--color-border)',
  },
  triggerRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    touchAction: 'pan-y',
  },
  triggerAvatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
    color: 'var(--color-brand)',
    fontSize: 13,
    fontWeight: 700,
  },
  triggerText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  triggerPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  triggerSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  triggerDeleted: {opacity: 0.4},
  deletedPill: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    color: 'var(--color-error)',
    border: '1px solid color-mix(in srgb, var(--color-error) 40%, transparent)',
    borderRadius: 999,
    padding: '2px 8px',
    flexShrink: 0,
    marginInlineEnd: 8,
  },
  // In-stage scrim under the live menu (z40) — the menu occupies the sheet
  // layer (z41); never-stack-sheets applies to it.
  menuScrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
  anchoredMenu: {
    position: 'absolute',
    top: 68,
    right: 16,
    zIndex: 41,
    width: 236,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  menuRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
    fontWeight: 400,
  },
  menuRowLabel: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  menuRowIcon: {flexShrink: 0, display: 'inline-flex', color: 'var(--color-text-secondary)'},
  menuRowDestructive: {color: 'var(--color-error)'},
  // In-stage hint under the trigger row — the visible affordance the
  // gesture law requires (and it keeps the closed stage from reading
  // starved in screenshots). The open menu covers it (top 68 < hint top).
  stageHint: {
    padding: '12px 16px',
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
  },
  focusReadout: {
    display: 'flex',
    gap: 6,
    alignItems: 'baseline',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
  },
  focusReadoutValue: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--color-text-primary)',
  },
  // ------------------------------- S3 · UNDO / TOASTS -------------------
  listCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  threadRow: {display: 'flex', alignItems: 'center'},
  threadRowMain: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInlineStart: 16,
  },
  threadName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  threadPreview: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  emptyCaption: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    paddingInline: 16,
    textAlign: 'center',
  },
  // Toast anatomy — shared by the frozen trio AND the real dock toast:
  // min-height 48, card bg, 1px border, radius 12, shadow, paddingInline
  // 16; message 13/500 ellipsized · 1×16 hairline · Undo 13/600 brand.
  toast: {
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastMsg: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndoBtn: {
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-brand)',
    flexShrink: 0,
  },
  toastStack: {display: 'flex', flexDirection: 'column', gap: 12},
  // Stacking-rule reject: two toasts overlapped by design.
  stackedPair: {position: 'relative', height: 76, marginBottom: 8},
  stackedToastBack: {position: 'absolute', insetInline: 12, top: 0, opacity: 0.85},
  stackedToastFront: {position: 'absolute', insetInline: 0, top: 24},
  // ------------------------------- S4 · ALERT (frozen) ------------------
  alertScrim: {position: 'absolute', inset: 0, zIndex: 60, background: SCRIM},
  alert: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(280px, calc(100% - 64px))',
    zIndex: 61,
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  alertBody: {padding: 20, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center'},
  alertTitle: {fontSize: 17, fontWeight: 600, lineHeight: 1.3, margin: 0},
  alertText: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.45,
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  alertButtons: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtn: {
    flex: 1,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 400,
    color: 'var(--color-text-primary)',
  },
  alertBtnCommit: {fontWeight: 600, color: 'var(--color-error)'},
  alertVertHairline: {width: 1, background: 'var(--color-border)'},
  // ------------------------------- S5 · BANNERS -------------------------
  // Segmented severity control — 32px visual track (radius 10, thumb 8);
  // each segment's REAL hit is 44px tall via negative-margin padding.
  segTrack: {
    display: 'flex',
    height: 32,
    padding: 2,
    borderRadius: 10,
    background: 'var(--color-background-muted)',
    marginBottom: 12,
  },
  segBtn: {
    flex: 1,
    position: 'relative',
    height: 44,
    marginBlock: -8,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    zIndex: 1,
  },
  segBtnActive: {color: 'var(--color-text-primary)'},
  segThumb: {
    position: 'absolute',
    insetInline: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: 28,
    borderRadius: 8,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    zIndex: -1,
  },
  segLabel: {position: 'relative'},
  bannerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
    padding: '12px 16px',
    borderRadius: 12,
    marginBottom: 12,
  },
  bannerIcon: {flexShrink: 0, display: 'inline-flex'},
  bannerText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.45,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  bannerDismissHit: {
    width: 44,
    height: 44,
    marginBlock: -10,
    marginInlineEnd: -12,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  // ------------------------------- S6 · BADGES --------------------------
  badgeRow: {display: 'flex', alignItems: 'center', gap: 24, marginBottom: 12, flexWrap: 'wrap'},
  badgeGlyphSeat: {
    position: 'relative',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    paddingInline: 5,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    background: 'var(--color-error)',
    color: ERROR_FILL_TEXT,
  },
  countBadgeBrand: {background: 'var(--color-brand)', color: BRAND_FILL_TEXT},
  dotBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 999,
    background: 'var(--color-error)',
  },
  pillRow: {display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'},
  statusPill: {
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 999,
    paddingInline: 8,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  // ------------------------------- S7 · PROGRESS ------------------------
  progressRow: {display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12},
  ringWrap: {position: 'relative', width: 48, height: 48, flexShrink: 0},
  ringLabel: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  barTrack: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    background: 'var(--color-brand)',
    transition: 'width 200ms ease',
  },
  pctReadout: {
    width: 44,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  progressBtnRow: {display: 'flex', gap: 8, marginBottom: 12},
  // 36px visual secondary button inside a 44px hit-area button.
  demoBtnHit: {height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  demoBtnFace: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  demoBtnDisabled: {opacity: 0.4, color: 'var(--color-text-secondary)'},
  indeterminateTrack: {
    height: 4,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  indeterminateSegment: {
    width: '40%',
    height: '100%',
    borderRadius: 999,
    background: 'var(--color-brand)',
  },
  // ------------------------------- S8 · SCRIM LADDER --------------------
  ladder: {display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12},
  ladderPlate: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 10,
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  ladderZ: {
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-brand)',
    flexShrink: 0,
    width: 28,
  },
  ladderName: {overflow: 'hidden', textOverflow: 'ellipsis'},
  // ------------------------------- S9 · FOCUS RESTORE -------------------
  matrixRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'baseline',
    paddingBlock: 8,
    fontSize: 13,
    lineHeight: 1.45,
  },
  matrixSubject: {fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0},
  matrixRule: {flex: 1, minWidth: 0, color: 'var(--color-text-secondary)'},
  // ------------------------------- TOAST DOCK (real) --------------------
  // Sticky-in-flow per the batch-1 amendment (the shell scrolls; absolute
  // bottom would pin to the document bottom). insetInline 16 via padding;
  // z30 — BELOW sheetScrim z40: a toast never floats over a sheet.
  toastDock: {
    position: 'sticky',
    bottom: 16,
    zIndex: 30,
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toastLive: {pointerEvents: 'auto'},
};
// ---------------------------------------------------------------------------
// FIXTURES — deterministic consts; no Math.random, no Date.now, no timers.
// ---------------------------------------------------------------------------

// S1 · Action sheet. The context header is the two-line stress; the third
// option is the longest-row stress ('Move to Saved Recordings' single-lines
// at 17px/500 inside the option card; ellipsis guard on the row anyway);
// the destructive verb is LAST, per contract.
const SHEET_FIXTURE = {
  header:
    'This conversation and its 47 attachments will be removed from Inbox and all synced devices',
  options: [
    {id: 'opt-reply', label: 'Reply', destructive: false},
    {id: 'opt-forward', label: 'Forward', destructive: false},
    {id: 'opt-move', label: 'Move to Saved Recordings', destructive: false},
    {id: 'opt-remove', label: 'Remove from Inbox', destructive: true},
  ],
} as const;

// S1 · Decision table (memorized from the primitive contract).
const DECISION_TABLE = [
  {id: 'dt-sheet', when: 'Content, forms, or anything that scrolls', then: 'bottom sheet (55% / calc(100% − 56px) detents)'},
  {id: 'dt-alert', when: 'A blocking, irreversible choice that must interrupt', then: 'centered alert (z61)'},
  {id: 'dt-verbs', when: 'A flat list of 2–5 mutually exclusive verbs', then: 'actionSheet'},
] as const;

// S2 · Anchored menu. The highlight title doubles as the FocusReadout
// accessible-name stress; 'Copy Link to Highlight' is the 236px-card
// ellipsis stress (text ellipsizes before touching the trailing icon).
const HIGHLIGHT = {
  title: 'Quarterly retrospective: recording + transcript',
  preview: 'Saved from Wed standup · 12 min clip',
  initials: 'QR',
} as const;

const MENU_ITEMS = [
  {id: 'mi-copy', label: 'Copy Link to Highlight', icon: LinkIcon, destructive: false},
  {id: 'mi-pin', label: 'Pin', icon: PinIcon, destructive: false},
  {id: 'mi-share', label: 'Share', icon: ShareIcon, destructive: false},
  {id: 'mi-delete', label: 'Delete Highlight', icon: Trash2Icon, destructive: true},
] as const;

// S3 · Archive demo. Order is identity — Undo restores by id into the
// original index (rows render from this const, filtered by archivedIds).
// thr_02's name is the toast-message truncation stress.
const DEMO_THREADS = [
  {id: 'thr_01', name: 'Priya Natarajan', preview: 'Re: launch checklist — two open items'},
  {id: 'thr_02', name: 'Margarethe Vandenbroucke-Ashworth', preview: 'Board pre-read, v3 attached'},
  {id: 'thr_03', name: 'Dana Reyes', preview: 'Standup notes · action items inside'},
] as const;

const TOAST_STRINGS = {
  undo: 'Conversation archived',
  restored: 'Restored',
  copied: 'Link copied',
  loaded: '20 more loaded',
  highlightDeleted: 'Highlight deleted',
} as const;

// S5 · Banners. Severity keys the icon, the color-mix tint, and the copy;
// the warning copy is the two-line clamp stress.
type Severity = 'info' | 'success' | 'warning' | 'error';

const SEVERITIES: Severity[] = ['info', 'success', 'warning', 'error'];

const BANNER_COPY: Record<Severity, string> = {
  info: 'Syncing paused on cellular.',
  success: 'Backup complete.',
  warning: 'Storage 90% full — older originals will stop syncing until space is freed.',
  error: 'Upload failed — 2 items.',
};

const SEVERITY_ICON = {
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  error: CircleAlertIcon,
} as const;

// Severity color token per kind — brand-adjacent info uses the brand mint.
const SEVERITY_VAR: Record<Severity, string> = {
  info: 'var(--color-brand)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

// S6 · Badges. 127 proves the '99+' cap; 3 and 12 side by side prove
// minWidth 18 keeps single digits round while double digits stretch.
const BADGE_FIXTURE = [
  {id: 'bdg-bell', icon: BellIcon, count: 3},
  {id: 'bdg-mail', icon: MailIcon, count: 12},
  {id: 'bdg-msg', icon: MessageSquareIcon, count: 127},
] as const;

const STATUS_PILLS: Array<{id: string; label: string; severity: Severity}> = [
  {id: 'pill-synced', label: 'Synced', severity: 'success'},
  {id: 'pill-pending', label: 'Pending', severity: 'warning'},
  {id: 'pill-failed', label: 'Failed', severity: 'error'},
];

// S7 · Progress.
const PCT_START = 40;
const PCT_STEP = 20;

// S8 · The ten-rung z ladder, bottom-up.
const LAYERS = [
  {id: 'z0', z: '0', name: 'content'},
  {id: 'z10', z: '10', name: 'indexScrubber rail'},
  {id: 'z15', z: '15', name: 'sticky sectionHeaders'},
  {id: 'z20', z: '20', name: 'sticky chrome — navBar / tabBar / editToolbar'},
  {id: 'z30', z: '30', name: 'toastDock'},
  {id: 'z40', z: '40', name: 'sheetScrim'},
  {id: 'z41', z: '41', name: 'sheet / actionSheet / anchored menu'},
  {id: 'z50', z: '50', name: 'fullscreen cover (cited, not specimen’d)'},
  {id: 'z60', z: '60', name: 'alertScrim — above covers'},
  {id: 'z61', z: '61', name: 'alert'},
] as const;

// S9 · Focus-restore matrix.
const RESTORE_MATRIX = [
  {id: 'rm-sheet', subject: 'action sheet', rule: 'focus → Cancel row on open (destructive is never first focus); restores to the opener on EVERY close path — row chosen, Cancel, scrim, Escape'},
  {id: 'rm-alert', subject: 'alert', rule: 'first focus on the cancel verb; Escape cancels; scrim click does NOT dismiss; restores to the opener'},
  {id: 'rm-menu', subject: 'anchored menu', rule: 'first menu row on open; Escape / scrim / selection close; restores to the 44×44 trigger'},
  {id: 'rm-toast', subject: 'toasts', rule: 'NEVER steal focus — the dock is aria-live polite; the Undo button is Tab-reachable, not auto-focused'},
] as const;

// ---------------------------------------------------------------------------
// ONE STATE OWNER — flat gallery state + one update(patch). Frozen
// specimens hold ZERO state; only the cheap live demos write here.
// ---------------------------------------------------------------------------

interface GalleryToast {
  seq: number;
  msg: string;
  // 'undo' renders the Undo button; undoes names the restoring assignment.
  kind: 'undo' | 'confirm' | 'count';
  undoes: 'archive' | 'highlight' | null;
}

interface GalleryState {
  scheme: 'inherit' | 'light' | 'dark';
  bannerKind: Severity;
  menuOpen: boolean;
  highlightDeleted: boolean;
  // Spec sketched `archivedId: null|string`; an array is required so the
  // one-toast law is honest — archiving B while A's toast is up REPLACES
  // the toast (A's undo window ends) without resurrecting A. Undo pops the
  // most recent id only. Noted as a deviation.
  archivedIds: string[];
  toast: GalleryToast | null;
  pct: number;
  focusNote: string;
}

const INITIAL_STATE: GalleryState = {
  scheme: 'inherit',
  bannerKind: 'info',
  menuOpen: false,
  highlightDeleted: false,
  archivedIds: [],
  toast: null,
  pct: PCT_START,
  focusNote: '—',
};

function useGalleryState() {
  const [state, setState] = useState<GalleryState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<GalleryState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);
  return {state, update, setState};
}

/**
 * Container-width hook (grid-feeder-console pattern): only a
 * ResizeObserver on the wrapper can tell the 390px mobile stage from the
 * ~1045px desktop stage inside the same 1440px window.
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

// ---------------------------------------------------------------------------
// GALLERY FURNITURE — SpecimenFrame, SpecimenStage, AnnotationList,
// RejectTag, FocusReadout, GallerySectionHeader.
// ---------------------------------------------------------------------------

/** Labeled dashed frame; the 11px/600 uppercase label is a real h3. */
function SpecimenFrame({label, children}: {label: string; children: ReactNode}) {
  return (
    <section style={styles.frame}>
      <h3 style={styles.frameLabel}>{label}</h3>
      {children}
    </section>
  );
}

/**
 * Clipped relative mini stage. Frozen compositions inside are PICTURES:
 * pointerEvents none + aria-hidden, and they carry no dialog roles — a
 * static composition must never announce as a real modal. Live stages
 * (S2) pass isFrozen={false}.
 */
function SpecimenStage({height, isFrozen = true, children}: {height: number; isFrozen?: boolean; children: ReactNode}) {
  return (
    <div
      style={{...styles.stage, height, ...(isFrozen ? styles.frozen : null)}}
      aria-hidden={isFrozen || undefined}>
      {children}
    </div>
  );
}

/** 11px/500 secondary callouts citing exact px anatomy. Real text. */
function AnnotationList({items}: {items: string[]}) {
  return (
    <ul style={styles.annotationList}>
      {items.map(item => (
        <li key={item} style={styles.annotationRow}>
          <span style={styles.annotationBullet} aria-hidden>
            ·
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function RejectTag({label}: {label: string}) {
  return <span style={styles.rejectTag}>{label}</span>;
}

/** Echoes the accessible name of the last focus-restore target. */
function FocusReadout({note}: {note: string}) {
  return (
    <p style={styles.focusReadout}>
      <span>focus →</span>
      <span style={styles.focusReadoutValue}>{note}</span>
    </p>
  );
}

function GallerySectionHeader({children}: {children: ReactNode}) {
  return <h2 style={styles.sectionHeader}>{children}</h2>;
}

// ---------------------------------------------------------------------------
// S1 · ACTION SHEET — frozen open composition + the decision table.
// ---------------------------------------------------------------------------

function ActionSheetSpecimen() {
  return (
    <>
      <SpecimenFrame label="Action sheet — open, frozen">
        {/* 420: two-line context header + four 56px rows + Cancel card +
            bottom 16 ≈ 374, plus scrim air above card one. */}
        <SpecimenStage height={420}>
          <div style={styles.sheetScrim} />
          <div style={styles.actionSheet}>
            <div style={styles.actionSheetCard}>
              <div style={styles.actionSheetHeader}>{SHEET_FIXTURE.header}</div>
              {SHEET_FIXTURE.options.map((option, index) => (
                <div key={option.id}>
                  {index > 0 ? <div style={styles.fullDivider} /> : null}
                  <div
                    style={{
                      ...styles.actionSheetRow,
                      ...(option.destructive ? styles.actionSheetRowDestructive : null),
                    }}>
                    {option.label}
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.actionSheetCard}>
              <div style={styles.actionSheetCancelRow}>Cancel</div>
            </div>
          </div>
        </SpecimenStage>
        <AnnotationList
          items={[
            'sheetScrim — absolute inset 0, light-dark(rgba(21,17,12,0.32), rgba(0,0,0,0.55)), z40; actionSheet — absolute insetInline 16, bottom 16, z41 (the sheet layer: never stack it)',
            'card one — card bg, radius 16, shadow 0 −8px 32px; context header 13/400 secondary, centered, padding 14px 16px, hairline below (two-line stress shown)',
            'actionSheetRows — 56px real <button>s, 17/500 centered, full-width 1px hairlines; centered-no-icons variant (leading-icons is the other legal variant — never mix)',
            'destructive row — text (and any icon) in --color-error, always LAST; never first focus',
            'card two — its own card, 8px below: one 56px Cancel row 17/600 — the panic-safe bottom-of-screen tap',
            'behavior — any row closes; Cancel / scrim / Escape close with no action; role dialog, aria-modal, first focus on Cancel, focus restores to the opener (frozen here: composition only, no dialog roles)',
          ]}
        />
      </SpecimenFrame>
      <SpecimenFrame label="Decision table">
        {DECISION_TABLE.map((row, index) => (
          <div key={row.id}>
            {index > 0 ? <div style={styles.fullDivider} /> : null}
            <div style={styles.decisionRow}>
              <span style={styles.decisionWhen}>{row.when}</span>
              <span style={styles.decisionThen}>→ {row.then}</span>
            </div>
          </div>
        ))}
        <div style={styles.fullDivider} />
        <div style={styles.rejectRow}>
          <RejectTag label="Reject — 6+ verbs" />
          <span style={styles.rejectNote}>promote to a medium-detent sheet with 44px menu rows</span>
        </div>
        <div style={{...styles.rejectRow, paddingTop: 8}}>
          <RejectTag label="Reject — confirm for undoable" />
          <span style={styles.rejectNote}>reversible actions execute + Undo (S3); they never ask first</span>
        </div>
      </SpecimenFrame>
    </>
  );
}

// ---------------------------------------------------------------------------
// S2 · ANCHORED MENU — LIVE: 44×44 ellipsis trigger (the mandatory button
// path), long-press garnish (450 ms, cancelled on 8px movement), focus
// trap, and restore-to-trigger on every close path.
// ---------------------------------------------------------------------------

interface AnchoredMenuDemoProps {
  isOpen: boolean;
  isDeleted: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  focusNote: string;
  onOpen: () => void;
  onClose: () => void;
  onDelete: () => void;
  onAction: (label: string) => void;
}

function AnchoredMenuDemo({
  isOpen,
  isDeleted,
  menuRef,
  triggerRef,
  focusNote,
  onOpen,
  onClose,
  onDelete,
  onAction,
}: AnchoredMenuDemoProps) {
  // Long-press garnish — transient refs only; the 450 ms timer is the one
  // sanctioned timer in the file (gesture vocabulary), cancelled on 8px
  // movement or release.
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressOriginRef = useRef({x: 0, y: 0});
  const clearPress = () => {
    if (pressTimerRef.current != null) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };
  const onRowPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pressOriginRef.current = {x: event.clientX, y: event.clientY};
    clearPress();
    pressTimerRef.current = setTimeout(onOpen, 450);
  };
  const onRowPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dx = event.clientX - pressOriginRef.current.x;
    const dy = event.clientY - pressOriginRef.current.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) clearPress();
  };
  useEffect(() => clearPress, []);

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const container = menuRef.current;
    if (container == null) return;
    const items = Array.from(container.querySelectorAll<HTMLElement>('button'));
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
      items[(next + items.length) % items.length]?.focus();
    } else if (event.key === 'Tab') {
      // Trap: cycle within the four rows.
      event.preventDefault();
      const next = event.shiftKey ? index - 1 : index + 1;
      items[(next + items.length) % items.length]?.focus();
    }
  };

  return (
    <SpecimenFrame label="Long-press menu — live">
      <SpecimenStage height={280} isFrozen={false}>
        <div
          style={styles.triggerRow}
          onPointerDown={onRowPointerDown}
          onPointerMove={onRowPointerMove}
          onPointerUp={clearPress}
          onPointerLeave={clearPress}>
          <div style={{...styles.triggerRowBtn, ...(isDeleted ? styles.triggerDeleted : null)}}>
            <span style={styles.triggerAvatar} aria-hidden>
              {HIGHLIGHT.initials}
            </span>
            <span style={styles.triggerText}>
              <span style={styles.triggerPrimary}>{HIGHLIGHT.title}</span>
              <span style={styles.triggerSecondary}>{HIGHLIGHT.preview}</span>
            </span>
          </div>
          {isDeleted ? <span style={styles.deletedPill}>Deleted</span> : null}
          <button
            type="button"
            ref={triggerRef}
            className="ovg-btn ovg-focusable"
            style={styles.iconBtn}
            aria-label={`More for “${HIGHLIGHT.title}”`}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            onClick={() => (isOpen ? onClose() : onOpen())}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
        <p style={styles.stageHint}>
          Tap the ⋯ button (or long-press the row) to open the menu. Escape, the scrim, or any row
          closes it — and focus lands back on ⋯ every time.
        </p>
        {isOpen ? (
          <>
            <div style={styles.menuScrim} onClick={onClose} aria-hidden />
            <div
              ref={menuRef}
              role="menu"
              aria-label={`Actions for ${HIGHLIGHT.title}`}
              style={styles.anchoredMenu}
              onKeyDown={onMenuKeyDown}>
              {MENU_ITEMS.map((item, index) => (
                <div key={item.id}>
                  {index > 0 ? <div style={styles.fullDivider} /> : null}
                  <button
                    type="button"
                    role="menuitem"
                    className="ovg-btn ovg-focusable"
                    style={{...styles.menuRow, ...(item.destructive ? styles.menuRowDestructive : null)}}
                    aria-label={item.destructive ? `${item.label} — deletes the highlight` : item.label}
                    onClick={() => (item.destructive ? onDelete() : onAction(item.label))}>
                    <span style={styles.menuRowLabel}>{item.label}</span>
                    <span
                      style={{
                        ...styles.menuRowIcon,
                        ...(item.destructive ? styles.menuRowDestructive : null),
                      }}
                      aria-hidden>
                      <Icon icon={item.icon} size="md" color="inherit" />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </SpecimenStage>
      <FocusReadout note={focusNote} />
      <AnnotationList
        items={[
          'trigger — 60px row; the 44×44 ellipsis button IS the contract (long-press on the row is garnish: 450 ms, cancelled on 8px movement, never the only path)',
          'menu — 8px below the row, width 236, card bg, radius 12, 1px border, shadow 0 8px 32px, z41 over an in-stage z40 scrim; four 44px rows, 16/400 label + trailing 20px icon, hairlines; Delete Highlight LAST in --color-error',
          'focus — first row on open; Tab/arrows cycle trapped; Escape / scrim / selection close; every path restores the trigger (the readout above narrates it); Delete posts an undo toast to the dock below',
        ]}
      />
    </SpecimenFrame>
  );
}

// ---------------------------------------------------------------------------
// S3 · UNDO OVER CONFIRM — live archive rows + frozen toast anatomy.
// ---------------------------------------------------------------------------

interface ArchiveUndoDemoProps {
  archivedIds: string[];
  onArchive: (id: string) => void;
}

function ArchiveUndoDemo({archivedIds, onArchive}: ArchiveUndoDemoProps) {
  const visible = DEMO_THREADS.filter(thread => !archivedIds.includes(thread.id));
  return (
    <SpecimenFrame label="Undo over confirm — live">
      <div style={styles.listCard}>
        {visible.length === 0 ? (
          <div style={styles.emptyCaption}>All conversations archived — Undo restores the most recent</div>
        ) : (
          visible.map((thread, index) => (
            <div key={thread.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <div style={styles.threadRow}>
                <div style={styles.threadRowMain}>
                  <span style={styles.threadName}>{thread.name}</span>
                  <span style={styles.threadPreview}>{thread.preview}</span>
                </div>
                <button
                  type="button"
                  className="ovg-btn ovg-focusable"
                  style={styles.iconBtn}
                  aria-label={`Archive conversation with ${thread.name}`}
                  onClick={() => onArchive(thread.id)}>
                  <Icon icon={ArchiveIcon} size="md" color="inherit" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <AnnotationList
        items={[
          'reversible = restorable in ONE assignment (archive, mute, move, mark read…): execute IMMEDIATELY + Undo — “Are you sure?” here is a reject',
          'Archive posts the undo toast to the gallery’s REAL dock below; Undo returns the row to its exact original index and the toast reads “Restored”',
          'archiving another row while a toast is up REPLACES it — the live proof of the one-toast law (the older undo window simply ends)',
        ]}
      />
    </SpecimenFrame>
  );
}

/** Frozen toast trio + the stacking-rule reject. Pictures, aria-hidden. */
function ToastSpecimen() {
  return (
    <>
      <SpecimenFrame label="Toast anatomy — frozen trio">
        <div style={{...styles.toastStack, marginBottom: 12, ...styles.frozen}} aria-hidden>
          <div style={styles.toast}>
            <span style={styles.toastMsg}>{TOAST_STRINGS.undo}</span>
            <span style={styles.toastHairline} />
            <span style={styles.toastUndoBtn}>Undo</span>
          </div>
          <div style={styles.toast}>
            <span style={styles.toastMsg}>{TOAST_STRINGS.restored}</span>
          </div>
          <div style={styles.toast}>
            <span style={styles.toastMsg}>{TOAST_STRINGS.loaded}</span>
          </div>
        </div>
        <AnnotationList
          items={[
            'shared anatomy — min-height 48, card bg, 1px border, radius 12, shadow 0 4px 16px, paddingInline 16',
            'undo toast — message 13/500 ellipsized · 1×16px hairline · Undo real <button> 13/600 --color-brand, full 48px hit, min-width 44 (message compresses; hairline + Undo never do)',
            'confirmation (“Restored”) and count (“20 more loaded”) toasts drop the button; counts stay tabular-nums',
          ]}
        />
      </SpecimenFrame>
      <SpecimenFrame label="Stacking rule">
        <div style={{...styles.stackedPair, ...styles.frozen}} aria-hidden>
          <div style={{...styles.toast, ...styles.stackedToastBack}}>
            <span style={styles.toastMsg}>{TOAST_STRINGS.undo}</span>
            <span style={styles.toastHairline} />
            <span style={styles.toastUndoBtn}>Undo</span>
          </div>
          <div style={{...styles.toast, ...styles.stackedToastFront}}>
            <span style={styles.toastMsg}>{TOAST_STRINGS.loaded}</span>
          </div>
        </div>
        <div style={{...styles.rejectRow, paddingBottom: 8}}>
          <RejectTag label="Reject — stacked toasts" />
          <span style={styles.rejectNote}>one toast; a new mutation replaces the old (its undo window ends)</span>
        </div>
        <div style={{...styles.frozen, marginBottom: 8}} aria-hidden>
          <div style={styles.toast}>
            <span style={styles.toastMsg}>{TOAST_STRINGS.undo}</span>
            <span style={styles.toastHairline} />
            <span style={styles.toastUndoBtn}>Undo</span>
          </div>
        </div>
        <AnnotationList
          items={[
            'NO auto-dismiss timers — deterministic fixtures forbid racing the reader; the toast persists until Undo, replacement, or the screen changes',
          ]}
        />
      </SpecimenFrame>
    </>
  );
}

// ---------------------------------------------------------------------------
// S4 · CENTERED ALERT — frozen. Reserved for blocking irreversible
// choices; anything undoable is a reject here.
// ---------------------------------------------------------------------------

function AlertSpecimen() {
  return (
    <SpecimenFrame label="Alert — frozen">
      <SpecimenStage height={240}>
        <div style={styles.alertScrim} />
        <div style={styles.alert}>
          <div style={styles.alertBody}>
            <p style={styles.alertTitle}>Delete 24 recordings permanently?</p>
            <p style={styles.alertText}>This can’t be undone.</p>
          </div>
          <div style={styles.alertButtons}>
            <div style={styles.alertBtn}>Cancel</div>
            <div style={styles.alertVertHairline} />
            <div style={{...styles.alertBtn, ...styles.alertBtnCommit}}>Delete</div>
          </div>
        </div>
      </SpecimenStage>
      <AnnotationList
        items={[
          'alertScrim — z60, same colors as sheetScrim, ABOVE covers (z50); alert — top 50% / left 50%, translate(−50%,−50%), width min(280px, calc(100% − 64px)), z61, radius 16, shadow 0 8px 32px',
          '20px padding block — title 17/600 centered (two-line wrap stress shown), 8px gap, body 13/400 secondary, max two lines stating the consequence',
          'button row below a full-width hairline — exactly two 44px flex:1 <button>s split by a vertical hairline: cancel verb left 17/400, committing verb right 17/600 in --color-error when destructive',
          'VERBS, never “OK” · scrim click does NOT dismiss · Escape cancels · first focus = Cancel · role alertdialog + aria-labelledby/-describedby (frozen here: composition only)',
          'reserved for blocking irreversible choices — permanent deletion, discarding a draft, signing out; anything undoable routes through S3 instead',
        ]}
      />
    </SpecimenFrame>
  );
}
// ---------------------------------------------------------------------------
// S5 · BANNERS — live severity switcher (radiogroup, arrow keys) driving
// one BannerRow; two frozen variants below.
// ---------------------------------------------------------------------------

function SeveritySegmented({value, onChange}: {value: Severity; onChange: (kind: Severity) => void}) {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = SEVERITIES.indexOf(value);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = SEVERITIES[(index + delta + SEVERITIES.length) % SEVERITIES.length];
    onChange(next);
    groupRef.current
      ?.querySelectorAll<HTMLElement>('button')
      [SEVERITIES.indexOf(next)]?.focus();
  };
  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Banner severity"
      style={styles.segTrack}
      onKeyDown={onKeyDown}>
      {SEVERITIES.map(kind => {
        const isActive = kind === value;
        return (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            className="ovg-btn ovg-focusable"
            style={{...styles.segBtn, ...(isActive ? styles.segBtnActive : null)}}
            onClick={() => onChange(kind)}>
            {isActive ? <span style={styles.segThumb} className="ovg-fade" aria-hidden /> : null}
            <span style={styles.segLabel}>{kind.charAt(0).toUpperCase() + kind.slice(1)}</span>
          </button>
        );
      })}
    </div>
  );
}

function BannerRow({kind, copy, hasDismiss = false}: {kind: Severity; copy: string; hasDismiss?: boolean}) {
  const colorVar = SEVERITY_VAR[kind];
  const IconGlyph = SEVERITY_ICON[kind];
  return (
    <div
      style={{
        ...styles.bannerRow,
        background: `color-mix(in srgb, ${colorVar} 12%, var(--color-background-card))`,
        border: `1px solid color-mix(in srgb, ${colorVar} 24%, transparent)`,
      }}>
      <span style={{...styles.bannerIcon, color: colorVar}} aria-hidden>
        <Icon icon={IconGlyph} size="md" color="inherit" />
      </span>
      <span style={styles.bannerText}>{copy}</span>
      {hasDismiss ? (
        <span style={styles.bannerDismissHit}>
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
      ) : null}
    </div>
  );
}

function BannerSection({kind, onChange}: {kind: Severity; onChange: (next: Severity) => void}) {
  return (
    <SpecimenFrame label="Banner — live severity switch">
      <SeveritySegmented value={kind} onChange={onChange} />
      <BannerRow kind={kind} copy={BANNER_COPY[kind]} />
      <AnnotationList
        items={[
          'segmented control — 32px visual track (radius 10, thumb radius 8, 13/600 labels); each segment’s REAL hit is 44px tall; radiogroup with arrow-key roving',
          'bannerRow — radius 12, min-height 44, padding 12px 16px; 20px severity icon + 12px gap + 13/500 text clamped at two lines; bg color-mix(severity 12%, card), border color-mix 24%',
        ]}
      />
      <div style={styles.frozen} aria-hidden>
        <BannerRow kind="info" copy={BANNER_COPY.info} />
        <BannerRow kind="warning" copy={BANNER_COPY.warning} hasDismiss />
      </div>
      <AnnotationList
        items={[
          'frozen variants — persistent (no dismiss) and dismissible: trailing 16px X glyph inside a 44×44 hit that stays square at the two-line clamp (warning copy is the stress)',
        ]}
      />
    </SpecimenFrame>
  );
}

// ---------------------------------------------------------------------------
// S6 · BADGES — frozen cluster: countBadge caps, dotBadge, statusPills,
// brand count variant.
// ---------------------------------------------------------------------------

function badgeLabel(count: number): string {
  return count > 99 ? '99+' : String(count);
}

function BadgeCluster() {
  return (
    <SpecimenFrame label="Badges — frozen">
      <div style={{...styles.badgeRow, ...styles.frozen}} aria-hidden>
        {BADGE_FIXTURE.map(seat => {
          const SeatIcon = seat.icon;
          return (
            <span key={seat.id} style={styles.badgeGlyphSeat}>
              <SeatIcon size={28} strokeWidth={1.75} aria-hidden />
              <span style={styles.countBadge}>{badgeLabel(seat.count)}</span>
            </span>
          );
        })}
        <span style={styles.badgeGlyphSeat}>
          <BellIcon size={28} strokeWidth={1.75} aria-hidden />
          <span style={styles.dotBadge} />
        </span>
        <span style={styles.badgeGlyphSeat}>
          <MessageSquareIcon size={28} strokeWidth={1.75} aria-hidden />
          <span style={{...styles.countBadge, ...styles.countBadgeBrand}}>12</span>
        </span>
      </div>
      <div style={{...styles.pillRow, marginBottom: 12, ...styles.frozen}} aria-hidden>
        {STATUS_PILLS.map(pill => {
          const colorVar = SEVERITY_VAR[pill.severity];
          return (
            <span
              key={pill.id}
              style={{
                ...styles.statusPill,
                color: colorVar,
                background: `color-mix(in srgb, ${colorVar} 12%, var(--color-background-card))`,
              }}>
              {pill.label}
            </span>
          );
        })}
      </div>
      <AnnotationList
        items={[
          'countBadge — 18px min-width/height, radius 999, paddingInline 5, 11/700 tabular on --color-error; seated top −4 / right −8 on 28px glyphs; 3 vs 12 proves minWidth keeps circles round; 127 renders the “99+” cap',
          'badge text — light #FFFFFF on #E3193B ≈ 4.7:1; dark side flips to ink #2A0A10 on #F5394F ≈ 4.9:1 (white fails at 3.8:1)',
          'dotBadge — 8px, unread-without-count; brand-fill count variant for non-alert counts (queue depth, drafts)',
          'statusPills — 22px, radius 999, paddingInline 8, 11/600 uppercase 0.4 tracking, color-mix 12% tint of --color-success / --color-warning / --color-error',
        ]}
      />
    </SpecimenFrame>
  );
}

// ---------------------------------------------------------------------------
// S7 · PROGRESS — ring + bar share ONE pct; indeterminate is CSS-only.
// ---------------------------------------------------------------------------

const RING_R = 20;
const RING_CIRC = 2 * Math.PI * RING_R; // ≈ 125.66

function ProgressSection({pct, onAdvance, onReset}: {pct: number; onAdvance: () => void; onReset: () => void}) {
  const atMax = pct >= 100;
  return (
    <SpecimenFrame label="Progress — live ring · bar · indeterminate">
      <div style={styles.progressRow}>
        {/* Ring is aria-hidden — the bar below is the one progressbar
            announcer for the shared pct (no double announce). */}
        <div style={styles.ringWrap} aria-hidden>
          <svg width={48} height={48} viewBox="0 0 48 48" fill="none" style={{transform: 'rotate(-90deg)'}}>
            <circle cx={24} cy={24} r={RING_R} stroke="var(--color-border)" strokeWidth={4} />
            <circle
              cx={24}
              cy={24}
              r={RING_R}
              stroke="var(--color-brand)"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${((pct / 100) * RING_CIRC).toFixed(2)} ${RING_CIRC.toFixed(2)}`}
              className="ovg-fade"
            />
          </svg>
          {/* fill var(--color-text-primary) — --color-text does not exist. */}
          <span style={styles.ringLabel}>{pct}%</span>
        </div>
        <div
          style={styles.barTrack}
          role="progressbar"
          aria-label="Demo progress"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}>
          <div style={{...styles.barFill, width: `${pct}%`}} />
        </div>
        <span style={styles.pctReadout}>{pct}%</span>
      </div>
      <div style={styles.progressBtnRow}>
        <button
          type="button"
          className="ovg-btn ovg-focusable"
          style={styles.demoBtnHit}
          disabled={atMax}
          aria-disabled={atMax}
          onClick={onAdvance}>
          <span style={{...styles.demoBtnFace, ...(atMax ? styles.demoBtnDisabled : null)}}>Advance +20%</span>
        </button>
        <button type="button" className="ovg-btn ovg-focusable" style={styles.demoBtnHit} onClick={onReset}>
          <span style={styles.demoBtnFace}>Reset</span>
        </button>
      </div>
      <div style={styles.indeterminateTrack} aria-hidden>
        {/* Reduced motion removes the sweep entirely; the static centered
            40% segment still encodes 'loading'. */}
        <div style={{...styles.indeterminateSegment, marginInlineStart: '30%'}} className="ovg-sweep" />
      </div>
      <AnnotationList
        items={[
          'ring — 48px SVG, r 20, strokeWidth 4, track --color-border, fill --color-brand, round cap, rotated −90°; center 11/600 tabular pct in --color-text-primary (--color-text does not exist)',
          'bar — 4px track --color-background-muted radius 999, brand fill; ring and bar share ONE pct (Advance steps 0→100 and disables at 100 at 40% opacity; Reset returns to 40)',
          'indeterminate — 4px track, 40% brand segment, translateX(−100%)→translateX(250%) 1.4s linear loop; under prefers-reduced-motion the animation is REMOVED and the segment freezes centered',
        ]}
      />
    </SpecimenFrame>
  );
}

// ---------------------------------------------------------------------------
// S8 · LAYERING & SCRIM — the ten-rung z ladder as stepped plates.
// ---------------------------------------------------------------------------

function ScrimLadder() {
  return (
    <SpecimenFrame label="Layering — the z ladder">
      <div style={{...styles.ladder, ...styles.frozen}} aria-hidden>
        {LAYERS.map((layer, index) => (
          <div
            key={layer.id}
            style={{
              ...styles.ladderPlate,
              marginInlineStart: index * 12,
              background: `color-mix(in srgb, var(--color-brand) ${4 + index * 3}%, var(--color-background-card))`,
            }}>
            <span style={styles.ladderZ}>z{layer.z}</span>
            <span style={styles.ladderName}>{layer.name}</span>
          </div>
        ))}
      </div>
      <AnnotationList
        items={[
          'z0 content · z10 indexScrubber · z15 sticky sectionHeaders · z20 sticky chrome · z30 toastDock · z40 sheetScrim · z41 sheet/actionSheet/anchored menu · z50 cover · z60 alertScrim · z61 alert',
          'sheet scrim (40) dims the dock (30) — a toast never floats over a sheet',
          'never stack sheets — z41 holds exactly one occupant (sheet OR actionSheet OR menu)',
          'the alert outranks everything, including covers (60/61 above 50)',
        ]}
      />
    </SpecimenFrame>
  );
}

// ---------------------------------------------------------------------------
// S9 · FOCUS RESTORE — the matrix + a live proof that toasts never steal
// focus.
// ---------------------------------------------------------------------------

function FocusRestoreSection({
  focusNote,
  onCopyLink,
}: {
  focusNote: string;
  onCopyLink: (event: {currentTarget: HTMLElement}) => void;
}) {
  return (
    <SpecimenFrame label="Focus restore — matrix + live proof">
      {RESTORE_MATRIX.map((row, index) => (
        <div key={row.id}>
          {index > 0 ? <div style={styles.fullDivider} /> : null}
          <div style={styles.matrixRow}>
            <span style={styles.matrixSubject}>{row.subject}</span>
            <span style={styles.matrixRule}>{row.rule}</span>
          </div>
        </div>
      ))}
      <div style={styles.fullDivider} />
      <div style={{...styles.progressBtnRow, marginTop: 8}}>
        <button type="button" className="ovg-btn ovg-focusable" style={styles.demoBtnHit} onClick={onCopyLink}>
          <span style={styles.demoBtnFace}>Copy link</span>
        </button>
      </div>
      <FocusReadout note={focusNote} />
      <AnnotationList
        items={[
          'press Copy link: a count toast posts to the dock while focus provably stays on the button — the readout echoes document.activeElement’s accessible name after each demo interaction',
        ]}
      />
    </SpecimenFrame>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileOverlayGalleryTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;

  const {state, update} = useGalleryState();

  const shellRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const toastSeqRef = useRef(0);

  const toastPatch = (msg: string, kind: GalleryToast['kind'], undoes: GalleryToast['undoes'] = null) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, msg, kind, undoes}};
  };

  // THEME TOGGLE — flips style.colorScheme on the shell root; every
  // surface follows by construction via light-dark(). Starts 'inherit'
  // (following the demo's scheme switch); the first press pins the
  // opposite of the currently-resolved scheme.
  const toggleScheme = () => {
    if (state.scheme !== 'inherit') {
      update({scheme: state.scheme === 'dark' ? 'light' : 'dark'});
      return;
    }
    // Resolve the inherited scheme: the demo pins color-scheme to 'light'
    // or 'dark' when a scheme is chosen; at System it stays 'light dark',
    // so prefers-color-scheme is the tiebreak.
    const computed = shellRef.current != null ? getComputedStyle(shellRef.current).colorScheme : '';
    const isDark =
      computed === 'dark' ||
      (computed !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    update({scheme: isDark ? 'light' : 'dark'});
  };

  // ANCHORED MENU lifecycle — focus in on open (preventScroll: the stage
  // is a clipped box the browser would otherwise scroll-reveal), restore
  // to the trigger + narrate on every close path.
  const openMenu = () => update({menuOpen: true});
  useEffect(() => {
    if (state.menuOpen) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [state.menuOpen]);
  const closeMenu = useCallback(
    (extra?: Partial<GalleryState>) => {
      update({
        menuOpen: false,
        focusNote: `More for “${HIGHLIGHT.title}”`,
        ...extra,
      });
      menuTriggerRef.current?.focus({preventScroll: true});
    },
    [update],
  );

  // Escape closes the topmost overlay only — the live menu is the only
  // real overlay in the gallery.
  useEffect(() => {
    if (!state.menuOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.menuOpen, closeMenu]);

  // S3 · UNDO OVER CONFIRM — execute immediately, offer Undo; a new
  // mutation REPLACES the toast (one-toast law); Undo restores the row to
  // its original index (render order comes from the DEMO_THREADS const).
  const archiveThread = (id: string) => {
    const thread = DEMO_THREADS.find(item => item.id === id);
    if (thread == null) return;
    update({
      archivedIds: [...state.archivedIds, id],
      ...toastPatch(`Conversation with ${thread.name} archived`, 'undo', 'archive'),
    });
  };
  const undoToast = () => {
    if (state.toast?.undoes === 'archive') {
      update({
        archivedIds: state.archivedIds.slice(0, -1),
        ...toastPatch(TOAST_STRINGS.restored, 'confirm'),
      });
    } else if (state.toast?.undoes === 'highlight') {
      update({highlightDeleted: false, ...toastPatch(TOAST_STRINGS.restored, 'confirm')});
    }
  };

  // S2 · menu verbs — Delete demonstrates the menu→undo-toast chain.
  const deleteHighlight = () => {
    closeMenu({
      highlightDeleted: true,
      ...toastPatch(TOAST_STRINGS.highlightDeleted, 'undo', 'highlight'),
    });
  };
  const menuAction = (label: string) => {
    closeMenu(
      label === MENU_ITEMS[0].label ? toastPatch(TOAST_STRINGS.copied, 'count') : undefined,
    );
  };

  // S9 · live proof — the toast posts while focus stays put; the readout
  // echoes the activeElement's accessible name after the click settles.
  const copyLink = (event: {currentTarget: HTMLElement}) => {
    const opener = event.currentTarget;
    update({
      ...toastPatch(TOAST_STRINGS.copied, 'count'),
      focusNote: 'Copy link — toast posted, focus unmoved',
    });
    // Click already leaves focus on the button; assert it for keyboard
    // activations that bubble from the inner face span.
    opener.focus({preventScroll: true});
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktopColumn ? styles.shellDesktop : null),
    ...(state.scheme === 'inherit' ? null : {colorScheme: state.scheme}),
  };

  return (
    <div ref={wrapRef} style={{...styles.wrap, ...(isDesktopColumn ? styles.wrapDesktop : null)}}>
      <style>{OVG_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.brandSlot} aria-hidden>
              <span style={styles.brandMark}>A</span>
            </span>
          </div>
          <h1 style={styles.navTitle}>Overlay &amp; Feedback</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="ovg-btn ovg-focusable"
              style={styles.iconBtn}
              aria-pressed={state.scheme === 'dark'}
              aria-label={state.scheme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              onClick={toggleScheme}>
              <Icon icon={SunMoonIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.content}>
          <section style={styles.section}>
            <GallerySectionHeader>S1 · Action sheet</GallerySectionHeader>
            <ActionSheetSpecimen />
          </section>

          <section style={styles.section}>
            <GallerySectionHeader>S2 · Anchored menu</GallerySectionHeader>
            <AnchoredMenuDemo
              isOpen={state.menuOpen}
              isDeleted={state.highlightDeleted}
              menuRef={menuRef}
              triggerRef={menuTriggerRef}
              focusNote={state.focusNote}
              onOpen={openMenu}
              onClose={() => closeMenu()}
              onDelete={deleteHighlight}
              onAction={menuAction}
            />
          </section>

          <section style={styles.section}>
            <GallerySectionHeader>S3 · Undo &amp; toast rules</GallerySectionHeader>
            <ArchiveUndoDemo archivedIds={state.archivedIds} onArchive={archiveThread} />
            <ToastSpecimen />
          </section>

          <section style={styles.section}>
            <GallerySectionHeader>S4 · Centered alert</GallerySectionHeader>
            <AlertSpecimen />
          </section>

          <section style={styles.section}>
            <GallerySectionHeader>S5 · Banners</GallerySectionHeader>
            <BannerSection kind={state.bannerKind} onChange={kind => update({bannerKind: kind})} />
          </section>

          <section style={styles.section}>
            <GallerySectionHeader>S6 · Badges</GallerySectionHeader>
            <BadgeCluster />
          </section>

          <section style={styles.section}>
            <GallerySectionHeader>S7 · Progress</GallerySectionHeader>
            <ProgressSection
              pct={state.pct}
              onAdvance={() => update({pct: Math.min(100, state.pct + PCT_STEP)})}
              onReset={() => update({pct: PCT_START})}
            />
          </section>

          <section style={styles.section}>
            <GallerySectionHeader>S8 · Layering &amp; scrim</GallerySectionHeader>
            <ScrimLadder />
          </section>

          <section style={{...styles.section, marginBottom: 0}}>
            <GallerySectionHeader>S9 · Focus restore</GallerySectionHeader>
            <FocusRestoreSection focusNote={state.focusNote} onCopyLink={copyLink} />
          </section>
        </main>

        {/* THE one real polite live region. Sticky-in-flow at bottom 16
            (no tabBar here; bottom 76 above a 64px tabBar + 12 when one
            exists) — see the amendment note in the header comment. z30:
            a sheet scrim (z40) would dim it. */}
        <div style={styles.toastDock} aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={{...styles.toast, ...styles.toastLive}} className="ovg-fade">
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.kind === 'undo' ? (
                <>
                  <span style={styles.toastHairline} aria-hidden />
                  <button type="button" className="ovg-btn ovg-focusable" style={styles.toastUndoBtn} onClick={undoToast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
