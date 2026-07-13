var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (node identity: relay-node v1.2.3 on
 *   mac-studio in ~/dev/atlas behind http://fwdproxy:8080; a 6-line
 *   seq-numbered live log; three connection-state status lines with a
 *   heartbeat frozen at 3:42:07 PM; a 6-row \`relay-node doctor\` checklist
 *   with pass/fail/warn/skip states and copyable fix commands)
 * @output A centered dark terminal stage stacking three CLI specimens:
 *   (a) the startup hero — two-tone cyan/magenta ASCII fairy mark,
 *   "relay-node v1.2.3", dim machine/folder and proxy lines, and the
 *   italic tagline "Hey! Listen!"; (b) the live log — six scrolled lines
 *   (blue #3 bash command, green ✓ exit, red ✗ patch failed, dim skills
 *   notice, yellow update arrow) above the in-place status line, rendered
 *   in the connection state picked by the header Selector (green
 *   Connected with skills/cmds/heartbeat segments, pulsing yellow
 *   Connecting..., red Disconnected with retry countdown); (c) the
 *   \`relay-node doctor\` checklist — ✓/✗/!/- glyph rows with bold labels,
 *   detail text, dim fix-hint panels carrying working copy buttons, and a
 *   colored summary line. A caption row under the stage names the surface.
 * @position Page template; emitted by \`astryx template cli-node-doctor\`
 *
 * Frame: Layout height="fill". A slim LayoutHeader carries the page
 * chrome (title, node identity caption, a StatusDot mirroring the
 * selected connection state, and the connection-state Selector).
 * LayoutContent (padding 0) is a muted-token backdrop that centers the
 * fixed-palette terminal stage; the page scrolls, the stage does not.
 *
 * Responsive contract:
 * - The stage is a single centered column (width 720, maxWidth 100%), so
 *   no element-width observer is needed — it shrinks fluidly and long
 *   log/fix lines wrap (overflowWrap anywhere).
 * - Fix-line copy rows wrap the button under the command when narrow
 *   (flexWrap); the copy button keeps an intrinsic >=28px hit box.
 * - Header: the identity caption hides at narrow widths via the demo's
 *   normal LayoutHeader wrapping; the Selector stays reachable.
 *
 * Color policy: the terminal stage (styles.stage) is a scheme-locked
 * dark surface — it reproduces a CLI's stdout and stays dark in both
 * light and dark mode (colorScheme pinned to 'dark'). Every color painted
 * inside it (the TERM palette) is an intentional raw literal and must NOT
 * be converted to theme tokens. Everything outside the stage (header,
 * backdrop, caption) uses Astryx tokens and follows the active scheme.
 *
 * Motion: one <style> keyframe constant (cnd-pulse) breathes the
 * Connecting... glyph; no randomness, no clocks.
 */

import {useEffect, useState, type CSSProperties, type ReactNode} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ============= TERMINAL PALETTE =============
// Scheme-locked stage palette (batch terminal palette). Raw literals on
// purpose — the stage stays dark in both themes; do not tokenize.

const TERM = {
  bg: '#0d1117',
  panel: '#161b22',
  border: '#262c36',
  base: '#e6edf3',
  dim: '#8b949e',
  green: '#3fb950',
  yellow: '#d29922',
  red: '#f85149',
  cyan: '#39c5cf',
  blue: '#58a6ff',
  magenta: '#bc8cff',
} as const;

const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

// Subtle breathing on the Connecting... glyph only.
const KEYFRAMES = \`
@keyframes cnd-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Token-based backdrop so the dark stage still reads in light chrome.
  backdrop: {
    minHeight: '100%',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-6)',
  },
  // The terminal window: fixed dark palette, mono, rounded, bordered.
  stage: {
    colorScheme: 'dark',
    width: 720,
    maxWidth: '100%',
    backgroundColor: TERM.bg,
    border: \`1px solid \${TERM.border}\`,
    borderRadius: 12,
    boxShadow: '0 12px 32px rgba(1, 4, 9, 0.5)',
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    lineHeight: 1.7,
    color: TERM.base,
    overflow: 'hidden',
  },
  titleBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingBlock: 8,
    paddingInline: 12,
    borderBottom: \`1px solid \${TERM.border}\`,
    backgroundColor: TERM.panel,
  },
  titleDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#30363d',
  },
  titleText: {
    flex: 1,
    textAlign: 'center',
    color: TERM.dim,
    fontSize: 11,
  },
  stageBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: 20,
  },
  // 10px uppercase tracking-wide specimen eyebrow with a hairline rule.
  eyebrowRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: TERM.dim,
    whiteSpace: 'nowrap',
  },
  eyebrowRule: {
    flex: 1,
    height: 1,
    backgroundColor: TERM.border,
  },
  mascot: {
    margin: 0,
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    lineHeight: 1.4,
    whiteSpace: 'pre',
  },
  heroText: {lineHeight: 1.55},
  tagline: {
    color: TERM.cyan,
    fontStyle: 'italic',
  },
  logBlock: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  // The in-place status line sits in a subtle pane so it reads "pinned".
  statusPanel: {
    backgroundColor: TERM.panel,
    border: \`1px solid \${TERM.border}\`,
    borderRadius: 8,
    paddingBlock: 6,
    paddingInline: 12,
  },
  pulsingGlyph: {
    animation: 'cnd-pulse 1.6s ease-in-out infinite',
  },
  // Doctor rows: fixed glyph column + content column.
  checkRow: {
    display: 'grid',
    gridTemplateColumns: '18px 1fr',
    gap: 8,
    alignItems: 'start',
  },
  checkGlyph: {textAlign: 'center'},
  checkLabel: {fontWeight: 600},
  // Fix hint pane: dim mono command + copy button; wraps when narrow.
  fixRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: TERM.panel,
    border: \`1px solid \${TERM.border}\`,
    borderRadius: 8,
    paddingBlock: 5,
    paddingInline: 10,
    marginTop: 4,
  },
  fixCommand: {
    flex: '1 1 200px',
    minWidth: 0,
    color: TERM.dim,
    overflowWrap: 'anywhere',
  },
  copyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 28,
    fontFamily: MONO_FONT,
    fontSize: 11,
    color: TERM.dim,
    backgroundColor: 'transparent',
    border: \`1px solid \${TERM.border}\`,
    borderRadius: 6,
    paddingBlock: 2,
    paddingInline: 10,
    cursor: 'pointer',
  },
  copyButtonCopied: {
    color: TERM.green,
    borderColor: TERM.green,
  },
  summaryRow: {paddingTop: 2},
};

// ============= DATA =============
// Deterministic fixtures: frozen heartbeat clock, fixed retry countdown,
// no randomness, and no value that resembles a credential.

const NODE = {
  name: 'relay-node',
  version: 'v1.2.3',
  machine: 'mac-studio',
  folder: '~/dev/atlas',
  proxy: 'http://fwdproxy:8080',
  tagline: 'Hey! Listen!',
  skills: 12,
  cmds: 4,
  heartbeat: '3:42:07 PM',
} as const;

// Two-tone ASCII fairy mark: cyan body, magenta sparkles.
type MascotTone = 'cyan' | 'magenta';

const MASCOT_LINES: ReadonlyArray<
  ReadonlyArray<{text: string; tone: MascotTone}>
> = [
  [{text: '  . ˚ * ˚ .', tone: 'magenta'}],
  [
    {text: ' * ', tone: 'magenta'},
    {text: '>( o )<', tone: 'cyan'},
    {text: ' .', tone: 'magenta'},
  ],
  [
    {text: '  . ', tone: 'magenta'},
    {text: '~/ \\\\~', tone: 'cyan'},
    {text: ' *', tone: 'magenta'},
  ],
  [{text: '    * . ˚', tone: 'magenta'}],
];

type LogTone = 'base' | 'dim' | 'blue' | 'green' | 'red' | 'yellow';

interface LogLine {
  id: string;
  seq?: number;
  tone: LogTone;
  text: string;
  tooltip?: string;
}

// Six scrolled log lines above the in-place status line.
const LOG_LINES: LogLine[] = [
  {id: 'log-1', seq: 3, tone: 'blue', text: 'bash ls -la'},
  {id: 'log-2', seq: 3, tone: 'green', text: '✓ (exit 0)'},
  {id: 'log-3', seq: 4, tone: 'base', text: 'edit src/app.ts'},
  {
    id: 'log-4',
    seq: 4,
    tone: 'red',
    text: '✗ patch failed',
    tooltip: 'Context drifted — the agent will re-read the file and retry',
  },
  {id: 'log-5', tone: 'dim', text: 'Loaded 12 skills'},
  {
    id: 'log-6',
    tone: 'yellow',
    text: '↑ update available',
    tooltip: 'Run: relay-node self-update',
  },
];

type ConnectionState = 'connected' | 'connecting' | 'disconnected';

const CONNECTION_OPTIONS: Array<{value: ConnectionState; label: string}> = [
  {value: 'connected', label: 'Connected'},
  {value: 'connecting', label: 'Connecting...'},
  {value: 'disconnected', label: 'Disconnected'},
];

const CONNECTION: Record<
  ConnectionState,
  {
    glyph: string;
    label: string;
    color: string;
    meta: string;
    dot: 'success' | 'warning' | 'error';
    isPulsing: boolean;
  }
> = {
  connected: {
    glyph: '●',
    label: 'Connected',
    color: TERM.green,
    meta: \` · \${NODE.skills} skills · \${NODE.cmds} cmds · heartbeat \${NODE.heartbeat}\`,
    dot: 'success',
    isPulsing: false,
  },
  connecting: {
    glyph: '◌',
    label: 'Connecting...',
    color: TERM.yellow,
    meta: ' · wss://relaybot.dev/node · attempt 2 of 5',
    dot: 'warning',
    isPulsing: true,
  },
  disconnected: {
    glyph: '●',
    label: 'Disconnected',
    color: TERM.red,
    meta: ' · lost heartbeat at 3:41:52 PM · retrying in 8s',
    dot: 'error',
    isPulsing: false,
  },
};

type CheckStatus = 'pass' | 'fail' | 'warn' | 'skip';

interface DoctorCheck {
  id: string;
  status: CheckStatus;
  label: string;
  detail: string;
  fix?: {command: string};
}

const CHECK_GLYPH: Record<CheckStatus, {glyph: string; color: string}> = {
  pass: {glyph: '✓', color: TERM.green},
  fail: {glyph: '✗', color: TERM.red},
  warn: {glyph: '!', color: TERM.yellow},
  skip: {glyph: '-', color: TERM.dim},
};

const CHECK_DETAIL_COLOR: Record<CheckStatus, string> = {
  pass: TERM.base,
  fail: TERM.red,
  warn: TERM.yellow,
  skip: TERM.dim,
};

const DOCTOR_CHECKS: DoctorCheck[] = [
  {
    id: 'chk-version',
    status: 'pass',
    label: 'Binary version',
    detail: 'v1.2.3 (latest)',
  },
  {
    id: 'chk-path',
    status: 'fail',
    label: 'PATH',
    detail: '~/.relay/bin is NOT in PATH',
    fix: {command: 'export PATH="$HOME/.relay/bin:$PATH"'},
  },
  {
    id: 'chk-credentials',
    status: 'pass',
    label: 'Credentials',
    detail: '~/.relay/credentials.json',
  },
  {
    id: 'chk-proxy',
    status: 'warn',
    label: 'Proxy',
    detail: 'git proxy differs from env',
    fix: {command: 'git config --global http.proxy http://fwdproxy:8080'},
  },
  {
    id: 'chk-connectivity',
    status: 'pass',
    label: 'Connectivity',
    detail: 'relaybot.dev reachable (123ms)',
  },
  {
    id: 'chk-daemon',
    status: 'skip',
    label: 'Daemon',
    detail: 'not installed (optional)',
    fix: {command: 'relay-node daemon install'},
  },
];

// ============= TERMINAL PRIMITIVES =============

function TermText({color, children}: {color?: string; children: ReactNode}) {
  return <span style={color != null ? {color} : undefined}>{children}</span>;
}

function SpecimenEyebrow({label}: {label: string}) {
  return (
    <div style={styles.eyebrowRow}>
      <span style={styles.eyebrow}>{label}</span>
      <div style={styles.eyebrowRule} aria-hidden />
    </div>
  );
}

function PromptLine({command}: {command: string}) {
  return (
    <div style={styles.logBlock}>
      <TermText color={TERM.cyan}>$ </TermText>
      <TermText>{command}</TermText>
    </div>
  );
}

// ============= SPECIMEN A: STARTUP HERO =============

function StartupHero() {
  return (
    <VStack gap={2}>
      <SpecimenEyebrow label="Startup" />
      <PromptLine command={NODE.name} />
      <HStack gap={5} vAlign="center">
        <pre style={styles.mascot} aria-hidden>
          {MASCOT_LINES.map((line, index) => (
            <span key={index}>
              {line.map((segment, segmentIndex) => (
                <span
                  key={segmentIndex}
                  style={{
                    color:
                      segment.tone === 'cyan' ? TERM.cyan : TERM.magenta,
                  }}>
                  {segment.text}
                </span>
              ))}
              {index < MASCOT_LINES.length - 1 ? '\\n' : null}
            </span>
          ))}
        </pre>
        <div style={styles.heroText}>
          <div>
            <TermText color={TERM.cyan}>
              {NODE.name} {NODE.version}
            </TermText>
          </div>
          <div>
            <TermText color={TERM.dim}>
              {NODE.machine} · {NODE.folder}
            </TermText>
          </div>
          <div>
            <TermText color={TERM.dim}>proxy: {NODE.proxy}</TermText>
          </div>
          <div style={styles.tagline}>&ldquo;{NODE.tagline}&rdquo;</div>
        </div>
      </HStack>
    </VStack>
  );
}

// ============= SPECIMEN B: LIVE LOG + STATUS LINE =============

const LOG_TONE_COLOR: Record<LogTone, string> = {
  base: TERM.base,
  dim: TERM.dim,
  blue: TERM.blue,
  green: TERM.green,
  red: TERM.red,
  yellow: TERM.yellow,
};

function LogLineRow({line}: {line: LogLine}) {
  const row = (
    <div style={styles.logBlock}>
      {line.seq != null && <TermText color={TERM.dim}>{\`#\${line.seq} \`}</TermText>}
      <TermText color={LOG_TONE_COLOR[line.tone]}>{line.text}</TermText>
    </div>
  );
  return line.tooltip != null ? (
    <Tooltip content={line.tooltip}>{row}</Tooltip>
  ) : (
    row
  );
}

/**
 * The in-place status line the daemon redraws at the bottom of its
 * scrollback, rendered in whichever connection state the header Selector
 * picked. Connecting... breathes via the cnd-pulse keyframe.
 */
function NodeStatusLine({state}: {state: ConnectionState}) {
  const meta = CONNECTION[state];
  return (
    <div style={{...styles.statusPanel, ...styles.logBlock}}>
      <span
        style={{
          color: meta.color,
          ...(meta.isPulsing ? styles.pulsingGlyph : null),
        }}>
        {meta.glyph}
      </span>
      <TermText color={meta.color}> {meta.label}</TermText>
      {state === 'connected' ? (
        <TermText color={TERM.dim}>
          {' · '}
          {NODE.skills} skills {'·'} {NODE.cmds} cmds {'·'}{' '}
          <Tooltip
            content={\`Last heartbeat from \${NODE.machine} (fixture clock)\`}>
            <span>heartbeat {NODE.heartbeat}</span>
          </Tooltip>
        </TermText>
      ) : (
        <TermText color={TERM.dim}>{meta.meta}</TermText>
      )}
    </div>
  );
}

function LiveLogSpecimen({connection}: {connection: ConnectionState}) {
  return (
    <VStack gap={2}>
      <SpecimenEyebrow label="Live log · status line" />
      <VStack gap={0}>
        {LOG_LINES.map(line => (
          <LogLineRow key={line.id} line={line} />
        ))}
      </VStack>
      <NodeStatusLine state={connection} />
    </VStack>
  );
}

// ============= SPECIMEN C: DOCTOR CHECKLIST =============

function FixLine({
  check,
  isCopied,
  onCopy,
}: {
  check: DoctorCheck;
  isCopied: boolean;
  onCopy: (id: string, command: string) => void;
}) {
  if (check.fix == null) {
    return null;
  }
  const {command} = check.fix;
  return (
    <div style={styles.fixRow}>
      <span style={styles.fixCommand}>{command}</span>
      <button
        type="button"
        style={
          isCopied
            ? {...styles.copyButton, ...styles.copyButtonCopied}
            : styles.copyButton
        }
        aria-label={\`Copy fix command for \${check.label}: \${command}\`}
        onClick={() => onCopy(check.id, command)}>
        {isCopied ? '✓ copied' : '⧉ copy'}
      </button>
    </div>
  );
}

function DoctorCheckRow({
  check,
  copiedId,
  onCopy,
}: {
  check: DoctorCheck;
  copiedId: string | null;
  onCopy: (id: string, command: string) => void;
}) {
  const glyph = CHECK_GLYPH[check.status];
  return (
    <div style={styles.checkRow}>
      <span style={{...styles.checkGlyph, color: glyph.color}} aria-hidden>
        {glyph.glyph}
      </span>
      <div>
        <div style={styles.logBlock}>
          <span
            style={{
              ...styles.checkLabel,
              color: check.status === 'skip' ? TERM.dim : TERM.base,
            }}>
            {check.label}
          </span>
          <TermText color={TERM.dim}>{' — '}</TermText>
          <TermText color={CHECK_DETAIL_COLOR[check.status]}>
            {check.detail}
          </TermText>
        </div>
        <FixLine
          check={check}
          isCopied={copiedId === check.id}
          onCopy={onCopy}
        />
      </div>
    </div>
  );
}

function DoctorSpecimen({
  copiedId,
  onCopy,
}: {
  copiedId: string | null;
  onCopy: (id: string, command: string) => void;
}) {
  return (
    <VStack gap={2}>
      <SpecimenEyebrow label="Doctor" />
      <PromptLine command={\`\${NODE.name} doctor\`} />
      <VStack gap={1}>
        {DOCTOR_CHECKS.map(check => (
          <DoctorCheckRow
            key={check.id}
            check={check}
            copiedId={copiedId}
            onCopy={onCopy}
          />
        ))}
      </VStack>
      <div style={{...styles.logBlock, ...styles.summaryRow}}>
        <TermText color={TERM.red}>1 failed</TermText>
        <TermText color={TERM.dim}> · </TermText>
        <TermText color={TERM.yellow}>1 warning</TermText>
        <TermText color={TERM.dim}> · </TermText>
        <TermText color={TERM.green}>3 passed</TermText>
        <TermText color={TERM.dim}> · 1 skipped</TermText>
      </div>
    </VStack>
  );
}

// ============= PAGE =============

export default function CliNodeDoctorTemplate() {
  // Which connection state the live status line renders (header Selector).
  const [connection, setConnection] = useState<ConnectionState>('connected');

  // Which fix line just copied; feedback resets after 1.8s.
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (copiedId == null) {
      return undefined;
    }
    const timer = setTimeout(() => setCopiedId(null), 1800);
    return () => clearTimeout(timer);
  }, [copiedId]);

  const copyFix = (id: string, command: string) => {
    try {
      void navigator.clipboard?.writeText(command);
    } catch {
      // Clipboard access can be denied in embedded frames; feedback still
      // shows so the interaction reads correctly in the demo.
    }
    setCopiedId(id);
  };

  const connectionMeta = CONNECTION[connection];

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>CLI node doctor</Heading>
                <Text type="supporting" color="secondary">
                  {NODE.name} {NODE.version} on {NODE.machine}
                </Text>
              </HStack>
            </StackItem>
            <StatusDot
              variant={connectionMeta.dot}
              label={\`Node \${connectionMeta.label}\`}
            />
            <Selector
              label="Node connection state"
              isLabelHidden
              size="sm"
              options={CONNECTION_OPTIONS}
              value={connection}
              onChange={value => setConnection(value as ConnectionState)}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <style>{KEYFRAMES}</style>
          <div style={styles.backdrop}>
            {/* Scheme-locked terminal stage: three stacked CLI specimens. */}
            <div style={styles.stage}>
              <div style={styles.titleBar}>
                <span style={styles.titleDot} aria-hidden />
                <span style={styles.titleDot} aria-hidden />
                <span style={styles.titleDot} aria-hidden />
                <span style={styles.titleText}>
                  {NODE.name} — {NODE.folder} — 80×24
                </span>
              </div>
              <div style={styles.stageBody}>
                <StartupHero />
                <LiveLogSpecimen connection={connection} />
                <DoctorSpecimen copiedId={copiedId} onCopy={copyFix} />
              </div>
            </div>
            {/* Caption row: names the surface so it reads in light chrome. */}
            <Text type="supporting" color="secondary">
              relay-node CLI — startup banner, live status line, and
              doctor checklist
            </Text>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};