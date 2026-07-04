// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a fixed lock-screen clock 8:47 on
 *   Tuesday, July 14, 2026; a Skillet delivery order #4821 from Ember Thai
 *   Kitchen at 66% courier progress with an 8:59 PM ETA; a Courtside
 *   basketball score HRB Harbors 98 – PNR Pioneers 94 at Q4 2:36 with the
 *   Harbors in the bonus; and a Tidepool focus ring with 18:24 of a 25:00
 *   session remaining, ending 9:05 PM)
 * @output Live-activity widget gallery: three lock-screen-style glance
 *   specimens stacked on one blurred-gradient phone stage under a thin
 *   clock hint, each widget its own fictional brand — Skillet (orange food
 *   delivery: brand mark, ETA countdown, three-stop courier progress track
 *   with a bike rider marker, order summary line), Courtside (indigo live
 *   score: team monogram circles, quarter clock, bonus indicator), and
 *   Tidepool (teal focus timer: SVG ring countdown at 18:24 remaining,
 *   session label, pause glyph). Each specimen carries a small mono
 *   caption label. Token-pure page chrome frames the stage.
 * @position Block template; emitted by `astryx template live-activity-widget`
 *
 * Frame: single centered column (maxWidth 430) on a token-pure muted
 * backdrop — no app shell. Chrome (Heading + specimen-count Badge + intro
 * Text) sits above the lock-screen stage card; a token-pure footnote sits
 * below. Inside the stage: clock hint, then three captioned widget cards
 * in one vertical stack. No Cards from the design system on the stage —
 * the glassy widget shells are custom paint by design.
 *
 * Responsive contract:
 * - The column is fluid to 430px and centers at every width; the stage
 *   keeps its intrinsic height (no internal scrolling).
 * - <=480px: outer padding tightens; widget rows rely on flexWrap-free
 *   fixed layouts that already fit 320px content width (score numbers,
 *   ring, and ETA block all measured for the narrowest case).
 * - Nothing hides at any breakpoint; the gallery is one glanceable unit.
 *
 * Container policy (specimen-gallery archetype): the lock-screen stage is
 * one rounded custom surface; each live activity is a custom glass shell
 * (blur + hairline ring) because real lock-screen widgets are not app
 * cards. Page chrome outside the stage is token-pure text only.
 *
 * Color policy: the stage is SCHEME-LOCKED DARK (colorScheme: 'dark' +
 * explicit literal paint) because lock-screen live activities render on a
 * dark glass regardless of the OS scheme — the fixed-stage exception per
 * the suite footgun. Three widget-local brand accents live ONLY on the
 * locked stage as explicit literals (Skillet orange #FB923C, Courtside
 * indigo #A5B0FA, Tidepool teal #2DD4BF), one per fictional brand, never
 * escaping to the token-pure chrome outside the stage.
 */

import type {CSSProperties, ReactNode} from 'react';

import {
  BikeIcon,
  FlameIcon,
  LockIcon,
  PauseIcon,
  TrophyIcon,
  WavesIcon,
} from 'lucide-react';

import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';

// ============= SURFACE CONSTANTS =============
// The lock-screen stage is scheme-locked dark: every custom-painted color
// inside it is an explicit literal (never a token that flips). The chrome
// outside the stage stays token-pure.

const STAGE_TEXT = '#F1F3F8';
const STAGE_TEXT_DIM = 'rgba(241, 243, 248, 0.66)';
const STAGE_TEXT_FAINT = 'rgba(241, 243, 248, 0.58)';
const WIDGET_BG = 'rgba(16, 18, 30, 0.72)';
const WIDGET_RING = 'rgba(231, 234, 240, 0.14)';
const TRACK_BG = 'rgba(231, 234, 240, 0.16)';

// One brand accent per fictional widget brand — stage literals only.
const SKILLET_ORANGE = '#FB923C';
const SKILLET_ORANGE_SOFT = 'rgba(251, 146, 60, 0.18)';
const SKILLET_ON_ACCENT = '#221103';
const COURTSIDE_INDIGO = '#A5B0FA';
const COURTSIDE_INDIGO_SOFT = 'rgba(129, 140, 248, 0.20)';
const TIDEPOOL_TEAL = '#2DD4BF';
const TIDEPOOL_TEAL_SOFT = 'rgba(45, 212, 191, 0.16)';

// Focus ring geometry: r=30 → C≈188.5; 18:24 left of 25:00 → 73.6%.
const RING_RADIUS = 30;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_REMAINING = 1104 / 1500; // 18:24 of 25:00, in seconds

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // ---- Token-pure chrome around the stage ----
  root: {
    width: '100%',
    minHeight: '100dvh',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
  },
  column: {
    width: '100%',
    maxWidth: 430,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  chromeHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  footnote: {
    paddingInline: 'var(--spacing-1)',
  },

  // ---- Scheme-locked lock-screen stage (explicit literals only) ----
  stage: {
    colorScheme: 'dark',
    color: STAGE_TEXT,
    borderRadius: 36,
    border: '1px solid rgba(231, 234, 240, 0.10)',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    boxShadow: '0 24px 60px rgba(4, 6, 14, 0.35)',
    background: [
      'radial-gradient(120% 70% at 18% -4%, rgba(93, 62, 148, 0.55) 0%, rgba(93, 62, 148, 0) 58%)',
      'radial-gradient(110% 80% at 88% 12%, rgba(23, 84, 118, 0.5) 0%, rgba(23, 84, 118, 0) 55%)',
      'radial-gradient(90% 60% at 50% 108%, rgba(146, 84, 58, 0.32) 0%, rgba(146, 84, 58, 0) 60%)',
      'linear-gradient(180deg, #12141F 0%, #0A0C15 100%)',
    ].join(', '),
  },
  clockHint: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    paddingBlock: 'var(--spacing-2)',
    color: STAGE_TEXT,
  },
  clockDate: {
    fontSize: 14,
    fontWeight: 500,
    color: STAGE_TEXT_DIM,
    letterSpacing: '0.01em',
  },
  clockTime: {
    fontSize: 64,
    fontWeight: 250,
    lineHeight: 1.05,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums',
  },
  specimen: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1-5)',
  },
  caption: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 11,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    color: STAGE_TEXT_FAINT,
    paddingInline: 'var(--spacing-1)',
  },

  // ---- Shared glass widget shell ----
  widget: {
    backgroundColor: WIDGET_BG,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: `1px solid ${WIDGET_RING}`,
    borderRadius: 24,
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandName: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.01em',
    color: STAGE_TEXT,
  },
  brandSub: {
    fontSize: 12,
    color: STAGE_TEXT_DIM,
  },
  dimLine: {
    fontSize: 12,
    color: STAGE_TEXT_DIM,
    lineHeight: 1.45,
  },
  mono: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
  },
  // ---- Skillet (delivery) ----
  etaBlock: {
    marginLeft: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1,
  },
  etaValue: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.1,
    color: SKILLET_ORANGE,
    fontVariantNumeric: 'tabular-nums',
  },
  etaSub: {
    fontSize: 11,
    color: STAGE_TEXT_DIM,
    fontVariantNumeric: 'tabular-nums',
  },
  courierTrackWrap: {
    // Reserve inline padding so edge dots and the rider marker never
    // clip against the widget padding box (slider footgun).
    paddingInline: 6,
    paddingBlock: 'var(--spacing-2)',
  },
  courierTrack: {
    position: 'relative',
    height: 5,
    borderRadius: 999,
    backgroundColor: TRACK_BG,
  },
  courierFill: {
    position: 'absolute',
    insetBlock: 0,
    left: 0,
    width: '66%',
    borderRadius: 999,
    backgroundColor: SKILLET_ORANGE,
  },
  courierDot: {
    position: 'absolute',
    top: '50%',
    width: 11,
    height: 11,
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
  },
  courierRider: {
    position: 'absolute',
    top: '50%',
    left: '66%',
    transform: 'translate(-50%, -50%)',
    width: 26,
    height: 26,
    borderRadius: '50%',
    backgroundColor: SKILLET_ORANGE,
    color: SKILLET_ON_ACCENT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(6, 8, 16, 0.5)',
  },
  courierStages: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    marginTop: 'var(--spacing-1-5)',
  },

  // ---- Courtside (live score) ----
  liveTag: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: COURTSIDE_INDIGO,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: COURTSIDE_INDIGO,
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
  },
  teamSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    width: 96,
  },
  monogram: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: '0.05em',
    color: STAGE_TEXT,
    border: `1px solid ${WIDGET_RING}`,
  },
  teamName: {
    fontSize: 11,
    color: STAGE_TEXT_DIM,
  },
  teamScore: {
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    color: STAGE_TEXT,
  },
  bonusChip: {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.12em',
    color: COURTSIDE_INDIGO,
    backgroundColor: COURTSIDE_INDIGO_SOFT,
    borderRadius: 999,
    paddingInline: 8,
    paddingBlock: 2,
  },
  bonusChipGhost: {
    // Invisible twin keeps both team columns the same height so the
    // scores stay on one shared baseline.
    visibility: 'hidden',
  },
  quarterBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  quarterChip: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: COURTSIDE_INDIGO,
    backgroundColor: COURTSIDE_INDIGO_SOFT,
    borderRadius: 999,
    paddingInline: 10,
    paddingBlock: 2,
  },
  quarterClock: {
    fontSize: 18,
    fontWeight: 600,
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    color: STAGE_TEXT,
  },

  // ---- Tidepool (focus ring) ----
  tidepoolRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  ringWrap: {
    position: 'relative',
    width: 72,
    height: 72,
    flexShrink: 0,
  },
  ringCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  ringTime: {
    fontSize: 15,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: STAGE_TEXT,
    lineHeight: 1.1,
  },
  ringLeftLabel: {
    fontSize: 9,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: STAGE_TEXT_FAINT,
  },
  tidepoolBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    minWidth: 0,
    flex: 1,
  },
  sessionLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: STAGE_TEXT,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TIDEPOOL_TEAL_SOFT,
    color: TIDEPOOL_TEAL,
    border: `1px solid rgba(45, 212, 191, 0.35)`,
  },
};

// ============= SPECIMEN HELPERS =============

/** Caption label + one live-activity shell, stacked on the stage. */
function Specimen({label, children}: {label: string; children: ReactNode}) {
  return (
    <div style={styles.specimen}>
      <div style={styles.caption}>{label}</div>
      <div style={styles.widget}>{children}</div>
    </div>
  );
}

/** Brand identity row: tinted rounded-square mark + name + sub line. */
function BrandRow({
  mark,
  name,
  sub,
  end,
}: {
  mark: ReactNode;
  name: string;
  sub: string;
  end?: ReactNode;
}) {
  return (
    <div style={styles.brandRow}>
      {mark}
      <div>
        <div style={styles.brandName}>{name}</div>
        <div style={styles.brandSub}>{sub}</div>
      </div>
      {end}
    </div>
  );
}

// ============= SKILLET — FOOD DELIVERY =============
// Courier stages: Preparing (done) → Picked up (done) → Arriving. The
// fill and rider marker sit at 66%, between the last two stops.

const SKILLET_STAGES = [
  {id: 'preparing', label: 'Preparing', at: '0%', done: true},
  {id: 'picked-up', label: 'Picked up', at: '50%', done: true},
  {id: 'arriving', label: 'Arriving', at: '100%', done: false},
] as const;

function SkilletWidget() {
  return (
    <Specimen label="01 · Delivery — Skillet">
      <BrandRow
        mark={
          <div
            style={{
              ...styles.brandMark,
              backgroundColor: SKILLET_ORANGE_SOFT,
              color: SKILLET_ORANGE,
            }}>
            <Icon icon={FlameIcon} size="sm" color="inherit" />
          </div>
        }
        name="Skillet"
        sub="Order #4821 · Ember Thai Kitchen"
        end={
          <div style={styles.etaBlock}>
            <div style={styles.etaValue}>12 min</div>
            <div style={styles.etaSub}>ETA 8:59 PM</div>
          </div>
        }
      />
      <div style={styles.courierTrackWrap}>
        <div style={styles.courierTrack}>
          <div style={styles.courierFill} />
          {SKILLET_STAGES.map(stage => (
            <div
              key={stage.id}
              style={{
                ...styles.courierDot,
                left: stage.at,
                backgroundColor: stage.done ? SKILLET_ORANGE : TRACK_BG,
              }}
            />
          ))}
          <div style={styles.courierRider} aria-hidden="true">
            <Icon icon={BikeIcon} size="xsm" color="inherit" />
          </div>
        </div>
        <div style={styles.courierStages}>
          {SKILLET_STAGES.map(stage => (
            <span
              key={stage.id}
              style={{
                color: stage.done ? STAGE_TEXT : STAGE_TEXT_DIM,
                fontWeight: stage.done ? 600 : 400,
              }}>
              {stage.label}
            </span>
          ))}
        </div>
      </div>
      <div style={styles.dimLine}>
        Maya R. is riding · 1.2 mi away — 2 items · $34.60 paid
      </div>
    </Specimen>
  );
}

// ============= COURTSIDE — LIVE SCORE =============
// Fictional pro-basketball matchup: HRB Harbors 98, PNR Pioneers 94,
// Q4 with 2:36 on the clock; the Harbors are in the bonus.

const COURTSIDE_TEAMS = [
  {
    monogram: 'HRB',
    name: 'Harbors',
    score: '98',
    gradient: 'linear-gradient(135deg, #2C3242 0%, #4A5470 100%)',
    inBonus: true,
  },
  {
    monogram: 'PNR',
    name: 'Pioneers',
    score: '94',
    gradient: 'linear-gradient(135deg, #40343C 0%, #6A5560 100%)',
    inBonus: false,
  },
] as const;

function TeamSide({team}: {team: (typeof COURTSIDE_TEAMS)[number]}) {
  return (
    <div style={styles.teamSide}>
      <div style={{...styles.monogram, background: team.gradient}}>
        {team.monogram}
      </div>
      <div style={styles.teamName}>{team.name}</div>
      <div style={styles.teamScore}>{team.score}</div>
      <div
        style={
          team.inBonus
            ? styles.bonusChip
            : {...styles.bonusChip, ...styles.bonusChipGhost}
        }>
        BONUS
      </div>
    </div>
  );
}

function CourtsideWidget() {
  return (
    <Specimen label="02 · Live score — Courtside">
      <BrandRow
        mark={
          <div
            style={{
              ...styles.brandMark,
              backgroundColor: COURTSIDE_INDIGO_SOFT,
              color: COURTSIDE_INDIGO,
            }}>
            <Icon icon={TrophyIcon} size="sm" color="inherit" />
          </div>
        }
        name="Courtside"
        sub="Basketball · Conference finals, Game 4"
        end={
          <div style={styles.liveTag}>
            <span style={styles.liveDot} aria-hidden="true" />
            LIVE
          </div>
        }
      />
      <div style={styles.scoreRow}>
        <TeamSide team={COURTSIDE_TEAMS[0]} />
        <div style={styles.quarterBlock}>
          <div style={styles.quarterChip}>Q4</div>
          <div style={styles.quarterClock}>2:36</div>
        </div>
        <TeamSide team={COURTSIDE_TEAMS[1]} />
      </div>
      <div style={styles.dimLine}>
        Harbors in the bonus · Pioneers hold 2 timeouts
      </div>
    </Specimen>
  );
}

// ============= TIDEPOOL — FOCUS TIMER =============
// SVG ring: 18:24 of a 25:00 session remaining (73.6% arc). The arc is
// rotated -90° so the countdown drains clockwise from 12 o'clock.

function TidepoolRing() {
  const dash = RING_CIRCUMFERENCE * RING_REMAINING;
  return (
    <div style={styles.ringWrap}>
      <svg width={72} height={72} viewBox="0 0 72 72" aria-hidden="true">
        <circle
          cx={36}
          cy={36}
          r={RING_RADIUS}
          fill="none"
          stroke={TRACK_BG}
          strokeWidth={5}
        />
        <circle
          cx={36}
          cy={36}
          r={RING_RADIUS}
          fill="none"
          stroke={TIDEPOOL_TEAL}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${dash.toFixed(1)} ${RING_CIRCUMFERENCE.toFixed(1)}`}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <div style={styles.ringCenter}>
        <div style={styles.ringTime}>18:24</div>
        <div style={styles.ringLeftLabel}>left</div>
      </div>
    </div>
  );
}

function TidepoolWidget() {
  return (
    <Specimen label="03 · Focus timer — Tidepool">
      <div style={styles.tidepoolRow}>
        <TidepoolRing />
        <div style={styles.tidepoolBody}>
          <div style={styles.brandRow}>
            <span style={{color: TIDEPOOL_TEAL, display: 'inline-flex'}}>
              <Icon icon={WavesIcon} size="xsm" color="inherit" />
            </span>
            <span style={styles.brandSub}>Tidepool</span>
          </div>
          <div style={styles.sessionLabel}>Deep focus — Thesis draft</div>
          <div style={styles.dimLine}>Session 3 of 4 · ends 9:05 PM</div>
        </div>
        <div style={styles.pauseButton} aria-hidden="true">
          <Icon icon={PauseIcon} size="sm" color="inherit" />
        </div>
      </div>
    </Specimen>
  );
}

// ============= LOCK-SCREEN STAGE =============

function ClockHint() {
  return (
    <div style={styles.clockHint}>
      <span style={{color: STAGE_TEXT_DIM, display: 'inline-flex'}}>
        <Icon icon={LockIcon} size="xsm" color="inherit" />
      </span>
      <div style={styles.clockDate}>Tuesday, July 14</div>
      <div style={styles.clockTime}>8:47</div>
    </div>
  );
}

export default function LiveActivityWidgetTemplate() {
  return (
    <div style={styles.root}>
      <div style={styles.column}>
        <VStack gap={1} style={styles.chromeHeader}>
          <HStack gap={2} align="center">
            <Heading level={2}>Live Activity widgets</Heading>
            <Badge variant="neutral" label="3 specimens" />
          </HStack>
          <Text size="sm" color="secondary">
            Lock-screen glance surfaces at phone width — a delivery
            tracker, a live score, and a focus countdown, each a distinct
            fictional brand on one blurred-gradient stage.
          </Text>
        </VStack>

        <div style={styles.stage}>
          <ClockHint />
          <SkilletWidget />
          <CourtsideWidget />
          <TidepoolWidget />
        </div>

        <div style={styles.footnote}>
          <Text size="xsm" color="secondary">
            The stage is scheme-locked dark: live activities render on the
            same glass in light and dark OS themes, so every widget color
            above is a fixed literal, not a theme token.
          </Text>
        </div>
      </div>
    </div>
  );
}
