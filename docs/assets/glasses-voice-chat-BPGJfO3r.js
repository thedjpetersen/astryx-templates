var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a "deploy triage" voice-session
 *   transcript between You and the Relay agent with fixed HH:MM stamps,
 *   one bash tool-result row pinned to node "laptop", a frozen live
 *   transcript string, and mono session metadata \`atlas · a1b2c3d4\`)
 * @output 600×600 smart-glasses HUD voice chat, scheme-locked black in
 *   both themes: 52px header (session title, mono workspace/session meta,
 *   mic-state chip that tracks the record orb), a scrolling message log
 *   with top/bottom fade gradients, cyan-labeled You cards vs Relay
 *   cards, the latest turn highlighted (cyan border + inset bar + slight
 *   scale), one green-inset bash tool chip row, and an "↑ load older
 *   messages" notice; a 96px glass record bar whose glowing orb cycles
 *   idle → listening (pulse rings + live transcript) → sending on tap,
 *   with a camera attach button and a removable pending-photo thumb;
 *   plus a toggleable full-screen capture overlay (blurred scrim, 154px
 *   orb with expanding rings, tracked LISTENING, live-caption box) and
 *   HUD toast specimens ("Photo attached", "Top of conversation")
 * @position Page template; emitted by \`astryx template glasses-voice-chat\`
 *
 * Frame: Layout height="fill". LayoutContent centers the fixed 600×600
 * HUD stage on the token backdrop (var(--color-background-muted)) under a
 * slim page-chrome row (Heading + capture-overlay toggle Button) with a
 * caption row naming the surface below the stage.
 *
 * Responsive contract:
 * - The stage is a fixed 600×600 artboard (real glasses render at one
 *   size); page chrome and captions reflow normally around it.
 * - Below ~632px of measured page width (useElementWidth — the demo's
 *   inline stage never fires viewport media queries) the whole stage
 *   scales down uniformly via transform so the phone artboard shows the
 *   entire HUD; the wrapper height tracks the scaled height.
 * - Glasses touch targets stay large: 72px record orb, 56px round attach
 *   button, 44px photo thumb.
 *
 * Color policy: the HUD stage is a scheme-locked black surface (real
 * glasses HUDs are dark in both themes) — every color painted inside it
 * comes from the fixed GLASS palette (raw literals, colorScheme pinned to
 * 'dark'); do NOT convert them to theme tokens. Everything outside the
 * stage (page chrome, captions) uses Astryx tokens.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {
  CameraIcon,
  ImageIcon,
  MicIcon,
  TerminalIcon,
} from 'lucide-react';

// ============= GLASSES PALETTE =============
// Scheme-locked HUD surface: fixed dark palette in both themes.

const GLASS = {
  bg: '#000000',
  base: '#eaf6ff',
  dim: 'rgba(230, 244, 255, 0.55)',
  faint: 'rgba(230, 244, 255, 0.32)',
  accent: '#64dcff',
  accentStrong: '#00f0ff',
  success: '#78ff78',
  warning: '#f5eb78',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(100, 220, 255, 0.16)',
  hairline: 'rgba(100, 220, 255, 0.14)',
} as const;

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

const STAGE_SIZE = 600;
const HEADER_HEIGHT = 52;
const RECORD_BAR_HEIGHT = 96;

// Subtle, deterministic keyframes for the record orb (breathe glow) and
// the listening pulse rings; gvc- prefix avoids cross-template collisions.
const HUD_KEYFRAMES = \`
@keyframes gvc-breathe {
  0%, 100% { box-shadow: 0 0 16px rgba(0, 240, 255, 0.25); }
  50% { box-shadow: 0 0 32px rgba(0, 240, 255, 0.5); }
}
@keyframes gvc-pulse-ring {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(2.1); opacity: 0; }
}
@keyframes gvc-soft-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  chromeRow: {paddingBottom: 'var(--spacing-4)'},
  stageCenter: {display: 'flex', justifyContent: 'center'},
  stageScaleBox: {transformOrigin: 'top center'},
  // The fixed 600×600 scheme-locked HUD artboard.
  stage: {
    position: 'relative',
    width: STAGE_SIZE,
    height: STAGE_SIZE,
    colorScheme: 'dark',
    backgroundColor: GLASS.bg,
    border: \`1px solid \${GLASS.cardBorder}\`,
    borderRadius: 28,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: MONO_FONT,
    color: GLASS.base,
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
  },
  caption: {paddingTop: 'var(--spacing-3)', textAlign: 'center'},
  // --- Header (52px) ---
  header: {
    height: HEADER_HEIGHT,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 18,
    borderBottom: \`1px solid \${GLASS.hairline}\`,
  },
  headerTitle: {fontSize: 15, fontWeight: 600, letterSpacing: 0.2},
  headerMeta: {fontSize: 11, color: GLASS.dim},
  micChip: {
    marginLeft: 'auto',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    borderRadius: 999,
    padding: '4px 12px',
    border: '1px solid',
  },
  // --- Message log ---
  logWrap: {position: 'relative', flex: 1, minHeight: 0},
  log: {
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '18px 18px 26px',
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    background: 'linear-gradient(180deg, #000000, rgba(0, 0, 0, 0))',
    pointerEvents: 'none',
    zIndex: 2,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    background: 'linear-gradient(0deg, #000000, rgba(0, 0, 0, 0))',
    pointerEvents: 'none',
    zIndex: 2,
  },
  loadOlder: {
    alignSelf: 'center',
    background: 'none',
    border: 'none',
    color: GLASS.faint,
    fontFamily: MONO_FONT,
    fontSize: 11,
    letterSpacing: 0.6,
    cursor: 'pointer',
    padding: '6px 12px',
  },
  messageCard: {
    backgroundColor: GLASS.cardBg,
    border: \`1px solid \${GLASS.cardBorder}\`,
    borderRadius: 14,
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  // Latest turn: focused-card treatment (cyan border + inset bar + scale).
  messageCardLatest: {
    borderColor: GLASS.accent,
    boxShadow: \`inset 3px 0 0 \${GLASS.accent}, 0 0 18px rgba(100, 220, 255, 0.12)\`,
    transform: 'scale(1.01)',
  },
  messageLabelRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
  },
  messageLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: 700,
  },
  messageTime: {marginLeft: 'auto', fontSize: 10, color: GLASS.faint},
  messageText: {fontSize: 14, lineHeight: 1.55},
  // Tool chip row: green left inset bar; single compact line.
  toolRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GLASS.cardBg,
    border: \`1px solid \${GLASS.cardBorder}\`,
    borderRadius: 12,
    boxShadow: \`inset 3px 0 0 \${GLASS.success}\`,
    padding: '8px 12px 8px 14px',
    fontSize: 12,
  },
  toolIconWrap: {display: 'inline-flex', color: GLASS.accent},
  toolName: {fontWeight: 700},
  toolCommand: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: GLASS.dim,
    fontSize: 11,
  },
  nodePill: {
    fontSize: 10,
    color: GLASS.accent,
    border: \`1px solid \${GLASS.accent}\`,
    borderRadius: 999,
    padding: '1px 8px',
    flexShrink: 0,
  },
  toolPhase: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: GLASS.dim,
    flexShrink: 0,
  },
  toolCheck: {color: GLASS.success, fontSize: 13, flexShrink: 0},
  // --- Record bar (96px glass) ---
  recordBar: {
    height: RECORD_BAR_HEIGHT,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    paddingInline: 16,
    borderTop: \`1px solid \${GLASS.hairline}\`,
    background:
      'linear-gradient(180deg, rgba(100, 220, 255, 0.06), rgba(100, 220, 255, 0.02))',
  },
  orbWrap: {position: 'relative', width: 72, height: 72, flexShrink: 0},
  orbButton: {
    position: 'relative',
    zIndex: 1,
    width: 72,
    height: 72,
    borderRadius: '50%',
    border: '1px solid rgba(0, 240, 255, 0.45)',
    background:
      'radial-gradient(circle at 35% 30%, rgba(100, 220, 255, 0.9), rgba(0, 122, 160, 0.9) 58%, rgba(0, 34, 48, 0.96))',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#02222e',
    animation: 'gvc-breathe 3.2s ease-in-out infinite',
    padding: 0,
  },
  orbButtonSending: {
    background:
      'radial-gradient(circle at 35% 30%, rgba(245, 235, 120, 0.85), rgba(150, 130, 30, 0.85) 58%, rgba(48, 40, 0, 0.96))',
    borderColor: 'rgba(245, 235, 120, 0.5)',
    animation: 'gvc-soft-blink 1.4s ease-in-out infinite',
  },
  pulseRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: \`2px solid \${GLASS.accentStrong}\`,
    animation: 'gvc-pulse-ring 2.2s ease-out infinite',
    pointerEvents: 'none',
  },
  pulseRingLate: {animationDelay: '1.1s'},
  recordLabels: {flex: 1, minWidth: 0},
  recordTitle: {fontSize: 16, fontWeight: 700, letterSpacing: 0.2},
  recordSub: {fontSize: 11, color: GLASS.dim},
  liveTranscript: {
    fontSize: 12,
    fontStyle: 'italic',
    color: GLASS.accent,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  attachButton: {
    width: 56,
    height: 56,
    flexShrink: 0,
    borderRadius: '50%',
    border: \`1px solid \${GLASS.cardBorder}\`,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: GLASS.accent,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  photoThumb: {
    position: 'relative',
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 10,
    border: \`1px solid \${GLASS.accent}\`,
    backgroundColor: 'rgba(100, 220, 255, 0.08)',
    color: GLASS.accent,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  photoThumbX: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: GLASS.accent,
    color: '#02222e',
    fontSize: 10,
    lineHeight: '16px',
    textAlign: 'center',
    fontWeight: 700,
  },
  // --- Toast (HUD specimen) ---
  toast: {
    position: 'absolute',
    bottom: RECORD_BAR_HEIGHT + 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 4,
    backgroundColor: 'rgba(8, 22, 28, 0.92)',
    border: \`1px solid \${GLASS.accent}\`,
    borderRadius: 999,
    padding: '8px 18px',
    fontSize: 12,
    color: GLASS.base,
    whiteSpace: 'nowrap',
    boxShadow: '0 0 18px rgba(0, 240, 255, 0.18)',
  },
  // --- Full-screen capture overlay ---
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 6,
    border: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
    cursor: 'pointer',
    fontFamily: MONO_FONT,
    color: GLASS.base,
    padding: 32,
  },
  overlayOrbWrap: {position: 'relative', width: 154, height: 154},
  overlayOrb: {
    position: 'relative',
    zIndex: 1,
    width: 154,
    height: 154,
    borderRadius: '50%',
    border: '1px solid rgba(0, 240, 255, 0.5)',
    background:
      'radial-gradient(circle at 35% 30%, rgba(100, 220, 255, 0.95), rgba(0, 122, 160, 0.92) 58%, rgba(0, 34, 48, 0.96))',
    boxShadow: '0 0 44px rgba(0, 240, 255, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#02222e',
  },
  overlayListening: {
    fontSize: 15,
    letterSpacing: 6,
    textTransform: 'uppercase',
    color: GLASS.accentStrong,
    fontWeight: 700,
  },
  overlayCaptionBox: {
    maxWidth: 420,
    backgroundColor: 'rgba(8, 22, 28, 0.85)',
    border: \`1px solid \${GLASS.cardBorder}\`,
    borderRadius: 14,
    padding: '12px 18px',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 1.6,
    color: GLASS.base,
    textAlign: 'center',
  },
  overlayHint: {fontSize: 10, letterSpacing: 1.2, color: GLASS.faint},
};

// ============= DATA =============
// Deterministic fixtures: fixed HH:MM stamps, frozen transcript, no clocks.

const SESSION_TITLE = 'deploy triage';
const SESSION_META = 'atlas · a1b2c3d4';

type LogEntry =
  | {kind: 'message'; id: string; sender: 'you' | 'relay'; time: string; text: string}
  | {
      kind: 'tool';
      id: string;
      name: string;
      command: string;
      node: string;
      phase: string;
    };

const LOG_ENTRIES: LogEntry[] = [
  {
    kind: 'message',
    id: 'm1',
    sender: 'you',
    time: '14:02',
    text: "Relay, what's the status of the payments deploy? The pager just went off.",
  },
  {
    kind: 'message',
    id: 'm2',
    sender: 'relay',
    time: '14:02',
    text: 'Canary for payments-api v2026.7.11 is at 25 percent. Error rate climbed to 3.1 percent over the last five minutes — above the 2 percent gate.',
  },
  {
    kind: 'tool',
    id: 't1',
    name: 'bash',
    command: 'kubectl rollout status deploy/payments-api',
    node: 'laptop',
    phase: 'RESULT',
  },
  {
    kind: 'message',
    id: 'm3',
    sender: 'relay',
    time: '14:03',
    text: 'Rollout is paused at 25 percent — nothing has promoted past the canary pool.',
  },
  {
    kind: 'message',
    id: 'm4',
    sender: 'you',
    time: '14:04',
    text: 'Hold the rollout and page whoever owns the checkout retries change.',
  },
  {
    kind: 'message',
    id: 'm5',
    sender: 'relay',
    time: '14:05',
    text: 'Done — rollout held, and I paged mchen for change #4821. Want me to draft the incident note?',
  },
  {
    kind: 'message',
    id: 'm6',
    sender: 'you',
    time: '14:06',
    text: 'Yes, draft it, and roll back the canary if the error rate stays above two percent.',
  },
];

// The latest voice turn gets the focused-card treatment; the fixture is
// constant, so resolve it once at module level.
const LAST_MESSAGE_ID = [...LOG_ENTRIES]
  .reverse()
  .find(entry => entry.kind === 'message')?.id;

const LIVE_TRANSCRIPT =
  '…and post the incident note to the deploys channel once the rollback finishes';

type RecordState = 'idle' | 'listening' | 'sending';

const RECORD_COPY: Record<RecordState, {title: string; sub: string}> = {
  idle: {title: 'Record', sub: 'Tap to speak'},
  listening: {title: 'Listening…', sub: 'tap to stop'},
  sending: {title: 'Sending…', sub: 'transcribing 6s clip'},
};

const NEXT_RECORD_STATE: Record<RecordState, RecordState> = {
  idle: 'listening',
  listening: 'sending',
  sending: 'idle',
};

const MIC_CHIP: Record<RecordState, {label: string; color: string}> = {
  idle: {label: 'standby', color: GLASS.dim},
  listening: {label: 'listening', color: GLASS.accent},
  sending: {label: 'sending', color: GLASS.warning},
};

// ============= RESPONSIVE HELPER =============
// The demo's inline stage never fires viewport media queries; measure the
// page's own width and scale the fixed artboard down when it can't fit.

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

// ============= HUD PIECES =============

function MessageCard({
  entry,
  isLatest,
}: {
  entry: Extract<LogEntry, {kind: 'message'}>;
  isLatest: boolean;
}) {
  const isYou = entry.sender === 'you';
  return (
    <div
      style={{
        ...styles.messageCard,
        ...(isLatest ? styles.messageCardLatest : undefined),
      }}>
      <div style={styles.messageLabelRow}>
        <span
          style={{
            ...styles.messageLabel,
            color: isYou ? GLASS.accent : GLASS.dim,
          }}>
          {isYou ? 'You' : 'Relay'}
        </span>
        <span style={styles.messageTime}>{entry.time}</span>
      </div>
      <span style={styles.messageText}>{entry.text}</span>
    </div>
  );
}

function ToolChipRow({entry}: {entry: Extract<LogEntry, {kind: 'tool'}>}) {
  return (
    <div style={styles.toolRow}>
      <span style={styles.toolIconWrap}>
        <Icon icon={TerminalIcon} size="sm" color="inherit" />
      </span>
      <span style={styles.toolName}>{entry.name}</span>
      <span style={styles.toolCommand}>{entry.command}</span>
      <span style={styles.nodePill}>{entry.node}</span>
      <span style={styles.toolPhase}>{entry.phase}</span>
      <span style={styles.toolCheck} aria-label="Tool call succeeded">
        ✓
      </span>
    </div>
  );
}

// ============= PAGE =============

export default function GlassesVoiceChatTemplate() {
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [hasPendingPhoto, setHasPendingPhoto] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [toast, setToast] = useState<{seq: number; text: string} | null>(null);
  const [toastSeq, setToastSeq] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const scale =
    wrapWidth > 0 ? Math.min(1, Math.max(0.5, (wrapWidth - 16) / STAGE_SIZE)) : 1;

  // HUD toasts auto-dismiss; keyed on seq so re-firing restarts the timer.
  useEffect(() => {
    if (toast == null) {
      return undefined;
    }
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const fireToast = (text: string) => {
    setToast({seq: toastSeq, text});
    setToastSeq(prev => prev + 1);
  };

  const attachPhoto = () => {
    setHasPendingPhoto(true);
    fireToast('Photo attached');
  };

  const micChip = MIC_CHIP[recordState];
  const recordCopy = RECORD_COPY[recordState];

  const orbLabel =
    recordState === 'idle'
      ? 'Record — tap to speak'
      : recordState === 'listening'
        ? 'Listening — tap to stop'
        : 'Sending — tap to reset';

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent>
          <div ref={wrapRef}>
            {/* Page chrome: normal token-based surface around the HUD. */}
            <HStack gap={3} vAlign="center" style={styles.chromeRow}>
              <StackItem size="fill">
                <VStack gap={0}>
                  <Heading level={1}>Glasses voice chat</Heading>
                  <Text type="supporting" color="secondary">
                    Hands-free agent session rendered on a smart-glasses HUD
                  </Text>
                </VStack>
              </StackItem>
              <Button
                label={
                  isOverlayOpen ? 'Hide capture overlay' : 'Show capture overlay'
                }
                variant="secondary"
                size="sm"
                onClick={() => setIsOverlayOpen(prev => !prev)}
              />
            </HStack>

            <div style={styles.stageCenter}>
              <div
                style={{
                  ...styles.stageScaleBox,
                  height: STAGE_SIZE * scale,
                  transform: scale < 1 ? \`scale(\${scale})\` : undefined,
                }}>
                <div style={styles.stage}>
                  <style>{HUD_KEYFRAMES}</style>

                  {/* 52px header */}
                  <div style={styles.header}>
                    <span style={styles.headerTitle}>{SESSION_TITLE}</span>
                    <span style={styles.headerMeta}>{SESSION_META}</span>
                    <span
                      style={{
                        ...styles.micChip,
                        color: micChip.color,
                        borderColor: micChip.color,
                      }}>
                      {micChip.label}
                    </span>
                  </div>

                  {/* Scrolling log with fade gradients */}
                  <div style={styles.logWrap}>
                    <div style={styles.fadeTop} aria-hidden />
                    <div style={styles.fadeBottom} aria-hidden />
                    <div style={styles.log} aria-label="Voice conversation log">
                      <button
                        type="button"
                        style={styles.loadOlder}
                        onClick={() => fireToast('Top of conversation')}>
                        ↑ load older messages
                      </button>
                      {LOG_ENTRIES.map(entry =>
                        entry.kind === 'message' ? (
                          <MessageCard
                            key={entry.id}
                            entry={entry}
                            isLatest={entry.id === LAST_MESSAGE_ID}
                          />
                        ) : (
                          <ToolChipRow key={entry.id} entry={entry} />
                        ),
                      )}
                    </div>
                  </div>

                  {/* HUD toast specimen */}
                  {toast != null && (
                    <div style={styles.toast} role="status">
                      {toast.text}
                    </div>
                  )}

                  {/* 96px glass record bar */}
                  <div style={styles.recordBar}>
                    <div style={styles.orbWrap}>
                      {recordState === 'listening' && (
                        <>
                          <span style={styles.pulseRing} aria-hidden />
                          <span
                            style={{...styles.pulseRing, ...styles.pulseRingLate}}
                            aria-hidden
                          />
                        </>
                      )}
                      <button
                        type="button"
                        aria-label={orbLabel}
                        style={{
                          ...styles.orbButton,
                          ...(recordState === 'sending'
                            ? styles.orbButtonSending
                            : undefined),
                        }}
                        onClick={() =>
                          setRecordState(prev => NEXT_RECORD_STATE[prev])
                        }>
                        <Icon icon={MicIcon} size="md" color="inherit" />
                      </button>
                    </div>
                    <div style={styles.recordLabels}>
                      <div style={styles.recordTitle}>{recordCopy.title}</div>
                      <div style={styles.recordSub}>{recordCopy.sub}</div>
                      {recordState === 'listening' && (
                        <div style={styles.liveTranscript}>{LIVE_TRANSCRIPT}</div>
                      )}
                    </div>
                    {hasPendingPhoto && (
                      <button
                        type="button"
                        aria-label="Remove pending photo"
                        style={styles.photoThumb}
                        onClick={() => setHasPendingPhoto(false)}>
                        <Icon icon={ImageIcon} size="sm" color="inherit" />
                        <span style={styles.photoThumbX} aria-hidden>
                          ✕
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Attach a photo from the glasses camera"
                      style={styles.attachButton}
                      onClick={attachPhoto}>
                      <Icon icon={CameraIcon} size="md" color="inherit" />
                    </button>
                  </div>

                  {/* Full-screen capture overlay (toggled from page chrome;
                      tapping anywhere dismisses it). */}
                  {isOverlayOpen && (
                    <button
                      type="button"
                      aria-label="Dismiss capture overlay"
                      style={styles.overlay}
                      onClick={() => setIsOverlayOpen(false)}>
                      <span style={styles.overlayOrbWrap}>
                        <span style={styles.pulseRing} aria-hidden />
                        <span
                          style={{...styles.pulseRing, ...styles.pulseRingLate}}
                          aria-hidden
                        />
                        <span style={styles.overlayOrb}>
                          <Icon icon={MicIcon} size="lg" color="inherit" />
                        </span>
                      </span>
                      <span style={styles.overlayListening}>Listening</span>
                      <span style={styles.overlayCaptionBox}>
                        {LIVE_TRANSCRIPT}
                      </span>
                      <span style={styles.overlayHint}>TAP ANYWHERE TO CLOSE</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.caption}>
              <Text type="supporting" color="secondary">
                Smart-glasses HUD · Relay voice session · 600×600 stage
              </Text>
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};