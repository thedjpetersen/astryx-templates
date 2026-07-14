// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — a Ripple Messages DM between you and
 *   Nova Reyes, frozen on the suite's anchored "today" of Fri Jul 4: 14
 *   fixture messages across two day sections (6 under "Thu, Jul 3", 8 under
 *   "Today", cross-check 6+8=14 ✓) covering a Saturday pottery-studio plan;
 *   one photo message (hue-gradient "SB" tile — no network media); three
 *   pre-seeded reaction chips (❤️ + 😮 yours on Nova's rows, 😂 hers on your
 *   cardamom-bun row); a staged intro arrival ("mira's in…") at t+3.4s; a
 *   2-message canned reply script consumed after your sends; a fixed time
 *   pool ('9:44 AM' → '9:58 AM') indexed by a send counter; a 6-entry const
 *   heart-burst particle field (fixed dx/dy/rotation/delay, token colors).
 *   No Date.now(), no Math.random(), no wall-clock reads — all choreography
 *   runs on cleaned-up setTimeout stages.
 * @output Chat Micro-Motion — a 390px MOBILE DM thread whose centerpiece is
 *   message micro-interactions: (a) a typing indicator (three staggered
 *   bounce dots in a ghost pill) that after 2.2s MORPHS into the arriving
 *   bubble (overshoot spring from the pill's bottom-left origin, content
 *   fades in 180ms behind); (b) send choreography — Send flies the draft as
 *   a pill along a slight arc (single transform keyframe with a 55% arc
 *   waypoint) into the reserved slot, the real bubble pops in, and a
 *   Delivered → Read receipt line transitions with a tiny avatar slide;
 *   (c) double-tap any incoming bubble → an emoji heart pops (scale
 *   0→1.3→1) with a 6-particle micro-burst (fixed offsets, removed from the
 *   DOM after) and the ❤️ reaction chip counts up; 450ms long-press opens a
 *   5-emoji reaction bar with staggered rise — the always-visible 44×44
 *   smile-plus chip beside every bubble is the button path through the SAME
 *   toggleReaction update; (d) tapping your last bubble's ⋯ → Unsend
 *   implodes the bubble (scale+fade) and ghosts in a dashed "Message
 *   unsent" placeholder; (e) the new-day divider pill pins briefly under
 *   the navBar (position:sticky) while its section scrolls. Quick-reply
 *   chips send through the same flight path. One polite toast dock above
 *   the composer announces every gesture outcome.
 * @position Page template; emitted by `astryx template mobile-chat-micro-motion`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no fake OS chrome — the 52px sticky navBar
 *   at y=0 is the first pixel). All overlays (reaction bar, unsend menu,
 *   the transparent dismiss scrim, flight pill, toast) are
 *   position:'absolute' INSIDE shell or inside the sticky composer dock —
 *   position:fixed is BANNED. No bottom sheet opens here, so the shell
 *   never needs the scroll lock; the reaction bar / unsend menu anchor to
 *   their own message row (position:relative, zIndex raised above the
 *   dismiss scrim) so they ride with content if the thread scrolls.
 * Animation contract: transform/opacity ONLY (dot bounce, morph spring,
 *   arc flight, pop-in, heart burst, staggered rise, implode, chip pop,
 *   avatar slide) via one <style> constant with the unique `cmm-` prefix;
 *   overshoot = cubic-bezier(0.34,1.56,0.64,1), decelerate =
 *   cubic-bezier(0.22,1,0.36,1); phases chain on animationend with
 *   idempotent setTimeout backstops (flight 900ms, implode 500ms) so a
 *   mid-flight reduced-motion flip can never strand a phase. Reduced
 *   motion (matchMedia read in a useEffect with a change listener + CSS
 *   backstop block): typing dots become a static `Nova is typing…` label,
 *   the flight/morph/pop/implode become instant state changes, the heart
 *   burst and chip pops are REMOVED entirely, receipts swap by opacity.
 * Container policy: bubbles (18px radius, 6px tail corner) in a flowing
 *   thread — no listCards needed; sticky navBar (52px, blur + hairline)
 *   and sticky composer dock (quick-reply row + 44px input + 44×44 send)
 *   share the blur surface; day dividers are sticky 11px pills.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#2563EB, #A5C3F9) — white 16px text on
 *   #2563EB ≈ 5.2:1; #0E1B33 text on #A5C3F9 ≈ 9.6:1; as a bubble fill vs
 *   the white body ≈ 5.2:1 and vs the ~#1F1F22 dark body ≈ 9.5:1 (≥3:1).
 *   Sanctioned non-brand literals: ONE contact-avatar pair (white 13px
 *   initials on #0F766E ≈ 5.5:1; #06211E on #7DD8CE ≈ 9:1) and the photo
 *   tile's hsl gradient (poster art, white monogram ≈ 4.6:1 on its 40%/26%
 *   lightness stops). Heart/particles use var(--color-error) + token
 *   accents. Never var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 10px bubble gaps · 8px chip
 *   gaps · navBar 52px sticky z20 · composer dock sticky bottom z20 ·
 *   bubbles maxWidth 72% · 44×44 every interactive target (28px visual
 *   chips centered in 44px hits; 44px emoji buttons; 44px quick chips;
 *   44px send). TYPE: 17/600 nav name · 16/400 message body · 13/400 meta
 *   and receipts · 11/500-600 day pills, times, status; nothing under
 *   11px; tabular-nums on reaction counts.
 *
 * Responsive contract:
 * - Fluid 320–430: bubbles are %-capped, the flight keyframe's fixed arc
 *   offsets stay inside the narrowest stage (208px start offset < 320−16
 *   gutters), reaction bar (5×44+8 = 228px) fits from the 52px them-side
 *   anchor at 320 (52+228=280); overflowX:'clip' backstop on shell.
 * - Desktop stage: useElementWidth ResizeObserver on the wrapper —
 *   container width > 560px renders the shell as a centered 430px phone
 *   column (hairline borderInline) on a var(--color-background-muted)
 *   backdrop; never a stretched relayout.
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
  MoreHorizontalIcon,
  PhoneIcon,
  SendIcon,
  SmilePlusIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Ripple blue — own-bubble fill, focus rings,
// send button). White 16px text on #2563EB ≈ 5.2:1; #0E1B33 on #A5C3F9 ≈
// 9.6:1. As a bare fill: #2563EB vs the white body ≈ 5.2:1; #A5C3F9 vs the
// ~#1F1F22 dark body ≈ 9.5:1 — both clear the ≥3:1 fill bar.
const BRAND_ACCENT = 'light-dark(#2563EB, #A5C3F9)';
// Text over a BRAND_ACCENT fill (math above).
const BRAND_ON_ACCENT = 'light-dark(#FFFFFF, #0E1B33)';
// 12% brand wash — your own reaction chip seat (decorative fill, never text).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, var(--color-background-card))`;
// Contact avatar pair (sanctioned non-brand literal): white 13px initials on
// #0F766E ≈ 5.5:1; near-black #06211E on #7DD8CE ≈ 9:1.
const AVATAR_BG = 'light-dark(#0F766E, #7DD8CE)';
const AVATAR_TEXT = 'light-dark(#FFFFFF, #06211E)';
// Photo fixture art — poster-art gradient (same literal both schemes; white
// 20px monogram on 40%/26%-lightness stops ≈ 4.6:1+).
const PHOTO_GRADIENT = 'linear-gradient(135deg, hsl(165 45% 40%), hsl(205 55% 26%))';

// ---------------------------------------------------------------------------
// INJECTED CSS — unique `cmm-` prefix. Transform/opacity only; overshoot =
// cubic-bezier(0.34,1.56,0.64,1); decelerate = cubic-bezier(0.22,1,0.36,1).
// The reduced-motion block is a CSS backstop; the JS paths swap behavior.
// ---------------------------------------------------------------------------

const CMM_CSS = `
.cmm-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.cmm-btn:disabled { cursor: default; }
.cmm-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.cmm-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* (a) typing dots — staggered bounce, phases via per-dot animationDelay. */
@keyframes cmm-dot {
  0%, 60%, 100% { transform: none; opacity: 0.45; }
  30% { transform: translateY(-5px); opacity: 1; }
}
.cmm-dot { animation: cmm-dot 1100ms ease-in-out infinite; }
/* (a) arriving bubble morphs out of the dot pill — overshoot spring from
   the pill's bottom-left origin; content fades in 180ms behind. */
@keyframes cmm-morph {
  from { transform: scale(0.35); opacity: 0.3; }
  62% { transform: scale(1.05); opacity: 1; }
  to { transform: none; opacity: 1; }
}
.cmm-morph {
  animation: cmm-morph 380ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  transform-origin: 14px calc(100% - 8px);
}
@keyframes cmm-fadein { from { opacity: 0; } to { opacity: 1; } }
.cmm-morph .cmm-morph-inner { animation: cmm-fadein 220ms ease 180ms both; }
/* (b) send flight — the draft pill arcs from the composer to the slot:
   55% waypoint overshoots up-left before settling (decelerate bezier). */
@keyframes cmm-fly {
  0% { transform: translate(-208px, 58px) scale(0.92); opacity: 0; }
  18% { opacity: 1; }
  55% { transform: translate(-34px, -16px) scale(1); }
  100% { transform: translate(0, 0) scale(1); opacity: 1; }
}
.cmm-fly { animation: cmm-fly 520ms cubic-bezier(0.22, 1, 0.36, 1) both; }
/* (b) the real bubble pops into the reserved slot. */
@keyframes cmm-pop {
  from { transform: scale(0.6); opacity: 0; }
  70% { transform: scale(1.04); opacity: 1; }
  to { transform: none; opacity: 1; }
}
.cmm-pop {
  animation: cmm-pop 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  transform-origin: bottom right;
}
/* (b) Read receipt — tiny avatar slides in beside the label. */
@keyframes cmm-avatar-slide {
  from { transform: translateX(10px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.cmm-avatar-slide { animation: cmm-avatar-slide 260ms cubic-bezier(0.22, 1, 0.36, 1) both; }
/* (c) heart pop 0→1.3→1, then fades itself away before state removal. */
@keyframes cmm-heart {
  0% { transform: scale(0); }
  55% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
@keyframes cmm-fadeout { from { opacity: 1; } to { opacity: 0; } }
.cmm-heart {
  animation:
    cmm-heart 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both,
    cmm-fadeout 200ms ease 640ms both;
}
/* (c) 6-particle micro-burst — fixed per-particle offsets via CSS vars. */
@keyframes cmm-particle {
  0% { transform: translate(0, 0) rotate(0deg) scale(0.5); opacity: 0; }
  15% { opacity: 1; }
  100% {
    transform: translate(var(--cmm-dx), var(--cmm-dy)) rotate(var(--cmm-rot)) scale(1);
    opacity: 0;
  }
}
.cmm-particle { animation: cmm-particle 700ms cubic-bezier(0.22, 1, 0.36, 1) both; }
/* (c) reaction bar emoji + menu rows + toast rise with stagger. */
@keyframes cmm-rise {
  from { transform: translateY(10px) scale(0.85); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.cmm-rise { animation: cmm-rise 260ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
/* (c) reaction chip re-pops when its count changes (keyed remount). */
@keyframes cmm-chip-pop {
  from { transform: scale(0.6); }
  60% { transform: scale(1.15); }
  to { transform: none; }
}
.cmm-chip-pop { animation: cmm-chip-pop 260ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
/* (d) unsend implode, then the ghost placeholder fades in. */
@keyframes cmm-implode {
  from { transform: none; opacity: 1; }
  to { transform: scale(0.55); opacity: 0; }
}
.cmm-implode {
  animation: cmm-implode 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
  transform-origin: bottom right;
}
.cmm-ghost-in { animation: cmm-fadein 300ms ease both; }
/* Reduced-motion CSS backstop — the JS paths already swap behavior; this
   guarantees loops/pops are gone even if a class slips through. */
@media (prefers-reduced-motion: reduce) {
  .cmm-dot, .cmm-morph, .cmm-morph .cmm-morph-inner, .cmm-fly, .cmm-pop,
  .cmm-avatar-slide, .cmm-heart, .cmm-particle, .cmm-rise, .cmm-chip-pop,
  .cmm-implode, .cmm-ghost-in {
    animation: none;
  }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  wrapDesktop: {background: 'var(--color-background-muted)', minHeight: '100dvh'},
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
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, blur + hairline.
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 8,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navIconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  navCenter: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    background: AVATAR_BG,
    color: AVATAR_TEXT,
    fontSize: 11,
    fontWeight: 600,
  },
  navNameCol: {minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'},
  navName: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.2,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 180,
  },
  navStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--color-success)',
    flexShrink: 0,
  },
  // THREAD — flowing bubble list; day sections are plain flow containers so
  // their sticky divider pills pin under the navBar, then hand off.
  thread: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 12},
  daySection: {display: 'flex', flexDirection: 'column'},
  dayPin: {
    position: 'sticky',
    top: 58,
    zIndex: 15,
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 8,
    pointerEvents: 'none',
  },
  dayPill: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    padding: '4px 10px',
  },
  dayMessages: {display: 'flex', flexDirection: 'column', gap: 10, paddingInline: 16},
  row: {display: 'flex', alignItems: 'flex-end', gap: 4},
  rowThem: {justifyContent: 'flex-start'},
  rowMe: {justifyContent: 'flex-end'},
  rowRaised: {position: 'relative', zIndex: 40},
  rowAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    background: AVATAR_BG,
    color: AVATAR_TEXT,
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 2,
  },
  rowAvatarSpacer: {width: 28, flexShrink: 0},
  // bubbleStack — the anchored, relative column each overlay hangs off.
  bubbleStack: {
    position: 'relative',
    minWidth: 0,
    maxWidth: '72%',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  stackThem: {alignItems: 'flex-start'},
  stackMe: {alignItems: 'flex-end'},
  bubble: {
    position: 'relative',
    maxWidth: '100%',
    padding: '10px 14px',
    fontSize: 16,
    lineHeight: 1.35,
    borderRadius: 18,
    overflowWrap: 'anywhere',
    touchAction: 'manipulation',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  bubbleThem: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    borderBottomLeftRadius: 6,
  },
  bubbleMe: {
    background: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    borderBottomRightRadius: 6,
  },
  bubbleLanding: {opacity: 0},
  bubbleGhost: {
    background: 'transparent',
    border: '1px dashed var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontStyle: 'italic',
    padding: '9px 13px',
  },
  photoBubble: {padding: 4},
  photoTile: {
    position: 'relative',
    width: 200,
    maxWidth: '100%',
    height: 148,
    borderRadius: 14,
    background: PHOTO_GRADIENT,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  photoCaption: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: '#FFFFFF',
    background: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 999,
    padding: '3px 8px',
  },
  timeMeta: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Heart pop overlay — absolute, centered on the bubble, pointer-events off.
  heartLayer: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
    overflow: 'visible',
  },
  heartGlyph: {fontSize: 30, lineHeight: 1},
  particle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 7,
    height: 7,
    marginTop: -3.5,
    marginLeft: -3.5,
    borderRadius: 2,
  },
  // Reaction chips — 24px visual pills inside 44px hits (padding trick).
  chipRow: {display: 'flex', gap: 8, flexWrap: 'wrap'},
  chipHit: {paddingBlock: 10, marginBlock: -10, borderRadius: 999},
  reactionChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    height: 24,
    paddingInline: 8,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  reactionChipMine: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
    color: 'var(--color-text-primary)',
  },
  // 44×44 side buttons (+ smile chip on every bubble; ⋯ on your last one) —
  // 28px visual circles centered in the full hit.
  sideBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    flexShrink: 0,
    alignSelf: 'flex-end',
  },
  sideBtnFace: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    color: 'var(--color-text-secondary)',
  },
  // Reaction bar — anchored above the bubble stack, 5×44 emoji + padding.
  reactionBar: {
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    display: 'flex',
    gap: 0,
    padding: 4,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    zIndex: 41,
  },
  reactionBarThem: {left: 0},
  reactionBarMe: {right: 0},
  emojiBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    fontSize: 22,
    lineHeight: 1,
  },
  // Unsend menu — anchored above your last bubble.
  unsendMenu: {
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    right: 0,
    minWidth: 160,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'hidden',
    zIndex: 41,
  },
  menuRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 14,
    fontSize: 16,
  },
  menuRowDanger: {color: 'var(--color-error)'},
  menuHairline: {height: 1, background: 'var(--color-border)'},
  // Transparent dismiss scrim (captures taps; overlays raise above it).
  dismissScrim: {
    position: 'absolute',
    inset: 0,
    zIndex: 30,
    background: 'transparent',
    cursor: 'default',
  },
  // Typing indicator — ghost pill with three dots (or static label in RM).
  typingPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '14px 14px',
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    background: 'var(--color-background-muted)',
    width: 'fit-content',
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--color-text-secondary)',
  },
  typingLabel: {
    fontSize: 13,
    fontStyle: 'italic',
    color: 'var(--color-text-secondary)',
    paddingInline: 16,
  },
  // Receipt line under your latest bubble.
  receiptRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  receiptAvatar: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: AVATAR_BG,
    color: AVATAR_TEXT,
    fontSize: 8,
    fontWeight: 700,
  },
  // COMPOSER DOCK — sticky bottom z20; hosts toast + flight pill overlays.
  dockWrap: {
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
  // ONE polite toast dock — absolute above the composer dock.
  toastRegion: {
    position: 'absolute',
    bottom: 'calc(100% + 12px)',
    insetInline: 16,
    zIndex: 26,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    minHeight: 40,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // (b) The flight pill — absolute above the dock at the slot's resting
  // spot; the cmm-fly keyframe supplies the whole arc.
  flightPill: {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    right: 16,
    maxWidth: 260,
    padding: '10px 14px',
    fontSize: 16,
    lineHeight: 1.35,
    borderRadius: 18,
    borderBottomRightRadius: 6,
    background: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    pointerEvents: 'none',
    zIndex: 25,
  },
  quickRow: {
    display: 'flex',
    gap: 8,
    paddingInline: 16,
    paddingTop: 8,
    overflowX: 'auto',
  },
  quickChip: {
    height: 44,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  composer: {display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px 12px'},
  composerInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    flexShrink: 0,
  },
  sendBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
};

// ---------------------------------------------------------------------------
// ============= DATA ============= deterministic fixtures only.
// ---------------------------------------------------------------------------

const CONTACT_NAME = 'Nova Reyes';
const CONTACT_INITIALS = 'NR';

type Sender = 'me' | 'them';
type MsgPhase = 'idle' | 'land' | 'pop' | 'morph' | 'implode' | 'ghost';

interface Reaction {
  emoji: string;
  count: number;
  mine: boolean;
}

interface Message {
  id: string;
  day: 'yday' | 'today';
  from: Sender;
  kind: 'text' | 'photo';
  text: string;
  time: string;
  reactions: Reaction[];
  unsent: boolean;
  phase: MsgPhase;
}

// 14 fixture messages: 6 on Thu Jul 3 + 8 today = 14 ✓. Pre-seeded
// reactions: yours (mine:true) live only on Nova's rows; hers (mine:false)
// only on yours — it's a 1:1 DM, so no third-party counts exist.
const INITIAL_MESSAGES: Message[] = [
  {id: 'y1', day: 'yday', from: 'them', kind: 'text', text: 'ok big news 👀', time: '8:12 PM', reactions: [], unsent: false, phase: 'idle'},
  {id: 'y2', day: 'yday', from: 'them', kind: 'text', text: 'the ceramics studio posted two Saturday openings', time: '8:12 PM', reactions: [], unsent: false, phase: 'idle'},
  {id: 'y3', day: 'yday', from: 'me', kind: 'text', text: 'WAIT. the wheel-throwing one??', time: '8:14 PM', reactions: [], unsent: false, phase: 'idle'},
  {id: 'y4', day: 'yday', from: 'them', kind: 'text', text: 'yes!! 10am slot. i may have already reserved us both', time: '8:15 PM', reactions: [{emoji: '❤️', count: 1, mine: true}], unsent: false, phase: 'idle'},
  {id: 'y5', day: 'yday', from: 'me', kind: 'text', text: "you're the best. i owe you a lemon loaf", time: '8:16 PM', reactions: [], unsent: false, phase: 'idle'},
  {id: 'y6', day: 'yday', from: 'them', kind: 'photo', text: 'Photo — Studio B, wheel room', time: '8:47 PM', reactions: [{emoji: '😮', count: 1, mine: true}], unsent: false, phase: 'idle'},
  {id: 't1', day: 'today', from: 'them', kind: 'text', text: 'morning! still on for 10?', time: '8:03 AM', reactions: [], unsent: false, phase: 'idle'},
  {id: 't2', day: 'today', from: 'me', kind: 'text', text: 'yep — leaving in 20', time: '8:05 AM', reactions: [], unsent: false, phase: 'idle'},
  {id: 't3', day: 'today', from: 'them', kind: 'text', text: 'grab the corner table at Fern & Co after?', time: '8:06 AM', reactions: [], unsent: false, phase: 'idle'},
  {id: 't4', day: 'today', from: 'me', kind: 'text', text: 'obviously. their cardamom bun is the whole reason i throw pots', time: '8:06 AM', reactions: [{emoji: '😂', count: 1, mine: false}], unsent: false, phase: 'idle'},
  {id: 't5', day: 'today', from: 'them', kind: 'text', text: '😂 fair', time: '8:07 AM', reactions: [], unsent: false, phase: 'idle'},
  {id: 't6', day: 'today', from: 'them', kind: 'text', text: 'also bring the apron this time. last time you looked like a glaze accident', time: '8:08 AM', reactions: [], unsent: false, phase: 'idle'},
  {id: 't7', day: 'today', from: 'me', kind: 'text', text: 'one time!! that happened ONE time', time: '8:09 AM', reactions: [], unsent: false, phase: 'idle'},
  {id: 't8', day: 'today', from: 'them', kind: 'text', text: '9:41 says otherwise. see you soon 🏺', time: '9:41 AM', reactions: [], unsent: false, phase: 'idle'},
];

const DAY_SECTIONS: ReadonlyArray<{id: 'yday' | 'today'; label: string}> = [
  {id: 'yday', label: 'Thu, Jul 3'},
  {id: 'today', label: 'Today'},
];

// Staged intro arrival (typing at t+1.2s → morph arrival at t+3.4s) and the
// canned reply script consumed after your sends. All times come from the
// fixed pool below — never a clock.
const INTRO_ARRIVAL = "oh! and mira's in — she wants to see the kiln room 👀";
const REPLIES: readonly string[] = [
  'love it — meet you out front at 9:50 🏺',
  'bringing spare aprons. no glaze accidents on my watch',
];
const TIME_POOL: readonly string[] = [
  '9:42 AM', '9:44 AM', '9:45 AM', '9:47 AM', '9:48 AM',
  '9:50 AM', '9:51 AM', '9:53 AM', '9:55 AM', '9:56 AM',
];

const QUICK_REPLIES: readonly string[] = ['Sounds good!', 'omw 🏃', "Can't wait 🏺"];

const REACTION_EMOJI: ReadonlyArray<{emoji: string; label: string}> = [
  {emoji: '❤️', label: 'Heart'},
  {emoji: '👍', label: 'Thumbs up'},
  {emoji: '😂', label: 'Laughing'},
  {emoji: '😮', label: 'Surprised'},
  {emoji: '😢', label: 'Sad'},
];

// Deterministic 6-particle micro-burst — fixed offsets/rotations/delays,
// token colors only (brand literal + status tokens).
const HEART_PARTICLES: ReadonlyArray<{
  dx: number;
  dy: number;
  rot: number;
  delay: number;
  color: string;
}> = [
  {dx: -26, dy: -30, rot: -18, delay: 0, color: 'var(--color-error)'},
  {dx: 22, dy: -34, rot: 14, delay: 30, color: BRAND_ACCENT},
  {dx: -34, dy: -6, rot: -30, delay: 60, color: 'var(--color-warning)'},
  {dx: 32, dy: -10, rot: 24, delay: 40, color: 'var(--color-success)'},
  {dx: -14, dy: -44, rot: -8, delay: 20, color: BRAND_ACCENT},
  {dx: 12, dy: -46, rot: 10, delay: 50, color: 'var(--color-error)'},
];

// ---------------------------------------------------------------------------
// PURE HELPERS
// ---------------------------------------------------------------------------

/** THE reaction law — gesture, bar, chip, and + chip all commit through it. */
function toggleReaction(
  list: Reaction[],
  emoji: string,
): {next: Reaction[]; added: boolean} {
  const existing = list.find(reaction => reaction.emoji === emoji);
  if (existing == null) {
    return {next: [...list, {emoji, count: 1, mine: true}], added: true};
  }
  if (existing.mine) {
    const next =
      existing.count <= 1
        ? list.filter(reaction => reaction !== existing)
        : list.map(reaction =>
            reaction === existing
              ? {...reaction, count: reaction.count - 1, mine: false}
              : reaction,
          );
    return {next, added: false};
  }
  return {
    next: list.map(reaction =>
      reaction === existing
        ? {...reaction, count: reaction.count + 1, mine: true}
        : reaction,
    ),
    added: true,
  };
}

// ---------------------------------------------------------------------------
// LOCAL HOOKS
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

/** MANDATORY reduced-motion read — matchMedia once, with a change listener. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ---------------------------------------------------------------------------
// MESSAGE ROW — owns its own gesture refs (double-tap + 450ms long-press);
// every gesture commits through the parent's single reaction/unsend updates.
// ---------------------------------------------------------------------------

type OverlayState = {kind: 'bar' | 'menu'; msgId: string} | null;

interface MessageRowProps {
  msg: Message;
  showAvatar: boolean;
  showTime: boolean;
  isLastOwn: boolean;
  receipt: {msgId: string; stage: 'delivered' | 'read'} | null;
  heartActive: boolean;
  overlay: OverlayState;
  reducedMotion: boolean;
  onDoubleTapLike: (msgId: string) => void;
  onOpenBar: (msgId: string) => void;
  onOpenMenu: (msgId: string) => void;
  onReact: (msgId: string, emoji: string) => void;
  onToggleChip: (msgId: string, emoji: string) => void;
  onUnsend: (msgId: string) => void;
  onCloseOverlay: () => void;
  onBubbleAnimationEnd: (msgId: string, phase: MsgPhase) => void;
}

function MessageRow({
  msg,
  showAvatar,
  showTime,
  isLastOwn,
  receipt,
  heartActive,
  overlay,
  reducedMotion,
  onDoubleTapLike,
  onOpenBar,
  onOpenMenu,
  onReact,
  onToggleChip,
  onUnsend,
  onCloseOverlay,
  onBubbleAnimationEnd,
}: MessageRowProps) {
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);
  const lastTapStamp = useRef(0);
  const pressOrigin = useRef<{x: number; y: number} | null>(null);

  useEffect(
    () => () => {
      if (longPressTimer.current != null) {
        window.clearTimeout(longPressTimer.current);
      }
    },
    [],
  );

  const clearLongPress = () => {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (msg.unsent) {
      return;
    }
    pressOrigin.current = {x: event.clientX, y: event.clientY};
    longPressFired.current = false;
    clearLongPress();
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      onOpenBar(msg.id);
    }, 450);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = pressOrigin.current;
    if (origin == null) {
      return;
    }
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (dx * dx + dy * dy > 144) {
      clearLongPress();
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    clearLongPress();
    pressOrigin.current = null;
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    // (c) double-tap → heart, incoming bubbles only.
    if (msg.from === 'them') {
      if (event.timeStamp - lastTapStamp.current < 320) {
        lastTapStamp.current = 0;
        onDoubleTapLike(msg.id);
      } else {
        lastTapStamp.current = event.timeStamp;
      }
    }
  };

  const handlePointerCancel = () => {
    clearLongPress();
    pressOrigin.current = null;
  };

  const isThem = msg.from === 'them';
  const barOpen = overlay?.kind === 'bar' && overlay.msgId === msg.id;
  const menuOpen = overlay?.kind === 'menu' && overlay.msgId === msg.id;
  const raised = barOpen || menuOpen;

  const bubbleClass = (() => {
    if (reducedMotion) {
      return msg.phase === 'ghost' ? 'cmm-ghost-in' : undefined;
    }
    switch (msg.phase) {
      case 'pop':
        return 'cmm-pop';
      case 'morph':
        return 'cmm-morph';
      case 'implode':
        return 'cmm-implode';
      case 'ghost':
        return 'cmm-ghost-in';
      default:
        return undefined;
    }
  })();

  const bubbleStyle: CSSProperties = {
    ...styles.bubble,
    ...(msg.unsent
      ? styles.bubbleGhost
      : isThem
        ? styles.bubbleThem
        : styles.bubbleMe),
    ...(msg.kind === 'photo' && !msg.unsent ? styles.photoBubble : null),
    ...(msg.phase === 'land' ? styles.bubbleLanding : null),
  };

  const snippet = msg.unsent ? 'unsent message' : msg.text;

  const bubbleBody = msg.unsent ? (
    <span>Message unsent</span>
  ) : msg.kind === 'photo' ? (
    <span style={styles.photoTile} role="img" aria-label={msg.text}>
      SB
      <span style={styles.photoCaption}>Studio B · wheel room</span>
    </span>
  ) : (
    <span className={msg.phase === 'morph' ? 'cmm-morph-inner' : undefined}>
      {msg.text}
    </span>
  );

  return (
    <div
      style={{
        ...styles.row,
        ...(isThem ? styles.rowThem : styles.rowMe),
        ...(raised ? styles.rowRaised : null),
      }}>
      {isThem &&
        (showAvatar ? (
          <span style={styles.rowAvatar} aria-hidden="true">
            {CONTACT_INITIALS}
          </span>
        ) : (
          <span style={styles.rowAvatarSpacer} />
        ))}

      {/* Button path — the 44×44 smile-plus chip on EVERY bubble commits
          through the same toggleReaction update as the gestures. */}
      {!isThem && !msg.unsent && (
        <button
          type="button"
          className="cmm-btn cmm-focusable"
          style={styles.sideBtn}
          aria-label={`React to your message "${snippet}"`}
          onClick={() => onOpenBar(msg.id)}>
          <span style={styles.sideBtnFace}>
            <Icon icon={SmilePlusIcon} size="xsm" />
          </span>
        </button>
      )}
      {!isThem && !msg.unsent && isLastOwn && (
        <button
          type="button"
          className="cmm-btn cmm-focusable"
          style={styles.sideBtn}
          aria-label="Message options"
          aria-expanded={menuOpen}
          onClick={() => (menuOpen ? onCloseOverlay() : onOpenMenu(msg.id))}>
          <span style={styles.sideBtnFace}>
            <Icon icon={MoreHorizontalIcon} size="xsm" />
          </span>
        </button>
      )}

      <div
        style={{
          ...styles.bubbleStack,
          ...(isThem ? styles.stackThem : styles.stackMe),
        }}>
        {/* (c) reaction bar — 5 emoji, staggered rise; ESC/scrim closes. */}
        {barOpen && (
          <div
            style={{
              ...styles.reactionBar,
              ...(isThem ? styles.reactionBarThem : styles.reactionBarMe),
            }}
            role="menu"
            aria-label="React to message">
            {REACTION_EMOJI.map((entry, index) => (
              <button
                key={entry.emoji}
                type="button"
                role="menuitem"
                className={`cmm-btn cmm-focusable${reducedMotion ? '' : ' cmm-rise'}`}
                style={{
                  ...styles.emojiBtn,
                  ...(reducedMotion ? null : {animationDelay: `${index * 40}ms`}),
                }}
                aria-label={`React with ${entry.label}`}
                onClick={() => onReact(msg.id, entry.emoji)}>
                {entry.emoji}
              </button>
            ))}
          </div>
        )}
        {/* (d) unsend menu on your last bubble. */}
        {menuOpen && (
          <div
            style={styles.unsendMenu}
            role="menu"
            aria-label="Message options"
            className={reducedMotion ? undefined : 'cmm-rise'}>
            <button
              type="button"
              role="menuitem"
              className="cmm-btn cmm-focusable"
              style={{...styles.menuRow, ...styles.menuRowDanger}}
              onClick={() => onUnsend(msg.id)}>
              Unsend
            </button>
            <div style={styles.menuHairline} />
            <button
              type="button"
              role="menuitem"
              className="cmm-btn cmm-focusable"
              style={styles.menuRow}
              onClick={onCloseOverlay}>
              Cancel
            </button>
          </div>
        )}

        <div
          className={bubbleClass}
          style={bubbleStyle}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onAnimationEnd={event => {
            if (event.target === event.currentTarget) {
              onBubbleAnimationEnd(msg.id, msg.phase);
            }
          }}>
          {bubbleBody}
          {/* (c) heart pop + 6-particle micro-burst (fixed offsets). */}
          {heartActive && !reducedMotion && (
            <span style={styles.heartLayer} aria-hidden="true">
              <span className="cmm-heart" style={styles.heartGlyph}>
                ❤️
              </span>
              {HEART_PARTICLES.map((particle, index) => (
                <span
                  key={index}
                  className="cmm-particle"
                  style={
                    {
                      ...styles.particle,
                      background: particle.color,
                      animationDelay: `${particle.delay}ms`,
                      '--cmm-dx': `${particle.dx}px`,
                      '--cmm-dy': `${particle.dy}px`,
                      '--cmm-rot': `${particle.rot}deg`,
                    } as CSSProperties
                  }
                />
              ))}
            </span>
          )}
        </div>

        {/* Reaction chips — tap to toggle; keyed remount re-pops on change. */}
        {!msg.unsent && msg.reactions.length > 0 && (
          <div style={styles.chipRow}>
            {msg.reactions.map(reaction => (
              <button
                key={reaction.emoji}
                type="button"
                className="cmm-btn cmm-focusable"
                style={styles.chipHit}
                aria-label={`${reaction.emoji} reaction, ${reaction.count}${reaction.mine ? ', including yours — tap to remove' : ' — tap to add yours'}`}
                onClick={() => onToggleChip(msg.id, reaction.emoji)}>
                <span
                  key={`${reaction.emoji}-${reaction.count}-${reaction.mine}`}
                  className={reducedMotion ? undefined : 'cmm-chip-pop'}
                  style={{
                    ...styles.reactionChip,
                    ...(reaction.mine ? styles.reactionChipMine : null),
                  }}>
                  <span aria-hidden="true">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* (b) Delivered → Read receipt with the tiny avatar slide. */}
        {!isThem && !msg.unsent && receipt != null && receipt.msgId === msg.id && (
          <div style={styles.receiptRow} aria-label={`Message ${receipt.stage}`}>
            {receipt.stage === 'read' && (
              <span
                className={reducedMotion ? undefined : 'cmm-avatar-slide'}
                style={styles.receiptAvatar}
                aria-hidden="true">
                N
              </span>
            )}
            <span>{receipt.stage === 'read' ? 'Read' : 'Delivered'}</span>
          </div>
        )}

        {showTime && <span style={styles.timeMeta}>{msg.time}</span>}
      </div>

      {/* Button path on incoming bubbles too. */}
      {isThem && !msg.unsent && (
        <button
          type="button"
          className="cmm-btn cmm-focusable"
          style={styles.sideBtn}
          aria-label={`React to ${CONTACT_NAME}'s message "${snippet}"`}
          onClick={() => onOpenBar(msg.id)}>
          <span style={styles.sideBtnFace}>
            <Icon icon={SmilePlusIcon} size="xsm" />
          </span>
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

interface Flight {
  seq: number;
  text: string;
  msgId: string;
}

export default function MobileChatMicroMotionTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideFallback = useMediaQuery('(min-width: 560px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth > 560 : isWideFallback;

  const reducedMotion = useReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [receipt, setReceipt] = useState<{msgId: string; stage: 'delivered' | 'read'} | null>(
    {msgId: 't7', stage: 'read'},
  );
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [heartFor, setHeartFor] = useState<string | null>(null);
  const [toast, setToast] = useState<{seq: number; text: string} | null>(null);

  const flightRef = useRef<Flight | null>(null);
  const sendSeqRef = useRef(0);
  const timeIdxRef = useRef(1); // TIME_POOL[0] belongs to the intro arrival.
  const replyIdxRef = useRef(0);
  const toastSeqRef = useRef(0);
  const startedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const didMountScrollRef = useRef(false);

  // Choreography timers are always registered here and cleared on unmount.
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);
  useEffect(
    () => () => {
      timersRef.current.forEach(id => window.clearTimeout(id));
    },
    [],
  );

  const showToast = useCallback(
    (text: string) => {
      const seq = ++toastSeqRef.current;
      setToast({seq, text}); // a new toast REPLACES the old — one at a time.
      schedule(() => {
        setToast(prev => (prev != null && prev.seq === seq ? null : prev));
      }, 2400);
    },
    [schedule],
  );

  const nextTime = useCallback(() => {
    const index = Math.min(timeIdxRef.current, TIME_POOL.length - 1);
    timeIdxRef.current += 1;
    return TIME_POOL[index] ?? '9:58 AM';
  }, []);

  const appendIncoming = useCallback(
    (text: string, time: string) => {
      const id = `r${++sendSeqRef.current}`;
      const phase: MsgPhase = reducedMotionRef.current ? 'idle' : 'morph';
      setMessages(prev => [
        ...prev,
        {id, day: 'today', from: 'them', kind: 'text', text, time, reactions: [], unsent: false, phase},
      ]);
    },
    [],
  );

  // Reply chain: after your send settles, Nova types for 2.2s, then the
  // typing pill morphs into her canned reply.
  const scheduleReply = useCallback(() => {
    if (replyIdxRef.current >= REPLIES.length) {
      return;
    }
    const text = REPLIES[replyIdxRef.current] ?? '';
    replyIdxRef.current += 1;
    schedule(() => setTyping(true), 1100);
    schedule(() => {
      setTyping(false);
      appendIncoming(text, nextTime());
    }, 1100 + 2200);
  }, [appendIncoming, nextTime, schedule]);

  // (b) flight lands → the real bubble pops in, Delivered → Read receipts.
  const landMessage = useCallback(
    (msgId: string) => {
      setMessages(prev =>
        prev.map(msg => (msg.id === msgId ? {...msg, phase: 'pop' as MsgPhase} : msg)),
      );
      setReceipt({msgId, stage: 'delivered'});
      showToast('Message sent');
      schedule(() => {
        setReceipt(prev =>
          prev != null && prev.msgId === msgId ? {msgId, stage: 'read'} : prev,
        );
      }, 1600);
      scheduleReply();
    },
    [schedule, scheduleReply, showToast],
  );

  const finishFlight = useCallback(() => {
    const active = flightRef.current;
    if (active == null) {
      return;
    }
    flightRef.current = null;
    setFlight(null);
    landMessage(active.msgId);
  }, [landMessage]);

  const sendText = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (text === '') {
        return;
      }
      finishFlight(); // finalize any in-flight pill before starting anew.
      const id = `s${++sendSeqRef.current}`;
      const time = nextTime();
      const reduced = reducedMotionRef.current;
      setDraft('');
      setMessages(prev => [
        ...prev,
        {
          id,
          day: 'today',
          from: 'me',
          kind: 'text',
          text,
          time,
          reactions: [],
          unsent: false,
          phase: reduced ? 'idle' : 'land',
        },
      ]);
      if (reduced) {
        // Reduced motion: instant send — no arc, receipts swap in place.
        setReceipt({msgId: id, stage: 'delivered'});
        showToast('Message sent');
        schedule(() => {
          setReceipt(prev =>
            prev != null && prev.msgId === id ? {msgId: id, stage: 'read'} : prev,
          );
        }, 1400);
        scheduleReply();
        return;
      }
      const next: Flight = {seq: ++toastSeqRef.current, text, msgId: id};
      flightRef.current = next;
      setFlight(next);
      // Idempotent backstop — animationend normally fires first.
      schedule(finishFlight, 900);
    },
    [finishFlight, nextTime, schedule, scheduleReply, showToast],
  );

  // (c) one reaction law for every entry point.
  const applyReaction = useCallback(
    (msgId: string, emoji: string, viaHeartGesture: boolean) => {
      let added = false;
      setMessages(prev =>
        prev.map(msg => {
          if (msg.id !== msgId || msg.unsent) {
            return msg;
          }
          const result = toggleReaction(msg.reactions, emoji);
          added = result.added;
          return {...msg, reactions: result.next};
        }),
      );
      setOverlay(null);
      if (viaHeartGesture && added && !reducedMotionRef.current) {
        setHeartFor(msgId);
        schedule(() => {
          setHeartFor(prev => (prev === msgId ? null : prev));
        }, 950);
      }
      showToast(added ? `You reacted ${emoji}` : 'Reaction removed');
    },
    [schedule, showToast],
  );

  // (d) unsend — implode, then ghost in the placeholder.
  const markUnsent = useCallback((msgId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === msgId && !msg.unsent
          ? {...msg, unsent: true, reactions: [], phase: 'ghost' as MsgPhase}
          : msg,
      ),
    );
    setReceipt(prev => (prev != null && prev.msgId === msgId ? null : prev));
  }, []);

  const handleUnsend = useCallback(
    (msgId: string) => {
      setOverlay(null);
      showToast('Message unsent');
      if (reducedMotionRef.current) {
        markUnsent(msgId);
        return;
      }
      setMessages(prev =>
        prev.map(msg => (msg.id === msgId ? {...msg, phase: 'implode' as MsgPhase} : msg)),
      );
      schedule(() => markUnsent(msgId), 500); // backstop; animationend wins.
    },
    [markUnsent, schedule, showToast],
  );

  const handleBubbleAnimationEnd = useCallback(
    (msgId: string, phase: MsgPhase) => {
      if (phase === 'implode') {
        markUnsent(msgId);
      } else if (phase === 'pop' || phase === 'morph') {
        setMessages(prev =>
          prev.map(msg => (msg.id === msgId ? {...msg, phase: 'idle' as MsgPhase} : msg)),
        );
      }
    },
    [markUnsent],
  );

  const handleDoubleTapLike = useCallback(
    (msgId: string) => {
      applyReaction(msgId, '❤️', true);
    },
    [applyReaction],
  );

  // Mount choreography: typing pill at t+1.2s → intro arrival at t+3.4s.
  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    schedule(() => setTyping(true), 1200);
    schedule(() => {
      setTyping(false);
      appendIncoming(INTRO_ARRIVAL, TIME_POOL[0] ?? '9:42 AM');
    }, 3400);
  }, [appendIncoming, schedule]);

  // Keep the thread pinned to the latest message.
  useEffect(() => {
    const behavior: ScrollBehavior =
      didMountScrollRef.current && !reducedMotionRef.current ? 'smooth' : 'auto';
    didMountScrollRef.current = true;
    bottomRef.current?.scrollIntoView({behavior, block: 'end'});
  }, [messages.length, typing]);

  // ESC closes any anchored overlay.
  useEffect(() => {
    if (overlay == null) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOverlay(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay]);

  const handleComposerKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendText(draft);
    }
  };

  const lastOwnId = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg != null && msg.from === 'me' && !msg.unsent) {
        return msg.id;
      }
    }
    return null;
  })();

  const canSend = draft.trim() !== '';

  return (
    <div
      ref={wrapRef}
      style={{...styles.wrap, ...(isDesktopColumn ? styles.wrapDesktop : null)}}>
      <style>{CMM_CSS}</style>
      <div
        style={{...styles.shell, ...(isDesktopColumn ? styles.shellDesktop : null)}}>
        <h1 className="cmm-vh">Chat Micro-Motion — Ripple Messages thread with {CONTACT_NAME}</h1>

        {/* NAV BAR */}
        <header style={styles.navBar}>
          <button
            type="button"
            className="cmm-btn cmm-focusable"
            style={styles.navIconBtn}
            aria-label="Back to conversations"
            onClick={() => {}}>
            <Icon icon={ChevronLeftIcon} size="sm" />
          </button>
          <div style={styles.navCenter}>
            <span style={styles.navAvatar} aria-hidden="true">
              {CONTACT_INITIALS}
            </span>
            <div style={styles.navNameCol}>
              <p style={styles.navName}>{CONTACT_NAME}</p>
              <span style={styles.navStatus}>
                <span style={styles.statusDot} aria-hidden="true" />
                Active now
              </span>
            </div>
          </div>
          <button
            type="button"
            className="cmm-btn cmm-focusable"
            style={styles.navIconBtn}
            aria-label={`Call ${CONTACT_NAME}`}
            onClick={() => {}}>
            <Icon icon={PhoneIcon} size="sm" />
          </button>
        </header>

        {/* Transparent dismiss scrim under any anchored overlay. */}
        {overlay != null && (
          <button
            type="button"
            className="cmm-btn"
            style={styles.dismissScrim}
            aria-label="Dismiss"
            onClick={() => setOverlay(null)}
          />
        )}

        {/* THREAD */}
        <main style={styles.thread}>
          {DAY_SECTIONS.map(section => {
            const sectionMessages = messages.filter(msg => msg.day === section.id);
            return (
              <section key={section.id} style={styles.daySection} aria-label={section.label}>
                {/* (e) new-day divider — pins briefly under the navBar. */}
                <div style={styles.dayPin}>
                  <span style={styles.dayPill}>{section.label}</span>
                </div>
                <div style={styles.dayMessages}>
                  {sectionMessages.map((msg, index) => {
                    const next = sectionMessages[index + 1];
                    const endOfGroup = next == null || next.from !== msg.from;
                    return (
                      <MessageRow
                        key={msg.id}
                        msg={msg}
                        showAvatar={msg.from === 'them' && endOfGroup}
                        showTime={endOfGroup}
                        isLastOwn={msg.id === lastOwnId}
                        receipt={receipt}
                        heartActive={heartFor === msg.id}
                        overlay={overlay}
                        reducedMotion={reducedMotion}
                        onDoubleTapLike={handleDoubleTapLike}
                        onOpenBar={msgId => setOverlay({kind: 'bar', msgId})}
                        onOpenMenu={msgId => setOverlay({kind: 'menu', msgId})}
                        onReact={(msgId, emoji) => applyReaction(msgId, emoji, emoji === '❤️')}
                        onToggleChip={(msgId, emoji) => applyReaction(msgId, emoji, false)}
                        onUnsend={handleUnsend}
                        onCloseOverlay={() => setOverlay(null)}
                        onBubbleAnimationEnd={handleBubbleAnimationEnd}
                      />
                    );
                  })}
                  {/* (a) typing indicator lives at the end of Today. */}
                  {section.id === 'today' && typing && (
                    <div style={{...styles.row, ...styles.rowThem}}>
                      <span style={styles.rowAvatar} aria-hidden="true">
                        {CONTACT_INITIALS}
                      </span>
                      {reducedMotion ? (
                        <span style={styles.typingLabel}>{CONTACT_NAME.split(' ')[0]} is typing…</span>
                      ) : (
                        <span style={styles.typingPill} aria-label={`${CONTACT_NAME} is typing`}>
                          {[0, 120, 240].map(delay => (
                            <span
                              key={delay}
                              className="cmm-dot"
                              style={{...styles.typingDot, animationDelay: `${delay}ms`}}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                  )}
                  {section.id === 'today' && <div ref={bottomRef} />}
                </div>
              </section>
            );
          })}
        </main>

        {/* COMPOSER DOCK — hosts the toast dock and the flight pill. */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} aria-live="polite">
            {toast != null && (
              <div
                key={toast.seq}
                className={reducedMotion ? undefined : 'cmm-rise'}
                style={styles.toast}>
                {toast.text}
              </div>
            )}
          </div>
          {flight != null && (
            <div
              key={flight.seq}
              className="cmm-fly"
              style={styles.flightPill}
              aria-hidden="true"
              onAnimationEnd={finishFlight}>
              {flight.text}
            </div>
          )}
          <div style={styles.quickRow} role="group" aria-label="Quick replies">
            {QUICK_REPLIES.map(text => (
              <button
                key={text}
                type="button"
                className="cmm-btn cmm-focusable"
                style={styles.quickChip}
                onClick={() => sendText(text)}>
                {text}
              </button>
            ))}
          </div>
          <div style={styles.composer}>
            <input
              type="text"
              style={styles.composerInput}
              className="cmm-focusable"
              value={draft}
              placeholder="Message…"
              aria-label="Message"
              onChange={event => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
            />
            <button
              type="button"
              className="cmm-btn cmm-focusable"
              style={{...styles.sendBtn, ...(canSend ? null : styles.sendBtnDisabled)}}
              aria-label="Send message"
              disabled={!canSend}
              onClick={() => sendText(draft)}>
              <Icon icon={SendIcon} size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
