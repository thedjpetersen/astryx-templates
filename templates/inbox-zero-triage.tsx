// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one Postlight triage session frozen
 *   mid-morning Thu Jul 2 2026: a three-email stack — top card from Priya
 *   Raman "Q3 budget review — final numbers" at 8:12 AM mid-swipe-right,
 *   Marcus Webb and the Design Weekly digest peeking behind — progress
 *   14 of 32, an undo pill for the previously archived "Vendor contract
 *   renewal", and the session-complete tallies 18 archived + 9 snoozed +
 *   5 replied = 32 with a 6-day streak)
 * @output Swipeable email triage stack for the fictional email app
 *   'Postlight' (coral accent), presented as a SMALL centered experience
 *   at phone width: specimen 01 freezes the triage screen mid-gesture —
 *   status-bar chrome, Postlight wordmark beside a coral '14 of 32'
 *   progress chip, a swipe-action legend (amber '← Snooze' / green
 *   'Archive →' chips), the top email card translated right with a green
 *   ARCHIVE stamp over a revealed success-tinted archive underlay, two
 *   scaled peek cards behind, and a floating undo pill snackbar; specimen
 *   02 beside it freezes the completed state — an 'Inbox zero'
 *   celebration with a coral sparkle medallion, an 18/9/5 stat grid that
 *   sums to the 32-email session, and a flame streak row. Mono state-id
 *   Token captions label the pair.
 * @position Block template; emitted by `astryx template inbox-zero-triage`
 *
 * Frame: no app shell — this is an individual small experience. A
 * full-bleed stage div (minHeight 100dvh, token muted background) centers
 * a small header line and an HStack of two phone-frame specimens at
 * natural width (390px), wrapping to a stacked column on narrow
 * viewports. Each specimen is caption (Token + note) over the phone.
 *
 * Responsive contract:
 * - Phones are width: min(390px, 100%); the specimen row flexWraps and
 *   centers, so <=860px renders one phone per row, still centered.
 * - The stage scrolls vertically when the stacked pair exceeds the
 *   viewport; nothing inside a phone scrolls — the stack scene is a
 *   fixed-height composition and the zero state fits the same height.
 * - Legend chips, header row, and the undo pill share the phone's inline
 *   gutter; snippet text clamps to two lines rather than growing the card.
 *
 * Container policy (small-experience archetype): each phone is one custom
 * rounded surface (--color-background-card, high shadow) because the
 * status bar, layered swipe scene, and floating pill are its anatomy — a
 * design-system Card cannot host absolutely-positioned stack layers.
 * Email cards and the undo pill are custom card surfaces inside it;
 * captions and the stage header are plain stacked text. No nested Cards.
 *
 * Color policy: ONE brand accent — Postlight coral
 * light-dark(#C2412D, #FF9B85) — used for the wordmark glyph, the
 * progress chip, the undo action, the celebration medallion + streak
 * flame, and the 'Back to inbox' CTA. Swipe-action semantics stay on
 * status tokens: snooze on --color-warning*, archive on --color-success*,
 * replied on the categorical blue (with repo-standard fallback). No
 * scheme-locked surfaces; everything is token-pure or light-dark() pairs
 * in both schemes.
 *
 * Motion: none — both specimens are frozen states; the mid-swipe pose is
 * a static transform, so no reduced-motion gating is needed.
 *
 * Fixture policy: fixed strings and times only; no clocks, no randomness,
 * no network assets. Avatars are initials-only. Every count reconciles:
 * 14 triaged of 32 in specimen 01; 18 + 9 + 5 = 32 in specimen 02.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  ArchiveIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BatteryFullIcon,
  ClockIcon,
  FlameIcon,
  InboxIcon,
  MailIcon,
  PaperclipIcon,
  ReplyIcon,
  SignalIcon,
  SparklesIcon,
  Undo2Icon,
  WifiIcon,
} from 'lucide-react';

import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Token} from '@astryxdesign/core/Token';

// ============= BRAND CONSTANTS =============
// Exactly ONE brand accent: Postlight coral. Light side a deep coral-700
// (#C2412D, 4.9:1 on white), dark side coral-300 (#FF9B85, 9.3:1 on the
// near-black card). Text ON the accent fill flips to keep >= 4.5:1.

const BRAND_ACCENT = 'light-dark(#C2412D, #FF9B85)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(194,65,45,0.10), rgba(255,155,133,0.14))';
const ON_ACCENT_TEXT = 'light-dark(#FFFFFF, #3B0F05)';

// Replied stat uses the repo-standard categorical blue fallback pair
// (see calendar-month-grid.tsx) — it is a data category, not the brand.
const REPLIED_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';

// Stage backdrop for the small experience.
const STAGE_BG = 'var(--color-background-muted)';

// ============= STYLES (1/3 — stage, phone frame, header, legend) =============

const styles: Record<string, CSSProperties> = {
  // --- Stage: full-bleed centered backdrop ---
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
  specimenColumn: {width: 'min(390px, 100%)'},
  captionRow: {paddingInline: 'var(--spacing-1)'},
  // --- Phone frame ---
  phone: {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 28,
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-4)',
    color: 'var(--color-text-secondary)',
  },
  statusTime: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  statusGlyphs: {display: 'inline-flex', alignItems: 'center', gap: 6},

  // --- App header: wordmark + progress chip ---
  appHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-4)',
  },
  wordmarkGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT_TEXT,
    flexShrink: 0,
  },
  wordmark: {
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: '-0.01em',
    color: 'var(--color-text-primary)',
    lineHeight: 1.2,
  },
  progressChip: {
    marginLeft: 'auto',
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: 4,
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    borderRadius: 999,
    paddingBlock: 4,
    paddingInline: 'var(--spacing-3)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  progressChipCount: {
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.3,
  },
  progressChipLabel: {fontSize: 11, fontWeight: 600, lineHeight: 1.3},

  // --- Swipe-action legend chips ---
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-4)',
  },
  legendChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingBlock: 4,
    paddingInline: 'var(--spacing-3)',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
  },
  legendSnooze: {
    backgroundColor: 'var(--color-warning-muted)',
    color: 'var(--color-warning)',
  },
  legendArchive: {
    backgroundColor: 'var(--color-success-muted)',
    color: 'var(--color-success)',
  },

  // --- Stack scene: peeks behind, underlay + mid-swipe card in front ---
  stackScene: {
    position: 'relative',
    height: 248,
    marginInline: 'var(--spacing-4)',
    marginTop: 'var(--spacing-4)',
  },
  stackSlot: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    height: 196,
  },
  peekCard: {
    boxSizing: 'border-box',
    height: '100%',
    backgroundColor: 'var(--color-background-surface)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 16,
    padding: 'var(--spacing-3)',
    overflow: 'hidden',
  },
  peekTwo: {transform: 'translateY(28px) scale(0.94)', opacity: 0.9},
  peekThree: {transform: 'translateY(52px) scale(0.88)', opacity: 0.6},
  // --- Archive underlay revealed by the mid-swipe pose ---
  underlay: {
    boxSizing: 'border-box',
    height: '100%',
    borderRadius: 16,
    // success-muted is translucent; back it with the card surface so the
    // peek cards underneath never bleed through the reveal.
    background:
      'linear-gradient(var(--color-success-muted), var(--color-success-muted)), linear-gradient(var(--color-background-card), var(--color-background-card))',
    border: 'var(--border-width) solid var(--color-success)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingInline: 'var(--spacing-4)',
  },
  underlayLabel: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    color: 'var(--color-success)',
  },
  underlayText: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    lineHeight: 1.3,
  },

  // --- Top email card, frozen mid-swipe-right ---
  topCard: {
    boxSizing: 'border-box',
    height: '100%',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 16,
    padding: 'var(--spacing-3)',
    boxShadow: 'var(--shadow-high)',
    transform: 'translateX(76px) rotate(4deg)',
    transformOrigin: '50% 120%',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  archiveStamp: {
    position: 'absolute',
    top: 'var(--spacing-3)',
    // The card is translated 76px past the phone edge and the frame clips
    // it; offset the stamp by the same 76px + gutter so it stays fully
    // visible inside the frame instead of getting sliced at the bezel.
    right: 88,
    transform: 'rotate(8deg)',
    border: '2px solid var(--color-success)',
    color: 'var(--color-success)',
    borderRadius: 8,
    paddingBlock: 2,
    paddingInline: 8,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    lineHeight: 1.4,
    backgroundColor: 'var(--color-success-muted)',
  },
  senderRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'},
  senderName: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  emailTime: {
    marginLeft: 'auto',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    lineHeight: 1.35,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
  },
  snippetText: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.45,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  attachmentChip: {
    marginTop: 'auto',
    alignSelf: 'flex-start',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    paddingBlock: 3,
    paddingInline: 'var(--spacing-2)',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-family-code, monospace)',
    whiteSpace: 'nowrap',
  },

  // --- Floating undo pill (snackbar) ---
  undoDock: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 'var(--spacing-4)',
    paddingInline: 'var(--spacing-4)',
  },
  undoPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    maxWidth: '100%',
    backgroundColor: 'var(--color-background-surface)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 999,
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    boxShadow: 'var(--shadow-high)',
  },
  undoText: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.35,
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  undoEmphasis: {color: 'var(--color-text-primary)', fontWeight: 600},
  undoAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    border: 'none',
    background: 'none',
    padding: 0,
    cursor: 'pointer',
    color: BRAND_ACCENT,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.35,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontFamily: 'inherit',
  },
  // --- Inbox-zero celebration (specimen 02 body) ---
  zeroBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-5)',
    paddingInline: 'var(--spacing-4)',
    textAlign: 'center',
  },
  zeroMedallion: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`,
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'var(--spacing-2)',
    width: '100%',
    marginTop: 'var(--spacing-2)',
  },
  statCell: {
    boxSizing: 'border-box',
    borderRadius: 12,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    paddingBlock: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1,
    color: 'var(--color-text-primary)',
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.4,
  },
  streakRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    paddingBlock: 4,
    paddingInline: 'var(--spacing-3)',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
  },
  zeroCta: {
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT_TEXT,
    borderColor: 'transparent',
    borderRadius: 999,
    width: '100%',
  },
};

// ============= FIXTURES =============
// One triage session, two frozen moments, Thu Jul 2 2026. Counts
// reconcile: specimen 01 shows 14 of 32 triaged with 18 remaining in the
// stack (3 visible); specimen 02 tallies 18 archived + 9 snoozed +
// 5 replied = all 32.

const SESSION = {
  app: 'Postlight',
  statusTime: '9:41',
  triaged: 14,
  total: 32,
  date: 'Thu, Jul 2 2026',
  archived: 18,
  snoozed: 9,
  replied: 5,
  streak: '6-day streak · best 11',
  undoneSubject: 'Vendor contract renewal',
};

interface EmailFixture {
  id: string;
  sender: string;
  time: string;
  subject: string;
  snippet: string;
  attachment?: string;
}

const TOP_EMAIL: EmailFixture = {
  id: 'email-top',
  sender: 'Priya Raman',
  time: '8:12 AM',
  subject: 'Q3 budget review — final numbers',
  snippet:
    'Attached the reconciled sheet ahead of Thursday. Headcount line moved to ops; everything else matches what we walked through.',
  attachment: 'budget-q3.xlsx',
};

const PEEK_EMAILS: EmailFixture[] = [
  {
    id: 'email-peek-1',
    sender: 'Marcus Webb',
    time: '7:58 AM',
    subject: 'Standup notes · Jul 2',
    snippet: 'Shipping the triage refactor today; QA pass moved to Friday.',
  },
  {
    id: 'email-peek-2',
    sender: 'Design Weekly',
    time: '6:30 AM',
    subject: 'Issue 214: gesture affordances',
    snippet: 'This week: why swipe thresholds should be visible, not felt.',
  },
];

// ============= PHONE CHROME =============

/** Faux status bar: fixed 9:41, signal/wifi/battery glyphs. */
function PhoneStatusBar() {
  return (
    <div style={styles.statusBar} aria-hidden="true">
      <span style={styles.statusTime}>{SESSION.statusTime}</span>
      <span style={styles.statusGlyphs}>
        <Icon icon={SignalIcon} size="xsm" color="inherit" />
        <Icon icon={WifiIcon} size="xsm" color="inherit" />
        <Icon icon={BatteryFullIcon} size="xsm" color="inherit" />
      </span>
    </div>
  );
}

/** Postlight wordmark row with the coral progress chip. */
function AppHeader({triaged}: {triaged: number}) {
  return (
    <div style={styles.appHeader}>
      <span style={styles.wordmarkGlyph}>
        <Icon icon={MailIcon} size="sm" color="inherit" />
      </span>
      <span style={styles.wordmark}>{SESSION.app}</span>
      <div style={styles.progressChip}>
        <span style={styles.progressChipCount}>
          {triaged} of {SESSION.total}
        </span>
        <span style={styles.progressChipLabel}>triaged</span>
      </div>
    </div>
  );
}

/** Swipe-action legend: amber snooze on the left, green archive right. */
function SwipeLegend() {
  return (
    <div style={styles.legendRow}>
      <span style={{...styles.legendChip, ...styles.legendSnooze}}>
        <Icon icon={ArrowLeftIcon} size="xsm" color="inherit" />
        <Icon icon={ClockIcon} size="xsm" color="inherit" />
        Snooze
      </span>
      <span style={{...styles.legendChip, ...styles.legendArchive}}>
        Archive
        <Icon icon={ArchiveIcon} size="xsm" color="inherit" />
        <Icon icon={ArrowRightIcon} size="xsm" color="inherit" />
      </span>
    </div>
  );
}

// ============= STACK SCENE =============

/** Sender row + subject + snippet shared by the top and peek cards. */
function EmailFace({email}: {email: EmailFixture}) {
  return (
    <>
      <div style={styles.senderRow}>
        <Avatar name={email.sender} size="xsmall" />
        <span style={styles.senderName}>{email.sender}</span>
        <span style={styles.emailTime}>{email.time}</span>
      </div>
      <div style={styles.subjectText}>{email.subject}</div>
      <div style={styles.snippetText}>{email.snippet}</div>
    </>
  );
}

/**
 * The frozen mid-swipe composition: two scaled peek cards behind, the
 * success-tinted archive underlay in the top slot, and the top card
 * translated right with an ARCHIVE stamp past the reveal threshold.
 */
function TriageStackScene() {
  return (
    <div style={styles.stackScene}>
      <div style={{...styles.stackSlot, ...styles.peekThree}}>
        <div style={styles.peekCard}>
          <EmailFace email={PEEK_EMAILS[1]} />
        </div>
      </div>
      <div style={{...styles.stackSlot, ...styles.peekTwo}}>
        <div style={styles.peekCard}>
          <EmailFace email={PEEK_EMAILS[0]} />
        </div>
      </div>
      <div style={styles.stackSlot}>
        <div style={styles.underlay}>
          <span style={styles.underlayLabel}>
            <Icon icon={ArchiveIcon} size="md" color="inherit" />
            <span style={styles.underlayText}>Archive</span>
          </span>
        </div>
      </div>
      <div style={styles.stackSlot}>
        <div style={styles.topCard}>
          <span style={styles.archiveStamp} aria-hidden="true">
            Archive
          </span>
          <EmailFace email={TOP_EMAIL} />
          {TOP_EMAIL.attachment != null && (
            <span style={styles.attachmentChip}>
              <Icon icon={PaperclipIcon} size="xsm" color="inherit" />
              {TOP_EMAIL.attachment}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Floating undo snackbar pill; Undo flips it to a restored notice. */
function UndoPill() {
  const [isUndone, setIsUndone] = useState(false);
  return (
    <div style={styles.undoDock}>
      <div style={styles.undoPill} role="status">
        <Icon
          icon={isUndone ? InboxIcon : ArchiveIcon}
          size="sm"
          color="secondary"
        />
        <span style={styles.undoText}>
          {isUndone ? 'Moved back to inbox — ' : 'Archived '}
          <span style={styles.undoEmphasis}>
            &lsquo;{SESSION.undoneSubject}&rsquo;
          </span>
        </span>
        {!isUndone && (
          <button
            type="button"
            style={styles.undoAction}
            onClick={() => setIsUndone(true)}>
            <Icon icon={Undo2Icon} size="xsm" color="inherit" />
            Undo
          </button>
        )}
      </div>
    </div>
  );
}

// ============= INBOX-ZERO STATE =============

interface StatFixture {
  key: string;
  label: string;
  value: number;
  icon: typeof ArchiveIcon;
  color: string;
}

// Stat colors: archive/snooze stay on status tokens; replied is the
// categorical blue (data category, not brand).
const ZERO_STATS: StatFixture[] = [
  {
    key: 'archived',
    label: 'Archived',
    value: SESSION.archived,
    icon: ArchiveIcon,
    color: 'var(--color-success)',
  },
  {
    key: 'snoozed',
    label: 'Snoozed',
    value: SESSION.snoozed,
    icon: ClockIcon,
    color: 'var(--color-warning)',
  },
  {
    key: 'replied',
    label: 'Replied',
    value: SESSION.replied,
    icon: ReplyIcon,
    color: REPLIED_BLUE,
  },
];

/** Celebration body: medallion, tallies that sum to 32, streak flame. */
function InboxZeroBody() {
  const [isDone, setIsDone] = useState(false);
  return (
    <div style={styles.zeroBody}>
      <span style={styles.zeroMedallion}>
        <Icon icon={SparklesIcon} size="lg" color="inherit" />
      </span>
      <VStack gap={1} hAlign="center">
        <Heading level={2}>Inbox zero</Heading>
        <Text type="supporting" color="secondary">
          All {SESSION.total} emails triaged · {SESSION.date}
        </Text>
      </VStack>
      <div style={styles.statGrid}>
        {ZERO_STATS.map(stat => (
          <div key={stat.key} style={styles.statCell}>
            <span style={{color: stat.color, display: 'inline-flex'}}>
              <Icon icon={stat.icon} size="sm" color="inherit" />
            </span>
            <span style={styles.statValue}>{stat.value}</span>
            <span style={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
      <span style={styles.streakRow}>
        <Icon icon={FlameIcon} size="sm" color="inherit" />
        {SESSION.streak}
      </span>
      <Button
        label={isDone ? 'See you tomorrow' : 'Back to inbox'}
        icon={<Icon icon={InboxIcon} size="sm" color="inherit" />}
        variant="secondary"
        style={styles.zeroCta}
        onClick={() => setIsDone(prev => !prev)}
      />
    </div>
  );
}

// ============= SPECIMENS =============

/** Caption (mono state-id Token + note) over one phone specimen. */
function PhoneSpecimen({
  captionId,
  captionNote,
  children,
}: {
  captionId: string;
  captionNote: string;
  children: ReactNode;
}) {
  return (
    <div style={styles.specimenColumn}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" style={styles.captionRow}>
          {/* flexShrink guard: the fill note would otherwise squeeze the
              Token into an ellipsis inside the 390px column. */}
          <span style={{display: 'inline-flex', flexShrink: 0}}>
            <Token label={captionId} size="sm" color="gray" />
          </span>
          <StackItem size="fill">
            <Text type="supporting" color="secondary" maxLines={1}>
              {captionNote}
            </Text>
          </StackItem>
        </HStack>
        <div style={styles.phone}>{children}</div>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function InboxZeroTriageTemplate() {
  return (
    <div style={styles.stage}>
      <div style={styles.stageHeader}>
        <VStack gap={1} hAlign="center">
          <Heading level={1}>Postlight — swipe triage</Heading>
          <Text type="supporting" color="secondary">
            phone triage stack · mid-swipe + inbox-zero states ·
            deterministic fixtures
          </Text>
        </VStack>
      </div>
      <HStack gap={6} style={styles.specimenRow}>
        <PhoneSpecimen
          captionId="01 · mid-swipe"
          captionNote="Top card past the archive threshold.">
          <PhoneStatusBar />
          <AppHeader triaged={SESSION.triaged} />
          <SwipeLegend />
          <TriageStackScene />
          <UndoPill />
        </PhoneSpecimen>
        <PhoneSpecimen
          captionId="02 · inbox-zero"
          captionNote="Session complete — 18 + 9 + 5 tallies sum to 32.">
          <PhoneStatusBar />
          <AppHeader triaged={SESSION.total} />
          <InboxZeroBody />
        </PhoneSpecimen>
      </HStack>
    </div>
  );
}
