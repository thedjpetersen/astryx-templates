// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one documentary mix session
 *   'Harbor Light — Mix v3' at 48 kHz/24-bit: eight source channels in four
 *   bus groups — DX1/DX2 dialogue, MX1/MX2 music, FX1/FX2 effects, AM1/AM2
 *   ambience — each carrying fixed base L/R levels in dBFS, a fixed peak
 *   offset, default fader/pan/automation values, and a named insert chain;
 *   four bus strips and a master strip with a -1.0 dBFS brickwall limiter)
 * @output Audio mixer console for a video editor: a 52px header (session
 *   name, Saved Badge, 48 kHz readout, mono/dim monitor ToggleButtons,
 *   primary Bounce Mix Button), a center console that scrolls horizontally —
 *   eight 108px channel strips under DIALOGUE/MUSIC/EFFECTS/AMBIENCE group
 *   captions plus four bus strips, every strip stacking insert slots, a
 *   drag-to-set pan knob, a compact automation-mode Selector, a 160px
 *   vertical fader Slider beside a dB scale and a stereo gradient level
 *   meter with peak tick and clip LED, a mono dB readout, and M/S/R
 *   ToggleButtons — a fixed 148px master strip pinned right of the scroll
 *   with a limiter LED and gain-reduction readout, a 300px collapsible
 *   channel inspector (insert chain with bypass Switches, reverb send
 *   Slider, automation Selector), and a footer status bar with transport,
 *   SMPTE timecode, solo-active Badge, and DSP load.
 * @position Page template; emitted by `astryx template video-editor-audio-mixer`
 *
 * Frame: Layout height="fill" inside a 100dvh root div, zero page scroll.
 * LayoutHeader carries the session chrome. LayoutContent hosts the console:
 * a horizontally scrolling strip row (group caption + member strips per
 * bus family, then the four bus strips) and, outside the scroller, the
 * fixed master strip so the mix output stays visible at every scroll
 * position. LayoutPanel end 300 is the channel inspector bound to the
 * selected strip. LayoutFooter is a 44px status bar. Every fader, dB
 * scale tick, meter fill, and peak tick derives from one shared
 * dbToPct(-60..+10) mapping so faders, scales, and meters stay registered.
 * The only channel-strip mixing surface — choose over video-clip-timeline
 * when the user balances bus levels rather than arranges clips on lanes,
 * and over album-tracklist-player when the surface is a mixing console,
 * not playback.
 *
 * Responsive contract:
 * - >1100px: header | console (fill, horizontal scroll) + master 148 |
 *   inspector 300 | footer 44.
 * - <=1100px: the inspector drops out entirely (its header toggle
 *   disables); console and master keep their widths.
 * - <=768px: the header hides the 48 kHz/24-bit readout and the mono/dim
 *   monitor cluster; Bounce Mix stays. The footer hides the DSP load
 *   readout. Strip controls keep pointer sizing (a console is a
 *   desktop-first surface); the console scrolls horizontally at every
 *   width by design — 8 channels + 4 buses is ~1500px at full zoom.
 * - The header row wraps (flexWrap) instead of clipping at phone widths.
 *
 * Container policy (tool-dock archetype): frame-first rows and panels;
 * strips are styled divs on the console surface, and the only Cards are
 * the selected-strip summary and send widgets inside the inspector panel.
 *
 * Color policy: each strip's fader/meter well is deliberately scheme-locked
 * dark (colorScheme: 'dark' in `styles.meterWell`) — hardware consoles and
 * every DAW keep the metering face dark in both schemes so the
 * green/amber/red program gradient stays readable; the gradient stops
 * (#22C55E -> #EAB308 -> #EF4444), the slate scale/tick literals, and the
 * white peak tick inside the well are intentional literals. Everything
 * outside the wells is a var(--color-*) token or an explicit light-dark()
 * pair: bus family tints keep their exact light values and shift to the
 * lighter 400-weight hues on dark; the record-arm dot flips
 * #DC2626 -> #F87171.
 */

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  AudioLinesIcon,
  CircleIcon,
  DownloadIcon,
  HeadphonesIcon,
  MicIcon,
  Music2Icon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PlayIcon,
  SquareIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
  WavesIcon,
  ZapIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SESSION CONSTANTS =============

const SESSION_NAME = 'Harbor Light — Mix v3';
const SEQUENCE_TC = '01:12:44:16';
const SAMPLE_RATE = '48 kHz · 24-bit';
const MONO = 'var(--font-family-code, monospace)';

// Shared dB space: faders, scales, and meters all map through dbToPct so
// a fader move lands on the exact same pixel row as the meter response.
const DB_FLOOR = -60;
const DB_CEIL = 10;
const FADER_H = 160; // matches the design-system vertical Slider track
const LIMITER_THRESHOLD_DB = -1.0;

/** dB in the -60..+10 working range -> 0..100% of the fader/meter height. */
function dbToPct(db: number): number {
  const clamped = Math.min(DB_CEIL, Math.max(DB_FLOOR, db));
  return ((clamped - DB_FLOOR) / (DB_CEIL - DB_FLOOR)) * 100;
}

/** -3.5 -> "-3.5 dB", 0 -> "0.0 dB", 2 -> "+2.0 dB", floor -> "-inf". */
function formatDb(db: number): string {
  if (db <= DB_FLOOR) {
    return '-inf';
  }
  const sign = db > 0 ? '+' : '';
  return `${sign}${db.toFixed(1)} dB`;
}

/** Pan -100..100 -> "L45" | "C" | "R30". */
function formatPan(pan: number): string {
  if (pan === 0) {
    return 'C';
  }
  return pan < 0 ? `L${Math.abs(pan)}` : `R${pan}`;
}

// ============= FIXTURES =============
// Fixed base levels, peaks, inserts, and routing — no clocks, no randomness.

type BusId = 'dia' | 'mus' | 'sfx' | 'amb';
type AutomationMode = 'off' | 'read' | 'touch' | 'latch' | 'write';

const AUTOMATION_OPTIONS: {value: AutomationMode; label: string}[] = [
  {value: 'off', label: 'Off'},
  {value: 'read', label: 'Read'},
  {value: 'touch', label: 'Touch'},
  {value: 'latch', label: 'Latch'},
  {value: 'write', label: 'Write'},
];

const AUTOMATION_HINT: Record<AutomationMode, string> = {
  off: 'Automation is ignored on this strip.',
  read: 'Existing automation plays back; manual moves are temporary.',
  touch: 'Moves write while touched, then return to the existing pass.',
  latch: 'Fader and pan moves will overwrite existing automation on playback.',
  write: 'Fader and pan moves will overwrite existing automation on playback.',
};

interface InsertPlugin {
  id: string;
  name: string;
  kind: 'eq' | 'dynamics' | 'restoration' | 'space';
}

const KIND_LABEL: Record<InsertPlugin['kind'], string> = {
  eq: 'Equalizer',
  dynamics: 'Dynamics',
  restoration: 'Restoration',
  space: 'Space / reverb',
};

interface ChannelFixture {
  id: string;
  shortName: string; // fits the 108px strip
  sourceFile: string; // full name for the inspector
  bus: BusId;
  /** Base program level in dBFS at unity fader (L/R can differ). */
  baseL: number;
  baseR: number;
  /** Fixed crest above the base level — feeds the peak tick. */
  peakOffset: number;
  faderDb: number;
  pan: number; // -100 (L) .. 100 (R)
  automation: AutomationMode;
  isArmed: boolean;
  inserts: InsertPlugin[];
  sendDb: number; // send into the Harbor Verb aux
}

interface BusFixture {
  id: BusId;
  label: string; // "DIA"
  caption: string; // "Dialogue"
  icon: typeof MicIcon;
  tint: string; // strip accent tab + meter group chip
  tintSoft: string; // translucent header fill
  faderDb: number;
  automation: AutomationMode;
  inserts: InsertPlugin[];
}

const ins = (id: string, name: string, kind: InsertPlugin['kind']): InsertPlugin =>
  ({id, name, kind});

const bus = (
  id: BusId, label: string, caption: string, icon: typeof MicIcon,
  tint: string, tintSoft: string, faderDb: number,
  automation: AutomationMode, inserts: InsertPlugin[],
): BusFixture => ({id, label, caption, icon, tint, tintSoft, faderDb, automation, inserts});

// Bus family hues ride the repo-standard categorical tokens (with the
// standard fallback pairs) so the console matches sibling Video Studio pages.
const BUSES: BusFixture[] = [
  bus(
    'dia', 'DIA', 'Dialogue', MicIcon,
    'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
    'light-dark(rgba(1, 113, 227, 0.12), rgba(76, 158, 255, 0.16))',
    0, 'read',
    [ins('dia-comp', 'Comp 2:1', 'dynamics'), ins('dia-eq', 'Curve EQ', 'eq')],
  ),
  bus(
    'mus', 'MUS', 'Music', Music2Icon,
    'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
    'light-dark(rgba(107, 30, 253, 0.1), rgba(157, 107, 255, 0.16))',
    -2, 'read',
    [ins('mus-glue', 'Glue Comp', 'dynamics')],
  ),
  bus(
    'sfx', 'SFX', 'Effects', ZapIcon,
    'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
    'light-dark(rgba(235, 110, 0, 0.1), rgba(255, 147, 48, 0.16))',
    -1.5, 'touch',
    [ins('sfx-lim', 'Peak Lim', 'dynamics')],
  ),
  bus(
    'amb', 'AMB', 'Ambience', WavesIcon,
    'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
    'light-dark(rgba(14, 126, 139, 0.1), rgba(51, 184, 199, 0.16))',
    -6, 'read',
    [ins('amb-eq', 'HPF 80', 'eq')],
  ),
];

const chan = (
  id: string, shortName: string, sourceFile: string, busId: BusId,
  baseL: number, baseR: number, peakOffset: number, faderDb: number, pan: number,
  automation: AutomationMode, isArmed: boolean, inserts: InsertPlugin[], sendDb: number,
): ChannelFixture => ({
  id, shortName, sourceFile, bus: busId, baseL, baseR, peakOffset,
  faderDb, pan, automation, isArmed, inserts, sendDb,
});

const CHANNELS: ChannelFixture[] = [
  chan('dx1', 'DX 1 · Elena', 'INT_Elena_boat_deck_01.wav', 'dia',
    -18, -19, 8, 1.5, 0, 'read', false,
    [
      ins('dx1-dn', 'De-noise', 'restoration'),
      ins('dx1-eq', 'Dialog EQ', 'eq'),
      ins('dx1-cmp', 'Vocal Comp', 'dynamics'),
    ],
    -22),
  chan('dx2', 'DX 2 · VO', 'VO_narration_reel2_take4.wav', 'dia',
    -16, -16, 6, 0, 0, 'touch', true,
    [ins('dx2-eq', 'Dialog EQ', 'eq'), ins('dx2-des', 'DeEsser', 'restoration')],
    -30),
  chan('mx1', 'MX 1 · Score', 'score_tides_theme_stereo.wav', 'mus',
    -20, -20, 9, -4, 0, 'latch', false,
    [ins('mx1-eq', 'Shelf EQ', 'eq')],
    -60),
  chan('mx2', 'MX 2 · Radio', 'source_radio_wheelhouse.wav', 'mus',
    -26, -24, 7, -8, 35, 'read', false,
    [ins('mx2-fut', 'Radio Futz', 'eq'), ins('mx2-vrb', 'Tiny Room', 'space')],
    -60),
  chan('fx1', 'FX 1 · Foley', 'foley_ropes_deck_pass3.wav', 'sfx',
    -24, -23, 10, -2, -15, 'read', false,
    [ins('fx1-eq', 'Foley EQ', 'eq')],
    -26),
  chan('fx2', 'FX 2 · Horns', 'sfx_harbor_horns_distant.wav', 'sfx',
    -28, -26, 12, -5, 40, 'off', false, [], -18),
  chan('am1', 'AM 1 · Harbor', 'amb_harbor_wash_loop_A.wav', 'amb',
    -30, -30, 5, -7, -25, 'read', false,
    [ins('am1-eq', 'HPF 120', 'eq')],
    -34),
  chan('am2', 'AM 2 · Gulls', 'amb_gull_bed_sparse.wav', 'amb',
    -34, -32, 9, -9, 25, 'off', false, [], -28),
];

const CHANNELS_BY_BUS: Record<BusId, ChannelFixture[]> = {
  dia: CHANNELS.filter(c => c.bus === 'dia'),
  mus: CHANNELS.filter(c => c.bus === 'mus'),
  sfx: CHANNELS.filter(c => c.bus === 'sfx'),
  amb: CHANNELS.filter(c => c.bus === 'amb'),
};

const BUS_BY_ID: Record<BusId, BusFixture> = {
  dia: BUSES[0],
  mus: BUSES[1],
  sfx: BUSES[2],
  amb: BUSES[3],
};

/** Live, editable per-strip state; initialized from the fixtures. */
interface StripState {
  faderDb: number;
  pan: number;
  isMuted: boolean;
  isSoloed: boolean;
  isArmed: boolean;
  automation: AutomationMode;
  bypassed: Record<string, boolean>; // insert id -> bypassed
  sendDb: number;
}

function initialStripState(): Record<string, StripState> {
  const out: Record<string, StripState> = {};
  for (const c of CHANNELS) {
    out[c.id] = {
      faderDb: c.faderDb, pan: c.pan, isMuted: false, isSoloed: false,
      isArmed: c.isArmed, automation: c.automation, bypassed: {}, sendDb: c.sendDb,
    };
  }
  for (const b of BUSES) {
    out[b.id] = {
      faderDb: b.faderDb, pan: 0, isMuted: false, isSoloed: false,
      isArmed: false, automation: b.automation, bypassed: {}, sendDb: -60,
    };
  }
  return out;
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  mono: {fontFamily: MONO, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Header controls wrap onto a second row instead of clipping at phone
  // widths — the session title alone can take half the viewport.
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // Console band: strips scroll horizontally; the master strip stays fixed.
  consoleBand: {
    height: '100%', minHeight: 0, display: 'flex',
    backgroundColor: 'var(--color-background-muted)',
  },
  consoleScroll: {
    flex: 1, minWidth: 0, overflowX: 'auto', overflowY: 'auto', padding: 'var(--spacing-3)',
  },
  consoleRow: {display: 'flex', alignItems: 'stretch', gap: 'var(--spacing-3)'},
  groupCol: {display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)'},
  groupChip: {
    display: 'flex', alignItems: 'center', gap: 6,
    paddingInline: 'var(--spacing-2)', paddingBlock: 4,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  groupStrips: {display: 'flex', gap: 'var(--spacing-2)', flex: 1},
  // One channel strip: fixed 108px column on the console surface.
  strip: {
    width: 108, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6,
    padding: 'var(--spacing-2)', borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit',
  },
  // Inset ring keeps the selection inside the strip so it never bleeds
  // onto the neighboring strip's border.
  stripSelected: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  stripColorTab: {height: 3, borderRadius: 999, marginBottom: 2},
  stripName: {
    fontFamily: MONO, fontSize: 11, lineHeight: '14px',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  routeLabel: {
    fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em',
    color: 'var(--color-text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap',
  },
  // Insert slots: three fixed 18px rows so every strip's fader row starts
  // on the same gridline whether the chain has 0 or 3 plugins.
  insertRow: {
    height: 18, display: 'flex', alignItems: 'center', gap: 4, paddingInline: 6,
    borderRadius: 4, border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    font: 'inherit', cursor: 'pointer', width: '100%',
  },
  insertRowEmpty: {
    height: 18, display: 'flex', alignItems: 'center', paddingInline: 6,
    borderRadius: 4, border: '1px dashed var(--color-border)',
  },
  insertName: {
    fontFamily: MONO, fontSize: 9, lineHeight: '12px', whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0, textAlign: 'left',
  },
  // Pan knob: 34px rotary; the indicator line rotates -135deg..135deg.
  knobRow: {display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center'},
  knob: {
    position: 'relative', width: 34, height: 34, borderRadius: '50%',
    border: 'var(--border-width) solid var(--color-border-emphasized)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'ns-resize', touchAction: 'none', padding: 0, flexShrink: 0,
  },
  knobPointer: {
    position: 'absolute', left: '50%', top: 3, width: 2, height: 11, marginLeft: -1,
    borderRadius: 999, backgroundColor: 'var(--color-accent)',
    transformOrigin: '1px 14px', pointerEvents: 'none',
  },
  knobTick: {
    position: 'absolute', bottom: 2, fontSize: 7,
    color: 'var(--color-text-secondary)', pointerEvents: 'none',
  },
  panReadout: {
    fontFamily: MONO, fontSize: 10, fontVariantNumeric: 'tabular-nums',
    width: 26, textAlign: 'end', color: 'var(--color-text-secondary)',
  },
  // Fader/meter well — deliberately scheme-locked dark (see the header
  // Color policy): the metering face of a console stays dark in both
  // schemes so the green/amber/red program gradient keeps its meaning.
  // Every color inside is an intentional literal. Bottom-aligned so the
  // 0 dB rows of scale, fader, and meters share a gridline (the clip LED
  // rides above the meter pair into the top padding).
  meterWell: {
    display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'flex-end',
    padding: '10px 6px', borderRadius: 6,
    background: 'linear-gradient(180deg, #151C2C 0%, #0B1120 100%)',
    colorScheme: 'dark',
  },
  dbScale: {position: 'relative', width: 20, height: FADER_H, flexShrink: 0},
  dbScaleLabel: {
    position: 'absolute', right: 2, transform: 'translateY(50%)',
    fontFamily: MONO, fontSize: 8, lineHeight: '9px',
    color: 'rgba(163, 178, 199, 0.95)', userSelect: 'none',
  },
  dbScaleTick: {
    position: 'absolute', right: -3, width: 3, height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.6)',
  },
  faderCol: {height: FADER_H, display: 'flex', alignItems: 'center'},
  meterPair: {display: 'flex', gap: 2, height: FADER_H, alignItems: 'flex-end'},
  meterTrack: {
    position: 'relative', width: 7, height: FADER_H, borderRadius: 2,
    backgroundColor: 'rgba(30, 41, 59, 0.9)', overflow: 'hidden',
  },
  // The fill reveals a fixed full-height gradient from the bottom, so the
  // red zone only appears when the level actually reaches it.
  meterFill: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundImage:
      'linear-gradient(to top, #16A34A 0%, #22C55E 55%, #EAB308 78%, #F59E0B 88%, #EF4444 96%)',
    backgroundSize: `100% ${FADER_H}px`,
    backgroundPosition: 'bottom',
  },
  meterPeakTick: {
    position: 'absolute', left: 0, right: 0, height: 1.5,
    backgroundColor: 'rgba(241, 245, 249, 0.95)',
  },
  clipLed: {width: 7, height: 4, borderRadius: 1, backgroundColor: 'rgba(71, 85, 105, 0.7)'},
  clipLedLit: {backgroundColor: '#EF4444', boxShadow: '0 0 4px rgba(239, 68, 68, 0.8)'},
  meterColHead: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3},
  dbReadout: {
    fontFamily: MONO, fontSize: 10, fontVariantNumeric: 'tabular-nums',
    textAlign: 'center', whiteSpace: 'nowrap',
  },
  msrRow: {display: 'flex', gap: 4, justifyContent: 'center'},
  armDot: {color: 'light-dark(#DC2626, #F87171)'},
  // Master strip: pinned right of the horizontal scroller.
  masterCol: {
    width: 148, flexShrink: 0,
    borderLeft: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-3)',
    display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto',
  },
  limiterRow: {
    display: 'flex', alignItems: 'center', gap: 6, paddingInline: 6, height: 22,
    borderRadius: 4, border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  limiterLed: {
    width: 8, height: 8, borderRadius: '50%',
    backgroundColor: 'light-dark(#D1D5DB, #374151)', flexShrink: 0,
  },
  limiterLedLit: {
    backgroundColor: 'light-dark(#F59E0B, #FBBF24)',
    boxShadow: '0 0 5px light-dark(rgba(245, 158, 11, 0.7), rgba(251, 191, 36, 0.7))',
  },
  panelScroll: {height: '100%', overflowY: 'auto', padding: 'var(--spacing-3)'},
  panelEmpty: {paddingTop: 'var(--spacing-8)', textAlign: 'center'},
  footerRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'},
};

// ============= STRIP PIECES =============

/** Rotary pan knob: vertical pointer-drag (0.8 pan per px), arrow keys
 * step by 5, double-click recenters. -100..100 maps to -135deg..135deg. */
function PanKnob({
  label,
  pan,
  onChange,
}: {
  label: string;
  pan: number;
  onChange: (pan: number) => void;
}) {
  const dragRef = useRef<{startY: number; startPan: number} | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragRef.current = {startY: event.clientY, startPan: pan};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag == null) {
      return;
    }
    const delta = Math.round((drag.startY - event.clientY) * 0.8);
    onChange(Math.max(-100, Math.min(100, drag.startPan + delta)));
  };
  const handlePointerUp = () => {
    dragRef.current = null;
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      event.preventDefault();
      onChange(Math.min(100, pan + 5));
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      event.preventDefault();
      onChange(Math.max(-100, pan - 5));
    } else if (event.key === 'Home') {
      event.preventDefault();
      onChange(0);
    }
  };

  const angle = (pan / 100) * 135;
  return (
    <div style={styles.knobRow}>
      <Tooltip content="Drag to pan · double-click to center">
        <button
          type="button"
          role="slider"
          aria-label={label}
          aria-valuemin={-100}
          aria-valuemax={100}
          aria-valuenow={pan}
          aria-valuetext={formatPan(pan)}
          style={styles.knob}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={() => onChange(0)}
          onKeyDown={handleKeyDown}>
          <span
            style={{...styles.knobPointer, transform: `rotate(${angle}deg)`}}
            aria-hidden
          />
          <span style={{...styles.knobTick, left: 1}} aria-hidden>
            L
          </span>
          <span style={{...styles.knobTick, right: 0}} aria-hidden>
            R
          </span>
        </button>
      </Tooltip>
      <span style={styles.panReadout}>{formatPan(pan)}</span>
    </div>
  );
}

// dB rows the scale column prints beside every fader.
const SCALE_MARKS = [10, 5, 0, -5, -10, -20, -30, -45, -60];

/** 20px dB scale column; tick rows share dbToPct with faders and meters. */
function DbScale() {
  return (
    <div style={styles.dbScale} aria-hidden>
      {SCALE_MARKS.map(db => (
        <span key={db}>
          <span style={{...styles.dbScaleLabel, bottom: `${dbToPct(db)}%`}}>
            {db > 0 ? `+${db}` : db === -60 ? '−∞' : db}
          </span>
          <span style={{...styles.dbScaleTick, bottom: `${dbToPct(db)}%`}} />
        </span>
      ))}
    </div>
  );
}

/** One meter bar: gradient fill revealed from the bottom + peak tick. */
function MeterBar({levelDb, peakDb}: {levelDb: number; peakDb: number}) {
  const fillPct = dbToPct(levelDb);
  const peakPct = dbToPct(peakDb);
  return (
    <span style={styles.meterTrack}>
      <span style={{...styles.meterFill, height: `${fillPct}%`}} />
      {peakDb > DB_FLOOR && (
        <span style={{...styles.meterPeakTick, bottom: `${peakPct}%`}} />
      )}
    </span>
  );
}

/** Stereo meter pair with clip LEDs; announces the louder side. */
function StereoMeter({
  label, levelL, levelR, peakL, peakR,
}: {
  label: string;
  levelL: number;
  levelR: number;
  peakL: number;
  peakR: number;
}) {
  const clipped = peakL > 0 || peakR > 0;
  const louder = Math.max(levelL, levelR);
  return (
    <div style={styles.meterColHead}>
      <span
        style={{...styles.clipLed, ...(clipped ? styles.clipLedLit : undefined)}}
        title={clipped ? 'Clip' : undefined}
      />
      <div
        style={styles.meterPair}
        role="meter"
        aria-label={label}
        aria-valuemin={DB_FLOOR}
        aria-valuemax={DB_CEIL}
        aria-valuenow={Math.round(louder)}
        aria-valuetext={formatDb(louder)}>
        <MeterBar levelDb={levelL} peakDb={peakL} />
        <MeterBar levelDb={levelR} peakDb={peakR} />
      </div>
    </div>
  );
}

/** Three fixed insert rows; filled slots toggle bypass on click. Empty
 * slots render dashed so every strip keeps the same vertical rhythm. */
function InsertSlots({
  stripName, inserts, bypassed, onToggleBypass,
}: {
  stripName: string;
  inserts: InsertPlugin[];
  bypassed: Record<string, boolean>;
  onToggleBypass: (insertId: string) => void;
}) {
  const slots: (InsertPlugin | null)[] = [
    inserts[0] ?? null,
    inserts[1] ?? null,
    inserts[2] ?? null,
  ];
  return (
    <VStack gap={1}>
      {slots.map((slot, index) =>
        slot != null ? (
          <Tooltip
            key={slot.id}
            content={`${slot.name} — ${
              bypassed[slot.id] ? 'bypassed, click to enable' : 'active, click to bypass'
            }`}>
            <button
              type="button"
              style={{...styles.insertRow, opacity: bypassed[slot.id] ? 0.45 : 1}}
              aria-pressed={!bypassed[slot.id]}
              aria-label={`${stripName} insert ${slot.name}`}
              onClick={event => {
                event.stopPropagation();
                onToggleBypass(slot.id);
              }}>
              <StatusDot
                variant={bypassed[slot.id] ? 'neutral' : 'success'}
                label={bypassed[slot.id] ? 'Bypassed' : 'Active'}
              />
              <span style={styles.insertName}>{slot.name}</span>
            </button>
          </Tooltip>
        ) : (
          // Fixed slot order — index keys are stable.
          // eslint-disable-next-line react/no-array-index-key
          <div key={`empty-${index}`} style={styles.insertRowEmpty} aria-hidden>
            <span style={{...styles.insertName, color: 'var(--color-text-secondary)'}}>
              —
            </span>
          </div>
        ),
      )}
    </VStack>
  );
}

/** Levels a strip contributes right now, in dBFS (post fader/pan/mute). */
interface StripLevels {
  levelL: number;
  levelR: number;
  peakL: number;
  peakR: number;
}

/** One console strip — used for both source channels and buses. */
function MixStrip({
  id, name, routeLabel, tint, inserts, state, levels,
  isSelected, hasArm, onSelect, onPatch, onToggleBypass,
}: {
  id: string;
  name: string;
  routeLabel: string;
  tint: string;
  inserts: InsertPlugin[];
  state: StripState;
  levels: StripLevels;
  isSelected: boolean;
  hasArm: boolean;
  onSelect: (id: string) => void;
  onPatch: (id: string, patch: Partial<StripState>) => void;
  onToggleBypass: (id: string, insertId: string) => void;
}) {
  return (
    <div
      style={{...styles.strip, ...(isSelected ? styles.stripSelected : undefined)}}
      role="button"
      tabIndex={0}
      aria-label={`Select ${name}`}
      aria-pressed={isSelected}
      onClick={() => onSelect(id)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(id);
        }
      }}>
      <div style={{...styles.stripColorTab, backgroundColor: tint}} aria-hidden />
      <span style={styles.stripName} title={name}>
        {name}
      </span>
      <span style={styles.routeLabel}>→ {routeLabel}</span>
      <InsertSlots
        stripName={name}
        inserts={inserts}
        bypassed={state.bypassed}
        onToggleBypass={insertId => onToggleBypass(id, insertId)}
      />
      <PanKnob
        label={`${name} pan`}
        pan={state.pan}
        onChange={pan => onPatch(id, {pan})}
      />
      <div
        style={styles.meterWell}
        onClick={event => event.stopPropagation()}
        role="presentation">
        <DbScale />
        <div style={styles.faderCol}>
          <Slider
            label={`${name} fader`}
            isLabelHidden
            orientation="vertical"
            value={state.faderDb}
            min={DB_FLOOR}
            max={DB_CEIL}
            step={0.5}
            valueDisplay="none"
            formatValue={formatDb}
            onChange={(v: number) => onPatch(id, {faderDb: v})}
          />
        </div>
        <StereoMeter
          label={`${name} output level`}
          levelL={levels.levelL}
          levelR={levels.levelR}
          peakL={levels.peakL}
          peakR={levels.peakR}
        />
      </div>
      <span style={styles.dbReadout}>
        {state.faderDb <= DB_FLOOR ? '-inf' : formatDb(state.faderDb)}
      </span>
      <div style={styles.msrRow} onClick={event => event.stopPropagation()} role="presentation">
        <ToggleButton
          label={`Mute ${name}`}
          size="sm"
          isPressed={state.isMuted}
          onPressedChange={isPressed => onPatch(id, {isMuted: isPressed})}
          tooltip="Mute"
          isIconOnly
          icon={<Icon icon={Volume2Icon} size="sm" color="inherit" />}
          pressedIcon={<Icon icon={VolumeXIcon} size="sm" color="inherit" />}
        />
        <ToggleButton
          label={`Solo ${name}`}
          size="sm"
          isPressed={state.isSoloed}
          onPressedChange={isPressed => onPatch(id, {isSoloed: isPressed})}
          tooltip="Solo"
          isIconOnly
          icon={<Icon icon={HeadphonesIcon} size="sm" color="inherit" />}
        />
        {hasArm && (
          <ToggleButton
            label={`Record arm ${name}`}
            size="sm"
            isPressed={state.isArmed}
            onPressedChange={isPressed => onPatch(id, {isArmed: isPressed})}
            tooltip="Record arm"
            isIconOnly
            icon={<Icon icon={CircleIcon} size="sm" color="inherit" />}
            pressedIcon={
              <span style={styles.armDot}>
                <Icon icon={CircleIcon} size="sm" color="inherit" />
              </span>
            }
          />
        )}
      </div>
      <div onClick={event => event.stopPropagation()} role="presentation">
        <Selector
          label={`${name} automation mode`}
          isLabelHidden
          size="sm"
          options={AUTOMATION_OPTIONS}
          value={state.automation}
          onChange={value => onPatch(id, {automation: value as AutomationMode})}
        />
      </div>
    </div>
  );
}

// ============= MASTER STRIP =============

function MasterStrip({
  faderDb, levels, gainReductionDb, isDimmed, isMono, onFaderChange,
}: {
  faderDb: number;
  levels: StripLevels;
  gainReductionDb: number;
  isDimmed: boolean;
  isMono: boolean;
  onFaderChange: (db: number) => void;
}) {
  const isLimiting = gainReductionDb > 0;
  return (
    <div style={styles.masterCol} aria-label="Master strip">
      <HStack gap={1} vAlign="center">
        <Icon icon={AudioLinesIcon} size="sm" color="secondary" />
        <Text type="body" weight="semibold">
          Master
        </Text>
      </HStack>
      <span style={styles.routeLabel}>Stereo out · 48 kHz</span>
      <Tooltip
        content={`Brickwall limiter at ${LIMITER_THRESHOLD_DB.toFixed(1)} dBFS — ${
          isLimiting ? 'reducing gain' : 'idle'
        }`}>
        <div style={styles.limiterRow}>
          <span
            style={{
              ...styles.limiterLed,
              ...(isLimiting ? styles.limiterLedLit : undefined),
            }}
            aria-hidden
          />
          <span style={{...styles.insertName, fontSize: 10}}>Lim −1.0</span>
          <span
            style={{
              ...styles.dbReadout,
              color: isLimiting ? undefined : 'var(--color-text-secondary)',
            }}>
            GR {gainReductionDb.toFixed(1)}
          </span>
        </div>
      </Tooltip>
      <div style={styles.meterWell}>
        <DbScale />
        <div style={styles.faderCol}>
          <Slider
            label="Master fader"
            isLabelHidden
            orientation="vertical"
            value={faderDb}
            min={DB_FLOOR}
            max={DB_CEIL}
            step={0.5}
            valueDisplay="none"
            formatValue={formatDb}
            onChange={onFaderChange}
          />
        </div>
        <StereoMeter
          label="Master output level"
          levelL={levels.levelL}
          levelR={levels.levelR}
          peakL={levels.peakL}
          peakR={levels.peakR}
        />
      </div>
      <span style={styles.dbReadout}>{formatDb(faderDb)}</span>
      <HStack gap={1} hAlign="center">
        {isDimmed && <Badge label="DIM −20" variant="warning" />}
        {isMono && <Badge label="MONO" variant="info" />}
        {!isDimmed && !isMono && (
          <Text type="supporting" color="secondary">
            Monitor: full
          </Text>
        )}
      </HStack>
    </div>
  );
}

// ============= INSPECTOR PANEL =============

interface SelectedStripInfo {
  id: string;
  name: string;
  detail: string; // source filename or bus caption
  routeLabel: string;
  tint: string;
  inserts: InsertPlugin[];
  isBus: boolean;
}

function InspectorPanel({
  info, state, levels, onPatch, onToggleBypass,
}: {
  info: SelectedStripInfo | null;
  state: StripState | null;
  levels: StripLevels | null;
  onPatch: (id: string, patch: Partial<StripState>) => void;
  onToggleBypass: (id: string, insertId: string) => void;
}) {
  if (info == null || state == null || levels == null) {
    return (
      <div style={styles.panelScroll}>
        <div style={styles.panelEmpty}>
          <VStack gap={1} hAlign="center">
            <Text type="body" weight="semibold">
              No strip selected
            </Text>
            <Text type="supporting" color="secondary">
              Click a channel or bus strip to inspect its chain.
            </Text>
          </VStack>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.panelScroll}>
      <VStack gap={3}>
        <Card padding={3}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="body" weight="semibold" maxLines={1} style={{fontFamily: MONO}}>
                  {info.name}
                </Text>
              </StackItem>
              <Badge label={info.isBus ? 'Bus' : 'Channel'} variant="neutral" />
            </HStack>
            <Text type="supporting" color="secondary" maxLines={1} style={{fontFamily: MONO}}>
              {info.detail}
            </Text>
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="secondary">
                → {info.routeLabel}
              </Text>
              <StackItem size="fill">
                <span />
              </StackItem>
              <Text type="supporting" hasTabularNumbers style={styles.mono}>
                {formatDb(state.faderDb)} · {formatPan(state.pan)}
              </Text>
            </HStack>
          </VStack>
        </Card>

        <VStack gap={1}>
          <Text type="label" color="secondary">
            Output
          </Text>
          <HStack gap={2}>
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Level L / R
              </Text>
            </StackItem>
            <Text type="supporting" hasTabularNumbers style={styles.mono}>
              {formatDb(levels.levelL)} / {formatDb(levels.levelR)}
            </Text>
          </HStack>
          <HStack gap={2}>
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Peak hold
              </Text>
            </StackItem>
            <Text type="supporting" hasTabularNumbers style={styles.mono}>
              {formatDb(Math.max(levels.peakL, levels.peakR))}
            </Text>
          </HStack>
        </VStack>

        <Divider />

        <VStack gap={2}>
          <Text type="label" color="secondary">
            Insert chain
          </Text>
          {info.inserts.length === 0 && (
            <Text type="supporting" color="secondary">
              No inserts on this strip.
            </Text>
          )}
          {info.inserts.map((plugin, index) => (
            <HStack key={plugin.id} gap={2} vAlign="center">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {index + 1}
              </Text>
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="supporting" weight="semibold">
                    {plugin.name}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {KIND_LABEL[plugin.kind]}
                  </Text>
                </VStack>
              </StackItem>
              <Switch
                label={`${plugin.name} active`}
                isLabelHidden
                value={!state.bypassed[plugin.id]}
                onChange={() => onToggleBypass(info.id, plugin.id)}
              />
            </HStack>
          ))}
        </VStack>

        <Divider />

        {!info.isBus && (
          <Card padding={3}>
            <VStack gap={2}>
              <Text type="label" color="secondary">
                Send · Harbor Verb (aux)
              </Text>
              <Slider
                label="Harbor Verb send level"
                isLabelHidden
                value={state.sendDb}
                min={DB_FLOOR}
                max={0}
                step={1}
                valueDisplay="text"
                formatValue={formatDb}
                onChange={(v: number) => onPatch(info.id, {sendDb: v})}
              />
              <Text type="supporting" color="secondary">
                Post-fader send into the shared convolution reverb.
              </Text>
            </VStack>
          </Card>
        )}

        <Selector
          label="Automation mode"
          size="sm"
          options={AUTOMATION_OPTIONS}
          value={state.automation}
          onChange={value => onPatch(info.id, {automation: value as AutomationMode})}
        />
        <Text type="supporting" color="secondary">
          {AUTOMATION_HINT[state.automation]}
        </Text>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

const SILENT: StripLevels = {
  levelL: DB_FLOOR, levelR: DB_FLOOR, peakL: DB_FLOOR, peakR: DB_FLOOR,
};

export default function VideoEditorAudioMixerTemplate() {
  const [strips, setStrips] = useState<Record<string, StripState>>(initialStripState);
  const [selectedId, setSelectedId] = useState<string | null>('dx1');
  const [masterFaderDb, setMasterFaderDb] = useState(-0.5);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMonoCheck, setIsMonoCheck] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const isNarrow = useMediaQuery('(max-width: 1100px)');
  const isCompact = useMediaQuery('(max-width: 768px)');

  const patchStrip = useCallback((id: string, patch: Partial<StripState>) => {
    setStrips(prev => ({...prev, [id]: {...prev[id], ...patch}}));
  }, []);
  const toggleBypass = useCallback((id: string, insertId: string) => {
    setStrips(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        bypassed: {...prev[id].bypassed, [insertId]: !prev[id].bypassed[insertId]},
      },
    }));
  }, []);
  const selectStrip = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  // ----- Deterministic level math (all derived during render) -----
  // Solo logic: soloing a channel also keeps its bus alive; soloing a bus
  // keeps its members' contribution audible on that bus.
  const soloActive =
    CHANNELS.some(c => strips[c.id].isSoloed) || BUSES.some(b => strips[b.id].isSoloed);

  const isChannelAudible = (c: ChannelFixture): boolean => {
    const s = strips[c.id];
    if (s.isMuted || strips[c.bus].isMuted) {
      return false;
    }
    if (!soloActive) {
      return true;
    }
    return s.isSoloed || strips[c.bus].isSoloed;
  };

  /** Channel contribution in dBFS: base + fader + a 15 dB pan law, muted
   * or solo-excluded strips fall to the floor. Peaks ride the same math. */
  const channelLevels = (c: ChannelFixture): StripLevels => {
    if (!isPlaying || !isChannelAudible(c)) {
      return SILENT;
    }
    const s = strips[c.id];
    const panAttL = s.pan > 0 ? -(s.pan / 100) * 15 : 0;
    const panAttR = s.pan < 0 ? (s.pan / 100) * 15 : 0;
    const levelL = c.baseL + s.faderDb + panAttL;
    const levelR = c.baseR + s.faderDb + panAttR;
    return {
      levelL, levelR,
      peakL: levelL + c.peakOffset, peakR: levelR + c.peakOffset,
    };
  };

  /** Bus level = loudest member contribution through the bus fader. */
  const busLevels = (b: BusFixture): StripLevels => {
    const s = strips[b.id];
    if (s.isMuted || (soloActive && !s.isSoloed && !CHANNELS_BY_BUS[b.id].some(c => strips[c.id].isSoloed))) {
      return SILENT;
    }
    let out = {...SILENT};
    for (const c of CHANNELS_BY_BUS[b.id]) {
      const lv = channelLevels(c);
      out = {
        levelL: Math.max(out.levelL, lv.levelL), levelR: Math.max(out.levelR, lv.levelR),
        peakL: Math.max(out.peakL, lv.peakL), peakR: Math.max(out.peakR, lv.peakR),
      };
    }
    if (out.levelL <= DB_FLOOR && out.levelR <= DB_FLOOR) {
      return SILENT;
    }
    return {
      levelL: out.levelL + s.faderDb, levelR: out.levelR + s.faderDb,
      peakL: out.peakL + s.faderDb, peakR: out.peakR + s.faderDb,
    };
  };

  const busLevelById: Record<BusId, StripLevels> = {
    dia: busLevels(BUS_BY_ID.dia),
    mus: busLevels(BUS_BY_ID.mus),
    sfx: busLevels(BUS_BY_ID.sfx),
    amb: busLevels(BUS_BY_ID.amb),
  };

  // Master: loudest bus through the master fader and monitor section,
  // then the -1.0 dBFS brickwall — GR is whatever pokes above threshold.
  let preL = DB_FLOOR;
  let preR = DB_FLOOR;
  let prePkL = DB_FLOOR;
  let prePkR = DB_FLOOR;
  for (const b of BUSES) {
    const lv = busLevelById[b.id];
    preL = Math.max(preL, lv.levelL);
    preR = Math.max(preR, lv.levelR);
    prePkL = Math.max(prePkL, lv.peakL);
    prePkR = Math.max(prePkR, lv.peakR);
  }
  const monitorTrim = (isDimmed ? -20 : 0) + masterFaderDb;
  if (preL > DB_FLOOR) {
    preL += monitorTrim;
    preR += monitorTrim;
    prePkL += monitorTrim;
    prePkR += monitorTrim;
  }
  if (isMonoCheck && preL > DB_FLOOR) {
    const mid = (preL + preR) / 2;
    const midPk = (prePkL + prePkR) / 2;
    preL = mid;
    preR = mid;
    prePkL = midPk;
    prePkR = midPk;
  }
  const rawMasterPeak = Math.max(prePkL, prePkR);
  const gainReductionDb =
    rawMasterPeak > LIMITER_THRESHOLD_DB ? rawMasterPeak - LIMITER_THRESHOLD_DB : 0;
  const masterLevels: StripLevels = {
    levelL: Math.min(preL, LIMITER_THRESHOLD_DB), levelR: Math.min(preR, LIMITER_THRESHOLD_DB),
    peakL: Math.min(prePkL, LIMITER_THRESHOLD_DB), peakR: Math.min(prePkR, LIMITER_THRESHOLD_DB),
  };

  // ----- Selected strip info for the inspector -----
  const selectedChannel = CHANNELS.find(c => c.id === selectedId) ?? null;
  const selectedBus = BUSES.find(b => b.id === selectedId) ?? null;
  const selectedInfo: SelectedStripInfo | null =
    selectedChannel != null
      ? {
          id: selectedChannel.id,
          name: selectedChannel.shortName,
          detail: selectedChannel.sourceFile,
          routeLabel: `${BUS_BY_ID[selectedChannel.bus].label} bus`,
          tint: BUS_BY_ID[selectedChannel.bus].tint,
          inserts: selectedChannel.inserts,
          isBus: false,
        }
      : selectedBus != null
        ? {
            id: selectedBus.id,
            name: `${selectedBus.label} · ${selectedBus.caption}`,
            detail: `${CHANNELS_BY_BUS[selectedBus.id].length} source channels`,
            routeLabel: 'Master',
            tint: selectedBus.tint,
            inserts: selectedBus.inserts,
            isBus: true,
          }
        : null;
  const selectedLevels =
    selectedChannel != null
      ? channelLevels(selectedChannel)
      : selectedBus != null
        ? busLevelById[selectedBus.id]
        : null;

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center" style={styles.headerRow}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={AudioLinesIcon} size="md" color="secondary" />
            <Heading level={1}>{SESSION_NAME}</Heading>
            <Badge label="Saved" variant="success" />
            {!isCompact && (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {SAMPLE_RATE} · stereo
              </Text>
            )}
          </HStack>
        </StackItem>
        {!isCompact && (
          <>
            <ToggleButton
              label="Mono check"
              size="sm"
              isPressed={isMonoCheck}
              onPressedChange={setIsMonoCheck}
              tooltip="Fold the monitor path to mono"
              isIconOnly
              icon={<Icon icon={Volume1Icon} size="sm" color="inherit" />}
            />
            <ToggleButton
              label="Dim monitors 20 dB"
              size="sm"
              isPressed={isDimmed}
              onPressedChange={setIsDimmed}
              tooltip="Dim monitors −20 dB"
              isIconOnly
              icon={<Icon icon={VolumeXIcon} size="sm" color="inherit" />}
            />
          </>
        )}
        <IconButton
          label={isPanelOpen ? 'Hide channel inspector' : 'Show channel inspector'}
          tooltip={isPanelOpen ? 'Hide inspector' : 'Show inspector'}
          icon={
            <Icon
              icon={isPanelOpen ? PanelRightCloseIcon : PanelRightOpenIcon}
              size="sm"
              color="inherit"
            />
          }
          variant="ghost"
          size="sm"
          isDisabled={isNarrow}
          onClick={() => setIsPanelOpen(prev => !prev)}
        />
        <Button
          label="Bounce Mix"
          variant="primary"
          size="sm"
          icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- Console -----
  const renderChannelStrip = (c: ChannelFixture) => (
    <MixStrip
      key={c.id}
      id={c.id}
      name={c.shortName}
      routeLabel={`${BUS_BY_ID[c.bus].label} bus`}
      tint={BUS_BY_ID[c.bus].tint}
      inserts={c.inserts}
      state={strips[c.id]}
      levels={channelLevels(c)}
      isSelected={selectedId === c.id}
      hasArm
      onSelect={selectStrip}
      onPatch={patchStrip}
      onToggleBypass={toggleBypass}
    />
  );

  const console_ = (
    <LayoutContent padding={0}>
      <div style={styles.consoleBand}>
        <div style={styles.consoleScroll}>
          <div style={styles.consoleRow}>
            {BUSES.map(bus => (
              <div key={bus.id} style={styles.groupCol}>
                <div style={{...styles.groupChip, backgroundColor: bus.tintSoft}}>
                  <Icon icon={bus.icon} size="sm" color="secondary" />
                  <Text type="supporting" weight="semibold">
                    {bus.caption}
                  </Text>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {CHANNELS_BY_BUS[bus.id].length}
                  </Text>
                </div>
                <div style={styles.groupStrips}>
                  {CHANNELS_BY_BUS[bus.id].map(renderChannelStrip)}
                </div>
              </div>
            ))}
            <Divider orientation="vertical" />
            <div style={styles.groupCol}>
              <div style={styles.groupChip}>
                <Icon icon={AudioLinesIcon} size="sm" color="secondary" />
                <Text type="supporting" weight="semibold">
                  Buses
                </Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {BUSES.length}
                </Text>
              </div>
              <div style={styles.groupStrips}>
                {BUSES.map(bus => (
                  <MixStrip
                    key={bus.id}
                    id={bus.id}
                    name={`${bus.label} ${bus.caption}`}
                    routeLabel="Master"
                    tint={bus.tint}
                    inserts={bus.inserts}
                    state={strips[bus.id]}
                    levels={busLevelById[bus.id]}
                    isSelected={selectedId === bus.id}
                    hasArm={false}
                    onSelect={selectStrip}
                    onPatch={patchStrip}
                    onToggleBypass={toggleBypass}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <MasterStrip
          faderDb={masterFaderDb}
          levels={masterLevels}
          gainReductionDb={gainReductionDb}
          isDimmed={isDimmed}
          isMono={isMonoCheck}
          onFaderChange={setMasterFaderDb}
        />
      </div>
    </LayoutContent>
  );

  // ----- Inspector panel (300px, collapsible) -----
  const inspector =
    isPanelOpen && !isNarrow ? (
      <LayoutPanel width={300} padding={0} hasDivider label="Channel inspector">
        <InspectorPanel
          info={selectedInfo}
          state={selectedId != null ? strips[selectedId] : null}
          levels={selectedLevels}
          onPatch={patchStrip}
          onToggleBypass={toggleBypass}
        />
      </LayoutPanel>
    ) : undefined;

  // ----- Footer status bar -----
  const footer = (
    <LayoutFooter hasDivider padding={0} label="Transport and session status">
      <Toolbar
        label="Session status"
        size="sm"
        gap={1}
        startContent={
          <>
            <IconButton
              label={isPlaying ? 'Stop playback' : 'Play'}
              tooltip={isPlaying ? 'Stop' : 'Play'}
              icon={
                <Icon icon={isPlaying ? SquareIcon : PlayIcon} size="sm" color="inherit" />
              }
              variant="secondary"
              size="sm"
              onClick={() => setIsPlaying(prev => !prev)}
            />
            <Text type="supporting" hasTabularNumbers style={styles.mono}>
              {SEQUENCE_TC}
            </Text>
            <Badge
              label={isPlaying ? 'Playing' : 'Stopped'}
              variant={isPlaying ? 'info' : 'neutral'}
            />
          </>
        }
        centerContent={
          soloActive ? (
            <Badge label="SOLO in place" variant="warning" />
          ) : (
            <Text type="supporting" color="secondary">
              {CHANNELS.length} channels · {BUSES.length} buses · 1 aux
            </Text>
          )
        }
        endContent={
          !isCompact ? (
            <Text type="supporting" color="secondary" hasTabularNumbers>
              DSP 34% · disk 12 MB/s
            </Text>
          ) : undefined
        }
      />
    </LayoutFooter>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={console_}
        end={inspector}
        footer={footer}
      />
    </div>
  );
}
