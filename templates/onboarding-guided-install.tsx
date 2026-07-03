// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (chosen platform, install/run shell
 *   commands with a fixed referral slug, fixed node ids/hostnames, static
 *   checklist rows and skip-warning copy — no clocks, no randomness)
 * @output Connect-your-machine onboarding for a CLI agent node: a centered
 *   max-w-lg wizard Card with a numbered-circle step header (Choose
 *   platform ✓, Install CLI ✓, Start node — active, Connected) joined by
 *   hairline connectors that turn green once passed; the active step
 *   carries a platform recap (Token + SelectableCard pair), copy-command
 *   blocks with Copy→green-check feedback (install command starts in the
 *   copied state), a live status strip that flips from Spinner "Waiting
 *   for connection…" to a green "Connected as devvm1234.prn0" row, and two
 *   troubleshooting Collapsibles; below, a completion-checklist Card mixes
 *   done and skipped rows and ends in the amber skip-warning Banner
 * @position Page template; emitted by `astryx template onboarding-guided-install`
 *
 * Frame: Layout height="fill". A slim LayoutHeader carries the product
 * chrome (wordmark tile, setup title, signed-in identity). LayoutContent
 * scrolls and hosts a Center-ed single column (maxWidth 512) stacking the
 * wizard Card, a Divider, and the checklist Card. Unlike form-wizard,
 * steps here gate on *external device events* (copy command → wait →
 * verify), so the wizard renders commands and a live status strip rather
 * than form inputs.
 *
 * Responsive contract:
 * - Column: maxWidth 512, centered, full-width with 16px gutters below
 *   640px (the gutters are constant — only the max width ever binds).
 * - Step circles stay 20px at every width; below 480px the indicator
 *   drops out of the card header onto its own full-width row so the
 *   heading never squeezes beside it (Tooltips still name each step).
 * - Copy-command blocks wrap with break-all so long proxy exports never
 *   force horizontal scroll.
 * - Below 480px the sm wizard controls (copy IconButtons, Check now,
 *   footer Back/Continue) grow to 40px hit targets; glyphs and labels
 *   stay "sm" so the card reads the same, just with more padding.
 * - Platform SelectableCards sit side by side above 480px and stack
 *   vertically below it.
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
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {Code} from '@astryxdesign/core/Code';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import type {IconName, IconType} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
// Check/copy/warning/back glyphs come from the Icon name registry instead.
import {
  LaptopIcon,
  MessagesSquareIcon,
  ServerIcon,
  TerminalIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Single centered column: full width with constant 16px gutters; the
  // 512px max width is the only thing that ever binds.
  column: {
    width: '100%',
    maxWidth: 512,
    paddingInline: 16,
    paddingBlock: 'var(--spacing-6)',
  },
  // Product wordmark tile in the page header and wizard card header.
  brandTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  // 20px numbered step circles — fixed size at every breakpoint.
  stepCircle: {
    width: 20,
    height: 20,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  stepCircleDone: {
    border: 'var(--border-width) solid var(--color-success)',
    backgroundColor: 'var(--color-success)',
    color: 'var(--color-on-success)',
  },
  stepCircleActive: {
    border: 'var(--border-width) solid var(--color-accent)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  // Hairline connector between circles; turns green once passed.
  stepConnector: {
    width: 16,
    height: 1,
    flexShrink: 0,
    backgroundColor: 'var(--color-border)',
  },
  stepConnectorDone: {
    backgroundColor: 'var(--color-success)',
  },
  // Active-step body keeps a stable minimum height so the card does not
  // jump when the status strip flips waiting → connected.
  stepBody: {
    minHeight: 320,
  },
  // Copy-command block: bordered muted box; the command wraps break-all.
  commandBox: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  commandCode: {
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
  },
  commandCell: {
    minWidth: 0,
  },
  // Live status strip: waiting (neutral border) vs connected (green).
  statusStrip: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  statusStripConnected: {
    border: 'var(--border-width) solid var(--color-border-green)',
    backgroundColor: 'var(--color-background-green)',
  },
  troubleshootingBody: {
    paddingBlock: 'var(--spacing-1)',
  },
  platformCards: {
    width: '100%',
  },
  // <=480px: grow the sm wizard controls to 40px hit targets (the 28px
  // "sm" box is fine for pointers but too small for thumbs); icon glyphs
  // and labels stay "sm" so the card reads the same.
  iconTapTarget: {width: 40, height: 40},
  buttonTapTarget: {height: 40},
};

// ============= DATA =============
// Deterministic fixtures: fixed ids, hostnames, and shell commands.

type PlatformId = 'mac' | 'devvm';

interface Platform {
  id: PlatformId;
  name: string;
  caption: string;
  icon: IconType;
}

const PLATFORMS: Platform[] = [
  {
    id: 'mac',
    name: 'Mac / Laptop',
    caption: 'Direct internet',
    icon: LaptopIcon,
  },
  {
    id: 'devvm',
    name: 'DevVM / Server',
    caption: 'Needs proxy',
    icon: ServerIcon,
  },
];

const INSTALL_URL = 'https://navi.example.com/install/ref_9d2k1';
const PROXY_EXPORTS =
  'export https_proxy=http://fwdproxy:8080 http_proxy=http://fwdproxy:8080';

// DevVMs sit behind fwdproxy, so the install command prepends the proxy
// exports; laptops with direct internet get the bare curl | sh.
const INSTALL_COMMAND: Record<PlatformId, string> = {
  mac: `curl -fsSL ${INSTALL_URL} | sh`,
  devvm: `${PROXY_EXPORTS} && curl -fsSL ${INSTALL_URL} | sh`,
};

const RUN_COMMAND = 'export PATH="$HOME/.navi/bin:$PATH" && navi-node';

const CONNECTED_NODE = 'devvm1234.prn0';

type StepState = 'done' | 'active' | 'upcoming';

const STEP_LABELS = [
  'Choose platform',
  'Install CLI',
  'Start node',
  'Connected',
];

interface TroubleshootingEntry {
  id: string;
  title: string;
  defaultIsOpen: boolean;
  body: ReactNode;
}

const TROUBLESHOOTING: TroubleshootingEntry[] = [
  {
    id: 'ts-not-found',
    title: '"command not found" after install',
    defaultIsOpen: true,
    body: (
      <Text type="supporting" color="secondary">
        The installer adds <Code>navi-node</Code> to future shells. Run{' '}
        <Code>source ~/.zshrc</Code> or open a new terminal.
      </Text>
    ),
  },
  {
    id: 'ts-disconnects',
    title: 'Node starts but disconnects',
    defaultIsOpen: false,
    body: (
      <Text type="supporting" color="secondary">
        A node launched over SSH exits with your session. Start it inside{' '}
        <Code>tmux</Code> or <Code>screen</Code> so it keeps running after
        you disconnect.
      </Text>
    ),
  },
];

type ChecklistState = 'done' | 'skipped';

interface ChecklistRow {
  id: string;
  label: string;
  detail: string;
  state: ChecklistState;
  icon: IconType | IconName;
}

const CHECKLIST: ChecklistRow[] = [
  {
    id: 'cl-web',
    label: 'Web UI',
    detail: 'ready',
    state: 'done',
    icon: 'externalLink',
  },
  {
    id: 'cl-cli',
    label: 'CLI nodes',
    detail: '2 connected',
    state: 'done',
    icon: TerminalIcon,
  },
  {
    id: 'cl-chat',
    label: 'Google Chat',
    detail: 'skipped',
    state: 'skipped',
    icon: MessagesSquareIcon,
  },
];

const CONNECTED_NODES = [
  {id: 'node_8f3a', hostname: 'dpetersen-mbp'},
  {id: 'node_2c1d', hostname: 'devvm1234.prn0'},
];

const SKIP_WARNING =
  'Navi works without a CLI node, but many features (code search, ' +
  'builds, diffs) require one. You can connect later from Settings.';

// ============= STEP INDICATOR =============

function stepCircleStyle(state: StepState): CSSProperties {
  if (state === 'done') {
    return {...styles.stepCircle, ...styles.stepCircleDone};
  }
  if (state === 'active') {
    return {...styles.stepCircle, ...styles.stepCircleActive};
  }
  return styles.stepCircle;
}

/**
 * Four 20px numbered circles joined by hairline connectors. Passed steps
 * show a green Check and turn their trailing connector green; the active
 * step is the accent-filled number and carries its text label. Tooltips
 * keep every circle named.
 */
function StepIndicator({states}: {states: StepState[]}) {
  return (
    <HStack gap={1} vAlign="center">
      {states.map((state, index) => {
        const label = STEP_LABELS[index];
        return (
          <HStack gap={1} vAlign="center" key={label}>
            <Tooltip content={`Step ${index + 1}: ${label}`}>
              <div style={stepCircleStyle(state)} aria-label={label}>
                {state === 'done' ? (
                  <Icon icon="check" size="xsm" color="inherit" />
                ) : (
                  <Text type="supporting" size="sm" color="inherit">
                    {index + 1}
                  </Text>
                )}
              </div>
            </Tooltip>
            {state === 'active' && (
              <Text type="supporting" size="sm">
                {label}
              </Text>
            )}
            {index < states.length - 1 && (
              <div
                style={
                  state === 'done'
                    ? {...styles.stepConnector, ...styles.stepConnectorDone}
                    : styles.stepConnector
                }
                aria-hidden
              />
            )}
          </HStack>
        );
      })}
    </HStack>
  );
}

// ============= COPY COMMAND =============

/**
 * Copy-command block: label row, then a bordered muted box where the
 * command wraps with break-all and the copy IconButton flips to a green
 * Check with a "Copied" confirmation once used.
 */
function CopyCommandBlock({
  title,
  command,
  isCopied,
  isNarrow,
  onCopy,
}: {
  title: string;
  command: string;
  isCopied: boolean;
  isNarrow: boolean;
  onCopy: () => void;
}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label" size="sm" color="secondary">
            {title}
          </Text>
        </StackItem>
        {isCopied && (
          <HStack gap={1} vAlign="center">
            <Icon icon="check" size="sm" color="success" />
            <Text type="supporting" size="sm" color="secondary">
              Copied
            </Text>
          </HStack>
        )}
      </HStack>
      <HStack gap={2} vAlign="center" style={styles.commandBox}>
        <StackItem size="fill" style={styles.commandCell}>
          <Code style={styles.commandCode}>{command}</Code>
        </StackItem>
        <IconButton
          label={isCopied ? `Copied: ${title}` : `Copy: ${title}`}
          tooltip={isCopied ? 'Copied' : 'Copy command'}
          icon={
            isCopied ? (
              <Icon icon="check" size="sm" color="success" />
            ) : (
              <Icon icon="copy" size="sm" color="inherit" />
            )
          }
          variant="ghost"
          size="sm"
          style={isNarrow ? styles.iconTapTarget : undefined}
          onClick={onCopy}
        />
      </HStack>
    </VStack>
  );
}

// ============= PLATFORM CARD =============

/**
 * One platform choice: icon + name + caption inside a SelectableCard.
 * Rendered side by side above 480px and stacked vertically below it.
 */
function PlatformCard({
  entry,
  isSelected,
  onSelect,
}: {
  entry: Platform;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <SelectableCard
      label={`${entry.name} — ${entry.caption}`}
      isSelected={isSelected}
      onChange={onSelect}
      padding={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={entry.icon} size="sm" color="secondary" />
        <VStack gap={0}>
          <Text type="body" size="sm" weight="medium">
            {entry.name}
          </Text>
          <Text type="supporting" color="secondary">
            {entry.caption}
          </Text>
        </VStack>
      </HStack>
    </SelectableCard>
  );
}

// ============= PAGE =============

export default function OnboardingGuidedInstallTemplate() {
  const [platform, setPlatform] = useState<PlatformId>('devvm');
  // The install command was already copied in this session (fixture);
  // the run command flips to the copied state on click.
  const [copied, setCopied] = useState<ReadonlySet<string>>(
    () => new Set(['install']),
  );
  const [isConnected, setIsConnected] = useState(false);

  // Below 480px the platform cards stack vertically, the step indicator
  // drops onto its own row (circles stay 20px everywhere), and the sm
  // wizard controls grow to 40px hit targets.
  const isNarrow = useMediaQuery('(max-width: 480px)');
  const stackPlatformCards = isNarrow;

  const markCopied = (id: string) => {
    setCopied(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const chosenPlatform =
    PLATFORMS.find(entry => entry.id === platform) ?? PLATFORMS[1];

  // Steps 1-2 are behind us; step 3 flips to done (and step 4 lights up)
  // the moment the node checks in.
  const stepStates: StepState[] = isConnected
    ? ['done', 'done', 'done', 'done']
    : ['done', 'done', 'active', 'upcoming'];

  const statusStrip = isConnected ? (
    <HStack
      gap={2}
      vAlign="center"
      style={{...styles.statusStrip, ...styles.statusStripConnected}}>
      <Icon icon="check" size="sm" color="success" />
      <StackItem size="fill">
        <Text type="body" size="sm">
          Connected as <Code>{CONNECTED_NODE}</Code>
        </Text>
      </StackItem>
      <StatusDot variant="success" label="Node online" />
    </HStack>
  ) : (
    <HStack gap={2} vAlign="center" style={styles.statusStrip}>
      <Spinner size="sm" aria-label="Waiting for connection" />
      <StackItem size="fill">
        <Text type="body" size="sm" color="secondary">
          Waiting for connection…
        </Text>
      </StackItem>
      <Button
        label="Check now"
        variant="ghost"
        size="sm"
        style={isNarrow ? styles.buttonTapTarget : undefined}
        onClick={() => setIsConnected(true)}
      />
    </HStack>
  );

  const doneCount = CHECKLIST.filter(row => row.state === 'done').length;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <div style={styles.brandTile}>
              <Icon icon={TerminalIcon} size="sm" color="inherit" />
            </div>
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Navi setup</Heading>
                <Badge
                  label={isConnected ? 'Step 4 of 4' : 'Step 3 of 4'}
                  variant={isConnected ? 'success' : 'neutral'}
                />
              </HStack>
            </StackItem>
            <Text type="supporting" color="secondary">
              dpetersen
            </Text>
            <Button label="Exit setup" variant="ghost" size="sm" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <Center axis="horizontal">
            <VStack gap={4} style={styles.column}>
              {/* ===== Wizard card ===== */}
              <Card padding={5}>
                <VStack gap={4}>
                  {/* Header: icon tile + title left, step circles right.
                      Below 480px the indicator drops onto its own row so
                      the heading keeps its full width instead of
                      squeezing beside ~152px of circles. */}
                  <VStack gap={2}>
                    <HStack gap={3} vAlign="center">
                      <div style={styles.brandTile}>
                        <Icon icon={ServerIcon} size="sm" color="inherit" />
                      </div>
                      <StackItem size="fill">
                        <VStack gap={0}>
                          <Heading level={2}>Connect a Machine</Heading>
                          <Text type="supporting" color="secondary">
                            Run the agent where your code lives
                          </Text>
                        </VStack>
                      </StackItem>
                      {!isNarrow && <StepIndicator states={stepStates} />}
                    </HStack>
                    {isNarrow && <StepIndicator states={stepStates} />}
                  </VStack>

                  <Divider />

                  {/* Active step body — stable min height. */}
                  <VStack gap={4} style={styles.stepBody}>
                    {/* Platform recap: chosen Token + the SelectableCard
                        pair; switching platforms rewrites the install
                        command (proxy exports on DevVM only). */}
                    <VStack gap={2}>
                      <HStack gap={2} vAlign="center">
                        <StackItem size="fill">
                          <Text type="label" size="sm" color="secondary">
                            Platform
                          </Text>
                        </StackItem>
                        <Token
                          label={chosenPlatform.name}
                          size="sm"
                          color="green"
                        />
                      </HStack>
                      {stackPlatformCards ? (
                        <VStack gap={2} style={styles.platformCards}>
                          {PLATFORMS.map(entry => (
                            <PlatformCard
                              key={entry.id}
                              entry={entry}
                              isSelected={platform === entry.id}
                              onSelect={() => setPlatform(entry.id)}
                            />
                          ))}
                        </VStack>
                      ) : (
                        <HStack gap={2} style={styles.platformCards}>
                          {PLATFORMS.map(entry => (
                            <StackItem size="fill" key={entry.id}>
                              <PlatformCard
                                entry={entry}
                                isSelected={platform === entry.id}
                                onSelect={() => setPlatform(entry.id)}
                              />
                            </StackItem>
                          ))}
                        </HStack>
                      )}
                    </VStack>

                    {/* Copy commands: install already copied (fixture),
                        run command flips on click. */}
                    <CopyCommandBlock
                      title="1. Install the CLI"
                      command={INSTALL_COMMAND[platform]}
                      isCopied={copied.has('install')}
                      isNarrow={isNarrow}
                      onCopy={() => markCopied('install')}
                    />
                    <CopyCommandBlock
                      title="2. Start the node"
                      command={RUN_COMMAND}
                      isCopied={copied.has('run')}
                      isNarrow={isNarrow}
                      onCopy={() => markCopied('run')}
                    />

                    {/* Live status strip: Spinner while waiting, green
                        confirmation row once the node checks in. */}
                    {statusStrip}

                    <Divider />

                    {/* Troubleshooting accordions. */}
                    <VStack gap={2}>
                      {TROUBLESHOOTING.map(entry => (
                        <Collapsible
                          key={entry.id}
                          defaultIsOpen={entry.defaultIsOpen}
                          trigger={
                            <HStack gap={2} vAlign="center">
                              <Icon icon="warning" size="sm" color="warning" />
                              <Text type="body" size="sm" weight="medium">
                                {entry.title}
                              </Text>
                            </HStack>
                          }>
                          <div style={styles.troubleshootingBody}>
                            {entry.body}
                          </div>
                        </Collapsible>
                      ))}
                    </VStack>
                  </VStack>

                  <Divider />

                  {/* Footer: muted Back link left; Continue gates on the
                      node connecting. */}
                  <HStack gap={2} vAlign="center">
                    <Button
                      label="Back"
                      variant="ghost"
                      size="sm"
                      style={isNarrow ? styles.buttonTapTarget : undefined}
                      icon={<Icon icon="chevronLeft" size="sm" />}
                    />
                    <StackItem size="fill" />
                    <Button
                      label={isConnected ? 'Continue' : 'Waiting for node…'}
                      size="sm"
                      style={isNarrow ? styles.buttonTapTarget : undefined}
                      isDisabled={!isConnected}
                      tooltip={
                        isConnected
                          ? undefined
                          : 'Enabled once your node connects'
                      }
                    />
                  </HStack>
                </VStack>
              </Card>

              <Divider />

              {/* ===== Completion checklist card ===== */}
              <Card padding={5}>
                <VStack gap={3}>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <Heading level={2}>Setup checklist</Heading>
                    </StackItem>
                    <Badge
                      label={`${doneCount} of ${CHECKLIST.length} done`}
                      variant="success"
                    />
                  </HStack>

                  <VStack gap={0}>
                    {CHECKLIST.map((row, index) => (
                      <VStack gap={0} key={row.id}>
                        {index > 0 && <Divider />}
                        <VStack gap={0}>
                          <HStack
                            gap={2}
                            vAlign="center"
                            style={{paddingBlock: 'var(--spacing-2)'}}>
                            {row.state === 'done' ? (
                              <Icon icon="check" size="sm" color="success" />
                            ) : (
                              <Icon icon="stop" size="sm" color="disabled" />
                            )}
                            <Icon
                              icon={row.icon}
                              size="sm"
                              color={
                                row.state === 'done'
                                  ? 'secondary'
                                  : 'disabled'
                              }
                            />
                            <StackItem size="fill">
                              <Text
                                type="body"
                                size="sm"
                                color={
                                  row.state === 'done'
                                    ? 'primary'
                                    : 'secondary'
                                }>
                                {row.label}
                              </Text>
                            </StackItem>
                            <Token
                              label={row.detail}
                              size="sm"
                              color={row.state === 'done' ? 'green' : 'gray'}
                            />
                            {row.state === 'skipped' && (
                              <Button
                                label="Connect"
                                variant="ghost"
                                size="sm"
                              />
                            )}
                          </HStack>
                          {/* CLI nodes row expands into per-node detail. */}
                          {row.id === 'cl-cli' && (
                            <Collapsible
                              trigger={
                                <Text type="supporting" color="secondary">
                                  Show connected nodes
                                </Text>
                              }>
                              <VStack gap={1} style={styles.troubleshootingBody}>
                                {CONNECTED_NODES.map(node => (
                                  <HStack
                                    gap={2}
                                    vAlign="center"
                                    key={node.id}>
                                    <StatusDot
                                      variant="success"
                                      label={`${node.hostname} online`}
                                    />
                                    <Code>{node.id}</Code>
                                    <StackItem size="fill">
                                      <Text
                                        type="supporting"
                                        color="secondary">
                                        {node.hostname}
                                      </Text>
                                    </StackItem>
                                  </HStack>
                                ))}
                              </VStack>
                            </Collapsible>
                          )}
                        </VStack>
                      </VStack>
                    ))}
                  </VStack>

                  {/* Amber skip warning — the cost of the skipped row. */}
                  <Banner
                    status="warning"
                    title="Skipped steps limit some features"
                    description={SKIP_WARNING}
                    endContent={
                      <Button label="Open Settings" variant="ghost" size="sm" />
                    }
                  />
                </VStack>
              </Card>
            </VStack>
          </Center>
        </LayoutContent>
      }
    />
  );
}
