var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (three agent triage questions — a
 *   hotfix ship decision, a stale-branch cleanup, a TLS-cert renewal —
 *   each with an effort tier, asked-ago label, recommended answer,
 *   workspace + mono session id, a "You last said" anchor quote, 2-3
 *   AGENT FOUND conclusions, decision options, and a snooze-until label)
 * @output A fixed 600×600 smart-glasses triage HUD centered on a token
 *   backdrop: header with a pulsing attention dot, a ‹ › stepper pill
 *   ("Needs you 1/3") that pages through the queue, and a "· 2 working"
 *   counter; per item an effort pill (QUICK YES/NO green / NEEDS REVIEW
 *   amber), 24px question text, a cyan-bordered Recommended panel,
 *   workspace badge + mono session id, the anchor quote, an AGENT FOUND
 *   bullet list, and a decision-chip row where the recommended chip glows
 *   cyan and selection actually moves; bottom cluster has the
 *   selected-action caption, 3 page dots, and a 5-icon glass toolbar
 *   (56px round buttons) — Snooze and Archive fire a toast ("Snoozed
 *   until Tue 9:30 AM" / "Archived") and advance; the 4th step is the
 *   "✓ All clear" empty state
 * @position Page template; emitted by \`astryx template glasses-triage-hud\`
 *
 * Frame: no Layout shell — the page is a token-colored backdrop
 * (var(--color-background-muted)) that centers the fixed HUD stage, with
 * a caption row underneath naming the surface so the template still reads
 * inside light demo chrome.
 *
 * Responsive contract:
 * - The HUD stage is intentionally FIXED at 600×600 (it reproduces a
 *   wearable display, not a fluid web layout); the backdrop centers it
 *   and scrolls when the viewport is narrower — no breakpoint reflow.
 * - Glasses-scale touch targets: toolbar buttons are 56px circles,
 *   decision chips and stepper chevrons are >=40px tall.
 *
 * Color policy: the stage (styles.stage) is a scheme-locked wearable-HUD
 * surface — real glasses displays are black in both themes, so
 * colorScheme is pinned to 'dark' and every color painted inside it (the
 * HUD palette: accent/success/warning/attention cyans and tints) is an
 * intentional raw literal that must NOT be converted to theme tokens.
 * Everything outside the stage (backdrop, caption) uses Astryx tokens.
 */

import {useEffect, useState, type CSSProperties} from 'react';

import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {
  AlarmClockIcon,
  ArchiveIcon,
  BookOpenIcon,
  ExternalLinkIcon,
  Volume2Icon,
} from 'lucide-react';

// ============= HUD PALETTE =============
// Scheme-locked wearable surface: fixed glasses palette, never themed
// tokens — the stage stays black in both light and dark demo chrome.

const HUD = {
  bg: '#000000',
  edge: '#1f272c',
  panel: 'rgba(100, 220, 255, 0.07)',
  text: '#eef4f6',
  dim: '#8fa1a8',
  accent: '#64dcff',
  accentStrong: '#00f0ff',
  success: '#78ff78',
  warning: '#f5eb78',
  attention: '#ff876e',
  error: '#ff7878',
};

const HUD_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

// Keyframes + hover affordances for the hand-styled HUD controls. Subtle,
// fixed-duration animations only — no randomness.
const HUD_CSS = \`
@keyframes gth-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.78); }
}
@keyframes gth-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(0, 240, 255, 0.3); }
  50% { box-shadow: 0 0 16px rgba(0, 240, 255, 0.55); }
}
@keyframes gth-toast-in {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
.gth-tap:hover:not(:disabled) { border-color: #64dcff !important; }
.gth-tap:disabled { opacity: 0.28; cursor: default; }
\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-6)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'auto',
    boxSizing: 'border-box',
  },
  stage: {
    position: 'relative',
    width: 600,
    height: 600,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 22,
    boxSizing: 'border-box',
    backgroundColor: HUD.bg,
    border: \`1px solid \${HUD.edge}\`,
    borderRadius: 28,
    fontFamily: HUD_FONT,
    color: HUD.text,
    colorScheme: 'dark',
    overflow: 'hidden',
  },
  // -------- header --------
  header: {display: 'flex', alignItems: 'center', gap: 10},
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: HUD.attention,
    boxShadow: \`0 0 10px \${HUD.attention}\`,
    animation: 'gth-pulse 1.8s ease-in-out infinite',
    flexShrink: 0,
  },
  headerDotClear: {
    backgroundColor: HUD.success,
    boxShadow: \`0 0 10px \${HUD.success}\`,
    animation: 'none',
  },
  stepperPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    border: \`1px solid \${HUD.edge}\`,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingInline: 4,
  },
  stepperButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: '1px solid transparent',
    borderRadius: 999,
    color: HUD.accent,
    fontSize: 22,
    lineHeight: 1,
    fontFamily: HUD_FONT,
    cursor: 'pointer',
    padding: 0,
  },
  stepperText: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    paddingInline: 4,
  },
  workingText: {fontSize: 12, color: HUD.dim, whiteSpace: 'nowrap'},
  // -------- meta row --------
  metaRow: {display: 'flex', alignItems: 'center', gap: 10},
  effortPill: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    paddingInline: 8,
    paddingBlock: 3,
    borderRadius: 999,
    whiteSpace: 'nowrap',
  },
  effortQuick: {
    color: HUD.success,
    border: \`1px solid rgba(120, 255, 120, 0.45)\`,
    backgroundColor: 'rgba(120, 255, 120, 0.08)',
  },
  effortReview: {
    color: HUD.warning,
    border: \`1px solid rgba(245, 235, 120, 0.45)\`,
    backgroundColor: 'rgba(245, 235, 120, 0.08)',
  },
  askedText: {fontSize: 12, color: HUD.dim},
  // -------- question + recommended --------
  question: {fontSize: 24, lineHeight: 1.25, fontWeight: 600, margin: 0},
  recommendedPanel: {
    border: \`1px solid \${HUD.accent}\`,
    borderRadius: 14,
    backgroundColor: HUD.panel,
    boxShadow: \`inset 3px 0 0 \${HUD.accentStrong}\`,
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: HUD.accent,
  },
  recommendedText: {fontSize: 13.5, lineHeight: 1.45, color: HUD.text},
  // -------- session context --------
  contextRow: {display: 'flex', alignItems: 'center', gap: 8},
  workspaceBadge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: HUD.dim,
    border: \`1px solid \${HUD.edge}\`,
    borderRadius: 6,
    paddingInline: 6,
    paddingBlock: 2,
  },
  sessionId: {fontSize: 12, color: HUD.dim},
  anchorLine: {
    fontSize: 12.5,
    color: HUD.dim,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  anchorQuote: {color: '#c7d3d8', fontStyle: 'italic'},
  findingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  findingRow: {fontSize: 13, lineHeight: 1.45, color: '#d7e2e6'},
  findingBullet: {color: HUD.accent, marginRight: 6},
  // -------- decision chips --------
  chipRow: {display: 'flex', flexWrap: 'wrap', gap: 8},
  chip: {
    minHeight: 42,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 16,
    borderRadius: 999,
    border: '1px solid #39454c',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: '#cfdade',
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: HUD_FONT,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  chipRecommended: {
    border: \`1px solid \${HUD.accent}\`,
    color: HUD.accent,
    animation: 'gth-glow 2.4s ease-in-out infinite',
  },
  chipSelected: {
    border: \`1px solid \${HUD.accentStrong}\`,
    backgroundColor: 'rgba(0, 240, 255, 0.14)',
    color: HUD.accentStrong,
  },
  // -------- bottom cluster --------
  bottomCluster: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  selectedCaption: {fontSize: 12, color: HUD.dim},
  selectedCaptionValue: {color: HUD.accent},
  dotsRow: {display: 'flex', gap: 8},
  pageDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: '#2c363c',
  },
  pageDotActive: {
    backgroundColor: HUD.accentStrong,
    boxShadow: \`0 0 6px \${HUD.accentStrong}\`,
  },
  toolbar: {display: 'flex', gap: 14},
  glassButton: {
    width: 56,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: '1px solid rgba(100, 220, 255, 0.35)',
    backgroundColor: 'rgba(100, 220, 255, 0.08)',
    color: HUD.accent,
    cursor: 'pointer',
    padding: 0,
  },
  // -------- empty state --------
  emptyBody: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyCheck: {
    fontSize: 46,
    lineHeight: 1,
    color: HUD.success,
    textShadow: \`0 0 18px rgba(120, 255, 120, 0.55)\`,
  },
  emptyTitle: {fontSize: 26, fontWeight: 700, margin: 0},
  emptySubtitle: {fontSize: 13.5, color: HUD.dim},
  // -------- toast --------
  toast: {
    position: 'absolute',
    left: '50%',
    bottom: 108,
    transform: 'translateX(-50%)',
    border: \`1px solid \${HUD.accent}\`,
    borderRadius: 999,
    backgroundColor: 'rgba(6, 20, 24, 0.94)',
    boxShadow: '0 0 14px rgba(0, 240, 255, 0.25)',
    paddingInline: 16,
    paddingBlock: 8,
    fontSize: 13,
    color: HUD.text,
    whiteSpace: 'nowrap',
    animation: 'gth-toast-in 0.22s ease-out',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed relative-time strings, fake session ids,
// no clocks, no randomness.

type EffortTier = 'quick' | 'review';

interface DecisionOption {
  id: string;
  label: string;
}

interface TriageItem {
  id: string;
  effort: EffortTier;
  asked: string;
  question: string;
  recommended: string;
  workspace: string;
  sessionId: string;
  lastSaid: string;
  findings: string[];
  options: DecisionOption[];
  recommendedOptionId: string;
  snoozeUntil: string;
}

const WORKING_COUNT_LABEL = '· 2 working';

const TRIAGE_ITEMS: TriageItem[] = [
  {
    id: 'item-hotfix',
    effort: 'quick',
    asked: 'asked 12m ago',
    question: 'Ship hotfix 2.14.1 to production ahead of the full CI run?',
    recommended:
      'Ship now. Only screenshot-diff is red and it has flaked 3 times ' +
      'this week — unit and integration suites are green on the rerun.',
    workspace: 'ATLAS',
    sessionId: '#a1b2c3d4',
    lastSaid: 'Hotfixes can skip visual diffs when unit tests pass.',
    findings: [
      'Unit + integration suites green on rerun #4129',
      'screenshot-diff is the only red job — 3 flakes since Mon',
      'Rollback verified: revert redeploys in under 2 minutes',
    ],
    options: [
      {id: 'ship-now', label: 'Ship now'},
      {id: 'wait-ci', label: 'Wait for CI'},
      {id: 'ask-later', label: 'Ask again in 1h'},
    ],
    recommendedOptionId: 'ship-now',
    snoozeUntil: 'Tue 9:30 AM',
  },
  {
    id: 'item-branches',
    effort: 'review',
    asked: 'asked 34m ago',
    question: 'Delete the 14 stale feature branches older than 90 days?',
    recommended:
      'Archive each as a tag first, then delete — none are referenced ' +
      'by open PRs, deploys, or CI, so nothing breaks.',
    workspace: 'ATLAS',
    sessionId: '#f7e2c910',
    lastSaid: 'Never touch release/* branches — keep those forever.',
    findings: [
      '14 branches idle >90 days; newest commit Apr 2',
      'No open PRs, deploys, or CI refs point at them',
      'release/* branches excluded per your standing rule',
    ],
    options: [
      {id: 'archive-delete', label: 'Archive + delete'},
      {id: 'delete-only', label: 'Delete only'},
      {id: 'keep-all', label: 'Keep all'},
    ],
    recommendedOptionId: 'archive-delete',
    snoozeUntil: 'Wed 8:00 AM',
  },
  {
    id: 'item-cert',
    effort: 'quick',
    asked: 'asked 5m ago',
    question: 'Renew the staging TLS cert with the same 90-day issuer?',
    recommended:
      'Yes — renew with the free issuer and add the auto-renew cron so ' +
      'this question stops coming up every quarter.',
    workspace: 'PERSONAL',
    sessionId: '#0d9b44aa',
    lastSaid: 'Stop paying for 1-year certs; use the free issuer.',
    findings: [
      'staging.helio.dev cert expires Jul 19 — 6 days out',
      'Free-issuer rate limit is fine: 2 of 50 weekly used',
    ],
    options: [
      {id: 'renew', label: 'Renew now'},
      {id: 'switch-issuer', label: 'Switch issuer'},
      {id: 'next-week', label: 'Decide next week'},
    ],
    recommendedOptionId: 'renew',
    snoozeUntil: 'Mon 9:00 AM',
  },
];

// The recommended answer starts selected on every item; tapping another
// decision chip moves the selection.
const INITIAL_SELECTIONS: Record<string, string> = Object.fromEntries(
  TRIAGE_ITEMS.map(item => [item.id, item.recommendedOptionId]),
);

const EMPTY_STEP_INDEX = TRIAGE_ITEMS.length; // 4th step: all clear

// ============= GLASS TOOLBAR BUTTON =============

function GlassButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: typeof BookOpenIcon;
  onClick: () => void;
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        aria-label={label}
        className="gth-tap"
        style={styles.glassButton}
        onClick={onClick}>
        <Icon icon={icon} size="md" color="inherit" />
      </button>
    </Tooltip>
  );
}

// ============= PAGE =============

export default function GlassesTriageHudTemplate() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState(INITIAL_SELECTIONS);
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );

  // Auto-dismiss the toast; re-arms when a new toast replaces it.
  useEffect(() => {
    if (toast == null) {
      return undefined;
    }
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string) => {
    setToast(prev => ({key: prev == null ? 1 : prev.key + 1, message}));
  };

  const goToPrevious = () => setStepIndex(prev => Math.max(prev - 1, 0));
  const goToNext = () =>
    setStepIndex(prev => Math.min(prev + 1, EMPTY_STEP_INDEX));

  const item = stepIndex < EMPTY_STEP_INDEX ? TRIAGE_ITEMS[stepIndex] : null;
  const selectedOption =
    item == null
      ? null
      : item.options.find(option => option.id === selections[item.id]) ?? null;

  const selectOption = (itemId: string, optionId: string) => {
    setSelections(prev => ({...prev, [itemId]: optionId}));
  };

  const snoozeCurrent = () => {
    if (item == null) {
      return;
    }
    showToast(\`Snoozed until \${item.snoozeUntil}\`);
    goToNext();
  };

  const archiveCurrent = () => {
    if (item == null) {
      return;
    }
    showToast('Archived');
    goToNext();
  };

  return (
    <div style={styles.page}>
      <style>{HUD_CSS}</style>

      <div style={styles.stage}>
        {/* Header: attention dot + stepper pill + working counter. */}
        <div style={styles.header}>
          <span
            style={
              item == null
                ? {...styles.headerDot, ...styles.headerDotClear}
                : styles.headerDot
            }
            aria-hidden
          />
          <div style={styles.stepperPill}>
            <button
              type="button"
              aria-label="Previous item"
              className="gth-tap"
              style={styles.stepperButton}
              disabled={stepIndex === 0}
              onClick={goToPrevious}>
              ‹
            </button>
            <span style={styles.stepperText}>
              {item == null
                ? 'All clear'
                : \`Needs you \${stepIndex + 1}/\${TRIAGE_ITEMS.length}\`}
            </span>
            <button
              type="button"
              aria-label="Next item"
              className="gth-tap"
              style={styles.stepperButton}
              disabled={stepIndex === EMPTY_STEP_INDEX}
              onClick={goToNext}>
              ›
            </button>
          </div>
          <span style={styles.workingText}>{WORKING_COUNT_LABEL}</span>
        </div>

        {item != null ? (
          <>
            {/* Effort tier + asked-ago. */}
            <div style={styles.metaRow}>
              <span
                style={{
                  ...styles.effortPill,
                  ...(item.effort === 'quick'
                    ? styles.effortQuick
                    : styles.effortReview),
                }}>
                {item.effort === 'quick' ? 'QUICK YES/NO' : 'NEEDS REVIEW'}
              </span>
              <span style={styles.askedText}>{item.asked}</span>
            </div>

            <p style={styles.question}>{item.question}</p>

            <div style={styles.recommendedPanel}>
              <span style={styles.eyebrow}>RECOMMENDED</span>
              <span style={styles.recommendedText}>{item.recommended}</span>
            </div>

            <div style={styles.contextRow}>
              <span style={styles.workspaceBadge}>{item.workspace}</span>
              <span style={styles.sessionId}>{item.sessionId}</span>
            </div>

            <div style={styles.anchorLine}>
              You last said{' '}
              <span style={styles.anchorQuote}>“{item.lastSaid}”</span>
            </div>

            <div>
              <span style={styles.eyebrow}>AGENT FOUND</span>
              <ul style={styles.findingsList}>
                {item.findings.map(finding => (
                  <li key={finding} style={styles.findingRow}>
                    <span style={styles.findingBullet} aria-hidden>
                      •
                    </span>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            {/* Decision chips: recommended glows cyan; selection moves. */}
            <div style={styles.chipRow}>
              {item.options.map(option => {
                const isSelected = option.id === selections[item.id];
                const isRecommended = option.id === item.recommendedOptionId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={isSelected}
                    className="gth-tap"
                    style={{
                      ...styles.chip,
                      ...(isRecommended ? styles.chipRecommended : null),
                      ...(isSelected ? styles.chipSelected : null),
                    }}
                    onClick={() => selectOption(item.id, option.id)}>
                    {isSelected ? '✓ ' : ''}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div style={styles.emptyBody}>
            <span style={styles.emptyCheck} aria-hidden>
              ✓
            </span>
            <p style={styles.emptyTitle}>All clear</p>
            <span style={styles.emptySubtitle}>
              Nothing needs your attention
            </span>
          </div>
        )}

        {/* Bottom cluster: caption, page dots, glass toolbar. */}
        <div style={styles.bottomCluster}>
          {selectedOption != null && (
            <span style={styles.selectedCaption}>
              Selected:{' '}
              <span style={styles.selectedCaptionValue}>
                {selectedOption.label}
              </span>{' '}
              — Speak to confirm
            </span>
          )}
          <div style={styles.dotsRow} aria-hidden>
            {TRIAGE_ITEMS.map((dotItem, index) => (
              <span
                key={dotItem.id}
                style={
                  index === stepIndex
                    ? {...styles.pageDot, ...styles.pageDotActive}
                    : styles.pageDot
                }
              />
            ))}
          </div>
          {item != null && (
            <div style={styles.toolbar}>
              <GlassButton
                label="Read context"
                icon={BookOpenIcon}
                onClick={() => showToast('Reading session context aloud…')}
              />
              <GlassButton
                label="Speak response"
                icon={Volume2Icon}
                onClick={() =>
                  showToast(
                    selectedOption == null
                      ? 'Speaking response…'
                      : \`Sending “\${selectedOption.label}”…\`,
                  )
                }
              />
              <GlassButton
                label="Open session"
                icon={ExternalLinkIcon}
                onClick={() => {}}
              />
              <GlassButton
                label="Snooze"
                icon={AlarmClockIcon}
                onClick={snoozeCurrent}
              />
              <GlassButton
                label="Archive"
                icon={ArchiveIcon}
                onClick={archiveCurrent}
              />
            </div>
          )}
        </div>

        {toast != null && (
          <div key={toast.key} role="status" style={styles.toast}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Caption row: keeps the black stage legible in light demo chrome. */}
      <VStack gap={0} hAlign="center">
        <Text type="supporting" color="secondary">
          Smart-glasses triage HUD — fixed 600 × 600 wearable stage
        </Text>
      </VStack>
    </div>
  );
}
`;export{e as default};