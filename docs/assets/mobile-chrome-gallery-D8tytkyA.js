var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

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
 * @position Page template; emitted by \`astryx template mobile-chrome-gallery\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
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
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND} 12%, transparent)\`;
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

const KCG_CSS = \`
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
\`;

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
    border: \`2px solid color-mix(in srgb, \${BRAND_FILL_TEXT} 30%, transparent)\`,
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
`;export{e as default};