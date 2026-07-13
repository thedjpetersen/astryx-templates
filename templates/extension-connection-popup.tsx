// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (connection-status metadata, a pending
 *   page-access request with a suggested URL pattern, node id, permission
 *   summary, fixed version strings)
 * @output A 360px browser-extension popup card ("Relay / Browser node")
 *   centered on a token backdrop: gradient "N" logo mark with a status dot
 *   whose color/pulse/glow follow a page-chrome Selector (Connected /
 *   Connecting / Delegating / Controlling / Needs attention / Disconnected —
 *   Controlling adds a glowing ring around the logo); body stacks an
 *   update banner, a pending page-access panel with Approve/Block, a node-id
 *   row with copy feedback, a Relay URL connect form, Stop/Disconnect and
 *   Annotate actions, a "Relay cursor" Switch card, a permissions row, and a
 *   local-check footer with an Open Relay button
 * @position Page template; emitted by `astryx template extension-connection-popup`
 *
 * Frame: no Layout shell — a token-based page backdrop
 * (var(--color-background-muted)) with normal page chrome (Text + Selector)
 * above a fixed-palette dark popup stage, and a caption row underneath
 * naming the surface. The fixed dark palette via inline styles is
 * intentional: real extension chrome is dark in both demo themes.
 *
 * Responsive contract:
 * - The popup is a fixed 360px single column (that IS the surface being
 *   recreated), centered horizontally; the page scrolls vertically when
 *   short. No breakpoint behavior needed, so no width measurement.
 * - All controls inside the popup are full-height 32px+ rows; icon-only
 *   buttons carry aria-labels.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {Text} from '@astryxdesign/core/Text';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  XIcon,
} from 'lucide-react';

// ============= PALETTE (fixed extension chrome — dark in both themes) ====

const C = {
  bg: '#0f1115',
  panel: '#171a21',
  panelDeep: '#0b0d11',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',
  text: '#e6e9f0',
  dim: '#8b93a3',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  gray: '#6b7280',
} as const;

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

// Keyframes for the status-dot pulse and the "Controlling" logo ring.
// Subtle, loop-stable, no randomness.
const STAGE_CSS = `
@keyframes ecp-dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.78); }
}
@keyframes ecp-ring-pulse {
  0% { transform: scale(1); opacity: 0.85; }
  70% { transform: scale(1.22); opacity: 0; }
  100% { transform: scale(1.22); opacity: 0; }
}
.ecp-btn { cursor: pointer; transition: filter 120ms ease; }
.ecp-btn:hover { filter: brightness(1.18); }
.ecp-btn:active { filter: brightness(0.92); }
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
  },
  pageInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-4)',
    padding: 'var(--spacing-6)',
  },
  chromeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  popup: {
    width: 360,
    backgroundColor: C.bg,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: 14,
    boxShadow: '0 18px 48px rgba(0, 0, 0, 0.45)',
    color: C.text,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: 12,
    lineHeight: 1.45,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 14px 12px',
    borderBottom: `1px solid ${C.border}`,
  },
  logoWrap: {position: 'relative', width: 40, height: 40, flexShrink: 0},
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 700,
    color: '#ffffff',
    position: 'relative',
  },
  logoRing: {
    position: 'absolute',
    inset: -5,
    borderRadius: 14,
    border: `2px solid ${C.green}`,
    animation: 'ecp-ring-pulse 1.8s ease-out infinite',
    pointerEvents: 'none',
  },
  statusDot: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: `2px solid ${C.bg}`,
  },
  headerText: {flex: 1, minWidth: 0},
  productName: {fontSize: 14, fontWeight: 600, color: C.text},
  statusLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    fontSize: 11,
  },
  version: {fontFamily: MONO, fontSize: 11, color: C.dim, flexShrink: 0},
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 14,
  },
  banner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '9px 10px',
    borderRadius: 9,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(59, 130, 246, 0.35)',
  },
  panel: {
    padding: '10px 12px',
    borderRadius: 9,
    backgroundColor: C.panel,
    border: `1px solid ${C.border}`,
  },
  accessPanel: {
    padding: '10px 12px',
    borderRadius: 9,
    backgroundColor: C.panel,
    border: '1px solid rgba(239, 68, 68, 0.4)',
  },
  patternChip: {
    fontFamily: MONO,
    fontSize: 11,
    color: C.text,
    backgroundColor: C.panelDeep,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    padding: '4px 7px',
    display: 'inline-block',
    wordBreak: 'break-all',
  },
  row: {display: 'flex', alignItems: 'center', gap: 8},
  mono: {fontFamily: MONO, fontSize: 11},
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: C.panelDeep,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: 8,
    padding: '7px 9px',
    fontFamily: MONO,
    fontSize: 11,
    color: C.text,
    outline: 'none',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: C.dim,
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: '12px 14px 14px',
    borderTop: `1px solid ${C.border}`,
  },
  footerCaption: {fontSize: 11, color: C.dim, textAlign: 'center'},
};

// ============= DATA =============
// Deterministic fixtures: fixed ids and versions, no clocks, no randomness.

const PRODUCT_NAME = 'Relay';
const CURRENT_VERSION = 'v1.4.2';
const AVAILABLE_VERSION = 'v1.4.3';
const NODE_ID = 'browser:7f3a92c1';
const RELAY_URL_DEFAULT = 'https://relaybot.dev';
const ACCESS_URL = 'https://app.example.com/checkout/review';
const ACCESS_PATTERN = '^https://app\\.example\\.com/.*';

type ConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'delegating'
  | 'controlling'
  | 'attention'
  | 'disconnected';

interface StatusMeta {
  label: string;
  hint: string;
  dotColor: string;
  /** Soft glow behind the status dot. */
  hasGlow: boolean;
  /** Opacity/scale pulse on the status dot. */
  hasPulse: boolean;
  /** Animated ring around the logo mark (Controlling only). */
  hasLogoRing: boolean;
}

const STATUS_META: Record<ConnectionStatus, StatusMeta> = {
  connected: {
    label: 'Connected',
    hint: 'Linked to relaybot.dev',
    dotColor: C.blue,
    hasGlow: true,
    hasPulse: false,
    hasLogoRing: false,
  },
  connecting: {
    label: 'Connecting',
    hint: 'Opening a tunnel to relaybot.dev…',
    dotColor: C.blue,
    hasGlow: false,
    hasPulse: true,
    hasLogoRing: false,
  },
  delegating: {
    label: 'Delegating to Relay',
    hint: 'Handing this page to the agent…',
    dotColor: C.blue,
    hasGlow: true,
    hasPulse: true,
    hasLogoRing: false,
  },
  controlling: {
    label: 'Controlling',
    hint: 'Relay is driving this tab',
    dotColor: C.green,
    hasGlow: true,
    hasPulse: false,
    hasLogoRing: true,
  },
  attention: {
    label: 'Needs attention',
    hint: 'A page-access request is waiting',
    dotColor: C.red,
    hasGlow: true,
    hasPulse: false,
    hasLogoRing: false,
  },
  disconnected: {
    label: 'Disconnected',
    hint: 'Not linked to a Relay server',
    dotColor: C.gray,
    hasGlow: false,
    hasPulse: false,
    hasLogoRing: false,
  },
};

const STATUS_OPTIONS: Array<{value: ConnectionStatus; label: string}> = [
  {value: 'connected', label: 'Connected'},
  {value: 'connecting', label: 'Connecting'},
  {value: 'delegating', label: 'Delegating to Relay'},
  {value: 'controlling', label: 'Controlling'},
  {value: 'attention', label: 'Needs attention'},
  {value: 'disconnected', label: 'Disconnected'},
];

// ============= POPUP BUTTON =============

type PopupButtonTone = 'primary' | 'success' | 'danger' | 'neutral';

const BUTTON_TONE_STYLE: Record<PopupButtonTone, CSSProperties> = {
  primary: {
    backgroundColor: C.blue,
    border: '1px solid transparent',
    color: '#ffffff',
  },
  success: {
    backgroundColor: C.green,
    border: '1px solid transparent',
    color: '#06230f',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    color: C.red,
  },
  neutral: {
    backgroundColor: C.panel,
    border: `1px solid ${C.borderStrong}`,
    color: C.text,
  },
};

function PopupButton({
  label,
  tone = 'neutral',
  isFullWidth = false,
  onClick,
  endGlyph,
}: {
  label: string;
  tone?: PopupButtonTone;
  isFullWidth?: boolean;
  onClick: () => void;
  endGlyph?: ReactNode;
}) {
  return (
    <button
      type="button"
      className="ecp-btn"
      onClick={onClick}
      style={{
        ...BUTTON_TONE_STYLE[tone],
        borderRadius: 8,
        padding: '7px 12px',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: isFullWidth ? '100%' : undefined,
        flex: isFullWidth ? undefined : 1,
      }}>
      {label}
      {endGlyph}
    </button>
  );
}

// ============= PAGE =============

export default function ExtensionConnectionPopupTemplate() {
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [isUpdateBannerVisible, setIsUpdateBannerVisible] = useState(true);
  // 'pending' shows the access panel; approve/block collapse it to a
  // one-line result row.
  const [accessDecision, setAccessDecision] = useState<
    'pending' | 'approved' | 'blocked'
  >('pending');
  const [relayUrl, setRelayUrl] = useState(RELAY_URL_DEFAULT);
  const [isCursorEnabled, setIsCursorEnabled] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current != null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyNodeId = () => {
    try {
      void navigator.clipboard?.writeText(NODE_ID);
    } catch {
      // Clipboard access can be blocked in embedded stages; the UI
      // feedback below is the point of the interaction.
    }
    setIsCopied(true);
    if (copyTimeoutRef.current != null) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => setIsCopied(false), 1600);
  };

  const meta = STATUS_META[status];

  const statusDotStyle: CSSProperties = {
    ...styles.statusDot,
    backgroundColor: meta.dotColor,
    boxShadow: meta.hasGlow ? `0 0 8px 1px ${meta.dotColor}` : undefined,
    animation: meta.hasPulse
      ? 'ecp-dot-pulse 1.4s ease-in-out infinite'
      : undefined,
  };

  const inlineDotStyle: CSSProperties = {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
    backgroundColor: meta.dotColor,
    boxShadow: meta.hasGlow ? `0 0 6px ${meta.dotColor}` : undefined,
    animation: meta.hasPulse
      ? 'ecp-dot-pulse 1.4s ease-in-out infinite'
      : undefined,
  };

  return (
    <div style={styles.page}>
      <style>{STAGE_CSS}</style>
      <div style={styles.pageInner}>
        {/* Page chrome: state switcher lives OUTSIDE the dark stage. */}
        <div style={styles.chromeRow}>
          <Text type="label" size="sm" color="secondary">
            Connection state
          </Text>
          <Selector
            label="Connection state"
            isLabelHidden
            size="sm"
            options={STATUS_OPTIONS}
            value={status}
            onChange={value => setStatus(value as ConnectionStatus)}
          />
        </div>

        {/* The 360px extension popup stage. */}
        <div style={styles.popup}>
          {/* Header: gradient logo mark + product identity + version. */}
          <div style={styles.header}>
            <div style={styles.logoWrap}>
              {meta.hasLogoRing && <div style={styles.logoRing} aria-hidden />}
              <div style={styles.logo} aria-hidden>
                N
              </div>
              <div style={statusDotStyle} aria-hidden />
            </div>
            <div style={styles.headerText}>
              <div style={styles.productName}>{PRODUCT_NAME}</div>
              <div style={styles.statusLine}>
                <span style={{color: C.dim}}>Browser node</span>
                <span style={{color: C.dim}}>·</span>
                <span style={inlineDotStyle} aria-hidden />
                <span style={{color: meta.dotColor, fontWeight: 600}}>
                  {meta.label}
                </span>
              </div>
              <div style={{fontSize: 10, color: C.dim, marginTop: 1}}>
                {meta.hint}
              </div>
            </div>
            <span style={styles.version}>{CURRENT_VERSION}</span>
          </div>

          <div style={styles.body}>
            {/* Update banner. */}
            {isUpdateBannerVisible && (
              <div style={styles.banner}>
                <span aria-hidden style={{fontSize: 13, lineHeight: '16px'}}>
                  ✨
                </span>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                    <span style={{fontWeight: 600, color: C.text}}>
                      Update available
                    </span>
                    <span style={{...styles.mono, color: C.blue}}>
                      {AVAILABLE_VERSION}
                    </span>
                  </div>
                  <div style={{fontSize: 11, color: C.dim, marginTop: 1}}>
                    Update from{' '}
                    <span style={styles.mono}>chrome://extensions</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="ecp-btn"
                  aria-label="Dismiss update banner"
                  onClick={() => setIsUpdateBannerVisible(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 2,
                    display: 'flex',
                    color: C.dim,
                  }}>
                  <XIcon size={13} color="currentColor" />
                </button>
              </div>
            )}

            {/* Pending page-access request. */}
            {accessDecision === 'pending' ? (
              <div style={styles.accessPanel}>
                <div style={{fontWeight: 600, color: C.text}}>
                  {PRODUCT_NAME} needs page access
                </div>
                <div
                  style={{
                    ...styles.mono,
                    color: C.dim,
                    marginTop: 3,
                    wordBreak: 'break-all',
                  }}>
                  {ACCESS_URL}
                </div>
                <div style={{marginTop: 8}}>
                  <div style={styles.fieldLabel}>Suggested pattern</div>
                  <div style={{marginTop: 4}}>
                    <span style={styles.patternChip}>{ACCESS_PATTERN}</span>
                  </div>
                </div>
                <div style={{...styles.row, marginTop: 10}}>
                  <PopupButton
                    label="Approve"
                    tone="success"
                    onClick={() => setAccessDecision('approved')}
                  />
                  <PopupButton
                    label="Block"
                    tone="danger"
                    onClick={() => setAccessDecision('blocked')}
                  />
                </div>
              </div>
            ) : (
              <div style={{...styles.panel, ...styles.row}}>
                {accessDecision === 'approved' ? (
                  <>
                    <CheckIcon size={13} color={C.green} />
                    <span style={{color: C.green, fontWeight: 600}}>
                      Pattern approved
                    </span>
                    <span style={{...styles.mono, color: C.dim, minWidth: 0}}>
                      {ACCESS_PATTERN}
                    </span>
                  </>
                ) : (
                  <>
                    <XIcon size={13} color={C.red} />
                    <span style={{color: C.red, fontWeight: 600}}>
                      Page blocked
                    </span>
                    <span style={{...styles.mono, color: C.dim, minWidth: 0}}>
                      app.example.com
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Node id + copy. */}
            <div style={{...styles.panel, ...styles.row}}>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={styles.fieldLabel}>Node ID</div>
                <div style={{...styles.mono, color: C.text, marginTop: 2}}>
                  {NODE_ID}
                </div>
              </div>
              <button
                type="button"
                className="ecp-btn"
                aria-label={isCopied ? 'Node ID copied' : 'Copy node ID'}
                onClick={handleCopyNodeId}
                style={{
                  ...BUTTON_TONE_STYLE.neutral,
                  borderRadius: 7,
                  padding: '5px 9px',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  color: isCopied ? C.green : C.text,
                }}>
                {isCopied ? (
                  <CheckIcon size={12} color="currentColor" />
                ) : (
                  <CopyIcon size={12} color="currentColor" />
                )}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Connect form. */}
            <div>
              <label htmlFor="ecp-relay-url" style={styles.fieldLabel}>
                Relay URL
              </label>
              <div style={{...styles.row, marginTop: 4}}>
                <input
                  id="ecp-relay-url"
                  style={styles.input}
                  value={relayUrl}
                  onChange={event => setRelayUrl(event.target.value)}
                  spellCheck={false}
                />
                <PopupButton
                  label="Connect"
                  tone="primary"
                  onClick={() => setStatus('connecting')}
                />
              </div>
            </div>

            {/* Session controls. */}
            <div style={styles.row}>
              <PopupButton label="Stop" onClick={() => {}} />
              <PopupButton
                label="Disconnect"
                tone="danger"
                onClick={() => setStatus('disconnected')}
              />
            </div>
            <PopupButton label="Annotate page" isFullWidth onClick={() => {}} />

            {/* Relay cursor toggle. */}
            <div style={{...styles.panel, ...styles.row}}>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontWeight: 600, color: C.text}}>
                  {PRODUCT_NAME} cursor
                </div>
                <div style={{fontSize: 11, color: C.dim, marginTop: 1}}>
                  Show a Relay-blue pointer where {PRODUCT_NAME} clicks and
                  focuses.
                </div>
              </div>
              <Switch
                label={`Show ${PRODUCT_NAME} cursor`}
                isLabelHidden
                value={isCursorEnabled}
                onChange={setIsCursorEnabled}
              />
            </div>

            {/* Permissions summary. */}
            <div style={{...styles.panel, ...styles.row}}>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontWeight: 600, color: C.text}}>Permissions</div>
                <div style={{fontSize: 11, color: C.dim, marginTop: 1}}>
                  3 host patterns · tabs, scripting
                </div>
              </div>
              <PopupButton label="Manage" onClick={() => {}} />
            </div>
          </div>

          {/* Footer. */}
          <div style={styles.footer}>
            <div style={styles.footerCaption}>
              Commands are checked locally before Chrome is controlled.
            </div>
            <PopupButton
              label={`Open ${PRODUCT_NAME}`}
              tone="primary"
              isFullWidth
              onClick={() => {}}
              endGlyph={<ExternalLinkIcon size={12} color="currentColor" />}
            />
          </div>
        </div>

        {/* Caption row: keeps the dark stage legible in light demo chrome. */}
        <Text type="supporting" color="secondary">
          Browser extension popup — 360px node-connection surface
        </Text>
      </div>
    </div>
  );
}
