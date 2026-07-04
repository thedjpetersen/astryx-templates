var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Larkspur Rx pickup order frozen
 *   at NOW_MIN 825 ('1:45 PM') against a 9:00 AM–7:00 PM day (DAY_START
 *   540 / DAY_END 1140, READY_MIN 870 = 2:30 PM): six prescriptions with
 *   dual price fields (cents for math + preformatted labels), refill
 *   gauges (2/5, 4/6, 1/3, 0/0 NEW, 3/4, 1/2), the Azithromycin+Warfarin
 *   interaction pair, and the $0.00-insurance COVERED stress row. Default
 *   selection {rx-4821, rx-5137, rx-6290} → $24.50 insurance / $73.35
 *   cash / $48.85 saved / code LK6248. No Date.now(), no Math.random(),
 *   no network media.
 * @output Larkspur Rx — Prescription Pickup: a 390px MOBILE pharmacy
 *   surface. NavBar (28px larkspur flower mark · fading 'Pickup' compact
 *   title · 44×44 Refresh) over a 28px ready-window day band with a NOW
 *   tick at 47.5% and highlighted 55%→100% window, six 72px rxSelectRow
 *   checkbox-buttons (capsule refill gauge · two-line med stack · dual
 *   insurance/cash prices · 22px check), a CONDITIONAL drug-interaction
 *   warning card keyed on the exact {rx-7714, rx-8003} pair, a 4-row
 *   pharmacy card, a sticky-in-flow statusPill, and a sticky cost footer.
 *   Signature move: derived-state discipline — count, totals, savings,
 *   counter-wait estimate, warning card, and the pickup pass's 6-char
 *   code + pseudo-barcode are ALL pure functions of selectedRxIds;
 *   toggling one row rewrites the footer, the meter caption, the warning
 *   card, and (on reconfirm) the pass code LK6248→LK9958 with provably
 *   different bar widths.
 * @position Page template; emitted by \`astryx template mobile-prescription-pickup\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet) are position:'absolute' INSIDE
 *   shell; position:fixed is banned. While the pass sheet is open, shell
 *   locks to {height:'100dvh', overflow:'hidden'} and restores on close.
 *   The stage clips to --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 on gauge-led rxSelectRows);
 *   no desktop Layout frames, no side asides, no multi-column tables.
 *   NO tabBar — the sticky cost footer is the thumb-zone primary.
 * Color policy: token-pure chrome. THE quarantined brand pair is
 *   BRAND_FILL (Larkspur violet) with companion BRAND_TEXT (fill vs text
 *   split per house rule); PASS_BOOST_BG/PASS_BOOST_INK carry an explicit
 *   scan-mode exemption (max-contrast pass defeats light-dark by design);
 *   warning card uses var(--color-error) tints only.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON —
 *   noted choice); largeTitle row 52px (total large header 104px) + 24px
 *   caption block; rxSelectRow 72px media row (48×28 capsule gauge · two-
 *   line 16px/500 + 13px/400 stack · trailing dual-price ~76px tabular ·
 *   22×22 check); pharmacy rows 44px utility; readyWindowMeter band 28px,
 *   positions in % of band width; sectionHeader 13px/600 uppercase 0.06em
 *   at 32px (16 gutter + 16 card pad), 20px top / 8px bottom; sticky
 *   footer bottom 0 z20 (padding '12px 16px', 20px summary + 4 + 16px
 *   caption + 8 + 48px confirm ≈ 108px content stack); statusPill sticky-
 *   in-flow bottom 120 z21; sheet LARGE detent calc(100% − 56px) /
 *   MEDIUM 55%, 24px grabber zone with 36×5 pill, 52px sheet header;
 *   pass code 40px/700 tabular 0.12em. TYPE (Figtree via
 *   --font-family-body): 28/700 large title · 17/600 nav+card titles ·
 *   16/400 body floor · 13/400 meta · 11/500 overlines; nothing under
 *   11px; tabular-nums on all money, times, codes, counts. Touch: every
 *   target ≥44×44 (each rxSelectRow is ONE full-width 72px button);
 *   48px primary / 36px inline secondary / 44×44 icon buttons. No
 *   gestures shipped beyond tap (no swipe rows, no pull-to-refresh), so
 *   no fallback debt; the sheet grabber is a real button.
 *
 * Responsive contract:
 * - Fluid 320–430px: meter positions in %, med names ellipsize before the
 *   fixed ~76px price column, gauge/text/prices/check keep all four zones
 *   at 320px with 8px gaps. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — above 560px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairlines); sheet, scrim, statusPill, and footer all
 *   anchor inside that column because they are absolute/sticky within
 *   shell. No adaptive relayout — this is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, RefObject} from 'react';

import {
  CheckIcon,
  ChevronRightIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each declared once.
// ---------------------------------------------------------------------------

// THE quarantined brand pair (Larkspur violet). BRAND_FILL is the fill hue:
// #6D5AE6 for surfaces/gauges in light, #8A7BEC lifted for dark.
const BRAND_FILL = 'light-dark(#6D5AE6, #8A7BEC)';
// Companion TEXT value (fill vs text split per house rule): #5646C4 on the
// white card ≈ 6.7:1; #B4ABF5 on the dark body ≈ 8.9:1 — both pass 4.5:1.
const BRAND_TEXT = 'light-dark(#5646C4, #B4ABF5)';
// Text/glyphs ON a BRAND_FILL surface. Light: #FFFFFF on #6D5AE6 ≈ 4.95:1.
// Dark: white on #8A7BEC ≈ 3.4:1 FAILS 4.5:1, so the dark side flips to a
// near-black violet — #17123A on #8A7BEC ≈ 5.2:1. (Spec said "white text";
// deviation for dark-scheme contrast, math above.)
const BRAND_ON_FILL = 'light-dark(#FFFFFF, #17123A)';
// Brand-tinted washes: 18% ready-window highlight, 8% selected-row tint.
const BRAND_WINDOW_18 = \`color-mix(in srgb, \${BRAND_FILL} 18%, transparent)\`;
const BRAND_ROW_8 = \`color-mix(in srgb, \${BRAND_FILL} 8%, var(--color-background-card))\`;
// SCAN-MODE EXEMPTION: the boosted pickup pass deliberately defeats
// light-dark() — a max-contrast surface for the counter scanner must be
// identical in BOTH schemes. #191632 on #FDFDF8 ≈ 15.9:1.
const PASS_BOOST_BG = '#FDFDF8';
const PASS_BOOST_INK = '#191632';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Error-tinted warning card wash (token-derived, not a literal hue).
const ERROR_WASH_10 = 'color-mix(in srgb, var(--color-error) 10%, var(--color-background-card))';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, the visually-hidden text, and the
// reduced-motion guard. Transitions animate transform/opacity only; the
// sheet slide collapses to a plain fade under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const LRX_CSS = \`
.lrx-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.lrx-btn:disabled { cursor: default; }
.lrx-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.lrx-fade { transition: opacity 240ms ease; }
.lrx-thumb { transition: transform 200ms ease; }
@keyframes lrx-sheet-in {
  from { transform: translateY(32px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
@keyframes lrx-sheet-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
.lrx-sheet-in { animation: lrx-sheet-in 240ms ease; }
.lrx-vh {
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
  .lrx-fade, .lrx-thumb { transition: none; }
  .lrx-sheet-in { animation: lrx-sheet-fade 160ms ease; }
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
  // Scroll lock while the pass sheet is open — absolute overlays anchor to
  // the visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage (>560px container width): centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px icon buttons
  // optically align content to the 16px gutter. Hairline + blur ALWAYS ON
  // (noted choice per contract — scroll-under is not wired to the border).
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
  // 44×44 non-button brand cell holding the 28px larkspur mark.
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center', color: BRAND_TEXT},
  // Compact title — starts opacity 0, fades in once the largeTitle block
  // scrolls under the navBar (IntersectionObserver sentinel).
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  // LARGE TITLE — 52px row (total large header 104px with the navBar),
  // then a 24px caption block (20px line + 4px gap).
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.15},
  titleCaption: {
    paddingInline: 16,
    marginTop: 4,
    fontSize: 13,
    lineHeight: '20px',
    color: 'var(--color-text-secondary)',
  },
  sentinel: {height: 1},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom.
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // rxSelectRows lead with the 48px gauge zone → dividers inset 68px.
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // READY WINDOW METER — 16px padding inside its listCard; 24px section
  // spacing above (title caption block supplies the first 24).
  meterCard: {
    marginInline: 16,
    marginTop: 24,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  meterHeader: {display: 'flex', alignItems: 'baseline', gap: 8},
  meterTitle: {fontSize: 17, fontWeight: 600, flex: 1, minWidth: 0, margin: 0},
  meterReadyIn: {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // NOW label row (16px) + 4px breathing room above the 28px band; the
  // tick overshoots the band by 4px top and bottom (36px total).
  meterTrackWrap: {position: 'relative', marginTop: 24, paddingTop: 20},
  nowLabel: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  meterBand: {
    position: 'relative',
    height: 28,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  meterWindow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    background: BRAND_WINDOW_18,
    borderLeft: \`2px solid \${BRAND_FILL}\`,
  },
  nowTick: {
    position: 'absolute',
    width: 2,
    height: 36,
    background: 'var(--color-text-primary)',
    // Band sits 20px down (paddingTop); the 36px tick starts 16px down so
    // it overshoots the 28px band by 4px top and bottom.
    top: 16,
    borderRadius: 0,
  },
  meterAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 6,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  meterCaption: {
    marginTop: 12,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // RX SELECT ROW — ONE full-width 72px <button role='checkbox'>: 48px
  // gauge zone · flex-1 two-line stack · ~76px dual-price column · 22×22
  // check glyph; 8px gaps survive down to 320px.
  rxRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    background: 'var(--color-background-card)',
  },
  rxRowSelected: {background: BRAND_ROW_8},
  gaugeZone: {
    width: 48,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  gaugeCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // refillGauge capsule — 999px pill (fully rounded ends at 28px tall),
  // muted track, hairline border, BRAND_FILL fill from the left.
  gaugeTrack: {
    position: 'relative',
    width: 48,
    height: 28,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  gaugeTrackPass: {width: 40, height: 24},
  gaugeFill: {position: 'absolute', top: 0, bottom: 0, left: 0, background: BRAND_FILL},
  // NEW variant (0-of-0 fill) — dashed capsule with an 11px 'NEW' label.
  gaugeNew: {
    width: 48,
    height: 28,
    borderRadius: 999,
    border: \`1px dashed \${BRAND_TEXT}\`,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: BRAND_TEXT,
  },
  gaugeNewPass: {width: 40, height: 24},
  rxText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  rxName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rxDetail: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // Dual-price column fixed ~76px so long names truncate first.
  priceCol: {
    width: 76,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  coveredOverline: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: BRAND_TEXT,
  },
  priceIns: {fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap'},
  priceCash: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textDecoration: 'line-through',
    whiteSpace: 'nowrap',
  },
  // 22×22 check glyph at 7px radius — inside the 72px row button, so the
  // touch target is the whole row. The UNCHECKED border cannot use the
  // hairline token: var(--color-border) measures 1.31:1 on the dark row
  // surface, hiding the selection affordance. Explicit pair instead —
  // #73737D on white ≈ 5.0:1, #98989F on #1F1F22 ≈ 5.3:1 (≥3:1 UI-boundary
  // law).
  checkGlyph: {
    width: 22,
    height: 22,
    flexShrink: 0,
    borderRadius: 7,
    border: '1px solid light-dark(#73737D, #98989F)',
    display: 'grid',
    placeItems: 'center',
  },
  // Checked disc: BRAND_ON_FILL glyph on BRAND_FILL — light #FFF on
  // #6D5AE6 ≈ 4.95:1; dark #17123A on #8A7BEC ≈ 5.2:1.
  checkGlyphOn: {
    border: \`1px solid \${BRAND_FILL}\`,
    background: BRAND_FILL,
    color: BRAND_ON_FILL,
  },
  // INTERACTION WARNING CARD — conditional, error-tinted.
  warningCard: {
    marginInline: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 'var(--radius-element, 12px)',
    border: '1px solid var(--color-error)',
    background: ERROR_WASH_10,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  warningIcon: {color: 'var(--color-error)', flexShrink: 0, display: 'inline-flex', marginTop: 1},
  warningText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  warningTitle: {fontSize: 13, fontWeight: 600, margin: 0},
  warningBody: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  // 36px inline secondary button.
  reviewBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    alignSelf: 'center',
    color: 'var(--color-text-primary)',
  },
  // PHARMACY — 44px single-line utility rows.
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  utilityLabel: {flex: 1, minWidth: 0, fontSize: 16},
  utilityValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  chevron: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  // STATUS PILL — the single polite live region, STICKY-IN-FLOW per the
  // batch-1 amendment (shell-absolute pins to the document bottom on tall
  // scrolling views); bottom 120 clears the sticky footer.
  statusDock: {
    position: 'sticky',
    bottom: 120,
    zIndex: 21,
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    maxWidth: 'calc(100% - 32px)',
  },
  statusPill: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    boxShadow: '0 4px 16px var(--color-shadow)',
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // STICKY COST FOOTER — bottom 0 z20 blur surface; 20px summary + 4 +
  // 16px caption + 8 + 48px confirm inside '12px 16px' padding.
  footer: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    padding: '12px 16px',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  footerSummary: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '20px',
    fontVariantNumeric: 'tabular-nums',
  },
  footerCaption: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  confirmBtn: {
    marginTop: 8,
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_FILL,
    color: BRAND_ON_FILL,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  confirmBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell; LARGE detent
  // default with the grabber toggling to MEDIUM 55% and back.
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
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  // The one legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 24px'},
  // PICKUP PASS CARD — 16px radius; default card surface; boosted flips to
  // the PASS_BOOST_* scan pair in both schemes.
  passCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  passCardBoost: {
    background: PASS_BOOST_BG,
    color: PASS_BOOST_INK,
    border: \`1px solid \${PASS_BOOST_INK}\`,
  },
  passChip: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    border: '1px solid currentcolor',
    borderRadius: 999,
    padding: '3px 10px',
    fontVariantNumeric: 'tabular-nums',
  },
  passCode: {
    fontSize: 40,
    fontWeight: 700,
    letterSpacing: '0.12em',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1,
  },
  passBarcode: {width: '100%', maxWidth: 232, display: 'block'},
  // boostToggle row — 44px labeled row; the switch track is a 28×48 pill.
  boostRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  boostLabel: {flex: 1, minWidth: 0, fontSize: 16, textAlign: 'left'},
  boostTrack: {
    position: 'relative',
    width: 48,
    height: 28,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  boostTrackOn: {background: PASS_BOOST_INK, border: \`1px solid \${PASS_BOOST_INK}\`},
  boostThumb: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 24,
    height: 24,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
  },
  boostThumbOn: {transform: 'translateX(20px)', background: PASS_BOOST_BG},
  // Selected-med list inside the sheet — 44px rows, no controls.
  passListRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  passListName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetCaption: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts + six prescriptions with dual price fields
// (cents for math, preformatted labels for render). ARITHMETIC CROSS-CHECKS
// (verified by hand): default {4821, 5137, 6290} → ins 450+800+1200 =
// 2450¢ = $24.50; cash 1280+3240+2815 = 7335¢ = $73.35; savings 7335−2450
// = 4885¢ = $48.85; wait 1+3 = 4 min; code 4821+5137+6290 = 16248 % 10000
// = 6248 → 'LK6248'. All six → ins 4950¢, cash 27957¢, savings 23007¢,
// wait 1+6+3 = 10, code 41131 % 10000 → 'LK1131'. Pair {7714, 8003} alone
// → ins 2500¢, cash 5750¢, savings 3250¢, wait 1+2+3 = 6, code 15717 →
// 'LK5717'. Defaults minus Sertraline → 2 items, $12.50, code 9958 →
// 'LK9958'. Ready caption: READY_MIN − NOW_MIN = 870 − 825 = 45.
// ---------------------------------------------------------------------------

const PHARMACY = {
  name: 'Larkspur Rx',
  branch: 'Maple & 9th',
  address: '1420 Maple Ave',
  pharmacist: 'Naomi Reyes, PharmD',
  hoursToday: '9:00 AM – 7:00 PM',
  hoursSat: '10:00 AM – 4:00 PM',
};

// Minutes-since-midnight day model — meter positions are % of this span.
const DAY_START = 540; // 9:00 AM
const DAY_END = 1140; // 7:00 PM
const NOW_MIN = 825; // 1:45 PM → (825−540)/600 = 47.5%
const READY_MIN = 870; // 2:30 PM → (870−540)/600 = 55%
const CODE_PREFIX = 'LK';
const INTERACTION_PAIR = ['rx-7714', 'rx-8003'] as const;

const NOW_PCT = ((NOW_MIN - DAY_START) / (DAY_END - DAY_START)) * 100; // 47.5
const READY_PCT = ((READY_MIN - DAY_START) / (DAY_END - DAY_START)) * 100; // 55

interface RxItem {
  id: string;
  num: number; // pass code input: code = 'LK' + (Σ selected num) % 10000
  name: string;
  shortName: string; // statusPill voice ('Lisinopril removed · …')
  detail: string;
  priceInsCents: number;
  priceInsLabel: string;
  priceCashCents: number;
  priceCashLabel: string;
  refillsLeft: number;
  refillsTotal: number; // 0-of-0 → NEW-fill gauge variant (no divide-by-zero)
  selected: boolean;
}

// Gauge fractions: 2/5 = 40% · 4/6 = 66.7% · 1/3 = 33.3% · 0/0 = NEW ·
// 3/4 = 75% · 1/2 = 50%. rx-9166 is the 320px single-line ellipsis stress
// AND the $0.00-insurance COVERED stress; rx-7714 is the NEW-fill stress
// and one half of the interaction pair.
const RX_FIXTURES: RxItem[] = [
  {
    id: 'rx-4821',
    num: 4821,
    name: 'Lisinopril 10 mg',
    shortName: 'Lisinopril',
    detail: 'Dr. Imani Okafor · 30 tablets',
    priceInsCents: 450,
    priceInsLabel: '$4.50',
    priceCashCents: 1280,
    priceCashLabel: '$12.80',
    refillsLeft: 2,
    refillsTotal: 5,
    selected: true,
  },
  {
    id: 'rx-5137',
    num: 5137,
    name: 'Atorvastatin 20 mg',
    shortName: 'Atorvastatin',
    detail: 'Dr. Imani Okafor · 90 tablets',
    priceInsCents: 800,
    priceInsLabel: '$8.00',
    priceCashCents: 3240,
    priceCashLabel: '$32.40',
    refillsLeft: 4,
    refillsTotal: 6,
    selected: true,
  },
  {
    id: 'rx-6290',
    num: 6290,
    name: 'Sertraline 50 mg',
    shortName: 'Sertraline',
    detail: 'Dr. Paul Ostrowski · 30 tablets',
    priceInsCents: 1200,
    priceInsLabel: '$12.00',
    priceCashCents: 2815,
    priceCashLabel: '$28.15',
    refillsLeft: 1,
    refillsTotal: 3,
    selected: true,
  },
  {
    id: 'rx-7714',
    num: 7714,
    name: 'Azithromycin 250 mg (Z-Pak)',
    shortName: 'Azithromycin',
    detail: 'Dr. Paul Ostrowski · 6 tablets',
    priceInsCents: 1825,
    priceInsLabel: '$18.25',
    priceCashCents: 4160,
    priceCashLabel: '$41.60',
    refillsLeft: 0,
    refillsTotal: 0,
    selected: false,
  },
  {
    id: 'rx-8003',
    num: 8003,
    name: 'Warfarin 5 mg',
    shortName: 'Warfarin',
    detail: 'Dr. Imani Okafor · 30 tablets',
    priceInsCents: 675,
    priceInsLabel: '$6.75',
    priceCashCents: 1590,
    priceCashLabel: '$15.90',
    refillsLeft: 3,
    refillsTotal: 4,
    selected: false,
  },
  {
    id: 'rx-9166',
    num: 9166,
    name: 'Hydroxychloroquine Sulfate 200 mg — dispense as written',
    shortName: 'Hydroxychloroquine',
    detail: 'Dr. Renata Voss · 60 tablets',
    priceInsCents: 0,
    priceInsLabel: '$0.00',
    priceCashCents: 14872,
    priceCashLabel: '$148.72',
    refillsLeft: 1,
    refillsTotal: 2,
    selected: false,
  },
];

// ---------------------------------------------------------------------------
// PURE DERIVATIONS — every aggregate is a function of the selection; none
// are stored (derived-state discipline is the template's whole point).
// ---------------------------------------------------------------------------

/** Cents → '$48.85'. */
function fmtUsd(cents: number): string {
  return \`$\${(cents / 100).toFixed(2)}\`;
}

/**
 * Pass code — order-independent (a SUM, not a concat: stress fixture 7),
 * so toggling rx-4821 off and back on returns exactly 'LK6248'.
 */
function codeFor(selected: RxItem[]): string {
  const sum = selected.reduce((acc, rx) => acc + rx.num, 0);
  return \`\${CODE_PREFIX}\${String(sum % 10000).padStart(4, '0')}\`;
}

/**
 * pseudoBarcode bar widths — for each of the 6 code chars c, four bars of
 * width ((c.charCodeAt(0) >> (2*i)) & 3) + 2 (i = 0..3). Worked example
 * for 'LK6248': 'L'(76) → 2,5,2,3; 'K'(75) → 5,4,2,3 — the first eight
 * bars are hand-verifiable. Pure function of code → the pass provably
 * changes with the selection.
 */
function barWidthsFor(code: string): number[] {
  const widths: number[] = [];
  for (const char of code) {
    const byte = char.charCodeAt(0);
    for (let i = 0; i < 4; i++) {
      widths.push(((byte >> (2 * i)) & 3) + 2);
    }
  }
  return widths;
}

// ---------------------------------------------------------------------------
// HOOKS & FOCUS UTILITIES
// ---------------------------------------------------------------------------

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver on the shell
 * wrapper can tell the 390px mobile stage from the desktop stage.
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

/** Sheet focus trap — Tab cycles inside the dialog while it is open. */
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
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

// ---------------------------------------------------------------------------
// LARKSPUR MARK — 28px inline SVG, single currentColor fill: a vertical
// 2px stem with three offset rounded petals; the lowest petal is a
// horizontal capsule visually split by the stem crossing it (two half-
// capsules with the stem running the 3px gap) — flower-as-medication.
// ---------------------------------------------------------------------------

function LarkspurMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="currentColor" aria-hidden>
        {/* stem */}
        <rect x={13} y={3} width={2} height={22} rx={1} />
        {/* upper-left petal */}
        <ellipse cx={9.5} cy={8} rx={4.5} ry={3} />
        {/* mid-right petal */}
        <ellipse cx={18.5} cy={12.5} rx={4.5} ry={3} />
        {/* lowest petal — capsule split lengthwise by the stem */}
        <rect x={5.5} y={17} width={6.5} height={6} rx={3} />
        <rect x={16} y={17} width={6.5} height={6} rx={3} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// REFILL GAUGE — the capsule meter, extracted pure so the pass sheet can
// reuse it read-only at 40×24. Track + BRAND_FILL fraction, or the dashed
// NEW variant when refillsTotal === 0 (divide-by-zero guard).
// ---------------------------------------------------------------------------

interface RefillGaugeProps {
  refillsLeft: number;
  refillsTotal: number;
  size: 'row' | 'pass';
}

function RefillGauge({refillsLeft, refillsTotal, size}: RefillGaugeProps) {
  if (refillsTotal === 0) {
    return (
      <span style={{...styles.gaugeNew, ...(size === 'pass' ? styles.gaugeNewPass : null)}} aria-hidden>
        NEW
      </span>
    );
  }
  const pct = (refillsLeft / refillsTotal) * 100;
  return (
    <span
      style={{...styles.gaugeTrack, ...(size === 'pass' ? styles.gaugeTrackPass : null)}}
      aria-hidden>
      <span style={{...styles.gaugeFill, width: \`\${pct}%\`}} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// RX SELECT ROW — ONE full-width 72px <button role='checkbox'> combining
// gauge, two-line stack, dual prices, and the 22×22 check. Accessible name
// is the med name plus refill/price suffix — never the raw row soup.
// ---------------------------------------------------------------------------

interface RxSelectRowProps {
  rx: RxItem;
  rowRef: (node: HTMLButtonElement | null) => void;
  onToggle: () => void;
}

function RxSelectRow({rx, rowRef, onToggle}: RxSelectRowProps) {
  const refillsText =
    rx.refillsTotal === 0 ? 'new fill' : \`\${rx.refillsLeft} of \${rx.refillsTotal} refills\`;
  const priceText =
    rx.priceInsCents === 0 ? 'covered, $0.00 with insurance' : \`\${rx.priceInsLabel} with insurance\`;
  return (
    <button
      type="button"
      ref={rowRef}
      role="checkbox"
      aria-checked={rx.selected}
      className="lrx-btn lrx-focusable"
      style={{...styles.rxRow, ...(rx.selected ? styles.rxRowSelected : null)}}
      aria-label={\`\${rx.name}, \${refillsText}, \${priceText}\`}
      onClick={onToggle}>
      <span style={styles.gaugeZone} aria-hidden>
        <RefillGauge refillsLeft={rx.refillsLeft} refillsTotal={rx.refillsTotal} size="row" />
        <span style={styles.gaugeCaption}>
          {rx.refillsTotal === 0 ? 'new Rx' : \`\${rx.refillsLeft} of \${rx.refillsTotal}\`}
        </span>
      </span>
      <span style={styles.rxText} aria-hidden>
        <span style={styles.rxName}>{rx.name}</span>
        <span style={styles.rxDetail}>{rx.detail}</span>
      </span>
      <span style={styles.priceCol} aria-hidden>
        {rx.priceInsCents === 0 ? <span style={styles.coveredOverline}>COVERED</span> : null}
        <span style={styles.priceIns}>{rx.priceInsLabel}</span>
        <span style={styles.priceCash}>{rx.priceCashLabel}</span>
      </span>
      <span
        style={{...styles.checkGlyph, ...(rx.selected ? styles.checkGlyphOn : null)}}
        aria-hidden>
        {rx.selected ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// READY WINDOW METER — a horizontal availability band, NOT an event feed:
// 28px track spanning the card, all positions in % of band width (never px
// of stage): NOW tick at 47.5%, ready window 55%→100% highlighted with a
// 2px BRAND_FILL leading edge; the caption carries the DERIVED counter-
// wait estimate.
// ---------------------------------------------------------------------------

interface ReadyWindowMeterProps {
  waitMin: number | null;
}

function ReadyWindowMeter({waitMin}: ReadyWindowMeterProps) {
  const readyInMin = READY_MIN - NOW_MIN; // 45
  return (
    <section style={styles.meterCard} aria-label="Ready window">
      <div style={styles.meterHeader}>
        <h2 style={styles.meterTitle}>Ready window</h2>
        <span style={styles.meterReadyIn}>Ready in {readyInMin} min</span>
      </div>
      <div style={styles.meterTrackWrap}>
        <span style={{...styles.nowLabel, left: \`\${NOW_PCT}%\`}}>NOW 1:45 PM</span>
        <div
          style={styles.meterBand}
          role="img"
          aria-label={\`Day band 9 AM to 7 PM; pickup window opens 2:30 PM; now 1:45 PM\`}>
          <span style={{...styles.meterWindow, left: \`\${READY_PCT}%\`}} aria-hidden />
        </div>
        {/* NOW tick — 2px wide, 36px tall, overshooting the 28px band. */}
        <span style={{...styles.nowTick, left: \`calc(\${NOW_PCT}% - 1px)\`}} aria-hidden />
        <div style={styles.meterAxis} aria-hidden>
          <span>9 AM</span>
          <span>2 PM</span>
          <span>7 PM</span>
        </div>
      </div>
      <p style={styles.meterCaption}>
        {waitMin == null
          ? 'Select items for an estimate'
          : \`~\${waitMin} min at counter · pharmacist on duty\`}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// PSEUDO BARCODE — deterministic fixed-width SVG (viewBox '0 0 232 56'):
// 24 bars (4 per code char), 2px gaps, 8px quiet zones, square corners,
// fill 'currentColor' so the boost swap recolors it for free.
// ---------------------------------------------------------------------------

function PseudoBarcode({code}: {code: string}) {
  const widths = barWidthsFor(code);
  const barsWidth = widths.reduce((sum, w) => sum + w, 0) + 2 * (widths.length - 1);
  // Quiet zone ≥8px each end; the bar group centers in the 232px viewBox
  // so the pass reads symmetric at every code value (max group = 166px).
  let x = Math.max(8, (232 - barsWidth) / 2);
  const bars = widths.map((width, index) => {
    const rect = <rect key={index} x={x} y={0} width={width} height={56} fill="currentColor" />;
    x += width + 2;
    return rect;
  });
  return (
    <svg viewBox="0 0 232 56" style={styles.passBarcode} height={56} role="img" aria-label={\`Pickup barcode for code \${code}\`}>
      {bars}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// BOOST TOGGLE — 28×48 pill switch (24px thumb, transform-only transition
// that collapses under prefers-reduced-motion); role='switch' inside a
// 44px-tall labeled row.
// ---------------------------------------------------------------------------

interface BoostToggleProps {
  boostOn: boolean;
  onToggle: () => void;
}

function BoostToggle({boostOn, onToggle}: BoostToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={boostOn}
      className="lrx-btn lrx-focusable"
      style={styles.boostRow}
      onClick={onToggle}>
      <span style={styles.boostLabel}>Boost brightness</span>
      <span style={{...styles.boostTrack, ...(boostOn ? styles.boostTrackOn : null)}} aria-hidden>
        <span
          className="lrx-thumb"
          style={{...styles.boostThumb, ...(boostOn ? styles.boostThumbOn : null)}}
        />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// PICKUP PASS CARD — high-contrast scannable pass: item-count chip, 6-char
// 40px/700 code, pseudoBarcode, boost row. Boosted surface uses the
// PASS_BOOST_* scan pair in BOTH schemes (exemption at the declaration).
// ---------------------------------------------------------------------------

interface PickupPassCardProps {
  code: string;
  count: number;
  boostOn: boolean;
  onToggleBoost: () => void;
}

function PickupPassCard({code, count, boostOn, onToggleBoost}: PickupPassCardProps) {
  return (
    <div style={{...styles.passCard, ...(boostOn ? styles.passCardBoost : null)}}>
      <span style={styles.passChip}>
        {count} item{count === 1 ? '' : 's'}
      </span>
      <span style={styles.passCode}>{code}</span>
      <PseudoBarcode code={code} />
      <BoostToggle boostOn={boostOn} onToggle={onToggleBoost} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — PickupApp holds {rxList, ui} and exposes update(id,
// patch), the only mutation path: rxSelectRow calls update(rx.id,
// {selected}); everything else patches 'ui'. ALL aggregates (count,
// totals, savings, warning, wait, code) derive inline, never stored.
// ---------------------------------------------------------------------------

interface UiState {
  sheetOpen: boolean;
  sheetDetent: 'large' | 'medium';
  boostOn: boolean;
  statusMsg: {seq: number; text: string} | null;
  refreshed: boolean;
}

interface PickupState {
  rxList: RxItem[];
  ui: UiState;
}

const INITIAL_STATE: PickupState = {
  rxList: RX_FIXTURES,
  ui: {sheetOpen: false, sheetDetent: 'large', boostOn: false, statusMsg: null, refreshed: false},
};

export default function MobilePrescriptionPickupTemplate() {
  // Container-width column decision: >560px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth > 560 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<PickupState>(INITIAL_STATE);
  const {rxList, ui} = state;

  // THE one mutation path — id is an rx id or 'ui'.
  const update = useCallback((id: string, patch: Partial<RxItem> | Partial<UiState>) => {
    setState(prev =>
      id === 'ui'
        ? {...prev, ui: {...prev.ui, ...(patch as Partial<UiState>)}}
        : {
            ...prev,
            rxList: prev.rxList.map(rx => (rx.id === id ? {...rx, ...(patch as Partial<RxItem>)} : rx)),
          },
    );
  }, []);

  // DERIVED — never stored (the template's thesis).
  const selectedRx = rxList.filter(rx => rx.selected);
  const count = selectedRx.length;
  const insTotalCents = selectedRx.reduce((sum, rx) => sum + rx.priceInsCents, 0);
  const cashTotalCents = selectedRx.reduce((sum, rx) => sum + rx.priceCashCents, 0);
  const savingsCents = cashTotalCents - insTotalCents;
  const warningActive = INTERACTION_PAIR.every(id => rxList.some(rx => rx.id === id && rx.selected));
  const waitMin = count === 0 ? null : 1 + count + (warningActive ? 3 : 0);
  const code = codeFor(selectedRx);

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const seqRef = useRef(0);
  const lastCodeRef = useRef<string | null>(null);

  const announce = (text: string) => {
    seqRef.current += 1;
    update('ui', {statusMsg: {seq: seqRef.current, text}});
  };

  // statusPill auto-clears after 4s (fixed interval — no clock reads).
  useEffect(() => {
    if (ui.statusMsg == null) return undefined;
    const timer = setTimeout(() => update('ui', {statusMsg: null}), 4000);
    return () => clearTimeout(timer);
  }, [ui.statusMsg, update]);

  // Large-title collapse — IntersectionObserver sentinel directly under
  // the largeTitle block; user-driven scroll keeps it deterministic. Under
  // reduced motion the fade is an opacity swap (lrx-fade drops transition).
  const [compactTitleVisible, setCompactTitleVisible] = useState(false);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(
      entries => setCompactTitleVisible(!(entries[0]?.isIntersecting ?? true)),
      {rootMargin: '-52px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Focus into the opening sheet — preventScroll per the batch-1
  // amendment: plain .focus() scroll-reveals the animating sheet inside
  // the locked overflow-hidden column and beaches it mid-screen; the
  // scrollTop reset is the belt to that suspender.
  useEffect(() => {
    if (ui.sheetOpen) {
      sheetCloseRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [ui.sheetOpen]);

  // Escape closes the topmost overlay — the sheet is the only overlay.
  useEffect(() => {
    if (!ui.sheetOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      update('ui', {sheetOpen: false});
      confirmBtnRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ui.sheetOpen, update]);

  // CONSEQUENCE CHAIN — one toggle rewrites: row check + tint → footer
  // summary + savings → meter wait caption → warning card mount/unmount →
  // statusPill announcement with the DERIVED count/total.
  const toggleRx = (rx: RxItem) => {
    const nextSelected = !rx.selected;
    const nextList = rxList.map(item => (item.id === rx.id ? {...item, selected: nextSelected} : item));
    const nextChosen = nextList.filter(item => item.selected);
    const nextTotal = nextChosen.reduce((sum, item) => sum + item.priceInsCents, 0);
    update(rx.id, {selected: nextSelected});
    announce(
      nextChosen.length === 0
        ? \`\${rx.shortName} removed · no items selected\`
        : \`\${rx.shortName} \${nextSelected ? 'added' : 'removed'} · \${nextChosen.length} item\${
            nextChosen.length === 1 ? '' : 's'
          }, \${fmtUsd(nextTotal)}\`,
    );
  };

  const openSheet = () => {
    if (count === 0) return;
    // 'Pass updated · LK9958' on reopen with a changed selection — the
    // code is a pure function of the selection, so this is provable.
    if (lastCodeRef.current != null && lastCodeRef.current !== code) {
      announce(\`Pass updated · \${code}\`);
    }
    lastCodeRef.current = code;
    update('ui', {sheetOpen: true, sheetDetent: 'large'});
  };
  const closeSheet = () => {
    update('ui', {sheetOpen: false});
    confirmBtnRef.current?.focus();
  };

  // 'Review pair' — the warning card's visible non-gesture path to the
  // two flagged rows.
  const reviewPair = () => {
    rowRefs.current[INTERACTION_PAIR[0]]?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'center',
    });
    rowRefs.current[INTERACTION_PAIR[0]]?.focus({preventScroll: true});
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const summaryText =
    count === 0
      ? 'No items selected'
      : \`\${count} item\${count === 1 ? '' : 's'} · \${fmtUsd(insTotalCents)} with insurance\`;
  const captionText =
    count === 0 ? 'Choose at least one prescription' : \`You save \${fmtUsd(savingsCents)} vs. cash prices\`;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{LRX_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <LarkspurMark />
          </div>
          <span
            className="lrx-fade"
            style={{...styles.navTitle, opacity: compactTitleVisible ? 1 : 0}}
            aria-hidden={!compactTitleVisible}>
            Pickup
          </span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="lrx-btn lrx-focusable"
              style={styles.iconBtn}
              aria-label="Refresh pickup status"
              onClick={() => {
                update('ui', {refreshed: true});
                announce('Updated just now');
              }}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <div style={styles.largeTitle}>
            <h1 style={styles.largeTitleText}>Pickup</h1>
          </div>
          <p style={styles.titleCaption}>
            {PHARMACY.name} · {PHARMACY.branch}
          </p>
          <div ref={sentinelRef} style={styles.sentinel} aria-hidden />

          <ReadyWindowMeter waitMin={waitMin} />

          <h2 style={styles.sectionHeader}>Ready for pickup · {rxList.length}</h2>
          <div style={styles.listCard}>
            {rxList.map((rx, index) => (
              <div key={rx.id}>
                {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                <RxSelectRow
                  rx={rx}
                  rowRef={node => {
                    rowRefs.current[rx.id] = node;
                  }}
                  onToggle={() => toggleRx(rx)}
                />
              </div>
            ))}
          </div>

          {warningActive ? (
            <div style={styles.warningCard}>
              <span style={styles.warningIcon}>
                <Icon icon={TriangleAlertIcon} size="md" color="inherit" />
              </span>
              <div style={styles.warningText}>
                <h3 style={styles.warningTitle}>Interaction flagged</h3>
                <p style={styles.warningBody}>
                  Azithromycin + Warfarin can increase bleeding risk. A pharmacist consult was added
                  (+3 min at counter).
                </p>
              </div>
              <button
                type="button"
                className="lrx-btn lrx-focusable"
                style={styles.reviewBtn}
                onClick={reviewPair}>
                Review pair
              </button>
            </div>
          ) : null}

          <h2 style={styles.sectionHeader}>Pharmacy</h2>
          <div style={styles.listCard}>
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Today</span>
              <span style={styles.utilityValue}>{PHARMACY.hoursToday}</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Saturday</span>
              <span style={styles.utilityValue}>{PHARMACY.hoursSat}</span>
            </div>
            <div style={styles.rowDivider} />
            <button
              type="button"
              className="lrx-btn lrx-focusable"
              style={styles.utilityRow}
              aria-label={\`Address, \${PHARMACY.address} — directions\`}
              onClick={() => announce('Directions are illustrative')}>
              <span style={styles.utilityLabel}>Address</span>
              <span style={styles.utilityValue}>{PHARMACY.address}</span>
              <span style={styles.chevron}>
                <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
              </span>
            </button>
            <div style={styles.rowDivider} />
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Pharmacist</span>
              <span style={styles.utilityValue}>{PHARMACY.pharmacist}</span>
            </div>
          </div>

          <div style={styles.bottomSpacer} />
        </main>

        {/* The single polite live region — STICKY-IN-FLOW dock (batch-1
            amendment: shell-absolute pins to the document bottom on tall
            scrolling views); pill renders only while a message is active. */}
        <div style={styles.statusDock} aria-live="polite" role="status">
          {ui.statusMsg != null ? (
            <div key={ui.statusMsg.seq} className="lrx-fade" style={styles.statusPill}>
              {ui.statusMsg.text}
            </div>
          ) : null}
        </div>

        <footer style={styles.footer}>
          <div style={styles.footerSummary}>{summaryText}</div>
          <div style={styles.footerCaption}>{captionText}</div>
          <button
            type="button"
            ref={confirmBtnRef}
            className="lrx-btn lrx-focusable"
            style={{...styles.confirmBtn, ...(count === 0 ? styles.confirmBtnDisabled : null)}}
            disabled={count === 0}
            aria-disabled={count === 0}
            onClick={openSheet}>
            Confirm pickup
          </button>
        </footer>

        {ui.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {ui.sheetOpen ? (
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lrx-pass-title"
            tabIndex={-1}
            className="lrx-sheet-in"
            onKeyDown={event => trapTabKey(event, sheetRef.current)}
            style={{
              ...styles.sheet,
              // LARGE detent (navBar peeks) ↔ MEDIUM 55% — both wired via
              // the grabber button.
              height: ui.sheetDetent === 'large' ? 'calc(100% - 56px)' : '55%',
            }}>
            <button
              type="button"
              className="lrx-btn lrx-focusable"
              style={styles.grabberZone}
              aria-label="Resize sheet"
              onClick={() =>
                update('ui', {sheetDetent: ui.sheetDetent === 'large' ? 'medium' : 'large'})
              }>
              <span style={styles.grabberPill} aria-hidden />
            </button>
            <div style={styles.sheetHeader}>
              <span aria-hidden />
              <h2 id="lrx-pass-title" style={styles.sheetTitle}>
                Pickup pass
              </h2>
              <button
                type="button"
                ref={sheetCloseRef}
                className="lrx-btn lrx-focusable"
                style={styles.iconBtn}
                aria-label="Close pickup pass"
                onClick={closeSheet}>
                <Icon icon={XIcon} size="md" color="inherit" />
              </button>
            </div>
            {/* The one legal inner scroller. */}
            <div style={styles.sheetBody}>
              <PickupPassCard
                code={code}
                count={count}
                boostOn={ui.boostOn}
                onToggleBoost={() => update('ui', {boostOn: !ui.boostOn})}
              />
              <div style={{...styles.listCard, marginInline: 0, marginTop: 12}}>
                {selectedRx.map((rx, index) => (
                  <div key={rx.id}>
                    {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                    <div style={styles.passListRow}>
                      <RefillGauge refillsLeft={rx.refillsLeft} refillsTotal={rx.refillsTotal} size="pass" />
                      <span style={styles.passListName}>{rx.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p style={styles.sheetCaption}>Show at counter before 7:00 PM</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};