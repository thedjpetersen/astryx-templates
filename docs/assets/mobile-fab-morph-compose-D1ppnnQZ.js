var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Fernpad notes household frozen
 *   at TODAY 'Fri, Jul 10': 8 notes (1 pinned text, 2 checklists at
 *   '5 of 8' and '2 of 6', 2 voice memos at 0:42 and 0:17, 1 photo note
 *   as a hue-210 gradient tile with a 'WB' monogram, 2 plain texts), fixed
 *   time labels ('Today 8:12 AM' … 'Jun 29'), and three quick-add seed
 *   notes (Photo / Voice / Checklist) inserted verbatim by the speed dial.
 *   No Date.now(), no Math.random(), no network media (art = hue-gradient
 *   tiles + monograms). Every count on screen derives from the one notes
 *   array (header caption '8 notes · 1 pinned' → 9 after a post).
 * @output Fernpad — FAB Morph Composer: a 390px MOBILE notes screen whose
 *   centerpiece is a 56px brand FAB (bottom-right, riding the sticky dock
 *   above the toast region). TAP: the FAB fades down while a bottom-
 *   anchored 320px compose card expands out of its corner — transform
 *   scale 0.15→1 + border-radius 999→16 + opacity, transform-origin pinned
 *   to the FAB's center — over a scrim that fades in behind (all absolute
 *   INSIDE shell). Post collapses the sheet back into the FAB (reverse
 *   morph via class removal), then the new note card inserts at the top of
 *   the list with a -8px slide-in and a brand-tint highlight pulse that
 *   decays over 1.1s; the toast dock announces 'Note posted'. LONG-PRESS
 *   (450ms pointerdown→timer, with a stroke-dashoffset ring filling around
 *   the FAB): a speed-dial arc fans 3 mini-actions (Photo note / Voice
 *   note / Checklist) out along a 96px arc with staggered overshoot
 *   (cubic-bezier(0.34,1.56,0.64,1), 50ms per index); each mini carries a
 *   label chip; Escape or scrim tap retracts in reverse stagger. The 44×44
 *   '⋯' button beside the FAB is the MANDATORY BUTTON PATH to the same
 *   speed dial (same openDial state update); the FAB itself is a plain
 *   button, so tap-to-compose needs no gesture. Notes expand/collapse in
 *   place on tap (aria-expanded), and a navBar pin toggle re-sorts pinned
 *   notes first.
 * @position Page template; emitted by \`astryx template mobile-fab-morph-compose\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the 52px navBar
 *   at y=0 is the first pixel). All overlays (scrim z40, compose sheet
 *   z41, speed-dial minis inside the dock raised to z41) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   sheet or dial is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. ONE polite toast dock
 *   (aria-live) rides the sticky bottom dock at bottom:16 (no tabBar
 *   here); a new toast REPLACES the old.
 * Animation contract: transform + opacity only, plus the two sanctioned
 *   extras — border-radius on the FAB→sheet morph (the spec's named
 *   mechanic) and stroke-dashoffset on the 450ms hold ring. Springy
 *   overshoot = cubic-bezier(0.34,1.56,0.64,1) (speed-dial fan);
 *   decelerate = cubic-bezier(0.22,1,0.36,1) (sheet morph, note slide-in).
 *   Phases chain via state classes + cleaned-up timers; stagger via
 *   per-index transitionDelay. REDUCED MOTION (matchMedia read once in a
 *   useEffect with a change listener, mirrored by a CSS backstop): sheet
 *   and scrim become opacity-only crossfades, the speed dial pops in place
 *   without travel or stagger, the highlight pulse and slide-in are
 *   REMOVED, and the hold ring fills as an opacity step.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#0F766E, #5EEAD4) — white 17px text on
 *   #0F766E ≈ 5.5:1; near-black #06201C on #5EEAD4 ≈ 11.5:1; as a bare
 *   fill, #0F766E on the white card ≈ 5.5:1 and #5EEAD4 on the ~#1C1C1E
 *   dark card ≈ 11:1, both ≥3:1. Sanctioned non-brand literals: the scrim
 *   pair and the photo-note art gradient (id-derived hsl fixture art —
 *   white monogram on 45%/26%-lightness stops ≈ 4.6:1+ both schemes).
 *   Never var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px section
 *   gaps · 8px chip gaps; navBar 52px sticky top z20 with hairline; note
 *   cards 12px radius 1px border; FAB 56px at right:16 bottom:76 (above
 *   the toast dock at bottom:16); minis 44px circles; every interactive
 *   target ≥44×44. TYPE: 17/600 nav title · 16/600 note titles · 13/400
 *   snippets/meta · 11/500 eyebrows and chips; tabular-nums on counts.
 *
 * Responsive contract:
 * - Fluid 320–430: note cards and the sheet are inset-16 fluid width; the
 *   speed-dial arc (96px radius up-left from the FAB) stays inside 320
 *   (longest chip run ≈ 237px from the right edge). overflowX:'clip'
 *   backstop on shell.
 * - Desktop stage: useElementWidth ResizeObserver on the wrapper
 *   (container width, not viewport) — >560px renders the standard
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline) on a --color-background-muted backdrop; never a stretched
 *   relayout.
 */

import {useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  CameraIcon,
  ListChecksIcon,
  MicIcon,
  MoreHorizontalIcon,
  PinIcon,
  PlusIcon,
  StickyNoteIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Fernpad teal). White 17px text on #0F766E
// ≈ 5.5:1; near-black #06201C on #5EEAD4 ≈ 11.5:1. As a bare fill vs
// surfaces: #0F766E on the white card ≈ 5.5:1 and #5EEAD4 on the ~#1C1C1E
// dark card ≈ 11:1 — both clear the ≥3:1 bar for meaningful fills (FAB,
// hold ring, mini glyphs, pin toggle).
const BRAND_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
// Text over a BRAND_ACCENT fill (math above).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #06201C)';
// Brand-tinted washes — active pin-toggle seat and the fresh-note pulse.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
const BRAND_TINT_20 = \`color-mix(in srgb, \${BRAND_ACCENT} 20%, transparent)\`;
// Overlay scrim (sanctioned non-brand literal, like every mobile sibling).
const SCRIM = 'light-dark(rgba(16, 20, 19, 0.32), rgba(0, 0, 0, 0.55))';

// Hold-ring circumference: r=30 ⇒ 2π·30 ≈ 188.5 (mirrored in the CSS).
const RING_CIRCUMFERENCE = 188.5;

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, clamp, the FAB→sheet
// morph, speed-dial fan, hold ring, fresh-note pulse, reduced-motion
// overrides (class-driven via matchMedia + a media-query backstop).
// ---------------------------------------------------------------------------

const FMC_CSS = \`
.fmc-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.fmc-btn:disabled { cursor: default; }
.fmc-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.fmc-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.fmc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.fmc-scrim { opacity: 0; transition: opacity 240ms ease; }
.fmc-scrim-open { opacity: 1; }
/* FAB→sheet morph: closed pose is a scaled-down circle at the FAB's
   corner (transform-origin set inline); opening adds .fmc-sheet-open. */
.fmc-sheet {
  transform: scale(0.15);
  border-radius: 999px;
  opacity: 0;
  transition:
    transform 340ms cubic-bezier(0.22, 1, 0.36, 1),
    border-radius 340ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 220ms ease;
}
.fmc-sheet-open { transform: none; border-radius: 16px; opacity: 1; }
.fmc-fab {
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 160ms ease;
}
/* Speed-dial minis: overshoot fan; per-index delay set inline. */
.fmc-mini {
  transition:
    transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 180ms ease;
}
/* 450ms hold ring — stroke-dashoffset is a sanctioned animated property. */
.fmc-ring-rest {
  stroke-dashoffset: \${RING_CIRCUMFERENCE};
  opacity: 0;
  transition: stroke-dashoffset 120ms ease, opacity 120ms ease;
}
.fmc-ring-fill {
  stroke-dashoffset: 0;
  opacity: 1;
  transition: stroke-dashoffset 450ms linear, opacity 80ms ease;
}
@keyframes fmc-note-in {
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.fmc-note-in { animation: fmc-note-in 260ms cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes fmc-pulse {
  from { opacity: 0.9; }
  to { opacity: 0; }
}
.fmc-pulse { animation: fmc-pulse 1100ms ease-out 120ms forwards; }
/* REDUCED MOTION — .fmc-rm is set from matchMedia in JS; the media query
   below is a pure-CSS backstop. Sheet/scrim: opacity only. Dial: pop in
   place (JS also zeroes travel + delays). Pulse/slide-in: removed. */
.fmc-rm .fmc-sheet {
  transform: none;
  border-radius: 16px;
  transition: opacity 150ms ease;
}
.fmc-rm .fmc-fab { transition: opacity 120ms ease; }
.fmc-rm .fmc-mini { transition: opacity 120ms ease; }
.fmc-rm .fmc-ring-fill { transition: opacity 80ms ease; }
.fmc-rm .fmc-note-in { animation: none; }
.fmc-rm .fmc-pulse { animation: none; }
@media (prefers-reduced-motion: reduce) {
  .fmc-sheet { transform: none; border-radius: 16px; transition: opacity 150ms ease; }
  .fmc-fab { transition: opacity 120ms ease; }
  .fmc-mini { transition: opacity 120ms ease; }
  .fmc-ring-fill { transition: opacity 80ms ease; }
  .fmc-note-in { animation: none; }
  .fmc-pulse { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
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
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, always-on hairline.
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', minWidth: 0},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  brandSeat: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  iconBtnActive: {color: BRAND_ACCENT, background: BRAND_TINT_12},
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // Summary caption — every number derives from the notes array.
  summaryRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // NOTE LIST — individual 12px-radius cards, 12px gaps, 16px inset;
  // bottom padding clears the FAB cluster (76 + 56 + 16).
  noteList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    paddingBottom: 150,
  },
  noteCard: {
    position: 'relative',
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  noteBtn: {
    width: '100%',
    minHeight: 64,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '12px 16px',
  },
  noteSeat: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // Photo-note fixture art — hue gradient + monogram, no network media.
  noteArt: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  noteText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 4},
  noteTitleRow: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  noteTitle: {
    fontSize: 16,
    fontWeight: 600,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pinGlyph: {color: BRAND_ACCENT, display: 'inline-flex', flexShrink: 0},
  noteSnippet: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.45,
    color: 'var(--color-text-secondary)',
  },
  noteBody: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'pre-line',
  },
  noteMeta: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.02em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Fresh-note highlight pulse — an opacity-only tint overlay that decays.
  pulseOverlay: {
    position: 'absolute',
    inset: 0,
    background: BRAND_TINT_20,
    pointerEvents: 'none',
    opacity: 0,
  },
  // STICKY DOCK — zero-height sticky line at the shell bottom; the toast
  // region (bottom:16) and FAB cluster (bottom:76) hang above it. zIndex
  // is raised to 41 inline while the speed dial is open so the minis ride
  // above the z40 scrim.
  dockWrap: {position: 'sticky', bottom: 0, height: 0, zIndex: 20},
  toastRegion: {
    position: 'absolute',
    bottom: 16,
    insetInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'auto',
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastText: {
    fontSize: 13,
    fontWeight: 500,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  toastDismiss: {
    width: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  fabCluster: {position: 'absolute', right: 16, bottom: 76, width: 56, height: 56},
  fab: {
    position: 'absolute',
    inset: 0,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 6px 16px var(--color-shadow)',
    touchAction: 'none',
  },
  fabHidden: {transform: 'scale(0.4)', opacity: 0, pointerEvents: 'none'},
  holdRing: {position: 'absolute', inset: -6, pointerEvents: 'none'},
  moreBtn: {
    position: 'absolute',
    right: 68,
    top: 6,
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 2px 8px var(--color-shadow)',
  },
  // Speed-dial mini — [label chip, 44px circle] growing leftward from a
  // right anchor so the circle lands exactly on its arc point.
  mini: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transformOrigin: 'calc(100% - 22px) 50%',
  },
  miniChip: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    padding: '5px 10px',
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 8px var(--color-shadow)',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  miniCircle: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 8px var(--color-shadow)',
    color: BRAND_ACCENT,
  },
  // OVERLAYS — scrim z40, compose sheet z41, absolute INSIDE shell.
  scrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
  sheet: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    height: 320,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 12px 40px var(--color-shadow)',
    overflow: 'hidden',
    // FAB center relative to the sheet box: 28px from its right edge,
    // 88px above its bottom edge (FAB bottom 76 + r 28 − sheet bottom 16).
    transformOrigin: 'calc(100% - 28px) calc(100% - 88px)',
  },
  sheetHeader: {
    height: 44,
    marginBlock: -6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  sheetTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  sheetFields: {display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0},
  sheetFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexShrink: 0,
  },
  discardBtn: {
    height: 44,
    paddingInline: 12,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
  },
  postBtn: {
    height: 44,
    minWidth: 96,
    paddingInline: 20,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  postBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
};

// ============= DATA =============
// Deterministic fixtures — TODAY frozen at 'Fri, Jul 10' (labels are fixed
// strings; no wall-clock reads anywhere).

type NoteKind = 'text' | 'checklist' | 'voice' | 'photo';

interface Note {
  id: string;
  kind: NoteKind;
  title: string;
  snippet: string;
  body: string;
  timeLabel: string;
  pinned: boolean;
  /** Kind-specific stat: '5 of 8 done' / '0:42'. */
  extra: string | null;
  /** Photo notes only — id-derived art hue + monogram. */
  hue: number | null;
  mono: string | null;
}

const KIND_LABEL: Record<NoteKind, string> = {
  text: 'Note',
  checklist: 'Checklist',
  voice: 'Voice memo',
  photo: 'Photo',
};

const KIND_ICON = {
  text: StickyNoteIcon,
  checklist: ListChecksIcon,
  voice: MicIcon,
  photo: CameraIcon,
} as const;

// 8 fixture notes (per spec). 1 pinned, 2 checklists, 2 voice, 1 photo.
const NOTES: Note[] = [
  {
    id: 'garden',
    kind: 'text',
    title: 'Rooftop garden supply run',
    snippet: 'Bagged soil ×3, drip-line couplers, shade cloth for the tomatoes before the heat wave lands Saturday.',
    body: 'Bagged soil ×3, drip-line couplers, shade cloth for the tomatoes before the heat wave lands Saturday.\\nAsk the co-op about the rain-barrel diverter — Marta said they restocked Tuesday.',
    timeLabel: 'Today 8:12 AM',
    pinned: true,
    extra: null,
    hue: null,
    mono: null,
  },
  {
    id: 'packing',
    kind: 'checklist',
    title: 'Packing — Lake Wenatchee',
    snippet: 'Tent poles, bear canister, headlamps charged, dry bags…',
    body: '✓ Tent poles\\n✓ Bear canister\\n✓ Headlamps charged\\n✓ Dry bags\\n✓ Stove fuel\\n· Water filter\\n· First-aid restock\\n· Trailhead permit printout',
    timeLabel: 'Today 7:40 AM',
    pinned: false,
    extra: '5 of 8 done',
    hue: null,
    mono: null,
  },
  {
    id: 'standup',
    kind: 'voice',
    title: 'Standup ramble',
    snippet: 'Rolled-over notes on the flaky import job and Thursday’s demo order.',
    body: 'Recording — 0:42. Rolled-over notes on the flaky import job and Thursday’s demo order.',
    timeLabel: 'Yesterday',
    pinned: false,
    extra: '0:42',
    hue: null,
    mono: null,
  },
  {
    id: 'whiteboard',
    kind: 'photo',
    title: 'Whiteboard — Q3 roadmap',
    snippet: 'Sketch from the planning room before it got erased.',
    body: 'Sketch from the planning room before it got erased. Left column is the committed lane; the dotted arrows are stretch.',
    timeLabel: 'Yesterday',
    pinned: false,
    extra: null,
    hue: 210,
    mono: 'WB',
  },
  {
    id: 'sourdough',
    kind: 'text',
    title: 'Sourdough timing notes',
    snippet: 'Levain at 7am, autolyse 90 min, folds every 45 — oven spring finally fixed by the colder proof.',
    body: 'Levain at 7am, autolyse 90 min, folds every 45 — oven spring finally fixed by the colder proof.\\nNext bake: try 78% hydration and hold back 50g of the water.',
    timeLabel: 'Wed',
    pinned: false,
    extra: null,
    hue: null,
    mono: null,
  },
  {
    id: 'gifts',
    kind: 'text',
    title: 'Gift ideas — Dad’s 60th',
    snippet: 'Restored hand plane, the birdwatching scope Renee mentioned, or the ferry-and-oysters day trip.',
    body: 'Restored hand plane, the birdwatching scope Renee mentioned, or the ferry-and-oysters day trip.\\nBudget cap $180 if we split three ways.',
    timeLabel: 'Tue',
    pinned: false,
    extra: null,
    hue: null,
    mono: null,
  },
  {
    id: 'fixit',
    kind: 'checklist',
    title: 'Apartment fix-it list',
    snippet: 'Bathroom fan rattle, patch hallway scuff, re-caulk tub…',
    body: '✓ Bathroom fan rattle\\n✓ Patch hallway scuff\\n· Re-caulk tub\\n· Balcony door latch\\n· Replace entry bulb\\n· Tighten towel bar',
    timeLabel: 'Jul 3',
    pinned: false,
    extra: '2 of 6 done',
    hue: null,
    mono: null,
  },
  {
    id: 'chorus',
    kind: 'voice',
    title: 'Chorus melody idea',
    snippet: 'Hummed over the bridge chords — the lift lands on the fourth bar.',
    body: 'Recording — 0:17. Hummed over the bridge chords — the lift lands on the fourth bar.',
    timeLabel: 'Jun 29',
    pinned: false,
    extra: '0:17',
    hue: null,
    mono: null,
  },
];

// Speed-dial arc — 3 minis fanned up-left from the FAB center on a 96px
// radius (angles 90° / 120° / 150° from horizontal). dx/dy are offsets
// from the FAB center; the closed pose translates each mini back by
// (-dx,-dy) so the fan visually erupts from the FAB.
interface MiniAction {
  kind: 'photo' | 'voice' | 'checklist';
  label: string;
  icon: typeof CameraIcon;
  dx: number;
  dy: number;
}

const MINI_ACTIONS: MiniAction[] = [
  {kind: 'photo', label: 'Photo note', icon: CameraIcon, dx: 0, dy: -96},
  {kind: 'voice', label: 'Voice note', icon: MicIcon, dx: -48, dy: -83},
  {kind: 'checklist', label: 'Checklist', icon: ListChecksIcon, dx: -83, dy: -48},
];

// Quick-add seeds — inserted verbatim (deterministic) by the speed dial.
const QUICK_SEEDS: Record<MiniAction['kind'], Omit<Note, 'id'> & {toastText: string}> = {
  photo: {
    kind: 'photo',
    title: 'Photo note',
    snippet: 'Add a caption to your shot.',
    body: 'Add a caption to your shot.',
    timeLabel: 'Just now',
    pinned: false,
    extra: null,
    hue: 152,
    mono: 'PN',
    toastText: 'Photo note added',
  },
  voice: {
    kind: 'voice',
    title: 'Voice note',
    snippet: 'Tap record to start a memo.',
    body: 'Recording — 0:00. Tap record to start a memo.',
    timeLabel: 'Just now',
    pinned: false,
    extra: '0:00',
    hue: null,
    mono: null,
    toastText: 'Voice note added',
  },
  checklist: {
    kind: 'checklist',
    title: 'Checklist',
    snippet: 'First item…',
    body: '· First item…',
    timeLabel: 'Just now',
    pinned: false,
    extra: '0 of 1 done',
    hue: null,
    mono: null,
    toastText: 'Checklist added',
  },
};

// Fixture art gradient — same literal in both schemes (reads as photo art,
// not chrome); white monogram on 45%/26%-lightness stops ≈ 4.6:1+.
function artGradient(hue: number): string {
  return \`linear-gradient(135deg, hsl(\${hue} 45% 40%), hsl(\${(hue + 40) % 360} 55% 26%))\`;
}

// ---------------------------------------------------------------------------
// SHARED HOOK — container width (the demo stage is ~1045px inside a 1440px
// window, so only a ResizeObserver on the wrapper can tell stages apart).
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
// BRAND MARK — 28px fern frond: a curled stem with three leaflets; the tip
// leaflet takes the brand accent over --color-text-primary strokes.
// ---------------------------------------------------------------------------

function FernpadMark() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M14 24c0-8 1.5-13 7-18"
        stroke="var(--color-text-primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14.6 18.5c-3.5-.4-5.6-2-6.6-4.8 3.5.2 5.8 1.6 6.9 4.2"
        fill="var(--color-text-primary)"
      />
      <path
        d="M15.8 12.8c-2.8-1.2-4.1-3.1-4.3-5.9 2.9 1 4.5 2.9 4.9 5.5"
        fill="var(--color-text-primary)"
      />
      <path d="M19 8.2c-.9-2.4-.4-4.4 1.5-6.2 1 2.5.6 4.6-1.1 6.4Z" fill={BRAND_ACCENT} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type OverlayPhase = 'opening' | 'open' | 'closing';

interface ComposeState {
  phase: OverlayPhase;
  title: string;
  body: string;
  commit: 'post' | 'discard' | null;
}

interface DialState {
  phase: OverlayPhase;
  opener: 'fab' | 'more';
}

export default function MobileFabMorphComposeTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isDesktopColumn = wrapWidth > 560;

  const [notes, setNotes] = useState<Note[]>(NOTES);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pinnedFirst, setPinnedFirst] = useState(false);
  const [compose, setCompose] = useState<ComposeState | null>(null);
  const [dial, setDial] = useState<DialState | null>(null);
  const [holding, setHolding] = useState(false);
  const [toast, setToast] = useState<{seq: number; text: string} | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const seqRef = useRef(0);
  const holdTimerRef = useRef<number | null>(null);
  const longPressFiredRef = useRef(false);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const moreRef = useRef<HTMLButtonElement | null>(null);
  const firstMiniRef = useRef<HTMLButtonElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const sheetRef = useRef<HTMLElement | null>(null);

  // MANDATORY reduced-motion read — matchMedia once, with change listener.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Clear the long-press timer on unmount.
  useEffect(
    () => () => {
      if (holdTimerRef.current != null) {
        window.clearTimeout(holdTimerRef.current);
      }
    },
    [],
  );

  const postToast = (text: string) => {
    seqRef.current += 1;
    setToast({seq: seqRef.current, text});
  };

  // -------------------------------------------------------------------------
  // COMPOSE SHEET — open (mount closed pose → double-rAF flip to open),
  // close (class removal → timer-finalized commit).
  // -------------------------------------------------------------------------

  const openCompose = () => {
    setCompose(prev => prev ?? {phase: 'opening', title: '', body: '', commit: null});
  };

  const closeCompose = (commit: 'post' | 'discard') => {
    setCompose(prev =>
      prev != null && prev.phase !== 'closing' ? {...prev, phase: 'closing', commit} : prev,
    );
  };

  useEffect(() => {
    if (compose == null || compose.phase !== 'opening') {
      return undefined;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setCompose(prev => (prev != null && prev.phase === 'opening' ? {...prev, phase: 'open'} : prev));
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [compose]);

  const composePhase = compose?.phase ?? null;
  useEffect(() => {
    if (composePhase === 'open') {
      titleInputRef.current?.focus();
    }
  }, [composePhase]);

  // Finalize the close AFTER the reverse morph settles; Post inserts the
  // note at the top with the highlight pulse, Discard toasts only when a
  // draft existed. The FAB (the morph's origin) takes focus back.
  useEffect(() => {
    if (compose == null || compose.phase !== 'closing') {
      return undefined;
    }
    const {commit, title, body} = compose;
    const timer = window.setTimeout(
      () => {
        if (commit === 'post') {
          seqRef.current += 1;
          const id = \`note-user-\${seqRef.current}\`;
          const trimmedTitle = title.trim();
          const trimmedBody = body.trim();
          const note: Note = {
            id,
            kind: 'text',
            title: trimmedTitle === '' ? 'Untitled note' : trimmedTitle,
            snippet: trimmedBody === '' ? 'No text' : trimmedBody,
            body: trimmedBody,
            timeLabel: 'Just now',
            pinned: false,
            extra: null,
            hue: null,
            mono: null,
          };
          setNotes(prev => [note, ...prev]);
          setFreshId(id);
          postToast('Note posted');
        } else if (title.trim() !== '' || body.trim() !== '') {
          postToast('Draft discarded');
        }
        setCompose(null);
        fabRef.current?.focus();
      },
      reducedMotion ? 180 : 380,
    );
    return () => window.clearTimeout(timer);
  }, [compose, reducedMotion]);

  // -------------------------------------------------------------------------
  // SPEED DIAL — long-press (450ms hold ring) OR the 44×44 '⋯' button path;
  // both commit through the SAME openDial state update.
  // -------------------------------------------------------------------------

  const openDial = (opener: 'fab' | 'more') => {
    if (compose != null) {
      return;
    }
    setDial(prev => prev ?? {phase: 'opening', opener});
  };

  const closeDial = () => {
    setDial(prev => (prev != null && prev.phase !== 'closing' ? {...prev, phase: 'closing'} : prev));
  };

  useEffect(() => {
    if (dial == null || dial.phase !== 'opening') {
      return undefined;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setDial(prev => (prev != null && prev.phase === 'opening' ? {...prev, phase: 'open'} : prev));
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [dial]);

  const dialPhase = dial?.phase ?? null;
  useEffect(() => {
    if (dialPhase === 'open') {
      firstMiniRef.current?.focus();
    }
  }, [dialPhase]);

  useEffect(() => {
    if (dial == null || dial.phase !== 'closing') {
      return undefined;
    }
    const opener = dial.opener;
    const timer = window.setTimeout(
      () => {
        setDial(null);
        (opener === 'more' ? moreRef.current : fabRef.current)?.focus();
      },
      reducedMotion ? 140 : 440,
    );
    return () => window.clearTimeout(timer);
  }, [dial, reducedMotion]);

  const quickAdd = (kind: MiniAction['kind']) => {
    const {toastText, ...seed} = QUICK_SEEDS[kind];
    seqRef.current += 1;
    const id = \`quick-\${kind}-\${seqRef.current}\`;
    setNotes(prev => [{...seed, id}, ...prev]);
    setFreshId(id);
    postToast(toastText);
    closeDial();
  };

  // FAB gesture wiring — pointerdown starts the 450ms hold; early release
  // falls through to click (compose); the fired flag suppresses the click
  // that follows a completed long-press. Keyboard activation is a plain
  // click, so Enter/Space always reach compose.
  const onFabPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (compose != null || dial != null) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    longPressFiredRef.current = false;
    setHolding(true);
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current);
    }
    holdTimerRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      setHolding(false);
      openDial('fab');
    }, 450);
  };

  const cancelHold = () => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHolding(false);
  };

  const onFabClick = () => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    if (dial != null) {
      closeDial();
      return;
    }
    openCompose();
  };

  // Escape closes the topmost overlay (dial first, then compose-as-discard).
  const dialInteractive = dial != null && dial.phase !== 'closing';
  const composeInteractive = compose != null && compose.phase !== 'closing';
  useEffect(() => {
    if (!dialInteractive && !composeInteractive) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      if (dialInteractive) {
        setDial(prev => (prev != null && prev.phase !== 'closing' ? {...prev, phase: 'closing'} : prev));
      } else {
        setCompose(prev =>
          prev != null && prev.phase !== 'closing' ? {...prev, phase: 'closing', commit: 'discard'} : prev,
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialInteractive, composeInteractive]);

  // Simple focus trap while the compose dialog is up.
  const trapSheetTab = (event: ReactKeyboardEvent<HTMLElement>) => {
    const container = sheetRef.current;
    if (event.key !== 'Tab' || container == null) {
      return;
    }
    const focusables = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input, textarea',
    );
    if (focusables.length === 0) {
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // -------------------------------------------------------------------------
  // DERIVED
  // -------------------------------------------------------------------------

  const pinnedCount = notes.filter(note => note.pinned).length;
  const displayNotes = pinnedFirst
    ? [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned))
    : notes;

  const overlayOpen = compose != null || dial != null;
  const scrimVisible = composePhase === 'open' || dialPhase === 'open';
  const composeEmpty =
    compose == null || (compose.title.trim() === '' && compose.body.trim() === '');

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  return (
    <div ref={wrapRef} style={{...styles.wrap, ...(isDesktopColumn ? styles.wrapDesktop : null)}}>
      <style>{FMC_CSS}</style>
      <div style={shellStyle} className={reducedMotion ? 'fmc-rm' : undefined}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.brandSeat} aria-hidden>
              <FernpadMark />
            </span>
          </div>
          <h1 style={styles.navTitle}>Notes</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="fmc-btn fmc-focusable"
              style={{...styles.iconBtn, ...(pinnedFirst ? styles.iconBtnActive : null)}}
              aria-pressed={pinnedFirst}
              aria-label="Sort pinned notes first"
              onClick={() => setPinnedFirst(prev => !prev)}>
              <Icon icon={PinIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <p style={styles.summaryRow}>
            {notes.length} notes · {pinnedCount} pinned · Synced Fri, Jul 10
          </p>

          <div style={styles.noteList}>
            {displayNotes.map(note => {
              const expanded = expandedId === note.id;
              const fresh = freshId === note.id;
              const metaParts = [KIND_LABEL[note.kind]];
              if (note.extra != null) {
                metaParts.push(note.extra);
              }
              metaParts.push(note.timeLabel);
              return (
                <article
                  key={note.id}
                  style={styles.noteCard}
                  className={fresh ? 'fmc-note-in' : undefined}>
                  <button
                    type="button"
                    className="fmc-btn fmc-focusable"
                    style={styles.noteBtn}
                    aria-expanded={expanded}
                    onClick={() => setExpandedId(prev => (prev === note.id ? null : note.id))}>
                    {note.kind === 'photo' && note.hue != null ? (
                      <span style={{...styles.noteArt, background: artGradient(note.hue)}} aria-hidden>
                        {note.mono}
                      </span>
                    ) : (
                      <span style={styles.noteSeat} aria-hidden>
                        <Icon icon={KIND_ICON[note.kind]} size="sm" color="inherit" />
                      </span>
                    )}
                    <span style={styles.noteText}>
                      <span style={styles.noteTitleRow}>
                        {note.pinned ? (
                          <span style={styles.pinGlyph} title="Pinned">
                            <Icon icon={PinIcon} size="sm" color="inherit" />
                          </span>
                        ) : null}
                        <span style={styles.noteTitle}>{note.title}</span>
                      </span>
                      {expanded ? (
                        <span style={styles.noteBody}>{note.body}</span>
                      ) : (
                        <span style={styles.noteSnippet} className="fmc-clamp2">
                          {note.snippet}
                        </span>
                      )}
                      <span style={styles.noteMeta}>{metaParts.join(' · ')}</span>
                    </span>
                  </button>
                  {fresh ? (
                    <span
                      style={styles.pulseOverlay}
                      className="fmc-pulse"
                      aria-hidden
                      onAnimationEnd={() => setFreshId(null)}
                    />
                  ) : null}
                </article>
              );
            })}
          </div>
        </main>

        {/* Overlay scrim — absolute INSIDE shell; tap = Escape path. */}
        {overlayOpen ? (
          <div
            style={styles.scrim}
            className={\`fmc-scrim\${scrimVisible ? ' fmc-scrim-open' : ''}\`}
            aria-hidden
            onClick={() => (dial != null ? closeDial() : closeCompose('discard'))}
          />
        ) : null}

        {/* Compose sheet — the FAB's morph target (transform-origin at the
            FAB center; scale + border-radius + opacity only). */}
        {compose != null ? (
          <section
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="New note"
            style={styles.sheet}
            className={\`fmc-sheet\${compose.phase === 'open' ? ' fmc-sheet-open' : ''}\`}
            onKeyDown={trapSheetTab}>
            <div style={styles.sheetHeader}>
              <h2 style={styles.sheetTitle}>New note</h2>
              <button
                type="button"
                className="fmc-btn fmc-focusable"
                style={styles.iconBtn}
                aria-label="Discard note"
                onClick={() => closeCompose('discard')}>
                <Icon icon={XIcon} size="md" color="inherit" />
              </button>
            </div>
            <div style={styles.sheetFields}>
              <TextInput
                ref={titleInputRef}
                label="Title"
                isLabelHidden
                placeholder="Title"
                value={compose.title}
                width="100%"
                onChange={value => setCompose(prev => (prev != null ? {...prev, title: value} : prev))}
              />
              <TextArea
                label="Note"
                isLabelHidden
                placeholder="Start writing…"
                rows={3}
                value={compose.body}
                width="100%"
                onChange={value => setCompose(prev => (prev != null ? {...prev, body: value} : prev))}
              />
            </div>
            <div style={styles.sheetFooter}>
              <button
                type="button"
                className="fmc-btn fmc-focusable"
                style={styles.discardBtn}
                onClick={() => closeCompose('discard')}>
                Discard
              </button>
              <button
                type="button"
                className="fmc-btn fmc-focusable"
                style={{...styles.postBtn, ...(composeEmpty ? styles.postBtnDisabled : null)}}
                disabled={composeEmpty}
                onClick={() => closeCompose('post')}>
                Post
              </button>
            </div>
          </section>
        ) : null}

        {/* Sticky dock — toast live region + FAB cluster. Raised above the
            scrim only while the speed dial is deployed. */}
        <div style={{...styles.dockWrap, ...(dial != null ? {zIndex: 41} : null)}}>
          <div style={styles.toastRegion} aria-live="polite" role="status">
            {toast != null ? (
              <div key={toast.seq} style={styles.toast}>
                <span style={styles.toastText}>{toast.text}</span>
                <button
                  type="button"
                  className="fmc-btn fmc-focusable"
                  style={styles.toastDismiss}
                  aria-label="Dismiss message"
                  onClick={() => setToast(null)}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              </div>
            ) : null}
          </div>

          <div style={styles.fabCluster}>
            {/* Speed-dial minis — rendered while the dial exists; open pose
                clears the inline travel transform, stagger via delay. */}
            {dial != null
              ? MINI_ACTIONS.map((action, index) => {
                  const open = dial.phase === 'open';
                  const delay = reducedMotion
                    ? 0
                    : open
                      ? index * 50
                      : (MINI_ACTIONS.length - 1 - index) * 40;
                  const closedTransform = reducedMotion
                    ? 'none'
                    : \`translate(\${-action.dx}px, \${-action.dy}px) scale(0.2)\`;
                  return (
                    <button
                      key={action.kind}
                      type="button"
                      ref={index === 0 ? firstMiniRef : undefined}
                      className="fmc-btn fmc-focusable fmc-mini"
                      style={{
                        ...styles.mini,
                        right: 6 - action.dx,
                        top: action.dy + 6,
                        transform: open ? 'none' : closedTransform,
                        opacity: open ? 1 : 0,
                        transitionDelay: \`\${delay}ms\`,
                        pointerEvents: open ? 'auto' : 'none',
                      }}
                      onClick={() => quickAdd(action.kind)}>
                      <span style={styles.miniChip}>{action.label}</span>
                      <span style={styles.miniCircle}>
                        <Icon icon={action.icon} size="sm" color="inherit" />
                      </span>
                    </button>
                  );
                })
              : null}

            {/* 44×44 button path to the SAME speed dial. */}
            <button
              type="button"
              ref={moreRef}
              className="fmc-btn fmc-focusable"
              style={styles.moreBtn}
              aria-label="Quick add options"
              aria-haspopup="menu"
              aria-expanded={dialInteractive}
              onClick={() => (dial != null ? closeDial() : openDial('more'))}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </button>

            {/* THE FAB — tap composes, 450ms hold deploys the dial. */}
            <button
              type="button"
              ref={fabRef}
              className="fmc-btn fmc-focusable fmc-fab"
              style={{...styles.fab, ...(compose != null ? styles.fabHidden : null)}}
              aria-label="New note — hold for quick add"
              onPointerDown={onFabPointerDown}
              onPointerUp={cancelHold}
              onPointerLeave={cancelHold}
              onPointerCancel={cancelHold}
              onClick={onFabClick}>
              <Icon icon={PlusIcon} size="md" color="inherit" />
            </button>
            <svg
              style={styles.holdRing}
              className="fmc-ring"
              width={68}
              height={68}
              viewBox="0 0 68 68"
              aria-hidden>
              <circle
                cx={34}
                cy={34}
                r={30}
                fill="none"
                stroke={BRAND_ACCENT}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                transform="rotate(-90 34 34)"
                className={holding ? 'fmc-ring-fill' : 'fmc-ring-rest'}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
`;export{e as default};