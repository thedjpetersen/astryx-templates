var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Podium's pub-trivia night at The
 *   Dog & Duck, frozen mid Round 3 of 6, question 4 of 5. 13 questions
 *   fully scored prior (R1 5 + R2 5 + R3 Q1–3), +2 per correct; eight
 *   teams whose pre-reveal scores sum to 135 = 68 correct × 2 − 1 host
 *   adjustment (Tequila Mockingbird, R1, shown in its meta line). Q4
 *   'Which planet has the most confirmed moons?' (B Saturn correct, 5
 *   teams +2 → sum 145), Q5 'Which country hosted the 2016 Summer
 *   Olympics?' (B Brazil correct, 5 teams +2 → sum 157 after the granted
 *   dispute), two pending disputes + one resolved. No Date.now(), no
 *   Math.random(), no network media.
 * @output Podium — Trivia Host Console: a 390px MOBILE single-task MC
 *   surface. NavBar (R3/6 + five question dots · venue title · gavel with
 *   pending-dispute badge · settings) over a stage-gated RevealStager
 *   question card (Read → Options → Lock → Reveal, illegal actions
 *   disabled never hidden), an 8-team TeamScoreTicker whose 64px rows
 *   FLIP-reflow ranks on reveal with AnswerFlipChips and RankDeltaChips,
 *   a sticky-in-flow toastDock with Undo, and a 64px StageBar (no tabBar)
 *   whose primary button ALWAYS names the next legal action. The
 *   two-detent DisputeQueueSheet retroactively rescores: Grant executes
 *   immediately (+2, live reflow behind the 55% detent, Undo toast — no
 *   confirm dialog), Deny moves the row to Resolved.
 * @position Page template; emitted by \`astryx template mobile-trivia-host-console\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, sheet, menus,
 *   alert, overlay toast) are position:'absolute' INSIDE shell;
 *   position:fixed is banned. While the sheet or alert is open, shell
 *   locks to {height:'100dvh', overflow:'hidden'} and restores on close.
 *   The stage clips to --radius-container; shell paints full-bleed.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); no desktop Layout frames, no
 *   asides, no tables — the leaderboard is transform-positioned 64px rows.
 * Color policy: token-pure chrome. Quarantined Podium brand consts:
 *   BRAND_FILL #F5B301 (fills only), ON_BRAND #241A00 text on the fill
 *   (≈10.6:1 both schemes), BRAND_TEXT light-dark(#7A5A00, #F5C84D) for
 *   text/icon accents (#7A5A00 on #FFF ≈ 6.3:1; #F5C84D on the dark card
 *   ≈ 9.2:1). Per the mobile amendments, every meaningful rest-state
 *   boundary (future dots/pips, stepper track, Deny button, grabber)
 *   uses NEUTRAL_EDGE at ≥3:1 vs its actual surface, and brand fills get
 *   a 1px BRAND_TEXT edge in light scheme (#F5B301 on #FFF is only
 *   ≈1.9:1 — the edge carries the boundary at 6.3:1). Math at each const.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — noted
 *   choice); StageBar 64px sticky bottom z20 (blur color-mix 86% +
 *   blur(12px), borderTop hairline, padding '8px 16px', 48px primary
 *   flex:1 + 8px + 44×44 overflow); RevealStager option rows 44px;
 *   TeamScoreTicker rows 64px (rank 24px + 8 + name stack + trailing
 *   cluster), rowDivider 1px inset 16, none on last; DisputeQueueSheet
 *   rows 72px; sectionHeader 13px/600 uppercase 0.06em at 32px (16 gutter
 *   + 16 card pad), 20px top / 8px bottom. TYPE: 22/700 question · 17/600
 *   nav title + scores · 16/400–500 row primary · 13/400 secondary ·
 *   11/500 overlines + badges; floor 11px; tabular-nums on ALL numerals.
 *   Buttons: 48px primary radius 12 · 36px secondary · 44×44 icon ·
 *   stepper 96×32 visual track (halves carry 44px-tall hits). Touch:
 *   44×44 min everywhere, ≥8px clearance or merged full-row targets.
 * Corner map: shell 0 (stage clips); listCards / toast / menus 12px;
 *   48px buttons 12px; sheet '16px 16px 0 0'; alert 16px; dots, pips,
 *   chips, AnswerFlipChip, TB badge, grabber 999; stepper track 8px.
 *   Focus ring: outline 2px var(--color-brand) offset 2 everywhere
 *   interactive; the dots-status cluster is non-interactive (no ring).
 *
 * Responsive contract:
 * - Fluid 320–430, zero horizontal overflow (overflowX:'clip' backstop
 *   only). navBar center column minmax(0,auto): venue maxWidth 200 at
 *   390, 140 below 360px container width. Ticker row fixed trailing =
 *   chip 28 + 8 + delta 34 + 8 + score 40 → name column ≥138px at 320;
 *   adjust mode trailing = stepper 96 + 8 + score 40 = 144. Meta lines
 *   ellipsize, never wrap. Sheet Grant(64)+8+Deny(56) stays one row to
 *   320. Toast message ellipsizes before Undo (min-width 44) shrinks.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   renders as the standard centered phone column (maxWidth 430,
 *   marginInline auto, borderInline hairline). No adaptive relayout.
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
  CheckIcon,
  CircleStopIcon,
  EyeIcon,
  GavelIcon,
  LockIcon,
  MoreVerticalIcon,
  PencilLineIcon,
  SettingsIcon,
  SkipForwardIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair, with
// the contrast math written down (mobile amendment: interactive boundaries
// and meaningful rest-state fills need ≥3:1 vs their ACTUAL surface).
// ---------------------------------------------------------------------------

// THE quarantined brand fill (Podium gold) — FILLS ONLY, never text.
// #F5B301 vs the white card ≈ 1.9:1 (fails 3:1), so every light-scheme
// brand fill carries a 1px BRAND_TEXT edge (6.3:1) as its boundary; on the
// dark card #F5B301 ≈ 9.2:1 and the edge is redundant but harmless.
const BRAND_FILL = 'light-dark(#F5B301, #F5B301)';
// Text/glyphs ON a BRAND_FILL surface: #241A00 on #F5B301 ≈ 10.6:1 — both
// schemes (the fill is identical in both).
const ON_BRAND = 'light-dark(#241A00, #241A00)';
// Brand-tinted TEXT/ICON accents (active dots ring, Undo, deltas up,
// Adjust, eligibility badge): #7A5A00 on #FFF ≈ 6.3:1 ✓; #F5C84D on the
// dark card (~#1C1C1E) ≈ 9.2:1 ✓. Doubles as the ≥3:1 edge on brand fills.
const BRAND_TEXT = 'light-dark(#7A5A00, #F5C84D)';
// Neutral ≥3:1 boundary for meaningful rest states & quiet interactive
// boundaries (future dots/pips, stepper track, Deny, grabber pill):
// #8C8577 on #FFF ≈ 3.7:1 ✓; #8F897D on the dark card ≈ 4.8:1 ✓.
const NEUTRAL_EDGE = 'light-dark(#8C8577, #8F897D)';
// Success (correct answer) text/border: #1E7B34 on #FFF ≈ 5.3:1 ✓;
// #5FCF83 on the dark card ≈ 8.7:1 ✓ — both clear 4.5:1 text AND the
// 3:1 boundary law for the tinted chip/row edges.
const SUCCESS_TEXT = 'light-dark(#1E7B34, #5FCF83)';
// Success wash behind the correct option row / correct AnswerFlipChip —
// the ≥3:1 state boundary is the SUCCESS_TEXT border, not the wash.
const SUCCESS_WASH = 'light-dark(rgba(30, 123, 52, 0.12), rgba(95, 207, 131, 0.16))';
// Error (wrong answer) text/border: #C92A2A on #FFF ≈ 5.5:1 ✓; #FF8787 on
// the dark card ≈ 7.4:1 ✓.
const ERROR_TEXT = 'light-dark(#C92A2A, #FF8787)';
const ERROR_WASH = 'light-dark(rgba(201, 42, 42, 0.10), rgba(255, 135, 135, 0.14))';
// Hold-to-reveal charge: ON_BRAND at 28% over BRAND_FILL darkens the gold
// to ≈#BF8B01; #241A00 label on that ≈ 5.6:1 ✓ so the label survives the
// sweep. (Spec drew the fill as raw BRAND_FILL inside a neutral button;
// rendered as a wash over the always-brand primary instead so the button
// stays the recognizable primary at every charge pct — noted deviation.)
const HOLD_WASH = 'rgba(36, 26, 0, 0.28)';
// Sheet/alert scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden, and
// the reduced-motion guard. Transitions animate transform/opacity only.
// ---------------------------------------------------------------------------

const PODIUM_CSS = \`
.pdm-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.pdm-btn:disabled { cursor: default; }
.pdm-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.pdm-move { transition: transform 300ms ease; }
.pdm-fade { transition: opacity 240ms ease; }
.pdm-flip { transition: transform 300ms ease; }
@keyframes pdm-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.pdm-sheet-in { animation: pdm-sheet-in 240ms ease; }
.pdm-vh {
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
  .pdm-move, .pdm-fade, .pdm-flip { transition: none; }
  .pdm-sheet-in { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — plain CSSProperties records (house idiom).
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
  // NAV BAR — 52px sticky top z20; hairline ALWAYS ON (noted choice).
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    display: 'grid',
    gridTemplateColumns: '1fr minmax(0, auto) 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  // roundProgress cluster — 44px-tall padded STATUS element (not a button;
  // no focus ring by design).
  roundStatus: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 8,
    whiteSpace: 'nowrap',
  },
  roundLabel: {fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  dotRow: {display: 'flex', alignItems: 'center', gap: 4},
  // 6px dots. done = BRAND_FILL + 1px BRAND_TEXT edge (light-scheme
  // boundary math at the const), current = 2px BRAND_TEXT ring, future =
  // 1px NEUTRAL_EDGE (amendment: future beads ≥3:1, --color-border fails).
  dotDone: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: BRAND_FILL,
    boxShadow: \`inset 0 0 0 1px \${BRAND_TEXT}\`,
  },
  dotCurrent: {
    width: 6,
    height: 6,
    borderRadius: 999,
    boxShadow: \`inset 0 0 0 2px \${BRAND_TEXT}\`,
  },
  dotFuture: {
    width: 6,
    height: 6,
    borderRadius: 999,
    boxShadow: \`inset 0 0 0 1px \${NEUTRAL_EDGE}\`,
  },
  // h1 = venue name; maxWidth 200 at 390, 140 below 360 (set inline).
  venueTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  iconBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // 16px badge pill on the gavel — BRAND_FILL bg + BRAND_TEXT edge,
  // ON_BRAND 10px/600 text (10.6:1 on the fill).
  badgePill: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: BRAND_FILL,
    boxShadow: \`inset 0 0 0 1px \${BRAND_TEXT}\`,
    color: ON_BRAND,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // sectionHeader — 13/600 uppercase 0.06em at 32px, 20 top / 8 bottom;
  // the leaderboard variant is a flex row with the trailing Adjust button.
  sectionHeaderRow: {
    margin: '20px 0 8px',
    paddingInlineStart: 32,
    paddingInlineEnd: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionHeaderText: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Adjust — 13/600 BRAND_TEXT text button inside a 44px hit.
  adjustBtn: {
    height: 44,
    paddingInline: 8,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  adjustBtnDisabled: {color: 'var(--color-text-secondary)', opacity: 0.5},
  // REVEAL STAGER card.
  stagerCard: {
    marginTop: 16,
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  overlineRow: {display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8},
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  categoryChip: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    border: \`1px solid \${NEUTRAL_EDGE}\`,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  questionText: {margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.25},
  // stageRail — ol of 4 steps: 8px pips + 2px connector lines + 11px
  // labels; done = BRAND_FILL (+edge), current = aria-current='step' ring,
  // future = NEUTRAL_EDGE border (amendment).
  stageRail: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    alignItems: 'flex-start',
  },
  stageStep: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  stagePipRow: {display: 'flex', alignItems: 'center', width: '100%', height: 8},
  stagePipLine: {flex: 1, height: 2},
  stagePipDone: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: BRAND_FILL,
    boxShadow: \`inset 0 0 0 1px \${BRAND_TEXT}\`,
    flexShrink: 0,
  },
  stagePipCurrent: {
    width: 8,
    height: 8,
    borderRadius: 999,
    boxShadow: \`inset 0 0 0 2px \${BRAND_TEXT}\`,
    flexShrink: 0,
  },
  stagePipFuture: {
    width: 8,
    height: 8,
    borderRadius: 999,
    boxShadow: \`inset 0 0 0 1px \${NEUTRAL_EDGE}\`,
    flexShrink: 0,
  },
  stageLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  stageLabelCurrent: {color: BRAND_TEXT, fontWeight: 600},
  // Option rows — 44px, A–D letter in a 28px muted circle.
  optionRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    paddingInline: 4,
  },
  optionRowCorrect: {
    background: SUCCESS_WASH,
    boxShadow: \`inset 0 0 0 1.5px \${SUCCESS_TEXT}\`,
  },
  optionLetter: {
    width: 28,
    height: 28,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 600,
  },
  optionLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  optionTrailing: {display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0},
  optionsHiddenNote: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
  },
  lockedChip: {
    alignSelf: 'flex-start',
    height: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    border: \`1px solid \${NEUTRAL_EDGE}\`,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  // TEAM SCORE TICKER — rows are transform-positioned for the 300ms FLIP
  // rank exchange (transform-only; instant under reduced motion). 8 rows ×
  // 64px = 512px container.
  tickerList: {position: 'relative', height: 8 * 64, margin: 0, padding: 0, listStyle: 'none'},
  teamRow: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  teamRowDivider: {
    position: 'absolute',
    left: 16,
    right: 0,
    bottom: 0,
    height: 1,
    background: 'var(--color-border)',
  },
  rankCol: {
    width: 24,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  nameStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  nameLine: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  teamName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  // TB badge — 11px/500 pill on tied teams; rides the name line so the
  // fixed trailing-cluster width math holds at 320 (noted deviation).
  tbBadge: {
    height: 16,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 5,
    borderRadius: 999,
    border: \`1px solid \${NEUTRAL_EDGE}\`,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  teamMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  trailCluster: {display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0},
  // AnswerFlipChip — 28px pill; two rotateY faces (300ms; instant under
  // reduced motion). aria-hidden — the row's accessible name carries it.
  flipChipScene: {display: 'block', width: 28, height: 28, flexShrink: 0, perspective: 200},
  flipChipInner: {
    display: 'block',
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
  },
  flipFace: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    fontSize: 13,
    fontWeight: 600,
  },
  // Face-down: muted fill; the state is carried by the '•' glyph in
  // --color-text-secondary (≥4.5:1 both schemes), not the fill.
  flipFaceDown: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  flipFaceCorrect: {
    background: SUCCESS_WASH,
    boxShadow: \`inset 0 0 0 1.5px \${SUCCESS_TEXT}\`,
    color: SUCCESS_TEXT,
    transform: 'rotateY(180deg)',
  },
  flipFaceWrong: {
    background: ERROR_WASH,
    boxShadow: \`inset 0 0 0 1.5px \${ERROR_TEXT}\`,
    color: ERROR_TEXT,
    transform: 'rotateY(180deg)',
  },
  // RankDeltaChip — '↑2' BRAND_TEXT / '↓1' text-secondary, 34px fixed.
  deltaChip: {
    width: 34,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  scoreStack: {
    width: 40,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 0,
  },
  scoreText: {fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2},
  // '+2' scored chip — stacked under the score to hold the 320px trailing
  // width budget (noted deviation from the flat cluster listing).
  plusChip: {
    fontSize: 11,
    fontWeight: 600,
    color: BRAND_TEXT,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.2,
  },
  // Stepper — 96×32 visual track (two 48-wide halves whose BUTTONS are
  // 44px tall; the 32px track is an inner visual so the hit obeys the
  // 44px law without pseudo-elements). Track border NEUTRAL_EDGE ≥3:1
  // (amendment: interactive boundary vs the card, muted fill fails).
  stepperWrap: {display: 'flex', alignItems: 'center', flexShrink: 0},
  stepHalf: {
    width: 48,
    height: 44,
    display: 'grid',
    placeItems: 'center',
  },
  stepHalfFace: {
    width: 48,
    height: 32,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    boxShadow: \`inset 0 0 0 1px \${NEUTRAL_EDGE}\`,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  stepHalfFaceMinus: {borderRadius: '8px 0 0 8px'},
  stepHalfFacePlus: {borderRadius: '0 8px 8px 0'},
  stepHalfDisabled: {opacity: 0.35},
  spinValue: {
    width: 40,
    textAlign: 'right',
    fontSize: 17,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 6,
  },
  // Disputes secondary button + resolved caption below the leaderboard.
  disputesBtnRow: {marginTop: 12, marginInline: 16, display: 'flex'},
  disputesBtn: {
    height: 36,
    paddingInline: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    border: \`1px solid \${NEUTRAL_EDGE}\`,
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  resolvedCaption: {
    marginTop: 12,
    marginInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bottomSpacer: {height: 24},
  // TOAST DOCK — STICKY IN FLOW above the 64px StageBar (amendment: the
  // shell grows with content, shell-absolute pins to the DOCUMENT bottom).
  // While the sheet scroll-lock is active it switches to absolute
  // insetInline 16 / bottom 76 / z42 (above sheet z41) — shell-absolute is
  // legal only while the shell is locked at 100dvh.
  toastDock: {
    position: 'sticky',
    bottom: 64,
    zIndex: 30,
    marginInline: 16,
    marginBlock: 8,
    display: 'flex',
    justifyContent: 'center',
  },
  toastDockOverlay: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 42,
    marginInline: 0,
    marginBlock: 0,
  },
  toast: {
    minHeight: 48,
    maxWidth: '100%',
    flex: 1,
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  // Undo — 13/600 BRAND_TEXT, full 48px-tall hit, min-width 44 protected.
  undoBtn: {
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  // STAGE BAR — 64px sticky bottom z20 replacing the tabBar.
  stageBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  // 48px primary — brand fill + ON_BRAND label + BRAND_TEXT edge (the
  // light-scheme 3:1 boundary; see BRAND_FILL math).
  primaryBtn: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    height: 48,
    borderRadius: 12,
    background: BRAND_FILL,
    boxShadow: \`inset 0 0 0 1px \${BRAND_TEXT}\`,
    color: ON_BRAND,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
  },
  primaryLabel: {
    position: 'relative',
    paddingInline: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    fontVariantNumeric: 'tabular-nums',
  },
  holdFill: {
    position: 'absolute',
    inset: 0,
    background: HOLD_WASH,
    transformOrigin: 'left center',
    pointerEvents: 'none',
  },
  overflowBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Anchored menus — absolute cards, 12px radius, 44px rows.
  anchoredMenu: {
    position: 'absolute',
    zIndex: 30,
    minWidth: 220,
    maxWidth: 'calc(100% - 32px)',
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
    paddingInline: 14,
    fontSize: 16,
  },
  menuRowDisabled: {color: 'var(--color-text-secondary)', opacity: 0.5},
  menuRowDanger: {color: 'var(--color-error)'},
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // SHEET — scrim z40 + sheet z41, two detents 55% / calc(100% − 56px).
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
  // Grabber pill in NEUTRAL_EDGE — it is a real 'Resize sheet' button, so
  // its rest boundary needs ≥3:1 (amendment; --color-border fails).
  grabberPill: {width: 36, height: 5, borderRadius: 999, background: NEUTRAL_EDGE},
  sheetHeader: {
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 8,
  },
  sheetTitle: {margin: 0, fontSize: 17, fontWeight: 600, textAlign: 'center'},
  // The one legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 16},
  // Eligibility banner — muted until stage 'revealed' (stage-gating law).
  eligBanner: {
    margin: '0 16px 4px',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  eligBadge: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    border: \`1px solid \${BRAND_TEXT}\`,
    color: BRAND_TEXT,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    flexShrink: 0,
  },
  sheetSectionHeader: {
    margin: '16px 16px 8px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Dispute rows — 72px min (quote may clamp to 2 lines).
  disputeRow: {
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
  },
  disputeText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  disputeTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  disputeQuote: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  disputeActions: {display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0},
  // Grant/Deny/Disputes are 36px VISUAL faces inside 44px-tall button
  // hits (the 44px law without pseudo-elements). Grant = BRAND_FILL +
  // ON_BRAND + BRAND_TEXT edge; Deny/Disputes = NEUTRAL_EDGE boundary.
  actionHit: {height: 44, display: 'grid', placeItems: 'center'},
  grantBtn: {
    minWidth: 64,
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    background: BRAND_FILL,
    boxShadow: \`inset 0 0 0 1px \${BRAND_TEXT}\`,
    color: ON_BRAND,
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  denyBtn: {
    minWidth: 56,
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: \`1px solid \${NEUTRAL_EDGE}\`,
    background: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  resolvedBadgeGranted: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    border: \`1px solid \${SUCCESS_TEXT}\`,
    color: SUCCESS_TEXT,
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  resolvedBadgeDenied: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    border: \`1px solid \${NEUTRAL_EDGE}\`,
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
  },
  emptyQueueNote: {
    margin: '4px 16px',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
  },
  // ALERT (End game) — the one blocking irreversible choice. z60/61.
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
  alertTitle: {margin: 0, fontSize: 17, fontWeight: 600},
  alertText: {margin: 0, fontSize: 13, color: 'var(--color-text-secondary)'},
  alertBtnRow: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtnCancel: {
    flex: 1,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 400,
    color: 'var(--color-text-primary)',
  },
  alertBtnCommit: {
    flex: 1,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-error)',
    borderInlineStart: '1px solid var(--color-border)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checked aggregates.
// LEDGER (verified by hand): 13 questions scored prior (R1 5 + R2 5 + R3
// Q1–3), +2 per correct. correct counts 11+11+10+9+8+8+7+4 = 68 → 68×2 −
// 1 (t6 host adj) = 135 pre-reveal sum ✓ (per team: score = correct×2 +
// adj). Q4 reveal: 5 correct (t1,t3,t4,t7,t8) +10 → 145 ✓. Grant d1: t6
// +2 → 147 ✓ (t6 17 leapfrogs t7 16 AND t5 16: rank 7→5). Q5 reveal: 5
// correct (t2,t3,t5,t6,t8) +10 → 157 ✓ with d1 granted; triple tie at 24
// (t1/t3/t2) ordered by tbMs 3400 < 4200 < 5100. No Date.now(), no
// Math.random().
// ---------------------------------------------------------------------------

const ROUND_NO = 3;
const ROUND_COUNT = 6;
const QUESTIONS_PER_ROUND = 5;
const POINTS_PER_CORRECT = 2;

// Venue pair — 'Edit venue' swaps them; the long name is stress fixture
// 11 (exercises the 200px / 140px navBar title clamp).
const VENUES = ['The Dog & Duck', 'The Dog & Duck at Whitmore Cross Junction'] as const;

type Letter = 'A' | 'B' | 'C' | 'D';
type Stage = 'read' | 'options' | 'locked' | 'revealed';

const STAGE_ORDER: Stage[] = ['read', 'options', 'locked', 'revealed'];
const STAGE_LABELS: Record<Stage, string> = {
  read: 'Read',
  options: 'Options',
  locked: 'Lock',
  revealed: 'Reveal',
};

interface QuestionFixture {
  id: string;
  num: number; // 1-based within the round (4, 5)
  category: string;
  text: string;
  options: {letter: Letter; label: string}[];
  correct: Letter;
}

// questionIndex is 0-based within the round; this console covers Q4 (3)
// and Q5 (4) — Q1–3 are already in the books.
const QUESTIONS: Record<3 | 4, QuestionFixture> = {
  3: {
    id: 'q4',
    num: 4,
    category: 'SCIENCE',
    text: 'Which planet has the most confirmed moons?',
    options: [
      {letter: 'A', label: 'Jupiter'},
      {letter: 'B', label: 'Saturn'},
      {letter: 'C', label: 'Uranus'},
      {letter: 'D', label: 'Neptune'},
    ],
    correct: 'B',
  },
  4: {
    id: 'q5',
    num: 5,
    category: 'SPORT',
    text: 'Which country hosted the 2016 Summer Olympics?',
    options: [
      {letter: 'A', label: 'China'},
      {letter: 'B', label: 'Brazil'},
      {letter: 'C', label: 'United Kingdom'},
      {letter: 'D', label: 'Australia'},
    ],
    correct: 'B',
  },
};

type TeamId = 't1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 't8';

interface TeamFixture {
  id: TeamId;
  name: string;
  correct: number; // questions correct across the 13 scored
  adj: number; // host adjustment (t6: −1, fixed in R1, shown in meta)
  preScore: number; // = correct × 2 + adj (cross-checked per team)
  tbMs: number; // tie-breaker lock-in, ms — lower wins
  tbLabel: string; // dual field for tbMs
  answers: {q4: Letter; q5: Letter};
}

// t4 'The Spanish Inquizition' (23ch) is the 320px ellipsis stress
// (stress fixture 1 — longest name + TB badge + delta chip at once).
const TEAMS: TeamFixture[] = [
  {id: 't1', name: 'Quizteama Aguilera', correct: 11, adj: 0, preScore: 22, tbMs: 3400, tbLabel: 'TB 3.4s', answers: {q4: 'B', q5: 'A'}},
  {id: 't2', name: 'Les Quizerables', correct: 11, adj: 0, preScore: 22, tbMs: 5100, tbLabel: 'TB 5.1s', answers: {q4: 'A', q5: 'B'}},
  {id: 't3', name: 'Sherlock Homies', correct: 10, adj: 0, preScore: 20, tbMs: 4200, tbLabel: 'TB 4.2s', answers: {q4: 'B', q5: 'B'}},
  {id: 't4', name: 'The Spanish Inquizition', correct: 9, adj: 0, preScore: 18, tbMs: 4800, tbLabel: 'TB 4.8s', answers: {q4: 'B', q5: 'A'}},
  {id: 't5', name: 'Agatha Quiztie', correct: 8, adj: 0, preScore: 16, tbMs: 6400, tbLabel: 'TB 6.4s', answers: {q4: 'C', q5: 'B'}},
  {id: 't6', name: 'Tequila Mockingbird', correct: 8, adj: -1, preScore: 15, tbMs: 5600, tbLabel: 'TB 5.6s', answers: {q4: 'D', q5: 'B'}},
  {id: 't7', name: 'Norfolk & Chance', correct: 7, adj: 0, preScore: 14, tbMs: 3800, tbLabel: 'TB 3.8s', answers: {q4: 'B', q5: 'C'}},
  {id: 't8', name: 'Beer Pressure', correct: 4, adj: 0, preScore: 8, tbMs: 2900, tbLabel: 'TB 2.9s', answers: {q4: 'B', q5: 'B'}},
];

const TEAM_BY_ID: Record<TeamId, TeamFixture> = Object.fromEntries(
  TEAMS.map(team => [team.id, team]),
) as Record<TeamId, TeamFixture>;

type DisputeStatus = 'pending' | 'granted' | 'denied';

interface DisputeFixture {
  id: string;
  teamId: TeamId;
  ref: string; // 'R3·Q2'
  quote: string;
  deltaPts: number; // points awarded on grant
}

// d2's quote is the 2-line-clamp stress (fixture 8) — the spec's short
// quote is extended so the clamp is actually exercised (noted deviation).
// d3 is pre-resolved: its +2 is ALREADY inside t1's 11 correct / 22 pts.
const DISPUTES: DisputeFixture[] = [
  {
    id: 'd1',
    teamId: 't6',
    ref: 'R3·Q2',
    quote: 'Table 3 got “Holland” accepted for Netherlands — we wrote the same',
    deltaPts: 2,
  },
  {
    id: 'd2',
    teamId: 't8',
    ref: 'R2·Q1',
    quote:
      'The judge said “close enough” at Table 9 for the exact same answer last week — we want the same ruling applied to our sheet tonight',
    deltaPts: 2,
  },
  {
    id: 'd3',
    teamId: 't1',
    ref: 'R2·Q4',
    quote: 'Metric ton vs imperial ton — the card did not specify',
    deltaPts: 2,
  },
  // d4/d5 ship pre-resolved (their outcomes are already baked into the
  // correct counts, like d3) so the sheet's Resolved list reaches the
  // 3-resolved + 2-pending scroll stress at the LARGE detent (stress
  // fixture 9 — noted deviation: spec's fixture plan listed 3 disputes).
  {
    id: 'd4',
    teamId: 't3',
    ref: 'R1·Q3',
    quote: 'We could not hear the question over the kitchen',
    deltaPts: 2,
  },
  {
    id: 'd5',
    teamId: 't2',
    ref: 'R2·Q2',
    quote: '“Eponymous” was ambiguous — both readings fit',
    deltaPts: 2,
  },
];

const DISPUTE_BY_ID: Record<string, DisputeFixture> = Object.fromEntries(
  DISPUTES.map(dispute => [dispute.id, dispute]),
);

// ---------------------------------------------------------------------------
// ONE STATE OWNER — gameStore: a single useState in the root component;
// updateTeam / updateDispute helpers are the only team/dispute writers.
// Undo snapshots capture the exact scoring state (teams, dispute queue,
// rank baseline, stage/question) and restore it in one assignment.
// ---------------------------------------------------------------------------

interface TeamState {
  score: number;
  correct: number;
}

interface DisputeState {
  id: string;
  status: DisputeStatus;
}

interface ScoreSnapshot {
  stage: Stage;
  questionIndex: 3 | 4;
  roundComplete: boolean;
  teams: Record<TeamId, TeamState>;
  disputes: DisputeState[];
  rankBaseline: Record<TeamId, number> | null;
}

interface GameState extends ScoreSnapshot {
  gameEnded: boolean;
  venueIdx: 0 | 1;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  adjustMode: boolean;
  menu: null | 'overflow' | 'settings';
  alertOpen: boolean;
  holdPct: number; // 0..1 hold-to-reveal charge
  toast: {seq: number; text: string; undo: ScoreSnapshot | null} | null;
}

const INITIAL_STATE: GameState = {
  stage: 'read',
  questionIndex: 3,
  roundComplete: false,
  teams: Object.fromEntries(
    TEAMS.map(team => [team.id, {score: team.preScore, correct: team.correct}]),
  ) as Record<TeamId, TeamState>,
  // d3/d4/d5 ship resolved — their outcomes are already baked into the
  // fixtures. Resolved entries live at the array tail: the LAST entry is
  // the 'latest resolution' caption under the leaderboard (d3 initially,
  // per spec); granting/denying moves a dispute to the tail, and Undo
  // restores the exact queue position via the snapshot.
  disputes: [
    {id: 'd1', status: 'pending'},
    {id: 'd2', status: 'pending'},
    {id: 'd5', status: 'granted'},
    {id: 'd4', status: 'denied'},
    {id: 'd3', status: 'granted'},
  ],
  rankBaseline: null,
  gameEnded: false,
  venueIdx: 0,
  sheetOpen: false,
  sheetDetent: 'medium',
  adjustMode: false,
  menu: null,
  alertOpen: false,
  holdPct: 0,
  toast: null,
};

/** Ranks 1–8: score desc, then tbMs asc (lower lock-in wins the tie). */
function computeRanks(teams: Record<TeamId, TeamState>): Record<TeamId, number> {
  const ordered = [...TEAMS].sort((a, b) => {
    const diff = teams[b.id].score - teams[a.id].score;
    return diff !== 0 ? diff : a.tbMs - b.tbMs;
  });
  const ranks = {} as Record<TeamId, number>;
  ordered.forEach((team, index) => {
    ranks[team.id] = index + 1;
  });
  return ranks;
}

function snapshotOf(state: GameState): ScoreSnapshot {
  return {
    stage: state.stage,
    questionIndex: state.questionIndex,
    roundComplete: state.roundComplete,
    teams: state.teams,
    disputes: state.disputes,
    rankBaseline: state.rankBaseline,
  };
}

/**
 * Container-width hook (grid-feeder-console pattern): the demo's desktop
 * stage is ~1045px inside a 1440px window, so only a ResizeObserver on
 * the wrapper can tell the 390px mobile stage from the desktop stage.
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

/** Arrow-key row roving for anchored menus. */
function menuArrowNav(event: ReactKeyboardEvent<HTMLDivElement>): void {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  event.preventDefault();
  const items = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])'),
  );
  if (items.length === 0) return;
  const index = items.indexOf(document.activeElement as HTMLElement);
  const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
  items[(next + items.length) % items.length]?.focus();
}

// ---------------------------------------------------------------------------
// ROUND PROGRESS — 'R3/6' + 5 question dots in one 44px status element.
// Non-interactive by design (no focus ring); aria-label carries the state.
// ---------------------------------------------------------------------------

interface RoundDotsProps {
  questionIndex: 3 | 4;
  stage: Stage;
  roundComplete: boolean;
}

function RoundDots({questionIndex, stage, roundComplete}: RoundDotsProps) {
  // Q1–3 are done by fixture; Q4/Q5 fill when revealed (or round over).
  const doneOf = (dotIndex: number): boolean => {
    if (dotIndex < 3) return true;
    if (roundComplete) return dotIndex <= questionIndex && (stage === 'revealed' || dotIndex < questionIndex);
    if (dotIndex < questionIndex) return true;
    return dotIndex === questionIndex && stage === 'revealed';
  };
  const label = \`Round \${ROUND_NO} of \${ROUND_COUNT}, question \${questionIndex + 1} of \${QUESTIONS_PER_ROUND}\`;
  return (
    <div style={styles.roundStatus} role="status" aria-label={label}>
      <span style={styles.roundLabel} aria-hidden>
        R{ROUND_NO}/{ROUND_COUNT}
      </span>
      <span style={styles.dotRow} aria-hidden>
        {[0, 1, 2, 3, 4].map(dotIndex => (
          <span
            key={dotIndex}
            style={
              doneOf(dotIndex)
                ? styles.dotDone
                : dotIndex === questionIndex
                  ? styles.dotCurrent
                  : styles.dotFuture
            }
          />
        ))}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STAGE RAIL — ol of the 4 legal stages; current carries
// aria-current='step'; connector line segments fill as stages complete.
// ---------------------------------------------------------------------------

function StageRail({stage}: {stage: Stage}) {
  const currentIndex = STAGE_ORDER.indexOf(stage);
  return (
    <ol style={styles.stageRail} aria-label="Question stages">
      {STAGE_ORDER.map((step, index) => {
        const done = index < currentIndex || stage === 'revealed';
        const isCurrent = index === currentIndex;
        const lineDoneBefore = index <= currentIndex;
        const lineDoneAfter = index < currentIndex || stage === 'revealed';
        return (
          <li key={step} style={styles.stageStep} aria-current={isCurrent ? 'step' : undefined}>
            {/* Done connectors use BRAND_TEXT (6.3:1 light) — BRAND_FILL
                alone is 1.9:1 on the white card (math at the consts). */}
            <span style={styles.stagePipRow}>
              <span
                style={{
                  ...styles.stagePipLine,
                  background: index === 0 ? 'transparent' : lineDoneBefore ? BRAND_TEXT : 'var(--color-border)',
                }}
              />
              <span
                style={
                  done ? styles.stagePipDone : isCurrent ? styles.stagePipCurrent : styles.stagePipFuture
                }
              />
              <span
                style={{
                  ...styles.stagePipLine,
                  background:
                    index === STAGE_ORDER.length - 1
                      ? 'transparent'
                      : lineDoneAfter
                        ? BRAND_TEXT
                        : 'var(--color-border)',
                }}
              />
            </span>
            <span style={{...styles.stageLabel, ...(isCurrent ? styles.stageLabelCurrent : null)}}>
              {STAGE_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// ANSWER FLIP CHIP — 28px pill, face-down '•' pre-reveal, rotateY 300ms
// flip to the letter on reveal (two backface-hidden faces; instant face
// swap under reduced motion). aria-hidden — the row name carries it.
// ---------------------------------------------------------------------------

interface FlipChipProps {
  letter: Letter;
  isCorrect: boolean;
  revealed: boolean;
  reducedMotion: boolean;
}

function AnswerFlipChip({letter, isCorrect, revealed, reducedMotion}: FlipChipProps) {
  return (
    <span style={styles.flipChipScene} aria-hidden>
      <span
        className={reducedMotion ? undefined : 'pdm-flip'}
        style={{
          ...styles.flipChipInner,
          transform: revealed ? 'rotateY(180deg)' : 'none',
        }}>
        <span style={{...styles.flipFace, ...styles.flipFaceDown}}>•</span>
        <span style={{...styles.flipFace, ...(isCorrect ? styles.flipFaceCorrect : styles.flipFaceWrong)}}>
          {letter}
        </span>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// TEAM SCORE TICKER ROW — 64px, transform-positioned by rank for the FLIP
// reflow. In adjust mode the trailing chip cluster swaps for the 96×32
// stepper + spinbutton score.
// ---------------------------------------------------------------------------

interface TeamRowProps {
  team: TeamFixture;
  state: TeamState;
  rank: number;
  delta: number; // baselineRank − rank; >0 climbed, <0 fell, 0 none
  answer: Letter;
  isCorrect: boolean;
  revealed: boolean;
  scoredNow: boolean; // +2 on the current reveal
  tied: boolean;
  adjustMode: boolean;
  reducedMotion: boolean;
  onStep: (id: TeamId, dir: 1 | -1) => void;
}

function TeamRow({
  team,
  state,
  rank,
  delta,
  answer,
  isCorrect,
  revealed,
  scoredNow,
  tied,
  adjustMode,
  reducedMotion,
  onStep,
}: TeamRowProps) {
  const meta =
    team.adj !== 0
      ? \`\${state.correct} correct · \${team.adj} host adj · \${team.tbLabel}\`
      : \`\${state.correct} correct · \${team.tbLabel}\`;
  const ariaName = \`\${team.name}, \${state.score} points\${
    revealed ? \`, answered \${answer}, \${isCorrect ? 'correct' : 'wrong'}\` : ''
  }, rank \${rank}\`;
  const atMin = state.score <= 0;
  const atMax = state.score >= 99;
  return (
    <li
      className={reducedMotion ? undefined : 'pdm-move'}
      style={{...styles.teamRow, transform: \`translateY(\${(rank - 1) * 64}px)\`}}
      aria-label={ariaName}>
      <span style={styles.rankCol} aria-hidden>
        {rank}
      </span>
      <span style={styles.nameStack} aria-hidden>
        <span style={styles.nameLine}>
          <span style={styles.teamName}>{team.name}</span>
          {tied ? <span style={styles.tbBadge}>TB</span> : null}
        </span>
        <span style={styles.teamMeta}>{meta}</span>
      </span>
      {adjustMode ? (
        <span style={styles.stepperWrap}>
          <button
            type="button"
            className="pdm-btn pdm-focusable"
            style={styles.stepHalf}
            aria-label={\`Decrease \${team.name} score\`}
            disabled={atMin}
            onClick={() => onStep(team.id, -1)}>
            <span
              style={{
                ...styles.stepHalfFace,
                ...styles.stepHalfFaceMinus,
                ...(atMin ? styles.stepHalfDisabled : null),
              }}
              aria-hidden>
              −
            </span>
          </button>
          <button
            type="button"
            className="pdm-btn pdm-focusable"
            style={styles.stepHalf}
            aria-label={\`Increase \${team.name} score\`}
            disabled={atMax}
            onClick={() => onStep(team.id, 1)}>
            <span
              style={{
                ...styles.stepHalfFace,
                ...styles.stepHalfFacePlus,
                ...(atMax ? styles.stepHalfDisabled : null),
              }}
              aria-hidden>
              +
            </span>
          </button>
        </span>
      ) : (
        <span style={styles.trailCluster} aria-hidden>
          <AnswerFlipChip letter={answer} isCorrect={isCorrect} revealed={revealed} reducedMotion={reducedMotion} />
          <span
            style={{
              ...styles.deltaChip,
              color: delta > 0 ? BRAND_TEXT : 'var(--color-text-secondary)',
            }}>
            {delta > 0 ? \`↑\${delta}\` : delta < 0 ? \`↓\${-delta}\` : ''}
          </span>
        </span>
      )}
      {adjustMode ? (
        <span
          role="spinbutton"
          tabIndex={0}
          className="pdm-focusable"
          style={styles.spinValue}
          aria-label={\`\${team.name} score\`}
          aria-valuenow={state.score}
          aria-valuemin={0}
          aria-valuemax={99}
          onKeyDown={event => {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              if (!atMax) onStep(team.id, 1);
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              if (!atMin) onStep(team.id, -1);
            }
          }}>
          {state.score}
        </span>
      ) : (
        <span style={styles.scoreStack} aria-hidden>
          <span style={styles.scoreText}>{state.score}</span>
          {scoredNow ? <span style={styles.plusChip}>+{POINTS_PER_CORRECT}</span> : null}
        </span>
      )}
      {rank < TEAMS.length ? <span style={styles.teamRowDivider} aria-hidden /> : null}
    </li>
  );
}

// ---------------------------------------------------------------------------
// HOLD TO REVEAL — StageBar primary at stage 'locked'. pointerdown charges
// an inner scaleX wash over 800ms; early release cancels and resets
// (stress fixture 7). Completion fires reveal ONCE. Non-gesture path:
// 'Reveal now' in the overflow menu (aria-describedby names it). Reduced
// motion: the wash steps in 4 opacity increments, no scaleX tween.
// ---------------------------------------------------------------------------

const HOLD_MS = 800;
const HOLD_TICK_MS = 40;

interface HoldToRevealProps {
  pct: number;
  onPct: (pct: number) => void;
  onComplete: () => void;
  onTapHint: () => void;
  reducedMotion: boolean;
  hintId: string;
}

function HoldToRevealButton({pct, onPct, onComplete, onTapHint, reducedMotion, hintId}: HoldToRevealProps) {
  const timerRef = useRef<number | null>(null);
  const pctRef = useRef(0);
  const firedRef = useRef(false);

  const stop = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  useEffect(() => stop, [stop]);

  const start = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    firedRef.current = false;
    pctRef.current = 0;
    onPct(0);
    stop();
    timerRef.current = window.setInterval(() => {
      pctRef.current = Math.min(1, pctRef.current + HOLD_TICK_MS / HOLD_MS);
      onPct(pctRef.current);
      if (pctRef.current >= 1 && !firedRef.current) {
        firedRef.current = true;
        stop();
        onComplete();
      }
    }, HOLD_TICK_MS);
  };
  const cancel = () => {
    stop();
    if (!firedRef.current) {
      // Early release at any pct resets cleanly — no partial reveal
      // (stress fixture 7).
      pctRef.current = 0;
      onPct(0);
    }
  };

  const quantized = Math.ceil(pct * 4) / 4; // reduced-motion 4-step fill
  return (
    <button
      type="button"
      className="pdm-btn pdm-focusable"
      style={styles.primaryBtn}
      aria-describedby={hintId}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onClick={() => {
        // A plain tap (or Enter/Space) never reveals — the keyboard
        // contract is the overflow menu's 'Reveal now' row.
        if (!firedRef.current && pctRef.current === 0) onTapHint();
      }}>
      <span
        style={{
          ...styles.holdFill,
          ...(reducedMotion
            ? {opacity: quantized, transform: 'none'}
            : {transform: \`scaleX(\${pct})\`}),
        }}
        aria-hidden
      />
      <span style={styles.primaryLabel}>Hold to reveal</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// DISPUTE QUEUE SHEET — two detents (55% / calc(100% − 56px)); grabber is
// a real 'Resize sheet' button (click toggles; drag garnish, >120px down
// past medium closes); the sheet body is the one legal inner scroller.
// ---------------------------------------------------------------------------

interface SheetShellProps {
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function SheetShell({detent, onDetentChange, onClose, sheetRef, reducedMotion, children}: SheetShellProps) {
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
    if (!movedRef.current) return;
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
      aria-labelledby="pdm-sheet-title"
      tabIndex={-1}
      className="pdm-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="pdm-btn pdm-focusable"
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
        <h2 id="pdm-sheet-title" style={styles.sheetTitle}>
          Disputes
        </h2>
        <button
          type="button"
          className="pdm-btn pdm-focusable"
          style={styles.iconBtn}
          aria-label="Close disputes"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — gameStore is THE one state owner; every mutation flows through
// setGame and lands with an observable consequence elsewhere on screen.
// ---------------------------------------------------------------------------

const HOLD_HINT_ID = 'pdm-hold-hint';

export default function MobileTriviaHostConsoleTemplate() {
  // Container-width decision (≥720px wrapper → centered phone column);
  // viewport query is only the first-frame fallback.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const isNarrow = wrapWidth > 0 && wrapWidth < 360; // venue clamp 200→140
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [game, setGame] = useState<GameState>(INITIAL_STATE);

  // Focus plumbing — openers restored on every close path.
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const alertOpenerRef = useRef<HTMLElement | null>(null);
  const overflowMenuRef = useRef<HTMLDivElement | null>(null);
  const settingsMenuRef = useRef<HTMLDivElement | null>(null);
  const alertCancelRef = useRef<HTMLButtonElement | null>(null);

  // DERIVED — every aggregate re-derives from the rows it summarizes.
  const question = QUESTIONS[game.questionIndex];
  const revealed = game.stage === 'revealed';
  const ranks = computeRanks(game.teams);
  const pendingCount = game.disputes.filter(d => d.status === 'pending').length;
  const scoreCounts = new Map<number, number>();
  for (const team of TEAMS) {
    const score = game.teams[team.id].score;
    scoreCounts.set(score, (scoreCounts.get(score) ?? 0) + 1);
  }
  const lastResolved = [...game.disputes].reverse().find(d => d.status !== 'pending');
  const venue = VENUES[game.venueIdx];
  const qLabel = \`Q\${question.num}\`;

  const nextSeq = (prev: GameState) => (prev.toast?.seq ?? 0) + 1;

  // STATE HELPERS — the spec's update(id, patch) pair for teams/disputes.
  const updateTeam = useCallback((id: TeamId, patch: Partial<TeamState>) => {
    setGame(prev => ({...prev, teams: {...prev.teams, [id]: {...prev.teams[id], ...patch}}}));
  }, []);
  const updateDispute = useCallback((id: string, patch: Partial<DisputeState>) => {
    setGame(prev => ({
      ...prev,
      disputes: prev.disputes.map(d => (d.id === id ? {...d, ...patch} : d)),
    }));
  }, []);
  // Both helpers exist as the write API; the compound mutations below use
  // single-dispatch setGame so each beat lands in ONE render.
  void updateTeam;
  void updateDispute;

  // OVERLAY LIFECYCLE --------------------------------------------------------

  const openSheet = (opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    setGame(prev => ({...prev, sheetOpen: true, sheetDetent: 'medium', menu: null}));
  };
  const closeSheet = useCallback(() => {
    setGame(prev => ({...prev, sheetOpen: false, sheetDetent: 'medium'}));
    sheetOpenerRef.current?.focus();
  }, []);
  const closeMenu = useCallback(() => {
    setGame(prev => ({...prev, menu: null}));
    menuOpenerRef.current?.focus();
  }, []);
  const cancelAlert = useCallback(() => {
    setGame(prev => ({...prev, alertOpen: false}));
    alertOpenerRef.current?.focus();
  }, []);

  // Focus into the sheet on open — preventScroll (amendment: a plain
  // .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen).
  useEffect(() => {
    if (game.sheetOpen) sheetRef.current?.focus({preventScroll: true});
  }, [game.sheetOpen]);
  useEffect(() => {
    if (game.menu === 'overflow')
      overflowMenuRef.current?.querySelector<HTMLElement>('button:not([disabled])')?.focus({preventScroll: true});
    if (game.menu === 'settings')
      settingsMenuRef.current?.querySelector<HTMLElement>('button:not([disabled])')?.focus({preventScroll: true});
  }, [game.menu]);
  useEffect(() => {
    if (game.alertOpen) alertCancelRef.current?.focus({preventScroll: true});
  }, [game.alertOpen]);

  // Escape closes the TOPMOST overlay only: menu > alert > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (game.menu != null) closeMenu();
      else if (game.alertOpen) cancelAlert();
      else if (game.sheetOpen) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game.menu, game.alertOpen, game.sheetOpen, closeMenu, cancelAlert, closeSheet]);

  // CONSEQUENCE CHAINS -------------------------------------------------------

  // Stage machine forward moves — 'Show options' / 'Lock answers'.
  const advanceStage = (to: Stage) => {
    setGame(prev => ({...prev, stage: to, menu: null}));
  };

  // REVEAL — ONE dispatch: +2 to correct teams, chips flip, ticker
  // FLIP-reflows against the pre-reveal rank baseline, the navBar dot
  // fills, Adjust enables, the sheet banner flips, the toast announces.
  const doReveal = () => {
    setGame(prev => {
      if (prev.stage !== 'locked') return prev;
      const q = QUESTIONS[prev.questionIndex];
      const baseline = computeRanks(prev.teams);
      const teams = {...prev.teams};
      let winners = 0;
      for (const team of TEAMS) {
        if (team.answers[q.id as 'q4' | 'q5'] === q.correct) {
          teams[team.id] = {
            score: teams[team.id].score + POINTS_PER_CORRECT,
            correct: teams[team.id].correct + 1,
          };
          winners += 1;
        }
      }
      return {
        ...prev,
        stage: 'revealed',
        teams,
        rankBaseline: baseline,
        roundComplete: prev.questionIndex === 4 ? true : prev.roundComplete,
        holdPct: 0,
        menu: null,
        toast: {
          seq: nextSeq(prev),
          text: \`Answers revealed · \${winners} teams +\${POINTS_PER_CORRECT}\`,
          undo: null,
        },
      };
    });
  };

  // NEXT QUESTION — chips reset face-down, delta/rank chips clear, dot 5
  // becomes current (all derived from the two fields this writes).
  const nextQuestion = () => {
    setGame(prev => ({
      ...prev,
      questionIndex: 4,
      stage: 'read',
      rankBaseline: null,
      adjustMode: false,
      menu: null,
      toast: null,
    }));
  };

  // SKIP — reversible: executes + Undo toast (undo-over-confirm).
  const skipQuestion = () => {
    setGame(prev => {
      const undo = snapshotOf(prev);
      const skippedTo = prev.questionIndex === 3 ? (4 as const) : prev.questionIndex;
      return {
        ...prev,
        questionIndex: skippedTo,
        stage: prev.questionIndex === 3 ? 'read' : prev.stage,
        roundComplete: prev.questionIndex === 4 ? true : prev.roundComplete,
        rankBaseline: null,
        adjustMode: false,
        menu: null,
        toast: {seq: nextSeq(prev), text: \`Q\${QUESTIONS[prev.questionIndex].num} skipped\`, undo},
      };
    });
  };

  // GRANT — executes IMMEDIATELY (+2, live reflow behind the 55% detent,
  // Undo toast); no confirm dialog. The dispute moves to the queue tail
  // (Resolved); Undo restores the exact prior scores/ranks/queue position.
  const grantDispute = (disputeId: string) => {
    setGame(prev => {
      const fixture = DISPUTE_BY_ID[disputeId];
      const undo = snapshotOf(prev);
      const baseline = computeRanks(prev.teams);
      const teams = {
        ...prev.teams,
        [fixture.teamId]: {
          score: prev.teams[fixture.teamId].score + fixture.deltaPts,
          correct: prev.teams[fixture.teamId].correct + 1,
        },
      };
      const disputes: DisputeState[] = [
        ...prev.disputes.filter(d => d.id !== disputeId),
        {id: disputeId, status: 'granted'},
      ];
      return {
        ...prev,
        teams,
        disputes,
        rankBaseline: baseline,
        toast: {
          seq: nextSeq(prev),
          text: \`Dispute granted · \${TEAM_BY_ID[fixture.teamId].name} +\${fixture.deltaPts} on \${fixture.ref}\`,
          undo,
        },
      };
    });
  };

  // DENY — no score change; row moves to Resolved with a Denied badge.
  // Undo included anyway — it is reversible in one assignment.
  const denyDispute = (disputeId: string) => {
    setGame(prev => {
      const undo = snapshotOf(prev);
      const disputes: DisputeState[] = [
        ...prev.disputes.filter(d => d.id !== disputeId),
        {id: disputeId, status: 'denied'},
      ];
      return {
        ...prev,
        disputes,
        toast: {seq: nextSeq(prev), text: 'Dispute denied', undo},
      };
    });
  };

  // UNDO — exact restoration in one assignment; toast reads 'Restored'.
  const undoLast = () => {
    setGame(prev => {
      const undo = prev.toast?.undo;
      if (undo == null) return prev;
      return {...prev, ...undo, toast: {seq: nextSeq(prev), text: 'Restored', undo: null}};
    });
  };

  // STEPPER — ±1 with live reflow; rank changes announce via the ONE
  // polite region (stress fixture 5: minus disables at 0).
  const stepTeam = (id: TeamId, dir: 1 | -1) => {
    setGame(prev => {
      const nextScore = Math.min(99, Math.max(0, prev.teams[id].score + dir));
      if (nextScore === prev.teams[id].score) return prev;
      const baseline = computeRanks(prev.teams);
      const teams = {...prev.teams, [id]: {...prev.teams[id], score: nextScore}};
      const after = computeRanks(teams);
      const moved = after[id] !== baseline[id];
      return {
        ...prev,
        teams,
        rankBaseline: baseline,
        toast: moved
          ? {seq: nextSeq(prev), text: \`\${TEAM_BY_ID[id].name} moved to rank \${after[id]}\`, undo: null}
          : prev.toast,
      };
    });
  };

  // SETTINGS — Edit venue swaps the venue const (stress fixture 11);
  // End game routes through the centered alert (irreversible).
  const editVenue = () => {
    setGame(prev => {
      const venueIdx = prev.venueIdx === 0 ? (1 as const) : (0 as const);
      return {
        ...prev,
        venueIdx,
        menu: null,
        toast: {seq: nextSeq(prev), text: \`Venue updated · \${VENUES[venueIdx]}\`, undo: null},
      };
    });
    menuOpenerRef.current?.focus();
  };
  const confirmEndGame = () => {
    setGame(prev => ({
      ...prev,
      gameEnded: true,
      alertOpen: false,
      adjustMode: false,
      toast: {seq: nextSeq(prev), text: 'Game ended · Final standings locked', undo: null},
    }));
  };
  // Honest reset — restores the shipped fixture wholesale.
  const startNextGame = () => {
    setGame({
      ...INITIAL_STATE,
      toast: {seq: 1, text: 'New game — demo fixture restored', undo: null},
    });
  };

  const showHoldHint = () => {
    setGame(prev => ({
      ...prev,
      toast: {
        seq: nextSeq(prev),
        text: 'Hold 0.8 seconds to reveal — or use Reveal now in the menu',
        undo: null,
      },
    }));
  };

  // STAGE BAR — the primary ALWAYS names the next legal action.
  const renderPrimary = () => {
    if (game.gameEnded) {
      return (
        <button type="button" className="pdm-btn pdm-focusable" style={styles.primaryBtn} onClick={startNextGame}>
          <span style={styles.primaryLabel}>Start next game</span>
        </button>
      );
    }
    if (game.roundComplete) {
      return (
        <button
          type="button"
          className="pdm-btn pdm-focusable"
          style={styles.primaryBtn}
          onClick={event => openSheet(event.currentTarget)}>
          <span style={styles.primaryLabel}>Round {ROUND_NO} complete · Review disputes</span>
        </button>
      );
    }
    if (game.stage === 'read') {
      return (
        <button
          type="button"
          className="pdm-btn pdm-focusable"
          style={styles.primaryBtn}
          onClick={() => advanceStage('options')}>
          <span style={styles.primaryLabel}>Show options</span>
        </button>
      );
    }
    if (game.stage === 'options') {
      return (
        <button
          type="button"
          className="pdm-btn pdm-focusable"
          style={styles.primaryBtn}
          onClick={() => advanceStage('locked')}>
          <span style={styles.primaryLabel}>Lock answers</span>
        </button>
      );
    }
    if (game.stage === 'locked') {
      return (
        <HoldToRevealButton
          pct={game.holdPct}
          onPct={pct => setGame(prev => ({...prev, holdPct: pct}))}
          onComplete={doReveal}
          onTapHint={showHoldHint}
          reducedMotion={reducedMotion}
          hintId={HOLD_HINT_ID}
        />
      );
    }
    // stage 'revealed' on Q4 (Q5-revealed is roundComplete above).
    return (
      <button type="button" className="pdm-btn pdm-focusable" style={styles.primaryBtn} onClick={nextQuestion}>
        <span style={styles.primaryLabel}>Next question</span>
      </button>
    );
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(game.sheetOpen || game.alertOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const pendingDisputes = game.disputes.filter(d => d.status === 'pending');
  const resolvedDisputes = game.disputes.filter(d => d.status !== 'pending');
  const adjustEnabled = revealed && !game.gameEnded;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{PODIUM_CSS}</style>
      <div style={shellStyle}>
        {/* NAV BAR — hairline ALWAYS ON (noted choice). */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <RoundDots questionIndex={game.questionIndex} stage={game.stage} roundComplete={game.roundComplete} />
          </div>
          <h1 style={{...styles.venueTitle, maxWidth: isNarrow ? 140 : 200}}>{venue}</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="pdm-btn pdm-focusable"
              style={styles.iconBtn}
              aria-label={\`Disputes, \${pendingCount} pending\`}
              onClick={event => openSheet(event.currentTarget)}>
              <Icon icon={GavelIcon} size="md" color="inherit" />
              {pendingCount > 0 ? (
                <span style={styles.badgePill} aria-hidden>
                  {pendingCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="pdm-btn pdm-focusable"
              style={styles.iconBtn}
              aria-label="Game settings"
              aria-haspopup="menu"
              aria-expanded={game.menu === 'settings'}
              onClick={event => {
                menuOpenerRef.current = event.currentTarget;
                setGame(prev => ({...prev, menu: prev.menu === 'settings' ? null : 'settings'}));
              }}>
              <Icon icon={SettingsIcon} size="md" color="inherit" />
            </button>
          </div>
          {game.menu === 'settings' ? (
            <div
              ref={settingsMenuRef}
              role="menu"
              aria-label="Game settings"
              style={{...styles.anchoredMenu, top: 50, right: 8}}
              onKeyDown={menuArrowNav}>
              <button type="button" role="menuitem" className="pdm-btn pdm-focusable" style={styles.menuRow} onClick={editVenue}>
                <Icon icon={PencilLineIcon} size="sm" color="secondary" />
                <span style={styles.menuRowText}>Edit venue</span>
              </button>
              <div style={styles.rowDivider} />
              <button
                type="button"
                role="menuitem"
                className="pdm-btn pdm-focusable"
                style={{...styles.menuRow, ...styles.menuRowDanger, ...(game.gameEnded ? styles.menuRowDisabled : null)}}
                disabled={game.gameEnded}
                onClick={event => {
                  alertOpenerRef.current = event.currentTarget;
                  setGame(prev => ({...prev, menu: null, alertOpen: true}));
                }}>
                <Icon icon={CircleStopIcon} size="sm" color="inherit" />
                <span style={styles.menuRowText}>End game</span>
              </button>
            </div>
          ) : null}
        </header>

        <main style={styles.main}>
          <h2 className="pdm-vh">Current question</h2>

          {/* REVEAL STAGER — the stage machine card. */}
          <section style={styles.stagerCard} aria-label={\`Question \${question.num} of \${QUESTIONS_PER_ROUND}\`}>
            <div style={styles.overlineRow}>
              <span style={styles.overline}>
                ROUND {ROUND_NO} · Q{question.num} OF {QUESTIONS_PER_ROUND}
              </span>
              <span style={styles.categoryChip}>{question.category}</span>
            </div>
            <p style={styles.questionText}>{question.text}</p>
            <StageRail stage={game.stage} />
            {game.stage === 'read' ? (
              <div style={styles.optionsHiddenNote}>Options hidden — read the question aloud</div>
            ) : (
              <div>
                {question.options.map(option => {
                  const isCorrectRow = revealed && option.letter === question.correct;
                  return (
                    <div
                      key={option.letter}
                      style={{...styles.optionRow, ...(isCorrectRow ? styles.optionRowCorrect : null)}}>
                      <span style={styles.optionLetter} aria-hidden>
                        {option.letter}
                      </span>
                      <span style={styles.optionLabel}>{option.label}</span>
                      <span style={styles.optionTrailing}>
                        {game.stage === 'locked' ? (
                          <span style={{color: 'var(--color-text-secondary)', display: 'inline-flex'}} aria-hidden>
                            <Icon icon={LockIcon} size="sm" color="inherit" />
                          </span>
                        ) : null}
                        {isCorrectRow ? (
                          <span style={{color: SUCCESS_TEXT, display: 'inline-flex'}}>
                            <Icon icon={CheckIcon} size="sm" color="inherit" />
                            <span className="pdm-vh">Correct answer</span>
                          </span>
                        ) : null}
                      </span>
                    </div>
                  );
                })}
                {/* Plain span — the toastDock is the ONE live region. */}
                {game.stage === 'locked' ? (
                  <span style={{...styles.lockedChip, marginTop: 8, display: 'inline-flex'}}>
                    <Icon icon={LockIcon} size="sm" color="inherit" />
                    Answers locked
                  </span>
                ) : null}
              </div>
            )}
          </section>

          {/* LEADERBOARD — sectionHeader with the stage-gated Adjust. */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeaderText}>
              Leaderboard · {TEAMS.length} teams{game.gameEnded ? ' · Final' : ''}
            </h2>
            <button
              type="button"
              className="pdm-btn pdm-focusable"
              style={{...styles.adjustBtn, ...(adjustEnabled ? null : styles.adjustBtnDisabled)}}
              disabled={!adjustEnabled}
              aria-disabled={!adjustEnabled}
              aria-pressed={game.adjustMode}
              onClick={() => setGame(prev => ({...prev, adjustMode: !prev.adjustMode}))}>
              {game.adjustMode ? 'Done' : 'Adjust'}
            </button>
          </div>
          <div style={styles.listCard}>
            <ol style={styles.tickerList} aria-label="Team leaderboard">
              {TEAMS.map(team => {
                const state = game.teams[team.id];
                const rank = ranks[team.id];
                const delta = game.rankBaseline != null ? game.rankBaseline[team.id] - rank : 0;
                const answer = team.answers[question.id as 'q4' | 'q5'];
                const isCorrect = answer === question.correct;
                return (
                  <TeamRow
                    key={team.id}
                    team={team}
                    state={state}
                    rank={rank}
                    delta={game.adjustMode ? 0 : delta}
                    answer={answer}
                    isCorrect={isCorrect}
                    revealed={revealed}
                    scoredNow={revealed && isCorrect}
                    tied={(scoreCounts.get(state.score) ?? 0) > 1}
                    adjustMode={game.adjustMode}
                    reducedMotion={reducedMotion}
                    onStep={stepTeam}
                  />
                );
              })}
            </ol>
          </div>

          <div style={styles.disputesBtnRow}>
            <button
              type="button"
              className="pdm-btn pdm-focusable"
              style={styles.actionHit}
              onClick={event => openSheet(event.currentTarget)}>
              <span style={styles.disputesBtn}>
                <Icon icon={GavelIcon} size="sm" color="inherit" />
                Disputes ({pendingCount})
              </span>
            </button>
          </div>
          {lastResolved != null ? (
            <p style={styles.resolvedCaption}>
              {TEAM_BY_ID[DISPUTE_BY_ID[lastResolved.id].teamId].name} · {DISPUTE_BY_ID[lastResolved.id].ref} ·{' '}
              {lastResolved.status === 'granted' ? \`Granted +\${DISPUTE_BY_ID[lastResolved.id].deltaPts}\` : 'Denied'}
            </p>
          ) : null}
          <div style={styles.bottomSpacer} />
        </main>

        {/* TOAST DOCK — sticky in flow above the StageBar; absolute
            (bottom 76, z42) only while the shell is scroll-locked. The
            ONE polite live region. */}
        <div
          style={{
            ...styles.toastDock,
            ...(game.sheetOpen || game.alertOpen ? styles.toastDockOverlay : null),
            ...(game.toast == null ? {marginBlock: 0} : null),
          }}
          aria-live="polite">
          {game.toast != null ? (
            <div key={game.toast.seq} style={styles.toast} className="pdm-fade">
              <span style={styles.toastMsg}>{game.toast.text}</span>
              {game.toast.undo != null ? (
                <>
                  <span style={styles.toastHairline} aria-hidden />
                  <button type="button" className="pdm-btn pdm-focusable" style={styles.undoBtn} onClick={undoLast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* STAGE BAR — 64px sticky bottom; primary + 44×44 overflow. */}
        <nav style={styles.stageBar} aria-label="Host actions">
          {renderPrimary()}
          <span id={HOLD_HINT_ID} className="pdm-vh">
            Hold 0.8 seconds, or choose Reveal now from the menu
          </span>
          <button
            type="button"
            className="pdm-btn pdm-focusable"
            style={styles.overflowBtn}
            aria-label="More host actions"
            aria-haspopup="menu"
            aria-expanded={game.menu === 'overflow'}
            onClick={event => {
              menuOpenerRef.current = event.currentTarget;
              setGame(prev => ({...prev, menu: prev.menu === 'overflow' ? null : 'overflow'}));
            }}>
            <Icon icon={MoreVerticalIcon} size="md" color="inherit" />
          </button>
          {game.menu === 'overflow' ? (
            <div
              ref={overflowMenuRef}
              role="menu"
              aria-label="More host actions"
              style={{...styles.anchoredMenu, bottom: 60, right: 16}}
              onKeyDown={menuArrowNav}>
              {/* Illegal actions are disabled attrs, never hidden. */}
              <button
                type="button"
                role="menuitem"
                className="pdm-btn pdm-focusable"
                style={{...styles.menuRow, ...(game.stage !== 'locked' || game.gameEnded ? styles.menuRowDisabled : null)}}
                disabled={game.stage !== 'locked' || game.gameEnded}
                onClick={() => {
                  doReveal();
                  menuOpenerRef.current?.focus();
                }}>
                <Icon icon={EyeIcon} size="sm" color="secondary" />
                <span style={styles.menuRowText}>Reveal now</span>
              </button>
              <div style={styles.rowDivider} />
              <button
                type="button"
                role="menuitem"
                className="pdm-btn pdm-focusable"
                style={{...styles.menuRow, ...(game.roundComplete || game.gameEnded ? styles.menuRowDisabled : null)}}
                disabled={game.roundComplete || game.gameEnded}
                onClick={() => {
                  skipQuestion();
                  menuOpenerRef.current?.focus();
                }}>
                <Icon icon={SkipForwardIcon} size="sm" color="secondary" />
                <span style={styles.menuRowText}>Skip question</span>
              </button>
            </div>
          ) : null}
        </nav>

        {/* DISPUTE QUEUE SHEET — scrim z40 + sheet z41. */}
        {game.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {game.sheetOpen ? (
          <SheetShell
            detent={game.sheetDetent}
            onDetentChange={detent => setGame(prev => ({...prev, sheetDetent: detent}))}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}>
            <div style={styles.sheetBody}>
              {/* Current-question eligibility — stage-gating law. */}
              <div style={styles.eligBanner}>
                {revealed ? (
                  <>
                    <span style={{flex: 1, minWidth: 0}}>
                      {qLabel} now disputable — teams may contest the ruling
                    </span>
                    <span style={styles.eligBadge}>OPEN</span>
                  </>
                ) : (
                  <span>
                    {qLabel} not yet disputable — reveal the answer first
                  </span>
                )}
              </div>
              <h3 style={styles.sheetSectionHeader}>Pending ({pendingDisputes.length})</h3>
              {pendingDisputes.length === 0 ? (
                <div style={styles.emptyQueueNote}>Queue clear — no pending disputes</div>
              ) : (
                pendingDisputes.map((dispute, index) => {
                  const fixture = DISPUTE_BY_ID[dispute.id];
                  const team = TEAM_BY_ID[fixture.teamId];
                  return (
                    <div key={dispute.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.disputeRow}>
                        <span style={styles.disputeText}>
                          <span style={styles.disputeTitle}>
                            {team.name} contests {fixture.ref}
                          </span>
                          <span style={styles.disputeQuote}>“{fixture.quote}”</span>
                        </span>
                        <span style={styles.disputeActions}>
                          <button
                            type="button"
                            className="pdm-btn pdm-focusable"
                            style={styles.actionHit}
                            aria-label={\`Grant dispute, \${team.name} plus \${fixture.deltaPts} on \${fixture.ref}\`}
                            onClick={() => grantDispute(dispute.id)}>
                            <span style={styles.grantBtn}>Grant</span>
                          </button>
                          <button
                            type="button"
                            className="pdm-btn pdm-focusable"
                            style={styles.actionHit}
                            aria-label={\`Deny dispute from \${team.name}\`}
                            onClick={() => denyDispute(dispute.id)}>
                            <span style={styles.denyBtn}>Deny</span>
                          </button>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <h3 style={styles.sheetSectionHeader}>Resolved ({resolvedDisputes.length})</h3>
              {resolvedDisputes.map((dispute, index) => {
                const fixture = DISPUTE_BY_ID[dispute.id];
                const team = TEAM_BY_ID[fixture.teamId];
                return (
                  <div key={dispute.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.disputeRow}>
                      <span style={styles.disputeText}>
                        <span style={styles.disputeTitle}>
                          {team.name} · {fixture.ref}
                        </span>
                        <span style={styles.disputeQuote}>“{fixture.quote}”</span>
                      </span>
                      <span
                        style={
                          dispute.status === 'granted' ? styles.resolvedBadgeGranted : styles.resolvedBadgeDenied
                        }>
                        {dispute.status === 'granted' ? \`Granted +\${fixture.deltaPts}\` : 'Denied'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SheetShell>
        ) : null}

        {/* END GAME — the one blocking irreversible choice. Scrim click
            does NOT dismiss; Escape cancels; first focus on Cancel. */}
        {game.alertOpen ? <div style={styles.alertScrim} aria-hidden /> : null}
        {game.alertOpen ? (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="pdm-alert-title"
            aria-describedby="pdm-alert-body"
            style={styles.alert}
            onKeyDown={event => trapTabKey(event, event.currentTarget)}>
            <div style={styles.alertBody}>
              <h2 id="pdm-alert-title" style={styles.alertTitle}>
                End game?
              </h2>
              <p id="pdm-alert-body" style={styles.alertText}>
                Standings lock at {ROUND_NO} of {ROUND_COUNT} rounds. This can't be undone.
              </p>
            </div>
            <div style={styles.alertBtnRow}>
              <button
                type="button"
                ref={alertCancelRef}
                className="pdm-btn pdm-focusable"
                style={styles.alertBtnCancel}
                onClick={cancelAlert}>
                Cancel
              </button>
              <button type="button" className="pdm-btn pdm-focusable" style={styles.alertBtnCommit} onClick={confirmEndGame}>
                End game
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};