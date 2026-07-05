// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Twofold caption workbench for
 *   twofold.studio: FOUR drafts (2 lab + 1 ready + 1 published = 4,
 *   cross-checked in the Drafts list), each with a Variant A and Variant B
 *   three-line caption (hook / body / CTA). Focused draft d1 'Sunrise drop
 *   teaser': hook A scores 40+28+8 = 76, hook B 40+12+16 = 68, delta +8 A;
 *   tokenizeDiff(A,B) genuinely yields zone spans HOOK 2/1 · BODY 3/4 ·
 *   CTA 1/1 (A-only 2+3+1 = 6, B-only 1+4+1 = 6, diverging 12) and 19
 *   shared words (3+12+4) — all verified by construction in the fixture
 *   comments. Exactly 6 seeded history events (3 swaps + 2 edits + 1
 *   publish). No Date.now(), no Math.random(), no network media.
 * @output Twofold — Caption A/B Lab: a 390px MOBILE creator workbench for
 *   A/B-testing post captions. NavBar (split-T Twofold mark · draft title ·
 *   'A primary' amber chip) over a sticky previewDock whose 236px
 *   VariantCrossfadePreview physically morphs the caption between Variant A
 *   and B via a draggable 28px crossfade handle (role=slider, A/B endcap
 *   buttons as the non-gesture path), twin HookScoreGauge semicircles that
 *   tilt opacity against each other as the handle drags and re-score per
 *   keystroke from the editor sheet, a zone-tagged WordDiffRail
 *   (HOOK/BODY/CTA tick lanes), variant cards with a travelling CrownBadge,
 *   and a Signals card. Releasing the handle past 0.6 commits the other
 *   variant as primary and the flag ripples everywhere it is DERIVED:
 *   navBar chip, crown, Drafts row snippet, Publish 'ships: Variant B'
 *   chip, and a new History event ('All 6 events' → 'All 7 events'), all
 *   reversible through the single Undo toast.
 * @position Page template; emitted by `astryx template mobile-caption-ab-lab`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet) are position:'absolute' INSIDE
 *   shell; position:fixed is banned. While the editor sheet is open, shell
 *   locks to {height:'100dvh', overflow:'hidden'} and the toastDock swaps
 *   from sticky-in-flow to shell-absolute; both restore on close. The
 *   stage clips to --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Twofold amber #F59E0B family — the demo's --color-brand
 *   is the demo logo blue, so the spec hue is quarantined here per house
 *   rule); sanctioned companions with contrast math at each declaration:
 *   BRAND_FILL + BRAND_FILL_TEXT (publish button), the amber chip pair,
 *   and the slate Variant-B pair. Hairline: always-on (this template does
 *   not wire scroll-under).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr'); previewDock sticky top 52 z15;
 *   preview card 236px = 48 author row + 96 caption stage + 44 crossfade
 *   rail + 36 WordDiffRail + 12 internal padding; gauge cards 112px;
 *   variant-card footer 36px; rows 44px signals/publish · 60px history ·
 *   72px drafts media (48px thumb, 12px radius); sectionHeader 13px/600
 *   uppercase 0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px
 *   bottom; tabBar exactly 64px sticky bottom z20 (4 tabItems, 24px icon
 *   over 11px/500 label, 4px gap); toastDock sticky bottom 76 z30
 *   (absolute only while the sheet locks the shell); sheet detents 55%
 *   medium / calc(100% − 56px) large, 24px grabber zone with 36×5 pill,
 *   52px sheet header. TYPE (Figtree via --font-family-body): 28/700
 *   large titles · 22/700 gauge scores · 17/600 nav + sheet titles ·
 *   16/400–500 body & rows · 13/400 secondary · 11/500 overlines, tab
 *   labels, chips; nothing under 11px; tabular-nums on every updating
 *   numeral. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   into a full-row button; the crossfade drag has THREE button paths
 *   (A/B endcaps, slider arrow keys, 'Set as primary' buttons).
 *
 * Responsive contract:
 * - Fluid 320–430px: all widths percentage/flex; the 96px caption stage
 *   clamps at every width (the merged token stream is its own sizer — see
 *   VariantCrossfadePreview); gaugeRow = two flex:1 cards, 12px gap (at
 *   320px each is (320−32−12)/2 = 138px; 72px arc + numeral fit in
 *   138−16 = 122px); WordDiffRail zones minWidth 64×3 + gaps < 288px
 *   content width at 320; endcaps stay 44×44 with the track flexing
 *   between them; tabBar items are 80px each at 320. overflowX:'clip' on
 *   shell is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell becomes
 *   a centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the workbench is deliberately phone
 *   geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  CrownIcon,
  FileTextIcon,
  FlaskConicalIcon,
  HistoryIcon,
  ImageIcon,
  PencilIcon,
  SendIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Twofold amber) — brand TEXT/ICON/tick pair.
// #B45309 on #FFFFFF = 5.1:1 (passes 4.5:1 text and 3:1 boundary); #FCD34D
// on the dark card (~#1C1917) ≈ 9.4:1. A-only diff ticks use this pair.
const BRAND_ACCENT = 'light-dark(#B45309, #FCD34D)';
// Brand FILL for the publish button and crossfade handle track end — the
// raw spec hex in both schemes. Never white text on it:
const BRAND_FILL = 'light-dark(#F59E0B, #F59E0B)';
// Text over BRAND_FILL: #451A03 on #F59E0B ≈ 7.0:1 (both schemes).
const BRAND_FILL_TEXT = '#451A03';
// Amber status/crown/ships chip pair: #92400E on #FEF3C7 = 6.9:1 (light);
// #FCD34D on the 18% amber-over-dark-card mix ≈ 9:1 (dark).
const CHIP_BG = 'light-dark(#FEF3C7, rgba(245, 158, 11, 0.18))';
const CHIP_TEXT = 'light-dark(#92400E, #FCD34D)';
// Slate Variant-B pair (B-only ticks, gauge-B arc, B endcap): #475569 on
// the #FFFFFF card = 7.8:1; #94A3B8 on the dark card ≈ 3.4:1 — the ticks
// and arc are non-text (3:1 threshold ✓); as 13px text it only appears on
// light where 7.8:1 passes, dark text uses the same pair at ≈ 5.9:1 vs
// #1C1917.
const SLATE_ACCENT = 'light-dark(#475569, #94A3B8)';
// Brand-tinted washes (avatar block, focused chips).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Four fixed thumbnail gradient pairs, picked by draft.thumbSeed — muted,
// decorative (aria-hidden), never photographic.
const THUMB_GRADIENTS = [
  'linear-gradient(135deg, light-dark(#FDE68A, #78350F), light-dark(#FDBA74, #7C2D12))',
  'linear-gradient(135deg, light-dark(#BAE6FD, #0C4A6E), light-dark(#C7D2FE, #312E81))',
  'linear-gradient(135deg, light-dark(#D9F99D, #365314), light-dark(#A7F3D0, #064E3B))',
  'linear-gradient(135deg, light-dark(#FBCFE8, #831843), light-dark(#DDD6FE, #4C1D95))',
];

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, the always-on textarea focus ring,
// the visually-hidden text, and the reduced-motion guard. Transitions
// animate transform/opacity only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const TWOFOLD_CSS = `
.tfl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tfl-btn:disabled { cursor: default; }
.tfl-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.tfl-anim { transition: transform 240ms ease, opacity 240ms ease; }
.tfl-fade { transition: opacity 200ms ease, transform 200ms ease; }
@keyframes tfl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.tfl-sheet-in { animation: tfl-sheet-in 240ms ease; }
.tfl-textarea:focus { box-shadow: inset 0 0 0 2px ${BRAND_ACCENT}; outline: none; }
.tfl-vh {
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
  .tfl-anim, .tfl-fade { transition: none; }
  .tfl-sheet-in { animation: none; }
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
  // Scroll lock while the editor sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline ALWAYS ON.
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
  navTrailing: {display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingInlineEnd: 8},
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  navTitle: {
    margin: 0,
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 24px status chip pill — amber pair (#92400E on #FEF3C7 = 6.9:1).
  statusChip: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: CHIP_BG,
    color: CHIP_TEXT,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0},
  // PREVIEW DOCK — sticky below the navBar so the morphing preview stays
  // on screen while the workbench scrolls.
  previewDock: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    background: 'var(--color-background-body)',
    paddingInline: 16,
    paddingBlock: 12,
  },
  // 236px = 48 author + 96 stage + 44 rail + 36 diff rail + 12 padding.
  previewCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    paddingBottom: 12,
    overflow: 'hidden',
  },
  authorRow: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  authorName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  authorMeta: {fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0},
  // 96px caption stage — fixed height, 4-line clamp by geometry (4 × 22px
  // line + 8px top pad), overflow fades under a 24px mask.
  captionStage: {
    position: 'relative',
    height: 96,
    overflow: 'hidden',
    paddingInline: 12,
    fontSize: 16,
    fontWeight: 400,
    lineHeight: '22px',
  },
  fadeMask: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    height: 24,
    background: 'linear-gradient(to bottom, transparent, var(--color-background-card))',
    pointerEvents: 'none',
  },
  token: {display: 'inline-block', marginRight: '0.28em', willChange: 'opacity, transform'},
  // 44px crossfade rail — A/B endcaps are 44×44 real buttons, the track
  // flexes between them, the 28px handle rides a 4px gradient line.
  railRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 4,
  },
  endcapBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
  },
  trackZone: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    height: 44,
    touchAction: 'none',
    cursor: 'pointer',
    borderRadius: 8,
  },
  // 4px track line, amber (A side) → slate (B side); both ends ≥3:1 vs the
  // card (#B45309 5.1:1 / #475569 7.8:1 light; #FCD34D 9.4:1 / #94A3B8
  // 3.4:1 dark) — position encodes side, never color alone.
  trackLine: {
    position: 'absolute',
    top: '50%',
    left: 6,
    right: 6,
    height: 4,
    marginTop: -2,
    borderRadius: 999,
    background: `linear-gradient(90deg, ${BRAND_ACCENT}, ${SLATE_ACCENT})`,
    pointerEvents: 'none',
  },
  // 28px handle — BRAND_ACCENT fill (5.1:1 / 9.4:1 vs card, ≥3:1 boundary)
  // with a 2px card-color ring.
  handle: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    border: '2px solid var(--color-background-card)',
    boxShadow: '0 1px 4px var(--color-shadow)',
    pointerEvents: 'none',
  },
  // WORD DIFF RAIL — 36px: zone overline over an 8px tick lane.
  diffRail: {
    display: 'flex',
    gap: 8,
    height: 36,
    paddingInline: 12,
    alignItems: 'stretch',
  },
  diffZoneSeg: {
    minWidth: 64,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 5,
  },
  diffZoneLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  tickLane: {
    height: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    borderRadius: 2,
  },
  tick: {width: 2, height: 8, borderRadius: 1, flexShrink: 0},
  tickSpacer: {flex: 1},
  diffQuiet: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // GAUGE ROW — two flex:1 112px cards, 12px gap.
  gaugeRow: {
    display: 'flex',
    gap: 12,
    paddingInline: 16,
    marginTop: 12,
  },
  gaugeCard: {
    flex: 1,
    minWidth: 0,
    height: 112,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 8,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  gaugeOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  gaugeArcBox: {position: 'relative', width: 72, height: 44},
  gaugeNumeral: {
    position: 'absolute',
    insetInline: 0,
    bottom: -2,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  gaugeBreakdown: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    marginTop: 2,
  },
  // Inset-grouped listCard + section header (32 = 16 gutter + 16 card pad).
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // VARIANT CARDS — listCard-per-card stack, 12px gap.
  variantStack: {display: 'flex', flexDirection: 'column', gap: 12, marginInline: 16},
  variantCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  variantOverline: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  variantText: {
    minHeight: 60,
    fontSize: 16,
    lineHeight: '22px',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },
  variantFooter: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  crownChip: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 8,
    borderRadius: 999,
    background: CHIP_BG,
    color: CHIP_TEXT,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  footerSpacer: {flex: 1},
  setPrimaryBtn: {
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  setPrimaryBtnDisabled: {color: 'var(--color-text-secondary)', opacity: 0.6},
  pencilBtn: {
    width: 44,
    height: 44,
    marginRight: -8,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // SIGNALS — 44px utility rows.
  signalRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  signalLabel: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  signalValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  spacer24: {height: 24},
  // LARGE TITLE — 52px row below the navBar.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {margin: 0, fontSize: 28, fontWeight: 700},
  // DRAFTS — 72px media rows.
  draftRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  draftThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  draftText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  draftTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  draftSnippet: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  draftStatus: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // HISTORY — full-bleed 60px two-line rows with a 24px dot column.
  historyRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  historyDotCol: {
    width: 24,
    alignSelf: 'stretch',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  historyDot: {width: 8, height: 8, borderRadius: '50%'},
  historyText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  historyPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  historySecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  historyDividerFull: {height: 1, background: 'var(--color-border)'},
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // PUBLISH — 44px rows + ships chip; the CTA is the last in-flow block
  // (sticky-above-tabBar footers are illegal; tabBar stays the bottom
  // chrome).
  publishRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  publishTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  publishStatus: {fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0},
  shipsChip: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: CHIP_BG,
    color: CHIP_TEXT,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  publishBtn: {
    margin: 16,
    height: 48,
    borderRadius: 12,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  publishBtnDisabled: {background: 'var(--color-background-muted)', color: 'var(--color-text-secondary)'},
  // TAB BAR — exactly 64px, sticky bottom z20.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
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
  tabLabelActive: {fontWeight: 600},
  // TOAST DOCK — sticky-in-flow above the tabBar (bottom 76 = 64 + 12);
  // shell-absolute ONLY while the sheet scroll-locks the shell (z45 above
  // the scrim so sheet-born toasts stay visible).
  toastDockSticky: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockAbsolute: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 45,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    minHeight: 48,
    maxWidth: '100%',
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
  toastText: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // EDITOR SHEET — scrim z40 + sheet z41, absolute inside shell.
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
  sheetTitle: {margin: 0, fontSize: 17, fontWeight: 600, textAlign: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // The one legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  fieldLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: 8,
  },
  textarea: {
    width: '100%',
    minHeight: 120,
    resize: 'vertical',
    border: 'none',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    padding: 12,
    fontSize: 16,
    lineHeight: '22px',
    fontFamily: 'var(--font-family-body)',
    boxSizing: 'border-box',
  },
  fieldHint: {fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8},
  miniGaugeRow: {
    marginTop: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 12,
  },
  miniGaugeText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  miniGaugeTitle: {fontSize: 16, fontWeight: 500},
};

// ---------------------------------------------------------------------------
// IDENTITY CONSTS + FIXTURES — deterministic, dual-field, cross-checked.
// ---------------------------------------------------------------------------

const BRAND = 'Twofold';
const HANDLE = 'twofold.studio';
const AVATAR_INITIALS = 'TS';

type VariantKey = 'A' | 'B';
type DraftStatus = 'lab' | 'ready' | 'published';
type ZoneName = 'HOOK' | 'BODY' | 'CTA';

interface HistoryEvent {
  id: string;
  seq: number; // global order; seeded 1..6, live commits take 7, 8, …
  label: 'Variant swap' | 'Caption edited' | 'Published';
  detail: string;
}

interface Variant {
  // Three zone lines joined with '\n': hook \n body \n CTA. The hook (line
  // 1) feeds hookScore; the zones feed tokenizeDiff. Single source — every
  // score, tick, snippet, and chip DERIVES from these strings.
  caption: string;
}

interface Draft {
  id: string;
  title: string;
  thumbSeed: number; // index into THUMB_GRADIENTS — fixed, never random
  status: DraftStatus;
  primary: VariantKey;
  variants: Record<VariantKey, Variant>;
  history: HistoryEvent[];
}

/*
 * d1 DIFF VERIFIED BY CONSTRUCTION (tokenizeDiff = per-zone word LCS on
 * punctuation-stripped lowercase keys; a "span" is a maximal run of
 * one-sided words):
 *   HOOK  A-only [ever wondered what] [looks like from a]        = 2 spans
 *         B-only [no filter ☀️]                                  = 1 span
 *         shared: 5 am rooftop                                   = 3 words
 *   BODY  A-only [we climbed before] [woke early] [spilling]     = 3 spans
 *         B-only [half asleep] [waited] [glowing] [unedited]     = 4 spans
 *         shared: the city · to catch the first light · over the
 *                 skyline · this morning                         = 12 words
 *   CTA   A-only [drop]  B-only [tag]                            = 1 + 1
 *         shared: your sunrise spot below                        = 4 words
 * Cross-checks: A-only 2+3+1 = 6, B-only 1+4+1 = 6, diverging spans 12
 * (Signals row), shared words 3+12+4 = 19 (Signals row). Hook A: 50 chars
 * → 40 len, has '?' → 28, 0 emoji → 8 = 76. Hook B: 27 chars → 40, no '?'
 * → 12, 1 emoji → 16 = 68. Delta 76−68 = +8 A (Signals row).
 * DEVIATION (noted): the spec's literal d1 body/CTA strings reconcile to
 * BODY 3/3 spans, 7 shared body words, and CTA 2/1 — they cannot produce
 * the spec's own cross-checked 2/1·3/4·1/1, 12, 19 aggregates. The
 * captions were reworded (same voice, same hooks) so tokenizeDiff
 * GENUINELY yields the spec's numbers; the cross-check laws stay exact.
 */
const D1_A = [
  'Ever wondered what 5 AM looks like from a rooftop?',
  'We climbed before the city woke early to catch the first light spilling over the skyline this morning.',
  'Drop your sunrise spot below.',
].join('\n');
const D1_B = [
  '5 AM rooftop. No filter. ☀️',
  'Half asleep, the city waited to catch the first light glowing over the skyline this morning, unedited.',
  'Tag your sunrise spot below.',
].join('\n');

// d3 stress fixtures: Variant A body runs the 96px caption stage to its
// 4-line clamp with the fade mask visible (stress 1); Variant B hook has
// 3 emoji → the emojiPts 4 penalty branch, total 40+12+4 = 56 (stress 2).
const D3_A = [
  'What does 14 hours of hand-stitching look like?',
  'Fourteen hours, three broken needles, and one very patient dog later, the jacket lining is finally in — every seam pressed, pinned, and stitched twice before it earned its place on the rack tonight.',
  'Full process video this Friday.',
].join('\n');
const D3_B = [
  'New stitch who dis 🧵🧵🧵',
  'Three broken needles later, the jacket lining is finally in.',
  'Process video drops Friday.',
].join('\n');

const D2_A = [
  'Come see where the magic gets made.',
  'Part two of the studio tour is live right now.',
  'Watch it on our page.',
].join('\n');
// d2 hook B: 26 chars → 40, '?' → 28, 0 emoji → 8 = 76 (beats A's 60 —
// why B is primary and ships).
const D2_B = [
  'Want the full studio tour?',
  'Part two is live — cables, kilns, and all.',
  'Watch it on our page.',
].join('\n');

const D4_A = [
  'Launch week by the numbers.',
  'Seven days, four drops, one very tired studio team.',
  'Recap thread on the page.',
].join('\n');
const D4_B = [
  'What a launch week — thank you.',
  'Seven days, four drops, and every single one sold through.',
  'Recap thread on the page.',
].join('\n');

// HISTORY: exactly 6 seeded events — 3 'Variant swap' + 2 'Caption edited'
// + 1 'Published' = 6; the History terminal caption recomputes from array
// length, never a literal ('All 6 events' → 'All 7 events' after a commit).
const INITIAL_DRAFTS: Draft[] = [
  {
    id: 'd1',
    title: 'Sunrise drop teaser',
    thumbSeed: 0,
    status: 'lab',
    primary: 'A',
    variants: {A: {caption: D1_A}, B: {caption: D1_B}},
    history: [
      {id: 'ev5', seq: 5, label: 'Caption edited', detail: 'CTA reworded'},
      {id: 'ev6', seq: 6, label: 'Variant swap', detail: 'A set as primary'},
    ],
  },
  {
    id: 'd2',
    title: 'Studio tour part two',
    thumbSeed: 1,
    status: 'ready', // exactly ONE 'ready' draft → 'Publish 1 ready draft'
    primary: 'B',
    variants: {A: {caption: D2_A}, B: {caption: D2_B}},
    history: [
      {id: 'ev3', seq: 3, label: 'Variant swap', detail: 'B set as primary'},
      {id: 'ev4', seq: 4, label: 'Caption edited', detail: 'Hook shortened'},
    ],
  },
  {
    id: 'd3',
    title: 'Behind the seams',
    thumbSeed: 2,
    status: 'lab',
    primary: 'A',
    variants: {A: {caption: D3_A}, B: {caption: D3_B}},
    history: [],
  },
  {
    id: 'd4',
    title: 'Launch week recap',
    thumbSeed: 3,
    status: 'published',
    primary: 'B',
    variants: {A: {caption: D4_A}, B: {caption: D4_B}},
    history: [
      {id: 'ev1', seq: 1, label: 'Variant swap', detail: 'B set as primary'},
      {id: 'ev2', seq: 2, label: 'Published', detail: 'Variant B shipped'},
    ],
  },
];
// Drafts tab tally cross-check: 2 lab (d1, d3) + 1 ready (d2) + 1
// published (d4) = 4 rows.

const ZONE_ORDER: ZoneName[] = ['HOOK', 'BODY', 'CTA'];

// ---------------------------------------------------------------------------
// PURE DERIVATIONS — tokenizeDiff, hookScore. No stored aggregates: the
// Signals card, WordDiffRail ticks, gauges, snippets, and chips all call
// these against the CURRENT captions on every render.
// ---------------------------------------------------------------------------

interface WordToken {
  text: string; // display form, punctuation kept
  key: string; // match form: lowercased, punctuation stripped
}

interface DiffToken {
  text: string;
  side: 'shared' | 'a' | 'b';
  zone: ZoneName;
}

interface ZoneDiff {
  name: ZoneName;
  tokens: DiffToken[];
  aSpans: number;
  bSpans: number;
  sharedWords: number;
}

interface DraftDiff {
  zones: ZoneDiff[];
  divergingSpans: number;
  sharedWords: number;
}

const PUNCT_RE = /[.,!?;:—–"'()]/gu;

function tokenizeLine(line: string, zone: ZoneName): WordToken[] {
  return line
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => {
      const stripped = word.toLowerCase().replace(PUNCT_RE, '');
      return {text: word, key: stripped.length > 0 ? stripped : `${zone}:${word}`};
    });
}

/**
 * Word-level LCS diff of one zone. The walk prefers consuming A words on
 * ties, so each gap between shared anchors emits at most one A-run then
 * one B-run — a "diverging span" is exactly one such maximal run.
 */
function diffZone(aLine: string, bLine: string, zone: ZoneName): ZoneDiff {
  const aTokens = tokenizeLine(aLine, zone);
  const bTokens = tokenizeLine(bLine, zone);
  const n = aTokens.length;
  const m = bTokens.length;
  const table: number[][] = Array.from({length: n + 1}, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] =
        aTokens[i].key === bTokens[j].key
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const tokens: DiffToken[] = [];
  let i = 0;
  let j = 0;
  let sharedWords = 0;
  while (i < n || j < m) {
    if (i < n && j < m && aTokens[i].key === bTokens[j].key) {
      tokens.push({text: aTokens[i].text, side: 'shared', zone});
      sharedWords += 1;
      i += 1;
      j += 1;
    } else if (i < n && (j >= m || table[i + 1][j] >= table[i][j + 1])) {
      tokens.push({text: aTokens[i].text, side: 'a', zone});
      i += 1;
    } else {
      tokens.push({text: bTokens[j].text, side: 'b', zone});
      j += 1;
    }
  }
  let aSpans = 0;
  let bSpans = 0;
  for (let k = 0; k < tokens.length; k++) {
    const side = tokens[k].side;
    if (side !== 'shared' && (k === 0 || tokens[k - 1].side !== side)) {
      if (side === 'a') aSpans += 1;
      else bSpans += 1;
    }
  }
  return {name: zone, tokens, aSpans, bSpans, sharedWords};
}

/** Per-zone diff of two 3-line captions (hook \n body \n CTA). */
function tokenizeDiff(captionA: string, captionB: string): DraftDiff {
  const aLines = captionA.split('\n');
  const bLines = captionB.split('\n');
  const zones = ZONE_ORDER.map((zone, index) => diffZone(aLines[index] ?? '', bLines[index] ?? '', zone));
  return {
    zones,
    divergingSpans: zones.reduce((sum, z) => sum + z.aSpans + z.bSpans, 0),
    sharedWords: zones.reduce((sum, z) => sum + z.sharedWords, 0),
  };
}

interface HookScore {
  len: number;
  lenPts: number;
  qPts: number;
  emojiCount: number;
  emojiPts: number;
  total: number;
}

const EMOJI_RE = /\p{Extended_Pictographic}/gu;

/**
 * Pure hook scoring, runs per keystroke in the editor sheet: lenPts 40 if
 * 20–60 chars else 24; qPts 28 with a '?' else 12; emojiPts 16 for 1–2
 * emoji, 8 for 0, 4 for ≥3. Max 84, floor 40; empty hook = 24+12+8 = 44
 * (stress fixture 4). Both gauges share the same honest 0–100 axis.
 */
function hookScore(hook: string): HookScore {
  const len = [...hook.trim()].length; // code points, so ☀️ counts sanely
  const lenPts = len >= 20 && len <= 60 ? 40 : 24;
  const qPts = hook.includes('?') ? 28 : 12;
  const emojiCount = (hook.match(EMOJI_RE) ?? []).length;
  const emojiPts = emojiCount === 0 ? 8 : emojiCount <= 2 ? 16 : 4;
  return {len, lenPts, qPts, emojiCount, emojiPts, total: lenPts + qPts + emojiPts};
}

function hookOf(variant: Variant): string {
  return variant.caption.split('\n')[0] ?? '';
}

/** First 6 words of the PRIMARY variant's caption — the Drafts snippet. */
function snippetOf(draft: Draft): string {
  const words = draft.variants[draft.primary].caption.split(/\s+/).filter(w => w.length > 0);
  return `${words.slice(0, 6).join(' ')}…`;
}

/** '+8 A' / '+3 B' / 'Even' from the two hook totals. */
function hookDeltaLabel(totalA: number, totalB: number): string {
  if (totalA === totalB) return 'Even';
  return totalA > totalB ? `+${totalA - totalB} A` : `+${totalB - totalA} B`;
}

function fmtBreakdown(score: HookScore): string {
  return `${score.lenPts} len · ${score.qPts} ? · ${score.emojiPts} emo`;
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver on the shell
 * wrapper can tell the 390px mobile stage from the desktop stage.
 */
function useElementWidth(ref: RefObject<HTMLElement | null>): number {
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

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), textarea');
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

// ---------------------------------------------------------------------------
// BRAND MARK — 24px split-T: two mirrored half-T paths with a 4px notch gap
// at the joint, notch tick in BRAND_ACCENT ("two folds" of one caption).
// ---------------------------------------------------------------------------

function TwofoldMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* Left half-T */}
        <path d="M3.5 5.5H10V19" stroke="var(--color-text-primary)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        {/* Right half-T, mirrored, 4px notch gap at the joint (x 10→14) */}
        <path d="M20.5 5.5H14V19" stroke="var(--color-text-primary)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        {/* Notch tick in the brand accent */}
        <path d="M12 8.5v3.5" stroke={BRAND_ACCENT} strokeWidth={2.4} strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// VariantCrossfadePreview — word-anchored morph. The merged diff stream
// renders EVERY token (shared once at opacity 1; A-only at opacity 1−blend
// rising −6px·blend; B-only at opacity blend settling from +6px), so hidden
// words keep their boxes and the 96px stage NEVER reflows during blend —
// the merged superset stream IS the spec's "longer variant" sizer.
// Transform/opacity only; under prefers-reduced-motion the translateY is
// dropped and the morph collapses to a plain opacity swap.
// ---------------------------------------------------------------------------

interface VariantCrossfadePreviewProps {
  diff: DraftDiff;
  blend: number;
  dragging: boolean;
}

function VariantCrossfadePreview({diff, blend, dragging}: VariantCrossfadePreviewProps) {
  const animClass = dragging ? undefined : 'tfl-anim';
  return (
    <div style={styles.captionStage} aria-hidden>
      <div style={{paddingTop: 8}}>
        {diff.zones.map(zone =>
          zone.tokens.map((token, index) => {
            const style: CSSProperties = {...styles.token};
            if (token.side === 'a') {
              style.opacity = 1 - blend;
              if (!prefersReducedMotion) style.transform = `translateY(${(-6 * blend).toFixed(2)}px)`;
            } else if (token.side === 'b') {
              style.opacity = blend;
              if (!prefersReducedMotion) style.transform = `translateY(${(6 * (1 - blend)).toFixed(2)}px)`;
            }
            return (
              <span key={`${zone.name}-${index}`} className={animClass} style={style}>
                {token.text}
              </span>
            );
          }),
        )}
      </div>
      <div style={styles.fadeMask} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// WordDiffRail — 36px, three zone segments proportional to zone word
// counts; A-only span ticks lead (amber pair), B-only ticks trail (slate
// pair) — POSITION encodes side, never color alone. Decorative-informative:
// aria-hidden with an adjacent visually-hidden summary. Not interactive, so
// no 44px obligation.
// ---------------------------------------------------------------------------

function WordDiffRail({diff}: {diff: DraftDiff}) {
  const aTotal = diff.zones.reduce((sum, z) => sum + z.aSpans, 0);
  const bTotal = diff.zones.reduce((sum, z) => sum + z.bSpans, 0);
  const summary =
    diff.divergingSpans === 0
      ? 'No divergence between variants yet'
      : `${diff.divergingSpans} diverging spans: ${aTotal} only in A, ${bTotal} only in B`;
  return (
    <>
      <div style={styles.diffRail} aria-hidden>
        {diff.divergingSpans === 0 ? (
          // ZERO-DIVERGENCE quiet state (stress fixture 3).
          <div style={styles.diffQuiet}>No divergence yet</div>
        ) : (
          diff.zones.map(zone => (
            <div key={zone.name} style={{...styles.diffZoneSeg, flex: Math.max(zone.tokens.length, 1)}}>
              <span style={styles.diffZoneLabel}>{zone.name}</span>
              <div style={styles.tickLane}>
                {Array.from({length: zone.aSpans}, (_, k) => (
                  <span key={`a${k}`} style={{...styles.tick, background: BRAND_ACCENT}} />
                ))}
                <span style={styles.tickSpacer} />
                {Array.from({length: zone.bSpans}, (_, k) => (
                  <span key={`b${k}`} style={{...styles.tick, background: SLATE_ACCENT}} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <span className="tfl-vh">{summary}</span>
    </>
  );
}

// ---------------------------------------------------------------------------
// HookScoreGauge — 72px semicircle SVG, 8px stroke, sweep = total/100·180°.
// `weight` (A gets 1−blend, B gets blend) scales the arc + numeral opacity
// 0.45→1 in lockstep so the pair visibly tilts as the handle drags. Both
// gauges share identical geometry and the same 0–100 axis.
// ---------------------------------------------------------------------------

const GAUGE_R = 32;
const GAUGE_CX = 36;
const GAUGE_CY = 40;

function gaugeArcPath(fraction: number): string {
  const theta = Math.PI * Math.min(Math.max(fraction, 0), 1);
  const x = GAUGE_CX - GAUGE_R * Math.cos(theta);
  const y = GAUGE_CY - GAUGE_R * Math.sin(theta);
  return `M ${GAUGE_CX - GAUGE_R} ${GAUGE_CY} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
}

interface HookScoreGaugeProps {
  label: string;
  score: HookScore;
  weight: number; // 0..1
  accent: string;
  dragging: boolean;
}

function HookScoreGauge({label, score, weight, accent, dragging}: HookScoreGaugeProps) {
  const opacity = 0.45 + 0.55 * weight;
  const animClass = dragging ? undefined : 'tfl-fade';
  return (
    <div style={styles.gaugeCard}>
      <span style={styles.gaugeOverline}>{label}</span>
      <div style={styles.gaugeArcBox}>
        <svg width={72} height={44} viewBox="0 0 72 44" fill="none" aria-hidden>
          <path
            d={gaugeArcPath(1)}
            stroke="var(--color-background-muted)"
            strokeWidth={8}
            strokeLinecap="round"
          />
          <path
            className={animClass}
            d={gaugeArcPath(score.total / 100)}
            stroke={accent}
            strokeWidth={8}
            strokeLinecap="round"
            style={{opacity}}
          />
        </svg>
        <span className={animClass} style={{...styles.gaugeNumeral, opacity}}>
          {score.total}
        </span>
      </div>
      <span style={styles.gaugeBreakdown}>{fmtBreakdown(score)}</span>
      <span className="tfl-vh">{`Hook score ${label.replace('HOOK ', '')}: ${score.total} of 100`}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CrownBadge — amber chip on exactly one variant card per draft (the flag
// lives ONLY in draft.primary); 200ms opacity/transform crossfade via
// .tfl-fade, instant under reduced motion.
// ---------------------------------------------------------------------------

function CrownBadge() {
  return (
    <span className="tfl-fade" style={styles.crownChip}>
      <Icon icon={CrownIcon} size="xsm" color="inherit" />
      Primary
    </span>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — every mutation flows through setState on this single
// object; every surface (chips, crown, snippets, ticks, gauges, history
// count, ships chip) DERIVES from drafts + blend on render. Undo restores
// an exact prior snapshot.
// ---------------------------------------------------------------------------

type TabId = 'drafts' | 'lab' | 'history' | 'publish';

interface SheetState {
  draftId: string;
  variantKey: VariantKey;
  detent: 'medium' | 'large';
}

interface ToastState {
  seq: number;
  text: string;
  restore: {drafts: Draft[]; blend: number} | null;
}

interface LabState {
  tab: TabId;
  // All four tabs are root-level surfaces (no push screens), so the
  // screenByTab stack is uniformly 'root'; re-tapping the active tab is
  // the one legal reset (pop-to-root = scroll to top).
  screenByTab: Record<TabId, 'root'>;
  scrollByTab: Record<TabId, number>;
  drafts: Draft[];
  focusedDraftId: string;
  blend: number; // 0 = fully Variant A, 1 = fully Variant B
  dragging: boolean;
  sheet: SheetState | null;
  toast: ToastState | null;
}

const INITIAL_STATE: LabState = {
  tab: 'lab',
  screenByTab: {drafts: 'root', lab: 'root', history: 'root', publish: 'root'},
  scrollByTab: {drafts: 0, lab: 0, history: 0, publish: 0},
  drafts: INITIAL_DRAFTS,
  focusedDraftId: 'd1',
  blend: 0, // d1.primary === 'A'
  dragging: false,
  sheet: null,
  toast: null,
};

/** Next global history seq — derived from the rows, never a stored counter. */
function nextSeq(drafts: Draft[]): number {
  return drafts.reduce((max, d) => d.history.reduce((m, ev) => Math.max(m, ev.seq), max), 0) + 1;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

const TABS: Array<{id: TabId; label: string; icon: typeof FileTextIcon}> = [
  {id: 'drafts', label: 'Drafts', icon: FileTextIcon},
  {id: 'lab', label: 'Lab', icon: FlaskConicalIcon},
  {id: 'history', label: 'History', icon: HistoryIcon},
  {id: 'publish', label: 'Publish', icon: SendIcon},
];

const HISTORY_DOT: Record<HistoryEvent['label'], string> = {
  'Variant swap': BRAND_ACCENT,
  'Caption edited': SLATE_ACCENT,
  Published: BRAND_FILL,
};

export default function MobileCaptionAbLab() {
  const [state, setState] = useState<LabState>(INITIAL_STATE);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const containerWidth = useElementWidth(wrapRef);
  const trackWidth = useElementWidth(trackRef);
  const isDesktop = containerWidth >= 720;

  const focused = state.drafts.find(d => d.id === state.focusedDraftId) ?? state.drafts[0];
  // DERIVED on every render — no stored aggregates. Editing a caption in
  // the sheet re-scores the gauges BEHIND the scrim on the same render.
  const diff = tokenizeDiff(focused.variants.A.caption, focused.variants.B.caption);
  const scoreA = hookScore(hookOf(focused.variants.A));
  const scoreB = hookScore(hookOf(focused.variants.B));
  const allEvents = state.drafts
    .flatMap(d => d.history.map(ev => ({...ev, draftTitle: d.title})))
    .sort((x, y) => y.seq - x.seq);
  const readyDrafts = state.drafts.filter(d => d.status === 'ready');
  const sheetOpen = state.sheet != null;

  // -------------------------------------------------------------------------
  // Demo-page scroller (the shell does NOT own scroll) — nearest scrollable
  // ancestor of the wrapper, falling back to the document.
  // -------------------------------------------------------------------------
  const findScroller = (): Element | null => {
    let element: HTMLElement | null = wrapRef.current;
    while (element != null) {
      const overflowY = getComputedStyle(element).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight) {
        return element;
      }
      element = element.parentElement;
    }
    return document.scrollingElement;
  };

  // PER-TAB STATE PERSISTENCE — scroll saved on exit, restored on entry;
  // drafts/blend/focus survive; open overlays and the toast do NOT (an
  // overlay belongs to its moment; toast persists until Undo, replacement,
  // or screen change). Re-tap of the active tab scrolls to top.
  const selectTab = (next: TabId) => {
    const scroller = findScroller();
    if (next === state.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    setState(prev => ({
      ...prev,
      tab: next,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
      sheet: null,
      toast: null,
    }));
  };
  useEffect(() => {
    const scroller = findScroller();
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.tab] ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TABS.findIndex(tab => tab.id === state.tab);
    const nextIndex = (index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    selectTab(TABS[nextIndex].id);
  };

  // -------------------------------------------------------------------------
  // COMMIT + UNDO — the signature flow. Committing a primary appends a
  // 'Variant swap' history event and every consequence re-derives (crown,
  // navBar chip, Drafts snippet, ships chip, 'All n events'); Undo restores
  // the exact prior snapshot so the same surfaces all roll back (stress
  // fixture 7).
  // -------------------------------------------------------------------------
  const commitPrimary = (side: VariantKey) => {
    const pole = side === 'A' ? 0 : 1;
    setState(prev => {
      const draft = prev.drafts.find(d => d.id === prev.focusedDraftId);
      if (draft == null) return prev;
      if (draft.primary === side) {
        // Already primary — spring to the pole, no commit, no toast.
        return {...prev, blend: pole, dragging: false};
      }
      const seq = nextSeq(prev.drafts);
      const event: HistoryEvent = {
        id: `ev${seq}`,
        seq,
        label: 'Variant swap',
        detail: `${side} set as primary`,
      };
      return {
        ...prev,
        blend: pole,
        dragging: false,
        drafts: prev.drafts.map(d =>
          d.id === draft.id ? {...d, primary: side, history: [...d.history, event]} : d,
        ),
        toast: {
          seq: (prev.toast?.seq ?? 0) + 1,
          text: `Variant ${side} set as primary`,
          restore: {drafts: prev.drafts, blend: draft.primary === 'A' ? 0 : 1},
        },
      };
    });
  };

  const undo = () => {
    setState(prev => {
      if (prev.toast?.restore == null) return prev;
      return {
        ...prev,
        drafts: prev.toast.restore.drafts,
        blend: prev.toast.restore.blend,
        toast: {seq: prev.toast.seq + 1, text: 'Restored', restore: null},
      };
    });
  };

  // Release rule: >0.6 commits B, <0.4 commits A, dead zone springs back to
  // the current primary's pole (240ms transform spring via .tfl-anim,
  // instant under reduced motion) — no commit, no toast (stress fixture 6).
  const settleBlend = (value: number) => {
    if (value > 0.6) {
      commitPrimary('B');
    } else if (value < 0.4) {
      commitPrimary('A');
    } else {
      setState(prev => {
        const draft = prev.drafts.find(d => d.id === prev.focusedDraftId);
        return {...prev, dragging: false, blend: draft?.primary === 'B' ? 1 : 0};
      });
    }
  };

  const blendFromClientX = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect == null || rect.width <= 36) return state.blend;
    return clamp01((clientX - rect.left - 18) / (rect.width - 36));
  };

  const onTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const next = blendFromClientX(event.clientX);
    setState(prev => ({...prev, dragging: true, blend: next}));
  };
  const onTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!state.dragging) return;
    const next = blendFromClientX(event.clientX);
    setState(prev => (prev.dragging ? {...prev, blend: next} : prev));
  };
  const onTrackPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!state.dragging) return;
    settleBlend(blendFromClientX(event.clientX));
  };

  // Endcap buttons — the mandatory non-gesture path: nudge 0.25 toward
  // that side; reaching the pole commits.
  const nudgeToward = (side: VariantKey) => {
    const next = clamp01(state.blend + (side === 'B' ? 0.25 : -0.25));
    if (next <= 0) commitPrimary('A');
    else if (next >= 1) commitPrimary('B');
    else setState(prev => ({...prev, blend: next, dragging: false}));
  };

  // Slider keyboard parity: ArrowLeft/Right step 10 (of 100), Home/End go
  // to the poles (and commit there, like a released drag).
  const onSliderKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = clamp01(state.blend - 0.1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = clamp01(state.blend + 0.1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 1;
    if (next == null) return;
    event.preventDefault();
    if (next <= 0) commitPrimary('A');
    else if (next >= 1) commitPrimary('B');
    else setState(prev => ({...prev, blend: next as number, dragging: false}));
  };

  // -------------------------------------------------------------------------
  // DRAFT FOCUS + PUBLISH
  // -------------------------------------------------------------------------
  const openDraftInLab = (id: string) => {
    const scroller = findScroller();
    setState(prev => {
      const draft = prev.drafts.find(d => d.id === id);
      return {
        ...prev,
        tab: 'lab',
        focusedDraftId: id,
        blend: draft?.primary === 'B' ? 1 : 0,
        dragging: false,
        sheet: null,
        toast: prev.tab === 'lab' ? prev.toast : null,
        scrollByTab: prev.tab === 'lab' ? prev.scrollByTab : {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
      };
    });
  };

  const publishReady = () => {
    setState(prev => {
      const ready = prev.drafts.filter(d => d.status === 'ready');
      if (ready.length === 0) return prev;
      let seq = nextSeq(prev.drafts);
      const drafts = prev.drafts.map(d => {
        if (d.status !== 'ready') return d;
        const event: HistoryEvent = {
          id: `ev${seq}`,
          seq,
          label: 'Published',
          detail: `Variant ${d.primary} shipped`,
        };
        seq += 1;
        return {...d, status: 'published' as DraftStatus, history: [...d.history, event]};
      });
      return {
        ...prev,
        drafts,
        toast: {
          seq: (prev.toast?.seq ?? 0) + 1,
          text: ready.length === 1 ? `${ready[0].title} published` : `${ready.length} drafts published`,
          restore: {drafts: prev.drafts, blend: prev.blend},
        },
      };
    });
  };

  // -------------------------------------------------------------------------
  // EDITOR SHEET — open at medium, grabber toggles detents, X/scrim/Escape
  // close; focus({preventScroll:true}) into the textarea on open (plain
  // .focus() would scroll-reveal the animating sheet inside the locked
  // column), restored to the opening PencilIcon on every close path.
  // -------------------------------------------------------------------------
  const openEditor = (draftId: string, variantKey: VariantKey, opener: HTMLElement) => {
    openerRef.current = opener;
    setState(prev => ({...prev, sheet: {draftId, variantKey, detent: 'medium'}}));
  };
  const closeSheet = useCallback(() => {
    setState(prev => ({...prev, sheet: null}));
    openerRef.current?.focus({preventScroll: true});
    openerRef.current = null;
  }, []);
  useEffect(() => {
    if (sheetOpen) textareaRef.current?.focus({preventScroll: true});
  }, [sheetOpen]);
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeSheet();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [sheetOpen, closeSheet]);

  const editCaption = (draftId: string, variantKey: VariantKey, caption: string) => {
    setState(prev => ({
      ...prev,
      drafts: prev.drafts.map(d =>
        d.id === draftId ? {...d, variants: {...d.variants, [variantKey]: {caption}}} : d,
      ),
    }));
  };

  const sheetDraft = state.sheet != null ? state.drafts.find(d => d.id === state.sheet?.draftId) : null;
  const sheetVariant = sheetDraft != null && state.sheet != null ? sheetDraft.variants[state.sheet.variantKey] : null;
  const sheetScore = sheetVariant != null ? hookScore(hookOf(sheetVariant)) : null;

  // Handle geometry: the 28px handle rides between x=4 and trackWidth−32.
  const handleX = 4 + state.blend * Math.max(trackWidth - 36, 0);
  const blendPct = Math.round(state.blend * 100);

  const statusLabel = (draft: Draft): string =>
    draft.status === 'published' ? 'Published' : `${draft.primary} primary`;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{TWOFOLD_CSS}</style>
      <div
        style={{
          ...styles.shell,
          ...(isDesktop ? styles.shellDesktop : null),
          ...(sheetOpen ? styles.shellLocked : null),
        }}>
        {/* NAV BAR — split-T mark · title · primary-flag chip (derived). */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <TwofoldMark />
          </div>
          {state.tab === 'lab' ? (
            <h1 style={styles.navTitle}>{focused.title}</h1>
          ) : (
            <span style={styles.navTitle}>{BRAND}</span>
          )}
          <div style={styles.navTrailing}>
            <span style={styles.statusChip}>{focused.primary} primary</span>
          </div>
        </header>

        {/* ============================ LAB ============================ */}
        {state.tab === 'lab' ? (
          <main style={styles.main}>
            {/* PREVIEW DOCK — sticky top 52 z15. */}
            <div style={styles.previewDock}>
              <div style={styles.previewCard}>
                <div style={styles.authorRow}>
                  <span style={styles.avatar} aria-hidden>
                    {AVATAR_INITIALS}
                  </span>
                  <span style={styles.authorName}>{HANDLE}</span>
                  <span style={styles.authorMeta}>Draft</span>
                </div>
                <VariantCrossfadePreview diff={diff} blend={state.blend} dragging={state.dragging} />
                {/* Crossfade rail — endcaps are the button path. */}
                <div style={styles.railRow}>
                  <button
                    type="button"
                    className="tfl-btn tfl-focusable"
                    style={{...styles.endcapBtn, color: BRAND_ACCENT}}
                    aria-label="Nudge blend toward Variant A"
                    onClick={() => nudgeToward('A')}>
                    A
                  </button>
                  <div
                    ref={trackRef}
                    className="tfl-focusable"
                    style={styles.trackZone}
                    role="slider"
                    tabIndex={0}
                    aria-label="Variant blend"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={blendPct}
                    aria-valuetext={`${blendPct}% toward Variant B`}
                    onKeyDown={onSliderKeyDown}
                    onPointerDown={onTrackPointerDown}
                    onPointerMove={onTrackPointerMove}
                    onPointerUp={onTrackPointerUp}
                    onPointerCancel={onTrackPointerUp}>
                    <div style={styles.trackLine} />
                    <div
                      className={state.dragging ? undefined : 'tfl-anim'}
                      style={{...styles.handle, transform: `translate(${handleX.toFixed(1)}px, -50%)`}}
                    />
                  </div>
                  <button
                    type="button"
                    className="tfl-btn tfl-focusable"
                    style={{...styles.endcapBtn, color: SLATE_ACCENT}}
                    aria-label="Nudge blend toward Variant B"
                    onClick={() => nudgeToward('B')}>
                    B
                  </button>
                </div>
                <WordDiffRail diff={diff} />
              </div>
            </div>

            {/* GAUGE ROW — weights tilt against each other with the handle. */}
            <div style={styles.gaugeRow}>
              <HookScoreGauge
                label="HOOK A"
                score={scoreA}
                weight={1 - state.blend}
                accent={BRAND_ACCENT}
                dragging={state.dragging}
              />
              <HookScoreGauge
                label="HOOK B"
                score={scoreB}
                weight={state.blend}
                accent={SLATE_ACCENT}
                dragging={state.dragging}
              />
            </div>

            {/* VARIANT WORKBENCH */}
            <h2 style={styles.sectionHeader}>Variants</h2>
            <div style={styles.variantStack}>
              {(['A', 'B'] as VariantKey[]).map(key => {
                const variant = focused.variants[key];
                const score = key === 'A' ? scoreA : scoreB;
                const isPrimary = focused.primary === key;
                return (
                  <div key={key} style={styles.variantCard}>
                    <div style={styles.variantOverline}>
                      <span>
                        Variant {key} · {score.total}
                      </span>
                    </div>
                    <div style={styles.variantText}>{variant.caption.replace(/\n/g, ' ')}</div>
                    <div style={styles.variantFooter}>
                      {isPrimary ? <CrownBadge /> : null}
                      <span style={styles.footerSpacer} />
                      <button
                        type="button"
                        className="tfl-btn tfl-focusable"
                        style={{...styles.setPrimaryBtn, ...(isPrimary ? styles.setPrimaryBtnDisabled : null)}}
                        disabled={isPrimary}
                        onClick={() => commitPrimary(key)}>
                        {isPrimary ? 'Primary' : 'Set as primary'}
                      </button>
                      <button
                        type="button"
                        className="tfl-btn tfl-focusable"
                        style={styles.pencilBtn}
                        aria-label={`Edit Variant ${key}`}
                        onClick={event => openEditor(focused.id, key, event.currentTarget)}>
                        <Icon icon={PencilIcon} size="md" color="inherit" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SIGNALS — every value re-derives from tokenizeDiff/hookScore. */}
            <h2 style={styles.sectionHeader}>Signals</h2>
            <div style={styles.listCard}>
              <div style={styles.signalRow}>
                <span style={styles.signalLabel}>Diverging spans</span>
                <span style={styles.signalValue}>{diff.divergingSpans}</span>
              </div>
              <div style={styles.rowDivider} />
              <div style={styles.signalRow}>
                <span style={styles.signalLabel}>Shared words</span>
                <span style={styles.signalValue}>{diff.sharedWords}</span>
              </div>
              <div style={styles.rowDivider} />
              <div style={styles.signalRow}>
                <span style={styles.signalLabel}>Hook delta</span>
                <span style={styles.signalValue}>{hookDeltaLabel(scoreA.total, scoreB.total)}</span>
              </div>
            </div>
            <div style={styles.spacer24} />
          </main>
        ) : null}

        {/* =========================== DRAFTS ========================== */}
        {state.tab === 'drafts' ? (
          <main style={styles.main}>
            <div style={styles.largeTitle}>
              <h1 style={styles.largeTitleText}>Drafts</h1>
            </div>
            <div style={styles.listCard}>
              {state.drafts.map((draft, index) => (
                <div key={draft.id}>
                  {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                  <button
                    type="button"
                    className="tfl-btn tfl-focusable"
                    style={styles.draftRow}
                    aria-label={`${draft.title}, ${statusLabel(draft)}`}
                    onClick={() => openDraftInLab(draft.id)}>
                    <span
                      style={{...styles.draftThumb, background: THUMB_GRADIENTS[draft.thumbSeed]}}
                      aria-hidden>
                      <Icon icon={ImageIcon} size="md" color="inherit" />
                    </span>
                    <span style={styles.draftText}>
                      <span style={styles.draftTitle}>{draft.title}</span>
                      {/* Snippet = first 6 words of the CURRENT primary. */}
                      <span style={styles.draftSnippet}>{snippetOf(draft)}</span>
                    </span>
                    <span style={styles.draftStatus}>{statusLabel(draft)}</span>
                  </button>
                </div>
              ))}
            </div>
            <div style={styles.spacer24} />
          </main>
        ) : null}

        {/* ========================== HISTORY ========================== */}
        {state.tab === 'history' ? (
          <main style={styles.main}>
            <div style={styles.largeTitle}>
              <h1 style={styles.largeTitleText}>History</h1>
            </div>
            {/* Full-bleed timeline list — dividers run edge to edge. */}
            <div>
              {allEvents.map((event, index) => (
                <div key={event.id}>
                  {index > 0 ? <div style={styles.historyDividerFull} /> : null}
                  <div style={styles.historyRow}>
                    <span style={styles.historyDotCol} aria-hidden>
                      <span style={{...styles.historyDot, background: HISTORY_DOT[event.label]}} />
                    </span>
                    <span style={styles.historyText}>
                      <span style={styles.historyPrimary}>{event.label}</span>
                      <span style={styles.historySecondary}>
                        {event.draftTitle} · {event.detail}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Terminal caption recomputes from array length, never a
                literal — 'All 6 events' becomes 'All 7 events' after a
                commit appends event 7. */}
            <div style={styles.terminalCaption}>All {allEvents.length} events</div>
            <div style={styles.spacer24} />
          </main>
        ) : null}

        {/* ========================== PUBLISH ========================== */}
        {state.tab === 'publish' ? (
          <main style={styles.main}>
            <div style={styles.largeTitle}>
              <h1 style={styles.largeTitleText}>Publish</h1>
            </div>
            {/* DEVIATION (noted): the list shows every unpublished draft —
                not only 'ready' rows — so the spec's own consequence
                fan-out ("Publish tab chip re-derives ships: Variant …"
                after a Lab swap on d1, a lab-status draft) is visible. */}
            <div style={styles.listCard}>
              {state.drafts
                .filter(d => d.status !== 'published')
                .map((draft, index) => (
                  <div key={draft.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <button
                      type="button"
                      className="tfl-btn tfl-focusable"
                      style={{...styles.publishRow, width: '100%'}}
                      aria-label={`${draft.title}, ${draft.status === 'ready' ? 'ready' : 'in lab'}, ships Variant ${draft.primary}`}
                      onClick={() => openDraftInLab(draft.id)}>
                      <span style={styles.publishTitle}>{draft.title}</span>
                      <span style={styles.publishStatus}>{draft.status === 'ready' ? 'Ready' : 'In lab'}</span>
                      <span style={styles.shipsChip}>ships: Variant {draft.primary}</span>
                    </button>
                  </div>
                ))}
            </div>
            {/* Thumb-zone primary verb: last in-flow block (sticky footers
                above the tabBar are illegal; the tabBar stays the bottom
                chrome). Count derives from status === 'ready'. */}
            <button
              type="button"
              className="tfl-btn tfl-focusable"
              style={{...styles.publishBtn, ...(readyDrafts.length === 0 ? styles.publishBtnDisabled : null)}}
              disabled={readyDrafts.length === 0}
              onClick={publishReady}>
              Publish {readyDrafts.length} ready draft{readyDrafts.length === 1 ? '' : 's'}
            </button>
          </main>
        ) : null}

        {/* TOAST DOCK — the single polite live region. Sticky-in-flow above
            the tabBar (bottom 76 = 64 + 12); shell-absolute ONLY while the
            sheet scroll-locks the shell. No timers: the toast persists
            until Undo, replacement, or a tab switch. */}
        <div
          style={sheetOpen ? styles.toastDockAbsolute : styles.toastDockSticky}
          role="status"
          aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast}>
              <span style={styles.toastText}>{state.toast.text}</span>
              {state.toast.restore != null ? (
                <>
                  <span style={styles.toastRule} />
                  <button type="button" className="tfl-btn tfl-focusable" style={styles.toastUndo} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — exactly 64px, 4 tabItems, sticky bottom z20. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Twofold sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const active = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="tfl-btn tfl-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <Icon icon={tab.icon} size="lg" color="inherit" />
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* EDITOR SHEET — medium 55% / large calc(100% − 56px); the sheet
            body is the one legal inner scroller. */}
        {sheetOpen && sheetDraft != null && sheetVariant != null && sheetScore != null && state.sheet != null ? (
          <>
            <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <div
              ref={sheetRef}
              className="tfl-sheet-in"
              style={{
                ...styles.sheet,
                height: state.sheet.detent === 'medium' ? '55%' : 'calc(100% - 56px)',
              }}
              role="dialog"
              aria-modal
              aria-label={`Edit Variant ${state.sheet.variantKey}`}
              onKeyDown={event => trapTabKey(event, sheetRef.current)}>
              <div style={styles.grabberZone}>
                <button
                  type="button"
                  className="tfl-btn tfl-focusable"
                  style={{width: 44, height: 16, display: 'grid', placeItems: 'center', borderRadius: 8}}
                  aria-label="Resize sheet"
                  onClick={() =>
                    setState(prev =>
                      prev.sheet == null
                        ? prev
                        : {...prev, sheet: {...prev.sheet, detent: prev.sheet.detent === 'medium' ? 'large' : 'medium'}},
                    )
                  }>
                  <span style={styles.grabberPill} />
                </button>
              </div>
              <div style={styles.sheetHeader}>
                <span />
                <h2 style={styles.sheetTitle}>Edit Variant {state.sheet.variantKey}</h2>
                <button
                  type="button"
                  className="tfl-btn tfl-focusable"
                  style={styles.iconBtn}
                  aria-label="Close editor"
                  onClick={closeSheet}>
                  <Icon icon={XIcon} size="md" color="inherit" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                <label style={styles.fieldLabel} htmlFor="tfl-caption-editor">
                  Caption — hook / body / CTA, one line each
                </label>
                <textarea
                  id="tfl-caption-editor"
                  ref={textareaRef}
                  className="tfl-textarea"
                  style={styles.textarea}
                  rows={5}
                  value={sheetVariant.caption}
                  onChange={event => {
                    if (state.sheet != null) {
                      editCaption(state.sheet.draftId, state.sheet.variantKey, event.target.value);
                    }
                  }}
                />
                <p style={styles.fieldHint}>
                  The hook (line 1) re-scores on every keystroke — watch the gauges behind this sheet.
                </p>
                {/* Live mini readout: same pure hookScore, weight 1. */}
                <HookScoreGauge
                  label={`HOOK ${state.sheet.variantKey}`}
                  score={sheetScore}
                  weight={1}
                  accent={state.sheet.variantKey === 'A' ? BRAND_ACCENT : SLATE_ACCENT}
                  dragging={false}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
