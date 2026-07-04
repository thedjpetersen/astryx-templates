// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file poll-composer-card.tsx
 * @input Deterministic fixtures only: one Kestrel Labs channel poll —
 *   Dana Whitfield drafting "Team lunch Thursday?" to #atlas-q3 (12
 *   members) on Wed Jul 15, 2026 — with three lunch options, a fixed
 *   9-of-12 vote tally split 5/3/1 across the Atlas roster, fixed
 *   posted/closes timestamps (Wed 11:30 AM → Thu 11:30 AM), and the
 *   Thu Jul 16 close. No clocks, no randomness, no network assets.
 * @output Poll Composer & Results — three side-by-side specimens of the
 *   same inline channel-poll card, each frozen at a different point in
 *   its lifecycle: specimen 01 is the composer (question field filled,
 *   three option rows with drag grips and remove buttons, add-option
 *   affordance, settings row with Multi-select and Anonymous Switches
 *   plus a Closes-in Selector pinned to 24 hours, and a Post button);
 *   specimen 02 is the live results card (9 of 12 voted, per-option
 *   accent bars with right-aligned tabular counts and percentages,
 *   voter facepiles under each bar, an accent "Your vote" check on
 *   Thai Basil, and a "Closes in 21h" countdown chip) where tapping
 *   another option moves your vote and recomputes every tally; and
 *   specimen 03 is the closed state (winner ringed with a crown chip
 *   and final 5-vote · 56% tally, losing bars muted, close timestamp
 *   and order-thread follow-up line). Caption rows — mono state-id
 *   Token + one-line note — sit ABOVE each specimen.
 * @position Block template; emitted by `astryx template poll-composer-card`
 *
 * Frame: no app shell — this is an INDIVIDUAL SMALL EXPERIENCE per the
 * specimen-gallery idiom. A full-bleed stage div (minHeight 100dvh,
 * token muted wash with one soft accent radial tint) centers a small
 * header and a wrapping specimen row; each specimen is a 380px-wide
 * poll card (the width the block would have inside a channel message
 * column) under its caption row. All three specimens share the same
 * shell, bar geometry, and row anatomy so the lifecycle reads as one
 * component photographed three times.
 *
 * Responsive contract:
 * - >=1280px: the three specimens sit side by side, top-aligned.
 * - <1280px: the specimen row flex-wraps (2+1, then a single stacked
 *   column); each card keeps width:min(380px, 100%) so nothing clips
 *   at 375px. Settings and footer rows flexWrap instead of clipping.
 * - Results options are full-width real <button>s (>=44px tall) with
 *   aria-pressed, so moving a vote works for touch and keyboard alike;
 *   composer drag grips are decorative affordances (aria-hidden) — the
 *   remove/add buttons are the functional editing path.
 *
 * Container policy (anatomy-gallery archetype): each specimen is one
 * design-system Card so the frozen states read against the stage wash;
 * option editor rows, tally bars, and result rows are hand-rolled
 * divs/buttons in the repo style-object idiom because they are the
 * poll block's own anatomy. No nested Cards.
 *
 * Color policy: token-pure. ONE accent — var(--color-accent) — carries
 * the live tally bars, the your-vote check + ring, the countdown chip
 * tint, and the Post button; the closed specimen keeps accent ONLY on
 * the winner (bar, ring, crown chip row) and drops losing bars to a
 * neutral light-dark gray pair. No scheme-locked surfaces. Anonymous
 * polls would render counts only (no facepiles) — the rule is noted on
 * the results footer since this poll posted with Anonymous off.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {
  CheckIcon,
  CrownIcon,
  GripVerticalIcon,
  PlusIcon,
  TimerIcon,
  VoteIcon,
  XIcon,
} from 'lucide-react';

// ============= FIXTURES =============
// One poll, one world: Dana Whitfield (People Ops) polls #atlas-q3 for
// lunch after Thursday's Launch Readiness Review. Suite "now" anchor is
// Wed Jul 15, 2026 — every timestamp below is a fixed string derived
// from it, never computed from a clock.

const CHANNEL = '#atlas-q3';
const CHANNEL_MEMBER_COUNT = 12;
const AUTHOR_NAME = 'Dana Whitfield';
const QUESTION = 'Team lunch Thursday?';
const POSTED_AT = 'Wed Jul 15 · 11:30 AM';
// Short close-time form: fits the 380px composer footer on one line.
const CLOSES_AT_SHORT = 'Thu 11:30 AM';
const COUNTDOWN_LABEL = 'Closes in 21h';
const CLOSED_CHIP_LABEL = 'Closed · Thu 11:30 AM';

// Composer draft — the exact poll specimens 02/03 show later, frozen
// mid-edit. Two-option minimum, six-option maximum.
const DRAFT_OPTIONS = [
  {id: 'opt-souvla', text: 'Souvla — walk over'},
  {id: 'opt-thai', text: 'Thai Basil — group delivery'},
  {id: 'opt-rooftop', text: 'Rooftop picnic — bring your own'},
];
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const CLOSES_IN_OPTIONS = [
  {value: '1h', label: '1 hour'},
  {value: '8h', label: '8 hours'},
  {value: '24h', label: '24 hours'},
  {value: '3d', label: '3 days'},
];

// Results — 9 of 12 channel members voted: 8 named Atlas teammates plus
// you. Facepiles list the named voters; YOUR vote renders as the accent
// check on the row (you are never drawn in a facepile), so faces + check
// always reconcile with the count column. 5 + (2+you) + 1 = 9.
interface PollOption {
  id: string;
  label: string;
  voterNames: string[]; // named voters, excluding you
}

const RESULT_OPTIONS: PollOption[] = [
  {
    id: 'opt-souvla',
    label: 'Souvla — walk over',
    voterNames: [
      'Priya Raman',
      'Marcus Webb',
      'Jonah Fields',
      'Tom Okonkwo',
      'Ava Lindqvist',
    ],
  },
  {
    id: 'opt-thai',
    label: 'Thai Basil — group delivery',
    voterNames: ['Sofia Ortiz', 'Dana Whitfield'],
  },
  {
    id: 'opt-rooftop',
    label: 'Rooftop picnic — bring your own',
    voterNames: ['Ken Tanaka'],
  },
];

const YOUR_INITIAL_VOTE_ID = 'opt-thai';
const WINNER_ID = 'opt-souvla';
const FACEPILE_MAX = 4;

/** Total ballots cast: every named voter plus your single vote. */
const TOTAL_VOTES =
  RESULT_OPTIONS.reduce((sum, option) => sum + option.voterNames.length, 0) + 1;

function countFor(option: PollOption, yourVoteId: string | null): number {
  return option.voterNames.length + (option.id === yourVoteId ? 1 : 0);
}

function percentFor(count: number): number {
  return Math.round((count / TOTAL_VOTES) * 100);
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Muted token stage with ONE soft accent radial tint; centers the
  // header and the wrapping specimen row.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage:
      'radial-gradient(1100px 460px at 50% -80px, var(--color-accent-muted), transparent 70%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
  },
  stageHeader: {textAlign: 'center', maxWidth: 620},
  // Specimen row: three cards side by side, wrapping to 2+1 then a column.
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
    width: '100%',
  },
  specimen: {
    width: 'min(380px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // The mono state-id Token must never truncate; the note text is the
  // flexible (wrapping) side of the caption row.
  captionToken: {display: 'flex', flexShrink: 0},
  // Decorative drag grip on composer option rows (aria-hidden; the
  // remove/add buttons are the accessible editing path).
  grip: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-text-secondary)',
    cursor: 'grab',
    flexShrink: 0,
  },
  // Settings + footer rows wrap instead of clipping at narrow widths.
  wrapRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  closesSelector: {width: 132},
  // Tally bar geometry shared by the open and closed specimens so the
  // lifecycle stays registered across cards.
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-gray)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'var(--color-accent)',
  },
  barFillMuted: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'light-dark(rgba(10,19,23,0.30), rgba(255,255,255,0.34))',
  },
  // Result rows are real buttons; your vote carries an inset accent ring
  // so the highlight never bleeds onto neighboring rows.
  resultRow: {
    display: 'block',
    width: '100%',
    textAlign: 'start',
    font: 'inherit',
    color: 'inherit',
    background: 'transparent',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    cursor: 'pointer',
    minHeight: 44,
  },
  resultRowYours: {
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  // Closed rows are static (no cursor); the winner keeps the accent ring
  // plus a soft accent wash behind the crown row.
  closedRow: {cursor: 'default'},
  winnerRow: {backgroundColor: 'var(--color-accent-muted)'},
  // Numeric column: right-aligned, tabular, fixed width so bars and
  // counts share a gridline across all rows.
  countText: {minWidth: 64, textAlign: 'end', flexShrink: 0},
  yourVoteMark: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-accent)',
    flexShrink: 0,
  },
  // Closed-card copy of the your-vote check: secondary, never accent —
  // the closed specimen reserves accent for the winner alone.
  yourVoteMarkMuted: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  optionLabel: {minWidth: 0},
};

// ============= SHARED SPECIMEN BITS =============

/**
 * Caption row (mono state-id Token + one-line note) ABOVE the specimen,
 * per the specimen-gallery idiom.
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
    <div style={styles.specimen}>
      <HStack gap={2} vAlign="center">
        <span style={styles.captionToken}>
          <Token label={stateId} size="sm" color="gray" />
        </span>
        <Text type="supporting" color="secondary" maxLines={2}>
          {note}
        </Text>
      </HStack>
      {children}
    </div>
  );
}

/**
 * Card header shared by all three specimens: poll glyph + channel label
 * on the start side, one lifecycle chip (draft / countdown / closed) on
 * the end side.
 */
function PollCardHeader({chip}: {chip: ReactNode}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.wrapRow}>
      <Icon icon={VoteIcon} size="sm" color="secondary" />
      <Text type="label" size="sm" color="secondary">
        Poll · {CHANNEL}
      </Text>
      <StackItem size="fill" />
      {chip}
    </HStack>
  );
}

/** Author byline: Dana posted (or is drafting) this poll. */
function AuthorLine({context}: {context: string}) {
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={AUTHOR_NAME} size="xsmall" />
      <Text type="supporting" color="secondary" maxLines={1}>
        {AUTHOR_NAME} · {context}
      </Text>
    </HStack>
  );
}

/** Accent tally bar; closed losers swap to the muted gray fill. */
function TallyBar({percent, isMuted}: {percent: number; isMuted?: boolean}) {
  return (
    <div style={styles.barTrack}>
      <div
        style={{
          ...(isMuted ? styles.barFillMuted : styles.barFill),
          width: `${percent}%`,
        }}
      />
    </div>
  );
}

/**
 * Named-voter facepile (you are shown via the row check, never a face).
 * Anonymous polls would render the count text alone — no faces.
 */
function VoterFacepile({option}: {option: PollOption}) {
  if (option.voterNames.length === 0) {
    return (
      <Text type="supporting" color="secondary">
        No votes yet
      </Text>
    );
  }
  const visible = option.voterNames.slice(0, FACEPILE_MAX);
  const overflow = option.voterNames.length - visible.length;
  return (
    <AvatarGroup
      size="xsmall"
      aria-label={`Voters: ${option.voterNames.join(', ')}`}>
      {visible.map(name => (
        <Avatar key={name} name={name} />
      ))}
      {overflow > 0 ? <AvatarGroupOverflow count={overflow} /> : null}
    </AvatarGroup>
  );
}

// ============= SPECIMEN 01 · COMPOSER =============

interface DraftOption {
  id: string;
  text: string;
}

function ComposerSpecimen() {
  const [question, setQuestion] = useState(QUESTION);
  const [options, setOptions] = useState<DraftOption[]>(DRAFT_OPTIONS);
  const [nextOptionIndex, setNextOptionIndex] = useState(4);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [closesIn, setClosesIn] = useState('24h');

  const filledOptionCount = options.filter(
    option => option.text.trim().length > 0,
  ).length;
  const canPost = question.trim().length > 0 && filledOptionCount >= MIN_OPTIONS;

  const patchOption = (id: string, text: string) => {
    setOptions(prev =>
      prev.map(option => (option.id === id ? {...option, text} : option)),
    );
  };
  const removeOption = (id: string) => {
    setOptions(prev =>
      prev.length > MIN_OPTIONS
        ? prev.filter(option => option.id !== id)
        : prev,
    );
  };
  const addOption = () => {
    setOptions(prev =>
      prev.length < MAX_OPTIONS
        ? [...prev, {id: `opt-new-${nextOptionIndex}`, text: ''}]
        : prev,
    );
    setNextOptionIndex(prev => prev + 1);
  };

  return (
    <Specimen
      stateId="01 · composing"
      note="Dana drafts the poll: grips + option editing, settings row, 24h close.">
      <Card padding={3}>
        <VStack gap={3}>
          <PollCardHeader
            chip={<Token label="Draft" size="sm" color="gray" />}
          />
          <AuthorLine
            context={`drafting to ${CHANNEL} · ${CHANNEL_MEMBER_COUNT} members`}
          />
          <TextInput
            label="Poll question"
            isLabelHidden
            value={question}
            onChange={setQuestion}
            placeholder="Ask the channel…"
          />
          <VStack gap={2}>
            {options.map((option, index) => (
              <HStack key={option.id} gap={2} vAlign="center">
                <div style={styles.grip} aria-hidden="true">
                  <Icon icon={GripVerticalIcon} size="sm" color="inherit" />
                </div>
                <StackItem size="fill">
                  <TextInput
                    label={`Option ${index + 1}`}
                    isLabelHidden
                    size="sm"
                    value={option.text}
                    onChange={text => patchOption(option.id, text)}
                    placeholder={`Option ${index + 1}`}
                  />
                </StackItem>
                <IconButton
                  label={`Remove option ${index + 1}`}
                  tooltip="Remove option"
                  icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                  variant="ghost"
                  size="sm"
                  isDisabled={options.length <= MIN_OPTIONS}
                  onClick={() => removeOption(option.id)}
                />
              </HStack>
            ))}
          </VStack>
          <HStack gap={2} vAlign="center">
            <Button
              label="Add option"
              variant="secondary"
              size="sm"
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
              isDisabled={options.length >= MAX_OPTIONS}
              onClick={addOption}
            />
            <Text type="supporting" color="secondary">
              up to {MAX_OPTIONS}
            </Text>
          </HStack>
          <Divider />
          <HStack gap={4} vAlign="center" style={styles.wrapRow}>
            <Switch
              label="Multi-select"
              value={isMultiSelect}
              onChange={setIsMultiSelect}
            />
            <Switch
              label="Anonymous"
              value={isAnonymous}
              onChange={setIsAnonymous}
            />
            <StackItem size="fill" />
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="secondary">
                Closes in
              </Text>
              <div style={styles.closesSelector}>
                <Selector
                  label="Closes in"
                  isLabelHidden
                  size="sm"
                  options={CLOSES_IN_OPTIONS}
                  value={closesIn}
                  onChange={setClosesIn}
                />
              </div>
            </HStack>
          </HStack>
          <Divider />
          <HStack gap={2} vAlign="center" style={styles.wrapRow}>
            <Text type="supporting" color="secondary" maxLines={2}>
              Posts to {CHANNEL} · closes {CLOSES_AT_SHORT}
            </Text>
            <StackItem size="fill" />
            <Button
              label="Post poll"
              variant="primary"
              size="sm"
              isDisabled={!canPost}
            />
          </HStack>
        </VStack>
      </Card>
    </Specimen>
  );
}

// ============= SPECIMEN 02 · OPEN — LIVE RESULTS =============

/**
 * One live result row: label + your-vote check, accent tally bar, then
 * facepile and the right-aligned tabular count column. The whole row is
 * a real button (aria-pressed) — tapping another option moves your vote
 * and every tally recomputes deterministically.
 */
function LiveResultRow({
  option,
  yourVoteId,
  onVote,
}: {
  option: PollOption;
  yourVoteId: string;
  onVote: (id: string) => void;
}) {
  const isYours = option.id === yourVoteId;
  const count = countFor(option, yourVoteId);
  const percent = percentFor(count);
  return (
    <button
      type="button"
      aria-pressed={isYours}
      aria-label={`${option.label} — ${count} of ${TOTAL_VOTES} votes (${percent}%)${isYours ? ' — your vote' : ''}`}
      style={
        isYours ? {...styles.resultRow, ...styles.resultRowYours} : styles.resultRow
      }
      onClick={() => onVote(option.id)}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={styles.optionLabel}>
            <Text type="label" size="sm" maxLines={1}>
              {option.label}
            </Text>
          </StackItem>
          {isYours && (
            <span style={styles.yourVoteMark}>
              <Icon icon={CheckIcon} size="sm" color="inherit" />
            </span>
          )}
          {isYours && (
            <Text type="supporting" color="secondary">
              Your vote
            </Text>
          )}
          <Text
            type="supporting"
            color="secondary"
            hasTabularNumbers
            style={styles.countText}>
            {count} · {percent}%
          </Text>
        </HStack>
        <TallyBar percent={percent} />
        <VoterFacepile option={option} />
      </VStack>
    </button>
  );
}

function LiveResultsSpecimen() {
  const [yourVoteId, setYourVoteId] = useState(YOUR_INITIAL_VOTE_ID);
  const votedCount = TOTAL_VOTES; // 9 ballots: 8 named voters + you

  return (
    <Specimen
      stateId="02 · open"
      note="9 of 12 voted; tap a row to move your vote. Anonymous polls show counts only.">
      <Card padding={3}>
        <VStack gap={3}>
          <PollCardHeader
            chip={
              <Token
                label={COUNTDOWN_LABEL}
                size="sm"
                color="orange"
                icon={<Icon icon={TimerIcon} size="sm" color="inherit" />}
              />
            }
          />
          <AuthorLine context={POSTED_AT} />
          <Heading level={3}>{QUESTION}</Heading>
          <VStack gap={2}>
            {RESULT_OPTIONS.map(option => (
              <LiveResultRow
                key={option.id}
                option={option}
                yourVoteId={yourVoteId}
                onVote={setYourVoteId}
              />
            ))}
          </VStack>
          <Divider />
          <HStack gap={2} vAlign="center" style={styles.wrapRow}>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {votedCount} of {CHANNEL_MEMBER_COUNT} voted · single choice ·
              votes visible
            </Text>
          </HStack>
        </VStack>
      </Card>
    </Specimen>
  );
}

// ============= SPECIMEN 03 · CLOSED =============

/**
 * Closed rows are static divs (no vote affordance). The winner keeps the
 * accent bar, an inset accent ring, a soft accent wash, and the crown
 * chip; losing rows drop to the muted gray fill.
 */
function ClosedResultRow({option}: {option: PollOption}) {
  const isWinner = option.id === WINNER_ID;
  const isYours = option.id === YOUR_INITIAL_VOTE_ID;
  const count = countFor(option, YOUR_INITIAL_VOTE_ID);
  const percent = percentFor(count);
  const rowStyle: CSSProperties = {
    ...styles.resultRow,
    ...styles.closedRow,
    ...(isWinner ? {...styles.resultRowYours, ...styles.winnerRow} : null),
  };
  return (
    <div style={rowStyle}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={styles.optionLabel}>
            <Text type="label" size="sm" maxLines={1}>
              {option.label}
            </Text>
          </StackItem>
          {isWinner && (
            <Token
              label="Winner"
              size="sm"
              color="yellow"
              icon={<Icon icon={CrownIcon} size="sm" color="inherit" />}
            />
          )}
          {isYours && (
            <>
              <span style={styles.yourVoteMarkMuted}>
                <Icon icon={CheckIcon} size="sm" color="inherit" />
              </span>
              <Text type="supporting" color="secondary">
                Your vote
              </Text>
            </>
          )}
          <Text
            type="supporting"
            color="secondary"
            hasTabularNumbers
            style={styles.countText}>
            {count} · {percent}%
          </Text>
        </HStack>
        <TallyBar percent={percent} isMuted={!isWinner} />
        <VoterFacepile option={option} />
      </VStack>
    </div>
  );
}

function ClosedSpecimen() {
  return (
    <Specimen
      stateId="03 · closed"
      note="Closed Thu 11:30 AM: winner crowned, final tally locked.">
      <Card padding={3}>
        <VStack gap={3}>
          <PollCardHeader
            chip={<Token label={CLOSED_CHIP_LABEL} size="sm" color="gray" />}
          />
          <AuthorLine context={POSTED_AT} />
          <Heading level={3}>{QUESTION}</Heading>
          <VStack gap={2}>
            {RESULT_OPTIONS.map(option => (
              <ClosedResultRow key={option.id} option={option} />
            ))}
          </VStack>
          <Divider />
          <VStack gap={1}>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Final — {TOTAL_VOTES} of {CHANNEL_MEMBER_COUNT} voted · single
              choice
            </Text>
            <Text type="supporting" color="secondary" maxLines={2}>
              Souvla it is — Dana posted the order thread in {CHANNEL}, Thu
              11:42 AM.
            </Text>
          </VStack>
        </VStack>
      </Card>
    </Specimen>
  );
}

// ============= PAGE =============

export default function PollComposerCardTemplate() {
  return (
    <div style={styles.stage}>
      <div style={styles.stageHeader}>
        <VStack gap={1} hAlign="center">
          <Heading level={1}>Team poll — composer &amp; results</Heading>
          <Text type="supporting" color="secondary">
            One inline channel-poll block, frozen at three lifecycle points ·
            Kestrel Labs · {CHANNEL}
          </Text>
        </VStack>
      </div>
      <div style={styles.specimenRow}>
        <ComposerSpecimen />
        <LiveResultsSpecimen />
        <ClosedSpecimen />
      </div>
    </div>
  );
}
