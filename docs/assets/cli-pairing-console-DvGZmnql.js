var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (daemon identity: navi v0.1.0 on
 *   MacBook-Pro.local in ~/code/acme with 12 skills, 47 commands, and a
 *   heartbeat frozen at 3:42:07 PM; an 8-line seq-numbered command log;
 *   the pairing code KXTR-92FD — an obviously fake letter-digit mix)
 * @output End-to-end device-pairing surface in two halves: left, a dark
 *   monospace daemon console Card reproducing the CLI's stdout — cyan
 *   ASCII mascot header ("navi v0.1.0", dim machine/folder line, "Hey!
 *   Listen!" tagline), a scrolling command log with green ✓ exit codes,
 *   a red ✗ timeout, and a yellow update arrow, plus a pinned status
 *   line and a Divider-separated strip of all three connection variants
 *   (green Connected with dot-separated skills/cmds/heartbeat segments,
 *   amber Connecting…, red Disconnected) selectable via tiny Tokens;
 *   right, the browser-side authorization card in a 2x2 Grid of its four
 *   states — idle with the tracked mono pairing code above a full-width
 *   Authorize Button, authorizing with Spinner, success with a green
 *   check circle and "You can close this tab.", and error with an
 *   expired-code message plus a Try again Link
 * @position Page template; emitted by \`astryx template cli-pairing-console\`
 *
 * Frame: Layout height="fill". A slim LayoutHeader carries the chrome
 * ("Pair a device", step caption "2 of 2", and a StatusDot mirroring the
 * selected connection variant). LayoutContent hosts a two-column body:
 * left ~55% is the terminal Card, right ~45% is the 2x2 Grid of auth-card
 * states with the footer hint below.
 *
 * Responsive contract:
 * - >900px: terminal 55% | auth grid 45%; each region scrolls with the
 *   page — the terminal's status strip stays inside the dark Card.
 * - <=900px: the columns stack vertically with the terminal first; the
 *   auth-state Grid reflows from 2x2 toward a single column via
 *   minWidth-based tracks. Auth cards keep maxWidth 384 at every size.
 *   The variant-strip Tokens' wrapper buttons grow to a >=44px touch
 *   target (desktop keeps the Token's exact ~20px footprint).
 *
 * Container policy (pairing-console archetype): exactly two primary
 * containers — one dark stdout Card (custom mono palette, never themed
 * Text colors) and one rounded Card per auth state. The idle card starts
 * visually primary (accent ring); clicking its Authorize Button moves the
 * ring to the authorizing card, and the error card's Try again Link
 * returns it to idle — the ring traces the real click path.
 *
 * Fixture policy: fixed strings only — the heartbeat clock is frozen, the
 * pairing code is an obvious fake, and no value resembles a credential.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {Code} from '@astryxdesign/core/Code';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {TerminalIcon} from 'lucide-react';

// ============= TERMINAL PALETTE =============
// The daemon console reproduces stdout, so it keeps its own fixed dark
// palette instead of themed Text colors (it must stay dark in both themes).

const TERM = {
  bg: '#0d1117',
  border: '#22272e',
  base: '#c9d1d9',
  dim: '#768390',
  cyan: '#39c5cf',
  green: '#3fb950',
  red: '#f47067',
  yellow: '#d4a72c',
} as const;

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Two-column body: terminal ~55% | auth states ~45%; stacks <=900px
  // with the terminal first (source order).
  bodyGrid: {
    display: 'grid',
    gridTemplateColumns: '11fr 9fr',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  bodyStacked: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  // Dark stdout card: mono 12.5px with a 2-space feel via padding.
  terminal: {
    backgroundColor: TERM.bg,
    borderColor: TERM.border,
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    lineHeight: 1.7,
    color: TERM.base,
    overflow: 'hidden',
  },
  mascot: {
    margin: 0,
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    lineHeight: 1.45,
    color: TERM.cyan,
    whiteSpace: 'pre',
  },
  logBlock: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  termDivider: {
    height: 1,
    backgroundColor: TERM.border,
    marginBlock: 'var(--spacing-3)',
  },
  variantRow: {paddingBlock: 'var(--spacing-1)'},
  // Unstyled wrapper button that gives each tiny variant Token a real
  // click/tap target. Desktop keeps the Token's exact footprint; the
  // compact variant grows the hit area to >=44px for touch.
  variantTokenButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
  },
  variantTokenButtonCompact: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    minHeight: 44,
    minWidth: 44,
  },
  // Auth cards: max 384px, rounded; idle gets an accent ring.
  authCard: {maxWidth: 384, width: '100%'},
  authCardPrimary: {
    maxWidth: 384,
    width: '100%',
    boxShadow: '0 0 0 2px var(--color-accent)',
  },
  codeBox: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    paddingBlock: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-2)',
    textAlign: 'center',
  },
  pairingCode: {
    fontFamily: MONO_FONT,
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: '0.3em',
    // Compensate the trailing letter-spacing so the code centers optically.
    marginRight: '-0.3em',
    color: 'var(--color-text-primary)',
  },
  fullWidth: {width: '100%'},
  authBody: {minHeight: 96},
};

// ============= DATA =============
// Deterministic fixtures: frozen heartbeat clock, no randomness, and a
// pairing code that could never be mistaken for a credential.

const DAEMON = {
  name: 'navi',
  version: 'v0.1.0',
  machine: 'MacBook-Pro.local',
  folder: '~/code/acme',
  tagline: 'Hey! Listen!',
  skills: 12,
  cmds: 47,
  heartbeat: '3:42:07 PM',
} as const;

const PAIRING_CODE = 'KXTR-92FD';

// Cyan ASCII mascot (a tiny fairy — navi) printed at daemon startup.
const MASCOT = [' .  *  . ', '* ( o ) *', " ' -~- ' "].join('\\n');

type LogKind = 'cmd' | 'ok' | 'fail' | 'info' | 'update';

interface LogLine {
  id: string;
  kind: LogKind;
  seq?: number;
  text: string;
  tooltip?: string;
}

// 8-line command log: seq-numbered shell commands with paired results,
// then two daemon notices.
const LOG_LINES: LogLine[] = [
  {id: 'l-1', kind: 'cmd', seq: 47, text: 'shell npm test'},
  {id: 'l-2', kind: 'ok', seq: 47, text: '✓ (exit 0)'},
  {id: 'l-3', kind: 'cmd', seq: 48, text: 'shell git status --short'},
  {id: 'l-4', kind: 'ok', seq: 48, text: '✓ (exit 0)'},
  {
    id: 'l-5',
    kind: 'cmd',
    seq: 49,
    text: 'shell curl -s https://api.acme.dev/health',
  },
  {
    id: 'l-6',
    kind: 'fail',
    seq: 49,
    text: '✗ Command timed out',
    tooltip: 'Killed after the 30s command timeout',
  },
  {id: 'l-7', kind: 'info', text: \`Loaded \${DAEMON.skills} skills\`},
  {
    id: 'l-8',
    kind: 'update',
    text: '↑ Update available: v0.2.0',
    tooltip: 'Run: npm i -g navi@latest',
  },
];

type ConnectionState = 'connected' | 'connecting' | 'disconnected';

const CONNECTION_STATES: ConnectionState[] = [
  'connected',
  'connecting',
  'disconnected',
];

const CONNECTION: Record<
  ConnectionState,
  {
    label: string;
    color: string;
    tokenColor: 'green' | 'yellow' | 'red';
    dot: 'success' | 'warning' | 'error';
  }
> = {
  connected: {
    label: 'Connected',
    color: TERM.green,
    tokenColor: 'green',
    dot: 'success',
  },
  connecting: {
    label: 'Connecting...',
    color: TERM.yellow,
    tokenColor: 'yellow',
    dot: 'warning',
  },
  disconnected: {
    label: 'Disconnected',
    color: TERM.red,
    tokenColor: 'red',
    dot: 'error',
  },
};

type AuthState = 'idle' | 'authorizing' | 'success' | 'error';

const AUTH_STATES: AuthState[] = ['idle', 'authorizing', 'success', 'error'];

const AUTH_STATE_BADGE: Record<
  AuthState,
  {label: string; variant: BadgeVariant}
> = {
  idle: {label: 'idle', variant: 'info'},
  authorizing: {label: 'authorizing', variant: 'neutral'},
  success: {label: 'success', variant: 'success'},
  error: {label: 'error', variant: 'error'},
};

// ============= TERMINAL (daemon console) =============

function TermText({
  color,
  children,
}: {
  color?: string;
  children: ReactNode;
}) {
  return <span style={color != null ? {color} : undefined}>{children}</span>;
}

function TerminalHeader() {
  return (
    <HStack gap={4} vAlign="center">
      <pre style={styles.mascot} aria-hidden>
        {MASCOT}
      </pre>
      <VStack gap={0}>
        <div>
          <TermText color={TERM.cyan}>
            {DAEMON.name} {DAEMON.version}
          </TermText>
        </div>
        <div>
          <TermText color={TERM.dim}>
            {DAEMON.machine} · {DAEMON.folder}
          </TermText>
        </div>
        <div>
          <TermText color={TERM.cyan}>“{DAEMON.tagline}”</TermText>
        </div>
      </VStack>
    </HStack>
  );
}

function LogLineRow({line}: {line: LogLine}) {
  const seqPrefix =
    line.seq != null ? (
      <TermText color={TERM.dim}>{\`#\${line.seq} \`}</TermText>
    ) : null;

  let body: ReactNode;
  switch (line.kind) {
    case 'cmd':
      body = <TermText>{line.text}</TermText>;
      break;
    case 'ok':
      body = <TermText color={TERM.green}>{line.text}</TermText>;
      break;
    case 'fail':
      body = <TermText color={TERM.red}>{line.text}</TermText>;
      break;
    case 'info':
      body = <TermText color={TERM.dim}>{line.text}</TermText>;
      break;
    case 'update':
      body = <TermText color={TERM.yellow}>{line.text}</TermText>;
      break;
  }

  const row = (
    <div style={styles.logBlock}>
      {seqPrefix}
      {body}
    </div>
  );

  return line.tooltip != null ? (
    <Tooltip content={line.tooltip}>{row}</Tooltip>
  ) : (
    row
  );
}

/**
 * The daemon's in-place status line, rendered in the requested connection
 * variant: green Connected with dim dot-separated skills/cmds/heartbeat
 * segments, amber Connecting..., red Disconnected.
 */
function DaemonStatusLine({state}: {state: ConnectionState}) {
  const meta = CONNECTION[state];
  return (
    <div style={styles.logBlock}>
      <TermText color={meta.color}>● {meta.label}</TermText>
      {state === 'connected' && (
        <TermText color={TERM.dim}>
          {' '}
          · {DAEMON.skills} skills · {DAEMON.cmds} cmds ·{' '}
          <Tooltip
            content={\`Last heartbeat from \${DAEMON.machine} (fixture clock)\`}>
            <span>heartbeat {DAEMON.heartbeat}</span>
          </Tooltip>
        </TermText>
      )}
    </div>
  );
}

function DaemonConsole({connection}: {connection: ConnectionState}) {
  return (
    <Card padding={4} style={styles.terminal}>
      <VStack gap={3}>
        <TerminalHeader />
        <div style={styles.termDivider} aria-hidden />

        {/* 8-line scrollback. */}
        <VStack gap={0}>
          {LOG_LINES.map(line => (
            <LogLineRow key={line.id} line={line} />
          ))}
        </VStack>

        {/* Pinned status line (redrawn in place by the real CLI). */}
        <div style={styles.termDivider} aria-hidden />
        <DaemonStatusLine state={connection} />
      </VStack>
    </Card>
  );
}

/**
 * Divider-separated strip of the three status-line variants, each labeled
 * by a tiny Token; clicking a Token pins that variant into the console.
 * The Token itself is only ~20px tall, so it sits inside an unstyled
 * native button that carries the click — same footprint on desktop, a
 * >=44px touch target when the layout is compact.
 */
function StatusVariantStrip({
  connection,
  isCompact,
  onSelectConnection,
}: {
  connection: ConnectionState;
  isCompact: boolean;
  onSelectConnection: (state: ConnectionState) => void;
}) {
  return (
    <Card padding={4} style={styles.terminal}>
      <VStack gap={2}>
        <TermText color={TERM.dim}>status line variants</TermText>
        {CONNECTION_STATES.map((state, index) => (
          <VStack gap={2} key={state}>
            {index > 0 && <div style={styles.termDivider} aria-hidden />}
            <HStack gap={3} vAlign="center" style={styles.variantRow}>
              <button
                type="button"
                style={
                  isCompact
                    ? styles.variantTokenButtonCompact
                    : styles.variantTokenButton
                }
                aria-label={\`Show the \${state} status line in the console\`}
                aria-pressed={state === connection}
                onClick={() => onSelectConnection(state)}>
                <Token
                  label={state}
                  size="sm"
                  color={
                    state === connection
                      ? CONNECTION[state].tokenColor
                      : 'default'
                  }
                />
              </button>
              <StackItem size="fill">
                <DaemonStatusLine state={state} />
              </StackItem>
            </HStack>
          </VStack>
        ))}
      </VStack>
    </Card>
  );
}

// ============= AUTH CARD (browser side) =============

function AuthCardChrome({children}: {children: ReactNode}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Icon icon={TerminalIcon} size="sm" color="secondary" />
        <Heading level={3}>Authorize CLI</Heading>
      </HStack>
      {children}
    </VStack>
  );
}

function AuthStateCard({
  state,
  isFocused,
  onFocusState,
}: {
  state: AuthState;
  isFocused: boolean;
  onFocusState: (state: AuthState) => void;
}) {
  const badge = AUTH_STATE_BADGE[state];
  let body: ReactNode;

  switch (state) {
    case 'idle':
      body = (
        <AuthCardChrome>
          <Text type="supporting" color="secondary">
            Enter this code? No — confirm it matches your terminal, then
            Authorize.
          </Text>
          <div style={styles.codeBox}>
            <span style={styles.pairingCode}>{PAIRING_CODE}</span>
          </div>
          <Button
            label="Authorize"
            variant="primary"
            style={styles.fullWidth}
            onClick={() => onFocusState('authorizing')}
          />
        </AuthCardChrome>
      );
      break;
    case 'authorizing':
      body = (
        <AuthCardChrome>
          <div style={styles.codeBox}>
            <span style={styles.pairingCode}>{PAIRING_CODE}</span>
          </div>
          <Center width="100%">
            <HStack gap={2} vAlign="center">
              <Spinner size="sm" aria-label="Authorizing" />
              <Text type="supporting" color="secondary">
                Authorizing...
              </Text>
            </HStack>
          </Center>
          <Button
            label="Authorize"
            variant="primary"
            isDisabled
            style={styles.fullWidth}
          />
        </AuthCardChrome>
      );
      break;
    case 'success':
      body = (
        <Center width="100%">
          <VStack gap={2} hAlign="center" style={styles.authBody}>
            <Icon icon="success" size="lg" color="success" />
            <Text weight="bold">CLI authorized successfully.</Text>
            <Text type="supporting" color="secondary">
              You can close this tab.
            </Text>
          </VStack>
        </Center>
      );
      break;
    case 'error':
      body = (
        <Center width="100%">
          <VStack gap={2} hAlign="center" style={styles.authBody}>
            <Icon icon="error" size="lg" color="error" />
            <Text weight="bold">Code expired.</Text>
            <Text type="supporting" color="secondary">
              Restart the CLI to get a new code.
            </Text>
            <Link onClick={() => onFocusState('idle')}>Try again</Link>
          </VStack>
        </Center>
      );
      break;
  }

  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Badge variant={badge.variant} label={badge.label} />
        {state === 'idle' && (
          <Text type="supporting" color="secondary">
            what the user sees first
          </Text>
        )}
      </HStack>
      <Card
        padding={4}
        style={isFocused ? styles.authCardPrimary : styles.authCard}>
        {body}
      </Card>
    </VStack>
  );
}

// ============= PAGE =============

export default function CliPairingConsoleTemplate() {
  // Which connection variant is pinned into the live console status line.
  const [connection, setConnection] = useState<ConnectionState>('connected');

  // Which auth-card state carries the accent ring. Starts on idle; the
  // idle card's Authorize moves it to authorizing, and the error card's
  // Try again returns it to idle — mirroring the real click path.
  const [focusedAuthState, setFocusedAuthState] = useState<AuthState>('idle');

  // Responsive contract: columns stack vertically <=900px, terminal first.
  const isStacked = useMediaQuery('(max-width: 900px)');

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Pair a device</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  2 of 2
                </Text>
              </HStack>
            </StackItem>
            <HStack gap={2} vAlign="center">
              <StatusDot
                variant={CONNECTION[connection].dot}
                label={\`Daemon \${CONNECTION[connection].label}\`}
              />
              <Text type="supporting" color="secondary">
                {DAEMON.name} {DAEMON.version} on {DAEMON.machine}
              </Text>
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={isStacked ? styles.bodyStacked : styles.bodyGrid}>
            {/* Left ~55%: the daemon console + status-line variants. */}
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <Heading level={2}>Daemon console</Heading>
                <Text type="supporting" color="secondary">
                  what your terminal is printing right now
                </Text>
              </HStack>
              <DaemonConsole connection={connection} />
              <StatusVariantStrip
                connection={connection}
                isCompact={isStacked}
                onSelectConnection={setConnection}
              />
            </VStack>

            {/* Right ~45%: browser authorization card in all four states. */}
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <Heading level={2}>Browser authorization</Heading>
                <Text type="supporting" color="secondary">
                  four states of the same card
                </Text>
              </HStack>
              <Grid columns={{minWidth: 250}} gap={3}>
                {AUTH_STATES.map(state => (
                  <AuthStateCard
                    key={state}
                    state={state}
                    isFocused={state === focusedAuthState}
                    onFocusState={setFocusedAuthState}
                  />
                ))}
              </Grid>
              <Divider />
              <Text type="supporting" color="secondary">
                Don't see a code? Make sure the <Code>navi</Code> app is
                running on your device.
              </Text>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};