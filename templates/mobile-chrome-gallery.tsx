// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel notes app's chrome
 *   manifest: a SPECIMENS array of 17 entries {id, section, title, state,
 *   anatomy[]} across 8 sections (nav bars ×4, tab bars ×3, segmented ×2,
 *   FAB ×1, footer CTA ×2, sheet detents ×2, cover ×1, legend ×2); NAV
 *   fixtures (Note Details / Library / 'quarterly review' query /
 *   '3 Selected'); a 5-tab TABS roster (Home, Library·3, Capture,
 *   Activity·99+, Profile); SEGMENTS_3 All/Pinned/Archived; nine stress
 *   strings (the 'Reconciliation & Adjustments — Q3' title, the Lisbon
 *   search query, '248 Selected', 'New voice memo', the $1,284.00 CTA,
 *   the 'Filter, sort & display options' sheet title). No Date.now(), no
 *   Math.random(), no timers, no network media.
 * @output Kestrel — Mobile Chrome Gallery: the mobile kit's visual
 *   CONTRACT in the composer-state-gallery specimen tradition. A 390px
 *   shell whose own real chrome (52px sticky navBar with a LIVE Sun/Moon
 *   colorScheme toggle; sticky blurred sectionHeaders at top 52) frames
 *   17 labeled SpecimenFrames: each a 358px card with a caption row
 *   (13px/600 title + LIVE/FROZEN StatePill), a muted MiniStage rendering
 *   the primitive, and an AnnotationBlock of 11px/500 tabular-nums lines
 *   citing exact px anatomy. LIVE specimens are real controls (the 5-tab
 *   bar really moves its tint; the 3-segment control is a radiogroup with
 *   a 200ms thumb); FROZEN specimens are aria-hidden div stills (search
 *   flow, edit-mode flip, editToolbar, FABs, footer CTAs, both sheet
 *   detents, the cover). The theme toggle flips colorScheme on the shell,
 *   so every light-dark() token proves both themes by construction.
 * @position Page template; emitted by `astryx template mobile-chrome-gallery`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the gallery navBar at y=0 is the
 *   first pixel). Overlays in the SPECIMENS are absolute inside their
 *   MiniStage (isolation:'isolate' contains their z40–50 ladder);
 *   position:fixed is banned. No sheet ever actually opens, so the shell
 *   never scroll-locks. NO tabBar on the gallery itself — it is a single
 *   document, so nothing competes with the tabBar specimens.
 * Container policy: inset-grouped SpecimenFrames (marginInline 16, 12px
 *   radius, 1px border, card fill); frames stack at 12px gaps inside a
 *   section, 24px between sections; the two legend specimens are inset
 *   listCards with 44px rows and 16px-inset hairline dividers. No desktop
 *   Layout frames, no asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal BRAND
 *   (Kestrel ember #C2410C — flowed into --color-brand on the shell so
 *   every var(--color-brand) in the specimens is the Kestrel accent); the
 *   sanctioned non-brand literals are BRAND_FILL_TEXT / BRAND_PRESSED /
 *   ERROR_FILL_TEXT / SCRIM, each a light-dark() pair with contrast math
 *   at the declaration. Icons use --color-text-primary /
 *   --color-text-secondary explicitly — var(--color-text) does not exist.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — this
 *   template does not wire scroll-under; noted per contract); tabBar
 *   specimen 64px; rows 44px; sectionHeader 13px/600 uppercase 0.06em,
 *   sticky top 52 z15 on the navBar blur surface. GALLERY ADDITIONS:
 *   SpecimenFrame caption '12px 16px', frame-to-annotation hairlines,
 *   annotation 11px/500 tabular-nums, MiniStage inner width = frame inner
 *   (358 minus the 2px of frame borders — the annotations cite the 358
 *   design width). TYPE (Figtree via --font-family-body): 28/700 large
 *   title · 17/600 nav & sheet titles · 16/400 body rows · 15/600
 *   extended-FAB label · 13/400–600 secondary & captions · 11/500–600
 *   annotations, tab labels, badges, pills; nothing under 11px;
 *   tabular-nums on every counting numeral. Touch: every LIVE target
 *   ≥44×44 (toggle 44×44, tab items 64px-tall flex-1, segments 36px +
 *   4px block padding wrapper = 44); FROZEN stills are divs inside
 *   aria-hidden MiniStages and never enter tab order.
 *
 * Responsive contract:
 * - Fluid 320–430px: frames are fluid (marginInline 16, no width
 *   literals); bars inside MiniStages span the stage; stress titles
 *   ellipsize harder, slots hold. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as a
 *   centered 390px column (maxWidth 390, marginInline auto, 1px border)
 *   on a muted page backdrop. NO reflow, NO multi-column regrouping: the
 *   px anatomy IS the contract and must measure identically at every
 *   viewport, so the shell never widens.
 *
 * Deviations from spec (foundations override, both annotated in-frame):
 * - Medium sheet detent renders at 55% (spec's frame said 50%; the
 *   primitiveContracts fix MEDIUM = 55% of the locked shell).
 * - Large detent renders at calc(100% − 56px) (spec said −52px; the
 *   foundations fix LARGE = calc(100% − 56px), navBar peeking).
 */

import {useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject} from 'react';
import {useEffect} from 'react';

import {
  BellIcon,
  ChevronLeftIcon,
  HouseIcon,
  LibraryIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PlusCircleIcon,
  PlusIcon,
  SearchIcon,
  SunIcon,
  UserIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Kestrel ember, spec hex #C2410C). Flowed
// into --color-brand on the shell. #C2410C on #FFFFFF ≈ 5.2:1 (passes
// 4.5:1); #FB923C on the dark card (~#1C1C1E) ≈ 7.5:1.
const BRAND = 'light-dark(#C2410C, #FB923C)';
// Text/glyphs over a BRAND fill. Light: #FFFFFF on #C2410C ≈ 5.2:1. Dark:
// white on #FB923C fails (~2.3:1), so the dark side flips to a near-black
// ember — #431407 on #FB923C ≈ 6.9:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #431407)';
// Pressed CTA fill (the busy-footer still). #FFFFFF on #9A3410 ≈ 7.4:1;
// #431407 on #F97316 ≈ 5.6:1 — both clear 4.5:1.
const BRAND_PRESSED = 'light-dark(#9A3410, #F97316)';
// 12% brand wash for the LIVE StatePill and the Kestrel brand mark.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND} 12%, transparent)`;
// Badge text over a --color-error fill (light-dark(#E3193B, #F5394F)):
// #FFFFFF on #E3193B ≈ 4.7:1; white on #F5394F fails (~3.8:1), so the
// dark side flips to #2B0505 on #F5394F ≈ 5.0:1.
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #2B0505)';
// Sheet/cover scrim, verbatim from the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// The navBar / tabBar / footer blur surface, verbatim from the foundations.
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the segmented-thumb
// and tab-tint transitions (transform/opacity/color only), the ONE legal
// spinner's keyframes, the visually-hidden h1, and the reduced-motion
// guard that collapses every transition and removes the spin entirely.
// ---------------------------------------------------------------------------

const KCG_CSS = `
.kcg-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.kcg-btn:disabled { cursor: default; }
.kcg-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.kcg-thumb { transition: transform 200ms ease; }
.kcg-tint { transition: color 120ms ease; }
@keyframes kcg-spin { to { transform: rotate(360deg); } }
.kcg-spin { animation: kcg-spin 1s linear infinite; }
.kcg-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (prefers-reduced-motion: reduce) {
  .kcg-thumb, .kcg-tint { transition: none; }
  .kcg-spin { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window, so viewport queries
  // alone cannot tell the two stages apart).
  wrap: {width: '100%'},
  // Desktop backdrop behind the centered phone column.
  wrapDesktop: {background: 'var(--color-background-muted)'},
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
  // Desktop stage ≥720px container width: centered 390px column — the px
  // anatomy is the contract, so the shell NEVER widens (maxWidth only; no
  // width literals per the foundations).
  shellDesktop: {
    maxWidth: 390,
    marginInline: 'auto',
    border: '1px solid var(--color-border)',
  },
  // GALLERY NAV BAR — 52px sticky top z20; paddingInline 8 so the 44×44
  // toggle optically aligns to the 16px gutter. Hairline ALWAYS ON.
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 44×44 non-button brand slot holding the 28px Kestrel mark.
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: 'var(--color-brand)',
    fontSize: 15,
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
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // Intro caption at the 16px gutter.
  intro: {
    margin: '12px 0 20px',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
    fontVariantNumeric: 'tabular-nums',
  },
  // Sticky sectionHeader — 13/600 uppercase 0.06em, sticky below the 52px
  // navBar (top 52, z15 < navBar z20), same blur surface.
  sectionHeader: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    margin: 0,
    padding: '10px 16px 8px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    fontVariantNumeric: 'tabular-nums',
  },
  sectionBlock: {marginBottom: 24},
  frameStack: {display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4},
  // SPECIMEN FRAME — inset-grouped card at the 16px gutter, 12px radius.
  frame: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  frameCaption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '12px 16px',
  },
  frameTitle: {
    fontSize: 13,
    fontWeight: 600,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // StatePill — 11/600 pill labeling LIVE vs FROZEN.
  pillLive: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    background: BRAND_TINT_12,
    color: 'var(--color-brand)',
    flexShrink: 0,
  },
  pillFrozen: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  // MINI STAGE — muted, checker-free, position:relative; isolation
  // contains the specimen z40–50 ladder below the sticky chrome's z15/z20.
  miniStage: {
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    width: '100%',
    background: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
  },
  stageStack: {display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12},
  stagePad: {padding: 16, display: 'flex', flexDirection: 'column', gap: 12},
  // 11/600 overline tag inside a stage ('EXPANDED', 'STRESS', …).
  stageTag: {
    padding: '10px 16px 4px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  // ANNOTATION BLOCK — 11/500 tabular-nums contract lines.
  annotation: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '10px 16px 14px',
    borderTop: '1px solid var(--color-border)',
  },
  annotationLine: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // ---- NAV BAR SPECIMENS (frozen divs) ----
  specBar: {
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  specBarNoHairline: {borderBottom: 'none'},
  specBackSlot: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingInline: 2,
    color: 'var(--color-brand)',
  },
  specBackLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  specIconSlot: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  specTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // Nav text buttons (Cancel 17/400, Done 17/600) — 44px-tall hits.
  specTextBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    fontSize: 17,
    fontWeight: 400,
    color: 'var(--color-brand)',
    whiteSpace: 'nowrap',
  },
  specTextBtnStrong: {fontWeight: 600},
  // Large-title row — 52px block below the bar; 28/700 at the 16px gutter.
  specLargeRow: {
    height: 52,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  specLargeTitle: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Search bar — 52px in flow below the bar, same surface, NO own hairline.
  specSearchBar: {
    height: 52,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  specSearchField: {
    flex: 1,
    minWidth: 0,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  specSearchQuery: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  specSearchClear: {
    width: 44,
    height: 36,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  specSearchCancel: {
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    marginLeft: 12,
    fontSize: 17,
    fontWeight: 400,
    color: 'var(--color-brand)',
    whiteSpace: 'nowrap',
  },
  // ---- TAB BAR SPECIMENS ----
  tabBar: {
    height: 64,
    flexShrink: 0,
    display: 'flex',
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: 'var(--color-brand)'},
  tabIconWrap: {position: 'relative', width: 24, height: 24, display: 'grid', placeItems: 'center'},
  tabLabel: {
    fontSize: 11,
    fontWeight: 500,
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  tabLabelActive: {fontWeight: 600},
  // Badge — min-width 18, height 18, radius 999, 11/600, error fill;
  // offset top −4 / right −8 from the 24px icon.
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    display: 'grid',
    placeItems: 'center',
    paddingInline: 4,
    borderRadius: 999,
    background: 'var(--color-error)',
    color: ERROR_FILL_TEXT,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  // ---- EDIT TOOLBAR SPECIMEN ----
  editToolbar: {
    height: 64,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  toolbarBtn: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  toolbarDelete: {color: 'var(--color-error)'},
  toolbarSelectAll: {fontWeight: 600, color: 'var(--color-brand)'},
  toolbarMove: {color: 'var(--color-brand)'},
  // Disabled until selection ≥ 1: secondary at 40% opacity.
  toolbarDisabled: {color: 'var(--color-text-secondary)', opacity: 0.4},
  // ---- SEGMENTED CONTROL ----
  // 4px block padding lifts the 36px track to a 44px hit.
  segWrap: {paddingBlock: 4},
  segTrack: {
    position: 'relative',
    display: 'flex',
    height: 36,
    padding: 2,
    borderRadius: 10,
    background: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  segThumb: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 2,
    borderRadius: 8,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 1px 4px var(--color-shadow)',
  },
  segItem: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  segItemActive: {fontWeight: 600, color: 'var(--color-text-primary)'},
  segItemDisabled: {opacity: 0.35},
  // ---- FAB SPECIMENS ----
  fabStandard: {
    width: 56,
    height: 56,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-brand)',
    color: BRAND_FILL_TEXT,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  fabExtended: {
    height: 48,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 20,
    borderRadius: 999,
    background: 'var(--color-brand)',
    color: BRAND_FILL_TEXT,
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 15,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // ---- STICKY FOOTER CTA SPECIMENS ----
  footerChrome: {
    padding: '12px 16px',
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  ctaBtn: {
    height: 48,
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 16,
    borderRadius: 12,
    background: 'var(--color-brand)',
    color: BRAND_FILL_TEXT,
    fontSize: 17,
    fontWeight: 600,
  },
  ctaBtnPressed: {background: BRAND_PRESSED, transform: 'scale(0.98)'},
  ctaLabel: {
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // The ONE legal spinner — 16px inline, inside the pressed CTA only.
  spinner: {
    width: 16,
    height: 16,
    flexShrink: 0,
    borderRadius: 999,
    border: `2px solid color-mix(in srgb, ${BRAND_FILL_TEXT} 30%, transparent)`,
    borderTopColor: BRAND_FILL_TEXT,
  },
  // ---- SHEET SPECIMENS (frozen compositions) ----
  sheetBackdropRow: {
    height: 60,
    marginInline: 16,
    borderRadius: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
  },
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
  sheetGrabberZone: {height: 24, flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: 8},
  sheetGrabber: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 240,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {display: 'flex', flexDirection: 'column', gap: 12, padding: 16},
  // Deterministic skeleton-convention placeholder bars (60/45/70%).
  placeholderBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // ---- COVER SPECIMEN ----
  cover: {
    position: 'absolute',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-body)',
    borderRadius: 0,
  },
  coverField: {
    height: 48,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  coverFieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8},
  // ---- LEGEND SPECIMENS ----
  legendCard: {
    margin: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  legendRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
  },
  legendName: {
    fontSize: 16,
    fontWeight: 400,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-brand)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  terminalCaption: {
    margin: '16px 0 24px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic by law: fixed strings, no clocks, no randomness.
// ---------------------------------------------------------------------------

// The fictional notes app whose chrome is specimened.
const APP = 'Kestrel';

const NAV_TITLES = {
  plain: 'Note Details',
  large: 'Library',
  search: 'Search notes',
  edit: '3 Selected',
} as const;

const SEARCH_QUERY = 'quarterly review';

interface TabDef {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const TABS: TabDef[] = [
  {id: 'home', label: 'Home', icon: HouseIcon},
  {id: 'library', label: 'Library', icon: LibraryIcon, badge: '3'},
  {id: 'capture', label: 'Capture', icon: PlusCircleIcon},
  // Badge caps at '99+' — never a raw 4-digit count (stress fixture).
  {id: 'activity', label: 'Activity', icon: BellIcon, badge: '99+'},
  {id: 'profile', label: 'Profile', icon: UserIcon},
];

const SEGMENTS_3 = ['All', 'Pinned', 'Archived'];
// Second segment renders disabled in the frozen frame.
const SEGMENTS_2 = ['List', 'Board'];

const TOOLBAR_ACTIONS = ['Delete', 'Select All', 'Move'] as const;

const FAB_LABEL = 'New note';
const CTA_LABEL = 'Continue';
const SHEET_TITLE = 'Filter notes';
const COVER_TITLE = 'Compose';

// Clipping-point stress fixtures, cross-referenced from the frames that
// render them (each gets a visible STRESS row + an annotation line).
const STRESS = {
  navTitle: 'Reconciliation & Adjustments — Q3',
  largeTitle: 'Saved Conversations',
  searchQuery: 'meeting notes from the offsite in Lisbon',
  editCount: '248 Selected',
  fabLabel: 'New voice memo',
  ctaLabel: 'Continue to checkout — $1,284.00',
  sheetTitle: 'Filter, sort & display options',
} as const;

// zIndex ladder + motion table for the closing legend specimens.
const LAYER_LADDER = [
  {name: 'navBar · tabBar · editToolbar', value: 'sticky · z 20'},
  {name: 'toastDock (polite live region)', value: 'z 30'},
  {name: 'sheetScrim', value: 'z 40'},
  {name: 'sheet · actionSheet', value: 'z 41'},
  {name: 'full-screen cover', value: 'z 50'},
  {name: 'alertScrim', value: 'z 60'},
  {name: 'alert', value: 'z 61'},
];

const MOTION_RULES = [
  {name: 'Push · sheet · cover · seg thumb', value: '200 ms'},
  {name: 'Action sheet fade + slide', value: '200 ms'},
  {name: 'Skeleton shimmer sweep', value: '1.6 s loop'},
  {name: 'Reduced motion', value: 'instant / removed'},
];

// ---------------------------------------------------------------------------
// SPECIMEN MANIFEST — the contract text lives in data, not JSX. The
// terminal caption derives from SPECIMENS.length.
// ---------------------------------------------------------------------------

type SpecimenState = 'LIVE' | 'FROZEN';

interface SpecimenDef {
  id: string;
  section: string;
  title: string;
  state: SpecimenState;
  anatomy: string[];
}

interface SectionDef {
  id: string;
  title: string;
}

const SECTIONS: SectionDef[] = [
  {id: 'nav', title: '§1 · Nav bars'},
  {id: 'tab', title: '§2 · Tab bars'},
  {id: 'seg', title: '§3 · Segmented control'},
  {id: 'fab', title: '§4 · Floating action button'},
  {id: 'footer', title: '§5 · Sticky footer CTA'},
  {id: 'sheet', title: '§6 · Sheet detents'},
  {id: 'cover', title: '§7 · Full-screen cover'},
  {id: 'legend', title: '§8 · Layer & motion legend'},
];

const SPECIMENS: SpecimenDef[] = [
  {
    id: 'nav-plain',
    section: 'nav',
    title: 'Plain push bar',
    state: 'FROZEN',
    anatomy: [
      'bar: 52px · paddingInline 8 · grid 1fr auto 1fr',
      'leading: 44×44 back hit · 24px chevron + prior title 13px/500 ≤96px',
      'title: 17px/600 centered · ellipsis at 200px max',
      'trailing: one 44×44 icon button — never three',
      'surface: body 86% + blur(12px) · 1px hairline (always-on variant)',
      'stress: “Reconciliation & Adjustments — Q3” ellipsizes between fixed slots',
    ],
  },
  {
    id: 'nav-large',
    section: 'nav',
    title: 'Large title — expanded / collapsed',
    state: 'FROZEN',
    anatomy: [
      'bar 52px + large-title row 52px = 104px total header',
      'large title: 28px/700 at the 16px gutter · single line',
      'expanded: center title hidden · no hairline until collapse',
      'collapsed: title back to 17px/600 centered · hairline on',
      'stress: “Saved Conversations” 28px/700 ellipsis at 326px (358 − 32)',
    ],
  },
  {
    id: 'nav-search',
    section: 'nav',
    title: 'Search flow — active',
    state: 'FROZEN',
    anatomy: [
      'searchBar: 52px in flow below the bar · same blur · no own hairline',
      'field: 36px · muted fill · radius 12 · paddingInline 12',
      '16px SearchIcon · 8px gap · 16px/400 input (16 is the zoom floor)',
      'clear: 16px XCircle inside a 44×36 hit · keeps focus',
      'Cancel: 17px/400 brand · 44px-tall hit · 12px from the field',
      'stress: “meeting notes from the offsite in Lisbon” ellipsizes — clear + Cancel hold width',
    ],
  },
  {
    id: 'nav-edit',
    section: 'nav',
    title: 'Edit mode — flipped',
    state: 'FROZEN',
    anatomy: [
      'leading: Cancel 17px/400 — push stack frozen while editing',
      'center: count 17px/600 tabular-nums · carries aria-live="polite" (the one sanctioned title region)',
      'trailing: Done 17px/600 --color-brand',
      'stress: “248 Selected” — tabular digits hold the center slot',
    ],
  },
  {
    id: 'tab-five',
    section: 'tab',
    title: 'Tab bar — 5 tabs',
    state: 'LIVE',
    anatomy: [
      'bar: 64px · borderTop hairline · blur surface · sticky bottom z20',
      'items: flex 1 · full 64px touch target · 5 × 71.6px at 390',
      '24px icon over 11px/500 label · 4px gap',
      'active: --color-brand + 600 weight · inactive: --color-text-secondary',
      'LIVE: taps really move the tint — activeTab in the one state owner',
      'stress: “Activity” at 11px/500 across 5 items · no wrap',
    ],
  },
  {
    id: 'tab-badges',
    section: 'tab',
    title: 'Tab bar — badges',
    state: 'FROZEN',
    anatomy: [
      'badge: min-width 18px · height 18px · radius 999 · 11px/600',
      '--color-error fill · text light-dark(#FFFFFF, #2B0505) — 4.7:1 / 5.0:1',
      'offset top −4 · right −8 from the 24px icon',
      'stress: counts cap at “99+” — never a raw 4-digit count',
    ],
  },
  {
    id: 'edit-toolbar',
    section: 'tab',
    title: 'editToolbar replaces tabBar',
    state: 'FROZEN',
    anatomy: [
      'identical geometry: 64px · sticky bottom z20 · blur · borderTop hairline — nothing shifts',
      'Delete at the LEADING end · --color-error — off the right-thumb arc',
      'Select All 13px/600 between · Move at the TRAILING end',
      'buttons: ≥44px tall · 13px/500 labels',
      'disabled until selection ≥ 1: --color-text-secondary at 40% opacity',
    ],
  },
  {
    id: 'seg-live',
    section: 'seg',
    title: 'Segmented — 3 segments',
    state: 'LIVE',
    anatomy: [
      'track: 36px · muted fill · radius 10 · 2px inner padding',
      'thumb: card fill · radius 8 · shadow 0 1px 4px · 200ms transform',
      'labels: selected 13px/600 primary · unselected 13px/500 secondary',
      '44px hit via 4px block padding on the wrapper',
      'LIVE: role radiogroup · arrow keys move · instant under reduced motion',
      'stress: “Archived” at 13px/600 across 3 equal segments',
    ],
  },
  {
    id: 'seg-frozen',
    section: 'seg',
    title: 'Segmented — disabled segment',
    state: 'FROZEN',
    anatomy: [
      '2 segments · same 36px track anatomy',
      'disabled segment: 35% opacity · never focusable',
    ],
  },
  {
    id: 'fab',
    section: 'fab',
    title: 'FAB — standard / extended / pressed',
    state: 'FROZEN',
    anatomy: [
      'standard: 56×56 circle · --color-brand fill · 24px glyph · radius 999',
      'glyph light-dark(#FFFFFF, #431407) on brand — 5.2:1 / 6.9:1',
      'shadow 0 4px 16px · shell coords: absolute right 16 · bottom 80 (64px tabBar + 16)',
      'extended: 48px pill radius 999 · paddingInline 20 · 20px icon + 8px gap + 15px/600 label',
      'pressed: frozen at 0.92 scale',
      'stress: “New voice memo” pill stays clear of the 16px gutter',
    ],
  },
  {
    id: 'footer-default',
    section: 'footer',
    title: 'Sticky footer CTA',
    state: 'FROZEN',
    anatomy: [
      'footer: sticky bottom · blur surface · borderTop hairline · padding 12px 16px',
      'button: 48px full width · radius 12 · --color-brand · 17px/600',
      'label light-dark(#FFFFFF, #431407) on brand — 5.2:1 / 6.9:1',
      'stress: “Continue to checkout — $1,284.00” single-line ellipsis inside 48px',
    ],
  },
  {
    id: 'footer-busy',
    section: 'footer',
    title: 'Footer CTA — busy',
    state: 'FROZEN',
    anatomy: [
      'pressed still: 0.98 scale · darker brand fill',
      '16px inline spinner beside the label — the ONE legal spinner',
      'spinner: 2px ring · radius 999 · 1s linear · removed under reduced motion',
      'page-level spinners are banned everywhere else',
    ],
  },
  {
    id: 'sheet-medium',
    section: 'sheet',
    title: 'Sheet — medium detent',
    state: 'FROZEN',
    anatomy: [
      'scrim: light-dark(rgba(21,17,12,.32), rgba(0,0,0,.55)) · z 40',
      'sheet: bottom-anchored · z 41 · height 55% of the locked 100dvh shell',
      'top corners 16px · card fill · shadow 0 −8px 32px',
      'grabber: 36×5 radius 999 · centered 8px from top · a real button in the live kit',
      'header: 52px · title 17px/600 · 44×44 X trailing',
      'deviation: spec frame said 50% — foundations fix MEDIUM = 55%',
    ],
  },
  {
    id: 'sheet-large',
    section: 'sheet',
    title: 'Sheet — large detent',
    state: 'FROZEN',
    anatomy: [
      'height: calc(100% − 56px) — the navBar stays peeking',
      'same anatomy · the one legal inner scroller lives in sheet content',
      'never stack sheets: a sheet may open a cover, not another sheet',
      'stress: “Filter, sort & display options” 17px/600 clears the grabber zone',
      'deviation: spec said −52px — foundations fix LARGE = calc(100% − 56px)',
    ],
  },
  {
    id: 'cover',
    section: 'cover',
    title: 'Full-screen cover',
    state: 'FROZEN',
    anatomy: [
      'inset 0 · z 50 · radius 0 — edge chrome never rounds the touching edge',
      'own 52px bar: 44×44 X leading · Done 17px/600 trailing',
      'slides up 200ms · plain fade under reduced motion',
      'layer law: sheets 40/41 < cover 50 < alertScrim 60',
    ],
  },
  {
    id: 'legend-layers',
    section: 'legend',
    title: 'zIndex ladder',
    state: 'FROZEN',
    anatomy: [
      'all overlays are absolute INSIDE shell — position:fixed is banned (escapes the stage)',
      'toastDock: insetInline 16 · bottom 76 (64px tabBar + 12) · one toast · no auto-dismiss timers',
      'Escape closes the topmost layer only · an alert never dismisses on scrim tap',
    ],
  },
  {
    id: 'legend-motion',
    section: 'legend',
    title: 'Motion & corner law',
    state: 'FROZEN',
    anatomy: [
      'transitions animate transform/opacity only · all collapse under reduced motion',
      'corners: 16 sheet+alert · 12 cards/CTA/field · 10 seg track · 8 seg thumb · 999 FAB/grabber/badge · 0 edge chrome',
      'chrome that touches a stage edge never rounds the touching edge',
    ],
  },
];

// ---------------------------------------------------------------------------
// HOOKS — container-width measurement (grid-feeder-console pattern): the
// desktop stage is ~1045px inside a 1440px window, so only a
// ResizeObserver on the wrapper can tell the two stages apart.
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
// GALLERY PRIMITIVES — SpecimenFrame / MiniStage / AnnotationBlock /
// StatePill. Frozen stages are aria-hidden and built from divs; their
// caption + annotation carry the accessible description instead.
// ---------------------------------------------------------------------------

function StatePill({state}: {state: SpecimenState}) {
  return <span style={state === 'LIVE' ? styles.pillLive : styles.pillFrozen}>{state}</span>;
}

function AnnotationBlock({lines}: {lines: string[]}) {
  return (
    <div style={styles.annotation}>
      {lines.map(line => (
        <div key={line} style={styles.annotationLine}>
          ↳ {line}
        </div>
      ))}
    </div>
  );
}

function MiniStage({frozen, height, children}: {frozen: boolean; height?: number; children: ReactNode}) {
  return (
    <div style={height != null ? {...styles.miniStage, height} : styles.miniStage} aria-hidden={frozen || undefined}>
      {children}
    </div>
  );
}

function SpecimenFrame({spec, children}: {spec: SpecimenDef; children: ReactNode}) {
  const captionId = `kcg-cap-${spec.id}`;
  return (
    <section role="group" aria-labelledby={captionId} style={styles.frame}>
      <div style={styles.frameCaption}>
        <span id={captionId} style={styles.frameTitle}>
          {spec.title}
        </span>
        <StatePill state={spec.state} />
      </div>
      {children}
      <AnnotationBlock lines={spec.anatomy} />
    </section>
  );
}

// 11/600 overline tag inside a stage ('EXPANDED', 'STRESS', …).
function StageTag({children}: {children: ReactNode}) {
  return <div style={styles.stageTag}>{children}</div>;
}

// ---------------------------------------------------------------------------
// NAV BAR SPECIMENS — frozen stills rendered from a variant prop. Every
// interactive-looking element is a DIV (never <button>) because the
// MiniStage is aria-hidden; the live kit's equivalents are real buttons.
// ---------------------------------------------------------------------------

type NavVariant = 'plain' | 'largeExpanded' | 'largeCollapsed' | 'search' | 'edit';

function NavBarSpec({variant, title, query}: {variant: NavVariant; title: string; query?: string}) {
  const hairline = variant !== 'largeExpanded' && variant !== 'search';
  return (
    <div>
      <div style={hairline ? styles.specBar : {...styles.specBar, ...styles.specBarNoHairline}}>
        <div style={styles.navLeading}>
          {variant === 'edit' ? (
            <div style={styles.specTextBtn}>Cancel</div>
          ) : variant === 'plain' || variant === 'search' ? (
            <div style={styles.specBackSlot}>
              <Icon icon={ChevronLeftIcon} size="lg" color="inherit" />
              <span style={styles.specBackLabel}>{NAV_TITLES.large}</span>
            </div>
          ) : (
            <div style={styles.brandSlot}>
              <span style={styles.brandMark}>K</span>
            </div>
          )}
        </div>
        <div style={variant === 'largeExpanded' ? {...styles.specTitle, opacity: 0} : styles.specTitle}>{title}</div>
        <div style={styles.navTrailing}>
          {variant === 'edit' ? (
            <div style={{...styles.specTextBtn, ...styles.specTextBtnStrong}}>Done</div>
          ) : (
            <div style={styles.specIconSlot}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </div>
          )}
        </div>
      </div>
      {variant === 'largeExpanded' ? (
        <div style={styles.specLargeRow}>
          <span style={styles.specLargeTitle}>{title}</span>
        </div>
      ) : null}
      {variant === 'search' ? (
        <div style={styles.specSearchBar}>
          <div style={styles.specSearchField}>
            <Icon icon={SearchIcon} size="sm" color="inherit" />
            <span style={styles.specSearchQuery}>{query}</span>
            <span style={styles.specSearchClear}>
              <Icon icon={XCircleIcon} size="sm" color="inherit" />
            </span>
          </div>
          <div style={styles.specSearchCancel}>Cancel</div>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TAB BAR SPECIMEN — real buttons when live (aria-pressed + tint), inert
// divs when frozen (badges frame).
// ---------------------------------------------------------------------------

function TabBarSpec({
  activeId,
  live,
  withBadges,
  onSelect,
}: {
  activeId: string;
  live: boolean;
  withBadges: boolean;
  onSelect?: (id: string) => void;
}) {
  return (
    <div style={styles.tabBar}>
      {TABS.map(tab => {
        const active = tab.id === activeId;
        const itemStyle = active ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem;
        const inner = (
          <>
            <span style={styles.tabIconWrap}>
              <Icon icon={tab.icon} size="lg" color="inherit" />
              {withBadges && tab.badge != null ? <span style={styles.tabBadge}>{tab.badge}</span> : null}
            </span>
            <span style={active ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>{tab.label}</span>
          </>
        );
        if (!live) {
          return (
            <div key={tab.id} className="kcg-tint" style={itemStyle}>
              {inner}
            </div>
          );
        }
        return (
          <button
            key={tab.id}
            type="button"
            className="kcg-btn kcg-focusable kcg-tint"
            style={itemStyle}
            aria-pressed={active}
            onClick={() => onSelect?.(tab.id)}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EDIT TOOLBAR SPECIMEN — 64px contextual toolbar; destructive at the
// LEADING end, primary safe verb trailing (ergonomics law).
// ---------------------------------------------------------------------------

function EditToolbarSpec({enabled}: {enabled: boolean}) {
  const [deleteLabel, selectAllLabel, moveLabel] = TOOLBAR_ACTIONS;
  return (
    <div style={styles.editToolbar}>
      <div style={{...styles.toolbarBtn, ...(enabled ? styles.toolbarDelete : styles.toolbarDisabled)}}>{deleteLabel}</div>
      <div style={{...styles.toolbarBtn, ...(enabled ? styles.toolbarSelectAll : styles.toolbarDisabled)}}>
        {selectAllLabel}
      </div>
      <div style={{...styles.toolbarBtn, ...(enabled ? styles.toolbarMove : styles.toolbarDisabled)}}>{moveLabel}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SEGMENTED CONTROL — the real, live control: role radiogroup, 44px hits
// (36px track + 4px block padding), arrow-key movement, 200ms thumb.
// ---------------------------------------------------------------------------

function SegmentedControl({
  segments,
  value,
  onChange,
  reducedMotion,
  label,
}: {
  segments: string[];
  value: number;
  onChange: (index: number) => void;
  reducedMotion: boolean;
  label: string;
}) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next =
      event.key === 'ArrowRight' ? Math.min(value + 1, segments.length - 1) : Math.max(value - 1, 0);
    if (next === value) return;
    onChange(next);
    const radios = event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
    radios[next]?.focus({preventScroll: true});
  };
  return (
    <div role="radiogroup" aria-label={label} style={styles.segWrap} onKeyDown={handleKeyDown}>
      <div style={styles.segTrack}>
        <div
          className={reducedMotion ? undefined : 'kcg-thumb'}
          style={{
            ...styles.segThumb,
            width: `calc((100% - 4px) / ${segments.length})`,
            transform: `translateX(${value * 100}%)`,
          }}
          aria-hidden
        />
        {segments.map((segment, index) => (
          <button
            key={segment}
            type="button"
            role="radio"
            aria-checked={index === value}
            tabIndex={index === value ? 0 : -1}
            className="kcg-btn kcg-focusable"
            style={index === value ? {...styles.segItem, ...styles.segItemActive} : styles.segItem}
            onClick={() => onChange(index)}>
            {segment}
          </button>
        ))}
      </div>
    </div>
  );
}

// Frozen 2-segment still with a 35%-opacity disabled segment.
function SegmentedFrozen() {
  return (
    <div style={styles.segWrap}>
      <div style={styles.segTrack}>
        <div style={{...styles.segThumb, width: 'calc((100% - 4px) / 2)'}} aria-hidden />
        <div style={{...styles.segItem, ...styles.segItemActive}}>{SEGMENTS_2[0]}</div>
        <div style={{...styles.segItem, ...styles.segItemDisabled}}>{SEGMENTS_2[1]}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FAB / FOOTER / SHEET / COVER SPECIMENS — frozen stills.
// ---------------------------------------------------------------------------

function FabSpec({variant, label}: {variant: 'standard' | 'extended' | 'pressed'; label?: string}) {
  if (variant === 'extended') {
    return (
      <div style={styles.fabExtended}>
        <Icon icon={PlusIcon} size="md" color="inherit" />
        <span>{label}</span>
      </div>
    );
  }
  return (
    <div style={variant === 'pressed' ? {...styles.fabStandard, transform: 'scale(0.92)'} : styles.fabStandard}>
      <Icon icon={PlusIcon} size="lg" color="inherit" />
    </div>
  );
}

// The ONE legal spinner — 16px, inline, inside the pressed CTA only.
function InlineSpinner() {
  return <span className="kcg-spin" style={styles.spinner} />;
}

function StickyFooterSpec({busy, label}: {busy: boolean; label: string}) {
  return (
    <div style={styles.footerChrome}>
      <div style={busy ? {...styles.ctaBtn, ...styles.ctaBtnPressed} : styles.ctaBtn}>
        {busy ? <InlineSpinner /> : null}
        <span style={styles.ctaLabel}>{label}</span>
      </div>
    </div>
  );
}

function SheetSpec({detent, title}: {detent: 'medium' | 'large'; title: string}) {
  return (
    <>
      {/* Backdrop content the scrim dims — proves the layering visually. */}
      <div style={{...styles.sheetBackdropRow, marginTop: 16}} />
      <div style={{...styles.sheetBackdropRow, marginTop: 12}} />
      <div style={{...styles.sheetBackdropRow, marginTop: 12}} />
      <div style={styles.sheetScrim} />
      <div style={{...styles.sheet, height: detent === 'medium' ? '55%' : 'calc(100% - 56px)'}}>
        <div style={styles.sheetGrabberZone}>
          <span style={styles.sheetGrabber} />
        </div>
        <div style={styles.sheetHeader}>
          <span />
          <span style={styles.sheetTitle}>{title}</span>
          <span style={styles.navTrailing}>
            <span style={styles.specIconSlot}>
              <Icon icon={XIcon} size="md" color="inherit" />
            </span>
          </span>
        </div>
        <div style={styles.sheetBody}>
          {/* Deterministic skeleton-convention widths: 60 / 45 / 70%. */}
          <div style={{...styles.placeholderBar, width: '60%'}} />
          <div style={{...styles.placeholderBar, width: '45%'}} />
          <div style={{...styles.placeholderBar, width: '70%'}} />
        </div>
      </div>
    </>
  );
}

function CoverSpec() {
  return (
    <div style={styles.cover}>
      <div style={styles.specBar}>
        <div style={styles.navLeading}>
          <div style={{...styles.specIconSlot, color: 'var(--color-text-primary)'}}>
            <Icon icon={XIcon} size="lg" color="inherit" />
          </div>
        </div>
        <div style={styles.specTitle}>{COVER_TITLE}</div>
        <div style={styles.navTrailing}>
          <div style={{...styles.specTextBtn, ...styles.specTextBtnStrong}}>Done</div>
        </div>
      </div>
      <div style={{padding: 16}}>
        <div style={styles.coverFieldLabel}>Title</div>
        <div style={styles.coverField} />
        <div style={{...styles.coverFieldLabel, marginTop: 16}}>Note</div>
        <div style={{...styles.coverField, height: 96}} />
      </div>
    </div>
  );
}

function LegendList({rows}: {rows: {name: string; value: string}[]}) {
  return (
    <div style={styles.legendCard}>
      {rows.map((row, index) => (
        <div key={row.name}>
          {index > 0 ? <div style={styles.rowDivider} /> : null}
          <div style={styles.legendRow}>
            <span style={styles.legendName}>{row.name}</span>
            <span style={styles.legendValue}>{row.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

// The quarantined brand literal flowed into --color-brand for the whole
// shell (custom property needs the CSSProperties cast).
const brandVar = {'--color-brand': BRAND} as CSSProperties;

interface GalleryState {
  // null = inherit the demo scheme; the navBar toggle writes an explicit
  // override so both themes are provable from inside the template.
  scheme: 'light' | 'dark' | null;
  segChoice: number;
  activeTab: string;
}

export default function MobileChromeGalleryTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 390px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');

  // ONE state owner — deliberately tiny because specimens are frozen by
  // default: {scheme, segChoice, activeTab} + one update(patch).
  const [gallery, setGallery] = useState<GalleryState>({scheme: null, segChoice: 0, activeTab: 'home'});
  const update = (patch: Partial<GalleryState>) => setGallery(prev => ({...prev, ...patch}));

  const effectiveScheme: 'light' | 'dark' = gallery.scheme ?? (systemDark ? 'dark' : 'light');

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...brandVar,
    ...(isDesktopColumn ? styles.shellDesktop : null),
    ...(gallery.scheme != null ? {colorScheme: gallery.scheme} : null),
  };

  const renderSpecimen = (spec: SpecimenDef): ReactNode => {
    switch (spec.id) {
      case 'nav-plain':
        return (
          <MiniStage frozen>
            <div style={styles.stageStack}>
              <NavBarSpec variant="plain" title={NAV_TITLES.plain} />
              <StageTag>Stress — title vs two fixed 44px slots</StageTag>
              <NavBarSpec variant="plain" title={STRESS.navTitle} />
            </div>
          </MiniStage>
        );
      case 'nav-large':
        return (
          <MiniStage frozen>
            <div style={styles.stageStack}>
              <StageTag>Expanded — no hairline yet</StageTag>
              <NavBarSpec variant="largeExpanded" title={NAV_TITLES.large} />
              <StageTag>Collapsed — hairline on</StageTag>
              <NavBarSpec variant="largeCollapsed" title={NAV_TITLES.large} />
              <StageTag>Stress — 28px/700 single-line ellipsis</StageTag>
              <NavBarSpec variant="largeExpanded" title={STRESS.largeTitle} />
            </div>
          </MiniStage>
        );
      case 'nav-search':
        return (
          <MiniStage frozen>
            <div style={styles.stageStack}>
              <NavBarSpec variant="search" title={NAV_TITLES.search} query={SEARCH_QUERY} />
              <StageTag>Stress — input ellipsis, fixed clear + Cancel</StageTag>
              <NavBarSpec variant="search" title={NAV_TITLES.search} query={STRESS.searchQuery} />
            </div>
          </MiniStage>
        );
      case 'nav-edit':
        return (
          <MiniStage frozen>
            <div style={styles.stageStack}>
              <NavBarSpec variant="edit" title={NAV_TITLES.edit} />
              <StageTag>Stress — tabular-nums center slot</StageTag>
              <NavBarSpec variant="edit" title={STRESS.editCount} />
            </div>
          </MiniStage>
        );
      case 'tab-five':
        return (
          <MiniStage frozen={false}>
            <div style={{paddingTop: 24}}>
              <TabBarSpec
                activeId={gallery.activeTab}
                live
                withBadges={false}
                onSelect={id => update({activeTab: id})}
              />
            </div>
          </MiniStage>
        );
      case 'tab-badges':
        return (
          <MiniStage frozen>
            <div style={{paddingTop: 24}}>
              <TabBarSpec activeId="home" live={false} withBadges />
            </div>
          </MiniStage>
        );
      case 'edit-toolbar':
        return (
          <MiniStage frozen>
            <StageTag>Enabled — selection ≥ 1</StageTag>
            <EditToolbarSpec enabled />
            <StageTag>Disabled — selection = 0</StageTag>
            <EditToolbarSpec enabled={false} />
          </MiniStage>
        );
      case 'seg-live':
        return (
          <MiniStage frozen={false}>
            <div style={styles.stagePad}>
              <SegmentedControl
                segments={SEGMENTS_3}
                value={gallery.segChoice}
                onChange={index => update({segChoice: index})}
                reducedMotion={reducedMotion}
                label="Filter notes"
              />
            </div>
          </MiniStage>
        );
      case 'seg-frozen':
        return (
          <MiniStage frozen>
            <div style={styles.stagePad}>
              <SegmentedFrozen />
            </div>
          </MiniStage>
        );
      case 'fab':
        return (
          <MiniStage frozen height={220}>
            <div style={{position: 'absolute', top: 16, right: 16}}>
              <FabSpec variant="extended" label={STRESS.fabLabel} />
            </div>
            <div style={{position: 'absolute', right: 16, bottom: 84}}>
              <FabSpec variant="extended" label={FAB_LABEL} />
            </div>
            <div style={{position: 'absolute', right: 16, bottom: 16}}>
              <FabSpec variant="standard" />
            </div>
            <div style={{position: 'absolute', left: 16, bottom: 16}}>
              <FabSpec variant="pressed" />
            </div>
          </MiniStage>
        );
      case 'footer-default':
        return (
          <MiniStage frozen>
            <div style={{paddingTop: 20}}>
              <StickyFooterSpec busy={false} label={CTA_LABEL} />
            </div>
            <StageTag>Stress — single-line ellipsis in 48px</StageTag>
            <StickyFooterSpec busy={false} label={STRESS.ctaLabel} />
          </MiniStage>
        );
      case 'footer-busy':
        return (
          <MiniStage frozen>
            <div style={{paddingTop: 20}}>
              <StickyFooterSpec busy label={CTA_LABEL} />
            </div>
          </MiniStage>
        );
      case 'sheet-medium':
        return (
          <MiniStage frozen height={320}>
            <SheetSpec detent="medium" title={SHEET_TITLE} />
          </MiniStage>
        );
      case 'sheet-large':
        return (
          <MiniStage frozen height={320}>
            <SheetSpec detent="large" title={STRESS.sheetTitle} />
          </MiniStage>
        );
      case 'cover':
        return (
          <MiniStage frozen height={320}>
            <CoverSpec />
          </MiniStage>
        );
      case 'legend-layers':
        return (
          <MiniStage frozen={false}>
            <LegendList rows={LAYER_LADDER} />
          </MiniStage>
        );
      case 'legend-motion':
        return (
          <MiniStage frozen={false}>
            <LegendList rows={MOTION_RULES} />
          </MiniStage>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={wrapRef} style={isDesktopColumn ? {...styles.wrap, ...styles.wrapDesktop} : styles.wrap}>
      <style>{KCG_CSS}</style>
      <div style={shellStyle}>
        <h1 className="kcg-vh">{APP} — mobile chrome gallery</h1>

        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <div style={styles.brandSlot} aria-hidden>
              <span style={styles.brandMark}>K</span>
            </div>
          </div>
          <div style={styles.navTitle}>Chrome Gallery</div>
          <div style={styles.navTrailing}>
            {/* LIVE theme switch — flips colorScheme on the shell so every
                light-dark() token proves both themes. */}
            <button
              type="button"
              role="switch"
              aria-checked={effectiveScheme === 'dark'}
              aria-label="Dark theme"
              className="kcg-btn kcg-focusable"
              style={styles.iconBtn}
              onClick={() => update({scheme: effectiveScheme === 'dark' ? 'light' : 'dark'})}>
              <Icon icon={effectiveScheme === 'dark' ? MoonIcon : SunIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <p style={styles.intro}>
            Every px in this file is the contract — {SPECIMENS.length} specimens across {SECTIONS.length} sections;
            the sun/moon toggle proves both themes on every frame.
          </p>

          {SECTIONS.map(section => (
            <section key={section.id} style={styles.sectionBlock}>
              <h2 style={styles.sectionHeader}>{section.title}</h2>
              <div style={styles.frameStack}>
                {SPECIMENS.filter(spec => spec.section === section.id).map(spec => (
                  <SpecimenFrame key={spec.id} spec={spec}>
                    {renderSpecimen(spec)}
                  </SpecimenFrame>
                ))}
              </div>
            </section>
          ))}

          <div style={styles.terminalCaption}>All {SPECIMENS.length} specimens</div>
        </main>
      </div>
    </div>
  );
}
