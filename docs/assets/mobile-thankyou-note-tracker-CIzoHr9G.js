var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Gracenote post-wedding
 *   thank-you ledger: 14 received gifts across 9 households binding to 10
 *   notes (H4 Brennan pre-merged 3 gifts −2, H7 Patel −1, H9
 *   Moreau-Finch-Vanterpool −1 = −4 merge reductions; 14 − 4 = 10 ✓).
 *   Sent = 3 (H7 Jun 21 · H8 Jun 18 · H9 Jun 25), remaining = 7 = TO
 *   WRITE 3 (H1×2 unmerged + H5) + DRAFTED 3 (H2 + H3 + H4) + SEALED 1
 *   (H6). Sealed gift tiles at rest = H7(2)+H8(1)+H9(2) = 5. No
 *   Date.now(), no Math.random(), no network media — "sent today" is the
 *   fixed string 'Jul 4' / stamp text 'JUL 4'; gift art is id-derived
 *   HSL gradients (hash formula at the fixture block).
 * @output Gracenote — Thank-You Note Tracker: a 390px MOBILE ledger.
 *   NavBar (folded-letter 'g' brand mark · fade-in compact title ·
 *   RemainingRing 40px SVG, r=18 sw=4, C≈113.1, dash 33.9 at 3-of-10
 *   sent) over a 28px/700 'Thank-Yous' large title, three tabs (Queue
 *   with remaining badge · Sent · Gifts) all pure projections of ONE
 *   noteLedger. Queue: three stage sections of household listCards —
 *   72px GiftNoteRows with a four-dot stage spine, id-gradient 48px gift
 *   tiles, stage chips, mandatory 44×44 ellipsis menus, and swipe-RIGHT
 *   +72px 'Send' commit on drafted rows; multi-gift unmerged households
 *   render as HouseholdCollapser cards whose 44px 'Combine into one
 *   note' merge row arithmetically drops the note count 10→9 (n−1).
 *   Signature: sending drafted H3 postmarks the row (StampSweep 40px
 *   rotated stamp + dashed postmark arc), ticks the ring 7→6 (arc
 *   re-derives to 4/10), adds a dated Sent PostmarkEntry, seals the
 *   Gifts tile, and raises a PERSISTENT no-timer Undo toast. Draft
 *   sheet: two detents, gift context block, textarea formField, prompt
 *   chips (+3 at large), stage-derived footer button 'Mark drafted' →
 *   'Mark sealed' → 'Mark sent'. Sent rows open a read-only sheet with a
 *   36px 'Unsend' secondary routed through the same undo-capable patch.
 * @position Page template; emitted by \`astryx template mobile-thankyou-note-tracker\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, sheet,
 *   anchored menus) are position:'absolute' INSIDE shell; position:fixed
 *   is banned. While the sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The toastDock is
 *   STICKY-IN-FLOW (bottom:76 above the 64px tabBar) — shell-absolute
 *   would pin to the DOCUMENT bottom on tall scrolling tabs (foundations
 *   amendment); it flips to absolute bottom:76 ONLY while the sheet
 *   scroll-lock is active.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 68 where rows lead with the 48px
 *   tile / 16 elsewhere, none on last row); 2-col Gifts grid; no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   (Gracenote rose) split per house rule into fill vs on-fill text with
 *   contrast math at each declaration; the one sanctioned non-brand
 *   literal is PENDING_INK — the amendment-mandated explicit ≥3:1
 *   light-dark() pair for meaningful rest fills (pending spine dots,
 *   RemainingRing track; spec said --color-border, overridden by the
 *   binding hairlines-are-passive-only amendment). Hairline tokens stay
 *   passive-separator-only.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps. NavBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', always-on hairline —
 *   chosen mode: always-on); largeTitle row 52px (28px/700 at the 16px
 *   gutter; total header 104px); tabBar exactly 64px sticky bottom z20
 *   (24px icon over 11px/500 label, 4px gap; Queue badge 16px-min brand
 *   pill 10px/600 at top:−4 right:−8). ROWS: GiftNoteRow 72px (8px
 *   stage spine · 48px tile · two-line stack · chip · 44×44 ellipsis);
 *   household header 60px two-line; merge row 44px; PostmarkEntry 72px;
 *   sheet context rows 60px. sectionHeader 13px/600 uppercase 0.06em at
 *   32px from the stage edge, 20px top / 8px bottom. TYPE (Figtree via
 *   --font-family-body): 28/700 large title · 17/600 nav + sheet titles
 *   · 16/400–500 body + row primary + textarea (floor) · 13/400 meta ·
 *   11/500 tab labels, chips, overlines; nothing under 11px;
 *   tabular-nums on the ring count, badge, and every derived count.
 *   Buttons: 48px sheet primary, 36px Unsend secondary, 44×44 icon
 *   buttons. Sheet detents 55% / calc(100% − 56px), 24px grabber zone
 *   with 36×5 pill, 52px sheet header. Touch: every target ≥44×44 with
 *   ≥8px clearance or merged full-row; every gesture has a visible
 *   button path (swipe → ellipsis menu + sheet footer button; sheet
 *   drag → grabber button + X).
 *
 * Responsive contract:
 * - Fluid 320–430px: all rows/cards fluid; gift/household names
 *   ellipsize (minWidth:0 text stacks); nav title maxWidth 200; Gifts
 *   grid stays repeat(2,1fr) with 13px single-line tile text; ring,
 *   tiles, spine, stamp fixed-px; swipe snap fixed ±72px. At card
 *   widths ≤308px (stage ≈≤340px) the stage chip swaps to dot-only via
 *   an @container query on the listCard (label stays in the row's
 *   accessible name). overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout — per spec the phone
 *   experience renders as the centered column.
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
  GiftIcon,
  InboxIcon,
  MailCheckIcon,
  MergeIcon,
  MoreHorizontalIcon,
  PenLineIcon,
  StampIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Gracenote rose). #B0426E on #FFFFFF ≈
// 5.5:1 (passes 4.5:1; spec's ≈5.9 rounds the same pass); #E48AAD on the
// dark card (~#1C1C1E) ≈ 6.9:1.
const BRAND_ACCENT = 'light-dark(#B0426E, #E48AAD)';
// Text/glyphs over a BRAND_ACCENT fill (stamp heart, Send block, badge).
// Light: #FFFFFF on #B0426E ≈ 5.5:1. Dark: white on #E48AAD fails
// (≈2.6:1), so the dark side flips to a deep rose — #3A1120 on #E48AAD ≈
// 6.7:1. (Spec said "white on stamp"; deviation for dark-scheme contrast,
// math above.)
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #3A1120)';
// Brand-tinted wash for the brand mark plate / pressed chips.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// AMENDMENT PAIR — meaningful rest fills (pending spine dots, ring
// track): hairline/muted tokens are passive-separator-only, so these get
// an explicit ≥3:1 pair vs their ACTUAL surfaces. Light #877E74 on the
// white card ≈ 4.0:1; dark #8A8078 on the ~#1C1C1E card ≈ 4.2:1 — both
// clear the 3:1 non-text minimum with margin.
const PENDING_INK = 'light-dark(#877E74, #8A8078)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, textarea focus ring,
// the visually-hidden h1, keyframes, the ≤308px-card chip-text container
// query, and the reduced-motion guard (transform/opacity only; all
// animation collapses to instant).
// ---------------------------------------------------------------------------

const GRACENOTE_CSS = \`
.gn-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.gn-btn:disabled { cursor: default; }
.gn-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.gn-fade { transition: opacity 200ms ease; }
.gn-anim { transition: transform 200ms ease, opacity 200ms ease; }
.gn-input:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px \${BRAND_ACCENT};
}
.gn-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@keyframes gn-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.gn-sheet-in { animation: gn-sheet-in 240ms ease; }
@keyframes gn-card-in {
  from { transform: translateY(-6px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.gn-card-in { animation: gn-card-in 200ms ease; }
@keyframes gn-stamp-in {
  from { transform: rotate(-8deg) scale(1.15); opacity: 0; }
  to { transform: rotate(-8deg) scale(1); opacity: 1; }
}
.gn-stamp-in { animation: gn-stamp-in 320ms ease both; }
@keyframes gn-postmark-in {
  from { transform: rotate(6deg); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.gn-postmark-in { animation: gn-postmark-in 240ms ease 320ms both; }
/* Stage chip: text at rest, dot-only when the CARD is ≤308px wide
   (stage ≈≤340px); the stage stays in the row's accessible name. */
.gn-cq { container-type: inline-size; }
.gn-chip-dot { display: none; }
@container (max-width: 308px) {
  .gn-chip-text { display: none; }
  .gn-chip-dot { display: inline-block; }
}
@media (prefers-reduced-motion: reduce) {
  .gn-fade, .gn-anim { transition: none; }
  .gn-sheet-in, .gn-card-in, .gn-stamp-in, .gn-postmark-in { animation: none; }
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
  // Scroll lock while the sheet is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 slots
  // optically align content to the 16px gutter. Hairline ALWAYS ON
  // (chosen mode, noted per contract).
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
  // 44×44 non-interactive brand slot holding the 28px folded-letter mark.
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  // Compact title — starts opacity 0; fades in when the large title
  // scrolls under (IntersectionObserver sentinel).
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // RemainingRing — 40px SVG in a 44×44 non-interactive slot.
  ringSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  ringBox: {position: 'relative', width: 40, height: 40},
  ringCount: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  // LARGE TITLE row — 52px; total header 104px with the navBar.
  largeTitle: {height: 52, display: 'flex', alignItems: 'center', paddingInline: 16},
  largeTitleText: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1},
  sentinel: {height: 1},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
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
  // Stacked household cards — 12px apart inside a section.
  cardStack: {display: 'flex', flexDirection: 'column', gap: 12},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // Rows lead with the 48px tile → 68px inset divider.
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  terminalCaption: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // GIFT-NOTE ROW — 72px; swipe clip + leading Send block behind.
  rowOuter: {position: 'relative'},
  swipeClip: {position: 'relative', overflow: 'hidden'},
  sendBlock: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  rowContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  rowBtn: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInlineStart: 6,
  },
  spineBox: {width: 8, flexShrink: 0, display: 'grid', placeItems: 'center'},
  tileWrap: {position: 'relative', width: 48, height: 48, flexShrink: 0},
  textStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  primaryLine: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  secondaryLine: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Stage chip — 11px/500 overline pill, muted fill; dot-only ≤308px card.
  stageChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 8,
    height: 22,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    flexShrink: 0,
  },
  chipDot: {width: 6, height: 6, borderRadius: '50%', background: 'currentColor'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // Anchored row menu — absolute card, 12px radius, ≥44px rows, z30
  // (below the sheet scrim's z40).
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    minWidth: 224,
    maxWidth: 'calc(100% - 24px)',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'hidden',
  },
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
  menuRowDisabled: {opacity: 0.4},
  // Household collapser chrome.
  householdHeader: {
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 16,
  },
  mergeRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // Stacked tile for merged notes — two offset 40px tiles in the 48px box.
  stackTileBack: {position: 'absolute', top: 0, left: 0, width: 40, height: 40},
  stackTileFront: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 40,
    height: 40,
    border: '2px solid var(--color-background-card)',
    borderRadius: 12,
  },
  stackPlusBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    minWidth: 16,
    height: 16,
    paddingInline: 3,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 11,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // EMPTY STATE — true-empty Queue after all 10 notes are sent.
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
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0'},
  // GIFTS TAB — 2-col grid, 12px gap, 16px inline padding.
  giftsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
    padding: '4px 16px 0',
  },
  giftTileBtn: {
    position: 'relative',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    borderRadius: 12,
  },
  giftTileArt: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
  },
  giftTileName: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  giftTileMeta: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // SENT TAB — 72px PostmarkEntry rows.
  sentRowBtn: {
    width: '100%',
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  postmarkDate: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // STAMP SWEEP — full 40px variant lands at the row's top-right inset 8.
  stampAnchor: {position: 'absolute', top: 8, right: 8, width: 56, height: 56, pointerEvents: 'none'},
  stampSquare: {
    position: 'absolute',
    top: 8,
    right: 4,
    width: 40,
    height: 40,
    borderRadius: 6,
    background: BRAND_ACCENT,
    border: '2px dashed var(--color-background-card)',
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
    transform: 'rotate(-8deg)',
  },
  postmarkSvg: {position: 'absolute', inset: 0, overflow: 'visible'},
  // Mini resting sealed badge — 16px, top:−4 right:−4 of the tile.
  stampMini: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 3,
    background: BRAND_ACCENT,
    border: '1px solid var(--color-background-card)',
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
    transform: 'rotate(-8deg)',
  },
  // TOAST DOCK — STICKY-IN-FLOW above the tabBar (the shell grows with
  // content, so absolute bottom:N would pin to the DOCUMENT bottom and
  // sit off-viewport on tall tabs — foundations amendment). While the
  // sheet scroll-lock is active it flips to absolute (shell is 100dvh).
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    paddingInline: 16,
    marginTop: 12,
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    paddingInline: 0,
    marginTop: 0,
  },
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
    fontVariantNumeric: 'tabular-nums',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    height: 48,
    minWidth: 44,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // TAB BAR — exactly 64px, sticky bottom z20, blur + top hairline.
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
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  tabBadge: {
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
  // SHEET — scrim z40 + sheet z41, absolute inside shell.
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
    touchAction: 'none',
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  ctxRow: {display: 'flex', alignItems: 'center', gap: 12, minHeight: 60},
  formLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: 8,
  },
  draftInput: {
    width: '100%',
    minHeight: 96,
    boxSizing: 'border-box',
    background: 'var(--color-background-muted)',
    border: 'none',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 16,
    fontFamily: 'var(--font-family-body)',
    color: 'var(--color-text-primary)',
    lineHeight: 1.45,
    resize: 'vertical',
  },
  draftReadonly: {
    fontSize: 16,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    margin: 0,
    padding: '12px 16px',
    background: 'var(--color-background-muted)',
    borderRadius: 12,
  },
  chipRow: {display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4},
  chipBtn: {height: 44, display: 'inline-flex', alignItems: 'center', borderRadius: 999},
  chipPill: {
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 500,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  secondaryBtn: {
    width: '100%',
    height: 36,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'grid',
    placeItems: 'center',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — ARITHMETIC LEDGER, cross-checked by hand before shipping:
// gifts per household 2+1+1+3+1+1+2+1+2 = 14 ✓; notes = 14 gifts − merge
// reductions (H4 −2, H7 −1, H9 −1 = −4) = 10 ✓; sent = 3 (H7, H8, H9) →
// remaining = 7 = navBar ring count = Queue badge ✓; Queue sections TO
// WRITE = H1×2 + H5 = 3, DRAFTED = H2 + H3 + H4 = 3, SEALED = H6 = 1,
// 3+3+1 = 7 ✓; Sent tab = 3 rows ✓; Gifts tab = 14 tiles, sealed badges =
// H7(2) + H8(1) + H9(2) = 5 ✓. After the signature swipe (H3 sent):
// remaining 6, sent 4, sealed tiles 6, ring arc 4/10. After the H1 merge:
// notes 10→9, remaining 7→6 (n−1 = 1). Every displayed number derives
// from the noteLedger at render — no stored literals.
// Gift art: hue = (sum of giftId charCodes × 37) % 360;
// linear-gradient(135deg, hsl(h 55% 82%), hsl((h+40)%360 60% 68%)) —
// deterministic, no Math.random().
// ---------------------------------------------------------------------------

type Stage = 'unwritten' | 'drafted' | 'sealed' | 'sent';

const STAGE_ORDER: Stage[] = ['unwritten', 'drafted', 'sealed', 'sent'];
const STAGE_LABEL: Record<Stage, string> = {
  unwritten: 'UNWRITTEN',
  drafted: 'DRAFTED',
  sealed: 'SEALED',
  sent: 'SENT',
};

interface Household {
  id: string;
  name: string; // short ledger name ('Osei')
  displayName: string; // Sent-row / sheet display
  giver: string;
  occasion: string; // 'Wedding'
  occasionDate: string; // 'May 30'
}

// Dual-field identity consts — every entity referenced by const, not by
// string literal at the use site.
const HOUSEHOLDS = {
  alvarezKim: {
    id: 'hh_alvarez_kim',
    name: 'Alvarez–Kim',
    displayName: 'Alvarez–Kim Household',
    giver: 'Dana & Miguel Alvarez-Kim',
    occasion: 'Wedding',
    occasionDate: 'May 30',
  },
  whitfield: {
    id: 'hh_whitfield',
    name: 'Whitfield',
    displayName: 'The Whitfields',
    giver: 'Nora & Sam Whitfield',
    occasion: 'Wedding',
    occasionDate: 'May 30',
  },
  osei: {
    id: 'hh_osei',
    name: 'Osei',
    displayName: 'The Osei Family',
    giver: 'Abena & Kofi Osei',
    occasion: 'Wedding',
    occasionDate: 'May 30',
  },
  brennan: {
    id: 'hh_brennan',
    name: 'Brennan',
    displayName: 'The Brennans',
    giver: 'Maeve & Colm Brennan',
    occasion: 'Wedding',
    occasionDate: 'May 30',
  },
  nakamura: {
    id: 'hh_nakamura',
    name: 'Nakamura',
    displayName: 'Yui Nakamura',
    giver: 'Yui Nakamura',
    occasion: 'Wedding',
    occasionDate: 'May 30',
  },
  delacroix: {
    id: 'hh_delacroix',
    name: 'Delacroix',
    displayName: 'The Delacroix Household',
    giver: 'Émile & Claire Delacroix',
    occasion: 'Wedding',
    occasionDate: 'May 30',
  },
  patel: {
    id: 'hh_patel',
    name: 'Patel',
    displayName: 'The Patels',
    giver: 'Priya & Dev Patel',
    occasion: 'Wedding',
    occasionDate: 'May 30',
  },
  grady: {
    id: 'hh_grady',
    name: 'Grady',
    displayName: 'Aunt Ruth Grady',
    giver: 'Ruth Grady',
    occasion: 'Shower',
    occasionDate: 'Apr 12',
  },
  // Stress fixture (1): the long household name — Sent row + sheet header
  // ellipsize single-line at every width.
  moreauFinch: {
    id: 'hh_moreau_finch',
    name: 'Moreau-Finch',
    displayName: 'The Moreau-Finch-Vanterpool Family',
    giver: 'Solène Moreau-Finch & Theo Vanterpool',
    occasion: 'Engagement',
    occasionDate: 'Feb 8',
  },
} as const satisfies Record<string, Household>;

interface GiftFixture {
  id: string;
  name: string;
  householdId: string;
}

// 14 gifts — sum per household 2+1+1+3+1+1+2+1+2 = 14 ✓.
const GIFTS: GiftFixture[] = [
  {id: 'gift_mixer', name: 'Stand mixer', householdId: HOUSEHOLDS.alvarezKim.id},
  {id: 'gift_board', name: 'Walnut serving board', householdId: HOUSEHOLDS.alvarezKim.id},
  {id: 'gift_linen', name: 'Linen tablecloth', householdId: HOUSEHOLDS.whitfield.id},
  {id: 'gift_decanter', name: 'Crystal decanter', householdId: HOUSEHOLDS.osei.id},
  {id: 'gift_knife', name: 'Knife block', householdId: HOUSEHOLDS.brennan.id},
  {id: 'gift_honey', name: 'Orchard honey set', householdId: HOUSEHOLDS.brennan.id},
  {id: 'gift_frames', name: 'Gallery frames', householdId: HOUSEHOLDS.brennan.id},
  // Stress fixture (2): the long gift name — the 16px primary line
  // ellipsizes at all widths; tile and chip untouched.
  {
    id: 'gift_vase',
    name: 'Hand-thrown ceramic ikebana vase with kenzan',
    householdId: HOUSEHOLDS.nakamura.id,
  },
  {id: 'gift_espresso', name: 'Espresso machine', householdId: HOUSEHOLDS.delacroix.id},
  {id: 'gift_dutch', name: 'Cast-iron dutch oven', householdId: HOUSEHOLDS.patel.id},
  {id: 'gift_cheese', name: 'Bamboo cheese board', householdId: HOUSEHOLDS.patel.id},
  {id: 'gift_quilt', name: 'Hand-quilted blanket', householdId: HOUSEHOLDS.grady.id},
  {id: 'gift_coupes', name: 'Champagne coupe set', householdId: HOUSEHOLDS.moreauFinch.id},
  {id: 'gift_sketch', name: 'Framed engagement sketch', householdId: HOUSEHOLDS.moreauFinch.id},
];

interface Note {
  id: string;
  householdId: string;
  giftIds: string[];
  stage: Stage;
  postmark: string | null; // display date ('Jun 21')
  postmarkDay: number | null; // dual field — day-of-year for sort order
  draft: string;
}

// 10 notes ✓ (H4/H7/H9 pre-merged). The 'sent today' postmark is the
// fixed pair 'Jul 4' / day 185 — no Date.now().
const SENT_TODAY_LABEL = 'Jul 4';
const SENT_TODAY_DAY = 185;
const STAMP_TEXT = 'JUL 4';

const NOTES: Note[] = [
  {
    id: 'note_h1a',
    householdId: HOUSEHOLDS.alvarezKim.id,
    giftIds: ['gift_mixer'],
    stage: 'unwritten',
    postmark: null,
    postmarkDay: null,
    draft: '',
  },
  {
    id: 'note_h1b',
    householdId: HOUSEHOLDS.alvarezKim.id,
    giftIds: ['gift_board'],
    stage: 'unwritten',
    postmark: null,
    postmarkDay: null,
    draft: '',
  },
  {
    id: 'note_h5',
    householdId: HOUSEHOLDS.nakamura.id,
    giftIds: ['gift_vase'],
    stage: 'unwritten',
    postmark: null,
    postmarkDay: null,
    draft: '',
  },
  {
    id: 'note_h2',
    householdId: HOUSEHOLDS.whitfield.id,
    giftIds: ['gift_linen'],
    stage: 'drafted',
    postmark: null,
    postmarkDay: null,
    draft: 'Dear Nora and Sam, the linen tablecloth already lives on our Sunday table —',
  },
  // Signature swipe target.
  {
    id: 'note_h3',
    householdId: HOUSEHOLDS.osei.id,
    giftIds: ['gift_decanter'],
    stage: 'drafted',
    postmark: null,
    postmarkDay: null,
    draft:
      'Dear Abena and Kofi, thank you so much for the crystal decanter. We toasted with it the very first night home.',
  },
  // Stress fixture (3): the pre-merged 3-gift note — proves n−1 math at
  // n = 3 and its sheet lists all three gifts in the context block.
  {
    id: 'note_h4',
    householdId: HOUSEHOLDS.brennan.id,
    giftIds: ['gift_knife', 'gift_honey', 'gift_frames'],
    stage: 'drafted',
    postmark: null,
    postmarkDay: null,
    draft:
      'Dear Maeve and Colm, three parcels and every one of them perfect — the knife block, the orchard honey, the gallery frames.',
  },
  {
    id: 'note_h6',
    householdId: HOUSEHOLDS.delacroix.id,
    giftIds: ['gift_espresso'],
    stage: 'sealed',
    postmark: null,
    postmarkDay: null,
    draft:
      'Dear Émile and Claire, the espresso machine has ruined every café for us, and we could not be happier about it. With love and gratitude, A & J',
  },
  {
    id: 'note_h7',
    householdId: HOUSEHOLDS.patel.id,
    giftIds: ['gift_dutch', 'gift_cheese'],
    stage: 'sent',
    postmark: 'Jun 21',
    postmarkDay: 172,
    draft:
      'Dear Priya and Dev, the dutch oven and cheese board have already hosted their first dinner party. Thank you both. With love, A & J',
  },
  {
    id: 'note_h8',
    householdId: HOUSEHOLDS.grady.id,
    giftIds: ['gift_quilt'],
    stage: 'sent',
    postmark: 'Jun 18',
    postmarkDay: 169,
    draft:
      'Dear Aunt Ruth, the quilt is the softest thing in the apartment and we fight over it nightly. Thank you. Love, A & J',
  },
  {
    id: 'note_h9',
    householdId: HOUSEHOLDS.moreauFinch.id,
    giftIds: ['gift_coupes', 'gift_sketch'],
    stage: 'sent',
    postmark: 'Jun 25',
    postmarkDay: 176,
    draft:
      'Dear Solène and Theo, the coupes and the sketch made us cry twice in one afternoon. Thank you for remembering February. Love, A & J',
  },
];

// Prompt chips — the first 3 render at medium detent; the large detent
// reveals 3 more (fixed suggestion strings, appended to the draft).
interface PromptChip {
  id: string;
  label: string;
  snippet: string;
}

const PROMPT_CHIPS_BASE: PromptChip[] = [
  {id: 'chip_open', label: 'Open warmly', snippet: 'Dear friends, '},
  {id: 'chip_gift', label: 'Name the gift', snippet: 'Thank you so much for the thoughtful gift. '},
  {id: 'chip_moment', label: 'Share a moment', snippet: 'We thought of you the moment we unwrapped it. '},
];

const PROMPT_CHIPS_LARGE: PromptChip[] = [
  {id: 'chip_ahead', label: 'Look ahead', snippet: "We can't wait to have you over to enjoy it together. "},
  {id: 'chip_day', label: 'Recall the day', snippet: 'Having you with us on May 30 meant the world. '},
  {id: 'chip_sign', label: 'Sign off', snippet: 'With love and gratitude, A & J'},
];

// ---------------------------------------------------------------------------
// LOOKUPS & FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

const HOUSEHOLD_BY_ID: Record<string, Household> = Object.fromEntries(
  Object.values(HOUSEHOLDS).map(household => [household.id, household]),
);
const GIFT_BY_ID: Record<string, GiftFixture> = Object.fromEntries(
  GIFTS.map(gift => [gift.id, gift]),
);

/** Deterministic gift hue: (charCode sum × 37) % 360. */
function giftHue(giftId: string): number {
  let sum = 0;
  for (let i = 0; i < giftId.length; i++) sum += giftId.charCodeAt(i);
  return (sum * 37) % 360;
}

/** Id-derived tile gradient — formula in the fixture comment. */
function giftGradient(giftId: string): string {
  const hue = giftHue(giftId);
  return \`linear-gradient(135deg, hsl(\${hue} 55% 82%), hsl(\${(hue + 40) % 360} 60% 68%))\`;
}

function noteHousehold(note: Note): Household {
  return HOUSEHOLD_BY_ID[note.householdId];
}

function noteGifts(note: Note): GiftFixture[] {
  return note.giftIds.map(id => GIFT_BY_ID[id]);
}

/** Row primary: gift name, or 'Alvarez–Kim (2 gifts)' for merged notes. */
function notePrimary(note: Note): string {
  if (note.giftIds.length === 1) return GIFT_BY_ID[note.giftIds[0]].name;
  return \`\${noteHousehold(note).name} (\${note.giftIds.length} gifts)\`;
}

/** Row secondary: 'Household · Occasion', or joined gift names when merged. */
function noteSecondary(note: Note): string {
  const household = noteHousehold(note);
  if (note.giftIds.length === 1) return \`\${household.name} · \${household.occasion}\`;
  return noteGifts(note)
    .map(gift => gift.name)
    .join(' · ');
}

// ---------------------------------------------------------------------------
// RING GEOMETRY — r = 18, strokeWidth 4, circumference 2π·18 ≈ 113.1. At
// rest 3 of 10 sent → 0.30 × 113.1 = 33.9 dash; after the signature swipe
// 4/10 → 45.2; after the H1 merge 3/9 → 37.7 — all derived at render.
// ---------------------------------------------------------------------------

const RING_R = 18;
const RING_C = 2 * Math.PI * RING_R; // ≈ 113.1

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useGracenoteState(): the noteLedger (notes byId +
// order) plus ui, mutated through one update(id, patch); Queue, Sent,
// Gifts, ring, and badge are all pure projections of it. lastNotes is the
// undo snapshot (exact prior byId + order, so Undo restores original list
// positions).
// ---------------------------------------------------------------------------

type Tab = 'queue' | 'sent' | 'gifts';

interface NoteStore {
  byId: Record<string, Note>;
  order: string[];
}

interface ToastState {
  seq: number;
  text: string;
  canUndo: boolean;
}

interface UiState {
  tab: Tab;
  scrollByTab: Record<Tab, number>;
  sheet: {noteId: string; detent: 'medium' | 'large'} | null;
  menuNoteId: string | null;
  toast: ToastState | null;
  // Just-sent note kept visible in its pre-send Queue section while the
  // StampSweep plays; cleared on animation end (immediately under
  // reduced motion).
  justSent: {noteId: string; prevStage: Stage} | null;
}

interface LedgerEntities {
  notes: NoteStore;
  lastNotes: NoteStore | null;
  ui: UiState;
}

const INITIAL_ENTITIES: LedgerEntities = {
  notes: {
    byId: Object.fromEntries(NOTES.map(note => [note.id, note])),
    order: NOTES.map(note => note.id),
  },
  lastNotes: null,
  ui: {
    tab: 'queue',
    scrollByTab: {queue: 0, sent: 0, gifts: 0},
    sheet: null,
    menuNoteId: null,
    toast: null,
    justSent: null,
  },
};

function useGracenoteState() {
  const [entities, setEntities] = useState<LedgerEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof LedgerEntities>(id: K, patch: Partial<LedgerEntities[K]>) => {
      setEntities(prev => ({
        ...prev,
        [id]: prev[id] == null ? patch : {...prev[id], ...patch},
      }));
    },
    [],
  );
  return {entities, update, setEntities};
}

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
 * shell wrapper can tell the 390px mobile stage from the desktop stage.
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns scroll. */
function getScrollParent(node: HTMLElement | null): HTMLElement {
  let element = node?.parentElement ?? null;
  while (element != null) {
    const style = window.getComputedStyle(element);
    if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight) {
      return element;
    }
    element = element.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
}

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — the sheet traps focus while open; Escape closes the
// topmost overlay only; focus restores to the opener on every close path.
// ---------------------------------------------------------------------------

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
// BRAND MARK — 28px folded-letter 'g': a 20px folded-flap letter with a
// 6px filled-heart stamp square at its top-right, fill BRAND_ACCENT.
// Decorative (aria-hidden) inside a 44×44 non-interactive slot.
// ---------------------------------------------------------------------------

function GracenoteMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        {/* Folded letter body + flap. */}
        <rect x={4} y={8} width={20} height={14} rx={2.5} stroke={BRAND_ACCENT} strokeWidth={1.8} />
        <path d="M4 10.5 14 17l10-6.5" stroke={BRAND_ACCENT} strokeWidth={1.8} strokeLinejoin="round" />
        {/* 6px heart stamp square, top-right. */}
        <rect x={19} y={4} width={7} height={7} rx={1.5} fill={BRAND_ACCENT} />
        <path
          d="M22.5 9.4 21 7.9a.9.9 0 0 1 1.27-1.27l.23.22.23-.22A.9.9 0 0 1 24 7.9Z"
          fill={BRAND_FILL_TEXT}
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// REMAINING RING — 40px SVG in a 44×44 slot; derives (total − sent) and
// the arc from the store on every render. Non-interactive display; count
// changes are announced inside the toastDock mutation message, never by a
// second live region.
// ---------------------------------------------------------------------------

interface RemainingRingProps {
  total: number;
  sent: number;
}

function RemainingRing({total, sent}: RemainingRingProps) {
  const remaining = total - sent;
  const dash = total === 0 ? 0 : (sent / total) * RING_C;
  return (
    <span
      style={styles.ringSlot}
      role="img"
      aria-label={\`\${remaining} notes remaining, \${sent} of \${total} sent\`}>
      <span style={styles.ringBox}>
        <svg width={40} height={40} viewBox="0 0 40 40" fill="none" aria-hidden>
          {/* Track = the unsent share, a meaningful rest fill → explicit
              ≥3:1 PENDING_INK pair (amendment), not a hairline token. */}
          <circle cx={20} cy={20} r={RING_R} stroke={PENDING_INK} strokeWidth={4} opacity={0.45} />
          <circle
            cx={20}
            cy={20}
            r={RING_R}
            stroke={BRAND_ACCENT}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={\`\${dash.toFixed(1)} \${RING_C.toFixed(1)}\`}
            transform="rotate(-90 20 20)"
            className="gn-fade"
          />
        </svg>
        <span style={styles.ringCount}>{remaining}</span>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// STAGE SPINE — 8px column of four 6px dots spaced 14px apart, joined by
// a 2px line. Completed stages fill BRAND_ACCENT; pending dots use the
// explicit ≥3:1 PENDING_INK pair (interactive-state encoding — the
// amendment forbids hairline tokens here). aria-hidden; the stage is
// conveyed in the row's accessible name.
// ---------------------------------------------------------------------------

function StageSpine({stage}: {stage: Stage}) {
  const stageIdx = STAGE_ORDER.indexOf(stage);
  return (
    <span style={styles.spineBox} aria-hidden>
      <svg width={8} height={56} viewBox="0 0 8 56" fill="none" aria-hidden>
        <rect x={3} y={7} width={2} height={42} fill="var(--color-border)" />
        {STAGE_ORDER.map((s, index) => (
          <circle
            key={s}
            cx={4}
            cy={7 + index * 14}
            r={3}
            fill={index <= stageIdx ? BRAND_ACCENT : PENDING_INK}
          />
        ))}
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// GIFT TILES — id-derived gradient squares; merged notes stack two offset
// 40px tiles (4px offset, 2px card-color border, '+1' badge at 3+).
// Sealed tiles carry the 16px mini stamp badge at top:−4 right:−4.
// ---------------------------------------------------------------------------

function MiniSealBadge() {
  return (
    <span style={styles.stampMini} aria-hidden>
      <svg width={8} height={8} viewBox="0 0 12 12" fill="currentColor" aria-hidden>
        <path d="M6 10.5 1.8 6.3a2.6 2.6 0 0 1 3.68-3.68l.52.52.52-.52A2.6 2.6 0 0 1 10.2 6.3Z" />
      </svg>
    </span>
  );
}

interface NoteTileProps {
  note: Note;
  sealed: boolean;
}

function NoteTile({note, sealed}: NoteTileProps) {
  const gifts = note.giftIds;
  if (gifts.length === 1) {
    return (
      <span style={styles.tileWrap} aria-hidden>
        <span
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            color: '#FFFFFF',
            background: giftGradient(gifts[0]),
          }}>
          <Icon icon={GiftIcon} size="sm" color="inherit" />
        </span>
        {sealed ? <MiniSealBadge /> : null}
      </span>
    );
  }
  // Stacked 48px tile: back tile at 0,0 and front tile offset 4px with a
  // 2px card-color border; 3+ gifts add the '+n−2' style 11px badge
  // ('+1' for the Brennan 3-gift note — stress fixture 3).
  return (
    <span style={styles.tileWrap} aria-hidden>
      <span
        style={{
          ...styles.stackTileBack,
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          background: giftGradient(gifts[0]),
        }}
      />
      <span
        style={{
          ...styles.stackTileFront,
          display: 'grid',
          placeItems: 'center',
          color: '#FFFFFF',
          background: giftGradient(gifts[1]),
        }}>
        <Icon icon={GiftIcon} size="sm" color="inherit" />
      </span>
      {gifts.length > 2 ? <span style={styles.stackPlusBadge}>+{gifts.length - 2}</span> : null}
      {sealed ? <MiniSealBadge /> : null}
    </span>
  );
}

// ---------------------------------------------------------------------------
// STAMP SWEEP — terminal-state celebration on markSent: a 40px stamp
// square rotated −8° (brand fill, 2px perforated dashed border in card
// color, filled heart in BRAND_FILL_TEXT — 5.5:1 light / 6.7:1 dark)
// scales 1.15→1.0 over 320ms, then the postmark arc (dashed
// --color-text-secondary, 11px/500 'JUL 4' on path) settles in over
// 240ms. Transform/opacity only; under prefers-reduced-motion both
// render statically (the Queue row is then removed immediately, so the
// full variant is only ever seen mid-animation). Spec asked for a
// strokeDashoffset draw; a dashed stroke cannot reveal via dashoffset, so
// the arc fades/settles instead — noted deviation.
// ---------------------------------------------------------------------------

interface StampSweepProps {
  noteId: string;
  animate: boolean;
  onDone?: () => void;
}

function StampSweep({noteId, animate, onDone}: StampSweepProps) {
  const pathId = \`gn-postmark-\${noteId}\`;
  return (
    <span style={styles.stampAnchor} aria-hidden>
      <span style={styles.stampSquare} className={animate ? 'gn-stamp-in' : undefined}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 21 4.2 13.2a5.2 5.2 0 0 1 7.35-7.35l.45.44.45-.44a5.2 5.2 0 0 1 7.35 7.35Z" />
        </svg>
      </span>
      <svg
        width={56}
        height={56}
        viewBox="0 0 64 64"
        style={styles.postmarkSvg}
        className={animate ? 'gn-postmark-in' : undefined}
        onAnimationEnd={animate ? onDone : undefined}
        aria-hidden>
        {/* 28px-radius (r=26 in the 64 box) dashed postmark arc. */}
        <path
          id={pathId}
          d="M 8 36 A 26 26 0 1 1 56 36"
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeWidth={1.5}
          strokeDasharray="3 4"
        />
        <text
          fontSize={11}
          fontWeight={500}
          letterSpacing="0.06em"
          fill="var(--color-text-secondary)">
          <textPath href={\`#\${pathId}\`} startOffset="50%" textAnchor="middle">
            {STAMP_TEXT}
          </textPath>
        </text>
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// GIFT-NOTE ROW — 72px full-width <button> (accessible name = primary +
// stage) with the stage spine, gift tile, two-line stack, stage chip, and
// the MANDATORY visible 44×44 ellipsis (sibling, never nested) opening the
// anchored menu: Open draft / Mark sent / Move back a stage. Drafted rows
// swipe RIGHT via pointer events — snap at +72px reveals the leading
// brand 'Send' block; releasing at/past the snap commits markSent (the
// sheet footer button and the ellipsis menu are the visible non-gesture
// paths).
// ---------------------------------------------------------------------------

interface GiftNoteRowProps {
  note: Note;
  menuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  justSentPlaying: boolean;
  onOpenSheet: (opener: HTMLElement) => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onMarkSent: () => void;
  onMoveBack: () => void;
  onStampDone: () => void;
}

function GiftNoteRow({
  note,
  menuOpen,
  menuRef,
  reducedMotion,
  justSentPlaying,
  onOpenSheet,
  onToggleMenu,
  onMarkSent,
  onMoveBack,
  onStampDone,
}: GiftNoteRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const canSwipe = note.stage === 'drafted' && !justSentPlaying;
  const offset = dragX != null ? Math.max(0, Math.min(88, dragX)) : 0;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canSwipe) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    setDragX(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - startXRef.current;
    if (Math.abs(dx) > 8) movedRef.current = true;
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (dragX == null) return;
    const settled = Math.max(0, Math.min(88, dragX));
    setDragX(null);
    // Release at/past the +72 snap commits markSent; short drags reset.
    if (movedRef.current && settled >= 72) onMarkSent();
  };

  const guardClick =
    (handler: (opener: HTMLElement) => void) => (event: {currentTarget: HTMLElement}) => {
      if (movedRef.current) {
        movedRef.current = false;
        return;
      }
      handler(event.currentTarget);
    };

  const primary = notePrimary(note);
  return (
    <div style={styles.rowOuter}>
      <div style={styles.swipeClip}>
        {canSwipe ? (
          <button
            type="button"
            className="gn-btn"
            style={styles.sendBlock}
            tabIndex={-1}
            aria-hidden
            onClick={onMarkSent}>
            <Icon icon={StampIcon} size="md" color="inherit" />
            Send
          </button>
        ) : null}
        <div
          style={{
            ...styles.rowContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 200ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="gn-btn gn-focusable"
            style={styles.rowBtn}
            aria-label={\`\${primary}, \${note.stage}\`}
            onClick={guardClick(onOpenSheet)}>
            <StageSpine stage={note.stage} />
            <NoteTile note={note} sealed={note.stage === 'sent'} />
            <span style={styles.textStack}>
              <span style={styles.primaryLine}>{primary}</span>
              <span style={styles.secondaryLine}>{noteSecondary(note)}</span>
            </span>
            <span style={styles.stageChip} aria-hidden>
              <span className="gn-chip-text">{STAGE_LABEL[note.stage]}</span>
              <span className="gn-chip-dot" style={styles.chipDot} />
            </span>
          </button>
          <button
            type="button"
            className="gn-btn gn-focusable"
            style={styles.iconBtn}
            aria-label={\`Actions for \${primary}\`}
            aria-expanded={menuOpen}
            onClick={guardClick(onToggleMenu)}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
        {justSentPlaying ? (
          <StampSweep noteId={note.id} animate={!reducedMotion} onDone={onStampDone} />
        ) : null}
      </div>
      {menuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Actions for \${primary}\`}
          style={{...styles.anchoredMenu, top: 60}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])'),
            );
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button
            type="button"
            role="menuitem"
            className="gn-btn gn-focusable"
            style={styles.menuRow}
            onClick={guardClick(onOpenSheet)}>
            <Icon icon={PenLineIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Open draft</span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            role="menuitem"
            className="gn-btn gn-focusable"
            style={styles.menuRow}
            onClick={onMarkSent}>
            <Icon icon={StampIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Mark sent</span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            role="menuitem"
            className="gn-btn gn-focusable"
            style={{...styles.menuRow, ...(note.stage === 'unwritten' ? styles.menuRowDisabled : null)}}
            disabled={note.stage === 'unwritten'}
            aria-disabled={note.stage === 'unwritten'}
            onClick={onMoveBack}>
            <Icon icon={Undo2Icon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Move back a stage</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HOUSEHOLD COLLAPSER — listCard variant for multi-gift UNMERGED
// households (fixture: Alvarez–Kim ×2): 60px two-line header, the
// GiftNoteRows with 68px-inset dividers, then the 44px full-row merge
// button. Merging is one ledger write — note count 10→9, remaining 7→6,
// ring re-derives, persistent Undo toast (all counts derived, never
// stored).
// ---------------------------------------------------------------------------

interface HouseholdCollapserProps {
  household: Household;
  count: number;
  onMerge: () => void;
  children: ReactNode;
}

function HouseholdCollapser({household, count, onMerge, children}: HouseholdCollapserProps) {
  return (
    <div style={styles.listCard} className="gn-cq">
      <div style={styles.householdHeader}>
        <span style={styles.primaryLine}>{household.displayName}</span>
        <span style={styles.secondaryLine}>
          {count} gifts · {household.occasion}
        </span>
      </div>
      <div style={styles.rowDivider} />
      {children}
      <div style={styles.rowDivider} />
      <button type="button" className="gn-btn gn-focusable" style={styles.mergeRow} onClick={onMerge}>
        <Icon icon={MergeIcon} size="sm" color="inherit" />
        Combine into one note
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// POSTMARK ENTRY — Sent-tab 72px media row: sealed tile, household,
// gift name(s), trailing tabular postmark date. The whole row is one
// button opening the read-only draft sheet (footer becomes the 36px
// 'Unsend' secondary, routed through the same undo-capable store patch).
// ---------------------------------------------------------------------------

interface PostmarkEntryProps {
  note: Note;
  onOpen: (opener: HTMLElement) => void;
}

function PostmarkEntry({note, onOpen}: PostmarkEntryProps) {
  const household = noteHousehold(note);
  const giftNames = noteGifts(note)
    .map(gift => gift.name)
    .join(' · ');
  return (
    <button
      type="button"
      className="gn-btn gn-focusable"
      style={styles.sentRowBtn}
      aria-label={\`\${household.displayName}, \${giftNames}, sent \${note.postmark ?? ''}\`}
      onClick={event => onOpen(event.currentTarget)}>
      <NoteTile note={note} sealed />
      <span style={styles.textStack}>
        <span style={styles.primaryLine}>{household.displayName}</span>
        <span style={styles.secondaryLine}>{giftNames}</span>
      </span>
      <span style={styles.postmarkDate}>{note.postmark}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; pointer drag between detents is garnish, >120px past
// medium closes), 52px header with 44×44 X, focus-trapped dialog. Only
// one sheet mounts at a time.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({
  titleId,
  title,
  detent,
  onDetentChange,
  onClose,
  sheetRef,
  reducedMotion,
  footer,
  children,
}: SheetProps) {
  // Transient pointer-drag delta only — the detent itself lives in the
  // single state owner.
  const [dragY, setDragY] = useState<number | null>(null);
  const startYRef = useRef(0);
  const movedRef = useRef(false);

  const onGrabberPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    startYRef.current = event.clientY;
    movedRef.current = false;
    setDragY(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onGrabberPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragY == null) return;
    const dy = event.clientY - startYRef.current;
    if (Math.abs(dy) > 8) movedRef.current = true;
    setDragY(dy);
  };
  const onGrabberPointerUp = () => {
    if (dragY == null) return;
    const dy = dragY;
    setDragY(null);
    if (!movedRef.current) return; // plain click → toggle handled by onClick
    if (dy > 120 && detent === 'medium') onClose();
    else if (dy > 60 && detent === 'large') onDetentChange('medium');
    else if (dy < -60 && detent === 'medium') onDetentChange('large');
  };
  const onGrabberClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onDetentChange(detent === 'medium' ? 'large' : 'medium');
  };

  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="gn-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="gn-btn gn-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onPointerDown={onGrabberPointerDown}
        onPointerMove={onGrabberPointerMove}
        onPointerUp={onGrabberPointerUp}
        onClick={onGrabberClick}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button
          type="button"
          className="gn-btn gn-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const QUEUE_SECTIONS: {stage: Stage; label: string}[] = [
  {stage: 'unwritten', label: 'To write'},
  {stage: 'drafted', label: 'Drafted'},
  {stage: 'sealed', label: 'Sealed'},
];

const TABS: {id: Tab; label: string; icon: typeof InboxIcon}[] = [
  {id: 'queue', label: 'Queue', icon: InboxIcon},
  {id: 'sent', label: 'Sent', icon: MailCheckIcon},
  {id: 'gifts', label: 'Gifts', icon: GiftIcon},
];

export default function MobileThankyouNoteTrackerTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {entities, update, setEntities} = useGracenoteState();
  const {notes, lastNotes, ui} = entities;

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({queue: null, sent: null, gifts: null});
  const toastSeqRef = useRef(0);
  const didMountRef = useRef(false);

  // Large-title collapse — IntersectionObserver on the 1px sentinel under
  // the large title drives the compact navBar title (user-scroll driven,
  // deterministic).
  const [titleCompact, setTitleCompact] = useState(false);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry != null) setTitleCompact(!entry.isIntersecting);
      },
      {rootMargin: '-53px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // DERIVED — every count is a pure projection of the noteLedger.
  const noteList = notes.order.map(id => notes.byId[id]);
  const totalNotes = noteList.length;
  const sentList = noteList
    .filter(note => note.stage === 'sent')
    .sort((a, b) => (b.postmarkDay ?? 0) - (a.postmarkDay ?? 0));
  const sentCount = sentList.length;
  const remaining = totalNotes - sentCount;
  const noteByGiftId = new Map<string, Note>();
  for (const note of noteList) for (const giftId of note.giftIds) noteByGiftId.set(giftId, note);

  // Queue projection: a just-sent note stays in its pre-send section while
  // the StampSweep plays.
  const effectiveStage = (note: Note): Stage =>
    ui.justSent?.noteId === note.id ? ui.justSent.prevStage : note.stage;
  const queueSections = QUEUE_SECTIONS.map(section => {
    const sectionNotes = noteList.filter(
      note => effectiveStage(note) === section.stage && (note.stage !== 'sent' || ui.justSent?.noteId === note.id),
    );
    // Group consecutive same-household notes → HouseholdCollapser.
    const groups: {household: Household; notes: Note[]}[] = [];
    for (const note of sectionNotes) {
      const last = groups[groups.length - 1];
      if (last != null && last.household.id === note.householdId) last.notes.push(note);
      else groups.push({household: noteHousehold(note), notes: [note]});
    }
    return {...section, notes: sectionNotes, groups};
  });
  const queueEmpty = remaining === 0 && ui.justSent == null;

  const sheetNote = ui.sheet != null ? (notes.byId[ui.sheet.noteId] as Note | undefined) : undefined;

  // MUTATORS — all through the single owner; toasts are persistent
  // (NO auto-dismiss timer): they live until Undo, replacement, or a tab
  // change ends the undo window.
  const toastOf = (text: string, canUndo: boolean): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, text, canUndo};
  };

  const openSheet = (noteId: string, opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update('ui', {sheet: {noteId, detent: 'medium'}, menuNoteId: null});
  };
  const closeSheet = () => {
    update('ui', {sheet: null});
    const opener = sheetOpenerRef.current;
    if (opener != null && opener.isConnected) opener.focus();
    else tabRefs.current[ui.tab]?.focus();
  };
  const closeMenu = () => {
    update('ui', {menuNoteId: null});
    menuOpenerRef.current?.focus();
  };

  const markSent = (noteId: string) => {
    setEntities(prev => {
      const note = prev.notes.byId[noteId];
      if (note == null || note.stage === 'sent') return prev;
      const household = HOUSEHOLD_BY_ID[note.householdId];
      const byId = {
        ...prev.notes.byId,
        [noteId]: {...note, stage: 'sent' as Stage, postmark: SENT_TODAY_LABEL, postmarkDay: SENT_TODAY_DAY},
      };
      const remainingAfter = prev.notes.order.filter(id => byId[id].stage !== 'sent').length;
      return {
        notes: {byId, order: prev.notes.order},
        lastNotes: prev.notes,
        ui: {
          ...prev.ui,
          sheet: null,
          menuNoteId: null,
          // Reduced motion: no StampSweep run — the row leaves at once.
          justSent: reducedMotion || prev.ui.tab !== 'queue' ? null : {noteId, prevStage: note.stage},
          toast: toastOf(
            \`Note to the \${household.name} household sent — \${remainingAfter} remaining\`,
            true,
          ),
        },
      };
    });
  };

  const advanceStage = (noteId: string) => {
    setEntities(prev => {
      const note = prev.notes.byId[noteId];
      if (note == null || note.stage === 'sealed' || note.stage === 'sent') return prev;
      const nextStage: Stage = note.stage === 'unwritten' ? 'drafted' : 'sealed';
      return {
        ...prev,
        notes: {...prev.notes, byId: {...prev.notes.byId, [noteId]: {...note, stage: nextStage}}},
        ui: {...prev.ui, toast: toastOf(\`\${notePrimary(note)} marked \${nextStage}\`, false)},
      };
    });
  };

  const moveBack = (noteId: string) => {
    setEntities(prev => {
      const note = prev.notes.byId[noteId];
      if (note == null || note.stage === 'unwritten' || note.stage === 'sent') return prev;
      const prevStage: Stage = note.stage === 'sealed' ? 'drafted' : 'unwritten';
      return {
        ...prev,
        notes: {...prev.notes, byId: {...prev.notes.byId, [noteId]: {...note, stage: prevStage}}},
        ui: {
          ...prev.ui,
          menuNoteId: null,
          toast: toastOf(\`\${notePrimary(note)} moved back to \${prevStage}\`, false),
        },
      };
    });
    menuOpenerRef.current?.focus();
  };

  const mergeHousehold = (householdId: string) => {
    setEntities(prev => {
      const ids = prev.notes.order.filter(
        id => prev.notes.byId[id].householdId === householdId && prev.notes.byId[id].stage !== 'sent',
      );
      if (ids.length < 2) return prev;
      const [keepId, ...dropIds] = ids;
      const merged: Note = {
        ...prev.notes.byId[keepId],
        giftIds: ids.flatMap(id => prev.notes.byId[id].giftIds),
      };
      const byId: Record<string, Note> = {...prev.notes.byId, [keepId]: merged};
      for (const id of dropIds) delete byId[id];
      const order = prev.notes.order.filter(id => !dropIds.includes(id));
      const remainingAfter = order.filter(id => byId[id].stage !== 'sent').length;
      return {
        notes: {byId, order},
        lastNotes: prev.notes,
        ui: {
          ...prev.ui,
          menuNoteId: null,
          toast: toastOf(\`Combined into one note — \${remainingAfter} remaining\`, true),
        },
      };
    });
  };

  const unsend = (noteId: string) => {
    setEntities(prev => {
      const note = prev.notes.byId[noteId];
      if (note == null || note.stage !== 'sent') return prev;
      const household = HOUSEHOLD_BY_ID[note.householdId];
      const byId = {
        ...prev.notes.byId,
        [noteId]: {...note, stage: 'sealed' as Stage, postmark: null, postmarkDay: null},
      };
      const remainingAfter = prev.notes.order.filter(id => byId[id].stage !== 'sent').length;
      return {
        notes: {byId, order: prev.notes.order},
        lastNotes: prev.notes,
        ui: {
          ...prev.ui,
          sheet: null,
          toast: toastOf(\`\${household.name} note unsent — back in Sealed · \${remainingAfter} remaining\`, true),
        },
      };
    });
    tabRefs.current[ui.tab]?.focus();
  };

  // Undo restores the EXACT prior ledger (byId + order → original list
  // positions, scroll untouched); the toast then reads 'Restored'.
  const undoLast = () => {
    setEntities(prev => {
      if (prev.lastNotes == null) return prev;
      return {
        notes: prev.lastNotes,
        lastNotes: null,
        ui: {...prev.ui, justSent: null, toast: toastOf('Restored', false)},
      };
    });
  };

  const setDraft = (noteId: string, draft: string) => {
    setEntities(prev => {
      const note = prev.notes.byId[noteId];
      if (note == null) return prev;
      return {
        ...prev,
        notes: {...prev.notes, byId: {...prev.notes.byId, [noteId]: {...note, draft}}},
      };
    });
  };
  const appendSnippet = (noteId: string, snippet: string) => {
    const note = notes.byId[noteId];
    if (note == null) return;
    const base = note.draft.length > 0 && !note.draft.endsWith(' ') ? \`\${note.draft} \` : note.draft;
    setDraft(noteId, base + snippet);
  };

  // TABS — per-tab scroll persistence in the single owner; overlays close
  // on switch; the toast's undo window ends on tab change (per spec); the
  // ONE legal reset: re-tapping the active tab scrolls to top.
  const selectTab = (tab: Tab) => {
    const scroller = getScrollParent(shellRef.current);
    if (tab === ui.tab) {
      scroller.scrollTop = 0;
      return;
    }
    update('ui', {
      tab,
      scrollByTab: {...ui.scrollByTab, [ui.tab]: scroller.scrollTop},
      sheet: null,
      menuNoteId: null,
      toast: null,
      justSent: null,
    });
  };
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const scroller = getScrollParent(shellRef.current);
    const target = ui.scrollByTab[ui.tab];
    requestAnimationFrame(() => {
      scroller.scrollTop = target;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.tab]);

  const onTablistKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = TABS.findIndex(tab => tab.id === ui.tab);
    const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
    selectTab(next.id);
    tabRefs.current[next.id]?.focus();
  };

  // Focus moves into the sheet on open — preventScroll, because the
  // locked shell is an overflow:hidden box the browser would otherwise
  // silently scroll mid-slide-in, beaching the sheet mid-screen
  // (foundations amendment); the scrollTop reset is the belt to that
  // suspender.
  useEffect(() => {
    if (ui.sheet != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [ui.sheet?.noteId]);
  // Anchored menus focus their first item on open.
  useEffect(() => {
    if (ui.menuNoteId != null) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [ui.menuNoteId]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.menuNoteId != null) closeMenu();
      else if (ui.sheet != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.menuNoteId, ui.sheet]);

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const renderRow = (note: Note) => (
    <GiftNoteRow
      key={note.id}
      note={note}
      menuOpen={ui.menuNoteId === note.id}
      menuRef={menuRef}
      reducedMotion={reducedMotion}
      justSentPlaying={ui.justSent?.noteId === note.id}
      onOpenSheet={opener => openSheet(note.id, opener)}
      onToggleMenu={opener => {
        menuOpenerRef.current = opener;
        update('ui', {menuNoteId: ui.menuNoteId === note.id ? null : note.id});
      }}
      onMarkSent={() => markSent(note.id)}
      onMoveBack={() => moveBack(note.id)}
      onStampDone={() => update('ui', {justSent: null})}
    />
  );

  const sheetHousehold = sheetNote != null ? noteHousehold(sheetNote) : null;
  const sheetReadOnly = sheetNote?.stage === 'sent';
  const sheetStageLabel =
    sheetNote == null
      ? ''
      : sheetNote.stage === 'unwritten'
        ? 'Mark drafted'
        : sheetNote.stage === 'drafted'
          ? 'Mark sealed'
          : 'Mark sent';
  const sheetChips =
    ui.sheet?.detent === 'large' ? [...PROMPT_CHIPS_BASE, ...PROMPT_CHIPS_LARGE] : PROMPT_CHIPS_BASE;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{GRACENOTE_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <GracenoteMark />
          </div>
          <span
            style={{...styles.navTitle, opacity: titleCompact ? 1 : 0}}
            className="gn-fade"
            aria-hidden={!titleCompact}>
            Gracenote
          </span>
          <div style={styles.navTrailing}>
            <RemainingRing total={totalNotes} sent={sentCount} />
          </div>
        </header>

        <div style={styles.largeTitle}>
          <h1 style={styles.largeTitleText}>Thank-Yous</h1>
        </div>
        <div ref={sentinelRef} style={styles.sentinel} aria-hidden />

        <main
          style={styles.main}
          role="tabpanel"
          id="gn-panel"
          aria-labelledby={\`gn-tab-\${ui.tab}\`}>
          {ui.tab === 'queue' ? (
            queueEmpty ? (
              // TRUE-EMPTY (stress fixture 4): every note sent — zero
              // action buttons; the ring shows 0 with a full arc and the
              // badge pill unmounts.
              <div style={styles.emptyState}>
                <span style={styles.emptyCircle}>
                  <Icon icon={MailCheckIcon} size="lg" color="inherit" />
                </span>
                <h2 style={styles.emptyTitle}>All caught up</h2>
                <p style={styles.emptyBody}>Every gift has a sent note. New gifts appear here.</p>
              </div>
            ) : (
              <>
                {queueSections.map(section =>
                  section.notes.length === 0 ? null : (
                    <section key={section.stage}>
                      <h2 style={styles.sectionHeader}>
                        {section.label} · {section.notes.length}
                      </h2>
                      <div style={styles.cardStack}>
                        {section.groups.map(group =>
                          group.notes.length > 1 ? (
                            <HouseholdCollapser
                              key={\`\${group.household.id}-\${group.notes[0].id}\`}
                              household={group.household}
                              count={group.notes.reduce((sum, note) => sum + note.giftIds.length, 0)}
                              onMerge={() => mergeHousehold(group.household.id)}>
                              {group.notes.map((note, index) => (
                                <div key={note.id}>
                                  {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                                  {renderRow(note)}
                                </div>
                              ))}
                            </HouseholdCollapser>
                          ) : (
                            <div
                              key={group.notes[0].id}
                              style={styles.listCard}
                              className={
                                group.notes[0].giftIds.length > 1 ? 'gn-cq gn-card-in' : 'gn-cq'
                              }>
                              {renderRow(group.notes[0])}
                            </div>
                          ),
                        )}
                      </div>
                    </section>
                  ),
                )}
                {/* Terminal caption — derived: 10 at rest, 9 after the
                    Alvarez–Kim merge. */}
                <div style={styles.terminalCaption}>All {totalNotes} notes</div>
              </>
            )
          ) : null}

          {ui.tab === 'sent' ? (
            <>
              <h2 style={styles.sectionHeader}>Postmarked · {sentCount}</h2>
              {sentCount === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyCircle}>
                    <Icon icon={StampIcon} size="lg" color="inherit" />
                  </span>
                  <h2 style={styles.emptyTitle}>Nothing sent yet</h2>
                  <p style={styles.emptyBody}>Notes you mark sent are postmarked here.</p>
                </div>
              ) : (
                <>
                  <div style={styles.listCard} className="gn-cq">
                    {sentList.map((note, index) => (
                      <div key={note.id}>
                        {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                        <PostmarkEntry note={note} onOpen={opener => openSheet(note.id, opener)} />
                      </div>
                    ))}
                  </div>
                  <div style={styles.terminalCaption}>All {sentCount} sent</div>
                </>
              )}
            </>
          ) : null}

          {ui.tab === 'gifts' ? (
            <>
              <h2 style={styles.sectionHeader}>Received · {GIFTS.length}</h2>
              <div style={styles.giftsGrid}>
                {GIFTS.map(gift => {
                  const note = noteByGiftId.get(gift.id);
                  const household = HOUSEHOLD_BY_ID[gift.householdId];
                  const sealed = note?.stage === 'sent';
                  return (
                    <button
                      key={gift.id}
                      type="button"
                      className="gn-btn gn-focusable"
                      style={styles.giftTileBtn}
                      aria-label={\`\${gift.name}, \${household.name}\${sealed ? ', note sent' : ''}\`}
                      onClick={event => {
                        if (note != null) openSheet(note.id, event.currentTarget);
                      }}>
                      <span style={{...styles.giftTileArt, background: giftGradient(gift.id)}} aria-hidden>
                        <Icon icon={GiftIcon} size="lg" color="inherit" />
                        {sealed ? <MiniSealBadge /> : null}
                      </span>
                      <span style={{minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2}}>
                        <span style={styles.giftTileName}>{gift.name}</span>
                        <span style={styles.giftTileMeta}>
                          {household.name} · {household.occasion}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={styles.terminalCaption}>All {GIFTS.length} gifts</div>
            </>
          ) : null}
        </main>

        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow above
            the tabBar (absolute only under sheet scroll-lock). Toasts are
            persistent: no auto-dismiss timer, one at a time, replacement
            ends the previous undo window (stress fixture 5). */}
        <div
          style={ui.sheet != null ? styles.toastDockLocked : styles.toastDock}
          aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="gn-fade">
              <span style={styles.toastMsg}>{ui.toast.text}</span>
              {ui.toast.canUndo && lastNotes != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="gn-btn gn-focusable" style={styles.undoBtn} onClick={undoLast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav
          style={styles.tabBar}
          role="tablist"
          aria-label="Gracenote sections"
          onKeyDown={onTablistKeyDown}>
          {TABS.map(tab => {
            const active = ui.tab === tab.id;
            return (
              <button
                key={tab.id}
                ref={element => {
                  tabRefs.current[tab.id] = element;
                }}
                type="button"
                role="tab"
                id={\`gn-tab-\${tab.id}\`}
                aria-selected={active}
                aria-controls="gn-panel"
                tabIndex={active ? 0 : -1}
                className="gn-btn gn-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'queue' && remaining > 0 ? (
                    <span style={styles.tabBadge}>{remaining}</span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {ui.sheet != null ? (
          <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
        ) : null}
        {ui.sheet != null && sheetNote != null && sheetHousehold != null ? (
          <Sheet
            titleId="gn-sheet-title"
            title={sheetHousehold.displayName}
            detent={ui.sheet.detent}
            onDetentChange={detent =>
              update('ui', {sheet: ui.sheet == null ? null : {...ui.sheet, detent}})
            }
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              sheetReadOnly ? (
                <button
                  type="button"
                  className="gn-btn gn-focusable"
                  style={styles.secondaryBtn}
                  onClick={() => unsend(sheetNote.id)}>
                  Unsend
                </button>
              ) : (
                <button
                  type="button"
                  className="gn-btn gn-focusable"
                  style={styles.primaryBtn}
                  onClick={() =>
                    sheetNote.stage === 'sealed' ? markSent(sheetNote.id) : advanceStage(sheetNote.id)
                  }>
                  {sheetStageLabel}
                </button>
              )
            }>
            {/* Gift context block — the Brennan sheet lists all 3 gifts
                (stress fixture 3). */}
            {noteGifts(sheetNote).map((gift, index) => (
              <div key={gift.id} style={styles.ctxRow}>
                <span style={styles.tileWrap} aria-hidden>
                  <span
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      display: 'grid',
                      placeItems: 'center',
                      color: '#FFFFFF',
                      background: giftGradient(gift.id),
                    }}>
                    <Icon icon={GiftIcon} size="sm" color="inherit" />
                  </span>
                  {sheetReadOnly ? <MiniSealBadge /> : null}
                </span>
                <span style={styles.textStack}>
                  <span style={styles.primaryLine}>{gift.name}</span>
                  <span style={styles.secondaryLine}>
                    {sheetHousehold.giver} · {sheetHousehold.occasion} · {sheetHousehold.occasionDate}
                  </span>
                </span>
                {index === 0 && sheetNote.giftIds.length > 1 ? (
                  <span style={styles.stageChip} aria-hidden>
                    <span className="gn-chip-text">{sheetNote.giftIds.length} GIFTS · 1 NOTE</span>
                  </span>
                ) : null}
              </div>
            ))}
            {sheetReadOnly ? (
              <>
                <p style={styles.draftReadonly}>{sheetNote.draft}</p>
                <div style={{...styles.terminalCaption, textAlign: 'left', paddingInline: 4}}>
                  Postmarked {sheetNote.postmark}
                </div>
              </>
            ) : (
              <>
                <div style={{marginTop: 8}}>
                  <label style={styles.formLabel} htmlFor="gn-draft-input">
                    Your note
                  </label>
                  <textarea
                    id="gn-draft-input"
                    className="gn-input"
                    style={styles.draftInput}
                    value={sheetNote.draft}
                    placeholder={\`Dear \${sheetHousehold.giver}…\`}
                    onChange={event => setDraft(sheetNote.id, event.target.value)}
                  />
                </div>
                <div style={{...styles.formLabel, marginTop: 16, marginBottom: 0}}>Prompts</div>
                <div style={styles.chipRow}>
                  {sheetChips.map(chip => (
                    <button
                      key={chip.id}
                      type="button"
                      className="gn-btn gn-focusable"
                      style={styles.chipBtn}
                      onClick={() => appendSnippet(sheetNote.id, chip.snippet)}>
                      <span style={styles.chipPill}>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}


`;export{e as default};