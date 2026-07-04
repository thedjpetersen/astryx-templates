// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one Swiftly trip: driver Marco Reyes,
 *   4.92 star / 2,340 trips, silver Honda Civic plate 7XKD 249, pickup
 *   418 Fairmount Ave, destination Crown Street Station, $18.40 estimate on
 *   Visa ··4821, fixed "3 min" ETA copy — no clocks, no randomness, no
 *   network media; the map strip is inline SVG over fixed coordinates)
 * @output Ride Trip Status Card for the fictional ride-hailing startup
 *   Swiftly — a SMALL-scale block rendered as two phone-width specimens on
 *   a centered stage. Specimen 01 (en-route): charcoal map strip with route
 *   polyline and pulsing car dot, "Marco is 3 min away" header with car +
 *   plate chip, driver card, four-step trip stepper with the active leg
 *   pulsing, pickup/destination address rows with an edit affordance on
 *   pickup, safety toolkit icon pills (share trip / call / emergency with
 *   confirm AlertDialog), and a price + payment chip footer. Specimen 02
 *   (arrived): the same card in its arrived state with a license-plate
 *   verification hero and an "I'm in — start trip" confirmation.
 * @position Block template; emitted by `astryx template ride-trip-status`
 *
 * Frame: no app shell. A full-height stage div (token body background with
 * a faint lime radial wash) centers a small brand header and two 402px
 * card specimens side by side; each specimen sits under a mono state-id
 * Token caption (composer-state-gallery idiom). Cards are Card padding={0}
 * with internal regions separated by Dividers.
 *
 * Responsive contract:
 * - Specimens are fixed 402px columns in a wrapping flex row: side by side
 *   >=900px, stacked and centered below. The stage scrolls vertically.
 * - Inside the card nothing depends on viewport width; rows wrap or
 *   truncate (address lines truncate with maxLines, safety pills wrap).
 *
 * Container policy (small-block gallery archetype): each specimen is one
 * Card; regions inside are plain rows separated by Dividers — no nested
 * Cards. The plate chip and plate hero are bespoke charcoal blocks (they
 * are physical-object facsimiles, not surfaces).
 *
 * Color policy: ONE brand accent — Swiftly lime, light-dark(#4D7C0F,
 * #A3E635) — used for the route polyline, active stepper leg, pickup dot,
 * ETA chip, and the primary confirm CTA tint. Two scheme-locked charcoal
 * surfaces (footgun 9): the night-map strip and the license-plate blocks
 * pin colorScheme:'dark' and use explicit literals (MAP_* / PLATE_*
 * constants below) because a ride map and a license plate stay dark in
 * both schemes. Everything else is token-pure. Text on the lime accent is
 * charcoal (#1A2E05-on-lime clears AA in dark; white-on-#4D7C0F clears AA
 * in light), and lime text never sits on token surfaces in the light
 * scheme — tints and borders only.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  BadgeCheckIcon,
  CarFrontIcon,
  CreditCardIcon,
  MapPinIcon,
  MessageCircleIcon,
  PencilLineIcon,
  PhoneIcon,
  Share2Icon,
  ShieldAlertIcon,
  StarIcon,
  ZapIcon,
} from 'lucide-react';

import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ============= BRAND =============
// Swiftly lime — the ONE brand accent (§5.1). 700-weight light / 400 dark.
const BRAND_ACCENT = 'light-dark(#4D7C0F, #A3E635)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(77,124,15,0.12), rgba(163,230,53,0.16))';
// Text painted ON a solid accent fill (CTA, ETA chip): charcoal over the
// dark-scheme lime, white over the light-scheme olive — both clear AA.
const ON_ACCENT = 'light-dark(#FFFFFF, #1A2E05)';

// ============= SCHEME-LOCKED CHARCOAL SURFACES (footgun 9) =============
// Night-map strip: explicit literals only; colorScheme is pinned 'dark'.
const MAP_BG = '#22272B';
const MAP_BLOCK = 'rgba(226,232,240,0.06)';
const MAP_PARK = 'rgba(163,230,53,0.10)';
const MAP_ROAD = 'rgba(148,163,184,0.30)';
const MAP_ROAD_MINOR = 'rgba(148,163,184,0.14)';
const MAP_TEXT = 'rgba(226,232,240,0.72)';
const MAP_ROUTE = '#A3E635'; // lime literal on the locked stage
const MAP_ROUTE_DIM = 'rgba(163,230,53,0.35)';
const MAP_CAR = '#F8FAFC';
// License-plate facsimile blocks (chip + verification hero).
const PLATE_BG = '#22272B';
const PLATE_TEXT = '#F8FAFC';
const PLATE_EDGE = 'rgba(248,250,252,0.45)';

// Pulse rings (car dot + active stepper leg) — reduced-motion users get a
// static ring/leg instead of an animation.
const PULSE_CSS = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes rts-car-pulse {
    0% { transform: scale(0.5); opacity: 0.9; }
    100% { transform: scale(2.1); opacity: 0; }
  }
  .rts-car-pulse {
    animation: rts-car-pulse 1.8s ease-out infinite;
    transform-origin: center;
    transform-box: fill-box;
  }
  @keyframes rts-leg-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
  .rts-leg-pulse {
    animation: rts-leg-pulse 1.4s ease-in-out infinite;
  }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Stage: token body wash + one faint lime radial so the specimens float.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    padding: 'var(--spacing-6) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-5)',
    backgroundColor: 'var(--color-background-body)',
    backgroundImage: `radial-gradient(640px 320px at 50% 0%, ${BRAND_ACCENT_SOFT}, transparent 70%)`,
  },
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
  },
  specimenCol: {width: 402, maxWidth: '100%'},
  brandMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
  },
  // --- Map strip (scheme-locked charcoal; literals only) ---
  mapStrip: {
    position: 'relative',
    height: 132,
    backgroundColor: MAP_BG,
    colorScheme: 'dark',
    borderTopLeftRadius: 'var(--radius-container)',
    borderTopRightRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  mapSvg: {position: 'absolute', inset: 0, width: '100%', height: '100%'},
  etaChip: {
    position: 'absolute',
    top: 'var(--spacing-2)',
    right: 'var(--spacing-2)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    paddingBlock: 4,
    borderRadius: 999,
    backgroundColor: '#A3E635', // lime literal on the locked stage
    color: '#1A2E05',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  mapWordmark: {
    position: 'absolute',
    top: 'var(--spacing-2)',
    left: 'var(--spacing-2)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: MAP_TEXT,
    fontSize: 12,
    fontWeight: 600,
  },
  // --- Card body regions ---
  cardBody: {padding: 'var(--spacing-3)'},
  // Plate chip: license-plate facsimile — charcoal, mono, riveted edge.
  plateChip: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    paddingBlock: 2,
    borderRadius: 6,
    backgroundColor: PLATE_BG,
    colorScheme: 'dark',
    border: `1px solid ${PLATE_EDGE}`,
    color: PLATE_TEXT,
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.12em',
    whiteSpace: 'nowrap',
  },
  starIcon: {color: 'light-dark(#B45309, #FBBF24)', display: 'inline-flex'},
  // --- Trip stepper ---
  // gap 6 here AND inside each dot+leg pair so every leg sits 6px from the
  // dots on both sides (legs and their right-hand dots live in siblings).
  stepperRow: {display: 'flex', alignItems: 'center', gap: 6},
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    flexShrink: 0,
    backgroundColor: 'var(--color-border)',
  },
  stepDotDone: {backgroundColor: BRAND_ACCENT},
  stepDotActive: {
    backgroundColor: BRAND_ACCENT,
    boxShadow: `0 0 0 4px ${BRAND_ACCENT_SOFT}`,
  },
  stepLeg: {
    height: 3,
    flexGrow: 1,
    borderRadius: 999,
    backgroundColor: 'var(--color-border)',
  },
  stepLegDone: {backgroundColor: BRAND_ACCENT},
  stepLabelRow: {display: 'flex', justifyContent: 'space-between'},
  stepLabel: {flexBasis: 0, flexGrow: 1},
  // --- Address rows ---
  addressRail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'stretch',
    // Bottom padding lifts the destination pin off the caption row so it
    // centers on the "Crown Street Station" line, mirroring the pickup dot
    // (which centers on its address line via the 6px top pad).
    paddingBlock: '6px 19px',
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT,
    flexShrink: 0,
  },
  railLine: {
    width: 2,
    flexGrow: 1,
    minHeight: 14,
    backgroundColor: 'var(--color-border)',
    marginBlock: 3,
  },
  destPin: {color: 'var(--color-text-secondary)', display: 'inline-flex'},
  addressText: {minWidth: 0},
  // --- Safety toolkit pills ---
  safetyPill: {borderRadius: 999},
  emergencyPill: {borderRadius: 999, color: 'var(--color-error)'},
  // --- Footer ---
  paymentChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    paddingBlock: 4,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    whiteSpace: 'nowrap',
  },
  fare: {fontVariantNumeric: 'tabular-nums'},
  // --- Arrived specimen: plate-verification hero ---
  plateHero: {
    backgroundColor: PLATE_BG,
    colorScheme: 'dark',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  plateBig: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: 20,
    paddingBlock: 8,
    borderRadius: 8,
    border: `2px solid ${PLATE_EDGE}`,
    color: PLATE_TEXT,
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '0.18em',
    lineHeight: 1.2,
  },
  plateHeroCaption: {color: MAP_TEXT, textAlign: 'center'},
  plateHeroTitle: {
    color: PLATE_TEXT,
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
  },
  confirmButton: {width: '100%'},
  editRow: {paddingTop: 'var(--spacing-2)'},
};

// ============= FIXTURES =============
// One deterministic trip — every repeated value agrees across both
// specimens (driver, vehicle, plate, addresses, fare, payment).

const TRIP = {
  driverName: 'Marco Reyes',
  rating: '4.92',
  tripCount: '2,340 trips',
  vehicle: 'Silver Honda Civic',
  plate: '7XKD 249',
  pickup: '418 Fairmount Ave',
  pickupNote: 'Meet at the north corner',
  destination: 'Crown Street Station',
  fare: '$18.40',
  fareNote: 'Estimated fare',
  payment: 'Visa ··4821',
  tier: 'Swiftly Go',
};

const STEPS = ['Requested', 'En route', 'Pickup', 'Destination'] as const;

// Map geometry (fixed viewBox coordinates, 360x132). The route runs from
// the car position to the pickup pin; the en-route specimen paints the
// remaining leg bright with the car partway along, the arrived specimen
// parks the car at the pin.
const MAP_VIEW = {w: 360, h: 132};
// The pin stops at x=240 so it clears the absolutely-positioned ETA chip
// that floats over the map's top-right corner.
const ROUTE_PATH = 'M 24 108 L 96 108 L 96 64 L 208 64 L 208 36 L 240 36';
// Traveled portion for the en-route specimen (car sits at its end).
const ROUTE_DONE_PATH = 'M 24 108 L 96 108 L 96 64 L 168 64';
const CAR_EN_ROUTE = {x: 168, y: 64};
const PICKUP_PIN = {x: 240, y: 36};

// ============= SHARED PIECES =============

/** Mono state-id Token caption above each card (specimen idiom). */
function Specimen({
  stateId,
  note,
  children,
}: {
  stateId: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div style={styles.specimenCol}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Token label={stateId} size="sm" color="gray" />
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        </HStack>
        {children}
      </VStack>
    </div>
  );
}

/** License-plate facsimile chip (charcoal, mono, riveted edge). */
function PlateChip({plate}: {plate: string}) {
  return (
    <span style={styles.plateChip} aria-label={`License plate ${plate}`}>
      {plate}
    </span>
  );
}

/**
 * Scheme-locked charcoal night-map strip: street grid, park block, route
 * polyline, car dot (pulsing while en route), pickup pin, ETA chip.
 * Decorative geometry is aria-hidden; the ETA chip carries the live copy.
 */
function MapStrip({phase}: {phase: 'en-route' | 'arrived'}) {
  const car = phase === 'en-route' ? CAR_EN_ROUTE : PICKUP_PIN;
  return (
    <div style={styles.mapStrip}>
      <svg
        style={styles.mapSvg}
        viewBox={`0 0 ${MAP_VIEW.w} ${MAP_VIEW.h}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={
          phase === 'en-route'
            ? 'Map: Marco is 3 minutes away, heading to 418 Fairmount Ave'
            : 'Map: Marco has arrived at 418 Fairmount Ave'
        }>
        {/* City blocks + one park (decorative). */}
        <g aria-hidden="true">
          <rect x={8} y={12} width={72} height={40} rx={3} fill={MAP_BLOCK} />
          <rect x={112} y={78} width={84} height={44} rx={3} fill={MAP_BLOCK} />
          <rect x={224} y={78} width={72} height={44} rx={3} fill={MAP_BLOCK} />
          <rect x={310} y={54} width={44} height={68} rx={3} fill={MAP_BLOCK} />
          <rect x={224} y={-8} width={72} height={28} rx={3} fill={MAP_PARK} />
          {/* Streets. */}
          <path d="M 0 108 H 360" stroke={MAP_ROAD} strokeWidth={5} fill="none" />
          <path d="M 0 64 H 360" stroke={MAP_ROAD} strokeWidth={5} fill="none" />
          <path d="M 0 36 H 360" stroke={MAP_ROAD_MINOR} strokeWidth={4} fill="none" />
          <path d="M 96 0 V 132" stroke={MAP_ROAD} strokeWidth={5} fill="none" />
          <path d="M 208 0 V 132" stroke={MAP_ROAD_MINOR} strokeWidth={4} fill="none" />
          <path d="M 304 0 V 132" stroke={MAP_ROAD_MINOR} strokeWidth={4} fill="none" />
          {/* Route polyline: dim full route, bright traveled leg. */}
          <path
            d={ROUTE_PATH}
            stroke={MAP_ROUTE_DIM}
            strokeWidth={4}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="1 8"
            fill="none"
          />
          <path
            d={phase === 'en-route' ? ROUTE_DONE_PATH : ROUTE_PATH}
            stroke={MAP_ROUTE}
            strokeWidth={4}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          {/* Pickup pin. */}
          <circle cx={PICKUP_PIN.x} cy={PICKUP_PIN.y} r={7} fill={MAP_BG} stroke={MAP_ROUTE} strokeWidth={3} />
          {/* Car dot + pulse ring. */}
          {phase === 'en-route' ? (
            <circle
              className="rts-car-pulse"
              cx={car.x}
              cy={car.y}
              r={9}
              fill="none"
              stroke={MAP_CAR}
              strokeWidth={2}
              opacity={0.6}
            />
          ) : null}
          <circle cx={car.x} cy={car.y} r={6} fill={MAP_CAR} stroke={MAP_BG} strokeWidth={2} />
        </g>
      </svg>
      <span style={styles.mapWordmark} aria-hidden="true">
        <Icon icon={ZapIcon} size="sm" color="inherit" />
        Swiftly
      </span>
      <span style={styles.etaChip}>
        {phase === 'en-route' ? '3 min away' : 'Arrived'}
      </span>
    </div>
  );
}

/**
 * Four-step trip stepper. Legs before the active step are solid lime; the
 * leg the trip is currently traversing pulses (static lime tint under
 * reduced motion via the dim base + animated overlay class).
 */
function TripStepper({activeIndex}: {activeIndex: number}) {
  return (
    <VStack gap={1}>
      <div style={styles.stepperRow} aria-hidden="true">
        {STEPS.map((step, index) => {
          const dotStyle =
            index < activeIndex
              ? {...styles.stepDot, ...styles.stepDotDone}
              : index === activeIndex
                ? {...styles.stepDot, ...styles.stepDotActive}
                : styles.stepDot;
          const isActiveLeg = index === activeIndex;
          const legStyle =
            index < activeIndex
              ? {...styles.stepLeg, ...styles.stepLegDone}
              : isActiveLeg
                ? {...styles.stepLeg, ...styles.stepLegDone, opacity: 0.7}
                : styles.stepLeg;
          return (
            <div
              key={step}
              style={
                index < STEPS.length - 1
                  ? {display: 'flex', alignItems: 'center', flexGrow: 1, gap: 6}
                  : {display: 'flex', alignItems: 'center'}
              }>
              <div style={dotStyle} />
              {index < STEPS.length - 1 ? (
                <div
                  className={isActiveLeg ? 'rts-leg-pulse' : undefined}
                  style={legStyle}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <div style={styles.stepLabelRow}>
        {STEPS.map((step, index) => (
          <div
            key={step}
            style={
              index === 0
                ? {...styles.stepLabel, textAlign: 'start'}
                : index === STEPS.length - 1
                  ? {...styles.stepLabel, textAlign: 'end'}
                  : {...styles.stepLabel, textAlign: 'center'}
            }>
            <Text
              type="supporting"
              size="sm"
              color={index === activeIndex ? 'primary' : 'secondary'}>
              {index === activeIndex ? <strong>{step}</strong> : step}
            </Text>
          </div>
        ))}
      </div>
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
        }}>
        Trip progress: {STEPS[activeIndex]} in progress, step {activeIndex + 1}{' '}
        of {STEPS.length}
      </span>
    </VStack>
  );
}

/** Driver identity row: avatar, name, star rating, trip count, message. */
function DriverRow() {
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={TRIP.driverName} size={40} />
      <StackItem size="fill" style={styles.addressText}>
        <VStack gap={0}>
          <Text type="label" size="sm" maxLines={1}>
            {TRIP.driverName}
          </Text>
          <HStack gap={1} vAlign="center">
            <span style={styles.starIcon} aria-hidden="true">
              <Icon icon={StarIcon} size="xsm" color="inherit" />
            </span>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {TRIP.rating} · {TRIP.tripCount}
            </Text>
          </HStack>
        </VStack>
      </StackItem>
      <Badge label={TRIP.tier} variant="neutral" />
      <IconButton
        label={`Message ${TRIP.driverName}`}
        tooltip="Message"
        icon={<Icon icon={MessageCircleIcon} size="sm" color="inherit" />}
        variant="secondary"
        size="sm"
        onClick={() => {}}
      />
    </HStack>
  );
}

/**
 * Pickup + destination rows joined by a rail. The pickup row carries the
 * edit affordance: the pencil opens an inline TextInput that rewrites the
 * pickup note deterministically on Save.
 */
function AddressRows() {
  const [note, setNote] = useState(TRIP.pickupNote);
  const [draft, setDraft] = useState(TRIP.pickupNote);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <VStack gap={0}>
      <HStack gap={2} vAlign="stretch">
        <div style={styles.addressRail} aria-hidden="true">
          <div style={styles.pickupDot} />
          <div style={styles.railLine} />
          <span style={styles.destPin}>
            <Icon icon={MapPinIcon} size="xsm" color="inherit" />
          </span>
        </div>
        <StackItem size="fill" style={styles.addressText}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill" style={styles.addressText}>
                <VStack gap={0}>
                  <Text size="sm" maxLines={1}>
                    {TRIP.pickup}
                  </Text>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    Pickup · {note}
                  </Text>
                </VStack>
              </StackItem>
              <IconButton
                label="Edit pickup note"
                tooltip="Edit pickup"
                icon={<Icon icon={PencilLineIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft(note);
                  setIsEditing(prev => !prev);
                }}
              />
            </HStack>
            <VStack gap={0}>
              <Text size="sm" maxLines={1}>
                {TRIP.destination}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                Destination
              </Text>
            </VStack>
          </VStack>
        </StackItem>
      </HStack>
      {isEditing ? (
        <HStack gap={2} vAlign="end" style={styles.editRow}>
          <StackItem size="fill">
            <TextInput
              label="Pickup note"
              value={draft}
              onChange={setDraft}
              placeholder="Where should Marco meet you?"
            />
          </StackItem>
          <Button
            label="Save"
            variant="secondary"
            size="sm"
            onClick={() => {
              setNote(draft.trim().length > 0 ? draft.trim() : TRIP.pickupNote);
              setIsEditing(false);
            }}
          />
        </HStack>
      ) : null}
    </VStack>
  );
}

/** Safety toolkit: share trip / call / emergency icon pills. */
function SafetyRow() {
  const [isSharing, setIsSharing] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  return (
    <VStack gap={0}>
      <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
        <Button
          label={isSharing ? 'Sharing live' : 'Share trip'}
          variant="secondary"
          size="sm"
          style={styles.safetyPill}
          icon={
            <Icon
              icon={isSharing ? BadgeCheckIcon : Share2Icon}
              size="sm"
              color="inherit"
            />
          }
          onClick={() => setIsSharing(prev => !prev)}
        />
        <Button
          label="Call"
          variant="secondary"
          size="sm"
          style={styles.safetyPill}
          icon={<Icon icon={PhoneIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
        <StackItem size="fill" />
        <Tooltip content="Contact emergency services and share your trip">
          <Button
            label="Emergency"
            variant="secondary"
            size="sm"
            style={styles.emergencyPill}
            icon={<Icon icon={ShieldAlertIcon} size="sm" color="inherit" />}
            onClick={() => setIsEmergencyOpen(true)}
          />
        </Tooltip>
      </HStack>
      <AlertDialog
        isInline
        isOpen={isEmergencyOpen}
        onOpenChange={setIsEmergencyOpen}
        title="Contact emergency services?"
        description="Swiftly will call local emergency services and share your live trip details — vehicle, plate 7XKD 249, and route."
        cancelLabel="Not now"
        actionLabel="Call emergency"
        actionVariant="destructive"
        onAction={() => setIsEmergencyOpen(false)}
      />
    </VStack>
  );
}

/** Price + payment chip footer — same numbers in both specimens. */
function FareFooter() {
  return (
    <HStack gap={2} vAlign="center">
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="label" size="base" hasTabularNumbers style={styles.fare}>
            {TRIP.fare}
          </Text>
          <Text type="supporting" color="secondary">
            {TRIP.fareNote} · no surge
          </Text>
        </VStack>
      </StackItem>
      <span style={styles.paymentChip}>
        <Icon icon={CreditCardIcon} size="xsm" color="secondary" />
        <Text type="supporting" hasTabularNumbers>
          {TRIP.payment}
        </Text>
      </span>
    </HStack>
  );
}

// ============= SPECIMEN 01 · EN ROUTE =============

function EnRouteSpecimen() {
  return (
    <Specimen
      stateId="01 · en-route"
      note="Driver assigned and driving to pickup.">
      <Card padding={0}>
        <MapStrip phase="en-route" />
        <div style={styles.cardBody}>
          <VStack gap={3}>
            <VStack gap={1}>
              <Heading level={2}>
                Marco is 3 min away
              </Heading>
              <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
                <Icon icon={CarFrontIcon} size="sm" color="secondary" />
                <Text type="supporting" color="secondary">
                  {TRIP.vehicle}
                </Text>
                <PlateChip plate={TRIP.plate} />
              </HStack>
            </VStack>
            <Divider />
            <DriverRow />
            <Divider />
            <TripStepper activeIndex={1} />
            <Divider />
            <AddressRows />
            <Divider />
            <SafetyRow />
            <Divider />
            <FareFooter />
          </VStack>
        </div>
      </Card>
    </Specimen>
  );
}

// ============= SPECIMEN 02 · ARRIVED =============

function ArrivedSpecimen() {
  const [hasBoarded, setHasBoarded] = useState(false);

  return (
    <Specimen
      stateId="02 · arrived"
      note="Curbside — verify the plate before boarding.">
      <Card padding={0}>
        <MapStrip phase="arrived" />
        <div style={styles.cardBody}>
          <VStack gap={3}>
            <VStack gap={1}>
              <Heading level={2}>
                Marco has arrived
              </Heading>
              <Text type="supporting" color="secondary">
                Waiting at {TRIP.pickup} · free wait for 4 more min
              </Text>
            </VStack>
            {/* License-plate verification hero (scheme-locked charcoal). */}
            <div style={styles.plateHero}>
              <span style={styles.plateHeroTitle}>
                Match the plate before you get in
              </span>
              <span
                style={styles.plateBig}
                aria-label={`License plate ${TRIP.plate}`}>
                {TRIP.plate}
              </span>
              <Text style={styles.plateHeroCaption} type="supporting">
                {TRIP.vehicle} · {TRIP.driverName}
              </Text>
            </div>
            {hasBoarded ? (
              <Badge
                label="Verified — trip started"
                variant="success"
                icon={<Icon icon={BadgeCheckIcon} size="xsm" color="inherit" />}
              />
            ) : (
              <Button
                label="The plate matches — I'm in"
                variant="primary"
                style={styles.confirmButton}
                icon={<Icon icon={BadgeCheckIcon} size="sm" color="inherit" />}
                onClick={() => setHasBoarded(true)}
              />
            )}
            <Divider />
            <DriverRow />
            <Divider />
            <TripStepper activeIndex={2} />
            <Divider />
            <SafetyRow />
            <Divider />
            <FareFooter />
          </VStack>
        </div>
      </Card>
    </Specimen>
  );
}

// ============= PAGE =============

export default function RideTripStatusTemplate() {
  return (
    <div style={styles.stage}>
      <style>{PULSE_CSS}</style>
      <HStack gap={2} vAlign="center">
        <span style={styles.brandMark} aria-hidden="true">
          <Icon icon={ZapIcon} size="sm" color="inherit" />
        </span>
        <VStack gap={0}>
          <Heading level={1}>
            Swiftly · Trip status card
          </Heading>
          <Text type="supporting" color="secondary">
            Live-trip block — 2 specimens, deterministic fixtures
          </Text>
        </VStack>
      </HStack>
      <div style={styles.specimenRow}>
        <EnRouteSpecimen />
        <ArrivedSpecimen />
      </div>
    </div>
  );
}
