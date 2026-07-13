// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (coupon-bug transcript, terminal log
 *   lines, a unified diff for api/routes.ts, image-generation states, a
 *   schematic browser screenshot layout, background-process log, sub-agent
 *   results, and a hook-blocked error record — all with fixed timestamps)
 * @output Full-height agent chat where each assistant turn introduces one
 *   specialized tool-result renderer: a terminal-tinted bash block with a
 *   "View full output" Dialog, an edit card with +12 −3 stats and a unified
 *   diff, generating/finished image cards (CSS keyframe shimmer), a browser
 *   card with a schematic screenshot mock and highlighted rectangle, an
 *   expandable background-process pill, sub-agent result pills under a group
 *   header, and a destructive-tinted error collapsible. Every renderer sits
 *   in a shared shell row (tool icon, node chip, summary, duration, status
 *   icon); two cards carry hook pills (block / rewrite) and auto-expand.
 * @position Page template; emitted by `astryx template agent-tool-renderer-gallery`
 *
 * Frame: Layout height="fill". LayoutHeader carries the session chrome
 * (title, agent status, node chip). LayoutContent (padding 0) hosts a
 * centered ChatLayout — transcript scrolls, composer stays pinned. The
 * complement of ai-chat-tool-stream: that surface piles many uniform calls;
 * this one gives each tool its OWN bespoke result card.
 *
 * Responsive contract:
 * - Conversation column: maxWidth 880, centered; only the transcript
 *   scrolls — header and composer are fixed chrome.
 * - Width measured with a local ResizeObserver (useElementWidth), not
 *   viewport media queries, so the layout adapts inside inline stages.
 * - >720px: shell rows show the full "Ran in 1.5s" duration and message
 *   timestamps; image cards sit side by side at 200px.
 * - <=720px: durations shorten to "1.5s", the header node chip hides,
 *   image cards shrink to 160px and wrap, and composer touch targets grow
 *   to 40px hit boxes.
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
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {
  BotIcon,
  CheckIcon,
  CirclePlayIcon,
  GlobeIcon,
  ImageIcon,
  LaptopIcon,
  PaperclipIcon,
  ReplaceIcon,
  SendIcon,
  ShieldIcon,
  SquarePenIcon,
  TerminalIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

// ============= RESPONSIVE HELPER =============
// Demo stages render pages in an inline frame narrower than the window, so
// viewport media queries never fire there; measure the page itself instead.

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

// ============= STYLES =============

// Fixed terminal palette — real terminals are dark in both themes.
const TERM = {
  bg: '#0d1117',
  border: '#30363d',
  text: '#e6edf3',
  dim: '#8b949e',
  cyan: '#39c5cf',
  green: '#3fb950',
  red: '#f85149',
};

const MONO_STACK = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const styles: Record<string, CSSProperties> = {
  measureWrap: {height: '100%'},
  chatColumn: {height: '100%', maxWidth: 880, marginInline: 'auto'},
  // Shared shell chrome around every renderer.
  shellCardBody: {marginTop: 'var(--spacing-2)'},
  shellSummary: {minWidth: 0},
  nodeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 1,
    flexShrink: 0,
  },
  hookPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 2,
    flexShrink: 0,
  },
  hookPillBlock: {
    backgroundColor: 'var(--color-warning-muted)',
    border: 'var(--border-width) solid var(--color-warning)',
  },
  hookPillRewrite: {
    backgroundColor: 'var(--color-accent-muted)',
    border: 'var(--border-width) solid var(--color-accent)',
  },
  hookShieldRing: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: '1.5px solid var(--color-warning)',
  },
  hookNote: {
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-accent-muted)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  // (a) bash — terminal-tinted block.
  terminal: {
    backgroundColor: TERM.bg,
    border: `1px solid ${TERM.border}`,
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
    fontFamily: MONO_STACK,
    fontSize: 12.5,
    lineHeight: 1.65,
    overflowX: 'auto',
  },
  terminalLine: {whiteSpace: 'pre'},
  dialogBody: {padding: 'var(--spacing-4)'},
  // (b) edit — unified diff.
  diffBlock: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  diffRow: {
    display: 'flex',
    alignItems: 'stretch',
    fontFamily: MONO_STACK,
    fontSize: 12.5,
    lineHeight: 1.7,
  },
  diffGutter: {
    width: 26,
    flexShrink: 0,
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
  },
  diffText: {whiteSpace: 'pre', color: 'var(--color-text-primary)'},
  diffRowAdd: {backgroundColor: 'var(--color-success-muted)'},
  diffRowDel: {backgroundColor: 'var(--color-error-muted)'},
  diffRowHunk: {backgroundColor: 'var(--color-background-muted)'},
  diffGutterAdd: {color: 'var(--color-success)'},
  diffGutterDel: {color: 'var(--color-error)'},
  diffHunkText: {whiteSpace: 'pre', color: 'var(--color-text-secondary)'},
  addStat: {color: 'var(--color-success)'},
  delStat: {color: 'var(--color-error)'},
  // (c) image generation.
  imageRow: {flexWrap: 'wrap'},
  imageSquare: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    position: 'relative',
    overflow: 'hidden',
  },
  imageGenerating: {
    background:
      'radial-gradient(circle at 32% 30%, var(--color-accent-muted), var(--color-background-muted) 70%)',
  },
  imageShimmer: {
    position: 'absolute',
    inset: '-40%',
    background:
      'radial-gradient(circle at 50% 50%, var(--color-accent-muted), transparent 60%)',
    animation: 'atrgShimmer 2.8s ease-in-out infinite',
  },
  imageGeneratingCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFinished: {
    background:
      'radial-gradient(circle at 78% 22%, rgba(255,255,255,0.35), transparent 42%), ' +
      'radial-gradient(circle at 22% 80%, rgba(20,30,80,0.35), transparent 52%), ' +
      'linear-gradient(135deg, #7c5cff 0%, #4f9cf9 48%, #38d0c4 100%)',
  },
  // (d) browser screenshot mock.
  browserFrame: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-card)',
  },
  browserBar: {
    backgroundColor: 'var(--color-background-muted)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  trafficDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  urlPill: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 999,
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 1,
    minWidth: 0,
  },
  browserPage: {padding: 'var(--spacing-4)'},
  mockBar: {
    backgroundColor: 'var(--color-skeleton)',
    borderRadius: 4,
    height: 10,
  },
  mockTile: {
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 6,
    height: 56,
    flex: 1,
  },
  highlightRect: {
    border: '2px solid var(--color-accent)',
    backgroundColor: 'var(--color-accent-muted)',
    borderRadius: 6,
    padding: 'var(--spacing-2)',
    position: 'relative',
  },
  highlightLabel: {
    position: 'absolute',
    top: -9,
    right: 8,
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 4,
  },
  // (e)/(f) pills.
  pillRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 999,
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
  },
  pillBody: {
    marginTop: 'var(--spacing-1)',
    marginInline: 'var(--spacing-2)',
  },
  subAgentGroup: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  // (g) error block.
  errorCard: {
    border: 'var(--border-width) solid var(--color-error)',
    backgroundColor: 'var(--color-error-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  errorDetail: {
    fontFamily: MONO_STACK,
    fontSize: 12.5,
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
    color: 'var(--color-text-primary)',
    marginTop: 'var(--spacing-2)',
  },
  // Composer.
  composerArea: {paddingTop: 'var(--spacing-2)'},
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
  iconTapTarget: {width: 40, height: 40},
  buttonTapTarget: {height: 40},
  rendererStack: {marginTop: 'var(--spacing-2)'},
};

// Keyframes for the image-generation shimmer; injected once via <style>.
const KEYFRAMES_CSS = `
@keyframes atrgShimmer {
  0% { transform: translate(-12%, -8%) scale(0.9); opacity: 0.55; }
  50% { transform: translate(10%, 8%) scale(1.08); opacity: 0.95; }
  100% { transform: translate(-12%, -8%) scale(0.9); opacity: 0.55; }
}
`;

// ============= DATA =============
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const SESSION_TITLE = 'expired-coupon checkout bug';
const ASSISTANT_NAME = 'Atlas Operator';

type TermTone = 'cmd' | 'out' | 'dim' | 'ok' | 'fail';

interface TermLine {
  id: string;
  tone: TermTone;
  text: string;
}

const TERM_TONE_COLOR: Record<TermTone, string> = {
  cmd: TERM.cyan,
  out: TERM.text,
  dim: TERM.dim,
  ok: TERM.green,
  fail: TERM.red,
};

const BASH_PREVIEW_LINES: TermLine[] = [
  {id: 'b-1', tone: 'cmd', text: '$ pnpm test --filter api'},
  {id: 'b-2', tone: 'dim', text: '> api@2.4.1 test /repos/atlas/api'},
  {id: 'b-3', tone: 'ok', text: 'PASS  api/cart.test.ts (1.21 s)'},
  {id: 'b-4', tone: 'ok', text: 'PASS  api/inventory.test.ts (0.84 s)'},
  {id: 'b-5', tone: 'fail', text: 'FAIL  api/coupons.test.ts'},
  {
    id: 'b-6',
    tone: 'out',
    text: '  ✕ rejects expired coupons at checkout (48 ms)',
  },
  {
    id: 'b-7',
    tone: 'dim',
    text: '    expected 422 "Unprocessable Entity", received 500',
  },
];

const BASH_FULL_LINES: TermLine[] = [
  ...BASH_PREVIEW_LINES,
  {
    id: 'b-8',
    tone: 'dim',
    text: '    at Object.<anonymous> (api/coupons.test.ts:118:29)',
  },
  {id: 'b-9', tone: 'ok', text: 'PASS  api/payments.test.ts (2.02 s)'},
  {id: 'b-10', tone: 'ok', text: 'PASS  api/shipping.test.ts (0.66 s)'},
  {id: 'b-11', tone: 'ok', text: 'PASS  api/tax.test.ts (0.41 s)'},
  {id: 'b-12', tone: 'out', text: ''},
  {
    id: 'b-13',
    tone: 'out',
    text: 'Test Suites: 1 failed, 5 passed, 6 total',
  },
  {id: 'b-14', tone: 'out', text: 'Tests:       1 failed, 34 passed, 35 total'},
  {id: 'b-15', tone: 'out', text: 'Snapshots:   0 total'},
  {id: 'b-16', tone: 'out', text: 'Time:        8.42 s'},
  {
    id: 'b-17',
    tone: 'dim',
    text: 'Ran all test suites matching /api/i.',
  },
];

type DiffKind = 'hunk' | 'ctx' | 'add' | 'del';

interface DiffRow {
  id: string;
  kind: DiffKind;
  text: string;
}

// +12 −3 against api/routes.ts.
const EDIT_DIFF_ROWS: DiffRow[] = [
  {
    id: 'd-0',
    kind: 'hunk',
    text: "@@ -41,7 +41,16 @@ router.post('/checkout/apply-coupon')",
  },
  {id: 'd-1', kind: 'ctx', text: '  const coupon = await store.coupons.find(code);'},
  {id: 'd-2', kind: 'add', text: '  const now = clock.now();'},
  {id: 'd-3', kind: 'del', text: '  if (coupon == null) {'},
  {id: 'd-4', kind: 'del', text: "    return res.status(500).send('coupon lookup failed');"},
  {id: 'd-5', kind: 'del', text: '  }'},
  {id: 'd-6', kind: 'add', text: '  if (coupon == null) {'},
  {id: 'd-7', kind: 'add', text: "    return res.status(404).json({error: 'coupon_not_found'});"},
  {id: 'd-8', kind: 'add', text: '  }'},
  {id: 'd-9', kind: 'add', text: '  if (coupon.expiresAt != null && coupon.expiresAt < now) {'},
  {id: 'd-10', kind: 'add', text: "    return res.status(422).json({error: 'coupon_expired'});"},
  {id: 'd-11', kind: 'add', text: '  }'},
  {id: 'd-12', kind: 'add', text: '  if (order.total < coupon.minimumTotal) {'},
  {id: 'd-13', kind: 'add', text: "    return res.status(422).json({error: 'below_minimum_total'});"},
  {id: 'd-14', kind: 'add', text: '  }'},
  {id: 'd-15', kind: 'ctx', text: '  order.applyDiscount(coupon);'},
  {id: 'd-16', kind: 'add', text: "  metrics.count('checkout.coupon_applied');"},
  {id: 'd-17', kind: 'add', text: "  audit.log('coupon.apply', {code, orderId: order.id});"},
  {id: 'd-18', kind: 'ctx', text: '  return res.status(200).json(order.summary());'},
];

const BACKGROUND_LOG_LINES: TermLine[] = [
  {id: 'g-1', tone: 'cmd', text: '$ pnpm build'},
  {id: 'g-2', tone: 'dim', text: 'building 214 modules…'},
  {id: 'g-3', tone: 'ok', text: '✓ client bundle 412 kB (gzip 128 kB)'},
  {id: 'g-4', tone: 'ok', text: '✓ server bundle 890 kB (gzip 244 kB)'},
  {id: 'g-5', tone: 'ok', text: '✓ 0 type errors, 0 lint errors'},
  {
    id: 'g-6',
    tone: 'dim',
    text: 'Done in 41.3s — full log written to build.log',
  },
];

const ERROR_DETAIL_TEXT = [
  'PreToolUse hook "guard-fs" blocked this call before execution.',
  '  command : rm -rf .cache/build',
  '  reason  : recursive delete outside the workspace sandbox',
  '  policy  : hooks/guard-fs.json · rule 4 (deny rm -rf outside $WORKSPACE)',
  '  exit    : — (command was never executed)',
].join('\n');

interface SubAgentResult {
  id: string;
  name: string;
  finding: string;
  node: string;
  duration: string;
  status: 'success' | 'error';
}

const SUB_AGENTS: SubAgentResult[] = [
  {
    id: 'sa-1',
    name: 'security-review',
    finding: 'no blocking findings',
    node: 'laptop',
    duration: '2m 04s',
    status: 'success',
  },
  {
    id: 'sa-2',
    name: 'perf-audit',
    finding: 'bundle budget check crashed',
    node: 'sandbox',
    duration: '1m 12s',
    status: 'error',
  },
];

// ============= SHARED SHELL =============

type ShellStatus = 'success' | 'error' | 'running';

interface HookTag {
  kind: 'block' | 'rewrite';
  name: string;
}

function ShellStatusIcon({status}: {status: ShellStatus}) {
  if (status === 'running') {
    return <Spinner size="sm" aria-label="Tool running" />;
  }
  if (status === 'error') {
    return <Icon icon={XIcon} size="sm" color="error" />;
  }
  return <Icon icon={CheckIcon} size="sm" color="success" />;
}

function NodeChip({node}: {node: string}) {
  return (
    <span style={styles.nodeChip}>
      <Icon icon={LaptopIcon} size="sm" color="secondary" />
      <Text type="code" size="sm" color="secondary">
        {node}
      </Text>
    </span>
  );
}

function HookPill({hook}: {hook: HookTag}) {
  if (hook.kind === 'block') {
    return (
      <span style={{...styles.hookPill, ...styles.hookPillBlock}}>
        <span style={styles.hookShieldRing}>
          <Icon icon={ShieldIcon} size="sm" color="warning" />
        </span>
        <Text type="supporting" size="sm">
          block · {hook.name}
        </Text>
      </span>
    );
  }
  return (
    <span style={{...styles.hookPill, ...styles.hookPillRewrite}}>
      <Icon icon={ReplaceIcon} size="sm" color="accent" />
      <Text type="supporting" size="sm">
        rewrite · {hook.name}
      </Text>
    </span>
  );
}

/**
 * Shared wrapper row carried by every renderer: tool icon, summary, node
 * chip, optional hook pill, duration, status icon.
 */
function ShellHeaderRow({
  icon,
  summary,
  node,
  duration,
  status,
  hook,
  isCompact,
}: {
  icon: typeof TerminalIcon;
  summary: string;
  node: string;
  duration: string;
  status: ShellStatus;
  hook?: HookTag;
  isCompact: boolean;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <Icon icon={icon} size="sm" color="secondary" />
      <StackItem size="fill" style={styles.shellSummary}>
        <Text type="code" size="sm" maxLines={1}>
          {summary}
        </Text>
      </StackItem>
      {hook != null && <HookPill hook={hook} />}
      <NodeChip node={node} />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {isCompact ? duration : `Ran in ${duration}`}
      </Text>
      <ShellStatusIcon status={status} />
    </HStack>
  );
}

// ============= RENDERERS =============

function TerminalBlock({lines}: {lines: TermLine[]}) {
  return (
    <div style={styles.terminal}>
      {lines.map(line => (
        <div
          key={line.id}
          style={{...styles.terminalLine, color: TERM_TONE_COLOR[line.tone]}}>
          {line.text.length > 0 ? line.text : ' '}
        </div>
      ))}
    </div>
  );
}

/** (a) bash — terminal block, truncated, with a full-output Dialog. */
function BashRenderer({isCompact}: {isCompact: boolean}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <Card padding={3}>
      <Collapsible
        // Auto-expanded: a hook fired on this call (hook rule).
        defaultIsOpen
        trigger={
          <ShellHeaderRow
            icon={TerminalIcon}
            summary="bash · pnpm test --filter api"
            node="laptop"
            duration="8.4s"
            status="success"
            hook={{kind: 'rewrite', name: 'scope-tests'}}
            isCompact={isCompact}
          />
        }>
        <VStack gap={2} style={styles.shellCardBody}>
          <div style={styles.hookNote}>
            <Text type="supporting" size="sm" color="secondary">
              PreToolUse hook “scope-tests” rewrote this command:{' '}
              <Text type="code" size="sm" display="inline">
                pnpm test → pnpm test --filter api
              </Text>
            </Text>
          </div>
          <TerminalBlock
            lines={[
              ...BASH_PREVIEW_LINES,
              {id: 'b-more', tone: 'dim', text: '… 32 more lines'},
            ]}
          />
          <HStack gap={2}>
            <Button
              label="View full output"
              variant="ghost"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            />
          </HStack>
        </VStack>
      </Collapsible>
      <Dialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        purpose="info"
        width="min(760px, 94vw)"
        maxHeight="80vh">
        <Layout
          header={
            <DialogHeader
              title="bash — full output"
              subtitle="pnpm test --filter api · laptop · exit 1 · 8.4s"
              onOpenChange={setIsDialogOpen}
            />
          }
          content={
            <LayoutContent padding={0}>
              <div style={styles.dialogBody}>
                <TerminalBlock lines={BASH_FULL_LINES} />
              </div>
            </LayoutContent>
          }
        />
      </Dialog>
    </Card>
  );
}

/** (b) edit — diff-stat header + unified diff body. */
function EditRenderer({isCompact}: {isCompact: boolean}) {
  return (
    <Card padding={3}>
      <VStack gap={2}>
        <ShellHeaderRow
          icon={SquarePenIcon}
          summary="Edit api/routes.ts"
          node="laptop"
          duration="1.5s"
          status="success"
          isCompact={isCompact}
        />
        <HStack gap={2} vAlign="center">
          <Text
            type="code"
            size="sm"
            hasTabularNumbers
            style={styles.addStat}>
            +12
          </Text>
          <Text
            type="code"
            size="sm"
            hasTabularNumbers
            style={styles.delStat}>
            −3
          </Text>
          <Text type="supporting" size="sm" color="secondary">
            1 hunk · coupon validation guards
          </Text>
        </HStack>
        <div style={styles.diffBlock}>
          {EDIT_DIFF_ROWS.map(row => {
            const rowTint =
              row.kind === 'add'
                ? styles.diffRowAdd
                : row.kind === 'del'
                  ? styles.diffRowDel
                  : row.kind === 'hunk'
                    ? styles.diffRowHunk
                    : undefined;
            const gutterTint =
              row.kind === 'add'
                ? styles.diffGutterAdd
                : row.kind === 'del'
                  ? styles.diffGutterDel
                  : undefined;
            const glyph =
              row.kind === 'add' ? '+' : row.kind === 'del' ? '−' : ' ';
            return (
              <div key={row.id} style={{...styles.diffRow, ...rowTint}}>
                <span style={{...styles.diffGutter, ...gutterTint}}>
                  {row.kind === 'hunk' ? '' : glyph}
                </span>
                <span
                  style={
                    row.kind === 'hunk' ? styles.diffHunkText : styles.diffText
                  }>
                  {row.text}
                </span>
              </div>
            );
          })}
        </div>
      </VStack>
    </Card>
  );
}

/** (c) image generation — shimmer placeholder next to the finished state. */
function ImageRenderer({isCompact}: {isCompact: boolean}) {
  const size = isCompact ? 160 : 200;
  const squareSize = {width: size, height: size};
  return (
    <HStack gap={3} style={styles.imageRow}>
      <Card padding={3}>
        <VStack gap={2}>
          <ShellHeaderRow
            icon={ImageIcon}
            summary="image · promo banner (in progress)"
            node="sandbox"
            duration="12s"
            status="running"
            isCompact={isCompact}
          />
          <div
            style={{
              ...styles.imageSquare,
              ...styles.imageGenerating,
              ...squareSize,
            }}>
            <div style={styles.imageShimmer} aria-hidden />
            <div style={styles.imageGeneratingCenter}>
              <Spinner size="sm" aria-label="Generating image" />
            </div>
          </div>
          <Text type="supporting" size="sm" color="secondary">
            Generating image…
          </Text>
        </VStack>
      </Card>
      <Card padding={3}>
        <VStack gap={2}>
          <ShellHeaderRow
            icon={ImageIcon}
            summary="image · promo banner v1"
            node="sandbox"
            duration="18.2s"
            status="success"
            isCompact={isCompact}
          />
          <div
            style={{
              ...styles.imageSquare,
              ...styles.imageFinished,
              ...squareSize,
            }}
            role="img"
            aria-label="Generated promo banner: abstract violet-to-teal gradient"
          />
          <Text type="supporting" size="sm" color="secondary">
            promo-banner-v1.png · 1024×1024
          </Text>
        </VStack>
      </Card>
    </HStack>
  );
}

/** (d) browser — schematic screenshot with a highlighted rectangle. */
function BrowserRenderer({isCompact}: {isCompact: boolean}) {
  return (
    <Card padding={3}>
      <VStack gap={2}>
        <ShellHeaderRow
          icon={GlobeIcon}
          summary="Chrome navigate — app.example.com/checkout"
          node="laptop"
          duration="3.1s"
          status="success"
          isCompact={isCompact}
        />
        <div style={styles.browserFrame}>
          <div style={styles.browserBar}>
            <HStack gap={2} vAlign="center">
              <span
                style={{...styles.trafficDot, backgroundColor: TERM.red}}
                aria-hidden
              />
              <span
                style={{
                  ...styles.trafficDot,
                  backgroundColor: '#d29922',
                }}
                aria-hidden
              />
              <span
                style={{...styles.trafficDot, backgroundColor: TERM.green}}
                aria-hidden
              />
              <StackItem size="fill" style={styles.urlPill}>
                <Text type="code" size="sm" color="secondary" maxLines={1}>
                  https://app.example.com/checkout
                </Text>
              </StackItem>
            </HStack>
          </div>
          <div style={styles.browserPage}>
            <VStack gap={3}>
              <div style={{...styles.mockBar, width: '38%'}} />
              <div style={{...styles.mockBar, width: '72%'}} />
              <HStack gap={2}>
                <div style={styles.mockTile} />
                <div style={styles.mockTile} />
                <div style={styles.mockTile} />
              </HStack>
              <div style={styles.highlightRect}>
                <span style={styles.highlightLabel}>
                  <Text type="supporting" size="sm" color="accent">
                    banner slot · verified
                  </Text>
                </span>
                <VStack gap={2}>
                  <div style={{...styles.mockBar, width: '54%'}} />
                  <div style={{...styles.mockBar, width: '30%'}} />
                </VStack>
              </div>
              <div style={{...styles.mockBar, width: '64%'}} />
              <div style={{...styles.mockBar, width: '46%'}} />
            </VStack>
          </div>
        </div>
        <Text type="supporting" size="sm" color="secondary">
          Screenshot after navigation — the new promo banner renders in the
          highlighted region.
        </Text>
      </VStack>
    </Card>
  );
}

/** (e) background process pill — expands to a mono log. */
function BackgroundProcessPill({isCompact}: {isCompact: boolean}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={styles.pillRow}>
      <Collapsible
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        trigger={
          <HStack gap={2} vAlign="center">
            <Icon icon={CirclePlayIcon} size="sm" color="secondary" />
            <StackItem size="fill" style={styles.shellSummary}>
              <Text type="supporting" size="sm" maxLines={1}>
                Background process succeeded · Command:{' '}
                <Text type="code" size="sm" display="inline">
                  pnpm build
                </Text>{' '}
                · Log:{' '}
                <Text type="code" size="sm" display="inline">
                  build.log
                </Text>
              </Text>
            </StackItem>
            <NodeChip node="laptop" />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {isCompact ? '41.3s' : 'Ran in 41.3s'}
            </Text>
            <ShellStatusIcon status="success" />
          </HStack>
        }>
        <div style={styles.pillBody}>
          <TerminalBlock lines={BACKGROUND_LOG_LINES} />
        </div>
      </Collapsible>
    </div>
  );
}

/** (f) sub-agent result pills under a group header. */
function SubAgentResultRow({
  result,
  isCompact,
}: {
  result: SubAgentResult;
  isCompact: boolean;
}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.pillRow}>
      <Icon icon={BotIcon} size="sm" color="secondary" />
      <ShellStatusIcon status={result.status} />
      <StackItem size="fill" style={styles.shellSummary}>
        <Text type="supporting" size="sm" maxLines={1}>
          <Text type="code" size="sm" display="inline">
            {result.name}
          </Text>{' '}
          — {result.finding}
        </Text>
      </StackItem>
      <NodeChip node={result.node} />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {isCompact ? result.duration : `Ran in ${result.duration}`}
      </Text>
      <Button label="Open" variant="ghost" size="sm" onClick={() => {}} />
    </HStack>
  );
}

function SubAgentGroup({isCompact}: {isCompact: boolean}) {
  return (
    <div style={styles.subAgentGroup}>
      <Collapsible
        defaultIsOpen
        trigger={
          <HStack gap={2} vAlign="center">
            <Icon icon={BotIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text type="supporting" size="sm">
                2 sub-agents — 1 completed, 1 failed
              </Text>
            </StackItem>
            <StatusDot variant="error" label="One sub-agent failed" />
          </HStack>
        }>
        <VStack gap={2} style={styles.shellCardBody}>
          {SUB_AGENTS.map(result => (
            <SubAgentResultRow
              key={result.id}
              result={result}
              isCompact={isCompact}
            />
          ))}
        </VStack>
      </Collapsible>
    </div>
  );
}

/** (g) error block — destructive-tinted collapsible with mono detail. */
function ErrorRenderer({isCompact}: {isCompact: boolean}) {
  return (
    <div style={styles.errorCard}>
      <Collapsible
        // Auto-expanded: a hook fired on this call (hook rule).
        defaultIsOpen
        trigger={
          <HStack gap={2} vAlign="center">
            <Icon icon={TriangleAlertIcon} size="sm" color="error" />
            <StackItem size="fill" style={styles.shellSummary}>
              <Text type="code" size="sm" maxLines={1}>
                bash · rm -rf .cache/build — blocked by hook
              </Text>
            </StackItem>
            <HookPill hook={{kind: 'block', name: 'guard-fs'}} />
            <NodeChip node="laptop" />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {isCompact ? '0.0s' : 'Ran in 0.0s'}
            </Text>
            <ShellStatusIcon status="error" />
          </HStack>
        }>
        <div style={styles.errorDetail}>{ERROR_DETAIL_TEXT}</div>
      </Collapsible>
    </div>
  );
}

// ============= PAGE =============

export default function AgentToolRendererGalleryTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;

  const [draft, setDraft] = useState('');
  const [sentMessages, setSentMessages] = useState<string[]>([]);

  const sendDraft = (value: string) => {
    const text = value.trim();
    if (text.length === 0) {
      return;
    }
    setSentMessages(prev => [...prev, text]);
    setDraft('');
  };

  const composer = (
    <div style={styles.composerArea}>
      <div style={styles.composerCard}>
        <VStack gap={2}>
          <TextArea
            label={`Message ${ASSISTANT_NAME}`}
            isLabelHidden
            rows={2}
            placeholder={`Message ${ASSISTANT_NAME}…`}
            value={draft}
            onChange={setDraft}
          />
          <HStack gap={2} vAlign="center">
            <IconButton
              label="Attach file"
              tooltip="Attach file"
              icon={<Icon icon={PaperclipIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              style={isCompact ? styles.iconTapTarget : undefined}
              onClick={() => {}}
            />
            <Text type="supporting" color="secondary">
              Each tool result renders with its own specialized card
            </Text>
            <StackItem size="fill" />
            <IconButton
              label="Send message"
              tooltip="Send"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              size="sm"
              style={isCompact ? styles.iconTapTarget : undefined}
              onClick={() => sendDraft(draft)}
            />
          </HStack>
        </VStack>
      </div>
    </div>
  );

  return (
    <div ref={wrapRef} style={styles.measureWrap}>
      <style>{KEYFRAMES_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>{SESSION_TITLE}</Heading>
                  <StatusDot variant="success" label="Agent idle" />
                  {!isCompact && (
                    <Text type="supporting" color="secondary">
                      model: atlas-swe-2
                    </Text>
                  )}
                </HStack>
              </StackItem>
              {!isCompact && <NodeChip node="laptop" />}
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.chatColumn}>
              <ChatLayout composer={composer}>
                <ChatMessageList density="balanced">
                  <ChatSystemMessage variant="divider">
                    Thursday, July 9
                  </ChatSystemMessage>
                  <ChatSystemMessage>
                    {ASSISTANT_NAME} renders each tool result with a
                    specialized card — terminal, diff, image, browser,
                    background process, sub-agents, and errors.
                  </ChatSystemMessage>

                  {/* User: kick off the fix. */}
                  <ChatMessage sender="user">
                    <ChatMessageBubble
                      metadata={
                        <ChatMessageMetadata
                          timestamp={
                            <Timestamp
                              value="2026-07-09T10:12:00"
                              format="time"
                            />
                          }
                        />
                      }>
                      Support says expired coupons are 500ing at checkout.
                      Reproduce it, fix the route, and verify the flow end to
                      end.
                    </ChatMessageBubble>
                  </ChatMessage>

                  {/* (a) bash renderer. */}
                  <ChatMessage
                    sender="assistant"
                    avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                    <ChatMessageBubble name={ASSISTANT_NAME}>
                      Reproduced it — one API test fails exactly the way
                      support describes: the coupon route throws instead of
                      rejecting the expired code. A pre-tool hook scoped the
                      test run to the api package.
                    </ChatMessageBubble>
                    <VStack gap={2} style={styles.rendererStack}>
                      <BashRenderer isCompact={isCompact} />
                    </VStack>
                    <ChatMessageMetadata
                      timestamp={
                        <Timestamp value="2026-07-09T10:13:40" format="time" />
                      }
                    />
                  </ChatMessage>

                  {/* (b) edit renderer. */}
                  <ChatMessage
                    sender="assistant"
                    avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                    <ChatMessageBubble name={ASSISTANT_NAME}>
                      The route treated a missing or expired coupon as an
                      internal error. I replaced the catch-all with explicit
                      404 / 422 guards and added apply metrics.
                    </ChatMessageBubble>
                    <VStack gap={2} style={styles.rendererStack}>
                      <EditRenderer isCompact={isCompact} />
                    </VStack>
                    <ChatMessageMetadata
                      timestamp={
                        <Timestamp value="2026-07-09T10:16:05" format="time" />
                      }
                    />
                  </ChatMessage>

                  {/* User: banner + verification. */}
                  <ChatMessage sender="user">
                    <ChatMessageBubble
                      metadata={
                        <ChatMessageMetadata
                          timestamp={
                            <Timestamp
                              value="2026-07-09T10:18:30"
                              format="time"
                            />
                          }
                        />
                      }>
                      Nice. Marketing also wants the “coupon fixed” promo
                      banner in that slot — generate the art and check the
                      page renders it.
                    </ChatMessageBubble>
                  </ChatMessage>

                  {/* (c) image renderer. */}
                  <ChatMessage
                    sender="assistant"
                    avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                    <ChatMessageBubble name={ASSISTANT_NAME}>
                      Generating the banner art now — a second variation is
                      still rendering while the first is ready for review.
                    </ChatMessageBubble>
                    <VStack gap={2} style={styles.rendererStack}>
                      <ImageRenderer isCompact={isCompact} />
                    </VStack>
                    <ChatMessageMetadata
                      timestamp={
                        <Timestamp value="2026-07-09T10:20:15" format="time" />
                      }
                    />
                  </ChatMessage>

                  {/* (d) browser renderer. */}
                  <ChatMessage
                    sender="assistant"
                    avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                    <ChatMessageBubble name={ASSISTANT_NAME}>
                      Drove the checkout page in the browser: the expired
                      coupon now returns a clean 422 message and the new
                      banner renders in its slot.
                    </ChatMessageBubble>
                    <VStack gap={2} style={styles.rendererStack}>
                      <BrowserRenderer isCompact={isCompact} />
                    </VStack>
                    <ChatMessageMetadata
                      timestamp={
                        <Timestamp value="2026-07-09T10:24:50" format="time" />
                      }
                    />
                  </ChatMessage>

                  {/* (e) background process + (f) sub-agents. */}
                  <ChatMessage
                    sender="assistant"
                    avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                    <ChatMessageBubble name={ASSISTANT_NAME}>
                      Kicked the production build to the background and fanned
                      out review sub-agents while it ran. Security is clean;
                      the perf audit crashed and needs a rerun.
                    </ChatMessageBubble>
                    <VStack gap={2} style={styles.rendererStack}>
                      <BackgroundProcessPill isCompact={isCompact} />
                      <SubAgentGroup isCompact={isCompact} />
                    </VStack>
                    <ChatMessageMetadata
                      timestamp={
                        <Timestamp value="2026-07-09T10:31:20" format="time" />
                      }
                    />
                  </ChatMessage>

                  {/* (g) error renderer. */}
                  <ChatMessage
                    sender="assistant"
                    avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                    <ChatMessageBubble name={ASSISTANT_NAME}>
                      One cleanup step was stopped by a guardrail hook before
                      it ran — details below. Nothing was deleted; everything
                      else is green and ready for review.
                    </ChatMessageBubble>
                    <VStack gap={2} style={styles.rendererStack}>
                      <ErrorRenderer isCompact={isCompact} />
                    </VStack>
                    <ChatMessageMetadata
                      timestamp={
                        <Timestamp value="2026-07-09T10:32:05" format="time" />
                      }
                    />
                  </ChatMessage>

                  {/* Messages sent from the composer. */}
                  {sentMessages.map((text, index) => (
                    <ChatMessage key={`sent-${index}`} sender="user">
                      <ChatMessageBubble>{text}</ChatMessageBubble>
                    </ChatMessage>
                  ))}
                </ChatMessageList>
              </ChatLayout>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
