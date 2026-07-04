var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Torchward's game-master combat
 *   console for "Session 14 — The Hollowmere Crypts", frozen at Round 3
 *   with Korrin Blackbriar's turn active: nine combatants (four party,
 *   five foes), a 12-entry roll ledger spanning rounds 1–3 whose damage
 *   totals reconcile to every HP delta by hand-checked arithmetic, and
 *   an 8-turn pre-authored SCRIPTED_TURNS array consumed by a pointer —
 *   the clock is TURNS, not wall time. No Date.now(), no Math.random(),
 *   no network assets.
 * @output TTRPG Encounter Tracker — a turn-based session console where
 *   one End Turn action fans out consequences across every surface: the
 *   initiative ribbon's caret slides and the incoming token lights, the
 *   outgoing combatant's condition rings each lose a segment (expiries
 *   pop off and post system ledger lines), scripted rolls append to the
 *   ledger and drive HP re-derivation in the list rows, ribbon HP
 *   strips, and statblock aside simultaneously, and the round pill
 *   increments on wrap. Dice rows render parsed expressions with struck
 *   dropped dice; durations are geometry (depleting hex rings).
 * @position Page template; emitted by \`astryx template
 *   ttrpg-encounter-tracker\`
 *
 * FIXED DENSITY GRID (verbatim from spec): 44px session header bar;
 * 72px InitiativeRibbon rail; 32px combatant filter row; 48px combatant
 * list rows; 380px statblock detail aside; 220px roll-ledger drawer
 * expanded / 36px collapsed summary bar; 40px RollLedgerRow rows inside
 * the drawer; 12px gutter token (GUTTER = 12) used for ALL padding/gaps
 * — no other spacing literals (sub-gutter gaps derive as GUTTER/2 and
 * GUTTER/3).
 *
 * Frame: root 100dvh div > view root (measured; flex column) >
 *   [1] 44px session header  >  [2] 72px InitiativeRibbon  >
 *   [3] body row (main column: 32px filter row + scrollable 48px rows |
 *   380px StatblockAside, own scroll)  >  [4] RollLedgerDrawer
 *   (220px expanded / 36px collapsed).
 * Container policy: app-shell archetype — rails, rows, panels, drawer;
 *   no Cards. The aside is a fixed-width bordered column, not a
 *   LayoutPanel, because the drawer must span under both columns.
 * Color policy: token-pure chrome. ONE quarantined brand literal EMBER
 *   (#B3452E), used ONLY as the TorchwardMark facet fill and the active
 *   token outline + caret — never as text and never on tinted fills.
 *   HP thresholds, verdicts, and condition severities use data-viz
 *   categorical tokens with repo-standard light-dark fallbacks. CRIT
 *   verdict uses the danger token, NOT the brand literal (quarantine).
 *
 * Responsive contract (subtraction only; bands key off the MEASURED
 * CONTAINER width of the view root via a ResizeObserver hook — the demo
 * stage is ~1045–1075px inside a 1440px window, so viewport queries
 * would lie; a viewport query covers only the pre-observer first frame):
 * - width >= 1000: full layout (default stage lands here).
 * - width < 1000: the 380px aside unmounts; a "Statblock" button joins
 *   the header right cluster and the statblock re-renders in a Dialog.
 * - width < 860: ribbon condenses (40px tokens, 32px hold tokens, round
 *   pill drops its arrow label); rows hide the AC chip and clamp the
 *   GM-note subtitle.
 * - width < 720: drawer forces the 36px collapsed summary bar
 *   ("12 rolls — last: …", a pre-composed display string); expanding
 *   overlays upward as an absolutely-positioned panel instead of
 *   consuming flex height.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  FlameIcon,
  DropletIcon,
  GhostIcon,
  LinkIcon,
  ArrowDownIcon,
  MoonIcon,
  ShieldIcon,
  SkullIcon,
  SwordsIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Popover} from '@astryxdesign/core/Popover';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens carry the repo-standard fallbacks (the demo does not inject them).
// ---------------------------------------------------------------------------

// BRAND LITERAL — quarantined. Used ONLY as the TorchwardMark facet fill and
// the active-turn outline/caret (2px strokes on chrome backgrounds — never
// text, so no 4.5:1 text-contrast obligation; as a 2px non-text indicator it
// clears the 3:1 graphics floor: #B3452E vs #FFF ≈ 5.4:1, #E06B52 vs #1E1E1E
// ≈ 4.7:1).
const EMBER = 'light-dark(#B3452E, #E06B52)';

const HP_OK = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const HP_WARN = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9838))';
const HP_DANGER = 'var(--color-data-categorical-red, light-dark(#D92D20, #F2655A))';
const SAVE_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const COND_PURPLE = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const COND_TEAL = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
const SELECTED_WASH =
  'var(--color-background-selected, light-dark(rgba(1, 113, 227, 0.08), rgba(61, 135, 255, 0.16)))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// The 12px gutter token — every padding/gap on the page derives from it.
const GUTTER = 12;

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, row hover, the caret slide, and the reduced-motion
// guard. Transitions animate transform/opacity/color only.
// ---------------------------------------------------------------------------

const TET_CSS = \`
.tet-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.tet-caret {
  transition: transform 160ms ease;
}
.tet-hoverable:hover {
  background-color: var(--color-background-muted);
}
.tet-fade {
  transition: opacity 200ms ease, color 200ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .tet-caret { transition: none; }
  .tet-fade { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  viewRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  // [1] 44px session header bar — top-left brand corner, top-right the
  // always-visible signature action (Round pill + End Turn).
  header: {
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  brandCluster: {display: 'flex', alignItems: 'center', gap: GUTTER / 2, minWidth: 0},
  wordmark: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap'},
  sessionTitle: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  headerRight: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    flexShrink: 0,
  },
  roundPill: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: GUTTER / 2 + GUTTER / 3,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontFamily: MONO,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // [2] 72px InitiativeRibbon rail: 24px upper hold-rail + 48px main track.
  ribbon: {
    height: 72,
    flexShrink: 0,
    position: 'relative',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  ribbonTrack: {
    position: 'absolute',
    insetInline: 0,
    bottom: GUTTER / 2,
    display: 'flex',
    alignItems: 'flex-end',
    gap: GUTTER,
    paddingInline: GUTTER,
  },
  ribbonToken: {
    position: 'relative',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    padding: 0,
    overflow: 'hidden',
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
  },
  ribbonMonogram: {
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  ribbonMonogramCondensed: {fontSize: 16},
  hpStrip: {position: 'absolute', insetInline: 0, bottom: 0, height: 3},
  holdToken: {
    position: 'relative',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: '1px dashed var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
    color: 'var(--color-text-secondary)',
  },
  holdLabel: {fontSize: 9, fontWeight: 600, letterSpacing: '0.08em'},
  roundTick: {
    alignSelf: 'stretch',
    width: 1,
    backgroundColor: 'var(--color-border)',
    flexShrink: 0,
  },
  roundTickPill: {
    alignSelf: 'center',
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: GUTTER / 2,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // 12x8 triangle caret under the active token; slides via translateX.
  caret: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderBottom: \`8px solid \${EMBER}\`,
  },
  // [3] body row.
  body: {display: 'flex', flex: 1, minHeight: 0},
  main: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0},
  // 32px combatant filter row.
  filterRow: {
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  listScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  // 48px combatant list rows.
  row: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  rowSelected: {
    backgroundColor: SELECTED_WASH,
    boxShadow: 'inset 2px 0 0 var(--color-accent)',
  },
  rowDown: {opacity: 0.4},
  rowMonogram: {
    width: 28,
    height: 28,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 12,
    fontWeight: 600,
  },
  nameBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0,
    minWidth: 0,
    flex: 1,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'start',
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
  },
  rowName: {
    fontSize: 13,
    fontWeight: 600,
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  rowSub: {
    fontSize: 11,
    lineHeight: '14px',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  acChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: GUTTER / 3,
    height: 22,
    paddingInline: GUTTER / 2,
    borderRadius: 4,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontFamily: MONO,
    fontSize: 11,
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  initCell: {
    width: 84,
    flexShrink: 0,
    textAlign: 'end',
    fontFamily: MONO,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // HPBar: 120px wide, 6px track — thresholds + dual display.
  hpWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  hpTrack: {
    width: 120,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  hpFill: {height: '100%', borderRadius: 3},
  hpLabel: {
    fontFamily: MONO,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    width: 52,
    textAlign: 'end',
  },
  // [aside] 380px StatblockAside.
  aside: {
    width: 380,
    flexShrink: 0,
    borderLeft: 'var(--border-width) solid var(--color-border)',
    overflowY: 'auto',
    minHeight: 0,
  },
  asideHeader: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  asideMonogram: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 16,
    fontWeight: 600,
  },
  acShield: {
    marginLeft: 'auto',
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    gap: GUTTER / 3,
    paddingInline: GUTTER / 2,
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  // 6-column ability grid, 44px cells.
  abilityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  abilityCell: {
    height: 44,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    borderRight: 'var(--border-width) solid var(--color-border)',
  },
  abilityKey: {fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-secondary)'},
  abilityScore: {fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums', lineHeight: '16px'},
  abilityMod: {fontFamily: MONO, fontSize: 10, color: 'var(--color-text-secondary)'},
  // Actions list, 44px rows; damage chips reuse the ledger chip record.
  actionRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  asideSection: {padding: GUTTER, display: 'flex', flexDirection: 'column', gap: GUTTER / 2},
  asideFooter: {display: 'flex', gap: GUTTER, padding: GUTTER},
  // [4] RollLedgerDrawer.
  drawer: {
    flexShrink: 0,
    borderTop: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-background)',
  },
  drawerHeader: {
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
  },
  drawerList: {flex: 1, minHeight: 0, overflowY: 'auto'},
  // Drawer overlay mode (<720): expands upward over the list instead of
  // consuming flex height.
  drawerOverlayPanel: {
    position: 'absolute',
    insetInline: 0,
    bottom: 36,
    height: 220 - 36,
    overflowY: 'auto',
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    boxShadow: '0 -8px 24px light-dark(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.4))',
    zIndex: 4,
  },
  checksum: {
    marginLeft: 'auto',
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  drawerSummary: {
    fontSize: 11,
    fontFamily: MONO,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  // 40px RollLedgerRow.
  ledgerRow: {
    minHeight: 40,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    paddingBlock: GUTTER / 3,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  ledgerRowHighlight: {backgroundColor: SELECTED_WASH},
  stampCell: {
    width: 72,
    flexShrink: 0,
    fontFamily: MONO,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  actorCell: {
    width: 140,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipLane: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 3,
    flexWrap: 'wrap',
  },
  // Expression chips: 22px tall, 12px mono, radius 4 — shared with the
  // statblock action rows (spec: shared chipStyle record).
  chip: {
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: GUTTER / 2,
    borderRadius: 4,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontFamily: MONO,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  chipDropped: {textDecoration: 'line-through', opacity: 0.5},
  chipTotal: {fontWeight: 700, fontSize: 14, backgroundColor: 'var(--color-background-card)'},
  eqGlyph: {fontFamily: MONO, fontSize: 12, color: 'var(--color-text-secondary)'},
  vsSeg: {
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  verdictCell: {
    width: 60,
    flexShrink: 0,
    textAlign: 'end',
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
  },
  consequenceBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: GUTTER / 3,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-accent)',
    whiteSpace: 'nowrap',
  },
  systemRow: {
    minHeight: 40,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Expiry toast — pinned near the top of the drawer list.
  toastRow: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    marginInline: GUTTER,
    marginBlock: GUTTER / 2,
    paddingInline: GUTTER,
    paddingBlock: GUTTER / 2,
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Condition hex cluster.
  hexBtn: {
    position: 'relative',
    width: 24,
    height: 24,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  hexOverflow: {
    width: 24,
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  clusterWrap: {display: 'inline-flex', alignItems: 'center', flexShrink: 0},
  popoverBody: {padding: GUTTER, display: 'flex', flexDirection: 'column', gap: GUTTER / 2, minWidth: 220},
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ---------------------------------------------------------------------------
// DATA — one deterministic world: Torchward running "Session 14 — The
// Hollowmere Crypts", frozen at Round 3, Korrin's turn. The clock is TURNS:
// every timestamp is a pre-computed 'R3·T2' string. Identity consts BY LAW.
// ---------------------------------------------------------------------------

const C_SERAPHINE = 'cmb-seraphine';
const C_KORRIN = 'cmb-korrin';
const C_MAEVIS = 'cmb-maevis';
const C_ALDOUS = 'cmb-aldous';
const C_VESS = 'cmb-vess';
const C_GHAST = 'cmb-ghast';
const C_SENTINEL_A = 'cmb-sentinel-a';
const C_SENTINEL_B = 'cmb-sentinel-b';
const C_INQUISITOR = 'cmb-inquisitor';

const COND_S_POISONED = 'cond-seraphine-poisoned';
const COND_M_CONC = 'cond-maevis-concentration';
const COND_A_UNCON = 'cond-aldous-unconscious';
const COND_G_POISONED = 'cond-ghast-poisoned';
const COND_G_PRONE = 'cond-ghast-prone';
const COND_G_RESTRAINED = 'cond-ghast-restrained';
const COND_G_BURNING = 'cond-ghast-burning';
const COND_G_FRIGHTENED = 'cond-ghast-frightened';

type ConditionKind =
  | 'poisoned'
  | 'prone'
  | 'concentration'
  | 'unconscious'
  | 'restrained'
  | 'burning'
  | 'frightened';

interface Condition {
  id: string;
  kind: ConditionKind;
  name: string;
  /** Dual fields: remaining/total drive the hex-ring geometry. */
  remainingRounds: number;
  totalRounds: number;
  source: string; // e.g. 'from Vess the Pale Warden (R2)'
}

interface AbilityScore {
  key: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
  score: number;
  modDisplay: string;
}

interface CombatAction {
  id: string;
  name: string;
  bonusDisplay: string; // '+8' attack bonus or 'DC 15' save rider
  damageDisplay: string; // '2d6+4' — rendered with the shared chip record
}

interface Combatant {
  id: string;
  name: string;
  monogram: string;
  kind: 'party' | 'foe';
  classLine: string; // 'Paladin 6' | 'CR 5 Undead'
  ac: number;
  hpCurrent: number;
  hpMax: number;
  hpDisplay: string; // dual field: '34 / 51'
  initiative: number;
  initiativeDisplay: string; // dual field: '21 (Dex +5)'
  conditions: Condition[];
  note: string; // GM note — imperative, rule-citation voice
  abilities: AbilityScore[];
  actions: CombatAction[];
}

const ABILITY_KEYS: AbilityScore['key'][] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

/** Dual-field helper: score 18 renders '+4'. Deterministic derivation. */
function abil(scores: [number, number, number, number, number, number]): AbilityScore[] {
  return scores.map((score, i) => {
    const mod = Math.floor((score - 10) / 2);
    return {
      key: ABILITY_KEYS[i],
      score,
      modDisplay: mod >= 0 ? \`+\${mod}\` : \`−\${Math.abs(mod)}\`,
    };
  });
}

// Initiative order on track (desc): Korrin 21 → Seraphine 18 → [Vess 16,
// DELAYED — hold rail] → Malachai 15 → Maevis 14 → Ghast 12 → Sentinel A 11
// → Sentinel B 10 → Aldous 9.
const COMBATANTS: Combatant[] = [
  {
    id: C_KORRIN,
    name: 'Korrin Blackbriar',
    monogram: 'KB',
    kind: 'party',
    classLine: 'Rogue 6',
    ac: 15,
    hpCurrent: 40,
    hpMax: 45,
    hpDisplay: '40 / 45',
    initiative: 21,
    initiativeDisplay: '21 (Dex +5)',
    conditions: [],
    note: 'Sneak Attack once per turn when an ally is within 5 ft of the target. Cunning Action: bonus-action Dash, Disengage, or Hide.',
    abilities: abil([10, 20, 14, 12, 13, 14]),
    actions: [
      {id: 'act-korrin-sword', name: 'Shortsword (sneak)', bonusDisplay: '+8', damageDisplay: '2d6+4'},
      {id: 'act-korrin-bow', name: 'Shortbow', bonusDisplay: '+8', damageDisplay: '1d6+5'},
    ],
  },
  {
    id: C_SERAPHINE,
    name: 'Seraphine Vail',
    monogram: 'SV',
    kind: 'party',
    classLine: 'Paladin 6',
    ac: 19,
    hpCurrent: 34,
    hpMax: 51,
    hpDisplay: '34 / 51',
    initiative: 18,
    initiativeDisplay: '18 (Dex +1)',
    conditions: [
      {
        id: COND_S_POISONED,
        kind: 'poisoned',
        name: 'Poisoned',
        remainingRounds: 2,
        totalRounds: 4,
        source: 'from Vess the Pale Warden (R2)',
      },
    ],
    note: 'Aura of Protection: +3 to all saves within 10 ft. Lay on Hands pool 12 — reach Aldous before his next failed death save.',
    abilities: abil([18, 12, 14, 10, 12, 16]),
    actions: [
      {id: 'act-seraphine-sword', name: 'Longsword', bonusDisplay: '+7', damageDisplay: '1d8+4'},
      {id: 'act-seraphine-smite', name: 'Divine Smite (rider)', bonusDisplay: 'on hit', damageDisplay: '2d8'},
    ],
  },
  {
    id: C_VESS,
    name: 'Vess the Pale Warden',
    monogram: 'VP',
    kind: 'foe',
    classLine: 'CR 5 Undead',
    ac: 17,
    hpCurrent: 88,
    hpMax: 120,
    hpDisplay: '88 / 120',
    initiative: 16,
    initiativeDisplay: '16 (Dex +2)',
    conditions: [],
    note: 'Holding: re-enters when the party clusters — open with Pall of Silence (DC 15 CON, 20-ft radius) before the greatsword.',
    abilities: abil([20, 14, 18, 14, 15, 16]),
    actions: [
      {id: 'act-vess-blade', name: 'Grave Blade', bonusDisplay: '+8', damageDisplay: '2d10+6'},
      {id: 'act-vess-pall', name: 'Pall of Silence', bonusDisplay: 'DC 15', damageDisplay: '3d8'},
    ],
  },
  {
    id: C_INQUISITOR,
    // 47-char stress fixture: forces ellipsis in the 140px ledger actor
    // cell, the ribbon monogram fallback, and 48px row truncation.
    name: 'Grand Inquisitor Malachai of the Sundered Choir of Vhalen',
    monogram: 'GM',
    kind: 'foe',
    classLine: 'CR 4 Humanoid',
    ac: 16,
    hpCurrent: 52,
    hpMax: 58,
    hpDisplay: '52 / 58',
    initiative: 15,
    initiativeDisplay: '15 (Dex +1)',
    conditions: [],
    note: 'Censure (recharge 5–6): DC 14 WIS or frightened 1 round. Focuses whoever damaged him last — currently Maevis.',
    abilities: abil([16, 12, 14, 13, 16, 15]),
    actions: [
      {id: 'act-inq-flail', name: 'Flail', bonusDisplay: '+6', damageDisplay: '1d8+3'},
      {id: 'act-inq-censure', name: 'Censure', bonusDisplay: 'DC 14', damageDisplay: '2d6'},
    ],
  },
  {
    id: C_MAEVIS,
    name: 'Maevis Thornbury',
    monogram: 'MT',
    kind: 'party',
    classLine: 'Wizard 6',
    ac: 12,
    hpCurrent: 28,
    hpMax: 32,
    hpDisplay: '28 / 32',
    initiative: 14,
    initiativeDisplay: '14 (Dex +2)',
    conditions: [
      {
        id: COND_M_CONC,
        kind: 'concentration',
        name: 'Concentration — Haste',
        remainingRounds: 3,
        totalRounds: 10,
        source: 'on Korrin Blackbriar (R1)',
      },
    ],
    note: 'Concentrating on Haste (Korrin). CON save DC 10 on damage or the spell drops and Korrin loses his next turn.',
    abilities: abil([8, 14, 12, 18, 13, 10]),
    actions: [
      {id: 'act-maevis-bolt', name: 'Fire Bolt', bonusDisplay: '+7', damageDisplay: '1d10'},
      {id: 'act-maevis-fireball', name: 'Fireball', bonusDisplay: 'DC 15', damageDisplay: '8d6'},
    ],
  },
  {
    id: C_GHAST,
    name: 'Ghast of Hollowmere',
    monogram: 'GH',
    kind: 'foe',
    classLine: 'CR 2 Undead',
    ac: 13,
    hpCurrent: 23,
    hpMax: 36,
    hpDisplay: '23 / 36',
    initiative: 12,
    initiativeDisplay: '12 (Dex +2)',
    // Stress fixture: 5 conditions exercises the max-4 + '+1' overflow hex.
    conditions: [
      {
        id: COND_G_POISONED,
        kind: 'poisoned',
        name: 'Poisoned',
        remainingRounds: 2,
        totalRounds: 4,
        source: 'from Seraphine Vail (R2)',
      },
      {
        id: COND_G_PRONE,
        kind: 'prone',
        name: 'Prone',
        remainingRounds: 1,
        totalRounds: 1,
        source: 'from Korrin Blackbriar (R3)',
      },
      {
        id: COND_G_RESTRAINED,
        kind: 'restrained',
        name: 'Restrained',
        remainingRounds: 3,
        totalRounds: 3,
        source: 'from Maevis Thornbury (R2)',
      },
      {
        id: COND_G_BURNING,
        kind: 'burning',
        name: 'Burning',
        remainingRounds: 1,
        totalRounds: 2,
        source: "from Maevis Thornbury's fireball (R2)",
      },
      {
        id: COND_G_FRIGHTENED,
        kind: 'frightened',
        name: 'Frightened',
        remainingRounds: 2,
        totalRounds: 2,
        source: "from Seraphine Vail's Channel Divinity (R2)",
      },
    ],
    note: 'Stench aura: CON save DC 10 on entering 5 ft, poisoned 1 round on fail. Turn Resistance: advantage vs Turn Undead.',
    abilities: abil([16, 15, 10, 11, 10, 8]),
    actions: [
      {id: 'act-ghast-claws', name: 'Claws', bonusDisplay: '+5', damageDisplay: '2d6+2'},
      {id: 'act-ghast-bite', name: 'Bite', bonusDisplay: '+5', damageDisplay: '2d8+2'},
    ],
  },
  {
    id: C_SENTINEL_A,
    name: 'Bone Sentinel A',
    monogram: 'BA',
    kind: 'foe',
    classLine: 'CR 1/2 Undead',
    ac: 14,
    hpCurrent: 11,
    hpMax: 25,
    hpDisplay: '11 / 25',
    initiative: 11,
    initiativeDisplay: '11 (Dex +1)',
    conditions: [],
    note: 'Vulnerable to bludgeoning. Crumbles at 0 hp — no death saves for constructs of the Choir.',
    abilities: abil([14, 12, 13, 6, 8, 5]),
    actions: [
      {id: 'act-senta-blade', name: 'Rusted Blade', bonusDisplay: '+4', damageDisplay: '1d6+2'},
    ],
  },
  {
    id: C_SENTINEL_B,
    // Stress fixture: untouched at 25/25 — the HP-from-ledger cross-check's
    // zero case (no ledger entry targets this id).
    name: 'Bone Sentinel B',
    monogram: 'BB',
    kind: 'foe',
    classLine: 'CR 1/2 Undead',
    ac: 14,
    hpCurrent: 25,
    hpMax: 25,
    hpDisplay: '25 / 25',
    initiative: 10,
    initiativeDisplay: '10 (Dex +1)',
    conditions: [],
    note: 'Untouched — holding the ossuary door. Vulnerable to bludgeoning; same statblock as Sentinel A.',
    abilities: abil([14, 12, 13, 6, 8, 5]),
    actions: [
      {id: 'act-sentb-blade', name: 'Rusted Blade', bonusDisplay: '+4', damageDisplay: '1d6+2'},
    ],
  },
  {
    id: C_ALDOUS,
    // Stress fixture: 0/38 unconscious — down-state row styling (40%
    // opacity + skull), single 'unconscious' hex with a full 10/10 ring.
    name: 'Brother Aldous Penn',
    monogram: 'AP',
    kind: 'party',
    classLine: 'Cleric 6',
    ac: 16,
    hpCurrent: 0,
    hpMax: 38,
    hpDisplay: '0 / 38',
    initiative: 9,
    initiativeDisplay: '9 (Dex −1)',
    conditions: [
      {
        id: COND_A_UNCON,
        kind: 'unconscious',
        name: 'Unconscious',
        remainingRounds: 10,
        totalRounds: 10,
        source: "from Vess the Pale Warden's crit (R2)",
      },
    ],
    note: 'Death saves: 1 success, 1 failure. Stabilize DC 10 Medicine, or any healing brings him up at 1 hp — Seraphine has Lay on Hands 12.',
    abilities: abil([14, 8, 14, 10, 18, 12]),
    actions: [
      {id: 'act-aldous-mace', name: 'Mace', bonusDisplay: '+5', damageDisplay: '1d6+2'},
      {id: 'act-aldous-flame', name: 'Sacred Flame', bonusDisplay: 'DC 15', damageDisplay: '2d8'},
    ],
  },
];

// ---------------------------------------------------------------------------
// ROLL LEDGER — 12 precomputed entries LGR_01..LGR_12 spanning rounds 1–3.
// AGGREGATE CROSS-CHECKS (verified by hand):
//   Seraphine  9 (LGR_03) +  8 (LGR_10) = 17 = 51 − 34  ✓
//   Vess       5 (LGR_02) + 27 (LGR_09) = 32 = 120 − 88 ✓
//   Aldous    11 (LGR_05) + 27 (LGR_07) = 38 = 38 − 0   ✓
//   Sentinel A 14 (LGR_12)              = 14 = 25 − 11  ✓
//   Ghast     13 (LGR_09)               = 13 = 36 − 23  ✓
//   Malachai   6 (LGR_04)               =  6 = 58 − 52  ✓
//   Korrin     5 (LGR_06)               =  5 = 45 − 40  ✓
//   Maevis     4 (LGR_08)               =  4 = 32 − 28  ✓
//   Sentinel B — ZERO entries target C_SENTINEL_B (hp full)               ✓
// Round math: round = 3, active turn = Korrin (R3·T1 already rolled: the
// active turn's rolls exist before End Turn); within each round every actor
// logs at most one action and T-stamps follow initiative-slot order.
// ---------------------------------------------------------------------------

const LGR_01 = 'lgr-01';
const LGR_02 = 'lgr-02';
const LGR_03 = 'lgr-03';
const LGR_04 = 'lgr-04';
const LGR_05 = 'lgr-05';
const LGR_06 = 'lgr-06';
const LGR_07 = 'lgr-07';
const LGR_08 = 'lgr-08';
const LGR_09 = 'lgr-09';
const LGR_10 = 'lgr-10';
const LGR_11 = 'lgr-11';
const LGR_12 = 'lgr-12';

interface DiceTerm {
  label: string; // 'd6: 5' | '+4'
  isDropped?: boolean; // advantage/disadvantage discard — struck through
}

type Verdict = 'HIT' | 'MISS' | 'SAVE' | 'CRIT';

interface LedgerTargetPatch {
  targetId: string;
  targetName: string;
  amount: number;
  hpAfterCurrent: number;
  hpAfterDisplay: string; // '34 / 51'
}

interface LedgerEntry {
  id: string;
  stamp: string; // 'R3·T2' — timestamp in turns, never wall time
  actorId?: string;
  actorName: string;
  terms: DiceTerm[];
  total: number;
  totalDisplay: string; // dual field: '2d6+4 = 12'
  vsAc?: string; // 'vs AC 14' — OMITTED on saves and ability checks
  vsTargetId?: string; // drives the AC-chip → last-roll-against highlight
  verdict?: Verdict;
  targets?: LedgerTargetPatch[]; // damage entries name target + amount
  note?: string; // save detail / death-save line
  isSystem?: boolean; // condition-expiry system lines
  summaryDisplay: string; // pre-composed for the <720 collapsed bar
}

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: LGR_01,
    stamp: 'R1·T1',
    actorId: C_KORRIN,
    actorName: 'Korrin Blackbriar',
    terms: [{label: 'd20: 8'}, {label: '+8'}],
    total: 16,
    totalDisplay: 'd20+8 = 16',
    vsAc: 'vs AC 17',
    vsTargetId: C_VESS,
    verdict: 'MISS',
    summaryDisplay: 'Korrin d20+8 = 16 vs AC 17, miss',
  },
  {
    id: LGR_02,
    stamp: 'R1·T2',
    actorId: C_SERAPHINE,
    actorName: 'Seraphine Vail',
    terms: [{label: 'd8: 1'}, {label: '+4'}],
    total: 5,
    totalDisplay: '1d8+4 = 5',
    vsAc: 'vs AC 17',
    vsTargetId: C_VESS,
    verdict: 'HIT',
    targets: [
      {targetId: C_VESS, targetName: 'Vess the Pale Warden', amount: 5, hpAfterCurrent: 115, hpAfterDisplay: '115 / 120'},
    ],
    summaryDisplay: 'Seraphine 1d8+4 = 5 vs AC 17, hit',
  },
  {
    id: LGR_03,
    stamp: 'R1·T4',
    actorId: C_INQUISITOR,
    actorName: 'Grand Inquisitor Malachai of the Sundered Choir of Vhalen',
    terms: [{label: 'd8: 6'}, {label: '+3'}],
    total: 9,
    totalDisplay: '1d8+3 = 9',
    vsAc: 'vs AC 19',
    vsTargetId: C_SERAPHINE,
    verdict: 'HIT',
    targets: [
      {targetId: C_SERAPHINE, targetName: 'Seraphine Vail', amount: 9, hpAfterCurrent: 42, hpAfterDisplay: '42 / 51'},
    ],
    summaryDisplay: 'Malachai 1d8+3 = 9 vs AC 19, hit',
  },
  {
    id: LGR_04,
    stamp: 'R1·T5',
    actorId: C_MAEVIS,
    actorName: 'Maevis Thornbury',
    terms: [{label: 'd10: 6'}],
    total: 6,
    totalDisplay: '1d10 = 6',
    vsAc: 'vs AC 16',
    vsTargetId: C_INQUISITOR,
    verdict: 'HIT',
    targets: [
      {
        targetId: C_INQUISITOR,
        targetName: 'Grand Inquisitor Malachai of the Sundered Choir of Vhalen',
        amount: 6,
        hpAfterCurrent: 52,
        hpAfterDisplay: '52 / 58',
      },
    ],
    summaryDisplay: 'Maevis 1d10 = 6 vs AC 16, hit',
  },
  {
    id: LGR_05,
    stamp: 'R1·T6',
    actorId: C_GHAST,
    actorName: 'Ghast of Hollowmere',
    terms: [{label: 'd6: 4'}, {label: 'd6: 5'}, {label: '+2'}],
    total: 11,
    totalDisplay: '2d6+2 = 11',
    vsAc: 'vs AC 16',
    vsTargetId: C_ALDOUS,
    verdict: 'HIT',
    targets: [
      {targetId: C_ALDOUS, targetName: 'Brother Aldous Penn', amount: 11, hpAfterCurrent: 27, hpAfterDisplay: '27 / 38'},
    ],
    summaryDisplay: 'Ghast 2d6+2 = 11 vs AC 16, hit',
  },
  {
    id: LGR_06,
    stamp: 'R1·T7',
    actorId: C_SENTINEL_A,
    actorName: 'Bone Sentinel A',
    terms: [{label: 'd6: 3'}, {label: '+2'}],
    total: 5,
    totalDisplay: '1d6+2 = 5',
    vsAc: 'vs AC 15',
    vsTargetId: C_KORRIN,
    verdict: 'HIT',
    targets: [
      {targetId: C_KORRIN, targetName: 'Korrin Blackbriar', amount: 5, hpAfterCurrent: 40, hpAfterDisplay: '40 / 45'},
    ],
    summaryDisplay: 'Sentinel A 1d6+2 = 5 vs AC 15, hit',
  },
  {
    id: LGR_07,
    stamp: 'R2·T3',
    actorId: C_VESS,
    actorName: 'Vess the Pale Warden',
    terms: [{label: 'd10: 8'}, {label: 'd10: 7'}, {label: 'd10: 6'}, {label: '+6'}],
    total: 27,
    totalDisplay: '3d10+6 = 27 (crit)',
    vsAc: 'vs AC 16',
    vsTargetId: C_ALDOUS,
    verdict: 'CRIT',
    targets: [
      {targetId: C_ALDOUS, targetName: 'Brother Aldous Penn', amount: 27, hpAfterCurrent: 0, hpAfterDisplay: '0 / 38'},
    ],
    summaryDisplay: 'Vess 3d10+6 = 27 vs AC 16, crit',
  },
  {
    id: LGR_08,
    stamp: 'R2·T4',
    actorId: C_INQUISITOR,
    actorName: 'Grand Inquisitor Malachai of the Sundered Choir of Vhalen',
    terms: [{label: 'd8: 1'}, {label: '+3'}],
    total: 4,
    totalDisplay: '1d8+3 = 4',
    vsAc: 'vs AC 12',
    vsTargetId: C_MAEVIS,
    verdict: 'HIT',
    targets: [
      {targetId: C_MAEVIS, targetName: 'Maevis Thornbury', amount: 4, hpAfterCurrent: 28, hpAfterDisplay: '28 / 32'},
    ],
    summaryDisplay: 'Malachai 1d8+3 = 4 vs AC 12, hit',
  },
  {
    // Stress fixture: 8 term chips wrap-test the flex-1 chip lane; the
    // vs-AC segment is OMITTED (save entry). NOTE — deviation from the spec
    // sample text: the spec's own HP cross-checks (Sentinel A at 11/25 =
    // 14 total damage) cannot absorb a 27-point failed save, so the failed
    // target here is Vess (27) and the saved target is the Ghast (13);
    // both figures land exactly on their HP-delta cross-checks above.
    id: LGR_09,
    stamp: 'R2·T5',
    actorId: C_MAEVIS,
    actorName: 'Maevis Thornbury',
    terms: [
      {label: 'd6: 6'},
      {label: 'd6: 5'},
      {label: 'd6: 4'},
      {label: 'd6: 4'},
      {label: 'd6: 3'},
      {label: 'd6: 2'},
      {label: 'd6: 2'},
      {label: 'd6: 1'},
    ],
    total: 27,
    totalDisplay: '8d6 = 27',
    verdict: 'SAVE',
    note: 'Fireball — DEX save DC 15: Vess the Pale Warden failed (27), Ghast of Hollowmere saved (13).',
    targets: [
      {targetId: C_VESS, targetName: 'Vess the Pale Warden', amount: 27, hpAfterCurrent: 88, hpAfterDisplay: '88 / 120'},
      {targetId: C_GHAST, targetName: 'Ghast of Hollowmere', amount: 13, hpAfterCurrent: 23, hpAfterDisplay: '23 / 36'},
    ],
    summaryDisplay: 'Maevis 8d6 = 27, DEX save DC 15',
  },
  {
    id: LGR_10,
    stamp: 'R2·T6',
    actorId: C_GHAST,
    actorName: 'Ghast of Hollowmere',
    terms: [{label: 'd6: 3'}, {label: 'd6: 3'}, {label: '+2'}],
    total: 8,
    totalDisplay: '2d6+2 = 8',
    vsAc: 'vs AC 19',
    vsTargetId: C_SERAPHINE,
    verdict: 'HIT',
    targets: [
      {targetId: C_SERAPHINE, targetName: 'Seraphine Vail', amount: 8, hpAfterCurrent: 34, hpAfterDisplay: '34 / 51'},
    ],
    summaryDisplay: 'Ghast 2d6+2 = 8 vs AC 19, hit',
  },
  {
    // Stress fixture: advantage — 'd20: 8' struck through (dropped),
    // 'd20: 17' kept.
    id: LGR_11,
    stamp: 'R3·T1',
    actorId: C_KORRIN,
    actorName: 'Korrin Blackbriar',
    terms: [{label: 'd20: 8', isDropped: true}, {label: 'd20: 17'}, {label: '+8'}],
    total: 25,
    totalDisplay: 'd20+8 = 25 (adv)',
    vsAc: 'vs AC 14',
    vsTargetId: C_SENTINEL_A,
    verdict: 'HIT',
    summaryDisplay: 'Korrin d20+8 = 25 vs AC 14, hit',
  },
  {
    id: LGR_12,
    stamp: 'R3·T1',
    actorId: C_KORRIN,
    actorName: 'Korrin Blackbriar',
    terms: [{label: 'd6: 6'}, {label: 'd6: 4'}, {label: '+4'}],
    total: 14,
    totalDisplay: '2d6+4 = 14',
    vsAc: 'vs AC 14',
    vsTargetId: C_SENTINEL_A,
    verdict: 'HIT',
    targets: [
      {targetId: C_SENTINEL_A, targetName: 'Bone Sentinel A', amount: 14, hpAfterCurrent: 11, hpAfterDisplay: '11 / 25'},
    ],
    summaryDisplay: 'Korrin 2d6+4 = 14 vs AC 14, hit → Bone Sentinel A 11/25',
  },
];

// ---------------------------------------------------------------------------
// SCRIPTED TURNS — turn advancement is scripted, not random. Each End Turn
// pops the next entry via a pointer; the outgoing combatant's conditions
// each lose one round (0 → pop + system ledger line), the incoming
// combatant's pre-rolled ledger entries append (damage patches drive HP
// everywhere), and the caret/aside follow. 8 turns (spec said 6 — extended
// by two so the sequence reaches the R3→R4 wrap and the round pill's
// observable increment; scripts assume Vess stays on the hold rail).
// ---------------------------------------------------------------------------

interface ScriptedTurn {
  outgoingId: string;
  /** Conditions expected to hit 0 on this advance — cross-check against
   * the decrement logic; drives the expiry system lines + toast. */
  expiringConditionIds: string[];
  newLedgerEntries: LedgerEntry[];
  incomingId: string;
  wrapsRound?: boolean;
}

const SCRIPTED_TURNS: ScriptedTurn[] = [
  {
    outgoingId: C_KORRIN,
    expiringConditionIds: [],
    incomingId: C_SERAPHINE,
    newLedgerEntries: [
      {
        id: 'lgr-13',
        stamp: 'R3·T2',
        actorId: C_SERAPHINE,
        actorName: 'Seraphine Vail',
        terms: [{label: 'd8: 7'}, {label: '+4'}],
        total: 11,
        totalDisplay: '1d8+4 = 11',
        vsAc: 'vs AC 17',
        vsTargetId: C_VESS,
        verdict: 'HIT',
        targets: [
          {targetId: C_VESS, targetName: 'Vess the Pale Warden', amount: 11, hpAfterCurrent: 77, hpAfterDisplay: '77 / 120'},
        ],
        summaryDisplay: 'Seraphine 1d8+4 = 11 vs AC 17, hit',
      },
    ],
  },
  {
    outgoingId: C_SERAPHINE, // poisoned 2 → 1 (ring loses a segment)
    expiringConditionIds: [],
    incomingId: C_INQUISITOR,
    newLedgerEntries: [
      {
        id: 'lgr-14',
        stamp: 'R3·T3',
        actorId: C_INQUISITOR,
        actorName: 'Grand Inquisitor Malachai of the Sundered Choir of Vhalen',
        terms: [{label: 'd8: 4'}, {label: '+3'}],
        total: 7,
        totalDisplay: '1d8+3 = 7',
        vsAc: 'vs AC 19',
        vsTargetId: C_SERAPHINE,
        verdict: 'HIT',
        targets: [
          {targetId: C_SERAPHINE, targetName: 'Seraphine Vail', amount: 7, hpAfterCurrent: 27, hpAfterDisplay: '27 / 51'},
        ],
        summaryDisplay: 'Malachai 1d8+3 = 7 vs AC 19, hit',
      },
    ],
  },
  {
    outgoingId: C_INQUISITOR,
    expiringConditionIds: [],
    incomingId: C_MAEVIS,
    newLedgerEntries: [
      {
        id: 'lgr-15',
        stamp: 'R3·T4',
        actorId: C_MAEVIS,
        actorName: 'Maevis Thornbury',
        terms: [{label: 'd10: 9'}],
        total: 9,
        totalDisplay: '1d10 = 9',
        vsAc: 'vs AC 14',
        vsTargetId: C_SENTINEL_A,
        verdict: 'HIT',
        targets: [
          {targetId: C_SENTINEL_A, targetName: 'Bone Sentinel A', amount: 9, hpAfterCurrent: 2, hpAfterDisplay: '2 / 25'},
        ],
        summaryDisplay: 'Maevis 1d10 = 9 vs AC 14, hit',
      },
    ],
  },
  {
    outgoingId: C_MAEVIS, // concentration 3 → 2
    expiringConditionIds: [],
    incomingId: C_GHAST,
    newLedgerEntries: [
      {
        id: 'lgr-16',
        stamp: 'R3·T5',
        actorId: C_GHAST,
        actorName: 'Ghast of Hollowmere',
        terms: [{label: 'd6: 2'}, {label: 'd6: 1'}, {label: '+2'}],
        total: 5,
        totalDisplay: '2d6+2 = 5',
        vsAc: 'vs AC 15',
        vsTargetId: C_KORRIN,
        verdict: 'MISS',
        summaryDisplay: 'Ghast 2d6+2 = 5 vs AC 15, miss',
      },
    ],
  },
  {
    // Ghast's five rings each lose a segment; prone 1→0 and burning 1→0
    // pop off the cluster and post system expiry lines + the pinned toast.
    outgoingId: C_GHAST,
    expiringConditionIds: [COND_G_PRONE, COND_G_BURNING],
    incomingId: C_SENTINEL_A,
    newLedgerEntries: [
      {
        id: 'lgr-17',
        stamp: 'R3·T6',
        actorId: C_SENTINEL_A,
        actorName: 'Bone Sentinel A',
        terms: [{label: 'd6: 4'}, {label: '+2'}],
        total: 6,
        totalDisplay: '1d6+2 = 6',
        vsAc: 'vs AC 19',
        vsTargetId: C_SERAPHINE,
        verdict: 'MISS',
        summaryDisplay: 'Sentinel A 1d6+2 = 6 vs AC 19, miss',
      },
    ],
  },
  {
    outgoingId: C_SENTINEL_A,
    expiringConditionIds: [],
    incomingId: C_SENTINEL_B,
    newLedgerEntries: [
      {
        id: 'lgr-18',
        stamp: 'R3·T7',
        actorId: C_SENTINEL_B,
        actorName: 'Bone Sentinel B',
        terms: [{label: 'd6: 5'}, {label: '+2'}],
        total: 7,
        totalDisplay: '1d6+2 = 7',
        vsAc: 'vs AC 15',
        vsTargetId: C_KORRIN,
        verdict: 'HIT',
        targets: [
          {targetId: C_KORRIN, targetName: 'Korrin Blackbriar', amount: 7, hpAfterCurrent: 33, hpAfterDisplay: '33 / 45'},
        ],
        summaryDisplay: 'Sentinel B 1d6+2 = 7 vs AC 15, hit',
      },
    ],
  },
  {
    outgoingId: C_SENTINEL_B,
    expiringConditionIds: [],
    incomingId: C_ALDOUS,
    newLedgerEntries: [
      {
        id: 'lgr-19',
        stamp: 'R3·T8',
        actorId: C_ALDOUS,
        actorName: 'Brother Aldous Penn',
        terms: [{label: 'd20: 14'}],
        total: 14,
        totalDisplay: 'd20 = 14',
        verdict: 'SAVE',
        note: 'Death save — success (2 of 3). One more stabilizes him.',
        summaryDisplay: 'Aldous d20 = 14, death save success',
      },
    ],
  },
  {
    // Wrap: Aldous is the last on-track slot, so the incoming turn starts
    // Round 4 — the header pill increments (observable consequence #6).
    outgoingId: C_ALDOUS, // unconscious ring 10 → 9
    expiringConditionIds: [],
    incomingId: C_KORRIN,
    wrapsRound: true,
    newLedgerEntries: [
      {
        id: 'lgr-20',
        stamp: 'R4·T1',
        actorId: C_KORRIN,
        actorName: 'Korrin Blackbriar',
        terms: [{label: 'd20: 12', isDropped: true}, {label: 'd20: 19'}, {label: '+8'}],
        total: 27,
        totalDisplay: 'd20+8 = 27 (adv)',
        vsAc: 'vs AC 14',
        vsTargetId: C_SENTINEL_A,
        verdict: 'HIT',
        summaryDisplay: 'Korrin d20+8 = 27 vs AC 14, hit',
      },
      {
        id: 'lgr-21',
        stamp: 'R4·T1',
        actorId: C_KORRIN,
        actorName: 'Korrin Blackbriar',
        terms: [{label: 'd6: 3'}, {label: 'd6: 2'}, {label: '+4'}],
        total: 9,
        totalDisplay: '2d6+4 = 9',
        vsAc: 'vs AC 14',
        vsTargetId: C_SENTINEL_A,
        verdict: 'HIT',
        targets: [
          {targetId: C_SENTINEL_A, targetName: 'Bone Sentinel A', amount: 9, hpAfterCurrent: 0, hpAfterDisplay: '0 / 25'},
        ],
        summaryDisplay: 'Korrin 2d6+4 = 9 vs AC 14, hit → Bone Sentinel A slain',
      },
    ],
  },
];

// On-track initiative order at load (Vess DELAYED — hold rail, not here).
const INITIAL_ORDER: string[] = [
  C_KORRIN,
  C_SERAPHINE,
  C_INQUISITOR,
  C_MAEVIS,
  C_GHAST,
  C_SENTINEL_A,
  C_SENTINEL_B,
  C_ALDOUS,
];

const CONDITION_META: Record<ConditionKind, {icon: typeof DropletIcon; color: string}> = {
  poisoned: {icon: DropletIcon, color: HP_OK},
  prone: {icon: ArrowDownIcon, color: 'var(--color-text-secondary)'},
  concentration: {icon: EyeIcon, color: SAVE_BLUE},
  unconscious: {icon: MoonIcon, color: HP_DANGER},
  restrained: {icon: LinkIcon, color: COND_PURPLE},
  burning: {icon: FlameIcon, color: HP_WARN},
  frightened: {icon: GhostIcon, color: COND_TEAL},
};

/** Short display names for ledger consequence segments ('→ Seraphine
 * 34/51') — first names, except where the first word is a title. */
const SHORT_NAME: Record<string, string> = {
  [C_SERAPHINE]: 'Seraphine',
  [C_KORRIN]: 'Korrin',
  [C_MAEVIS]: 'Maevis',
  [C_ALDOUS]: 'Aldous',
  [C_VESS]: 'Vess',
  [C_GHAST]: 'Ghast',
  [C_SENTINEL_A]: 'Sentinel A',
  [C_SENTINEL_B]: 'Sentinel B',
  [C_INQUISITOR]: 'Malachai',
};

// Text-on-row variant of HP_OK: as 11px ledger text, HP_OK's light half
// #0B991F measures 3.76:1 on the white row — below 4.5:1 AA. #0B7F1B ≈ 5.5:1
// on white; dark half unchanged (#34C759 ≈ 8.9:1 on #1E1E1E). Fill/ring uses
// of HP_OK are unaffected.
const HP_OK_TEXT = 'light-dark(#0B7F1B, #34C759)';

const VERDICT_COLOR: Record<Verdict, string> = {
  HIT: HP_OK_TEXT,
  MISS: 'var(--color-text-secondary)',
  SAVE: SAVE_BLUE,
  // Quarantine rule: CRIT is the only verdict that would want the brand
  // hue — it uses the danger token instead, keeping EMBER out of text.
  CRIT: HP_DANGER,
};

function hpColor(current: number, max: number): string {
  const ratio = current / max;
  if (ratio >= 0.5) return HP_OK;
  if (ratio >= 0.25) return HP_WARN;
  return HP_DANGER;
}

/** Down = at 0 hp: party members are unconscious, foes are slain. Both
 * render at 40% opacity with the skull glyph. */
function isDown(c: Combatant): boolean {
  return c.hpCurrent === 0;
}

// ---------------------------------------------------------------------------
// HOOKS
// ---------------------------------------------------------------------------

/** Measured container width — the demo stage renders this page in a
 * ~1045–1075px container inside a 1440px window, so viewport queries lie;
 * every responsive band keys off this instead (0 = pre-observer frame). */
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
// TorchwardMark — regular hexagon with three inner facets from the top
// vertex; the lower-left facet fills EMBER (the lit torch face). This and
// the active-turn caret/outline are the ONLY consumers of the brand literal.
// ---------------------------------------------------------------------------

function TorchwardMark({size = 20}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <polygon points="12,2 3,7 3,17" fill={EMBER} />
      <polygon
        points="12,2 21,7 21,17 12,22 3,17 3,7"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path d="M12 2 L3 17 M12 2 L12 22 M12 2 L21 17" stroke="currentColor" strokeWidth={1.5} fill="none" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ConditionTokenCluster — 24px hexes whose OUTLINE encodes duration as
// geometry: pathLength normalizes the hex perimeter to 60 units, split into
// totalRounds equal segments; remainingRounds render at full 2px stroke,
// depleted segments at 20% opacity. Max 4 hexes then a '+N' hex.
// ---------------------------------------------------------------------------

const HEX_POINTS = '12,2 20.66,7 20.66,17 12,22 3.34,17 3.34,7';
const HEX_PERIMETER = 60; // normalized via pathLength

function conditionAriaLabel(c: Condition): string {
  return \`\${c.name}, \${c.remainingRounds} of \${c.totalRounds} rounds remaining\`;
}

function ConditionHexGlyph({condition}: {condition: Condition}) {
  const meta = CONDITION_META[condition.kind];
  const seg = HEX_PERIMETER / condition.totalRounds;
  const gap = condition.totalRounds > 1 ? 1.5 : 0;
  // Remaining segments at full stroke, then one giant gap to suppress the
  // dash-pattern repeat past the depleted arc.
  const remainingDash =
    condition.remainingRounds > 0
      ? \`\${Array.from({length: condition.remainingRounds}, () => \`\${seg - gap} \${gap}\`).join(' ')} 0 \${HEX_PERIMETER}\`
      : undefined;
  return (
    <span style={{position: 'relative', width: 24, height: 24, display: 'inline-flex'}}>
      <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden focusable="false">
        <polygon points={HEX_POINTS} fill="var(--color-background-card)" stroke="none" />
        <polygon
          points={HEX_POINTS}
          fill="none"
          stroke={meta.color}
          strokeWidth={2}
          opacity={0.2}
          pathLength={HEX_PERIMETER}
          strokeDasharray={\`\${seg - gap} \${gap}\`}
        />
        {remainingDash != null ? (
          <polygon
            points={HEX_POINTS}
            fill="none"
            stroke={meta.color}
            strokeWidth={2}
            pathLength={HEX_PERIMETER}
            strokeDasharray={remainingDash}
          />
        ) : null}
      </svg>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: meta.color,
        }}
        aria-hidden>
        <Icon icon={meta.icon} size="xsm" color="inherit" />
      </span>
    </span>
  );
}

interface ConditionClusterProps {
  combatant: Combatant;
  onRemove: (conditionId: string) => void;
}

function ConditionTokenCluster({combatant, onRemove}: ConditionClusterProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const conditions = combatant.conditions;
  if (conditions.length === 0) {
    // Omit-when-empty: no placeholder segment (Aldous pre-crit had none).
    return null;
  }
  const visible = conditions.slice(0, 4);
  const overflow = conditions.length - visible.length;
  return (
    <span style={styles.clusterWrap}>
      {visible.map((condition, i) => (
        <Popover
          key={condition.id}
          isOpen={openId === condition.id}
          onOpenChange={isOpen => setOpenId(isOpen ? condition.id : null)}
          label={condition.name}
          placement="below"
          content={
            <div style={styles.popoverBody}>
              <HStack gap={2} vAlign="center">
                <ConditionHexGlyph condition={condition} />
                <Text type="label" size="sm">
                  {condition.name}
                </Text>
              </HStack>
              <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                {condition.remainingRounds} of {condition.totalRounds} rounds remaining, {condition.source}
              </Text>
              <Button
                label="Remove"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setOpenId(null);
                  onRemove(condition.id);
                }}
              />
            </div>
          }>
          <button
            type="button"
            className="tet-focusable"
            style={{...styles.hexBtn, marginLeft: i > 0 ? -8 : 0, zIndex: visible.length - i}}
            aria-label={conditionAriaLabel(condition)}
            onClick={event => event.stopPropagation()}>
            <ConditionHexGlyph condition={condition} />
          </button>
        </Popover>
      ))}
      {overflow > 0 ? (
        <Tooltip
          content={conditions
            .slice(4)
            .map(c => conditionAriaLabel(c))
            .join(' · ')}>
          <span style={{...styles.hexOverflow, marginLeft: -8}}>
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              aria-hidden
              focusable="false"
              style={{position: 'absolute'}}>
              <polygon
                points={HEX_POINTS}
                fill="var(--color-background-muted)"
                stroke="var(--color-border)"
                strokeWidth={1.5}
              />
            </svg>
            <span style={{position: 'relative'}}>+{overflow}</span>
          </span>
        </Tooltip>
      ) : null}
    </span>
  );
}

// ---------------------------------------------------------------------------
// HPBar — 120x6 track, threshold-colored fill, adjacent dual-display label.
// Clicking it opens the Apply Damage popover (every property an affordance).
// ---------------------------------------------------------------------------

interface DamageFormProps {
  combatant: Combatant;
  onApply: (id: string, amount: number) => void;
  onClose: () => void;
}

function DamageForm({combatant, onApply, onClose}: DamageFormProps) {
  const [amount, setAmount] = useState<number>(7);
  return (
    <div style={styles.popoverBody}>
      <Text type="label" size="sm">
        Apply damage — {combatant.name}
      </Text>
      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
        {combatant.hpDisplay} hp now
      </Text>
      <NumberInput label="Damage" value={amount} onChange={v => setAmount(v ?? 0)} min={0} max={99} step={1} />
      <HStack gap={2}>
        <Button
          label="Apply"
          variant="primary"
          size="sm"
          onClick={() => {
            onApply(combatant.id, amount);
            onClose();
          }}
        />
        <Button label="Cancel" variant="ghost" size="sm" onClick={onClose} />
      </HStack>
    </div>
  );
}

interface HPBarProps {
  combatant: Combatant;
  onApplyDamage: (id: string, amount: number) => void;
}

function HPBar({combatant, onApplyDamage}: HPBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const color = hpColor(combatant.hpCurrent, combatant.hpMax);
  const pct = Math.round((combatant.hpCurrent / combatant.hpMax) * 100);
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      label={\`Apply damage to \${combatant.name}\`}
      placement="below"
      content={<DamageForm combatant={combatant} onApply={onApplyDamage} onClose={() => setIsOpen(false)} />}>
      <button
        type="button"
        className="tet-focusable"
        style={styles.hpWrap}
        aria-label={\`\${combatant.name}: \${combatant.hpDisplay} hit points. Apply damage\`}
        onClick={event => event.stopPropagation()}>
        <span style={styles.hpTrack} aria-hidden>
          <span className="tet-fade" style={{...styles.hpFill, width: \`\${pct}%\`, backgroundColor: color, display: 'block'}} />
        </span>
        <span style={styles.hpLabel} aria-hidden>
          {combatant.hpDisplay}
        </span>
      </button>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// InitiativeRibbon — 72px rail: 24px upper hold-rail (delayed tokens, dashed,
// 'HOLD') + 48px main track (56x56 tokens, 40x40 condensed; 3px HP strip;
// EMBER outline + sliding caret on the active token; round tick + pill after
// the last slot). Tokens are listbox options; arrows move focus.
// ---------------------------------------------------------------------------

interface InitiativeRibbonProps {
  combatants: Combatant[];
  orderIds: string[];
  delayedIds: string[];
  activeId: string;
  selectedId: string;
  round: number;
  condensed: boolean;
  onSelect: (id: string) => void;
  onReenter: (id: string) => void;
}

function InitiativeRibbon(props: InitiativeRibbonProps) {
  const {combatants, orderIds, delayedIds, activeId, selectedId, round, condensed, onSelect, onReenter} = props;
  const [holdOpenId, setHoldOpenId] = useState<string | null>(null);
  const byId = useMemo(() => new Map(combatants.map(c => [c.id, c])), [combatants]);
  const tokenRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const size = condensed ? 40 : 56;
  const holdSize = condensed ? 32 : 40;
  const activeIndex = orderIds.indexOf(activeId);
  const caretX = GUTTER + activeIndex * (size + GUTTER) + size / 2 - 6;

  const moveFocus = (delta: number) => {
    const focused = orderIds.findIndex(id => tokenRefs.current.get(id) === document.activeElement);
    const from = focused >= 0 ? focused : activeIndex;
    const next = Math.min(orderIds.length - 1, Math.max(0, from + delta));
    tokenRefs.current.get(orderIds[next])?.focus();
  };

  return (
    <div style={styles.ribbon}>
      {/* Hold rail — delayed combatants parked above the track. */}
      {delayedIds.length > 0 ? (
        <div
          role="group"
          aria-label="Delayed combatants"
          style={{
            position: 'absolute',
            top: GUTTER / 3,
            right: GUTTER,
            display: 'flex',
            gap: GUTTER,
            zIndex: 2,
          }}>
          {delayedIds.map(id => {
            const c = byId.get(id);
            if (c == null) return null;
            return (
              <Popover
                key={id}
                isOpen={holdOpenId === id}
                onOpenChange={isOpen => setHoldOpenId(isOpen ? id : null)}
                label={\`\${c.name} — delayed\`}
                placement="below"
                alignment="end"
                content={
                  <div style={styles.popoverBody}>
                    <Text type="label" size="sm">
                      {c.name} is holding
                    </Text>
                    <Text type="supporting" size="xsm" color="secondary">
                      {c.note}
                    </Text>
                    <Button
                      label="Re-enter at current turn"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setHoldOpenId(null);
                        onReenter(id);
                      }}
                    />
                  </div>
                }>
                <button
                  type="button"
                  className="tet-focusable"
                  style={{...styles.holdToken, width: holdSize, height: holdSize}}
                  aria-label={\`\${c.name}, delayed — re-enter options\`}>
                  <span style={{fontSize: condensed ? 11 : 13, fontWeight: 600, lineHeight: 1}} aria-hidden>
                    {c.monogram}
                  </span>
                  <span style={styles.holdLabel} aria-hidden>
                    HOLD
                  </span>
                </button>
              </Popover>
            );
          })}
        </div>
      ) : null}
      <div
        role="listbox"
        aria-label={\`Initiative order, round \${round}\`}
        aria-activedescendant={\`tet-token-\${activeId}\`}
        style={styles.ribbonTrack}
        onKeyDown={event => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            moveFocus(1);
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            moveFocus(-1);
          }
        }}>
        {orderIds.map(id => {
          const c = byId.get(id);
          if (c == null) return null;
          const down = isDown(c);
          const active = id === activeId;
          return (
            <button
              key={id}
              id={\`tet-token-\${id}\`}
              ref={el => {
                if (el != null) tokenRefs.current.set(id, el);
                else tokenRefs.current.delete(id);
              }}
              type="button"
              role="option"
              aria-selected={id === selectedId}
              aria-current={active ? 'true' : undefined}
              aria-label={\`\${c.name}, \${c.hpDisplay} hp, initiative \${c.initiative}\${down ? ', down' : ''}\${active ? ', active turn' : ''}\`}
              className="tet-focusable tet-fade"
              onClick={() => onSelect(id)}
              style={{
                ...styles.ribbonToken,
                width: size,
                height: size,
                opacity: down ? 0.4 : 1,
                boxShadow: active ? \`0 0 0 2px \${EMBER}\` : undefined,
              }}>
              {down ? (
                <Icon icon={SkullIcon} size={condensed ? 'sm' : 'md'} color="secondary" />
              ) : (
                <span
                  style={condensed ? {...styles.ribbonMonogram, ...styles.ribbonMonogramCondensed} : styles.ribbonMonogram}
                  aria-hidden>
                  {c.monogram}
                </span>
              )}
              <span
                style={{
                  ...styles.hpStrip,
                  backgroundColor: 'var(--color-background-muted)',
                }}
                aria-hidden>
                <span
                  className="tet-fade"
                  style={{
                    display: 'block',
                    height: '100%',
                    width: \`\${Math.round((c.hpCurrent / c.hpMax) * 100)}%\`,
                    backgroundColor: hpColor(c.hpCurrent, c.hpMax),
                  }}
                />
              </span>
            </button>
          );
        })}
        {/* Round divider tick after the last slot. */}
        <div style={{...styles.roundTick, height: size}} aria-hidden />
        <span style={styles.roundTickPill} aria-hidden>
          {condensed ? \`R\${round + 1}\` : \`R\${round}→R\${round + 1}\`}
        </span>
      </div>
      {/* 12x8 caret slides under the active token (transform-only; frozen
          under prefers-reduced-motion via the injected CSS). */}
      <div className="tet-caret" style={{...styles.caret, transform: \`translateX(\${caretX}px)\`}} aria-hidden />
    </div>
  );
}

// ---------------------------------------------------------------------------
// RollLedgerRow — 40px dense composite row with omit-when-undefined segments:
// [72px turn stamp][140px actor][flex chip lane: per-die chips, struck
// dropped dice, modifier, '=', bold total][vs-AC — absent on saves][60px
// verdict][→ consequence button linking roll to HP state].
// ---------------------------------------------------------------------------

interface RollLedgerRowProps {
  entry: LedgerEntry;
  isHighlighted: boolean;
  onSelectCombatant: (id: string) => void;
}

function RollLedgerRow({entry, isHighlighted, onSelectCombatant}: RollLedgerRowProps) {
  if (entry.isSystem) {
    return (
      <div id={\`tet-lgr-\${entry.id}\`} style={styles.systemRow}>
        <span style={styles.stampCell}>{entry.stamp}</span>
        <Icon icon={MoonIcon} size="xsm" color="secondary" />
        <Text type="supporting" size="xsm" color="secondary">
          {entry.note}
        </Text>
      </div>
    );
  }
  const modTerms = entry.terms.filter(t => t.label.startsWith('+') || t.label.startsWith('−'));
  const diceTerms = entry.terms.filter(t => !modTerms.includes(t));
  return (
    <div
      id={\`tet-lgr-\${entry.id}\`}
      style={isHighlighted ? {...styles.ledgerRow, ...styles.ledgerRowHighlight} : styles.ledgerRow}>
      <span style={styles.stampCell}>{entry.stamp}</span>
      <span style={styles.actorCell} title={entry.actorName}>
        {entry.actorName}
      </span>
      <span style={styles.chipLane}>
        {diceTerms.map((term, i) => (
          <span
            key={\`\${entry.id}-t\${i}\`}
            style={term.isDropped ? {...styles.chip, ...styles.chipDropped} : styles.chip}
            aria-label={term.isDropped ? \`\${term.label}, dropped\` : term.label}>
            {term.label}
          </span>
        ))}
        {modTerms.map((term, i) => (
          <span key={\`\${entry.id}-m\${i}\`} style={styles.chip}>
            {term.label}
          </span>
        ))}
        <span style={styles.eqGlyph} aria-hidden>
          =
        </span>
        <span style={{...styles.chip, ...styles.chipTotal}} aria-label={\`total \${entry.total}\`}>
          {entry.total}
        </span>
        {entry.note != null ? (
          <Text type="supporting" size="xsm" color="secondary">
            {entry.note}
          </Text>
        ) : null}
        {entry.targets?.map(t => (
          <button
            key={\`\${entry.id}-\${t.targetId}\`}
            type="button"
            className="tet-focusable"
            style={styles.consequenceBtn}
            onClick={() => onSelectCombatant(t.targetId)}
            aria-label={\`\${t.amount} damage to \${t.targetName}, now \${t.hpAfterDisplay}. View combatant\`}>
            → {SHORT_NAME[t.targetId] ?? t.targetName} {t.hpAfterCurrent}/{t.hpAfterDisplay.split(' / ')[1]}
          </button>
        ))}
      </span>
      {entry.vsAc != null ? <span style={styles.vsSeg}>{entry.vsAc}</span> : null}
      {entry.verdict != null ? (
        <span style={{...styles.verdictCell, color: VERDICT_COLOR[entry.verdict]}}>{entry.verdict}</span>
      ) : (
        <span style={styles.verdictCell} aria-hidden />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatblockAside — 380px working detail pane: 64px identity header with AC
// shield chip, 6-column ability grid (44px cells, dual score+mod fields),
// 44px action rows reusing the ledger chip record, active conditions with
// Remove, the GM note, and the Apply Damage / Add Condition footer.
// ---------------------------------------------------------------------------

const CONDITION_OPTIONS: {value: ConditionKind; label: string}[] = [
  {value: 'poisoned', label: 'Poisoned'},
  {value: 'prone', label: 'Prone'},
  {value: 'restrained', label: 'Restrained'},
  {value: 'burning', label: 'Burning'},
  {value: 'frightened', label: 'Frightened'},
];

interface AddConditionFormProps {
  combatant: Combatant;
  onAdd: (id: string, kind: ConditionKind, rounds: number) => void;
  onClose: () => void;
}

function AddConditionForm({combatant, onAdd, onClose}: AddConditionFormProps) {
  const [kind, setKind] = useState<ConditionKind>('poisoned');
  const [rounds, setRounds] = useState<number>(3);
  return (
    <div style={styles.popoverBody}>
      <Text type="label" size="sm">
        Add condition — {combatant.name}
      </Text>
      <Selector
        label="Condition"
        size="sm"
        options={CONDITION_OPTIONS}
        value={kind}
        onChange={value => setKind(value as ConditionKind)}
      />
      <NumberInput label="Rounds" value={rounds} onChange={v => setRounds(v ?? 1)} min={1} max={10} step={1} />
      <HStack gap={2}>
        <Button
          label="Add"
          variant="primary"
          size="sm"
          onClick={() => {
            onAdd(combatant.id, kind, rounds);
            onClose();
          }}
        />
        <Button label="Cancel" variant="ghost" size="sm" onClick={onClose} />
      </HStack>
    </div>
  );
}

interface StatblockContentProps {
  combatant: Combatant;
  onApplyDamage: (id: string, amount: number) => void;
  onAddCondition: (id: string, kind: ConditionKind, rounds: number) => void;
  onRemoveCondition: (combatantId: string, conditionId: string) => void;
  onHighlightAc: (id: string) => void;
}

function StatblockContent(props: StatblockContentProps) {
  const {combatant, onApplyDamage, onAddCondition, onRemoveCondition, onHighlightAc} = props;
  const [isDamageOpen, setIsDamageOpen] = useState(false);
  const [isConditionOpen, setIsConditionOpen] = useState(false);
  return (
    <div>
      <div style={styles.asideHeader}>
        <span style={styles.asideMonogram} aria-hidden>
          {isDown(combatant) ? <Icon icon={SkullIcon} size="sm" color="secondary" /> : combatant.monogram}
        </span>
        <VStack gap={0} style={{minWidth: 0}}>
          <Heading level={2} style={{fontSize: 15, lineHeight: '18px'}}>
            {combatant.name}
          </Heading>
          <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
            {combatant.classLine} · {combatant.kind === 'party' ? 'Party' : 'Foe'} · init {combatant.initiativeDisplay}
          </Text>
        </VStack>
        <Tooltip content="Highlight the last roll against this AC in the ledger">
          <button
            type="button"
            className="tet-focusable"
            style={{...styles.acShield, cursor: 'pointer', backgroundColor: 'var(--color-background-muted)'}}
            onClick={() => onHighlightAc(combatant.id)}
            aria-label={\`Armor class \${combatant.ac}. Highlight the last roll against it\`}>
            <Icon icon={ShieldIcon} size="xsm" color="secondary" />
            {combatant.ac}
          </button>
        </Tooltip>
      </div>
      <div style={styles.abilityGrid} role="list" aria-label="Ability scores">
        {combatant.abilities.map((a, i) => (
          <div key={a.key} role="listitem" style={i === 5 ? {...styles.abilityCell, borderRight: 'none'} : styles.abilityCell}>
            <span style={styles.abilityKey}>{a.key}</span>
            <span style={styles.abilityScore}>{a.score}</span>
            <span style={styles.abilityMod}>{a.modDisplay}</span>
          </div>
        ))}
      </div>
      <div role="list" aria-label="Actions">
        {combatant.actions.map(action => (
          <div key={action.id} role="listitem" style={styles.actionRow}>
            <Icon icon={SwordsIcon} size="xsm" color="secondary" />
            <Text type="label" size="sm" maxLines={1}>
              {action.name}
            </Text>
            <span style={{marginLeft: 'auto', display: 'inline-flex', gap: GUTTER / 3, flexShrink: 0}}>
              <span style={styles.chip}>{action.bonusDisplay}</span>
              <span style={styles.chip}>{action.damageDisplay}</span>
            </span>
          </div>
        ))}
      </div>
      <div style={styles.asideSection}>
        <Text type="supporting" size="xsm" color="secondary">
          Hit points
        </Text>
        <HPBar combatant={combatant} onApplyDamage={onApplyDamage} />
        {combatant.conditions.length > 0 ? (
          <>
            <Text type="supporting" size="xsm" color="secondary">
              Conditions
            </Text>
            <ConditionTokenCluster
              combatant={combatant}
              onRemove={conditionId => onRemoveCondition(combatant.id, conditionId)}
            />
          </>
        ) : null}
        <Divider />
        <Text type="supporting" size="xsm" color="secondary">
          GM note
        </Text>
        <Text type="body" size="sm">
          {combatant.note}
        </Text>
      </div>
      <div style={styles.asideFooter}>
        <Popover
          isOpen={isDamageOpen}
          onOpenChange={setIsDamageOpen}
          label={\`Apply damage to \${combatant.name}\`}
          placement="above"
          content={<DamageForm combatant={combatant} onApply={onApplyDamage} onClose={() => setIsDamageOpen(false)} />}>
          <Button label="Apply Damage" variant="secondary" size="sm" />
        </Popover>
        <Popover
          isOpen={isConditionOpen}
          onOpenChange={setIsConditionOpen}
          label={\`Add condition to \${combatant.name}\`}
          placement="above"
          content={
            <AddConditionForm combatant={combatant} onAdd={onAddCondition} onClose={() => setIsConditionOpen(false)} />
          }>
          <Button label="Add Condition" variant="secondary" size="sm" />
        </Popover>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CombatantRow — 48px list row; the name is the select button, and every
// other displayed property is its own affordance (hexes → duration popover,
// HP bar → damage popover, AC chip → ledger highlight).
// ---------------------------------------------------------------------------

interface CombatantRowProps {
  combatant: Combatant;
  isSelected: boolean;
  isActive: boolean;
  showAc: boolean; // hidden < 860 (subtraction band)
  onSelect: (id: string) => void;
  onApplyDamage: (id: string, amount: number) => void;
  onRemoveCondition: (combatantId: string, conditionId: string) => void;
  onHighlightAc: (id: string) => void;
}

function CombatantRow(props: CombatantRowProps) {
  const {combatant, isSelected, isActive, showAc, onSelect, onApplyDamage, onRemoveCondition, onHighlightAc} = props;
  const down = isDown(combatant);
  const rowStyle: CSSProperties = {
    ...styles.row,
    ...(isSelected ? styles.rowSelected : null),
  };
  return (
    <div role="listitem" className="tet-hoverable" style={rowStyle}>
      <span style={{...styles.rowMonogram, ...(down ? styles.rowDown : null)}} aria-hidden>
        {down ? <Icon icon={SkullIcon} size="xsm" color="secondary" /> : combatant.monogram}
      </span>
      <button
        type="button"
        className="tet-focusable"
        style={{...styles.nameBtn, ...(down ? styles.rowDown : null)}}
        onClick={() => onSelect(combatant.id)}
        aria-pressed={isSelected}
        aria-label={\`\${combatant.name}, \${combatant.classLine}, \${combatant.hpDisplay} hp\${down ? ', down' : ''}\${isActive ? ', active turn' : ''}. Select\`}>
        <span style={styles.rowName}>{combatant.name}</span>
        <span style={styles.rowSub}>
          {isActive ? 'Active turn · ' : ''}
          {combatant.classLine} · {combatant.note}
        </span>
      </button>
      <ConditionTokenCluster
        combatant={combatant}
        onRemove={conditionId => onRemoveCondition(combatant.id, conditionId)}
      />
      {showAc ? (
        <button
          type="button"
          className="tet-focusable"
          style={styles.acChip}
          onClick={() => onHighlightAc(combatant.id)}
          aria-label={\`Armor class \${combatant.ac}. Highlight the last roll against it\`}>
          <Icon icon={ShieldIcon} size="xsm" color="inherit" />
          {combatant.ac}
        </button>
      ) : null}
      <HPBar combatant={combatant} onApplyDamage={onApplyDamage} />
      <span style={styles.initCell} title={combatant.initiativeDisplay}>
        {combatant.initiativeDisplay}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner. One update(id, patch) helper + one
// composite endTurn() consume everything; every mutation has an observable
// consequence somewhere else on screen.
// ---------------------------------------------------------------------------

interface EncounterState {
  round: number;
  activeId: string;
  scriptPointer: number;
  selectedId: string;
  combatants: Combatant[];
  ledger: LedgerEntry[];
  orderIds: string[];
  delayedIds: string[];
  isDrawerOpen: boolean;
  highlightEntryId: string | null;
  expiryToast: string | null;
  liveMessage: string;
}

type ListFilter = 'all' | 'party' | 'foes';

export default function TtrpgEncounterTrackerTemplate() {
  // Responsive bands: measured container width; viewport queries are only
  // the pre-observer first-frame fallback (width 0).
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const rootWidth = useElementWidth(viewRootRef);
  const vpAsideHidden = useMediaQuery('(max-width: 999px)');
  const vpCondensed = useMediaQuery('(max-width: 859px)');
  const vpOverlayDrawer = useMediaQuery('(max-width: 719px)');
  const isAsideHidden = rootWidth > 0 ? rootWidth < 1000 : vpAsideHidden;
  const isCondensed = rootWidth > 0 ? rootWidth < 860 : vpCondensed;
  const isDrawerOverlay = rootWidth > 0 ? rootWidth < 720 : vpOverlayDrawer;

  const [enc, setEnc] = useState<EncounterState>({
    round: 3,
    activeId: C_KORRIN,
    scriptPointer: 0,
    selectedId: C_KORRIN,
    combatants: COMBATANTS,
    ledger: INITIAL_LEDGER,
    orderIds: INITIAL_ORDER,
    delayedIds: [C_VESS],
    isDrawerOpen: true,
    highlightEntryId: null,
    expiryToast: null,
    liveMessage: '',
  });
  const [filter, setFilter] = useState<ListFilter>('all');
  const [isDownOnly, setIsDownOnly] = useState(false);
  const [isStatblockOpen, setIsStatblockOpen] = useState(false);
  const gmSeqRef = useRef(0);
  const drawerToggleRef = useRef<HTMLButtonElement | null>(null);

  // THE one mutation helper — every surface's writes flow through here.
  const update = useCallback((id: string, patch: Partial<Combatant>) => {
    setEnc(s => ({
      ...s,
      combatants: s.combatants.map(c => (c.id === id ? {...c, ...patch} : c)),
    }));
  }, []);

  const appendLedger = useCallback((build: (s: EncounterState) => LedgerEntry) => {
    setEnc(s => ({...s, ledger: [...s.ledger, build(s)]}));
  }, []);

  // The signature interaction: End Turn pops the next scripted turn and
  // fans out in ONE setEnc — caret slides, outgoing conditions decrement
  // (expiries pop + system lines + toast), scripted rolls append and their
  // damage patches re-derive HP in rows/ribbon/aside, selection follows the
  // incoming combatant, and the round wraps when the script says so.
  const endTurn = useCallback(() => {
    setEnc(s => {
      const script = SCRIPTED_TURNS[s.scriptPointer];
      if (script == null) return s;
      const systemEntries: LedgerEntry[] = [];
      const expiredLabels: string[] = [];
      let combatants = s.combatants.map(c => {
        if (c.id !== script.outgoingId) return c;
        const kept: Condition[] = [];
        for (const cond of c.conditions) {
          const remaining = cond.remainingRounds - 1;
          if (remaining <= 0) {
            // Cross-check: ids reaching 0 here match script.expiringConditionIds.
            expiredLabels.push(\`\${cond.name} expired on \${c.name}\`);
            systemEntries.push({
              id: \`lgr-sys-\${cond.id}-r\${s.round}\`,
              stamp: \`R\${s.round}\`,
              actorName: 'System',
              terms: [],
              total: 0,
              totalDisplay: '',
              isSystem: true,
              note: \`\${cond.name} expired on \${c.name}\`,
              summaryDisplay: \`\${cond.name} expired on \${c.name}\`,
            });
          } else {
            kept.push({...cond, remainingRounds: remaining});
          }
        }
        return kept.length === c.conditions.length ? c : {...c, conditions: kept};
      });
      for (const entry of script.newLedgerEntries) {
        for (const t of entry.targets ?? []) {
          combatants = combatants.map(c =>
            c.id === t.targetId ? {...c, hpCurrent: t.hpAfterCurrent, hpDisplay: t.hpAfterDisplay} : c,
          );
        }
      }
      const round = script.wrapsRound ? s.round + 1 : s.round;
      const incoming = combatants.find(c => c.id === script.incomingId);
      return {
        ...s,
        combatants,
        ledger: [...s.ledger, ...systemEntries, ...script.newLedgerEntries],
        activeId: script.incomingId,
        selectedId: script.incomingId,
        scriptPointer: s.scriptPointer + 1,
        round,
        expiryToast: expiredLabels.length > 0 ? expiredLabels.join(' · ') : null,
        liveMessage: \`Round \${round} — \${incoming?.name ?? 'unknown'}'s turn\`,
      };
    });
  }, []);

  const byId = useMemo(() => new Map(enc.combatants.map(c => [c.id, c])), [enc.combatants]);
  const selected = byId.get(enc.selectedId) ?? enc.combatants[0];
  const isScriptDone = enc.scriptPointer >= SCRIPTED_TURNS.length;

  const select = useCallback((id: string) => setEnc(s => ({...s, selectedId: id})), []);

  const applyDamage = useCallback(
    (id: string, amount: number) => {
      const c = byId.get(id);
      if (c == null || amount <= 0) return;
      const hpCurrent = Math.max(0, c.hpCurrent - amount);
      const hpDisplay = \`\${hpCurrent} / \${c.hpMax}\`;
      update(id, {hpCurrent, hpDisplay});
      gmSeqRef.current += 1;
      const seq = gmSeqRef.current;
      appendLedger(s => ({
        id: \`lgr-gm-\${seq}\`,
        stamp: \`R\${s.round}·GM\`,
        actorName: 'GM adjustment',
        terms: [],
        total: amount,
        totalDisplay: \`−\${amount} hp\`,
        targets: [{targetId: id, targetName: c.name, amount, hpAfterCurrent: hpCurrent, hpAfterDisplay: hpDisplay}],
        summaryDisplay: \`GM −\${amount} hp to \${c.name}\`,
      }));
    },
    [byId, update, appendLedger],
  );

  const addCondition = useCallback(
    (id: string, kind: ConditionKind, rounds: number) => {
      const c = byId.get(id);
      if (c == null) return;
      gmSeqRef.current += 1;
      const meta = CONDITION_OPTIONS.find(o => o.value === kind);
      update(id, {
        conditions: [
          ...c.conditions,
          {
            id: \`cond-gm-\${gmSeqRef.current}\`,
            kind,
            name: meta?.label ?? kind,
            remainingRounds: rounds,
            totalRounds: rounds,
            source: 'GM ruling (R3)',
          },
        ],
      });
    },
    [byId, update],
  );

  const removeCondition = useCallback(
    (combatantId: string, conditionId: string) => {
      const c = byId.get(combatantId);
      if (c == null) return;
      const cond = c.conditions.find(x => x.id === conditionId);
      update(combatantId, {conditions: c.conditions.filter(x => x.id !== conditionId)});
      if (cond != null) {
        gmSeqRef.current += 1;
        const seq = gmSeqRef.current;
        appendLedger(s => ({
          id: \`lgr-gm-\${seq}\`,
          stamp: \`R\${s.round}·GM\`,
          actorName: 'System',
          terms: [],
          total: 0,
          totalDisplay: '',
          isSystem: true,
          note: \`\${cond.name} removed from \${c.name} (GM)\`,
          summaryDisplay: \`\${cond.name} removed from \${c.name}\`,
        }));
      }
    },
    [byId, update, appendLedger],
  );

  // AC chip affordance: highlight the last roll made against this AC and
  // reveal the drawer.
  const highlightAc = useCallback((id: string) => {
    setEnc(s => {
      const last = [...s.ledger].reverse().find(e => e.vsTargetId === id);
      return {...s, highlightEntryId: last?.id ?? null, isDrawerOpen: true};
    });
  }, []);
  useEffect(() => {
    if (enc.highlightEntryId != null) {
      document.getElementById(\`tet-lgr-\${enc.highlightEntryId}\`)?.scrollIntoView({block: 'nearest'});
    }
  }, [enc.highlightEntryId]);

  const reenter = useCallback((id: string) => {
    setEnc(s => {
      if (!s.delayedIds.includes(id)) return s;
      const at = s.orderIds.indexOf(s.activeId);
      const orderIds = [...s.orderIds.slice(0, at + 1), id, ...s.orderIds.slice(at + 1)];
      const c = s.combatants.find(x => x.id === id);
      return {
        ...s,
        orderIds,
        delayedIds: s.delayedIds.filter(d => d !== id),
        selectedId: id,
        liveMessage: \`\${c?.name ?? 'Combatant'} re-entered the initiative order\`,
      };
    });
  }, []);

  // Keyboard: 'e' ends the turn, with a typing-target guard.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'e' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target != null &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      endTurn();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [endTurn]);

  // Escape closes the overlay-mode drawer and restores focus to its toggle.
  useEffect(() => {
    if (!(isDrawerOverlay && enc.isDrawerOpen)) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEnc(s => ({...s, isDrawerOpen: false}));
        drawerToggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOverlay, enc.isDrawerOpen]);

  const filtered = enc.combatants.filter(c => {
    if (filter === 'party' && c.kind !== 'party') return false;
    if (filter === 'foes' && c.kind !== 'foe') return false;
    if (isDownOnly && !isDown(c)) return false;
    return true;
  });
  // List follows ribbon order, with delayed combatants appended (data exists
  // beyond default filters: Vess only appears via All/Foes, off-track).
  const listOrder = [...enc.orderIds, ...enc.delayedIds];
  const sortedFiltered = [...filtered].sort((a, b) => listOrder.indexOf(a.id) - listOrder.indexOf(b.id));

  const partyCount = enc.combatants.filter(c => c.kind === 'party').length;
  const foeCount = enc.combatants.length - partyCount;
  const downCount = enc.combatants.filter(isDown).length;

  const lastEntry = enc.ledger[enc.ledger.length - 1];
  const drawerSummary = \`\${enc.ledger.length} rolls — last: \${lastEntry?.summaryDisplay ?? '—'}\`;

  const drawerHeader = (
    <div style={styles.drawerHeader}>
      <button
        ref={drawerToggleRef}
        type="button"
        className="tet-focusable"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: GUTTER / 2,
          color: 'var(--color-text-primary)',
          fontFamily: 'inherit',
        }}
        aria-expanded={enc.isDrawerOpen}
        onClick={() => setEnc(s => ({...s, isDrawerOpen: !s.isDrawerOpen}))}>
        <Icon icon={enc.isDrawerOpen ? ChevronDownIcon : ChevronUpIcon} size="xsm" color="secondary" />
        <Text type="label" size="sm">
          Roll Ledger
        </Text>
        <Token size="sm" color="gray" label={\`\${enc.ledger.length} rolls\`} />
      </button>
      {!enc.isDrawerOpen ? <span style={styles.drawerSummary}>{drawerSummary}</span> : null}
      <span style={styles.checksum}>Ledger v14.3 — replayable</span>
    </div>
  );

  const drawerList = (
    <div style={styles.drawerList} role="log" aria-label="Roll ledger">
      {enc.expiryToast != null ? (
        <div style={styles.toastRow}>
          <Icon icon={MoonIcon} size="xsm" color="secondary" />
          <Text type="supporting" size="xsm">
            {enc.expiryToast}
          </Text>
        </div>
      ) : null}
      {enc.ledger.map(entry => (
        <RollLedgerRow
          key={entry.id}
          entry={entry}
          isHighlighted={entry.id === enc.highlightEntryId}
          onSelectCombatant={select}
        />
      ))}
    </div>
  );

  const statblock = (
    <StatblockContent
      combatant={selected}
      onApplyDamage={applyDamage}
      onAddCondition={addCondition}
      onRemoveCondition={removeCondition}
      onHighlightAc={highlightAc}
    />
  );

  return (
    <div style={styles.root}>
      <style>{TET_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} style={styles.viewRoot}>
              <h1 style={styles.srOnly}>Torchward encounter tracker — Session 14, The Hollowmere Crypts</h1>
              {/* Polite live region: turn advances and re-entries announce. */}
              <div aria-live="polite" style={styles.srOnly}>
                {enc.liveMessage}
              </div>
              {/* [1] 44px session header — brand corner left, signature
                  action (Round pill + End Turn) pinned top-right. */}
              <div style={styles.header}>
                <span style={styles.brandCluster}>
                  <TorchwardMark size={20} />
                  <span style={styles.wordmark}>Torchward</span>
                  <span style={styles.sessionTitle}>Session 14 — The Hollowmere Crypts</span>
                </span>
                <div style={styles.headerRight}>
                  {isAsideHidden ? (
                    <Button label="Statblock" variant="secondary" size="sm" onClick={() => setIsStatblockOpen(true)} />
                  ) : null}
                  <span style={styles.roundPill}>Round {enc.round}</span>
                  {/* Focus stays on the button through every advance; when
                      the script is exhausted it no-ops (never disabled, so
                      focus is never dropped). */}
                  <Tooltip content={isScriptDone ? 'End of the scripted demo — ledger stays replayable' : 'Advance to the next turn (E)'}>
                    <Button
                      label="End Turn"
                      variant="primary"
                      size="sm"
                      aria-disabled={isScriptDone}
                      onClick={endTurn}
                    />
                  </Tooltip>
                </div>
              </div>
              {/* [2] 72px InitiativeRibbon. */}
              <InitiativeRibbon
                combatants={enc.combatants}
                orderIds={enc.orderIds}
                delayedIds={enc.delayedIds}
                activeId={enc.activeId}
                selectedId={enc.selectedId}
                round={enc.round}
                condensed={isCondensed}
                onSelect={select}
                onReenter={reenter}
              />
              {/* [3] body row: main column + 380px aside. */}
              <div style={styles.body}>
                <div style={styles.main}>
                  <div style={styles.filterRow}>
                    <SegmentedControl
                      label="Combatant filter"
                      value={filter}
                      onChange={value => setFilter(value as ListFilter)}
                      size="sm">
                      <SegmentedControlItem label={\`All \${enc.combatants.length}\`} value="all" />
                      <SegmentedControlItem label={\`Party \${partyCount}\`} value="party" />
                      <SegmentedControlItem label={\`Foes \${foeCount}\`} value="foes" />
                    </SegmentedControl>
                    <Token
                      size="sm"
                      color={isDownOnly ? 'red' : 'gray'}
                      label={\`Down \${downCount}\`}
                      onClick={() => setIsDownOnly(prev => !prev)}
                    />
                    <span style={{marginLeft: 'auto'}}>
                      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                        Showing {sortedFiltered.length} of {enc.combatants.length}
                      </Text>
                    </span>
                  </div>
                  <div style={styles.listScroll} role="list" aria-label="Combatants">
                    {sortedFiltered.map(c => (
                      <CombatantRow
                        key={c.id}
                        combatant={c}
                        isSelected={c.id === enc.selectedId}
                        isActive={c.id === enc.activeId}
                        showAc={!isCondensed}
                        onSelect={select}
                        onApplyDamage={applyDamage}
                        onRemoveCondition={removeCondition}
                        onHighlightAc={highlightAc}
                      />
                    ))}
                  </div>
                </div>
                {!isAsideHidden ? (
                  <aside style={styles.aside} aria-label="Statblock">
                    {statblock}
                  </aside>
                ) : null}
              </div>
              {/* [4] RollLedgerDrawer: 220px expanded / 36px collapsed; in
                  the <720 band it overlays upward instead of taking flex
                  height. */}
              <div style={{...styles.drawer, height: !isDrawerOverlay && enc.isDrawerOpen ? 220 : 36}}>
                {drawerHeader}
                {!isDrawerOverlay && enc.isDrawerOpen ? drawerList : null}
              </div>
              {isDrawerOverlay && enc.isDrawerOpen ? (
                <div style={styles.drawerOverlayPanel} role="dialog" aria-label="Roll ledger overlay">
                  {drawerList}
                </div>
              ) : null}
            </div>
          </LayoutContent>
        }
      />
      {/* Narrow-band statblock: the aside re-renders on demand as a Dialog
          (DS focus trap; focus restores to the Statblock trigger). */}
      <Dialog
        isOpen={isAsideHidden && isStatblockOpen}
        onOpenChange={isOpen => {
          if (!isOpen) setIsStatblockOpen(false);
        }}
        purpose="info"
        width="min(420px, 94vw)">
        <Layout
          header={
            <DialogHeader
              title={selected.name}
              subtitle={selected.classLine}
              onOpenChange={isOpen => {
                if (!isOpen) setIsStatblockOpen(false);
              }}
            />
          }
          content={<LayoutContent padding={0}>{statblock}</LayoutContent>}
        />
      </Dialog>
    </div>
  );
}

`;export{e as default};