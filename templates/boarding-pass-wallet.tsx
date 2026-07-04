// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one Skylark Air flight — SL 214,
 *   SFO → LIS on Tue Jul 14 2026, passenger AVERY MORROW, seat 14A,
 *   group B, gate B22, confirmation SKYQ7F4 — plus the delayed variant of
 *   the same flight: +45 min, gate B22 → C4; the QR pattern is derived
 *   from a charCode-fold hash of the confirmation code, no randomness)
 * @output Wallet-style boarding pass card for the fictional airline
 *   'Skylark Air', presented as a SMALL centered experience: a sky-gradient
 *   airline header strip (wordmark + flight chip), a route hero with big
 *   SFO/LIS airport codes around a plane glyph on a dashed track, a
 *   passenger/seat/group/gate fact grid, a boards-at time chip beside an
 *   amber 'Boarding soon' live status strip with a pulsing dot, a
 *   perforation divider with punched side notches, a deterministic QR-code
 *   SVG with a screen-brightness hint, and an 'Add to wallet' brand CTA
 *   below the card. A second specimen beside it freezes the flight-delay
 *   variant: red status strip, struck-through boarding time and old gate,
 *   new gate C4 highlighted. Mono state-id Token captions label the pair.
 * @position Block template; emitted by `astryx template boarding-pass-wallet`
 *
 * Frame: no app shell — this is an individual small experience. A full-bleed
 * stage div (minHeight 100dvh, token muted background with a faint brand
 * radial wash) centers a small header line and an HStack of two pass
 * specimens at natural card width (400px), wrapping to a stacked column on
 * narrow viewports. Each specimen is caption (Token + note) over the card;
 * the 'Add to wallet' CTA hangs below specimen 01 only.
 *
 * Responsive contract:
 * - Cards are width: min(400px, 100%); the specimen row flexWraps and
 *   centers, so <=880px renders one card per row, still centered.
 * - The stage scrolls vertically when the stacked pair exceeds the
 *   viewport; nothing inside the card scrolls or truncates — the fact grid
 *   is fixed 3-column at card width by design.
 * - The route hero, fact grid, and QR block share the card's inline
 *   padding so all edges align to one gutter.
 *
 * Container policy (small-experience archetype): the pass itself is one
 * custom card surface (--color-background-card, high shadow) because the
 * perforation notches and gradient header strip are its anatomy — a
 * design-system Card cannot host punched notches. Everything around it
 * (captions, CTA, stage header) is plain stacked text and Buttons; no
 * nested Cards.
 *
 * Color policy: ONE brand accent — Skylark navy
 * light-dark(#1E40AF, #93C5FD) — used for the CTA fill, the confirmation
 * chip, and the boards-at chip tint. The airline header strip is a
 * scheme-locked sky-gradient artwork band (explicit literals, white text
 * over the navy end, a rgba navy plate under the flight chip so white
 * always clears AA); it is pinned with colorScheme: 'dark' and documented
 * here per the locked-surface exception. Status semantics (amber boarding
 * pulse, red delay) use --color-warning / --color-error tokens, not the
 * brand accent. Everything else is token-pure in both schemes.
 *
 * Motion: the live-status dot pulse is a CSS keyframe ring gated by
 * prefers-reduced-motion (falls back to the static dot color).
 *
 * Fixture policy: fixed strings and times only; no clocks, no randomness,
 * no network assets. The QR placeholder is generated from a deterministic
 * LCG seeded by the confirmation code's charCode fold.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  ArrowRightIcon,
  BirdIcon,
  CheckIcon,
  ClockIcon,
  PlaneIcon,
  SunMediumIcon,
  WalletIcon,
} from 'lucide-react';

import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Token} from '@astryxdesign/core/Token';

// ============= BRAND CONSTANTS =============
// Exactly ONE brand accent: Skylark navy. Light side blue-800, dark side
// blue-300; both directions AA-checked where they touch text (CTA fill
// carries light-dark text literals below, chips keep text on tokens).

const BRAND_ACCENT = 'light-dark(#1E40AF, #93C5FD)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(30,64,175,0.10), rgba(147,197,253,0.14))';
// Text ON the accent fill: white on navy (light), deep navy on the pale
// blue-300 fill (dark) — both >= 7:1.
const ON_ACCENT_TEXT = 'light-dark(#FFFFFF, #0B1B3F)';

// Sky-gradient header strip: scheme-locked artwork band (explicit
// literals only; colorScheme 'dark' pinned on the strip). White text sits
// on the navy 60% of the ramp; the flight chip adds its own navy plate.
const SKY_GRADIENT =
  'linear-gradient(118deg, #0B1F4E 0%, #16337E 34%, #1D4ED8 68%, #38BDF8 100%)';
const SKY_TEXT = '#FFFFFF';
const SKY_TEXT_DIM = 'rgba(226,232,240,0.82)';
const SKY_CHIP_PLATE = 'rgba(9,20,45,0.52)';

// Stage backdrop — the perforation notches punch "through" the card by
// painting this exact color, so it is a single flat token surface.
const STAGE_BG = 'var(--color-background-muted)';

// ============= KEYFRAMES =============
// One pulse ring for the live-status dot; --bpw-pulse is set per variant
// (amber for boarding-soon, red for delayed). Reduced motion removes the
// animation entirely — the static dot still encodes the status.

const GLOBAL_CSS = `
@keyframes bpw-pulse {
  0% { box-shadow: 0 0 0 0 var(--bpw-pulse); }
  70% { box-shadow: 0 0 0 7px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
.bpw-live-dot {
  animation: bpw-pulse 1.8s ease-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .bpw-live-dot { animation: none; }
}
`;

// ============= STYLES (1/2 — stage, card, header, route) =============

const styles: Record<string, CSSProperties> = {
  // --- Stage: full-bleed centered backdrop for the small experience ---
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
    backgroundColor: STAGE_BG,
  },
  stageHeader: {textAlign: 'center'},
  specimenRow: {
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  specimenColumn: {width: 'min(400px, 100%)'},
  captionRow: {paddingInline: 'var(--spacing-1)'},

  // --- Pass card shell ---
  card: {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 16,
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
  },

  // --- Sky-gradient airline header strip (scheme-locked artwork) ---
  headerStrip: {
    colorScheme: 'dark',
    background: SKY_GRADIENT,
    paddingBlock: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  wordmarkGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    color: SKY_TEXT,
    flexShrink: 0,
  },
  wordmark: {
    color: SKY_TEXT,
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: '0.08em',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },
  wordmarkSub: {
    color: SKY_TEXT_DIM,
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    lineHeight: 1.3,
  },
  flightChip: {
    marginLeft: 'auto',
    backgroundColor: SKY_CHIP_PLATE,
    borderRadius: 999,
    paddingBlock: 4,
    paddingInline: 'var(--spacing-3)',
    textAlign: 'center',
    flexShrink: 0,
  },
  flightChipCode: {
    color: SKY_TEXT,
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
  },
  flightChipLabel: {
    color: SKY_TEXT_DIM,
    fontSize: 9,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    lineHeight: 1.2,
  },

  // --- Route hero: SFO —✈— LIS ---
  routeHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-4)',
    paddingInline: 'var(--spacing-4)',
  },
  airportCode: {
    fontSize: 40,
    fontWeight: 700,
    letterSpacing: '0.02em',
    lineHeight: 1.05,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  airportBlockEnd: {textAlign: 'end'},
  // Text renders inline; each city/time line needs its own block so
  // 'San Francisco' and 'Departs 18:05' don't run together on one line.
  airportMetaLine: {display: 'block'},
  routeTrack: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minWidth: 0,
  },
  routeDash: {
    flex: 1,
    borderTop: '2px dashed var(--color-border)',
  },
  routePlane: {
    display: 'inline-flex',
    transform: 'rotate(45deg)',
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  routeMetaRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 'calc(var(--spacing-2) * -1)',
    paddingBottom: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-4)',
  },
  // --- Fact grid: passenger / seat / group / gate / terminal / date ---
  factGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr 1fr',
    rowGap: 'var(--spacing-3)',
    columnGap: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
  },
  factLabel: {
    fontSize: 10,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.4,
  },
  // Third grid column sits against the card's right gutter — right-align
  // it so GROUP/FLIGHT share the flush edge with the LIS block above.
  factCellEnd: {textAlign: 'end'},
  factValue: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.35,
    whiteSpace: 'nowrap',
  },
  factStruck: {
    textDecoration: 'line-through',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
  },
  gateChangedValue: {color: 'var(--color-error)'},

  // --- Boards-at chip + live status strip ---
  boardingRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
  },
  boardsChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    borderRadius: 10,
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  boardsChipText: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.3,
  },
  statusStrip: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    borderRadius: 10,
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
  },
  statusStripWarning: {backgroundColor: 'var(--color-warning-muted)'},
  statusStripError: {backgroundColor: 'var(--color-error-muted)'},
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.35,
    color: 'var(--color-text-primary)',
  },
  statusSubText: {
    fontSize: 11,
    lineHeight: 1.35,
    color: 'var(--color-text-secondary)',
  },

  // --- Perforation divider: dashed rule + punched side notches ---
  perforation: {
    position: 'relative',
    height: 0,
    borderTop: '2px dashed var(--color-border)',
    marginInline: 'var(--spacing-3)',
  },
  notch: {
    position: 'absolute',
    top: -9,
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: STAGE_BG,
    border: 'var(--border-width) solid var(--color-border)',
  },
  notchStart: {left: 'calc(var(--spacing-3) * -1 - 9px)'},
  notchEnd: {right: 'calc(var(--spacing-3) * -1 - 9px)'},

  // --- QR stub ---
  qrStub: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-4)',
    paddingInline: 'var(--spacing-4)',
  },
  qrFrame: {
    padding: 'var(--spacing-2)',
    borderRadius: 12,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-primary)',
    lineHeight: 0,
  },
  confChip: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    letterSpacing: '0.08em',
  },
  brightnessHint: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    color: 'var(--color-text-secondary)',
  },

  // --- Add-to-wallet CTA (brand navy pill under specimen 01) ---
  walletButton: {
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT_TEXT,
    borderColor: 'transparent',
    borderRadius: 999,
    width: '100%',
  },
  walletButtonAdded: {
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    borderColor: 'transparent',
    borderRadius: 999,
    width: '100%',
  },
};

// ============= FIXTURES =============
// One flight, two frozen moments. Every number that appears twice agrees:
// boards 17:35 + doors close 17:50 precede the 18:05 departure; the delay
// shifts all three by exactly +45 min (18:20 / 18:35 / 18:50) and arrival
// 12:50 +1 → 13:35 +1. No clocks anywhere — these are printed times.

const FLIGHT = {
  airline: 'SKYLARK AIR',
  tagline: 'Boarding pass',
  code: 'SL 214',
  fromCode: 'SFO',
  fromCity: 'San Francisco',
  toCode: 'LIS',
  toCity: 'Lisbon',
  duration: '10h 45m · nonstop',
  date: 'Tue, Jul 14 2026',
  passenger: 'MORROW / AVERY',
  seat: '14A',
  group: 'B',
  terminal: 'Intl',
  confirmation: 'SKYQ7F4',
};

interface PassVariant {
  id: string;
  captionId: string;
  captionNote: string;
  gate: string;
  oldGate?: string;
  boards: string;
  oldBoards?: string;
  departs: string;
  arrives: string;
  status: 'warning' | 'error';
  statusText: string;
  statusSubText: string;
}

const ON_TIME: PassVariant = {
  id: 'on-time',
  captionId: '01 · boarding-soon',
  captionNote: 'Live amber strip — boarding opens in 20 minutes.',
  gate: 'B22',
  boards: '17:35',
  departs: '18:05',
  arrives: '12:50 +1',
  status: 'warning',
  statusText: 'Boarding soon',
  statusSubText: 'Doors close 17:50 · gate B22',
};

const DELAYED: PassVariant = {
  id: 'delayed',
  captionId: '02 · delayed',
  captionNote: 'Delay variant — +45 min, gate B22 → C4.',
  gate: 'C4',
  oldGate: 'B22',
  boards: '18:20',
  oldBoards: '17:35',
  departs: '18:50',
  arrives: '13:35 +1',
  status: 'error',
  statusText: 'Delayed 45 min',
  statusSubText: 'New gate C4 · doors close 18:35',
};

// ============= QR PLACEHOLDER =============
// Deterministic 21×21 module pattern seeded by a charCode fold of the
// confirmation code: three real finder squares, timing lines, and LCG
// noise for the data area. It scans as "QR-shaped", not as a real code.

const QR_MODULES = 21;

function isFinderZone(row: number, col: number): boolean {
  const inBlock = (r0: number, c0: number) =>
    row >= r0 && row < r0 + 7 && col >= c0 && col < c0 + 7;
  return inBlock(0, 0) || inBlock(0, QR_MODULES - 7) || inBlock(QR_MODULES - 7, 0);
}

function isFinderDark(row: number, col: number, r0: number, c0: number): boolean {
  const r = row - r0;
  const c = col - c0;
  const ring = r === 0 || r === 6 || c === 0 || c === 6;
  const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
  return ring || core;
}

function buildQrCells(seedText: string): boolean[][] {
  let seed = 0;
  for (let i = 0; i < seedText.length; i++) {
    seed = (seed * 31 + seedText.charCodeAt(i)) % 2147483647;
  }
  let state = seed || 7;
  const next = () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
  const cells: boolean[][] = [];
  for (let row = 0; row < QR_MODULES; row++) {
    const line: boolean[] = [];
    for (let col = 0; col < QR_MODULES; col++) {
      if (isFinderZone(row, col)) {
        const r0 = row < 7 ? 0 : QR_MODULES - 7;
        const c0 = col < 7 ? 0 : QR_MODULES - 7;
        line.push(isFinderDark(row, col, r0, c0));
      } else if (row === 6 || col === 6) {
        line.push((row + col) % 2 === 0); // timing pattern
      } else {
        line.push(next() > 0.52);
      }
    }
    cells.push(line);
  }
  return cells;
}

// Hoisted once at module level — the pattern never changes at runtime.
const QR_CELLS = buildQrCells(FLIGHT.confirmation);

function QrCodeArt() {
  return (
    <svg
      width={126}
      height={126}
      viewBox={`0 0 ${QR_MODULES} ${QR_MODULES}`}
      role="img"
      aria-label={`Boarding QR code for confirmation ${FLIGHT.confirmation}`}>
      {QR_CELLS.flatMap((line, row) =>
        line.map((isDark, col) =>
          isDark ? (
            <rect
              key={`${row}-${col}`}
              x={col}
              y={row}
              width={1}
              height={1}
              fill="currentColor"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

// ============= PASS SUB-COMPONENTS =============

/** Sky-gradient airline header strip — scheme-locked artwork band. */
function AirlineHeaderStrip() {
  return (
    <div style={styles.headerStrip}>
      <span style={styles.wordmarkGlyph}>
        <Icon icon={BirdIcon} size="sm" color="inherit" />
      </span>
      <div>
        <div style={styles.wordmark}>{FLIGHT.airline}</div>
        <div style={styles.wordmarkSub}>{FLIGHT.tagline}</div>
      </div>
      <div style={styles.flightChip}>
        <div style={styles.flightChipCode}>{FLIGHT.code}</div>
        <div style={styles.flightChipLabel}>Flight</div>
      </div>
    </div>
  );
}

/** Route hero: big airport codes around a plane glyph on a dashed track. */
function RouteHero({variant}: {variant: PassVariant}) {
  return (
    <>
      <div style={styles.routeHero}>
        <div>
          <div style={styles.airportCode}>{FLIGHT.fromCode}</div>
          <div style={styles.airportMetaLine}>
            <Text type="supporting" color="secondary">
              {FLIGHT.fromCity}
            </Text>
          </div>
          <div style={styles.airportMetaLine}>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Departs {variant.departs}
            </Text>
          </div>
        </div>
        <div style={styles.routeTrack} aria-hidden="true">
          <span style={styles.routeDash} />
          <span style={styles.routePlane}>
            <Icon icon={PlaneIcon} size="md" color="inherit" />
          </span>
          <span style={styles.routeDash} />
        </div>
        <div style={styles.airportBlockEnd}>
          <div style={styles.airportCode}>{FLIGHT.toCode}</div>
          <div style={styles.airportMetaLine}>
            <Text type="supporting" color="secondary">
              {FLIGHT.toCity}
            </Text>
          </div>
          <div style={styles.airportMetaLine}>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Arrives {variant.arrives}
            </Text>
          </div>
        </div>
      </div>
      <div style={styles.routeMetaRow}>
        <Text type="supporting" color="secondary">
          {FLIGHT.date} · {FLIGHT.duration}
        </Text>
      </div>
    </>
  );
}

/** One labeled cell of the fact grid; `isEnd` right-aligns column 3. */
function Fact({
  label,
  isEnd = false,
  children,
}: {
  label: string;
  isEnd?: boolean;
  children: ReactNode;
}) {
  return (
    <div style={isEnd ? styles.factCellEnd : undefined}>
      <div style={styles.factLabel}>{label}</div>
      <div style={styles.factValue}>{children}</div>
    </div>
  );
}

/** Passenger / seat / group / gate grid; delayed strikes the old gate. */
function FactGrid({variant}: {variant: PassVariant}) {
  return (
    <div style={styles.factGrid}>
      <Fact label="Passenger">{FLIGHT.passenger}</Fact>
      <Fact label="Seat">{FLIGHT.seat}</Fact>
      <Fact label="Group" isEnd>
        {FLIGHT.group}
      </Fact>
      <Fact label="Terminal">{FLIGHT.terminal}</Fact>
      <Fact label="Gate">
        {variant.oldGate != null ? (
          <HStack gap={1} vAlign="center">
            <span style={styles.factStruck}>{variant.oldGate}</span>
            <Icon icon={ArrowRightIcon} size="sm" color="secondary" />
            <span style={styles.gateChangedValue}>{variant.gate}</span>
          </HStack>
        ) : (
          variant.gate
        )}
      </Fact>
      <Fact label="Flight" isEnd>
        {FLIGHT.code}
      </Fact>
    </div>
  );
}

/** Boards-at chip beside the amber/red live status strip. */
function BoardingStatusRow({variant}: {variant: PassVariant}) {
  const isWarning = variant.status === 'warning';
  const stripStyle = isWarning
    ? {...styles.statusStrip, ...styles.statusStripWarning}
    : {...styles.statusStrip, ...styles.statusStripError};
  const dotColor = isWarning ? 'var(--color-warning)' : 'var(--color-error)';
  return (
    <div style={styles.boardingRow}>
      <div style={styles.boardsChip}>
        <Icon icon={ClockIcon} size="sm" color="inherit" />
        <span style={styles.boardsChipText}>
          {variant.oldBoards != null ? (
            <>
              Boards <span style={styles.factStruck}>{variant.oldBoards}</span>{' '}
              {variant.boards}
            </>
          ) : (
            <>Boards {variant.boards}</>
          )}
        </span>
      </div>
      <div style={stripStyle} role="status">
        <span
          className="bpw-live-dot"
          style={{
            ...styles.statusDot,
            backgroundColor: dotColor,
            ['--bpw-pulse' as string]: dotColor,
          }}
        />
        <div style={{minWidth: 0}}>
          <div style={styles.statusText}>{variant.statusText}</div>
          <div style={styles.statusSubText}>{variant.statusSubText}</div>
        </div>
      </div>
    </div>
  );
}

/** Perforation divider: dashed rule with punched side notches. */
function Perforation() {
  return (
    <div style={styles.perforation} aria-hidden="true">
      <span style={{...styles.notch, ...styles.notchStart}} />
      <span style={{...styles.notch, ...styles.notchEnd}} />
    </div>
  );
}

/** QR stub below the perforation: code art, confirmation, brightness hint. */
function QrStub() {
  return (
    <div style={styles.qrStub}>
      <div style={styles.qrFrame}>
        <QrCodeArt />
      </div>
      <Text type="supporting" color="secondary">
        Confirmation <span style={styles.confChip}>{FLIGHT.confirmation}</span>
      </Text>
      <span style={styles.brightnessHint}>
        <Icon icon={SunMediumIcon} size="sm" color="inherit" />
        <Text type="supporting" color="secondary">
          Brightness bumps to max at the scanner
        </Text>
      </span>
    </div>
  );
}

/** The full wallet pass card for one variant. */
function BoardingPassCard({variant}: {variant: PassVariant}) {
  return (
    <div style={styles.card}>
      <AirlineHeaderStrip />
      <RouteHero variant={variant} />
      <FactGrid variant={variant} />
      <BoardingStatusRow variant={variant} />
      <Perforation />
      <QrStub />
    </div>
  );
}

/** Caption (mono state-id Token + note) over one pass specimen. */
function PassSpecimen({
  variant,
  children,
}: {
  variant: PassVariant;
  children?: ReactNode;
}) {
  return (
    <div style={styles.specimenColumn}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" style={styles.captionRow}>
          <Token label={variant.captionId} size="sm" color="gray" />
          <StackItem size="fill">
            <Text type="supporting" color="secondary" maxLines={1}>
              {variant.captionNote}
            </Text>
          </StackItem>
        </HStack>
        <BoardingPassCard variant={variant} />
        {children}
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function BoardingPassWalletTemplate() {
  const [isAdded, setIsAdded] = useState(false);
  return (
    <div style={styles.stage}>
      <style>{GLOBAL_CSS}</style>
      <div style={styles.stageHeader}>
        <VStack gap={1} hAlign="center">
          <Heading level={1}>Skylark Air — boarding pass</Heading>
          <Text type="supporting" color="secondary">
            wallet card · live status + delay variant · deterministic fixtures
          </Text>
        </VStack>
      </div>
      <HStack gap={6} style={styles.specimenRow}>
        <PassSpecimen variant={ON_TIME}>
          <Button
            label={isAdded ? 'Added to wallet' : 'Add to wallet'}
            icon={
              <Icon
                icon={isAdded ? CheckIcon : WalletIcon}
                size="sm"
                color="inherit"
              />
            }
            variant="secondary"
            style={isAdded ? styles.walletButtonAdded : styles.walletButton}
            onClick={() => setIsAdded(prev => !prev)}
          />
        </PassSpecimen>
        <PassSpecimen variant={DELAYED} />
      </HStack>
    </div>
  );
}
