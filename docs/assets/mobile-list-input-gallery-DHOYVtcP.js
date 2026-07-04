var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — 26 contacts across exactly 10
 *   lettered sections (A B C D H K M R S T) for the A–Z scrubber; a
 *   ROW_TRIO ('Wi-Fi' utility · Maya Lindqvist standard · Quarterly review
 *   deck rich); 12 LOAD_ITEMS with visibleCount 4 and batch size 4; six
 *   filter CHIPS (['Design'] preselected, one 'Longest-chip stress label');
 *   3 search RECENTS incl. a 55-char query; 4 CAROUSEL cards (one 2-line
 *   clamp title); skeleton width cycles primary [60%,45%,70%] / secondary
 *   [40%,55%,30%]. No Date.now(), no Math.random(), no network media.
 * @output Astryx — Lists & Inputs Specimen Gallery: the mobile kit's
 *   visual contract for list rows and input controls on the 390px stage.
 *   A 52px navBar ('Lists & Inputs' h1 + 44×44 Sun/Moon theme toggle
 *   flipping colorScheme on the shell) over 13 specimen sections, each
 *   under a sticky h2 sectionHeader (top:52) and framed with 11px
 *   tabular-nums annotations citing exact px anatomy: S1 row anatomy
 *   (44/60/72), S2 frozen swipe-reveal at translateX(-152) with the 44×44
 *   ellipsis fallback, S3 live disclosure accordion, S4 a 320px nested
 *   scroller with the letter-•-letter indexScrubber rail (role='slider',
 *   drag HUD), S5 live load-more ('Show 4 more' → 'All 12 items'), S6
 *   true-/filtered-empty states, S7 60px-geometry skeletons + 2-up tiles
 *   with one shared shimmer, S8 row-as-switch (51×31 track), S9 96×32
 *   stepper with spinbutton value, S10 validate-on-blur email field, S11
 *   toggleable 32px chips, S12 frozen search focused-empty recents, S13
 *   CSS scroll-snap carousel. Live wiring announces load-more through the
 *   single polite toastDock.
 * @position Page template; emitted by \`astryx template mobile-list-input-gallery\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). No sheets/covers on this surface, so the
 *   shell never scroll-locks; the only overlays are the scrubber rail +
 *   HUD (absolute inside their nested scroller) and the toastDock.
 *   position:fixed is banned everywhere.
 * Container policy: every specimen sits in a SpecimenFrame (1px hairline,
 *   12px radius, body background, 16px padding) inside the 16px gutter;
 *   listCards inside frames are the standard inset-grouped card (12px
 *   radius, card surface, hairline rowDividers inset 16 / 68). No desktop
 *   Layout frames, no asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (#3E63DD Astryx blue) with BRAND_FILL_TEXT for text over
 *   brand fills (contrast math at each declaration); the sanctioned
 *   non-brand literals are the neutral swipe-action gray pair, the switch
 *   OFF track + white thumb pairs from the inputControls contract, and
 *   the shimmer highlight pair. Everything else is a token.
 * Density grid (MOBILE, repeated verbatim): 390px stage IS the viewport ·
 *   16px screen gutter · 12px card gaps · 24px section gaps · 8px chip
 *   gaps; navBar 52px sticky top z20 (paddingInline 8, grid '1fr auto
 *   1fr'); sectionHeaders 13/600 uppercase 0.06em, sticky top:52 z15 on
 *   the blur surface; rows exactly 44px utility / 60px standard (40px
 *   avatar) / 72px rich (48px r12 thumb); switch track 51×31, thumb 27,
 *   travel 20; stepper track 96×32; inputs 48px; chips 32px pills with
 *   44px hits; searchField 36px in a 52px searchBar; carousel cards
 *   280px; scrubber scroller 320px with a 20px rail; annotations 11/500;
 *   NO tabBar, so the toastDock rides sticky bottom:16 z30 (foundations
 *   amendment: sticky-in-flow, not shell-absolute, because the shell
 *   grows with content). TYPE (Figtree via --font-family-body): 17/600
 *   nav + empty titles · 16/400 row primary + inputs (16 is the floor) ·
 *   13/400 secondary · 11/500 annotations + swipe labels; nothing under
 *   11px; tabular-nums on every number that aligns. Touch: every live
 *   target ≥44×44 with ≥8px clearance; the scrubber rail is the sole
 *   merge-clause exception (one focusable slider).
 *
 * Responsive contract:
 * - Fluid 320–430px: frames and cards are fluid width; rows ellipsize
 *   their primary line before trailing meta compresses; the chip grid
 *   wraps at 8px gaps; carousel keeps 280px cards with next-card peek.
 *   overflowX:'clip' on shell is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as a
 *   centered 390px column (maxWidth 390, marginInline auto, borderInline
 *   hairline). No specimen geometry changes at any width: a specimen
 *   gallery that reflows stops being a contract. Sticky math (navBar
 *   top:0, sectionHeaders top:52) and the rail/HUD anchor to the shell
 *   and nested scroller, never the window.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  AlertCircleIcon,
  BellOffIcon,
  ChevronRightIcon,
  ClockIcon,
  FileTextIcon,
  ImageIcon,
  InboxIcon,
  MinusIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  SearchXIcon,
  SunIcon,
  Trash2Icon,
  WifiIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Astryx blue, spec hex #3E63DD). Light
// #3E63DD on #FFFFFF ≈ 5.2:1 (passes 4.5:1); dark side #8FA7F2 on the dark
// card (~#1C1C1E) ≈ 7.4:1.
const BRAND_ACCENT = 'light-dark(#3E63DD, #8FA7F2)';
// Text over a BRAND_ACCENT fill (selected chips, switch-ON track carries
// no text — thumb is white). Light: #FFFFFF on #3E63DD ≈ 5.2:1. Dark:
// white on #8FA7F2 fails (~2.2:1), so the dark side flips to near-black
// indigo — #10214F on #8FA7F2 ≈ 6.7:1. (Spec said '#FFFFFF text'; dark
// side deviates for contrast, math above.)
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #10214F)';
// Neutral swipe-action block (S2 'Mute'). White 11px/600 label: #FFFFFF on
// #6B7280 ≈ 4.9:1; on the darker #4B5563 ≈ 7.6:1 — both pass.
const NEUTRAL_ACTION = 'light-dark(#6B7280, #4B5563)';
// Switch OFF track — verbatim from the inputControls contract.
const SWITCH_OFF_TRACK = 'light-dark(rgba(21, 17, 12, 0.14), rgba(255, 255, 255, 0.22))';
// Switch thumb: #FFFFFF in BOTH schemes per contract, with its own shadow.
const SWITCH_THUMB = '#FFFFFF';
const SWITCH_THUMB_SHADOW = '0 1px 3px rgba(0, 0, 0, 0.25)';
// Shimmer sweep highlight over muted skeleton blocks (decorative only).
const SHIMMER_HIGHLIGHT = 'light-dark(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.07))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the always-on input
// focus ring (inputControls contract: inputs show focus ALWAYS, not just
// focus-visible), and the shared shimmer keyframes. All transitions animate
// transform/opacity only and collapse under prefers-reduced-motion; the
// shimmer is REMOVED entirely there (static muted blocks still encode
// loading).
// ---------------------------------------------------------------------------

const MLG_CSS = \`
.mlg-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.mlg-btn:disabled { cursor: default; }
.mlg-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.mlg-input {
  font: inherit;
  border: none;
  outline: none;
}
.mlg-input:focus { box-shadow: inset 0 0 0 2px \${BRAND_ACCENT}; }
.mlg-input-invalid { box-shadow: inset 0 0 0 2px var(--color-error); }
.mlg-input-invalid:focus { box-shadow: inset 0 0 0 2px var(--color-error); }
.mlg-anim { transition: transform 200ms ease, opacity 200ms ease; }
@keyframes mlg-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.mlg-shimmer {
  animation: mlg-shimmer 1.6s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .mlg-anim { transition: none; }
  .mlg-shimmer { display: none; }
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
  // Desktop stage ≥720px container width: centered 390px phone column.
  shellDesktop: {
    maxWidth: 390,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so the 44px toggle
  // optically aligns to the 16px gutter. Hairline + blur ALWAYS ON (no
  // scroll-under wiring on this surface; noted per contract).
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
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  intro: {
    margin: 0,
    padding: '12px 16px 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // Each specimen section: 24px space above; the h2 sticks at top:52
  // under the navBar on the same blur surface.
  section: {paddingTop: 24},
  sectionHeader: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    margin: 0,
    paddingInline: 16,
    paddingBlock: 8,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  // SpecimenFrame — 1px hairline, 12px radius, body background, 16px
  // padding, inside the 16px gutter; frames stack at 12px gaps.
  frame: {
    marginInline: 16,
    marginTop: 8,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    background: 'var(--color-background-body)',
    padding: 16,
  },
  frameStackGap: {marginTop: 12},
  // AnnotationLabel — 11px/500 secondary, tabular-nums, ONE line.
  annotation: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Inset-grouped listCard (inside frames the frame padding is the inset).
  listCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // S1 — the three canonical rows.
  row44: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  row60: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  row72: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowLeadIcon: {
    width: 28,
    height: 28,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  rowSpacer: {flex: 1, minWidth: 0},
  rowMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  rowChevron: {color: 'var(--color-text-secondary)', flexShrink: 0, display: 'inline-flex'},
  avatar40: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 600,
  },
  thumb48: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  rowTextStack: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // S2 — frozen swipe-reveal.
  swipeClip: {position: 'relative', overflow: 'hidden'},
  swipeActions: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
  },
  swipeBlock: {
    width: 76,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    color: '#FFFFFF', // white labels; contrast math at NEUTRAL_ACTION
  },
  swipeContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    transform: 'translateX(-152px)',
  },
  swipeContentRest: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
  },
  ellipsisBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
    marginInlineEnd: 8,
  },
  // S3 — disclosure.
  disclosureChevron: {
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
    display: 'inline-flex',
  },
  disclosureBody: {
    padding: '0 16px 12px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.45,
  },
  // S4 — scrubber list.
  scrubberViewport: {
    position: 'relative',
    height: 320,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    background: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  scrubberScroller: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
  },
  scrubberSectionHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    margin: 0,
    paddingInline: 16,
    paddingBlock: 4,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-background-muted)',
  },
  contactRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    paddingInlineEnd: 36, // 16 + 20 extra clear of the 20px rail
  },
  scrubberRail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    zIndex: 10,
    width: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'none',
    borderRadius: 10,
  },
  railGlyph: {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: '11.5px',
    color: BRAND_ACCENT,
  },
  railGlyphEmpty: {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: '11.5px',
    color: 'var(--color-text-secondary)',
  },
  scrubHud: {
    position: 'absolute',
    right: 36, // 16px left of the 20px rail
    zIndex: 11,
    width: 56,
    height: 56,
    marginTop: -28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 22,
    fontWeight: 700,
    pointerEvents: 'none',
  },
  // S5 — load more.
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // S6 — empty states.
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 64,
    height: 64,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  emptyBody: {
    marginTop: 4,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.45,
  },
  emptyAction: {
    marginTop: 16,
    height: 36,
    paddingInline: 16,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // S7 — skeletons.
  skeletonWrap: {position: 'relative', overflow: 'hidden', borderRadius: 12},
  skeletonRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
  },
  skeletonBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  skeletonTiles: {display: 'flex', gap: 12, marginTop: 12},
  skeletonTile: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonTileImage: {
    width: '100%',
    aspectRatio: '16 / 10',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  shimmerOverlay: {
    position: 'absolute',
    inset: 0,
    background: \`linear-gradient(90deg, transparent 20%, \${SHIMMER_HIGHLIGHT} 50%, transparent 80%)\`,
    pointerEvents: 'none',
  },
  // S8 — switch.
  switchTrack: {
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    position: 'relative',
  },
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: 999,
    background: SWITCH_THUMB,
    boxShadow: SWITCH_THUMB_SHADOW,
  },
  // S9 — stepper.
  stepperTrack: {
    width: 96,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
  },
  stepperHalf: {
    width: 48,
    // 44px hit extends past the 32px visual via negative block margins
    // inside the 44px row (contract: hits via the row's padding).
    height: 44,
    marginBlock: -6,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperHairline: {width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0},
  stepperValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 24,
    textAlign: 'right',
    borderRadius: 6,
  },
  // S10 — form field.
  formField: {display: 'flex', flexDirection: 'column'},
  fieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  fieldInput: {
    marginTop: 8,
    height: 48,
    width: '100%',
    background: 'var(--color-background-muted)',
    borderRadius: 12,
    paddingInline: 16,
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--color-text-primary)',
  },
  fieldError: {
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-error)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // S11 — chips.
  chipGrid: {display: 'flex', flexWrap: 'wrap', gap: 8},
  chip: {
    height: 32,
    // 44px hit via 6px transparent block padding around the 32px pill.
    boxSizing: 'content-box',
    paddingBlock: 6,
    marginBlock: -6,
    backgroundClip: 'content-box',
    paddingInline: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  chipInner: {
    height: 32,
    paddingInline: 14,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
  },
  // S12 — search recents (frozen).
  searchBar: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  searchField: {
    flex: 1,
    minWidth: 0,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  searchCancel: {
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_ACCENT,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  recentsHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
    marginTop: 12,
  },
  recentsHeader: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  recentsClear: {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    height: 44,
    display: 'grid',
    placeItems: 'center',
  },
  recentRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
  },
  recentQuery: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  recentX: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // S13 — snap carousel (full-bleed inside the section, not the frame).
  carousel: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    paddingInline: 16,
    paddingBottom: 4,
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    marginTop: 8,
  },
  carouselCard: {
    width: 280,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    background: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: 140,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  carouselBody: {padding: 16},
  carouselTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  carouselCaption: {marginTop: 4, fontSize: 13, color: 'var(--color-text-secondary)'},
  carouselAnnotation: {
    marginTop: 8,
    marginInline: 16,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // TOAST DOCK — the one polite live region. Foundations amendment:
  // sticky-in-flow (bottom:16, z30), NOT shell-absolute, because the shell
  // grows with content and absolute would pin to the document bottom.
  toastDock: {
    position: 'sticky',
    bottom: 16,
    zIndex: 30,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  terminalPad: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — module-level consts, fully deterministic, zero Math.random.
// ---------------------------------------------------------------------------

// S1 ROW_TRIO. The standard row's primary is the single-line ellipsis
// stress ('Katarzyna Wojciechowska-Brzęczyszczykiewicz' — meta + chevron
// never compress).
const ROW_TRIO = {
  utility: {label: 'Wi-Fi', meta: 'Larkfield 5G'},
  standard: {
    initials: 'KW',
    primary: 'Katarzyna Wojciechowska-Brzęczyszczykiewicz',
    secondary: 'Sent a photo · 2m',
    meta: '2m',
  },
  rich: {
    primary: 'Quarterly review deck',
    secondary: 'Edited by Priya · 4.2 MB · Yesterday',
    tertiary: 'Shared with Design Crit · 8 people',
  },
};

// S4 CONTACTS — 26 people across exactly 10 lettered sections (satisfies
// the 8+ section scrubber precondition). Counts: A3 B3 C3 D2 H3 K2 M3 R2
// S3 T2 = 26 ✓. Several rows carry trailing 'Wed 11:58 PM'-shaped meta —
// the +20px paddingRight stress keeping meta clear of the 20px rail.
interface Contact {
  id: string;
  name: string;
  meta: string | null;
}

const CONTACT_SECTIONS: Array<{letter: string; contacts: Contact[]}> = [
  {
    letter: 'A',
    contacts: [
      {id: 'ct_ada', name: 'Ada Okafor', meta: 'Wed 11:58 PM'},
      {id: 'ct_amir', name: 'Amir Haddad', meta: null},
      {id: 'ct_ayla', name: 'Ayla Reyes', meta: 'Tue 9:14 AM'},
    ],
  },
  {
    letter: 'B',
    contacts: [
      {id: 'ct_bea', name: 'Bea Cortez', meta: null},
      {id: 'ct_ben', name: 'Ben Ilves', meta: 'Mon 6:02 PM'},
      {id: 'ct_bruna', name: 'Bruna Sato', meta: null},
    ],
  },
  {
    letter: 'C',
    contacts: [
      {id: 'ct_cal', name: 'Cal Whitfield', meta: null},
      {id: 'ct_carmen', name: 'Carmen Diaz', meta: 'Sun 8:40 AM'},
      {id: 'ct_cyrus', name: 'Cyrus Vann', meta: null},
    ],
  },
  {
    letter: 'D',
    contacts: [
      {id: 'ct_dana', name: 'Dana Petrov', meta: null},
      {id: 'ct_dev', name: 'Dev Anand', meta: 'Sat 2:26 PM'},
    ],
  },
  {
    letter: 'H',
    contacts: [
      {id: 'ct_hana', name: 'Hana Yoshida', meta: null},
      {id: 'ct_harlan', name: 'Harlan Pike', meta: null},
      {id: 'ct_hugo', name: 'Hugo Braun', meta: 'Fri 7:31 PM'},
    ],
  },
  {
    letter: 'K',
    contacts: [
      {id: 'ct_kai', name: 'Kai Mercer', meta: null},
      {id: 'ct_kira', name: 'Kira Salo', meta: null},
    ],
  },
  {
    letter: 'M',
    contacts: [
      {id: 'ct_mabel', name: 'Mabel Toro', meta: 'Thu 10:07 AM'},
      {id: 'ct_marcus', name: 'Marcus Lee', meta: null},
      {id: 'ct_mina', name: 'Mina Farrokh', meta: null},
    ],
  },
  {
    letter: 'R',
    contacts: [
      {id: 'ct_rene', name: 'René Aubert', meta: null},
      {id: 'ct_rosa', name: 'Rosa Lindgren', meta: 'Wed 4:45 PM'},
    ],
  },
  {
    letter: 'S',
    contacts: [
      {id: 'ct_saanvi', name: 'Saanvi Rao', meta: null},
      {id: 'ct_sefa', name: 'Sefa Demir', meta: null},
      {id: 'ct_signe', name: 'Signe Holm', meta: 'Tue 1:19 PM'},
    ],
  },
  {
    letter: 'T',
    contacts: [
      {id: 'ct_tao', name: 'Tao Zheng', meta: null},
      {id: 'ct_tessa', name: 'Tessa Marsh', meta: null},
    ],
  },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const POPULATED_LETTERS = CONTACT_SECTIONS.map(section => section.letter);
// Cross-check: contacts total 3+3+3+2+3+2+3+2+3+2 = 26; sections = 10 ✓.
const CONTACT_TOTAL = CONTACT_SECTIONS.reduce((sum, section) => sum + section.contacts.length, 0); // 26

// S5 LOAD_ITEMS — 12 rows; visibleCount starts 4, batch 4 → exactly two
// presses reach 'All 12 items'.
interface LoadItem {
  id: string;
  primary: string;
  secondary: string;
}

const LOAD_ITEMS: LoadItem[] = [
  {id: 'ld_01', primary: 'Sync meeting notes', secondary: 'Edited 5m ago · Notes'},
  {id: 'ld_02', primary: 'Roadmap H2 draft', secondary: 'Edited 22m ago · Docs'},
  {id: 'ld_03', primary: 'Interview loop feedback', secondary: 'Edited 1h ago · Hiring'},
  {id: 'ld_04', primary: 'Launch checklist', secondary: 'Edited 2h ago · Ops'},
  {id: 'ld_05', primary: 'Pricing experiment recap', secondary: 'Edited 3h ago · Growth'},
  {id: 'ld_06', primary: 'Support macros audit', secondary: 'Edited 4h ago · Support'},
  {id: 'ld_07', primary: 'Design tokens changelog', secondary: 'Edited 5h ago · Design'},
  {id: 'ld_08', primary: 'On-call handoff', secondary: 'Edited 6h ago · Infra'},
  {id: 'ld_09', primary: 'Brand voice guide', secondary: 'Edited Yesterday · Marketing'},
  {id: 'ld_10', primary: 'Sprint 41 retro', secondary: 'Edited Yesterday · Eng'},
  {id: 'ld_11', primary: 'Legal review queue', secondary: 'Edited Tuesday · Legal'},
  {id: 'ld_12', primary: 'Offsite agenda', secondary: 'Edited Monday · People'},
];
const LOAD_BATCH = 4;

// S11 CHIPS — ['Design'] preselected; one deliberate long-label stress.
const CHIP_LABELS = [
  'Design',
  'Engineering',
  'Research',
  'Ops',
  'Longest-chip stress label',
  'Legal',
];

// S12 RECENTS — the middle query is the 55-char ellipsis-before-X stress.
const RECENT_QUERIES = [
  'figtree type scale',
  'quarterly retro action items from the offsite whiteboard',
  'sticky header blur',
];

// S13 CAROUSEL — 4 cards; the second title is the 2-line clamp case.
const CAROUSEL_CARDS = [
  {id: 'cr_01', title: 'Inset-grouped lists', caption: '16px gutter · 12px radius'},
  {
    id: 'cr_02',
    title: 'Why every gesture ships with a visible button path on this kit',
    caption: '2-line clamp stress',
  },
  {id: 'cr_03', title: 'Touch target law', caption: '44×44 minimum · 8px clearance'},
  {id: 'cr_04', title: 'Thumb-zone rules', caption: 'Primary verb in the bottom third'},
];

// S7 SKELETON_WIDTHS — deterministic cycles, cited in the annotation.
const SKELETON_PRIMARY_WIDTHS = [0.6, 0.45, 0.7];
const SKELETON_SECONDARY_WIDTHS = [0.4, 0.55, 0.3];
const SKELETON_TILE_WIDTHS = [0.7, 0.45];

// S10 email validation — simple deterministic shape check, on blur only.
const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

// ---------------------------------------------------------------------------
// ONE STATE OWNER — a single flat gallery-state object in App; every live
// specimen reads and writes it through setG functional updates. Frozen
// specimens hold NO state.
// ---------------------------------------------------------------------------

interface GalleryState {
  dark: boolean;
  switchOn: boolean;
  stepperVal: number;
  email: string;
  emailError: string | null;
  chips: string[];
  expandedId: string | null;
  visibleCount: number;
  hudLetter: string | null;
  hudY: number;
  railLetter: string;
  toast: string | null;
}

const INITIAL_STATE: GalleryState = {
  dark: false,
  switchOn: true,
  stepperVal: 2,
  email: '',
  emailError: null,
  chips: ['Design'],
  expandedId: null,
  visibleCount: 4,
  hudLetter: null,
  hudY: 0,
  railLetter: 'A',
  toast: null,
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

// ---------------------------------------------------------------------------
// GALLERY SCAFFOLD — SpecimenFrame + AnnotationLabel + section shell.
// ---------------------------------------------------------------------------

interface SpecimenFrameProps {
  children: ReactNode;
  annotations: string[];
  stacked?: boolean;
}

/** Bordered radius-12 frame, 16px padding, annotations under the specimen. */
function SpecimenFrame({children, annotations, stacked = false}: SpecimenFrameProps) {
  return (
    <div style={{...styles.frame, ...(stacked ? styles.frameStackGap : null)}}>
      {children}
      {annotations.map(text => (
        <div key={text} style={styles.annotation}>
          {text}
        </div>
      ))}
    </div>
  );
}

interface GallerySectionProps {
  title: string;
  children: ReactNode;
}

/** Specimen section: 24px space above, sticky h2 at top:52 under navBar. */
function GallerySection({title, children}: GallerySectionProps) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionHeader}>{title}</h2>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// S1 — ROW ANATOMY: the three canonical rows with every optional segment.
// Real (idle) buttons: rows ARE buttons in the kit, and these demonstrate
// the resting affordance.
// ---------------------------------------------------------------------------

function RowAnatomySpecimen() {
  return (
    <SpecimenFrame
      annotations={[
        'utility 44 · label 16/400 · meta 13/400 · chevron 16',
        'standard 60 · avatar 40 · gap 12 · primary 16/500 ellipsis',
        'rich 72 · thumb 48 r12 · 3 lines · divider inset 68',
      ]}>
      <div style={styles.listCard}>
        <button type="button" className="mlg-btn mlg-focusable" style={styles.row44} aria-label="Wi-Fi, Larkfield 5G">
          <span style={styles.rowLabel}>{ROW_TRIO.utility.label}</span>
          <span style={styles.rowSpacer} />
          <span style={styles.rowMeta}>{ROW_TRIO.utility.meta}</span>
          <span style={styles.rowChevron}>
            <ChevronRightIcon size={16} aria-hidden />
          </span>
        </button>
        <div style={styles.rowDivider} />
        <button
          type="button"
          className="mlg-btn mlg-focusable"
          style={styles.row60}
          aria-label={ROW_TRIO.standard.primary}>
          <span style={styles.avatar40} aria-hidden>
            {ROW_TRIO.standard.initials}
          </span>
          <span style={styles.rowTextStack}>
            <span style={styles.rowPrimary}>{ROW_TRIO.standard.primary}</span>
            <span style={styles.rowSecondary}>{ROW_TRIO.standard.secondary}</span>
          </span>
          <span style={styles.rowMeta}>{ROW_TRIO.standard.meta}</span>
        </button>
        <div style={styles.rowDividerDeep} />
        <button
          type="button"
          className="mlg-btn mlg-focusable"
          style={styles.row72}
          aria-label={ROW_TRIO.rich.primary}>
          <span style={styles.thumb48} aria-hidden>
            <Icon icon={FileTextIcon} size="lg" color="inherit" />
          </span>
          <span style={styles.rowTextStack}>
            <span style={styles.rowPrimary}>{ROW_TRIO.rich.primary}</span>
            <span style={styles.rowSecondary}>{ROW_TRIO.rich.secondary}</span>
            <span style={styles.rowSecondary}>{ROW_TRIO.rich.tertiary}</span>
          </span>
          <span style={styles.rowChevron}>
            <ChevronRightIcon size={16} aria-hidden />
          </span>
        </button>
      </div>
    </SpecimenFrame>
  );
}

// ---------------------------------------------------------------------------
// S2 — SWIPE-REVEAL (FROZEN): content at translateX(-152) exposing 2×76px
// action blocks (destructive LAST). Blocks are inert divs — a frozen
// picture must not lie to the accessibility tree. Below it, the mandatory
// ellipsis fallback row at rest (real-but-idle 44×44 button).
// ---------------------------------------------------------------------------

function SwipeRevealSpecimen() {
  return (
    <SpecimenFrame
      annotations={[
        'open −152 = 2×76 blocks · destructive LAST · frozen',
        'ellipsis fallback → anchored menu, same verbs (frozen)',
      ]}>
      <div style={styles.listCard} aria-label="Swipe-reveal specimen, frozen open state">
        <div style={styles.swipeClip}>
          <div style={styles.swipeActions} aria-hidden>
            <div style={{...styles.swipeBlock, background: NEUTRAL_ACTION}}>
              <BellOffIcon size={20} aria-hidden />
              Mute
            </div>
            <div style={{...styles.swipeBlock, background: 'var(--color-error)'}}>
              <Trash2Icon size={20} aria-hidden />
              Delete
            </div>
          </div>
          <div style={styles.swipeContent}>
            <div style={{...styles.row60, flex: 1, minWidth: 0}}>
              <span style={styles.avatar40} aria-hidden>
                JH
              </span>
              <span style={styles.rowTextStack}>
                <span style={styles.rowPrimary}>Jonas Hale</span>
                <span style={styles.rowSecondary}>Re: standup notes · 9m</span>
              </span>
            </div>
          </div>
        </div>
        <div style={styles.rowDividerDeep} />
        <div style={styles.swipeContentRest}>
          <div style={{...styles.row60, flex: 1, minWidth: 0, paddingInlineEnd: 0}}>
            <span style={styles.avatar40} aria-hidden>
              LP
            </span>
            <span style={styles.rowTextStack}>
              <span style={styles.rowPrimary}>Lena Prieto</span>
              <span style={styles.rowSecondary}>Draft shared · 24m</span>
            </span>
          </div>
          <button
            type="button"
            className="mlg-btn mlg-focusable"
            style={styles.ellipsisBtn}
            aria-label="Message actions for Lena Prieto (specimen)">
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
      </div>
    </SpecimenFrame>
  );
}

// ---------------------------------------------------------------------------
// S6 — EMPTY STATES (FROZEN): true-empty and filtered-empty, exact
// emptyAndSkeleton anatomy (64 circle · 28 icon · 17/600 title · 13/400
// body · ONE action). Actions are real-but-idle buttons.
// ---------------------------------------------------------------------------

function EmptyStatesSpecimen() {
  return (
    <>
      <SpecimenFrame annotations={['true-empty · circle 64 · icon 28 · one 36px action']}>
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <InboxIcon size={28} aria-hidden />
          </span>
          <div style={styles.emptyTitle}>No messages</div>
          <div style={styles.emptyBody}>Conversations you start appear here.</div>
          <button type="button" className="mlg-btn mlg-focusable" style={styles.emptyAction}>
            New message
          </button>
        </div>
      </SpecimenFrame>
      <SpecimenFrame
        stacked
        annotations={['filtered-empty · echoes “xq” verbatim · action clears filter']}>
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <SearchXIcon size={28} aria-hidden />
          </span>
          <div style={styles.emptyTitle}>No results for “xq”</div>
          <div style={styles.emptyBody}>Check the spelling or clear the search to see all notes.</div>
          <button type="button" className="mlg-btn mlg-focusable" style={styles.emptyAction}>
            Clear search
          </button>
        </div>
      </SpecimenFrame>
    </>
  );
}

// ---------------------------------------------------------------------------
// S7 — SKELETONS (FROZEN): 3 skeletonRows at exact 60px geometry + a 2-up
// tile pair, deterministic width cycles, ONE shared shimmer overlay
// (removed entirely under prefers-reduced-motion). aria-busy container,
// every block aria-hidden.
// ---------------------------------------------------------------------------

function SkeletonSpecimen() {
  return (
    <SpecimenFrame
      annotations={[
        'row 60 · circle 40 · bars 12 r6 · zero layout shift vs 60px row',
        'widths 60/45/70 primary · 40/55/30 secondary · no random',
      ]}>
      <div style={styles.skeletonWrap} aria-busy="true">
        <div style={styles.listCard}>
          {SKELETON_PRIMARY_WIDTHS.map((primaryWidth, index) => (
            <div key={\`sk-\${index}\`}>
              {index > 0 ? <div style={styles.rowDividerDeep} aria-hidden /> : null}
              <div style={styles.skeletonRow} aria-hidden="true">
                <span style={styles.skeletonCircle} />
                <span style={styles.skeletonBars}>
                  <span style={{...styles.skeletonBar, width: \`\${primaryWidth * 100}%\`}} />
                  <span
                    style={{
                      ...styles.skeletonBar,
                      width: \`\${SKELETON_SECONDARY_WIDTHS[index] * 100}%\`,
                    }}
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.skeletonTiles} aria-hidden="true">
          {SKELETON_TILE_WIDTHS.map((barWidth, index) => (
            <div key={\`tile-\${index}\`} style={styles.skeletonTile}>
              <span style={styles.skeletonTileImage} />
              <span style={{...styles.skeletonBar, width: \`\${barWidth * 100}%\`}} />
            </div>
          ))}
        </div>
        {/* ONE shared 1.6s sweep over rows AND tiles; display:none under
            reduced motion — the static muted blocks still read 'loading'. */}
        <div className="mlg-shimmer" style={styles.shimmerOverlay} aria-hidden="true" />
      </div>
    </SpecimenFrame>
  );
}

// ---------------------------------------------------------------------------
// S12 — SEARCH RECENTS (FROZEN): the searchFlow FOCUSED-EMPTY composition.
// Everything here is an inert div (frozen picture; the annotation says so
// in visible text) — searchBar 52, searchField 36, Cancel 17/400 brand,
// 'Recent' header + Clear, three 44px recent rows with ClockIcon and X.
// ---------------------------------------------------------------------------

function SearchRecentsSpecimen() {
  return (
    <SpecimenFrame
      annotations={[
        'focused-empty state, frozen · field 36 in 52 bar · Cancel 17/400',
        'recent 44 · clock 20 · X hit 44×44 · long query ellipsizes',
      ]}>
      <div aria-label="Search focused-empty specimen, frozen">
        <div style={{...styles.searchBar, paddingInline: 0}}>
          <div style={styles.searchField}>
            <SearchIcon size={16} aria-hidden style={{color: 'var(--color-text-secondary)', flexShrink: 0}} />
            <span style={styles.searchPlaceholder}>Search notes</span>
          </div>
          <div style={styles.searchCancel}>Cancel</div>
        </div>
        <div style={{...styles.recentsHeaderRow, paddingInline: 0}}>
          <div style={styles.recentsHeader}>Recent</div>
          <div style={styles.recentsClear}>Clear</div>
        </div>
        <div style={{...styles.listCard, marginTop: 4}}>
          {RECENT_QUERIES.map((query, index) => (
            <div key={query}>
              {index > 0 ? <div style={styles.rowDivider} aria-hidden /> : null}
              <div style={styles.recentRow}>
                <ClockIcon
                  size={20}
                  aria-hidden
                  style={{color: 'var(--color-text-secondary)', flexShrink: 0}}
                />
                <span style={styles.recentQuery}>{query}</span>
                <span style={styles.recentX}>
                  <XIcon size={16} aria-hidden />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SpecimenFrame>
  );
}
`;export{e as default};