// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file focus-status-sheet.tsx
 * @input Deterministic fixtures only: the Kestrel Labs / Atlas Q3 world
 *   (suite "now" anchor Wednesday, July 15, 2026, frozen at 2:00 PM for the
 *   sheet specimen and 2:18 PM for the active-focus specimen), Marcus Webb
 *   (Platform lead) as the first-person status setter, six status presets
 *   (Focusing / Lunch / Commuting / PTO / Sick / Custom), four focus
 *   durations (30m / 1h / 2h / Until tomorrow) with fixed end times, a
 *   calendar-sync line ("Busy until 3:00 PM — Atlas Q3 deep-work block"),
 *   and a 12-notification hold counter (3 mentions + 9 channel pings). No
 *   clocks, no randomness, no network assets.
 * @output Focus & Status Sheet — three phone-width specimens of the team
 *   workspace status-setting surface, side by side under mono caption rows:
 *   specimen 01 is the bottom sheet OPEN inside a 360px phone frame (grab
 *   handle, six-preset emoji grid with Focusing selected, focus-mode
 *   section with a DND Switch + "Notifications paused" subtext, duration
 *   chips with 1h selected, calendar-sync note, status TextInput with a
 *   tappable emoji prefix, clear-after Selector, full-width Set button);
 *   specimen 02 is the ACTIVE-FOCUS compact card (flame glyph inside an
 *   SVG progress ring, "Focusing · 42m left", Snooze / End actions, and a
 *   "12 held" suppressed-notifications chip) with live snoozed and ended
 *   branches; specimen 03 is the TEAMMATE VIEW — Marcus's row in the
 *   #atlas-q3 member list with a violet focus badge on his Avatar and a
 *   statically-open tooltip note, plus two contrast rows (Sofia available,
 *   Ava Lindqvist with her "Joined Jul 1" chip).
 * @position Block template; emitted by `astryx template focus-status-sheet`
 *
 * Frame: no app shell — this is an INDIVIDUAL SMALL EXPERIENCE (§5.4). A
 * full-bleed stage div (minHeight 100dvh, token muted wash with ONE soft
 * violet radial tint) centers a small header and a wrapping specimen row.
 * Each specimen column is width:min(376px, 100%) — the true phone width the
 * sheet ships at — with its caption row (mono state-id Token + one-line
 * note) ABOVE the specimen per composer-state-gallery. Specimen 01 pins the
 * sheet to the bottom of a 640px-tall phone frame over a dimmed stand-in of
 * the channel screen behind it; specimens 02 and 03 are natural-height
 * cards at the same width, top-aligned with the frame.
 *
 * Responsive contract:
 * - >=1240px: the three specimens sit side by side, top-aligned, centered.
 * - <1240px: the specimen row flex-wraps (2+1, then a single stacked
 *   column); every column keeps width:min(376px, 100%) so nothing clips at
 *   375px viewports.
 * - Preset tiles are 44px+ tap targets; duration chips and the emoji-prefix
 *   button are >=36px tall; the Set button is full width. All state changes
 *   are tap-driven — no hover-only functionality.
 *
 * Container policy (specimen-gallery archetype): the phone frame, sheet,
 * preset tiles, duration chips, emoji-prefix button, focus badge, and the
 * statically-open tooltip bubble are hand-rolled divs/buttons in the repo
 * style-object idiom because they are the product's own mobile chrome — no
 * design-system Cards inside the phone frame. Astryx supplies the form
 * controls (Switch, TextInput, Selector, Button, IconButton), text
 * primitives, Avatar, Token, and stacks. Specimens 02 and 03 use bordered
 * surface panels (hand-rolled, matching the sheet's radius) so ring and
 * badge geometry stays registered across all three columns.
 *
 * Color policy: ONE specimen accent — focus violet,
 * light-dark(#6D28D9, #A78BFA) — for the selected preset ring, selected
 * duration chip, DND iconography, flame progress ring, held-notifications
 * chip, and the Avatar focus badge. Two intentional literals are scoped to
 * the phone frame's dimmed backdrop: the scrim rgba(9,12,16,0.44) and the
 * white sheet-handle rgba(255,255,255,0.9)-on-scrim pair, which sit on a
 * dimmed surface in BOTH schemes and must not flip. Everything else —
 * sheet surface, borders, text, chips at rest — is token-pure, so both
 * color schemes pass unaided.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {
  AlarmClockIcon,
  BellOffIcon,
  CalendarIcon,
  FlameIcon,
  MoonIcon,
  PlusIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react';

// ============= ACCENT CONSTANTS =============
// ONE specimen accent: focus violet. The dark side shifts to the lighter
// 300–400-weight hue per the suite color rules.

const FOCUS = 'light-dark(#6D28D9, #A78BFA)';
const FOCUS_SOFT = 'light-dark(rgba(109,40,217,0.10), rgba(167,139,250,0.16))';
// Intentional literals for the dimmed phone backdrop only (documented in
// the header Color policy): the scrim reads dark in BOTH schemes.
const SCRIM = 'rgba(9,12,16,0.44)';

// ============= FIXTURES =============
// Kestrel Labs / Atlas Q3 world, frozen Wednesday, July 15, 2026. Marcus
// Webb (Platform lead, infra workstream) is setting a 1h focus block at
// 2:00 PM; the active-focus card is the same block observed at 2:18 PM —
// 18m elapsed, 42m left, ending 3:00 PM. The 12 held notifications split
// into 3 mentions + 9 channel pings everywhere the number appears.

interface StatusPreset {
  id: string;
  emoji: string;
  label: string;
  message: string;
}

const STATUS_PRESETS: StatusPreset[] = [
  {
    id: 'focus',
    emoji: '\u{1F3AF}',
    label: 'Focusing',
    message: 'Deep work — beta ramp dashboards',
  },
  {id: 'lunch', emoji: '\u{1F957}', label: 'Lunch', message: 'Lunch — back soon'},
  {
    id: 'commute',
    emoji: '\u{1F68C}',
    label: 'Commute',
    message: 'Commuting — slow to reply',
  },
  {id: 'pto', emoji: '\u{1F334}', label: 'PTO', message: 'Out of office'},
  {id: 'sick', emoji: '\u{1F912}', label: 'Sick', message: 'Out sick today'},
  // The custom tile draws a scheme-aware PlusIcon instead of an emoji so it
  // keeps AA contrast in dark mode (the ➕ emoji renders as a dim gray glyph).
  {id: 'custom', emoji: '', label: 'Custom', message: ''},
];

// Focus durations from the 2:00 PM sheet moment. The 1h chip's end time is
// what the calendar-sync line, the clear-after default, the active card,
// and the teammate tooltip all repeat: 3:00 PM.
const DURATIONS = [
  {id: '30m', label: '30m', until: '2:30 PM'},
  {id: '1h', label: '1h', until: '3:00 PM'},
  {id: '2h', label: '2h', until: '4:00 PM'},
  {id: 'tomorrow', label: 'Until tomorrow', until: 'Thu 9:00 AM'},
];

const CALENDAR_NOTE = 'Calendar: busy until 3:00 PM — Atlas Q3 deep-work block';

const CLEAR_AFTER_OPTIONS = [
  {value: 'focus-end', label: 'When focus ends · 3:00 PM'},
  {value: '30m', label: 'In 30 minutes'},
  {value: '1h', label: 'In 1 hour'},
  {value: 'today', label: 'Today · 6:00 PM'},
  {value: 'never', label: "Don't clear"},
];

// Active-focus block: started 2:00 PM, observed 2:18 PM → 18 of 60 minutes
// elapsed, 42m left. Held notifications: 3 mentions + 9 channel pings = 12.
const FOCUS_TOTAL_MIN = 60;
const FOCUS_ELAPSED_MIN = 18;
const FOCUS_LEFT_LABEL = '42m left';
const FOCUS_ENDS_LABEL = 'Ends 3:00 PM';
const HELD_TOTAL = 12;
const HELD_BREAKDOWN = '3 mentions · 9 channel pings';

// Teammate-view rows: Marcus in focus, plus two contrast rows from the
// Atlas roster (Sofia available; Ava is the Jul 1 new joiner).
interface MemberRow {
  id: string;
  name: string;
  role: string;
  presence: 'focus' | 'active';
  statusLine?: string;
  joinedChip?: string;
}

const MEMBER_ROWS: MemberRow[] = [
  {
    id: 'marcus',
    name: 'Marcus Webb',
    role: 'Platform lead',
    presence: 'focus',
    statusLine: '\u{1F3AF} Deep work — beta ramp dashboards · until 3:00 PM',
  },
  {
    id: 'sofia',
    name: 'Sofia Ortiz',
    role: 'Design lead',
    presence: 'active',
    statusLine: 'Active now',
  },
  {
    id: 'ava',
    name: 'Ava Lindqvist',
    role: 'Engineering',
    presence: 'active',
    statusLine: 'Active now',
    joinedChip: 'Joined Jul 1',
  },
];

const TOOLTIP_NOTE =
  'Notifications paused — mentions are held until 3:00 PM, then delivered.';

// Stand-in message lines for the dimmed channel screen behind the sheet
// (styled bars only — no real chat stream; that ground is messaging-shell's).
const BEHIND_BARS = [72, 46, 64, 38];

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Muted token stage with ONE soft violet radial tint; centers everything.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage: `radial-gradient(1100px 460px at 50% -80px, ${FOCUS_SOFT}, transparent 70%)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
  },
  stageHeader: {textAlign: 'center', maxWidth: 620},
  // Specimen row: three phone-width columns side by side, wrapping.
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
    width: '100%',
  },
  specimenCol: {width: 'min(376px, 100%)'},
  // ---- Specimen 01: phone frame + sheet ----
  phoneFrame: {
    position: 'relative',
    height: 640,
    borderRadius: 'calc(var(--radius-container) * 2)',
    border: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-surface)',
    boxShadow: 'var(--shadow-high)',
  },
  // The channel screen behind the sheet: skeleton bars only, then dimmed
  // by the scrim so the sheet reads as an overlay in both schemes.
  appBehind: {
    position: 'absolute',
    inset: 0,
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  behindHeaderBar: {
    height: 12, width: '40%', borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
  },
  behindRow: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center'},
  behindAvatar: {
    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
    backgroundColor: 'var(--color-background-muted)',
  },
  behindBar: {height: 10, borderRadius: 999, backgroundColor: 'var(--color-background-muted)'},
  scrim: {position: 'absolute', inset: 0, backgroundColor: SCRIM},
  sheet: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    borderTopLeftRadius: 'calc(var(--radius-container) * 2)',
    borderTopRightRadius: 'calc(var(--radius-container) * 2)',
    backgroundColor: 'var(--color-background-surface)',
    boxShadow: 'var(--shadow-high)',
    padding: 'var(--spacing-4)',
    paddingTop: 'var(--spacing-2)',
  },
  grabHandle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'var(--color-border)',
    marginInline: 'auto',
    marginBottom: 'var(--spacing-2)',
  },
  // Preset grid: six 52px tap tiles across the 344px sheet body.
  presetRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 'var(--spacing-1)',
  },
  presetBtn: {
    width: 52, minHeight: 56, gap: 3, paddingBlock: 'var(--spacing-1)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    border: 'var(--border-width) solid transparent',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'transparent', cursor: 'pointer',
  },
  presetBtnSelected: {
    borderColor: FOCUS, backgroundColor: FOCUS_SOFT,
    boxShadow: `inset 0 0 0 1px ${FOCUS}`,
  },
  presetEmoji: {fontSize: 22, lineHeight: '26px'},
  // Scheme-aware plus glyph for the Custom tile: centered in the same
  // 26px emoji line so all six tiles keep identical vertical rhythm.
  customPlus: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: 26, color: 'var(--color-text-secondary)',
  },
  presetLabel: {
    fontSize: 10,
    lineHeight: '12px',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  presetLabelSelected: {color: FOCUS, fontWeight: 600},
  // Focus-mode section: DND switch, duration chips, calendar-sync note.
  durationRow: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1)'},
  chip: {
    minHeight: 36, paddingInline: 'var(--spacing-3)', fontSize: 13,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 999, backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  chipSelected: {
    borderColor: FOCUS, backgroundColor: FOCUS_SOFT, color: FOCUS,
    fontWeight: 600, boxShadow: `inset 0 0 0 1px ${FOCUS}`,
  },
  calNote: {color: 'var(--color-text-secondary)'},
  calIcon: {color: FOCUS, display: 'flex', flexShrink: 0},
  // Status field row: 44px emoji-prefix button + fill TextInput.
  emojiPrefixBtn: {
    width: 44, height: 44, flexShrink: 0, fontSize: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    cursor: 'pointer',
  },
  statusFieldSlot: {minWidth: 0},
  // ---- Specimen 02: active-focus compact card ----
  panel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'calc(var(--radius-container) * 2)',
    backgroundColor: 'var(--color-background-surface)',
    boxShadow: 'var(--shadow-high)',
    padding: 'var(--spacing-4)',
  },
  ringWrap: {position: 'relative', width: 56, height: 56, flexShrink: 0},
  ringSvg: {display: 'block', transform: 'rotate(-90deg)'},
  ringGlyph: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: FOCUS,
  },
  // Suppressed-notifications counter; title carries the 3+9 breakdown.
  heldChip: {
    display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-1)',
    minHeight: 28, paddingInline: 'var(--spacing-2)', borderRadius: 999,
    backgroundColor: FOCUS_SOFT, color: FOCUS,
    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
  },
  focusTitle: {minWidth: 0},
  snoozedNote: {color: 'var(--color-text-secondary)'},
  // ---- Specimen 03: teammate view ----
  personRow: {
    paddingBlock: 'var(--spacing-2)',
  },
  avatarWrap: {position: 'relative', flexShrink: 0},
  focusBadge: {
    position: 'absolute', right: -2, bottom: -2,
    width: 16, height: 16, borderRadius: '50%',
    backgroundColor: FOCUS,
    // Glyph must read on the violet in both schemes: white on the deep
    // light value, near-black on the 300-weight dark value.
    color: 'light-dark(#FFFFFF, #1C1333)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid var(--color-background-surface)',
    boxSizing: 'content-box',
  },
  presenceDot: {
    position: 'absolute', right: -1, bottom: -1,
    width: 10, height: 10, borderRadius: '50%',
    backgroundColor: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
    border: '2px solid var(--color-background-surface)',
    boxSizing: 'content-box',
  },
  personText: {minWidth: 0},
  // Statically-open tooltip bubble anchored under Marcus's row, with a
  // hand-rolled caret; deterministic — no hover dependency.
  tooltipWrap: {position: 'relative', paddingTop: 8, maxWidth: 300},
  tooltipCaret: {
    position: 'absolute', top: 3, left: 18,
    width: 10, height: 10, transform: 'rotate(45deg)',
    backgroundColor: 'var(--color-background-card)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    borderLeft: 'var(--border-width) solid var(--color-border)',
  },
  tooltipBubble: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-high)',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
  },
  joinedChip: {
    display: 'inline-flex', alignItems: 'center', flexShrink: 0,
    minHeight: 20, paddingInline: 'var(--spacing-2)', borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 11, whiteSpace: 'nowrap',
  },
  fullWidth: {width: '100%'},
  // Ended-state glyph disc: same 56px footprint as the ring so the card's
  // geometry does not shift when the block ends.
  ringGlyphStatic: {
    width: 56, height: 56, flexShrink: 0, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
};

// ============= SHARED BITS =============

/**
 * Specimen wrapper: mono state-id Token + one-line note ABOVE the frozen
 * specimen, per the composer-state-gallery caption idiom.
 */
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
          {/* flexShrink:0 keeps the mono state id from truncating next to
              the long one-line note. */}
          <div style={{flexShrink: 0}}>
            <Token label={stateId} size="sm" color="gray" />
          </div>
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        </HStack>
        {children}
      </VStack>
    </div>
  );
}

/**
 * SVG progress ring around the flame glyph. Track in the border token,
 * remaining-time arc in the focus violet; geometry derives from the fixed
 * 18-of-60-minutes fixture, so the arc shows 70% remaining.
 */
function FocusRing() {
  const radius = 24;
  const stroke = 4;
  const circumference = 2 * Math.PI * radius;
  const remainingFraction =
    (FOCUS_TOTAL_MIN - FOCUS_ELAPSED_MIN) / FOCUS_TOTAL_MIN;
  const dashOffset = circumference * (1 - remainingFraction);
  return (
    <div style={styles.ringWrap}>
      <svg
        width={56}
        height={56}
        viewBox="0 0 56 56"
        role="img"
        aria-label="Focus block: 42 of 60 minutes remaining"
        style={styles.ringSvg}>
        <circle
          cx={28}
          cy={28}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={28}
          cy={28}
          r={radius}
          fill="none"
          stroke={FOCUS}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div style={styles.ringGlyph}>
        <Icon icon={FlameIcon} size="md" color="inherit" />
      </div>
    </div>
  );
}

/** One 52px preset tile: emoji over a tiny label; selected gets the ring. */
function PresetTile({
  preset,
  isSelected,
  onSelect,
}: {
  preset: StatusPreset;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      style={
        isSelected
          ? {...styles.presetBtn, ...styles.presetBtnSelected}
          : styles.presetBtn
      }
      onClick={() => onSelect(preset.id)}>
      <span style={styles.presetEmoji} aria-hidden="true">
        {preset.id === 'custom' ? (
          <span style={styles.customPlus}>
            <Icon icon={PlusIcon} size="md" color="inherit" />
          </span>
        ) : (
          preset.emoji
        )}
      </span>
      <span
        style={
          isSelected
            ? {...styles.presetLabel, ...styles.presetLabelSelected}
            : styles.presetLabel
        }>
        {preset.label}
      </span>
    </button>
  );
}

// ============= SPECIMEN 01 · SHEET OPEN =============

function SheetOpenSpecimen() {
  const [presetId, setPresetId] = useState('focus');
  const [durationId, setDurationId] = useState('1h');
  const [isDndOn, setIsDndOn] = useState(true);
  const [statusText, setStatusText] = useState(
    'Deep work — beta ramp dashboards',
  );
  const [clearAfter, setClearAfter] = useState('focus-end');

  const selectedPreset =
    STATUS_PRESETS.find(preset => preset.id === presetId) ?? STATUS_PRESETS[0];

  const selectPreset = (id: string) => {
    setPresetId(id);
    const next = STATUS_PRESETS.find(preset => preset.id === id);
    if (next != null && next.id !== 'custom') {
      setStatusText(next.message);
    }
  };

  return (
    <Specimen
      stateId="01 · sheet-open"
      note="Status sheet at 2:00 PM: Focusing preset, DND on, 1h selected.">
      <div style={styles.phoneFrame}>
        {/* Dimmed stand-in of the #atlas-q3 screen behind the sheet. */}
        <div style={styles.appBehind} aria-hidden="true">
          <div style={styles.behindHeaderBar} />
          {BEHIND_BARS.map(width => (
            <div key={width} style={styles.behindRow}>
              <div style={styles.behindAvatar} />
              <div style={{...styles.behindBar, width: `${width}%`}} />
            </div>
          ))}
        </div>
        <div style={styles.scrim} aria-hidden="true" />
        <div style={styles.sheet}>
          <div style={styles.grabHandle} aria-hidden="true" />
          <VStack gap={3}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Heading level={2}>Set a status</Heading>
              </StackItem>
              <IconButton
                label="Close status sheet"
                icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => {}}
              />
            </HStack>
            <div style={styles.presetRow} role="group" aria-label="Status presets">
              {STATUS_PRESETS.map(preset => (
                <PresetTile
                  key={preset.id}
                  preset={preset}
                  isSelected={preset.id === presetId}
                  onSelect={selectPreset}
                />
              ))}
            </div>
            <Divider />
            <VStack gap={2}>
              <Switch
                label="Focus mode (Do not disturb)"
                description={
                  isDndOn
                    ? 'Notifications paused — mentions are held for later'
                    : 'Notifications will come through normally'
                }
                value={isDndOn}
                onChange={setIsDndOn}
              />
              <div style={styles.durationRow} role="group" aria-label="Focus duration">
                {DURATIONS.map(duration => (
                  <button
                    key={duration.id}
                    type="button"
                    aria-pressed={duration.id === durationId}
                    title={`Until ${duration.until}`}
                    style={
                      duration.id === durationId
                        ? {...styles.chip, ...styles.chipSelected}
                        : styles.chip
                    }
                    onClick={() => setDurationId(duration.id)}>
                    {duration.label}
                  </button>
                ))}
              </div>
              <HStack gap={1} vAlign="center">
                <span style={styles.calIcon}>
                  <Icon icon={CalendarIcon} size="sm" color="inherit" />
                </span>
                <Text type="supporting" style={styles.calNote}>
                  {CALENDAR_NOTE}
                </Text>
              </HStack>
            </VStack>
            <Divider />
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <button
                  type="button"
                  aria-label={`Status emoji: ${selectedPreset.label}. Change emoji`}
                  style={styles.emojiPrefixBtn}
                  onClick={() => {}}>
                  <span aria-hidden="true">
                    {selectedPreset.id === 'custom'
                      ? '\u{1F4AC}'
                      : selectedPreset.emoji}
                  </span>
                </button>
                <StackItem size="fill" style={styles.statusFieldSlot}>
                  <TextInput
                    label="Status message"
                    isLabelHidden
                    value={statusText}
                    onChange={setStatusText}
                    placeholder="What's your status?"
                    hasClear
                  />
                </StackItem>
              </HStack>
              <Selector
                label="Clear status after"
                options={CLEAR_AFTER_OPTIONS}
                value={clearAfter}
                onChange={value => setClearAfter(value)}
              />
            </VStack>
            <Button
              label={isDndOn ? 'Set status & start focus' : 'Set status'}
              variant="primary"
              style={styles.fullWidth}
              onClick={() => {}}
            />
          </VStack>
        </div>
      </div>
    </Specimen>
  );
}

// ============= SPECIMEN 02 · ACTIVE FOCUS =============

type FocusPhase = 'running' | 'snoozed' | 'ended';

function ActiveFocusSpecimen() {
  const [phase, setPhase] = useState<FocusPhase>('running');

  return (
    <Specimen
      stateId="02 · active-focus"
      note="The same block at 2:18 PM — 42m left; Snooze and End are live.">
      <div style={styles.panel}>
        {phase === 'ended' ? (
          <VStack gap={3}>
            <HStack gap={3} vAlign="center">
              <div style={styles.ringGlyphStatic}>
                <Icon icon={BellOffIcon} size="md" color="inherit" />
              </div>
              <StackItem size="fill" style={styles.focusTitle}>
                <VStack gap={0}>
                  <Text type="label">Focus ended early</Text>
                  <Text type="supporting" color="secondary">
                    18m focused · {HELD_TOTAL} held notifications delivered
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
            <Button
              label="Start another focus block"
              variant="secondary"
              style={styles.fullWidth}
              onClick={() => setPhase('running')}
            />
          </VStack>
        ) : (
          <VStack gap={3}>
            <HStack gap={3} vAlign="center">
              <FocusRing />
              <StackItem size="fill" style={styles.focusTitle}>
                <VStack gap={0}>
                  <Text type="label" maxLines={1}>
                    Focusing · {FOCUS_LEFT_LABEL}
                  </Text>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {FOCUS_ENDS_LABEL} · Do not disturb
                  </Text>
                </VStack>
              </StackItem>
              <span style={styles.heldChip} title={HELD_BREAKDOWN}>
                <Icon icon={BellOffIcon} size="sm" color="inherit" />
                {HELD_TOTAL} held
              </span>
            </HStack>
            {phase === 'snoozed' ? (
              <Text type="supporting" style={styles.snoozedNote}>
                Snoozed — notifications resume for 5 minutes, then focus
                continues.
              </Text>
            ) : null}
            <HStack gap={2}>
              <StackItem size="fill">
                <Button
                  label={phase === 'snoozed' ? 'Resume focus' : 'Snooze 5m'}
                  variant="secondary"
                  style={styles.fullWidth}
                  icon={<Icon icon={AlarmClockIcon} size="sm" color="inherit" />}
                  onClick={() =>
                    setPhase(prev => (prev === 'snoozed' ? 'running' : 'snoozed'))
                  }
                />
              </StackItem>
              <StackItem size="fill">
                <Button
                  label="End focus"
                  variant="secondary"
                  style={styles.fullWidth}
                  icon={<Icon icon={SquareIcon} size="sm" color="inherit" />}
                  onClick={() => setPhase('ended')}
                />
              </StackItem>
            </HStack>
          </VStack>
        )}
      </div>
    </Specimen>
  );
}

// ============= SPECIMEN 03 · TEAMMATE VIEW =============

/** One member-list row: Avatar with focus badge or presence dot. */
function PersonRow({member}: {member: MemberRow}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.personRow}>
      <div style={styles.avatarWrap}>
        <Avatar name={member.name} size="small" />
        {member.presence === 'focus' ? (
          <span
            style={styles.focusBadge}
            role="img"
            aria-label="In a focus block — notifications paused">
            <MoonIcon size={9} strokeWidth={2.5} aria-hidden="true" />
          </span>
        ) : (
          <span
            style={styles.presenceDot}
            role="img"
            aria-label="Active now"
          />
        )}
      </div>
      <StackItem size="fill" style={styles.personText}>
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <Text size="sm" maxLines={1}>
              {member.name}
            </Text>
            {member.joinedChip != null ? (
              <span style={styles.joinedChip}>{member.joinedChip}</span>
            ) : null}
          </HStack>
          <Text type="supporting" color="secondary" maxLines={1}>
            {member.role}
            {member.statusLine != null ? ` · ${member.statusLine}` : ''}
          </Text>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function TeammateViewSpecimen() {
  return (
    <Specimen
      stateId="03 · teammate-view"
      note="How the status reads in the #atlas-q3 member list; tooltip pinned open.">
      <div style={styles.panel}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" size="sm" color="secondary">
                #atlas-q3 · Members
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              3 of 9 shown
            </Text>
          </HStack>
          <VStack gap={0}>
            <PersonRow member={MEMBER_ROWS[0]} />
            {/* Statically-open tooltip: what a teammate sees on hovering
                the focus badge. Anchored under Marcus's row. */}
            <div style={styles.tooltipWrap} role="note">
              <div style={styles.tooltipCaret} aria-hidden="true" />
              <div style={styles.tooltipBubble}>
                <VStack gap={1}>
                  <HStack gap={1} vAlign="center">
                    <span style={styles.calIcon}>
                      <Icon icon={BellOffIcon} size="sm" color="inherit" />
                    </span>
                    <Text type="label" size="sm">
                      Focusing until 3:00 PM
                    </Text>
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {TOOLTIP_NOTE}
                  </Text>
                </VStack>
              </div>
            </div>
            <Divider />
            <PersonRow member={MEMBER_ROWS[1]} />
            <Divider />
            <PersonRow member={MEMBER_ROWS[2]} />
          </VStack>
        </VStack>
      </div>
    </Specimen>
  );
}

// ============= PAGE =============

export default function FocusStatusSheetTemplate() {
  return (
    <div style={styles.stage}>
      <div style={styles.stageHeader}>
        <VStack gap={1} hAlign="center">
          <Heading level={1}>Focus & Status Sheet — 3 specimens</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs team workspace · set, run, and observe a focus
            status · deterministic fixtures, Wed Jul 15, 2026
          </Text>
        </VStack>
      </div>
      <div style={styles.specimenRow}>
        <SheetOpenSpecimen />
        <ActiveFocusSpecimen />
        <TeammateViewSpecimen />
      </div>
    </div>
  );
}
