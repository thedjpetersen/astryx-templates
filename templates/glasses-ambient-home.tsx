// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (pairing code A7K29X, pairing URL
 *   relaybot.dev/pair, four pairing states, four home cards with fixed
 *   subtitles — "2 need attention · updated 3m ago" is static copy — and
 *   the footer build chip relay-webapp-v97)
 * @output Smart-glasses ambient home surface: a fixed 600×600 black HUD
 *   stage centered on a token backdrop, switched between two screens by a
 *   page-chrome SegmentedControl. PAIR — brand orb + "Relay" wordmark,
 *   "Visit on your phone or laptop:" chip (relaybot.dev/pair), giant
 *   spaced 48px mono code A 7 K 2 9 X on cyan underline cells, a pulsing
 *   "Waiting for authorization…" status line, a clickable pairing-state
 *   chip row (Waiting / Connecting… / Paired! green / Pairing failed red
 *   with a "Tap to retry" pill), and a corner "Demo" pill. HOME — glowing
 *   breathing brand orb + "Relay", four 88px icon cards (New Conversation,
 *   ✨ Attention needed, Sessions, ⌁ Unpair) where the focused card gets a
 *   cyan border + inset left bar + slight scale, and a relay-webapp-v97
 *   footer version chip. Arrow keys move card focus; clicking a card or a
 *   state chip updates state.
 * @position Page template; emitted by `astryx template glasses-ambient-home`
 *
 * Frame: Layout height="fill". LayoutHeader carries the page chrome
 * (surface title, caption, and the Pair device / Home SegmentedControl).
 * LayoutContent centers the HUD stage on var(--color-background-muted)
 * with a caption row underneath naming the surface, so the template still
 * reads inside light demo chrome.
 *
 * Responsive contract:
 * - The HUD is a fixed 600×600 stage (glasses displays do not reflow).
 *   Below ~648px of content width the stage scales down uniformly via a
 *   ResizeObserver-measured transform (never reflows), so the phone
 *   artboard shows the whole surface.
 * - Header chrome wraps naturally; the SegmentedControl keeps intrinsic
 *   width. No media queries — the demo stage quirk makes them unreliable.
 * - Touch targets inside the HUD are glasses-scale: 88px home cards and a
 *   48px retry pill.
 *
 * Color policy: the stage (styles.stage) is a scheme-locked glasses HUD —
 * real waveguide displays render on black in both themes, so every color
 * painted inside it comes from the fixed GLASS palette (bg #000, accent
 * #64dcff, accent-strong #00f0ff, success #78ff78, warning #f5eb78,
 * attention #ff876e, error #ff7878) as intentional raw literals; do NOT
 * convert them to theme tokens. Everything outside the stage uses Astryx
 * tokens and follows the active color scheme.
 *
 * Fixture policy: fixed strings only — the pairing code is an obvious
 * fake, "updated 3m ago" is static copy, and no value resembles a
 * credential. Animations are CSS keyframes (pulse/breathe), subtle and
 * deterministic; no timers, no randomness.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

// ============= FIXED HUD PALETTE (scheme-locked, see header note) =============

const GLASS = {
  bg: '#000000',
  text: '#f2fbff',
  dim: 'rgba(214, 238, 248, 0.58)',
  faint: 'rgba(214, 238, 248, 0.32)',
  accent: '#64dcff',
  accentStrong: '#00f0ff',
  success: '#78ff78',
  warning: '#f5eb78',
  attention: '#ff876e',
  error: '#ff7878',
  hairline: 'rgba(214, 238, 248, 0.16)',
  cardBg: 'rgba(214, 238, 248, 0.04)',
  focusBg: 'rgba(100, 220, 255, 0.09)',
} as const;

const STAGE_SIZE = 600;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

// Keyframes for the HUD: a slow breathing glow on the brand orb and a
// gentle pulse on "waiting" affordances. Prefixed to avoid collisions.
const HUD_KEYFRAMES = `
@keyframes gahBreathe {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.06); opacity: 1; }
}
@keyframes gahPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Token backdrop that centers the scheme-locked stage.
  backdrop: {
    minHeight: '100%',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-6)',
  },
  measure: {width: '100%', display: 'flex', justifyContent: 'center'},
  stage: {
    width: STAGE_SIZE,
    height: STAGE_SIZE,
    backgroundColor: GLASS.bg,
    color: GLASS.text,
    colorScheme: 'dark',
    fontFamily: MONO,
    border: `1px solid ${GLASS.hairline}`,
    borderRadius: 28,
    position: 'relative',
    overflow: 'hidden',
    transformOrigin: 'top left',
    display: 'flex',
    flexDirection: 'column',
  },
  screen: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    padding: 32,
    outline: 'none',
  },
  cornerPill: {
    position: 'absolute',
    top: 18,
    right: 18,
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: GLASS.dim,
    border: `1px solid ${GLASS.hairline}`,
    borderRadius: 999,
    padding: '4px 12px',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  brandOrbSmall: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: `radial-gradient(circle at 38% 32%, #d9fbff 0%, ${GLASS.accentStrong} 42%, rgba(0, 240, 255, 0.12) 78%, transparent 100%)`,
    boxShadow: '0 0 22px rgba(0, 240, 255, 0.45)',
  },
  brandName: {
    fontSize: 32,
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: GLASS.text,
  },
  pairHint: {fontSize: 14, color: GLASS.dim},
  pairUrlChip: {
    fontSize: 17,
    color: GLASS.accent,
    border: `1px solid ${GLASS.accent}`,
    borderRadius: 999,
    padding: '9px 22px',
    letterSpacing: '0.04em',
  },
  codeRow: {display: 'flex', gap: 14},
  codeChar: {
    fontSize: 48,
    lineHeight: 1.1,
    minWidth: 44,
    textAlign: 'center',
    color: GLASS.text,
    borderBottom: `3px solid ${GLASS.accent}`,
    paddingBottom: 6,
  },
  // Fixed-height slot so switching pairing states never shifts layout.
  statusSlot: {
    minHeight: 88,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  statusLine: {fontSize: 16, letterSpacing: '0.03em'},
  retryPill: {
    fontFamily: MONO,
    fontSize: 14,
    color: GLASS.error,
    backgroundColor: 'transparent',
    border: `1px solid ${GLASS.error}`,
    borderRadius: 999,
    minHeight: 48,
    padding: '0 26px',
    cursor: 'pointer',
  },
  chipRail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  chipRailLabel: {
    fontSize: 10,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: GLASS.faint,
  },
  chipRow: {display: 'flex', gap: 8},
  stateChip: {
    fontFamily: MONO,
    fontSize: 12,
    backgroundColor: 'transparent',
    borderRadius: 999,
    minHeight: 34,
    padding: '0 14px',
    cursor: 'pointer',
  },
  homeOrb: {
    width: 88,
    height: 88,
    borderRadius: '50%',
    background: `radial-gradient(circle at 38% 32%, #d9fbff 0%, ${GLASS.accentStrong} 40%, rgba(0, 240, 255, 0.14) 74%, transparent 100%)`,
    boxShadow: '0 0 64px rgba(0, 240, 255, 0.38)',
    animation: 'gahBreathe 4.5s ease-in-out infinite',
  },
  homeBrand: {
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: GLASS.text,
  },
  cardList: {
    width: 448,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    outline: 'none',
  },
  card: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: 88,
    fontFamily: MONO,
    textAlign: 'left',
    backgroundColor: GLASS.cardBg,
    border: `1px solid ${GLASS.hairline}`,
    borderRadius: 18,
    padding: '0 20px 0 0',
    cursor: 'pointer',
    color: GLASS.text,
    transition: 'transform 150ms ease, border-color 150ms ease, background-color 150ms ease',
  },
  cardFocused: {
    borderColor: GLASS.accent,
    backgroundColor: GLASS.focusBg,
    transform: 'scale(1.03)',
    boxShadow: '0 0 26px rgba(100, 220, 255, 0.16)',
  },
  cardInsetBar: {
    position: 'absolute',
    left: 8,
    top: 16,
    bottom: 16,
    width: 4,
    borderRadius: 2,
    backgroundColor: GLASS.accentStrong,
  },
  cardIconCol: {
    width: 58,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    lineHeight: 1,
  },
  cardTitle: {fontSize: 19, color: GLASS.text},
  cardSubtitle: {fontSize: 13, color: GLASS.dim, marginTop: 4},
  versionChip: {
    fontSize: 11,
    color: GLASS.dim,
    border: `1px solid ${GLASS.hairline}`,
    borderRadius: 999,
    padding: '4px 14px',
    letterSpacing: '0.06em',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed strings, no clocks, no randomness.

const PAIR_CODE = ['A', '7', 'K', '2', '9', 'X'];
const PAIR_URL = 'relaybot.dev/pair';
const VERSION_CHIP = 'relay-webapp-v97';

type PairState = 'waiting' | 'connecting' | 'paired' | 'failed';

const PAIR_STATE_CHIPS: ReadonlyArray<{
  id: PairState;
  label: string;
  color: string;
}> = [
  {id: 'waiting', label: 'Waiting…', color: GLASS.accent},
  {id: 'connecting', label: 'Connecting…', color: GLASS.warning},
  {id: 'paired', label: 'Paired!', color: GLASS.success},
  {id: 'failed', label: 'Pairing failed', color: GLASS.error},
];

const PAIR_STATUS: Record<
  PairState,
  {text: string; color: string; isPulsing: boolean}
> = {
  waiting: {
    text: 'Waiting for authorization…',
    color: GLASS.accent,
    isPulsing: true,
  },
  connecting: {text: 'Connecting…', color: GLASS.warning, isPulsing: true},
  paired: {text: '✓ Paired!', color: GLASS.success, isPulsing: false},
  failed: {text: '✗ Pairing failed', color: GLASS.error, isPulsing: false},
};

interface HomeCard {
  id: string;
  glyph: string;
  glyphColor: string;
  title: string;
  subtitleStrong?: string;
  subtitleStrongColor?: string;
  subtitle: string;
}

const HOME_CARDS: HomeCard[] = [
  {
    id: 'new',
    glyph: '＋',
    glyphColor: GLASS.accentStrong,
    title: 'New Conversation',
    subtitle: 'Ask Relay now',
  },
  {
    id: 'attention',
    glyph: '✨',
    glyphColor: GLASS.warning,
    title: 'Attention needed',
    subtitleStrong: '2 need attention',
    subtitleStrongColor: GLASS.warning,
    subtitle: ' · updated 3m ago',
  },
  {
    id: 'sessions',
    glyph: '▤',
    glyphColor: GLASS.accent,
    title: 'Sessions',
    subtitle: 'Browse all sessions',
  },
  {
    id: 'unpair',
    glyph: '⌁',
    glyphColor: GLASS.attention,
    title: 'Unpair',
    subtitle: 'Disconnect this device',
  },
];

// ============= RESPONSIVE HELPER =============
// The demo renders pages in an inline stage narrower than the viewport,
// so media queries never fire there; measure our own width instead.

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

// ============= PAIR SCREEN =============

function PairScreen({
  pairState,
  onSelectState,
}: {
  pairState: PairState;
  onSelectState: (state: PairState) => void;
}) {
  const status = PAIR_STATUS[pairState];
  return (
    <div style={styles.screen}>
      <div style={styles.cornerPill}>Demo</div>

      <div style={styles.brandRow}>
        <div style={styles.brandOrbSmall} aria-hidden />
        <h1 style={{...styles.brandName, margin: 0}}>Relay</h1>
      </div>

      <div style={styles.pairHint}>Visit on your phone or laptop:</div>
      <div style={styles.pairUrlChip}>{PAIR_URL}</div>

      <div style={styles.pairHint}>Enter code:</div>
      <div style={styles.codeRow} aria-label={`Pairing code ${PAIR_CODE.join('')}`}>
        {PAIR_CODE.map((char, index) => (
          <span key={`${char}-${index}`} style={styles.codeChar}>
            {char}
          </span>
        ))}
      </div>

      <div style={styles.statusSlot} role="status">
        <span
          style={{
            ...styles.statusLine,
            color: status.color,
            animation: status.isPulsing
              ? 'gahPulse 2s ease-in-out infinite'
              : undefined,
          }}>
          {status.text}
        </span>
        {pairState === 'failed' && (
          <button
            type="button"
            style={styles.retryPill}
            onClick={() => onSelectState('waiting')}>
            Tap to retry
          </button>
        )}
      </div>

      <div style={styles.chipRail}>
        <span style={styles.chipRailLabel}>Pairing states</span>
        <div style={styles.chipRow} role="group" aria-label="Pairing state demo">
          {PAIR_STATE_CHIPS.map(chip => {
            const isSelected = chip.id === pairState;
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={isSelected}
                style={{
                  ...styles.stateChip,
                  color: isSelected ? chip.color : GLASS.dim,
                  border: `1px solid ${isSelected ? chip.color : GLASS.hairline}`,
                  backgroundColor: isSelected
                    ? 'rgba(214, 238, 248, 0.05)'
                    : 'transparent',
                }}
                onClick={() => onSelectState(chip.id)}>
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============= HOME SCREEN =============

function HomeScreen({
  focusedIndex,
  onFocusIndex,
}: {
  focusedIndex: number;
  onFocusIndex: (index: number) => void;
}) {
  // Arrow keys move the glasses "gaze focus" through the card stack.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      onFocusIndex((focusedIndex + 1) % HOME_CARDS.length);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      onFocusIndex((focusedIndex + HOME_CARDS.length - 1) % HOME_CARDS.length);
    }
  };

  return (
    <div style={{...styles.screen, gap: 18}}>
      <div style={styles.homeOrb} aria-hidden />
      <div style={styles.homeBrand}>Relay</div>

      <div
        style={styles.cardList}
        role="group"
        aria-label="Home actions — arrow keys move focus"
        tabIndex={0}
        onKeyDown={handleKeyDown}>
        {HOME_CARDS.map((card, index) => {
          const isFocused = index === focusedIndex;
          return (
            <button
              key={card.id}
              type="button"
              aria-pressed={isFocused}
              style={{
                ...styles.card,
                ...(isFocused ? styles.cardFocused : null),
              }}
              onClick={() => onFocusIndex(index)}>
              {isFocused && <span style={styles.cardInsetBar} aria-hidden />}
              <span
                style={{...styles.cardIconCol, color: card.glyphColor}}
                aria-hidden>
                {card.glyph}
              </span>
              <span>
                <span style={{...styles.cardTitle, display: 'block'}}>
                  {card.title}
                </span>
                <span style={{...styles.cardSubtitle, display: 'block'}}>
                  {card.subtitleStrong != null && (
                    <span style={{color: card.subtitleStrongColor}}>
                      {card.subtitleStrong}
                    </span>
                  )}
                  {card.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div style={styles.versionChip}>{VERSION_CHIP}</div>
    </div>
  );
}

// ============= PAGE =============

export default function GlassesAmbientHomeTemplate() {
  const [screen, setScreen] = useState('home');
  const [pairState, setPairState] = useState<PairState>('waiting');
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Scale the fixed 600×600 stage down uniformly when the content column
  // is narrower than the stage (e.g. the 390px phone artboard).
  const measureRef = useRef<HTMLDivElement | null>(null);
  const measuredWidth = useElementWidth(measureRef);
  const scale =
    measuredWidth > 0 && measuredWidth < STAGE_SIZE
      ? measuredWidth / STAGE_SIZE
      : 1;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Relay on Glasses</Heading>
                <Text type="supporting" color="secondary">
                  Ambient HUD preview — pairing and home screens
                </Text>
              </VStack>
            </StackItem>
            <SegmentedControl
              label="HUD screen"
              size="sm"
              value={screen}
              onChange={setScreen}>
              <SegmentedControlItem value="pair" label="Pair device" />
              <SegmentedControlItem value="home" label="Home" />
            </SegmentedControl>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <style>{HUD_KEYFRAMES}</style>
          <div style={styles.backdrop}>
            <div ref={measureRef} style={styles.measure}>
              <div
                style={{
                  width: STAGE_SIZE * scale,
                  height: STAGE_SIZE * scale,
                }}>
                <div
                  style={{
                    ...styles.stage,
                    transform: scale < 1 ? `scale(${scale})` : undefined,
                  }}>
                  {screen === 'pair' ? (
                    <PairScreen
                      pairState={pairState}
                      onSelectState={setPairState}
                    />
                  ) : (
                    <HomeScreen
                      focusedIndex={focusedIndex}
                      onFocusIndex={setFocusedIndex}
                    />
                  )}
                </div>
              </div>
            </div>
            <Text type="supporting" color="secondary">
              {screen === 'pair'
                ? 'Smart-glasses HUD · pairing screen · fixed 600×600 stage'
                : 'Smart-glasses HUD · ambient home · arrow keys move card focus'}
            </Text>
          </div>
        </LayoutContent>
      }
    />
  );
}
