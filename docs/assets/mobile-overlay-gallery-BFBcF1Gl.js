var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

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
 * @position Page template; emitted by \`astryx template mobile-overlay-gallery\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
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

// Template-local token block, set as custom properties on \`shell\` so every
// var(--color-brand|success|warning) below resolves to these pairs.
// Contrast math:
//   --color-brand   #4759E4 on #FFFFFF ≈ 5.5:1 ✓ · #A3AFFA on #1F1F22 ≈ 8.1:1 ✓
//   --color-success #1F7A43 on #FFFFFF ≈ 5.4:1 ✓ · #4CC38A on #1F1F22 ≈ 8.3:1 ✓
//   --color-warning #9A6700 on #FFFFFF ≈ 4.9:1 ✓ · #E2B93B on #1F1F22 ≈ 9.0:1 ✓
// (--color-error stays the DS token; the DS --color-success/--color-warning
// pairs fail 4.5:1 as text, hence the local mints — per spec.)
const TEMPLATE_TOKENS = {
  '--color-brand': \`light-dark(\${BRAND.color}, #A3AFFA)\`,
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

const OVG_CSS = \`
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
\`;

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
  // Decision-table rows.
  decisionRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    fontSize: 13,
    lineHeight: 1.5,
    paddingBlock: 8,
  },
  decisionWhen: {flex: 1, minWidth: 0, color: 'var(--color-text-secondary)'},
  decisionThen: {fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--color-text-primary)'},
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
// ===== CHUNK-2 =====
`;export{e as default};