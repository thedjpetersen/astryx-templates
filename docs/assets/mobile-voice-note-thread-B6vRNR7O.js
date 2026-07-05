var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Murmur voice thread with Priya
 *   Nandakumar: six NOTES (dual fields durationSec + durationLabel, all
 *   literal): m1 Priya 84s '1:24' heard · m2 Priya 125s '2:05' ACTIVE at
 *   42s '0:42' · m3 you 47s '0:47' receipt Played · m4 Priya 118s '1:58'
 *   UNHEARD carrying a reply anchor → m2@0:42 · m5 you 36s '0:36' receipt
 *   Delivered · m6 Priya 177s '2:57' UNHEARD. Cross-checks (verified by
 *   hand): 84+125+47+118+36+177 = 587s = 9:47 → header '6 voice notes ·
 *   9:47 total'; 4 Priya + 2 you = 6; '2 new' = unheard incoming m4 + m6;
 *   heard bars on m2 = floor(42/125 × 40) = floor(13.44) = 13; sheet title
 *   '2:05' = m2.durationLabel. TRANSCRIPT_M2 = 38 {w, t} word/start-second
 *   pairs, monotonic 0..119s, with the quoted run 'the venue holds forty
 *   people' at t 40–46 and the t=41/t=42 active-word tiebreak. Times of
 *   day are literal strings; no Date.now, no Math.random, no timers —
 *   playback position moves ONLY via user actions.
 * @output Murmur — Voice Note Thread: a 390px MOBILE voice-message
 *   conversation. 52px navBar (44×44 back 'Chats', center 'Priya' fading
 *   in via an IntersectionObserver sentinel, 44×44 Info) over a 52px
 *   large-title row (28/700 'Priya' + 13/400 meta inline), then a
 *   full-bleed stream: TUESDAY divider, six 266px WaveScrubBubbles
 *   (40-bar id-hashed waveforms, two-tone heard/unheard tint, role=slider
 *   playheads with a timestamp chip riding the drag), timestamp-anchored
 *   ReplyAnchorChips, Played/Delivered receipts, unheard dots, terminal
 *   caption 'All 6 voice notes'. Sticky footer stack: 56px miniPlayer +
 *   64px composer (+44px reply chip when armed = 164px). Signature move:
 *   ONE playback value drives the bubble tint, the mini-player readout,
 *   the karaoke active word in the two-detent transcript sheet, and the
 *   heard high-water simultaneously — scrub commit arms a reply anchor at
 *   that second and the composer mic relabels to 'Record reply at 0:42'.
 * @position Page template; emitted by \`astryx template mobile-voice-note-thread\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, toast-in-lock) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   transcript sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close; the sheet body is the one
 *   legal inner scroller. The stage clips to --radius-container; shell
 *   paints full-bleed square.
 * Container policy: full-bleed conversation-stream language (no listCard)
 *   — bubbles are the containers (16px radius, 4px tail corner toward the
 *   sender edge); the transcript sheet is the only card-surfaced overlay.
 *   No desktop Layout frames, no side asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Murmur violet #5B4BC4 — the demo's --color-brand is the
 *   demo logo blue, so the spec hex is quarantined here per house rule).
 *   Waveform two-tone pairs carry contrast math at each declaration; the
 *   amendment applies: rest-state (unheard) bar fills are explicit
 *   light-dark() pairs at ≥3:1 against their ACTUAL surface (card bubble /
 *   accent bubble), never bare --color-border.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   between stacked same-sender bubbles · 24px between day/sender groups ·
 *   8px between chips; navBar 52px sticky top z20 (paddingInline 8, grid
 *   '1fr auto 1fr', hairline + blur ALWAYS ON — scroll-under not wired for
 *   the hairline, noted per contract); largeTitle row 52px in flow → total
 *   header 104 = 52+52; NO tabBar; sticky footer stack z20 = miniPlayer
 *   56px + composer 64px = 120px (164 = 56+44+64 with the reply chip);
 *   WaveScrubBubble 266px = 12 pad + 36 play + 8 gap + 198 wave + 12 pad;
 *   waveform 198px = 40 bars × 3px + 39 gaps × 2px = 120 + 78; bar heights
 *   6–28px r1.5; expanded footer row 52px (44×44 −5s/+5s/Aa, 8px gaps);
 *   micro-waveform 58px = 12×3 + 11×2 = 36+22. TYPE (Figtree via
 *   --font-family-body): 28/700 large title · 17/600 nav + sheet titles ·
 *   16/400 body + transcript words · 13/400 meta + receipts · 11/500
 *   overlines + timestamp chips; nothing under 11px; tabular-nums on every
 *   time readout. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   full-row; every gesture (scrub drag, sheet drag) has a visible button
 *   path (±5s buttons, clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px: bubble width is FIXED 266px (fits 320 − 32 gutter =
 *   288) — never percentage-squished, so the 40-bar geometry (198px) and
 *   the sec-per-px scrub math (125/198 s/px on m2) stay honest at every
 *   width; extra width goes to the gutter opposite the sender. Composer
 *   input flexes; mic stays 48px. Mini-player text ellipsizes before the
 *   58px micro-waveform yields. Header meta ellipsizes after '9:47 total'
 *   at 320. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline); sticky chrome and absolute overlays stay inside the column
 *   because they anchor to shell. No adaptive relayout — the bubble
 *   anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  ChevronLeftIcon,
  InfoIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Murmur violet). White on #5B4BC4 = 7.0:1;
// as text: #5B4BC4 on the white body ≈ 6.5:1, #A79BFF on the dark body
// (~#131316) ≈ 7.1:1 — both clear 4.5:1 for 13px receipts and chips.
const BRAND_ACCENT = 'light-dark(#5B4BC4, #A79BFF)';
// Text/glyphs over a BRAND_ACCENT fill. Light: #FFFFFF on #5B4BC4 = 7.0:1.
// Dark: white on #A79BFF fails (~1.9:1), so the dark side flips to the
// spec's near-black violet — #1A1533 on #A79BFF ≈ 8.9:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #1A1533)';
// Brand-tinted wash for incoming play buttons / chips (12%).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// OUTGOING waveform two-tone, on the BRAND_ACCENT bubble (the ACTUAL
// surface — amendment). Heard: white 92% over #5B4BC4 ≈ 6.1:1; dark
// rgba(26,21,51,0.92) over #A79BFF ≈ 7.3:1.
const OUT_BAR_HEARD = 'light-dark(rgba(255,255,255,0.92), rgba(26,21,51,0.92))';
// Unheard-remaining: white 56% composited over #5B4BC4 → rgb(183,176,229)
// ≈ 3.1:1 vs the bubble (graphical ≥3:1 floor, per spec). Dark:
// rgba(26,21,51,0.56) over #A79BFF → rgb(88,80,141) is only ≈3.0:1, so the
// dark side runs 62% → rgb(80,72,129) ≈ 3.4:1 (deviation from a mirrored
// 56%, for the ≥3:1 floor).
const OUT_BAR_UNHEARD = 'light-dark(rgba(255,255,255,0.56), rgba(26,21,51,0.62))';
// INCOMING unheard-remaining bars, on the card bubble (NOT bare
// --color-border — amendment). #8A8797 on the white card ≈ 3.5:1; #8E8AA6
// on the dark card (~#1C1C1E) ≈ 5.1:1 — both clear the 3:1 graphical
// floor. Doubles as the ≥3:1 boundary color for seek buttons on card.
const IN_BAR_UNHEARD = 'light-dark(#8A8797, #8E8AA6)';
// Boundary for seek/Aa buttons on the OUTGOING accent bubble: white 56%
// (≈3.1:1 vs #5B4BC4, same math as OUT_BAR_UNHEARD's light side); dark
// side reuses the 62% near-black violet (≈3.4:1 vs #A79BFF).
const OUT_BTN_BORDER = OUT_BAR_UNHEARD;
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button + input resets, the
// visually-hidden helper, sheet-in animation, reduced-motion guard.
// Transitions animate transform/opacity/color only and collapse to instant
// under prefers-reduced-motion (large-title collapse is opacity-only, the
// scrub chip is position-not-animation, so both survive).
// ---------------------------------------------------------------------------

const MURMUR_CSS = \`
.mvn-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.mvn-btn:disabled { cursor: default; }
.mvn-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.mvn-input {
  font: inherit;
  color: var(--color-text-primary);
  background: none;
  border: none;
  outline: none;
  min-width: 0;
}
.mvn-fade { transition: opacity 200ms ease; }
.mvn-anim { transition: transform 240ms ease, opacity 240ms ease; }
@keyframes mvn-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.mvn-sheet-in { animation: mvn-sheet-in 240ms ease; }
.mvn-vh {
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
  .mvn-fade, .mvn-anim { transition: none; }
  .mvn-sheet-in { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
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
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline + blur always
  // on (noted per contract).
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
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInlineEnd: 8,
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  backLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  // Center title — 17/600, max 200px, opacity 0 → 1 when the large title
  // scrolls under (IntersectionObserver sentinel; opacity-only, so it is
  // already reduced-motion safe).
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    opacity: 0,
  },
  navTitleOn: {opacity: 1},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // LARGE TITLE — 52px row in flow below the sticky navBar (total header
  // 104 = 52+52): 28/700 h1 + 13/400 meta inline after.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
    minWidth: 0,
  },
  h1: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
  },
  titleMeta: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingTop: 6,
  },
  sentinel: {height: 1},
  // STREAM — full-bleed feed language (no listCard); 16px gutters on rows.
  stream: {flex: 1, display: 'flex', flexDirection: 'column', paddingInline: 16},
  dayDivider: {
    height: 20,
    marginBlock: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  // 24px between day/sender groups, 12px between stacked same-sender.
  groupGap: {height: 24},
  sameSenderGap: {height: 12},
  msgIncoming: {display: 'flex', flexDirection: 'column', alignItems: 'flex-start'},
  msgOutgoing: {display: 'flex', flexDirection: 'column', alignItems: 'flex-end'},
  // WaveScrubBubble — FIXED 266px (12 + 36 + 8 + 198 + 12); 16px radius
  // with a 4px tail corner toward the sender edge.
  bubbleIncoming: {
    width: 266,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px 16px 16px 4px',
    padding: 12,
  },
  bubbleOutgoing: {
    width: 266,
    background: BRAND_ACCENT,
    borderRadius: '16px 16px 4px 16px',
    padding: 12,
  },
  bubbleMain: {display: 'flex', alignItems: 'center', gap: 8},
  // 36px play button; incoming = brand tint circle + accent glyph;
  // outgoing = OUT_BAR_HEARD glyph (≈6.1:1 vs the accent fill — the glyph
  // is the ≥3:1 affordance) on an 18% white wash.
  playBtnIn: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  playBtnOut: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: 'light-dark(rgba(255,255,255,0.18), rgba(26,21,51,0.18))',
    color: OUT_BAR_HEARD,
  },
  // Waveform — 198px = 40×3 + 39×2; bars 6–28px r1.5; wrap is 44px tall so
  // the slider overlay hit is 44px without extra absolute math.
  waveWrap: {
    position: 'relative',
    width: 198,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  waveBars: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    width: 198,
    height: 28,
  },
  bar: {width: 3, borderRadius: 1.5, flexShrink: 0},
  // Playhead — 4px-wide bar, 2px radius, spans 32px.
  playhead: {
    position: 'absolute',
    top: 6,
    width: 4,
    height: 32,
    borderRadius: 2,
    pointerEvents: 'none',
  },
  // role=slider overlay spanning the 198px waveform, 44px-tall hit.
  sliderOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 8,
    touchAction: 'pan-y',
    cursor: 'pointer',
  },
  // Timestamp chip riding 8px above the thumb during drag — 22px pill,
  // 11/500 BRAND_FILL_TEXT on BRAND_ACCENT (7.0:1 light / 8.9:1 dark).
  scrubChip: {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    transform: 'translateX(-50%)',
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 2,
  },
  durLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  // Expanded footer row — 52px holding three 44×44 buttons, 8px gaps.
  bubbleFooter: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  seekBtnIn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    border: \`1px solid \${IN_BAR_UNHEARD}\`,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  seekBtnOut: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    border: \`1px solid \${OUT_BTN_BORDER}\`,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: OUT_BAR_HEARD,
  },
  // 2-line inline transcript preview — 13/400, active word 600.
  inlinePreview: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: '18px',
    color: 'var(--color-text-secondary)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  previewActive: {fontWeight: 600, color: 'var(--color-text-primary)'},
  // Meta row below each bubble — 13/400 time (+ receipt / unheard dot in a
  // 44px-tall gutter so the dot never shrinks the row rhythm).
  metaRow: {
    minHeight: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  unheardDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    flexShrink: 0,
  },
  receiptPlayed: {fontSize: 13, fontWeight: 500, color: BRAND_ACCENT},
  receiptDelivered: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // ReplyAnchorChip — 44px tall, 10px radius; message variant is a button.
  replyChip: {
    height: 44,
    maxWidth: 266,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 10,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
    marginBottom: 4,
  },
  replyChipLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  replyChipExcerpt: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  microWave: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    width: 58,
    height: 20,
    flexShrink: 0,
  },
  terminalCaption: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST — sticky-in-flow dock (height 0) pinned above the footer stack;
  // absolute at bottom 136 ONLY while the sheet scroll-lock is active
  // (amendment: shell-absolute is correct only at height:100dvh).
  toastAnchor: {
    position: 'sticky',
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 0,
    bottom: 136,
    zIndex: 45,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 8,
    maxWidth: 'calc(100% - 32px)',
    minHeight: 48,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    borderRadius: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'auto',
  },
  toastText: {whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastAction: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // FOOTER STACK — sticky bottom z20, blur surface + top hairline;
  // miniPlayer 56 + (reply chip 44) + composer 64.
  footerStack: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  miniPlayer: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    borderBottom: '1px solid var(--color-border)',
  },
  miniPlayBtn: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  miniText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  speedPill: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    border: \`1px solid \${BRAND_ACCENT}\`,
    color: BRAND_ACCENT,
    borderRadius: 999,
    padding: '2px 6px',
  },
  miniAaBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  composer: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  composerChipRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  inputPill: {
    flex: 1,
    minWidth: 0,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
  },
  micBtn: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  // SHEET — scrim z40 + sheet z41; detents 55% / calc(100% − 56px).
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
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 44px speed row — 3-segment control, 36px track, radius 12.
  speedRow: {
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  segTrack: {
    flex: 1,
    height: 36,
    display: 'flex',
    padding: 2,
    gap: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segItem: {
    flex: 1,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  segItemOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  // Sheet body — the ONE legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  karaoke: {display: 'flex', flexWrap: 'wrap', alignItems: 'center'},
  wordItem: {display: 'inline-flex'},
  // Word buttons — glyph 16/400, 44px-tall hit via height; active word =
  // 600 weight + 2px BRAND_ACCENT underline (weight + color, never color
  // alone).
  wordBtn: {
    height: 44,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 3,
    borderRadius: 8,
    fontSize: 16,
    lineHeight: '22px',
    color: 'var(--color-text-primary)',
  },
  wordActive: {fontWeight: 600, boxShadow: \`inset 0 -2px 0 0 \${BRAND_ACCENT}\`},
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic by law. ARITHMETIC CROSS-CHECKS (verified by
// hand): durations 84 + 125 + 47 + 118 + 36 + 177 = 587s = 9 min 47 s →
// header meta '6 voice notes · 9:47 total'; 6 notes = 4 Priya + 2 you;
// '2 new' = unheard incoming m4 + m6 (heard[id] === 0, sender priya) and
// DERIVES LIVE from the heard map; heard bars on m2 = floor(42/125 × 40) =
// floor(13.44) = 13; sheet title '2:05' = m2.durationLabel; reply anchor
// mini-wave centers on bar round(0.336 × 40) = 13 → bars 7..18.
// ---------------------------------------------------------------------------

const THREAD_PEER = 'Priya Nandakumar'; // full name — a11y names + Info
const THREAD_PEER_SHORT = 'Priya'; // display title
const SELF = 'you';

interface ReplyRef {
  noteId: string;
  atSec: number;
  atLabel: string;
  excerpt: string;
}

interface VoiceNote {
  id: string;
  sender: 'priya' | 'you';
  durationSec: number; // dual field — cross-checked against durationLabel
  durationLabel: string;
  time: string; // literal time-of-day string, no Date math
  replyTo: ReplyRef | null;
}

const NOTES: VoiceNote[] = [
  // m1 — heard in full (84 = 1:24 ✓).
  {id: 'm1', sender: 'priya', durationSec: 84, durationLabel: '1:24', time: '10:38 AM', replyTo: null},
  // m2 — the ACTIVE note, position 42s '0:42' of 125 = 2:05 ✓.
  {id: 'm2', sender: 'priya', durationSec: 125, durationLabel: '2:05', time: '10:42 AM', replyTo: null},
  // m3 — outgoing; PEER_HEARD_SEC 47 ≥ 47 → receipt 'Played' ✓.
  {id: 'm3', sender: 'you', durationSec: 47, durationLabel: '0:47', time: '10:45 AM', replyTo: null},
  // m4 — UNHEARD (stress: reply-anchor chip → m2@0:42; 118 = 1:58 ✓).
  {
    id: 'm4',
    sender: 'priya',
    durationSec: 118,
    durationLabel: '1:58',
    time: '10:51 AM',
    replyTo: {noteId: 'm2', atSec: 42, atLabel: '0:42', excerpt: '…the venue holds forty…'},
  },
  // m5 — SHORT-note stress (0:36 beside m6's 2:57 — identical 266px
  // bubble, only the duration label differs); PEER_HEARD_SEC 0 →
  // 'Delivered'.
  {id: 'm5', sender: 'you', durationSec: 36, durationLabel: '0:36', time: '10:55 AM', replyTo: null},
  // m6 — LONG-note stress: 177s across the 198px waveform = 0.89 s/px, so
  // 5s ≈ 5.6px — the 44×44 ±5s buttons are why the non-gesture path
  // matters. Kept unheard for the fully-unheard tint state.
  {id: 'm6', sender: 'priya', durationSec: 177, durationLabel: '2:57', time: '10:59 AM', replyTo: null},
];

const NOTE_BY_ID: Record<string, VoiceNote> = Object.fromEntries(NOTES.map(note => [note.id, note]));

// How much of each OUTGOING note the peer has heard (fixture flag driving
// receipts): m3 47 ≥ 47 → 'Played'; m5 0 < 36 → 'Delivered'.
const PEER_HEARD_SEC: Record<string, number> = {m3: 47, m5: 0};

// Initial heard high-water map (your listening): m1 full, m2 at the 42s
// playhead, m4/m6 untouched (the '2 new'), m3/m5 are your own notes.
const INITIAL_HEARD: Record<string, number> = {m1: 84, m2: 42, m3: 47, m4: 0, m5: 36, m6: 0};

const SPEEDS = [1, 1.5, 2] as const;

interface TranscriptWord {
  w: string;
  t: number; // start second, monotonic
}

// TRANSCRIPT_M2 — 41 {w, t} pairs, monotonic 0..119s over the 125s note.
// Stress words: 'unconventional' (14 chars — proves word-button wrapping
// at 320px); the t=41 ('venue') / t=42 ('holds') pair proves the
// active-word tiebreak (greatest t ≤ position → at 42s the active word is
// 'holds', index 23). Quoted run for the reply anchor at t 40–46: 'the
// venue holds forty people'.
const TRANSCRIPT_M2: TranscriptWord[] = [
  {w: 'Okay', t: 0}, {w: 'so', t: 2}, {w: 'I', t: 4}, {w: 'finally', t: 6},
  {w: 'walked', t: 8}, {w: 'the', t: 10}, {w: 'gallery', t: 11}, {w: 'space', t: 13},
  {w: 'this', t: 15}, {w: 'morning', t: 16}, {w: 'and', t: 19}, {w: 'honestly', t: 21},
  {w: 'it', t: 23}, {w: 'feels', t: 24}, {w: 'unconventional', t: 26}, {w: 'but', t: 30},
  {w: 'in', t: 32}, {w: 'the', t: 33}, {w: 'best', t: 35}, {w: 'way', t: 37},
  {w: 'because', t: 39}, {w: 'the', t: 40}, {w: 'venue', t: 41}, {w: 'holds', t: 42},
  {w: 'forty', t: 44}, {w: 'people', t: 46}, {w: 'comfortably', t: 48}, {w: 'with', t: 53},
  {w: 'room', t: 56}, {w: 'for', t: 58}, {w: 'the', t: 60}, {w: 'band', t: 62},
  {w: 'so', t: 70}, {w: 'we', t: 74}, {w: 'should', t: 80}, {w: 'book', t: 88},
  {w: 'it', t: 95}, {w: 'before', t: 100}, {w: 'July', t: 108}, {w: 'fills', t: 115},
  {w: 'up', t: 119},
];

// Only m2's transcript has finished processing — the Aa path on other
// notes toasts the honest pending state.
const TRANSCRIPTS: Record<string, TranscriptWord[]> = {m2: TRANSCRIPT_M2};

// ---------------------------------------------------------------------------
// HELPERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Seconds → 'm:ss' ('0:42', '2:05'). */
function fmtSec(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return \`\${Math.floor(s / 60)}:\${String(s % 60).padStart(2, '0')}\`;
}

/**
 * 40 deterministic bar heights from a charCode accumulator over the note
 * id: acc = (acc × 31 + code) mod 997 seeds a per-bar walk whose
 * (acc mod 23) + 6 lands every height in 6..28px. No Math.random —
 * the same id always draws the same waveform. Module-level cache since
 * heights never change.
 */
const BAR_CACHE = new Map<string, number[]>();
function barHeights(id: string): number[] {
  const cached = BAR_CACHE.get(id);
  if (cached != null) return cached;
  let acc = 0;
  for (let i = 0; i < id.length; i++) {
    acc = (acc * 31 + id.charCodeAt(i)) % 997;
  }
  const bars: number[] = [];
  for (let i = 0; i < 40; i++) {
    acc = (acc * 31 + 17) % 997;
    bars.push((acc % 23) + 6);
  }
  BAR_CACHE.set(id, bars);
  return bars;
}

/** Active karaoke word = LAST word with t ≤ positionSec (tiebreak law). */
function activeWordIndex(words: TranscriptWord[], positionSec: number): number {
  let index = -1;
  for (let i = 0; i < words.length; i++) {
    if (words[i].t <= positionSec) index = i;
    else break;
  }
  return index;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — exactly the spec shape; every handler routes through
// the single update(key, patch) (object values merge, scalars assign).
// ---------------------------------------------------------------------------

interface PlaybackState {
  noteId: string | null; // null = mini-player collapsed entirely
  positionSec: number;
  playing: boolean; // visual state only — never a setInterval
  speed: number;
}

interface ToastState {
  seq: number;
  text: string;
  clearReply: boolean; // true → trailing 'Clear' undo button
}

interface MurmurState {
  playback: PlaybackState;
  heard: Record<string, number>;
  replyArm: {noteId: string; atSec: number} | null;
  sheet: {open: boolean; detent: 'medium' | 'large'};
  expandedId: string | null;
  titleCollapsed: boolean;
  toast: ToastState | null;
  draft: string;
}

const INITIAL_STATE: MurmurState = {
  playback: {noteId: 'm2', positionSec: 42, playing: false, speed: 1},
  heard: INITIAL_HEARD,
  replyArm: null,
  sheet: {open: false, detent: 'medium'},
  expandedId: 'm2',
  titleCollapsed: false,
  toast: null,
  draft: '',
};

function useMurmurState() {
  const [state, setState] = useState<MurmurState>(INITIAL_STATE);
  const update = useCallback(
    <K extends keyof MurmurState>(key: K, patch: Partial<MurmurState[K]> | MurmurState[K]) => {
      setState(prev => {
        const prevValue = prev[key];
        const merged =
          prevValue != null &&
          typeof prevValue === 'object' &&
          patch != null &&
          typeof patch === 'object' &&
          !Array.isArray(patch)
            ? {...(prevValue as object), ...(patch as object)}
            : patch;
        return {...prev, [key]: merged as MurmurState[K]};
      });
    },
    [],
  );
  return {state, update};
}

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

/** Sheet focus trap — Tab cycles within; Escape handled by the sheet. */
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), [role="slider"]');
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
// MICRO WAVEFORM — 12-bar 58px slice (12×3 + 11×2 = 36 + 22 = 58) cut from
// a note's 40-bar hash array, centered on \`centerBar\` (clamped so the
// window stays in 0..39). Heights rescale 6..28 → 4..20.
// ---------------------------------------------------------------------------

interface MicroWaveProps {
  noteId: string;
  centerBar: number;
  heardBars: number; // bars (within the SLICE) tinted heard
}

function MicroWave({noteId, centerBar, heardBars}: MicroWaveProps) {
  const all = barHeights(noteId);
  const start = Math.max(0, Math.min(28, centerBar - 6));
  const slice = all.slice(start, start + 12);
  return (
    <span style={styles.microWave} aria-hidden>
      {slice.map((h, i) => (
        <span
          key={i}
          style={{
            ...styles.bar,
            height: 4 + Math.round(((h - 6) * 16) / 22),
            background: start + i < heardBars ? BRAND_ACCENT : IN_BAR_UNHEARD,
          }}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// REPLY ANCHOR CHIP — 44px, 10px radius: 'Reply at 0:42' 13/600 accent +
// 12-bar mini-wave centered on bar round(0.336×40) = 13 (bars 7..18) +
// ellipsized quoted snippet. Message variant is a <button> that seeks;
// composer variant carries a trailing 44×44 X to disarm.
// ---------------------------------------------------------------------------

interface ReplyAnchorChipProps {
  reply: ReplyRef;
  quotedDuration: number;
  onJump?: () => void;
  onClear?: () => void;
}

function ReplyAnchorChip({reply, quotedDuration, onJump, onClear}: ReplyAnchorChipProps) {
  const centerBar = Math.round((reply.atSec / quotedDuration) * 40); // m2: 13
  const inner = (
    <>
      <span style={styles.replyChipLabel}>Reply at {reply.atLabel}</span>
      <MicroWave noteId={reply.noteId} centerBar={centerBar} heardBars={centerBar} />
      <span style={styles.replyChipExcerpt}>{reply.excerpt}</span>
    </>
  );
  if (onJump != null) {
    return (
      <button
        type="button"
        className="mvn-btn mvn-focusable"
        style={styles.replyChip}
        aria-label={\`Reply at \${reply.atLabel} — jump to \${THREAD_PEER_SHORT}'s note\`}
        onClick={onJump}>
        {inner}
      </button>
    );
  }
  return (
    <div style={{...styles.replyChip, marginBottom: 0, flex: 1, minWidth: 0, maxWidth: 'none'}}>
      {inner}
      <button
        type="button"
        className="mvn-btn mvn-focusable"
        style={{...styles.iconBtn, width: 44, height: 44, marginInlineEnd: -10, flexShrink: 0}}
        aria-label={\`Remove reply anchor at \${reply.atLabel}\`}
        onClick={onClear}>
        <Icon icon={XIcon} size="sm" color="inherit" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WAVE SCRUB BUBBLE — 266px bubble (12 + 36 + 8 + 198 + 12). Two-tone: bar
// index < floor(progress × 40) is 'heard' (incoming BRAND_ACCENT /
// outgoing OUT_BAR_HEARD), the rest 'unheard-remaining' (IN_BAR_UNHEARD /
// OUT_BAR_UNHEARD, contrast math at the declarations). A fully-unheard
// incoming note (heard 0, not active) renders ALL bars bright accent —
// the '2 new' look, paired with the dot + vh 'New' text. The playhead is a
// role=slider overlay: 44px hit, ArrowLeft/Right ±5s, Home/End 0/duration;
// during pointer drag an 11/500 chip rides 8px above the thumb; pointerup
// commits + arms the reply anchor. Visible button path: the expanded 52px
// footer's 44×44 −5s / +5s (and Aa → transcript sheet).
// ---------------------------------------------------------------------------

interface WaveScrubBubbleProps {
  note: VoiceNote;
  heardSec: number;
  isActive: boolean;
  isExpanded: boolean;
  positionSec: number;
  playing: boolean;
  reducedMotion: boolean;
  onPlayPause: () => void;
  onSeekAbs: (sec: number) => void;
  onScrubCommit: (sec: number) => void;
  onOpenTranscript: (opener: HTMLElement) => void;
}

function WaveScrubBubble({
  note,
  heardSec,
  isActive,
  isExpanded,
  positionSec,
  playing,
  reducedMotion,
  onPlayPause,
  onSeekAbs,
  onScrubCommit,
  onOpenTranscript,
}: WaveScrubBubbleProps) {
  const incoming = note.sender === 'priya';
  const heights = barHeights(note.id);
  // Transient drag value only — committed position lives in the owner.
  const [dragSec, setDragSec] = useState<number | null>(null);
  const waveRef = useRef<HTMLDivElement | null>(null);

  const shownSec = dragSec ?? (isActive ? positionSec : heardSec);
  const progress = Math.max(0, Math.min(1, shownSec / note.durationSec));
  // m2 at 42s: floor(42/125 × 40) = floor(13.44) = 13 heard bars.
  const heardBars = Math.floor(progress * 40);
  const freshUnheard = incoming && !isActive && heardSec === 0;

  const heardColor = incoming ? BRAND_ACCENT : OUT_BAR_HEARD;
  const unheardColor = incoming ? IN_BAR_UNHEARD : OUT_BAR_UNHEARD;

  const secFromClientX = (clientX: number): number => {
    const rect = waveRef.current?.getBoundingClientRect();
    if (rect == null) return shownSec;
    // Fixed geometry: 198px track → sec-per-px = duration/198 (m2:
    // 125/198 ≈ 0.63 s/px; m6: 177/198 ≈ 0.89 s/px — the long-note
    // stress).
    const x = Math.max(0, Math.min(198, clientX - rect.left));
    return Math.round((x / 198) * note.durationSec);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragSec(secFromClientX(event.clientX));
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragSec == null) return;
    setDragSec(secFromClientX(event.clientX));
  };
  const onPointerUp = () => {
    if (dragSec == null) return;
    const sec = dragSec;
    setDragSec(null);
    onScrubCommit(sec);
  };

  const onSliderKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const base = isActive ? positionSec : heardSec;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onSeekAbs(Math.max(0, base - 5));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onSeekAbs(Math.min(note.durationSec, base + 5));
    } else if (event.key === 'Home') {
      event.preventDefault();
      onSeekAbs(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      onSeekAbs(note.durationSec);
    }
  };

  const senderName = incoming ? THREAD_PEER_SHORT : SELF;
  const playheadLeft = Math.max(0, Math.min(194, progress * 198 - 2));
  const transcript = TRANSCRIPTS[note.id];
  const previewActiveIdx = transcript != null ? activeWordIndex(transcript, isActive ? positionSec : heardSec) : -1;

  return (
    <div style={incoming ? styles.bubbleIncoming : styles.bubbleOutgoing}>
      <div style={styles.bubbleMain}>
        <button
          type="button"
          className="mvn-btn mvn-focusable"
          style={incoming ? styles.playBtnIn : styles.playBtnOut}
          aria-label={
            isActive && playing
              ? \`Pause \${senderName}'s voice note\`
              : \`Play \${senderName === SELF ? 'your' : \`\${THREAD_PEER_SHORT}'s\`} voice note, \${note.durationLabel}\`
          }
          onClick={onPlayPause}>
          <Icon icon={isActive && playing ? PauseIcon : PlayIcon} size="sm" color="inherit" />
        </button>
        <div style={styles.waveWrap} ref={waveRef}>
          <div style={styles.waveBars} aria-hidden>
            {heights.map((h, i) => (
              <span
                key={i}
                style={{
                  ...styles.bar,
                  height: h,
                  background: freshUnheard || i < heardBars ? heardColor : unheardColor,
                }}
              />
            ))}
          </div>
          {isActive ? (
            <span
              style={{
                ...styles.playhead,
                left: playheadLeft,
                background: incoming ? BRAND_ACCENT : OUT_BAR_HEARD,
              }}
              aria-hidden
            />
          ) : null}
          <div
            role="slider"
            tabIndex={0}
            className="mvn-focusable"
            style={styles.sliderOverlay}
            aria-label={\`Playhead for \${senderName === SELF ? 'your' : \`\${THREAD_PEER_SHORT}'s\`} \${note.durationLabel} note\`}
            aria-valuemin={0}
            aria-valuemax={note.durationSec}
            aria-valuenow={Math.round(shownSec)}
            aria-valuetext={\`\${fmtSec(shownSec)} of \${note.durationLabel}\`}
            onKeyDown={onSliderKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
          {dragSec != null ? (
            <span style={{...styles.scrubChip, left: progress * 198}}>{fmtSec(dragSec)}</span>
          ) : null}
        </div>
      </div>
      <div
        style={{
          ...styles.durLabel,
          color: incoming ? 'var(--color-text-secondary)' : OUT_BAR_HEARD,
          paddingInlineStart: 44,
        }}>
        {isActive ? \`\${fmtSec(positionSec)} / \${note.durationLabel}\` : note.durationLabel}
      </div>
      {isExpanded ? (
        <>
          <div style={styles.bubbleFooter}>
            <button
              type="button"
              className="mvn-btn mvn-focusable"
              style={incoming ? styles.seekBtnIn : styles.seekBtnOut}
              aria-label="Back 5 seconds"
              onClick={() => onSeekAbs(Math.max(0, positionSec - 5))}>
              −5s
            </button>
            <button
              type="button"
              className="mvn-btn mvn-focusable"
              style={incoming ? styles.seekBtnIn : styles.seekBtnOut}
              aria-label="Forward 5 seconds"
              onClick={() => onSeekAbs(Math.min(note.durationSec, positionSec + 5))}>
              +5s
            </button>
            <button
              type="button"
              className="mvn-btn mvn-focusable"
              style={{...(incoming ? styles.seekBtnIn : styles.seekBtnOut), fontSize: 16}}
              aria-label="Open transcript"
              onClick={event => onOpenTranscript(event.currentTarget)}>
              Aa
            </button>
          </div>
          {transcript != null ? (
            <p style={styles.inlinePreview}>
              {transcript.map((word, i) => (
                <span key={i} style={i === previewActiveIdx ? styles.previewActive : undefined}>
                  {word.w}
                  {i < transcript.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TRANSCRIPT KARAOKE — flowing word buttons (glyph 16/400, 44px-tall hit
// via line height); active word = greatest t ≤ positionSec, styled 600 +
// 2px BRAND_ACCENT underline (weight + color, never color alone). Tapping
// a word seeks the ONE playback value — waveform playhead, mini-player
// readout, and heard tint all move in the same render.
// ---------------------------------------------------------------------------

interface TranscriptKaraokeProps {
  words: TranscriptWord[];
  positionSec: number;
  onWordSeek: (t: number) => void;
}

function TranscriptKaraoke({words, positionSec, onWordSeek}: TranscriptKaraokeProps) {
  const activeIdx = activeWordIndex(words, positionSec);
  return (
    <div role="list" aria-label="Transcript words" style={styles.karaoke}>
      {words.map((word, i) => (
        <span role="listitem" key={i} style={styles.wordItem}>
          <button
            type="button"
            className="mvn-btn mvn-focusable"
            style={{...styles.wordBtn, ...(i === activeIdx ? styles.wordActive : null)}}
            aria-label={\`\${word.w}, \${fmtSec(word.t)}\`}
            aria-current={i === activeIdx ? 'true' : undefined}
            onClick={() => onWordSeek(word.t)}>
            {word.w}
          </button>
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TRANSCRIPT SHEET — two detents (MEDIUM 55% / LARGE calc(100% − 56px));
// grabber is a real 'Resize sheet' button (click toggles; drag between
// detents is garnish, >120px past medium closes); 52px header; 44px speed
// row (radiogroup, arrow keys); karaoke in the sheet's own overflowY:auto
// scroller — the one legal inner scroller. Focus is trapped; Escape closes
// the topmost (only) overlay.
// ---------------------------------------------------------------------------

interface TranscriptSheetProps {
  note: VoiceNote;
  words: TranscriptWord[];
  positionSec: number;
  speed: number;
  detent: 'medium' | 'large';
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onSpeedChange: (speed: number) => void;
  onWordSeek: (t: number) => void;
  onClose: () => void;
}

function TranscriptSheet({
  note,
  words,
  positionSec,
  speed,
  detent,
  reducedMotion,
  sheetRef,
  onDetentChange,
  onSpeedChange,
  onWordSeek,
  onClose,
}: TranscriptSheetProps) {
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
    if (!movedRef.current) return; // plain click → onClick toggles
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

  const onSpeedKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = SPEEDS.findIndex(s => s === speed);
    const next = event.key === 'ArrowRight' ? Math.min(SPEEDS.length - 1, index + 1) : Math.max(0, index - 1);
    onSpeedChange(SPEEDS[next]);
    const buttons = event.currentTarget.querySelectorAll<HTMLElement>('button');
    buttons[next]?.focus();
  };

  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={\`Transcript — \${note.durationLabel}\`}
      tabIndex={-1}
      className="mvn-sheet-in"
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
          return;
        }
        trapTabKey(event, sheetRef.current);
      }}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="mvn-btn mvn-focusable"
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
        <h2 style={styles.sheetTitle}>Transcript — {note.durationLabel}</h2>
        <button
          type="button"
          className="mvn-btn mvn-focusable"
          style={styles.iconBtn}
          aria-label="Close transcript"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.speedRow}>
        <div role="radiogroup" aria-label="Playback speed" style={styles.segTrack} onKeyDown={onSpeedKeyDown}>
          {SPEEDS.map(s => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={speed === s}
              tabIndex={speed === s ? 0 : -1}
              className="mvn-btn mvn-focusable"
              style={{...styles.segItem, ...(speed === s ? styles.segItemOn : null)}}
              onClick={() => onSpeedChange(s)}>
              {s}x
            </button>
          ))}
        </div>
      </div>
      <div style={styles.sheetBody}>
        <TranscriptKaraoke words={words} positionSec={positionSec} onWordSeek={onWordSeek} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileVoiceNoteThreadTemplate() {
  // Desktop stage (~1045px container) → centered phone column; container
  // width via ResizeObserver, viewport query only as first-frame fallback.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {state, update} = useMurmurState();
  const {playback, heard, replyArm, sheet, expandedId, titleCollapsed, toast, draft} = state;

  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const bubbleElsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const toastSeqRef = useRef(0);

  // Derived — aggregates re-derive live from the heard map (listening to
  // m4 flips the header's '2 new' to '1 new' in the same render).
  const activeNote = playback.noteId != null ? NOTE_BY_ID[playback.noteId] : null;
  const miniMounted = activeNote != null;
  const newCount = NOTES.filter(note => note.sender === 'priya' && (heard[note.id] ?? 0) === 0).length;
  const totalSec = NOTES.reduce((sum, note) => sum + note.durationSec, 0); // 587 = 9:47 ✓
  const headerMeta = \`\${NOTES.length} voice notes · \${fmtSec(totalSec)} total\${newCount > 0 ? \` · \${newCount} new\` : ''}\`;
  const footerHeight = (miniMounted ? 56 : 0) + (replyArm != null ? 44 : 0) + 64;
  const activeTranscript = activeNote != null ? TRANSCRIPTS[activeNote.id] : undefined;

  const showToast = (text: string, clearReply = false) => {
    toastSeqRef.current += 1;
    update('toast', {seq: toastSeqRef.current, text, clearReply});
  };

  const raiseHeard = (noteId: string, sec: number) => {
    update('heard', {[noteId]: Math.max(heard[noteId] ?? 0, Math.round(sec))});
  };

  // SINGLE-PLAYHEAD LAW — one interaction, one render: the previous note's
  // high-water is already in \`heard\`, expandedId and playback.noteId swap,
  // the previous bubble collapses, the mini-player rebinds, and receipts
  // keep deriving from PEER_HEARD_SEC.
  const handlePlayPause = (note: VoiceNote) => {
    if (playback.noteId === note.id) {
      const next = !playback.playing;
      update('playback', {playing: next});
      if (next) showToast(\`Playing \${note.sender === 'priya' ? \`\${THREAD_PEER_SHORT}'s\` : 'your'} note\`);
      return;
    }
    const prior = heard[note.id] ?? 0;
    const resume = prior >= note.durationSec ? 0 : prior;
    update('playback', {noteId: note.id, positionSec: resume, playing: true});
    update('expandedId', note.id);
    showToast(\`Playing \${note.sender === 'priya' ? \`\${THREAD_PEER_SHORT}'s\` : 'your'} note\`);
  };

  const handleSeekAbs = (note: VoiceNote, sec: number) => {
    const clamped = Math.max(0, Math.min(note.durationSec, Math.round(sec)));
    update('playback', {noteId: note.id, positionSec: clamped});
    update('expandedId', note.id);
    raiseHeard(note.id, clamped);
    showToast(\`At \${fmtSec(clamped)} of \${note.durationLabel}\`);
  };

  // Scrub commit: position lands, heard high-water rises, replyArm arms —
  // the composer grows the chip and the mic relabels, all one render.
  const handleScrubCommit = (note: VoiceNote, sec: number) => {
    const clamped = Math.max(0, Math.min(note.durationSec, Math.round(sec)));
    update('playback', {noteId: note.id, positionSec: clamped});
    update('expandedId', note.id);
    raiseHeard(note.id, clamped);
    update('replyArm', {noteId: note.id, atSec: clamped});
    showToast(\`Reply anchor set at \${fmtSec(clamped)}\`, true);
  };

  const handleWordSeek = (t: number) => {
    if (activeNote == null) return;
    update('playback', {positionSec: t});
    raiseHeard(activeNote.id, t);
    showToast(\`At \${fmtSec(t)} of \${activeNote.durationLabel}\`);
  };

  const openTranscript = (note: VoiceNote, opener: HTMLElement) => {
    if (TRANSCRIPTS[note.id] == null) {
      showToast('Transcript still processing for this note');
      return;
    }
    sheetOpenerRef.current = opener;
    if (playback.noteId !== note.id) {
      update('playback', {noteId: note.id, positionSec: heard[note.id] ?? 0, playing: false});
      update('expandedId', note.id);
    }
    update('sheet', {open: true, detent: 'medium'});
  };

  const closeSheet = () => {
    update('sheet', {open: false});
    sheetOpenerRef.current?.focus();
  };

  // ReplyAnchorChip on m4 seeks m2 to 0:42 and scrolls the bubble into
  // view ('auto' under reduced motion).
  const handleAnchorJump = (reply: ReplyRef) => {
    const target = NOTE_BY_ID[reply.noteId];
    update('playback', {noteId: target.id, positionSec: reply.atSec, playing: false});
    update('expandedId', target.id);
    raiseHeard(target.id, reply.atSec);
    bubbleElsRef.current[target.id]?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'center',
    });
    showToast(\`Jumped to \${reply.atLabel} in \${THREAD_PEER_SHORT}'s note\`);
  };

  const clearReplyArm = () => {
    update('replyArm', null);
    showToast('Reply anchor cleared');
  };

  // Mini-player X collapses playback entirely — the stack shrinks 120→64px
  // with no layout jump elsewhere (footer is sticky, stream is in flow).
  const collapsePlayer = () => {
    update('playback', {noteId: null, playing: false});
    update('expandedId', null);
  };

  // Focus into the opening sheet uses preventScroll (amendment): a plain
  // .focus() would scroll-reveal the animating sheet inside the locked
  // overflow-hidden column and beach it mid-screen.
  useEffect(() => {
    if (sheet.open) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [sheet.open]);

  // Large-title collapse — IntersectionObserver on the 1px sentinel below
  // the large title flips titleCollapsed (opacity swap only; deterministic
  // because it is user-scroll driven).
  useEffect(() => {
    const el = sentinelRef.current;
    if (el == null) return undefined;
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry != null) update('titleCollapsed', !entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  const renderMetaRow = (note: VoiceNote) => {
    const isUnheard = note.sender === 'priya' && (heard[note.id] ?? 0) === 0;
    if (note.sender === 'you') {
      // Receipt derives: PEER_HEARD_SEC[id] ≥ durationSec → 'Played'
      // (m3: 47 ≥ 47); otherwise 'Delivered' (m5).
      const played = (PEER_HEARD_SEC[note.id] ?? 0) >= note.durationSec;
      return (
        <div style={styles.metaRow}>
          <span>{note.time}</span>
          <span style={played ? styles.receiptPlayed : styles.receiptDelivered}>
            {played ? 'Played' : 'Delivered'}
          </span>
        </div>
      );
    }
    return (
      <div style={styles.metaRow}>
        {isUnheard ? (
          <>
            <span style={styles.unheardDot} aria-hidden />
            <span className="mvn-vh">New voice note.</span>
          </>
        ) : null}
        <span>{note.time}</span>
      </div>
    );
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{MURMUR_CSS}</style>
      <div
        ref={shellRef}
        style={{
          ...styles.shell,
          ...(sheet.open ? styles.shellLocked : null),
          ...(isDesktopColumn ? styles.shellDesktop : null),
        }}>
        {/* NAV BAR — 52px; hairline + blur always on. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="mvn-btn mvn-focusable"
              style={styles.backBtn}
              aria-label="Back to Chats"
              onClick={() => showToast('Chats list is outside this demo')}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
              <span style={styles.backLabel}>Chats</span>
            </button>
          </div>
          <div
            className="mvn-fade"
            style={{...styles.navTitle, ...(titleCollapsed ? styles.navTitleOn : null)}}
            aria-hidden>
            {THREAD_PEER_SHORT}
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="mvn-btn mvn-focusable"
              style={styles.iconBtn}
              aria-label={\`Thread info for \${THREAD_PEER}\`}
              onClick={() => showToast(\`Thread with \${THREAD_PEER} — \${NOTES.length} voice notes\`)}>
              <Icon icon={InfoIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* LARGE TITLE — 52px in flow; h1 carries the full name for a11y. */}
        <div style={styles.largeTitle}>
          <h1 style={styles.h1} aria-label={THREAD_PEER}>
            {THREAD_PEER_SHORT}
          </h1>
          <span style={styles.titleMeta}>{headerMeta}</span>
        </div>
        <div ref={sentinelRef} style={styles.sentinel} aria-hidden />

        {/* STREAM — full-bleed feed; 12px same-sender / 24px group gaps. */}
        <main style={styles.stream}>
          <h2 style={styles.dayDivider}>Tuesday</h2>
          {NOTES.map((note, index) => {
            const prev = index > 0 ? NOTES[index - 1] : null;
            const isActive = playback.noteId === note.id;
            return (
              <div key={note.id}>
                {prev != null ? (
                  <div style={prev.sender === note.sender ? styles.sameSenderGap : styles.groupGap} />
                ) : null}
                <div
                  ref={el => {
                    bubbleElsRef.current[note.id] = el;
                  }}
                  style={note.sender === 'priya' ? styles.msgIncoming : styles.msgOutgoing}>
                  {note.replyTo != null ? (
                    <ReplyAnchorChip
                      reply={note.replyTo}
                      quotedDuration={NOTE_BY_ID[note.replyTo.noteId].durationSec}
                      onJump={() => handleAnchorJump(note.replyTo as ReplyRef)}
                    />
                  ) : null}
                  <WaveScrubBubble
                    note={note}
                    heardSec={heard[note.id] ?? 0}
                    isActive={isActive}
                    isExpanded={expandedId === note.id}
                    positionSec={isActive ? playback.positionSec : heard[note.id] ?? 0}
                    playing={isActive && playback.playing}
                    reducedMotion={reducedMotion}
                    onPlayPause={() => handlePlayPause(note)}
                    onSeekAbs={sec => handleSeekAbs(note, sec)}
                    onScrubCommit={sec => handleScrubCommit(note, sec)}
                    onOpenTranscript={opener => openTranscript(note, opener)}
                  />
                  {renderMetaRow(note)}
                </div>
              </div>
            );
          })}
          {/* Terminal caption — 16px below the last bubble, 24px above the
              footer stack (no loadMoreRow; the thread is complete). */}
          <div style={styles.terminalCaption}>All {NOTES.length} voice notes</div>
        </main>

        {/* TOAST DOCK — the ONE polite live region. Sticky-in-flow above
            the footer stack; absolute at bottom 136 only while the sheet
            scroll-lock is active (amendment). No auto-dismiss timer; one
            toast, replaced on the next mutation. */}
        <div
          style={sheet.open ? styles.toastAnchorLocked : {...styles.toastAnchor, bottom: footerHeight + 8}}
          aria-live="polite"
          role="status">
          {toast != null ? (
            <div style={styles.toast}>
              <span style={styles.toastText}>{toast.text}</span>
              {toast.clearReply ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    className="mvn-btn mvn-focusable"
                    style={styles.toastAction}
                    onClick={clearReplyArm}>
                    Clear
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* FOOTER STACK — miniPlayer 56 + (reply chip 44) + composer 64. */}
        <div style={styles.footerStack}>
          {miniMounted && activeNote != null ? (
            <div style={styles.miniPlayer}>
              <button
                type="button"
                className="mvn-btn mvn-focusable"
                style={styles.miniPlayBtn}
                aria-label={playback.playing ? 'Pause' : 'Play'}
                onClick={() => handlePlayPause(activeNote)}>
                <Icon icon={playback.playing ? PauseIcon : PlayIcon} size="sm" color="inherit" />
              </button>
              <span style={styles.miniText}>
                {activeNote.sender === 'priya' ? THREAD_PEER_SHORT : 'You'} · {fmtSec(playback.positionSec)} /{' '}
                {activeNote.durationLabel}
              </span>
              {playback.speed !== 1 ? <span style={styles.speedPill}>{playback.speed}x</span> : null}
              <MicroWave
                noteId={activeNote.id}
                centerBar={Math.floor((playback.positionSec / activeNote.durationSec) * 40)}
                heardBars={Math.floor((playback.positionSec / activeNote.durationSec) * 40)}
              />
              <button
                type="button"
                className="mvn-btn mvn-focusable"
                style={styles.miniAaBtn}
                aria-label="Open transcript"
                onClick={event => openTranscript(activeNote, event.currentTarget)}>
                Aa
              </button>
              <button
                type="button"
                className="mvn-btn mvn-focusable"
                style={{...styles.iconBtn, marginInlineEnd: -12}}
                aria-label="Close player"
                onClick={collapsePlayer}>
                <Icon icon={XIcon} size="md" color="inherit" />
              </button>
            </div>
          ) : null}
          {replyArm != null ? (
            <div style={styles.composerChipRow}>
              <ReplyAnchorChip
                reply={{
                  noteId: replyArm.noteId,
                  atSec: replyArm.atSec,
                  atLabel: fmtSec(replyArm.atSec),
                  excerpt:
                    replyArm.noteId === 'm2' && replyArm.atSec >= 40 && replyArm.atSec <= 46
                      ? '…the venue holds forty…'
                      : \`\${NOTE_BY_ID[replyArm.noteId].durationLabel} note\`,
                }}
                quotedDuration={NOTE_BY_ID[replyArm.noteId].durationSec}
                onClear={clearReplyArm}
              />
            </div>
          ) : null}
          <div style={styles.composer}>
            <div style={styles.inputPill}>
              <input
                className="mvn-input"
                style={{flex: 1, fontSize: 16}}
                type="text"
                aria-label={\`Message \${THREAD_PEER_SHORT}\`}
                placeholder={\`Message \${THREAD_PEER_SHORT}\`}
                value={draft}
                onChange={event => update('draft', event.target.value)}
              />
            </div>
            <button
              type="button"
              className="mvn-btn mvn-focusable"
              style={styles.micBtn}
              aria-label={replyArm != null ? \`Record reply at \${fmtSec(replyArm.atSec)}\` : 'Record a voice note'}
              onClick={() => showToast('Recording is not part of this demo')}>
              <Icon icon={MicIcon} size="md" color="inherit" />
            </button>
          </div>
        </div>

        {/* TRANSCRIPT SHEET — scrim z40 + sheet z41; scrim click, Escape,
            and X all close; focus restores to the opener on every path. */}
        {sheet.open && activeNote != null && activeTranscript != null ? (
          <>
            <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <TranscriptSheet
              note={activeNote}
              words={activeTranscript}
              positionSec={playback.positionSec}
              speed={playback.speed}
              detent={sheet.detent}
              reducedMotion={reducedMotion}
              sheetRef={sheetRef}
              onDetentChange={detent => update('sheet', {detent})}
              onSpeedChange={speed => update('playback', {speed})}
              onWordSeek={handleWordSeek}
              onClose={closeSheet}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};