// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a 12-frame remote-browser session for
 *   an agent's checkout-flow run: per-frame action kind, status, fixed ISO
 *   capture times, and which frames produced fresh screenshots)
 * @output Timeline playback surface for an agent's remote-browser session:
 *   a centered column of Collapsible dock Cards, each with a compact trigger
 *   header (browser icon, bold "Browser" label, truncated last-action status
 *   text, a frame-counter Badge, and a trailing state icon — Spinner while
 *   pending, error StatusDot on failure, success check otherwise) and an
 *   expanded body with a media-transport Toolbar (skip-back / play /
 *   skip-forward IconButtons with disabled end states, a "Live" ToggleButton)
 *   above a 16:9 AspectRatio screenshot frame; the page shows collapsed,
 *   live-pending (frame ringed as in-flight), and history-scrub variants,
 *   plus a "Frames" step list of all 12 actions with per-action StatusDots
 * @position Page template; emitted by `astryx template browser-session-replay`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (session
 * title, run-status Badge, session id, started Timestamp). LayoutContent
 * hosts a single centered column (maxWidth 896) — a vertical stack of three
 * dock Cards (collapsed / live / history, with history expanded by default)
 * followed by the "Frames" step list Card. Screenshot slots are neutral
 * AspectRatio 16:9 panels with centered placeholder text; no image assets.
 * The only template with transport/scrubber controls — choose it for
 * frame-by-frame playback of captured steps; choose ai-chat-tool-stream when
 * the story is tool call cards, not what the browser saw.
 *
 * Responsive contract:
 * - Column: maxWidth 896, centered; goes full-width below 768px.
 * - >768px: header shows session id and started Timestamp; dock triggers
 *   keep the capture-time Timestamp column.
 * - <=768px: header drops session id + Timestamp (Badge stays); dock
 *   triggers drop the capture time and keep the truncated action text;
 *   step list rows wrap action text instead of truncating.
 * - Transport IconButtons are size "sm" (28px hit targets) at every width;
 *   the frame counter keeps tabular numbers so scrubbing never jitters.
 */

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type SVGProps,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {List, ListItem} from '@astryxdesign/core/List';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= GLYPHS =============
// Local heroicons-style SVG glyphs (24px grid, stroked, currentColor) for
// the transport and browser-action icons; keeps the template self-contained
// with no image assets. The success check uses the core semantic registry.

type GlyphProps = SVGProps<SVGSVGElement>;

function glyph(paths: ReactNode) {
  function GlyphIcon(props: GlyphProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}>
        {paths}
      </svg>
    );
  }
  return GlyphIcon;
}

const BrowserWindowGlyph = glyph(
  <>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <path d="M3 8.5h18" />
    <path d="M6 6.6h.01M8.4 6.6h.01" />
  </>,
);

const GlobeGlyph = glyph(
  <>
    <circle cx="12" cy="12" r="8.25" />
    <path d="M3.75 12h16.5" />
    <path d="M12 3.75c2.4 2.5 2.4 14 0 16.5c-2.4-2.5-2.4-14 0-16.5z" />
  </>,
);

const CameraGlyph = glyph(
  <>
    <rect x="3.5" y="7.5" width="17" height="11.5" rx="2" />
    <path d="M9 7.5l1.3-2.2h3.4L15 7.5" />
    <circle cx="12" cy="13" r="3" />
  </>,
);

const CursorClickGlyph = glyph(
  <>
    <path d="M9 9l10 3.7-4.3 1.6L13.1 19z" />
    <path d="M4.5 4.5l1.8 1.8M9.75 3.25v2.1M3.25 9.75h2.1" />
  </>,
);

const PencilGlyph = glyph(
  <path d="M4 20l1.3-3.9L16.6 4.8a1.9 1.9 0 0 1 2.7 2.7L8 18.8 4 20z" />,
);

const DocumentGlyph = glyph(
  <>
    <rect x="5.5" y="3.5" width="13" height="17" rx="1.5" />
    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
  </>,
);

const PlayGlyph = glyph(<path d="M8 5.5v13l10-6.5z" />);

const PauseGlyph = glyph(<path d="M8.5 5.5v13M15.5 5.5v13" />);

const SkipBackGlyph = glyph(
  <>
    <path d="M6.5 5.5v13" />
    <path d="M18 5.5L9.5 12l8.5 6.5z" />
  </>,
);

const SkipForwardGlyph = glyph(
  <>
    <path d="M17.5 5.5v13" />
    <path d="M6 5.5l8.5 6.5L6 18.5z" />
  </>,
);

const LiveSignalGlyph = glyph(
  <>
    <circle cx="12" cy="12" r="1.4" />
    <path d="M8.7 15.3a4.7 4.7 0 0 1 0-6.6M15.3 8.7a4.7 4.7 0 0 1 0 6.6" />
    <path d="M6.2 17.8a8.2 8.2 0 0 1 0-11.6M17.8 6.2a8.2 8.2 0 0 1 0 11.6" />
  </>,
);

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered replay column; full-width below 768px via maxWidth + auto
  // margins (the column simply stops centering once the viewport is
  // narrower than the cap).
  column: {
    width: '100%',
    maxWidth: 896,
    marginInline: 'auto',
  },
  triggerText: {minWidth: 0},
  // Neutral screenshot slot: the AspectRatio child fills the panel and
  // centers its placeholder caption.
  screenshotWrap: {
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
  },
  // Border tint by top-frame state (navi browser-screen-dock behavior):
  // pending frames ring blue, failed frames ring destructive.
  screenshotWrapPending: {
    border: '2px solid var(--color-accent)',
    boxShadow: '0 0 0 3px var(--color-accent-muted)',
  },
  screenshotWrapError: {
    border: '2px solid var(--color-error)',
  },
  screenshotPanel: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-4)',
    textAlign: 'center',
  },
  transportCounter: {whiteSpace: 'nowrap'},
  scrubHint: {flexWrap: 'wrap'},
  stepIndex: {width: 20, textAlign: 'right'},
};

// ============= DATA =============
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const SESSION_TITLE = 'Checkout flow — vercel.com';
const SESSION_ID = 'sess_9k3d1x';
const SESSION_STARTED_AT = '2026-07-01T09:41:12';
const PLAYBACK_NOTE = '900ms per frame';

type FrameKind = 'navigate' | 'screenshot' | 'click' | 'type' | 'read';
type FrameStatus = 'success' | 'error' | 'pending';

interface SessionFrame {
  index: number; // 1-based frame number
  kind: FrameKind;
  action: string;
  status: FrameStatus;
  at: string; // fixed ISO capture time
  /** Set when this frame produced a fresh screenshot. */
  capture?: string;
}

const FRAME_KIND_ICON: Record<FrameKind, typeof GlobeGlyph> = {
  navigate: GlobeGlyph,
  screenshot: CameraGlyph,
  click: CursorClickGlyph,
  type: PencilGlyph,
  read: DocumentGlyph,
};

const FRAME_KIND_LABEL: Record<FrameKind, string> = {
  navigate: 'navigate',
  screenshot: 'screenshot',
  click: 'click',
  type: 'type',
  read: 'read page',
};

// 12-frame timeline for session sess_9k3d1x. Frame 7 fails on a selector
// timeout (that failure is why the agent backtracked); frame 12 is still
// running when the page renders.
const FRAMES: SessionFrame[] = [
  {
    index: 1,
    kind: 'navigate',
    action: 'Navigated to https://vercel.com/pricing',
    status: 'success',
    at: '2026-07-01T09:41:12',
  },
  {
    index: 2,
    kind: 'screenshot',
    action: 'Captured page',
    status: 'success',
    at: '2026-07-01T09:41:15',
    capture: 'Captured page',
  },
  {
    index: 3,
    kind: 'click',
    action: 'Clicked Pricing → Pro',
    status: 'success',
    at: '2026-07-01T09:41:19',
  },
  {
    index: 4,
    kind: 'type',
    action: 'Typed acme-team into org field',
    status: 'success',
    at: '2026-07-01T09:41:24',
  },
  {
    index: 5,
    kind: 'click',
    action: 'Clicked Continue',
    status: 'success',
    at: '2026-07-01T09:41:28',
  },
  {
    index: 6,
    kind: 'screenshot',
    action: 'Captured checkout form',
    status: 'success',
    at: '2026-07-01T09:41:31',
    capture: 'Captured checkout form',
  },
  {
    index: 7,
    kind: 'click',
    action: 'Timeout waiting for selector #checkout',
    status: 'error',
    at: '2026-07-01T09:41:47',
  },
  {
    index: 8,
    kind: 'navigate',
    action: 'Went back to /pricing',
    status: 'success',
    at: '2026-07-01T09:41:52',
  },
  {
    index: 9,
    kind: 'click',
    action: 'Clicked Contact sales',
    status: 'success',
    at: '2026-07-01T09:41:56',
  },
  {
    index: 10,
    kind: 'read',
    action: 'Read page content (4,120 chars)',
    status: 'success',
    at: '2026-07-01T09:42:01',
  },
  {
    index: 11,
    kind: 'screenshot',
    action: 'Captured confirmation',
    status: 'success',
    at: '2026-07-01T09:42:05',
    capture: 'Captured confirmation',
  },
  {
    index: 12,
    kind: 'click',
    action: 'Running click…',
    status: 'pending',
    at: '2026-07-01T09:42:09',
  },
];

const TOTAL_FRAMES = FRAMES.length;

/**
 * Frames reuse the last screenshot (navi browser-screen-dock behavior):
 * a frame's screen shows the most recent capture at or before it.
 */
function lastCaptureFor(frameIndex: number): SessionFrame | null {
  for (let i = frameIndex - 1; i >= 0; i--) {
    if (FRAMES[i].capture != null) {
      return FRAMES[i];
    }
  }
  return null;
}

/**
 * Interval-driven playback shared by the live and history docks: one frame
 * per 900ms (PLAYBACK_NOTE), stopping at the last frame. UI animation only —
 * all fixture data stays fixed.
 */
function useFramePlayback(
  frameIndex: number,
  onFrameChange: (index: number) => void,
) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = setInterval(() => {
      onFrameChange(Math.min(TOTAL_FRAMES, frameIndex + 1));
    }, 900);
    return () => clearInterval(timer);
  }, [isPlaying, frameIndex, onFrameChange]);

  useEffect(() => {
    if (frameIndex >= TOTAL_FRAMES) {
      setIsPlaying(false);
    }
  }, [frameIndex]);

  return {isPlaying, setIsPlaying};
}

// ============= DOCK PIECES =============

function FrameStateIcon({status}: {status: FrameStatus}) {
  if (status === 'pending') {
    return <Spinner size="sm" aria-label="Action running" />;
  }
  if (status === 'error') {
    return <StatusDot variant="error" label="Action failed" />;
  }
  return (
    <Icon icon="success" size="sm" color="success" aria-label="Action succeeded" />
  );
}

/**
 * Compact Collapsible trigger header: browser icon, bold "Browser" label,
 * truncated last-action text, "7/12" counter Badge, trailing state icon.
 * Collapsible supplies the chevron.
 */
function DockTriggerHeader({
  frame,
  isCompact,
}: {
  frame: SessionFrame;
  isCompact: boolean;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <Icon icon={BrowserWindowGlyph} size="sm" color="secondary" />
      <Text type="body" weight="semibold">
        Browser
      </Text>
      <StackItem size="fill" style={styles.triggerText}>
        <Text type="supporting" color="secondary" maxLines={1}>
          {frame.action}
        </Text>
      </StackItem>
      {!isCompact && (
        <Timestamp
          value={frame.at}
          format="time"
          type="supporting"
          color="secondary"
        />
      )}
      <Badge
        label={`${frame.index}/${TOTAL_FRAMES}`}
        variant={
          frame.status === 'error'
            ? 'error'
            : frame.status === 'pending'
              ? 'info'
              : 'neutral'
        }
      />
      <FrameStateIcon status={frame.status} />
    </HStack>
  );
}

/** Neutral 16:9 screenshot slot; border tints by the shown frame's state. */
function ScreenshotFrame({frame}: {frame: SessionFrame}) {
  const capture = lastCaptureFor(frame.index);
  const wrapStyle: CSSProperties = {
    ...styles.screenshotWrap,
    ...(frame.status === 'pending' ? styles.screenshotWrapPending : undefined),
    ...(frame.status === 'error' ? styles.screenshotWrapError : undefined),
  };

  return (
    <div style={wrapStyle}>
      <AspectRatio ratio={16 / 9}>
        <div style={styles.screenshotPanel}>
          <VStack gap={1} hAlign="center">
            <Text type="label" color="secondary">
              {capture != null
                ? `Screenshot — frame ${capture.index} · ${capture.capture}`
                : 'Awaiting first capture'}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {frame.status === 'pending'
                ? `1280 × 800 · frame ${frame.index} in flight`
                : `1280 × 800 · shown at frame ${frame.index}`}
            </Text>
          </VStack>
        </div>
      </AspectRatio>
    </div>
  );
}

/**
 * Media-transport row: skip-back / play / skip-forward IconButtons (28px
 * "sm" hit targets, disabled at the ends), a tabular frame counter, and a
 * "Live" ToggleButton that pins playback to the newest frame.
 */
function TransportToolbar({
  frameIndex,
  isPlaying,
  isLive,
  hasLiveToggle,
  onStep,
  onPlayToggle,
  onLiveToggle,
}: {
  frameIndex: number;
  isPlaying: boolean;
  isLive: boolean;
  hasLiveToggle: boolean;
  onStep: (delta: number) => void;
  onPlayToggle: () => void;
  onLiveToggle: (isPressed: boolean) => void;
}) {
  const atStart = frameIndex <= 1;
  const atEnd = frameIndex >= TOTAL_FRAMES;

  return (
    <Toolbar
      label="Playback transport"
      size="sm"
      gap={1}
      startContent={
        <>
          <IconButton
            label="Previous frame"
            tooltip="Previous frame"
            icon={<Icon icon={SkipBackGlyph} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            isDisabled={atStart || isLive}
            onClick={() => onStep(-1)}
          />
          <Tooltip
            content={
              <HStack gap={2} vAlign="center">
                <Text type="supporting" color="inherit">
                  {isPlaying ? 'Pause' : `Play · ${PLAYBACK_NOTE}`}
                </Text>
                <Kbd keys="space" />
              </HStack>
            }>
            <IconButton
              label={isPlaying ? 'Pause playback' : 'Play frames'}
              icon={
                <Icon
                  icon={isPlaying ? PauseGlyph : PlayGlyph}
                  size="sm"
                  color="inherit"
                />
              }
              variant="ghost"
              size="sm"
              isDisabled={isLive || (atEnd && !isPlaying)}
              onClick={onPlayToggle}
            />
          </Tooltip>
          <IconButton
            label="Next frame"
            tooltip="Next frame"
            icon={<Icon icon={SkipForwardGlyph} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            isDisabled={atEnd || isLive}
            onClick={() => onStep(1)}
          />
        </>
      }
      centerContent={
        <Text
          type="supporting"
          color="secondary"
          hasTabularNumbers
          style={styles.transportCounter}>
          Frame {frameIndex} of {TOTAL_FRAMES}
        </Text>
      }
      endContent={
        hasLiveToggle ? (
          <ToggleButton
            label="Live"
            size="sm"
            icon={<Icon icon={LiveSignalGlyph} size="sm" color="inherit" />}
            isPressed={isLive}
            onPressedChange={onLiveToggle}
            tooltip={isLive ? 'Tracking newest frame' : 'Jump to newest frame'}
          />
        ) : undefined
      }
    />
  );
}

// ============= DOCK CARDS =============

/**
 * Collapsed dock: the session's opening segment, folded away. The trigger
 * alone tells the story — first action, 1/12 counter, success check.
 */
function CollapsedDock({isCompact}: {isCompact: boolean}) {
  const [isOpen, setIsOpen] = useState(false);
  const frame = FRAMES[0];

  return (
    <Card padding={3}>
      <Collapsible
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        trigger={<DockTriggerHeader frame={frame} isCompact={isCompact} />}>
        <VStack gap={3}>
          <Divider />
          <ScreenshotFrame frame={frame} />
          <Text type="supporting" color="secondary">
            {FRAME_KIND_LABEL[frame.kind]} — {frame.index}/{TOTAL_FRAMES}
          </Text>
        </VStack>
      </Collapsible>
    </Card>
  );
}

/**
 * Live dock: pinned to the newest frame while the click runs. The frame is
 * ringed as in-flight and the Live toggle is active; switching Live off
 * frees the transport for scrubbing and playback, switching it back on
 * snaps to the end.
 */
function LiveDock({isCompact}: {isCompact: boolean}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [scrubIndex, setScrubIndex] = useState(TOTAL_FRAMES);
  const {isPlaying, setIsPlaying} = useFramePlayback(scrubIndex, setScrubIndex);

  const frameIndex = isLive ? TOTAL_FRAMES : scrubIndex;
  const frame = FRAMES[frameIndex - 1];

  const handleLiveToggle = (isPressed: boolean) => {
    setIsLive(isPressed);
    setIsPlaying(false);
    if (isPressed) {
      setScrubIndex(TOTAL_FRAMES);
    }
  };

  return (
    <Card padding={3}>
      <Collapsible
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        trigger={<DockTriggerHeader frame={frame} isCompact={isCompact} />}>
        <VStack gap={3}>
          <Divider />
          <TransportToolbar
            frameIndex={frameIndex}
            isPlaying={isPlaying}
            isLive={isLive}
            hasLiveToggle
            onStep={delta => {
              setIsPlaying(false);
              setScrubIndex(prev =>
                Math.min(TOTAL_FRAMES, Math.max(1, prev + delta)),
              );
            }}
            onPlayToggle={() => setIsPlaying(prev => !prev)}
            onLiveToggle={handleLiveToggle}
          />
          <ScreenshotFrame frame={frame} />
          <Text type="supporting" color="secondary">
            {FRAME_KIND_LABEL[frame.kind]} — {frame.index}/{TOTAL_FRAMES}
            {frame.status === 'pending' ? ' · in flight' : ''}
          </Text>
        </VStack>
      </Collapsible>
    </Card>
  );
}

/**
 * History dock: expanded by default, scrubbed to a past frame. Playback
 * advances one frame per 900ms until the last frame; the step list below
 * also scrubs this dock.
 */
function HistoryDock({
  frameIndex,
  onFrameChange,
  isCompact,
}: {
  frameIndex: number;
  onFrameChange: (index: number) => void;
  isCompact: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const {isPlaying, setIsPlaying} = useFramePlayback(frameIndex, onFrameChange);
  const frame = FRAMES[frameIndex - 1];

  // J/K scrubbing, as promised by the Kbd hint under the screenshot
  // (J steps back, K steps forward); scrubbing pauses playback.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.key !== 'j' && event.key !== 'k') {
        return;
      }
      setIsPlaying(false);
      onFrameChange(
        Math.min(
          TOTAL_FRAMES,
          Math.max(1, frameIndex + (event.key === 'j' ? -1 : 1)),
        ),
      );
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [frameIndex, onFrameChange, setIsPlaying]);

  return (
    <Card padding={3}>
      <Collapsible
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        trigger={<DockTriggerHeader frame={frame} isCompact={isCompact} />}>
        <VStack gap={3}>
          <Divider />
          <TransportToolbar
            frameIndex={frameIndex}
            isPlaying={isPlaying}
            isLive={false}
            hasLiveToggle={false}
            onStep={delta => {
              setIsPlaying(false);
              onFrameChange(
                Math.min(TOTAL_FRAMES, Math.max(1, frameIndex + delta)),
              );
            }}
            onPlayToggle={() => setIsPlaying(prev => !prev)}
            onLiveToggle={() => {}}
          />
          <ScreenshotFrame frame={frame} />
          <HStack gap={2} vAlign="center" style={styles.scrubHint}>
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                {FRAME_KIND_LABEL[frame.kind]} — {frame.index}/{TOTAL_FRAMES}
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary">
              Scrub with
            </Text>
            <Kbd keys="j" />
            <Kbd keys="k" />
          </HStack>
        </VStack>
      </Collapsible>
    </Card>
  );
}

// ============= STEP LIST =============

function FrameStepList({
  selectedIndex,
  onSelect,
  isCompact,
}: {
  selectedIndex: number;
  onSelect: (index: number) => void;
  isCompact: boolean;
}) {
  return (
    <Card padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Frames</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {TOTAL_FRAMES} actions · 3 captures
          </Text>
        </HStack>
        <Text type="supporting" color="secondary">
          Click a step to scrub the history dock. Frames without a capture
          reuse the last screenshot.
        </Text>
        <List density="compact" hasDividers>
          {FRAMES.map(frame => (
            <ListItem
              key={frame.index}
              label={
                isCompact ? (
                  frame.action
                ) : (
                  <Text type="body" maxLines={1}>
                    {frame.action}
                  </Text>
                )
              }
              description={FRAME_KIND_LABEL[frame.kind]}
              startContent={
                <HStack gap={2} vAlign="center">
                  <div style={styles.stepIndex}>
                    <Text
                      type="supporting"
                      color="secondary"
                      hasTabularNumbers>
                      {frame.index}
                    </Text>
                  </div>
                  <StatusDot
                    variant={
                      frame.status === 'error'
                        ? 'error'
                        : frame.status === 'pending'
                          ? 'accent'
                          : 'success'
                    }
                    label={
                      frame.status === 'error'
                        ? 'Failed'
                        : frame.status === 'pending'
                          ? 'Running'
                          : 'Succeeded'
                    }
                    isPulsing={frame.status === 'pending'}
                  />
                  <Icon
                    icon={FRAME_KIND_ICON[frame.kind]}
                    size="sm"
                    color="secondary"
                  />
                </HStack>
              }
              endContent={
                <HStack gap={2} vAlign="center">
                  {frame.capture != null && (
                    <Badge label="capture" variant="neutral" />
                  )}
                  {frame.status === 'error' && (
                    <Badge label="error" variant="error" />
                  )}
                  <Timestamp
                    value={frame.at}
                    format="time"
                    color="secondary"
                  />
                </HStack>
              }
              onClick={() => onSelect(frame.index)}
              isSelected={frame.index === selectedIndex}
            />
          ))}
        </List>
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

export default function BrowserSessionReplayTemplate() {
  // History dock scrub position, shared with the step list (fixture pins
  // the history variant at frame 7 — the selector-timeout failure).
  const [historyFrame, setHistoryFrame] = useState(7);

  const isCompact = useMediaQuery('(max-width: 768px)');

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>{SESSION_TITLE}</Heading>
                <Badge label="Running" variant="info" />
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    {SESSION_ID}
                  </Text>
                )}
              </HStack>
            </StackItem>
            {!isCompact && (
              <HStack gap={1} vAlign="center">
                <Text type="supporting" color="secondary">
                  Started
                </Text>
                <Timestamp
                  value={SESSION_STARTED_AT}
                  format="time"
                  type="supporting"
                  color="secondary"
                />
              </HStack>
            )}
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={4}>
              {/* Variant 1: collapsed — the trigger row is the whole UI. */}
              <CollapsedDock isCompact={isCompact} />

              {/* Variant 2: live — pinned to the in-flight newest frame. */}
              <LiveDock isCompact={isCompact} />

              {/* Variant 3: history scrub — frame 7 of 12, the failure. */}
              <HistoryDock
                frameIndex={historyFrame}
                onFrameChange={setHistoryFrame}
                isCompact={isCompact}
              />

              <FrameStepList
                selectedIndex={historyFrame}
                onSelect={setHistoryFrame}
                isCompact={isCompact}
              />
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
