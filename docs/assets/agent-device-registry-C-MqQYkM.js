var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (paired client records with fixed
 *   pairing dates and TTL captions, execution-node records with status /
 *   version / last-seen strings, one session lock, a pairing install
 *   command with a fixed code)
 * @output Personal "Devices & Nodes" settings surface for an AI agent
 *   product: a PAIRED CLIENTS section (CLI / Glasses / Voice rows with
 *   icon tiles, TTL captions — one expiring row in warning tone — and
 *   Revoke buttons gated by a confirm AlertDialog); an ACTIVE NODES
 *   section (mono node names, online/provisioned StatusDots, version and
 *   last-seen metadata, an amber lock glyph with a "Locked by session"
 *   Tooltip, and a warning lock Banner with a Clear action); and a
 *   CONNECT section (copyable install command CodeBlock, a "Waiting for
 *   a node to connect…" Spinner row, and a green just-connected row
 *   specimen), closed by a stale-lock TTL footnote
 * @position Page template; emitted by \`astryx template agent-device-registry\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the page title and a
 * paired/online tally; LayoutContent scrolls a single centered settings
 * column (maxWidth 720). No side panels — this is a focused settings
 * archetype, not a dashboard.
 *
 * Responsive contract:
 * - Single centered column, maxWidth 720; the column, not the viewport,
 *   is the layout unit, so no media queries or ResizeObserver are needed.
 * - Row metadata (type · paired date · TTL, version · last seen) lives in
 *   the caption line under each row title, so narrow widths never crush
 *   trailing columns; only the status cluster stays right-aligned.
 * - Buttons and the lock glyph keep intrinsic width (flexShrink 0) so row
 *   titles truncate first via maxLines={1}.
 */

import {useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {
  CheckIcon,
  GlassesIcon,
  GlobeIcon,
  InfoIcon,
  LockIcon,
  MicIcon,
  MonitorIcon,
  TerminalIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Single settings column; LayoutContent owns scrolling.
  column: {
    maxWidth: 720,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-6)',
  },
  // 11px uppercase tracking-wide section eyebrow (source-product density).
  eyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  rowTitleCell: {minWidth: 0},
  // 36px icon tile in front of each device / node row.
  iconTile: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-element)',
  },
  row: {paddingBlock: 'var(--spacing-2)'},
  // Expiring-TTL caption segment: warning tone, slightly emphasized.
  ttlWarning: {
    color: 'var(--color-warning)',
    fontWeight: 500,
  },
  // Amber lock glyph is focusable so its Tooltip works from the keyboard.
  lockGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    borderRadius: 'var(--radius-element)',
  },
  statusCluster: {flexShrink: 0},
  // Green just-connected specimen row in the CONNECT section.
  connectedRow: {
    backgroundColor: 'var(--color-success-muted)',
    border: 'var(--border-width) solid var(--color-border-green)',
    borderRadius: 'var(--radius-element)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  connectedLabel: {color: 'var(--color-text-green)'},
  footerNote: {paddingBottom: 'var(--spacing-2)'},
};

// ============= DATA =============
// Deterministic fixtures: fixed dates and TTL strings, no clocks, no
// randomness, invented product ("Fern") and node names throughout.

const PRODUCT_NAME = 'Fern';

type ClientKind = 'cli' | 'glasses' | 'voice';

interface PairedClient {
  id: string;
  kind: ClientKind;
  name: string;
  pairedOn: string; // display string derived from a fixed 2026-07 date
  ttl: string;
  isExpiring: boolean;
}

const CLIENT_ICON: Record<ClientKind, typeof TerminalIcon> = {
  cli: TerminalIcon,
  glasses: GlassesIcon,
  voice: MicIcon,
};

const CLIENT_KIND_LABEL: Record<ClientKind, string> = {
  cli: 'CLI',
  glasses: 'Glasses',
  voice: 'Voice',
};

const INITIAL_PAIRED_CLIENTS: PairedClient[] = [
  {
    id: 'pc-1',
    kind: 'cli',
    name: 'mac-studio',
    pairedOn: 'Jul 8',
    ttl: '29 days left',
    isExpiring: false,
  },
  {
    id: 'pc-2',
    kind: 'cli',
    name: 'work-laptop',
    pairedOn: 'Jun 30',
    ttl: '21 days left',
    isExpiring: false,
  },
  {
    id: 'pc-3',
    kind: 'glasses',
    name: 'Lumen Frames',
    pairedOn: 'Jul 2',
    ttl: '23 days left',
    isExpiring: false,
  },
  {
    id: 'pc-4',
    kind: 'voice',
    name: 'Kitchen Speaker',
    pairedOn: 'Jun 14',
    ttl: '3h left',
    isExpiring: true,
  },
  {
    id: 'pc-5',
    kind: 'voice',
    name: 'Commute Buds',
    pairedOn: 'Jul 11',
    ttl: '30 days left',
    isExpiring: false,
  },
];

type NodeKind = 'cli' | 'browser' | 'computer';
type NodeStatus = 'online' | 'provisioned';

interface ExecutionNode {
  id: string;
  kind: NodeKind;
  name: string;
  version: string;
  lastSeen: string;
  status: NodeStatus;
  isLocked: boolean;
}

const NODE_ICON: Record<NodeKind, typeof TerminalIcon> = {
  cli: TerminalIcon,
  browser: GlobeIcon,
  computer: MonitorIcon,
};

// Green = online, blue (accent) = provisioned-but-not-yet-claimed.
const NODE_STATUS: Record<
  NodeStatus,
  {variant: 'success' | 'accent'; label: string}
> = {
  online: {variant: 'success', label: 'Online'},
  provisioned: {variant: 'accent', label: 'Provisioned'},
};

const LOCKED_NODE_NAME = 'cli:mac-studio';
const LOCKING_SESSION = 'perf-triage';

const NODES: ExecutionNode[] = [
  {
    id: 'nd-1',
    kind: 'cli',
    name: 'cli:mac-studio',
    version: 'v0.9.4',
    lastSeen: 'Seen 2m ago',
    status: 'online',
    isLocked: true,
  },
  {
    id: 'nd-2',
    kind: 'browser',
    name: 'browser:chrome-work',
    version: 'v0.9.4',
    lastSeen: 'Seen 8m ago',
    status: 'online',
    isLocked: false,
  },
  {
    id: 'nd-3',
    kind: 'computer',
    name: 'computer:devbox-04',
    version: 'v0.9.2',
    lastSeen: 'Warming up · 40s',
    status: 'provisioned',
    isLocked: false,
  },
  {
    id: 'nd-4',
    kind: 'cli',
    name: 'cli:home-desktop',
    version: 'v0.8.9',
    lastSeen: 'Seen 1h ago',
    status: 'online',
    isLocked: false,
  },
];

const INSTALL_COMMAND =
  'curl -fsSL https://nodes.fern.dev/install.sh | sh -s -- --pair FRN-9F2K-83QD';

// ============= ROWS =============

function PairedClientRow({
  client,
  onRevoke,
}: {
  client: PairedClient;
  onRevoke: (id: string) => void;
}) {
  return (
    <HStack gap={3} vAlign="center" style={styles.row}>
      <div style={styles.iconTile}>
        <Icon icon={CLIENT_ICON[client.kind]} size="sm" color="secondary" />
      </div>
      <StackItem size="fill" style={styles.rowTitleCell}>
        <VStack gap={1}>
          <Text type="label" maxLines={1}>
            {client.name}
          </Text>
          <Text type="supporting" color="secondary">
            {CLIENT_KIND_LABEL[client.kind]} · Paired {client.pairedOn} ·{' '}
            {client.isExpiring ? (
              <span style={styles.ttlWarning}>{client.ttl}</span>
            ) : (
              client.ttl
            )}
          </Text>
        </VStack>
      </StackItem>
      {client.isExpiring && (
        <StatusDot variant="warning" label="Pairing expiring soon" />
      )}
      <Button
        label="Revoke"
        variant="ghost"
        size="sm"
        onClick={() => onRevoke(client.id)}
      />
    </HStack>
  );
}

function NodeRow({node, isLockActive}: {node: ExecutionNode; isLockActive: boolean}) {
  const status = NODE_STATUS[node.status];
  return (
    <HStack gap={3} vAlign="center" style={styles.row}>
      <div style={styles.iconTile}>
        <Icon icon={NODE_ICON[node.kind]} size="sm" color="secondary" />
      </div>
      <StackItem size="fill" style={styles.rowTitleCell}>
        <VStack gap={1}>
          <Text type="code" size="sm" maxLines={1}>
            {node.name}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {node.version} · {node.lastSeen}
          </Text>
        </VStack>
      </StackItem>
      {node.isLocked && isLockActive && (
        <Tooltip content={\`Locked by session: \${LOCKING_SESSION}\`}>
          <span
            style={styles.lockGlyph}
            role="img"
            aria-label={\`Locked by session: \${LOCKING_SESSION}\`}
            tabIndex={0}>
            <Icon icon={LockIcon} size="sm" color="warning" />
          </span>
        </Tooltip>
      )}
      <HStack gap={2} vAlign="center" style={styles.statusCluster}>
        <StatusDot
          variant={status.variant}
          label={status.label}
          isPulsing={node.status === 'provisioned'}
        />
        <Text type="supporting" color="secondary">
          {status.label}
        </Text>
      </HStack>
    </HStack>
  );
}

// ============= SECTION HEADER =============

function SectionHeader({title, caption}: {title: string; caption: string}) {
  return (
    <HStack gap={2} vAlign="center">
      <StackItem size="fill">
        <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
          {title}
        </Text>
      </StackItem>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {caption}
      </Text>
    </HStack>
  );
}

// ============= PAGE =============

export default function AgentDeviceRegistryTemplate() {
  const [pairedClients, setPairedClients] = useState(INITIAL_PAIRED_CLIENTS);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
  const [isLockActive, setIsLockActive] = useState(true);
  const [hasCopiedCommand, setHasCopiedCommand] = useState(false);

  const pendingRevoke = pairedClients.find(
    client => client.id === pendingRevokeId,
  );

  const confirmRevoke = () => {
    setPairedClients(prev =>
      prev.filter(client => client.id !== pendingRevokeId),
    );
    setPendingRevokeId(null);
  };

  const onlineCount = NODES.filter(node => node.status === 'online').length;
  const provisionedCount = NODES.length - onlineCount;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <VStack gap={1}>
                <Heading level={1}>Devices &amp; Nodes</Heading>
                <Text type="supporting" color="secondary">
                  Clients paired to your {PRODUCT_NAME} account and the nodes
                  your agents can run on
                </Text>
              </VStack>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {pairedClients.length} paired · {onlineCount} online
            </Text>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={6}>
              {/* ============= PAIRED CLIENTS ============= */}
              <VStack gap={2}>
                <SectionHeader
                  title="Paired clients"
                  caption={\`\${pairedClients.length} paired\`}
                />
                <Card padding={3}>
                  <VStack gap={0}>
                    {pairedClients.map((client, index) => (
                      <VStack key={client.id} gap={0}>
                        <PairedClientRow
                          client={client}
                          onRevoke={setPendingRevokeId}
                        />
                        {index < pairedClients.length - 1 && <Divider />}
                      </VStack>
                    ))}
                  </VStack>
                </Card>
                <Text type="supporting" color="secondary">
                  Pairings renew each time a client checks in; expiring
                  clients must re-pair with a fresh code.
                </Text>
              </VStack>

              {/* ============= ACTIVE NODES ============= */}
              <VStack gap={2}>
                <SectionHeader
                  title="Active nodes"
                  caption={\`\${onlineCount} online · \${provisionedCount} provisioned\`}
                />
                {isLockActive && (
                  <Banner
                    status="warning"
                    title={\`Locked: \${LOCKED_NODE_NAME}\`}
                    description={\`Session "\${LOCKING_SESSION}" is routing all tool calls to this node until the lock clears.\`}
                    endContent={
                      <Button
                        label="Clear"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsLockActive(false)}
                      />
                    }
                  />
                )}
                <Card padding={3}>
                  <VStack gap={0}>
                    {NODES.map((node, index) => (
                      <VStack key={node.id} gap={0}>
                        <NodeRow node={node} isLockActive={isLockActive} />
                        {index < NODES.length - 1 && <Divider />}
                      </VStack>
                    ))}
                  </VStack>
                </Card>
              </VStack>

              {/* ============= CONNECT ============= */}
              <VStack gap={2}>
                <SectionHeader title="Connect" caption="Pairing code active" />
                <Card padding={3}>
                  <VStack gap={3}>
                    <VStack gap={1}>
                      <Text type="label">Connect a node</Text>
                      <Text type="supporting" color="secondary">
                        Run this on any machine you want your agents to reach.
                        The pairing code expires in 9 minutes.
                      </Text>
                    </VStack>
                    <CodeBlock
                      code={INSTALL_COMMAND}
                      language="bash"
                      size="sm"
                      width="100%"
                      hasCopyButton
                      onCopy={() => setHasCopiedCommand(true)}
                    />
                    {hasCopiedCommand && (
                      <Text type="supporting" color="secondary">
                        Command copied to clipboard
                      </Text>
                    )}
                    <Divider />
                    <HStack gap={2} vAlign="center">
                      <Spinner size="sm" aria-label="Waiting for a node to connect" />
                      <StackItem size="fill">
                        <Text type="supporting" color="secondary">
                          Waiting for a node to connect…
                        </Text>
                      </StackItem>
                      <Text type="supporting" color="secondary" hasTabularNumbers>
                        Checking every 5s
                      </Text>
                    </HStack>
                    {/* Just-connected specimen row */}
                    <HStack gap={2} vAlign="center" style={styles.connectedRow}>
                      <Icon icon={CheckIcon} size="sm" color="success" />
                      <StackItem size="fill" style={styles.rowTitleCell}>
                        <Text type="code" size="sm" maxLines={1}>
                          cli:new-laptop
                        </Text>
                      </StackItem>
                      <Text type="supporting" style={styles.connectedLabel}>
                        Connected · just now
                      </Text>
                    </HStack>
                  </VStack>
                </Card>
              </VStack>

              {/* ============= FOOTER NOTE ============= */}
              <HStack gap={2} vAlign="center" style={styles.footerNote}>
                <Icon icon={InfoIcon} size="sm" color="secondary" />
                <Text type="supporting" color="secondary">
                  Node locks are held per session. Stale locks clear after 20
                  minutes.
                </Text>
              </HStack>
            </VStack>
          </div>

          {/* Revoke confirmation */}
          <AlertDialog
            isOpen={pendingRevoke != null}
            onOpenChange={isOpen => {
              if (!isOpen) {
                setPendingRevokeId(null);
              }
            }}
            title={\`Revoke \${pendingRevoke?.name ?? 'this client'}?\`}
            description={\`The \${
              pendingRevoke != null
                ? CLIENT_KIND_LABEL[pendingRevoke.kind]
                : 'paired'
            } client will be signed out immediately and must re-pair with a new code.\`}
            actionLabel="Revoke"
            onAction={confirmRevoke}
          />
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};